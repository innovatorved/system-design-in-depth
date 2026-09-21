window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["distributed-systems-foundations"] = [
  {
    id: "distributed-systems-foundations-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Distributed Systems Foundations in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Distributed Systems Foundations generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["distributed-systems-foundations", "recall"]
  },
  {
    id: "distributed-systems-foundations-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Distributed Systems Foundations. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Distributed Systems Foundations principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Distributed Systems Foundations principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["distributed-systems-foundations", "apply"]
  },
  {
    id: "distributed-systems-foundations-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Distributed Systems Foundations at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Distributed Systems Foundations often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["distributed-systems-foundations", "staff"]
  }
];

window.QUESTION_BANK["consistency-models"] = [
  {
    id: "consistency-models-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Consistency Models in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Consistency Models generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["consistency-models", "recall"]
  },
  {
    id: "consistency-models-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Consistency Models. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Consistency Models principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Consistency Models principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["consistency-models", "apply"]
  },
  {
    id: "consistency-models-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Consistency Models at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Consistency Models often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["consistency-models", "staff"]
  }
];

window.QUESTION_BANK["replication"] = [
  {
    id: "replication-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Replication in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Replication generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["replication", "recall"]
  },
  {
    id: "replication-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Replication. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Replication principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Replication principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["replication", "apply"]
  },
  {
    id: "replication-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Replication at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Replication often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["replication", "staff"]
  }
];

window.QUESTION_BANK["cap-and-pacelc"] = [
  {
    id: "cap-and-pacelc-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Cap And Pacelc in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Cap And Pacelc generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["cap-and-pacelc", "recall"]
  },
  {
    id: "cap-and-pacelc-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Cap And Pacelc. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Cap And Pacelc principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Cap And Pacelc principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["cap-and-pacelc", "apply"]
  },
  {
    id: "cap-and-pacelc-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Cap And Pacelc at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Cap And Pacelc often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["cap-and-pacelc", "staff"]
  }
];

window.QUESTION_BANK["clocks-and-ordering"] = [
  {
    id: "clocks-and-ordering-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Clocks And Ordering in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Clocks And Ordering generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["clocks-and-ordering", "recall"]
  },
  {
    id: "clocks-and-ordering-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Clocks And Ordering. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Clocks And Ordering principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Clocks And Ordering principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["clocks-and-ordering", "apply"]
  },
  {
    id: "clocks-and-ordering-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Clocks And Ordering at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Clocks And Ordering often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["clocks-and-ordering", "staff"]
  }
];

window.QUESTION_BANK["consensus"] = [
  {
    id: "consensus-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Consensus in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Consensus generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["consensus", "recall"]
  },
  {
    id: "consensus-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Consensus. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Consensus principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Consensus principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["consensus", "apply"]
  },
  {
    id: "consensus-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Consensus at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Consensus often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["consensus", "staff"]
  }
];

window.QUESTION_BANK["leader-election"] = [
  {
    id: "leader-election-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Leader Election in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Leader Election generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["leader-election", "recall"]
  },
  {
    id: "leader-election-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Leader Election. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Leader Election principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Leader Election principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["leader-election", "apply"]
  },
  {
    id: "leader-election-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Leader Election at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Leader Election often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["leader-election", "staff"]
  }
];

window.QUESTION_BANK["distributed-locks-and-leases"] = [
  {
    id: "distributed-locks-and-leases-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Distributed Locks And Leases in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Distributed Locks And Leases generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["distributed-locks-and-leases", "recall"]
  },
  {
    id: "distributed-locks-and-leases-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Distributed Locks And Leases. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Distributed Locks And Leases principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Distributed Locks And Leases principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["distributed-locks-and-leases", "apply"]
  },
  {
    id: "distributed-locks-and-leases-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Distributed Locks And Leases at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Distributed Locks And Leases often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["distributed-locks-and-leases", "staff"]
  }
];

window.QUESTION_BANK["redis-redlock-and-fencing-tokens"] = [
  {
    id: "redis-redlock-and-fencing-tokens-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Redis Redlock And Fencing Tokens in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Redis Redlock And Fencing Tokens generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["redis-redlock-and-fencing-tokens", "recall"]
  },
  {
    id: "redis-redlock-and-fencing-tokens-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Redis Redlock And Fencing Tokens. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Redis Redlock And Fencing Tokens principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Redis Redlock And Fencing Tokens principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["redis-redlock-and-fencing-tokens", "apply"]
  },
  {
    id: "redis-redlock-and-fencing-tokens-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Redis Redlock And Fencing Tokens at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Redis Redlock And Fencing Tokens often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["redis-redlock-and-fencing-tokens", "staff"]
  }
];

