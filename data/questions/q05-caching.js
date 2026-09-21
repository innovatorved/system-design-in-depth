window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["caching-layers"] = [
  {
    id: "caching-layers-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Caching Layers?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["caching-layers", "basics"]
  },
  {
    id: "caching-layers-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Caching Layers, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["caching-layers", "troubleshooting"]
  },
  {
    id: "caching-layers-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Caching Layers at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["caching-layers", "architecture"]
  }
];

window.QUESTION_BANK["distributed-cache-design"] = [
  {
    id: "distributed-cache-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Distributed Cache Design?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["distributed-cache-design", "basics"]
  },
  {
    id: "distributed-cache-design-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Distributed Cache Design, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["distributed-cache-design", "troubleshooting"]
  },
  {
    id: "distributed-cache-design-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Distributed Cache Design at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["distributed-cache-design", "architecture"]
  }
];

window.QUESTION_BANK["cache-eviction-policies"] = [
  {
    id: "cache-eviction-policies-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Cache Eviction Policies?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["cache-eviction-policies", "basics"]
  },
  {
    id: "cache-eviction-policies-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Cache Eviction Policies, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["cache-eviction-policies", "troubleshooting"]
  },
  {
    id: "cache-eviction-policies-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Cache Eviction Policies at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["cache-eviction-policies", "architecture"]
  }
];

window.QUESTION_BANK["ttl-expiration-and-cache-reapers"] = [
  {
    id: "ttl-expiration-and-cache-reapers-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Ttl Expiration And Cache Reapers?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["ttl-expiration-and-cache-reapers", "basics"]
  },
  {
    id: "ttl-expiration-and-cache-reapers-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Ttl Expiration And Cache Reapers, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["ttl-expiration-and-cache-reapers", "troubleshooting"]
  },
  {
    id: "ttl-expiration-and-cache-reapers-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Ttl Expiration And Cache Reapers at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["ttl-expiration-and-cache-reapers", "architecture"]
  }
];

window.QUESTION_BANK["cache-concurrency-control"] = [
  {
    id: "cache-concurrency-control-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Cache Concurrency Control?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["cache-concurrency-control", "basics"]
  },
  {
    id: "cache-concurrency-control-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Cache Concurrency Control, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["cache-concurrency-control", "troubleshooting"]
  },
  {
    id: "cache-concurrency-control-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Cache Concurrency Control at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["cache-concurrency-control", "architecture"]
  }
];

window.QUESTION_BANK["cache-availability-and-database-fallback"] = [
  {
    id: "cache-availability-and-database-fallback-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Cache Availability And Database Fallback?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["cache-availability-and-database-fallback", "basics"]
  },
  {
    id: "cache-availability-and-database-fallback-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Cache Availability And Database Fallback, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["cache-availability-and-database-fallback", "troubleshooting"]
  },
  {
    id: "cache-availability-and-database-fallback-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Cache Availability And Database Fallback at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["cache-availability-and-database-fallback", "architecture"]
  }
];

