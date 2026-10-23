window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["nosql-decision-boundaries"] = [
  {
    "id": "nosql-decision-boundaries-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Labels vs engines",
    "section": "Mechanics",
    "prompt": "A teammate argues: 'We should move to NoSQL because SQL databases use B-trees and NoSQL uses LSM trees, so NoSQL is faster for writes.' What is the core flaw in this reasoning?",
    "options": [
      "It is correct in principle, but only MongoDB and Cassandra actually use LSM trees today",
      "The SQL versus NoSQL label does not determine the storage engine; relational and non-relational products each use B-trees, heaps or LSM trees",
      "LSM trees are slower for writes than B-trees, so the conclusion is backwards",
      "Storage engines only affect reads, so they are irrelevant to a write-throughput decision"
    ],
    "answer": 1,
    "explanation": "The lesson stresses that SQL versus NoSQL is not B-tree versus LSM: Postgres uses heap tables with indexes, InnoDB a clustered B+ tree, and LSM engines appear on both sides. Saying LSM is slower for writes is wrong; LSM trees generally favour writes, the mistake is tying engine to category.",
    "tags": [
      "nosql-decision-boundaries",
      "recall",
      "inline"
    ]
  },
  {
    "id": "nosql-decision-boundaries-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Dual-write drift",
    "section": "Failure mode",
    "prompt": "A service commits each order to PostgreSQL and then, in application code, indexes the same order into Elasticsearch. After a few weeks, search results are missing some orders and show stale status for others. What is the most robust fix?",
    "options": [
      "Write to Elasticsearch first and Postgres second so the search index is never behind",
      "Wrap both writes in a try/catch and retry the Elasticsearch call up to three times",
      "Move orders entirely into Elasticsearch so there is only one store to keep consistent",
      "Make Postgres the source of truth and feed Elasticsearch from its change stream via CDC or a transactional outbox"
    ],
    "answer": 3,
    "explanation": "Two independent writes without a shared transaction drift whenever one succeeds and the other fails or they race; CDC or an outbox derives the second store from committed data. Retries shrink the window but cannot cover crashes between the writes, and reordering the writes just moves the inconsistency.",
    "tags": [
      "nosql-decision-boundaries",
      "staff",
      "inline"
    ]
  },
  {
    "id": "nosql-decision-boundaries-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Placing device telemetry",
    "section": "Worked example: one product, three stores",
    "prompt": "An IoT platform has 2M devices, each sending a 100-byte reading every 10 seconds, and the main query is 'readings for device X over the last 24 hours'. Orders and billing already live in Postgres. Where should telemetry go?",
    "options": [
      "A wide-column or time-series store partitioned by (device_id, day), since about 200k append-only writes/s are queried by device and time",
      "The existing Postgres primary with extra read replicas, since replicas add write capacity",
      "A wide-column store partitioned by day only, so each day's data is kept together for fast range scans",
      "A graph database, since each device is related to a customer and a region"
    ],
    "answer": 0,
    "explanation": "2M / 10 s is 200k writes/s, roughly 1.7 TB/day, append-only and read by device and time window, which fits a wide-column or time-series store keyed by (device_id, day). Partitioning by day alone would send all of today's writes to one partition, and read replicas never add write capacity.",
    "tags": [
      "nosql-decision-boundaries",
      "apply",
      "inline"
    ]
  },
  {
    "id": "nosql-decision-boundaries-n1",
    "topic": "nosql-decision-boundaries",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Cross-Shard Scatter-Gather Tail Latency",
    "scenario": "Moving from a single SQL database to a 32-shard NoSQL store works well for primary-key lookups, but a secondary search query must scatter-gather across all 32 shards in parallel. Each shard has an independent 1% chance of experiencing a 200 ms GC pause.",
    "prompt": "Using the small-probability approximation (`1 - (0.99)^32 ≈ 27.6%`), roughly what percentage of scatter-gather queries will hit the 200 ms tail latency?",
    "question": "Using the small-probability approximation (`1 - (0.99)^32 ≈ 27.6%`), roughly what percentage of scatter-gather queries will hit the 200 ms tail latency?",
    "unit": "%",
    "answer": 28,
    "tolerance": 0.2,
    "hint": "Compute `100 × (1 - 0.99^32)`.",
    "explanation": "Because a scatter-gather query waits for the slowest of all 32 shards, a 1% per-shard slow-tail event turns into a `1 - 0.99^32 = 27.6%` (~28%) slow response rate at the aggregator.",
    "tags": [
      "nosql-decision-boundaries",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "nosql-decision-boundaries-t1",
    "topic": "nosql-decision-boundaries",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Choosing SQL vs Partitioned NoSQL",
    "scenario": "A new B2B SaaS product has 400GB of relational data, complex multi-table reporting joins, strict ACID multi-row invariants, and 3,000 reads/sec + 400 writes/sec.",
    "prompt": "Which storage architecture should you choose, and why?",
    "question": "Which storage architecture should you choose, and why?",
    "options": [
      "Deploy a 64-node Cassandra wide-column cluster and implement joins in application memory",
      "Shard across 16 MongoDB clusters on day one",
      "Use a single primary PostgreSQL instance with read replicas and connection pooling"
    ],
    "correctOption": 2,
    "reasons": [
      "Cassandra excels at ad-hoc multi-table joins and cross-partition ACID transactions",
      "400 GB of data exceeds the capacity of modern NVMe drives",
      "400 GB and 400 writes/sec fit comfortably on a single vertical SQL node, preserving native ACID transactions and joins without distributed coordination tax"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Does 400 GB / 400 writes/s require horizontal write sharding?",
    "explanation": "Partitioned NoSQL trades away multi-row ACID transactions and ad-hoc joins in exchange for horizontal write scale beyond a single node. At 400 GB and 400 writes/s, a single relational primary is simpler, safer, and faster.",
    "tags": [
      "nosql-decision-boundaries",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["document-vs-key-value-stores"] = [
  {
    "id": "document-vs-key-value-stores-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Cost of field awareness",
    "section": "Mechanics",
    "prompt": "A document store can filter and index on fields inside a record, while a minimal key-value store treats the value as opaque bytes. What does the document store pay for that capability?",
    "options": [
      "It must keep all documents in memory to evaluate predicates",
      "It cannot support lookups by primary key without a secondary index",
      "Parsing records and maintaining indexes, which amplifies the cost of each write",
      "It gives up horizontal scaling because indexes cannot be partitioned"
    ],
    "answer": 2,
    "explanation": "Document stores expose fields and indexes inside records and pay parsing and index-maintenance costs, so every extra index adds work to each insert. They still serve primary-key lookups directly; a MongoDB lookup by _id is effectively a key-value access.",
    "tags": [
      "document-vs-key-value-stores",
      "recall",
      "inline"
    ]
  },
  {
    "id": "document-vs-key-value-stores-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hand-rolled index drift",
    "section": "Failure mode",
    "prompt": "User records live in a key-value store under user_id. To support login by email, the app also writes a separate key email to user_id after saving the user, in two separate calls. Months later a small number of users permanently cannot log in by email. What is the most likely cause?",
    "options": [
      "Eventual consistency in a managed secondary index delaying visibility for a few seconds",
      "A partial failure between the two writes left the hand-maintained email key missing or pointing at an old record",
      "Hash collisions between email strings and user_id keys overwriting entries",
      "The key-value store evicting rarely read email keys under memory pressure"
    ],
    "answer": 1,
    "explanation": "The lesson warns that manually maintained secondary structures diverge after a partial write unless both are written transactionally, and that divergence is permanent until repaired. Managed index lag (such as a DynamoDB GSI) is tempting, but it resolves within seconds and would not cause lasting failures.",
    "tags": [
      "document-vs-key-value-stores",
      "staff",
      "inline"
    ]
  },
  {
    "id": "document-vs-key-value-stores-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Embed or reference",
    "section": "Worked example: sessions vs product catalog",
    "prompt": "In MongoDB, a blog post document embeds an array of all its comments. Popular posts receive thousands of comments per day. Following the lesson's modeling rules, what should you change?",
    "options": [
      "Keep embedding, but add a multikey index on the comments array to speed up reads",
      "Keep embedding, but compress the comments array to stay under the size limit",
      "Move the post and its comments into a single key-value blob to avoid parsing costs",
      "Store comments in their own collection referencing the post, because they are unbounded and would grow the document towards the 16 MB limit"
    ],
    "answer": 3,
    "explanation": "Embed what is read together and bounded; reference what is unbounded. An ever-growing comments array eventually hits the 16 MB document limit and forces large rewrites on every append, and an index or compression does nothing about that growth.",
    "tags": [
      "document-vs-key-value-stores",
      "apply",
      "inline"
    ]
  },
  {
    "id": "document-vs-key-value-stores-n1",
    "topic": "document-vs-key-value-stores",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Document Rewrite Amplification on Partial Updates",
    "scenario": "A user session document is 50 KB in size, and a Heartbeat API updates a 16-byte `last_seen_at` field inside the document 4,000 times/sec in a store that rewrites the full document on every update.",
    "prompt": "How many megabytes per second (MB/s, where 1 MB = 1,000 KB) of write bandwidth are consumed by rewriting the full 50 KB document?",
    "question": "How many megabytes per second (MB/s, where 1 MB = 1,000 KB) of write bandwidth are consumed by rewriting the full 50 KB document?",
    "unit": "MB/s",
    "answer": 200,
    "tolerance": 0.2,
    "hint": "Multiply 4,000 updates/sec by 50 KB/update and divide by 1,000 KB/MB.",
    "explanation": "4,000 updates/sec × 50 KB = 200,000 KB/s = 200 MB/s of write throughput just to update 16 bytes (64 KB/s of actual delta), a 3,125× write amplification.",
    "tags": [
      "document-vs-key-value-stores",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "document-vs-key-value-stores-t1",
    "topic": "document-vs-key-value-stores",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Embedded Sub-Document Arrays vs Separate Collection/KV",
    "scenario": "In a document database, a `product` document embeds an array of `reviews`. Popular products accumulate 250,000 reviews, approaching the 16 MB BSON document size limit and slowing down product page reads.",
    "prompt": "How should you refactor the data model, and why?",
    "question": "How should you refactor the data model, and why?",
    "options": [
      "Keep appending all 250,000 reviews inside the single `product` document and compress strings",
      "Store each review as a separate database instance",
      "Bound the `product` document to summary stats + top 5 recent reviews, and store full review records as separate items keyed by `(product_id, review_id)`"
    ],
    "correctOption": 2,
    "reasons": [
      "Unbounded array growth inside a single document improves write concurrency",
      "One database per review scales horizontally",
      "Splitting unbounded 1-to-many children into separate records prevents hitting document size ceilings and avoids rewriting megabytes on every new review"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Never embed an unbounded array inside a single document.",
    "explanation": "Embedding works only for bounded relationships. Unbounded 1-to-N collections must be stored as separate documents/KV entries with only a bounded summary/preview embedded on the parent.",
    "tags": [
      "document-vs-key-value-stores",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["columnar-vs-wide-column-stores"] = [
  {
    "id": "columnar-vs-wide-column-stores-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Wide-column data model",
    "section": "Under the Hood: Vectorized OLAP Engines vs. Distributed LSM Tables",
    "prompt": "Which description best matches how Cassandra or ScyllaDB organises data?",
    "options": [
      "Each column is stored in its own compressed file, so queries read only the columns they reference",
      "Rows are stored in a single global B+ tree ordered by primary key across all nodes",
      "A distributed map from partition key to a sorted map of clustering key to that row's columns, stored in LSM trees",
      "A graph of rows linked by pointers so that queries can follow relationships without indexes"
    ],
    "answer": 2,
    "explanation": "The lesson describes wide-column stores as a two-dimensional key-value store: partition key mapping to rows sorted by clustering key, held in LSM trees. Storing each column in its own file is the columnar (ClickHouse, Parquet) design, which the shared word 'column' makes easy to confuse.",
    "tags": [
      "columnar-vs-wide-column-stores",
      "recall",
      "inline"
    ]
  },
  {
    "id": "columnar-vs-wide-column-stores-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Analytics on Cassandra",
    "section": "Disk Layout: Row-Oriented vs. Pure Columnar",
    "prompt": "A team runs a nightly SUM(bytes) over every row of a 40-column Cassandra table and finds it takes hours and disturbs production latency. What is the underlying reason?",
    "options": [
      "Cassandra keeps each row's columns together, so the job scans every partition across the cluster and reads all columns just to use one",
      "Cassandra cannot perform aggregations at all, so the driver must retry each partition",
      "The bytes column is not the clustering key, so Cassandra must sort the whole table first",
      "Cassandra compresses each column separately, and decompressing 40 files per row is slow"
    ],
    "answer": 0,
    "explanation": "In a row or wide-column layout a row's columns sit together, so an aggregate over one column is a full-cluster scan that reads and discards most bytes, with no column pruning. Separate per-column compression is the columnar layout, which is exactly what makes ClickHouse fast for this query.",
    "tags": [
      "columnar-vs-wide-column-stores",
      "staff",
      "inline"
    ]
  },
  {
    "id": "columnar-vs-wide-column-stores-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Bytes read for an average",
    "section": "Why Columnar Storage Wins for Analytics: Vectorization & Compression",
    "prompt": "Log rows average 500 bytes, of which the latency field is 4 bytes. You compute the average latency over 100M rows. Before any compression, roughly how much less data does a columnar engine read than a row store?",
    "options": [
      "About 2x less, because the row store can skip the payload field",
      "About 10x less, the same as the typical compression ratio",
      "About 1,000x less, because SIMD processes 16 values per instruction",
      "About 125x less, since it reads 4 bytes per row instead of 500"
    ],
    "answer": 3,
    "explanation": "The columnar engine reads only the latency column, 4 of 500 bytes per row, a 125x reduction before compression adds more on top. SIMD speeds up processing of the bytes that are read; it does not change how many bytes come off disk.",
    "tags": [
      "columnar-vs-wide-column-stores",
      "apply",
      "inline"
    ]
  },
  {
    "id": "columnar-vs-wide-column-stores-n1",
    "topic": "columnar-vs-wide-column-stores",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Columnar Projection I/O Reduction",
    "scenario": "An analytics table has 100 columns averaging 10 bytes each (1,000 bytes/row) across 1,000,000,000 rows (1 TB total). A dashboard query aggregates only 3 columns (`region`, `status`, `amount` = 30 bytes/row), and columnar dictionary + RLE compression achieves a 5× compression ratio on those 3 columns.",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of disk data must the columnar engine scan for this query?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of disk data must the columnar engine scan for this query?",
    "unit": "GB",
    "answer": 6,
    "tolerance": 0.2,
    "hint": "Uncompressed size of the 3 columns = 10^9 × 30 bytes = 30 GB. Divide by the 5× compression ratio.",
    "explanation": "Reading only 3 of 100 columns reduces raw bytes from 1,000 GB to 30 GB; 5× columnar compression reduces disk I/O further to 30 / 5 = 6 GB (a 166× reduction vs a 1 TB row-store scan).",
    "tags": [
      "columnar-vs-wide-column-stores",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "columnar-vs-wide-column-stores-t1",
    "topic": "columnar-vs-wide-column-stores",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: OLAP Columnar Store vs Wide-Column Store (Cassandra/Bigtable)",
    "scenario": "An engineering team confuses \"wide-column store\" (Cassandra/HBase) with \"columnar OLAP database\" (ClickHouse/Parquet) and tries to run `SELECT AVG(latency) FROM logs WHERE status = 500` across 10B rows in Cassandra without a partition key.",
    "prompt": "Why does this query fail or time out in Cassandra, and which architecture should serve which workload?",
    "question": "Why does this query fail or time out in Cassandra, and which architecture should serve which workload?",
    "options": [
      "Cassandra stores each column in a separate global Parquet file optimized for full-cluster SIMD scans",
      "ClickHouse should replace Cassandra for 100,000 single-row point mutations per second",
      "Wide-column stores (Cassandra) group columns per row inside SSTables keyed by `(partition_key, clustering_key)` for fast point/range lookups, whereas OLAP columnar stores physically store each column contiguously for analytical scans"
    ],
    "correctOption": 2,
    "reasons": [
      "Wide-column and columnar are identical storage layouts on disk",
      "OLAP columnar files are optimized for single-row random updates",
      "Use wide-column stores for high-write operational lookups by partition key, and replicate events to a true columnar OLAP engine for multi-billion-row aggregations"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How are bytes laid out inside a Cassandra SSTable vs a Parquet/ClickHouse column file?",
    "explanation": "Despite the name, wide-column stores (Bigtable/Cassandra) store data organized by row key + clustering key inside SSTables, making full-cluster analytical scans without a partition key catastrophic.",
    "tags": [
      "columnar-vs-wide-column-stores",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["graph-database-decision-boundary"] = [
  {
    "id": "graph-database-decision-boundary-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What graph stores avoid",
    "section": "Mechanics",
    "prompt": "According to the lesson, what is the real mechanical advantage of a native graph store for multi-hop traversals?",
    "options": [
      "Traversals always cost O(log N) regardless of depth because the graph is indexed globally",
      "Relationships are first-class stored links, so each hop can follow adjacency instead of repeating a global index lookup",
      "Graph stores shard connected data automatically, so traversals never cross machines",
      "Graph stores cache every path in advance, so queries read precomputed results"
    ],
    "answer": 1,
    "explanation": "Graph stores make relationships first-class and can skip a repeated global index lookup per hop, so cost tracks the part of the graph touched. The lesson explicitly rejects any general O(log N)-style rule and notes that partitioning connected data is hard, not automatic.",
    "tags": [
      "graph-database-decision-boundary",
      "recall",
      "inline"
    ]
  },
  {
    "id": "graph-database-decision-boundary-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "The public WiFi supernode",
    "section": "Failure mode",
    "prompt": "A fraud query finds accounts within 4 hops of a flagged account via shared devices. It usually returns in milliseconds, but sometimes times out. Investigation shows one 'device' is an airport WiFi fingerprint shared by 200k accounts. What is the best mitigation?",
    "options": [
      "Migrate from a recursive SQL CTE to a native graph database, which handles high-degree nodes efficiently",
      "Add more replicas so the traversal can be parallelised across machines",
      "Cap expansion through very high-degree nodes, for example by filtering or special-casing them, since they explode the traversal and carry little fraud signal",
      "Increase the timeout, since the query is correct and only occasionally slow"
    ],
    "answer": 2,
    "explanation": "A supernode turns one hop into a 200k-edge expansion that exhausts any latency budget, in any engine; the lesson's fix is to cap degree, filter by edge type or time, or special-case such nodes. Switching to a graph database does not help, because following 200k pointers is still 200k expansions.",
    "tags": [
      "graph-database-decision-boundary",
      "staff",
      "inline"
    ]
  },
  {
    "id": "graph-database-decision-boundary-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Is SQL enough here",
    "section": "Worked example: fraud ring detection",
    "prompt": "Accounts have an average degree of about 5 with no supernodes. A 4-hop expansion in Postgres costs about 4 B-tree page touches per expanded node. What does the lesson conclude about running this in SQL?",
    "options": [
      "About 2,500 page touches, a few milliseconds when cached, so SQL is fine for this shape",
      "About 20 page touches, so any database is fast and the choice does not matter",
      "About 390,000 page touches, so a graph database is required",
      "Several million page touches, because every hop scans the full edges table"
    ],
    "answer": 0,
    "explanation": "5^4 is about 625 nodes at about 4 page touches each, roughly 2,500 touches and a few milliseconds when cached. Graph databases start to pay off for deeper, variable-length paths, cycles and pattern matching, not for a bounded, indexed 4-hop expansion like this one.",
    "tags": [
      "graph-database-decision-boundary",
      "apply",
      "inline"
    ]
  },
  {
    "id": "graph-database-decision-boundary-n1",
    "topic": "graph-database-decision-boundary",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: K-Hop Frontier Explosion",
    "scenario": "In a social/payment graph where every node has an average out-degree of 50 neighbors, a fraud detection query traverses 3 hops (`k = 3`) out from a suspect account.",
    "prompt": "Assuming minimal overlap at distance 3, how many edge traversals occur at the 3rd hop (`50^3`)?",
    "question": "Assuming minimal overlap at distance 3, how many edge traversals occur at the 3rd hop (`50^3`)?",
    "unit": "edges",
    "answer": 125000,
    "tolerance": 0.2,
    "hint": "Compute 50 × 50 × 50.",
    "explanation": "At branching factor 50, hop 1 visits 50 nodes, hop 2 visits 2,500, and hop 3 visits 50^3 = 125,000 edges (and hop 4 reaches 6.25M), illustrating why unbounded multi-hop graph queries explode in latency.",
    "tags": [
      "graph-database-decision-boundary",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "graph-database-decision-boundary-t1",
    "topic": "graph-database-decision-boundary",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Dedicated Graph DB vs Relational / Adjacency Table",
    "scenario": "A product needs to look up a user's direct 1-hop followers and check whether User A follows User B at 50,000 QPS.",
    "prompt": "Should you introduce a specialized graph database (e.g., Neo4j) for 1-hop follow lookups, and why?",
    "question": "Should you introduce a specialized graph database (e.g., Neo4j) for 1-hop follow lookups, and why?",
    "options": [
      "Yes, any schema with edges requires a specialized native graph database",
      "Store the entire social graph in a single unindexed JSON blob",
      "No; 1-hop and 2-hop lookups with known keys are simple indexed adjacency-table queries in SQL/NoSQL—reserve dedicated graph engines for deep variable-length path traversals (`k >= 3`) and subgraph pattern matching"
    ],
    "correctOption": 2,
    "reasons": [
      "Relational and KV stores cannot index `(follower_id, followee_id)` pairs",
      "JSON blobs scale linearly to 100M edges",
      "An indexed adjacency table (`pk = user_id, sk = target_id`) serves 1-hop listings and existence checks in O(1)/O(log N) without adding operational complexity"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "At what hop depth do recursive SQL joins degrade compared to index-free adjacency?",
    "explanation": "Fixed 1-hop or 2-hop edge lookups are trivial in SQL or partitioned KV/wide-column stores (like Twitter's FlockDB). Native graph databases earn their operational cost only on variable-depth traversals and complex path analytics.",
    "tags": [
      "graph-database-decision-boundary",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["sharding-and-partitioning"] = [
  {
    "id": "sharding-and-partitioning-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Range vs hash trade",
    "section": "Mechanics",
    "prompt": "You partition an orders table by an auto-increment order_id. What is the key difference between range and hash partitioning for this key?",
    "options": [
      "Range partitioning spreads new orders evenly but makes lookups by order_id scatter to all shards",
      "Both behave the same for integer keys; only string keys cause differences",
      "Hash partitioning keeps recent orders together, which makes it the better choice for time-ordered scans",
      "Range partitioning keeps scans over consecutive IDs cheap but sends every new write to the last range; hashing spreads writes but scatters range scans"
    ],
    "answer": 3,
    "explanation": "Range partitioning preserves scan locality but a monotonic key concentrates all new inserts on the newest range; hashing distributes writes at the cost of turning range scans into scatter-gather. Hashing does not keep recent orders together; it deliberately scatters them.",
    "tags": [
      "sharding-and-partitioning",
      "recall",
      "inline"
    ]
  },
  {
    "id": "sharding-and-partitioning-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Rebalance cutover",
    "section": "Failure mode",
    "prompt": "You are moving logical shard 417 from cluster 3 to cluster 9 using CDC. Some app servers will pick up the new directory entry seconds later than others. What is the main risk during cutover, and how do you avoid it?",
    "options": [
      "CDC will duplicate every row in shard 417; deduplicate by primary key after cutover",
      "Some writes land on the old cluster after the copy is considered complete; briefly block writes to the shard, let CDC drain, then flip the directory",
      "Reads on cluster 9 will be slower until its buffer pool warms; pre-warm it with a scan",
      "Hash values for tenants in shard 417 will change; rehash those tenants after the move"
    ],
    "answer": 1,
    "explanation": "The lesson warns that rebalancing is risky while old and new routers disagree: stale routers can keep writing to the old location, and those writes are lost or diverge. Nothing is rehashed in a logical-shard design, since only the logical-to-physical mapping changes.",
    "tags": [
      "sharding-and-partitioning",
      "staff",
      "inline"
    ]
  },
  {
    "id": "sharding-and-partitioning-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Doubling the clusters",
    "section": "Worked example: sharding a multi-tenant SaaS",
    "prompt": "Tenants map to 1,024 logical shards via hash(tenant_id) mod 1024, spread evenly over 8 physical clusters. You grow to 16 clusters. What has to move?",
    "options": [
      "64 logical shards off each existing cluster, with no tenant rehashed; only directory entries change",
      "Every row, because the mod divisor changes from 8 to 16",
      "About half of the rows in every logical shard, split by the new hash",
      "Only the largest tenant, which is pinned to its own cluster"
    ],
    "answer": 0,
    "explanation": "Each cluster holds 128 logical shards; to reach 16 clusters it hands off 64 whole logical shards and the directory is updated. The hash is always mod 1024 over logical shards, so changing the physical cluster count never rehashes rows.",
    "tags": [
      "sharding-and-partitioning",
      "apply",
      "inline"
    ]
  },
  {
    "id": "sharding-and-partitioning-n1",
    "topic": "sharding-and-partitioning",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Shard Count Calculation by Storage vs IOPS",
    "scenario": "You are sharding a multi-tenant ledger storing 20 TB of data with a peak workload of 120,000 write IOPS. Each database shard instance can safely hold at most 2 TB of data and sustain 6,000 write IOPS.",
    "prompt": "What is the minimum number of shards required to satisfy BOTH the storage capacity and write IOPS constraints?",
    "question": "What is the minimum number of shards required to satisfy BOTH the storage capacity and write IOPS constraints?",
    "unit": "shards",
    "answer": 20,
    "tolerance": 0.25,
    "hint": "Compute shards_by_storage = 20 TB / 2 TB = 10, and shards_by_iops = 120,000 / 6,000 = 20. Take the maximum.",
    "explanation": "Sharding must satisfy the tightest bottleneck: storage requires 20 TB / 2 TB = 10 shards, whereas write throughput requires 120,000 / 6,000 = 20 shards. Therefore, you must provision at least max(10, 20) = 20 shards.",
    "tags": [
      "sharding-and-partitioning",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "sharding-and-partitioning-t1",
    "topic": "sharding-and-partitioning",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Partition Key Selection for Multi-Regional E-Commerce Orders",
    "scenario": "An orders service supports two primary queries: (1) customer order history (`WHERE user_id = ? ORDER BY created_at DESC`, 85% of traffic) and (2) merchant order fulfillment (`WHERE merchant_id = ? AND status = 'PAID'`, 15% of traffic).",
    "prompt": "How should you partition the orders data across 32 shards, and what is the primary engineering justification?",
    "question": "How should you partition the orders data across 32 shards, and what is the primary engineering justification?",
    "options": [
      "Shard by `order_id` and execute scatter-gather queries across all 32 shards for both customers and merchants",
      "Shard the primary orders table by `user_id` and maintain an asynchronously projected (or CDC-replicated) merchant-view table sharded by `merchant_id`",
      "Shard by `created_at` date so all of today's orders land on a single shard"
    ],
    "correctOption": 1,
    "reasons": [
      "Scatter-gather across 32 shards on 100% of queries minimizes tail latency and connection overhead",
      "Dual-partitioned projections turn both access patterns into single-shard point/range lookups at the cost of extra storage and bounded CDC lag",
      "Date-based sharding distributes current writes evenly across all 32 shards"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "How do you avoid 32-way scatter-gather fan-out when two access patterns have orthogonal keys?",
    "explanation": "Sharding by `order_id` forces 32-shard scatter-gather on both hot queries, and sharding by `created_at` creates a 100% write hotspot on today's shard. Partitioning the primary table by `user_id` and projecting a merchant-keyed view via CDC ensures single-shard reads for both access paths.",
    "tags": [
      "sharding-and-partitioning",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["hot-partitions"] = [
  {
    "id": "hot-partitions-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why hashing cannot help",
    "section": "The Anatomy of a Hotspot: When Hashing Fails",
    "prompt": "A cluster uses a well-distributed hash on product_id, yet during a flash sale one shard saturates while others idle. Why did hashing not prevent this?",
    "options": [
      "The hash function had too few output bits for the number of products",
      "Hashing is only uniform once the cluster has at least 100 nodes",
      "Hashing spreads keys evenly, but all traffic for one popular key still goes to the single shard that owns it",
      "The shard's replicas were out of sync, so all reads fell back to the primary"
    ],
    "answer": 2,
    "explanation": "Hash partitioning assumes keys are accessed uniformly; with Zipf-like popularity, one hot key concentrates load on its owning shard. No hash function or node count can split traffic to a single key, which is why salting or caching is needed.",
    "tags": [
      "hot-partitions",
      "recall",
      "inline"
    ]
  },
  {
    "id": "hot-partitions-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Near-cache load maths",
    "section": "Production Mitigation Patterns",
    "prompt": "A hot configuration key receives 500,000 reads/s spread across 200 API instances. Each instance adds an in-process L1 cache with a 2-second TTL and single-flight refresh. Roughly how many reads/s now reach Redis for that key?",
    "options": [
      "About 250,000, since the cache halves the traffic",
      "About 2,500, since each instance still misses about 1 percent of the time",
      "About 5,000, one per instance per 40 ms",
      "About 100, one refresh per instance every 2 seconds"
    ],
    "answer": 3,
    "explanation": "With single-flight, each of 200 instances refreshes the key once per 2 s TTL, so about 100 reads/s reach Redis regardless of request volume. Miss rate is not a fixed percentage here; it depends on TTL and instance count, not on incoming traffic.",
    "tags": [
      "hot-partitions",
      "apply",
      "inline"
    ]
  },
  {
    "id": "hot-partitions-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Salting an inventory count",
    "section": "Worked example: a viral like counter",
    "prompt": "Salting a like counter across K = 32 sub-keys worked well, so a team applies the same pattern to a flash-sale inventory counter that must never oversell. What breaks?",
    "options": [
      "Summing 32 sub-keys is not atomic, so a reader can see a total that never existed and two buyers can both pass a stock check; use a reservation or queue instead",
      "Nothing breaks, since the sum of the sub-keys is always exact once all reads complete",
      "DynamoDB rejects items whose keys contain a salt suffix for conditional writes",
      "Write throughput drops, because each decrement must now update all 32 sub-keys"
    ],
    "answer": 0,
    "explanation": "The lesson notes that a scatter-gather sum is not a snapshot, which is fine for likes but wrong for inventory that must never oversell. Each write still touches only one sub-key, so write throughput is not the problem; correctness of the check is.",
    "tags": [
      "hot-partitions",
      "staff",
      "inline"
    ]
  },
  {
    "id": "hot-partitions-n1",
    "topic": "hot-partitions",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Write Salting Buckets for a Celebrity Key",
    "scenario": "A single partition in your key-value store can safely sustain 2,000 writes/sec. During a global livestream, a single `stream_id` receives 24,000 status/counter writes/sec.",
    "prompt": "What is the minimum number of key-salting shards (`stream_id#0 .. stream_id#(N-1)`) required to keep each partition at or below 2,000 writes/sec?",
    "question": "What is the minimum number of key-salting shards (`stream_id#0 .. stream_id#(N-1)`) required to keep each partition at or below 2,000 writes/sec?",
    "unit": "shards",
    "answer": 12,
    "tolerance": 0.2,
    "hint": "Divide 24,000 writes/sec by 2,000 writes/sec per partition.",
    "explanation": "24,000 / 2,000 = 12 salted sub-keys (`stream_id#0` through `stream_id#11`), spreading the hot key's write load across 12 physical partitions.",
    "tags": [
      "hot-partitions",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "hot-partitions-t1",
    "topic": "hot-partitions",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Key Salting Write Relief vs Read Fan-Out Cost",
    "scenario": "You salt hot partition keys with a random suffix `0..15` (`N = 16`) to prevent write throttling during traffic spikes, and readers must reconstruct the total count.",
    "prompt": "How should you apply key salting so normal keys do not pay a 16× read amplification tax, and why?",
    "question": "How should you apply key salting so normal keys do not pay a 16× read amplification tax, and why?",
    "options": [
      "Salt every single key in the database with 1,000 random suffixes unconditionally",
      "Never salt keys and let the hot partition drop 95% of writes",
      "Use adaptive/selective salting (only salt keys flagged as hot in metadata or above a rate threshold) combined with a short-TTL read cache in front of the scatter-gather read"
    ],
    "correctOption": 2,
    "reasons": [
      "Turning every point read into a 1,000-key scatter-gather improves p99 latency",
      "Dropped writes are invisible to users",
      "Selective salting isolates the `N`-way read fan-out to the tiny fraction of celebrity keys, and caching the aggregated read shields the storage layer from read amplification"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens to a cold key if you force it to read 16 partitions every time?",
    "explanation": "Key salting trades 1× write hotspot relief for N× read fan-out. Applying it adaptively only to detected hot keys (plus caching the summed read) avoids penalizing the 99.9% of cold keys.",
    "tags": [
      "hot-partitions",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["consistent-hashing"] = [
  {
    "id": "consistent-hashing-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Role of virtual nodes",
    "section": "Mechanics",
    "prompt": "In consistent hashing, why do systems place many weighted virtual nodes per physical server on the ring?",
    "options": [
      "To guarantee that every server owns exactly the same number of keys",
      "To reduce expected load skew between servers and allow capacity weighting, without guaranteeing perfect balance",
      "To spread traffic for a single hot key across several servers",
      "To eliminate the need to distribute membership changes to clients"
    ],
    "answer": 1,
    "explanation": "Virtual nodes shrink the expected spread of ownership (the standard deviation of load is roughly proportional to 1 over the square root of V) and let bigger servers take more points, but they do not guarantee a fixed balance. A single key still maps to one position, so vnodes do nothing for hot keys.",
    "tags": [
      "consistent-hashing",
      "recall",
      "inline"
    ]
  },
  {
    "id": "consistent-hashing-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Still one hot node",
    "section": "Failure mode",
    "prompt": "After moving a cache fleet to consistent hashing with 256 vnodes per server, key counts per node are within 10 percent, but one node still runs at 100 percent CPU during peaks. What is the most likely explanation?",
    "options": [
      "256 vnodes is too few; raising it to 1,024 will even out CPU",
      "Clients have stale membership views and send all keys to that node",
      "A small number of very hot keys live on that node; consistent hashing balances keys, not traffic to a key",
      "The node's ring position is at hash zero, which receives all wrapped-around lookups"
    ],
    "answer": 2,
    "explanation": "Balanced key counts with one saturated node is the signature of hot keys, which consistent hashing cannot split. Stale membership views cause misrouting and misses, but would not leave key counts balanced while pinning CPU on one node.",
    "tags": [
      "consistent-hashing",
      "staff",
      "inline"
    ]
  },
  {
    "id": "consistent-hashing-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Modulo remap cost",
    "section": "Worked example: modulo vs ring when adding a cache node",
    "prompt": "A cache holds 10M keys on 10 nodes using hash(key) mod N. You add an 11th node. Roughly what happens to the hit rate immediately afterwards?",
    "options": [
      "It drops by about 9 points, because the new node takes about 1/11 of keys",
      "It is unchanged, because existing keys stay on their original nodes",
      "It drops by about half, because half the keys change parity",
      "It collapses to about 9 percent, because about 91 percent of keys map to a different node"
    ],
    "answer": 3,
    "explanation": "A key stays put only when h mod 10 equals h mod 11, about 1 in 11 keys, so roughly 91 percent move and the hit rate falls to about 9 percent. The 9-point dip is what consistent hashing would give, not modulo.",
    "tags": [
      "consistent-hashing",
      "apply",
      "inline"
    ]
  },
  {
    "id": "consistent-hashing-n1",
    "topic": "consistent-hashing",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Expected Key Movement on Node Addition",
    "scenario": "A consistent hashing ring holds 18,000,000 cached keys distributed evenly across 17 nodes (using 256 virtual nodes per physical node). You add an 18th physical node to the cluster.",
    "prompt": "Approximately how many keys (in millions) must be remapped to the new 18th node?",
    "question": "Approximately how many keys (in millions) must be remapped to the new 18th node?",
    "unit": "million keys",
    "answer": 1,
    "tolerance": 0.2,
    "hint": "In consistent hashing, adding the Nth node moves roughly `1/N` of total keys (`18M / 18`).",
    "explanation": "With consistent hashing, adding the 18th node steals approximately `1/18` of the keyspace evenly from the existing 17 nodes: 18,000,000 / 18 = 1,000,000 keys (1 million), compared to ~94% movement with `hash(k) % N`.",
    "tags": [
      "consistent-hashing",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "consistent-hashing-t1",
    "topic": "consistent-hashing",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Virtual Nodes (vnodes) vs Bounded-Load Consistent Hashing",
    "scenario": "Even with 256 virtual nodes per physical server make key-count distribution uniform within ±5%, a single viral key receives 40% of all cluster traffic and overwhelms whichever node owns its token range.",
    "prompt": "Why do virtual nodes alone fail here, and what mechanism solves traffic-skewed hot keys on a hash ring?",
    "question": "Why do virtual nodes alone fail here, and what mechanism solves traffic-skewed hot keys on a hash ring?",
    "options": [
      "Increase virtual nodes from 256 to 1,000,000 per node so the single key splits across servers",
      "Switch back to `hash(key) % N` modulo hashing",
      "Use Consistent Hashing with Bounded Load (or hot-key replication/local L1 caching) so requests overflow to successor nodes when a node exceeds `(1 + ε)` of average load"
    ],
    "correctOption": 2,
    "reasons": [
      "More virtual nodes split a single deterministic `hash(key)` across multiple points on the ring",
      "Modulo hashing splits a single key across all servers",
      "Virtual nodes balance *key count* uniformity, not *request frequency* for a single identical key; bounded-load forwarding or L1 hot-key replication spreads a hot key across nodes"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Does `hash(\"viral_key\")` ever map to more than one point on the ring just because you added more vnodes?",
    "explanation": "A single key hashes to one point on the ring regardless of how many vnodes exist. Handling a hot key requires bounded-load overflow to successor nodes or replicating/caching that hot key across frontends.",
    "tags": [
      "consistent-hashing",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["distributed-id-generation"] = [
  {
    "id": "distributed-id-generation-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What IDs leak",
    "section": "The Distributed Identifier Challenge",
    "prompt": "A product team switches public order IDs from auto-increment integers to Snowflake IDs to stop competitors estimating order volume. What do Snowflake IDs still reveal?",
    "options": [
      "The creation timestamp of each record",
      "Nothing, since Snowflake IDs are indistinguishable from random numbers",
      "The customer's region, because the worker ID encodes geography",
      "The exact number of orders placed so far"
    ],
    "answer": 0,
    "explanation": "Time-ordered IDs such as Snowflake and UUIDv7 embed the creation timestamp, which anyone can decode. They no longer expose a global running count, but they are not opaque; expose a separate random public ID if timing must stay private.",
    "tags": [
      "distributed-id-generation",
      "recall",
      "inline"
    ]
  },
  {
    "id": "distributed-id-generation-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Ticket server cost",
    "section": "Core Approaches to Distributed ID Generation",
    "prompt": "You adopt a Flickr-style central ticket server that issues each ID with one REPLACE INTO round trip. Order creation runs at 30,000 per second from many services. What is the main concern?",
    "options": [
      "IDs will collide because REPLACE INTO is not atomic",
      "IDs will be 128 bits, doubling index size",
      "Every ID costs a network round trip to one database, which is both a throughput ceiling and a single point of failure",
      "IDs will be randomly ordered and fragment B-tree indexes"
    ],
    "answer": 2,
    "explanation": "A central ticket service concentrates every ID request on one database, so it caps throughput and makes ID generation a single point of failure; Flickr mitigated this by running two servers with odd and even sequences. The IDs themselves are sequential 64-bit integers, so fragmentation and size are not the issue.",
    "tags": [
      "distributed-id-generation",
      "apply",
      "inline"
    ]
  },
  {
    "id": "distributed-id-generation-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "UUIDv4 clustered key",
    "section": "Detailed Trade-offs of Generation Patterns",
    "prompt": "A MySQL InnoDB table uses UUIDv4 as its clustered primary key. As the table grows past RAM, insert throughput falls sharply. What is the mechanism?",
    "options": [
      "UUIDv4 generation requires a network call that becomes a bottleneck at scale",
      "Random keys land on random leaf pages, causing page splits and buffer-pool misses because inserts no longer append to the right-hand edge",
      "UUIDv4 values collide more often as the table grows, forcing retries",
      "InnoDB stores UUIDs as 36-character strings, so each insert writes 36 bytes"
    ],
    "answer": 1,
    "explanation": "Random 128-bit keys scatter inserts across the whole B-tree, so pages split and must be read from disk once the working set exceeds RAM. UUIDv4 generation is local with no coordination, and collision probability stays negligible.",
    "tags": [
      "distributed-id-generation",
      "staff",
      "inline"
    ]
  },
  {
    "id": "distributed-id-generation-n1",
    "topic": "distributed-id-generation",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Snowflake Per-Node Sequence Ceiling",
    "scenario": "A 64-bit Snowflake ID allocates 1 bit sign, 41 bits millisecond timestamp, 10 bits worker ID, and 12 bits per-millisecond sequence counter (`2^12 = 4,096` IDs per millisecond per worker).",
    "prompt": "Using `2^12 = 4,096` IDs/ms, how many millions of IDs per second can a single worker node generate at peak?",
    "question": "Using `2^12 = 4,096` IDs/ms, how many millions of IDs per second can a single worker node generate at peak?",
    "unit": "million IDs/s",
    "answer": 4.096,
    "tolerance": 0.2,
    "hint": "Multiply 4,096 IDs/ms by 1,000 ms/sec and express in millions.",
    "explanation": "A 12-bit sequence counter permits 4,096 IDs per millisecond per worker, which equals 4,096 × 1,000 = 4,096,000 IDs/sec (~4.1 million IDs/sec) on a single worker without network coordination.",
    "tags": [
      "distributed-id-generation",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "distributed-id-generation-t1",
    "topic": "distributed-id-generation",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Publicly Exposing Sequential IDs vs K-Sortable Internal IDs",
    "scenario": "Your database uses 64-bit Snowflake IDs as primary keys for fast B-Tree locality, but exposing `/api/orders/7182930192` lets competitors estimate your exact order volume and timestamp to the millisecond.",
    "prompt": "How should you reconcile B-Tree index performance with external API privacy, and why?",
    "question": "How should you reconcile B-Tree index performance with external API privacy, and why?",
    "options": [
      "Switch all internal SQL primary keys and foreign keys to random 36-byte UUIDv4 strings",
      "Expose sequential `AUTO_INCREMENT` integers (`1, 2, 3`) in public URLs instead of Snowflake IDs",
      "Use time-ordered 64-bit IDs (or UUIDv7) internally for clustered B-Tree locality, and Either encrypt the ID with format-preserving encryption (FPE/Feistel cipher) at the API boundary or pair with an opaque public token"
    ],
    "correctOption": 2,
    "reasons": [
      "36-byte random strings maximize B-Tree buffer pool density",
      "Sequential integers hide company growth rates from competitors",
      "A bijective Feistel cipher (or separate public NanoID/UUIDv4 token) masks timestamp and rate leakage externally while keeping internal joins and B-Tree pages compact and sequential"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Can you transform a 64-bit integer reversibly at the API edge without changing the database storage type?",
    "explanation": "Keeping internal primary keys as 64-bit time-ordered integers preserves B-Tree write locality and small index size, while a lightweight 64-bit Feistel/FPE cipher (or opaque public ID) prevents external enumeration and timestamp leakage.",
    "tags": [
      "distributed-id-generation",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["uuid-objectid-and-snowflake"] = [
  {
    "id": "uuid-objectid-and-snowflake-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why UUIDv7 indexes well",
    "section": "Byte-Level Anatomical Breakdown of Distributed IDs",
    "prompt": "What makes UUIDv7 index-friendly compared with UUIDv4, while keeping the same 128-bit size?",
    "options": [
      "It replaces the random bits with a per-machine counter",
      "It uses a CSPRNG, so values are spread evenly across the index",
      "It shortens the value to 64 bits so it fits in a BIGINT",
      "It puts a 48-bit Unix millisecond timestamp in the highest-order bits, so new IDs sort after older ones"
    ],
    "answer": 3,
    "explanation": "UUIDv7 leads with a 48-bit millisecond timestamp followed by random bits, so inserts append near the end of the index. It stays 128 bits and keeps plenty of randomness; it is Snowflake, not UUIDv7, that fits in 64 bits.",
    "tags": [
      "uuid-objectid-and-snowflake",
      "recall",
      "inline"
    ]
  },
  {
    "id": "uuid-objectid-and-snowflake-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "ObjectId sort within a second",
    "section": "Byte-Level Anatomical Breakdown of Distributed IDs",
    "prompt": "Two MongoDB processes each insert documents during the same wall-clock second. You sort the documents by _id. How are documents from that second ordered?",
    "options": [
      "Exactly by creation time, because the counter is global across processes",
      "By the 5-byte process value and then the counter, not by true creation order, because the timestamp has only 1-second resolution",
      "Randomly, because ObjectIds are generated from random bits",
      "By the 3-byte counter first, because it occupies the most significant bytes"
    ],
    "answer": 1,
    "explanation": "An ObjectId is 4 bytes of seconds, then a 5-byte per-process value, then a 3-byte counter, so within one second the process value decides the order. The counter is per process and sits in the least significant bytes, so it does not give a global creation order.",
    "tags": [
      "uuid-objectid-and-snowflake",
      "apply",
      "inline"
    ]
  },
  {
    "id": "uuid-objectid-and-snowflake-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Engine matters for UUIDv4",
    "section": "Bitwise Memory & Index Performance Comparison",
    "prompt": "The same insert-heavy service is deployed with a UUIDv4 primary key on MySQL InnoDB and on PostgreSQL. Why does the lesson expect InnoDB to suffer more?",
    "options": [
      "InnoDB clusters the table itself on the primary key, so random keys scatter the rows, while Postgres stores rows in a heap and only the index suffers",
      "PostgreSQL converts UUIDv4 values to UUIDv7 internally",
      "InnoDB stores UUIDs as text, while Postgres always uses a native 16-byte type",
      "PostgreSQL does not build an index on UUID primary keys"
    ],
    "answer": 0,
    "explanation": "In InnoDB the primary key is the clustered index, so random keys cause page splits in the table itself and bloat every secondary index that copies the key. Postgres has a separate heap, so random keys fragment only the primary-key index; it does index them and does not rewrite them.",
    "tags": [
      "uuid-objectid-and-snowflake",
      "staff",
      "inline"
    ]
  },
  {
    "id": "uuid-objectid-and-snowflake-n1",
    "topic": "uuid-objectid-and-snowflake",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Index RAM Savings (Snowflake 8B vs String UUID 36B)",
    "scenario": "A table with 500,000,000 rows has 1 primary key index and 3 secondary indexes (each secondary index stores the primary key as its row pointer, so the PK appears 4 times per row).",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of index storage are saved by using an 8-byte `BIGINT` Snowflake ID instead of a 36-byte ASCII `CHAR(36)` UUID?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of index storage are saved by using an 8-byte `BIGINT` Snowflake ID instead of a 36-byte ASCII `CHAR(36)` UUID?",
    "unit": "GB",
    "answer": 56,
    "tolerance": 0.2,
    "hint": "Savings per PK copy = 36 - 8 = 28 bytes. Multiply by 4 indexes per row and 500,000,000 rows.",
    "explanation": "Each row stores the PK 4 times across the clustered and secondary indexes, saving 4 × 28 = 112 bytes/row. Across 500M rows, 500,000,000 × 112 B = 56 × 10^9 B = 56 GB of RAM/disk saved.",
    "tags": [
      "uuid-objectid-and-snowflake",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "uuid-objectid-and-snowflake-t1",
    "topic": "uuid-objectid-and-snowflake",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: UUIDv4 vs UUIDv7 in Relational Databases",
    "scenario": "Your microservices must generate 128-bit UUIDs client-side without central worker-ID coordination, and store them in PostgreSQL/MySQL B-Tree indexes.",
    "prompt": "Why should you choose UUIDv7 over UUIDv4, and what is the primary structural difference?",
    "question": "Why should you choose UUIDv7 over UUIDv4, and what is the primary structural difference?",
    "options": [
      "UUIDv4 embeds a 48-bit timestamp prefix that keeps B-Tree inserts sequential",
      "UUIDv7 is only 32 bits wide so it collides after 65,536 rows",
      "UUIDv7 places a 48-bit Unix millisecond timestamp in the most significant bits followed by random bits, giving client-side zero-coordination generation AND sequential B-Tree page locality"
    ],
    "correctOption": 2,
    "reasons": [
      "Random high bits in UUIDv4 prevent B-Tree page splits",
      "Smaller bit widths eliminate birthday collisions",
      "Putting the timestamp in the high bits sorts new IDs at the right edge of the B-Tree while the trailing 74 random bits prevent collisions without a worker registry"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Which bits of a key determine where it lands in a B-Tree index?",
    "explanation": "UUIDv7 combines the zero-coordination simplicity of 128-bit UUIDs with the 48-bit big-endian millisecond prefix of Snowflake/ULID, eliminating UUIDv4's random B-Tree page thrashing.",
    "tags": [
      "uuid-objectid-and-snowflake",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["snowflake-id-design"] = [
  {
    "id": "snowflake-id-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Thread-safe generator",
    "section": "Mechanics",
    "prompt": "A Snowflake generator runs in a multi-threaded service. What must be true of its (last_ts, sequence) state?",
    "options": [
      "Each thread keeps its own copy, since the worker ID already guarantees uniqueness",
      "It must be persisted to disk on every ID so restarts cannot repeat values",
      "It must be updated atomically, for example with a mutex, a CAS on packed state, or a single owning thread",
      "It only needs to be read atomically; writes can be unsynchronised"
    ],
    "answer": 2,
    "explanation": "Concurrent callers must see the timestamp and sequence change together, otherwise two threads can compose the same ID in one millisecond. Per-thread copies share one worker ID, so they would produce duplicates; persisting on every ID is unnecessary, as a periodic high-water mark is enough for restarts.",
    "tags": [
      "snowflake-id-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "snowflake-id-design-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Recipe for duplicates",
    "section": "Failure mode",
    "prompt": "Which combination of events is most likely to produce duplicate Snowflake IDs in production?",
    "options": [
      "Two workers with different IDs generating 4,096 IDs in the same millisecond",
      "A worker exhausting its sequence and spinning until the next millisecond",
      "IDs from different workers interleaving within the clock-skew window",
      "A VM resuming with an older clock while its worker ID has been reassigned to another live process"
    ],
    "answer": 3,
    "explanation": "Uniqueness rests on two invariants, unique live worker IDs and a timestamp that never goes backwards; breaking both lets two generators emit the same time, worker and sequence triple. Interleaving across workers only weakens ordering, and sequence exhaustion only adds a short delay.",
    "tags": [
      "snowflake-id-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "snowflake-id-design-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Re-splitting the bits",
    "section": "Worked example: the numbers behind the 64 bits",
    "prompt": "Your system will never need more than 64 generators, but each must handle bursts of 50,000 IDs in one millisecond. Keeping 1 sign bit and 41 timestamp bits, which split of the remaining 22 bits fits?",
    "options": [
      "6 worker bits and 16 sequence bits",
      "10 worker bits and 12 sequence bits",
      "8 worker bits and 14 sequence bits",
      "4 worker bits and 18 sequence bits"
    ],
    "answer": 0,
    "explanation": "6 bits give exactly 64 workers and 16 bits give 65,536 IDs per ms, covering the 50k burst. 14 sequence bits allow only 16,384 per ms, the default 12 only 4,096, and 4 worker bits allow only 16 generators.",
    "tags": [
      "snowflake-id-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "snowflake-id-design-n1",
    "topic": "snowflake-id-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Per-Node Snowflake ID Throughput Ceiling",
    "scenario": "A standard 64-bit Snowflake ID allocates 1 sign bit, 41 timestamp bits (in milliseconds), 10 worker/machine ID bits, and 12 sequence number bits per millisecond.",
    "prompt": "Given 2^12 = 4,096 sequence values per millisecond, how many unique IDs (in millions of IDs per second, rounded to the nearest integer) can a single worker node generate at theoretical peak?",
    "question": "Given 2^12 = 4,096 sequence values per millisecond, how many unique IDs (in millions of IDs per second, rounded to the nearest integer) can a single worker node generate at theoretical peak?",
    "unit": "million IDs/s",
    "answer": 4,
    "tolerance": 0.25,
    "hint": "4,096 IDs/ms × 1,000 ms/s = 4,096,000 IDs/s ≈ 4 million IDs/s.",
    "explanation": "With 12 sequence bits, a single worker can allocate 2^12 = 4,096 IDs per millisecond, or 4,096 × 1,000 = 4,096,000 (~4.1 million) unique, k-sortable 64-bit IDs per second without any network coordination.",
    "tags": [
      "snowflake-id-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "snowflake-id-design-t1",
    "topic": "snowflake-id-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Handling NTP Backward Clock Jumps in Snowflake Generators",
    "scenario": "An NTP step adjustment moves a Snowflake worker's wall clock backward by 12 milliseconds. If the generator immediately emits IDs using the regressed timestamp, it risks colliding with IDs generated 12 ms ago.",
    "prompt": "How should the Snowflake generator handle small backward clock skews (< 20 ms) vs large regressions, and why?",
    "question": "How should the Snowflake generator handle small backward clock skews (< 20 ms) vs large regressions, and why?",
    "options": [
      "Ignore the backward jump and reset the 12-bit sequence counter to 0 immediately",
      "Pin `last_timestamp`, pause/spin-wait (or advance sequence bits on the logical high-water timestamp) for small skews up to a bounded threshold, and refuse ID generation (circuit-break + alert) if skew exceeds the safety bound",
      "Switch to random UUIDv4 strings stored as 36-byte `VARCHAR` keys on clock skew"
    ],
    "correctOption": 1,
    "reasons": [
      "Resetting the sequence to 0 on a repeated millisecond guarantees uniqueness",
      "Monotonic high-water clamping preserves uniqueness across brief NTP adjustments, while failing fast on large regressions prevents unbounded thread stalls or duplicate IDs",
      "Mixing 36-byte string UUIDs into a 64-bit `BIGINT` column requires zero schema changes"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Track the highest millisecond seen so far (`last_timestamp`) and never emit a smaller timestamp.",
    "explanation": "A Snowflake worker must enforce `timestamp >= last_timestamp`. For tiny NTP adjustments (a few ms), holding `last_timestamp` (consuming remaining sequence numbers or waiting until wall clock catches up) prevents collisions safely; for large regressions, failing health checks protects data integrity.",
    "tags": [
      "snowflake-id-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["clock-skew-and-id-ordering"] = [
  {
    "id": "clock-skew-and-id-ordering-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "LWW with skewed clocks",
    "section": "Why Physical Clocks Lie in Distributed Systems",
    "prompt": "Node A writes X, then sends a message that causes node B to write Y to the same key. B's clock is 40 ms behind A's. With last-write-wins by wall-clock timestamp, what can happen?",
    "options": [
      "Y wins, because it was written later in real time",
      "The database detects the conflict and keeps both versions",
      "Y is stamped earlier than X, so X silently wins and the causally later write Y is lost",
      "NTP corrects B's clock before the write, so ordering is preserved"
    ],
    "answer": 2,
    "explanation": "Physical timestamps cannot guarantee causality; with skew, the later write can carry a smaller timestamp and LWW discards it without any error. LWW does not keep siblings, and NTP residual error persists between syncs, so it cannot be relied on to fix ordering.",
    "tags": [
      "clock-skew-and-id-ordering",
      "recall",
      "inline"
    ]
  },
  {
    "id": "clock-skew-and-id-ordering-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "When epsilon grows",
    "section": "Google Spanner's TrueTime API: Bounding Uncertainty",
    "prompt": "In a Spanner-like system, TrueTime's uncertainty epsilon rises from about 4 ms to 20 ms because time masters become hard to reach. What is the main effect?",
    "options": [
      "Commit wait grows with epsilon, so write latency rises but ordering guarantees are preserved",
      "Transactions may commit out of real-time order until epsilon shrinks again",
      "Reads start failing because timestamps are no longer unique",
      "Nothing changes, because commit wait uses a fixed 7 ms delay"
    ],
    "answer": 0,
    "explanation": "Commit wait holds a transaction until its timestamp is guaranteed to be in the past, so the wait scales with epsilon and larger uncertainty costs latency, not correctness. Out-of-order commits would only happen if the system ignored the interval, which is exactly what commit wait prevents.",
    "tags": [
      "clock-skew-and-id-ordering",
      "staff",
      "inline"
    ]
  },
  {
    "id": "clock-skew-and-id-ordering-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Comparing vector clocks",
    "section": "Under the Hood: Lamport Timestamps & Vector Clocks",
    "prompt": "A Dynamo-style store holds two versions of a cart with vector clocks VA = [2, 1, 0] and VB = [1, 2, 0]. What should the system conclude?",
    "options": [
      "VB is newer because its largest component is on a later node",
      "VA is newer because it has the larger first component",
      "They are identical, because both sum to 3",
      "They are concurrent, since each has a component greater than the other, so both must be kept and merged"
    ],
    "answer": 3,
    "explanation": "VA is ahead in the first component and VB in the second, so neither causally precedes the other and the updates conflict. Picking by any single component or by the sum would silently drop one user's change, which is what vector clocks exist to prevent.",
    "tags": [
      "clock-skew-and-id-ordering",
      "apply",
      "inline"
    ]
  },
  {
    "id": "clock-skew-and-id-ordering-n1",
    "topic": "clock-skew-and-id-ordering",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: NTP Backward Step Wait Budget",
    "scenario": "A Snowflake generator detects that the local system clock stepped backward by 15 ms during an NTP adjustment. Instead of throwing an error, it pauses (`sleep`) until `System.currentTimeMillis()` catches up to `lastTimestamp`. During those 15 ms, requests arrive at 2,000 req/s.",
    "prompt": "How many in-flight ID requests are briefly held in memory waiting for the 15 ms clock catch-up?",
    "question": "How many in-flight ID requests are briefly held in memory waiting for the 15 ms clock catch-up?",
    "unit": "requests",
    "answer": 30,
    "tolerance": 0.2,
    "hint": "Multiply 2,000 req/s (which is 2 req/ms) by 15 ms.",
    "explanation": "At 2,000 req/s (2 requests/ms), pausing generation for a small 15 ms NTP step holds only 2 × 15 = 30 requests for at most 15 ms, safely preserving strict monotonicity without failing requests.",
    "tags": [
      "clock-skew-and-id-ordering",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "clock-skew-and-id-ordering-t1",
    "topic": "clock-skew-and-id-ordering",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Handling Small vs Large Backward Clock Jumps in Snowflake",
    "scenario": "An NTP daemon or VM live migration can cause either a tiny backward clock adjustment (< 20 ms) or a severe backward jump (e.g., 3 seconds).",
    "prompt": "How should a production Snowflake generator handle backward clock skew so it never issues duplicate IDs, and why?",
    "question": "How should a production Snowflake generator handle backward clock skew so it never issues duplicate IDs, and why?",
    "options": [
      "Ignore backward clock jumps and reset the sequence counter to 0 at the older timestamp",
      "Block threads inside a `while` spin-loop for up to 10 minutes on any clock jump",
      "Ride through small backward skews (< 10–50 ms) by holding `lastTimestamp` and incrementing the sequence counter (or sleeping briefly), and fail fast / switch worker epoch on large jumps while using NTP slew mode (`chrony`)"
    ],
    "correctOption": 2,
    "reasons": [
      "Reusing an older millisecond timestamp with `sequence = 0` is guaranteed to be collision-free",
      "Blocking HTTP worker threads for minutes prevents cascading timeouts",
      "Reusing a past millisecond risks duplicate IDs; riding on the logical high-water mark handles micro-skews cleanly, while failing closed (or rotating worker ID) protects uniqueness on major clock faults"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens if a node generates IDs at `t = 1000`, the clock jumps back to `t = 995`, and it generates IDs at `t = 1000` again?",
    "explanation": "If a generator ever emits IDs for the same `(timestamp, worker_id, sequence)` twice, primary key collisions occur. Tracking `lastTimestamp` as a monotonic high-water mark prevents duplicates.",
    "tags": [
      "clock-skew-and-id-ordering",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["keyset-pagination"] = [
  {
    "id": "keyset-pagination-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why the tie-breaker",
    "section": "Mechanics",
    "prompt": "An API pages orders with ORDER BY created_at DESC and a cursor holding only the last created_at. Why must the cursor also include id?",
    "options": [
      "Without it the database cannot use the index on created_at",
      "Rows sharing the same created_at would be skipped or repeated at page boundaries, because the order is not unique",
      "The id makes the cursor harder for clients to forge",
      "Including id makes each page seek O(1) instead of O(log N)"
    ],
    "answer": 1,
    "explanation": "Keyset pagination needs a unique, deterministic order; with ties on created_at the cursor cannot say where within the tie to resume. Opaque encoding and signing, not the id itself, protect against forged cursors, and the seek remains roughly O(log N) either way.",
    "tags": [
      "keyset-pagination",
      "recall",
      "inline"
    ]
  },
  {
    "id": "keyset-pagination-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Paging by updated_at",
    "section": "Failure mode",
    "prompt": "A sync client pages through tickets with keyset pagination on (updated_at, id) ascending. Agents edit tickets constantly while the client pages. What can go wrong?",
    "options": [
      "Nothing, because keyset pagination is fully stable under concurrent writes",
      "The index seek degrades to a full scan once rows are updated",
      "A ticket updated mid-scan moves past the cursor and can appear again on a later page, while its old position is gone",
      "The client receives a database error when the cursor row is modified"
    ],
    "answer": 2,
    "explanation": "Keyset pagination handles inserts ahead of the cursor well, but updating the sort key moves rows within the order, so they can reappear later (and deletions of unseen rows change results). The index seek itself is unaffected; this is a semantics problem, not a performance one.",
    "tags": [
      "keyset-pagination",
      "staff",
      "inline"
    ]
  },
  {
    "id": "keyset-pagination-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Expanding the tuple",
    "section": "Worked example: page 5,000 of an orders feed",
    "prompt": "On MySQL you must expand the row comparison (created_at, id) less than (:ts, :id) by hand. Which WHERE clause is equivalent?",
    "options": [
      "created_at ≤ :ts AND id less than :id",
      "created_at less than :ts AND id less than :id",
      "created_at less than :ts OR id less than :id",
      "created_at less than :ts OR (created_at = :ts AND id less than :id)"
    ],
    "answer": 3,
    "explanation": "Tuple comparison means an earlier created_at, or the same created_at with a smaller id. The tempting created_at ≤ :ts AND id less than :id wrongly drops older rows whose id happens to be larger than :id.",
    "tags": [
      "keyset-pagination",
      "apply",
      "inline"
    ]
  },
  {
    "id": "keyset-pagination-n1",
    "topic": "keyset-pagination",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Deep `OFFSET` Row Scan Amplification",
    "scenario": "A scraper paginates through a table using `LIMIT 50 OFFSET 500000`. To serve this single page of 50 rows, the database must scan and discard 500,000 index entries before returning 50.",
    "prompt": "What is the ratio of total rows scanned (`500,050`) to rows returned (`50`) for this single query?",
    "question": "What is the ratio of total rows scanned (`500,050`) to rows returned (`50`) for this single query?",
    "unit": "x",
    "answer": 10001,
    "tolerance": 0.2,
    "hint": "Divide 500,050 total rows scanned by 50 rows returned.",
    "explanation": "500,050 / 50 = 10,001× scan amplification: the database does over ten thousand times more work than a keyset cursor query (`WHERE id < last_id LIMIT 50`) which scans exactly 50 rows.",
    "tags": [
      "keyset-pagination",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "keyset-pagination-t1",
    "topic": "keyset-pagination",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Composite Tie-Breaker Key in Keyset Pagination",
    "scenario": "You replace `OFFSET` pagination on an orders feed with `WHERE created_at < :cursor_ts ORDER BY created_at DESC LIMIT 50`. During peak traffic, multiple orders share the exact same millisecond `created_at` timestamp, causing some orders to be silently skipped across page boundaries.",
    "prompt": "How do you fix the missing-row bug in keyset pagination, and why?",
    "question": "How do you fix the missing-row bug in keyset pagination, and why?",
    "options": [
      "Revert to `OFFSET 1000000` pagination",
      "Add a random `SLEEP()` before inserting each order so timestamps never collide",
      "Use a deterministic composite cursor `(created_at, id)` with tuple comparison `WHERE (created_at, id) < (:cursor_ts, :cursor_id) ORDER BY created_at DESC, id DESC`"
    ],
    "correctOption": 2,
    "reasons": [
      "`OFFSET` prevents duplicate/skipped rows when new items are inserted at the top of the feed",
      "Sleeping on writes scales well under high concurrency",
      "Appending a unique tie-breaker column (`id`) to both the index and the cursor predicate establishes a strict total ordering across rows with identical timestamps"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "A keyset cursor requires a strictly unique total order across rows.",
    "explanation": "Because `created_at` is not unique, `WHERE created_at < :ts` skips any remaining rows that shared `:ts` on the boundary page. A composite cursor `(created_at, id)` backed by an index on `(created_at DESC, id DESC)` guarantees a total order.",
    "tags": [
      "keyset-pagination",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["bloom-filters"] = [
  {
    "id": "bloom-filters-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Reading a Bloom answer",
    "section": "Mechanics",
    "prompt": "A lookup checks a key against a correctly built, current Bloom filter and finds all k bits set. What can you conclude?",
    "options": [
      "The key was probably inserted, but you must check the underlying data to be sure",
      "The key was definitely inserted",
      "The key was definitely not inserted",
      "The filter is saturated and must be rebuilt"
    ],
    "answer": 0,
    "explanation": "All bits set means 'maybe present', because other keys may have set those bits, so a false positive is possible. Only an unset bit gives a certain answer, and that answer is 'definitely not present'.",
    "tags": [
      "bloom-filters",
      "recall",
      "inline"
    ]
  },
  {
    "id": "bloom-filters-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Deleting from a filter",
    "section": "Failure mode",
    "prompt": "To support deletes, an engineer clears a key's k bits when the key is removed from a standard Bloom filter. What failure does this introduce?",
    "options": [
      "The false-positive rate rises for all keys",
      "Lookups become slower because more bits must be checked",
      "Other keys sharing those bits start returning 'definitely not present', creating false negatives",
      "The filter can no longer accept new inserts"
    ],
    "answer": 2,
    "explanation": "Bits are shared between keys, so clearing them can make present keys look absent, which breaks the filter's one guarantee. Clearing bits actually lowers the false-positive rate; use a counting or cuckoo filter, or rebuild, if you need deletes.",
    "tags": [
      "bloom-filters",
      "staff",
      "inline"
    ]
  },
  {
    "id": "bloom-filters-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Cost of fewer false positives",
    "section": "Worked example: sizing a filter",
    "prompt": "A filter for 100M keys at a 1 percent false-positive rate uses about 120 MB. You want 0.1 percent instead. Roughly how much extra memory does that cost?",
    "options": [
      "About 1.08 GB, because 10x fewer false positives needs 10x the bits",
      "About 60 MB, since each 10x reduction costs about 4.8 more bits per item",
      "About 12 MB, since only a few extra hash functions are needed",
      "About 600 MB, because bits scale with the square of the precision"
    ],
    "answer": 1,
    "explanation": "Bits per item grow with ln(1/p), so each 10x cut in false positives adds about 4.8 bits per item, taking 9.6 to 14.4 bits, or about 60 MB more for 100M keys. Memory grows logarithmically, not linearly, with the reduction in false positives.",
    "tags": [
      "bloom-filters",
      "apply",
      "inline"
    ]
  },
  {
    "id": "bloom-filters-n1",
    "topic": "bloom-filters",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Sizing a 1% False-Positive Bloom Filter",
    "scenario": "You want to hold 100 million keys in an in-memory Bloom filter with a 1% false-positive rate. A 1% false-positive rate requires approximately 10 bits per key (optimal k = 7 hash functions).",
    "prompt": "How many megabytes (MB, using 1 MB = 10^6 bytes and 8 bits = 1 byte) of RAM does this Bloom filter require?",
    "question": "How many megabytes (MB, using 1 MB = 10^6 bytes and 8 bits = 1 byte) of RAM does this Bloom filter require?",
    "unit": "MB",
    "answer": 125,
    "tolerance": 0.25,
    "hint": "Total bits = 100,000,000 × 10 = 1,000,000,000 bits. Divide by 8 bits/byte and 10^6 bytes/MB.",
    "explanation": "100,000,000 keys × 10 bits/key = 10^9 bits = 125,000,000 bytes = 125 MB. Compare that 125 MB footprint to storing 100M 64-bit keys in a hash set (~1.6–2.4 GB).",
    "tags": [
      "bloom-filters",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "bloom-filters-t1",
    "topic": "bloom-filters",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Standard Bloom vs Counting/Cuckoo Filter for Mutable Sets",
    "scenario": "You place a filter in front of a user-blocklist database to short-circuit negative lookups at 200,000 req/s. However, users frequently unblock accounts (deletions), and false negatives (failing to block a blocked pair) are strictly forbidden.",
    "prompt": "Which probabilistic filter structure and update strategy should you choose, and why?",
    "question": "Which probabilistic filter structure and update strategy should you choose, and why?",
    "options": [
      "Clear the corresponding bits to 0 in a standard single-bit Bloom filter whenever an unblock event occurs",
      "Use a Cuckoo filter (or Counting Bloom filter with periodic full rebuilds) that supports deletions without introducing false negatives",
      "Invert the Bloom filter to store non-blocked pairs instead of blocked pairs"
    ],
    "correctOption": 1,
    "reasons": [
      "Clearing bits in a standard Bloom filter never affects other keys that hashed to the same bit positions",
      "Zeroing shared bits in a standard Bloom filter causes false negatives for colliding keys; Cuckoo or Counting filters support safe deletion while preserving zero false negatives",
      "Storing all non-blocked pairs among 100M users uses less memory than storing blocked pairs"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What happens to Key A if Key B shares bit index 42 and unblocking Key B sets bit 42 to 0?",
    "explanation": "Zeroing a bit in a standard Bloom filter can erase a bit set by another active key, creating a false negative (violating the blocklist invariant). Counting Bloom filters (4-bit counters per slot) or Cuckoo filters support deletions without false negatives.",
    "tags": [
      "bloom-filters",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["hot-cold-storage-archival"] = [
  {
    "id": "hot-cold-storage-archival-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Setting tier boundaries",
    "section": "Under the Hood: The Economics and Hardware of Data Lifecycles",
    "prompt": "What should decide when records move from the hot tier to cheaper tiers?",
    "options": [
      "A fixed industry rule of 30, 90 and 365 days",
      "Whatever the cheapest storage class allows as a minimum duration",
      "The size of the hot cluster's disks, moving data only when they fill",
      "Your measured access pattern by data age, together with retention and compliance rules"
    ],
    "answer": 3,
    "explanation": "The lesson says reads often concentrate on recent data but tells you to measure your own access pattern before choosing boundaries. The 30/90/365 figures in the diagram are an example lifecycle, not a rule, and waiting for disks to fill wastes expensive capacity.",
    "tags": [
      "hot-cold-storage-archival",
      "recall",
      "inline"
    ]
  },
  {
    "id": "hot-cold-storage-archival-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "One-hour retrieval SLA",
    "section": "Hardware, Latency, and Cost Breakdown",
    "prompt": "Audit records must be kept for 7 years and are rarely read, but any record must be retrievable within 1 hour when a regulator asks. Which tier is the cheapest that reliably meets the SLA?",
    "options": [
      "Glacier Deep Archive, at about $0.99 per TB-month",
      "Glacier Instant Retrieval, which returns objects in milliseconds",
      "Glacier Flexible Retrieval with Standard retrieval",
      "Hot NVMe storage in the primary database"
    ],
    "answer": 1,
    "explanation": "Deep Archive takes 12 to 48 hours and Flexible Retrieval Standard takes 3 to 5 hours, so both miss a 1-hour SLA despite being cheaper. Instant Retrieval meets it at a small fraction of hot NVMe cost.",
    "tags": [
      "hot-cold-storage-archival",
      "apply",
      "inline"
    ]
  },
  {
    "id": "hot-cold-storage-archival-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Archiving tombstones",
    "section": "Tombstones and Lifecycle Compaction",
    "prompt": "A job exports Cassandra tables straight to Parquet in S3 without compacting first. Analysts querying the archive with Athena complain of slow queries. What is the likely cause?",
    "options": [
      "The export carried tombstones for deletes and expired TTLs, so the archive holds dead markers the engine must read and filter",
      "Parquet cannot store data exported from LSM-tree databases efficiently",
      "Athena cannot read files written by Cassandra's export tool without conversion",
      "S3 Standard adds 12 to 48 hours of latency to the first read"
    ],
    "answer": 0,
    "explanation": "Deletes, expired TTLs and null writes leave tombstones, and exporting without compaction copies that dead data into the archive, slowing every scan. Parquet and Athena work fine on compacted data; the 12 to 48 hour latency belongs to Deep Archive, not S3 Standard.",
    "tags": [
      "hot-cold-storage-archival",
      "staff",
      "inline"
    ]
  },
  {
    "id": "hot-cold-storage-archival-n1",
    "topic": "hot-cold-storage-archival",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Annual Cloud Storage Cost Reduction via Tiering",
    "scenario": "Your compliance logs total 500 TB (500,000 GB). Only the last 30 days (50 TB) are queried frequently and need hot NVMe SSD storage ($0.10/GB-month), while the remaining 450 TB can move to cold object storage ($0.01/GB-month).",
    "prompt": "How many thousands of dollars per month are saved by tiering the 450 TB of cold data to object storage instead of keeping all 500 TB on hot NVMe?",
    "question": "How many thousands of dollars per month are saved by tiering the 450 TB of cold data to object storage instead of keeping all 500 TB on hot NVMe?",
    "unit": "k$/month",
    "answer": 40.5,
    "tolerance": 0.2,
    "hint": "450,000 GB × ($0.10 - $0.01)/GB-month = 450,000 × $0.09.",
    "explanation": "Moving 450,000 GB from $0.10/GB-mo to $0.01/GB-mo saves $0.09/GB-mo × 450,000 GB = $40,500/month ($40.5k/month, or $486k/year).",
    "tags": [
      "hot-cold-storage-archival",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "hot-cold-storage-archival-t1",
    "topic": "hot-cold-storage-archival",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: `DELETE WHERE` Archival vs Time-Range Partition Drop",
    "scenario": "Every night, a cron job moves 50,000,000 rows older than 90 days to S3 Parquet and runs `DELETE FROM events WHERE created_at < NOW() - INTERVAL '90 days'` on the primary PostgreSQL table, causing massive WAL spikes, autovacuum lag, and table bloat.",
    "prompt": "Which table design eliminates the `DELETE` I/O storm when aging out hot data, and why?",
    "question": "Which table design eliminates the `DELETE` I/O storm when aging out hot data, and why?",
    "options": [
      "Run `VACUUM FULL events` every night during peak traffic to reclaim space",
      "Delete rows one by one in 50,000,000 separate transactions",
      "Use declarative time-range partitioning (e.g., daily or weekly partitions) so after exporting an old partition to S3 Parquet, you detach and `DROP TABLE` the expired partition in O(1) metadata time"
    ],
    "correctOption": 2,
    "reasons": [
      "`VACUUM FULL` acquires an `ACCESS EXCLUSIVE` table lock and rewrites the entire table",
      "50M individual transactions eliminate WAL generation",
      "Detaching and dropping a time-partition unlinks the underlying segment files at the OS level with near-zero WAL writes, zero dead tuples, and zero vacuum overhead"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Compare deleting 50M rows individually in a B-Tree vs unlinking a partition file.",
    "explanation": "Bulk `DELETE` statements generate WAL for every row, dirty every index page, and leave dead tuples for `VACUUM`. Range-partitioning by time turns retention cleanup into an instantaneous `DETACH` + `DROP` operation.",
    "tags": [
      "hot-cold-storage-archival",
      "tradeoff",
      "staff"
    ]
  }
];
