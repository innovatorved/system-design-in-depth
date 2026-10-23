window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["api-design-contracts"] = [
  {
    "id": "api-design-contracts-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Reused idempotency key",
    "section": "Core Elements of Production-Grade API Contracts",
    "prompt": "A client retries POST /v1/links with the same Idempotency-Key as an earlier request, but the request body is different this time. What should the server do?",
    "options": [
      "Reject it as an error, because the key was reused for a different request",
      "Replay the stored response from the first request under that key",
      "Run the business logic again, because the body shows it is a new operation",
      "Replace the stored response with the result of the new request"
    ],
    "answer": 0,
    "explanation": "The server stores a hash of the request body with the key, so a retry with the same key and the same body replays the stored response, while the same key with a different body is rejected (for example with 422). Replaying anyway is the tempting choice, but it would quietly hide a client bug and return a result for a request the client did not send.",
    "tags": [
      "api-design-contracts",
      "recall",
      "inline"
    ]
  },
  {
    "id": "api-design-contracts-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Which change is additive",
    "section": "Compatibility rules at a glance",
    "prompt": "Old mobile app versions will keep calling POST /v1/links for years. Which change can you ship without a new API version?",
    "options": [
      "Return 200 instead of 201, since both status codes mean success",
      "Add a new value to the link status enum that clients switch on",
      "Add an optional expires_at request field with a sensible server default",
      "Reject destination URLs longer than 2,000 characters that were accepted before"
    ],
    "answer": 2,
    "explanation": "A new optional request field is additive: old clients never send it and the server's default keeps their behaviour the same. The new enum value is the tempting choice because it looks additive, but clients with exhaustive switch statements can crash on it. Tightening validation and changing status codes break requests that used to work.",
    "tags": [
      "api-design-contracts",
      "apply",
      "inline"
    ]
  },
  {
    "id": "api-design-contracts-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Key stored outside the transaction",
    "section": "Failure modes",
    "prompt": "The server inserts the link and commits, then writes the idempotency record (key, body hash, response) in a second transaction. What can go wrong?",
    "options": [
      "Concurrent retries return 422, because the key already exists in the store",
      "Keys expire before the 24-hour retention window has passed",
      "Replayed responses carry a stale created_at value from the first attempt",
      "A crash between the two commits lets a retry create the link a second time"
    ],
    "answer": 3,
    "explanation": "If the process dies after the link commits but before the key is saved, a retry finds no record and runs the insert again. That is why the key, hash and response must be written in the same transaction as the side effect. The concurrent-retry problem is real too, but its fix is locking the key or inserting it first with an in-progress status.",
    "tags": [
      "api-design-contracts",
      "staff",
      "inline"
    ]
  },
  {
    "id": "api-design-contracts-n1",
    "topic": "api-design-contracts",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Idempotency Key Cache Memory Sizing",
    "scenario": "Your payments API enforces a 24-hour idempotency key retention window. The cluster processes 2,000 write requests/second (172.8 million writes/day, use 175 million for napkin math), and each Redis entry storing the idempotency key, hash, and cached response payload consumes 400 bytes including allocator overhead.",
    "prompt": "Using 175 million stored keys over the rolling 24-hour window, how many gigabytes (GB, where 1 GB = 10^9 bytes) of Redis memory are required?",
    "question": "Using 175 million stored keys over the rolling 24-hour window, how many gigabytes (GB, where 1 GB = 10^9 bytes) of Redis memory are required?",
    "unit": "GB",
    "answer": 70,
    "tolerance": 0.2,
    "hint": "Multiply 175,000,000 keys by 400 bytes/key and divide by 10^9 bytes/GB.",
    "explanation": "175,000,000 keys × 400 bytes/key = 70,000,000,000 bytes = 70 GB of RAM. Sizing idempotency storage explicitly prevents premature eviction of keys within the promised 24-hour retry window.",
    "tags": [
      "api-design-contracts",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "api-design-contracts-t1",
    "topic": "api-design-contracts",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Additive Schema Evolution vs Hard URL Version Bumps",
    "scenario": "Your public B2B webhook and REST API serves 4,000 enterprise integrations. Product wants to add two optional tax breakdown fields and deprecate a legacy single-string address field.",
    "prompt": "Which API evolution strategy should you execute, and what is the primary justification?",
    "question": "Which API evolution strategy should you execute, and what is the primary justification?",
    "options": [
      "Fork the entire controller and routing tier into `/v2/` and shut down `/v1/` after 14 days",
      "Mutate the existing `/v1/` response in-place by deleting the legacy address field immediately",
      "Add the new fields additively alongside the legacy field, dual-populate both during a sunset window tracked via per-client telemetry, and gate breaking changes behind explicit version headers or a major version only when invariants change"
    ],
    "correctOption": 2,
    "reasons": [
      "Enterprise customers love rewriting and redeploying integrations every two weeks",
      "Deleting fields in-place never breaks strict JSON deserializers in statically typed clients",
      "Additive evolution with dual-writing and usage telemetry avoids fragmenting backend codebases across N URL versions while guaranteeing zero unannounced breakage for existing integrators"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Forking `/v2/` for every minor field addition multiplies maintenance burden, while deleting fields in place breaks contracts.",
    "explanation": "Additive changes (new optional fields, tolerant readers) allow APIs to evolve continuously without splitting the ecosystem across `/v1`, `/v2`, `/v3` forks. Telemetry on deprecated field usage lets you assist the remaining stragglers before retiring old fields.",
    "tags": [
      "api-design-contracts",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["service-to-service-communication"] = [
  {
    "id": "service-to-service-communication-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Remaining deadline wins",
    "section": "Worked example: deadline budget across a call chain",
    "prompt": "A user request arrives with a 300 ms deadline. The API spends 120 ms, then the order service spends 100 ms before calling inventory. Inventory's own timeout target (p99.9 plus margin) is 150 ms. What timeout should the order service use for that call?",
    "options": [
      "150 ms, inventory's own latency target",
      "300 ms, the user's original deadline",
      "80 ms, the time left in the caller's deadline",
      "2 s, a fixed client-library default"
    ],
    "answer": 2,
    "explanation": "The rule is to use the smaller of the hop's own latency target and the caller's remaining deadline: 300 minus 220 leaves 80 ms, which is less than 150 ms. Using 150 ms is tempting because it is the service's own target, but the user's request would already be gone for up to 70 ms of that work.",
    "tags": [
      "service-to-service-communication",
      "apply",
      "inline"
    ]
  },
  {
    "id": "service-to-service-communication-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Broker delivery semantics",
    "section": "Choosing a style",
    "prompt": "When services communicate through a typical queue or log broker, what delivery behaviour should consumers be designed for?",
    "options": [
      "Exactly-once delivery, because the broker stores every message durably",
      "At-least-once delivery, so duplicates and reordering can happen",
      "At-most-once delivery, so consumers must request any missing messages",
      "Exactly-once, in order, for all messages that share a partition"
    ],
    "answer": 1,
    "explanation": "Most brokers deliver at least once, so a consumer can see the same message twice, or out of order, and must process messages idempotently. Durability is the tempting reason to pick exactly-once, but storing a message safely says nothing about how many times a consumer will be handed it after a crash or rebalance.",
    "tags": [
      "service-to-service-communication",
      "recall",
      "inline"
    ]
  },
  {
    "id": "service-to-service-communication-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Commit then publish",
    "section": "Mechanics that matter",
    "prompt": "The order service commits an order row, then publishes order.created to Kafka as a separate step. Sometimes it crashes between the two, and billing never hears about the order. What is the standard fix?",
    "options": [
      "Publish the event first, then commit the order row once Kafka confirms",
      "Keep retrying the publish in the process until it succeeds before replying",
      "Raise the Kafka producer timeout so slow publishes are less likely to fail",
      "Write the event to an outbox table in the same transaction and let a relay publish it"
    ],
    "answer": 3,
    "explanation": "With a transactional outbox, the row and the event commit together, so a relay can publish the event later, even after a crash, and neither is lost. Publishing first just reverses the problem: billing hears about an order that never committed. In-process retries die along with the process.",
    "tags": [
      "service-to-service-communication",
      "staff",
      "inline"
    ]
  },
  {
    "id": "service-to-service-communication-n1",
    "topic": "service-to-service-communication",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Queue Buffer Sizing During Downstream Maintenance",
    "scenario": "Your checkout service emits order-fulfillment messages at a peak rate of 4,000 messages/second, with an average serialized message size of 2.5 KB. The downstream warehouse service undergoes a planned 15-minute (900-second) database migration where it pauses consumption.",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of durable broker disk backlog accumulate during the 15-minute pause (before replication factor)?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of durable broker disk backlog accumulate during the 15-minute pause (before replication factor)?",
    "unit": "GB",
    "answer": 9,
    "tolerance": 0.2,
    "hint": "Throughput = 4,000 msg/s × 2.5 KB = 10,000 KB/s = 10 MB/s. Multiply by 900 seconds.",
    "explanation": "At 4,000 messages/s × 2.5 KB/message, the producer generates 10 MB/s. Over a 900-second downtime window, the queue buffers 10 MB/s × 900 s = 9,000 MB = 9 GB of primary payload data (or 27 GB with 3x broker replication).",
    "tags": [
      "service-to-service-communication",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "service-to-service-communication-t1",
    "topic": "service-to-service-communication",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Synchronous RPC vs Asynchronous Outbox Queue for Post-Commit Side Effects",
    "scenario": "During user signup, the identity service must create the user row and trigger welcome emails, CRM provisioning, and fraud scoring. Currently, synchronous RPCs to those 3 services cause signup p99 to hit 2.4 seconds and fail whenever the external CRM API is flaky.",
    "prompt": "Which communication architecture should you adopt, and what is the primary justification?",
    "question": "Which communication architecture should you adopt, and what is the primary justification?",
    "options": [
      "Keep synchronous blocking RPCs to all 3 downstream systems but increase the client timeout to 30 seconds",
      "Fire-and-forget async HTTP calls in a background goroutine before the database transaction commits",
      "Commit the user row and an outbox event atomically in one local DB transaction, return success immediately, and fan out the event via a durable message broker to downstream consumers"
    ],
    "correctOption": 2,
    "reasons": [
      "Longer synchronous timeouts improve availability when a downstream dependency is down",
      "Firing unpersisted goroutines before commit guarantees delivery if the process crashes or the transaction rolls back",
      "Transactional outbox + async broker decouples user-facing signup availability and latency from non-critical downstream slowdowns while guaranteeing at-least-once event delivery"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How do you avoid both synchronous temporal coupling AND lost events on process crash?",
    "explanation": "Synchronous RPCs couple the availability and tail latency of user signup to the weakest downstream dependency. In-memory fire-and-forget loses events on crash. Writing a transactional outbox record in the same local transaction and publishing asynchronously achieves fast, reliable decoupling.",
    "tags": [
      "service-to-service-communication",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["http-rest-grpc"] = [
  {
    "id": "http-rest-grpc-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Counting Protobuf bytes",
    "section": "Worked example: the same message in JSON and Protobuf",
    "prompt": "Using the lesson's encoding rules, a message has int64 id = 1 set to 150 (a 2-byte varint) and string name = 2 set to \"bob\". How many bytes is the Protobuf encoding?",
    "options": [
      "6 bytes",
      "11 bytes",
      "8 bytes",
      "14 bytes"
    ],
    "answer": 2,
    "explanation": "id takes 1 tag byte plus a 2-byte varint (3 bytes), and name takes 1 tag byte, 1 length byte and 3 bytes of text (5 bytes), for 8 in total. Six bytes is what you get if you forget the tag and length bytes. The saving over JSON comes mostly from not repeating the field names.",
    "tags": [
      "http-rest-grpc",
      "apply",
      "inline"
    ]
  },
  {
    "id": "http-rest-grpc-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "HTTP/2's remaining stall",
    "section": "HTTP versions in one table",
    "prompt": "HTTP/2 multiplexes many streams over one connection and removes head-of-line blocking at the HTTP layer. What can still stall every stream on that connection?",
    "options": [
      "A single lost TCP packet, since TCP delivers bytes strictly in order",
      "A slow response on any one stream, since frames are sent in turn",
      "The browser's cap of about six connections per host",
      "Header compression state that must be rebuilt for each stream"
    ],
    "answer": 0,
    "explanation": "HTTP/2 still runs on one TCP byte stream, so a lost packet holds back data for all streams until it is retransmitted. HTTP/3 moves to QUIC so that a loss only stalls the streams whose data it carried. The six-connection limit applies to HTTP/1.1, which is the problem multiplexing was designed to remove.",
    "tags": [
      "http-rest-grpc",
      "recall",
      "inline"
    ]
  },
  {
    "id": "http-rest-grpc-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "gRPC pinned behind L4",
    "section": "Operational gotchas",
    "prompt": "Service A calls service B over gRPC through an L4 network load balancer. B scales from 4 to 12 pods, but nearly all traffic stays on the original 4. What is the most likely cause?",
    "options": [
      "gRPC clients cache DNS results permanently, as required by the gRPC spec",
      "The new pods fail health checks, because gRPC cannot serve HTTP health probes",
      "A's long-lived HTTP/2 connections were balanced once per connection and stay pinned",
      "The new pods run a newer .proto schema, so A's calls are routed away from them"
    ],
    "answer": 2,
    "explanation": "HTTP/2 keeps one long-lived connection that carries many calls, and an L4 balancer only makes a choice when a connection opens, so existing calls keep going to the old backends. The fix is per-request L7 balancing or client-side balancing. The DNS option sounds plausible, but it is not what the protocol requires, and it would not explain pinning behind a single load balancer address.",
    "tags": [
      "http-rest-grpc",
      "staff",
      "inline"
    ]
  },
  {
    "id": "http-rest-grpc-n1",
    "topic": "http-rest-grpc",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: JSON vs Protobuf East-West Bandwidth Savings",
    "scenario": "An internal recommendation fan-out service handles 50,000 RPCs/second. Each response carries 100 scored item structs totaling 12 KB as uncompressed JSON over HTTP/1.1, or 3 KB when encoded in binary Protobuf over gRPC.",
    "prompt": "How many megabytes per second (MB/s) of internal network bandwidth are saved by switching this service from uncompressed JSON to Protobuf?",
    "question": "How many megabytes per second (MB/s) of internal network bandwidth are saved by switching this service from uncompressed JSON to Protobuf?",
    "unit": "MB/s",
    "answer": 450,
    "tolerance": 0.2,
    "hint": "Per-response savings = 12 KB - 3 KB = 9 KB. Multiply by 50,000 req/s and divide by 1,000 KB/MB.",
    "explanation": "Each RPC saves 9 KB of wire payload. Across 50,000 req/s, total bandwidth drops from 600 MB/s to 150 MB/s—saving 450 MB/s (3.6 Gbps) of east-west network throughput and dramatically cutting CPU serialization overhead.",
    "tags": [
      "http-rest-grpc",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "http-rest-grpc-t1",
    "topic": "http-rest-grpc",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Public REST/JSON Edge + Internal gRPC Mesh",
    "scenario": "You are designing a platform that exposes APIs to third-party browser/partner developers while internally executing high-fanout calls across 30 polyglot microservices (Go, Rust, Java, Python).",
    "prompt": "Which protocol boundary architecture should you select, and what is the primary justification?",
    "question": "Which protocol boundary architecture should you select, and what is the primary justification?",
    "options": [
      "Force all external browser clients and third-party curl scripts to speak raw binary gRPC over HTTP/2 without transcoding",
      "Use verbose human-readable JSON/HTTP/1.1 for every internal microservice hop to avoid compiling `.proto` files",
      "Expose REST/JSON (or GraphQL) at the public API gateway for universal client compatibility, and transcode/route internally via strongly typed gRPC over HTTP/2"
    ],
    "correctOption": 2,
    "reasons": [
      "All web browsers natively support raw HTTP/2 trailers and binary gRPC framing without proxies",
      "Text-based JSON parsing and repeated field names are zero-cost at 100,000 internal RPCs/sec",
      "Combining an ergonomic REST/JSON public edge with binary, code-generated gRPC for east-west traffic maximizes external developer adoption while minimizing internal CPU, bandwidth, and contract drift"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "External partners value inspectability and browser compatibility; internal high-QPS meshes value strict `.proto` codegen, multiplexing, and compact binary wire formats.",
    "explanation": "Browsers and third-party developers expect standard HTTP/JSON tooling, whereas high-throughput internal service meshes benefit from Protobuf's strict schema codegen, compact binary encoding, and HTTP/2 multiplexing. Translating at the API gateway captures the strengths of both.",
    "tags": [
      "http-rest-grpc",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["tcp-vs-udp"] = [
  {
    "id": "tcp-vs-udp-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "TCP head-of-line blocking",
    "section": "Detailed Protocol Mechanics",
    "prompt": "Over one TCP connection, segments 1 to 5 are sent and segment 2 is lost, while 3, 4 and 5 arrive. What does the receiving application see until 2 is retransmitted?",
    "options": [
      "Segments 1, 3, 4 and 5 as they arrive, with a gap left for 2",
      "Only segment 1; the kernel holds 3 to 5 until 2 arrives",
      "Nothing at all, since the connection pauses until every ACK returns",
      "Segments 3 to 5 flagged as out of order, for the app to reorder"
    ],
    "answer": 1,
    "explanation": "TCP delivers an in-order byte stream, so the kernel buffers 3 to 5 and releases nothing beyond 1 until 2 is retransmitted. This is head-of-line blocking. Delivering with a gap is how UDP-based media behaves, where the application decides to skip lost data.",
    "tags": [
      "tcp-vs-udp",
      "recall",
      "inline"
    ]
  },
  {
    "id": "tcp-vs-udp-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Handshake round trips",
    "section": "Worked example: what a handshake costs",
    "prompt": "A client is 50 ms round-trip from the server. Roughly how long until the first byte of the response, for a new TCP plus TLS 1.3 connection versus a new QUIC connection?",
    "options": [
      "About 150 ms for TCP plus TLS 1.3, and about 100 ms for QUIC",
      "About 100 ms for TCP plus TLS 1.3, and about 50 ms for QUIC",
      "About 200 ms for TCP plus TLS 1.3, and about 100 ms for QUIC",
      "About 150 ms for TCP plus TLS 1.3, and about 50 ms for QUIC"
    ],
    "answer": 0,
    "explanation": "TCP plus TLS 1.3 needs 1 round trip for TCP, 1 for TLS and 1 for the request, which is 3 times 50 ms. QUIC combines the transport and TLS handshakes into 1 round trip, plus 1 for the request, giving 100 ms. The 50 ms QUIC figure is tempting, but that is resumed 0-RTT, not a new connection.",
    "tags": [
      "tcp-vs-udp",
      "apply",
      "inline"
    ]
  },
  {
    "id": "tcp-vs-udp-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Switching networks mid-session",
    "section": "Failure modes and gotchas",
    "prompt": "A mobile app holds a long-lived connection to your API, and the phone moves from Wi-Fi to cellular, which changes its IP address. How do TCP and QUIC compare?",
    "options": [
      "Both survive, because the TLS session ticket carries the session across",
      "Both break, because any transport is tied to the client's IP and port",
      "TCP survives thanks to keep-alive probes; QUIC must redo its handshake",
      "The TCP connection breaks; QUIC can carry on using its connection ID"
    ],
    "answer": 3,
    "explanation": "A TCP connection is identified by its address and port 4-tuple, so a new IP address breaks it. QUIC connections carry a connection ID, which lets them migrate to the new address. Session tickets are tempting, but they only speed up a new handshake; they do not keep the old connection alive.",
    "tags": [
      "tcp-vs-udp",
      "staff",
      "inline"
    ]
  },
  {
    "id": "tcp-vs-udp-n1",
    "topic": "tcp-vs-udp",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Cold TLS 1.3 over TCP vs QUIC (UDP) Connection Setup Latency",
    "scenario": "A mobile client is 60 ms Round-Trip Time (RTT) away from your edge server. A cold connection using TCP + TLS 1.3 requires 1 RTT for the TCP 3-way handshake plus 1 RTT for the TLS 1.3 handshake before sending the HTTP request (1 more RTT for the response). QUIC over UDP combines transport and cryptographic handshakes into 1 RTT before the request/response RTT.",
    "prompt": "How many milliseconds faster does the first HTTP response arrive over a cold 1-RTT QUIC connection compared to cold TCP + TLS 1.3?",
    "question": "How many milliseconds faster does the first HTTP response arrive over a cold 1-RTT QUIC connection compared to cold TCP + TLS 1.3?",
    "unit": "ms",
    "answer": 60,
    "tolerance": 0.2,
    "hint": "Cold TCP + TLS 1.3 + HTTP takes 3 RTTs (180 ms); cold QUIC + HTTP/3 takes 2 RTTs (120 ms). Difference = 1 RTT.",
    "explanation": "Cold TCP + TLS 1.3 requires 2 handshake RTTs + 1 request/response RTT = 3 × 60 ms = 180 ms. Cold QUIC (over UDP) completes the combined transport+TLS handshake in 1 RTT + 1 request/response RTT = 2 × 60 ms = 120 ms, saving 1 full RTT = 60 ms (or 120 ms with 0-RTT resumption).",
    "tags": [
      "tcp-vs-udp",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "tcp-vs-udp-t1",
    "topic": "tcp-vs-udp",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: UDP/RTP vs Single-Connection TCP for Real-Time Interactive Media",
    "scenario": "You are architecting a live 60-fps cloud gaming / WebRTC video stream over cellular networks with 2% packet loss and 50 ms RTT. Frames older than 80 ms are useless to the player.",
    "prompt": "Which transport protocol architecture should carry the media frames, and what is the primary justification?",
    "question": "Which transport protocol architecture should carry the media frames, and what is the primary justification?",
    "options": [
      "Stream all video and audio frames over a single standard TCP connection so every lost packet is guaranteed to arrive in order",
      "Use UDP (with WebRTC/SRTP, selective retransmission/FEC, and application-level congestion control) for media frames while keeping control signaling on a reliable channel",
      "Send raw UDP at a fixed 50 Mbps bitrate with no congestion control or feedback loop"
    ],
    "correctOption": 1,
    "reasons": [
      "Waiting 100+ ms for TCP kernel retransmission of an already-expired video frame improves interactive responsiveness",
      "TCP enforces strict byte-stream ordering that stalls delivery of newer, already-arrived frames behind a single lost packet (head-of-line blocking), whereas UDP lets the application skip stale frames and bound jitter",
      "Uncontrolled raw UDP blasts never trigger router bufferbloat or ISP packet drops"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "In real-time media, a frame arriving 120 ms late after TCP retransmission stalls all subsequent frames sitting in the kernel receive buffer.",
    "explanation": "TCP's kernel-level in-order byte stream delivery forces all subsequent packets to wait in the OS buffer until a single lost packet is retransmitted (head-of-line blocking). For real-time media, UDP with application-aware framing (RTP/SRTP or QUIC datagrams) allows rendering fresh frames immediately and using FEC or selective retransmission only when within the latency budget.",
    "tags": [
      "tcp-vs-udp",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["api-gateway-vs-load-balancer"] = [
  {
    "id": "api-gateway-vs-load-balancer-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Local rate limits and skew",
    "section": "Worked example: a request through both",
    "prompt": "A partner's quota is 100 requests per second. Ten gateway instances each enforce 10 per second locally. The partner sends 80 per second, but 40% of that lands on a single instance. What happens?",
    "options": [
      "Nothing is rejected, since 80 per second is under the partner's quota",
      "About 22 per second are rejected even though the partner is under quota",
      "About 8 per second are rejected, spread across all ten instances",
      "Everything on the busy instance is rejected until traffic rebalances"
    ],
    "answer": 1,
    "explanation": "The busy instance receives 32 per second against a local limit of 10, so it rejects about 22, while the other nine see about 5 each and reject nothing. This is the lesson's warning that local limits are cheap but uneven when traffic is skewed. A shared counter would be accurate, at the cost of about 1 ms per request.",
    "tags": [
      "api-gateway-vs-load-balancer",
      "apply",
      "inline"
    ]
  },
  {
    "id": "api-gateway-vs-load-balancer-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What L4 cannot see",
    "section": "Responsibility table",
    "prompt": "Which of these jobs is beyond an L4 load balancer such as AWS NLB, but routine for an API gateway?",
    "options": [
      "Spreading new TCP connections across healthy backends",
      "Routing requests for /v1/orders/* to the order service by path",
      "Passing encrypted TLS traffic through to backends unchanged",
      "Taking unhealthy instances out of rotation based on checks"
    ],
    "answer": 1,
    "explanation": "An L4 balancer sees only IP addresses, ports and the transport protocol, so it cannot read the HTTP path it would need for routing. TLS pass-through is the tempting wrong choice, but it is common at L4 precisely because the balancer never has to decrypt or parse the request.",
    "tags": [
      "api-gateway-vs-load-balancer",
      "recall",
      "inline"
    ]
  },
  {
    "id": "api-gateway-vs-load-balancer-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Health checks that lie",
    "section": "Failure modes",
    "prompt": "A backend's database pool deadlocks, and every HTTP request to it now returns 500. The load balancer uses a TCP-connect health check. What happens?",
    "options": [
      "The node stays in rotation, because it still accepts TCP connections",
      "The node is ejected after 2 to 3 failed checks, as with any failure",
      "The balancer spots the 500s and slowly drains the node's connections",
      "Traffic moves away once the node's CPU rises above normal levels"
    ],
    "answer": 0,
    "explanation": "The process is still listening, so a TCP check keeps passing while every request fails. The lesson recommends an HTTP health endpoint that checks the app's real readiness. Ejection after 2 to 3 failures is the tempting answer, but it only happens if the check itself fails, and a TCP check will not.",
    "tags": [
      "api-gateway-vs-load-balancer",
      "staff",
      "inline"
    ]
  },
  {
    "id": "api-gateway-vs-load-balancer-n1",
    "topic": "api-gateway-vs-load-balancer",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Gateway Auth Introspection Offload",
    "scenario": "An API Gateway handles 25,000 requests/second. Previously, each request triggered an inline 1.5 ms RPC from the gateway to the central Auth service to validate session tokens. You switch to local asymmetric JWT signature verification at the gateway (0.1 ms CPU, 0 RPCs) with a 60-second revocation list sync.",
    "prompt": "How many requests per second of network load are removed from the central Auth service by verifying JWTs locally at the API Gateway?",
    "question": "How many requests per second of network load are removed from the central Auth service by verifying JWTs locally at the API Gateway?",
    "unit": "req/s",
    "answer": 25000,
    "tolerance": 0.2,
    "hint": "Every one of the 25,000 req/s previously made 1 synchronous RPC to the Auth service.",
    "explanation": "Eliminating the per-request synchronous introspection RPC removes all 25,000 req/s of inline load from the central Auth service (replacing it with a tiny background revocation-list poll once per minute per gateway node) and shaves 1.4 ms off every request.",
    "tags": [
      "api-gateway-vs-load-balancer",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "api-gateway-vs-load-balancer-t1",
    "topic": "api-gateway-vs-load-balancer",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Layered L4/L7 Load Balancer + API Gateway vs Monolithic Edge",
    "scenario": "Your platform ingests 200,000 req/s across public REST APIs, static asset streams, and high-throughput internal service-to-service gRPC traffic. Currently, routing internal east-west gRPC calls through the external central API gateway adds 4 ms per hop and caused a cluster-wide outage when a rate-limit plugin Lua script had a bug.",
    "prompt": "Which traffic management topology should you adopt, and what is the primary justification?",
    "question": "Which traffic management topology should you adopt, and what is the primary justification?",
    "options": [
      "Route all north-south and east-west internal microservice calls through the single central API gateway cluster",
      "Remove the API gateway completely and implement OAuth verification, billing quotas, and WAF rules inside every microservice",
      "Use L4/L7 load balancers for fast transport distribution, keep the API Gateway dedicated to north-south edge concerns (auth, tenant rate-limiting, protocol translation), and use lightweight client-side/mesh L7 load balancing for east-west traffic"
    ],
    "correctOption": 2,
    "reasons": [
      "Hairpinning every internal RPC through a central north-south gateway minimizes latency and blast radius",
      "Duplicating WAF, OAuth, and billing quota logic across 40 microservices guarantees uniform security enforcement",
      "Separating north-south edge policy enforcement (API Gateway) from high-speed packet/connection distribution (LB) and internal east-west routing avoids central bottlenecks and blast-radius coupling"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "North-south edge traffic needs cross-cutting policy (auth, quotas); internal east-west RPCs need low-latency, fault-isolated routing.",
    "explanation": "An API Gateway excels at north-south edge concerns (authentication, tenant quotas, public schema translation), while L4/L7 load balancers and internal service meshes handle high-throughput packet/connection distribution without hairpinning east-west calls through a central policy choke point.",
    "tags": [
      "api-gateway-vs-load-balancer",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["load-balancers"] = [
  {
    "id": "load-balancers-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Herding on stale state",
    "section": "Under the Hood: Algorithm Deep Dive",
    "prompt": "Why does having every load balancer instance send each request to the globally least-loaded server work poorly with many independent balancers?",
    "options": [
      "Finding the minimum takes O(n) time, which is too slow to do per request",
      "Least-loaded ignores request duration, so long requests still pile up",
      "They act on the same stale view and all pick the same server at once",
      "It forces sticky sessions, which breaks backends that are stateless"
    ],
    "answer": 2,
    "explanation": "Balancers working from the same slightly stale load numbers all pick the same apparently idle server, which overloads it. This is called herding. Power of two choices avoids it using only local information. The O(n) cost is the tempting answer, but the lesson's real objection is that the shared state is stale, not that the search is slow.",
    "tags": [
      "load-balancers",
      "recall",
      "inline"
    ]
  },
  {
    "id": "load-balancers-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Two choices, in numbers",
    "section": "Worked example: why random is not good enough, and two choices is",
    "prompt": "You send 1,000 requests to 1,000 servers. Roughly what is the busiest server's load when each request picks one server at random, versus when it samples two and takes the less loaded?",
    "options": [
      "About 5 or 6 with random choice, and about 3 with two choices",
      "About 3 with random choice, and exactly 1 with two choices",
      "About 2 with either strategy, since the average load is 1",
      "About 30 with random choice, and about 10 with two choices"
    ],
    "answer": 0,
    "explanation": "Random placement's maximum grows like log n divided by log log n, and for n = 1,000 it is typically 5 or 6 in practice (the formula itself gives only about 3.6 here, because constant factors still matter at this size), while two choices grows only as log log n, typically about 3. Exactly 1 is tempting, but it would need perfect global coordination, and sampling more than two servers adds only small gains.",
    "tags": [
      "load-balancers",
      "apply",
      "inline"
    ]
  },
  {
    "id": "load-balancers-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Deep checks fail together",
    "section": "Health checking details",
    "prompt": "Every node's /healthz also runs a database query. The database blips for 5 seconds, and the balancer marks a node down after 2 failed checks. What happens, and which setting limits the damage?",
    "options": [
      "Only the nodes with the slowest queries fail, and outlier detection removes them",
      "Every node is marked down at once; a panic threshold keeps sending traffic to all of them",
      "Connection draining lets in-flight requests finish, so users notice nothing at all",
      "Nodes stay healthy, because active checks ignore dependency errors by default"
    ],
    "answer": 1,
    "explanation": "A health check that depends on a shared database fails on every node at the same moment, emptying the pool. With a panic threshold, when too many nodes look unhealthy (for example over 50%), the balancer sends traffic to all of them instead of to nobody. Outlier detection ejects individual bad nodes, which does not help when all of them look bad.",
    "tags": [
      "load-balancers",
      "staff",
      "inline"
    ]
  },
  {
    "id": "load-balancers-n1",
    "topic": "load-balancers",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: L7 Load Balancer Ephemeral Port Exhaustion",
    "scenario": "An L7 reverse proxy opens a new non-pooled TCP connection to a single upstream backend IP:port for every incoming request, and closed connections remain in `TIME_WAIT` for 60 seconds. The OS ephemeral port range has 60,000 usable ports.",
    "prompt": "What is the maximum sustained request rate (in req/s) to that single backend IP:port before ephemeral ports are exhausted?",
    "question": "What is the maximum sustained request rate (in req/s) to that single backend IP:port before ephemeral ports are exhausted?",
    "unit": "req/s",
    "answer": 1000,
    "tolerance": 0.25,
    "hint": "Max rate = usable ephemeral ports (60,000) ÷ TIME_WAIT duration in seconds (60 s).",
    "explanation": "Each unique 4-tuple (LB IP, ephemeral port, backend IP, backend port) is locked for the 60-second `TIME_WAIT` window. With 60,000 ephemeral ports and no HTTP keep-alive connection pooling, the LB can sustain at most 60,000 / 60 = 1,000 connections/sec to that backend IP:port.",
    "tags": [
      "load-balancers",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "load-balancers-t1",
    "topic": "load-balancers",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: L4 Direct Server Return (DSR) vs L7 Reverse Proxy",
    "scenario": "You are designing the edge ingress for a video chunk CDN origin serving 400 Gbps of egress traffic where requests are 500-byte HTTP GETs and responses are 4 MB video segments.",
    "prompt": "Which load-balancing topology should you deploy at the edge, and why?",
    "question": "Which load-balancing topology should you deploy at the edge, and why?",
    "options": [
      "Full L7 proxy where all 4 MB response payloads traverse the load balancer CPU and NICs",
      "L4 load balancer with Direct Server Return (DSR / Maglev-style encapsulation) so backend servers send response packets directly to clients",
      "DNS round-robin directly to backend server IPs with no health checks or anycast"
    ],
    "correctOption": 1,
    "reasons": [
      "L7 proxies double the NIC bandwidth capacity without adding packet processing overhead",
      "Because egress bytes are 8,000x larger than ingress bytes, bypassing the load balancer on the return path prevents LB egress NIC saturation",
      "DNS round-robin guarantees instantaneous sub-second failover when a node crashes"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Compare the ingress request size (500 B) to the egress response size (4 MB).",
    "explanation": "In asymmetric media workloads (500 B request vs 4 MB response), routing return traffic through an L7 load balancer forces the LB fleet to handle 400 Gbps of egress. L4 DSR lets the LB process only tiny ingress packets while backends stream responses directly to the client IP.",
    "tags": [
      "load-balancers",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["consistent-hashing-load-balancing"] = [
  {
    "id": "consistent-hashing-load-balancing-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why random routing hurts caches",
    "section": "Under the Hood: Sticky Routing & Cache Locality",
    "prompt": "A tier of N servers each keeps an in-process cache. Why does routing requests at random, instead of by key, hurt the hit rate?",
    "options": [
      "Random routing breaks the TTLs, so entries expire at different times",
      "Each node ends up caching the whole working set, cutting capacity about N times",
      "Random routing sends more requests to each node, so entries are evicted faster",
      "Nodes must copy entries to each other on every write, which adds latency"
    ],
    "answer": 1,
    "explanation": "With random routing, every key can land on any node, so each node tries to hold the same hot set, and the tier's effective cache is only about one node's worth. Routing by key partitions the set across nodes. The request-volume option is tempting, but random routing does not change the total load on each node, only which keys each node sees.",
    "tags": [
      "consistent-hashing-load-balancing",
      "recall",
      "inline"
    ]
  },
  {
    "id": "consistent-hashing-load-balancing-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Keys moved on scale-out",
    "section": "Worked example: how many keys move",
    "prompt": "A cache tier grows from 20 to 21 servers and holds 210 million keys. Roughly how many keys change servers with hash mod N, and with a consistent-hash ring?",
    "options": [
      "About 10 million with modulo hashing, and about 10 million with the ring",
      "About 105 million with modulo hashing, and about 10 million with the ring",
      "About 200 million with modulo hashing, and about 200 million with the ring",
      "About 200 million with modulo hashing, and about 10 million with the ring"
    ],
    "answer": 3,
    "explanation": "With modulo hashing, a key only stays put if hash mod 20 equals hash mod 21, which is true for about 1 in 21 keys, so about 200 million move. With a ring, the new server takes about 1/21 of the key space, around 10 million keys. The 105 million option is the tempting halfway guess that has no basis in either scheme.",
    "tags": [
      "consistent-hashing-load-balancing",
      "apply",
      "inline"
    ]
  },
  {
    "id": "consistent-hashing-load-balancing-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Dead server, one heir",
    "section": "Failure modes",
    "prompt": "A ring places one point per server, with no virtual nodes. One server dies during peak traffic. What is the main risk?",
    "options": [
      "Its keys scatter evenly across the survivors, so each gets about 1/N more load",
      "Every key on the ring is remapped, so all caches start cold at the same time",
      "Its whole arc goes to the next server clockwise, which may then overload and fail too",
      "Clients stop routing requests until a coordinator publishes a new server list"
    ],
    "answer": 2,
    "explanation": "Without virtual nodes, the dead server's entire range lands on a single neighbour, which can overload it and set off a chain of failures around the ring. Even spreading is the tempting answer, but that is exactly what virtual nodes provide, and they are missing here. Remapping every key describes modulo hashing, not a ring.",
    "tags": [
      "consistent-hashing-load-balancing",
      "staff",
      "inline"
    ]
  },
  {
    "id": "consistent-hashing-load-balancing-n1",
    "topic": "consistent-hashing-load-balancing",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Bounded-Load Consistent Hashing Capacity Cap",
    "scenario": "A consistent-hashing load balancer routes 8,000 requests/second across 10 backend cache-affinity nodes using Mirrokni/Vimeo Bounded-Load Consistent Hashing with a load-factor parameter c = 1.25 (meaning no node may receive more than 1.25x the average load).",
    "prompt": "What is the maximum request rate (in req/s) that the load balancer will permit any single hot node to receive before spilling excess requests to the next node on the ring?",
    "question": "What is the maximum request rate (in req/s) that the load balancer will permit any single hot node to receive before spilling excess requests to the next node on the ring?",
    "unit": "req/s",
    "answer": 1000,
    "tolerance": 0.2,
    "hint": "Average load per node = 8,000 / 10 = 800 req/s. Multiply by c = 1.25.",
    "explanation": "With 8,000 req/s across 10 nodes, the average load is 800 req/s per node. Bounded-load consistent hashing caps each node at c × average = 1.25 × 800 = 1,000 req/s, preventing a single viral key from melting its primary ring owner.",
    "tags": [
      "consistent-hashing-load-balancing",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "consistent-hashing-load-balancing-t1",
    "topic": "consistent-hashing-load-balancing",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Bounded-Load Consistent Hashing vs Pure Ring Hashing or Least-Connections",
    "scenario": "Your document preview service holds 2 GB of expensive in-memory parsed font/asset caches per tenant on each worker. Pure least-connections routing causes a 90% in-memory cache miss rate, while pure consistent hashing by `tenant_id` caused a single large enterprise tenant to overload one worker to 100% CPU.",
    "prompt": "Which load-balancing algorithm should you deploy, and what is the primary justification?",
    "question": "Which load-balancing algorithm should you deploy, and what is the primary justification?",
    "options": [
      "Switch to pure random round-robin and quadruple the RAM on every worker node",
      "Use pure consistent hashing with 1 virtual node per server",
      "Use consistent hashing with virtual nodes and a bounded-load overflow cap (or Power-of-Two-Choices over two deterministic ring hashes per tenant)"
    ],
    "correctOption": 2,
    "reasons": [
      "Random routing maximizes locality for tenant-specific in-memory caches",
      "Using 1 virtual node per server eliminates hot-key overload on a viral tenant",
      "Bounded-load consistent hashing (or deterministic 2-choice hashing) preserves locality for 99% of tenants while bounding worst-case hot-tenant overload via controlled spillover"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How do you keep locality for normal keys while capping the maximum load any single server can take during a hot-key spike?",
    "explanation": "Pure least-connections destroys cache locality, while pure consistent hashing is vulnerable to hot keys (since all requests for a hot key hash to the same point on the ring). Bounded-load consistent hashing (or hashing a key to k=2 deterministic candidate nodes and picking the less loaded one) preserves high hit rates while preventing single-node overload.",
    "tags": [
      "consistent-hashing-load-balancing",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["event-contracts"] = [
  {
    "id": "event-contracts-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Upgrade order for BACKWARD",
    "section": "Schema Evolution Compatibility Modes",
    "prompt": "Under BACKWARD compatibility (Confluent's default), which side must be upgraded first when a schema changes, and why?",
    "options": [
      "Consumers first, because the new schema must read events written with the old one",
      "Producers first, because old consumers must be able to read the new events",
      "Either side first, because BACKWARD allows both upgrade orders",
      "Producers first, because the registry rejects reads that use an old schema"
    ],
    "answer": 0,
    "explanation": "BACKWARD means new reader code can read data written with the previous schema, so consumers upgrade first while producers are still writing old events. Producers first is the rule for FORWARD compatibility, and it is the most common mix-up. Only FULL compatibility allows either order.",
    "tags": [
      "event-contracts",
      "recall",
      "inline"
    ]
  },
  {
    "id": "event-contracts-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "New field, no default",
    "section": "Worked example: adding a field to OrderPlaced",
    "prompt": "The registry runs in BACKWARD mode. A team adds a required string field channel to OrderPlaced with no default value. What happens when they register the schema?",
    "options": [
      "It is accepted, because adding a field is always a safe, additive change",
      "It is rejected, because new consumers could not read old events that lack the field",
      "It is accepted, but only old consumers will fail when they read new events",
      "It is rejected, because BACKWARD mode forbids adding any new field at all"
    ],
    "answer": 1,
    "explanation": "A new reader schema needs a value for channel when it reads old events that do not have one, and without a default it cannot fill that in, so the registry rejects the change. \"Adding a field is safe\" is the tempting answer carried over from APIs; with Avro the default is what makes the addition compatible.",
    "tags": [
      "event-contracts",
      "apply",
      "inline"
    ]
  },
  {
    "id": "event-contracts-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Replays need transitive checks",
    "section": "Compatibility modes",
    "prompt": "A topic keeps events forever. The registry uses BACKWARD, not BACKWARD_TRANSITIVE. Schema v3 passed the check against v2 but would fail against v1. A new consumer replays from the start. What breaks?",
    "options": [
      "Nothing, because each version was checked against the one before it",
      "Only producers still writing v1 fail, and the registry rejects their writes",
      "The consumer can fail on the oldest v1 events, which v3 was never checked against",
      "The consumer reads v1 events correctly but silently drops v2 fields"
    ],
    "answer": 2,
    "explanation": "Plain BACKWARD checks a new schema only against the latest version, so compatibility with older data is not guaranteed. The lesson notes that the TRANSITIVE modes are needed when consumers replay old history. \"Each step was checked\" is the tempting answer, but compatibility is not guaranteed to carry across several steps.",
    "tags": [
      "event-contracts",
      "staff",
      "inline"
    ]
  },
  {
    "id": "event-contracts-n1",
    "topic": "event-contracts",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Fat Event vs Claim-Check Broker Retention Storage",
    "scenario": "An event stream processes 5,000 events/second with a 7-day (604,800-second; use 600,000 seconds for napkin math) retention period and a 3x broker replication factor. A proposed \"fat event\" embeds a 10 KB document snapshot, whereas a lean schema with a Schema Registry ID stores a 500-byte (0.5 KB) event.",
    "prompt": "Using 600,000 seconds for 7 days, how many terabytes (TB, where 1 TB = 10^12 bytes) of replicated broker disk space does the 0.5 KB lean event require (compared to 90 TB for the 10 KB fat event)?",
    "question": "Using 600,000 seconds for 7 days, how many terabytes (TB, where 1 TB = 10^12 bytes) of replicated broker disk space does the 0.5 KB lean event require (compared to 90 TB for the 10 KB fat event)?",
    "unit": "TB",
    "answer": 4.5,
    "tolerance": 0.2,
    "hint": "Total events in 7 days = 5,000 × 600,000 = 3 × 10^9 events. Multiply by 500 bytes and by 3 replicas, then divide by 10^12.",
    "explanation": "Over 600,000 seconds, 5,000 events/s produces 3 × 10^9 events. At 500 bytes/event, primary volume is 1.5 × 10^12 bytes (1.5 TB). With 3x replication, broker storage is 4.5 TB—saving 85.5 TB of fast NVMe broker storage compared to the 90 TB fat event.",
    "tags": [
      "event-contracts",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "event-contracts-t1",
    "topic": "event-contracts",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Schema Registry with Forward/Backward Compatibility vs Unvalidated JSON Topics",
    "scenario": "Thirty analytics and microservice consumers read from the `OrderCompleted` Kafka topic. Last week, the checkout team renamed `total_cents` to `amount_cents` in a JSON payload without coordination, crashing the billing and fraud consumers in production.",
    "prompt": "Which event contract governance mechanism should you enforce, and what is the primary justification?",
    "question": "Which event contract governance mechanism should you enforce, and what is the primary justification?",
    "options": [
      "Keep schemaless JSON and require all 30 consumer teams to attend a weekly change-review meeting",
      "Enforce a central Schema Registry (Protobuf/Avro) with CI/CD FULL_TRANSITIVE compatibility checks so breaking field renames or removals fail the producer build before deployment",
      "Have consumers query the producer's internal PostgreSQL database directly instead of reading event payloads"
    ],
    "correctOption": 1,
    "reasons": [
      "Manual meetings catch 100% of accidental JSON serialization changes in code",
      "Automated schema compatibility gates in CI/CD plus wire-format schema IDs guarantee that producers and consumers can deploy independently in any order without runtime deserialization outages",
      "Sharing internal service databases across 30 teams reduces coupling"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "In an asynchronous pub/sub topology, producers cannot upgrade all consumers atomically and old events remain in the log for days.",
    "explanation": "Because Kafka/event logs retain historical messages and decouple producer/consumer deployment schedules, breaking changes cannot be coordinated purely by deploy order. Enforcing backward and forward (FULL_TRANSITIVE) compatibility in a Schema Registry at CI/CD time prevents breaking changes from ever reaching production.",
    "tags": [
      "event-contracts",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["retries-timeouts-idempotency"] = [
  {
    "id": "retries-timeouts-idempotency-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Layered retry multiplier",
    "section": "Under the Hood: The Retry Storm Catastrophe",
    "prompt": "The API, the order service and the database client each retry up to 2 times (3 attempts each). If every attempt fails, how many calls can one user request cause at the database?",
    "options": [
      "6",
      "9",
      "81",
      "27"
    ],
    "answer": 3,
    "explanation": "Retries multiply across layers, so 3 attempts at each of 3 layers gives 3 times 3 times 3, which is 27 calls. Six is the tempting sum you get by adding the retries instead of multiplying them. This compounding is why retries should happen at one layer and be capped with a budget.",
    "tags": [
      "retries-timeouts-idempotency",
      "apply",
      "inline"
    ]
  },
  {
    "id": "retries-timeouts-idempotency-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Retry budget vs breaker",
    "section": "Under the Hood: Retry Budgets & Timeout Tiers",
    "prompt": "A client uses a 10% retry budget, and a dependency starts failing half of all requests. How does the budget behave differently from a circuit breaker?",
    "options": [
      "The budget stops every request once 10% of them fail, while a breaker only stops retries",
      "The budget drops retries above 10% of traffic while originals flow; a breaker stops all requests",
      "The budget delays retries with jitter up to a 10% cap, while a breaker drops them outright",
      "The two behave the same way, and the budget is just a breaker measured in percentages"
    ],
    "answer": 1,
    "explanation": "A retry budget caps the extra load from retries, so original requests keep flowing and offered load stays near normal. A circuit breaker is a separate mechanism that stops sending any requests while the error rate stays high. The first option swaps the two roles, which is the usual confusion.",
    "tags": [
      "retries-timeouts-idempotency",
      "staff",
      "inline"
    ]
  },
  {
    "id": "retries-timeouts-idempotency-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Safe to retry blindly",
    "section": "Which failures to retry",
    "prompt": "For a POST that is not idempotent and has no idempotency key, which failure can be retried without risking a duplicate side effect?",
    "options": [
      "The connection was refused before any bytes of the request were sent",
      "The read timed out after the full request body had been sent",
      "The server returned 500 Internal Server Error partway through",
      "The server returned 422 because the payload failed validation"
    ],
    "answer": 0,
    "explanation": "If the connection was refused before sending, the server never processed the request, so retrying cannot repeat it. A timeout after sending is the tempting case, but the outcome is unknown and the server may have done the work. 422 will simply fail again in the same way.",
    "tags": [
      "retries-timeouts-idempotency",
      "recall",
      "inline"
    ]
  },
  {
    "id": "retries-timeouts-idempotency-n1",
    "topic": "retries-timeouts-idempotency",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Cascading Retry Amplification Across 3 Tiers",
    "scenario": "An API Gateway calls Service A, which calls Service B, which queries a Database (3 sequential hops). Each hop is configured with 1 initial attempt plus 2 retries (3 total attempts per failed call) and no retry budget.",
    "prompt": "When the database experiences a transient brownout, how many database query attempts are triggered by a single incoming user request?",
    "question": "When the database experiences a transient brownout, how many database query attempts are triggered by a single incoming user request?",
    "unit": "attempts",
    "answer": 27,
    "tolerance": 0.25,
    "hint": "Multiply total attempts per tier across the 3 tiers: 3 × 3 × 3.",
    "explanation": "Without per-tier retry budgets or single-layer retry ownership, retries multiply exponentially across call depth: 3 (Gateway→A) × 3 (A→B) × 3 (B→DB) = 3^3 = 27 database attempts per user request, turning a brief brownout into a 27x load spike.",
    "tags": [
      "retries-timeouts-idempotency",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "retries-timeouts-idempotency-t1",
    "topic": "retries-timeouts-idempotency",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Idempotency Key Storage & Concurrency Locking",
    "scenario": "A payment capture API receives duplicate POST requests with the same `Idempotency-Key` 15 ms apart when a mobile client retries on a flaky cellular handoff while the first request is still in flight.",
    "prompt": "How should the server coordinate concurrent requests sharing an `Idempotency-Key`, and why?",
    "question": "How should the server coordinate concurrent requests sharing an `Idempotency-Key`, and why?",
    "options": [
      "Write the idempotency record only after the downstream payment gateway returns HTTP 200",
      "Atomically insert the `Idempotency-Key` with state `IN_PROGRESS` (and a lease timestamp) before calling the gateway, returning `409 Conflict` or awaiting completion for concurrent duplicates",
      "Hash the request timestamp into the idempotency key so both requests execute independently"
    ],
    "correctOption": 1,
    "reasons": [
      "Post-execution writes prevent concurrent in-flight duplicates from racing to the payment gateway",
      "Atomic pre-execution reservation serializes concurrent retries so the side effect is triggered at most once",
      "Including the client timestamp guarantees duplicate retries are deduplicated"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What happens if the second request arrives before the first request finishes calling Stripe/Visa?",
    "explanation": "If the idempotency key is only recorded after execution completes, two concurrent retries arriving 15 ms apart will both pass the lookup check and double-charge the card. Atomically claiming the key as `IN_PROGRESS` before invoking external side effects closes the race window.",
    "tags": [
      "retries-timeouts-idempotency",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["batching"] = [
  {
    "id": "batching-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Multi-row INSERT atomicity",
    "section": "Under the Hood: Production Batching Invariants",
    "prompt": "You write 500 click rows with one multi-row INSERT ... VALUES statement, and row 42 violates a unique constraint. What happens by default?",
    "options": [
      "The other 499 rows are inserted, and row 42 is reported as a failure",
      "Rows 1 to 41 are kept, and the statement stops at row 42",
      "The whole statement fails, and none of the 500 rows are inserted",
      "Row 42 overwrites the existing row, and the insert succeeds"
    ],
    "answer": 2,
    "explanation": "A single SQL statement is atomic, so one duplicate key fails all 500 rows unless you add ON CONFLICT or handle rows individually. Per-item success is the tempting answer because good batch APIs are designed that way, but the database does not behave like that on its own.",
    "tags": [
      "batching",
      "recall",
      "inline"
    ]
  },
  {
    "id": "batching-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Throughput per worker",
    "section": "Worked example: inserting click events",
    "prompt": "Each database round trip costs 2 ms of fixed overhead, and each row adds 0.01 ms. With batches of 200 rows, roughly what throughput can one connection sustain?",
    "options": [
      "About 50,000 rows per second",
      "About 100,000 rows per second",
      "About 25,000 rows per second",
      "About 500 rows per second"
    ],
    "answer": 0,
    "explanation": "Throughput is batch size divided by (fixed cost plus batch size times per-item cost): 200 divided by (2 ms plus 2 ms) is 50 rows per ms, or 50,000 per second. 100,000 is the tempting answer if you drop the per-row term, and that term is what makes bigger batches give diminishing returns.",
    "tags": [
      "batching",
      "apply",
      "inline"
    ]
  },
  {
    "id": "batching-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Acknowledged, then lost",
    "section": "Failure modes",
    "prompt": "A logging client tells callers \"written\" as soon as a record enters its in-memory batch, and it flushes every 50 ms. The process is OOM-killed. What is the consequence, and what is the fix?",
    "options": [
      "Nothing is lost, because the kernel flushes the process's buffers when it exits",
      "Only records that were already being sent are lost; add retries on reconnect",
      "The whole log file is corrupted; switch to smaller batches with a shorter linger",
      "Up to about 50 ms of acknowledged records vanish; acknowledge only after the flush"
    ],
    "answer": 3,
    "explanation": "In-memory batches are not durable until they are flushed, so everything acknowledged since the last flush is lost with the process. If callers need durability, the acknowledgement must wait for the flush. Kernel flushing is the tempting answer, but it only covers data already handed to the operating system, not a buffer inside the application's heap.",
    "tags": [
      "batching",
      "staff",
      "inline"
    ]
  },
  {
    "id": "batching-n1",
    "topic": "batching",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Micro-Batch Throughput Gain via Amortized Per-RPC Overhead",
    "scenario": "Writing a single telemetry record to a remote storage engine incurs 1.8 ms of fixed network/fsync overhead plus 0.02 ms of per-record CPU processing. You switch from batch size B = 1 to micro-batching B = 90 records per RPC.",
    "prompt": "How many records per second can a single synchronous worker thread write when micro-batching B = 90 records per call?",
    "question": "How many records per second can a single synchronous worker thread write when micro-batching B = 90 records per call?",
    "unit": "records/s",
    "answer": 25000,
    "tolerance": 0.2,
    "hint": "Batch latency = 1.8 ms + (90 × 0.02 ms) = 1.8 + 1.8 = 3.6 ms. Throughput = 90 records / 0.0036 s.",
    "explanation": "With B = 1, each write takes 1.82 ms (~549 records/s). With B = 90, total RPC time is 1.8 ms + (90 × 0.02 ms) = 3.6 ms. Processing 90 records every 3.6 ms yields 90 / 0.0036 = 25,000 records/second—a 45x throughput boost from a single thread.",
    "tags": [
      "batching",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "batching-t1",
    "topic": "batching",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Dual-Trigger (Size OR Linger Timeout) Batching vs Count-Only Batching",
    "scenario": "Your audit-log ingestion client batches 500 records before flushing to disk to maximize IOPS efficiency. During off-peak night hours, traffic drops to 2 records/second, causing audit entries to sit invisibly in client memory for over 4 minutes and violating your 5-second visibility SLO.",
    "prompt": "Which batching discipline should you implement, and what is the primary justification?",
    "question": "Which batching discipline should you implement, and what is the primary justification?",
    "options": [
      "Disable batching completely so every peak-hour write triggers an individual fsync",
      "Keep count-only batching at 500 records and inject 498 dummy heartbeat records every second during off-peak hours",
      "Flush the buffer whenever EITHER the batch reaches 500 records/byte-cap OR a linger timer (e.g., 50 ms) expires since the first buffered item, paired with explicit per-item partial failure responses"
    ],
    "correctOption": 2,
    "reasons": [
      "Individual fsyncs per message at peak load maximize disk throughput",
      "Writing 99% dummy records to disk saves storage and IOPS",
      "A dual-threshold trigger (max batch size/bytes OR max linger time) achieves full batch amortization under high load while strictly bounding tail latency under low load"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How do Kafka producers (`batch.size` + `linger.ms`) bound latency when traffic is sparse while still batching heavily at peak?",
    "explanation": "Count-only batching starves low-volume traffic and blows up tail latency. Combining a size/byte threshold (`batch.size`) with a strict linger deadline (`linger.ms`) ensures batches flush immediately when full at peak QPS and never wait longer than the linger window during quiet periods.",
    "tags": [
      "batching",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["backpressure"] = [
  {
    "id": "backpressure-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "TCP zero window",
    "section": "Under the Hood: The Three Backpressure Defenses",
    "prompt": "A consumer's application thread stops reading from its TCP socket, while the sender keeps writing. What happens at the transport layer?",
    "options": [
      "The receiver's kernel drops the new segments, and the sender retransmits them",
      "The receive buffer fills, the window shrinks to zero, and the sender's kernel stops sending",
      "The sender's kernel buffers data without limit until the receiver starts reading again",
      "The connection is reset after a timeout, because the receiver looks unresponsive"
    ],
    "answer": 1,
    "explanation": "TCP flow control advertises the receiver's free buffer space as its window. When the application stops reading, the window drops to zero and the sender pauses, which is backpressure built into the kernel. Dropping and retransmitting is the tempting answer, but that is loss recovery, not flow control.",
    "tags": [
      "backpressure",
      "recall",
      "inline"
    ]
  },
  {
    "id": "backpressure-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Draining the backlog",
    "section": "Worked example: how fast a queue fills",
    "prompt": "A consumer handles 2,000 messages per second. A spike sends 2,500 per second for 20 minutes, then arrivals drop back to 1,500 per second. How long does the backlog take to clear after the spike?",
    "options": [
      "About 5 minutes",
      "About 10 minutes",
      "About 20 minutes",
      "About 5 hours"
    ],
    "answer": 2,
    "explanation": "The backlog grows by 500 per second for 1,200 seconds, reaching 600,000 messages, and afterwards the consumer has only 500 per second of spare capacity, so draining takes 1,200 seconds, about 20 minutes. Five minutes is the tempting answer if you divide by the full 2,000 per second and forget that new messages keep arriving.",
    "tags": [
      "backpressure",
      "apply",
      "inline"
    ]
  },
  {
    "id": "backpressure-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Rejected, then retried",
    "section": "Failure modes",
    "prompt": "Your service correctly returns 503 when its queue is full, but load stays high and the queue never recovers. What is the most likely reason?",
    "options": [
      "Clients retry immediately, so rejected work returns as new load",
      "503 is the wrong status code, since backpressure must use 429",
      "The queue limit is too small, so it should be made unbounded",
      "The TCP window has shrunk to zero, so the 503s never reach clients"
    ],
    "answer": 0,
    "explanation": "Retry storms defeat backpressure: if rejected clients come straight back, the rejection only moves the pressure around. Clients need backoff and Retry-After, ideally together with retry budgets. Removing the limit is the tempting fix, but an unbounded queue just trades rejections for growing latency and, eventually, running out of memory.",
    "tags": [
      "backpressure",
      "staff",
      "inline"
    ]
  },
  {
    "id": "backpressure-n1",
    "topic": "backpressure",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Time to OOM Without Backpressure",
    "scenario": "An ingestion proxy receives 15,000 requests/second while its downstream database degrades and can only drain 5,000 requests/second. The proxy buffers pending requests in an unbounded in-memory queue where each request holds a 40 KB payload buffer, and the process has 4 GB (4,000 MB) of free heap.",
    "prompt": "How many seconds until the proxy exhausts its 4,000 MB heap and crashes with an Out-Of-Memory (OOM) error?",
    "question": "How many seconds until the proxy exhausts its 4,000 MB heap and crashes with an Out-Of-Memory (OOM) error?",
    "unit": "seconds",
    "answer": 10,
    "tolerance": 0.2,
    "hint": "Net queue growth = (15,000 - 5,000) = 10,000 req/s. Memory growth = 10,000 × 40 KB = 400 MB/s. Divide 4,000 MB by 400 MB/s.",
    "explanation": "The queue accumulates 15,000 - 5,000 = 10,000 requests/second. At 40 KB per request, memory grows by 400,000 KB/s = 400 MB/s. A 4,000 MB heap is completely exhausted in 4,000 / 400 = 10 seconds, crashing the proxy fleet.",
    "tags": [
      "backpressure",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "backpressure-t1",
    "topic": "backpressure",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Bounded Queues with End-to-End Flow Control vs Unbounded In-Memory Buffering",
    "scenario": "A streaming analytics pipeline reads from TCP sockets, transforms events in worker pools, and writes to ClickHouse. When ClickHouse merges slow down writes for 60 seconds, intermediate worker nodes suffer GC death spirals and OOM crashes because internal channel queues are unbounded.",
    "prompt": "Which backpressure design should you implement, and what is the primary justification?",
    "question": "Which backpressure design should you implement, and what is the primary justification?",
    "options": [
      "Attach swap files on disk to back the unbounded in-memory queues so the JVM/Go runtime never hits OOM",
      "Replace all unbounded queues with strictly bounded queues/semaphores that propagate blocking or explicit pull-credits upstream to the TCP socket reader (or broker consumer pause)",
      "Silently drop random records from the middle of the internal worker queues whenever memory exceeds 80%"
    ],
    "correctOption": 1,
    "reasons": [
      "Swapping heap memory to disk during a latency spike improves GC pause times and throughput",
      "Bounded queues with upstream flow-control propagation cap memory usage to a deterministic ceiling and slow the producer/reader at the source instead of crashing intermediate nodes",
      "Silent mid-pipeline drops preserve data integrity for financial and analytics streams"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "If the sink slows down, how does the source learn to stop reading from the socket or broker?",
    "explanation": "Unbounded queues merely convert a temporary downstream slowdown into a catastrophic memory exhaustion crash. Bounded queues paired with end-to-end backpressure (blocking upstream stages, pausing Kafka partition fetches, or letting TCP receive windows fill) keep memory flat and push the rate limit all the way back to the producer.",
    "tags": [
      "backpressure",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["tail-latency"] = [
  {
    "id": "tail-latency-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Fan-out to 50 leaves",
    "section": "Worked example: fan-out amplification",
    "prompt": "A request waits for 50 leaf servers, and each leaf is fast 99% of the time, independently. Roughly what fraction of user requests hit at least one slow leaf?",
    "options": [
      "About 1%",
      "About 40%",
      "About 50%",
      "About 5%"
    ],
    "answer": 1,
    "explanation": "The chance that all 50 leaves are fast is 0.99 to the 50th power, about 0.605, so about 40% of requests hit a slow leaf. 50% is the tempting shortcut of adding 1% fifty times, which overstates the result because it counts cases with several slow leaves more than once.",
    "tags": [
      "tail-latency",
      "apply",
      "inline"
    ]
  },
  {
    "id": "tail-latency-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hedging too eagerly",
    "section": "Hedged requests, with numbers",
    "prompt": "To cut its tail, a team sends every read to two replicas at once and uses whichever answers first. Compared with hedging after the p95 latency, what is the risk?",
    "options": [
      "None, because the loser is cancelled before it uses any resources",
      "Reads may come back stale, because replicas lag and hedging picks the slower one",
      "Load roughly doubles, which can deepen queues and worsen the tail",
      "The p50 gets worse, because clients wait for both replies before merging"
    ],
    "answer": 2,
    "explanation": "Sending a hedge only after p95 adds at most about 5% extra load, while duplicating every read doubles it and can create the queueing that causes tails. Instant cancellation is the tempting answer, but that is the tied-request design, which needs server cooperation, and even then both copies may start work.",
    "tags": [
      "tail-latency",
      "staff",
      "inline"
    ]
  },
  {
    "id": "tail-latency-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Fleet p99 from ten servers",
    "section": "Measuring the tail correctly",
    "prompt": "Ten servers each report their own p99 latency. How should you compute the p99 for the whole fleet?",
    "options": [
      "Take the average of the ten p99 values",
      "Use the largest of the ten p99 values",
      "Take the median of the ten p99 values",
      "Merge the latency histograms, then read off p99"
    ],
    "answer": 3,
    "explanation": "Percentiles cannot be averaged. You need the combined distribution, which is why the lesson records latencies in mergeable histograms such as HdrHistogram. The largest p99 is tempting as a safe upper bound, but it is not the fleet's p99 and can be far from it when servers carry different amounts of traffic.",
    "tags": [
      "tail-latency",
      "recall",
      "inline"
    ]
  },
  {
    "id": "tail-latency-n1",
    "topic": "tail-latency",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Fan-Out Tail Latency Probability",
    "scenario": "An aggregator service fans out each search request in parallel to 100 leaf shards and waits for all 100 shards to respond. Each individual leaf shard has an independent 1% probability (p99) of taking longer than 50 ms.",
    "prompt": "Using the approximation (1 - 0.99^100 ≈ 0.63), what percentage of aggregated user requests will experience latency > 50 ms?",
    "question": "Using the approximation (1 - 0.99^100 ≈ 0.63), what percentage of aggregated user requests will experience latency > 50 ms?",
    "unit": "%",
    "answer": 63,
    "tolerance": 0.25,
    "hint": "P(at least one shard > 50 ms) = 1 - P(all 100 shards <= 50 ms) = 1 - (0.99)^100 ≈ 63%.",
    "explanation": "For all 100 shards to finish within 50 ms, every single shard must beat its p99 threshold: 0.99^100 ≈ 0.366. Thus 1 - 0.366 = 63.4% of user requests suffer the >50 ms tail latency of the slowest leaf shard.",
    "tags": [
      "tail-latency",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "tail-latency-t1",
    "topic": "tail-latency",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Hedged Requests vs Backend Load Amplification",
    "scenario": "Your 100-shard search fan-out suffers 63% p99 tail amplification due to occasional GC pauses on individual leaf replicas. Each shard has 3 replicas currently running at 35% CPU utilization.",
    "prompt": "Which tail-latency mitigation should you deploy, and what is the primary engineering justification?",
    "question": "Which tail-latency mitigation should you deploy, and what is the primary engineering justification?",
    "options": [
      "Send duplicate requests to all 3 replicas for 100% of queries immediately at t = 0 ms",
      "Issue a hedged request to a second replica only when a shard call exceeds its p95 latency threshold, with cross-replica cancellation",
      "Increase the client timeout from 100 ms to 10 seconds and disable retries"
    ],
    "correctOption": 1,
    "reasons": [
      "Tripling cluster QPS at t = 0 ms is free and never causes queueing delay",
      "Waiting until the p95 threshold limits extra cluster load to at most ~5% while routing around GC-stalled replicas",
      "Longer timeouts reduce p99 response latency for end users"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "From Google's 'The Tail at Scale': how do you cut p99 latency while adding <= 5% extra backend work?",
    "explanation": "Hedging after the p95 delay threshold means 95% of shard requests never trigger a second call, bounding extra load to ~5% while eliminating single-replica GC stalls from the fan-out tail.",
    "tags": [
      "tail-latency",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["load-shedding"] = [
  {
    "id": "load-shedding-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Overload without shedding",
    "section": "Under the Hood: Graceful Degradation Under Overload",
    "prompt": "A cluster sized for 100,000 QPS receives 150,000 QPS and does no load shedding. What happens to goodput (successful, on-time responses)?",
    "options": [
      "It stays near 100,000, and only the excess 50,000 time out",
      "It stays near 150,000, with higher latency for every request",
      "It falls to about 66,000, as capacity is shared across all requests",
      "It can collapse toward zero, as queueing delays pass client timeouts"
    ],
    "answer": 3,
    "explanation": "Without shedding, every request waits in the same growing queue, so nearly all of them finish after their client has given up, and the server stays fully busy doing useless work. \"Only the excess fails\" is the tempting answer, and it is exactly the result that load shedding exists to make true.",
    "tags": [
      "load-shedding",
      "recall",
      "inline"
    ]
  },
  {
    "id": "load-shedding-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Capacity via Little's law",
    "section": "Worked example: goodput under overload",
    "prompt": "A service has 200 worker slots, and each request needs 40 ms of work. What is its capacity, and about how many requests should be in flight at that rate for a 40 ms latency target?",
    "options": [
      "5,000 per second, with about 200 in flight",
      "5,000 per second, with about 5,000 in flight",
      "8,000 per second, with about 200 in flight",
      "200 per second, with about 40 in flight"
    ],
    "answer": 0,
    "explanation": "Capacity is 200 divided by 0.04 s, which is 5,000 per second, and Little's law gives 5,000 times 0.04 s, which is 200 requests in flight. Allowing thousands in flight is the tempting mistake: the extra requests only wait in a queue, so a concurrency limit near 200 is what protects latency.",
    "tags": [
      "load-shedding",
      "apply",
      "inline"
    ]
  },
  {
    "id": "load-shedding-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Shedding the health checks",
    "section": "Failure modes",
    "prompt": "During overload, a node's load shedder rejects everything above its limit, including the load balancer's health checks. What happens next?",
    "options": [
      "The balancer treats the rejections as a sign of busy nodes and backs off",
      "The node is marked unhealthy, so its traffic moves to the survivors and overloads them",
      "Nothing changes, because health checks go through a separate network path",
      "The node is ejected, but the lower total traffic lets the cluster recover"
    ],
    "answer": 1,
    "explanation": "Failed health checks take the node out of rotation, which pushes its share onto the remaining nodes, which then shed and fail their own checks in turn. That is why health checks must be exempt from shedding. Expecting the cluster to recover is tempting, but removing a node reduces capacity, not the amount of incoming traffic.",
    "tags": [
      "load-shedding",
      "staff",
      "inline"
    ]
  },
  {
    "id": "load-shedding-n1",
    "topic": "load-shedding",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Priority Load Shedding Threshold",
    "scenario": "Your e-commerce cluster has a maximum safe capacity of 10,000 req/s before queueing collapses goodput. During a flash sale, incoming traffic surges to 16,000 req/s, composed of 3,000 req/s of Priority-0 (Checkout/Payment), 5,000 req/s of Priority-1 (Product Details), and 8,000 req/s of Priority-2 (Recommendations/Scrapers).",
    "prompt": "If the load shedder admits 100% of Priority-0 and Priority-1 traffic first, what percentage (0 to 100) of Priority-2 traffic must be shed (rejected with HTTP 503/fallback) to hold total admitted load at exactly 10,000 req/s?",
    "question": "If the load shedder admits 100% of Priority-0 and Priority-1 traffic first, what percentage (0 to 100) of Priority-2 traffic must be shed (rejected with HTTP 503/fallback) to hold total admitted load at exactly 10,000 req/s?",
    "unit": "%",
    "answer": 75,
    "tolerance": 0.2,
    "hint": "P0 + P1 = 3,000 + 5,000 = 8,000 req/s. Remaining capacity for P2 = 10,000 - 8,000 = 2,000 req/s out of 8,000 req/s (so 6,000 of 8,000 must be shed).",
    "explanation": "Admitting all P0 (3,000 req/s) and P1 (5,000 req/s) consumes 8,000 req/s of the 10,000 req/s budget, leaving 2,000 req/s for P2. Out of 8,000 req/s of P2 traffic, 6,000 req/s must be shed: 6,000 / 8,000 = 75% shed rate, preserving 100% of revenue-critical checkouts and product views.",
    "tags": [
      "load-shedding",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "load-shedding-t1",
    "topic": "load-shedding",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Priority-Aware CoDel/Concurrency Load Shedding vs FIFO Queueing Until Timeout",
    "scenario": "When a downstream database slows down by 3x, your API servers queue incoming requests in FIFO order. Within seconds, every request sits in the queue for 2.1 seconds before being processed, but the upstream caller has a 2.0-second timeout—so your servers run at 100% CPU doing work whose responses are discarded by every caller (0% goodput).",
    "prompt": "Which admission control and shedding strategy should you implement, and what is the primary justification?",
    "question": "Which admission control and shedding strategy should you implement, and what is the primary justification?",
    "options": [
      "Increase the FIFO queue length to 100,000 requests so no packet is ever dropped at ingress",
      "Enforce adaptive concurrency limits (e.g., Little's Law / Vegas / CoDel queue sojourn time) combined with request deadline propagation and priority tiers, shedding low-priority or already-expired requests in <1 ms",
      "Crash and restart the API server process whenever CPU utilization crosses 90%"
    ],
    "correctOption": 1,
    "reasons": [
      "Deep FIFO queues reduce queueing delay during sustained overload",
      "Rejecting excess low-priority requests early and dropping requests whose remaining deadline is insufficient prevents wasted CPU on timed-out work and preserves near-100% goodput for high-priority traffic",
      "Crashing servers during a traffic spike increases cluster capacity"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why spend 50 ms of database and CPU work on a request that already waited 2,000 ms in your queue when the client hung up at 1,900 ms?",
    "explanation": "Unbounded FIFO queueing under overload drives goodput to zero because every request ages past the caller's timeout before execution starts. Priority-aware admission control with adaptive concurrency limits (and LIFO/CoDel queue discipline plus propagated deadlines) sheds excess load cheaply at the door so admitted requests finish well within their SLA.",
    "tags": [
      "load-shedding",
      "tradeoff",
      "staff"
    ]
  }
];
