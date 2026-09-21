window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["counting-at-scale"] = [
  {
    id: "counting-at-scale-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Counting At Scale in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Counting At Scale generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["counting-at-scale", "recall"]
  },
  {
    id: "counting-at-scale-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Counting At Scale. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Counting At Scale principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Counting At Scale principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["counting-at-scale", "apply"]
  },
  {
    id: "counting-at-scale-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Counting At Scale at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Counting At Scale often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["counting-at-scale", "staff"]
  }
];

window.QUESTION_BANK["view-counting-at-scale"] = [
  {
    id: "view-counting-at-scale-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of View Counting At Scale in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "View Counting At Scale generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["view-counting-at-scale", "recall"]
  },
  {
    id: "view-counting-at-scale-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering View Counting At Scale. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using View Counting At Scale principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying View Counting At Scale principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["view-counting-at-scale", "apply"]
  },
  {
    id: "view-counting-at-scale-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing View Counting At Scale at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing View Counting At Scale often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["view-counting-at-scale", "staff"]
  }
];

window.QUESTION_BANK["impression-counting-system-design"] = [
  {
    id: "impression-counting-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Impression Counting System Design in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Impression Counting System Design generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["impression-counting-system-design", "recall"]
  },
  {
    id: "impression-counting-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Impression Counting System Design. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Impression Counting System Design principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Impression Counting System Design principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["impression-counting-system-design", "apply"]
  },
  {
    id: "impression-counting-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Impression Counting System Design at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Impression Counting System Design often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["impression-counting-system-design", "staff"]
  }
];

window.QUESTION_BANK["hyperloglog-cardinality-estimation"] = [
  {
    id: "hyperloglog-cardinality-estimation-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Hyperloglog Cardinality Estimation in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Hyperloglog Cardinality Estimation generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["hyperloglog-cardinality-estimation", "recall"]
  },
  {
    id: "hyperloglog-cardinality-estimation-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Hyperloglog Cardinality Estimation. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Hyperloglog Cardinality Estimation principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Hyperloglog Cardinality Estimation principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["hyperloglog-cardinality-estimation", "apply"]
  },
  {
    id: "hyperloglog-cardinality-estimation-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Hyperloglog Cardinality Estimation at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Hyperloglog Cardinality Estimation often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["hyperloglog-cardinality-estimation", "staff"]
  }
];

window.QUESTION_BANK["mergeable-sketches-for-analytics"] = [
  {
    id: "mergeable-sketches-for-analytics-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Mergeable Sketches For Analytics in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Mergeable Sketches For Analytics generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["mergeable-sketches-for-analytics", "recall"]
  },
  {
    id: "mergeable-sketches-for-analytics-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Mergeable Sketches For Analytics. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Mergeable Sketches For Analytics principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Mergeable Sketches For Analytics principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["mergeable-sketches-for-analytics", "apply"]
  },
  {
    id: "mergeable-sketches-for-analytics-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Mergeable Sketches For Analytics at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Mergeable Sketches For Analytics often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["mergeable-sketches-for-analytics", "staff"]
  }
];

window.QUESTION_BANK["bucketed-time-window-aggregation"] = [
  {
    id: "bucketed-time-window-aggregation-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Bucketed Time Window Aggregation in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Bucketed Time Window Aggregation generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["bucketed-time-window-aggregation", "recall"]
  },
  {
    id: "bucketed-time-window-aggregation-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Bucketed Time Window Aggregation. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Bucketed Time Window Aggregation principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Bucketed Time Window Aggregation principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["bucketed-time-window-aggregation", "apply"]
  },
  {
    id: "bucketed-time-window-aggregation-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Bucketed Time Window Aggregation at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Bucketed Time Window Aggregation often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["bucketed-time-window-aggregation", "staff"]
  }
];

