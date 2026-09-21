window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["realtime-database-and-websocket-scaling"] = [
  {
    id: "realtime-database-and-websocket-scaling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Realtime database scaling in this context?",
    scenario: "You are designing the system and need to justify the use of Realtime database scaling.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Realtime database scaling provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "realtime database scaling"]
  },
  {
    id: "realtime-database-and-websocket-scaling-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing WebSocket connection management, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your WebSocket connection management component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "websocket connection management"]
  },
  {
    id: "realtime-database-and-websocket-scaling-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing stateful vs stateless scaling?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. stateful vs stateless scaling requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "stateful vs stateless scaling"]
  }
];

window.QUESTION_BANK["websockets-vs-sse-vs-long-polling"] = [
  {
    id: "websockets-vs-sse-vs-long-polling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of WebSockets in this context?",
    scenario: "You are designing the system and need to justify the use of WebSockets.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "WebSockets provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "websockets"]
  },
  {
    id: "websockets-vs-sse-vs-long-polling-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Server-Sent Events, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Server-Sent Events component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "server-sent events"]
  },
  {
    id: "websockets-vs-sse-vs-long-polling-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Long Polling overhead?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Long Polling overhead requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "long polling overhead"]
  }
];

window.QUESTION_BANK["social-network-database-modeling"] = [
  {
    id: "social-network-database-modeling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Social graph tables in this context?",
    scenario: "You are designing the system and need to justify the use of Social graph tables.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Social graph tables provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "social graph tables"]
  },
  {
    id: "social-network-database-modeling-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Adjacency list, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Adjacency list component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "adjacency list"]
  },
  {
    id: "social-network-database-modeling-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing materialized views for feeds?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. materialized views for feeds requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "materialized views for feeds"]
  }
];

window.QUESTION_BANK["social-graph-follows-and-flockdb"] = [
  {
    id: "social-graph-follows-and-flockdb-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of FlockDB in this context?",
    scenario: "You are designing the system and need to justify the use of FlockDB.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "FlockDB provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "flockdb"]
  },
  {
    id: "social-graph-follows-and-flockdb-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Graph database traversals, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Graph database traversals component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "graph database traversals"]
  },
  {
    id: "social-graph-follows-and-flockdb-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing edge state (active/archived)?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. edge state (active/archived) requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "edge state (active/archived)"]
  }
];

window.QUESTION_BANK["feed-generation-push-pull-hybrid"] = [
  {
    id: "feed-generation-push-pull-hybrid-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Push (fan-out-on-write) in this context?",
    scenario: "You are designing the system and need to justify the use of Push (fan-out-on-write).",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Push (fan-out-on-write) provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "push (fan-out-on-write)"]
  },
  {
    id: "feed-generation-push-pull-hybrid-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Pull (fan-out-on-load), how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Pull (fan-out-on-load) component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "pull (fan-out-on-load)"]
  },
  {
    id: "feed-generation-push-pull-hybrid-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Hybrid fan-out for celebrities?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Hybrid fan-out for celebrities requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "hybrid fan-out for celebrities"]
  }
];

window.QUESTION_BANK["newly-unread-indicator"] = [
  {
    id: "newly-unread-indicator-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Unread counts in this context?",
    scenario: "You are designing the system and need to justify the use of Unread counts.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Unread counts provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "unread counts"]
  },
  {
    id: "newly-unread-indicator-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Event sourcing, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Event sourcing component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "event sourcing"]
  },
  {
    id: "newly-unread-indicator-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing high write volume optimization?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. high write volume optimization requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "high write volume optimization"]
  }
];

window.QUESTION_BANK["hashtag-extraction-and-tag-store"] = [
  {
    id: "hashtag-extraction-and-tag-store-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Hashtag parsing in this context?",
    scenario: "You are designing the system and need to justify the use of Hashtag parsing.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Hashtag parsing provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "hashtag parsing"]
  },
  {
    id: "hashtag-extraction-and-tag-store-q2",
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
    id: "hashtag-extraction-and-tag-store-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Trending algorithms (Count-Min Sketch)?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Trending algorithms (Count-Min Sketch) requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "trending algorithms (count-min sketch)"]
  }
];

window.QUESTION_BANK["reaction-modeling"] = [
  {
    id: "reaction-modeling-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Reaction storage in this context?",
    scenario: "You are designing the system and need to justify the use of Reaction storage.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Reaction storage provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "reaction storage"]
  },
  {
    id: "reaction-modeling-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Aggregation of counts, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Aggregation of counts component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "aggregation of counts"]
  },
  {
    id: "reaction-modeling-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing caching hot reactions?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. caching hot reactions requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "caching hot reactions"]
  }
];

window.QUESTION_BANK["photo-tagging-coordinate-model"] = [
  {
    id: "photo-tagging-coordinate-model-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Coordinate storage in this context?",
    scenario: "You are designing the system and need to justify the use of Coordinate storage.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Coordinate storage provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "coordinate storage"]
  },
  {
    id: "photo-tagging-coordinate-model-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Spatial queries, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Spatial queries component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "spatial queries"]
  },
  {
    id: "photo-tagging-coordinate-model-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing tag visibility rules?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. tag visibility rules requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "tag visibility rules"]
  }
];

window.QUESTION_BANK["live-commentary-system-design"] = [
  {
    id: "live-commentary-system-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Live streams in this context?",
    scenario: "You are designing the system and need to justify the use of Live streams.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Live streams provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "live streams"]
  },
  {
    id: "live-commentary-system-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Message ordering, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Message ordering component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "message ordering"]
  },
  {
    id: "live-commentary-system-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing throttling fast chat?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. throttling fast chat requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "throttling fast chat"]
  }
];
