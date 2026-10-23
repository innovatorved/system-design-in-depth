window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["distributed-systems-foundations"] = [
  {
    "id": "distributed-systems-foundations-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Datacenter failure model",
    "section": "The Three Distributed Failure Modes",
    "prompt": "Inside a single organisation's datacenters, which failure model do coordination systems usually design for, and why not Byzantine?",
    "options": [
      "Crash-stop only, because restarted nodes are always wiped and rejoin as brand-new members",
      "Crash-recovery, because nodes restart with lagging durable state, and BFT's quadratic message cost is not justified among trusted nodes",
      "Byzantine, because hardware faults can corrupt messages in any datacenter",
      "Omission only, because the network is the sole source of failures inside a datacenter"
    ],
    "answer": 1,
    "explanation": "Private deployments assume crash-recovery: nodes crash, restart, replay their WAL and catch up with lagging state, and checksums plus authentication cover corruption. BFT's quadratic messaging and 3f+1 nodes are kept for mutually distrusting parties, so assuming Byzantine faults internally overpays.",
    "tags": [
      "distributed-systems-foundations",
      "recall",
      "inline"
    ]
  },
  {
    "id": "distributed-systems-foundations-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Retrying a card charge",
    "section": "Worked example: why a timeout cannot tell you what happened",
    "prompt": "Service A charges cards through service B with a 1-second timeout. B occasionally stalls for 4 seconds in GC. When A times out, which design is safe?",
    "options": [
      "Raise the timeout to 5 seconds so A never has to retry during a GC pause",
      "Never retry charges, and report a failure to the user on every timeout",
      "Before retrying, ask B whether the charge exists, and retry only if it does not",
      "Send an idempotency key that B stores with the result in the same transaction, then retry freely"
    ],
    "answer": 3,
    "explanation": "A timeout cannot tell A whether the request was lost, completed, or is still in progress, and only an idempotency key makes a retry safe in all three cases. The status check is tempting but races: a B stalled in GC can report 'no charge' and then process the original request alongside the retry.",
    "tags": [
      "distributed-systems-foundations",
      "apply",
      "inline"
    ]
  },
  {
    "id": "distributed-systems-foundations-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Raft versus FLP",
    "section": "Timing models",
    "prompt": "FLP proves that no deterministic consensus protocol can guarantee termination in an asynchronous system with even one crash. Yet etcd runs Raft in production. How is this reconciled?",
    "options": [
      "Raft assumes partial synchrony: it is always safe, and makes progress once timing bounds eventually hold",
      "Raft's randomised timeouts fully sidestep FLP, so it always terminates",
      "Datacenter networks are synchronous, so FLP does not apply to them",
      "Raft gives up safety during partitions so that it can always terminate"
    ],
    "answer": 0,
    "explanation": "Under partial synchrony, consensus keeps safety at all times and gains liveness once the network is stable enough, which is the practical model for datacentres. Randomisation helps avoid repeated split votes but does not by itself defeat FLP, and real networks are not synchronous.",
    "tags": [
      "distributed-systems-foundations",
      "staff",
      "inline"
    ]
  },
  {
    "id": "distributed-systems-foundations-n1",
    "topic": "distributed-systems-foundations",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Serial Call Chain Availability Degradation",
    "scenario": "A user checkout request synchronously calls 5 independent microservices in series. Each service has an individual availability of 99.9% (0.999).",
    "prompt": "Using the small-unavailability approximation (`5 × 0.1%`), what is the combined end-to-end availability percentage of the 5-service serial chain?",
    "question": "Using the small-unavailability approximation (`5 × 0.1%`), what is the combined end-to-end availability percentage of the 5-service serial chain?",
    "unit": "%",
    "answer": 99.5,
    "tolerance": 0.2,
    "hint": "Compute `0.999^5 ≈ 1 - 5 × 0.001 = 0.995` (99.5%).",
    "explanation": "In a synchronous serial dependency chain, availabilities multiply (`0.999^5 = 0.99501`), multiplying the failure rate by 5× (from 0.1% to 0.5% unavailability, or 99.5% uptime).",
    "tags": [
      "distributed-systems-foundations",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "distributed-systems-foundations-t1",
    "topic": "distributed-systems-foundations",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Partial Failure & Ambiguous Network Timeouts",
    "scenario": "An order service sends a `ChargeCard` RPC to a payment gateway and the socket times out after 2,000 ms with no response.",
    "prompt": "What can the caller conclude about whether the card was charged, and how must the retry protocol be designed?",
    "question": "What can the caller conclude about whether the card was charged, and how must the retry protocol be designed?",
    "options": [
      "A timeout proves the request never reached the payment server, so retry immediately with a new transaction ID",
      "A timeout proves the charge succeeded, so mark the order paid without checking",
      "A timeout is fundamentally ambiguous (the packet may have dropped on the request path, during remote execution, or on the ACK path); the caller must retry using the exact same deterministic `idempotency_key`"
    ],
    "correctOption": 2,
    "reasons": [
      "TCP timeouts distinguish network-drop-before-execution from network-drop-after-execution",
      "Assuming success on timeout prevents unpaid orders",
      "Because an asynchronous network cannot distinguish a slow/crashed server from a lost reply packet, safe retries require server-side deduplication keyed by a stable client idempotency token"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Can a client tell the difference between a packet lost before the server ran vs a response packet lost after the server committed?",
    "explanation": "The defining property of distributed systems is partial failure with indistinguishable timeout states: only an idempotent retry with the same `idempotency_key` safely resolves the ambiguity.",
    "tags": [
      "distributed-systems-foundations",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["consistency-models"] = [
  {
    "id": "consistency-models-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Sequential vs linearizable",
    "section": "Mechanics",
    "prompt": "Client 1's write x = 1 completes at 10:00:00. At 10:00:01, client 2 reads x and gets the old value 0. Which model permits this history, even though linearizability forbids it?",
    "options": [
      "Strict serializability",
      "Linearizability for single-object reads",
      "Sequential consistency, which keeps each client's program order but not real-time order",
      "None of them; every consistency model forbids reading a value older than a completed write"
    ],
    "answer": 2,
    "explanation": "Sequential consistency only needs one global order consistent with each client's program order, so it can place client 2's read before the write despite real time. Linearizability and strict serializability both respect real-time precedence for completed operations, so they forbid it.",
    "tags": [
      "consistency-models",
      "recall",
      "inline"
    ]
  },
  {
    "id": "consistency-models-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Replies before comments",
    "section": "Failure mode",
    "prompt": "On an eventually consistent comment system, some users see Bob's reply 'Agreed!' before Alice's comment it replies to, because replicas apply updates in different orders. Which guarantee fixes exactly this, without full strong consistency?",
    "options": [
      "Causal consistency, so anyone who sees the reply has already seen the comment it depends on",
      "Read-your-writes, so every user sees their own comments immediately",
      "Monotonic reads, so a single user never sees an older state after a newer one",
      "Eventual consistency with a shorter replication lag"
    ],
    "answer": 0,
    "explanation": "The reply causally depends on the comment, and causal consistency orders causally related operations while leaving unrelated ones free. Read-your-writes only covers a user's own writes, so readers other than Bob could still see the reply first.",
    "tags": [
      "consistency-models",
      "staff",
      "inline"
    ]
  },
  {
    "id": "consistency-models-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Photo vs username",
    "section": "Worked example: the profile-photo bug",
    "prompt": "You are choosing guarantees for (a) showing users their newly uploaded profile photo and (b) checking whether a username is already taken at signup. Which pairing matches the lesson?",
    "options": [
      "Linearizable for both, since both are user-visible",
      "Eventual for both, since replication lag is under a second",
      "Linearizable for the photo, read-your-writes for the username check",
      "Read-your-writes for the photo; linearizable, or a uniqueness constraint enforced in one place, for the username"
    ],
    "answer": 3,
    "explanation": "The photo only needs to look right to its author, so a session guarantee avoids an 80 ms cross-region round trip on every read. A username check must see every user's completed writes, so a session guarantee is not enough there.",
    "tags": [
      "consistency-models",
      "apply",
      "inline"
    ]
  },
  {
    "id": "consistency-models-n1",
    "topic": "consistency-models",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Replication Lag Stale Read Window",
    "scenario": "After a user updates their profile on the primary DB, they immediately refresh their profile page 120 ms later, which is routed to an async read replica whose replication lag averages 300 ms (uniformly distributed between 0 and 600 ms).",
    "prompt": "What is the probability (in %) that the user's 120 ms refresh arrives before their write replicates (assuming uniform lag 0–600 ms)?",
    "question": "What is the probability (in %) that the user's 120 ms refresh arrives before their write replicates (assuming uniform lag 0–600 ms)?",
    "unit": "%",
    "answer": 80,
    "tolerance": 0.2,
    "hint": "The read is stale if replication lag `L > 120 ms`. On `[0, 600]`, `(600 - 120) / 600 = 480 / 600`.",
    "explanation": "When replication lag is uniformly distributed between 0 and 600 ms, a read at 120 ms sees stale state whenever lag exceeds 120 ms: `(600 - 120) / 600 = 80%` of the time—violating Read-Your-Writes.",
    "tags": [
      "consistency-models",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "consistency-models-t1",
    "topic": "consistency-models",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Full Linearizability vs Read-Your-Writes Session Monotonicity",
    "scenario": "Users complain that after posting a comment, refreshing the page sometimes hides their own comment for 1 second because reads hit async replicas. However, routing 100% of all users' reads to the primary DB would overload it.",
    "prompt": "Which consistency model and routing technique solves the user-visible bug at minimal cost, and why?",
    "question": "Which consistency model and routing technique solves the user-visible bug at minimal cost, and why?",
    "options": [
      "Enforce global multi-region Paxos linearizability on every anonymous read",
      "Disable all read replicas and scale down read traffic",
      "Provide Read-Your-Writes + Monotonic Reads per session by tracking the client's highest committed WAL LSN (or a short primary-pinning cookie) and routing only reads with `replica_lsn < client_lsn` to the primary"
    ],
    "correctOption": 2,
    "reasons": [
      "Anonymous readers need to see strangers' comments within 1 nanosecond globally",
      "Dropping read replicas increases read capacity",
      "Session-scoped LSN tracking gives the author immediate Read-Your-Writes consistency while allowing 99% of passive reads to stay on cheap async replicas"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Do you need global linearizability for everyone, or just session-level Read-Your-Writes for the user who just wrote?",
    "explanation": "Passing a session LSN watermark (or pinning the writer to the primary for 2 seconds after a write) guarantees Read-Your-Writes and Monotonic Reads without paying the latency/capacity cost of global linearizability.",
    "tags": [
      "consistency-models",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["replication"] = [
  {
    "id": "replication-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What synchronous means",
    "section": "Mechanics",
    "prompt": "A Postgres primary has four standbys, one of which is configured as the synchronous standby. When the primary acknowledges a commit, what is guaranteed?",
    "options": [
      "The synchronous standby has confirmed the write; the other three may still lag",
      "All four standbys have durably written the commit",
      "A majority of the five nodes has written the commit",
      "Nothing beyond the primary's local fsync, because synchronous mode affects only reads"
    ],
    "answer": 0,
    "explanation": "Synchronous modes wait for a defined set of acknowledgements, here one named standby, not every replica. Majority acknowledgement is how consensus systems such as Raft behave, not Postgres synchronous replication.",
    "tags": [
      "replication",
      "recall",
      "inline"
    ]
  },
  {
    "id": "replication-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Failover data loss",
    "section": "Worked example: what failover actually loses",
    "prompt": "A primary takes 8,000 writes/s with asynchronous replicas: A lags by 250 ms and B by 3 seconds. The primary's disk dies and you promote A. Roughly how many acknowledged writes are lost?",
    "options": [
      "None, because the writes had been acknowledged",
      "About 250",
      "About 2,000",
      "About 24,000"
    ],
    "answer": 2,
    "explanation": "8,000 writes/s times 0.25 s of lag is about 2,000 acknowledged writes that A never received; promoting B would lose about 24,000. Acknowledgement to the client means nothing for durability if the only copy was on the failed primary.",
    "tags": [
      "replication",
      "apply",
      "inline"
    ]
  },
  {
    "id": "replication-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Sloppy quorum overlap",
    "section": "Quorum arithmetic and its limits",
    "prompt": "A Dynamo-style store uses N = 3, W = 2, R = 2. During a partial outage, a write to key K succeeds on two nodes outside K's home set via sloppy quorum and hinted handoff. A read at R = 2 from K's home nodes returns the old value. Why?",
    "options": [
      "W + R must exceed 2N for overlap, so the configuration was wrong all along",
      "The write landed outside the home set, so the read quorum no longer intersects the nodes holding it",
      "Read repair deleted the new value because it carried an older timestamp",
      "R = 2 returns only values that all three home replicas agree on"
    ],
    "answer": 1,
    "explanation": "W + R greater than N guarantees overlap only when both quorums come from the same N home nodes, and sloppy quorums break that assumption until hinted handoff delivers the write. The configuration itself is fine; the routing assumption behind the arithmetic failed.",
    "tags": [
      "replication",
      "staff",
      "inline"
    ]
  },
  {
    "id": "replication-n1",
    "topic": "replication",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Sloppy vs Strict Quorum Overlap (R + W > N)",
    "scenario": "A leaderless Dynamo-style data store uses replication factor `N = 5` and write quorum `W = 3`.",
    "prompt": "What is the minimum read quorum `R` required to guarantee strict quorum intersection (`R + W > N`) so every read sees at least one replica with the latest write?",
    "question": "What is the minimum read quorum `R` required to guarantee strict quorum intersection (`R + W > N`) so every read sees at least one replica with the latest write?",
    "unit": "replicas",
    "answer": 3,
    "tolerance": 0.25,
    "hint": "Solve R + 3 > 5 for integer R: R > 2, so minimum integer R = 3.",
    "explanation": "by the Pigeonhole Principle, `R + W > N` guarantees at least one overlapping node between the `W` written replicas and the `R` read replicas. With `N = 5` and `W = 3`, we need `R + 3 > 5`, so `R >= 3`.",
    "tags": [
      "replication",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "replication-t1",
    "topic": "replication",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Multi-Region Synchronous vs Semi-Synchronous Replication",
    "scenario": "A cloud database spans 3 AZs within `us-east-1` (1 ms intra-region RTT) and 1 disaster-recovery region in `us-west-2` (70 ms cross-region RTT). The product requires `RPO = 0` for single-AZ failures and write latency `< 10 ms`.",
    "prompt": "Which replication commit policy should you configure, and why?",
    "question": "Which replication commit policy should you configure, and why?",
    "options": [
      "Require synchronous commit acknowledgment from all 3 local AZs AND `us-west-2` before returning success",
      "Use synchronous quorum / semi-synchronous commit across at least 1 remote AZ within `us-east-1` (~1–2 ms RTT) and asynchronous WAL streaming to `us-west-2`",
      "Use purely local un-replicated memory commits on the primary and batch-copy backups once per night"
    ],
    "correctOption": 1,
    "reasons": [
      "Waiting for a 70 ms cross-country RTT on every write easily meets a <10 ms write latency budget",
      "Synchronous intra-region cross-AZ replication satisfies RPO = 0 for AZ loss within ~2 ms, while async cross-region streaming avoids the 70 ms speed-of-light tax on every commit",
      "Nightly backups guarantee RPO = 0 when the primary AZ loses power at midday"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Speed of light across the US takes ~65-70 ms RTT—incompatible with a <10 ms write budget.",
    "explanation": "Synchronous acknowledgment from a peer AZ in the same region adds only ~1–2 ms, meeting the <10 ms write SLO while guaranteeing zero data loss (`RPO = 0`) if an entire AZ fails.",
    "tags": [
      "replication",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["cap-and-pacelc"] = [
  {
    "id": "cap-and-pacelc-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "CAP availability",
    "section": "Mechanics",
    "prompt": "In the CAP theorem, what does it mean for a system to be 'available'?",
    "options": [
      "The service meets a 99.99 percent uptime target",
      "At least a majority of nodes can still serve requests",
      "Clients can reach some node, even if that node returns an error",
      "Every non-failing node returns a non-error response to each request it receives"
    ],
    "answer": 3,
    "explanation": "CAP availability is the strong requirement that every non-failing node answers without error, even while it is partitioned. The majority-side service a CP system keeps up during a partition is not CAP-available, which is why 'available' in CAP differs from everyday uptime.",
    "tags": [
      "cap-and-pacelc",
      "recall",
      "inline"
    ]
  },
  {
    "id": "cap-and-pacelc-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Cart vs last unit",
    "section": "Worked example: one product, two choices",
    "prompt": "Two regions lose their link for 3 minutes. Which behaviour matches the lesson for (a) add-to-cart and (b) decrementing the last unit of a limited-edition item?",
    "options": [
      "Both choose consistency and reject writes in both regions until the link returns",
      "Cart stays available and merges later; the last-unit decrement is allowed only in the region that owns the item's primary",
      "Cart chooses consistency; inventory stays available and oversells are reconciled later",
      "Both stay available and resolve conflicts with last-write-wins"
    ],
    "answer": 1,
    "explanation": "The choice is made per operation: carts can merge as a union afterwards, while overselling a limited item is worse than a few minutes of 'try again'. Last-write-wins on inventory would silently lose decrements and allow overselling.",
    "tags": [
      "cap-and-pacelc",
      "apply",
      "inline"
    ]
  },
  {
    "id": "cap-and-pacelc-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Majority side keeps going",
    "section": "Common interview traps",
    "prompt": "A 5-node etcd cluster splits into a 3-node side and a 2-node side, with clients on both. What happens?",
    "options": [
      "The whole cluster stops accepting writes, because etcd is CP",
      "Both sides accept writes and reconcile when the partition heals",
      "The 3-node majority side keeps serving writes (electing a leader if needed), while the 2-node side rejects them",
      "Whichever side holds the old leader keeps serving, regardless of its size"
    ],
    "answer": 2,
    "explanation": "A CP system stays available on the majority side; only the minority rejects requests. An old leader stranded on the 2-node side cannot reach a majority, so it cannot commit, and the 3-node side elects a new leader.",
    "tags": [
      "cap-and-pacelc",
      "staff",
      "inline"
    ]
  },
  {
    "id": "cap-and-pacelc-n1",
    "topic": "cap-and-pacelc",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Cross-Region Quorum Latency Tax (PACELC E/L)",
    "scenario": "A geo-distributed database places 3 replicas in US-East, US-West (70 ms RTT from US-East), and EU-West (85 ms RTT from US-East). A leaderless quorum write initiated in US-East requires `W = 2` acknowledgments.",
    "prompt": "What is the minimum network round-trip latency (in ms) for a write coordinated from US-East to collect 2 replica ACKs (local + fastest remote)?",
    "question": "What is the minimum network round-trip latency (in ms) for a write coordinated from US-East to collect 2 replica ACKs (local + fastest remote)?",
    "unit": "ms",
    "answer": 70,
    "tolerance": 0.2,
    "hint": "Replica 1 is local (~0-1 ms); Replica 2 is the closer of US-West (70 ms) and EU-West (85 ms).",
    "explanation": "To reach a majority (`W = 2` of 3), the coordinator in US-East acknowledges locally (~0 ms) and must wait for the fastest remote region (US-West at 70 ms RTT)—the \"EL\" (Else Latency vs Consistency) side of PACELC.",
    "tags": [
      "cap-and-pacelc",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "cap-and-pacelc-t1",
    "topic": "cap-and-pacelc",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: PACELC Classification for Normal Operation vs Partition",
    "scenario": "During normal operation (no network partition), a system replicates asynchronously to remote regions for 5 ms local write latency, and during a partition it elects a single majority side and blocks writes on the isolated minority.",
    "prompt": "Why is CAP alone insufficient to describe this system, and how does PACELC classify it?",
    "question": "Why is CAP alone insufficient to describe this system, and how does PACELC classify it?",
    "options": [
      "CAP classifies normal-operation latency trade-offs even when no partition exists",
      "The system is PA/EL because it allows split-brain writes during partitions",
      "CAP only describes behavior during a partition (`P`); PACELC captures that this system is PC/EL (chooses Consistency during a Partition, but chooses Lower Latency over strict synchronous Consistency during normal Else operation)"
    ],
    "correctOption": 2,
    "reasons": [
      "Network partitions are active 100% of the time in every datacenter",
      "Blocking minority writes during a partition is an AP choice",
      "Most real latency/freshness bugs happen during the 99.99% of time when the network is healthy (`E`: Else), where async replication trades consistency for low latency"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What does the `E` (`Else`: when there is no partition) in PACELC stand for?",
    "explanation": "Abadi's PACELC theorem notes that even when no partition exists (`Else`), distributed databases must choose between Latency (`L`, async replication) and Consistency (`C`, synchronous quorum/replication).",
    "tags": [
      "cap-and-pacelc",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["clocks-and-ordering"] = [
  {
    "id": "clocks-and-ordering-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Measuring timeouts",
    "section": "Mechanics",
    "prompt": "A service measures request latency by subtracting two wall-clock readings. Occasionally it reports negative latency or fires a timeout instantly. What should it use instead?",
    "options": [
      "NTP-synchronised wall time with a larger timeout",
      "A monotonic clock, which measures elapsed time on one host and is never stepped",
      "Lamport timestamps, which always increase",
      "A hybrid logical clock, which combines wall time with a counter"
    ],
    "answer": 1,
    "explanation": "Wall clocks can be stepped by synchronisation, which distorts durations; monotonic clocks exist for local elapsed time. Lamport clocks count events, not seconds, so they cannot measure a timeout.",
    "tags": [
      "clocks-and-ordering",
      "recall",
      "inline"
    ]
  },
  {
    "id": "clocks-and-ordering-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Lamport after a receive",
    "section": "Worked example: Lamport versus vector clocks",
    "prompt": "Node B's Lamport counter is 4. It receives a message carrying timestamp 9, then performs one local write. What timestamp does that local write get?",
    "options": [
      "11",
      "10",
      "5",
      "14"
    ],
    "answer": 0,
    "explanation": "On receive B sets its counter to max(4, 9) + 1 = 10, and the next local event increments it to 11. 10 is the timestamp of the receive event itself, not the write that follows.",
    "tags": [
      "clocks-and-ordering",
      "apply",
      "inline"
    ]
  },
  {
    "id": "clocks-and-ordering-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "HLC uncertainty restart",
    "section": "How real systems order events",
    "prompt": "A CockroachDB read at timestamp t finds a value written at t + 200 ms, and the cluster's maximum clock offset is 500 ms. What does the read do, and why?",
    "options": [
      "Ignores the value, because it is in the future relative to the read",
      "Returns the value, because HLC guarantees it was written first",
      "Waits 500 ms, as Spanner does, and then returns the value",
      "Restarts at a higher timestamp, because within the uncertainty window it cannot tell whether that write happened before the read in real time"
    ],
    "answer": 3,
    "explanation": "With clocks that may differ by up to the max offset, a value slightly 'in the future' may really have been committed before the read began, so CockroachDB restarts the read above it. Ignoring it risks a stale read; commit-wait belongs to Spanner's TrueTime design, not HLC reads.",
    "tags": [
      "clocks-and-ordering",
      "staff",
      "inline"
    ]
  },
  {
    "id": "clocks-and-ordering-n1",
    "topic": "clocks-and-ordering",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: TrueTime Commit-Wait Uncertainty Window",
    "scenario": "In a Spanner-like system using GPS + atomic clocks, the local clock uncertainty bound is `ε = 3 ms` (meaning true time lies in `[t - 3 ms, t + 3 ms]`). To guarantee that external timestamp intervals of causally ordered transactions never overlap, the coordinator waits `2ε` before releasing locks.",
    "prompt": "How many milliseconds must the commit-wait step pause when `ε = 3 ms`?",
    "question": "How many milliseconds must the commit-wait step pause when `ε = 3 ms`?",
    "unit": "ms",
    "answer": 6,
    "tolerance": 0.2,
    "hint": "Commit wait duration is `2 × ε`.",
    "explanation": "Waiting `2ε = 2 × 3 ms = 6 ms` guarantees that any subsequent transaction starting after commit sees a timestamp strictly greater than the committed transaction's timestamp, achieving external consistency without cross-node clock negotiation.",
    "tags": [
      "clocks-and-ordering",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "clocks-and-ordering-t1",
    "topic": "clocks-and-ordering",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Wall-Clock LWW (Last-Write-Wins) vs Hybrid Logical Clocks / Vector Clocks",
    "scenario": "A multi-master key-value store resolves concurrent writes using `wall_clock_timestamp` Last-Write-Wins (LWW). Node A's NTP clock is skewed +80 ms ahead of Node B. Node A writes `v1`, and 10 ms later a user reads `v1` and writes an updated `v2` via Node B.",
    "prompt": "What happens to update `v2` under wall-clock LWW, and which clock mechanism fixes causal ordering?",
    "question": "What happens to update `v2` under wall-clock LWW, and which clock mechanism fixes causal ordering?",
    "options": [
      "Update `v2` wins because it happened 10 ms later in real physical time",
      "NTP guarantees zero microsecond skew across all cloud VMs",
      "Update `v2` is silently dropped because Node B's physical timestamp is still 70 ms behind Node A's timestamp; using a Hybrid Logical Clock (HLC) or Dotted Version Vectors preserves the causal `v1 -> v2` ordering"
    ],
    "correctOption": 2,
    "reasons": [
      "Servers automatically know real physical time without clocks",
      "Wall-clock LWW never drops causally newer writes",
      "An HLC advances its logical component whenever a node observes a message with a higher timestamp (`max(physical, msg.ts) + 1`), ensuring causally subsequent writes always receive a strictly higher timestamp"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Compare Node A's timestamp (`T + 80 ms`) with Node B's timestamp 10 ms later (`T + 10 ms`).",
    "explanation": "Under physical wall-clock LWW, a node with a fast clock produces \"future\" timestamps that silently overwrite subsequent causal updates from nodes with accurate clocks. HLCs or version vectors track causality across messages.",
    "tags": [
      "clocks-and-ordering",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["consensus"] = [
  {
    "id": "consensus-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Randomised timeouts' role",
    "section": "Mechanics",
    "prompt": "What do Raft's randomised election timeouts actually achieve?",
    "options": [
      "They guarantee termination even in a fully asynchronous network, defeating FLP",
      "They are what prevents two leaders from committing conflicting entries",
      "They make repeated split votes unlikely, which helps liveness, while safety comes from terms and quorum intersection",
      "They ensure the node with the longest log always wins the election"
    ],
    "answer": 2,
    "explanation": "Randomisation spreads out candidates so elections usually settle quickly, but the lesson notes it does not by itself defeat FLP. Safety, meaning no conflicting commits, comes from terms, durable logs and overlapping majorities, not from timing.",
    "tags": [
      "consensus",
      "recall",
      "inline"
    ]
  },
  {
    "id": "consensus-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Adding a fourth node",
    "section": "Worked example: quorum sizing and latency",
    "prompt": "Your 3-node etcd cluster tolerates one failure. A manager proposes adding a fourth node for extra resilience. What is the effect?",
    "options": [
      "It now tolerates two failures, because a majority of four is two",
      "It tolerates two failures, but only if the new node is in a different zone",
      "No change to fault tolerance or to write latency",
      "The majority becomes 3, so it still tolerates only one failure and each commit waits for an extra acknowledgement"
    ],
    "answer": 3,
    "explanation": "A majority of 4 is 3, so losing 2 nodes stops commits, just like losing 2 of 3; you pay more acknowledgements for no extra tolerance. Two out of four is a tie, not a majority, which is why even cluster sizes are avoided.",
    "tags": [
      "consensus",
      "apply",
      "inline"
    ]
  },
  {
    "id": "consensus-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Unsafe membership change",
    "section": "Failure modes seen in production",
    "prompt": "An operator grows a 3-node Raft cluster to 5 by editing the peer list in each node's config file and restarting the nodes one at a time. What is the danger?",
    "options": [
      "Mid-rollout, nodes on the old and new configurations can each form their own majority, allowing two leaders to commit conflicting entries",
      "The restarts will lose committed entries, because Raft logs are not durable",
      "The cluster will refuse all writes until all five nodes have restarted",
      "Term numbers reset to zero on restart, which confuses the next election"
    ],
    "answer": 0,
    "explanation": "Changing membership outside the protocol can create two disjoint majorities, one under each configuration, which breaks the quorum intersection that safety relies on. Raft avoids this with joint consensus or one-server-at-a-time changes; its logs and terms are durable, so the other options do not apply.",
    "tags": [
      "consensus",
      "staff",
      "inline"
    ]
  },
  {
    "id": "consensus-n1",
    "topic": "consensus",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Raft Quorum Size and Fault Tolerance",
    "scenario": "You deploy a 5-node Raft consensus cluster across 5 availability zones to store cluster metadata.",
    "prompt": "How many simultaneous node failures can a 5-node Raft cluster tolerate while still maintaining a majority quorum to commit writes?",
    "question": "How many simultaneous node failures can a 5-node Raft cluster tolerate while still maintaining a majority quorum to commit writes?",
    "unit": "nodes",
    "answer": 2,
    "tolerance": 0.25,
    "hint": "For N = 2f + 1 = 5 nodes, majority quorum is floor(5/2) + 1 = 3 nodes, so f = 2 failures are tolerated.",
    "explanation": "A 5-node Raft cluster requires a majority quorum of 3 nodes (`floor(5/2) + 1 = 3`) to elect a leader and commit log entries. Thus it can lose at most 5 - 3 = 2 nodes while remaining available for writes.",
    "tags": [
      "consensus",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "consensus-t1",
    "topic": "consensus",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: 3-Node vs 5-Node vs 6-Node Consensus Cluster Topologies",
    "scenario": "A team proposes upgrading a 5-node etcd/Raft cluster to 6 nodes across 3 Availability Zones (2 nodes per AZ) to 'increase fault tolerance and survive an entire AZ outage'.",
    "prompt": "What should you advise in the architecture review, and what is the primary engineering justification?",
    "question": "What should you advise in the architecture review, and what is the primary engineering justification?",
    "options": [
      "Approve the 6-node cluster across 3 AZs because 6 nodes tolerate more failures than 5 nodes",
      "Reject the 6-node cluster and use a 3-node or 5-node odd-sized topology (or 5 nodes across 3 AZs with 2-2-1 placement), because a 6-node cluster requires a quorum of 4 and still only tolerates 2 node failures",
      "Use a 2-node cluster across 2 AZs so either node can commit writes independently"
    ],
    "correctOption": 1,
    "reasons": [
      "Even-numbered Raft clusters increase fault tolerance while reducing replication overhead",
      "Moving from 5 to 6 nodes raises the majority requirement from 3 to 4 (still tolerating only 6 - 4 = 2 failures) while adding replication traffic and making split-brain 3v3 partitions more likely",
      "A 2-node Raft cluster can lose 1 node and still form a majority quorum of 2"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Compare `N - (floor(N/2) + 1)` for N = 5 vs N = 6.",
    "explanation": "For N = 5, quorum is 3 (tolerates 2 failures). For N = 6, quorum is 4 (tolerates 6 - 4 = 2 failures). A 6-node cluster adds extra network replication overhead and worsens availability (since 4 nodes must stay up instead of 3) without tolerating a single additional failure.",
    "tags": [
      "consensus",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["leader-election"] = [
  {
    "id": "leader-election-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Up-to-date log rule",
    "section": "Mechanics",
    "prompt": "Why does a Raft follower refuse to vote for a candidate whose log is less up to date than its own?",
    "options": [
      "So that any elected leader already holds every committed entry, since committed entries live on a majority",
      "To speed up elections by reducing the number of candidates",
      "To stop two candidates being elected in different terms",
      "Because followers must replicate the candidate's log before voting"
    ],
    "answer": 0,
    "explanation": "A committed entry is on a majority, and any winning candidate needs votes from a majority, so the two sets overlap and the restriction ensures the winner has that entry. Preventing two leaders in the same term comes from one vote per term, not from the log check.",
    "tags": [
      "leader-election",
      "recall",
      "inline"
    ]
  },
  {
    "id": "leader-election-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "The waking old leader",
    "section": "Worked example: a Raft election timeline",
    "prompt": "In a 5-node Raft cluster, leader L of term 4 pauses for 3 seconds while B wins term 5. L wakes up, still believes it leads, and accepts a client write. What happens to that write?",
    "options": [
      "It commits, because L still has the most recent log",
      "It never commits: followers reply with term 5, L steps down, and the write cannot reach a majority in term 4",
      "It commits on L and is merged into B's log at the next heartbeat",
      "Both L and B commit it, producing a duplicate entry"
    ],
    "answer": 1,
    "explanation": "Followers reject AppendEntries from a stale term, so L learns about term 5 and steps down without ever gathering a majority. Safety comes from followers rejecting the old term, not from L realising on its own that it was deposed.",
    "tags": [
      "leader-election",
      "apply",
      "inline"
    ]
  },
  {
    "id": "leader-election-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Disruptive rejoin",
    "section": "Failure modes",
    "prompt": "A node is partitioned for 10 minutes and keeps timing out and starting elections. When it rejoins, the healthy leader is forced to step down. Which mechanism prevents this?",
    "options": [
      "Shorter election timeouts on the healthy nodes",
      "Fencing tokens on the leader's external writes",
      "Raft's PreVote, in which a node checks it could win before incrementing its term",
      "Clock-based leader leases for local reads"
    ],
    "answer": 2,
    "explanation": "While isolated, the node inflated its term, and on rejoining that higher term deposes the healthy leader; PreVote stops it incrementing the term unless a majority would support it. Fencing tokens protect external resources from stale leaders but do nothing about term inflation.",
    "tags": [
      "leader-election",
      "staff",
      "inline"
    ]
  },
  {
    "id": "leader-election-n1",
    "topic": "leader-election",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Split-Vote Prevention & Failover MTTR",
    "scenario": "A 5-node Raft cluster configures a heartbeat interval of 150 ms and a randomized election timeout window of `[1,000 ms, 1,500 ms]`. After the leader crashes, the first follower's timer expires at 1,100 ms and a single round of `RequestVote` RPCs takes 20 ms.",
    "prompt": "How many milliseconds after the leader crash is the new leader elected and ready to serve?",
    "question": "How many milliseconds after the leader crash is the new leader elected and ready to serve?",
    "unit": "ms",
    "answer": 1120,
    "tolerance": 0.2,
    "hint": "Add the 1,100 ms election timeout expiration and the 20 ms `RequestVote` quorum round-trip.",
    "explanation": "Detection takes 1,100 ms (when the earliest randomized follower timer fires) plus 20 ms for a majority `RequestVote` RTT = 1,120 ms total failover time.",
    "tags": [
      "leader-election",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "leader-election-t1",
    "topic": "leader-election",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Ultra-Short Election Timeouts vs Flap Resilience",
    "scenario": "An engineer lowers the Raft election timeout from 1,000 ms down to 15 ms (when cross-AZ p99 network latency + GC pauses regularly hit 25 ms) to get \"instant failover\".",
    "prompt": "What failure mode does a 15 ms election timeout trigger, and how should timeouts be tuned?",
    "question": "What failure mode does a 15 ms election timeout trigger, and how should timeouts be tuned?",
    "options": [
      "The cluster achieves zero-downtime failover with higher write throughput",
      "Followers stop voting altogether and the first leader stays permanent",
      "The cluster enters continuous split-vote livelock and term churn (followers trigger elections on every minor GC pause or network jitter, stepping down the healthy leader and dropping write availability)"
    ],
    "correctOption": 2,
    "reasons": [
      "Election timeouts smaller than network RTT prevent unnecessary elections",
      "Raft ignores `RequestVote` messages with higher terms",
      "Raft requires `broadcastTime << electionTimeout << MTBF` (typically election timeout >= 5–10× heartbeat RTT plus randomized jitter) so transient network/GC blips do not dethrone a healthy leader"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens in Raft whenever a follower receives a `RequestVote` with a higher term `T + 1`?",
    "explanation": "In Raft, any higher-term `RequestVote` forces the current leader to step down. If the election timeout is near the network/GC tail latency, followers constantly start spurious elections and stall writes.",
    "tags": [
      "leader-election",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["distributed-locks-and-leases"] = [
  {
    "id": "distributed-locks-and-leases-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why check at the resource",
    "section": "Mechanics",
    "prompt": "Why can a lock holder not simply check its lease locally before each write to guarantee mutual exclusion?",
    "options": [
      "Local checks are too slow for high-throughput workloads",
      "Lease TTLs are stored only on the coordinator, so the client cannot read them",
      "The coordinator always extends leases automatically, so local checks are redundant",
      "The process can pause between the check and the write, so the resource itself must reject stale holders"
    ],
    "answer": 3,
    "explanation": "A GC pause or VM stall between 'am I still the holder?' and the write is invisible to the process, so only the target, checking a fencing token or version, can enforce exclusion. The client does know its TTL; the issue is that it cannot observe its own pauses.",
    "tags": [
      "distributed-locks-and-leases",
      "recall",
      "inline"
    ]
  },
  {
    "id": "distributed-locks-and-leases-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "When to stop working",
    "section": "Lease maths",
    "prompt": "A holder sends an acquire request at t = 0 and receives the reply at t = 0.4 s. The lease TTL is 15 s, the clock drift allowance is 1 percent, and the safety margin is 1.5 s. Following the lesson, when should it stop working, on its monotonic clock?",
    "options": [
      "At t = 15 s, when the lease expires",
      "At about t = 13.75 s, measured from when the reply arrived",
      "At about t = 13.35 s, measured from when the request was sent",
      "At about t = 14.85 s, allowing only for drift"
    ],
    "answer": 2,
    "explanation": "15 x (1 - 0.01) - 1.5 = 13.35 s, counted from when the request was sent, because the coordinator may have started the lease at any point after that. Counting from the reply wrongly adds the 0.4 s round trip to the holder's safe window.",
    "tags": [
      "distributed-locks-and-leases",
      "apply",
      "inline"
    ]
  },
  {
    "id": "distributed-locks-and-leases-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Skip the lock",
    "section": "Ways to get mutual exclusion",
    "prompt": "A team uses Redis SET NX PX so that only one worker at a time updates an account balance in Postgres. Which change gives correctness most simply?",
    "options": [
      "Switch to Redlock across five Redis masters",
      "Drop the lock and use a conditional UPDATE on a version column in Postgres",
      "Raise the lock TTL to 5 minutes so it never expires mid-update",
      "Renew the lock every second with a watchdog thread"
    ],
    "answer": 1,
    "explanation": "A compare-and-set on a version column is enforced by the resource itself, which makes it safe against pauses and often removes the need for a lock. Redlock, longer TTLs and watchdogs all leave the database accepting writes from a paused, expired holder.",
    "tags": [
      "distributed-locks-and-leases",
      "staff",
      "inline"
    ]
  },
  {
    "id": "distributed-locks-and-leases-n1",
    "topic": "distributed-locks-and-leases",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Lease Expiry Under Stop-The-World GC Pause",
    "scenario": "Worker 1 acquires a distributed lock with a 10-second lease TTL (`10,000 ms`). After 6,000 ms of processing, Worker 1 hits a 7,000 ms JVM stop-the-world GC pause before writing to storage.",
    "prompt": "By how many milliseconds has Worker 1's lock lease already expired when Worker 1 wakes up and attempts its zombie write at `t = 13,000 ms`?",
    "question": "By how many milliseconds has Worker 1's lock lease already expired when Worker 1 wakes up and attempts its zombie write at `t = 13,000 ms`?",
    "unit": "ms",
    "answer": 3000,
    "tolerance": 0.2,
    "hint": "Worker 1 wakes up at `6,000 + 7,000 = 13,000 ms`, while the lease expired at `10,000 ms`.",
    "explanation": "The lease expired at 10,000 ms, so when Worker 1 resumes at 13,000 ms, its lease has been expired for 13,000 - 10,000 = 3,000 ms (3 seconds), during which Worker 2 has already acquired the lock.",
    "tags": [
      "distributed-locks-and-leases",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "distributed-locks-and-leases-t1",
    "topic": "distributed-locks-and-leases",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: TTL Leases Alone vs Monotonic Fencing Tokens",
    "scenario": "A worker holding a Redis/ZooKeeper lease pauses in GC until after its TTL expires; a second worker acquires the lease, and then the first worker wakes up and overwrites the file in storage.",
    "prompt": "Why can no client-side lock check prevent this race, and what mechanism guarantees mutual exclusion at the storage resource?",
    "question": "Why can no client-side lock check prevent this race, and what mechanism guarantees mutual exclusion at the storage resource?",
    "options": [
      "Have the worker check `if (lock.isHeld())` right before sending the write RPC",
      "Use Redlock across 5 independent Redis nodes without changing the storage server",
      "Issue a monotonically increasing `fencing_token` (epoch/zxid) with every lock grant and require the storage server to reject any write carrying `token < max_seen_token`"
    ],
    "correctOption": 2,
    "reasons": [
      "A GC pause can never happen between `if (lock.isHeld())` and the socket write",
      "Redlock stops the client JVM from experiencing GC pauses",
      "Because the network or JVM can pause arbitrarily after any client-side check, the storage resource itself must validate the monotonic fencing token to fenced off zombie writers"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Remember Martin Kleppmann's analysis of distributed locks and fencing tokens.",
    "explanation": "Time-based leases alone cannot guarantee safety under asynchronous process/network pauses. Only a monotonically increasing fencing token validated by the target storage system blocks delayed zombie writes.",
    "tags": [
      "distributed-locks-and-leases",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["redis-redlock-and-fencing-tokens"] = [
  {
    "id": "redis-redlock-and-fencing-tokens-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Compare-and-delete release",
    "section": "The single-instance Redis lock, done right",
    "prompt": "Why does the lesson release a Redis lock with a Lua script that compares the stored value to your token before calling DEL, instead of a plain DEL?",
    "options": [
      "Plain DEL is not atomic in Redis Cluster",
      "If your lease expired and another client acquired the lock, a plain DEL would delete their lock",
      "The Lua script also extends the TTL for the next holder",
      "Plain DEL does not remove keys that were set with a PX expiry"
    ],
    "answer": 1,
    "explanation": "The unique value proves ownership, so the atomic compare-and-delete removes the lock only if it is still yours. DEL is atomic and does remove expiring keys; the danger is deleting a lock that now belongs to someone else.",
    "tags": [
      "redis-redlock-and-fencing-tokens",
      "recall",
      "inline"
    ]
  },
  {
    "id": "redis-redlock-and-fencing-tokens-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Redlock validity",
    "section": "Worked example: Redlock timing",
    "prompt": "Using Redlock with a 30,000 ms TTL, a client gets OK from 3 of 5 masters after 400 ms. The drift allowance is 1 percent of the TTL plus 2 ms. What is the lock's validity time?",
    "options": [
      "29,298 ms",
      "29,600 ms",
      "30,000 ms",
      "29,700 ms"
    ],
    "answer": 0,
    "explanation": "Validity = 30,000 - 400 - (300 + 2) = 29,298 ms, and the lock counts only because a majority answered. 29,600 ms forgets the drift allowance, which covers clocks on the Redis nodes running at different rates.",
    "tags": [
      "redis-redlock-and-fencing-tokens",
      "apply",
      "inline"
    ]
  },
  {
    "id": "redis-redlock-and-fencing-tokens-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Redlock as a fence",
    "section": "Choosing a lock",
    "prompt": "To protect balance updates, a team plans to pass Redlock's random lock value to the database as a fencing token and reject writes carrying an 'older' token. Why will this not work?",
    "options": [
      "The database cannot store values longer than 64 bits",
      "Redlock values expire with the lease, so the database never sees them",
      "Redis refuses to return the lock value to the client",
      "The random values are not monotonic, so the database cannot tell which holder is newer; use an etcd revision, ZooKeeper zxid or a DB version"
    ],
    "answer": 3,
    "explanation": "Fencing needs tokens that only increase, so the resource can reject anything lower than the highest it has seen; random values carry no order. The lesson's table lists 'No' for fencing tokens under Redlock for exactly this reason.",
    "tags": [
      "redis-redlock-and-fencing-tokens",
      "staff",
      "inline"
    ]
  },
  {
    "id": "redis-redlock-and-fencing-tokens-n1",
    "topic": "redis-redlock-and-fencing-tokens",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Lock Lease Expiry vs Stop-the-World GC Pause",
    "scenario": "Worker 1 acquires a distributed lock with a `10,000 ms` (10 s) TTL at `t = 0 ms`. At `t = 8,000 ms`, Worker 1 enters a 6,000 ms stop-the-world JVM GC pause before writing to storage.",
    "prompt": "By how many milliseconds has Worker 1's lock lease already expired when Worker 1 wakes up at `t = 14,000 ms` and attempts its storage write?",
    "question": "By how many milliseconds has Worker 1's lock lease already expired when Worker 1 wakes up at `t = 14,000 ms` and attempts its storage write?",
    "unit": "ms",
    "answer": 4000,
    "tolerance": 0.25,
    "hint": "Wake-up time (8,000 + 6,000 = 14,000 ms) minus lock expiration time (10,000 ms).",
    "explanation": "The lock expired at `t = 10,000 ms`, while Worker 1 resumed execution at `t = 8,000 + 6,000 = 14,000 ms`—meaning its lease has been expired for 4,000 ms (4 seconds), during which Worker 2 may have acquired the lock and mutated the storage resource.",
    "tags": [
      "redis-redlock-and-fencing-tokens",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "redis-redlock-and-fencing-tokens-t1",
    "topic": "redis-redlock-and-fencing-tokens",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Time-Based Lock Leases vs Monotonic Fencing Tokens",
    "scenario": "Two inventory workers coordinate via a distributed lock before updating an object store or relational row. Occasionally, a worker experiences a multi-second GC pause or network delay that outlasts the lock TTL.",
    "prompt": "How do you guarantee mutual exclusion at the storage resource even when a lock holder pauses past its lease TTL?",
    "question": "How do you guarantee mutual exclusion at the storage resource even when a lock holder pauses past its lease TTL?",
    "options": [
      "Have the worker check `if (System.currentTimeMillis() < leaseExpiry)` right before sending the network write",
      "Issue a strictly increasing fencing token (epoch number) with each lock acquisition and require the storage layer to reject any write with `token < max_seen_token`",
      "Set the Redis lock TTL to 10 minutes instead of 10 seconds"
    ],
    "correctOption": 1,
    "reasons": [
      "Checking local wall clock before sending a packet prevents pauses inside the OS kernel or network switch after the `if` statement",
      "Storage-enforced monotonic fencing tokens turn safety into a state comparison at the target resource rather than an assumption about bounded process/network timing",
      "A 10-minute TTL guarantees GC pauses or network delays never corrupt state while enabling sub-second failover"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Kleppmann's critique of Redlock: why can't a client-side clock check prevent a delayed network packet or post-check pause?",
    "explanation": "A client can pause *after* checking its local clock or have its TCP packet delayed in flight. Only when the storage system itself validates a monotonically increasing fencing token (`epoch`) is an expired lock holder guaranteed to have its zombie write rejected.",
    "tags": [
      "redis-redlock-and-fencing-tokens",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["circuit-breakers-and-timeouts"] = [
  {
    "id": "circuit-breakers-and-timeouts-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "After the sleep window",
    "section": "Circuit Breaker State Machine Under the Hood",
    "prompt": "A circuit breaker has been OPEN for its full 15-second sleep window. What happens next?",
    "options": [
      "It closes and sends all traffic to the downstream service again",
      "It stays open until an operator resets it manually",
      "It moves to HALF-OPEN and lets a few trial requests through, then closes or reopens based on their results",
      "It ramps traffic up gradually from 10 to 100 percent over the next window"
    ],
    "answer": 2,
    "explanation": "Half-open lets a small number of probe requests through; if they succeed the breaker closes, and if they fail it reopens for another sleep window. Closing straight away would hit a still-recovering dependency with full load.",
    "tags": [
      "circuit-breakers-and-timeouts",
      "recall",
      "inline"
    ]
  },
  {
    "id": "circuit-breakers-and-timeouts-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Little's law and threads",
    "section": "Worked example: why slow is worse than dead",
    "prompt": "An API instance has 250 worker threads and serves 800 rps, and every request calls a dependency that has slowed to 3-second responses. What happens without a tight timeout, and how many threads does a 200 ms timeout tie up at most?",
    "options": [
      "About 800 requests in flight, so the pool survives and a 200 ms timeout adds little",
      "Exactly 250 requests in flight, so the timeout changes nothing",
      "About 2,400 requests in flight; a 200 ms timeout still ties up about 800 threads",
      "About 2,400 requests in flight, exhausting the pool in about 0.3 s; a 200 ms timeout caps it at about 160 threads"
    ],
    "answer": 3,
    "explanation": "In-flight requests equal arrival rate times duration: 800 x 3 s = 2,400, far more than 250 threads, while 800 x 0.2 s = 160 fits. This is why a slow dependency is worse than a dead one, which frees threads almost instantly.",
    "tags": [
      "circuit-breakers-and-timeouts",
      "apply",
      "inline"
    ]
  },
  {
    "id": "circuit-breakers-and-timeouts-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Deadline propagation",
    "section": "Choosing timeouts",
    "prompt": "A public endpoint has a 2-second deadline, but the service behind it gives its database calls a 30-second timeout. During a database slowdown, what goes wrong and what fixes it?",
    "options": [
      "Work continues long after the caller gave up, wasting database capacity; propagate the deadline so downstream calls stop when it passes",
      "Nothing, because the caller already received an error at 2 seconds",
      "The HTTP layer retries, which is harmless because the database call eventually finishes",
      "The database timeout should rise to 60 seconds so slow queries can complete"
    ],
    "answer": 0,
    "explanation": "Without deadline propagation, abandoned requests keep holding connections and queries on an already struggling database, and client retries add more on top. The caller's error does not cancel the downstream work, which is the trap in 'nothing goes wrong'.",
    "tags": [
      "circuit-breakers-and-timeouts",
      "staff",
      "inline"
    ]
  },
  {
    "id": "circuit-breakers-and-timeouts-n1",
    "topic": "circuit-breakers-and-timeouts",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Thread Pool Exhaustion Without Tight Timeouts",
    "scenario": "An API gateway has 400 worker threads and calls a downstream recommendation service at 200 req/s. The downstream hangs without responding, and the HTTP client timeout is set to 30 seconds.",
    "prompt": "How many seconds does it take for the hanging downstream to saturate all 400 threads on the API gateway?",
    "question": "How many seconds does it take for the hanging downstream to saturate all 400 threads on the API gateway?",
    "unit": "seconds",
    "answer": 2,
    "tolerance": 0.2,
    "hint": "Divide 400 available threads by 200 blocked requests per second.",
    "explanation": "At 200 req/s, 400 threads are completely occupied in 400 / 200 = 2 seconds (well before the 30-second timeout fires), taking down the entire API gateway for unrelated endpoints.",
    "tags": [
      "circuit-breakers-and-timeouts",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "circuit-breakers-and-timeouts-t1",
    "topic": "circuit-breakers-and-timeouts",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Unbounded Retries vs Circuit Breaker + Bulkhead + Jittered Backoff",
    "scenario": "A non-critical personalization service starts failing 60% of requests due to CPU saturation. Callers are configured to retry up to 3 times immediately on failure.",
    "prompt": "What effect do immediate retries have on the failing service, and what resilience pattern stops the cascade?",
    "question": "What effect do immediate retries have on the failing service, and what resilience pattern stops the cascade?",
    "options": [
      "Immediate retries help the overloaded server recover faster",
      "Increase the retry count from 3 to 10 with zero delay",
      "Immediate retries amplify load by up to 4× during an outage; isolate the dependency in a dedicated bulkhead pool, trip an open Circuit Breaker when error rate exceeds threshold, and return a degraded fallback"
    ],
    "correctOption": 2,
    "reasons": [
      "Sending 4× more traffic to a CPU-saturated server lowers its CPU utilization",
      "10 retries guarantee success when a database is down",
      "Tripping a circuit breaker fails fast in memory (0 ms), shedding load so the downstream can recover while bulkheads protect caller threads and retry budgets cap amplification (<10%)"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Calculate the request volume when 60% of requests fail and each failure triggers 3 immediate retries.",
    "explanation": "Unbounded retries turn a partial slowdown into a retry storm. Combining tight timeouts, per-dependency bulkheads, a retry budget, and a circuit breaker with graceful fallback prevents cascading failure.",
    "tags": [
      "circuit-breakers-and-timeouts",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["gossip-protocol"] = [
  {
    "id": "gossip-protocol-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Phi-accrual detection",
    "section": "Under the Hood: Gossip Dissemination Patterns",
    "prompt": "How does a phi-accrual failure detector differ from a fixed heartbeat timeout?",
    "options": [
      "It outputs a continuous suspicion score based on past heartbeat intervals, and each application picks its own threshold",
      "It declares a node dead after a fixed number of missed heartbeats, tuned per datacenter",
      "It requires several peers to vote before a node is declared dead",
      "It measures clock skew between nodes to predict failures in advance"
    ],
    "answer": 0,
    "explanation": "Phi rises as silence becomes less likely under the observed arrival pattern, so a storage coordinator might wait for phi = 12 while a cache fails over at 4. Asking peers to confirm is SWIM's indirect probing, a separate technique.",
    "tags": [
      "gossip-protocol",
      "recall",
      "inline"
    ]
  },
  {
    "id": "gossip-protocol-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Gossip at 16x scale",
    "section": "Worked example: how fast gossip spreads",
    "prompt": "A 1,000-node cluster gossips every second with fanout 3 and 2 KB digests. It grows to 16,000 nodes. What happens to convergence time and per-node gossip bandwidth?",
    "options": [
      "Both grow about 16 times",
      "Convergence stays the same, and per-node bandwidth grows 16 times",
      "Convergence grows by only about two rounds, and per-node bandwidth stays about 6 KB/s",
      "Convergence grows 16 times, and per-node bandwidth stays the same"
    ],
    "answer": 2,
    "explanation": "Informed nodes roughly quadruple per round, so 16x more nodes needs about log4(16) = 2 more rounds. Each node still sends 3 x 2 KB per second whatever the cluster size, unlike all-to-all heartbeating.",
    "tags": [
      "gossip-protocol",
      "apply",
      "inline"
    ]
  },
  {
    "id": "gossip-protocol-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Refuting suspicion",
    "section": "SWIM-style failure detection",
    "prompt": "Under SWIM, node A's pings to B time out, but B is healthy and only the A-to-B path is bad. What stops B from being wrongly declared dead?",
    "options": [
      "A retries the ping with exponential backoff until B eventually answers",
      "A asks other nodes to probe B indirectly, and if B is still marked suspect, B refutes it by gossiping a higher incarnation number",
      "B's replicas take over its traffic, so being declared dead does no harm",
      "The cluster leader verifies B's status before any node acts on the report"
    ],
    "answer": 1,
    "explanation": "Indirect ping-req probes separate 'B is dead' from 'this path is bad', and suspicion is a gossiped state that B can override with a higher incarnation before the timeout. Retrying over the same broken path cannot tell those two cases apart.",
    "tags": [
      "gossip-protocol",
      "staff",
      "inline"
    ]
  },
  {
    "id": "gossip-protocol-n1",
    "topic": "gossip-protocol",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Epidemic Gossip Dissemination Rounds",
    "scenario": "A cluster has `N = 1,024` nodes. Each gossip round (every 100 ms), every infected node pushes a membership update to `b = 3` peers, quadrupling the infected population (`4^k`) in the early exponential phase.",
    "prompt": "In the idealized exponential phase (`4^k = 1,024`), how many gossip rounds `k` are needed to reach 1,024 nodes?",
    "question": "In the idealized exponential phase (`4^k = 1,024`), how many gossip rounds `k` are needed to reach 1,024 nodes?",
    "unit": "rounds",
    "answer": 5,
    "tolerance": 0.2,
    "hint": "Compute `log_4(1,024)` since `4^5 = (2^2)^5 = 2^10 = 1,024`.",
    "explanation": "Because `4^5 = 1,024`, epidemic gossip spreads an update across a 1,024-node cluster in O(log N) rounds (~5–7 rounds, or well under 1 second at 100 ms/round).",
    "tags": [
      "gossip-protocol",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "gossip-protocol-t1",
    "topic": "gossip-protocol",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: All-to-All Heartbeats vs SWIM Piggybacked Gossip + Indirect Probes",
    "scenario": "In a 2,000-node cluster, naive all-to-all heartbeating every second sends `2,000 × 1,999 ≈ 4,000,000` messages/sec and marks nodes dead whenever a single link between Node A and Node B experiences transient packet loss.",
    "prompt": "How does the SWIM membership protocol solve both O(N^2) bandwidth growth and single-link false positives?",
    "question": "How does the SWIM membership protocol solve both O(N^2) bandwidth growth and single-link false positives?",
    "options": [
      "Have all 2,000 nodes heartbeat every 10 ms instead of every 1 second",
      "Elect a single node to ping all 2,000 nodes sequentially over a single TCP socket",
      "Each node probes 1 random peer per period (`O(N)` total cluster messages/period), uses `k` indirect `ping-req` relay peers before declaring suspicion, and piggybacks membership diffs on probe packets"
    ],
    "correctOption": 2,
    "reasons": [
      "Higher frequency all-to-all heartbeats reduce network load",
      "Sequential single-socket probing scales to 100,000 nodes",
      "Random probing bounds per-node network overhead to O(1), while `ping-req` through `k` intermediary peers distinguishes a congested A-B route from an actually dead Node B"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How does SWIM verify whether Node B is actually dead vs just unreachable from Node A?",
    "explanation": "SWIM decouples failure detection (O(1) random probes per node + indirect `ping-req` relays + Suspicion grace window) from membership dissemination (piggybacked epidemic infection).",
    "tags": [
      "gossip-protocol",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["metadata-service-and-node-discovery"] = [
  {
    "id": "metadata-service-and-node-discovery-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "One-shot watches",
    "section": "Under the Hood: Key Architectural Primitives",
    "prompt": "A gateway uses a classic (pre-3.6) ZooKeeper watch on /services/payment and receives a notification that a child changed. What must it do so it does not miss later changes?",
    "options": [
      "Nothing, because the watch keeps delivering every subsequent event",
      "Poll the node every second from then on",
      "Replay the event log starting from the notification's revision",
      "Re-read the children and re-register the watch, because classic watches fire only once"
    ],
    "answer": 3,
    "explanation": "Classic ZooKeeper watches are one-shot, so changes between the notification and re-registration are seen only through the re-read. Resuming from a revision is how etcd watch streams work, not classic ZooKeeper.",
    "tags": [
      "metadata-service-and-node-discovery",
      "recall",
      "inline"
    ]
  },
  {
    "id": "metadata-service-and-node-discovery-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Lease-based detection time",
    "section": "Worked example: service registration with an etcd lease",
    "prompt": "An instance registers in etcd with a 15-second lease and sends KeepAlives every 5 seconds. It is OOM-killed right after a KeepAlive. About when does the gateway watching the prefix remove it?",
    "options": [
      "Immediately, because its TCP connection closes",
      "After about 15 seconds, when the lease expires and etcd deletes the key",
      "After about 5 seconds, when the next KeepAlive is missed",
      "Never, until an operator deletes the key"
    ],
    "answer": 1,
    "explanation": "Worst-case detection equals the TTL, since etcd revokes the lease only once it expires and then emits the DELETE event. A single missed KeepAlive does not end the lease; that allowance is what protects against brief GC pauses.",
    "tags": [
      "metadata-service-and-node-discovery",
      "apply",
      "inline"
    ]
  },
  {
    "id": "metadata-service-and-node-discovery-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "NOSPACE alarm",
    "section": "Failure modes",
    "prompt": "etcd writes suddenly fail with a NOSPACE alarm while reads keep working. The team has been storing config history and large blobs in it. What is happening and what fixes it?",
    "options": [
      "The disk is full; attach a bigger volume and restart etcd",
      "A leader election is in progress; wait for it to finish",
      "The database hit its space quota (2 GB by default) and went read-only; compact and defragment, and move bulk data elsewhere",
      "Watch streams are overloaded; reduce the number of watchers"
    ],
    "answer": 2,
    "explanation": "etcd enforces a backend quota, and exceeding it raises NOSPACE and blocks writes until you compact and defragment. A bigger disk does not raise the quota, and the real cause is using a coordination store as a general database.",
    "tags": [
      "metadata-service-and-node-discovery",
      "staff",
      "inline"
    ]
  },
  {
    "id": "metadata-service-and-node-discovery-n1",
    "topic": "metadata-service-and-node-discovery",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Consensus Metadata Cache Read Offload",
    "scenario": "4,000 stateless storage routers need the current partition-to-node routing map on every incoming request (200,000 req/s aggregate). Instead of querying the 5-node etcd/Raft metadata service on every request, routers cache the map locally and subscribe to push watches (averaging 2 topology changes per minute).",
    "prompt": "If each of the 4,000 routers only pulls/receives a watch event twice per minute (every 30 seconds), how many watch update messages per second does the metadata cluster send across all 4,000 routers (to the nearest integer)?",
    "question": "If each of the 4,000 routers only pulls/receives a watch event twice per minute (every 30 seconds), how many watch update messages per second does the metadata cluster send across all 4,000 routers (to the nearest integer)?",
    "unit": "msg/s",
    "answer": 133,
    "tolerance": 0.2,
    "hint": "4,000 routers × 2 updates per 60 seconds = 8,000 / 60.",
    "explanation": "8,000 watch notifications per 60 seconds = 133.3 (~133) msg/s instead of 200,000 QPS—keeping the Raft consensus cluster completely off the data-plane hot path.",
    "tags": [
      "metadata-service-and-node-discovery",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "metadata-service-and-node-discovery-t1",
    "topic": "metadata-service-and-node-discovery",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Consensus Control Plane on the Data Path vs Epoch-Cached Routing Table",
    "scenario": "A junior architect designs a distributed storage system where every client `GET / PUT` request first queries ZooKeeper/etcd synchronously to find which storage node owns key `K`.",
    "prompt": "Why is this an anti-pattern, and how do production systems (Kafka, Spanner, Bigtable, TiKV) use their metadata service?",
    "question": "Why is this an anti-pattern, and how do production systems (Kafka, Spanner, Bigtable, TiKV) use their metadata service?",
    "options": [
      "ZooKeeper/etcd should store both the metadata and all user payload blobs",
      "Clients should broadcast every `GET` to all storage nodes in the cluster",
      "Keep ZooKeeper/etcd strictly off the hot data path: clients cache the partition map with an `epoch` number and talk directly to storage nodes, refreshing the map only when a storage node rejects a stale `epoch`"
    ],
    "correctOption": 2,
    "reasons": [
      "5-node Raft clusters scale linearly to 10M data-plane writes/sec",
      "Broadcasting every read reduces network utilization",
      "A consensus cluster (3–5 nodes) is designed for low-throughput strongly consistent coordination; epoch-validated client caching gives local speed with strong routing correctness"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How does a storage node detect that a client used a stale cached routing table?",
    "explanation": "Every partition assignment carries a monotonic `epoch` (configuration version). Clients route directly using their cached map; if a shard moved, the target node sees `client.epoch < shard.epoch` and returns `StaleEpochException`, prompting a cache refresh.",
    "tags": [
      "metadata-service-and-node-discovery",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["distributed-hash-tables"] = [
  {
    "id": "distributed-hash-tables-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "XOR closest node",
    "section": "Worked example: a Kademlia lookup with 4-bit IDs",
    "prompt": "With 4-bit Kademlia IDs, a lookup targets key 1001. Of the known nodes 1000, 1011, 1101 and 0001, which is closest by XOR distance?",
    "options": [
      "1000",
      "1011",
      "1101",
      "0001"
    ],
    "answer": 0,
    "explanation": "The XOR distances are 0001 (1), 0010 (2), 0100 (4) and 1000 (8), so 1000 is closest. 0001 shares the three low bits with the key but differs in the leading bit, and XOR weights the leading bits most.",
    "tags": [
      "distributed-hash-tables",
      "apply",
      "inline"
    ]
  },
  {
    "id": "distributed-hash-tables-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why Cassandra is one-hop",
    "section": "DHT designs compared",
    "prompt": "Why does Cassandra route requests in one hop rather than using Kademlia-style O(log N) routing?",
    "options": [
      "Kademlia cannot store replicated data",
      "XOR distance cannot be computed on 128-bit tokens",
      "Every node holds full ring membership, which suits a managed, modest-sized cluster but not millions of churning peers",
      "Cassandra uses Chord, which is always one hop"
    ],
    "answer": 2,
    "explanation": "Dynamo-style systems give every node the full membership, so any node can find a key's owners in one hop. Multi-hop DHTs exist because full membership is impractical for huge, untrusted, churning peer sets; Chord is itself an O(log N) design.",
    "tags": [
      "distributed-hash-tables",
      "recall",
      "inline"
    ]
  },
  {
    "id": "distributed-hash-tables-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Values fading under churn",
    "section": "Failure modes",
    "prompt": "A peer stores a value on the k closest nodes once and never republishes it. Weeks later, lookups fail even though the publisher is still online. Why?",
    "options": [
      "XOR distances change as the network grows, so the key maps to a different ID",
      "Churn has replaced the original closest nodes, and the new closest nodes never received the value; values need periodic republishing",
      "k-buckets evict long-lived contacts, which deletes the values they store",
      "The lookup exceeded log2 N hops and was aborted"
    ],
    "answer": 1,
    "explanation": "Peers often stay only minutes to hours, so the set of closest nodes drifts, and values must be replicated to k nodes and republished periodically. Key IDs and XOR distances are fixed, and k-buckets actually prefer long-lived contacts.",
    "tags": [
      "distributed-hash-tables",
      "staff",
      "inline"
    ]
  },
  {
    "id": "distributed-hash-tables-n1",
    "topic": "distributed-hash-tables",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Kademlia / Chord Logarithmic Routing Hops",
    "scenario": "A peer-to-peer Distributed Hash Table (DHT) like Chord or Kademlia contains `N = 65,536` (`2^16`) nodes, and each node maintains a finger/routing table of size `log2(N)` pointing to exponentially spaced distances.",
    "prompt": "What is the maximum number of routing hops (`log2(65,536)`) required to locate any key in a 65,536-node Chord ring?",
    "question": "What is the maximum number of routing hops (`log2(65,536)`) required to locate any key in a 65,536-node Chord ring?",
    "unit": "hops",
    "answer": 16,
    "tolerance": 0.2,
    "hint": "Each hop halves the remaining distance around the `2^16`-node ring.",
    "explanation": "Because each routing step jumps at least halfway to the target ID, finding any key among `65,536 = 2^16` nodes takes at most `log2(65,536) = 16` hops.",
    "tags": [
      "distributed-hash-tables",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "distributed-hash-tables-t1",
    "topic": "distributed-hash-tables",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Multi-Hop P2P DHT (`O(log N)`) vs Datacenter One-Hop Consistent Hashing (`O(1)`)",
    "scenario": "You are designing an internal in-memory key-value store running inside a single cloud VPC with 200 nodes and a strict p99 latency budget of 2 ms.",
    "prompt": "Should you use a multi-hop Kademlia/Chord DHT (`O(log N)` hops) or a one-hop consistent hashing ring (`O(1)` hops), and why?",
    "question": "Should you use a multi-hop Kademlia/Chord DHT (`O(log N)` hops) or a one-hop consistent hashing ring (`O(1)` hops), and why?",
    "options": [
      "Use a multi-hop Kademlia DHT so every read bounces across 8 servers sequentially",
      "Use Gnutella flooding across all 200 servers",
      "Use one-hop consistent hashing (Dynamo/Cassandra style) where every node maintains the full 200-node membership table via gossip and routes directly to the target node in 1 hop"
    ],
    "correctOption": 2,
    "reasons": [
      "8 sequential network hops reduce tail latency inside a datacenter",
      "Flooding minimizes CPU usage",
      "Multi-hop DHTs (`O(log N)` state, `O(log N)` hops) are built for untrusted P2P networks with millions of churning nodes; inside a 200-node datacenter, storing all 200 peers in RAM costs kilobytes and gives O(1) single-hop latency"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How much RAM does it take to store a 200-node membership table vs paying 8 sequential network hops on every read?",
    "explanation": "In a datacenter cluster of 10–1,000 nodes, every node can easily hold the full ring membership in memory (a few KB), turning `O(log N)` DHT routing into a single direct `O(1)` network hop.",
    "tags": [
      "distributed-hash-tables",
      "tradeoff",
      "staff"
    ]
  }
];
