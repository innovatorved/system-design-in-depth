/**
 * Postings List Data Structure & Set Intersection Algorithms
 * 
 * In an inverted index, a Postings List is a strictly sorted sequence of
 * document IDs (and metadata like term frequency) containing a specific term.
 * 
 * Keeping document IDs strictly sorted enables:
 * 1. O(N + M) Two-Pointer Intersection (AND queries)
 * 2. O(N + M) Two-Pointer Union (OR queries)
 * 3. O(N + M) Two-Pointer Difference (AND NOT queries)
 * 4. Skip Pointers: leaping ahead over non-matching blocks in sublinear time
 */

class PostingList {
  constructor(term = '', skipInterval = 8) {
    this.term = term;
    this.entries = []; // Array of { docId, tf }
    this.skipInterval = skipInterval;
    this.skipPointers = []; // Array of { index, docId }
  }

  get length() {
    return this.entries.length;
  }

  /**
   * Insert a document match maintaining strictly sorted docId order
   */
  add(docId, tf = 1, positions = []) {
    const posArr = Array.isArray(positions) ? [...positions] : [];
    const entry = { docId, tf, positions: posArr };

    // Common case: sequential ingestion of increasing doc IDs
    if (this.entries.length === 0 || docId > this.entries[this.entries.length - 1].docId) {
      this.entries.push(entry);
    } else {
      // Binary search insertion index
      let low = 0;
      let high = this.entries.length;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (this.entries[mid].docId === docId) {
          this.entries[mid].tf += tf; // Accumulate TF if already present
          if (posArr.length > 0) {
            this.entries[mid].positions = (this.entries[mid].positions || []).concat(posArr);
            this.entries[mid].positions.sort((a, b) => a - b);
          }
          return;
        }
        if (this.entries[mid].docId < docId) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      this.entries.splice(low, 0, entry);
    }

    this._updateSkipPointers();
  }

  _updateSkipPointers() {
    this.skipPointers = [];
    for (let i = 0; i < this.entries.length; i += this.skipInterval) {
      this.skipPointers.push({
        index: i,
        docId: this.entries[i].docId
      });
    }
  }

  getDocIds() {
    return this.entries.map(e => e.docId);
  }

  /**
   * Find the next index >= targetDocId using skip pointers if available
   */
  skipForward(currentIndex, targetDocId) {
    if (this.skipPointers.length === 0) return currentIndex;

    // Find the furthest skip pointer that is still <= targetDocId
    let bestSkipIdx = currentIndex;
    for (const skip of this.skipPointers) {
      if (skip.index > currentIndex && skip.docId <= targetDocId) {
        bestSkipIdx = skip.index;
      } else if (skip.docId > targetDocId) {
        break;
      }
    }
    return bestSkipIdx;
  }
}

/**
 * Two-Pointer Intersection (Boolean AND)
 * Merges two strictly sorted postings lists in O(N + M) time.
 */
function intersectPostings(listA, listB) {
  const result = [];
  const entriesA = listA instanceof PostingList ? listA.entries : listA;
  const entriesB = listB instanceof PostingList ? listB.entries : listB;

  let pA = 0;
  let pB = 0;

  while (pA < entriesA.length && pB < entriesB.length) {
    const docA = entriesA[pA].docId;
    const docB = entriesB[pB].docId;

    if (docA === docB) {
      // Match found!
      result.push({
        docId: docA,
        tfA: entriesA[pA].tf,
        tfB: entriesB[pB].tf
      });
      pA++;
      pB++;
    } else if (docA < docB) {
      // List A lags behind: skip ahead if possible
      if (listA.skipForward) {
        const next = listA.skipForward(pA, docB);
        pA = next > pA ? next : pA + 1;
      } else {
        pA++;
      }
    } else {
      // List B lags behind: skip ahead if possible
      if (listB.skipForward) {
        const next = listB.skipForward(pB, docA);
        pB = next > pB ? next : pB + 1;
      } else {
        pB++;
      }
    }
  }

  return result;
}

/**
 * Intersect multiple postings lists (Boolean AND for N terms)
 * Crucial IR optimization: Sort terms by ascending list length (rarest first).
 * Intersecting the smallest list first minimizes intermediate memory and comparisons!
 */
