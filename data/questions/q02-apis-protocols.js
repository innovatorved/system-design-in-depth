window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["api-design-contracts"] = [
  {
    id: "api-design-contracts-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Api Design Contracts?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["api-design-contracts", "basics"]
  },
  {
    id: "api-design-contracts-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Api Design Contracts, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["api-design-contracts", "troubleshooting"]
  },
  {
    id: "api-design-contracts-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Api Design Contracts at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["api-design-contracts", "architecture"]
  }
];

window.QUESTION_BANK["service-to-service-communication"] = [
  {
    id: "service-to-service-communication-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Service To Service Communication?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["service-to-service-communication", "basics"]
  },
  {
    id: "service-to-service-communication-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Service To Service Communication, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["service-to-service-communication", "troubleshooting"]
  },
  {
    id: "service-to-service-communication-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Service To Service Communication at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["service-to-service-communication", "architecture"]
  }
];

window.QUESTION_BANK["http-rest-grpc"] = [
  {
    id: "http-rest-grpc-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Http Rest Grpc?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["http-rest-grpc", "basics"]
  },
  {
    id: "http-rest-grpc-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Http Rest Grpc, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["http-rest-grpc", "troubleshooting"]
  },
  {
    id: "http-rest-grpc-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Http Rest Grpc at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["http-rest-grpc", "architecture"]
  }
];

window.QUESTION_BANK["tcp-vs-udp"] = [
  {
    id: "tcp-vs-udp-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Tcp Vs Udp?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["tcp-vs-udp", "basics"]
  },
  {
    id: "tcp-vs-udp-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Tcp Vs Udp, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["tcp-vs-udp", "troubleshooting"]
  },
  {
    id: "tcp-vs-udp-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Tcp Vs Udp at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["tcp-vs-udp", "architecture"]
  }
];

window.QUESTION_BANK["api-gateway-vs-load-balancer"] = [
  {
    id: "api-gateway-vs-load-balancer-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Api Gateway Vs Load Balancer?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["api-gateway-vs-load-balancer", "basics"]
  },
  {
    id: "api-gateway-vs-load-balancer-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Api Gateway Vs Load Balancer, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["api-gateway-vs-load-balancer", "troubleshooting"]
  },
  {
    id: "api-gateway-vs-load-balancer-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Api Gateway Vs Load Balancer at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["api-gateway-vs-load-balancer", "architecture"]
  }
];

window.QUESTION_BANK["load-balancers"] = [
  {
    id: "load-balancers-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Load Balancers?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["load-balancers", "basics"]
  },
  {
    id: "load-balancers-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Load Balancers, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["load-balancers", "troubleshooting"]
  },
  {
    id: "load-balancers-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Load Balancers at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["load-balancers", "architecture"]
  }
];

window.QUESTION_BANK["consistent-hashing-load-balancing"] = [
  {
    id: "consistent-hashing-load-balancing-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Consistent Hashing Load Balancing?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["consistent-hashing-load-balancing", "basics"]
  },
  {
    id: "consistent-hashing-load-balancing-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Consistent Hashing Load Balancing, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["consistent-hashing-load-balancing", "troubleshooting"]
  },
  {
    id: "consistent-hashing-load-balancing-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Consistent Hashing Load Balancing at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["consistent-hashing-load-balancing", "architecture"]
  }
];

window.QUESTION_BANK["event-contracts"] = [
  {
    id: "event-contracts-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Event Contracts?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["event-contracts", "basics"]
  },
  {
    id: "event-contracts-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Event Contracts, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["event-contracts", "troubleshooting"]
  },
  {
    id: "event-contracts-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Event Contracts at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["event-contracts", "architecture"]
  }
];

window.QUESTION_BANK["retries-timeouts-idempotency"] = [
  {
    id: "retries-timeouts-idempotency-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Retries Timeouts Idempotency?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["retries-timeouts-idempotency", "basics"]
  },
  {
    id: "retries-timeouts-idempotency-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Retries Timeouts Idempotency, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["retries-timeouts-idempotency", "troubleshooting"]
  },
  {
    id: "retries-timeouts-idempotency-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Retries Timeouts Idempotency at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["retries-timeouts-idempotency", "architecture"]
  }
];

window.QUESTION_BANK["batching"] = [
  {
    id: "batching-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Batching?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["batching", "basics"]
  },
  {
    id: "batching-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Batching, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["batching", "troubleshooting"]
  },
  {
    id: "batching-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Batching at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["batching", "architecture"]
  }
];

window.QUESTION_BANK["backpressure"] = [
  {
    id: "backpressure-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Backpressure?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["backpressure", "basics"]
  },
  {
    id: "backpressure-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Backpressure, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["backpressure", "troubleshooting"]
  },
  {
    id: "backpressure-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Backpressure at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["backpressure", "architecture"]
  }
];

window.QUESTION_BANK["tail-latency"] = [
  {
    id: "tail-latency-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Tail Latency?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["tail-latency", "basics"]
  },
  {
    id: "tail-latency-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Tail Latency, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["tail-latency", "troubleshooting"]
  },
  {
    id: "tail-latency-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Tail Latency at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["tail-latency", "architecture"]
  }
];

window.QUESTION_BANK["load-shedding"] = [
  {
    id: "load-shedding-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Load Shedding?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["load-shedding", "basics"]
  },
  {
    id: "load-shedding-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Load Shedding, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["load-shedding", "troubleshooting"]
  },
  {
    id: "load-shedding-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Load Shedding at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["load-shedding", "architecture"]
  }
];

