window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["caching-layers"] = [
  {
    "id": "caching-layers-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Immutable vs ETag",
    "section": "Under the Hood: Layer Mechanics & Headers",
    "prompt": "A content-hashed file app.3f9c.js is served with Cache-Control: public, max-age=31536000, immutable. A user reloads the page a week later. What does the browser do for that file?",
    "options": [
      "Sends If-None-Match with the ETag and receives a 304 Not Modified with no body",
      "Downloads the file again because a page reload bypasses max-age",
      "Serves it from its local cache without making any network request",
      "Asks the CDN edge, which answers from its own cache"
    ],
    "answer": 2,
    "explanation": "With immutable and a one-year max-age, the browser never issues a request for the file's lifetime; a new version ships under a new URL. A conditional request returning 304 is how ETag validation works, which still costs a round trip.",
    "tags": [
      "caching-layers",
      "recall",
      "inline"
    ]
  },
  {
    "id": "caching-layers-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Hit ratios multiply",
    "section": "Worked example: what each layer buys you",
    "prompt": "A product API gets 50,000 rps. The browser cache absorbs 30 percent, the CDN absorbs a share of the rest, and L1 plus Redis absorb 95 percent of what reaches the app. If a bad query-string change drops the CDN hit ratio to 20 percent, roughly how many qps reach the database?",
    "options": [
      "About 700 qps, unchanged, because L1 and Redis absorb the difference",
      "About 1,400 qps",
      "About 2,800 qps",
      "About 10,000 qps"
    ],
    "answer": 1,
    "explanation": "50,000 x 0.70 = 35,000 leave devices; with a 20 percent CDN hit ratio 28,000 reach the origin, and 5 percent of that is 1,400 qps. Hit ratios multiply, so a regression in one layer passes straight through to the database rather than being soaked up downstream.",
    "tags": [
      "caching-layers",
      "apply",
      "inline"
    ]
  },
  {
    "id": "caching-layers-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Flip-flopping prices",
    "section": "Layer trade-offs",
    "prompt": "After an admin updates a price, the same user sees the new price, then the old one, then the new one again on successive refreshes for several minutes. The service runs 50 instances, each with an in-process L1 in front of Redis. What is the most likely cause and fix?",
    "options": [
      "Redis replication lag; read from the Redis primary only",
      "The browser cache is serving stale JSON; add Cache-Control: no-store",
      "CDN purge lag; switch to tag-based purging",
      "Each instance's L1 holds its own copy and expires independently; broadcast invalidations via pub/sub or shorten the L1 TTL"
    ],
    "answer": 3,
    "explanation": "Successive requests hit different instances behind the load balancer, and each L1 is an independent copy with poor fleet-wide invalidation control. Redis replication lag is usually milliseconds, and a stale browser cache would show the old price consistently rather than alternating.",
    "tags": [
      "caching-layers",
      "staff",
      "inline"
    ]
  },
  {
    "id": "caching-layers-n1",
    "topic": "caching-layers",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Origin Database QPS Reduction via Multi-Tier Cache",
    "scenario": "A product catalog service receives 100,000 read req/s. Requests first check an L1 in-process cache (50% hit rate), and L1 misses check an L2 distributed Redis cluster (90% hit rate of the traffic reaching L2).",
    "prompt": "How many read requests per second (in req/s) miss both cache tiers and hit the origin database?",
    "question": "How many read requests per second (in req/s) miss both cache tiers and hit the origin database?",
    "unit": "req/s",
    "answer": 5000,
    "tolerance": 0.25,
    "hint": "L1 misses = 100,000 × (1 - 0.50) = 50,000 req/s. L2 misses = 50,000 × (1 - 0.90) = 5,000 req/s.",
    "explanation": "Of 100,000 req/s, 50% (50,000 req/s) miss L1 and reach L2 Redis. Of those 50,000 req/s, 10% (5,000 req/s) miss L2 and hit the database—an effective combined hit rate of 95%.",
    "tags": [
      "caching-layers",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "caching-layers-t1",
    "topic": "caching-layers",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: L1 In-Process Cache Invalidation vs Redis Hot-Key Bottleneck",
    "scenario": "A celebrity post receives 250,000 reads/sec, saturating the single Redis shard holding that key (`100% CPU` on one Redis node), even though the overall Redis cluster is at 15% CPU.",
    "prompt": "Which caching architecture resolves the single-shard hot-key bottleneck while keeping staleness bounded, and why?",
    "question": "Which caching architecture resolves the single-shard hot-key bottleneck while keeping staleness bounded, and why?",
    "options": [
      "Double the number of shards in the Redis cluster using consistent hashing",
      "Add a tiny L1 in-memory cache (or key replication across N sub-keys `key#1..N`) with a 1–2 second TTL + Redis client-side invalidation broadcasts for detected hot keys",
      "Bypass Redis for hot keys and query the primary SQL database directly"
    ],
    "correctOption": 1,
    "reasons": [
      "Adding more consistent-hashing shards splits a single key across multiple nodes automatically",
      "Asingle key always hashes to one shard; absorbing hot-key reads in stateless app-tier L1 memory (with short TTL / pub-sub invalidation) eliminates the network and single-thread Redis bottleneck",
      "Primary SQL databases handle 250,000 point reads/sec more cheaply than in-memory caches"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Consistent hashing maps a single key to a single shard no matter how many shards exist.",
    "explanation": "Adding shards to Redis does not split a single hot key. Absorbing hot keys in an application-local L1 cache with a 1-2s micro-TTL (or salting the key across N replicas) spreads the 250k req/s across all stateless app servers.",
    "tags": [
      "caching-layers",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["distributed-cache-design"] = [
  {
    "id": "distributed-cache-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "MOVED vs ASK",
    "section": "Redirection Mechanics: MOVED vs. ASK",
    "prompt": "While slot 8402 is being migrated from node B to node C, a client sends a GET for a key in that slot to node B and receives an ASK redirect. What should the client do?",
    "options": [
      "Send ASKING followed by the command to node C, without updating its permanent slot map",
      "Update its slot map so slot 8402 points to node C, then retry there",
      "Retry on node B after a short backoff, because the migration will finish soon",
      "Fetch the full cluster topology before sending any further commands"
    ],
    "answer": 0,
    "explanation": "ASK is a one-off redirect during online migration: the client sends ASKING then the query to the target, but keeps its routing table unchanged because the slot is still officially owned by B. Updating the slot map is the correct response to MOVED, not ASK.",
    "tags": [
      "distributed-cache-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "distributed-cache-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing Redis Cluster",
    "section": "Worked example: sizing a cache cluster",
    "prompt": "You need to cache 300M objects averaging 1 KB, with about 100 bytes of per-key overhead. Following the lesson, you keep nodes at no more than 70 percent memory and give each primary one replica. With 64 GB nodes, how many nodes do you need?",
    "options": [
      "6 nodes, since 330 GB divided by 64 GB is about 5.2",
      "10 nodes, 5 primaries plus 5 replicas",
      "16 nodes, 8 primaries plus 8 replicas",
      "24 nodes, 12 primaries plus 12 replicas"
    ],
    "answer": 2,
    "explanation": "300M x 1.1 KB is about 330 GB; at 70 percent use that needs about 470 GB of RAM, so 8 primaries of 64 GB, doubled to 16 with replicas. Dividing raw data by node size ignores both the headroom for fragmentation and replication buffers and the replicas themselves.",
    "tags": [
      "distributed-cache-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "distributed-cache-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Minority primary writes",
    "section": "Failure modes",
    "prompt": "A network partition isolates one Redis Cluster primary with a few clients on its side. Those clients keep writing successfully. After the partition heals, those writes are gone. Why?",
    "options": [
      "Redis Cluster discards all writes made during a failover by design, even on the majority side",
      "The minority primary accepted writes until cluster-node-timeout expired, while the majority promoted its replica; on rejoin it became a replica and its writes were discarded",
      "The clients' writes went to replicas, which do not accept writes and silently drop them",
      "The ASK redirect caused the clients to write to a node that did not own the slot"
    ],
    "answer": 1,
    "explanation": "Redis Cluster replication is asynchronous and a minority primary keeps accepting writes until the node timeout; meanwhile the majority fails over, and the old primary rejoins as a replica, losing those writes. The loss is limited to the isolated side, not every write during failover.",
    "tags": [
      "distributed-cache-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "distributed-cache-design-n1",
    "topic": "distributed-cache-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Singleflight / Request Coalescing Origin Shielding",
    "scenario": "A hot homepage cache key expires while 8,000 concurrent requests/sec are reading it. Rebuilding the key from PostgreSQL takes 50 ms. Without singleflight, all concurrent requests that arrive during the 50 ms rebuild miss the cache and hit PostgreSQL.",
    "prompt": "How many redundant database queries hit PostgreSQL during that single 50 ms cache rebuild window without singleflight?",
    "question": "How many redundant database queries hit PostgreSQL during that single 50 ms cache rebuild window without singleflight?",
    "unit": "queries",
    "answer": 400,
    "tolerance": 0.2,
    "hint": "Multiply 8,000 req/s (which is 8 req/ms) by the 50 ms rebuild window.",
    "explanation": "At 8,000 req/s (8 requests per ms), 8 × 50 ms = 400 concurrent requests miss the cache during the rebuild window and stampede the database (whereas singleflight coalesces them into 1 DB query).",
    "tags": [
      "distributed-cache-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "distributed-cache-design-t1",
    "topic": "distributed-cache-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Write-Through vs Look-Aside Cache Invalidation Race",
    "scenario": "Under a standard cache-aside pattern, Reader A misses the cache and reads an old value V1 from the DB, then Writer B updates the DB to V2 and deletes the cache key, and finally Reader A's delayed thread writes V1 into the cache with a 1-hour TTL.",
    "prompt": "Which mechanism prevents stale cache-aside repopulation without serializing all reads through a distributed lock, and why?",
    "question": "Which mechanism prevents stale cache-aside repopulation without serializing all reads through a distributed lock, and why?",
    "options": [
      "Increase the cache TTL from 1 hour to 24 hours",
      "Have writers set the cache value before updating the database",
      "Use leased tokens (`gets`/`cas` in Memcached or versioned conditional sets in Redis) where a delete invalidates any in-flight read lease token, combined with a bounded TTL safety net"
    ],
    "correctOption": 2,
    "reasons": [
      "Longer TTLs reduce the impact of permanently poisoned cache entries",
      "Writing to cache before DB commits prevents dirty reads when DB transactions roll back",
      "A lease token issued on cache miss is invalidated when a concurrent delete occurs, causing Reader A's stale compare-and-set to be rejected cleanly"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How did Facebook's McRouter/Memcached paper solve the stale-set race condition?",
    "explanation": "Facebook's Memcached lease mechanism issues a 64-bit lease token on a cache miss; if a delete arrives before the reader populates the cache, the lease is revoked and the stale `cas` write is silently ignored.",
    "tags": [
      "distributed-cache-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["cache-eviction-policies"] = [
  {
    "id": "cache-eviction-policies-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Who implements W-TinyLFU",
    "section": "Mechanics",
    "prompt": "Which statement about eviction policies in real products is accurate?",
    "options": [
      "Caffeine uses an admission policy (Window TinyLFU), while Redis offers approximate LRU and LFU policies",
      "Redis uses Window TinyLFU by default, which is why it resists scans",
      "Both Redis and Caffeine implement exact LRU with a linked list and a hash map",
      "LFU is always scan resistant and adapts quickly to shifting popularity without any decay"
    ],
    "answer": 0,
    "explanation": "The lesson is explicit that Window TinyLFU is Caffeine's design and Redis provides sampled approximations of LRU and LFU, not W-TinyLFU. LFU without decay can hold on to old popularity, which is why Redis's LFU includes a decay time.",
    "tags": [
      "cache-eviction-policies",
      "recall",
      "inline"
    ]
  },
  {
    "id": "cache-eviction-policies-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Surviving a nightly export",
    "section": "Worked example: scan pollution",
    "prompt": "A 1 GB LRU cache holds 1M product records of 1 KB each, with a 92 percent hit ratio. A nightly job reads 2M distinct 1 KB order rows through the same cache, and product hit ratio collapses. Which change best keeps the hot set?",
    "options": [
      "Double the cache to 2 GB so the export fits alongside the products",
      "Lengthen product TTLs so they cannot expire during the export",
      "Switch to exact LRU instead of sampled LRU so eviction is more precise",
      "Use a frequency-aware admission policy such as Window TinyLFU, so one-time rows only churn a small window"
    ],
    "answer": 3,
    "explanation": "Export rows have a frequency of 1 and cannot beat hot products' counts, so W-TinyLFU confines them to its small admission window. A 2 GB cache still gets flushed by 2 GB of export rows under LRU, and TTL does not stop eviction of valid entries.",
    "tags": [
      "cache-eviction-policies",
      "apply",
      "inline"
    ]
  },
  {
    "id": "cache-eviction-policies-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Redis full, writes failing",
    "section": "Practical guidance",
    "prompt": "A new Redis cache runs fine for weeks, then SET commands start failing with out-of-memory errors while GETs still work. Nobody changed the configuration. What is the most likely cause?",
    "options": [
      "allkeys-lru is evicting too aggressively and rejecting new keys",
      "The keys have no TTL, and Redis cannot evict keys without one under any policy",
      "maxmemory-policy was left at the default noeviction, so writes fail once memory is full",
      "Lazy expiry has stopped running because the key count is too high"
    ],
    "answer": 2,
    "explanation": "Redis's default policy, noeviction, returns errors on writes at maxmemory instead of freeing space, so you must set an explicit policy for a cache. Only the volatile-* policies are limited to keys with a TTL; allkeys-* policies can evict any key.",
    "tags": [
      "cache-eviction-policies",
      "staff",
      "inline"
    ]
  },
  {
    "id": "cache-eviction-policies-n1",
    "topic": "cache-eviction-policies",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Scan Pollution in Pure LRU",
    "scenario": "A Redis cache holds 1,000,000 entries using pure LRU eviction. A hourly batch reporting job sequentially reads 600,000 one-time cold keys that are never accessed again.",
    "prompt": "What percentage of the 1,000,000 cached working-set entries get evicted by this single sequential batch scan under pure LRU?",
    "question": "What percentage of the 1,000,000 cached working-set entries get evicted by this single sequential batch scan under pure LRU?",
    "unit": "%",
    "answer": 60,
    "tolerance": 0.2,
    "hint": "600,000 newly inserted cold keys push out 600,000 entries from the 1,000,000-entry LRU list.",
    "explanation": "Because pure LRU places every newly accessed key at the MRU head regardless of frequency, 600,000 cold scan keys evict 600,000 / 1,000,000 = 60% of the hot working set.",
    "tags": [
      "cache-eviction-policies",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "cache-eviction-policies-t1",
    "topic": "cache-eviction-policies",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Pure LRU vs W-TinyLFU / Segmented LRU (SLRU)",
    "scenario": "Your cache serves a mix of power-law hot keys and periodic large pagination/analytics scans that currently cause hit-rate cliffs every hour under standard LRU.",
    "prompt": "Which eviction policy prevents scan pollution while adapting to shifting traffic popularity, and why?",
    "question": "Which eviction policy prevents scan pollution while adapting to shifting traffic popularity, and why?",
    "options": [
      "FIFO (First-In, First-Out) eviction",
      "Unbounded pure LFU without aging or decay",
      "W-TinyLFU (or Segmented LRU / 2Q) using a small window cache plus a Count-Min Sketch frequency admission filter and periodic counter halving"
    ],
    "correctOption": 2,
    "reasons": [
      "FIFO protects frequently accessed items from one-time scans",
      "Unbounded LFU never retains old viral keys after their traffic drops to zero",
      "An admission filter (TinyLFU) rejects one-hit scan wonders before they evict hot main-cache items, while periodic counter decay ages out formerly popular keys"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why do both pure LRU (scan pollution) and pure LFU (stale frequency accumulation) fail in production?",
    "explanation": "W-TinyLFU combines recency (a small 1% window LRU for bursts) with decayed frequency admission (Count-Min Sketch), preventing one-hit sequential scans from evicting high-frequency working-set keys.",
    "tags": [
      "cache-eviction-policies",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["ttl-expiration-and-cache-reapers"] = [
  {
    "id": "ttl-expiration-and-cache-reapers-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Expired but resident",
    "section": "Mechanics",
    "prompt": "Millions of keys in a cache passed their TTL an hour ago, yet memory usage has barely dropped. Reads for those keys correctly return misses. What explains this?",
    "options": [
      "The TTLs were never applied, so the keys are still valid",
      "Expiry is enforced lazily on access plus bounded background sampling, so untouched expired keys can stay in memory for a while",
      "The cache frees memory only when the process restarts",
      "Replicas are holding the keys and replicating them back to the primary"
    ],
    "answer": 1,
    "explanation": "A TTL promises the value will not be returned after the deadline, not that memory is freed then; lazy checks and a CPU-bounded sampler reclaim it gradually. Correct misses on read show the TTLs are working, which rules out the idea that they were never applied.",
    "tags": [
      "ttl-expiration-and-cache-reapers",
      "recall",
      "inline"
    ]
  },
  {
    "id": "ttl-expiration-and-cache-reapers-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Jittering expirations",
    "section": "Worked example: jittering a session TTL",
    "prompt": "3M sessions are written between 08:00 and 08:10 with a fixed 8-hour TTL. If you add uniform jitter of plus or minus 45 minutes, roughly what is the peak expiration rate at around 16:00?",
    "options": [
      "About 5,000 per second, unchanged, because jitter does not change how many keys expire",
      "About 50 per second",
      "About 2,500 per second",
      "About 500 per second"
    ],
    "answer": 3,
    "explanation": "Without jitter, 3M expirations land in 10 minutes, about 5,000 per second; jitter spreads them over roughly 100 minutes, about 500 per second. The total number of expirations is the same, but the rate, which is what hurts the backend, drops about tenfold.",
    "tags": [
      "ttl-expiration-and-cache-reapers",
      "apply",
      "inline"
    ]
  },
  {
    "id": "ttl-expiration-and-cache-reapers-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "DynamoDB TTL is lazy",
    "section": "Other systems",
    "prompt": "Single-use coupons are stored in DynamoDB with a TTL attribute set to their expiry time. Customers occasionally redeem coupons that expired hours earlier. What is the right fix?",
    "options": [
      "Make every read and redemption check the expiry attribute, because TTL deletion runs in the background and can lag by days",
      "Shorten the TTL by a few hours to compensate for deletion delay",
      "Switch to strongly consistent reads so expired items are hidden",
      "Enable a DynamoDB Stream so deletes are propagated faster"
    ],
    "answer": 0,
    "explanation": "DynamoDB TTL deletes expired items in the background, typically within a few days, so queries must filter on the expiry attribute themselves. Strongly consistent reads still return the item until it is actually deleted, and shrinking the TTL only guesses at an unbounded delay.",
    "tags": [
      "ttl-expiration-and-cache-reapers",
      "staff",
      "inline"
    ]
  },
  {
    "id": "ttl-expiration-and-cache-reapers-n1",
    "topic": "ttl-expiration-and-cache-reapers",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Synchronized TTL Expiration Storm",
    "scenario": "At midnight, a warming job preloads 300,000 catalog keys into Redis with an exact `EXPIRE 3600` (1 hour). If you add uniform random jitter of ±5 minutes (a 600-second window around the 1-hour mark), expirations spread evenly across 600 seconds.",
    "prompt": "What is the average expiration rate (in keys/sec) across the 600-second jitter window instead of a 300,000-key instant spike?",
    "question": "What is the average expiration rate (in keys/sec) across the 600-second jitter window instead of a 300,000-key instant spike?",
    "unit": "keys/s",
    "answer": 500,
    "tolerance": 0.2,
    "hint": "Divide 300,000 keys by the 600-second jitter window.",
    "explanation": "Spreading 300,000 expirations uniformly across a 600-second (±5 min) jitter window smooths the reload load to 300,000 / 600 = 500 keys/sec instead of a 300,000-key vertical cliff.",
    "tags": [
      "ttl-expiration-and-cache-reapers",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "ttl-expiration-and-cache-reapers-t1",
    "topic": "ttl-expiration-and-cache-reapers",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Passive Lazy Expiration vs Active Probabilistic Reaper",
    "scenario": "A cache stores 50M temporary session keys with a 15-minute TTL, and 80% of users never return after their first request.",
    "prompt": "Why must a production cache combine lazy read-time expiration with an active background reaper, and how should the reaper work?",
    "question": "Why must a production cache combine lazy read-time expiration with an active background reaper, and how should the reaper work?",
    "options": [
      "Use only lazy expiration on `GET` so unvisited expired keys stay in RAM forever",
      "Scan all 50M keys on the main thread every 100 ms to find expired keys",
      "Combine lazy expiration on read (`GET`) with bounded active probabilistic sampling (e.g., Redis sampling 20 random volatile keys per 100 ms cycle and repeating if >25% are expired)"
    ],
    "correctOption": 2,
    "reasons": [
      "Never-read expired keys automatically free their memory without a background reaper",
      "Full 50M-key scans every 100 ms keep single-threaded tail latency low",
      "Lazy expiration ensures zero stale reads at O(1) cost, while bounded random sampling reclaims memory from write-once-never-read keys without blocking the event loop"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens to the 80% of session keys that are never `GET` again if you only expire on read?",
    "explanation": "Lazy expiration alone leaks memory for keys that are never read again, while full keyspace scans stall the cache. Probabilistic active sampling bounds CPU time while keeping expired waste below ~25%.",
    "tags": [
      "ttl-expiration-and-cache-reapers",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["cache-concurrency-control"] = [
  {
    "id": "cache-concurrency-control-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Scope of singleflight",
    "section": "Mechanics",
    "prompt": "A team wraps cache rebuilds in Go's singleflight and expects exactly one database load per expiring key. The service runs on 200 servers. What actually happens?",
    "options": [
      "Exactly one load cluster-wide, because singleflight coordinates through the cache",
      "Zero loads, because singleflight serves the previous value until refresh",
      "Up to one load per server, so as many as 200 concurrent loads for the key",
      "One load per request, because singleflight only works for writes"
    ],
    "answer": 2,
    "explanation": "Singleflight coalesces duplicate work inside one process only; cross-process deduplication needs a lock, lease or refresh owner. It does not serve stale values on its own, which is stale-while-revalidate, a separate technique.",
    "tags": [
      "cache-concurrency-control",
      "recall",
      "inline"
    ]
  },
  {
    "id": "cache-concurrency-control-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Counting concurrent loads",
    "section": "Worked example: one hot key, 10,000 readers",
    "prompt": "A key receives 5,000 reads/s across 40 app servers and takes 300 ms to rebuild. With per-process singleflight but no distributed coordination, roughly how many concurrent database loads happen when it expires?",
    "options": [
      "About 40",
      "About 1,500",
      "About 300",
      "Exactly 1"
    ],
    "answer": 0,
    "explanation": "Unprotected, the 300 ms window would see about 5,000 x 0.3 = 1,500 identical loads; singleflight collapses that to one per server, so about 40. Getting to one load cluster-wide needs a distributed lock or lease.",
    "tags": [
      "cache-concurrency-control",
      "apply",
      "inline"
    ]
  },
  {
    "id": "cache-concurrency-control-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Stopping the stale set",
    "section": "The stale-set race and leases",
    "prompt": "A reader misses, loads v1 from the database, a writer updates the row to v2 and deletes the key, and then the reader sets v1. The cache now serves stale data indefinitely. Which mechanism prevents this?",
    "options": [
      "A distributed rebuild lock with a TTL, so only one reader repopulates the key",
      "Probabilistic early refresh, so the key never expires under load",
      "Per-process singleflight around the database read",
      "Memcache-style leases, where the delete invalidates the reader's token so its late set is rejected"
    ],
    "answer": 3,
    "explanation": "A lease issued on the miss is invalidated by the writer's delete, so the late set of v1 fails. A rebuild lock stops the stampede but not this race, because the single lock holder can still be the reader holding v1.",
    "tags": [
      "cache-concurrency-control",
      "staff",
      "inline"
    ]
  },
  {
    "id": "cache-concurrency-control-n1",
    "topic": "cache-concurrency-control",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Cache Stampede In-Flight Database Concurrency",
    "scenario": "A cached homepage payload expires at t = 0 while receiving 4,000 req/s. Recomputing the payload in the database takes 250 ms (0.25 seconds), and no singleflight / request coalescing lock is used.",
    "prompt": "How many duplicate database recomputation queries execute concurrently during that 250 ms cache-miss window?",
    "question": "How many duplicate database recomputation queries execute concurrently during that 250 ms cache-miss window?",
    "unit": "queries",
    "answer": 1000,
    "tolerance": 0.25,
    "hint": "Apply Little's Law: L = λ × W = 4,000 req/s × 0.25 s.",
    "explanation": "Before the first request finishes its 250 ms database query and repopulates the cache, 4,000 req/s × 0.25 s = 1,000 concurrent requests observe a cache miss and stampede the database with identical expensive queries.",
    "tags": [
      "cache-concurrency-control",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "cache-concurrency-control-t1",
    "topic": "cache-concurrency-control",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Cache-Aside Delete vs Write-Through on Concurrent Updates",
    "scenario": "Thread A misses the cache and reads `v1` from the DB. Before Thread A writes `v1` into Redis, Thread B updates the DB to `v2` and deletes the cache key. Thread A then finishes and writes stale `v1` into Redis with a 1-hour TTL.",
    "prompt": "Which concurrency control mechanism prevents this permanent stale-cache race without serializing all reads behind distributed locks?",
    "question": "Which concurrency control mechanism prevents this permanent stale-cache race without serializing all reads behind distributed locks?",
    "options": [
      "Have writers update the cache before updating the database",
      "Use versioned/CAS cache writes (e.g., storing the DB `version` or `xmin`/LSN and rejecting cache writes whose version is older than the current entry or tombstone lease token)",
      "Increase the cache TTL from 1 hour to 24 hours"
    ],
    "correctOption": 1,
    "reasons": [
      "Updating cache before DB guarantees consistency when the DB transaction subsequently rolls back",
      "Monotonic version comparison (or leased cache-miss tokens as in Meta's Memcached `gets/cas`) ensures a delayed reader cannot overwrite a newer mutation or active invalidation tombstone",
      "Longer TTLs automatically resolve race conditions between concurrent readers and writers"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "How did Facebook's 'Scaling Memcache at Facebook' paper solve the stale-set race using leases/CAS?",
    "explanation": "Issuing a lease token on cache miss (which is invalidated when a delete occurs) or comparing monotonic row version numbers via Redis Lua / Memcached `cas` prevents a slow reader from overwriting newer data with `v1`.",
    "tags": [
      "cache-concurrency-control",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["cache-availability-and-database-fallback"] = [
  {
    "id": "cache-availability-and-database-fallback-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Soft vs hard TTL",
    "section": "Mechanics",
    "prompt": "During a cache outage, app servers serve stale values from an in-process L1. In this design, what does the hard TTL represent?",
    "options": [
      "The time after which a background refresh is triggered",
      "The product-defined limit beyond which stale data must no longer be served",
      "The timeout for each call to the remote cache",
      "The maximum time an entry can stay in memory before eviction for space"
    ],
    "answer": 1,
    "explanation": "The soft TTL starts a refresh, while the hard TTL is the maximum staleness the product permits; after it, the request must go to a limited fallback, degrade or be rejected. Triggering the refresh is the soft TTL's job, the most commonly confused of the two.",
    "tags": [
      "cache-availability-and-database-fallback",
      "recall",
      "inline"
    ]
  },
  {
    "id": "cache-availability-and-database-fallback-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Setting the limiter",
    "section": "Worked example: sizing the fallback",
    "prompt": "A cache normally absorbs 99 percent of 80,000 reads/s. Load tests show the database's p99 degrades above 2,000 qps and it saturates at 3,000. There are 80 app instances. Which per-instance fallback limit fits the lesson's approach?",
    "options": [
      "1,000 qps per instance, so every request can still reach the database",
      "40 qps per instance, matching the 3,200 qps the database can take in a burst",
      "No limit, but a 2-second timeout on database calls",
      "20 qps per instance, about 1,600 qps total, below the 2,000 qps knee"
    ],
    "answer": 3,
    "explanation": "The limiter should be sized from measured capacity with headroom, here below where latency degrades, so 80 x 20 = 1,600 qps. 40 per instance gives 3,200 qps, above saturation, and the lesson warns that long timeouts without a limit just tie up workers.",
    "tags": [
      "cache-availability-and-database-fallback",
      "apply",
      "inline"
    ]
  },
  {
    "id": "cache-availability-and-database-fallback-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Coming back empty",
    "section": "Recovery",
    "prompt": "After a 20-minute outage the cache cluster is healthy again but empty. An on-call engineer proposes removing the fallback limiter and sending 100 percent of traffic back immediately. What is the risk and the better approach?",
    "options": [
      "A second miss storm while the hit ratio climbs from zero; keep the limiter on, pre-warm top keys and shift traffic back in steps",
      "No real risk, because the cache refills within a second at 80,000 reads/s",
      "Stale data from before the outage will be served; flush the database buffer pool first",
      "Clients will get MOVED redirects; restart all app servers to refresh their slot maps"
    ],
    "answer": 0,
    "explanation": "An empty cache has a 0 percent hit ratio, so the database briefly sees the full outage load again; the lesson keeps the limiter on during warm-up, pre-warms hot keys and ramps traffic in steps. The cache does not refill instantly, because every miss must first be served by the capacity-limited database.",
    "tags": [
      "cache-availability-and-database-fallback",
      "staff",
      "inline"
    ]
  },
  {
    "id": "cache-availability-and-database-fallback-n1",
    "topic": "cache-availability-and-database-fallback",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Database Load Surge on Cache Cluster Outage",
    "scenario": "Your caching tier serves 80,000 req/s at a 95% cache hit rate, leaving 4,000 req/s hitting the database. Your database cluster is provisioned for a maximum of 8,000 req/s.",
    "prompt": "If the cache cluster fails completely and all 80,000 req/s fall back directly to the database, by what factor (multiplier) does the incoming load exceed the database's 8,000 req/s maximum capacity?",
    "question": "If the cache cluster fails completely and all 80,000 req/s fall back directly to the database, by what factor (multiplier) does the incoming load exceed the database's 8,000 req/s maximum capacity?",
    "unit": "x",
    "answer": 10,
    "tolerance": 0.25,
    "hint": "Divide total fallback traffic (80,000 req/s) by maximum database capacity (8,000 req/s).",
    "explanation": "80,000 req/s ÷ 8,000 req/s = 10x over capacity (and a 20x jump from the normal 4,000 req/s DB load). Without load shedding or circuit breaking on the DB fallback path, a cache outage triggers immediate database collapse.",
    "tags": [
      "cache-availability-and-database-fallback",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "cache-availability-and-database-fallback-t1",
    "topic": "cache-availability-and-database-fallback",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Protecting the Origin Database During a Cold-Cache Restart",
    "scenario": "After a regional power event, your Redis cluster restarts completely empty while user traffic is at 80,000 req/s and the database can only sustain 8,000 req/s.",
    "prompt": "Which recovery and fallback strategy prevents the database from crashing during cache warm-up, and why?",
    "question": "Which recovery and fallback strategy prevents the database from crashing during cache warm-up, and why?",
    "options": [
      "Route 100% of cache misses directly to the database so the cache warms up as fast as possible",
      "Enforce a strict concurrency/token-bucket rate limiter on the DB fallback path (capping DB queries at <8,000 req/s), coalesce duplicate misses via singleflight, and serve degraded/stale responses for shed misses while warming the cache",
      "Block all traffic at the load balancer until a single-threaded script sequentially loads 500M rows into Redis"
    ],
    "correctOption": 1,
    "reasons": [
      "Sending 10x over-capacity traffic to the DB warms the cache without exhausting DB connection pools",
      "Rate-limiting the cache-miss fallback path protects DB survival while allowing up to 8,000 unique keys/sec to populate the cache organically",
      "Multi-hour total site downtime is preferable to serving degraded fallback responses"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "The database must never receive more than its 8,000 req/s ceiling, even when the cache hit rate is 0%.",
    "explanation": "When a high-hit-rate cache goes cold, the cache acts as a load-bearing component. Capping DB fallback concurrency via a circuit breaker / token bucket at <8,000 req/s lets successful queries warm the hot working set within seconds without crashing the DB.",
    "tags": [
      "cache-availability-and-database-fallback",
      "tradeoff",
      "staff"
    ]
  }
];
