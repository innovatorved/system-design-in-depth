window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-nosql-partitioning"] = {
  "nosql-decision-boundaries": {
    "title": "NoSQL decision boundaries",
    "video": {
      "youtubeId": "0buKQHokLK8",
      "title": "How do NoSQL databases work? Simply Explained!",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A product needs transactions for orders but also ingests a very high-volume append-only device stream.</p><h2>Mechanics</h2><p>SQL versus NoSQL is not B-tree versus LSM. PostgreSQL uses heap tables with indexes; InnoDB is a MySQL engine with a clustered B+ tree; some relational and non-relational products use LSM trees. Choose per workload: access patterns, transactions, consistency, latency, geography, scale, and operating skill.</p><h2>Failure mode</h2><p>Moving to a store without matching transaction or query semantics can create dual-write inconsistency and expensive application joins. Conversely, keeping an unbounded write stream in a poorly configured single write domain can miss capacity targets.</p><h2>Trade-off</h2><p>Relational systems offer flexible queries and constraints; specialized stores may offer simpler partitioned access or write scaling. Capacity is one reason to change, not the only one, and category labels do not determine guarantees.</p></div>",
    "keyTakeaways": [
      "SQL versus NoSQL does not determine one storage engine or consistency model.",
      "Choose from access patterns, transactions, consistency, latency, scale, and operations.",
      "Capacity is one decision input, not the only reason to choose a datastore."
    ],
    "furtherReading": [
      {
        "title": "Martin Kleppmann: Designing Data-Intensive Applications (Storage Engines)",
        "url": "https://dataintensive.net/"
      },
      {
        "title": "Amazon Dynamo Paper (2007)",
        "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"
      }
    ]
  },
  "document-vs-key-value-stores": {
    "title": "Document vs key-value stores",
    "video": {
      "youtubeId": "0buKQHokLK8",
      "title": "How do NoSQL databases work? Simply Explained!",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>Sessions need lookup by token, while a catalog needs predicates on nested product attributes.</p><h2>Mechanics</h2><p>A minimal key-value store exposes opaque bytes by key, but products vary: Redis has server-side structured types and DynamoDB supports attributes and secondary indexes. Document stores expose fields and indexes inside records, paying parsing and index-maintenance costs.</p><h2>Failure mode</h2><p>Manually maintained secondary structures can diverge after a partial write. Too many document indexes amplify writes, and large documents can create contention or transfer waste.</p><h2>Trade-off</h2><p>Key-based access is simple and predictable; document queries improve flexibility. Select by required operations rather than assuming every key-value value is opaque or every document store provides relational constraints.</p></div>",
    "keyTakeaways": [
      "Key-value products differ: some expose opaque bytes and others structured values or indexes.",
      "Document indexes improve field queries while amplifying writes.",
      "Select from required operations and guarantees rather than category labels."
    ],
    "furtherReading": [
      {
        "title": "MongoDB Architecture Guide: WiredTiger Internals",
        "url": "https://www.mongodb.com/docs/manual/core/wiredtiger/"
      },
      {
        "title": "Redis Under the Hood: Internal Data Structures",
        "url": "https://redis.io/docs/latest/develop/data-types/"
      }
    ]
  },
  "columnar-vs-wide-column-stores": {
    "title": "Columnar vs wide-column stores",
    "video": {
      "youtubeId": "0buKQHokLK8",
      "title": "How do NoSQL databases work? Simply Explained!",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Vectorized OLAP Engines vs. Distributed LSM Tables</h2>\n      <p>Engineers often confuse <strong>Wide-Column stores</strong> (Apache Cassandra, ScyllaDB, Google Cloud Bigtable) with true <strong>Columnar databases</strong> (ClickHouse, Snowflake, DuckDB, AWS Redshift, Apache Parquet). Despite both referencing 'columns', their underlying storage engines serve diametrically opposed workloads:</p>\n      <ul>\n        <li><strong>Wide-Column (Cassandra / ScyllaDB):</strong> An <strong>OLTP engine</strong> designed for massive horizontal distributed writes. Under the hood, data is organized around a <code>Partition Key</code> and a <code>Clustering Key</code>. Rows are stored in an LSM-tree sorted by clustering key. It is effectively a two-dimensional key-value store: <code>Map<PartitionKey, SortedMap<ClusteringKey, Columns>></code>. All columns for a given row are stored contiguously in an SSTable data file.</li>\n        <li><strong>Columnar (ClickHouse / Parquet):</strong> An <strong>OLAP engine</strong> designed for aggregate analytical queries across billions of rows (e.g., <code>SELECT avg(latency), sum(bytes) FROM logs WHERE status = 500</code>). On disk, values for a single column across millions of rows are packed sequentially into compressed data blocks.</li>\n      </ul>\n\n      <h2>Disk Layout: Row-Oriented vs. Pure Columnar</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph RowLayout [\"Row / Wide-Column Storage (Cassandra / Postgres)\"]\n      R1[\"Row 1: [ID: 1 | Timestamp: 10:00 | Status: 200 | Latency: 42ms | Payload: '...'\"]\"]\n      R2[\"Row 2: [ID: 2 | Timestamp: 10:01 | Status: 500 | Latency: 980ms | Payload: '...'\"]\"]\n      R3[\"Row 3: [ID: 3 | Timestamp: 10:02 | Status: 200 | Latency: 35ms | Payload: '...'\"]\"]\n    end\n\n    subgraph ColumnarLayout [\"Pure Columnar Storage (ClickHouse / Parquet)\"]\n      C_ID[\"Col 'ID': [1, 2, 3\"] (Bit-packed)\"]\n      C_Time[\"Col 'Timestamp': [10:00, 10:01, 10:02\"] (Delta-encoded)\"]\n      C_Status[\"Col 'Status': [200, 500, 200\"] (Dictionary compressed)\"]\n      C_Latency[\"Col 'Latency': [42, 980, 35\"] (SIMD Vectorized array)\"]\n    end\n      </div>\n\n      <h2>Why Columnar Storage Wins for Analytics: Vectorization & Compression</h2>\n      <p>When calculating an average across 100 million logs, a row-oriented database must read all row data (including user agents, payloads, request URLs) from disk into RAM, discarding 95% of the bytes read. A columnar engine only reads the <code>latency</code> column file from disk.</p>\n      <p>Furthermore, because identical data types sit adjacent on disk, columnar engines achieve 10:1 compression ratios using specialized codecs:</p>\n      <ul>\n        <li><strong>Run-Length Encoding (RLE):</strong> Sequences of identical values (e.g., <code>[200, 200, 200, 200]</code>) compress to <code>[200, count=4]</code>.</li>\n        <li><strong>Delta Encoding:</strong> Timestamps (<code>1600000000, 1600000001, 1600000003</code>) store only the small deltas (<code>+1, +2</code>), which compress down to single bytes.</li>\n        <li><strong>SIMD Vectorization:</strong> Modern CPUs can execute mathematical operations on 512-bit registers (AVX-512) processing 16 integer values per CPU clock cycle.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Wide-Column stores (Cassandra) are distributed OLTP databases storing rows contiguously in SSTables indexed by partition keys.",
      "Pure Columnar engines (ClickHouse) store each column in a dedicated compressed file, scanning only the necessary columns.",
      "Columnar formats leverage Delta encoding, Dictionary compression, and SIMD CPU vectorization for orders-of-magnitude faster aggregations compared to row-oriented storage (see: Abadi et al., 'Column-Stores vs. Row-Stores', SIGMOD 2008)."
    ],
    "furtherReading": [
      {
        "title": "ClickHouse Architecture: Why ClickHouse is so Fast",
        "url": "https://clickhouse.com/docs/en/development/architecture"
      },
      {
        "title": "Cassandra Internals: Understanding SSTables and Compaction",
        "url": "https://cassandra.apache.org/doc/latest/cassandra/architecture/storage_engine.html"
      }
    ]
  },
  "graph-database-decision-boundary": {
    "title": "Graph database decision boundary",
    "video": {
      "youtubeId": "0buKQHokLK8",
      "title": "How do NoSQL databases work? Simply Explained!",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A fraud check must traverse variable-depth relationships among accounts, devices, and cards, while a user page needs only direct friends.</p><h2>Mechanics</h2><p>Relational recursive queries and graph adjacency traversal both cost work proportional to the visited structure, filters, indexes, and cache behavior; there is no general O(log N)^D rule. Graph stores make relationships first-class and can avoid repeated global index lookups for each hop.</p><h2>Failure mode</h2><p>A supernode can expand to millions of edges, exhausting a latency budget. Partitioning a connected graph and maintaining relationship updates can also be difficult.</p><h2>Trade-off</h2><p>Graph databases improve expressive traversals and relationship-centric models, but add another query language and operational system. Bounded indexed joins can remain simpler and fast in SQL.</p></div>",
    "keyTakeaways": [
      "Traversal cost depends on visited relationships, filters, indexes, and locality.",
      "Graph stores make adjacency first-class but still face supernodes and partitioning.",
      "Bounded indexed SQL traversal can remain the simpler choice."
    ],
    "furtherReading": [
      {
        "title": "Neo4j Internals: Understanding Index-Free Adjacency",
        "url": "https://neo4j.com/developer/graph-database/"
      },
      {
        "title": "Meta TAO: How Facebook Serves the Social Graph",
        "url": "https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson"
      }
    ]
  },
  "sharding-and-partitioning": {
    "title": "Sharding and partitioning",
    "video": {
      "youtubeId": "be6PLMKKSto",
      "title": "The Basics of Database Sharding and Partitioning in System Design",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>One tenant dominates writes and the primary no longer meets latency or recovery targets.</p><h2>Mechanics</h2><p>Shard when measured capacity, locality, or fault-domain requirements cannot be met safely by one write domain; there is no universal 2 TB or writes-per-second threshold. Range partitioning aids scans but can hotspot monotonic keys; hashing spreads keys but scatters ranges.</p><h2>Failure mode</h2><p>A poor shard key creates hot partitions, cross-shard joins, and distributed transactions. Rebalancing can consume network and disk while old and new routers disagree.</p><h2>Trade-off</h2><p>Sharding adds capacity and isolation at the cost of routing, rebalancing, global constraints, and operations. Vertical scaling or partitioning within one database is often simpler first.</p></div>",
    "keyTakeaways": [
      "No universal size or throughput threshold requires sharding.",
      "Range and hash partitioning exchange scan locality for distribution.",
      "Sharding adds routing, rebalancing, and cross-shard coordination."
    ],
    "furtherReading": [
      {
        "title": "CockroachDB Architecture: How Sharding and Ranges Work",
        "url": "https://www.cockroachlabs.com/docs/stable/architecture/overview.html"
      },
      {
        "title": "Pinterest: Sharding Pinterest Databases",
        "url": "https://medium.com/pinterest-engineering/sharding-pinterest-how-we-scaled-our-mysql-fleet-3f341e96ca6f"
      }
    ]
  },
  "hot-partitions": {
    "title": "Hot partitions",
    "video": {
      "youtubeId": "be6PLMKKSto",
      "title": "The Basics of Database Sharding and Partitioning in System Design",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Anatomy of a Hotspot: When Hashing Fails</h2>\n      <p>Hash-based sharding guarantees uniform key distribution across shards—<strong>assuming keys are accessed uniformly</strong>. In real-world systems, access distributions follow Zipf's Law or Pareto distributions ($80/20$ rule). When a single entity (such as a celebrity with 100 million followers, a Black Friday flash sale item, or a major breaking news thread) receives millions of concurrent reads and writes, the single shard hosting that partition key collapses under CPU saturation, lock contention, or connection pool exhaustion, causing cascading cluster latency spikes.</p>\n\n      <h2>Architectural Mitigation: Compound Key Salting & Scatter-Gather</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Incoming Writes to Hot Entity: 'product_1001'\"] --> Salt[\"Key Salting Middleware: Append Random Salt 0..9\"]\n    Salt --> W1[\"Write to 'product_1001_salt0' on Shard 1\"]\n    Salt --> W2[\"Write to 'product_1001_salt4' on Shard 5\"]\n    Salt --> W3[\"Write to 'product_1001_salt9' on Shard 9\"]\n\n    subgraph ReadPath [\"Read Aggregation Path\"]\n      Reader[\"Read Aggregation: 'product_1001'\"] --> QueryAll[\"Scatter-Gather Query Across All 10 Salt Sub-Keys\"]\n      QueryAll --> Merge[\"In-Memory Sum / Merge Reducer\"]\n      Merge --> ReturnVal[\"Accurate Inventory Count\"]\n    end\n      </div>\n\n      <h2>Production Mitigation Patterns</h2>\n      <h3>1. Write Salting (Compound Partition Keys)</h3>\n      <p>To distribute write throughput for a hot counter (e.g., likes on a viral video), append a random salt suffix to the partition key: <code>partition_key = video_id + \"_\" + random(0, K-1)</code> where $K$ is the number of sub-partitions. Writes spread evenly across $K$ physical shards. When reading the total count, the application queries all $K$ sub-keys in parallel and sums them.</p>\n\n      <h3>2. Two-Tier In-Memory Caching (L1 Local + L2 Distributed)</h3>\n      <p>For read hotspots (e.g., Taylor Swift's profile or high-volume API configuration), routing all requests to Redis can overwhelm the single Redis node hosting that key. High-performance systems deploy an <strong>in-process L1 cache</strong> (e.g., Guava/Caffeine in JVM or sync.Map in Go) with a short TTL (1-5 seconds) directly inside the API instances. $99%$ of reads resolve locally in CPU cache, never touching the network or database.</p>\n\n      <h3>3. Read Replica Fan-out & Read Quorums</h3>\n      <p>In masterless distributed systems (Cassandra / DynamoDB), hot read keys can be served by increasing the replication factor ($N=5$) and allowing reads to hit any replica with read consistency level <code>ONE</code>.</p>\n    </div>",
    "keyTakeaways": [
      "Hot partitions occur when entity popularity violates uniform distribution assumptions, saturating a single physical shard.",
      "Write hotspots are mitigated by key salting (appending random suffixes) and scatter-gather read aggregation.",
      "Read hotspots are eliminated by local in-process L1 caching (1-5 second TTL) on the application tier."
    ],
    "furtherReading": [
      {
        "title": "AWS DynamoDB Best Practices for Handling Hot Partitions",
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html"
      },
      {
        "title": "Discord: How Discord Scaled to Millions of Users with ScyllaDB",
        "url": "https://discord.com/blog/how-discord-stores-billions-of-messages"
      }
    ]
  },
  "consistent-hashing": {
    "title": "Consistent hashing",
    "video": {
      "youtubeId": "zaRkONvyGr8",
      "title": "What is CONSISTENT HASHING and Where is it used?",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A cache fleet adds a node without wanting modulo hashing to remap most keys.</p><h2>Mechanics</h2><p>Place keys and weighted virtual nodes on a ring and route each key to its successor. Under uniform assumptions, adding one similarly weighted node moves an expected fraction near 1/(N+1), rather than the large fraction changed by modulo hashing.</p><h2>Failure mode</h2><p>A hot key remains hot, stale membership views route clients differently, and moved keys cause misses until warmed or replicated. Virtual nodes reduce expected skew but do not guarantee a fixed balance.</p><h2>Trade-off</h2><p>Consistent hashing limits topology-change movement and supports weighting, but requires membership distribution, replication, skew monitoring, and careful failure handling.</p></div>",
    "keyTakeaways": [
      "Consistent hashing limits expected remapping under topology changes.",
      "Virtual nodes reduce expected skew but do not guarantee balance.",
      "Hot keys, membership drift, and warming still need explicit handling."
    ],
    "furtherReading": [
      {
        "title": "Karger et al.: Consistent Hashing and Random Trees (1997)",
        "url": "https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf"
      },
      {
        "title": "AWS Dynamo Paper: Consistent Hashing Implementation",
        "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"
      }
    ]
  },
  "distributed-id-generation": {
    "title": "Distributed ID generation",
    "video": {
      "youtubeId": "2O1wur4m8DE",
      "title": "Snowflake ID Generation by Twitter",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Distributed Identifier Challenge</h2>\n      <p>In a single-instance relational database, generating unique primary keys is trivial via auto-incrementing sequences (e.g., PostgreSQL <code>BIGSERIAL</code> or MySQL <code>AUTO_INCREMENT</code>). However, in horizontally partitioned distributed architectures, generating unique IDs across dozens of database shards introduces severe architectural bottlenecks:</p>\n      <ul>\n        <li><strong>Single Point of Failure (SPOF):</strong> A centralized database generating auto-increments creates a throughput ceiling and a single point of failure.</li>\n        <li><strong>Information Leakage:</strong> Monotonically incrementing sequential IDs (1, 2, 3...) expose sensitive business intelligence (competitors can monitor order ID changes to calculate daily revenue).</li>\n        <li><strong>Cross-Shard Uniqueness:</strong> When independent database shards insert records concurrently without central coordination, duplicate IDs will corrupt data.</li>\n      </ul>\n\n      <h2>Core Approaches to Distributed ID Generation</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Req[\"ID Generation Request\"] --> Approach{\"Architecture Choice\"}\n    Approach -->|\"Random 128-Bit\"| UUID[\"UUID v4: No Coordination, High Index Fragmentation\"]\n    Approach -->|\"Central Ticket Service\"| Ticket[\"Flickr Ticket Servers: Central DB with Range Leases\"]\n    Approach -->|\"Coordinated Timed 64-Bit\"| Snowflake[\"Twitter Snowflake / ULID: 64-Bit Time-Ordered\"]\n    \n    Snowflake --> BitLayout[\"Bitwise Layout: 41-bit Time + 10-bit Node + 12-bit Sequence\"]\n      </div>\n\n      <h2>Detailed Trade-offs of Generation Patterns</h2>\n      <h3>1. Multi-Master Increment with Offsets (MySQL Pattern)</h3>\n      <p>If you have $k$ database instances, instance 1 generates $1, 1+k, 1+2k$, instance 2 generates $2, 2+k, 2+2k$, etc. While simple, this does not scale dynamically when adding servers, nor does it guarantee time-ordering.</p>\n\n      <h3>2. UUIDv4 (Universally Unique Identifier)</h3>\n      <p>Generates 128-bit pseudo-random values. Generation requires zero network coordination ($O(1)$ locally). However, UUIDv4 values are completely random, causing severe <strong>B-Tree Index Page Splitting</strong> and high storage overhead (16 bytes vs 8 bytes for <code>BIGINT</code>).</p>\n\n      <h3>3. Time-Sorted 64-Bit IDs (Twitter Snowflake)</h3>\n      <p>Encodes millisecond timestamps, physical node identifiers, and in-millisecond sequence numbers into a single 64-bit integer. It fits directly into standard <code>BIGINT</code> fields, requires zero network coordination during generation, and sorts naturally in B-Tree indexes.</p>\n    </div>",
    "keyTakeaways": [
      "Auto-incrementing database sequences create bottlenecks and leak business metrics.",
      "UUIDv4 allows decentralized generation but ruins B-tree index locality due to random page splitting.",
      "Snowflake-style 64-bit time-sorted IDs provide optimal performance, B-tree locality, and 4M+ IDs/sec per node."
    ],
    "furtherReading": [
      {
        "title": "Twitter Engineering: Announcing Snowflake",
        "url": "https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake"
      },
      {
        "title": "Flickr Ticket Servers: Distributed Primary Keys",
        "url": "https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/"
      }
    ]
  },
  "uuid-objectid-and-snowflake": {
    "title": "UUID, ObjectId, and Snowflake",
    "video": {
      "youtubeId": "2O1wur4m8DE",
      "title": "Snowflake ID Generation by Twitter",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Byte-Level Anatomical Breakdown of Distributed IDs</h2>\n      <p>Comparing distributed identifier standards requires examining their exact binary memory footprints and bitwise layout:</p>\n\n      <h3>1. UUID Family (RFC 4122 & RFC 9562) — 128 Bits (16 Bytes)</h3>\n      <ul>\n        <li><strong>UUIDv4:</strong> 122 bits of cryptographically strong pseudo-randomness, 4 bits of version (<code>0100</code>), and 2 bits of variant (<code>10</code>). Total combinations: $2^{122} \\approx 5.3 \\times 10^{36}$. Collision probability is negligible, but randomness creates chaotic memory layouts.</li>\n        <li><strong>UUIDv7 (Modern Standard):</strong> Solves UUIDv4's B-Tree problem by encoding a 48-bit Unix millisecond timestamp at the highest-order bits, followed by version and 74 random bits. Highly index-friendly while maintaining 128-bit global uniqueness.</li>\n      </ul>\n\n      <h3>2. MongoDB ObjectId — 96 Bits (12 Bytes)</h3>\n      <p>Consists of 12 bytes formatted as 24 hexadecimal characters:</p>\n      <ul>\n        <li><strong>4 Bytes:</strong> Unix timestamp in seconds.</li>\n        <li><strong>5 Bytes:</strong> Process unique value (generated once per machine/process).</li>\n        <li><strong>3 Bytes:</strong> Monotonically incrementing counter initialized to a random value.</li>\n      </ul>\n\n      <h3>3. Twitter Snowflake — 64 Bits (8 Bytes)</h3>\n      <div class=\"mermaid\">\nflowchart LR\n    S1[\"1 Bit: Sign (Always 0)\"] --- S2[\"41 Bits: Millisecond Timestamp (69 Years)\"]\n    S2 --- S3[\"10 Bits: Machine / Datacenter ID (1,024 Nodes)\"]\n    S3 --- S4[\"12 Bits: Sequence Counter (4,096 IDs/ms)\"]\n      </div>\n\n      <h2>Bitwise Memory & Index Performance Comparison</h2>\n      <table>\n        <thead>\n          <tr><th>Identifier</th><th>Size (Bytes)</th><th>B-Tree Locality</th><th>Time Sortable?</th><th>Throughput per Node</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>UUIDv4</strong></td><td>16 bytes (128 bits)</td><td>Catastrophic (random writes)</td><td>No</td><td>Practically unlimited (local PRNG)</td></tr>\n          <tr><td><strong>UUIDv7</strong></td><td>16 bytes (128 bits)</td><td>Excellent (append-only)</td><td>Yes (millisecond)</td><td>Practically unlimited</td></tr>\n          <tr><td><strong>ObjectId</strong></td><td>12 bytes (96 bits)</td><td>Good</td><td>Yes (second)</td><td>16.7M IDs / sec</td></tr>\n          <tr><td><strong>Snowflake</strong></td><td>8 bytes (64 bits)</td><td>Optimal (fits in <code>BIGINT</code>)</td><td>Yes (millisecond)</td><td>4,096,000 IDs / sec</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "UUIDv4 wastes storage (16 bytes) and causes random B-tree page splits; UUIDv7 solves this with a 48-bit timestamp prefix.",
      "MongoDB ObjectId packs 12 bytes: 4s timestamp + 5-byte process unique + 3-byte counter.",
      "Snowflake IDs fit into standard 64-bit integers, providing natural chronological sorting and high memory compactness."
    ],
    "furtherReading": [
      {
        "title": "IETF RFC 9562: New UUID Formats (UUIDv6, UUIDv7, UUIDv8)",
        "url": "https://datatracker.ietf.org/doc/rfc9562/"
      },
      {
        "title": "MongoDB ObjectId Specification",
        "url": "https://www.mongodb.com/docs/manual/reference/method/ObjectId/"
      }
    ]
  },
  "snowflake-id-design": {
    "title": "Snowflake ID design",
    "video": {
      "youtubeId": "2O1wur4m8DE",
      "title": "Snowflake ID Generation by Twitter",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>Several workers generate sortable IDs concurrently, then one virtual machine resumes with an older clock and a reused worker ID.</p><h2>Mechanics</h2><p>Pack a custom-epoch timestamp, unique worker ID, and per-tick sequence into an integer. Concurrent callers need an atomic counter, lock, or single-threaded owner; worker IDs need leases or durable assignment. On rollback, wait with a bound, change an epoch/worker component, or fail safely according to the contract.</p><h2>Failure mode</h2><p>Clock rollback plus worker-ID reuse can duplicate IDs. Sequence exhaustion blocks until a later tick, and restarting without preserving assignment can overlap another generator.</p><h2>Trade-off</h2><p>Snowflake-style IDs are compact and roughly time ordered, but depend on clock and worker management. UUIDv4 avoids those dependencies; UUIDv7 offers time locality with a larger representation.</p></div>",
    "keyTakeaways": [
      "Snowflake IDs require unique worker assignment and synchronized sequence generation.",
      "Clock rollback and worker reuse can cause collisions.",
      "Compact ordering comes with clock and lifecycle dependencies."
    ],
    "furtherReading": [
      {
        "title": "Twitter Snowflake Open Source Repository",
        "url": "https://github.com/twitter-archive/snowflake"
      },
      {
        "title": "BWMarrin: Snowflake ID Implementation in Go",
        "url": "https://github.com/bwmarrin/snowflake"
      }
    ]
  },
  "clock-skew-and-id-ordering": {
    "title": "Clock skew and ID ordering",
    "video": {
      "youtubeId": "2O1wur4m8DE",
      "title": "Snowflake ID Generation by Twitter",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Why Physical Clocks Lie in Distributed Systems</h2>\n      <p>Modern computers track physical time using quartz crystal oscillators. Due to temperature fluctuations and voltage noise, quartz crystals drift—typically by $1 - 10\\text{ milliseconds}$ per day. Distributed clusters synchronize physical time using <strong>NTP (Network Time Protocol)</strong>. However, because network packets experience asymmetric network delay, NTP synchronization itself has an inherent uncertainty bound of $5\\text{ms} - 250\\text{ms}$.</p>\n      \n      <p>Consequently, <strong>physical wall clocks cannot guarantee causality in distributed systems</strong>. If Node A writes record $X$ at physical time $t_1$, and sends a message to Node B who writes record $Y$ at physical time $t_2$, clock skew can cause $t_2 < t_1$. Relying on physical timestamps for Last-Write-Wins (LWW) silently corrupts data.</p>\n\n      <h2>Google Spanner's TrueTime API: Bounding Uncertainty</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    GPS[\"GPS Master Receivers in Datacenter\"] --> TT[\"TrueTime API: tt.now()\"]\n    Atomic[\"Atomic Rubidium Clocks (Zero Failure Drift)\"] --> TT\n    TT --> Window[\"Time Window: [earliest, latest\"] with Uncertainty ε = ~7ms\"]\n    Window --> CommitWait[\"Commit Wait: Hold Transaction until latest < commit_timestamp\"]\n    CommitWait --> GuaranteedOrder[\"Strict Serializability Across Continents Guaranteed\"]\n      </div>\n\n      <h2>Under the Hood: Lamport Timestamps & Vector Clocks</h2>\n      <h3>1. Lamport Timestamps (Causal Ordering)</h3>\n      <p>Each process maintains a single integer counter $L$. When an event occurs locally, $L = L + 1$. When sending a message, the process attaches $L$. When a process receives a message with timestamp $L_{msg}$, it sets its local counter: $L = \\max(L, L_{msg}) + 1$. If event $A$ caused event $B$, then $L(A) < L(B)$. However, identical Lamport timestamps do not tell us whether events were concurrent.</p>\n\n      <h3>2. Vector Clocks (Detecting Concurrency & Conflicts)</h3>\n      <p>In a cluster of $N$ nodes, every node maintains a vector of $N$ integers: $V = [v_1, v_2, \\dots, v_N]$. When node $i$ mutates state, it increments $V[i]$. When comparing two versions $V_A$ and $V_B$:</p>\n      <ul>\n        <li>If every element of $V_A \\le V_B$ and at least one is $<$, then $V_A$ causally preceded $V_B$.</li>\n        <li>If $V_A$ has components greater than $V_B$ and vice versa, the updates are <strong>concurrent conflicts</strong> that must be resolved via application merging (Dynamo sibling reconciliation).</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Physical wall clocks experience drift and NTP network latency, making physical timestamps unsafe for distributed causality.",
      "Google Spanner uses GPS and atomic clocks to bound uncertainty ($epsilon \\approx 7\\text{ms}$) and enforces commit waits.",
      "Vector clocks track causality across distributed nodes, exposing concurrent write conflicts for explicit reconciliation."
    ],
    "furtherReading": [
      {
        "title": "Leslie Lamport: Time, Clocks, and the Ordering of Events in a Distributed System (1978)",
        "url": "https://lamport.azurewebsites.net/pubs/time-clocks.pdf"
      },
      {
        "title": "Google Spanner: TrueTime and External Consistency",
        "url": "https://research.google/pubs/spanner-googles-globally-distributed-database/"
      }
    ]
  },
  "keyset-pagination": {
    "title": "Keyset pagination",
    "video": {
      "youtubeId": "mD_znL0C7JE",
      "title": "NoSQL vs SQL: What's better?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>An orders API must browse deep pages while new orders arrive.</p><h2>Mechanics</h2><p>Use a unique deterministic order such as (created_at,id) and encode the last tuple in an opaque cursor. The index seek costs roughly O(log N) plus the page scan; work is largely independent of page depth, not literally constant.</p><h2>Failure mode</h2><p>Updating a sort key or deleting unseen rows changes later results, and a cursor without all tie-breakers can skip or duplicate records. Arbitrary page-number jumps are not directly available.</p><h2>Trade-off</h2><p>Keyset pagination gives stable deep-page performance and handles inserts ahead of the cursor well. Offset pagination is simpler for small data and random page jumps but scans and discards deeper prefixes.</p></div>",
    "keyTakeaways": [
      "Keyset seeks cost roughly O(log N) plus page scanning.",
      "A complete unique sort key prevents tie-related skips.",
      "Updates and deletions can still change subsequent pages."
    ],
    "furtherReading": [
      {
        "title": "Markus Winand: Use The Index, Luke! (No Offset)",
        "url": "https://use-the-index-luke.com/sql/partial-results/fetch-next-page"
      },
      {
        "title": "Slack Engineering: Evolving API Pagination at Slack",
        "url": "https://slack.engineering/evolving-api-pagination-at-slack/"
      }
    ]
  },
  "bloom-filters": {
    "title": "Bloom filters",
    "video": {
      "youtubeId": "a6TCF1BUovU",
      "title": "What is a Bloom Filter? | System Design",
      "channel": "Anand Pandey"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>An LSM engine wants to avoid disk reads for keys absent from each immutable table.</p><h2>Mechanics</h2><p>A Bloom filter sets k hash-selected bits in an m-bit array. If any queried bit is unset, a correctly constructed and current append-only filter proves the key was not inserted; if all are set, the answer may be a false positive. Size m and k from expected items and target false-positive rate.</p><h2>Failure mode</h2><p>Deleting bits from a standard filter can create false negatives. An undersized or stale filter raises error rates, so mutable sets need rebuilds, counting filters, or another design.</p><h2>Trade-off</h2><p>Bloom filters save memory and negative lookup I/O but cannot return values or prove presence. Lower false-positive rates consume more memory and hash work.</p></div>",
    "keyTakeaways": [
      "A current append-only Bloom filter can prove absence but only probable presence.",
      "Deletion requires rebuilding, counting filters, or another design.",
      "False-positive rate trades memory and hash work against avoided I/O."
    ],
    "furtherReading": [
      {
        "title": "Burton Bloom: Space/Time Trade-offs in Hash Coding with Allowable Errors (1970)",
        "url": "https://dl.acm.org/doi/10.1145/362686.362692"
      },
      {
        "title": "RocksDB Wiki: Bloom Filter Implementation",
        "url": "https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter"
      }
    ]
  },
  "hot-cold-storage-archival": {
    "title": "Hot and cold storage, archival",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Economics and Hardware of Data Lifecycles</h2>\n      <p>In large-scale platforms, data exhibits extreme temporal access decay: $90\\%$ of all read queries target data written in the last 7 days. Keeping multi-year historical logs or audit records on high-performance NVMe SSDs in primary transactional clusters costs hundreds of thousands of dollars per month in idle compute and storage provisioned IOPS.</p>\n\n      <h2>Multi-Tier Storage Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    App[\"Application Tier\"] --> Tier1[\"Hot Tier: NVMe SSDs (PostgreSQL / Redis / Cassandra)\"]\n    \n    Tier1 -.->|\"Batch ETL / Parquet Compaction (After 30 Days)\"| Tier2[\"Warm Tier: AWS S3 Standard / GCS\"]\n    Tier2 -.->|\"Lifecycle Policy (After 90 Days)\"| Tier3[\"Cold Tier: S3 Glacier Flexible Retrieval\"]\n    Tier3 -.->|\"Archive Policy (After 365 Days)\"| Tier4[\"Deep Archive: S3 Glacier Deep Archive ($0.00099/GB/mo)\"]\n\n    subgraph QueryEngines [\"Analytical Query Engines\"]\n      Tier2 --> Athena[\"Serverless Queries: AWS Athena / DuckDB\"]\n      Tier1 --> Primary[\"Transactional Queries (< 5ms)\"]\n    end\n      </div>\n\n      <h2>Hardware, Latency, and Cost Breakdown</h2>\n      <table>\n        <thead>\n          <tr><th>Storage Tier</th><th>Underlying Hardware</th><th>P99 Access Latency</th><th>Cost per TB / Month</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Hot (Transactional)</strong></td><td>Local NVMe SSD / Provisioned IOPS EBS (io2)</td><td>Sub-millisecond to 5ms</td><td>$100.00 - $180.00</td></tr>\n          <tr><td><strong>Warm (Infrequent)</strong></td><td>Multi-tenant Cloud Object Store (S3 Standard / Infrequent)</td><td>50ms - 150ms</td><td>$12.50 - $23.00</td></tr>\n          <tr><td><strong>Cold (Glacier)</strong></td><td>Automated Magnetic Tape Libraries (LTO)</td><td>3 - 5 hours retrieval</td><td>$3.60</td></tr>\n          <tr><td><strong>Deep Archive</strong></td><td>High-density offline magnetic tape archives</td><td>12 - 48 hours retrieval</td><td>$0.99 (99% cost reduction)</td></tr>\n        </tbody>\n      </table>\n\n      <h2>Tombstones and Lifecycle Compaction</h2>\n      <p>When archiving data from distributed databases like Cassandra, soft-deleted rows leave <strong>tombstone markers</strong>. If cold archival jobs blindly export tables without compacting tombstones, query engines reading the archived Parquet files encounter performance degradation. Modern pipelines run compaction jobs before compressing data into columnar Parquet/ORC chunks for cold storage.</p>\n    </div>",
    "keyTakeaways": [
      "90%+ of queries target data under 7 days old; tiered storage migrates aged data to reduce storage bills by up to 99%.",
      "Hot tiers use local NVMe SSDs; cold tiers leverage automated magnetic tape libraries (AWS Glacier).",
      "Compaction to columnar Parquet formats before object storage migration enables serverless querying via Athena and DuckDB."
    ],
    "furtherReading": [
      {
        "title": "AWS S3 Storage Classes and Lifecycle Rules",
        "url": "https://aws.amazon.com/s3/storage-classes/"
      },
      {
        "title": "Uber Engineering: Integrated Data Archival Pipeline",
        "url": "https://www.uber.com/blog/uber-data-archival-platform/"
      }
    ]
  }
};
