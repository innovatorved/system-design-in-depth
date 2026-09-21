window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["observability-for-distributed-systems"] = [
  {
    id: "observability-for-distributed-systems-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Distributed tracing in this context?",
    scenario: "You are designing the system and need to justify the use of Distributed tracing.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Distributed tracing provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "distributed tracing"]
  },
  {
    id: "observability-for-distributed-systems-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Metrics vs Logs, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Metrics vs Logs component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "metrics vs logs"]
  },
  {
    id: "observability-for-distributed-systems-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Sampling strategies?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Sampling strategies requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "sampling strategies"]
  }
];

window.QUESTION_BANK["slos-and-error-budgets"] = [
  {
    id: "slos-and-error-budgets-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of SLI/SLO/SLA in this context?",
    scenario: "You are designing the system and need to justify the use of SLI/SLO/SLA.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "SLI/SLO/SLA provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "sli/slo/sla"]
  },
  {
    id: "slos-and-error-budgets-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Error budgets, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Error budgets component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "error budgets"]
  },
  {
    id: "slos-and-error-budgets-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Alerting on burn rate?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Alerting on burn rate requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "alerting on burn rate"]
  }
];

window.QUESTION_BANK["incident-response"] = [
  {
    id: "incident-response-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Incident commander in this context?",
    scenario: "You are designing the system and need to justify the use of Incident commander.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Incident commander provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "incident commander"]
  },
  {
    id: "incident-response-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Blameless postmortems, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Blameless postmortems component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "blameless postmortems"]
  },
  {
    id: "incident-response-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing MTTR vs MTBF?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. MTTR vs MTBF requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "mttr vs mtbf"]
  }
];

window.QUESTION_BANK["deployment-and-migration-safety"] = [
  {
    id: "deployment-and-migration-safety-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Blue-green deployment in this context?",
    scenario: "You are designing the system and need to justify the use of Blue-green deployment.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Blue-green deployment provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "blue-green deployment"]
  },
  {
    id: "deployment-and-migration-safety-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Canary releases, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Canary releases component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "canary releases"]
  },
  {
    id: "deployment-and-migration-safety-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Feature flags?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Feature flags requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "feature flags"]
  }
];

window.QUESTION_BANK["database-migration-safety"] = [
  {
    id: "database-migration-safety-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Backward compatibility in this context?",
    scenario: "You are designing the system and need to justify the use of Backward compatibility.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Backward compatibility provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "backward compatibility"]
  },
  {
    id: "database-migration-safety-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Expand and contract pattern, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Expand and contract pattern component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "expand and contract pattern"]
  },
  {
    id: "database-migration-safety-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Online DDL?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Online DDL requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "online ddl"]
  }
];

window.QUESTION_BANK["parallel-monolith-read-drain"] = [
  {
    id: "parallel-monolith-read-drain-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Strangler fig pattern in this context?",
    scenario: "You are designing the system and need to justify the use of Strangler fig pattern.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Strangler fig pattern provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "strangler fig pattern"]
  },
  {
    id: "parallel-monolith-read-drain-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Read mirroring, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Read mirroring component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "read mirroring"]
  },
  {
    id: "parallel-monolith-read-drain-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Dark launching?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Dark launching requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "dark launching"]
  }
];

window.QUESTION_BANK["database-backups-and-restore"] = [
  {
    id: "database-backups-and-restore-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Point-in-time recovery in this context?",
    scenario: "You are designing the system and need to justify the use of Point-in-time recovery.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Point-in-time recovery provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "point-in-time recovery"]
  },
  {
    id: "database-backups-and-restore-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing WAL archiving, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your WAL archiving component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "wal archiving"]
  },
  {
    id: "database-backups-and-restore-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing RTO and RPO?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. RTO and RPO requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "rto and rpo"]
  }
];

window.QUESTION_BANK["disaster-recovery"] = [
  {
    id: "disaster-recovery-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Active-passive vs Active-active in this context?",
    scenario: "You are designing the system and need to justify the use of Active-passive vs Active-active.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Active-passive vs Active-active provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "active-passive vs active-active"]
  },
  {
    id: "disaster-recovery-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Failover routing, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Failover routing component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "failover routing"]
  },
  {
    id: "disaster-recovery-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Split-brain problem?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Split-brain problem requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "split-brain problem"]
  }
];

window.QUESTION_BANK["data-retention-and-deletion"] = [
  {
    id: "data-retention-and-deletion-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Soft deletes in this context?",
    scenario: "You are designing the system and need to justify the use of Soft deletes.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Soft deletes provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "soft deletes"]
  },
  {
    id: "data-retention-and-deletion-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing GDPR right to be forgotten, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your GDPR right to be forgotten component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "gdpr right to be forgotten"]
  },
  {
    id: "data-retention-and-deletion-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Background sweepers?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Background sweepers requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "background sweepers"]
  }
];

window.QUESTION_BANK["security-and-abuse-prevention"] = [
  {
    id: "security-and-abuse-prevention-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Rate limiting in this context?",
    scenario: "You are designing the system and need to justify the use of Rate limiting.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Rate limiting provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "rate limiting"]
  },
  {
    id: "security-and-abuse-prevention-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing WAF, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your WAF component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "waf"]
  },
  {
    id: "security-and-abuse-prevention-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Credential stuffing protection?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Credential stuffing protection requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "credential stuffing protection"]
  }
];

window.QUESTION_BANK["rate-limiter-placement-and-keys"] = [
  {
    id: "rate-limiter-placement-and-keys-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Edge vs internal limiting in this context?",
    scenario: "You are designing the system and need to justify the use of Edge vs internal limiting.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Edge vs internal limiting provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "edge vs internal limiting"]
  },
  {
    id: "rate-limiter-placement-and-keys-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing IP vs User keys, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your IP vs User keys component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "ip vs user keys"]
  },
  {
    id: "rate-limiter-placement-and-keys-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Distributed rate limits?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Distributed rate limits requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "distributed rate limits"]
  }
];

window.QUESTION_BANK["sliding-window-rate-limiter"] = [
  {
    id: "sliding-window-rate-limiter-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Sliding window log in this context?",
    scenario: "You are designing the system and need to justify the use of Sliding window log.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Sliding window log provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "sliding window log"]
  },
  {
    id: "sliding-window-rate-limiter-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Token bucket, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Token bucket component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "token bucket"]
  },
  {
    id: "sliding-window-rate-limiter-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Redis implementation?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Redis implementation requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "redis implementation"]
  }
];

window.QUESTION_BANK["multi-tenant-design"] = [
  {
    id: "multi-tenant-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Tenant isolation in this context?",
    scenario: "You are designing the system and need to justify the use of Tenant isolation.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Tenant isolation provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "tenant isolation"]
  },
  {
    id: "multi-tenant-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Noisy neighbor problem, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Noisy neighbor problem component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "noisy neighbor problem"]
  },
  {
    id: "multi-tenant-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Row-level security?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Row-level security requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "row-level security"]
  }
];
