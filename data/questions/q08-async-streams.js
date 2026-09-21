window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["delegation-and-async-work"] = [
  {
    id: "delegation-and-async-work-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Delegation And Async Work in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Delegation And Async Work generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["delegation-and-async-work", "recall"]
  },
  {
    id: "delegation-and-async-work-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Delegation And Async Work. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Delegation And Async Work principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Delegation And Async Work principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["delegation-and-async-work", "apply"]
  },
  {
    id: "delegation-and-async-work-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Delegation And Async Work at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Delegation And Async Work often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["delegation-and-async-work", "staff"]
  }
];

window.QUESTION_BANK["task-queue-vs-event-stream"] = [
  {
    id: "task-queue-vs-event-stream-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Task Queue Vs Event Stream in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Task Queue Vs Event Stream generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["task-queue-vs-event-stream", "recall"]
  },
  {
    id: "task-queue-vs-event-stream-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Task Queue Vs Event Stream. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Task Queue Vs Event Stream principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Task Queue Vs Event Stream principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["task-queue-vs-event-stream", "apply"]
  },
  {
    id: "task-queue-vs-event-stream-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Task Queue Vs Event Stream at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Task Queue Vs Event Stream often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["task-queue-vs-event-stream", "staff"]
  }
];

window.QUESTION_BANK["event-bus-for-product-events"] = [
  {
    id: "event-bus-for-product-events-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Event Bus For Product Events in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Event Bus For Product Events generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["event-bus-for-product-events", "recall"]
  },
  {
    id: "event-bus-for-product-events-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Event Bus For Product Events. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Event Bus For Product Events principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Event Bus For Product Events principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["event-bus-for-product-events", "apply"]
  },
  {
    id: "event-bus-for-product-events-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Event Bus For Product Events at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Event Bus For Product Events often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["event-bus-for-product-events", "staff"]
  }
];

window.QUESTION_BANK["queue-lag"] = [
  {
    id: "queue-lag-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Queue Lag in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Queue Lag generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["queue-lag", "recall"]
  },
  {
    id: "queue-lag-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Queue Lag. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Queue Lag principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Queue Lag principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["queue-lag", "apply"]
  },
  {
    id: "queue-lag-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Queue Lag at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Queue Lag often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["queue-lag", "staff"]
  }
];

window.QUESTION_BANK["distributed-task-scheduler"] = [
  {
    id: "distributed-task-scheduler-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Distributed Task Scheduler in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Distributed Task Scheduler generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["distributed-task-scheduler", "recall"]
  },
  {
    id: "distributed-task-scheduler-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Distributed Task Scheduler. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Distributed Task Scheduler principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Distributed Task Scheduler principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["distributed-task-scheduler", "apply"]
  },
  {
    id: "distributed-task-scheduler-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Distributed Task Scheduler at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Distributed Task Scheduler often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["distributed-task-scheduler", "staff"]
  }
];

window.QUESTION_BANK["postgres-skip-locked-work-queue"] = [
  {
    id: "postgres-skip-locked-work-queue-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Postgres Skip Locked Work Queue in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Postgres Skip Locked Work Queue generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["postgres-skip-locked-work-queue", "recall"]
  },
  {
    id: "postgres-skip-locked-work-queue-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Postgres Skip Locked Work Queue. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Postgres Skip Locked Work Queue principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Postgres Skip Locked Work Queue principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["postgres-skip-locked-work-queue", "apply"]
  },
  {
    id: "postgres-skip-locked-work-queue-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Postgres Skip Locked Work Queue at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Postgres Skip Locked Work Queue often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["postgres-skip-locked-work-queue", "staff"]
  }
];

window.QUESTION_BANK["dag-workflow-orchestration"] = [
  {
    id: "dag-workflow-orchestration-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Dag Workflow Orchestration in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Dag Workflow Orchestration generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["dag-workflow-orchestration", "recall"]
  },
  {
    id: "dag-workflow-orchestration-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Dag Workflow Orchestration. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Dag Workflow Orchestration principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Dag Workflow Orchestration principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["dag-workflow-orchestration", "apply"]
  },
  {
    id: "dag-workflow-orchestration-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Dag Workflow Orchestration at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Dag Workflow Orchestration often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["dag-workflow-orchestration", "staff"]
  }
];

window.QUESTION_BANK["rule-engine-trigger-framework"] = [
  {
    id: "rule-engine-trigger-framework-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Rule Engine Trigger Framework in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Rule Engine Trigger Framework generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["rule-engine-trigger-framework", "recall"]
  },
  {
    id: "rule-engine-trigger-framework-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Rule Engine Trigger Framework. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Rule Engine Trigger Framework principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Rule Engine Trigger Framework principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["rule-engine-trigger-framework", "apply"]
  },
  {
    id: "rule-engine-trigger-framework-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Rule Engine Trigger Framework at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Rule Engine Trigger Framework often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["rule-engine-trigger-framework", "staff"]
  }
];

window.QUESTION_BANK["fanout-patterns"] = [
  {
    id: "fanout-patterns-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Fanout Patterns in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Fanout Patterns generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["fanout-patterns", "recall"]
  },
  {
    id: "fanout-patterns-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Fanout Patterns. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Fanout Patterns principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Fanout Patterns principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["fanout-patterns", "apply"]
  },
  {
    id: "fanout-patterns-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Fanout Patterns at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Fanout Patterns often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["fanout-patterns", "staff"]
  }
];

window.QUESTION_BANK["flash-sale-inventory-locking"] = [
  {
    id: "flash-sale-inventory-locking-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Flash Sale Inventory Locking in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Flash Sale Inventory Locking generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["flash-sale-inventory-locking", "recall"]
  },
  {
    id: "flash-sale-inventory-locking-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Flash Sale Inventory Locking. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Flash Sale Inventory Locking principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Flash Sale Inventory Locking principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["flash-sale-inventory-locking", "apply"]
  },
  {
    id: "flash-sale-inventory-locking-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Flash Sale Inventory Locking at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Flash Sale Inventory Locking often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["flash-sale-inventory-locking", "staff"]
  }
];

