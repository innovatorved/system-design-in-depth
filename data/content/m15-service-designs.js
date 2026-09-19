window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["design-services"] = {
  "url-shortener-system-design": {
    "title": "Design: a URL shortener, one machine",
    "video": {
      "youtubeId": "vKAZ16P4kdg",
      "title": "System Design - Part 13 | Design a URL Shortener | 2 Methods",
      "channel": "Nikhil Lohia"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Problem & API Contract</h2>\n      <p>A URL shortening service (like TinyURL or Bitly) converts a long URL into an alias of around 7 characters. When accessed, the short URL issues an HTTP 301 (Permanent) or HTTP 302 (Found) redirect to the original destination URL.</p>\n\n      <h2>URL Encoding Strategies</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    LongURL[\"Original Long URL\"] --> Method{\"Encoding Strategy\"}\n    Method --> Hash[\"MD5 / SHA256 Hash + Truncate\"]\n    Method --> Counter[\"Monotonic Auto-Increment Counter + Base62\"]\n    Hash --> Collision[\"Collision Handling: Probe / Salt\"]\n    Counter --> Safe[\"Zero Collision Guarantee\"]\n      </div>\n\n      <h2>Base62 vs. MD5 Hash Truncation</h2>\n      <ul>\n        <li><strong>MD5 / SHA256 with Truncation:</strong> Hashing the URL yields a 128-bit hex string. Taking the first 7 characters introduces hash collision risks (the Birthday Paradox). Handling collisions requires checking the database on every insert and appending a salt if a collision occurs.</li>\n        <li><strong>Monotonic Counter with Base62 (Recommended):</strong> Using characters <code>[0-9, a-z, A-Z]</code> (62 distinct characters), a 7-character string supports $62^7 approx 3.52 \text{ trillion}$ unique URLs. An incremental 64-bit integer ID converted to Base62 guarantees zero collisions without database lookups:\n          <pre><code>function toBase62(num) {\n  const chars = \"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\";\n  let str = \"\";\n  while (num > 0n) {\n    str = chars[Number(num % 62n)] + str;\n    num = num / 62n;\n  }\n  return str || \"0\";\n}</code></pre>\n        </li>\n      </ul>\n\n      <h2>HTTP 301 vs. HTTP 302 Redirects</h2>\n      <p><strong>301</strong> communicates a permanent redirect and is commonly cached; <strong>302</strong> communicates a temporary redirect but may also be cached when response headers permit it. Neither status alone guarantees whether every later navigation reaches the origin. Set explicit <code>Cache-Control</code> policy for the product's mutability and analytics needs, and distinguish origin request logs from CDN or edge logs.</p>\n    </div>",
    "keyTakeaways": [
      "Base62 encoding across 7 characters yields 3.52 trillion unique combinations.",
      "A monotonic counter converted to Base62 completely eliminates collision resolution logic.",
      "Choose redirect status and explicit cache headers together; a 302 does not guarantee that every future click reaches the origin.",
      "Always index the short code column with a unique index for sub-millisecond B-Tree point lookups."
    ],
    "furtherReading": [
      {
        "title": "Base62 Encoding and Short URLs",
        "url": "https://en.wikipedia.org/wiki/Base62"
      },
      {
        "title": "MDN: HTTP 301 vs 302 Redirection",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections"
      }
    ]
  },
  "rate-limiting-and-abuse-prevention-case-study": {
    "title": "Design: rate limiting and abuse prevention",
    "video": {
      "youtubeId": "YXkOdWBwqaA",
      "title": "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Why Rate Limiting is Critical</h2>\n      <p>Rate limiting protects downstream APIs from denial-of-service (DoS) attacks, brute-force credential stuffing, abusive web scrapers, and cascading microservice failures. When limits are reached, the system responds with <strong>HTTP 429 Too Many Requests</strong> and a <code>Retry-After</code> header.</p>\n\n      <h2>Comparison of Core Algorithms</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Req[\"Incoming API Request\"] --> Alg{\"Algorithm\"}\n    Alg --> TB[\"Token Bucket: Refill rate + Bucket capacity\"]\n    Alg --> LB[\"Leaking Bucket: Constant-rate FIFO queue\"]\n    Alg --> FW[\"Fixed Window: Reset counter every minute\"]\n    Alg --> SW[\"Sliding Window Log: Precise timestamps\"]\n    Alg --> SWC[\"Sliding Window Counter: Memory-efficient interpolation\"]\n      </div>\n\n      <ul>\n        <li><strong>Token Bucket:</strong> Tokens refill at a constant rate $r$ up to capacity $b$. Allows bursts up to capacity while enforcing average rate. Used by Amazon AWS and Stripe.</li>\n        <li><strong>Fixed Window Counter:</strong> Counters reset at fixed intervals (e.g., top of every minute). Vulnerable to 2x burst traffic across window boundaries (e.g., 100 requests at 00:59 and 100 requests at 01:00).</li>\n        <li><strong>Sliding Window Counter (Industry Standard):</strong> Blends the previous window counter with the current window counter based on timestamp overlap, providing smooth rate limiting with minimal memory footprint ($O(1)$ memory per user).</li>\n      </ul>\n\n      <h2>Distributed Rate Limiting with Redis & Lua</h2>\n      <p>In distributed setups with multiple API gateway instances, local in-memory counters fail because traffic is spread across servers. Redis provides shared state. To prevent race conditions between <code>GET</code> and <code>INCR</code>, atomic Lua scripts are executed directly on the Redis node.</p>\n    </div>",
    "keyTakeaways": [
      "Token Bucket and Sliding Window Counter are the primary algorithms for modern APIs.",
      "Fixed window counters suffer from boundary double-burst vulnerabilities.",
      "Use atomic Redis Lua scripts to avoid race conditions across multi-instance API gateways.",
      "Always return standard rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After."
    ],
    "furtherReading": [
      {
        "title": "Stripe: Scaling your API with rate limiters",
        "url": "https://stripe.com/blog/rate-limiters"
      },
      {
        "title": "Redis: Rate limiting pattern with Lua",
        "url": "https://redis.io/commands/eval/"
      }
    ]
  },
  "url-shortener-at-scale": {
    "title": "Design: a URL shortener at scale",
    "video": {
      "youtubeId": "vKAZ16P4kdg",
      "title": "System Design - Part 13 | Design a URL Shortener | 2 Methods",
      "channel": "Nikhil Lohia"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>High-Scale Architecture: 100M Daily Writes, 1B Daily Reads</h2>\n      <p>Scaling a URL shortener to internet scale requires addressing three distinct bottlenecks: distributed ID generation without coordination, caching hot links to avoid database overload, and partitioning URL records horizontally.</p>\n\n      <h2>Scale Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Global Clients\"] --> CDN[\"Cloudflare CDN Edge Cache\"]\n    CDN -->|Cache Miss| LB[\"Global Anycast Load Balancer\"]\n    LB --> App[\"App Web Tier\"]\n    App --> RedisCluster[(\"Redis Distributed Cache: LRU 80/20 Rule\")]\n    RedisCluster -->|Cache Miss| DBShards[(\"Sharded Database Tier\")]\n    App --> KGS[\"Key Generation Service / Snowflake\"]\n    App --> AnalyticsQueue[\"Kafka Click Event Stream\"]\n    AnalyticsQueue --> AnalyticsWorker[\"ClickHouse Aggregators\"]\n      </div>\n\n      <h2>Distributed ID Generation: Range-Based & Snowflake</h2>\n      <ul>\n        <li><strong>Range Allocation:</strong> A coordination service (e.g., Apache ZooKeeper) allocates distinct numeric ranges (e.g., Node 1 gets IDs 1–1,000,000; Node 2 gets 1,000,001–2,000,000). Nodes generate IDs entirely in local memory with zero inter-server network calls.</li>\n        <li><strong>Twitter Snowflake:</strong> Generates 64-bit IDs containing timestamp (41 bits), datacenter ID (5 bits), worker ID (5 bits), and local sequence number (12 bits).</li>\n      </ul>\n\n      <h2>Database Sharding by Short Code Hash</h2>\n      <p>With billions of mappings, storage must be sharded. Partitioning by <code>hash(short_key) % N_shards</code> distributes read and write traffic evenly across all database nodes, preventing hot partitions.</p>\n\n      <h2>Caching & The 80/20 Pareto Principle</h2>\n      <p>Read traffic heavily follows the Pareto distribution: 20% of short links drive 80% of click traffic. Caching top links in Redis with an LRU (Least Recently Used) eviction policy allows 80%+ of reads to be served in under 2 milliseconds from memory.</p>\n    </div>",
    "keyTakeaways": [
      "Distribute ID generation using pre-allocated numeric ranges or 64-bit Snowflake algorithms to avoid synchronization bottlenecks.",
      "Partition databases using consistent hashing on the short URL key.",
      "Apply the 80/20 Pareto principle with Redis LRU caching to absorb the vast majority of read traffic.",
      "Stream click tracking data asynchronously through Kafka into columnar storage (ClickHouse) for real-time analytics."
    ],
    "furtherReading": [
      {
        "title": "Twitter Snowflake ID Generator Paper",
        "url": "https://github.com/twitter-archive/snowflake"
      },
      {
        "title": "Facebook Tao: Distributed Data Store for Social Graph",
        "url": "https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson"
      }
    ]
  },
  "ecommerce-product-listing-system-design": {
    "title": "Design: a product listing",
    "video": {
      "youtubeId": "PuZvF2EyfBM",
      "title": "Elasticsearch Deep Dive w/ a Ex-Meta Senior Manager for System Design Interviews",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Requirements: Complex Faceting & Extreme Read/Write Asymmetry</h2>\n      <p>An e-commerce product catalog (like Amazon or Shopify) must support sub-100ms multi-attribute filtering (brand, size, color, price range, customer rating), full-text search across titles and descriptions, and instant inventory availability updates.</p>\n\n      <h2>CQRS (Command Query Responsibility Segregation) Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Merchant[\"Merchant Admin / ERP\"] -->|Write: Update Product| WriteService[\"Catalog Management Service\"]\n    WriteService --> PrimaryDB[(\"PostgreSQL / DynamoDB Primary\")]\n    PrimaryDB --> CDC[\"Debezium Change Data Capture\"]\n    CDC --> Kafka[\"Kafka Events\"]\n    Kafka --> IndexWorker[\"Search Index Sync Worker\"]\n    IndexWorker --> SearchIndex[(\"Elasticsearch / OpenSearch Facet Engine\")]\n    Buyer[\"Buyer Search & Browse\"] --> ReadService[\"Product Browse Service\"]\n    ReadService --> SearchIndex\n    ReadService --> Cache[(\"Redis Aggregations Cache\")]\n      </div>\n\n      <h2>When a Dedicated Search Index Helps Faceting</h2>\n      <p>Relational systems can support faceting with normalized attributes, arrays or JSON indexes, generated columns, and engine-specific bitmap or spatial structures. At large catalog scale, combining full-text relevance with many dynamic filters and facet counts may be easier to scale in a dedicated search index. Choose from measured query shapes, update freshness, operational cost, and consistency needs rather than assuming SQL must full-scan or fail.</p>\n\n      <h2>Elasticsearch & Doc Values for Faceting</h2>\n      <p>Search engines like Elasticsearch or OpenSearch index documents in inverted indexes for full-text search and simultaneously build <strong>Doc Values</strong> (columnar disk structures). Columnar storage enables instant aggregation and counting of facet filters across millions of matching products.</p>\n\n      <h2>Change Data Capture (CDC) Sync</h2>\n      <p>To avoid dual-write inconsistencies between the transactional database and the search index, production architectures deploy Change Data Capture (via Debezium reading Postgres WAL or DynamoDB Streams) to stream mutations reliably into Kafka.</p>\n    </div>",
    "keyTakeaways": [
      "Use CQRS: separate transactional product management writes from read-heavy faceted browsing.",
      "Relational databases can serve faceting with suitable models and indexes; use Elasticsearch or OpenSearch when measured full-text and distributed aggregation needs justify a separate read model.",
      "Employ Change Data Capture (CDC) via Kafka to keep the search index in sync with transactional databases without dual-write bugs.",
      "Decouple volatile inventory quantities from static product details using lightweight real-time stock services."
    ],
    "furtherReading": [
      {
        "title": "Elasticsearch: Aggregations & Faceted Navigation",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html"
      },
      {
        "title": "Debezium: Change Data Capture Architecture",
        "url": "https://debezium.io/documentation/reference/stable/architecture.html"
      }
    ]
  },
  "collaborative-editing-system-design": {
    "title": "Design: a collaborative editor",
    "video": {
      "youtubeId": "zYPWtksjabk",
      "title": "System Design - Part 25 | Web Sockets | Client Server Communication",
      "channel": "Nikhil Lohia"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Concurrency Challenge in Real-Time Documents</h2>\n      <p>When multiple users edit the same document concurrently (like Google Docs, Notion, or Figma), edits arrive out of order due to network latency. Without structured conflict resolution, character offsets shift and documents diverge into corrupted states.</p>\n\n      <h2>The Two Core Paradigms: OT vs. CRDT</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Approach{\"Concurrency Resolution\"}\n    Approach --> OT[\"Operational Transformation: OT\"]\n    Approach --> CRDT[\"Conflict-free Replicated Data Types: CRDT\"]\n    OT --> CentralServer[\"Often uses an authoritative server: Google Docs\"]\n    CRDT --> P2P[\"Peer-to-Peer & Decentralized Capable: Figma, Yjs, Automerge\"]\n      </div>\n\n      <h2>Operational Transformation (OT)</h2>\n      <p>OT transforms edit operations (Insert, Delete, Retain) against concurrent operations based on character indices:</p>\n      <ul>\n        <li>If User A inserts character 'x' at position 2, and User B concurrently inserts 'y' at position 0, User A's operation must be transformed to position 3 to account for User B's insertion.</li>\n        <li><strong>Tradeoff:</strong> Many production OT systems use an authoritative server to order operations and simplify recovery, but decentralized OT algorithms also exist. Correct transformation, history, acknowledgements, and reconnect behavior remain complex.</li>\n      </ul>\n\n      <h2>CRDTs (Conflict-free Replicated Data Types)</h2>\n      <p>Modern collaborative systems increasingly adopt CRDTs (e.g., RGA, Yjs, Automerge):</p>\n      <ul>\n        <li>Sequence CRDTs use stable element identities or another mergeable ordering representation; not every CRDT uses fractional positions or stores one identifier per visible character.</li>\n        <li>Under the algorithm's delivery and causality assumptions, replicas can apply concurrent operations in different orders and converge without a central serialization point. Transport, persistence, access control, and garbage collection still need coordination.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Character offset coordinates are fragile under concurrent editing; they require transformation or fractional identifiers.",
      "Many OT deployments use a centralized coordinator, but centralization is an architectural choice rather than a mathematical requirement of all OT algorithms.",
      "CRDTs assign immutable IDs to every token and converge deterministically in peer-to-peer or server topologies.",
      "Use WebSockets for real-time operation transport and snapshot document states periodically to compact mutation logs."
    ],
    "furtherReading": [
      {
        "title": "Real-time editing with Yjs & CRDTs",
        "url": "https://yjs.dev/"
      },
      {
        "title": "Figma: How Figma's multiplayer technology works",
        "url": "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/"
      }
    ]
  },
  "object-store-system-design": {
    "title": "Design: an object store (S3)",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Object Storage vs. Block & File Systems</h2>\n      <p>Object storage (like Amazon S3, Google Cloud Storage, or MinIO) is designed for large binary objects such as images, videos, and backups. It generally does not support in-place byte mutation, but many services do allow a key to be replaced or deleted; immutable names, retention controls, or versioning are separate policies. Unlike POSIX file systems, object APIs commonly expose key-oriented operations such as <code>GET</code>, <code>PUT</code>, <code>DELETE</code>, and <code>HEAD</code>.</p>\n\n      <h2>Storage Tiering Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"HTTP Client\"] --> Edge[\"API & Load Balancer Tier\"]\n    Edge --> MetaService[\"Metadata Service & KV Store\"]\n    Edge --> StorageNode[\"Storage Engine / Data Nodes\"]\n    StorageNode --> Disk1[(\"Disk 1: Chunk\")]\n    StorageNode --> Disk2[(\"Disk 2: Chunk\")]\n    StorageNode --> Disk3[(\"Disk 3: Erasure Coding Parity\")]\n      </div>\n\n      <h2>Separation of Metadata and Payload Data</h2>\n      <ul>\n        <li><strong>Metadata Tier:</strong> Stores object key, bucket name, size, ETag/checksum, ownership, and mapping to physical disk blocks. Stored in high-speed distributed KV stores (like Spanner, CockroachDB, or Cassandra).</li>\n        <li><strong>Data Storage Tier:</strong> Large object payloads are split into fixed-size chunks (e.g., 64MB or 128MB) and written append-only to storage daemon drives.</li>\n      </ul>\n\n      <h2>Durability via Erasure Coding vs. 3x Replication</h2>\n      <p>Standard 3x replication carries a 200% storage overhead (300GB disk used for 100GB data). Modern object stores implement <strong>Reed-Solomon Erasure Coding</strong> (e.g., $8 + 4$ scheme):</p>\n      <ul>\n        <li>Data is split into 8 data chunks, and 4 parity chunks are generated (total 12 chunks).</li>\n        <li>The object can survive the catastrophic loss of any 4 arbitrary drives or nodes simultaneously while imposing only a 50% storage overhead, saving millions of dollars in hardware costs.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Decouple metadata management from high-volume binary payload data storage.",
      "Object APIs generally avoid in-place byte mutation, but keys may still be replaced or deleted unless versioning or retention policy prevents it.",
      "Erasure coding reduces storage overhead for a chosen fault tolerance; end-to-end durability also depends on failure-domain placement, checksums, repair speed, and operations.",
      "Multipart uploads allow large files to be uploaded concurrently and resumed seamlessly on network interruptions."
    ],
    "furtherReading": [
      {
        "title": "MinIO High Performance Object Storage Architecture",
        "url": "https://min.io/docs/minio/linux/index.html"
      },
      {
        "title": "Erasure Coding in Ceph and Distributed Storage",
        "url": "https://docs.ceph.com/en/latest/architecture/"
      }
    ]
  },
  "partitioned-log-system-design": {
    "title": "Design: a Kafka-style log",
    "video": {
      "youtubeId": "be6PLMKKSto",
      "title": "The Basics of Database Sharding and Partitioning in System Design",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Fundamental Abstraction: The Partitioned Append-Only Log</h2>\n      <p>A distributed log (like Apache Kafka or Apache Pulsar) is an ordered, append-only sequence of immutable records. It serves as the durable event backbone of modern event-driven architectures, decoupling producers from consumers with multi-gigabyte/sec throughput.</p>\n\n      <h2>Partitioning & Consumer Group Architecture</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    P[\"Producers\"] --> T[\"Topic: Orders\"]\n    T --> P0[\"Partition 0: Append-Only Log\"]\n    T --> P1[\"Partition 1: Append-Only Log\"]\n    T --> P2[\"Partition 2: Append-Only Log\"]\n    P0 --> C1[\"Consumer 1: Offset Tracker\"]\n    P1 --> C2[\"Consumer 2: Offset Tracker\"]\n    P2 --> C3[\"Consumer 3: Offset Tracker\"]\n      </div>\n\n      <h2>Why Append-Only Logs Achieve Immense Throughput</h2>\n      <ul>\n        <li><strong>Sequential Disk I/O:</strong> Random disk seeks are slow (especially on HDDs and even on SSDs). Appending to the end of a log segment operates purely on sequential I/O, approaching raw physical disk bandwidth.</li>\n        <li><strong>Zero-Copy Network Transfers:</strong> Traditional servers read data into kernel memory, copy it to application user-space memory, and copy it back to the socket buffer. Kafka leverages the Linux <code>sendfile()</code> system call (Zero-Copy), streaming data directly from OS PageCache into the network socket without CPU copying.</li>\n        <li><strong>Batching:</strong> Producers and consumers batch messages together, amortizing network packet overhead and compression costs across thousands of records.</li>\n      </ul>\n\n      <h2>Offset-Based Consumer State</h2>\n      <p>Traditional message queues (RabbitMQ) delete messages as soon as they are acknowledged by a consumer, incurring state overhead per message. In a distributed log, messages are retained for a configurable time window (e.g., 7 days). Consumers simply advance a lightweight 64-bit integer offset, allowing multiple independent consumer groups to read the same data at their own pace or replay historical events.</p>\n    </div>",
    "keyTakeaways": [
      "Append-only logs maximize performance by utilizing purely sequential disk I/O.",
      "Linux Zero-Copy (sendfile system call) streams data from OS page cache directly to network sockets without user-space overhead.",
      "Topics are partitioned to enable horizontal scaling and parallel consumption across consumer groups.",
      "Consumers maintain their own offset state, allowing effortless replaying and multi-consumer independence."
    ],
    "furtherReading": [
      {
        "title": "Jay Kreps: The Log: What every software engineer should know about real-time data's unifying abstraction",
        "url": "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying"
      },
      {
        "title": "Kafka Documentation: Design Principles",
        "url": "https://kafka.apache.org/documentation/#design"
      }
    ]
  }
};
