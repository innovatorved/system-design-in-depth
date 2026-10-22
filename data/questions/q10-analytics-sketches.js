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
  }
];
