# Curriculum Dependency Graph

This document establishes the conceptual prerequisite graph underpinning Curriculum v2. Units are ordered based on architectural necessity—a learner must understand the foundational mechanism before analyzing the distributed abstraction built upon it.

---

## High-Level Dependency Graph

```mermaid
graph TD
    %% Track 1
    Req["1.1 Requirements & Invariants"] --> Cap["1.2 Capacity & Latency Modeling"]
    Cap --> Conc["1.3 Concurrency & Server Models"]
    Conc --> Scale["1.4 Scaling & Monolith Boundaries"]
    Scale --> Cost["1.5 Cost & Hardware Economics"]

    %% Track 2
    Req --> Rel["2.1 Relational Design & Indexing"]
    Rel --> BTree["2.2 B-Trees & Query Optimization"]
    BTree --> WAL["2.3 WAL & Crash Recovery (ARIES)"]
    WAL --> LSM["2.4 LSM-Trees & SSTables"]
    LSM --> Part["2.5 Sharding, Partitions & Virtual Nodes"]

    %% Track 3
    Conc --> Net["3.1 Network Transport (TCP/UDP/gRPC)"]
    Net --> Time["3.2 Clocks, Skew & Causality"]
    Time --> Rep["3.3 Replication & Consistency Models"]
    Rep --> Cons["3.4 Consensus (Raft & Paxos)"]
    Cons --> Coord["3.5 Distributed Leases & Locks"]
    Coord --> Goss["3.6 Gossip & SWIM Cluster Membership"]

    %% Track 4
    Part --> Queue["4.1 Task Queues & Priority Schedulers"]
    WAL --> Stream["4.2 Partitioned Logs & Kafka Internals"]
    Stream --> Sketch["4.3 Streaming Analytics & Probabilistic Sketches"]
    Net --> Real["4.4 Real-time Communication (WebSockets/SSE)"]
    Part --> Cache["4.5 Caching Topologies & Stampede Defense"]

    %% Track 5
    Net --> Fail["5.1 Circuit Breakers & Graceful Degradation"]
    Req --> SLO["5.2 Observability, Tracing & SLOs"]
    Rel --> Mig["5.3 Zero-Downtime Schema Migrations"]
    Rep --> DR["5.4 High Availability & Disaster Recovery"]
    Part --> Tenant["5.5 Multi-Tenancy & Noisy Neighbors"]
    Req --> Threat["5.6 Threat Modeling & System Hardening"]

    %% Track 6
    Queue & Stream & Cache --> LabInfra["6.1 Core Infrastructure Labs"]
    Real & Part & Cache --> LabProd["6.2 Data-Intensive Product Labs"]
    Stream & Sketch & BTree --> LabSearch["6.3 Media & Retrieval Labs"]
    Cons & Rep & DR --> LabCase["6.4 Architecture Evolution & Case Studies"]
```

---

## Detailed Prerequisite Sequence by Track

### Track 1: Foundations & Workload Modeling
- `requirements-clarification` (None)
- `back-of-the-envelope-capacity-planning` (Prerequisite: `requirements-clarification`)
- `concurrency-vs-parallelism` (Prerequisite: `back-of-the-envelope-capacity-planning`)
- `horizontal-vs-vertical-scaling` (Prerequisite: `concurrency-vs-parallelism`)
- `cost-aware-architecture` (Prerequisite: `horizontal-vs-vertical-scaling`)

### Track 2: Data Architecture & Storage Internals
- `relational-database-design` (Prerequisite: `requirements-clarification`)
- `database-indexing` & `b-tree` (Prerequisite: `relational-database-design`)
- `database-wal-and-recovery` (Prerequisite: `b-tree`)
- `lsm-tree-storage-engine` (Prerequisite: `database-wal-and-recovery`)
- `sharding-and-partitioning` & `consistent-hashing` (Prerequisite: `lsm-tree-storage-engine`)

### Track 3: Distributed Systems & Consensus
- `tcp-vs-udp` & `http-rest-grpc` (Prerequisite: `concurrency-vs-parallelism`)
- `clocks-and-ordering` & `consistency-models` (Prerequisite: `tcp-vs-udp`)
- `cap-and-pacelc` & `replication` (Prerequisite: `consistency-models`)
- `consensus` & `leader-election` (Prerequisite: `cap-and-pacelc`)
- `distributed-locks-and-leases` & `gossip-protocol` (Prerequisite: `consensus`)

### Track 4: Asynchronous Execution, Queues & Real-Time
- `delegation-and-async-work` & `task-queue-vs-event-stream` (Prerequisite: `sharding-and-partitioning`)
- `event-bus-for-product-events` & `partitioned-log-system-design` (Prerequisite: `task-queue-vs-event-stream`)
- `caching-layers` & `cache-concurrency-control` (Prerequisite: `consistent-hashing`)
- `hyperloglog-cardinality-estimation` & `count-min-sketch` (Prerequisite: `delegation-and-async-work`)
- `websockets-vs-sse-vs-long-polling` (Prerequisite: `tcp-vs-udp`)

### Track 5: Production Engineering & Resilience
- `circuit-breakers-and-timeouts` & `load-shedding` (Prerequisite: `distributed-systems-foundations`)
- `observability-for-distributed-systems` & `slos-and-error-budgets` (Prerequisite: `non-functional-requirements`)
- `database-migration-safety` & `parallel-monolith-read-drain` (Prerequisite: `relational-database-scaling`)
- `disaster-recovery` & `database-backups-and-restore` (Prerequisite: `replication`)
- `multi-tenant-design` & `security-and-abuse-prevention` (Prerequisite: `requirements-clarification`)

### Track 6: Systems Design Labs & Architectural Evolution
- `url-shortener-system-design` (Prerequisites: Tracks 1, 2)
- `sliding-window-rate-limiter` (Prerequisites: Tracks 1, 4)
- `chat-and-messaging-system-design` (Prerequisites: Tracks 2, 3, 4)
- `case-amazon-dynamo` (Prerequisites: Tracks 2, 3)
- `case-discord-message-storage` (Prerequisites: Tracks 2, 4)
- `case-gitlab-database-incident` (Prerequisites: Tracks 2, 5)