window.QUESTION_BANK["circuit-breakers-and-timeouts"] = [
  {
    id: "circuit-breakers-and-timeouts-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Circuit Breakers And Timeouts in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Circuit Breakers And Timeouts generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["circuit-breakers-and-timeouts", "recall"]
  },
  {
    id: "circuit-breakers-and-timeouts-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Circuit Breakers And Timeouts. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Circuit Breakers And Timeouts principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Circuit Breakers And Timeouts principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["circuit-breakers-and-timeouts", "apply"]
  },
  {
    id: "circuit-breakers-and-timeouts-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Circuit Breakers And Timeouts at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Circuit Breakers And Timeouts often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["circuit-breakers-and-timeouts", "staff"]
  }
];

window.QUESTION_BANK["gossip-protocol"] = [
  {
    id: "gossip-protocol-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Gossip Protocol in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Gossip Protocol generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["gossip-protocol", "recall"]
  },
  {
    id: "gossip-protocol-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Gossip Protocol. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Gossip Protocol principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Gossip Protocol principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["gossip-protocol", "apply"]
  },
  {
    id: "gossip-protocol-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Gossip Protocol at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Gossip Protocol often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["gossip-protocol", "staff"]
  }
];

window.QUESTION_BANK["metadata-service-and-node-discovery"] = [
  {
    id: "metadata-service-and-node-discovery-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Metadata Service And Node Discovery in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Metadata Service And Node Discovery generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["metadata-service-and-node-discovery", "recall"]
  },
  {
    id: "metadata-service-and-node-discovery-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Metadata Service And Node Discovery. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Metadata Service And Node Discovery principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Metadata Service And Node Discovery principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["metadata-service-and-node-discovery", "apply"]
  },
  {
    id: "metadata-service-and-node-discovery-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Metadata Service And Node Discovery at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Metadata Service And Node Discovery often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["metadata-service-and-node-discovery", "staff"]
  }
];

window.QUESTION_BANK["distributed-hash-tables"] = [
  {
    id: "distributed-hash-tables-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "What is the primary purpose of Distributed Hash Tables in a distributed system?",
    options: [
      "To increase the single-thread performance of the CPU.",
      "To manage scale, reliability, or specific system tradeoffs effectively.",
      "To replace all relational databases with NoSQL.",
      "To enforce static typing across microservices."
    ],
    answer: 1,
    explanation: "Distributed Hash Tables generally addresses scale, reliability, or structural tradeoffs in distributed systems. It is not about CPU single-thread performance, universally replacing relational databases, or static typing.",
    tags: ["distributed-hash-tables", "recall"]
  },
  {
    id: "distributed-hash-tables-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "You are designing a high-throughput system and considering Distributed Hash Tables. Which scenario best justifies its adoption?",
    scenario: "The system experiences heavy, unpredictable bursts of traffic causing localized bottlenecks.",
    options: [
      "The architecture is currently a monolith deployed on a single instance.",
      "You need to resolve localized bottlenecks by distributing or isolating the workload using Distributed Hash Tables principles.",
      "You want to migrate entirely to a serverless stack.",
      "You need synchronous blocking calls across all services."
    ],
    answer: 1,
    explanation: "Applying Distributed Hash Tables principles is most justified when addressing bottlenecks through distribution, isolation, or specialized components, rather than just changing the deployment model or making everything synchronous.",
    tags: ["distributed-hash-tables", "apply"]
  },
  {
    id: "distributed-hash-tables-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "When implementing Distributed Hash Tables at massive scale, what is a critical operational tradeoff you must manage?",
    options: [
      "Balancing the consistency of the state against the latency and availability of the system.",
      "Ensuring that all configuration files are written in XML.",
      "Eliminating all network latency universally.",
      "Preventing any usage of caching."
    ],
    answer: 0,
    explanation: "At scale, implementing Distributed Hash Tables often involves fundamental tradeoffs between consistency, availability, and latency (as per the CAP/PACELC theorems), whereas eliminating latency or caching completely is neither possible nor desirable.",
    tags: ["distributed-hash-tables", "staff"]
  }
];

