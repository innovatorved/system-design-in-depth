window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["relational-database-design"] = [
  {
    id: "relational-database-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Relational Database Design?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["relational-database-design", "basics"]
  },
  {
    id: "relational-database-design-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Relational Database Design, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["relational-database-design", "troubleshooting"]
  },
  {
    id: "relational-database-design-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Relational Database Design at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["relational-database-design", "architecture"]
  }
];

window.QUESTION_BANK["sql-backed-key-value-store"] = [
  {
    id: "sql-backed-key-value-store-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Sql Backed Key Value Store?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["sql-backed-key-value-store", "basics"]
  },
  {
    id: "sql-backed-key-value-store-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Sql Backed Key Value Store, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["sql-backed-key-value-store", "troubleshooting"]
  },
  {
    id: "sql-backed-key-value-store-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Sql Backed Key Value Store at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["sql-backed-key-value-store", "architecture"]
  }
];

window.QUESTION_BANK["database-indexing"] = [
  {
    id: "database-indexing-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Database Indexing?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["database-indexing", "basics"]
  },
  {
    id: "database-indexing-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Database Indexing, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["database-indexing", "troubleshooting"]
  },
  {
    id: "database-indexing-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Database Indexing at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["database-indexing", "architecture"]
  }
];

window.QUESTION_BANK["b-tree"] = [
  {
    id: "b-tree-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of B Tree?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["b-tree", "basics"]
  },
  {
    id: "b-tree-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving B Tree, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["b-tree", "troubleshooting"]
  },
  {
    id: "b-tree-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for B Tree at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["b-tree", "architecture"]
  }
];

window.QUESTION_BANK["query-planning"] = [
  {
    id: "query-planning-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Query Planning?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["query-planning", "basics"]
  },
  {
    id: "query-planning-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Query Planning, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["query-planning", "troubleshooting"]
  },
  {
    id: "query-planning-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Query Planning at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["query-planning", "architecture"]
  }
];

window.QUESTION_BANK["database-locking-and-isolation"] = [
  {
    id: "database-locking-and-isolation-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Database Locking And Isolation?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["database-locking-and-isolation", "basics"]
  },
  {
    id: "database-locking-and-isolation-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Database Locking And Isolation, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["database-locking-and-isolation", "troubleshooting"]
  },
  {
    id: "database-locking-and-isolation-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Database Locking And Isolation at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["database-locking-and-isolation", "architecture"]
  }
];

window.QUESTION_BANK["mvcc"] = [
  {
    id: "mvcc-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Mvcc?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["mvcc", "basics"]
  },
  {
    id: "mvcc-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Mvcc, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["mvcc", "troubleshooting"]
  },
  {
    id: "mvcc-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Mvcc at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["mvcc", "architecture"]
  }
];

window.QUESTION_BANK["database-wal-and-recovery"] = [
  {
    id: "database-wal-and-recovery-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Database Wal And Recovery?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["database-wal-and-recovery", "basics"]
  },
  {
    id: "database-wal-and-recovery-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Database Wal And Recovery, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["database-wal-and-recovery", "troubleshooting"]
  },
  {
    id: "database-wal-and-recovery-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Database Wal And Recovery at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["database-wal-and-recovery", "architecture"]
  }
];

window.QUESTION_BANK["database-ticket-servers"] = [
  {
    id: "database-ticket-servers-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Database Ticket Servers?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["database-ticket-servers", "basics"]
  },
  {
    id: "database-ticket-servers-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Database Ticket Servers, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["database-ticket-servers", "troubleshooting"]
  },
  {
    id: "database-ticket-servers-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Database Ticket Servers at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["database-ticket-servers", "architecture"]
  }
];

window.QUESTION_BANK["relational-database-scaling"] = [
  {
    id: "relational-database-scaling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Relational Database Scaling?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["relational-database-scaling", "basics"]
  },
  {
    id: "relational-database-scaling-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Relational Database Scaling, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["relational-database-scaling", "troubleshooting"]
  },
  {
    id: "relational-database-scaling-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Relational Database Scaling at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["relational-database-scaling", "architecture"]
  }
];

window.QUESTION_BANK["online-indexing"] = [
  {
    id: "online-indexing-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Online Indexing?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["online-indexing", "basics"]
  },
  {
    id: "online-indexing-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Online Indexing, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["online-indexing", "troubleshooting"]
  },
  {
    id: "online-indexing-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Online Indexing at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["online-indexing", "architecture"]
  }
];

window.QUESTION_BANK["schema-evolution"] = [
  {
    id: "schema-evolution-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Schema Evolution?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["schema-evolution", "basics"]
  },
  {
    id: "schema-evolution-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Schema Evolution, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["schema-evolution", "troubleshooting"]
  },
  {
    id: "schema-evolution-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Schema Evolution at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["schema-evolution", "architecture"]
  }
];

window.QUESTION_BANK["soft-delete"] = [
  {
    id: "soft-delete-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which statement best describes the primary goal of Soft Delete?",
    scenario: "You are explaining core concepts to a junior engineer.",
    options: [
      "It focuses entirely on database selection.",
      "It establishes fundamental principles and constraints to guide the design process.",
      "It generates the final source code automatically.",
      "It solely concerns the user interface design."
    ],
    answer: 1,
    explanation: "B is correct because it identifies the core purpose. A is wrong because it's too narrow. C is wrong as it does not generate code. D is wrong because system design is typically backend/architecture focused.",
    tags: ["soft-delete", "basics"]
  },
  {
    id: "soft-delete-q2",
    type: "multi",
    difficulty: "apply",
    prompt: "In a scenario involving Soft Delete, you notice high latency during peak hours. Which of the following are valid approaches to address this?",
    scenario: "A high-traffic e-commerce platform is experiencing slow responses.",
    options: [
      "Add more database indexes blindly.",
      "Measure and identify the bottleneck.",
      "Implement caching for read-heavy operations.",
      "Cache all responses regardless of staleness."
    ],
    answer: [1, 2],
    explanation: "Options B and C are correct because measuring is essential and caching can help reads. A is wrong as blind indexes hurt writes. D is wrong because staleness can break correctness.",
    tags: ["soft-delete", "troubleshooting"]
  },
  {
    id: "soft-delete-q3",
    type: "ordering",
    difficulty: "staff",
    prompt: "Order the standard steps for evaluating tradeoffs for Soft Delete at scale:",
    scenario: "Designing a system expected to grow 10x over the next 3 years.",
    options: [
      "Define non-functional requirements",
      "Identify the single points of failure",
      "Propose alternative architectures",
      "Measure actual bottlenecks"
    ],
    answer: [0, 2, 1, 3],
    explanation: "Requirements must come first (A). Then proposing alternatives (C). Finding single points of failure helps refine those (B), and measuring validates them (D).",
    tags: ["soft-delete", "architecture"]
  }
];

