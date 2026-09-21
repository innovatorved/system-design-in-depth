window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["requirements-clarification"] = [
  {
    id: "requirements-clarification-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Requirements Clarification?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["requirements-clarification", "basics"]
  },
  {
    id: "requirements-clarification-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Requirements Clarification, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["requirements-clarification", "troubleshooting"]
  },
  {
    id: "requirements-clarification-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Requirements Clarification at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["requirements-clarification", "architecture"]
  }
];

window.QUESTION_BANK["logical-system-design"] = [
  {
    id: "logical-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Logical System Design?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["logical-system-design", "basics"]
  },
  {
    id: "logical-system-design-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Logical System Design, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["logical-system-design", "troubleshooting"]
  },
  {
    id: "logical-system-design-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Logical System Design at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["logical-system-design", "architecture"]
  }
];

window.QUESTION_BANK["non-functional-requirements"] = [
  {
    id: "non-functional-requirements-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Non Functional Requirements?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["non-functional-requirements", "basics"]
  },
  {
    id: "non-functional-requirements-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Non Functional Requirements, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["non-functional-requirements", "troubleshooting"]
  },
  {
    id: "non-functional-requirements-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Non Functional Requirements at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["non-functional-requirements", "architecture"]
  }
];

window.QUESTION_BANK["system-design-tradeoffs"] = [
  {
    id: "system-design-tradeoffs-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of System Design Tradeoffs?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["system-design-tradeoffs", "basics"]
  },
  {
    id: "system-design-tradeoffs-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving System Design Tradeoffs, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["system-design-tradeoffs", "troubleshooting"]
  },
  {
    id: "system-design-tradeoffs-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for System Design Tradeoffs at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["system-design-tradeoffs", "architecture"]
  }
];

window.QUESTION_BANK["availability-durability-consistency-cost"] = [
  {
    id: "availability-durability-consistency-cost-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Availability Durability Consistency Cost?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["availability-durability-consistency-cost", "basics"]
  },
  {
    id: "availability-durability-consistency-cost-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Availability Durability Consistency Cost, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["availability-durability-consistency-cost", "troubleshooting"]
  },
  {
    id: "availability-durability-consistency-cost-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Availability Durability Consistency Cost at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["availability-durability-consistency-cost", "architecture"]
  }
];

window.QUESTION_BANK["back-of-the-envelope-capacity-planning"] = [
  {
    id: "back-of-the-envelope-capacity-planning-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Back Of The Envelope Capacity Planning?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["back-of-the-envelope-capacity-planning", "basics"]
  },
  {
    id: "back-of-the-envelope-capacity-planning-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Back Of The Envelope Capacity Planning, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["back-of-the-envelope-capacity-planning", "troubleshooting"]
  },
  {
    id: "back-of-the-envelope-capacity-planning-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Back Of The Envelope Capacity Planning at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["back-of-the-envelope-capacity-planning", "architecture"]
  }
];

window.QUESTION_BANK["concurrency-vs-parallelism"] = [
  {
    id: "concurrency-vs-parallelism-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Concurrency Vs Parallelism?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["concurrency-vs-parallelism", "basics"]
  },
  {
    id: "concurrency-vs-parallelism-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Concurrency Vs Parallelism, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["concurrency-vs-parallelism", "troubleshooting"]
  },
  {
    id: "concurrency-vs-parallelism-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Concurrency Vs Parallelism at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["concurrency-vs-parallelism", "architecture"]
  }
];

window.QUESTION_BANK["horizontal-vs-vertical-scaling"] = [
  {
    id: "horizontal-vs-vertical-scaling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Horizontal Vs Vertical Scaling?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["horizontal-vs-vertical-scaling", "basics"]
  },
  {
    id: "horizontal-vs-vertical-scaling-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Horizontal Vs Vertical Scaling, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["horizontal-vs-vertical-scaling", "troubleshooting"]
  },
  {
    id: "horizontal-vs-vertical-scaling-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Horizontal Vs Vertical Scaling at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["horizontal-vs-vertical-scaling", "architecture"]
  }
];

window.QUESTION_BANK["monolith-vs-microservices"] = [
  {
    id: "monolith-vs-microservices-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Monolith Vs Microservices?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["monolith-vs-microservices", "basics"]
  },
  {
    id: "monolith-vs-microservices-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Monolith Vs Microservices, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["monolith-vs-microservices", "troubleshooting"]
  },
  {
    id: "monolith-vs-microservices-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Monolith Vs Microservices at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["monolith-vs-microservices", "architecture"]
  }
];

window.QUESTION_BANK["repository-pattern"] = [
  {
    id: "repository-pattern-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Repository Pattern?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["repository-pattern", "basics"]
  },
  {
    id: "repository-pattern-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Repository Pattern, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["repository-pattern", "troubleshooting"]
  },
  {
    id: "repository-pattern-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Repository Pattern at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["repository-pattern", "architecture"]
  }
];

window.QUESTION_BANK["extensible-data-modeling"] = [
  {
    id: "extensible-data-modeling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Extensible Data Modeling?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["extensible-data-modeling", "basics"]
  },
  {
    id: "extensible-data-modeling-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Extensible Data Modeling, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["extensible-data-modeling", "troubleshooting"]
  },
  {
    id: "extensible-data-modeling-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Extensible Data Modeling at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["extensible-data-modeling", "architecture"]
  }
];

window.QUESTION_BANK["cost-aware-architecture"] = [
  {
    id: "cost-aware-architecture-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Cost Aware Architecture?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["cost-aware-architecture", "basics"]
  },
  {
    id: "cost-aware-architecture-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Cost Aware Architecture, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["cost-aware-architecture", "troubleshooting"]
  },
  {
    id: "cost-aware-architecture-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Cost Aware Architecture at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["cost-aware-architecture", "architecture"]
  }
];

window.QUESTION_BANK["when-not-to-add-infrastructure"] = [
  {
    id: "when-not-to-add-infrastructure-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of When Not To Add Infrastructure?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["when-not-to-add-infrastructure", "basics"]
  },
  {
    id: "when-not-to-add-infrastructure-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving When Not To Add Infrastructure, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["when-not-to-add-infrastructure", "troubleshooting"]
  },
  {
    id: "when-not-to-add-infrastructure-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for When Not To Add Infrastructure at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["when-not-to-add-infrastructure", "architecture"]
  }
];

