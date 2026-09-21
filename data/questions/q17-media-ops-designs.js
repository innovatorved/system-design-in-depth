window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["ride-matching-system-design"] = [
  {
    id: "ride-matching-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Driver dispatch in this context?",
    scenario: "You are designing the system and need to justify the use of Driver dispatch.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Driver dispatch provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "driver dispatch"]
  },
  {
    id: "ride-matching-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Geospatial tracking, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Geospatial tracking component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "geospatial tracking"]
  },
  {
    id: "ride-matching-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Dynamic pricing?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Dynamic pricing requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "dynamic pricing"]
  }
];

window.QUESTION_BANK["video-platform-system-design"] = [
  {
    id: "video-platform-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Video streaming in this context?",
    scenario: "You are designing the system and need to justify the use of Video streaming.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Video streaming provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "video streaming"]
  },
  {
    id: "video-platform-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Transcoding, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Transcoding component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "transcoding"]
  },
  {
    id: "video-platform-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing CDN topologies?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. CDN topologies requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "cdn topologies"]
  }
];

window.QUESTION_BANK["file-sync-system-design"] = [
  {
    id: "file-sync-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Delta encoding in this context?",
    scenario: "You are designing the system and need to justify the use of Delta encoding.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Delta encoding provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "delta encoding"]
  },
  {
    id: "file-sync-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Conflict resolution, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Conflict resolution component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "conflict resolution"]
  },
  {
    id: "file-sync-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Metadata syncing?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Metadata syncing requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "metadata syncing"]
  }
];

window.QUESTION_BANK["observability-slo-case-study"] = [
  {
    id: "observability-slo-case-study-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of SLO monitoring in this context?",
    scenario: "You are designing the system and need to justify the use of SLO monitoring.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "SLO monitoring provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "slo monitoring"]
  },
  {
    id: "observability-slo-case-study-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Alert fatigue, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Alert fatigue component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "alert fatigue"]
  },
  {
    id: "observability-slo-case-study-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Tracing deep architectures?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Tracing deep architectures requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "tracing deep architectures"]
  }
];

window.QUESTION_BANK["zero-downtime-database-migration-case-study"] = [
  {
    id: "zero-downtime-database-migration-case-study-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Dual writes in this context?",
    scenario: "You are designing the system and need to justify the use of Dual writes.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Dual writes provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "dual writes"]
  },
  {
    id: "zero-downtime-database-migration-case-study-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Replication lag, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Replication lag component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "replication lag"]
  },
  {
    id: "zero-downtime-database-migration-case-study-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Migration rollbacks?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Migration rollbacks requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "migration rollbacks"]
  }
];

window.QUESTION_BANK["interview-design-instagram"] = [
  {
    id: "interview-design-instagram-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Photo storage in this context?",
    scenario: "You are designing the system and need to justify the use of Photo storage.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Photo storage provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "photo storage"]
  },
  {
    id: "interview-design-instagram-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Feed timeline, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Feed timeline component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "feed timeline"]
  },
  {
    id: "interview-design-instagram-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Follower graphs?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Follower graphs requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "follower graphs"]
  }
];
