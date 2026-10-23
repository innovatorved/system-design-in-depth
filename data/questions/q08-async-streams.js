window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["delegation-and-async-work"] = [
  {
    "id": "delegation-and-async-work-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Cascading thread exhaustion",
    "section": "Under the Hood: The Cost of Synchronous Blocking RPCs",
    "prompt": "A thread-per-request API makes 200 synchronous calls per second to a billing service and has a 200-thread worker pool. Billing latency jumps from 50 ms to 5 s. What happens?",
    "options": [
      "Only billing requests slow down; other endpoints keep their own share of the thread pool",
      "Concurrent billing calls rise from about 10 to about 1,000, exhausting the pool and stalling unrelated endpoints",
      "Concurrent billing calls rise from about 10 to about 20, which the pool absorbs easily",
      "Calls fail fast at the default timeout, so the thread pool never fills up"
    ],
    "answer": 1,
    "explanation": "In-flight calls equal rate times latency: 200 x 0.05 s is 10, but 200 x 5 s is 1,000, far more than 200 threads, so every endpoint sharing the pool stalls. A shared pool has no per-endpoint share, which is exactly how a slow dependency causes a cascading outage.",
    "tags": [
      "delegation-and-async-work",
      "apply",
      "inline"
    ]
  },
  {
    "id": "delegation-and-async-work-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What stays synchronous",
    "section": "Sync or async?",
    "prompt": "In a checkout flow, which of these steps should stay inside the synchronous request rather than being delegated to a background worker?",
    "options": [
      "Sending the order confirmation email",
      "Generating thumbnails for the product review photos",
      "Authorizing the payment before confirming the order to the user",
      "Syncing the new customer record to the CRM"
    ],
    "answer": 2,
    "explanation": "The user needs the payment authorization result to continue, so it stays synchronous. Email, thumbnails and CRM sync are not needed to show the next screen and often depend on slow or flaky third parties, which makes them ideal to delegate.",
    "tags": [
      "delegation-and-async-work",
      "recall",
      "inline"
    ]
  },
  {
    "id": "delegation-and-async-work-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Per-entity ordering",
    "section": "What you take on when you go async",
    "prompt": "A pool of queue workers sometimes processes a user's 'delete account' job before their earlier 'update profile' job, and the update recreates data that should be gone. What is the right fix?",
    "options": [
      "Route jobs by entity key so one consumer handles a given user's jobs in order",
      "Add more workers so each job is picked up sooner and the race window shrinks",
      "Turn on the broker's exactly-once delivery mode for the job queue",
      "Retry failed jobs with exponential backoff so the delete runs last"
    ],
    "answer": 0,
    "explanation": "Ordering is not guaranteed across workers, so jobs that must stay ordered for one entity should be partitioned by that entity's key. More workers makes reordering more likely, and exactly-once delivery addresses duplicates, not order.",
    "tags": [
      "delegation-and-async-work",
      "staff",
      "inline"
    ]
  },
  {
    "id": "delegation-and-async-work-n1",
    "topic": "delegation-and-async-work",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Synchronous vs Asynchronous Queue Latency & Worker Sizing",
    "scenario": "An HTTP checkout endpoint previously generated a PDF invoice and sent an email synchronously (taking 450 ms out of a 500 ms total response time). Moving PDF + email generation to an async queue leaves only 50 ms of synchronous DB + enqueue work. If PDF/email generation takes 0.4 CPU-seconds per order and orders arrive at 100 orders/sec, you size the async worker pool.",
    "prompt": "What is the minimum number of worker CPU cores (`100 orders/s × 0.4 s`) required to keep up with the async queue at 100% utilization?",
    "question": "What is the minimum number of worker CPU cores (`100 orders/s × 0.4 s`) required to keep up with the async queue at 100% utilization?",
    "unit": "cores",
    "answer": 40,
    "tolerance": 0.2,
    "hint": "By Little's Law, `L = λ × W = 100 req/s × 0.4 s`.",
    "explanation": "100 orders/sec × 0.4 CPU-seconds/order = 40 concurrent CPU cores minimum (typically provisioned at ~60 cores for 65% target utilization and burst headroom).",
    "tags": [
      "delegation-and-async-work",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "delegation-and-async-work-t1",
    "topic": "delegation-and-async-work",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: What Belongs on the Synchronous Request Path vs Async Queue",
    "scenario": "During user signup (`POST /signup`), the backend validates email uniqueness, hashes the password, inserts the user row, sends a welcome email, syncs the lead to Salesforce CRM, and computes ML onboarding recommendations.",
    "prompt": "Which operations must remain synchronous before returning `201 Created`, and which should be delegated asynchronously?",
    "question": "Which operations must remain synchronous before returning `201 Created`, and which should be delegated asynchronously?",
    "options": [
      "Make everything asynchronous so `POST /signup` returns `201 Created` before checking if the email is already taken",
      "Keep Salesforce CRM and SMTP email delivery synchronous on the HTTP request thread",
      "Keep invariant validation and durable user-row creation (plus transactional outbox enqueue) synchronous, and delegate welcome email, CRM sync, and ML recommendations to asynchronous consumers"
    ],
    "correctOption": 2,
    "reasons": [
      "Returning `201 Created` for duplicate emails simplifies client error handling",
      "External third-party SMTP and CRM outages should block user signups",
      "Any precondition that determines whether the request succeeded (uniqueness + durable user record) must be synchronous, while side effects with independent failure/retry domains belong on an async queue"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Ask: \"If this step fails, should the user's signup fail?\"",
    "explanation": "Preconditions and authoritative state mutations must complete before returning HTTP 2xx, whereas slow external side effects (SMTP, webhooks, CRM, analytics) belong in asynchronous background workers triggered via an outbox.",
    "tags": [
      "delegation-and-async-work",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["task-queue-vs-event-stream"] = [
  {
    "id": "task-queue-vs-event-stream-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Skewed job workload",
    "section": "Worked example: the same workload on each",
    "prompt": "You need to run 2,000 image-processing jobs per second, each taking between 50 ms and 30 s, consumed by a single service, with no need to replay history. Which design fits best?",
    "options": [
      "A task queue such as SQS or RabbitMQ with many workers each pulling the next job",
      "A Kafka topic whose partition count equals the number of worker processes",
      "A single-partition Kafka topic so every job is processed in strict order",
      "An SNS-style fan-out that delivers every job to every worker"
    ],
    "answer": 0,
    "explanation": "Jobs are independent and uneven, so a queue lets any free worker take the next one, and a 30-second job only occupies one worker. On Kafka a slow record blocks everything behind it in its partition, and parallelism is capped at the partition count.",
    "tags": [
      "task-queue-vs-event-stream",
      "apply",
      "inline"
    ]
  },
  {
    "id": "task-queue-vs-event-stream-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Thread pools and offsets",
    "section": "Worked example: the same workload on each",
    "prompt": "To avoid head-of-line blocking, a Kafka consumer hands each record to an internal thread pool and moves on. What new problem must it now solve?",
    "options": [
      "Kafka rejects consumers that process records on more than one thread",
      "The partition count must be doubled to make room for the thread pool",
      "Committing an offset marks all earlier records done, so it must wait for the slowest in-flight record or risk skipping it after a crash",
      "Records are redelivered to other consumer groups while the pool is busy"
    ],
    "answer": 2,
    "explanation": "An offset commit is a single position per partition, so committing past an unfinished record means a crash loses it, while not committing means reprocessing on restart. Kafka does allow multi-threaded processing; the difficulty is purely in offset bookkeeping.",
    "tags": [
      "task-queue-vs-event-stream",
      "staff",
      "inline"
    ]
  },
  {
    "id": "task-queue-vs-event-stream-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Consumers per partition",
    "section": "Semantics side by side",
    "prompt": "A Kafka topic has 24 partitions. You start 40 consumers in one consumer group. How many of them actively consume?",
    "options": [
      "All 40, each taking a share of every partition",
      "12, because each partition needs a leader and a follower consumer",
      "1, the group leader, which then dispatches to the others",
      "24, one per partition, with 16 left idle"
    ],
    "answer": 3,
    "explanation": "Within a group each partition is assigned to one consumer, so parallelism is capped at the partition count and the extra 16 sit idle. Consumers do not share a partition within a group, which is the key difference from a task queue where any number of workers can pull.",
    "tags": [
      "task-queue-vs-event-stream",
      "recall",
      "inline"
    ]
  },
  {
    "id": "task-queue-vs-event-stream-n1",
    "topic": "task-queue-vs-event-stream",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Multi-Consumer Event Stream vs Point-to-Point Queue Storage",
    "scenario": "An `OrderPlaced` stream produces 10,000 events/sec averaging 1 KB each (`10 MB/s`) and is consumed by 6 independent downstream services. In a traditional point-to-point task broker (RabbitMQ/SQS fanout), the message is duplicated into 6 separate queues (`60 MB/s` total write); in an append-only log stream (Kafka), the partition log is written once (`10 MB/s` before replication) and read by 6 consumer groups.",
    "prompt": "How many megabytes per second (MB/s) of logical broker write throughput are saved by writing to 1 shared append-only log instead of duplicating into 6 separate queues?",
    "question": "How many megabytes per second (MB/s) of logical broker write throughput are saved by writing to 1 shared append-only log instead of duplicating into 6 separate queues?",
    "unit": "MB/s",
    "answer": 50,
    "tolerance": 0.2,
    "hint": "Subtract 10 MB/s (1 shared log) from 60 MB/s (6 duplicated queues).",
    "explanation": "6 queues × 10 MB/s = 60 MB/s vs 1 shared log × 10 MB/s = 50 MB/s saved (83% reduction in logical broker write volume, plus new consumers can replay historical events from offset 0).",
    "tags": [
      "task-queue-vs-event-stream",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "task-queue-vs-event-stream-t1",
    "topic": "task-queue-vs-event-stream",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Per-Message Ack Task Queue (SQS/RabbitMQ) vs Partitioned Offset Log (Kafka)",
    "scenario": "You have a video transcoding workload where 95% of jobs finish in 2 seconds, 5% of 4K videos take 25 minutes, and you have 200 worker pods that need fine-grained per-job completion acknowledgment and individual job retries.",
    "prompt": "Should you use a Partitioned Offset Log (Kafka) or a Per-Message Visibility-Timeout Task Queue (SQS/RabbitMQ) to dispatch the transcoding jobs, and why?",
    "question": "Should you use a Partitioned Offset Log (Kafka) or a Per-Message Visibility-Timeout Task Queue (SQS/RabbitMQ) to dispatch the transcoding jobs, and why?",
    "options": [
      "Use Kafka with 4 partitions so 196 of your 200 worker pods sit completely idle and 1 slow 25-minute video blocks its partition offset",
      "Use Kafka and commit the partition offset before transcoding starts",
      "Use a work queue with per-message visibility timeouts and individual ACKs (e.g., SQS / RabbitMQ) so any free worker can pull the next job without head-of-line partition blocking"
    ],
    "correctOption": 2,
    "reasons": [
      "Kafka allows more active consumers in a group than partitions in the topic",
      "Committing offsets before work finishes guarantees at-least-once processing on worker crash",
      "Log streams tie parallelism to partition count and track a single contiguous offset watermark per partition, whereas work queues support arbitrary worker concurrency and independent per-message ACKs/retries for variable-duration tasks"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens in Kafka when message #100 takes 25 minutes and messages #101..#500 finish in 2 seconds?",
    "explanation": "Kafka excels at high-throughput ordered event streaming and multi-consumer replay, but variable-duration heavy background jobs need per-message ACK/visibility-timeout task queues to avoid head-of-line offset blocking and partition-count concurrency limits.",
    "tags": [
      "task-queue-vs-event-stream",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["event-bus-for-product-events"] = [
  {
    "id": "event-bus-for-product-events-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Dual-write crash",
    "section": "Under the Hood: Solving the Dual-Write Disaster",
    "prompt": "An order service commits the order row and then publishes OrderPlaced to Kafka in application code. The process crashes between the two steps. What is the outcome, and what is the fix?",
    "options": [
      "The event is published twice; make consumers idempotent so duplicates are harmless",
      "The order exists but the event is never sent; write an outbox row in the same transaction and relay it via CDC",
      "Kafka's transaction rolls back the database commit, so nothing is lost or duplicated",
      "Nothing is lost, because the Kafka producer retries unsent events after the process restarts"
    ],
    "answer": 1,
    "explanation": "The database has the order but downstream services never hear about it; the outbox puts the state change and the publish obligation in one local transaction. A producer's in-memory retries die with the process, so waiting for a retry after restart does not help.",
    "tags": [
      "event-bus-for-product-events",
      "recall",
      "inline"
    ]
  },
  {
    "id": "event-bus-for-product-events-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Backward-compatible change",
    "section": "Schema evolution rules (Avro or Protobuf with a registry)",
    "prompt": "An Avro subject in the schema registry is set to backward compatibility, so new consumers must be able to read old events. Which change to OrderPlaced is allowed?",
    "options": [
      "Rename customer_id to buyer_id",
      "Change amount from an integer to a string",
      "Add a currency field with a default of USD",
      "Add a required currency field with no default"
    ],
    "answer": 2,
    "explanation": "Under backward compatibility a new reader must fill in fields that old events lack, so an added field needs a default. A required field with no default leaves new readers nothing to use for old events, and renames and type changes break existing data.",
    "tags": [
      "event-bus-for-product-events",
      "apply",
      "inline"
    ]
  },
  {
    "id": "event-bus-for-product-events-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Stalled CDC connector",
    "section": "Failure modes",
    "prompt": "The Debezium connector that relays the outbox table stops over a weekend and nobody notices. What is the most serious thing that breaks first?",
    "options": [
      "Postgres keeps WAL for the stalled replication slot, which can fill the primary's disk",
      "Outbox rows written during the outage are lost once the connector restarts",
      "Consumers receive the backlog out of order when the connector catches up",
      "Kafka deletes the topic after its retention period passes with no new writes"
    ],
    "answer": 0,
    "explanation": "A replication slot makes Postgres retain WAL until the slot's consumer confirms it, so an idle slot grows WAL without bound and can take down the primary. The outbox rows themselves are safe in the table, which is why the lesson says to alert on slot lag.",
    "tags": [
      "event-bus-for-product-events",
      "staff",
      "inline"
    ]
  },
  {
    "id": "event-bus-for-product-events-n1",
    "topic": "event-bus-for-product-events",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Schema Registry Wire Payload Savings (Avro/Protobuf vs JSON)",
    "scenario": "A product event bus ingests 200,000 events/sec. Switching from verbose JSON (averaging 650 bytes/event) to Protobuf/Avro with a 5-byte Schema Registry ID header (averaging 150 bytes/event) saves 500 bytes per event.",
    "prompt": "How many megabytes per second (MB/s, where 1 MB = 10^6 bytes) of network ingress bandwidth are saved across 200,000 events/sec?",
    "question": "How many megabytes per second (MB/s, where 1 MB = 10^6 bytes) of network ingress bandwidth are saved across 200,000 events/sec?",
    "unit": "MB/s",
    "answer": 100,
    "tolerance": 0.2,
    "hint": "Multiply 200,000 events/sec by 500 bytes saved per event and divide by 10^6.",
    "explanation": "200,000 × 500 bytes = 100,000,000 bytes/sec = 100 MB/s saved on producer ingress (and 300 MB/s saved across 3× broker replication + multiple consumer groups).",
    "tags": [
      "event-bus-for-product-events",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "event-bus-for-product-events-t1",
    "topic": "event-bus-for-product-events",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Producer-Side Schema Evolution & Dead-Letter Routing",
    "scenario": "A mobile team deploys a producer update that changes the `price` field in the `ItemPurchased` event from `int64` cents to a nested object `{\"amount\": \"19.99\", \"currency\": \"USD\"}`, crashing 12 downstream analytics and billing consumers.",
    "prompt": "Which governance mechanism prevents breaking changes from ever entering the production event bus?",
    "question": "Which governance mechanism prevents breaking changes from ever entering the production event bus?",
    "options": [
      "Have every downstream consumer wrap `JSON.parse` in an empty `catch {}` block and silently drop unparseable billing events",
      "Give all 12 consumer teams SSH access to redeploy the mobile app",
      "Enforce a central Schema Registry with `BACKWARD` / `FULL` compatibility checks in CI and producer serializers (requiring additive optional fields or a new versioned topic) plus a Dead-Letter Queue (DLQ) for unexpected poison messages"
    ],
    "correctOption": 2,
    "reasons": [
      "Silently dropping billing events ensures accurate financial reporting",
      "Ad-hoc unvalidated JSON strings prevent breaking schema mutations",
      "Pre-commit and serializer-level Schema Registry validation blocks incompatible field-type mutations before they reach the broker, while DLQs isolate poison pills without halting partition consumption"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Where is the cheapest and safest place to catch an incompatible event schema change?",
    "explanation": "A Schema Registry enforces backward/forward evolution rules (e.g., never changing a field's type or reusing a Protobuf tag number) at CI and publish time, preventing a single producer deploy from breaking dozens of downstream consumers.",
    "tags": [
      "event-bus-for-product-events",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["queue-lag"] = [
  {
    "id": "queue-lag-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Time to drain",
    "section": "Worked example: how long until we catch up?",
    "prompt": "A topic receives 30,000 messages per second. Eight consumers each handle 5,000 per second. A deploy pauses consumption for 10 minutes. How long does the backlog take to drain once consumers resume?",
    "options": [
      "About 7.5 minutes",
      "About 30 minutes",
      "About 10 minutes",
      "About 45 minutes"
    ],
    "answer": 1,
    "explanation": "The backlog is 30,000 x 600 s = 18 million, and the net drain rate is 40,000 - 30,000 = 10,000 per second, so 1,800 s, or 30 minutes. 7.5 minutes divides by total capacity and forgets that new messages keep arriving.",
    "tags": [
      "queue-lag",
      "apply",
      "inline"
    ]
  },
  {
    "id": "queue-lag-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Alerting on user delay",
    "section": "Metrics that matter",
    "prompt": "Which metric best tells you how delayed users are by a backed-up consumer, across topics with very different per-message costs?",
    "options": [
      "Total offset lag summed across all partitions",
      "Consumer rebalance count per hour",
      "Consume rate divided by produce rate",
      "Age of the oldest unconsumed message"
    ],
    "answer": 3,
    "explanation": "Time lag, the age of the oldest unconsumed message, is what users feel, and it is comparable across topics. Offset lag counts messages, and 100,000 messages can mean seconds for a fast consumer or hours for a slow one.",
    "tags": [
      "queue-lag",
      "recall",
      "inline"
    ]
  },
  {
    "id": "queue-lag-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Scaling past partitions",
    "section": "Levers when lag grows",
    "prompt": "A lag-based autoscaler scales a consumer group to 30 pods on a topic with 12 partitions. What is the effect?",
    "options": [
      "18 pods sit idle, throughput caps at 12 consumers, and adding partitions now would remap keys",
      "Throughput rises about 2.5 times, since Kafka balances records across all pods",
      "Kafka automatically splits the 12 partitions so all 30 pods receive work",
      "The pods share partitions round-robin, which raises throughput but loses ordering"
    ],
    "answer": 0,
    "explanation": "Each partition goes to one consumer in a group, so pods beyond 12 do nothing; the lesson says to cap replicas at the partition count. Adding partitions later changes key-to-partition mapping, which is why partition count should be planned for peak up front.",
    "tags": [
      "queue-lag",
      "staff",
      "inline"
    ]
  },
  {
    "id": "queue-lag-n1",
    "topic": "queue-lag",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Queue Backlog Drain Time After a Traffic Spike",
    "scenario": "A Kafka topic normally receives 5,000 msg/s. During a 10-minute (600-second) flash event, producer traffic spikes to 15,000 msg/s while your consumer fleet processes at its fixed maximum capacity of 10,000 msg/s. After the 10-minute spike ends, producer traffic drops back to 5,000 msg/s.",
    "prompt": "How many minutes does it take for the consumer fleet (processing 10,000 msg/s against 5,000 msg/s new arrivals) to completely drain the accumulated backlog?",
    "question": "How many minutes does it take for the consumer fleet (processing 10,000 msg/s against 5,000 msg/s new arrivals) to completely drain the accumulated backlog?",
    "unit": "minutes",
    "answer": 10,
    "tolerance": 0.25,
    "hint": "Backlog accumulated = (15,000 - 10,000) × 10 min. Net drain rate after spike = (10,000 - 5,000) msg/s.",
    "explanation": "During the 10-minute spike, the queue accumulates `(15,000 - 10,000) = 5,000 msg/s` of lag, totaling `5,000 × 600 s = 3,000,000` messages. Once arrivals return to 5,000 msg/s, the consumer fleet has `10,000 - 5,000 = 5,000 msg/s` of net catch-up capacity, taking `3,000,000 / 5,000 = 600 seconds = 10 minutes` to drain.",
    "tags": [
      "queue-lag",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "queue-lag-t1",
    "topic": "queue-lag",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Scaling Kafka Consumers Past Partition Count",
    "scenario": "A single Kafka topic has 12 partitions and is experiencing growing consumer lag because each message invokes a slow external webhook (50 ms RTT). An engineer scales the consumer group deployment from 12 pods to 48 pods, but throughput does not change.",
    "prompt": "Why did scaling to 48 pods fail, and what architectural change fixes consumer throughput safely?",
    "question": "Why did scaling to 48 pods fail, and what architectural change fixes consumer throughput safely?",
    "options": [
      "Kafka only allows 1 consumer group per cluster; you must deploy 48 separate Kafka clusters",
      "In a Kafka consumer group, each partition is assigned to at most one consumer instance (leaving 36 pods idle); either increase partitions (mindful of key ordering) or decouple polling from bounded async worker pools per partition with ordered offset commits",
      "Have all 48 pods read Partition 0 simultaneously without consumer group coordination"
    ],
    "correctOption": 1,
    "reasons": [
      "Kafka brokers crash when more than 12 pods join a consumer group",
      "Kafka's partition-to-consumer assignment rule caps active consumers in a group at the partition count; bounded per-partition async worker pools (or repartitioning) hide webhook I/O latency without losing offset safety",
      "Reading the same partition from 48 uncoordinated pods prevents duplicate webhook calls"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "How many consumers in a single consumer group can actively read from a 12-partition topic?",
    "explanation": "Because a Kafka partition is assigned to at most one consumer within a consumer group, 36 of the 48 pods sit completely idle. Increasing partition count or using bounded non-blocking I/O worker pools per partition (committing contiguous high-water offsets) unlocks concurrency.",
    "tags": [
      "queue-lag",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["distributed-task-scheduler"] = [
  {
    "id": "distributed-task-scheduler-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Lease, do not delete",
    "section": "Under the Hood: The Atomic Lua Script Pattern",
    "prompt": "Why does the claim script move due job IDs from the scheduled set into a leased set, instead of removing them with ZREM and then publishing?",
    "options": [
      "ZREM is not atomic in Redis, so two schedulers could remove the same job",
      "The leased set gives exactly-once execution without any need for idempotent workers",
      "A crash between removal and publish would lose the job, while an expired lease can be returned by a reaper",
      "Keeping jobs in a second set reduces Redis memory use during peak hours"
    ],
    "answer": 2,
    "explanation": "Removing the only durable record before the broker confirms the handoff opens a lost-job window; a lease keeps the obligation and a reaper recovers it. It is still at-least-once, because a lost broker acknowledgement can cause a duplicate publish.",
    "tags": [
      "distributed-task-scheduler",
      "recall",
      "inline"
    ]
  },
  {
    "id": "distributed-task-scheduler-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Pending job store size",
    "section": "Worked example: sizing a delayed-job store",
    "prompt": "A product schedules 20 million jobs per day, each up to 14 days ahead. At about 100 bytes per sorted-set entry, roughly how much memory does the pending set need at its peak?",
    "options": [
      "About 28 GB",
      "About 2.8 GB",
      "About 14 GB",
      "About 280 GB"
    ],
    "answer": 0,
    "explanation": "Up to 20 million x 14 = 280 million pending entries, times 100 bytes, is about 28 GB, which is why the lesson shards the set. 2.8 GB counts only about 2 days of jobs.",
    "tags": [
      "distributed-task-scheduler",
      "apply",
      "inline"
    ]
  },
  {
    "id": "distributed-task-scheduler-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Fencing a paused owner",
    "section": "Correctness checklist",
    "prompt": "A scheduler shard owner pauses for 30 seconds in garbage collection, a new owner takes over the shard, and then the old owner wakes up and keeps running its claim loop. What prevents double ownership?",
    "options": [
      "Redis single-threading, since each Lua claim script runs atomically",
      "A lease epoch stored with each claim, so claims from a stale owner are rejected",
      "Each owner comparing its local clock with the job's scheduled time",
      "Adding random jitter to each owner's polling interval"
    ],
    "answer": 1,
    "explanation": "Atomic scripts stop two claims from interleaving, but they do not stop a stale owner from running valid scripts; fencing with a stored epoch does. Local clocks make things worse, which is why the checklist says to take now() from the store.",
    "tags": [
      "distributed-task-scheduler",
      "staff",
      "inline"
    ]
  },
  {
    "id": "distributed-task-scheduler-n1",
    "topic": "distributed-task-scheduler",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Hashed Timing Wheel Bucket Resolution",
    "scenario": "A distributed task scheduler uses an in-memory Hierarchical Timing Wheel with `512` slots and a tick resolution of `100 ms` per slot for the inner wheel.",
    "prompt": "What is the total time span (in seconds) covered by one full revolution of the 512-slot inner wheel?",
    "question": "What is the total time span (in seconds) covered by one full revolution of the 512-slot inner wheel?",
    "unit": "seconds",
    "answer": 51.2,
    "tolerance": 0.2,
    "hint": "Multiply 512 slots by 0.1 seconds (100 ms) per slot.",
    "explanation": "512 slots × 100 ms = 51,200 ms = 51.2 seconds per revolution, with `O(1)` insertion and `O(1)` tick advancement (compared to `O(log N)` heap contention).",
    "tags": [
      "distributed-task-scheduler",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "distributed-task-scheduler-t1",
    "topic": "distributed-task-scheduler",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Polling `WHERE run_at <= NOW()` on a Single Table vs Partitioned Timing Wheel + Lease Claim",
    "scenario": "A delayed job scheduler stores 50,000,000 scheduled tasks in a database and has 64 scheduler workers polling `SELECT * FROM jobs WHERE status = 'PENDING' AND run_at <= NOW() ORDER BY run_at LIMIT 100` every 50 ms.",
    "prompt": "Why does naive multi-worker polling collapse at scale, and what architecture scales delayed scheduling cleanly?",
    "question": "Why does naive multi-worker polling collapse at scale, and what architecture scales delayed scheduling cleanly?",
    "options": [
      "All 64 workers read and contend on the exact same top 100 due rows at the B-Tree head; fix it by removing the index on `run_at`",
      "Hold all 50,000,000 tasks in a single unpersisted Node.js `setTimeout` call",
      "Shard schedules across partitions by `(time_bucket, shard_id)` (or use `FOR UPDATE SKIP LOCKED` per shard), pre-fetch upcoming 1-minute windows into an in-memory Timing Wheel, and push due tasks into a ready execution queue with idempotency tokens"
    ],
    "correctOption": 2,
    "reasons": [
      "Removing the index makes 64 concurrent full-table scans faster",
      "In-memory `setTimeout` survives process crashes and deployments",
      "Partitioning by time bucket + shard eliminates thundering-herd lock contention on the earliest `run_at` index edge, and pushing fired tasks to a ready queue decouples timer firing from task execution"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens when 64 workers run the exact same `ORDER BY run_at LIMIT 100` query at the exact same millisecond?",
    "explanation": "Without shard partitioning or `SKIP LOCKED`, all workers collide on the same top 100 rows at the head of the `run_at` index. Partitioned time-bucket leasing + in-memory timing wheels feed a ready queue cleanly.",
    "tags": [
      "distributed-task-scheduler",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["postgres-skip-locked-work-queue"] = [
  {
    "id": "postgres-skip-locked-work-queue-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Naive FOR UPDATE",
    "section": "Why Naive SQL Work Queues Collapse",
    "prompt": "Twenty workers each run SELECT * FROM jobs WHERE status = 'pending' LIMIT 1 FOR UPDATE at the same time. What happens?",
    "options": [
      "Each worker locks a different pending row, because Postgres spreads locks across rows",
      "All twenty read the same row without locking and process it twenty times",
      "Postgres raises a serialization error for all but one worker immediately",
      "All target the same first row, so nineteen block on its lock and the workers run one at a time"
    ],
    "answer": 3,
    "explanation": "Plain FOR UPDATE waits for the locked row, so every worker queues behind the first one and parallelism collapses. Spreading workers across rows is exactly what SKIP LOCKED adds; without it, Postgres waits rather than skipping.",
    "tags": [
      "postgres-skip-locked-work-queue",
      "recall",
      "inline"
    ]
  },
  {
    "id": "postgres-skip-locked-work-queue-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Dead tuple volume",
    "section": "Worked example: throughput budget",
    "prompt": "A Postgres queue processes 1,200 jobs per second, and each processed job leaves at least one dead tuple. Roughly how many dead tuples must autovacuum clean per day?",
    "options": [
      "About 10 million",
      "About 104 million",
      "About 1 billion",
      "About 1.2 million"
    ],
    "answer": 1,
    "explanation": "1,200 x 86,400 seconds is about 104 million dead tuples per day, a steady load for autovacuum. 10 million is off by an order of magnitude, which is how queue tables end up under-vacuumed.",
    "tags": [
      "postgres-skip-locked-work-queue",
      "apply",
      "inline"
    ]
  },
  {
    "id": "postgres-skip-locked-work-queue-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Idle transaction bloat",
    "section": "Failure modes",
    "prompt": "An analyst leaves a session idle in transaction for six hours on the primary that also hosts a SKIP LOCKED job queue. What degrades?",
    "options": [
      "SKIP LOCKED starts blocking, because it must wait for the analyst's snapshot to finish",
      "Jobs start being processed twice, because the old snapshot hides their running status",
      "Vacuum cannot remove dead job tuples newer than the old transaction, so the queue table bloats and claims slow down",
      "LISTEN/NOTIFY stops delivering wake-ups until the idle transaction ends"
    ],
    "answer": 2,
    "explanation": "Vacuum cannot remove tuples that an open transaction might still see, so dead job rows pile up and every claim scans more of them. SKIP LOCKED is still non-blocking; the damage is bloat, which is why the lesson recommends idle_in_transaction_session_timeout.",
    "tags": [
      "postgres-skip-locked-work-queue",
      "staff",
      "inline"
    ]
  },
  {
    "id": "postgres-skip-locked-work-queue-n1",
    "topic": "postgres-skip-locked-work-queue",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Batch Claim Round-Trip Reduction with `FOR UPDATE SKIP LOCKED`",
    "scenario": "A pool of worker threads processes 10,000 background jobs/sec from a PostgreSQL queue table. Claiming 1 job per `SELECT ... FOR UPDATE SKIP LOCKED` query requires 10,000 queries/sec; claiming a batch of `LIMIT 50` jobs per transaction amortizes the claim.",
    "prompt": "How many `SELECT ... FOR UPDATE SKIP LOCKED` claim queries per second are needed when each worker claims a batch of 50 jobs?",
    "question": "How many `SELECT ... FOR UPDATE SKIP LOCKED` claim queries per second are needed when each worker claims a batch of 50 jobs?",
    "unit": "queries/s",
    "answer": 200,
    "tolerance": 0.2,
    "hint": "Divide 10,000 jobs/sec by 50 jobs per batch claim.",
    "explanation": "Batching `LIMIT 50` jobs into a single `UPDATE ... WHERE id IN (SELECT id ... FOR UPDATE SKIP LOCKED LIMIT 50) RETURNING *` drops database claim queries from 10,000 QPS to 200 QPS.",
    "tags": [
      "postgres-skip-locked-work-queue",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "postgres-skip-locked-work-queue-t1",
    "topic": "postgres-skip-locked-work-queue",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Holding the `SKIP LOCKED` Transaction Open During Job Execution vs Lease State Transition",
    "scenario": "A developer writes a PostgreSQL `SKIP LOCKED` worker that opens `BEGIN`, runs `SELECT ... FOR UPDATE SKIP LOCKED`, calls an external LLM API that takes 45 seconds inside the open transaction, and then runs `DELETE` + `COMMIT`.",
    "prompt": "Why is holding the `SKIP LOCKED` transaction open during external I/O dangerous, and what is the production pattern?",
    "question": "Why is holding the `SKIP LOCKED` transaction open during external I/O dangerous, and what is the production pattern?",
    "options": [
      "Long-running open transactions in PostgreSQL help `autovacuum` reclaim dead tuples faster",
      "PostgreSQL allows unlimited concurrent open transactions with zero connection or `xmin` overhead",
      "Long open transactions pin the Postgres `xmin` horizon (blocking `VACUUM` across the entire database and causing severe table bloat) and exhaust connection pools; instead, atomically `UPDATE status = 'LEASED', leased_until = NOW() + '2 min'` and `COMMIT` immediately before executing the job"
    ],
    "correctOption": 2,
    "reasons": [
      "Pinning `xmin` for minutes prevents MVCC dead-tuple bloat",
      "Holding a DB connection per slow HTTP call scales to 50,000 concurrent jobs",
      "Committing a short lease transition immediately releases the row lock, connection, and MVCC `xmin` horizon in <2 ms, while `leased_until` recovers crashed workers"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens to PostgreSQL `VACUUM` when a transaction remains open for minutes while a high-churn queue table is being updated thousands of times per second?",
    "explanation": "In PostgreSQL, any open transaction with an active snapshot pins `xmin` and prevents `VACUUM` from cleaning dead tuples. A queue worker must atomically claim rows by updating `status = 'PROCESSING', visible_at = NOW() + timeout` and committing immediately.",
    "tags": [
      "postgres-skip-locked-work-queue",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["dag-workflow-orchestration"] = [
  {
    "id": "dag-workflow-orchestration-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "No clock in workflows",
    "section": "Under the Hood: Deterministic Workflow Replay",
    "prompt": "Why must Temporal workflow code not call the system clock directly, for example to decide whether a deadline has passed?",
    "options": [
      "On replay the clock returns a different value, so the code can take a different branch than the recorded history",
      "Workflow workers run in a sandbox with no access to the system clock",
      "Reading the clock is slow and would add latency to every workflow task",
      "Temporal servers in different regions have skewed clocks, so the value is unreliable"
    ],
    "answer": 0,
    "explanation": "Recovery replays the workflow code against the recorded history, so every decision must come out the same on replay; a fresh clock read can differ. The fix is the SDK's deterministic helpers, such as workflow.Now, which return recorded values.",
    "tags": [
      "dag-workflow-orchestration",
      "recall",
      "inline"
    ]
  },
  {
    "id": "dag-workflow-orchestration-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Crash after a charge",
    "section": "Worked example: an order saga with compensation",
    "prompt": "The order workflow's worker crashes right after ChargeCard completed and was recorded with txn t_55. A new worker picks up the workflow. What happens?",
    "options": [
      "ChargeCard runs again, and the payment provider's idempotency key prevents a double charge",
      "The workflow restarts from the beginning and runs compensations for completed steps",
      "The workflow pauses until an operator confirms whether the card was charged",
      "Replay returns t_55 from history without charging again, and execution continues at ReserveInventory"
    ],
    "answer": 3,
    "explanation": "During replay completed activities are not re-executed; their recorded results come back from the history. Idempotency keys are still good practice for activities retried after timeouts, but replay itself does not re-run ChargeCard.",
    "tags": [
      "dag-workflow-orchestration",
      "apply",
      "inline"
    ]
  },
  {
    "id": "dag-workflow-orchestration-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Changing live workflows",
    "section": "Operational concerns",
    "prompt": "You deploy new workflow code that inserts a fraud-check activity before ReserveInventory while 10,000 order workflows are in flight. What happens without extra care?",
    "options": [
      "The new code automatically applies only to workflows started after the deploy",
      "In-flight workflows replay against the new code, no longer match their history, and fail with nondeterminism errors",
      "In-flight workflows restart from the beginning using the new step order",
      "Temporal holds the deploy until all in-flight workflows finish on the old code"
    ],
    "answer": 1,
    "explanation": "Replay expects the same sequence of commands the history recorded, so an inserted step makes old executions diverge. Temporal does not version code for you; you guard changes with its patching or versioning APIs or run old and new workers side by side.",
    "tags": [
      "dag-workflow-orchestration",
      "staff",
      "inline"
    ]
  },
  {
    "id": "dag-workflow-orchestration-n1",
    "topic": "dag-workflow-orchestration",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Event-History State Growth in Durable Execution (Temporal / Airflow)",
    "scenario": "A workflow orchestrator executes 500,000 workflows per day. Each workflow has 20 DAG steps, and each step records 4 state-transition events (Scheduled, Started, Completed, ActivityOutput) averaging 1 KB per event.",
    "prompt": "How many gigabytes per day (GB/day, where 1 GB = 10^9 bytes) of workflow execution history are generated across the 500,000 workflows?",
    "question": "How many gigabytes per day (GB/day, where 1 GB = 10^9 bytes) of workflow execution history are generated across the 500,000 workflows?",
    "unit": "GB/day",
    "answer": 40,
    "tolerance": 0.2,
    "hint": "Each workflow writes `20 steps × 4 events × 1 KB = 80 KB`. Multiply by 500,000 workflows/day.",
    "explanation": "20 × 4 × 1,000 bytes = 80,000 bytes per workflow. Across 500,000 workflows/day, 500,000 × 80,000 = 40 × 10^9 bytes = 40 GB/day (which is why large intermediate datasets must be passed by S3 URI reference, not inline in workflow state).",
    "tags": [
      "dag-workflow-orchestration",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "dag-workflow-orchestration-t1",
    "topic": "dag-workflow-orchestration",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Passing Payloads Inline in DAG State vs Claim-Check Pattern (URI References)",
    "scenario": "A data pipeline DAG in Airflow/Temporal extracts a 250 MB CSV in Step A and passes the raw 250 MB payload as the return value into Step B and Step C via the orchestrator's metadata database.",
    "prompt": "What happens to the workflow orchestrator DB when steps pass 250 MB payloads inline, and what pattern should be used instead?",
    "question": "What happens to the workflow orchestrator DB when steps pass 250 MB payloads inline, and what pattern should be used instead?",
    "options": [
      "Workflow metadata databases (PostgreSQL/Cassandra) are optimized for 250 MB row values in event history",
      "Pass the 250 MB payload as command-line arguments to the worker container",
      "Use the Claim-Check pattern: Step A writes the 250 MB dataset to immutable object storage (`s3://bucket/run_id/step_a.parquet` + checksum) and passes only the lightweight URI metadata (~200 bytes) through the DAG state machine"
    ],
    "correctOption": 2,
    "reasons": [
      "Storing 250 MB blobs in Temporal/Airflow XCom tables keeps orchestration latency under 5 ms",
      "Linux `execve` command lines support gigabyte arguments",
      "Orchestrators persist and replay state history on every step transition; the Claim-Check pattern keeps control-plane state tiny while offloading bulk data transfer directly to object storage"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Separate the workflow control plane (state transitions) from the data plane (multi-megabyte artifacts).",
    "explanation": "Workflow orchestrators serialize and replay history events on every task transition. Passing a lightweight S3 URI (Claim-Check pattern) keeps the orchestrator DB fast and prevents OOM crashes.",
    "tags": [
      "dag-workflow-orchestration",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["rule-engine-trigger-framework"] = [
  {
    "id": "rule-engine-trigger-framework-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Beta memories",
    "section": "Under the Hood: The Rete Algorithm & JIT Compilation",
    "prompt": "In the Rete algorithm, what do beta memories contribute?",
    "options": [
      "They compile each rule into bytecode so evaluation runs at native speed",
      "They sandbox rule code so it cannot loop forever or call the network",
      "They keep partial matches, so a changed fact re-evaluates only the affected parts of the network",
      "They record which rule version judged each event for later audit"
    ],
    "answer": 2,
    "explanation": "Beta nodes join facts, and their memories cache partial joins so a new or changed fact only updates what it touches (incremental matching). Bytecode compilation is a separate optimisation some engines use, not what Rete's memories do.",
    "tags": [
      "rule-engine-trigger-framework",
      "recall",
      "inline"
    ]
  },
  {
    "id": "rule-engine-trigger-framework-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Indexing rule candidates",
    "section": "Worked example: why indexing matters",
    "prompt": "A platform has 10,000 rules, 30,000 transactions per second, and each rule evaluation costs 1 microsecond. Indexing by a discriminating attribute leaves about 25 candidate rules per event. What is the CPU time per event, naive versus indexed?",
    "options": [
      "About 10 ms naive versus about 25 microseconds indexed",
      "About 10 microseconds naive versus about 25 nanoseconds indexed",
      "About 300 ms naive versus about 750 microseconds indexed",
      "About 1 ms naive versus about 25 microseconds indexed"
    ],
    "answer": 0,
    "explanation": "Naive evaluation checks all 10,000 rules, 10,000 microseconds or 10 ms per event; indexed evaluation checks 25, about 25 microseconds. The 300 ms figure multiplies by the event rate, which gives total evaluations per second rather than time per event.",
    "tags": [
      "rule-engine-trigger-framework",
      "apply",
      "inline"
    ]
  },
  {
    "id": "rule-engine-trigger-framework-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Enrichment outage policy",
    "section": "Failure modes",
    "prompt": "The profile store that supplies home_country is down, and several fraud rules depend on it. What does the lesson say must already have been decided?",
    "options": [
      "Nothing, because the expression language treats missing fields as false and rules simply do not fire",
      "Evaluation must retry until the profile store returns, holding each transaction until then",
      "The platform should switch to a Rete engine, which caches the last known profile for every user",
      "Whether each rule fails open (allow, accepting fraud risk) or fails closed (block, accepting lost sales)"
    ],
    "answer": 3,
    "explanation": "An enrichment outage forces a choice between letting transactions through unchecked or blocking good customers, and that choice should be made per rule before the incident. Assuming missing data quietly evaluates to false just means failing open by accident.",
    "tags": [
      "rule-engine-trigger-framework",
      "staff",
      "inline"
    ]
  },
  {
    "id": "rule-engine-trigger-framework-n1",
    "topic": "rule-engine-trigger-framework",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Rete / Inverted Rule Index Evaluation Reduction",
    "scenario": "A multi-tenant automation platform hosts 200,000 user-defined trigger rules across 50 event types. When an `invoice.paid` event arrives for `tenant_id = 99`, an inverted index filters candidates down to the 8 rules registered for `(tenant_id = 99, event_type = \"invoice.paid\")` instead of evaluating all 200,000 rules.",
    "prompt": "By what factor (`200,000 / 8`) does indexing by `(tenant_id, event_type)` reduce the number of rules evaluated per event?",
    "question": "By what factor (`200,000 / 8`) does indexing by `(tenant_id, event_type)` reduce the number of rules evaluated per event?",
    "unit": "x",
    "answer": 25000,
    "tolerance": 0.2,
    "hint": "Divide 200,000 total rules by the 8 matching candidate rules.",
    "explanation": "200,000 / 8 = 25,000× reduction in rule evaluations per event, turning an O(R) linear scan into a sub-millisecond indexed lookup.",
    "tags": [
      "rule-engine-trigger-framework",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "rule-engine-trigger-framework-t1",
    "topic": "rule-engine-trigger-framework",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Preventing Infinite Trigger Loops & Noisy-Neighbor Rule Storms",
    "scenario": "A customer creates Rule 1 (\"When Issue is updated -> update Issue label\") and Rule 2 (\"When Issue label changes -> update Issue description\"), creating a mutual recursion loop that fires 50,000 webhook actions per minute.",
    "prompt": "Which set of safeguards must a production rule-engine trigger framework enforce to prevent runaway loops and tenant starvation?",
    "question": "Which set of safeguards must a production rule-engine trigger framework enforce to prevent runaway loops and tenant starvation?",
    "options": [
      "Evaluate customer rules using `eval()` on the main HTTP thread with no recursion tracking",
      "Allow unlimited recursive trigger depth and charge the customer later",
      "Propagate a `correlation_id` + `trigger_depth` counter + `visited_rule_ids` set on every synthetic event (halting when `depth > max_depth` or a cycle is detected), combined with per-tenant token-bucket rate limits and isolated execution queues"
    ],
    "correctOption": 2,
    "reasons": [
      "Running `eval()` on the main thread isolates noisy tenants",
      "Infinite recursion loops naturally terminate on their own",
      "Tracking causal lineage (`trigger_depth` and `visited_rule_ids`) deterministically halts self-triggering cycles, while per-tenant rate limits and fair-queuing prevent one tenant's rule storm from delaying other tenants"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How can the rule engine tell that Event B was caused by an action fired by Rule 1 on Event A?",
    "explanation": "Every action-generated event must carry causal metadata (`origin_event_id`, `hop_count`, and `fired_rule_ids`) so the trigger engine immediately rejects cycle re-entry or hops exceeding a strict ceiling (e.g., max depth 5).",
    "tags": [
      "rule-engine-trigger-framework",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["fanout-patterns"] = [
  {
    "id": "fanout-patterns-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Hybrid feed read",
    "section": "Under the Hood: The Hybrid Fanout Architecture",
    "prompt": "In the hybrid fanout model, what happens when a user opens their home feed?",
    "options": [
      "The service pulls and merges recent posts from every account the user follows",
      "It reads the user's precomputed inbox and merges in recent posts from any followed celebrities",
      "It reads the precomputed inbox only, because celebrity posts were also pushed into it",
      "It reads each celebrity's inbox and merges in the user's own recent posts"
    ],
    "answer": 1,
    "explanation": "Normal authors are pushed into inboxes at write time, while celebrities skip fanout and are merged at read time. Pulling from every followee is the pure pull model, which the lesson shows is far too expensive for feed reads.",
    "tags": [
      "fanout-patterns",
      "recall",
      "inline"
    ]
  },
  {
    "id": "fanout-patterns-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Celebrity fanout time",
    "section": "Worked example: capacity maths",
    "prompt": "Under pure fanout-on-write, an account with 20 million followers posts once. The fanout pipeline can insert 500,000 inbox entries per second in total. How long does this single post take to fan out?",
    "options": [
      "About 4 seconds",
      "About 400 seconds",
      "About 40 seconds",
      "About 0.4 seconds"
    ],
    "answer": 2,
    "explanation": "20 million / 500,000 is 40 seconds of the whole pipeline for one post, during which other authors' fanout is delayed. That per-post cost, repeated for each celebrity post, is why hybrids stop pushing above a follower threshold.",
    "tags": [
      "fanout-patterns",
      "apply",
      "inline"
    ]
  },
  {
    "id": "fanout-patterns-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Deleting a pushed post",
    "section": "Failure modes",
    "prompt": "A user deletes a post whose ID was already pushed into 3 million follower inboxes. How should the system make sure followers stop seeing it?",
    "options": [
      "Filter deleted and blocked IDs at read time, since inboxes may still hold them and the post is stored once",
      "Synchronously remove the ID from all 3 million inboxes before confirming the deletion",
      "Do nothing, since inbox entries expire on their own within a few hours",
      "Fan out a tombstone to every inbox and hide the post only after all of them are written"
    ],
    "answer": 0,
    "explanation": "Inboxes hold IDs, so a read-time filter against the single stored post handles deletes and blocks immediately. Synchronously scrubbing millions of inboxes makes the delete as slow as a celebrity fanout, and until it finishes the post stays visible.",
    "tags": [
      "fanout-patterns",
      "staff",
      "inline"
    ]
  },
  {
    "id": "fanout-patterns-n1",
    "topic": "fanout-patterns",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Celebrity Push Fan-Out Write Amplification",
    "scenario": "A social platform uses pure push fan-out-on-write into follower home-timeline caches. A celebrity with 30 million followers publishes 1 post, and your Redis timeline cluster can sustain 300,000 `LPUSH` writes/sec dedicated to fan-out.",
    "prompt": "How many seconds does it take to complete the fan-out of that single celebrity post across all 30 million follower timelines?",
    "question": "How many seconds does it take to complete the fan-out of that single celebrity post across all 30 million follower timelines?",
    "unit": "seconds",
    "answer": 100,
    "tolerance": 0.25,
    "hint": "Divide 30,000,000 follower writes by 300,000 writes/sec.",
    "explanation": "30,000,000 timeline writes ÷ 300,000 writes/sec = 100 seconds of saturated cluster write capacity for a single post—demonstrating why pure fan-out-on-write breaks down for high-follower accounts.",
    "tags": [
      "fanout-patterns",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "fanout-patterns-t1",
    "topic": "fanout-patterns",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Push (Fan-Out-on-Write) vs Hybrid Push-Pull Timeline Architecture",
    "scenario": "99.9% of users on your social network have fewer than 5,000 followers, while 0.1% of accounts (celebrities/news outlets) have 1M–50M followers and post 20 times a day.",
    "prompt": "Which timeline architecture should you adopt, and what is the primary engineering justification?",
    "question": "Which timeline architecture should you adopt, and what is the primary engineering justification?",
    "options": [
      "Use pure fan-out-on-write (push) for all accounts and provision 100x more Redis RAM for inactive followers",
      "Use pure fan-out-on-read (pull) for all accounts, querying 1,000 followed users' outboxes on every home-feed read",
      "Use hybrid fan-out: push posts on write for normal accounts (<50k followers) into active followers' inbox caches, and merge celebrity outbox caches at read time"
    ],
    "correctOption": 2,
    "reasons": [
      "Pushing 50M writes per celebrity tweet keeps write queues small and predictable",
      "Fanning out 1,000 database queries on every timeline read guarantees sub-5ms p99 read latency",
      "Hybrid push-pull bounds write amplification to O(1) outbox writes for celebrities while preserving O(1) precomputed inbox reads plus a tiny K-way merge of followed celebrities on read"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How did Twitter/X solve the 'Justin Bieber problem' on timeline fan-out?",
    "explanation": "Hybrid fan-out pushes normal users' posts into followers' precomputed timelines (fast reads) while keeping high-follower celebrity posts in a per-author outbox cache that is merged into the reader's timeline at read time (preventing 50M-write storms).",
    "tags": [
      "fanout-patterns",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["flash-sale-inventory-locking"] = [
  {
    "id": "flash-sale-inventory-locking-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why the Lua script works",
    "section": "Under the Hood: Atomic Redis Lua Script",
    "prompt": "Why does running check-stock-then-decrement as a Redis Lua script prevent overselling, when the same two steps in application code do not?",
    "options": [
      "Lua scripts take a row-level lock on the stock key that other clients must wait for",
      "Redis replicates each Lua script synchronously to replicas before it returns",
      "Lua scripts retry automatically when they detect a concurrent write to the key",
      "Redis runs the script atomically on its single-threaded loop, so no other command runs between the read and the decrement"
    ],
    "answer": 3,
    "explanation": "No other command can execute between the read and the decrement inside the script, so two buyers cannot both see stock = 1. Replication is still asynchronous, which is exactly why a failover can lose decrements.",
    "tags": [
      "flash-sale-inventory-locking",
      "recall",
      "inline"
    ]
  },
  {
    "id": "flash-sale-inventory-locking-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Funnel timing",
    "section": "Worked example: funnel sizing",
    "prompt": "A sale has 2,000 units. The waiting room admits 8,000 users per second to the reservation step, and 20% of reservations are abandoned within their 10-minute hold. How fast do units sell out, and how many return at expiry?",
    "options": [
      "Reserved in about 0.25 seconds; about 400 units return at hold expiry",
      "Reserved in about 4 seconds; about 400 units return at hold expiry",
      "Reserved in about 0.25 seconds; about 1,600 units return at hold expiry",
      "Reserved in about 2.5 seconds; about 400 units return at hold expiry"
    ],
    "answer": 0,
    "explanation": "2,000 units / 8,000 attempts per second is 0.25 seconds, and 20% of 2,000 is 400 units back in stock. 1,600 is the number of completed purchases, not returned units.",
    "tags": [
      "flash-sale-inventory-locking",
      "apply",
      "inline"
    ]
  },
  {
    "id": "flash-sale-inventory-locking-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Redis failover risk",
    "section": "Inventory strategies compared",
    "prompt": "Inventory is decremented in Redis with a Lua script and persisted to Postgres asynchronously. The Redis primary fails over before replicating its last few decrements. What is the risk, and the mitigation?",
    "options": [
      "No risk, because Lua scripts are atomic across the primary and its replicas",
      "The new primary may have too high a count and oversell; reconcile against the database and hold back a small buffer",
      "The new primary may have too low a count, so the only risk is a few unsold units",
      "Reservation tokens may be duplicated, but the stock count itself stays correct"
    ],
    "answer": 1,
    "explanation": "Redis replication is asynchronous, so lost decrements leave the new primary thinking more stock remains, and it can sell units that are gone. Atomicity is per node; it says nothing about replication, so the lesson reconciles with the database and keeps a buffer or a refund policy.",
    "tags": [
      "flash-sale-inventory-locking",
      "staff",
      "inline"
    ]
  },
  {
    "id": "flash-sale-inventory-locking-n1",
    "topic": "flash-sale-inventory-locking",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Single-Row Lock Contention Ceiling",
    "scenario": "During a flash sale for 1,000 limited-edition GPUs, 50,000 buyers click 'Buy' in the same second. Each SQL transaction locks the single SKU row `WHERE sku_id = 'GPU-99'` and holds the row lock for 2 milliseconds (0.002 s) before committing.",
    "prompt": "What is the maximum number of serial row-lock transactions per second that a single SQL row can complete when each lock is held for 2 ms?",
    "question": "What is the maximum number of serial row-lock transactions per second that a single SQL row can complete when each lock is held for 2 ms?",
    "unit": "tx/s",
    "answer": 500,
    "tolerance": 0.25,
    "hint": "1,000 ms/sec ÷ 2 ms/transaction = 500 transactions/sec.",
    "explanation": "Because exclusive row locks on a single row serialize execution (`Amdahl's Law`), holding the lock for 2 ms caps throughput at `1,000 ms / 2 ms = 500 tx/s`, regardless of whether the database server has 64 or 128 CPU cores.",
    "tags": [
      "flash-sale-inventory-locking",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "flash-sale-inventory-locking-t1",
    "topic": "flash-sale-inventory-locking",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Pessimistic SQL Row Locking vs Striped Inventory / Atomic Lua Reservation",
    "scenario": "A flash sale receives 100,000 checkout requests/sec for a hot SKU with 10,000 units in stock. You must guarantee zero overselling (`sold <= 10,000`) while keeping checkout response latency under 50 ms.",
    "prompt": "Which inventory reservation architecture should you deploy, and why?",
    "question": "Which inventory reservation architecture should you deploy, and why?",
    "options": [
      "Open a `SELECT ... FOR UPDATE` SQL transaction before calling the external payment gateway and hold the row lock until payment succeeds",
      "Pre-allocate inventory into striped sub-buckets (or execute an atomic Redis Lua `DECR` reservation with a TTL hold token) at the edge, then asynchronously persist confirmed orders and release expired holds",
      "Check `if (stock > 0)` in application memory without synchronization and reconcile oversold orders via customer support emails"
    ],
    "correctOption": 1,
    "reasons": [
      "Holding a database row lock across a 600 ms external HTTP payment call maximizes database concurrency",
      "Atomic in-memory reservation (or inventory striping across K rows) removes the single-row lock bottleneck and fast-rejects excess buyers in <1 ms without touching SQL",
      "Overselling 90,000 units and canceling paid orders satisfies the zero-oversell invariant"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Never hold a database lock across an external network RPC, and avoid a single hot lock point.",
    "explanation": "Atomic in-memory token decrement (via Redis Lua script) or striping the 10,000 units across 100 inventory sub-rows absorbs 100k req/s in sub-millisecond time, immediately shedding the 90,000 excess requests before they ever reach the relational database.",
    "tags": [
      "flash-sale-inventory-locking",
      "tradeoff",
      "staff"
    ]
  }
];
