window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["counting-at-scale"] = [
  {
    "id": "counting-at-scale-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "At-least-once double count",
    "section": "The Challenge of Counting at Scale",
    "prompt": "A consumer reads like events from Kafka, increments the post's counter in the database, then commits its Kafka offset. Why can the displayed count end up higher than the number of likes?",
    "options": [
      "Kafka duplicates every message across replicas, so each like is delivered once per replica",
      "Row locks in the database make concurrent increments apply twice under contention",
      "If the consumer crashes after the increment but before the offset commit, the retry re-reads and re-applies the same events",
      "The consumer's in-memory buffer is flushed twice whenever a partition rebalance occurs"
    ],
    "answer": 2,
    "explanation": "Delivery is at least once, so the gap between applying the aggregate and recording the input position is exactly where retries double count. Replication does not deliver extra copies to consumers, and row locks serialise increments rather than duplicating them.",
    "tags": [
      "counting-at-scale",
      "recall",
      "inline"
    ]
  },
  {
    "id": "counting-at-scale-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Batched write rate",
    "section": "Worked example: a viral post",
    "prompt": "A viral post gets 80,000 likes per second. Events are salted across 48 Kafka partitions, and each partition's consumer aggregates in memory for 1 second before writing one combined update. How many database writes per second does the post's counter receive?",
    "options": [
      "About 48, one per partition per second",
      "About 1,670, the like rate divided by the partition count",
      "About 80,000, because every like still needs its own row update",
      "Exactly 1, because all partitions share a single aggregation window"
    ],
    "answer": 0,
    "explanation": "Each partition emits one combined delta per second, so the row sees about 48 writes per second regardless of like volume. 1,670 is the per-partition event rate, not the write rate, and partitions flush independently rather than as one shared window.",
    "tags": [
      "counting-at-scale",
      "apply",
      "inline"
    ]
  },
  {
    "id": "counting-at-scale-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Offset in the same transaction",
    "section": "Making the batch idempotent",
    "prompt": "The partition-7 consumer has aggregated post 42: +48,210 up to offset 1,204,500. Which write protocol makes a crash at any point safe from double counting?",
    "options": [
      "Commit the Kafka offset first, then add 48,210 to the count, so a crash loses at most one batch",
      "Add 48,210 to the count, then commit the Kafka offset, retrying the offset commit until it succeeds",
      "Write the batch to a Redis cache, check the cache on restart, and increment only if the key is missing",
      "In one database transaction, add 48,210 and record partition 7 processed through offset 1,204,500, then resume from the stored offset"
    ],
    "answer": 3,
    "explanation": "Making the increment and the durable offset receipt atomic means a crash leaves either both or neither, so a restart either replays or skips cleanly. Committing the offset first avoids double counting but silently loses the batch, and a separate cache check has its own crash race.",
    "tags": [
      "counting-at-scale",
      "staff",
      "inline"
    ]
  },
  {
    "id": "counting-at-scale-n1",
    "topic": "counting-at-scale",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Write Coalescing Buffer Compression Ratio",
    "scenario": "A viral post receives 150,000 like increments/sec across 50 stateless API servers. Instead of issuing 150,000 `UPDATE posts SET likes = likes + 1` SQL statements per second, each of the 50 API servers accumulates deltas in memory and flushes 1 aggregated `likes = likes + delta` statement every 2 seconds.",
    "prompt": "How many total database `UPDATE` statements per second (`50 servers / 2 seconds`) hit the database after in-memory write coalescing?",
    "question": "How many total database `UPDATE` statements per second (`50 servers / 2 seconds`) hit the database after in-memory write coalescing?",
    "unit": "updates/s",
    "answer": 25,
    "tolerance": 0.2,
    "hint": "50 servers each flush once every 2 seconds (`50 / 2`).",
    "explanation": "50 servers flushing once per 2 seconds emit just `50 / 2 = 25` SQL updates/sec instead of 150,000 updates/sec—a 6,000× reduction in row-lock contention!",
    "tags": [
      "counting-at-scale",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "counting-at-scale-t1",
    "topic": "counting-at-scale",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Single-Row SQL Counter vs Sharded Counter vs Write-Behind Aggregation",
    "scenario": "You need to count page views at 200,000 increments/sec while displaying the approximate live count on the page and persisting durable hourly totals.",
    "prompt": "Which counting architecture avoids single-row lock contention while protecting against node crashes?",
    "question": "Which counting architecture avoids single-row lock contention while protecting against node crashes?",
    "options": [
      "Run `UPDATE pages SET views = views + 1 WHERE id = $1` synchronously on a single SQL row for every view",
      "Hold the counter only in volatile process RAM and flush once a week",
      "Ingest view events into a partitioned log (Kafka) or sharded Redis counters with periodic micro-batch checkpointing (`+delta` every few seconds) into the durable store"
    ],
    "correctOption": 2,
    "reasons": [
      "A single SQL row lock can sustain 200,000 serialized transactions/sec",
      "Volatile weekly flushes guarantee zero data loss on deploy",
      "Sharding/buffering increments in memory or a partitioned log removes the single-row lock bottleneck and coalesces thousands of `+1` events into a single periodic `+N` write"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why can't a single database row lock handle 200,000 increments per second?",
    "explanation": "Serializing 200,000 row-level X-locks per second on one key is physically impossible. Coalescing increments in sharded counters or stream micro-batches reduces database writes by orders of magnitude.",
    "tags": [
      "counting-at-scale",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["view-counting-at-scale"] = [
  {
    "id": "view-counting-at-scale-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Which path is truth",
    "section": "Speed layer vs batch layer",
    "prompt": "In a Lambda-style view counter, which path should decide the counts used for creator payouts and official totals?",
    "options": [
      "The real-time path, because it sees every heartbeat within seconds and has the freshest numbers",
      "The batch path, because it applies full-history dedup, ML fraud filtering and business rules",
      "Whichever path reports the higher number, since undercounting creators is the bigger business risk",
      "The client, because only the player knows whether the viewer met the minimum watch time"
    ],
    "answer": 1,
    "explanation": "The speed layer does short-window, best-effort dedup and simple fraud rules, so it is for display; monetisation and official counts come from the audited batch path. Freshness is not the same as correctness, and client-reported numbers are the easiest to fake.",
    "tags": [
      "view-counting-at-scale",
      "recall",
      "inline"
    ]
  },
  {
    "id": "view-counting-at-scale-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Heartbeat log volume",
    "section": "Worked example: sizing",
    "prompt": "A platform has 500 million views per day. Players send a heartbeat every 10 seconds of watch time, the average view lasts 4 minutes, and each event is about 200 bytes. How much raw heartbeat log is produced per day?",
    "options": [
      "About 100 GB",
      "About 240 GB",
      "About 2.4 TB",
      "About 24 TB"
    ],
    "answer": 2,
    "explanation": "4 minutes at one heartbeat per 10 seconds is 24 events per view, so 12 billion events x 200 bytes is about 2.4 TB. The 100 GB answer counts one event per view, which ignores that heartbeats dominate volume.",
    "tags": [
      "view-counting-at-scale",
      "apply",
      "inline"
    ]
  },
  {
    "id": "view-counting-at-scale-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Replay double counting",
    "section": "Failure modes",
    "prompt": "After a deploy, the streaming view job restarts from a checkpoint 20 minutes old, and several videos' displayed counts jump well above reality. The sink runs INCRBY with each window's count. What change prevents this?",
    "options": [
      "Write each window's result keyed by video and window, overwriting rather than incrementing, so a replay rewrites the same values",
      "Take checkpoints every second instead of every few minutes, so a restart replays too little to notice",
      "Disable checkpointing and restart from the latest Kafka offset, so no event is ever processed twice",
      "Move deduplication to the batch path, since the real-time count is only approximate anyway"
    ],
    "answer": 0,
    "explanation": "An idempotent sink that overwrites per-window results makes replays harmless, which is the fix the lesson names. More frequent checkpoints shrink the window but still double count, and restarting from the latest offset trades duplicates for lost events.",
    "tags": [
      "view-counting-at-scale",
      "staff",
      "inline"
    ]
  },
  {
    "id": "view-counting-at-scale-n1",
    "topic": "view-counting-at-scale",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: HyperLogLog vs Exact `SET` Memory for Unique Viewers",
    "scenario": "A popular video has 50,000,000 unique viewers (`user_id` = 8 bytes). Tracking unique viewers via an exact Redis `SET` of 8-byte IDs (plus hash table entry overhead, ~24 bytes/member) takes `1.2 GB` (`1,200,000 KB`) for that single video. A Redis HyperLogLog with `16,384` 6-bit registers (`0.81%` standard error) uses a fixed `12 KB`.",
    "prompt": "By what factor (`1,200,000 KB / 12 KB`) does HyperLogLog reduce memory usage for this video's unique viewer count?",
    "question": "By what factor (`1,200,000 KB / 12 KB`) does HyperLogLog reduce memory usage for this video's unique viewer count?",
    "unit": "x",
    "answer": 100000,
    "tolerance": 0.2,
    "hint": "Divide 1,200,000 KB by 12 KB.",
    "explanation": "1,200,000 KB / 12 KB = 100,000× less memory: a 12 KB HyperLogLog counts tens of millions of unique viewers with <1% error in 100,000× less RAM than an exact set.",
    "tags": [
      "view-counting-at-scale",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "view-counting-at-scale-t1",
    "topic": "view-counting-at-scale",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Public Engagement View Counts vs Monetized Ad-Billing Counts",
    "scenario": "A video platform displays both a public \"1.4M Views\" counter under the video player (requiring <100 ms update freshness) and a creator payout / advertiser billing ledger (requiring strict bot filtering and exact deduplication).",
    "prompt": "Should both numbers be served by the same pipeline, or how should the architecture split them?",
    "question": "Should both numbers be served by the same pipeline, or how should the architecture split them?",
    "options": [
      "Block the video player from playing until a synchronous fraud model and ACID billing transaction finish",
      "Pay advertisers and creators directly from unvalidated client-side HyperLogLog counters",
      "Use a Lambda/Dual-Path design: a fast real-time approximate path (in-memory/HLL + sharded counters) for the public UI badge, and a separate asynchronous verified pipeline (Kafka -> Flink deduplication + fraud/bot scoring -> OLAP ledger) for monetization"
    ],
    "correctOption": 2,
    "reasons": [
      "Blocking video playback for fraud analysis improves viewer retention",
      "Unfiltered client beacons are immune to click-farm fraud",
      "UI social-proof counters prioritize low latency and tolerate ~1% approximation, whereas financial billing tolerates minutes/hours of delay in exchange for strict idempotency and bot filtering"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Does a viewer care if \"1.4M views\" is off by 0.5%, vs does an advertiser care if they are billed for bot views?",
    "explanation": "Separating the fast approximate social-proof counter from the audited, deduplicated financial settlement pipeline lets each path optimize for its true SLO.",
    "tags": [
      "view-counting-at-scale",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["impression-counting-system-design"] = [
  {
    "id": "impression-counting-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Event-time bucketing",
    "section": "Scaling Ad Impressions",
    "prompt": "An ad is shown on a phone at 14:00, but the device is offline and the impression event reaches the servers at 16:00. In which hourly bucket should it be counted for billing?",
    "options": [
      "16:00, because the ingest timestamp is the only one the platform can trust",
      "It should be dropped, because it arrived after the 14:00 window was closed",
      "Split evenly between 14:00 and 16:00 to hedge against clock skew on the device",
      "14:00, because billing aggregates by event time, with late data updating the historical bucket"
    ],
    "answer": 3,
    "explanation": "Event-time processing puts the impression where it happened, and watermarks plus allowed lateness let the 14:00 bucket be corrected. Bucketing by arrival time is the named trap, and dropping it outright loses billable revenue.",
    "tags": [
      "impression-counting-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "impression-counting-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Cost of double counting",
    "section": "Worked example: volumes",
    "prompt": "A platform serves 4 billion impressions per day at a 3 dollar CPM. A retry bug double counts 0.5 percent of impressions. How much wrongful billing does that produce per day?",
    "options": [
      "About 6,000 dollars",
      "About 60,000 dollars",
      "About 600,000 dollars",
      "About 6 million dollars"
    ],
    "answer": 1,
    "explanation": "Revenue is 4 billion divided by 1,000, that is 4 million units of a thousand impressions, x 3 dollars = 12 million dollars per day, and 0.5 percent of that is 60,000 dollars. The 600,000 dollars option divides by 100 instead of 1,000, forgetting that CPM is priced per thousand impressions.",
    "tags": [
      "impression-counting-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "impression-counting-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Dedup state TTL",
    "section": "Definitions matter",
    "prompt": "The Flink job dedups by impression ID with a 1-hour state TTL, but the pipeline accepts late events for up to 24 hours. A mobile SDK retries a batch 3 hours after the original was ingested. What happens, and what is the fix?",
    "options": [
      "The retry is rejected as late, because events older than the TTL are dropped automatically",
      "The retry is deduped by Kafka's idempotent producer, so the TTL does not matter for SDK retries",
      "The retry is counted again because its ID has expired from state; the TTL should be a little longer than the allowed lateness",
      "The retry lands in the late-data table and is always excluded from invoices, so no fix is needed"
    ],
    "answer": 2,
    "explanation": "Dedup only works while the ID is still in state, so a TTL shorter than the lateness window lets accepted late retries double count; the lesson sizes the TTL just above allowed lateness, which is why state lives in RocksDB. Kafka's idempotent producer only removes broker-level duplicates from one producer session, not SDK re-sends hours later.",
    "tags": [
      "impression-counting-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "impression-counting-system-design-n1",
    "topic": "impression-counting-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Short-Term Deduplication State Sizing in Stream Processing",
    "scenario": "An ad impression pipeline ingests 200,000 impressions/sec and must deduplicate retried client beacons over a sliding 10-minute (`600-second`) window in Flink RocksDB state. Each `impression_id` state entry (16-byte UUID + timestamp overhead) takes 32 bytes.",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of RocksDB state are required to hold all `impression_id` keys across the 600-second window (`200,000 × 600 × 32 B`)?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of RocksDB state are required to hold all `impression_id` keys across the 600-second window (`200,000 × 600 × 32 B`)?",
    "unit": "GB",
    "answer": 3.84,
    "tolerance": 0.2,
    "hint": "Total impressions in 600s = `200,000 × 600 = 120,000,000`. Multiply by 32 bytes and divide by 10^9.",
    "explanation": "200,000 imp/s × 600 s = 120,000,000 active IDs in the window. At 32 bytes each, `120M × 32 B = 3.84 × 10^9 B = 3.84 GB`, which fits easily in partitioned Flink RocksDB state!",
    "tags": [
      "impression-counting-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "impression-counting-system-design-t1",
    "topic": "impression-counting-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Client-Generated `impression_id` vs Server-Signed Impression Token",
    "scenario": "When an ad server returns an ad to a mobile client, the client fires an `/impression` beacon when 50% of the ad pixels are visible for >= 1 second (MRC standard). Network retries can send the same beacon multiple times, and malicious bots can fabricate fake beacons.",
    "prompt": "How should the impression identifier be constructed and deduplicated?",
    "question": "How should the impression identifier be constructed and deduplicated?",
    "options": [
      "Let the client generate a new random UUID on every HTTP retry of the same ad view",
      "Trust any `/impression?ad_id=123` call without cryptographic signature verification",
      "Have the ad server mint a cryptographically signed (HMAC) `impression_id` at ad-serve time containing `(ad_id, user_id, auction_id, timestamp)` and deduplicate by `impression_id` in a stateful stream processor partitioned by `impression_id`"
    ],
    "correctOption": 2,
    "reasons": [
      "Generating a new UUID on every retry prevents duplicate billing",
      "Unsigned query parameters prevent replay and forgery attacks",
      "A server-minted HMAC token proves the impression corresponded to a real ad auction within a valid TTL, and reusing that exact `impression_id` across client network retries guarantees idempotent deduplication"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How do you prove both (1) that the ad was genuinely served by your auction engine and (2) that network retries of that view only count once?",
    "explanation": "Minting a signed `impression_id` at ad-serve time binds the view beacon to an authentic auction event and provides the deterministic idempotency key for stream deduplication.",
    "tags": [
      "impression-counting-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["hyperloglog-cardinality-estimation"] = [
  {
    "id": "hyperloglog-cardinality-estimation-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why duplicates are free",
    "section": "Walking one item through",
    "prompt": "The same user ID is added to a HyperLogLog one million times. Why does the estimate not grow?",
    "options": [
      "The ID always hashes to the same register and rank, and the register keeps a maximum, so repeats change nothing",
      "HyperLogLog stores a Bloom filter of seen IDs and skips any ID that is probably already present",
      "Each register has a saturating counter that stops increasing after the first observation",
      "The harmonic mean in the estimator cancels out repeated values from any single register"
    ],
    "answer": 0,
    "explanation": "Hashing is deterministic, so re-adding an item recomputes the same register and rank, and max(r, r) equals r. HLL keeps no record of IDs at all, so no Bloom-filter-style membership check exists.",
    "tags": [
      "hyperloglog-cardinality-estimation",
      "recall",
      "inline"
    ]
  },
  {
    "id": "hyperloglog-cardinality-estimation-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Choosing precision",
    "section": "Worked example: precision vs memory",
    "prompt": "A product requires a standard error of at most 1 percent for daily uniques, and memory should be as small as possible. Using standard error 1.04 divided by the square root of m, which precision do you choose?",
    "options": [
      "p = 10, 1,024 registers, about 768 bytes",
      "p = 12, 4,096 registers, about 3 KB",
      "p = 14, 16,384 registers, about 12 KB",
      "p = 16, 65,536 registers, about 48 KB"
    ],
    "answer": 2,
    "explanation": "p = 14 gives 1.04 divided by 128, about 0.81 percent, the smallest setting under 1 percent; p = 12 gives 1.63 percent. p = 16 also meets the target but at four times the memory for accuracy nobody asked for.",
    "tags": [
      "hyperloglog-cardinality-estimation",
      "apply",
      "inline"
    ]
  },
  {
    "id": "hyperloglog-cardinality-estimation-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Intersection by subtraction",
    "section": "Common interview uses",
    "prompt": "Pages A and B each have about 50 million monthly uniques in p = 14 HLLs, and only about 100,000 users visited both. A PM computes |A| + |B| minus |A union B| from the sketches. What is wrong?",
    "options": [
      "HLL union is not supported, so the formula cannot be evaluated at all without the raw IDs",
      "Each estimate carries an error of hundreds of thousands, so the difference can be larger than the true answer; use Theta sketches for intersections",
      "The formula double counts the overlap, so the result is exactly twice the true intersection",
      "The subtraction is accurate, but only if the two sketches were built on the same day"
    ],
    "answer": 1,
    "explanation": "At 0.81 percent error, each 50 to 100 million estimate is off by roughly 400,000 to 800,000, which swamps a 100,000 intersection; Theta sketches support set operations directly. HLL union itself is fine: it is register-wise max.",
    "tags": [
      "hyperloglog-cardinality-estimation",
      "staff",
      "inline"
    ]
  },
  {
    "id": "hyperloglog-cardinality-estimation-n1",
    "topic": "hyperloglog-cardinality-estimation",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: HyperLogLog Memory Footprint vs Exact Set",
    "scenario": "You track unique daily visitors across 10,000 high-traffic articles. Each HyperLogLog sketch uses `m = 16,384` registers (`2^14`, yielding ~0.81% standard error) where each register is 6 bits (`16,384 × 6 bits = 98,304 bits = 12,288 bytes ≈ 12 KB` per article).",
    "prompt": "Using 12 KB per HyperLogLog sketch, how many megabytes (MB, using 1 MB = 1,000 KB) of RAM are needed to hold all 10,000 article sketches?",
    "question": "Using 12 KB per HyperLogLog sketch, how many megabytes (MB, using 1 MB = 1,000 KB) of RAM are needed to hold all 10,000 article sketches?",
    "unit": "MB",
    "answer": 120,
    "tolerance": 0.25,
    "hint": "Multiply 10,000 sketches × 12 KB/sketch and divide by 1,000 KB/MB.",
    "explanation": "10,000 sketches × 12 KB = 120,000 KB = 120 MB total—regardless of whether each article has 1,000 or 100,000,000 unique visitors!",
    "tags": [
      "hyperloglog-cardinality-estimation",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "hyperloglog-cardinality-estimation-t1",
    "topic": "hyperloglog-cardinality-estimation",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Summing Daily Unique Counts vs Merging HyperLogLog Registers",
    "scenario": "Product managers want a 7-day rolling 'Weekly Unique Viewers' metric per video. An engineer proposes summing the 7 daily HLL cardinality integers (`Mon + Tue + ... + Sun`).",
    "prompt": "Why is summing the 7 daily cardinality integers incorrect, and what is the right sketch architecture?",
    "question": "Why is summing the 7 daily cardinality integers incorrect, and what is the right sketch architecture?",
    "options": [
      "Summing daily unique counts under-counts users who visited on only one day",
      "Summing daily integers double-counts repeat visitors across days; instead, persist one HLL register array per `(video_id, day)` and take the register-wise maximum (`HLL_union[j] = max_d HLL_d[j]`) across the 7 daily sketches",
      "HyperLogLog sketches cannot be merged and require re-scanning raw logs from disk for every 7-day query"
    ],
    "correctOption": 1,
    "reasons": [
      "Set union cardinality `|A ∪ B|` is always equal to `|A| + |B|`",
      "HLL sketches are commutative monoids under register-wise `MAX`, enabling lossless set union across arbitrary time windows without double-counting returning users",
      "Register-wise `MIN` computes the exact set union of two HyperLogLog sketches"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "How does `PFMERGE` in Redis combine two daily HyperLogLog sketches into a weekly unique count?",
    "explanation": "If a user views a video on all 7 days, summing daily integers counts them 7 times. Storing daily HLL register arrays and merging them via register-wise `MAX` (`PFMERGE`) computes the true 7-day union `|D1 ∪ ... ∪ D7|` in microseconds.",
    "tags": [
      "hyperloglog-cardinality-estimation",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["mergeable-sketches-for-analytics"] = [
  {
    "id": "mergeable-sketches-for-analytics-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Distinct counts do not add",
    "section": "Mergeable Sketches in Distributed Systems",
    "prompt": "Server A reports 10,000 unique IPs and server B reports 15,000. What can you say about the total unique IPs, and how do you get it without shipping raw IPs?",
    "options": [
      "It is exactly 25,000, because each server sees a disjoint set of connections",
      "It is the average, 12,500, because HLL estimates are normalised per server",
      "It is at least 25,000, and merging HLL sketches gives an upper bound only",
      "It lies between 15,000 and 25,000; merging the servers' HLL sketches estimates the union"
    ],
    "answer": 3,
    "explanation": "Users can hit both servers, so the union is at least the larger count and at most the sum; merging compatible HLL sketches by register-wise max estimates the union with the usual error. Assuming disjointness is exactly the double counting that mergeable sketches avoid.",
    "tags": [
      "mergeable-sketches-for-analytics",
      "recall",
      "inline"
    ]
  },
  {
    "id": "mergeable-sketches-for-analytics-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sketch rollup sizing",
    "section": "Worked example: hourly to daily uniques",
    "prompt": "A site stores one 12 KB HLL sketch per hour per country for 50 countries. How much sketch data is merged for weekly uniques across all countries, and how much sketch storage is added per day?",
    "options": [
      "About 100 MB merged for the week, about 14 MB stored per day",
      "About 14 MB merged for the week, about 100 MB stored per day",
      "About 600 KB merged for the week, about 14 MB stored per day",
      "About 100 MB merged for the week, about 600 KB stored per day"
    ],
    "answer": 0,
    "explanation": "A week is 168 hours x 50 countries = 8,400 sketches x 12 KB, about 100 MB; a day is 24 x 50 x 12 KB, about 14 MB. The 600 KB figure is only one day for one country or one hour across all countries, not the stated totals.",
    "tags": [
      "mergeable-sketches-for-analytics",
      "apply",
      "inline"
    ]
  },
  {
    "id": "mergeable-sketches-for-analytics-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Incompatible merges",
    "section": "How each sketch merges",
    "prompt": "Two regions each built a Count-Min sketch with width 2,719 and depth 5, but each used its own random hash seeds. A global job adds them element-wise. What is the result?",
    "options": [
      "A valid global sketch, because width and depth match, which is all element-wise addition requires",
      "A valid sketch with doubled error, because each region's collisions add to the other's",
      "A meaningless sketch, because the same item maps to different cells in each region, so the summed cells no longer correspond to any item",
      "A valid sketch that undercounts, because conservative update is disabled during merges"
    ],
    "answer": 2,
    "explanation": "Count-Min merges by adding counters only when width, depth and hash functions all match; with different seeds, an item's cells differ by region, so querying the sum reads unrelated mass. Matching dimensions alone look sufficient, which makes this a silent failure.",
    "tags": [
      "mergeable-sketches-for-analytics",
      "staff",
      "inline"
    ]
  },
  {
    "id": "mergeable-sketches-for-analytics-n1",
    "topic": "mergeable-sketches-for-analytics",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Pre-Aggregated HLL Rollup Storage Reduction",
    "scenario": "An analytics warehouse tracks daily unique users across 10,000 dimensions (country × device × app_version). Storing raw user IDs per dimension cell takes `400 GB/day`, whereas storing one mergeable `16 KB` HyperLogLog sketch per dimension cell (`10,000 × 16 KB`) allows arbitrary `UNION` rollups across dimensions and days.",
    "prompt": "How many megabytes per day (MB/day, where 1 MB = 1,000 KB) do the 10,000 mergeable `16 KB` HLL sketches occupy in total?",
    "question": "How many megabytes per day (MB/day, where 1 MB = 1,000 KB) do the 10,000 mergeable `16 KB` HLL sketches occupy in total?",
    "unit": "MB/day",
    "answer": 160,
    "tolerance": 0.2,
    "hint": "Multiply 10,000 dimension cells by 16 KB and divide by 1,000 KB/MB.",
    "explanation": "10,000 cells × 16 KB = 160,000 KB = 160 MB/day (a 2,500× reduction from 400 GB/day), and any 30-day multi-country rollup can be computed in milliseconds by taking the element-wise register `MAX` of the HLL sketches!",
    "tags": [
      "mergeable-sketches-for-analytics",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "mergeable-sketches-for-analytics-t1",
    "topic": "mergeable-sketches-for-analytics",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Storing Pre-Computed Integer `COUNT(DISTINCT)` vs Storing Mergeable HLL Sketches",
    "scenario": "A team pre-aggregates daily unique active users (`DAU`) as a plain integer per day (`Mon = 1.2M, Tue = 1.3M, ...`). Product managers then ask for Weekly Active Users (`WAU`) and Monthly Active Users (`MAU`) across arbitrary country combinations.",
    "prompt": "Why can't you sum daily `COUNT(DISTINCT)` integers to get `WAU` or `MAU`, and how do mergeable sketches solve the OLAP cube problem?",
    "question": "Why can't you sum daily `COUNT(DISTINCT)` integers to get `WAU` or `MAU`, and how do mergeable sketches solve the OLAP cube problem?",
    "options": [
      "Summing Monday's DAU + Tuesday's DAU gives exact WAU because no user ever visits on two different days",
      "Re-scan 90 days of raw petabyte event logs from scratch on every dashboard click",
      "Distinct counts are non-additive across time or dimensions; storing serialized HyperLogLog / Theta sketches as the column value in the daily rollup table allows exact register-level `HLL_UNION` merges across any combination of days and dimensions in milliseconds"
    ],
    "correctOption": 2,
    "reasons": [
      "`COUNT(DISTINCT)` is a linear additive aggregation like `SUM`",
      "Full petabyte scans meet sub-second interactive dashboard SLAs",
      "Because `HLL(A ∪ B)` is a commutative, associative, idempotent monoid operation (`max(reg_A[i], reg_B[i])`), daily HLL columns roll up into weekly/monthly/global distinct counts without touching raw events"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "If User 42 visits on Monday AND Tuesday, what happens if you add Monday's integer count to Tuesday's integer count?",
    "explanation": "Integer `COUNT(DISTINCT)` loses set membership identity and cannot be summed across days or dimensions. Storing mergeable sketches (HLL or Theta Sketch for set intersections) preserves composable union capability in O(1) space.",
    "tags": [
      "mergeable-sketches-for-analytics",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["bucketed-time-window-aggregation"] = [
  {
    "id": "bucketed-time-window-aggregation-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Late event policy",
    "section": "Time-Window Aggregation",
    "prompt": "An event-time bucket for 10:00 to 10:05 has published 90 views. At 10:08 a mobile event with occurrence time 10:04 arrives. What determines whether the bucket becomes 91?",
    "options": [
      "The wall clock: once 10:05 has passed on the server, the bucket is final by definition",
      "The watermark and allowed-lateness policy, which decide whether to update, emit a correction or route the event to a late-data path",
      "The Redis key TTL, since the event is counted if and only if the 10:00 key still exists",
      "The event's arrival order in Kafka, because events are bucketed by their partition offset"
    ],
    "answer": 1,
    "explanation": "Crossing the wall-clock boundary does not prove all events have arrived; the watermark and lateness policy define what happens to late data. A TTL can make updates impossible, but it is a storage detail, not the policy that decides correctness.",
    "tags": [
      "bucketed-time-window-aggregation",
      "recall",
      "inline"
    ]
  },
  {
    "id": "bucketed-time-window-aggregation-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sliding from buckets",
    "section": "Worked example: sliding window from small buckets",
    "prompt": "You need \"errors in the last 15 minutes, updated every minute\" for 20,000 endpoints, using 1-minute tumbling Redis buckets with a 20-minute TTL. At 10:30, what do you read, and about how many live keys exist?",
    "options": [
      "One key, errors:endpoint:10:30, which already holds 15 minutes of data; about 20,000 keys",
      "Buckets 10:00 through 10:30, since the TTL keeps 20 minutes plus the current one; about 600,000 keys",
      "Buckets 10:15 through 10:30 inclusive, 16 reads; about 300,000 keys",
      "Buckets 10:15 through 10:29 with one MGET of 15 keys; about 400,000 keys"
    ],
    "answer": 3,
    "explanation": "Following the lesson's pattern, you sum the 15 completed minute buckets before the current one, and 20,000 endpoints x 20 live buckets is 400,000 small keys. Including the just-started 10:30 bucket makes the window 16 minutes wide.",
    "tags": [
      "bucketed-time-window-aggregation",
      "apply",
      "inline"
    ]
  },
  {
    "id": "bucketed-time-window-aggregation-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Watermark trade-off",
    "section": "Watermark trade-off in numbers",
    "prompt": "99 percent of mobile events arrive within 2 minutes and 99.9 percent within 20 minutes. Ops dashboards need freshness, but billing needs completeness. Which windowing strategy fits both?",
    "options": [
      "Publish with a 2-minute watermark, emit updates as late data arrives, and mark buckets final after the 20-minute bound",
      "Use a 20-minute watermark everywhere, so every consumer sees one complete number",
      "Use a 2-minute watermark and drop later events, since 1 percent is within normal error",
      "Switch to processing-time windows, which are never late and therefore always complete"
    ],
    "answer": 0,
    "explanation": "Early results with late updates and a later final mark give dashboards speed and billing completeness. A 20-minute watermark everywhere makes every dashboard 20 minutes stale and holds about 10 times more open window state, while processing time simply puts late events in the wrong bucket.",
    "tags": [
      "bucketed-time-window-aggregation",
      "staff",
      "inline"
    ]
  },
  {
    "id": "bucketed-time-window-aggregation-n1",
    "topic": "bucketed-time-window-aggregation",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Sliding Window Ring-Buffer Sub-Bucket Granularity",
    "scenario": "You need a sliding \"last 5 minutes\" (`300-second`) request and error counter per API key that advances every 5 seconds. Instead of storing every individual timestamp, you maintain a circular ring buffer of `5-second` sub-buckets per API key.",
    "prompt": "How many `5-second` sub-buckets (`300 / 5`) are needed in the ring buffer to cover a 300-second sliding window?",
    "question": "How many `5-second` sub-buckets (`300 / 5`) are needed in the ring buffer to cover a 300-second sliding window?",
    "unit": "buckets",
    "answer": 60,
    "tolerance": 0.2,
    "hint": "Divide the 300-second window by the 5-second bucket width.",
    "explanation": "300 seconds / 5 seconds = 60 integer sub-buckets per key (~480 bytes total regardless of whether the key receives 10 or 10,000,000 requests in those 5 minutes).",
    "tags": [
      "bucketed-time-window-aggregation",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "bucketed-time-window-aggregation-t1",
    "topic": "bucketed-time-window-aggregation",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Handling Late-Arriving Out-of-Order Events in Windowed Stream Aggregation",
    "scenario": "Mobile clients buffer analytics events while offline in a subway tunnel and upload them 4 minutes later. Your stream processor aggregates 1-minute event-time windows.",
    "prompt": "How should a production stream processor (Flink/Kafka Streams) handle event-time windows vs late events?",
    "question": "How should a production stream processor (Flink/Kafka Streams) handle event-time windows vs late events?",
    "options": [
      "Use server processing time (`System.currentTimeMillis()`) so a subway burst at 12:05 spikes the 12:05 metric with 12:01 events",
      "Hold every 1-minute window open in RAM forever waiting for late events",
      "Aggregate by Event Time using Watermarks + a bounded Allowed Lateness window (e.g., 5–10 minutes) that emits incremental/retracted window updates, and route extremely late events (>10 min) to a side-output stream for batch reconciliation"
    ],
    "correctOption": 2,
    "reasons": [
      "Processing time accurately reflects when the user action occurred offline",
      "Never closing windows uses bounded memory",
      "Watermarks track event-time progress; bounded allowed lateness handles 99% of delayed mobile flushes in real time while side outputs prevent unbounded state retention"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens to RocksDB/RAM state if you never expire old 1-minute window state?",
    "explanation": "Combining Event-Time Watermarks, a bounded Allowed Lateness window (emitting updated pane results), and a late-event side output balances real-time accuracy with bounded state memory.",
    "tags": [
      "bucketed-time-window-aggregation",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["raw-events-vs-derived-analytics"] = [
  {
    "id": "raw-events-vs-derived-analytics-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Versioned rebuilds",
    "section": "Raw Events vs Derived Analytics",
    "prompt": "Fraud rule v2 excludes some impressions that rule v1 counted. How should the derived aggregate tables be corrected?",
    "options": [
      "Run UPDATE statements on the affected rows in place, so dashboards reflect v2 immediately",
      "Leave historical rows under v1 and apply v2 only to new data, so past reports never change",
      "Rebuild from raw events into a new aggregate version, validate it, then atomically switch reports to it",
      "Delete the raw events the rule excludes, then recompute every aggregate that references them"
    ],
    "answer": 2,
    "explanation": "Rebuilding into a new version and switching atomically avoids reports that mix v1 and v2 definitions and preserves lineage. In-place updates are exactly what leaves mixed definitions if they are interrupted or partial.",
    "tags": [
      "raw-events-vs-derived-analytics",
      "recall",
      "inline"
    ]
  },
  {
    "id": "raw-events-vs-derived-analytics-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Raw retention cost",
    "section": "Worked example: storage and query cost",
    "prompt": "You ingest 4 billion events per day at 500 bytes each as JSON, and store them as Parquet with 5 to 10 times compression. How much storage does 180 days of raw Parquet need?",
    "options": [
      "About 3.6 to 7.2 TB",
      "About 36 to 72 TB",
      "About 180 to 360 TB",
      "About 360 TB, since Parquet does not compress JSON payloads"
    ],
    "answer": 1,
    "explanation": "Raw JSON is 2 TB per day, Parquet brings it to 200 to 400 GB per day, and 180 days is 36 to 72 TB. The 180 to 360 TB option applies compression incorrectly, and 360 TB is the uncompressed JSON total.",
    "tags": [
      "raw-events-vs-derived-analytics",
      "apply",
      "inline"
    ]
  },
  {
    "id": "raw-events-vs-derived-analytics-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Deletion in immutable files",
    "section": "Privacy obligations",
    "prompt": "Raw events with user IDs sit in immutable daily Parquet partitions for 90 days, plus backups. A GDPR deletion request arrives and must be honoured well before the partitions age out. Which pattern handles this most cleanly?",
    "options": [
      "Rewrite every Parquet file and backup containing the user within the deadline, which is cheap because files are columnar",
      "Hash the user ID with a global salt at ingest, which counts as deletion because the ID is no longer readable",
      "Keep the raw events but remove the user from all dashboards, since aggregates are what users actually see",
      "Pseudonymise user IDs with a per-user key at ingest, and destroy that key on request (crypto-shredding)"
    ],
    "answer": 3,
    "explanation": "Destroying a per-user key makes that user's records unlinkable everywhere, including backups, without rewriting immutable files. A global salt is the tempting trap: anyone holding the salt can still recompute and link the ID, so nothing has been deleted.",
    "tags": [
      "raw-events-vs-derived-analytics",
      "staff",
      "inline"
    ]
  },
  {
    "id": "raw-events-vs-derived-analytics-n1",
    "topic": "raw-events-vs-derived-analytics",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Derived Rollup Table Scan Compression",
    "scenario": "A service logs 1,000,000,000 (`10^9`) raw checkout events per day across 5,000 merchants. A dashboard queries hourly revenue per merchant over 1 day (`5,000 merchants × 24 hours = 120,000` pre-aggregated rollup rows).",
    "prompt": "Approximately how many times fewer rows (`1,000,000,000 / 120,000`, rounded to the nearest hundred) does the dashboard scan when querying the hourly rollup table instead of raw events?",
    "question": "Approximately how many times fewer rows (`1,000,000,000 / 120,000`, rounded to the nearest hundred) does the dashboard scan when querying the hourly rollup table instead of raw events?",
    "unit": "x",
    "answer": 8300,
    "tolerance": 0.2,
    "hint": "Divide `1,000,000,000` by `120,000` (`≈ 8,333`).",
    "explanation": "`1,000,000,000 / 120,000 = 8,333×` (~8,300×) fewer rows scanned, turning a multi-second billion-row scan into a 2-millisecond lookup.",
    "tags": [
      "raw-events-vs-derived-analytics",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "raw-events-vs-derived-analytics-t1",
    "topic": "raw-events-vs-derived-analytics",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Discarding Raw Events After Rollup vs Immutable Raw Log + Recomputable Materialized Views",
    "scenario": "To save storage costs, an engineering team deletes raw immutable events immediately after aggregating them into an hourly summary table. A month later, they discover a currency-conversion bug in the aggregation code that overstated EUR revenue by 10%.",
    "prompt": "Why is discarding raw events catastrophic here, and what is the canonical Kappa/Lakehouse architecture?",
    "question": "Why is discarding raw events catastrophic here, and what is the canonical Kappa/Lakehouse architecture?",
    "options": [
      "Mutate the corrupted hourly summary numbers by guessing which percentage of traffic came from Europe",
      "Never compute derived rollups and force all user dashboards to scan cold S3 raw logs directly",
      "Treat the raw append-only event log (tiered to cheap S3 Parquet/Iceberg) as the immutable source of truth, and treat all rollup tables as disposable, recomputable materialized views that can be backfilled whenever code or business logic changes"
    ],
    "correctOption": 2,
    "reasons": [
      "Guessed adjustments pass financial audits",
      "Scanning cold S3 logs on every page load is cheap and fast",
      "Aggregation is a lossy one-way function; keeping raw immutable events in cheap object storage ($0.01–$0.02/GB-mo) preserves the ability to fix bugs, backfill new metrics, and audit discrepancies"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Can you invert a `SUM()` aggregation after a bug in your currency conversion logic is discovered?",
    "explanation": "Code has bugs and product definitions evolve. Raw immutable events in cheap object storage serve as the system of record, while derived OLAP rollup tables provide low-latency serving and can be rebuilt on demand.",
    "tags": [
      "raw-events-vs-derived-analytics",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["count-min-sketch"] = [
  {
    "id": "count-min-sketch-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why take the minimum",
    "section": "Estimating Frequencies with Count-Min Sketch",
    "prompt": "With non-negative updates, why does Count-Min answer a frequency query with the minimum of the item's d counters?",
    "options": [
      "Each counter equals the true count plus non-negative collision mass, so the smallest is the least polluted and never below the truth",
      "The minimum is an unbiased estimator of the true count, so it is right on average across items",
      "The minimum cancels hash collisions exactly when the depth is at least ln(1 divided by delta)",
      "Taking the maximum would underestimate items whose counters were decremented by other keys"
    ],
    "answer": 0,
    "explanation": "Collisions can only add to a counter, so every row overestimates or is exact, and the minimum is the tightest bound. It is biased upward, not unbiased; the Count sketch with a median is the unbiased variant.",
    "tags": [
      "count-min-sketch",
      "recall",
      "inline"
    ]
  },
  {
    "id": "count-min-sketch-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Tracing a tiny sketch",
    "section": "A tiny example",
    "prompt": "Width 4, depth 2. Insert a (row 1 col 1, row 2 col 0), then b (row 1 col 1, row 2 col 2), then c (row 1 col 3, row 2 col 0), then a again. What does the sketch return for a?",
    "options": [
      "2, the true count, because the minimum always removes collision noise",
      "3, because both of a's counters were hit by one other item",
      "4, the sum of collisions across both rows",
      "1, because the second insert of a is merged with the first"
    ],
    "answer": 1,
    "explanation": "Row 1 col 1 holds a, b, a = 3 and row 2 col 0 holds a, c, a = 3, so the minimum is 3 against a true count of 2. The minimum only removes noise when at least one row is collision-free, which is not the case here.",
    "tags": [
      "count-min-sketch",
      "apply",
      "inline"
    ]
  },
  {
    "id": "count-min-sketch-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Error scales with N",
    "section": "Worked example: sizing from error targets",
    "prompt": "An API gateway uses a Count-Min sketch with epsilon 0.001 over 1 billion requests per day to block any key exceeding 10,000 requests per day. What breaks first?",
    "options": [
      "Heavy users slip through, because the sketch undercounts keys with many collisions",
      "Memory, because 1 billion requests need a width proportional to the number of distinct keys",
      "Nothing, because the overcount is at most 0.1 percent of each key's own traffic",
      "Light users get blocked, because the overcount bound is epsilon x N, up to about 1 million, far above the 10,000 limit"
    ],
    "answer": 3,
    "explanation": "The error bound is relative to the whole stream, so a key with 50 requests can be estimated near 1,000,000 and falsely blocked; enforcement needs exact per-key counts or a far smaller epsilon. The tempting option misreads the bound as relative to each key's own count.",
    "tags": [
      "count-min-sketch",
      "staff",
      "inline"
    ]
  },
  {
    "id": "count-min-sketch-n1",
    "topic": "count-min-sketch",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Count-Min Sketch Matrix Memory Size",
    "scenario": "You size a Count-Min Sketch with `d = 5` hash rows and `w = 20,000` counter columns per row to track heavy-hitter IP frequencies in an L7 DDoS scrubber. Each counter is a 4-byte (32-bit) unsigned integer.",
    "prompt": "How many kilobytes (KB, using 1 KB = 1,000 bytes) of memory does this `5 × 20,000` Count-Min Sketch matrix occupy?",
    "question": "How many kilobytes (KB, using 1 KB = 1,000 bytes) of memory does this `5 × 20,000` Count-Min Sketch matrix occupy?",
    "unit": "KB",
    "answer": 400,
    "tolerance": 0.25,
    "hint": "Total cells = 5 × 20,000 = 100,000 counters. Multiply by 4 bytes/counter and divide by 1,000 bytes/KB.",
    "explanation": "5 rows × 20,000 columns = 100,000 counters. At 4 bytes per counter, the entire sketch fits in 400,000 bytes = 400 KB—small enough to reside entirely in a CPU core's L2/L3 cache for line-rate packet inspection.",
    "tags": [
      "count-min-sketch",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "count-min-sketch-t1",
    "topic": "count-min-sketch",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Count-Min Sketch Overestimation Bias & Heavy-Hitter Min-Heap Pairing",
    "scenario": "You need to return the Top-100 most frequent search queries every minute from a stream of 500,000 queries/sec. A Count-Min Sketch alone only answers point frequency queries `estimate(item)` and does not store the item keys.",
    "prompt": "How do you combine a Count-Min Sketch with an auxiliary structure to output the Top-100 keys in bounded memory, and what error direction can occur?",
    "question": "How do you combine a Count-Min Sketch with an auxiliary structure to output the Top-100 keys in bounded memory, and what error direction can occur?",
    "options": [
      "Iterate over all `2^128` possible string keys every minute to query the Count-Min Sketch",
      "Pair the Count-Min Sketch with a bounded Min-Heap of size K=100 (updating the heap whenever an item's `min_i CMS[i][h_i(x)]` estimate exceeds the heap minimum), noting CMS can only overestimate (never underestimate) due to hash collisions",
      "Use the maximum counter across the `d` hash rows (`max_i CMS[i][h_i(x)]`) to minimize collision noise"
    ],
    "correctOption": 1,
    "reasons": [
      "Enumerating infinite string spaces is O(1) in production",
      "Taking the minimum across `d` rows minimizes positive collision bias (one-sided overestimation error), while a K-element Min-Heap retains the top-K keys in O(K) space",
      "Taking the maximum across rows reduces positive hash-collision increments"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why does `estimate(x)` return `min_i table[i][h_i(x)]` and how do you remember which keys are in the top K?",
    "explanation": "Because hash collisions only add positive counts to shared buckets, every row `i` satisfies `table[i][h_i(x)] >= true_count(x)`. Returning the `min` across rows gives the tightest upper bound, and maintaining a size-K Min-Heap alongside the sketch tracks the current Top-K keys in O(K) memory.",
    "tags": [
      "count-min-sketch",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["top-k-heavy-hitters"] = [
  {
    "id": "top-k-heavy-hitters-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Count-Min alone is not top-K",
    "section": "Finding the Heavy Hitters (Top-K)",
    "prompt": "Why can a Count-Min sketch not produce the top 10 hashtags on its own?",
    "options": [
      "Its estimates underestimate popular items, so the true leaders fall out of the ranking",
      "It needs to know the stream length in advance to size its counters correctly",
      "It estimates the count of a key you supply but does not remember which keys it has seen",
      "It cannot be updated in a single pass, so it can only rank items after the stream ends"
    ],
    "answer": 2,
    "explanation": "Count-Min answers how many for a given key but stores no keys, so candidate discovery needs a heap, Space-Saving, or an explicit candidate set. With non-negative updates it overestimates rather than underestimates.",
    "tags": [
      "top-k-heavy-hitters",
      "recall",
      "inline"
    ]
  },
  {
    "id": "top-k-heavy-hitters-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Space-Saving bound",
    "section": "Worked example: Space-Saving guarantee",
    "prompt": "An hour has 500 million search events, and a Space-Saving summary keeps k = 5,000 counters. Which items are guaranteed to appear in the summary?",
    "options": [
      "Every item with more than 100,000 occurrences, since the overestimate per counter is at most N divided by k",
      "Every item with more than 5,000 occurrences, since k counters can hold any item seen k times",
      "Only the top 5,000 items exactly, with their counts reported precisely",
      "Every item with more than 1 percent of traffic, 5 million occurrences, regardless of k"
    ],
    "answer": 0,
    "explanation": "Space-Saving's error per counter is at most N divided by k = 100,000, so any item above that frequency is guaranteed to be tracked. It does not return the exact top k with exact counts; counts are overestimates within that bound.",
    "tags": [
      "top-k-heavy-hitters",
      "apply",
      "inline"
    ]
  },
  {
    "id": "top-k-heavy-hitters-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Distributed candidate loss",
    "section": "Worked example: why local top-K merging fails",
    "prompt": "Four shards each report their local top 2. Key X is third on every shard with 800 per shard, 3,200 total, while each shard's top two keys are different and have about 1,000 each on that shard and little elsewhere. How do you make the global top 1 correct?",
    "options": [
      "Report local top 3 instead of top 2, since the key that is missing is always exactly one rank lower",
      "Send an oversampled candidate list, such as the top 10 times K from each shard, then get exact counts for the union of candidates from every shard",
      "Average each shard's local ranks and pick the key with the best mean rank across shards",
      "Increase each shard's Count-Min width so its local ranking is more accurate"
    ],
    "answer": 1,
    "explanation": "Oversampling candidates and then asking every shard for their counts of the union recovers keys that are mid-ranked everywhere but largest globally. Bumping to top 3 happens to fix this instance but is not a general rule, and better local accuracy does not help when X never leaves the shard.",
    "tags": [
      "top-k-heavy-hitters",
      "staff",
      "inline"
    ]
  },
  {
    "id": "top-k-heavy-hitters-n1",
    "topic": "top-k-heavy-hitters",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Count-Min Sketch Memory Footprint vs Exact Hash Map",
    "scenario": "To track heavy-hitter IP addresses or search queries across 500,000,000 unique strings (requiring ~32 GB for an exact hash map), you configure a Count-Min Sketch with depth `d = 5` hash functions and width `w = 200,000` 4-byte (`32-bit`) counters.",
    "prompt": "How many megabytes (MB, where 1 MB = 10^6 bytes) of memory does this `5 × 200,000` Count-Min Sketch require?",
    "question": "How many megabytes (MB, where 1 MB = 10^6 bytes) of memory does this `5 × 200,000` Count-Min Sketch require?",
    "unit": "MB",
    "answer": 4,
    "tolerance": 0.2,
    "hint": "Multiply `5 rows × 200,000 counters × 4 bytes` and divide by 10^6.",
    "explanation": "`5 × 200,000 × 4 bytes = 4,000,000 bytes = 4 MB` (an 8,000× reduction from 32 GB, fitting entirely inside CPU L3 cache!).",
    "tags": [
      "top-k-heavy-hitters",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "top-k-heavy-hitters-t1",
    "topic": "top-k-heavy-hitters",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Why Count-Min Sketch Alone Cannot Enumerate Top-K Keys",
    "scenario": "A developer initializes a Count-Min Sketch (CMS) to find the Top 100 trending hashtags out of 50 million incoming tweets. At the end of the minute, they try to ask the CMS: \"Give me the 100 hashtag strings with the highest counts.\"",
    "prompt": "Why can't a standalone Count-Min Sketch answer `getTopK()`, and what companion structure completes the Heavy Hitters algorithm?",
    "question": "Why can't a standalone Count-Min Sketch answer `getTopK()`, and what companion structure completes the Heavy Hitters algorithm?",
    "options": [
      "A Count-Min Sketch stores all 50 million hashtag strings in sorted order",
      "A Count-Min Sketch underestimates counts due to hash collisions",
      "A Count-Min Sketch only stores hashed integer counters (`O(1)` frequency estimation `estimate(key)`), not the keys themselves; pair the CMS with a bounded Min-Heap of size `K` (or use Space-Saving / Misra-Gries summary counters) updated whenever `cms.estimate(key)` exceeds the heap minimum"
    ],
    "correctOption": 2,
    "reasons": [
      "Hash counters can be reversed to recover the original strings",
      "CMS errors are negative rather than positive",
      "CMS provides `estimate(item)` in fixed memory; maintaining a `K`-element Min-Heap alongside the CMS (or using Space-Saving's `O(1/ε)` monitored key table) retains the actual top-K strings and their counts"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Does a Count-Min Sketch store any key strings inside its `d × w` matrix of integers?",
    "explanation": "A Count-Min Sketch is a frequency oracle (`estimate(x)`), not a key container. Pairing it with a bounded `K`-size min-heap (or using the Space-Saving algorithm) tracks the actual top-K key strings in tiny bounded memory.",
    "tags": [
      "top-k-heavy-hitters",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["reservoir-sampling"] = [
  {
    "id": "reservoir-sampling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Acceptance probability",
    "section": "Random Sampling Over Infinite Streams",
    "prompt": "A reservoir of size K = 1,000 has already processed 5,000 items. With what probability is item 5,001 placed into the reservoir?",
    "options": [
      "1 divided by 1,000, because it replaces one specific slot",
      "1,000 divided by 5,000, the probability that applied to the previous item",
      "0.5, because every new item has an even chance against the incumbents",
      "1,000 divided by 5,001, from drawing j between 1 and i and keeping it if j is at most K"
    ],
    "answer": 3,
    "explanation": "Item i is kept with probability K divided by i, which here is 1,000 divided by 5,001, about 0.2, keeping every item's inclusion probability at K divided by N. 1 divided by 1,000 is the chance of evicting a particular incumbent once the item is kept.",
    "tags": [
      "reservoir-sampling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "reservoir-sampling-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Population-aware merge",
    "section": "Worked example: merging two workers correctly",
    "prompt": "Three workers saw 600,000, 200,000 and 200,000 events and each kept a 1,000-item reservoir. For a uniform merged sample of 1,000, how many items should come from each worker in expectation?",
    "options": [
      "About 333 from each, since each reservoir is equally uniform",
      "About 600, 200 and 200, proportional to how many events each worker saw",
      "1,000 from the first worker only, since it saw the majority of events",
      "About 500, 250 and 250, giving the largest worker half and splitting the rest"
    ],
    "answer": 1,
    "explanation": "Each slot should come from a worker with probability equal to its share of the total population, so 60, 20 and 20 percent. Equal draws over-represent the small workers' events by a factor of about 1.7.",
    "tags": [
      "reservoir-sampling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "reservoir-sampling-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Mergeable reproducible sampling",
    "section": "Variants",
    "prompt": "Hundreds of workers must each keep a sample so that any subset can be merged later into a uniform sample, and reruns must choose the same items. Which variant fits best?",
    "options": [
      "Bottom-K sampling with hashed keys: keep the K smallest hash values, and merge by taking the K smallest of the union",
      "Algorithm L, because skipping items between replacements makes the sample identical on reruns",
      "Weighted A-Res, because giving every item weight 1 makes merges exact without population counts",
      "Fixed-rate 1 percent sampling, because every worker's sample is already proportional to its traffic"
    ],
    "answer": 0,
    "explanation": "Hash-based bottom-K is deterministic and merges trivially without knowing each worker's population. Algorithm L only reduces random-number cost; it is still randomised and needs population-aware merging, while fixed-rate sampling does not give a bounded K.",
    "tags": [
      "reservoir-sampling",
      "staff",
      "inline"
    ]
  },
  {
    "id": "reservoir-sampling-n1",
    "topic": "reservoir-sampling",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Algorithm R Inclusion Probability Verification",
    "scenario": "You maintain a uniform Reservoir Sample of size `k = 1,000` items over an unbounded stream of distributed traces. Currently `n = 100,000` traces have passed through the stream.",
    "prompt": "Under Vitter's Algorithm R, what is the exact probability (in %) that any specific trace among the 100,000 seen so far is currently held in the 1,000-item reservoir?",
    "question": "Under Vitter's Algorithm R, what is the exact probability (in %) that any specific trace among the 100,000 seen so far is currently held in the 1,000-item reservoir?",
    "unit": "%",
    "answer": 1,
    "tolerance": 0.2,
    "hint": "Divide reservoir size `k = 1,000` by stream count `n = 100,000` and multiply by 100%.",
    "explanation": "By induction, replacing an existing item with probability `k / i` at step `i` guarantees every one of the `n = 100,000` items sits in the `k = 1,000` reservoir with exact uniform probability `k / n = 1,000 / 100,000 = 1%` without knowing `n` in advance.",
    "tags": [
      "reservoir-sampling",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "reservoir-sampling-t1",
    "topic": "reservoir-sampling",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Distributed Reservoir Sampling Across Heterogeneous-Volume Shards",
    "scenario": "You have 10 ingestion servers. Server 1 handles 90,000 requests/min while Servers 2..10 handle 1,000 requests/min each. Each server maintains a local reservoir of `k = 100` items. If the aggregator simply picks 10 items from each server's reservoir with equal weight, Server 1's traffic is massively under-represented.",
    "prompt": "How do you merge reservoir samples across shards with unequal stream volumes so the global sample remains strictly uniform?",
    "question": "How do you merge reservoir samples across shards with unequal stream volumes so the global sample remains strictly uniform?",
    "options": [
      "Take an equal number of samples from each server regardless of how many events that server saw",
      "Require all servers to ship 100% of raw events to a single central machine before sampling",
      "Use Weighted / Priority Reservoir Sampling (assigning each item a random key `u^(1/w)` or `u = Uniform(0,1)` and taking the global top-K smallest keys, or resampling proportionally to each shard's total observed count `N_i`)"
    ],
    "correctOption": 2,
    "reasons": [
      "Unweighted averaging across skewed shards produces an unbiased global sample",
      "Shipping 100% of raw events over the network defeats the purpose of edge sampling",
      "Tracking each shard's observed stream count `N_i` (or assigning each event an independent `Uniform(0,1)` priority key and merging the global minimum-`K` heap) preserves exact uniform inclusion probability across arbitrary shard skew"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How does assigning each item `r ~ Uniform(0,1)` and keeping the `K` smallest `r` values behave when you merge two heaps?",
    "explanation": "Assigning each stream item an independent `r ~ Uniform(0, 1)` (or `u^(1/w)` for weighted sampling) and keeping the `K` smallest values in a max-heap makes reservoir sampling trivially mergeable across distributed nodes!",
    "tags": [
      "reservoir-sampling",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["tdigest-quantile-sketch"] = [
  {
    "id": "tdigest-quantile-sketch-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Small tail centroids",
    "section": "Accurate Percentiles with t-digest",
    "prompt": "Why does t-digest restrict centroids near the extremes to be much smaller than centroids near the median?",
    "options": [
      "Because tail values are rarer, so small centroids there use less memory than large ones would",
      "Because SLA questions such as p99 and p99.9 live in the tails, and small centroids keep interpolation error low exactly there",
      "Because merging two digests requires the tail centroids to hold exactly one value each",
      "Because centroids near the median are discarded after compression, and only tail data is stored"
    ],
    "answer": 1,
    "explanation": "Keeping tail clusters tiny preserves resolution where percentile questions are asked, while large middle clusters save memory. The median region is not discarded; it is merely summarised more coarsely.",
    "tags": [
      "tdigest-quantile-sketch",
      "recall",
      "inline"
    ]
  },
  {
    "id": "tdigest-quantile-sketch-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Averaging p99 fails",
    "section": "Worked example: why averaging p99 lies",
    "prompt": "Host A served 9,800 requests at 20 ms each. Host B served 200 requests at 800 ms each. What is the true global p99, and what does averaging the host p99s give?",
    "options": [
      "True p99 about 410 ms; average of host p99s about 410 ms",
      "True p99 about 20 ms; average of host p99s about 410 ms",
      "True p99 about 800 ms; average of host p99s about 410 ms",
      "True p99 about 800 ms; average of host p99s about 800 ms"
    ],
    "answer": 2,
    "explanation": "The slowest 1 percent of 10,000 requests is 100 requests, all from host B at 800 ms, so the global p99 is 800 ms, while averaging 20 and 800 gives 410 ms. Percentiles are not averageable; merging digests combines the underlying distributions.",
    "tags": [
      "tdigest-quantile-sketch",
      "apply",
      "inline"
    ]
  },
  {
    "id": "tdigest-quantile-sketch-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Guaranteed error needs",
    "section": "Quantile summaries compared",
    "prompt": "A contract requires reported p99.9 latency to be within 1 percent relative error, over values from 50 microseconds to 60 seconds, across thousands of merged hosts. Which structure is the safest choice?",
    "options": [
      "t-digest with a higher compression parameter, since it is the most accurate at the tails",
      "A classic Prometheus histogram with ten buckets, since adding counts is exact",
      "KLL, since it guarantees rank error, which is the same thing as value error at the tail",
      "DDSketch, since it guarantees relative error across a wide range and merges exactly"
    ],
    "answer": 3,
    "explanation": "When an SLA needs a stated guarantee, a relative-error sketch such as DDSketch is the right tool; t-digest is empirically excellent but has no hard worst-case bound. KLL's rank guarantee can still mean a large value error in a steep tail.",
    "tags": [
      "tdigest-quantile-sketch",
      "staff",
      "inline"
    ]
  },
  {
    "id": "tdigest-quantile-sketch-n1",
    "topic": "tdigest-quantile-sketch",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Aggregating Distributed Latency Sketches vs Raw Samples",
    "scenario": "You monitor p99.9 API latency across 200 microservice pods handling 1,000,000 req/s total. Shipping raw 8-byte float64 latency samples for every request requires 8 MB/s. Instead, each of the 200 pods ships a 5 KB mergeable t-digest sketch once every 10 seconds.",
    "prompt": "What is the total network bandwidth (in KB/s) required to ship the 200 t-digest sketches every 10 seconds?",
    "question": "What is the total network bandwidth (in KB/s) required to ship the 200 t-digest sketches every 10 seconds?",
    "unit": "KB/s",
    "answer": 100,
    "tolerance": 0.25,
    "hint": "Total data per 10s window = 200 pods × 5 KB = 1,000 KB. Divide by 10 seconds.",
    "explanation": "200 pods × 5 KB = 1,000 KB every 10 seconds = 100 KB/s (an 80x reduction compared to 8,000 KB/s of raw samples), and bandwidth stays constant at 100 KB/s even if traffic surges from 1M to 50M req/s.",
    "tags": [
      "tdigest-quantile-sketch",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "tdigest-quantile-sketch-t1",
    "topic": "tdigest-quantile-sketch",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Averaging Pod p99s vs Merging t-Digest / DDSketch Centroids",
    "scenario": "An observability dashboard computes the fleet-wide p99 latency across 50 pods by taking the arithmetic mean of each pod's local p99 gauge (`avg(pod_p99)`). During an incident where 2 pods receive 60% of traffic and stall at 4,000 ms while 48 pods sit nearly idle at 10 ms, the dashboard reports fleet p99 = 169 ms.",
    "prompt": "Why did the dashboard hide the outage, and how should fleet percentiles be computed?",
    "question": "Why did the dashboard hide the outage, and how should fleet percentiles be computed?",
    "options": [
      "Use `max(pod_p99)` across all pods because the maximum of p99s equals the true fleet-wide p99",
      "Percentiles are non-additive across skewed partitions; each pod must emit mergeable quantile sketches (t-digest centroids or log-bucketed histograms) so the aggregator merges the distributions before extracting the true fleet p99",
      "Compute the harmonic mean of each pod's local p50 and multiply by 2"
    ],
    "correctOption": 1,
    "reasons": [
      "A single idle pod that processes 1 slow health check represents the 99th percentile of 10 million requests",
      "Averaging percentiles treats a pod handling 10 req/s identically to a pod handling 100,000 req/s; merging t-digest centroids or histograms preserves sample weights across the entire fleet",
      "Percentiles commute with arithmetic averages whenever request counts differ across nodes"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why is 'averaging percentiles' one of the classic observability anti-patterns?",
    "explanation": "Percentiles cannot be averaged or maxed across nodes with unequal traffic volumes or distribution shapes. Merging t-digest centroids (or Prometheus/DDSketch histogram buckets) weights every observation properly before computing the true global quantile.",
    "tags": [
      "tdigest-quantile-sketch",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["streaming-percentile-analytics"] = [
  {
    "id": "streaming-percentile-analytics-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Store sketches, not p99s",
    "section": "Architecting Streaming Percentiles",
    "prompt": "A pipeline computes a sketch per series every 10 seconds. Why should it store the sketch itself rather than only the p99 value it computes?",
    "options": [
      "Because sketches can be merged across hosts and time ranges later, while stored p99 values can never be combined correctly",
      "Because a TSDB cannot index floating-point percentile values efficiently",
      "Because a sketch is smaller on disk than a single double-precision p99 value",
      "Because p99 values must be recomputed at query time to adjust for clock skew"
    ],
    "answer": 0,
    "explanation": "The sketch, not the percentile, is the unit of storage, because only sketches support correct merges for arbitrary ranges and dimensions. A sketch is a few KB, much larger than one number; the point is mergeability, not size.",
    "tags": [
      "streaming-percentile-analytics",
      "recall",
      "inline"
    ]
  },
  {
    "id": "streaming-percentile-analytics-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Rollup arithmetic",
    "section": "Worked example: why rollups are needed",
    "prompt": "A service has 100 hosts and 30 endpoints, giving 3,000 series, with sketches emitted every 10 seconds. How many sketches must be merged for the whole-service p99 over the last hour without rollups, and with 1-minute service-level rollups?",
    "options": [
      "360 without rollups; 60 with rollups",
      "180,000 without rollups; 3,000 with rollups",
      "About 1.08 million without rollups; 60 with rollups",
      "About 1.08 million without rollups; 3,000 with rollups"
    ],
    "answer": 2,
    "explanation": "An hour is 360 ten-second buckets x 3,000 series = 1.08 million sketches, while service-level 1-minute rollups need just 60. The 3,000 answer forgets that the rollups are already merged across all series.",
    "tags": [
      "streaming-percentile-analytics",
      "apply",
      "inline"
    ]
  },
  {
    "id": "streaming-percentile-analytics-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Coordinated omission",
    "section": "Coordinated omission in one example",
    "prompt": "A closed-loop load tester sends one request every 5 ms but waits for each response before sending the next. The server stalls for 1 second. What does the naive report hide?",
    "options": [
      "Nothing important, because a single 1-second sample already shows up in p99.9",
      "The stall is double counted, because the tester records both the timeout and the retried request",
      "The server's own queueing time, which the tester cannot see from the client side",
      "About 200 requests that should have been sent during the stall and would each have waited up to 1 second"
    ],
    "answer": 3,
    "explanation": "Waiting for responses means the tester silently skips the sends it would have made, so one slow sample stands in for about 200; correct with expected-interval recording or use an open-loop generator. One slow sample among thousands barely moves the tail, which is exactly the illusion.",
    "tags": [
      "streaming-percentile-analytics",
      "staff",
      "inline"
    ]
  },
  {
    "id": "streaming-percentile-analytics-n1",
    "topic": "streaming-percentile-analytics",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: DDSketch / HDR Histogram Merge vs Raw Latency Array Memory",
    "scenario": "An API gateway handles 1,000,000 requests/minute across 100 pods (60,000,000 requests/hour). Storing all 60,000,000 raw `8-byte` float64 latencies to compute an exact hourly p99 takes `480 MB` per endpoint, whereas a mergeable DDSketch / t-digest with 1% relative accuracy takes `4 KB` per pod-minute (or `4 KB` once merged).",
    "prompt": "By what factor (`480,000 KB / 4 KB`) is a single merged `4 KB` hourly DDSketch smaller than the `480 MB` (`480,000 KB`) raw latency array?",
    "question": "By what factor (`480,000 KB / 4 KB`) is a single merged `4 KB` hourly DDSketch smaller than the `480 MB` (`480,000 KB`) raw latency array?",
    "unit": "x",
    "answer": 120000,
    "tolerance": 0.2,
    "hint": "Divide 480,000 KB by 4 KB.",
    "explanation": "A `4 KB` logarithmically bucketed DDSketch is `480,000 / 4 = 120,000×` smaller than storing 60M raw latencies while guaranteeing p99 relative error within ≤1%.",
    "tags": [
      "streaming-percentile-analytics",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "streaming-percentile-analytics-t1",
    "topic": "streaming-percentile-analytics",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Why Averaging Per-Host `p99` Numbers Is Mathematically Invalid",
    "scenario": "Each of 50 application pods computes its own local `p99` latency float every minute and sends that single float to the monitoring backend, which computes `AVG(pod_p99)` to display the \"cluster p99 latency\".",
    "prompt": "Why is averaging (or taking max of) pre-computed percentile floats across hosts or time windows a severe observability anti-pattern, and what must be shipped instead?",
    "question": "Why is averaging (or taking max of) pre-computed percentile floats across hosts or time windows a severe observability anti-pattern, and what must be shipped instead?",
    "options": [
      "Percentiles are linear and associative just like `SUM` and `COUNT`",
      "Taking the `MIN(pod_p99)` gives the exact global p99 across skewed pods",
      "Percentiles are non-mergeable order statistics (a pod with 10 requests and a pod with 100,000 requests cannot have their p99s averaged); pods must emit mergeable histogram buckets or quantile sketches (DDSketch, HDRHistogram, Prometheus native histograms) that sum bucket counts before extracting the global quantile"
    ],
    "correctOption": 2,
    "reasons": [
      "The average of 99th percentiles equals the 99th percentile of the union",
      "Traffic volume and tail distribution are always identical across every pod and minute",
      "Only by summing frequency counts across logarithmic histogram buckets (DDSketch / HDR Histogram) can you reconstruct the true cumulative distribution of the combined population across pods and time ranges"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "If Pod A serves 99,000 fast requests and Pod B serves 1,000 slow requests (all >500 ms), what is the true global p99 vs the average of Pod A's p99 and Pod B's p99?",
    "explanation": "In that example, all 1,000 slow requests on Pod B represent the top 1% of the 100,000 total requests (`global p99 > 500 ms`), whereas averaging Pod A's p99 and Pod B's p99 hides the outage. Mergeable histograms/DDSketches solve this.",
    "tags": [
      "streaming-percentile-analytics",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["live-reactions-high-throughput-design"] = [
  {
    "id": "live-reactions-high-throughput-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Slow viewers",
    "section": "System Design: Live Stream Reactions",
    "prompt": "A WebSocket server notices that one viewer on a poor connection is falling behind on reaction updates. What should it do?",
    "options": [
      "Buffer every update for that viewer in memory until the connection recovers, so no animation is lost",
      "Pause publishing for the whole stream until the slow viewer catches up, keeping all viewers in sync",
      "Bound the per-connection queue and drop stale visual updates, since the animations are cosmetic",
      "Switch the viewer to polling the durable reaction log directly at full event rate"
    ],
    "answer": 2,
    "explanation": "Reaction animations are cosmetic, so bounding queues and dropping stale updates protects server memory; the client can refetch a snapshot. Unbounded buffering per slow client is how one bad connection exhausts a server.",
    "tags": [
      "live-reactions-high-throughput-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "live-reactions-high-throughput-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Fan-out arithmetic",
    "section": "Worked example: why aggregation is mandatory",
    "prompt": "A live event has 5 million concurrent viewers across 500 edge servers. Reactions are aggregated per stream every 250 ms and one summary is sent to each viewer. How many messages per second does each edge server push?",
    "options": [
      "About 40,000",
      "About 10,000",
      "About 4,000",
      "About 20 million"
    ],
    "answer": 0,
    "explanation": "4 summaries per second x 5 million viewers is 20 million messages per second overall, and divided over 500 servers that is 40,000 each. 20 million is the cluster-wide total, and 10,000 is just the connection count per server.",
    "tags": [
      "live-reactions-high-throughput-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "live-reactions-high-throughput-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Durable reaction totals",
    "section": "Durability vs display",
    "prompt": "Reaction totals will now feed creator payouts. Today, ingest nodes buffer counts in memory for 2 seconds and publish to Redis Pub/Sub. What change is required?",
    "options": [
      "Enable Redis Pub/Sub persistence so every published summary is stored and replayable",
      "Before acknowledging, write an idempotent delta (stream, ingest node, batch sequence) to a durable log and derive the payout counter from it",
      "Shorten the buffer to 100 ms so a crash loses at most a tenth of a second of reactions",
      "Have each client report its own running total at the end of the stream and sum those"
    ],
    "answer": 1,
    "explanation": "A durable, idempotent delta written before acknowledgement makes the permanent total survive crashes and retries, while the display path stays lossy. Redis Pub/Sub is fire-and-forget with no persistence, and a shorter buffer shrinks the loss without eliminating it.",
    "tags": [
      "live-reactions-high-throughput-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "live-reactions-high-throughput-design-n1",
    "topic": "live-reactions-high-throughput-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Edge Fan-Out Coalescing for a 2M-Viewer Livestream",
    "scenario": "During a live sports broadcast with `2,000,000` concurrent viewers, viewers tap floating heart reactions at `100,000 reactions/sec`. If every individual reaction were broadcast to all 2,000,000 viewers, the server would send `2 × 10^11` messages/sec. Instead, edge aggregators coalesce reactions into a single summary frame (`{heart: +25000, fire: +8000}`) pushed at `4 Hz` (4 frames/sec) per viewer so the client animates a smooth particle burst.",
    "prompt": "How manymillions of outbound WebSocket frames per second (`2,000,000 viewers × 4 frames/s`, in millions) are sent across the edge fleet after 4 Hz coalescing?",
    "question": "How manymillions of outbound WebSocket frames per second (`2,000,000 viewers × 4 frames/s`, in millions) are sent across the edge fleet after 4 Hz coalescing?",
    "unit": "million frames/s",
    "answer": 8,
    "tolerance": 0.2,
    "hint": "Multiply 2 million viewers by 4 frames/sec.",
    "explanation": "Coalescing inbound reactions into a 250 ms (`4 Hz`) summary frame bounds outbound delivery to `2,000,000 × 4 = 8,000,000` frames/sec (8 million/sec) regardless of whether 1,000 or 1,000,000 reactions/sec arrive—a 25,000× reduction!",
    "tags": [
      "live-reactions-high-throughput-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "live-reactions-high-throughput-design-t1",
    "topic": "live-reactions-high-throughput-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Per-Event Fan-Out vs Hierarchical Edge Coalescing + Client Particle Rendering",
    "scenario": "5,000,000 people are watching a global keynote stream and tapping emoji reactions. Human eyes cannot distinguish more than ~20–30 animated emoji sprites per second on screen.",
    "prompt": "How should the live reaction ingestion and broadcast pipeline be architected?",
    "question": "How should the live reaction ingestion and broadcast pipeline be architected?",
    "options": [
      "Insert every emoji tap into a global ACID SQL table and fan out each individual tap to all 5,000,000 sockets via TCP",
      "Require every client to open a peer-to-peer WebRTC mesh connection to all 5,000,000 other viewers",
      "Terminate WebSockets at regional edge PoPs that locally sum inbound emoji counts over 200–500 ms windows, merge regional totals via an in-memory pub/sub tree, and broadcast a compact rate/count vector per tick that clients render via local randomized particle animations"
    ],
    "correctOption": 2,
    "reasons": [
      "Human eyes can track 500,000 individual emoji sprites per second with exact causal ordering",
      "A 5-million-peer WebRTC mesh runs on mobile phones",
      "Decoupling inbound write volume from outbound tick rate (`O(viewers × tick_hz)` instead of `O(viewers × reactions)`) makes outbound bandwidth completely invariant to reaction storms"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Does a viewer watching floating hearts need to know the exact `user_id` of each of the 100,000 people who tapped heart in the last second?",
    "explanation": "Live reactions are an aggregate visual effect, not a causal chat log. Aggregating deltas at edge PoPs over 250 ms ticks and driving client-side particle emitters bounds both server CPU and client battery/network usage.",
    "tags": [
      "live-reactions-high-throughput-design",
      "tradeoff",
      "staff"
    ]
  }
];
