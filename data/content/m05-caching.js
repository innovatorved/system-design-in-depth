window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-caching-fast-reads"] = {
  "caching-layers": {
    "title": "Caching layers",
    "video": {
      "youtubeId": "dGAgxozNWFE",
      "title": "Cache Systems Every Developer Should Know",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Full-Stack Caching Hierarchy</h2>\n      <p>In high-throughput distributed systems, performance is governed by memory hierarchy latency: L1 CPU cache ($1\\text{ns}$) $\\rightarrow$ RAM ($100\\text{ns}$) $\\rightarrow$ NVMe SSD ($100\\mu\\text{s}$) $\\rightarrow$ Datacenter Network RTT ($500\\mu\\text{s} - 2\\text{ms}$) $\\rightarrow$ Cross-Region Internet RTT ($50\\text{ms} - 150\\text{ms}$). An end-to-end web architecture places specialized caching layers along this pipeline to intercept requests as close to the user as possible.</p>\n\n      <h2>The Multi-Tier Caching Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Browser / Mobile Client\"] -->|\"1. Browser HTTP Cache (304 Not Modified)\"| Edge[\"Cloudflare Anycast CDN Edge (Static & Dynamic SSR)\"]\n    Edge -->|\"2. Cache Miss (Over WAN)\"| Gateway[\"API Gateway / Envoy (Reverse Proxy Response Cache)\"]\n    Gateway -->|\"3. Reverse Proxy Miss\"| App[\"Application Tier: Node / Go / Java\"]\n    \n    App -->|\"4. In-Process L1 Cache: Caffeine / Go sync.Map (0ms Network)\"| AppLogic{\"L1 Hit?\"}\n    AppLogic -->|\"Miss\"| RedisCluster[(\"5. Distributed L2 Cache: Redis Cluster (0.8ms RTT)\")]\n    RedisCluster -->|\"6. L2 Miss\"| DBBuffer[(\"6. Database Engine Buffer Pool: Postgres shared_buffers / InnoDB\")]\n    DBBuffer -->|\"7. Disk Read\"| Disk[(\"NVMe Disk Storage\")]\n      </div>\n\n      <h2>Under the Hood: Layer Mechanics & Headers</h2>\n      <h3>1. Client & Browser Cache</h3>\n      <p>Governed by RFC 7234 HTTP headers:</p>\n      <ul>\n        <li><code>Cache-Control: public, max-age=31536000, immutable</code>: Used for hashed static assets (JS/CSS/images). The browser never issues a network request for the lifetime of the file.</li>\n        <li><code>ETag: \"w/33a64df5\"</code> & <code>If-None-Match</code>: Weak entity tags enable conditional validation. If the resource is unchanged, the server returns <code>HTTP 304 Not Modified</code> with zero body payload, saving bandwidth.</li>\n      </ul>\n\n      <h3>2. Anycast CDN Edge</h3>\n      <p>CDNs (Cloudflare, Fastly, CloudFront) terminate TCP and TLS connections at hundreds of Point-of-Presence (PoP) locations worldwide. Fastly uses Varnish (VCL) in RAM, while Cloudflare uses custom Rust/Nginx proxies. Caching dynamic JSON responses at the edge drops p95 API latency from $120\\text{ms}$ to $< 15\\text{ms}$.</p>\n\n      <h3>3. In-Process L1 vs. Distributed L2 Cache</h3>\n      <p>Distributed caches (Redis) incur a network hop ($0.5\\text{ms} - 2\\text{ms}$) and serialization/deserialization overhead. An in-process cache (Caffeine in Java, <code>sync.Map</code> or <code>bigcache</code> in Go) stores deserialized heap objects in application memory. Zero network overhead allows millions of reads per second on a single instance.</p>\n    </div>",
    "keyTakeaways": [
      "Modern web architecture employs an 8-layer cache hierarchy from browser headers to database buffer pools.",
      "Browser and CDN caching leverage Cache-Control immutable and ETag conditional validation to bypass servers.",
      "In-process L1 caching (Caffeine/Go) eliminates network serialization overhead, delivering sub-microsecond reads."
    ],
    "furtherReading": [
      {
        "title": "MDN Web Docs: HTTP Caching Guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching"
      },
      {
        "title": "Cloudflare: How CDN Edge Caching Works",
        "url": "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/"
      }
    ]
  },
  "distributed-cache-design": {
    "title": "Distributed cache design",
    "video": {
      "youtubeId": "dGAgxozNWFE",
      "title": "Cache Systems Every Developer Should Know",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Redis Cluster vs. Memcached Multi-Node</h2>\n      <p>When caching requirements exceed the memory capacity of a single server (typically $> 128\\text{GB}$) or require high write availability, the cache must be distributed across a cluster. Two distinct architectural paradigms dominate:</p>\n\n      <h3>1. Memcached: Dumb Server, Smart Client</h3>\n      <p>Memcached nodes do not communicate with each other. The client library maintains a list of node IPs and uses <strong>Ketama Consistent Hashing</strong> client-side to calculate which node holds key $K$. The client connects directly to that server. If a node fails, the client marks it dead and redistributes keys.</p>\n\n      <h3>2. Redis Cluster: Smart Server Hash Slots</h3>\n      <p>Redis Cluster partitions its keyspace into <strong>16,384 Hash Slots</strong>. Every key is assigned a slot via CRC16:</p>\n      <pre><code>hash_slot = CRC16(key) mod 16384</code></pre>\n      <p>Slots are divided among master nodes (e.g., Node A holds slots 0..5460, Node B holds 5461..10922, Node C holds 10923..16383). Each master has one or more replica nodes.</p>\n\n      <h2>Redis Cluster Topology and Redirection Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Application Client\"] -->|\"GET 'user:994' (Hash slot: 8402)\"| NodeA[\"Redis Node A (Slots: 0..5460)\"]\n    NodeA -->|\"MOVED 8402 10.0.1.2:6379 (Client Cache Updated)\"| Client\n    Client -->|\"GET 'user:994' (Direct to Correct Node)\"| NodeB[\"Redis Node B (Slots: 5461..10922)\"]\n    NodeB -->|\"200 OK: Returns Data\"| Client\n\n    subgraph ClusterMesh [\"Inter-Node Gossip Mesh (Port 16379)\"]\n      NodeA <-->|\"Heartbeat / Failure Detection\"| NodeB\n      NodeB <-->|\"Slot Rebalancing\"| NodeC[\"Redis Node C (Slots: 10923..16383)\"]\n      NodeA <--> NodeC\n    end\n      </div>\n\n      <h2>Redirection Mechanics: MOVED vs. ASK</h2>\n      <ul>\n        <li><strong>MOVED Redirection:</strong> When a client queries a node for a hash slot owned by another node, the server returns <code>-MOVED 8402 10.0.1.2:6379</code>. The client updates its internal slot-to-node routing table and retries against the target node.</li>\n        <li><strong>ASK Redirection:</strong> Occurs during online slot migration. If slot 8402 is migrating from Node B to Node C, Node B returns <code>-ASK 8402 10.0.1.3:6379</code>. The client sends an <code>ASKING</code> command followed by the query to Node C, but does <em>not</em> update its permanent routing table.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Memcached uses client-side consistent hashing (Ketama) with zero server-to-server coordination.",
      "Redis Cluster partitions keys across 16,384 hash slots using CRC16, managed via internal gossip protocols.",
      "MOVED redirections update the client's routing cache; ASK redirections handle active slot migrations without downtime."
    ],
    "furtherReading": [
      {
        "title": "Redis Cluster Specification",
        "url": "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/"
      },
      {
        "title": "Facebook Engineering: Scaling Memcache at Facebook",
        "url": "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala"
      }
    ]
  },
  "cache-eviction-policies": {
    "title": "Cache eviction policies",
    "video": {
      "youtubeId": "dGAgxozNWFE",
      "title": "Cache Systems Every Developer Should Know",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A scan of one-time report keys evicts frequently reused product records from a fixed memory budget.</p><h2>Mechanics</h2><p>LRU favors recent access; LFU favors repeated access; admission policies such as Window TinyLFU, notably used by Caffeine, compare estimated frequency before admitting an item. Redis offers approximate LRU and LFU policies, not Window TinyLFU. Measure item and byte hit rates on a representative trace.</p><h2>Failure mode</h2><p>Pure LRU suffers scan pollution, LFU can retain old popularity, and oversized entries can consume capacity even with a good item policy. Sampling-based approximations vary by workload.</p><h2>Trade-off</h2><p>More metadata and sophisticated admission can improve hit ratio but consume CPU and memory. TTL, explicit invalidation, entry size, and business value may matter more than recency alone.</p></div>",
    "keyTakeaways": [
      "Redis provides approximate LRU and LFU; Caffeine is a Window TinyLFU implementation.",
      "Evaluate item and byte hit rates on representative access traces.",
      "Eviction interacts with TTL, entry size, invalidation, and business value."
    ],
    "furtherReading": [
      {
        "title": "Ben Manes: Design of the Caffeine Cache (TinyLFU)",
        "url": "https://github.com/ben-manes/caffeine/wiki/Design"
      },
      {
        "title": "Redis Eviction Policies: How Redis Allocates Memory",
        "url": "https://redis.io/docs/latest/operate/oss_and_stack/management/eviction/"
      }
    ]
  },
  "ttl-expiration-and-cache-reapers": {
    "title": "TTL expiration and cache reapers",
    "video": {
      "youtubeId": "V7FPk4J10KI",
      "title": "Redis In-Memory Database Crash Course",
      "channel": "Hussein Nasser"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>Millions of sessions expire near midnight, but deleting every key with an individual timer would overload the cache.</p><h2>Mechanics</h2><p>Caches commonly combine lazy expiration on access with bounded background sampling or scanning. Exact Redis sample counts, time budgets, and frequency depend on version and configuration, so monitor expired-but-resident memory and event-loop latency rather than relying on one fixed algorithm.</p><h2>Failure mode</h2><p>Synchronized TTLs can create a miss storm, lazy cleanup can retain memory, and different nodes can expire copies at different moments. Clock steps and replication behavior require product-specific testing.</p><h2>Trade-off</h2><p>Aggressive reaping frees memory sooner but steals CPU from requests. Jittered TTLs smooth load; soft and hard expiry separate freshness from the maximum staleness the product permits.</p></div>",
    "keyTakeaways": [
      "Lazy expiry and bounded background cleanup avoid one timer per key.",
      "Redis cleanup details vary by version and configuration.",
      "Jitter and soft versus hard TTLs make load and staleness explicit."
    ],
    "furtherReading": [
      {
        "title": "Redis Documentation: EXPIRE and Key Expiration Algorithms",
        "url": "https://redis.io/docs/latest/commands/expire/"
      },
      {
        "title": "Antirez: How Redis Eviction and Expiration Work",
        "url": "http://antirez.com/news/109"
      }
    ]
  },
  "cache-concurrency-control": {
    "title": "Cache concurrency control",
    "video": {
      "youtubeId": "dGAgxozNWFE",
      "title": "Cache Stampede and Concurrency Patterns",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A product catalog key expires under 10,000 concurrent reads.</p><h2>Mechanics</h2><p>Singleflight coalesces duplicate work within one process; cross-process coordination needs a lock, lease, queue, or refresh owner with a bounded wait and failure policy. Probabilistic early refresh such as XFetch reduces synchronized expiry probability but does not guarantee permanent residency. Cache-aside writes still need race handling.</p><h2>Failure mode</h2><p>An old reader can load the database, race with an update-and-delete, then repopulate stale data. A refresh owner can crash, waiters can pile up, and a distributed lease can expire while work continues.</p><h2>Trade-off</h2><p>Coalescing protects the database but adds waiting and coordination. Versioned values, delayed double deletion, write-through, or stale-while-revalidate each exchange consistency, write latency, complexity, and availability.</p></div>",
    "keyTakeaways": [
      "Singleflight coalesces local work; cross-process refresh needs additional coordination.",
      "Cache-aside delete can race with a stale reader that repopulates the key.",
      "Probabilistic early refresh reduces stampedes but does not guarantee residency."
    ],
    "furtherReading": [
      {
        "title": "Vattani et al.: Optimal Probabilistic Cache Invalidation (XFetch Paper)",
        "url": "https://www.vldb.org/pvldb/vol8/p886-vattani.pdf"
      },
      {
        "title": "Go Singleflight Package Documentation",
        "url": "https://pkg.go.dev/golang.org/x/sync/singleflight"
      }
    ]
  },
  "cache-availability-and-database-fallback": {
    "title": "Cache availability and database fallback",
    "video": {
      "youtubeId": "dGAgxozNWFE",
      "title": "Cache Systems Every Developer Should Know",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A cache normally absorbs 99 percent of 100,000 reads per second, then becomes unreachable.</p><h2>Mechanics</h2><p>Protect the database with a concurrency limit or rate limiter based on measured capacity. Fail fast on cache timeouts, serve explicitly bounded stale local data where allowed, and reject excess work. A soft TTL starts refresh; a hard TTL is the product limit after which stale data must not be served.</p><h2>Failure mode</h2><p>Unrestricted fallback can overload the database, but a high hit ratio alone does not prove how the database was provisioned. Failover may expose cold replicas or stale data, and retrying cache calls can exhaust workers.</p><h2>Trade-off</h2><p>Stale responses preserve availability only for data whose correctness permits them. Redundant cache clusters reduce outage probability but add cost, failover complexity, replication lag, and recovery miss storms.</p></div>",
    "keyTakeaways": [
      "Bound database fallback by measured concurrency or rate capacity.",
      "Hard TTL defines when stale data must no longer be served.",
      "Cache redundancy adds failover, lag, recovery, and cost trade-offs."
    ],
    "furtherReading": [
      {
        "title": "Martin Fowler: Circuit Breaker Pattern",
        "url": "https://martinfowler.com/bliki/CircuitBreaker.html"
      },
      {
        "title": "AWS Architecture Blog: Avoiding Fallback Avalanches",
        "url": "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"
      }
    ]
  }
};
