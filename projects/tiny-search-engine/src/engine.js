/**
 * Inverted Index Search Engine with Tiered Champion Lists & BM25 Ranking
 * 
 * Implements:
 * 1. Document ingestion & Term-Dictionary Postings indexing
 * 2. Quality Tiering & Champion Lists (Tier 1 Hot In-Memory vs Tier 2 Complete Archive)
 * 3. Two-Pointer Boolean Query Evaluation (AND, OR, NOT)
 * 4. Okapi BM25 Ranking with Term Frequency Saturation & Length Normalization
 */

const { tokenize } = require('./tokenizer');
const {
  PostingList,
  intersectPostings,
  unionPostings,
  differencePostings,
  intersectAll,
  intersectPhrase
} = require('./postings');

/**
 * Tiny Inverted Index Engine
 * 
 * Features:
 * - Full-text indexing with tokenization, stop-words, and stemming
 * - Positional index: tracks word positions for exact phrase matching
 * - Tiered storage: Champion lists (Tier 1 hot in-memory) + complete archive (Tier 2)
 * - Boolean queries: MUST (AND), SHOULD (OR), MUST_NOT (NOT) with linear merge
 * - Okapi BM25 relevance ranking with length normalization and static PageRank boost
 */
class InvertedIndexEngine {
  constructor(options = {}) {
    const {
      k1 = 1.2,          // BM25 term frequency saturation parameter
      b = 0.75,          // BM25 document length normalization parameter
      championK = 5      // Top-K documents per term preserved in Tier-1 Champion List
    } = options;

    this.k1 = k1;
    this.b = b;
    this.championK = championK;

    // Corpus data
    this.documents = new Map();     // docId -> { text, staticScore, length }
    this.totalDocLength = 0;

    // Full Inverted Index (Tier 2 Archive)
    this.index = new Map();         // term -> PostingList

    // Tier 1 Fast-Path Index (Champion Lists)
    this.championIndex = new Map(); // term -> PostingList (top championK by staticScore)
  }

  get docCount() {
    return this.documents.size;
  }

  get avgDocLength() {
    return this.docCount > 0 ? this.totalDocLength / this.docCount : 0;
  }

  /**
   * Add a document to the index
   * @param {number|string} id - Unique document ID
   * @param {string} text - Raw document content
   * @param {number} staticScore - Static quality score (e.g. PageRank / popularity between 0.0 and 1.0)
   */
  addDocument(id, text, staticScore = 0.5) {
    if (this.documents.has(id)) {
      throw new Error(`Document with ID ${id} already indexed.`);
    }

    const tokenObjects = tokenize(text, { withPositions: true });
    const docLength = tokenObjects.length;

    this.documents.set(id, {
      text,
      staticScore,
      length: docLength
    });
    this.totalDocLength += docLength;

    // Compute Term Frequency and Positions for this document
    const termMap = new Map(); // term -> { tf, positions }
    for (const { term, position } of tokenObjects) {
      if (!termMap.has(term)) {
        termMap.set(term, { tf: 0, positions: [] });
      }
      const entry = termMap.get(term);
      entry.tf += 1;
      entry.positions.push(position);
    }

    // Invert mapping: term -> postings list
    for (const [term, { tf, positions }] of termMap.entries()) {
      if (!this.index.has(term)) {
        this.index.set(term, new PostingList(term));
      }
      this.index.get(term).add(id, tf, positions);
    }
  }

  /**
   * Batch ingest an array of documents
   * Enables indexing any number of data records
   * @param {Array<{ id: number|string, text: string, staticScore?: number }>} docs
   */
  addDocuments(docs) {
    if (!Array.isArray(docs)) {
      throw new TypeError('addDocuments expects an array of document objects: [{ id, text, staticScore? }]');
    }
    for (const doc of docs) {
      if (doc && doc.id !== undefined && doc.text !== undefined) {
        this.addDocument(doc.id, doc.text, doc.staticScore ?? 0.5);
      }
    }
  }

  /**
   * Build Tier 1 Champion Lists for all terms
   * Pre-extracts the top-K highest authority documents for fast-path retrieval
   */
  buildChampionLists() {
    this.championIndex.clear();

    for (const [term, postingList] of this.index.entries()) {
      // Sort entries by composite staticScore + TF
      const sortedEntries = [...postingList.entries].sort((a, b) => {
        const scoreA = (this.documents.get(a.docId)?.staticScore || 0) + (a.tf * 0.1);
        const scoreB = (this.documents.get(b.docId)?.staticScore || 0) + (b.tf * 0.1);
        return scoreB - scoreA;
      });

      const topK = sortedEntries.slice(0, this.championK);
      const champList = new PostingList(term);
      for (const entry of topK) {
        champList.add(entry.docId, entry.tf);
      }
      this.championIndex.set(term, champList);
    }
  }

  /**
   * Compute BM25 relevance score for a document given query terms
   */
  scoreBM25(docId, queryTerms, postingMap = this.index) {
    const docMeta = this.documents.get(docId);
    if (!docMeta) return 0;

    const N = this.docCount;
    const avgdl = this.avgDocLength;
    const docLen = docMeta.length;
    let totalScore = 0;

    for (const term of queryTerms) {
      const plist = postingMap.get(term);
      if (!plist) continue;

      const df = plist.length; // Document Frequency
      // Robertson-Spärck Jones IDF
      const idf = Math.log(1 + ((N - df + 0.5) / (df + 0.5)));

      // Find TF in postings
      const match = plist.entries.find(e => e.docId === docId);
      if (!match) continue;

      const tf = match.tf;
      // BM25 term weighting with length normalization
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / (avgdl || 1)));
      const termWeight = idf * (numerator / denominator);

