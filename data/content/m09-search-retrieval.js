window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-search-retrieval"] = {
  "information-retrieval-system-design": {
    "title": "Information retrieval system design",
    "video": {
      "youtubeId": "TByRaraQqW4",
      "title": "How Search Really Works",
      "channel": "ByteByteGo",
      "why": "Walks the full crawl, index, retrieve and rank pipeline end to end with clean animations, exactly the two-plane architecture this unit introduces.",
      "length": "9:18"
    },
    "videos": [
      {
        "youtubeId": "kNkCfaH2rxc",
        "title": "7 1 Introduction to Information Retrieval 9 16",
        "channel": "From Languages to Information",
        "role": "intro",
        "why": "Chris Manning (Stanford) frames what IR is, how it differs from database lookup, and the vocabulary used in the rest of the module.",
        "length": "9:16"
      },
      {
        "youtubeId": "IQuSuyUVkoE",
        "title": "Challenges in Building Large-Scale Information Retrieval Systems - Jeff Dean (WSDM Conference, 2009)",
        "channel": "Habeeb Shopeju",
        "role": "case-study",
        "why": "Jeff Dean recounts ten years of Google search serving evolution: index sharding, in-memory indexes, encoding choices and latency budgets.",
        "length": "1:05:01"
      }
    ],
    "intuition": "<p>Think of a library. A database is the librarian who fetches the exact book when you give its call number. A search engine is the librarian who hears <em>\"something about keeping servers in agreement\"</em> and hands you the five best books on consensus, ranked. To do that fast, the library did heavy work in advance: it read every book, built a card catalog from words to books, and noted which books are popular.</p>\n<p><strong>Mental model:</strong> an IR system is two machines sharing one data structure. The <em>indexing plane</em> spends CPU ahead of time turning documents into an inverted index; the <em>serving plane</em> spends milliseconds walking that index, scoring a small candidate set, and returning the top K.</p>\n<ul>\n<li><strong>Trap:</strong> proposing <code>LIKE '%term%'</code> or a B-tree on a text column. That is a full scan and has no notion of relevance.</li>\n<li><strong>Trap:</strong> forgetting that the query must go through the <em>same analyzer</em> (lowercasing, stemming) as the documents, or \"Running\" will never match \"run\".</li>\n<li><strong>Trap:</strong> treating the search index as the source of truth. It is a derived, eventually consistent view that must be rebuildable from the primary store.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Search Engine Architecture</h2>\n      <p>Traditional relational databases optimize for exact-match point lookups and transactional ACID guarantees using B-Trees. An Information Retrieval (IR) system (such as Apache Lucene, Elasticsearch, and Google Search) is engineered for full-text search, unstructured natural language understanding, fuzzy matching, and multi-factor relevance ranking across billions of documents.</p>\n\n      <h2>Dual-Plane IR Pipeline: Indexing vs Query Serving</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph IngestPipeline [\"1. Offline / Streaming Ingest Pipeline\"]\n      Docs[\"Raw Documents (HTML, JSON, DB Records)\"] --> Tokenizer[\"Tokenization & Normalization\"]\n      Tokenizer --> Stemmer[\"Linguistic Stemming (Porter / Snowball)\"]\n      Stemmer --> TermDict[\"Term Dictionary & Inverted Index Construction\"]\n      TermDict --> Segment[\"Flush Immutable Lucene Segments to Disk\"]\n    end\n\n    subgraph QueryPipeline [\"2. Online Query Serving Pipeline\"]\n      UserQuery[\"User Search: 'distributed cache redis'\"] --> QP[\"Query Parser & Analyzer\"]\n      QP --> TermLookup[\"Term Dictionary Inverted Index Seek\"]\n      TermLookup --> Intersect[\"Postings List Intersection (Skip Pointers / Roaring)\"]\n      Intersect --> Ranker[\"Relevance Scoring (BM25 + Learning-to-Rank)\"]\n      Ranker --> TopK[\"Return Top 20 Results with Highlights & Facets\"]\n    end\n      </div>\n\n      <h2>Under the Hood: The Indexing Anatomy</h2>\n      <ul>\n        <li><strong>Character Filters:</strong> Strip HTML markup, decode entities (e.g. <code>&amp;amp;</code> -> <code>&amp;</code>), and map custom regex patterns.</li>\n        <li><strong>Tokenizer:</strong> Breaks continuous text streams into discrete linguistic tokens based on word boundaries, punctuation, and Unicode script rules.</li>\n        <li><strong>Token Filters:</strong> Lowercases tokens, removes stop words (optional), expands synonyms, and applies stemming algorithms (reducing \"running\", \"runs\", \"ran\" to the common root \"run\").</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: a 200 ms search latency budget</h2>\n<p>Suppose an e-commerce site indexes 200 million products and promises p99 search latency of 200 ms at the edge. A realistic budget looks like this:</p>\n<table><thead><tr><th>Stage</th><th>Budget</th><th>What happens</th></tr></thead><tbody>\n<tr><td>Network and TLS to the edge</td><td>40 ms</td><td>Client to nearest region</td></tr>\n<tr><td>Query parsing and understanding</td><td>10 ms</td><td>Analyzer, spell check, entity tagging</td></tr>\n<tr><td>Candidate retrieval</td><td>40 ms</td><td>Scatter to shards, postings intersection, BM25, local top 1,000</td></tr>\n<tr><td>Re-ranking</td><td>50 ms</td><td>ML model scores roughly 1,000 candidates using hundreds of features</td></tr>\n<tr><td>Fetch and highlight</td><td>20 ms</td><td>Load stored fields for the final 20 hits</td></tr>\n<tr><td>Headroom</td><td>40 ms</td><td>GC pauses, retries, slow shards</td></tr>\n</tbody></table>\n<p>The key design insight is the <strong>funnel</strong>: cheap scoring on millions of postings, expensive scoring on only a thousand candidates, and full document fetch for only the final page.</p>\n<h2>Search engine vs relational database</h2>\n<table><thead><tr><th>Concern</th><th>Relational DB</th><th>Search engine such as Lucene</th></tr></thead><tbody>\n<tr><td>Core structure</td><td>B-tree on keys</td><td>Inverted index of term to sorted doc IDs</td></tr>\n<tr><td>Answer type</td><td>Exact set of matching rows</td><td>Ranked list, usually top K</td></tr>\n<tr><td>Writes</td><td>In-place, transactional</td><td>Buffered into immutable segments, visible after refresh</td></tr>\n<tr><td>Consistency</td><td>Read-your-writes</td><td>Near-real-time, typically about 1 s behind</td></tr>\n<tr><td>Best at</td><td>Joins, constraints, updates</td><td>Full text, fuzzy match, facets, relevance</td></tr>\n</tbody></table>\n<h2>Failure modes to plan for</h2>\n<ul>\n<li><strong>Analyzer drift:</strong> changing a tokenizer or synonym list without reindexing makes old and new documents disagree about what a term is.</li>\n<li><strong>Hot queries:</strong> a small set of head queries dominates traffic; a result cache in front of the engine often absorbs a large share of load.</li>\n<li><strong>Slow shard tail:</strong> a query waits for the slowest of N shards, so p99 per shard matters more than the average.</li>\n</ul>\n<p>Real systems follow this shape: Elasticsearch and OpenSearch wrap Lucene segments with a distributed coordinator; Google described serving its index from memory across thousands of machines with a multi-level tree of root, parent and leaf servers.</p>\n</div>",
    "keyTakeaways": [
      "IR systems separate offline document indexing pipelines from online low-latency query scoring engines.",
      "Text analysis pipelines convert raw text into normalized tokens via character filters, tokenizers, and stemmers.",
      "Search engines trade off transactional ACID mutations for immutable index segments optimized for fast inverted lookups."
    ],
    "furtherReading": [
      {
        "title": "Manning, Raghavan, Schütze: Introduction to Information Retrieval (Stanford)",
        "url": "https://nlp.stanford.edu/IR-book/"
      },
      {
        "title": "Croft, Metzler & Strohman: Search Engines: Information Retrieval in Practice (free PDF, UMass CIIR)",
        "url": "https://ciir.cs.umass.edu/downloads/SEIRiP.pdf"
      },
      {
        "title": "Zobel & Moffat: Inverted Files for Text Search Engines (ACM Computing Surveys)",
        "url": "https://dl.acm.org/doi/10.1145/1132956.1132959"
      }
    ]
  },
  "inverted-index-and-posting-lists": {
    "title": "Inverted index and posting lists",
    "video": {
      "youtubeId": "iHHqnyThrqE",
      "title": "Inverted Index - The Data Structure Behind Search Engines",
      "channel": "Arpit Bhayani",
      "why": "Builds the inverted index from first principles and covers postings, intersection and compression with the depth this unit expects.",
      "length": "14:45"
    },
    "videos": [
      {
        "youtubeId": "Wf6HbY2PQDw",
        "title": "7 3 The Inverted Index 10 42",
        "channel": "From Languages to Information",
        "role": "deep-dive",
        "why": "Manning’s Stanford lecture on constructing dictionary and postings via sort-based indexing, the textbook treatment.",
        "length": "10:42"
      },
      {
        "youtubeId": "T5RmMNDR5XI",
        "title": "What is in a Lucene index? Adrien Grand, Software Engineer, Elasticsearch",
        "channel": "LuceneSolrRevolution",
        "role": "deep-dive",
        "why": "A Lucene committer walks through the actual on-disk files: terms dictionary FST, postings, doc values and stored fields.",
        "length": "1:04:30"
      }
    ],
    "intuition": "<p>Picture the index at the back of a textbook. You do not reread the whole book to find \"Paxos\"; you look up the word and get page numbers 42, 87, 301. An inverted index is exactly that, built for millions of documents: every word points to the sorted list of documents that contain it.</p>\n<p><strong>Mental model:</strong> <em>term to sorted list of doc IDs</em>. Because the lists are sorted, answering <code>A AND B</code> is a single linear merge of two lists, and because neighbouring IDs are close, the lists compress to a byte or two per entry.</p>\n<ul>\n<li><strong>Trap:</strong> forgetting that sorting is the invariant everything depends on: intersection, skip pointers and delta encoding all break on unsorted lists.</li>\n<li><strong>Trap:</strong> intersecting in query order instead of rarest term first; starting with the shortest list shrinks the work dramatically.</li>\n<li><strong>Trap:</strong> ignoring positions. Phrase queries such as \"new york\" need a positional index, not just doc IDs.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <div class=\"callout callout--note\">\n        <div class=\"callout__title\">Implementation build</div>\n        <p>A companion from-scratch implementation is available in the builds catalog: <a href=\"#build/tiny-search-engine\">Tiny Search Engine (Inverted Index, Compression & BM25)</a>.</p>\n      </div>\n\n      <h2>Under the Hood: The Inverted Index Data Structure</h2>\n      <p>Traditional relational databases organize data around documents or rows (DocID → Text content). Evaluating a full-text search query like <code>WHERE content LIKE '%consensus%'</code> forces a full table scan across millions of rows (<code>O(N)</code> execution time).</p>\n      <p>An <strong>Inverted Index</strong> reverses this relationship: every distinct vocabulary term points to a strictly sorted list of Document IDs where it appears (Term → [DocIDs]). This sorted sequence is called a <strong>Postings List</strong>.</p>\n\n      <h2>Forward Index vs Inverted Index</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph ForwardIndex [\"1. Forward Index (Document -> Words)\"]\n      D1[\"Doc 1\"] --> W1[\"'raft', 'consensus', 'replicated'\"]\n      D2[\"Doc 2\"] --> W2[\"'consistent', 'hashing', 'nodes'\"]\n      D3[\"Doc 3\"] --> W3[\"'raft', 'consensus', 'state'\"]\n    end\n\n    subgraph InvertedIndex [\"2. Inverted Index (Term -> Sorted Postings)\"]\n      T1[\"'consensus'\"] --> P1[\"[Doc 1, Doc 3]\"]\n      T2[\"'raft'\"] --> P2[\"[Doc 1, Doc 3]\"]\n      T3[\"'hashing'\"] --> P3[\"[Doc 2]\"]\n    end\n      </div>\n\n      <h2>The Document Ingestion Pipeline</h2>\n      <ol>\n        <li><strong>Tokenization & Normalization:</strong> Strips punctuation, folds Unicode cases, and splits raw continuous character streams into discrete linguistic tokens.</li>\n        <li><strong>Stop-Word Elimination:</strong> Filters out ubiquitous, low-information entropy words (such as <em>\"the\"</em>, <em>\"is\"</em>, <em>\"at\"</em>, <em>\"which\"</em>) that appear in nearly all documents.</li>\n        <li><strong>Stemming & Lemmatization:</strong> Reduces word inflections to a shared root. Algorithmic stemmers (Porter or Snowball) strip morphological suffixes (reducing <em>\"searching\"</em>, <em>\"searched\"</em>, <em>\"searches\"</em> to <code>search</code>), ensuring that variant forms match the user's intent.</li>\n      </ol>\n\n      <h2>Postings Lists & The Two-Pointer Intersection Invariant</h2>\n      <p>The single most important invariant of an inverted index is that <strong>document IDs within each postings list must be strictly sorted in ascending order</strong> (<code>[1, 4, 12, 99]</code>).</p>\n      <p>When evaluating multi-term conjunction queries (e.g. <code>distributed AND consensus</code>), the engine does not perform an <code>O(N × M)</code> nested loop. Instead, it advances two cursors concurrently across the sorted lists in <strong>linear <code>O(N + M)</code> time</strong>:</p>\n      <ul>\n        <li>If <code>DocID_A == DocID_B</code>, record a match and increment both pointers.</li>\n        <li>If <code>DocID_A &lt; DocID_B</code>, advance pointer A forward.</li>\n        <li>If <code>DocID_A > DocID_B</code>, advance pointer B forward.</li>\n      </ul>\n      <p><strong>Query Optimization:</strong> When intersecting three or more terms, the engine always sorts the postings lists by length in ascending order (rarest terms first). Intersecting the smallest list first dramatically shrinks intermediate candidate sets.</p>\n\n      <h2>Postings List Compression: Delta Gaps & Variable Byte</h2>\n      <p>At web scale, storing raw 32-bit integers for billions of document IDs would require petabytes of storage and swamp memory bandwidth. Search engines use a two-step compression pipeline:</p>\n      <ul>\n        <li><strong>Delta (Gap) Encoding:</strong> Instead of storing absolute IDs (<code>[1000, 1004, 1008, 1020]</code>), the engine stores differences between consecutive IDs (<code>[1000, 4, 4, 12]</code>). Because postings lists are sorted, all delta gaps are small positive integers.</li>\n        <li><strong>Variable-Byte (VByte) & Frame of Reference (FoR):</strong> Standard 32-bit integers require 4 bytes. VByte encodes numbers into 7 bits per byte with a 1-bit continuation flag. Values &lt; 128 consume only 1 byte, yielding an immediate <strong>75% storage reduction</strong>. Lucene packages blocks of 128 integer deltas using <strong>Frame of Reference (FoR)</strong> bit-packing.</li>\n      </ul>\n\n      <h2>Skip Lists and Champion Lists</h2>\n      <ul>\n        <li><strong>Skip Pointers:</strong> When intersecting a short postings list with a multi-million-item postings list, scanning every item is wasteful. Skip pointers allow the engine to leap forward past entire blocks of non-matching IDs in sublinear time.</li>\n        <li><strong>Champion Lists:</strong> For each term, the engine precomputes a short list of the top-<code>r</code> documents with the highest weight for that term. Queries first evaluate only these per-term champion lists and fall back to the full postings when too few candidates are found.</li>\n        <li><strong>Tiered Indexes (a different technique):</strong> The whole corpus is partitioned by a global static quality score (PageRank, sales velocity). Queries run against the high-quality Tier 1 first and cascade to lower tiers only if Tier 1 returns too few matches.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Inverted indexes reverse document storage to map terms to strictly sorted lists of document IDs called Postings Lists.",
      "Keeping postings lists sorted enables O(N + M) two-pointer linear intersection for Boolean AND queries.",
      "Delta (gap) encoding combined with Variable-Byte or Frame of Reference (FoR) compression slashes index storage by 70-80%.",
      "Champion lists keep a short per-term list of the highest-weight documents, while tiered indexes partition the corpus by static quality; both let most queries avoid scanning full postings lists."
    ],
    "furtherReading": [
      {
        "title": "Arpit Bhayani: BM25 - The Information Retrieval Algorithm That Outlived Its Era (Detailed Blog)",
        "url": "https://arpitbhayani.me/blogs/bm25/"
      },
      {
        "title": "Hello Interview: Elasticsearch Deep Dive w/ an Ex-Meta Senior Manager (YouTube)",
        "url": "https://www.youtube.com/watch?v=PuZvF2EyfBM"
      },
      {
        "title": "Manning, Raghavan & Schütze: A First Take at Building an Inverted Index (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html"
      },
      {
        "title": "Adrien Grand: Frame of Reference and Roaring Bitmaps in Lucene (Elastic Blog)",
        "url": "https://www.elastic.co/blog/frame-of-reference-and-roaring-bitmaps"
      }
    ]
  },
  "boolean-tiered-search": {
    "title": "Boolean and tiered search",
    "video": {
      "youtubeId": "TIN_02pJU-Y",
      "title": "7 5 The Boolean Retrieval Model 14 06",
      "channel": "From Languages to Information",
      "why": "Manning explains Boolean retrieval, AND/OR/NOT evaluation over postings and query optimisation by document frequency, exactly this unit’s mechanics.",
      "length": "14:06"
    },
    "videos": [
      {
        "youtubeId": "5KbynCj7yRQ",
        "title": "7 4 Query Processing with the Inverted Index 6 43",
        "channel": "From Languages to Information",
        "role": "intro",
        "why": "Short, visual walkthrough of the two-pointer merge that makes AND queries linear time.",
        "length": "6:43"
      },
      {
        "youtubeId": "XNxzXQa55jQ",
        "title": "IR Course Lecture 13: Efficient Scoring",
        "channel": "Venkatesh Vinayakarao",
        "role": "deep-dive",
        "why": "Covers tiered indexes, champion lists and static quality ordering from the Manning IR book chapter 7.",
        "length": "25:19"
      }
    ],
    "intuition": "<p>Imagine hiring. You first filter candidates with hard rules: must know Go AND must be in Europe AND NOT a current employee. That is Boolean retrieval: a yes/no gate. Then, to save interviewer time, you look at the pile of \"top university, strong referrals\" CVs first and only dig into the rest if that pile has too few matches. That is a tiered index.</p>\n<p><strong>Mental model:</strong> Boolean clauses decide <em>which documents are eligible</em>; tiers decide <em>which eligible documents you look at first</em>. Tiers are a speed optimisation, never a change to the eligibility rules.</p>\n<ul>\n<li><strong>Trap:</strong> letting a quality tier relax a MUST clause or an access-control filter. Security and correctness filters apply in every tier.</li>\n<li><strong>Trap:</strong> evaluating <code>NOT</code> by materialising the complement set. Engines instead skip excluded IDs during the merge.</li>\n<li><strong>Trap:</strong> assuming tier 1 results are the globally best. A tier-2 document with a strong textual match can outrank a tier-1 document; tiering trades a little recall for latency.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Multi-Term Boolean Evaluation</h2>\n      <p>When users search for multi-word queries (e.g. <code>\"distributed consensus raft\"</code>), the search engine parses the query into a boolean expression tree combining <code>MUST</code> (AND), <code>SHOULD</code> (OR), and <code>MUST_NOT</code> (NOT) clauses.</p>\n\n      <h2>A separate optimization: quality-tiered indexes</h2>\n      <p>Some designs use <em>tiers</em> for matching policy: complete AND matches precede broader OR matches. The optimization below is different: it partitions documents by a precomputed quality class to reduce search work. Do not use a quality tier to relax required terms or authorization filters.</p>\n      <div class=\"mermaid\">\nflowchart TD\n    UserQuery[\"Query: 'distributed consensus'\"] --> Tier1Check[\"1. Search Tier 1: High-Authority Documents (PageRank > 0.8 / In-Stock)\"]\n    Tier1Check --> CountCheck{\"Found >= K (e.g. 50) Results?\"}\n    CountCheck -->|\"Yes: Fast Path\"| Score[\"Score & Return Top Results (Latency: 5ms)\"]\n    CountCheck -->|\"No: Insufficient Matches\"| Tier2Check[\"2. Fallback to Tier 2: Low-Authority / Archive Documents\"]\n    Tier2Check --> Score\n      </div>\n\n      <h2>Under the Hood: Tiered Indexing Mechanics</h2>\n      <ul>\n        <li><strong>Quality Tiers:</strong> Rather than forcing every query to search the entire multi-billion document corpus, documents are partitioned into quality tiers based on static quality scores (PageRank, click popularity, freshness, seller reputation).</li>\n        <li><strong>Tier 1 (Hot Core):</strong> Contains top 10% highest-quality documents, stored on ultra-fast NVMe SSDs or pinned in RAM. For many workloads a large share of head queries can be satisfied entirely within Tier 1, but the hit rate is corpus- and product-specific and must be measured.</li>\n        <li><strong>Tier 2 & 3 (Cold Archive):</strong> Contains long-tail documents on dense hard drives. The query engine only cascades to lower tiers if the top-tier match count is below the desired result threshold.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: ordering a three-term AND</h2>\n<p>Query: <code>distributed AND consensus AND raft</code> on a 100 million document corpus. Document frequencies:</p>\n<table><thead><tr><th>Term</th><th>Postings length</th></tr></thead><tbody>\n<tr><td>distributed</td><td>2,000,000</td></tr>\n<tr><td>consensus</td><td>50,000</td></tr>\n<tr><td>raft</td><td>8,000</td></tr>\n</tbody></table>\n<p><strong>Rarest first:</strong> intersect raft with consensus. A linear merge touches at most 58,000 entries and yields, say, 5,000 documents. Now intersect those 5,000 with distributed. A linear merge would walk 2,005,000 entries, but with skip pointers or galloping search each of the 5,000 probes costs roughly log2 of 2,000,000 divided by 5,000, about 9 steps, so around 45,000 steps. Total: about 100,000 steps.</p>\n<p><strong>Query order:</strong> starting with distributed AND consensus means walking at least 2,050,000 entries before raft is even considered, over 20 times more work for the same answer.</p>\n<h2>Worked example: tier cascade</h2>\n<p>Tier 1 holds the top 10 percent of documents by static quality, 10 million docs, in RAM. The user wants 20 results. If tier 1 returns at least 20 matches for all MUST clauses, stop. If it returns 7, query tier 2 and merge. Because head queries tend to be broad, most of them are satisfied by tier 1, while long-tail queries fall through; the exact hit rate depends on the corpus and should be measured rather than assumed.</p>\n<h2>Trade-offs</h2>\n<table><thead><tr><th>Technique</th><th>Speeds up</th><th>Costs</th></tr></thead><tbody>\n<tr><td>Rarest-first ordering</td><td>AND queries</td><td>Needs document frequency stats, which are cheap</td></tr>\n<tr><td>Skip pointers or block skipping</td><td>Short list vs long list merges</td><td>Extra index space; little gain for equal-length lists</td></tr>\n<tr><td>Quality tiers</td><td>Broad head queries</td><td>Possible recall loss; cascade adds latency when tier 1 is insufficient</td></tr>\n<tr><td>Early termination on impact-ordered postings</td><td>Top-K ranking</td><td>Harder updates; scores must be precomputable</td></tr>\n</tbody></table>\n<p>Lucene implements AND as a conjunction that leads with the lowest-cost iterator and advances the others to its current doc ID, which is the rarest-first strategy in code form. Web engines historically used tiered indexes keyed on PageRank-like static scores.</p>\n</div>",
    "keyTakeaways": [
      "Tiered indexes partition documents into quality tiers based on static authority and popularity signals.",
      "A measured workload may terminate many queries in a high-quality tier; latency and coverage must be evaluated rather than assumed.",
      "Lower tiers are evaluated lazily only when high-tier matching yields insufficient candidates."
    ],
    "furtherReading": [
      {
        "title": "Manning et al.: Tiered Indexes and Champion Lists",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/tiered-indexes-1.html"
      },
      {
        "title": "Broder et al.: Efficient Query Evaluation Using a Two-Level Retrieval Process (CIKM, 2003)",
        "url": "https://dl.acm.org/doi/10.1145/956863.956944"
      },
      {
        "title": "Elasticsearch Reference: Boolean Query",
        "url": "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-bool-query"
      }
    ]
  },
  "tf-idf-relevance-scoring": {
    "title": "TF-IDF relevance scoring",
    "video": {
      "youtubeId": "k1tD7pYKWuM",
      "title": "8 7 Calculating TF IDF Cosine Scores 12 47",
      "channel": "From Languages to Information",
      "why": "Manning computes log-TF, IDF and cosine scores by hand on a real example, matching this unit’s exact formulas.",
      "length": "12:47"
    },
    "videos": [
      {
        "youtubeId": "OymqCnh-APA",
        "title": "TFIDF : Data Science Concepts",
        "channel": "ritvikmath",
        "role": "intro",
        "why": "Whiteboard intuition for why frequent-in-doc but rare-in-corpus words matter, before the math.",
        "length": "7:55"
      },
      {
        "youtubeId": "7nWlI_TVid0",
        "title": "8 4 Inverse Document Frequency Weighting 10 16",
        "channel": "From Languages to Information",
        "role": "deep-dive",
        "why": "Focused lecture on IDF: why log, why document frequency rather than collection frequency.",
        "length": "10:16"
      }
    ],
    "intuition": "<p>At a party, if someone says \"the\", you learn nothing. If someone says \"Paxos\", you instantly know the topic. And if a person says \"Paxos\" ten times, they are probably really talking about it, but the tenth mention tells you less than the first. TF-IDF encodes exactly those two instincts.</p>\n<p><strong>Mental model:</strong> weight of a word in a document = <em>how much this document talks about it</em> (TF, damped with a log) times <em>how surprising the word is in the whole corpus</em> (IDF). Rare words dominate the score; common words barely move it.</p>\n<ul>\n<li><strong>Trap:</strong> using raw counts. A document repeating a common word 30 times can outrank a document that mentions the rare, decisive term.</li>\n<li><strong>Trap:</strong> forgetting length normalisation. Without cosine or similar normalisation, long documents win just by containing more words.</li>\n<li><strong>Trap:</strong> thinking TF-IDF understands meaning. \"Car\" and \"automobile\" share zero weight; that gap is why synonyms and embeddings exist.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>The Foundations of Lexical Relevance</h2>\n      <p>How does a search engine decide whether Document A is more relevant to a query than Document B? The foundational mathematical model of information retrieval is <strong>TF-IDF</strong> (Term Frequency - Inverse Document Frequency).</p>\n\n      <h2>The Two Core Components of TF-IDF</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    TF[\"Term Frequency (TF): How often does term t appear in doc d? (Local Importance)\"] --> Mult[\"Multiply: TF x IDF\"]\n    IDF[\"Inverse Document Frequency (IDF): How rare is term t across all N docs? (Global Discriminator)\"] --> Mult\n    Mult --> Score[\"Relevance Weight for (t, d)\"]\n      </div>\n\n      <h2>Under the Hood: The Mathematical Formulas</h2>\n      <h3>1. Term Frequency (TF)</h3>\n      <p>Measures how frequently term <code>t</code> occurs in document <code>d</code>. The simplest form is raw count <code>freq(t, d)</code>, but modern systems apply logarithmic damping to prevent documents with 100 mentions of a word from dominating documents with 10 mentions:</p>\n      <pre><code>TF(t, d) = 1 + ln(freq(t, d))  (for freq > 0)</code></pre>\n\n      <h3>2. Inverse Document Frequency (IDF)</h3>\n      <p>Common words (e.g. \"the\", \"system\") appear in almost every document and provide zero discriminatory power. Rare words (e.g. \"Paxos\", \"Bloom\") carry high information entropy. Given total documents <code>N</code> and document frequency <code>DF(t)</code>:</p>\n      <pre><code>IDF(t) = ln(1 + (N / DF(t)))</code></pre>\n\n      <h3>3. The Vector Space Model (Cosine Similarity)</h3>\n      <p>Documents and queries are represented as high-dimensional vectors in term space. The relevance score is computed as the cosine of the angle between query vector q and document vector d:</p>\n      <pre><code>Cosine_Similarity(q, d) = (q . d) / (||q|| * ||d||)</code></pre>\n    \n<!-- enriched -->\n<h2>Worked example: why the log matters</h2>\n<p>Corpus: N = 1,000,000 documents. Query: <code>raft system</code>.</p>\n<table><thead><tr><th>Term</th><th>DF</th><th>IDF = ln(1 + N/DF)</th></tr></thead><tbody>\n<tr><td>raft</td><td>1,000</td><td>ln(1001) = 6.91</td></tr>\n<tr><td>system</td><td>400,000</td><td>ln(3.5) = 1.25</td></tr>\n</tbody></table>\n<p>Document A mentions raft 3 times and system 10 times. Document B mentions raft once and system 30 times.</p>\n<table><thead><tr><th>Scoring</th><th>Doc A</th><th>Doc B</th><th>Winner</th></tr></thead><tbody>\n<tr><td>Raw TF x IDF</td><td>3 x 6.91 + 10 x 1.25 = 33.3</td><td>1 x 6.91 + 30 x 1.25 = 44.5</td><td>B</td></tr>\n<tr><td>Log TF x IDF, TF = 1 + ln f</td><td>2.10 x 6.91 + 3.30 x 1.25 = 18.6</td><td>1.00 x 6.91 + 4.40 x 1.25 = 12.4</td><td>A</td></tr>\n</tbody></table>\n<p>With raw counts, B wins by repeating a near-useless word. With log damping, A wins because it talks more about the rare, discriminating term. This is the core lesson of TF-IDF.</p>\n<h2>Cosine normalisation in one line</h2>\n<p>Dividing by vector length means a 10,000-word document is not rewarded simply for containing more terms. In practice engines precompute each document's norm at index time so query-time cost stays proportional to the query's postings.</p>\n<h2>TF variants compared</h2>\n<table><thead><tr><th>TF form</th><th>Behaviour</th><th>Used in</th></tr></thead><tbody>\n<tr><td>Raw count</td><td>Linear, easily gamed by repetition</td><td>Teaching examples</td></tr>\n<tr><td>1 + ln f</td><td>Grows slowly but without bound</td><td>Classic SMART lnc.ltc schemes</td></tr>\n<tr><td>sqrt f</td><td>Sub-linear</td><td>Lucene ClassicSimilarity, the pre-BM25 default</td></tr>\n<tr><td>BM25 saturation</td><td>Bounded, tunable, length-aware</td><td>Default in Lucene 6 and later, Elasticsearch 5 and later</td></tr>\n</tbody></table>\n<p><strong>Failure modes:</strong> IDF computed per shard can differ across shards when documents are unevenly distributed, which is why Elasticsearch offers a <code>dfs_query_then_fetch</code> mode that gathers global term statistics first; tiny corpora produce noisy IDF values.</p><h2>Interview framing</h2><p>If asked \"how would you rank documents for a keyword query?\", start with TF-IDF to show you understand the two forces, local frequency and global rarity, then say production engines use BM25 because it bounds repetition and normalises length with tunable parameters, and finally mention a learned re-ranker on top for non-text signals such as popularity and freshness. That three-step answer covers the evolution from 1970s vector space models to modern two-stage ranking.</p>\n</div>",
    "keyTakeaways": [
      "TF measures how often a term appears in a document; logarithmic damping prevents term-stuffing manipulation.",
      "IDF penalizes ubiquitous common words and boosts rare, highly informative keywords.",
      "The Vector Space Model computes document relevance via cosine similarity between query and document vectors."
    ],
    "furtherReading": [
      {
        "title": "Salton & Buckley: Term-Weighting Approaches in Automatic Text Retrieval",
        "url": "https://www.sciencedirect.com/science/article/pii/0306457388900210"
      },
      {
        "title": "Manning et al.: TF-IDF and the Vector Space Model (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html"
      },
      {
        "title": "Manning, Raghavan & Schütze: Introduction to Information Retrieval (Cambridge University Press, 2008)",
        "url": "https://nlp.stanford.edu/IR-book/"
      }
    ]
  },
  "bm25-production-ranking": {
    "title": "BM25 production ranking",
    "video": {
      "youtubeId": "ruBm9WywevM",
      "title": "BM25 : The Most Important Text Metric in Data Science",
      "channel": "ritvikmath",
      "why": "Derives each BM25 term (saturation k1, length normalisation b, IDF) from the shortcomings of TF-IDF with clear plots.",
      "length": "18:12"
    },
    "videos": [
      {
        "youtubeId": "TW9vHU1GpU4",
        "title": "A no nonsense intro to BM25",
        "channel": "Abhishek Thakur",
        "role": "intro",
        "why": "Practical, code-first walkthrough computing BM25 scores by hand.",
        "length": "15:46"
      },
      {
        "youtubeId": "_UxUZvPfEKo",
        "title": "Probabilistic model 9: BM25 and 2-poisson",
        "channel": "Victor Lavrenko",
        "role": "deep-dive",
        "why": "Edinburgh IR lecture on the probabilistic 2-Poisson origin of the BM25 saturation curve.",
        "length": "7:39"
      }
    ],
    "intuition": "<p>Think of restaurant reviews. The first review that mentions \"great pasta\" is strong evidence; the twentieth adds little. And a one-line review saying \"great pasta\" says more about pasta than a 5,000-word travel blog that mentions it once in passing. BM25 formalises both: evidence saturates, and long documents are discounted.</p>\n<p><strong>Mental model:</strong> BM25 = sum over query terms of <em>IDF</em> times a <em>saturating TF curve</em>. The knob <code>k1</code> sets how fast repetition stops helping; the knob <code>b</code> sets how much document length is penalised.</p>\n<ul>\n<li><strong>Trap:</strong> saying BM25 \"understands\" the query. It is still a bag of words with no synonyms or word order.</li>\n<li><strong>Trap:</strong> tuning k1 and b without an evaluation set. Changes that feel better on three queries often hurt NDCG overall.</li>\n<li><strong>Trap:</strong> comparing BM25 scores across queries or indexes as if they were probabilities. Scores are only meaningful for ranking within one query.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <div class=\"callout callout--note\">\n        <div class=\"callout__title\">Implementation build</div>\n        <p>Explore the BM25 scoring algorithm and document length normalization implemented from first principles in <a href=\"#build/tiny-search-engine\">Tiny Search Engine (Inverted Index, Compression & BM25)</a>.</p>\n      </div>\n\n      <h2>Under the Hood: Why Okapi BM25 Replaced TF-IDF</h2>\n      <p>While TF-IDF laid the foundation for information retrieval, raw-TF variants grow linearly with repetition, while the logarithmically damped TF taught in the previous lesson grows more slowly. BM25 makes saturation and document-length normalization explicit and tunable. <strong>Okapi BM25</strong> (Best Matching 25) introduced non-linear term frequency saturation and tunable document length penalties, becoming the default similarity in Lucene, Elasticsearch and OpenSearch; Vespa offers it as the <code>bm25</code> rank feature, though its default text ranking is <code>nativeRank</code>.</p>\n\n      <h2>The BM25 Mathematical Formula</h2>\n      <pre><code>BM25(D, Q) = Σ IDF(qᵢ) × [ (f(qᵢ, D) × (k₁ + 1)) / (f(qᵢ, D) + k₁ × (1 - b + b × (|D| / avgdl))) ]</code></pre>\n\n      <h2>BM25 Term Frequency Saturation Curve</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    TFPoints[\"Term Count: 1 -> 5 -> 10 -> 50 -> 100\"] --> BM25Curve[\"BM25 Score asymptotically approaches (k1 + 1) ceiling!\"]\n    TFPoints --> LinearTF[\"TF-IDF continues climbing indefinitely!\"]\n      </div>\n\n      <h2>Under the Hood: The Parameters <code>k₁</code> and <code>b</code></h2>\n      <ul>\n        <li><strong>Term Saturation Parameter <code>k₁</code> (Default: ≈ 1.2):</strong> Calibrates how quickly the term frequency score saturates. As the count of a keyword in a document increases, its incremental score addition diminishes, preventing keyword-stuffed spam pages from winning ranking.</li>\n        <li><strong>Document Length Normalization <code>b</code> (Default: ≈ 0.75):</strong> Penalizes long documents. If a 100,000-word book mentions \"Kafka\" 5 times, it is far less relevant than a 50-word tweet that mentions \"Kafka\" 5 times. When <code>b = 1.0</code>, the score is fully scaled by length; when <code>b = 0</code>, length normalization is disabled.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: saturation and length in numbers</h2>\n<p>Use the defaults k1 = 1.2 and b = 0.75, with average document length avgdl = 100 terms. The per-term TF component is f x (k1 + 1) divided by f + k1 x (1 - b + b x dl / avgdl). Its ceiling is k1 + 1 = 2.2.</p>\n<table><thead><tr><th>Term count f</th><th>Short doc, 50 terms</th><th>Average doc, 100 terms</th><th>Long doc, 1,000 terms</th></tr></thead><tbody>\n<tr><td>1</td><td>1.26</td><td>1.00</td><td>0.21</td></tr>\n<tr><td>3</td><td>1.76</td><td>1.57</td><td>0.54</td></tr>\n<tr><td>10</td><td>2.05</td><td>1.96</td><td>1.14</td></tr>\n<tr><td>100</td><td>2.19</td><td>2.17</td><td>2.02</td></tr>\n</tbody></table>\n<p>Two lessons: going from 10 to 100 mentions barely moves the score, so keyword stuffing stops paying off; and a single mention in a 1,000-term document is worth about one fifth of a mention in an average document.</p>\n<p>Multiply by IDF. Lucene uses IDF = ln(1 + (N - n + 0.5) / (n + 0.5)). For N = 1,000,000 and n = 1,000 documents containing the term, IDF is about 6.9; for a term in 400,000 documents it is about 0.4. The rare term still dominates.</p>\n<h2>Tuning trade-offs</h2>\n<table><thead><tr><th>Setting</th><th>Effect</th><th>Good for</th></tr></thead><tbody>\n<tr><td>Lower k1, around 0.5</td><td>Saturates after one or two mentions</td><td>Short fields such as titles and product names</td></tr>\n<tr><td>Higher k1, around 2</td><td>Repetition keeps helping longer</td><td>Long technical documents</td></tr>\n<tr><td>b = 0</td><td>No length penalty</td><td>Fields with uniform length, tags</td></tr>\n<tr><td>b = 1</td><td>Full length normalisation</td><td>Corpora mixing tweets and books</td></tr>\n</tbody></table>\n<h2>Production notes</h2>\n<ul>\n<li>BM25 has been Lucene's default similarity since Lucene 6 and Elasticsearch 5. Lucene 8 dropped the constant (k1 + 1) factor from the numerator; this rescales scores but does not change ranking.</li>\n<li>Multi-field search, for example title and body, needs care: BM25F-style combination or per-field boosts, because each field has its own avgdl.</li>\n<li>Per-shard statistics mean the same document can score slightly differently on different shards until term stats converge.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "BM25 prevents keyword spam by asymptotically saturating term frequency scores as count increases.",
      "The k1 parameter (~1.2) controls term frequency saturation non-linearity.",
      "The b parameter (~0.75) penalizes verbose, long documents relative to average document length."
    ],
    "furtherReading": [
      {
        "title": "Arpit Bhayani: BM25 - The Information Retrieval Algorithm That Outlived Its Era (Detailed Blog)",
        "url": "https://arpitbhayani.me/blogs/bm25/"
      },
      {
        "title": "Stephen Robertson: The Probabilistic Relevance Framework: BM25 and Beyond",
        "url": "https://www.staff.city.ac.uk/~sb317/papers/foundations_bm25_review.pdf"
      },
      {
        "title": "Elastic Blog: Practical BM25 - Part 2: The BM25 Algorithm and its Variables",
        "url": "https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables"
      }
    ]
  },
  "stop-words-and-champion-lists": {
    "title": "Stop words and champion lists",
    "video": {
      "youtubeId": "XNxzXQa55jQ",
      "title": "IR Course Lecture 13: Efficient Scoring",
      "channel": "Venkatesh Vinayakarao",
      "why": "Lecture on inexact top-K retrieval: champion lists, index elimination of low-IDF terms, static quality scores and tiered indexes, precisely this unit.",
      "length": "25:19"
    },
    "videos": [
      {
        "youtubeId": "eo9tAldtrm8",
        "title": "IR4.10 Removing stopwords",
        "channel": "Victor Lavrenko",
        "role": "intro",
        "why": "Compact explanation of what stop words are, why they were removed, and the cost of removing them.",
        "length": "3:22"
      }
    ],
    "intuition": "<p>Imagine a shop assistant asked for \"the red jacket\". Checking every item in the warehouse tagged \"the\" would be absurd, so the assistant focuses on \"red\" and \"jacket\". And for \"jacket\", they first check the shortlist of best-sellers by the door before walking into the back room. Stop-word handling and champion lists are those two shortcuts.</p>\n<p><strong>Mental model:</strong> common words have enormous postings lists but tiny IDF, so they contribute little score at huge cost; champion lists precompute, per term, the few hundred documents most likely to make the top K so most queries never touch the full list.</p>\n<ul>\n<li><strong>Trap:</strong> deleting stop words from the index. \"The Who\", \"to be or not to be\" and \"vitamin A\" break. Modern engines keep them and prune at query time.</li>\n<li><strong>Trap:</strong> treating champion lists as exact. They are an approximation; a document outside every champion list can be the true best match.</li>\n<li><strong>Trap:</strong> confusing champion lists (per term) with tiered indexes (per corpus). They are related but not the same structure.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Optimization Strategies for Massive Corpora</h2>\n      <p>When searching over billions of documents, postings lists for common words contain hundreds of millions of entries. Search engines employ two contrasting strategies to maximize query throughput without sacrificing accuracy: <strong>Stop Word Handling</strong> and <strong>Champion Lists</strong>.</p>\n\n      <h2>Champion Lists (Fancy Lists) Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Term[\"Vocabulary Term: 'database' (Appears in 50,000,000 documents)\"] --> Split[\"Split at Index Time\"]\n    Split --> Champ[\"Champion List (RAM): Top 1,000 Documents with Highest BM25 Weight\"]\n    Split --> Full[\"Full Postings List (Disk): All 50,000,000 Documents\"]\n    \n    UserQuery[\"Query: 'distributed database'\"] --> QueryChamp[\"1. Intersect Champion Lists in RAM (sub-5ms)\"]\n    QueryChamp --> Check{\"Found >= 20 High-Relevance Results?\"}\n    Check -->|\"Yes\"| Return[\"Return Immediate Top-K Results\"]\n    Check -->|\"No\"| Fallback[\"2. Fall back to Full Disk Postings Lists\"]\n      </div>\n\n      <h2>Under the Hood: The Evolution of Stop Words</h2>\n      <ul>\n        <li><strong>Historical Approach (Aggressive Removal):</strong> Early search engines stripped all stop words (\"the\", \"to\", \"and\", \"or\") during indexing to save disk space. <strong>The Failure:</strong> Queries like <em>\"To be or not to be\"</em> or <em>\"The Who\"</em> returned zero results or completely corrupted semantics.</li>\n        <li><strong>Modern Approach (Common-Grams & WAND):</strong> Modern engines retain all words in the index. Frequent word pairs can be indexed as single tokens (common-grams such as \"to_be\"), positional indexes answer phrase queries containing common words, and common terms are pruned during query evaluation using dynamic pruning algorithms like <strong>WAND (Weak AND)</strong> and <strong>Block-Max WAND</strong>.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: the cost of \"the\"</h2>\n<p>In a 1 billion document English web corpus, \"the\" appears in the large majority of documents. Even at about one byte per compressed posting, walking its list means reading hundreds of megabytes for one query term, yet its IDF is close to zero, so it barely changes the ranking. Meanwhile \"raft\" might appear in 200,000 documents: a fraction of a megabyte.</p>\n<p>Three ways to handle the query <code>the raft paper</code>:</p>\n<table><thead><tr><th>Approach</th><th>Work</th><th>Risk</th></tr></thead><tbody>\n<tr><td>Drop \"the\" at index time</td><td>Minimal</td><td>Phrase and name queries such as \"The Who\" become impossible</td></tr>\n<tr><td>Keep it, evaluate naively</td><td>Scans the huge list</td><td>Latency spikes on every query containing common words</td></tr>\n<tr><td>Keep it, dynamic pruning such as WAND or Block-Max WAND</td><td>Skips most of the list because its maximum possible score contribution is tiny</td><td>Exact top K preserved; more complex implementation</td></tr>\n<tr><td>Common grams, index \"the_who\" as one token</td><td>Short list for the phrase</td><td>Larger index; must choose which pairs to index</td></tr>\n</tbody></table>\n<h2>How WAND skips work, in one paragraph</h2>\n<p>Each term stores an upper bound on its score contribution. Suppose the current 10th best score is 9.0, and the upper bounds are raft 7.0, paper 3.5, the 0.1. A document containing only \"the\" and \"paper\" can score at most 3.6, below 9.0, so it cannot enter the top 10. WAND jumps directly to the next document that contains raft, skipping millions of \"the\" postings. Block-Max WAND stores bounds per block of 128 postings, making the skips even tighter. Lucene has used block-max WAND for top-K disjunctions since version 8.</p>\n<h2>Champion list sizing</h2>\n<p>Choose r, the champion list length per term, larger than K. With r = 1,000 and K = 20, most two-term queries find enough candidates in the union of champion lists; queries that do not fall back to full postings. Larger r means more RAM and better recall; the right value comes from measuring recall at K on a query log against full evaluation.</p>\n</div>",
    "keyTakeaways": [
      "Champion lists precompute the top R highest-scoring documents per term, answering top-K queries in RAM.",
      "Modern search engines avoid hard stop word deletion to preserve phrase semantics ('The Who').",
      "Block-Max WAND dynamically skips postings blocks whose upper-bound scores cannot beat the current top-K threshold."
    ],
    "furtherReading": [
      {
        "title": "Ding & Suel: Faster Top-k Document Retrieval Using Block-Max Indexes",
        "url": "https://dl.acm.org/doi/10.1145/2009916.2010048"
      },
      {
        "title": "Manning et al.: Dropping Common Terms: Stop Words (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/dropping-common-terms-stop-words-1.html"
      },
      {
        "title": "Manning et al.: Champion Lists (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/champion-lists-1.html"
      }
    ]
  },
  "query-understanding-pipeline": {
    "title": "Query understanding pipeline",
    "video": {
      "youtubeId": "STvz1gGtSw8",
      "title": "Berlin Buzzwords 2018: Giovanni Fernandez-Kincade – Getting Started with Query Understanding #bbuzz",
      "channel": "Plain Schwarz",
      "why": "A practitioner talk (Etsy search) on spelling, segmentation, entity tagging, classification and rewriting, laid out as a pipeline exactly like this unit.",
      "length": "41:00"
    },
    "videos": [
      {
        "youtubeId": "qvp0uTVjgrg",
        "title": "Query Intelligence: Understanding User Intent by Erica Lesyshyn",
        "channel": "OpenSource Connections",
        "role": "case-study",
        "why": "Haystack talk on applying intent classification and query rewriting in a production search stack.",
        "length": "39:38"
      },
      {
        "youtubeId": "b--tgaE-lFg",
        "title": "IR4.1 Vocabulary mismatch in IR",
        "channel": "Victor Lavrenko",
        "role": "intro",
        "why": "Short lecture on the vocabulary mismatch problem that query understanding exists to solve.",
        "length": "3:27"
      }
    ],
    "intuition": "<p>A good waiter hears \"a flat white, oat, large, no rush\" and translates it into a structured ticket: drink type, milk, size, priority. They also silently fix \"a flat whte\". Query understanding does the same for search: turn a messy string into a structured request before touching the index.</p>\n<p><strong>Mental model:</strong> <em>string in, structured intent out</em>. Correct spelling, segment the words, tag entities (brand, colour, size), classify the intent, then rewrite into filters plus a scored text match.</p>\n<ul>\n<li><strong>Trap:</strong> turning every tagged entity into a hard filter. If \"red\" becomes a strict filter and the tagger was wrong, you return zero results. Prefer boosts for low-confidence tags.</li>\n<li><strong>Trap:</strong> letting synonyms outrank exact matches. Expanded terms should carry lower weight.</li>\n<li><strong>Trap:</strong> blowing the latency budget with heavy models. Query understanding typically gets single-digit to low tens of milliseconds, so cache results for head queries.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Bridging the Vocabulary Mismatch</h2>\n      <p>Users express search intent using incomplete, misspelled, or ambiguous queries (e.g. <code>\"cheap nike shoes red size 10\"</code>). A naive literal keyword search against an inverted index frequently returns zero results. The <strong>Query Understanding Pipeline</strong> transforms raw user queries into rich structured search intents before querying the index.</p>\n\n      <h2>The Multi-Stage Query Understanding Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Raw[\"Raw User Query: 'red nkie runnign shoe'\"] --> Spell[\"1. Spelling Correction: 'red nike running shoe'\"]\n    Spell --> Tokenize[\"2. Tokenization & Normalization\"]\n    Tokenize --> NER[\"3. Named Entity Recognition (NER)\"]\n    \n    subgraph EntityExtraction [\"Entity Mapping\"]\n      NER --> Brand[\"Brand: 'Nike'\"]\n      NER --> Category[\"Category: 'Running Shoes'\"]\n      NER --> Color[\"Attribute: Color = 'Red'\"]\n    end\n    \n    NER --> Intent[\"4. Intent Classifier: Commercial Purchase\"]\n    Intent --> Rewrite[\"5. Query Rewriting & Expansion (Synonyms: 'sneakers', 'trainers')\"]\n    Rewrite --> Structured[\"6. Structured Query: filter(brand='Nike', cat='Shoes') & match('red running')\"]\n      </div>\n\n      <h2>Under the Hood: Machine Learning at the Query Boundary</h2>\n      <ul>\n        <li><strong>Named Entity Recognition (NER):</strong> Lightweight transformer models (DistilBERT) or fast linear CRF models identify brand names, product models, sizes, and colors in sub-10 milliseconds.</li>\n        <li><strong>Synonym Expansion:</strong> Expands query terms using offline word embedding graphs (e.g. mapping \"hoodie\" to \"sweatshirt\"). Expansion weights are discounted (weight = 0.5) so exact matches rank higher than synonym matches.</li>\n        <li><strong>Query Relaxation:</strong> If a strict boolean query yields zero results, the pipeline automatically relaxes constraints (e.g. dropping non-essential adjective tokens) while warning the user: <em>\"No exact match found; showing results for Nike shoes\"</em>.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: one query through the pipeline</h2>\n<p>Raw input: <code>red nkie runnign shoes size 10</code></p>\n<table><thead><tr><th>Stage</th><th>Output</th><th>Typical budget</th></tr></thead><tbody>\n<tr><td>Normalise</td><td>lowercase, trim, Unicode fold</td><td>under 1 ms</td></tr>\n<tr><td>Spell correct</td><td>red nike running shoes size 10</td><td>1 to 3 ms</td></tr>\n<tr><td>Segment and tag</td><td>colour=red, brand=nike, category=running shoes, size=10</td><td>2 to 10 ms</td></tr>\n<tr><td>Classify intent</td><td>product purchase, category footwear, confidence 0.93</td><td>2 to 5 ms</td></tr>\n<tr><td>Rewrite</td><td>filter brand=nike and category=footwear, boost colour=red and size=10, text match running shoes with synonym trainers at weight 0.5</td><td>under 1 ms</td></tr>\n</tbody></table>\n<p>Notice the split between <strong>hard filters</strong> (high-confidence brand and category) and <strong>soft boosts</strong> (colour, size). If the shop has Nike running shoes in size 10 but none in red, the user still sees results rather than an empty page.</p>\n<div class=\"mermaid\">\nflowchart LR\n  A[\"Raw query\"] --> B[\"Spell correct\"]\n  B --> C[\"Tag entities\"]\n  C --> D[\"Classify intent\"]\n  D --> E[\"Rewrite to filters and boosts\"]\n  E --> F[\"Retrieve\"]\n  F --> G{\"Zero results?\"}\n  G -->|\"Yes\"| H[\"Relax: drop lowest confidence constraint\"]\n  H --> F\n  G -->|\"No\"| I[\"Rank and return\"]\n</div>\n<h2>Trade-offs</h2>\n<table><thead><tr><th>Choice</th><th>Upside</th><th>Downside</th></tr></thead><tbody>\n<tr><td>Dictionary and rules</td><td>Fast, explainable, easy to hot-fix</td><td>Poor coverage of the long tail</td></tr>\n<tr><td>ML taggers and classifiers</td><td>Generalise to unseen phrasing</td><td>Need labelled data; silent errors</td></tr>\n<tr><td>LLM rewriting</td><td>Handles complex natural language</td><td>Latency and cost; must be cached or used only on tail queries</td></tr>\n</tbody></table>\n<p><strong>Failure modes:</strong> over-correction (\"iphone\" corrected to \"phone\"), brand collisions (\"apple\" the fruit), and feedback loops where a bad rewrite reduces clicks, which then looks like low demand. Always log the original and rewritten query so relevance engineers can debug.</p><h2>How real systems do it</h2><p>Large e-commerce engines typically keep a curated dictionary of brands, categories and attributes built from the catalogue itself, run fast taggers against it, and fall back to learned models for ambiguous tokens. Results for the most frequent few hundred thousand queries are precomputed and cached, so heavy models only run on the long tail. Every rewrite is logged next to the original query for offline analysis.</p>\n</div>",
    "keyTakeaways": [
      "Query understanding bridges the semantic gap between imprecise user searches and structured index schemas.",
      "Sub-10ms NER models extract structured attributes (brands, sizes, categories) to build filtered queries.",
      "Query relaxation and synonym expansions prevent zero-result dead ends."
    ],
    "furtherReading": [
      {
        "title": "Daniel Tunkelang: Query Understanding: An Introduction",
        "url": "https://queryunderstanding.com/introduction-c98740502103"
      },
      {
        "title": "Jones et al.: Generating Query Substitutions (WWW, 2006)",
        "url": "https://dl.acm.org/doi/10.1145/1135777.1135835"
      },
      {
        "title": "Pandu Nayak (Google): Understanding Searches Better Than Ever Before",
        "url": "https://blog.google/products-and-platforms/products/search/search-language-understanding-bert/"
      }
    ]
  },
  "search-feedback-and-relevance-signals": {
    "title": "Search feedback and relevance signals",
    "video": {
      "youtubeId": "wa88XShl7hs",
      "title": "Haystack US 2022-René Kriegler,OSC-Modelling implicit user feedback for optimising e-commerce search",
      "channel": "OpenSource Connections",
      "why": "Directly about turning clicks, add-to-carts and purchases into relevance labels, including click models and position bias.",
      "length": "47:29"
    },
    "videos": [
      {
        "youtubeId": "YroewVVp7SM",
        "title": "Learning to Rank - The ML Problem You've Probably Never Heard Of",
        "channel": "ritvikmath",
        "role": "intro",
        "why": "Quick intuition for pointwise, pairwise and listwise learning to rank.",
        "length": "6:29"
      },
      {
        "youtubeId": "dN_t0VnqtIs",
        "title": "Recent Advances in Unbiased Learning to Rank from Position-Biased Click Feedback",
        "channel": "Harrie Oosterhuis",
        "role": "deep-dive",
        "why": "Researcher tutorial on inverse propensity scoring and counterfactual LTR, the debiasing this unit mentions.",
        "length": "59:10"
      }
    ],
    "intuition": "<p>Imagine judging which restaurants are good by counting how many people walk into each one. The problem: restaurants on the main street get more walk-ins simply because more people pass them. Search clicks have the same bias; the top result gets clicked partly because it is on top.</p>\n<p><strong>Mental model:</strong> a click is <em>evidence of relevance multiplied by the chance the user even looked</em>. Learning to rank combines many signals, but the click-derived labels must first be corrected for position, or the model just learns to keep yesterday's ranking.</p>\n<ul>\n<li><strong>Trap:</strong> training directly on raw CTR. You entrench existing top results and new items never get exposure.</li>\n<li><strong>Trap:</strong> treating non-clicks as negatives. A result the user never scrolled to is unobserved, not irrelevant.</li>\n<li><strong>Trap:</strong> leaking future information into features, for example using a document's lifetime click count when training on historical queries.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Implicit Feedback & Learning to Rank (LTR)</h2>\n      <p>While BM25 scores textual overlap, real-world user intent requires factoring in non-textual signals: item popularity, geographical distance, price competitiveness, seller ratings, and real-time user behavior. <strong>Learning to Rank (LTR)</strong> uses machine learning models to combine hundreds of disparate features into a single ranking score.</p>\n\n      <h2>Two-Stage Search Architecture: Retrieval & Reranking</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Query[\"User Query\"] --> Phase1[\"Stage 1: Retrieval (BM25 + Ann Vector)\"]\n    Phase1 -->|\"Filter 100,000,000 -> Top 1,000 Candidates\"| Candidates[\"Candidate Set (1,000 Docs)\"]\n    Candidates --> Phase2[\"Stage 2: Heavy ML Reranker (LambdaMART / Cross-Encoder)\"]\n    Phase2 -->|\"Re-score using 200 Features\"| FinalTop[\"Top 20 Results Served to User\"]\n      </div>\n\n      <h2>Under the Hood: Feature Engineering & Position Bias</h2>\n      <h3>1. Signal Categories</h3>\n      <ul>\n        <li><strong>Query-Document Features:</strong> BM25 score, phrase match proximity, vector cosine similarity.</li>\n        <li><strong>Document Static Features:</strong> Historical conversion rate, return rate, average review rating, page load speed.</li>\n        <li><strong>User Context Features:</strong> User location, browsing history, past brand affinity, device type.</li>\n      </ul>\n\n      <h3>2. The Position Bias Trap</h3>\n      <p>Users click the #1 result significantly more often than the #5 result, regardless of true relevance. Training an ML model directly on raw click logs creates a feedback loop that permanently cements existing top results. High-performance search engines apply <strong>Inverse Propensity Scoring (IPS)</strong> to debias click data before model training.</p>\n    \n<!-- enriched -->\n<h2>Worked example: inverse propensity weighting</h2>\n<p>Suppose eye-tracking or randomisation experiments estimate the probability that a user examines each position:</p>\n<table><thead><tr><th>Position</th><th>Examination propensity</th><th>Clicks observed</th><th>Weighted clicks, clicks divided by propensity</th></tr></thead><tbody>\n<tr><td>1</td><td>1.00</td><td>500</td><td>500</td></tr>\n<tr><td>3</td><td>0.50</td><td>200</td><td>400</td></tr>\n<tr><td>10</td><td>0.10</td><td>60</td><td>600</td></tr>\n</tbody></table>\n<p>Raw clicks say the position-1 document is best by far. After correcting for how rarely position 10 is even seen, the position-10 document shows the strongest relevance signal. In practice propensities are clipped, for example to at least 0.05, because a click at a rarely seen position gets a huge weight and makes training noisy.</p>\n<h2>Where propensities come from</h2>\n<ul>\n<li><strong>Result randomisation:</strong> swap positions for a small slice of traffic and measure how CTR changes with position alone.</li>\n<li><strong>Intervention harvesting:</strong> reuse natural ranking changes between model versions as free experiments.</li>\n<li><strong>Click models:</strong> cascade and position-based models fit examination and attractiveness jointly from logs.</li>\n</ul>\n<h2>Signal trade-offs</h2>\n<table><thead><tr><th>Signal</th><th>Volume</th><th>Noise</th><th>Notes</th></tr></thead><tbody>\n<tr><td>Click</td><td>High</td><td>High</td><td>Position and presentation biased; attractive thumbnails inflate it</td></tr>\n<tr><td>Dwell time over about 30 s</td><td>Medium</td><td>Medium</td><td>Better satisfaction proxy; depends on content type</td></tr>\n<tr><td>Add to cart or purchase</td><td>Low</td><td>Low</td><td>Strongest for e-commerce; sparse on the long tail</td></tr>\n<tr><td>Human judgments</td><td>Very low</td><td>Low</td><td>Expensive; used for evaluation sets and calibration</td></tr>\n</tbody></table>\n<p><strong>Production pattern:</strong> log every impression with its position, the ranker version and features at serving time; join with downstream events; build labels offline; train a LambdaMART or neural ranker; ship behind an interleaving or A/B test. Airbnb, Etsy and many e-commerce teams have described this loop publicly. Logging features at serving time avoids train and serve skew.</p><h2>Failure modes</h2><ul><li><strong>Rich-get-richer loops:</strong> without exploration, new items never collect clicks. Reserve a small share of impressions for exploration or boost fresh items explicitly.</li><li><strong>Bot and fraud clicks:</strong> filter automated traffic before labels are built, or competitors can manipulate rankings.</li><li><strong>Presentation bias:</strong> larger images, badges and prices shown in bold change CTR independently of relevance; include presentation features in the model or control for them.</li></ul>\n</div>",
    "keyTakeaways": [
      "Production search operates in two stages: fast lexical/vector candidate retrieval (Top 1,000) followed by heavy ML reranking (Top 20).",
      "Learning-to-Rank models (LambdaMART, GBDT) combine BM25, static document quality, and personalized user affinity.",
      "Position bias must be counteracted using Inverse Propensity Scoring to prevent self-reinforcing click feedback loops."
    ],
    "furtherReading": [
      {
        "title": "Burges: From RankNet to LambdaRank to LambdaMART (Microsoft Research)",
        "url": "https://www.microsoft.com/en-us/research/publication/from-ranknet-to-lambdarank-to-lambdamart-an-overview/"
      },
      {
        "title": "Tie-Yan Liu: Learning to Rank for Information Retrieval (Foundations and Trends in IR, 2009)",
        "url": "https://www.emerald.com/ftinr/article-abstract/3/3/225/1326502/Learning-to-Rank-for-Information-Retrieval"
      },
      {
        "title": "Thorsten Joachims: Optimizing Search Engines using Clickthrough Data (KDD, 2002)",
        "url": "https://dl.acm.org/doi/10.1145/775047.775067"
      }
    ]
  },
  "search-evaluation-metrics": {
    "title": "Search evaluation metrics",
    "video": {
      "youtubeId": "2XegvMul_mE",
      "title": "Every Ranking Metric : MRR, MAP, NDCG",
      "channel": "ritvikmath",
      "why": "Works through MRR, MAP and NDCG on the same example ranking so the differences are obvious, exactly what this unit teaches.",
      "length": "21:17"
    },
    "videos": [
      {
        "youtubeId": "b7pfLpVBN84",
        "title": "8 8 Evaluating Search Engines 9 02",
        "channel": "From Languages to Information",
        "role": "intro",
        "why": "Manning on how search engines are evaluated with judged test collections and user measures.",
        "length": "9:02"
      },
      {
        "youtubeId": "EiDltQZ713I",
        "title": "Crash Course IR - Evaluation",
        "channel": "Sebastian Hofstätter",
        "role": "deep-dive",
        "why": "TU Wien lecture covering binary vs graded metrics, pooling, test collections and statistical significance.",
        "length": "37:16"
      }
    ],
    "intuition": "<p>Grading a search engine is like grading a sommelier who recommends five wines. Did they pick good wines (precision)? Did they find all the great ones in the cellar (recall)? Did they put the best wine first, since you will probably only taste the first one or two (NDCG)?</p>\n<p><strong>Mental model:</strong> every IR metric is <em>relevance, discounted by position</em>. Precision@K ignores order inside the top K; MRR only cares about the first good hit; NDCG rewards graded relevance and punishes pushing great results down.</p>\n<ul>\n<li><strong>Trap:</strong> quoting recall for web or product search. You rarely know the total number of relevant documents, so recall is only measurable on judged test collections.</li>\n<li><strong>Trap:</strong> comparing NDCG across different query sets. It is normalised per query, but hard and easy queries still have different ceilings.</li>\n<li><strong>Trap:</strong> trusting offline gains without an online test. A model can improve NDCG on old judgments and still lose clicks or revenue.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Quantifying Search Quality</h2>\n      <p>You cannot improve search relevance without rigorous mathematical evaluation metrics. In information retrieval, search quality is evaluated using both offline benchmark datasets (judged by human evaluators) and online user telemetry.</p>\n\n      <h2>The Core IR Evaluation Metrics</h2>\n      <table>\n        <thead>\n          <tr><th>Metric</th><th>Formula & Focus</th><th>When to Use</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Precision@K</strong></td><td><code>(Relevant in top K) / K</code>. Focuses on purity of the first page.</td><td>E-commerce product search where top 10 items must be accurate.</td></tr>\n          <tr><td><strong>Recall@K</strong></td><td><code>(Relevant in top K) / (Total relevant in corpus)</code>. Focuses on completeness.</td><td>Legal discovery, patent search, and medical research.</td></tr>\n          <tr><td><strong>MAP (Mean Average Precision)</strong></td><td>Average of precision scores at each relevant document rank across queries.</td><td>Binary relevance evaluations across diverse query sets.</td></tr>\n          <tr><td><strong>NDCG@K</strong></td><td><code>DCG_K / IDCG_K</code> where <code>DCG = Σ (2^relᵢ - 1) / log₂(i + 1)</code>.</td><td><strong>The Gold Standard:</strong> Evaluates graded relevance (0-4 stars) with position discounting.</td></tr>\n        </tbody>\n      </table>\n\n      <h2>Under the Hood: Interleaving A/B Testing</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph TraditionalAB [\"Traditional A/B Test (High Variance: large samples needed)\"]\n      U1[\"50% Users -> Model A\"]\n      U2[\"50% Users -> Model B\"]\n    end\n\n    subgraph Interleaving [\"Team-Draft Interleaving (roughly 10x to 100x+ fewer users, setting-dependent)\"]\n      Q[\"User Query\"] --> Interleaver[\"Team-Draft Interleaver\"]\n      Interleaver --> Combined[\"Rank 1: Model A #1<br/>Rank 2: Model B #1<br/>Rank 3: Model A #2<br/>Rank 4: Model B #2\"]\n      Combined --> ClickTelemetry[\"Detect which algorithm's items won the user's click!\"]\n    end\n      </div>\n      <p>Interleaving blends the top results of Model A and Model B into a single merged result list presented to every user. Because every user sees both rankers, between-user variance largely cancels out, and published results (Netflix, Bing, Airbnb) report detecting ranker preferences with roughly 10x to over 100x less traffic, depending on the setting.</p>\n    \n<!-- enriched -->\n<h2>Worked example: scoring one ranking five ways</h2>\n<p>A query returns five results with graded relevance (0 to 3) of <strong>[3, 2, 3, 0, 1]</strong>. Assume these four relevant documents are all the relevant ones that exist.</p>\n<table><thead><tr><th>Metric</th><th>Computation</th><th>Value</th></tr></thead><tbody>\n<tr><td>Precision@5, relevant = grade 1 or more</td><td>4 relevant out of 5</td><td>0.80</td></tr>\n<tr><td>Recall@5</td><td>4 of 4 relevant found</td><td>1.00</td></tr>\n<tr><td>Reciprocal rank</td><td>First relevant at position 1</td><td>1.00</td></tr>\n<tr><td>Average precision</td><td>Mean of P@1, P@2, P@3, P@5 = 1, 1, 1, 0.8</td><td>0.95</td></tr>\n<tr><td>NDCG@5</td><td>DCG 12.78 divided by ideal DCG 13.35</td><td>0.96</td></tr>\n</tbody></table>\n<p>DCG uses gain 2 to the power rel minus 1, divided by log2 of position plus 1: 7/1 + 3/1.585 + 7/2 + 0 + 1/2.585 = 12.78. The ideal order [3, 3, 2, 1, 0] gives 7 + 4.42 + 1.5 + 0.43 = 13.35. The only loss is that a grade-3 document sits at position 3 instead of 2, so NDCG is high but not perfect.</p>\n<h2>Online vs offline evaluation</h2>\n<table><thead><tr><th>Method</th><th>Needs</th><th>Strength</th><th>Weakness</th></tr></thead><tbody>\n<tr><td>Offline judged set</td><td>Human labels for a few thousand queries</td><td>Fast iteration, repeatable</td><td>Labels age; misses user behaviour</td></tr>\n<tr><td>A/B test</td><td>Traffic split, business metric</td><td>Measures real outcomes</td><td>Needs large samples, takes days or weeks</td></tr>\n<tr><td>Interleaving</td><td>Merged result lists</td><td>Detects ranking preference with far less traffic</td><td>Tells you which ranker users prefer, not by how much revenue</td></tr>\n</tbody></table>\n<p>Netflix and Microsoft Bing have both published results showing interleaving detects ranker differences with one to two orders of magnitude less traffic than a conventional A/B test, which is why teams use it as a fast pre-screen before a full A/B launch.</p><h2>Choosing a metric</h2><p>Use NDCG@10 when you have graded labels and care about the first page; MRR for navigational queries where one right answer exists, such as \"gmail login\"; Recall@1000 to evaluate the first retrieval stage of a two-stage system, since the re-ranker cannot fix documents that were never retrieved; and business metrics such as conversion or successful sessions to decide launches. Report confidence intervals: a 0.5 point NDCG gain on 200 queries is often noise.</p>\n</div>",
    "keyTakeaways": [
      "NDCG (Normalized Discounted Cumulative Gain) is the gold standard metric for graded relevance rankings.",
      "Precision@K measures top-slot purity; Recall@K measures corpus coverage.",
      "Interleaved A/B testing blends candidate rankings to detect statistically significant user preference with far fewer queries than traditional A/B testing (see: Radlinski & Craswell, 'Comparing the Sensitivity of Information Retrieval Metrics', SIGIR 2010)."
    ],
    "furtherReading": [
      {
        "title": "Chapelle et al.: Large-scale Validation and Analysis of Interleaved Search Evaluation (ACM TOIS, 2012)",
        "url": "https://dl.acm.org/doi/10.1145/2094072.2094078"
      },
      {
        "title": "Manning et al.: Evaluation in Information Retrieval (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-in-information-retrieval-1.html"
      },
      {
        "title": "Wikipedia: Normalized Discounted Cumulative Gain (NDCG)",
        "url": "https://en.wikipedia.org/wiki/Discounted_cumulative_gain"
      }
    ]
  },
  "search-index-synchronization": {
    "title": "Search index synchronization",
    "video": {
      "youtubeId": "Yo7yEqFva40",
      "title": "Enabling Full-text Search with Change Data Capture - Frantisek Hartman",
      "channel": "Official Elastic Community",
      "why": "Directly about streaming database changes into Elasticsearch with Debezium and Kafka, including ordering and reindexing concerns.",
      "length": "33:41"
    },
    "videos": [
      {
        "youtubeId": "PuZvF2EyfBM",
        "title": "Elasticsearch Deep Dive w/ a Ex-Meta Senior Manager for System Design Interviews",
        "channel": "Hello Interview",
        "role": "interview",
        "why": "Explains refresh, near-real-time visibility and why Elasticsearch should not be the primary store, in an interview framing.",
        "length": "44:03"
      },
      {
        "youtubeId": "fU9hR3kiOK0",
        "title": "\"Turning the database inside out with Apache Samza\" by Martin Kleppmann",
        "channel": "Strange Loop Conference",
        "role": "deep-dive",
        "why": "Kleppmann’s classic argument for deriving indexes and caches from an ordered change log instead of dual writes.",
        "length": "47:43"
      }
    ],
    "intuition": "<p>Think of a shop's price tags and its accounting ledger. The ledger is the truth; the tags on the shelves are a copy customers see. If a clerk updates tags by hand whenever they remember, tags drift. If instead every ledger entry automatically prints a new tag in order, the shelves are always a few seconds behind but never wrong for long.</p>\n<p><strong>Mental model:</strong> the search index is a <em>derived view</em> of the database, rebuilt from an <em>ordered change stream</em> (CDC). Correctness comes from ordering and idempotency, not from trying to write two systems at once.</p>\n<ul>\n<li><strong>Trap:</strong> dual writes from the application (write DB, then write Elasticsearch). A crash between the two leaves them permanently inconsistent.</li>\n<li><strong>Trap:</strong> applying updates in arrival order. Use a source version with external versioning so an old event can never overwrite a newer one.</li>\n<li><strong>Trap:</strong> forgetting deletes. A delete must carry a version too, or a late update resurrects the document.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>The Synchronization Challenge: Near-Real-Time (NRT) Indexing</h2>\n      <p>Primary transactional records live in relational or NoSQL databases (PostgreSQL, DynamoDB, MongoDB), while read queries target Elasticsearch or OpenSearch. Keeping the search index synchronized with the primary database under high write volumes presents severe race conditions and consistency challenges.</p>\n\n      <h2>CDC Pipeline with Debezium and Kafka</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    App[\"Merchant Service\"] -->|\"1. ACID Write: UPDATE products\"| DB[(\"PostgreSQL Primary DB\")]\n    DB -->|\"2. Write-Ahead Log (WAL)\"| CDC[\"Debezium Change Data Capture (CDC)\"]\n    CDC -->|\"3. Stream Mutation Event\"| Kafka[(\"Kafka Topic: catalog.updates\")]\n    \n    Kafka --> SyncWorker[\"Index Sync Worker\"]\n    SyncWorker -->|\"4. Batch Bulk Index API (100 items / 500ms)\"| ES[(\"Elasticsearch Cluster\")]\n    \n    subgraph LuceneEngine [\"Inside Elasticsearch Node\"]\n      ES --> Buffer[\"In-Memory Indexing Buffer\"]\n      Buffer -->|\"5. refresh_interval: 1s\"| Segment[\"New In-Memory Searchable Segment (NRT)\"]\n      Segment -->|\"6. Flush: Lucene commit (translog is fsynced per request for durability)\"| DiskStorage[(\"Persistent Disk\")]\n    end\n      </div>\n\n      <h2>Under the Hood: Solving Out-of-Order Updates</h2>\n      <p>Because Kafka partitions are processed by concurrent worker threads, network delays can cause an older update (V₁) to arrive <em>after</em> a newer update (V₂). If the worker naively writes V₁, the search index is left with permanently corrupted stale data.</p>\n      <p><strong>Source revisions and Elasticsearch concurrency tokens are different tools.</strong> A CDC event can carry a source-owned, strictly monotonic revision and use external versioning where supported. Elasticsearch's <code>_seq_no</code> and <code>_primary_term</code> are assigned by Elasticsearch and can guard a read-modify-write against the version already observed there; they are not primary-database sequence numbers. Wall-clock timestamps are unsafe unless the source guarantees monotonic, unique ordering. Whichever mechanism is used, deletes and updates must share one ordering rule.</p>\n    \n<!-- enriched -->\n<h2>Worked example: the out-of-order update</h2>\n<p>Product 42 changes price twice in quick succession. The database commits version 6 (price 20) then version 7 (price 18). Because of a retry, the sync worker receives version 7 first and version 6 second.</p>\n<table><thead><tr><th>Step</th><th>Naive worker</th><th>Worker with external versioning</th></tr></thead><tbody>\n<tr><td>Receive v7, price 18</td><td>Index price 18</td><td>Index with version 7; accepted</td></tr>\n<tr><td>Receive v6, price 20</td><td>Index price 20, now stale forever</td><td>Rejected with a version conflict because 6 is not greater than 7</td></tr>\n<tr><td>Final state</td><td>Wrong</td><td>Correct</td></tr>\n</tbody></table>\n<p>The version must be source-owned and monotonic per document, for example a row version column, or a log sequence number from the WAL. Elasticsearch supports this with <code>version_type=external</code>. Deletes also need versions; Elasticsearch keeps delete tombstones for <code>index.gc_deletes</code>, 60 seconds by default, so a very late update after that window can still resurrect a deleted document unless the pipeline guards against it.</p>\n<h2>Sync strategies compared</h2>\n<table><thead><tr><th>Strategy</th><th>Consistency</th><th>Complexity</th><th>When it fits</th></tr></thead><tbody>\n<tr><td>Application dual write</td><td>Can diverge permanently on partial failure</td><td>Low</td><td>Prototypes only</td></tr>\n<tr><td>Transactional outbox</td><td>Eventually consistent, ordered per aggregate</td><td>Medium</td><td>When you control the app schema</td></tr>\n<tr><td>Log-based CDC such as Debezium</td><td>Eventually consistent, commit order</td><td>Medium to high</td><td>Multiple consumers, legacy apps</td></tr>\n<tr><td>Periodic batch reindex</td><td>Stale by the batch interval</td><td>Low</td><td>Small catalogues, nightly freshness</td></tr>\n</tbody></table>\n<h2>Rebuilding without downtime</h2>\n<ol>\n<li>Create a new index, for example products_v2, with the new mapping.</li>\n<li>Record the current CDC offset, then bulk-load a snapshot into products_v2.</li>\n<li>Replay CDC from the recorded offset until lag is near zero; versioning makes the overlap safe.</li>\n<li>Atomically switch the read alias from products_v1 to products_v2, keep v1 for rollback.</li>\n</ol>\n<p><strong>Latency math:</strong> with a 500 ms bulk batch, Kafka lag near zero and a 1 s refresh interval, new writes typically become searchable in about 1 to 3 seconds. Setting <code>refresh_interval</code> lower increases segment churn and merge cost.</p>\n</div>",
    "keyTakeaways": [
      "Use CDC (Debezium + Kafka) to tail database WAL logs and stream updates asynchronously to Elasticsearch.",
      "Elasticsearch refresh_interval (default 1s) delivers Near-Real-Time searchability by creating in-memory Lucene segments.",
      "Use a source-owned monotonic revision or Elasticsearch's own observed concurrency tokens correctly; do not conflate source versions with <code>_seq_no</code>/<code>_primary_term</code>."
    ],
    "furtherReading": [
      {
        "title": "Elasticsearch Guide: Optimistic Concurrency Control",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/optimistic-concurrency-control.html"
      },
      {
        "title": "Kreps et al.: Kafka: a Distributed Messaging System for Log Processing (NetDB Workshop)",
        "url": "https://notes.stephenholiday.com/Kafka.pdf"
      },
      {
        "title": "Elasticsearch Guide: Near Real-Time Search (Official Documentation)",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/near-real-time.html"
      }
    ]
  },
  "search-index-sharding": {
    "title": "Search index sharding",
    "video": {
      "youtubeId": "eQ3eNd5WbH8",
      "title": "How indexes work in Distributed Databases, their trade-offs, and challenges",
      "channel": "Arpit Bhayani",
      "why": "Explains local (document-partitioned) vs global (term-partitioned) indexes and their scatter-gather and write costs, the central trade-off of this unit.",
      "length": "16:21"
    },
    "videos": [
      {
        "youtubeId": "NxpZyQVO0K4",
        "title": "What are Elasticsearch shards? Why do they matter? Elasticsearch cluster architecture explained.",
        "channel": "George Bridgeman",
        "role": "intro",
        "why": "Clear visual explanation of primary and replica shards, routing and sizing in Elasticsearch.",
        "length": "16:57"
      },
      {
        "youtubeId": "cpsgAQFkhCE",
        "title": "Elasticsearch Under the Hood - Philipp Krenn - NDC Copenhagen 2022",
        "channel": "NDC Conferences",
        "role": "deep-dive",
        "why": "Elastic engineer demonstrates query-then-fetch, per-shard scoring statistics and why shard count changes results.",
        "length": "57:55"
      }
    ],
    "intuition": "<p>Picture a library that outgrew one building. Option one: split the books across branches, each with its own complete card catalogue. To find everything on \"Raft\", you phone every branch and merge their answers. Option two: split the catalogue alphabetically, A to G in one branch. Now a single-word lookup hits one branch, but adding a new book means updating many branches.</p>\n<p><strong>Mental model:</strong> <em>document partitioning</em> makes writes local and reads scatter-gather; <em>term partitioning</em> makes single-term reads local and writes scatter. Nearly every production search engine chooses document partitioning.</p>\n<ul>\n<li><strong>Trap:</strong> over-sharding. Thousands of tiny shards waste heap and make every query fan out further. Aim for shards in the tens of gigabytes.</li>\n<li><strong>Trap:</strong> ignoring tail latency. A query is as slow as its slowest shard.</li>\n<li><strong>Trap:</strong> deep pagination. Page 1,000 forces every shard to return its top 10,000; use search_after or a scroll-style cursor instead.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Distributing Inverted Indexes Across Clusters</h2>\n      <p>When an index grows to hundreds of gigabytes or billions of documents, it must be partitioned across multiple machines. In search systems, partitioning is called <strong>Sharding</strong>. Each Elasticsearch shard is a fully functional, self-contained Apache Lucene instance.</p>\n\n      <h2>Document-Based Sharding: Scatter-Gather Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client: Search('shoes', size=10)\"] --> Coord[\"Coordinating Node (Envoy / ES Node)\"]\n    \n    subgraph Shards [\"Distributed Shard Fleet\"]\n      Coord -->|\"Broadcast Query\"| S1[\"Shard 1: Searches local Lucene index -> Returns top 10\"]\n      Coord -->|\"Broadcast Query\"| S2[\"Shard 2: Searches local Lucene index -> Returns top 10\"]\n      Coord -->|\"Broadcast Query\"| S3[\"Shard 3: Searches local Lucene index -> Returns top 10\"]\n    end\n    \n    S1 & S2 & S3 -->|\"Return Doc IDs + BM25 Scores\"| Coord\n    Coord -->|\"Merge Sort 30 candidates -> Extract Top 10\"| Fetch[\"Fetch Phase: Fetch full _source for top 10 docs\"]\n    Fetch --> Client\n      </div>\n\n      <h2>Document Partitioning vs Term Partitioning</h2>\n      <table>\n        <thead>\n          <tr><th>Strategy</th><th>Document Partitioning (Scatter-Gather)</th><th>Term Partitioning</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Partition Logic</strong></td><td>Documents are hashed to shards by DocID: <code>shard = Murmur3(id) % N</code>. Each shard contains all terms for its subset of documents.</td><td>Vocabulary is split across shards: Shard 1 holds \"a\"-\"g\", Shard 2 holds \"h\"-\"p\".</td></tr>\n          <tr><td><strong>Ingest Speed</strong></td><td><strong>Fast & Local:</strong> Document is indexed entirely on a single shard with zero network coordination.</td><td>Slow: Indexing a single document requires network RPCs to scatter words across all shards.</td></tr>\n          <tr><td><strong>Query Execution</strong></td><td>Requires <strong>Scatter-Gather</strong> across all <code>N</code> shards.</td><td>Multi-term queries require network joins across term shards.</td></tr>\n        </tbody>\n      </table>\n      <p><strong>Custom Routing for Multi-Tenancy:</strong> In SaaS platforms, querying every shard for a single customer is wasteful. Setting <code>routing=tenant_id</code> forces all documents belonging to tenant 42 into a single shard, converting a global scatter-gather into a single-shard targeted seek.</p>\n    \n<!-- enriched -->\n<h2>Worked example: sizing a cluster</h2>\n<p>You must index 2 billion documents averaging 1.5 KB of indexed data each: about 3 TB of primary data.</p>\n<ul>\n<li>Elastic's guidance is shards of roughly 10 to 50 GB. At about 40 GB per shard, 3 TB needs about 75 shards; choose 80 primaries.</li>\n<li>One replica each gives 160 shards, which spreads well over, say, 20 data nodes at 8 shards per node.</li>\n<li>Primary shard count is fixed at index creation, so plan for growth, or use time-based indices, rollover, or the split API.</li>\n</ul>\n<h2>Worked example: why fan-out hurts the tail</h2>\n<p>If each shard independently exceeds its own p99 latency 1 percent of the time, a query touching 80 shards waits on at least one slow shard with probability 1 minus 0.99 to the power 80, about 55 percent. So the per-shard p99 becomes roughly your median. Mitigations: fewer, larger shards; adaptive replica selection, which Elasticsearch enables by default; hedged requests; and routing to reduce fan-out.</p>\n<h2>Worked example: deep pagination</h2>\n<p>Request <code>from=10000, size=10</code> over 80 shards. Each shard must return its top 10,010 hits, and the coordinator merges 800,800 entries to keep 10. Elasticsearch caps this with <code>index.max_result_window</code>, 10,000 by default. <code>search_after</code> avoids it by passing the last sort key, so each shard returns only 10.</p>\n<h2>Routing trade-offs</h2>\n<table><thead><tr><th>Routing</th><th>Query fan-out</th><th>Risk</th></tr></thead><tbody>\n<tr><td>Hash of document ID, the default</td><td>All shards</td><td>Even load, but every query scatters</td></tr>\n<tr><td>Custom routing by tenant ID</td><td>One shard per tenant</td><td>A huge tenant creates a hot shard; mitigate with routing partitions spanning several shards</td></tr>\n<tr><td>Index per tenant or per time window</td><td>Only relevant indices</td><td>Too many small indices; cluster state overhead</td></tr>\n</tbody></table>\n<p><strong>Scoring subtlety:</strong> each shard computes IDF from its own documents, so small or skewed shards can rank the same document differently. The DFS query-then-fetch mode gathers global term statistics first, at the cost of an extra round trip.</p>\n</div>",
    "keyTakeaways": [
      "Elasticsearch uses Document Partitioning where each shard is a standalone Lucene index.",
      "Queries execute via a two-phase Query-Then-Fetch scatter-gather coordination across all shards.",
      "Custom routing keys isolate tenant data to specific shards, eliminating cluster-wide scatter-gather overhead."
    ],
    "furtherReading": [
      {
        "title": "Elastic Docs: Size Your Shards",
        "url": "https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards"
      },
      {
        "title": "Elastic Docs: Clusters, Nodes, and Shards",
        "url": "https://www.elastic.co/docs/deploy-manage/distributed-architecture/clusters-nodes-shards"
      },
      {
        "title": "Dean & Ghemawat: MapReduce: Simplified Data Processing on Large Clusters (USENIX OSDI, 2004)",
        "url": "https://www.usenix.org/legacy/events/osdi04/tech/full_papers/dean/dean.pdf"
      }
    ]
  },
  "crawler-and-indexing-pipeline": {
    "title": "Crawler and indexing pipeline",
    "video": {
      "youtubeId": "krsuaUp__pM",
      "title": "Design a Web Crawler System Design Interview w/ a Ex-Meta Staff Engineer",
      "channel": "Hello Interview",
      "why": "Thorough design of frontier, politeness, fault tolerance, deduplication and scaling estimates, covering this unit end to end.",
      "length": "1:05:04"
    },
    "videos": [
      {
        "youtubeId": "6u25GckPhLU",
        "title": "Design a Web Crawler: FAANG Interview Question",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Quick animated overview of the crawler components before the long walkthrough.",
        "length": "5:41"
      },
      {
        "youtubeId": "gnraT4N43qo",
        "title": "LSH.12 Simhash algorithm",
        "channel": "Victor Lavrenko",
        "role": "deep-dive",
        "why": "Concise lecture on how SimHash produces fingerprints where similar documents differ in few bits.",
        "length": "4:42"
      },
      {
        "youtubeId": "iGguggoNZ1E",
        "title": "How Googlebot Crawls the Web",
        "channel": "Google Search Central",
        "role": "case-study",
        "why": "Google’s own engineers explain crawl scheduling, host load limits and rendering in the real Googlebot.",
        "length": "32:42"
      }
    ],
    "intuition": "<p>Imagine a survey team visiting every house in a country. They keep a to-do list of addresses (the frontier), never knock on the same street too often (politeness), skip houses they have already visited (URL dedup), and notice when two houses are identical show homes (content dedup). A crawler is that team, running at thousands of pages per second.</p>\n<p><strong>Mental model:</strong> a crawler is a <em>prioritised, rate-limited BFS over the web graph</em>, with two dedup filters: one on URLs before fetching and one on content after fetching.</p>\n<ul>\n<li><strong>Trap:</strong> a single global FIFO queue. It lets one site dominate and gets you blocked; you need per-host queues with delays.</li>\n<li><strong>Trap:</strong> ignoring crawler traps such as infinite calendars and session IDs in URLs. Normalise URLs and cap depth per host.</li>\n<li><strong>Trap:</strong> exact-hash content dedup only. Pages that differ by a timestamp or ad slot are near duplicates; SimHash or MinHash catches them.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Harvesting the Web at Scale</h2>\n      <p>A web crawler (like Googlebot) systematically navigates the World Wide Web to discover, download, and index billions of web pages. Operating at this scale requires solving polite crawling, infinite URL traps, duplicate page detection, and high-throughput HTML extraction.</p>\n\n      <h2>The Mercator Web Crawler Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Seed[\"Seed URLs\"] --> Frontier[\"URL Frontier (Priority & Politeness Queues)\"]\n    Frontier --> Fetcher[\"Async Fetcher Fleet (DNS Cache + HTTP/2 Client)\"]\n    Fetcher --> DedupeDoc{\"Doc Seen Before? (SimHash 64-Bit)\"}\n    \n    DedupeDoc -->|\"Duplicate\"| Drop[\"Discard Payload\"]\n    DedupeDoc -->|\"New Content\"| Parse[\"HTML Parser & Content Extractor\"]\n    \n    Parse --> IndexPipeline[(\"Search Ingestion Pipeline\")]\n    Parse --> LinkExtractor[\"Extract New URLs\"]\n    LinkExtractor --> Filter{\"Seen URL? (Bloom Filter)\"}\n    Filter -->|\"New URL\"| Frontier\n      </div>\n\n      <h2>Under the Hood: Key Engineering Mechanisms</h2>\n      <ul>\n        <li><strong>Politeness Queues:</strong> Flooding a web host with 1,000 requests per second is a Denial of Service attack. The URL Frontier maintains a separate queue per host domain, strictly enforcing a delay (e.g. 500ms) between consecutive requests to the same IP.</li>\n        <li><strong>Near-Duplicate Detection (SimHash):</strong> Web pages often have identical text with minor differences (timestamps, copyright footers, ads). <strong>SimHash</strong> maps 10,000-word documents to a 64-bit fingerprint where small text changes produce small Hamming distances (differing by ≤ 3 bits), giving compact fingerprints that enable efficient near-duplicate lookup (finding all fingerprints within 3 bits needs several permuted, sorted tables, not a single hash probe).</li>\n        <li><strong>DNS Resolution Bottlenecks:</strong> Standard OS DNS lookups block worker threads. Large-scale crawlers maintain in-memory asynchronous DNS caches with custom TTLs to bypass global DNS roundtrips.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: back-of-envelope for 1 billion pages per month</h2>\n<table><thead><tr><th>Quantity</th><th>Calculation</th><th>Result</th></tr></thead><tbody>\n<tr><td>Fetch rate</td><td>1,000,000,000 divided by 2,592,000 seconds in 30 days</td><td>about 390 pages per second</td></tr>\n<tr><td>Bandwidth</td><td>390 x 100 KB average page</td><td>about 39 MB/s, roughly 310 Mbit/s</td></tr>\n<tr><td>Raw storage</td><td>1 billion x 100 KB</td><td>about 100 TB per month before compression</td></tr>\n<tr><td>Concurrent hosts needed</td><td>390 pages/s with 1 request every 2 s per host</td><td>at least about 780 hosts in flight</td></tr>\n</tbody></table>\n<h2>Worked example: sizing the URL-seen Bloom filter</h2>\n<p>For n = 10 billion URLs at a 1 percent false-positive rate, the optimal size is n x ln(1/p) divided by (ln 2) squared, about 9.6 bits per URL: roughly 96 billion bits, or 12 GB, with about 7 hash functions. A false positive means a new URL is wrongly skipped, which is acceptable for a crawler; a false negative cannot happen. Plain Bloom filters cannot delete entries, so recrawl scheduling is kept in a separate store keyed by URL.</p>\n<h2>SimHash in practice</h2>\n<p>Google's 2007 paper by Manku, Jain and Das Sarma used 64-bit SimHash fingerprints on about 8 billion pages and treated fingerprints differing in at most 3 bits as near duplicates. Finding all fingerprints within 3 bits is not a single hash lookup: they stored several permuted, sorted copies of the fingerprint table so that any match must agree exactly on some high-order block, turning the search into a few table probes.</p>\n<h2>Design choices</h2>\n<table><thead><tr><th>Choice</th><th>Option A</th><th>Option B</th></tr></thead><tbody>\n<tr><td>Frontier storage</td><td>In-memory queues, fast, lost on crash</td><td>Kafka or a disk-backed queue, durable, slightly slower</td></tr>\n<tr><td>Rendering</td><td>Raw HTML only, cheap</td><td>Headless browser for JavaScript sites, 10x or more CPU per page</td></tr>\n<tr><td>Recrawl policy</td><td>Uniform interval</td><td>Adaptive, based on observed change rate and page importance</td></tr>\n</tbody></table>\n<p>Always honour robots.txt, cache it per host with a TTL, and back off on HTTP 429 and 503 responses.</p>\n</div>",
    "keyTakeaways": [
      "The URL Frontier enforces politeness by isolating queues per target host domain with strict rate delays.",
      "SimHash computes compact 64-bit fingerprints that enable efficient near-duplicate lookup via permuted, sorted fingerprint tables.",
      "Bloom filters track billions of previously seen URLs in a few gigabytes of RAM."
    ],
    "furtherReading": [
      {
        "title": "Heydon & Najork: Mercator: A Scalable, Extensible Web Crawler (World Wide Web, 1999)",
        "url": "https://link.springer.com/article/10.1023/A:1019213109274"
      },
      {
        "title": "Olston & Najork: Web Crawling (Foundations and Trends in IR, 2010)",
        "url": "https://www.emerald.com/ftinr/article-abstract/4/3/175/1328663/Web-Crawling"
      },
      {
        "title": "Manning et al.: Web Crawling and Indexes (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/web-crawling-and-indexes-1.html"
      }
    ]
  },
  "vector-search-and-hybrid-retrieval": {
    "title": "Vector search and hybrid retrieval",
    "video": {
      "youtubeId": "77QH0Y2PYKg",
      "title": "Vector Database Search - Hierarchical Navigable Small Worlds (HNSW) Explained",
      "channel": "DataMListic",
      "why": "Clear, focused visual explanation of HNSW layers and greedy search, the core index this unit teaches.",
      "length": "8:03"
    },
    "videos": [
      {
        "youtubeId": "QvKMwLjdK-s",
        "title": "HNSW for Vector Search Explained and Implemented with Faiss (Python)",
        "channel": "James Briggs",
        "role": "deep-dive",
        "why": "Goes from skip lists and navigable small worlds to HNSW parameters M and ef, with recall vs speed measurements in Faiss.",
        "length": "34:35"
      },
      {
        "youtubeId": "2uBcjEecr38",
        "title": "What is reciprocal rank fusion in hybrid search?",
        "channel": "Abhishek Thakur",
        "role": "intro",
        "why": "Short explanation of combining BM25 and vector rankings with RRF, the hybrid half of this unit.",
        "length": "7:52"
      }
    ],
    "intuition": "<p>BM25 is a librarian who matches exact words on the spine. Vector search is a librarian who has read everything and places books by meaning on a giant map, so \"dog vet\" and \"canine clinic\" sit next to each other. The first one fails on paraphrases; the second fails on exact part numbers. Hybrid search asks both and merges their lists.</p>\n<p><strong>Mental model:</strong> embeddings turn text into points; <em>approximate nearest neighbour</em> indexes such as HNSW find close points without comparing against all of them; <em>rank fusion</em> combines lexical and semantic results without having to calibrate their incompatible scores.</p>\n<ul>\n<li><strong>Trap:</strong> assuming ANN is exact. HNSW trades recall for speed; you tune <code>ef_search</code> to reach, say, 95 percent recall.</li>\n<li><strong>Trap:</strong> adding raw BM25 and cosine scores. They are on different scales; use rank-based fusion or learned normalisation.</li>\n<li><strong>Trap:</strong> ignoring memory. HNSW wants vectors and graph in RAM; at hundreds of millions of vectors, quantisation is usually required.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>The Semantic Revolution: Lexical vs Vector Search</h2>\n      <p>BM25 matches literal keywords. If a user searches for <em>\"canine wellness clinic\"</em>, BM25 fails to match a document titled <em>\"dog veterinarian hospital\"</em> because zero vocabulary terms overlap. <strong>Vector Search</strong> maps text into dense high-dimensional semantic vector spaces (e.g. 1536-dimensional embeddings generated by neural models) where semantically similar concepts cluster together.</p>\n\n      <h2>HNSW (Hierarchical Navigable Small World) Graph Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph HNSWGraph [\"Hierarchical Navigable Small World Graph (Skip-List for Vectors)\"]\n      Layer2[\"Layer 2: Sparse Long-Range Highway Links (Rapid Skip)\"]\n      Layer1[\"Layer 1: Medium Density Links\"]\n      Layer0[\"Layer 0: Dense Base Graph (All Vectors)\"]\n      \n      Layer2 --> Layer1 --> Layer0\n    end\n\n    QueryVec[\"Query Vector\"] -->|\"1. Greedy Entry at Layer 2\"| Layer2\n    Layer0 -->|\"2. Return K-Nearest Neighbors\"| TopK[\"Top K Semantic Matches\"]\n      </div>\n\n      <h2>Under the Hood: Hybrid Search Fusion (RRF)</h2>\n      <p>Vector search excels at broad semantic concept matching but frequently fails on exact keyword identifiers (e.g. part numbers like <code>\"GTX-4090-TI\"</code> or specific product codes). The industry gold standard is <strong>Hybrid Search</strong>, combining lexical BM25 and dense vector search using <strong>Reciprocal Rank Fusion (RRF)</strong>:</p>\n      <pre><code>RRF_Score(d) = sum_{m in Models} ( 1 / (60 + Rank_m(d)) )</code></pre>\n      <p>RRF normalizes disparate scoring scales into rank positions, ensuring that documents ranking well across both keyword matching and semantic embedding models float to the top.</p>\n    \n<!-- enriched -->\n<h2>Worked example: memory for 100 million vectors</h2>\n<table><thead><tr><th>Component</th><th>Calculation</th><th>Size</th></tr></thead><tbody>\n<tr><td>Raw float32 vectors, 768 dimensions</td><td>100,000,000 x 768 x 4 bytes</td><td>about 307 GB</td></tr>\n<tr><td>HNSW base-layer links, M = 16</td><td>2M = 32 neighbours x 4 bytes x 100,000,000</td><td>about 12.8 GB, upper layers add a little more</td></tr>\n<tr><td>Product-quantised codes, 96 bytes per vector</td><td>100,000,000 x 96 bytes</td><td>about 9.6 GB</td></tr>\n<tr><td>int8 scalar quantisation</td><td>100,000,000 x 768 x 1 byte</td><td>about 77 GB</td></tr>\n</tbody></table>\n<p>This is why large deployments shard vectors across many nodes and use quantised vectors for the graph search, then re-score the top few hundred candidates with full-precision vectors.</p>\n<h2>Worked example: reciprocal rank fusion</h2>\n<p>RRF score = sum over rankers of 1 divided by (60 + rank).</p>\n<table><thead><tr><th>Doc</th><th>BM25 rank</th><th>Vector rank</th><th>RRF score</th></tr></thead><tbody>\n<tr><td>X</td><td>1</td><td>20</td><td>1/61 + 1/80 = 0.0289</td></tr>\n<tr><td>Y</td><td>5</td><td>3</td><td>1/65 + 1/63 = 0.0313</td></tr>\n<tr><td>Z</td><td>2</td><td>not returned</td><td>1/62 = 0.0161</td></tr>\n</tbody></table>\n<p>Y, which both systems like, wins over X, which only BM25 loves. The constant 60 comes from the original RRF paper (Cormack, Clarke and Buettcher, 2009) and dampens the advantage of a single first-place rank.</p>\n<h2>ANN index trade-offs</h2>\n<table><thead><tr><th>Index</th><th>Speed and recall</th><th>Memory</th><th>Updates</th></tr></thead><tbody>\n<tr><td>Flat, brute force</td><td>Exact, slow at scale</td><td>Vectors only</td><td>Trivial</td></tr>\n<tr><td>HNSW</td><td>Excellent recall at low latency</td><td>Vectors plus graph, highest</td><td>Inserts fine; deletes are usually tombstoned</td></tr>\n<tr><td>IVF with PQ</td><td>Good, tunable via nprobe</td><td>Very compact</td><td>Needs training; periodic retraining</td></tr>\n<tr><td>DiskANN-style graphs</td><td>Good, SSD-resident</td><td>Small RAM footprint</td><td>More complex</td></tr>\n</tbody></table>\n<p><strong>Filtering pitfall:</strong> applying a restrictive filter such as tenant or in-stock after ANN search can leave too few results; engines such as Elasticsearch, OpenSearch, Vespa and Weaviate implement filtered HNSW traversal or fall back to exact search when the filter is very selective.</p><h2>Tuning knobs that matter</h2><p>For HNSW, <code>M</code> controls graph degree (memory and recall), <code>ef_construction</code> controls build quality, and <code>ef_search</code> controls the query-time candidate list. Raising ef_search from 40 to 200 commonly lifts recall at 10 from around 0.9 into the high 0.9s at a few times the latency. Measure recall against exact brute-force results on a sample of real queries, not synthetic ones.</p>\n</div>",
    "keyTakeaways": [
      "Vector search captures conceptual meaning, overcoming the vocabulary mismatch limitations of lexical search.",
      "HNSW trades memory and build cost for approximate-neighbor latency and recall; validate both under the deployed corpus, filters, and concurrency.",
      "Hybrid search combines lexical BM25 and vector retrieval using Reciprocal Rank Fusion (RRF) for optimal accuracy."
    ],
    "furtherReading": [
      {
        "title": "Malkov & Yashunin: Efficient and Robust Approximate Nearest Neighbor Search Using HNSW",
        "url": "https://arxiv.org/abs/1603.09320"
      },
      {
        "title": "Johnson, Douze, Jégou: Billion-scale Similarity Search with GPUs (IEEE Big Data)",
        "url": "https://arxiv.org/abs/1702.08734"
      },
      {
        "title": "Elasticsearch: Approximate Nearest Neighbor Search (Official Documentation)",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html"
      }
    ]
  },
  "autocomplete-system-design": {
    "title": "Design: autocomplete",
    "video": {
      "youtubeId": "MCKX3n4-UR4",
      "title": "6: Typeahead Suggestion + Google Search Bar | Systems Design Interview Questions With Ex-Google SWE",
      "channel": "Jordan has no life",
      "why": "Deep interview treatment of tries with precomputed top-K, sharding by prefix, offline aggregation and caching.",
      "length": "42:08"
    },
    "videos": [
      {
        "youtubeId": "us0qySiUsGU",
        "title": "System design : Design Autocomplete or Typeahead Suggestions for Google search",
        "channel": "Tushar Roy - Coding Made Simple",
        "role": "interview",
        "why": "Classic, clearly drawn whiteboard design of the trie, aggregation pipeline and serving path.",
        "length": "19:42"
      },
      {
        "youtubeId": "eyJSqrxwwGU",
        "title": "Designing a Query Auto Completion System",
        "channel": "Data Science Gems",
        "role": "case-study",
        "why": "Amazon research presentation on how a production query auto-completion system generates and ranks candidates.",
        "length": "30:36"
      }
    ],
    "intuition": "<p>Think of a barista who knows the regulars. As soon as you say \"flat\", they already have \"flat white\" ready, because they worked out yesterday what people who start with \"flat\" usually order. Autocomplete works the same way: the thinking happens offline; at keystroke time you only look up a prepared answer.</p>\n<p><strong>Mental model:</strong> <em>prefix to precomputed top-K list</em>, rebuilt periodically from query logs and served from memory. The lookup costs about the length of the prefix, not the size of the vocabulary.</p>\n<ul>\n<li><strong>Trap:</strong> doing a DFS under the prefix node at query time. It is far too slow for short, popular prefixes such as \"s\".</li>\n<li><strong>Trap:</strong> writing to the trie on every search. Updates go through a batch or streaming aggregation, then an atomic swap.</li>\n<li><strong>Trap:</strong> forgetting safety. Offensive, personal or legally sensitive completions must be filtered before publishing a new build.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>The Latency SLA of Autocomplete</h2>\n      <p>Search autocomplete (typeahead) displays the top 5 to 10 suggested queries as the user types each keystroke. Because humans type at ~300ms intervals, suggestions should appear within roughly <strong>100 milliseconds</strong> of a keystroke end to end, which leaves the server-side lookup a budget well under 10 ms because network round trips dominate.</p>\n\n      <h2>Prefix Trie with Pre-Materialized Top-K Suggestions</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Root[\"Root Node\"] --> S[\"'s' (Top: ['system', 'sql', 'spring'])\"]\n    S --> Y[\"'sy' (Top: ['system design', 'system requirements'])\"]\n    Y --> S2[\"'sys' (Top: ['system design', 'system architecture'])\"]\n    S2 --> T[\"'syst' (Top: ['system design'])\"]\n      </div>\n\n      <h2>Under the Hood: Why Naive Tries Fail at Scale</h2>\n      <p>In a textbook Trie, finding matching prefixes requires traversing down to the prefix node and performing a Depth-First Search (DFS) across all descendant nodes to find the highest-frequency suggestions. In a dictionary with 100,000,000 query logs, this DFS takes hundreds of milliseconds.</p>\n      <p><strong>The Pre-Materialization Pattern:</strong> Each Trie node pre-computes and caches the top 5 most popular global search phrases in its node payload. Querying autocomplete traverses the analyzed prefix in <code>O(|prefix|)</code> and then returns a bounded precomputed list. Network and serving latency must be measured; the lookup is not globally constant-time.</p>\n\n      <h2>Offline Aggregation Pipeline</h2>\n      <p>Search query click logs are streamed to Kafka and aggregated hourly via Apache Flink. Flink calculates weekly query frequency, filters offensive terms, and builds a fresh immutable Trie file. The new Trie is deployed to production Redis instances or local worker memory using zero-downtime pointer swaps.</p>\n    \n<!-- enriched -->\n<h2>Worked example: capacity estimate</h2>\n<table><thead><tr><th>Quantity</th><th>Assumption</th><th>Result</th></tr></thead><tbody>\n<tr><td>Searches per day</td><td>5 billion</td><td></td></tr>\n<tr><td>Suggestion requests per search</td><td>About 4 after client-side debouncing of 100 to 150 ms</td><td>20 billion per day</td></tr>\n<tr><td>Average QPS</td><td>20 billion divided by 86,400</td><td>about 230,000</td></tr>\n<tr><td>Peak QPS</td><td>2 to 3 times average</td><td>about 500,000 to 700,000</td></tr>\n<tr><td>Suggestion index</td><td>Top 10 million queries, about 50 million distinct prefixes, about 60 bytes each for key and 10 IDs</td><td>about 3 GB, fits in RAM on every server</td></tr>\n</tbody></table>\n<p>Because the whole index fits in memory, each server can hold a full replica and scale horizontally; sharding by prefix is only needed when the index grows much larger or is personalised.</p>\n<h2>Latency: what actually matters</h2>\n<p>Users perceive suggestions as instant if they appear within roughly 100 ms of a keystroke. Server lookup is microseconds; the budget is dominated by network round trip. Tactics: serve from the nearest region or edge, cache short prefixes (one or two characters) at the CDN and in the browser, reuse a persistent HTTP/2 connection, and cancel in-flight requests when a new keystroke arrives.</p>\n<h2>Data pipeline</h2>\n<div class=\"mermaid\">\nflowchart LR\n  A[\"Search logs\"] --> B[\"Stream or batch aggregation\"]\n  B --> C[\"Filter unsafe and rare queries\"]\n  C --> D[\"Score with frequency and recency decay\"]\n  D --> E[\"Build prefix to top K table\"]\n  E --> F[\"Publish versioned snapshot\"]\n  F --> G[\"Servers load and swap atomically\"]\n</div>\n<h2>Trade-offs</h2>\n<table><thead><tr><th>Choice</th><th>Benefit</th><th>Cost</th></tr></thead><tbody>\n<tr><td>Hourly rebuild</td><td>Simple, consistent</td><td>Misses breaking news for up to an hour</td></tr>\n<tr><td>Streaming trending layer</td><td>Fresh suggestions within minutes</td><td>Needs a merge of trending and base lists; abuse risk</td></tr>\n<tr><td>Personalised suggestions</td><td>Higher acceptance rate</td><td>Per-user state, privacy obligations</td></tr>\n<tr><td>Minimum frequency threshold</td><td>Blocks rare, possibly private queries</td><td>Long-tail coverage drops</td></tr>\n</tbody></table><h2>Failure modes</h2><ul><li><strong>Manipulation:</strong> bots repeatedly searching a phrase to push it into suggestions; count distinct users, not raw searches.</li><li><strong>Stale snapshot:</strong> if a build fails, keep serving the previous version rather than an empty index.</li><li><strong>Tail prefixes:</strong> prefixes with no precomputed list should return nothing quickly rather than falling back to an expensive scan.</li></ul>\n</div>",
    "keyTakeaways": [
      "Autocomplete should feel instant, about 100 ms end to end, so the server-side lookup must take only a few milliseconds.",
      "Trie nodes pre-cache the top 5 most frequent search terms, turning query-time subtree searches into an O(|prefix|) lookup plus a bounded list read.",
      "Query frequency weights are aggregated offline via streaming analytics (Flink) and loaded into in-memory Trie nodes."
    ],
    "furtherReading": [
      {
        "title": "Hsu & Ottaviano: Space-Efficient Data Structures for Top-k Completion (WWW, 2013)",
        "url": "https://dl.acm.org/doi/10.1145/2488388.2488440"
      },
      {
        "title": "Bast & Weber: Type Less, Find More: Fast Autocompletion Search with a Succinct Index (SIGIR, 2006)",
        "url": "https://dl.acm.org/doi/10.1145/1148170.1148234"
      },
      {
        "title": "Cai & de Rijke: A Survey of Query Auto Completion in Information Retrieval (Foundations and Trends in IR, 2016)",
        "url": "https://www.emerald.com/ftinr/article-abstract/10/4/273/1330380/A-Survey-of-Query-Auto-Completion-in-Information"
      }
    ]
  },
  "did-you-mean-and-spell-correction": {
    "title": "Design: did-you-mean and spell correction",
    "video": {
      "youtubeId": "d-Eq6x1yssU",
      "title": "The Algorithm Behind Spell Checkers",
      "channel": "b001",
      "why": "Beautifully animated explanation of edit distance and candidate generation, the foundation of did-you-mean.",
      "length": "13:02"
    },
    "videos": [
      {
        "youtubeId": "HmcolVdXVpE",
        "title": "Lecture 8: Noisy Channel Model for Spelling Correction",
        "channel": "Natural Language Processing",
        "role": "deep-dive",
        "why": "University lecture on the noisy channel model: error model times language model, with confusion matrices.",
        "length": "34:40"
      }
    ],
    "intuition": "<p>When a friend texts \"meet at teh cafe\", you do not consult a dictionary of every word; you think \"which real word could they have meant, and which is most likely?\" \"The\" is one swap away and extremely common, so that is your answer. Spell correction is that two-part judgement made precise.</p>\n<p><strong>Mental model:</strong> best correction = the candidate that maximises <em>how likely this typo is from that word</em> (error model) times <em>how common that word or phrase is</em> (language model). Candidate generation (edit distance, SymSpell) just makes the list short enough to score.</p>\n<ul>\n<li><strong>Trap:</strong> correcting valid rare words. \"Kubernetes\" or a brand name may be missing from a generic dictionary; build the dictionary from your own corpus and query logs.</li>\n<li><strong>Trap:</strong> ignoring context. \"Apple pie\" vs \"apple pi\" needs bigram or phrase statistics, not single-word frequency.</li>\n<li><strong>Trap:</strong> auto-replacing silently. When confidence is moderate, show \"Did you mean\" and search the original.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Real-Time Spelling Correction</h2>\n      <p>Approximately 10% to 15% of all web and e-commerce search queries contain typos (e.g. <code>\"appple iphone\"</code>, <code>\"teh lord of the rings\"</code>). When a query produces zero or poor results, the search engine must instantaneously evaluate edit distance candidates and suggest corrections.</p>\n\n      <h2>The SymSpell Algorithm (Symmetric Delete Spelling Correction)</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Dict[\"Dictionary Word: 'apple'\"] --> Precompute[\"Precompute Deletes (Distance 1 & 2)\"]\n    Precompute --> HashLookup[\"In-Memory Hash Table: 'pple' -> 'apple', 'aple' -> 'apple'\"]\n    \n    UserTypo[\"User Input: 'appple'\"] --> GenDeletes[\"Generate Deletes of Input: 'apple', 'ppple'\"]\n    GenDeletes --> HashLookup\n    HashLookup --> Match[\"Hash lookup per delete variant, then edit-distance check: Correct to 'apple'\"]\n      </div>\n\n      <h2>Under the Hood: SymSpell vs Traditional Levenshtein Distance</h2>\n      <ul>\n        <li><strong>Standard Levenshtein Distance:</strong> Calculating Levenshtein matrix distance between an input typo and every word in a 500,000-term dictionary requires billions of operations, taking seconds per query.</li>\n        <li><strong>SymSpell Breakthrough:</strong> Rather than testing insertions, deletions, substitutions, and transpositions against the entire vocabulary, SymSpell precomputes all <code>K</code>-distance <em>deletions</em> for dictionary words and stores them in a hash table. At query time, only deletions of the misspelled input are looked up in the hash table, achieving sub-millisecond execution. The original benchmark (Wolfgarbe, 2012) reports up to 1,000x speedup vs. standard Levenshtein on a 500K dictionary, but actual speedup depends on edit distance threshold and dictionary size.</li>\n        <li><strong>The Noisy Channel Model:</strong> Scores candidate corrections using Bayesian probability: <code>P(Word | Typo) ∝ P(Typo | Word) × P(Word)</code>, balancing keyboard typo proximity with unigram/bigram word frequencies from search logs.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: noisy channel scoring</h2>\n<p>User types <code>teh</code>. Candidates within edit distance 1 or one transposition include \"the\", \"ten\", \"tea\". Illustrative probabilities:</p>\n<table><thead><tr><th>Candidate</th><th>P(word) from query logs</th><th>P(teh given word), error model</th><th>Product</th></tr></thead><tbody>\n<tr><td>the</td><td>0.05</td><td>0.001, adjacent transposition</td><td>5 x 10 to the minus 5</td></tr>\n<tr><td>ten</td><td>0.0005</td><td>0.0002, h for n substitution</td><td>1 x 10 to the minus 7</td></tr>\n<tr><td>tea</td><td>0.0003</td><td>0.0001, h for a substitution</td><td>3 x 10 to the minus 8</td></tr>\n</tbody></table>\n<p>\"The\" wins by more than two orders of magnitude. A real system also includes the typed word itself as a candidate, so correctly spelled rare words are not \"fixed\".</p>\n<h2>Worked example: SymSpell index size</h2>\n<p>With maximum edit distance 2, a word of length 8 has up to 8 single deletes and 28 double deletes, 36 variants. For a 500,000-word dictionary, that is on the order of 10 to 20 million delete-keys after deduplication, which is why SymSpell trades memory for speed. At query time, the typo's own deletes are looked up, and every hit is verified with a true Damerau-Levenshtein distance before scoring.</p>\n<h2>Candidate generation trade-offs</h2>\n<table><thead><tr><th>Method</th><th>Query speed</th><th>Memory</th><th>Notes</th></tr></thead><tbody>\n<tr><td>Brute-force edit distance</td><td>Very slow on large vocabularies</td><td>Minimal</td><td>Fine for tiny dictionaries</td></tr>\n<tr><td>BK-tree</td><td>Moderate</td><td>Low</td><td>Prunes using the triangle inequality</td></tr>\n<tr><td>Levenshtein automaton over an FST</td><td>Fast</td><td>Low</td><td>What Lucene fuzzy queries use</td></tr>\n<tr><td>SymSpell symmetric delete</td><td>Very fast</td><td>High</td><td>Precomputed deletes in a hash map</td></tr>\n<tr><td>Neural or LLM correction</td><td>Slowest</td><td>Model size</td><td>Best for context-heavy errors; cache results</td></tr>\n</tbody></table>\n<p><strong>Production pattern:</strong> run correction only when the original query returns few or low-quality results, or when a correction has much higher probability; mine correction pairs from query reformulations in logs (a user types \"recieve\", then immediately \"receive\" and clicks), which is how large engines learn domain-specific corrections.</p><h2>Failure modes</h2><p>Over-correction is worse than no correction: replacing a valid product code or surname destroys trust. Guard rails include never correcting tokens that match catalogue entities, requiring the corrected query to return clearly more or better results, and measuring the rate at which users click \"search instead for\" the original, which directly measures bad corrections.</p>\n</div>",
    "keyTakeaways": [
      "SymSpell achieves sub-millisecond spell correction by precomputing word deletions into an in-memory hash table.",
      "The Noisy Channel Model combines keyboard typo likelihood with language unigram frequency to pick the best correction.",
      "Spelling correction runs transparently during query understanding to rescue zero-result typo queries."
    ],
    "furtherReading": [
      {
        "title": "Wolfgarbe: SymSpell: 1000x Faster Spelling Correction Algorithm",
        "url": "https://github.com/wolfgarbe/SymSpell"
      },
      {
        "title": "Kernighan, Church & Gale: A Spelling Correction Program Based on a Noisy Channel Model (COLING, 1990)",
        "url": "https://aclanthology.org/C90-2036/"
      },
      {
        "title": "Brill & Moore: An Improved Error Model for Noisy Channel Spelling Correction (ACL)",
        "url": "https://aclanthology.org/P00-1034/"
      }
    ]
  },
  "related-searches": {
    "title": "Design: related searches",
    "video": {
      "youtubeId": "OdNHFU9TeEw",
      "title": "Search to Search recommendations by Sadat Anwar and Matthieu Pons",
      "channel": "OpenSource Connections",
      "why": "Haystack talk that is precisely about recommending related queries from search sessions in production, including data mining and evaluation.",
      "length": "37:13"
    },
    "videos": [
      {
        "youtubeId": "nwbiN9L2w68",
        "title": "007. Efficient Query Suggestions in the Long Tail - Raffaele Perego",
        "channel": "Yandex for ML",
        "role": "deep-dive",
        "why": "Research talk on query-flow graphs and producing related-query suggestions for rare queries.",
        "length": "35:08"
      },
      {
        "youtubeId": "7XpQVWaTO2s",
        "title": "Designing Search Suggestions",
        "channel": "NNgroup",
        "role": "intro",
        "why": "Nielsen Norman Group on how users actually interact with suggested queries, a useful product lens.",
        "length": "3:32"
      }
    ],
    "intuition": "<p>A bookshop assistant notices that people who ask for \"Kafka architecture\" often come back asking for \"RabbitMQ vs Kafka\". Next time someone asks the first, they suggest the second. Related searches are that pattern, learned from millions of sessions instead of one assistant's memory.</p>\n<p><strong>Mental model:</strong> two queries are related if users <em>reformulate from one to the other</em> in a session, or if they <em>click the same results</em>. Mine those co-occurrences offline, normalise away popularity, and serve a precomputed list per query.</p>\n<ul>\n<li><strong>Trap:</strong> ranking by raw co-occurrence. Very popular queries co-occur with everything; use PMI or a similar lift measure.</li>\n<li><strong>Trap:</strong> suggesting near duplicates (\"kafka arch\", \"kafka architecture\"). Deduplicate by normalised form or shared clicked results.</li>\n<li><strong>Trap:</strong> ignoring the long tail. Rare queries have no session data; fall back to click-graph neighbours or embeddings.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Mining Query Relationships</h2>\n      <p>Related searches (e.g. searching <em>\"distributed systems\"</em> and seeing suggestions for <em>\"Raft consensus\"</em>, <em>\"CAP theorem\"</em>, and <em>\"vector clocks\"</em>) help users navigate complex information spaces. These recommendations are mined from collective user behavior across millions of search sessions.</p>\n\n      <h2>Query-Click Bipartite Graph Architecture</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph QueryNodes [\"Query Nodes\"]\n      Q1[\"'kafka architecture'\"]\n      Q2[\"'rabbitmq vs kafka'\"]\n      Q3[\"'event-driven microservices'\"]\n    end\n\n    subgraph DocNodes [\"Clicked URL / Product Nodes\"]\n      D1[\"URL: kafka.apache.org/intro\"]\n      D2[\"URL: confluent.io/blog/message-queues\"]\n    end\n\n    Q1 &lt;--> D1\n    Q1 &lt;--> D2\n    Q2 &lt;--> D2\n    Q3 &lt;--> D1\n      </div>\n\n      <h2>Under the Hood: Mining Algorithms</h2>\n      <ul>\n        <li><strong>Session Co-occurrence Mining:</strong> If thousands of users search for Query A followed by Query B within the same 30-minute browsing session, the two queries share high temporal affinity. Pairwise pointwise mutual information (PMI) quantifies this association while filtering out trivial coincidences.</li>\n        <li><strong>Random Walks on Bipartite Graphs (SimRank / Personalized PageRank):</strong> Construct a bipartite graph connecting search queries to the web pages clicked by users. Performing random walks with restarts reveals queries that share high structural overlap in click destinations, identifying high-quality conceptual synonyms.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: PMI beats raw counts</h2>\n<p>From 10 million sessions: query A, \"kafka architecture\", appears in 100,000 sessions. Candidate B, \"kafka partitions\", appears in 50,000 sessions and co-occurs with A in 5,000. Candidate C, \"facebook\", appears in 1,000,000 sessions and co-occurs with A in 12,000.</p>\n<table><thead><tr><th>Candidate</th><th>Co-occurrences</th><th>P(A and X) divided by P(A) x P(X)</th><th>PMI, log2</th></tr></thead><tbody>\n<tr><td>kafka partitions</td><td>5,000</td><td>0.0005 divided by 0.00005 = 10</td><td>3.32</td></tr>\n<tr><td>facebook</td><td>12,000</td><td>0.0012 divided by 0.001 = 1.2</td><td>0.26</td></tr>\n</tbody></table>\n<p>Raw counts would suggest \"facebook\"; PMI correctly picks \"kafka partitions\". Because PMI inflates very rare pairs, production systems add a minimum support threshold, for example at least 50 co-occurrences, or use a smoothed variant.</p>\n<h2>Signals and their trade-offs</h2>\n<table><thead><tr><th>Signal</th><th>Captures</th><th>Weakness</th></tr></thead><tbody>\n<tr><td>Session reformulation, A then B within 30 minutes</td><td>Refinement and next-step intent</td><td>Sparse for rare queries; noisy when users switch tasks</td></tr>\n<tr><td>Shared clicks on the query-URL bipartite graph</td><td>Same-meaning queries</td><td>Tends to find synonyms rather than useful next steps</td></tr>\n<tr><td>Query embeddings</td><td>Coverage of the long tail</td><td>Can suggest plausible but unhelpful queries</td></tr>\n<tr><td>Editorial lists</td><td>Control for high-value queries</td><td>Does not scale</td></tr>\n</tbody></table>\n<h2>Serving</h2>\n<p>A nightly or hourly job computes, for each of the top few million normalised queries, a ranked list of about 8 related queries and writes it to a key-value store. At request time the service normalises the query, does one lookup, and falls back to an embedding nearest-neighbour lookup for misses. Filtering is essential: remove suggestions with no results, adult or unsafe content, and anything that could reveal an individual's searches, which is why a minimum count across distinct users is enforced.</p><h2>Evaluation</h2><p>Measure suggestion click-through rate, and more importantly whether sessions that used a related search end in success, such as a purchase or a long dwell click. A suggestion that gets clicks but leads to abandonment is a distraction. Offline, sample query and suggestion pairs for human rating of relevance and diversity, and check that suggestions are not near duplicates of the original.</p>\n</div>",
    "keyTakeaways": [
      "Related searches are mined from user session logs and query-click bipartite graphs.",
      "Temporal session co-occurrence identifies queries frequently executed in sequence by real users.",
      "Random walk algorithms (Personalized PageRank) surface semantically linked concepts based on shared destination clicks."
    ],
    "furtherReading": [
      {
        "title": "Baeza-Yates, Hurtado & Mendoza: Query Recommendation Using Query Logs in Search Engines (EDBT Workshops, 2004)",
        "url": "https://link.springer.com/chapter/10.1007/978-3-540-30192-9_58"
      },
      {
        "title": "Beeferman & Berger: Agglomerative Clustering of a Search Engine Query Log (KDD, 2000)",
        "url": "https://dl.acm.org/doi/10.1145/347090.347176"
      },
      {
        "title": "Manning et al.: Relevance Feedback and Query Expansion (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/relevance-feedback-and-query-expansion-1.html"
      }
    ]
  },
  "recent-searches-system-design": {
    "title": "Design: recent searches",
    "video": {
      "youtubeId": "MUKlxdBQZ7g",
      "title": "Redis Sorted Sets Explained",
      "channel": "Redis",
      "why": "Official, focused explanation of the ZSET operations (ZADD, ZRANGE, ZREMRANGEBYRANK) that implement a de-duplicated, capped recent-search list.",
      "length": "6:17"
    },
    "videos": [
      {
        "youtubeId": "fmT5nlEkl3U",
        "title": "Redis Deep Dive w/ a Ex-Meta Senior Manager",
        "channel": "Hello Interview",
        "role": "interview",
        "why": "Shows how Redis data structures, clustering and persistence choices play out in interview designs like per-user history.",
        "length": "31:00"
      }
    ],
    "intuition": "<p>Your phone's \"recent calls\" list is a good model. Calling the same person again does not add a duplicate row; it just moves them to the top. The list only keeps the last few dozen. And if you clear it, it is gone everywhere. Recent searches are exactly that, per user, for hundreds of millions of users.</p>\n<p><strong>Mental model:</strong> a per-user <em>set ordered by last-used time</em>, capped at N. A Redis sorted set with the query as member and timestamp as score gives de-duplication, reordering and trimming in a few commands.</p>\n<ul>\n<li><strong>Trap:</strong> using a list with LPUSH and LTRIM. It shows duplicates and removing them costs O(N).</li>\n<li><strong>Trap:</strong> treating Redis as the only copy. If history must survive cache loss or sync across devices, persist it in a durable store too.</li>\n<li><strong>Trap:</strong> forgetting privacy. \"Delete my history\" must purge Redis, the durable store and any analytics copies, and history should expire.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: User Search History at Scale</h2>\n      <p>When a user taps the search bar, mobile and web applications display their recent search history (e.g. the last 10 queries executed by that account). While conceptually straightforward, serving recent searches for 500,000,000 active users requires low latency, strict GDPR compliance, cross-device synchronization, and zero database overload.</p>\n\n      <h2>Redis Capped Set Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Mobile Client: Taps Search Bar\"] --> Edge[\"API Gateway\"]\n    Edge --> SearchHistoryService[\"Recent Search Service\"]\n    \n    SearchHistoryService -->|\"1. ZRANGE history:&lt;user_id> 0 9 REV\"| RedisCluster[(\"Redis Cluster (In-Memory)\")]\n    RedisCluster -->|\"Returns 10 most recent queries\"| SearchHistoryService\n    \n    subgraph MutationFlow [\"When User Executes New Query: 'system design'\"]\n      UserSearch[\"User Search Event\"] --> Worker[\"Async Mutation Worker\"]\n      Worker -->|\"2. Atomic Lua: ZADD history:&lt;user_id> &lt;now_timestamp> &lt;query> + ZREMRANGEBYRANK 0 -11\"| RedisCluster\n      Worker -->|\"3. Append to User History Log\"| ColdStorage[(\"Encrypted Cassandra / DynamoDB\")]\n    end\n      </div>\n\n      <h2>Under the Hood: Redis Sorted Sets vs Lists</h2>\n      <ul>\n        <li><strong>Why Lists Fail:</strong> A simple Redis List (<code>LPUSH</code> + <code>LTRIM</code>) permits duplicate queries. If a user searches \"iPhone\" five times, their recent search list displays five identical \"iPhone\" entries. De-duplicating a list requires <code>O(N)</code> scans.</li>\n        <li><strong>The Sorted Set Solution (ZSET):</strong> Redis Sorted Sets store unique members sorted by score. By storing the query string as the member and the current Unix timestamp as the score, executing <code>ZADD history:uid timestamp query</code> automatically de-duplicates the query and refreshes its recency to the top. Capping the history is achieved via <code>ZREMRANGEBYRANK history:uid 0 -11</code>.</li>\n        <li><strong>Privacy & GDPR Compliance:</strong> Search history must support instant user purges (<code>DEL history:uid</code>) and automatic time-to-live expiration (e.g. <code>EXPIRE history:uid 7776000</code> for 90 days retention).</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: sizing</h2>\n<table><thead><tr><th>Quantity</th><th>Assumption</th><th>Result</th></tr></thead><tbody>\n<tr><td>Users with stored history</td><td>500 million</td><td></td></tr>\n<tr><td>Entries per user</td><td>10</td><td></td></tr>\n<tr><td>Bytes per entry</td><td>About 30 byte query plus score and encoding overhead</td><td>about 50 bytes</td></tr>\n<tr><td>Per-user key</td><td>Entries plus key and object overhead</td><td>roughly 0.5 to 1 KB</td></tr>\n<tr><td>Total if all users hot</td><td>500 million x about 1 KB</td><td>about 500 GB across a Redis cluster</td></tr>\n<tr><td>Hot set only, 100 million daily actives</td><td>100 million x about 1 KB</td><td>about 100 GB</td></tr>\n<tr><td>Write rate</td><td>5 billion searches per day</td><td>about 58,000 writes per second average</td></tr>\n</tbody></table>\n<p>Small sorted sets (up to 128 entries by default) use Redis's compact listpack encoding, so a 10-entry history is cheap. A common optimisation is to keep only active users in Redis with a TTL and lazily reload others from the durable store on first access.</p>\n<h2>The write path, atomically</h2>\n<p>Run these as one Lua script or MULTI block so concurrent searches cannot leave the set over-length:</p>\n<ul>\n<li><code>ZADD history:uid 1727700000 \"system design\"</code> inserts or refreshes the timestamp of an existing entry.</li>\n<li><code>ZREMRANGEBYRANK history:uid 0 -11</code> removes everything except the 10 highest scores.</li>\n<li><code>EXPIRE history:uid 7776000</code> gives 90-day retention.</li>\n</ul>\n<p>Read path: <code>ZRANGE history:uid 0 9 REV</code>, available since Redis 6.2, returns newest first.</p>\n<h2>Design trade-offs</h2>\n<table><thead><tr><th>Choice</th><th>Benefit</th><th>Cost</th></tr></thead><tbody>\n<tr><td>Redis only</td><td>Simplest, fastest</td><td>History lost on eviction or failover without persistence</td></tr>\n<tr><td>Redis plus Cassandra or DynamoDB</td><td>Durable, cross-device</td><td>Two writes; needs async sync and idempotent upserts</td></tr>\n<tr><td>Client-side storage only</td><td>No server cost, most private</td><td>No cross-device sync</td></tr>\n</tbody></table>\n<p><strong>Edge cases:</strong> normalise queries (case, whitespace) before using them as members; do not record searches made in incognito or private modes; and make deletion of one entry (<code>ZREM</code>) propagate to every store.</p><h2>Cross-device sync</h2><p>If a user searches on the phone and then opens the laptop, the laptop should show the new entry. Write to the durable store keyed by user ID, publish a small change event, and let the cache update or invalidate the user's key; last-write-wins on the timestamp score is sufficient because entries are independent and a slightly stale order is harmless.</p>\n</div>",
    "keyTakeaways": [
      "Redis Sorted Sets (ZSET) provide instant O(log N) deduplication and timestamp ordering for recent user searches.",
      "Atomic Lua scripts cap recent search lists to 10 entries without multi-roundtrip race conditions.",
      "Privacy regulations (GDPR/CCPA) require hard TTL expiration and immediate zero-trace purge APIs."
    ],
    "furtherReading": [
      {
        "title": "Redis Documentation: Sorted Sets Explained",
        "url": "https://redis.io/docs/latest/develop/data-types/sorted-sets/"
      },
      {
        "title": "Redis Documentation: Lists (capped lists with LPUSH + LTRIM)",
        "url": "https://redis.io/docs/latest/develop/data-types/lists/"
      },
      {
        "title": "GDPR: The Right to Erasure (Article 17) (EU Official Journal)",
        "url": "https://gdpr-info.eu/art-17-gdpr/"
      }
    ]
  }
};