function intersectAll(lists) {
  if (!lists || lists.length === 0) return [];
  if (lists.length === 1) return lists[0] instanceof PostingList ? lists[0].entries : lists[0];

  // Sort lists by length ascending
  const sorted = [...lists].sort((a, b) => {
    const lenA = a instanceof PostingList ? a.length : a.length;
    const lenB = b instanceof PostingList ? b.length : b.length;
    return lenA - lenB;
  });

  let current = sorted[0] instanceof PostingList ? sorted[0].entries : sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (current.length === 0) break; // Early termination if intermediate intersection is empty
    current = intersectPostings(current, sorted[i]);
  }

  return current;
}

/**
 * Two-Pointer Union (Boolean OR)
 * Merges two strictly sorted postings lists in O(N + M) time.
 */
function unionPostings(listA, listB) {
  const result = [];
  const entriesA = listA instanceof PostingList ? listA.entries : listA;
  const entriesB = listB instanceof PostingList ? listB.entries : listB;

  let pA = 0;
  let pB = 0;

  while (pA < entriesA.length && pB < entriesB.length) {
    const docA = entriesA[pA].docId;
    const docB = entriesB[pB].docId;

    if (docA === docB) {
      result.push({
        docId: docA,
        tf: entriesA[pA].tf + entriesB[pB].tf
      });
      pA++;
      pB++;
    } else if (docA < docB) {
      result.push({ docId: docA, tf: entriesA[pA].tf });
      pA++;
    } else {
      result.push({ docId: docB, tf: entriesB[pB].tf });
      pB++;
    }
  }

  // Drain remaining elements
  while (pA < entriesA.length) {
    result.push({ docId: entriesA[pA].docId, tf: entriesA[pA].tf });
    pA++;
  }
  while (pB < entriesB.length) {
    result.push({ docId: entriesB[pB].docId, tf: entriesB[pB].tf });
    pB++;
  }

  return result;
}

/**
 * Two-Pointer Difference (Boolean AND NOT)
 * Returns documents in listA that do NOT appear in listB in O(N + M) time.
 */
function differencePostings(listA, listB) {
  const result = [];
  const entriesA = listA instanceof PostingList ? listA.entries : listA;
  const entriesB = listB instanceof PostingList ? listB.entries : listB;

  let pA = 0;
  let pB = 0;

  while (pA < entriesA.length && pB < entriesB.length) {
    const docA = entriesA[pA].docId;
    const docB = entriesB[pB].docId;

    if (docA === docB) {
      // Excluded
      pA++;
      pB++;
    } else if (docA < docB) {
      result.push({ docId: docA, tf: entriesA[pA].tf });
      pA++;
    } else {
      pB++;
    }
  }

  while (pA < entriesA.length) {
    result.push({ docId: entriesA[pA].docId, tf: entriesA[pA].tf });
    pA++;
  }

  return result;
}

/**
 * Positional Phrase Intersection
 * Matches documents where term B appears immediately after term A (posB === posA + 1).
 */
function intersectPhrase(listA, listB) {
  const result = [];
  const entriesA = listA instanceof PostingList ? listA.entries : (Array.isArray(listA) ? listA : []);
  const entriesB = listB instanceof PostingList ? listB.entries : (Array.isArray(listB) ? listB : []);

  let i = 0;
  let j = 0;

  while (i < entriesA.length && j < entriesB.length) {
    if (entriesA[i].docId === entriesB[j].docId) {
      const docId = entriesA[i].docId;
      const posA = entriesA[i].positions || [];
      const posB = entriesB[j].positions || [];
      const matchedPositions = [];

      let pA = 0;
      let pB = 0;

      while (pA < posA.length && pB < posB.length) {
        if (posB[pB] === posA[pA] + 1) {
          matchedPositions.push(posB[pB]);
          pA++;
          pB++;
        } else if (posB[pB] < posA[pA] + 1) {
          pB++;
        } else {
          pA++;
        }
      }

      if (matchedPositions.length > 0) {
        result.push({
          docId,
          tf: matchedPositions.length,
          positions: matchedPositions
        });
      }
      i++;
      j++;
    } else if (entriesA[i].docId < entriesB[j].docId) {
      i++;
    } else {
      j++;
    }
  }

  return result;
}

module.exports = {
  PostingList,
  intersectPostings,
  intersectAll,
  unionPostings,
  differencePostings,
  intersectPhrase
};
