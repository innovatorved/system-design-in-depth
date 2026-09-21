window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["direct-to-object-storage-upload"] = [
  {
    id: "direct-to-object-storage-upload-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Presigned URLs in this context?",
    scenario: "You are designing the system and need to justify the use of Presigned URLs.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Presigned URLs provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "presigned urls"]
  },
  {
    id: "direct-to-object-storage-upload-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing S3 direct upload, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your S3 direct upload component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "s3 direct upload"]
  },
  {
    id: "direct-to-object-storage-upload-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing reducing server load?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. reducing server load requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "reducing server load"]
  }
];

window.QUESTION_BANK["image-cdn-and-resizing"] = [
  {
    id: "image-cdn-and-resizing-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of On-the-fly resizing in this context?",
    scenario: "You are designing the system and need to justify the use of On-the-fly resizing.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "On-the-fly resizing provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "on-the-fly resizing"]
  },
  {
    id: "image-cdn-and-resizing-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Image CDN caching, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Image CDN caching component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "image cdn caching"]
  },
  {
    id: "image-cdn-and-resizing-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing WebP conversion?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. WebP conversion requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "webp conversion"]
  }
];

window.QUESTION_BANK["gravatar-style-avatar-service"] = [
  {
    id: "gravatar-style-avatar-service-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Avatar hashing in this context?",
    scenario: "You are designing the system and need to justify the use of Avatar hashing.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Avatar hashing provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "avatar hashing"]
  },
  {
    id: "gravatar-style-avatar-service-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Cache control, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Cache control component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "cache control"]
  },
  {
    id: "gravatar-style-avatar-service-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing default fallbacks?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. default fallbacks requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "default fallbacks"]
  }
];

window.QUESTION_BANK["video-upload-signed-url-multipart"] = [
  {
    id: "video-upload-signed-url-multipart-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Multipart upload in this context?",
    scenario: "You are designing the system and need to justify the use of Multipart upload.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Multipart upload provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "multipart upload"]
  },
  {
    id: "video-upload-signed-url-multipart-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Resumable uploads, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Resumable uploads component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "resumable uploads"]
  },
  {
    id: "video-upload-signed-url-multipart-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Chunk assembly?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Chunk assembly requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "chunk assembly"]
  }
];

window.QUESTION_BANK["video-transcoding-pipeline"] = [
  {
    id: "video-transcoding-pipeline-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of FFmpeg transcoding in this context?",
    scenario: "You are designing the system and need to justify the use of FFmpeg transcoding.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "FFmpeg transcoding provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "ffmpeg transcoding"]
  },
  {
    id: "video-transcoding-pipeline-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Job queues for media, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Job queues for media component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "job queues for media"]
  },
  {
    id: "video-transcoding-pipeline-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Adaptive bitrate prep?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Adaptive bitrate prep requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "adaptive bitrate prep"]
  }
];

window.QUESTION_BANK["adaptive-bitrate-and-cdn-decider"] = [
  {
    id: "adaptive-bitrate-and-cdn-decider-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of HLS/DASH in this context?",
    scenario: "You are designing the system and need to justify the use of HLS/DASH.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "HLS/DASH provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "hls/dash"]
  },
  {
    id: "adaptive-bitrate-and-cdn-decider-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Manifest files, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Manifest files component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "manifest files"]
  },
  {
    id: "adaptive-bitrate-and-cdn-decider-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Bandwidth estimation?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Bandwidth estimation requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "bandwidth estimation"]
  }
];

window.QUESTION_BANK["signed-urls-drm-and-video-security"] = [
  {
    id: "signed-urls-drm-and-video-security-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of DRM (Widevine/FairPlay) in this context?",
    scenario: "You are designing the system and need to justify the use of DRM (Widevine/FairPlay).",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "DRM (Widevine/FairPlay) provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "drm (widevine/fairplay)"]
  },
  {
    id: "signed-urls-drm-and-video-security-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Signed cookies, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Signed cookies component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "signed cookies"]
  },
  {
    id: "signed-urls-drm-and-video-security-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Token expiration?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Token expiration requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "token expiration"]
  }
];

