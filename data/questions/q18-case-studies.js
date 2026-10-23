window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["case-instagram-early-architecture"] = [
  {
    "id": "case-instagram-early-architecture-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Routing by photo ID",
    "section": "Case: Instagram's First Architecture",
    "prompt": "Instagram's 64-bit photo IDs embed a 13-bit logical shard number. Given a photo ID, how does the application find the PostgreSQL server that holds the photo?",
    "options": [
      "It hashes the full ID modulo the number of physical servers",
      "It looks the ID up in a per-photo location table in a central database",
      "It extracts the logical shard bits, then consults a small logical-to-physical map",
      "It reads the physical server address directly from the ID's middle bits"
    ],
    "answer": 2,
    "explanation": "The ID yields only the logical shard; a small map from thousands of logical shards to a few physical servers completes routing, and that indirection is what allows shards to move. Assuming the ID encodes the server itself is the trap, since then no shard could ever be relocated.",
    "tags": [
      "case-instagram-early-architecture",
      "recall",
      "inline"
    ]
  },
  {
    "id": "case-instagram-early-architecture-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sequence bits",
    "section": "Worked example: building and decoding an Instagram ID",
    "prompt": "While generating an ID, a shard's sequence returns 2050. What value goes into the low 10 bits, and what limit does this imply?",
    "options": [
      "2050, and each shard can issue 2,050 IDs per millisecond",
      "2, and each shard can issue 1,024 IDs per millisecond",
      "1026, and each shard can issue 8,192 IDs per millisecond",
      "1024, and each shard can issue one ID per microsecond"
    ],
    "answer": 1,
    "explanation": "10 bits hold values 0 to 1023, so the sequence is taken modulo 1024: 2050 mod 1024 = 2. Within one millisecond a shard therefore has 1,024 distinct IDs. 8,192 is the number of logical shards from the 13 shard bits, not a per-millisecond limit.",
    "tags": [
      "case-instagram-early-architecture",
      "apply",
      "inline"
    ]
  },
  {
    "id": "case-instagram-early-architecture-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Rebalancing a hot server",
    "section": "Why logical shards matter",
    "prompt": "One physical PostgreSQL server hosting 2,000 logical shards is overloaded. How did Instagram's design let them relieve it without touching any existing IDs?",
    "options": [
      "Move some shard schemas to a new server, for example by promoting a replica, then update the map",
      "Change the hash function so new IDs spread across more servers",
      "Split each logical shard in two and rewrite the shard bits of affected IDs",
      "Add a Redis cache in front so reads for the hot shards skip the database"
    ],
    "answer": 0,
    "explanation": "Because there are many more logical shards than servers, whole schemas can be relocated and only the logical-to-physical map changes; no ID is re-hashed or rewritten. Rewriting shard bits is exactly the costly re-keying this design was built to avoid.",
    "tags": [
      "case-instagram-early-architecture",
      "staff",
      "inline"
    ]
  },
  {
    "id": "case-instagram-early-architecture-n1",
    "topic": "case-instagram-early-architecture",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Instagram PG Shard-Embedded 64-Bit ID Bit Allocation",
    "scenario": "Instagram's famous PL/pgSQL ID generator packed a 64-bit integer with `41 bits` for millisecond timestamp (since custom epoch), `13 bits` for logical PostgreSQL shard ID, and `10 bits` for the per-shard auto-increment sequence modulus.",
    "prompt": "How many distinct logical shards (`2^13`) could Instagram address directly from the 13-bit shard field embedded inside every 64-bit ID?",
    "question": "How many distinct logical shards (`2^13`) could Instagram address directly from the 13-bit shard field embedded inside every 64-bit ID?",
    "unit": "shards",
    "answer": 8192,
    "tolerance": 0.2,
    "hint": "Compute `2^13`.",
    "explanation": "`2^13 = 8,192` logical PostgreSQL schemas/shards mapped across physical DB servers, allowing any application server to route a lookup for `photo_id` directly to its owning shard via `(photo_id >> 10) & 0x1FFF` with zero external directory lookups!",
    "tags": [
      "case-instagram-early-architecture",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "case-instagram-early-architecture-t1",
    "topic": "case-instagram-early-architecture",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Logical Schemas-Per-Shard Inside Fewer Physical PostgreSQL Nodes vs Re-Sharding Data Later",
    "scenario": "With only 3 engineers and explosive user growth, early Instagram needed to shard PostgreSQL without building a complex dynamic tablet-splitting engine or running a separate ID-generation fleet.",
    "prompt": "Why did Instagram create thousands of logical PostgreSQL schemas (`2^13 = 8,192` logical shards) across a small number of physical EC2 instances on day one?",
    "question": "Why did Instagram create thousands of logical PostgreSQL schemas (`2^13 = 8,192` logical shards) across a small number of physical EC2 instances on day one?",
    "options": [
      "PostgreSQL runs faster when 8,192 empty schemas exist on a single laptop",
      "They wanted to rewrite every row's primary key whenever they added a new database server",
      "Pre-allocating thousands of logical shards (PostgreSQL schemas) decouples logical partitioning from physical hardware: scaling out to new DB servers only requires moving whole logical schemas via streaming replication + pgbouncer config swap with zero key hashing changes or application code rewrites"
    ],
    "correctOption": 2,
    "reasons": [
      "Re-hashing and migrating half of every table row-by-row during an outage is trivial for a 3-person team",
      "Embedding the physical IP address in the 64-bit ID makes server replacement easy",
      "When the logical shard ID (`0..8191`) is baked into the 64-bit primary key, logical shard count can never change easily; starting with 8,192 logical schemas lets you rebalance whole schemas across physical hosts with zero downtime"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "If the shard ID is permanently embedded in every photo's 64-bit ID, how can you add physical database servers later without changing existing IDs?",
    "explanation": "Because the 13-bit shard ID was immutable once minted inside a photo ID, mapping `user_id -> logical_shard (0..8191)` and `logical_shard -> physical_db_host` via PgBouncer meant scaling physical hardware only moved whole PostgreSQL schemas.",
    "tags": [
      "case-instagram-early-architecture",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["case-stripe-idempotency-keys"] = [
  {
    "id": "case-stripe-idempotency-keys-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Replaying an error",
    "section": "Every case the server must handle",
    "prompt": "A charge request with key k-12 finished with a 402 card_declined response. The client retries with the same key and the same parameters. What should the server return?",
    "options": [
      "Re-run the charge, since the first attempt did not succeed",
      "A 409 Conflict, since the key was already used once",
      "A 400 error, since the key is being misused after a failure",
      "The stored 402 response, replayed exactly as before"
    ],
    "answer": 3,
    "explanation": "A finished key with identical parameters replays the stored status and body, even when that result was an error; a new attempt needs a new key. 409 is reserved for a key that is still in progress, which is the tempting mix-up.",
    "tags": [
      "case-stripe-idempotency-keys",
      "apply",
      "inline"
    ]
  },
  {
    "id": "case-stripe-idempotency-keys-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Crash mid-request",
    "section": "Designing the recovery points",
    "prompt": "The server records recovery points started, charge_created and finished. It crashes after committing charge_created but before finishing. What makes the retry with the same key safe?",
    "options": [
      "The retry resumes from charge_created, and the processor call uses a stable idempotent reference",
      "The retry starts over from started, because partial work is rolled back",
      "The retry returns 409 until an operator marks the key as finished",
      "The retry is treated as a new key, since the old one never finished"
    ],
    "answer": 0,
    "explanation": "Each local phase commits atomically with its recovery point, so the retry picks up at charge_created; foreign calls between phases carry a stable reference, so re-executing them cannot double-charge. Starting over from scratch is dangerous, because the external charge may already exist.",
    "tags": [
      "case-stripe-idempotency-keys",
      "staff",
      "inline"
    ]
  },
  {
    "id": "case-stripe-idempotency-keys-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "When to create the key",
    "section": "Client-side rules",
    "prompt": "A mobile app retries charge requests on timeout. When should it generate and store the idempotency key?",
    "options": [
      "Fresh for each HTTP attempt, so every retry is uniquely traceable",
      "Once per app session, reused for every charge in that session",
      "Once per intended charge, persisted before the first request is sent",
      "Only after a timeout, so the first attempt needs no key at all"
    ],
    "answer": 2,
    "explanation": "The key names one intended operation, so every retry of that charge must carry it, and persisting it first means an app restart still retries with the same key. A fresh key per attempt is the classic trap: each retry then looks like a new charge.",
    "tags": [
      "case-stripe-idempotency-keys",
      "recall",
      "inline"
    ]
  },
  {
    "id": "case-stripe-idempotency-keys-n1",
    "topic": "case-stripe-idempotency-keys",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Idempotency Key Table Storage Footprint (24-Hour Retention)",
    "scenario": "A Stripe-like payment API processes 5,000 mutating POST requests per second (`5,000 × 86,400 = 432,000,000` requests/day, or using 100,000 s/day napkin math = 500,000,000 requests/day). Each idempotency record (key, request fingerprint, status, cached HTTP response, indexes) occupies 1 KB and is retained for 24 hours.",
    "prompt": "Using 500,000,000 requests/day × 1 KB/record, how many gigabytes (GB, using 1 GB = 1,000,000 KB) of active storage does the 24-hour idempotency key table require?",
    "question": "Using 500,000,000 requests/day × 1 KB/record, how many gigabytes (GB, using 1 GB = 1,000,000 KB) of active storage does the 24-hour idempotency key table require?",
    "unit": "GB",
    "answer": 500,
    "tolerance": 0.25,
    "hint": "500,000,000 records × 1 KB ÷ 1,000,000 KB/GB = 500 GB (or 432 GB using exact 86,400 s/day).",
    "explanation": "At 5,000 mutating req/s (~432M–500M requests/day) and 1 KB per cached response envelope, a 24-hour rolling idempotency window requires ~432–500 GB of fast storage, after which keys are pruned via background reaper/partition drop.",
    "tags": [
      "case-stripe-idempotency-keys",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "case-stripe-idempotency-keys-t1",
    "topic": "case-stripe-idempotency-keys",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Atomic Recovery Points vs Replay of Mismatched Request Payloads",
    "scenario": "A buggy merchant integration generates a single `Idempotency-Key` at app startup and accidentally reuses that same key for two different customers' checkout requests (`$10.00 for Alice`, then `$250.00 for Bob`). Later, a third request fails mid-way at a recoverable network error.",
    "prompt": "How does Stripe's Atomic Phase / Recovery Point architecture handle parameter mismatches and partial failures on an `Idempotency-Key`?",
    "question": "How does Stripe's Atomic Phase / Recovery Point architecture handle parameter mismatches and partial failures on an `Idempotency-Key`?",
    "options": [
      "Silently return Alice's `$10.00` HTTP 200 receipt to Bob's `$250.00` request without checking the request body",
      "Store a cryptographic hash of the request parameters alongside the `Idempotency-Key` (returning `422/400 Parameter Mismatch` if a retry changes the payload), and checkpoint deterministic recovery points after each local ACID transaction phase so retries resume from the last committed phase",
      "Delete the idempotency key whenever any downstream call returns a 500 error so the next retry starts from scratch even if the card was already charged"
    ],
    "correctOption": 1,
    "reasons": [
      "Returning Customer A's payment receipt for Customer B's order prevents bugs",
      "Validating the request payload fingerprint catches accidental key reuse across distinct operations immediately, while transactional recovery points ensure multi-step mutations resume deterministically without repeating completed side effects",
      "Deleting idempotency state after an ambiguous network error guarantees at-most-once execution"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What should happen if a client sends the same `Idempotency-Key` with different request parameters?",
    "explanation": "Comparing a hash of the incoming request body against the stored fingerprint prevents silent corruption when a client reuses an idempotency key across different payloads. Recording atomic recovery points in the same ACID transaction as local state transitions allows safe resumption or replay.",
    "tags": [
      "case-stripe-idempotency-keys",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["case-discord-message-storage"] = [
  {
    "id": "case-discord-message-storage-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Buckets and hot channels",
    "section": "Case: How Discord Stores Trillions of Messages",
    "prompt": "Discord's partition key is (channel_id, bucket) with roughly 10-day buckets. A channel suddenly goes viral. What does bucketing do for its write load?",
    "options": [
      "It spreads the viral channel's writes evenly across every node",
      "It caps writes per bucket, so excess messages overflow to a new bucket",
      "It bounds partition size over time, but the current bucket stays on one replica set",
      "It routes the viral channel to dedicated ScyllaDB shards automatically"
    ],
    "answer": 2,
    "explanation": "Buckets stop a channel's lifetime history becoming one unbounded partition, but every write in the current window still hits the same partition's replicas. Believing buckets spread hot traffic is the trap the lesson names explicitly.",
    "tags": [
      "case-discord-message-storage",
      "recall",
      "inline"
    ]
  },
  {
    "id": "case-discord-message-storage-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing a bucket",
    "section": "Worked example: why buckets bound partitions",
    "prompt": "A channel receives 600 messages per minute of about 1 KB each. Roughly how large is one 10-day bucket, and how large would an unbucketed year be?",
    "options": [
      "About 860 MB per bucket and about 31 GB per year",
      "About 8.6 GB per bucket and about 315 GB per year",
      "About 86 GB per bucket and about 3.1 TB per year",
      "About 8.6 GB per bucket and about 86 GB per year"
    ],
    "answer": 1,
    "explanation": "600 x 1,440 minutes x 10 days is about 8.6 million messages, roughly 8.6 GB per bucket, while a year is about 315 million messages or 315 GB in one partition. The last option mistakes the yearly total for ten buckets instead of about 36.",
    "tags": [
      "case-discord-message-storage",
      "apply",
      "inline"
    ]
  },
  {
    "id": "case-discord-message-storage-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Why route by channel",
    "section": "Request coalescing in the data services",
    "prompt": "Discord's data services coalesce identical in-flight queries. Why must requests be routed to instances by channel ID rather than spread by a round-robin load balancer?",
    "options": [
      "Round-robin cannot keep the long-lived connections the data services need",
      "Channel routing lets each instance cache whole channels in memory indefinitely",
      "Channel routing is required for ScyllaDB's shard-per-core model to work",
      "Identical requests can only merge if they reach the same instance at the same moment"
    ],
    "answer": 3,
    "explanation": "Coalescing merges queries that are simultaneously in flight within one process, so 100,000 requests for channel 42 must converge on one instance to become a handful of database reads. Caching is the tempting answer, but the lesson stresses these services shape traffic and are not a cache.",
    "tags": [
      "case-discord-message-storage",
      "staff",
      "inline"
    ]
  },
  {
    "id": "case-discord-message-storage-n1",
    "topic": "case-discord-message-storage",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Request Coalescing Amplification on Hot Discord Channels",
    "scenario": "In Discord's migration from Cassandra to ScyllaDB with a Rust data-service intermediary, a popular announcement channel has 1,000 users open the channel in the same 20 ms window. Without coalescing, all 1,000 requests query the database for `(channel_id, bucket)`. With the Rust data service coalescing concurrent in-flight reads for the same `(channel_id, bucket)`, only 1 query hits ScyllaDB.",
    "prompt": "By what factor (`1,000 ÷ 1`) does singleflight request coalescing reduce database read QPS for that 20 ms burst on the hot channel?",
    "question": "By what factor (`1,000 ÷ 1`) does singleflight request coalescing reduce database read QPS for that 20 ms burst on the hot channel?",
    "unit": "x",
    "answer": 1000,
    "tolerance": 0.25,
    "hint": "1,000 concurrent requests collapsed into 1 database query = 1,000x reduction.",
    "explanation": "When an `@everyone` ping triggers 1,000 simultaneous channel history reads within a 20 ms window, routing by `channel_id` to a single Rust service instance that coalesces identical in-flight queries collapses 1,000 DB reads into 1 DB read (a 1,000x reduction on the hot partition).",
    "tags": [
      "case-discord-message-storage",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "case-discord-message-storage-t1",
    "topic": "case-discord-message-storage",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Why Discord's `(channel_id, bucket)` Partition Key Still Suffered Hot Partitions in Cassandra",
    "scenario": "Discord partitioned messages by `(channel_id, time_bucket)` so partitions wouldn't grow unboundedly. Yet large servers still caused 10-second latency spikes in Cassandra when a single channel received a burst of reads alongside background compactions and JVM GC pauses.",
    "prompt": "What combination of architectural changes resolved Discord's hot-partition tail latency when migrating from Cassandra to ScyllaDB?",
    "question": "What combination of architectural changes resolved Discord's hot-partition tail latency when migrating from Cassandra to ScyllaDB?",
    "options": [
      "Remove `channel_id` from the partition key and shard randomly by `message_id`",
      "Introduce a consistent-hashed Rust data-service layer in front of the DB to coalesce concurrent identical `(channel_id, bucket)` reads (singleflight), and migrate storage from JVM-based Cassandra to C++ shard-per-core ScyllaDB to eliminate JVM stop-the-world GC pauses",
      "Move trillions of chat messages into a single unsharded SQLite file"
    ],
    "correctOption": 1,
    "reasons": [
      "Sharding by random `message_id` makes fetching a channel's last 50 messages a fast single-node query",
      "`(channel_id, bucket)` bounds partition size on disk but still concentrates concurrent live reads on one replica set; coalescing duplicate reads in the Rust proxy eliminated hot-channel read amplification while ScyllaDB eliminated JVM GC stalls",
      "A single SQLite file easily stores trillions of messages at millions of QPS"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Time-bucketing bounds *storage size* per partition, but what bounds *concurrent read QPS* when 50,000 users open the same channel at once?",
    "explanation": "Time-bucketing `(channel_id, bucket)` stops partitions from growing forever on disk, but all current activity in a hot channel still hits the current time bucket! Consistent-routing requests by `channel_id` through a Rust proxy that deduplicates concurrent in-flight reads, paired with GC-free ScyllaDB, solved both hot-partition amplification and GC tail latency.",
    "tags": [
      "case-discord-message-storage",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["case-amazon-dynamo"] = [
  {
    "id": "case-amazon-dynamo-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Permanent failure repair",
    "section": "The paper's problem-technique table, restated",
    "prompt": "A Dynamo replica was down for a long time and has missed many writes. Which technique does the paper use to bring it back in sync in the background?",
    "options": [
      "Hinted handoff from fallback nodes",
      "Anti-entropy using Merkle trees",
      "Vector clock reconciliation on read",
      "Gossip-based membership detection"
    ],
    "answer": 1,
    "explanation": "Merkle trees let replicas compare key ranges cheaply and exchange only the parts that differ, which is how Dynamo recovers from permanent failures. Hinted handoff is the tempting pick, but it covers temporary failures, delivering writes that a fallback node held on the replica's behalf.",
    "tags": [
      "case-amazon-dynamo",
      "recall",
      "inline"
    ]
  },
  {
    "id": "case-amazon-dynamo-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Concurrent or descended",
    "section": "Worked example: vector clocks from the paper",
    "prompt": "A read returns two versions of a cart: A with clock [Sx:3, Sy:1] and B with clock [Sx:2, Sy:1, Sz:1]. What should the client conclude?",
    "options": [
      "A supersedes B, because A has the higher Sx counter",
      "B supersedes A, because B has entries from more nodes",
      "They are concurrent, so the client must merge them",
      "They are identical, because both include Sx and Sy"
    ],
    "answer": 2,
    "explanation": "A version descends from another only if every counter is greater or equal; A is ahead on Sx but has no Sz entry, while B has Sz:1, so neither dominates. Picking the higher Sx counter is last-writer thinking and would silently drop B's changes.",
    "tags": [
      "case-amazon-dynamo",
      "apply",
      "inline"
    ]
  },
  {
    "id": "case-amazon-dynamo-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Quorums under sloppy quorum",
    "section": "Worked example: quorum settings",
    "prompt": "With N = 3, R = 2 and W = 2, a partition cuts off two of a key's preferred replicas, and a write is accepted by fallback nodes. A later read from two preferred replicas misses it. Why is this possible despite R + W exceeding N?",
    "options": [
      "Vector clocks discard the newer version when two replicas disagree",
      "R + W must exceed 2N for the overlap guarantee to hold",
      "Consistent hashing moved the key to a different ring position",
      "The write landed on nodes outside the preference list, so read and write sets need not overlap"
    ],
    "answer": 3,
    "explanation": "Overlap only holds for a fixed replica set; with a sloppy quorum the write can be satisfied by fallback nodes and handed back later, so the read quorum may contain none of them. Vector clocks never discard concurrent versions; they return them for merging.",
    "tags": [
      "case-amazon-dynamo",
      "staff",
      "inline"
    ]
  },
  {
    "id": "case-amazon-dynamo-n1",
    "topic": "case-amazon-dynamo",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Tunable Sloppy vs Strict Quorum Overlap (`N, R, W`)",
    "scenario": "An Amazon Dynamo ring configures replication factor `N = 3` across preference-list nodes. To guarantee strong read-your-writes overlap under strict quorum (`R + W > N`, so `R + W >= 4`) while optimizing for fast low-latency shopping-cart writes (`W = 2`), you choose the minimum strict read quorum `R`.",
    "prompt": "What is the minimum read quorum `R` required when `N = 3` and `W = 2` so that `R + W > N`?",
    "question": "What is the minimum read quorum `R` required when `N = 3` and `W = 2` so that `R + W > N`?",
    "unit": "replicas",
    "answer": 2,
    "tolerance": 0.2,
    "hint": "We need `R + 2 > 3`, so `R >= 2`.",
    "explanation": "With `N = 3` and `W = 2`, setting `R = 2` gives `R + W = 4 > 3`, guaranteeing by the Pigeonhole Principle that the `R = 2` read set and `W = 2` write set overlap in at least `2 + 2 - 3 = 1` replica.",
    "tags": [
      "case-amazon-dynamo",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "case-amazon-dynamo-t1",
    "topic": "case-amazon-dynamo",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: \"Always-Writable\" Shopping Cart (`Sloppy Quorum + Hinted Handoff + Vector Clocks`) vs Last-Write-Wins (`LWW`)",
    "scenario": "In Amazon's original 2007 Dynamo paper, the primary business invariant was that a customer must *never* be blocked from adding an item to their shopping cart, and an item added to a cart must *never* be silently lost during network partitions or concurrent updates.",
    "prompt": "Why did Dynamo reject Last-Write-Wins (`LWW`) for shopping carts, and how did it resolve concurrent cart writes?",
    "question": "Why did Dynamo reject Last-Write-Wins (`LWW`) for shopping carts, and how did it resolve concurrent cart writes?",
    "options": [
      "Dynamo blocked `AddToCart` whenever 2 of 3 replicas were unreachable during a network partition",
      "Dynamo used physical wall-clock LWW and silently deleted items added on the slower replica",
      "Dynamo accepted writes on any reachable preference-list fallback node (`Sloppy Quorum + Hinted Handoff`), tracked causal branches with Vector Clocks, returned all concurrent sibling cart versions on read, and had the shopping-cart application perform a semantic set-union merge"
    ],
    "correctOption": 2,
    "reasons": [
      "Failing `AddToCart` during a network blip increases e-commerce conversion",
      "Wall-clock LWW preserves both items when two replicas accept concurrent additions to the same cart",
      "Under concurrent partitioned updates (`Cart + Item A` on Node 1 and `Cart + Item B` on Node 2), LWW overwrites one branch and loses an item; retaining sibling versions via Vector Clocks lets the client take their union (`A ∪ B`)"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens if Replica 1 has `[Book A]` and Replica 2 has `[Book B]` and you resolve the conflict with Last-Write-Wins vs Set Union?",
    "explanation": "LWW drops entire concurrent updates. Dynamo used Sloppy Quorums + Hinted Handoff for \"always-writable\" availability, Vector Clocks to detect concurrent sibling branches, and application-level semantic union reconciliation (with the small trade-off that a deleted item could occasionally reappear).",
    "tags": [
      "case-amazon-dynamo",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["case-gitlab-database-incident"] = [
  {
    "id": "case-gitlab-database-incident-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Effective RPO and RTO",
    "section": "Timeline (from GitLab's postmortem, times UTC)",
    "prompt": "The usable snapshot was taken at about 17:20, the deletion happened at about 23:25, and GitLab.com was back online at about 18:00 the next day. What were the effective RPO and RTO?",
    "options": [
      "RPO about 6 hours and RTO about 18.5 hours",
      "RPO about 18.5 hours and RTO about 6 hours",
      "RPO about 6 hours and RTO about 24.5 hours",
      "RPO near zero and RTO about 18.5 hours"
    ],
    "answer": 0,
    "explanation": "Data loss ran from the 17:20 snapshot to the 23:25 deletion, about 6 hours, and downtime ran from the deletion to about 18:00 the next day, about 18.5 hours. The 24.5-hour figure measures from the snapshot rather than from the incident, which confuses the two objectives.",
    "tags": [
      "case-gitlab-database-incident",
      "apply",
      "inline"
    ]
  },
  {
    "id": "case-gitlab-database-incident-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why pg_dump failed silently",
    "section": "What each safety net actually did",
    "prompt": "GitLab's automated pg_dump backups had been failing for some time, yet nobody knew. What combination caused this?",
    "options": [
      "The S3 bucket was full, and the cron job had been disabled",
      "A 9.2 pg_dump ran against a 9.6 server, and failure emails were rejected by DMARC",
      "The dumps were encrypted with a lost key, and alerts went to a former employee",
      "Disk snapshots overwrote the dumps, and monitoring only checked replication lag"
    ],
    "answer": 1,
    "explanation": "The job used an incompatible binary, so every run failed, and the failure notifications were bounced, so the failure was invisible; the empty S3 bucket was a consequence, not the cause. This is why the lesson says to monitor backups as rigorously as production.",
    "tags": [
      "case-gitlab-database-incident",
      "recall",
      "inline"
    ]
  },
  {
    "id": "case-gitlab-database-incident-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "The drill that finds everything",
    "section": "Turning it into practice",
    "prompt": "GitLab had five safety nets that failed in five different ways. Which single practice would most likely have exposed all of those weaknesses before the incident?",
    "options": [
      "Adding a sixth backup mechanism in a different cloud provider",
      "Using different terminal prompt colours for production hosts",
      "Scheduled automated restores to a scratch host with sanity queries, paging on failure",
      "Increasing LVM snapshot frequency from daily to every hour"
    ],
    "answer": 2,
    "explanation": "Restore drills test the outcome that matters, so a failing dump, an empty bucket and slow copy speed would all surface, along with real RTO. Another mechanism is the tempting answer, but GitLab's lesson is that untested mechanisms add a feeling of safety, not recoverability.",
    "tags": [
      "case-gitlab-database-incident",
      "staff",
      "inline"
    ]
  },
  {
    "id": "case-gitlab-database-incident-n1",
    "topic": "case-gitlab-database-incident",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: PostgreSQL WAL Retention Lag During Replication Outage",
    "scenario": "A primary PostgreSQL database generates 50 MB/s of Write-Ahead Log (WAL) traffic during a spam/load surge. A secondary replica disconnects, and WAL archiving/slots retain un-replayed WAL segments on the primary's disk, which only has 180 GB (180,000 MB) of free space.",
    "prompt": "How many minutes (`180,000 MB ÷ 50 MB/s ÷ 60 s/min`) does it take for retained WAL files to completely fill the primary's 180 GB of free disk space?",
    "question": "How many minutes (`180,000 MB ÷ 50 MB/s ÷ 60 s/min`) does it take for retained WAL files to completely fill the primary's 180 GB of free disk space?",
    "unit": "minutes",
    "answer": 60,
    "tolerance": 0.25,
    "hint": "Seconds to fill = 180,000 MB ÷ 50 MB/s = 3,600 seconds. Divide by 60 seconds/minute.",
    "explanation": "`180,000 MB / 50 MB/s = 3,600 seconds = 60 minutes` (1 hour). Conversely, if `max_wal_size` recycles WAL segments before a lagging replica fetches them, the replica falls behind permanently and requires a full multi-terabyte `pg_basebackup` rebuild.",
    "tags": [
      "case-gitlab-database-incident",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "case-gitlab-database-incident-t1",
    "topic": "case-gitlab-database-incident",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Untested Backup Cron Jobs vs Automated Restore Verification & Destructive Command Guardrails",
    "scenario": "In the 2017 GitLab database incident, 5 backup/replication mechanisms failed silently (e.g., `pg_dump` silently skipped due to a version mismatch with 0-byte files and cron stderr redirected to `/dev/null`), and a tired engineer ran `rm -rf` on `db1.cluster` instead of `db2.staging`.",
    "prompt": "Which operational controls directly prevent both failure modes in a Staff-level reliability architecture?",
    "question": "Which operational controls directly prevent both failure modes in a Staff-level reliability architecture?",
    "options": [
      "Write a wiki page reminding engineers to be careful when running `rm -rf` at 11 PM",
      "Automate daily backup-restore verification pipelines (booting an ephemeral instance from backup + WAL and running row-count/checksum assertions with dead-man's-switch alerting) AND enforce environment-tagged CLI/IAM guardrails (immutable production role tags, two-person approval for data directory deletion)",
      "Add 5 more unverified backup scripts that also redirect `stderr` to `/dev/null`"
    ],
    "correctOption": 1,
    "reasons": [
      "Wiki reminders eliminate human fatigue during high-severity midnight outages",
      "A backup only exists if its restore path is continuously tested and alerted on absence (dead-man's switch), and destructive operations must be gated by technical environment guardrails rather than human terminal prompts",
      "Silent `0-byte` backup files provide defense in depth as long as there are many of them"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "'Schrödinger's Backup': the condition of any backup is unknown until you attempt to restore it.",
    "explanation": "The GitLab postmortem proved two timeless SRE laws: (1) unverified backups with silenced alerts rot silently—you must continuously test restores and alert when a restore check fails to report success (dead-man's switch); and (2) destructive prod operations require automated technical guardrails, not human vigilance under sleep deprivation.",
    "tags": [
      "case-gitlab-database-incident",
      "tradeoff",
      "staff"
    ]
  }
];
