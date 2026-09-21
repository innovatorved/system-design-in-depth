window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["nosql-decision-boundaries"] = [
  {
    id: "nosql-decision-boundaries-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Nosql Decision Boundaries?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["nosql-decision-boundaries", "basics"]
  },
  {
    id: "nosql-decision-boundaries-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Nosql Decision Boundaries, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["nosql-decision-boundaries", "troubleshooting"]
  },
  {
    id: "nosql-decision-boundaries-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Nosql Decision Boundaries at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["nosql-decision-boundaries", "architecture"]
  }
];

window.QUESTION_BANK["document-vs-key-value-stores"] = [
  {
    id: "document-vs-key-value-stores-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Document Vs Key Value Stores?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["document-vs-key-value-stores", "basics"]
  },
  {
    id: "document-vs-key-value-stores-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Document Vs Key Value Stores, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["document-vs-key-value-stores", "troubleshooting"]
  },
  {
    id: "document-vs-key-value-stores-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Document Vs Key Value Stores at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["document-vs-key-value-stores", "architecture"]
  }
];

window.QUESTION_BANK["columnar-vs-wide-column-stores"] = [
  {
    id: "columnar-vs-wide-column-stores-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Columnar Vs Wide Column Stores?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["columnar-vs-wide-column-stores", "basics"]
  },
  {
    id: "columnar-vs-wide-column-stores-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Columnar Vs Wide Column Stores, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["columnar-vs-wide-column-stores", "troubleshooting"]
  },
  {
    id: "columnar-vs-wide-column-stores-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Columnar Vs Wide Column Stores at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["columnar-vs-wide-column-stores", "architecture"]
  }
];

window.QUESTION_BANK["graph-database-decision-boundary"] = [
  {
    id: "graph-database-decision-boundary-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Graph Database Decision Boundary?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["graph-database-decision-boundary", "basics"]
  },
  {
    id: "graph-database-decision-boundary-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Graph Database Decision Boundary, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["graph-database-decision-boundary", "troubleshooting"]
  },
  {
    id: "graph-database-decision-boundary-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Graph Database Decision Boundary at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["graph-database-decision-boundary", "architecture"]
  }
];

window.QUESTION_BANK["sharding-and-partitioning"] = [
  {
    id: "sharding-and-partitioning-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Sharding And Partitioning?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["sharding-and-partitioning", "basics"]
  },
  {
    id: "sharding-and-partitioning-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Sharding And Partitioning, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["sharding-and-partitioning", "troubleshooting"]
  },
  {
    id: "sharding-and-partitioning-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Sharding And Partitioning at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["sharding-and-partitioning", "architecture"]
  }
];

window.QUESTION_BANK["hot-partitions"] = [
  {
    id: "hot-partitions-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Hot Partitions?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["hot-partitions", "basics"]
  },
  {
    id: "hot-partitions-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Hot Partitions, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["hot-partitions", "troubleshooting"]
  },
  {
    id: "hot-partitions-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Hot Partitions at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["hot-partitions", "architecture"]
  }
];

window.QUESTION_BANK["consistent-hashing"] = [
  {
    id: "consistent-hashing-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Consistent Hashing?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["consistent-hashing", "basics"]
  },
  {
    id: "consistent-hashing-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Consistent Hashing, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["consistent-hashing", "troubleshooting"]
  },
  {
    id: "consistent-hashing-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Consistent Hashing at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["consistent-hashing", "architecture"]
  }
];

window.QUESTION_BANK["distributed-id-generation"] = [
  {
    id: "distributed-id-generation-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Distributed Id Generation?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["distributed-id-generation", "basics"]
  },
  {
    id: "distributed-id-generation-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Distributed Id Generation, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["distributed-id-generation", "troubleshooting"]
  },
  {
    id: "distributed-id-generation-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Distributed Id Generation at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["distributed-id-generation", "architecture"]
  }
];

window.QUESTION_BANK["uuid-objectid-and-snowflake"] = [
  {
    id: "uuid-objectid-and-snowflake-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Uuid Objectid And Snowflake?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["uuid-objectid-and-snowflake", "basics"]
  },
  {
    id: "uuid-objectid-and-snowflake-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Uuid Objectid And Snowflake, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["uuid-objectid-and-snowflake", "troubleshooting"]
  },
  {
    id: "uuid-objectid-and-snowflake-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Uuid Objectid And Snowflake at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["uuid-objectid-and-snowflake", "architecture"]
  }
];

window.QUESTION_BANK["snowflake-id-design"] = [
  {
    id: "snowflake-id-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Snowflake Id Design?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["snowflake-id-design", "basics"]
  },
  {
    id: "snowflake-id-design-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Snowflake Id Design, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["snowflake-id-design", "troubleshooting"]
  },
  {
    id: "snowflake-id-design-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Snowflake Id Design at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["snowflake-id-design", "architecture"]
  }
];

window.QUESTION_BANK["clock-skew-and-id-ordering"] = [
  {
    id: "clock-skew-and-id-ordering-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Clock Skew And Id Ordering?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["clock-skew-and-id-ordering", "basics"]
  },
  {
    id: "clock-skew-and-id-ordering-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Clock Skew And Id Ordering, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["clock-skew-and-id-ordering", "troubleshooting"]
  },
  {
    id: "clock-skew-and-id-ordering-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Clock Skew And Id Ordering at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["clock-skew-and-id-ordering", "architecture"]
  }
];

window.QUESTION_BANK["keyset-pagination"] = [
  {
    id: "keyset-pagination-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Keyset Pagination?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["keyset-pagination", "basics"]
  },
  {
    id: "keyset-pagination-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Keyset Pagination, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["keyset-pagination", "troubleshooting"]
  },
  {
    id: "keyset-pagination-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Keyset Pagination at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["keyset-pagination", "architecture"]
  }
];

window.QUESTION_BANK["bloom-filters"] = [
  {
    id: "bloom-filters-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Bloom Filters?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["bloom-filters", "basics"]
  },
  {
    id: "bloom-filters-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Bloom Filters, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["bloom-filters", "troubleshooting"]
  },
  {
    id: "bloom-filters-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Bloom Filters at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["bloom-filters", "architecture"]
  }
];

window.QUESTION_BANK["hot-cold-storage-archival"] = [
  {
    id: "hot-cold-storage-archival-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Hot Cold Storage Archival?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["hot-cold-storage-archival", "basics"]
  },
  {
    id: "hot-cold-storage-archival-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Hot Cold Storage Archival, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["hot-cold-storage-archival", "troubleshooting"]
  },
  {
    id: "hot-cold-storage-archival-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Hot Cold Storage Archival at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["hot-cold-storage-archival", "architecture"]
  }
];