      totalScore += termWeight;
    }

    // Blend static quality score (PageRank) as an additive boost (common in commercial search)
    const staticBoost = (docMeta.staticScore || 0) * 0.5;
    return totalScore + staticBoost;
  }

  /**
   * Boolean Query Evaluation
   * Supports:
   *   must: array of terms (AND)
   *   should: array of terms (OR)
   *   mustNot: array of terms (NOT)
   */
  searchBoolean({ must = [], should = [], mustNot = [] }, useChampion = false) {
    const pMap = useChampion ? this.championIndex : this.index;
    let candidatePostings = null;

    // 1. MUST clauses (AND intersection)
    if (must.length > 0) {
      const mustLists = [];
      for (const rawTerm of must) {
        const [term] = tokenize(rawTerm);
        if (!term) continue;
        const list = pMap.get(term);
        if (!list || list.length === 0) return []; // Short-circuit: AND on absent term yields 0
        mustLists.push(list);
      }
      candidatePostings = intersectAll(mustLists);
    }

    // 2. SHOULD clauses (OR union)
    if (should.length > 0) {
      const shouldLists = [];
      for (const rawTerm of should) {
        const [term] = tokenize(rawTerm);
        if (!term) continue;
        const list = pMap.get(term);
        if (list) shouldLists.push(list);
      }

      if (shouldLists.length > 0) {
        let unionRes = shouldLists[0].entries;
        for (let i = 1; i < shouldLists.length; i++) {
          unionRes = unionPostings(unionRes, shouldLists[i].entries);
        }

        if (candidatePostings === null) {
          candidatePostings = unionRes;
        } else {
          // If we had MUST and SHOULD, intersect candidate with SHOULD union
          candidatePostings = intersectPostings(candidatePostings, unionRes);
        }
      }
    }

    if (!candidatePostings) return [];

    // 3. MUST_NOT clauses (Difference)
    if (mustNot.length > 0) {
      for (const rawTerm of mustNot) {
        const [term] = tokenize(rawTerm);
        if (!term) continue;
        const notList = pMap.get(term);
        if (notList) {
          candidatePostings = differencePostings(candidatePostings, notList.entries);
        }
      }
    }

    return candidatePostings.map(e => e.docId);
  }

  /**
   * Positional Exact Phrase Search
   * Finds documents containing query terms in strict consecutive sequence
   * @param {string} phrase - Exact phrase query e.g. "distributed consensus"
   */
  searchPhrase(phrase) {
    const queryTokens = tokenize(phrase, { removeStopWords: false });
    if (queryTokens.length === 0) return [];

    if (queryTokens.length === 1) {
      const list = this.index.get(queryTokens[0]);
      if (!list) return [];
      return list.entries.map(e => ({
        docId: e.docId,
        tf: e.tf,
        text: this.documents.get(e.docId)?.text
      }));
    }

    let candidates = this.index.get(queryTokens[0])?.entries;
    if (!candidates || candidates.length === 0) return [];

    for (let i = 1; i < queryTokens.length; i++) {
      const nextList = this.index.get(queryTokens[i])?.entries;
      if (!nextList || nextList.length === 0) return [];
      candidates = intersectPhrase(candidates, nextList);
      if (candidates.length === 0) break;
    }

    return candidates.map(c => ({
      docId: c.docId,
      matchCount: c.tf,
      text: this.documents.get(c.docId)?.text
    }));
  }

  /**
   * Full-text search with Tiered Champion-List Fast Path and BM25 Ranking
   */
  search(query, options = {}) {
    const {
      topK = 5,
      useChampionLists = true
    } = options;

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return { results: [], tierUsed: 'none' };

    let candidateDocIds = [];
    let tierUsed = 'Tier-2 (Archive)';

    // Step 1: Try Fast-Path Tier 1 (Champion Lists)
    if (useChampionLists && this.championIndex.size > 0) {
      const champLists = queryTokens
        .map(t => this.championIndex.get(t))
        .filter(Boolean);

      if (champLists.length === queryTokens.length) {
        // All query terms exist in Tier 1
        const matches = intersectAll(champLists);
        if (matches.length >= topK) {
          candidateDocIds = matches.map(m => m.docId);
          tierUsed = 'Tier-1 (Champion In-Memory Fast Path)';
        }
      }
    }

    // Step 2: Fallback to Tier 2 Complete Archive if Tier 1 yielded insufficient matches
    if (candidateDocIds.length < topK) {
      tierUsed = 'Tier-2 (Full Inverted Index Archive)';
      // Retrieve candidates matching any or all query terms
      const docSet = new Set();
      for (const term of queryTokens) {
        const plist = this.index.get(term);
        if (plist) {
          for (const entry of plist.entries) {
            docSet.add(entry.docId);
          }
        }
      }
      candidateDocIds = Array.from(docSet);
    }

    // Step 3: BM25 Relevance Scoring & Top-K Ranking
    const scoredResults = candidateDocIds.map(docId => {
      const score = this.scoreBM25(docId, queryTokens, this.index);
      const doc = this.documents.get(docId);
      return {
        docId,
        score: Number(score.toFixed(4)),
        staticScore: doc.staticScore,
        text: doc.text
      };
    });

    scoredResults.sort((a, b) => b.score - a.score);

    return {
      query,
      tokens: queryTokens,
      tierUsed,
      totalCandidates: candidateDocIds.length,
      results: scoredResults.slice(0, topK)
    };
  }
}

module.exports = { InvertedIndexEngine };
