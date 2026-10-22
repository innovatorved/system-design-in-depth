window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["information-retrieval-system-design"] = [
  {
    "id": "information-retrieval-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Shared analyzer",
    "section": "Under the Hood: The Indexing Anatomy",
    "prompt": "Documents were indexed with a lowercase filter and a Porter stemmer, so the text \"Running shoes\" is stored as the terms run and shoe. A user searches for Running. Why must the query string go through the same token filters as the documents?",
    "options": [
      "Because the term dictionary is sorted, and an unanalyzed query term would force a full scan of the dictionary",
      "Because BM25 needs the query length in analyzed tokens to normalise the document length correctly",
      "Because the index only contains the analyzed terms, so an unanalyzed Running looks up a term that does not exist",
      "Because stemming at query time is what expands Running into synonyms such as jogging and sprinting"
    ],
    "answer": 2,
    "explanation": "The inverted index stores only the normalised tokens, so the query must be reduced to the same form (run) to find the postings. A scan of the dictionary is not what happens; an exact lookup for Running simply returns nothing.",
    "tags": [
      "information-retrieval-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "information-retrieval-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Re-ranking the funnel",
    "section": "Worked example: a 200 ms search latency budget",
    "prompt": "In the 200 ms budget, the ML re-ranker gets 50 ms to score about 1,000 candidates. A data scientist wants it to score 10,000 candidates for better recall, and per-candidate cost is constant. What is the most sensible response?",
    "options": [
      "Keep the heavy model on about 1,000 candidates and, if more recall is needed, add a cheap intermediate ranking stage that narrows 10,000 down to 1,000",
      "Take the 40 ms headroom and give it to the re-ranker, which covers the extra candidates with some margin to spare",
      "Move the re-ranker into candidate retrieval on each shard so the 10,000 candidates are scored in parallel for free",
      "Skip the fetch and highlight stage for this query class so its 20 ms can be spent on the larger candidate set"
    ],
    "answer": 0,
    "explanation": "At constant per-candidate cost, 10,000 candidates would take about 500 ms, so the fix is to deepen the funnel with a cheaper stage rather than feed the expensive one more work. The 40 ms headroom is nowhere near 450 ms extra and exists to absorb GC pauses and slow shards.",
    "tags": [
      "information-retrieval-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "information-retrieval-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Analyzer drift",
    "section": "Failure modes to plan for",
    "prompt": "A team adds a synonym rule mapping sneakers to trainers in the index-time analyzer and deploys it to the live index without reindexing. Over the following weeks, what do users experience?",
    "options": [
      "Nothing changes until the next segment merge, which rewrites every old document with the new analyzer automatically",
      "Every query fails with a mapping conflict until the index is closed and reopened with the new analyzer settings",
      "All documents immediately match both words, because synonym rules are applied to the stored postings on refresh",
      "Recently indexed or updated products match both words while older ones match only their original wording, so results depend on document age"
    ],
    "answer": 3,
    "explanation": "Only documents analyzed after the change get the extra tokens, so old and new documents disagree about what a term is: classic analyzer drift that only a reindex fixes. Segment merges combine existing postings; they do not re-run analysis on the original text.",
    "tags": [
      "information-retrieval-system-design",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["inverted-index-and-posting-lists"] = [
  {
    "id": "inverted-index-and-posting-lists-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why postings are sorted",
    "section": "Postings Lists & The Two-Pointer Intersection Invariant",
    "prompt": "An engineer proposes appending doc IDs to postings lists in arrival order to make indexing cheaper. Which capability is lost most directly?",
    "options": [
      "Computing IDF, because document frequency can only be read from a sorted postings list",
      "Answering AND queries with a single two-pointer merge in time proportional to the sum of list lengths",
      "Storing term positions, because positional data must be kept in the same order as the terms in the dictionary",
      "Looking up the term in the term dictionary, which is keyed by the first doc ID of each list"
    ],
    "answer": 1,
    "explanation": "The two-pointer merge only works because both cursors move forward through ascending IDs; unsorted lists force nested-loop or hash-based intersection. Document frequency is just the list length and does not depend on order.",
    "tags": [
      "inverted-index-and-posting-lists",
      "recall",
      "inline"
    ]
  },
  {
    "id": "inverted-index-and-posting-lists-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Delta plus VByte",
    "section": "Postings List Compression: Delta Gaps & Variable Byte",
    "prompt": "A postings list holds doc IDs 1000, 1004, 1008, 1020, 1200. After delta encoding, each value is stored with Variable-Byte encoding (7 payload bits per byte). How many bytes does the list take?",
    "options": [
      "5 bytes, because every value becomes a small gap that fits in one byte",
      "6 bytes, because only the first absolute ID needs a second byte",
      "7 bytes, because the first value 1000 and the gap of 180 each need two bytes",
      "20 bytes, because VByte falls back to 4 bytes when any ID exceeds 127"
    ],
    "answer": 2,
    "explanation": "The gaps are 1000, 4, 4, 12, 180; values below 128 take one byte and values from 128 to 16,383 take two, giving 2 + 1 + 1 + 1 + 2 = 7 bytes versus 20 raw. The tempting 6-byte answer forgets that a gap of 180 is still at least 128.",
    "tags": [
      "inverted-index-and-posting-lists",
      "apply",
      "inline"
    ]
  },
  {
    "id": "inverted-index-and-posting-lists-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Champion list blind spot",
    "section": "Skip Lists and Champion Lists",
    "prompt": "Each term keeps a champion list of its top 200 documents by per-term weight, and queries fall back to full postings only when too few candidates are found. For a two-term query, which document is most at risk of being missed even though it is the true best match?",
    "options": [
      "A document that is moderately strong for both terms but not in the top 200 for either one",
      "A document that is in the champion list of both terms and has the highest weight for each",
      "A document that is in the top 200 for one term and contains the other term only once",
      "A document that is newly indexed and has not yet been merged into a larger segment"
    ],
    "answer": 0,
    "explanation": "Champion lists are built per term, so a document that wins only through the combination of terms can sit outside both lists, and the fallback never fires as long as enough other candidates were found. A document present in either champion list is at least considered.",
    "tags": [
      "inverted-index-and-posting-lists",
      "staff",
      "inline"
    ]
  },
  {
    "id": "inverted-index-and-posting-lists-n1",
    "topic": "inverted-index-and-posting-lists",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Delta + VarInt Posting List Compression Savings",
    "scenario": "A popular search term appears in 10 million documents. Uncompressed, each posting stores an 8-byte (64-bit) document ID, totaling 80 MB. By sorting document IDs and encoding gaps (`deltas`) with Variable-Byte / PForDelta compression, each posting averages 1.6 bytes.",
    "prompt": "How many megabytes (MB) does the compressed posting list occupy (10,000,000 × 1.6 bytes, using 1 MB = 10^6 bytes)?",
    "question": "How many megabytes (MB) does the compressed posting list occupy (10,000,000 × 1.6 bytes, using 1 MB = 10^6 bytes)?",
    "unit": "MB",
    "answer": 16,
    "tolerance": 0.25,
    "hint": "10,000,000 postings × 1.6 bytes/posting ÷ 1,000,000 bytes/MB.",
    "explanation": "Sorting docIDs converts large 64-bit integers into small positive gaps (`d_i - d_{i-1}`), shrinking the 10M-entry posting list from 80 MB down to 16 MB (a 5x reduction in RAM and memory-bandwidth footprint).",
    "tags": [
      "inverted-index-and-posting-lists",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "inverted-index-and-posting-lists-t1",
    "topic": "inverted-index-and-posting-lists",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Document-Partitioned (Local Index) vs Term-Partitioned (Global Index) Sharding",
    "scenario": "You are designing a 50-shard full-text search cluster executing 3-word conjunctive (`AND`) queries at 20,000 queries/sec with a strict p99 latency SLO of 40 ms.",
    "prompt": "Should you partition the inverted index by Document ID (local index per shard) or by Term (global posting list per term), and why?",
    "question": "Should you partition the inverted index by Document ID (local index per shard) or by Term (global posting list per term), and why?",
    "options": [
      "Partition by Term so a 3-word `AND` query streams multi-megabyte posting lists across the network between shards to intersect them",
      "Partition by Document ID so each shard intersects all 3 posting lists locally in memory and returns only its top-K scored documents to the coordinator",
      "Replicate the entire 50-shard index onto every client browser via WebAssembly"
    ],
    "correctOption": 1,
    "reasons": [
      "Streaming millions of compressed docIDs over the network on every multi-term query minimizes network bandwidth",
      "Document partitioning performs posting-list intersection locally on each shard (shipping only tiny top-K results over the network) and isolates document indexing writes to a single shard",
      "Browser memory can hold petabytes of enterprise search indexes"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Consider network bandwidth when intersecting `term1 AND term2` if `term1` is on Shard A and `term2` is on Shard B.",
    "explanation": "In term partitioning, intersecting `term1 AND term2` requires transferring giant posting lists across the network between shards. Document partitioning executes the entire intersection and BM25 scoring locally within each shard and sends only `K` lightweight `{docId, score}` pairs back to the coordinator.",
    "tags": [
      "inverted-index-and-posting-lists",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["boolean-tiered-search"] = [
  {
    "id": "boolean-tiered-search-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What tiers may change",
    "section": "A separate optimization: quality-tiered indexes",
    "prompt": "A search system partitions documents into quality tiers. Which statement describes what the tiering is allowed to change?",
    "options": [
      "In the high-quality tier, SHOULD clauses may be promoted to MUST so that fewer documents need scoring",
      "In lower tiers, MUST clauses may be relaxed to SHOULD so that the cascade returns enough results",
      "Authorization filters may be skipped in the top tier because its documents are already vetted for quality",
      "Only which eligible documents are examined first; MUST clauses and access filters apply identically in every tier"
    ],
    "answer": 3,
    "explanation": "Quality tiers are a speed optimisation over the same eligibility rules; the lesson warns explicitly against using a tier to relax required terms or authorization filters. Relaxing MUST clauses in lower tiers changes the answer, not just the cost.",
    "tags": [
      "boolean-tiered-search",
      "recall",
      "inline"
    ]
  },
  {
    "id": "boolean-tiered-search-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Rarest-first ordering",
    "section": "Worked example: ordering a three-term AND",
    "prompt": "A query is kafka AND streams AND exactly-once. Postings lengths are kafka 400,000, streams 3,000,000 and exactly-once 20,000. Which pair should the engine intersect first?",
    "options": [
      "streams with kafka, so the two biggest lists are merged while the cursors are warm in cache",
      "exactly-once with kafka, because the two shortest lists produce the smallest intermediate set",
      "exactly-once with streams, so the rarest list can use skip pointers across the longest list first",
      "kafka with streams, because the query order reflects the user's intent and preserves ranking"
    ],
    "answer": 1,
    "explanation": "Rarest first means sorting by postings length and intersecting the two shortest lists, 20,000 and 400,000, so the tiny result can then gallop through the 3,000,000-entry list. Pairing the rarest with the longest list first still leaves a larger intermediate set than pairing the two rarest.",
    "tags": [
      "boolean-tiered-search",
      "apply",
      "inline"
    ]
  },
  {
    "id": "boolean-tiered-search-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Tier recall loss",
    "section": "Trade-offs",
    "prompt": "Tier 1 holds the top 10 percent of documents by static quality, and the engine stops if tier 1 returns at least 20 matches. Which situation is the classic way this design silently returns a worse answer?",
    "options": [
      "A long-tail query matches zero tier-1 documents, so the engine returns an empty page instead of cascading",
      "A head query matches thousands of tier-1 documents, so skip pointers can no longer be used and latency spikes",
      "Tier 1 has 20 weak textual matches, so a tier-2 document with a far stronger match for the query is never scored",
      "A document is promoted from tier 2 to tier 1 and appears twice in the merged results until the next rebuild"
    ],
    "answer": 2,
    "explanation": "Stopping at K tier-1 matches trades recall for latency: a lower-quality document with a much better textual match can deserve to outrank tier-1 documents but is never examined. Zero matches is not the failure, because that case is exactly when the cascade to tier 2 fires.",
    "tags": [
      "boolean-tiered-search",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["tf-idf-relevance-scoring"] = [
  {
    "id": "tf-idf-relevance-scoring-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Role of IDF",
    "section": "Under the Hood: The Mathematical Formulas",
    "prompt": "In a corpus of 10 million documents, the term system appears in 9 million of them and the term paxos in 2,000. What does the IDF factor do to their weights?",
    "options": [
      "It gives system a weight near zero and paxos a high weight, because rare terms discriminate between documents",
      "It gives system a higher weight because frequent terms are more likely to reflect what users actually type",
      "It gives both the same weight and leaves differences to TF, since IDF only normalises document length",
      "It removes system from the index entirely once its document frequency exceeds a fixed threshold"
    ],
    "answer": 0,
    "explanation": "IDF is a global rarity factor: a term in almost every document carries almost no information, while a rare term strongly separates relevant documents. Length normalisation is the job of cosine or BM25's b parameter, not IDF.",
    "tags": [
      "tf-idf-relevance-scoring",
      "recall",
      "inline"
    ]
  },
  {
    "id": "tf-idf-relevance-scoring-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Raw versus log TF",
    "section": "Worked example: why the log matters",
    "prompt": "N = 1,000,000. IDF with ln(1 + N/DF): paxos (DF 1,000) is 6.91, data (DF 500,000) is 1.10. Doc A has paxos once and data 30 times. Doc B has paxos 3 times and data 5 times. Which document wins under raw TF x IDF and under TF = 1 + ln f?",
    "options": [
      "A wins under both, because 30 mentions of data outweighs any damping",
      "B wins under both, because paxos has more than six times the IDF of data",
      "A wins under raw TF (about 39.9 vs 26.2), B wins under log TF (about 17.4 vs 11.7)",
      "B wins under raw TF (about 26.2 vs 17.4), A wins under log TF (about 39.9 vs 11.7)"
    ],
    "answer": 2,
    "explanation": "Raw: A = 6.91 + 33 = 39.9 versus B = 20.7 + 5.5 = 26.2. Log: A = 6.91 + 4.40 x 1.10 = 11.7 versus B = 2.10 x 6.91 + 2.61 x 1.10 = 17.4, so damping stops repetition of a common word from beating the rare, decisive term.",
    "tags": [
      "tf-idf-relevance-scoring",
      "apply",
      "inline"
    ]
  },
  {
    "id": "tf-idf-relevance-scoring-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Per-shard IDF skew",
    "section": "TF variants compared",
    "prompt": "A small index is split over 5 shards, and a burst of new documents about kubernetes all landed on shard 3. Users report that the same kind of kubernetes document ranks very differently depending on which shard holds it. What is the cause and the standard fix?",
    "options": [
      "Shard 3 is using a different stemmer; the fix is to reindex shard 3 with the mapping of the other shards",
      "IDF is computed per shard, so kubernetes looks common on shard 3 and rare elsewhere; dfs_query_then_fetch gathers global term statistics first at the cost of an extra round trip",
      "Log TF damping saturates differently on large shards; the fix is to switch to raw term counts everywhere",
      "Cosine norms are stale on shard 3; the fix is to force a refresh so that document vector lengths are recomputed"
    ],
    "answer": 1,
    "explanation": "Each shard scores with its own document frequencies, so uneven distribution gives the same term different IDF values; the DFS mode collects global statistics before scoring. A mapping mismatch would change which documents match, not just how the same documents score.",
    "tags": [
      "tf-idf-relevance-scoring",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["bm25-production-ranking"] = [
  {
    "id": "bm25-production-ranking-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Meaning of b = 0",
    "section": "Under the Hood: The Parameters k₁ and b",
    "prompt": "An engineer sets b = 0 on a BM25 field. What changes compared with the default b = 0.75?",
    "options": [
      "Term frequency no longer saturates, so repeated mentions keep adding score linearly",
      "The IDF term is dropped, so rare and common words contribute equally to the score",
      "The score becomes a probability between 0 and 1 that can be compared across queries",
      "Document length no longer affects the score, so a long document is not penalised for its length"
    ],
    "answer": 3,
    "explanation": "b controls length normalisation: at b = 0 the dl/avgdl term vanishes, and at b = 1 length is fully normalised. Saturation is governed by k1, which is untouched, so repetition still has diminishing returns.",
    "tags": [
      "bm25-production-ranking",
      "recall",
      "inline"
    ]
  },
  {
    "id": "bm25-production-ranking-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Stuffing payoff",
    "section": "Worked example: saturation and length in numbers",
    "prompt": "With k1 = 1.2, b = 0.75 and a document of exactly average length, a single mention of a term gives a TF component of 1.00. A spam page of the same length repeats the term 100 times. Roughly how much larger is its TF component?",
    "options": [
      "About 2.2 times, because the component approaches k1 + 1 no matter how many repeats",
      "About 5.6 times, the same growth that 1 + ln f damping would give",
      "About 10 times, the square root of the repetition count",
      "About 100 times, because the length is unchanged and only b dampens the count"
    ],
    "answer": 0,
    "explanation": "The worked table shows 100 mentions in an average document scores 2.17 versus 1.00 for one mention, bounded by the ceiling k1 + 1 = 2.2. The 5.6 times figure is what log TF would give, which grows without bound and is exactly what BM25 improves on.",
    "tags": [
      "bm25-production-ranking",
      "apply",
      "inline"
    ]
  },
  {
    "id": "bm25-production-ranking-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Absolute score thresholds",
    "section": "Production notes",
    "prompt": "A service shows a \"no good match\" banner whenever the top BM25 score is below 8.0. After upgrading to Lucene 8, the banner suddenly appears on many queries, yet result order is unchanged. What happened?",
    "options": [
      "Lucene 8 switched the default similarity back to classic TF-IDF, which produces smaller scores on average",
      "Lucene 8 changed the default b to 1.0, which penalises every document longer than the average",
      "Lucene 8 dropped the constant (k1 + 1) factor, rescaling every score without changing ranking, so a fixed absolute threshold broke",
      "Lucene 8 began computing IDF per segment rather than per shard, which lowers IDF for common terms"
    ],
    "answer": 2,
    "explanation": "Removing a constant multiplier scales all scores equally, so ranking is unchanged but any logic that treats raw BM25 values as absolute quality signals breaks. BM25 scores are only meaningful for ordering within one query; the default similarity remained BM25.",
    "tags": [
      "bm25-production-ranking",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["stop-words-and-champion-lists"] = [
  {
    "id": "stop-words-and-champion-lists-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Keeping stop words",
    "section": "Under the Hood: The Evolution of Stop Words",
    "prompt": "Why do modern engines keep words such as the and to in the index rather than stripping them at index time?",
    "options": [
      "Because their postings compress to almost nothing with delta encoding, so dropping them saves no space",
      "Because phrase and name queries such as The Who or to be or not to be become impossible otherwise; the cost is handled at query time by pruning",
      "Because BM25 assigns them a strongly negative IDF, which helps demote spam pages that overuse them",
      "Because the tokenizer cannot identify stop words until the query arrives and the language is known"
    ],
    "answer": 1,
    "explanation": "Removing stop words destroys queries where they carry meaning; modern engines keep them and use common-grams, positional indexes and WAND-style pruning to avoid paying for their huge lists. Their lists remain huge even when compressed, which is why pruning matters.",
    "tags": [
      "stop-words-and-champion-lists",
      "recall",
      "inline"
    ]
  },
  {
    "id": "stop-words-and-champion-lists-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "WAND upper bounds",
    "section": "How WAND skips work, in one paragraph",
    "prompt": "The current 10th-best score is 9.0. Per-term upper bounds are kafka 6.5, streams 2.0, apache 1.2 and the 0.1. Which candidate document must WAND actually score, rather than skip?",
    "options": [
      "A document containing streams, apache and the",
      "A document containing kafka and streams",
      "A document containing kafka, apache and the",
      "A document containing kafka, streams and apache"
    ],
    "answer": 3,
    "explanation": "Only kafka + streams + apache has an upper bound of 9.7, which could beat 9.0; the others top out at 3.3, 8.5 and 7.8, so they cannot enter the top 10 and are skipped. kafka and streams alone looks close but 8.5 is still below the threshold.",
    "tags": [
      "stop-words-and-champion-lists",
      "apply",
      "inline"
    ]
  },
  {
    "id": "stop-words-and-champion-lists-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Sizing champion lists",
    "section": "Champion list sizing",
    "prompt": "You must choose r, the champion list length per term, for a system returning K = 20 results. What is the defensible way to pick r?",
    "options": [
      "Set r equal to K so that champion lists hold exactly one page of results and use the least RAM",
      "Measure recall at K on a real query log against full evaluation for several values of r, and pick the smallest r that meets the recall target within the RAM budget",
      "Set r to the average postings length divided by 1,000, so every term gets the same fraction of its list",
      "Grow r until the fallback to full postings never fires, since any fallback means the champion lists are wrong"
    ],
    "answer": 1,
    "explanation": "Champion lists are an approximation whose recall depends on the query mix, so r must be chosen empirically, larger than K, trading RAM for recall. Eliminating fallback entirely is the wrong goal; fallback is the safety valve and a few percent of queries using it is expected.",
    "tags": [
      "stop-words-and-champion-lists",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["query-understanding-pipeline"] = [
  {
    "id": "query-understanding-pipeline-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Discounted synonyms",
    "section": "Under the Hood: Machine Learning at the Query Boundary",
    "prompt": "The pipeline expands hoodie to sweatshirt. Why is the expanded term given a lower weight, such as 0.5, than the original term?",
    "options": [
      "Because synonym postings are stored on slower disks and a lower weight reduces the I/O they cause",
      "So that documents matching the exact term the user typed rank above documents that match only the synonym",
      "Because BM25 cannot score a term that was not present in the original query string without a weight below 1",
      "So that the synonym only matches documents that also contain the original term somewhere in the body"
    ],
    "answer": 1,
    "explanation": "Discounting keeps the recall benefit of synonyms while ensuring exact matches win; letting synonyms outrank exact matches is a named trap. The weight is a ranking choice, not a storage or scoring-engine limitation.",
    "tags": [
      "query-understanding-pipeline",
      "recall",
      "inline"
    ]
  },
  {
    "id": "query-understanding-pipeline-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Filters versus boosts",
    "section": "Worked example: one query through the pipeline",
    "prompt": "Query: blue adidas hoodie size m. The tagger reports brand adidas (confidence 0.97), category hoodies (0.95) and colour blue (0.60). The catalogue has Adidas hoodies in size M, but none in blue. Which rewrite serves the user best?",
    "options": [
      "Filter on brand, category, colour and size, then relax only if the user clicks a no-results link",
      "Boost every tag equally and filter on nothing, so the ranking model decides all trade-offs",
      "Filter on colour and size because they are the most specific, and boost brand and category",
      "Filter on brand and category, boost colour and size, and text-match hoodie with synonyms at a lower weight"
    ],
    "answer": 3,
    "explanation": "High-confidence tags become hard filters while low-confidence or optional attributes become boosts, so the user still sees Adidas hoodies in M instead of an empty page. Filtering on the 0.60-confidence colour is exactly the trap that produces zero results.",
    "tags": [
      "query-understanding-pipeline",
      "apply",
      "inline"
    ]
  },
  {
    "id": "query-understanding-pipeline-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "LLM rewriting cost",
    "section": "Trade-offs",
    "prompt": "A team proposes sending every query through an LLM rewriter, while the query understanding stage has a budget of about 10 ms at p99 for 50,000 queries per second. What is the sound architecture?",
    "options": [
      "Precompute and cache rewrites for head queries, use dictionaries and fast taggers online, and reserve the LLM for tail queries, cached or run offline",
      "Run the LLM on every query but in parallel with retrieval, then discard its output whenever it arrives after the results",
      "Run the LLM on every query and raise the stage budget, since better understanding always pays for itself in conversion",
      "Replace spelling correction and tagging with the LLM, which removes enough stages to fit its latency into 10 ms"
    ],
    "answer": 0,
    "explanation": "LLM rewriting handles complex language but costs latency and money, so it belongs on the long tail with caching, while head traffic is served from precomputed results. Running it on every query in parallel still pays its full cost at 50,000 QPS for output that is often thrown away.",
    "tags": [
      "query-understanding-pipeline",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["search-feedback-and-relevance-signals"] = [
  {
    "id": "search-feedback-and-relevance-signals-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Raw click feedback loop",
    "section": "Under the Hood: Feature Engineering & Position Bias",
    "prompt": "A ranker is retrained every night on the previous day's raw click-through rates. What long-run behaviour does this produce?",
    "options": [
      "It converges to true relevance, because users eventually click the best result wherever it is shown",
      "It overfits to bot traffic but is otherwise unbiased, since each position gets the same number of impressions",
      "It entrenches whatever is already ranked high, because top positions get more clicks regardless of relevance",
      "It oscillates between two rankings, because the new top result loses clicks as soon as it is promoted"
    ],
    "answer": 2,
    "explanation": "Position bias means clicks partly reflect where an item was shown, so training on raw CTR rewards the current ranking and cements it. Positions do not receive equal attention, which is exactly why inverse propensity scoring is needed.",
    "tags": [
      "search-feedback-and-relevance-signals",
      "recall",
      "inline"
    ]
  },
  {
    "id": "search-feedback-and-relevance-signals-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Propensity weighting",
    "section": "Worked example: inverse propensity weighting",
    "prompt": "Examination propensities are 1.00 at position 1, 0.25 at position 4 and 0.12 at position 8. Observed clicks: 300 for the document at position 1, 90 at position 4 and 40 at position 8. Which document shows the strongest relevance signal after inverse propensity weighting?",
    "options": [
      "The document at position 1, with 300 weighted clicks",
      "The document at position 4, with 360 weighted clicks",
      "The document at position 8, with about 333 weighted clicks",
      "They are tied, because weighting just restores equal exposure"
    ],
    "answer": 1,
    "explanation": "Dividing clicks by propensity gives 300, 360 and about 333, so the position-4 document is strongest once you account for how rarely it is examined. Position 8 looks tempting because its weight grows most, but 40 / 0.12 is still below 90 / 0.25.",
    "tags": [
      "search-feedback-and-relevance-signals",
      "apply",
      "inline"
    ]
  },
  {
    "id": "search-feedback-and-relevance-signals-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Presentation bias",
    "section": "Failure modes",
    "prompt": "The product team adds a bold Bestseller badge to some listings. Two months later the CTR-trained ranker pushes badged items up for queries where they are clearly less relevant. What is the right correction?",
    "options": [
      "Remove all badged impressions from training data permanently, since their clicks cannot be trusted",
      "Lower the propensity estimate for badged items so their clicks are weighted up rather than down",
      "Switch to dwell time as the only label, since badges cannot influence how long a user stays",
      "Include presentation features such as the badge in the model or control for them, so its effect on CTR is not credited to relevance"
    ],
    "answer": 3,
    "explanation": "Badges and bigger images change CTR independently of relevance; modelling or controlling for presentation separates that effect from true relevance. Discarding all badged impressions throws away data and leaves the bias unmodelled for future presentation changes.",
    "tags": [
      "search-feedback-and-relevance-signals",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["search-evaluation-metrics"] = [
  {
    "id": "search-evaluation-metrics-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Recall in web search",
    "section": "The Core IR Evaluation Metrics",
    "prompt": "Why is Recall@K rarely reported as a headline metric for open web or large product search, even though it appears in every IR textbook?",
    "options": [
      "Its denominator, the total number of relevant documents in the corpus, is usually unknown outside a judged test collection",
      "It always equals Precision@K when K is at least the number of results on the first page",
      "It cannot handle graded relevance, so it produces values above 1 when documents have grades of 2 or more",
      "It is dominated by navigational queries, which have exactly one relevant document each"
    ],
    "answer": 0,
    "explanation": "Recall divides by all relevant documents in the corpus, which you only know on judged collections; that is why it suits legal discovery benchmarks rather than live web search. Recall is binary, but it does not break with graded labels; they are simply thresholded.",
    "tags": [
      "search-evaluation-metrics",
      "recall",
      "inline"
    ]
  },
  {
    "id": "search-evaluation-metrics-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Three metrics, one ranking",
    "section": "Worked example: scoring one ranking five ways",
    "prompt": "A query returns three results with graded relevance [0, 3, 2]. Using gain 2 to the power rel minus 1 and discount log2 of position plus 1, which set of values is correct?",
    "options": [
      "Precision@3 0.67, reciprocal rank 1.00, NDCG@3 about 0.67",
      "Precision@3 0.67, reciprocal rank 0.50, NDCG@3 about 0.83",
      "Precision@3 0.67, reciprocal rank 0.50, NDCG@3 about 0.67",
      "Precision@3 1.00, reciprocal rank 0.50, NDCG@3 about 0.67"
    ],
    "answer": 2,
    "explanation": "Two of three results are relevant (0.67), the first relevant one is at position 2 (RR 0.5), and DCG = 7/1.585 + 3/2 = 5.92 versus ideal 7 + 3/1.585 = 8.89, giving about 0.67. The 0.83 option forgets that the grade-3 document lost most of its gain by sliding from position 1 to 2.",
    "tags": [
      "search-evaluation-metrics",
      "apply",
      "inline"
    ]
  },
  {
    "id": "search-evaluation-metrics-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "What interleaving tells you",
    "section": "Online vs offline evaluation",
    "prompt": "A team-draft interleaving experiment shows users strongly prefer ranker B over ranker A after only two days. The team wants to announce that B will lift revenue by 2 percent and ship it. What is the gap in their reasoning?",
    "options": [
      "Interleaving needs more traffic than a standard A/B test, so two days cannot give a significant result",
      "Interleaving only measures offline NDCG on judged queries, so it says nothing about real user behaviour",
      "Interleaving is only valid when both rankers share the same first-stage retrieval, which is rarely true",
      "Interleaving shows which ranker users prefer, not by how much a business metric moves, so a full A/B test is needed to size the revenue impact"
    ],
    "answer": 3,
    "explanation": "Interleaving is a sensitive pre-screen for preference, but it cannot quantify revenue or conversion; that needs an A/B test with a traffic split. The first option has it backwards: interleaving needs far less traffic than A/B testing, not more.",
    "tags": [
      "search-evaluation-metrics",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["search-index-synchronization"] = [
  {
    "id": "search-index-synchronization-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Safe version source",
    "section": "Under the Hood: Solving Out-of-Order Updates",
    "prompt": "A CDC sync worker uses external versioning to reject stale updates. Which value is appropriate as the version for each document?",
    "options": [
      "The Elasticsearch _seq_no returned from the previous write, since it increases with every operation on the shard",
      "A source-owned revision that increases monotonically per document, such as a row version column or the WAL log sequence number",
      "The wall-clock time on the sync worker when it read the event from Kafka",
      "The Kafka partition offset of the event, reset to zero whenever the consumer group rebalances"
    ],
    "answer": 1,
    "explanation": "The ordering authority must be the source database, so a monotonic per-document revision or LSN is correct. _seq_no is assigned by Elasticsearch itself and says nothing about the primary database's commit order.",
    "tags": [
      "search-index-synchronization",
      "recall",
      "inline"
    ]
  },
  {
    "id": "search-index-synchronization-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Delete resurrection",
    "section": "Worked example: the out-of-order update",
    "prompt": "Product 42 is deleted at version 9. Because of a stuck retry, an update carrying version 8 reaches Elasticsearch five minutes later, with version_type=external and the default index.gc_deletes. What happens?",
    "options": [
      "The update is indexed and the product reappears, because the delete tombstone was discarded after 60 seconds",
      "The update is rejected, because external versioning permanently remembers the highest version for every ID",
      "The update is rejected, because Kafka guarantees the delete is applied last within the partition",
      "The update is indexed but hidden from search until the next refresh reconciles it with the tombstone"
    ],
    "answer": 0,
    "explanation": "Elasticsearch keeps delete tombstones only for gc_deletes, 60 seconds by default, so a very late older update can resurrect the document unless the pipeline guards against it. The version memory for deleted IDs is not permanent, which is why the second option is wrong.",
    "tags": [
      "search-index-synchronization",
      "apply",
      "inline"
    ]
  },
  {
    "id": "search-index-synchronization-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Offset before snapshot",
    "section": "Rebuilding without downtime",
    "prompt": "During a reindex into products_v2, an engineer takes the database snapshot first and records the CDC offset only after the bulk load finishes two hours later. What goes wrong?",
    "options": [
      "Nothing, because versioning makes the order of snapshot and offset irrelevant",
      "The alias swap fails, because Elasticsearch requires the offset to be stored in the index settings",
      "Changes committed during the two-hour load are never replayed into products_v2, so it silently misses them",
      "Every document is indexed twice, doubling the index size until the next force merge"
    ],
    "answer": 2,
    "explanation": "Recording the offset before the snapshot guarantees replay covers everything the snapshot might miss; versioning then makes the overlap safe. Versioning protects against duplicate or out-of-order events, but it cannot recover events that are never replayed.",
    "tags": [
      "search-index-synchronization",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["search-index-sharding"] = [
  {
    "id": "search-index-sharding-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why document partitioning",
    "section": "Document Partitioning vs Term Partitioning",
    "prompt": "Nearly every production engine partitions by document rather than by term. What is the main reason?",
    "options": [
      "Term partitioning cannot compute BM25 because document lengths are unknown on the term shards",
      "Document partitioning lets single-term queries hit only one shard, which removes scatter-gather",
      "Term partitioning cannot store positional data, so phrase queries become impossible",
      "Indexing a document touches exactly one shard, while term partitioning scatters every document's words across many shards"
    ],
    "answer": 3,
    "explanation": "Document partitioning keeps writes local, at the cost of scatter-gather reads; term partitioning makes single-term reads local but requires RPCs to many shards for every indexed document and network joins for multi-term queries. The second option describes term partitioning's advantage, not document partitioning's.",
    "tags": [
      "search-index-sharding",
      "recall",
      "inline"
    ]
  },
  {
    "id": "search-index-sharding-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Fan-out tail",
    "section": "Worked example: why fan-out hurts the tail",
    "prompt": "Each shard independently exceeds its own p99 latency 1 percent of the time. A query fans out to 50 shards and waits for all of them. Roughly how often does the query hit at least one slow shard?",
    "options": [
      "About 1 percent, because the shards are independent",
      "About 5 percent, the shard count times the tail probability divided by 10",
      "About 40 percent, from 1 minus 0.99 to the power 50",
      "About 60 percent, from 50 times 1 percent capped by the replica count"
    ],
    "answer": 2,
    "explanation": "0.99 to the power 50 is about 0.605, so about 39.5 percent of queries wait on a slow shard and the per-shard p99 becomes close to the query median. Independence is exactly why it compounds; it does not keep the rate at 1 percent.",
    "tags": [
      "search-index-sharding",
      "apply",
      "inline"
    ]
  },
  {
    "id": "search-index-sharding-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hot tenant shard",
    "section": "Routing trade-offs",
    "prompt": "A SaaS search cluster routes by tenant ID. One customer grows to 30 percent of all documents and queries, and its shard's node runs hot while others idle. What is the targeted fix?",
    "options": [
      "Switch back to hash-of-document-ID routing for all tenants so load is even again",
      "Use routing partitions so that tenant's documents span several shards, keeping fan-out small but no longer one shard",
      "Add replicas of every shard in the cluster so reads spread over more nodes",
      "Raise index.max_result_window so the large tenant's queries return in fewer round trips"
    ],
    "answer": 1,
    "explanation": "Routing partitions spread one routing key over a small set of shards, relieving the hot shard while keeping most of the fan-out saving. Reverting to hash routing fixes the hotspot but makes every small tenant's query scatter across the whole cluster again.",
    "tags": [
      "search-index-sharding",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["crawler-and-indexing-pipeline"] = [
  {
    "id": "crawler-and-indexing-pipeline-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Politeness queues",
    "section": "Under the Hood: Key Engineering Mechanisms",
    "prompt": "Why does a crawler's URL frontier keep a separate queue per host rather than one global FIFO?",
    "options": [
      "So it can enforce a minimum delay between requests to the same host while still keeping many hosts busy in parallel",
      "So DNS lookups can be skipped entirely, because all URLs in a queue share a precomputed IP address forever",
      "So SimHash fingerprints can be compared only within a host, which makes near-duplicate detection exact",
      "So the crawler can fetch each host's pages in strict alphabetical order for better compression"
    ],
    "answer": 0,
    "explanation": "Per-host queues let the frontier throttle each site, for example one request every 500 ms, without idling the fetcher fleet; a global FIFO lets one site dominate and gets the crawler blocked. DNS results are cached with TTLs, not fixed per queue forever.",
    "tags": [
      "crawler-and-indexing-pipeline",
      "recall",
      "inline"
    ]
  },
  {
    "id": "crawler-and-indexing-pipeline-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Hosts in flight",
    "section": "Worked example: back-of-envelope for 1 billion pages per month",
    "prompt": "You must crawl 2 billion pages in 30 days (2,592,000 seconds), and politeness allows one request every 2 seconds per host. About how many distinct hosts must be in flight at once, at minimum?",
    "options": [
      "About 390",
      "About 770",
      "About 1,540",
      "About 3,100"
    ],
    "answer": 2,
    "explanation": "2 billion over 2,592,000 seconds is about 770 pages per second, and at 0.5 requests per second per host you need about 1,540 hosts active concurrently. The tempting 770 is the page rate itself, which forgets the 2-second per-host delay.",
    "tags": [
      "crawler-and-indexing-pipeline",
      "apply",
      "inline"
    ]
  },
  {
    "id": "crawler-and-indexing-pipeline-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Bloom filter deletion",
    "section": "Worked example: sizing the URL-seen Bloom filter",
    "prompt": "To schedule recrawls, an engineer plans to clear a URL's bits in the URL-seen Bloom filter when it becomes due, so it is fetched again. What breaks?",
    "options": [
      "Nothing, because each URL owns its own set of 7 bits in an optimally sized filter",
      "The filter's false-positive rate rises, so more new URLs are skipped, but nothing is refetched wrongly",
      "The filter must be resized, because clearing bits changes the optimal bits-per-URL ratio",
      "Bits are shared between URLs, so clearing them creates false negatives for other URLs, which are then re-fetched as if never seen"
    ],
    "answer": 3,
    "explanation": "Plain Bloom filters cannot delete: bits are shared, so clearing one URL's bits makes other URLs look unseen, which introduces false negatives the design otherwise guarantees against. That is why recrawl scheduling lives in a separate store keyed by URL.",
    "tags": [
      "crawler-and-indexing-pipeline",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["vector-search-and-hybrid-retrieval"] = [
  {
    "id": "vector-search-and-hybrid-retrieval-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why rank fusion",
    "section": "Under the Hood: Hybrid Search Fusion (RRF)",
    "prompt": "A hybrid search returns BM25 scores in the range 0 to 40 and cosine similarities in the range 0.6 to 0.9. Why do most systems fuse them with Reciprocal Rank Fusion instead of adding the raw scores?",
    "options": [
      "Because RRF runs the two retrievers sequentially, which halves the query latency",
      "Because the scores are on incompatible scales, and RRF uses only rank positions so neither ranker dominates by accident",
      "Because cosine similarity cannot be computed for documents that BM25 did not retrieve",
      "Because adding scores requires both retrievers to return the same documents in the same order"
    ],
    "answer": 1,
    "explanation": "Summing raw scores lets BM25's larger range swamp the vector signal; RRF converts each list to ranks, sidestepping calibration. The retrievers usually run in parallel, and RRF changes only how results are merged, not latency.",
    "tags": [
      "vector-search-and-hybrid-retrieval",
      "recall",
      "inline"
    ]
  },
  {
    "id": "vector-search-and-hybrid-retrieval-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Vector memory math",
    "section": "Worked example: memory for 100 million vectors",
    "prompt": "You must store 50 million 1,024-dimensional embeddings. How much memory do the raw float32 vectors take, and how much with int8 scalar quantisation?",
    "options": [
      "About 51 GB as float32 and about 13 GB as int8",
      "About 205 GB as float32 and about 102 GB as int8",
      "About 410 GB as float32 and about 51 GB as int8",
      "About 205 GB as float32 and about 51 GB as int8"
    ],
    "answer": 3,
    "explanation": "50 million x 1,024 x 4 bytes is about 205 GB, and one byte per dimension gives about 51 GB, a 4x saving before HNSW links are added. The 102 GB option assumes int8 halves the size, but float32 is 4 bytes and int8 is 1.",
    "tags": [
      "vector-search-and-hybrid-retrieval",
      "apply",
      "inline"
    ]
  },
  {
    "id": "vector-search-and-hybrid-retrieval-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Post-filtering ANN",
    "section": "ANN index trade-offs",
    "prompt": "A multi-tenant app runs HNSW for the top 10 nearest vectors, then filters to the requesting tenant, who owns 0.5 percent of vectors. Users report empty or near-empty results. What is the fix?",
    "options": [
      "Apply the filter during graph traversal, or fall back to exact search over the tenant's vectors when the filter is very selective",
      "Raise ef_construction so the graph is built with more links, which guarantees more tenant matches",
      "Switch from cosine to dot-product similarity so tenant vectors cluster closer to each query",
      "Lower M so each node has fewer neighbours and the search visits more distinct regions of the graph"
    ],
    "answer": 0,
    "explanation": "Post-filtering 10 global neighbours to a 0.5 percent tenant leaves almost nothing; filtered HNSW traversal or exact search over the small filtered set solves it. A better-built graph still returns the global top 10, which are mostly other tenants' vectors.",
    "tags": [
      "vector-search-and-hybrid-retrieval",
      "staff",
      "inline"
    ]
  },
  {
    "id": "vector-search-and-hybrid-retrieval-n1",
    "topic": "vector-search-and-hybrid-retrieval",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Uncompressed Float32 HNSW Vector Index RAM Sizing",
    "scenario": "You are indexing 10 million document chunks using 768-dimensional `float32` embeddings (4 bytes per dimension) inside an in-memory HNSW graph. Assume HNSW graph adjacency links add ~25% overhead on top of the raw vector bytes (`3,072 bytes × 1.25 ≈ 3,840 bytes ≈ 4,000 bytes` per vector).",
    "prompt": "Using 4,000 bytes (4 KB) per indexed vector including HNSW graph overhead, how many gigabytes (GB, using 1 GB = 10^9 bytes) of RAM are required for 10 million vectors?",
    "question": "Using 4,000 bytes (4 KB) per indexed vector including HNSW graph overhead, how many gigabytes (GB, using 1 GB = 10^9 bytes) of RAM are required for 10 million vectors?",
    "unit": "GB",
    "answer": 40,
    "tolerance": 0.25,
    "hint": "10,000,000 vectors × 4,000 bytes/vector ÷ 10^9 bytes/GB.",
    "explanation": "Raw vectors alone require `10M × 768 × 4 B = 30.72 GB`. Adding ~25% HNSW neighbor-list graph overhead brings the memory footprint to ~38.4–40 GB of RAM per replica for just 10M vectors.",
    "tags": [
      "vector-search-and-hybrid-retrieval",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "vector-search-and-hybrid-retrieval-t1",
    "topic": "vector-search-and-hybrid-retrieval",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Dense Vector ANN vs Hybrid Lexical (BM25) + Vector Retrieval with RRF",
    "scenario": "An enterprise e-commerce search engine switches 100% of queries from BM25 lexical search to dense `float32` vector embeddings. Support tickets immediately spike because searches for exact SKU model numbers (e.g., `WH-1000XM5` or `error_code_0x80070005`) return semantically vague headphones instead of the exact model.",
    "prompt": "Which retrieval architecture fixes exact-token recall while preserving semantic understanding, and why?",
    "question": "Which retrieval architecture fixes exact-token recall while preserving semantic understanding, and why?",
    "options": [
      "Increase vector embedding dimensions from 768 to 4096 and remove all text indexes",
      "Run parallel hybrid retrieval combining sparse lexical BM25 (exact token/SKU matching) with dense ANN vector search, fusing candidate lists via Reciprocal Rank Fusion (RRF) and a cross-encoder reranker",
      "Replace vector search with SQL `LIKE '%query%'` full-table scans"
    ],
    "correctOption": 1,
    "reasons": [
      "Dense bi-encoder embeddings natively memorize every arbitrary alphanumeric SKU and hex error code without compression loss",
      "BM25 provides exact rare-token precision while dense ANN captures semantic synonyms; fusing top candidates via RRF and reranking the top 50–100 delivers high recall and precision within latency bounds",
      "Full-table `LIKE '%...%'` scans scale to 100M documents at <20 ms latency"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why do dense bi-encoder embeddings struggle with out-of-vocabulary SKUs, part numbers, and exact identifiers?",
    "explanation": "Dense embeddings compress passages into fixed-width semantic vectors, losing fidelity on exact rare tokens like SKUs or hex codes. Hybrid retrieval (BM25 + dense ANN fused via Reciprocal Rank Fusion and top-K cross-encoder reranking) combines exact lexical precision with semantic recall.",
    "tags": [
      "vector-search-and-hybrid-retrieval",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["autocomplete-system-design"] = [
  {
    "id": "autocomplete-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Pre-materialised top-K",
    "section": "Under the Hood: Why Naive Tries Fail at Scale",
    "prompt": "Why does a production typeahead store a precomputed top-K suggestion list at every trie node instead of searching the subtree when a prefix arrives?",
    "options": [
      "Because the subtree search returns suggestions in alphabetical order, which users find less useful than frequency order",
      "Because a precomputed list lets the trie skip the offline aggregation pipeline, so updates appear instantly",
      "Because a DFS under a short, popular prefix such as s touches a huge subtree, while a stored list makes the lookup cost proportional to the prefix length",
      "Because trie nodes cannot store frequency counts, so the ranking must be computed somewhere else"
    ],
    "answer": 2,
    "explanation": "Pre-materialisation turns query time into walking |prefix| nodes and reading a bounded list, avoiding a subtree DFS that can take hundreds of milliseconds. It relies on offline aggregation rather than removing it.",
    "tags": [
      "autocomplete-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "autocomplete-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Typeahead QPS",
    "section": "Worked example: capacity estimate",
    "prompt": "A site has 2 billion searches per day. After client-side debouncing, each search triggers about 5 suggestion requests, and peak is 3 times average. What peak QPS should the suggestion service be provisioned for?",
    "options": [
      "About 350,000",
      "About 116,000",
      "About 70,000",
      "About 1,000,000"
    ],
    "answer": 0,
    "explanation": "10 billion requests per day divided by 86,400 seconds is about 116,000 average, and 3 times that is about 350,000 peak. The 116,000 option is the average, which would saturate at every daily peak.",
    "tags": [
      "autocomplete-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "autocomplete-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Suggestion manipulation",
    "section": "Failure modes",
    "prompt": "A competitor runs bots that search an insulting phrase about your brand 2 million times a day, and it starts appearing as a suggestion. Which change to the aggregation step addresses the root cause?",
    "options": [
      "Rebuild the trie every minute so the phrase can be removed faster once it appears",
      "Raise the recency decay so that bursts of recent searches count for less than older ones",
      "Cache short prefixes at the CDN so that bot traffic never reaches the aggregation pipeline",
      "Score candidates by distinct users rather than raw search counts, alongside safety filtering before publishing"
    ],
    "answer": 3,
    "explanation": "Counting distinct users makes a flood of bot searches from few identities worth little, and safety filters catch offensive completions before a build ships. CDN caching affects the read path only; the bots' searches still reach the logs that feed aggregation.",
    "tags": [
      "autocomplete-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "autocomplete-system-design-n1",
    "topic": "autocomplete-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Keystroke Autocomplete QPS With Client Debouncing",
    "scenario": "500,000 concurrent users are actively typing search queries. Each user types an average of 6 characters per second. Without debouncing, every keystroke fires an RPC (3,000,000 req/s). You add a 150 ms client-side debounce / throttle that coalesces rapid keystrokes so only 1 request is sent per 3 characters typed.",
    "prompt": "What is the resulting autocomplete request rate (in millions of req/s) reaching the edge after a 3-to-1 debounce reduction?",
    "question": "What is the resulting autocomplete request rate (in millions of req/s) reaching the edge after a 3-to-1 debounce reduction?",
    "unit": "million req/s",
    "answer": 1,
    "tolerance": 0.25,
    "hint": "Unthrottled rate = 500,000 × 6 = 3,000,000 req/s. Divide by 3 for the debounced rate.",
    "explanation": "500,000 concurrent typists × 6 chars/s = 3,000,000 keystrokes/s. Coalescing 3 keystrokes per network call via a ~150 ms debounce cuts edge QPS by 67% down to 1,000,000 (1 million) req/s.",
    "tags": [
      "autocomplete-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "autocomplete-system-design-t1",
    "topic": "autocomplete-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Runtime Trie Traversal vs Precomputed Top-K per Prefix Node",
    "scenario": "Your autocomplete service must return the top 10 completions for popular short prefixes (like `'s'` or `'st'`, which match millions of completions in the trie) within a 10 ms p99 budget.",
    "prompt": "How should the prefix trie be structured and updated in production, and why?",
    "question": "How should the prefix trie be structured and updated in production, and why?",
    "options": [
      "Traverse the entire subtree under prefix `'s'` at query time and sort all 2 million matching leaves on every keystroke",
      "Materialize the pre-sorted top-K (e.g., top 10) completions directly inside every prefix node/key in an immutable memory-mapped FST/KV snapshot, rebuilt periodically by an offline/nearline aggregation pipeline",
      "Increment node counters synchronously inside the live serving trie on every single search query using global write locks"
    ],
    "correctOption": 1,
    "reasons": [
      "Sorting 2 million subtree nodes per keystroke takes less than 1 microsecond",
      "Caching top-K completions at each prefix node reduces query complexity from O(subtree_size) to O(prefix_length) (an O(1) key lookup), while immutable snapshot swaps avoid read/write lock contention",
      "Global write locks on the root trie node scale cleanly to 1 million QPS"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What is the time complexity of looking up a prefix if its top 10 completions are pre-stored directly on the prefix node?",
    "explanation": "Precomputing and storing the top-10 completions at every prefix node turns runtime query serving into an `O(1)` hash/FST lookup with zero subtree traversal, while building immutable trie snapshots off-path prevents lock contention on hot root prefixes.",
    "tags": [
      "autocomplete-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["did-you-mean-and-spell-correction"] = [
  {
    "id": "did-you-mean-and-spell-correction-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Symmetric delete",
    "section": "Under the Hood: SymSpell vs Traditional Levenshtein Distance",
    "prompt": "What does SymSpell precompute to make spelling correction fast?",
    "options": [
      "All insertions, deletions, substitutions and transpositions of each dictionary word, stored in a trie",
      "A Levenshtein distance matrix between every pair of dictionary words",
      "A keyboard-adjacency graph used to generate candidates for each typed character",
      "Deletions up to distance K of every dictionary word in a hash table, so at query time only the typo's own deletions are looked up"
    ],
    "answer": 3,
    "explanation": "Symmetric delete precomputes only deletions of dictionary words and matches them against deletions of the input, then verifies with a true edit distance. Generating all four edit types for every word would explode the index, which is what SymSpell avoids.",
    "tags": [
      "did-you-mean-and-spell-correction",
      "recall",
      "inline"
    ]
  },
  {
    "id": "did-you-mean-and-spell-correction-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Noisy channel choice",
    "section": "Worked example: noisy channel scoring",
    "prompt": "A user types kafak. Candidates: kafka with P(word) 0.001 and P(kafak given kafka) 0.001 (adjacent transposition), and kayak with P(word) 0.002 and P(kafak given kayak) 0.0001 (y to f substitution). Which correction does the noisy channel model pick?",
    "options": [
      "kayak, because it is twice as frequent in the query logs",
      "kafka, because its product is about 1 x 10 to the minus 6, five times higher than kayak's",
      "kayak, because a substitution counts as one edit while a transposition counts as two",
      "Neither, because the two products are within one order of magnitude and count as a tie"
    ],
    "answer": 1,
    "explanation": "0.001 x 0.001 = 1 x 10 to the minus 6 beats 0.002 x 0.0001 = 2 x 10 to the minus 7, because the error model makes the transposition far likelier than that substitution. Prior frequency alone favours kayak, which is exactly why the error model term matters.",
    "tags": [
      "did-you-mean-and-spell-correction",
      "apply",
      "inline"
    ]
  },
  {
    "id": "did-you-mean-and-spell-correction-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Measuring bad corrections",
    "section": "Failure modes",
    "prompt": "After shipping auto-correction, you suspect it is replacing valid product codes and surnames. Which production signal most directly measures bad corrections?",
    "options": [
      "The share of queries that the corrector changes, compared with the 10 to 15 percent typo rate",
      "The average edit distance between original and corrected queries across all traffic",
      "The rate at which users click search instead for the original query after a correction",
      "The zero-result rate of corrected queries, which should fall to zero if corrections are right"
    ],
    "answer": 2,
    "explanation": "When a user overrides the correction to get back their original query, that is direct evidence the correction was wrong. The share of changed queries says nothing about whether each change was right, and a bad correction can still return plenty of results.",
    "tags": [
      "did-you-mean-and-spell-correction",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["related-searches"] = [
  {
    "id": "related-searches-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Click graph finds synonyms",
    "section": "Under the Hood: Mining Algorithms",
    "prompt": "Two queries are linked in the query-click bipartite graph because users who typed either one clicked the same set of URLs. What kind of relationship does this signal mostly uncover?",
    "options": [
      "Queries with the same meaning, such as synonyms or paraphrases of one another",
      "Next-step refinements that users typically search after finishing the first task",
      "Queries that are popular at the same time of day, regardless of topic",
      "Queries with the most characters in common, such as shared prefixes"
    ],
    "answer": 0,
    "explanation": "Shared click destinations mean the queries are satisfied by the same content, which surfaces synonyms; the lesson notes this signal finds same-meaning queries rather than useful next steps. Next-step refinements come from session reformulation, A followed by B.",
    "tags": [
      "related-searches",
      "recall",
      "inline"
    ]
  },
  {
    "id": "related-searches-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "PMI versus raw counts",
    "section": "Worked example: PMI beats raw counts",
    "prompt": "Out of 20 million sessions, query A appears in 200,000. Candidate B appears in 40,000 sessions and co-occurs with A in 4,000. Candidate C appears in 2,000,000 and co-occurs with A in 30,000. What are the lift ratios, P(A and X) divided by P(A) x P(X)?",
    "options": [
      "B 1.5 and C 10, so C should be suggested",
      "B 2 and C 15, so C should be suggested",
      "B 10 and C 1.5, so B should be suggested",
      "B 10 and C 15, so C should be suggested"
    ],
    "answer": 2,
    "explanation": "For B: 0.0002 divided by (0.01 x 0.002) = 10. For C: 0.0015 divided by (0.01 x 0.1) = 1.5, so C co-occurs only slightly more than chance despite its larger raw count. Choosing C mistakes popularity for association.",
    "tags": [
      "related-searches",
      "apply",
      "inline"
    ]
  },
  {
    "id": "related-searches-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Rare-pair privacy",
    "section": "Serving",
    "prompt": "The nightly job finds a pair with enormous PMI: a rare query and a person's full name that co-occurred in 3 sessions, all from the same user. What should stop it from being served?",
    "options": [
      "Nothing, because a high PMI value already proves the association is meaningful",
      "A smoothed PMI formula alone, since smoothing removes every pair with low counts",
      "An embedding fallback, which replaces session-mined pairs whenever they are rare",
      "A minimum co-occurrence count across distinct users, which blocks both noisy rare pairs and suggestions that could reveal one person's searches"
    ],
    "answer": 3,
    "explanation": "PMI inflates rare pairs, and a suggestion built from one user's sessions can leak their searches, so production systems require minimum support counted over distinct users. Smoothing reduces noise but does not by itself guarantee that many different people contributed.",
    "tags": [
      "related-searches",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["recent-searches-system-design"] = [
  {
    "id": "recent-searches-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Sorted set over list",
    "section": "Under the Hood: Redis Sorted Sets vs Lists",
    "prompt": "A user searches iPhone five times in a row. Why does a Redis sorted set keyed by user, with the query as member and timestamp as score, behave better than LPUSH plus LTRIM on a list?",
    "options": [
      "Sorted sets persist to disk synchronously, while lists are lost when the node restarts",
      "Members are unique, so ZADD refreshes the existing entry's timestamp instead of adding four duplicates",
      "Sorted sets are compressed with listpack while lists are not, so they fit ten times more entries",
      "Lists cannot be trimmed atomically, so their length drifts above the cap under concurrency"
    ],
    "answer": 1,
    "explanation": "A sorted set de-duplicates by member and ZADD moves the existing entry to the top by updating its score, while a list stores five copies and de-duplicating it is O(N). Persistence is the same for both data types; it is a server setting.",
    "tags": [
      "recent-searches-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "recent-searches-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Hot-set sizing",
    "section": "Worked example: sizing",
    "prompt": "You keep only daily active users in Redis: 200 million users at about 1 KB each for a 10-entry history. They perform 3 billion searches per day. What memory and average write rate should you plan for?",
    "options": [
      "About 200 GB and about 35,000 writes per second",
      "About 20 GB and about 35,000 writes per second",
      "About 200 GB and about 3,500 writes per second",
      "About 2 TB and about 350,000 writes per second"
    ],
    "answer": 0,
    "explanation": "200 million x 1 KB is about 200 GB across the cluster, and 3 billion divided by 86,400 is about 35,000 writes per second. The 20 GB option counts only the raw 30-byte queries and ignores the key and encoding overhead the lesson includes.",
    "tags": [
      "recent-searches-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "recent-searches-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Non-atomic write path",
    "section": "The write path, atomically",
    "prompt": "The worker sends ZADD, ZREMRANGEBYRANK and EXPIRE as three separate calls. For a brand-new user, it crashes right after ZADD. What is the most serious consequence?",
    "options": [
      "The query is recorded twice, because ZADD is retried on restart and sorted sets allow duplicates",
      "The read path returns results in oldest-first order until the next trim",
      "The key has no TTL, so this history can live indefinitely and violate the 90-day retention promise",
      "Redis rejects the key, because a sorted set without an expiry cannot be read with ZRANGE REV"
    ],
    "answer": 2,
    "explanation": "Without the EXPIRE the new key never expires, which breaks retention and privacy obligations; running the steps in one Lua script or MULTI block prevents the partial state. A retried ZADD is harmless, because sorted-set members are unique and the timestamp is simply refreshed.",
    "tags": [
      "recent-searches-system-design",
      "staff",
      "inline"
    ]
  }
];
