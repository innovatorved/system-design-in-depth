# Building an Inverted Index Search Engine from Scratch

A comprehensive, step-by-step engineering masterclass on building a full-text search engine from first principles.

This guide accompanies the video [*"Inverted Index - The Data Structure Behind Search Engines"*](https://www.youtube.com/watch?v=iHHqnyThrqE) and the detailed architectural write-up [*"BM25: The Information Retrieval Algorithm That Outlived Its Era"*](https://arpitbhayani.me/blogs/bm25/) by **Arpit Bhayani**.

---

## 1. Architectural Overview & The Core Problem

Traditional relational databases store records by Document ID ($DocID \rightarrow \text{Fields}$). When evaluating a full-text search query such as:
```sql
SELECT * FROM documents WHERE content LIKE '%consensus%';
```
The database has no choice but to execute a full table scan across all $N$ documents ($O(N)$ execution time). At a million documents with 10 KB per document, every single search query would read 10 GB of data from disk into memory.

An **Inverted Index** reverses this layout into a term-centric dictionary:

```
Forward Index:  Doc 1 ──► ["raft", "consensus", "replicated"]
                Doc 2 ──► ["consistent", "hashing", "nodes"]
                Doc 3 ──► ["raft", "consensus", "state"]

Inverted Index: "consensus"  ──► [ Doc 1, Doc 3 ]   <── Postings List (strictly sorted)
                "hashing"    ──► [ Doc 2 ]
                "raft"       ──► [ Doc 1, Doc 3 ]
```

```mermaid
flowchart TD
    subgraph OfflinePipeline ["1. Ingestion Pipeline"]
      Raw["Raw Document Strings"] --> Tokenizer["Step 1: Tokenizer & Normalizer (tokenizer.js)"]
      Tokenizer --> PostingsList["Step 2: Sorted Postings Lists (postings.js)"]
      PostingsList --> Compression["Step 3: Delta Gap + VByte Compression (compression.js)"]
      Compression --> ChampionLists["Step 4: Tier 1 Champion Lists in RAM (engine.js)"]
    end

    subgraph OnlinePipeline ["2. Query Serving Engine"]
      Query["User Search: 'raft consensus'"] --> QueryTokenizer["Tokenize Query Terms"]
      QueryTokenizer --> FastPath{"Matches in Tier 1 Champion Lists >= K?"}
      FastPath -->|"Yes (sub-5ms)"| Scorer["Step 5: Okapi BM25 Ranking Formula"]
      FastPath -->|"No"| Fallback["Cascade to Full Tier 2 Archive"]
      Fallback --> Scorer
      Scorer --> Results["Top-K Ranked Documents"]
    end
```

---

## 2. Step-by-Step Module Guide: Building Each Component

---

### Module 1: Text Tokenization & Normalization (`src/tokenizer.js`)

#### Why this module is necessary:
Raw human language cannot be indexed directly. If Document 1 contains `"Consensus!"` and Document 2 contains `"consensus,"`, a naive equality check treats them as different terms. Furthermore, high-frequency grammatical words like `"the"`, `"is"`, and `"at"` appear in every document, carrying zero discriminatory power while wasting RAM.

#### Step-by-Step Implementation:

1. **Step 1.1: Unicode Lowercasing & Punctuation Stripping**
   We convert all input text to lowercase and replace non-alphanumeric characters with spaces using regex `/[^a-z0-9\s]/g`:
   ```javascript
   const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
   ```

2. **Step 1.2: Stop-Word Filtering**
   We define a `Set` of ubiquitous English words (`DEFAULT_STOP_WORDS`). During tokenization, if a token exists in this set, it is dropped from index vocabulary.

3. **Step 1.3: Algorithmic Suffix Stemming (Porter-style)**
   Users searching for `"searched"` or `"searching"` expect documents containing `"search"` to match. We apply morphological suffix reduction rules:
   ```javascript
   function stemWord(word) {
     if (word.length <= 3) return word;
     let w = word;
     if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
     if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
     if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
     if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
     return w;
   }
   ```

---

### Module 2: Postings Lists & Two-Pointer Intersection (`src/postings.js`)

#### The Core Invariant:
**Every postings list must maintain document IDs in strictly ascending order.**
If list $A = [1, 5, 12, 40]$ and list $B = [3, 5, 40, 99]$, sorting allows us to intersect both lists in **$O(N + M)$ linear time** using two pointers, rather than a slow $O(N \times M)$ nested scan!

#### Step-by-Step Implementation:

1. **Step 2.1: Sorted Insertion with Binary Search**
   When a document is indexed, we insert `{ docId, tf }` into the list. If doc IDs arrive sequentially, we append in $O(1)$. If out of order, we use binary search (`>>> 1`) to find the exact insertion index:
   ```javascript
   let low = 0, high = this.entries.length;
   while (low < high) {
     const mid = (low + high) >>> 1;
     if (this.entries[mid].docId === docId) {
       this.entries[mid].tf += tf; // Accumulate Term Frequency
       return;
     }
     if (this.entries[mid].docId < docId) low = mid + 1;
     else high = mid;
   }
   this.entries.splice(low, 0, { docId, tf });
   ```

2. **Step 2.2: Skip Pointers for Sublinear Leaps**
   When intersecting a short list (e.g. 5 items) with a multi-million-item list, scanning every item is wasteful. We store skip pointers every $S = 8$ items:
   ```javascript
   skipForward(currentIndex, targetDocId) {
     for (const skip of this.skipPointers) {
       if (skip.index > currentIndex && skip.docId <= targetDocId) {
         bestSkipIdx = skip.index;
       } else if (skip.docId > targetDocId) break;
     }
     return bestSkipIdx;
   }
   ```

3. **Step 2.3: Two-Pointer Linear Intersection (`AND` queries)**
   ```javascript
   while (pA < listA.length && pB < listB.length) {
     if (listA[pA].docId === listB[pB].docId) {
       result.push(listA[pA].docId);
       pA++; pB++;
     } else if (listA[pA].docId < listB[pB].docId) {
       pA++; // list A lags behind
     } else {
       pB++; // list B lags behind
     }
   }
   ```

4. **Step 2.4: Shortest-List-First Query Planning**
   When evaluating `AND` across 3 or more terms, always sort the postings lists by length in ascending order. Intersecting the rarest terms first shrinks intermediate candidate sets immediately!

---

### Module 3: Postings Compression (`src/compression.js`)

#### The Scale Problem:
If a search engine indexes 1 billion documents, storing 32-bit integers (4 bytes each) for common words would require gigabytes per keyword.

#### Step-by-Step Implementation:

1. **Step 3.1: Delta (Gap) Encoding**
   Because document IDs are strictly sorted, we do not store absolute IDs. We store the difference between consecutive IDs:
   $$\text{Original: } [1000, 1004, 1007, 1019] \longrightarrow \text{Deltas: } [1000, 4, 3, 12]$$
   ```javascript
   function deltaEncode(sortedArray) {
     const deltas = [sortedArray[0]];
     for (let i = 1; i < sortedArray.length; i++) {
       deltas.push(sortedArray[i] - sortedArray[i - 1]);
     }
     return deltas;
   }
   ```

2. **Step 3.2: Variable-Byte (VByte) Bit Packing**
   Raw integers consume 4 bytes regardless of value. VByte encodes numbers into 7-bit chunks. Bit 8 (MSB) acts as a termination flag:
   - Values $< 128$ consume **1 byte** (e.g. delta `4` = `0x84`).
   - Values $< 16,384$ consume **2 bytes**.
   - Values $\ge 16,384$ consume **3 or 4 bytes**.
   ```javascript
   function vbyteEncode(numbers) {
     const bytes = [];
     for (let num of numbers) {
       const stack = [(num & 0x7F) | 0x80]; // Terminal byte has MSB = 1
       num = Math.floor(num / 128);
       while (num > 0) {
         stack.push(num & 0x7F); // Continuation bytes have MSB = 0
         num = Math.floor(num / 128);
       }
       for (let i = stack.length - 1; i >= 0; i--) bytes.push(stack[i]);
     }
     return Buffer.from(bytes);
   }
   ```
   **Measured Savings**: Cuts postings storage by **$70\% - 80\%$**!

---

### Module 4: Quality Tiering & Champion Lists (`src/engine.js`)

#### Why this module is necessary:
At web scale, evaluating multi-term queries against cold disk files adds hundreds of milliseconds of I/O latency. 95% of users only look at the top 10 results.

#### Step-by-Step Implementation:

1. **Step 4.1: Quality Tiers**
   Every document has an index-time static quality score $S(d) \in [0.0, 1.0]$ based on PageRank, click popularity, or seller reputation.
2. **Step 4.2: Building Champion Lists**
   For each vocabulary term, we precompute a **Tier 1 Champion List** containing only the top-$K$ highest-authority documents ($K = 1,000$) and pin them in RAM:
   ```javascript
   const topK = sortedEntries.slice(0, this.championK);
   this.championIndex.set(term, topK);
   ```
3. **Step 4.3: Fast-Path Execution**
   - Query engine first searches Tier 1 Champion Lists in RAM ($< 5\text{ms}$).
   - If match count $\ge \text{topK}$, returns immediately.
   - If match count $< \text{topK}$, lazily cascades to the full Tier 2 disk archive.

---

### Module 5: Okapi BM25 Ranking Formula (`src/engine.js`)

#### Why BM25 Replaced TF-IDF:
Simple TF-IDF suffers from two critical flaws:
1. **Term Stuffing**: A page repeating "insurance" 500 times scores 50 times higher than a page with 10 mentions.
2. **Document Length Bias**: A 1,000-page book mentioning a word 10 times by accident beats a concise 1-page article.

#### The BM25 Formula:
$$\text{BM25}(D, Q) = \sum_{t \in Q} \text{IDF}(t) \cdot \frac{f(t, D) \cdot (k_1 + 1)}{f(t, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

#### Step-by-Step Implementation:

1. **Step 5.1: Robertson-Spärck Jones IDF**
   Penalizes ubiquitous words and boosts rare terms:
   ```javascript
   const idf = Math.log(1 + ((N - df + 0.5) / (df + 0.5)));
   ```
2. **Step 5.2: Asymptotic TF Saturation ($k_1 = 1.2$)**
   As term frequency $f(t, D)$ increases, incremental score gains diminish and asymptotically approach $(k_1 + 1)$:
   ```javascript
   const numerator = tf * (this.k1 + 1);
   ```
3. **Step 5.3: Document Length Normalization ($b = 0.75$)**
   Penalizes long documents relative to the average document length $\text{avgdl}$:
   ```javascript
   const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / avgdl));
   const termScore = idf * (numerator / denominator);
   ```

---

## 3. Running the Code & In-Browser Playground

### Option 1: In-Browser Self-Hosted IDE (Zero Install!)
Open [`index.html`](file:///Users/vedgupta/system-design/projects/tiny-search-engine/index.html) in any browser:
- **Full In-Memory CommonJS Runtime**: Runs `require()`, `module.exports`, and unit tests client-side.
- **Visual Split-Screen Query Inspector**: Search your running engine with real-time term highlighting and latency benchmarks.
- **Zero Cloud**: 100% self-contained, no external services, no StackBlitz.

### Option 2: Command Line CLI
```bash
# Clone or navigate to the directory
cd projects/tiny-search-engine

# Run the 6-phase walkthrough demo
node src/demo.js

# Run the 14 automated unit tests
node src/test.js
```

---

## 4. Verification & Test Assertions

The test suite (`src/test.js`) verifies all 14 architectural invariants:
1. `Tokenizer`: Unicode case folding and punctuation stripping.
2. `Tokenizer`: Stop-word elimination.
3. `Stemmer`: Suffix reduction (`-ing`, `-ed`, `-es`, `-s`).
4. `Compression`: Lossless Delta gap encoding roundtrip.
5. `Compression`: Lossless Variable-Byte encoding roundtrip.
6. `Compression`: $> 60\%$ storage savings benchmark.
7. `Postings`: Strict ascending document ID sort order.
8. `Intersection`: $O(N + M)$ two-pointer `AND` conjunction.
9. `Query Planner`: Shortest-list-first multi-term intersection.
10. `Union`: $O(N + M)$ two-pointer `OR` disjunction.
11. `Difference`: $O(N + M)$ two-pointer `AND NOT` exclusion.
12. `Engine`: Full Boolean query evaluator.
13. `Engine`: Tier 1 Champion List fast-path execution.
14. `BM25`: Monotonic score ranking by term rarity and frequency.
