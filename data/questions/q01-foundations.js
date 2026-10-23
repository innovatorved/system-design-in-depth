window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["requirements-clarification"] = [
  {
    "id": "requirements-clarification-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Spotting an invariant",
    "section": "Requirements clarification",
    "prompt": "While writing the URL shortener brief, which of these statements is an invariant rather than a scale assumption, a latency target, or a non-goal?",
    "options": [
      "The system should plan for 100 million redirects per day",
      "Custom aliases are deferred until after the first version",
      "A generated short name must never silently replace an existing mapping",
      "At least 95% of redirects should finish within one second"
    ],
    "answer": 2,
    "explanation": "An invariant is a condition the implementation must preserve even when requests overlap or are retried, and a mapping that is never overwritten is exactly that. The 95% latency line is tempting, but it is a measurable quality target (a non-functional requirement), not a correctness condition that must hold on every request.",
    "tags": [
      "requirements-clarification",
      "recall",
      "inline"
    ]
  },
  {
    "id": "requirements-clarification-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Which failure blocks redirects",
    "section": "Requirements clarification",
    "prompt": "Under the course's chosen contract, first the analytics report service goes down while event storage keeps working. Later, event storage fails while reporting is fine. How should redirects behave in each case?",
    "options": [
      "Keep redirecting in both cases, since reports and event storage are both background work",
      "Keep redirecting in the first case and return an error in the second, since each redirect needs a stored event",
      "Return an error in the first case and keep redirecting in the second, since reports are user-facing",
      "Return an error in both cases, since click tracking is part of every redirect's contract"
    ],
    "answer": 1,
    "explanation": "The brief says every accepted redirect must have a stored event before the response, while reports can be calculated later. So losing reporting does not block redirects, but losing event storage does. Treating both as background work is the tempting mistake: moving report calculation to the background says nothing about whether losing its input is acceptable.",
    "tags": [
      "requirements-clarification",
      "apply",
      "inline"
    ]
  },
  {
    "id": "requirements-clarification-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Freshness hidden in a cache",
    "section": "Requirements clarification",
    "prompt": "A design doc says only \"we will cache link lookups\". Destinations never change after creation, but an administrator can disable a phishing link. Which requirement has the brief failed to pin down?",
    "options": [
      "Which eviction policy the cache uses, such as LRU or LFU",
      "The read/write ratio needed to size the cache cluster",
      "Whether destinations can be edited after the link is created",
      "How long a cached copy may keep redirecting after a link is disabled"
    ],
    "answer": 3,
    "explanation": "The lesson says freshness needs its own question: a one-minute allowed delay permits different designs than a requirement to stop every new redirect immediately. Fixed destinations are the tempting answer, but they do not settle anything here, because the disabled flag can still change while a cached copy is being served.",
    "tags": [
      "requirements-clarification",
      "staff",
      "inline"
    ]
  },
  {
    "id": "requirements-clarification-n1",
    "topic": "requirements-clarification",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Write-to-Read Event Amplification",
    "scenario": "During requirements clarification for a URL shortener, you establish that links are created at 1,000,000 new links/day with a 100:1 read-to-write ratio, and every redirect must durably record a 200-byte click analytics event before returning HTTP 302.",
    "prompt": "Assuming 100,000 seconds per day for napkin estimation, what is the average daily storage growth (in GB/day, using 1 GB = 10^9 bytes) generated solely by the redirect click events?",
    "question": "Assuming 100,000 seconds per day for napkin estimation, what is the average daily storage growth (in GB/day, using 1 GB = 10^9 bytes) generated solely by the redirect click events?",
    "unit": "GB/day",
    "answer": 20,
    "tolerance": 0.25,
    "hint": "Daily redirects = 1,000,000 × 100 = 100,000,000 events/day. Multiply by 200 bytes/event and divide by 10^9 bytes/GB.",
    "explanation": "With 1M link creations/day and a 100:1 read-to-write ratio, the service handles 100M redirects/day. Because the requirements mandate recording a 200-byte click event per redirect, event storage grows by 100,000,000 × 200 bytes = 20 × 10^9 bytes = 20 GB/day—turning an apparently read-heavy service into a sustained 1,000 writes/sec event ingestion workload.",
    "tags": [
      "requirements-clarification",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "requirements-clarification-t1",
    "topic": "requirements-clarification",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Malicious Link Takedown Freshness vs Redirect Latency",
    "scenario": "Trust & Safety requires that when an admin disables a phishing short link, all edge POPs stop redirecting within 5 seconds, while the core product SLO demands p99 redirect latency under 15 ms globally.",
    "prompt": "Which caching and invalidation architecture should you commit to in the requirements contract, and what is the primary engineering justification?",
    "question": "Which caching and invalidation architecture should you commit to in the requirements contract, and what is the primary engineering justification?",
    "options": [
      "Cache links at the CDN edge with a 24-hour TTL and rely on passive expiration",
      "Bypass caching entirely and route every redirect to the strongly consistent primary SQL region",
      "Serve redirects from regional edge caches with a short TTL backed by an active pub/sub invalidation stream and fail-closed revocation bloom filter"
    ],
    "correctOption": 2,
    "reasons": [
      "Passive 24-hour TTLs eliminate invalidation traffic while meeting the 5-second takedown SLA",
      "Cross-continental synchronous SQL reads easily stay under 15 ms p99 globally",
      "Bounded push invalidation plus local edge reads satisfies both the 15 ms p99 latency budget and the 5-second revocation window"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Consider speed-of-light RTT across continents (~150-250 ms) vs a 24-hour passive cache window.",
    "explanation": "Routing globally to a single SQL primary violates the 15 ms p99 target due to cross-continental RTT, while a passive 24-hour TTL violates the 5-second phishing takedown requirement. Regional edge caches with active pub/sub purge events keep p99 local (<15 ms) while bounding revocation propagation to seconds.",
    "tags": [
      "requirements-clarification",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["logical-system-design"] = [
  {
    "id": "logical-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Where sequencing belongs",
    "section": "Logical system design",
    "prompt": "Of the three responsibilities (HTTP adapter, link operation, storage adapter), which decision belongs to the link operation?",
    "options": [
      "Requiring a redirect to wait until its click event is stored",
      "Turning a Found result into a redirect response with a Location header",
      "Mapping a database row into the application's link result type",
      "Parsing the short code out of the incoming request path"
    ],
    "answer": 0,
    "explanation": "The lesson puts the sequencing rule (a successful redirect waits for its event to be stored) in the link operation, because HTTP formatting should not decide whether losing a click is acceptable. Building the redirect response looks like a decision, but it is translation work for the HTTP adapter.",
    "tags": [
      "logical-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "logical-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Timeout is not missing",
    "section": "Logical system design",
    "prompt": "During resolve(code), the storage adapter's database connection times out. What should the operation return to the HTTP caller?",
    "options": [
      "Missing, so the handler returns a 404 and the reader is not left waiting",
      "Disabled, so the reader is safely refused without seeing an internal error",
      "Unavailable, so the handler returns a service error instead of a false answer",
      "The driver's raw exception, so the handler can choose the right status code"
    ],
    "answer": 2,
    "explanation": "A timeout means the operation could not reach an answer, which the contract calls Unavailable. Returning Missing is the tempting shortcut, but it tells the caller that no such link exists when that is unknown. Passing the raw driver exception up would spread vendor details into every route and job.",
    "tags": [
      "logical-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "logical-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "What a fake cannot prove",
    "section": "Logical system design",
    "prompt": "You test the rule \"disabled links never redirect\" by calling the link operation with an in-memory storage fake that returns a disabled record. The test passes. What has it not established?",
    "options": [
      "That the link operation applies the disabled-link rule correctly",
      "That the rule can be checked without a browser or a live database",
      "That the operation's result types cover the disabled case",
      "That the real query handles missing rows, uniqueness conflicts and failures"
    ],
    "answer": 3,
    "explanation": "The fake checks the product rule in isolation. The lesson says the storage adapter still needs its own tests against the real database, covering missing rows, conflicts and failures. The first option is what the test does prove, and keeping the two kinds of test separate shows whether a failure comes from the rule or from persistence.",
    "tags": [
      "logical-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "logical-system-design-n1",
    "topic": "logical-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Synchronous Event Write Latency Budget",
    "scenario": "Your logical link operation must first read the destination from the link storage adapter (p99 = 4 ms) and then synchronously write a click event to the event storage adapter (p99 = 9 ms) before the HTTP adapter formats the response (1 ms).",
    "prompt": "If the overall redirect endpoint has a strict 20 ms p99 latency budget, how many milliseconds of headroom remain for network serialization and queuing inside the server?",
    "question": "If the overall redirect endpoint has a strict 20 ms p99 latency budget, how many milliseconds of headroom remain for network serialization and queuing inside the server?",
    "unit": "ms",
    "answer": 6,
    "tolerance": 0.2,
    "hint": "Subtract the sequential step latencies (4 + 9 + 1 ms) from the 20 ms total budget.",
    "explanation": "Because the logical operation sequences the link lookup (4 ms), synchronous event persistence (9 ms), and HTTP translation (1 ms) serially, those three steps consume 14 ms. Subtracting 14 ms from the 20 ms budget leaves 6 ms of headroom.",
    "tags": [
      "logical-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "logical-system-design-t1",
    "topic": "logical-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Domain Error Translation vs Raw Driver Exceptions",
    "scenario": "Your link service needs to support migrating from PostgreSQL to DynamoDB without rewriting HTTP handlers, background reconciliation jobs, or domain unit tests.",
    "prompt": "Which boundary contract should the storage adapter enforce, and what is the primary architectural justification?",
    "question": "Which boundary contract should the storage adapter enforce, and what is the primary architectural justification?",
    "options": [
      "Let database driver exceptions bubble directly into HTTP middleware so status codes map from SQLSTATE codes",
      "Translate all storage outcomes into explicit domain result types (Found, Missing, Disabled, Conflict, Unavailable) inside the storage adapter",
      "Pass raw ORM entities and database transaction handles into the HTTP controller so handlers can retry queries directly"
    ],
    "correctOption": 1,
    "reasons": [
      "SQLSTATE codes are identical across relational and NoSQL engines",
      "Isolating vendor error codes behind explicit domain result types prevents persistence details from leaking into business sequencing or HTTP adapters",
      "Exposing transaction handles to HTTP controllers reduces memory allocations during high QPS"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Think about what changes when you swap PostgreSQL for DynamoDB if HTTP handlers inspect SQLSTATE error codes.",
    "explanation": "When the storage adapter maps vendor-specific exceptions (like PostgreSQL unique_violation 23505 or DynamoDB ConditionalCheckFailedException) into domain result types (Conflict, Unavailable), the link operation and HTTP layers remain completely agnostic to the underlying database engine.",
    "tags": [
      "logical-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["non-functional-requirements"] = [
  {
    "id": "non-functional-requirements-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "RPO versus RTO",
    "section": "Non-functional requirements",
    "prompt": "For a named disaster scenario, what does the recovery point objective (RPO) limit?",
    "options": [
      "How long restoring service may take after the failure",
      "How much recent data may be missing after recovery, measured in time",
      "What fraction of eligible requests must succeed each month",
      "How quickly committed writes must become visible to readers"
    ],
    "answer": 1,
    "explanation": "RPO limits the acceptable gap in recovered data, for example losing no more than five minutes of writes. The first option describes RTO, the recovery time objective, which limits how long restoration may take. They are separate targets, and a plan can meet one while missing the other.",
    "tags": [
      "non-functional-requirements",
      "recall",
      "inline"
    ]
  },
  {
    "id": "non-functional-requirements-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Downtime budget for 99.9%",
    "section": "Non-functional requirements",
    "prompt": "In the simplified time-based model (the service is either fully up or fully down), how much total downtime does a 99.9% availability target allow over a 30-day month?",
    "options": [
      "About 4.3 minutes",
      "About 8.8 hours",
      "About 43 minutes",
      "About 7.2 hours"
    ],
    "answer": 2,
    "explanation": "30 days is 43,200 minutes, and 0.1% of that is about 43.2 minutes. 8.8 hours is the tempting choice because it is the familiar yearly budget for 99.9%, not the monthly one. A request-based target would count failed requests instead and could give a different result.",
    "tags": [
      "non-functional-requirements",
      "apply",
      "inline"
    ]
  },
  {
    "id": "non-functional-requirements-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Fast failures flatter p95",
    "section": "Non-functional requirements",
    "prompt": "A dashboard computes p95 redirect latency over every response, errors included. After a bad deploy, 30% of redirects fail with an error returned in 3 ms. What is the dashboard likely to show, and how should the SLO handle it?",
    "options": [
      "p95 holds steady or improves, so failed eligible requests must count as misses however fast they return",
      "p95 rises sharply, which correctly flags the incident without changing how the target is measured",
      "p95 stays unchanged, because percentiles ignore the fastest part of the distribution",
      "p95 holds steady or improves, so errors should be removed from the latency measurement entirely"
    ],
    "answer": 0,
    "explanation": "A flood of fast errors pulls the distribution down, so a broken service can look faster. The lesson counts only correct answers within the deadline as successes, so failed attempts are misses. Simply dropping errors from the measurement (the last option) is tempting, but it hides the failures instead of counting them against the target.",
    "tags": [
      "non-functional-requirements",
      "staff",
      "inline"
    ]
  },
  {
    "id": "non-functional-requirements-n1",
    "topic": "non-functional-requirements",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Monthly Error Budget in Requests",
    "scenario": "Your payment authorization API serves an average of 1,000 requests/second around the clock and commits to a 99.95% request-based availability SLO over a 30-day month (2.592 billion requests, or use 2,500,000,000 requests for napkin math).",
    "prompt": "Using 2.592 billion requests per 30-day month, how many failed requests (in millions, rounded to 2 decimal places) are permitted before the monthly error budget is exhausted?",
    "question": "Using 2.592 billion requests per 30-day month, how many failed requests (in millions, rounded to 2 decimal places) are permitted before the monthly error budget is exhausted?",
    "unit": "million requests",
    "answer": 1.3,
    "tolerance": 0.2,
    "hint": "Error budget fraction = 1 - 0.9995 = 0.0005 (0.05%). Multiply 2,592M requests by 0.0005.",
    "explanation": "At 1,000 req/s over 2,592,000 seconds (30 days), the service handles 2,592 million requests. A 99.95% SLO permits 0.05% (0.0005) failures: 2,592M × 0.0005 = 1.296 million failed requests (~1.3M).",
    "tags": [
      "non-functional-requirements",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "non-functional-requirements-t1",
    "topic": "non-functional-requirements",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Zero-RPO Synchronous Cross-Region Replication vs Write Latency",
    "scenario": "A ledger service requires RPO = 0 even if an entire cloud region is lost, while product managers also ask for sub-15 ms p99 write latency from a single primary cluster.",
    "prompt": "Which architectural stance should you take during NFR negotiation, and what is the primary justification?",
    "question": "Which architectural stance should you take during NFR negotiation, and what is the primary justification?",
    "options": [
      "Use asynchronous cross-region replication with a 5-second lag and claim RPO = 0 in the architecture doc",
      "Enforce synchronous cross-region quorum commits across regions separated by 40+ ms RTT and explicitly raise the write latency SLO to accommodate speed-of-light physics",
      "Commit writes only to local NVMe disk in a single availability zone to hit sub-15 ms latency while guaranteeing survival of a regional outage"
    ],
    "correctOption": 1,
    "reasons": [
      "Asynchronous replication guarantees zero data loss during sudden regional power failure",
      "Surviving a full regional outage with RPO = 0 requires at least one cross-region network round-trip before acknowledging a write, making sub-15 ms cross-region commits physically impossible",
      "Local NVMe drives automatically replicate data across tectonic plates without network overhead"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "RPO = 0 across regions requires acknowledging the write only after a remote region has persisted it.",
    "explanation": "Achieving RPO = 0 for a regional disaster requires synchronous replication to a second region before returning success to the client. Because inter-region round-trip times typically exceed 30–70 ms, the NFR contract must either relax the write latency target or scope RPO = 0 to single-AZ failures within a multi-AZ region.",
    "tags": [
      "non-functional-requirements",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["system-design-tradeoffs"] = [
  {
    "id": "system-design-tradeoffs-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "A complete trade-off statement",
    "section": "System design tradeoffs",
    "prompt": "Which statement is a complete trade-off: it names the benefit, the cost, and the requirement that makes the cost acceptable?",
    "options": [
      "Cache seller data with a short expiry so that product pages load faster for buyers",
      "Cache display names under the agreed delay; check payment eligibility fresh at order time",
      "Cache every seller field with the same expiry so that the data stays uniformly fresh",
      "Avoid caching seller data at all, because a cache adds complexity to the architecture"
    ],
    "answer": 1,
    "explanation": "The second option names what may be stale (display names), the accepted delay, and the operation that needs a stronger check (payment eligibility). The first option sounds reasonable but never says which staleness is acceptable. The last option gives only \"complexity\" as the cost, which the lesson says to turn into a concrete retry, migration, or stale result.",
    "tags": [
      "system-design-tradeoffs",
      "recall",
      "inline"
    ]
  },
  {
    "id": "system-design-tradeoffs-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "A queue is not capacity",
    "section": "System design tradeoffs",
    "prompt": "Workers can process 800 jobs per second. A burst arrives at 1,000 jobs per second for 10 minutes, and you put a queue in front of the workers. What does the queue do during the burst?",
    "options": [
      "It absorbs the burst, but about 120,000 jobs pile up and user-visible delay grows until the burst ends",
      "It lifts throughput to 1,000 jobs per second by decoupling producers from the workers",
      "It drops the extra 200 jobs per second so accepted jobs keep a constant latency",
      "It builds a backlog of about 12,000 jobs that drains within a second of the burst ending"
    ],
    "answer": 0,
    "explanation": "The lesson says a queue does not create processing capacity. The 200 extra jobs per second for 600 seconds add up to a backlog of about 120,000, and that shows up as waiting time. Decoupling is the tempting answer, but it only moves the delay onto users; the workers still finish 800 jobs per second.",
    "tags": [
      "system-design-tradeoffs",
      "apply",
      "inline"
    ]
  },
  {
    "id": "system-design-tradeoffs-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Per-user metric labels",
    "section": "System design tradeoffs",
    "prompt": "To debug one customer, an engineer adds user_id as a label on the request-latency metric. The product has 5 million active users. Where does the cost show up first?",
    "options": [
      "Request latency rises, because every request has to write one more label value",
      "Very little changes, because each extra label adds only a few bytes per data point",
      "The metrics agent quietly drops the label once cardinality is high, losing the debug data",
      "The number of time series grows with the user population, inflating metric storage and query cost"
    ],
    "answer": 3,
    "explanation": "Each distinct label value creates its own time series, so a user ID label makes a small set of measurements grow with the user base. The lesson's point is that the cost follows the behavior, not the number of boxes in the diagram. \"Only a few bytes\" is the tempting answer, but it ignores that the cost multiplies per series rather than adding per point.",
    "tags": [
      "system-design-tradeoffs",
      "staff",
      "inline"
    ]
  },
  {
    "id": "system-design-tradeoffs-n1",
    "topic": "system-design-tradeoffs",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Metric Cardinality Explosion",
    "scenario": "An engineer adds a `user_id` Prometheus label to 5 HTTP latency histogram metrics (each histogram exposes 12 bucket series) for a service with 500,000 active users per scrape window.",
    "prompt": "How many millions of active time series are created by tagging those 5 histograms with `user_id`?",
    "question": "How many millions of active time series are created by tagging those 5 histograms with `user_id`?",
    "unit": "million series",
    "answer": 30,
    "tolerance": 0.25,
    "hint": "Total series = 5 histograms × 12 buckets × 500,000 users. Express the result in millions.",
    "explanation": "5 histograms × 12 buckets/histogram = 60 series per user. Multiplying by 500,000 active users yields 30,000,000 (30 million) active time series—enough to OOM-crash standard TSDB ingesters and inflate observability bills by tens of thousands of dollars per month.",
    "tags": [
      "system-design-tradeoffs",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "system-design-tradeoffs-t1",
    "topic": "system-design-tradeoffs",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Caching Seller Display Names vs Payment Eligibility",
    "scenario": "A marketplace checkout page reads both the seller's `display_name` and `can_accept_payments` status at 15,000 req/s. Compliance mandates zero orders processed after a seller is suspended for fraud.",
    "prompt": "Which data-access split should you implement, and what is the primary engineering justification?",
    "question": "Which data-access split should you implement, and what is the primary engineering justification?",
    "options": [
      "Cache both `display_name` and `can_accept_payments` with a 5-minute TTL to minimize database load",
      "Serve `display_name` from a TTL cache while verifying `can_accept_payments` synchronously against the authoritative store (or strongly consistent revocation list) at order submission",
      "Remove caching for all seller fields and run serializable transactions on every product page view"
    ],
    "correctOption": 1,
    "reasons": [
      "Identical data schemas always share the same freshness and correctness invariants",
      "Separating cosmetic read-heavy attributes from compliance-critical invariants preserves read scalability without violating the zero-fraud-order invariant",
      "Serializable reads on every page view are required to render cosmetic seller strings"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Ask which field tolerates staleness and which operation enforces a hard correctness invariant.",
    "explanation": "Fields living in the same table often have radically different staleness tolerances. A slightly stale `display_name` is harmless, whereas a stale `can_accept_payments` flag violates a hard compliance invariant during order placement.",
    "tags": [
      "system-design-tradeoffs",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["availability-durability-consistency-cost"] = [
  {
    "id": "availability-durability-consistency-cost-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Stopped database, intact files",
    "section": "Availability, durability, consistency, cost",
    "prompt": "The shortener's database process is stopped, but its data files are intact and nothing has been lost. Which property of the redirect path has failed?",
    "options": [
      "Durability, because acknowledged mappings cannot be read back",
      "Consistency, because readers see results that differ from the writes",
      "Availability, because the operation cannot be used right now",
      "Durability and consistency together, because nothing can be verified"
    ],
    "answer": 2,
    "explanation": "The mappings still exist, so durability holds, but the redirect operation cannot be used, which is an availability failure. Durability is the tempting choice, but it asks whether acknowledged data survives, not whether it can be reached at this moment. The lesson stresses that up-but-lossy and safe-but-unreachable are different situations.",
    "tags": [
      "availability-durability-consistency-cost",
      "recall",
      "inline"
    ]
  },
  {
    "id": "availability-durability-consistency-cost-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "The first read after create",
    "section": "Availability, durability, consistency, cost",
    "prompt": "A creator gets a success response and immediately opens the short link. The read goes to a replica 200 ms behind the primary and returns \"unknown code\". What is the straightforward first fix?",
    "options": [
      "Make destinations immutable so the replica can never return a stale answer",
      "Send the creator's first read to the database that accepted the write",
      "Have the replica fsync before answering, so it holds durable data",
      "Return the 404 anyway, since the mapping is durable on the primary"
    ],
    "answer": 1,
    "explanation": "The lesson's initial choice is to read from the database that accepted the creation, so a read that starts after a successful create can find the mapping. Immutability is the tempting answer, but the lesson notes it does not solve the first-read problem, because the row is missing on the replica rather than stale.",
    "tags": [
      "availability-durability-consistency-cost",
      "apply",
      "inline"
    ]
  },
  {
    "id": "availability-durability-consistency-cost-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Replicas copy mistakes",
    "section": "Availability, durability, consistency, cost",
    "prompt": "An operator accidentally runs DELETE on the links table. The team has a synchronous replica in another zone but has never set up backups. What happens?",
    "options": [
      "The replica keeps the rows, because synchronous replication only ships inserts and updates",
      "Failing over to the replica recovers every row with zero data loss",
      "The rows can be recovered as long as the primary has not yet checkpointed its log",
      "The replica applies the same delete, so recovery needs a backup or restore that does not exist"
    ],
    "answer": 3,
    "explanation": "A replica faithfully copies an accidental deletion. Protecting against operator error needs a backup and a tested restore, which cover a different failure than replicas do. Failing over is the tempting idea, but the standby already holds the same empty table.",
    "tags": [
      "availability-durability-consistency-cost",
      "staff",
      "inline"
    ]
  },
  {
    "id": "availability-durability-consistency-cost-n1",
    "topic": "availability-durability-consistency-cost",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Cross-AZ Replication Egress Cost",
    "scenario": "To achieve high durability and availability, your write-heavy logging cluster synchronously replicates every write across 3 Availability Zones. The cluster ingests 50 MB/s of primary writes continuously (assume 2.6 million seconds/month) and cloud cross-AZ data transfer costs $0.01 per GB in each direction.",
    "prompt": "How much monthly cross-AZ network transfer cost (in USD) is incurred just by replicating each primary write to the 2 peer AZs?",
    "question": "How much monthly cross-AZ network transfer cost (in USD) is incurred just by replicating each primary write to the 2 peer AZs?",
    "unit": "USD/month",
    "answer": 2600,
    "tolerance": 0.2,
    "hint": "Primary write volume = 50 MB/s × 2.6M s = 130,000 GB/month. Sending to 2 remote AZs transfers 2 × 130,000 = 260,000 GB/month at $0.01/GB.",
    "explanation": "50 MB/s over 2.6M seconds equals 130,000,000 MB = 130,000 GB of primary writes per month. Replicating every write to 2 additional AZs sends 260,000 GB across AZ boundaries each month. At $0.01/GB, cross-AZ replication alone costs $2,600/month.",
    "tags": [
      "availability-durability-consistency-cost",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "availability-durability-consistency-cost-t1",
    "topic": "availability-durability-consistency-cost",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Tiered Durability and Consistency by Data Criticality",
    "scenario": "Your e-commerce platform handles both customer order payments and real-time product page-view counters. Running both workloads on a synchronous multi-region Paxos database is projected to exceed the infrastructure budget by 4x.",
    "prompt": "Which architectural split should you implement, and what is the primary justification?",
    "question": "Which architectural split should you implement, and what is the primary justification?",
    "options": [
      "Move both payments and page-view counters to an eventually consistent single-AZ Redis cluster to cut costs by 80%",
      "Keep payments on the synchronous quorum database (RPO=0, strong consistency) while moving page-view counters to buffered local aggregation with asynchronous flush (bounded RPO, eventual consistency)",
      "Keep both on the synchronous Paxos database but disable fsync on transaction logs to double throughput"
    ],
    "correctOption": 1,
    "reasons": [
      "Financial ledgers and page-view counters have identical regulatory and correctness requirements",
      "Aligning durability (RPO) and consistency guarantees per workload avoids paying synchronous quorum and cross-AZ egress costs for high-volume telemetry that can tolerate seconds of loss",
      "Disabling fsync preserves zero-data-loss durability while lowering compute bills"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Match the cost of RPO=0 and linearizability only to state transitions that cannot be reconstructed or approximated.",
    "explanation": "Strong consistency and zero-RPO durability carry steep latency and network replication costs. Partitioning state by business criticality—synchronous quorum persistence for financial transactions, batched asynchronous writes for high-frequency telemetry—reduces infrastructure spend dramatically without compromising ledger invariants.",
    "tags": [
      "availability-durability-consistency-cost",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["back-of-the-envelope-capacity-planning"] = [
  {
    "id": "back-of-the-envelope-capacity-planning-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Daily volume to rate",
    "section": "Back-of-the-envelope capacity planning",
    "prompt": "Using the anchor that a day is about 86,400 seconds, roughly what average rate is 1 billion events per day?",
    "options": [
      "About 1,200 per second",
      "About 120,000 per second",
      "About 86,400 per second",
      "About 12,000 per second"
    ],
    "answer": 3,
    "explanation": "1 billion divided by 86,400 seconds is about 11,600, which rounds to roughly 12,000 per second (the same way 1 million per day is about 12 per second). That is only the average; the design still has to cover an assumed peak multiple, such as ten times higher.",
    "tags": [
      "back-of-the-envelope-capacity-planning",
      "recall",
      "inline"
    ]
  },
  {
    "id": "back-of-the-envelope-capacity-planning-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Storage from retention",
    "section": "Back-of-the-envelope capacity planning",
    "prompt": "A service stores 2 million new records per day and keeps them for three 365-day years. Each record takes about 250 bytes including indexes. How much space does one copy of this data need?",
    "options": [
      "About 0.18 TB",
      "About 0.55 TB",
      "About 1.8 TB",
      "About 5.5 TB"
    ],
    "answer": 1,
    "explanation": "2 million times 1,095 days is 2.19 billion records, and at 250 bytes that is about 547 GB, or roughly 0.55 decimal TB. The lesson adds replicas, backups and write logs separately, and warns not to count indexes twice when the measured record size already includes them.",
    "tags": [
      "back-of-the-envelope-capacity-planning",
      "apply",
      "inline"
    ]
  },
  {
    "id": "back-of-the-envelope-capacity-planning-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "What a benchmark proves",
    "section": "Back-of-the-envelope capacity planning",
    "prompt": "The historical local test completed about 11,574 warm indexed lookups per second for 20 seconds, with none failing or taking longer than one second. What is the strongest claim this result supports?",
    "options": [
      "The complete service can sustain 11,574 redirects per second for its five-year life",
      "The simple indexed database design is worth testing further, including the app and event insert",
      "A cache is unnecessary, because no lookup exceeded the one-second latency limit",
      "Peak capacity is about 115,740 per second once the tenfold peak factor is applied"
    ],
    "answer": 1,
    "explanation": "The test used a local socket and left out both the application and the required event insert, so it only supports testing the simple design further. Claiming complete-service capacity is the tempting misreading, because that path, its writes, and growth over five years were never measured.",
    "tags": [
      "back-of-the-envelope-capacity-planning",
      "staff",
      "inline"
    ]
  },
  {
    "id": "back-of-the-envelope-capacity-planning-n1",
    "topic": "back-of-the-envelope-capacity-planning",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Peak Egress Bandwidth for Feed Service",
    "scenario": "A social feed serves 10 million Daily Active Users (DAU), each fetching their home feed 20 times per day. Assume 100,000 seconds/day, a 10x peak-to-average traffic ratio, and an average compressed JSON response payload of 20 KB per feed request.",
    "prompt": "What is the peak outbound network bandwidth required at the API boundary in MB/s (using 1 MB = 1,000 KB)?",
    "question": "What is the peak outbound network bandwidth required at the API boundary in MB/s (using 1 MB = 1,000 KB)?",
    "unit": "MB/s",
    "answer": 400,
    "tolerance": 0.25,
    "hint": "Average QPS = (10M × 20) / 100,000 = 2,000 req/s. Peak QPS = 2,000 × 10 = 20,000 req/s. Multiply by 20 KB and convert to MB/s.",
    "explanation": "Total daily requests = 10M × 20 = 200M/day. Dividing by ~100,000 sec/day yields ~2,000 req/s average, and 20,000 req/s at 10x peak (or ~23,000 req/s using exact 86,400 s). Multiplying 20,000 req/s × 20 KB/req = 400,000 KB/s = 400 MB/s (~3.2 Gbps) of sustained peak egress.",
    "tags": [
      "back-of-the-envelope-capacity-planning",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "back-of-the-envelope-capacity-planning-t1",
    "topic": "back-of-the-envelope-capacity-planning",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Sizing Storage From Assumptions vs Fixture Measurements",
    "scenario": "Your initial napkin estimate assumed 500 bytes per URL row (0.91 TB for 1.825B rows over 5 years), but a 1M-row PostgreSQL 16 benchmark fixture measured 138 bytes per row including B-tree indexes (0.25 TB).",
    "prompt": "How should you translate this fixture measurement into the production capacity plan, and why?",
    "question": "How should you translate this fixture measurement into the production capacity plan, and why?",
    "options": [
      "Provision exactly 0.25 TB of disk across production with zero headroom since the fixture was measured on real PostgreSQL",
      "Anchor the baseline to the 138 B/row measurement, but apply explicit multipliers for MVCC dead-tuple bloat, WAL retention, replicas, and URL-length variance",
      "Discard the PostgreSQL benchmark entirely and provision a 50 TB sharded NoSQL cluster immediately"
    ],
    "correctOption": 1,
    "reasons": [
      "A static 1M-row insert fixture captures all future vacuum bloat, WAL spikes, and backup overhead",
      "Empirical row+index measurements replace guesswork on tuple layout, while explicit operational multipliers account for MVCC churn, WAL, and replication",
      "Sharding on day one avoids having to measure storage overhead"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Distinguish between static tuple+index bytes in a clean load vs live operational disk usage (MVCC, WAL, replicas).",
    "explanation": "Empirical fixture measurements replace arbitrary row-size guesses, proving a single node easily holds the 5-year dataset. However, a clean fixture load omits MVCC dead tuples, B-tree page split fragmentation (~20-30%), WAL segments, and replica copies, which must be budgeted explicitly.",
    "tags": [
      "back-of-the-envelope-capacity-planning",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["concurrency-vs-parallelism"] = [
  {
    "id": "concurrency-vs-parallelism-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Async does not offload CPU",
    "section": "How a server handles many requests",
    "prompt": "A Node.js handler declared async spends 200 ms hashing a password in plain JavaScript on the event-loop thread. What happens to other requests during that time?",
    "options": [
      "Their callbacks are blocked for about 200 ms, since async does not move CPU work off the loop",
      "They continue, because Node sends async functions to the libuv worker pool automatically",
      "They continue, because the promise lets the hashing run in parallel on another core",
      "Only requests to the same route are delayed, while other routes run as normal"
    ],
    "answer": 0,
    "explanation": "Declaring a function async does not move its computation to another processor, so a long CPU task on the loop thread stops other callbacks from running. The worker pool is the tempting answer, but it only runs certain platform operations; application CPU work needs worker threads, separate processes, or chunks that yield.",
    "tags": [
      "concurrency-vs-parallelism",
      "recall",
      "inline"
    ]
  },
  {
    "id": "concurrency-vs-parallelism-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "The single-core CPU floor",
    "section": "How a server handles many requests",
    "prompt": "Each request needs 5 ms of CPU, waits 40 ms on the database, then needs 1 ms more of CPU. Thirty-two requests arrive at once on one core. However well the waits overlap, what is the minimum time to finish them all?",
    "options": [
      "About 46 ms, since every request can wait at the same time",
      "About 96 ms, the CPU time of the lesson's sixteen-request batch",
      "About 192 ms, the total CPU work that one core must execute",
      "About 1,472 ms, since each request takes 46 ms end to end"
    ],
    "answer": 2,
    "explanation": "Thirty-two requests times 6 ms of CPU is 192 ms, and overlapping waits cannot make one core run those instructions any sooner. The 46 ms answer is tempting because every wait can overlap, but the compute cannot, and 1,472 ms is what you get with no overlap at all.",
    "tags": [
      "concurrency-vs-parallelism",
      "apply",
      "inline"
    ]
  },
  {
    "id": "concurrency-vs-parallelism-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Connection caps add up",
    "section": "How a server handles many requests",
    "prompt": "You run 30 app instances, each with a database pool capped at 10, plus 20 background workers holding 2 connections each. The database allows 200 connections. What is the risk?",
    "options": [
      "None, because every process stays within its own configured cap",
      "Up to 300 connections, fine if workers borrow from the app pools",
      "Up to 40 connections, since pooled connections are shared across instances",
      "Up to 340 connections, more than the database allows; per-process caps are not global"
    ],
    "answer": 3,
    "explanation": "30 times 10 plus 20 times 2 is 340, well over the limit of 200. The lesson warns that a per-process cap is not a system-wide cap, so concurrency must be budgeted across every instance and background worker. The first option is the tempting mistake of checking each process on its own.",
    "tags": [
      "concurrency-vs-parallelism",
      "staff",
      "inline"
    ]
  },
  {
    "id": "concurrency-vs-parallelism-n1",
    "topic": "concurrency-vs-parallelism",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Little's Law for Concurrent I/O Workers",
    "scenario": "A Node.js API server processes requests that spend 2 ms on CPU and 48 ms waiting on non-blocking downstream database I/O (50 ms total response time). You want a single process to sustain 1,000 requests/second.",
    "prompt": "By Little's Law (L = λ × W), how many concurrent in-flight requests are active inside the process on average?",
    "question": "By Little's Law (L = λ × W), how many concurrent in-flight requests are active inside the process on average?",
    "unit": "requests",
    "answer": 50,
    "tolerance": 0.2,
    "hint": "Multiply arrival rate λ (1,000 req/s) by average residence time W (0.05 seconds).",
    "explanation": "By Little's Law, average concurrency L = λ × W = 1,000 req/s × 0.050 s = 50 in-flight requests. Note that while 50 requests overlap concurrently waiting on I/O, the single CPU core is panicked only if CPU time exceeds capacity (here 1,000 × 2 ms = 2,000 ms/s, which would actually require 2 CPU cores in parallel!).",
    "tags": [
      "concurrency-vs-parallelism",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "concurrency-vs-parallelism-t1",
    "topic": "concurrency-vs-parallelism",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Event-Loop Concurrency vs Multi-Core Parallelism for Mixed Workloads",
    "scenario": "An API gateway written on a single-threaded async event loop handles 10,000 concurrent WebSocket connections smoothly, until a new feature adds synchronous 40 ms PDF signature verification on 5% of messages, causing p99 heartbeat timeouts across all clients.",
    "prompt": "Which execution model change should you adopt, and what is the primary justification?",
    "question": "Which execution model change should you adopt, and what is the primary justification?",
    "options": [
      "Increase the async event loop's max socket backlog and keep PDF verification inline on the event loop thread",
      "Keep network I/O multiplexed on the non-blocking event loop, but offload CPU-bound PDF verification to a bounded multi-core worker thread pool",
      "Replace the non-blocking event loop entirely with one OS kernel thread per WebSocket connection"
    ],
    "correctOption": 1,
    "reasons": [
      "A larger socket backlog prevents a 40 ms synchronous CPU computation from blocking the single event-loop thread",
      "Separating high-concurrency I/O multiplexing from bounded multi-core CPU parallelism prevents head-of-line blocking on the event loop without paying the memory cost of 10,000 OS threads",
      "Spawning 10,000 OS threads eliminates context-switching overhead for CPU-bound tasks"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "An event loop excels at concurrent I/O waits, but a single 40 ms CPU task freezes all I/O callbacks on that thread.",
    "explanation": "Concurrency via a single-threaded event loop handles thousands of waiting I/O sockets efficiently, but any CPU-bound task blocks the entire loop (head-of-line blocking). Offloading CPU work to a bounded worker pool sized to physical CPU cores achieves true hardware parallelism for compute while preserving lightweight concurrency for I/O.",
    "tags": [
      "concurrency-vs-parallelism",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["horizontal-vs-vertical-scaling"] = [
  {
    "id": "horizontal-vs-vertical-scaling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Prerequisite for scale-out",
    "section": "Engineering Realities & Trade-Offs",
    "prompt": "What must be true of an application tier before you can scale it out by adding nodes behind a load balancer?",
    "options": [
      "Each node must fit inside one NUMA node to avoid cross-socket memory penalties",
      "The tier must be stateless, with sessions and in-flight jobs kept in a shared store",
      "The database behind it must be sharded, so each node gets its own partition",
      "The load balancer must run at layer 7, so it can read session cookies"
    ],
    "answer": 1,
    "explanation": "Horizontal scaling assumes any node can serve any request, so sessions, in-flight jobs and persistent data must move to shared stores such as Redis or a database. NUMA fit is a right-sizing concern for each node, and sticky routing at layer 7 is a workaround that brings back the problem of state living on one node.",
    "tags": [
      "horizontal-vs-vertical-scaling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "horizontal-vs-vertical-scaling-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing with N+1",
    "section": "Worked example: when to scale up and when to scale out",
    "prompt": "Load tests show one instance sustains 500 requests per second within its latency target. Peak traffic is 3,600 requests per second, and you must survive losing one instance. How many instances do you run?",
    "options": [
      "7",
      "8",
      "10",
      "9"
    ],
    "answer": 3,
    "explanation": "3,600 divided by 500 is 7.2, which rounds up to 8 instances to carry the peak, plus 1 spare for N+1 makes 9. Eight is the tempting answer because it covers the peak, but losing one instance would then leave only 7 for traffic that needs 7.2.",
    "tags": [
      "horizontal-vs-vertical-scaling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "horizontal-vs-vertical-scaling-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Autoscaler overwhelms the database",
    "section": "Failure modes to watch",
    "prompt": "During a spike, the autoscaler adds 25 instances of a stateless REST API (short-lived requests) in one step. Each instance opens a 20-connection pool at startup. What is most likely to fail first?",
    "options": [
      "The database, which suddenly has to accept up to 500 new connections",
      "The load balancer, which cannot register 25 new targets at the same moment",
      "The new instances, which stay idle because clients remain pinned to old nodes",
      "The cloud quota, since providers cap scale-out at 10 instances per step"
    ],
    "answer": 0,
    "explanation": "This is the lesson's thundering scale-out failure: many new connection pools opening at once can overload the shared database. Idle new nodes is a real failure mode for long-lived WebSocket connections, but with short stateless requests the load balancer spreads new traffic onto them quickly.",
    "tags": [
      "horizontal-vs-vertical-scaling",
      "staff",
      "inline"
    ]
  },
  {
    "id": "horizontal-vs-vertical-scaling-n1",
    "topic": "horizontal-vs-vertical-scaling",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: N+1 Horizontal Fleet Sizing with Headroom",
    "scenario": "Your stateless checkout tier needs to handle a peak load of 12,000 req/s. Each 8-vCPU instance can safely process 1,500 req/s at its target 70% CPU utilization ceiling.",
    "prompt": "If your availability policy requires surviving the simultaneous loss of 2 instances (N+2 redundancy) without breaching the 70% CPU ceiling, how many instances must be running in the fleet?",
    "question": "If your availability policy requires surviving the simultaneous loss of 2 instances (N+2 redundancy) without breaching the 70% CPU ceiling, how many instances must be running in the fleet?",
    "unit": "instances",
    "answer": 10,
    "tolerance": 0.2,
    "hint": "Minimum active instances N = 12,000 / 1,500 = 8. Add 2 instances for N+2 fault tolerance.",
    "explanation": "At 1,500 req/s per instance, serving 12,000 req/s requires N = 8 healthy instances. To survive losing 2 instances simultaneously while keeping remaining nodes within the 1,500 req/s limit, you must provision 8 + 2 = 10 instances.",
    "tags": [
      "horizontal-vs-vertical-scaling",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "horizontal-vs-vertical-scaling-t1",
    "topic": "horizontal-vs-vertical-scaling",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Vertical Scale-Up vs Premature Database Sharding",
    "scenario": "Your relational primary database sits on a 16-vCPU, 64 GB RAM VM and hits 85% CPU and buffer-pool thrashing during daily peak traffic. The dataset is 180 GB and grows by 5 GB/month.",
    "prompt": "Which scaling path should you execute first, and what is the primary engineering justification?",
    "question": "Which scaling path should you execute first, and what is the primary engineering justification?",
    "options": [
      "Immediately freeze feature development for 6 months to shard the database across 16 horizontal nodes",
      "Vertically scale the instance to 64 vCPUs / 512 GB RAM (plus a read replica for failover/reads) so the entire 180 GB working set fits in memory without breaking ACID joins",
      "Keep the 16-vCPU database and add 20 more stateless application servers to speed up SQL execution"
    ],
    "correctOption": 1,
    "reasons": [
      "A 180 GB dataset exceeds the physical limits of modern cloud instances",
      "Vertical scaling fits the entire 180 GB dataset in RAM with zero application re-architecture, whereas horizontal sharding sacrifices cross-shard ACID transactions and adds massive operational complexity long before hardware ceilings are reached",
      "Adding stateless application servers reduces CPU load on the underlying database"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Modern cloud instances scale to 128+ vCPUs and multiple terabytes of RAM; compare that against the cost of distributed joins and shard rebalancing.",
    "explanation": "At 180 GB (+60 GB/year), the entire database easily fits into the RAM of a single vertically scaled instance for years to come. Sharding a relational database prematurely destroys single-node ACID guarantees, complicates every query and migration, and consumes months of engineering time to solve a problem a 10-minute failover to a larger instance fixes.",
    "tags": [
      "horizontal-vs-vertical-scaling",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["monolith-vs-microservices"] = [
  {
    "id": "monolith-vs-microservices-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why services avoid 2PC",
    "section": "Core Production Invariants",
    "prompt": "Once services have separate databases, why is two-phase commit rarely used to make cross-service writes atomic?",
    "options": [
      "It only works when every participant shares a single database engine",
      "It cannot coordinate more than two participants in one transaction",
      "Participants can be left blocked when the coordinator fails mid-protocol",
      "It provides only eventual consistency, which breaks ACID guarantees"
    ],
    "answer": 2,
    "explanation": "Two-phase commit is atomic, but participants that have voted to commit can sit holding locks until the coordinator comes back, which is why services usually use sagas instead. The \"two\" in its name refers to its two phases, not a limit of two participants. Eventual consistency describes sagas, not 2PC.",
    "tags": [
      "monolith-vs-microservices",
      "recall",
      "inline"
    ]
  },
  {
    "id": "monolith-vs-microservices-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Availability multiplies",
    "section": "Worked example: the cost of one extra hop",
    "prompt": "A checkout request calls four services one after another, and each is 99.9% available on its own. Ignoring the caller's own failures, what is the best availability the combined path can reach?",
    "options": [
      "About 99.9%, the same as its weakest service",
      "About 99.6%, the product of four 99.9% values",
      "About 96.1%, the product of four 99% values",
      "About 99.0%, one nine lost per dependency added"
    ],
    "answer": 1,
    "explanation": "Serial dependencies multiply: 0.999 to the fourth power is about 0.996. Assuming the path is as available as its weakest link is the tempting error, because any one of the four failing breaks the request. 96.1% is what you get from four services each meeting their latency target 99% of the time.",
    "tags": [
      "monolith-vs-microservices",
      "apply",
      "inline"
    ]
  },
  {
    "id": "monolith-vs-microservices-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "When a split pays",
    "section": "Signals that a split is justified",
    "prompt": "Every new service adds its own pipelines, tracing, on-call and versioned APIs. Which situation most clearly justifies paying that cost?",
    "options": [
      "The codebase has grown past 500,000 lines and full builds now take twenty minutes",
      "A new team wants its own framework for a feature that reads and writes the shared orders tables",
      "Card data handling must sit inside its own PCI DSS compliance boundary, apart from the rest",
      "Order and payment code call each other constantly and must commit in one transaction"
    ],
    "answer": 2,
    "explanation": "A separate security or compliance boundary is one of the lesson's listed signals. A team that still writes the shared tables would create a distributed monolith, paying network costs without gaining independence. Code that calls itself constantly and shares transactions is a reason to keep it in one process.",
    "tags": [
      "monolith-vs-microservices",
      "staff",
      "inline"
    ]
  },
  {
    "id": "monolith-vs-microservices-n1",
    "topic": "monolith-vs-microservices",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Serial Microservice Call Chain Availability",
    "scenario": "A checkout request fans through a synchronous chain of 5 independent microservices (Cart -> Pricing -> Tax -> Fraud -> Ledger). Each service independently maintains a 99.9% (0.999) availability SLO.",
    "prompt": "Assuming failures are independent and any single service failure fails the checkout, what is the maximum composite availability (as a percentage, e.g., 99.5) of the end-to-end checkout call?",
    "question": "Assuming failures are independent and any single service failure fails the checkout, what is the maximum composite availability (as a percentage, e.g., 99.5) of the end-to-end checkout call?",
    "unit": "%",
    "answer": 99.5,
    "tolerance": 0.2,
    "hint": "For small unavailability ε = 0.1%, 5 serial dependencies yield approximately 100% - (5 × 0.1%) = 99.5%.",
    "explanation": "When N services are called synchronously in series, composite availability is 0.999^5 ≈ 0.99501, or 99.5%. Five three-nines services in a serial chain multiply your allowable downtime budget by 5x.",
    "tags": [
      "monolith-vs-microservices",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "monolith-vs-microservices-t1",
    "topic": "monolith-vs-microservices",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Modular Monolith vs Fine-Grained Microservices for an Evolving Domain",
    "scenario": "A 12-engineer startup is building a B2B billing platform where domain boundaries between invoicing, usage metering, and dunning change every sprint, and operations require strict atomic consistency across those modules.",
    "prompt": "Which service topology should you choose, and what is the primary justification?",
    "question": "Which service topology should you choose, and what is the primary justification?",
    "options": [
      "Split the system into 15 microservices with separate databases from day one so each engineer owns a service",
      "Build a modular monolith with strict compile-time package boundaries and a shared database, extracting services only when independent scaling or team autonomy demands it",
      "Build an unstructured monolith where every controller writes directly to any table without module interfaces"
    ],
    "correctOption": 1,
    "reasons": [
      "Distributed sagas and two-phase commits are faster to refactor than in-process function calls",
      "A modular monolith preserves single-database ACID transactions and cheap boundary refactoring while domain seams are still fluid, avoiding distributed monolith failure modes",
      "Removing all module boundaries guarantees zero coupling as the codebase grows"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What happens when you get a domain boundary wrong across network RPCs versus across in-process packages?",
    "explanation": "When domain boundaries are still being discovered and cross-module updates require atomicity, premature microservices create a distributed monolith: every feature requires coordinated multi-repo deploys and complex distributed sagas. Enforcing module boundaries in-process gives you clean encapsulation with local ACID transactions and easy refactoring.",
    "tags": [
      "monolith-vs-microservices",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["repository-pattern"] = [
  {
    "id": "repository-pattern-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Leaky generic repository",
    "section": "Engineering Realities & Anti-Patterns",
    "prompt": "Why does a generic repository that accepts arbitrary query predicates or query builders from service code defeat the purpose of the pattern?",
    "options": [
      "Generic repositories cannot be swapped for in-memory fakes in unit tests",
      "Schema and query details leak into domain services, so storage changes spread to every caller",
      "Predicates always compile to full table scans, which hurts query performance",
      "It forces every aggregate to share one table, which breaks domain boundaries"
    ],
    "answer": 1,
    "explanation": "Once services pass database-specific filters in, knowledge of the schema spreads across domain code, and the abstraction no longer protects anything. The testability option is tempting, but the real problem is the leak itself; a leaky interface can still be faked, it just no longer hides the storage details.",
    "tags": [
      "repository-pattern",
      "recall",
      "inline"
    ]
  },
  {
    "id": "repository-pattern-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Atomic insert-if-absent",
    "section": "Worked example: a link repository",
    "prompt": "Two requests generate the same short code at the same moment. How should the Postgres adapter implement insertIfAbsent so that exactly one returns Inserted and the other returns CodeTaken?",
    "options": [
      "SELECT by code first, and INSERT only when no row comes back",
      "Hold an in-process mutex around code generation and the insert",
      "INSERT and treat any exception from the driver as CodeTaken",
      "INSERT ... ON CONFLICT (code) DO NOTHING, then check rows affected"
    ],
    "answer": 3,
    "explanation": "Letting the unique constraint decide via ON CONFLICT keeps the check atomic inside the database, and the affected-row count tells you which result to return. Checking first and then inserting is the classic race, where both requests see no row. An in-process mutex does nothing across multiple app instances.",
    "tags": [
      "repository-pattern",
      "apply",
      "inline"
    ]
  },
  {
    "id": "repository-pattern-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Two repositories, one crash",
    "section": "Failure modes",
    "prompt": "Checkout saves an order through OrderRepository and decrements stock through InventoryRepository, and each commits its own transaction. The process crashes between the two commits. What state are you left in?",
    "options": [
      "The order is committed but stock was never reduced, because nothing grouped the writes",
      "Both writes roll back, because the repositories share one connection pool",
      "The stock is reduced but the order is missing, since inventory always commits first",
      "Nothing is lost, because the ORM replays unfinished repository calls on restart"
    ],
    "answer": 0,
    "explanation": "Two separate commits can leave one done and the other not. The lesson says writes across repositories need a shared transaction, the Unit of Work pattern. Sharing a connection pool is the tempting answer, but a pool shares connections, not transactions, so it provides no atomicity.",
    "tags": [
      "repository-pattern",
      "staff",
      "inline"
    ]
  },
  {
    "id": "repository-pattern-n1",
    "topic": "repository-pattern",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: N+1 Leaky Repository Query Penalty",
    "scenario": "A generic repository method `findOrdersByUser(userId)` returns 40 Order entities, and a service loop then calls `itemRepo.findByOrderId(order.id)` for each order. Each database round-trip takes 2.5 ms over the local network.",
    "prompt": "How many milliseconds of total database round-trip time are spent executing this 1 + 40 query pattern (compared to 2.5 ms for a single batched query)?",
    "question": "How many milliseconds of total database round-trip time are spent executing this 1 + 40 query pattern (compared to 2.5 ms for a single batched query)?",
    "unit": "ms",
    "answer": 102.5,
    "tolerance": 0.2,
    "hint": "Total queries = 1 (orders) + 40 (items per order) = 41 sequential round-trips × 2.5 ms.",
    "explanation": "Executing 1 query for the orders plus 40 sequential queries for each order's line items results in 41 round-trips × 2.5 ms = 102.5 ms of pure network/query latency—41x slower than a repository method designed around the aggregate root or a batched `WHERE order_id IN (...)` fetch.",
    "tags": [
      "repository-pattern",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "repository-pattern-t1",
    "topic": "repository-pattern",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Domain-Specific Aggregate Repository vs Generic IQueryable Leak",
    "scenario": "Engineers propose having repositories return a lazy ORM query builder (`IQueryable` / `QuerySet`) to application controllers so callers can chain arbitrary `.where()`, `.join()`, and `.include()` clauses.",
    "prompt": "Which repository interface design should you enforce, and what is the primary justification?",
    "question": "Which repository interface design should you enforce, and what is the primary justification?",
    "options": [
      "Expose raw query builders from the repository so every controller can invent custom ad-hoc SQL joins",
      "Expose explicit, domain-named query and mutation methods on aggregate boundaries that return materialized domain objects or projections",
      "Provide only `getById(id)` and `findAll()` on every repository and perform all filtering and joining in application memory"
    ],
    "correctOption": 1,
    "reasons": [
      "Exposing ORM query builders to controllers makes index tuning and storage migration trivial",
      "Explicit domain methods keep query plans, index coverage, and persistence semantics encapsulated inside the repository rather than scattering unindexed queries and N+1 lazy loads across callers",
      "Loading entire tables into application memory for filtering scales effortlessly past millions of rows"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "If any controller can attach arbitrary `.where()` predicates, how can you audit whether every production query is backed by an index?",
    "explanation": "Returning a lazy query builder from a repository defeats the purpose of the abstraction: persistence concerns (unindexed predicates, accidental lazy-loading N+1s, vendor-specific join behavior) leak into the callers, and you can no longer use an in-memory fake with confidence that production queries match tested paths.",
    "tags": [
      "repository-pattern",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["extensible-data-modeling"] = [
  {
    "id": "extensible-data-modeling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "The cost of EAV",
    "section": "Core Production Strategies",
    "prompt": "Why does the lesson treat Entity-Attribute-Value tables as a last resort compared with a JSONB column?",
    "options": [
      "EAV cannot store new attributes without an ALTER TABLE migration",
      "Filtering on several attributes needs repeated self-joins, and per-attribute constraints are lost",
      "EAV rows cannot be indexed, so every lookup scans the whole table",
      "EAV makes every attribute NOT NULL, which forbids sparse data"
    ],
    "answer": 1,
    "explanation": "EAV allows unlimited runtime attributes, but querying several attributes turns into a pile of self-joins, values are stored as text, and there are no native foreign keys or per-attribute constraints. The migration option is backwards: runtime flexibility without schema changes is exactly EAV's appeal.",
    "tags": [
      "extensible-data-modeling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "extensible-data-modeling-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Backfill duration",
    "section": "Worked example: renaming a column with expand/contract",
    "prompt": "You backfill a new column on 1.2 billion rows in batches of 10,000 rows per transaction, throttled to 1,500 batches per minute to keep replica lag low. About how long does the backfill take?",
    "options": [
      "About 8 minutes",
      "About 2 hours",
      "About 13 hours",
      "About 80 minutes"
    ],
    "answer": 3,
    "explanation": "1,500 batches of 10,000 rows is 15 million rows per minute, and 1.2 billion divided by 15 million is 80 minutes. The lesson's own example (20 million rows per minute for 1.8 billion rows) takes about 90 minutes, and it throttles on purpose because backfills that run too fast cause replica lag and lock contention.",
    "tags": [
      "extensible-data-modeling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "extensible-data-modeling-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "When to drop the old column",
    "section": "Failure modes",
    "prompt": "Reads have switched to destination_url and the backfill check shows zero rows where the two columns differ. When is it safe to drop the old url column?",
    "options": [
      "Right away, since the backfill is verified and both columns now match",
      "As soon as the deploy that reads destination_url has reached every web node",
      "Only after writes to url stop and no running version, batch job, or logged query still uses it",
      "Right away, since dropping a nullable column is a fast metadata-only change in PostgreSQL"
    ],
    "answer": 2,
    "explanation": "Contract is the one step you cannot undo, so first stop writing url, then confirm from query logs that no deploy or batch job still reads it. Checking only the web nodes is tempting, but an old batch job reading url is exactly the failure the lesson warns about. How fast the drop runs does not make it safe.",
    "tags": [
      "extensible-data-modeling",
      "staff",
      "inline"
    ]
  },
  {
    "id": "extensible-data-modeling-n1",
    "topic": "extensible-data-modeling",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: EAV Join Row Fan-Out",
    "scenario": "A multi-tenant CRM stores custom fields in an Entity-Attribute-Value (EAV) table. You have 2,000,000 contact entities, and each contact has 25 custom attributes stored as separate rows in `contact_attributes`.",
    "prompt": "How many total rows (in millions) exist in the `contact_attributes` EAV table that the database must index and maintain?",
    "question": "How many total rows (in millions) exist in the `contact_attributes` EAV table that the database must index and maintain?",
    "unit": "million rows",
    "answer": 50,
    "tolerance": 0.2,
    "hint": "Multiply 2,000,000 contacts by 25 attribute rows per contact.",
    "explanation": "In an EAV schema, each attribute of an entity becomes its own row: 2,000,000 entities × 25 attributes = 50,000,000 (50 million) rows, turning a single-row lookup or multi-attribute filter into multi-way self-joins across a 50M-row table.",
    "tags": [
      "extensible-data-modeling",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "extensible-data-modeling-t1",
    "topic": "extensible-data-modeling",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Hybrid Relational Columns + Validated JSONB vs Pure EAV",
    "scenario": "You are designing a multi-tenant B2B SaaS product catalog where 90% of queries filter by `tenant_id`, `sku`, `status`, and `price_cents`, while each enterprise tenant also defines 5–20 custom metadata fields (two of which occasionally need filtered search).",
    "prompt": "Which schema architecture should you adopt, and what is the primary justification?",
    "question": "Which schema architecture should you adopt, and what is the primary justification?",
    "options": [
      "Store all fields (including sku and price) in a string-typed Entity-Attribute-Value (EAV) table",
      "Run `ALTER TABLE ADD COLUMN` on the shared table every time any tenant creates a custom attribute",
      "Keep core invariants (`tenant_id`, `sku`, `status`, `price_cents`) in typed relational columns and store tenant-specific attributes in a schema-validated JSONB column with targeted expression/GIN indexes"
    ],
    "correctOption": 2,
    "reasons": [
      "EAV tables provide native foreign keys, numeric range checks, and zero-join point reads",
      "Running DDL migrations per tenant scales cleanly to thousands of tenants and tens of thousands of sparse columns",
      "A hybrid relational + validated JSONB model preserves strict SQL types and fast B-tree indexes on universal core fields while supporting zero-DDL tenant extensibility without EAV self-join amplification"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Compare 5-way EAV self-joins and lost data types against keeping core columns relational and isolating variable attributes in indexed JSONB.",
    "explanation": "Pure EAV destroys type safety, bloats row counts by 10–30x, and requires expensive self-joins to reconstruct a single record. Per-tenant DDL quickly hits column limits and lock contention. Keeping shared core invariants in first-class SQL columns and placing tenant-defined extensions in application-validated JSONB (with GIN or functional B-tree indexes) gives both relational integrity and safe extensibility.",
    "tags": [
      "extensible-data-modeling",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["cost-aware-architecture"] = [
  {
    "id": "cost-aware-architecture-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Poor fit for Spot",
    "section": "Production Cost Optimization Mechanics",
    "prompt": "Spot or preemptible capacity can be reclaimed at short notice. Which workload is the poorest fit for it?",
    "options": [
      "Asynchronous queue workers that retry jobs",
      "A single stateful primary database",
      "Nightly analytics batch pipelines",
      "Stateless image-thumbnail processors"
    ],
    "answer": 1,
    "explanation": "Spot suits interruptible, retryable work, while a single stateful primary loses availability, and possibly recent writes, whenever it is reclaimed. Queue workers can look risky, but a retried job simply runs again on another instance, which is why the lesson lists them as good Spot candidates.",
    "tags": [
      "cost-aware-architecture",
      "recall",
      "inline"
    ]
  },
  {
    "id": "cost-aware-architecture-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Pricing redirect egress",
    "section": "Worked example: pricing the shortener's traffic",
    "prompt": "Traffic grows to 200 million redirects per day with about 1 kB per response including headers. At an illustrative 0.09 USD per GB of internet egress, roughly what is the monthly egress bill?",
    "options": [
      "About 54 USD",
      "About 5,400 USD",
      "About 540 USD",
      "About 18 USD"
    ],
    "answer": 2,
    "explanation": "200 million times 1 kB is 200 GB per day, about 6 TB in a 30-day month, and 6,000 GB times 0.09 USD is about 540 USD. The lesson's point still stands: for this product, the cost of retaining events dominates, while egress would dominate for a media product.",
    "tags": [
      "cost-aware-architecture",
      "apply",
      "inline"
    ]
  },
  {
    "id": "cost-aware-architecture-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Cold tier, hot reads",
    "section": "Failure modes",
    "prompt": "To cut storage cost, a team moves product thumbnails that are viewed thousands of times a day from S3 Standard to Standard-Infrequent Access. What is the likely result?",
    "options": [
      "Every view waits hours, because Infrequent Access objects must be restored first",
      "Thumbnails are deleted after 30 days because of the minimum storage duration",
      "Savings as planned, because reads cost the same in every storage class",
      "Retrieval fees per GB outweigh the storage savings, raising the total bill"
    ],
    "answer": 3,
    "explanation": "Infrequent-access tiers charge per GB retrieved, so frequently read data can cost more there than in Standard. Hours-long restores apply to Glacier archive tiers, not Standard-IA. The 30-day minimum means you are billed for at least 30 days, not that objects are deleted.",
    "tags": [
      "cost-aware-architecture",
      "staff",
      "inline"
    ]
  },
  {
    "id": "cost-aware-architecture-n1",
    "topic": "cost-aware-architecture",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: CDN Offload Egress Savings",
    "scenario": "Your origin servers directly serve 500 TB (500,000 GB) per month of static media at a cloud internet egress rate of $0.08/GB. Placing a CDN in front achieves a 90% cache hit ratio; CDN egress costs $0.02/GB and origin-to-CDN cache-fill traffic (the 10% misses) costs $0.02/GB.",
    "prompt": "How many thousands of dollars per month do you save on bandwidth by adding the CDN?",
    "question": "How many thousands of dollars per month do you save on bandwidth by adding the CDN?",
    "unit": "thousand USD/month",
    "answer": 29,
    "tolerance": 0.2,
    "hint": "Without CDN: 500,000 × $0.08 = $40k. With CDN: 500,000 × $0.02 (edge egress) + 50,000 × $0.02 (origin fill) = $11k. Savings = $40k - $11k.",
    "explanation": "Direct origin egress costs 500,000 GB × $0.08 = $40,000/month. With the CDN, edge delivery costs 500,000 GB × $0.02 = $10,000/month, and the 10% origin cache fill (50,000 GB × $0.02) costs $1,000/month ($11,000 total). Monthly savings = $40,000 - $11,000 = $29,000 (29 thousand USD).",
    "tags": [
      "cost-aware-architecture",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "cost-aware-architecture-t1",
    "topic": "cost-aware-architecture",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Baseline Reserved Capacity + Spot Bursting vs Pure On-Demand",
    "scenario": "A media transcoding and API platform has a predictable 24/7 baseline load requiring 100 vCPUs, plus a daily 4-hour evening peak requiring an additional 150 vCPUs of fault-tolerant asynchronous video encoding.",
    "prompt": "Which compute purchasing and scheduling strategy optimizes unit economics without risking API availability, and why?",
    "question": "Which compute purchasing and scheduling strategy optimizes unit economics without risking API availability, and why?",
    "options": [
      "Run all 250 vCPUs on 24/7 On-Demand instances year-round to avoid autoscaling delays",
      "Run the synchronous API on Spot instances and the batch transcoding workers on 3-year Reserved Instances",
      "Cover the 100-vCPU 24/7 synchronous baseline with Reserved/Committed-Use instances and autoscale the checkpointed batch transcoding fleet on preemptible Spot instances with On-Demand fallback"
    ],
    "correctOption": 2,
    "reasons": [
      "Paying On-Demand rates for 150 idle vCPUs 20 hours a day maximizes cloud gross margin",
      "Stateless synchronous APIs never suffer availability drops when an entire Spot pool is reclaimed simultaneously",
      "Matching committed discounts to steady baseline load and cheap preemptible capacity to idempotent, checkpointed batch work cuts compute spend by 50-70% while protecting synchronous SLOs"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Match steady 24/7 load to committed capacity and fault-tolerant spiky batch work to preemptible Spot capacity.",
    "explanation": "Cost-aware architecture aligns workload characteristics with pricing models: steady 24/7 synchronous capacity earns 40–60% discounts via Reserved/Committed plans, while spiky, checkpointed asynchronous workers can safely exploit 60–80% cheaper Spot instances with automated fallback.",
    "tags": [
      "cost-aware-architecture",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["when-not-to-add-infrastructure"] = [
  {
    "id": "when-not-to-add-infrastructure-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "A valid reason for a cache",
    "section": "When not to add infrastructure",
    "prompt": "Which of these is a sound starting point for considering a cache in front of link lookups?",
    "options": [
      "Repeated destination lookups dominate a measured latency problem that query fixes did not solve",
      "The links table is projected to reach several hundred gigabytes within five years",
      "Most well-known URL shorteners run Redis in front of their primary database",
      "A cache would let the team avoid adding and maintaining database indexes"
    ],
    "answer": 0,
    "explanation": "The lesson asks you to name the property the current design is missing, with evidence and a result to compare against afterward. \"The database will get large\" is the tempting reason, but table size alone does not show that a read path misses its target.",
    "tags": [
      "when-not-to-add-infrastructure",
      "recall",
      "inline"
    ]
  },
  {
    "id": "when-not-to-add-infrastructure-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Moving reports off the path",
    "section": "When not to add infrastructure",
    "prompt": "Each redirect's event must survive a crash, and a teammate proposes a streaming platform so report calculation stays out of the redirect path. What should you try first?",
    "options": [
      "Put events on an in-memory queue and return without waiting for the enqueue to finish",
      "Adopt the streaming platform, since only it can make event acceptance durable",
      "Write each event to the existing database and calculate reports later in the background",
      "Drop the event write from redirects and rebuild counts from load balancer logs"
    ],
    "answer": 2,
    "explanation": "The first design can store the event in the existing database and compute reports later; a separate queue becomes worth it only when that path stops meeting the requirement. The in-memory queue is tempting because it is fast, but returning success before the event is durably accepted breaks the crash-survival promise.",
    "tags": [
      "when-not-to-add-infrastructure",
      "apply",
      "inline"
    ]
  },
  {
    "id": "when-not-to-add-infrastructure-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "The cache's new failure paths",
    "section": "When not to add infrastructure",
    "prompt": "You approve a cache for link lookups. Which pair of failure paths does the lesson say you must trace before relying on it?",
    "options": [
      "Whether the cache's eviction policy matches the hot-key distribution and its memory limit",
      "Whether cache nodes can be added without rehashing and whether keys can be compressed",
      "How fast a disabled link stops being served, and whether the database copes when the cache is cold",
      "Whether the cache supports transactions and whether it can persist snapshots to disk"
    ],
    "answer": 2,
    "explanation": "A cache adds a second place that can serve an old answer, which matters when an unsafe link is disabled, and removing it puts full load back on the database. Eviction tuning matters for efficiency, but it is not the new correctness and availability risk the cache introduces.",
    "tags": [
      "when-not-to-add-infrastructure",
      "staff",
      "inline"
    ]
  },
  {
    "id": "when-not-to-add-infrastructure-n1",
    "topic": "when-not-to-add-infrastructure",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Cold-Cache Database Overload Factor",
    "scenario": "Your link service handles 20,000 reads/s by placing a Redis cluster (95% hit rate) in front of a single PostgreSQL database that was downsized so its maximum safe capacity is 2,500 reads/s.",
    "prompt": "If the Redis cluster suffers a full restart or network partition and 100% of the 20,000 reads/s fall back to PostgreSQL, by what multiple (factor) does incoming traffic exceed the database's safe capacity?",
    "question": "If the Redis cluster suffers a full restart or network partition and 100% of the 20,000 reads/s fall back to PostgreSQL, by what multiple (factor) does incoming traffic exceed the database's safe capacity?",
    "unit": "x",
    "answer": 8,
    "tolerance": 0.2,
    "hint": "Divide full fallback load (20,000 reads/s) by the database's maximum safe capacity (2,500 reads/s).",
    "explanation": "During normal operation, the 95% cache hit rate sends only 5% of 20,000 = 1,000 reads/s to PostgreSQL. When the cache goes cold or fails, load jumps to 20,000 reads/s—which is 20,000 / 2,500 = 8x the database's safe capacity, triggering an immediate cascading meltdown unless load shedding or singleflight coalescing is in place.",
    "tags": [
      "when-not-to-add-infrastructure",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "when-not-to-add-infrastructure-t1",
    "topic": "when-not-to-add-infrastructure",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Missing Composite Index vs Introducing a Distributed Cache",
    "scenario": "A dashboard endpoint querying `SELECT * FROM events WHERE org_id = $1 ORDER BY created_at DESC LIMIT 50` takes 450 ms at p95 on a 10M-row PostgreSQL table (currently indexed only on `id`). A teammate proposes deploying a Redis cluster and a Kafka CDC invalidation pipeline to cache the query.",
    "prompt": "Which intervention should you take first, and what is the primary justification?",
    "question": "Which intervention should you take first, and what is the primary justification?",
    "options": [
      "Deploy the Redis cluster and Kafka CDC pipeline immediately so reads bypass PostgreSQL",
      "Add a composite B-tree index on `(org_id, created_at DESC)` concurrently and verify whether the sub-5 ms indexed read already satisfies the SLO",
      "Migrate the events table to a distributed graph database"
    ],
    "correctOption": 1,
    "reasons": [
      "Adding two new distributed systems is simpler than running `CREATE INDEX CONCURRENTLY`",
      "Fixing a sequential scan with the right composite index eliminates the bottleneck in the existing database without introducing cache invalidation bugs, cold-start thundering herds, or new operational failure modes",
      "B-tree indexes cannot accelerate `WHERE` + `ORDER BY ... LIMIT` queries"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Every new piece of infrastructure introduces new failure modes (stale reads, cold-cache stampedes, sync lag). Exhaust local query/index fixes first.",
    "explanation": "A 450 ms query on 10M rows without a matching index is doing a sequential scan + sort. Adding `CREATE INDEX CONCURRENTLY ON events (org_id, created_at DESC)` turns it into a <2 ms index scan with zero new moving parts, whereas adding Redis + Kafka introduces staleness windows, CDC lag, and cold-cache outage risks.",
    "tags": [
      "when-not-to-add-infrastructure",
      "tradeoff",
      "staff"
    ]
  }
];
