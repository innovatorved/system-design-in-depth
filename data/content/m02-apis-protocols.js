window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-apis-services"] = {
  "api-design-contracts": {
    "title": "API design contracts",
    "video": {
      "youtubeId": "DQ57zYedMdQ",
      "title": "API Design in System Design Interviews w/ Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The API as an Immutable Network Contract</h2>\n      <p>An API contract is not merely a collection of JSON payloads and HTTP routes; it is an immutable interface boundary between independent deployment lifecycles. In distributed systems, breaking changes deployed to an API immediately cascade into client crashes, silent data corruption, or catastrophic transaction drops.</p>\n\n      <h2>The Life of an API Contract Across Lifecycles</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    ClientApp[\"Mobile / Browser Client (v1.2.0)\"] -->|\"POST /v1/orders (Strict Schema)\"| APIGateway[\"API Gateway & Validation Filter\"]\n    APIGateway -->|\"Validate Payload against JSONSchema / Protobuf\"| SchemaCheck{\"Valid Schema?\"}\n    SchemaCheck -->|\"No\"| Err400[\"HTTP 400 Bad Request (RFC 7807 Problem Details)\"]\n    SchemaCheck -->|\"Yes\"| Route[\"Route to Service (gRPC / HTTP2)\"]\n    Route --> Service[\"Order Processing Engine\"]\n    Service -->|\"Idempotent Execution with Lock\"| DB[(\"Orders DB\")]\n      </div>\n\n      <h2>Core Elements of Production-Grade API Contracts</h2>\n      <h3>1. Idempotency Key Semantics</h3>\n      <p>Network timeouts leave callers in an ambiguous state: did the server crash before executing the mutation, or was the response lost in flight? Mutating endpoints (<code>POST</code>, <code>PATCH</code>) must support an <code>Idempotency-Key</code> header. The server records the key alongside the HTTP response within a single atomic database transaction. Retried requests with the identical key bypass business logic and replay the cached HTTP response directly.</p>\n\n      <h3>2. Backward Compatibility & Field Deprecation</h3>\n      <p>Never rename or change the type of an existing field. Apply the <strong>Tolerant Reader Pattern</strong>: producers should be conservative in what they send, and consumers should be liberal in what they accept. New fields must be optional. Deprecated fields must remain populated through formal sunset timelines communicated via <code>Sunset: &lt;date&gt;</code> (RFC 8594) headers.</p>\n\n      <h3>3. Standardized Error Handling (RFC 7807 Problem Details)</h3>\n      <p>APIs should return uniform machine-readable error responses containing a <code>type</code> URI, human-readable <code>title</code>, HTTP <code>status</code>, granular <code>detail</code>, and a correlation <code>instance</code> trace ID to eliminate ambiguous ad-hoc client parsing.</p>\n    </div>",
    "keyTakeaways": [
      "API contracts are immutable boundaries; changing an existing field breaks older mobile and third-party clients.",
      "Idempotency keys allow safe client retries by caching transaction outcomes and replaying responses.",
      "Use RFC 7807 Problem Details and RFC 8594 Sunset headers for predictable error handling and deprecations."
    ],
    "furtherReading": [
      {
        "title": "Stripe: Designing Robust and Predictable APIs with Idempotency",
        "url": "https://stripe.com/blog/idempotency"
      },
      {
        "title": "RFC 7807: Problem Details for HTTP APIs",
        "url": "https://datatracker.ietf.org/doc/html/rfc7807"
      }
    ]
  },
  "service-to-service-communication": {
    "title": "Service-to-service communication",
    "video": {
      "youtubeId": "ksRCq0BJef8",
      "title": "Creating event-driven microservices: the why, how and what by Andrew Schofield",
      "channel": "Devoxx"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Synchronous RPC vs. Asynchronous Messaging</h2>\n      <p>When monolithic applications decompose into distributed services, communication transitions from in-memory function pointers (sub-microsecond) to network sockets subject to non-deterministic latency, packet loss, and connection pool exhaustion. Choosing between synchronous RPC and asynchronous messaging fundamentally dictates system resilience.</p>\n\n      <h2>Communication Topologies Compared</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph SyncTopology [\"1. Synchronous RPC (Tight Temporal Coupling)\"]\n      S1[\"Order Service\"] -->|\"HTTP / gRPC (Blocking)\"| S2[\"Inventory Service\"]\n      S2 -->|\"Blocking Call\"| S3[\"Payment Gateway\"]\n      Note1[\"Thread held open. Failure at S3 cascades upstream, exhausting thread pools.\"]\n    end\n\n    subgraph AsyncTopology [\"2. Asynchronous Event-Driven (Temporal Decoupling)\"]\n      O1[\"Order Service\"] -->|\"Publish 'order.created'\"| Bus[(\"Durable Event Log: Kafka\")]\n      Bus -->|\"Pull batch\"| I1[\"Inventory Worker\"]\n      Bus -->|\"Pull batch\"| P1[\"Payment Worker\"]\n      Note2[\"Zero thread blocking. Downstream slowdowns absorb into queue lag without dropping requests.\"]\n    end\n      </div>\n\n      <h2>Under the Hood: Production Communication Invariants</h2>\n      <h3>1. Distributed Context & Deadline Propagation</h3>\n      <p>Every inbound user request must receive a unique W3C Trace Context (<code>traceparent</code>) and an absolute client deadline (e.g., <code>grpc-timeout: 500m</code>). If an upstream client specifies a 500ms timeout, and service A spends 450ms processing, downstream calls from service A to service B must only receive the remaining 50ms deadline. Continuing to execute downstream work after an upstream caller has already disconnected wastes CPU and database connections.</p>\n\n      <h3>2. Bounded Connection Pools and Keep-Alive</h3>\n      <p>Creating TCP/TLS handshakes for every inter-service call introduces substantial latency overhead. Production services maintain persistent connection pools with HTTP/2 multiplexing or TCP keep-alive, strictly bounding max connections to avoid overwhelming downstream servers with connection spikes.</p>\n    </div>",
    "keyTakeaways": [
      "Synchronous RPC creates tight temporal coupling where downstream latency cascades into upstream thread exhaustion.",
      "Asynchronous messaging via durable brokers decouples service availability and absorbs traffic spikes into queue lag.",
      "Propagate distributed trace context and deadlines across every network hop to avoid executing dead requests."
    ],
    "furtherReading": [
      {
        "title": "Google SRE Book: Addressing Cascading Failures",
        "url": "https://sre.google/sre-book/addressing-cascading-failures/"
      },
      {
        "title": "W3C Trace Context Specification",
        "url": "https://www.w3.org/TR/trace-context/"
      }
    ]
  },
  "http-rest-grpc": {
    "title": "HTTP, REST, and gRPC",
    "video": {
      "youtubeId": "DQ57zYedMdQ",
      "title": "API Design in System Design Interviews w/ Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Serialization Formats & Wire Protocols</h2>\n      <p>Selecting between REST (typically JSON over HTTP/1.1 or HTTP/2) and gRPC (Protocol Buffers over HTTP/2) is fundamentally a trade-off between human readability/client reach and binary serialization throughput/CPU efficiency.</p>\n\n      <h2>Wire Format Comparison: JSON vs Protocol Buffers</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph JSONWire [\"Textual JSON Payload (High CPU & Wire Overhead)\"]\n      J1['{\"user_id\": 98412, \"email\": \"alice@corp.com\", \"active\": true}']\n      JNote[\"Field names repeated on wire; text parsing requires memory allocation and string decoding.\"]\n    end\n\n    subgraph ProtoWire [\"Binary Protocol Buffers (Zero-Copy Serialization)\"]\n      P1[\"[08 8C 80 06 12 0E 61 6C 69 63 65...]\"]\n      PNote[\"Field tags mapped to integer IDs (varints). 5x-10x smaller payload, zero allocation parsing.\"]\n    end\n      </div>\n\n      <h2>Protocol Mechanics: HTTP/1.1 vs HTTP/2 in gRPC</h2>\n      <ul>\n        <li><strong>Head-of-Line Blocking:</strong> In HTTP/1.1, a single TCP connection processes one request-response pair at a time. Concurrency requires opening multiple TCP sockets (typically 6 per browser host). gRPC runs over HTTP/2, where binary frames are multiplexed concurrently across a single persistent TCP connection.</li>\n        <li><strong>Schema Enforcement:</strong> REST over JSON relies on optional runtime validators (JSONSchema). gRPC uses strictly typed <code>.proto</code> files compiled down to native language structs at build time, eliminating runtime type mismatch bugs.</li>\n        <li><strong>Bidirectional Streaming:</strong> gRPC natively supports client streaming, server streaming, and bidirectional streaming over HTTP/2, making it ideal for live sensor telemetry and real-time backend synchronization.</li>\n      </ul>\n\n      <h2>When to Use Which?</h2>\n      <table>\n        <thead>\n          <tr><th>Feature</th><th>REST (JSON over HTTP/1.1 / HTTP/2)</th><th>gRPC (Protobuf over HTTP/2)</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Payload Encoding</strong></td><td>Human-readable ASCII text / UTF-8</td><td>Compact, binary-encoded varints</td></tr>\n          <tr><td><strong>Parsing Speed</strong></td><td>Moderate to slow (string scanning & memory allocations)</td><td>Extremely fast (direct memory unpacking)</td></tr>\n          <tr><td><strong>Browser Support</strong></td><td>Native across 100% of browsers and devices</td><td>Requires gRPC-Web proxy translation layer</td></tr>\n          <tr><td><strong>Ideal Use Case</strong></td><td>Public APIs, mobile apps, third-party integrations</td><td>High-throughput East-West internal microservices</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "gRPC uses Protocol Buffers to achieve 5x-10x smaller wire payloads and significantly lower CPU serialization overhead than JSON.",
      "HTTP/2 multiplexing allows gRPC to stream multiple requests concurrently over a single TCP connection.",
      "Use REST for public browser-facing APIs and third-party reach; use gRPC for high-performance internal microservices."
    ],
    "furtherReading": [
      {
        "title": "gRPC Official Documentation: Core Concepts",
        "url": "https://grpc.io/docs/what-is-grpc/core-concepts/"
      },
      {
        "title": "Martin Kleppmann: Protocol Buffers vs JSON Benchmarks",
        "url": "https://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html"
      }
    ]
  },
  "tcp-vs-udp": {
    "title": "TCP vs UDP",
    "video": {
      "youtubeId": "P6SZLcGE4us",
      "title": "Top 8 Most Popular Network Protocols Explained",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Transport Layer Primitives</h2>\n      <p>All internet communication sits on top of the Internet Protocol (IP), which provides best-effort, unordered packet delivery. The choice between <strong>TCP (Transmission Control Protocol)</strong> and <strong>UDP (User Datagram Protocol)</strong> represents the fundamental trade-off between guaranteed reliability and minimal transmission latency.</p>\n\n      <h2>TCP 3-Way Handshake vs UDP Fire-and-Forget</h2>\n      <div class=\"mermaid\">\nsequenceDiagram\n    participant Client\n    participant Server\n\n    Note over Client,Server: TCP Connection Establishment (1 RTT Handshake)\n    Client->>Server: SYN (seq = x)\n    Server->>Client: SYN-ACK (seq = y, ack = x + 1)\n    Client->>Server: ACK (ack = y + 1)\n    Client->>Server: Data Transmission (Guaranteed Ordered Stream)\n\n    Note over Client,Server: UDP Data Transmission (0 RTT Handshake)\n    Client->>Server: Datagram 1 (Direct Send, No Handshake, No ACK)\n    Client->>Server: Datagram 2 (May be dropped or reordered)\n      </div>\n\n      <h2>Detailed Protocol Mechanics</h2>\n      <h3>1. TCP Reliability & Head-of-Line (HoL) Blocking</h3>\n      <p>TCP abstracts network packets into a continuous, reliable byte stream. To achieve this, it implements sequence numbering, acknowledgments (ACKs), automatic retransmission (ARQ), and dynamic sliding window flow control. However, if packet #2 is dropped in flight, the receiver's operating system kernel buffers packets #3, #4, and #5 in memory without delivering them to the application until packet #2 is retransmitted. This is <strong>TCP Head-of-Line Blocking</strong>.</p>\n\n      <h3>2. UDP: Low-Overhead Datagrams</h3>\n      <p>UDP adds only an 8-byte header (Source Port, Destination Port, Length, Checksum) on top of IP. There is no connection state, no handshake, no ACK, and no congestion backoff. If a packet drops, the application never pauses. This makes UDP the foundation for real-time multiplayer gaming, VoIP (WebRTC), DNS queries, and video streaming.</p>\n\n      <h3>3. The Modern Synthesis: QUIC (HTTP/3 over UDP)</h3>\n      <p>HTTP/3 abandons kernel TCP entirely. It runs over UDP in user space via the <strong>QUIC protocol</strong>. QUIC implements multiple independent byte streams inside a single UDP connection: dropping a packet on stream A stalls stream A, while streams B, C, and D continue rendering without head-of-line blocking.</p>\n    </div>",
    "keyTakeaways": [
      "TCP guarantees ordered, reliable byte stream delivery at the cost of connection handshakes and Head-of-Line blocking.",
      "UDP is a lightweight datagram protocol with 0-RTT connection overhead, ideal for real-time audio/video and gaming.",
      "HTTP/3 uses QUIC over UDP in user space to eliminate TCP head-of-line blocking across multiplexed streams."
    ],
    "furtherReading": [
      {
        "title": "Cloudflare: What is HTTP/3 and QUIC?",
        "url": "https://www.cloudflare.com/learning/performance/what-is-http3/"
      },
      {
        "title": "RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport",
        "url": "https://datatracker.ietf.org/doc/html/rfc9000"
      }
    ]
  },
  "api-gateway-vs-load-balancer": {
    "title": "API gateway vs load balancer",
    "video": {
      "youtubeId": "4NB0NDtOwIQ",
      "title": "Proxy vs Reverse Proxy (Real-world Examples)",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: L4/L7 Traffic Management Primitives</h2>\n      <p>Engineers often conflate Load Balancers and API Gateways because modern proxies (like Envoy, Nginx, and Traefik) can perform both roles. However, in enterprise architecture, they operate at distinct layers of the OSI stack with different performance profiles and responsibilities.</p>\n\n      <h2>The Multi-Layer Ingress Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client Traffic\"] --> L4LB[\"Layer 4 Load Balancer (AWS NLB / Maglev: TCP/UDP Wire Speed)\"]\n    L4LB --> L7GW[\"Layer 7 API Gateway (Envoy / Kong: HTTP Parsing)\"]\n    \n    subgraph GatewayFunctions [\"API Gateway Cross-Cutting Concerns\"]\n      L7GW --> Auth[\"JWT Auth & OAuth2 Verification\"]\n      L7GW --> RateLimit[\"Distributed Rate Limiter (Redis Token Bucket)\"]\n      L7GW --> Transform[\"Payload Transformation & Header Injection\"]\n      L7GW --> Routing[\"Path-Based Routing (/v1/users -> User Service)\"]\n    end\n    \n    GatewayFunctions --> S1[\"User Microservice\"]\n    GatewayFunctions --> S2[\"Order Microservice\"]\n    GatewayFunctions --> S3[\"Payment Microservice\"]\n      </div>\n\n      <h2>Comparison: Load Balancer vs API Gateway</h2>\n      <table>\n        <thead>\n          <tr><th>Dimension</th><th>Layer 4 / 7 Load Balancer (AWS NLB/ALB)</th><th>API Gateway (Envoy, Kong, Zuul)</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>OSI Layer</strong></td><td>Layer 4 (TCP/UDP) or basic Layer 7 (HTTP)</td><td>Layer 7 (Application Layer)</td></tr>\n          <tr><td><strong>Primary Goal</strong></td><td>Distribute raw network traffic evenly across servers</td><td>Provide unified business API orchestration & security</td></tr>\n          <tr><td><strong>Cross-Cutting Features</strong></td><td>Health checks, TLS termination, round-robin</td><td>JWT validation, rate limiting, request transformation, monetization</td></tr>\n          <tr><td><strong>Throughput & Latency</strong></td><td>Extremely high throughput, sub-millisecond overhead</td><td>Lower throughput; CPU bound by SSL + JSON/JWT parsing</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "Load balancers focus on traffic distribution, connection routing, and high-throughput health checking.",
      "API gateways handle application-level cross-cutting concerns: authentication, token buckets, and path routing.",
      "High-scale architectures place high-speed L4 load balancers in front of distributed L7 API gateway clusters."
    ],
    "furtherReading": [
      {
        "title": "Envoy Proxy Architecture Guide",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview"
      }
    ]
  },
  "load-balancers": {
    "title": "Load balancers",
    "video": {
      "youtubeId": "JJ_T2aDOta0",
      "title": "Load Balancer in System Design Interviews | L4 vs L7 Explained + Load Balancing Algorithms",
      "channel": "Shubh Patel"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Load Balancing Algorithms & Health Checks</h2>\n      <p>A load balancer sits between clients and backend server pools, ensuring that no individual node becomes a bottleneck while masking node failures dynamically. How traffic is balanced depends on the mathematical algorithm employed.</p>\n\n      <h2>Core Load Balancing Algorithms</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Traffic[\"Inbound Traffic Pool\"] --> Alg{\"Balancing Algorithm\"}\n    Alg -->|\"Round Robin / Weighted\"| RR[\"Predictable sequential distribution across uniform hardware\"]\n    Alg -->|\"Least Connections\"| LC[\"Routes to node with lowest active TCP/HTTP concurrency\"]\n    Alg -->|\"Consistent Hashing\"| CH[\"Maps user_id to specific cache node; minimal reshuffle on scaling\"]\n    Alg -->|\"Peak EWMA (Power of Two Choices)\"| PEWMA[\"Evaluates 2 random nodes; picks lower exponential latency\"]\n      </div>\n\n      <h2>Under the Hood: Algorithm Deep Dive</h2>\n      <h3>1. Round Robin & Weighted Round Robin</h3>\n      <p>Requests are distributed in a circular sequence: node $0, 1, 2, \\dots, N-1$. While simple ($O(1)$ selection via atomic pointer increment), it fails when request processing times vary widely: long-running batch requests can stack up on a single node while fast queries leave other nodes idle. Weighted Round Robin assigns higher quotas to machines with higher core/memory specs.</p>\n\n      <h3>2. Least Connections</h3>\n      <p>Maintains an atomic counter of active in-flight requests per server. New requests are dispatched to the server with the lowest current load. Essential for long-lived connections such as WebSockets, database connection pools, or video streaming sessions.</p>\n\n      <h3>3. The Power of Two Random Choices (P2C) with EWMA</h3>\n      <p>Pioneered by Twitter Finagle and modern Envoy proxies. Querying all nodes for their load creates lock contention. Instead, the load balancer picks <strong>two random nodes</strong> and routes to whichever has the lower Exponentially Weighted Moving Average (EWMA) latency. Mathematically, P2C eliminates hot spots and achieves near-optimal load distribution with $O(1)$ computation.</p>\n    </div>",
    "keyTakeaways": [
      "Round Robin is simple but vulnerable to load skew when request execution times vary.",
      "Least Connections is ideal for persistent stateful connections like WebSockets.",
      "The Power of Two Random Choices (P2C) with EWMA latency delivers optimal load balance without central lock bottlenecks."
    ],
    "furtherReading": [
      {
        "title": "Michael Mitzenmacher: The Power of Two Random Choices in Randomized Load Balancing",
        "url": "https://www.eecs.harvard.edu/~michaelm/postscripts/tpds2001.pdf"
      }
    ]
  },
  "consistent-hashing-load-balancing": {
    "title": "Consistent-hashing load balancing",
    "video": {
      "youtubeId": "zaRkONvyGr8",
      "title": "What is CONSISTENT HASHING and Where is it used?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Sticky Routing & Cache Locality</h2>\n      <p>Traditional load balancing sends requests to any available server. For stateful caching tiers (e.g., in-process memory, local SSD caches), routing request $K$ randomly drops cache hit rates to $\frac{1}{N}$. Simple modulo hashing (<code>hash(key) % N</code>) achieves sticky routing, but adding or removing a single server shifts nearly $100\\%$ of keys, triggering a devastating cache stampede. <strong>Consistent Hashing</strong> solves this by ensuring that scaling moves only $\frac{K}{N}$ keys.</p>\n\n      <h2>Consistent Hashing with Virtual Nodes</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph HashRing [\"Circular Hash Ring (0 to 2^32 - 1)\"]\n      V1[\"Server A (vnode 1)\"]\n      K1[\"Key 'user:101' -> Routed to Server A\"]\n      V2[\"Server B (vnode 1)\"]\n      K2[\"Key 'user:102' -> Routed to Server B\"]\n      V3[\"Server A (vnode 2)\"]\n    end\n\n    K1 -.->|\"Clockwise Seek\"| V1\n    K2 -.->|\"Clockwise Seek\"| V2\n      </div>\n\n      <h2>Under the Hood: Bounded-Load Consistent Hashing</h2>\n      <p>Standard consistent hashing can still create hot spots if a single partition key goes viral (e.g., a breaking news post). Google Research introduced <strong>Consistent Hashing with Bounded Loads</strong> (used in Vimeo and HAProxy):</p>\n      <ul>\n        <li>Each server is assigned a maximum capacity threshold: $1 + \\epsilon$ times the average cluster load (e.g., $1.25\times$).</li>\n        <li>When a request hashes to server $S$, the load balancer checks if $S$ is currently at or above its load ceiling.</li>\n        <li>If overloaded, the load balancer skips $S$ and walks clockwise along the ring to the next available virtual node, strictly capping load while preserving maximum possible cache affinity.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Consistent hashing maps keys and servers onto a circular 2^32 integer ring, relocating only K/N keys upon scaling.",
      "Virtual nodes (100-250 per physical host) eliminate non-uniform hash distribution skew.",
      "Google's Bounded-Load algorithm prevents hot-key server crashes by overflowing traffic to the next ring node."
    ],
    "furtherReading": [
      {
        "title": "Google Research: Consistent Hashing with Bounded Loads",
        "url": "https://research.google/pubs/pub46633/"
      }
    ]
  },
  "event-contracts": {
    "title": "Event contracts",
    "video": {
      "youtubeId": "-RDyEFvnTXI",
      "title": "Apache Kafka Fundamentals You Should Know",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Asynchronous Schema Evolution</h2>\n      <p>In synchronous APIs, if a client sends an invalid field, the server returns an immediate HTTP 400. In asynchronous event-driven architectures, once an event is published to Kafka or RabbitMQ, it is persisted to disk and consumed by dozens of downstream microservices hours or days later. A broken event schema permanently poisons consumer worker queues. <strong>Event Contracts</strong> formalize asynchronous payloads.</p>\n\n      <h2>Schema Registry Enforcement Flow</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Producer[\"Producer: OrderService\"] -->|\"1. Validate against Avro/Protobuf Schema\"| Registry[(\"Schema Registry\")]\n    Registry -->|\"2. Return Schema ID (4 bytes)\"| Producer\n    Producer -->|\"3. Prepend Schema ID + Payload to Kafka\"| Kafka[(\"Kafka Broker\")]\n    Kafka -->|\"4. Consume Event\"| Consumer[\"Consumer: BillingService\"]\n    Consumer -->|\"5. Fetch Schema by ID\"| Registry\n      </div>\n\n      <h2>Schema Evolution Compatibility Modes</h2>\n      <ul>\n        <li><strong>Backward Compatibility (Default):</strong> Newer schema code can read events written with older schemas. Consumers must be upgraded before producers. New fields must have default values.</li>\n        <li><strong>Forward Compatibility:</strong> Older schema code can read events written with newer schemas. Producers must be upgraded before consumers. Deleted fields must have had defaults.</li>\n        <li><strong>Full Compatibility:</strong> Schemas are both backward and forward compatible. Old and new producers and consumers can operate concurrently in any upgrade order without downtime.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Asynchronous event schemas must be strictly governed by a Schema Registry to avoid poisoning consumer queues.",
      "Use Avro or Protocol Buffers to serialize schemas with compact integer IDs prepended to wire payloads.",
      "Full Compatibility guarantees that producers and consumers can be deployed independently in any order."
    ],
    "furtherReading": [
      {
        "title": "Confluent: Schema Evolution and Compatibility Rules",
        "url": "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html"
      }
    ]
  },
  "retries-timeouts-idempotency": {
    "title": "Retries, timeouts, and idempotency",
    "video": {
      "youtubeId": "olfaBgJrUBI",
      "title": "Design a Payment System - System Design Interview",
      "channel": "Code with Lucian"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Retry Storm Catastrophe</h2>\n      <p>When a downstream service experiences high load and begins timing out, naive client retry loops with linear delays unleash an exponential flood of requests called a <strong>Retry Storm</strong>. Ten thousand clients each retrying three times turn 10,000 requests into 40,000 requests, driving downstream CPU from $90\\%$ into permanent catastrophic collapse.</p>\n\n      <h2>The Production Retry Pattern: Exponential Backoff with Full Jitter</h2>\n      <p>To break up synchronized retry waves, Amazon AWS architecture popularized <strong>Full Jitter Exponential Backoff</strong>:</p>\n      <pre><code>// Production-Grade Exponential Backoff with Full Jitter\nfunction calculateBackoff(attempt, baseDelayMs = 100, maxDelayMs = 5000) {\n  const exponentialLimit = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));\n  // Uniform random between 0 and exponentialLimit\n  return Math.floor(Math.random() * exponentialLimit);\n}\n      </code></pre>\n\n      <h2>Resilience Guidelines</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Req[\"Request Fails / Times Out\"] --> CheckRetry{\"Is Error Retryable?\"}\n    CheckRetry -->|\"400 Bad Request / 401 Unauthorized\"| NoRetry[\"Fail Immediately (Non-Retryable)\"]\n    CheckRetry -->|\"429 Rate Limited / 503 Unavailable / Network Drop\"| CheckBudget{\"Retry Budget Available?\"}\n    \n    CheckBudget -->|\"Budget Exhausted (> 10% traffic)\"| Drop[\"Fast Fail: Protect Downstream\"]\n    CheckBudget -->|\"Budget OK\"| Backoff[\"Sleep: Full Jitter Exponential Delay\"]\n    Backoff --> Reissue[\"Reissue with Same Idempotency Key\"]\n      </div>\n\n      <h2>Under the Hood: Retry Budgets & Timeout Tiers</h2>\n      <ul>\n        <li><strong>Retry Budgets:</strong> A client service should dedicate at most <strong>10% of its total outbound traffic</strong> to retries. If the downstream error rate exceeds 10%, stop retrying immediately and trip a circuit breaker.</li>\n        <li><strong>Timeout Splitting:</strong> Always set distinct connection timeouts (e.g., 200ms to establish TCP/TLS handshake) and socket read timeouts (e.g., 800ms for backend processing) to avoid holding sockets indefinitely.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Naive retries cause retry storms that prevent recovering services from ever coming back online.",
      "Full Jitter Exponential Backoff randomizes client retry delays across a uniform interval, flattening traffic spikes.",
      "Enforce retry budgets (max 10% retries) and distinct connection vs read timeouts to protect network resources."
    ],
    "furtherReading": [
      {
        "title": "AWS Architecture Blog: Exponential Backoff And Jitter",
        "url": "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"
      }
    ]
  },
  "batching": {
    "title": "Batching",
    "video": {
      "youtubeId": "-RDyEFvnTXI",
      "title": "Apache Kafka Fundamentals You Should Know",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Amortizing System Call and Network Overhead</h2>\n      <p>Sending 10,000 independent network calls each containing a 100-byte payload incurs astronomical overhead: 10,000 TCP packet headers (40 bytes each), 10,000 kernel context switches (<code>sys_sendto</code>), and 10,000 round-trip latency delays. <strong>Batching</strong> coalesces multiple operations into a single network packet or disk write, trading minor latency for orders of magnitude higher throughput.</p>\n\n      <h2>Batching Trade-Off: Size vs. Latency Timer</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    EventStream[\"Incoming Events: E1, E2, E3, E4...\"] --> Buffer[\"In-Memory Ring Buffer\"]\n    Buffer --> Trigger{\"Flush Trigger Condition\"}\n    Trigger -->|\"Condition 1: max_batch_size reached (e.g. 64KB)\"| Flush[\"Flush Batch Atomically to Network/Disk\"]\n    Trigger -->|\"Condition 2: max_wait_time elapsed (e.g. 10ms)\"| Flush\n      </div>\n\n      <h2>Under the Hood: Production Batching Invariants</h2>\n      <h3>1. Kafka Producer Batching (`linger.ms` and `batch.size`)</h3>\n      <p>Apache Kafka achieves millions of messages per second on commodity hardware primarily through batching. The producer library holds records in a memory buffer. It flushes when either <code>batch.size</code> (e.g., 16KB) is reached OR <code>linger.ms</code> (e.g., 10ms) expires. Setting <code>linger.ms = 5</code> introduces up to 5ms of artificial delay but increases throughput by over $500\\%$.</p>\n\n      <h3>2. Partial Batch Failure Semantics</h3>\n      <p>When sending a batch of 500 records to an upstream service or database (e.g., <code>INSERT ... VALUES (...)</code>), individual records may fail (e.g., duplicate key on record #42). Production batch APIs must return granular per-item statuses rather than failing the entire batch, preventing infinite redelivery loops.</p>\n    </div>",
    "keyTakeaways": [
      "Batching amortizes kernel system calls, TCP headers, and disk write overhead across hundreds of operations.",
      "Production flush engines combine maximum byte size with a time-based linger window (e.g., 10ms).",
      "Batch APIs must support partial failure semantics with granular per-record error arrays."
    ],
    "furtherReading": [
      {
        "title": "Kafka Producer Configuration: linger.ms and batch.size",
        "url": "https://kafka.apache.org/documentation/#producerconfigs"
      }
    ]
  },
  "backpressure": {
    "title": "Backpressure",
    "video": {
      "youtubeId": "ksRCq0BJef8",
      "title": "Creating event-driven microservices: the why, how and what by Andrew Schofield",
      "channel": "Devoxx"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Flow Control Across Asynchronous Boundaries</h2>\n      <p>When an upstream producer generates work faster than a downstream consumer can process it, memory must buffer the delta. If the buffer is unbounded, the consumer will eventually crash with an Out-of-Memory (OOM) error. <strong>Backpressure</strong> is the communication feedback loop that signals the producer to slow down or pause.</p>\n\n      <h2>Backpressure Feedback Loop: Pull-Based Credit Flow</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Consumer[\"Downstream Consumer (3 Workers Free)\"] -->|\"1. Grant Credit: request(3)\"| Producer[\"Upstream Producer\"]\n    Producer -->|\"2. Transmit Exactly 3 Items\"| Consumer\n    Consumer -->|\"3. Process Items & Free Memory\"| Work[\"Complete Work\"]\n    Work -->|\"4. Grant Next Credit: request(N)\"| Producer\n      </div>\n\n      <h2>Under the Hood: The Four Backpressure Defenses</h2>\n      <ul>\n        <li><strong>Push vs. Pull (Reactive Streams Specification):</strong> Push-based streams are inherently vulnerable to overwhelming consumers. Pull-based streams (such as Reactive Streams, gRPC flow control, and Kafka) invert control: consumers explicitly emit credit tokens requesting a specific number of items.</li>\n        <li><strong>TCP Window Size (Kernel Flow Control):</strong> When an application thread stops reading from a TCP socket, the OS kernel receive buffer fills. The TCP stack automatically advertises a <code>Window Size = 0</code> back to the sender, forcing the sender's kernel to pause transmitting packets.</li>\n        <li><strong>Dropping Strategies:</strong> When queues reach hard capacity, systems must execute an explicit drop policy:\n          <ul>\n            <li><strong>Tail Drop:</strong> Drop newly arriving messages (protects existing in-flight transactions).</li>\n            <li><strong>Head Drop:</strong> Drop the oldest messages in the queue (ideal for time-sensitive data like live GPS telemetry).</li>\n          </ul>\n        </li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Unbounded in-memory queues always lead to Out-of-Memory (OOM) container crashes under traffic spikes.",
      "Reactive pull-based flow control requires consumers to issue explicit credits before producers can send data.",
      "Enforce hard queue capacity limits with explicit drop strategies (Tail Drop vs Head Drop)."
    ],
    "furtherReading": [
      {
        "title": "Reactive Streams Specification",
        "url": "https://www.reactive-streams.org/"
      }
    ]
  },
  "tail-latency": {
    "title": "Tail latency",
    "video": {
      "youtubeId": "JJ_T2aDOta0",
      "title": "Load Balancer in System Design Interviews | L4 vs L7 Explained + Load Balancing Algorithms + Load Balancing Algorithms",
      "channel": "Shubh Patel"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Tyranny of the Tail: Why Averages Lie</h2>\n      <p>In distributed systems, the average response time (mean) is virtually meaningless. If a service has an average latency of $10\text{ms}$ but a $99\text{th}$ percentile (p99) latency of $2,000\text{ms}$, one out of every 100 users experiences a 2-second stall. In fan-out architectures, <strong>tail latency amplifies exponentially</strong>.</p>\n\n      <h2>Fan-Out Tail Latency Amplification</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"User Request: Load Feed\"] --> Fanout[\"API Gateway\"]\n    Fanout --> S1[\"Service 1 (p99 = 100ms)\"]\n    Fanout --> S2[\"Service 2 (p99 = 100ms)\"]\n    Fanout --> S100[\"Service 100 (p99 = 100ms)\"]\n    \n    S1 & S2 & S100 --> Merge[\"Merge Results & Return\"]\n    Note[\"If a page fans out to 100 backend services each with 99% success under 100ms, the probability of the entire page loading under 100ms is 0.99^100 = only 36.6%! 63.4% of users experience a tail latency stall!\"]\n      </div>\n\n      <h2>Mitigating Tail Latency: Jeff Dean's \"The Tail at Scale\"</h2>\n      <ul>\n        <li><strong>Hedged Requests:</strong> If a request to a backend node does not return within the 95th percentile expected latency (e.g., after 50ms), immediately send an identical request to a replica server. Whichever server replies first provides the result, and the other request is canceled. This cuts p99.9 latency by over $80\\%$ for a modest $5\\%$ increase in load.</li>\n        <li><strong>Tied Requests:</strong> Submit the request simultaneously to two server queues with mutual cancellation tokens. When one server begins execution, it notifies the other to dequeue the request.</li>\n        <li><strong>Coordinated Omission:</strong> Benchmark tools often pause while waiting for a slow request, inadvertently omitting the queueing delays experienced by real users during that stall. Accurate tail telemetry requires continuous independent arrival timers (e.g., HdrHistogram).</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Fan-out architectures amplify tail latency: querying 100 backend services with 99% fast SLA drops user fast probability to 36.6%.",
      "Hedged requests reissue redundant RPCs to replicas after p95 timeout thresholds, collapsing tail latency spikes.",
      "Measure latency using high-dynamic-range histograms (HdrHistogram) to avoid Coordinated Omission benchmarking bias."
    ],
    "furtherReading": [
      {
        "title": "Jeff Dean & Luiz Andr\u00e9 Barroso: The Tail at Scale (Google)",
        "url": "https://research.google/pubs/pub40801/"
      }
    ]
  },
  "load-shedding": {
    "title": "Load shedding",
    "video": {
      "youtubeId": "YXkOdWBwqaA",
      "title": "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Graceful Degradation Under Overload</h2>\n      <p>When demand exceeds maximum hardware capacity, a system cannot simply try to serve everyone; attempting to process 150,000 QPS on a cluster sized for 100,000 QPS pushes CPU and queueing delays past client timeouts. The system throngs in uncompleted work and crashes for <strong>all 150,000 users</strong>. <strong>Load Shedding</strong> intentionally rejects lower-priority traffic to ensure core operations complete successfully.</p>\n\n      <h2>Priority Ingress Tier with Load Shedding</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Ingress[\"Incoming Ingress Traffic (150% Capacity)\"] --> Detector{\"CPU > 85% or Queue Delay > 200ms?\"}\n    \n    Detector -->|\"No (Healthy)\"| ProcessAll[\"Process 100% of Traffic\"]\n    Detector -->|\"Yes (Overloaded)\"| PriorityRouter{\"Request Priority Class\"}\n    \n    PriorityRouter -->|\"Critical: Checkout / Write Mutations\"| Accept[\"Admit to Processing Pipeline\"]\n    PriorityRouter -->|\"Standard: Search / Product Browse\"| Degrade[\"Serve Stale Cache / Degraded View\"]\n    PriorityRouter -->|\"Low: Analytics / Background Crons / Bots\"| Drop[\"Drop with HTTP 503 Service Unavailable\"]\n      </div>\n\n      <h2>Under the Hood: Adaptive Concurrency Limits</h2>\n      <p>Static rate limits (e.g., max 10,000 requests/sec) fail because server capacity varies dynamically with garbage collection, cache hit ratios, and network latency. Netflix and Stripe implement <strong>Adaptive Concurrency Limits</strong> based on TCP Vegas and Little's Law ($L = \\lambda W$):</p>\n      <ul>\n        <li>The system continuously measures minimum round-trip time ($\text{minRTT}$) and current in-flight requests ($L$).</li>\n        <li>If observed latency increases while concurrency is climbing, queueing has begun.</li>\n        <li>The concurrency limit dynamically contracts, rejecting excess requests at the gateway boundary with <code>HTTP 503</code> before server thread pools exhaust.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Overloaded systems collapse completely unless they shed excess load early at the ingress boundary.",
      "Categorize requests into priority tiers: protect critical mutations (checkout) by dropping background traffic (analytics).",
      "Adaptive concurrency limiting dynamically adjusts capacity limits based on observed latency rather than static QPS caps."
    ],
    "furtherReading": [
      {
        "title": "Netflix Technology Blog: Performance Under Load (Adaptive Concurrency Limits)",
        "url": "https://netflixtechblog.com/performance-under-load-3e6fe9a8d5ea"
      },
      {
        "title": "Stripe Engineering: How Stripe Prevents Outages with Load Shedding",
        "url": "https://stripe.com/blog/rate-limiters"
      }
    ]
  }
};
