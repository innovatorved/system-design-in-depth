/* ═══════════════════════════════════════════════════════════════
   System Design Glossary — ~200 Core Terms & Definitions
   ═══════════════════════════════════════════════════════════════ */

window.GLOSSARY = [
  {
    "term": "ACID",
    "def": "Atomicity, Consistency, Isolation, Durability — properties guaranteed by relational database transactions.",
    "cat": "Database"
  },
  {
    "term": "Active-Active",
    "def": "A multi-region setup where every region simultaneously serves read and write traffic.",
    "cat": "Reliability"
  },
  {
    "term": "Active-Passive",
    "def": "A disaster recovery setup where a primary region serves traffic and a secondary standby region takes over on failure.",
    "cat": "Reliability"
  },
  {
    "term": "Anti-Entropy",
    "def": "Background synchronization process (often using Merkle trees) to resolve discrepancies between replicas in eventual consistency systems.",
    "cat": "Distributed Systems"
  },
  {
    "term": "API Gateway",
    "def": "Single entry point for client requests handling reverse proxying, auth, rate limiting, and telemetry.",
    "cat": "API"
  },
  {
    "term": "Backoff with Jitter",
    "def": "Adding random variance to exponential retry intervals to prevent clients from retrying simultaneously (thundering herd).",
    "cat": "Reliability"
  },
  {
    "term": "Backpressure",
    "def": "Signaling upstream producers to slow down when downstream consumers cannot keep pace with message volume.",
    "cat": "Async & Streams"
  },
  {
    "term": "Bloom Filter",
    "def": "Space-efficient probabilistic data structure that tests set membership with zero false negatives and tunable false positives.",
    "cat": "Algorithms"
  },
  {
    "term": "B-Tree",
    "def": "Self-balancing search tree optimized for systems reading/writing large disk blocks, standard for relational DB indexes.",
    "cat": "Storage"
  },
  {
    "term": "Cache Aside",
    "def": "Application code checks the cache; on miss, fetches from database and writes back to cache.",
    "cat": "Caching"
  },
  {
    "term": "Cache Stampede",
    "def": "Simultaneous cache misses across thousands of concurrent clients hammering the database for the same expired key.",
    "cat": "Caching"
  },
  {
    "term": "CAP Theorem",
    "def": "In an asynchronous network with partitions (P), a distributed system must choose between Consistency (C) or Availability (A).",
    "cat": "Distributed Systems"
  },
  {
    "term": "Circuit Breaker",
    "def": "Design pattern that trips open when remote dependency failure rates cross a threshold, failing fast to prevent cascade.",
    "cat": "Reliability"
  },
  {
    "term": "Compaction",
    "def": "Merging multiple immutable SSTables into a new sorted table while discarding deleted or overwritten entries.",
    "cat": "Storage"
  },
  {
    "term": "Consistent Hashing",
    "def": "Hashing technique mapping keys and nodes to a circular ring so adding/removing nodes only moves K/N keys.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Count-Min Sketch",
    "def": "Sublinear space probabilistic data structure for estimating frequencies of events in a data stream.",
    "cat": "Algorithms"
  },
  {
    "term": "CQRS",
    "def": "Command Query Responsibility Segregation — separating the read and write models to optimize performance and schema.",
    "cat": "Architecture"
  },
  {
    "term": "CRDT",
    "def": "Conflict-Free Replicated Data Type — data structures that can be replicated concurrently and merged deterministically without coordination.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Dead Letter Queue (DLQ)",
    "def": "Secondary queue holding messages that failed processing after the maximum allowed retry attempts.",
    "cat": "Async & Streams"
  },
  {
    "term": "Dual Writing",
    "def": "Anti-pattern where an application writes to two independent systems (e.g. DB and Cache/Kafka) without distributed transactions.",
    "cat": "Architecture"
  },
  {
    "term": "Dynamic Sharding",
    "def": "Automatically splitting or migrating database partitions as data size or traffic changes.",
    "cat": "Database"
  },
  {
    "term": "Ephemeral Port",
    "def": "Short-lived transport protocol port assigned automatically by IP software client-side for outbound connections.",
    "cat": "Networking"
  },
  {
    "term": "Eventual Consistency",
    "def": "Consistency model guaranteeing that in the absence of new updates, all replicas will eventually return the same value.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Fan-Out on Read (Pull)",
    "def": "Aggregating posts from followed users when a timeline is requested, saving storage but adding read latency.",
    "cat": "Architecture"
  },
  {
    "term": "Fan-Out on Write (Push)",
    "def": "Pushing a new post directly into every follower inbox at write time, enabling fast reads at the cost of write amplification.",
    "cat": "Architecture"
  },
  {
    "term": "Geohash",
    "def": "Hierarchical spatial data structure that encodes latitude and longitude into an alphanumeric string with prefix locality.",
    "cat": "Geo"
  },
  {
    "term": "Gossip Protocol",
    "def": "Peer-to-peer communication protocol where nodes periodically exchange state with random peers to disseminate information.",
    "cat": "Distributed Systems"
  },
  {
    "term": "gRPC",
    "def": "High-performance open-source RPC framework using HTTP/2 multiplexing and Protocol Buffers binary serialization.",
    "cat": "API"
  },
  {
    "term": "Head-of-Line Blocking",
    "def": "A performance bottleneck where a slow or delayed packet at the front of a queue holds up subsequent packets.",
    "cat": "Networking"
  },
  {
    "term": "HyperLogLog",
    "def": "Probabilistic algorithm for approximating the number of distinct elements (cardinality) in massive datasets in fixed memory.",
    "cat": "Algorithms"
  },
  {
    "term": "Idempotency",
    "def": "The property where making identical requests multiple times produces the exact same side-effect as a single request.",
    "cat": "API"
  },
  {
    "term": "Inverted Index",
    "def": "Database index storing a mapping from words to their locations in a document or set of documents, used in full-text search.",
    "cat": "Search"
  },
  {
    "term": "Kafka ISR",
    "def": "In-Sync Replicas — the set of partition replicas that are fully caught up with the partition leader in Apache Kafka.",
    "cat": "Async & Streams"
  },
  {
    "term": "Leaky Bucket",
    "def": "Rate limiting algorithm where requests are queued and processed at a constant leak rate, smoothing traffic bursts.",
    "cat": "API"
  },
  {
    "term": "Linearizability",
    "def": "The strongest consistency model: operations appear to occur atomically at a specific point in real time between invocation and response.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Little's Law",
    "def": "Queueing theory formula L = λW stating that average number of items in a system equals arrival rate times average wait time.",
    "cat": "Performance"
  },
  {
    "term": "Load Shedding",
    "def": "Intentionally rejecting incoming lower-priority requests when a system reaches saturation to protect critical operations.",
    "cat": "Reliability"
  },
  {
    "term": "LSM-Tree",
    "def": "Log-Structured Merge-Tree — storage engine structure that writes sequentially to an in-memory buffer then flushes to immutable disk tables.",
    "cat": "Storage"
  },
  {
    "term": "Memtable",
    "def": "In-memory sorted buffer (often a skip list or red-black tree) that holds recent writes in an LSM-tree before flushing.",
    "cat": "Storage"
  },
  {
    "term": "Merkle Tree",
    "def": "Hash tree where every non-leaf node is labeled with cryptographic hash of labels of child nodes, allowing efficient equality checks.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Multi-Leader Replication",
    "def": "Replication architecture where multiple nodes can accept writes, requiring conflict resolution strategies.",
    "cat": "Database"
  },
  {
    "term": "MVCC",
    "def": "Multi-Version Concurrency Control — keeping multiple physical versions of a record so readers do not block writers and vice versa.",
    "cat": "Database"
  },
  {
    "term": "N+1 Query Problem",
    "def": "Performance anti-pattern where an application executes 1 query for a parent record, then N additional queries for child records.",
    "cat": "Database"
  },
  {
    "term": "Negative Caching",
    "def": "Caching the absence of a resource (e.g. 404 or null) to protect databases against repeated misses (cache penetration).",
    "cat": "Caching"
  },
  {
    "term": "Outbox Pattern",
    "def": "Reliable messaging pattern where database state changes and outbound events are written to an outbox table in the same transaction.",
    "cat": "Architecture"
  },
  {
    "term": "PACELC Theorem",
    "def": "Extension of CAP: If there is a Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C).",
    "cat": "Distributed Systems"
  },
  {
    "term": "Partition Key",
    "def": "Attribute used to determine which physical shard or partition stores a given row or document.",
    "cat": "Database"
  },
  {
    "term": "P99 Latency",
    "def": "99th percentile response time: 99% of requests complete faster than this duration, measuring tail latency.",
    "cat": "Performance"
  },
  {
    "term": "Quorum",
    "def": "Minimum number of agreeing replicas required to complete an operation (typically R + W > N ensures read-your-writes).",
    "cat": "Distributed Systems"
  },
  {
    "term": "Raft",
    "def": "Consensus algorithm designed to be understandable, using leader election, log replication, and safety invariants.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Rate Limiting",
    "def": "Controlling the rate of traffic sent or received by an endpoint to protect service availability and prevent abuse.",
    "cat": "API"
  },
  {
    "term": "Read Repair",
    "def": "Detecting stale replica data during a client read and asynchronously updating the out-of-date replica.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Read-Your-Writes",
    "def": "Consistency guarantee that a client will always immediately observe updates that they themselves submitted.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Replica Lag",
    "def": "Delay between a write arriving at the primary leader database and being replayed onto asynchronous secondary read replicas.",
    "cat": "Database"
  },
  {
    "term": "Saga Pattern",
    "def": "Sequence of local transactions coordinated either via choreography (events) or orchestration to maintain consistency across services.",
    "cat": "Architecture"
  },
  {
    "term": "Serde",
    "def": "Serialization and Deserialization — encoding in-memory objects to wire format (JSON, Protobuf) and decoding back.",
    "cat": "API"
  },
  {
    "term": "Sharding",
    "def": "Partitioning a database horizontally across multiple independent physical server instances.",
    "cat": "Database"
  },
  {
    "term": "Skip List",
    "def": "Probabilistic alternative to balanced trees, using layered linked lists to achieve O(log n) search, insert, and delete.",
    "cat": "Algorithms"
  },
  {
    "term": "Sliding Window Counter",
    "def": "Hybrid rate-limiting algorithm combining fixed window counters and sliding log for low memory and precise bounds.",
    "cat": "API"
  },
  {
    "term": "Snowflake ID",
    "def": "64-bit globally unique, roughly time-ordered identifier generated independently across distributed workers without coordination.",
    "cat": "Distributed Systems"
  },
  {
    "term": "SSTable",
    "def": "Sorted String Table — immutable on-disk file format holding ordered key-value pairs with an index block.",
    "cat": "Storage"
  },
  {
    "term": "Tail Latency",
    "def": "The small percentage of slowest requests in an application, critical in microservice graphs due to latency compounding.",
    "cat": "Performance"
  },
  {
    "term": "TDigest",
    "def": "Accurate online estimation data structure for extreme percentiles (p99, p99.9) on high-volume continuous data streams.",
    "cat": "Algorithms"
  },
  {
    "term": "Thundering Herd",
    "def": "Problem where a large number of waiting processes or threads awake simultaneously when an event occurs, overloading resources.",
    "cat": "Performance"
  },
  {
    "term": "Token Bucket",
    "def": "Rate limiting algorithm where tokens accumulate at a fixed rate up to a burst capacity and each request consumes a token.",
    "cat": "API"
  },
  {
    "term": "Two-Phase Commit (2PC)",
    "def": "Atomic commitment protocol where coordinator asks participants to prepare, then commits if all vote yes.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Vector Clock",
    "def": "Algorithm generating partial ordering of events in distributed systems to detect concurrent updates and causality violations.",
    "cat": "Distributed Systems"
  },
  {
    "term": "Virtual Node (Vnode)",
    "def": "Assigning multiple points on a consistent hash ring to a single physical server to ensure balanced partition distribution.",
    "cat": "Distributed Systems"
  },
  {
    "term": "WAL (Write-Ahead Log)",
    "def": "Append-only disk log written before changes are applied to in-memory tables or pages, guaranteeing durability across crashes.",
    "cat": "Storage"
  },
  {
    "term": "WebSockets",
    "def": "Persistent bidirectional full-duplex communication channel over a single TCP connection initiated via HTTP upgrade.",
    "cat": "Networking"
  },
  {
    "term": "Write Amplification",
    "def": "Ratio of the total amount of bytes written to storage media relative to the logical bytes written by the application.",
    "cat": "Storage"
  },
  {
    "term": "Write-Through Cache",
    "def": "Caching strategy where updates are written to cache and primary backing store synchronously in the same call.",
    "cat": "Caching"
  },
  {
    "term": "Write-Back (Write-Behind)",
    "def": "Caching strategy where updates are written to cache immediately and asynchronously flushed to backing storage.",
    "cat": "Caching"
  },
  {
    "term": "Zero-Copy",
    "def": "Operating system optimization where CPU does not copy data between intermediate buffers (e.g. sendfile transferring disk to socket).",
    "cat": "Performance"
  },
  {
    "term": "Zombie Process",
    "def": "Process that has completed execution but still has an entry in process table waiting for parent to read exit status.",
    "cat": "Operating Systems"
  }
];
