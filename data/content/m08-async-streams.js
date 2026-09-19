window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-async-streams"] = {
  "delegation-and-async-work": {
    "title": "Delegation and async work",
    "video": {
      "youtubeId": "oUJbuFMyBDk",
      "title": "What is a MESSAGE QUEUE and Where is it used?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Cost of Synchronous Blocking RPCs</h2>\n      <p>In a thread-per-request server, a synchronous downstream call can hold a worker while the dependency computes. Event-loop and asynchronous runtimes can overlap that wait without one operating-system thread per request, but the request still occupies connection, memory, deadline, and downstream capacity. This model suffers from fatal scaling bottlenecks:</p>\n      <ul>\n        <li><strong>Thread Memory & Context Switching:</strong> Each OS thread allocates 1MB to 8MB of virtual memory for its stack. Ten thousand concurrent blocked connections exhaust gigabytes of RAM and induce severe CPU kernel context switching overhead.</li>\n        <li><strong>Cascading Outages:</strong> If a downstream billing or notification service experiences a latency spike from 50ms to 5,000ms, upstream connection pools fill to capacity within seconds, exhausting web server worker threads and crashing unrelated endpoints.</li>\n        <li><strong>Temporal Coupling:</strong> Synchronous systems require the sender, the network, and the receiver to be online and available at the exact same millisecond.</li>\n      </ul>\n\n      <h2>Synchronous Blocking vs Asynchronous Delegation</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph SyncFlow [\"1. Synchronous Blocking (Fragile)\"]\n      Client1[\"User Client\"] -->|\"POST /order (Blocked)\"| API1[\"Order API\"]\n      API1 -->|\"Blocking RPC\"| Pay1[\"Payment Service\"]\n      Pay1 -->|\"Blocking RPC\"| Inv1[\"Inventory Service\"]\n      Inv1 -->|\"Slow DB Query (5s)\"| DB1[(\"DB\")]\n      Note1[\"Thread held hostage for 5 seconds. If Inv fails, Order fails.\"]\n    end\n\n    subgraph AsyncFlow [\"2. Asynchronous Delegation (Resilient)\"]\n      Client2[\"User Client\"] -->|\"POST /order\"| API2[\"Order API\"]\n      API2 -->|\"1. Persist Order & Enqueue Event\"| Queue[(\"Durable Message Broker\")]\n      API2 -->|\"2. HTTP 202 Accepted (5ms TTFB)\"| Client2\n      Queue -->|\"3. Pull when ready\"| Worker1[\"Worker: Payment\"]\n      Queue -->|\"3. Pull when ready\"| Worker2[\"Worker: Inventory\"]\n    end\n      </div>\n\n      <h2>Under the Hood: Kernel Event Multiplexing</h2>\n      <p>High-throughput asynchronous systems decouple I/O from thread allocation using kernel multiplexing primitives: <strong>Linux <code>epoll</code></strong>, <strong>BSD/macOS <code>kqueue</code></strong>, and modern <strong>Linux <code>io_uring</code></strong>. A single worker thread registers hundreds of thousands of non-blocking sockets with the kernel. The kernel notifies the application event loop only when bytes arrive on the socket, allowing a small number of event-loop threads to coordinate many connections. Capacity still depends on kernel socket buffers, application state, TLS, message rates, and per-connection limits; connection count alone is not a throughput result.</p>\n    </div>",
    "keyTakeaways": [
      "Synchronous blocking architectures suffer from thread exhaustion, cascading failures, and tight temporal coupling.",
      "Asynchronous delegation returns HTTP 202 Accepted immediately, buffering work in durable messaging queues.",
      "Kernel event multiplexing (epoll, io_uring) allows a single thread to manage 100,000+ concurrent network connections."
    ],
    "furtherReading": [
      {
        "title": "Martin Fowler: What do you mean by 'Event-Driven'?",
        "url": "https://martinfowler.com/articles/201701-event-driven.html"
      }
    ]
  },
  "task-queue-vs-event-stream": {
    "title": "Task queue vs event stream",
    "video": {
      "youtubeId": "oUJbuFMyBDk",
      "title": "What is a MESSAGE QUEUE and Where is it used?",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Architectural Divide: Message Queues vs Event Streams</h2>\n      <p>Engineers frequently confuse message task queues (RabbitMQ, Amazon SQS, Celery) with distributed event streams (Apache Kafka, Redpanda, AWS Kinesis). While both buffer asynchronous data, they represent fundamentally different architectural models.</p>\n\n      <h2>Comparison: Task Queue vs Partitioned Event Stream</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph TaskQueue [\"Task Queue: Claim, Ack, Redeliver\"]\n      P1[\"Producer\"] -->|\"Push Job\"| Q[\"Central Queue FIFO\"]\n      Q -->|\"Deliver Job\"| W1[\"Worker 1 (Processes Job)\"]\n      Q -->|\"Deliver Job\"| W2[\"Worker 2\"]\n      W1 -->|\"Ack completed job\"| Q\n      NoteA[\"Broker tracks availability and in-flight ownership; retention varies.\"]\n    end\n\n    subgraph EventStream [\"Event Stream (Kafka / Kinesis): Append-Only Commit Log\"]\n      P2[\"Producer\"] -->|\"Append Event\"| Log[\"Partition Log [0, 1, 2, 3, 4, 5, 6, 7]\"]\n      Log -->|\"Read from Offset 2\"| CG1[\"Consumer Group: Analytics (Offset: 2)\"]\n      Log -->|\"Read from Offset 6\"| CG2[\"Consumer Group: Fraud Detection (Offset: 6)\"]\n      NoteB[\"Data is immutable on disk. Multiple consumer groups read independently and replay.\"]\n    end\n      </div>\n\n      <h2>Detailed Tradeoff Matrix</h2>\n      <table>\n        <thead>\n          <tr><th>Dimension</th><th>Task Queue (RabbitMQ / SQS)</th><th>Event Stream (Kafka / Redpanda)</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Message Lifecycle</strong></td><td>Usually tracks each job through available, leased/in-flight, acknowledged, and redelivery states; deletion or retention behavior is broker-specific.</td><td>Records are retained by time or size policy independently of one consumer group's progress.</td></tr>\n          <tr><td><strong>Replayability</strong></td><td>Often limited after acknowledgement, though dead-lettering, mirroring, or explicit retention can preserve history.</td><td>Possible while records remain retained; replay must still handle changed code, schemas, and duplicate effects.</td></tr>\n          <tr><td><strong>Consumer Tracking</strong></td><td>Broker commonly tracks availability, lease/visibility, acknowledgement, and redelivery per job.</td><td>A group commits progress per partition, plus application state needed to make effects and retries safe.</td></tr>\n          <tr><td><strong>Ordering Guarantees</strong></td><td>Depends on queue type, worker concurrency, leases, and retries.</td><td>Offsets order records within a partition; concurrent handlers and retries can still complete side effects out of order.</td></tr>\n          <tr><td><strong>Throughput Profile</strong></td><td colspan=\"2\">Measure with the required payload, durability, replication, partition count, acknowledgement policy, and consumer work; product labels do not determine a universal rate.</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "Task queues coordinate ownership and acknowledgement of individual jobs; retention and deletion semantics vary by broker.",
      "Event streams retain ordered partition records independently of a consumer group's committed progress, permitting replay within retention.",
      "Use RabbitMQ/SQS for discrete background jobs; use Kafka for event-driven pub/sub, audit logs, and streaming analytics."
    ],
    "furtherReading": [
      {
        "title": "Kleppmann: Designing Data-Intensive Applications (Chapter 11: Stream Processing)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  "event-bus-for-product-events": {
    "title": "Event bus for product events",
    "video": {
      "youtubeId": "-RDyEFvnTXI",
      "title": "Apache Kafka Fundamentals You Should Know",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Enterprise Product Event Bus</h2>\n      <p>In a microservices organization, business changes (e.g. <code>OrderPlaced</code>, <code>UserSignedUp</code>, <code>SubscriptionCanceled</code>) must be broadcast to dozens of downstream services (search indexing, email marketing, fraud detection, analytics, and accounting). An enterprise event bus coordinates these product events safely.</p>\n\n      <h2>The Event-Driven Topology with Outbox & Schema Registry</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    App[\"Order Service\"] -->|\"1. Atomic ACID Transaction\"| DB[(\"PostgreSQL: orders + outbox table\")]\n    DB -->|\"2. Tail WAL Log (Zero Dual-Write Risk)\"| Debezium[\"Debezium Change Data Capture (CDC)\"]\n    Debezium -->|\"3. Validate Schema\"| SchemaReg[(\"Confluent Schema Registry (Avro/Protobuf)\")]\n    Debezium -->|\"4. Publish Event\"| Kafka[(\"Kafka Topic: orders.events\")]\n    \n    Kafka --> CG1[\"Search Index Worker\"]\n    Kafka --> CG2[\"Fraud Detection Worker\"]\n    Kafka --> CG3[\"Email Notification Worker\"]\n      </div>\n\n      <h2>Under the Hood: Solving the Dual-Write Disaster</h2>\n      <p>A fatal anti-pattern in distributed systems is writing to a database and publishing to a message broker in application code:</p>\n      <pre><code>// THE DUAL-WRITE DISASTER: NEVER DO THIS\nawait db.orders.insert(order);\nawait kafka.publish(\"order_events\", order); // What if this network call fails or server crashes?\n      </code></pre>\n      <p>If the Kafka write fails or the process crashes between lines, the database has the order but downstream workers never receive the event. If you reverse the order, the event is emitted but the database write could fail.</p>\n      <p><strong>The Transactional Outbox Pattern:</strong> The application writes both the order record and an outbox event into the <em>same local database transaction</em>. A Change Data Capture (CDC) engine such as Debezium tails committed database changes and publishes them to Kafka. This closes the application dual-write window, but publication can be delayed or repeated, so consumers still need schema handling, idempotent effects, monitoring, and retention sufficient for recovery.</p>\n    </div>",
    "keyTakeaways": [
      "A transactional outbox commits domain state and the publication obligation together, removing the application dual-write race; CDC retries and consumer effects still require recovery and deduplication.",
      "Schema registries enforce backward and forward schema compatibility using Avro or Protocol Buffers.",
      "Use a documented event envelope with stable identity, type, producer, schema version, and occurrence time; CloudEvents is one optional standard."
    ],
    "furtherReading": [
      {
        "title": "Debezium Documentation: The Outbox Pattern",
        "url": "https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html"
      }
    ]
  },
  "queue-lag": {
    "title": "Queue lag",
    "video": {
      "youtubeId": "oUJbuFMyBDk",
      "title": "What is a MESSAGE QUEUE and Where is it used?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Consumer Lag & Little's Law</h2>\n      <p>In distributed message processing, <strong>Consumer Lag</strong> is the delta between the latest message produced to a partition (the Log End Offset / High Watermark) and the latest message offset committed by the consumer group:</p>\n      <pre><code>Consumer_Lag = Log_End_Offset - Current_Consumer_Offset</code></pre>\n      <p>Offset lag is one useful indicator, but oldest-event age, arrival and service rates, retry volume, partition skew, and downstream latency are often needed to explain user-visible delay. For a stable system over a defined window, <strong>Little's Law</strong> ($L = \\lambda W$) relates average in-flight work, throughput, and average time in system. If arrivals exceed service capacity, the system is not stable: backlog and age continue growing until capacity increases, intake is limited, or work is shed.</p>\n\n      <h2>Consumer Lag and Auto-Scaling Loop</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Producers[\"Producers (Burst: 50,000 msg/sec)\"] --> Partition[\"Kafka Topic Partition (High Watermark: 95,000)\"]\n    Partition -->|\"Lag = 45,000\"| Consumer[\"Consumer Worker Pool (Current Offset: 50,000)\"]\n    \n    Consumer -->|\"Report Metrics\"| Prom[\"Prometheus (kafka_consumergroup_lag)\"]\n    Prom -->|\"Threshold Exceeded (> 10,000)\"| KEDA[\"KEDA / Kubernetes HPA\"]\n    KEDA -->|\"Scale Pods (Workers: 2 -> 16)\"| Consumer\n      </div>\n\n      <h2>Backpressure & Flow Control Strategies</h2>\n      <p>When downstream consumers cannot keep up with upstream producers, the system must exert <strong>Backpressure</strong> rather than crashing:</p>\n      <ul>\n        <li><strong>Pull-Based Flow Control:</strong> Unlike push queues (which flood workers until memory crashes), Kafka consumers pull batches of records using <code>poll(Duration timeout, int maxRecords)</code>. Workers dictate their own ingestion rate based on available processing capacity.</li>\n        <li><strong>Dead-Letter Queues (DLQ):</strong> If a poisoned message repeatedly causes worker crashes or exceeds retry thresholds, the consumer routes it to an isolated DLQ topic and advances its offset, preventing a single poisoned message from stalling the entire consumer group.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Consumer lag measures the delta between the broker high watermark and consumer committed offset.",
      "Pull-based consumption naturally enforces backpressure by allowing workers to control their ingestion rate.",
      "Automated scaling (via KEDA/Kubernetes HPA) dynamically adds worker pods when consumer lag breaches thresholds."
    ],
    "furtherReading": [
      {
        "title": "Confluent: Monitoring Kafka Consumer Lag",
        "url": "https://www.confluent.io/blog/monitor-kafka-consumer-lag/"
      }
    ]
  },
  "distributed-task-scheduler": {
    "title": "Distributed task scheduler",
    "video": {
      "youtubeId": "bhL0vW-fWhg",
      "title": "System Design: Distributed Job Scheduler",
      "channel": "Learning Podcasts"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: High-Throughput Delayed Job Scheduling</h2>\n      <p>Scheduling millions of future tasks (e.g. \"Send reminder email in 2 hours\", \"Charge card in 3 days\", \"Retry webhook in 30 seconds\") requires coordinating delayed execution across a distributed cluster without race conditions or dropped jobs.</p>\n\n      <h2>Redis Sorted Set (ZSET) Delayed Scheduler</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Application Producer\"] -->|\"ZADD delayed_jobs <timestamp> <job_id>\"| Redis[(\"Redis Cluster\")]\n    \n    subgraph PollerLoop [\"Distributed Worker Polling Engine\"]\n      Worker1[\"Scheduler Worker 1\"]\n      Worker2[\"Scheduler Worker 2\"]\n      Worker1 & Worker2 -->|\"Atomic claim: scheduled -> leased\"| Redis\n    end\n    \n    PollerLoop -->|\"Publish with stable job ID; retry if uncertain\"| ExecutionQueue[(\"Execution Queue (RabbitMQ / SQS)\")]\n    ExecutionQueue --> Workers[\"Execution Workers\"]\n      </div>\n\n      <h2>Under the Hood: The Atomic Lua Script Pattern</h2>\n      <p>A claim must prevent two schedulers from owning the same attempt without deleting the only durable obligation. Atomically move due IDs from the scheduled set into a leased set whose score is the lease deadline:</p>\n      <pre><code>-- Claim due jobs without forgetting them\nlocal due_jobs = redis.call('ZRANGEBYSCORE', KEYS[1], 0, ARGV[1], 'LIMIT', 0, ARGV[2])\nif #due_jobs > 0 then\n    redis.call('ZREM', KEYS[1], unpack(due_jobs))\n    for _, job_id in ipairs(due_jobs) do\n        redis.call('ZADD', KEYS[2], ARGV[3], job_id)\n    end\n    return due_jobs\nend\nreturn {}\n      </code></pre>\n\n      <p>After claiming, publish each job with its stable ID. Only clear the lease after the broker confirms acceptance. If the scheduler crashes first, a reaper returns expired leases to the scheduled set. If publication succeeded but its acknowledgement was lost, retry may publish a duplicate, so the execution queue or worker must deduplicate by job ID. Removing a job before this recoverable handoff creates a lost-job window.</p>\n\n      <h2>Hierarchical Hashed Wheel Timers</h2>\n      <p>For in-process ultra-high-frequency scheduling (sub-millisecond to seconds), distributed databases use the <strong>Hashed Wheel Timer</strong> algorithm (Varghese & Lauck). A circular array of buckets advances like a clock hand and can provide constant-time insertion and tick work under specific implementations. Cancellation cost and worst-case bucket work depend on the data structure and timer distribution; this is an in-process timer, not a durable distributed scheduler.</p>\n    </div>",
    "keyTakeaways": [
      "Redis sorted sets (ZSET) store delayed jobs using future Unix execution timestamps as the score.",
      "Atomically moving due jobs into a leased set prevents competing claims without erasing the durable obligation.",
      "Hashed wheel timers efficiently manage many in-memory deadlines, but durable scheduling still needs persisted state and recovery."
    ],
    "furtherReading": [
      {
        "title": "Varghese & Lauck: Hashed and Hierarchical Timing Wheels",
        "url": "http://www.cs.columbia.edu/~nahum/w6998/papers/ton97-timing-wheels.pdf"
      }
    ]
  },
  "postgres-skip-locked-work-queue": {
    "title": "Postgres SKIP LOCKED work queue",
    "video": {
      "youtubeId": "SR3_Z1GsRIw",
      "title": "A Deep Dive into Database Locking || Developers Coffee",
      "channel": "Uday Chauhan"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Why Naive SQL Work Queues Collapse</h2>\n      <p>For small to medium workloads, standing up dedicated Kafka or RabbitMQ clusters introduces operational complexity. Engineers often attempt to use PostgreSQL as a work queue. Naive implementations collapse under load:</p>\n      <ul>\n        <li><code>SELECT * FROM jobs WHERE status = 'pending' LIMIT 1 FOR UPDATE;</code> locks the first row. Every other concurrent worker blocks waiting on the row lock, turning parallel workers into a completely serialized bottleneck.</li>\n        <li>Polling without row locks causes double-processing race conditions.</li>\n      </ul>\n\n      <h2>The Breakthrough: SKIP LOCKED</h2>\n      <p>PostgreSQL 9.5 introduced <code>FOR UPDATE SKIP LOCKED</code>. When a transaction executes this query, the database engine checks if candidate rows are currently locked by another active transaction. Instead of blocking and waiting, it <strong>instantly skips past locked rows</strong> and locks the next available unlocked row.</p>\n\n      <h2>SKIP LOCKED Worker Execution Pipeline</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    W1[\"Worker 1\"] -->|\"SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1\"| J1[\"Job 1: LOCKED by W1\"]\n    W2[\"Worker 2\"] -->|\"SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1\"| J2[\"Job 2: LOCKED by W2\"]\n    W3[\"Worker 3\"] -->|\"SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1\"| J3[\"Job 3: LOCKED by W3\"]\n    \n    J1 -->|\"Process & DELETE / UPDATE status='completed'\"| Done1[\"Transaction Commit\"]\n    J2 -->|\"Process & Commit\"| Done2[\"Transaction Commit\"]\n      </div>\n\n      <h2>Production-Grade Implementation SQL</h2>\n      <pre><code>-- Atomically fetch and lock 1 pending job without blocking other workers\nWITH next_job AS (\n  SELECT id\n  FROM job_queue\n  WHERE status = 'pending' AND scheduled_at <= NOW()\n  ORDER BY priority DESC, id ASC\n  FOR UPDATE SKIP LOCKED\n  LIMIT 1\n)\nUPDATE job_queue\nSET status = 'processing',\n    locked_at = NOW(),\n    worker_id = 'worker_pod_42'\nWHERE id = (SELECT id FROM next_job)\nRETURNING *;\n      </code></pre>\n      <p><strong>Operational Caution: Table Bloat:</strong> Frequent inserts and deletes create dead tuples. Queue tables require aggressive PostgreSQL autovacuum settings (e.g. <code>autovacuum_vacuum_scale_factor = 0.05</code>) to prevent sequential scan performance collapse.</p>\n    </div>",
    "keyTakeaways": [
      "FOR UPDATE SKIP LOCKED allows hundreds of concurrent database workers to claim distinct jobs without lock contention.",
      "Common Table Expressions (CTE) atomically lock and mark jobs as 'processing' in a single round-trip query.",
      "High-throughput SQL queues must tune autovacuum aggressively to prevent dead tuple table bloat."
    ],
    "furtherReading": [
      {
        "title": "2ndQuadrant: What is SKIP LOCKED in PostgreSQL 9.5?",
        "url": "https://www.cybertec-postgresql.com/en/what-is-skip-locked-in-postgresql-9-5/"
      }
    ]
  },
  "dag-workflow-orchestration": {
    "title": "DAG workflow orchestration",
    "video": {
      "youtubeId": "ksRCq0BJef8",
      "title": "Creating event-driven microservices: the why, how and what by Andrew Schofield by Andrew Schofield",
      "channel": "Devoxx"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Orchestrating Complex Business Processes</h2>\n      <p>Real-world engineering workflows (e.g. customer onboarding, food delivery fulfillment, ML model training pipelines) consist of multiple steps that must execute across heterogeneous services. These steps have dependencies forming a <strong>Directed Acyclic Graph (DAG)</strong>.</p>\n\n      <h2>The Temporal Event-Sourced Orchestration Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client: StartOrderWorkflow()\"] --> Cluster[\"Temporal Cluster (Orchestrator)\"]\n    \n    subgraph HistoryEngine [\"Durable Event Sourcing History Engine\"]\n      Cluster --> History[(\"Append-Only Execution History Log\")]\n    end\n    \n    subgraph WorkerFleet [\"Distributed Worker Fleet\"]\n      Cluster -->|\"Task: ChargeCard\"| W1[\"Payment Worker\"]\n      W1 -->|\"Result: Success\"| Cluster\n      Cluster -->|\"Task: ReserveInventory\"| W2[\"Inventory Worker\"]\n      W2 -->|\"Result: Failed\"| Cluster\n      Cluster -->|\"Compensating Task: RefundCard\"| W1\n    end\n      </div>\n\n      <h2>Under the Hood: Deterministic Workflow Replay</h2>\n      <p>Traditional orchestrators store current state in database tables (e.g. <code>step = 'STEP_3'</code>). Modern engines like <strong>Temporal</strong> and <strong>Cadence</strong> use <strong>Event Sourcing</strong>:</p>\n      <ul>\n        <li>Workflows are written as standard code (Go, TypeScript, Java). When a worker fails or restarts, Temporal replays the recorded event history from the beginning.</li>\n        <li>During replay, previously executed external calls (Activities) are not re-executed; their recorded results are returned instantaneously from the history log.</li>\n        <li><strong>The Determinism Rule:</strong> Workflow code must be 100% deterministic (no random UUID generation, direct system clock reads, or direct HTTP calls inside the workflow function). Non-deterministic operations must reside in Activities.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "DAG engines model complex multi-step workflows with strict dependency ordering and automatic retries.",
      "Temporal uses event sourcing to recover state by deterministically replaying history logs without re-executing completed tasks.",
      "The Saga pattern executes compensating transactions in reverse order when any intermediate workflow step fails."
    ],
    "furtherReading": [
      {
        "title": "Temporal Architecture and Execution Model",
        "url": "https://docs.temporal.io/temporal-explained"
      }
    ]
  },
  "rule-engine-trigger-framework": {
    "title": "Rule engine and trigger framework",
    "video": {
      "youtubeId": "ksRCq0BJef8",
      "title": "Creating event-driven microservices: the why, how and what by Andrew Schofield by Andrew Schofield",
      "channel": "Devoxx"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: High-Throughput Rule Evaluation</h2>\n      <p>Modern platforms process millions of real-time events per second against dynamic rule collections: fraud prevention (\"Flag transaction if amount > $10,000 and country != user.home_country\"), promotional pricing, and security firewalls. Naive evaluation ($O(N \times M)$ linear checking) creates crippling CPU bottlenecks.</p>\n\n      <h2>The Rete Pattern Matching Network</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Event[\"Transaction Event: {amount: 15000, country: 'RO', type: 'WIRE'}\"] --> RootNode[\"Root Alpha Node\"]\n    \n    subgraph AlphaNetwork [\"Alpha Network (Single-Attribute Filters)\"]\n      RootNode --> A1{\"amount > 10000?\"}\n      RootNode --> A2{\"type == 'WIRE'?\"}\n    end\n    \n    subgraph BetaNetwork [\"Beta Network (Multi-Object Joins)\"]\n      A1 & A2 --> B1{\"country != user.registered_country?\"}\n    end\n    \n    B1 --> Terminal[\"Terminal Node: Trigger Alert & Block Transaction\"]\n      </div>\n\n      <h2>Under the Hood: The Rete Algorithm & JIT Compilation</h2>\n      <ul>\n        <li><strong>The Rete Algorithm (Forgy):</strong> Avoids redundant evaluations by compiling rules into a directed acyclic evaluation graph. Alpha nodes filter single-fact conditions; Beta nodes perform stateful cross-entity comparisons. Intermediate matches are cached in memory.</li>\n        <li><strong>Abstract Syntax Tree (AST) JIT Compilation:</strong> High-performance engines parse business rules written in domain-specific languages (e.g. JSON-rules or CEL - Common Expression Language) into an AST, compiling them down to native JVM bytecode or Go functions for microsecond execution speeds.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Rule engines evaluate millions of incoming events against dynamic criteria without modifying application code.",
      "The Rete algorithm shares common condition evaluations across rules, eliminating redundant CPU computation.",
      "CEL defines a bounded, non-Turing-complete expression language; implementations may interpret, compile, or otherwise optimize checked expressions."
    ],
    "furtherReading": [
      {
        "title": "Google Common Expression Language (CEL) Specification",
        "url": "https://github.com/google/cel-spec"
      }
    ]
  },
  "fanout-patterns": {
    "title": "Fanout patterns",
    "video": {
      "youtubeId": "oUJbuFMyBDk",
      "title": "What is a MESSAGE QUEUE and Where is it used?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Fanout Dilemma: Social Feeds & Notifications</h2>\n      <p>When a user publishes content (a tweet, an Instagram photo, or a LinkedIn post), how is that content distributed to all of their followers? Social network engineering relies on two foundational strategies: <strong>Fanout-on-Write (Push)</strong> and <strong>Fanout-on-Read (Pull)</strong>.</p>\n\n      <h2>Architectural Comparison: Push vs Pull</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph Push [\"1. Fanout-on-Write (Push Model: Default)\"]\n      Author1[\"Alice Posts Tweet\"] --> WriteWorker[\"Background Fanout Worker\"]\n      WriteWorker -->|\"Push Tweet ID to Inboxes\"| Box1[\"Bob's Redis Feed\"]\n      WriteWorker -->|\"Push Tweet ID\"| Box2[\"Charlie's Redis Feed\"]\n      WriteWorker -->|\"Push Tweet ID\"| Box3[\"Dave's Redis Feed\"]\n      Note1[\"Feed Read: O(1) instantaneous ZRANGE from Redis.\"]\n    end\n\n    subgraph Pull [\"2. Fanout-on-Read (Pull Model: Celebrities)\"]\n      Celebrity[\"Taylor Swift (100M Followers) Posts\"] --> PostDB[(\"Taylor's Outbox Table\")]\n      Follower[\"Follower Opens App\"] --> ReadAgg[\"Feed Aggregation Service\"]\n      ReadAgg -->|\"Fetch Posts\"| PostDB\n      Note2[\"Zero write amplification. Read aggregates followed accounts on the fly.\"]\n    end\n      </div>\n\n      <h2>Under the Hood: The Hybrid Fanout Architecture</h2>\n      <p>Neither pure push nor pure pull works at scale:</p>\n      <ul>\n        <li><strong>The Push Catastrophe (Write Amplification):</strong> If an account with 100,000,000 followers tweets, fanout-on-write requires generating and writing 100,000,000 Redis entries. At 50,000 writes/sec, the fanout pipeline takes 33 minutes to complete.</li>\n        <li><strong>The Pull Catastrophe (Read Latency):</strong> If every user load requires fetching and merging posts from 1,000 followees, p99 feed load latency skyrockets to seconds.</li>\n        <li><strong>The Twitter / Instagram Solution (Hybrid Model):</strong> Standard users (< 25,000 followers) use <strong>Fanout-on-Write</strong>. Celebrities (> 25,000 followers) do not fan out on write. When a follower opens their feed, the system reads their pre-materialized Redis timeline and merges the recent posts of any followed celebrities on the fly.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Fanout-on-Write delivers instant O(1) feed reads but collapses on high-follower celebrity posts.",
      "Fanout-on-Read eliminates write amplification but incurs heavy multi-query latency on user feed loads.",
      "Modern platforms use a hybrid model: push for normal users, dynamic pull-and-merge for celebrities."
    ],
    "furtherReading": [
      {
        "title": "Twitter Engineering: Timelines at Scale",
        "url": "https://blog.x.com/engineering/en_us/topics/infrastructure/2013/timelines-at-scale"
      }
    ]
  },
  "flash-sale-inventory-locking": {
    "title": "Flash sale inventory locking",
    "video": {
      "youtubeId": "YXkOdWBwqaA",
      "title": "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Flash Sale Concurrency Challenge</h2>\n      <p>During a mega flash sale (e.g. 1,000 PlayStation 5 consoles offered to 500,000 concurrent shoppers), hundreds of thousands of requests hit the inventory service in the exact same second. Traditional relational database transactions cause catastrophic failures:</p>\n      <pre><code>-- THE FLASH SALE KILLER: ROW LOCK CONVOY\nBEGIN TRANSACTION;\nSELECT stock FROM items WHERE id = 123 FOR UPDATE;\nIF stock > 0 THEN\n    UPDATE items SET stock = stock - 1 WHERE id = 123;\nEND IF;\nCOMMIT;\n      </code></pre>\n      <p>When 50,000 concurrent database connections attempt to acquire a row lock on item 123, the database connection pool exhausts in milliseconds, memory spikes, thread context switching consumes 100% of CPU, and the database crashes.</p>\n\n      <h2>The Multi-Layer In-Memory Locking Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Traffic[\"500,000 Concurrent Buyers\"] --> RateLimit[\"1. Nginx Token Bucket Rate Limiter (Drop 80%)\"]\n    RateLimit --> App[\"2. Flash Sale Application Service\"]\n    \n    App -->|\"3. Atomic Lua Script: EVALSHA\"| Redis[(\"Redis Cluster (Single-Threaded RAM)\")]\n    \n    Redis --> StockCheck{\"Stock > 0?\"}\n    StockCheck -->|\"No\"| SoldOut[\"Return 'Sold Out' (Instant 400ms)\"]\n    StockCheck -->|\"Yes (Atomic DECR)\"| Reserve[\"Generate Reservation Token: 'res_88192'\"]\n    \n    Reserve --> OrderQueue[(\"Kafka: order_reservations\")]\n    OrderQueue --> DBWorker[\"Asynchronous DB Worker (Batched INSERT)\"]\n    DBWorker --> Postgres[(\"PostgreSQL Orders DB\")]\n      </div>\n\n      <h2>Under the Hood: Atomic Redis Lua Script</h2>\n      <p>Redis executes Lua scripts atomically in its single-threaded event loop. No other command can execute between reading the stock and decrementing it, eliminating race conditions with zero database locks:</p>\n      <pre><code>-- Keys: 1 = item_stock_key, 2 = user_reservations_set\n-- Args: 1 = user_id\nlocal stock = tonumber(redis.call('GET', KEYS[1]) or '0')\nif stock <= 0 then\n    return -1 -- Sold out\nend\nif redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then\n    return -2 -- Already reserved by this user\nend\nredis.call('DECR', KEYS[1])\nredis.call('SADD', KEYS[2], ARGV[1])\nreturn 1 -- Success: stock reserved\n      </code></pre>\n      <p><strong>Delayed Release Timer:</strong> If the user does not complete payment within 15 minutes, a delayed scheduler (Redis ZSET) automatically re-increments the Redis stock and invalidates the reservation token.</p>\n    </div>",
    "keyTakeaways": [
      "Relational database row-level locking (FOR UPDATE) collapses under flash sales due to thread lock convoys.",
      "In-memory Redis atomic Lua scripts decrement inventory in sub-milliseconds without database contention.",
      "Successful reservations are queued asynchronously to Kafka for batched database persistence with delayed release timers."
    ],
    "furtherReading": [
      {
        "title": "Alibaba Technology: How Taobao Handles Flash Sales at 500k QPS",
        "url": "https://www.alibabacloud.com/blog/how-does-alibaba-handle-the-double-11-shopping-festival_595277"
      }
    ]
  }
};
