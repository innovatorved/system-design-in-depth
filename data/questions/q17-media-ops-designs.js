window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["ride-matching-system-design"] = [
  {
    "id": "ride-matching-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Ranking by ETA",
    "section": "Understanding the Ride Matching Problem",
    "prompt": "The geo index returns a driver 300 m away across a river and another 1.2 km away on the same road as the rider. How should the matching service rank them?",
    "options": [
      "By straight-line distance, so the 300 m driver is offered first",
      "By driver rating alone, since both are inside the search radius",
      "By routing-engine ETA with live traffic, which may favour the 1.2 km driver",
      "By geohash prefix length, so the driver in the rider's own cell wins"
    ],
    "answer": 2,
    "explanation": "The index only produces candidates; ranking uses a routing service's ETA because a driver close as the crow flies can be ten minutes away by road. Straight-line distance is the tempting shortcut the lesson warns against.",
    "tags": [
      "ride-matching-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "ride-matching-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Location write rate",
    "section": "Worked example: location ingestion",
    "prompt": "800,000 drivers are online, each sending a 100-byte ping every 5 seconds. What are the global write rate and payload bandwidth?",
    "options": [
      "About 16,000 writes per second and 1.6 MB/s",
      "About 4 million writes per second and 400 MB/s",
      "About 800,000 writes per second and 80 MB/s",
      "About 160,000 writes per second and 16 MB/s"
    ],
    "answer": 3,
    "explanation": "800,000 / 5 s is 160,000 writes per second, and at 100 B each that is 16 MB/s, spread across city shards with only the latest position kept in memory. The 800,000 option assumes one ping per second rather than one every five.",
    "tags": [
      "ride-matching-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "ride-matching-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Late accept",
    "section": "Driver state machine with locking",
    "prompt": "An offer to a driver times out after 15 s, the driver returns to AVAILABLE, and a new offer for another rider is sent. Then the driver's accept for the first offer arrives. What stops it stealing the driver?",
    "options": [
      "The accept must quote the current offer_id, so the stale one fails its conditional write",
      "The matching service always processes accepts in the order the offers were sent",
      "The driver app hides expired offers, so a late accept cannot be sent at all",
      "A distributed lock on the rider prevents two riders from sharing one driver"
    ],
    "answer": 0,
    "explanation": "Binding the accept to the offer_id recorded by the compare-and-set to OFFERED makes a late accept for an expired offer match zero rows. Relying on the app to hide expired offers is fragile, because network delay means the accept may already be in flight.",
    "tags": [
      "ride-matching-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "ride-matching-system-design-n1",
    "topic": "ride-matching-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Driver Location Ingestion Memory & Write Rate",
    "scenario": "A ride-sharing platform has `1,000,000` active online drivers sending GPS location pings every `4 seconds`. Each driver's current state in the in-memory Spatial Location Index (`driver_id`, `h3_cell`, `lat`, `lon`, `bearing`, `status`, `updated_at`) occupies `64 bytes`.",
    "prompt": "How many location updates per second (`1,000,000 / 4`, in thousands) hit the ingestion tier, while the entire 1M-driver spatial state takes only `64 MB` of RAM?",
    "question": "How many location updates per second (`1,000,000 / 4`, in thousands) hit the ingestion tier, while the entire 1M-driver spatial state takes only `64 MB` of RAM?",
    "unit": "thousand updates/s",
    "answer": 250,
    "tolerance": 0.2,
    "hint": "Divide 1,000,000 active drivers by 4 seconds per ping and express in thousands.",
    "explanation": "`1,000,000 drivers / 4 seconds = 250,000 updates/sec` (`250` thousand updates/s), and because active driver state is only `1,000,000 × 64 B = 64 MB`, the entire global or regional live location index fits comfortably in RAM!",
    "tags": [
      "ride-matching-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "ride-matching-system-design-t1",
    "topic": "ride-matching-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Greedy Nearest Straight-Line Match vs Batched Bipartite Road-Network ETA Matching + Dispatch Lock",
    "scenario": "Two riders 100 meters apart request a ride at the same second. Driver A is 200m from Rider 1 in straight-line distance (but on the wrong side of a highway divider requiring a 9-minute U-turn), while Driver B is 600m away on the same street (2-minute road ETA). Meanwhile, two dispatch workers might assign Driver B to both riders simultaneously.",
    "prompt": "Which dispatch architecture avoids both the highway-divider trap and double-dispatching the same driver?",
    "question": "Which dispatch architecture avoids both the highway-divider trap and double-dispatching the same driver?",
    "options": [
      "Assign whichever driver has the smallest Euclidean straight-line distance with no locking",
      "Broadcast the ride offer to 50 drivers at once and give the rider to whoever taps first without cancelling the other 49",
      "Query H3 hex rings for candidate drivers, score candidates by road-graph ETA + heading, solve micro-batched bipartite matching (Hungarian / min-cost flow over 1–2s windows) to optimize fleet ETA, and acquire an atomic per-driver lease lock (`SET driver_lock NX EX 15`) when dispatching an offer"
    ],
    "correctOption": 2,
    "reasons": [
      "Cars can drive straight across rivers and highway concrete dividers",
      "Assigning two riders to the same solo car improves utilization",
      "H3 filters spatial candidates fast, road-graph routing accounts for one-way streets/U-turns/heading, micro-window bipartite matching prevents locally greedy globally suboptimal pairings, and an atomic per-driver TTL lease prevents double assignment"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why can a driver 200m away take 9 minutes to arrive while a driver 600m away takes 2 minutes?",
    "explanation": "Combining H3 spatial candidate filtering, road-network + heading ETA scoring, micro-batched bipartite optimization, and atomic per-driver offer leases delivers accurate, race-free dispatch.",
    "tags": [
      "ride-matching-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["video-platform-system-design"] = [
  {
    "id": "video-platform-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Adaptive bitrate",
    "section": "Designing a Video Streaming Platform",
    "prompt": "A viewer watching a 1080p HLS stream moves into weak coverage and throughput drops sharply. What does adaptive bitrate streaming do?",
    "options": [
      "The server re-transcodes the current segment to a lower resolution on demand",
      "The player picks the next segment from a lower rendition listed in the manifest",
      "The CDN compresses the 1080p segment further before sending it to the device",
      "The player pauses and buffers the full 1080p video before resuming playback"
    ],
    "answer": 1,
    "explanation": "Every rendition is pre-encoded and segmented, and the manifest lists them, so the player simply requests its next few seconds at a lower bitrate. Nothing is transcoded on demand; that work happened once, offline, after upload.",
    "tags": [
      "video-platform-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "video-platform-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Egress and CDN hit ratio",
    "section": "Worked example: storage and egress",
    "prompt": "A live event has 4 million concurrent viewers at an average of 5 Mbps, and the CDN hit ratio is 95%. How much bandwidth does the origin serve?",
    "options": [
      "About 20 Tbps, the full audience demand",
      "About 100 Gbps, from 5% of 2 Tbps",
      "About 1 Tbps, 5% of 20 Tbps",
      "About 19 Tbps, 95% of 20 Tbps"
    ],
    "answer": 2,
    "explanation": "Total demand is 4,000,000 x 5 Mbps = 20 Tbps, and the 5% of requests that miss the CDN reach the origin, about 1 Tbps. 19 Tbps is what the edges serve, not the origin, which shows why hit ratio is the lever that matters.",
    "tags": [
      "video-platform-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "video-platform-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Segments for live sports",
    "section": "Segment length trade-off",
    "prompt": "A sports streamer using 6-second segments hears that viewers see goals 20 or more seconds after TV viewers and that quality adapts slowly. What change fits, and at what cost?",
    "options": [
      "Switch from H.264 to AV1, cutting bitrate but raising encoding cost",
      "Lengthen segments to 10 s, improving compression but raising start time",
      "Raise the CDN TTL, so segments stay cached longer at the edge",
      "Use 2 s or low-latency partial segments, at the cost of more requests and worse compression"
    ],
    "answer": 3,
    "explanation": "Shorter segments, or LL-HLS/DASH partial segments, cut glass-to-glass latency and let the player switch renditions sooner, but they add requests, manifest entries and CDN complexity. A better codec saves bandwidth but does nothing for latency, which is governed by segment duration.",
    "tags": [
      "video-platform-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "video-platform-system-design-n1",
    "topic": "video-platform-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Chunked Parallel GOP Transcoding Speedup",
    "scenario": "A creator uploads a `60-minute` (`3,600-second`) 4K video. Encoding it sequentially on a single worker into 5 ABR renditions runs at `0.5×` real-time (`7,200 seconds` = `2 hours`). Instead, the ingest splitter cuts the video at keyframe (GOP) boundaries into `60` independent `1-minute` segments and dispatches them across `60` parallel transcoding workers.",
    "prompt": "How many seconds (`60s segment / 0.5× speed`) does it take to transcode the entire 60-minute video when all 60 1-minute GOP segments run in parallel?",
    "question": "How many seconds (`60s segment / 0.5× speed`) does it take to transcode the entire 60-minute video when all 60 1-minute GOP segments run in parallel?",
    "unit": "seconds",
    "answer": 120,
    "tolerance": 0.2,
    "hint": "Each 60-second segment encodes at 0.5× real-time (`60 / 0.5 = 120 seconds`), and all 60 segments run concurrently.",
    "explanation": "Splitting at GOP keyframe boundaries allows all 60 1-minute segments to encode concurrently in `60 / 0.5 = 120 seconds` (2 minutes instead of 2 hours—a 60× latency reduction!).",
    "tags": [
      "video-platform-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "video-platform-system-design-t1",
    "topic": "video-platform-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Progressive Monolithic MP4 Download vs HLS/DASH Adaptive Bitrate (ABR) + Tiered Edge CDN",
    "scenario": "A video platform serves 10M concurrent viewers across mobile 4G networks (where bandwidth fluctuates between 1.5 Mbps and 25 Mbps) and home fiber connections.",
    "prompt": "Why do all major streaming platforms use segmented HLS/DASH Adaptive Bitrate (ABR) over CDN origin shields rather than serving a single monolithic `.mp4` file?",
    "question": "Why do all major streaming platforms use segmented HLS/DASH Adaptive Bitrate (ABR) over CDN origin shields rather than serving a single monolithic `.mp4` file?",
    "options": [
      "Serve a single 4 GB 4K `.mp4` file to all mobile users so the player stalls whenever cellular signal drops",
      "Open a stateful WebSocket to the origin database to stream video frames",
      "Encode each video into time-aligned GOP segments (2–6s `.ts`/`.m4s` chunks) across a bitrate/resolution ladder (240p..4K) described by an `.m3u8`/`.mpd` manifest, allowing the client player to switch quality per chunk seamlessly and CDN edge PoPs to cache popular 2-second chunks with high hit ratios"
    ],
    "correctOption": 2,
    "reasons": [
      "Downloading 4 GB when a user quits watching after 15 seconds saves egress bandwidth",
      "Video chunks are dynamic per-user data that cannot be cached at CDN edge PoPs",
      "Keyframe-aligned 2–6s chunks let the client dynamically step bitrates up/down on every segment boundary without rebuffering, bound wasted bytes when users abandon early, and turn video delivery into standard cacheable immutable HTTP GETs at the CDN edge"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens when a user enters an elevator if the video is split into 4-second keyframe-aligned chunks at multiple bitrates?",
    "explanation": "HLS/DASH ABR splits video into immutable 2–6s keyframe-aligned chunks across a bitrate ladder so the client player adapts to network bandwidth chunk-by-chunk while CDN edges cache the immutable segments.",
    "tags": [
      "video-platform-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["file-sync-system-design"] = [
  {
    "id": "file-sync-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Offline edit conflict",
    "section": "Designing a File Sync Service (Dropbox/Google Drive)",
    "prompt": "Two laptops edit the same .docx while offline and both come online. What is the standard way a file-sync service handles this?",
    "options": [
      "Keep the version with the later device timestamp and discard the other",
      "Keep both, saving the second arrival as a conflicted copy for the user",
      "Merge the two binary files block by block using their chunk hashes",
      "Reject both uploads until the user picks one on the web interface"
    ],
    "answer": 1,
    "explanation": "The service cannot merge an opaque binary format safely, so it preserves both and lets the user resolve the conflicted copy. Picking the later timestamp silently loses work, and device clocks drift so the later timestamp may not even be the later edit.",
    "tags": [
      "file-sync-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "file-sync-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Insert near the start",
    "section": "Worked example: editing a 100 MB file",
    "prompt": "A 200 MB file is stored as 4 MB chunks. The user inserts 2 KB near the beginning. Roughly how much is uploaded with fixed-size chunks versus content-defined chunking?",
    "options": [
      "About 4 MB with either approach",
      "About 200 MB with either approach",
      "About 200 MB fixed versus about 4 MB content-defined",
      "About 4 MB fixed versus about 200 MB content-defined"
    ],
    "answer": 2,
    "explanation": "With fixed boundaries the insertion shifts every later chunk, so all 50 hashes change and the whole file is re-sent. A rolling hash re-anchors boundaries to content, so only the chunk containing the insertion changes. Fixed chunks work well only for appends or in-place replacements.",
    "tags": [
      "file-sync-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "file-sync-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Dedup leaks information",
    "section": "Chunking and sync choices",
    "prompt": "With global cross-user deduplication, an upload of a known leaked document completes instantly with upload skipped. Why is this a problem, and what is the safer design?",
    "options": [
      "It reveals another account already stores that content; deduplicate per user or require proof of possession",
      "It wastes metadata space on duplicate references; compact references nightly",
      "It breaks conflict detection between devices; use server revisions instead",
      "It exposes the chunk size to clients; switch to content-defined chunk sizes"
    ],
    "answer": 0,
    "explanation": "An instant skip is an oracle telling an attacker that someone else has the file, so global dedup trades storage savings for privacy. Per-user or per-team scope, or proof that the client actually holds the bytes, closes the leak. The other options describe unrelated concerns.",
    "tags": [
      "file-sync-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "file-sync-system-design-n1",
    "topic": "file-sync-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Content-Defined Chunking Bandwidth Savings on Large File Edits",
    "scenario": "A user edits 1 slide inside a 100 MB PowerPoint presentation and saves the file. Instead of re-uploading the entire 100 MB file, the client splits the file using Rabin-Karp Content-Defined Chunking (CDC) with a 4 MB average chunk size and only uploads the single modified 4 MB chunk.",
    "prompt": "What percentage of upload bandwidth is saved by uploading only the 1 modified 4 MB chunk instead of the full 100 MB file?",
    "question": "What percentage of upload bandwidth is saved by uploading only the 1 modified 4 MB chunk instead of the full 100 MB file?",
    "unit": "%",
    "answer": 96,
    "tolerance": 0.25,
    "hint": "(100 MB - 4 MB) ÷ 100 MB = 96%.",
    "explanation": "Uploading only the single dirty 4 MB content-addressed block (`SHA-256` hash) instead of the 100 MB file transfers 4 MB instead of 100 MB, saving `(100 - 4) / 100 = 96%` of network bandwidth and cloud storage.",
    "tags": [
      "file-sync-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "file-sync-system-design-t1",
    "topic": "file-sync-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Fixed-Size Block Chunking vs Rabin-Karp Content-Defined Chunking (CDC)",
    "scenario": "A user inserts 100 bytes at the very beginning (byte offset 0) of a 1 GB video project file. Your file sync client must determine which blocks to upload to object storage.",
    "prompt": "Why does Fixed-Size Block Chunking fail on byte-shifting insertions, and how does Content-Defined Chunking (CDC) solve it?",
    "question": "Why does Fixed-Size Block Chunking fail on byte-shifting insertions, and how does Content-Defined Chunking (CDC) solve it?",
    "options": [
      "Fixed-size 4 MB chunking detects the 100-byte shift and leaves all subsequent 249 chunk hashes unchanged",
      "Inserting 100 bytes at offset 0 shifts every fixed 4 MB boundary across the entire 1 GB file (invalidating 100% of chunk SHA-256 hashes); Content-Defined Chunking uses a rolling Rabin fingerprint to cut chunk boundaries based on local content patterns so only the first chunk changes",
      "Use 1-byte chunks so each byte has its own 32-byte SHA-256 hash in the metadata database"
    ],
    "correctOption": 1,
    "reasons": [
      "Shifting bytes by 100 positions never changes fixed-offset `0..4MB`, `4MB..8MB` slices",
      "A rolling hash (Rabin-Karp / Gear) anchors chunk boundaries to local byte sequences (`fingerprint % mask == 0`), localizing insertions/deletions to 1–2 chunks and preserving deduplication for the rest of the file",
      "Storing 32 bytes of SHA-256 metadata per 1 byte of file data reduces storage costs by 32x"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What happens to `file[0..4MB]`, `file[4MB..8MB]` when you prepend 100 bytes at index 0?",
    "explanation": "With fixed-offset chunks, prepending 100 bytes shifts every single byte boundary, changing the SHA-256 of all 250 chunks in a 1 GB file. Rolling-hash Content-Defined Chunking locks back onto the same natural content boundary right after the edit, so 249 of 250 chunks remain deduplicated.",
    "tags": [
      "file-sync-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["observability-slo-case-study"] = [
  {
    "id": "observability-slo-case-study-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Symptoms not causes",
    "section": "Designing Observability and SLOs",
    "prompt": "A team pages on CPU above 80%. Why does the lesson prefer paging on SLO burn rate instead?",
    "options": [
      "CPU metrics are too expensive to scrape at the resolution paging needs",
      "Burn-rate alerts need no metrics backend because they use logs",
      "CPU pages when users are fine and can stay quiet while every request fails fast",
      "CPU alerts cannot be routed through Alertmanager to PagerDuty"
    ],
    "answer": 2,
    "explanation": "Cause-based alerts are both noisy and blind: high CPU with happy users wakes people for nothing, and a fast-failing outage can leave CPU idle. Burn-rate alerts fire on what users experience. The cost and tooling options are simply not true.",
    "tags": [
      "observability-slo-case-study",
      "recall",
      "inline"
    ]
  },
  {
    "id": "observability-slo-case-study-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Budget consumed by a deploy",
    "section": "Worked example: SLOs for a checkout service",
    "prompt": "Checkout handles 3 million requests in 28 days with a 99.9% availability SLO. A bad deploy fails 10% of requests for 30 minutes at about 75 requests per minute. What share of the budget did it burn?",
    "options": [
      "About 0.75% of the budget",
      "About 75% of the budget",
      "About 25% of the budget",
      "About 7.5% of the budget"
    ],
    "answer": 3,
    "explanation": "The budget is 0.1% of 3 million, or 3,000 failed requests. The deploy served 2,250 requests and failed 10% of them, 225, which is 7.5% of the budget. The 75% answer comes from dividing all 2,250 requests, not just the failures, into the budget.",
    "tags": [
      "observability-slo-case-study",
      "apply",
      "inline"
    ]
  },
  {
    "id": "observability-slo-case-study-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Why two windows",
    "section": "Prometheus rules for the fast-burn page",
    "prompt": "A fast-burn page fires only on the 1-hour error ratio exceeding 14.4 x 0.001. After a rollback fixes the problem, the page keeps firing for most of an hour. What does adding the 5-minute condition achieve?",
    "options": [
      "It makes the page fire earlier for slow, gradual budget burns",
      "It lets the alert resolve quickly once recent errors drop, while the long window keeps it meaningful",
      "It replaces the long window, so pages depend only on the latest 5 minutes",
      "It halves the threshold, so smaller incidents also page the on-call"
    ],
    "answer": 1,
    "explanation": "Requiring both windows means the 1-hour ratio proves the burn is significant, and the 5-minute ratio proves it is still happening, so the alert clears soon after mitigation. Slow burns are caught by the separate 6-hour and 30-minute ticket rule, not by the short window.",
    "tags": [
      "observability-slo-case-study",
      "staff",
      "inline"
    ]
  },
  {
    "id": "observability-slo-case-study-n1",
    "topic": "observability-slo-case-study",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Multi-Window Multi-Burn-Rate Alert Precision (`14.4×` Burn)",
    "scenario": "Following the Google SRE Workbook standard for a `99.9%` 30-day (`720-hour`) SLO, a critical page alert fires when the service consumes `2%` of its entire 30-day error budget within a `1-hour` window (verified by a short `5-minute` window also burning at that same rate so the alert resets within 5 minutes of recovery).",
    "prompt": "Consuming `2%` (`0.02`) of a `720-hour` budget in `1 hour` corresponds to what burn rate multiplier (`0.02 × 720`)?",
    "question": "Consuming `2%` (`0.02`) of a `720-hour` budget in `1 hour` corresponds to what burn rate multiplier (`0.02 × 720`)?",
    "unit": "x",
    "answer": 14.4,
    "tolerance": 0.2,
    "hint": "Multiply `0.02` (2% of budget) by `720` hours in 30 days.",
    "explanation": "Burning 2% of a 720-hour budget in 1 hour is a `0.02 × 720 = 14.4×` burn rate (meaning 100% of the monthly budget would vanish in `720 / 14.4 = 50 hours`).",
    "tags": [
      "observability-slo-case-study",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "observability-slo-case-study-t1",
    "topic": "observability-slo-case-study",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Symptom-Based Multi-Window Burn-Rate Alerts vs Cause-Based CPU/Memory Threshold Paging",
    "scenario": "An on-call rotation receives 40 pages per week whenever any single pod's CPU hits 85% for 2 minutes or a single disk compaction spikes I/O, even though user-facing latency and error rates are completely healthy. Eventually engineers mute PagerDuty and miss a real customer outage.",
    "prompt": "How should paging alerts be redesigned to eliminate alert fatigue while catching real outages fast?",
    "question": "How should paging alerts be redesigned to eliminate alert fatigue while catching real outages fast?",
    "options": [
      "Page on-call engineers whenever any pod exceeds 60% CPU for 30 seconds",
      "Disable all alerts and rely on Twitter complaints",
      "Page humans exclusively on user-facing SLO symptom burn rates using Multi-Window Multi-Burn-Rate thresholds (e.g., 1h + 5m windows at 14.4× burn for page, 6h + 30m at 6× for page/ticket), and route resource/cause metrics (CPU, disk, cache hit rate) to diagnostic dashboards and non-paging capacity tickets"
    ],
    "correctOption": 2,
    "reasons": [
      "High CPU utilization with 0% errors and fast latency is an emergency requiring 3 AM human wake-ups",
      "Single short-window alerts never flap or fail to reset cleanly",
      "Paging on SLO error-budget burn ensures every human wake-up corresponds to genuine customer pain, while requiring both a long window (1h) and short confirmation window (5m) prevents false spikes and immediately clears the alert once mitigated"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why does Google SRE combine a 1-hour window AND a 5-minute window in the same alert condition?",
    "explanation": "A 1-hour window alone stays red for up to 59 minutes after a 2-minute outage ends; intersecting a 1-hour window with a 5-minute window at `14.4×` burn guarantees both high precision (no transient blips) and fast reset (<5 min after fix).",
    "tags": [
      "observability-slo-case-study",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["zero-downtime-database-migration-case-study"] = [
  {
    "id": "zero-downtime-database-migration-case-study-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why pause writes",
    "section": "Zero Downtime Database Migrations",
    "prompt": "During a CDC-based move from MySQL to PostgreSQL, why does the cutover briefly pause application writes?",
    "options": [
      "So the final transactions replicate and nothing is written to both databases at once",
      "So the CDC tool can take a fresh full snapshot of the source",
      "So PostgreSQL can rebuild its indexes before accepting traffic",
      "So the application can run its schema migrations on MySQL"
    ],
    "answer": 0,
    "explanation": "With writes stopped, CDC lag can reach exactly zero, the final position is verified, and the connection switches with no writes lost or split between two primaries. A fresh snapshot is not needed at cutover, since CDC has been streaming changes since the initial copy.",
    "tags": [
      "zero-downtime-database-migration-case-study",
      "recall",
      "inline"
    ]
  },
  {
    "id": "zero-downtime-database-migration-case-study-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Snapshot duration",
    "section": "Worked example: 6 TB MySQL to PostgreSQL",
    "prompt": "You must migrate 12 TB with a parallel initial copy running at about 400 MB/s. How long does the snapshot take, and what must you record at its start?",
    "options": [
      "About 3 hours; the row count of every table",
      "About 30 hours; the current wall-clock time",
      "About 8 hours; the binlog position or GTID",
      "About 8 hours; a checksum of each table"
    ],
    "answer": 2,
    "explanation": "12,000,000 MB / 400 MB/s is 30,000 s, a little over 8 hours, and the GTID at snapshot start is where CDC must resume so no change is missed or applied twice. Checksums matter for verification later, but they do not tell CDC where to begin.",
    "tags": [
      "zero-downtime-database-migration-case-study",
      "apply",
      "inline"
    ]
  },
  {
    "id": "zero-downtime-database-migration-case-study-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Rollback after cutover",
    "section": "Cutover sequence",
    "prompt": "Three days after switching writes to PostgreSQL, a serious bug appears and the team wants to return to MySQL without losing those three days of writes. What must already be in place?",
    "options": [
      "A final MySQL dump taken just before the cutover began",
      "Row counts that matched between both databases at cutover",
      "Shadow reads against MySQL for the week after cutover",
      "Reverse CDC from PostgreSQL to MySQL started before writes resumed"
    ],
    "answer": 3,
    "explanation": "Only reverse replication, started before writes were re-enabled, keeps MySQL current with post-cutover changes, so rollback is a connection switch rather than data loss. A pre-cutover dump is tempting but is missing exactly the three days of writes you need.",
    "tags": [
      "zero-downtime-database-migration-case-study",
      "staff",
      "inline"
    ]
  },
  {
    "id": "zero-downtime-database-migration-case-study-n1",
    "topic": "zero-downtime-database-migration-case-study",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Dual-Write Backfill Duration With Throttled Batching",
    "scenario": "You are migrating a 500 million row `orders` table to a new sharded database without downtime. Alongside live CDC / dual-writing, a background backfill worker migrates historical rows in batches at a throttled rate of 50,000 rows/sec so primary OLTP latency is unaffected.",
    "prompt": "How many seconds (in thousands of seconds, i.e., `500,000,000 ÷ 50,000 ÷ 1,000`) does the historical backfill take to scan all 500 million rows?",
    "question": "How many seconds (in thousands of seconds, i.e., `500,000,000 ÷ 50,000 ÷ 1,000`) does the historical backfill take to scan all 500 million rows?",
    "unit": "k seconds",
    "answer": 10,
    "tolerance": 0.25,
    "hint": "500,000,000 rows ÷ 50,000 rows/s = 10,000 seconds = 10 k seconds (~2.78 hours).",
    "explanation": "500,000,000 rows ÷ 50,000 rows/sec = 10,000 seconds (`10 k seconds`, or ~2 hours 47 minutes), allowing the entire backfill and shadow-read verification to complete safely within a single workday.",
    "tags": [
      "zero-downtime-database-migration-case-study",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "zero-downtime-database-migration-case-study-t1",
    "topic": "zero-downtime-database-migration-case-study",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Backfill vs Live Write Race Condition & Cutover Verification",
    "scenario": "During a zero-downtime migration from `DB_Old` to `DB_New`, the historical backfill worker reads row `id = 42` (`version = 1`) from `DB_Old`. Before the backfill worker writes `version = 1` to `DB_New`, a live user request updates row `id = 42` to `version = 2` in both `DB_Old` and `DB_New`. The backfill worker then finishes and overwrites `DB_New` with stale `version = 1`.",
    "prompt": "How do you prevent the historical backfill from overwriting newer live writes in `DB_New`, and how do you validate readiness before switching reads?",
    "question": "How do you prevent the historical backfill from overwriting newer live writes in `DB_New`, and how do you validate readiness before switching reads?",
    "options": [
      "Pause all live user writes for 3 hours while the backfill runs",
      "Make backfill writes conditional (`INSERT ... ON CONFLICT DO UPDATE WHERE excluded.version > existing.version` or drive both backfill and live updates through the same ordered CDC/LSN stream), and run asynchronous shadow-read parity checks (`dark reads`) before shifting read/write authority",
      "Switch 100% of production reads and writes to `DB_New` before starting the backfill"
    ],
    "correctOption": 1,
    "reasons": [
      "3 hours of write downtime meets a zero-downtime migration requirement",
      "Conditional version/LSN guards ensure an older backfill snapshot never clobbers a newer live mutation, and dark shadow-read comparison proves data parity before any user sees `DB_New` data",
      "Cutting over to an empty database before backfilling avoids stale data races"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What guard condition on `DB_New` ensures `v1` from a slow backfill thread never overwrites `v2` from a live request?",
    "explanation": "Enforcing monotonic version/LSN predicates (`WHERE incoming.version > target.version`, or `INSERT ... ON CONFLICT DO NOTHING` when live dual-writes always write the latest version) prevents backfill races, while shadow-comparing reads (`DB_Old` vs `DB_New`) verifies 100% parity prior to cutover.",
    "tags": [
      "zero-downtime-database-migration-case-study",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["interview-design-instagram"] = [
  {
    "id": "interview-design-instagram-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Pre-signed uploads",
    "section": "Designing a Photo-Sharing App (Instagram)",
    "prompt": "In the recommended upload design, how do photo bytes get from the phone into object storage?",
    "options": [
      "The app PUTs them directly to S3 using a pre-signed URL from the API",
      "The app sends them over the feed WebSocket in small frames",
      "The app streams them to the post API, which forwards them to S3",
      "The app uploads them to the CDN edge, which writes them back to S3"
    ],
    "answer": 0,
    "explanation": "The API only issues a pre-signed URL and a media_id, so large bytes bypass the application tier and API servers stay small and stateless. Routing bytes through the API works, but it wastes API capacity and is the trap the lesson calls out.",
    "tags": [
      "interview-design-instagram",
      "recall",
      "inline"
    ]
  },
  {
    "id": "interview-design-instagram-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Image read rate",
    "section": "Worked example: back-of-the-envelope numbers",
    "prompt": "300 million daily users each view about 80 images per day, and the CDN absorbs 95% of fetches. Roughly what image request rate reaches the origin?",
    "options": [
      "About 278,000 per second",
      "About 1,400 per second",
      "About 139,000 per second",
      "About 14,000 per second"
    ],
    "answer": 3,
    "explanation": "300 million x 80 is 24 billion fetches per day, about 278,000 per second on average, and 5% of that is roughly 14,000 per second at the origin. 278,000 is the total demand before the CDN takes its share.",
    "tags": [
      "interview-design-instagram",
      "apply",
      "inline"
    ]
  },
  {
    "id": "interview-design-instagram-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Viral like counter",
    "section": "Storage by data type",
    "prompt": "A viral post receives thousands of likes per second and UPDATE posts SET likes = likes + 1 causes lock contention on that row. What is the better design?",
    "options": [
      "Store each like as its own row and maintain the count with sharded or asynchronous counters",
      "Wrap the UPDATE in a serializable transaction so no increments are lost",
      "Move the posts table to a larger primary so the row lock is released faster",
      "Cache the like count in the CDN and recompute it from the database hourly"
    ],
    "answer": 0,
    "explanation": "Likes are write-heavy, so they go in a wide-column store as individual rows, with counts aggregated asynchronously or spread over sharded counters to avoid one hot row. Stronger isolation makes the contention worse, and a bigger primary does not change that every increment serialises on the same row.",
    "tags": [
      "interview-design-instagram",
      "staff",
      "inline"
    ]
  },
  {
    "id": "interview-design-instagram-n1",
    "topic": "interview-design-instagram",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Instagram Daily Photo Storage Across 4 Resolutions",
    "scenario": "Users upload 100 million new photos per day. Your media pipeline stores 4 resized/compressed WebP/AVIF variants per uploaded photo (thumbnail, small, medium, large) with a combined total size of 500 KB per uploaded photo.",
    "prompt": "How many terabytes per day (TB/day, using 1 TB = 1,000,000,000 KB) of logical object storage are required for the 100 million daily photo uploads?",
    "question": "How many terabytes per day (TB/day, using 1 TB = 1,000,000,000 KB) of logical object storage are required for the 100 million daily photo uploads?",
    "unit": "TB/day",
    "answer": 50,
    "tolerance": 0.25,
    "hint": "Multiply 100,000,000 photos/day × 500 KB/photo and divide by 10^9 KB/TB.",
    "explanation": "100,000,000 photos/day × 500 KB = 50,000,000,000 KB/day = 50 TB/day of new media objects (~18.25 PB/year).",
    "tags": [
      "interview-design-instagram",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "interview-design-instagram-t1",
    "topic": "interview-design-instagram",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Pre-Generating All 30 Image Sizes on Upload vs On-Demand Edge Resizing with Origin Caching",
    "scenario": "Over 10 years, mobile screen densities and aspect ratios evolve, creating 30 possible image crop/resolution variants. However, 70% of uploaded photos are never viewed again after their first 48 hours.",
    "prompt": "Which image resizing and caching architecture optimizes compute and storage across hot recent photos and the 10-year cold tail?",
    "question": "Which image resizing and caching architecture optimizes compute and storage across hot recent photos and the 10-year cold tail?",
    "options": [
      "Eagerly pre-generate and store all 30 resolution/format variants for every single photo on upload, and keep all 30 variants in hot SSD storage forever",
      "Eagerly generate only the 2–3 canonical feed resolutions on upload (or resize on-the-fly at an Origin-Shield image proxy on first cache miss and cache in CDN), while tiering original/cold media older than 30 days to erasure-coded cold object storage",
      "Resize images on the primary PostgreSQL metadata database using PL/pgSQL triggers"
    ],
    "correctOption": 1,
    "reasons": [
      "Storing 30 copies of unviewed photos reduces cloud storage bills by 30x",
      "On-demand edge/shield resizing (cached in CDN after first request) plus hot/cold storage tiering avoids burning CPU and storage on the 27 unused variants and the 70% cold tail",
      "PostgreSQL triggers are the industry standard for SIMD WebP image encoding"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why pre-compute 30 variants for photos that only ever get viewed in 2 sizes during their first 48 hours?",
    "explanation": "Generating only the core feed sizes (or resizing lazily on first CDN miss behind an Origin Shield with URL signature verification) avoids 90% of wasted transcoding CPU and storage bloat, while lifecycle tiering moves cold originals to low-cost erasure-coded storage.",
    "tags": [
      "interview-design-instagram",
      "tradeoff",
      "staff"
    ]
  }
];
