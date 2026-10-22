/**
 * System Design in Depth — Spaced Repetition (SRS) Flashcards Dataset
 * Derived from 200 unit key takeaways and 600 curriculum questions.
 * Total cards: 1237
 */
(function(root) {
  'use strict';

  var SRS_CARDS_DATA = [
  {
    "id": "srs-takeaway-requirements-clarification-1",
    "type": "takeaway",
    "prompt": "In Requirements clarification, what is a fundamental rule regarding: Distinguish functional requirements (what the system does) from non-functional requirements (how it performs under load)?",
    "answer": "Distinguish functional requirements (what the system does) from non-functional requirements (how it performs under load).",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "requirements-clarification",
    "unitTitle": "Requirements clarification"
  },
  {
    "id": "srs-takeaway-requirements-clarification-2",
    "type": "takeaway",
    "prompt": "In Requirements clarification, what is a fundamental rule regarding: Write assumptions down as a brief to confirm with the product owner before designing?",
    "answer": "Write assumptions down as a brief to confirm with the product owner before designing.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "requirements-clarification",
    "unitTitle": "Requirements clarification"
  },
  {
    "id": "srs-takeaway-requirements-clarification-3",
    "type": "takeaway",
    "prompt": "In Requirements clarification, what is a fundamental rule regarding: Identify invariants?",
    "answer": "Identify invariants: conditions the implementation must preserve even when requests overlap or are retried.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "requirements-clarification",
    "unitTitle": "Requirements clarification"
  },
  {
    "id": "srs-quiz-requirements-clarification-c1",
    "type": "quiz",
    "prompt": "While writing the URL shortener brief, which of these statements is an invariant rather than a scale assumption, a latency target, or a non-goal?",
    "answer": "A generated short name must never silently replace an existing mapping\n\nExplanation: An invariant is a condition the implementation must preserve even when requests overlap or are retried, and a mapping that is never overwritten is exactly that. The 95% latency line is tempting, but it is a measurable quality target (a non-functional requirement), not a correctness condition that must hold on every request.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "requirements-clarification",
    "unitTitle": "Requirements clarification"
  },
  {
    "id": "srs-quiz-requirements-clarification-c2",
    "type": "quiz",
    "prompt": "Under the course's chosen contract, first the analytics report service goes down while event storage keeps working. Later, event storage fails while reporting is fine. How should redirects behave in each case?",
    "answer": "Keep redirecting in the first case and return an error in the second, since each redirect needs a stored event\n\nExplanation: The brief says every accepted redirect must have a stored event before the response, while reports can be calculated later. So losing reporting does not block redirects, but losing event storage does. Treating both as background work is the tempting mistake: moving report calculation to the background says nothing about whether losing its input is acceptable.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "requirements-clarification",
    "unitTitle": "Requirements clarification"
  },
  {
    "id": "srs-quiz-requirements-clarification-c3",
    "type": "quiz",
    "prompt": "A design doc says only \"we will cache link lookups\". Destinations never change after creation, but an administrator can disable a phishing link. Which requirement has the brief failed to pin down?",
    "answer": "How long a cached copy may keep redirecting after a link is disabled\n\nExplanation: The lesson says freshness needs its own question: a one-minute allowed delay permits different designs than a requirement to stop every new redirect immediately. Fixed destinations are the tempting answer, but they do not settle anything here, because the disabled flag can still change while a cached copy is being served.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "requirements-clarification",
    "unitTitle": "Requirements clarification"
  },
  {
    "id": "srs-takeaway-logical-system-design-1",
    "type": "takeaway",
    "prompt": "In Logical system design, what is a fundamental rule regarding: Separate HTTP handling, business rules, and storage into distinct responsibilities with explicit boundaries?",
    "answer": "Separate HTTP handling, business rules, and storage into distinct responsibilities with explicit boundaries.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "logical-system-design",
    "unitTitle": "Logical system design"
  },
  {
    "id": "srs-takeaway-logical-system-design-2",
    "type": "takeaway",
    "prompt": "In Logical system design, what is a fundamental rule regarding: Drawing separate boxes does not require separate servers; boundaries can be in-process function calls?",
    "answer": "Drawing separate boxes does not require separate servers; boundaries can be in-process function calls.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "logical-system-design",
    "unitTitle": "Logical system design"
  },
  {
    "id": "srs-takeaway-logical-system-design-3",
    "type": "takeaway",
    "prompt": "In Logical system design, what is a fundamental rule regarding: A boundary is tested by checking whether a change in one module forces changes in others?",
    "answer": "A boundary is tested by checking whether a change in one module forces changes in others.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "logical-system-design",
    "unitTitle": "Logical system design"
  },
  {
    "id": "srs-quiz-logical-system-design-c1",
    "type": "quiz",
    "prompt": "Of the three responsibilities (HTTP adapter, link operation, storage adapter), which decision belongs to the link operation?",
    "answer": "Requiring a redirect to wait until its click event is stored\n\nExplanation: The lesson puts the sequencing rule (a successful redirect waits for its event to be stored) in the link operation, because HTTP formatting should not decide whether losing a click is acceptable. Building the redirect response looks like a decision, but it is translation work for the HTTP adapter.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "logical-system-design",
    "unitTitle": "Logical system design"
  },
  {
    "id": "srs-quiz-logical-system-design-c2",
    "type": "quiz",
    "prompt": "During resolve(code), the storage adapter's database connection times out. What should the operation return to the HTTP caller?",
    "answer": "Unavailable, so the handler returns a service error instead of a false answer\n\nExplanation: A timeout means the operation could not reach an answer, which the contract calls Unavailable. Returning Missing is the tempting shortcut, but it tells the caller that no such link exists when that is unknown. Passing the raw driver exception up would spread vendor details into every route and job.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "logical-system-design",
    "unitTitle": "Logical system design"
  },
  {
    "id": "srs-quiz-logical-system-design-c3",
    "type": "quiz",
    "prompt": "You test the rule \"disabled links never redirect\" by calling the link operation with an in-memory storage fake that returns a disabled record. The test passes. What has it not established?",
    "answer": "That the real query handles missing rows, uniqueness conflicts and failures\n\nExplanation: The fake checks the product rule in isolation. The lesson says the storage adapter still needs its own tests against the real database, covering missing rows, conflicts and failures. The first option is what the test does prove, and keeping the two kinds of test separate shows whether a failure comes from the rule or from persistence.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "logical-system-design",
    "unitTitle": "Logical system design"
  },
  {
    "id": "srs-takeaway-non-functional-requirements-1",
    "type": "takeaway",
    "prompt": "In Non-functional requirements, what is a fundamental rule regarding: SLIs measure actual service behavior; SLOs set internal targets; SLAs define contractual penalties?",
    "answer": "SLIs measure actual service behavior; SLOs set internal targets; SLAs define contractual penalties.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "non-functional-requirements",
    "unitTitle": "Non-functional requirements"
  },
  {
    "id": "srs-takeaway-non-functional-requirements-2",
    "type": "takeaway",
    "prompt": "In Non-functional requirements, what is a fundamental rule regarding: A 100% availability target is usually impractical and can suppress useful change?",
    "answer": "A 100% availability target is usually impractical and can suppress useful change.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "non-functional-requirements",
    "unitTitle": "Non-functional requirements"
  },
  {
    "id": "srs-takeaway-non-functional-requirements-3",
    "type": "takeaway",
    "prompt": "In Non-functional requirements, what is a fundamental rule regarding: Error budgets balance feature velocity against reliability ?",
    "answer": "Error budgets balance feature velocity against reliability — excessive burn triggers release freezes.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "non-functional-requirements",
    "unitTitle": "Non-functional requirements"
  },
  {
    "id": "srs-quiz-non-functional-requirements-c1",
    "type": "quiz",
    "prompt": "For a named disaster scenario, what does the recovery point objective (RPO) limit?",
    "answer": "How much recent data may be missing after recovery, measured in time\n\nExplanation: RPO limits the acceptable gap in recovered data, for example losing no more than five minutes of writes. The first option describes RTO, the recovery time objective, which limits how long restoration may take. They are separate targets, and a plan can meet one while missing the other.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "non-functional-requirements",
    "unitTitle": "Non-functional requirements"
  },
  {
    "id": "srs-quiz-non-functional-requirements-c2",
    "type": "quiz",
    "prompt": "In the simplified time-based model (the service is either fully up or fully down), how much total downtime does a 99.9% availability target allow over a 30-day month?",
    "answer": "About 43 minutes\n\nExplanation: 30 days is 43,200 minutes, and 0.1% of that is about 43.2 minutes. 8.8 hours is the tempting choice because it is the familiar yearly budget for 99.9%, not the monthly one. A request-based target would count failed requests instead and could give a different result.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "non-functional-requirements",
    "unitTitle": "Non-functional requirements"
  },
  {
    "id": "srs-quiz-non-functional-requirements-c3",
    "type": "quiz",
    "prompt": "A dashboard computes p95 redirect latency over every response, errors included. After a bad deploy, 30% of redirects fail with an error returned in 3 ms. What is the dashboard likely to show, and how should the SLO handle it?",
    "answer": "p95 holds steady or improves, so failed eligible requests must count as misses however fast they return\n\nExplanation: A flood of fast errors pulls the distribution down, so a broken service can look faster. The lesson counts only correct answers within the deadline as successes, so failed attempts are misses. Simply dropping errors from the measurement (the last option) is tempting, but it hides the failures instead of counting them against the target.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "non-functional-requirements",
    "unitTitle": "Non-functional requirements"
  },
  {
    "id": "srs-takeaway-system-design-tradeoffs-1",
    "type": "takeaway",
    "prompt": "In System design tradeoffs, what is a fundamental rule regarding: Every architectural decision trades one property for another (consistency vs?",
    "answer": "Every architectural decision trades one property for another (consistency vs. availability, latency vs. throughput).",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "system-design-tradeoffs",
    "unitTitle": "System design tradeoffs"
  },
  {
    "id": "srs-takeaway-system-design-tradeoffs-2",
    "type": "takeaway",
    "prompt": "In System design tradeoffs, what is a fundamental rule regarding: Identify which constraints are hard (legal, physical) vs?",
    "answer": "Identify which constraints are hard (legal, physical) vs. soft (optimization targets) early in design.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "system-design-tradeoffs",
    "unitTitle": "System design tradeoffs"
  },
  {
    "id": "srs-takeaway-system-design-tradeoffs-3",
    "type": "takeaway",
    "prompt": "In System design tradeoffs, what is a fundamental rule regarding: Document tradeoff decisions with rationale so future engineers understand why alternatives were rejected?",
    "answer": "Document tradeoff decisions with rationale so future engineers understand why alternatives were rejected.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "system-design-tradeoffs",
    "unitTitle": "System design tradeoffs"
  },
  {
    "id": "srs-quiz-system-design-tradeoffs-c1",
    "type": "quiz",
    "prompt": "Which statement is a complete trade-off: it names the benefit, the cost, and the requirement that makes the cost acceptable?",
    "answer": "Cache display names under the agreed delay; check payment eligibility fresh at order time\n\nExplanation: The second option names what may be stale (display names), the accepted delay, and the operation that needs a stronger check (payment eligibility). The first option sounds reasonable but never says which staleness is acceptable. The last option gives only \"complexity\" as the cost, which the lesson says to turn into a concrete retry, migration, or stale result.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "system-design-tradeoffs",
    "unitTitle": "System design tradeoffs"
  },
  {
    "id": "srs-quiz-system-design-tradeoffs-c2",
    "type": "quiz",
    "prompt": "Workers can process 800 jobs per second. A burst arrives at 1,000 jobs per second for 10 minutes, and you put a queue in front of the workers. What does the queue do during the burst?",
    "answer": "It absorbs the burst, but about 120,000 jobs pile up and user-visible delay grows until the burst ends\n\nExplanation: The lesson says a queue does not create processing capacity. The 200 extra jobs per second for 600 seconds add up to a backlog of about 120,000, and that shows up as waiting time. Decoupling is the tempting answer, but it only moves the delay onto users; the workers still finish 800 jobs per second.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "system-design-tradeoffs",
    "unitTitle": "System design tradeoffs"
  },
  {
    "id": "srs-quiz-system-design-tradeoffs-c3",
    "type": "quiz",
    "prompt": "To debug one customer, an engineer adds user_id as a label on the request-latency metric. The product has 5 million active users. Where does the cost show up first?",
    "answer": "The number of time series grows with the user population, inflating metric storage and query cost\n\nExplanation: Each distinct label value creates its own time series, so a user ID label makes a small set of measurements grow with the user base. The lesson's point is that the cost follows the behavior, not the number of boxes in the diagram. \"Only a few bytes\" is the tempting answer, but it ignores that the cost multiplies per series rather than adding per point.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "system-design-tradeoffs",
    "unitTitle": "System design tradeoffs"
  },
  {
    "id": "srs-takeaway-availability-durability-consistency-cost-1",
    "type": "takeaway",
    "prompt": "In Availability, durability, consistency, cost, what is a fundamental rule regarding: CAP theorem forces a choice between consistency and availability during network partitions; most systems choose AP and tune consistency per operation?",
    "answer": "CAP theorem forces a choice between consistency and availability during network partitions; most systems choose AP and tune consistency per operation.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "availability-durability-consistency-cost",
    "unitTitle": "Availability, durability, consistency, cost"
  },
  {
    "id": "srs-takeaway-availability-durability-consistency-cost-2",
    "type": "takeaway",
    "prompt": "In Availability, durability, consistency, cost, what is a fundamental rule regarding: Durability (D in ACID) requires synchronous WAL fsync; skipping it trades safety for speed?",
    "answer": "Durability (D in ACID) requires synchronous WAL fsync; skipping it trades safety for speed.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "availability-durability-consistency-cost",
    "unitTitle": "Availability, durability, consistency, cost"
  },
  {
    "id": "srs-takeaway-availability-durability-consistency-cost-3",
    "type": "takeaway",
    "prompt": "In Availability, durability, consistency, cost, what is a fundamental rule regarding: Cost is a constraint?",
    "answer": "Cost is a constraint: 5 9s availability costs orders of magnitude more than 3 9s.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "availability-durability-consistency-cost",
    "unitTitle": "Availability, durability, consistency, cost"
  },
  {
    "id": "srs-quiz-availability-durability-consistency-cost-c1",
    "type": "quiz",
    "prompt": "The shortener's database process is stopped, but its data files are intact and nothing has been lost. Which property of the redirect path has failed?",
    "answer": "Availability, because the operation cannot be used right now\n\nExplanation: The mappings still exist, so durability holds, but the redirect operation cannot be used, which is an availability failure. Durability is the tempting choice, but it asks whether acknowledged data survives, not whether it can be reached at this moment. The lesson stresses that up-but-lossy and safe-but-unreachable are different situations.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "availability-durability-consistency-cost",
    "unitTitle": "Availability, durability, consistency, cost"
  },
  {
    "id": "srs-quiz-availability-durability-consistency-cost-c2",
    "type": "quiz",
    "prompt": "A creator gets a success response and immediately opens the short link. The read goes to a replica 200 ms behind the primary and returns \"unknown code\". What is the straightforward first fix?",
    "answer": "Send the creator's first read to the database that accepted the write\n\nExplanation: The lesson's initial choice is to read from the database that accepted the creation, so a read that starts after a successful create can find the mapping. Immutability is the tempting answer, but the lesson notes it does not solve the first-read problem, because the row is missing on the replica rather than stale.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "availability-durability-consistency-cost",
    "unitTitle": "Availability, durability, consistency, cost"
  },
  {
    "id": "srs-quiz-availability-durability-consistency-cost-c3",
    "type": "quiz",
    "prompt": "An operator accidentally runs DELETE on the links table. The team has a synchronous replica in another zone but has never set up backups. What happens?",
    "answer": "The replica applies the same delete, so recovery needs a backup or restore that does not exist\n\nExplanation: A replica faithfully copies an accidental deletion. Protecting against operator error needs a backup and a tested restore, which cover a different failure than replicas do. Failing over is the tempting idea, but the standby already holds the same empty table.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "availability-durability-consistency-cost",
    "unitTitle": "Availability, durability, consistency, cost"
  },
  {
    "id": "srs-takeaway-back-of-the-envelope-capacity-planning-1",
    "type": "takeaway",
    "prompt": "In Back-of-the-envelope capacity planning, what is a fundamental rule regarding: Use powers of 10 for quick estimates?",
    "answer": "Use powers of 10 for quick estimates: 1 ms = 1,000 QPS single-core; 1 GB = 10^9 bytes.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "back-of-the-envelope-capacity-planning",
    "unitTitle": "Back-of-the-envelope capacity planning"
  },
  {
    "id": "srs-takeaway-back-of-the-envelope-capacity-planning-2",
    "type": "takeaway",
    "prompt": "In Back-of-the-envelope capacity planning, what is a fundamental rule regarding: Always estimate with replication factor (3x) and growth buffer (2-3 year horizon)?",
    "answer": "Always estimate with replication factor (3x) and growth buffer (2-3 year horizon).",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "back-of-the-envelope-capacity-planning",
    "unitTitle": "Back-of-the-envelope capacity planning"
  },
  {
    "id": "srs-takeaway-back-of-the-envelope-capacity-planning-3",
    "type": "takeaway",
    "prompt": "In Back-of-the-envelope capacity planning, what is a fundamental rule regarding: Bottleneck analysis?",
    "answer": "Bottleneck analysis: identify whether CPU, memory, disk I/O, or network bandwidth saturates first.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "back-of-the-envelope-capacity-planning",
    "unitTitle": "Back-of-the-envelope capacity planning"
  },
  {
    "id": "srs-quiz-back-of-the-envelope-capacity-planning-c1",
    "type": "quiz",
    "prompt": "Using the anchor that a day is about 86,400 seconds, roughly what average rate is 1 billion events per day?",
    "answer": "About 12,000 per second\n\nExplanation: 1 billion divided by 86,400 seconds is about 11,600, which rounds to roughly 12,000 per second (the same way 1 million per day is about 12 per second). That is only the average; the design still has to cover an assumed peak multiple, such as ten times higher.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "back-of-the-envelope-capacity-planning",
    "unitTitle": "Back-of-the-envelope capacity planning"
  },
  {
    "id": "srs-quiz-back-of-the-envelope-capacity-planning-c2",
    "type": "quiz",
    "prompt": "A service stores 2 million new records per day and keeps them for three 365-day years. Each record takes about 250 bytes including indexes. How much space does one copy of this data need?",
    "answer": "About 0.55 TB\n\nExplanation: 2 million times 1,095 days is 2.19 billion records, and at 250 bytes that is about 547 GB, or roughly 0.55 decimal TB. The lesson adds replicas, backups and write logs separately, and warns not to count indexes twice when the measured record size already includes them.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "back-of-the-envelope-capacity-planning",
    "unitTitle": "Back-of-the-envelope capacity planning"
  },
  {
    "id": "srs-quiz-back-of-the-envelope-capacity-planning-c3",
    "type": "quiz",
    "prompt": "The historical local test completed about 11,574 warm indexed lookups per second for 20 seconds, with none failing or taking longer than one second. What is the strongest claim this result supports?",
    "answer": "The simple indexed database design is worth testing further, including the app and event insert\n\nExplanation: The test used a local socket and left out both the application and the required event insert, so it only supports testing the simple design further. Claiming complete-service capacity is the tempting misreading, because that path, its writes, and growth over five years were never measured.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "back-of-the-envelope-capacity-planning",
    "unitTitle": "Back-of-the-envelope capacity planning"
  },
  {
    "id": "srs-takeaway-concurrency-vs-parallelism-1",
    "type": "takeaway",
    "prompt": "In How a server handles many requests, what is a fundamental rule regarding: Concurrency is handling multiple interleaved tasks; parallelism is executing tasks simultaneously on multiple cores?",
    "answer": "Concurrency is handling multiple interleaved tasks; parallelism is executing tasks simultaneously on multiple cores.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "concurrency-vs-parallelism",
    "unitTitle": "How a server handles many requests"
  },
  {
    "id": "srs-takeaway-concurrency-vs-parallelism-2",
    "type": "takeaway",
    "prompt": "In How a server handles many requests, what is a fundamental rule regarding: Thread-per-request models hit OS thread limits (~10K); event-loop and actor models scale to millions of concurrent connections?",
    "answer": "Thread-per-request models hit OS thread limits (~10K); event-loop and actor models scale to millions of concurrent connections.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "concurrency-vs-parallelism",
    "unitTitle": "How a server handles many requests"
  },
  {
    "id": "srs-takeaway-concurrency-vs-parallelism-3",
    "type": "takeaway",
    "prompt": "In How a server handles many requests, what is a fundamental rule regarding: Shared mutable state requires synchronization (locks, atomics); lock-free data structures trade memory for contention avoidance?",
    "answer": "Shared mutable state requires synchronization (locks, atomics); lock-free data structures trade memory for contention avoidance.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "concurrency-vs-parallelism",
    "unitTitle": "How a server handles many requests"
  },
  {
    "id": "srs-quiz-concurrency-vs-parallelism-c1",
    "type": "quiz",
    "prompt": "A Node.js handler declared async spends 200 ms hashing a password in plain JavaScript on the event-loop thread. What happens to other requests during that time?",
    "answer": "Their callbacks are blocked for about 200 ms, since async does not move CPU work off the loop\n\nExplanation: Declaring a function async does not move its computation to another processor, so a long CPU task on the loop thread stops other callbacks from running. The worker pool is the tempting answer, but it only runs certain platform operations; application CPU work needs worker threads, separate processes, or chunks that yield.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "concurrency-vs-parallelism",
    "unitTitle": "How a server handles many requests"
  },
  {
    "id": "srs-quiz-concurrency-vs-parallelism-c2",
    "type": "quiz",
    "prompt": "Each request needs 5 ms of CPU, waits 40 ms on the database, then needs 1 ms more of CPU. Thirty-two requests arrive at once on one core. However well the waits overlap, what is the minimum time to finish them all?",
    "answer": "About 192 ms, the total CPU work that one core must execute\n\nExplanation: Thirty-two requests times 6 ms of CPU is 192 ms, and overlapping waits cannot make one core run those instructions any sooner. The 46 ms answer is tempting because every wait can overlap, but the compute cannot, and 1,472 ms is what you get with no overlap at all.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "concurrency-vs-parallelism",
    "unitTitle": "How a server handles many requests"
  },
  {
    "id": "srs-quiz-concurrency-vs-parallelism-c3",
    "type": "quiz",
    "prompt": "You run 30 app instances, each with a database pool capped at 10, plus 20 background workers holding 2 connections each. The database allows 200 connections. What is the risk?",
    "answer": "Up to 340 connections, more than the database allows; per-process caps are not global\n\nExplanation: 30 times 10 plus 20 times 2 is 340, well over the limit of 200. The lesson warns that a per-process cap is not a system-wide cap, so concurrency must be budgeted across every instance and background worker. The first option is the tempting mistake of checking each process on its own.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "concurrency-vs-parallelism",
    "unitTitle": "How a server handles many requests"
  },
  {
    "id": "srs-takeaway-horizontal-vs-vertical-scaling-1",
    "type": "takeaway",
    "prompt": "In Horizontal vs vertical scaling, what is a fundamental rule regarding: Vertical scaling avoids distributed complexity but hits the largest-instance ceiling, price premiums at the top sizes, and single-point-of-failure risks?",
    "answer": "Vertical scaling avoids distributed complexity but hits the largest-instance ceiling, price premiums at the top sizes, and single-point-of-failure risks.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "horizontal-vs-vertical-scaling",
    "unitTitle": "Horizontal vs vertical scaling"
  },
  {
    "id": "srs-takeaway-horizontal-vs-vertical-scaling-2",
    "type": "takeaway",
    "prompt": "In Horizontal vs vertical scaling, what is a fundamental rule regarding: Horizontal scaling provides fault isolation and elastic headroom, but demands strict stateless application architecture?",
    "answer": "Horizontal scaling provides fault isolation and elastic headroom, but demands strict stateless application architecture.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "horizontal-vs-vertical-scaling",
    "unitTitle": "Horizontal vs vertical scaling"
  },
  {
    "id": "srs-takeaway-horizontal-vs-vertical-scaling-3",
    "type": "takeaway",
    "prompt": "In Horizontal vs vertical scaling, what is a fundamental rule regarding: Modern production systems scale the compute tier horizontally while scaling the database tier via read replicas and sharding?",
    "answer": "Modern production systems scale the compute tier horizontally while scaling the database tier via read replicas and sharding.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "horizontal-vs-vertical-scaling",
    "unitTitle": "Horizontal vs vertical scaling"
  },
  {
    "id": "srs-quiz-horizontal-vs-vertical-scaling-c1",
    "type": "quiz",
    "prompt": "What must be true of an application tier before you can scale it out by adding nodes behind a load balancer?",
    "answer": "The tier must be stateless, with sessions and in-flight jobs kept in a shared store\n\nExplanation: Horizontal scaling assumes any node can serve any request, so sessions, in-flight jobs and persistent data must move to shared stores such as Redis or a database. NUMA fit is a right-sizing concern for each node, and sticky routing at layer 7 is a workaround that brings back the problem of state living on one node.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "horizontal-vs-vertical-scaling",
    "unitTitle": "Horizontal vs vertical scaling"
  },
  {
    "id": "srs-quiz-horizontal-vs-vertical-scaling-c2",
    "type": "quiz",
    "prompt": "Load tests show one instance sustains 500 requests per second within its latency target. Peak traffic is 3,600 requests per second, and you must survive losing one instance. How many instances do you run?",
    "answer": "9\n\nExplanation: 3,600 divided by 500 is 7.2, which rounds up to 8 instances to carry the peak, plus 1 spare for N+1 makes 9. Eight is the tempting answer because it covers the peak, but losing one instance would then leave only 7 for traffic that needs 7.2.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "horizontal-vs-vertical-scaling",
    "unitTitle": "Horizontal vs vertical scaling"
  },
  {
    "id": "srs-quiz-horizontal-vs-vertical-scaling-c3",
    "type": "quiz",
    "prompt": "During a spike, the autoscaler adds 25 instances of a stateless REST API (short-lived requests) in one step. Each instance opens a 20-connection pool at startup. What is most likely to fail first?",
    "answer": "The database, which suddenly has to accept up to 500 new connections\n\nExplanation: This is the lesson's thundering scale-out failure: many new connection pools opening at once can overload the shared database. Idle new nodes is a real failure mode for long-lived WebSocket connections, but with short stateless requests the load balancer spreads new traffic onto them quickly.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "horizontal-vs-vertical-scaling",
    "unitTitle": "Horizontal vs vertical scaling"
  },
  {
    "id": "srs-takeaway-monolith-vs-microservices-1",
    "type": "takeaway",
    "prompt": "In Monolith vs microservices, what is a fundamental rule regarding: Monoliths maximize transactional integrity and developer velocity for small to medium teams with in-memory execution?",
    "answer": "Monoliths maximize transactional integrity and developer velocity for small to medium teams with in-memory execution.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "monolith-vs-microservices",
    "unitTitle": "Monolith vs microservices"
  },
  {
    "id": "srs-takeaway-monolith-vs-microservices-2",
    "type": "takeaway",
    "prompt": "In Monolith vs microservices, what is a fundamental rule regarding: Microservices solve organizational scaling and independent deployment, but introduce distributed network latency and partial failure modes?",
    "answer": "Microservices solve organizational scaling and independent deployment, but introduce distributed network latency and partial failure modes.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "monolith-vs-microservices",
    "unitTitle": "Monolith vs microservices"
  },
  {
    "id": "srs-takeaway-monolith-vs-microservices-3",
    "type": "takeaway",
    "prompt": "In Monolith vs microservices, what is a fundamental rule regarding: Never share databases between microservices; data encapsulation is the fundamental prerequisite for service independence?",
    "answer": "Never share databases between microservices; data encapsulation is the fundamental prerequisite for service independence.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "monolith-vs-microservices",
    "unitTitle": "Monolith vs microservices"
  },
  {
    "id": "srs-quiz-monolith-vs-microservices-c1",
    "type": "quiz",
    "prompt": "Once services have separate databases, why is two-phase commit rarely used to make cross-service writes atomic?",
    "answer": "Participants can be left blocked when the coordinator fails mid-protocol\n\nExplanation: Two-phase commit is atomic, but participants that have voted to commit can sit holding locks until the coordinator comes back, which is why services usually use sagas instead. The \"two\" in its name refers to its two phases, not a limit of two participants. Eventual consistency describes sagas, not 2PC.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "monolith-vs-microservices",
    "unitTitle": "Monolith vs microservices"
  },
  {
    "id": "srs-quiz-monolith-vs-microservices-c2",
    "type": "quiz",
    "prompt": "A checkout request calls four services one after another, and each is 99.9% available on its own. Ignoring the caller's own failures, what is the best availability the combined path can reach?",
    "answer": "About 99.6%, the product of four 99.9% values\n\nExplanation: Serial dependencies multiply: 0.999 to the fourth power is about 0.996. Assuming the path is as available as its weakest link is the tempting error, because any one of the four failing breaks the request. 96.1% is what you get from four services each meeting their latency target 99% of the time.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "monolith-vs-microservices",
    "unitTitle": "Monolith vs microservices"
  },
  {
    "id": "srs-quiz-monolith-vs-microservices-c3",
    "type": "quiz",
    "prompt": "Every new service adds its own pipelines, tracing, on-call and versioned APIs. Which situation most clearly justifies paying that cost?",
    "answer": "Card data handling must sit inside its own PCI DSS compliance boundary, apart from the rest\n\nExplanation: A separate security or compliance boundary is one of the lesson's listed signals. A team that still writes the shared tables would create a distributed monolith, paying network costs without gaining independence. Code that calls itself constantly and shares transactions is a reason to keep it in one process.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "monolith-vs-microservices",
    "unitTitle": "Monolith vs microservices"
  },
  {
    "id": "srs-takeaway-repository-pattern-1",
    "type": "takeaway",
    "prompt": "In Repository pattern, what is a fundamental rule regarding: The repository pattern mediates between the domain layer and data mapping using a collection-like interface?",
    "answer": "The repository pattern mediates between the domain layer and data mapping using a collection-like interface.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "repository-pattern",
    "unitTitle": "Repository pattern"
  },
  {
    "id": "srs-takeaway-repository-pattern-2",
    "type": "takeaway",
    "prompt": "In Repository pattern, what is a fundamental rule regarding: Avoid generic CRUD repositories that leak SQL query builders into domain business logic?",
    "answer": "Avoid generic CRUD repositories that leak SQL query builders into domain business logic.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "repository-pattern",
    "unitTitle": "Repository pattern"
  },
  {
    "id": "srs-takeaway-repository-pattern-3",
    "type": "takeaway",
    "prompt": "In Repository pattern, what is a fundamental rule regarding: Use explicit aggregate root methods to avoid lazy-loading N+1 query performance degradation?",
    "answer": "Use explicit aggregate root methods to avoid lazy-loading N+1 query performance degradation.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "repository-pattern",
    "unitTitle": "Repository pattern"
  },
  {
    "id": "srs-quiz-repository-pattern-c1",
    "type": "quiz",
    "prompt": "Why does a generic repository that accepts arbitrary query predicates or query builders from service code defeat the purpose of the pattern?",
    "answer": "Schema and query details leak into domain services, so storage changes spread to every caller\n\nExplanation: Once services pass database-specific filters in, knowledge of the schema spreads across domain code, and the abstraction no longer protects anything. The testability option is tempting, but the real problem is the leak itself; a leaky interface can still be faked, it just no longer hides the storage details.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "repository-pattern",
    "unitTitle": "Repository pattern"
  },
  {
    "id": "srs-quiz-repository-pattern-c2",
    "type": "quiz",
    "prompt": "Two requests generate the same short code at the same moment. How should the Postgres adapter implement insertIfAbsent so that exactly one returns Inserted and the other returns CodeTaken?",
    "answer": "INSERT ... ON CONFLICT (code) DO NOTHING, then check rows affected\n\nExplanation: Letting the unique constraint decide via ON CONFLICT keeps the check atomic inside the database, and the affected-row count tells you which result to return. Checking first and then inserting is the classic race, where both requests see no row. An in-process mutex does nothing across multiple app instances.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "repository-pattern",
    "unitTitle": "Repository pattern"
  },
  {
    "id": "srs-quiz-repository-pattern-c3",
    "type": "quiz",
    "prompt": "Checkout saves an order through OrderRepository and decrements stock through InventoryRepository, and each commits its own transaction. The process crashes between the two commits. What state are you left in?",
    "answer": "The order is committed but stock was never reduced, because nothing grouped the writes\n\nExplanation: Two separate commits can leave one done and the other not. The lesson says writes across repositories need a shared transaction, the Unit of Work pattern. Sharing a connection pool is the tempting answer, but a pool shares connections, not transactions, so it provides no atomicity.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "repository-pattern",
    "unitTitle": "Repository pattern"
  },
  {
    "id": "srs-takeaway-extensible-data-modeling-1",
    "type": "takeaway",
    "prompt": "In Extensible data modeling, what is a fundamental rule regarding: Hybrid relational models combine strict SQL columns for core foreign keys with JSONB for extensible payload attributes?",
    "answer": "Hybrid relational models combine strict SQL columns for core foreign keys with JSONB for extensible payload attributes.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "extensible-data-modeling",
    "unitTitle": "Extensible data modeling"
  },
  {
    "id": "srs-takeaway-extensible-data-modeling-2",
    "type": "takeaway",
    "prompt": "In Extensible data modeling, what is a fundamental rule regarding: Index semi-structured JSONB columns with PostgreSQL GIN indexes to maintain efficient query paths?",
    "answer": "Index semi-structured JSONB columns with PostgreSQL GIN indexes to maintain efficient query paths.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "extensible-data-modeling",
    "unitTitle": "Extensible data modeling"
  },
  {
    "id": "srs-takeaway-extensible-data-modeling-3",
    "type": "takeaway",
    "prompt": "In Extensible data modeling, what is a fundamental rule regarding: Apply the Expand-Migrate-Contract pattern for zero-downtime database schema migrations on active tables?",
    "answer": "Apply the Expand-Migrate-Contract pattern for zero-downtime database schema migrations on active tables.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "extensible-data-modeling",
    "unitTitle": "Extensible data modeling"
  },
  {
    "id": "srs-quiz-extensible-data-modeling-c1",
    "type": "quiz",
    "prompt": "Why does the lesson treat Entity-Attribute-Value tables as a last resort compared with a JSONB column?",
    "answer": "Filtering on several attributes needs repeated self-joins, and per-attribute constraints are lost\n\nExplanation: EAV allows unlimited runtime attributes, but querying several attributes turns into a pile of self-joins, values are stored as text, and there are no native foreign keys or per-attribute constraints. The migration option is backwards: runtime flexibility without schema changes is exactly EAV's appeal.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "extensible-data-modeling",
    "unitTitle": "Extensible data modeling"
  },
  {
    "id": "srs-quiz-extensible-data-modeling-c2",
    "type": "quiz",
    "prompt": "You backfill a new column on 1.2 billion rows in batches of 10,000 rows per transaction, throttled to 1,500 batches per minute to keep replica lag low. About how long does the backfill take?",
    "answer": "About 80 minutes\n\nExplanation: 1,500 batches of 10,000 rows is 15 million rows per minute, and 1.2 billion divided by 15 million is 80 minutes. The lesson's own example (20 million rows per minute for 1.8 billion rows) takes about 90 minutes, and it throttles on purpose because backfills that run too fast cause replica lag and lock contention.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "extensible-data-modeling",
    "unitTitle": "Extensible data modeling"
  },
  {
    "id": "srs-quiz-extensible-data-modeling-c3",
    "type": "quiz",
    "prompt": "Reads have switched to destination_url and the backfill check shows zero rows where the two columns differ. When is it safe to drop the old url column?",
    "answer": "Only after writes to url stop and no running version, batch job, or logged query still uses it\n\nExplanation: Contract is the one step you cannot undo, so first stop writing url, then confirm from query logs that no deploy or batch job still reads it. Checking only the web nodes is tempting, but an old batch job reading url is exactly the failure the lesson warns about. How fast the drop runs does not make it safe.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "extensible-data-modeling",
    "unitTitle": "Extensible data modeling"
  },
  {
    "id": "srs-takeaway-cost-aware-architecture-1",
    "type": "takeaway",
    "prompt": "In Cost-aware architecture, what is a fundamental rule regarding: Cross-Availability-Zone data transfer is a major hidden cloud cost; use AZ-aware routing and payload compression?",
    "answer": "Cross-Availability-Zone data transfer is a major hidden cloud cost; use AZ-aware routing and payload compression.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "cost-aware-architecture",
    "unitTitle": "Cost-aware architecture"
  },
  {
    "id": "srs-takeaway-cost-aware-architecture-2",
    "type": "takeaway",
    "prompt": "In Cost-aware architecture, what is a fundamental rule regarding: Tier storage automatically using lifecycle rules?",
    "answer": "Tier storage automatically using lifecycle rules: S3 Standard for hot data, Glacier Deep Archive for compliance logs.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "cost-aware-architecture",
    "unitTitle": "Cost-aware architecture"
  },
  {
    "id": "srs-takeaway-cost-aware-architecture-3",
    "type": "takeaway",
    "prompt": "In Cost-aware architecture, what is a fundamental rule regarding: Blend On-Demand baseline compute with Spot/Preemptible instances for fault-tolerant background workloads?",
    "answer": "Blend On-Demand baseline compute with Spot/Preemptible instances for fault-tolerant background workloads.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "cost-aware-architecture",
    "unitTitle": "Cost-aware architecture"
  },
  {
    "id": "srs-quiz-cost-aware-architecture-c1",
    "type": "quiz",
    "prompt": "Spot or preemptible capacity can be reclaimed at short notice. Which workload is the poorest fit for it?",
    "answer": "A single stateful primary database\n\nExplanation: Spot suits interruptible, retryable work, while a single stateful primary loses availability, and possibly recent writes, whenever it is reclaimed. Queue workers can look risky, but a retried job simply runs again on another instance, which is why the lesson lists them as good Spot candidates.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "cost-aware-architecture",
    "unitTitle": "Cost-aware architecture"
  },
  {
    "id": "srs-quiz-cost-aware-architecture-c2",
    "type": "quiz",
    "prompt": "Traffic grows to 200 million redirects per day with about 1 kB per response including headers. At an illustrative 0.09 USD per GB of internet egress, roughly what is the monthly egress bill?",
    "answer": "About 540 USD\n\nExplanation: 200 million times 1 kB is 200 GB per day, about 6 TB in a 30-day month, and 6,000 GB times 0.09 USD is about 540 USD. The lesson's point still stands: for this product, the cost of retaining events dominates, while egress would dominate for a media product.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "cost-aware-architecture",
    "unitTitle": "Cost-aware architecture"
  },
  {
    "id": "srs-quiz-cost-aware-architecture-c3",
    "type": "quiz",
    "prompt": "To cut storage cost, a team moves product thumbnails that are viewed thousands of times a day from S3 Standard to Standard-Infrequent Access. What is the likely result?",
    "answer": "Retrieval fees per GB outweigh the storage savings, raising the total bill\n\nExplanation: Infrequent-access tiers charge per GB retrieved, so frequently read data can cost more there than in Standard. Hours-long restores apply to Glacier archive tiers, not Standard-IA. The 30-day minimum means you are billed for at least 30 days, not that objects are deleted.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "cost-aware-architecture",
    "unitTitle": "Cost-aware architecture"
  },
  {
    "id": "srs-takeaway-when-not-to-add-infrastructure-1",
    "type": "takeaway",
    "prompt": "In When not to add infrastructure, what is a fundamental rule regarding: Understand the requirements clearly before designing?",
    "answer": "Understand the requirements clearly before designing.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "when-not-to-add-infrastructure",
    "unitTitle": "When not to add infrastructure"
  },
  {
    "id": "srs-takeaway-when-not-to-add-infrastructure-2",
    "type": "takeaway",
    "prompt": "In When not to add infrastructure, what is a fundamental rule regarding: Identify non-functional requirements and scale?",
    "answer": "Identify non-functional requirements and scale.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "when-not-to-add-infrastructure",
    "unitTitle": "When not to add infrastructure"
  },
  {
    "id": "srs-takeaway-when-not-to-add-infrastructure-3",
    "type": "takeaway",
    "prompt": "In When not to add infrastructure, what is a fundamental rule regarding: Always look out for failure and operational constraints?",
    "answer": "Always look out for failure and operational constraints.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "when-not-to-add-infrastructure",
    "unitTitle": "When not to add infrastructure"
  },
  {
    "id": "srs-quiz-when-not-to-add-infrastructure-c1",
    "type": "quiz",
    "prompt": "Which of these is a sound starting point for considering a cache in front of link lookups?",
    "answer": "Repeated destination lookups dominate a measured latency problem that query fixes did not solve\n\nExplanation: The lesson asks you to name the property the current design is missing, with evidence and a result to compare against afterward. \"The database will get large\" is the tempting reason, but table size alone does not show that a read path misses its target.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "when-not-to-add-infrastructure",
    "unitTitle": "When not to add infrastructure"
  },
  {
    "id": "srs-quiz-when-not-to-add-infrastructure-c2",
    "type": "quiz",
    "prompt": "Each redirect's event must survive a crash, and a teammate proposes a streaming platform so report calculation stays out of the redirect path. What should you try first?",
    "answer": "Write each event to the existing database and calculate reports later in the background\n\nExplanation: The first design can store the event in the existing database and compute reports later; a separate queue becomes worth it only when that path stops meeting the requirement. The in-memory queue is tempting because it is fast, but returning success before the event is durably accepted breaks the crash-survival promise.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "when-not-to-add-infrastructure",
    "unitTitle": "When not to add infrastructure"
  },
  {
    "id": "srs-quiz-when-not-to-add-infrastructure-c3",
    "type": "quiz",
    "prompt": "You approve a cache for link lookups. Which pair of failure paths does the lesson say you must trace before relying on it?",
    "answer": "How fast a disabled link stops being served, and whether the database copes when the cache is cold\n\nExplanation: A cache adds a second place that can serve an old answer, which matters when an unsafe link is disabled, and removing it puts full load back on the database. Eviction tuning matters for efficiency, but it is not the new correctness and availability risk the cache introduces.",
    "category": "Foundations & System Invariants",
    "track": "Architectural Foundations & Workload Modeling",
    "topicSlug": "when-not-to-add-infrastructure",
    "unitTitle": "When not to add infrastructure"
  },
  {
    "id": "srs-takeaway-relational-database-design-1",
    "type": "takeaway",
    "prompt": "In Relational database design, what is a fundamental rule regarding: Relational design uses normalization (1NF, 2NF, 3NF) to eliminate update anomalies and enforce constraints?",
    "answer": "Relational design uses normalization (1NF, 2NF, 3NF) to eliminate update anomalies and enforce constraints.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-design",
    "unitTitle": "Relational database design"
  },
  {
    "id": "srs-takeaway-relational-database-design-2",
    "type": "takeaway",
    "prompt": "In Relational database design, what is a fundamental rule regarding: Selective denormalization optimizes read-heavy queries by embedding immutable point-in-time attributes?",
    "answer": "Selective denormalization optimizes read-heavy queries by embedding immutable point-in-time attributes.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-design",
    "unitTitle": "Relational database design"
  },
  {
    "id": "srs-takeaway-relational-database-design-3",
    "type": "takeaway",
    "prompt": "In Relational database design, what is a fundamental rule regarding: Foreign key constraints enforce referential integrity at the database layer, preventing dangling records?",
    "answer": "Foreign key constraints enforce referential integrity at the database layer, preventing dangling records.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-design",
    "unitTitle": "Relational database design"
  },
  {
    "id": "srs-quiz-relational-database-design-c1",
    "type": "quiz",
    "prompt": "A report joins orders (20,000 rows) and customers (5,000 rows), but the ON clause was dropped during a refactor and nothing filters the result. How many rows does the query produce?",
    "answer": "100,000,000 rows, one for every pairing of an order with a customer\n\nExplanation: Without a join predicate, the join becomes a Cartesian product with 20,000 times 5,000 rows, which the lesson calls almost always a bug that can exhaust memory. Expecting 20,000 rows is the tempting assumption, but nothing tells the database which customer belongs to which order.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-design",
    "unitTitle": "Relational database design"
  },
  {
    "id": "srs-quiz-relational-database-design-c2",
    "type": "quiz",
    "prompt": "A table orders(order_id PRIMARY KEY, customer_id, customer_email, total_amount) stores the customer's current email on every order. Which normal form does it break, and why?",
    "answer": "3NF, because customer_email depends on customer_id, a non-key column\n\nExplanation: customer_email is determined by customer_id rather than by the order key, which is a transitive dependency and breaks 3NF: changing an email means updating every order. 2NF is the tempting choice, but partial dependencies only arise with composite keys, and order_id is a single column.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-design",
    "unitTitle": "Relational database design"
  },
  {
    "id": "srs-quiz-relational-database-design-c3",
    "type": "quiz",
    "prompt": "order_items.order_id has a foreign key to orders.id, but no index. A nightly job deletes 50,000 old orders. What is likely to hurt first?",
    "answer": "Each parent delete scans order_items for children, making the job slow and holding locks longer\n\nExplanation: To enforce the constraint on a parent delete, the database must find child rows, and without an index on order_id that means a sequential scan of order_items for every deleted order. The \"primary key index\" option is tempting, but that index only speeds up checks from child to parent, such as on inserts, not the reverse lookup a delete needs.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-design",
    "unitTitle": "Relational database design"
  },
  {
    "id": "srs-takeaway-sql-backed-key-value-store-1",
    "type": "takeaway",
    "prompt": "In Design: a key-value store on SQL, what is a fundamental rule regarding: SQL engines can provide reliable ACID key-value storage using JSONB and optimistic concurrency control (version checks)?",
    "answer": "SQL engines can provide reliable ACID key-value storage using JSONB and optimistic concurrency control (version checks).",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sql-backed-key-value-store",
    "unitTitle": "Design: a key-value store on SQL"
  },
  {
    "id": "srs-takeaway-sql-backed-key-value-store-2",
    "type": "takeaway",
    "prompt": "In Design: a key-value store on SQL, what is a fundamental rule regarding: Partial indexes on nullable expiration timestamps enable fast background cleanup without scanning the full table?",
    "answer": "Partial indexes on nullable expiration timestamps enable fast background cleanup without scanning the full table.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sql-backed-key-value-store",
    "unitTitle": "Design: a key-value store on SQL"
  },
  {
    "id": "srs-takeaway-sql-backed-key-value-store-3",
    "type": "takeaway",
    "prompt": "In Design: a key-value store on SQL, what is a fundamental rule regarding: Bounded batch deletions prevent long-running transactions, WAL bursts and replication lag during key reaping?",
    "answer": "Bounded batch deletions prevent long-running transactions, WAL bursts and replication lag during key reaping.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sql-backed-key-value-store",
    "unitTitle": "Design: a key-value store on SQL"
  },
  {
    "id": "srs-quiz-sql-backed-key-value-store-c1",
    "type": "quiz",
    "prompt": "A client read feature_flags at version 4, then ran UPDATE kv_store SET value = ..., version = version + 1 WHERE key = 'feature_flags' AND version = 4. It reports 0 rows updated. What does that mean?",
    "answer": "Another writer changed the row after the read; re-read the new version and retry\n\nExplanation: The version predicate makes the update conditional. Zero rows means the version is no longer 4 because someone else won the race, so the client should re-read and try again. Resending the same statement is the tempting mistake: it will keep failing, and replacing it with a blind update would bring back the lost update.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sql-backed-key-value-store",
    "unitTitle": "Design: a key-value store on SQL"
  },
  {
    "id": "srs-quiz-sql-backed-key-value-store-c2",
    "type": "quiz",
    "prompt": "Session reads use only WHERE key = ?, and a reaper deletes expired rows every five minutes in batches of 1,000. During a traffic spike, the reaper falls an hour behind. What do users see?",
    "answer": "Expired sessions keep working until reaped; reads must filter on expires_at themselves\n\nExplanation: The sweeper exists to reclaim space, not to enforce expiry, so an expired row stays readable until it is deleted unless every read also requires expires_at to be null or later than now(). The partial index is tempting, but indexes change how rows are found, not which rows a query returns.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sql-backed-key-value-store",
    "unitTitle": "Design: a key-value store on SQL"
  },
  {
    "id": "srs-quiz-sql-backed-key-value-store-c3",
    "type": "quiz",
    "prompt": "Using the lesson's numbers (about 500 bytes per row and about 14 rows per 8 KB page at fillfactor 90), roughly how large is the heap for 30 million session keys?",
    "answer": "About 17 GB\n\nExplanation: 30 million rows divided by 14 per page is about 2.1 million pages, and at 8 KB each that is roughly 17 GB. 15 GB is the tempting answer from multiplying 30 million by 500 bytes, but that ignores the free space fillfactor leaves on each page and the space lost at page boundaries.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sql-backed-key-value-store",
    "unitTitle": "Design: a key-value store on SQL"
  },
  {
    "id": "srs-takeaway-database-indexing-1",
    "type": "takeaway",
    "prompt": "In Database indexing, what is a fundamental rule regarding: Indexes map column values to row locators (physical tuple IDs in PostgreSQL heaps, primary-key values in InnoDB secondary indexes), bypassing table scans?",
    "answer": "Indexes map column values to row locators (physical tuple IDs in PostgreSQL heaps, primary-key values in InnoDB secondary indexes), bypassing table scans.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-indexing",
    "unitTitle": "Database indexing"
  },
  {
    "id": "srs-takeaway-database-indexing-2",
    "type": "takeaway",
    "prompt": "In Database indexing, what is a fundamental rule regarding: Composite indexes support efficient seeks only when query predicates match the leftmost prefix of the indexed columns (skip scans are a limited exception)?",
    "answer": "Composite indexes support efficient seeks only when query predicates match the leftmost prefix of the indexed columns (skip scans are a limited exception).",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-indexing",
    "unitTitle": "Database indexing"
  },
  {
    "id": "srs-takeaway-database-indexing-3",
    "type": "takeaway",
    "prompt": "In Database indexing, what is a fundamental rule regarding: Covering indexes (INCLUDE clause) eliminate heap reads entirely by satisfying queries directly from index pages?",
    "answer": "Covering indexes (INCLUDE clause) eliminate heap reads entirely by satisfying queries directly from index pages.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-indexing",
    "unitTitle": "Database indexing"
  },
  {
    "id": "srs-quiz-database-indexing-c1",
    "type": "quiz",
    "prompt": "Given an index on (tenant_id, status, created_at), which WHERE clause can use it for an efficient seek?",
    "answer": "WHERE tenant_id = ? AND status = ?\n\nExplanation: The B-tree is sorted by tenant_id first, so only predicates that include the leading column can seek to a contiguous slice. Filtering on status plus created_at is the tempting choice because it covers two of the indexed columns, but without tenant_id the planner can at best scan the whole index or, on some engines, use a skip scan.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-indexing",
    "unitTitle": "Database indexing"
  },
  {
    "id": "srs-quiz-database-indexing-c2",
    "type": "quiz",
    "prompt": "A hot query is WHERE tenant_id = ? AND status = ? AND created_at after ? ORDER BY created_at. Which single index lets it seek to one slice and read rows in order with no sort step?",
    "answer": "(tenant_id, status, created_at)\n\nExplanation: Equality columns go first and the range and sort column goes last, so all matching rows sit together already ordered by created_at. Putting created_at second, as in the tempting (tenant_id, created_at, status), means the status filter must be checked row by row across the tenant's whole time range.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-indexing",
    "unitTitle": "Database indexing"
  },
  {
    "id": "srs-quiz-database-indexing-c3",
    "type": "quiz",
    "prompt": "EXPLAIN ANALYZE shows an Index Only Scan on a covering index, but Heap Fetches is nearly equal to the number of rows returned. The table is updated heavily. What is the most likely cause?",
    "answer": "Many pages are not marked all-visible in the visibility map, so vacuum is falling behind\n\nExplanation: PostgreSQL can skip the heap only for pages the visibility map marks all-visible, and vacuum is what sets those bits, so heavy updates without enough vacuuming force heap fetches. The buffer-size option is tempting, but cache misses make reads slower; they do not turn index-only scans into heap fetches.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-indexing",
    "unitTitle": "Database indexing"
  },
  {
    "id": "srs-takeaway-b-tree-1",
    "type": "takeaway",
    "prompt": "In B-tree, what is a fundamental rule regarding: B+ Trees maximize fanout (100-1000 keys per 8KB page), keeping tree depth at 3-4 levels for multi-million row datasets?",
    "answer": "B+ Trees maximize fanout (100-1000 keys per 8KB page), keeping tree depth at 3-4 levels for multi-million row datasets.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "b-tree",
    "unitTitle": "B-tree"
  },
  {
    "id": "srs-takeaway-b-tree-2",
    "type": "takeaway",
    "prompt": "In B-tree, what is a fundamental rule regarding: Internal nodes contain only separator keys, while leaf nodes store all data pointers?",
    "answer": "Internal nodes contain only separator keys, while leaf nodes store all data pointers.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "b-tree",
    "unitTitle": "B-tree"
  },
  {
    "id": "srs-takeaway-b-tree-3",
    "type": "takeaway",
    "prompt": "In B-tree, what is a fundamental rule regarding: Leaf nodes form a doubly linked list, enabling fast linear range scans without re-traversing parent nodes?",
    "answer": "Leaf nodes form a doubly linked list, enabling fast linear range scans without re-traversing parent nodes.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "b-tree",
    "unitTitle": "B-tree"
  },
  {
    "id": "srs-quiz-b-tree-c1",
    "type": "quiz",
    "prompt": "How does a B+ tree answer WHERE age BETWEEN 25 AND 35?",
    "answer": "It descends once to the first matching leaf, then follows the linked leaves\n\nExplanation: A B+ tree finds the first leaf in O(log N) and then walks the doubly linked leaf pages with no further tree traversals. Reading values from internal nodes is the tempting choice, but in a B+ tree the internal nodes hold only separator keys and child pointers, and all entries live in the leaves.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "b-tree",
    "unitTitle": "B-tree"
  },
  {
    "id": "srs-quiz-b-tree-c2",
    "type": "quiz",
    "prompt": "A BIGINT index has a fanout of about 400 entries per 8 KB page. How many levels does it need for 1 billion rows?",
    "answer": "4 levels\n\nExplanation: Three levels cover 400 cubed, or 64 million entries, which is too few, while four levels cover 400 to the fourth power, about 25.6 billion. Seven levels is what you might guess by thinking of a binary tree; high fanout is exactly why B+ trees stay only 3 or 4 levels deep.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "b-tree",
    "unitTitle": "B-tree"
  },
  {
    "id": "srs-quiz-b-tree-c3",
    "type": "quiz",
    "prompt": "A write-heavy table switches its primary key from BIGSERIAL to UUIDv4. The index grows to 20 GB, but only 4 GB of cache is available. What degrades?",
    "answer": "Inserts hit random leaves, so most miss the cache, and 50/50 splits leave pages about 70% full\n\nExplanation: Sequential keys keep the working set at the right edge of the tree, while random keys spread inserts across the whole index, causing cache misses, random reads and half-full pages after splits. A taller tree is the tempting guess, but a B+ tree stays balanced, and depth is almost never the problem; cache misses on leaves are.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "b-tree",
    "unitTitle": "B-tree"
  },
  {
    "id": "srs-takeaway-query-planning-1",
    "type": "takeaway",
    "prompt": "In Query planning, what is a fundamental rule regarding: The Cost-Based Optimizer chooses execution paths using statistical histograms and cost formulas?",
    "answer": "The Cost-Based Optimizer chooses execution paths using statistical histograms and cost formulas.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "query-planning",
    "unitTitle": "Query planning"
  },
  {
    "id": "srs-takeaway-query-planning-2",
    "type": "takeaway",
    "prompt": "In Query planning, what is a fundamental rule regarding: The three core join physical operators are Nested Loop, Hash Join, and Merge Join?",
    "answer": "The three core join physical operators are Nested Loop, Hash Join, and Merge Join.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "query-planning",
    "unitTitle": "Query planning"
  },
  {
    "id": "srs-takeaway-query-planning-3",
    "type": "takeaway",
    "prompt": "In Query planning, what is a fundamental rule regarding: Stale statistics cause catastrophic plan regressions; ensure autovacuum and ANALYZE run regularly?",
    "answer": "Stale statistics cause catastrophic plan regressions; ensure autovacuum and ANALYZE run regularly.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "query-planning",
    "unitTitle": "Query planning"
  },
  {
    "id": "srs-quiz-query-planning-c1",
    "type": "quiz",
    "prompt": "Two large tables are joined on equality, neither has a useful index on the join key, and the smaller side fits in work_mem. Which join algorithm fits best?",
    "answer": "A hash join, building a table on the smaller input and streaming the larger\n\nExplanation: A hash join builds an in-memory hash table on the smaller input and streams the larger one, at roughly O(N + M), which suits large unindexed equi-joins. A merge join can also work, but without sorted input it pays the full sorting cost on both sides, and a nested loop without an index on the inner side scans that table again for every outer row.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "query-planning",
    "unitTitle": "Query planning"
  },
  {
    "id": "srs-quiz-query-planning-c2",
    "type": "quiz",
    "prompt": "In EXPLAIN ANALYZE, the inner index scan of a nested loop shows actual time of 0.05 ms and loops=40,000. Roughly how much time does that inner side account for?",
    "answer": "About 2 seconds\n\nExplanation: Times on the inner side of a nested loop are per loop, so 0.05 ms times 40,000 loops is about 2,000 ms. Reading 0.05 ms at face value is the classic mistake that makes an expensive inner side look free.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "query-planning",
    "unitTitle": "Query planning"
  },
  {
    "id": "srs-quiz-query-planning-c3",
    "type": "quiz",
    "prompt": "The customers scan shows rows=50 estimated against rows=50000 actual, and the planner chose a nested loop that probes orders 50,000 times. What is the right fix?",
    "answer": "Run ANALYZE customers so the row estimate matches reality again\n\nExplanation: The first node with a large estimate mismatch is the root cause, and here it comes from stale statistics, so refreshing them lets the planner pick the right join by itself. Disabling nested loops is the tempting quick fix, but it fixes today's query and can break others as the data changes.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "query-planning",
    "unitTitle": "Query planning"
  },
  {
    "id": "srs-takeaway-database-locking-and-isolation-1",
    "type": "takeaway",
    "prompt": "In Database locking and isolation, what is a fundamental rule regarding: SQL isolation levels trade off concurrency throughput against anomaly prevention?",
    "answer": "SQL isolation levels trade off concurrency throughput against anomaly prevention.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-locking-and-isolation",
    "unitTitle": "Database locking and isolation"
  },
  {
    "id": "srs-takeaway-database-locking-and-isolation-2",
    "type": "takeaway",
    "prompt": "In Database locking and isolation, what is a fundamental rule regarding: PostgreSQL Read Committed generates a new snapshot for each query statement; Repeatable Read holds a single snapshot for the entire transaction?",
    "answer": "PostgreSQL Read Committed generates a new snapshot for each query statement; Repeatable Read holds a single snapshot for the entire transaction.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-locking-and-isolation",
    "unitTitle": "Database locking and isolation"
  },
  {
    "id": "srs-takeaway-database-locking-and-isolation-3",
    "type": "takeaway",
    "prompt": "In Database locking and isolation, what is a fundamental rule regarding: Write Skew occurs under Repeatable Read when disjoint updates violate cross-row constraints; Serializable isolation or explicit locking (SELECT ?",
    "answer": "Write Skew occurs under Repeatable Read when disjoint updates violate cross-row constraints; Serializable isolation or explicit locking (SELECT ... FOR UPDATE) is required.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-locking-and-isolation",
    "unitTitle": "Database locking and isolation"
  },
  {
    "id": "srs-quiz-database-locking-and-isolation-c1",
    "type": "quiz",
    "prompt": "Which anomaly can still occur under PostgreSQL's Repeatable Read isolation level?",
    "answer": "Write skew\n\nExplanation: PostgreSQL's snapshot-based Repeatable Read prevents dirty reads, non-repeatable reads and, unlike the SQL standard's minimum, phantoms too, but it still allows write skew. Phantoms are the tempting answer because the standard permits them at this level, but PostgreSQL's single transaction-wide snapshot rules them out.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-locking-and-isolation",
    "unitTitle": "Database locking and isolation"
  },
  {
    "id": "srs-quiz-database-locking-and-isolation-c2",
    "type": "quiz",
    "prompt": "Two on-call doctors request leave at the same moment. Each transaction checks that 2 are on call, then updates only its own row. Both commit and nobody is left on call. Which change prevents this?",
    "answer": "Use Serializable and retry on SQLSTATE 40001, or lock the checked rows FOR UPDATE\n\nExplanation: This is write skew: each transaction updates a different row, so no write-write conflict happens, and snapshot-based Repeatable Read allows it. Serializable (SSI aborts one transaction) or explicitly locking the rows the check depends on closes the gap. Repeatable Read is the tempting choice, but a stable snapshot is exactly why both checks see 2.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-locking-and-isolation",
    "unitTitle": "Database locking and isolation"
  },
  {
    "id": "srs-quiz-database-locking-and-isolation-c3",
    "type": "quiz",
    "prompt": "At Read Committed, two requests each run SELECT balance (both see 100), then UPDATE accounts SET balance = 110 and COMMIT. What is the final balance, and what is the simplest fix?",
    "answer": "110, fixed by writing UPDATE accounts SET balance = balance + 10 instead\n\nExplanation: Both transactions write the literal value 110 that they computed, so one increment is lost silently. An atomic balance = balance + 10 lets the row lock serialize the two writers. The first option is tempting: the second UPDATE does wait for the lock, but it still writes the stale 110 it calculated from its earlier read.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-locking-and-isolation",
    "unitTitle": "Database locking and isolation"
  },
  {
    "id": "srs-takeaway-mvcc-1",
    "type": "takeaway",
    "prompt": "In MVCC, what is a fundamental rule regarding: MVCC ensures readers never block writers and writers never block readers by maintaining multiple tuple versions?",
    "answer": "MVCC ensures readers never block writers and writers never block readers by maintaining multiple tuple versions.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "mvcc",
    "unitTitle": "MVCC"
  },
  {
    "id": "srs-takeaway-mvcc-2",
    "type": "takeaway",
    "prompt": "In MVCC, what is a fundamental rule regarding: In PostgreSQL, updates never modify data in place; they set xmax on the old tuple and insert a new tuple with xmin (InnoDB and Oracle update in place and keep old versions in undo)?",
    "answer": "In PostgreSQL, updates never modify data in place; they set xmax on the old tuple and insert a new tuple with xmin (InnoDB and Oracle update in place and keep old versions in undo).",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "mvcc",
    "unitTitle": "MVCC"
  },
  {
    "id": "srs-takeaway-mvcc-3",
    "type": "takeaway",
    "prompt": "In MVCC, what is a fundamental rule regarding: Dead tuples accumulate on disk until VACUUM marks their space reusable (VACUUM FULL or pg_repack is needed to shrink the file)?",
    "answer": "Dead tuples accumulate on disk until VACUUM marks their space reusable (VACUUM FULL or pg_repack is needed to shrink the file).",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "mvcc",
    "unitTitle": "MVCC"
  },
  {
    "id": "srs-quiz-mvcc-c1",
    "type": "quiz",
    "prompt": "In PostgreSQL, what physically happens when a transaction runs UPDATE users SET email = 'new@corp.com' WHERE id = 1?",
    "answer": "It sets xmax on the old tuple and writes a new tuple whose xmin is the current transaction\n\nExplanation: PostgreSQL never overwrites in place. The old version is marked with the updater's ID in xmax and a new version is appended, so older snapshots can still read the old tuple. The undo-log option is tempting because it is how InnoDB and Oracle work, not PostgreSQL.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "mvcc",
    "unitTitle": "MVCC"
  },
  {
    "id": "srs-quiz-mvcc-c2",
    "type": "quiz",
    "prompt": "At Repeatable Read, T200 took its snapshot before T201 updated and committed row id=1. T200 still reads the old email. What happens if T200 now tries to UPDATE that same row?",
    "answer": "It fails with \"could not serialize access due to concurrent update\" and must retry\n\nExplanation: At Repeatable Read, PostgreSQL will not let a transaction update a row that changed after its snapshot, so it raises a serialization error, and the application retries. Waiting and then updating the new version is the tempting answer, because that is how Read Committed behaves, where each statement gets a fresh snapshot.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "mvcc",
    "unitTitle": "MVCC"
  },
  {
    "id": "srs-quiz-mvcc-c3",
    "type": "quiz",
    "prompt": "A session opened a transaction six hours ago and has sat idle in transaction ever since. Autovacuum runs normally. What happens to a hot table doing 1,000 updates per second?",
    "answer": "Dead tuples newer than its snapshot cannot be removed, so the table bloats by millions\n\nExplanation: Vacuum can only reclaim versions that no active snapshot might still see, so one old transaction holds back cleanup, and about 21 million dead tuples pile up over six hours on this table alone. \"Only the tables it touched\" is tempting, but the limit is its snapshot's age, which applies to every table. The fix is idle_in_transaction_session_timeout.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "mvcc",
    "unitTitle": "MVCC"
  },
  {
    "id": "srs-takeaway-database-wal-and-recovery-1",
    "type": "takeaway",
    "prompt": "In Database WAL and recovery, what is a fundamental rule regarding: The WAL invariant guarantees durability by flushing sequential append-only logs before dirty data pages touch disk?",
    "answer": "The WAL invariant guarantees durability by flushing sequential append-only logs before dirty data pages touch disk.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-wal-and-recovery",
    "unitTitle": "Database WAL and recovery"
  },
  {
    "id": "srs-takeaway-database-wal-and-recovery-2",
    "type": "takeaway",
    "prompt": "In Database WAL and recovery, what is a fundamental rule regarding: Transactions commit as soon as their WAL records are fsynced; data pages are flushed asynchronously in the background?",
    "answer": "Transactions commit as soon as their WAL records are fsynced; data pages are flushed asynchronously in the background.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-wal-and-recovery",
    "unitTitle": "Database WAL and recovery"
  },
  {
    "id": "srs-takeaway-database-wal-and-recovery-3",
    "type": "takeaway",
    "prompt": "In Database WAL and recovery, what is a fundamental rule regarding: The ARIES recovery protocol restores consistency after sudden power failure via Analysis, Redo, and Undo phases?",
    "answer": "The ARIES recovery protocol restores consistency after sudden power failure via Analysis, Redo, and Undo phases.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-wal-and-recovery",
    "unitTitle": "Database WAL and recovery"
  },
  {
    "id": "srs-quiz-database-wal-and-recovery-c1",
    "type": "quiz",
    "prompt": "Under the WAL invariant, at what point can the database safely reply COMMIT OK to the client?",
    "answer": "Once the transaction's WAL records have been flushed to stable storage\n\nExplanation: Durability comes from the fsynced log: after a crash, replaying the WAL rebuilds any pages that had not reached disk. Waiting for the table pages is the tempting answer, but data pages are flushed lazily, often minutes later at a checkpoint, and that is exactly what makes WAL fast.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-wal-and-recovery",
    "unitTitle": "Database WAL and recovery"
  },
  {
    "id": "srs-quiz-database-wal-and-recovery-c2",
    "type": "quiz",
    "prompt": "A cloud volume takes 4 ms per fsync. What is the commit ceiling for a single connection with one fsync per commit, and what is it if group commit makes 40 sessions durable per fsync?",
    "answer": "About 250 commits per second, and about 10,000 with group commit\n\nExplanation: One fsync every 4 ms allows 250 per second, and grouping 40 commits into each fsync gives about 10,000. \"The disk is the limit\" is tempting, but group commit changes how many commits each fsync makes durable, not how fast the fsync itself is.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-wal-and-recovery",
    "unitTitle": "Database WAL and recovery"
  },
  {
    "id": "srs-quiz-database-wal-and-recovery-c3",
    "type": "quiz",
    "prompt": "To speed up writes, one engineer proposes synchronous_commit = off, and another proposes fsync = off. How do the risks differ after a power loss?",
    "answer": "synchronous_commit = off may lose recent commits but stays consistent; fsync = off can corrupt it\n\nExplanation: synchronous_commit = off only acknowledges before the WAL flush, which is a durability trade-off with a bounded loss window. fsync = off removes the ordering guarantee that recovery depends on, so a power cut can leave the files corrupted. Treating the two as equivalent is the tempting mistake.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-wal-and-recovery",
    "unitTitle": "Database WAL and recovery"
  },
  {
    "id": "srs-takeaway-database-ticket-servers-1",
    "type": "takeaway",
    "prompt": "In Database ticket servers, what is a fundamental rule regarding: Ticket servers generate unique, roughly increasing (not globally time-ordered) IDs across sharded databases using odd/even increments?",
    "answer": "Ticket servers generate unique, roughly increasing (not globally time-ordered) IDs across sharded databases using odd/even increments.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-ticket-servers",
    "unitTitle": "Database ticket servers"
  },
  {
    "id": "srs-takeaway-database-ticket-servers-2",
    "type": "takeaway",
    "prompt": "In Database ticket servers, what is a fundamental rule regarding: MySQL REPLACE INTO generates auto-increment IDs on a single row without unbounded table bloat?",
    "answer": "MySQL REPLACE INTO generates auto-increment IDs on a single row without unbounded table bloat.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-ticket-servers",
    "unitTitle": "Database ticket servers"
  },
  {
    "id": "srs-takeaway-database-ticket-servers-3",
    "type": "takeaway",
    "prompt": "In Database ticket servers, what is a fundamental rule regarding: Modern high-throughput systems prefer coordinate-free ID generators (Snowflake / UUIDv7) to avoid network hops?",
    "answer": "Modern high-throughput systems prefer coordinate-free ID generators (Snowflake / UUIDv7) to avoid network hops.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-ticket-servers",
    "unitTitle": "Database ticket servers"
  },
  {
    "id": "srs-quiz-database-ticket-servers-c1",
    "type": "quiz",
    "prompt": "Flickr's two ticket servers hand out odd and even IDs respectively. Which property do those IDs not have?",
    "answer": "A single global order that matches when IDs were issued\n\nExplanation: The two servers advance independently, so ID 1001 can be issued after 1004. The IDs are unique but not globally time-ordered. Surviving a server failure is the tempting wrong answer, but running two independent servers is exactly what removes the single point of failure.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-ticket-servers",
    "unitTitle": "Database ticket servers"
  },
  {
    "id": "srs-quiz-database-ticket-servers-c2",
    "type": "quiz",
    "prompt": "250 app servers each need 800 IDs per second and lease blocks of 500 IDs at a time. How many allocation UPDATEs per second does the central allocator handle?",
    "answer": "About 400 per second\n\nExplanation: Total demand is 250 times 800, or 200,000 IDs per second, and each 500-ID block costs one UPDATE, so that is 400 UPDATEs per second, easy for a single database. 200,000 is the tempting answer because it is the load without leasing, one round trip per ID.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-ticket-servers",
    "unitTitle": "Database ticket servers"
  },
  {
    "id": "srs-quiz-database-ticket-servers-c3",
    "type": "quiz",
    "prompt": "The ID allocator's database is lost and restored from last night's backup. The app servers start leasing blocks again. What is the danger, and what should the runbook do?",
    "answer": "The counter has rewound and will reissue used IDs; bump it well past the last issued value\n\nExplanation: The restored counter sits below IDs that were already handed out, so new leases will produce duplicate keys. The lesson says to bump the counter well past the last known value after any restore. Treating it as mere gaps is tempting, but gaps come from lost blocks going forward, while a rewind reissues IDs already used.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "database-ticket-servers",
    "unitTitle": "Database ticket servers"
  },
  {
    "id": "srs-takeaway-relational-database-scaling-1",
    "type": "takeaway",
    "prompt": "In Relational database scaling, what is a fundamental rule regarding: Read replicas scale reads but introduce asynchronous replication lag?",
    "answer": "Read replicas scale reads but introduce asynchronous replication lag.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-scaling",
    "unitTitle": "Relational database scaling"
  },
  {
    "id": "srs-takeaway-relational-database-scaling-2",
    "type": "takeaway",
    "prompt": "In Relational database scaling, what is a fundamental rule regarding: Enforce Read-Your-Own-Writes by routing recent writers to the primary database?",
    "answer": "Enforce Read-Your-Own-Writes by routing recent writers to the primary database.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-scaling",
    "unitTitle": "Relational database scaling"
  },
  {
    "id": "srs-takeaway-relational-database-scaling-3",
    "type": "takeaway",
    "prompt": "In Relational database scaling, what is a fundamental rule regarding: Horizontal sharding provides horizontal scale but sacrifices cross-shard joins and ACID atomicity?",
    "answer": "Horizontal sharding provides horizontal scale but sacrifices cross-shard joins and ACID atomicity.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-scaling",
    "unitTitle": "Relational database scaling"
  },
  {
    "id": "srs-quiz-relational-database-scaling-c1",
    "type": "quiz",
    "prompt": "A user saves their profile and immediately reloads the page. Replicas lag the primary by up to a few hundred milliseconds. What does the read-your-own-writes pattern do?",
    "answer": "It sends that user's reads to the primary for a short time after they write\n\nExplanation: The app tracks each user's last write and sends that user's reads to the primary while replicas might still be behind. The precise version compares WAL positions (LSNs) instead of using a time threshold. Waiting for every replica is the tempting answer, but that is synchronous replication, which is a different and much more expensive trade-off.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-scaling",
    "unitTitle": "Relational database scaling"
  },
  {
    "id": "srs-quiz-relational-database-scaling-c2",
    "type": "quiz",
    "prompt": "A multi-tenant SaaS shards its orders table by hash(order_id) to spread data evenly. Almost every query is \"this tenant's orders and customers\". What goes wrong?",
    "answer": "Tenant queries scatter across every shard and must be gathered in application memory\n\nExplanation: A shard key should follow the most common access path, usually tenant or user, so that most queries hit one shard. Hashing by order_id spreads each tenant everywhere, which turns routine queries into scatter-gather work. Even data distribution is the tempting goal, but balance does not help if every query has to touch every shard.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-scaling",
    "unitTitle": "Relational database scaling"
  },
  {
    "id": "srs-quiz-relational-database-scaling-c3",
    "type": "quiz",
    "prompt": "An app does 20,000 reads per second and 4,000 writes per second, and each replica serves about 8,000 reads per second. Event tables account for 50% of writes. How many replicas cover the reads, and what write load is left on the primary after moving the event tables to their own cluster?",
    "answer": "3 replicas, with the primary dropping to 2,000 writes per second\n\nExplanation: 20,000 divided by 8,000 is 2.5, which rounds up to 3 replicas. Moving half the writes elsewhere leaves 2,000 per second. Replicas never reduce write load, because each one must replay every write, so only the functional split lowers the 4,000. Two replicas is the tempting answer if you round down.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "relational-database-scaling",
    "unitTitle": "Relational database scaling"
  },
  {
    "id": "srs-takeaway-online-indexing-1",
    "type": "takeaway",
    "prompt": "In Online indexing, what is a fundamental rule regarding: Standard CREATE INDEX takes a SHARE lock that blocks all writes (not reads) for the whole build, causing production write outages?",
    "answer": "Standard CREATE INDEX takes a SHARE lock that blocks all writes (not reads) for the whole build, causing production write outages.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "online-indexing",
    "unitTitle": "Online indexing"
  },
  {
    "id": "srs-takeaway-online-indexing-2",
    "type": "takeaway",
    "prompt": "In Online indexing, what is a fundamental rule regarding: CREATE INDEX CONCURRENTLY uses a multi-phase build that allows uninterrupted concurrent writes?",
    "answer": "CREATE INDEX CONCURRENTLY uses a multi-phase build that allows uninterrupted concurrent writes.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "online-indexing",
    "unitTitle": "Online indexing"
  },
  {
    "id": "srs-takeaway-online-indexing-3",
    "type": "takeaway",
    "prompt": "In Online indexing, what is a fundamental rule regarding: Failed concurrent index builds leave INVALID indexes on disk that slow writes until explicitly dropped?",
    "answer": "Failed concurrent index builds leave INVALID indexes on disk that slow writes until explicitly dropped.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "online-indexing",
    "unitTitle": "Online indexing"
  },
  {
    "id": "srs-quiz-online-indexing-c1",
    "type": "quiz",
    "prompt": "In PostgreSQL, what does a plain CREATE INDEX on a busy 500-million-row table block while it runs?",
    "answer": "INSERT, UPDATE and DELETE for the whole build, while reads continue\n\nExplanation: Plain CREATE INDEX holds a SHARE lock for the whole build, which allows reads but blocks all writes, so connection pools fill up and the site goes down. ACCESS EXCLUSIVE is the tempting answer, but that is the lock taken by ALTER TABLE and DROP, not by index creation.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "online-indexing",
    "unitTitle": "Online indexing"
  },
  {
    "id": "srs-quiz-online-indexing-c2",
    "type": "quiz",
    "prompt": "A CREATE INDEX CONCURRENTLY build hits its lock_timeout partway through. The migration tool logs a failure and moves on. What is the lasting effect if nobody follows up?",
    "answer": "An INVALID index remains that the planner ignores, but every write still has to maintain it\n\nExplanation: A failed concurrent build leaves the index in the catalog as INVALID. It gives no read benefit but adds cost to every insert and update until someone runs DROP INDEX CONCURRENTLY and retries. Automatic rollback is the tempting assumption, because a plain CREATE INDEX runs in a transaction, but CONCURRENTLY does not.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "online-indexing",
    "unitTitle": "Online indexing"
  },
  {
    "id": "srs-quiz-online-indexing-c3",
    "type": "quiz",
    "prompt": "A table receives 2,500 writes per second, and a blocking CREATE INDEX would take 40 minutes. About how many writes would stall during the build?",
    "answer": "About 6 million\n\nExplanation: 40 minutes is 2,400 seconds, and 2,400 times 2,500 is 6 million writes. In practice, connection pools fill within seconds and the application fails long before that total is reached, which is why production uses CREATE INDEX CONCURRENTLY.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "online-indexing",
    "unitTitle": "Online indexing"
  },
  {
    "id": "srs-takeaway-schema-evolution-1",
    "type": "takeaway",
    "prompt": "In Schema evolution, what is a fundamental rule regarding: Never execute breaking schema changes in a single deployment; use the Expand and Contract pattern?",
    "answer": "Never execute breaking schema changes in a single deployment; use the Expand and Contract pattern.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "schema-evolution",
    "unitTitle": "Schema evolution"
  },
  {
    "id": "srs-takeaway-schema-evolution-2",
    "type": "takeaway",
    "prompt": "In Schema evolution, what is a fundamental rule regarding: Dual-writing during transitions ensures older and newer application pods can run concurrently without errors?",
    "answer": "Dual-writing during transitions ensures older and newer application pods can run concurrently without errors.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "schema-evolution",
    "unitTitle": "Schema evolution"
  },
  {
    "id": "srs-takeaway-schema-evolution-3",
    "type": "takeaway",
    "prompt": "In Schema evolution, what is a fundamental rule regarding: Tools like GitHub gh-ost (binlog streaming) and pt-online-schema-change (triggers) use shadow tables to alter massive tables with zero downtime?",
    "answer": "Tools like GitHub gh-ost (binlog streaming) and pt-online-schema-change (triggers) use shadow tables to alter massive tables with zero downtime.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "schema-evolution",
    "unitTitle": "Schema evolution"
  },
  {
    "id": "srs-quiz-schema-evolution-c1",
    "type": "quiz",
    "prompt": "Both gh-ost and pt-online-schema-change copy rows into a shadow table and then swap it in. How do they keep the shadow table in sync with ongoing writes?",
    "answer": "gh-ost tails the binary log; pt-online-schema-change uses triggers on the original table\n\nExplanation: gh-ost is triggerless and streams changes from the binlog, while pt-online-schema-change adds triggers that mirror each write into the shadow table. Swapping the two is the common mix-up. Neither tool pauses writes except during the brief cut-over rename.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "schema-evolution",
    "unitTitle": "Schema evolution"
  },
  {
    "id": "srs-quiz-schema-evolution-c2",
    "type": "quiz",
    "prompt": "You backfill full_name on a 300-million-row table in 10,000-row batches. Each batch takes about 50 ms, followed by a 50 ms sleep to keep replicas close. About how long does the backfill run?",
    "answer": "About 50 minutes\n\nExplanation: 300 million divided by 10,000 is 30,000 batches, and at 100 ms each including the sleep that is 3,000 seconds, or about 50 minutes. 25 minutes is the tempting answer if you forget the sleep, and the sleep is what keeps replica lag low.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "schema-evolution",
    "unitTitle": "Schema evolution"
  },
  {
    "id": "srs-quiz-schema-evolution-c3",
    "type": "quiz",
    "prompt": "You run ALTER TABLE users ADD COLUMN full_name text, which is a metadata-only change, while a 10-minute report query is reading users. Suddenly every request touching users hangs. Why, and what prevents it?",
    "answer": "The ALTER waits for an ACCESS EXCLUSIVE lock and new queries queue behind it; set lock_timeout and retry\n\nExplanation: Even an instant ALTER needs a brief ACCESS EXCLUSIVE lock. While it waits behind the report, every new query on the table lines up behind the ALTER. A short lock_timeout, such as 2 s, makes it give up and retry instead of stalling traffic. Table rewriting is the tempting answer, but adding a nullable column is metadata-only.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "schema-evolution",
    "unitTitle": "Schema evolution"
  },
  {
    "id": "srs-takeaway-soft-delete-1",
    "type": "takeaway",
    "prompt": "In Soft delete, what is a fundamental rule regarding: Soft deletes preserve data for recovery but cause table bloat, query pollution, and unique constraint conflicts?",
    "answer": "Soft deletes preserve data for recovery but cause table bloat, query pollution, and unique constraint conflicts.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "soft-delete",
    "unitTitle": "Soft delete"
  },
  {
    "id": "srs-takeaway-soft-delete-2",
    "type": "takeaway",
    "prompt": "In Soft delete, what is a fundamental rule regarding: Use Partial Unique Indexes (WHERE deleted_at IS NULL) to allow reuse of unique values after soft deletion?",
    "answer": "Use Partial Unique Indexes (WHERE deleted_at IS NULL) to allow reuse of unique values after soft deletion.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "soft-delete",
    "unitTitle": "Soft delete"
  },
  {
    "id": "srs-takeaway-soft-delete-3",
    "type": "takeaway",
    "prompt": "In Soft delete, what is a fundamental rule regarding: The scalable pattern is archiving deleted records into separate cold storage tables, keeping hot tables lean?",
    "answer": "The scalable pattern is archiving deleted records into separate cold storage tables, keeping hot tables lean.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "soft-delete",
    "unitTitle": "Soft delete"
  },
  {
    "id": "srs-quiz-soft-delete-c1",
    "type": "quiz",
    "prompt": "users.email has a plain UNIQUE constraint, and accounts are soft-deleted by setting deleted_at. A user deletes their account and later signs up again with the same email. What happens?",
    "answer": "The signup fails, because the soft-deleted row still holds that email value\n\nExplanation: To the database, a soft-deleted row is still a live row, so the unique constraint still counts its email. The fix is a partial unique index WHERE deleted_at IS NULL. The first option is tempting, but only your queries treat deleted rows as gone, and only if they remember the filter.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "soft-delete",
    "unitTitle": "Soft delete"
  },
  {
    "id": "srs-quiz-soft-delete-c2",
    "type": "quiz",
    "prompt": "To stop table bloat, a team hard-deletes rows from users and then inserts them into users_archive in a separate transaction. What is the risk, and what is the fix?",
    "answer": "A crash between the steps loses the record entirely; do both in one atomic statement or transaction\n\nExplanation: If the process dies after the delete commits, the row exists in neither table. The lesson's pattern moves it inside one transaction, for example DELETE ... RETURNING feeding an INSERT, so it ends up in exactly one of the two. Duplicates are the tempting answer, but they only appear if the steps run in the other order, archive first and delete second.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "soft-delete",
    "unitTitle": "Soft delete"
  },
  {
    "id": "srs-quiz-soft-delete-c3",
    "type": "quiz",
    "prompt": "A conversation's messages are 75% soft-deleted, and the index on (conversation_id, created_at DESC) includes deleted rows. Roughly how many index entries must be read to return the newest 50 visible messages?",
    "answer": "About 200\n\nExplanation: Only 1 in 4 entries is live, so returning 50 requires reading about 200. 67 is the tempting answer if you mistake 75% for the live share. A partial index WHERE deleted_at IS NULL stores only live rows, so it reads exactly the 50 it needs.",
    "category": "Relational Modeling & Query Execution",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "soft-delete",
    "unitTitle": "Soft delete"
  },
  {
    "id": "srs-takeaway-nosql-decision-boundaries-1",
    "type": "takeaway",
    "prompt": "In NoSQL decision boundaries, what is a fundamental rule regarding: SQL versus NoSQL does not determine one storage engine or consistency model?",
    "answer": "SQL versus NoSQL does not determine one storage engine or consistency model.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "nosql-decision-boundaries",
    "unitTitle": "NoSQL decision boundaries"
  },
  {
    "id": "srs-takeaway-nosql-decision-boundaries-2",
    "type": "takeaway",
    "prompt": "In NoSQL decision boundaries, what is a fundamental rule regarding: Choose from access patterns, transactions, consistency, latency, scale, and operations?",
    "answer": "Choose from access patterns, transactions, consistency, latency, scale, and operations.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "nosql-decision-boundaries",
    "unitTitle": "NoSQL decision boundaries"
  },
  {
    "id": "srs-takeaway-nosql-decision-boundaries-3",
    "type": "takeaway",
    "prompt": "In NoSQL decision boundaries, what is a fundamental rule regarding: Capacity is one decision input, not the only reason to choose a datastore?",
    "answer": "Capacity is one decision input, not the only reason to choose a datastore.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "nosql-decision-boundaries",
    "unitTitle": "NoSQL decision boundaries"
  },
  {
    "id": "srs-quiz-nosql-decision-boundaries-c1",
    "type": "quiz",
    "prompt": "A teammate argues: 'We should move to NoSQL because SQL databases use B-trees and NoSQL uses LSM trees, so NoSQL is faster for writes.' What is the core flaw in this reasoning?",
    "answer": "The SQL versus NoSQL label does not determine the storage engine; relational and non-relational products each use B-trees, heaps or LSM trees\n\nExplanation: The lesson stresses that SQL versus NoSQL is not B-tree versus LSM: Postgres uses heap tables with indexes, InnoDB a clustered B+ tree, and LSM engines appear on both sides. Saying LSM is slower for writes is wrong; LSM trees generally favour writes, the mistake is tying engine to category.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "nosql-decision-boundaries",
    "unitTitle": "NoSQL decision boundaries"
  },
  {
    "id": "srs-quiz-nosql-decision-boundaries-c2",
    "type": "quiz",
    "prompt": "A service commits each order to PostgreSQL and then, in application code, indexes the same order into Elasticsearch. After a few weeks, search results are missing some orders and show stale status for others. What is the most robust fix?",
    "answer": "Make Postgres the source of truth and feed Elasticsearch from its change stream via CDC or a transactional outbox\n\nExplanation: Two independent writes without a shared transaction drift whenever one succeeds and the other fails or they race; CDC or an outbox derives the second store from committed data. Retries shrink the window but cannot cover crashes between the writes, and reordering the writes just moves the inconsistency.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "nosql-decision-boundaries",
    "unitTitle": "NoSQL decision boundaries"
  },
  {
    "id": "srs-quiz-nosql-decision-boundaries-c3",
    "type": "quiz",
    "prompt": "An IoT platform has 2M devices, each sending a 100-byte reading every 10 seconds, and the main query is 'readings for device X over the last 24 hours'. Orders and billing already live in Postgres. Where should telemetry go?",
    "answer": "A wide-column or time-series store partitioned by (device_id, day), since about 200k append-only writes/s are queried by device and time\n\nExplanation: 2M / 10 s is 200k writes/s, roughly 1.7 TB/day, append-only and read by device and time window, which fits a wide-column or time-series store keyed by (device_id, day). Partitioning by day alone would send all of today's writes to one partition, and read replicas never add write capacity.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "nosql-decision-boundaries",
    "unitTitle": "NoSQL decision boundaries"
  },
  {
    "id": "srs-takeaway-document-vs-key-value-stores-1",
    "type": "takeaway",
    "prompt": "In Document vs key-value stores, what is a fundamental rule regarding: Key-value products differ?",
    "answer": "Key-value products differ: some expose opaque bytes and others structured values or indexes.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "document-vs-key-value-stores",
    "unitTitle": "Document vs key-value stores"
  },
  {
    "id": "srs-takeaway-document-vs-key-value-stores-2",
    "type": "takeaway",
    "prompt": "In Document vs key-value stores, what is a fundamental rule regarding: Document indexes improve field queries while amplifying writes?",
    "answer": "Document indexes improve field queries while amplifying writes.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "document-vs-key-value-stores",
    "unitTitle": "Document vs key-value stores"
  },
  {
    "id": "srs-takeaway-document-vs-key-value-stores-3",
    "type": "takeaway",
    "prompt": "In Document vs key-value stores, what is a fundamental rule regarding: Select from required operations and guarantees rather than category labels?",
    "answer": "Select from required operations and guarantees rather than category labels.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "document-vs-key-value-stores",
    "unitTitle": "Document vs key-value stores"
  },
  {
    "id": "srs-quiz-document-vs-key-value-stores-c1",
    "type": "quiz",
    "prompt": "A document store can filter and index on fields inside a record, while a minimal key-value store treats the value as opaque bytes. What does the document store pay for that capability?",
    "answer": "Parsing records and maintaining indexes, which amplifies the cost of each write\n\nExplanation: Document stores expose fields and indexes inside records and pay parsing and index-maintenance costs, so every extra index adds work to each insert. They still serve primary-key lookups directly; a MongoDB lookup by _id is effectively a key-value access.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "document-vs-key-value-stores",
    "unitTitle": "Document vs key-value stores"
  },
  {
    "id": "srs-quiz-document-vs-key-value-stores-c2",
    "type": "quiz",
    "prompt": "User records live in a key-value store under user_id. To support login by email, the app also writes a separate key email to user_id after saving the user, in two separate calls. Months later a small number of users permanently cannot log in by email. What is the most likely cause?",
    "answer": "A partial failure between the two writes left the hand-maintained email key missing or pointing at an old record\n\nExplanation: The lesson warns that manually maintained secondary structures diverge after a partial write unless both are written transactionally, and that divergence is permanent until repaired. Managed index lag (such as a DynamoDB GSI) is tempting, but it resolves within seconds and would not cause lasting failures.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "document-vs-key-value-stores",
    "unitTitle": "Document vs key-value stores"
  },
  {
    "id": "srs-quiz-document-vs-key-value-stores-c3",
    "type": "quiz",
    "prompt": "In MongoDB, a blog post document embeds an array of all its comments. Popular posts receive thousands of comments per day. Following the lesson's modeling rules, what should you change?",
    "answer": "Store comments in their own collection referencing the post, because they are unbounded and would grow the document towards the 16 MB limit\n\nExplanation: Embed what is read together and bounded; reference what is unbounded. An ever-growing comments array eventually hits the 16 MB document limit and forces large rewrites on every append, and an index or compression does nothing about that growth.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "document-vs-key-value-stores",
    "unitTitle": "Document vs key-value stores"
  },
  {
    "id": "srs-takeaway-columnar-vs-wide-column-stores-1",
    "type": "takeaway",
    "prompt": "In Columnar vs wide-column stores, what is a fundamental rule regarding: Wide-Column stores (Cassandra) are distributed OLTP databases storing each row's columns together within SSTables indexed by partition keys (fragments across SSTables are merged by compaction)?",
    "answer": "Wide-Column stores (Cassandra) are distributed OLTP databases storing each row's columns together within SSTables indexed by partition keys (fragments across SSTables are merged by compaction).",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "columnar-vs-wide-column-stores",
    "unitTitle": "Columnar vs wide-column stores"
  },
  {
    "id": "srs-takeaway-columnar-vs-wide-column-stores-2",
    "type": "takeaway",
    "prompt": "In Columnar vs wide-column stores, what is a fundamental rule regarding: Pure Columnar engines (ClickHouse) store each column in a dedicated compressed file, scanning only the necessary columns?",
    "answer": "Pure Columnar engines (ClickHouse) store each column in a dedicated compressed file, scanning only the necessary columns.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "columnar-vs-wide-column-stores",
    "unitTitle": "Columnar vs wide-column stores"
  },
  {
    "id": "srs-takeaway-columnar-vs-wide-column-stores-3",
    "type": "takeaway",
    "prompt": "In Columnar vs wide-column stores, what is a fundamental rule regarding: Columnar formats leverage Delta encoding, Dictionary compression, and SIMD CPU vectorization for orders-of-magnitude faster aggregations compared to row-oriented storage (see?",
    "answer": "Columnar formats leverage Delta encoding, Dictionary compression, and SIMD CPU vectorization for orders-of-magnitude faster aggregations compared to row-oriented storage (see: Abadi et al., 'Column-Stores vs. Row-Stores', SIGMOD 2008).",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "columnar-vs-wide-column-stores",
    "unitTitle": "Columnar vs wide-column stores"
  },
  {
    "id": "srs-quiz-columnar-vs-wide-column-stores-c1",
    "type": "quiz",
    "prompt": "Which description best matches how Cassandra or ScyllaDB organises data?",
    "answer": "A distributed map from partition key to a sorted map of clustering key to that row's columns, stored in LSM trees\n\nExplanation: The lesson describes wide-column stores as a two-dimensional key-value store: partition key mapping to rows sorted by clustering key, held in LSM trees. Storing each column in its own file is the columnar (ClickHouse, Parquet) design, which the shared word 'column' makes easy to confuse.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "columnar-vs-wide-column-stores",
    "unitTitle": "Columnar vs wide-column stores"
  },
  {
    "id": "srs-quiz-columnar-vs-wide-column-stores-c2",
    "type": "quiz",
    "prompt": "A team runs a nightly SUM(bytes) over every row of a 40-column Cassandra table and finds it takes hours and disturbs production latency. What is the underlying reason?",
    "answer": "Cassandra keeps each row's columns together, so the job scans every partition across the cluster and reads all columns just to use one\n\nExplanation: In a row or wide-column layout a row's columns sit together, so an aggregate over one column is a full-cluster scan that reads and discards most bytes, with no column pruning. Separate per-column compression is the columnar layout, which is exactly what makes ClickHouse fast for this query.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "columnar-vs-wide-column-stores",
    "unitTitle": "Columnar vs wide-column stores"
  },
  {
    "id": "srs-quiz-columnar-vs-wide-column-stores-c3",
    "type": "quiz",
    "prompt": "Log rows average 500 bytes, of which the latency field is 4 bytes. You compute the average latency over 100M rows. Before any compression, roughly how much less data does a columnar engine read than a row store?",
    "answer": "About 125x less, since it reads 4 bytes per row instead of 500\n\nExplanation: The columnar engine reads only the latency column, 4 of 500 bytes per row, a 125x reduction before compression adds more on top. SIMD speeds up processing of the bytes that are read; it does not change how many bytes come off disk.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "columnar-vs-wide-column-stores",
    "unitTitle": "Columnar vs wide-column stores"
  },
  {
    "id": "srs-takeaway-graph-database-decision-boundary-1",
    "type": "takeaway",
    "prompt": "In Graph database decision boundary, what is a fundamental rule regarding: Traversal cost depends on visited relationships, filters, indexes, and locality?",
    "answer": "Traversal cost depends on visited relationships, filters, indexes, and locality.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "graph-database-decision-boundary",
    "unitTitle": "Graph database decision boundary"
  },
  {
    "id": "srs-takeaway-graph-database-decision-boundary-2",
    "type": "takeaway",
    "prompt": "In Graph database decision boundary, what is a fundamental rule regarding: Graph stores make adjacency first-class but still face supernodes and partitioning?",
    "answer": "Graph stores make adjacency first-class but still face supernodes and partitioning.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "graph-database-decision-boundary",
    "unitTitle": "Graph database decision boundary"
  },
  {
    "id": "srs-takeaway-graph-database-decision-boundary-3",
    "type": "takeaway",
    "prompt": "In Graph database decision boundary, what is a fundamental rule regarding: Bounded indexed SQL traversal can remain the simpler choice?",
    "answer": "Bounded indexed SQL traversal can remain the simpler choice.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "graph-database-decision-boundary",
    "unitTitle": "Graph database decision boundary"
  },
  {
    "id": "srs-quiz-graph-database-decision-boundary-c1",
    "type": "quiz",
    "prompt": "According to the lesson, what is the real mechanical advantage of a native graph store for multi-hop traversals?",
    "answer": "Relationships are first-class stored links, so each hop can follow adjacency instead of repeating a global index lookup\n\nExplanation: Graph stores make relationships first-class and can skip a repeated global index lookup per hop, so cost tracks the part of the graph touched. The lesson explicitly rejects any general O(log N)-style rule and notes that partitioning connected data is hard, not automatic.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "graph-database-decision-boundary",
    "unitTitle": "Graph database decision boundary"
  },
  {
    "id": "srs-quiz-graph-database-decision-boundary-c2",
    "type": "quiz",
    "prompt": "A fraud query finds accounts within 4 hops of a flagged account via shared devices. It usually returns in milliseconds, but sometimes times out. Investigation shows one 'device' is an airport WiFi fingerprint shared by 200k accounts. What is the best mitigation?",
    "answer": "Cap expansion through very high-degree nodes, for example by filtering or special-casing them, since they explode the traversal and carry little fraud signal\n\nExplanation: A supernode turns one hop into a 200k-edge expansion that exhausts any latency budget, in any engine; the lesson's fix is to cap degree, filter by edge type or time, or special-case such nodes. Switching to a graph database does not help, because following 200k pointers is still 200k expansions.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "graph-database-decision-boundary",
    "unitTitle": "Graph database decision boundary"
  },
  {
    "id": "srs-quiz-graph-database-decision-boundary-c3",
    "type": "quiz",
    "prompt": "Accounts have an average degree of about 5 with no supernodes. A 4-hop expansion in Postgres costs about 4 B-tree page touches per expanded node. What does the lesson conclude about running this in SQL?",
    "answer": "About 2,500 page touches, a few milliseconds when cached, so SQL is fine for this shape\n\nExplanation: 5^4 is about 625 nodes at about 4 page touches each, roughly 2,500 touches and a few milliseconds when cached. Graph databases start to pay off for deeper, variable-length paths, cycles and pattern matching, not for a bounded, indexed 4-hop expansion like this one.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "graph-database-decision-boundary",
    "unitTitle": "Graph database decision boundary"
  },
  {
    "id": "srs-takeaway-sharding-and-partitioning-1",
    "type": "takeaway",
    "prompt": "In Sharding and partitioning, what is a fundamental rule regarding: No universal size or throughput threshold requires sharding?",
    "answer": "No universal size or throughput threshold requires sharding.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sharding-and-partitioning",
    "unitTitle": "Sharding and partitioning"
  },
  {
    "id": "srs-takeaway-sharding-and-partitioning-2",
    "type": "takeaway",
    "prompt": "In Sharding and partitioning, what is a fundamental rule regarding: Range and hash partitioning exchange scan locality for distribution?",
    "answer": "Range and hash partitioning exchange scan locality for distribution.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sharding-and-partitioning",
    "unitTitle": "Sharding and partitioning"
  },
  {
    "id": "srs-takeaway-sharding-and-partitioning-3",
    "type": "takeaway",
    "prompt": "In Sharding and partitioning, what is a fundamental rule regarding: Sharding adds routing, rebalancing, and cross-shard coordination?",
    "answer": "Sharding adds routing, rebalancing, and cross-shard coordination.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sharding-and-partitioning",
    "unitTitle": "Sharding and partitioning"
  },
  {
    "id": "srs-quiz-sharding-and-partitioning-c1",
    "type": "quiz",
    "prompt": "You partition an orders table by an auto-increment order_id. What is the key difference between range and hash partitioning for this key?",
    "answer": "Range partitioning keeps scans over consecutive IDs cheap but sends every new write to the last range; hashing spreads writes but scatters range scans\n\nExplanation: Range partitioning preserves scan locality but a monotonic key concentrates all new inserts on the newest range; hashing distributes writes at the cost of turning range scans into scatter-gather. Hashing does not keep recent orders together; it deliberately scatters them.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sharding-and-partitioning",
    "unitTitle": "Sharding and partitioning"
  },
  {
    "id": "srs-quiz-sharding-and-partitioning-c2",
    "type": "quiz",
    "prompt": "You are moving logical shard 417 from cluster 3 to cluster 9 using CDC. Some app servers will pick up the new directory entry seconds later than others. What is the main risk during cutover, and how do you avoid it?",
    "answer": "Some writes land on the old cluster after the copy is considered complete; briefly block writes to the shard, let CDC drain, then flip the directory\n\nExplanation: The lesson warns that rebalancing is risky while old and new routers disagree: stale routers can keep writing to the old location, and those writes are lost or diverge. Nothing is rehashed in a logical-shard design, since only the logical-to-physical mapping changes.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sharding-and-partitioning",
    "unitTitle": "Sharding and partitioning"
  },
  {
    "id": "srs-quiz-sharding-and-partitioning-c3",
    "type": "quiz",
    "prompt": "Tenants map to 1,024 logical shards via hash(tenant_id) mod 1024, spread evenly over 8 physical clusters. You grow to 16 clusters. What has to move?",
    "answer": "64 logical shards off each existing cluster, with no tenant rehashed; only directory entries change\n\nExplanation: Each cluster holds 128 logical shards; to reach 16 clusters it hands off 64 whole logical shards and the directory is updated. The hash is always mod 1024 over logical shards, so changing the physical cluster count never rehashes rows.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "sharding-and-partitioning",
    "unitTitle": "Sharding and partitioning"
  },
  {
    "id": "srs-takeaway-hot-partitions-1",
    "type": "takeaway",
    "prompt": "In Hot partitions, what is a fundamental rule regarding: Hot partitions occur when entity popularity violates uniform distribution assumptions, saturating a single physical shard?",
    "answer": "Hot partitions occur when entity popularity violates uniform distribution assumptions, saturating a single physical shard.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-partitions",
    "unitTitle": "Hot partitions"
  },
  {
    "id": "srs-takeaway-hot-partitions-2",
    "type": "takeaway",
    "prompt": "In Hot partitions, what is a fundamental rule regarding: Write hotspots are mitigated by key salting (appending random suffixes) and scatter-gather read aggregation?",
    "answer": "Write hotspots are mitigated by key salting (appending random suffixes) and scatter-gather read aggregation.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-partitions",
    "unitTitle": "Hot partitions"
  },
  {
    "id": "srs-takeaway-hot-partitions-3",
    "type": "takeaway",
    "prompt": "In Hot partitions, what is a fundamental rule regarding: Read hotspots are eliminated by local in-process L1 caching (1-5 second TTL) on the application tier?",
    "answer": "Read hotspots are eliminated by local in-process L1 caching (1-5 second TTL) on the application tier.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-partitions",
    "unitTitle": "Hot partitions"
  },
  {
    "id": "srs-quiz-hot-partitions-c1",
    "type": "quiz",
    "prompt": "A cluster uses a well-distributed hash on product_id, yet during a flash sale one shard saturates while others idle. Why did hashing not prevent this?",
    "answer": "Hashing spreads keys evenly, but all traffic for one popular key still goes to the single shard that owns it\n\nExplanation: Hash partitioning assumes keys are accessed uniformly; with Zipf-like popularity, one hot key concentrates load on its owning shard. No hash function or node count can split traffic to a single key, which is why salting or caching is needed.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-partitions",
    "unitTitle": "Hot partitions"
  },
  {
    "id": "srs-quiz-hot-partitions-c2",
    "type": "quiz",
    "prompt": "A hot configuration key receives 500,000 reads/s spread across 200 API instances. Each instance adds an in-process L1 cache with a 2-second TTL and single-flight refresh. Roughly how many reads/s now reach Redis for that key?",
    "answer": "About 100, one refresh per instance every 2 seconds\n\nExplanation: With single-flight, each of 200 instances refreshes the key once per 2 s TTL, so about 100 reads/s reach Redis regardless of request volume. Miss rate is not a fixed percentage here; it depends on TTL and instance count, not on incoming traffic.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-partitions",
    "unitTitle": "Hot partitions"
  },
  {
    "id": "srs-quiz-hot-partitions-c3",
    "type": "quiz",
    "prompt": "Salting a like counter across K = 32 sub-keys worked well, so a team applies the same pattern to a flash-sale inventory counter that must never oversell. What breaks?",
    "answer": "Summing 32 sub-keys is not atomic, so a reader can see a total that never existed and two buyers can both pass a stock check; use a reservation or queue instead\n\nExplanation: The lesson notes that a scatter-gather sum is not a snapshot, which is fine for likes but wrong for inventory that must never oversell. Each write still touches only one sub-key, so write throughput is not the problem; correctness of the check is.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-partitions",
    "unitTitle": "Hot partitions"
  },
  {
    "id": "srs-takeaway-consistent-hashing-1",
    "type": "takeaway",
    "prompt": "In Consistent hashing, what is a fundamental rule regarding: Consistent hashing limits expected remapping under topology changes?",
    "answer": "Consistent hashing limits expected remapping under topology changes.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "consistent-hashing",
    "unitTitle": "Consistent hashing"
  },
  {
    "id": "srs-takeaway-consistent-hashing-2",
    "type": "takeaway",
    "prompt": "In Consistent hashing, what is a fundamental rule regarding: Virtual nodes reduce expected skew but do not guarantee balance?",
    "answer": "Virtual nodes reduce expected skew but do not guarantee balance.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "consistent-hashing",
    "unitTitle": "Consistent hashing"
  },
  {
    "id": "srs-takeaway-consistent-hashing-3",
    "type": "takeaway",
    "prompt": "In Consistent hashing, what is a fundamental rule regarding: Hot keys, membership drift, and warming still need explicit handling?",
    "answer": "Hot keys, membership drift, and warming still need explicit handling.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "consistent-hashing",
    "unitTitle": "Consistent hashing"
  },
  {
    "id": "srs-quiz-consistent-hashing-c1",
    "type": "quiz",
    "prompt": "In consistent hashing, why do systems place many weighted virtual nodes per physical server on the ring?",
    "answer": "To reduce expected load skew between servers and allow capacity weighting, without guaranteeing perfect balance\n\nExplanation: Virtual nodes shrink the expected spread of ownership (the standard deviation of load is roughly proportional to 1 over the square root of V) and let bigger servers take more points, but they do not guarantee a fixed balance. A single key still maps to one position, so vnodes do nothing for hot keys.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "consistent-hashing",
    "unitTitle": "Consistent hashing"
  },
  {
    "id": "srs-quiz-consistent-hashing-c2",
    "type": "quiz",
    "prompt": "After moving a cache fleet to consistent hashing with 256 vnodes per server, key counts per node are within 10 percent, but one node still runs at 100 percent CPU during peaks. What is the most likely explanation?",
    "answer": "A small number of very hot keys live on that node; consistent hashing balances keys, not traffic to a key\n\nExplanation: Balanced key counts with one saturated node is the signature of hot keys, which consistent hashing cannot split. Stale membership views cause misrouting and misses, but would not leave key counts balanced while pinning CPU on one node.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "consistent-hashing",
    "unitTitle": "Consistent hashing"
  },
  {
    "id": "srs-quiz-consistent-hashing-c3",
    "type": "quiz",
    "prompt": "A cache holds 10M keys on 10 nodes using hash(key) mod N. You add an 11th node. Roughly what happens to the hit rate immediately afterwards?",
    "answer": "It collapses to about 9 percent, because about 91 percent of keys map to a different node\n\nExplanation: A key stays put only when h mod 10 equals h mod 11, about 1 in 11 keys, so roughly 91 percent move and the hit rate falls to about 9 percent. The 9-point dip is what consistent hashing would give, not modulo.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "consistent-hashing",
    "unitTitle": "Consistent hashing"
  },
  {
    "id": "srs-takeaway-distributed-id-generation-1",
    "type": "takeaway",
    "prompt": "In Distributed ID generation, what is a fundamental rule regarding: Auto-incrementing database sequences create bottlenecks and leak business metrics?",
    "answer": "Auto-incrementing database sequences create bottlenecks and leak business metrics.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "distributed-id-generation",
    "unitTitle": "Distributed ID generation"
  },
  {
    "id": "srs-takeaway-distributed-id-generation-2",
    "type": "takeaway",
    "prompt": "In Distributed ID generation, what is a fundamental rule regarding: UUIDv4 allows decentralized generation but ruins B-tree index locality due to random page splitting?",
    "answer": "UUIDv4 allows decentralized generation but ruins B-tree index locality due to random page splitting.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "distributed-id-generation",
    "unitTitle": "Distributed ID generation"
  },
  {
    "id": "srs-takeaway-distributed-id-generation-3",
    "type": "takeaway",
    "prompt": "In Distributed ID generation, what is a fundamental rule regarding: Snowflake-style 64-bit time-sorted IDs provide optimal performance, B-tree locality, and 4M+ IDs/sec per node?",
    "answer": "Snowflake-style 64-bit time-sorted IDs provide optimal performance, B-tree locality, and 4M+ IDs/sec per node.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "distributed-id-generation",
    "unitTitle": "Distributed ID generation"
  },
  {
    "id": "srs-quiz-distributed-id-generation-c1",
    "type": "quiz",
    "prompt": "A product team switches public order IDs from auto-increment integers to Snowflake IDs to stop competitors estimating order volume. What do Snowflake IDs still reveal?",
    "answer": "The creation timestamp of each record\n\nExplanation: Time-ordered IDs such as Snowflake and UUIDv7 embed the creation timestamp, which anyone can decode. They no longer expose a global running count, but they are not opaque; expose a separate random public ID if timing must stay private.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "distributed-id-generation",
    "unitTitle": "Distributed ID generation"
  },
  {
    "id": "srs-quiz-distributed-id-generation-c2",
    "type": "quiz",
    "prompt": "You adopt a Flickr-style central ticket server that issues each ID with one REPLACE INTO round trip. Order creation runs at 30,000 per second from many services. What is the main concern?",
    "answer": "Every ID costs a network round trip to one database, which is both a throughput ceiling and a single point of failure\n\nExplanation: A central ticket service concentrates every ID request on one database, so it caps throughput and makes ID generation a single point of failure; Flickr mitigated this by running two servers with odd and even sequences. The IDs themselves are sequential 64-bit integers, so fragmentation and size are not the issue.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "distributed-id-generation",
    "unitTitle": "Distributed ID generation"
  },
  {
    "id": "srs-quiz-distributed-id-generation-c3",
    "type": "quiz",
    "prompt": "A MySQL InnoDB table uses UUIDv4 as its clustered primary key. As the table grows past RAM, insert throughput falls sharply. What is the mechanism?",
    "answer": "Random keys land on random leaf pages, causing page splits and buffer-pool misses because inserts no longer append to the right-hand edge\n\nExplanation: Random 128-bit keys scatter inserts across the whole B-tree, so pages split and must be read from disk once the working set exceeds RAM. UUIDv4 generation is local with no coordination, and collision probability stays negligible.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "distributed-id-generation",
    "unitTitle": "Distributed ID generation"
  },
  {
    "id": "srs-takeaway-uuid-objectid-and-snowflake-1",
    "type": "takeaway",
    "prompt": "In UUID, ObjectId, and Snowflake, what is a fundamental rule regarding: UUIDv4 wastes storage (16 bytes) and causes random B-tree page splits; UUIDv7 solves this with a 48-bit timestamp prefix?",
    "answer": "UUIDv4 wastes storage (16 bytes) and causes random B-tree page splits; UUIDv7 solves this with a 48-bit timestamp prefix.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "uuid-objectid-and-snowflake",
    "unitTitle": "UUID, ObjectId, and Snowflake"
  },
  {
    "id": "srs-takeaway-uuid-objectid-and-snowflake-2",
    "type": "takeaway",
    "prompt": "In UUID, ObjectId, and Snowflake, what is a fundamental rule regarding: MongoDB ObjectId packs 12 bytes?",
    "answer": "MongoDB ObjectId packs 12 bytes: 4s timestamp + 5-byte process unique + 3-byte counter.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "uuid-objectid-and-snowflake",
    "unitTitle": "UUID, ObjectId, and Snowflake"
  },
  {
    "id": "srs-takeaway-uuid-objectid-and-snowflake-3",
    "type": "takeaway",
    "prompt": "In UUID, ObjectId, and Snowflake, what is a fundamental rule regarding: Snowflake IDs fit into standard 64-bit integers, providing natural chronological sorting and high memory compactness?",
    "answer": "Snowflake IDs fit into standard 64-bit integers, providing natural chronological sorting and high memory compactness.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "uuid-objectid-and-snowflake",
    "unitTitle": "UUID, ObjectId, and Snowflake"
  },
  {
    "id": "srs-quiz-uuid-objectid-and-snowflake-c1",
    "type": "quiz",
    "prompt": "What makes UUIDv7 index-friendly compared with UUIDv4, while keeping the same 128-bit size?",
    "answer": "It puts a 48-bit Unix millisecond timestamp in the highest-order bits, so new IDs sort after older ones\n\nExplanation: UUIDv7 leads with a 48-bit millisecond timestamp followed by random bits, so inserts append near the end of the index. It stays 128 bits and keeps plenty of randomness; it is Snowflake, not UUIDv7, that fits in 64 bits.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "uuid-objectid-and-snowflake",
    "unitTitle": "UUID, ObjectId, and Snowflake"
  },
  {
    "id": "srs-quiz-uuid-objectid-and-snowflake-c2",
    "type": "quiz",
    "prompt": "Two MongoDB processes each insert documents during the same wall-clock second. You sort the documents by _id. How are documents from that second ordered?",
    "answer": "By the 5-byte process value and then the counter, not by true creation order, because the timestamp has only 1-second resolution\n\nExplanation: An ObjectId is 4 bytes of seconds, then a 5-byte per-process value, then a 3-byte counter, so within one second the process value decides the order. The counter is per process and sits in the least significant bytes, so it does not give a global creation order.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "uuid-objectid-and-snowflake",
    "unitTitle": "UUID, ObjectId, and Snowflake"
  },
  {
    "id": "srs-quiz-uuid-objectid-and-snowflake-c3",
    "type": "quiz",
    "prompt": "The same insert-heavy service is deployed with a UUIDv4 primary key on MySQL InnoDB and on PostgreSQL. Why does the lesson expect InnoDB to suffer more?",
    "answer": "InnoDB clusters the table itself on the primary key, so random keys scatter the rows, while Postgres stores rows in a heap and only the index suffers\n\nExplanation: In InnoDB the primary key is the clustered index, so random keys cause page splits in the table itself and bloat every secondary index that copies the key. Postgres has a separate heap, so random keys fragment only the primary-key index; it does index them and does not rewrite them.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "uuid-objectid-and-snowflake",
    "unitTitle": "UUID, ObjectId, and Snowflake"
  },
  {
    "id": "srs-takeaway-snowflake-id-design-1",
    "type": "takeaway",
    "prompt": "In Snowflake ID design, what is a fundamental rule regarding: Snowflake IDs require unique worker assignment and synchronized sequence generation?",
    "answer": "Snowflake IDs require unique worker assignment and synchronized sequence generation.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "snowflake-id-design",
    "unitTitle": "Snowflake ID design"
  },
  {
    "id": "srs-takeaway-snowflake-id-design-2",
    "type": "takeaway",
    "prompt": "In Snowflake ID design, what is a fundamental rule regarding: Clock rollback and worker reuse can cause collisions?",
    "answer": "Clock rollback and worker reuse can cause collisions.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "snowflake-id-design",
    "unitTitle": "Snowflake ID design"
  },
  {
    "id": "srs-takeaway-snowflake-id-design-3",
    "type": "takeaway",
    "prompt": "In Snowflake ID design, what is a fundamental rule regarding: Compact ordering comes with clock and lifecycle dependencies?",
    "answer": "Compact ordering comes with clock and lifecycle dependencies.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "snowflake-id-design",
    "unitTitle": "Snowflake ID design"
  },
  {
    "id": "srs-quiz-snowflake-id-design-c1",
    "type": "quiz",
    "prompt": "A Snowflake generator runs in a multi-threaded service. What must be true of its (last_ts, sequence) state?",
    "answer": "It must be updated atomically, for example with a mutex, a CAS on packed state, or a single owning thread\n\nExplanation: Concurrent callers must see the timestamp and sequence change together, otherwise two threads can compose the same ID in one millisecond. Per-thread copies share one worker ID, so they would produce duplicates; persisting on every ID is unnecessary, as a periodic high-water mark is enough for restarts.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "snowflake-id-design",
    "unitTitle": "Snowflake ID design"
  },
  {
    "id": "srs-quiz-snowflake-id-design-c2",
    "type": "quiz",
    "prompt": "Which combination of events is most likely to produce duplicate Snowflake IDs in production?",
    "answer": "A VM resuming with an older clock while its worker ID has been reassigned to another live process\n\nExplanation: Uniqueness rests on two invariants, unique live worker IDs and a timestamp that never goes backwards; breaking both lets two generators emit the same time, worker and sequence triple. Interleaving across workers only weakens ordering, and sequence exhaustion only adds a short delay.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "snowflake-id-design",
    "unitTitle": "Snowflake ID design"
  },
  {
    "id": "srs-quiz-snowflake-id-design-c3",
    "type": "quiz",
    "prompt": "Your system will never need more than 64 generators, but each must handle bursts of 50,000 IDs in one millisecond. Keeping 1 sign bit and 41 timestamp bits, which split of the remaining 22 bits fits?",
    "answer": "6 worker bits and 16 sequence bits\n\nExplanation: 6 bits give exactly 64 workers and 16 bits give 65,536 IDs per ms, covering the 50k burst. 14 sequence bits allow only 16,384 per ms, the default 12 only 4,096, and 4 worker bits allow only 16 generators.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "snowflake-id-design",
    "unitTitle": "Snowflake ID design"
  },
  {
    "id": "srs-takeaway-clock-skew-and-id-ordering-1",
    "type": "takeaway",
    "prompt": "In Clock skew and ID ordering, what is a fundamental rule regarding: Physical wall clocks experience drift and NTP network latency, making physical timestamps unsafe for distributed causality?",
    "answer": "Physical wall clocks experience drift and NTP network latency, making physical timestamps unsafe for distributed causality.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "clock-skew-and-id-ordering",
    "unitTitle": "Clock skew and ID ordering"
  },
  {
    "id": "srs-takeaway-clock-skew-and-id-ordering-2",
    "type": "takeaway",
    "prompt": "In Clock skew and ID ordering, what is a fundamental rule regarding: Google Spanner uses GPS and atomic clocks to bound uncertainty (ε typically 1-7 ms) and enforces commit waits?",
    "answer": "Google Spanner uses GPS and atomic clocks to bound uncertainty (ε typically 1-7 ms) and enforces commit waits.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "clock-skew-and-id-ordering",
    "unitTitle": "Clock skew and ID ordering"
  },
  {
    "id": "srs-takeaway-clock-skew-and-id-ordering-3",
    "type": "takeaway",
    "prompt": "In Clock skew and ID ordering, what is a fundamental rule regarding: Vector clocks track causality across distributed nodes, exposing concurrent write conflicts for explicit reconciliation?",
    "answer": "Vector clocks track causality across distributed nodes, exposing concurrent write conflicts for explicit reconciliation.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "clock-skew-and-id-ordering",
    "unitTitle": "Clock skew and ID ordering"
  },
  {
    "id": "srs-quiz-clock-skew-and-id-ordering-c1",
    "type": "quiz",
    "prompt": "Node A writes X, then sends a message that causes node B to write Y to the same key. B's clock is 40 ms behind A's. With last-write-wins by wall-clock timestamp, what can happen?",
    "answer": "Y is stamped earlier than X, so X silently wins and the causally later write Y is lost\n\nExplanation: Physical timestamps cannot guarantee causality; with skew, the later write can carry a smaller timestamp and LWW discards it without any error. LWW does not keep siblings, and NTP residual error persists between syncs, so it cannot be relied on to fix ordering.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "clock-skew-and-id-ordering",
    "unitTitle": "Clock skew and ID ordering"
  },
  {
    "id": "srs-quiz-clock-skew-and-id-ordering-c2",
    "type": "quiz",
    "prompt": "In a Spanner-like system, TrueTime's uncertainty epsilon rises from about 4 ms to 20 ms because time masters become hard to reach. What is the main effect?",
    "answer": "Commit wait grows with epsilon, so write latency rises but ordering guarantees are preserved\n\nExplanation: Commit wait holds a transaction until its timestamp is guaranteed to be in the past, so the wait scales with epsilon and larger uncertainty costs latency, not correctness. Out-of-order commits would only happen if the system ignored the interval, which is exactly what commit wait prevents.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "clock-skew-and-id-ordering",
    "unitTitle": "Clock skew and ID ordering"
  },
  {
    "id": "srs-quiz-clock-skew-and-id-ordering-c3",
    "type": "quiz",
    "prompt": "A Dynamo-style store holds two versions of a cart with vector clocks VA = [2, 1, 0] and VB = [1, 2, 0]. What should the system conclude?",
    "answer": "They are concurrent, since each has a component greater than the other, so both must be kept and merged\n\nExplanation: VA is ahead in the first component and VB in the second, so neither causally precedes the other and the updates conflict. Picking by any single component or by the sum would silently drop one user's change, which is what vector clocks exist to prevent.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "clock-skew-and-id-ordering",
    "unitTitle": "Clock skew and ID ordering"
  },
  {
    "id": "srs-takeaway-keyset-pagination-1",
    "type": "takeaway",
    "prompt": "In Keyset pagination, what is a fundamental rule regarding: Keyset seeks cost roughly O(log N) plus page scanning?",
    "answer": "Keyset seeks cost roughly O(log N) plus page scanning.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "keyset-pagination",
    "unitTitle": "Keyset pagination"
  },
  {
    "id": "srs-takeaway-keyset-pagination-2",
    "type": "takeaway",
    "prompt": "In Keyset pagination, what is a fundamental rule regarding: A complete unique sort key prevents tie-related skips?",
    "answer": "A complete unique sort key prevents tie-related skips.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "keyset-pagination",
    "unitTitle": "Keyset pagination"
  },
  {
    "id": "srs-takeaway-keyset-pagination-3",
    "type": "takeaway",
    "prompt": "In Keyset pagination, what is a fundamental rule regarding: Updates and deletions can still change subsequent pages?",
    "answer": "Updates and deletions can still change subsequent pages.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "keyset-pagination",
    "unitTitle": "Keyset pagination"
  },
  {
    "id": "srs-quiz-keyset-pagination-c1",
    "type": "quiz",
    "prompt": "An API pages orders with ORDER BY created_at DESC and a cursor holding only the last created_at. Why must the cursor also include id?",
    "answer": "Rows sharing the same created_at would be skipped or repeated at page boundaries, because the order is not unique\n\nExplanation: Keyset pagination needs a unique, deterministic order; with ties on created_at the cursor cannot say where within the tie to resume. Opaque encoding and signing, not the id itself, protect against forged cursors, and the seek remains roughly O(log N) either way.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "keyset-pagination",
    "unitTitle": "Keyset pagination"
  },
  {
    "id": "srs-quiz-keyset-pagination-c2",
    "type": "quiz",
    "prompt": "A sync client pages through tickets with keyset pagination on (updated_at, id) ascending. Agents edit tickets constantly while the client pages. What can go wrong?",
    "answer": "A ticket updated mid-scan moves past the cursor and can appear again on a later page, while its old position is gone\n\nExplanation: Keyset pagination handles inserts ahead of the cursor well, but updating the sort key moves rows within the order, so they can reappear later (and deletions of unseen rows change results). The index seek itself is unaffected; this is a semantics problem, not a performance one.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "keyset-pagination",
    "unitTitle": "Keyset pagination"
  },
  {
    "id": "srs-quiz-keyset-pagination-c3",
    "type": "quiz",
    "prompt": "On MySQL you must expand the row comparison (created_at, id) less than (:ts, :id) by hand. Which WHERE clause is equivalent?",
    "answer": "created_at less than :ts OR (created_at = :ts AND id less than :id)\n\nExplanation: Tuple comparison means an earlier created_at, or the same created_at with a smaller id. The tempting created_at ≤ :ts AND id less than :id wrongly drops older rows whose id happens to be larger than :id.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "keyset-pagination",
    "unitTitle": "Keyset pagination"
  },
  {
    "id": "srs-takeaway-bloom-filters-1",
    "type": "takeaway",
    "prompt": "In Bloom filters, what is a fundamental rule regarding: A current append-only Bloom filter can prove absence but only probable presence?",
    "answer": "A current append-only Bloom filter can prove absence but only probable presence.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bloom-filters",
    "unitTitle": "Bloom filters"
  },
  {
    "id": "srs-takeaway-bloom-filters-2",
    "type": "takeaway",
    "prompt": "In Bloom filters, what is a fundamental rule regarding: Deletion requires rebuilding, counting filters, or another design?",
    "answer": "Deletion requires rebuilding, counting filters, or another design.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bloom-filters",
    "unitTitle": "Bloom filters"
  },
  {
    "id": "srs-takeaway-bloom-filters-3",
    "type": "takeaway",
    "prompt": "In Bloom filters, what is a fundamental rule regarding: False-positive rate trades memory and hash work against avoided I/O?",
    "answer": "False-positive rate trades memory and hash work against avoided I/O.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bloom-filters",
    "unitTitle": "Bloom filters"
  },
  {
    "id": "srs-quiz-bloom-filters-c1",
    "type": "quiz",
    "prompt": "A lookup checks a key against a correctly built, current Bloom filter and finds all k bits set. What can you conclude?",
    "answer": "The key was probably inserted, but you must check the underlying data to be sure\n\nExplanation: All bits set means 'maybe present', because other keys may have set those bits, so a false positive is possible. Only an unset bit gives a certain answer, and that answer is 'definitely not present'.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bloom-filters",
    "unitTitle": "Bloom filters"
  },
  {
    "id": "srs-quiz-bloom-filters-c2",
    "type": "quiz",
    "prompt": "To support deletes, an engineer clears a key's k bits when the key is removed from a standard Bloom filter. What failure does this introduce?",
    "answer": "Other keys sharing those bits start returning 'definitely not present', creating false negatives\n\nExplanation: Bits are shared between keys, so clearing them can make present keys look absent, which breaks the filter's one guarantee. Clearing bits actually lowers the false-positive rate; use a counting or cuckoo filter, or rebuild, if you need deletes.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bloom-filters",
    "unitTitle": "Bloom filters"
  },
  {
    "id": "srs-quiz-bloom-filters-c3",
    "type": "quiz",
    "prompt": "A filter for 100M keys at a 1 percent false-positive rate uses about 120 MB. You want 0.1 percent instead. Roughly how much extra memory does that cost?",
    "answer": "About 60 MB, since each 10x reduction costs about 4.8 more bits per item\n\nExplanation: Bits per item grow with ln(1/p), so each 10x cut in false positives adds about 4.8 bits per item, taking 9.6 to 14.4 bits, or about 60 MB more for 100M keys. Memory grows logarithmically, not linearly, with the reduction in false positives.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bloom-filters",
    "unitTitle": "Bloom filters"
  },
  {
    "id": "srs-takeaway-hot-cold-storage-archival-1",
    "type": "takeaway",
    "prompt": "In Hot and cold storage, archival, what is a fundamental rule regarding: Reads typically concentrate on recent data (for example, 90% on the last week in many workloads); tiered storage migrates aged data to reduce storage bills by up to 99%?",
    "answer": "Reads typically concentrate on recent data (for example, 90% on the last week in many workloads); tiered storage migrates aged data to reduce storage bills by up to 99%.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-cold-storage-archival",
    "unitTitle": "Hot and cold storage, archival"
  },
  {
    "id": "srs-takeaway-hot-cold-storage-archival-2",
    "type": "takeaway",
    "prompt": "In Hot and cold storage, archival, what is a fundamental rule regarding: Hot tiers use local NVMe SSDs; cold tiers (S3 Glacier classes) trade retrieval latency and fees for cost; AWS does not disclose the underlying media?",
    "answer": "Hot tiers use local NVMe SSDs; cold tiers (S3 Glacier classes) trade retrieval latency and fees for cost; AWS does not disclose the underlying media.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-cold-storage-archival",
    "unitTitle": "Hot and cold storage, archival"
  },
  {
    "id": "srs-takeaway-hot-cold-storage-archival-3",
    "type": "takeaway",
    "prompt": "In Hot and cold storage, archival, what is a fundamental rule regarding: Compaction to columnar Parquet formats before object storage migration enables serverless querying via Athena and DuckDB?",
    "answer": "Compaction to columnar Parquet formats before object storage migration enables serverless querying via Athena and DuckDB.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-cold-storage-archival",
    "unitTitle": "Hot and cold storage, archival"
  },
  {
    "id": "srs-quiz-hot-cold-storage-archival-c1",
    "type": "quiz",
    "prompt": "What should decide when records move from the hot tier to cheaper tiers?",
    "answer": "Your measured access pattern by data age, together with retention and compliance rules\n\nExplanation: The lesson says reads often concentrate on recent data but tells you to measure your own access pattern before choosing boundaries. The 30/90/365 figures in the diagram are an example lifecycle, not a rule, and waiting for disks to fill wastes expensive capacity.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-cold-storage-archival",
    "unitTitle": "Hot and cold storage, archival"
  },
  {
    "id": "srs-quiz-hot-cold-storage-archival-c2",
    "type": "quiz",
    "prompt": "Audit records must be kept for 7 years and are rarely read, but any record must be retrievable within 1 hour when a regulator asks. Which tier is the cheapest that reliably meets the SLA?",
    "answer": "Glacier Instant Retrieval, which returns objects in milliseconds\n\nExplanation: Deep Archive takes 12 to 48 hours and Flexible Retrieval Standard takes 3 to 5 hours, so both miss a 1-hour SLA despite being cheaper. Instant Retrieval meets it at a small fraction of hot NVMe cost.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-cold-storage-archival",
    "unitTitle": "Hot and cold storage, archival"
  },
  {
    "id": "srs-quiz-hot-cold-storage-archival-c3",
    "type": "quiz",
    "prompt": "A job exports Cassandra tables straight to Parquet in S3 without compacting first. Analysts querying the archive with Athena complain of slow queries. What is the likely cause?",
    "answer": "The export carried tombstones for deletes and expired TTLs, so the archive holds dead markers the engine must read and filter\n\nExplanation: Deletes, expired TTLs and null writes leave tombstones, and exporting without compaction copies that dead data into the archive, slowing every scan. Parquet and Athena work fine on compacted data; the 12 to 48 hour latency belongs to Deep Archive, not S3 Standard.",
    "category": "NoSQL Architectures, Partitioning & IDs",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "hot-cold-storage-archival",
    "unitTitle": "Hot and cold storage, archival"
  },
  {
    "id": "srs-takeaway-storage-engine-design-constraints-1",
    "type": "takeaway",
    "prompt": "In Storage engine design constraints, what is a fundamental rule regarding: Storage engines exist to bridge the 100,000x latency gap between DRAM and persistent physical disk?",
    "answer": "Storage engines exist to bridge the 100,000x latency gap between DRAM and persistent physical disk.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-design-constraints",
    "unitTitle": "Storage engine design constraints"
  },
  {
    "id": "srs-takeaway-storage-engine-design-constraints-2",
    "type": "takeaway",
    "prompt": "In Storage engine design constraints, what is a fundamental rule regarding: Flash storage cannot overwrite in place; random writes cause internal erase block garbage collection and wear?",
    "answer": "Flash storage cannot overwrite in place; random writes cause internal erase block garbage collection and wear.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-design-constraints",
    "unitTitle": "Storage engine design constraints"
  },
  {
    "id": "srs-takeaway-storage-engine-design-constraints-3",
    "type": "takeaway",
    "prompt": "In Storage engine design constraints, what is a fundamental rule regarding: Many engines use fdatasync() to skip unneeded metadata flushes, and some (InnoDB, ScyllaDB) use O_DIRECT to avoid double-caching, while PostgreSQL relies on buffered I/O plus fsync?",
    "answer": "Many engines use fdatasync() to skip unneeded metadata flushes, and some (InnoDB, ScyllaDB) use O_DIRECT to avoid double-caching, while PostgreSQL relies on buffered I/O plus fsync.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-design-constraints",
    "unitTitle": "Storage engine design constraints"
  },
  {
    "id": "srs-quiz-storage-engine-design-constraints-c1",
    "type": "quiz",
    "prompt": "An engine creates a new SSTable file, writes it, calls fsync on the file descriptor and returns success. The machine then loses power, and after reboot the file does not exist. What was missing?",
    "answer": "An fsync of the containing directory, because the file fsync does not make the new directory entry durable\n\nExplanation: A file fsync persists that file's data and metadata, but publishing a new or renamed name also requires syncing the directory. O_DIRECT only bypasses the page cache; it says nothing about directory entries being durable.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-design-constraints",
    "unitTitle": "Storage engine design constraints"
  },
  {
    "id": "srs-quiz-storage-engine-design-constraints-c2",
    "type": "quiz",
    "prompt": "A service must durably commit 20,000 transactions per second to a single log on a device where one fdatasync takes about 1 ms. What is the minimum average number of commits each flush must carry?",
    "answer": "At least 20 commits per flush\n\nExplanation: A 1 ms flush allows at most about 1,000 flushes per second, so 20,000 commits per second needs at least 20 commits per flush. The cost is that each commit waits roughly one flush interval; 200 per flush would work but is ten times more batching than required.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-design-constraints",
    "unitTitle": "Storage engine design constraints"
  },
  {
    "id": "srs-quiz-storage-engine-design-constraints-c3",
    "type": "quiz",
    "prompt": "On Linux, your engine's fsync on a data file returns EIO. A retry of the same fsync then returns success. Based on the PostgreSQL experience, what is the safe response?",
    "answer": "Treat the failure as fatal, crash, and recover from the WAL, because the failed pages may already have been dropped\n\nExplanation: PostgreSQL found that a failed fsync could drop the dirty pages, so a later fsync reports success even though the data never reached the device. Trusting the retry is exactly the bug; the only safe path is to treat the error as fatal and replay the WAL.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-design-constraints",
    "unitTitle": "Storage engine design constraints"
  },
  {
    "id": "srs-takeaway-storage-engine-tradeoffs-1",
    "type": "takeaway",
    "prompt": "In Storage engine tradeoffs, what is a fundamental rule regarding: The RUM tradeoff connects read overhead, update overhead, and auxiliary memory; disk-space amplification should be measured separately?",
    "answer": "The RUM tradeoff connects read overhead, update overhead, and auxiliary memory; disk-space amplification should be measured separately.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-tradeoffs",
    "unitTitle": "Storage engine tradeoffs"
  },
  {
    "id": "srs-takeaway-storage-engine-tradeoffs-2",
    "type": "takeaway",
    "prompt": "In Storage engine tradeoffs, what is a fundamental rule regarding: B+ Trees optimize for point reads and predictable space at the expense of random write amplification?",
    "answer": "B+ Trees optimize for point reads and predictable space at the expense of random write amplification.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-tradeoffs",
    "unitTitle": "Storage engine tradeoffs"
  },
  {
    "id": "srs-takeaway-storage-engine-tradeoffs-3",
    "type": "takeaway",
    "prompt": "In Storage engine tradeoffs, what is a fundamental rule regarding: LSM-Trees optimize for sequential write throughput and compression at the expense of point read complexity and background compaction?",
    "answer": "LSM-Trees optimize for sequential write throughput and compression at the expense of point read complexity and background compaction.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-tradeoffs",
    "unitTitle": "Storage engine tradeoffs"
  },
  {
    "id": "srs-quiz-storage-engine-tradeoffs-c1",
    "type": "quiz",
    "prompt": "In the RUM Conjecture as this lesson defines it, what does the M (memory overhead) measure?",
    "answer": "Auxiliary in-memory state the access method needs, such as indexes, filters and routing metadata\n\nExplanation: M is the auxiliary memory an access method needs, such as filters and indexes. Disk-space amplification is a related operational metric that the lesson says should be measured separately, which makes it the tempting but wrong choice.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-tradeoffs",
    "unitTitle": "Storage engine tradeoffs"
  },
  {
    "id": "srs-quiz-storage-engine-tradeoffs-c2",
    "type": "quiz",
    "prompt": "A workload is 95% point lookups over a working set that mostly fits in cache and 5% small updates. Which engine does the lesson's comparison favour, and for what reason?",
    "answer": "A B+ tree, because a lookup is a few mostly cached page reads while an LSM may probe several sorted runs\n\nExplanation: B+ trees answer a point read in about 2 to 3 page reads, usually from cache, while an LSM has to check the memtable, filters and possibly several SSTables. Choosing the B+ tree for its write amplification gets the reason backwards, because B+ trees usually have the higher write amplification.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-tradeoffs",
    "unitTitle": "Storage engine tradeoffs"
  },
  {
    "id": "srs-quiz-storage-engine-tradeoffs-c3",
    "type": "quiz",
    "prompt": "An LSM engine absorbs a heavy write burst smoothly for ten minutes, then starts stalling writers even though the WAL device is far from its sequential bandwidth limit. What limit has it most likely hit?",
    "answer": "Compaction bandwidth, which cannot keep up with ingest, so the engine throttles writes as debt grows\n\nExplanation: Bursts are limited by sequential bandwidth, but sustained LSM throughput is bounded by compaction, and engines stall writes when compaction falls behind. The WAL explanation does not fit, because the device still has spare sequential bandwidth.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "storage-engine-tradeoffs",
    "unitTitle": "Storage engine tradeoffs"
  },
  {
    "id": "srs-takeaway-file-backed-dictionary-storage-engine-1",
    "type": "takeaway",
    "prompt": "In A file-backed dictionary, what is a fundamental rule regarding: An append-only log with an in-memory hash index can locate a value with one logical range read; caches, filesystems, and devices determine the physical I/O?",
    "answer": "An append-only log with an in-memory hash index can locate a value with one logical range read; caches, filesystems, and devices determine the physical I/O.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "file-backed-dictionary-storage-engine",
    "unitTitle": "A file-backed dictionary"
  },
  {
    "id": "srs-takeaway-file-backed-dictionary-storage-engine-2",
    "type": "takeaway",
    "prompt": "In A file-backed dictionary, what is a fundamental rule regarding: Updates never overwrite previous data; they append new versions and update the in-memory byte offset pointer?",
    "answer": "Updates never overwrite previous data; they append new versions and update the in-memory byte offset pointer.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "file-backed-dictionary-storage-engine",
    "unitTitle": "A file-backed dictionary"
  },
  {
    "id": "srs-takeaway-file-backed-dictionary-storage-engine-3",
    "type": "takeaway",
    "prompt": "In A file-backed dictionary, what is a fundamental rule regarding: Deletions are recorded as append-only tombstone records that invalidate previous entries during compaction?",
    "answer": "Deletions are recorded as append-only tombstone records that invalidate previous entries during compaction.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "file-backed-dictionary-storage-engine",
    "unitTitle": "A file-backed dictionary"
  },
  {
    "id": "srs-quiz-file-backed-dictionary-storage-engine-c1",
    "type": "quiz",
    "prompt": "In an append-only log with an in-memory hash index, how must a delete be implemented so that it survives a restart?",
    "answer": "Append a tombstone record and remove the key from the in-memory index\n\nExplanation: The log cannot be modified in place, so a delete appends a tombstone and drops the key from the index. Removing the key only from RAM is the tempting shortcut, but a restart rebuilds the index by scanning the log and would bring the deleted key back.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "file-backed-dictionary-storage-engine",
    "unitTitle": "A file-backed dictionary"
  },
  {
    "id": "srs-quiz-file-backed-dictionary-storage-engine-c2",
    "type": "quiz",
    "prompt": "Using the lesson's budget of about 80 to 100 bytes of RAM per key, how much memory does the hash index need for 50 million keys with 20-byte keys and 1 KB values?",
    "answer": "About 4 to 5 GB\n\nExplanation: 50 million keys times 80 to 100 bytes is about 4 to 5 GB. Value size does not affect index RAM; 50 GB is roughly the size of the data on disk, not the index.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "file-backed-dictionary-storage-engine",
    "unitTitle": "A file-backed dictionary"
  },
  {
    "id": "srs-quiz-file-backed-dictionary-storage-engine-c3",
    "type": "quiz",
    "prompt": "During recovery the scan reaches the final record of the newest segment and its CRC does not match. What should recovery do?",
    "answer": "Truncate the segment back to that record's start offset and continue\n\nExplanation: A bad CRC on the very last record is the signature of a crash mid-append, so recovery truncates that torn tail. Indexing it because the header parsed would serve corrupt data, and keeping its bytes leaves garbage that every later scan would have to step over.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "file-backed-dictionary-storage-engine",
    "unitTitle": "A file-backed dictionary"
  },
  {
    "id": "srs-takeaway-custom-binary-file-format-1",
    "type": "takeaway",
    "prompt": "In Custom binary file format, what is a fundamental rule regarding: Custom binary formats avoid text-parsing CPU overhead, and combined with an offset index or fixed-size slots they enable single-read random access by offset?",
    "answer": "Custom binary formats avoid text-parsing CPU overhead, and combined with an offset index or fixed-size slots they enable single-read random access by offset.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "custom-binary-file-format",
    "unitTitle": "Custom binary file format"
  },
  {
    "id": "srs-takeaway-custom-binary-file-format-2",
    "type": "takeaway",
    "prompt": "In Custom binary file format, what is a fundamental rule regarding: A binary format should include only the boundaries, versioning, integrity checks, and mutation metadata required by its recovery and compatibility contract?",
    "answer": "A binary format should include only the boundaries, versioning, integrity checks, and mutation metadata required by its recovery and compatibility contract.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "custom-binary-file-format",
    "unitTitle": "Custom binary file format"
  },
  {
    "id": "srs-takeaway-custom-binary-file-format-3",
    "type": "takeaway",
    "prompt": "In Custom binary file format, what is a fundamental rule regarding: Block sizing and alignment should follow measured filesystem and device constraints; padding trades simpler I/O for extra space?",
    "answer": "Block sizing and alignment should follow measured filesystem and device constraints; padding trades simpler I/O for extra space.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "custom-binary-file-format",
    "unitTitle": "Custom binary file format"
  },
  {
    "id": "srs-quiz-custom-binary-file-format-c1",
    "type": "quiz",
    "prompt": "Which file header field lets a newer build of the engine read, or migrate, files written by an older build without guessing their layout?",
    "answer": "The format version\n\nExplanation: The format version tells a reader which layout rules apply, so upgrades can read or migrate old files. Magic bytes only confirm that the file is the right kind of file; they say nothing about which revision of the layout it uses.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "custom-binary-file-format",
    "unitTitle": "Custom binary file format"
  },
  {
    "id": "srs-quiz-custom-binary-file-format-c2",
    "type": "quiz",
    "prompt": "Using the lesson's layout (4-byte CRC, 8-byte timestamp, 4-byte key length, 4-byte value length, then key and value), a record starts at offset 8,192 with a 12-byte key and a 500-byte value. At what offset does the next record start?",
    "answer": "8,724\n\nExplanation: The fixed header is 20 bytes, so the record is 20 + 12 + 500 = 532 bytes and the next record starts at 8,724. 8,704 forgets the header and 8,712 forgets the key.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "custom-binary-file-format",
    "unitTitle": "Custom binary file format"
  },
  {
    "id": "srs-quiz-custom-binary-file-format-c3",
    "type": "quiz",
    "prompt": "Parquet puts its metadata (row group and column chunk offsets) in a footer at the end of the file rather than in a header. What does this design buy?",
    "answer": "A writer can stream row groups without knowing their offsets up front, and a reader finds the metadata with one small read from the tail\n\nExplanation: Offsets are only known once the data has been written, so a footer lets the writer stream first and describe afterwards, and a reader can fetch it with one small tail read. The metadata is actually written last, not first, so the crash-safety option has it backwards.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "custom-binary-file-format",
    "unitTitle": "Custom binary file format"
  },
  {
    "id": "srs-takeaway-byte-range-indexed-object-storage-1",
    "type": "takeaway",
    "prompt": "In Byte-range indexed object storage, what is a fundamental rule regarding: Byte-range storage uses HTTP 206 Partial Content and pread() to access sub-regions of massive files without downloading the full blob?",
    "answer": "Byte-range storage uses HTTP 206 Partial Content and pread() to access sub-regions of massive files without downloading the full blob.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "byte-range-indexed-object-storage",
    "unitTitle": "Byte-range indexed object storage"
  },
  {
    "id": "srs-takeaway-byte-range-indexed-object-storage-2",
    "type": "takeaway",
    "prompt": "In Byte-range indexed object storage, what is a fundamental rule regarding: Auxiliary index tables map logical byte intervals to physical storage block IDs for constant-time seek operations?",
    "answer": "Auxiliary index tables map logical byte intervals to physical storage block IDs for constant-time seek operations.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "byte-range-indexed-object-storage",
    "unitTitle": "Byte-range indexed object storage"
  },
  {
    "id": "srs-takeaway-byte-range-indexed-object-storage-3",
    "type": "takeaway",
    "prompt": "In Byte-range indexed object storage, what is a fundamental rule regarding: Large container files aggregate millions of small assets to avoid per-file filesystem metadata overhead (extra inode and directory reads per access)?",
    "answer": "Large container files aggregate millions of small assets to avoid per-file filesystem metadata overhead (extra inode and directory reads per access).",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "byte-range-indexed-object-storage",
    "unitTitle": "Byte-range indexed object storage"
  },
  {
    "id": "srs-quiz-byte-range-indexed-object-storage-c1",
    "type": "quiz",
    "prompt": "Many threads serve range reads from the same open file descriptor. Why does the lesson prefer pread over lseek followed by read?",
    "answer": "pread reads at an explicit offset without moving the shared file pointer, so threads cannot race on it\n\nExplanation: lseek changes a file pointer that all threads share, so another thread can move it between the seek and the read; pread passes the offset explicitly and avoids that race. It is still a synchronous, page-cached call, so the cache-bypass and async options are wrong.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "byte-range-indexed-object-storage",
    "unitTitle": "Byte-range indexed object storage"
  },
  {
    "id": "srs-quiz-byte-range-indexed-object-storage-c2",
    "type": "quiz",
    "prompt": "A file is indexed in 4 MiB (4,194,304-byte) chunks numbered from 0. A client requests Range: bytes=12582912-20971519. Which chunks must be read?",
    "answer": "Two chunks: chunks 3 and 4\n\nExplanation: 12,582,912 / 4,194,304 is exactly 3, and the last byte 20,971,519 falls in chunk 4 (it is one byte short of chunk 5's start at 20,971,520). Range end offsets are inclusive, which is why chunk 5 is not touched.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "byte-range-indexed-object-storage",
    "unitTitle": "Byte-range indexed object storage"
  },
  {
    "id": "srs-quiz-byte-range-indexed-object-storage-c3",
    "type": "quiz",
    "prompt": "A query engine reads a Parquet footer from object storage, then issues range reads for column chunks. Occasionally the data reads return bytes that fail to decode. Another job sometimes overwrites the same key. What is the right fix?",
    "answer": "Pin the object version ID, or send If-Match with the footer's ETag, on every data read\n\nExplanation: The footer's offsets describe one version of the object, so every data read must be tied to that version with a version ID or a conditional request. Re-checking the footer afterwards narrows the race but does not close it, and bigger or faster reads only make the race less likely.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "byte-range-indexed-object-storage",
    "unitTitle": "Byte-range indexed object storage"
  },
  {
    "id": "srs-takeaway-immutable-versioned-data-files-1",
    "type": "takeaway",
    "prompt": "In Immutable versioned data files, what is a fundamental rule regarding: Copy-on-write preserves older pages while building a new generation, but commit metadata, flush ordering, checksums, and writer coordination still determine crash safety?",
    "answer": "Copy-on-write preserves older pages while building a new generation, but commit metadata, flush ordering, checksums, and writer coordination still determine crash safety.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "immutable-versioned-data-files",
    "unitTitle": "Immutable versioned data files"
  },
  {
    "id": "srs-takeaway-immutable-versioned-data-files-2",
    "type": "takeaway",
    "prompt": "In Immutable versioned data files, what is a fundamental rule regarding: Immutable published pages can let readers avoid page-update latches when lifetime and reclamation are coordinated correctly?",
    "answer": "Immutable published pages can let readers avoid page-update latches when lifetime and reclamation are coordinated correctly.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "immutable-versioned-data-files",
    "unitTitle": "Immutable versioned data files"
  },
  {
    "id": "srs-takeaway-immutable-versioned-data-files-3",
    "type": "takeaway",
    "prompt": "In Immutable versioned data files, what is a fundamental rule regarding: A CoW commit publishes a new root only after its referenced pages are durable, and recovery must distinguish a complete generation from a torn publication?",
    "answer": "A CoW commit publishes a new root only after its referenced pages are durable, and recovery must distinguish a complete generation from a torn publication.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "immutable-versioned-data-files",
    "unitTitle": "Immutable versioned data files"
  },
  {
    "id": "srs-quiz-immutable-versioned-data-files-c1",
    "type": "quiz",
    "prompt": "A copy-on-write B+tree has built a new leaf, internal page and root for an update. In what order must it persist things for the commit to be crash safe?",
    "answer": "Flush the new pages first, then write and flush the metadata page that names the new root\n\nExplanation: The metadata must never point at pages that might not be on disk, so the pages are flushed before the metadata that references them. An atomic in-memory pointer swap is not a durable commit, and a single write call gives no ordering guarantee across a crash.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "immutable-versioned-data-files",
    "unitTitle": "Immutable versioned data files"
  },
  {
    "id": "srs-quiz-immutable-versioned-data-files-c2",
    "type": "quiz",
    "prompt": "A copy-on-write B+tree has depth 4 (root, two internal levels, leaf) and 8 KB pages. How many bytes of tree pages are written to update one 100-byte value?",
    "answer": "32 KB plus a meta page\n\nExplanation: Every page on the path from the leaf to the root is copied: 4 pages of 8 KB is 32 KB, plus the meta page that publishes the new root. Answering 8 KB assumes only the leaf changes, which ignores that each parent must be rewritten to point at its new child.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "immutable-versioned-data-files",
    "unitTitle": "Immutable versioned data files"
  },
  {
    "id": "srs-quiz-immutable-versioned-data-files-c3",
    "type": "quiz",
    "prompt": "An LMDB-backed service keeps a steady amount of live data, yet its data file grows every day. What is the most likely cause?",
    "answer": "A forgotten long-running read transaction pins an old snapshot, so freed pages cannot be reused\n\nExplanation: Old pages are reused only once no reader still needs their snapshot, so one stale reader stops reclamation and the file grows. CoW engines do reclaim pages, so the no-reclamation option is wrong; the lesson's advice is to monitor the age of the oldest reader.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "immutable-versioned-data-files",
    "unitTitle": "Immutable versioned data files"
  },
  {
    "id": "srs-takeaway-log-structured-storage-1",
    "type": "takeaway",
    "prompt": "In Log-structured storage, what is a fundamental rule regarding: Log-structured storage converts all random updates into high-throughput sequential disk appends?",
    "answer": "Log-structured storage converts all random updates into high-throughput sequential disk appends.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "log-structured-storage",
    "unitTitle": "Log-structured storage"
  },
  {
    "id": "srs-takeaway-log-structured-storage-2",
    "type": "takeaway",
    "prompt": "In Log-structured storage, what is a fundamental rule regarding: Deletions and updates leave obsolete versions in place, requiring background compaction to reclaim space?",
    "answer": "Deletions and updates leave obsolete versions in place, requiring background compaction to reclaim space.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "log-structured-storage",
    "unitTitle": "Log-structured storage"
  },
  {
    "id": "srs-takeaway-log-structured-storage-3",
    "type": "takeaway",
    "prompt": "In Log-structured storage, what is a fundamental rule regarding: LFS principles power modern storage engines including RocksDB, Bigtable, Kafka, and Cassandra?",
    "answer": "LFS principles power modern storage engines including RocksDB, Bigtable, Kafka, and Cassandra.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "log-structured-storage",
    "unitTitle": "Log-structured storage"
  },
  {
    "id": "srs-quiz-log-structured-storage-c1",
    "type": "quiz",
    "prompt": "When the cleaner processes a segment, how does it decide which records to copy forward?",
    "answer": "It keeps records that the index still identifies as the latest version of their key\n\nExplanation: The cleaner asks the index which record is the live version of each key, copies only those, and drops overwritten values and tombstones. A valid checksum only shows the bytes are intact; it says nothing about whether a newer version has replaced the record.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "log-structured-storage",
    "unitTitle": "Log-structured storage"
  },
  {
    "id": "srs-quiz-log-structured-storage-c2",
    "type": "quiz",
    "prompt": "Using the LFS model, write cost is 2 / (1 - u). If segments are 75% live when the cleaner picks them, how many bytes of I/O are moved per byte of new data?",
    "answer": "8\n\nExplanation: With u = 0.75, 2 / 0.25 = 8: the cleaner reads the whole segment and rewrites three quarters of it to free one quarter. 2.7 comes from using 1 - u = 0.75 by mistake, which would describe a mostly empty segment.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "log-structured-storage",
    "unitTitle": "Log-structured storage"
  },
  {
    "id": "srs-quiz-log-structured-storage-c3",
    "type": "quiz",
    "prompt": "A log-structured store is run at 95% disk utilization with uniformly random updates across all keys. What degrades first?",
    "answer": "Write throughput, because cleaned segments are mostly live and each new byte costs tens of bytes of cleaning\n\nExplanation: With random updates the segments the cleaner can choose are nearly as full as the disk, so u is around 0.95 and write cost approaches 2 / 0.05 = 40. Scattered reads are a real cost, but an index handles them; the cleaner is what stalls near full utilization.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "log-structured-storage",
    "unitTitle": "Log-structured storage"
  },
  {
    "id": "srs-takeaway-bitcask-storage-engine-1",
    "type": "takeaway",
    "prompt": "In Bitcask storage engine, what is a fundamental rule regarding: Bitcask stores all keys in an in-memory hash table (Keydir) and all values in append-only disk segments?",
    "answer": "Bitcask stores all keys in an in-memory hash table (Keydir) and all values in append-only disk segments.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bitcask-storage-engine",
    "unitTitle": "Bitcask storage engine"
  },
  {
    "id": "srs-takeaway-bitcask-storage-engine-2",
    "type": "takeaway",
    "prompt": "In Bitcask storage engine, what is a fundamental rule regarding: Reads require exactly 1 disk seek; writes are sequential appends requiring 0 seeks?",
    "answer": "Reads require exactly 1 disk seek; writes are sequential appends requiring 0 seeks.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bitcask-storage-engine",
    "unitTitle": "Bitcask storage engine"
  },
  {
    "id": "srs-takeaway-bitcask-storage-engine-3",
    "type": "takeaway",
    "prompt": "In Bitcask storage engine, what is a fundamental rule regarding: Hint files store keys and byte offsets without values, enabling instant startup and crash recovery?",
    "answer": "Hint files store keys and byte offsets without values, enabling instant startup and crash recovery.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bitcask-storage-engine",
    "unitTitle": "Bitcask storage engine"
  },
  {
    "id": "srs-quiz-bitcask-storage-engine-c1",
    "type": "quiz",
    "prompt": "What does a Bitcask hint file entry contain?",
    "answer": "Timestamp, key size, value size, value position and the key, but not the value\n\nExplanation: A hint entry is a data-file entry with the value bytes replaced by the value's position, which is enough to rebuild the keydir without reading values. If positions had to be recomputed by scanning data files, the hint file would save nothing at startup.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bitcask-storage-engine",
    "unitTitle": "Bitcask storage engine"
  },
  {
    "id": "srs-quiz-bitcask-storage-engine-c2",
    "type": "quiz",
    "prompt": "Using Riak's guidance of about 45 bytes of fixed keydir overhead per key plus the key itself, how much keydir RAM does one replica need for 500 million keys averaging 20 bytes?",
    "answer": "About 32 GB\n\nExplanation: 500 million times (20 + 45) bytes is about 32.5 GB per replica. 22 GB counts only the fixed overhead and 10 GB only the key bytes; the real cost is both together.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bitcask-storage-engine",
    "unitTitle": "Bitcask storage engine"
  },
  {
    "id": "srs-quiz-bitcask-storage-engine-c3",
    "type": "quiz",
    "prompt": "During a Bitcask merge, which rule decides whether a record from an old data file is copied into the merged file?",
    "answer": "Keep it only if the keydir still points at that exact file and offset\n\nExplanation: Only the keydir knows the current location of each key, which may be in the active file or another file outside the merge. Keeping the newest record among the merged files would copy a stale version, and repointing the keydir at it would roll the key back.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "bitcask-storage-engine",
    "unitTitle": "Bitcask storage engine"
  },
  {
    "id": "srs-takeaway-lsm-tree-storage-engine-1",
    "type": "takeaway",
    "prompt": "In LSM-tree storage engine, what is a fundamental rule regarding: LSM-trees buffer writes in memory (Memtable) and persist them as immutable sorted files (SSTables)?",
    "answer": "LSM-trees buffer writes in memory (Memtable) and persist them as immutable sorted files (SSTables).",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-tree-storage-engine",
    "unitTitle": "LSM-tree storage engine"
  },
  {
    "id": "srs-takeaway-lsm-tree-storage-engine-2",
    "type": "takeaway",
    "prompt": "In LSM-tree storage engine, what is a fundamental rule regarding: Data is always kept sorted by key, enabling range queries and merge-sort compaction?",
    "answer": "Data is always kept sorted by key, enabling range queries and merge-sort compaction.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-tree-storage-engine",
    "unitTitle": "LSM-tree storage engine"
  },
  {
    "id": "srs-takeaway-lsm-tree-storage-engine-3",
    "type": "takeaway",
    "prompt": "In LSM-tree storage engine, what is a fundamental rule regarding: RocksDB and Cassandra use LSM-trees to absorb massive write workloads with minimal write latency?",
    "answer": "RocksDB and Cassandra use LSM-trees to absorb massive write workloads with minimal write latency.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-tree-storage-engine",
    "unitTitle": "LSM-tree storage engine"
  },
  {
    "id": "srs-quiz-lsm-tree-storage-engine-c1",
    "type": "quiz",
    "prompt": "Why might a point lookup have to check every Level 0 file, while in leveled compaction it checks at most one file per lower level?",
    "answer": "L0 files are flushed memtables whose key ranges overlap, so any of them may hold the key\n\nExplanation: Each L0 file is a flushed memtable covering an arbitrary key range, so ranges overlap; lower leveled files are kept non-overlapping so key-range metadata picks one. L0 files are still sorted and immutable, so the unsorted and mutable options are wrong.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-tree-storage-engine",
    "unitTitle": "LSM-tree storage engine"
  },
  {
    "id": "srs-quiz-lsm-tree-storage-engine-c2",
    "type": "quiz",
    "prompt": "With a Level 1 target of 256 MB and a size multiplier of 10 per level, how many levels below L0 are needed to hold 20 TB?",
    "answer": "6\n\nExplanation: Cumulative capacity through L5 is about 2.8 TB, and adding L6 at 25.6 TB brings it to about 28 TB, so six levels are needed. Five levels is right for the lesson's 2 TB case but falls an order of magnitude short here.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-tree-storage-engine",
    "unitTitle": "LSM-tree storage engine"
  },
  {
    "id": "srs-quiz-lsm-tree-storage-engine-c3",
    "type": "quiz",
    "prompt": "Compaction falls behind and L0 grows from 4 files to 40, with five levels below. Every file has a 1% false-positive Bloom filter. What happens to a lookup for a key that does not exist?",
    "answer": "Expected wasted block reads and filter probes both grow about fivefold\n\nExplanation: Candidate files rise from 9 to 45, so filter probes rise fivefold and expected false-positive block reads go from about 0.09 to about 0.45. Filters reduce the cost per file but not the number of files, which is why engines throttle writes when L0 grows.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-tree-storage-engine",
    "unitTitle": "LSM-tree storage engine"
  },
  {
    "id": "srs-takeaway-memtable-wal-and-sstable-1",
    "type": "takeaway",
    "prompt": "In Memtable, WAL, and SSTable, what is a fundamental rule regarding: WAL provides durability (once appends are synced) via fast sequential appends, while Memtable provides fast concurrent in-memory sorting?",
    "answer": "WAL provides durability (once appends are synced) via fast sequential appends, while Memtable provides fast concurrent in-memory sorting.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "memtable-wal-and-sstable",
    "unitTitle": "Memtable, WAL, and SSTable"
  },
  {
    "id": "srs-takeaway-memtable-wal-and-sstable-2",
    "type": "takeaway",
    "prompt": "In Memtable, WAL, and SSTable, what is a fundamental rule regarding: SkipLists are preferred over balanced trees for Memtables because CAS pointers allow lock-free concurrent writes?",
    "answer": "SkipLists are preferred over balanced trees for Memtables because CAS pointers allow lock-free concurrent writes.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "memtable-wal-and-sstable",
    "unitTitle": "Memtable, WAL, and SSTable"
  },
  {
    "id": "srs-takeaway-memtable-wal-and-sstable-3",
    "type": "takeaway",
    "prompt": "In Memtable, WAL, and SSTable, what is a fundamental rule regarding: Flushing Memtables sequentially writes immutable SSTables containing data blocks, sparse indexes, and Bloom filters?",
    "answer": "Flushing Memtables sequentially writes immutable SSTables containing data blocks, sparse indexes, and Bloom filters.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "memtable-wal-and-sstable",
    "unitTitle": "Memtable, WAL, and SSTable"
  },
  {
    "id": "srs-quiz-memtable-wal-and-sstable-c1",
    "type": "quiz",
    "prompt": "A memtable backed by log file 000123.log has been frozen and is being flushed to 000124.sst. At what point can 000123.log safely be deleted?",
    "answer": "After the SSTable is synced and recorded in the MANIFEST\n\nExplanation: Until the SSTable is durable and the MANIFEST lists it as live, the log is the only durable copy of those writes. Waiting for a later compaction is unnecessary, because once the SST is recorded the data is already safe.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "memtable-wal-and-sstable",
    "unitTitle": "Memtable, WAL, and SSTable"
  },
  {
    "id": "srs-quiz-memtable-wal-and-sstable-c2",
    "type": "quiz",
    "prompt": "A Cassandra node uses the default periodic commitlog sync of 10 seconds. The node loses power. What can be lost on that node?",
    "answer": "Up to about 10 seconds of writes that were already acknowledged to clients\n\nExplanation: In periodic mode the append reaches the log file in the OS page cache and the write is acknowledged before the next sync, so a power loss can drop up to one interval of acknowledged writes. The first option confuses appended with durable; a process crash alone would be safe.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "memtable-wal-and-sstable",
    "unitTitle": "Memtable, WAL, and SSTable"
  },
  {
    "id": "srs-quiz-memtable-wal-and-sstable-c3",
    "type": "quiz",
    "prompt": "To reduce flush frequency, a team raises the memtable size from 64 MB to 2 GB per column family. What gets worse?",
    "answer": "Crash recovery, because far more WAL must be replayed, and RAM use grows\n\nExplanation: A bigger memtable covers more unflushed log, so recovery replays much more WAL and memory use rises. Larger memtables tend to reduce compaction work rather than increase it, and filter accuracy depends on bits per key, not file size.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "memtable-wal-and-sstable",
    "unitTitle": "Memtable, WAL, and SSTable"
  },
  {
    "id": "srs-takeaway-lsm-read-path-bloom-and-sparse-index-1",
    "type": "takeaway",
    "prompt": "In LSM read path: Bloom filters and sparse index, what is a fundamental rule regarding: Bloom filters eliminate 99% of negative disk reads by guaranteeing zero false negatives using ~10 bits per key in RAM?",
    "answer": "Bloom filters eliminate 99% of negative disk reads by guaranteeing zero false negatives using ~10 bits per key in RAM.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-read-path-bloom-and-sparse-index",
    "unitTitle": "LSM read path: Bloom filters and sparse index"
  },
  {
    "id": "srs-takeaway-lsm-read-path-bloom-and-sparse-index-2",
    "type": "takeaway",
    "prompt": "In LSM read path: Bloom filters and sparse index, what is a fundamental rule regarding: Sparse indexes store only one boundary key per 4KB disk block, minimizing memory footprint while directing reads to exact disk blocks?",
    "answer": "Sparse indexes store only one boundary key per 4KB disk block, minimizing memory footprint while directing reads to exact disk blocks.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-read-path-bloom-and-sparse-index",
    "unitTitle": "LSM read path: Bloom filters and sparse index"
  },
  {
    "id": "srs-takeaway-lsm-read-path-bloom-and-sparse-index-3",
    "type": "takeaway",
    "prompt": "In LSM read path: Bloom filters and sparse index, what is a fundamental rule regarding: The read path queries in order?",
    "answer": "The read path queries in order: Active Memtable -> Immutable Memtables -> Level 0 SSTables -> Level 1..N SSTables.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-read-path-bloom-and-sparse-index",
    "unitTitle": "LSM read path: Bloom filters and sparse index"
  },
  {
    "id": "srs-quiz-lsm-read-path-bloom-and-sparse-index-c1",
    "type": "quiz",
    "prompt": "An SSTable's Bloom filter reports that key K is not present. What can the engine conclude?",
    "answer": "K is definitely not in that SSTable, so the file can be skipped with no disk read\n\nExplanation: Bloom filters have no false negatives, so a negative answer means that file does not contain K. The roughly 1% uncertainty applies only to positive answers, and one file's filter says nothing about other files or levels.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-read-path-bloom-and-sparse-index",
    "unitTitle": "LSM read path: Bloom filters and sparse index"
  },
  {
    "id": "srs-quiz-lsm-read-path-bloom-and-sparse-index-c2",
    "type": "quiz",
    "prompt": "You give an SSTable holding 50 million keys a Bloom filter of 15 bits per key. Roughly how large is the filter and what false-positive rate should you expect?",
    "answer": "About 94 MB, false positive rate about 0.07%\n\nExplanation: 50 million times 15 bits is 750 million bits, which is about 94 MB, and the lesson's table gives about 0.07% at 15 bits per key. 750 MB treats bits as bytes, and 0.8% is the rate for 10 bits per key.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-read-path-bloom-and-sparse-index",
    "unitTitle": "LSM read path: Bloom filters and sparse index"
  },
  {
    "id": "srs-quiz-lsm-read-path-bloom-and-sparse-index-c3",
    "type": "quiz",
    "prompt": "A workload is dominated by short range scans within one user's key prefix, such as all orders for user 42. Why do standard point Bloom filters not help, and what does?",
    "answer": "Point filters only answer exact-key membership; prefix Bloom filters let scans within one prefix skip files\n\nExplanation: A point filter hashes whole keys, so it cannot say whether any key in a range exists; a prefix filter hashes the prefix and can rule a file out for a bounded scan. More bits per key only makes exact-key answers more accurate and does nothing for ranges.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "lsm-read-path-bloom-and-sparse-index",
    "unitTitle": "LSM read path: Bloom filters and sparse index"
  },
  {
    "id": "srs-takeaway-compaction-and-amplification-1",
    "type": "takeaway",
    "prompt": "In Compaction and amplification, what is a fundamental rule regarding: Compaction is the multi-way merge sort that reclaims space from obsolete versions and tombstones?",
    "answer": "Compaction is the multi-way merge sort that reclaims space from obsolete versions and tombstones.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "compaction-and-amplification",
    "unitTitle": "Compaction and amplification"
  },
  {
    "id": "srs-takeaway-compaction-and-amplification-2",
    "type": "takeaway",
    "prompt": "In Compaction and amplification, what is a fundamental rule regarding: Size-Tiered Compaction minimizes write amplification, making it ideal for write-heavy append workloads (Cassandra)?",
    "answer": "Size-Tiered Compaction minimizes write amplification, making it ideal for write-heavy append workloads (Cassandra).",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "compaction-and-amplification",
    "unitTitle": "Compaction and amplification"
  },
  {
    "id": "srs-takeaway-compaction-and-amplification-3",
    "type": "takeaway",
    "prompt": "In Compaction and amplification, what is a fundamental rule regarding: Leveled Compaction minimizes space amplification and maximizes read performance, making it the standard for RocksDB?",
    "answer": "Leveled Compaction minimizes space amplification and maximizes read performance, making it the standard for RocksDB.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "compaction-and-amplification",
    "unitTitle": "Compaction and amplification"
  },
  {
    "id": "srs-quiz-compaction-and-amplification-c1",
    "type": "quiz",
    "prompt": "Why are point reads usually cheaper under leveled compaction than under size-tiered compaction?",
    "answer": "Leveled compaction keeps each level below L0 non-overlapping, so at most one file per level can hold a key\n\nExplanation: Non-overlapping levels mean key-range metadata points to at most one file per level, while size-tiered keeps several overlapping runs per tier that may all need probing. Size-tiered runs still use Bloom filters; they simply have more candidate files to check.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "compaction-and-amplification",
    "unitTitle": "Compaction and amplification"
  },
  {
    "id": "srs-quiz-compaction-and-amplification-c2",
    "type": "quiz",
    "prompt": "A leveled LSM ingests 80 MB/s of user data and has a measured write amplification of 25x. What sustained write rate must the storage devices absorb?",
    "answer": "About 2 GB/s\n\nExplanation: Write amplification multiplies user bytes: 80 MB/s times 25 is 2 GB/s, or roughly 170 TB per day. 80 MB/s ignores compaction rewrites entirely, and that gap is why write-heavy clusters wear out drives rated in drive writes per day.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "compaction-and-amplification",
    "unitTitle": "Compaction and amplification"
  },
  {
    "id": "srs-quiz-compaction-and-amplification-c3",
    "type": "quiz",
    "prompt": "A team uses a Cassandra table as a work queue: insert a row, read the oldest rows, delete them. After a few days, reads of the queue partition start failing. What is happening?",
    "answer": "Reads must scan long runs of tombstones that cannot be purged yet, crossing the tombstone failure threshold\n\nExplanation: Each delete leaves a tombstone that stays until compaction and gc_grace_seconds (10 days by default) allow purging, so reading the head of the queue walks thousands of them; Cassandra fails a query at 100,000 by default. Cassandra does not lock partitions on delete, so the locking option describes a different kind of database.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "compaction-and-amplification",
    "unitTitle": "Compaction and amplification"
  },
  {
    "id": "srs-takeaway-object-storage-vs-database-1",
    "type": "takeaway",
    "prompt": "In Object storage vs database, what is a fundamental rule regarding: Databases provide low-latency sub-millisecond access to mutable, fine-grained structured records?",
    "answer": "Databases provide low-latency sub-millisecond access to mutable, fine-grained structured records.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-vs-database",
    "unitTitle": "Object storage vs database"
  },
  {
    "id": "srs-takeaway-object-storage-vs-database-2",
    "type": "takeaway",
    "prompt": "In Object storage vs database, what is a fundamental rule regarding: Object storage provides named blob versions over an HTTP API; keys can usually be overwritten or deleted, while retained versions may be immutable?",
    "answer": "Object storage provides named blob versions over an HTTP API; keys can usually be overwritten or deleted, while retained versions may be immutable. Cost and latency depend on provider, tier, request mix, and data transfer.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-vs-database",
    "unitTitle": "Object storage vs database"
  },
  {
    "id": "srs-takeaway-object-storage-vs-database-3",
    "type": "takeaway",
    "prompt": "In Object storage vs database, what is a fundamental rule regarding: For large independently accessed payloads, compare object storage with database blobs using transactionality, backup, access size, request cost, and operational simplicity rather than applying a universal prohibition?",
    "answer": "For large independently accessed payloads, compare object storage with database blobs using transactionality, backup, access size, request cost, and operational simplicity rather than applying a universal prohibition.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-vs-database",
    "unitTitle": "Object storage vs database"
  },
  {
    "id": "srs-quiz-object-storage-vs-database-c1",
    "type": "quiz",
    "prompt": "You need to change 1 KB in the middle of a 2 GB object stored in S3. What does the object model require?",
    "answer": "Write a whole new version of the object, because objects cannot be modified in place\n\nExplanation: Object storage is coarse grained: an object can only be replaced or deleted as a whole. Range headers apply to reads (GET), not to in-place writes, which is what makes the first option tempting but wrong.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-vs-database",
    "unitTitle": "Object storage vs database"
  },
  {
    "id": "srs-quiz-object-storage-vs-database-c2",
    "type": "quiz",
    "prompt": "Using the lesson's price of about USD 0.023 per GB-month for S3 Standard, roughly what is the monthly storage cost for 200 million images averaging 250 KB?",
    "answer": "About USD 1,150\n\nExplanation: 200 million times 250 KB is 50 TB, or 50,000 GB, and 50,000 times 0.023 is about USD 1,150 a month. About USD 11,500 is closer to what three SSD database replicas would cost, which is the point of the comparison.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-vs-database",
    "unitTitle": "Object storage vs database"
  },
  {
    "id": "srs-quiz-object-storage-vs-database-c3",
    "type": "quiz",
    "prompt": "In the presigned-upload pattern, a client uploads the object and then crashes before the completion callback, so the row stays pending. What cleans this up?",
    "answer": "A periodic sweeper deletes objects that have no active row after a grace period\n\nExplanation: The database and the object store are two systems with no shared transaction, so the design adds a sweeper that removes orphans and alerts on rows whose object is missing. URL expiry only stops new uploads through that URL; it never deletes objects already stored.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-vs-database",
    "unitTitle": "Object storage vs database"
  },
  {
    "id": "srs-takeaway-s3-object-storage-architecture-1",
    "type": "takeaway",
    "prompt": "In S3 object storage architecture, what is a fundamental rule regarding: A scalable object-store design can separate a strongly controlled metadata plane from a payload storage plane?",
    "answer": "A scalable object-store design can separate a strongly controlled metadata plane from a payload storage plane.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "s3-object-storage-architecture",
    "unitTitle": "S3 object storage architecture"
  },
  {
    "id": "srs-takeaway-s3-object-storage-architecture-2",
    "type": "takeaway",
    "prompt": "In S3 object storage architecture, what is a fundamental rule regarding: Payloads may be chunked, replicated or erasure-coded across independent failure domains according to the service's durability contract?",
    "answer": "Payloads may be chunked, replicated or erasure-coded across independent failure domains according to the service's durability contract.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "s3-object-storage-architecture",
    "unitTitle": "S3 object storage architecture"
  },
  {
    "id": "srs-takeaway-s3-object-storage-architecture-3",
    "type": "takeaway",
    "prompt": "In S3 object storage architecture, what is a fundamental rule regarding: The metadata engine indexes keys lexicographically to support fast delimiter and prefix searches?",
    "answer": "The metadata engine indexes keys lexicographically to support fast delimiter and prefix searches.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "s3-object-storage-architecture",
    "unitTitle": "S3 object storage architecture"
  },
  {
    "id": "srs-quiz-s3-object-storage-architecture-c1",
    "type": "quiz",
    "prompt": "Why does an S3-like metadata tier keep keys in partitioned B-trees or LSM-trees instead of a simple hash ring?",
    "answer": "Prefix LIST needs keys stored in sorted order so a listing becomes a range scan\n\nExplanation: LIST with a prefix is a range scan, which only works if adjacent keys sit together in sorted order; hashing would scatter them across every partition. Hash rings replicate across zones perfectly well, so that option names a problem that does not exist.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "s3-object-storage-architecture",
    "unitTitle": "S3 object storage architecture"
  },
  {
    "id": "srs-quiz-s3-object-storage-architecture-c2",
    "type": "quiz",
    "prompt": "During a PUT, the front end has durably stored enough shards but crashes before writing the index entry. What does a client observe, and why?",
    "answer": "The object is not visible and the client never got a 200, so it retries; the orphaned shards are reclaimed later\n\nExplanation: The index write is the commit point: without it no key maps to the shards, so the object does not exist and the client, lacking a 200, retries. Shards alone are not an object, and because the index is written only after the shards, a partial read is not possible.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "s3-object-storage-architecture",
    "unitTitle": "S3 object storage architecture"
  },
  {
    "id": "srs-quiz-s3-object-storage-architecture-c3",
    "type": "quiz",
    "prompt": "You need to upload a 50 GB file to S3. Which plan fits the published limits?",
    "answer": "A multipart upload of 5,000 parts of 10 MB each\n\nExplanation: Parts must be 5 MB to 5 GB (except the last) and there can be at most 10,000, so 5,000 parts of 10 MB fits. A single PUT is capped at 5 GB, 1 MB parts are too small and exceed the part count, and 10 GB parts exceed the 5 GB part limit.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "s3-object-storage-architecture",
    "unitTitle": "S3 object storage architecture"
  },
  {
    "id": "srs-takeaway-range-partitioning-vs-consistent-hashing-storage-1",
    "type": "takeaway",
    "prompt": "In Range partitioning vs consistent hashing for storage, what is a fundamental rule regarding: Range partitioning keeps data sorted, enabling ultra-fast range queries but risking severe write hotspots on sequential keys?",
    "answer": "Range partitioning keeps data sorted, enabling ultra-fast range queries but risking severe write hotspots on sequential keys.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "range-partitioning-vs-consistent-hashing-storage",
    "unitTitle": "Range partitioning vs consistent hashing for storage"
  },
  {
    "id": "srs-takeaway-range-partitioning-vs-consistent-hashing-storage-2",
    "type": "takeaway",
    "prompt": "In Range partitioning vs consistent hashing for storage, what is a fundamental rule regarding: Consistent hashing uniformly distributes writes across nodes via hash tokens, but makes multi-key range scans prohibitively expensive?",
    "answer": "Consistent hashing uniformly distributes writes across nodes via hash tokens, but makes multi-key range scans prohibitively expensive.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "range-partitioning-vs-consistent-hashing-storage",
    "unitTitle": "Range partitioning vs consistent hashing for storage"
  },
  {
    "id": "srs-takeaway-range-partitioning-vs-consistent-hashing-storage-3",
    "type": "takeaway",
    "prompt": "In Range partitioning vs consistent hashing for storage, what is a fundamental rule regarding: Spanner and Bigtable choose Range Partitioning; Cassandra uses a consistent-hashing token ring, and DynamoDB hash-partitions the partition key into internally managed partitions (sort-key ordered within each)?",
    "answer": "Spanner and Bigtable choose Range Partitioning; Cassandra uses a consistent-hashing token ring, and DynamoDB hash-partitions the partition key into internally managed partitions (sort-key ordered within each).",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "range-partitioning-vs-consistent-hashing-storage",
    "unitTitle": "Range partitioning vs consistent hashing for storage"
  },
  {
    "id": "srs-quiz-range-partitioning-vs-consistent-hashing-storage-c1",
    "type": "quiz",
    "prompt": "A single product key receives 40% of all reads. Does consistent hashing solve this hotspot?",
    "answer": "No, one key still maps to one owner, so it needs splitting, caching or replication\n\nExplanation: Hashing spreads distinct keys, but every request for one key hashes to the same owner, so the key itself must be cached, replicated or split. Range splitting cannot divide a single key either, so the last option is also wrong.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "range-partitioning-vs-consistent-hashing-storage",
    "unitTitle": "Range partitioning vs consistent hashing for storage"
  },
  {
    "id": "srs-quiz-range-partitioning-vs-consistent-hashing-storage-c2",
    "type": "quiz",
    "prompt": "A cluster of 20 nodes holds 40 TB spread evenly using consistent hashing with many virtual nodes. You grow it to 25 nodes. About how much data moves?",
    "answer": "About 8 TB\n\nExplanation: The new nodes end up owning 5/25 = 20% of the ring, so about 8 TB moves, taken evenly from existing nodes. About 32 TB is what naive mod-N hashing would move (roughly 80% of keys), and 10 TB wrongly uses 5/20.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "range-partitioning-vs-consistent-hashing-storage",
    "unitTitle": "Range partitioning vs consistent hashing for storage"
  },
  {
    "id": "srs-quiz-range-partitioning-vs-consistent-hashing-storage-c3",
    "type": "quiz",
    "prompt": "To fix a timestamp hotspot under range partitioning, you prefix each key with hash(event_id) mod 16. What is the main cost of this fix?",
    "answer": "Writes spread over 16 ranges, but every time-range query must now fan out to all 16\n\nExplanation: Salting spreads writes, but a query for a time window must now ask all 16 ranges and merge the results. Within each salt bucket keys are still in time order, and new writes are spread across buckets rather than piling into bucket 0.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "range-partitioning-vs-consistent-hashing-storage",
    "unitTitle": "Range partitioning vs consistent hashing for storage"
  },
  {
    "id": "srs-takeaway-partition-manager-and-map-table-1",
    "type": "takeaway",
    "prompt": "In Partition manager and map table, what is a fundamental rule regarding: A 3-level hierarchical metadata table maps hundreds of millions of user ranges with zero central bottleneck?",
    "answer": "A 3-level hierarchical metadata table maps hundreds of millions of user ranges with zero central bottleneck.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "partition-manager-and-map-table",
    "unitTitle": "Partition manager and map table"
  },
  {
    "id": "srs-takeaway-partition-manager-and-map-table-2",
    "type": "takeaway",
    "prompt": "In Partition manager and map table, what is a fundamental rule regarding: Clients cache range-to-node routing tables locally; stale entries are discovered on misses and refreshed lazily (up to six round trips in Bigtable)?",
    "answer": "Clients cache range-to-node routing tables locally; stale entries are discovered on misses and refreshed lazily (up to six round trips in Bigtable).",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "partition-manager-and-map-table",
    "unitTitle": "Partition manager and map table"
  },
  {
    "id": "srs-takeaway-partition-manager-and-map-table-3",
    "type": "takeaway",
    "prompt": "In Partition manager and map table, what is a fundamental rule regarding: Tablet splits are instant metadata-only operations because immutable SSTables are partitioned by key boundaries without copying files?",
    "answer": "Tablet splits are instant metadata-only operations because immutable SSTables are partitioned by key boundaries without copying files.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "partition-manager-and-map-table",
    "unitTitle": "Partition manager and map table"
  },
  {
    "id": "srs-quiz-partition-manager-and-map-table-c1",
    "type": "quiz",
    "prompt": "Why can a Bigtable-style tablet split finish almost instantly even when the tablet holds hundreds of megabytes?",
    "answer": "Child tablets reference the parent's immutable SSTables with narrowed key ranges; compaction rewrites later\n\nExplanation: Because SSTables never change, both children can point at the same files with restricted start and end keys, and later compaction produces separate files. A background copy would make the split cost proportional to data size, which is exactly what the design avoids.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "partition-manager-and-map-table",
    "unitTitle": "Partition manager and map table"
  },
  {
    "id": "srs-quiz-partition-manager-and-map-table-c2",
    "type": "quiz",
    "prompt": "Suppose METADATA rows were 2 KB instead of 1 KB, with METADATA tablets still capped at 128 MB and a single root tablet. About how many user tablets could the three-level hierarchy address?",
    "answer": "2^32\n\nExplanation: Each METADATA tablet now holds 128 MB / 2 KB = 2^16 locations, so root times METADATA gives 2^16 x 2^16 = 2^32 user tablets. 2^34 is the original 1 KB figure, and 2^16 counts only one level.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "partition-manager-and-map-table",
    "unitTitle": "Partition manager and map table"
  },
  {
    "id": "srs-quiz-partition-manager-and-map-table-c3",
    "type": "quiz",
    "prompt": "After a CockroachDB-style split, a client with a cached route sends a request to the old range descriptor. What happens?",
    "answer": "The client gets a range-key-mismatch error, refreshes its cache from meta2 and retries\n\nExplanation: Routing caches are corrected lazily: a stale request is rejected with a mismatch error and the client re-resolves from meta2. Pushing updates to every client would put the coordinator back on the hot path, which lazy caching is designed to avoid.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "partition-manager-and-map-table",
    "unitTitle": "Partition manager and map table"
  },
  {
    "id": "srs-takeaway-metadata-db-for-object-storage-1",
    "type": "takeaway",
    "prompt": "In Metadata database for object storage, what is a fundamental rule regarding: Object storage metadata treats directory paths as flat strings sorted lexicographically in distributed B-tree/LSM stores?",
    "answer": "Object storage metadata treats directory paths as flat strings sorted lexicographically in distributed B-tree/LSM stores.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "metadata-db-for-object-storage",
    "unitTitle": "Metadata database for object storage"
  },
  {
    "id": "srs-takeaway-metadata-db-for-object-storage-2",
    "type": "takeaway",
    "prompt": "In Metadata database for object storage, what is a fundamental rule regarding: Virtual folder listing reduces to a single contiguous range scan over composite index keys?",
    "answer": "Virtual folder listing reduces to a single contiguous range scan over composite index keys.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "metadata-db-for-object-storage",
    "unitTitle": "Metadata database for object storage"
  },
  {
    "id": "srs-takeaway-metadata-db-for-object-storage-3",
    "type": "takeaway",
    "prompt": "In Metadata database for object storage, what is a fundamental rule regarding: Hyperscale storage systems keep metadata in strongly consistent, sorted distributed stores, but the engines differ (FoundationDB at Apple and Snowflake, Bigtable for Google Colossus, ZippyDB for Meta Tectonic, a purpose-built index for S3)?",
    "answer": "Hyperscale storage systems keep metadata in strongly consistent, sorted distributed stores, but the engines differ (FoundationDB at Apple and Snowflake, Bigtable for Google Colossus, ZippyDB for Meta Tectonic, a purpose-built index for S3).",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "metadata-db-for-object-storage",
    "unitTitle": "Metadata database for object storage"
  },
  {
    "id": "srs-quiz-metadata-db-for-object-storage-c1",
    "type": "quiz",
    "prompt": "Why must object metadata be ordered by (bucket, key) rather than hash-partitioned by the full key if the system supports prefix listing?",
    "answer": "Hashing scatters keys that share a prefix, so a listing would have to scan every partition\n\nExplanation: In sorted order a virtual folder is one contiguous range scan starting at the prefix; hashing scatters those keys so every partition must be searched. Hash-partitioned stores can still be strongly consistent per key, so that option names the wrong limitation.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "metadata-db-for-object-storage",
    "unitTitle": "Metadata database for object storage"
  },
  {
    "id": "srs-quiz-metadata-db-for-object-storage-c2",
    "type": "quiz",
    "prompt": "A bucket holds logs/2026/09/a.gz, logs/2026/09/b/x.gz, logs/2026/09/b/y.gz, logs/2026/09/c.gz and logs/2026/10/d.gz. What does LIST with prefix logs/2026/09/ and delimiter / return?",
    "answer": "Objects a.gz and c.gz, plus the common prefix logs/2026/09/b/\n\nExplanation: Keys with another / after the prefix collapse into one common prefix, emitted once, and the scan stops at logs/2026/10/ because it no longer matches. Returning b/x.gz and b/y.gz as objects is what happens without a delimiter.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "metadata-db-for-object-storage",
    "unitTitle": "Metadata database for object storage"
  },
  {
    "id": "srs-quiz-metadata-db-for-object-storage-c3",
    "type": "quiz",
    "prompt": "To make uploads appear sooner, an engineer proposes writing the metadata entry before the data chunks. What is the flaw?",
    "answer": "Readers can see entries that point at missing data; writing data first leaves only orphaned chunks, which GC can reclaim\n\nExplanation: If metadata commits first, a failed or slow data write leaves a visible object with nothing behind it. Data first means the worst case is unreferenced chunks, a cleanup problem rather than a correctness bug; strong consistency of the metadata store does not change this.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "metadata-db-for-object-storage",
    "unitTitle": "Metadata database for object storage"
  },
  {
    "id": "srs-takeaway-append-only-object-storage-stream-layer-1",
    "type": "takeaway",
    "prompt": "In Append-only stream layer, what is a fundamental rule regarding: Stream layers provide append-only chunk sequences that serve as the durable foundation for object storage?",
    "answer": "Stream layers provide append-only chunk sequences that serve as the durable foundation for object storage.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "append-only-object-storage-stream-layer",
    "unitTitle": "Append-only stream layer"
  },
  {
    "id": "srs-takeaway-append-only-object-storage-stream-layer-2",
    "type": "takeaway",
    "prompt": "In Append-only stream layer, what is a fundamental rule regarding: To prevent split-brain write corruption, chunks are sealed at fixed byte offsets before promoting new writers?",
    "answer": "To prevent split-brain write corruption, chunks are sealed at fixed byte offsets before promoting new writers.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "append-only-object-storage-stream-layer",
    "unitTitle": "Append-only stream layer"
  },
  {
    "id": "srs-takeaway-append-only-object-storage-stream-layer-3",
    "type": "takeaway",
    "prompt": "In Append-only stream layer, what is a fundamental rule regarding: Storage nodes enforce fencing tokens to immediately reject zombie writer nodes?",
    "answer": "Storage nodes enforce fencing tokens to immediately reject zombie writer nodes.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "append-only-object-storage-stream-layer",
    "unitTitle": "Append-only stream layer"
  },
  {
    "id": "srs-quiz-append-only-object-storage-stream-layer-c1",
    "type": "quiz",
    "prompt": "In Apache BookKeeper, what does ledger recovery's fencing step accomplish?",
    "answer": "It makes storage nodes reject further appends from the old writer, so a paused zombie cannot extend the ledger\n\nExplanation: Fencing is enforced on the storage nodes, so an old writer that wakes up after a pause has its appends refused. Waiting for a lease to expire is not enough, because a paused process may not notice its lease is gone and can still send writes.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "append-only-object-storage-stream-layer",
    "unitTitle": "Append-only stream layer"
  },
  {
    "id": "srs-quiz-append-only-object-storage-stream-layer-c2",
    "type": "quiz",
    "prompt": "An extent's primary acknowledges appends only after all three replicas write them. Appends through byte 1,200 were acknowledged. The next append (bytes 1,200 to 1,500) reached replica A only, then the primary crashed. All replicas are reachable: A = 1,500, B = 1,200, C = 1,200. Where is the extent sealed?",
    "answer": "At 1,200, the smallest reachable length\n\nExplanation: The manager seals at the smallest length among reachable replicas, 1,200, and A trims to match. Nothing acknowledged is lost, because bytes 1,200 to 1,500 were never acknowledged and the client will retry them.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "append-only-object-storage-stream-layer",
    "unitTitle": "Append-only stream layer"
  },
  {
    "id": "srs-quiz-append-only-object-storage-stream-layer-c3",
    "type": "quiz",
    "prompt": "A team copies Azure's rule of sealing at the shortest reachable replica, but their primary acknowledges appends after 2 of 3 replicas, BookKeeper-style. What can go wrong?",
    "answer": "The shortest replica may lack acknowledged bytes, so sealing at its length can drop committed data\n\nExplanation: Sealing at the minimum is safe only if every acknowledged byte is on every replica; with a 2-of-3 ack the lagging replica can miss acknowledged data. Clients do not retry writes they were told succeeded, which is why the nothing-goes-wrong option is the dangerous one.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "append-only-object-storage-stream-layer",
    "unitTitle": "Append-only stream layer"
  },
  {
    "id": "srs-takeaway-object-storage-durability-and-replication-1",
    "type": "takeaway",
    "prompt": "In Durability and replication, what is a fundamental rule regarding: 3-way replication incurs a 200% storage overhead and survives 2 drive failures?",
    "answer": "3-way replication incurs a 200% storage overhead and survives 2 drive failures.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-durability-and-replication",
    "unitTitle": "Durability and replication"
  },
  {
    "id": "srs-takeaway-object-storage-durability-and-replication-2",
    "type": "takeaway",
    "prompt": "In Durability and replication, what is a fundamental rule regarding: Reed-Solomon Erasure Coding (e?",
    "answer": "Reed-Solomon Erasure Coding (e.g. 8+4) reduces storage overhead to 50% while surviving any 4 lost fragments, which means 4 rack or drive failures only when each of the 12 fragments sits in a separate rack or drive.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-durability-and-replication",
    "unitTitle": "Durability and replication"
  },
  {
    "id": "srs-takeaway-object-storage-durability-and-replication-3",
    "type": "takeaway",
    "prompt": "In Durability and replication, what is a fundamental rule regarding: Galois field matrix math allows perfect reconstruction of data from any k surviving chunks?",
    "answer": "Galois field matrix math allows perfect reconstruction of data from any k surviving chunks.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-durability-and-replication",
    "unitTitle": "Durability and replication"
  },
  {
    "id": "srs-quiz-object-storage-durability-and-replication-c1",
    "type": "quiz",
    "prompt": "For a Reed-Solomon RS(12, 4) code, what are the storage overhead and the number of lost fragments it can tolerate?",
    "answer": "About 1.33x overhead, any 4 lost fragments\n\nExplanation: Overhead is (k + m) / k = 16 / 12, about 1.33x, and any 12 of the 16 fragments rebuild the object, so any 4 can be lost. Tolerating 12 losses confuses k (fragments needed) with m (parity fragments).",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-durability-and-replication",
    "unitTitle": "Durability and replication"
  },
  {
    "id": "srs-quiz-object-storage-durability-and-replication-c2",
    "type": "quiz",
    "prompt": "A fleet has 50,000 drives with a 1.5% annualized failure rate. Roughly how often does a drive fail?",
    "answer": "About twice a day\n\nExplanation: 1.5% of 50,000 is 750 failures a year, and 750 / 365 is about 2 a day. 750 a day misreads the annual count as daily; at this scale repair is continuous background work, not an occasional event.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-durability-and-replication",
    "unitTitle": "Durability and replication"
  },
  {
    "id": "srs-quiz-object-storage-durability-and-replication-c3",
    "type": "quiz",
    "prompt": "Compared with 3-way replication, what is the main hidden operational cost of RS(10, 4), and how does Azure's LRC address it?",
    "answer": "Rebuilding one lost fragment reads ten fragments over the network; LRC adds local parities so a single loss reads fewer\n\nExplanation: Replication repairs by copying one replica, while RS(10, 4) must read ten fragments per lost fragment, which multiplies repair traffic. RS(10, 4) actually tolerates 4 losses to replication's 2, so the fewer-losses option is backwards.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "object-storage-durability-and-replication",
    "unitTitle": "Durability and replication"
  },
  {
    "id": "srs-takeaway-end-to-end-checksums-1",
    "type": "takeaway",
    "prompt": "In End-to-end checksums, what is a fundamental rule regarding: Silent bit rot corrupts bytes on physical media without triggering OS or hardware controller errors?",
    "answer": "Silent bit rot corrupts bytes on physical media without triggering OS or hardware controller errors.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "end-to-end-checksums",
    "unitTitle": "End-to-end checksums"
  },
  {
    "id": "srs-takeaway-end-to-end-checksums-2",
    "type": "takeaway",
    "prompt": "In End-to-end checksums, what is a fundamental rule regarding: CRC32C is hardware-accelerated by modern CPU instruction sets, delivering several GB/s per core for a single stream and over 20GB/s per core with interleaved multi-stream implementations?",
    "answer": "CRC32C is hardware-accelerated by modern CPU instruction sets, delivering several GB/s per core for a single stream and over 20GB/s per core with interleaved multi-stream implementations.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "end-to-end-checksums",
    "unitTitle": "End-to-end checksums"
  },
  {
    "id": "srs-takeaway-end-to-end-checksums-3",
    "type": "takeaway",
    "prompt": "In End-to-end checksums, what is a fundamental rule regarding: Continuous background scrubbers detect bit flips early and trigger automatic erasure-code repairs?",
    "answer": "Continuous background scrubbers detect bit flips early and trigger automatic erasure-code repairs.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "end-to-end-checksums",
    "unitTitle": "End-to-end checksums"
  },
  {
    "id": "srs-quiz-end-to-end-checksums-c1",
    "type": "quiz",
    "prompt": "Why do storage engines keep a checksum for every 4 KB block rather than one checksum per large file?",
    "answer": "A random read can verify just the blocks it touches without scanning the whole file\n\nExplanation: With per-block checksums a 4 KB random read verifies only that block; a single file checksum would require reading the whole file. Checksums only detect damage, and repair still comes from replicas or parity, so the repair option is wrong.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "end-to-end-checksums",
    "unitTitle": "End-to-end checksums"
  },
  {
    "id": "srs-quiz-end-to-end-checksums-c2",
    "type": "quiz",
    "prompt": "You store 10 PB in 4 KB blocks and use an 8-byte xxHash64 per block instead of a 4-byte CRC32C. Roughly how much checksum storage is that?",
    "answer": "About 20 TB, roughly 0.2% overhead\n\nExplanation: 10 PB / 4 KB is about 2.4 trillion blocks, and at 8 bytes each that is about 20 TB, or 8/4096, about 0.2%. 10 TB is the figure for 4-byte CRC32C, which is why it looks right at first glance.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "end-to-end-checksums",
    "unitTitle": "End-to-end checksums"
  },
  {
    "id": "srs-quiz-end-to-end-checksums-c3",
    "type": "quiz",
    "prompt": "A storage node without ECC RAM receives an upload, and a bit flips in its buffer before the node computes the checksum it stores with the block. No client checksum was sent. What happens?",
    "answer": "The stored checksum matches the corrupted bytes, so every later check passes; only an earlier checksum could catch it\n\nExplanation: A checksum computed after corruption faithfully protects the wrong data, so scrubbing and read checks all pass. That is why the lesson says to compute the checksum as close to the origin as possible; the scrubber cannot tell anything is wrong.",
    "category": "Storage Engine Internals & Blob Systems",
    "track": "Data Architecture, Storage Engines & State Persistence",
    "topicSlug": "end-to-end-checksums",
    "unitTitle": "End-to-end checksums"
  },
  {
    "id": "srs-takeaway-api-design-contracts-1",
    "type": "takeaway",
    "prompt": "In API design contracts, what is a fundamental rule regarding: API contracts are long-lived boundaries that evolve additively; changing an existing field breaks older mobile and third-party clients?",
    "answer": "API contracts are long-lived boundaries that evolve additively; changing an existing field breaks older mobile and third-party clients.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-design-contracts",
    "unitTitle": "API design contracts"
  },
  {
    "id": "srs-takeaway-api-design-contracts-2",
    "type": "takeaway",
    "prompt": "In API design contracts, what is a fundamental rule regarding: Idempotency keys allow safe client retries by caching transaction outcomes and replaying responses?",
    "answer": "Idempotency keys allow safe client retries by caching transaction outcomes and replaying responses.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-design-contracts",
    "unitTitle": "API design contracts"
  },
  {
    "id": "srs-takeaway-api-design-contracts-3",
    "type": "takeaway",
    "prompt": "In API design contracts, what is a fundamental rule regarding: Use RFC 9457 Problem Details and RFC 8594 Sunset headers for predictable error handling and deprecations?",
    "answer": "Use RFC 9457 Problem Details and RFC 8594 Sunset headers for predictable error handling and deprecations.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-design-contracts",
    "unitTitle": "API design contracts"
  },
  {
    "id": "srs-quiz-api-design-contracts-c1",
    "type": "quiz",
    "prompt": "A client retries POST /v1/links with the same Idempotency-Key as an earlier request, but the request body is different this time. What should the server do?",
    "answer": "Reject it as an error, because the key was reused for a different request\n\nExplanation: The server stores a hash of the request body with the key, so a retry with the same key and the same body replays the stored response, while the same key with a different body is rejected (for example with 422). Replaying anyway is the tempting choice, but it would quietly hide a client bug and return a result for a request the client did not send.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-design-contracts",
    "unitTitle": "API design contracts"
  },
  {
    "id": "srs-quiz-api-design-contracts-c2",
    "type": "quiz",
    "prompt": "Old mobile app versions will keep calling POST /v1/links for years. Which change can you ship without a new API version?",
    "answer": "Add an optional expires_at request field with a sensible server default\n\nExplanation: A new optional request field is additive: old clients never send it and the server's default keeps their behaviour the same. The new enum value is the tempting choice because it looks additive, but clients with exhaustive switch statements can crash on it. Tightening validation and changing status codes break requests that used to work.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-design-contracts",
    "unitTitle": "API design contracts"
  },
  {
    "id": "srs-quiz-api-design-contracts-c3",
    "type": "quiz",
    "prompt": "The server inserts the link and commits, then writes the idempotency record (key, body hash, response) in a second transaction. What can go wrong?",
    "answer": "A crash between the two commits lets a retry create the link a second time\n\nExplanation: If the process dies after the link commits but before the key is saved, a retry finds no record and runs the insert again. That is why the key, hash and response must be written in the same transaction as the side effect. The concurrent-retry problem is real too, but its fix is locking the key or inserting it first with an in-progress status.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-design-contracts",
    "unitTitle": "API design contracts"
  },
  {
    "id": "srs-takeaway-service-to-service-communication-1",
    "type": "takeaway",
    "prompt": "In Service-to-service communication, what is a fundamental rule regarding: Synchronous RPC creates tight temporal coupling where downstream latency cascades into upstream thread exhaustion?",
    "answer": "Synchronous RPC creates tight temporal coupling where downstream latency cascades into upstream thread exhaustion.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "service-to-service-communication",
    "unitTitle": "Service-to-service communication"
  },
  {
    "id": "srs-takeaway-service-to-service-communication-2",
    "type": "takeaway",
    "prompt": "In Service-to-service communication, what is a fundamental rule regarding: Asynchronous messaging via durable brokers decouples service availability and absorbs traffic spikes into queue lag, within broker retention limits; it does not fit calls where the user needs an immediate answer (for example payment authorisation)?",
    "answer": "Asynchronous messaging via durable brokers decouples service availability and absorbs traffic spikes into queue lag, within broker retention limits; it does not fit calls where the user needs an immediate answer (for example payment authorisation).",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "service-to-service-communication",
    "unitTitle": "Service-to-service communication"
  },
  {
    "id": "srs-takeaway-service-to-service-communication-3",
    "type": "takeaway",
    "prompt": "In Service-to-service communication, what is a fundamental rule regarding: Propagate distributed trace context and deadlines across every network hop to avoid executing dead requests?",
    "answer": "Propagate distributed trace context and deadlines across every network hop to avoid executing dead requests.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "service-to-service-communication",
    "unitTitle": "Service-to-service communication"
  },
  {
    "id": "srs-quiz-service-to-service-communication-c1",
    "type": "quiz",
    "prompt": "A user request arrives with a 300 ms deadline. The API spends 120 ms, then the order service spends 100 ms before calling inventory. Inventory's own timeout target (p99.9 plus margin) is 150 ms. What timeout should the order service use for that call?",
    "answer": "80 ms, the time left in the caller's deadline\n\nExplanation: The rule is to use the smaller of the hop's own latency target and the caller's remaining deadline: 300 minus 220 leaves 80 ms, which is less than 150 ms. Using 150 ms is tempting because it is the service's own target, but the user's request would already be gone for up to 70 ms of that work.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "service-to-service-communication",
    "unitTitle": "Service-to-service communication"
  },
  {
    "id": "srs-quiz-service-to-service-communication-c2",
    "type": "quiz",
    "prompt": "When services communicate through a typical queue or log broker, what delivery behaviour should consumers be designed for?",
    "answer": "At-least-once delivery, so duplicates and reordering can happen\n\nExplanation: Most brokers deliver at least once, so a consumer can see the same message twice, or out of order, and must process messages idempotently. Durability is the tempting reason to pick exactly-once, but storing a message safely says nothing about how many times a consumer will be handed it after a crash or rebalance.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "service-to-service-communication",
    "unitTitle": "Service-to-service communication"
  },
  {
    "id": "srs-quiz-service-to-service-communication-c3",
    "type": "quiz",
    "prompt": "The order service commits an order row, then publishes order.created to Kafka as a separate step. Sometimes it crashes between the two, and billing never hears about the order. What is the standard fix?",
    "answer": "Write the event to an outbox table in the same transaction and let a relay publish it\n\nExplanation: With a transactional outbox, the row and the event commit together, so a relay can publish the event later, even after a crash, and neither is lost. Publishing first just reverses the problem: billing hears about an order that never committed. In-process retries die along with the process.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "service-to-service-communication",
    "unitTitle": "Service-to-service communication"
  },
  {
    "id": "srs-takeaway-http-rest-grpc-1",
    "type": "takeaway",
    "prompt": "In HTTP, REST, and gRPC, what is a fundamental rule regarding: gRPC uses Protocol Buffers to achieve significantly smaller wire payloads and lower CPU serialization overhead than JSON?",
    "answer": "gRPC uses Protocol Buffers to achieve significantly smaller wire payloads and lower CPU serialization overhead than JSON. Typical savings are around 2-5x before compression, and less for text-heavy messages or after gzip.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "http-rest-grpc",
    "unitTitle": "HTTP, REST, and gRPC"
  },
  {
    "id": "srs-takeaway-http-rest-grpc-2",
    "type": "takeaway",
    "prompt": "In HTTP, REST, and gRPC, what is a fundamental rule regarding: HTTP/2 multiplexing allows gRPC to stream multiple requests concurrently over a single TCP connection?",
    "answer": "HTTP/2 multiplexing allows gRPC to stream multiple requests concurrently over a single TCP connection.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "http-rest-grpc",
    "unitTitle": "HTTP, REST, and gRPC"
  },
  {
    "id": "srs-takeaway-http-rest-grpc-3",
    "type": "takeaway",
    "prompt": "In HTTP, REST, and gRPC, what is a fundamental rule regarding: Use REST for public browser-facing APIs and third-party reach; use gRPC for high-performance internal microservices?",
    "answer": "Use REST for public browser-facing APIs and third-party reach; use gRPC for high-performance internal microservices.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "http-rest-grpc",
    "unitTitle": "HTTP, REST, and gRPC"
  },
  {
    "id": "srs-quiz-http-rest-grpc-c1",
    "type": "quiz",
    "prompt": "Using the lesson's encoding rules, a message has int64 id = 1 set to 150 (a 2-byte varint) and string name = 2 set to \"bob\". How many bytes is the Protobuf encoding?",
    "answer": "8 bytes\n\nExplanation: id takes 1 tag byte plus a 2-byte varint (3 bytes), and name takes 1 tag byte, 1 length byte and 3 bytes of text (5 bytes), for 8 in total. Six bytes is what you get if you forget the tag and length bytes. The saving over JSON comes mostly from not repeating the field names.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "http-rest-grpc",
    "unitTitle": "HTTP, REST, and gRPC"
  },
  {
    "id": "srs-quiz-http-rest-grpc-c2",
    "type": "quiz",
    "prompt": "HTTP/2 multiplexes many streams over one connection and removes head-of-line blocking at the HTTP layer. What can still stall every stream on that connection?",
    "answer": "A single lost TCP packet, since TCP delivers bytes strictly in order\n\nExplanation: HTTP/2 still runs on one TCP byte stream, so a lost packet holds back data for all streams until it is retransmitted. HTTP/3 moves to QUIC so that a loss only stalls the streams whose data it carried. The six-connection limit applies to HTTP/1.1, which is the problem multiplexing was designed to remove.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "http-rest-grpc",
    "unitTitle": "HTTP, REST, and gRPC"
  },
  {
    "id": "srs-quiz-http-rest-grpc-c3",
    "type": "quiz",
    "prompt": "Service A calls service B over gRPC through an L4 network load balancer. B scales from 4 to 12 pods, but nearly all traffic stays on the original 4. What is the most likely cause?",
    "answer": "A's long-lived HTTP/2 connections were balanced once per connection and stay pinned\n\nExplanation: HTTP/2 keeps one long-lived connection that carries many calls, and an L4 balancer only makes a choice when a connection opens, so existing calls keep going to the old backends. The fix is per-request L7 balancing or client-side balancing. The DNS option sounds plausible, but it is not what the protocol requires, and it would not explain pinning behind a single load balancer address.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "http-rest-grpc",
    "unitTitle": "HTTP, REST, and gRPC"
  },
  {
    "id": "srs-takeaway-tcp-vs-udp-1",
    "type": "takeaway",
    "prompt": "In TCP vs UDP, what is a fundamental rule regarding: TCP guarantees ordered, reliable byte stream delivery at the cost of connection handshakes and Head-of-Line blocking?",
    "answer": "TCP guarantees ordered, reliable byte stream delivery at the cost of connection handshakes and Head-of-Line blocking.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tcp-vs-udp",
    "unitTitle": "TCP vs UDP"
  },
  {
    "id": "srs-takeaway-tcp-vs-udp-2",
    "type": "takeaway",
    "prompt": "In TCP vs UDP, what is a fundamental rule regarding: UDP is a lightweight connectionless datagram protocol with no handshake, suited to real-time interactive audio/video, gaming and DNS?",
    "answer": "UDP is a lightweight connectionless datagram protocol with no handshake, suited to real-time interactive audio/video, gaming and DNS.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tcp-vs-udp",
    "unitTitle": "TCP vs UDP"
  },
  {
    "id": "srs-takeaway-tcp-vs-udp-3",
    "type": "takeaway",
    "prompt": "In TCP vs UDP, what is a fundamental rule regarding: HTTP/3 uses QUIC over UDP in user space to eliminate TCP head-of-line blocking across multiplexed streams?",
    "answer": "HTTP/3 uses QUIC over UDP in user space to eliminate TCP head-of-line blocking across multiplexed streams.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tcp-vs-udp",
    "unitTitle": "TCP vs UDP"
  },
  {
    "id": "srs-quiz-tcp-vs-udp-c1",
    "type": "quiz",
    "prompt": "Over one TCP connection, segments 1 to 5 are sent and segment 2 is lost, while 3, 4 and 5 arrive. What does the receiving application see until 2 is retransmitted?",
    "answer": "Only segment 1; the kernel holds 3 to 5 until 2 arrives\n\nExplanation: TCP delivers an in-order byte stream, so the kernel buffers 3 to 5 and releases nothing beyond 1 until 2 is retransmitted. This is head-of-line blocking. Delivering with a gap is how UDP-based media behaves, where the application decides to skip lost data.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tcp-vs-udp",
    "unitTitle": "TCP vs UDP"
  },
  {
    "id": "srs-quiz-tcp-vs-udp-c2",
    "type": "quiz",
    "prompt": "A client is 50 ms round-trip from the server. Roughly how long until the first byte of the response, for a new TCP plus TLS 1.3 connection versus a new QUIC connection?",
    "answer": "About 150 ms for TCP plus TLS 1.3, and about 100 ms for QUIC\n\nExplanation: TCP plus TLS 1.3 needs 1 round trip for TCP, 1 for TLS and 1 for the request, which is 3 times 50 ms. QUIC combines the transport and TLS handshakes into 1 round trip, plus 1 for the request, giving 100 ms. The 50 ms QUIC figure is tempting, but that is resumed 0-RTT, not a new connection.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tcp-vs-udp",
    "unitTitle": "TCP vs UDP"
  },
  {
    "id": "srs-quiz-tcp-vs-udp-c3",
    "type": "quiz",
    "prompt": "A mobile app holds a long-lived connection to your API, and the phone moves from Wi-Fi to cellular, which changes its IP address. How do TCP and QUIC compare?",
    "answer": "The TCP connection breaks; QUIC can carry on using its connection ID\n\nExplanation: A TCP connection is identified by its address and port 4-tuple, so a new IP address breaks it. QUIC connections carry a connection ID, which lets them migrate to the new address. Session tickets are tempting, but they only speed up a new handshake; they do not keep the old connection alive.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tcp-vs-udp",
    "unitTitle": "TCP vs UDP"
  },
  {
    "id": "srs-takeaway-api-gateway-vs-load-balancer-1",
    "type": "takeaway",
    "prompt": "In API gateway vs load balancer, what is a fundamental rule regarding: Load balancers focus on traffic distribution, connection routing, and high-throughput health checking?",
    "answer": "Load balancers focus on traffic distribution, connection routing, and high-throughput health checking.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-gateway-vs-load-balancer",
    "unitTitle": "API gateway vs load balancer"
  },
  {
    "id": "srs-takeaway-api-gateway-vs-load-balancer-2",
    "type": "takeaway",
    "prompt": "In API gateway vs load balancer, what is a fundamental rule regarding: API gateways handle application-level cross-cutting concerns?",
    "answer": "API gateways handle application-level cross-cutting concerns: authentication, token buckets, and path routing.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-gateway-vs-load-balancer",
    "unitTitle": "API gateway vs load balancer"
  },
  {
    "id": "srs-takeaway-api-gateway-vs-load-balancer-3",
    "type": "takeaway",
    "prompt": "In API gateway vs load balancer, what is a fundamental rule regarding: High-scale architectures place high-speed L4 load balancers in front of distributed L7 API gateway clusters?",
    "answer": "High-scale architectures place high-speed L4 load balancers in front of distributed L7 API gateway clusters.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-gateway-vs-load-balancer",
    "unitTitle": "API gateway vs load balancer"
  },
  {
    "id": "srs-quiz-api-gateway-vs-load-balancer-c1",
    "type": "quiz",
    "prompt": "A partner's quota is 100 requests per second. Ten gateway instances each enforce 10 per second locally. The partner sends 80 per second, but 40% of that lands on a single instance. What happens?",
    "answer": "About 22 per second are rejected even though the partner is under quota\n\nExplanation: The busy instance receives 32 per second against a local limit of 10, so it rejects about 22, while the other nine see about 5 each and reject nothing. This is the lesson's warning that local limits are cheap but uneven when traffic is skewed. A shared counter would be accurate, at the cost of about 1 ms per request.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-gateway-vs-load-balancer",
    "unitTitle": "API gateway vs load balancer"
  },
  {
    "id": "srs-quiz-api-gateway-vs-load-balancer-c2",
    "type": "quiz",
    "prompt": "Which of these jobs is beyond an L4 load balancer such as AWS NLB, but routine for an API gateway?",
    "answer": "Routing requests for /v1/orders/* to the order service by path\n\nExplanation: An L4 balancer sees only IP addresses, ports and the transport protocol, so it cannot read the HTTP path it would need for routing. TLS pass-through is the tempting wrong choice, but it is common at L4 precisely because the balancer never has to decrypt or parse the request.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-gateway-vs-load-balancer",
    "unitTitle": "API gateway vs load balancer"
  },
  {
    "id": "srs-quiz-api-gateway-vs-load-balancer-c3",
    "type": "quiz",
    "prompt": "A backend's database pool deadlocks, and every HTTP request to it now returns 500. The load balancer uses a TCP-connect health check. What happens?",
    "answer": "The node stays in rotation, because it still accepts TCP connections\n\nExplanation: The process is still listening, so a TCP check keeps passing while every request fails. The lesson recommends an HTTP health endpoint that checks the app's real readiness. Ejection after 2 to 3 failures is the tempting answer, but it only happens if the check itself fails, and a TCP check will not.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "api-gateway-vs-load-balancer",
    "unitTitle": "API gateway vs load balancer"
  },
  {
    "id": "srs-takeaway-load-balancers-1",
    "type": "takeaway",
    "prompt": "In Load balancers, what is a fundamental rule regarding: Round Robin is simple but vulnerable to load skew when request execution times vary?",
    "answer": "Round Robin is simple but vulnerable to load skew when request execution times vary.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-balancers",
    "unitTitle": "Load balancers"
  },
  {
    "id": "srs-takeaway-load-balancers-2",
    "type": "takeaway",
    "prompt": "In Load balancers, what is a fundamental rule regarding: Least Connections is ideal for persistent stateful connections like WebSockets?",
    "answer": "Least Connections is ideal for persistent stateful connections like WebSockets.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-balancers",
    "unitTitle": "Load balancers"
  },
  {
    "id": "srs-takeaway-load-balancers-3",
    "type": "takeaway",
    "prompt": "In Load balancers, what is a fundamental rule regarding: The Power of Two Random Choices (P2C) with EWMA latency delivers near-best load balance using only local, slightly stale state, avoiding herding?",
    "answer": "The Power of Two Random Choices (P2C) with EWMA latency delivers near-best load balance using only local, slightly stale state, avoiding herding.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-balancers",
    "unitTitle": "Load balancers"
  },
  {
    "id": "srs-quiz-load-balancers-c1",
    "type": "quiz",
    "prompt": "Why does having every load balancer instance send each request to the globally least-loaded server work poorly with many independent balancers?",
    "answer": "They act on the same stale view and all pick the same server at once\n\nExplanation: Balancers working from the same slightly stale load numbers all pick the same apparently idle server, which overloads it. This is called herding. Power of two choices avoids it using only local information. The O(n) cost is the tempting answer, but the lesson's real objection is that the shared state is stale, not that the search is slow.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-balancers",
    "unitTitle": "Load balancers"
  },
  {
    "id": "srs-quiz-load-balancers-c2",
    "type": "quiz",
    "prompt": "You send 1,000 requests to 1,000 servers. Roughly what is the busiest server's load when each request picks one server at random, versus when it samples two and takes the less loaded?",
    "answer": "About 5 or 6 with random choice, and about 3 with two choices\n\nExplanation: Random placement's maximum grows like log n divided by log log n, and for n = 1,000 it is typically 5 or 6 in practice (the formula itself gives only about 3.6 here, because constant factors still matter at this size), while two choices grows only as log log n, typically about 3. Exactly 1 is tempting, but it would need perfect global coordination, and sampling more than two servers adds only small gains.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-balancers",
    "unitTitle": "Load balancers"
  },
  {
    "id": "srs-quiz-load-balancers-c3",
    "type": "quiz",
    "prompt": "Every node's /healthz also runs a database query. The database blips for 5 seconds, and the balancer marks a node down after 2 failed checks. What happens, and which setting limits the damage?",
    "answer": "Every node is marked down at once; a panic threshold keeps sending traffic to all of them\n\nExplanation: A health check that depends on a shared database fails on every node at the same moment, emptying the pool. With a panic threshold, when too many nodes look unhealthy (for example over 50%), the balancer sends traffic to all of them instead of to nobody. Outlier detection ejects individual bad nodes, which does not help when all of them look bad.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-balancers",
    "unitTitle": "Load balancers"
  },
  {
    "id": "srs-takeaway-consistent-hashing-load-balancing-1",
    "type": "takeaway",
    "prompt": "In Consistent-hashing load balancing, what is a fundamental rule regarding: Consistent hashing maps keys and servers onto a circular 2^32 integer ring, relocating only K/N keys upon scaling?",
    "answer": "Consistent hashing maps keys and servers onto a circular 2^32 integer ring, relocating only K/N keys upon scaling.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistent-hashing-load-balancing",
    "unitTitle": "Consistent-hashing load balancing"
  },
  {
    "id": "srs-takeaway-consistent-hashing-load-balancing-2",
    "type": "takeaway",
    "prompt": "In Consistent-hashing load balancing, what is a fundamental rule regarding: Virtual nodes (100-250 per physical host) greatly reduce non-uniform hash distribution skew?",
    "answer": "Virtual nodes (100-250 per physical host) greatly reduce non-uniform hash distribution skew.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistent-hashing-load-balancing",
    "unitTitle": "Consistent-hashing load balancing"
  },
  {
    "id": "srs-takeaway-consistent-hashing-load-balancing-3",
    "type": "takeaway",
    "prompt": "In Consistent-hashing load balancing, what is a fundamental rule regarding: Google's Bounded-Load algorithm prevents hot-key server crashes by overflowing traffic to the next ring node?",
    "answer": "Google's Bounded-Load algorithm prevents hot-key server crashes by overflowing traffic to the next ring node.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistent-hashing-load-balancing",
    "unitTitle": "Consistent-hashing load balancing"
  },
  {
    "id": "srs-quiz-consistent-hashing-load-balancing-c1",
    "type": "quiz",
    "prompt": "A tier of N servers each keeps an in-process cache. Why does routing requests at random, instead of by key, hurt the hit rate?",
    "answer": "Each node ends up caching the whole working set, cutting capacity about N times\n\nExplanation: With random routing, every key can land on any node, so each node tries to hold the same hot set, and the tier's effective cache is only about one node's worth. Routing by key partitions the set across nodes. The request-volume option is tempting, but random routing does not change the total load on each node, only which keys each node sees.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistent-hashing-load-balancing",
    "unitTitle": "Consistent-hashing load balancing"
  },
  {
    "id": "srs-quiz-consistent-hashing-load-balancing-c2",
    "type": "quiz",
    "prompt": "A cache tier grows from 20 to 21 servers and holds 210 million keys. Roughly how many keys change servers with hash mod N, and with a consistent-hash ring?",
    "answer": "About 200 million with modulo hashing, and about 10 million with the ring\n\nExplanation: With modulo hashing, a key only stays put if hash mod 20 equals hash mod 21, which is true for about 1 in 21 keys, so about 200 million move. With a ring, the new server takes about 1/21 of the key space, around 10 million keys. The 105 million option is the tempting halfway guess that has no basis in either scheme.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistent-hashing-load-balancing",
    "unitTitle": "Consistent-hashing load balancing"
  },
  {
    "id": "srs-quiz-consistent-hashing-load-balancing-c3",
    "type": "quiz",
    "prompt": "A ring places one point per server, with no virtual nodes. One server dies during peak traffic. What is the main risk?",
    "answer": "Its whole arc goes to the next server clockwise, which may then overload and fail too\n\nExplanation: Without virtual nodes, the dead server's entire range lands on a single neighbour, which can overload it and set off a chain of failures around the ring. Even spreading is the tempting answer, but that is exactly what virtual nodes provide, and they are missing here. Remapping every key describes modulo hashing, not a ring.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistent-hashing-load-balancing",
    "unitTitle": "Consistent-hashing load balancing"
  },
  {
    "id": "srs-takeaway-event-contracts-1",
    "type": "takeaway",
    "prompt": "In Event contracts, what is a fundamental rule regarding: Asynchronous event schemas must be strictly governed by a Schema Registry to avoid poisoning consumer queues?",
    "answer": "Asynchronous event schemas must be strictly governed by a Schema Registry to avoid poisoning consumer queues.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "event-contracts",
    "unitTitle": "Event contracts"
  },
  {
    "id": "srs-takeaway-event-contracts-2",
    "type": "takeaway",
    "prompt": "In Event contracts, what is a fundamental rule regarding: Use Avro or Protocol Buffers to serialize schemas with compact integer IDs prepended to wire payloads?",
    "answer": "Use Avro or Protocol Buffers to serialize schemas with compact integer IDs prepended to wire payloads.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "event-contracts",
    "unitTitle": "Event contracts"
  },
  {
    "id": "srs-takeaway-event-contracts-3",
    "type": "takeaway",
    "prompt": "In Event contracts, what is a fundamental rule regarding: Full Compatibility guarantees that producers and consumers can be deployed independently in any order?",
    "answer": "Full Compatibility guarantees that producers and consumers can be deployed independently in any order.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "event-contracts",
    "unitTitle": "Event contracts"
  },
  {
    "id": "srs-quiz-event-contracts-c1",
    "type": "quiz",
    "prompt": "Under BACKWARD compatibility (Confluent's default), which side must be upgraded first when a schema changes, and why?",
    "answer": "Consumers first, because the new schema must read events written with the old one\n\nExplanation: BACKWARD means new reader code can read data written with the previous schema, so consumers upgrade first while producers are still writing old events. Producers first is the rule for FORWARD compatibility, and it is the most common mix-up. Only FULL compatibility allows either order.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "event-contracts",
    "unitTitle": "Event contracts"
  },
  {
    "id": "srs-quiz-event-contracts-c2",
    "type": "quiz",
    "prompt": "The registry runs in BACKWARD mode. A team adds a required string field channel to OrderPlaced with no default value. What happens when they register the schema?",
    "answer": "It is rejected, because new consumers could not read old events that lack the field\n\nExplanation: A new reader schema needs a value for channel when it reads old events that do not have one, and without a default it cannot fill that in, so the registry rejects the change. \"Adding a field is safe\" is the tempting answer carried over from APIs; with Avro the default is what makes the addition compatible.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "event-contracts",
    "unitTitle": "Event contracts"
  },
  {
    "id": "srs-quiz-event-contracts-c3",
    "type": "quiz",
    "prompt": "A topic keeps events forever. The registry uses BACKWARD, not BACKWARD_TRANSITIVE. Schema v3 passed the check against v2 but would fail against v1. A new consumer replays from the start. What breaks?",
    "answer": "The consumer can fail on the oldest v1 events, which v3 was never checked against\n\nExplanation: Plain BACKWARD checks a new schema only against the latest version, so compatibility with older data is not guaranteed. The lesson notes that the TRANSITIVE modes are needed when consumers replay old history. \"Each step was checked\" is the tempting answer, but compatibility is not guaranteed to carry across several steps.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "event-contracts",
    "unitTitle": "Event contracts"
  },
  {
    "id": "srs-takeaway-retries-timeouts-idempotency-1",
    "type": "takeaway",
    "prompt": "In Retries, timeouts, and idempotency, what is a fundamental rule regarding: Naive retries cause retry storms that can keep overloaded services from recovering, even after the original trigger is gone?",
    "answer": "Naive retries cause retry storms that can keep overloaded services from recovering, even after the original trigger is gone.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "retries-timeouts-idempotency",
    "unitTitle": "Retries, timeouts, and idempotency"
  },
  {
    "id": "srs-takeaway-retries-timeouts-idempotency-2",
    "type": "takeaway",
    "prompt": "In Retries, timeouts, and idempotency, what is a fundamental rule regarding: Full Jitter Exponential Backoff randomizes client retry delays across a uniform interval, flattening traffic spikes?",
    "answer": "Full Jitter Exponential Backoff randomizes client retry delays across a uniform interval, flattening traffic spikes.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "retries-timeouts-idempotency",
    "unitTitle": "Retries, timeouts, and idempotency"
  },
  {
    "id": "srs-takeaway-retries-timeouts-idempotency-3",
    "type": "takeaway",
    "prompt": "In Retries, timeouts, and idempotency, what is a fundamental rule regarding: Enforce retry budgets (max 10% retries) and distinct connection vs read timeouts to protect network resources?",
    "answer": "Enforce retry budgets (max 10% retries) and distinct connection vs read timeouts to protect network resources.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "retries-timeouts-idempotency",
    "unitTitle": "Retries, timeouts, and idempotency"
  },
  {
    "id": "srs-quiz-retries-timeouts-idempotency-c1",
    "type": "quiz",
    "prompt": "The API, the order service and the database client each retry up to 2 times (3 attempts each). If every attempt fails, how many calls can one user request cause at the database?",
    "answer": "27\n\nExplanation: Retries multiply across layers, so 3 attempts at each of 3 layers gives 3 times 3 times 3, which is 27 calls. Six is the tempting sum you get by adding the retries instead of multiplying them. This compounding is why retries should happen at one layer and be capped with a budget.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "retries-timeouts-idempotency",
    "unitTitle": "Retries, timeouts, and idempotency"
  },
  {
    "id": "srs-quiz-retries-timeouts-idempotency-c2",
    "type": "quiz",
    "prompt": "A client uses a 10% retry budget, and a dependency starts failing half of all requests. How does the budget behave differently from a circuit breaker?",
    "answer": "The budget drops retries above 10% of traffic while originals flow; a breaker stops all requests\n\nExplanation: A retry budget caps the extra load from retries, so original requests keep flowing and offered load stays near normal. A circuit breaker is a separate mechanism that stops sending any requests while the error rate stays high. The first option swaps the two roles, which is the usual confusion.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "retries-timeouts-idempotency",
    "unitTitle": "Retries, timeouts, and idempotency"
  },
  {
    "id": "srs-quiz-retries-timeouts-idempotency-c3",
    "type": "quiz",
    "prompt": "For a POST that is not idempotent and has no idempotency key, which failure can be retried without risking a duplicate side effect?",
    "answer": "The connection was refused before any bytes of the request were sent\n\nExplanation: If the connection was refused before sending, the server never processed the request, so retrying cannot repeat it. A timeout after sending is the tempting case, but the outcome is unknown and the server may have done the work. 422 will simply fail again in the same way.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "retries-timeouts-idempotency",
    "unitTitle": "Retries, timeouts, and idempotency"
  },
  {
    "id": "srs-takeaway-batching-1",
    "type": "takeaway",
    "prompt": "In Batching, what is a fundamental rule regarding: Batching amortizes kernel system calls, TCP headers, and disk write overhead across hundreds of operations?",
    "answer": "Batching amortizes kernel system calls, TCP headers, and disk write overhead across hundreds of operations.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "batching",
    "unitTitle": "Batching"
  },
  {
    "id": "srs-takeaway-batching-2",
    "type": "takeaway",
    "prompt": "In Batching, what is a fundamental rule regarding: Production flush engines combine maximum byte size with a time-based linger window (e?",
    "answer": "Production flush engines combine maximum byte size with a time-based linger window (e.g., 10ms).",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "batching",
    "unitTitle": "Batching"
  },
  {
    "id": "srs-takeaway-batching-3",
    "type": "takeaway",
    "prompt": "In Batching, what is a fundamental rule regarding: Batch APIs must support partial failure semantics with granular per-record error arrays?",
    "answer": "Batch APIs must support partial failure semantics with granular per-record error arrays.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "batching",
    "unitTitle": "Batching"
  },
  {
    "id": "srs-quiz-batching-c1",
    "type": "quiz",
    "prompt": "You write 500 click rows with one multi-row INSERT ... VALUES statement, and row 42 violates a unique constraint. What happens by default?",
    "answer": "The whole statement fails, and none of the 500 rows are inserted\n\nExplanation: A single SQL statement is atomic, so one duplicate key fails all 500 rows unless you add ON CONFLICT or handle rows individually. Per-item success is the tempting answer because good batch APIs are designed that way, but the database does not behave like that on its own.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "batching",
    "unitTitle": "Batching"
  },
  {
    "id": "srs-quiz-batching-c2",
    "type": "quiz",
    "prompt": "Each database round trip costs 2 ms of fixed overhead, and each row adds 0.01 ms. With batches of 200 rows, roughly what throughput can one connection sustain?",
    "answer": "About 50,000 rows per second\n\nExplanation: Throughput is batch size divided by (fixed cost plus batch size times per-item cost): 200 divided by (2 ms plus 2 ms) is 50 rows per ms, or 50,000 per second. 100,000 is the tempting answer if you drop the per-row term, and that term is what makes bigger batches give diminishing returns.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "batching",
    "unitTitle": "Batching"
  },
  {
    "id": "srs-quiz-batching-c3",
    "type": "quiz",
    "prompt": "A logging client tells callers \"written\" as soon as a record enters its in-memory batch, and it flushes every 50 ms. The process is OOM-killed. What is the consequence, and what is the fix?",
    "answer": "Up to about 50 ms of acknowledged records vanish; acknowledge only after the flush\n\nExplanation: In-memory batches are not durable until they are flushed, so everything acknowledged since the last flush is lost with the process. If callers need durability, the acknowledgement must wait for the flush. Kernel flushing is the tempting answer, but it only covers data already handed to the operating system, not a buffer inside the application's heap.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "batching",
    "unitTitle": "Batching"
  },
  {
    "id": "srs-takeaway-backpressure-1",
    "type": "takeaway",
    "prompt": "In Backpressure, what is a fundamental rule regarding: Unbounded in-memory queues lead to Out-of-Memory (OOM) container crashes under sustained overload, and to very long queueing delays well before that?",
    "answer": "Unbounded in-memory queues lead to Out-of-Memory (OOM) container crashes under sustained overload, and to very long queueing delays well before that.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "backpressure",
    "unitTitle": "Backpressure"
  },
  {
    "id": "srs-takeaway-backpressure-2",
    "type": "takeaway",
    "prompt": "In Backpressure, what is a fundamental rule regarding: Reactive pull-based flow control requires consumers to issue explicit credits before producers can send data?",
    "answer": "Reactive pull-based flow control requires consumers to issue explicit credits before producers can send data.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "backpressure",
    "unitTitle": "Backpressure"
  },
  {
    "id": "srs-takeaway-backpressure-3",
    "type": "takeaway",
    "prompt": "In Backpressure, what is a fundamental rule regarding: Enforce hard queue capacity limits with explicit drop strategies (Tail Drop vs Head Drop)?",
    "answer": "Enforce hard queue capacity limits with explicit drop strategies (Tail Drop vs Head Drop).",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "backpressure",
    "unitTitle": "Backpressure"
  },
  {
    "id": "srs-quiz-backpressure-c1",
    "type": "quiz",
    "prompt": "A consumer's application thread stops reading from its TCP socket, while the sender keeps writing. What happens at the transport layer?",
    "answer": "The receive buffer fills, the window shrinks to zero, and the sender's kernel stops sending\n\nExplanation: TCP flow control advertises the receiver's free buffer space as its window. When the application stops reading, the window drops to zero and the sender pauses, which is backpressure built into the kernel. Dropping and retransmitting is the tempting answer, but that is loss recovery, not flow control.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "backpressure",
    "unitTitle": "Backpressure"
  },
  {
    "id": "srs-quiz-backpressure-c2",
    "type": "quiz",
    "prompt": "A consumer handles 2,000 messages per second. A spike sends 2,500 per second for 20 minutes, then arrivals drop back to 1,500 per second. How long does the backlog take to clear after the spike?",
    "answer": "About 20 minutes\n\nExplanation: The backlog grows by 500 per second for 1,200 seconds, reaching 600,000 messages, and afterwards the consumer has only 500 per second of spare capacity, so draining takes 1,200 seconds, about 20 minutes. Five minutes is the tempting answer if you divide by the full 2,000 per second and forget that new messages keep arriving.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "backpressure",
    "unitTitle": "Backpressure"
  },
  {
    "id": "srs-quiz-backpressure-c3",
    "type": "quiz",
    "prompt": "Your service correctly returns 503 when its queue is full, but load stays high and the queue never recovers. What is the most likely reason?",
    "answer": "Clients retry immediately, so rejected work returns as new load\n\nExplanation: Retry storms defeat backpressure: if rejected clients come straight back, the rejection only moves the pressure around. Clients need backoff and Retry-After, ideally together with retry budgets. Removing the limit is the tempting fix, but an unbounded queue just trades rejections for growing latency and, eventually, running out of memory.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "backpressure",
    "unitTitle": "Backpressure"
  },
  {
    "id": "srs-takeaway-tail-latency-1",
    "type": "takeaway",
    "prompt": "In Tail latency, what is a fundamental rule regarding: Fan-out architectures amplify tail latency?",
    "answer": "Fan-out architectures amplify tail latency: querying 100 backend services with 99% fast SLA drops user fast probability to 36.6%.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tail-latency",
    "unitTitle": "Tail latency"
  },
  {
    "id": "srs-takeaway-tail-latency-2",
    "type": "takeaway",
    "prompt": "In Tail latency, what is a fundamental rule regarding: Hedged requests reissue redundant RPCs to replicas after p95 timeout thresholds, collapsing tail latency spikes?",
    "answer": "Hedged requests reissue redundant RPCs to replicas after p95 timeout thresholds, collapsing tail latency spikes.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tail-latency",
    "unitTitle": "Tail latency"
  },
  {
    "id": "srs-takeaway-tail-latency-3",
    "type": "takeaway",
    "prompt": "In Tail latency, what is a fundamental rule regarding: Record latency in mergeable histograms (e?",
    "answer": "Record latency in mergeable histograms (e.g., HdrHistogram) and drive benchmarks with constant-arrival-rate load generators (e.g., wrk2) to avoid Coordinated Omission bias.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tail-latency",
    "unitTitle": "Tail latency"
  },
  {
    "id": "srs-quiz-tail-latency-c1",
    "type": "quiz",
    "prompt": "A request waits for 50 leaf servers, and each leaf is fast 99% of the time, independently. Roughly what fraction of user requests hit at least one slow leaf?",
    "answer": "About 40%\n\nExplanation: The chance that all 50 leaves are fast is 0.99 to the 50th power, about 0.605, so about 40% of requests hit a slow leaf. 50% is the tempting shortcut of adding 1% fifty times, which overstates the result because it counts cases with several slow leaves more than once.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tail-latency",
    "unitTitle": "Tail latency"
  },
  {
    "id": "srs-quiz-tail-latency-c2",
    "type": "quiz",
    "prompt": "To cut its tail, a team sends every read to two replicas at once and uses whichever answers first. Compared with hedging after the p95 latency, what is the risk?",
    "answer": "Load roughly doubles, which can deepen queues and worsen the tail\n\nExplanation: Sending a hedge only after p95 adds at most about 5% extra load, while duplicating every read doubles it and can create the queueing that causes tails. Instant cancellation is the tempting answer, but that is the tied-request design, which needs server cooperation, and even then both copies may start work.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tail-latency",
    "unitTitle": "Tail latency"
  },
  {
    "id": "srs-quiz-tail-latency-c3",
    "type": "quiz",
    "prompt": "Ten servers each report their own p99 latency. How should you compute the p99 for the whole fleet?",
    "answer": "Merge the latency histograms, then read off p99\n\nExplanation: Percentiles cannot be averaged. You need the combined distribution, which is why the lesson records latencies in mergeable histograms such as HdrHistogram. The largest p99 is tempting as a safe upper bound, but it is not the fleet's p99 and can be far from it when servers carry different amounts of traffic.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "tail-latency",
    "unitTitle": "Tail latency"
  },
  {
    "id": "srs-takeaway-load-shedding-1",
    "type": "takeaway",
    "prompt": "In Load shedding, what is a fundamental rule regarding: Overloaded systems collapse completely unless they shed excess load early at the ingress boundary?",
    "answer": "Overloaded systems collapse completely unless they shed excess load early at the ingress boundary.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-shedding",
    "unitTitle": "Load shedding"
  },
  {
    "id": "srs-takeaway-load-shedding-2",
    "type": "takeaway",
    "prompt": "In Load shedding, what is a fundamental rule regarding: Categorize requests into priority tiers?",
    "answer": "Categorize requests into priority tiers: protect critical mutations (checkout) by dropping background traffic (analytics).",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-shedding",
    "unitTitle": "Load shedding"
  },
  {
    "id": "srs-takeaway-load-shedding-3",
    "type": "takeaway",
    "prompt": "In Load shedding, what is a fundamental rule regarding: Adaptive concurrency limiting dynamically adjusts capacity limits based on observed latency rather than static QPS caps?",
    "answer": "Adaptive concurrency limiting dynamically adjusts capacity limits based on observed latency rather than static QPS caps.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-shedding",
    "unitTitle": "Load shedding"
  },
  {
    "id": "srs-quiz-load-shedding-c1",
    "type": "quiz",
    "prompt": "A cluster sized for 100,000 QPS receives 150,000 QPS and does no load shedding. What happens to goodput (successful, on-time responses)?",
    "answer": "It can collapse toward zero, as queueing delays pass client timeouts\n\nExplanation: Without shedding, every request waits in the same growing queue, so nearly all of them finish after their client has given up, and the server stays fully busy doing useless work. \"Only the excess fails\" is the tempting answer, and it is exactly the result that load shedding exists to make true.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-shedding",
    "unitTitle": "Load shedding"
  },
  {
    "id": "srs-quiz-load-shedding-c2",
    "type": "quiz",
    "prompt": "A service has 200 worker slots, and each request needs 40 ms of work. What is its capacity, and about how many requests should be in flight at that rate for a 40 ms latency target?",
    "answer": "5,000 per second, with about 200 in flight\n\nExplanation: Capacity is 200 divided by 0.04 s, which is 5,000 per second, and Little's law gives 5,000 times 0.04 s, which is 200 requests in flight. Allowing thousands in flight is the tempting mistake: the extra requests only wait in a queue, so a concurrency limit near 200 is what protects latency.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-shedding",
    "unitTitle": "Load shedding"
  },
  {
    "id": "srs-quiz-load-shedding-c3",
    "type": "quiz",
    "prompt": "During overload, a node's load shedder rejects everything above its limit, including the load balancer's health checks. What happens next?",
    "answer": "The node is marked unhealthy, so its traffic moves to the survivors and overloads them\n\nExplanation: Failed health checks take the node out of rotation, which pushes its share onto the remaining nodes, which then shed and fail their own checks in turn. That is why health checks must be exempt from shedding. Expecting the cluster to recover is tempting, but removing a node reduces capacity, not the amount of incoming traffic.",
    "category": "Network Protocols & Service Communication",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "load-shedding",
    "unitTitle": "Load shedding"
  },
  {
    "id": "srs-takeaway-distributed-systems-foundations-1",
    "type": "takeaway",
    "prompt": "In Distributed systems foundations, what is a fundamental rule regarding: Networks are inherently asynchronous and unreliable; timeouts do not distinguish between server death and dropped return packets?",
    "answer": "Networks are inherently asynchronous and unreliable; timeouts do not distinguish between server death and dropped return packets.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-systems-foundations",
    "unitTitle": "Distributed systems foundations"
  },
  {
    "id": "srs-takeaway-distributed-systems-foundations-2",
    "type": "takeaway",
    "prompt": "In Distributed systems foundations, what is a fundamental rule regarding: Distributed systems design for Crash-Recovery models where nodes restart and rejoin with stale logs?",
    "answer": "Distributed systems design for Crash-Recovery models where nodes restart and rejoin with stale logs.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-systems-foundations",
    "unitTitle": "Distributed systems foundations"
  },
  {
    "id": "srs-takeaway-distributed-systems-foundations-3",
    "type": "takeaway",
    "prompt": "In Distributed systems foundations, what is a fundamental rule regarding: Byzantine fault tolerance is reserved for untrusted peer networks (blockchain); internal systems use crash-fault-tolerant Paxos/Raft, usually inside coordination services and databases (etcd, ZooKeeper, Consul, Spanner) rather than in each microservice?",
    "answer": "Byzantine fault tolerance is reserved for untrusted peer networks (blockchain); internal systems use crash-fault-tolerant Paxos/Raft, usually inside coordination services and databases (etcd, ZooKeeper, Consul, Spanner) rather than in each microservice.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-systems-foundations",
    "unitTitle": "Distributed systems foundations"
  },
  {
    "id": "srs-quiz-distributed-systems-foundations-c1",
    "type": "quiz",
    "prompt": "Inside a single organisation's datacenters, which failure model do coordination systems usually design for, and why not Byzantine?",
    "answer": "Crash-recovery, because nodes restart with lagging durable state, and BFT's quadratic message cost is not justified among trusted nodes\n\nExplanation: Private deployments assume crash-recovery: nodes crash, restart, replay their WAL and catch up with lagging state, and checksums plus authentication cover corruption. BFT's quadratic messaging and 3f+1 nodes are kept for mutually distrusting parties, so assuming Byzantine faults internally overpays.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-systems-foundations",
    "unitTitle": "Distributed systems foundations"
  },
  {
    "id": "srs-quiz-distributed-systems-foundations-c2",
    "type": "quiz",
    "prompt": "Service A charges cards through service B with a 1-second timeout. B occasionally stalls for 4 seconds in GC. When A times out, which design is safe?",
    "answer": "Send an idempotency key that B stores with the result in the same transaction, then retry freely\n\nExplanation: A timeout cannot tell A whether the request was lost, completed, or is still in progress, and only an idempotency key makes a retry safe in all three cases. The status check is tempting but races: a B stalled in GC can report 'no charge' and then process the original request alongside the retry.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-systems-foundations",
    "unitTitle": "Distributed systems foundations"
  },
  {
    "id": "srs-quiz-distributed-systems-foundations-c3",
    "type": "quiz",
    "prompt": "FLP proves that no deterministic consensus protocol can guarantee termination in an asynchronous system with even one crash. Yet etcd runs Raft in production. How is this reconciled?",
    "answer": "Raft assumes partial synchrony: it is always safe, and makes progress once timing bounds eventually hold\n\nExplanation: Under partial synchrony, consensus keeps safety at all times and gains liveness once the network is stable enough, which is the practical model for datacentres. Randomisation helps avoid repeated split votes but does not by itself defeat FLP, and real networks are not synchronous.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-systems-foundations",
    "unitTitle": "Distributed systems foundations"
  },
  {
    "id": "srs-takeaway-consistency-models-1",
    "type": "takeaway",
    "prompt": "In Consistency models, what is a fundamental rule regarding: Linearizability respects real-time precedence for completed operations?",
    "answer": "Linearizability respects real-time precedence for completed operations.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistency-models",
    "unitTitle": "Consistency models"
  },
  {
    "id": "srs-takeaway-consistency-models-2",
    "type": "takeaway",
    "prompt": "In Consistency models, what is a fundamental rule regarding: Session and causal guarantees constrain narrower observations?",
    "answer": "Session and causal guarantees constrain narrower observations.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistency-models",
    "unitTitle": "Consistency models"
  },
  {
    "id": "srs-takeaway-consistency-models-3",
    "type": "takeaway",
    "prompt": "In Consistency models, what is a fundamental rule regarding: Stronger guarantees add coordination and can reduce fault availability?",
    "answer": "Stronger guarantees add coordination and can reduce fault availability.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistency-models",
    "unitTitle": "Consistency models"
  },
  {
    "id": "srs-quiz-consistency-models-c1",
    "type": "quiz",
    "prompt": "Client 1's write x = 1 completes at 10:00:00. At 10:00:01, client 2 reads x and gets the old value 0. Which model permits this history, even though linearizability forbids it?",
    "answer": "Sequential consistency, which keeps each client's program order but not real-time order\n\nExplanation: Sequential consistency only needs one global order consistent with each client's program order, so it can place client 2's read before the write despite real time. Linearizability and strict serializability both respect real-time precedence for completed operations, so they forbid it.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistency-models",
    "unitTitle": "Consistency models"
  },
  {
    "id": "srs-quiz-consistency-models-c2",
    "type": "quiz",
    "prompt": "On an eventually consistent comment system, some users see Bob's reply 'Agreed!' before Alice's comment it replies to, because replicas apply updates in different orders. Which guarantee fixes exactly this, without full strong consistency?",
    "answer": "Causal consistency, so anyone who sees the reply has already seen the comment it depends on\n\nExplanation: The reply causally depends on the comment, and causal consistency orders causally related operations while leaving unrelated ones free. Read-your-writes only covers a user's own writes, so readers other than Bob could still see the reply first.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistency-models",
    "unitTitle": "Consistency models"
  },
  {
    "id": "srs-quiz-consistency-models-c3",
    "type": "quiz",
    "prompt": "You are choosing guarantees for (a) showing users their newly uploaded profile photo and (b) checking whether a username is already taken at signup. Which pairing matches the lesson?",
    "answer": "Read-your-writes for the photo; linearizable, or a uniqueness constraint enforced in one place, for the username\n\nExplanation: The photo only needs to look right to its author, so a session guarantee avoids an 80 ms cross-region round trip on every read. A username check must see every user's completed writes, so a session guarantee is not enough there.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consistency-models",
    "unitTitle": "Consistency models"
  },
  {
    "id": "srs-takeaway-replication-1",
    "type": "takeaway",
    "prompt": "In Replication, what is a fundamental rule regarding: Synchronous replication waits for a defined durable set, not necessarily all replicas?",
    "answer": "Synchronous replication waits for a defined durable set, not necessarily all replicas.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "replication",
    "unitTitle": "Replication"
  },
  {
    "id": "srs-takeaway-replication-2",
    "type": "takeaway",
    "prompt": "In Replication, what is a fundamental rule regarding: One replica acknowledgment does not universally guarantee zero data loss?",
    "answer": "One replica acknowledgment does not universally guarantee zero data loss.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "replication",
    "unitTitle": "Replication"
  },
  {
    "id": "srs-takeaway-replication-3",
    "type": "takeaway",
    "prompt": "In Replication, what is a fundamental rule regarding: W + R > N requires routing, versioning, and failure assumptions to provide freshness?",
    "answer": "W + R > N requires routing, versioning, and failure assumptions to provide freshness.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "replication",
    "unitTitle": "Replication"
  },
  {
    "id": "srs-quiz-replication-c1",
    "type": "quiz",
    "prompt": "A Postgres primary has four standbys, one of which is configured as the synchronous standby. When the primary acknowledges a commit, what is guaranteed?",
    "answer": "The synchronous standby has confirmed the write; the other three may still lag\n\nExplanation: Synchronous modes wait for a defined set of acknowledgements, here one named standby, not every replica. Majority acknowledgement is how consensus systems such as Raft behave, not Postgres synchronous replication.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "replication",
    "unitTitle": "Replication"
  },
  {
    "id": "srs-quiz-replication-c2",
    "type": "quiz",
    "prompt": "A primary takes 8,000 writes/s with asynchronous replicas: A lags by 250 ms and B by 3 seconds. The primary's disk dies and you promote A. Roughly how many acknowledged writes are lost?",
    "answer": "About 2,000\n\nExplanation: 8,000 writes/s times 0.25 s of lag is about 2,000 acknowledged writes that A never received; promoting B would lose about 24,000. Acknowledgement to the client means nothing for durability if the only copy was on the failed primary.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "replication",
    "unitTitle": "Replication"
  },
  {
    "id": "srs-quiz-replication-c3",
    "type": "quiz",
    "prompt": "A Dynamo-style store uses N = 3, W = 2, R = 2. During a partial outage, a write to key K succeeds on two nodes outside K's home set via sloppy quorum and hinted handoff. A read at R = 2 from K's home nodes returns the old value. Why?",
    "answer": "The write landed outside the home set, so the read quorum no longer intersects the nodes holding it\n\nExplanation: W + R greater than N guarantees overlap only when both quorums come from the same N home nodes, and sloppy quorums break that assumption until hinted handoff delivers the write. The configuration itself is fine; the routing assumption behind the arithmetic failed.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "replication",
    "unitTitle": "Replication"
  },
  {
    "id": "srs-takeaway-cap-and-pacelc-1",
    "type": "takeaway",
    "prompt": "In CAP and PACELC, what is a fundamental rule regarding: CAP describes consistency versus response availability during a partition?",
    "answer": "CAP describes consistency versus response availability during a partition.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "cap-and-pacelc",
    "unitTitle": "CAP and PACELC"
  },
  {
    "id": "srs-takeaway-cap-and-pacelc-2",
    "type": "takeaway",
    "prompt": "In CAP and PACELC, what is a fundamental rule regarding: Partition tolerance defines behavior under message loss; it does not promise every operation continues?",
    "answer": "Partition tolerance defines behavior under message loss; it does not promise every operation continues.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "cap-and-pacelc",
    "unitTitle": "CAP and PACELC"
  },
  {
    "id": "srs-takeaway-cap-and-pacelc-3",
    "type": "takeaway",
    "prompt": "In CAP and PACELC, what is a fundamental rule regarding: Classify operations and configurations, not whole products with one fixed label?",
    "answer": "Classify operations and configurations, not whole products with one fixed label.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "cap-and-pacelc",
    "unitTitle": "CAP and PACELC"
  },
  {
    "id": "srs-quiz-cap-and-pacelc-c1",
    "type": "quiz",
    "prompt": "In the CAP theorem, what does it mean for a system to be 'available'?",
    "answer": "Every non-failing node returns a non-error response to each request it receives\n\nExplanation: CAP availability is the strong requirement that every non-failing node answers without error, even while it is partitioned. The majority-side service a CP system keeps up during a partition is not CAP-available, which is why 'available' in CAP differs from everyday uptime.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "cap-and-pacelc",
    "unitTitle": "CAP and PACELC"
  },
  {
    "id": "srs-quiz-cap-and-pacelc-c2",
    "type": "quiz",
    "prompt": "Two regions lose their link for 3 minutes. Which behaviour matches the lesson for (a) add-to-cart and (b) decrementing the last unit of a limited-edition item?",
    "answer": "Cart stays available and merges later; the last-unit decrement is allowed only in the region that owns the item's primary\n\nExplanation: The choice is made per operation: carts can merge as a union afterwards, while overselling a limited item is worse than a few minutes of 'try again'. Last-write-wins on inventory would silently lose decrements and allow overselling.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "cap-and-pacelc",
    "unitTitle": "CAP and PACELC"
  },
  {
    "id": "srs-quiz-cap-and-pacelc-c3",
    "type": "quiz",
    "prompt": "A 5-node etcd cluster splits into a 3-node side and a 2-node side, with clients on both. What happens?",
    "answer": "The 3-node majority side keeps serving writes (electing a leader if needed), while the 2-node side rejects them\n\nExplanation: A CP system stays available on the majority side; only the minority rejects requests. An old leader stranded on the 2-node side cannot reach a majority, so it cannot commit, and the 3-node side elects a new leader.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "cap-and-pacelc",
    "unitTitle": "CAP and PACELC"
  },
  {
    "id": "srs-takeaway-clocks-and-ordering-1",
    "type": "takeaway",
    "prompt": "In Clocks and ordering, what is a fundamental rule regarding: Use monotonic clocks for local durations and wall clocks for calendar time?",
    "answer": "Use monotonic clocks for local durations and wall clocks for calendar time.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "clocks-and-ordering",
    "unitTitle": "Clocks and ordering"
  },
  {
    "id": "srs-takeaway-clocks-and-ordering-2",
    "type": "takeaway",
    "prompt": "In Clocks and ordering, what is a fundamental rule regarding: Lamport order preserves causality in one direction but cannot detect concurrency?",
    "answer": "Lamport order preserves causality in one direction but cannot detect concurrency.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "clocks-and-ordering",
    "unitTitle": "Clocks and ordering"
  },
  {
    "id": "srs-takeaway-clocks-and-ordering-3",
    "type": "takeaway",
    "prompt": "In Clocks and ordering, what is a fundamental rule regarding: Vector and hybrid clocks add metadata in exchange for stronger ordering information?",
    "answer": "Vector and hybrid clocks add metadata in exchange for stronger ordering information.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "clocks-and-ordering",
    "unitTitle": "Clocks and ordering"
  },
  {
    "id": "srs-quiz-clocks-and-ordering-c1",
    "type": "quiz",
    "prompt": "A service measures request latency by subtracting two wall-clock readings. Occasionally it reports negative latency or fires a timeout instantly. What should it use instead?",
    "answer": "A monotonic clock, which measures elapsed time on one host and is never stepped\n\nExplanation: Wall clocks can be stepped by synchronisation, which distorts durations; monotonic clocks exist for local elapsed time. Lamport clocks count events, not seconds, so they cannot measure a timeout.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "clocks-and-ordering",
    "unitTitle": "Clocks and ordering"
  },
  {
    "id": "srs-quiz-clocks-and-ordering-c2",
    "type": "quiz",
    "prompt": "Node B's Lamport counter is 4. It receives a message carrying timestamp 9, then performs one local write. What timestamp does that local write get?",
    "answer": "11\n\nExplanation: On receive B sets its counter to max(4, 9) + 1 = 10, and the next local event increments it to 11. 10 is the timestamp of the receive event itself, not the write that follows.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "clocks-and-ordering",
    "unitTitle": "Clocks and ordering"
  },
  {
    "id": "srs-quiz-clocks-and-ordering-c3",
    "type": "quiz",
    "prompt": "A CockroachDB read at timestamp t finds a value written at t + 200 ms, and the cluster's maximum clock offset is 500 ms. What does the read do, and why?",
    "answer": "Restarts at a higher timestamp, because within the uncertainty window it cannot tell whether that write happened before the read in real time\n\nExplanation: With clocks that may differ by up to the max offset, a value slightly 'in the future' may really have been committed before the read began, so CockroachDB restarts the read above it. Ignoring it risks a stale read; commit-wait belongs to Spanner's TrueTime design, not HLC reads.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "clocks-and-ordering",
    "unitTitle": "Clocks and ordering"
  },
  {
    "id": "srs-takeaway-consensus-1",
    "type": "takeaway",
    "prompt": "In Consensus, what is a fundamental rule regarding: Consensus safety uses ballots or terms, durable state, and quorum intersection?",
    "answer": "Consensus safety uses ballots or terms, durable state, and quorum intersection.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consensus",
    "unitTitle": "Consensus"
  },
  {
    "id": "srs-takeaway-consensus-2",
    "type": "takeaway",
    "prompt": "In Consensus, what is a fundamental rule regarding: Liveness depends on timing and scheduling assumptions stronger than full asynchrony?",
    "answer": "Liveness depends on timing and scheduling assumptions stronger than full asynchrony.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consensus",
    "unitTitle": "Consensus"
  },
  {
    "id": "srs-takeaway-consensus-3",
    "type": "takeaway",
    "prompt": "In Consensus, what is a fundamental rule regarding: Consensus does not make external side effects or application invariants automatic?",
    "answer": "Consensus does not make external side effects or application invariants automatic.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consensus",
    "unitTitle": "Consensus"
  },
  {
    "id": "srs-quiz-consensus-c1",
    "type": "quiz",
    "prompt": "What do Raft's randomised election timeouts actually achieve?",
    "answer": "They make repeated split votes unlikely, which helps liveness, while safety comes from terms and quorum intersection\n\nExplanation: Randomisation spreads out candidates so elections usually settle quickly, but the lesson notes it does not by itself defeat FLP. Safety, meaning no conflicting commits, comes from terms, durable logs and overlapping majorities, not from timing.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consensus",
    "unitTitle": "Consensus"
  },
  {
    "id": "srs-quiz-consensus-c2",
    "type": "quiz",
    "prompt": "Your 3-node etcd cluster tolerates one failure. A manager proposes adding a fourth node for extra resilience. What is the effect?",
    "answer": "The majority becomes 3, so it still tolerates only one failure and each commit waits for an extra acknowledgement\n\nExplanation: A majority of 4 is 3, so losing 2 nodes stops commits, just like losing 2 of 3; you pay more acknowledgements for no extra tolerance. Two out of four is a tie, not a majority, which is why even cluster sizes are avoided.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consensus",
    "unitTitle": "Consensus"
  },
  {
    "id": "srs-quiz-consensus-c3",
    "type": "quiz",
    "prompt": "An operator grows a 3-node Raft cluster to 5 by editing the peer list in each node's config file and restarting the nodes one at a time. What is the danger?",
    "answer": "Mid-rollout, nodes on the old and new configurations can each form their own majority, allowing two leaders to commit conflicting entries\n\nExplanation: Changing membership outside the protocol can create two disjoint majorities, one under each configuration, which breaks the quorum intersection that safety relies on. Raft avoids this with joint consensus or one-server-at-a-time changes; its logs and terms are durable, so the other options do not apply.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "consensus",
    "unitTitle": "Consensus"
  },
  {
    "id": "srs-takeaway-leader-election-1",
    "type": "takeaway",
    "prompt": "In Leader election, what is a fundamental rule regarding: Election timeouts are deployment parameters, not universal constants?",
    "answer": "Election timeouts are deployment parameters, not universal constants.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "leader-election",
    "unitTitle": "Leader election"
  },
  {
    "id": "srs-takeaway-leader-election-2",
    "type": "takeaway",
    "prompt": "In Leader election, what is a fundamental rule regarding: A leader still needs fencing or idempotency for external effects?",
    "answer": "A leader still needs fencing or idempotency for external effects.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "leader-election",
    "unitTitle": "Leader election"
  },
  {
    "id": "srs-takeaway-leader-election-3",
    "type": "takeaway",
    "prompt": "In Leader election, what is a fundamental rule regarding: Randomization reduces split votes but does not alone prevent stale-owner work?",
    "answer": "Randomization reduces split votes but does not alone prevent stale-owner work.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "leader-election",
    "unitTitle": "Leader election"
  },
  {
    "id": "srs-quiz-leader-election-c1",
    "type": "quiz",
    "prompt": "Why does a Raft follower refuse to vote for a candidate whose log is less up to date than its own?",
    "answer": "So that any elected leader already holds every committed entry, since committed entries live on a majority\n\nExplanation: A committed entry is on a majority, and any winning candidate needs votes from a majority, so the two sets overlap and the restriction ensures the winner has that entry. Preventing two leaders in the same term comes from one vote per term, not from the log check.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "leader-election",
    "unitTitle": "Leader election"
  },
  {
    "id": "srs-quiz-leader-election-c2",
    "type": "quiz",
    "prompt": "In a 5-node Raft cluster, leader L of term 4 pauses for 3 seconds while B wins term 5. L wakes up, still believes it leads, and accepts a client write. What happens to that write?",
    "answer": "It never commits: followers reply with term 5, L steps down, and the write cannot reach a majority in term 4\n\nExplanation: Followers reject AppendEntries from a stale term, so L learns about term 5 and steps down without ever gathering a majority. Safety comes from followers rejecting the old term, not from L realising on its own that it was deposed.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "leader-election",
    "unitTitle": "Leader election"
  },
  {
    "id": "srs-quiz-leader-election-c3",
    "type": "quiz",
    "prompt": "A node is partitioned for 10 minutes and keeps timing out and starting elections. When it rejoins, the healthy leader is forced to step down. Which mechanism prevents this?",
    "answer": "Raft's PreVote, in which a node checks it could win before incrementing its term\n\nExplanation: While isolated, the node inflated its term, and on rejoining that higher term deposes the healthy leader; PreVote stops it incrementing the term unless a majority would support it. Fencing tokens protect external resources from stale leaders but do nothing about term inflation.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "leader-election",
    "unitTitle": "Leader election"
  },
  {
    "id": "srs-takeaway-distributed-locks-and-leases-1",
    "type": "takeaway",
    "prompt": "In Distributed locks and leases, what is a fundamental rule regarding: A paused client can continue after its lease expires?",
    "answer": "A paused client can continue after its lease expires.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-locks-and-leases",
    "unitTitle": "Distributed locks and leases"
  },
  {
    "id": "srs-takeaway-distributed-locks-and-leases-2",
    "type": "takeaway",
    "prompt": "In Distributed locks and leases, what is a fundamental rule regarding: Targets can reject stale fencing tokens or enforce conditional versions?",
    "answer": "Targets can reject stale fencing tokens or enforce conditional versions.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-locks-and-leases",
    "unitTitle": "Distributed locks and leases"
  },
  {
    "id": "srs-takeaway-distributed-locks-and-leases-3",
    "type": "takeaway",
    "prompt": "In Distributed locks and leases, what is a fundamental rule regarding: Transactions, idempotency, or single-owner logs may be better than locks?",
    "answer": "Transactions, idempotency, or single-owner logs may be better than locks.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-locks-and-leases",
    "unitTitle": "Distributed locks and leases"
  },
  {
    "id": "srs-quiz-distributed-locks-and-leases-c1",
    "type": "quiz",
    "prompt": "Why can a lock holder not simply check its lease locally before each write to guarantee mutual exclusion?",
    "answer": "The process can pause between the check and the write, so the resource itself must reject stale holders\n\nExplanation: A GC pause or VM stall between 'am I still the holder?' and the write is invisible to the process, so only the target, checking a fencing token or version, can enforce exclusion. The client does know its TTL; the issue is that it cannot observe its own pauses.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-locks-and-leases",
    "unitTitle": "Distributed locks and leases"
  },
  {
    "id": "srs-quiz-distributed-locks-and-leases-c2",
    "type": "quiz",
    "prompt": "A holder sends an acquire request at t = 0 and receives the reply at t = 0.4 s. The lease TTL is 15 s, the clock drift allowance is 1 percent, and the safety margin is 1.5 s. Following the lesson, when should it stop working, on its monotonic clock?",
    "answer": "At about t = 13.35 s, measured from when the request was sent\n\nExplanation: 15 x (1 - 0.01) - 1.5 = 13.35 s, counted from when the request was sent, because the coordinator may have started the lease at any point after that. Counting from the reply wrongly adds the 0.4 s round trip to the holder's safe window.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-locks-and-leases",
    "unitTitle": "Distributed locks and leases"
  },
  {
    "id": "srs-quiz-distributed-locks-and-leases-c3",
    "type": "quiz",
    "prompt": "A team uses Redis SET NX PX so that only one worker at a time updates an account balance in Postgres. Which change gives correctness most simply?",
    "answer": "Drop the lock and use a conditional UPDATE on a version column in Postgres\n\nExplanation: A compare-and-set on a version column is enforced by the resource itself, which makes it safe against pauses and often removes the need for a lock. Redlock, longer TTLs and watchdogs all leave the database accepting writes from a paused, expired holder.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-locks-and-leases",
    "unitTitle": "Distributed locks and leases"
  },
  {
    "id": "srs-takeaway-redis-redlock-and-fencing-tokens-1",
    "type": "takeaway",
    "prompt": "In Redis Redlock and fencing tokens, what is a fundamental rule regarding: Ownership tokens make lock release safe from deleting another client's lock?",
    "answer": "Ownership tokens make lock release safe from deleting another client's lock.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "redis-redlock-and-fencing-tokens",
    "unitTitle": "Redis Redlock and fencing tokens"
  },
  {
    "id": "srs-takeaway-redis-redlock-and-fencing-tokens-2",
    "type": "takeaway",
    "prompt": "In Redis Redlock and fencing tokens, what is a fundamental rule regarding: Redlock relies on independent nodes and elapsed-time assumptions?",
    "answer": "Redlock relies on independent nodes and elapsed-time assumptions.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "redis-redlock-and-fencing-tokens",
    "unitTitle": "Redis Redlock and fencing tokens"
  },
  {
    "id": "srs-takeaway-redis-redlock-and-fencing-tokens-3",
    "type": "takeaway",
    "prompt": "In Redis Redlock and fencing tokens, what is a fundamental rule regarding: Correctness-critical external writes still need downstream fencing or conditional updates?",
    "answer": "Correctness-critical external writes still need downstream fencing or conditional updates.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "redis-redlock-and-fencing-tokens",
    "unitTitle": "Redis Redlock and fencing tokens"
  },
  {
    "id": "srs-quiz-redis-redlock-and-fencing-tokens-c1",
    "type": "quiz",
    "prompt": "Why does the lesson release a Redis lock with a Lua script that compares the stored value to your token before calling DEL, instead of a plain DEL?",
    "answer": "If your lease expired and another client acquired the lock, a plain DEL would delete their lock\n\nExplanation: The unique value proves ownership, so the atomic compare-and-delete removes the lock only if it is still yours. DEL is atomic and does remove expiring keys; the danger is deleting a lock that now belongs to someone else.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "redis-redlock-and-fencing-tokens",
    "unitTitle": "Redis Redlock and fencing tokens"
  },
  {
    "id": "srs-quiz-redis-redlock-and-fencing-tokens-c2",
    "type": "quiz",
    "prompt": "Using Redlock with a 30,000 ms TTL, a client gets OK from 3 of 5 masters after 400 ms. The drift allowance is 1 percent of the TTL plus 2 ms. What is the lock's validity time?",
    "answer": "29,298 ms\n\nExplanation: Validity = 30,000 - 400 - (300 + 2) = 29,298 ms, and the lock counts only because a majority answered. 29,600 ms forgets the drift allowance, which covers clocks on the Redis nodes running at different rates.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "redis-redlock-and-fencing-tokens",
    "unitTitle": "Redis Redlock and fencing tokens"
  },
  {
    "id": "srs-quiz-redis-redlock-and-fencing-tokens-c3",
    "type": "quiz",
    "prompt": "To protect balance updates, a team plans to pass Redlock's random lock value to the database as a fencing token and reject writes carrying an 'older' token. Why will this not work?",
    "answer": "The random values are not monotonic, so the database cannot tell which holder is newer; use an etcd revision, ZooKeeper zxid or a DB version\n\nExplanation: Fencing needs tokens that only increase, so the resource can reject anything lower than the highest it has seen; random values carry no order. The lesson's table lists 'No' for fencing tokens under Redlock for exactly this reason.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "redis-redlock-and-fencing-tokens",
    "unitTitle": "Redis Redlock and fencing tokens"
  },
  {
    "id": "srs-takeaway-circuit-breakers-and-timeouts-1",
    "type": "takeaway",
    "prompt": "In Circuit breakers and timeouts, what is a fundamental rule regarding: Slow dependencies exhaust thread pools faster than dead dependencies, causing catastrophic cascading fleet failure?",
    "answer": "Slow dependencies exhaust thread pools faster than dead dependencies, causing catastrophic cascading fleet failure.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "circuit-breakers-and-timeouts",
    "unitTitle": "Circuit breakers and timeouts"
  },
  {
    "id": "srs-takeaway-circuit-breakers-and-timeouts-2",
    "type": "takeaway",
    "prompt": "In Circuit breakers and timeouts, what is a fundamental rule regarding: Circuit breakers fail fast in Open state, shielding downstream services from traffic while they recover?",
    "answer": "Circuit breakers fail fast in Open state, shielding downstream services from traffic while they recover.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "circuit-breakers-and-timeouts",
    "unitTitle": "Circuit breakers and timeouts"
  },
  {
    "id": "srs-takeaway-circuit-breakers-and-timeouts-3",
    "type": "takeaway",
    "prompt": "In Circuit breakers and timeouts, what is a fundamental rule regarding: Exponential backoff must incorporate Full Jitter to eliminate synchronized retry traffic spikes?",
    "answer": "Exponential backoff must incorporate Full Jitter to eliminate synchronized retry traffic spikes.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "circuit-breakers-and-timeouts",
    "unitTitle": "Circuit breakers and timeouts"
  },
  {
    "id": "srs-quiz-circuit-breakers-and-timeouts-c1",
    "type": "quiz",
    "prompt": "A circuit breaker has been OPEN for its full 15-second sleep window. What happens next?",
    "answer": "It moves to HALF-OPEN and lets a few trial requests through, then closes or reopens based on their results\n\nExplanation: Half-open lets a small number of probe requests through; if they succeed the breaker closes, and if they fail it reopens for another sleep window. Closing straight away would hit a still-recovering dependency with full load.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "circuit-breakers-and-timeouts",
    "unitTitle": "Circuit breakers and timeouts"
  },
  {
    "id": "srs-quiz-circuit-breakers-and-timeouts-c2",
    "type": "quiz",
    "prompt": "An API instance has 250 worker threads and serves 800 rps, and every request calls a dependency that has slowed to 3-second responses. What happens without a tight timeout, and how many threads does a 200 ms timeout tie up at most?",
    "answer": "About 2,400 requests in flight, exhausting the pool in about 0.3 s; a 200 ms timeout caps it at about 160 threads\n\nExplanation: In-flight requests equal arrival rate times duration: 800 x 3 s = 2,400, far more than 250 threads, while 800 x 0.2 s = 160 fits. This is why a slow dependency is worse than a dead one, which frees threads almost instantly.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "circuit-breakers-and-timeouts",
    "unitTitle": "Circuit breakers and timeouts"
  },
  {
    "id": "srs-quiz-circuit-breakers-and-timeouts-c3",
    "type": "quiz",
    "prompt": "A public endpoint has a 2-second deadline, but the service behind it gives its database calls a 30-second timeout. During a database slowdown, what goes wrong and what fixes it?",
    "answer": "Work continues long after the caller gave up, wasting database capacity; propagate the deadline so downstream calls stop when it passes\n\nExplanation: Without deadline propagation, abandoned requests keep holding connections and queries on an already struggling database, and client retries add more on top. The caller's error does not cancel the downstream work, which is the trap in 'nothing goes wrong'.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "circuit-breakers-and-timeouts",
    "unitTitle": "Circuit breakers and timeouts"
  },
  {
    "id": "srs-takeaway-gossip-protocol-1",
    "type": "takeaway",
    "prompt": "In Gossip protocol, what is a fundamental rule regarding: Gossip protocols provide decentralized O(log N) state dissemination across thousands of nodes without central servers?",
    "answer": "Gossip protocols provide decentralized O(log N) state dissemination across thousands of nodes without central servers.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "gossip-protocol",
    "unitTitle": "Gossip protocol"
  },
  {
    "id": "srs-takeaway-gossip-protocol-2",
    "type": "takeaway",
    "prompt": "In Gossip protocol, what is a fundamental rule regarding: Rumor-mongering propagates state updates exponentially like an epidemic to k random peers per round?",
    "answer": "Rumor-mongering propagates state updates exponentially like an epidemic to k random peers per round.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "gossip-protocol",
    "unitTitle": "Gossip protocol"
  },
  {
    "id": "srs-takeaway-gossip-protocol-3",
    "type": "takeaway",
    "prompt": "In Gossip protocol, what is a fundamental rule regarding: The Φ-Accrual failure detector calculates probabilistic suspicion curves instead of rigid binary timeouts?",
    "answer": "The Φ-Accrual failure detector calculates probabilistic suspicion curves instead of rigid binary timeouts.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "gossip-protocol",
    "unitTitle": "Gossip protocol"
  },
  {
    "id": "srs-quiz-gossip-protocol-c1",
    "type": "quiz",
    "prompt": "How does a phi-accrual failure detector differ from a fixed heartbeat timeout?",
    "answer": "It outputs a continuous suspicion score based on past heartbeat intervals, and each application picks its own threshold\n\nExplanation: Phi rises as silence becomes less likely under the observed arrival pattern, so a storage coordinator might wait for phi = 12 while a cache fails over at 4. Asking peers to confirm is SWIM's indirect probing, a separate technique.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "gossip-protocol",
    "unitTitle": "Gossip protocol"
  },
  {
    "id": "srs-quiz-gossip-protocol-c2",
    "type": "quiz",
    "prompt": "A 1,000-node cluster gossips every second with fanout 3 and 2 KB digests. It grows to 16,000 nodes. What happens to convergence time and per-node gossip bandwidth?",
    "answer": "Convergence grows by only about two rounds, and per-node bandwidth stays about 6 KB/s\n\nExplanation: Informed nodes roughly quadruple per round, so 16x more nodes needs about log4(16) = 2 more rounds. Each node still sends 3 x 2 KB per second whatever the cluster size, unlike all-to-all heartbeating.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "gossip-protocol",
    "unitTitle": "Gossip protocol"
  },
  {
    "id": "srs-quiz-gossip-protocol-c3",
    "type": "quiz",
    "prompt": "Under SWIM, node A's pings to B time out, but B is healthy and only the A-to-B path is bad. What stops B from being wrongly declared dead?",
    "answer": "A asks other nodes to probe B indirectly, and if B is still marked suspect, B refutes it by gossiping a higher incarnation number\n\nExplanation: Indirect ping-req probes separate 'B is dead' from 'this path is bad', and suspicion is a gossiped state that B can override with a higher incarnation before the timeout. Retrying over the same broken path cannot tell those two cases apart.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "gossip-protocol",
    "unitTitle": "Gossip protocol"
  },
  {
    "id": "srs-takeaway-metadata-service-and-node-discovery-1",
    "type": "takeaway",
    "prompt": "In Metadata service and node discovery, what is a fundamental rule regarding: Distributed metadata stores (Etcd, ZooKeeper) provide strongly consistent consensus-backed coordination?",
    "answer": "Distributed metadata stores (Etcd, ZooKeeper) provide strongly consistent consensus-backed coordination.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "metadata-service-and-node-discovery",
    "unitTitle": "Metadata service and node discovery"
  },
  {
    "id": "srs-takeaway-metadata-service-and-node-discovery-2",
    "type": "takeaway",
    "prompt": "In Metadata service and node discovery, what is a fundamental rule regarding: Ephemeral nodes automatically unregister crashed instances when client heartbeat sessions expire?",
    "answer": "Ephemeral nodes automatically unregister crashed instances when client heartbeat sessions expire.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "metadata-service-and-node-discovery",
    "unitTitle": "Metadata service and node discovery"
  },
  {
    "id": "srs-takeaway-metadata-service-and-node-discovery-3",
    "type": "takeaway",
    "prompt": "In Metadata service and node discovery, what is a fundamental rule regarding: Event watchers use HTTP/2 streaming or persistent TCP to push topology updates instantly to API gateways?",
    "answer": "Event watchers use HTTP/2 streaming or persistent TCP to push topology updates instantly to API gateways.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "metadata-service-and-node-discovery",
    "unitTitle": "Metadata service and node discovery"
  },
  {
    "id": "srs-quiz-metadata-service-and-node-discovery-c1",
    "type": "quiz",
    "prompt": "A gateway uses a classic (pre-3.6) ZooKeeper watch on /services/payment and receives a notification that a child changed. What must it do so it does not miss later changes?",
    "answer": "Re-read the children and re-register the watch, because classic watches fire only once\n\nExplanation: Classic ZooKeeper watches are one-shot, so changes between the notification and re-registration are seen only through the re-read. Resuming from a revision is how etcd watch streams work, not classic ZooKeeper.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "metadata-service-and-node-discovery",
    "unitTitle": "Metadata service and node discovery"
  },
  {
    "id": "srs-quiz-metadata-service-and-node-discovery-c2",
    "type": "quiz",
    "prompt": "An instance registers in etcd with a 15-second lease and sends KeepAlives every 5 seconds. It is OOM-killed right after a KeepAlive. About when does the gateway watching the prefix remove it?",
    "answer": "After about 15 seconds, when the lease expires and etcd deletes the key\n\nExplanation: Worst-case detection equals the TTL, since etcd revokes the lease only once it expires and then emits the DELETE event. A single missed KeepAlive does not end the lease; that allowance is what protects against brief GC pauses.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "metadata-service-and-node-discovery",
    "unitTitle": "Metadata service and node discovery"
  },
  {
    "id": "srs-quiz-metadata-service-and-node-discovery-c3",
    "type": "quiz",
    "prompt": "etcd writes suddenly fail with a NOSPACE alarm while reads keep working. The team has been storing config history and large blobs in it. What is happening and what fixes it?",
    "answer": "The database hit its space quota (2 GB by default) and went read-only; compact and defragment, and move bulk data elsewhere\n\nExplanation: etcd enforces a backend quota, and exceeding it raises NOSPACE and blocks writes until you compact and defragment. A bigger disk does not raise the quota, and the real cause is using a coordination store as a general database.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "metadata-service-and-node-discovery",
    "unitTitle": "Metadata service and node discovery"
  },
  {
    "id": "srs-takeaway-distributed-hash-tables-1",
    "type": "takeaway",
    "prompt": "In Distributed hash tables, what is a fundamental rule regarding: Distributed Hash Tables scale decentralized key-value lookups to millions of nodes without central servers?",
    "answer": "Distributed Hash Tables scale decentralized key-value lookups to millions of nodes without central servers.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-hash-tables",
    "unitTitle": "Distributed hash tables"
  },
  {
    "id": "srs-takeaway-distributed-hash-tables-2",
    "type": "takeaway",
    "prompt": "In Distributed hash tables, what is a fundamental rule regarding: Kademlia defines routing distance using bitwise XOR (d(x, y) = x ⊕ y), ensuring symmetric, unidirectional routing?",
    "answer": "Kademlia defines routing distance using bitwise XOR (d(x, y) = x ⊕ y), ensuring symmetric, unidirectional routing.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-hash-tables",
    "unitTitle": "Distributed hash tables"
  },
  {
    "id": "srs-takeaway-distributed-hash-tables-3",
    "type": "takeaway",
    "prompt": "In Distributed hash tables, what is a fundamental rule regarding: Routing via k-buckets finds keys in O(log N) network hops with high probability, even in very large networks?",
    "answer": "Routing via k-buckets finds keys in O(log N) network hops with high probability, even in very large networks.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-hash-tables",
    "unitTitle": "Distributed hash tables"
  },
  {
    "id": "srs-quiz-distributed-hash-tables-c1",
    "type": "quiz",
    "prompt": "With 4-bit Kademlia IDs, a lookup targets key 1001. Of the known nodes 1000, 1011, 1101 and 0001, which is closest by XOR distance?",
    "answer": "1000\n\nExplanation: The XOR distances are 0001 (1), 0010 (2), 0100 (4) and 1000 (8), so 1000 is closest. 0001 shares the three low bits with the key but differs in the leading bit, and XOR weights the leading bits most.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-hash-tables",
    "unitTitle": "Distributed hash tables"
  },
  {
    "id": "srs-quiz-distributed-hash-tables-c2",
    "type": "quiz",
    "prompt": "Why does Cassandra route requests in one hop rather than using Kademlia-style O(log N) routing?",
    "answer": "Every node holds full ring membership, which suits a managed, modest-sized cluster but not millions of churning peers\n\nExplanation: Dynamo-style systems give every node the full membership, so any node can find a key's owners in one hop. Multi-hop DHTs exist because full membership is impractical for huge, untrusted, churning peer sets; Chord is itself an O(log N) design.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-hash-tables",
    "unitTitle": "Distributed hash tables"
  },
  {
    "id": "srs-quiz-distributed-hash-tables-c3",
    "type": "quiz",
    "prompt": "A peer stores a value on the k closest nodes once and never republishes it. Weeks later, lookups fail even though the publisher is still online. Why?",
    "answer": "Churn has replaced the original closest nodes, and the new closest nodes never received the value; values need periodic republishing\n\nExplanation: Peers often stay only minutes to hours, so the set of closest nodes drifts, and values must be replicated to k nodes and republished periodically. Key IDs and XOR distances are fixed, and k-buckets actually prefer long-lived contacts.",
    "category": "Distributed Coordination, Consensus & Leases",
    "track": "Distributed Systems, Consensus & Coordination",
    "topicSlug": "distributed-hash-tables",
    "unitTitle": "Distributed hash tables"
  },
  {
    "id": "srs-takeaway-caching-layers-1",
    "type": "takeaway",
    "prompt": "In Caching layers, what is a fundamental rule regarding: Modern web architecture employs a multi-layer cache hierarchy from browser headers to database buffer pools?",
    "answer": "Modern web architecture employs a multi-layer cache hierarchy from browser headers to database buffer pools.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "caching-layers",
    "unitTitle": "Caching layers"
  },
  {
    "id": "srs-takeaway-caching-layers-2",
    "type": "takeaway",
    "prompt": "In Caching layers, what is a fundamental rule regarding: Browser and CDN caching leverage Cache-Control immutable and ETag conditional validation to bypass servers?",
    "answer": "Browser and CDN caching leverage Cache-Control immutable and ETag conditional validation to bypass servers.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "caching-layers",
    "unitTitle": "Caching layers"
  },
  {
    "id": "srs-takeaway-caching-layers-3",
    "type": "takeaway",
    "prompt": "In Caching layers, what is a fundamental rule regarding: In-process L1 caching (Caffeine/Go) eliminates network serialization overhead, delivering sub-microsecond reads?",
    "answer": "In-process L1 caching (Caffeine/Go) eliminates network serialization overhead, delivering sub-microsecond reads.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "caching-layers",
    "unitTitle": "Caching layers"
  },
  {
    "id": "srs-quiz-caching-layers-c1",
    "type": "quiz",
    "prompt": "A content-hashed file app.3f9c.js is served with Cache-Control: public, max-age=31536000, immutable. A user reloads the page a week later. What does the browser do for that file?",
    "answer": "Serves it from its local cache without making any network request\n\nExplanation: With immutable and a one-year max-age, the browser never issues a request for the file's lifetime; a new version ships under a new URL. A conditional request returning 304 is how ETag validation works, which still costs a round trip.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "caching-layers",
    "unitTitle": "Caching layers"
  },
  {
    "id": "srs-quiz-caching-layers-c2",
    "type": "quiz",
    "prompt": "A product API gets 50,000 rps. The browser cache absorbs 30 percent, the CDN absorbs a share of the rest, and L1 plus Redis absorb 95 percent of what reaches the app. If a bad query-string change drops the CDN hit ratio to 20 percent, roughly how many qps reach the database?",
    "answer": "About 1,400 qps\n\nExplanation: 50,000 x 0.70 = 35,000 leave devices; with a 20 percent CDN hit ratio 28,000 reach the origin, and 5 percent of that is 1,400 qps. Hit ratios multiply, so a regression in one layer passes straight through to the database rather than being soaked up downstream.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "caching-layers",
    "unitTitle": "Caching layers"
  },
  {
    "id": "srs-quiz-caching-layers-c3",
    "type": "quiz",
    "prompt": "After an admin updates a price, the same user sees the new price, then the old one, then the new one again on successive refreshes for several minutes. The service runs 50 instances, each with an in-process L1 in front of Redis. What is the most likely cause and fix?",
    "answer": "Each instance's L1 holds its own copy and expires independently; broadcast invalidations via pub/sub or shorten the L1 TTL\n\nExplanation: Successive requests hit different instances behind the load balancer, and each L1 is an independent copy with poor fleet-wide invalidation control. Redis replication lag is usually milliseconds, and a stale browser cache would show the old price consistently rather than alternating.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "caching-layers",
    "unitTitle": "Caching layers"
  },
  {
    "id": "srs-takeaway-distributed-cache-design-1",
    "type": "takeaway",
    "prompt": "In Distributed cache design, what is a fundamental rule regarding: Memcached uses client-side consistent hashing (Ketama) with zero server-to-server coordination?",
    "answer": "Memcached uses client-side consistent hashing (Ketama) with zero server-to-server coordination.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-cache-design",
    "unitTitle": "Distributed cache design"
  },
  {
    "id": "srs-takeaway-distributed-cache-design-2",
    "type": "takeaway",
    "prompt": "In Distributed cache design, what is a fundamental rule regarding: Redis Cluster partitions keys across 16,384 hash slots using CRC16, managed via internal gossip protocols?",
    "answer": "Redis Cluster partitions keys across 16,384 hash slots using CRC16, managed via internal gossip protocols.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-cache-design",
    "unitTitle": "Distributed cache design"
  },
  {
    "id": "srs-takeaway-distributed-cache-design-3",
    "type": "takeaway",
    "prompt": "In Distributed cache design, what is a fundamental rule regarding: MOVED redirections update the client's routing cache; ASK redirections handle active slot migrations without downtime?",
    "answer": "MOVED redirections update the client's routing cache; ASK redirections handle active slot migrations without downtime.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-cache-design",
    "unitTitle": "Distributed cache design"
  },
  {
    "id": "srs-quiz-distributed-cache-design-c1",
    "type": "quiz",
    "prompt": "While slot 8402 is being migrated from node B to node C, a client sends a GET for a key in that slot to node B and receives an ASK redirect. What should the client do?",
    "answer": "Send ASKING followed by the command to node C, without updating its permanent slot map\n\nExplanation: ASK is a one-off redirect during online migration: the client sends ASKING then the query to the target, but keeps its routing table unchanged because the slot is still officially owned by B. Updating the slot map is the correct response to MOVED, not ASK.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-cache-design",
    "unitTitle": "Distributed cache design"
  },
  {
    "id": "srs-quiz-distributed-cache-design-c2",
    "type": "quiz",
    "prompt": "You need to cache 300M objects averaging 1 KB, with about 100 bytes of per-key overhead. Following the lesson, you keep nodes at no more than 70 percent memory and give each primary one replica. With 64 GB nodes, how many nodes do you need?",
    "answer": "16 nodes, 8 primaries plus 8 replicas\n\nExplanation: 300M x 1.1 KB is about 330 GB; at 70 percent use that needs about 470 GB of RAM, so 8 primaries of 64 GB, doubled to 16 with replicas. Dividing raw data by node size ignores both the headroom for fragmentation and replication buffers and the replicas themselves.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-cache-design",
    "unitTitle": "Distributed cache design"
  },
  {
    "id": "srs-quiz-distributed-cache-design-c3",
    "type": "quiz",
    "prompt": "A network partition isolates one Redis Cluster primary with a few clients on its side. Those clients keep writing successfully. After the partition heals, those writes are gone. Why?",
    "answer": "The minority primary accepted writes until cluster-node-timeout expired, while the majority promoted its replica; on rejoin it became a replica and its writes were discarded\n\nExplanation: Redis Cluster replication is asynchronous and a minority primary keeps accepting writes until the node timeout; meanwhile the majority fails over, and the old primary rejoins as a replica, losing those writes. The loss is limited to the isolated side, not every write during failover.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-cache-design",
    "unitTitle": "Distributed cache design"
  },
  {
    "id": "srs-takeaway-cache-eviction-policies-1",
    "type": "takeaway",
    "prompt": "In Cache eviction policies, what is a fundamental rule regarding: Redis provides approximate LRU and LFU; Caffeine is a Window TinyLFU implementation?",
    "answer": "Redis provides approximate LRU and LFU; Caffeine is a Window TinyLFU implementation.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-eviction-policies",
    "unitTitle": "Cache eviction policies"
  },
  {
    "id": "srs-takeaway-cache-eviction-policies-2",
    "type": "takeaway",
    "prompt": "In Cache eviction policies, what is a fundamental rule regarding: Evaluate item and byte hit rates on representative access traces?",
    "answer": "Evaluate item and byte hit rates on representative access traces.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-eviction-policies",
    "unitTitle": "Cache eviction policies"
  },
  {
    "id": "srs-takeaway-cache-eviction-policies-3",
    "type": "takeaway",
    "prompt": "In Cache eviction policies, what is a fundamental rule regarding: Eviction interacts with TTL, entry size, invalidation, and business value?",
    "answer": "Eviction interacts with TTL, entry size, invalidation, and business value.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-eviction-policies",
    "unitTitle": "Cache eviction policies"
  },
  {
    "id": "srs-quiz-cache-eviction-policies-c1",
    "type": "quiz",
    "prompt": "Which statement about eviction policies in real products is accurate?",
    "answer": "Caffeine uses an admission policy (Window TinyLFU), while Redis offers approximate LRU and LFU policies\n\nExplanation: The lesson is explicit that Window TinyLFU is Caffeine's design and Redis provides sampled approximations of LRU and LFU, not W-TinyLFU. LFU without decay can hold on to old popularity, which is why Redis's LFU includes a decay time.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-eviction-policies",
    "unitTitle": "Cache eviction policies"
  },
  {
    "id": "srs-quiz-cache-eviction-policies-c2",
    "type": "quiz",
    "prompt": "A 1 GB LRU cache holds 1M product records of 1 KB each, with a 92 percent hit ratio. A nightly job reads 2M distinct 1 KB order rows through the same cache, and product hit ratio collapses. Which change best keeps the hot set?",
    "answer": "Use a frequency-aware admission policy such as Window TinyLFU, so one-time rows only churn a small window\n\nExplanation: Export rows have a frequency of 1 and cannot beat hot products' counts, so W-TinyLFU confines them to its small admission window. A 2 GB cache still gets flushed by 2 GB of export rows under LRU, and TTL does not stop eviction of valid entries.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-eviction-policies",
    "unitTitle": "Cache eviction policies"
  },
  {
    "id": "srs-quiz-cache-eviction-policies-c3",
    "type": "quiz",
    "prompt": "A new Redis cache runs fine for weeks, then SET commands start failing with out-of-memory errors while GETs still work. Nobody changed the configuration. What is the most likely cause?",
    "answer": "maxmemory-policy was left at the default noeviction, so writes fail once memory is full\n\nExplanation: Redis's default policy, noeviction, returns errors on writes at maxmemory instead of freeing space, so you must set an explicit policy for a cache. Only the volatile-* policies are limited to keys with a TTL; allkeys-* policies can evict any key.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-eviction-policies",
    "unitTitle": "Cache eviction policies"
  },
  {
    "id": "srs-takeaway-ttl-expiration-and-cache-reapers-1",
    "type": "takeaway",
    "prompt": "In TTL expiration and cache reapers, what is a fundamental rule regarding: Lazy expiry and bounded background cleanup avoid one timer per key?",
    "answer": "Lazy expiry and bounded background cleanup avoid one timer per key.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "ttl-expiration-and-cache-reapers",
    "unitTitle": "TTL expiration and cache reapers"
  },
  {
    "id": "srs-takeaway-ttl-expiration-and-cache-reapers-2",
    "type": "takeaway",
    "prompt": "In TTL expiration and cache reapers, what is a fundamental rule regarding: Redis cleanup details vary by version and configuration?",
    "answer": "Redis cleanup details vary by version and configuration.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "ttl-expiration-and-cache-reapers",
    "unitTitle": "TTL expiration and cache reapers"
  },
  {
    "id": "srs-takeaway-ttl-expiration-and-cache-reapers-3",
    "type": "takeaway",
    "prompt": "In TTL expiration and cache reapers, what is a fundamental rule regarding: Jitter and soft versus hard TTLs make load and staleness explicit?",
    "answer": "Jitter and soft versus hard TTLs make load and staleness explicit.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "ttl-expiration-and-cache-reapers",
    "unitTitle": "TTL expiration and cache reapers"
  },
  {
    "id": "srs-quiz-ttl-expiration-and-cache-reapers-c1",
    "type": "quiz",
    "prompt": "Millions of keys in a cache passed their TTL an hour ago, yet memory usage has barely dropped. Reads for those keys correctly return misses. What explains this?",
    "answer": "Expiry is enforced lazily on access plus bounded background sampling, so untouched expired keys can stay in memory for a while\n\nExplanation: A TTL promises the value will not be returned after the deadline, not that memory is freed then; lazy checks and a CPU-bounded sampler reclaim it gradually. Correct misses on read show the TTLs are working, which rules out the idea that they were never applied.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "ttl-expiration-and-cache-reapers",
    "unitTitle": "TTL expiration and cache reapers"
  },
  {
    "id": "srs-quiz-ttl-expiration-and-cache-reapers-c2",
    "type": "quiz",
    "prompt": "3M sessions are written between 08:00 and 08:10 with a fixed 8-hour TTL. If you add uniform jitter of plus or minus 45 minutes, roughly what is the peak expiration rate at around 16:00?",
    "answer": "About 500 per second\n\nExplanation: Without jitter, 3M expirations land in 10 minutes, about 5,000 per second; jitter spreads them over roughly 100 minutes, about 500 per second. The total number of expirations is the same, but the rate, which is what hurts the backend, drops about tenfold.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "ttl-expiration-and-cache-reapers",
    "unitTitle": "TTL expiration and cache reapers"
  },
  {
    "id": "srs-quiz-ttl-expiration-and-cache-reapers-c3",
    "type": "quiz",
    "prompt": "Single-use coupons are stored in DynamoDB with a TTL attribute set to their expiry time. Customers occasionally redeem coupons that expired hours earlier. What is the right fix?",
    "answer": "Make every read and redemption check the expiry attribute, because TTL deletion runs in the background and can lag by days\n\nExplanation: DynamoDB TTL deletes expired items in the background, typically within a few days, so queries must filter on the expiry attribute themselves. Strongly consistent reads still return the item until it is actually deleted, and shrinking the TTL only guesses at an unbounded delay.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "ttl-expiration-and-cache-reapers",
    "unitTitle": "TTL expiration and cache reapers"
  },
  {
    "id": "srs-takeaway-cache-concurrency-control-1",
    "type": "takeaway",
    "prompt": "In Cache concurrency control, what is a fundamental rule regarding: Singleflight coalesces local work; cross-process refresh needs additional coordination?",
    "answer": "Singleflight coalesces local work; cross-process refresh needs additional coordination.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-concurrency-control",
    "unitTitle": "Cache concurrency control"
  },
  {
    "id": "srs-takeaway-cache-concurrency-control-2",
    "type": "takeaway",
    "prompt": "In Cache concurrency control, what is a fundamental rule regarding: Cache-aside delete can race with a stale reader that repopulates the key?",
    "answer": "Cache-aside delete can race with a stale reader that repopulates the key.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-concurrency-control",
    "unitTitle": "Cache concurrency control"
  },
  {
    "id": "srs-takeaway-cache-concurrency-control-3",
    "type": "takeaway",
    "prompt": "In Cache concurrency control, what is a fundamental rule regarding: Probabilistic early refresh reduces stampedes but does not guarantee residency?",
    "answer": "Probabilistic early refresh reduces stampedes but does not guarantee residency.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-concurrency-control",
    "unitTitle": "Cache concurrency control"
  },
  {
    "id": "srs-quiz-cache-concurrency-control-c1",
    "type": "quiz",
    "prompt": "A team wraps cache rebuilds in Go's singleflight and expects exactly one database load per expiring key. The service runs on 200 servers. What actually happens?",
    "answer": "Up to one load per server, so as many as 200 concurrent loads for the key\n\nExplanation: Singleflight coalesces duplicate work inside one process only; cross-process deduplication needs a lock, lease or refresh owner. It does not serve stale values on its own, which is stale-while-revalidate, a separate technique.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-concurrency-control",
    "unitTitle": "Cache concurrency control"
  },
  {
    "id": "srs-quiz-cache-concurrency-control-c2",
    "type": "quiz",
    "prompt": "A key receives 5,000 reads/s across 40 app servers and takes 300 ms to rebuild. With per-process singleflight but no distributed coordination, roughly how many concurrent database loads happen when it expires?",
    "answer": "About 40\n\nExplanation: Unprotected, the 300 ms window would see about 5,000 x 0.3 = 1,500 identical loads; singleflight collapses that to one per server, so about 40. Getting to one load cluster-wide needs a distributed lock or lease.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-concurrency-control",
    "unitTitle": "Cache concurrency control"
  },
  {
    "id": "srs-quiz-cache-concurrency-control-c3",
    "type": "quiz",
    "prompt": "A reader misses, loads v1 from the database, a writer updates the row to v2 and deletes the key, and then the reader sets v1. The cache now serves stale data indefinitely. Which mechanism prevents this?",
    "answer": "Memcache-style leases, where the delete invalidates the reader's token so its late set is rejected\n\nExplanation: A lease issued on the miss is invalidated by the writer's delete, so the late set of v1 fails. A rebuild lock stops the stampede but not this race, because the single lock holder can still be the reader holding v1.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-concurrency-control",
    "unitTitle": "Cache concurrency control"
  },
  {
    "id": "srs-takeaway-cache-availability-and-database-fallback-1",
    "type": "takeaway",
    "prompt": "In Cache availability and database fallback, what is a fundamental rule regarding: Bound database fallback by measured concurrency or rate capacity?",
    "answer": "Bound database fallback by measured concurrency or rate capacity.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-availability-and-database-fallback",
    "unitTitle": "Cache availability and database fallback"
  },
  {
    "id": "srs-takeaway-cache-availability-and-database-fallback-2",
    "type": "takeaway",
    "prompt": "In Cache availability and database fallback, what is a fundamental rule regarding: Hard TTL defines when stale data must no longer be served?",
    "answer": "Hard TTL defines when stale data must no longer be served.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-availability-and-database-fallback",
    "unitTitle": "Cache availability and database fallback"
  },
  {
    "id": "srs-takeaway-cache-availability-and-database-fallback-3",
    "type": "takeaway",
    "prompt": "In Cache availability and database fallback, what is a fundamental rule regarding: Cache redundancy adds failover, lag, recovery, and cost trade-offs?",
    "answer": "Cache redundancy adds failover, lag, recovery, and cost trade-offs.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-availability-and-database-fallback",
    "unitTitle": "Cache availability and database fallback"
  },
  {
    "id": "srs-quiz-cache-availability-and-database-fallback-c1",
    "type": "quiz",
    "prompt": "During a cache outage, app servers serve stale values from an in-process L1. In this design, what does the hard TTL represent?",
    "answer": "The product-defined limit beyond which stale data must no longer be served\n\nExplanation: The soft TTL starts a refresh, while the hard TTL is the maximum staleness the product permits; after it, the request must go to a limited fallback, degrade or be rejected. Triggering the refresh is the soft TTL's job, the most commonly confused of the two.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-availability-and-database-fallback",
    "unitTitle": "Cache availability and database fallback"
  },
  {
    "id": "srs-quiz-cache-availability-and-database-fallback-c2",
    "type": "quiz",
    "prompt": "A cache normally absorbs 99 percent of 80,000 reads/s. Load tests show the database's p99 degrades above 2,000 qps and it saturates at 3,000. There are 80 app instances. Which per-instance fallback limit fits the lesson's approach?",
    "answer": "20 qps per instance, about 1,600 qps total, below the 2,000 qps knee\n\nExplanation: The limiter should be sized from measured capacity with headroom, here below where latency degrades, so 80 x 20 = 1,600 qps. 40 per instance gives 3,200 qps, above saturation, and the lesson warns that long timeouts without a limit just tie up workers.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-availability-and-database-fallback",
    "unitTitle": "Cache availability and database fallback"
  },
  {
    "id": "srs-quiz-cache-availability-and-database-fallback-c3",
    "type": "quiz",
    "prompt": "After a 20-minute outage the cache cluster is healthy again but empty. An on-call engineer proposes removing the fallback limiter and sending 100 percent of traffic back immediately. What is the risk and the better approach?",
    "answer": "A second miss storm while the hit ratio climbs from zero; keep the limiter on, pre-warm top keys and shift traffic back in steps\n\nExplanation: An empty cache has a 0 percent hit ratio, so the database briefly sees the full outage load again; the lesson keeps the limiter on during warm-up, pre-warms hot keys and ramps traffic in steps. The cache does not refill instantly, because every miss must first be served by the capacity-limited database.",
    "category": "Caching Strategies & In-Memory State",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "cache-availability-and-database-fallback",
    "unitTitle": "Cache availability and database fallback"
  },
  {
    "id": "srs-takeaway-delegation-and-async-work-1",
    "type": "takeaway",
    "prompt": "In Delegation and async work, what is a fundamental rule regarding: Synchronous blocking architectures suffer from thread exhaustion, cascading failures, and tight temporal coupling?",
    "answer": "Synchronous blocking architectures suffer from thread exhaustion, cascading failures, and tight temporal coupling.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "delegation-and-async-work",
    "unitTitle": "Delegation and async work"
  },
  {
    "id": "srs-takeaway-delegation-and-async-work-2",
    "type": "takeaway",
    "prompt": "In Delegation and async work, what is a fundamental rule regarding: Asynchronous delegation returns HTTP 202 Accepted immediately, buffering work in durable messaging queues?",
    "answer": "Asynchronous delegation returns HTTP 202 Accepted immediately, buffering work in durable messaging queues.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "delegation-and-async-work",
    "unitTitle": "Delegation and async work"
  },
  {
    "id": "srs-takeaway-delegation-and-async-work-3",
    "type": "takeaway",
    "prompt": "In Delegation and async work, what is a fundamental rule regarding: Kernel event multiplexing (epoll, io_uring) lets a small number of event-loop threads watch very large numbers (100,000+) of mostly idle connections, though connection count alone says nothing about throughput?",
    "answer": "Kernel event multiplexing (epoll, io_uring) lets a small number of event-loop threads watch very large numbers (100,000+) of mostly idle connections, though connection count alone says nothing about throughput.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "delegation-and-async-work",
    "unitTitle": "Delegation and async work"
  },
  {
    "id": "srs-quiz-delegation-and-async-work-c1",
    "type": "quiz",
    "prompt": "A thread-per-request API makes 200 synchronous calls per second to a billing service and has a 200-thread worker pool. Billing latency jumps from 50 ms to 5 s. What happens?",
    "answer": "Concurrent billing calls rise from about 10 to about 1,000, exhausting the pool and stalling unrelated endpoints\n\nExplanation: In-flight calls equal rate times latency: 200 x 0.05 s is 10, but 200 x 5 s is 1,000, far more than 200 threads, so every endpoint sharing the pool stalls. A shared pool has no per-endpoint share, which is exactly how a slow dependency causes a cascading outage.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "delegation-and-async-work",
    "unitTitle": "Delegation and async work"
  },
  {
    "id": "srs-quiz-delegation-and-async-work-c2",
    "type": "quiz",
    "prompt": "In a checkout flow, which of these steps should stay inside the synchronous request rather than being delegated to a background worker?",
    "answer": "Authorizing the payment before confirming the order to the user\n\nExplanation: The user needs the payment authorization result to continue, so it stays synchronous. Email, thumbnails and CRM sync are not needed to show the next screen and often depend on slow or flaky third parties, which makes them ideal to delegate.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "delegation-and-async-work",
    "unitTitle": "Delegation and async work"
  },
  {
    "id": "srs-quiz-delegation-and-async-work-c3",
    "type": "quiz",
    "prompt": "A pool of queue workers sometimes processes a user's 'delete account' job before their earlier 'update profile' job, and the update recreates data that should be gone. What is the right fix?",
    "answer": "Route jobs by entity key so one consumer handles a given user's jobs in order\n\nExplanation: Ordering is not guaranteed across workers, so jobs that must stay ordered for one entity should be partitioned by that entity's key. More workers makes reordering more likely, and exactly-once delivery addresses duplicates, not order.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "delegation-and-async-work",
    "unitTitle": "Delegation and async work"
  },
  {
    "id": "srs-takeaway-task-queue-vs-event-stream-1",
    "type": "takeaway",
    "prompt": "In Task queue vs event stream, what is a fundamental rule regarding: Task queues coordinate ownership and acknowledgement of individual jobs; retention and deletion semantics vary by broker?",
    "answer": "Task queues coordinate ownership and acknowledgement of individual jobs; retention and deletion semantics vary by broker.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "task-queue-vs-event-stream",
    "unitTitle": "Task queue vs event stream"
  },
  {
    "id": "srs-takeaway-task-queue-vs-event-stream-2",
    "type": "takeaway",
    "prompt": "In Task queue vs event stream, what is a fundamental rule regarding: Event streams retain ordered partition records independently of a consumer group's committed progress, permitting replay within retention?",
    "answer": "Event streams retain ordered partition records independently of a consumer group's committed progress, permitting replay within retention.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "task-queue-vs-event-stream",
    "unitTitle": "Task queue vs event stream"
  },
  {
    "id": "srs-takeaway-task-queue-vs-event-stream-3",
    "type": "takeaway",
    "prompt": "In Task queue vs event stream, what is a fundamental rule regarding: Use RabbitMQ/SQS for discrete background jobs; use Kafka for event-driven pub/sub, audit logs, and streaming analytics?",
    "answer": "Use RabbitMQ/SQS for discrete background jobs; use Kafka for event-driven pub/sub, audit logs, and streaming analytics.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "task-queue-vs-event-stream",
    "unitTitle": "Task queue vs event stream"
  },
  {
    "id": "srs-quiz-task-queue-vs-event-stream-c1",
    "type": "quiz",
    "prompt": "You need to run 2,000 image-processing jobs per second, each taking between 50 ms and 30 s, consumed by a single service, with no need to replay history. Which design fits best?",
    "answer": "A task queue such as SQS or RabbitMQ with many workers each pulling the next job\n\nExplanation: Jobs are independent and uneven, so a queue lets any free worker take the next one, and a 30-second job only occupies one worker. On Kafka a slow record blocks everything behind it in its partition, and parallelism is capped at the partition count.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "task-queue-vs-event-stream",
    "unitTitle": "Task queue vs event stream"
  },
  {
    "id": "srs-quiz-task-queue-vs-event-stream-c2",
    "type": "quiz",
    "prompt": "To avoid head-of-line blocking, a Kafka consumer hands each record to an internal thread pool and moves on. What new problem must it now solve?",
    "answer": "Committing an offset marks all earlier records done, so it must wait for the slowest in-flight record or risk skipping it after a crash\n\nExplanation: An offset commit is a single position per partition, so committing past an unfinished record means a crash loses it, while not committing means reprocessing on restart. Kafka does allow multi-threaded processing; the difficulty is purely in offset bookkeeping.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "task-queue-vs-event-stream",
    "unitTitle": "Task queue vs event stream"
  },
  {
    "id": "srs-quiz-task-queue-vs-event-stream-c3",
    "type": "quiz",
    "prompt": "A Kafka topic has 24 partitions. You start 40 consumers in one consumer group. How many of them actively consume?",
    "answer": "24, one per partition, with 16 left idle\n\nExplanation: Within a group each partition is assigned to one consumer, so parallelism is capped at the partition count and the extra 16 sit idle. Consumers do not share a partition within a group, which is the key difference from a task queue where any number of workers can pull.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "task-queue-vs-event-stream",
    "unitTitle": "Task queue vs event stream"
  },
  {
    "id": "srs-takeaway-event-bus-for-product-events-1",
    "type": "takeaway",
    "prompt": "In Event bus for product events, what is a fundamental rule regarding: A transactional outbox commits domain state and the publication obligation together, removing the application dual-write race; CDC retries and consumer effects still require recovery and deduplication?",
    "answer": "A transactional outbox commits domain state and the publication obligation together, removing the application dual-write race; CDC retries and consumer effects still require recovery and deduplication.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "event-bus-for-product-events",
    "unitTitle": "Event bus for product events"
  },
  {
    "id": "srs-takeaway-event-bus-for-product-events-2",
    "type": "takeaway",
    "prompt": "In Event bus for product events, what is a fundamental rule regarding: Schema registries can enforce backward and forward compatibility for Avro or Protocol Buffers schemas, but only when producers register and validate schemas through the registry and a compatibility mode is configured for the subject?",
    "answer": "Schema registries can enforce backward and forward compatibility for Avro or Protocol Buffers schemas, but only when producers register and validate schemas through the registry and a compatibility mode is configured for the subject.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "event-bus-for-product-events",
    "unitTitle": "Event bus for product events"
  },
  {
    "id": "srs-takeaway-event-bus-for-product-events-3",
    "type": "takeaway",
    "prompt": "In Event bus for product events, what is a fundamental rule regarding: Use a documented event envelope with stable identity, type, producer, schema version, and occurrence time; CloudEvents is one optional standard?",
    "answer": "Use a documented event envelope with stable identity, type, producer, schema version, and occurrence time; CloudEvents is one optional standard.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "event-bus-for-product-events",
    "unitTitle": "Event bus for product events"
  },
  {
    "id": "srs-quiz-event-bus-for-product-events-c1",
    "type": "quiz",
    "prompt": "An order service commits the order row and then publishes OrderPlaced to Kafka in application code. The process crashes between the two steps. What is the outcome, and what is the fix?",
    "answer": "The order exists but the event is never sent; write an outbox row in the same transaction and relay it via CDC\n\nExplanation: The database has the order but downstream services never hear about it; the outbox puts the state change and the publish obligation in one local transaction. A producer's in-memory retries die with the process, so waiting for a retry after restart does not help.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "event-bus-for-product-events",
    "unitTitle": "Event bus for product events"
  },
  {
    "id": "srs-quiz-event-bus-for-product-events-c2",
    "type": "quiz",
    "prompt": "An Avro subject in the schema registry is set to backward compatibility, so new consumers must be able to read old events. Which change to OrderPlaced is allowed?",
    "answer": "Add a currency field with a default of USD\n\nExplanation: Under backward compatibility a new reader must fill in fields that old events lack, so an added field needs a default. A required field with no default leaves new readers nothing to use for old events, and renames and type changes break existing data.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "event-bus-for-product-events",
    "unitTitle": "Event bus for product events"
  },
  {
    "id": "srs-quiz-event-bus-for-product-events-c3",
    "type": "quiz",
    "prompt": "The Debezium connector that relays the outbox table stops over a weekend and nobody notices. What is the most serious thing that breaks first?",
    "answer": "Postgres keeps WAL for the stalled replication slot, which can fill the primary's disk\n\nExplanation: A replication slot makes Postgres retain WAL until the slot's consumer confirms it, so an idle slot grows WAL without bound and can take down the primary. The outbox rows themselves are safe in the table, which is why the lesson says to alert on slot lag.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "event-bus-for-product-events",
    "unitTitle": "Event bus for product events"
  },
  {
    "id": "srs-takeaway-queue-lag-1",
    "type": "takeaway",
    "prompt": "In Queue lag, what is a fundamental rule regarding: Consumer lag measures the delta between the broker high watermark and consumer committed offset?",
    "answer": "Consumer lag measures the delta between the broker high watermark and consumer committed offset.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "queue-lag",
    "unitTitle": "Queue lag"
  },
  {
    "id": "srs-takeaway-queue-lag-2",
    "type": "takeaway",
    "prompt": "In Queue lag, what is a fundamental rule regarding: Pull-based consumption naturally enforces backpressure by allowing workers to control their ingestion rate?",
    "answer": "Pull-based consumption naturally enforces backpressure by allowing workers to control their ingestion rate.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "queue-lag",
    "unitTitle": "Queue lag"
  },
  {
    "id": "srs-takeaway-queue-lag-3",
    "type": "takeaway",
    "prompt": "In Queue lag, what is a fundamental rule regarding: Automated scaling (via KEDA/Kubernetes HPA) dynamically adds worker pods when consumer lag breaches thresholds?",
    "answer": "Automated scaling (via KEDA/Kubernetes HPA) dynamically adds worker pods when consumer lag breaches thresholds.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "queue-lag",
    "unitTitle": "Queue lag"
  },
  {
    "id": "srs-quiz-queue-lag-c1",
    "type": "quiz",
    "prompt": "A topic receives 30,000 messages per second. Eight consumers each handle 5,000 per second. A deploy pauses consumption for 10 minutes. How long does the backlog take to drain once consumers resume?",
    "answer": "About 30 minutes\n\nExplanation: The backlog is 30,000 x 600 s = 18 million, and the net drain rate is 40,000 - 30,000 = 10,000 per second, so 1,800 s, or 30 minutes. 7.5 minutes divides by total capacity and forgets that new messages keep arriving.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "queue-lag",
    "unitTitle": "Queue lag"
  },
  {
    "id": "srs-quiz-queue-lag-c2",
    "type": "quiz",
    "prompt": "Which metric best tells you how delayed users are by a backed-up consumer, across topics with very different per-message costs?",
    "answer": "Age of the oldest unconsumed message\n\nExplanation: Time lag, the age of the oldest unconsumed message, is what users feel, and it is comparable across topics. Offset lag counts messages, and 100,000 messages can mean seconds for a fast consumer or hours for a slow one.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "queue-lag",
    "unitTitle": "Queue lag"
  },
  {
    "id": "srs-quiz-queue-lag-c3",
    "type": "quiz",
    "prompt": "A lag-based autoscaler scales a consumer group to 30 pods on a topic with 12 partitions. What is the effect?",
    "answer": "18 pods sit idle, throughput caps at 12 consumers, and adding partitions now would remap keys\n\nExplanation: Each partition goes to one consumer in a group, so pods beyond 12 do nothing; the lesson says to cap replicas at the partition count. Adding partitions later changes key-to-partition mapping, which is why partition count should be planned for peak up front.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "queue-lag",
    "unitTitle": "Queue lag"
  },
  {
    "id": "srs-takeaway-distributed-task-scheduler-1",
    "type": "takeaway",
    "prompt": "In Distributed task scheduler, what is a fundamental rule regarding: Redis sorted sets (ZSET) store delayed jobs using future Unix execution timestamps as the score?",
    "answer": "Redis sorted sets (ZSET) store delayed jobs using future Unix execution timestamps as the score.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-task-scheduler",
    "unitTitle": "Distributed task scheduler"
  },
  {
    "id": "srs-takeaway-distributed-task-scheduler-2",
    "type": "takeaway",
    "prompt": "In Distributed task scheduler, what is a fundamental rule regarding: Atomically moving due jobs into a leased set prevents competing claims without erasing the durable obligation?",
    "answer": "Atomically moving due jobs into a leased set prevents competing claims without erasing the durable obligation.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-task-scheduler",
    "unitTitle": "Distributed task scheduler"
  },
  {
    "id": "srs-takeaway-distributed-task-scheduler-3",
    "type": "takeaway",
    "prompt": "In Distributed task scheduler, what is a fundamental rule regarding: Hashed wheel timers efficiently manage many in-memory deadlines, but durable scheduling still needs persisted state and recovery?",
    "answer": "Hashed wheel timers efficiently manage many in-memory deadlines, but durable scheduling still needs persisted state and recovery.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-task-scheduler",
    "unitTitle": "Distributed task scheduler"
  },
  {
    "id": "srs-quiz-distributed-task-scheduler-c1",
    "type": "quiz",
    "prompt": "Why does the claim script move due job IDs from the scheduled set into a leased set, instead of removing them with ZREM and then publishing?",
    "answer": "A crash between removal and publish would lose the job, while an expired lease can be returned by a reaper\n\nExplanation: Removing the only durable record before the broker confirms the handoff opens a lost-job window; a lease keeps the obligation and a reaper recovers it. It is still at-least-once, because a lost broker acknowledgement can cause a duplicate publish.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-task-scheduler",
    "unitTitle": "Distributed task scheduler"
  },
  {
    "id": "srs-quiz-distributed-task-scheduler-c2",
    "type": "quiz",
    "prompt": "A product schedules 20 million jobs per day, each up to 14 days ahead. At about 100 bytes per sorted-set entry, roughly how much memory does the pending set need at its peak?",
    "answer": "About 28 GB\n\nExplanation: Up to 20 million x 14 = 280 million pending entries, times 100 bytes, is about 28 GB, which is why the lesson shards the set. 2.8 GB counts only about 2 days of jobs.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-task-scheduler",
    "unitTitle": "Distributed task scheduler"
  },
  {
    "id": "srs-quiz-distributed-task-scheduler-c3",
    "type": "quiz",
    "prompt": "A scheduler shard owner pauses for 30 seconds in garbage collection, a new owner takes over the shard, and then the old owner wakes up and keeps running its claim loop. What prevents double ownership?",
    "answer": "A lease epoch stored with each claim, so claims from a stale owner are rejected\n\nExplanation: Atomic scripts stop two claims from interleaving, but they do not stop a stale owner from running valid scripts; fencing with a stored epoch does. Local clocks make things worse, which is why the checklist says to take now() from the store.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "distributed-task-scheduler",
    "unitTitle": "Distributed task scheduler"
  },
  {
    "id": "srs-takeaway-postgres-skip-locked-work-queue-1",
    "type": "takeaway",
    "prompt": "In Postgres SKIP LOCKED work queue, what is a fundamental rule regarding: FOR UPDATE SKIP LOCKED lets many concurrent workers claim distinct jobs without blocking on each other's row locks; contention shifts to index scans over skipped rows and to vacuum pressure from dead tuples, and ordering is not strict FIFO?",
    "answer": "FOR UPDATE SKIP LOCKED lets many concurrent workers claim distinct jobs without blocking on each other's row locks; contention shifts to index scans over skipped rows and to vacuum pressure from dead tuples, and ordering is not strict FIFO.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "postgres-skip-locked-work-queue",
    "unitTitle": "Postgres SKIP LOCKED work queue"
  },
  {
    "id": "srs-takeaway-postgres-skip-locked-work-queue-2",
    "type": "takeaway",
    "prompt": "In Postgres SKIP LOCKED work queue, what is a fundamental rule regarding: Common Table Expressions (CTE) atomically lock and mark jobs as 'processing' in a single round-trip query?",
    "answer": "Common Table Expressions (CTE) atomically lock and mark jobs as 'processing' in a single round-trip query.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "postgres-skip-locked-work-queue",
    "unitTitle": "Postgres SKIP LOCKED work queue"
  },
  {
    "id": "srs-takeaway-postgres-skip-locked-work-queue-3",
    "type": "takeaway",
    "prompt": "In Postgres SKIP LOCKED work queue, what is a fundamental rule regarding: High-throughput SQL queues must tune autovacuum aggressively to prevent dead tuple table bloat?",
    "answer": "High-throughput SQL queues must tune autovacuum aggressively to prevent dead tuple table bloat.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "postgres-skip-locked-work-queue",
    "unitTitle": "Postgres SKIP LOCKED work queue"
  },
  {
    "id": "srs-quiz-postgres-skip-locked-work-queue-c1",
    "type": "quiz",
    "prompt": "Twenty workers each run SELECT * FROM jobs WHERE status = 'pending' LIMIT 1 FOR UPDATE at the same time. What happens?",
    "answer": "All target the same first row, so nineteen block on its lock and the workers run one at a time\n\nExplanation: Plain FOR UPDATE waits for the locked row, so every worker queues behind the first one and parallelism collapses. Spreading workers across rows is exactly what SKIP LOCKED adds; without it, Postgres waits rather than skipping.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "postgres-skip-locked-work-queue",
    "unitTitle": "Postgres SKIP LOCKED work queue"
  },
  {
    "id": "srs-quiz-postgres-skip-locked-work-queue-c2",
    "type": "quiz",
    "prompt": "A Postgres queue processes 1,200 jobs per second, and each processed job leaves at least one dead tuple. Roughly how many dead tuples must autovacuum clean per day?",
    "answer": "About 104 million\n\nExplanation: 1,200 x 86,400 seconds is about 104 million dead tuples per day, a steady load for autovacuum. 10 million is off by an order of magnitude, which is how queue tables end up under-vacuumed.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "postgres-skip-locked-work-queue",
    "unitTitle": "Postgres SKIP LOCKED work queue"
  },
  {
    "id": "srs-quiz-postgres-skip-locked-work-queue-c3",
    "type": "quiz",
    "prompt": "An analyst leaves a session idle in transaction for six hours on the primary that also hosts a SKIP LOCKED job queue. What degrades?",
    "answer": "Vacuum cannot remove dead job tuples newer than the old transaction, so the queue table bloats and claims slow down\n\nExplanation: Vacuum cannot remove tuples that an open transaction might still see, so dead job rows pile up and every claim scans more of them. SKIP LOCKED is still non-blocking; the damage is bloat, which is why the lesson recommends idle_in_transaction_session_timeout.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "postgres-skip-locked-work-queue",
    "unitTitle": "Postgres SKIP LOCKED work queue"
  },
  {
    "id": "srs-takeaway-dag-workflow-orchestration-1",
    "type": "takeaway",
    "prompt": "In DAG workflow orchestration, what is a fundamental rule regarding: DAG engines model complex multi-step workflows with strict dependency ordering and automatic retries?",
    "answer": "DAG engines model complex multi-step workflows with strict dependency ordering and automatic retries.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "dag-workflow-orchestration",
    "unitTitle": "DAG workflow orchestration"
  },
  {
    "id": "srs-takeaway-dag-workflow-orchestration-2",
    "type": "takeaway",
    "prompt": "In DAG workflow orchestration, what is a fundamental rule regarding: Temporal uses event sourcing to recover state by deterministically replaying history logs without re-executing completed tasks?",
    "answer": "Temporal uses event sourcing to recover state by deterministically replaying history logs without re-executing completed tasks.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "dag-workflow-orchestration",
    "unitTitle": "DAG workflow orchestration"
  },
  {
    "id": "srs-takeaway-dag-workflow-orchestration-3",
    "type": "takeaway",
    "prompt": "In DAG workflow orchestration, what is a fundamental rule regarding: The Saga pattern executes compensating transactions in reverse order when any intermediate workflow step fails?",
    "answer": "The Saga pattern executes compensating transactions in reverse order when any intermediate workflow step fails.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "dag-workflow-orchestration",
    "unitTitle": "DAG workflow orchestration"
  },
  {
    "id": "srs-quiz-dag-workflow-orchestration-c1",
    "type": "quiz",
    "prompt": "Why must Temporal workflow code not call the system clock directly, for example to decide whether a deadline has passed?",
    "answer": "On replay the clock returns a different value, so the code can take a different branch than the recorded history\n\nExplanation: Recovery replays the workflow code against the recorded history, so every decision must come out the same on replay; a fresh clock read can differ. The fix is the SDK's deterministic helpers, such as workflow.Now, which return recorded values.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "dag-workflow-orchestration",
    "unitTitle": "DAG workflow orchestration"
  },
  {
    "id": "srs-quiz-dag-workflow-orchestration-c2",
    "type": "quiz",
    "prompt": "The order workflow's worker crashes right after ChargeCard completed and was recorded with txn t_55. A new worker picks up the workflow. What happens?",
    "answer": "Replay returns t_55 from history without charging again, and execution continues at ReserveInventory\n\nExplanation: During replay completed activities are not re-executed; their recorded results come back from the history. Idempotency keys are still good practice for activities retried after timeouts, but replay itself does not re-run ChargeCard.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "dag-workflow-orchestration",
    "unitTitle": "DAG workflow orchestration"
  },
  {
    "id": "srs-quiz-dag-workflow-orchestration-c3",
    "type": "quiz",
    "prompt": "You deploy new workflow code that inserts a fraud-check activity before ReserveInventory while 10,000 order workflows are in flight. What happens without extra care?",
    "answer": "In-flight workflows replay against the new code, no longer match their history, and fail with nondeterminism errors\n\nExplanation: Replay expects the same sequence of commands the history recorded, so an inserted step makes old executions diverge. Temporal does not version code for you; you guard changes with its patching or versioning APIs or run old and new workers side by side.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "dag-workflow-orchestration",
    "unitTitle": "DAG workflow orchestration"
  },
  {
    "id": "srs-takeaway-rule-engine-trigger-framework-1",
    "type": "takeaway",
    "prompt": "In Rule engine and trigger framework, what is a fundamental rule regarding: Rule engines evaluate millions of incoming events against dynamic criteria without modifying application code?",
    "answer": "Rule engines evaluate millions of incoming events against dynamic criteria without modifying application code.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "rule-engine-trigger-framework",
    "unitTitle": "Rule engine and trigger framework"
  },
  {
    "id": "srs-takeaway-rule-engine-trigger-framework-2",
    "type": "takeaway",
    "prompt": "In Rule engine and trigger framework, what is a fundamental rule regarding: The Rete algorithm shares common condition evaluations across rules, eliminating redundant CPU computation?",
    "answer": "The Rete algorithm shares common condition evaluations across rules, eliminating redundant CPU computation.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "rule-engine-trigger-framework",
    "unitTitle": "Rule engine and trigger framework"
  },
  {
    "id": "srs-takeaway-rule-engine-trigger-framework-3",
    "type": "takeaway",
    "prompt": "In Rule engine and trigger framework, what is a fundamental rule regarding: CEL defines a bounded, non-Turing-complete expression language; implementations may interpret, compile, or otherwise optimize checked expressions?",
    "answer": "CEL defines a bounded, non-Turing-complete expression language; implementations may interpret, compile, or otherwise optimize checked expressions.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "rule-engine-trigger-framework",
    "unitTitle": "Rule engine and trigger framework"
  },
  {
    "id": "srs-quiz-rule-engine-trigger-framework-c1",
    "type": "quiz",
    "prompt": "In the Rete algorithm, what do beta memories contribute?",
    "answer": "They keep partial matches, so a changed fact re-evaluates only the affected parts of the network\n\nExplanation: Beta nodes join facts, and their memories cache partial joins so a new or changed fact only updates what it touches (incremental matching). Bytecode compilation is a separate optimisation some engines use, not what Rete's memories do.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "rule-engine-trigger-framework",
    "unitTitle": "Rule engine and trigger framework"
  },
  {
    "id": "srs-quiz-rule-engine-trigger-framework-c2",
    "type": "quiz",
    "prompt": "A platform has 10,000 rules, 30,000 transactions per second, and each rule evaluation costs 1 microsecond. Indexing by a discriminating attribute leaves about 25 candidate rules per event. What is the CPU time per event, naive versus indexed?",
    "answer": "About 10 ms naive versus about 25 microseconds indexed\n\nExplanation: Naive evaluation checks all 10,000 rules, 10,000 microseconds or 10 ms per event; indexed evaluation checks 25, about 25 microseconds. The 300 ms figure multiplies by the event rate, which gives total evaluations per second rather than time per event.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "rule-engine-trigger-framework",
    "unitTitle": "Rule engine and trigger framework"
  },
  {
    "id": "srs-quiz-rule-engine-trigger-framework-c3",
    "type": "quiz",
    "prompt": "The profile store that supplies home_country is down, and several fraud rules depend on it. What does the lesson say must already have been decided?",
    "answer": "Whether each rule fails open (allow, accepting fraud risk) or fails closed (block, accepting lost sales)\n\nExplanation: An enrichment outage forces a choice between letting transactions through unchecked or blocking good customers, and that choice should be made per rule before the incident. Assuming missing data quietly evaluates to false just means failing open by accident.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "rule-engine-trigger-framework",
    "unitTitle": "Rule engine and trigger framework"
  },
  {
    "id": "srs-takeaway-fanout-patterns-1",
    "type": "takeaway",
    "prompt": "In Fanout patterns, what is a fundamental rule regarding: Fanout-on-Write delivers fast single-range-read feeds but collapses on high-follower celebrity posts?",
    "answer": "Fanout-on-Write delivers fast single-range-read feeds but collapses on high-follower celebrity posts.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "fanout-patterns",
    "unitTitle": "Fanout patterns"
  },
  {
    "id": "srs-takeaway-fanout-patterns-2",
    "type": "takeaway",
    "prompt": "In Fanout patterns, what is a fundamental rule regarding: Fanout-on-Read eliminates write amplification but incurs heavy multi-query latency on user feed loads?",
    "answer": "Fanout-on-Read eliminates write amplification but incurs heavy multi-query latency on user feed loads.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "fanout-patterns",
    "unitTitle": "Fanout patterns"
  },
  {
    "id": "srs-takeaway-fanout-patterns-3",
    "type": "takeaway",
    "prompt": "In Fanout patterns, what is a fundamental rule regarding: Modern platforms use a hybrid model?",
    "answer": "Modern platforms use a hybrid model: push for normal users, dynamic pull-and-merge for celebrities.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "fanout-patterns",
    "unitTitle": "Fanout patterns"
  },
  {
    "id": "srs-quiz-fanout-patterns-c1",
    "type": "quiz",
    "prompt": "In the hybrid fanout model, what happens when a user opens their home feed?",
    "answer": "It reads the user's precomputed inbox and merges in recent posts from any followed celebrities\n\nExplanation: Normal authors are pushed into inboxes at write time, while celebrities skip fanout and are merged at read time. Pulling from every followee is the pure pull model, which the lesson shows is far too expensive for feed reads.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "fanout-patterns",
    "unitTitle": "Fanout patterns"
  },
  {
    "id": "srs-quiz-fanout-patterns-c2",
    "type": "quiz",
    "prompt": "Under pure fanout-on-write, an account with 20 million followers posts once. The fanout pipeline can insert 500,000 inbox entries per second in total. How long does this single post take to fan out?",
    "answer": "About 40 seconds\n\nExplanation: 20 million / 500,000 is 40 seconds of the whole pipeline for one post, during which other authors' fanout is delayed. That per-post cost, repeated for each celebrity post, is why hybrids stop pushing above a follower threshold.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "fanout-patterns",
    "unitTitle": "Fanout patterns"
  },
  {
    "id": "srs-quiz-fanout-patterns-c3",
    "type": "quiz",
    "prompt": "A user deletes a post whose ID was already pushed into 3 million follower inboxes. How should the system make sure followers stop seeing it?",
    "answer": "Filter deleted and blocked IDs at read time, since inboxes may still hold them and the post is stored once\n\nExplanation: Inboxes hold IDs, so a read-time filter against the single stored post handles deletes and blocks immediately. Synchronously scrubbing millions of inboxes makes the delete as slow as a celebrity fanout, and until it finishes the post stays visible.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "fanout-patterns",
    "unitTitle": "Fanout patterns"
  },
  {
    "id": "srs-takeaway-flash-sale-inventory-locking-1",
    "type": "takeaway",
    "prompt": "In Flash sale inventory locking, what is a fundamental rule regarding: Relational database row-level locking (FOR UPDATE) collapses under flash sales due to thread lock convoys?",
    "answer": "Relational database row-level locking (FOR UPDATE) collapses under flash sales due to thread lock convoys.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "flash-sale-inventory-locking",
    "unitTitle": "Flash sale inventory locking"
  },
  {
    "id": "srs-takeaway-flash-sale-inventory-locking-2",
    "type": "takeaway",
    "prompt": "In Flash sale inventory locking, what is a fundamental rule regarding: In-memory Redis atomic Lua scripts decrement inventory in sub-milliseconds without database contention, but Redis replication is asynchronous, so a failover can lose decrements and oversell unless counts are reconciled against the database?",
    "answer": "In-memory Redis atomic Lua scripts decrement inventory in sub-milliseconds without database contention, but Redis replication is asynchronous, so a failover can lose decrements and oversell unless counts are reconciled against the database.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "flash-sale-inventory-locking",
    "unitTitle": "Flash sale inventory locking"
  },
  {
    "id": "srs-takeaway-flash-sale-inventory-locking-3",
    "type": "takeaway",
    "prompt": "In Flash sale inventory locking, what is a fundamental rule regarding: Successful reservations are queued asynchronously to Kafka for batched database persistence with delayed release timers?",
    "answer": "Successful reservations are queued asynchronously to Kafka for batched database persistence with delayed release timers.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "flash-sale-inventory-locking",
    "unitTitle": "Flash sale inventory locking"
  },
  {
    "id": "srs-quiz-flash-sale-inventory-locking-c1",
    "type": "quiz",
    "prompt": "Why does running check-stock-then-decrement as a Redis Lua script prevent overselling, when the same two steps in application code do not?",
    "answer": "Redis runs the script atomically on its single-threaded loop, so no other command runs between the read and the decrement\n\nExplanation: No other command can execute between the read and the decrement inside the script, so two buyers cannot both see stock = 1. Replication is still asynchronous, which is exactly why a failover can lose decrements.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "flash-sale-inventory-locking",
    "unitTitle": "Flash sale inventory locking"
  },
  {
    "id": "srs-quiz-flash-sale-inventory-locking-c2",
    "type": "quiz",
    "prompt": "A sale has 2,000 units. The waiting room admits 8,000 users per second to the reservation step, and 20% of reservations are abandoned within their 10-minute hold. How fast do units sell out, and how many return at expiry?",
    "answer": "Reserved in about 0.25 seconds; about 400 units return at hold expiry\n\nExplanation: 2,000 units / 8,000 attempts per second is 0.25 seconds, and 20% of 2,000 is 400 units back in stock. 1,600 is the number of completed purchases, not returned units.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "flash-sale-inventory-locking",
    "unitTitle": "Flash sale inventory locking"
  },
  {
    "id": "srs-quiz-flash-sale-inventory-locking-c3",
    "type": "quiz",
    "prompt": "Inventory is decremented in Redis with a Lua script and persisted to Postgres asynchronously. The Redis primary fails over before replicating its last few decrements. What is the risk, and the mitigation?",
    "answer": "The new primary may have too high a count and oversell; reconcile against the database and hold back a small buffer\n\nExplanation: Redis replication is asynchronous, so lost decrements leave the new primary thinking more stock remains, and it can sell units that are gone. Atomicity is per node; it says nothing about replication, so the lesson reconciles with the database and keeps a buffer or a refund policy.",
    "category": "Asynchronous Workflows & Partitioned Logs",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "flash-sale-inventory-locking",
    "unitTitle": "Flash sale inventory locking"
  },
  {
    "id": "srs-takeaway-counting-at-scale-1",
    "type": "takeaway",
    "prompt": "In Counting at scale, what is a fundamental rule regarding: Synchronous database increments cause lock contention at scale?",
    "answer": "Synchronous database increments cause lock contention at scale.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "counting-at-scale",
    "unitTitle": "Counting at scale"
  },
  {
    "id": "srs-takeaway-counting-at-scale-2",
    "type": "takeaway",
    "prompt": "In Counting at scale, what is a fundamental rule regarding: Decouple writes using message queues (Kafka) and background aggregation?",
    "answer": "Decouple writes using message queues (Kafka) and background aggregation.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "counting-at-scale",
    "unitTitle": "Counting at scale"
  },
  {
    "id": "srs-takeaway-counting-at-scale-3",
    "type": "takeaway",
    "prompt": "In Counting at scale, what is a fundamental rule regarding: Handling duplicate events is critical for accurate counting?",
    "answer": "Handling duplicate events is critical for accurate counting.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "counting-at-scale",
    "unitTitle": "Counting at scale"
  },
  {
    "id": "srs-quiz-counting-at-scale-c1",
    "type": "quiz",
    "prompt": "A consumer reads like events from Kafka, increments the post's counter in the database, then commits its Kafka offset. Why can the displayed count end up higher than the number of likes?",
    "answer": "If the consumer crashes after the increment but before the offset commit, the retry re-reads and re-applies the same events\n\nExplanation: Delivery is at least once, so the gap between applying the aggregate and recording the input position is exactly where retries double count. Replication does not deliver extra copies to consumers, and row locks serialise increments rather than duplicating them.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "counting-at-scale",
    "unitTitle": "Counting at scale"
  },
  {
    "id": "srs-quiz-counting-at-scale-c2",
    "type": "quiz",
    "prompt": "A viral post gets 80,000 likes per second. Events are salted across 48 Kafka partitions, and each partition's consumer aggregates in memory for 1 second before writing one combined update. How many database writes per second does the post's counter receive?",
    "answer": "About 48, one per partition per second\n\nExplanation: Each partition emits one combined delta per second, so the row sees about 48 writes per second regardless of like volume. 1,670 is the per-partition event rate, not the write rate, and partitions flush independently rather than as one shared window.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "counting-at-scale",
    "unitTitle": "Counting at scale"
  },
  {
    "id": "srs-quiz-counting-at-scale-c3",
    "type": "quiz",
    "prompt": "The partition-7 consumer has aggregated post 42: +48,210 up to offset 1,204,500. Which write protocol makes a crash at any point safe from double counting?",
    "answer": "In one database transaction, add 48,210 and record partition 7 processed through offset 1,204,500, then resume from the stored offset\n\nExplanation: Making the increment and the durable offset receipt atomic means a crash leaves either both or neither, so a restart either replays or skips cleanly. Committing the offset first avoids double counting but silently loses the batch, and a separate cache check has its own crash race.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "counting-at-scale",
    "unitTitle": "Counting at scale"
  },
  {
    "id": "srs-takeaway-view-counting-at-scale-1",
    "type": "takeaway",
    "prompt": "In View counting at scale, what is a fundamental rule regarding: Use Lambda Architecture?",
    "answer": "Use Lambda Architecture: separate paths for fast/approximate and slow/accurate counting.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "view-counting-at-scale",
    "unitTitle": "View counting at scale"
  },
  {
    "id": "srs-takeaway-view-counting-at-scale-2",
    "type": "takeaway",
    "prompt": "In View counting at scale, what is a fundamental rule regarding: Fraud detection must happen offline on raw logs?",
    "answer": "Fraud detection must happen offline on raw logs.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "view-counting-at-scale",
    "unitTitle": "View counting at scale"
  },
  {
    "id": "srs-takeaway-view-counting-at-scale-3",
    "type": "takeaway",
    "prompt": "In View counting at scale, what is a fundamental rule regarding: Event heartbeats are better than single 'play' events for verifying true engagement?",
    "answer": "Event heartbeats are better than single 'play' events for verifying true engagement.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "view-counting-at-scale",
    "unitTitle": "View counting at scale"
  },
  {
    "id": "srs-quiz-view-counting-at-scale-c1",
    "type": "quiz",
    "prompt": "In a Lambda-style view counter, which path should decide the counts used for creator payouts and official totals?",
    "answer": "The batch path, because it applies full-history dedup, ML fraud filtering and business rules\n\nExplanation: The speed layer does short-window, best-effort dedup and simple fraud rules, so it is for display; monetisation and official counts come from the audited batch path. Freshness is not the same as correctness, and client-reported numbers are the easiest to fake.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "view-counting-at-scale",
    "unitTitle": "View counting at scale"
  },
  {
    "id": "srs-quiz-view-counting-at-scale-c2",
    "type": "quiz",
    "prompt": "A platform has 500 million views per day. Players send a heartbeat every 10 seconds of watch time, the average view lasts 4 minutes, and each event is about 200 bytes. How much raw heartbeat log is produced per day?",
    "answer": "About 2.4 TB\n\nExplanation: 4 minutes at one heartbeat per 10 seconds is 24 events per view, so 12 billion events x 200 bytes is about 2.4 TB. The 100 GB answer counts one event per view, which ignores that heartbeats dominate volume.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "view-counting-at-scale",
    "unitTitle": "View counting at scale"
  },
  {
    "id": "srs-quiz-view-counting-at-scale-c3",
    "type": "quiz",
    "prompt": "After a deploy, the streaming view job restarts from a checkpoint 20 minutes old, and several videos' displayed counts jump well above reality. The sink runs INCRBY with each window's count. What change prevents this?",
    "answer": "Write each window's result keyed by video and window, overwriting rather than incrementing, so a replay rewrites the same values\n\nExplanation: An idempotent sink that overwrites per-window results makes replays harmless, which is the fix the lesson names. More frequent checkpoints shrink the window but still double count, and restarting from the latest offset trades duplicates for lost events.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "view-counting-at-scale",
    "unitTitle": "View counting at scale"
  },
  {
    "id": "srs-takeaway-impression-counting-system-design-1",
    "type": "takeaway",
    "prompt": "In Impression counting, what is a fundamental rule regarding: Impression counting directly impacts revenue, requiring high durability?",
    "answer": "Impression counting directly impacts revenue, requiring high durability.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "impression-counting-system-design",
    "unitTitle": "Impression counting"
  },
  {
    "id": "srs-takeaway-impression-counting-system-design-2",
    "type": "takeaway",
    "prompt": "In Impression counting, what is a fundamental rule regarding: Systems must handle late-arriving events using Event Time logic?",
    "answer": "Systems must handle late-arriving events using Event Time logic.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "impression-counting-system-design",
    "unitTitle": "Impression counting"
  },
  {
    "id": "srs-takeaway-impression-counting-system-design-3",
    "type": "takeaway",
    "prompt": "In Impression counting, what is a fundamental rule regarding: Real-time OLAP databases (Druid, Pinot, ClickHouse) are ideal for querying ad metrics?",
    "answer": "Real-time OLAP databases (Druid, Pinot, ClickHouse) are ideal for querying ad metrics.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "impression-counting-system-design",
    "unitTitle": "Impression counting"
  },
  {
    "id": "srs-quiz-impression-counting-system-design-c1",
    "type": "quiz",
    "prompt": "An ad is shown on a phone at 14:00, but the device is offline and the impression event reaches the servers at 16:00. In which hourly bucket should it be counted for billing?",
    "answer": "14:00, because billing aggregates by event time, with late data updating the historical bucket\n\nExplanation: Event-time processing puts the impression where it happened, and watermarks plus allowed lateness let the 14:00 bucket be corrected. Bucketing by arrival time is the named trap, and dropping it outright loses billable revenue.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "impression-counting-system-design",
    "unitTitle": "Impression counting"
  },
  {
    "id": "srs-quiz-impression-counting-system-design-c2",
    "type": "quiz",
    "prompt": "A platform serves 4 billion impressions per day at a 3 dollar CPM. A retry bug double counts 0.5 percent of impressions. How much wrongful billing does that produce per day?",
    "answer": "About 60,000 dollars\n\nExplanation: Revenue is 4 billion divided by 1,000, that is 4 million units of a thousand impressions, x 3 dollars = 12 million dollars per day, and 0.5 percent of that is 60,000 dollars. The 600,000 dollars option divides by 100 instead of 1,000, forgetting that CPM is priced per thousand impressions.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "impression-counting-system-design",
    "unitTitle": "Impression counting"
  },
  {
    "id": "srs-quiz-impression-counting-system-design-c3",
    "type": "quiz",
    "prompt": "The Flink job dedups by impression ID with a 1-hour state TTL, but the pipeline accepts late events for up to 24 hours. A mobile SDK retries a batch 3 hours after the original was ingested. What happens, and what is the fix?",
    "answer": "The retry is counted again because its ID has expired from state; the TTL should be a little longer than the allowed lateness\n\nExplanation: Dedup only works while the ID is still in state, so a TTL shorter than the lateness window lets accepted late retries double count; the lesson sizes the TTL just above allowed lateness, which is why state lives in RocksDB. Kafka's idempotent producer only removes broker-level duplicates from one producer session, not SDK re-sends hours later.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "impression-counting-system-design",
    "unitTitle": "Impression counting"
  },
  {
    "id": "srs-takeaway-hyperloglog-cardinality-estimation-1",
    "type": "takeaway",
    "prompt": "In HyperLogLog cardinality estimation, what is a fundamental rule regarding: Exact cardinality counting requires linear memory (O(N))?",
    "answer": "Exact cardinality counting requires linear memory (O(N)).",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hyperloglog-cardinality-estimation",
    "unitTitle": "HyperLogLog cardinality estimation"
  },
  {
    "id": "srs-takeaway-hyperloglog-cardinality-estimation-2",
    "type": "takeaway",
    "prompt": "In HyperLogLog cardinality estimation, what is a fundamental rule regarding: HyperLogLog uses a fixed register array whose size is selected from the required error; Redis's dense representation is about 12 KB?",
    "answer": "HyperLogLog uses a fixed register array whose size is selected from the required error; Redis's dense representation is about 12 KB.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hyperloglog-cardinality-estimation",
    "unitTitle": "HyperLogLog cardinality estimation"
  },
  {
    "id": "srs-takeaway-hyperloglog-cardinality-estimation-3",
    "type": "takeaway",
    "prompt": "In HyperLogLog cardinality estimation, what is a fundamental rule regarding: Use HLL when a small error rate (~1%) is acceptable for unique counting?",
    "answer": "Use HLL when a small error rate (~1%) is acceptable for unique counting.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hyperloglog-cardinality-estimation",
    "unitTitle": "HyperLogLog cardinality estimation"
  },
  {
    "id": "srs-quiz-hyperloglog-cardinality-estimation-c1",
    "type": "quiz",
    "prompt": "The same user ID is added to a HyperLogLog one million times. Why does the estimate not grow?",
    "answer": "The ID always hashes to the same register and rank, and the register keeps a maximum, so repeats change nothing\n\nExplanation: Hashing is deterministic, so re-adding an item recomputes the same register and rank, and max(r, r) equals r. HLL keeps no record of IDs at all, so no Bloom-filter-style membership check exists.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hyperloglog-cardinality-estimation",
    "unitTitle": "HyperLogLog cardinality estimation"
  },
  {
    "id": "srs-quiz-hyperloglog-cardinality-estimation-c2",
    "type": "quiz",
    "prompt": "A product requires a standard error of at most 1 percent for daily uniques, and memory should be as small as possible. Using standard error 1.04 divided by the square root of m, which precision do you choose?",
    "answer": "p = 14, 16,384 registers, about 12 KB\n\nExplanation: p = 14 gives 1.04 divided by 128, about 0.81 percent, the smallest setting under 1 percent; p = 12 gives 1.63 percent. p = 16 also meets the target but at four times the memory for accuracy nobody asked for.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hyperloglog-cardinality-estimation",
    "unitTitle": "HyperLogLog cardinality estimation"
  },
  {
    "id": "srs-quiz-hyperloglog-cardinality-estimation-c3",
    "type": "quiz",
    "prompt": "Pages A and B each have about 50 million monthly uniques in p = 14 HLLs, and only about 100,000 users visited both. A PM computes |A| + |B| minus |A union B| from the sketches. What is wrong?",
    "answer": "Each estimate carries an error of hundreds of thousands, so the difference can be larger than the true answer; use Theta sketches for intersections\n\nExplanation: At 0.81 percent error, each 50 to 100 million estimate is off by roughly 400,000 to 800,000, which swamps a 100,000 intersection; Theta sketches support set operations directly. HLL union itself is fine: it is register-wise max.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hyperloglog-cardinality-estimation",
    "unitTitle": "HyperLogLog cardinality estimation"
  },
  {
    "id": "srs-takeaway-mergeable-sketches-for-analytics-1",
    "type": "takeaway",
    "prompt": "In Mergeable sketches for analytics, what is a fundamental rule regarding: Sketches allow you to compress data locally before aggregating globally?",
    "answer": "Sketches allow you to compress data locally before aggregating globally.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "mergeable-sketches-for-analytics",
    "unitTitle": "Mergeable sketches for analytics"
  },
  {
    "id": "srs-takeaway-mergeable-sketches-for-analytics-2",
    "type": "takeaway",
    "prompt": "In Mergeable sketches for analytics, what is a fundamental rule regarding: HLL union avoids double-counting the same hashed identity, but additive sketches and repeated partition contributions still need receipt or deduplication protocols?",
    "answer": "HLL union avoids double-counting the same hashed identity, but additive sketches and repeated partition contributions still need receipt or deduplication protocols.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "mergeable-sketches-for-analytics",
    "unitTitle": "Mergeable sketches for analytics"
  },
  {
    "id": "srs-takeaway-mergeable-sketches-for-analytics-3",
    "type": "takeaway",
    "prompt": "In Mergeable sketches for analytics, what is a fundamental rule regarding: Time-based rollups of sketches dramatically speed up analytical queries?",
    "answer": "Time-based rollups of sketches dramatically speed up analytical queries.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "mergeable-sketches-for-analytics",
    "unitTitle": "Mergeable sketches for analytics"
  },
  {
    "id": "srs-quiz-mergeable-sketches-for-analytics-c1",
    "type": "quiz",
    "prompt": "Server A reports 10,000 unique IPs and server B reports 15,000. What can you say about the total unique IPs, and how do you get it without shipping raw IPs?",
    "answer": "It lies between 15,000 and 25,000; merging the servers' HLL sketches estimates the union\n\nExplanation: Users can hit both servers, so the union is at least the larger count and at most the sum; merging compatible HLL sketches by register-wise max estimates the union with the usual error. Assuming disjointness is exactly the double counting that mergeable sketches avoid.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "mergeable-sketches-for-analytics",
    "unitTitle": "Mergeable sketches for analytics"
  },
  {
    "id": "srs-quiz-mergeable-sketches-for-analytics-c2",
    "type": "quiz",
    "prompt": "A site stores one 12 KB HLL sketch per hour per country for 50 countries. How much sketch data is merged for weekly uniques across all countries, and how much sketch storage is added per day?",
    "answer": "About 100 MB merged for the week, about 14 MB stored per day\n\nExplanation: A week is 168 hours x 50 countries = 8,400 sketches x 12 KB, about 100 MB; a day is 24 x 50 x 12 KB, about 14 MB. The 600 KB figure is only one day for one country or one hour across all countries, not the stated totals.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "mergeable-sketches-for-analytics",
    "unitTitle": "Mergeable sketches for analytics"
  },
  {
    "id": "srs-quiz-mergeable-sketches-for-analytics-c3",
    "type": "quiz",
    "prompt": "Two regions each built a Count-Min sketch with width 2,719 and depth 5, but each used its own random hash seeds. A global job adds them element-wise. What is the result?",
    "answer": "A meaningless sketch, because the same item maps to different cells in each region, so the summed cells no longer correspond to any item\n\nExplanation: Count-Min merges by adding counters only when width, depth and hash functions all match; with different seeds, an item's cells differ by region, so querying the sum reads unrelated mass. Matching dimensions alone look sufficient, which makes this a silent failure.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "mergeable-sketches-for-analytics",
    "unitTitle": "Mergeable sketches for analytics"
  },
  {
    "id": "srs-takeaway-bucketed-time-window-aggregation-1",
    "type": "takeaway",
    "prompt": "In Bucketed time-window aggregation, what is a fundamental rule regarding: Tumbling windows do not overlap; sliding windows overlap?",
    "answer": "Tumbling windows do not overlap; sliding windows overlap.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "bucketed-time-window-aggregation",
    "unitTitle": "Bucketed time-window aggregation"
  },
  {
    "id": "srs-takeaway-bucketed-time-window-aggregation-2",
    "type": "takeaway",
    "prompt": "In Bucketed time-window aggregation, what is a fundamental rule regarding: Rounded timestamps make excellent cache keys for simple bucketed counting?",
    "answer": "Rounded timestamps make excellent cache keys for simple bucketed counting.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "bucketed-time-window-aggregation",
    "unitTitle": "Bucketed time-window aggregation"
  },
  {
    "id": "srs-takeaway-bucketed-time-window-aggregation-3",
    "type": "takeaway",
    "prompt": "In Bucketed time-window aggregation, what is a fundamental rule regarding: Stream processors are needed for complex windowing and handling late events?",
    "answer": "Stream processors are needed for complex windowing and handling late events.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "bucketed-time-window-aggregation",
    "unitTitle": "Bucketed time-window aggregation"
  },
  {
    "id": "srs-quiz-bucketed-time-window-aggregation-c1",
    "type": "quiz",
    "prompt": "An event-time bucket for 10:00 to 10:05 has published 90 views. At 10:08 a mobile event with occurrence time 10:04 arrives. What determines whether the bucket becomes 91?",
    "answer": "The watermark and allowed-lateness policy, which decide whether to update, emit a correction or route the event to a late-data path\n\nExplanation: Crossing the wall-clock boundary does not prove all events have arrived; the watermark and lateness policy define what happens to late data. A TTL can make updates impossible, but it is a storage detail, not the policy that decides correctness.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "bucketed-time-window-aggregation",
    "unitTitle": "Bucketed time-window aggregation"
  },
  {
    "id": "srs-quiz-bucketed-time-window-aggregation-c2",
    "type": "quiz",
    "prompt": "You need \"errors in the last 15 minutes, updated every minute\" for 20,000 endpoints, using 1-minute tumbling Redis buckets with a 20-minute TTL. At 10:30, what do you read, and about how many live keys exist?",
    "answer": "Buckets 10:15 through 10:29 with one MGET of 15 keys; about 400,000 keys\n\nExplanation: Following the lesson's pattern, you sum the 15 completed minute buckets before the current one, and 20,000 endpoints x 20 live buckets is 400,000 small keys. Including the just-started 10:30 bucket makes the window 16 minutes wide.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "bucketed-time-window-aggregation",
    "unitTitle": "Bucketed time-window aggregation"
  },
  {
    "id": "srs-quiz-bucketed-time-window-aggregation-c3",
    "type": "quiz",
    "prompt": "99 percent of mobile events arrive within 2 minutes and 99.9 percent within 20 minutes. Ops dashboards need freshness, but billing needs completeness. Which windowing strategy fits both?",
    "answer": "Publish with a 2-minute watermark, emit updates as late data arrives, and mark buckets final after the 20-minute bound\n\nExplanation: Early results with late updates and a later final mark give dashboards speed and billing completeness. A 20-minute watermark everywhere makes every dashboard 20 minutes stale and holds about 10 times more open window state, while processing time simply puts late events in the wrong bucket.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "bucketed-time-window-aggregation",
    "unitTitle": "Bucketed time-window aggregation"
  },
  {
    "id": "srs-takeaway-raw-events-vs-derived-analytics-1",
    "type": "takeaway",
    "prompt": "In Raw events vs derived analytics, what is a fundamental rule regarding: Raw events provide ground-truth flexibility for retroactive, ad-hoc queries?",
    "answer": "Raw events provide ground-truth flexibility for retroactive, ad-hoc queries.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "raw-events-vs-derived-analytics",
    "unitTitle": "Raw events vs derived analytics"
  },
  {
    "id": "srs-takeaway-raw-events-vs-derived-analytics-2",
    "type": "takeaway",
    "prompt": "In Raw events vs derived analytics, what is a fundamental rule regarding: Derived analytics (pre-aggregations) are required for fast dashboard rendering?",
    "answer": "Derived analytics (pre-aggregations) are required for fast dashboard rendering.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "raw-events-vs-derived-analytics",
    "unitTitle": "Raw events vs derived analytics"
  },
  {
    "id": "srs-takeaway-raw-events-vs-derived-analytics-3",
    "type": "takeaway",
    "prompt": "In Raw events vs derived analytics, what is a fundamental rule regarding: Store raw data in cheap storage (S3/Parquet) and derived data in fast databases?",
    "answer": "Store raw data in cheap storage (S3/Parquet) and derived data in fast databases.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "raw-events-vs-derived-analytics",
    "unitTitle": "Raw events vs derived analytics"
  },
  {
    "id": "srs-quiz-raw-events-vs-derived-analytics-c1",
    "type": "quiz",
    "prompt": "Fraud rule v2 excludes some impressions that rule v1 counted. How should the derived aggregate tables be corrected?",
    "answer": "Rebuild from raw events into a new aggregate version, validate it, then atomically switch reports to it\n\nExplanation: Rebuilding into a new version and switching atomically avoids reports that mix v1 and v2 definitions and preserves lineage. In-place updates are exactly what leaves mixed definitions if they are interrupted or partial.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "raw-events-vs-derived-analytics",
    "unitTitle": "Raw events vs derived analytics"
  },
  {
    "id": "srs-quiz-raw-events-vs-derived-analytics-c2",
    "type": "quiz",
    "prompt": "You ingest 4 billion events per day at 500 bytes each as JSON, and store them as Parquet with 5 to 10 times compression. How much storage does 180 days of raw Parquet need?",
    "answer": "About 36 to 72 TB\n\nExplanation: Raw JSON is 2 TB per day, Parquet brings it to 200 to 400 GB per day, and 180 days is 36 to 72 TB. The 180 to 360 TB option applies compression incorrectly, and 360 TB is the uncompressed JSON total.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "raw-events-vs-derived-analytics",
    "unitTitle": "Raw events vs derived analytics"
  },
  {
    "id": "srs-quiz-raw-events-vs-derived-analytics-c3",
    "type": "quiz",
    "prompt": "Raw events with user IDs sit in immutable daily Parquet partitions for 90 days, plus backups. A GDPR deletion request arrives and must be honoured well before the partitions age out. Which pattern handles this most cleanly?",
    "answer": "Pseudonymise user IDs with a per-user key at ingest, and destroy that key on request (crypto-shredding)\n\nExplanation: Destroying a per-user key makes that user's records unlinkable everywhere, including backups, without rewriting immutable files. A global salt is the tempting trap: anyone holding the salt can still recompute and link the ID, so nothing has been deleted.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "raw-events-vs-derived-analytics",
    "unitTitle": "Raw events vs derived analytics"
  },
  {
    "id": "srs-takeaway-count-min-sketch-1",
    "type": "takeaway",
    "prompt": "In Count-min sketch, what is a fundamental rule regarding: Count-Min Sketch estimates frequency using a tiny, fixed memory footprint?",
    "answer": "Count-Min Sketch estimates frequency using a tiny, fixed memory footprint.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "count-min-sketch",
    "unitTitle": "Count-min sketch"
  },
  {
    "id": "srs-takeaway-count-min-sketch-2",
    "type": "takeaway",
    "prompt": "In Count-min sketch, what is a fundamental rule regarding: With non-negative updates, sufficient counter width, and compatible hashes, collision error is one-sided; other update models need separate guarantees?",
    "answer": "With non-negative updates, sufficient counter width, and compatible hashes, collision error is one-sided; other update models need separate guarantees.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "count-min-sketch",
    "unitTitle": "Count-min sketch"
  },
  {
    "id": "srs-takeaway-count-min-sketch-3",
    "type": "takeaway",
    "prompt": "In Count-min sketch, what is a fundamental rule regarding: Uses a 2D array of counters and takes the minimum value upon query to reduce error?",
    "answer": "Uses a 2D array of counters and takes the minimum value upon query to reduce error.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "count-min-sketch",
    "unitTitle": "Count-min sketch"
  },
  {
    "id": "srs-quiz-count-min-sketch-c1",
    "type": "quiz",
    "prompt": "With non-negative updates, why does Count-Min answer a frequency query with the minimum of the item's d counters?",
    "answer": "Each counter equals the true count plus non-negative collision mass, so the smallest is the least polluted and never below the truth\n\nExplanation: Collisions can only add to a counter, so every row overestimates or is exact, and the minimum is the tightest bound. It is biased upward, not unbiased; the Count sketch with a median is the unbiased variant.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "count-min-sketch",
    "unitTitle": "Count-min sketch"
  },
  {
    "id": "srs-quiz-count-min-sketch-c2",
    "type": "quiz",
    "prompt": "Width 4, depth 2. Insert a (row 1 col 1, row 2 col 0), then b (row 1 col 1, row 2 col 2), then c (row 1 col 3, row 2 col 0), then a again. What does the sketch return for a?",
    "answer": "3, because both of a's counters were hit by one other item\n\nExplanation: Row 1 col 1 holds a, b, a = 3 and row 2 col 0 holds a, c, a = 3, so the minimum is 3 against a true count of 2. The minimum only removes noise when at least one row is collision-free, which is not the case here.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "count-min-sketch",
    "unitTitle": "Count-min sketch"
  },
  {
    "id": "srs-quiz-count-min-sketch-c3",
    "type": "quiz",
    "prompt": "An API gateway uses a Count-Min sketch with epsilon 0.001 over 1 billion requests per day to block any key exceeding 10,000 requests per day. What breaks first?",
    "answer": "Light users get blocked, because the overcount bound is epsilon x N, up to about 1 million, far above the 10,000 limit\n\nExplanation: The error bound is relative to the whole stream, so a key with 50 requests can be estimated near 1,000,000 and falsely blocked; enforcement needs exact per-key counts or a far smaller epsilon. The tempting option misreads the bound as relative to each key's own count.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "count-min-sketch",
    "unitTitle": "Count-min sketch"
  },
  {
    "id": "srs-takeaway-top-k-heavy-hitters-1",
    "type": "takeaway",
    "prompt": "In Top-k heavy hitters, what is a fundamental rule regarding: The exact Top-K approach requires too much memory for high-cardinality streams?",
    "answer": "The exact Top-K approach requires too much memory for high-cardinality streams.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "top-k-heavy-hitters",
    "unitTitle": "Top-k heavy hitters"
  },
  {
    "id": "srs-takeaway-top-k-heavy-hitters-2",
    "type": "takeaway",
    "prompt": "In Top-k heavy hitters, what is a fundamental rule regarding: Frequency estimation and candidate discovery are separate jobs; combine compatible sketches with a bounded candidate algorithm?",
    "answer": "Frequency estimation and candidate discovery are separate jobs; combine compatible sketches with a bounded candidate algorithm.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "top-k-heavy-hitters",
    "unitTitle": "Top-k heavy hitters"
  },
  {
    "id": "srs-takeaway-top-k-heavy-hitters-3",
    "type": "takeaway",
    "prompt": "In Top-k heavy hitters, what is a fundamental rule regarding: Merging only local K can miss a global heavy hitter; oversample candidates or use a mergeable algorithm with explicit guarantees?",
    "answer": "Merging only local K can miss a global heavy hitter; oversample candidates or use a mergeable algorithm with explicit guarantees.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "top-k-heavy-hitters",
    "unitTitle": "Top-k heavy hitters"
  },
  {
    "id": "srs-quiz-top-k-heavy-hitters-c1",
    "type": "quiz",
    "prompt": "Why can a Count-Min sketch not produce the top 10 hashtags on its own?",
    "answer": "It estimates the count of a key you supply but does not remember which keys it has seen\n\nExplanation: Count-Min answers how many for a given key but stores no keys, so candidate discovery needs a heap, Space-Saving, or an explicit candidate set. With non-negative updates it overestimates rather than underestimates.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "top-k-heavy-hitters",
    "unitTitle": "Top-k heavy hitters"
  },
  {
    "id": "srs-quiz-top-k-heavy-hitters-c2",
    "type": "quiz",
    "prompt": "An hour has 500 million search events, and a Space-Saving summary keeps k = 5,000 counters. Which items are guaranteed to appear in the summary?",
    "answer": "Every item with more than 100,000 occurrences, since the overestimate per counter is at most N divided by k\n\nExplanation: Space-Saving's error per counter is at most N divided by k = 100,000, so any item above that frequency is guaranteed to be tracked. It does not return the exact top k with exact counts; counts are overestimates within that bound.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "top-k-heavy-hitters",
    "unitTitle": "Top-k heavy hitters"
  },
  {
    "id": "srs-quiz-top-k-heavy-hitters-c3",
    "type": "quiz",
    "prompt": "Four shards each report their local top 2. Key X is third on every shard with 800 per shard, 3,200 total, while each shard's top two keys are different and have about 1,000 each on that shard and little elsewhere. How do you make the global top 1 correct?",
    "answer": "Send an oversampled candidate list, such as the top 10 times K from each shard, then get exact counts for the union of candidates from every shard\n\nExplanation: Oversampling candidates and then asking every shard for their counts of the union recovers keys that are mid-ranked everywhere but largest globally. Bumping to top 3 happens to fix this instance but is not a general rule, and better local accuracy does not help when X never leaves the shard.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "top-k-heavy-hitters",
    "unitTitle": "Top-k heavy hitters"
  },
  {
    "id": "srs-takeaway-reservoir-sampling-1",
    "type": "takeaway",
    "prompt": "In Reservoir sampling, what is a fundamental rule regarding: Reservoir sampling maintains a uniform random sample of the finite stream prefix observed so far?",
    "answer": "Reservoir sampling maintains a uniform random sample of the finite stream prefix observed so far.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reservoir-sampling",
    "unitTitle": "Reservoir sampling"
  },
  {
    "id": "srs-takeaway-reservoir-sampling-2",
    "type": "takeaway",
    "prompt": "In Reservoir sampling, what is a fundamental rule regarding: It requires only O(K) memory, completely independent of the stream size?",
    "answer": "It requires only O(K) memory, completely independent of the stream size.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reservoir-sampling",
    "unitTitle": "Reservoir sampling"
  },
  {
    "id": "srs-takeaway-reservoir-sampling-3",
    "type": "takeaway",
    "prompt": "In Reservoir sampling, what is a fundamental rule regarding: Distributed reservoirs require population-aware merging and are not interchangeable with immediate per-trace sampling?",
    "answer": "Distributed reservoirs require population-aware merging and are not interchangeable with immediate per-trace sampling.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reservoir-sampling",
    "unitTitle": "Reservoir sampling"
  },
  {
    "id": "srs-quiz-reservoir-sampling-c1",
    "type": "quiz",
    "prompt": "A reservoir of size K = 1,000 has already processed 5,000 items. With what probability is item 5,001 placed into the reservoir?",
    "answer": "1,000 divided by 5,001, from drawing j between 1 and i and keeping it if j is at most K\n\nExplanation: Item i is kept with probability K divided by i, which here is 1,000 divided by 5,001, about 0.2, keeping every item's inclusion probability at K divided by N. 1 divided by 1,000 is the chance of evicting a particular incumbent once the item is kept.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reservoir-sampling",
    "unitTitle": "Reservoir sampling"
  },
  {
    "id": "srs-quiz-reservoir-sampling-c2",
    "type": "quiz",
    "prompt": "Three workers saw 600,000, 200,000 and 200,000 events and each kept a 1,000-item reservoir. For a uniform merged sample of 1,000, how many items should come from each worker in expectation?",
    "answer": "About 600, 200 and 200, proportional to how many events each worker saw\n\nExplanation: Each slot should come from a worker with probability equal to its share of the total population, so 60, 20 and 20 percent. Equal draws over-represent the small workers' events by a factor of about 1.7.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reservoir-sampling",
    "unitTitle": "Reservoir sampling"
  },
  {
    "id": "srs-quiz-reservoir-sampling-c3",
    "type": "quiz",
    "prompt": "Hundreds of workers must each keep a sample so that any subset can be merged later into a uniform sample, and reruns must choose the same items. Which variant fits best?",
    "answer": "Bottom-K sampling with hashed keys: keep the K smallest hash values, and merge by taking the K smallest of the union\n\nExplanation: Hash-based bottom-K is deterministic and merges trivially without knowing each worker's population. Algorithm L only reduces random-number cost; it is still randomised and needs population-aware merging, while fixed-rate sampling does not give a bounded K.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reservoir-sampling",
    "unitTitle": "Reservoir sampling"
  },
  {
    "id": "srs-takeaway-tdigest-quantile-sketch-1",
    "type": "takeaway",
    "prompt": "In t-digest quantile sketch, what is a fundamental rule regarding: Exact percentiles over massive streams need O(N) memory or multiple passes, which is impractical at high throughput?",
    "answer": "Exact percentiles over massive streams need O(N) memory or multiple passes, which is impractical at high throughput.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "tdigest-quantile-sketch",
    "unitTitle": "t-digest quantile sketch"
  },
  {
    "id": "srs-takeaway-tdigest-quantile-sketch-2",
    "type": "takeaway",
    "prompt": "In t-digest quantile sketch, what is a fundamental rule regarding: t-digest estimates percentiles with low memory, preserving high accuracy at the tails (p99)?",
    "answer": "t-digest estimates percentiles with low memory, preserving high accuracy at the tails (p99).",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "tdigest-quantile-sketch",
    "unitTitle": "t-digest quantile sketch"
  },
  {
    "id": "srs-takeaway-tdigest-quantile-sketch-3",
    "type": "takeaway",
    "prompt": "In t-digest quantile sketch, what is a fundamental rule regarding: Compatible t-digests are mergeable, but merge order, duplicate contributions, and implementation behavior require validation?",
    "answer": "Compatible t-digests are mergeable, but merge order, duplicate contributions, and implementation behavior require validation.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "tdigest-quantile-sketch",
    "unitTitle": "t-digest quantile sketch"
  },
  {
    "id": "srs-quiz-tdigest-quantile-sketch-c1",
    "type": "quiz",
    "prompt": "Why does t-digest restrict centroids near the extremes to be much smaller than centroids near the median?",
    "answer": "Because SLA questions such as p99 and p99.9 live in the tails, and small centroids keep interpolation error low exactly there\n\nExplanation: Keeping tail clusters tiny preserves resolution where percentile questions are asked, while large middle clusters save memory. The median region is not discarded; it is merely summarised more coarsely.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "tdigest-quantile-sketch",
    "unitTitle": "t-digest quantile sketch"
  },
  {
    "id": "srs-quiz-tdigest-quantile-sketch-c2",
    "type": "quiz",
    "prompt": "Host A served 9,800 requests at 20 ms each. Host B served 200 requests at 800 ms each. What is the true global p99, and what does averaging the host p99s give?",
    "answer": "True p99 about 800 ms; average of host p99s about 410 ms\n\nExplanation: The slowest 1 percent of 10,000 requests is 100 requests, all from host B at 800 ms, so the global p99 is 800 ms, while averaging 20 and 800 gives 410 ms. Percentiles are not averageable; merging digests combines the underlying distributions.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "tdigest-quantile-sketch",
    "unitTitle": "t-digest quantile sketch"
  },
  {
    "id": "srs-quiz-tdigest-quantile-sketch-c3",
    "type": "quiz",
    "prompt": "A contract requires reported p99.9 latency to be within 1 percent relative error, over values from 50 microseconds to 60 seconds, across thousands of merged hosts. Which structure is the safest choice?",
    "answer": "DDSketch, since it guarantees relative error across a wide range and merges exactly\n\nExplanation: When an SLA needs a stated guarantee, a relative-error sketch such as DDSketch is the right tool; t-digest is empirically excellent but has no hard worst-case bound. KLL's rank guarantee can still mean a large value error in a steep tail.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "tdigest-quantile-sketch",
    "unitTitle": "t-digest quantile sketch"
  },
  {
    "id": "srs-takeaway-streaming-percentile-analytics-1",
    "type": "takeaway",
    "prompt": "In Streaming percentile analytics, what is a fundamental rule regarding: Real-time percentiles rely on in-memory sketches (t-digest, HDRHistogram)?",
    "answer": "Real-time percentiles rely on in-memory sketches (t-digest, HDRHistogram).",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "streaming-percentile-analytics",
    "unitTitle": "Streaming percentile analytics"
  },
  {
    "id": "srs-takeaway-streaming-percentile-analytics-2",
    "type": "takeaway",
    "prompt": "In Streaming percentile analytics, what is a fundamental rule regarding: Stream processors build sketches over small time windows and persist them?",
    "answer": "Stream processors build sketches over small time windows and persist them.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "streaming-percentile-analytics",
    "unitTitle": "Streaming percentile analytics"
  },
  {
    "id": "srs-takeaway-streaming-percentile-analytics-3",
    "type": "takeaway",
    "prompt": "In Streaming percentile analytics, what is a fundamental rule regarding: Dashboards merge historical sketches on the fly for fast, accurate aggregations?",
    "answer": "Dashboards merge historical sketches on the fly for fast, accurate aggregations.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "streaming-percentile-analytics",
    "unitTitle": "Streaming percentile analytics"
  },
  {
    "id": "srs-quiz-streaming-percentile-analytics-c1",
    "type": "quiz",
    "prompt": "A pipeline computes a sketch per series every 10 seconds. Why should it store the sketch itself rather than only the p99 value it computes?",
    "answer": "Because sketches can be merged across hosts and time ranges later, while stored p99 values can never be combined correctly\n\nExplanation: The sketch, not the percentile, is the unit of storage, because only sketches support correct merges for arbitrary ranges and dimensions. A sketch is a few KB, much larger than one number; the point is mergeability, not size.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "streaming-percentile-analytics",
    "unitTitle": "Streaming percentile analytics"
  },
  {
    "id": "srs-quiz-streaming-percentile-analytics-c2",
    "type": "quiz",
    "prompt": "A service has 100 hosts and 30 endpoints, giving 3,000 series, with sketches emitted every 10 seconds. How many sketches must be merged for the whole-service p99 over the last hour without rollups, and with 1-minute service-level rollups?",
    "answer": "About 1.08 million without rollups; 60 with rollups\n\nExplanation: An hour is 360 ten-second buckets x 3,000 series = 1.08 million sketches, while service-level 1-minute rollups need just 60. The 3,000 answer forgets that the rollups are already merged across all series.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "streaming-percentile-analytics",
    "unitTitle": "Streaming percentile analytics"
  },
  {
    "id": "srs-quiz-streaming-percentile-analytics-c3",
    "type": "quiz",
    "prompt": "A closed-loop load tester sends one request every 5 ms but waits for each response before sending the next. The server stalls for 1 second. What does the naive report hide?",
    "answer": "About 200 requests that should have been sent during the stall and would each have waited up to 1 second\n\nExplanation: Waiting for responses means the tester silently skips the sends it would have made, so one slow sample stands in for about 200; correct with expected-interval recording or use an open-loop generator. One slow sample among thousands barely moves the tail, which is exactly the illusion.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "streaming-percentile-analytics",
    "unitTitle": "Streaming percentile analytics"
  },
  {
    "id": "srs-takeaway-live-reactions-high-throughput-design-1",
    "type": "takeaway",
    "prompt": "In Design: live reactions at high throughput, what is a fundamental rule regarding: Client-side throttling and batching is the first line of defense against high throughput?",
    "answer": "Client-side throttling and batching is the first line of defense against high throughput.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-reactions-high-throughput-design",
    "unitTitle": "Design: live reactions at high throughput"
  },
  {
    "id": "srs-takeaway-live-reactions-high-throughput-design-2",
    "type": "takeaway",
    "prompt": "In Design: live reactions at high throughput, what is a fundamental rule regarding: Server-side memory buffering aggregates raw events into periodic updates?",
    "answer": "Server-side memory buffering aggregates raw events into periodic updates.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-reactions-high-throughput-design",
    "unitTitle": "Design: live reactions at high throughput"
  },
  {
    "id": "srs-takeaway-live-reactions-high-throughput-design-3",
    "type": "takeaway",
    "prompt": "In Design: live reactions at high throughput, what is a fundamental rule regarding: Visualizing high-volume data relies on client-side rendering interpolation, not 1-to-1 event mapping?",
    "answer": "Visualizing high-volume data relies on client-side rendering interpolation, not 1-to-1 event mapping.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-reactions-high-throughput-design",
    "unitTitle": "Design: live reactions at high throughput"
  },
  {
    "id": "srs-quiz-live-reactions-high-throughput-design-c1",
    "type": "quiz",
    "prompt": "A WebSocket server notices that one viewer on a poor connection is falling behind on reaction updates. What should it do?",
    "answer": "Bound the per-connection queue and drop stale visual updates, since the animations are cosmetic\n\nExplanation: Reaction animations are cosmetic, so bounding queues and dropping stale updates protects server memory; the client can refetch a snapshot. Unbounded buffering per slow client is how one bad connection exhausts a server.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-reactions-high-throughput-design",
    "unitTitle": "Design: live reactions at high throughput"
  },
  {
    "id": "srs-quiz-live-reactions-high-throughput-design-c2",
    "type": "quiz",
    "prompt": "A live event has 5 million concurrent viewers across 500 edge servers. Reactions are aggregated per stream every 250 ms and one summary is sent to each viewer. How many messages per second does each edge server push?",
    "answer": "About 40,000\n\nExplanation: 4 summaries per second x 5 million viewers is 20 million messages per second overall, and divided over 500 servers that is 40,000 each. 20 million is the cluster-wide total, and 10,000 is just the connection count per server.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-reactions-high-throughput-design",
    "unitTitle": "Design: live reactions at high throughput"
  },
  {
    "id": "srs-quiz-live-reactions-high-throughput-design-c3",
    "type": "quiz",
    "prompt": "Reaction totals will now feed creator payouts. Today, ingest nodes buffer counts in memory for 2 seconds and publish to Redis Pub/Sub. What change is required?",
    "answer": "Before acknowledging, write an idempotent delta (stream, ingest node, batch sequence) to a durable log and derive the payout counter from it\n\nExplanation: A durable, idempotent delta written before acknowledgement makes the permanent total survive crashes and retries, while the display path stays lossy. Redis Pub/Sub is fire-and-forget with no persistence, and a shorter buffer shrinks the loss without eliminating it.",
    "category": "Probabilistic Sketches & Stream Analytics",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-reactions-high-throughput-design",
    "unitTitle": "Design: live reactions at high throughput"
  },
  {
    "id": "srs-takeaway-realtime-database-and-websocket-scaling-1",
    "type": "takeaway",
    "prompt": "In Realtime database and WebSocket scaling, what is a fundamental rule regarding: WebSockets require stateful, persistent TCP connections?",
    "answer": "WebSockets require stateful, persistent TCP connections.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "realtime-database-and-websocket-scaling",
    "unitTitle": "Realtime database and WebSocket scaling"
  },
  {
    "id": "srs-takeaway-realtime-database-and-websocket-scaling-2",
    "type": "takeaway",
    "prompt": "In Realtime database and WebSocket scaling, what is a fundamental rule regarding: Scaling requires a registry (like Redis) to map users to their connected servers?",
    "answer": "Scaling requires a registry (like Redis) to map users to their connected servers.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "realtime-database-and-websocket-scaling",
    "unitTitle": "Realtime database and WebSocket scaling"
  },
  {
    "id": "srs-takeaway-realtime-database-and-websocket-scaling-3",
    "type": "takeaway",
    "prompt": "In Realtime database and WebSocket scaling, what is a fundamental rule regarding: Ephemeral Pub/Sub can route live hints, while durable positions and gap fetches recover messages missed during disconnects or node failure?",
    "answer": "Ephemeral Pub/Sub can route live hints, while durable positions and gap fetches recover messages missed during disconnects or node failure.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "realtime-database-and-websocket-scaling",
    "unitTitle": "Realtime database and WebSocket scaling"
  },
  {
    "id": "srs-quiz-realtime-database-and-websocket-scaling-c1",
    "type": "quiz",
    "prompt": "A chat backend publishes every new message to Redis Pub/Sub, and each WebSocket node forwards what it receives to its local sockets. A user's phone drops off Wi-Fi for 20 seconds. What happens to messages published during that gap, and what does the lesson say must fix it?",
    "answer": "They are missed, because Pub/Sub is fire-and-forget; the client must resume from its last acknowledged position in a durable store\n\nExplanation: Ephemeral Pub/Sub only reaches subscribers that are listening right now, so durability has to come from per-conversation or per-recipient positions the client resumes from. Sticky sessions only reduce churn; after a crash or deploy the reconnect can land on any node, so they cannot be the recovery mechanism.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "realtime-database-and-websocket-scaling",
    "unitTitle": "Realtime database and WebSocket scaling"
  },
  {
    "id": "srs-quiz-realtime-database-and-websocket-scaling-c2",
    "type": "quiz",
    "prompt": "You expect 6 million concurrent users averaging 1.5 devices each. One gateway node comfortably holds 150,000 sockets, and you want about 30 percent headroom so a node can be drained or lost. Roughly how many gateway nodes should you provision?",
    "answer": "About 78 nodes\n\nExplanation: 6M x 1.5 = 9M sockets; 9M / 150k = 60 nodes at steady state, and 30 percent headroom brings it to about 78. Stopping at 60 is the tempting mistake: losing or draining one node would push its 150k sockets onto neighbours that are already full.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "realtime-database-and-websocket-scaling",
    "unitTitle": "Realtime database and WebSocket scaling"
  },
  {
    "id": "srs-quiz-realtime-database-and-websocket-scaling-c3",
    "type": "quiz",
    "prompt": "Gateway A is partitioned away for 40 seconds; its users reconnect to Gateway B and re-register. When the partition heals, A still believes it owns those connections and rewrites its old registry entries. Which safeguard from the lesson stops messages being routed to A's dead sockets?",
    "answer": "Fence registry entries with a node generation or epoch and expire entries whose heartbeats stop\n\nExplanation: An epoch or generation number lets the registry reject writes from a node whose ownership has been superseded, and heartbeat expiry removes entries nobody is renewing. Broadcasting sidesteps the registry but its traffic grows with nodes times messages and fails beyond a few dozen nodes, so it trades one problem for a worse one.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "realtime-database-and-websocket-scaling",
    "unitTitle": "Realtime database and WebSocket scaling"
  },
  {
    "id": "srs-takeaway-websockets-vs-sse-vs-long-polling-1",
    "type": "takeaway",
    "prompt": "In WebSockets vs SSE vs long polling, what is a fundamental rule regarding: Long polling is resource-intensive but works when WebSockets are blocked?",
    "answer": "Long polling is resource-intensive but works when WebSockets are blocked.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "websockets-vs-sse-vs-long-polling",
    "unitTitle": "WebSockets vs SSE vs long polling"
  },
  {
    "id": "srs-takeaway-websockets-vs-sse-vs-long-polling-2",
    "type": "takeaway",
    "prompt": "In WebSockets vs SSE vs long polling, what is a fundamental rule regarding: SSE is perfect for unidirectional data streams (like stock tickers)?",
    "answer": "SSE is perfect for unidirectional data streams (like stock tickers).",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "websockets-vs-sse-vs-long-polling",
    "unitTitle": "WebSockets vs SSE vs long polling"
  },
  {
    "id": "srs-takeaway-websockets-vs-sse-vs-long-polling-3",
    "type": "takeaway",
    "prompt": "In WebSockets vs SSE vs long polling, what is a fundamental rule regarding: WebSockets offer full-duplex, low-latency communication for interactive apps?",
    "answer": "WebSockets offer full-duplex, low-latency communication for interactive apps.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "websockets-vs-sse-vs-long-polling",
    "unitTitle": "WebSockets vs SSE vs long polling"
  },
  {
    "id": "srs-quiz-websockets-vs-sse-vs-long-polling-c1",
    "type": "quiz",
    "prompt": "You are streaming LLM tokens from server to browser and considering SSE instead of WebSockets. Which capability does the browser's EventSource give you out of the box that you would otherwise have to design yourself on a WebSocket?",
    "answer": "Automatic reconnection that sends Last-Event-ID so the server can resume\n\nExplanation: EventSource reconnects automatically and sends Last-Event-ID, whereas WebSocket session resume is something you must design. SSE is text-only and one-way, and over HTTP/1.1 each stream consumes one of about six connections per origin; multiplexing comes from HTTP/2, not from SSE.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "websockets-vs-sse-vs-long-polling",
    "unitTitle": "WebSockets vs SSE vs long polling"
  },
  {
    "id": "srs-quiz-websockets-vs-sse-vs-long-polling-c2",
    "type": "quiz",
    "prompt": "2,000,000 clients each receive about one update per 60 seconds. If they short-poll every 10 seconds, what is the fleet-wide request rate and roughly what share of polls come back empty?",
    "answer": "About 200,000 requests per second, with roughly 83 percent returning empty\n\nExplanation: 2M clients / 10 s = 200,000 requests per second, and with one update per 60 s only about 1 in 6 polls carries data, so about 83 percent is wasted. The 33,000 figure is the update rate (2M / 60), which is roughly what an SSE or WebSocket push would cost instead.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "websockets-vs-sse-vs-long-polling",
    "unitTitle": "WebSockets vs SSE vs long polling"
  },
  {
    "id": "srs-quiz-websockets-vs-sse-vs-long-polling-c3",
    "type": "quiz",
    "prompt": "An SSE notifications feed works in testing, but customers behind one corporate network report seeing nothing for minutes and then a burst of all events at once. What is the most likely cause and fix?",
    "answer": "An intermediary proxy is buffering the response; disable buffering and send periodic comment lines\n\nExplanation: A buffering proxy holds a streaming response until its buffer fills, producing exactly the nothing-then-everything symptom; disabling buffering (for nginx, X-Accel-Buffering) plus heartbeat comments fixes it. A connection-limit problem would block new streams entirely rather than delay and then burst events on an open one.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "websockets-vs-sse-vs-long-polling",
    "unitTitle": "WebSockets vs SSE vs long polling"
  },
  {
    "id": "srs-takeaway-social-network-database-modeling-1",
    "type": "takeaway",
    "prompt": "In Social network database modeling, what is a fundamental rule regarding: At massive scale the bottleneck is feed fan-out and access patterns rather than JOINs as such; sharded relational stores (e?",
    "answer": "At massive scale the bottleneck is feed fan-out and access patterns rather than JOINs as such; sharded relational stores (e.g. MySQL behind Facebook's TAO) still hold core social data.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-network-database-modeling",
    "unitTitle": "Social network database modeling"
  },
  {
    "id": "srs-takeaway-social-network-database-modeling-2",
    "type": "takeaway",
    "prompt": "In Social network database modeling, what is a fundamental rule regarding: Wide-column NoSQL databases optimize reads by denormalizing data into query-specific tables?",
    "answer": "Wide-column NoSQL databases optimize reads by denormalizing data into query-specific tables.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-network-database-modeling",
    "unitTitle": "Social network database modeling"
  },
  {
    "id": "srs-takeaway-social-network-database-modeling-3",
    "type": "takeaway",
    "prompt": "In Social network database modeling, what is a fundamental rule regarding: Graph databases are powerful for relationship analytics but usually kept off the hot read path?",
    "answer": "Graph databases are powerful for relationship analytics but usually kept off the hot read path.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-network-database-modeling",
    "unitTitle": "Social network database modeling"
  },
  {
    "id": "srs-quiz-social-network-database-modeling-c1",
    "type": "quiz",
    "prompt": "A colleague argues the home feed must move off MySQL because \"JOINs cannot scale for social networks\". According to the lesson, what is the more accurate diagnosis?",
    "answer": "The expensive part is the access pattern and fan-out of merging many authors under a latency target, not JOINs as such\n\nExplanation: The lesson stresses that a normalized schema serves most entities well and that Facebook still runs core social data on sharded MySQL behind TAO; the feed gets expensive because of fan-out and merging, which can justify a materialized projection. Traversal engines are explicitly kept off the hot feed path.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-network-database-modeling",
    "unitTitle": "Social network database modeling"
  },
  {
    "id": "srs-quiz-social-network-database-modeling-c2",
    "type": "quiz",
    "prompt": "A network has 200 million daily active users who each open their feed 15 times a day, and 60 million posts are created per day. Approximately what are the average feed reads per second, posts per second, and the read to write ratio?",
    "answer": "About 35,000 reads per second, 700 posts per second, a ratio of 50 to 1\n\nExplanation: 200M x 15 = 3B reads per day, about 34,700 per second; 60M posts per day is about 694 per second, so reads outnumber writes about 50 to 1. That lopsided ratio is what justifies spending write-time work to precompute read-shaped timelines.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-network-database-modeling",
    "unitTitle": "Social network database modeling"
  },
  {
    "id": "srs-quiz-social-network-database-modeling-c3",
    "type": "quiz",
    "prompt": "A team denormalizes full post bodies into every follower's user_timeline rows to save a lookup at read time. Which operational problem gets markedly worse compared with storing only post IDs and hydrating bodies from a cache?",
    "answer": "Deleting or editing a post now requires fanning changes or tombstones out to every follower's partition\n\nExplanation: With bodies copied into every timeline, a delete or edit must be propagated to all those copies, which the lesson notes is why many systems store only IDs and filter or hydrate at read time. The first page is still a single-partition read either way; embedding bodies changes what each row holds, not how it is partitioned.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-network-database-modeling",
    "unitTitle": "Social network database modeling"
  },
  {
    "id": "srs-takeaway-social-graph-follows-and-flockdb-1",
    "type": "takeaway",
    "prompt": "In Social graph: follows and FlockDB, what is a fundamental rule regarding: Large-scale follow graphs are often implemented as simple, distributed adjacency lists?",
    "answer": "Large-scale follow graphs are often implemented as simple, distributed adjacency lists.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-graph-follows-and-flockdb",
    "unitTitle": "Social graph: follows and FlockDB"
  },
  {
    "id": "srs-takeaway-social-graph-follows-and-flockdb-2",
    "type": "takeaway",
    "prompt": "In Social graph: follows and FlockDB, what is a fundamental rule regarding: Sharding by source ID optimizes read queries for feed generation?",
    "answer": "Sharding by source ID optimizes read queries for feed generation.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-graph-follows-and-flockdb",
    "unitTitle": "Social graph: follows and FlockDB"
  },
  {
    "id": "srs-takeaway-social-graph-follows-and-flockdb-3",
    "type": "takeaway",
    "prompt": "In Social graph: follows and FlockDB, what is a fundamental rule regarding: Twitter's FlockDB demonstrated how to scale graph edges using standard relational databases?",
    "answer": "Twitter's FlockDB demonstrated how to scale graph edges using standard relational databases.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-graph-follows-and-flockdb",
    "unitTitle": "Social graph: follows and FlockDB"
  },
  {
    "id": "srs-quiz-social-graph-follows-and-flockdb-c1",
    "type": "quiz",
    "prompt": "FlockDB stores each follow edge in a forward list sharded by source and a reverse list sharded by destination. What would happen to the query \"who follows user B?\" if edges were stored only once, sharded by source_id?",
    "answer": "It would become a scatter-gather across every shard, since B's followers could live anywhere\n\nExplanation: Sharding by source puts each follower's edge on that follower's shard, so finding B's followers means asking every shard; the destination-sharded copy turns it back into one indexed range read. A local secondary index on destination_id does not help because the rows themselves are spread across all shards.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-graph-follows-and-flockdb",
    "unitTitle": "Social graph: follows and FlockDB"
  },
  {
    "id": "srs-quiz-social-graph-follows-and-flockdb-c2",
    "type": "quiz",
    "prompt": "Your platform has 100 million users who follow an average of 300 accounts. Using the lesson's row layout of about 25 bytes and storing both directions, roughly how much raw edge data is that before index overhead and replication?",
    "answer": "About 1.5 TB\n\nExplanation: 100M x 300 = 30 billion logical edges, 60 billion rows with both directions, times 25 bytes is about 1.5 TB raw. The 0.75 TB option forgets the reverse copy, which is the whole point of the design; overhead and three replicas would then multiply the real footprint several times.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-graph-follows-and-flockdb",
    "unitTitle": "Social graph: follows and FlockDB"
  },
  {
    "id": "srs-quiz-social-graph-follows-and-flockdb-c3",
    "type": "quiz",
    "prompt": "A user follows then immediately unfollows an account. The reverse-edge write for the original follow is delayed in the queue and retried after the unfollow has been applied. What in the lesson's design stops the edge from being resurrected?",
    "answer": "Each edge carries a state and a position, and the store keeps whichever write has the higher position\n\nExplanation: Unfollow is a state change with a newer position, so the stale follow with its older position loses and the edge stays removed; a repair job fixes any remaining drift. Physically deleting the row is the tempting wrong answer: the late retry would simply insert a fresh active edge, which is exactly the resurrection bug.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "social-graph-follows-and-flockdb",
    "unitTitle": "Social graph: follows and FlockDB"
  },
  {
    "id": "srs-takeaway-feed-generation-push-pull-hybrid-1",
    "type": "takeaway",
    "prompt": "In Feed generation: push, pull, hybrid, what is a fundamental rule regarding: Push (fan-out on write) optimizes for fast reads but struggles with massive follower counts?",
    "answer": "Push (fan-out on write) optimizes for fast reads but struggles with massive follower counts.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "feed-generation-push-pull-hybrid",
    "unitTitle": "Feed generation: push, pull, hybrid"
  },
  {
    "id": "srs-takeaway-feed-generation-push-pull-hybrid-2",
    "type": "takeaway",
    "prompt": "In Feed generation: push, pull, hybrid, what is a fundamental rule regarding: Pull (fan-out on read) optimizes for fast writes but slows down feed loading?",
    "answer": "Pull (fan-out on read) optimizes for fast writes but slows down feed loading.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "feed-generation-push-pull-hybrid",
    "unitTitle": "Feed generation: push, pull, hybrid"
  },
  {
    "id": "srs-takeaway-feed-generation-push-pull-hybrid-3",
    "type": "takeaway",
    "prompt": "In Feed generation: push, pull, hybrid, what is a fundamental rule regarding: Hybrid models apply different strategies based on user follower topology?",
    "answer": "Hybrid models apply different strategies based on user follower topology.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "feed-generation-push-pull-hybrid",
    "unitTitle": "Feed generation: push, pull, hybrid"
  },
  {
    "id": "srs-quiz-feed-generation-push-pull-hybrid-c1",
    "type": "quiz",
    "prompt": "In the hybrid feed model, what does the system do when a user who follows several celebrities opens their feed?",
    "answer": "Reads the precomputed timeline and, at read time, pulls recent posts from followed celebrity outboxes and merges them\n\nExplanation: The hybrid pushes posts from ordinary authors into timelines at write time and pulls the few large accounts at read time, merging the two. Reading every outbox is pure pull, which is exactly the expensive read path the hybrid avoids for normal authors.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "feed-generation-push-pull-hybrid",
    "unitTitle": "Feed generation: push, pull, hybrid"
  },
  {
    "id": "srs-quiz-feed-generation-push-pull-hybrid-c2",
    "type": "quiz",
    "prompt": "A network sees 20 million posts per day and authors have 300 followers on average. Under pure push, roughly how many timeline inserts per second must the fan-out workers sustain on average?",
    "answer": "About 69,000 per second\n\nExplanation: 20M x 300 = 6 billion inserts per day, divided by 86,400 seconds is about 69,000 per second on average, with peaks several times higher. The 7,000 option is off by a factor of ten, a common slip when dividing billions by 86,400.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "feed-generation-push-pull-hybrid",
    "unitTitle": "Feed generation: push, pull, hybrid"
  },
  {
    "id": "srs-quiz-feed-generation-push-pull-hybrid-c3",
    "type": "quiz",
    "prompt": "Analytics show that 40 percent of followers across the platform have not opened the app in over 30 days, yet push fan-out writes to all of them. What is the lesson's recommended way to cut this wasted work without hurting active users?",
    "answer": "Skip fan-out to inactive followers and rebuild their timeline when they return\n\nExplanation: The trade-off table names fan-out to users who never open the app as push's wasted work, reduced by skipping inactive users and rebuilding on return. Lowering the celebrity threshold also cuts writes, but it shifts cost onto every active reader's merge, which is the wrong direction for a problem caused only by inactive users.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "feed-generation-push-pull-hybrid",
    "unitTitle": "Feed generation: push, pull, hybrid"
  },
  {
    "id": "srs-takeaway-newly-unread-indicator-1",
    "type": "takeaway",
    "prompt": "In Design: a newly-unread indicator, what is a fundamental rule regarding: Keep newly-unread semantics distinct from message counts, conversation unread state, and read receipts?",
    "answer": "Keep newly-unread semantics distinct from message counts, conversation unread state, and read receipts.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "newly-unread-indicator",
    "unitTitle": "Design: a newly-unread indicator"
  },
  {
    "id": "srs-takeaway-newly-unread-indicator-2",
    "type": "takeaway",
    "prompt": "In Design: a newly-unread indicator, what is a fundamental rule regarding: Use recipient-local positions and server-issued snapshot acknowledgements so racing arrivals are not cleared?",
    "answer": "Use recipient-local positions and server-issued snapshot acknowledgements so racing arrivals are not cleared.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "newly-unread-indicator",
    "unitTitle": "Design: a newly-unread indicator"
  },
  {
    "id": "srs-takeaway-newly-unread-indicator-3",
    "type": "takeaway",
    "prompt": "In Design: a newly-unread indicator, what is a fundamental rule regarding: A prepared sender projection may accelerate reads, but retained source messages and projection progress make lag recoverable?",
    "answer": "A prepared sender projection may accelerate reads, but retained source messages and projection progress make lag recoverable.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "newly-unread-indicator",
    "unitTitle": "Design: a newly-unread indicator"
  },
  {
    "id": "srs-quiz-newly-unread-indicator-c1",
    "type": "quiz",
    "prompt": "A badge implementation increments a counter on each arrival and runs SET badge 0 when the user opens the inbox overview. What correctness bug does the lesson identify?",
    "answer": "A message that commits after the response was built but before the clear is silently dropped from the badge\n\nExplanation: SET 0 wipes arrivals that race with the response, so a message committed in that window never shows on the badge. The lesson explicitly separates the overview badge from thread read receipts, so the receipt option describes something this design deliberately does not do.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "newly-unread-indicator",
    "unitTitle": "Design: a newly-unread indicator"
  },
  {
    "id": "srs-quiz-newly-unread-indicator-c2",
    "type": "quiz",
    "prompt": "Sender maxima are dan 2010 and erin 2015. The server returns an overview with snapshot token 2015. While that response is in flight, frank sends at 2018 and dan sends again at 2021. The phone then acknowledges 2015, and later an old tablet acknowledges 2012. What is the badge?",
    "answer": "2, because frank and dan both have maxima above the boundary of 2015\n\nExplanation: The boundary becomes max(previous, 2015) = 2015, and the tablet's 2012 cannot lower it, so the count is senders whose maximum exceeds 2015: frank (2018) and dan (2021). Answering 1 forgets that dan's new message raises dan's maximum past the boundary even though dan was already seen.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "newly-unread-indicator",
    "unitTitle": "Design: a newly-unread indicator"
  },
  {
    "id": "srs-quiz-newly-unread-indicator-c3",
    "type": "quiz",
    "prompt": "The sender-maxima projector has processed messages up to position 1046, but the authoritative message log is already at 1049 when a user opens the overview. What should the badge service do?",
    "answer": "Merge the projected counts with a scan of source positions 1047 to 1049 before returning\n\nExplanation: The lesson says to merge the projected prefix with the unprocessed tail from the source log rather than presenting a stale cache value as exact. Returning the stale count is tempting because it is cheap, but it is presented as exact and silently misses arrivals, which is the very bug the design exists to prevent.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "newly-unread-indicator",
    "unitTitle": "Design: a newly-unread indicator"
  },
  {
    "id": "srs-takeaway-hashtag-extraction-and-tag-store-1",
    "type": "takeaway",
    "prompt": "In Hashtag extraction and tag store, what is a fundamental rule regarding: Hashtag extraction is done asynchronously via stream processing?",
    "answer": "Hashtag extraction is done asynchronously via stream processing.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hashtag-extraction-and-tag-store",
    "unitTitle": "Hashtag extraction and tag store"
  },
  {
    "id": "srs-takeaway-hashtag-extraction-and-tag-store-2",
    "type": "takeaway",
    "prompt": "In Hashtag extraction and tag store, what is a fundamental rule regarding: An Inverted Index is used to map hashtags to lists of content?",
    "answer": "An Inverted Index is used to map hashtags to lists of content.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hashtag-extraction-and-tag-store",
    "unitTitle": "Hashtag extraction and tag store"
  },
  {
    "id": "srs-takeaway-hashtag-extraction-and-tag-store-3",
    "type": "takeaway",
    "prompt": "In Hashtag extraction and tag store, what is a fundamental rule regarding: Trending algorithms prioritize velocity and sudden spikes over sheer total volume?",
    "answer": "Trending algorithms prioritize velocity and sudden spikes over sheer total volume.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hashtag-extraction-and-tag-store",
    "unitTitle": "Hashtag extraction and tag store"
  },
  {
    "id": "srs-quiz-hashtag-extraction-and-tag-store-c1",
    "type": "quiz",
    "prompt": "Why does the lesson partition the Cassandra tag index by (hashtag, time bucket, shard) instead of by hashtag alone?",
    "answer": "Partitioning by hashtag alone would create unbounded, hot partitions for popular tags\n\nExplanation: A popular or event tag would pile every posting into one ever-growing partition that also absorbs all the write heat; time buckets bound size and a shard suffix spreads writes. Relevance ranking and multi-term queries are what the lesson assigns to a search engine, not to a wide-column index.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hashtag-extraction-and-tag-store",
    "unitTitle": "Hashtag extraction and tag store"
  },
  {
    "id": "srs-quiz-hashtag-extraction-and-tag-store-c2",
    "type": "quiz",
    "prompt": "During a final, a tag receives 60,000 posts per minute. You adopt the lesson's key (tag, day, shard) with shard = hash(post_id) mod 16. What cost do you knowingly accept in exchange for spreading the writes?",
    "answer": "Reading the newest page must query all 16 shards and merge, unless a cached merged page is served\n\nExplanation: Hashing spreads the roughly 1,000 writes per second to about 62 per partition, but a reader wanting the newest posts must fetch from every shard and merge, which is why the lesson suggests caching a merged first page. Each post still lands on exactly one shard, so there is no 16-fold write amplification.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hashtag-extraction-and-tag-store",
    "unitTitle": "Hashtag extraction and tag store"
  },
  {
    "id": "srs-quiz-hashtag-extraction-and-tag-store-c3",
    "type": "quiz",
    "prompt": "You size a count-min sketch with epsilon = 0.0001 and delta = 0.01, and a trending window holds 20 million tag events. What are the approximate width and the maximum overcount (with probability 0.99)?",
    "answer": "Width about 27,183; overcount at most about 2,000\n\nExplanation: Width is ceil(e / epsilon) = ceil(2.71828 / 0.0001) = 27,183, and the error bound is epsilon x N = 0.0001 x 20M = 2,000 counts. The option with 200 applies the right width but slips a factor of ten on epsilon x N, which matters when you decide whether small tags can be ranked reliably.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "hashtag-extraction-and-tag-store",
    "unitTitle": "Hashtag extraction and tag store"
  },
  {
    "id": "srs-takeaway-reaction-modeling-1",
    "type": "takeaway",
    "prompt": "In Reaction modeling, what is a fundamental rule regarding: Reaction counts must be denormalized directly onto the post or content object?",
    "answer": "Reaction counts must be denormalized directly onto the post or content object.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reaction-modeling",
    "unitTitle": "Reaction modeling"
  },
  {
    "id": "srs-takeaway-reaction-modeling-2",
    "type": "takeaway",
    "prompt": "In Reaction modeling, what is a fundamental rule regarding: High-velocity reactions on viral posts cause database lock contention?",
    "answer": "High-velocity reactions on viral posts cause database lock contention.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reaction-modeling",
    "unitTitle": "Reaction modeling"
  },
  {
    "id": "srs-takeaway-reaction-modeling-3",
    "type": "takeaway",
    "prompt": "In Reaction modeling, what is a fundamental rule regarding: Use stream aggregation (buffering in Kafka) or Redis to batch database updates?",
    "answer": "Use stream aggregation (buffering in Kafka) or Redis to batch database updates.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reaction-modeling",
    "unitTitle": "Reaction modeling"
  },
  {
    "id": "srs-quiz-reaction-modeling-c1",
    "type": "quiz",
    "prompt": "In the lesson's reaction design, what is the durable source of truth from which like and love counts are derived?",
    "answer": "One durable record per (post, user) holding that user's current reaction\n\nExplanation: The (post, user) row is authoritative and counters are derived from its state transitions, which also answers \"did I like this?\". The counter columns are the tempting choice because feeds read them, but they are a derived summary that drifts and must be rebuildable from the per-user records.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reaction-modeling",
    "unitTitle": "Reaction modeling"
  },
  {
    "id": "srs-quiz-reaction-modeling-c2",
    "type": "quiz",
    "prompt": "A user taps Like, the client retries the same Like request because of a timeout, and then the user switches the reaction to Love. Under the lesson's upsert-plus-delta design, what net change is applied to the counters?",
    "answer": "Like 0, Love +1\n\nExplanation: The first tap emits like +1, the retry upserts the same row with no state change and emits nothing, and like to love emits like -1 and love +1, netting like 0 and love +1. Like +2 is what naive per-click increments would produce, the double counting the design is built to avoid.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reaction-modeling",
    "unitTitle": "Reaction modeling"
  },
  {
    "id": "srs-quiz-reaction-modeling-c3",
    "type": "quiz",
    "prompt": "You use Redis INCR with periodic flushes to the database. A Redis primary fails over to an asynchronously replicated replica that is missing the last few seconds of increments. Which mechanism from the lesson restores correct counts?",
    "answer": "A periodic job that recounts reactions rows for recently active posts and corrects the counters\n\nExplanation: Because the (post, user) rows are the source of truth, a reconciliation job can recount them and fix counter drift after any loss. Sharding counters reduces contention, but lost increments on those shards would still be lost, so it does not restore correctness on its own.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "reaction-modeling",
    "unitTitle": "Reaction modeling"
  },
  {
    "id": "srs-takeaway-photo-tagging-coordinate-model-1",
    "type": "takeaway",
    "prompt": "In Design: photo tagging coordinates, what is a fundamental rule regarding: Store image coordinates as relative percentages, not absolute pixels?",
    "answer": "Store image coordinates as relative percentages, not absolute pixels.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "photo-tagging-coordinate-model",
    "unitTitle": "Design: photo tagging coordinates"
  },
  {
    "id": "srs-takeaway-photo-tagging-coordinate-model-2",
    "type": "takeaway",
    "prompt": "In Design: photo tagging coordinates, what is a fundamental rule regarding: Tags involve complex privacy and permission workflows?",
    "answer": "Tags involve complex privacy and permission workflows.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "photo-tagging-coordinate-model",
    "unitTitle": "Design: photo tagging coordinates"
  },
  {
    "id": "srs-takeaway-photo-tagging-coordinate-model-3",
    "type": "takeaway",
    "prompt": "In Design: photo tagging coordinates, what is a fundamental rule regarding: The social fan-out resulting from a tag should be handled asynchronously?",
    "answer": "The social fan-out resulting from a tag should be handled asynchronously.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "photo-tagging-coordinate-model",
    "unitTitle": "Design: photo tagging coordinates"
  },
  {
    "id": "srs-quiz-photo-tagging-coordinate-model-c1",
    "type": "quiz",
    "prompt": "Why does the lesson store a tag as a normalized point (u, v) tied to an immutable image version rather than as pixel coordinates?",
    "answer": "Fractions of a fixed image version map correctly to any rendered size, while pixels break across devices\n\nExplanation: The client multiplies u and v by the rendered dimensions, so the tag lands correctly on any screen as long as the image version is fixed. Orientation still matters: the lesson measures u and v on the orientation-corrected canonical image, so skipping EXIF handling would misplace tags.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "photo-tagging-coordinate-model",
    "unitTitle": "Design: photo tagging coordinates"
  },
  {
    "id": "srs-quiz-photo-tagging-coordinate-model-c2",
    "type": "quiz",
    "prompt": "The canonical image is 4000 x 3000 pixels and a tag is stored at u = 0.25, v = 0.5. A square center-crop thumbnail uses a 3000 x 3000 crop. What is the tag's horizontal position u' within the crop?",
    "answer": "About 0.167\n\nExplanation: The tag is at pixel x = 0.25 x 4000 = 1000, the crop starts at x offset 500, so u' = (1000 - 500) / 3000 = 0.167. Keeping 0.25 is the tempting error: normalized coordinates survive resizing, not cropping, which needs the same transform used to draw the image.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "photo-tagging-coordinate-model",
    "unitTitle": "Design: photo tagging coordinates"
  },
  {
    "id": "srs-quiz-photo-tagging-coordinate-model-c3",
    "type": "quiz",
    "prompt": "The owner of a photo with ten existing tags rotates it 90 degrees and trims the edges. What does the lesson's recommended representation do?",
    "answer": "Create a new immutable version with its recorded crop and rotation, and re-validate tags against it\n\nExplanation: Normalized coordinates on an immutable version survive crop or rotation via the version's recorded transform, and edits create a new version whose tags are re-validated. Keeping tags as-is on an overwritten image is the classic bug: a rotated image puts the same (u, v) on a different face.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "photo-tagging-coordinate-model",
    "unitTitle": "Design: photo tagging coordinates"
  },
  {
    "id": "srs-takeaway-live-commentary-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: live commentary, what is a fundamental rule regarding: Live fanout can use an in-memory path for low latency, while durable source positions support reconnect, moderation, and replay?",
    "answer": "Live fanout can use an in-memory path for low latency, while durable source positions support reconnect, moderation, and replay.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-commentary-system-design",
    "unitTitle": "Design: live commentary"
  },
  {
    "id": "srs-takeaway-live-commentary-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: live commentary, what is a fundamental rule regarding: Use Pub/Sub and WebSocket fan-out for sub-second latency?",
    "answer": "Use Pub/Sub and WebSocket fan-out for sub-second latency.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-commentary-system-design",
    "unitTitle": "Design: live commentary"
  },
  {
    "id": "srs-takeaway-live-commentary-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: live commentary, what is a fundamental rule regarding: At unreadable rates, apply an explicit server/client coalescing or sampling policy and preserve moderation and durable-history requirements separately?",
    "answer": "At unreadable rates, apply an explicit server/client coalescing or sampling policy and preserve moderation and durable-history requirements separately.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-commentary-system-design",
    "unitTitle": "Design: live commentary"
  },
  {
    "id": "srs-quiz-live-commentary-system-design-c1",
    "type": "quiz",
    "prompt": "In the lesson's live commentary design, how are chat messages persisted for later VOD replay without slowing the live experience?",
    "answer": "Messages are also sent to Kafka, and background consumers batch-write them to cold storage\n\nExplanation: Live traffic is served from memory through pub/sub, while a parallel Kafka path lets consumers batch-write to a store such as Cassandra. Writing synchronously before pushing puts disk I/O on the hot path, the exact coupling the design removes.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-commentary-system-design",
    "unitTitle": "Design: live commentary"
  },
  {
    "id": "srs-quiz-live-commentary-system-design-c2",
    "type": "quiz",
    "prompt": "A stream has 1,000,000 viewers spread over 400 edge servers. Each edge flushes a batched frame to each viewer every 250 ms. How many frames per second does each edge server send?",
    "answer": "About 10,000 frames per second\n\nExplanation: Each server holds 1,000,000 / 400 = 2,500 viewers, and a 250 ms flush is 4 frames per viewer per second, so 10,000 frames per second. The 2,500 option counts viewers rather than frames and forgets that batching still sends several frames per second to each.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-commentary-system-design",
    "unitTitle": "Design: live commentary"
  },
  {
    "id": "srs-quiz-live-commentary-system-design-c3",
    "type": "quiz",
    "prompt": "You build the live pub/sub layer on a 30-node Redis Cluster using classic PUBLISH. As more hot streams go live, every node's network usage climbs, not just the nodes serving those streams. What explains it and what does the lesson suggest?",
    "answer": "Classic cluster PUBLISH is broadcast to every node; use Redis 7 sharded pub/sub (SPUBLISH) so a channel stays on its shard\n\nExplanation: In classic Redis Cluster a PUBLISH is propagated to all nodes, so total traffic grows with nodes times messages; sharded pub/sub keeps each channel's traffic on its own shard. Rebalancing hash slots does not help because classic pub/sub channels are not confined to slots in the first place.",
    "category": "Real-Time Messaging & Feed Architectures",
    "track": "Asynchronous Execution, Queues & Real-Time Processing",
    "topicSlug": "live-commentary-system-design",
    "unitTitle": "Design: live commentary"
  },
  {
    "id": "srs-takeaway-observability-for-distributed-systems-1",
    "type": "takeaway",
    "prompt": "In Observability for distributed systems, what is a fundamental rule regarding: Combine Metrics (alerting), Logs (context), and Distributed Tracing (cross-service latency diagnosis)?",
    "answer": "Combine Metrics (alerting), Logs (context), and Distributed Tracing (cross-service latency diagnosis).",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "observability-for-distributed-systems",
    "unitTitle": "Observability for distributed systems"
  },
  {
    "id": "srs-takeaway-observability-for-distributed-systems-2",
    "type": "takeaway",
    "prompt": "In Observability for distributed systems, what is a fundamental rule regarding: Standardize telemetry collection across languages using OpenTelemetry (OTel)?",
    "answer": "Standardize telemetry collection across languages using OpenTelemetry (OTel).",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "observability-for-distributed-systems",
    "unitTitle": "Observability for distributed systems"
  },
  {
    "id": "srs-takeaway-observability-for-distributed-systems-3",
    "type": "takeaway",
    "prompt": "In Observability for distributed systems, what is a fundamental rule regarding: Monitor the Four Golden Signals?",
    "answer": "Monitor the Four Golden Signals: Latency, Traffic, Errors, and Saturation.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "observability-for-distributed-systems",
    "unitTitle": "Observability for distributed systems"
  },
  {
    "id": "srs-quiz-observability-for-distributed-systems-c1",
    "type": "quiz",
    "prompt": "A service's p99 latency and error rate both look normal, but its worker thread pool is 97% busy and the request queue is growing every minute. Which golden signal is warning you before users notice?",
    "answer": "Saturation, because the most constrained resource is nearly full\n\nExplanation: Saturation measures how close the most constrained resource (here the thread pool) is to its limit, and it is the leading indicator before latency and errors degrade. Latency is tempting, but it is still normal; it is the lagging symptom that saturation predicts.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "observability-for-distributed-systems",
    "unitTitle": "Observability for distributed systems"
  },
  {
    "id": "srs-quiz-observability-for-distributed-systems-c2",
    "type": "quiz",
    "prompt": "A latency histogram has 12 buckets and labels endpoint (40 values), status_class (5) and region (3), giving 7,200 series. An engineer adds a pod label with 60 values. Roughly how many series does the metric now produce?",
    "answer": "About 432,000, since every label value multiplies the total\n\nExplanation: Series count is the product of all label value counts and buckets, so 7,200 x 60 = 432,000. Treating a new label as additive (7,260) is the common mistake, and it is exactly why identifiers like customer_id belong in logs and trace attributes instead of metric labels.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "observability-for-distributed-systems",
    "unitTitle": "Observability for distributed systems"
  },
  {
    "id": "srs-quiz-observability-for-distributed-systems-c3",
    "type": "quiz",
    "prompt": "During a cluster-wide memory incident, the Prometheus server running inside the same Kubernetes cluster was OOM-killed, and no alerts fired for 40 minutes. Which change most directly prevents a repeat?",
    "answer": "Run alerting on independent infrastructure with an always-firing heartbeat alert\n\nExplanation: The monitoring system failed together with what it monitored, so the fix is independent alerting plus a dead man's switch that pages when the heartbeat stops arriving. More rules or faster scrapes in the same Prometheus still die with it.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "observability-for-distributed-systems",
    "unitTitle": "Observability for distributed systems"
  },
  {
    "id": "srs-takeaway-slos-and-error-budgets-1",
    "type": "takeaway",
    "prompt": "In SLOs and error budgets, what is a fundamental rule regarding: SLIs measure, SLOs set targets, and SLAs impose commercial consequences?",
    "answer": "SLIs measure, SLOs set targets, and SLAs impose commercial consequences.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "slos-and-error-budgets",
    "unitTitle": "SLOs and error budgets"
  },
  {
    "id": "srs-takeaway-slos-and-error-budgets-2",
    "type": "takeaway",
    "prompt": "In SLOs and error budgets, what is a fundamental rule regarding: 100% uptime is never the goal; error budgets balance feature velocity against stability?",
    "answer": "100% uptime is never the goal; error budgets balance feature velocity against stability.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "slos-and-error-budgets",
    "unitTitle": "SLOs and error budgets"
  },
  {
    "id": "srs-takeaway-slos-and-error-budgets-3",
    "type": "takeaway",
    "prompt": "In SLOs and error budgets, what is a fundamental rule regarding: When the error budget burns too fast, enforce deployment freezes to protect user trust?",
    "answer": "When the error budget burns too fast, enforce deployment freezes to protect user trust.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "slos-and-error-budgets",
    "unitTitle": "SLOs and error budgets"
  },
  {
    "id": "srs-quiz-slos-and-error-budgets-c1",
    "type": "quiz",
    "prompt": "Your contract promises customers 99.9% monthly availability with service credits below that. How should the internal SLO relate to this SLA?",
    "answer": "Set it stricter, such as 99.95%, so you react before penalties apply\n\nExplanation: A stricter internal SLO gives a margin: you burn through internal budget and change behaviour before customers are owed credits. Setting it equal to the SLA means the first time you notice trouble is the moment it already costs money.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "slos-and-error-budgets",
    "unitTitle": "SLOs and error budgets"
  },
  {
    "id": "srs-quiz-slos-and-error-budgets-c2",
    "type": "quiz",
    "prompt": "A service has a 99.5% SLO over 30 days. Using the 14.4x burn-rate page (1-hour long window, 5-minute short window), what 1-hour error ratio triggers the page?",
    "answer": "Above 7.2%, which is 14.4 times the 0.5% error budget\n\nExplanation: The threshold is burn rate times the budget fraction: 14.4 x 0.5% = 7.2%. Reusing 1.44% is tempting, but that value is specific to a 99.9% SLO with its 0.1% budget.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "slos-and-error-budgets",
    "unitTitle": "SLOs and error budgets"
  },
  {
    "id": "srs-quiz-slos-and-error-budgets-c3",
    "type": "quiz",
    "prompt": "An internal admin API gets about 100 requests per hour and has a 99.9% SLO with standard burn-rate alerts. On-call gets paged whenever a single request fails. What is the best fix?",
    "answer": "Use longer windows, add synthetic probes, or fold it into a combined SLO\n\nExplanation: At 100 requests per hour one failure is 1% of the hour, so the ratio is too noisy to judge on short windows. The lesson's remedies are longer windows, synthetic traffic, or aggregating services. Tweaking the multiplier or loosening the SLO hides the problem and also hides real outages.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "slos-and-error-budgets",
    "unitTitle": "SLOs and error budgets"
  },
  {
    "id": "srs-takeaway-incident-response-1",
    "type": "takeaway",
    "prompt": "In Incident response, what is a fundamental rule regarding: Establish strict incident roles?",
    "answer": "Establish strict incident roles: Incident Commander, Operations Lead, and Communications Lead.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "incident-response",
    "unitTitle": "Incident response"
  },
  {
    "id": "srs-takeaway-incident-response-2",
    "type": "takeaway",
    "prompt": "In Incident response, what is a fundamental rule regarding: Prioritize fast mitigation (rollback, traffic drain) over debugging root cause in the middle of an active outage?",
    "answer": "Prioritize fast mitigation (rollback, traffic drain) over debugging root cause in the middle of an active outage.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "incident-response",
    "unitTitle": "Incident response"
  },
  {
    "id": "srs-takeaway-incident-response-3",
    "type": "takeaway",
    "prompt": "In Incident response, what is a fundamental rule regarding: Conduct blameless post-mortems to discover systemic vulnerabilities and prevent repeat incidents?",
    "answer": "Conduct blameless post-mortems to discover systemic vulnerabilities and prevent repeat incidents.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "incident-response",
    "unitTitle": "Incident response"
  },
  {
    "id": "srs-quiz-incident-response-c1",
    "type": "quiz",
    "prompt": "In a SEV1, the ops lead proposes rolling back a deploy while the comms lead is drafting a status update. Who has final authority to approve the rollback?",
    "answer": "The incident commander, because they own mitigation decisions\n\nExplanation: The IC owns the incident and has final say on mitigations such as rollback or failover, while the ops lead executes. Letting the ops lead decide seems natural, but it collapses coordination and hands-on work into one person, which the role split is designed to avoid.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "incident-response",
    "unitTitle": "Incident response"
  },
  {
    "id": "srs-quiz-incident-response-c2",
    "type": "quiz",
    "prompt": "A deploy ships at 09:40. The burn-rate alert pages at 09:47, the IC is appointed at 09:50, rollback is approved at 09:58, and errors return to baseline at 10:05. Using the lesson's definitions, what are time to detect and time to mitigate?",
    "answer": "Detect 7 minutes and mitigate 18 minutes, counted from the page\n\nExplanation: Detection runs from the triggering change to the page (09:40 to 09:47), and mitigation from the page to errors at baseline (09:47 to 10:05), matching the lesson's 4 and 17 minute example. Measuring mitigation from the deploy double-counts the detection time.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "incident-response",
    "unitTitle": "Incident response"
  },
  {
    "id": "srs-quiz-incident-response-c3",
    "type": "quiz",
    "prompt": "A draft postmortem says: root cause, engineer renamed a config key in one service but not the other; action item, remind engineers to be careful. Which revision best matches the lesson?",
    "answer": "List contributing factors such as no schema check in CI and a canary that ignored 5xx, each with an owner and due date\n\nExplanation: Blameless reviews ask why the system allowed one mistake to cause an outage and produce owned, dated guardrails such as CI schema validation and canary gates. Blanket two-person review sounds rigorous but still treats the person as the fault and does not fix the missing automated checks.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "incident-response",
    "unitTitle": "Incident response"
  },
  {
    "id": "srs-takeaway-deployment-and-migration-safety-1",
    "type": "takeaway",
    "prompt": "In Deployment and migration safety, what is a fundamental rule regarding: Use Canary deployments with automated metric verification to minimize outage blast radius?",
    "answer": "Use Canary deployments with automated metric verification to minimize outage blast radius.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "deployment-and-migration-safety",
    "unitTitle": "Deployment and migration safety"
  },
  {
    "id": "srs-takeaway-deployment-and-migration-safety-2",
    "type": "takeaway",
    "prompt": "In Deployment and migration safety, what is a fundamental rule regarding: Decouple code deployment from feature release using Feature Flags?",
    "answer": "Decouple code deployment from feature release using Feature Flags.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "deployment-and-migration-safety",
    "unitTitle": "Deployment and migration safety"
  },
  {
    "id": "srs-takeaway-deployment-and-migration-safety-3",
    "type": "takeaway",
    "prompt": "In Deployment and migration safety, what is a fundamental rule regarding: Blue-Green deployments provide instantaneous rollback capability at the cost of duplicate infrastructure?",
    "answer": "Blue-Green deployments provide instantaneous rollback capability at the cost of duplicate infrastructure.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "deployment-and-migration-safety",
    "unitTitle": "Deployment and migration safety"
  },
  {
    "id": "srs-quiz-deployment-and-migration-safety-c1",
    "type": "quiz",
    "prompt": "Which deployment strategy needs roughly double the fleet capacity, exposes all traffic at the moment of the switch, and can roll back in seconds by flipping the router?",
    "answer": "Blue-green deployment\n\nExplanation: Blue-green keeps two full fleets and moves all traffic at once, so rollback is fast but the blast radius at the switch is everything. A canary also rolls back in seconds, but it only exposes the canary percentage and needs little extra capacity.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "deployment-and-migration-safety",
    "unitTitle": "Deployment and migration safety"
  },
  {
    "id": "srs-quiz-deployment-and-migration-safety-c2",
    "type": "quiz",
    "prompt": "A fleet serves 10,000 requests per second with a 0.1% baseline 5xx rate. A 1% canary bakes for 10 minutes, and the new build actually fails 0.11% of requests. What should the automated analysis conclude?",
    "answer": "About 66 errors against 60, inside noise, so bake longer or widen the canary\n\nExplanation: The canary gets 100 requests per second, so 60,000 requests in 10 minutes: about 60 errors expected against about 66 observed, which is within normal variation. Promoting on that evidence is the tempting mistake; the lesson's answer is more samples, a longer bake or a more sensitive signal such as latency percentiles.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "deployment-and-migration-safety",
    "unitTitle": "Deployment and migration safety"
  },
  {
    "id": "srs-quiz-deployment-and-migration-safety-c3",
    "type": "quiz",
    "prompt": "Release N+1 starts writing a new enum value into a shared queue. Its canary looks healthy, but after a rollback for an unrelated bug, version N consumers crash on the messages already in the queue. What practice would have prevented this?",
    "answer": "Ship readers that tolerate the new value one release before any writer emits it\n\nExplanation: Versions N and N+1 coexist during deploys and rollbacks, so formats must be added before they are used: first deploy code that can read the value, then start writing it. A faster rollback does not help, because the incompatible data is already in the queue.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "deployment-and-migration-safety",
    "unitTitle": "Deployment and migration safety"
  },
  {
    "id": "srs-takeaway-database-migration-safety-1",
    "type": "takeaway",
    "prompt": "In Database migration safety, what is a fundamental rule regarding: Never execute breaking schema modifications in a single step on live production databases?",
    "answer": "Never execute breaking schema modifications in a single step on live production databases.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-migration-safety",
    "unitTitle": "Database migration safety"
  },
  {
    "id": "srs-takeaway-database-migration-safety-2",
    "type": "takeaway",
    "prompt": "In Database migration safety, what is a fundamental rule regarding: Follow the Expand and Contract pattern across separate application deployment cycles?",
    "answer": "Follow the Expand and Contract pattern across separate application deployment cycles.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-migration-safety",
    "unitTitle": "Database migration safety"
  },
  {
    "id": "srs-takeaway-database-migration-safety-3",
    "type": "takeaway",
    "prompt": "In Database migration safety, what is a fundamental rule regarding: Verify dual-write correctness with automated shadow verification before cutting over reads?",
    "answer": "Verify dual-write correctness with automated shadow verification before cutting over reads.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-migration-safety",
    "unitTitle": "Database migration safety"
  },
  {
    "id": "srs-quiz-database-migration-safety-c1",
    "type": "quiz",
    "prompt": "In the switch-read phase of expand and contract, the application reads the new column but keeps writing to both columns. Why keep the old writes going at this stage?",
    "answer": "So rolling back to the previous release, which reads the old column, stays safe\n\nExplanation: Dual writing after the read switch keeps the old column current, so reverting to the release that reads it loses nothing. The backfill has already finished before reads switch, so it is not the reason; dropping the column in the same release is exactly what the pattern forbids.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-migration-safety",
    "unitTitle": "Database migration safety"
  },
  {
    "id": "srs-quiz-database-migration-safety-c2",
    "type": "quiz",
    "prompt": "You must backfill 900 million rows. Each batch updates 10,000 rows in its own transaction, and the job runs one batch every 200 ms. Ignoring throttling, roughly how long will the backfill take?",
    "answer": "About 5 hours\n\nExplanation: 10,000 rows every 0.2 s is 50,000 rows per second, and 900,000,000 / 50,000 = 18,000 s, or 5 hours. Getting 2.5 hours comes from counting five batches per second as ten; in practice replica-lag throttling will stretch the real run further.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-migration-safety",
    "unitTitle": "Database migration safety"
  },
  {
    "id": "srs-quiz-database-migration-safety-c3",
    "type": "quiz",
    "prompt": "On PostgreSQL 15 you run ALTER TABLE orders ADD COLUMN note text, a metadata-only change. The site nevertheless stalls for four minutes. What is the most likely cause and fix?",
    "answer": "The ALTER waited behind a long transaction and queued all queries behind it; set a short lock_timeout and retry\n\nExplanation: Even instant DDL needs a brief exclusive lock; if a long-running transaction holds a conflicting lock, the ALTER waits and every new query queues behind it. Setting lock_timeout makes it fail fast and retry. Adding a nullable column without a default does not rewrite the table, so the rewrite explanation is wrong.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-migration-safety",
    "unitTitle": "Database migration safety"
  },
  {
    "id": "srs-takeaway-parallel-monolith-read-drain-1",
    "type": "takeaway",
    "prompt": "In Parallel monolith read drain, what is a fundamental rule regarding: Use shadow traffic (dark launching) to stress-test extracted microservices with real production loads?",
    "answer": "Use shadow traffic (dark launching) to stress-test extracted microservices with real production loads.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "parallel-monolith-read-drain",
    "unitTitle": "Parallel monolith read drain"
  },
  {
    "id": "srs-takeaway-parallel-monolith-read-drain-2",
    "type": "takeaway",
    "prompt": "In Parallel monolith read drain, what is a fundamental rule regarding: Compare response payloads between legacy and new services automatically to catch subtle edge-case bugs?",
    "answer": "Compare response payloads between legacy and new services automatically to catch subtle edge-case bugs.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "parallel-monolith-read-drain",
    "unitTitle": "Parallel monolith read drain"
  },
  {
    "id": "srs-takeaway-parallel-monolith-read-drain-3",
    "type": "takeaway",
    "prompt": "In Parallel monolith read drain, what is a fundamental rule regarding: Gradually drain reads using percentage-based gateway traffic splits?",
    "answer": "Gradually drain reads using percentage-based gateway traffic splits.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "parallel-monolith-read-drain",
    "unitTitle": "Parallel monolith read drain"
  },
  {
    "id": "srs-quiz-parallel-monolith-read-drain-c1",
    "type": "quiz",
    "prompt": "You are mirroring gateway traffic from the monolith to a new orders service that shares the production database. Which endpoint is unsafe to shadow as-is?",
    "answer": "POST /orders/{id}/refund, which issues a refund\n\nExplanation: Shadowing duplicates the request, so a non-idempotent write such as a refund would execute twice. Reads are safe to mirror; the listing endpoint may be expensive, but duplicating it does not change any data.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "parallel-monolith-read-drain",
    "unitTitle": "Parallel monolith read drain"
  },
  {
    "id": "srs-quiz-parallel-monolith-read-drain-c2",
    "type": "quiz",
    "prompt": "A 24-hour shadow run finds 41,000 mismatches: 28,000 in updated_at precision, 12,500 in currency rounding on discounted orders, and 500 read-after-write races against a lagging replica. Which group must be fixed in the new service before cutover?",
    "answer": "The currency rounding group, because it is a real correctness bug\n\nExplanation: Rounding differences on discounted orders change what users are charged or shown, so that is a genuine bug. The precision group is the largest but harmless and should be normalised in the comparator, and the races are comparison artefacts handled by delayed re-comparison.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "parallel-monolith-read-drain",
    "unitTitle": "Parallel monolith read drain"
  },
  {
    "id": "srs-quiz-parallel-monolith-read-drain-c3",
    "type": "quiz",
    "prompt": "Two weeks after the new service took 100% of gateway traffic, the monolith's /orders handler still receives about 3 requests per second. What should the team do next?",
    "answer": "Find the remaining callers, such as cron jobs or old app versions, and move them first\n\nExplanation: The drain is only done when the request counter stays at zero, and residual traffic usually comes from forgotten internal callers, scheduled jobs or old mobile clients. Deleting now breaks them silently; keeping it forever means the migration never finishes and the old code keeps costing maintenance.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "parallel-monolith-read-drain",
    "unitTitle": "Parallel monolith read drain"
  },
  {
    "id": "srs-takeaway-database-backups-and-restore-1",
    "type": "takeaway",
    "prompt": "In Backups and restore, what is a fundamental rule regarding: Nightly dumps are insufficient; implement Point-in-Time Recovery (PITR) via continuous WAL archiving?",
    "answer": "Nightly dumps are insufficient; implement Point-in-Time Recovery (PITR) via continuous WAL archiving.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-backups-and-restore",
    "unitTitle": "Backups and restore"
  },
  {
    "id": "srs-takeaway-database-backups-and-restore-2",
    "type": "takeaway",
    "prompt": "In Backups and restore, what is a fundamental rule regarding: An untested backup is not a backup; run automated weekly restore verification drills?",
    "answer": "An untested backup is not a backup; run automated weekly restore verification drills.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-backups-and-restore",
    "unitTitle": "Backups and restore"
  },
  {
    "id": "srs-takeaway-database-backups-and-restore-3",
    "type": "takeaway",
    "prompt": "In Backups and restore, what is a fundamental rule regarding: Store backups in a separate, isolated cloud account with immutable Object Lock (WORM) enabled?",
    "answer": "Store backups in a separate, isolated cloud account with immutable Object Lock (WORM) enabled.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-backups-and-restore",
    "unitTitle": "Backups and restore"
  },
  {
    "id": "srs-quiz-database-backups-and-restore-c1",
    "type": "quiz",
    "prompt": "An accidental DELETE ran at 14:02:15. An engineer plans to set recovery_target_time = '14:02:15'. What is the main risk, and what is the more precise approach?",
    "answer": "Timestamps may include or exclude the wrong commits; target the bad transaction's XID or LSN with inclusive set to false\n\nExplanation: Several transactions may commit within the same second, so a timestamp target can replay the DELETE or drop good work. Finding the exact XID or LSN with pg_waldump and using recovery_target_inclusive = false stops just before it. A streaming replica is no help because it already applied the DELETE.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-backups-and-restore",
    "unitTitle": "Backups and restore"
  },
  {
    "id": "srs-quiz-database-backups-and-restore-c2",
    "type": "quiz",
    "prompt": "A team says they need no backups because they run two synchronous streaming replicas in different zones. What failure are they unprotected against?",
    "answer": "A mistaken DROP TABLE that is replicated within milliseconds\n\nExplanation: Replicas copy every change, including deletes and corruption, almost immediately, so they protect against hardware and zone failure but not against mistakes. Disk and zone failure are precisely what replicas do cover, which is why teams mistake them for backups.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-backups-and-restore",
    "unitTitle": "Backups and restore"
  },
  {
    "id": "srs-quiz-database-backups-and-restore-c3",
    "type": "quiz",
    "prompt": "A 4 TB database has a base backup at 00:00 and generates 20 GB of WAL per hour. A bad write happens at 18:00. Restore runs at about 500 MB/s and WAL replay at about 100 MB/s. Roughly how long do restore plus replay take, before detection and validation?",
    "answer": "About 3.2 hours, roughly 2.2 hours restore and 1 hour replay\n\nExplanation: 4 TB at 500 MB/s is about 8,000 s (2.2 hours), and 18 hours x 20 GB = 360 GB at 100 MB/s is 3,600 s (1 hour). Replay only covers WAL since the base backup, not a full day, and it cannot start until the base copy is in place.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "database-backups-and-restore",
    "unitTitle": "Backups and restore"
  },
  {
    "id": "srs-takeaway-disaster-recovery-1",
    "type": "takeaway",
    "prompt": "In Disaster recovery, what is a fundamental rule regarding: RPO defines allowable data loss; RTO defines allowable downtime duration?",
    "answer": "RPO defines allowable data loss; RTO defines allowable downtime duration.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "disaster-recovery",
    "unitTitle": "Disaster recovery"
  },
  {
    "id": "srs-takeaway-disaster-recovery-2",
    "type": "takeaway",
    "prompt": "In Disaster recovery, what is a fundamental rule regarding: Active-Active provides the lowest RTO but requires distributed data replication strategies?",
    "answer": "Active-Active provides the lowest RTO but requires distributed data replication strategies.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "disaster-recovery",
    "unitTitle": "Disaster recovery"
  },
  {
    "id": "srs-takeaway-disaster-recovery-3",
    "type": "takeaway",
    "prompt": "In Disaster recovery, what is a fundamental rule regarding: Conduct regular Chaos Engineering exercises (like Chaos Monkey) to validate failover automation?",
    "answer": "Conduct regular Chaos Engineering exercises (like Chaos Monkey) to validate failover automation.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "disaster-recovery",
    "unitTitle": "Disaster recovery"
  },
  {
    "id": "srs-quiz-disaster-recovery-c1",
    "type": "quiz",
    "prompt": "The business says: we can lose at most the last 5 minutes of orders, and the shop must be taking orders again within 1 hour. How do these map to recovery objectives?",
    "answer": "RPO is 5 minutes and RTO is 1 hour\n\nExplanation: RPO is the acceptable data loss (the age of the newest data you may lose), and RTO is the acceptable downtime. Swapping them is the classic mix-up, and it leads to buying the wrong architecture.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "disaster-recovery",
    "unitTitle": "Disaster recovery"
  },
  {
    "id": "srs-quiz-disaster-recovery-c2",
    "type": "quiz",
    "prompt": "A warm-standby design uses asynchronous replication with up to 10 s of lag at peak. The payments team now demands an RPO of zero across a regional failure. What does that require, and what does it cost?",
    "answer": "Synchronous cross-region replication or a consensus database, adding tens of ms per write\n\nExplanation: With async replication, anything inside the lag window is lost on failover; zero RPO means a write is acknowledged only after another region has it, which costs a cross-region round trip per write. Detection, DNS and scaling changes reduce RTO but do nothing for data already committed only in the failed region.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "disaster-recovery",
    "unitTitle": "Disaster recovery"
  },
  {
    "id": "srs-quiz-disaster-recovery-c3",
    "type": "quiz",
    "prompt": "After failing over to the standby region, the old primary recovers and some application servers with stale config start writing to it again. Which control is designed to stop this?",
    "answer": "Fencing with a lease or quorum, so the old primary can no longer accept writes\n\nExplanation: Split brain is two nodes both acting as primary; fencing revokes the old primary's right to accept writes so conflicting histories cannot form. A shorter TTL narrows the window but does not stop a server with stale config or cached connections from writing.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "disaster-recovery",
    "unitTitle": "Disaster recovery"
  },
  {
    "id": "srs-takeaway-data-retention-and-deletion-1",
    "type": "takeaway",
    "prompt": "In Data retention, deletion, and privacy, what is a fundamental rule regarding: In distributed wide-column and LSM storage, deletes write Tombstones; premature tombstone cleanup causes catastrophic data resurrection?",
    "answer": "In distributed wide-column and LSM storage, deletes write Tombstones; premature tombstone cleanup causes catastrophic data resurrection.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "data-retention-and-deletion",
    "unitTitle": "Data retention, deletion, and privacy"
  },
  {
    "id": "srs-takeaway-data-retention-and-deletion-2",
    "type": "takeaway",
    "prompt": "In Data retention, deletion, and privacy, what is a fundamental rule regarding: Use Cryptographic Shredding (destroying per-user KMS encryption keys) to achieve instant GDPR erasure across immutable cold backups?",
    "answer": "Use Cryptographic Shredding (destroying per-user KMS encryption keys) to achieve instant GDPR erasure across immutable cold backups.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "data-retention-and-deletion",
    "unitTitle": "Data retention, deletion, and privacy"
  },
  {
    "id": "srs-takeaway-data-retention-and-deletion-3",
    "type": "takeaway",
    "prompt": "In Data retention, deletion, and privacy, what is a fundamental rule regarding: Partition time-series audit tables by month or day so aging data can be dropped instantly via DROP TABLE instead of heavy DELETE scans?",
    "answer": "Partition time-series audit tables by month or day so aging data can be dropped instantly via DROP TABLE instead of heavy DELETE scans.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "data-retention-and-deletion",
    "unitTitle": "Data retention, deletion, and privacy"
  },
  {
    "id": "srs-quiz-data-retention-and-deletion-c1",
    "type": "quiz",
    "prompt": "A Cassandra node was offline for 14 days. gc_grace_seconds is 10 days, and deletes happened while it was down. It rejoins and repair runs. What is the risk?",
    "answer": "Deleted rows come back, because the tombstones were already purged elsewhere\n\nExplanation: Once tombstones are garbage-collected after gc_grace_seconds, the returning node's old copies look like valid data and repair spreads them back. That is why repairs must complete within the grace period. Deletes are idempotent, so double application is not the risk.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "data-retention-and-deletion",
    "unitTitle": "Data retention, deletion, and privacy"
  },
  {
    "id": "srs-quiz-data-retention-and-deletion-c2",
    "type": "quiz",
    "prompt": "Session records in DynamoDB carry a TTL attribute set to expiry time. Users report that some sessions still work hours after they should have expired. What is the correct fix?",
    "answer": "Treat TTL as cleanup only and reject expired items when reading\n\nExplanation: DynamoDB TTL deletes are asynchronous and can lag expiry by days, so correctness must come from checking the expiry on read. Shortening the TTL would expire valid sessions early and still not make deletion timely, and a full scan every minute is expensive.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "data-retention-and-deletion",
    "unitTitle": "Data retention, deletion, and privacy"
  },
  {
    "id": "srs-quiz-data-retention-and-deletion-c3",
    "type": "quiz",
    "prompt": "The data-warehouse handler runs an Iceberg row-level DELETE for a user and reports success. Why might the user's data still be recoverable, and what completes the erasure?",
    "answer": "Older table snapshots still reference the data; compact and expire those snapshots\n\nExplanation: Table formats keep prior snapshots for time travel, so the original data files remain until compaction rewrites them and snapshot expiry removes the old ones. The handler must not report completion until then; the delete itself is visible to all engines once committed.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "data-retention-and-deletion",
    "unitTitle": "Data retention, deletion, and privacy"
  },
  {
    "id": "srs-takeaway-security-and-abuse-prevention-1",
    "type": "takeaway",
    "prompt": "In Security and abuse prevention, what is a fundamental rule regarding: Zero Trust architecture requires authenticating and encrypting every hop; never trust internal datacenter network traffic?",
    "answer": "Zero Trust architecture requires authenticating and encrypting every hop; never trust internal datacenter network traffic.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "security-and-abuse-prevention",
    "unitTitle": "Security and abuse prevention"
  },
  {
    "id": "srs-takeaway-security-and-abuse-prevention-2",
    "type": "takeaway",
    "prompt": "In Security and abuse prevention, what is a fundamental rule regarding: Protect authentication endpoints using behavioral fingerprinting (JA3 TLS signatures) and composite rate limiting?",
    "answer": "Protect authentication endpoints using behavioral fingerprinting (JA3 TLS signatures) and composite rate limiting.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "security-and-abuse-prevention",
    "unitTitle": "Security and abuse prevention"
  },
  {
    "id": "srs-takeaway-security-and-abuse-prevention-3",
    "type": "takeaway",
    "prompt": "In Security and abuse prevention, what is a fundamental rule regarding: Enforce Envelope Encryption with KMS-backed Hardware Security Modules to protect customer data at rest?",
    "answer": "Enforce Envelope Encryption with KMS-backed Hardware Security Modules to protect customer data at rest.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "security-and-abuse-prevention",
    "unitTitle": "Security and abuse prevention"
  },
  {
    "id": "srs-quiz-security-and-abuse-prevention-c1",
    "type": "quiz",
    "prompt": "An attacker gains code execution in a low-value internal reporting service and starts calling the payments service directly. Which control is designed to limit this?",
    "answer": "mTLS workload identity with per-service authorisation policy\n\nExplanation: Lateral movement happens inside the perimeter, so the defence is verifying each caller's workload identity and allowing only the services that should reach payments. The WAF is tempting but sits at the edge; internal service-to-service calls never pass through it.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "security-and-abuse-prevention",
    "unitTitle": "Security and abuse prevention"
  },
  {
    "id": "srs-quiz-security-and-abuse-prevention-c2",
    "type": "quiz",
    "prompt": "An attacker sends 2 million login attempts per hour spread over 50,000 residential proxy IPs. The per-IP limit is 100 per hour. What happens, and which signal reveals the attack?",
    "answer": "Each IP sends 40 per hour, under the limit; the global failure ratio spikes\n\nExplanation: 2,000,000 / 50,000 = 40 attempts per IP, below the 100 limit, so per-IP limits do nothing. The global login failure ratio jumping from about 5% toward 95% is the tell, and it can trigger endpoint-wide challenges. Fingerprinting helps, but it is one of several layered controls rather than the detection signal described.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "security-and-abuse-prevention",
    "unitTitle": "Security and abuse prevention"
  },
  {
    "id": "srs-quiz-security-and-abuse-prevention-c3",
    "type": "quiz",
    "prompt": "With envelope encryption backed by KMS, why can you rotate the root key without re-encrypting terabytes of stored data?",
    "answer": "The root key wraps only the data keys, so only those small keys need rewrapping\n\nExplanation: Payloads are encrypted with per-object data keys, and only those keys are wrapped by the root key in the HSM, so rotation touches keys, not data. Keeping plaintext data keys cached would defeat the design, since the plaintext DEK should exist only briefly in memory.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "security-and-abuse-prevention",
    "unitTitle": "Security and abuse prevention"
  },
  {
    "id": "srs-takeaway-rate-limiter-placement-and-keys-1",
    "type": "takeaway",
    "prompt": "In Rate limiter placement and keys, what is a fundamental rule regarding: Place rate limiters at multiple tiers?",
    "answer": "Place rate limiters at multiple tiers: Edge (DDoS), API Gateway (API keys), and Service (business operations).",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "rate-limiter-placement-and-keys",
    "unitTitle": "Rate limiter placement and keys"
  },
  {
    "id": "srs-takeaway-rate-limiter-placement-and-keys-2",
    "type": "takeaway",
    "prompt": "In Rate limiter placement and keys, what is a fundamental rule regarding: Avoid IP-only rate limiting due to shared corporate NAT gateways; use composite keys?",
    "answer": "Avoid IP-only rate limiting due to shared corporate NAT gateways; use composite keys.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "rate-limiter-placement-and-keys",
    "unitTitle": "Rate limiter placement and keys"
  },
  {
    "id": "srs-takeaway-rate-limiter-placement-and-keys-3",
    "type": "takeaway",
    "prompt": "In Rate limiter placement and keys, what is a fundamental rule regarding: Choose fail-open, fail-closed, or a local emergency limit per operation?",
    "answer": "Choose fail-open, fail-closed, or a local emergency limit per operation: low-risk reads may degrade open, while login, password reset, spending, and expensive endpoints still need protection when Redis fails.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "rate-limiter-placement-and-keys",
    "unitTitle": "Rate limiter placement and keys"
  },
  {
    "id": "srs-quiz-rate-limiter-placement-and-keys-c1",
    "type": "quiz",
    "prompt": "Why does the lesson recommend keying anonymous IPv6 clients by prefix, such as a /64, rather than by full address?",
    "answer": "One subscriber usually controls a whole /64 and can rotate addresses in it\n\nExplanation: A single home or device is typically assigned a /64 with an enormous number of addresses, so per-address limits are trivially evaded. The NAT sharing problem is an IPv4 issue; IPv6 has the opposite problem of too many addresses per client.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "rate-limiter-placement-and-keys",
    "unitTitle": "Rate limiter placement and keys"
  },
  {
    "id": "srs-quiz-rate-limiter-placement-and-keys-c2",
    "type": "quiz",
    "prompt": "POST /password-reset has two limits that must both pass: 5 per hour per email and 20 per hour per IP prefix. Which attack does each limit stop?",
    "answer": "The email limit stops harassment from many IPs; the IP limit stops spraying many emails\n\nExplanation: An attacker flooding one victim from many IPs is caught by the per-email key, while one source spraying resets across many emails is caught by the per-prefix key. Swapping them is the tempting error: an IP limit cannot catch an attack that comes from many IPs.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "rate-limiter-placement-and-keys",
    "unitTitle": "Rate limiter placement and keys"
  },
  {
    "id": "srs-quiz-rate-limiter-placement-and-keys-c3",
    "type": "quiz",
    "prompt": "The shared Redis behind your limiter becomes unreachable and calls time out after 5 ms. How should GET /catalog and POST /otp/send behave?",
    "answer": "Catalog fails open with a local approximate limit; OTP send fails closed\n\nExplanation: Low-risk reads should keep serving with a coarse per-instance backstop, while OTP sends cost money and enable abuse, so they fail closed. Failing everything open sounds principled, but it leaves SMS pumping and brute force unprotected exactly when the limiter is down.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "rate-limiter-placement-and-keys",
    "unitTitle": "Rate limiter placement and keys"
  },
  {
    "id": "srs-takeaway-sliding-window-rate-limiter-1",
    "type": "takeaway",
    "prompt": "In Sliding window rate limiter, what is a fundamental rule regarding: Fixed window limiters allow 2x traffic bursts across window boundaries; sliding window counter smooths this boundary?",
    "answer": "Fixed window limiters allow 2x traffic bursts across window boundaries; sliding window counter smooths this boundary.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "sliding-window-rate-limiter",
    "unitTitle": "Sliding window rate limiter"
  },
  {
    "id": "srs-takeaway-sliding-window-rate-limiter-2",
    "type": "takeaway",
    "prompt": "In Sliding window rate limiter, what is a fundamental rule regarding: Sliding window counter uses only 2 integer keys per client, achieving O(1) memory vs O(N) memory in sliding window logs?",
    "answer": "Sliding window counter uses only 2 integer keys per client, achieving O(1) memory vs O(N) memory in sliding window logs.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "sliding-window-rate-limiter",
    "unitTitle": "Sliding window rate limiter"
  },
  {
    "id": "srs-takeaway-sliding-window-rate-limiter-3",
    "type": "takeaway",
    "prompt": "In Sliding window rate limiter, what is a fundamental rule regarding: Execute rate limit checks atomically using Redis Lua scripts to eliminate race conditions between concurrent requests?",
    "answer": "Execute rate limit checks atomically using Redis Lua scripts to eliminate race conditions between concurrent requests.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "sliding-window-rate-limiter",
    "unitTitle": "Sliding window rate limiter"
  },
  {
    "id": "srs-quiz-sliding-window-rate-limiter-c1",
    "type": "quiz",
    "prompt": "The limit is 100 requests per 60 s. The previous window saw 60 requests. You are 45 s into the current window, which has 80 requests so far. What does the sliding window counter estimate, and is the next request allowed?",
    "answer": "95, so the request is allowed\n\nExplanation: The offset ratio is 45/60 = 0.75, so the previous window contributes 60 x 0.25 = 15, and 15 + 80 = 95, under 100. Using 0.75 as the weight instead of 1 minus 0.75 gives 125, the most common slip.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "sliding-window-rate-limiter",
    "unitTitle": "Sliding window rate limiter"
  },
  {
    "id": "srs-quiz-sliding-window-rate-limiter-c2",
    "type": "quiz",
    "prompt": "A login endpoint allows 5 attempts per 15 minutes and must never allow a sixth inside any 15-minute span. Which algorithm fits best, and what does it cost?",
    "answer": "Sliding window log, one timestamp per request\n\nExplanation: The sliding window log stores each request's timestamp and gives exact counts, and with a limit of 5 the memory cost is trivial. The sliding window counter is cheaper but approximate, since it assumes the previous window's requests were evenly spread.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "sliding-window-rate-limiter",
    "unitTitle": "Sliding window rate limiter"
  },
  {
    "id": "srs-quiz-sliding-window-rate-limiter-c3",
    "type": "quiz",
    "prompt": "The limiter's Lua script reads rl:user42:1700 and rl:user42:1699. After moving to Redis Cluster, it fails with a CROSSSLOT error. What is the right fix?",
    "answer": "Use hash tags such as rl:{user42}:1700 so both keys land in one slot\n\nExplanation: A multi-key script in Redis Cluster needs all keys in the same hash slot, and a hash tag makes only the part in braces determine the slot. Splitting into GET then INCR reintroduces the race the script exists to prevent, and MULTI has the same cross-slot restriction.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "sliding-window-rate-limiter",
    "unitTitle": "Sliding window rate limiter"
  },
  {
    "id": "srs-takeaway-multi-tenant-design-1",
    "type": "takeaway",
    "prompt": "In Multi-tenant design, what is a fundamental rule regarding: Choose the right isolation model?",
    "answer": "Choose the right isolation model: Silo (dedicated DBs), Bridge (dedicated schemas), or Pool (shared tables with tenant_id).",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "multi-tenant-design",
    "unitTitle": "Multi-tenant design"
  },
  {
    "id": "srs-takeaway-multi-tenant-design-2",
    "type": "takeaway",
    "prompt": "In Multi-tenant design, what is a fundamental rule regarding: Use PostgreSQL Row-Level Security (RLS) to enforce tenant isolation at the database engine level?",
    "answer": "Use PostgreSQL Row-Level Security (RLS) to enforce tenant isolation at the database engine level.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "multi-tenant-design",
    "unitTitle": "Multi-tenant design"
  },
  {
    "id": "srs-takeaway-multi-tenant-design-3",
    "type": "takeaway",
    "prompt": "In Multi-tenant design, what is a fundamental rule regarding: Prevent noisy neighbors with per-tenant connection pooling and CPU/memory resource quotas?",
    "answer": "Prevent noisy neighbors with per-tenant connection pooling and CPU/memory resource quotas.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "multi-tenant-design",
    "unitTitle": "Multi-tenant design"
  },
  {
    "id": "srs-quiz-multi-tenant-design-c1",
    "type": "quiz",
    "prompt": "Which tenancy model runs into repeating every schema migration per tenant and PostgreSQL catalogue bloat as you approach 10,000 tenants?",
    "answer": "Bridge, a schema per tenant\n\nExplanation: Schema-per-tenant means 10,000 copies of every table and index in one engine's catalogue, and each migration runs 10,000 times. Silo has an even larger operational burden, but spread across separate databases rather than bloating one catalogue.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "multi-tenant-design",
    "unitTitle": "Multi-tenant design"
  },
  {
    "id": "srs-quiz-multi-tenant-design-c2",
    "type": "quiz",
    "prompt": "A pooled tenant has grown from 2 GB to 1.3 TB, and its queries now slow down its shard. Following the lesson's tiering rules, what should happen?",
    "answer": "Move it to a silo database via copy, dual-write and cut-over on tenant_id\n\nExplanation: Tenants above 1 TB get their own silo, moved with the same expand, copy, dual-write, cut-over process as any migration, keyed on tenant_id. Tighter limits reduce the harm but throttle a paying customer while the root cause, a whale in the pool, remains.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "multi-tenant-design",
    "unitTitle": "Multi-tenant design"
  },
  {
    "id": "srs-quiz-multi-tenant-design-c3",
    "type": "quiz",
    "prompt": "RLS filters on current_setting('app.tenant_id'). The app runs SET app.tenant_id once when it checks out a connection from PgBouncer in transaction mode. Occasionally tenant B sees tenant A's rows. What is the cause?",
    "answer": "The session-level SET persists on a pooled connection; use SET LOCAL in each transaction\n\nExplanation: In transaction pooling, consecutive transactions on one server connection can belong to different clients, so a session SET leaks to whoever gets the connection next. SET LOCAL scopes it to the transaction. Owner bypass is a real pitfall, but it would leak on every query, not occasionally.",
    "category": "Production Reliability, SLOs & Resilience",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "multi-tenant-design",
    "unitTitle": "Multi-tenant design"
  },
  {
    "id": "srs-takeaway-direct-to-object-storage-upload-1",
    "type": "takeaway",
    "prompt": "In Direct-to-object-storage upload, what is a fundamental rule regarding: Never stream large file uploads through application servers; upload directly to S3 via pre-signed URLs?",
    "answer": "Never stream large file uploads through application servers; upload directly to S3 via pre-signed URLs.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "direct-to-object-storage-upload",
    "unitTitle": "Direct-to-object-storage upload"
  },
  {
    "id": "srs-takeaway-direct-to-object-storage-upload-2",
    "type": "takeaway",
    "prompt": "In Direct-to-object-storage upload, what is a fundamental rule regarding: Pre-signed URLs bind the permitted operation, object key, expiry, and any explicitly signed headers; enforce an upload size range with an appropriate POST policy or post-upload validation?",
    "answer": "Pre-signed URLs bind the permitted operation, object key, expiry, and any explicitly signed headers; enforce an upload size range with an appropriate POST policy or post-upload validation.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "direct-to-object-storage-upload",
    "unitTitle": "Direct-to-object-storage upload"
  },
  {
    "id": "srs-takeaway-direct-to-object-storage-upload-3",
    "type": "takeaway",
    "prompt": "In Direct-to-object-storage upload, what is a fundamental rule regarding: Use S3 Event Notifications (via SQS/SNS) to trigger asynchronous downstream thumbnailing and validation?",
    "answer": "Use S3 Event Notifications (via SQS/SNS) to trigger asynchronous downstream thumbnailing and validation.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "direct-to-object-storage-upload",
    "unitTitle": "Direct-to-object-storage upload"
  },
  {
    "id": "srs-quiz-direct-to-object-storage-upload-c1",
    "type": "quiz",
    "prompt": "Your API issues presigned S3 PUT URLs for avatar uploads and wants to allow any file between 1 byte and 5 MB. Which statement from the lesson is correct?",
    "answer": "A presigned PUT cannot express a size range; use a presigned POST with content-length-range, and verify size afterwards\n\nExplanation: A presigned PUT binds key, method, expiry and any signed headers; signing Content-Length pins one exact length, not a range, so a POST policy with content-length-range plus post-upload verification is the right tool. Content-Type signing constrains the declared type only and says nothing about size.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "direct-to-object-storage-upload",
    "unitTitle": "Direct-to-object-storage upload"
  },
  {
    "id": "srs-quiz-direct-to-object-storage-upload-c2",
    "type": "quiz",
    "prompt": "You expect 20,000 concurrent uploads averaging 4 Mbit/s each. If they are proxied through your API servers to S3, roughly what bandwidth must the API tier carry, and how long does one 40 MB video hold a worker on a 2 Mbit/s uplink?",
    "answer": "About 80 Gbit/s of ingress plus about 80 Gbit/s of egress; about 160 seconds per video\n\nExplanation: 20,000 x 4 Mbit/s = 80 Gbit/s arriving, and the same bytes must leave again to object storage; 40 MB is 320 Mbit, which takes 160 seconds at 2 Mbit/s. Treating the S3 leg as free is the tempting slip, but it still consumes the API tier's network interfaces and holds sockets and buffers the whole time.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "direct-to-object-storage-upload",
    "unitTitle": "Direct-to-object-storage upload"
  },
  {
    "id": "srs-quiz-direct-to-object-storage-upload-c3",
    "type": "quiz",
    "prompt": "An attacker uploads an executable renamed to photo.jpg, sending Content-Type image/jpeg and a size within limits, so the presigned POST policy accepts it. In the lesson's flow, what stops it being shown on profiles?",
    "answer": "The worker checks real size, magic bytes and malware, and only then copies it to a final key and marks the row ready\n\nExplanation: The object lands under a pending key and stays unreferenced until the async worker validates magic bytes, scans it and marks the metadata row ready. S3 does not sniff content against Content-Type; the policy only checks the declared header, which the attacker controls.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "direct-to-object-storage-upload",
    "unitTitle": "Direct-to-object-storage upload"
  },
  {
    "id": "srs-takeaway-image-cdn-and-resizing-1",
    "type": "takeaway",
    "prompt": "In Image CDN and resizing, what is a fundamental rule regarding: Avoid pre-generating hundreds of image sizes; resize dynamically on-the-fly at the CDN edge?",
    "answer": "Avoid pre-generating hundreds of image sizes; resize dynamically on-the-fly at the CDN edge.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "image-cdn-and-resizing",
    "unitTitle": "Image CDN and resizing"
  },
  {
    "id": "srs-takeaway-image-cdn-and-resizing-2",
    "type": "takeaway",
    "prompt": "In Image CDN and resizing, what is a fundamental rule regarding: Serve modern compressed formats (WebP and AVIF) to slash bandwidth consumption by 30-50%?",
    "answer": "Serve modern compressed formats (WebP and AVIF) to slash bandwidth consumption by 30-50%.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "image-cdn-and-resizing",
    "unitTitle": "Image CDN and resizing"
  },
  {
    "id": "srs-takeaway-image-cdn-and-resizing-3",
    "type": "takeaway",
    "prompt": "In Image CDN and resizing, what is a fundamental rule regarding: Cache transformed assets at the CDN edge keyed by width, height, quality, and format?",
    "answer": "Cache transformed assets at the CDN edge keyed by width, height, quality, and format.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "image-cdn-and-resizing",
    "unitTitle": "Image CDN and resizing"
  },
  {
    "id": "srs-quiz-image-cdn-and-resizing-c1",
    "type": "quiz",
    "prompt": "An on-demand image service accepts any integer width in the URL. Why does the lesson insist on an allowlist of widths or signed transform URLs?",
    "answer": "Because arbitrary widths let anyone force uncached, expensive resizes that bypass the cache\n\nExplanation: If w can be any value, an attacker can request thousands of distinct widths, each a cache miss that triggers a fresh resize at the origin. The limitation is about cost and cache-busting abuse, not a technical restriction in the resize library.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "image-cdn-and-resizing",
    "unitTitle": "Image CDN and resizing"
  },
  {
    "id": "srs-quiz-image-cdn-and-resizing-c2",
    "type": "quiz",
    "prompt": "You have 5 million originals and the product uses 8 widths x 3 formats x 2 pixel densities, averaging 50 KB per variant. What would pre-generating every variant cost in extra storage and up-front resize jobs?",
    "answer": "About 12 TB and 240 million jobs\n\nExplanation: 8 x 3 x 2 = 48 variants; 5M x 48 = 240 million jobs, and 240M x 50 KB is about 12 TB, most of it for sizes nobody will view. The 48 million option gets the storage right but undercounts jobs: every one of the 48 variants of every original is a separate resize.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "image-cdn-and-resizing",
    "unitTitle": "Image CDN and resizing"
  },
  {
    "id": "srs-quiz-image-cdn-and-resizing-c3",
    "type": "quiz",
    "prompt": "The edge resolves fmt=auto from the Accept header and returns AVIF to browsers that support it, but the cache key is only path plus width plus quality. What goes wrong, and what is the fix?",
    "answer": "A browser that cannot decode AVIF may be served the cached AVIF; include the resolved format in the cache key or Vary\n\nExplanation: If the negotiated format is not part of the key, whichever format was cached first is served to everyone, so a client lacking AVIF support can receive an image it cannot decode. An origin shield reduces duplicate resizes across edges but does nothing about serving the wrong format.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "image-cdn-and-resizing",
    "unitTitle": "Image CDN and resizing"
  },
  {
    "id": "srs-takeaway-gravatar-style-avatar-service-1",
    "type": "takeaway",
    "prompt": "In An avatar service, what is a fundamental rule regarding: A public email hash avoids exposing the literal address but remains guessable pseudonymous data; prefer opaque IDs or keyed derivation for a private service?",
    "answer": "A public email hash avoids exposing the literal address but remains guessable pseudonymous data; prefer opaque IDs or keyed derivation for a private service.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "gravatar-style-avatar-service",
    "unitTitle": "An avatar service"
  },
  {
    "id": "srs-takeaway-gravatar-style-avatar-service-2",
    "type": "takeaway",
    "prompt": "In An avatar service, what is a fundamental rule regarding: Use aggressive Cache-Control with stale-while-revalidate for CDN efficiency?",
    "answer": "Use aggressive Cache-Control with stale-while-revalidate for CDN efficiency.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "gravatar-style-avatar-service",
    "unitTitle": "An avatar service"
  },
  {
    "id": "srs-takeaway-gravatar-style-avatar-service-3",
    "type": "takeaway",
    "prompt": "In An avatar service, what is a fundamental rule regarding: Generate procedural identicons mathematically from hash bits when no user avatar exists?",
    "answer": "Generate procedural identicons mathematically from hash bits when no user avatar exists.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "gravatar-style-avatar-service",
    "unitTitle": "An avatar service"
  },
  {
    "id": "srs-quiz-gravatar-style-avatar-service-c1",
    "type": "quiz",
    "prompt": "A private company app plans to key avatar URLs by SHA-256 of the user's lowercased email, arguing that hashing makes them anonymous. What does the lesson say?",
    "answer": "The digest is pseudonymous: anyone with candidate emails can hash and match them, so prefer an opaque ID or a keyed derivation\n\nExplanation: Fast hashes of emails can be tested against a candidate list in well under a second, so the stable digest is guessable pseudonymous data; a private service should use an opaque user ID or HMAC with a secret. Swapping MD5 for SHA-256 does not help, since both are fast and the weakness is the guessable input.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "gravatar-style-avatar-service",
    "unitTitle": "An avatar service"
  },
  {
    "id": "srs-quiz-gravatar-style-avatar-service-c2",
    "type": "quiz",
    "prompt": "An avatar service receives 3 billion requests per day, with peak at about 3 times the average and a 98 percent CDN hit ratio. Roughly how many requests per second reach the origin at peak?",
    "answer": "About 2,100 per second\n\nExplanation: 3B / 86,400 is about 34,700 per second, peak about 104,000, and 2 percent of that is about 2,100 per second at the origin. The 700 figure applies the miss rate to the average rather than the peak, which would under-provision the origin for the busiest hour.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "gravatar-style-avatar-service",
    "unitTitle": "An avatar service"
  },
  {
    "id": "srs-quiz-gravatar-style-avatar-service-c3",
    "type": "quiz",
    "prompt": "Avatars are served from /avatar/42?s=64 with max-age=86400 and s-maxage=604800. Users complain their new photo takes days to appear for others. Which change does the lesson recommend?",
    "answer": "Reference a versioned URL such as /avatar/42/v7/64.webp with a one-year immutable max-age\n\nExplanation: With a version in the URL, the page points to the new version as soon as metadata changes, so there is no staleness and variants can be cached forever. Purging works but is operationally fragile and needed on every change; stale-while-revalidate still serves the old image during the refresh window.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "gravatar-style-avatar-service",
    "unitTitle": "An avatar service"
  },
  {
    "id": "srs-takeaway-video-upload-signed-url-multipart-1",
    "type": "takeaway",
    "prompt": "In Video upload: signed URLs and multipart, what is a fundamental rule regarding: Use Multipart Upload for all files exceeding 100MB to enable parallel streaming and chunk-level retries?",
    "answer": "Use Multipart Upload for all files exceeding 100MB to enable parallel streaming and chunk-level retries.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-upload-signed-url-multipart",
    "unitTitle": "Video upload: signed URLs and multipart"
  },
  {
    "id": "srs-takeaway-video-upload-signed-url-multipart-2",
    "type": "takeaway",
    "prompt": "In Video upload: signed URLs and multipart, what is a fundamental rule regarding: Track part numbers and ETags on the client; assemble parts upon completion?",
    "answer": "Track part numbers and ETags on the client; assemble parts upon completion.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-upload-signed-url-multipart",
    "unitTitle": "Video upload: signed URLs and multipart"
  },
  {
    "id": "srs-takeaway-video-upload-signed-url-multipart-3",
    "type": "takeaway",
    "prompt": "In Video upload: signed URLs and multipart, what is a fundamental rule regarding: Set an S3 Lifecycle rule to automatically abort incomplete multipart uploads after 7 days to eliminate orphaned storage costs?",
    "answer": "Set an S3 Lifecycle rule to automatically abort incomplete multipart uploads after 7 days to eliminate orphaned storage costs.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-upload-signed-url-multipart",
    "unitTitle": "Video upload: signed URLs and multipart"
  },
  {
    "id": "srs-quiz-video-upload-signed-url-multipart-c1",
    "type": "quiz",
    "prompt": "A user starts a 3 GB multipart upload, sends 150 parts, then uninstalls the app. What happens to those parts, and what should the platform configure?",
    "answer": "They stay stored and billed until the upload is completed or aborted, so add a lifecycle rule to abort incomplete uploads\n\nExplanation: Uploaded parts persist and are billed until CompleteMultipartUpload or AbortMultipartUpload; a lifecycle rule to abort incomplete uploads after a few days cleans them up. URL expiry only stops new part uploads and does not remove what has already been stored.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-upload-signed-url-multipart",
    "unitTitle": "Video upload: signed URLs and multipart"
  },
  {
    "id": "srs-quiz-video-upload-signed-url-multipart-c2",
    "type": "quiz",
    "prompt": "A client always uses 10 MiB parts. A user tries to upload a 200 GiB raw camera file and the upload fails. What is the cause and the right part size under the lesson's rule of thumb?",
    "answer": "It would need 20,480 parts, over the 10,000 limit; use about 21 MiB parts\n\nExplanation: 200 GiB is 204,800 MiB, so 10 MiB parts give 20,480 parts; the rule max(8 MiB, ceil(size / 10,000)) gives about 21 MiB. Shrinking parts to 5 MiB moves in the wrong direction and doubles the part count, while the 5 GB cap applies to single PUTs, not multipart objects.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-upload-signed-url-multipart",
    "unitTitle": "Video upload: signed URLs and multipart"
  },
  {
    "id": "srs-quiz-video-upload-signed-url-multipart-c3",
    "type": "quiz",
    "prompt": "A laptop uploading 410 parts goes to sleep for three hours after part 250. On wake the app has restarted and its batch of presigned part URLs, valid for one hour, has expired. What should the client do?",
    "answer": "Use the persisted UploadId, confirm completed parts with ListParts, and request fresh URLs for the remaining parts\n\nExplanation: Expired part URLs only mean new URLs are needed; the UploadId and stored parts remain, so ListParts confirms progress and only the remaining 160 parts are sent. Clients cannot extend an expiry themselves, since it is covered by the server's signature, and completing early would produce a truncated object.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-upload-signed-url-multipart",
    "unitTitle": "Video upload: signed URLs and multipart"
  },
  {
    "id": "srs-takeaway-video-transcoding-pipeline-1",
    "type": "takeaway",
    "prompt": "In Video transcoding pipeline, what is a fundamental rule regarding: Split videos into short keyframe-aligned segments (each made of one or more closed GOPs) to transcode massively in parallel across worker pools?",
    "answer": "Split videos into short keyframe-aligned segments (each made of one or more closed GOPs) to transcode massively in parallel across worker pools.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-transcoding-pipeline",
    "unitTitle": "Video transcoding pipeline"
  },
  {
    "id": "srs-takeaway-video-transcoding-pipeline-2",
    "type": "takeaway",
    "prompt": "In Video transcoding pipeline, what is a fundamental rule regarding: Encode into multiple bitrates and resolutions to support Adaptive Bitrate Streaming (ABR)?",
    "answer": "Encode into multiple bitrates and resolutions to support Adaptive Bitrate Streaming (ABR).",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-transcoding-pipeline",
    "unitTitle": "Video transcoding pipeline"
  },
  {
    "id": "srs-takeaway-video-transcoding-pipeline-3",
    "type": "takeaway",
    "prompt": "In Video transcoding pipeline, what is a fundamental rule regarding: Store output segments in object storage fronted by an Anycast CDN?",
    "answer": "Store output segments in object storage fronted by an Anycast CDN.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-transcoding-pipeline",
    "unitTitle": "Video transcoding pipeline"
  },
  {
    "id": "srs-quiz-video-transcoding-pipeline-c1",
    "type": "quiz",
    "prompt": "Why must every rendition in a transcoding ladder use the same keyframe and segment boundaries?",
    "answer": "Because ABR players switch renditions at segment boundaries, which must line up to switch cleanly\n\nExplanation: A player that moves from 1080p to 480p mid-stream fetches the next segment in the new rendition, which only works if both renditions start that segment at the same keyframe and timestamp. Segment sizes differ by bitrate anyway, so identical sizes are neither possible nor required.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-transcoding-pipeline",
    "unitTitle": "Video transcoding pipeline"
  },
  {
    "id": "srs-quiz-video-transcoding-pipeline-c2",
    "type": "quiz",
    "prompt": "A 90 minute upload is encoded into a 4-rung ladder at 0.5x real time (2 seconds of work per second of video), split into 6 second segments, with 600 workers available. What are the approximate wall-clock time and total compute?",
    "answer": "About 1 to 2 minutes wall clock, and about 12 CPU-hours of total compute\n\nExplanation: 900 segments x 4 renditions = 3,600 tasks of about 12 seconds each; 600 workers finish in about 6 waves, roughly 72 seconds plus overhead, while total work stays 4 x 90 min x 2 = 12 CPU-hours. The CPU-minutes option is the classic confusion: parallelism buys latency, not efficiency.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-transcoding-pipeline",
    "unitTitle": "Video transcoding pipeline"
  },
  {
    "id": "srs-quiz-video-transcoding-pipeline-c3",
    "type": "quiz",
    "prompt": "A malformed upload makes the encoder crash on the same segment every time. Workers retry it indefinitely, consuming capacity. What does the lesson's pipeline do instead?",
    "answer": "After N failed attempts, move the task to a dead-letter queue and mark the video failed with a reason\n\nExplanation: Bounded retries plus a dead-letter queue stop a poison input from looping forever, and the video gets an explicit failed state and reason. Backoff alone only slows the loop; the lesson also says to probe and validate inputs up front, and to publish only when every required piece exists, which rules out shipping a gap.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "video-transcoding-pipeline",
    "unitTitle": "Video transcoding pipeline"
  },
  {
    "id": "srs-takeaway-adaptive-bitrate-and-cdn-decider-1",
    "type": "takeaway",
    "prompt": "In Adaptive bitrate and the CDN decider, what is a fundamental rule regarding: HLS and DASH slice video streams into small, standalone HTTP chunks (typically 2–6 seconds)?",
    "answer": "HLS and DASH slice video streams into small, standalone HTTP chunks (typically 2–6 seconds).",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "adaptive-bitrate-and-cdn-decider",
    "unitTitle": "Adaptive bitrate and the CDN decider"
  },
  {
    "id": "srs-takeaway-adaptive-bitrate-and-cdn-decider-2",
    "type": "takeaway",
    "prompt": "In Adaptive bitrate and the CDN decider, what is a fundamental rule regarding: The client video player, not the server, dynamically chooses which quality segment to fetch based on buffer health?",
    "answer": "The client video player, not the server, dynamically chooses which quality segment to fetch based on buffer health.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "adaptive-bitrate-and-cdn-decider",
    "unitTitle": "Adaptive bitrate and the CDN decider"
  },
  {
    "id": "srs-takeaway-adaptive-bitrate-and-cdn-decider-3",
    "type": "takeaway",
    "prompt": "In Adaptive bitrate and the CDN decider, what is a fundamental rule regarding: HTTP-based chunk streaming enables standard CDN web caches to cache video chunks without specialized streaming servers?",
    "answer": "HTTP-based chunk streaming enables standard CDN web caches to cache video chunks without specialized streaming servers.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "adaptive-bitrate-and-cdn-decider",
    "unitTitle": "Adaptive bitrate and the CDN decider"
  },
  {
    "id": "srs-quiz-adaptive-bitrate-and-cdn-decider-c1",
    "type": "quiz",
    "prompt": "A simple player switches down only when a segment download takes longer than the segment's duration. Why does the lesson call this too late?",
    "answer": "Because by then the buffer is already draining; good players switch early on a smoothed estimate with a safety margin\n\nExplanation: Once a download is slower than real time, playback is already consuming buffer faster than it refills; players keep a smoothed throughput estimate, watch buffer level and pick a lower rung with margin before that happens. The client picks renditions itself, so there is no server-imposed dwell time.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "adaptive-bitrate-and-cdn-decider",
    "unitTitle": "Adaptive bitrate and the CDN decider"
  },
  {
    "id": "srs-quiz-adaptive-bitrate-and-cdn-decider-c2",
    "type": "quiz",
    "prompt": "The ladder is 6.0, 3.0 and 1.5 Mbit/s with 4 second segments. The smoothed throughput estimate is 4.0 Mbit/s and the safety factor is 0.8. Which rung does the player pick, and how does the buffer change per segment?",
    "answer": "3.0 Mbit/s; the buffer grows by about 1 second per segment\n\nExplanation: The cap is 4.0 x 0.8 = 3.2 Mbit/s, so the player picks 3.0; a segment is 3.0 x 4 = 12 Mbit, which downloads in 3 seconds at 4.0 Mbit/s while adding 4 seconds of video, so the buffer grows about 1 second. The 1.5 option computes a real buffer gain but ignores that the higher rung fits within the margin.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "adaptive-bitrate-and-cdn-decider",
    "unitTitle": "Adaptive bitrate and the CDN decider"
  },
  {
    "id": "srs-quiz-adaptive-bitrate-and-cdn-decider-c3",
    "type": "quiz",
    "prompt": "Twenty minutes into a popular match, CDN A becomes congested for one ISP. Players were assigned CDN A once at session start. Which design from the lesson keeps those viewers playing smoothly?",
    "answer": "Have the steering service return an ordered CDN list the player can fail over along, updated during playback via content steering\n\nExplanation: A static choice ignores mid-session congestion; returning ranked CDNs lets the player fail over, and HLS or DASH content steering lets the server change the preferred order during playback using QoE beacons. ABR can mask some congestion by lowering quality, but it cannot fix a failing or overloaded CDN path.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "adaptive-bitrate-and-cdn-decider",
    "unitTitle": "Adaptive bitrate and the CDN decider"
  },
  {
    "id": "srs-takeaway-signed-urls-drm-and-video-security-1",
    "type": "takeaway",
    "prompt": "In Signed URLs, DRM, and video security, what is a fundamental rule regarding: Use CDN signed cookies to authorize entire multi-file HLS streaming sessions efficiently?",
    "answer": "Use CDN signed cookies to authorize entire multi-file HLS streaming sessions efficiently.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "signed-urls-drm-and-video-security",
    "unitTitle": "Signed URLs, DRM, and video security"
  },
  {
    "id": "srs-takeaway-signed-urls-drm-and-video-security-2",
    "type": "takeaway",
    "prompt": "In Signed URLs, DRM, and video security, what is a fundamental rule regarding: Hardware-backed DRM protects keys and decode paths on supported devices but cannot eliminate screen recording or the analog hole?",
    "answer": "Hardware-backed DRM protects keys and decode paths on supported devices but cannot eliminate screen recording or the analog hole.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "signed-urls-drm-and-video-security",
    "unitTitle": "Signed URLs, DRM, and video security"
  },
  {
    "id": "srs-takeaway-signed-urls-drm-and-video-security-3",
    "type": "takeaway",
    "prompt": "In Signed URLs, DRM, and video security, what is a fundamental rule regarding: Tie signed playback tokens to user IP ranges and short expiration windows?",
    "answer": "Tie signed playback tokens to user IP ranges and short expiration windows.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "signed-urls-drm-and-video-security",
    "unitTitle": "Signed URLs, DRM, and video security"
  },
  {
    "id": "srs-quiz-signed-urls-drm-and-video-security-c1",
    "type": "quiz",
    "prompt": "A team encrypts HLS segments with AES-128 and serves the key over HTTPS to any logged-in player, then describes this as DRM. What is the flaw?",
    "answer": "Every authorized client receives the key, so a determined user can extract it; DRM keeps keys inside a CDM\n\nExplanation: Clear-key encryption hands the actual key to the client, so any authorized user can pull it out; DRM systems like Widevine and FairPlay keep keys inside a content decryption module, ideally hardware-backed. Key length is not the issue, and rotating keys still delivers each one in the clear.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "signed-urls-drm-and-video-security",
    "unitTitle": "Signed URLs, DRM, and video security"
  },
  {
    "id": "srs-quiz-signed-urls-drm-and-video-security-c2",
    "type": "quiz",
    "prompt": "A subscriber on an Android phone with only Widevine L3 (software-only) presses play on a 4K title. Following the lesson's worked example, what should happen?",
    "answer": "The license server returns keys with rules that restrict this device to standard definition\n\nExplanation: Entitlement and cookies control who may fetch bytes, while license rules control what decryption is allowed: HD only on hardware-backed security levels, so L3 devices are commonly capped to SD. Rejecting the cookie is wrong because signed cookies do not know the device's DRM security level.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "signed-urls-drm-and-video-security",
    "unitTitle": "Signed URLs, DRM, and video security"
  },
  {
    "id": "srs-quiz-signed-urls-drm-and-video-security-c3",
    "type": "quiz",
    "prompt": "During a big premiere, the DRM license service in one region goes down while the CDN stays healthy. What breaks first, and which mitigations does the lesson list?",
    "answer": "New playbacks fail despite a healthy CDN; run licensing multi-region, cache entitlement, and allow persistent licenses for downloads\n\nExplanation: Without a license, a player can fetch encrypted segments but has no usable key, so new sessions fail even though the CDN is fine; multi-region licensing, cached entitlement and persistent licenses reduce the blast radius. Adding a CDN is the tempting reflex, but segment delivery was never the problem.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "signed-urls-drm-and-video-security",
    "unitTitle": "Signed URLs, DRM, and video security"
  },
  {
    "id": "srs-takeaway-live-streaming-webrtc-and-latency-1",
    "type": "takeaway",
    "prompt": "In Live streaming, WebRTC, and latency, what is a fundamental rule regarding: Understand the trade-off?",
    "answer": "Understand the trade-off: HTTP chunk streaming offers high CDN cacheability but higher latency (2–15s); WebRTC offers sub-500ms latency but requires complex SFU server infrastructure.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "live-streaming-webrtc-and-latency",
    "unitTitle": "Live streaming, WebRTC, and latency"
  },
  {
    "id": "srs-takeaway-live-streaming-webrtc-and-latency-2",
    "type": "takeaway",
    "prompt": "In Live streaming, WebRTC, and latency, what is a fundamental rule regarding: Prefer UDP media for real-time interaction while supporting ICE/TURN fallbacks and bounded retransmission, jitter, and congestion-control behavior?",
    "answer": "Prefer UDP media for real-time interaction while supporting ICE/TURN fallbacks and bounded retransmission, jitter, and congestion-control behavior.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "live-streaming-webrtc-and-latency",
    "unitTitle": "Live streaming, WebRTC, and latency"
  },
  {
    "id": "srs-takeaway-live-streaming-webrtc-and-latency-3",
    "type": "takeaway",
    "prompt": "In Live streaming, WebRTC, and latency, what is a fundamental rule regarding: For large interactive broadcasts, use WebRTC for the active broadcaster and Low-Latency HLS (LL-HLS) for millions of passive viewers?",
    "answer": "For large interactive broadcasts, use WebRTC for the active broadcaster and Low-Latency HLS (LL-HLS) for millions of passive viewers.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "live-streaming-webrtc-and-latency",
    "unitTitle": "Live streaming, WebRTC, and latency"
  },
  {
    "id": "srs-quiz-live-streaming-webrtc-and-latency-c1",
    "type": "quiz",
    "prompt": "In a WebRTC group call, what does a selective forwarding unit (SFU) do with each participant's stream?",
    "answer": "Receives each participant's stream and forwards selected layers to each receiver\n\nExplanation: An SFU receives one upload per participant and forwards the right layer to each receiver without mixing. Mixing into a composite is what an MCU does, saving client bandwidth at high server CPU cost; TURN is a transport fallback, not a topology.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "live-streaming-webrtc-and-latency",
    "unitTitle": "Live streaming, WebRTC, and latency"
  },
  {
    "id": "srs-quiz-live-streaming-webrtc-and-latency-c2",
    "type": "quiz",
    "prompt": "A classic HLS setup has about 2 s of encoding and packaging, 4 second segments that must finish before publishing, about 1 s of CDN delay, and a player that buffers 3 segments. Roughly what glass-to-glass latency should you expect?",
    "answer": "About 19 seconds\n\nExplanation: 2 s packaging + 4 s for the segment to complete + 1 s CDN + 3 x 4 s player buffer is about 19 seconds. The 7 second answer forgets the player buffer, which the lesson warns is usually the largest term.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "live-streaming-webrtc-and-latency",
    "unitTitle": "Live streaming, WebRTC, and latency"
  },
  {
    "id": "srs-quiz-live-streaming-webrtc-and-latency-c3",
    "type": "quiz",
    "prompt": "A team ships a peer-to-peer mesh for group calls where each participant sends a 2 Mbit/s stream. With 8 people in a call, what breaks first, and what does the lesson recommend?",
    "answer": "Each participant must upload about 14 Mbit/s, beyond most home uplinks; move to an SFU with simulcast layers\n\nExplanation: In a mesh each person sends 7 copies, 7 x 2 = 14 Mbit/s of upload, which most home connections cannot sustain; an SFU needs one upload (or a few simulcast layers) per participant. The download option gets the numbers wrong: each receiver also pulls 7 streams, about 14 Mbit/s, and the scarcer home resource is upload.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "live-streaming-webrtc-and-latency",
    "unitTitle": "Live streaming, WebRTC, and latency"
  },
  {
    "id": "srs-takeaway-remote-file-sync-design-1",
    "type": "takeaway",
    "prompt": "In Remote file sync design, what is a fundamental rule regarding: Split files into chunks (e?",
    "answer": "Split files into chunks (e.g., 4MB) to enable delta synchronization: upload only modified blocks.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "remote-file-sync-design",
    "unitTitle": "Remote file sync design"
  },
  {
    "id": "srs-takeaway-remote-file-sync-design-2",
    "type": "takeaway",
    "prompt": "In Remote file sync design, what is a fundamental rule regarding: Content hashes enable deduplication, but cross-user deduplication needs authorization, ownership-reference accounting, deletion semantics, and protection against existence-oracle attacks?",
    "answer": "Content hashes enable deduplication, but cross-user deduplication needs authorization, ownership-reference accounting, deletion semantics, and protection against existence-oracle attacks.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "remote-file-sync-design",
    "unitTitle": "Remote file sync design"
  },
  {
    "id": "srs-takeaway-remote-file-sync-design-3",
    "type": "takeaway",
    "prompt": "In Remote file sync design, what is a fundamental rule regarding: Use a local embedded SQLite database on client devices to track block manifests and sync state offline?",
    "answer": "Use a local embedded SQLite database on client devices to track block manifests and sync state offline.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "remote-file-sync-design",
    "unitTitle": "Remote file sync design"
  },
  {
    "id": "srs-quiz-remote-file-sync-design-c1",
    "type": "quiz",
    "prompt": "A sync client splits files into fixed 4 MB blocks and uploads only blocks whose SHA-256 changed. For which kind of edit does this delta scheme work poorly?",
    "answer": "Inserting data near the start of the file, which shifts every later block boundary\n\nExplanation: An insertion near the start shifts all later fixed boundaries, so almost every block hash changes and nearly the whole file re-uploads. In-place edits and appends change only one or two blocks, which is exactly where fixed blocks do well.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "remote-file-sync-design",
    "unitTitle": "Remote file sync design"
  },
  {
    "id": "srs-quiz-remote-file-sync-design-c2",
    "type": "quiz",
    "prompt": "A 1 GiB video project file is stored as 4 MiB blocks. An in-place edit changes 3 blocks. How many blocks does the file have, and how much does the client upload before committing?",
    "answer": "256 blocks; about 12 MiB\n\nExplanation: 1,024 MiB / 4 MiB = 256 blocks, and the server reports only the 3 changed hashes as missing, so the client uploads about 12 MiB, around 1 percent of the file. A changed blocklist is a small metadata commit, not a reason to re-upload unchanged blocks.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "remote-file-sync-design",
    "unitTitle": "Remote file sync design"
  },
  {
    "id": "srs-quiz-remote-file-sync-design-c3",
    "type": "quiz",
    "prompt": "Two laptops edit /deck.pptx offline, both starting from version 17. Laptop A reconnects and commits version 18. Laptop B then commits with base version 17. What should the server do, in the lesson's design?",
    "answer": "Reject B's base-version check and save B's version as a conflicted copy, so neither edit is lost\n\nExplanation: The commit is conditional on the base version still being current; B's base 17 no longer matches, so the server keeps B's edit as a conflicted copy rather than silently discarding A's work. Last writer wins is simple but causes silent data loss, and blocklist merging is not meaningful for arbitrary binary files.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "remote-file-sync-design",
    "unitTitle": "Remote file sync design"
  },
  {
    "id": "srs-takeaway-fixed-block-chunking-and-content-addressing-1",
    "type": "takeaway",
    "prompt": "In Fixed-block chunking and content addressing, what is a fundamental rule regarding: Content-Addressable Storage (CAS) uses cryptographic hashes as storage pointers to achieve automatic data deduplication?",
    "answer": "Content-Addressable Storage (CAS) uses cryptographic hashes as storage pointers to achieve automatic data deduplication.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "fixed-block-chunking-and-content-addressing",
    "unitTitle": "Fixed-block chunking and content addressing"
  },
  {
    "id": "srs-takeaway-fixed-block-chunking-and-content-addressing-2",
    "type": "takeaway",
    "prompt": "In Fixed-block chunking and content addressing, what is a fundamental rule regarding: Fixed-block chunking is vulnerable to boundary shift problems from byte insertions?",
    "answer": "Fixed-block chunking is vulnerable to boundary shift problems from byte insertions.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "fixed-block-chunking-and-content-addressing",
    "unitTitle": "Fixed-block chunking and content addressing"
  },
  {
    "id": "srs-takeaway-fixed-block-chunking-and-content-addressing-3",
    "type": "takeaway",
    "prompt": "In Fixed-block chunking and content addressing, what is a fundamental rule regarding: Variable-block chunking (Rabin fingerprints / FastCDC) detects natural content boundaries to resist shift issues?",
    "answer": "Variable-block chunking (Rabin fingerprints / FastCDC) detects natural content boundaries to resist shift issues.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "fixed-block-chunking-and-content-addressing",
    "unitTitle": "Fixed-block chunking and content addressing"
  },
  {
    "id": "srs-quiz-fixed-block-chunking-and-content-addressing-c1",
    "type": "quiz",
    "prompt": "Why does inserting a single byte at the start of a file destroy deduplication under fixed-block chunking?",
    "answer": "Because every later block boundary moves by one byte, so every block's contents and hash change\n\nExplanation: Fixed chunking cuts at every N bytes, so a one-byte insertion shifts all subsequent cuts and no block matches its old bytes. Block hashes depend only on the block's own contents, not on file size, which is why content-defined boundaries can recover alignment.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "fixed-block-chunking-and-content-addressing",
    "unitTitle": "Fixed-block chunking and content addressing"
  },
  {
    "id": "srs-quiz-fixed-block-chunking-and-content-addressing-c2",
    "type": "quiz",
    "prompt": "A 200 MB file is edited by inserting 10 bytes at offset 0. Compare fixed 4 MB blocks with the lesson's content-defined chunking (boundaries where the low 20 bits of a rolling hash are zero). Roughly how much must be re-uploaded in each case?",
    "answer": "Fixed about 200 MB; content-defined about 1 MB\n\nExplanation: With fixed blocks all 50 boundaries shift, so every block changes and the whole 200 MB goes up; with content-defined chunks averaging about 1 MiB, only the first chunk changes because later boundaries are found at the same content. Assuming the fixed scheme only resends the first block is the tempting mistake.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "fixed-block-chunking-and-content-addressing",
    "unitTitle": "Fixed-block chunking and content addressing"
  },
  {
    "id": "srs-quiz-fixed-block-chunking-and-content-addressing-c3",
    "type": "quiz",
    "prompt": "To save bandwidth, a sync server links a chunk into a user's account whenever the client sends a chunk hash that already exists in global storage, without uploading bytes. What vulnerability does the lesson describe?",
    "answer": "Anyone who learns a file's hashes can obtain the file, so hash-only uploads must still prove possession\n\nExplanation: In 2011 researchers showed Dropbox's client-side dedup let anyone who knew a file's hashes obtain it, so uploads must prove possession of the bytes, and cross-user dedup also acts as an existence oracle. Practical SHA-256 collisions are not the risk; the weakness is treating knowledge of a hash as proof of ownership.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "fixed-block-chunking-and-content-addressing",
    "unitTitle": "Fixed-block chunking and content addressing"
  },
  {
    "id": "srs-takeaway-blocklist-versioned-file-metadata-1",
    "type": "takeaway",
    "prompt": "In Blocklist versioned file metadata, what is a fundamental rule regarding: Represent files as ordered manifests of block hashes (blocklists)?",
    "answer": "Represent files as ordered manifests of block hashes (blocklists).",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "blocklist-versioned-file-metadata",
    "unitTitle": "Blocklist versioned file metadata"
  },
  {
    "id": "srs-takeaway-blocklist-versioned-file-metadata-2",
    "type": "takeaway",
    "prompt": "In Blocklist versioned file metadata, what is a fundamental rule regarding: Because blocks are immutable, version history and rollbacks only update lightweight metadata records?",
    "answer": "Because blocks are immutable, version history and rollbacks only update lightweight metadata records.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "blocklist-versioned-file-metadata",
    "unitTitle": "Blocklist versioned file metadata"
  },
  {
    "id": "srs-takeaway-blocklist-versioned-file-metadata-3",
    "type": "takeaway",
    "prompt": "In Blocklist versioned file metadata, what is a fundamental rule regarding: Use relational or document databases to query and traverse file metadata hierarchies rapidly?",
    "answer": "Use relational or document databases to query and traverse file metadata hierarchies rapidly.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "blocklist-versioned-file-metadata",
    "unitTitle": "Blocklist versioned file metadata"
  },
  {
    "id": "srs-quiz-blocklist-versioned-file-metadata-c1",
    "type": "quiz",
    "prompt": "A user rolls a 2 GB file back from version 9 to version 3. With immutable content-addressed blocks, what does the system actually do?",
    "answer": "Records a new commit pointing to version 3's blocklist, with no payload copied\n\nExplanation: Rollback is a metadata commit that points at the earlier blocklist, so it is nearly instant and copies nothing. Deleting later blocks is wrong because other versions may still reference them, and blocks are only reclaimed by garbage collection once unreferenced.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "blocklist-versioned-file-metadata",
    "unitTitle": "Blocklist versioned file metadata"
  },
  {
    "id": "srs-quiz-blocklist-versioned-file-metadata-c2",
    "type": "quiz",
    "prompt": "v1 is A, B, C, D. v2 edits the second block: A, B2, C, D. v3 edits the third block and appends: A, B2, C2, D, E. v4 rolls back to v2. How many blocks would naive full copies store, and how many unique blocks do blocklists need?",
    "answer": "17 naive, 7 unique\n\nExplanation: Naive storage is 4 + 4 + 5 + 4 = 17 blocks; unique blocks are A, B, C, D, B2, C2 and E, which is 7, and the rollback adds none. The 5 option counts only v1 plus the first edit, forgetting the new blocks from v3.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "blocklist-versioned-file-metadata",
    "unitTitle": "Blocklist versioned file metadata"
  },
  {
    "id": "srs-quiz-blocklist-versioned-file-metadata-c3",
    "type": "quiz",
    "prompt": "A mark-and-sweep collector deletes every block not reachable from a retained version. A client uploads new blocks, and its commit arrives 30 seconds later. Some commits now reference missing blocks. What design from the lesson prevents this?",
    "answer": "Only sweep unreferenced blocks older than a grace period, such as 7 days\n\nExplanation: A block uploaded but not yet committed looks unreferenced, so a grace window keeps recent uploads safe until their commit lands, as git gc also does. Reference counting is incremented on commit, not upload, so it has the same race and adds its own count drift.",
    "category": "Media Processing & CDN Distribution",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "blocklist-versioned-file-metadata",
    "unitTitle": "Blocklist versioned file metadata"
  },
  {
    "id": "srs-takeaway-nearby-geospatial-search-system-design-1",
    "type": "takeaway",
    "prompt": "In Nearby geospatial search, what is a fundamental rule regarding: Naive distance calculations do not scale?",
    "answer": "Naive distance calculations do not scale.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "nearby-geospatial-search-system-design",
    "unitTitle": "Nearby geospatial search"
  },
  {
    "id": "srs-takeaway-nearby-geospatial-search-system-design-2",
    "type": "takeaway",
    "prompt": "In Nearby geospatial search, what is a fundamental rule regarding: Spatial indexing converts 2D coordinates into 1D keys?",
    "answer": "Spatial indexing converts 2D coordinates into 1D keys.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "nearby-geospatial-search-system-design",
    "unitTitle": "Nearby geospatial search"
  },
  {
    "id": "srs-takeaway-nearby-geospatial-search-system-design-3",
    "type": "takeaway",
    "prompt": "In Nearby geospatial search, what is a fundamental rule regarding: PostGIS and Redis are excellent choices for geospatial workloads?",
    "answer": "PostGIS and Redis are excellent choices for geospatial workloads.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "nearby-geospatial-search-system-design",
    "unitTitle": "Nearby geospatial search"
  },
  {
    "id": "srs-quiz-nearby-geospatial-search-system-design-c1",
    "type": "quiz",
    "prompt": "A courier search for \"within 3 km\" fetches candidates from the spatial index cells covering the circle. One courier sits inside a covered cell, 2.1 km away, but last reported location five minutes ago. According to the lesson, what should happen to that courier?",
    "answer": "Drop it in the exact filter step, because a stale location fails the freshness cutoff\n\nExplanation: The index only generates a bounded candidate set; the exact step then filters by geodesic distance, availability, permissions and a freshness cutoff, so geometric closeness does not make a stale courier eligible. Treating the covering as proof is the classic mistake, since cells over-cover the circle and say nothing about freshness.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "nearby-geospatial-search-system-design",
    "unitTitle": "Nearby geospatial search"
  },
  {
    "id": "srs-quiz-nearby-geospatial-search-system-design-c2",
    "type": "quiz",
    "prompt": "Using the lesson's San Francisco example (2 km radius, precision 5 covering about 171 square km with 9 cells, precision 6 covering about 29 square km with 48 cells), suppose density is 200 places per square km. Roughly how many candidates does each covering return, and how many are real hits?",
    "answer": "Precision 5 about 34,000 and precision 6 about 5,800, with about 2,500 real hits\n\nExplanation: 171 x 200 is about 34,000 and 29 x 200 about 5,800, while the circle is only 12.6 square km, so about 2,500 places are truly within 2 km either way. Assuming every precision 6 candidate is a hit is tempting because the cells are small, but the covering still over-covers the circle, so the exact distance check is always needed.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "nearby-geospatial-search-system-design",
    "unitTitle": "Nearby geospatial search"
  },
  {
    "id": "srs-quiz-nearby-geospatial-search-system-design-c3",
    "type": "quiz",
    "prompt": "A team plans to shard a 150 million POI proximity index across 20 regional shards from day one. POIs change rarely and each index entry is about 50 bytes. What does the lesson's reasoning suggest instead?",
    "answer": "Keep the whole index, about 7.5 GB, in memory on stateless replicas updated from a change stream, and shard only if it outgrows a node\n\nExplanation: 150M x 50 bytes is about 7.5 GB, which fits in memory, so read-heavy traffic scales by adding stateless replicas; regional partitioning brings boundary queries, hot-city imbalance and handoff work. Sharding by ID hash is worse still, because every nearby query would have to touch every shard.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "nearby-geospatial-search-system-design",
    "unitTitle": "Nearby geospatial search"
  },
  {
    "id": "srs-takeaway-geohash-prefix-spatial-index-1",
    "type": "takeaway",
    "prompt": "In Geohash prefix spatial index, what is a fundamental rule regarding: Geohash encodes 2D coordinates into a 1D string?",
    "answer": "Geohash encodes 2D coordinates into a 1D string.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geohash-prefix-spatial-index",
    "unitTitle": "Geohash prefix spatial index"
  },
  {
    "id": "srs-takeaway-geohash-prefix-spatial-index-2",
    "type": "takeaway",
    "prompt": "In Geohash prefix spatial index, what is a fundamental rule regarding: Prefix matching enables fast proximity searches using B-Tree indexes?",
    "answer": "Prefix matching enables fast proximity searches using B-Tree indexes.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geohash-prefix-spatial-index",
    "unitTitle": "Geohash prefix spatial index"
  },
  {
    "id": "srs-takeaway-geohash-prefix-spatial-index-3",
    "type": "takeaway",
    "prompt": "In Geohash prefix spatial index, what is a fundamental rule regarding: Choose a covering large enough for the requested shape, then exact-filter candidates; nine cells are not universally sufficient?",
    "answer": "Choose a covering large enough for the requested shape, then exact-filter candidates; nine cells are not universally sufficient.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geohash-prefix-spatial-index",
    "unitTitle": "Geohash prefix spatial index"
  },
  {
    "id": "srs-quiz-geohash-prefix-spatial-index-c1",
    "type": "quiz",
    "prompt": "Two cafes are 15 metres apart but sit on opposite sides of a geohash cell border. Which statement about their geohashes is correct?",
    "answer": "They may share very little prefix, so prefix lookup alone can miss one; neighbour cells are needed\n\nExplanation: A shared prefix means the same rectangular cell, but nearby points across a border can have very different codes, which is why a covering includes neighbour cells and then filters exactly. The fixed-prefix idea is the tempting misconception; near the equator or prime meridian even the first character can differ.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geohash-prefix-spatial-index",
    "unitTitle": "Geohash prefix spatial index"
  },
  {
    "id": "srs-quiz-geohash-prefix-spatial-index-c2",
    "type": "quiz",
    "prompt": "Apply the lesson's encoding steps to Sydney (latitude -33.87, longitude 151.21): alternate bits starting with longitude, halving the range each time. What are the first five bits and the resulting first geohash character (base32 alphabet 0123456789bcdefghjkmnpqrstuvwxyz)?",
    "answer": "10111, giving r\n\nExplanation: Longitude 151 is at or above 0 (1), latitude -33.9 is below 0 (0), longitude is at or above 90 (1), latitude is at or above -45 (1), longitude is at or above 135 (1): 10111 = 23, which is r in the geohash alphabet. The 10110 option gets the last longitude step wrong; 151.21 is above the midpoint 135 of the range 90 to 180.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geohash-prefix-spatial-index",
    "unitTitle": "Geohash prefix spatial index"
  },
  {
    "id": "srs-quiz-geohash-prefix-spatial-index-c3",
    "type": "quiz",
    "prompt": "You need a 3 km radius search in Oslo (about 60 degrees north) and want center plus 8 neighbours to be guaranteed to cover the circle. Using the lesson's precision table, which choice is correct?",
    "answer": "Precision 4 with 9 cells, or precision 5 with every cell intersecting the bounding box, since precision 5 is only about 2.4 km wide here\n\nExplanation: Cell width shrinks with the cosine of latitude, so at 60 degrees a precision 5 cell is about 2.4 km wide, less than the 3 km radius, and 9 cells are no longer guaranteed; drop to precision 4 or compute the full covering. Precision 5 looks correct if you read the equatorial table without adjusting for latitude, which is exactly the trap.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geohash-prefix-spatial-index",
    "unitTitle": "Geohash prefix spatial index"
  },
  {
    "id": "srs-takeaway-geospatial-grid-systems-h3-s2-geohash-1",
    "type": "takeaway",
    "prompt": "In Grid systems: H3, S2, geohash, what is a fundamental rule regarding: Grid systems solve the 2D to 1D mapping problem?",
    "answer": "Grid systems solve the 2D to 1D mapping problem.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geospatial-grid-systems-h3-s2-geohash",
    "unitTitle": "Grid systems: H3, S2, geohash"
  },
  {
    "id": "srs-takeaway-geospatial-grid-systems-h3-s2-geohash-2",
    "type": "takeaway",
    "prompt": "In Grid systems: H3, S2, geohash, what is a fundamental rule regarding: S2 maps the earth to a cube and uses a Hilbert curve?",
    "answer": "S2 maps the earth to a cube and uses a Hilbert curve.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geospatial-grid-systems-h3-s2-geohash",
    "unitTitle": "Grid systems: H3, S2, geohash"
  },
  {
    "id": "srs-takeaway-geospatial-grid-systems-h3-s2-geohash-3",
    "type": "takeaway",
    "prompt": "In Grid systems: H3, S2, geohash, what is a fundamental rule regarding: H3 provides hierarchical mostly-hexagonal cells for aggregation and neighborhood traversal; it includes pentagons and does not replace exact distance or routing?",
    "answer": "H3 provides hierarchical mostly-hexagonal cells for aggregation and neighborhood traversal; it includes pentagons and does not replace exact distance or routing.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geospatial-grid-systems-h3-s2-geohash",
    "unitTitle": "Grid systems: H3, S2, geohash"
  },
  {
    "id": "srs-quiz-geospatial-grid-systems-h3-s2-geohash-c1",
    "type": "quiz",
    "prompt": "Uber's H3 is favoured for continuous neighbour traversal such as spreading demand to nearby cells. Which property of its cells is the main reason?",
    "answer": "Each hexagon has six neighbours that all share an edge and sit at one distance\n\nExplanation: Hexagons give six edge-sharing neighbours at a single distance, unlike rectangles whose diagonal neighbours are farther away, which makes k-ring spreading smooth. The Hilbert curve ordering belongs to S2; H3 IDs are hierarchical but not a locality-preserving range.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geospatial-grid-systems-h3-s2-geohash",
    "unitTitle": "Grid systems: H3, S2, geohash"
  },
  {
    "id": "srs-quiz-geospatial-grid-systems-h3-s2-geohash-c2",
    "type": "quiz",
    "prompt": "A surge-pricing team wants zones of about 5 square km across an 800 square km city. Using the lesson's H3 averages, which resolution fits and roughly how many cells cover the city?",
    "answer": "Resolution 7, about 150 cells\n\nExplanation: Resolution 7 hexagons average about 5.2 square km, so 800 / 5.2 is about 154 cells. Resolution 8 is the tempting pick from the lesson's own city example, but its 0.74 square km cells are about seven times smaller than the requested zone.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geospatial-grid-systems-h3-s2-geohash",
    "unitTitle": "Grid systems: H3, S2, geohash"
  },
  {
    "id": "srs-quiz-geospatial-grid-systems-h3-s2-geohash-c3",
    "type": "quiz",
    "prompt": "Finance wants billing totals per parent zone that exactly equal the sum of trips recorded at a finer resolution. The analytics team indexes trips by H3 resolution 9 and rolls up to parents. What problem should you raise?",
    "answer": "H3 parents nest approximately, so child cells do not exactly tile the parent and edge trips can be misassigned; S2 or geohash nest exactly\n\nExplanation: The comparison table lists H3 hierarchy as approximate nesting with 7 children, so parent totals from child cells are approximate at the edges, while S2 and geohash nest exactly. H3 does have parents; the issue is that seven children only approximately cover their parent.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geospatial-grid-systems-h3-s2-geohash",
    "unitTitle": "Grid systems: H3, S2, geohash"
  },
  {
    "id": "srs-takeaway-redis-geo-spatial-hot-path-1",
    "type": "takeaway",
    "prompt": "In Redis GEO hot path, what is a fundamental rule regarding: Redis GEO uses Geohashes stored in Sorted Sets?",
    "answer": "Redis GEO uses Geohashes stored in Sorted Sets.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "redis-geo-spatial-hot-path",
    "unitTitle": "Redis GEO hot path"
  },
  {
    "id": "srs-takeaway-redis-geo-spatial-hot-path-2",
    "type": "takeaway",
    "prompt": "In Redis GEO hot path, what is a fundamental rule regarding: It is optimized for low-latency, high-throughput in-memory queries?",
    "answer": "It is optimized for low-latency, high-throughput in-memory queries.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "redis-geo-spatial-hot-path",
    "unitTitle": "Redis GEO hot path"
  },
  {
    "id": "srs-takeaway-redis-geo-spatial-hot-path-3",
    "type": "takeaway",
    "prompt": "In Redis GEO hot path, what is a fundamental rule regarding: Regional partitioning can limit working sets, but boundary queries, hot cities, failover, and cross-region movement need explicit routing and rebalancing?",
    "answer": "Regional partitioning can limit working sets, but boundary queries, hot cities, failover, and cross-region movement need explicit routing and rebalancing.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "redis-geo-spatial-hot-path",
    "unitTitle": "Redis GEO hot path"
  },
  {
    "id": "srs-quiz-redis-geo-spatial-hot-path-c1",
    "type": "quiz",
    "prompt": "A driver's app crashes and stops sending locations. Why can you not simply set a TTL on that driver in the Redis GEO index?",
    "answer": "A TTL applies to the whole GEO sorted set key, not to a single member\n\nExplanation: Redis expiry is per key, and a GEO index is one sorted set, so stale members must be removed explicitly using separate freshness tracking. The option about GEOADD resetting TTLs sounds technical but misses the point: there is no member-level TTL to reset in the first place.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "redis-geo-spatial-hot-path",
    "unitTitle": "Redis GEO hot path"
  },
  {
    "id": "srs-quiz-redis-geo-spatial-hot-path-c2",
    "type": "quiz",
    "prompt": "Scale the lesson's example to 2 million active drivers reporting every 5 seconds, with the largest city holding 80,000 of them. Which estimate and conclusion are right?",
    "answer": "About 400,000 writes per second globally and 16,000 on the city key; memory is about 200 MB, so write rate and the hot key matter most\n\nExplanation: 2M / 5 s = 400,000 writes per second and 80,000 / 5 = 16,000 on the city key; at roughly 60 to 100 bytes per entry, 2M drivers is on the order of 200 MB. As in the lesson, memory is not the bottleneck; write rate and hot keys are, so the RAM-focused options misread the numbers.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "redis-geo-spatial-hot-path",
    "unitTitle": "Redis GEO hot path"
  },
  {
    "id": "srs-quiz-redis-geo-spatial-hot-path-c3",
    "type": "quiz",
    "prompt": "You run the lesson's design: a GEO key plus a last-seen sorted set per city, and a Lua sweeper every few seconds that removes drivers silent for 30 seconds. Why must each rider query still check last-seen on its results?",
    "answer": "Because the sweep can lag or stall, so stale drivers may still be in the GEO key when a query runs\n\nExplanation: The sweeper is periodic and can fall behind, so the query itself must reject candidates older than its freshness limit rather than trusting the index to be clean. The lesson's script removes members from both keys atomically, so the non-atomic option describes a problem the design already avoids.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "redis-geo-spatial-hot-path",
    "unitTitle": "Redis GEO hot path"
  },
  {
    "id": "srs-takeaway-geofencing-point-in-polygon-1",
    "type": "takeaway",
    "prompt": "In Geofencing: point in polygon, what is a fundamental rule regarding: Geofencing triggers events based on location boundaries?",
    "answer": "Geofencing triggers events based on location boundaries.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geofencing-point-in-polygon",
    "unitTitle": "Geofencing: point in polygon"
  },
  {
    "id": "srs-takeaway-geofencing-point-in-polygon-2",
    "type": "takeaway",
    "prompt": "In Geofencing: point in polygon, what is a fundamental rule regarding: Use a supported spatial index for bounding-box candidate filtering, then run the exact boundary-aware geometry predicate?",
    "answer": "Use a supported spatial index for bounding-box candidate filtering, then run the exact boundary-aware geometry predicate.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geofencing-point-in-polygon",
    "unitTitle": "Geofencing: point in polygon"
  },
  {
    "id": "srs-takeaway-geofencing-point-in-polygon-3",
    "type": "takeaway",
    "prompt": "In Geofencing: point in polygon, what is a fundamental rule regarding: Stream processing engines are ideal for evaluating continuous location updates against geofences?",
    "answer": "Stream processing engines are ideal for evaluating continuous location updates against geofences.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geofencing-point-in-polygon",
    "unitTitle": "Geofencing: point in polygon"
  },
  {
    "id": "srs-quiz-geofencing-point-in-polygon-c1",
    "type": "quiz",
    "prompt": "A driver waiting at an airport pickup boundary produces GPS fixes that alternate inside and outside every second. What must the system add so it does not fire a stream of enter and exit events?",
    "answer": "Persisted per-device membership plus hysteresis, consecutive fixes or a dwell interval before a transition\n\nExplanation: Membership alone does not define an event; you need the last state per device and a rule such as hysteresis or several consecutive fixes before emitting enter or exit. A finer index or a more precise test does not help, because the jitter is in the input positions, not in the geometry.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geofencing-point-in-polygon",
    "unitTitle": "Geofencing: point in polygon"
  },
  {
    "id": "srs-quiz-geofencing-point-in-polygon-c2",
    "type": "quiz",
    "prompt": "You have 20,000 zones averaging 500 vertices and 100,000 location updates per second. An R-tree on bounding boxes leaves about 2 candidate polygons per point. Roughly what exact-test load remains?",
    "answer": "About 200,000 exact tests and 100 million edge checks per second\n\nExplanation: 100,000 points x 2 candidates = 200,000 exact tests, each O(V) with 500 edges, about 100 million edge checks per second, which a handful of cores can handle. The 2 billion figure is the naive every-point-against-every-polygon load that the bounding-box stage exists to eliminate.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geofencing-point-in-polygon",
    "unitTitle": "Geofencing: point in polygon"
  },
  {
    "id": "srs-quiz-geofencing-point-in-polygon-c3",
    "type": "quiz",
    "prompt": "A geofence worker crashes and replays the last minute of location fixes on restart. Customers must not receive a second \"your courier has arrived\" notification. What does the lesson's pipeline rely on?",
    "answer": "Event IDs derived from device, polygon, polygon version and transition sequence, so replays produce the same ID for consumers to deduplicate\n\nExplanation: A deterministic event ID means a replayed transition yields the same ID, so consumers drop the duplicate. Random UUIDs are the tempting wrong choice: every replay would look like a brand new event, which is exactly what causes duplicate notifications.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "geofencing-point-in-polygon",
    "unitTitle": "Geofencing: point in polygon"
  },
  {
    "id": "srs-takeaway-ray-casting-point-in-polygon-1",
    "type": "takeaway",
    "prompt": "In Ray casting point in polygon, what is a fundamental rule regarding: Ray casting uses an odd/even intersection count to determine inclusion?",
    "answer": "Ray casting uses an odd/even intersection count to determine inclusion.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "ray-casting-point-in-polygon",
    "unitTitle": "Ray casting point in polygon"
  },
  {
    "id": "srs-takeaway-ray-casting-point-in-polygon-2",
    "type": "takeaway",
    "prompt": "In Ray casting point in polygon, what is a fundamental rule regarding: It runs in O(N) time relative to the number of polygon edges?",
    "answer": "It runs in O(N) time relative to the number of polygon edges.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "ray-casting-point-in-polygon",
    "unitTitle": "Ray casting point in polygon"
  },
  {
    "id": "srs-takeaway-ray-casting-point-in-polygon-3",
    "type": "takeaway",
    "prompt": "In Ray casting point in polygon, what is a fundamental rule regarding: Edge cases like passing through vertices require careful algorithmic handling?",
    "answer": "Edge cases like passing through vertices require careful algorithmic handling.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "ray-casting-point-in-polygon",
    "unitTitle": "Ray casting point in polygon"
  },
  {
    "id": "srs-quiz-ray-casting-point-in-polygon-c1",
    "type": "quiz",
    "prompt": "In ray casting, what problem does the half-open endpoint rule (count an edge only if exactly one endpoint is strictly above the ray) solve?",
    "answer": "It prevents a ray passing exactly through a vertex from counting two crossings\n\nExplanation: A ray through a vertex touches two edges, and the half-open rule ensures that vertex contributes once, which also skips horizontal edges. Boundary policy is separate: the lesson says to detect on-edge points explicitly before odd/even counting, not to rely on the vertex rule.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "ray-casting-point-in-polygon",
    "unitTitle": "Ray casting point in polygon"
  },
  {
    "id": "srs-quiz-ray-casting-point-in-polygon-c2",
    "type": "quiz",
    "prompt": "Triangle vertices are (0,0), (6,3) and (0,6). Test point (2,3) with a ray toward +x, using the lesson's standard loop. How many crossings are counted, and what is the verdict?",
    "answer": "1 crossing, so inside\n\nExplanation: Edge (0,0)-(6,3) is skipped since neither endpoint is strictly above y = 3; edge (6,3)-(0,6) counts and crosses at x = 6, right of the point; edge (0,6)-(0,0) crosses at x = 0, left of the point, so it does not count. That leaves 1 crossing, inside; counting both edges at vertex (6,3) would give 2 and the wrong answer.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "ray-casting-point-in-polygon",
    "unitTitle": "Ray casting point in polygon"
  },
  {
    "id": "srs-quiz-ray-casting-point-in-polygon-c3",
    "type": "quiz",
    "prompt": "An ops user draws a delivery zone as a self-intersecting five-pointed star. Your service uses crossing-number ray casting, while the admin map renders polygons with the SVG default fill rule. A courier in the star's centre is \"outside\" per the service but shown as inside on the map. Why?",
    "answer": "Even-odd treats the overlapping centre as a hole while the nonzero rule used by the map fills it\n\nExplanation: For self-intersecting shapes the two rules disagree: crossing number counts an even number of crossings at the centre and calls it outside, while winding number sees the boundary wrap the point and fills it; SVG's default is nonzero. Floating-point issues only affect points within a tiny tolerance of an edge, not the middle of a region.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "ray-casting-point-in-polygon",
    "unitTitle": "Ray casting point in polygon"
  },
  {
    "id": "srs-takeaway-seen-filtering-bloom-vs-exact-sets-1",
    "type": "takeaway",
    "prompt": "In Seen filtering: Bloom vs exact sets, what is a fundamental rule regarding: Exact sets use too much memory for high-volume historical tracking?",
    "answer": "Exact sets use too much memory for high-volume historical tracking.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "seen-filtering-bloom-vs-exact-sets",
    "unitTitle": "Seen filtering: Bloom vs exact sets"
  },
  {
    "id": "srs-takeaway-seen-filtering-bloom-vs-exact-sets-2",
    "type": "takeaway",
    "prompt": "In Seen filtering: Bloom vs exact sets, what is a fundamental rule regarding: Bloom filters save massive amounts of RAM in exchange for a small false positive rate?",
    "answer": "Bloom filters save massive amounts of RAM in exchange for a small false positive rate.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "seen-filtering-bloom-vs-exact-sets",
    "unitTitle": "Seen filtering: Bloom vs exact sets"
  },
  {
    "id": "srs-takeaway-seen-filtering-bloom-vs-exact-sets-3",
    "type": "takeaway",
    "prompt": "In Seen filtering: Bloom vs exact sets, what is a fundamental rule regarding: False positives mean skipping valid content, which is often an acceptable trade-off in feeds?",
    "answer": "False positives mean skipping valid content, which is often an acceptable trade-off in feeds.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "seen-filtering-bloom-vs-exact-sets",
    "unitTitle": "Seen filtering: Bloom vs exact sets"
  },
  {
    "id": "srs-quiz-seen-filtering-bloom-vs-exact-sets-c1",
    "type": "quiz",
    "prompt": "A feed checks a Bloom filter of seen item IDs before showing each candidate. What is the only kind of mistake the filter can make, and what does the user experience?",
    "answer": "A false positive: an unseen item is reported seen and silently skipped\n\nExplanation: Bloom filters say definitely not seen or possibly seen, so the only error is a false positive, which in a feed means a valid item is skipped, usually acceptable. False negatives cannot happen because every inserted item sets all of its bits.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "seen-filtering-bloom-vs-exact-sets",
    "unitTitle": "Seen filtering: Bloom vs exact sets"
  },
  {
    "id": "srs-quiz-seen-filtering-bloom-vs-exact-sets-c2",
    "type": "quiz",
    "prompt": "Monthly seen-filters are sized for 15,000 items at 1 percent (about 9.6 bits per item, 7 hashes). A heavy user racks up 45,000 impressions in one month. What happens to that user's filter?",
    "answer": "The false-positive rate climbs to roughly 40 percent, so many fresh items are wrongly skipped\n\nExplanation: At three times capacity only about 3.2 bits per item remain, and with 7 hashes the false-positive rate is (1 - e^-2.19)^7, roughly 40 percent, so the error climbs far faster than linearly. That is why the lesson says to monitor insert count and rotate or rebuild; false negatives still cannot occur.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "seen-filtering-bloom-vs-exact-sets",
    "unitTitle": "Seen filtering: Bloom vs exact sets"
  },
  {
    "id": "srs-quiz-seen-filtering-bloom-vs-exact-sets-c3",
    "type": "quiz",
    "prompt": "Using m = -n ln(p) / (ln 2)^2 and k = (m / n) ln 2, size a Bloom filter for 1,000,000 seen items at a 1 percent false-positive rate. What are the approximate memory and hash count?",
    "answer": "About 1.2 MB with 7 hash functions\n\nExplanation: m is about 9.59 bits per item, so 1M items need about 9.6 million bits, roughly 1.2 MB, and k = 9.59 x 0.693 is about 7. The 120 KB option is the lesson's figure for 100,000 items; memory scales linearly with n at a fixed error rate.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "seen-filtering-bloom-vs-exact-sets",
    "unitTitle": "Seen filtering: Bloom vs exact sets"
  },
  {
    "id": "srs-takeaway-matching-and-recommendation-algorithms-1",
    "type": "takeaway",
    "prompt": "In Matching and recommendation algorithms, what is a fundamental rule regarding: Recommendations use a funnel?",
    "answer": "Recommendations use a funnel: Candidate Generation (fast/light) followed by Ranking (slow/heavy).",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "matching-and-recommendation-algorithms",
    "unitTitle": "Matching and recommendation algorithms"
  },
  {
    "id": "srs-takeaway-matching-and-recommendation-algorithms-2",
    "type": "takeaway",
    "prompt": "In Matching and recommendation algorithms, what is a fundamental rule regarding: Vector embeddings and Approximate Nearest Neighbor (ANN) are standard for modern retrieval?",
    "answer": "Vector embeddings and Approximate Nearest Neighbor (ANN) are standard for modern retrieval.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "matching-and-recommendation-algorithms",
    "unitTitle": "Matching and recommendation algorithms"
  },
  {
    "id": "srs-takeaway-matching-and-recommendation-algorithms-3",
    "type": "takeaway",
    "prompt": "In Matching and recommendation algorithms, what is a fundamental rule regarding: Geospatial apps filter heavily by location before applying complex ranking models?",
    "answer": "Geospatial apps filter heavily by location before applying complex ranking models.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "matching-and-recommendation-algorithms",
    "unitTitle": "Matching and recommendation algorithms"
  },
  {
    "id": "srs-quiz-matching-and-recommendation-algorithms-c1",
    "type": "quiz",
    "prompt": "A ranking model trained with a \"messages exchanged after match\" feature shows a large offline gain but no improvement in production. What does the lesson identify as the cause?",
    "answer": "The feature is computed after the recommendation, so it leaks the label and cannot be reproduced at serving time\n\nExplanation: Features must be available at serving time; an outcome observed after the recommendation leaks the label, producing offline wins production cannot reproduce. Version mismatch is a real risk the lesson mentions, but it would not explain a gain that exists only because of a post-outcome feature.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "matching-and-recommendation-algorithms",
    "unitTitle": "Matching and recommendation algorithms"
  },
  {
    "id": "srs-quiz-matching-and-recommendation-algorithms-c2",
    "type": "quiz",
    "prompt": "In the lesson's 150 ms pipeline (retrieval 20 ms, filtering 5 ms, ranking 60 ms for 800 candidates, re-ranking 5 ms), a new ranker needs about 120 ms for 800 candidates, scaling roughly linearly with batch size. What is the most sensible way to keep the p99 budget?",
    "answer": "Pass about 400 candidates to the new ranker, bringing ranking near 60 ms\n\nExplanation: Filtering and re-ranking together take only 10 ms, so dropping them cannot absorb a 60 ms overrun; halving the ranked set restores ranking to about 60 ms and keeps the remaining budget for network hops and feature reads. Exact nearest neighbour search is far slower than ANN and would blow the retrieval budget.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "matching-and-recommendation-algorithms",
    "unitTitle": "Matching and recommendation algorithms"
  },
  {
    "id": "srs-quiz-matching-and-recommendation-algorithms-c3",
    "type": "quiz",
    "prompt": "A dating app ranks candidates purely by each viewer's predicted chance of liking them. After a month, the top 5 percent of profiles receive most impressions and complain of overload, while most users get few matches. What does the lesson recommend?",
    "answer": "Cap exposure for very popular profiles and rank on mutual-interest likelihood rather than one-sided attractiveness\n\nExplanation: Two-sided markets must balance attention, so systems cap exposure and optimise for mutual interest instead of one-sided appeal. The Elo option is tempting because it sounds like balancing, but the lesson notes Tinder moved away from Elo-style desirability toward models of mutual activity and preferences.",
    "category": "Geospatial Indexing & Proximity Search",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "matching-and-recommendation-algorithms",
    "unitTitle": "Matching and recommendation algorithms"
  },
  {
    "id": "srs-takeaway-information-retrieval-system-design-1",
    "type": "takeaway",
    "prompt": "In Information retrieval system design, what is a fundamental rule regarding: IR systems separate offline document indexing pipelines from online low-latency query scoring engines?",
    "answer": "IR systems separate offline document indexing pipelines from online low-latency query scoring engines.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "information-retrieval-system-design",
    "unitTitle": "Information retrieval system design"
  },
  {
    "id": "srs-takeaway-information-retrieval-system-design-2",
    "type": "takeaway",
    "prompt": "In Information retrieval system design, what is a fundamental rule regarding: Text analysis pipelines convert raw text into normalized tokens via character filters, tokenizers, and stemmers?",
    "answer": "Text analysis pipelines convert raw text into normalized tokens via character filters, tokenizers, and stemmers.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "information-retrieval-system-design",
    "unitTitle": "Information retrieval system design"
  },
  {
    "id": "srs-takeaway-information-retrieval-system-design-3",
    "type": "takeaway",
    "prompt": "In Information retrieval system design, what is a fundamental rule regarding: Search engines trade off transactional ACID mutations for immutable index segments optimized for fast inverted lookups?",
    "answer": "Search engines trade off transactional ACID mutations for immutable index segments optimized for fast inverted lookups.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "information-retrieval-system-design",
    "unitTitle": "Information retrieval system design"
  },
  {
    "id": "srs-quiz-information-retrieval-system-design-c1",
    "type": "quiz",
    "prompt": "Documents were indexed with a lowercase filter and a Porter stemmer, so the text \"Running shoes\" is stored as the terms run and shoe. A user searches for Running. Why must the query string go through the same token filters as the documents?",
    "answer": "Because the index only contains the analyzed terms, so an unanalyzed Running looks up a term that does not exist\n\nExplanation: The inverted index stores only the normalised tokens, so the query must be reduced to the same form (run) to find the postings. A scan of the dictionary is not what happens; an exact lookup for Running simply returns nothing.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "information-retrieval-system-design",
    "unitTitle": "Information retrieval system design"
  },
  {
    "id": "srs-quiz-information-retrieval-system-design-c2",
    "type": "quiz",
    "prompt": "In the 200 ms budget, the ML re-ranker gets 50 ms to score about 1,000 candidates. A data scientist wants it to score 10,000 candidates for better recall, and per-candidate cost is constant. What is the most sensible response?",
    "answer": "Keep the heavy model on about 1,000 candidates and, if more recall is needed, add a cheap intermediate ranking stage that narrows 10,000 down to 1,000\n\nExplanation: At constant per-candidate cost, 10,000 candidates would take about 500 ms, so the fix is to deepen the funnel with a cheaper stage rather than feed the expensive one more work. The 40 ms headroom is nowhere near 450 ms extra and exists to absorb GC pauses and slow shards.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "information-retrieval-system-design",
    "unitTitle": "Information retrieval system design"
  },
  {
    "id": "srs-quiz-information-retrieval-system-design-c3",
    "type": "quiz",
    "prompt": "A team adds a synonym rule mapping sneakers to trainers in the index-time analyzer and deploys it to the live index without reindexing. Over the following weeks, what do users experience?",
    "answer": "Recently indexed or updated products match both words while older ones match only their original wording, so results depend on document age\n\nExplanation: Only documents analyzed after the change get the extra tokens, so old and new documents disagree about what a term is: classic analyzer drift that only a reindex fixes. Segment merges combine existing postings; they do not re-run analysis on the original text.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "information-retrieval-system-design",
    "unitTitle": "Information retrieval system design"
  },
  {
    "id": "srs-takeaway-inverted-index-and-posting-lists-1",
    "type": "takeaway",
    "prompt": "In Inverted index and posting lists, what is a fundamental rule regarding: Inverted indexes reverse document storage to map terms to strictly sorted lists of document IDs called Postings Lists?",
    "answer": "Inverted indexes reverse document storage to map terms to strictly sorted lists of document IDs called Postings Lists.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "inverted-index-and-posting-lists",
    "unitTitle": "Inverted index and posting lists"
  },
  {
    "id": "srs-takeaway-inverted-index-and-posting-lists-2",
    "type": "takeaway",
    "prompt": "In Inverted index and posting lists, what is a fundamental rule regarding: Keeping postings lists sorted enables O(N + M) two-pointer linear intersection for Boolean AND queries?",
    "answer": "Keeping postings lists sorted enables O(N + M) two-pointer linear intersection for Boolean AND queries.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "inverted-index-and-posting-lists",
    "unitTitle": "Inverted index and posting lists"
  },
  {
    "id": "srs-takeaway-inverted-index-and-posting-lists-3",
    "type": "takeaway",
    "prompt": "In Inverted index and posting lists, what is a fundamental rule regarding: Delta (gap) encoding combined with Variable-Byte or Frame of Reference (FoR) compression slashes index storage by 70-80%?",
    "answer": "Delta (gap) encoding combined with Variable-Byte or Frame of Reference (FoR) compression slashes index storage by 70-80%.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "inverted-index-and-posting-lists",
    "unitTitle": "Inverted index and posting lists"
  },
  {
    "id": "srs-takeaway-inverted-index-and-posting-lists-4",
    "type": "takeaway",
    "prompt": "In Inverted index and posting lists, what is a fundamental rule regarding: Champion lists keep a short per-term list of the highest-weight documents, while tiered indexes partition the corpus by static quality; both let most queries avoid scanning full postings lists?",
    "answer": "Champion lists keep a short per-term list of the highest-weight documents, while tiered indexes partition the corpus by static quality; both let most queries avoid scanning full postings lists.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "inverted-index-and-posting-lists",
    "unitTitle": "Inverted index and posting lists"
  },
  {
    "id": "srs-quiz-inverted-index-and-posting-lists-c1",
    "type": "quiz",
    "prompt": "An engineer proposes appending doc IDs to postings lists in arrival order to make indexing cheaper. Which capability is lost most directly?",
    "answer": "Answering AND queries with a single two-pointer merge in time proportional to the sum of list lengths\n\nExplanation: The two-pointer merge only works because both cursors move forward through ascending IDs; unsorted lists force nested-loop or hash-based intersection. Document frequency is just the list length and does not depend on order.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "inverted-index-and-posting-lists",
    "unitTitle": "Inverted index and posting lists"
  },
  {
    "id": "srs-quiz-inverted-index-and-posting-lists-c2",
    "type": "quiz",
    "prompt": "A postings list holds doc IDs 1000, 1004, 1008, 1020, 1200. After delta encoding, each value is stored with Variable-Byte encoding (7 payload bits per byte). How many bytes does the list take?",
    "answer": "7 bytes, because the first value 1000 and the gap of 180 each need two bytes\n\nExplanation: The gaps are 1000, 4, 4, 12, 180; values below 128 take one byte and values from 128 to 16,383 take two, giving 2 + 1 + 1 + 1 + 2 = 7 bytes versus 20 raw. The tempting 6-byte answer forgets that a gap of 180 is still at least 128.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "inverted-index-and-posting-lists",
    "unitTitle": "Inverted index and posting lists"
  },
  {
    "id": "srs-quiz-inverted-index-and-posting-lists-c3",
    "type": "quiz",
    "prompt": "Each term keeps a champion list of its top 200 documents by per-term weight, and queries fall back to full postings only when too few candidates are found. For a two-term query, which document is most at risk of being missed even though it is the true best match?",
    "answer": "A document that is moderately strong for both terms but not in the top 200 for either one\n\nExplanation: Champion lists are built per term, so a document that wins only through the combination of terms can sit outside both lists, and the fallback never fires as long as enough other candidates were found. A document present in either champion list is at least considered.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "inverted-index-and-posting-lists",
    "unitTitle": "Inverted index and posting lists"
  },
  {
    "id": "srs-takeaway-boolean-tiered-search-1",
    "type": "takeaway",
    "prompt": "In Boolean and tiered search, what is a fundamental rule regarding: Tiered indexes partition documents into quality tiers based on static authority and popularity signals?",
    "answer": "Tiered indexes partition documents into quality tiers based on static authority and popularity signals.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "boolean-tiered-search",
    "unitTitle": "Boolean and tiered search"
  },
  {
    "id": "srs-takeaway-boolean-tiered-search-2",
    "type": "takeaway",
    "prompt": "In Boolean and tiered search, what is a fundamental rule regarding: A measured workload may terminate many queries in a high-quality tier; latency and coverage must be evaluated rather than assumed?",
    "answer": "A measured workload may terminate many queries in a high-quality tier; latency and coverage must be evaluated rather than assumed.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "boolean-tiered-search",
    "unitTitle": "Boolean and tiered search"
  },
  {
    "id": "srs-takeaway-boolean-tiered-search-3",
    "type": "takeaway",
    "prompt": "In Boolean and tiered search, what is a fundamental rule regarding: Lower tiers are evaluated lazily only when high-tier matching yields insufficient candidates?",
    "answer": "Lower tiers are evaluated lazily only when high-tier matching yields insufficient candidates.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "boolean-tiered-search",
    "unitTitle": "Boolean and tiered search"
  },
  {
    "id": "srs-quiz-boolean-tiered-search-c1",
    "type": "quiz",
    "prompt": "A search system partitions documents into quality tiers. Which statement describes what the tiering is allowed to change?",
    "answer": "Only which eligible documents are examined first; MUST clauses and access filters apply identically in every tier\n\nExplanation: Quality tiers are a speed optimisation over the same eligibility rules; the lesson warns explicitly against using a tier to relax required terms or authorization filters. Relaxing MUST clauses in lower tiers changes the answer, not just the cost.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "boolean-tiered-search",
    "unitTitle": "Boolean and tiered search"
  },
  {
    "id": "srs-quiz-boolean-tiered-search-c2",
    "type": "quiz",
    "prompt": "A query is kafka AND streams AND exactly-once. Postings lengths are kafka 400,000, streams 3,000,000 and exactly-once 20,000. Which pair should the engine intersect first?",
    "answer": "exactly-once with kafka, because the two shortest lists produce the smallest intermediate set\n\nExplanation: Rarest first means sorting by postings length and intersecting the two shortest lists, 20,000 and 400,000, so the tiny result can then gallop through the 3,000,000-entry list. Pairing the rarest with the longest list first still leaves a larger intermediate set than pairing the two rarest.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "boolean-tiered-search",
    "unitTitle": "Boolean and tiered search"
  },
  {
    "id": "srs-quiz-boolean-tiered-search-c3",
    "type": "quiz",
    "prompt": "Tier 1 holds the top 10 percent of documents by static quality, and the engine stops if tier 1 returns at least 20 matches. Which situation is the classic way this design silently returns a worse answer?",
    "answer": "Tier 1 has 20 weak textual matches, so a tier-2 document with a far stronger match for the query is never scored\n\nExplanation: Stopping at K tier-1 matches trades recall for latency: a lower-quality document with a much better textual match can deserve to outrank tier-1 documents but is never examined. Zero matches is not the failure, because that case is exactly when the cascade to tier 2 fires.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "boolean-tiered-search",
    "unitTitle": "Boolean and tiered search"
  },
  {
    "id": "srs-takeaway-tf-idf-relevance-scoring-1",
    "type": "takeaway",
    "prompt": "In TF-IDF relevance scoring, what is a fundamental rule regarding: TF measures how often a term appears in a document; logarithmic damping prevents term-stuffing manipulation?",
    "answer": "TF measures how often a term appears in a document; logarithmic damping prevents term-stuffing manipulation.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "tf-idf-relevance-scoring",
    "unitTitle": "TF-IDF relevance scoring"
  },
  {
    "id": "srs-takeaway-tf-idf-relevance-scoring-2",
    "type": "takeaway",
    "prompt": "In TF-IDF relevance scoring, what is a fundamental rule regarding: IDF penalizes ubiquitous common words and boosts rare, highly informative keywords?",
    "answer": "IDF penalizes ubiquitous common words and boosts rare, highly informative keywords.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "tf-idf-relevance-scoring",
    "unitTitle": "TF-IDF relevance scoring"
  },
  {
    "id": "srs-takeaway-tf-idf-relevance-scoring-3",
    "type": "takeaway",
    "prompt": "In TF-IDF relevance scoring, what is a fundamental rule regarding: The Vector Space Model computes document relevance via cosine similarity between query and document vectors?",
    "answer": "The Vector Space Model computes document relevance via cosine similarity between query and document vectors.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "tf-idf-relevance-scoring",
    "unitTitle": "TF-IDF relevance scoring"
  },
  {
    "id": "srs-quiz-tf-idf-relevance-scoring-c1",
    "type": "quiz",
    "prompt": "In a corpus of 10 million documents, the term system appears in 9 million of them and the term paxos in 2,000. What does the IDF factor do to their weights?",
    "answer": "It gives system a weight near zero and paxos a high weight, because rare terms discriminate between documents\n\nExplanation: IDF is a global rarity factor: a term in almost every document carries almost no information, while a rare term strongly separates relevant documents. Length normalisation is the job of cosine or BM25's b parameter, not IDF.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "tf-idf-relevance-scoring",
    "unitTitle": "TF-IDF relevance scoring"
  },
  {
    "id": "srs-quiz-tf-idf-relevance-scoring-c2",
    "type": "quiz",
    "prompt": "N = 1,000,000. IDF with ln(1 + N/DF): paxos (DF 1,000) is 6.91, data (DF 500,000) is 1.10. Doc A has paxos once and data 30 times. Doc B has paxos 3 times and data 5 times. Which document wins under raw TF x IDF and under TF = 1 + ln f?",
    "answer": "A wins under raw TF (about 39.9 vs 26.2), B wins under log TF (about 17.4 vs 11.7)\n\nExplanation: Raw: A = 6.91 + 33 = 39.9 versus B = 20.7 + 5.5 = 26.2. Log: A = 6.91 + 4.40 x 1.10 = 11.7 versus B = 2.10 x 6.91 + 2.61 x 1.10 = 17.4, so damping stops repetition of a common word from beating the rare, decisive term.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "tf-idf-relevance-scoring",
    "unitTitle": "TF-IDF relevance scoring"
  },
  {
    "id": "srs-quiz-tf-idf-relevance-scoring-c3",
    "type": "quiz",
    "prompt": "A small index is split over 5 shards, and a burst of new documents about kubernetes all landed on shard 3. Users report that the same kind of kubernetes document ranks very differently depending on which shard holds it. What is the cause and the standard fix?",
    "answer": "IDF is computed per shard, so kubernetes looks common on shard 3 and rare elsewhere; dfs_query_then_fetch gathers global term statistics first at the cost of an extra round trip\n\nExplanation: Each shard scores with its own document frequencies, so uneven distribution gives the same term different IDF values; the DFS mode collects global statistics before scoring. A mapping mismatch would change which documents match, not just how the same documents score.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "tf-idf-relevance-scoring",
    "unitTitle": "TF-IDF relevance scoring"
  },
  {
    "id": "srs-takeaway-bm25-production-ranking-1",
    "type": "takeaway",
    "prompt": "In BM25 production ranking, what is a fundamental rule regarding: BM25 prevents keyword spam by asymptotically saturating term frequency scores as count increases?",
    "answer": "BM25 prevents keyword spam by asymptotically saturating term frequency scores as count increases.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "bm25-production-ranking",
    "unitTitle": "BM25 production ranking"
  },
  {
    "id": "srs-takeaway-bm25-production-ranking-2",
    "type": "takeaway",
    "prompt": "In BM25 production ranking, what is a fundamental rule regarding: The k1 parameter (~1?",
    "answer": "The k1 parameter (~1.2) controls term frequency saturation non-linearity.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "bm25-production-ranking",
    "unitTitle": "BM25 production ranking"
  },
  {
    "id": "srs-takeaway-bm25-production-ranking-3",
    "type": "takeaway",
    "prompt": "In BM25 production ranking, what is a fundamental rule regarding: The b parameter (~0?",
    "answer": "The b parameter (~0.75) penalizes verbose, long documents relative to average document length.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "bm25-production-ranking",
    "unitTitle": "BM25 production ranking"
  },
  {
    "id": "srs-quiz-bm25-production-ranking-c1",
    "type": "quiz",
    "prompt": "An engineer sets b = 0 on a BM25 field. What changes compared with the default b = 0.75?",
    "answer": "Document length no longer affects the score, so a long document is not penalised for its length\n\nExplanation: b controls length normalisation: at b = 0 the dl/avgdl term vanishes, and at b = 1 length is fully normalised. Saturation is governed by k1, which is untouched, so repetition still has diminishing returns.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "bm25-production-ranking",
    "unitTitle": "BM25 production ranking"
  },
  {
    "id": "srs-quiz-bm25-production-ranking-c2",
    "type": "quiz",
    "prompt": "With k1 = 1.2, b = 0.75 and a document of exactly average length, a single mention of a term gives a TF component of 1.00. A spam page of the same length repeats the term 100 times. Roughly how much larger is its TF component?",
    "answer": "About 2.2 times, because the component approaches k1 + 1 no matter how many repeats\n\nExplanation: The worked table shows 100 mentions in an average document scores 2.17 versus 1.00 for one mention, bounded by the ceiling k1 + 1 = 2.2. The 5.6 times figure is what log TF would give, which grows without bound and is exactly what BM25 improves on.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "bm25-production-ranking",
    "unitTitle": "BM25 production ranking"
  },
  {
    "id": "srs-quiz-bm25-production-ranking-c3",
    "type": "quiz",
    "prompt": "A service shows a \"no good match\" banner whenever the top BM25 score is below 8.0. After upgrading to Lucene 8, the banner suddenly appears on many queries, yet result order is unchanged. What happened?",
    "answer": "Lucene 8 dropped the constant (k1 + 1) factor, rescaling every score without changing ranking, so a fixed absolute threshold broke\n\nExplanation: Removing a constant multiplier scales all scores equally, so ranking is unchanged but any logic that treats raw BM25 values as absolute quality signals breaks. BM25 scores are only meaningful for ordering within one query; the default similarity remained BM25.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "bm25-production-ranking",
    "unitTitle": "BM25 production ranking"
  },
  {
    "id": "srs-takeaway-stop-words-and-champion-lists-1",
    "type": "takeaway",
    "prompt": "In Stop words and champion lists, what is a fundamental rule regarding: Champion lists precompute the top R highest-scoring documents per term, answering top-K queries in RAM?",
    "answer": "Champion lists precompute the top R highest-scoring documents per term, answering top-K queries in RAM.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "stop-words-and-champion-lists",
    "unitTitle": "Stop words and champion lists"
  },
  {
    "id": "srs-takeaway-stop-words-and-champion-lists-2",
    "type": "takeaway",
    "prompt": "In Stop words and champion lists, what is a fundamental rule regarding: Modern search engines avoid hard stop word deletion to preserve phrase semantics ('The Who')?",
    "answer": "Modern search engines avoid hard stop word deletion to preserve phrase semantics ('The Who').",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "stop-words-and-champion-lists",
    "unitTitle": "Stop words and champion lists"
  },
  {
    "id": "srs-takeaway-stop-words-and-champion-lists-3",
    "type": "takeaway",
    "prompt": "In Stop words and champion lists, what is a fundamental rule regarding: Block-Max WAND dynamically skips postings blocks whose upper-bound scores cannot beat the current top-K threshold?",
    "answer": "Block-Max WAND dynamically skips postings blocks whose upper-bound scores cannot beat the current top-K threshold.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "stop-words-and-champion-lists",
    "unitTitle": "Stop words and champion lists"
  },
  {
    "id": "srs-quiz-stop-words-and-champion-lists-c1",
    "type": "quiz",
    "prompt": "Why do modern engines keep words such as the and to in the index rather than stripping them at index time?",
    "answer": "Because phrase and name queries such as The Who or to be or not to be become impossible otherwise; the cost is handled at query time by pruning\n\nExplanation: Removing stop words destroys queries where they carry meaning; modern engines keep them and use common-grams, positional indexes and WAND-style pruning to avoid paying for their huge lists. Their lists remain huge even when compressed, which is why pruning matters.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "stop-words-and-champion-lists",
    "unitTitle": "Stop words and champion lists"
  },
  {
    "id": "srs-quiz-stop-words-and-champion-lists-c2",
    "type": "quiz",
    "prompt": "The current 10th-best score is 9.0. Per-term upper bounds are kafka 6.5, streams 2.0, apache 1.2 and the 0.1. Which candidate document must WAND actually score, rather than skip?",
    "answer": "A document containing kafka, streams and apache\n\nExplanation: Only kafka + streams + apache has an upper bound of 9.7, which could beat 9.0; the others top out at 3.3, 8.5 and 7.8, so they cannot enter the top 10 and are skipped. kafka and streams alone looks close but 8.5 is still below the threshold.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "stop-words-and-champion-lists",
    "unitTitle": "Stop words and champion lists"
  },
  {
    "id": "srs-quiz-stop-words-and-champion-lists-c3",
    "type": "quiz",
    "prompt": "You must choose r, the champion list length per term, for a system returning K = 20 results. What is the defensible way to pick r?",
    "answer": "Measure recall at K on a real query log against full evaluation for several values of r, and pick the smallest r that meets the recall target within the RAM budget\n\nExplanation: Champion lists are an approximation whose recall depends on the query mix, so r must be chosen empirically, larger than K, trading RAM for recall. Eliminating fallback entirely is the wrong goal; fallback is the safety valve and a few percent of queries using it is expected.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "stop-words-and-champion-lists",
    "unitTitle": "Stop words and champion lists"
  },
  {
    "id": "srs-takeaway-query-understanding-pipeline-1",
    "type": "takeaway",
    "prompt": "In Query understanding pipeline, what is a fundamental rule regarding: Query understanding bridges the semantic gap between imprecise user searches and structured index schemas?",
    "answer": "Query understanding bridges the semantic gap between imprecise user searches and structured index schemas.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "query-understanding-pipeline",
    "unitTitle": "Query understanding pipeline"
  },
  {
    "id": "srs-takeaway-query-understanding-pipeline-2",
    "type": "takeaway",
    "prompt": "In Query understanding pipeline, what is a fundamental rule regarding: Sub-10ms NER models extract structured attributes (brands, sizes, categories) to build filtered queries?",
    "answer": "Sub-10ms NER models extract structured attributes (brands, sizes, categories) to build filtered queries.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "query-understanding-pipeline",
    "unitTitle": "Query understanding pipeline"
  },
  {
    "id": "srs-takeaway-query-understanding-pipeline-3",
    "type": "takeaway",
    "prompt": "In Query understanding pipeline, what is a fundamental rule regarding: Query relaxation and synonym expansions prevent zero-result dead ends?",
    "answer": "Query relaxation and synonym expansions prevent zero-result dead ends.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "query-understanding-pipeline",
    "unitTitle": "Query understanding pipeline"
  },
  {
    "id": "srs-quiz-query-understanding-pipeline-c1",
    "type": "quiz",
    "prompt": "The pipeline expands hoodie to sweatshirt. Why is the expanded term given a lower weight, such as 0.5, than the original term?",
    "answer": "So that documents matching the exact term the user typed rank above documents that match only the synonym\n\nExplanation: Discounting keeps the recall benefit of synonyms while ensuring exact matches win; letting synonyms outrank exact matches is a named trap. The weight is a ranking choice, not a storage or scoring-engine limitation.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "query-understanding-pipeline",
    "unitTitle": "Query understanding pipeline"
  },
  {
    "id": "srs-quiz-query-understanding-pipeline-c2",
    "type": "quiz",
    "prompt": "Query: blue adidas hoodie size m. The tagger reports brand adidas (confidence 0.97), category hoodies (0.95) and colour blue (0.60). The catalogue has Adidas hoodies in size M, but none in blue. Which rewrite serves the user best?",
    "answer": "Filter on brand and category, boost colour and size, and text-match hoodie with synonyms at a lower weight\n\nExplanation: High-confidence tags become hard filters while low-confidence or optional attributes become boosts, so the user still sees Adidas hoodies in M instead of an empty page. Filtering on the 0.60-confidence colour is exactly the trap that produces zero results.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "query-understanding-pipeline",
    "unitTitle": "Query understanding pipeline"
  },
  {
    "id": "srs-quiz-query-understanding-pipeline-c3",
    "type": "quiz",
    "prompt": "A team proposes sending every query through an LLM rewriter, while the query understanding stage has a budget of about 10 ms at p99 for 50,000 queries per second. What is the sound architecture?",
    "answer": "Precompute and cache rewrites for head queries, use dictionaries and fast taggers online, and reserve the LLM for tail queries, cached or run offline\n\nExplanation: LLM rewriting handles complex language but costs latency and money, so it belongs on the long tail with caching, while head traffic is served from precomputed results. Running it on every query in parallel still pays its full cost at 50,000 QPS for output that is often thrown away.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "query-understanding-pipeline",
    "unitTitle": "Query understanding pipeline"
  },
  {
    "id": "srs-takeaway-search-feedback-and-relevance-signals-1",
    "type": "takeaway",
    "prompt": "In Search feedback and relevance signals, what is a fundamental rule regarding: Production search operates in two stages?",
    "answer": "Production search operates in two stages: fast lexical/vector candidate retrieval (Top 1,000) followed by heavy ML reranking (Top 20).",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-feedback-and-relevance-signals",
    "unitTitle": "Search feedback and relevance signals"
  },
  {
    "id": "srs-takeaway-search-feedback-and-relevance-signals-2",
    "type": "takeaway",
    "prompt": "In Search feedback and relevance signals, what is a fundamental rule regarding: Learning-to-Rank models (LambdaMART, GBDT) combine BM25, static document quality, and personalized user affinity?",
    "answer": "Learning-to-Rank models (LambdaMART, GBDT) combine BM25, static document quality, and personalized user affinity.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-feedback-and-relevance-signals",
    "unitTitle": "Search feedback and relevance signals"
  },
  {
    "id": "srs-takeaway-search-feedback-and-relevance-signals-3",
    "type": "takeaway",
    "prompt": "In Search feedback and relevance signals, what is a fundamental rule regarding: Position bias must be counteracted using Inverse Propensity Scoring to prevent self-reinforcing click feedback loops?",
    "answer": "Position bias must be counteracted using Inverse Propensity Scoring to prevent self-reinforcing click feedback loops.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-feedback-and-relevance-signals",
    "unitTitle": "Search feedback and relevance signals"
  },
  {
    "id": "srs-quiz-search-feedback-and-relevance-signals-c1",
    "type": "quiz",
    "prompt": "A ranker is retrained every night on the previous day's raw click-through rates. What long-run behaviour does this produce?",
    "answer": "It entrenches whatever is already ranked high, because top positions get more clicks regardless of relevance\n\nExplanation: Position bias means clicks partly reflect where an item was shown, so training on raw CTR rewards the current ranking and cements it. Positions do not receive equal attention, which is exactly why inverse propensity scoring is needed.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-feedback-and-relevance-signals",
    "unitTitle": "Search feedback and relevance signals"
  },
  {
    "id": "srs-quiz-search-feedback-and-relevance-signals-c2",
    "type": "quiz",
    "prompt": "Examination propensities are 1.00 at position 1, 0.25 at position 4 and 0.12 at position 8. Observed clicks: 300 for the document at position 1, 90 at position 4 and 40 at position 8. Which document shows the strongest relevance signal after inverse propensity weighting?",
    "answer": "The document at position 4, with 360 weighted clicks\n\nExplanation: Dividing clicks by propensity gives 300, 360 and about 333, so the position-4 document is strongest once you account for how rarely it is examined. Position 8 looks tempting because its weight grows most, but 40 / 0.12 is still below 90 / 0.25.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-feedback-and-relevance-signals",
    "unitTitle": "Search feedback and relevance signals"
  },
  {
    "id": "srs-quiz-search-feedback-and-relevance-signals-c3",
    "type": "quiz",
    "prompt": "The product team adds a bold Bestseller badge to some listings. Two months later the CTR-trained ranker pushes badged items up for queries where they are clearly less relevant. What is the right correction?",
    "answer": "Include presentation features such as the badge in the model or control for them, so its effect on CTR is not credited to relevance\n\nExplanation: Badges and bigger images change CTR independently of relevance; modelling or controlling for presentation separates that effect from true relevance. Discarding all badged impressions throws away data and leaves the bias unmodelled for future presentation changes.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-feedback-and-relevance-signals",
    "unitTitle": "Search feedback and relevance signals"
  },
  {
    "id": "srs-takeaway-search-evaluation-metrics-1",
    "type": "takeaway",
    "prompt": "In Search evaluation metrics, what is a fundamental rule regarding: NDCG (Normalized Discounted Cumulative Gain) is the gold standard metric for graded relevance rankings?",
    "answer": "NDCG (Normalized Discounted Cumulative Gain) is the gold standard metric for graded relevance rankings.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-evaluation-metrics",
    "unitTitle": "Search evaluation metrics"
  },
  {
    "id": "srs-takeaway-search-evaluation-metrics-2",
    "type": "takeaway",
    "prompt": "In Search evaluation metrics, what is a fundamental rule regarding: Precision@K measures top-slot purity; Recall@K measures corpus coverage?",
    "answer": "Precision@K measures top-slot purity; Recall@K measures corpus coverage.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-evaluation-metrics",
    "unitTitle": "Search evaluation metrics"
  },
  {
    "id": "srs-takeaway-search-evaluation-metrics-3",
    "type": "takeaway",
    "prompt": "In Search evaluation metrics, what is a fundamental rule regarding: Interleaved A/B testing blends candidate rankings to detect statistically significant user preference with far fewer queries than traditional A/B testing (see?",
    "answer": "Interleaved A/B testing blends candidate rankings to detect statistically significant user preference with far fewer queries than traditional A/B testing (see: Radlinski & Craswell, 'Comparing the Sensitivity of Information Retrieval Metrics', SIGIR 2010).",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-evaluation-metrics",
    "unitTitle": "Search evaluation metrics"
  },
  {
    "id": "srs-quiz-search-evaluation-metrics-c1",
    "type": "quiz",
    "prompt": "Why is Recall@K rarely reported as a headline metric for open web or large product search, even though it appears in every IR textbook?",
    "answer": "Its denominator, the total number of relevant documents in the corpus, is usually unknown outside a judged test collection\n\nExplanation: Recall divides by all relevant documents in the corpus, which you only know on judged collections; that is why it suits legal discovery benchmarks rather than live web search. Recall is binary, but it does not break with graded labels; they are simply thresholded.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-evaluation-metrics",
    "unitTitle": "Search evaluation metrics"
  },
  {
    "id": "srs-quiz-search-evaluation-metrics-c2",
    "type": "quiz",
    "prompt": "A query returns three results with graded relevance [0, 3, 2]. Using gain 2 to the power rel minus 1 and discount log2 of position plus 1, which set of values is correct?",
    "answer": "Precision@3 0.67, reciprocal rank 0.50, NDCG@3 about 0.67\n\nExplanation: Two of three results are relevant (0.67), the first relevant one is at position 2 (RR 0.5), and DCG = 7/1.585 + 3/2 = 5.92 versus ideal 7 + 3/1.585 = 8.89, giving about 0.67. The 0.83 option forgets that the grade-3 document lost most of its gain by sliding from position 1 to 2.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-evaluation-metrics",
    "unitTitle": "Search evaluation metrics"
  },
  {
    "id": "srs-quiz-search-evaluation-metrics-c3",
    "type": "quiz",
    "prompt": "A team-draft interleaving experiment shows users strongly prefer ranker B over ranker A after only two days. The team wants to announce that B will lift revenue by 2 percent and ship it. What is the gap in their reasoning?",
    "answer": "Interleaving shows which ranker users prefer, not by how much a business metric moves, so a full A/B test is needed to size the revenue impact\n\nExplanation: Interleaving is a sensitive pre-screen for preference, but it cannot quantify revenue or conversion; that needs an A/B test with a traffic split. The first option has it backwards: interleaving needs far less traffic than A/B testing, not more.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-evaluation-metrics",
    "unitTitle": "Search evaluation metrics"
  },
  {
    "id": "srs-takeaway-search-index-synchronization-1",
    "type": "takeaway",
    "prompt": "In Search index synchronization, what is a fundamental rule regarding: Use CDC (Debezium + Kafka) to tail database WAL logs and stream updates asynchronously to Elasticsearch?",
    "answer": "Use CDC (Debezium + Kafka) to tail database WAL logs and stream updates asynchronously to Elasticsearch.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-synchronization",
    "unitTitle": "Search index synchronization"
  },
  {
    "id": "srs-takeaway-search-index-synchronization-2",
    "type": "takeaway",
    "prompt": "In Search index synchronization, what is a fundamental rule regarding: Elasticsearch refresh_interval (default 1s) delivers Near-Real-Time searchability by creating in-memory Lucene segments?",
    "answer": "Elasticsearch refresh_interval (default 1s) delivers Near-Real-Time searchability by creating in-memory Lucene segments.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-synchronization",
    "unitTitle": "Search index synchronization"
  },
  {
    "id": "srs-takeaway-search-index-synchronization-3",
    "type": "takeaway",
    "prompt": "In Search index synchronization, what is a fundamental rule regarding: Use a source-owned monotonic revision or Elasticsearch's own observed concurrency tokens correctly; do not conflate source versions with <code>_seq_no</code>/<code>_primary_term</code>?",
    "answer": "Use a source-owned monotonic revision or Elasticsearch's own observed concurrency tokens correctly; do not conflate source versions with <code>_seq_no</code>/<code>_primary_term</code>.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-synchronization",
    "unitTitle": "Search index synchronization"
  },
  {
    "id": "srs-quiz-search-index-synchronization-c1",
    "type": "quiz",
    "prompt": "A CDC sync worker uses external versioning to reject stale updates. Which value is appropriate as the version for each document?",
    "answer": "A source-owned revision that increases monotonically per document, such as a row version column or the WAL log sequence number\n\nExplanation: The ordering authority must be the source database, so a monotonic per-document revision or LSN is correct. _seq_no is assigned by Elasticsearch itself and says nothing about the primary database's commit order.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-synchronization",
    "unitTitle": "Search index synchronization"
  },
  {
    "id": "srs-quiz-search-index-synchronization-c2",
    "type": "quiz",
    "prompt": "Product 42 is deleted at version 9. Because of a stuck retry, an update carrying version 8 reaches Elasticsearch five minutes later, with version_type=external and the default index.gc_deletes. What happens?",
    "answer": "The update is indexed and the product reappears, because the delete tombstone was discarded after 60 seconds\n\nExplanation: Elasticsearch keeps delete tombstones only for gc_deletes, 60 seconds by default, so a very late older update can resurrect the document unless the pipeline guards against it. The version memory for deleted IDs is not permanent, which is why the second option is wrong.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-synchronization",
    "unitTitle": "Search index synchronization"
  },
  {
    "id": "srs-quiz-search-index-synchronization-c3",
    "type": "quiz",
    "prompt": "During a reindex into products_v2, an engineer takes the database snapshot first and records the CDC offset only after the bulk load finishes two hours later. What goes wrong?",
    "answer": "Changes committed during the two-hour load are never replayed into products_v2, so it silently misses them\n\nExplanation: Recording the offset before the snapshot guarantees replay covers everything the snapshot might miss; versioning then makes the overlap safe. Versioning protects against duplicate or out-of-order events, but it cannot recover events that are never replayed.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-synchronization",
    "unitTitle": "Search index synchronization"
  },
  {
    "id": "srs-takeaway-search-index-sharding-1",
    "type": "takeaway",
    "prompt": "In Search index sharding, what is a fundamental rule regarding: Elasticsearch uses Document Partitioning where each shard is a standalone Lucene index?",
    "answer": "Elasticsearch uses Document Partitioning where each shard is a standalone Lucene index.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-sharding",
    "unitTitle": "Search index sharding"
  },
  {
    "id": "srs-takeaway-search-index-sharding-2",
    "type": "takeaway",
    "prompt": "In Search index sharding, what is a fundamental rule regarding: Queries execute via a two-phase Query-Then-Fetch scatter-gather coordination across all shards?",
    "answer": "Queries execute via a two-phase Query-Then-Fetch scatter-gather coordination across all shards.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-sharding",
    "unitTitle": "Search index sharding"
  },
  {
    "id": "srs-takeaway-search-index-sharding-3",
    "type": "takeaway",
    "prompt": "In Search index sharding, what is a fundamental rule regarding: Custom routing keys isolate tenant data to specific shards, eliminating cluster-wide scatter-gather overhead?",
    "answer": "Custom routing keys isolate tenant data to specific shards, eliminating cluster-wide scatter-gather overhead.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-sharding",
    "unitTitle": "Search index sharding"
  },
  {
    "id": "srs-quiz-search-index-sharding-c1",
    "type": "quiz",
    "prompt": "Nearly every production engine partitions by document rather than by term. What is the main reason?",
    "answer": "Indexing a document touches exactly one shard, while term partitioning scatters every document's words across many shards\n\nExplanation: Document partitioning keeps writes local, at the cost of scatter-gather reads; term partitioning makes single-term reads local but requires RPCs to many shards for every indexed document and network joins for multi-term queries. The second option describes term partitioning's advantage, not document partitioning's.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-sharding",
    "unitTitle": "Search index sharding"
  },
  {
    "id": "srs-quiz-search-index-sharding-c2",
    "type": "quiz",
    "prompt": "Each shard independently exceeds its own p99 latency 1 percent of the time. A query fans out to 50 shards and waits for all of them. Roughly how often does the query hit at least one slow shard?",
    "answer": "About 40 percent, from 1 minus 0.99 to the power 50\n\nExplanation: 0.99 to the power 50 is about 0.605, so about 39.5 percent of queries wait on a slow shard and the per-shard p99 becomes close to the query median. Independence is exactly why it compounds; it does not keep the rate at 1 percent.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-sharding",
    "unitTitle": "Search index sharding"
  },
  {
    "id": "srs-quiz-search-index-sharding-c3",
    "type": "quiz",
    "prompt": "A SaaS search cluster routes by tenant ID. One customer grows to 30 percent of all documents and queries, and its shard's node runs hot while others idle. What is the targeted fix?",
    "answer": "Use routing partitions so that tenant's documents span several shards, keeping fan-out small but no longer one shard\n\nExplanation: Routing partitions spread one routing key over a small set of shards, relieving the hot shard while keeping most of the fan-out saving. Reverting to hash routing fixes the hotspot but makes every small tenant's query scatter across the whole cluster again.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "search-index-sharding",
    "unitTitle": "Search index sharding"
  },
  {
    "id": "srs-takeaway-crawler-and-indexing-pipeline-1",
    "type": "takeaway",
    "prompt": "In Crawler and indexing pipeline, what is a fundamental rule regarding: The URL Frontier enforces politeness by isolating queues per target host domain with strict rate delays?",
    "answer": "The URL Frontier enforces politeness by isolating queues per target host domain with strict rate delays.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "crawler-and-indexing-pipeline",
    "unitTitle": "Crawler and indexing pipeline"
  },
  {
    "id": "srs-takeaway-crawler-and-indexing-pipeline-2",
    "type": "takeaway",
    "prompt": "In Crawler and indexing pipeline, what is a fundamental rule regarding: SimHash computes compact 64-bit fingerprints that enable efficient near-duplicate lookup via permuted, sorted fingerprint tables?",
    "answer": "SimHash computes compact 64-bit fingerprints that enable efficient near-duplicate lookup via permuted, sorted fingerprint tables.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "crawler-and-indexing-pipeline",
    "unitTitle": "Crawler and indexing pipeline"
  },
  {
    "id": "srs-takeaway-crawler-and-indexing-pipeline-3",
    "type": "takeaway",
    "prompt": "In Crawler and indexing pipeline, what is a fundamental rule regarding: Bloom filters track billions of previously seen URLs in a few gigabytes of RAM?",
    "answer": "Bloom filters track billions of previously seen URLs in a few gigabytes of RAM.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "crawler-and-indexing-pipeline",
    "unitTitle": "Crawler and indexing pipeline"
  },
  {
    "id": "srs-quiz-crawler-and-indexing-pipeline-c1",
    "type": "quiz",
    "prompt": "Why does a crawler's URL frontier keep a separate queue per host rather than one global FIFO?",
    "answer": "So it can enforce a minimum delay between requests to the same host while still keeping many hosts busy in parallel\n\nExplanation: Per-host queues let the frontier throttle each site, for example one request every 500 ms, without idling the fetcher fleet; a global FIFO lets one site dominate and gets the crawler blocked. DNS results are cached with TTLs, not fixed per queue forever.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "crawler-and-indexing-pipeline",
    "unitTitle": "Crawler and indexing pipeline"
  },
  {
    "id": "srs-quiz-crawler-and-indexing-pipeline-c2",
    "type": "quiz",
    "prompt": "You must crawl 2 billion pages in 30 days (2,592,000 seconds), and politeness allows one request every 2 seconds per host. About how many distinct hosts must be in flight at once, at minimum?",
    "answer": "About 1,540\n\nExplanation: 2 billion over 2,592,000 seconds is about 770 pages per second, and at 0.5 requests per second per host you need about 1,540 hosts active concurrently. The tempting 770 is the page rate itself, which forgets the 2-second per-host delay.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "crawler-and-indexing-pipeline",
    "unitTitle": "Crawler and indexing pipeline"
  },
  {
    "id": "srs-quiz-crawler-and-indexing-pipeline-c3",
    "type": "quiz",
    "prompt": "To schedule recrawls, an engineer plans to clear a URL's bits in the URL-seen Bloom filter when it becomes due, so it is fetched again. What breaks?",
    "answer": "Bits are shared between URLs, so clearing them creates false negatives for other URLs, which are then re-fetched as if never seen\n\nExplanation: Plain Bloom filters cannot delete: bits are shared, so clearing one URL's bits makes other URLs look unseen, which introduces false negatives the design otherwise guarantees against. That is why recrawl scheduling lives in a separate store keyed by URL.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "crawler-and-indexing-pipeline",
    "unitTitle": "Crawler and indexing pipeline"
  },
  {
    "id": "srs-takeaway-vector-search-and-hybrid-retrieval-1",
    "type": "takeaway",
    "prompt": "In Vector search and hybrid retrieval, what is a fundamental rule regarding: Vector search captures conceptual meaning, overcoming the vocabulary mismatch limitations of lexical search?",
    "answer": "Vector search captures conceptual meaning, overcoming the vocabulary mismatch limitations of lexical search.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "vector-search-and-hybrid-retrieval",
    "unitTitle": "Vector search and hybrid retrieval"
  },
  {
    "id": "srs-takeaway-vector-search-and-hybrid-retrieval-2",
    "type": "takeaway",
    "prompt": "In Vector search and hybrid retrieval, what is a fundamental rule regarding: HNSW trades memory and build cost for approximate-neighbor latency and recall; validate both under the deployed corpus, filters, and concurrency?",
    "answer": "HNSW trades memory and build cost for approximate-neighbor latency and recall; validate both under the deployed corpus, filters, and concurrency.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "vector-search-and-hybrid-retrieval",
    "unitTitle": "Vector search and hybrid retrieval"
  },
  {
    "id": "srs-takeaway-vector-search-and-hybrid-retrieval-3",
    "type": "takeaway",
    "prompt": "In Vector search and hybrid retrieval, what is a fundamental rule regarding: Hybrid search combines lexical BM25 and vector retrieval using Reciprocal Rank Fusion (RRF) for optimal accuracy?",
    "answer": "Hybrid search combines lexical BM25 and vector retrieval using Reciprocal Rank Fusion (RRF) for optimal accuracy.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "vector-search-and-hybrid-retrieval",
    "unitTitle": "Vector search and hybrid retrieval"
  },
  {
    "id": "srs-quiz-vector-search-and-hybrid-retrieval-c1",
    "type": "quiz",
    "prompt": "A hybrid search returns BM25 scores in the range 0 to 40 and cosine similarities in the range 0.6 to 0.9. Why do most systems fuse them with Reciprocal Rank Fusion instead of adding the raw scores?",
    "answer": "Because the scores are on incompatible scales, and RRF uses only rank positions so neither ranker dominates by accident\n\nExplanation: Summing raw scores lets BM25's larger range swamp the vector signal; RRF converts each list to ranks, sidestepping calibration. The retrievers usually run in parallel, and RRF changes only how results are merged, not latency.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "vector-search-and-hybrid-retrieval",
    "unitTitle": "Vector search and hybrid retrieval"
  },
  {
    "id": "srs-quiz-vector-search-and-hybrid-retrieval-c2",
    "type": "quiz",
    "prompt": "You must store 50 million 1,024-dimensional embeddings. How much memory do the raw float32 vectors take, and how much with int8 scalar quantisation?",
    "answer": "About 205 GB as float32 and about 51 GB as int8\n\nExplanation: 50 million x 1,024 x 4 bytes is about 205 GB, and one byte per dimension gives about 51 GB, a 4x saving before HNSW links are added. The 102 GB option assumes int8 halves the size, but float32 is 4 bytes and int8 is 1.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "vector-search-and-hybrid-retrieval",
    "unitTitle": "Vector search and hybrid retrieval"
  },
  {
    "id": "srs-quiz-vector-search-and-hybrid-retrieval-c3",
    "type": "quiz",
    "prompt": "A multi-tenant app runs HNSW for the top 10 nearest vectors, then filters to the requesting tenant, who owns 0.5 percent of vectors. Users report empty or near-empty results. What is the fix?",
    "answer": "Apply the filter during graph traversal, or fall back to exact search over the tenant's vectors when the filter is very selective\n\nExplanation: Post-filtering 10 global neighbours to a 0.5 percent tenant leaves almost nothing; filtered HNSW traversal or exact search over the small filtered set solves it. A better-built graph still returns the global top 10, which are mostly other tenants' vectors.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "vector-search-and-hybrid-retrieval",
    "unitTitle": "Vector search and hybrid retrieval"
  },
  {
    "id": "srs-takeaway-autocomplete-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: autocomplete, what is a fundamental rule regarding: Autocomplete should feel instant, about 100 ms end to end, so the server-side lookup must take only a few milliseconds?",
    "answer": "Autocomplete should feel instant, about 100 ms end to end, so the server-side lookup must take only a few milliseconds.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "autocomplete-system-design",
    "unitTitle": "Design: autocomplete"
  },
  {
    "id": "srs-takeaway-autocomplete-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: autocomplete, what is a fundamental rule regarding: Trie nodes pre-cache the top 5 most frequent search terms, turning query-time subtree searches into an O(|prefix|) lookup plus a bounded list read?",
    "answer": "Trie nodes pre-cache the top 5 most frequent search terms, turning query-time subtree searches into an O(|prefix|) lookup plus a bounded list read.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "autocomplete-system-design",
    "unitTitle": "Design: autocomplete"
  },
  {
    "id": "srs-takeaway-autocomplete-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: autocomplete, what is a fundamental rule regarding: Query frequency weights are aggregated offline via streaming analytics (Flink) and loaded into in-memory Trie nodes?",
    "answer": "Query frequency weights are aggregated offline via streaming analytics (Flink) and loaded into in-memory Trie nodes.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "autocomplete-system-design",
    "unitTitle": "Design: autocomplete"
  },
  {
    "id": "srs-quiz-autocomplete-system-design-c1",
    "type": "quiz",
    "prompt": "Why does a production typeahead store a precomputed top-K suggestion list at every trie node instead of searching the subtree when a prefix arrives?",
    "answer": "Because a DFS under a short, popular prefix such as s touches a huge subtree, while a stored list makes the lookup cost proportional to the prefix length\n\nExplanation: Pre-materialisation turns query time into walking |prefix| nodes and reading a bounded list, avoiding a subtree DFS that can take hundreds of milliseconds. It relies on offline aggregation rather than removing it.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "autocomplete-system-design",
    "unitTitle": "Design: autocomplete"
  },
  {
    "id": "srs-quiz-autocomplete-system-design-c2",
    "type": "quiz",
    "prompt": "A site has 2 billion searches per day. After client-side debouncing, each search triggers about 5 suggestion requests, and peak is 3 times average. What peak QPS should the suggestion service be provisioned for?",
    "answer": "About 350,000\n\nExplanation: 10 billion requests per day divided by 86,400 seconds is about 116,000 average, and 3 times that is about 350,000 peak. The 116,000 option is the average, which would saturate at every daily peak.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "autocomplete-system-design",
    "unitTitle": "Design: autocomplete"
  },
  {
    "id": "srs-quiz-autocomplete-system-design-c3",
    "type": "quiz",
    "prompt": "A competitor runs bots that search an insulting phrase about your brand 2 million times a day, and it starts appearing as a suggestion. Which change to the aggregation step addresses the root cause?",
    "answer": "Score candidates by distinct users rather than raw search counts, alongside safety filtering before publishing\n\nExplanation: Counting distinct users makes a flood of bot searches from few identities worth little, and safety filters catch offensive completions before a build ships. CDN caching affects the read path only; the bots' searches still reach the logs that feed aggregation.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "autocomplete-system-design",
    "unitTitle": "Design: autocomplete"
  },
  {
    "id": "srs-takeaway-did-you-mean-and-spell-correction-1",
    "type": "takeaway",
    "prompt": "In Design: did-you-mean and spell correction, what is a fundamental rule regarding: SymSpell achieves sub-millisecond spell correction by precomputing word deletions into an in-memory hash table?",
    "answer": "SymSpell achieves sub-millisecond spell correction by precomputing word deletions into an in-memory hash table.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "did-you-mean-and-spell-correction",
    "unitTitle": "Design: did-you-mean and spell correction"
  },
  {
    "id": "srs-takeaway-did-you-mean-and-spell-correction-2",
    "type": "takeaway",
    "prompt": "In Design: did-you-mean and spell correction, what is a fundamental rule regarding: The Noisy Channel Model combines keyboard typo likelihood with language unigram frequency to pick the best correction?",
    "answer": "The Noisy Channel Model combines keyboard typo likelihood with language unigram frequency to pick the best correction.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "did-you-mean-and-spell-correction",
    "unitTitle": "Design: did-you-mean and spell correction"
  },
  {
    "id": "srs-takeaway-did-you-mean-and-spell-correction-3",
    "type": "takeaway",
    "prompt": "In Design: did-you-mean and spell correction, what is a fundamental rule regarding: Spelling correction runs transparently during query understanding to rescue zero-result typo queries?",
    "answer": "Spelling correction runs transparently during query understanding to rescue zero-result typo queries.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "did-you-mean-and-spell-correction",
    "unitTitle": "Design: did-you-mean and spell correction"
  },
  {
    "id": "srs-quiz-did-you-mean-and-spell-correction-c1",
    "type": "quiz",
    "prompt": "What does SymSpell precompute to make spelling correction fast?",
    "answer": "Deletions up to distance K of every dictionary word in a hash table, so at query time only the typo's own deletions are looked up\n\nExplanation: Symmetric delete precomputes only deletions of dictionary words and matches them against deletions of the input, then verifies with a true edit distance. Generating all four edit types for every word would explode the index, which is what SymSpell avoids.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "did-you-mean-and-spell-correction",
    "unitTitle": "Design: did-you-mean and spell correction"
  },
  {
    "id": "srs-quiz-did-you-mean-and-spell-correction-c2",
    "type": "quiz",
    "prompt": "A user types kafak. Candidates: kafka with P(word) 0.001 and P(kafak given kafka) 0.001 (adjacent transposition), and kayak with P(word) 0.002 and P(kafak given kayak) 0.0001 (y to f substitution). Which correction does the noisy channel model pick?",
    "answer": "kafka, because its product is about 1 x 10 to the minus 6, five times higher than kayak's\n\nExplanation: 0.001 x 0.001 = 1 x 10 to the minus 6 beats 0.002 x 0.0001 = 2 x 10 to the minus 7, because the error model makes the transposition far likelier than that substitution. Prior frequency alone favours kayak, which is exactly why the error model term matters.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "did-you-mean-and-spell-correction",
    "unitTitle": "Design: did-you-mean and spell correction"
  },
  {
    "id": "srs-quiz-did-you-mean-and-spell-correction-c3",
    "type": "quiz",
    "prompt": "After shipping auto-correction, you suspect it is replacing valid product codes and surnames. Which production signal most directly measures bad corrections?",
    "answer": "The rate at which users click search instead for the original query after a correction\n\nExplanation: When a user overrides the correction to get back their original query, that is direct evidence the correction was wrong. The share of changed queries says nothing about whether each change was right, and a bad correction can still return plenty of results.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "did-you-mean-and-spell-correction",
    "unitTitle": "Design: did-you-mean and spell correction"
  },
  {
    "id": "srs-takeaway-related-searches-1",
    "type": "takeaway",
    "prompt": "In Design: related searches, what is a fundamental rule regarding: Related searches are mined from user session logs and query-click bipartite graphs?",
    "answer": "Related searches are mined from user session logs and query-click bipartite graphs.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "related-searches",
    "unitTitle": "Design: related searches"
  },
  {
    "id": "srs-takeaway-related-searches-2",
    "type": "takeaway",
    "prompt": "In Design: related searches, what is a fundamental rule regarding: Temporal session co-occurrence identifies queries frequently executed in sequence by real users?",
    "answer": "Temporal session co-occurrence identifies queries frequently executed in sequence by real users.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "related-searches",
    "unitTitle": "Design: related searches"
  },
  {
    "id": "srs-takeaway-related-searches-3",
    "type": "takeaway",
    "prompt": "In Design: related searches, what is a fundamental rule regarding: Random walk algorithms (Personalized PageRank) surface semantically linked concepts based on shared destination clicks?",
    "answer": "Random walk algorithms (Personalized PageRank) surface semantically linked concepts based on shared destination clicks.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "related-searches",
    "unitTitle": "Design: related searches"
  },
  {
    "id": "srs-quiz-related-searches-c1",
    "type": "quiz",
    "prompt": "Two queries are linked in the query-click bipartite graph because users who typed either one clicked the same set of URLs. What kind of relationship does this signal mostly uncover?",
    "answer": "Queries with the same meaning, such as synonyms or paraphrases of one another\n\nExplanation: Shared click destinations mean the queries are satisfied by the same content, which surfaces synonyms; the lesson notes this signal finds same-meaning queries rather than useful next steps. Next-step refinements come from session reformulation, A followed by B.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "related-searches",
    "unitTitle": "Design: related searches"
  },
  {
    "id": "srs-quiz-related-searches-c2",
    "type": "quiz",
    "prompt": "Out of 20 million sessions, query A appears in 200,000. Candidate B appears in 40,000 sessions and co-occurs with A in 4,000. Candidate C appears in 2,000,000 and co-occurs with A in 30,000. What are the lift ratios, P(A and X) divided by P(A) x P(X)?",
    "answer": "B 10 and C 1.5, so B should be suggested\n\nExplanation: For B: 0.0002 divided by (0.01 x 0.002) = 10. For C: 0.0015 divided by (0.01 x 0.1) = 1.5, so C co-occurs only slightly more than chance despite its larger raw count. Choosing C mistakes popularity for association.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "related-searches",
    "unitTitle": "Design: related searches"
  },
  {
    "id": "srs-quiz-related-searches-c3",
    "type": "quiz",
    "prompt": "The nightly job finds a pair with enormous PMI: a rare query and a person's full name that co-occurred in 3 sessions, all from the same user. What should stop it from being served?",
    "answer": "A minimum co-occurrence count across distinct users, which blocks both noisy rare pairs and suggestions that could reveal one person's searches\n\nExplanation: PMI inflates rare pairs, and a suggestion built from one user's sessions can leak their searches, so production systems require minimum support counted over distinct users. Smoothing reduces noise but does not by itself guarantee that many different people contributed.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "related-searches",
    "unitTitle": "Design: related searches"
  },
  {
    "id": "srs-takeaway-recent-searches-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: recent searches, what is a fundamental rule regarding: Redis Sorted Sets (ZSET) provide instant O(log N) deduplication and timestamp ordering for recent user searches?",
    "answer": "Redis Sorted Sets (ZSET) provide instant O(log N) deduplication and timestamp ordering for recent user searches.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "recent-searches-system-design",
    "unitTitle": "Design: recent searches"
  },
  {
    "id": "srs-takeaway-recent-searches-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: recent searches, what is a fundamental rule regarding: Atomic Lua scripts cap recent search lists to 10 entries without multi-roundtrip race conditions?",
    "answer": "Atomic Lua scripts cap recent search lists to 10 entries without multi-roundtrip race conditions.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "recent-searches-system-design",
    "unitTitle": "Design: recent searches"
  },
  {
    "id": "srs-takeaway-recent-searches-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: recent searches, what is a fundamental rule regarding: Privacy regulations (GDPR/CCPA) require hard TTL expiration and immediate zero-trace purge APIs?",
    "answer": "Privacy regulations (GDPR/CCPA) require hard TTL expiration and immediate zero-trace purge APIs.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "recent-searches-system-design",
    "unitTitle": "Design: recent searches"
  },
  {
    "id": "srs-quiz-recent-searches-system-design-c1",
    "type": "quiz",
    "prompt": "A user searches iPhone five times in a row. Why does a Redis sorted set keyed by user, with the query as member and timestamp as score, behave better than LPUSH plus LTRIM on a list?",
    "answer": "Members are unique, so ZADD refreshes the existing entry's timestamp instead of adding four duplicates\n\nExplanation: A sorted set de-duplicates by member and ZADD moves the existing entry to the top by updating its score, while a list stores five copies and de-duplicating it is O(N). Persistence is the same for both data types; it is a server setting.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "recent-searches-system-design",
    "unitTitle": "Design: recent searches"
  },
  {
    "id": "srs-quiz-recent-searches-system-design-c2",
    "type": "quiz",
    "prompt": "You keep only daily active users in Redis: 200 million users at about 1 KB each for a 10-entry history. They perform 3 billion searches per day. What memory and average write rate should you plan for?",
    "answer": "About 200 GB and about 35,000 writes per second\n\nExplanation: 200 million x 1 KB is about 200 GB across the cluster, and 3 billion divided by 86,400 is about 35,000 writes per second. The 20 GB option counts only the raw 30-byte queries and ignores the key and encoding overhead the lesson includes.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "recent-searches-system-design",
    "unitTitle": "Design: recent searches"
  },
  {
    "id": "srs-quiz-recent-searches-system-design-c3",
    "type": "quiz",
    "prompt": "The worker sends ZADD, ZREMRANGEBYRANK and EXPIRE as three separate calls. For a brand-new user, it crashes right after ZADD. What is the most serious consequence?",
    "answer": "The key has no TTL, so this history can live indefinitely and violate the 90-day retention promise\n\nExplanation: Without the EXPIRE the new key never expires, which breaks retention and privacy obligations; running the steps in one Lua script or MULTI block prevents the partial state. A retried ZADD is harmless, because sorted-set members are unique and the timestamp is simply refreshed.",
    "category": "Information Retrieval & Search Engines",
    "track": "Production Operations, Resilience & System Hardening",
    "topicSlug": "recent-searches-system-design",
    "unitTitle": "Design: recent searches"
  },
  {
    "id": "srs-takeaway-url-shortener-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener, one machine, what is a fundamental rule regarding: Base62 encoding across 7 characters yields 3?",
    "answer": "Base62 encoding across 7 characters yields 3.52 trillion unique combinations.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-system-design",
    "unitTitle": "Design: a URL shortener, one machine"
  },
  {
    "id": "srs-takeaway-url-shortener-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener, one machine, what is a fundamental rule regarding: A monotonic counter converted to Base62 completely eliminates collision resolution logic?",
    "answer": "A monotonic counter converted to Base62 completely eliminates collision resolution logic.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-system-design",
    "unitTitle": "Design: a URL shortener, one machine"
  },
  {
    "id": "srs-takeaway-url-shortener-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener, one machine, what is a fundamental rule regarding: Choose redirect status and explicit cache headers together; a 302 does not guarantee that every future click reaches the origin?",
    "answer": "Choose redirect status and explicit cache headers together; a 302 does not guarantee that every future click reaches the origin.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-system-design",
    "unitTitle": "Design: a URL shortener, one machine"
  },
  {
    "id": "srs-takeaway-url-shortener-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener, one machine, what is a fundamental rule regarding: Always index the short code column with a unique index for sub-millisecond B-Tree point lookups?",
    "answer": "Always index the short code column with a unique index for sub-millisecond B-Tree point lookups.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-system-design",
    "unitTitle": "Design: a URL shortener, one machine"
  },
  {
    "id": "srs-quiz-url-shortener-system-design-c1",
    "type": "quiz",
    "prompt": "Your shortener creates 2 million links per day, and each row (code, URL, owner, timestamps) is about 500 bytes. Roughly how much new storage does one year of links need?",
    "answer": "About 365 GB per year\n\nExplanation: 2 million x 365 is about 730 million rows, and at 500 B each that is about 365 GB, which one PostgreSQL instance on NVMe still handles comfortably. The 3.6 TB answer comes from slipping a factor of ten in the row count.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-system-design",
    "unitTitle": "Design: a URL shortener, one machine"
  },
  {
    "id": "srs-quiz-url-shortener-system-design-c2",
    "type": "quiz",
    "prompt": "Codes are Base62 of an auto-increment ID, and a competitor is walking through b7, b8, b9 to scrape every link and estimate your volume. Which change stops this while keeping 7-character codes and zero collisions?",
    "answer": "Encode a one-to-one permutation of the ID, such as a small Feistel network\n\nExplanation: A reversible permutation maps each ID to a unique, non-sequential value in the same space, so there are no collisions and nothing to enumerate. Truncated MD5 hides the sequence but reintroduces birthday collisions; Snowflake IDs need about 11 characters.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-system-design",
    "unitTitle": "Design: a URL shortener, one machine"
  },
  {
    "id": "srs-quiz-url-shortener-system-design-c3",
    "type": "quiz",
    "prompt": "Marketing complains that repeat clicks by the same user never show up in click analytics. The service returns 301 with no cache headers. What is the most robust fix?",
    "answer": "Return 302 or 307 with Cache-Control: private, max-age=0 on the redirect\n\nExplanation: Browsers cache a 301 aggressively, so repeat clicks never reach the origin; a temporary redirect with explicit no-cache headers makes each click hit you. 308 is also a permanent redirect and is cached like a 301, so it has the same problem.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-system-design",
    "unitTitle": "Design: a URL shortener, one machine"
  },
  {
    "id": "srs-takeaway-rate-limiting-and-abuse-prevention-case-study-1",
    "type": "takeaway",
    "prompt": "In Design: rate limiting and abuse prevention, what is a fundamental rule regarding: Token Bucket and Sliding Window Counter are the primary algorithms for modern APIs?",
    "answer": "Token Bucket and Sliding Window Counter are the primary algorithms for modern APIs.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "rate-limiting-and-abuse-prevention-case-study",
    "unitTitle": "Design: rate limiting and abuse prevention"
  },
  {
    "id": "srs-takeaway-rate-limiting-and-abuse-prevention-case-study-2",
    "type": "takeaway",
    "prompt": "In Design: rate limiting and abuse prevention, what is a fundamental rule regarding: Fixed window counters suffer from boundary double-burst vulnerabilities?",
    "answer": "Fixed window counters suffer from boundary double-burst vulnerabilities.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "rate-limiting-and-abuse-prevention-case-study",
    "unitTitle": "Design: rate limiting and abuse prevention"
  },
  {
    "id": "srs-takeaway-rate-limiting-and-abuse-prevention-case-study-3",
    "type": "takeaway",
    "prompt": "In Design: rate limiting and abuse prevention, what is a fundamental rule regarding: Use atomic Redis Lua scripts to avoid race conditions across multi-instance API gateways?",
    "answer": "Use atomic Redis Lua scripts to avoid race conditions across multi-instance API gateways.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "rate-limiting-and-abuse-prevention-case-study",
    "unitTitle": "Design: rate limiting and abuse prevention"
  },
  {
    "id": "srs-takeaway-rate-limiting-and-abuse-prevention-case-study-4",
    "type": "takeaway",
    "prompt": "In Design: rate limiting and abuse prevention, what is a fundamental rule regarding: Always return standard rate limit headers?",
    "answer": "Always return standard rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "rate-limiting-and-abuse-prevention-case-study",
    "unitTitle": "Design: rate limiting and abuse prevention"
  },
  {
    "id": "srs-quiz-rate-limiting-and-abuse-prevention-case-study-c1",
    "type": "quiz",
    "prompt": "A client's token bucket refills at 10 tokens per second with capacity 50. After a minute of idling, the client fires 80 requests at once. What happens?",
    "answer": "50 pass immediately and the rest are limited to about 10 per second\n\nExplanation: Tokens accumulate only up to capacity b = 50, so a full bucket allows a 50-request burst and further requests are admitted at the refill rate r. The 600-token answer ignores the cap, which is exactly what bounds the burst.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "rate-limiting-and-abuse-prevention-case-study",
    "unitTitle": "Design: rate limiting and abuse prevention"
  },
  {
    "id": "srs-quiz-rate-limiting-and-abuse-prevention-case-study-c2",
    "type": "quiz",
    "prompt": "To avoid a Redis call per request, each of 60 gateways leases 50 tokens at a time from the central bucket. A customer's limit is 1,000 requests per second. What is the trade-off?",
    "answer": "Redis calls fall about 50x, but the customer can overshoot by up to about 3,000 requests\n\nExplanation: Each gateway can spend up to 50 tokens it already holds, so worst-case overshoot is 60 x 50 = 3,000 tokens, in exchange for about 50x fewer round trips. The lease is atomic when taken, but spending it locally is exactly what makes the overall limit approximate.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "rate-limiting-and-abuse-prevention-case-study",
    "unitTitle": "Design: rate limiting and abuse prevention"
  },
  {
    "id": "srs-quiz-rate-limiting-and-abuse-prevention-case-study-c3",
    "type": "quiz",
    "prompt": "The backend is overloaded and you start shedding requests from clients who are all well within their quotas. What response should they receive?",
    "answer": "503 Service Unavailable with Retry-After\n\nExplanation: 429 tells a client it exceeded its own quota; overload shedding is a server-side condition and should be 503 with Retry-After, because the client should behave differently. Using 429 is tempting but misleads clients into thinking they need to lower their own rate or upgrade their plan.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "rate-limiting-and-abuse-prevention-case-study",
    "unitTitle": "Design: rate limiting and abuse prevention"
  },
  {
    "id": "srs-takeaway-url-shortener-at-scale-1",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener at scale, what is a fundamental rule regarding: Distribute ID generation using pre-allocated numeric ranges or 64-bit Snowflake algorithms to avoid synchronization bottlenecks?",
    "answer": "Distribute ID generation using pre-allocated numeric ranges or 64-bit Snowflake algorithms to avoid synchronization bottlenecks.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-at-scale",
    "unitTitle": "Design: a URL shortener at scale"
  },
  {
    "id": "srs-takeaway-url-shortener-at-scale-2",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener at scale, what is a fundamental rule regarding: Partition databases using consistent hashing on the short URL key?",
    "answer": "Partition databases using consistent hashing on the short URL key.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-at-scale",
    "unitTitle": "Design: a URL shortener at scale"
  },
  {
    "id": "srs-takeaway-url-shortener-at-scale-3",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener at scale, what is a fundamental rule regarding: Apply the 80/20 Pareto principle with Redis LRU caching to absorb the vast majority of read traffic?",
    "answer": "Apply the 80/20 Pareto principle with Redis LRU caching to absorb the vast majority of read traffic.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-at-scale",
    "unitTitle": "Design: a URL shortener at scale"
  },
  {
    "id": "srs-takeaway-url-shortener-at-scale-4",
    "type": "takeaway",
    "prompt": "In Design: a URL shortener at scale, what is a fundamental rule regarding: Stream click tracking data asynchronously through Kafka into columnar storage (ClickHouse) for real-time analytics?",
    "answer": "Stream click tracking data asynchronously through Kafka into columnar storage (ClickHouse) for real-time analytics.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-at-scale",
    "unitTitle": "Design: a URL shortener at scale"
  },
  {
    "id": "srs-quiz-url-shortener-at-scale-c1",
    "type": "quiz",
    "prompt": "A team proposes using Snowflake IDs directly as short codes because they need no coordination. Why does this conflict with a 7-character code goal?",
    "answer": "Snowflake IDs are 64 bits, which is about 11 Base62 characters\n\nExplanation: 62^7 is about 3.5 trillion, roughly 42 bits, while a 64-bit ID needs about 11 Base62 characters. Needing ZooKeeper describes range allocation, which is actually the scheme that does keep codes at 7 characters.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-at-scale",
    "unitTitle": "Design: a URL shortener at scale"
  },
  {
    "id": "srs-quiz-url-shortener-at-scale-c2",
    "type": "quiz",
    "prompt": "Redirects peak at 60,000 per second. The CDN and Redis together absorb 90% of them, and the link table is spread across 64 shards. Roughly what read load reaches each shard at peak?",
    "answer": "About 94 reads per second\n\nExplanation: 10% of 60,000 is 6,000 database reads per second, and 6,000 / 64 is about 94 per shard, which is trivial. The 6,000 figure is the total across all shards, not per shard.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-at-scale",
    "unitTitle": "Design: a URL shortener at scale"
  },
  {
    "id": "srs-quiz-url-shortener-at-scale-c3",
    "type": "quiz",
    "prompt": "Trust and safety disables a malware link by flagging it in the database, yet it keeps redirecting users for another hour. What is the root cause and fix?",
    "answer": "Cached entries at the CDN and in Redis; purge both when a link is disabled\n\nExplanation: Redirects are served from the CDN and Redis without touching the database, so a DB flag is invisible until those entries expire; disabling must actively purge both. Replica lag lasts seconds, not an hour, and the database is not even on the cached path.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "url-shortener-at-scale",
    "unitTitle": "Design: a URL shortener at scale"
  },
  {
    "id": "srs-takeaway-ecommerce-product-listing-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a product listing, what is a fundamental rule regarding: Use CQRS?",
    "answer": "Use CQRS: separate transactional product management writes from read-heavy faceted browsing.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ecommerce-product-listing-system-design",
    "unitTitle": "Design: a product listing"
  },
  {
    "id": "srs-takeaway-ecommerce-product-listing-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a product listing, what is a fundamental rule regarding: Relational databases can serve faceting with suitable models and indexes; use Elasticsearch or OpenSearch when measured full-text and distributed aggregation needs justify a separate read model?",
    "answer": "Relational databases can serve faceting with suitable models and indexes; use Elasticsearch or OpenSearch when measured full-text and distributed aggregation needs justify a separate read model.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ecommerce-product-listing-system-design",
    "unitTitle": "Design: a product listing"
  },
  {
    "id": "srs-takeaway-ecommerce-product-listing-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a product listing, what is a fundamental rule regarding: Employ Change Data Capture (CDC) via Kafka to keep the search index in sync with transactional databases without dual-write bugs?",
    "answer": "Employ Change Data Capture (CDC) via Kafka to keep the search index in sync with transactional databases without dual-write bugs.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ecommerce-product-listing-system-design",
    "unitTitle": "Design: a product listing"
  },
  {
    "id": "srs-takeaway-ecommerce-product-listing-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a product listing, what is a fundamental rule regarding: Decouple volatile inventory quantities from static product details using lightweight real-time stock services?",
    "answer": "Decouple volatile inventory quantities from static product details using lightweight real-time stock services.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ecommerce-product-listing-system-design",
    "unitTitle": "Design: a product listing"
  },
  {
    "id": "srs-quiz-ecommerce-product-listing-system-design-c1",
    "type": "quiz",
    "prompt": "The catalog service currently writes each product change to PostgreSQL and then to Elasticsearch. Why does the lesson prefer streaming changes from the database log instead?",
    "answer": "CDC derives every index update from committed changes, so a failed write cannot leave permanent drift\n\nExplanation: With app-level dual writes, one side can succeed while the other fails and the two drift forever; CDC reads the committed log, so the index eventually reflects every change. It does not make the index strongly consistent, which is why price and stock are re-checked at checkout.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ecommerce-product-listing-system-design",
    "unitTitle": "Design: a product listing"
  },
  {
    "id": "srs-quiz-ecommerce-product-listing-system-design-c2",
    "type": "quiz",
    "prompt": "A catalog grows to 80 million SKUs at about 5 KB of indexed JSON each, and you target primary shards of 10 to 50 GB. Which primary shard count is most sensible?",
    "answer": "16 primaries of about 25 GB each\n\nExplanation: 80 million x 5 KB is about 400 GB of primary data, and 16 shards puts each at about 25 GB, inside the target band. 400 tiny shards is tempting for parallelism, but many small shards waste heap and slow queries that fan out to every shard.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ecommerce-product-listing-system-design",
    "unitTitle": "Design: a product listing"
  },
  {
    "id": "srs-quiz-ecommerce-product-listing-system-design-c3",
    "type": "quiz",
    "prompt": "Stock updates at 3,000 per second trigger constant reindexing, and category pages reshuffle as items flip in and out of stock. Which approach does the lesson recommend?",
    "answer": "Index a coarse stock bucket, apply exact availability at display time, and rank out-of-stock items lower\n\nExplanation: A coarse bucket means most stock changes do not touch the index, the page's 24 SKUs get exact availability from an inventory cache, and demoting rather than removing keeps pages stable. A longer refresh interval cuts indexing cost but makes stock staler while still reshuffling pages.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ecommerce-product-listing-system-design",
    "unitTitle": "Design: a product listing"
  },
  {
    "id": "srs-takeaway-collaborative-editing-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a collaborative editor, what is a fundamental rule regarding: Character offset coordinates are fragile under concurrent editing; they require transformation or fractional identifiers?",
    "answer": "Character offset coordinates are fragile under concurrent editing; they require transformation or fractional identifiers.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "collaborative-editing-system-design",
    "unitTitle": "Design: a collaborative editor"
  },
  {
    "id": "srs-takeaway-collaborative-editing-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a collaborative editor, what is a fundamental rule regarding: Many OT deployments use a centralized coordinator, but centralization is an architectural choice rather than a mathematical requirement of all OT algorithms?",
    "answer": "Many OT deployments use a centralized coordinator, but centralization is an architectural choice rather than a mathematical requirement of all OT algorithms.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "collaborative-editing-system-design",
    "unitTitle": "Design: a collaborative editor"
  },
  {
    "id": "srs-takeaway-collaborative-editing-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a collaborative editor, what is a fundamental rule regarding: CRDTs assign immutable IDs to every token and converge deterministically in peer-to-peer or server topologies?",
    "answer": "CRDTs assign immutable IDs to every token and converge deterministically in peer-to-peer or server topologies.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "collaborative-editing-system-design",
    "unitTitle": "Design: a collaborative editor"
  },
  {
    "id": "srs-takeaway-collaborative-editing-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a collaborative editor, what is a fundamental rule regarding: Use WebSockets for real-time operation transport and snapshot document states periodically to compact mutation logs?",
    "answer": "Use WebSockets for real-time operation transport and snapshot document states periodically to compact mutation logs.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "collaborative-editing-system-design",
    "unitTitle": "Design: a collaborative editor"
  },
  {
    "id": "srs-quiz-collaborative-editing-system-design-c1",
    "type": "quiz",
    "prompt": "The document is abcd. Concurrently, Alice inserts x at index 3 (giving abcxd) and Bob deletes index 1 (giving acd). The server applies Bob's delete first. What must Alice's operation become?",
    "answer": "insert(x, 2), giving acxd\n\nExplanation: Bob removed a character before Alice's position, so her index shifts down by one to 2, producing acxd on the server; Alice applies Bob's delete to abcxd and also reaches acxd. Leaving it at 3 is the untransformed mistake and puts x after d.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "collaborative-editing-system-design",
    "unitTitle": "Design: a collaborative editor"
  },
  {
    "id": "srs-quiz-collaborative-editing-system-design-c2",
    "type": "quiz",
    "prompt": "A team switching from OT to Yjs plans to delete their collaboration servers entirely. Which job still needs server-side coordination?",
    "answer": "Authentication, persistence, fan-out and history garbage collection\n\nExplanation: A CRDT removes the need for a central component that orders edits, but access control, durable storage, broadcasting and compaction still need infrastructure. Global ordering and index transforms are precisely what the CRDT makes unnecessary.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "collaborative-editing-system-design",
    "unitTitle": "Design: a collaborative editor"
  },
  {
    "id": "srs-quiz-collaborative-editing-system-design-c3",
    "type": "quiz",
    "prompt": "A document has 200 concurrent editors each sending about 5 operations per second, so the session server faces about 200,000 outbound messages per second. What is the best first lever?",
    "answer": "Batch outgoing operations every 30 to 50 ms and throttle ephemeral cursor updates\n\nExplanation: Batching collapses many ops into one message per client per window, and cursors are ephemeral traffic that should be throttled and never stored. Splitting the document across servers breaks the single-process ordering that sticky routing by doc_id exists to provide.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "collaborative-editing-system-design",
    "unitTitle": "Design: a collaborative editor"
  },
  {
    "id": "srs-takeaway-object-store-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: an object store (S3), what is a fundamental rule regarding: Decouple metadata management from high-volume binary payload data storage?",
    "answer": "Decouple metadata management from high-volume binary payload data storage.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "object-store-system-design",
    "unitTitle": "Design: an object store (S3)"
  },
  {
    "id": "srs-takeaway-object-store-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: an object store (S3), what is a fundamental rule regarding: Object APIs generally avoid in-place byte mutation, but keys may still be replaced or deleted unless versioning or retention policy prevents it?",
    "answer": "Object APIs generally avoid in-place byte mutation, but keys may still be replaced or deleted unless versioning or retention policy prevents it.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "object-store-system-design",
    "unitTitle": "Design: an object store (S3)"
  },
  {
    "id": "srs-takeaway-object-store-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: an object store (S3), what is a fundamental rule regarding: Erasure coding reduces storage overhead for a chosen fault tolerance; end-to-end durability also depends on failure-domain placement, checksums, repair speed, and operations?",
    "answer": "Erasure coding reduces storage overhead for a chosen fault tolerance; end-to-end durability also depends on failure-domain placement, checksums, repair speed, and operations.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "object-store-system-design",
    "unitTitle": "Design: an object store (S3)"
  },
  {
    "id": "srs-takeaway-object-store-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: an object store (S3), what is a fundamental rule regarding: Multipart uploads allow large files to be uploaded concurrently and resumed seamlessly on network interruptions?",
    "answer": "Multipart uploads allow large files to be uploaded concurrently and resumed seamlessly on network interruptions.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "object-store-system-design",
    "unitTitle": "Design: an object store (S3)"
  },
  {
    "id": "srs-quiz-object-store-system-design-c1",
    "type": "quiz",
    "prompt": "An RS 8+4 object has its 12 chunks placed on only 6 racks, two chunks per rack. How many simultaneous whole-rack failures is it guaranteed to survive?",
    "answer": "Two, since two racks hold four chunks\n\nExplanation: Losing a rack loses two chunks, so two racks cost four chunks, the most the code can lose; a third rack takes the loss to six. Any 4 failures is only true for racks when each of the 12 chunks sits in its own failure domain.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "object-store-system-design",
    "unitTitle": "Design: an object store (S3)"
  },
  {
    "id": "srs-quiz-object-store-system-design-c2",
    "type": "quiz",
    "prompt": "You move 10 PB of warm data from 3x replication to RS 8+4, saving 15 PB of raw disk. Which cost rises sharply and needs capacity planning?",
    "answer": "Repair traffic, because rebuilding a lost 20 TB drive reads about 160 TB\n\nExplanation: Each lost chunk is rebuilt from 8 surviving chunks, so repairing one drive reads about eight times its size, and slow repair lengthens the window for further failures. Parity adds 50% to writes, not double, and RS 8+4 tolerates more lost chunks (4) than 3x replication (2).",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "object-store-system-design",
    "unitTitle": "Design: an object store (S3)"
  },
  {
    "id": "srs-quiz-object-store-system-design-c3",
    "type": "quiz",
    "prompt": "A front end streams all 12 chunks of a new object version and gets checksums back, then crashes before the metadata commit. What does a reader of that key see?",
    "answer": "The previous version, and the new chunks become orphans for GC\n\nExplanation: An object becomes visible only when the metadata commit maps the key to its chunks, which is how read-after-write consistency is achieved; unreferenced chunks are cleaned up later. Durable chunks alone are not enough, because no metadata points to them.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "object-store-system-design",
    "unitTitle": "Design: an object store (S3)"
  },
  {
    "id": "srs-takeaway-partitioned-log-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a Kafka-style log, what is a fundamental rule regarding: Append-only logs maximize performance by utilizing purely sequential disk I/O?",
    "answer": "Append-only logs maximize performance by utilizing purely sequential disk I/O.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "partitioned-log-system-design",
    "unitTitle": "Design: a Kafka-style log"
  },
  {
    "id": "srs-takeaway-partitioned-log-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a Kafka-style log, what is a fundamental rule regarding: Linux Zero-Copy (sendfile system call) streams data from OS page cache directly to network sockets without user-space overhead?",
    "answer": "Linux Zero-Copy (sendfile system call) streams data from OS page cache directly to network sockets without user-space overhead.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "partitioned-log-system-design",
    "unitTitle": "Design: a Kafka-style log"
  },
  {
    "id": "srs-takeaway-partitioned-log-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a Kafka-style log, what is a fundamental rule regarding: Topics are partitioned to enable horizontal scaling and parallel consumption across consumer groups?",
    "answer": "Topics are partitioned to enable horizontal scaling and parallel consumption across consumer groups.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "partitioned-log-system-design",
    "unitTitle": "Design: a Kafka-style log"
  },
  {
    "id": "srs-takeaway-partitioned-log-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a Kafka-style log, what is a fundamental rule regarding: Consumers maintain their own offset state, allowing effortless replaying and multi-consumer independence?",
    "answer": "Consumers maintain their own offset state, allowing effortless replaying and multi-consumer independence.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "partitioned-log-system-design",
    "unitTitle": "Design: a Kafka-style log"
  },
  {
    "id": "srs-quiz-partitioned-log-system-design-c1",
    "type": "quiz",
    "prompt": "Billing has already consumed the last three days of order events from a Kafka topic with 7-day retention. A new analytics team wants those same three days. What do they do?",
    "answer": "Start a new consumer group and reset its offsets to three days ago\n\nExplanation: Messages stay in the log for the retention period, and each consumer group keeps its own offsets, so a new group can start anywhere inside retention. Joining billing's group would split partitions between the two teams instead of giving each a full copy.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "partitioned-log-system-design",
    "unitTitle": "Design: a Kafka-style log"
  },
  {
    "id": "srs-quiz-partitioned-log-system-design-c2",
    "type": "quiz",
    "prompt": "A topic ingests 200,000 messages per second at 2 KB each. One consumer instance can process about 8 MB/s. What partition count should you create?",
    "answer": "64 or more partitions, leaving headroom above the minimum of 50\n\nExplanation: Ingest is 400 MB/s, so at least 50 consumers and therefore 50 partitions are needed; choose more because adding partitions later changes the key-to-partition mapping. Exactly 50 has no headroom for growth or slow consumers.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "partitioned-log-system-design",
    "unitTitle": "Design: a Kafka-style log"
  },
  {
    "id": "srs-quiz-partitioned-log-system-design-c3",
    "type": "quiz",
    "prompt": "A consumer charges a card, then commits its offset. After a crash between the two steps, the customer is charged twice. The team proposes enabling Kafka exactly_once_v2. Does that fix it?",
    "answer": "No; the charge is outside Kafka, so it needs an idempotency key\n\nExplanation: Kafka's exactly-once covers writes to Kafka and offset commits, not external side effects, so the payment call must carry an idempotency key. Committing first switches to at-most-once, which avoids the duplicate by risking a lost charge.",
    "category": "Infrastructure & Core Service Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "partitioned-log-system-design",
    "unitTitle": "Design: a Kafka-style log"
  },
  {
    "id": "srs-takeaway-notification-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a notification system, what is a fundamental rule regarding: Always decouple notification creation from delivery using message queues (Kafka/SQS)?",
    "answer": "Always decouple notification creation from delivery using message queues (Kafka/SQS).",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "notification-system-design",
    "unitTitle": "Design: a notification system"
  },
  {
    "id": "srs-takeaway-notification-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a notification system, what is a fundamental rule regarding: Prioritize queues?",
    "answer": "Prioritize queues: critical OTP messages must never be blocked by batch marketing pushes.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "notification-system-design",
    "unitTitle": "Design: a notification system"
  },
  {
    "id": "srs-takeaway-notification-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a notification system, what is a fundamental rule regarding: Implement idempotent deduplication with Redis to avoid sending duplicate alerts on retries?",
    "answer": "Implement idempotent deduplication with Redis to avoid sending duplicate alerts on retries.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "notification-system-design",
    "unitTitle": "Design: a notification system"
  },
  {
    "id": "srs-takeaway-notification-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a notification system, what is a fundamental rule regarding: Actively clean invalid device tokens reported by APNs and FCM webhooks?",
    "answer": "Actively clean invalid device tokens reported by APNs and FCM webhooks.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "notification-system-design",
    "unitTitle": "Design: a notification system"
  },
  {
    "id": "srs-quiz-notification-system-design-c1",
    "type": "quiz",
    "prompt": "A 50-million-user marketing campaign and password-reset codes share one Kafka topic and worker pool. During the campaign, OTPs arrive 40 minutes late. What is the structural fix?",
    "answer": "Give each priority its own queues, workers and provider connections\n\nExplanation: Priority isolation means bulk traffic physically cannot sit in front of an OTP, so OTP latency stays at seconds regardless of campaign size. More shared workers only shortens the delay; any sufficiently large blast still starves OTPs.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "notification-system-design",
    "unitTitle": "Design: a notification system"
  },
  {
    "id": "srs-quiz-notification-system-design-c2",
    "type": "quiz",
    "prompt": "Product wants a push delivered to 30 million users within 2 minutes. Each worker sustains about 2,500 APNs sends per second over its HTTP/2 connection pool. About how many workers do you need?",
    "answer": "About 100 workers\n\nExplanation: 30,000,000 / 120 s is 250,000 sends per second, and 250,000 / 2,500 is 100 workers, pre-warmed and autoscaled on queue lag. 200 comes from spreading the send over one minute instead of two.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "notification-system-design",
    "unitTitle": "Design: a notification system"
  },
  {
    "id": "srs-quiz-notification-system-design-c3",
    "type": "quiz",
    "prompt": "An iPhone is offline for a day while the app sends it five security alerts via APNs. When it reconnects, only the last alert appears. What explains this, and what should carry must-not-lose messages?",
    "answer": "APNs keeps only the latest notification per app for offline devices; use a durable in-app inbox\n\nExplanation: For offline devices APNs stores only the most recent notification per app, so acceptance by APNs is not delivery. Messages that must not be lost belong in your own durable inbox, with push only as a nudge. Dedup and caps are plausible causes but would not explain the pattern of keeping exactly the latest.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "notification-system-design",
    "unitTitle": "Design: a notification system"
  },
  {
    "id": "srs-takeaway-ticket-booking-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a ticket booking system, what is a fundamental rule regarding: Keep hold token, owner, and expiry in the authoritative conditional booking transition; use Redis only as a cache or accelerator unless it shares that authority safely?",
    "answer": "Keep hold token, owner, and expiry in the authoritative conditional booking transition; use Redis only as a cache or accelerator unless it shares that authority safely.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ticket-booking-system-design",
    "unitTitle": "Design: a ticket booking system"
  },
  {
    "id": "srs-takeaway-ticket-booking-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a ticket booking system, what is a fundamental rule regarding: Deploy a virtual waiting room in front of checkout to flatten extreme traffic spikes?",
    "answer": "Deploy a virtual waiting room in front of checkout to flatten extreme traffic spikes.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ticket-booking-system-design",
    "unitTitle": "Design: a ticket booking system"
  },
  {
    "id": "srs-takeaway-ticket-booking-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a ticket booking system, what is a fundamental rule regarding: Use optimistic locking or atomic compare-and-swap to prevent race conditions during seat claims?",
    "answer": "Use optimistic locking or atomic compare-and-swap to prevent race conditions during seat claims.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ticket-booking-system-design",
    "unitTitle": "Design: a ticket booking system"
  },
  {
    "id": "srs-takeaway-ticket-booking-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a ticket booking system, what is a fundamental rule regarding: Implement automated reconciliation for out-of-order or delayed payment gateway callbacks?",
    "answer": "Implement automated reconciliation for out-of-order or delayed payment gateway callbacks.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ticket-booking-system-design",
    "unitTitle": "Design: a ticket booking system"
  },
  {
    "id": "srs-quiz-ticket-booking-system-design-c1",
    "type": "quiz",
    "prompt": "Why should a seat hold's token, owner and expiry be stored in the database row that the booking UPDATE checks, rather than only as a Redis key with a TTL?",
    "answer": "A Redis key can expire or be evicted independently, so the two can disagree\n\nExplanation: The booking must be one atomic check against a single source of truth; if the hold's authority lives in a separately expiring Redis key, Redis and the database can disagree about who owns the seat. Speed is not the point here, since Redis is fine for serving the seat map.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ticket-booking-system-design",
    "unitTitle": "Design: a ticket booking system"
  },
  {
    "id": "srs-quiz-ticket-booking-system-design-c2",
    "type": "quiz",
    "prompt": "The waiting room admits 4,000 users per minute, and an average buyer spends 5 minutes in checkout. In steady state, roughly how many people are in checkout at once?",
    "answer": "About 20,000\n\nExplanation: By Little's law, concurrency is arrival rate times time in the system: 4,000 per minute x 5 minutes = 20,000, a load the reservation database handles easily. 4,000 forgets that each buyer stays for several minutes.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ticket-booking-system-design",
    "unitTitle": "Design: a ticket booking system"
  },
  {
    "id": "srs-quiz-ticket-booking-system-design-c3",
    "type": "quiz",
    "prompt": "Buyer A's hold expires, buyer B then books the seat, and a minute later A's payment-success webhook arrives. What should the system do?",
    "answer": "Attempt A's token-bound transition, and when it fails record the payment as unmatched and void or refund it\n\nExplanation: The callback retries the conditional booking with A's hold token; it matches zero rows because B owns the seat, so the payment goes to an explicit void or refund workflow with reconciliation. Reassigning to A breaks the invariant that a confirmed booking is never taken away.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ticket-booking-system-design",
    "unitTitle": "Design: a ticket booking system"
  },
  {
    "id": "srs-takeaway-payment-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a payment system, what is a fundamental rule regarding: Every financial mutation must use double-entry ledger mechanics?",
    "answer": "Every financial mutation must use double-entry ledger mechanics: Sum(Debits) == Sum(Credits).",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "payment-system-design",
    "unitTitle": "Design: a payment system"
  },
  {
    "id": "srs-takeaway-payment-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a payment system, what is a fundamental rule regarding: Use stable operation identities end to end, but verify each external provider's idempotency window and changed-payload behavior?",
    "answer": "Use stable operation identities end to end, but verify each external provider's idempotency window and changed-payload behavior.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "payment-system-design",
    "unitTitle": "Design: a payment system"
  },
  {
    "id": "srs-takeaway-payment-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a payment system, what is a fundamental rule regarding: Never mutate ledger records; use compensating transactions to correct errors?",
    "answer": "Never mutate ledger records; use compensating transactions to correct errors.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "payment-system-design",
    "unitTitle": "Design: a payment system"
  },
  {
    "id": "srs-takeaway-payment-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a payment system, what is a fundamental rule regarding: Asynchronous nightly reconciliation is required to verify internal records against external bank settlement files?",
    "answer": "Asynchronous nightly reconciliation is required to verify internal records against external bank settlement files.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "payment-system-design",
    "unitTitle": "Design: a payment system"
  },
  {
    "id": "srs-quiz-payment-system-design-c1",
    "type": "quiz",
    "prompt": "The call to the PSP times out with no reply. The client asks the payment service to try again. What should the service do?",
    "answer": "Keep it UNKNOWN and recover with the same key: repeat the call, query the PSP, or await the webhook\n\nExplanation: The PSP may already have charged the card, so the state is UNKNOWN and every recovery must reuse the same key and payload. A fresh key is the dangerous option, because the PSP cannot link it to the first attempt and may charge twice.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "payment-system-design",
    "unitTitle": "Design: a payment system"
  },
  {
    "id": "srs-quiz-payment-system-design-c2",
    "type": "quiz",
    "prompt": "A 250.00 USD order is captured. The PSP fee is 2.9% + 0.30 and the PSP pays out net. In integer cents, what is the capture journal entry?",
    "answer": "Debit PSP receivable 24245 and fees 755; credit sales revenue 25000\n\nExplanation: The fee is 7.25 + 0.30 = 7.55, so the receivable is 242.45 and debits total 25000 against a 25000 revenue credit. Debiting bank cash is wrong at capture, because cash only arrives at payout, when the receivable is cleared.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "payment-system-design",
    "unitTitle": "Design: a payment system"
  },
  {
    "id": "srs-quiz-payment-system-design-c3",
    "type": "quiz",
    "prompt": "Nightly reconciliation finds a successful charge in the PSP settlement file with no matching ledger entry. What is the likely cause and the right action?",
    "answer": "A timeout left it UNKNOWN and the webhook was lost; create ledger entries from the PSP record\n\nExplanation: The PSP's record proves the charge succeeded, so the ledger is behind, typically because a timeout left the payment UNKNOWN and the webhook never arrived; you post the entries and mark the order paid. Rechecking later is the action for the opposite case, a ledger entry missing from the PSP file.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "payment-system-design",
    "unitTitle": "Design: a payment system"
  },
  {
    "id": "srs-takeaway-search-engine-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a search service, what is a fundamental rule regarding: Decouple the asynchronous indexing pipeline from the read/query coordinator tier?",
    "answer": "Decouple the asynchronous indexing pipeline from the read/query coordinator tier.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "search-engine-system-design",
    "unitTitle": "Design: a search service"
  },
  {
    "id": "srs-takeaway-search-engine-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a search service, what is a fundamental rule regarding: An inverted index with sorted posting lists powers sub-50ms multi-term queries?",
    "answer": "An inverted index with sorted posting lists powers sub-50ms multi-term queries.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "search-engine-system-design",
    "unitTitle": "Design: a search service"
  },
  {
    "id": "srs-takeaway-search-engine-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a search service, what is a fundamental rule regarding: BM25 scoring combines term frequency, inverse document frequency, and length normalization?",
    "answer": "BM25 scoring combines term frequency, inverse document frequency, and length normalization.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "search-engine-system-design",
    "unitTitle": "Design: a search service"
  },
  {
    "id": "srs-takeaway-search-engine-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a search service, what is a fundamental rule regarding: Shard indexes by document ID and use scatter-gather coordinator nodes to query shards in parallel?",
    "answer": "Shard indexes by document ID and use scatter-gather coordinator nodes to query shards in parallel.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "search-engine-system-design",
    "unitTitle": "Design: a search service"
  },
  {
    "id": "srs-quiz-search-engine-system-design-c1",
    "type": "quiz",
    "prompt": "The posting lists are raft = [3, 8, 21, 40, 77] and leader = [8, 15, 40, 90]. How does the engine answer raft AND leader, and what is the result?",
    "answer": "It merges the two sorted lists and keeps shared IDs, returning 8 and 40\n\nExplanation: Posting lists are sorted, so a linear merge (optionally with skip pointers) finds the shared IDs 8 and 40 in O(N + M) without touching other documents. The scanning option gets the right answer but by the slow method the inverted index exists to avoid.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "search-engine-system-design",
    "unitTitle": "Design: a search service"
  },
  {
    "id": "srs-quiz-search-engine-system-design-c2",
    "type": "quiz",
    "prompt": "The corpus has 1,000,000 documents and the term raft appears in 10,000 of them. Using Lucene's IDF ln(1 + (N - n + 0.5) / (n + 0.5)), roughly what is its IDF, compared with 6.9 for kafka?",
    "answer": "About 4.6, lower than kafka\n\nExplanation: (1,000,000 minus 10,000) / 10,000 is about 99, so IDF is ln(100), about 4.6: raft is ten times more common than kafka and therefore less informative. 9.2 would require raft to be rarer than kafka, which reverses the direction of IDF.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "search-engine-system-design",
    "unitTitle": "Design: a search service"
  },
  {
    "id": "srs-quiz-search-engine-system-design-c3",
    "type": "quiz",
    "prompt": "An index moves from 10 to 50 document-partitioned shards, each with a p99 of 40 ms. Roughly what share of queries now waits on at least one shard slower than its p99?",
    "answer": "About 40%, from 1 minus 0.99 to the power 50\n\nExplanation: A scatter-gather query waits for the slowest shard, so the chance of hitting at least one slow shard is 1 minus 0.99^50, about 40%, up from about 10% with 10 shards. That is why fewer, larger shards, replica selection and hedged requests matter.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "search-engine-system-design",
    "unitTitle": "Design: a search service"
  },
  {
    "id": "srs-takeaway-recommendation-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a recommendation system, what is a fundamental rule regarding: Structure recommendations as a funnel?",
    "answer": "Structure recommendations as a funnel: Candidate Generation (Retrieval) -> Scoring (Ranking) -> Diversity Re-ranking.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "recommendation-system-design",
    "unitTitle": "Design: a recommendation system"
  },
  {
    "id": "srs-takeaway-recommendation-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a recommendation system, what is a fundamental rule regarding: Use vector embeddings with Approximate Nearest Neighbor (ANN) search for millisecond candidate retrieval?",
    "answer": "Use vector embeddings with Approximate Nearest Neighbor (ANN) search for millisecond candidate retrieval.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "recommendation-system-design",
    "unitTitle": "Design: a recommendation system"
  },
  {
    "id": "srs-takeaway-recommendation-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a recommendation system, what is a fundamental rule regarding: Balance exploitation of known interests with exploration of new content using multi-armed bandits?",
    "answer": "Balance exploitation of known interests with exploration of new content using multi-armed bandits.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "recommendation-system-design",
    "unitTitle": "Design: a recommendation system"
  },
  {
    "id": "srs-takeaway-recommendation-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a recommendation system, what is a fundamental rule regarding: Incorporate real-time context (time of day, network speed, battery level) into ranking layers?",
    "answer": "Incorporate real-time context (time of day, network speed, battery level) into ranking layers.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "recommendation-system-design",
    "unitTitle": "Design: a recommendation system"
  },
  {
    "id": "srs-quiz-recommendation-system-design-c1",
    "type": "quiz",
    "prompt": "In a two-stage recommender, the retrieval stage pulls about 1,000 candidates from 10 million items with ANN search. What should that stage be judged on?",
    "answer": "Recall: whether the items the user would love are in the candidate set\n\nExplanation: Retrieval's job is to not miss good items; ranking then sorts the candidates precisely, and re-ranking handles diversity and business rules. Judging retrieval on top-10 precision confuses it with the ranking stage, which sees far fewer items with far richer features.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "recommendation-system-design",
    "unitTitle": "Design: a recommendation system"
  },
  {
    "id": "srs-quiz-recommendation-system-design-c2",
    "type": "quiz",
    "prompt": "You index 50 million items as 256-dimensional float32 embeddings in HNSW, whose graph links add about 25 to 50% on top of the raw vectors. Roughly how much memory does the index need?",
    "answer": "About 64 to 77 GB\n\nExplanation: Each vector is 256 x 4 B = 1 KB, so 50 million vectors is about 51 GB raw, and HNSW links bring it to roughly 64 to 77 GB. The 25 to 32 GB answer forgets that float32 is 4 bytes per dimension, and product quantisation would be the lever if this is too large.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "recommendation-system-design",
    "unitTitle": "Design: a recommendation system"
  },
  {
    "id": "srs-quiz-recommendation-system-design-c3",
    "type": "quiz",
    "prompt": "A team trains its ranker only on logged clicks. The new model keeps promoting items that happened to sit in the top slots last month. What is missing from the data?",
    "answer": "Impression logs with positions, for negatives and position bias\n\nExplanation: Without logging what was shown and where, the model sees no negatives and cannot separate an item's appeal from the boost of being at the top, so it learns position bias. Bigger retrieval or more compute does not fix a training signal that is biased at the source.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "recommendation-system-design",
    "unitTitle": "Design: a recommendation system"
  },
  {
    "id": "srs-takeaway-chat-and-messaging-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: chat and messaging, what is a fundamental rule regarding: Maintain persistent stateful WebSocket connections for low-latency bidirectional message delivery?",
    "answer": "Maintain persistent stateful WebSocket connections for low-latency bidirectional message delivery.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "chat-and-messaging-system-design",
    "unitTitle": "Design: chat and messaging"
  },
  {
    "id": "srs-takeaway-chat-and-messaging-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: chat and messaging, what is a fundamental rule regarding: Store connection location metadata (User -> Gateway Server IP) in a centralized, low-latency Redis cluster?",
    "answer": "Store connection location metadata (User -> Gateway Server IP) in a centralized, low-latency Redis cluster.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "chat-and-messaging-system-design",
    "unitTitle": "Design: chat and messaging"
  },
  {
    "id": "srs-takeaway-chat-and-messaging-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: chat and messaging, what is a fundamental rule regarding: Persist messages in append-optimized wide-column databases (Cassandra/ScyllaDB) partitioned by chat/channel ID?",
    "answer": "Persist messages in append-optimized wide-column databases (Cassandra/ScyllaDB) partitioned by chat/channel ID.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "chat-and-messaging-system-design",
    "unitTitle": "Design: chat and messaging"
  },
  {
    "id": "srs-takeaway-chat-and-messaging-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: chat and messaging, what is a fundamental rule regarding: Use fan-out-on-write for personal and small group chats; use pub/sub channels for massive group rooms?",
    "answer": "Use fan-out-on-write for personal and small group chats; use pub/sub channels for massive group rooms.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "chat-and-messaging-system-design",
    "unitTitle": "Design: chat and messaging"
  },
  {
    "id": "srs-quiz-chat-and-messaging-system-design-c1",
    "type": "quiz",
    "prompt": "User B's phone was offline for three hours while several conversations continued. On reconnect, how does B receive the missed messages in the right order?",
    "answer": "The client sends its last received sequence ID and fetches later messages from the store\n\nExplanation: Messages are persisted with a per-conversation sequence number, and the client syncs from its cursor, so ordering and completeness come from the store. Gateway memory does not survive disconnects or restarts, and push is only a doorbell, not a delivery channel.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "chat-and-messaging-system-design",
    "unitTitle": "Design: chat and messaging"
  },
  {
    "id": "srs-quiz-chat-and-messaging-system-design-c2",
    "type": "quiz",
    "prompt": "You expect 60 million concurrently connected clients, each gateway holds about 400,000 sockets, and clients send a heartbeat every 30 s. What are the gateway count and heartbeat rate?",
    "answer": "About 150 gateways plus headroom, and about 2 million heartbeats per second\n\nExplanation: 60,000,000 / 400,000 is 150 gateways before headroom for rolling restarts, and 60,000,000 / 30 s is 2 million heartbeat packets per second. The 60 million per second option forgets that each client only sends once every 30 s.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "chat-and-messaging-system-design",
    "unitTitle": "Design: chat and messaging"
  },
  {
    "id": "srs-quiz-chat-and-messaging-system-design-c3",
    "type": "quiz",
    "prompt": "Gateway B writes message 42 to B's socket and the kernel accepts it, but B's phone loses signal a moment later. When should the server mark message 42 as delivered?",
    "answer": "Only when B's app acknowledges seq 42; otherwise it syncs on reconnect\n\nExplanation: Receipts are application-level acknowledgements: only B's app saying delivered 42 proves it arrived, and if it never does, the reconnect cursor fetches it again. Treating a socket write as delivery is the classic trap, because bytes in a buffer on a dying connection are lost.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "chat-and-messaging-system-design",
    "unitTitle": "Design: chat and messaging"
  },
  {
    "id": "srs-takeaway-social-feed-system-design-case-study-1",
    "type": "takeaway",
    "prompt": "In Design: a social feed, what is a fundamental rule regarding: Understand the classic trade-off?",
    "answer": "Understand the classic trade-off: Fan-out on Write (fast reads, heavy writes) vs Fan-out on Read (fast writes, slow reads).",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "social-feed-system-design-case-study",
    "unitTitle": "Design: a social feed"
  },
  {
    "id": "srs-takeaway-social-feed-system-design-case-study-2",
    "type": "takeaway",
    "prompt": "In Design: a social feed, what is a fundamental rule regarding: Employ a hybrid approach?",
    "answer": "Employ a hybrid approach: push regular user updates to followers' Redis caches, but pull celebrity updates dynamically on read.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "social-feed-system-design-case-study",
    "unitTitle": "Design: a social feed"
  },
  {
    "id": "srs-takeaway-social-feed-system-design-case-study-3",
    "type": "takeaway",
    "prompt": "In Design: a social feed, what is a fundamental rule regarding: Cap pre-computed timeline lengths (e?",
    "answer": "Cap pre-computed timeline lengths (e.g., latest 800 tweet IDs) to control cache memory footprint.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "social-feed-system-design-case-study",
    "unitTitle": "Design: a social feed"
  },
  {
    "id": "srs-takeaway-social-feed-system-design-case-study-4",
    "type": "takeaway",
    "prompt": "In Design: a social feed, what is a fundamental rule regarding: Store only post IDs in timeline caches and hydrate post text, images, and user profiles in a single batched multi-get?",
    "answer": "Store only post IDs in timeline caches and hydrate post text, images, and user profiles in a single batched multi-get.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "social-feed-system-design-case-study",
    "unitTitle": "Design: a social feed"
  },
  {
    "id": "srs-quiz-social-feed-system-design-case-study-c1",
    "type": "quiz",
    "prompt": "In a pure fan-out-on-write feed, what happens when an account with 80 million followers posts?",
    "answer": "The system must perform about 80 million timeline cache writes for one post\n\nExplanation: Push inserts the post ID into every follower's precomputed timeline, so one celebrity post becomes 80 million writes and floods the fan-out queues. Slow merged reads are the weakness of the pull model, not the push model.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "social-feed-system-design-case-study",
    "unitTitle": "Design: a social feed"
  },
  {
    "id": "srs-quiz-social-feed-system-design-case-study-c2",
    "type": "quiz",
    "prompt": "A network has 50 million posts per day and an average of 200 followers per author, all using fan-out on write. What is the average timeline insert rate?",
    "answer": "About 116,000 inserts per second\n\nExplanation: 50 million x 200 is 10 billion inserts per day, and 10 billion / 86,400 is about 116,000 per second, with peaks several times higher. Dropping a zero on the daily total gives 11,600, which would badly undersize the fan-out fleet.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "social-feed-system-design-case-study",
    "unitTitle": "Design: a social feed"
  },
  {
    "id": "srs-quiz-social-feed-system-design-case-study-c3",
    "type": "quiz",
    "prompt": "A user deletes a post whose ID was already pushed into 5,000 follower timelines. How does the hybrid read path keep the deleted post from appearing?",
    "answer": "Timelines hold only IDs, and the hydrate and filter step drops deleted posts at read time\n\nExplanation: Because timelines store IDs and posts are hydrated in batches from the post store, a deleted post fails the filter on read even while its ID lingers; asynchronous cleanup can remove the IDs later. Synchronously rewriting every timeline makes a delete as expensive as the original fan-out.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "social-feed-system-design-case-study",
    "unitTitle": "Design: a social feed"
  },
  {
    "id": "srs-takeaway-geospatial-nearby-search-case-study-1",
    "type": "takeaway",
    "prompt": "In Design: nearby search, what is a fundamental rule regarding: Avoid unindexed 2D scans; use a database spatial index or a cell-based index selected for the query and update workload?",
    "answer": "Avoid unindexed 2D scans; use a database spatial index or a cell-based index selected for the query and update workload.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "geospatial-nearby-search-case-study",
    "unitTitle": "Design: nearby search"
  },
  {
    "id": "srs-takeaway-geospatial-nearby-search-case-study-2",
    "type": "takeaway",
    "prompt": "In Design: nearby search, what is a fundamental rule regarding: Geohash converts 2D coordinates into 1D prefix-searchable strings using Z-order curves?",
    "answer": "Geohash converts 2D coordinates into 1D prefix-searchable strings using Z-order curves.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "geospatial-nearby-search-case-study",
    "unitTitle": "Design: nearby search"
  },
  {
    "id": "srs-takeaway-geospatial-nearby-search-case-study-3",
    "type": "takeaway",
    "prompt": "In Design: nearby search, what is a fundamental rule regarding: Cover all cells intersecting the requested radius, then exact-distance filter candidates; eight neighbors are not sufficient for every radius, precision, or latitude?",
    "answer": "Cover all cells intersecting the requested radius, then exact-distance filter candidates; eight neighbors are not sufficient for every radius, precision, or latitude.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "geospatial-nearby-search-case-study",
    "unitTitle": "Design: nearby search"
  },
  {
    "id": "srs-takeaway-geospatial-nearby-search-case-study-4",
    "type": "takeaway",
    "prompt": "In Design: nearby search, what is a fundamental rule regarding: Decouple high-frequency moving objects (drivers) in Redis Geospatial from static location catalogs (restaurants)?",
    "answer": "Decouple high-frequency moving objects (drivers) in Redis Geospatial from static location catalogs (restaurants).",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "geospatial-nearby-search-case-study",
    "unitTitle": "Design: nearby search"
  },
  {
    "id": "srs-quiz-geospatial-nearby-search-case-study-c1",
    "type": "quiz",
    "prompt": "A café 20 m away from the user sits just across a geohash cell boundary and has a completely different prefix. How does a correct 1 km search still find it?",
    "answer": "It queries every cell the search circle intersects, then filters by exact distance\n\nExplanation: Cells that share a boundary can have unrelated prefixes on a Z-order curve, so the query must cover every intersecting cell and then apply an exact distance filter. Center plus eight neighbours is a common example, but cell sizes vary with precision and latitude, so it is not a guarantee.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "geospatial-nearby-search-case-study",
    "unitTitle": "Design: nearby search"
  },
  {
    "id": "srs-quiz-geospatial-nearby-search-case-study-c2",
    "type": "quiz",
    "prompt": "In a rural area, a precision-6 search returns 3 places but the app needs 20. What should the service do next?",
    "answer": "Widen to precision 5, then 4, until at least 20 results pass the filter\n\nExplanation: Shorter geohashes mean larger cells, so progressively dropping precision widens the search until K candidates pass the exact distance filter. Precision 7 is the tempting wrong direction, since it makes the cells smaller and finds even fewer places.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "geospatial-nearby-search-case-study",
    "unitTitle": "Design: nearby search"
  },
  {
    "id": "srs-quiz-geospatial-nearby-search-case-study-c3",
    "type": "quiz",
    "prompt": "Riders are being matched to drivers whose apps crashed several minutes earlier. Positions live in an in-memory geo index updated by pings every 4 seconds. What is the fix?",
    "answer": "Expire positions not refreshed within about 30 s so silent drivers drop out\n\nExplanation: A crashed app simply stops pinging, so without a TTL its last position looks valid forever; expiring stale entries makes silence mean unavailable. Writing every ping to disk adds load but still leaves the last row looking current.",
    "category": "Interactive Product System Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "geospatial-nearby-search-case-study",
    "unitTitle": "Design: nearby search"
  },
  {
    "id": "srs-takeaway-ride-matching-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: ride matching, what is a fundamental rule regarding: Use geospatial indexes (Geohash, Quadtree, H3) to avoid O(N) distance calculations?",
    "answer": "Use geospatial indexes (Geohash, Quadtree, H3) to avoid O(N) distance calculations.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-takeaway-ride-matching-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: ride matching, what is a fundamental rule regarding: Driver location updates generate massive write throughput; use distributed, in-memory stores like Redis?",
    "answer": "Driver location updates generate massive write throughput; use distributed, in-memory stores like Redis.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-takeaway-ride-matching-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: ride matching, what is a fundamental rule regarding: Ridesharing is highly localized; shard data and services by geographic region?",
    "answer": "Ridesharing is highly localized; shard data and services by geographic region.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-takeaway-ride-matching-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: ride matching, what is a fundamental rule regarding: Use WebSockets for low-latency, two-way communication between the server and the apps?",
    "answer": "Use WebSockets for low-latency, two-way communication between the server and the apps.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-takeaway-ride-matching-system-design-5",
    "type": "takeaway",
    "prompt": "In Design: ride matching, what is a fundamental rule regarding: Employ optimistic concurrency control to prevent multiple riders from claiming the same driver?",
    "answer": "Employ optimistic concurrency control to prevent multiple riders from claiming the same driver.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-quiz-ride-matching-system-design-c1",
    "type": "quiz",
    "prompt": "The geo index returns a driver 300 m away across a river and another 1.2 km away on the same road as the rider. How should the matching service rank them?",
    "answer": "By routing-engine ETA with live traffic, which may favour the 1.2 km driver\n\nExplanation: The index only produces candidates; ranking uses a routing service's ETA because a driver close as the crow flies can be ten minutes away by road. Straight-line distance is the tempting shortcut the lesson warns against.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-quiz-ride-matching-system-design-c2",
    "type": "quiz",
    "prompt": "800,000 drivers are online, each sending a 100-byte ping every 5 seconds. What are the global write rate and payload bandwidth?",
    "answer": "About 160,000 writes per second and 16 MB/s\n\nExplanation: 800,000 / 5 s is 160,000 writes per second, and at 100 B each that is 16 MB/s, spread across city shards with only the latest position kept in memory. The 800,000 option assumes one ping per second rather than one every five.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-quiz-ride-matching-system-design-c3",
    "type": "quiz",
    "prompt": "An offer to a driver times out after 15 s, the driver returns to AVAILABLE, and a new offer for another rider is sent. Then the driver's accept for the first offer arrives. What stops it stealing the driver?",
    "answer": "The accept must quote the current offer_id, so the stale one fails its conditional write\n\nExplanation: Binding the accept to the offer_id recorded by the compare-and-set to OFFERED makes a late accept for an expired offer match zero rows. Relying on the app to hide expired offers is fragile, because network delay means the accept may already be in flight.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "ride-matching-system-design",
    "unitTitle": "Design: ride matching"
  },
  {
    "id": "srs-takeaway-video-platform-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a video platform, what is a fundamental rule regarding: Use multipart uploads and pre-signed URLs to reliably move large files directly to object storage?",
    "answer": "Use multipart uploads and pre-signed URLs to reliably move large files directly to object storage.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-takeaway-video-platform-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a video platform, what is a fundamental rule regarding: Transcode video into multiple formats and resolutions to support all devices?",
    "answer": "Transcode video into multiple formats and resolutions to support all devices.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-takeaway-video-platform-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a video platform, what is a fundamental rule regarding: HLS and DASH protocols segment video and enable Adaptive Bitrate Streaming to prevent buffering?",
    "answer": "HLS and DASH protocols segment video and enable Adaptive Bitrate Streaming to prevent buffering.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-takeaway-video-platform-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a video platform, what is a fundamental rule regarding: Rely on CDNs to cache and deliver heavy video segments close to the user?",
    "answer": "Rely on CDNs to cache and deliver heavy video segments close to the user.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-takeaway-video-platform-system-design-5",
    "type": "takeaway",
    "prompt": "In Design: a video platform, what is a fundamental rule regarding: Handle view counting asynchronously using event streams and aggregation to avoid database lock contention?",
    "answer": "Handle view counting asynchronously using event streams and aggregation to avoid database lock contention.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-quiz-video-platform-system-design-c1",
    "type": "quiz",
    "prompt": "A viewer watching a 1080p HLS stream moves into weak coverage and throughput drops sharply. What does adaptive bitrate streaming do?",
    "answer": "The player picks the next segment from a lower rendition listed in the manifest\n\nExplanation: Every rendition is pre-encoded and segmented, and the manifest lists them, so the player simply requests its next few seconds at a lower bitrate. Nothing is transcoded on demand; that work happened once, offline, after upload.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-quiz-video-platform-system-design-c2",
    "type": "quiz",
    "prompt": "A live event has 4 million concurrent viewers at an average of 5 Mbps, and the CDN hit ratio is 95%. How much bandwidth does the origin serve?",
    "answer": "About 1 Tbps, 5% of 20 Tbps\n\nExplanation: Total demand is 4,000,000 x 5 Mbps = 20 Tbps, and the 5% of requests that miss the CDN reach the origin, about 1 Tbps. 19 Tbps is what the edges serve, not the origin, which shows why hit ratio is the lever that matters.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-quiz-video-platform-system-design-c3",
    "type": "quiz",
    "prompt": "A sports streamer using 6-second segments hears that viewers see goals 20 or more seconds after TV viewers and that quality adapts slowly. What change fits, and at what cost?",
    "answer": "Use 2 s or low-latency partial segments, at the cost of more requests and worse compression\n\nExplanation: Shorter segments, or LL-HLS/DASH partial segments, cut glass-to-glass latency and let the player switch renditions sooner, but they add requests, manifest entries and CDN complexity. A better codec saves bandwidth but does nothing for latency, which is governed by segment duration.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "video-platform-system-design",
    "unitTitle": "Design: a video platform"
  },
  {
    "id": "srs-takeaway-file-sync-system-design-1",
    "type": "takeaway",
    "prompt": "In Design: a file sync service, what is a fundamental rule regarding: Break files into chunks to only upload/download the parts of a file that actually changed?",
    "answer": "Break files into chunks to only upload/download the parts of a file that actually changed.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-takeaway-file-sync-system-design-2",
    "type": "takeaway",
    "prompt": "In Design: a file sync service, what is a fundamental rule regarding: Use Content-Addressable Storage (naming chunks by their hash) to achieve automatic deduplication?",
    "answer": "Use Content-Addressable Storage (naming chunks by their hash) to achieve automatic deduplication.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-takeaway-file-sync-system-design-3",
    "type": "takeaway",
    "prompt": "In Design: a file sync service, what is a fundamental rule regarding: Separate the metadata path (database) from the data path (object storage)?",
    "answer": "Separate the metadata path (database) from the data path (object storage).",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-takeaway-file-sync-system-design-4",
    "type": "takeaway",
    "prompt": "In Design: a file sync service, what is a fundamental rule regarding: Use long-polling or WebSockets to notify clients of changes instantly, avoiding inefficient polling?",
    "answer": "Use long-polling or WebSockets to notify clients of changes instantly, avoiding inefficient polling.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-takeaway-file-sync-system-design-5",
    "type": "takeaway",
    "prompt": "In Design: a file sync service, what is a fundamental rule regarding: Handle offline conflicts gracefully by creating conflicted copies rather than silently overwriting data?",
    "answer": "Handle offline conflicts gracefully by creating conflicted copies rather than silently overwriting data.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-quiz-file-sync-system-design-c1",
    "type": "quiz",
    "prompt": "Two laptops edit the same .docx while offline and both come online. What is the standard way a file-sync service handles this?",
    "answer": "Keep both, saving the second arrival as a conflicted copy for the user\n\nExplanation: The service cannot merge an opaque binary format safely, so it preserves both and lets the user resolve the conflicted copy. Picking the later timestamp silently loses work, and device clocks drift so the later timestamp may not even be the later edit.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-quiz-file-sync-system-design-c2",
    "type": "quiz",
    "prompt": "A 200 MB file is stored as 4 MB chunks. The user inserts 2 KB near the beginning. Roughly how much is uploaded with fixed-size chunks versus content-defined chunking?",
    "answer": "About 200 MB fixed versus about 4 MB content-defined\n\nExplanation: With fixed boundaries the insertion shifts every later chunk, so all 50 hashes change and the whole file is re-sent. A rolling hash re-anchors boundaries to content, so only the chunk containing the insertion changes. Fixed chunks work well only for appends or in-place replacements.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-quiz-file-sync-system-design-c3",
    "type": "quiz",
    "prompt": "With global cross-user deduplication, an upload of a known leaked document completes instantly with upload skipped. Why is this a problem, and what is the safer design?",
    "answer": "It reveals another account already stores that content; deduplicate per user or require proof of possession\n\nExplanation: An instant skip is an oracle telling an attacker that someone else has the file, so global dedup trades storage savings for privacy. Per-user or per-team scope, or proof that the client actually holds the bytes, closes the leak. The other options describe unrelated concerns.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "file-sync-system-design",
    "unitTitle": "Design: a file sync service"
  },
  {
    "id": "srs-takeaway-observability-slo-case-study-1",
    "type": "takeaway",
    "prompt": "In Design: observability and SLOs, what is a fundamental rule regarding: Combine metrics (for alerting), logs (for detail), and traces (for context) for full observability?",
    "answer": "Combine metrics (for alerting), logs (for detail), and traces (for context) for full observability.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-takeaway-observability-slo-case-study-2",
    "type": "takeaway",
    "prompt": "In Design: observability and SLOs, what is a fundamental rule regarding: Define strict SLIs that measure user-facing symptoms, not just underlying system causes?",
    "answer": "Define strict SLIs that measure user-facing symptoms, not just underlying system causes.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-takeaway-observability-slo-case-study-3",
    "type": "takeaway",
    "prompt": "In Design: observability and SLOs, what is a fundamental rule regarding: Use Error Budgets to balance feature velocity with system reliability?",
    "answer": "Use Error Budgets to balance feature velocity with system reliability.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-takeaway-observability-slo-case-study-4",
    "type": "takeaway",
    "prompt": "In Design: observability and SLOs, what is a fundamental rule regarding: Use distributed tracing with correlation IDs passed in HTTP headers to track requests across microservices?",
    "answer": "Use distributed tracing with correlation IDs passed in HTTP headers to track requests across microservices.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-takeaway-observability-slo-case-study-5",
    "type": "takeaway",
    "prompt": "In Design: observability and SLOs, what is a fundamental rule regarding: Design alerts to trigger on symptom-based SLO burn rates rather than individual CPU spikes?",
    "answer": "Design alerts to trigger on symptom-based SLO burn rates rather than individual CPU spikes.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-quiz-observability-slo-case-study-c1",
    "type": "quiz",
    "prompt": "A team pages on CPU above 80%. Why does the lesson prefer paging on SLO burn rate instead?",
    "answer": "CPU pages when users are fine and can stay quiet while every request fails fast\n\nExplanation: Cause-based alerts are both noisy and blind: high CPU with happy users wakes people for nothing, and a fast-failing outage can leave CPU idle. Burn-rate alerts fire on what users experience. The cost and tooling options are simply not true.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-quiz-observability-slo-case-study-c2",
    "type": "quiz",
    "prompt": "Checkout handles 3 million requests in 28 days with a 99.9% availability SLO. A bad deploy fails 10% of requests for 30 minutes at about 75 requests per minute. What share of the budget did it burn?",
    "answer": "About 7.5% of the budget\n\nExplanation: The budget is 0.1% of 3 million, or 3,000 failed requests. The deploy served 2,250 requests and failed 10% of them, 225, which is 7.5% of the budget. The 75% answer comes from dividing all 2,250 requests, not just the failures, into the budget.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-quiz-observability-slo-case-study-c3",
    "type": "quiz",
    "prompt": "A fast-burn page fires only on the 1-hour error ratio exceeding 14.4 x 0.001. After a rollback fixes the problem, the page keeps firing for most of an hour. What does adding the 5-minute condition achieve?",
    "answer": "It lets the alert resolve quickly once recent errors drop, while the long window keeps it meaningful\n\nExplanation: Requiring both windows means the 1-hour ratio proves the burn is significant, and the 5-minute ratio proves it is still happening, so the alert clears soon after mitigation. Slow burns are caught by the separate 6-hour and 30-minute ticket rule, not by the short window.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "observability-slo-case-study",
    "unitTitle": "Design: observability and SLOs"
  },
  {
    "id": "srs-takeaway-zero-downtime-database-migration-case-study-1",
    "type": "takeaway",
    "prompt": "In Design: a database migration, what is a fundamental rule regarding: Never run blocking ALTER TABLE commands on live, heavily used tables?",
    "answer": "Never run blocking ALTER TABLE commands on live, heavily used tables.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-takeaway-zero-downtime-database-migration-case-study-2",
    "type": "takeaway",
    "prompt": "In Design: a database migration, what is a fundamental rule regarding: Use the Expand and Contract (Parallel Change) pattern for safe schema evolutions?",
    "answer": "Use the Expand and Contract (Parallel Change) pattern for safe schema evolutions.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-takeaway-zero-downtime-database-migration-case-study-3",
    "type": "takeaway",
    "prompt": "In Design: a database migration, what is a fundamental rule regarding: Separate schema changes from application deployment rollouts?",
    "answer": "Separate schema changes from application deployment rollouts.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-takeaway-zero-downtime-database-migration-case-study-4",
    "type": "takeaway",
    "prompt": "In Design: a database migration, what is a fundamental rule regarding: Use Change Data Capture (CDC) to stream data for cross-engine migrations without downtime?",
    "answer": "Use Change Data Capture (CDC) to stream data for cross-engine migrations without downtime.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-takeaway-zero-downtime-database-migration-case-study-5",
    "type": "takeaway",
    "prompt": "In Design: a database migration, what is a fundamental rule regarding: Backfill scripts must run in small batches to avoid overwhelming the production database?",
    "answer": "Backfill scripts must run in small batches to avoid overwhelming the production database.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-quiz-zero-downtime-database-migration-case-study-c1",
    "type": "quiz",
    "prompt": "During a CDC-based move from MySQL to PostgreSQL, why does the cutover briefly pause application writes?",
    "answer": "So the final transactions replicate and nothing is written to both databases at once\n\nExplanation: With writes stopped, CDC lag can reach exactly zero, the final position is verified, and the connection switches with no writes lost or split between two primaries. A fresh snapshot is not needed at cutover, since CDC has been streaming changes since the initial copy.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-quiz-zero-downtime-database-migration-case-study-c2",
    "type": "quiz",
    "prompt": "You must migrate 12 TB with a parallel initial copy running at about 400 MB/s. How long does the snapshot take, and what must you record at its start?",
    "answer": "About 8 hours; the binlog position or GTID\n\nExplanation: 12,000,000 MB / 400 MB/s is 30,000 s, a little over 8 hours, and the GTID at snapshot start is where CDC must resume so no change is missed or applied twice. Checksums matter for verification later, but they do not tell CDC where to begin.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-quiz-zero-downtime-database-migration-case-study-c3",
    "type": "quiz",
    "prompt": "Three days after switching writes to PostgreSQL, a serious bug appears and the team wants to return to MySQL without losing those three days of writes. What must already be in place?",
    "answer": "Reverse CDC from PostgreSQL to MySQL started before writes resumed\n\nExplanation: Only reverse replication, started before writes were re-enabled, keeps MySQL current with post-cutover changes, so rollback is a connection switch rather than data loss. A pre-cutover dump is tempting but is missing exactly the three days of writes you need.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "zero-downtime-database-migration-case-study",
    "unitTitle": "Design: a database migration"
  },
  {
    "id": "srs-takeaway-interview-design-instagram-1",
    "type": "takeaway",
    "prompt": "In Design: a photo-sharing interview, what is a fundamental rule regarding: Store heavy media in Object Storage and serve it strictly through a CDN?",
    "answer": "Store heavy media in Object Storage and serve it strictly through a CDN.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-takeaway-interview-design-instagram-2",
    "type": "takeaway",
    "prompt": "In Design: a photo-sharing interview, what is a fundamental rule regarding: Use a Fan-out on Write (Push) model to pre-compute feeds for fast reads?",
    "answer": "Use a Fan-out on Write (Push) model to pre-compute feeds for fast reads.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-takeaway-interview-design-instagram-3",
    "type": "takeaway",
    "prompt": "In Design: a photo-sharing interview, what is a fundamental rule regarding: Adopt a Hybrid Fan-out model to prevent the 'celebrity problem' (thundering herd on write)?",
    "answer": "Adopt a Hybrid Fan-out model to prevent the 'celebrity problem' (thundering herd on write).",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-takeaway-interview-design-instagram-4",
    "type": "takeaway",
    "prompt": "In Design: a photo-sharing interview, what is a fundamental rule regarding: Scale relational databases by sharding users across multiple database instances?",
    "answer": "Scale relational databases by sharding users across multiple database instances.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-takeaway-interview-design-instagram-5",
    "type": "takeaway",
    "prompt": "In Design: a photo-sharing interview, what is a fundamental rule regarding: Use asynchronous workers to process image resizing, thumbnail generation, and feed fan-out?",
    "answer": "Use asynchronous workers to process image resizing, thumbnail generation, and feed fan-out.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-quiz-interview-design-instagram-c1",
    "type": "quiz",
    "prompt": "In the recommended upload design, how do photo bytes get from the phone into object storage?",
    "answer": "The app PUTs them directly to S3 using a pre-signed URL from the API\n\nExplanation: The API only issues a pre-signed URL and a media_id, so large bytes bypass the application tier and API servers stay small and stateless. Routing bytes through the API works, but it wastes API capacity and is the trap the lesson calls out.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-quiz-interview-design-instagram-c2",
    "type": "quiz",
    "prompt": "300 million daily users each view about 80 images per day, and the CDN absorbs 95% of fetches. Roughly what image request rate reaches the origin?",
    "answer": "About 14,000 per second\n\nExplanation: 300 million x 80 is 24 billion fetches per day, about 278,000 per second on average, and 5% of that is roughly 14,000 per second at the origin. 278,000 is the total demand before the CDN takes its share.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-quiz-interview-design-instagram-c3",
    "type": "quiz",
    "prompt": "A viral post receives thousands of likes per second and UPDATE posts SET likes = likes + 1 causes lock contention on that row. What is the better design?",
    "answer": "Store each like as its own row and maintain the count with sharded or asynchronous counters\n\nExplanation: Likes are write-heavy, so they go in a wide-column store as individual rows, with counts aggregated asynchronously or spread over sharded counters to avoid one hot row. Stronger isolation makes the contention worse, and a bigger primary does not change that every increment serialises on the same row.",
    "category": "High-Scale Media & Operations Designs",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "interview-design-instagram",
    "unitTitle": "Design: a photo-sharing interview"
  },
  {
    "id": "srs-takeaway-case-instagram-early-architecture-1",
    "type": "takeaway",
    "prompt": "In Case: Instagram's first architecture, what is a fundamental rule regarding: Keep the architecture boring and simple; avoid complex, unproven technologies when scaling rapidly?",
    "answer": "Keep the architecture boring and simple; avoid complex, unproven technologies when scaling rapidly.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-instagram-early-architecture",
    "unitTitle": "Case: Instagram's first architecture"
  },
  {
    "id": "srs-takeaway-case-instagram-early-architecture-2",
    "type": "takeaway",
    "prompt": "In Case: Instagram's first architecture, what is a fundamental rule regarding: Separate the heavy lifting (image delivery via CDN) from application logic (Django) and metadata (Postgres)?",
    "answer": "Separate the heavy lifting (image delivery via CDN) from application logic (Django) and metadata (Postgres).",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-instagram-early-architecture",
    "unitTitle": "Case: Instagram's first architecture"
  },
  {
    "id": "srs-takeaway-case-instagram-early-architecture-3",
    "type": "takeaway",
    "prompt": "In Case: Instagram's first architecture, what is a fundamental rule regarding: When sharding databases, embedding a logical shard ID into the primary key replaces per-row lookups with a small logical-to-physical shard map, which is also what makes rebalancing possible?",
    "answer": "When sharding databases, embedding a logical shard ID into the primary key replaces per-row lookups with a small logical-to-physical shard map, which is also what makes rebalancing possible.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-instagram-early-architecture",
    "unitTitle": "Case: Instagram's first architecture"
  },
  {
    "id": "srs-takeaway-case-instagram-early-architecture-4",
    "type": "takeaway",
    "prompt": "In Case: Instagram's first architecture, what is a fundamental rule regarding: Use in-memory data stores like Redis for highly read-heavy, low-latency data structures like user feeds?",
    "answer": "Use in-memory data stores like Redis for highly read-heavy, low-latency data structures like user feeds.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-instagram-early-architecture",
    "unitTitle": "Case: Instagram's first architecture"
  },
  {
    "id": "srs-quiz-case-instagram-early-architecture-c1",
    "type": "quiz",
    "prompt": "Instagram's 64-bit photo IDs embed a 13-bit logical shard number. Given a photo ID, how does the application find the PostgreSQL server that holds the photo?",
    "answer": "It extracts the logical shard bits, then consults a small logical-to-physical map\n\nExplanation: The ID yields only the logical shard; a small map from thousands of logical shards to a few physical servers completes routing, and that indirection is what allows shards to move. Assuming the ID encodes the server itself is the trap, since then no shard could ever be relocated.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-instagram-early-architecture",
    "unitTitle": "Case: Instagram's first architecture"
  },
  {
    "id": "srs-quiz-case-instagram-early-architecture-c2",
    "type": "quiz",
    "prompt": "While generating an ID, a shard's sequence returns 2050. What value goes into the low 10 bits, and what limit does this imply?",
    "answer": "2, and each shard can issue 1,024 IDs per millisecond\n\nExplanation: 10 bits hold values 0 to 1023, so the sequence is taken modulo 1024: 2050 mod 1024 = 2. Within one millisecond a shard therefore has 1,024 distinct IDs. 8,192 is the number of logical shards from the 13 shard bits, not a per-millisecond limit.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-instagram-early-architecture",
    "unitTitle": "Case: Instagram's first architecture"
  },
  {
    "id": "srs-quiz-case-instagram-early-architecture-c3",
    "type": "quiz",
    "prompt": "One physical PostgreSQL server hosting 2,000 logical shards is overloaded. How did Instagram's design let them relieve it without touching any existing IDs?",
    "answer": "Move some shard schemas to a new server, for example by promoting a replica, then update the map\n\nExplanation: Because there are many more logical shards than servers, whole schemas can be relocated and only the logical-to-physical map changes; no ID is re-hashed or rewritten. Rewriting shard bits is exactly the costly re-keying this design was built to avoid.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-instagram-early-architecture",
    "unitTitle": "Case: Instagram's first architecture"
  },
  {
    "id": "srs-takeaway-case-stripe-idempotency-keys-1",
    "type": "takeaway",
    "prompt": "In Case: Stripe's idempotency keys, what is a fundamental rule regarding: Network timeouts are ambiguous?",
    "answer": "Network timeouts are ambiguous: you don't know if the request failed or the response failed.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-takeaway-case-stripe-idempotency-keys-2",
    "type": "takeaway",
    "prompt": "In Case: Stripe's idempotency keys, what is a fundamental rule regarding: APIs that mutate state (payments, creates, deletes) must be idempotent to allow safe retries?",
    "answer": "APIs that mutate state (payments, creates, deletes) must be idempotent to allow safe retries.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-takeaway-case-stripe-idempotency-keys-3",
    "type": "takeaway",
    "prompt": "In Case: Stripe's idempotency keys, what is a fundamental rule regarding: Clients generate a unique UUID and pass it in the Idempotency-Key header?",
    "answer": "Clients generate a unique UUID and pass it in the Idempotency-Key header.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-takeaway-case-stripe-idempotency-keys-4",
    "type": "takeaway",
    "prompt": "In Case: Stripe's idempotency keys, what is a fundamental rule regarding: The server caches the resulting HTTP response against the idempotency key and replays it on retries?",
    "answer": "The server caches the resulting HTTP response against the idempotency key and replays it on retries.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-takeaway-case-stripe-idempotency-keys-5",
    "type": "takeaway",
    "prompt": "In Case: Stripe's idempotency keys, what is a fundamental rule regarding: Claim the key atomically with local mutation state; external effects still require provider idempotency, unknown-outcome recovery, and reconciliation?",
    "answer": "Claim the key atomically with local mutation state; external effects still require provider idempotency, unknown-outcome recovery, and reconciliation.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-quiz-case-stripe-idempotency-keys-c1",
    "type": "quiz",
    "prompt": "A charge request with key k-12 finished with a 402 card_declined response. The client retries with the same key and the same parameters. What should the server return?",
    "answer": "The stored 402 response, replayed exactly as before\n\nExplanation: A finished key with identical parameters replays the stored status and body, even when that result was an error; a new attempt needs a new key. 409 is reserved for a key that is still in progress, which is the tempting mix-up.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-quiz-case-stripe-idempotency-keys-c2",
    "type": "quiz",
    "prompt": "The server records recovery points started, charge_created and finished. It crashes after committing charge_created but before finishing. What makes the retry with the same key safe?",
    "answer": "The retry resumes from charge_created, and the processor call uses a stable idempotent reference\n\nExplanation: Each local phase commits atomically with its recovery point, so the retry picks up at charge_created; foreign calls between phases carry a stable reference, so re-executing them cannot double-charge. Starting over from scratch is dangerous, because the external charge may already exist.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-quiz-case-stripe-idempotency-keys-c3",
    "type": "quiz",
    "prompt": "A mobile app retries charge requests on timeout. When should it generate and store the idempotency key?",
    "answer": "Once per intended charge, persisted before the first request is sent\n\nExplanation: The key names one intended operation, so every retry of that charge must carry it, and persisting it first means an app restart still retries with the same key. A fresh key per attempt is the classic trap: each retry then looks like a new charge.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-stripe-idempotency-keys",
    "unitTitle": "Case: Stripe's idempotency keys"
  },
  {
    "id": "srs-takeaway-case-discord-message-storage-1",
    "type": "takeaway",
    "prompt": "In Case: how Discord stores trillions of messages, what is a fundamental rule regarding: Wide-column stores (Cassandra/Scylla) excel at high-throughput write workloads due to LSM trees?",
    "answer": "Wide-column stores (Cassandra/Scylla) excel at high-throughput write workloads due to LSM trees.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-takeaway-case-discord-message-storage-2",
    "type": "takeaway",
    "prompt": "In Case: how Discord stores trillions of messages, what is a fundamental rule regarding: Partitioning by channel keeps related data together but creates Hot Partitions for viral channels?",
    "answer": "Partitioning by channel keeps related data together but creates Hot Partitions for viral channels.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-takeaway-case-discord-message-storage-3",
    "type": "takeaway",
    "prompt": "In Case: how Discord stores trillions of messages, what is a fundamental rule regarding: Time buckets bound partition size and distribute historical buckets over time, but the current bucket can remain hot?",
    "answer": "Time buckets bound partition size and distribute historical buckets over time, but the current bucket can remain hot.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-takeaway-case-discord-message-storage-4",
    "type": "takeaway",
    "prompt": "In Case: how Discord stores trillions of messages, what is a fundamental rule regarding: Runtime and storage-engine behavior matter at extreme scale; avoiding JVM GC was one benefit of Discord's move to ScyllaDB?",
    "answer": "Runtime and storage-engine behavior matter at extreme scale; avoiding JVM GC was one benefit of Discord's move to ScyllaDB.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-takeaway-case-discord-message-storage-5",
    "type": "takeaway",
    "prompt": "In Case: how Discord stores trillions of messages, what is a fundamental rule regarding: Coalescing concurrent reads at the application layer protects the database from thundering herds?",
    "answer": "Coalescing concurrent reads at the application layer protects the database from thundering herds.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-quiz-case-discord-message-storage-c1",
    "type": "quiz",
    "prompt": "Discord's partition key is (channel_id, bucket) with roughly 10-day buckets. A channel suddenly goes viral. What does bucketing do for its write load?",
    "answer": "It bounds partition size over time, but the current bucket stays on one replica set\n\nExplanation: Buckets stop a channel's lifetime history becoming one unbounded partition, but every write in the current window still hits the same partition's replicas. Believing buckets spread hot traffic is the trap the lesson names explicitly.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-quiz-case-discord-message-storage-c2",
    "type": "quiz",
    "prompt": "A channel receives 600 messages per minute of about 1 KB each. Roughly how large is one 10-day bucket, and how large would an unbucketed year be?",
    "answer": "About 8.6 GB per bucket and about 315 GB per year\n\nExplanation: 600 x 1,440 minutes x 10 days is about 8.6 million messages, roughly 8.6 GB per bucket, while a year is about 315 million messages or 315 GB in one partition. The last option mistakes the yearly total for ten buckets instead of about 36.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-quiz-case-discord-message-storage-c3",
    "type": "quiz",
    "prompt": "Discord's data services coalesce identical in-flight queries. Why must requests be routed to instances by channel ID rather than spread by a round-robin load balancer?",
    "answer": "Identical requests can only merge if they reach the same instance at the same moment\n\nExplanation: Coalescing merges queries that are simultaneously in flight within one process, so 100,000 requests for channel 42 must converge on one instance to become a handful of database reads. Caching is the tempting answer, but the lesson stresses these services shape traffic and are not a cache.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-discord-message-storage",
    "unitTitle": "Case: how Discord stores trillions of messages"
  },
  {
    "id": "srs-takeaway-case-amazon-dynamo-1",
    "type": "takeaway",
    "prompt": "In Case: Amazon Dynamo, the paper, what is a fundamental rule regarding: Leaderless replication can preserve writes through some node and network failures when enough reachable replicas or fallback nodes remain; it cannot promise availability under every partition?",
    "answer": "Leaderless replication can preserve writes through some node and network failures when enough reachable replicas or fallback nodes remain; it cannot promise availability under every partition.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-takeaway-case-amazon-dynamo-2",
    "type": "takeaway",
    "prompt": "In Case: Amazon Dynamo, the paper, what is a fundamental rule regarding: Conflict resolution can be delayed until read time, pushing the business logic to the application layer?",
    "answer": "Conflict resolution can be delayed until read time, pushing the business logic to the application layer.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-takeaway-case-amazon-dynamo-3",
    "type": "takeaway",
    "prompt": "In Case: Amazon Dynamo, the paper, what is a fundamental rule regarding: Vector Clocks track the causal history of updates to identify and resolve concurrent modifications?",
    "answer": "Vector Clocks track the causal history of updates to identify and resolve concurrent modifications.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-takeaway-case-amazon-dynamo-4",
    "type": "takeaway",
    "prompt": "In Case: Amazon Dynamo, the paper, what is a fundamental rule regarding: Consistent Hashing minimizes data movement when scaling the database cluster up or down?",
    "answer": "Consistent Hashing minimizes data movement when scaling the database cluster up or down.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-takeaway-case-amazon-dynamo-5",
    "type": "takeaway",
    "prompt": "In Case: Amazon Dynamo, the paper, what is a fundamental rule regarding: Quorum protocols (N, R, W) allow engineers to tune the tradeoff between latency, consistency, and availability?",
    "answer": "Quorum protocols (N, R, W) allow engineers to tune the tradeoff between latency, consistency, and availability.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-quiz-case-amazon-dynamo-c1",
    "type": "quiz",
    "prompt": "A Dynamo replica was down for a long time and has missed many writes. Which technique does the paper use to bring it back in sync in the background?",
    "answer": "Anti-entropy using Merkle trees\n\nExplanation: Merkle trees let replicas compare key ranges cheaply and exchange only the parts that differ, which is how Dynamo recovers from permanent failures. Hinted handoff is the tempting pick, but it covers temporary failures, delivering writes that a fallback node held on the replica's behalf.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-quiz-case-amazon-dynamo-c2",
    "type": "quiz",
    "prompt": "A read returns two versions of a cart: A with clock [Sx:3, Sy:1] and B with clock [Sx:2, Sy:1, Sz:1]. What should the client conclude?",
    "answer": "They are concurrent, so the client must merge them\n\nExplanation: A version descends from another only if every counter is greater or equal; A is ahead on Sx but has no Sz entry, while B has Sz:1, so neither dominates. Picking the higher Sx counter is last-writer thinking and would silently drop B's changes.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-quiz-case-amazon-dynamo-c3",
    "type": "quiz",
    "prompt": "With N = 3, R = 2 and W = 2, a partition cuts off two of a key's preferred replicas, and a write is accepted by fallback nodes. A later read from two preferred replicas misses it. Why is this possible despite R + W exceeding N?",
    "answer": "The write landed on nodes outside the preference list, so read and write sets need not overlap\n\nExplanation: Overlap only holds for a fixed replica set; with a sloppy quorum the write can be satisfied by fallback nodes and handed back later, so the read quorum may contain none of them. Vector clocks never discard concurrent versions; they return them for merging.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-amazon-dynamo",
    "unitTitle": "Case: Amazon Dynamo, the paper"
  },
  {
    "id": "srs-takeaway-case-gitlab-database-incident-1",
    "type": "takeaway",
    "prompt": "In Case: GitLab’s database incident, what is a fundamental rule regarding: A backup system is useless if you have not routinely tested the restoration process?",
    "answer": "A backup system is useless if you have not routinely tested the restoration process.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  },
  {
    "id": "srs-takeaway-case-gitlab-database-incident-2",
    "type": "takeaway",
    "prompt": "In Case: GitLab’s database incident, what is a fundamental rule regarding: Monitor your backup jobs just as rigorously as you monitor your production application?",
    "answer": "Monitor your backup jobs just as rigorously as you monitor your production application.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  },
  {
    "id": "srs-takeaway-case-gitlab-database-incident-3",
    "type": "takeaway",
    "prompt": "In Case: GitLab’s database incident, what is a fundamental rule regarding: Human error under fatigue is inevitable; design systems with 'undo' buttons, delayed deletions, or strict blast-radius controls?",
    "answer": "Human error under fatigue is inevitable; design systems with 'undo' buttons, delayed deletions, or strict blast-radius controls.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  },
  {
    "id": "srs-takeaway-case-gitlab-database-incident-4",
    "type": "takeaway",
    "prompt": "In Case: GitLab’s database incident, what is a fundamental rule regarding: Use visual cues (different colored terminal prompts) to distinguish production servers from staging or replicas?",
    "answer": "Use visual cues (different colored terminal prompts) to distinguish production servers from staging or replicas.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  },
  {
    "id": "srs-takeaway-case-gitlab-database-incident-5",
    "type": "takeaway",
    "prompt": "In Case: GitLab’s database incident, what is a fundamental rule regarding: Blameless postmortems and transparency build trust faster than hiding mistakes?",
    "answer": "Blameless postmortems and transparency build trust faster than hiding mistakes.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  },
  {
    "id": "srs-quiz-case-gitlab-database-incident-c1",
    "type": "quiz",
    "prompt": "The usable snapshot was taken at about 17:20, the deletion happened at about 23:25, and GitLab.com was back online at about 18:00 the next day. What were the effective RPO and RTO?",
    "answer": "RPO about 6 hours and RTO about 18.5 hours\n\nExplanation: Data loss ran from the 17:20 snapshot to the 23:25 deletion, about 6 hours, and downtime ran from the deletion to about 18:00 the next day, about 18.5 hours. The 24.5-hour figure measures from the snapshot rather than from the incident, which confuses the two objectives.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  },
  {
    "id": "srs-quiz-case-gitlab-database-incident-c2",
    "type": "quiz",
    "prompt": "GitLab's automated pg_dump backups had been failing for some time, yet nobody knew. What combination caused this?",
    "answer": "A 9.2 pg_dump ran against a 9.6 server, and failure emails were rejected by DMARC\n\nExplanation: The job used an incompatible binary, so every run failed, and the failure notifications were bounced, so the failure was invisible; the empty S3 bucket was a consequence, not the cause. This is why the lesson says to monitor backups as rigorously as production.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  },
  {
    "id": "srs-quiz-case-gitlab-database-incident-c3",
    "type": "quiz",
    "prompt": "GitLab had five safety nets that failed in five different ways. Which single practice would most likely have exposed all of those weaknesses before the incident?",
    "answer": "Scheduled automated restores to a scratch host with sanity queries, paging on failure\n\nExplanation: Restore drills test the outcome that matters, so a failing dump, an empty bucket and slow copy speed would all surface, along with real RTO. Another mechanism is the tempting answer, but GitLab's lesson is that untested mechanisms add a feeling of safety, not recoverability.",
    "category": "Real-World Architecture Evolution & Incidents",
    "track": "Systems Design Labs & Architectural Evolution",
    "topicSlug": "case-gitlab-database-incident",
    "unitTitle": "Case: GitLab’s database incident"
  }
];

  if (root && typeof root === 'object') {
    root.SRS_CARDS_DATA = SRS_CARDS_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SRS_CARDS_DATA;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