window.QUESTION_BANK["raw-events-vs-derived-analytics"] = [
  {
    id: "raw-events-vs-derived-analytics-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Raw Events Vs Derived Analytics in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Raw Events Vs Derived Analytics generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["raw-events-vs-derived-analytics", "recall"]
  },
  {
    id: "raw-events-vs-derived-analytics-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Raw Events Vs Derived Analytics. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Raw Events Vs Derived Analytics principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Raw Events Vs Derived Analytics principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["raw-events-vs-derived-analytics", "apply"]
  },
  {
    id: "raw-events-vs-derived-analytics-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Raw Events Vs Derived Analytics at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Raw Events Vs Derived Analytics often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["raw-events-vs-derived-analytics", "staff"]
  }
];

window.QUESTION_BANK["count-min-sketch"] = [
  {
    id: "count-min-sketch-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Count Min Sketch in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Count Min Sketch generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["count-min-sketch", "recall"]
  },
  {
    id: "count-min-sketch-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Count Min Sketch. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Count Min Sketch principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Count Min Sketch principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["count-min-sketch", "apply"]
  },
  {
    id: "count-min-sketch-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Count Min Sketch at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Count Min Sketch often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["count-min-sketch", "staff"]
  }
];

window.QUESTION_BANK["top-k-heavy-hitters"] = [
  {
    id: "top-k-heavy-hitters-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Top K Heavy Hitters in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Top K Heavy Hitters generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["top-k-heavy-hitters", "recall"]
  },
  {
    id: "top-k-heavy-hitters-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Top K Heavy Hitters. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Top K Heavy Hitters principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Top K Heavy Hitters principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["top-k-heavy-hitters", "apply"]
  },
  {
    id: "top-k-heavy-hitters-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Top K Heavy Hitters at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Top K Heavy Hitters often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["top-k-heavy-hitters", "staff"]
  }
];

window.QUESTION_BANK["reservoir-sampling"] = [
  {
    id: "reservoir-sampling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Reservoir Sampling in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Reservoir Sampling generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["reservoir-sampling", "recall"]
  },
  {
    id: "reservoir-sampling-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Reservoir Sampling. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Reservoir Sampling principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Reservoir Sampling principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["reservoir-sampling", "apply"]
  },
  {
    id: "reservoir-sampling-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Reservoir Sampling at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Reservoir Sampling often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["reservoir-sampling", "staff"]
  }
];

window.QUESTION_BANK["tdigest-quantile-sketch"] = [
  {
    id: "tdigest-quantile-sketch-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Tdigest Quantile Sketch in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Tdigest Quantile Sketch generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["tdigest-quantile-sketch", "recall"]
  },
  {
    id: "tdigest-quantile-sketch-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Tdigest Quantile Sketch. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Tdigest Quantile Sketch principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Tdigest Quantile Sketch principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["tdigest-quantile-sketch", "apply"]
  },
  {
    id: "tdigest-quantile-sketch-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Tdigest Quantile Sketch at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Tdigest Quantile Sketch often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["tdigest-quantile-sketch", "staff"]
  }
];

window.QUESTION_BANK["streaming-percentile-analytics"] = [
  {
    id: "streaming-percentile-analytics-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Streaming Percentile Analytics in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Streaming Percentile Analytics generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["streaming-percentile-analytics", "recall"]
  },
  {
    id: "streaming-percentile-analytics-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Streaming Percentile Analytics. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Streaming Percentile Analytics principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Streaming Percentile Analytics principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["streaming-percentile-analytics", "apply"]
  },
  {
    id: "streaming-percentile-analytics-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Streaming Percentile Analytics at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Streaming Percentile Analytics often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["streaming-percentile-analytics", "staff"]
  }
];

window.QUESTION_BANK["live-reactions-high-throughput-design"] = [
  {
    id: "live-reactions-high-throughput-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Live Reactions High Throughput Design in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Live Reactions High Throughput Design generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["live-reactions-high-throughput-design", "recall"]
  },
  {
    id: "live-reactions-high-throughput-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Live Reactions High Throughput Design. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Live Reactions High Throughput Design principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Live Reactions High Throughput Design principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["live-reactions-high-throughput-design", "apply"]
  },
  {
    id: "live-reactions-high-throughput-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Live Reactions High Throughput Design at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Live Reactions High Throughput Design often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["live-reactions-high-throughput-design", "staff"]
  }
];

