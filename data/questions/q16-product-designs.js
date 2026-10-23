window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["notification-system-design"] = [
  {
    "id": "notification-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "OTPs behind a blast",
    "section": "Key Architectural Components",
    "prompt": "A 50-million-user marketing campaign and password-reset codes share one Kafka topic and worker pool. During the campaign, OTPs arrive 40 minutes late. What is the structural fix?",
    "options": [
      "Add more workers to the shared pool until the backlog drains faster",
      "Give each priority its own queues, workers and provider connections",
      "Deduplicate campaign messages in Redis so fewer reach the queue",
      "Lower the frequency cap so each user receives fewer campaign pushes"
    ],
    "answer": 1,
    "explanation": "Priority isolation means bulk traffic physically cannot sit in front of an OTP, so OTP latency stays at seconds regardless of campaign size. More shared workers only shortens the delay; any sufficiently large blast still starves OTPs.",
    "tags": [
      "notification-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "notification-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing a push fan-out",
    "section": "Worked example: a breaking-news push to 50 million users",
    "prompt": "Product wants a push delivered to 30 million users within 2 minutes. Each worker sustains about 2,500 APNs sends per second over its HTTP/2 connection pool. About how many workers do you need?",
    "options": [
      "About 12 workers",
      "About 200 workers",
      "About 1,000 workers",
      "About 100 workers"
    ],
    "answer": 3,
    "explanation": "30,000,000 / 120 s is 250,000 sends per second, and 250,000 / 2,500 is 100 workers, pre-warmed and autoscaled on queue lag. 200 comes from spreading the send over one minute instead of two.",
    "tags": [
      "notification-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "notification-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Push is not durable",
    "section": "Channel trade-offs",
    "prompt": "An iPhone is offline for a day while the app sends it five security alerts via APNs. When it reconnects, only the last alert appears. What explains this, and what should carry must-not-lose messages?",
    "options": [
      "APNs keeps only the latest notification per app for offline devices; use a durable in-app inbox",
      "The dedup cache merged the alerts within its window; use a unique idempotency key per alert",
      "The frequency cap dropped four of the five alerts; exempt security alerts from the cap",
      "The device token went stale after a day offline; refresh tokens before each send"
    ],
    "answer": 0,
    "explanation": "For offline devices APNs stores only the most recent notification per app, so acceptance by APNs is not delivery. Messages that must not be lost belong in your own durable inbox, with push only as a nudge. Dedup and caps are plausible causes but would not explain the pattern of keeping exactly the latest.",
    "tags": [
      "notification-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "notification-system-design-n1",
    "topic": "notification-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Breaking-News Push Notification Fan-Out Rate",
    "scenario": "A breaking-news alert must be delivered to `30,000,000` subscribed mobile devices within `60 seconds` (`1 minute`). Each APNs / FCM batch HTTP/2 request delivers up to `500` device tokens.",
    "prompt": "How many thousands of outgoing push-gateway requests per second (`30,000,000 / 60s` devices = `500,000 devices/s`) in terms of individual device pushes per second (in thousands, i.e., `500` thousand devices/s) must the dispatcher pipeline sustain?",
    "question": "How many thousands of outgoing push-gateway requests per second (`30,000,000 / 60s` devices = `500,000 devices/s`) in terms of individual device pushes per second (in thousands, i.e., `500` thousand devices/s) must the dispatcher pipeline sustain?",
    "unit": "thousand pushes/s",
    "answer": 500,
    "tolerance": 0.2,
    "hint": "Divide 30,000,000 devices by 60 seconds and express in thousands.",
    "explanation": "30,000,000 devices / 60 seconds = 500,000 pushes/sec (500 thousand pushes/sec, or 1,000 batched HTTP/2 calls/sec of 500 tokens each).",
    "tags": [
      "notification-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "notification-system-design-t1",
    "topic": "notification-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Priority Lane Isolation (OTP / 2FA vs Marketing Bulk Campaigns)",
    "scenario": "At 9:00 AM, the marketing team triggers a promotional campaign to 50,000,000 users on the same notification queue used for login 2FA SMS codes and fraud alerts. Login 2FA codes are delayed by 25 minutes.",
    "prompt": "Which architectural controls prevent bulk campaigns from starving critical transactional notifications?",
    "question": "Which architectural controls prevent bulk campaigns from starving critical transactional notifications?",
    "options": [
      "Process all notifications in a single FIFO queue ordered strictly by timestamp",
      "Drop 2FA login codes whenever marketing campaigns are running",
      "Physically isolate Kafka topics and worker pools by priority tier (`P0: Auth/OTP/Security`, `P1: Transactional`, `P2: Bulk Marketing`), enforce per-user frequency caps & quiet hours, and deduplicate by `(user_id, event_id, channel)`"
    ],
    "correctOption": 2,
    "reasons": [
      "A single FIFO queue guarantees sub-second delivery for 2FA behind 50M marketing items",
      "Users enjoy waiting 25 minutes for a 2FA code that expires in 5 minutes",
      "Dedicated `P0` topics and worker bulkheads guarantee that a 50M-item `P2` marketing backlog has zero impact on `P0` 2FA latency, while per-user rate limiters prevent notification fatigue"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Should a 2FA login SMS ever share a queue or worker pool with a 50M-user promotional blast?",
    "explanation": "Strict bulkhead isolation across priority lanes (`P0` transactional vs `P2` marketing) plus token-bucket rate governance per external provider (Twilio/APNs/FCM) ensures critical alerts never wait behind bulk campaigns.",
    "tags": [
      "notification-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["ticket-booking-system-design"] = [
  {
    "id": "ticket-booking-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Where the hold lives",
    "section": "Architectural Strategy",
    "prompt": "Why should a seat hold's token, owner and expiry be stored in the database row that the booking UPDATE checks, rather than only as a Redis key with a TTL?",
    "options": [
      "Redis cannot store a TTL precise enough for a 10-minute hold",
      "A database row is faster to read than Redis for the seat map",
      "Redis TTLs expire late, so seats would stay held for too long",
      "A Redis key can expire or be evicted independently, so the two can disagree"
    ],
    "answer": 3,
    "explanation": "The booking must be one atomic check against a single source of truth; if the hold's authority lives in a separately expiring Redis key, Redis and the database can disagree about who owns the seat. Speed is not the point here, since Redis is fine for serving the seat map.",
    "tags": [
      "ticket-booking-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "ticket-booking-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Waiting-room throughput",
    "section": "Worked example: a 50,000-seat stadium on-sale",
    "prompt": "The waiting room admits 4,000 users per minute, and an average buyer spends 5 minutes in checkout. In steady state, roughly how many people are in checkout at once?",
    "options": [
      "About 800",
      "About 4,000",
      "About 20,000",
      "About 200,000"
    ],
    "answer": 2,
    "explanation": "By Little's law, concurrency is arrival rate times time in the system: 4,000 per minute x 5 minutes = 20,000, a load the reservation database handles easily. 4,000 forgets that each buyer stays for several minutes.",
    "tags": [
      "ticket-booking-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "ticket-booking-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Payment after the hold",
    "section": "Payment Reconciliation & Webhook Callbacks",
    "prompt": "Buyer A's hold expires, buyer B then books the seat, and a minute later A's payment-success webhook arrives. What should the system do?",
    "options": [
      "Reassign the seat to A, since A's payment was authorised first",
      "Issue A a ticket as well, then resolve the double booking manually",
      "Attempt A's token-bound transition, and when it fails record the payment as unmatched and void or refund it",
      "Extend A's expired hold by 10 minutes and retry the booking transition"
    ],
    "answer": 2,
    "explanation": "The callback retries the conditional booking with A's hold token; it matches zero rows because B owns the seat, so the payment goes to an explicit void or refund workflow with reconciliation. Reassigning to A breaks the invariant that a confirmed booking is never taken away.",
    "tags": [
      "ticket-booking-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "ticket-booking-system-design-n1",
    "topic": "ticket-booking-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Stadium Seat Map Memory Footprint",
    "scenario": "A global ticketing platform hosts 5,000 concurrent high-demand concerts/games on sale simultaneously. Each venue has 20,000 seats, and each seat state (`seat_id`, `status`, `hold_user_id`, `hold_expires_at`, `version`) occupies 64 bytes in memory.",
    "prompt": "How many gigabytes (GB, using 1 GB = 10^9 bytes) of RAM are required to hold all 5,000 active venue seat maps in memory simultaneously?",
    "question": "How many gigabytes (GB, using 1 GB = 10^9 bytes) of RAM are required to hold all 5,000 active venue seat maps in memory simultaneously?",
    "unit": "GB",
    "answer": 6.4,
    "tolerance": 0.25,
    "hint": "Total seats = 5,000 venues × 20,000 seats = 100,000,000 seats. Multiply by 64 bytes and divide by 10^9 bytes/GB.",
    "explanation": "`5,000 × 20,000 = 100,000,000` total active seats across all concurrent events. At 64 bytes/seat, the entire active seat inventory of 5,000 stadiums fits in just `6,400,000,000 bytes = 6.4 GB` of RAM!",
    "tags": [
      "ticket-booking-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "ticket-booking-system-design-t1",
    "topic": "ticket-booking-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Two-Phase Seat Hold With Bounded TTL vs Lock-Until-Payment",
    "scenario": "500,000 fans attempt to book 20,000 Taylor Swift stadium seats at 10:00:00 AM. Completing credit card 3D-Secure verification and payment takes 45–120 seconds per fan.",
    "prompt": "How should the seat reservation and checkout flow be architected to prevent double-booking, database collapse, and abandoned-cart deadlocks?",
    "question": "How should the seat reservation and checkout flow be architected to prevent double-booking, database collapse, and abandoned-cart deadlocks?",
    "options": [
      "Allow multiple users to pay for the same seat concurrently and refund the losers 24 hours later",
      "Gate ingress with a virtual waiting room queue per event, then use a two-phase booking state machine: (1) atomic `AVAILABLE -> HELD` transition with a strict 5–10 minute lease TTL + fencing token, and (2) `HELD -> BOOKED` upon payment webhook (provided lease token is still valid)",
      "Hold a PostgreSQL `SERIALIZABLE` transaction open across the 2-minute user checkout form"
    ],
    "correctOption": 1,
    "reasons": [
      "Charging 50 people for Seat A1 and issuing 49 refunds avoids payment gateway fees",
      "A virtual waiting room absorbs the 500k bot/fan spike at the edge, while a short-lived atomic `HELD` state gives the user time to pay without holding DB connection locks and automatically releases abandoned seats on TTL expiry",
      "Holding open SQL connections for 120 seconds per user scales to 500,000 concurrent fans"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Decouple millisecond seat claiming (`AVAILABLE -> HELD`) from multi-minute human payment (`HELD -> BOOKED`).",
    "explanation": "Two-phase reservation converts a 2-minute human interaction into two sub-millisecond atomic state transitions (`AVAILABLE -> HELD` with TTL, and `HELD -> BOOKED` verified by fencing token/hold ID), while an edge virtual waiting room smooths the 500k fan stampede.",
    "tags": [
      "ticket-booking-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["payment-system-design"] = [
  {
    "id": "payment-system-design-c1",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Timeout is not failure",
    "section": "Idempotency Execution Pattern",
    "prompt": "The call to the PSP times out with no reply. The client asks the payment service to try again. What should the service do?",
    "options": [
      "Mark the payment FAILED and let the client start a fresh checkout",
      "Keep it UNKNOWN and recover with the same key: repeat the call, query the PSP, or await the webhook",
      "Retry immediately with a new idempotency key so the PSP treats it as a new charge",
      "Hold the database transaction open and retry until the PSP responds"
    ],
    "answer": 1,
    "explanation": "The PSP may already have charged the card, so the state is UNKNOWN and every recovery must reuse the same key and payload. A fresh key is the dangerous option, because the PSP cannot link it to the first attempt and may charge twice.",
    "tags": [
      "payment-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "payment-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Ledger entry amounts",
    "section": "Worked example: ledger entries for one card payment",
    "prompt": "A 250.00 USD order is captured. The PSP fee is 2.9% + 0.30 and the PSP pays out net. In integer cents, what is the capture journal entry?",
    "options": [
      "Debit PSP receivable 24245 and fees 755; credit sales revenue 25000",
      "Debit PSP receivable 25000; credit sales revenue 24245 and fees 755",
      "Debit PSP receivable 24275 and fees 725; credit sales revenue 25000",
      "Debit bank cash 24245 and fees 755; credit sales revenue 25000"
    ],
    "answer": 0,
    "explanation": "The fee is 7.25 + 0.30 = 7.55, so the receivable is 242.45 and debits total 25000 against a 25000 revenue credit. Debiting bank cash is wrong at capture, because cash only arrives at payout, when the receivable is cleared.",
    "tags": [
      "payment-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "payment-system-design-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Missing from the ledger",
    "section": "Reconciliation example",
    "prompt": "Nightly reconciliation finds a successful charge in the PSP settlement file with no matching ledger entry. What is the likely cause and the right action?",
    "options": [
      "The capture never happened; recheck the next day, then investigate",
      "The customer filed a chargeback; open a dispute case and reverse the payable",
      "An FX difference changed the amount; post an adjustment entry",
      "A timeout left it UNKNOWN and the webhook was lost; create ledger entries from the PSP record"
    ],
    "answer": 3,
    "explanation": "The PSP's record proves the charge succeeded, so the ledger is behind, typically because a timeout left the payment UNKNOWN and the webhook never arrived; you post the entries and mark the order paid. Rechecking later is the action for the opposite case, a ledger entry missing from the PSP file.",
    "tags": [
      "payment-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "payment-system-design-n1",
    "topic": "payment-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Double-Entry Ledger Storage Growth Over 5 Years",
    "scenario": "A payment platform processes 20 million payment transactions per day. Each payment writes 1 transaction header row plus 2 double-entry ledger lines (debit + credit), totaling 1,000 bytes (1 KB) per payment including indexes.",
    "prompt": "Using 365 days/year, how many terabytes (TB, using 1 TB = 10^12 bytes) of primary ledger storage accumulate over 5 years (rounded to the nearest integer)?",
    "question": "Using 365 days/year, how many terabytes (TB, using 1 TB = 10^12 bytes) of primary ledger storage accumulate over 5 years (rounded to the nearest integer)?",
    "unit": "TB",
    "answer": 36.5,
    "tolerance": 0.25,
    "hint": "Daily storage = 20,000,000 × 1,000 B = 20 GB/day. Over 5 years (1,825 days): 20 GB × 1,825 = 36,500 GB = 36.5 TB.",
    "explanation": "20M payments/day × 1 KB = 20 GB/day. Over `5 × 365 = 1,825` days, the immutable ledger grows by `20 GB × 1,825 = 36,500 GB = 36.5 TB` (~37 TB).",
    "tags": [
      "payment-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "payment-system-design-t1",
    "topic": "payment-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Two-Phase Commit (2PC) Across External PSPs vs Transactional Outbox + Reconciliation Saga",
    "scenario": "Executing a payment requires updating your internal SQL ledger AND calling an external Payment Service Provider (PSP like Stripe/Adyen) over HTTPS. External PSPs do not expose XA/2PC transactions, and network timeouts leave it ambiguous whether the PSP charged the card.",
    "prompt": "Which architecture guarantees zero lost or double-charged payments across crashes and timeouts?",
    "question": "Which architecture guarantees zero lost or double-charged payments across crashes and timeouts?",
    "options": [
      "Hold an open SQL serializable transaction lock while making the synchronous 2-second HTTPS call to the external PSP, and roll back the SQL transaction if the HTTPS call times out",
      "Persist the payment intent + client `Idempotency-Key` in state `PENDING` via a local ACID transaction (Outbox pattern) before calling the PSP with a deterministic PSP idempotency key; on timeout, never blindly mark failed—poll/reconcile PSP state and verify T+1 settlement files against the immutable double-entry ledger",
      "Charge the external PSP first and ignore database write failures"
    ],
    "correctOption": 1,
    "reasons": [
      "Rolling back the local DB when an HTTP call times out guarantees the remote PSP did not already capture the customer's money",
      "Because a network timeout can occur after the PSP succeeded, persisting `PENDING` state first and driving retries/status checks with a deterministic idempotency key + daily settlement reconciliation prevents both phantom charges and double captures",
      "Dropping database ledger writes after charging a credit card passes financial audits"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "If your HTTPS request to Visa/Stripe times out after 3 seconds, did the charge succeed or fail?",
    "explanation": "Rolling back the local DB on an HTTP timeout is a classic catastrophic bug: if the PSP actually processed the charge before the response packet was dropped, rolling back erases your record of taking the user's money! You must persist `PENDING` state before the external call and drive convergence via idempotent retries, webhooks, and T+1 settlement reconciliation.",
    "tags": [
      "payment-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["search-engine-system-design"] = [
  {
    "id": "search-engine-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Posting list intersection",
    "section": "Inverted Index & Posting Lists",
    "prompt": "The posting lists are raft = [3, 8, 21, 40, 77] and leader = [8, 15, 40, 90]. How does the engine answer raft AND leader, and what is the result?",
    "options": [
      "It scans every document for both words, returning 8 and 40",
      "It unions the two lists, returning all nine documents",
      "It merges the two sorted lists and keeps shared IDs, returning 8 and 40",
      "It scores each list with BM25 first, returning only 40"
    ],
    "answer": 2,
    "explanation": "Posting lists are sorted, so a linear merge (optionally with skip pointers) finds the shared IDs 8 and 40 in O(N + M) without touching other documents. The scanning option gets the right answer but by the slow method the inverted index exists to avoid.",
    "tags": [
      "search-engine-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "search-engine-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Computing IDF",
    "section": "Worked example: BM25 inverse document frequency",
    "prompt": "The corpus has 1,000,000 documents and the term raft appears in 10,000 of them. Using Lucene's IDF ln(1 + (N - n + 0.5) / (n + 0.5)), roughly what is its IDF, compared with 6.9 for kafka?",
    "options": [
      "About 9.2, higher than kafka",
      "About 4.6, lower than kafka",
      "About 0.9, similar to system",
      "About 2.3, a third of kafka"
    ],
    "answer": 1,
    "explanation": "(1,000,000 minus 10,000) / 10,000 is about 99, so IDF is ln(100), about 4.6: raft is ten times more common than kafka and therefore less informative. 9.2 would require raft to be rarer than kafka, which reverses the direction of IDF.",
    "tags": [
      "search-engine-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "search-engine-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Shard fan-out tail",
    "section": "Latency budget and tail behaviour",
    "prompt": "An index moves from 10 to 50 document-partitioned shards, each with a p99 of 40 ms. Roughly what share of queries now waits on at least one shard slower than its p99?",
    "options": [
      "About 1%, since each shard is only slow 1% of the time",
      "About 50%, since half the shards will be slow",
      "About 10%, the same as with 10 shards",
      "About 40%, from 1 minus 0.99 to the power 50"
    ],
    "answer": 3,
    "explanation": "A scatter-gather query waits for the slowest shard, so the chance of hitting at least one slow shard is 1 minus 0.99^50, about 40%, up from about 10% with 10 shards. That is why fewer, larger shards, replica selection and hedged requests matter.",
    "tags": [
      "search-engine-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "search-engine-system-design-n1",
    "topic": "search-engine-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Two-Stage Retrieval + Neural Reranker Compute Budget",
    "scenario": "A search cluster serves `5,000 queries/sec` over `100,000,000` documents. Running a heavy Cross-Encoder neural model (`0.5 ms` GPU time per doc) on all 100M docs is impossible. Instead, Stage 1 (Lexical BM25 + HNSW Vector ANN) retrieves the top `200` candidates in `8 ms` CPU time, and Stage 2 scores only those `200` candidates with the GPU Cross-Encoder (`200 × 0.05 ms` batched = `10 ms` per query).",
    "prompt": "By what factor (`100,000,000 / 200`) does the two-stage funnel reduce the number of documents evaluated by the expensive neural reranker?",
    "question": "By what factor (`100,000,000 / 200`) does the two-stage funnel reduce the number of documents evaluated by the expensive neural reranker?",
    "unit": "x",
    "answer": 500000,
    "tolerance": 0.2,
    "hint": "Divide 100,000,000 total documents by the 200 candidates passed to Stage 2.",
    "explanation": "`100,000,000 / 200 = 500,000×` reduction in neural evaluations per query, keeping total end-to-end latency under 25 ms!",
    "tags": [
      "search-engine-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "search-engine-system-design-t1",
    "topic": "search-engine-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Lexical-Only (BM25) vs Vector-Only (Dense ANN) vs Hybrid Retrieval + Reciprocal Rank Fusion",
    "scenario": "Users search your technical catalog with both exact part numbers / error codes (`\"ERR_SSL_VERSION_OR_CIPHER_MISMATCH\"`, `\"SKU-9941-B\"`) and semantic natural-language questions (`\"how to stop retry storms when database is slow\"`).",
    "prompt": "Why does neither pure BM25 nor pure Dense Vector Search succeed alone, and how should Stage 1 retrieval be built?",
    "question": "Why does neither pure BM25 nor pure Dense Vector Search succeed alone, and how should Stage 1 retrieval be built?",
    "options": [
      "Use only Dense Embeddings because 768-dim vectors memorize every rare alphanumeric SKU and error code perfectly",
      "Use only BM25 because keyword matching understands paraphrases with zero shared words",
      "Run Hybrid Retrieval in parallel—Lexical BM25 (for exact SKU/identifier/keyword precision) + Dense/Sparse Vector ANN (for semantic recall)—and merge candidate sets via Reciprocal Rank Fusion (`RRF`) before Stage 2 neural reranking"
    ],
    "correctOption": 2,
    "reasons": [
      "Dense bi-encoders never suffer from out-of-vocabulary dilution on rare hex/SKU strings",
      "BM25 matches `\"circuit breaker\"` when the query only says `\"stop calling dead downstream\"`",
      "Lexical inverted indexes excel at exact token/SKU matching while dense embeddings capture semantic intent; fusing top candidates from both into a cross-encoder reranker achieves superior recall and precision"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How well does a dense embedding handle an exact serial number like `\"XJ-9042-REV3\"` vs how well does BM25 handle semantic synonyms?",
    "explanation": "Hybrid search (BM25 + Vector ANN combined via Reciprocal Rank Fusion `1 / (k + rank)` and reranked by a Cross-Encoder) is the production standard because it covers both exact identifier queries and semantic conceptual queries.",
    "tags": [
      "search-engine-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["recommendation-system-design"] = [
  {
    "id": "recommendation-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What retrieval optimises",
    "section": "Candidate Generation (Fast Retrieval)",
    "prompt": "In a two-stage recommender, the retrieval stage pulls about 1,000 candidates from 10 million items with ANN search. What should that stage be judged on?",
    "options": [
      "Recall: whether the items the user would love are in the candidate set",
      "Precision: whether the top 10 items are ranked in the right order",
      "Diversity: whether the candidates span many creators and topics",
      "Freshness: whether the candidates were published in the last day"
    ],
    "answer": 0,
    "explanation": "Retrieval's job is to not miss good items; ranking then sorts the candidates precisely, and re-ranking handles diversity and business rules. Judging retrieval on top-10 precision confuses it with the ranking stage, which sees far fewer items with far richer features.",
    "tags": [
      "recommendation-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "recommendation-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing an ANN index",
    "section": "Sizing the retrieval index",
    "prompt": "You index 50 million items as 256-dimensional float32 embeddings in HNSW, whose graph links add about 25 to 50% on top of the raw vectors. Roughly how much memory does the index need?",
    "options": [
      "About 13 to 16 GB",
      "About 25 to 32 GB",
      "About 64 to 77 GB",
      "About 640 to 770 GB"
    ],
    "answer": 2,
    "explanation": "Each vector is 256 x 4 B = 1 KB, so 50 million vectors is about 51 GB raw, and HNSW links bring it to roughly 64 to 77 GB. The 25 to 32 GB answer forgets that float32 is 4 bytes per dimension, and product quantisation would be the lever if this is too large.",
    "tags": [
      "recommendation-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "recommendation-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Logging impressions",
    "section": "Architecture",
    "prompt": "A team trains its ranker only on logged clicks. The new model keeps promoting items that happened to sit in the top slots last month. What is missing from the data?",
    "options": [
      "Item embeddings recomputed online, so fresh items are not ignored",
      "More GPUs for training, so the model can use more features",
      "A larger ANN index, so retrieval returns more candidates",
      "Impression logs with positions, for negatives and position bias"
    ],
    "answer": 3,
    "explanation": "Without logging what was shown and where, the model sees no negatives and cannot separate an item's appeal from the boost of being at the top, so it learns position bias. Bigger retrieval or more compute does not fix a training signal that is biased at the source.",
    "tags": [
      "recommendation-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "recommendation-system-design-n1",
    "topic": "recommendation-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Multi-Stage Recommendation Funnel Latency & Throughput",
    "scenario": "A home feed recommendation request must finish in `<80 ms` across a catalog of `10,000,000` items: Candidate Generation (Two-Tower ANN + Graph co-visitation) narrows `10,000,000 -> 1,000` items in `15 ms`; Lightweight Scoring narrows `1,000 -> 100` in `15 ms`; Heavy Multi-Task Ranking + Diversity Reranking orders `100 -> 20` in `25 ms` (plus `15 ms` feature fetch & network overhead).",
    "prompt": "What is the total end-to-end latency (`15 + 15 + 25 + 15`, in ms) of this 4-stage recommendation pipeline?",
    "question": "What is the total end-to-end latency (`15 + 15 + 25 + 15`, in ms) of this 4-stage recommendation pipeline?",
    "unit": "ms",
    "answer": 70,
    "tolerance": 0.2,
    "hint": "Sum the four stage budgets: `15 + 15 + 25 + 15`.",
    "explanation": "`15 + 15 + 25 + 15 = 70 ms` (well within the 80 ms SLO), evaluating 10 million catalog items by progressively trading candidate volume for model complexity at each stage.",
    "tags": [
      "recommendation-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "recommendation-system-design-t1",
    "topic": "recommendation-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Two-Tower Dot-Product Retrieval vs Full Cross-Feature Deep Ranking Network",
    "scenario": "An ML engineer asks why we can't run the full Deep & Cross Ranking neural network (which takes non-linear cross features between `user_history × item_metadata × time_of_day`) directly over all 10,000,000 items at request time.",
    "prompt": "Why is the Two-Tower architecture required for Stage 1 Candidate Generation while Cross-Feature networks are reserved for Stage 2 Ranking?",
    "question": "Why is the Two-Tower architecture required for Stage 1 Candidate Generation while Cross-Feature networks are reserved for Stage 2 Ranking?",
    "options": [
      "Two-Tower models are more accurate than cross-feature models on 100 items",
      "Cross-feature models can be pre-indexed in a static HNSW vector index",
      "A Two-Tower model decouples the User Encoder `u(x)` from the Item Encoder `v(y)`, allowing all 10M item vectors `v(y)` to be pre-computed offline and searched in `O(log N)` via HNSW/MIPS, whereas cross-feature models require `O(N)` live neural forward passes per request"
    ],
    "correctOption": 2,
    "reasons": [
      "Running 10,000,000 deep neural forward passes per user request takes 1 millisecond",
      "Arbitrary non-linear `f(user, item, context)` functions reduce to a static inner product",
      "Only when user and item representations interact via a late inner product `<u(x), v(y)>` can the 10M item embeddings be indexed in an Approximate Nearest Neighbor (ANN) vector index for sub-15ms retrieval"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why can `<u(x), v(y)>` be indexed in HNSW/Faiss while `MLP(concat(x, y, x*y))` cannot?",
    "explanation": "Two-Tower decoupling lets you compute `u(x)` once per request and find the top-1,000 items by inner product `<u(x), v(y)>` in ~10 ms using ANN; Stage 2 then runs expensive cross-feature interactions on just those 1,000 candidates.",
    "tags": [
      "recommendation-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["chat-and-messaging-system-design"] = [
  {
    "id": "chat-and-messaging-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Syncing after offline",
    "section": "Handling Offline Messages",
    "prompt": "User B's phone was offline for three hours while several conversations continued. On reconnect, how does B receive the missed messages in the right order?",
    "options": [
      "The gateway replays the messages it buffered in memory for B's socket",
      "The client sends its last received sequence ID and fetches later messages from the store",
      "APNs and FCM deliver every missed message in order as push payloads",
      "The router re-sends each message when B's presence flips to online"
    ],
    "answer": 1,
    "explanation": "Messages are persisted with a per-conversation sequence number, and the client syncs from its cursor, so ordering and completeness come from the store. Gateway memory does not survive disconnects or restarts, and push is only a doorbell, not a delivery channel.",
    "tags": [
      "chat-and-messaging-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "chat-and-messaging-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Gateway and heartbeat math",
    "section": "Worked example: connection and message scale",
    "prompt": "You expect 60 million concurrently connected clients, each gateway holds about 400,000 sockets, and clients send a heartbeat every 30 s. What are the gateway count and heartbeat rate?",
    "options": [
      "About 150 gateways plus headroom, and about 2 million heartbeats per second",
      "About 15 gateways plus headroom, and about 200,000 heartbeats per second",
      "About 150 gateways plus headroom, and about 60 million heartbeats per second",
      "About 1,500 gateways plus headroom, and about 2 million heartbeats per second"
    ],
    "answer": 0,
    "explanation": "60,000,000 / 400,000 is 150 gateways before headroom for rolling restarts, and 60,000,000 / 30 s is 2 million heartbeat packets per second. The 60 million per second option forgets that each client only sends once every 30 s.",
    "tags": [
      "chat-and-messaging-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "chat-and-messaging-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Delivered means app ack",
    "section": "Message lifecycle and receipts",
    "prompt": "Gateway B writes message 42 to B's socket and the kernel accepts it, but B's phone loses signal a moment later. When should the server mark message 42 as delivered?",
    "options": [
      "Immediately, because TCP has accepted the bytes into the socket buffer",
      "After the gateway's next heartbeat from B succeeds",
      "Only when B's app acknowledges seq 42; otherwise it syncs on reconnect",
      "After a fixed timeout with no error from the gateway"
    ],
    "answer": 2,
    "explanation": "Receipts are application-level acknowledgements: only B's app saying delivered 42 proves it arrived, and if it never does, the reconnect cursor fetches it again. Treating a socket write as delivery is the classic trap, because bytes in a buffer on a dying connection are lost.",
    "tags": [
      "chat-and-messaging-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "chat-and-messaging-system-design-n1",
    "topic": "chat-and-messaging-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Group Chat Typing-Indicator Amplification",
    "scenario": "A workspace messaging app has 10,000 active large channels, each with 200 online members. In each channel, 2 members are typing concurrently, emitting 1 `user_typing` event every 3 seconds. If the server broadcasts every typing event to all 200 online members in each channel, traffic is `(10,000 × 2 / 3) × 200 ≈ 1.33M msg/s`.",
    "prompt": "Using `10,000 channels × 1 typing event/sec per channel × 200 members`, how many millions of outbound typing-indicator messages per second are sent across the fleet?",
    "question": "Using `10,000 channels × 1 typing event/sec per channel × 200 members`, how many millions of outbound typing-indicator messages per second are sent across the fleet?",
    "unit": "million msg/s",
    "answer": 2,
    "tolerance": 0.25,
    "hint": "10,000 channels × 1 event/s × 200 recipients = 2,000,000 msg/s = 2 million msg/s.",
    "explanation": "Even at just 1 typing event/sec per channel across 10,000 channels of 200 members, outbound fan-out reaches `10,000 × 200 = 2,000,000 (2 million) msg/s`—often exceeding actual persisted chat message traffic!",
    "tags": [
      "chat-and-messaging-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "chat-and-messaging-system-design-t1",
    "topic": "chat-and-messaging-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Per-Channel Partitioning & Ephemeral Presence Suppression in Large Groups",
    "scenario": "Your chat platform supports both 1-on-1 DMs and 10,000-member community channels. In 10,000-member channels, broadcasting typing indicators, read receipts, and online-presence flips to all 10,000 members saturates WebSocket gateways.",
    "prompt": "How should message ordering, storage partitioning, and ephemeral signals (typing/presence/read-receipts) be designed across small vs large channels?",
    "question": "How should message ordering, storage partitioning, and ephemeral signals (typing/presence/read-receipts) be designed across small vs large channels?",
    "options": [
      "Partition messages by `sender_user_id` and broadcast full read-receipts and typing events in 10,000-member channels",
      "Partition messages by `(channel_id, bucket_id)` with per-channel monotonic sequence numbers (`Snowflake`), and dynamically degrade/disable broadcast of typing indicators, per-user read receipts, and push presence in channels exceeding a member threshold (e.g., >100 members, switching to pull-based presence on viewport)",
      "Use a single global SQL sequence for all messages across all channels worldwide"
    ],
    "correctOption": 1,
    "reasons": [
      "Partitioning by `sender_user_id` allows fetching a channel's conversation history in a single range scan",
      "Partitioning by `(channel_id, time_bucket)` co-locates a channel's history for single-partition range scans, while adaptive feature degradation prevents `O(N^2)` ephemeral presence/typing storms in large rooms",
      "A single global counter across continents adds zero latency to every chat message"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why do Slack, Discord, and WhatsApp disable per-user read receipts and typing indicators in large channels?",
    "explanation": "Chat reads always query a chronological slice of a single `channel_id`, so partitioning by `(channel_id, time_bucket)` guarantees single-partition reads. For large channels (>100–500 members), disabling `O(N^2)` typing/read-receipt broadcasts and switching to viewport/pull presence prevents gateway overload.",
    "tags": [
      "chat-and-messaging-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["social-feed-system-design-case-study"] = [
  {
    "id": "social-feed-system-design-case-study-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Push model weak spot",
    "section": "Fan-out on Write (Push Model)",
    "prompt": "In a pure fan-out-on-write feed, what happens when an account with 80 million followers posts?",
    "options": [
      "Each follower's feed read slows down because it must merge the post",
      "The post is visible immediately, but reads fall back to the database",
      "The author's own timeline partition becomes a hot key for writes",
      "The system must perform about 80 million timeline cache writes for one post"
    ],
    "answer": 3,
    "explanation": "Push inserts the post ID into every follower's precomputed timeline, so one celebrity post becomes 80 million writes and floods the fan-out queues. Slow merged reads are the weakness of the pull model, not the push model.",
    "tags": [
      "social-feed-system-design-case-study",
      "recall",
      "inline"
    ]
  },
  {
    "id": "social-feed-system-design-case-study-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Timeline insert rate",
    "section": "Worked example: write amplification",
    "prompt": "A network has 50 million posts per day and an average of 200 followers per author, all using fan-out on write. What is the average timeline insert rate?",
    "options": [
      "About 11,600 inserts per second",
      "About 116,000 inserts per second",
      "About 1.16 million inserts per second",
      "About 580 inserts per second"
    ],
    "answer": 1,
    "explanation": "50 million x 200 is 10 billion inserts per day, and 10 billion / 86,400 is about 116,000 per second, with peaks several times higher. Dropping a zero on the daily total gives 11,600, which would badly undersize the fan-out fleet.",
    "tags": [
      "social-feed-system-design-case-study",
      "apply",
      "inline"
    ]
  },
  {
    "id": "social-feed-system-design-case-study-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Deletes and hydration",
    "section": "Read path for the hybrid",
    "prompt": "A user deletes a post whose ID was already pushed into 5,000 follower timelines. How does the hybrid read path keep the deleted post from appearing?",
    "options": [
      "Timelines hold only IDs, and the hydrate and filter step drops deleted posts at read time",
      "It relies on the timelines' TTL expiring before most followers open the app",
      "It rewrites all 5,000 timelines synchronously before confirming the delete",
      "It moves the author to the celebrity list so the post is pulled instead of pushed"
    ],
    "answer": 0,
    "explanation": "Because timelines store IDs and posts are hydrated in batches from the post store, a deleted post fails the filter on read even while its ID lingers; asynchronous cleanup can remove the IDs later. Synchronously rewriting every timeline makes a delete as expensive as the original fan-out.",
    "tags": [
      "social-feed-system-design-case-study",
      "staff",
      "inline"
    ]
  },
  {
    "id": "social-feed-system-design-case-study-n1",
    "topic": "social-feed-system-design-case-study",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Home Timeline Cache Hydration Bandwidth",
    "scenario": "A user's home timeline Redis ZSET stores only compact `(post_id, author_id, score_ts)` tuples (`24 bytes` per entry × `500` cached items = `12 KB` per user), rather than duplicating the full `2 KB` hydrated post + author JSON (`1 MB` per user) inside every follower's inbox list.",
    "prompt": "By what factor (`2,000 bytes / 24 bytes`, rounded to the nearest integer) does storing compact `24-byte` references in follower timelines reduce per-inbox RAM compared to duplicating `2,000-byte` full post payloads?",
    "question": "By what factor (`2,000 bytes / 24 bytes`, rounded to the nearest integer) does storing compact `24-byte` references in follower timelines reduce per-inbox RAM compared to duplicating `2,000-byte` full post payloads?",
    "unit": "x",
    "answer": 83,
    "tolerance": 0.2,
    "hint": "Divide 2,000 bytes by 24 bytes (`≈ 83.3`).",
    "explanation": "Storing 24-byte post IDs in follower timelines instead of 2,000-byte full post payloads saves `2,000 / 24 ≈ 83×` of timeline RAM AND ensures that when a post's like count or text is edited, it only updates in 1 central Post Cache entry rather than 10,000 follower inboxes!",
    "tags": [
      "social-feed-system-design-case-study",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "social-feed-system-design-case-study-t1",
    "topic": "social-feed-system-design-case-study",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Storing Full Hydrated Post Objects vs Post IDs in Follower Inboxes",
    "scenario": "When an author posts an item that is fanned out to 5,000 follower timeline caches, you must choose whether to push the full rendered Post + Author Profile + Reaction Count JSON into all 5,000 inbox lists, or push only `(post_id, author_id, timestamp)` and hydrate at read time from a shared Post/User cache.",
    "prompt": "Why do production social feeds store only lightweight IDs/metadata in follower inboxes and hydrate at read time?",
    "question": "Why do production social feeds store only lightweight IDs/metadata in follower inboxes and hydrate at read time?",
    "options": [
      "Duplicating 2 KB JSON across 5,000 inboxes makes updating the author's avatar or post like count O(1)",
      "Hydrating 20 post IDs via a single batched `MGET` from an in-memory Post Cache takes several minutes",
      "Storing only `post_id` references keeps inbox RAM tiny (~80× smaller) and avoids updating 5,000 cached copies whenever a post's reaction count changes, an author changes their avatar, or a post is deleted—while read-time `MGET` hydration only fetches the 20 posts actually scrolled into view"
    ],
    "correctOption": 2,
    "reasons": [
      "Users always scroll through all 800 items in their inbox on every visit",
      "Post like counters never change after creation",
      "A user views only ~20 items per page; hydrating those 20 IDs via batched `MGET` from a shared Post/User cache takes ~2 ms while keeping mutable state (counts, edits, deletes, avatars) normalized in one place"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens when a post gets 10,000 likes if its like count is copied inside 5,000 separate follower inbox lists?",
    "explanation": "Keeping follower inboxes as lightweight ID lists (`post_id`) and hydrating the page-size slice (`20` items) via batched `MGET` against a shared Post/User cache avoids massive RAM duplication and stale mutable fields.",
    "tags": [
      "social-feed-system-design-case-study",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["geospatial-nearby-search-case-study"] = [
  {
    "id": "geospatial-nearby-search-case-study-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Covering the radius",
    "section": "Geohash & Peano Space-Filling Curves",
    "prompt": "A café 20 m away from the user sits just across a geohash cell boundary and has a completely different prefix. How does a correct 1 km search still find it?",
    "options": [
      "It queries every cell the search circle intersects, then filters by exact distance",
      "It shortens the user's geohash by one character until the prefixes match",
      "It always queries the user's cell plus exactly eight neighbours at precision 7",
      "It sorts all places by geohash string and scans the adjacent entries"
    ],
    "answer": 0,
    "explanation": "Cells that share a boundary can have unrelated prefixes on a Z-order curve, so the query must cover every intersecting cell and then apply an exact distance filter. Center plus eight neighbours is a common example, but cell sizes vary with precision and latitude, so it is not a guarantee.",
    "tags": [
      "geospatial-nearby-search-case-study",
      "recall",
      "inline"
    ]
  },
  {
    "id": "geospatial-nearby-search-case-study-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sparse-area search",
    "section": "Worked example: 1 km search with geohash",
    "prompt": "In a rural area, a precision-6 search returns 3 places but the app needs 20. What should the service do next?",
    "options": [
      "Move to precision 7 so the search is more accurate",
      "Return the 3 results and pad the rest with popular places",
      "Retry at precision 6 with the eight neighbours of each neighbour",
      "Widen to precision 5, then 4, until at least 20 results pass the filter"
    ],
    "answer": 3,
    "explanation": "Shorter geohashes mean larger cells, so progressively dropping precision widens the search until K candidates pass the exact distance filter. Precision 7 is the tempting wrong direction, since it makes the cells smaller and finds even fewer places.",
    "tags": [
      "geospatial-nearby-search-case-study",
      "apply",
      "inline"
    ]
  },
  {
    "id": "geospatial-nearby-search-case-study-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Ghost drivers",
    "section": "Static places vs moving objects",
    "prompt": "Riders are being matched to drivers whose apps crashed several minutes earlier. Positions live in an in-memory geo index updated by pings every 4 seconds. What is the fix?",
    "options": [
      "Persist every ping to PostGIS so the index always has the latest position",
      "Expire positions not refreshed within about 30 s so silent drivers drop out",
      "Cache each cell's driver list for several minutes to reduce index load",
      "Have the matcher contact each candidate app before offering the ride"
    ],
    "answer": 1,
    "explanation": "A crashed app simply stops pinging, so without a TTL its last position looks valid forever; expiring stale entries makes silence mean unavailable. Writing every ping to disk adds load but still leaves the last row looking current.",
    "tags": [
      "geospatial-nearby-search-case-study",
      "staff",
      "inline"
    ]
  },
  {
    "id": "geospatial-nearby-search-case-study-n1",
    "topic": "geospatial-nearby-search-case-study",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: H3 / Geohash 9-Cell Boundary Lookup Payload",
    "scenario": "A user searches for restaurants within `1 km`. A single Geohash length-6 cell (`~1.2 km × 0.6 km`) or H3 resolution-8 hexagon might put the user right next to a cell border. To avoid missing a restaurant 50 meters across the boundary line, the query fetches the user's center cell plus its `8` surrounding neighbor cells (`9` cells total, or `7` for H3 `kRing(1)`), all in a single batched cache `MGET`.",
    "prompt": "If each Geohash length-6 cell averages `40` restaurants (`200 bytes` per restaurant summary = `8 KB` per cell), how many kilobytes (KB) of cached candidate data are fetched across all `9` cells (`9 × 8 KB`) before exact Haversine distance filtering?",
    "question": "If each Geohash length-6 cell averages `40` restaurants (`200 bytes` per restaurant summary = `8 KB` per cell), how many kilobytes (KB) of cached candidate data are fetched across all `9` cells (`9 × 8 KB`) before exact Haversine distance filtering?",
    "unit": "KB",
    "answer": 72,
    "tolerance": 0.2,
    "hint": "Multiply 9 cells by 8 KB per cell.",
    "explanation": "Fetching all 9 Geohash cells (`1 center + 8 neighbors`) via a single batched cache `MGET` transfers just `9 × 8 KB = 72 KB` (360 candidates), which the app filters by exact Haversine distance and open-hours in <0.5 ms!",
    "tags": [
      "geospatial-nearby-search-case-study",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "geospatial-nearby-search-case-study-t1",
    "topic": "geospatial-nearby-search-case-study",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Naive `LAT BETWEEN AND LON BETWEEN` SQL Scan vs Geohash / H3 / S2 Spatial Cell Indexing",
    "scenario": "A food-delivery app serves `80,000 req/s` for \"restaurants near `(lat, lon)` within 3 km\". Using two separate B-Tree indexes on `latitude` and `longitude` forces the database to scan a huge horizontal band of the globe and intersect it with a vertical band.",
    "prompt": "Why do separate 1D B-Tree indexes fail on 2D proximity queries, and how do spatial hierarchical indexes (Geohash / S2 / H3) solve this?",
    "question": "Why do separate 1D B-Tree indexes fail on 2D proximity queries, and how do spatial hierarchical indexes (Geohash / S2 / H3) solve this?",
    "options": [
      "A standard 1D B-Tree on `latitude` narrows a query to a single city block without scanning other longitudes at the same latitude",
      "Compute exact trigonometric `ACOS(SIN(lat1)*SIN(lat2)...)` over all 10,000,000 restaurants on every request",
      "Space-filling curves (Geohash Z-order, S2 Hilbert curve, Uber H3 hexagons) map 2D `(lat, lon)` coordinates into 1D cell IDs with spatial locality, turning a 2D radius search into a fast 7-to-9 cell lookup followed by exact Haversine filtering on the candidate set"
    ],
    "correctOption": 2,
    "reasons": [
      "New York, Madrid, Beijing, and Tokyo all have completely different latitudes",
      "Full-table trigonometric scans run in O(1) time",
      "A 1D index can only order along one dimension; mapping 2D space into hierarchical 1D cell keys co-locates nearby points into the same cache/index buckets and resolves boundary edge cases by querying the `k=1` neighbor ring"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why can't a single standard B-Tree sort simultaneously by both `latitude` and `longitude` proximity?",
    "explanation": "A composite B-Tree `(lat, lon)` sorts by `lon` only for identical `lat` values. Spatial cell encodings (Geohash, S2, H3) interleave 2D coordinates into discrete cell IDs so a 2D radius query becomes a bounded `MGET` of the center cell + its immediate neighbors.",
    "tags": [
      "geospatial-nearby-search-case-study",
      "tradeoff",
      "staff"
    ]
  }
];
