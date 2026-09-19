// Auto-generated Topics Deep Content for 200 System Design Units
window.TOPICS_CONTENT = {
  "requirements-clarification": {
    "slug": "requirements-clarification",
    "title": "Requirements clarification",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "requirements",
      "foundations"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://c4model.com/diagrams/system-context",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/build-for-business",
      "https://sre.google/workbook/implementing-slos/",
      "https://fanout.sh/system/archive/requirements-clarification",
      "https://fanout.sh/system/archive/requirements-clarification"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Requirements clarification\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "logical-system-design": {
    "slug": "logical-system-design",
    "title": "Logical system design",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "architecture",
      "maintainability"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://alistair.cockburn.us/hexagonal-architecture",
      "https://martinfowler.com/eaaCatalog/repository.html",
      "https://martinfowler.com/articles/injection.html",
      "https://fanout.sh/system/archive/logical-system-design"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Logical system design\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "non-functional-requirements": {
    "slug": "non-functional-requirements",
    "title": "Non-functional requirements",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "requirements",
      "reliability"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://sre.google/sre-book/service-level-objectives/",
      "https://sre.google/workbook/implementing-slos/",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/build-for-business",
      "https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-design-specification",
      "https://fanout.sh/system/archive/non-functional-requirements"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Non-functional requirements\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "system-design-tradeoffs": {
    "slug": "system-design-tradeoffs",
    "title": "System design tradeoffs",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "tradeoffs",
      "architecture"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://sre.google/sre-book/embracing-risk/",
      "https://martinfowler.com/articles/microservice-trade-offs.html",
      "https://prometheus.io/docs/practices/instrumentation/",
      "https://fanout.sh/system/archive/system-design-tradeoffs",
      "https://fanout.sh/system/archive/system-design-tradeoffs"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"System design tradeoffs\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "availability-durability-consistency-cost": {
    "slug": "availability-durability-consistency-cost",
    "title": "Availability, durability, consistency, cost",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "reliability",
      "tradeoffs",
      "foundations"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://www.postgresql.org/docs/16/wal-reliability.html",
      "https://www.postgresql.org/docs/16/transaction-iso.html",
      "https://www.postgresql.org/docs/16/backup.html",
      "https://sre.google/sre-book/embracing-risk/",
      "https://fanout.sh/system/archive/availability-durability-consistency-cost"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Availability, durability, consistency, cost\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "back-of-the-envelope-capacity-planning": {
    "slug": "back-of-the-envelope-capacity-planning",
    "title": "Back-of-the-envelope capacity planning",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "capacity-planning",
      "foundations"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://sre.google/workbook/non-abstract-design/",
      "https://www.postgresql.org/docs/16/pgbench.html",
      "https://www.postgresql.org/docs/16/functions-admin.html#FUNCTIONS-ADMIN-DBSIZE",
      "https://fanout.sh/system/archive/back-of-the-envelope-capacity-planning"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Back-of-the-envelope capacity planning\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "concurrency-vs-parallelism": {
    "slug": "concurrency-vs-parallelism",
    "title": "How a server handles many requests",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "concurrency",
      "parallelism"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://go.dev/blog/waza-talk",
      "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop",
      "https://docs.python.org/3/library/threading.html",
      "https://fanout.sh/system/archive/concurrency-vs-parallelism"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"How a server handles many requests\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "horizontal-vs-vertical-scaling": {
    "slug": "horizontal-vs-vertical-scaling",
    "title": "Horizontal vs vertical scaling",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "scaling",
      "stateless"
    ],
    "summary": "Vertical scaling gives one machine more CPU, memory, or storage capacity.",
    "previewHeading": "The core idea",
    "previewContinuation": "Horizontal scaling spreads work across more machines.",
    "sources": [
      "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out",
      "https://sre.google/workbook/non-abstract-design/",
      "https://fanout.sh/system/archive/horizontal-vs-vertical-scaling"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Horizontal vs vertical scaling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "monolith-vs-microservices": {
    "slug": "monolith-vs-microservices",
    "title": "Monolith vs microservices",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "scaling",
      "architecture"
    ],
    "summary": "A monolith is built and deployed as one application unit.",
    "previewHeading": "The core idea",
    "previewContinuation": "Microservices divide capabilities into services that can be deployed independently.",
    "sources": [
      "https://martinfowler.com/articles/microservice-trade-offs.html",
      "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/data-considerations",
      "https://fanout.sh/system/archive/monolith-vs-microservices",
      "https://fanout.sh/system/archive/monolith-vs-microservices"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Monolith vs microservices\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "repository-pattern": {
    "slug": "repository-pattern",
    "title": "Repository pattern",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "architecture",
      "data-access"
    ],
    "summary": "A repository puts a data-access boundary between application rules and persistence details.",
    "previewHeading": "The core idea",
    "previewContinuation": "Callers ask for domain objects or operations; the repository handles the query and the mapping from stored data.",
    "sources": [
      "https://martinfowler.com/eaaCatalog/repository.html",
      "https://www.postgresql.org/docs/16/tutorial-transactions.html",
      "https://www.postgresql.org/docs/16/ddl-constraints.html",
      "https://fanout.sh/system/archive/repository-pattern"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Repository pattern\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "extensible-data-modeling": {
    "slug": "extensible-data-modeling",
    "title": "Extensible data modeling",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "data-modeling",
      "product-engineering"
    ],
    "summary": "An extensible model accommodates a plausible next product change without making today's data hard to understand.",
    "previewHeading": "The core idea",
    "previewContinuation": "The useful move is often one level of generality: enough to represent the next known use case, while keeping names, queries, and constraints specific.",
    "sources": [
      "https://www.postgresql.org/docs/16/ddl-constraints.html",
      "https://www.postgresql.org/docs/16/datatype-json.html",
      "https://martinfowler.com/bliki/ParallelChange.html",
      "https://fanout.sh/system/archive/extensible-data-modeling"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Extensible data modeling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "cost-aware-architecture": {
    "slug": "cost-aware-architecture",
    "title": "Cost-aware architecture",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "requirements",
      "cost"
    ],
    "summary": "Cost is a design constraint alongside latency, correctness, and reliability.",
    "previewHeading": "The core idea",
    "previewContinuation": "To reason about it, connect the work the product performs to the resources it consumes and the time needed to operate them.",
    "sources": [
      "https://www.finops.org/framework/capabilities/unit-economics/",
      "https://sre.google/sre-book/embracing-risk/",
      "https://sre.google/sre-book/simplicity/",
      "https://fanout.sh/system/archive/cost-aware-architecture"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Cost-aware architecture\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "when-not-to-add-infrastructure": {
    "slug": "when-not-to-add-infrastructure",
    "title": "When not to add infrastructure",
    "kind": "lesson",
    "moduleNumber": "01",
    "moduleTitle": "Foundations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "architecture",
      "tradeoffs"
    ],
    "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://sre.google/sre-book/simplicity/",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out",
      "https://martinfowler.com/articles/microservice-trade-offs.html",
      "https://fanout.sh/system/archive/when-not-to-add-infrastructure"
    ],
    "diagram": "flowchart LR\n    Client([Client Traffic]) --> CDN[CloudFront / Akamai CDN]\n    CDN --> LB[L7 Load Balancer / API Gateway]\n    LB --> AppServers[Stateless App Tier]\n    AppServers --> Cache[(Distributed Cache Redis)]\n    AppServers --> PrimaryDB[(Primary RDBMS)]\n    PrimaryDB -. Replication .-> ReplicaDB[(Read Replicas)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"When not to add infrastructure\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "api-design-contracts": {
    "slug": "api-design-contracts",
    "title": "API design contracts",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "api",
      "contracts"
    ],
    "summary": "An API contract defines what a caller can send, what an answer means, and which behavior will survive a server update.",
    "previewHeading": "The core idea",
    "previewContinuation": "The JSON shape is only part of it.",
    "sources": [
      "https://fanout.sh/system/archive/api-design-contracts",
      "https://fanout.sh/system/archive/api-design-contracts",
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://google.aip.dev/158",
      "https://google.aip.dev/180",
      "https://docs.stripe.com/api/idempotent_requests"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"API design contracts\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "service-to-service-communication": {
    "slug": "service-to-service-communication",
    "title": "Service-to-service communication",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "scaling",
      "communication"
    ],
    "summary": "When work crosses a service boundary, the caller has to send a message and interpret what comes back.",
    "previewHeading": "The core idea",
    "previewContinuation": "The other service can finish its work while the caller sees only a timeout.",
    "sources": [
      "https://fanout.sh/system/archive/service-to-service-communication",
      "https://fanout.sh/system/archive/service-to-service-communication",
      "https://grpc.io/docs/what-is-grpc/core-concepts/",
      "https://grpc.io/docs/guides/deadlines/",
      "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead",
      "https://docs.stripe.com/webhooks",
      "https://www.w3.org/TR/trace-context/",
      "https://www.rfc-editor.org/rfc/rfc9110.html#name-202-accepted"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Service-to-service communication\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "http-rest-grpc": {
    "slug": "http-rest-grpc",
    "title": "HTTP, REST, and gRPC",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "scaling",
      "api",
      "http"
    ],
    "summary": "Choosing between a resource-oriented HTTP API and gRPC means choosing how clients express remote operations.",
    "previewHeading": "The core idea",
    "previewContinuation": "Both can serve internal services or external clients.",
    "sources": [
      "https://fanout.sh/system/archive/http-rest-grpc",
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://www.rfc-editor.org/rfc/rfc9112.html",
      "https://www.rfc-editor.org/rfc/rfc9113.html",
      "https://www.rfc-editor.org/rfc/rfc9114.html",
      "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm",
      "https://grpc.io/docs/what-is-grpc/core-concepts/",
      "https://grpc.io/docs/platforms/web/basics/",
      "https://github.com/grpc/grpc-web",
      "https://protobuf.dev/programming-guides/proto3/"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"HTTP, REST, and gRPC\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "tcp-vs-udp": {
    "slug": "tcp-vs-udp",
    "title": "TCP vs UDP",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "ground-floor",
      "networking"
    ],
    "summary": "Choose service boundaries and communication patterns, then handle retries and overload.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://www.rfc-editor.org/rfc/rfc9293.html",
      "https://hpbn.co/building-blocks-of-tcp/",
      "https://hpbn.co/building-blocks-of-udp/",
      "https://www.rfc-editor.org/rfc/rfc8085.html",
      "https://www.rfc-editor.org/rfc/rfc9000.html",
      "https://www.rfc-editor.org/rfc/rfc793",
      "https://www.rfc-editor.org/rfc/rfc9114.html",
      "https://www.rfc-editor.org/rfc/rfc7766.html"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"TCP vs UDP\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "api-gateway-vs-load-balancer": {
    "slug": "api-gateway-vs-load-balancer",
    "title": "API gateway vs load balancer",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "api",
      "gateway"
    ],
    "summary": "A request arrives at the public address for your application.",
    "previewHeading": "The core idea",
    "previewContinuation": "Two decisions follow: which service handles this operation, and which running copy of that service should receive it?",
    "sources": [
      "https://fanout.sh/system/archive/api-gateway-vs-load-balancer",
      "https://fanout.sh/system/archive/api-gateway-vs-load-balancer",
      "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway",
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig",
      "https://www.rfc-editor.org/rfc/rfc7239.html#section-8.1"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"API gateway vs load balancer\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "load-balancers": {
    "slug": "load-balancers",
    "title": "Load balancers",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "scaling",
      "load-balancing"
    ],
    "summary": "A visitor should be able to open a short link without knowing which application copy is running today.",
    "previewHeading": "The core idea",
    "previewContinuation": "If app A stops taking new work, the next request needs somewhere else to go.",
    "sources": [
      "https://fanout.sh/system/archive/load-balancers",
      "https://nginx.org/en/docs/http/ngx_http_upstream_module.html",
      "https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream",
      "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/health_checking",
      "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/draining",
      "https://www.rfc-editor.org/rfc/rfc9113.html#section-5"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Load balancers\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "consistent-hashing-load-balancing": {
    "slug": "consistent-hashing-load-balancing",
    "title": "Consistent-hashing load balancing",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "load-balancing",
      "hashing"
    ],
    "summary": "A request reaches a healthy application, but the useful cached answer is in another application's memory.",
    "previewHeading": "The core idea",
    "previewContinuation": "Sending the next identical request somewhere else repeats work that a stable destination might share.",
    "sources": [
      "https://fanout.sh/system/archive/consistent-hashing-load-balancing",
      "https://fanout.sh/system/archive/consistent-hashing-load-balancing",
      "https://fanout.sh/system/archive/consistent-hashing-load-balancing",
      "https://nginx.org/en/docs/http/ngx_http_upstream_module.html#hash",
      "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers",
      "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Consistent-hashing load balancing\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "event-contracts": {
    "slug": "event-contracts",
    "title": "Event contracts",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "events",
      "contracts"
    ],
    "summary": "A report rebuilt tomorrow may read a redirect record written before today's application update.",
    "previewHeading": "The core idea",
    "previewContinuation": "The old program is gone, but its record still has to make sense.",
    "sources": [
      "https://fanout.sh/system/archive/event-contracts",
      "https://fanout.sh/system/archive/event-contracts",
      "https://fanout.sh/system/archive/event-contracts",
      "https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md",
      "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html",
      "https://docs.stripe.com/webhooks"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Event contracts\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "retries-timeouts-idempotency": {
    "slug": "retries-timeouts-idempotency",
    "title": "Retries, timeouts, and idempotency",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "reliability",
      "retries"
    ],
    "summary": "The server can finish creating your short link while your screen still says the request failed.",
    "previewHeading": "The core idea",
    "previewContinuation": "Clicking again may recover the answer, or create another link.",
    "sources": [
      "https://fanout.sh/system/archive/retries-timeouts-idempotency",
      "https://fanout.sh/system/archive/retries-timeouts-idempotency",
      "https://grpc.io/docs/guides/deadlines/",
      "https://docs.stripe.com/api/idempotent_requests",
      "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Retries, timeouts, and idempotency\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "batching": {
    "slug": "batching",
    "title": "Batching",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "batching",
      "transactions"
    ],
    "summary": "Committing a hundred records separately repeats transaction work a hundred times.",
    "previewHeading": "The core idea",
    "previewContinuation": "Grouping them can share that cost, but the first record may wait for the group to form.",
    "sources": [
      "https://fanout.sh/system/archive/batching",
      "https://fanout.sh/system/archive/batching",
      "https://www.sqlite.org/lang_transaction.html",
      "https://kafka.apache.org/41/configuration/producer-configs/",
      "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessageBatch.html"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Batching\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "backpressure": {
    "slug": "backpressure",
    "title": "Backpressure",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "queues",
      "reliability"
    ],
    "summary": "A worker can be healthy and still fall behind.",
    "previewHeading": "The core idea",
    "previewContinuation": "Requests arrive while it is busy, so the program puts them somewhere to wait.",
    "sources": [
      "https://fanout.sh/system/archive/backpressure",
      "https://fanout.sh/system/archive/backpressure",
      "https://docs.python.org/3/library/asyncio-queue.html",
      "https://nodejs.org/en/learn/modules/backpressuring-in-streams",
      "https://www.rfc-editor.org/rfc/rfc9293.html#section-3.8.6"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Backpressure\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "tail-latency": {
    "slug": "tail-latency",
    "title": "Tail latency",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "latency",
      "measurement"
    ],
    "summary": "Most requests can finish quickly while a small group of callers waits far too long.",
    "previewHeading": "The core idea",
    "previewContinuation": "The average blends those experiences together.",
    "sources": [
      "https://fanout.sh/system/archive/tail-latency",
      "https://fanout.sh/system/archive/tail-latency",
      "https://sre.google/sre-book/monitoring-distributed-systems/",
      "https://www.barroso.org/publications/TheTailAtScale.pdf",
      "https://docs.python.org/3/library/sqlite3.html",
      "https://prometheus.io/docs/practices/histograms/"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Tail latency\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "load-shedding": {
    "slug": "load-shedding",
    "title": "Load shedding",
    "kind": "lesson",
    "moduleNumber": "02",
    "moduleTitle": "APIs, services and protocols",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "reliability",
      "admission"
    ],
    "summary": "The queue is full, and the next caller cannot wait long enough for room.",
    "previewHeading": "The core idea",
    "previewContinuation": "Holding that request anyway spends memory and delays a failure the caller is already approaching.",
    "sources": [
      "https://fanout.sh/system/archive/load-shedding",
      "https://fanout.sh/system/archive/load-shedding",
      "https://fanout.sh/system/archive/load-shedding",
      "https://docs.python.org/3/library/asyncio-queue.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html#name-503-service-unavailable",
      "https://www.rfc-editor.org/rfc/rfc6585.html#section-4",
      "https://sre.google/sre-book/handling-overload/"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    actor Client\n    participant GW as API Gateway\n    participant SvcA as Order Service\n    participant SvcB as Payment Service\n    Client->>GW: POST /orders (Idempotency-Key: X123)\n    GW->>SvcA: Forward Request\n    SvcA->>SvcB: POST /charge (Idempotency-Key: X123)\n    Note over SvcB: Process charge & lock key\n    SvcB-->>SvcA: 200 OK (Charged)\n    SvcA-->>GW: 201 Created\n    GW-->>Client: 201 Created",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Load shedding\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "relational-database-design": {
    "slug": "relational-database-design",
    "title": "Relational database design",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "data-modeling"
    ],
    "summary": "Relational design decides which rows own the facts, how those rows relate, and which states the database should refuse.",
    "previewHeading": "The core idea",
    "previewContinuation": "A useful schema makes a change in the product correspond to a clear change in the data, without leaving several conflicting copies to reconcile.",
    "sources": [
      "https://fanout.sh/system/archive/relational-database-design",
      "https://fanout.sh/system/archive/relational-database-design",
      "https://www.postgresql.org/docs/16/ddl-constraints.html",
      "https://learn.microsoft.com/en-us/previous-versions/troubleshoot/microsoft-365/microsoft-365-apps/access/database-normalization-description",
      "https://www.postgresql.org/docs/16/rules-materializedviews.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Relational database design\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "sql-backed-key-value-store": {
    "slug": "sql-backed-key-value-store",
    "title": "Design: a key-value store on SQL",
    "kind": "design",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "databases",
      "key-value"
    ],
    "summary": "A relational table can store values that callers retrieve by an exact key.",
    "previewHeading": "The core idea",
    "previewContinuation": "Configuration, feature flags and small saved drafts often need that shape.",
    "sources": [
      "https://fanout.sh/system/archive/sql-backed-key-value-store",
      "https://fanout.sh/system/archive/sql-backed-key-value-store",
      "https://www.postgresql.org/docs/16/sql-insert.html",
      "https://www.postgresql.org/docs/16/functions-sequence.html",
      "https://www.postgresql.org/docs/16/functions-datetime.html",
      "https://www.postgresql.org/docs/16/transaction-iso.html",
      "https://www.postgresql.org/docs/16/datatype-json.html",
      "https://www.postgresql.org/docs/16/sql-select.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a key-value store on SQL\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "database-indexing": {
    "slug": "database-indexing",
    "title": "Database indexing",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "indexing"
    ],
    "summary": "An index maintains another path to stored rows so a query can avoid inspecting everything.",
    "previewHeading": "The core idea",
    "previewContinuation": "That path costs space and write work.",
    "sources": [
      "https://fanout.sh/system/archive/database-indexing",
      "https://fanout.sh/system/archive/database-indexing",
      "https://www.postgresql.org/docs/16/indexes-multicolumn.html",
      "https://www.postgresql.org/docs/16/indexes-index-only-scans.html",
      "https://www.postgresql.org/docs/16/indexes-partial.html",
      "https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html",
      "https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Database indexing\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "b-tree": {
    "slug": "b-tree",
    "title": "B-tree",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "indexing"
    ],
    "summary": "A B-tree keeps keys ordered while giving a lookup a short route to the relevant range.",
    "previewHeading": "The core idea",
    "previewContinuation": "Its nodes hold several keys and child pointers, so one node can rule out many parts of the index.",
    "sources": [
      "https://fanout.sh/system/archive/b-tree",
      "https://www.postgresql.org/docs/16/btree-implementation.html",
      "https://www.postgresql.org/docs/16/indexes-types.html",
      "https://www.postgresql.org/docs/16/sql-createindex.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"B-tree\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "query-planning": {
    "slug": "query-planning",
    "title": "Query planning",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "query-planning"
    ],
    "summary": "Query planning chooses how a database will produce a SQL result: where to read, when to filter, how to join, and whether to sort or reuse an existing order.",
    "previewHeading": "The core idea",
    "previewContinuation": "An index adds an option.",
    "sources": [
      "https://fanout.sh/system/archive/query-planning",
      "https://fanout.sh/system/archive/query-planning",
      "https://www.postgresql.org/docs/16/using-explain.html",
      "https://www.postgresql.org/docs/16/planner-stats.html",
      "https://www.postgresql.org/docs/16/runtime-config-resource.html",
      "https://www.postgresql.org/docs/16/parallel-plans.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Query planning\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "database-locking-and-isolation": {
    "slug": "database-locking-and-isolation",
    "title": "Database locking and isolation",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "transactions"
    ],
    "summary": "Isolation controls how concurrent transactions may affect one another.",
    "previewHeading": "The core idea",
    "previewContinuation": "Locks are one way to coordinate conflicting work.",
    "sources": [
      "https://fanout.sh/system/archive/database-locking-and-isolation",
      "https://fanout.sh/system/archive/database-locking-and-isolation",
      "https://www.postgresql.org/docs/16/transaction-iso.html",
      "https://www.postgresql.org/docs/16/explicit-locking.html",
      "https://www.postgresql.org/docs/16/sql-select.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Database locking and isolation\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "mvcc": {
    "slug": "mvcc",
    "title": "MVCC",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "transactions"
    ],
    "summary": "Multi-version concurrency control, or MVCC, keeps row versions so a reader can use the version visible to its snapshot while another transaction writes a newer one.",
    "previewHeading": "The core idea",
    "previewContinuation": "The database uses transaction state to decide visibility; it does not simply return the most recently written bytes.",
    "sources": [
      "https://fanout.sh/system/archive/mvcc",
      "https://www.postgresql.org/docs/16/mvcc-intro.html",
      "https://www.postgresql.org/docs/16/transaction-iso.html",
      "https://www.postgresql.org/docs/16/routine-vacuuming.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"MVCC\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "database-wal-and-recovery": {
    "slug": "database-wal-and-recovery",
    "title": "Database WAL and recovery",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "recovery"
    ],
    "summary": "A database acknowledges a change, then stops before every modified table page reaches storage.",
    "previewHeading": "The core idea",
    "previewContinuation": "How can the change survive?",
    "sources": [
      "https://fanout.sh/system/archive/database-wal-and-recovery",
      "https://fanout.sh/system/archive/database-wal-and-recovery",
      "https://www.postgresql.org/docs/16/wal-intro.html",
      "https://www.postgresql.org/docs/16/wal-configuration.html",
      "https://www.postgresql.org/docs/16/runtime-config-wal.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Database WAL and recovery\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "database-ticket-servers": {
    "slug": "database-ticket-servers",
    "title": "Database ticket servers",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "identifiers",
      "databases"
    ],
    "summary": "Study data modeling and SQL.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/",
      "https://tech.meituan.com/2017/04/21/mt-leaf.html",
      "https://dev.mysql.com/doc/refman/8.4/en/example-auto-increment.html",
      "https://www.sqlite.org/lang_transaction.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Database ticket servers\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "relational-database-scaling": {
    "slug": "relational-database-scaling",
    "title": "Relational database scaling",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "scaling"
    ],
    "summary": "Adding application workers can make a busy database slower: more requests compete for the same CPU, storage or locks.",
    "previewHeading": "The core idea",
    "previewContinuation": "Start by finding which operation is falling behind and which resource it waits for.",
    "sources": [
      "https://www.postgresql.org/docs/16/monitoring-stats.html",
      "https://www.pgbouncer.org/features.html",
      "https://www.postgresql.org/docs/16/warm-standby.html",
      "https://www.postgresql.org/docs/16/ddl-partitioning.html",
      "https://www.postgresql.org/docs/16/different-replication-solutions.html",
      "https://www.postgresql.org/docs/16/rules-materializedviews.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Relational database scaling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "online-indexing": {
    "slug": "online-indexing",
    "title": "Online indexing",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "migrations"
    ],
    "summary": "An index can make the catalog query cheaper once it exists.",
    "previewHeading": "The core idea",
    "previewContinuation": "Building it is another workload: PostgreSQL has to read the table while merchants keep changing products.",
    "sources": [
      "https://fanout.sh/system/archive/online-indexing",
      "https://fanout.sh/system/archive/online-indexing",
      "https://www.postgresql.org/docs/16/sql-createindex.html",
      "https://www.postgresql.org/docs/16/progress-reporting.html"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Online indexing\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "schema-evolution": {
    "slug": "schema-evolution",
    "title": "Schema evolution",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "migrations"
    ],
    "summary": "A column rename can work in a test and break the running application.",
    "previewHeading": "The core idea",
    "previewContinuation": "Old processes still send the old name while new processes expect its replacement.",
    "sources": [
      "https://fanout.sh/system/archive/schema-evolution",
      "https://fanout.sh/system/archive/schema-evolution",
      "https://fanout.sh/system/archive/schema-evolution",
      "https://www.postgresql.org/docs/16/sql-altertable.html",
      "https://www.postgresql.org/docs/16/sql-createtrigger.html",
      "https://martinfowler.com/bliki/ParallelChange.html",
      "https://fanout.sh/system/archive/schema-evolution"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Schema evolution\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "soft-delete": {
    "slug": "soft-delete",
    "title": "Soft delete",
    "kind": "lesson",
    "moduleNumber": "03",
    "moduleTitle": "Data modeling and SQL",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "databases",
      "data-retention"
    ],
    "summary": "A user deletes a project, then asks to restore it.",
    "previewHeading": "The core idea",
    "previewContinuation": "If the product promises undo, it needs to retain enough state to bring that project back.",
    "sources": [
      "https://www.postgresql.org/docs/16/indexes-partial.html",
      "https://www.postgresql.org/docs/16/ddl-constraints.html",
      "https://www.postgresql.org/docs/16/ddl-rowsecurity.html",
      "https://fanout.sh/system/archive/soft-delete"
    ],
    "diagram": "flowchart TD\n    Root[B+ Tree Root Page] --> Int1[Internal Page Range 1-50]\n    Root --> Int2[Internal Page Range 51-100]\n    Int1 --> L1[Leaf Node: 1..25]\n    Int1 --> L2[Leaf Node: 26..50]\n    L1 <-->|Doubly Linked List Chaining| L2\n    L2 <-->|Sequential Scan Pointer| L3[Leaf Node: 51..75]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Soft delete\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "nosql-decision-boundaries": {
    "slug": "nosql-decision-boundaries",
    "title": "NoSQL decision boundaries",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "databases",
      "data-modeling"
    ],
    "summary": "A catalog page reads a product and its specifications together.",
    "previewHeading": "The core idea",
    "previewContinuation": "Checkout changes inventory and creates an order.",
    "sources": [
      "https://fanout.sh/system/archive/nosql-decision-boundaries",
      "https://fanout.sh/system/archive/nosql-decision-boundaries",
      "https://www.mongodb.com/docs/manual/core/write-operations-atomicity/",
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
      "https://cassandra.apache.org/doc/stable/cassandra/developing/data-modeling/intro.html"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"NoSQL decision boundaries\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "document-vs-key-value-stores": {
    "slug": "document-vs-key-value-stores",
    "title": "Document vs key-value stores",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "databases",
      "documents"
    ],
    "summary": "A product page asks for product p7.",
    "previewHeading": "The core idea",
    "previewContinuation": "A filter page asks for all blue mugs.",
    "sources": [
      "https://fanout.sh/system/archive/document-vs-key-value-stores",
      "https://redis.io/docs/latest/develop/data-types/strings/",
      "https://www.mongodb.com/docs/manual/data-modeling/embedding/",
      "https://www.mongodb.com/docs/manual/data-modeling/referencing/",
      "https://www.mongodb.com/docs/manual/core/write-operations-atomicity/"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Document vs key-value stores\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "columnar-vs-wide-column-stores": {
    "slug": "columnar-vs-wide-column-stores",
    "title": "Columnar vs wide-column stores",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "databases",
      "analytics"
    ],
    "summary": "A report asks for total bytes across every channel.",
    "previewHeading": "The core idea",
    "previewContinuation": "A history panel asks for recent events in channel 7.",
    "sources": [
      "https://fanout.sh/system/archive/columnar-vs-wide-column-stores",
      "https://duckdb.org/docs/current/data/parquet/overview",
      "https://cassandra.apache.org/doc/stable/cassandra/developing/data-modeling/intro.html",
      "https://cassandra.apache.org/doc/stable/cassandra/developing/cql/ddl.html",
      "https://docs.cloud.google.com/bigtable/docs/overview"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Columnar vs wide-column stores\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "graph-database-decision-boundary": {
    "slug": "graph-database-decision-boundary",
    "title": "Graph database decision boundary",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "databases",
      "graphs"
    ],
    "summary": "Checking whether Ada follows Bo needs one relationship lookup.",
    "previewHeading": "The core idea",
    "previewContinuation": "Finding a path from Ada to Di may require following several relationships.",
    "sources": [
      "https://fanout.sh/system/archive/graph-database-decision-boundary",
      "https://www.postgresql.org/docs/16/queries-with.html",
      "https://www.sqlite.org/lang_with.html",
      "https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-paths/"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Graph database decision boundary\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "sharding-and-partitioning": {
    "slug": "sharding-and-partitioning",
    "title": "Sharding and partitioning",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "databases",
      "partitioning"
    ],
    "summary": "Sharding divides stored data across independently serving nodes.",
    "previewHeading": "The core idea",
    "previewContinuation": "A request that knows where its data lives can contact the right shard directly.",
    "sources": [
      "https://fanout.sh/system/archive/sharding-and-partitioning",
      "https://www.postgresql.org/docs/16/ddl-partitioning.html",
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html",
      "https://www.mongodb.com/docs/manual/core/sharding-balancer-administration/"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Sharding and partitioning\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "hot-partitions": {
    "slug": "hot-partitions",
    "title": "Hot partitions",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "partitioning",
      "overload"
    ],
    "summary": "A hot partition receives more work than its serving resources can comfortably handle.",
    "previewHeading": "The core idea",
    "previewContinuation": "Equal numbers of stored keys do not prevent it: one viral post, large tenant or busy time range can dominate the traffic.",
    "sources": [
      "https://fanout.sh/system/archive/hot-partitions",
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html",
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html",
      "https://docs.cloud.google.com/bigtable/docs/schema-design",
      "https://pkg.go.dev/golang.org/x/sync/singleflight"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Hot partitions\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "consistent-hashing": {
    "slug": "consistent-hashing",
    "title": "Consistent hashing",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "partitioning",
      "hashing"
    ],
    "summary": "Consistent hashing assigns keys to owners while limiting which assignments change when owners join or leave.",
    "previewHeading": "The core idea",
    "previewContinuation": "For a cache, unnecessary reassignment creates misses.",
    "sources": [
      "https://fanout.sh/system/archive/consistent-hashing",
      "https://people.csail.mit.edu/karger/Papers/web.pdf",
      "https://www.allthingsdistributed.com/2007/10/amazons_dynamo.html",
      "https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Consistent hashing\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "distributed-id-generation": {
    "slug": "distributed-id-generation",
    "title": "Distributed ID generation",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "identifiers",
      "correctness"
    ],
    "summary": "Distributed ID generation lets several writers create records that can later be distinguished in one shared system.",
    "previewHeading": "The core idea",
    "previewContinuation": "The writers need an allocation rule even if they store their records on separate shards.",
    "sources": [
      "https://fanout.sh/system/archive/distributed-id-generation",
      "https://fanout.sh/system/archive/distributed-id-generation",
      "https://www.rfc-editor.org/rfc/rfc9562.html",
      "https://www.postgresql.org/docs/16/functions-sequence.html",
      "https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Distributed ID generation\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "uuid-objectid-and-snowflake": {
    "slug": "uuid-objectid-and-snowflake",
    "title": "UUID, ObjectId, and Snowflake",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "identifiers",
      "data-modeling"
    ],
    "summary": "UUID, ObjectId and Snowflake-style IDs encode identity in different ways.",
    "previewHeading": "The core idea",
    "previewContinuation": "Their size, time fields and generation rules affect how writers create them and how databases store them.",
    "sources": [
      "https://fanout.sh/system/archive/uuid-objectid-and-snowflake",
      "https://www.rfc-editor.org/rfc/rfc9562.html",
      "https://www.mongodb.com/docs/manual/reference/bson-types/#objectid",
      "https://raw.githubusercontent.com/twitter-archive/snowflake/snowflake-2010/src/main/scala/com/twitter/service/snowflake/IdWorker.scala"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"UUID, ObjectId, and Snowflake\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "snowflake-id-design": {
    "slug": "snowflake-id-design",
    "title": "Snowflake ID design",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "identifiers",
      "clocks"
    ],
    "summary": "A Snowflake-style generator packs time, a worker identity and a sequence into one integer.",
    "previewHeading": "The core idea",
    "previewContinuation": "Assigned workers can generate locally, while the time prefix makes their values roughly sortable by generation time.",
    "sources": [
      "https://fanout.sh/system/archive/snowflake-id-design",
      "https://fanout.sh/system/archive/snowflake-id-design",
      "https://raw.githubusercontent.com/twitter-archive/snowflake/snowflake-2010/src/main/scala/com/twitter/service/snowflake/IdWorker.scala",
      "https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.max_safe_integer",
      "https://www.rfc-editor.org/rfc/rfc9562.html#section-6.3"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Snowflake ID design\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "clock-skew-and-id-ordering": {
    "slug": "clock-skew-and-id-ordering",
    "title": "Clock skew and ID ordering",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "clocks",
      "identifiers"
    ],
    "summary": "Study noSQL, partitioning and IDs.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/clock-skew-and-id-ordering",
      "https://fanout.sh/system/archive/clock-skew-and-id-ordering",
      "https://docs.python.org/3/library/time.html#time.monotonic",
      "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
      "https://www.rfc-editor.org/rfc/rfc9562.html#section-6.2",
      "https://www.postgresql.org/docs/16/functions-sequence.html"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Clock skew and ID ordering\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "keyset-pagination": {
    "slug": "keyset-pagination",
    "title": "Keyset pagination",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "relational-databases",
      "pagination"
    ],
    "summary": "Keyset pagination resumes a listing after the last item's ordering values.",
    "previewHeading": "The core idea",
    "previewContinuation": "It suits a feed or a “next page” interface where the caller already has a position to continue from.",
    "sources": [
      "https://fanout.sh/system/archive/keyset-pagination",
      "https://fanout.sh/system/archive/keyset-pagination",
      "https://www.postgresql.org/docs/16/queries-limit.html",
      "https://www.postgresql.org/docs/16/functions-comparisons.html",
      "https://www.postgresql.org/docs/16/indexes-ordering.html",
      "https://www.postgresql.org/docs/16/transaction-iso.html"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Keyset pagination\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "bloom-filters": {
    "slug": "bloom-filters",
    "title": "Bloom filters",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "data-structures",
      "probabilistic"
    ],
    "summary": "A Bloom filter is a compact membership summary that can rule out absent keys before an expensive lookup.",
    "previewHeading": "The core idea",
    "previewContinuation": "It answers either “definitely absent” or “possibly present”; a positive answer still needs confirmation when correctness requires exact membership.",
    "sources": [
      "https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf",
      "https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/",
      "https://fanout.sh/system/archive/bloom-filters"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Bloom filters\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "hot-cold-storage-archival": {
    "slug": "hot-cold-storage-archival",
    "title": "Hot and cold storage, archival",
    "kind": "lesson",
    "moduleNumber": "04",
    "moduleTitle": "NoSQL, partitioning and IDs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage",
      "archival"
    ],
    "summary": "Archival moves retained data to a storage path suited to infrequent access.",
    "previewHeading": "The core idea",
    "previewContinuation": "The application still needs to find and read it, even after the original copy is removed.",
    "sources": [
      "https://fanout.sh/system/archive/hot-cold-storage-archival",
      "https://fanout.sh/system/archive/hot-cold-storage-archival",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html",
      "https://www.postgresql.org/docs/16/functions-aggregate.html"
    ],
    "diagram": "flowchart LR\n    Key[Data Key: user_9824] --> Hash[MurmurHash3 / MD5]\n    Hash --> Ring{Consistent Hash Ring}\n    Ring -->|Node A: 0..2^31| Srv1[(VNode A1, A2)]\n    Ring -->|Node B: 2^31..2^32| Srv2[(VNode B1, B2)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Hot and cold storage, archival\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "caching-layers": {
    "slug": "caching-layers",
    "title": "Caching layers",
    "kind": "lesson",
    "moduleNumber": "05",
    "moduleTitle": "Caching and fast reads",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "caching",
      "architecture"
    ],
    "summary": "Place caches, keep their contents useful, and plan for misses and failures.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/caching-layers",
      "https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html",
      "https://dev.mysql.com/doc/refman/8.4/en/memory-storage-engine.html",
      "https://www.rfc-editor.org/rfc/rfc9111.html",
      "https://www.postgresql.org/docs/16/rules-materializedviews.html"
    ],
    "diagram": "sequenceDiagram\n    participant App as App Server\n    participant Cache as Redis Cache\n    participant DB as Postgres DB\n    App->>Cache: GET key:profile:42\n    alt Cache Hit\n        Cache-->>App: Return Cached JSON\n    else Cache Miss\n        Cache-->>App: null\n        App->>DB: Query primary row\n        DB-->>App: Row data\n        App->>Cache: SETEX key:profile:42 3600 data\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Caching layers\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "distributed-cache-design": {
    "slug": "distributed-cache-design",
    "title": "Distributed cache design",
    "kind": "lesson",
    "moduleNumber": "05",
    "moduleTitle": "Caching and fast reads",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "caching",
      "key-value"
    ],
    "summary": "A shared cache lets several application instances reuse the same copied answers.",
    "previewHeading": "The core idea",
    "previewContinuation": "A distributed cache spreads those answers across machines.",
    "sources": [
      "https://fanout.sh/system/archive/distributed-cache-design",
      "https://fanout.sh/system/archive/distributed-cache-design",
      "https://redis.io/docs/latest/commands/get/",
      "https://redis.io/docs/latest/commands/set/",
      "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/",
      "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/"
    ],
    "diagram": "sequenceDiagram\n    participant App as App Server\n    participant Cache as Redis Cache\n    participant DB as Postgres DB\n    App->>Cache: GET key:profile:42\n    alt Cache Hit\n        Cache-->>App: Return Cached JSON\n    else Cache Miss\n        Cache-->>App: null\n        App->>DB: Query primary row\n        DB-->>App: Row data\n        App->>Cache: SETEX key:profile:42 3600 data\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Distributed cache design\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "cache-eviction-policies": {
    "slug": "cache-eviction-policies",
    "title": "Cache eviction policies",
    "kind": "lesson",
    "moduleNumber": "05",
    "moduleTitle": "Caching and fast reads",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "caching",
      "eviction"
    ],
    "summary": "Eviction removes a cached item to make room for another.",
    "previewHeading": "The core idea",
    "previewContinuation": "The next request for the removed item must fetch it again, so the policy is making a prediction: which saved answer will be least useful next?",
    "sources": [
      "https://fanout.sh/system/archive/cache-eviction-policies",
      "https://redis.io/docs/latest/develop/reference/eviction/",
      "https://github.com/ben-manes/caffeine/wiki/Efficiency",
      "https://arxiv.org/abs/1512.00727"
    ],
    "diagram": "sequenceDiagram\n    participant App as App Server\n    participant Cache as Redis Cache\n    participant DB as Postgres DB\n    App->>Cache: GET key:profile:42\n    alt Cache Hit\n        Cache-->>App: Return Cached JSON\n    else Cache Miss\n        Cache-->>App: null\n        App->>DB: Query primary row\n        DB-->>App: Row data\n        App->>Cache: SETEX key:profile:42 3600 data\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Cache eviction policies\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "ttl-expiration-and-cache-reapers": {
    "slug": "ttl-expiration-and-cache-reapers",
    "title": "TTL expiration and cache reapers",
    "kind": "lesson",
    "moduleNumber": "05",
    "moduleTitle": "Caching and fast reads",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "caching",
      "expiration"
    ],
    "summary": "A time to live, or TTL, limits how long a cached entry may answer requests.",
    "previewHeading": "The core idea",
    "previewContinuation": "Expiration enforces that deadline.",
    "sources": [
      "https://fanout.sh/system/archive/ttl-expiration-and-cache-reapers",
      "https://redis.io/docs/latest/commands/expire/",
      "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/cache-validity.html",
      "https://netty.io/4.1/api/io/netty/util/HashedWheelTimer.html"
    ],
    "diagram": "sequenceDiagram\n    participant App as App Server\n    participant Cache as Redis Cache\n    participant DB as Postgres DB\n    App->>Cache: GET key:profile:42\n    alt Cache Hit\n        Cache-->>App: Return Cached JSON\n    else Cache Miss\n        Cache-->>App: null\n        App->>DB: Query primary row\n        DB-->>App: Row data\n        App->>Cache: SETEX key:profile:42 3600 data\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"TTL expiration and cache reapers\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "cache-concurrency-control": {
    "slug": "cache-concurrency-control",
    "title": "Cache concurrency control",
    "kind": "lesson",
    "moduleNumber": "05",
    "moduleTitle": "Caching and fast reads",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "caching",
      "concurrency"
    ],
    "summary": "Concurrent cache access raises two different problems: callers can duplicate the work of rebuilding a missing answer, and a delayed caller can overwrite a newer answer.",
    "previewHeading": "The core idea",
    "previewContinuation": "Making each cache command atomic does not automatically solve either problem.",
    "sources": [
      "https://fanout.sh/system/archive/cache-concurrency-control",
      "https://fanout.sh/system/archive/cache-concurrency-control",
      "https://docs.python.org/3.14/library/asyncio-task.html",
      "https://pkg.go.dev/golang.org/x/sync/singleflight",
      "https://redis.io/docs/latest/develop/using-commands/transactions/",
      "https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/"
    ],
    "diagram": "sequenceDiagram\n    participant App as App Server\n    participant Cache as Redis Cache\n    participant DB as Postgres DB\n    App->>Cache: GET key:profile:42\n    alt Cache Hit\n        Cache-->>App: Return Cached JSON\n    else Cache Miss\n        Cache-->>App: null\n        App->>DB: Query primary row\n        DB-->>App: Row data\n        App->>Cache: SETEX key:profile:42 3600 data\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Cache concurrency control\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "cache-availability-and-database-fallback": {
    "slug": "cache-availability-and-database-fallback",
    "title": "Cache availability and database fallback",
    "kind": "lesson",
    "moduleNumber": "05",
    "moduleTitle": "Caching and fast reads",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "caching",
      "availability"
    ],
    "summary": "A cache can be disposable without being safe to lose under load.",
    "previewHeading": "The core idea",
    "previewContinuation": "Its source may retain every record yet lack capacity to serve the reads that were previously cache hits.",
    "sources": [
      "https://fanout.sh/system/archive/cache-availability-and-database-fallback",
      "https://fanout.sh/system/archive/cache-availability-and-database-fallback",
      "https://fanout.sh/system/archive/cache-availability-and-database-fallback",
      "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
      "https://sre.google/sre-book/handling-overload/",
      "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/",
      "https://redis.io/docs/latest/operate/oss_and_stack/management/replication/"
    ],
    "diagram": "sequenceDiagram\n    participant App as App Server\n    participant Cache as Redis Cache\n    participant DB as Postgres DB\n    App->>Cache: GET key:profile:42\n    alt Cache Hit\n        Cache-->>App: Return Cached JSON\n    else Cache Miss\n        Cache-->>App: null\n        App->>DB: Query primary row\n        DB-->>App: Row data\n        App->>Cache: SETEX key:profile:42 3600 data\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Cache availability and database fallback\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "distributed-systems-foundations": {
    "slug": "distributed-systems-foundations",
    "title": "Distributed systems foundations",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "distributed-systems",
      "failure"
    ],
    "summary": "A distributed system coordinates work across machines through messages.",
    "previewHeading": "The core idea",
    "previewContinuation": "Splitting the work can add capacity or keep a service running when one machine fails.",
    "sources": [
      "https://fanout.sh/system/archive/distributed-systems-foundations",
      "https://d1.awsstatic.com/builderslibrary/pdfs/challenges-with-distributed-systems.pdf",
      "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
      "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Distributed systems foundations\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "consistency-models": {
    "slug": "consistency-models",
    "title": "Consistency models",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "consistency",
      "replication"
    ],
    "summary": "A consistency model defines which histories of reads and writes a system allows.",
    "previewHeading": "The core idea",
    "previewContinuation": "A saved change can be durable while another copy still answers with an older value.",
    "sources": [
      "https://fanout.sh/system/archive/consistency-models",
      "https://fanout.sh/system/archive/consistency-models",
      "https://www.cs.cmu.edu/~wing/publications/HerlihyWing90.pdf",
      "https://www.cs.cornell.edu/courses/cs734/2000FA/cached%20papers/SessionGuaranteesPDIS_1.html",
      "https://www.cs.princeton.edu/courses/archive/fall19/cos418/papers/cops.pdf",
      "https://www.postgresql.org/docs/16/transaction-iso.html",
      "https://jepsen.io/consistency/models/strong-serializable"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Consistency models\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "replication": {
    "slug": "replication",
    "title": "Replication",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "replication",
      "durability"
    ],
    "summary": "Replication maintains copies of data on multiple machines.",
    "previewHeading": "The core idea",
    "previewContinuation": "Those copies can support recovery, read capacity and nearby access.",
    "sources": [
      "https://fanout.sh/system/archive/replication",
      "https://www.postgresql.org/docs/16/warm-standby.html",
      "https://www.postgresql.org/docs/16/runtime-config-wal.html",
      "https://www.postgresql.org/docs/16/different-replication-solutions.html",
      "https://docs.ceph.com/en/latest/rados/operations/erasure-code/",
      "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Replication\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "cap-and-pacelc": {
    "slug": "cap-and-pacelc",
    "title": "CAP and PACELC",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "consistency",
      "partitions"
    ],
    "summary": "CAP describes a limit on replicated data: during a communication partition, a service cannot guarantee both linearizable reads and writes and a successful response to every request at every non-failing node.",
    "previewHeading": "The core idea",
    "previewContinuation": "PACELC adds a second question: what coordination cost do stronger guarantees impose while communication works?",
    "sources": [
      "https://fanout.sh/system/archive/cap-and-pacelc",
      "https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf",
      "https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf",
      "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"CAP and PACELC\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "clocks-and-ordering": {
    "slug": "clocks-and-ordering",
    "title": "Clocks and ordering",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "logical-clocks",
      "causality"
    ],
    "summary": "Distributed systems need several kinds of order.",
    "previewHeading": "The core idea",
    "previewContinuation": "Measuring how long a request took, identifying which edit incorporated another, and agreeing on the next accepted command are different jobs.",
    "sources": [
      "https://fanout.sh/system/archive/clocks-and-ordering",
      "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
      "https://pages.cs.wisc.edu/~ra/Classes/739-sp20/papers/mattern89.pdf",
      "https://docs.python.org/3/library/time.html",
      "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Clocks and ordering\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "consensus": {
    "slug": "consensus",
    "title": "Consensus",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "coordination"
    ],
    "summary": "Consensus lets a group agree on decisions despite some members failing.",
    "previewHeading": "The core idea",
    "previewContinuation": "For a replicated log, the useful promise is an accepted command history that a replacement leader must preserve.",
    "sources": [
      "https://raft.github.io/raft.pdf",
      "https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/",
      "https://etcd.io/docs/v3.6/learning/design-learner/",
      "https://github.com/etcd-io/raft",
      "https://fanout.sh/system/archive/consensus"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Consensus\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "leader-election": {
    "slug": "leader-election",
    "title": "Leader election",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "coordination"
    ],
    "summary": "Leader election chooses a node to coordinate work for a particular scope.",
    "previewHeading": "The core idea",
    "previewContinuation": "That might mean assigning jobs, owning a partition, leading replication, or updating metadata.",
    "sources": [
      "https://fanout.sh/system/archive/leader-election",
      "https://fanout.sh/system/archive/leader-election",
      "https://raft.github.io/raft.pdf",
      "https://d1.awsstatic.com/builderslibrary/pdfs/leader-election-in-distributed-systems.pdf",
      "https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/",
      "https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Leader election\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "distributed-locks-and-leases": {
    "slug": "distributed-locks-and-leases",
    "title": "Distributed locks and leases",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "coordination"
    ],
    "summary": "A distributed lock coordinates clients on different machines when a local mutex cannot protect their shared work.",
    "previewHeading": "The core idea",
    "previewContinuation": "Clients ask a lock manager for ownership of a named resource, then release that ownership when finished.",
    "sources": [
      "https://fanout.sh/system/archive/distributed-locks-and-leases",
      "https://fanout.sh/system/archive/distributed-locks-and-leases",
      "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
      "https://redis.io/docs/latest/commands/set/",
      "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/",
      "https://www.sqlite.org/isolation.html",
      "https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Distributed locks and leases\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "redis-redlock-and-fencing-tokens": {
    "slug": "redis-redlock-and-fencing-tokens",
    "title": "Redis Redlock and fencing tokens",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "coordination"
    ],
    "summary": "Redlock is a client-side algorithm that acquires an expiring lock across several independent Redis instances.",
    "previewHeading": "The core idea",
    "previewContinuation": "It combines a majority of successful acquisitions with a limit on how much time acquisition consumed.",
    "sources": [
      "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/",
      "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
      "https://antirez.com/news/101",
      "https://fanout.sh/system/archive/redis-redlock-and-fencing-tokens"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Redis Redlock and fencing tokens\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "circuit-breakers-and-timeouts": {
    "slug": "circuit-breakers-and-timeouts",
    "title": "Circuit breakers and timeouts",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "reliability",
      "admission"
    ],
    "summary": "A circuit breaker temporarily refuses calls to a dependency after observing enough failures.",
    "previewHeading": "The core idea",
    "previewContinuation": "It lets the caller stop spending resources on attempts that are likely to fail, then cautiously check for recovery.",
    "sources": [
      "https://fanout.sh/system/archive/circuit-breakers-and-timeouts",
      "https://fanout.sh/system/archive/circuit-breakers-and-timeouts",
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker",
      "https://resilience4j.readme.io/docs/circuitbreaker",
      "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
      "https://martinfowler.com/bliki/CircuitBreaker.html"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Circuit breakers and timeouts\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "gossip-protocol": {
    "slug": "gossip-protocol",
    "title": "Gossip protocol",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "coordination"
    ],
    "summary": "Gossip spreads information through repeated exchanges between peers.",
    "previewHeading": "The core idea",
    "previewContinuation": "A node tells a few others what it knows; they carry that information into later exchanges.",
    "sources": [
      "https://fanout.sh/system/archive/gossip-protocol",
      "https://fanout.sh/system/archive/gossip-protocol",
      "https://fanout.sh/system/archive/gossip-protocol",
      "https://www.cs.cornell.edu/projects/Quicksilver/public_pdfs/SWIM.pdf",
      "https://github.com/hashicorp/serf/blob/master/docs/internals/gossip.html.markdown",
      "https://developer.hashicorp.com/consul/docs/concept/gossip",
      "https://www.cis.upenn.edu/~bcpierce/courses/dd/papers/demers-epidemic.pdf"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Gossip protocol\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "metadata-service-and-node-discovery": {
    "slug": "metadata-service-and-node-discovery",
    "title": "Metadata service and node discovery",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "coordination"
    ],
    "summary": "A metadata service publishes information about a system's nodes and their assignments.",
    "previewHeading": "The core idea",
    "previewContinuation": "Clients use it to find where a request belongs without hardcoding every server address.",
    "sources": [
      "https://etcd.io/docs/v3.6/learning/api_guarantees/",
      "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/",
      "https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/",
      "https://kubernetes.io/docs/reference/using-api/api-concepts/",
      "https://fanout.sh/system/archive/metadata-service-and-node-discovery",
      "https://fanout.sh/system/archive/metadata-service-and-node-discovery",
      "https://fanout.sh/system/archive/metadata-service-and-node-discovery",
      "https://fanout.sh/system/archive/metadata-service-and-node-discovery"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Metadata service and node discovery\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "distributed-hash-tables": {
    "slug": "distributed-hash-tables",
    "title": "Distributed hash tables",
    "kind": "lesson",
    "moduleNumber": "06",
    "moduleTitle": "Distributed coordination",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "coordination"
    ],
    "summary": "A distributed hash table, or DHT, spreads key lookup across participating nodes.",
    "previewHeading": "The core idea",
    "previewContinuation": "A client can start with one known participant and discover the nodes responsible for a key without downloading the whole membership list.",
    "sources": [
      "https://pdos.csail.mit.edu/papers/chord:sigcomm01/chord_sigcomm.pdf",
      "https://cs.nyu.edu/~anirudh/CSCI-GA.2620-001/papers/kademlia.pdf",
      "https://bittorrent.org/beps/bep_0005.html",
      "https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/pastry.pdf",
      "https://fanout.sh/system/archive/distributed-hash-tables",
      "https://fanout.sh/system/archive/distributed-hash-tables"
    ],
    "diagram": "sequenceDiagram\n    participant ClientA as Worker A\n    participant Lock as Lock Service (etcd)\n    participant Storage as Shared Storage\n    ClientA->>Lock: Acquire Lease (Token = 34)\n    Lock-->>ClientA: Granted Token 34\n    Note over ClientA: GC Pause / Network Freeze\n    participant ClientB as Worker B\n    ClientB->>Lock: Lease Expired -> Acquire (Token = 35)\n    Lock-->>ClientB: Granted Token 35\n    ClientB->>Storage: Write(Token 35, Data B)\n    Storage-->>ClientB: Accepted (Highest Token: 35)\n    ClientA->>Storage: Delayed Write(Token 34, Data A)\n    Storage-->>ClientA: 409 Conflict: Stale Token 34 Rejected",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Distributed hash tables\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "storage-engine-design-constraints": {
    "slug": "storage-engine-design-constraints",
    "title": "Storage engine design constraints",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "A storage engine turns reads, writes and deletes into operations on stored bytes.",
    "previewHeading": "The core idea",
    "previewContinuation": "Its layout determines how much data each operation touches, what must fit in memory, and what can be recovered after a failure.",
    "sources": [
      "https://fanout.sh/system/archive/storage-engine-design-constraints",
      "https://fanout.sh/system/archive/storage-engine-design-constraints",
      "https://www.sqlite.org/fileformat.html",
      "https://www.sqlite.org/atomiccommit.html",
      "https://github.com/facebook/rocksdb/wiki/Memory-usage-in-RocksDB",
      "https://docs.python.org/3/library/os.html#os.fsync",
      "https://riak.com/assets/bitcask-intro.pdf"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Storage engine design constraints\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "storage-engine-tradeoffs": {
    "slug": "storage-engine-tradeoffs",
    "title": "Storage engine tradeoffs",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "Storage engines move work between reads, writes and maintenance.",
    "previewHeading": "The core idea",
    "previewContinuation": "Appending a replacement is simple, but leaves an old value to reclaim.",
    "sources": [
      "https://fanout.sh/system/archive/storage-engine-tradeoffs",
      "https://fanout.sh/system/archive/storage-engine-tradeoffs",
      "https://www.sqlite.org/fileformat.html",
      "https://www.sqlite.org/atomiccommit.html",
      "https://riak.com/assets/bitcask-intro.pdf",
      "https://github.com/facebook/rocksdb/wiki/Compaction"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Storage engine tradeoffs\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "file-backed-dictionary-storage-engine": {
    "slug": "file-backed-dictionary-storage-engine",
    "title": "A file-backed dictionary",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "Follow how databases and object stores organize, persist, and retrieve bytes.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/file-backed-dictionary-storage-engine",
      "https://docs.python.org/3/library/os.html",
      "https://man7.org/linux/man-pages/man2/fsync.2.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html",
      "https://docs.python.org/3/library/heapq.html#heapq.merge",
      "https://www.rfc-editor.org/rfc/rfc8259.html"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"A file-backed dictionary\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "custom-binary-file-format": {
    "slug": "custom-binary-file-format",
    "title": "Custom binary file format",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "A file format is an agreement between a writer and a reader about what each byte means.",
    "previewHeading": "The core idea",
    "previewContinuation": "For the dictionary, that agreement must let a reader find the index, locate a definition and reject bytes it cannot interpret safely.",
    "sources": [
      "https://fanout.sh/system/archive/custom-binary-file-format",
      "https://docs.python.org/3/library/struct.html",
      "https://github.com/google/leveldb/blob/main/doc/table_format.md",
      "https://www.rfc-editor.org/rfc/rfc8259.html"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Custom binary file format\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "byte-range-indexed-object-storage": {
    "slug": "byte-range-indexed-object-storage",
    "title": "Byte-range indexed object storage",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "Follow how databases and object stores organize, persist, and retrieve bytes.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/byte-range-indexed-object-storage",
      "https://fanout.sh/system/archive/byte-range-indexed-object-storage",
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html",
      "https://github.com/google/leveldb/blob/main/doc/table_format.md"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Byte-range indexed object storage\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "immutable-versioned-data-files": {
    "slug": "immutable-versioned-data-files",
    "title": "Immutable versioned data files",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "An index can point to the wrong value even when the file and offset are readable.",
    "previewHeading": "The core idea",
    "previewContinuation": "If a dictionary update lengthens an earlier definition, later values move.",
    "sources": [
      "https://fanout.sh/system/archive/immutable-versioned-data-files",
      "https://fanout.sh/system/archive/immutable-versioned-data-files",
      "https://github.com/facebook/rocksdb/wiki/MANIFEST",
      "https://github.com/facebook/rocksdb/wiki/Delete-Stale-Files",
      "https://docs.python.org/3/library/os.html",
      "https://cdn.kernel.org/doc/html/latest/RCU/rcu.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Immutable versioned data files\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "log-structured-storage": {
    "slug": "log-structured-storage",
    "title": "Log-structured storage",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "Replacing one value in a complete snapshot writes the other values again.",
    "previewHeading": "The core idea",
    "previewContinuation": "A log-structured store records the change at the end of a file instead, leaving earlier records untouched.",
    "sources": [
      "https://fanout.sh/system/archive/log-structured-storage",
      "https://fanout.sh/system/archive/log-structured-storage",
      "https://riak.com/assets/bitcask-intro.pdf",
      "https://github.com/google/leveldb/blob/main/doc/log_format.md",
      "https://github.com/google/leveldb/blob/main/doc/impl.md",
      "https://kafka.apache.org/41/design/design/"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Log-structured storage\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "bitcask-storage-engine": {
    "slug": "bitcask-storage-engine",
    "title": "Bitcask storage engine",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "An appended log contains b's old value and its replacement.",
    "previewHeading": "The core idea",
    "previewContinuation": "A current lookup needs only the replacement, so keep its location in memory and read those bytes directly.",
    "sources": [
      "https://fanout.sh/system/archive/bitcask-storage-engine",
      "https://fanout.sh/system/archive/bitcask-storage-engine",
      "https://riak.com/assets/bitcask-intro.pdf",
      "https://docs.riak.com/riak/kv/2.2.3/setup/planning/backend/bitcask/index.html",
      "https://github.com/google/leveldb/blob/main/doc/impl.md"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Bitcask storage engine\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "lsm-tree-storage-engine": {
    "slug": "lsm-tree-storage-engine",
    "title": "LSM-tree storage engine",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "Bitcask keeps a current location for every key in memory.",
    "previewHeading": "The core idea",
    "previewContinuation": "A log-structured merge tree, or LSM tree, instead buffers recent writes and organizes older keys in sorted files.",
    "sources": [
      "https://fanout.sh/system/archive/lsm-tree-storage-engine",
      "https://fanout.sh/system/archive/lsm-tree-storage-engine",
      "https://github.com/facebook/rocksdb/wiki/RocksDB-Overview",
      "https://github.com/facebook/rocksdb/wiki/MemTable",
      "https://github.com/google/leveldb/blob/main/doc/impl.md",
      "https://storage.googleapis.com/gweb-research2023-media/pubtools/4443.pdf"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"LSM-tree storage engine\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "memtable-wal-and-sstable": {
    "slug": "memtable-wal-and-sstable",
    "title": "Memtable, WAL, and SSTable",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "A memtable disappears when its process exits.",
    "previewHeading": "The core idea",
    "previewContinuation": "A write-ahead log preserves recent mutations for recovery, while an SSTable stores a sorted, immutable batch.",
    "sources": [
      "https://fanout.sh/system/archive/memtable-wal-and-sstable",
      "https://fanout.sh/system/archive/memtable-wal-and-sstable",
      "https://fanout.sh/system/archive/memtable-wal-and-sstable",
      "https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log-(WAL)",
      "https://github.com/facebook/rocksdb/wiki/MANIFEST",
      "https://github.com/facebook/rocksdb/wiki/MemTable",
      "https://github.com/google/leveldb/blob/main/doc/table_format.md",
      "https://storage.googleapis.com/gweb-research2023-media/pubtools/4443.pdf"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Memtable, WAL, and SSTable\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "lsm-read-path-bloom-and-sparse-index": {
    "slug": "lsm-read-path-bloom-and-sparse-index",
    "title": "LSM read path: Bloom filters and sparse index",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "A missing key can make an LSM reader search several files before answering.",
    "previewHeading": "The core idea",
    "previewContinuation": "Three pieces of metadata reduce that work: key bounds reject impossible files, a Bloom filter rejects many remaining misses, and a sparse index narrows the search inside a file.",
    "sources": [
      "https://fanout.sh/system/archive/lsm-read-path-bloom-and-sparse-index",
      "https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter",
      "https://github.com/google/leveldb/blob/main/doc/table_format.md",
      "https://github.com/facebook/rocksdb/wiki/Block-Cache"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"LSM read path: Bloom filters and sparse index\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "compaction-and-amplification": {
    "slug": "compaction-and-amplification",
    "title": "Compaction and amplification",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "Compaction merges immutable files while removing versions that readers no longer need.",
    "previewHeading": "The core idea",
    "previewContinuation": "It spends read and write work now to reduce the files, duplicates and deletion records retained afterward.",
    "sources": [
      "https://fanout.sh/system/archive/compaction-and-amplification",
      "https://github.com/google/leveldb/blob/main/doc/impl.md",
      "https://github.com/facebook/rocksdb/wiki/Leveled-Compaction",
      "https://github.com/facebook/rocksdb/wiki/Universal-Compaction",
      "https://github.com/facebook/rocksdb/wiki/Write-Stalls"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Compaction and amplification\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "object-storage-vs-database": {
    "slug": "object-storage-vs-database",
    "title": "Object storage vs database",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "Object storage gives callers named byte sequences to upload and retrieve from a bucket.",
    "previewHeading": "The core idea",
    "previewContinuation": "A database can give them indexed queries and transactions over related records.",
    "sources": [
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
      "https://www.postgresql.org/docs/18/datatype-binary.html",
      "https://www.postgresql.org/docs/18/tutorial-transactions.html",
      "https://fanout.sh/system/archive/object-storage-vs-database"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Object storage vs database\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "s3-object-storage-architecture": {
    "slug": "s3-object-storage-architecture",
    "title": "S3 object storage architecture",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "An object service accepts named bytes, makes accepted versions readable and keeps them available through its promised failures.",
    "previewHeading": "The core idea",
    "previewContinuation": "The difficult parts are deciding who owns each name, when a write becomes visible, and how stored bytes survive replacement of their servers.",
    "sources": [
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html",
      "https://sigops.org/s/conferences/sosp/2011/current/2011-Cascais/printable/11-calder.pdf",
      "https://fanout.sh/system/archive/s3-object-storage-architecture"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"S3 object storage architecture\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "range-partitioning-vs-consistent-hashing-storage": {
    "slug": "range-partitioning-vs-consistent-hashing-storage",
    "title": "Range partitioning vs consistent hashing for storage",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "An object read supplies one exact key.",
    "previewHeading": "The core idea",
    "previewContinuation": "A listing asks which keys exist under a prefix.",
    "sources": [
      "https://fanout.sh/system/archive/range-partitioning-vs-consistent-hashing-storage",
      "https://fanout.sh/system/archive/range-partitioning-vs-consistent-hashing-storage",
      "https://fanout.sh/system/archive/range-partitioning-vs-consistent-hashing-storage"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Range partitioning vs consistent hashing for storage\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "partition-manager-and-map-table": {
    "slug": "partition-manager-and-map-table",
    "title": "Partition manager and map table",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "Follow how databases and object stores organize, persist, and retrieve bytes.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/partition-manager-and-map-table",
      "https://fanout.sh/system/archive/partition-manager-and-map-table",
      "https://fanout.sh/system/archive/partition-manager-and-map-table",
      "https://fanout.sh/system/archive/partition-manager-and-map-table"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Partition manager and map table\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "metadata-db-for-object-storage": {
    "slug": "metadata-db-for-object-storage",
    "title": "Metadata database for object storage",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "An object store needs an authoritative record of which names exist and which bytes they identify.",
    "previewHeading": "The core idea",
    "previewContinuation": "Keeping that metadata in a database lets us list names, check access and publish changes without scanning the storage fleet.",
    "sources": [
      "https://fanout.sh/system/archive/metadata-db-for-object-storage",
      "https://fanout.sh/system/archive/metadata-db-for-object-storage",
      "https://fanout.sh/system/archive/metadata-db-for-object-storage",
      "https://www.sqlite.org/lang_transaction.html"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Metadata database for object storage\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "append-only-object-storage-stream-layer": {
    "slug": "append-only-object-storage-stream-layer",
    "title": "Append-only stream layer",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "A storage layer can group object records in larger files and append new bytes at the end.",
    "previewHeading": "The core idea",
    "previewContinuation": "This reduces scattered writes and per-file management, but moves work into indexing, sealing and reclaiming old data.",
    "sources": [
      "https://fanout.sh/system/archive/append-only-object-storage-stream-layer",
      "https://fanout.sh/system/archive/append-only-object-storage-stream-layer",
      "https://fanout.sh/system/archive/append-only-object-storage-stream-layer",
      "https://fanout.sh/system/archive/append-only-object-storage-stream-layer"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Append-only stream layer\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "object-storage-durability-and-replication": {
    "slug": "object-storage-durability-and-replication",
    "title": "Durability and replication",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "object-storage"
    ],
    "summary": "A successful write is a promise about what survives afterward.",
    "previewHeading": "The core idea",
    "previewContinuation": "State which failures that promise covers, then place and verify enough recoverable data to meet it.",
    "sources": [
      "https://fanout.sh/system/archive/object-storage-durability-and-replication",
      "https://fanout.sh/system/archive/object-storage-durability-and-replication",
      "https://fanout.sh/system/archive/object-storage-durability-and-replication",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html",
      "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/global-infrastructure.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Durability and replication\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "end-to-end-checksums": {
    "slug": "end-to-end-checksums",
    "title": "End-to-end checksums",
    "kind": "lesson",
    "moduleNumber": "07",
    "moduleTitle": "Storage engines",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "storage-engines"
    ],
    "summary": "Bytes can change while keeping their length and valid encoding.",
    "previewHeading": "The core idea",
    "previewContinuation": "A parser may accept them, and replication may faithfully copy them.",
    "sources": [
      "https://fanout.sh/system/archive/end-to-end-checksums",
      "https://fanout.sh/system/archive/end-to-end-checksums",
      "https://docs.python.org/3/library/zlib.html",
      "https://github.com/facebook/rocksdb/wiki/Full-File-Checksum-and-Checksum-Handoff"
    ],
    "diagram": "flowchart TD\n    Write[Write Request] --> WAL[Append-Only WAL on Disk]\n    Write --> Mem[In-Memory Memtable SkipList]\n    Mem -->|Flush when full| L0[Level 0 SSTable]\n    L0 -->|Leveled Compaction| L1[Level 1 SSTables]\n    L1 -->|Compaction| L2[Level 2 SSTables]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"End-to-end checksums\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "delegation-and-async-work": {
    "slug": "delegation-and-async-work",
    "title": "Delegation and async work",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "queues",
      "async"
    ],
    "summary": "An upload can finish before its thumbnail is ready.",
    "previewHeading": "The core idea",
    "previewContinuation": "A report request can be accepted before the report is calculated.",
    "sources": [
      "https://fanout.sh/system/archive/delegation-and-async-work",
      "https://www.rabbitmq.com/docs/confirms",
      "https://d1.awsstatic.com/builderslibrary/pdfs/avoiding-insurmountable-queue-backlogs.pdf",
      "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Delegation and async work\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "task-queue-vs-event-stream": {
    "slug": "task-queue-vs-event-stream",
    "title": "Task queue vs event stream",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "queues",
      "streams"
    ],
    "summary": "A report job needs a worker to finish it.",
    "previewHeading": "The core idea",
    "previewContinuation": "A published post may need search, analytics and notifications to react independently.",
    "sources": [
      "https://fanout.sh/system/archive/task-queue-vs-event-stream",
      "https://www.rabbitmq.com/docs/confirms",
      "https://kafka.apache.org/42/getting-started/introduction/",
      "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html",
      "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Task queue vs event stream\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "event-bus-for-product-events": {
    "slug": "event-bus-for-product-events",
    "title": "Event bus for product events",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "events",
      "outbox"
    ],
    "summary": "Publishing a post may trigger search indexing, image processing, notifications and analytics.",
    "previewHeading": "The core idea",
    "previewContinuation": "An event bus lets the product publish one fact while those consumers decide what to do with it.",
    "sources": [
      "https://fanout.sh/system/archive/event-bus-for-product-events",
      "https://fanout.sh/system/archive/event-bus-for-product-events",
      "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
      "https://kafka.apache.org/42/getting-started/introduction/",
      "https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Event bus for product events\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "queue-lag": {
    "slug": "queue-lag",
    "title": "Queue lag",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "queues",
      "backpressure"
    ],
    "summary": "Queue lag describes how far background work is behind.",
    "previewHeading": "The core idea",
    "previewContinuation": "A fast accepting API can hide a stalled notification or indexing pipeline.",
    "sources": [
      "https://fanout.sh/system/archive/queue-lag",
      "https://fanout.sh/system/archive/queue-lag",
      "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-available-cloudwatch-metrics.html",
      "https://d1.awsstatic.com/builderslibrary/pdfs/avoiding-insurmountable-queue-backlogs.pdf",
      "https://sre.google/workbook/implementing-slos/",
      "https://web.mit.edu/1.041/www/lectures/L3-cumulative-diagram-2026sp.pdf"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Queue lag\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "distributed-task-scheduler": {
    "slug": "distributed-task-scheduler",
    "title": "Distributed task scheduler",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "scheduling",
      "workflows"
    ],
    "summary": "A worker can finish every job it receives and still miss tonight's cleanup.",
    "previewHeading": "The core idea",
    "previewContinuation": "Someone must turn “run this later” into durable work, release it when due, and recover when a worker disappears.",
    "sources": [
      "https://fanout.sh/system/archive/distributed-task-scheduler",
      "https://fanout.sh/system/archive/distributed-task-scheduler",
      "https://www.sqlite.org/lang_transaction.html",
      "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/",
      "https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html",
      "https://www.postgresql.org/docs/16/sql-select.html"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Distributed task scheduler\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "postgres-skip-locked-work-queue": {
    "slug": "postgres-skip-locked-work-queue",
    "title": "Postgres SKIP LOCKED work queue",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "postgres",
      "queues"
    ],
    "summary": "A table can hold jobs beside the product data that creates them.",
    "previewHeading": "The core idea",
    "previewContinuation": "Several workers can then claim different rows, commit, and work independently.",
    "sources": [
      "https://fanout.sh/system/archive/postgres-skip-locked-work-queue",
      "https://fanout.sh/system/archive/postgres-skip-locked-work-queue",
      "https://www.postgresql.org/docs/16/sql-select.html",
      "https://www.postgresql.org/docs/16/explicit-locking.html",
      "https://www.postgresql.org/docs/16/routine-vacuuming.html"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Postgres SKIP LOCKED work queue\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "dag-workflow-orchestration": {
    "slug": "dag-workflow-orchestration",
    "title": "DAG workflow orchestration",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "workflows",
      "scheduling"
    ],
    "summary": "A document can be ready for processing while its publication step must wait.",
    "previewHeading": "The core idea",
    "previewContinuation": "You need both its rendered preview and its search record before showing it to readers, and either branch can fail independently.",
    "sources": [
      "https://fanout.sh/system/archive/dag-workflow-orchestration",
      "https://fanout.sh/system/archive/dag-workflow-orchestration",
      "https://fanout.sh/system/archive/dag-workflow-orchestration",
      "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
      "https://argo-workflows.readthedocs.io/en/latest/walk-through/dag/",
      "https://docs.aws.amazon.com/step-functions/latest/dg/state-parallel.html",
      "https://docs.temporal.io/workflow-execution"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"DAG workflow orchestration\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "rule-engine-trigger-framework": {
    "slug": "rule-engine-trigger-framework",
    "title": "Rule engine and trigger framework",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "workflows",
      "events"
    ],
    "summary": "Separate background work from requests and handle retries, ordering, and contention.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/rule-engine-trigger-framework",
      "https://fanout.sh/system/archive/rule-engine-trigger-framework",
      "https://fanout.sh/system/archive/rule-engine-trigger-framework",
      "https://www.openpolicyagent.org/docs/management-decision-logs",
      "https://jsonlogic.com/operations.html",
      "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Rule engine and trigger framework\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "fanout-patterns": {
    "slug": "fanout-patterns",
    "title": "Fanout patterns",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "fanout",
      "delivery"
    ],
    "summary": "An accepted publication can create work for several recipients, and those recipients can finish at different times.",
    "previewHeading": "The core idea",
    "previewContinuation": "Retrying the whole publication after one failure risks repeating work that already succeeded.",
    "sources": [
      "https://fanout.sh/system/archive/fanout-patterns",
      "https://fanout.sh/system/archive/fanout-patterns",
      "https://fanout.sh/system/archive/fanout-patterns",
      "https://redis.io/docs/latest/develop/pubsub/",
      "https://kafka.apache.org/42/getting-started/introduction/",
      "https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Fanout patterns\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "flash-sale-inventory-locking": {
    "slug": "flash-sale-inventory-locking",
    "title": "Flash sale inventory locking",
    "kind": "lesson",
    "moduleNumber": "08",
    "moduleTitle": "Async work and streams",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "inventory",
      "transactions"
    ],
    "summary": "Two shoppers can see the same last unit on a product page.",
    "previewHeading": "The core idea",
    "previewContinuation": "Their views can both be accurate when rendered, yet only one request may reserve that unit.",
    "sources": [
      "https://fanout.sh/system/archive/flash-sale-inventory-locking",
      "https://fanout.sh/system/archive/flash-sale-inventory-locking",
      "https://fanout.sh/system/archive/flash-sale-inventory-locking",
      "https://www.sqlite.org/lang_transaction.html",
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html",
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html",
      "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html",
      "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/"
    ],
    "diagram": "flowchart LR\n    App[Producer Service] --> Outbox[(Transactional Outbox Table)]\n    Outbox --> Debezium[CDC Reader / Debezium]\n    Debezium --> Kafka[Kafka Partition Log]\n    Kafka --> Cons1[Consumer Group 1: Notifications]\n    Kafka --> Cons2[Consumer Group 2: Analytics Lake]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Flash sale inventory locking\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "information-retrieval-system-design": {
    "slug": "information-retrieval-system-design",
    "title": "Information retrieval system design",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "A reader remembers a lesson about keeping copies near the people who use them, but cannot remember its title.",
    "previewHeading": "The core idea",
    "previewContinuation": "An exact identifier lookup gives you no way to answer that request.",
    "sources": [
      "https://nlp.stanford.edu/IR-book/html/htmledition/boolean-retrieval-1.html",
      "https://www.postgresql.org/docs/18/textsearch-intro.html",
      "https://www.elastic.co/docs/manage-data/data-store/text-analysis/index-search-analysis",
      "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-multi-match-query"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Information retrieval system design\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "inverted-index-and-posting-lists": {
    "slug": "inverted-index-and-posting-lists",
    "title": "Inverted index and posting lists",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "The previous query found possible documents without re-reading every sentence.",
    "previewHeading": "The core idea",
    "previewContinuation": "That shortcut needs something prepared in advance: for each searchable word, retain the identifiers of documents that contain it.",
    "sources": [
      "https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/positional-indexes-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/search-structures-for-dictionaries-1.html",
      "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/codecs/lucene103/Lucene103PostingsFormat.html",
      "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/index/IndexWriter.html",
      "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/util/fst/package-summary.html"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Inverted index and posting lists\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "boolean-tiered-search": {
    "slug": "boolean-tiered-search",
    "title": "Boolean and tiered search",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "Build indexes, process queries, and retrieve useful results.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://nlp.stanford.edu/IR-book/html/htmledition/processing-boolean-queries-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/positional-indexes-1.html",
      "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-match-query",
      "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-multi-match-query",
      "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-bool-query"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Boolean and tiered search\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "tf-idf-relevance-scoring": {
    "slug": "tf-idf-relevance-scoring",
    "title": "TF-IDF relevance scoring",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "Our candidate policy can admit several documents without deciding which one should appear first.",
    "previewHeading": "The core idea",
    "previewContinuation": "For cache index, every matching document in the fixture contains just one of those words.",
    "sources": [
      "https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/sublinear-tf-scaling-1.html"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"TF-IDF relevance scoring\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "bm25-production-ranking": {
    "slug": "bm25-production-ranking",
    "title": "BM25 production ranking",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "A document can repeat the same query word many times without becoming proportionally more useful.",
    "previewHeading": "The core idea",
    "previewContinuation": "Another document may mention the word once inside a much longer discussion.",
    "sources": [
      "https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables",
      "https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-explain",
      "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"BM25 production ranking\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "stop-words-and-champion-lists": {
    "slug": "stop-words-and-champion-lists",
    "title": "Stop words and champion lists",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "Build indexes, process queries, and retrieve useful results.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://nlp.stanford.edu/IR-book/html/htmledition/champion-lists-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/dropping-common-terms-stop-words-1.html",
      "https://www.elastic.co/docs/reference/text-analysis/analysis-stop-tokenfilter"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Stop words and champion lists\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "query-understanding-pipeline": {
    "slug": "query-understanding-pipeline",
    "title": "Query understanding pipeline",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "A reader types DB INDEX, while a document says database index.",
    "previewHeading": "The core idea",
    "previewContinuation": "Lowercasing fixes the capitals.",
    "sources": [
      "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-fuzzy-query",
      "https://www.elastic.co/docs/solutions/search/full-text/search-with-synonyms",
      "https://www.elastic.co/docs/reference/elasticsearch/plugins/analysis-phonetic"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Query understanding pipeline\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "search-feedback-and-relevance-signals": {
    "slug": "search-feedback-and-relevance-signals",
    "title": "Search feedback and relevance signals",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "A click tells you that a result was chosen from what the reader encountered.",
    "previewHeading": "The core idea",
    "previewContinuation": "It does not tell you what they would have chosen under another ordering, or whether the destination answered their question.",
    "sources": [
      "https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf",
      "https://nlp.stanford.edu/IR-book/html/htmledition/pagerank-1.html",
      "https://docs.vespa.ai/en/learn/tutorials/hybrid-search.html"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Search feedback and relevance signals\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "search-evaluation-metrics": {
    "slug": "search-evaluation-metrics",
    "title": "Search evaluation metrics",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search"
    ],
    "summary": "The BM25 ordering moved d8 ahead of d5 for index.",
    "previewHeading": "The core idea",
    "previewContinuation": "That change becomes an improvement only after we say what the reader wanted and how useful each document is for that need.",
    "sources": [
      "https://nlp.stanford.edu/IR-book/html/htmledition/information-retrieval-system-evaluation-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/assessing-relevance-1.html",
      "https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Search evaluation metrics\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "search-index-synchronization": {
    "slug": "search-index-synchronization",
    "title": "Search index synchronization",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "consistency"
    ],
    "summary": "You correct a document, save it, and search for the corrected word.",
    "previewHeading": "The core idea",
    "previewContinuation": "The document page shows your edit while the results still reflect its earlier text.",
    "sources": [
      "https://fanout.sh/system/archive/search-index-synchronization",
      "https://fanout.sh/system/archive/search-index-synchronization",
      "https://fanout.sh/system/archive/search-index-synchronization",
      "https://www.sqlite.org/lang_transaction.html",
      "https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html",
      "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/refresh-parameter"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Search index synchronization\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "search-index-sharding": {
    "slug": "search-index-sharding",
    "title": "Search index sharding",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "partitioning"
    ],
    "summary": "A result near the top of one machine's list may sit below another machine's best matches.",
    "previewHeading": "The core idea",
    "previewContinuation": "Dividing documents among owners therefore creates a second job: assembling one ranked answer from their contributions.",
    "sources": [
      "https://fanout.sh/system/archive/search-index-sharding",
      "https://fanout.sh/system/archive/search-index-sharding",
      "https://fanout.sh/system/archive/search-index-sharding",
      "https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-search",
      "https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards",
      "https://research.google/pubs/the-tail-at-scale/",
      "https://ying-zhang.cn/cluster/2013-tail-at-scale.html"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Search index sharding\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "crawler-and-indexing-pipeline": {
    "slug": "crawler-and-indexing-pipeline",
    "title": "Crawler and indexing pipeline",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "ingestion"
    ],
    "summary": "A document can exist without anyone telling your search service that it exists.",
    "previewHeading": "The core idea",
    "previewContinuation": "A link from a known page may be your first clue.",
    "sources": [
      "https://fanout.sh/system/archive/crawler-and-indexing-pipeline",
      "https://fanout.sh/system/archive/crawler-and-indexing-pipeline",
      "https://www.rfc-editor.org/rfc/rfc9309.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/crawler-architecture-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/the-url-frontier-1.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Crawler and indexing pipeline\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "vector-search-and-hybrid-retrieval": {
    "slug": "vector-search-and-hybrid-retrieval",
    "title": "Vector search and hybrid retrieval",
    "kind": "lesson",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "ranking"
    ],
    "summary": "Two documents can describe related work while using different words.",
    "previewHeading": "The core idea",
    "previewContinuation": "You can build another candidate path that compares a numerical representation of those documents, then combine its results with exact term matches.",
    "sources": [
      "https://fanout.sh/system/archive/vector-search-and-hybrid-retrieval",
      "https://fanout.sh/system/archive/vector-search-and-hybrid-retrieval",
      "https://fanout.sh/system/archive/vector-search-and-hybrid-retrieval",
      "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion",
      "https://github.com/facebookresearch/faiss/wiki/Faiss-indexes",
      "https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html",
      "https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Vector search and hybrid retrieval\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "autocomplete-system-design": {
    "slug": "autocomplete-system-design",
    "title": "Design: autocomplete",
    "kind": "design",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "autocomplete"
    ],
    "summary": "Autocomplete returns a short list of useful completions while someone types.",
    "previewHeading": "The core idea",
    "previewContinuation": "We will design it for a shop: typing cam should offer products such as a camera or camera bag, and choosing a suggestion should open that product.",
    "sources": [
      "https://www.greatfrontend.com/interviews/study/openai/questions/system-design/autocomplete",
      "https://engineering.fb.com/2010/05/17/web/the-life-of-a-typeahead-query/",
      "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-suggesters",
      "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
      "https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort",
      "https://fanout.sh/system/archive/autocomplete-system-design",
      "https://fanout.sh/system/archive/autocomplete-system-design"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: autocomplete\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "did-you-mean-and-spell-correction": {
    "slug": "did-you-mean-and-spell-correction",
    "title": "Design: did-you-mean and spell correction",
    "kind": "design",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "spelling"
    ],
    "summary": "You search for cach, and the results do not include the document you expected.",
    "previewHeading": "The core idea",
    "previewContinuation": "Offering cache may help, but automatically replacing every unfamiliar word would also damage valid names and identifiers.",
    "sources": [
      "https://fanout.sh/system/archive/did-you-mean-and-spell-correction",
      "https://fanout.sh/system/archive/did-you-mean-and-spell-correction",
      "https://fanout.sh/system/archive/did-you-mean-and-spell-correction",
      "https://fanout.sh/system/archive/did-you-mean-and-spell-correction",
      "https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/implementing-spelling-correction-1.html",
      "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-suggesters",
      "https://nlp.stanford.edu/IR-book/html/htmledition/context-sensitive-spelling-correction-1.html",
      "https://nlp.stanford.edu/IR-book/html/htmledition/k-gram-indexes-for-spelling-correction-1.html"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: did-you-mean and spell correction\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "related-searches": {
    "slug": "related-searches",
    "title": "Design: related searches",
    "kind": "design",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "suggestions"
    ],
    "summary": "Someone has searched for cache and may want to investigate eviction next.",
    "previewHeading": "The core idea",
    "previewContinuation": "That suggestion changes the topic of the next query rather than repairing the spelling of the first.",
    "sources": [
      "https://fanout.sh/system/archive/related-searches",
      "https://fanout.sh/system/archive/related-searches",
      "https://fanout.sh/system/archive/related-searches",
      "https://fanout.sh/system/archive/related-searches",
      "https://blog.google/products-and-platforms/products/search/how-we-keep-google-search-relevant-and-useful/",
      "https://chato.cl/papers/boldi_2009_query_recommendations.pdf",
      "https://www.microsoft.com/en-us/research/publication/query-suggestion-using-hitting-time/",
      "https://arxiv.org/abs/2108.04452"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: related searches\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "recent-searches-system-design": {
    "slug": "recent-searches-system-design",
    "title": "Design: recent searches",
    "kind": "design",
    "moduleNumber": "09",
    "moduleTitle": "Search and retrieval",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "search",
      "history"
    ],
    "summary": "You open a search box on another device and expect to find the query you used earlier.",
    "previewHeading": "The core idea",
    "previewContinuation": "You also expect a query you deleted to stay out of that list.",
    "sources": [
      "https://fanout.sh/system/archive/recent-searches-system-design",
      "https://fanout.sh/system/archive/recent-searches-system-design",
      "https://fanout.sh/system/archive/recent-searches-system-design",
      "https://fanout.sh/system/archive/recent-searches-system-design",
      "https://fanout.sh/system/archive/recent-searches-system-design",
      "https://support.google.com/websearch/answer/6096136?co=GENIE.Platform%3DAndroid&hl=en",
      "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
      "https://redis.io/docs/latest/commands/zrange/",
      "https://redis.io/docs/latest/develop/programmability/eval-intro/"
    ],
    "diagram": "flowchart LR\n    Doc[Document Stream] --> Tokenizer[Analyzer & Tokenizer]\n    Tokenizer --> Posting[Posting Lists: Term -> [DocID, TF]]\n    Query[User Query] --> TermMatch[Boolean / WAND Intersection]\n    Posting --> TermMatch\n    TermMatch --> BM25[BM25 Scoring & Top-K Heap]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: recent searches\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "counting-at-scale": {
    "slug": "counting-at-scale",
    "title": "Counting at scale",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "analytics",
      "counters"
    ],
    "summary": "A like count is a projection of facts: which accounts currently like a post.",
    "previewHeading": "The core idea",
    "previewContinuation": "A view count may instead count qualifying visits, including repeated visits by one account.",
    "sources": [
      "https://www.sqlite.org/lang_transaction.html",
      "https://sqlite.org/lang_upsert.html",
      "https://firebase.google.com/docs/firestore/solutions/counters",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/",
      "https://fanout.sh/system/archive/counting-at-scale",
      "https://fanout.sh/system/archive/counting-at-scale"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Counting at scale\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "view-counting-at-scale": {
    "slug": "view-counting-at-scale",
    "title": "View counting at scale",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "analytics",
      "events"
    ],
    "summary": "A view counter turns client observations into a product metric.",
    "previewHeading": "The core idea",
    "previewContinuation": "Starting a video, watching for a chosen duration and finishing it are different events.",
    "sources": [
      "https://fanout.sh/system/archive/view-counting-at-scale",
      "https://fanout.sh/system/archive/view-counting-at-scale",
      "https://www.sqlite.org/lang_transaction.html",
      "https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/stateful-stream-processing/",
      "https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/",
      "https://support.google.com/youtube/answer/2991785?hl=en",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"View counting at scale\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "impression-counting-system-design": {
    "slug": "impression-counting-system-design",
    "title": "Impression counting",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "analytics",
      "impressions"
    ],
    "summary": "An impression records an exposure under a stated rule.",
    "previewHeading": "The core idea",
    "previewContinuation": "It does not necessarily mean a unique person: one account can see an item in several displays.",
    "sources": [
      "https://www.w3.org/TR/intersection-observer/",
      "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API/Timing_element_visibility",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/",
      "https://redis.io/docs/latest/commands/pfmerge/",
      "https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/",
      "https://fanout.sh/system/archive/impression-counting-system-design",
      "https://fanout.sh/system/archive/impression-counting-system-design"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Impression counting\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "hyperloglog-cardinality-estimation": {
    "slug": "hyperloglog-cardinality-estimation",
    "title": "HyperLogLog cardinality estimation",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "probabilistic-structures"
    ],
    "summary": "Repeated arrivals can increase an event counter without increasing the number of distinct identities.",
    "previewHeading": "The core idea",
    "previewContinuation": "An exact set handles that distinction by keeping the identities and counting its entries.",
    "sources": [
      "https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/",
      "https://datasketches.apache.org/docs/HLL/HllSketches.html",
      "https://fanout.sh/system/archive/hyperloglog-cardinality-estimation"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"HyperLogLog cardinality estimation\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "mergeable-sketches-for-analytics": {
    "slug": "mergeable-sketches-for-analytics",
    "title": "Mergeable sketches for analytics",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "probabilistic-structures"
    ],
    "summary": "Aggregate events and use compact data structures when exact answers cost too much.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf",
      "https://github.com/CamDavidsonPilon/tdigest",
      "https://datasketches.apache.org/docs/Architecture/KeyFeatures.html",
      "https://datasketches.apache.org/docs/HLL/HllSketches.html",
      "https://roaringbitmap.org/",
      "https://fanout.sh/system/archive/mergeable-sketches-for-analytics"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Mergeable sketches for analytics\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "bucketed-time-window-aggregation": {
    "slug": "bucketed-time-window-aggregation",
    "title": "Bucketed time-window aggregation",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "analytics",
      "windows"
    ],
    "summary": "Time buckets make a continuing stream queryable: a report asks for a bounded interval and combines the groups that cover it.",
    "previewHeading": "The core idea",
    "previewContinuation": "Bucket width controls both the detail available to the query and the amount of state to retain.",
    "sources": [
      "https://beam.apache.org/documentation/programming-guide/",
      "https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/event-time/generating_watermarks/",
      "https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/",
      "https://fanout.sh/system/archive/bucketed-time-window-aggregation",
      "https://fanout.sh/system/archive/bucketed-time-window-aggregation"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Bucketed time-window aggregation\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "raw-events-vs-derived-analytics": {
    "slug": "raw-events-vs-derived-analytics",
    "title": "Raw events vs derived analytics",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "analytics",
      "recovery"
    ],
    "summary": "A dashboard says an ad received four impressions.",
    "previewHeading": "The core idea",
    "previewContinuation": "Tomorrow, a fraud rule excludes two of them.",
    "sources": [
      "https://kafka.apache.org/41/design/design/",
      "https://www.sqlite.org/lang_transaction.html",
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing",
      "https://fanout.sh/system/archive/raw-events-vs-derived-analytics",
      "https://fanout.sh/system/archive/raw-events-vs-derived-analytics"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Raw events vs derived analytics\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "count-min-sketch": {
    "slug": "count-min-sketch",
    "title": "Count-min sketch",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "probabilistic-structures"
    ],
    "summary": "A service tracking search queries or cache keys can see too many distinct keys to keep an exact count for each.",
    "previewHeading": "The core idea",
    "previewContinuation": "A count-min sketch shares a fixed number of counters across keys and answers approximate frequency queries.",
    "sources": [
      "https://www.cs.ox.ac.uk/people/graham.cormode/pubs/papers/cm-latin.pdf",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/",
      "https://apache.github.io/datasketches-python/main/frequency/count_min_sketch.html",
      "https://fanout.sh/system/archive/count-min-sketch"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Count-min sketch\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "top-k-heavy-hitters": {
    "slug": "top-k-heavy-hitters",
    "title": "Top-k heavy hitters",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "probabilistic-structures"
    ],
    "summary": "“How often did this query occur?",
    "previewHeading": "The core idea",
    "previewContinuation": "” starts with an identity.",
    "sources": [
      "https://www.cs.utexas.edu/~misra/scannedPdf.dir/FindRepeatedElements.pdf",
      "https://www.cs.ucsb.edu/sites/default/files/documents/2005-23.pdf",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/top-k/",
      "https://fanout.sh/system/archive/top-k-heavy-hitters"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Top-k heavy hitters\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "reservoir-sampling": {
    "slug": "reservoir-sampling",
    "title": "Reservoir sampling",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "probabilistic-structures"
    ],
    "summary": "You want a few hundred requests to inspect from a stream that may contain millions.",
    "previewHeading": "The core idea",
    "previewContinuation": "Keeping the first few hundred mostly tells you what happened when collection began.",
    "sources": [
      "https://www.cs.umd.edu/~samir/498/vitter.pdf",
      "https://datasketches.apache.org/docs/Sampling/ReservoirSamplingSketches.html",
      "https://fanout.sh/system/archive/reservoir-sampling"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Reservoir sampling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "tdigest-quantile-sketch": {
    "slug": "tdigest-quantile-sketch",
    "title": "t-digest quantile sketch",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "probabilistic-structures"
    ],
    "summary": "Aggregate events and use compact data structures when exact answers cost too much.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://arxiv.org/pdf/1902.04023",
      "https://github.com/tdunning/t-digest",
      "https://pypi.org/project/tdigest/0.5.2.2/",
      "https://github.com/CamDavidsonPilon/tdigest",
      "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"t-digest quantile sketch\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "streaming-percentile-analytics": {
    "slug": "streaming-percentile-analytics",
    "title": "Streaming percentile analytics",
    "kind": "lesson",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "analytics",
      "quantiles"
    ],
    "summary": "A checkout dashboard needs p50, p95 and p99 across all service instances for the last five minutes.",
    "previewHeading": "The core idea",
    "previewContinuation": "Each instance can summarize its durations locally, but sending its p99 alone loses information the combined query needs.",
    "sources": [
      "https://github.com/CamDavidsonPilon/tdigest",
      "https://prometheus.io/docs/practices/histograms/",
      "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/",
      "https://fanout.sh/system/archive/streaming-percentile-analytics",
      "https://fanout.sh/system/archive/streaming-percentile-analytics"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Streaming percentile analytics\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "live-reactions-high-throughput-design": {
    "slug": "live-reactions-high-throughput-design",
    "title": "Design: live reactions at high throughput",
    "kind": "design",
    "moduleNumber": "10",
    "moduleTitle": "Analytics and sketches",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "analytics",
      "reactions",
      "design"
    ],
    "summary": "A goal is scored during a livestream.",
    "previewHeading": "The core idea",
    "previewContinuation": "Thousands of viewers tap the heart button at once.",
    "sources": [
      "https://ably.com/blog/making-fan-experiences-economically-viable",
      "https://slack.engineering/real-time-messaging/",
      "https://redis.io/docs/latest/develop/pubsub/",
      "https://www.sqlite.org/lang_transaction.html",
      "https://docs.python.org/3/library/http.server.html",
      "https://fanout.sh/system/archive/live-reactions-high-throughput-design",
      "https://fanout.sh/system/archive/live-reactions-high-throughput-design"
    ],
    "diagram": "flowchart LR\n    Stream[1M Events / sec] --> HLL[HyperLogLog 12KB Bit Register]\n    Stream --> CMS[Count-Min Sketch 2D Hash Array]\n    Stream --> TDigest[t-Digest Quantile Centroids]\n    HLL --> Card[Unique Visitor Count ~0.81% error]\n    CMS --> TopK[Top-K Trending Hashtags]\n    TDigest --> P99[Accurate p99.9 Tail Latency]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: live reactions at high throughput\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "realtime-database-and-websocket-scaling": {
    "slug": "realtime-database-and-websocket-scaling",
    "title": "Realtime database and WebSocket scaling",
    "kind": "lesson",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "realtime",
      "recovery"
    ],
    "summary": "Ada posts a message through server A.",
    "previewHeading": "The core idea",
    "previewContinuation": "Bo is connected to server B.",
    "sources": [
      "https://fanout.sh/system/archive/realtime-database-and-websocket-scaling",
      "https://fanout.sh/system/archive/realtime-database-and-websocket-scaling",
      "https://redis.io/docs/latest/develop/pubsub/",
      "https://socket.io/docs/v4/redis-adapter/",
      "https://socket.io/docs/v4/using-multiple-nodes/",
      "https://www.postgresql.org/docs/current/logicaldecoding-explanation.html",
      "https://www.sqlite.org/lang_transaction.html"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Realtime database and WebSocket scaling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "websockets-vs-sse-vs-long-polling": {
    "slug": "websockets-vs-sse-vs-long-polling",
    "title": "WebSockets vs SSE vs long polling",
    "kind": "lesson",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "realtime",
      "transport"
    ],
    "summary": "A build log receives new lines.",
    "previewHeading": "The core idea",
    "previewContinuation": "A shared drawing sends cursor movements in both directions.",
    "sources": [
      "https://fanout.sh/system/archive/websockets-vs-sse-vs-long-polling",
      "https://html.spec.whatwg.org/multipage/server-sent-events.html",
      "https://www.rfc-editor.org/rfc/rfc6202",
      "https://www.rfc-editor.org/rfc/rfc6455",
      "https://websockets.spec.whatwg.org/",
      "https://websockets.readthedocs.io/en/15.0.1/reference/sync/server.html",
      "https://websockets.readthedocs.io/en/15.0.1/reference/sync/client.html"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"WebSockets vs SSE vs long polling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "social-network-database-modeling": {
    "slug": "social-network-database-modeling",
    "title": "Social network database modeling",
    "kind": "lesson",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "social",
      "data-modeling"
    ],
    "summary": "Bo changes his display name after publishing a post.",
    "previewHeading": "The core idea",
    "previewContinuation": "Ada should still follow the same account, the post should still have the same author, and its existing reactions should remain attached.",
    "sources": [
      "https://www.sqlite.org/foreignkeys.html",
      "https://www.sqlite.org/queryplanner.html",
      "https://www.sqlite.org/lang_transaction.html",
      "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
      "https://www.greatfrontend.com/questions/system-design/news-feed-facebook",
      "https://fanout.sh/system/archive/social-network-database-modeling"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Social network database modeling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "social-graph-follows-and-flockdb": {
    "slug": "social-graph-follows-and-flockdb",
    "title": "Social graph: follows and FlockDB",
    "kind": "lesson",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "social",
      "graphs"
    ],
    "summary": "Deliver live updates, messages, and feeds under changing load.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/social-graph-follows-and-flockdb",
      "https://blog.x.com/engineering/en_us/a/2010/introducing-flockdb",
      "https://github.com/twitter-archive/flockdb",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.sqlite.org/rowvalue.html",
      "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Social graph: follows and FlockDB\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "feed-generation-push-pull-hybrid": {
    "slug": "feed-generation-push-pull-hybrid",
    "title": "Feed generation: push, pull, hybrid",
    "kind": "lesson",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "social",
      "feeds"
    ],
    "summary": "A home feed collects posts for one viewer.",
    "previewHeading": "The core idea",
    "previewContinuation": "The follow graph tells us which authors matter; feed generation decides when to collect their posts.",
    "sources": [
      "https://fanout.sh/system/archive/feed-generation-push-pull-hybrid",
      "https://fanout.sh/system/archive/feed-generation-push-pull-hybrid",
      "https://fanout.sh/system/archive/feed-generation-push-pull-hybrid",
      "https://www.linkedin.com/blog/engineering/feed/followfeed-linkedin-s-feed-made-faster-and-smarter",
      "https://blog.x.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale",
      "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Feed generation: push, pull, hybrid\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "newly-unread-indicator": {
    "slug": "newly-unread-indicator",
    "title": "Design: a newly-unread indicator",
    "kind": "design",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "social",
      "messaging"
    ],
    "summary": "Deliver live updates, messages, and feeds under changing load.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://slack.com/help/articles/226410907-View-all-your-unread-messages",
      "https://www.sqlite.org/lang_transaction.html",
      "https://redis.io/docs/latest/commands/zadd/",
      "https://redis.io/docs/latest/commands/zcount/",
      "https://fanout.sh/system/archive/newly-unread-indicator",
      "https://fanout.sh/system/archive/newly-unread-indicator"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a newly-unread indicator\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "hashtag-extraction-and-tag-store": {
    "slug": "hashtag-extraction-and-tag-store",
    "title": "Hashtag extraction and tag store",
    "kind": "lesson",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "social",
      "indexing"
    ],
    "summary": "A hashtag connects a piece of caption text to a page of matching posts.",
    "previewHeading": "The core idea",
    "previewContinuation": "Recognizing Cache is the first step.",
    "sources": [
      "https://fanout.sh/system/archive/hashtag-extraction-and-tag-store",
      "https://fanout.sh/system/archive/hashtag-extraction-and-tag-store",
      "https://fanout.sh/system/archive/hashtag-extraction-and-tag-store",
      "https://www.unicode.org/reports/tr31/",
      "https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html",
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html",
      "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Hashtag extraction and tag store\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "reaction-modeling": {
    "slug": "reaction-modeling",
    "title": "Reaction modeling",
    "kind": "lesson",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "social",
      "reactions"
    ],
    "summary": "A reaction can represent an account's current choice on a post, several selected emoji, or a stream of taps.",
    "previewHeading": "The core idea",
    "previewContinuation": "Those are different products.",
    "sources": [
      "https://fanout.sh/system/archive/reaction-modeling",
      "https://fanout.sh/system/archive/reaction-modeling",
      "https://www.sqlite.org/lang_transaction.html",
      "https://docs.slack.dev/reference/methods/reactions.add/",
      "https://www.mongodb.com/docs/manual/reference/operator/update/addtoset/",
      "https://www.mongodb.com/docs/v8.0/data-modeling/design-antipatterns/unbounded-arrays/",
      "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Reaction modeling\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "photo-tagging-coordinate-model": {
    "slug": "photo-tagging-coordinate-model",
    "title": "Design: photo tagging coordinates",
    "kind": "design",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "social",
      "images"
    ],
    "summary": "Deliver live updates, messages, and feeds under changing load.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://www.flickr.com/services/api/flickr.photos.people.add.html",
      "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit",
      "https://www.w3.org/TR/media-frags/#naming-space",
      "https://fanout.sh/system/archive/photo-tagging-coordinate-model",
      "https://fanout.sh/system/archive/photo-tagging-coordinate-model"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: photo tagging coordinates\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "live-commentary-system-design": {
    "slug": "live-commentary-system-design",
    "title": "Design: live commentary",
    "kind": "design",
    "moduleNumber": "11",
    "moduleTitle": "Realtime, social and feeds",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "realtime",
      "commentary"
    ],
    "summary": "Live commentary lets a few writers publish updates to a much larger audience.",
    "previewHeading": "The core idea",
    "previewContinuation": "Most readers want the newest page; some scroll back through the match.",
    "sources": [
      "https://fanout.sh/system/archive/live-commentary-system-design",
      "https://fanout.sh/system/archive/live-commentary-system-design",
      "https://fanout.sh/system/archive/live-commentary-system-design",
      "https://fanout.sh/system/archive/live-commentary-system-design",
      "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://html.spec.whatwg.org/multipage/server-sent-events.html",
      "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
    ],
    "diagram": "flowchart TD\n    User[User Posts Update] --> Check{Follower Count > 25,000?}\n    Check -->|No: Regular User| Push[Fanout on Write: Push to all followers' Redis Inboxes]\n    Check -->|Yes: Celebrity| Pull[Fanout on Read: Save to Celebrity Timeline, merge on query]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: live commentary\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "nearby-geospatial-search-system-design": {
    "slug": "nearby-geospatial-search-system-design",
    "title": "Nearby geospatial search",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "geospatial",
      "distance"
    ],
    "summary": "Nearby search finds objects within a distance of a location: shops around a hotel, available couriers near a pickup, or people a viewer is allowed to discover.",
    "previewHeading": "The core idea",
    "previewContinuation": "Its usual shape is a cheap candidate search followed by exact checks.",
    "sources": [
      "https://fanout.sh/system/archive/nearby-geospatial-search-system-design",
      "https://geographiclib.sourceforge.io/html/python/code.html",
      "https://postgis.net/workshops/postgis-intro/indexing.html",
      "https://redis.io/docs/latest/commands/geosearch/",
      "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-geo-distance-query",
      "https://postgis.net/docs/ST_DWithin.html"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Nearby geospatial search\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "geohash-prefix-spatial-index": {
    "slug": "geohash-prefix-spatial-index",
    "title": "Geohash prefix spatial index",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "geospatial",
      "geohash"
    ],
    "summary": "Geohash turns a location into a string that identifies a rectangular cell.",
    "previewHeading": "The core idea",
    "previewContinuation": "Objects in the same cell can be grouped under one lookup key, so a nearby search can fetch candidate IDs without scanning every stored point.",
    "sources": [
      "https://fanout.sh/system/archive/geohash-prefix-spatial-index",
      "https://github.com/wdm0006/pygeohash",
      "https://firebase.google.com/docs/firestore/solutions/geoqueries",
      "https://pypi.org/project/pygeohash/3.3.1/",
      "https://pygeohash.mcginniscommawill.com/api.html"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Geohash prefix spatial index\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "geospatial-grid-systems-h3-s2-geohash": {
    "slug": "geospatial-grid-systems-h3-s2-geohash",
    "title": "Grid systems: H3, S2, geohash",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "geospatial",
      "spatial-index"
    ],
    "summary": "Geospatial grids give regions stable identifiers, letting a system group locations under ordinary keys.",
    "previewHeading": "The core idea",
    "previewContinuation": "That is useful for counting orders by area, joining two location datasets, or narrowing a nearby search.",
    "sources": [
      "https://h3geo.org/docs/highlights/indexing/",
      "https://h3geo.org/docs/core-library/overview/",
      "https://h3geo.org/docs/api/hierarchy/",
      "https://h3geo.org/docs/core-library/restable/",
      "https://s2geometry.io/devguide/s2cell_hierarchy.html",
      "https://s2geometry.io/devguide/examples/coverings.html",
      "https://postgis.net/workshops/postgis-intro/indexing.html",
      "https://s2geometry.io/resources/s2cell_statistics.html",
      "https://s2sphere.readthedocs.io/en/latest/",
      "https://pypi.org/project/h3/4.5.0/",
      "https://pypi.org/project/s2sphere/0.2.5/"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Grid systems: H3, S2, geohash\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "redis-geo-spatial-hot-path": {
    "slug": "redis-geo-spatial-hot-path",
    "title": "Redis GEO hot path",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "geospatial",
      "redis"
    ],
    "summary": "Redis GEO maintains an in-memory index of named locations and finds members within a radius or box.",
    "previewHeading": "The core idea",
    "previewContinuation": "It can serve a nearby lookup for active couriers, rental bikes or stores when the working set fits in memory and the spatial queries are simple.",
    "sources": [
      "https://redis.io/docs/latest/commands/geoadd/",
      "https://redis.io/docs/latest/commands/geosearch/",
      "https://redis.io/docs/latest/commands/geopos/",
      "https://redis.io/docs/latest/commands/zrem/",
      "https://redis.io/docs/latest/commands/expire/",
      "https://redis.io/docs/latest/develop/programmability/eval-intro/",
      "https://geographiclib.sourceforge.io/html/python/code.html"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Redis GEO hot path\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "geofencing-point-in-polygon": {
    "slug": "geofencing-point-in-polygon",
    "title": "Geofencing: point in polygon",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "geospatial",
      "geometry"
    ],
    "summary": "Geofencing checks whether a reported location belongs to a named region.",
    "previewHeading": "The core idea",
    "previewContinuation": "A delivery service can use it to decide which addresses it serves; an airport pickup flow can use it to select the appropriate pickup zone.",
    "sources": [
      "https://shapely.readthedocs.io/en/2.1.2/reference/shapely.covers.html",
      "https://shapely.readthedocs.io/en/2.1.2/reference/shapely.contains.html",
      "https://shapely.readthedocs.io/en/2.1.2/manual.html",
      "https://postgis.net/docs/ST_Covers.html"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Geofencing: point in polygon\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "ray-casting-point-in-polygon": {
    "slug": "ray-casting-point-in-polygon",
    "title": "Ray casting point in polygon",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "geospatial",
      "algorithms"
    ],
    "summary": "Ray casting is a way to test whether a point lies inside a polygon.",
    "previewHeading": "The core idea",
    "previewContinuation": "Draw an imaginary ray from the point to the right and count its boundary crossings: an odd count means inside, an even count means outside.",
    "sources": [
      "https://shapely.readthedocs.io/en/2.1.2/reference/shapely.covers.html",
      "https://shapely.readthedocs.io/en/2.1.2/manual.html",
      "https://wrfranklin.org/Research/Short_Notes/pnpoly.html",
      "https://erich.realtimerendering.com/ptinpoly/",
      "https://www.cs.cmu.edu/~quake/robust.html"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Ray casting point in polygon\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "seen-filtering-bloom-vs-exact-sets": {
    "slug": "seen-filtering-bloom-vs-exact-sets",
    "title": "Seen filtering: Bloom vs exact sets",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "probabilistic-structures"
    ],
    "summary": "Seen filtering removes candidates a viewer has already encountered: swiped profiles, dismissed products, watched videos or previously shown ads.",
    "previewHeading": "The core idea",
    "previewContinuation": "The first decision is what counts as “seen.",
    "sources": [
      "https://fanout.sh/system/archive/seen-filtering-bloom-vs-exact-sets",
      "https://fanout.sh/system/archive/seen-filtering-bloom-vs-exact-sets",
      "https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf",
      "https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/",
      "https://redis.io/docs/latest/commands/cf.del/",
      "https://roaringbitmap.org/"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Seen filtering: Bloom vs exact sets\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "matching-and-recommendation-algorithms": {
    "slug": "matching-and-recommendation-algorithms",
    "title": "Matching and recommendation algorithms",
    "kind": "lesson",
    "moduleNumber": "12",
    "moduleTitle": "Geo, matching and recs",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "recommendations",
      "ranking"
    ],
    "summary": "Matching chooses useful pairings: a rider and driver, a job and candidate, or a reader and article.",
    "previewHeading": "The core idea",
    "previewContinuation": "A recommender usually proposes items the user may choose from.",
    "sources": [
      "https://developers.google.com/machine-learning/recommendation/content-based/basics",
      "https://developers.google.com/machine-learning/recommendation/collaborative/basics",
      "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage",
      "https://developers.google.com/machine-learning/recommendation/overview/types",
      "https://developers.google.com/machine-learning/recommendation/dnn/re-ranking",
      "https://fanout.sh/system/archive/matching-and-recommendation-algorithms",
      "https://fanout.sh/system/archive/matching-and-recommendation-algorithms"
    ],
    "diagram": "flowchart LR\n    Driver[Driver GPS Coord] --> GeoHash[Encode to Geohash / H3 Hexagon]\n    GeoHash --> RedisGeo[(Redis GEO / Sorted Set)]\n    Rider[Rider Search Coord] --> Radius[GEORADIUS 3km Neighbor Cells]\n    RedisGeo --> Radius\n    Radius --> MatchEngine[Bipartite Hungarian Matching Engine]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Matching and recommendation algorithms\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "direct-to-object-storage-upload": {
    "slug": "direct-to-object-storage-upload",
    "title": "Direct-to-object-storage upload",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "media",
      "uploads"
    ],
    "summary": "Direct upload sends file bytes from the client to object storage.",
    "previewHeading": "The core idea",
    "previewContinuation": "The application authorizes the transfer and decides when the file becomes usable, without relaying the whole body through its API servers.",
    "sources": [
      "https://fanout.sh/system/archive/direct-to-object-storage-upload",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/developerguide/sigv4-HTTPPOSTConstructPolicy.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html",
      "https://www.rfc-editor.org/rfc/rfc9112.html"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Direct-to-object-storage upload\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "image-cdn-and-resizing": {
    "slug": "image-cdn-and-resizing",
    "title": "Image CDN and resizing",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "images",
      "caching"
    ],
    "summary": "Image delivery has two separate jobs: choose a useful representation of the source, then avoid fetching and processing it again for every reader.",
    "previewHeading": "The core idea",
    "previewContinuation": "A resize worker produces variants; a CDN caches their bytes near readers.",
    "sources": [
      "https://fanout.sh/system/archive/image-cdn-and-resizing",
      "https://fanout.sh/system/archive/image-cdn-and-resizing",
      "https://aws.amazon.com/blogs/networking-and-content-delivery/image-optimization-using-amazon-cloudfront-and-aws-lambda/",
      "https://www.greatfrontend.com/questions/system-design/news-feed-facebook",
      "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html",
      "https://pillow.readthedocs.io/en/stable/reference/Image.html",
      "https://pillow.readthedocs.io/en/stable/reference/ImageOps.html"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Image CDN and resizing\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "gravatar-style-avatar-service": {
    "slug": "gravatar-style-avatar-service",
    "title": "An avatar service",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "images",
      "identity"
    ],
    "summary": "An avatar service turns an account reference into its current profile image.",
    "previewHeading": "The core idea",
    "previewContinuation": "Comments can keep the author's account ID even when that author changes their photo.",
    "sources": [
      "https://fanout.sh/system/archive/gravatar-style-avatar-service",
      "https://docs.gravatar.com/sdk/images/",
      "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html",
      "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"An avatar service\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "video-upload-signed-url-multipart": {
    "slug": "video-upload-signed-url-multipart",
    "title": "Video upload: signed URLs and multipart",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "video",
      "uploads"
    ],
    "summary": "Multipart upload transfers one file in separately numbered portions, then assembles them into an object.",
    "previewHeading": "The core idea",
    "previewContinuation": "A failed portion can be retried without resending the whole video.",
    "sources": [
      "https://fanout.sh/system/archive/video-upload-signed-url-multipart",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Video upload: signed URLs and multipart\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "video-transcoding-pipeline": {
    "slug": "video-transcoding-pipeline",
    "title": "Video transcoding pipeline",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "media",
      "workflows"
    ],
    "summary": "Transcoding turns an uploaded video into representations suited to playback: different dimensions, compression settings or codecs.",
    "previewHeading": "The core idea",
    "previewContinuation": "Packaging then arranges the encoded media into files and playlists.",
    "sources": [
      "https://fanout.sh/system/archive/video-transcoding-pipeline",
      "https://ffmpeg.org/ffmpeg.html",
      "https://ffmpeg.org/ffmpeg-formats.html#hls-2",
      "https://www.rfc-editor.org/rfc/rfc8216.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html",
      "https://netflixtechblog.com/rebuilding-netflix-video-processing-pipeline-with-microservices-4e5e6310e359"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Video transcoding pipeline\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "adaptive-bitrate-and-cdn-decider": {
    "slug": "adaptive-bitrate-and-cdn-decider",
    "title": "Adaptive bitrate and the CDN decider",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "media",
      "playback"
    ],
    "summary": "Study media, files and CDN.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/adaptive-bitrate-and-cdn-decider",
      "https://www.rfc-editor.org/rfc/rfc8216.html",
      "https://ffmpeg.org/ffmpeg-formats.html#hls-2",
      "https://dashif.org/dash.js/pages/usage/abr/",
      "https://openconnect.zendesk.com/hc/en-us/articles/360035618071-Fill-patterns"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Adaptive bitrate and the CDN decider\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "signed-urls-drm-and-video-security": {
    "slug": "signed-urls-drm-and-video-security",
    "title": "Signed URLs, DRM, and video security",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "media",
      "access"
    ],
    "summary": "A private video needs protection wherever its media is served.",
    "previewHeading": "The core idea",
    "previewContinuation": "Requiring login on the watch page is insufficient if its playlist points to public segments.",
    "sources": [
      "https://fanout.sh/system/archive/signed-urls-drm-and-video-security",
      "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html",
      "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-choosing-signed-urls-cookies.html",
      "https://www.w3.org/TR/2017/REC-encrypted-media-20170918/",
      "https://aws.amazon.com/blogs/media/securing-media-content-using-watermarking-at-the-edge/",
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://learn.microsoft.com/en-us/playready/overview/security-level"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Signed URLs, DRM, and video security\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "live-streaming-webrtc-and-latency": {
    "slug": "live-streaming-webrtc-and-latency",
    "title": "Live streaming, WebRTC, and latency",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "media",
      "realtime"
    ],
    "summary": "Live delivery sends media while it is being produced.",
    "previewHeading": "The core idea",
    "previewContinuation": "A broadcast viewer may tolerate being a few seconds behind the camera; people talking to each other need a much shorter feedback loop.",
    "sources": [
      "https://fanout.sh/system/archive/live-streaming-webrtc-and-latency",
      "https://webrtc.org/getting-started/peer-connections",
      "https://aiortc.readthedocs.io/en/latest/api.html",
      "https://www.rfc-editor.org/rfc/rfc8834.html",
      "https://www.rfc-editor.org/rfc/rfc8445.html",
      "https://www.rfc-editor.org/rfc/rfc8656.html",
      "https://janus.conf.meetecho.com/docs/videoroom.html",
      "https://developer.apple.com/videos/play/wwdc2020/10228/"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Live streaming, WebRTC, and latency\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "remote-file-sync-design": {
    "slug": "remote-file-sync-design",
    "title": "Remote file sync design",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "file-sync",
      "revisions"
    ],
    "summary": "File synchronization carries changes between local folders and remote storage, including changes made while a device was offline.",
    "previewHeading": "The core idea",
    "previewContinuation": "It must discover what changed, move the required bytes, and handle competing edits without silently losing someone's work.",
    "sources": [
      "https://fanout.sh/system/archive/remote-file-sync-design",
      "https://dropbox.tech/infrastructure/streaming-file-synchronization",
      "https://dropbox.tech/infrastructure/-testing-our-new-sync-engine",
      "https://docs.syncthing.net/users/syncing.html"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Remote file sync design\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "fixed-block-chunking-and-content-addressing": {
    "slug": "fixed-block-chunking-and-content-addressing",
    "title": "Fixed-block chunking and content addressing",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "file-sync",
      "chunking"
    ],
    "summary": "Chunking divides a file into smaller transfer units.",
    "previewHeading": "The core idea",
    "previewContinuation": "Content addressing names each unit by a hash of its bytes, so a sender can ask which pieces the receiver lacks instead of always resending the file.",
    "sources": [
      "https://fanout.sh/system/archive/fixed-block-chunking-and-content-addressing",
      "https://dropbox.tech/infrastructure/streaming-file-synchronization",
      "https://docs.syncthing.net/users/syncing.html",
      "https://docs.python.org/3.12/library/hashlib.html",
      "https://borgbackup.readthedocs.io/en/stable/internals/data-structures.html"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Fixed-block chunking and content addressing\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "blocklist-versioned-file-metadata": {
    "slug": "blocklist-versioned-file-metadata",
    "title": "Blocklist versioned file metadata",
    "kind": "lesson",
    "moduleNumber": "13",
    "moduleTitle": "Media, files and CDN",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "file-sync",
      "metadata"
    ],
    "summary": "Study media, files and CDN.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/blocklist-versioned-file-metadata",
      "https://fanout.sh/system/archive/blocklist-versioned-file-metadata",
      "https://dropbox.tech/infrastructure/streaming-file-synchronization",
      "https://dropbox.tech/infrastructure/inside-the-magic-pocket",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.sqlite.org/autoinc.html",
      "https://www.sqlite.org/pragma.html#pragma_synchronous",
      "https://docs.python.org/3.12/library/os.html#os.fsync"
    ],
    "diagram": "sequenceDiagram\n    Client->>API: 1. Request Upload URL (file_name, size)\n    API-->>Client: 2. Return S3 Presigned URL + Auth Token\n    Client->>S3: 3. Direct Binary PUT to S3 Bucket\n    S3->>SNS: 4. ObjectCreated Event\n    SNS->>Transcode: 5. Spawn Distributed Transcode Workers (HLS 1080p, 720p, 480p)",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Blocklist versioned file metadata\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "observability-for-distributed-systems": {
    "slug": "observability-for-distributed-systems",
    "title": "Observability for distributed systems",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "observability",
      "telemetry"
    ],
    "summary": "A customer says a file never appeared.",
    "previewHeading": "The core idea",
    "previewContinuation": "The API dashboard shows successful requests.",
    "sources": [
      "https://fanout.sh/system/archive/observability-for-distributed-systems",
      "https://sre.google/sre-book/monitoring-distributed-systems/",
      "https://opentelemetry.io/docs/concepts/signals/traces/",
      "https://prometheus.io/docs/practices/naming/",
      "https://prometheus.io/docs/introduction/overview/",
      "https://docs.python.org/3.12/library/time.html#time.monotonic_ns"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Observability for distributed systems\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "slos-and-error-budgets": {
    "slug": "slos-and-error-budgets",
    "title": "SLOs and error budgets",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "reliability",
      "slo"
    ],
    "summary": "A sync service can be available while taking an hour to deliver a file.",
    "previewHeading": "The core idea",
    "previewContinuation": "A search service can respond quickly with stale results.",
    "sources": [
      "https://fanout.sh/system/archive/slos-and-error-budgets",
      "https://sre.google/workbook/implementing-slos/",
      "https://sre.google/workbook/alerting-on-slos/",
      "https://sre.google/sre-book/service-level-objectives/"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"SLOs and error budgets\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "incident-response": {
    "slug": "incident-response",
    "title": "Incident response",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "incidents",
      "reliability"
    ],
    "summary": "An incident rarely arrives as a complete explanation.",
    "previewHeading": "The core idea",
    "previewContinuation": "A probe fails, a customer reports bad data, or a queue stops moving.",
    "sources": [
      "https://fanout.sh/system/archive/incident-response",
      "https://fanout.sh/system/archive/incident-response",
      "https://sre.google/sre-book/managing-incidents/",
      "https://sre.google/sre-book/monitoring-distributed-systems/",
      "https://sre.google/sre-book/postmortem-culture/",
      "https://sre.google/workbook/incident-response/"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Incident response\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "deployment-and-migration-safety": {
    "slug": "deployment-and-migration-safety",
    "title": "Deployment and migration safety",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "deployment",
      "migration"
    ],
    "summary": "A deployment replaces running software while requests and background jobs are still arriving.",
    "previewHeading": "The core idea",
    "previewContinuation": "The strategy determines how much traffic sees the new version, what you watch during the change, and how you return to the previous version if it fails.",
    "sources": [
      "https://aws.amazon.com/builders-library/ensuring-rollback-safety-during-deployments/",
      "https://martinfowler.com/bliki/BlueGreenDeployment.html",
      "https://sre.google/workbook/canarying-releases/",
      "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
      "https://fanout.sh/system/archive/deployment-and-migration-safety"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Deployment and migration safety\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "database-migration-safety": {
    "slug": "database-migration-safety",
    "title": "Database migration safety",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "database",
      "migration"
    ],
    "summary": "A database migration changes data or schema while applications still depend on it.",
    "previewHeading": "The core idea",
    "previewContinuation": "During a rolling deployment, old code, new code, workers and backfills may all be active.",
    "sources": [
      "https://fanout.sh/system/archive/database-migration-safety",
      "https://fanout.sh/system/archive/database-migration-safety",
      "https://fanout.sh/system/archive/database-migration-safety",
      "https://www.postgresql.org/docs/current/ddl-alter.html",
      "https://www.postgresql.org/docs/current/sql-altertable.html",
      "https://www.postgresql.org/docs/current/sql-createindex.html",
      "https://stripe.com/blog/online-migrations",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.sqlite.org/lang_createview.html"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Database migration safety\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "parallel-monolith-read-drain": {
    "slug": "parallel-monolith-read-drain",
    "title": "Parallel monolith read drain",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "migration",
      "routing"
    ],
    "summary": "Observe a running service, change it safely, and recover its data.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/parallel-monolith-read-drain",
      "https://fanout.sh/system/archive/parallel-monolith-read-drain",
      "https://www.krakend.io/docs/v2.8/endpoints/",
      "https://www.postgresql.org/docs/current/hot-standby.html",
      "https://stripe.com/blog/online-migrations",
      "https://www.sqlite.org/lang_transaction.html"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Parallel monolith read drain\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "database-backups-and-restore": {
    "slug": "database-backups-and-restore",
    "title": "Backups and restore",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "backups",
      "recovery"
    ],
    "summary": "A database backup preserves a recoverable earlier state.",
    "previewHeading": "The core idea",
    "previewContinuation": "The useful question is whether you can restore that state with the tools and access available during a failure, and whether it is recent enough for the application.",
    "sources": [
      "https://fanout.sh/system/archive/database-backups-and-restore",
      "https://fanout.sh/system/archive/database-backups-and-restore",
      "https://www.sqlite.org/backup.html",
      "https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.backup",
      "https://www.postgresql.org/docs/18/continuous-archiving.html",
      "https://www.postgresql.org/docs/18/backup-dump.html",
      "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_dr_tested.html"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Backups and restore\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "disaster-recovery": {
    "slug": "disaster-recovery",
    "title": "Disaster recovery",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "recovery",
      "operations"
    ],
    "summary": "Disaster recovery restores useful service after a failure that the normal serving setup cannot absorb.",
    "previewHeading": "The core idea",
    "previewContinuation": "The plan may cover a lost region, corrupted data, a catastrophic deployment, compromised credentials or an operator mistake.",
    "sources": [
      "https://fanout.sh/system/archive/disaster-recovery",
      "https://fanout.sh/system/archive/disaster-recovery",
      "https://fanout.sh/system/archive/disaster-recovery",
      "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_objective_defined_recovery.html",
      "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html",
      "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_dr_tested.html",
      "https://www.postgresql.org/docs/18/continuous-archiving.html"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Disaster recovery\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "data-retention-and-deletion": {
    "slug": "data-retention-and-deletion",
    "title": "Data retention, deletion, and privacy",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "deletion",
      "privacy"
    ],
    "summary": "Retention defines how long a system keeps data.",
    "previewHeading": "The core idea",
    "previewContinuation": "Deletion removes it from the places the system has copied it.",
    "sources": [
      "https://fanout.sh/system/archive/data-retention-and-deletion",
      "https://fanout.sh/system/archive/data-retention-and-deletion",
      "https://fanout.sh/system/archive/data-retention-and-deletion",
      "https://fanout.sh/system/archive/data-retention-and-deletion",
      "https://docs.cloud.google.com/docs/security/deletion",
      "https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/tombstones.html",
      "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html",
      "https://www.sqlite.org/pragma.html#pragma_secure_delete"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Data retention, deletion, and privacy\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "security-and-abuse-prevention": {
    "slug": "security-and-abuse-prevention",
    "title": "Security and abuse prevention",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "security",
      "abuse"
    ],
    "summary": "Security design decides who may use a system and what they may do with its data.",
    "previewHeading": "The core idea",
    "previewContinuation": "Abuse prevention also considers how legitimate operations can harm users or exhaust shared resources.",
    "sources": [
      "https://fanout.sh/system/archive/security-and-abuse-prevention",
      "https://fanout.sh/system/archive/security-and-abuse-prevention",
      "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
      "https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/",
      "https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html",
      "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
      "https://www.rfc-editor.org/rfc/rfc9449.html#section-11.1",
      "https://docs.python.org/3/library/hmac.html",
      "https://docs.python.org/3/library/http.server.html"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Security and abuse prevention\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "rate-limiter-placement-and-keys": {
    "slug": "rate-limiter-placement-and-keys",
    "title": "Rate limiter placement and keys",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "rate-limiting",
      "admission"
    ],
    "summary": "A rate limiter decides how much work a caller may start within a period.",
    "previewHeading": "The core idea",
    "previewContinuation": "Its usefulness depends on where it runs and which requests share an allowance.",
    "sources": [
      "https://fanout.sh/system/archive/rate-limiter-placement-and-keys",
      "https://fanout.sh/system/archive/rate-limiter-placement-and-keys",
      "https://nginx.org/en/docs/http/ngx_http_limit_req_module.html",
      "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
      "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/rate_limit_filter",
      "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/local_rate_limit_filter",
      "https://www.rfc-editor.org/rfc/rfc6585.html",
      "https://www.rfc-editor.org/rfc/rfc7239.html"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Rate limiter placement and keys\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "sliding-window-rate-limiter": {
    "slug": "sliding-window-rate-limiter",
    "title": "Sliding window rate limiter",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "rate-limiting",
      "algorithms"
    ],
    "summary": "A sliding-window limiter checks how much a caller has been admitted during the most recent period.",
    "previewHeading": "The core idea",
    "previewContinuation": "The window moves with each decision.",
    "sources": [
      "https://fanout.sh/system/archive/sliding-window-rate-limiter",
      "https://redis.io/tutorials/howtos/ratelimiting/",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.rfc-editor.org/rfc/rfc6585.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after",
      "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
      "https://developer.mozilla.org/en-US/docs/Web/API/Performance/now"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Sliding window rate limiter\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "multi-tenant-design": {
    "slug": "multi-tenant-design",
    "title": "Multi-tenant design",
    "kind": "lesson",
    "moduleNumber": "14",
    "moduleTitle": "Reliability and operations",
    "partTitle": "Fundamentals",
    "tags": [
      "system-design",
      "tenancy",
      "isolation"
    ],
    "summary": "A multi-tenant service serves several customers on shared infrastructure.",
    "previewHeading": "The core idea",
    "previewContinuation": "A tenant is the customer boundary, often a company or workspace.",
    "sources": [
      "https://fanout.sh/system/archive/multi-tenant-design",
      "https://fanout.sh/system/archive/multi-tenant-design",
      "https://fanout.sh/system/archive/multi-tenant-design",
      "https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/silo-isolation.html",
      "https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/pool-isolation.html",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/storage-data",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/service/storage",
      "https://www.postgresql.org/docs/current/ddl-rowsecurity.html"
    ],
    "diagram": "flowchart LR\n    Traffic[Incoming Production Traffic] --> Router{Canary Weighted Router}\n    Router -->|95% Traffic| Stable[V1 Stable Cluster]\n    Router -->|5% Traffic| Canary[V2 Canary Deployment]\n    Canary --> Metrics[Prometheus Error Rate Monitor]\n    Metrics -->|Error Rate > 0.1%| Abort[Auto-Abort & Traffic Drain]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Multi-tenant design\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "url-shortener-system-design": {
    "slug": "url-shortener-system-design",
    "title": "Design: a URL shortener, one machine",
    "kind": "design",
    "moduleNumber": "15",
    "moduleTitle": "Service and data designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "design",
      "ground-floor",
      "url-shortener"
    ],
    "summary": "A URL shortener stores a destination behind a compact link.",
    "previewHeading": "The core idea",
    "previewContinuation": "Creating a link writes that mapping; opening it returns a redirect so the browser can fetch the destination itself.",
    "sources": [
      "https://fanout.sh/system/archive/url-shortener-system-design",
      "https://fanout.sh/system/archive/url-shortener-system-design",
      "https://fanout.sh/system/archive/url-shortener-system-design",
      "https://www.postgresql.org/docs/16/sql-insert.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html#name-302-found",
      "https://www.rfc-editor.org/rfc/rfc9111.html#name-no-store-2",
      "https://docs.python.org/3/library/secrets.html",
      "https://www.postgresql.org/docs/16/pgbench.html"
    ],
    "diagram": "flowchart TD\n    User[Shorten Request] --> GW[API Gateway]\n    GW --> TokenServer[Pre-allocated ID Range Generator]\n    TokenServer --> Base62[Base62 Encoding]\n    Base62 --> Cache[(Redis Cache: 20% Top Links)]\n    Cache --> DB[(Postgres Database Sharded by ID Modulo)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a URL shortener, one machine\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "rate-limiting-and-abuse-prevention-case-study": {
    "slug": "rate-limiting-and-abuse-prevention-case-study",
    "title": "Design: rate limiting and abuse prevention",
    "kind": "design",
    "moduleNumber": "15",
    "moduleTitle": "Service and data designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "design",
      "rate-limiting",
      "abuse-prevention"
    ],
    "summary": "A rate limiter decides whether a caller may start more work, based on the work already admitted for that caller.",
    "previewHeading": "The core idea",
    "previewContinuation": "In our URL shortener, it stops one creator's repeated requests from consuming the resources needed to create and follow everyone else's links.",
    "sources": [
      "https://fanout.sh/system/archive/rate-limiting-and-abuse-prevention-case-study",
      "https://fanout.sh/system/archive/rate-limiting-and-abuse-prevention-case-study",
      "https://fanout.sh/system/archive/rate-limiting-and-abuse-prevention-case-study",
      "https://fanout.sh/system/archive/rate-limiting-and-abuse-prevention-case-study",
      "https://fanout.sh/system/archive/rate-limiting-and-abuse-prevention-case-study",
      "https://fanout.sh/system/archive/rate-limiting-and-abuse-prevention-case-study",
      "https://www.rfc-editor.org/rfc/rfc6585",
      "https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.postgresql.org/docs/16/explicit-locking.html#LOCKING-ROWS",
      "https://www.postgresql.org/docs/16/transaction-iso.html#XACT-READ-COMMITTED",
      "https://stripe.com/blog/rate-limiters",
      "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting"
    ],
    "diagram": "flowchart TD\n    User[Shorten Request] --> GW[API Gateway]\n    GW --> TokenServer[Pre-allocated ID Range Generator]\n    TokenServer --> Base62[Base62 Encoding]\n    Base62 --> Cache[(Redis Cache: 20% Top Links)]\n    Cache --> DB[(Postgres Database Sharded by ID Modulo)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: rate limiting and abuse prevention\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "url-shortener-at-scale": {
    "slug": "url-shortener-at-scale",
    "title": "Design: a URL shortener at scale",
    "kind": "design",
    "moduleNumber": "15",
    "moduleTitle": "Service and data designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "design",
      "caching",
      "url-shortener"
    ],
    "summary": "A URL shortener can reuse the destination of a popular link instead of looking it up in the database for every request.",
    "previewHeading": "The core idea",
    "previewContinuation": "A shared cache makes that copy available to several application instances.",
    "sources": [
      "https://fanout.sh/system/archive/url-shortener-at-scale",
      "https://fanout.sh/system/archive/url-shortener-at-scale",
      "https://fanout.sh/system/archive/url-shortener-at-scale",
      "https://fanout.sh/system/archive/url-shortener-at-scale",
      "https://fanout.sh/system/archive/url-shortener-at-scale",
      "https://fanout.sh/system/archive/url-shortener-at-scale",
      "https://www.postgresql.org/docs/16/sql-insert.html",
      "https://www.postgresql.org/docs/16/warm-standby.html",
      "https://redis.io/docs/latest/develop/reference/eviction/",
      "https://www.sqlite.org/pragma.html#pragma_synchronous",
      "https://www.rfc-editor.org/rfc/rfc9111.html#name-no-store-2",
      "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html"
    ],
    "diagram": "flowchart TD\n    User[Shorten Request] --> GW[API Gateway]\n    GW --> TokenServer[Pre-allocated ID Range Generator]\n    TokenServer --> Base62[Base62 Encoding]\n    Base62 --> Cache[(Redis Cache: 20% Top Links)]\n    Cache --> DB[(Postgres Database Sharded by ID Modulo)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a URL shortener at scale\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "ecommerce-product-listing-system-design": {
    "slug": "ecommerce-product-listing-system-design",
    "title": "Design: a product listing",
    "kind": "design",
    "moduleNumber": "15",
    "moduleTitle": "Service and data designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "ecommerce",
      "relational-databases",
      "design"
    ],
    "summary": "A product listing turns catalog records into a page a shopper can browse.",
    "previewHeading": "The core idea",
    "previewContinuation": "The query decides which products qualify, their order, and where the next page begins.",
    "sources": [
      "https://fanout.sh/system/archive/ecommerce-product-listing-system-design",
      "https://fanout.sh/system/archive/ecommerce-product-listing-system-design",
      "https://fanout.sh/system/archive/ecommerce-product-listing-system-design",
      "https://fanout.sh/system/archive/ecommerce-product-listing-system-design",
      "https://fanout.sh/system/archive/ecommerce-product-listing-system-design",
      "https://fanout.sh/system/archive/ecommerce-product-listing-system-design",
      "https://fanout.sh/system/archive/ecommerce-product-listing-system-design",
      "https://www.postgresql.org/docs/16/ddl-constraints.html",
      "https://www.postgresql.org/docs/16/queries-limit.html",
      "https://www.postgresql.org/docs/16/transaction-iso.html",
      "https://www.postgresql.org/docs/16/indexes-multicolumn.html",
      "https://www.postgresql.org/docs/16/indexes-partial.html",
      "https://www.postgresql.org/docs/16/functions-comparisons.html",
      "https://www.greatfrontend.com/projects/challenges/product-listing-section"
    ],
    "diagram": "flowchart TD\n    User[Shorten Request] --> GW[API Gateway]\n    GW --> TokenServer[Pre-allocated ID Range Generator]\n    TokenServer --> Base62[Base62 Encoding]\n    Base62 --> Cache[(Redis Cache: 20% Top Links)]\n    Cache --> DB[(Postgres Database Sharded by ID Modulo)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a product listing\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "collaborative-editing-system-design": {
    "slug": "collaborative-editing-system-design",
    "title": "Design: a collaborative editor",
    "kind": "design",
    "moduleNumber": "15",
    "moduleTitle": "Service and data designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "collaboration",
      "coordination"
    ],
    "summary": "A collaborative editor lets several people change the same document while seeing one another's work.",
    "previewHeading": "The core idea",
    "previewContinuation": "Each person's typing appears locally before a server can confirm it.",
    "sources": [
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://fanout.sh/system/archive/collaborative-editing-system-design",
      "https://docs.yjs.dev/api/document-updates",
      "https://docs.yjs.dev/api/shared-types/y.text",
      "https://docs.yjs.dev/api/relative-positions",
      "https://docs.yjs.dev/api/undo-manager",
      "https://docs.yjs.dev/getting-started/a-collaborative-editor",
      "https://docs.yjs.dev/getting-started/adding-awareness",
      "https://docs.yjs.dev/getting-started/allowing-offline-editing",
      "https://docs.yjs.dev/ecosystem/connection-provider/y-websocket",
      "https://github.com/yjs/yjs/blob/v13.6.32/INTERNALS.md",
      "https://codemirror.net/examples/collab/",
      "https://www.greatfrontend.com/questions/system-design/collaborative-editor-google-docs",
      "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
      "https://sqlite.org/lang_transaction.html"
    ],
    "diagram": "flowchart TD\n    User[Shorten Request] --> GW[API Gateway]\n    GW --> TokenServer[Pre-allocated ID Range Generator]\n    TokenServer --> Base62[Base62 Encoding]\n    Base62 --> Cache[(Redis Cache: 20% Top Links)]\n    Cache --> DB[(Postgres Database Sharded by ID Modulo)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a collaborative editor\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "object-store-system-design": {
    "slug": "object-store-system-design",
    "title": "Design: an object store (S3)",
    "kind": "design",
    "moduleNumber": "15",
    "moduleTitle": "Service and data designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "object-storage",
      "design"
    ],
    "summary": "An object store gives an application a name for a completed file and a way to retrieve its bytes.",
    "previewHeading": "The core idea",
    "previewContinuation": "We'll design one for exported reports: an upload may take minutes, but readers must never see a half-written report.",
    "sources": [
      "https://fanout.sh/system/archive/object-store-system-design",
      "https://fanout.sh/system/archive/object-store-system-design",
      "https://fanout.sh/system/archive/object-store-system-design",
      "https://fanout.sh/system/archive/object-store-system-design",
      "https://fanout.sh/system/archive/object-store-system-design",
      "https://fanout.sh/system/archive/object-store-system-design",
      "https://fanout.sh/system/archive/object-store-system-design",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html",
      "https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html",
      "https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html"
    ],
    "diagram": "flowchart TD\n    User[Shorten Request] --> GW[API Gateway]\n    GW --> TokenServer[Pre-allocated ID Range Generator]\n    TokenServer --> Base62[Base62 Encoding]\n    Base62 --> Cache[(Redis Cache: 20% Top Links)]\n    Cache --> DB[(Postgres Database Sharded by ID Modulo)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: an object store (S3)\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "partitioned-log-system-design": {
    "slug": "partitioned-log-system-design",
    "title": "Design: a Kafka-style log",
    "kind": "design",
    "moduleNumber": "15",
    "moduleTitle": "Service and data designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "streams",
      "storage"
    ],
    "summary": "A publishing service needs search and analytics to receive the same post changes.",
    "previewHeading": "The core idea",
    "previewContinuation": "Search may be current while analytics is an hour behind.",
    "sources": [
      "https://fanout.sh/system/archive/partitioned-log-system-design",
      "https://fanout.sh/system/archive/partitioned-log-system-design",
      "https://fanout.sh/system/archive/partitioned-log-system-design",
      "https://fanout.sh/system/archive/partitioned-log-system-design",
      "https://fanout.sh/system/archive/partitioned-log-system-design",
      "https://kafka.apache.org/42/design/design/",
      "https://kafka.apache.org/42/configuration/producer-configs/",
      "https://kafka.apache.org/42/configuration/topic-configs/",
      "https://kafka.apache.org/42/operations/kraft/",
      "https://kafka.apache.org/42/operations/eligible-leader-replicas/",
      "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html",
      "https://kafka.apache.org/42/implementation/log/",
      "https://kafka.apache.org/42/implementation/message-format/"
    ],
    "diagram": "flowchart TD\n    User[Shorten Request] --> GW[API Gateway]\n    GW --> TokenServer[Pre-allocated ID Range Generator]\n    TokenServer --> Base62[Base62 Encoding]\n    Base62 --> Cache[(Redis Cache: 20% Top Links)]\n    Cache --> DB[(Postgres Database Sharded by ID Modulo)]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a Kafka-style log\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "notification-system-design": {
    "slug": "notification-system-design",
    "title": "Design: a notification system",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "notifications",
      "delivery"
    ],
    "summary": "Follow a complete system design, from requirements through failure behavior.",
    "previewHeading": "Core Architecture Principle",
    "previewContinuation": "Production systems must balance operational complexity with scalability.",
    "sources": [
      "https://fanout.sh/system/archive/notification-system-design",
      "https://fanout.sh/system/archive/notification-system-design",
      "https://fanout.sh/system/archive/notification-system-design",
      "https://fanout.sh/system/archive/notification-system-design",
      "https://fanout.sh/system/archive/notification-system-design",
      "https://fanout.sh/system/archive/notification-system-design",
      "https://www.uber.com/us/en/blog/real-time-push-platform/",
      "https://resend.com/docs/dashboard/emails/idempotency-keys",
      "https://resend.com/docs/webhooks/introduction",
      "https://resend.com/docs/webhooks/verify-webhooks-requests",
      "https://docs.aws.amazon.com/ses/latest/dg/monitor-using-event-publishing.html",
      "https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a notification system\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "ticket-booking-system-design": {
    "slug": "ticket-booking-system-design",
    "title": "Design: a ticket booking system",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "booking",
      "workflows"
    ],
    "summary": "A seat map tells you what appears available.",
    "previewHeading": "The core idea",
    "previewContinuation": "A hold temporarily keeps a seat for you.",
    "sources": [
      "https://fanout.sh/system/archive/ticket-booking-system-design",
      "https://fanout.sh/system/archive/ticket-booking-system-design",
      "https://fanout.sh/system/archive/ticket-booking-system-design",
      "https://fanout.sh/system/archive/ticket-booking-system-design",
      "https://fanout.sh/system/archive/ticket-booking-system-design",
      "https://docs.seats.io/docs/api/temporarily-hold-objects/",
      "https://docs.seats.io/docs/api/get-objects-for-a-hold-token/",
      "https://www.postgresql.org/docs/current/explicit-locking.html",
      "https://www.postgresql.org/docs/current/functions-datetime.html",
      "https://www.sqlite.org/lang_transaction.html",
      "https://docs.stripe.com/payments/payment-intents/verifying-status",
      "https://docs.stripe.com/payments/place-a-hold-on-a-payment-method",
      "https://developers.cloudflare.com/waiting-room/reference/queueing-methods/"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a ticket booking system\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "payment-system-design": {
    "slug": "payment-system-design",
    "title": "Design: a payment system",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "payments",
      "workflows"
    ],
    "summary": "A payment service keeps an agreement between a merchant and a payment provider: collect this amount for this order, then retain enough evidence to explain what happened.",
    "previewHeading": "The core idea",
    "previewContinuation": "The provider can complete its work while our request times out.",
    "sources": [
      "https://fanout.sh/system/archive/payment-system-design",
      "https://fanout.sh/system/archive/payment-system-design",
      "https://fanout.sh/system/archive/payment-system-design",
      "https://fanout.sh/system/archive/payment-system-design",
      "https://fanout.sh/system/archive/payment-system-design",
      "https://docs.stripe.com/api/idempotent_requests",
      "https://docs.stripe.com/webhooks",
      "https://docs.stripe.com/payments/payment-intents",
      "https://docs.stripe.com/payments/paymentintents/lifecycle",
      "https://docs.stripe.com/refunds",
      "https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/",
      "https://docs.adyen.com/reporting/settlement-reconciliation/transaction-level/settlement-details-report"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a payment system\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "search-engine-system-design": {
    "slug": "search-engine-system-design",
    "title": "Design: a search service",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "search",
      "indexing"
    ],
    "summary": "A search service turns a few words into an ordered list of documents.",
    "previewHeading": "The core idea",
    "previewContinuation": "For a team's documentation, that means finding useful matches while respecting edits, deletions and access changes.",
    "sources": [
      "https://fanout.sh/system/archive/search-engine-system-design",
      "https://fanout.sh/system/archive/search-engine-system-design",
      "https://fanout.sh/system/archive/search-engine-system-design",
      "https://fanout.sh/system/archive/search-engine-system-design",
      "https://fanout.sh/system/archive/search-engine-system-design",
      "https://www.linkedin.com/blog/engineering/search/did-you-mean-galene",
      "https://slack.engineering/how-we-built-enterprise-search-to-be-secure-and-private/",
      "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/refresh-parameter",
      "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results",
      "https://www.elastic.co/docs/manage-data/data-store/aliases"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a search service\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "recommendation-system-design": {
    "slug": "recommendation-system-design",
    "title": "Design: a recommendation system",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "recommendations",
      "ranking",
      "design"
    ],
    "summary": "A recommendation service selects useful items before the reader asks for a particular one.",
    "previewHeading": "The core idea",
    "previewContinuation": "For an article app, that means choosing what belongs on the home page from the reader's interests, the available catalog and recent feedback.",
    "sources": [
      "https://research.google.com/pubs/archive/45530.pdf",
      "https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/",
      "https://docs.nvidia.com/deeplearning/performance/recsys-best-practices/index.html",
      "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage",
      "https://www.sqlite.org/isolation.html",
      "https://fanout.sh/system/archive/recommendation-system-design",
      "https://fanout.sh/system/archive/recommendation-system-design",
      "https://fanout.sh/system/archive/recommendation-system-design",
      "https://fanout.sh/system/archive/recommendation-system-design"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a recommendation system\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "chat-and-messaging-system-design": {
    "slug": "chat-and-messaging-system-design",
    "title": "Design: chat and messaging",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "chat",
      "messaging"
    ],
    "summary": "A chat service keeps a conversation available when its participants come and go.",
    "previewHeading": "The core idea",
    "previewContinuation": "It accepts messages, establishes their order, and lets devices catch up after losing a connection.",
    "sources": [
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://fanout.sh/system/archive/chat-and-messaging-system-design",
      "https://slack.engineering/real-time-messaging/",
      "https://discord.com/blog/how-discord-stores-trillions-of-messages",
      "https://spec.matrix.org/v1.16/client-server-api/",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.greatfrontend.com/questions/system-design/chat-application-messenger"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: chat and messaging\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "social-feed-system-design-case-study": {
    "slug": "social-feed-system-design-case-study",
    "title": "Design: a social feed",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "feeds",
      "social-network"
    ],
    "summary": "A home feed brings posts from followed accounts into one ordered list.",
    "previewHeading": "The core idea",
    "previewContinuation": "Publishing a post and placing it in every follower's list are different operations: the post can be safely stored while feed preparation is still catching up.",
    "sources": [
      "https://www.linkedin.com/blog/engineering/feed/followfeed-linkedin-s-feed-made-faster-and-smarter",
      "https://engineering.fb.com/2021/01/26/ml-applications/news-feed-ranking/",
      "https://www.pinterestcareers.com/media/ofzpjb5v/scaling-deep.pdf",
      "https://www.greatfrontend.com/questions/system-design/news-feed-facebook",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study",
      "https://fanout.sh/system/archive/social-feed-system-design-case-study"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a social feed\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "geospatial-nearby-search-case-study": {
    "slug": "geospatial-nearby-search-case-study",
    "title": "Design: nearby search",
    "kind": "design",
    "moduleNumber": "16",
    "moduleTitle": "Product designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "geospatial",
      "nearby-search"
    ],
    "summary": "Nearby search finds places around a chosen point, applies the reader's filters, and orders the matches.",
    "previewHeading": "The core idea",
    "previewContinuation": "A map makes this look like drawing a circle.",
    "sources": [
      "https://fanout.sh/system/archive/geospatial-nearby-search-case-study",
      "https://fanout.sh/system/archive/geospatial-nearby-search-case-study",
      "https://fanout.sh/system/archive/geospatial-nearby-search-case-study",
      "https://fanout.sh/system/archive/geospatial-nearby-search-case-study",
      "https://fanout.sh/system/archive/geospatial-nearby-search-case-study",
      "https://postgis.net/docs/ST_DWithin.html",
      "https://postgis.net/workshops/postgis-intro/knn.html",
      "https://redis.io/docs/latest/commands/geosearch/",
      "https://www.uber.com/us/en/blog/h3/",
      "https://www.greatfrontend.com/questions/system-design/travel-booking-airbnb"
    ],
    "diagram": "sequenceDiagram\n    autonumber\n    Client->>PaymentGW: POST /v1/charges (Idempotency-Key)\n    PaymentGW->>IdempTable: Lock Idempotency Key in SQL\n    PaymentGW->>BankAcquirer: External Auth & Capture\n    BankAcquirer-->>PaymentGW: Bank Authorization Code\n    PaymentGW->>Ledger: Insert Double-Entry Ledger Rows\n    PaymentGW-->>Client: 200 Charged Successfully",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: nearby search\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "ride-matching-system-design": {
    "slug": "ride-matching-system-design",
    "title": "Design: ride matching",
    "kind": "design",
    "moduleNumber": "17",
    "moduleTitle": "Media and operations designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "geospatial",
      "matching"
    ],
    "summary": "A ride-matching service takes a pickup request, finds eligible drivers, and turns a driver's acceptance into an assignment.",
    "previewHeading": "The core idea",
    "previewContinuation": "The map helps choose whom to ask.",
    "sources": [
      "https://fanout.sh/system/archive/ride-matching-system-design",
      "https://fanout.sh/system/archive/ride-matching-system-design",
      "https://fanout.sh/system/archive/ride-matching-system-design",
      "https://www.uber.com/us/en/blog/fulfillment-platform-rearchitecture/",
      "https://www.uber.com/ca/en/marketplace/matching/",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.sqlite.org/partialindex.html",
      "https://www.greatfrontend.com/interviews/company/uber/questions-guides"
    ],
    "diagram": "flowchart TD\n    Drivers[50,000 Active Drivers] -->|WebSockets 4s Ping| Ingest[Location Ingestion Gateway]\n    Ingest --> SpatialIndex[In-Memory H3 Spatial Index]\n    Rider[Rider Requests Ride] --> Matcher[Dispatch Engine]\n    SpatialIndex --> Matcher\n    Matcher --> Offer[Send Ephemeral Offer with 15s Expiry]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: ride matching\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "video-platform-system-design": {
    "slug": "video-platform-system-design",
    "title": "Design: a video platform",
    "kind": "design",
    "moduleNumber": "17",
    "moduleTitle": "Media and operations designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "media",
      "design"
    ],
    "summary": "A video platform turns an uploaded file into media that viewers can play on different devices and connections.",
    "previewHeading": "The core idea",
    "previewContinuation": "Uploading is only the first step: the service must prepare suitable versions, make them discoverable, and keep delivering the next segment while playback continues.",
    "sources": [
      "https://fanout.sh/system/archive/video-platform-system-design",
      "https://fanout.sh/system/archive/video-platform-system-design",
      "https://fanout.sh/system/archive/video-platform-system-design",
      "https://fanout.sh/system/archive/video-platform-system-design",
      "https://fanout.sh/system/archive/video-platform-system-design",
      "https://docs.aws.amazon.com/solutions/latest/video-on-demand-on-aws/architecture-overview.html",
      "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-cookies.html",
      "https://www.rfc-editor.org/rfc/rfc8216.html",
      "https://ffmpeg.org/ffmpeg.html",
      "https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play",
      "https://www.greatfrontend.com/questions/system-design/video-streaming-netflix"
    ],
    "diagram": "flowchart TD\n    Drivers[50,000 Active Drivers] -->|WebSockets 4s Ping| Ingest[Location Ingestion Gateway]\n    Ingest --> SpatialIndex[In-Memory H3 Spatial Index]\n    Rider[Rider Requests Ride] --> Matcher[Dispatch Engine]\n    SpatialIndex --> Matcher\n    Matcher --> Offer[Send Ephemeral Offer with 15s Expiry]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a video platform\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "file-sync-system-design": {
    "slug": "file-sync-system-design",
    "title": "Design: a file sync service",
    "kind": "design",
    "moduleNumber": "17",
    "moduleTitle": "Media and operations designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "file-sync",
      "design"
    ],
    "summary": "A file-sync service carries changes between a remote folder and devices that may be offline.",
    "previewHeading": "The core idea",
    "previewContinuation": "It has to move the right bytes, distinguish an edit from a retry, and preserve work when two devices change the same file.",
    "sources": [
      "https://fanout.sh/system/archive/file-sync-system-design",
      "https://fanout.sh/system/archive/file-sync-system-design",
      "https://fanout.sh/system/archive/file-sync-system-design",
      "https://dropbox.tech/infrastructure/-testing-our-new-sync-engine",
      "https://docs.syncthing.net/users/syncing.html",
      "https://docs.dropboxapi.com/dropbox-api/docs/file-access",
      "https://docs.dropboxapi.com/dropbox-api/docs/detecting-changes",
      "https://www.sqlite.org/autoinc.html"
    ],
    "diagram": "flowchart TD\n    Drivers[50,000 Active Drivers] -->|WebSockets 4s Ping| Ingest[Location Ingestion Gateway]\n    Ingest --> SpatialIndex[In-Memory H3 Spatial Index]\n    Rider[Rider Requests Ride] --> Matcher[Dispatch Engine]\n    SpatialIndex --> Matcher\n    Matcher --> Offer[Send Ephemeral Offer with 15s Expiry]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a file sync service\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "observability-slo-case-study": {
    "slug": "observability-slo-case-study",
    "title": "Design: observability and SLOs",
    "kind": "design",
    "moduleNumber": "17",
    "moduleTitle": "Media and operations designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "observability",
      "reliability",
      "design"
    ],
    "summary": "An observability system connects a user's result to the work that produced it.",
    "previewHeading": "The core idea",
    "previewContinuation": "It should help an operator answer three questions: is the service meeting its promise, which part failed, and did the repair work?",
    "sources": [
      "https://fanout.sh/system/archive/observability-slo-case-study",
      "https://fanout.sh/system/archive/observability-slo-case-study",
      "https://fanout.sh/system/archive/observability-slo-case-study",
      "https://fanout.sh/system/archive/observability-slo-case-study",
      "https://fanout.sh/system/archive/observability-slo-case-study",
      "https://sre.google/sre-book/monitoring-distributed-systems/",
      "https://sre.google/workbook/implementing-slos/",
      "https://sre.google/workbook/alerting-on-slos/",
      "https://sre.google/sre-book/managing-incidents/",
      "https://opentelemetry.io/docs/concepts/signals/traces/",
      "https://opentelemetry.io/docs/collector/resiliency/",
      "https://prometheus.io/docs/practices/naming/",
      "https://prometheus.io/docs/introduction/overview/",
      "https://grafana.com/docs/grafana/latest/",
      "https://docs.python.org/3.12/library/time.html#time.monotonic_ns"
    ],
    "diagram": "flowchart TD\n    Drivers[50,000 Active Drivers] -->|WebSockets 4s Ping| Ingest[Location Ingestion Gateway]\n    Ingest --> SpatialIndex[In-Memory H3 Spatial Index]\n    Rider[Rider Requests Ride] --> Matcher[Dispatch Engine]\n    SpatialIndex --> Matcher\n    Matcher --> Offer[Send Ephemeral Offer with 15s Expiry]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: observability and SLOs\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "zero-downtime-database-migration-case-study": {
    "slug": "zero-downtime-database-migration-case-study",
    "title": "Design: a database migration",
    "kind": "design",
    "moduleNumber": "17",
    "moduleTitle": "Media and operations designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "database",
      "migration"
    ],
    "summary": "A database migration changes the representation that an application depends on.",
    "previewHeading": "The core idea",
    "previewContinuation": "While the copy runs, users may still read and update the same records.",
    "sources": [
      "https://fanout.sh/system/archive/zero-downtime-database-migration-case-study",
      "https://fanout.sh/system/archive/zero-downtime-database-migration-case-study",
      "https://fanout.sh/system/archive/zero-downtime-database-migration-case-study",
      "https://fanout.sh/system/archive/zero-downtime-database-migration-case-study",
      "https://fanout.sh/system/archive/zero-downtime-database-migration-case-study",
      "https://stripe.com/blog/online-migrations",
      "https://www.postgresql.org/docs/18/logicaldecoding-explanation.html",
      "https://github.com/github/gh-ost/blob/master/doc/throttle.md",
      "https://github.com/github/gh-ost/blob/master/doc/cut-over.md",
      "https://www.sqlite.org/lang_transaction.html",
      "https://www.sqlite.org/lang_createview.html",
      "https://docs.python.org/3/library/http.server.html"
    ],
    "diagram": "flowchart TD\n    Drivers[50,000 Active Drivers] -->|WebSockets 4s Ping| Ingest[Location Ingestion Gateway]\n    Ingest --> SpatialIndex[In-Memory H3 Spatial Index]\n    Rider[Rider Requests Ride] --> Matcher[Dispatch Engine]\n    SpatialIndex --> Matcher\n    Matcher --> Offer[Send Ephemeral Offer with 15s Expiry]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a database migration\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "interview-design-instagram": {
    "slug": "interview-design-instagram",
    "title": "Design: a photo-sharing interview",
    "kind": "design",
    "moduleNumber": "17",
    "moduleTitle": "Media and operations designs",
    "partTitle": "Real-world systems",
    "tags": [
      "system-design",
      "interview",
      "feed",
      "media"
    ],
    "summary": "A photo-sharing service has two connected jobs: publish an author's image and help other people discover it.",
    "previewHeading": "The core idea",
    "previewContinuation": "The image bytes, post metadata and follower feed have different storage and delivery needs.",
    "sources": [
      "https://fanout.sh/system/archive/interview-design-instagram",
      "https://fanout.sh/system/archive/interview-design-instagram",
      "https://fanout.sh/system/archive/interview-design-instagram",
      "https://www.greatfrontend.com/questions/system-design/photo-sharing-instagram",
      "https://www.greatfrontend.com/interviews/study/gfe75/questions/system-design/news-feed-facebook",
      "https://engineering.fb.com/2009/04/30/core-infra/needle-in-a-haystack-efficient-storage-of-billions-of-photos/",
      "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
      "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html"
    ],
    "diagram": "flowchart TD\n    Drivers[50,000 Active Drivers] -->|WebSockets 4s Ping| Ingest[Location Ingestion Gateway]\n    Ingest --> SpatialIndex[In-Memory H3 Spatial Index]\n    Rider[Rider Requests Ride] --> Matcher[Dispatch Engine]\n    SpatialIndex --> Matcher\n    Matcher --> Offer[Send Ephemeral Offer with 15s Expiry]",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Design: a photo-sharing interview\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "case-instagram-early-architecture": {
    "slug": "case-instagram-early-architecture",
    "title": "Case: Instagram's first architecture",
    "kind": "case",
    "moduleNumber": "18",
    "moduleTitle": "Engineering case studies",
    "partTitle": "Case studies",
    "tags": [
      "system-design",
      "case",
      "scaling",
      "instagram"
    ],
    "summary": "Instagram's early scaling work separated three jobs that appear together on a phone: running application code, retrieving records, and delivering image bytes.",
    "previewHeading": "The core idea",
    "previewContinuation": "Its engineers' 2011 posts and Mike Krieger's April 2012 talk let us follow those choices and a later decision to remove duplicated state.",
    "sources": [
      "https://instagram-engineering.tumblr.com/post/13649370142/what-powers-instagram-hundreds-of-instances (2011-12-02)",
      "https://speakerdeck.com/mikeyk/scaling-instagram (2012-04-12)",
      "https://instagram-engineering.tumblr.com/post/10853187575/sharding-ids-at-instagram (2011-09-30)",
      "https://fanout.sh/system/archive/case-instagram-early-architecture",
      "https://fanout.sh/system/archive/case-instagram-early-architecture",
      "https://fanout.sh/system/archive/case-instagram-early-architecture",
      "https://fanout.sh/system/archive/case-instagram-early-architecture"
    ],
    "diagram": "flowchart LR\n    subgraph Discord[\"Discord Message Pipeline\"]\n        WS[Gateway WebSockets] --> Cassandra[Cassandra 100B Messages GC Stalls]\n        Cassandra -->|Migrated in Rust| Scylla[ScyllaDB C++ Monolithic Low Latency]\n    end\n    subgraph GitLab[\"GitLab 2017 Outage Lessons\"]\n        Primary[(Primary PG)] -. Out of sync .-> Secondary[(Secondary PG)]\n        Backup[5 Disconnected Backup Systems] --> Failure[Human Error + Silent Backup Failures]\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Case: Instagram's first architecture\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "case-stripe-idempotency-keys": {
    "slug": "case-stripe-idempotency-keys",
    "title": "Case: Stripe's idempotency keys",
    "kind": "case",
    "moduleNumber": "18",
    "moduleTitle": "Engineering case studies",
    "partTitle": "Case studies",
    "tags": [
      "system-design",
      "case",
      "stripe",
      "idempotency"
    ],
    "summary": "An idempotency key tells a server which intended operation a request belongs to.",
    "previewHeading": "The core idea",
    "previewContinuation": "That matters when the server completes work but its reply never reaches the caller: another attempt should recover the result without creating another operation.",
    "sources": [
      "https://stripe.com/blog/idempotency (2017-02-22)",
      "https://docs.stripe.com/api/idempotent_requests (2026-09-18)",
      "https://docs.stripe.com/error-low-level (2026-09-18)",
      "https://docs.stripe.com/api/request_ids (2026-09-18)",
      "https://github.com/stripe/stripe-python#configuring-automatic-retries (2026-09-18)",
      "https://fanout.sh/system/archive/case-stripe-idempotency-keys",
      "https://fanout.sh/system/archive/case-stripe-idempotency-keys",
      "https://fanout.sh/system/archive/case-stripe-idempotency-keys"
    ],
    "diagram": "flowchart LR\n    subgraph Discord[\"Discord Message Pipeline\"]\n        WS[Gateway WebSockets] --> Cassandra[Cassandra 100B Messages GC Stalls]\n        Cassandra -->|Migrated in Rust| Scylla[ScyllaDB C++ Monolithic Low Latency]\n    end\n    subgraph GitLab[\"GitLab 2017 Outage Lessons\"]\n        Primary[(Primary PG)] -. Out of sync .-> Secondary[(Secondary PG)]\n        Backup[5 Disconnected Backup Systems] --> Failure[Human Error + Silent Backup Failures]\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Case: Stripe's idempotency keys\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "case-discord-message-storage": {
    "slug": "case-discord-message-storage",
    "title": "Case: how Discord stores trillions of messages",
    "kind": "case",
    "moduleNumber": "18",
    "moduleTitle": "Engineering case studies",
    "partTitle": "Case studies",
    "tags": [
      "system-design",
      "case-study",
      "discord",
      "partitioning"
    ],
    "summary": "A message store has to serve both a crowded channel and a quiet conversation whose latest messages are months old.",
    "previewHeading": "The core idea",
    "previewContinuation": "Discord's database history shows why those two reads can stress different parts of the same system.",
    "sources": [
      "https://discord.com/blog/how-discord-stores-billions-of-messages (2017-01-13)",
      "https://discord.com/blog/how-discord-stores-trillions-of-messages (2023-03-06)",
      "https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/tombstones.html (2026-09-18)",
      "https://fanout.sh/system/archive/case-discord-message-storage",
      "https://fanout.sh/system/archive/case-discord-message-storage",
      "https://fanout.sh/system/archive/case-discord-message-storage",
      "https://fanout.sh/system/archive/case-discord-message-storage",
      "https://fanout.sh/system/archive/case-discord-message-storage",
      "https://fanout.sh/system/archive/case-discord-message-storage"
    ],
    "diagram": "flowchart LR\n    subgraph Discord[\"Discord Message Pipeline\"]\n        WS[Gateway WebSockets] --> Cassandra[Cassandra 100B Messages GC Stalls]\n        Cassandra -->|Migrated in Rust| Scylla[ScyllaDB C++ Monolithic Low Latency]\n    end\n    subgraph GitLab[\"GitLab 2017 Outage Lessons\"]\n        Primary[(Primary PG)] -. Out of sync .-> Secondary[(Secondary PG)]\n        Backup[5 Disconnected Backup Systems] --> Failure[Human Error + Silent Backup Failures]\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Case: how Discord stores trillions of messages\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "case-amazon-dynamo": {
    "slug": "case-amazon-dynamo",
    "title": "Case: Amazon Dynamo, the paper",
    "kind": "case",
    "moduleNumber": "18",
    "moduleTitle": "Engineering case studies",
    "partTitle": "Case studies",
    "tags": [
      "system-design",
      "case-study",
      "replication",
      "dynamo"
    ],
    "summary": "Dynamo was Amazon's internal key-value store for services that needed to keep accepting useful work during failures.",
    "previewHeading": "The core idea",
    "previewContinuation": "Its 2007 paper is especially useful for understanding what happens after two parts of a system accept different versions of an object.",
    "sources": [
      "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf (2007-10-14)",
      "https://docs.riak.com/riak/kv/2.2.3/learn/concepts/causal-context/index.html (2026-09-18)",
      "https://docs.riak.com/riak/kv/2.1.3/using/reference/handoff/index.html (2026-09-18)",
      "https://docs.riak.com/riak/kv/2.2.3/learn/concepts/active-anti-entropy/index.html (2026-09-18)",
      "https://www.amazon.science/publications/amazon-dynamodb-a-scalable-predictably-performant-and-fully-managed-nosql-database-service (2026-09-18)",
      "https://fanout.sh/system/archive/case-amazon-dynamo",
      "https://fanout.sh/system/archive/case-amazon-dynamo",
      "https://fanout.sh/system/archive/case-amazon-dynamo",
      "https://fanout.sh/system/archive/case-amazon-dynamo",
      "https://fanout.sh/system/archive/case-amazon-dynamo",
      "https://fanout.sh/system/archive/case-amazon-dynamo"
    ],
    "diagram": "flowchart LR\n    subgraph Discord[\"Discord Message Pipeline\"]\n        WS[Gateway WebSockets] --> Cassandra[Cassandra 100B Messages GC Stalls]\n        Cassandra -->|Migrated in Rust| Scylla[ScyllaDB C++ Monolithic Low Latency]\n    end\n    subgraph GitLab[\"GitLab 2017 Outage Lessons\"]\n        Primary[(Primary PG)] -. Out of sync .-> Secondary[(Secondary PG)]\n        Backup[5 Disconnected Backup Systems] --> Failure[Human Error + Silent Backup Failures]\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Case: Amazon Dynamo, the paper\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  },
  "case-gitlab-database-incident": {
    "slug": "case-gitlab-database-incident",
    "title": "Case: GitLab’s database incident",
    "kind": "case",
    "moduleNumber": "18",
    "moduleTitle": "Engineering case studies",
    "partTitle": "Case studies",
    "tags": [
      "system-design",
      "backups",
      "recovery",
      "incident"
    ],
    "summary": "On January 31, 2017, GitLab lost production database data while repairing replication.",
    "previewHeading": "The core idea",
    "previewContinuation": "Service returned the next day using an older copy, leaving about six hours of database changes unrecovered.",
    "sources": [
      "https://about.gitlab.com/blog/gitlab-dot-com-database-incident/ (2017-02-01)",
      "https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/ (2017-02-10)",
      "https://www.postgresql.org/docs/18/continuous-archiving.html (2026-09-17)",
      "https://fanout.sh/system/archive/case-gitlab-database-incident",
      "https://fanout.sh/system/archive/case-gitlab-database-incident"
    ],
    "diagram": "flowchart LR\n    subgraph Discord[\"Discord Message Pipeline\"]\n        WS[Gateway WebSockets] --> Cassandra[Cassandra 100B Messages GC Stalls]\n        Cassandra -->|Migrated in Rust| Scylla[ScyllaDB C++ Monolithic Low Latency]\n    end\n    subgraph GitLab[\"GitLab 2017 Outage Lessons\"]\n        Primary[(Primary PG)] -. Out of sync .-> Secondary[(Secondary PG)]\n        Backup[5 Disconnected Backup Systems] --> Failure[Human Error + Silent Backup Failures]\n    end",
    "deepDive": {
      "problemStatement": "In high-scale distributed systems, \"Case: GitLab’s database incident\" becomes a critical architectural bottleneck when request volume, dataset size, or concurrency exceeds single-host boundaries.",
      "naiveApproachFailure": "A naïve implementation typically relies on centralized locks, unindexed database tables, or synchronous blocking calls. At scale, this leads to connection exhaustion, thread starvation, write amplification, or cascading tail latency.",
      "productionArchitecture": "Production architectures address this by enforcing clear service boundaries, applying asynchronous processing where appropriate, and relying on proven distributed primitives such as partitioning, append-only logs, and multi-version concurrency control.",
      "tradeoffs": [
        {
          "axis": "Consistency vs Latency",
          "description": "Enforcing strong linearizability adds cross-datacenter roundtrip latency (RTT), whereas eventual consistency delivers sub-millisecond p99 reads at the expense of temporary stale reads."
        },
        {
          "axis": "Storage vs Compute",
          "description": "Precomputing aggregations (e.g. denormalized views or sketches) consumes additional memory/disk but eliminates expensive on-the-fly table scans."
        },
        {
          "axis": "Availability vs Partition Tolerance",
          "description": "Under network partitions (CAP theorem), the system must choose between returning an error (CP) or serving potentially stale data (AP)."
        }
      ],
      "interviewChecklist": [
        "Clarify functional requirements and non-functional SLOs (latency target, availability nines, durability guarantees).",
        "Estimate back-of-the-envelope capacity: Peak QPS, storage growth per year, network bandwidth.",
        "Establish high-level API contracts and database schema before detailing edge cases.",
        "Identify single points of failure (SPOFs) and define explicit circuit-breaking and retry budget policies.",
        "Explain operational monitoring metrics: p99 latency SLI, error budget burn rate, and replication lag."
      ]
    }
  }
};
