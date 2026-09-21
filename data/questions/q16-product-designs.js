window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["notification-system-design"] = [
  {
    id: "notification-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Push vs SMS vs Email in this context?",
    scenario: "You are designing the system and need to justify the use of Push vs SMS vs Email.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Push vs SMS vs Email provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "push vs sms vs email"]
  },
  {
    id: "notification-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Delivery guarantees, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Delivery guarantees component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "delivery guarantees"]
  },
  {
    id: "notification-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Deduplication?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Deduplication requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "deduplication"]
  }
];

window.QUESTION_BANK["ticket-booking-system-design"] = [
  {
    id: "ticket-booking-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Inventory reservations in this context?",
    scenario: "You are designing the system and need to justify the use of Inventory reservations.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Inventory reservations provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "inventory reservations"]
  },
  {
    id: "ticket-booking-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Distributed locks, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Distributed locks component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "distributed locks"]
  },
  {
    id: "ticket-booking-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Payment state machine?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Payment state machine requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "payment state machine"]
  }
];

window.QUESTION_BANK["payment-system-design"] = [
  {
    id: "payment-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Idempotency in this context?",
    scenario: "You are designing the system and need to justify the use of Idempotency.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Idempotency provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "idempotency"]
  },
  {
    id: "payment-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Double-entry ledger, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Double-entry ledger component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "double-entry ledger"]
  },
  {
    id: "payment-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Reconciliation?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Reconciliation requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "reconciliation"]
  }
];

window.QUESTION_BANK["search-engine-system-design"] = [
  {
    id: "search-engine-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Web crawler in this context?",
    scenario: "You are designing the system and need to justify the use of Web crawler.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Web crawler provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "web crawler"]
  },
  {
    id: "search-engine-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Inverted index, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Inverted index component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "inverted index"]
  },
  {
    id: "search-engine-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing PageRank?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. PageRank requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "pagerank"]
  }
];

window.QUESTION_BANK["recommendation-system-design"] = [
  {
    id: "recommendation-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Candidate generation in this context?",
    scenario: "You are designing the system and need to justify the use of Candidate generation.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Candidate generation provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "candidate generation"]
  },
  {
    id: "recommendation-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Scoring/Ranking, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Scoring/Ranking component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "scoring/ranking"]
  },
  {
    id: "recommendation-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Feature stores?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Feature stores requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "feature stores"]
  }
];

window.QUESTION_BANK["chat-and-messaging-system-design"] = [
  {
    id: "chat-and-messaging-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Message ordering in this context?",
    scenario: "You are designing the system and need to justify the use of Message ordering.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Message ordering provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "message ordering"]
  },
  {
    id: "chat-and-messaging-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Read receipts, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Read receipts component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "read receipts"]
  },
  {
    id: "chat-and-messaging-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Presence service?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Presence service requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "presence service"]
  }
];

window.QUESTION_BANK["social-feed-system-design-case-study"] = [
  {
    id: "social-feed-system-design-case-study-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Feed materialization in this context?",
    scenario: "You are designing the system and need to justify the use of Feed materialization.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Feed materialization provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "feed materialization"]
  },
  {
    id: "social-feed-system-design-case-study-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Ranking algorithms, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Ranking algorithms component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "ranking algorithms"]
  },
  {
    id: "social-feed-system-design-case-study-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Pagination strategies?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Pagination strategies requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "pagination strategies"]
  }
];

window.QUESTION_BANK["geospatial-nearby-search-case-study"] = [
  {
    id: "geospatial-nearby-search-case-study-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Spatial indexes in this context?",
    scenario: "You are designing the system and need to justify the use of Spatial indexes.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Spatial indexes provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "spatial indexes"]
  },
  {
    id: "geospatial-nearby-search-case-study-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Location pinging, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Location pinging component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "location pinging"]
  },
  {
    id: "geospatial-nearby-search-case-study-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Real-time updates?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Real-time updates requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "real-time updates"]
  }
];