window.QUESTION_BANK["live-streaming-webrtc-and-latency"] = [
  {
    id: "live-streaming-webrtc-and-latency-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of WebRTC in this context?",
    scenario: "You are designing the system and need to justify the use of WebRTC.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "WebRTC provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "webrtc"]
  },
  {
    id: "live-streaming-webrtc-and-latency-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing RTMP vs HLS latency, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your RTMP vs HLS latency component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "rtmp vs hls latency"]
  },
  {
    id: "live-streaming-webrtc-and-latency-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing UDP vs TCP for media?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. UDP vs TCP for media requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "udp vs tcp for media"]
  }
];

window.QUESTION_BANK["remote-file-sync-design"] = [
  {
    id: "remote-file-sync-design-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Rsync algorithm in this context?",
    scenario: "You are designing the system and need to justify the use of Rsync algorithm.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Rsync algorithm provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "rsync algorithm"]
  },
  {
    id: "remote-file-sync-design-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Delta sync, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Delta sync component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "delta sync"]
  },
  {
    id: "remote-file-sync-design-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Conflict resolution?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Conflict resolution requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "conflict resolution"]
  }
];

window.QUESTION_BANK["fixed-block-chunking-and-content-addressing"] = [
  {
    id: "fixed-block-chunking-and-content-addressing-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Content addressing (SHA) in this context?",
    scenario: "You are designing the system and need to justify the use of Content addressing (SHA).",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Content addressing (SHA) provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "content addressing (sha)"]
  },
  {
    id: "fixed-block-chunking-and-content-addressing-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Deduplication, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Deduplication component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "deduplication"]
  },
  {
    id: "fixed-block-chunking-and-content-addressing-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Chunking strategies?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Chunking strategies requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "chunking strategies"]
  }
];

window.QUESTION_BANK["blocklist-versioned-file-metadata"] = [
  {
    id: "blocklist-versioned-file-metadata-q1",
    type: "mcq",
    difficulty: "recall",
    prompt: "Which of the following best describes the primary advantage of Metadata versioning in this context?",
    scenario: "You are designing the system and need to justify the use of Metadata versioning.",
    options: [
      "It completely eliminates the need for any caching layer.",
      "It provides specialized capabilities optimized for this exact use case.",
      "It reduces network latency to zero.",
      "It allows the system to scale infinitely without resource limits."
    ],
    answer: 1,
    explanation: "Metadata versioning provides specialized capabilities, whereas the other options are either impossible (zero latency, infinite scale) or factually incorrect.",
    tags: ["system-design", "metadata versioning"]
  },
  {
    id: "blocklist-versioned-file-metadata-q2",
    type: "mcq",
    difficulty: "apply",
    prompt: "When implementing Blocklisting hashes, how should the system handle sudden spikes in user activity?",
    scenario: "A viral event causes a 100x traffic spike. Your Blocklisting hashes component is becoming a bottleneck.",
    options: [
      "Process all requests synchronously to ensure data consistency.",
      "Implement aggressive backoff and fail all new requests immediately.",
      "Use asynchronous processing, load shedding, and caching to protect the core system.",
      "Restart the servers to clear the connection backlog."
    ],
    answer: 2,
    explanation: "Asynchronous processing and load shedding are standard practices to protect the system during extreme spikes. Synchronous processing would make it worse.",
    tags: ["system-design", "scaling", "blocklisting hashes"]
  },
  {
    id: "blocklist-versioned-file-metadata-q3",
    type: "mcq",
    difficulty: "staff",
    prompt: "In a globally distributed setup, what is the most significant trade-off when optimizing Tombstones?",
    scenario: "Your team is migrating from a single-region setup to a multi-region deployment. Tombstones requires careful design.",
    options: [
      "Strong consistency across regions significantly increases write latency.",
      "Adding more regions automatically reduces the overall database cost.",
      "Global distribution eliminates the need for disaster recovery plans.",
      "Read replicas in new regions will have zero replication lag."
    ],
    answer: 0,
    explanation: "Enforcing strong consistency across geographic distances requires synchronous replication, which is bound by the speed of light and thus increases write latency.",
    tags: ["system-design", "multi-region", "tombstones"]
  }
];
