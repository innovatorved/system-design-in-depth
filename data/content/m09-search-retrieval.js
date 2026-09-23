window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-search-retrieval"] = {
  "information-retrieval-system-design": {
    "title": "Information retrieval system design",
    "video": {
      "youtubeId": "MXLMQ5yWIwk",
      "title": "Search Engine Design | Google Search Architecture and Ranking",
      "channel": "Architecture Bytes - AI"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Search Engine Architecture</h2>\n      <p>Traditional relational databases optimize for exact-match point lookups and transactional ACID guarantees using B-Trees. An Information Retrieval (IR) system (such as Apache Lucene, Elasticsearch, and Google Search) is engineered for full-text search, unstructured natural language understanding, fuzzy matching, and multi-factor relevance ranking across billions of documents.</p>\n\n      <h2>Dual-Plane IR Pipeline: Indexing vs Query Serving</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph IngestPipeline [\"1. Offline / Streaming Ingest Pipeline\"]\n      Docs[\"Raw Documents (HTML, JSON, DB Records)\"] --> Tokenizer[\"Tokenization & Normalization\"]\n      Tokenizer --> Stemmer[\"Linguistic Stemming (Porter / Snowball)\"]\n      Stemmer --> TermDict[\"Term Dictionary & Inverted Index Construction\"]\n      TermDict --> Segment[\"Flush Immutable Lucene Segments to Disk\"]\n    end\n\n    subgraph QueryPipeline [\"2. Online Query Serving Pipeline\"]\n      UserQuery[\"User Search: 'distributed cache redis'\"] --> QP[\"Query Parser & Analyzer\"]\n      QP --> TermLookup[\"Term Dictionary Inverted Index Seek\"]\n      TermLookup --> Intersect[\"Postings List Intersection (Skip Pointers / Roaring)\"]\n      Intersect --> Ranker[\"Relevance Scoring (BM25 + Learning-to-Rank)\"]\n      Ranker --> TopK[\"Return Top 20 Results with Highlights & Facets\"]\n    end\n      </div>\n\n      <h2>Under the Hood: The Indexing Anatomy</h2>\n      <ul>\n        <li><strong>Character Filters:</strong> Strip HTML markup, decode entities (e.g. <code>&amp;amp;</code> -> <code>&amp;</code>), and map custom regex patterns.</li>\n        <li><strong>Tokenizer:</strong> Breaks continuous text streams into discrete linguistic tokens based on word boundaries, punctuation, and Unicode script rules.</li>\n        <li><strong>Token Filters:</strong> Lowercases tokens, removes stop words (optional), expands synonyms, and applies stemming algorithms (reducing \"running\", \"runs\", \"ran\" to the common root \"run\").</li>\n      </ul>\n    </div>",
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
        "title": "Croft, Metzler, Strohman: Search Engines: Information Retrieval in Practice (Addison-Wesley)",
        "url": "https://www.search-engines-book.com/"
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
      "channel": "Arpit Bhayani"
    },
    "content": "<div class=\"lesson-content\">\n      <div class=\"callout callout--note\">\n        <div class=\"callout__title\">Implementation build</div>\n        <p>A companion from-scratch implementation is available in the builds catalog: <a href=\"#build/tiny-search-engine\">Tiny Search Engine (Inverted Index, Compression & BM25)</a>.</p>\n      </div>\n\n      <h2>Under the Hood: The Inverted Index Data Structure</h2>\n      <p>Traditional relational databases organize data around documents or rows (DocID → Text content). Evaluating a full-text search query like <code>WHERE content LIKE '%consensus%'</code> forces a full table scan across millions of rows (<code>O(N)</code> execution time).</p>\n      <p>An <strong>Inverted Index</strong> reverses this relationship: every distinct vocabulary term points to a strictly sorted list of Document IDs where <code>DCG = Σ (2^relᵢ - 1) / log₂(i + 1)</code>..</td><td><strong>The Gold Standard:</strong> Evaluates graded relevance (0-4 stars) with position discounting.</td></tr>\n        </tbody>\n      </table>\n\n      <h2>Under the Hood: Interleaving A/B Testing</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph TraditionalAB [\"Traditional A/B Test (High Variance: 100k Users Needed)\"]\n      U1[\"50% Users -> Model A\"]\n      U2[\"50% Users -> Model B\"]\n    end\n\n    subgraph Interleaving [\"Team-Draft Interleaving (100x Faster: 1k Users Needed)\"]\n      Q[\"User Query\"] --> Interleaver[\"Team-Draft Interleaver\"]\n      Interleaver --> Combined[\"Rank 1: Model A #1<br/>Rank 2: Model B #1<br/>Rank 3: Model A #2<br/>Rank 4: Model B #2\"]\n      Combined --> ClickTelemetry[\"Detect which algorithm's items won the user's click!\"]\n    end\n      </div>\n      <p>Interleaving blends the top results of Model A and Model B into a single merged result list presented to every user. This eliminates user variance, allowing engineering teams to validate ranking changes with 1/100th of the sample size.</p>\n    </div>",
    "keyTakeaways": [
      "NDCG (Normalized Discounted Cumulative Gain) is the gold standard metric for graded relevance rankings.",
      "Precision@K measures top-slot purity; Recall@K measures corpus coverage.",
      "Interleaved A/B testing blends candidate rankings to detect statistically significant user preference with far fewer queries than traditional A/B testing (see: Radlinski & Craswell, 'Comparing the Power of Interleaving and A/B Testing', SIGIR 2010)."
    ],
    "furtherReading": [
      {
        "title": "Chapelle et al.: Large-scale Validation and Analysis of Interleaved Search Evaluation",
        "url": "https://dl.acm.org/doi/10.1145/2168752.2168754"
      },
      {
        "title": "Manning et al.: Evaluation of Information Retrieval Systems (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-unranked-retrieval-results-1.html"
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
      "youtubeId": "PuZvF2EyfBM",
      "title": "Elasticsearch Deep Dive w/ a Ex-Meta Senior Manager for System Design Interviews",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Synchronization Challenge: Near-Real-Time (NRT) Indexing</h2>\n      <p>Primary transactional records live in relational or NoSQL databases (PostgreSQL, DynamoDB, MongoDB), while read queries target Elasticsearch or OpenSearch. Keeping the search index synchronized with the primary database under high write volumes presents severe race conditions and consistency challenges.</p>\n\n      <h2>CDC Pipeline with Debezium and Kafka</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    App[\"Merchant Service\"] -->|\"1. ACID Write: UPDATE products\"| DB[(\"PostgreSQL Primary DB\")]\n    DB -->|\"2. Write-Ahead Log (WAL)\"| CDC[\"Debezium Change Data Capture (CDC)\"]\n    CDC -->|\"3. Stream Mutation Event\"| Kafka[(\"Kafka Topic: catalog.updates\")]\n    \n    Kafka --> SyncWorker[\"Index Sync Worker\"]\n    SyncWorker -->|\"4. Batch Bulk Index API (100 items / 500ms)\"| ES[(\"Elasticsearch Cluster\")]\n    \n    subgraph LuceneEngine [\"Inside Elasticsearch Node\"]\n      ES --> Buffer[\"In-Memory Indexing Buffer\"]\n      Buffer -->|\"5. refresh_interval: 1s\"| Segment[\"New In-Memory Searchable Segment (NRT)\"]\n      Segment -->|\"6. Periodic fsync / commit (30s)\"| DiskStorage[(\"Persistent Disk\")]\n    end\n      </div>\n\n      <h2>Under the Hood: Solving Out-of-Order Updates</h2>\n      <p>Because Kafka partitions are processed by concurrent worker threads, network delays can cause an older update (V₁) to arrive <em>after</em> a newer update (V₂). If the worker naively writes V₁, the search index is left with permanently corrupted stale data.</p>\n      <p><strong>Source revisions and Elasticsearch concurrency tokens are different tools.</strong> A CDC event can carry a source-owned, strictly monotonic revision and use external versioning where supported. Elasticsearch's <code>_seq_no</code> and <code>_primary_term</code> are assigned by Elasticsearch and can guard a read-modify-write against the version already observed there; they are not primary-database sequence numbers. Wall-clock timestamps are unsafe unless the source guarantees monotonic, unique ordering. Whichever mechanism is used, deletes and updates must share one ordering rule.</p>\n    </div>",
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
      "youtubeId": "PuZvF2EyfBM",
      "title": "Elasticsearch Deep Dive w/ a Ex-Meta Senior Manager for System Design Interviews",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Distributing Inverted Indexes Across Clusters</h2>\n      <p>When an index grows to hundreds of gigabytes or billions of documents, it must be partitioned across multiple machines. In search systems, partitioning is called <strong>Sharding</strong>. Each Elasticsearch shard is a fully functional, self-contained Apache Lucene instance.</p>\n\n      <h2>Document-Based Sharding: Scatter-Gather Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client: Search('shoes', size=10)\"] --> Coord[\"Coordinating Node (Envoy / ES Node)\"]\n    \n    subgraph Shards [\"Distributed Shard Fleet\"]\n      Coord -->|\"Broadcast Query\"| S1[\"Shard 1: Searches local Lucene index -> Returns top 10\"]\n      Coord -->|\"Broadcast Query\"| S2[\"Shard 2: Searches local Lucene index -> Returns top 10\"]\n      Coord -->|\"Broadcast Query\"| S3[\"Shard 3: Searches local Lucene index -> Returns top 10\"]\n    end\n    \n    S1 & S2 & S3 -->|\"Return Doc IDs + BM25 Scores\"| Coord\n    Coord -->|\"Merge Sort 30 candidates -> Extract Top 10\"| Fetch[\"Fetch Phase: Fetch full _source for top 10 docs\"]\n    Fetch --> Client\n      </div>\n\n      <h2>Document Partitioning vs Term Partitioning</h2>\n      <table>\n        <thead>\n          <tr><th>Strategy</th><th>Document Partitioning (Scatter-Gather)</th><th>Term Partitioning</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Partition Logic</strong></td><td>Documents are hashed to shards by DocID: <code>shard = Murmur3(id) % N</code>. Each shard contains all terms for its subset of documents.</td><td>Vocabulary is split across shards: Shard 1 holds \"a\"-\"g\", Shard 2 holds \"h\"-\"p\".</td></tr>\n          <tr><td><strong>Ingest Speed</strong></td><td><strong>Fast & Local:</strong> Document is indexed entirely on a single shard with zero network coordination.</td><td>Slow: Indexing a single document requires network RPCs to scatter words across all shards.</td></tr>\n          <tr><td><strong>Query Execution</strong></td><td>Requires <strong>Scatter-Gather</strong> across all <code>N</code> shards.</td><td>Multi-term queries require network joins across term shards.</td></tr>\n        </tbody>\n      </table>\n      <p><strong>Custom Routing for Multi-Tenancy:</strong> In SaaS platforms, querying every shard for a single customer is wasteful. Setting <code>routing=tenant_id</code> forces all documents belonging to tenant 42 into a single shard, converting a global scatter-gather into a single-shard targeted seek.</p>\n    </div>",
    "keyTakeaways": [
      "Elasticsearch uses Document Partitioning where each shard is a standalone Lucene index.",
      "Queries execute via a two-phase Query-Then-Fetch scatter-gather coordination across all shards.",
      "Custom routing keys isolate tenant data to specific shards, eliminating cluster-wide scatter-gather overhead."
    ],
    "furtherReading": [
      {
        "title": "Elasticsearch Internals: Scalable Search with Sharding",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html"
      },
      {
        "title": "Elasticsearch Guide: Shards and Replicas (Official Documentation)",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html"
      },
      {
        "title": "Dean & Ghemawat: MapReduce: Simplified Data Processing on Large Clusters (ACM Queue)",
        "url": "https://research.google/papers/mapreduce-simplified-data-processing-on-large-clusters.pdf"
      }
    ]
  },
  "crawler-and-indexing-pipeline": {
    "title": "Crawler and indexing pipeline",
    "video": {
      "youtubeId": "MXLMQ5yWIwk",
      "title": "Search Engine Design | Google Search Architecture and Ranking",
      "channel": "Architecture Bytes - AI"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Harvesting the Web at Scale</h2>\n      <p>A web crawler (like Googlebot) systematically navigates the World Wide Web to discover, download, and index billions of web pages. Operating at this scale requires solving polite crawling, infinite URL traps, duplicate page detection, and high-throughput HTML extraction.</p>\n\n      <h2>The Mercator Web Crawler Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Seed[\"Seed URLs\"] --> Frontier[\"URL Frontier (Priority & Politeness Queues)\"]\n    Frontier --> Fetcher[\"Async Fetcher Fleet (DNS Cache + HTTP/2 Client)\"]\n    Fetcher --> DedupeDoc{\"Doc Seen Before? (SimHash 64-Bit)\"}\n    \n    DedupeDoc -->|\"Duplicate\"| Drop[\"Discard Payload\"]\n    DedupeDoc -->|\"New Content\"| Parse[\"HTML Parser & Content Extractor\"]\n    \n    Parse --> IndexPipeline[(\"Search Ingestion Pipeline\")]\n    Parse --> LinkExtractor[\"Extract New URLs\"]\n    LinkExtractor --> Filter{\"Seen URL? (Bloom Filter)\"}\n    Filter -->|\"New URL\"| Frontier\n      </div>\n\n      <h2>Under the Hood: Key Engineering Mechanisms</h2>\n      <ul>\n        <li><strong>Politeness Queues:</strong> Flooding a web host with 1,000 requests per second is a Denial of Service attack. The URL Frontier maintains a separate queue per host domain, strictly enforcing a delay (e.g. 500ms) between consecutive requests to the same IP.</li>\n        <li><strong>Near-Duplicate Detection (SimHash):</strong> Web pages often have identical text with minor differences (timestamps, copyright footers, ads). <strong>SimHash</strong> maps 10,000-word documents to a 64-bit fingerprint where small text changes produce small Hamming distances (differing by ≤ 3 bits), allowing constant-time near-duplicate filtering.</li>\n        <li><strong>DNS Resolution Bottlenecks:</strong> Standard OS DNS lookups block worker threads. Large-scale crawlers maintain in-memory asynchronous DNS caches with custom TTLs to bypass global DNS roundtrips.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "The URL Frontier enforces politeness by isolating queues per target host domain with strict rate delays.",
      "SimHash computes 64-bit fingerprints to identify near-duplicate web pages in constant time.",
      "Bloom filters track billions of previously seen URLs in a few gigabytes of RAM."
    ],
    "furtherReading": [
      {
        "title": "Heydon & Najork: Mercator: A Scalable, Extensible Web Crawler",
        "url": "https://www.hpl.hp.com/techreports/Compaq-DEC/SRC-RR-166.pdf"
      },
      {
        "title": "Olston & Najork: Web Crawling (Foundations and Trends in IR)",
        "url": "https://www.nowpublishers.com/article/Details/MIR-03"
      },
      {
        "title": "Manning et al.: Web Crawling and Indexes (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/crawling-and-indexes-1.html"
      }
    ]
  },
  "vector-search-and-hybrid-retrieval": {
    "title": "Vector search and hybrid retrieval",
    "video": {
      "youtubeId": "PuZvF2EyfBM",
      "title": "Elasticsearch Deep Dive w/ a Ex-Meta Senior Manager for System Design Interviews",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Semantic Revolution: Lexical vs Vector Search</h2>\n      <p>BM25 matches literal keywords. If a user searches for <em>\"canine wellness clinic\"</em>, BM25 fails to match a document titled <em>\"dog veterinarian hospital\"</em> because zero vocabulary terms overlap. <strong>Vector Search</strong> maps text into dense high-dimensional semantic vector spaces (e.g. 1536-dimensional embeddings generated by neural models) where semantically similar concepts cluster together.</p>\n\n      <h2>HNSW (Hierarchical Navigable Small World) Graph Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph HNSWGraph [\"Hierarchical Navigable Small World Graph (Skip-List for Vectors)\"]\n      Layer2[\"Layer 2: Sparse Long-Range Highway Links (Rapid Skip)\"]\n      Layer1[\"Layer 1: Medium Density Links\"]\n      Layer0[\"Layer 0: Dense Base Graph (All Vectors)\"]\n      \n      Layer2 --> Layer1 --> Layer0\n    end\n\n    QueryVec[\"Query Vector\"] -->|\"1. Greedy Entry at Layer 2\"| Layer2\n    Layer0 -->|\"2. Return K-Nearest Neighbors\"| TopK[\"Top K Semantic Matches\"]\n      </div>\n\n      <h2>Under the Hood: Hybrid Search Fusion (RRF)</h2>\n      <p>Vector search excels at broad semantic concept matching but frequently fails on exact keyword identifiers (e.g. part numbers like <code>\"GTX-4090-TI\"</code> or specific product codes). The industry gold standard is <strong>Hybrid Search</strong>, combining lexical BM25 and dense vector search using <strong>Reciprocal Rank Fusion (RRF)</strong>:</p>\n      <pre><code>RRF_Score(d) = sum_{m in Models} ( 1 / (60 + Rank_m(d)) )</code></pre>\n      <p>RRF normalizes disparate scoring scales into rank positions, ensuring that documents ranking well across both keyword matching and semantic embedding models float to the top.</p>\n    </div>",
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
      "youtubeId": "HTF7wY-Rcyc",
      "title": "System Design: Autocomplete in 100 Milliseconds",
      "channel": "Learning Podcasts"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Latency SLA of Autocomplete</h2>\n      <p>Search autocomplete (typeahead) displays the top 5 to 10 suggested queries as the user types each keystroke. Because humans type at ~300ms intervals, the entire end-to-end autocomplete pipeline must return suggestions within <strong>under 30 milliseconds</strong>, including network transit.</p>\n\n      <h2>Prefix Trie with Pre-Materialized Top-K Suggestions</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Root[\"Root Node\"] --> S[\"'s' (Top: ['system', 'sql', 'spring'])\"]\n    S --> Y[\"'sy' (Top: ['system design', 'system requirements'])\"]\n    Y --> S2[\"'sys' (Top: ['system design', 'system architecture'])\"]\n    S2 --> T[\"'syst' (Top: ['system design'])\"]\n      </div>\n\n      <h2>Under the Hood: Why Naive Tries Fail at Scale</h2>\n      <p>In a textbook Trie, finding matching prefixes requires traversing down to the prefix node and performing a Depth-First Search (DFS) across all descendant nodes to find the highest-frequency suggestions. In a dictionary with 100,000,000 query logs, this DFS takes hundreds of milliseconds.</p>\n      <p><strong>The Pre-Materialization Pattern:</strong> Each Trie node pre-computes and caches the top 5 most popular global search phrases in its node payload. Querying autocomplete traverses the analyzed prefix in <code>O(|prefix|)</code> and then returns a bounded precomputed list. Network and serving latency must be measured; the lookup is not globally constant-time.</p>\n\n      <h2>Offline Aggregation Pipeline</h2>\n      <p>Search query click logs are streamed to Kafka and aggregated hourly via Apache Flink. Flink calculates weekly query frequency, filters offensive terms, and builds a fresh immutable Trie file. The new Trie is deployed to production Redis instances or local worker memory using zero-downtime pointer swaps.</p>\n    </div>",
    "keyTakeaways": [
      "Autocomplete requires sub-30ms response times to provide instantaneous feedback between keystrokes.",
      "Trie nodes pre-cache the top 5 most frequent search terms, converting complex graph searches into O(1) reads.",
      "Query frequency weights are aggregated offline via streaming analytics (Flink) and loaded into in-memory Trie nodes."
    ],
    "furtherReading": [
      {
        "title": "Google Research: Efficient Data Structures for Typeahead Autocomplete",
        "url": "https://research.google/pubs/pub37000/"
      },
      {
        "title": "Bast & Weber: The Complete Dictionary Search (ACM SIGIR)",
        "url": "https://dl.acm.org/doi/10.1145/1164597.1164723"
      },
      {
        "title": "Bhatia & Mitra: Adopting Web Search Autocomplete (ACM TOIS)",
        "url": "https://dl.acm.org/doi/10.1145/2168752.2168753"
      }
    ]
  },
  "did-you-mean-and-spell-correction": {
    "title": "Design: did-you-mean and spell correction",
    "video": {
      "youtubeId": "HTF7wY-Rcyc",
      "title": "System Design: Autocomplete in 100 Milliseconds",
      "channel": "Learning Podcasts"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Real-Time Spelling Correction</h2>\n      <p>Approximately 10% to 15% of all web and e-commerce search queries contain typos (e.g. <code>\"appple iphone\"</code>, <code>\"teh lord of the rings\"</code>). When a query produces zero or poor results, the search engine must instantaneously evaluate edit distance candidates and suggest corrections.</p>\n\n      <h2>The SymSpell Algorithm (Symmetric Delete Spelling Correction)</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Dict[\"Dictionary Word: 'apple'\"] --> Precompute[\"Precompute Deletes (Distance 1 & 2)\"]\n    Precompute --> HashLookup[\"In-Memory Hash Table: 'pple' -> 'apple', 'aple' -> 'apple'\"]\n    \n    UserTypo[\"User Input: 'appple'\"] --> GenDeletes[\"Generate Deletes of Input: 'apple', 'ppple'\"]\n    GenDeletes --> HashLookup\n    HashLookup --> Match[\"Instant O(1) Match: Correct to 'apple'!\"]\n      </div>\n\n      <h2>Under the Hood: SymSpell vs Traditional Levenshtein Distance</h2>\n      <ul>\n        <li><strong>Standard Levenshtein Distance:</strong> Calculating Levenshtein matrix distance between an input typo and every word in a 500,000-term dictionary requires billions of operations, taking seconds per query.</li>\n        <li><strong>SymSpell Breakthrough:</strong> Rather than testing insertions, deletions, substitutions, and transpositions against the entire vocabulary, SymSpell precomputes all <code>K</code>-distance <em>deletions</em> for dictionary words and stores them in a hash table. At query time, only deletions of the misspelled input are looked up in the hash table, achieving sub-millisecond execution. The original benchmark (Wolfgarbe, 2012) reports up to 1,000x speedup vs. standard Levenshtein on a 500K dictionary, but actual speedup depends on edit distance threshold and dictionary size.</li>\n        <li><strong>The Noisy Channel Model:</strong> Scores candidate corrections using Bayesian probability: <code>P(Word | Typo) ∝ P(Typo | Word) × P(Word)</code>, balancing keyboard typo proximity with unigram/bigram word frequencies from search logs.</li>\n      </ul>\n    </div>",
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
        "title": "Church & Gale: A Spelling Correction Program Based on a Noisy Channel Model (ACL)",
        "url": "https://aclanthology.org/P93-2058/"
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
      "youtubeId": "HTF7wY-Rcyc",
      "title": "System Design: Autocomplete in 100 Milliseconds",
      "channel": "Learning Podcasts"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Mining Query Relationships</h2>\n      <p>Related searches (e.g. searching <em>\"distributed systems\"</em> and seeing suggestions for <em>\"Raft consensus\"</em>, <em>\"CAP theorem\"</em>, and <em>\"vector clocks\"</em>) help users navigate complex information spaces. These recommendations are mined from collective user behavior across millions of search sessions.</p>\n\n      <h2>Query-Click Bipartite Graph Architecture</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph QueryNodes [\"Query Nodes\"]\n      Q1[\"'kafka architecture'\"]\n      Q2[\"'rabbitmq vs kafka'\"]\n      Q3[\"'event-driven microservices'\"]\n    end\n\n    subgraph DocNodes [\"Clicked URL / Product Nodes\"]\n      D1[\"URL: kafka.apache.org/intro\"]\n      D2[\"URL: confluent.io/blog/message-queues\"]\n    end\n\n    Q1 <--> D1\n    Q1 <--> D2\n    Q2 <--> D2\n    Q3 <--> D1\n      </div>\n\n      <h2>Under the Hood: Mining Algorithms</h2>\n      <ul>\n        <li><strong>Session Co-occurrence Mining:</strong> If thousands of users search for Query A followed by Query B within the same 30-minute browsing session, the two queries share high temporal affinity. Pairwise pointwise mutual information (PMI) quantifies this association while filtering out trivial coincidences.</li>\n        <li><strong>Random Walks on Bipartite Graphs (SimRank / Personalized PageRank):</strong> Construct a bipartite graph connecting search queries to the web pages clicked by users. Performing random walks with restarts reveals queries that share high structural overlap in click destinations, identifying high-quality conceptual synonyms.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Related searches are mined from user session logs and query-click bipartite graphs.",
      "Temporal session co-occurrence identifies queries frequently executed in sequence by real users.",
      "Random walk algorithms (Personalized PageRank) surface semantically linked concepts based on shared destination clicks."
    ],
    "furtherReading": [
      {
        "title": "Baeza-Yates et al.: Query Recommendation Using Query Logs in Search Engines",
        "url": "https://dl.acm.org/doi/10.1145/1052934.1052976"
      },
      {
        "title": "Cui et al.: Beyond Keywords: Query Routing for Personalized Search (ACM KDD)",
        "url": "https://dl.acm.org/doi/10.1145/1835804.1835886"
      },
      {
        "title": "Manning et al.: Queries and Query Expansion (Stanford IR Book)",
        "url": "https://nlp.stanford.edu/IR-book/html/htmledition/queries-and-documents-1.html"
      }
    ]
  },
  "recent-searches-system-design": {
    "title": "Design: recent searches",
    "video": {
      "youtubeId": "HTF7wY-Rcyc",
      "title": "System Design: Autocomplete in 100 Milliseconds",
      "channel": "Learning Podcasts"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: User Search History at Scale</h2>\n      <p>When a user taps the search bar, mobile and web applications display their recent search history (e.g. the last 10 queries executed by that account). While conceptually straightforward, serving recent searches for 500,000,000 active users requires low latency, strict GDPR compliance, cross-device synchronization, and zero database overload.</p>\n\n      <h2>Redis Capped Set Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Mobile Client: Taps Search Bar\"] --> Edge[\"API Gateway\"]\n    Edge --> SearchHistoryService[\"Recent Search Service\"]\n    \n    SearchHistoryService -->|\"1. ZREVRANGEBYSCORE history:<user_id> +inf -inf LIMIT 0 10\"| RedisCluster[(\"Redis Cluster (In-Memory)\")]\n    RedisCluster -->|\"Returns 10 most recent queries\"| SearchHistoryService\n    \n    subgraph MutationFlow [\"When User Executes New Query: 'system design'\"]\n      UserSearch[\"User Search Event\"] --> Worker[\"Async Mutation Worker\"]\n      Worker -->|\"2. Atomic Lua: ZADD history:<user_id> <now_timestamp> <query> + ZREMRANGEBYRANK 0 -11\"| RedisCluster\n      Worker -->|\"3. Append to User History Log\"| ColdStorage[(\"Encrypted Cassandra / DynamoDB\")]\n    end\n      </div>\n\n      <h2>Under the Hood: Redis Sorted Sets vs Lists</h2>\n      <ul>\n        <li><strong>Why Lists Fail:</strong> A simple Redis List (<code>LPUSH</code> + <code>LTRIM</code>) permits duplicate queries. If a user searches \"iPhone\" five times, their recent search list displays five identical \"iPhone\" entries. De-duplicating a list requires <code>O(N)</code> scans.</li>\n        <li><strong>The Sorted Set Solution (ZSET):</strong> Redis Sorted Sets store unique members sorted by score. By storing the query string as the member and the current Unix timestamp as the score, executing <code>ZADD history:uid timestamp query</code> automatically de-duplicates the query and refreshes its recency to the top. Capping the history is achieved via <code>ZREMRANGEBYRANK history:uid 0 -11</code>.</li>\n        <li><strong>Privacy & GDPR Compliance:</strong> Search history must support instant user purges (<code>DEL history:uid</code>) and automatic time-to-live expiration (e.g. <code>EXPIRE history:uid 7776000</code> for 90 days retention).</li>\n      </ul>\n    </div>",
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
        "title": "Hartigan & Wong: Algorithm AS 136: A K-Means Clustering Algorithm (Journal of the Royal Statistical Society)",
        "url": "https://www.jstor.org/stable/2346830"
      },
      {
        "title": "GDPR: The Right to Erasure (Article 17) (EU Official Journal)",
        "url": "https://gdpr-info.eu/art-17-gdpr/"
      }
    ]
  }
};
