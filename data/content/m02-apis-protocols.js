window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-apis-services"] = {
  "api-design-contracts": {
    "title": "API design contracts",
    "video": {
      "youtubeId": "IEe-5VOv0Js",
      "title": "The principles behind great API design | Stripe Sessions 2019",
      "channel": "Stripe",
      "why": "Stripe, whose API is widely treated as the reference for evolvable public contracts, explains how they design resources, keep backward compatibility and version without breaking existing integrations.",
      "length": "30:26"
    },
    "videos": [
      {
        "youtubeId": "DQ57zYedMdQ",
        "title": "API Design in System Design Interviews w/ Meta Staff Engineer",
        "channel": "Hello Interview",
        "role": "interview",
        "why": "How to present an API contract in an interview: resources, request and response shapes, pagination, idempotency and versioning at the right level of detail.",
        "length": "28:40"
      },
      {
        "youtubeId": "aAb7hSCtvGw",
        "title": "How To Design A Good API and Why it Matters",
        "channel": "Google TechTalks",
        "role": "deep-dive",
        "why": "Joshua Bloch's classic talk on why public APIs are forever, and the principles for designing them so they can evolve.",
        "length": "1:00:19"
      }
    ],
    "intuition": "<p>An API is like the shape of an electrical socket. Once millions of plugs are made for it, you can add a USB port beside it, but you cannot move the pins. Clients you do not control, such as old mobile app versions and partners' scripts, will keep using the old shape for years.</p>\n<p><strong>Mental model:</strong> <em>a contract is everything a client can observe and rely on</em>: field names and types, status codes, error format, ordering, pagination, retry safety and timing. Additive changes are usually safe; removing, renaming or changing meaning breaks someone.</p>\n<ul>\n<li><strong>Silent meaning changes:</strong> keeping the field <code>amount</code> but switching it from dollars to cents breaks clients without any schema error.</li>\n<li><strong>Unsafe retries:</strong> a <code>POST /payments</code> that times out cannot be safely retried unless the API accepts an idempotency key.</li>\n<li><strong>Ad hoc errors:</strong> returning 200 with <code>{\"error\": ...}</code> or free-text messages forces fragile client parsing; use proper status codes and one structured error format.</li>\n<li><strong>Unbounded lists:</strong> list endpoints without pagination work in testing and fail in production.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The API as a Long-Lived Network Contract</h2>\n      <p>An API contract is not merely a collection of JSON payloads and HTTP routes; it is a long-lived interface boundary between independent deployment lifecycles. It can evolve through additive, backward-compatible changes, but existing behaviour must not break. In distributed systems, breaking changes deployed to an API immediately cascade into client crashes, silent data corruption, or catastrophic transaction drops.</p>\n\n      <h2>The Life of an API Contract Across Lifecycles</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    ClientApp[\"Mobile / Browser Client (v1.2.0)\"] -->|\"POST /v1/orders (Strict Schema)\"| APIGateway[\"API Gateway & Validation Filter\"]\n    APIGateway -->|\"Validate Payload against JSONSchema / Protobuf\"| SchemaCheck{\"Valid Schema?\"}\n    SchemaCheck -->|\"No\"| Err400[\"HTTP 400 Bad Request (RFC 9457 Problem Details)\"]\n    SchemaCheck -->|\"Yes\"| Route[\"Route to Service (gRPC / HTTP2)\"]\n    Route --> Service[\"Order Processing Engine\"]\n    Service -->|\"Idempotent Execution with Lock\"| DB[(\"Orders DB\")]\n      </div>\n\n      <h2>Core Elements of Production-Grade API Contracts</h2>\n      <h3>1. Idempotency Key Semantics</h3>\n      <p>Network timeouts leave callers in an ambiguous state: did the server crash before executing the mutation, or was the response lost in flight? Non-idempotent mutating endpoints (typically <code>POST</code>, and <code>PATCH</code> when it is not naturally idempotent) should accept an <code>Idempotency-Key</code> header, an IETF draft (draft-ietf-httpapi-idempotency-key-header) popularised by Stripe. The server records the key alongside the HTTP response within a single atomic database transaction. Retried requests with the identical key and a matching request body bypass business logic and replay the cached HTTP response; reusing a key with a different body is rejected as an error.</p>\n\n      <h3>2. Backward Compatibility & Field Deprecation</h3>\n      <p>Never rename or change the type of an existing field. Follow the robustness principle (Postel's law): producers should be conservative in what they send, and consumers liberal in what they accept. The consumer side of this is the <strong>Tolerant Reader</strong> pattern: ignore unknown fields and read only what you need. New fields must be optional. Deprecated fields must remain populated through formal sunset timelines communicated via <code>Sunset: &lt;date&gt;</code> (RFC 8594) headers.</p>\n\n      <h3>3. Standardized Error Handling (RFC 9457 Problem Details)</h3>\n      <p>APIs should return uniform machine-readable error responses containing a <code>type</code> URI, human-readable <code>title</code>, HTTP <code>status</code>, granular <code>detail</code>, and a correlation <code>instance</code> trace ID to eliminate ambiguous ad-hoc client parsing.</p>\n    \n<!-- enriched -->\n<h2>Worked example: evolving a create-link endpoint</h2>\n<p>Version 1 of the shortener API is <code>POST /v1/links</code> with body <code>{\"url\": \"https://example.com/a\"}</code> returning <code>201 Created</code> and <code>{\"code\": \"Ab3xY9\", \"url\": \"...\"}</code>.</p>\n<p><strong>Safe change:</strong> add an optional <code>expires_at</code> request field and a new <code>created_at</code> response field. Old clients ignore <code>created_at</code> (if they are tolerant readers) and never send <code>expires_at</code>, so their behaviour is unchanged.</p>\n<p><strong>Breaking changes:</strong> renaming <code>url</code> to <code>destination</code>, making <code>expires_at</code> required, changing the code length that clients validate with a regex, or returning 200 instead of 201. Each needs either a new version or a migration period where both forms are accepted.</p>\n<p><strong>Retry safety:</strong> the client sends <code>Idempotency-Key: 5f2c...</code>. The server stores the key, a hash of the request body and the final response in the same transaction as the link insert. A retry with the same key and body returns the stored response; the same key with a different body returns an error (for example 422) so accidental key reuse is detected. Keys expire after a retention window, for example 24 hours at Stripe.</p>\n<h2>Compatibility rules at a glance</h2>\n<table>\n<thead><tr><th>Change</th><th>Usually safe?</th><th>Notes</th></tr></thead>\n<tbody>\n<tr><td>Add optional request field</td><td>Yes</td><td>Server must supply a sensible default</td></tr>\n<tr><td>Add response field</td><td>Yes, for tolerant clients</td><td>Strict deserializers that reject unknown fields will break</td></tr>\n<tr><td>Add new enum value</td><td>Risky</td><td>Clients with exhaustive switch statements may crash; document that enums can grow</td></tr>\n<tr><td>Remove or rename field</td><td>No</td><td>Deprecate, keep populating, announce with a Sunset header, then remove in a new version</td></tr>\n<tr><td>Make optional field required</td><td>No</td><td>Old clients never send it</td></tr>\n<tr><td>Change field type or units</td><td>No</td><td>Add a new field instead</td></tr>\n<tr><td>Tighten validation</td><td>No</td><td>Previously accepted requests start failing</td></tr>\n</tbody>\n</table>\n<h2>Standard building blocks</h2>\n<ul>\n<li><strong>Errors:</strong> RFC 9457 Problem Details (which obsoletes RFC 7807) defines a JSON error body with <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code> and <code>instance</code>.</li>\n<li><strong>Deprecation:</strong> the <code>Sunset</code> header (RFC 8594) announces when a resource will stop working; the <code>Deprecation</code> header (RFC 9745) signals that it is deprecated now.</li>\n<li><strong>Idempotency:</strong> the <code>Idempotency-Key</code> header is an IETF draft, popularised by Stripe; many providers implement it.</li>\n<li><strong>Versioning:</strong> URL versions (<code>/v1</code>) are simple and visible; Stripe uses dated versions pinned per account with a request header to override, translating responses between versions internally.</li>\n</ul>\n<h2>Failure modes</h2>\n<ul>\n<li>Idempotency record written outside the business transaction: a crash between the two lets a retry perform the action twice.</li>\n<li>Concurrent retries with the same key both running: lock on the key or insert it first with an in-progress status.</li>\n<li>Deprecation announced but never measured: log which clients still call old fields before removing them.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "API contracts are long-lived boundaries that evolve additively; changing an existing field breaks older mobile and third-party clients.",
      "Idempotency keys allow safe client retries by caching transaction outcomes and replaying responses.",
      "Use RFC 9457 Problem Details and RFC 8594 Sunset headers for predictable error handling and deprecations."
    ],
    "furtherReading": [
      {
        "title": "Stripe: Designing Robust and Predictable APIs with Idempotency",
        "url": "https://stripe.com/blog/idempotency"
      },
      {
        "title": "RFC 9457: Problem Details for HTTP APIs",
        "url": "https://www.rfc-editor.org/rfc/rfc9457"
      }
    ]
  },
  "service-to-service-communication": {
    "title": "Service-to-service communication",
    "video": {
      "youtubeId": "ewUw0sUxHI4",
      "title": "Synchronous and Asynchronous Communication between Microservices",
      "channel": "Arpit Bhayani",
      "why": "Arpit works through when to use blocking request/response versus message-based communication with concrete examples, covering coupling, failure propagation and consistency, the core of this unit.",
      "length": "40:10"
    },
    "videos": [
      {
        "youtubeId": "mBNDxpJTg8U",
        "title": "What are the types of communication for microservices? (Intro to Microservices - Part 2) sudoCODE",
        "channel": "sudoCODE",
        "role": "intro",
        "why": "Short overview of synchronous, asynchronous, one-to-one and one-to-many communication styles.",
        "length": "8:33"
      },
      {
        "youtubeId": "DXTHb9TqJOs",
        "title": "Publish-Subscribe Pattern vs Message Queues vs Request Response (Detailed Discussions with Examples)",
        "channel": "Hussein Nasser",
        "role": "deep-dive",
        "why": "Detailed comparison of request/response, queues and pub/sub with pros and cons of each, useful for choosing the right mechanism per interaction.",
        "length": "44:04"
      }
    ],
    "intuition": "<p>A phone call versus a letter. On a call you get an answer immediately, but both people must be available at the same time, and if the other person puts you on hold, you are stuck holding. A letter can be sent while the recipient is away and read later, but you do not get an answer now, and you must handle it arriving twice or late.</p>\n<p><strong>Mental model:</strong> <em>synchronous calls couple services in time; asynchronous messages couple them through a durable broker and a message format.</em> Use a call when the caller needs the answer to continue; use a message when the work can happen later.</p>\n<ul>\n<li><strong>Deep synchronous chains:</strong> A calls B calls C calls D; the slowest and least available link sets the whole request's latency and availability.</li>\n<li><strong>Timeouts without deadline propagation:</strong> if the user gave up after 1 second, B and C should not still be working on it at second 5.</li>\n<li><strong>\"Async means it never fails\":</strong> a broker absorbs bursts, but if consumers are too slow the backlog grows without limit and the delay becomes user-visible.</li>\n<li><strong>Exactly-once assumptions:</strong> most brokers deliver at least once; consumers must be idempotent.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Synchronous RPC vs. Asynchronous Messaging</h2>\n      <p>When monolithic applications decompose into distributed services, communication transitions from in-memory function pointers (sub-microsecond) to network sockets subject to non-deterministic latency, packet loss, and connection pool exhaustion. Choosing between synchronous RPC and asynchronous messaging fundamentally dictates system resilience.</p>\n\n      <h2>Communication Topologies Compared</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph SyncTopology [\"1. Synchronous RPC (Tight Temporal Coupling)\"]\n      S1[\"Order Service\"] -->|\"HTTP / gRPC (Blocking)\"| S2[\"Inventory Service\"]\n      S2 -->|\"Blocking Call\"| S3[\"Payment Gateway\"]\n      Note1[\"Thread held open. Failure at S3 cascades upstream, exhausting thread pools.\"]\n    end\n\n    subgraph AsyncTopology [\"2. Asynchronous Event-Driven (Temporal Decoupling)\"]\n      O1[\"Order Service\"] -->|\"Publish 'order.created'\"| Bus[(\"Durable Event Log: Kafka\")]\n      Bus -->|\"Pull batch\"| I1[\"Inventory Worker\"]\n      Bus -->|\"Pull batch\"| P1[\"Payment Worker\"]\n      Note2[\"No caller thread waits on downstream work. Slowdowns become queue lag, bounded by broker retention and capacity, and lag is user-visible delay.\"]\n    end\n      </div>\n\n      <h2>Under the Hood: Production Communication Invariants</h2>\n      <h3>1. Distributed Context & Deadline Propagation</h3>\n      <p>Every inbound user request must receive a unique W3C Trace Context (<code>traceparent</code>) and an absolute client deadline (e.g., <code>grpc-timeout: 500m</code>). If an upstream client specifies a 500ms timeout, and service A spends 450ms processing, downstream calls from service A to service B must only receive the remaining 50ms deadline. Continuing to execute downstream work after an upstream caller has already disconnected wastes CPU and database connections.</p>\n\n      <h3>2. Bounded Connection Pools and Keep-Alive</h3>\n      <p>Creating TCP/TLS handshakes for every inter-service call introduces substantial latency overhead. Production services maintain persistent connection pools with HTTP/2 multiplexing or TCP keep-alive, strictly bounding max connections to avoid overwhelming downstream servers with connection spikes.</p>\n    \n<!-- enriched -->\n<h2>Worked example: deadline budget across a call chain</h2>\n<p>A user request enters the API with a 1,000 ms deadline. The API calls the order service, which calls inventory and then pricing sequentially.</p>\n<ul>\n<li>API spends 50 ms on auth and parsing, then calls order with a remaining deadline of 950 ms.</li>\n<li>Order spends 30 ms, calls inventory. Inventory normally answers in 20 ms but is overloaded and hangs.</li>\n<li><strong>Without propagation:</strong> order uses a fixed 2 s client timeout to inventory. The user's request fails at 1,000 ms, but order keeps a thread and a connection blocked for another 1 s, and inventory keeps working on a request nobody wants. Under load, this wasted work is what exhausts thread pools.</li>\n<li><strong>With propagation:</strong> order passes the remaining 920 ms. gRPC does this automatically by sending the <code>grpc-timeout</code> header; each hop subtracts elapsed time. When the deadline passes, every hop cancels its work.</li>\n</ul>\n<p>A good rule is to set each hop's timeout to the smaller of its own latency target (for example p99.9 plus margin) and the remaining caller deadline.</p>\n<h2>Choosing a style</h2>\n<table>\n<thead><tr><th>Need</th><th>Synchronous (HTTP or gRPC)</th><th>Asynchronous (queue or log)</th></tr></thead>\n<tbody>\n<tr><td>Caller needs the result to respond</td><td>Natural fit</td><td>Awkward; needs request/reply correlation</td></tr>\n<tr><td>Downstream may be down for minutes</td><td>Caller fails too unless it has a fallback</td><td>Messages wait in the broker</td></tr>\n<tr><td>Traffic bursts</td><td>Downstream must absorb the burst in real time</td><td>Broker buffers; consumers work at their own pace</td></tr>\n<tr><td>Many consumers of one fact</td><td>Caller must call each one</td><td>Publish once; each subscriber reads independently</td></tr>\n<tr><td>Debugging</td><td>Single trace, simple to follow</td><td>Needs correlation IDs across producer and consumer</td></tr>\n<tr><td>Delivery semantics</td><td>Caller knows success or timeout (ambiguous)</td><td>At-least-once; duplicates and reordering possible</td></tr>\n</tbody>\n</table>\n<h2>Mechanics that matter</h2>\n<ul>\n<li><strong>Connection reuse:</strong> a new TCP plus TLS 1.3 connection costs at least 2 round trips before the first byte of the request. Pooled keep-alive connections or HTTP/2 multiplexing avoid this per call.</li>\n<li><strong>Bounded pools:</strong> cap connections per destination so a slow dependency cannot absorb all of a caller's threads (the bulkhead pattern).</li>\n<li><strong>Trace context:</strong> propagate the W3C <code>traceparent</code> header on calls and in message headers so one request can be followed through queues.</li>\n<li><strong>Transactional outbox:</strong> to update a database and publish an event without losing either, write the event to an outbox table in the same transaction and have a relay publish it.</li>\n</ul>\n<h2>How real systems do it</h2>\n<p>Google's internal RPC system (Stubby, the predecessor of gRPC) made deadline propagation a default. Uber, Netflix and LinkedIn use Kafka for asynchronous fan-out of events such as trips, plays and profile updates, while keeping request/response RPC for user-facing reads.</p>\n</div>",
    "keyTakeaways": [
      "Synchronous RPC creates tight temporal coupling where downstream latency cascades into upstream thread exhaustion.",
      "Asynchronous messaging via durable brokers decouples service availability and absorbs traffic spikes into queue lag, within broker retention limits; it does not fit calls where the user needs an immediate answer (for example payment authorisation).",
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
      "youtubeId": "WpXs7e7kEoI",
      "title": "gRPC vs REST: Why Isn’t Everyone Using gRPC?",
      "channel": "ArjanCodes",
      "why": "A balanced, practical comparison that covers Protocol Buffers, HTTP/2, code generation, browser support and debugging cost, and explains why REST remains the default for public APIs.",
      "length": "19:11"
    },
    "videos": [
      {
        "youtubeId": "gnchfOojMk4",
        "title": "What is RPC? gRPC Introduction.",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Clear animated explanation of how a gRPC call flows from client stub through Protobuf and HTTP/2 to the server.",
        "length": "6:09"
      },
      {
        "youtubeId": "UMwQjFzTQXw",
        "title": "HTTP 1 Vs HTTP 2 Vs HTTP 3!",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Explains the transport differences (multiplexing, head-of-line blocking, QUIC) that underpin the REST versus gRPC performance discussion.",
        "length": "7:37"
      }
    ],
    "intuition": "<p>REST with JSON is like sending a letter in plain English: anyone can read it, including a human debugging at 2 a.m., but it is wordy. gRPC with Protocol Buffers is like a pre-agreed form with numbered boxes: compact and quick to process, but both sides need the same form definition to understand it.</p>\n<p><strong>Mental model:</strong> <em>REST is a style of using HTTP resources and verbs; gRPC is an RPC framework that uses HTTP/2 and a schema to generate typed clients.</em> Choose on reach and tooling first, efficiency second.</p>\n<ul>\n<li><strong>Thinking gRPC is always much faster:</strong> for small payloads the network round trip dominates; the gain shows up with high call volumes, large messages or streaming.</li>\n<li><strong>Forgetting browsers:</strong> browsers cannot speak native gRPC directly; you need gRPC-Web or a gateway translation.</li>\n<li><strong>Assuming schemas remove all bugs:</strong> proto3 fields have default values, so a missing field and a zero look the same unless you use optional or wrapper types.</li>\n<li><strong>REST as \"any JSON over HTTP\":</strong> good REST uses resources, correct verbs, status codes and caching headers.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Serialization Formats & Wire Protocols</h2>\n      <p>Selecting between REST (typically JSON over HTTP/1.1 or HTTP/2) and gRPC (Protocol Buffers over HTTP/2) is fundamentally a trade-off between human readability/client reach and binary serialization throughput/CPU efficiency.</p>\n\n      <h2>Wire Format Comparison: JSON vs Protocol Buffers</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph JSONWire [\"Textual JSON Payload (High CPU & Wire Overhead)\"]\n      J1[\"{ user_id: 98412, email: alice@corp.com, active: true }\"]\n      JNote[\"Field names repeated on wire; text parsing requires memory allocation and string decoding.\"]\n    end\n\n    subgraph ProtoWire [\"Binary Protocol Buffers (Compact Serialization)\"]\n      P1[\"[08 8C 80 06 12 0E 61 6C 69 63 65...]\"]\n      PNote[\"Field names replaced by integer tags and varints. Typically 2x-5x smaller than JSON and cheaper to parse.\"]\n    end\n      </div>\n\n      <h2>Protocol Mechanics: HTTP/1.1 vs HTTP/2 in gRPC</h2>\n      <ul>\n        <li><strong>Head-of-Line Blocking:</strong> In HTTP/1.1, a single TCP connection processes one request-response pair at a time. Concurrency requires opening multiple TCP sockets (typically 6 per browser host). gRPC runs over HTTP/2, where binary frames are multiplexed concurrently across a single persistent TCP connection.</li>\n        <li><strong>Schema Enforcement:</strong> REST over JSON relies on optional runtime validators (JSONSchema). gRPC uses strictly typed <code>.proto</code> files compiled into typed language bindings at build time, catching many type mismatches at compile time (proto3 default values, unknown fields and version skew between services can still cause runtime surprises).</li>\n        <li><strong>Bidirectional Streaming:</strong> gRPC natively supports client streaming, server streaming, and bidirectional streaming over HTTP/2, making it ideal for live sensor telemetry and real-time backend synchronization.</li>\n      </ul>\n\n      <h2>When to Use Which?</h2>\n      <table>\n        <thead>\n          <tr><th>Feature</th><th>REST (JSON over HTTP/1.1 / HTTP/2)</th><th>gRPC (Protobuf over HTTP/2)</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Payload Encoding</strong></td><td>Human-readable ASCII text / UTF-8</td><td>Compact, binary-encoded varints</td></tr>\n          <tr><td><strong>Parsing Speed</strong></td><td>Moderate to slow (string scanning & memory allocations)</td><td>Fast (binary decoding, no text scanning; standard libraries still allocate)</td></tr>\n          <tr><td><strong>Browser Support</strong></td><td>Native across 100% of browsers and devices</td><td>Requires gRPC-Web proxy translation layer</td></tr>\n          <tr><td><strong>Ideal Use Case</strong></td><td>Public APIs, mobile apps, third-party integrations</td><td>High-throughput East-West internal microservices</td></tr>\n        </tbody>\n      </table>\n    \n<!-- enriched -->\n<h2>Worked example: the same message in JSON and Protobuf</h2>\n<p>A user record <code>{\"user_id\": 98412, \"email\": \"alice@corp.com\", \"active\": true}</code> is 56 bytes as compact JSON (61 with the spaces shown). With a Protobuf schema <code>int64 user_id = 1; string email = 2; bool active = 3;</code> the encoding is:</p>\n<ul>\n<li>user_id: 1 tag byte plus a 3 byte varint for 98412, 4 bytes.</li>\n<li>email: 1 tag byte, 1 length byte, 14 bytes of text, 16 bytes.</li>\n<li>active: 1 tag byte plus 1 value byte, 2 bytes.</li>\n</ul>\n<p>Total 22 bytes, about 2.5 times smaller. Most of the saving comes from not repeating field names. The string content is identical in both, so text-heavy messages shrink much less, and with gzip applied to both formats the gap narrows further. Parsing is usually faster for Protobuf because it avoids text scanning and number parsing, but standard Protobuf libraries still allocate objects; zero-copy decoding is a property of formats such as FlatBuffers and Cap'n Proto.</p>\n<h2>HTTP versions in one table</h2>\n<table>\n<thead><tr><th>Version</th><th>Transport</th><th>Concurrency on one connection</th><th>Head-of-line blocking</th></tr></thead>\n<tbody>\n<tr><td>HTTP/1.1</td><td>TCP</td><td>One request at a time (pipelining exists but is effectively unused)</td><td>At the HTTP layer; browsers open about 6 connections per host to compensate</td></tr>\n<tr><td>HTTP/2</td><td>TCP</td><td>Many multiplexed streams</td><td>Removed at the HTTP layer, but one lost TCP packet stalls all streams</td></tr>\n<tr><td>HTTP/3</td><td>QUIC over UDP</td><td>Many independent streams</td><td>A lost packet stalls only the streams whose data it carried</td></tr>\n</tbody>\n</table>\n<h2>Choosing</h2>\n<table>\n<thead><tr><th>Situation</th><th>Prefer</th><th>Why</th></tr></thead>\n<tbody>\n<tr><td>Public API for third parties</td><td>REST with JSON and OpenAPI</td><td>Universal tooling, curl-friendly, HTTP caching</td></tr>\n<tr><td>Browser front end</td><td>REST or GraphQL</td><td>Native browser support</td></tr>\n<tr><td>High-volume internal service calls</td><td>gRPC</td><td>Generated typed clients, compact encoding, deadlines built in</td></tr>\n<tr><td>Streaming between services</td><td>gRPC streaming</td><td>Client, server and bidirectional streams are first class</td></tr>\n<tr><td>Cacheable reads at a CDN</td><td>REST GET</td><td>URLs and cache headers work with every cache</td></tr>\n</tbody>\n</table>\n<h2>Operational gotchas</h2>\n<ul>\n<li><strong>Load balancing gRPC:</strong> HTTP/2 keeps one long-lived connection, so an L4 load balancer pins all of a client's calls to one backend. Use L7 (per-request) balancing or client-side balancing.</li>\n<li><strong>Schema evolution:</strong> never reuse a Protobuf field number; mark removed numbers as reserved.</li>\n<li><strong>Debuggability:</strong> binary payloads need tools like grpcurl and server reflection.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "gRPC uses Protocol Buffers to achieve significantly smaller wire payloads and lower CPU serialization overhead than JSON. Typical savings are around 2-5x before compression, and less for text-heavy messages or after gzip.",
      "HTTP/2 multiplexing allows gRPC to stream multiple requests concurrently over a single TCP connection.",
      "Use REST for public browser-facing APIs and third-party reach; use gRPC for high-performance internal microservices."
    ],
    "furtherReading": [
      {
        "title": "gRPC Official Documentation: Core Concepts",
        "url": "https://grpc.io/docs/what-is-grpc/core-concepts/"
      },
      {
        "title": "Martin Kleppmann: Schema evolution in Avro, Protocol Buffers and Thrift",
        "url": "https://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html"
      }
    ]
  },
  "tcp-vs-udp": {
    "title": "TCP vs UDP",
    "video": {
      "youtubeId": "jE_FcgpQ7Co",
      "title": "TCP vs UDP - Explaining Facts and Debunking Myths - TCP Masterclass",
      "channel": "Practical Networking",
      "why": "An underrated, precise explanation that corrects common myths (such as \"UDP is always faster\" and \"TCP guarantees delivery\") and explains what each protocol actually provides.",
      "length": "20:24"
    },
    "videos": [
      {
        "youtubeId": "G86axGfnWag",
        "title": "When to use UDP vs TCP in Building a Backend Application?",
        "channel": "Hussein Nasser",
        "role": "deep-dive",
        "why": "Backend-engineer perspective on choosing a transport: connection state, head-of-line blocking, and why many UDP applications rebuild parts of TCP.",
        "length": "20:33"
      },
      {
        "youtubeId": "UMwQjFzTQXw",
        "title": "HTTP 1 Vs HTTP 2 Vs HTTP 3!",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Shows how QUIC over UDP lets HTTP/3 avoid TCP head-of-line blocking, the modern synthesis this unit ends with.",
        "length": "7:37"
      }
    ],
    "intuition": "<p>TCP is a phone call with a careful listener: \"Sorry, could you repeat that?\" Nothing is lost and everything arrives in order, but if one word is garbled, the conversation pauses until it is repeated. UDP is shouting updates across a noisy room: fast and cheap, some words get lost, and nobody stops to repeat them.</p>\n<p><strong>Mental model:</strong> <em>TCP gives an ordered, reliable byte stream with congestion control; UDP gives individual datagrams with nothing extra, and the application decides what reliability it needs.</em> For live voice or game state, old data is worthless, so waiting for a retransmission is worse than skipping it.</p>\n<ul>\n<li><strong>\"UDP is faster\":</strong> per packet it is similar; the win is no handshake and no waiting on retransmits, not higher throughput.</li>\n<li><strong>\"TCP guarantees delivery\":</strong> it guarantees ordered delivery or an error; a broken connection can still lose data the application thought was sent.</li>\n<li><strong>Messages on TCP:</strong> TCP is a byte stream, so applications need framing (length prefixes or delimiters) to find message boundaries.</li>\n<li><strong>Forgetting congestion control on UDP:</strong> a UDP sender that ignores loss can flood the network; real protocols (QUIC, WebRTC) implement their own.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Transport Layer Primitives</h2>\n      <p>All internet communication sits on top of the Internet Protocol (IP), which provides best-effort, unordered packet delivery. The choice between <strong>TCP (Transmission Control Protocol)</strong> and <strong>UDP (User Datagram Protocol)</strong> represents the fundamental trade-off between guaranteed reliability and minimal transmission latency.</p>\n\n      <h2>TCP 3-Way Handshake vs UDP Fire-and-Forget</h2>\n      <div class=\"mermaid\">\nsequenceDiagram\n    participant Client\n    participant Server\n\n    Note over Client,Server: TCP Connection Establishment (1 RTT Handshake)\n    Client->>Server: SYN (seq = x)\n    Server->>Client: SYN-ACK (seq = y, ack = x + 1)\n    Client->>Server: ACK (ack = y + 1)\n    Client->>Server: Data Transmission (Guaranteed Ordered Stream)\n\n    Note over Client,Server: UDP Data Transmission (No Handshake)\n    Client->>Server: Datagram 1 (Direct Send, No Handshake, No ACK)\n    Client->>Server: Datagram 2 (May be dropped or reordered)\n      </div>\n\n      <h2>Detailed Protocol Mechanics</h2>\n      <h3>1. TCP Reliability & Head-of-Line (HoL) Blocking</h3>\n      <p>TCP abstracts network packets into a continuous, reliable byte stream. To achieve this, it implements sequence numbering, acknowledgments (ACKs), automatic retransmission (ARQ), and dynamic sliding window flow control. However, if packet #2 is dropped in flight, the receiver's operating system kernel buffers packets #3, #4, and #5 in memory without delivering them to the application until packet #2 is retransmitted. This is <strong>TCP Head-of-Line Blocking</strong>.</p>\n\n      <h3>2. UDP: Low-Overhead Datagrams</h3>\n      <p>UDP adds only an 8-byte header (Source Port, Destination Port, Length, Checksum) on top of IP. There is no connection state, no handshake, no ACK, and no congestion backoff. If a packet drops, the application never pauses. This makes UDP the foundation for real-time multiplayer gaming, VoIP (WebRTC), DNS queries, and live interactive media over RTP. On-demand video streaming (HLS/DASH) instead runs over HTTP on TCP or QUIC.</p>\n\n      <h3>3. The Modern Synthesis: QUIC (HTTP/3 over UDP)</h3>\n      <p>HTTP/3 replaces TCP with the <strong>QUIC protocol</strong>, which runs over UDP and is typically (though not necessarily) implemented in user space. QUIC implements multiple independent byte streams inside a single UDP connection: dropping a packet on stream A stalls stream A, while streams B, C, and D continue unaffected: head-of-line blocking is confined to the stream that lost data.</p>\n    \n<!-- enriched -->\n<h2>Worked example: what a handshake costs</h2>\n<p>A mobile user is 80 ms round-trip time (RTT) from the server.</p>\n<ul>\n<li><strong>TCP plus TLS 1.3, new connection:</strong> 1 RTT for the TCP handshake plus 1 RTT for TLS, then the HTTP request needs 1 more RTT for the response: about 240 ms before the first byte of the response.</li>\n<li><strong>TCP plus TLS 1.2:</strong> TLS 1.2 needs 2 RTTs, so about 320 ms.</li>\n<li><strong>QUIC (HTTP/3), new connection:</strong> transport and TLS 1.3 handshakes are combined into 1 RTT, then 1 RTT for the response: about 160 ms. On a resumed connection, 0-RTT lets the request go in the first flight, about 80 ms, with the caveat that 0-RTT data can be replayed, so it should only carry idempotent requests.</li>\n<li><strong>UDP for DNS:</strong> one query datagram and one response, about 80 ms, no connection at all.</li>\n</ul>\n<p>Now add loss. With 2% packet loss on a video call over TCP, each loss stalls delivery of later data for at least one RTT while the segment is retransmitted, causing visible freezes. Over UDP with RTP, the codec simply conceals the missing 20 ms audio frame.</p>\n<h2>Comparison table</h2>\n<table>\n<thead><tr><th>Property</th><th>TCP</th><th>UDP</th><th>QUIC</th></tr></thead>\n<tbody>\n<tr><td>Connection setup</td><td>3-way handshake (1 RTT)</td><td>None</td><td>1 RTT including TLS, 0-RTT on resumption</td></tr>\n<tr><td>Delivery</td><td>Reliable, ordered byte stream</td><td>Best effort datagrams, may be lost, duplicated or reordered</td><td>Reliable, ordered per stream</td></tr>\n<tr><td>Head-of-line blocking</td><td>Yes, across everything on the connection</td><td>No</td><td>Only within a stream</td></tr>\n<tr><td>Congestion control</td><td>Built in (kernel)</td><td>None, application's responsibility</td><td>Built in (usually user space)</td></tr>\n<tr><td>Header size</td><td>20 bytes minimum</td><td>8 bytes</td><td>Runs on UDP; its own headers are encrypted</td></tr>\n<tr><td>Typical uses</td><td>HTTP/1.1 and HTTP/2, databases, SSH, most RPC</td><td>DNS, VoIP and WebRTC media, game state, NTP</td><td>HTTP/3, some video streaming</td></tr>\n</tbody>\n</table>\n<h2>Failure modes and gotchas</h2>\n<ul>\n<li><strong>Middleboxes:</strong> some corporate networks block or throttle UDP, so HTTP/3 clients fall back to TCP.</li>\n<li><strong>Connection migration:</strong> a TCP connection breaks when a phone moves from Wi-Fi to cellular because the IP changes; QUIC connections carry an ID and can survive it.</li>\n<li><strong>Nagle and delayed ACK:</strong> for small interactive writes on TCP, their interaction can add tens of milliseconds; latency-sensitive apps set TCP_NODELAY.</li>\n</ul>\n<h2>How real systems do it</h2>\n<p>Most video on demand (Netflix, YouTube via HLS or DASH) is delivered over HTTP on TCP or QUIC, not raw UDP, because buffering hides retransmission delays. Live, interactive media (Zoom, Discord voice, WebRTC) uses UDP. Google and Cloudflare serve a large share of their traffic over HTTP/3.</p>\n</div>",
    "keyTakeaways": [
      "TCP guarantees ordered, reliable byte stream delivery at the cost of connection handshakes and Head-of-Line blocking.",
      "UDP is a lightweight connectionless datagram protocol with no handshake, suited to real-time interactive audio/video, gaming and DNS.",
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
      "youtubeId": "UX11tVIkYUg",
      "title": "API Gateway vs Load Balancer vs Reverse Proxy: when to use what?",
      "channel": "Software Developer Diaries",
      "why": "Directly answers this unit's question with clear diagrams: what each component does, where the responsibilities overlap, and when you need one, two or all three.",
      "length": "9:06"
    },
    "videos": [
      {
        "youtubeId": "RqfaTIWc3LQ",
        "title": "Reverse Proxy vs API Gateway vs Load Balancer",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Three-minute visual recap of the same distinction.",
        "length": "3:06"
      },
      {
        "youtubeId": "aKMLgFVxZYk",
        "title": "Load balancing in Layer 4 vs Layer 7 with HAPROXY Examples",
        "channel": "Hussein Nasser",
        "role": "deep-dive",
        "why": "Explains what a proxy can and cannot do when it only sees TCP connections versus when it parses HTTP, the technical root of the gateway and load balancer split.",
        "length": "37:33"
      }
    ],
    "intuition": "<p>At an airport, the traffic officer outside waves cars into whichever lane is free: they do not care who is inside (a load balancer). Inside, the check-in desk looks at your passport and ticket, weighs your bag, and sends you to the right gate (an API gateway). One is about spreading traffic; the other is about understanding and policing each request.</p>\n<p><strong>Mental model:</strong> <em>a load balancer distributes connections or requests across identical backends; an API gateway applies API-level policy (auth, rate limits, routing by path, transformation) before requests reach different services.</em> Many products can do both, so decide by responsibility, not by product name.</p>\n<ul>\n<li><strong>Treating them as rivals:</strong> a common layout is an L4 load balancer in front of a fleet of gateways, and more load balancing behind the gateway for each service.</li>\n<li><strong>Putting business logic in the gateway:</strong> keep it to cross-cutting concerns, or it becomes a shared monolith every team must change.</li>\n<li><strong>Forgetting the gateway is a dependency:</strong> it must be highly available and horizontally scaled, or it becomes a single point of failure.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: L4/L7 Traffic Management Primitives</h2>\n      <p>Engineers often conflate Load Balancers and API Gateways because modern proxies (like Envoy, Nginx, and Traefik) can perform both roles. However, in enterprise architecture, they operate at distinct layers of the OSI stack with different performance profiles and responsibilities.</p>\n\n      <h2>The Multi-Layer Ingress Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client Traffic\"] --> L4LB[\"Layer 4 Load Balancer (AWS NLB / Maglev: TCP/UDP Wire Speed)\"]\n    L4LB --> L7GW[\"Layer 7 API Gateway (Envoy / Kong: HTTP Parsing)\"]\n    \n    subgraph GatewayFunctions [\"API Gateway Cross-Cutting Concerns\"]\n      L7GW --> Auth[\"JWT Auth & OAuth2 Verification\"]\n      L7GW --> RateLimit[\"Distributed Rate Limiter (Redis Token Bucket)\"]\n      L7GW --> Transform[\"Payload Transformation & Header Injection\"]\n      L7GW --> Routing[\"Path-Based Routing (/v1/users -> User Service)\"]\n    end\n    \n    GatewayFunctions --> S1[\"User Microservice\"]\n    GatewayFunctions --> S2[\"Order Microservice\"]\n    GatewayFunctions --> S3[\"Payment Microservice\"]\n      </div>\n\n      <h2>Comparison: Load Balancer vs API Gateway</h2>\n      <table>\n        <thead>\n          <tr><th>Dimension</th><th>Layer 4 / 7 Load Balancer (AWS NLB/ALB)</th><th>API Gateway (Envoy, Kong, Zuul)</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>OSI Layer</strong></td><td>Layer 4 (TCP/UDP, e.g. AWS NLB) or Layer 7 (HTTP, e.g. AWS ALB, which also routes by host/path and can authenticate users via OIDC)</td><td>Layer 7 (Application Layer)</td></tr>\n          <tr><td><strong>Primary Goal</strong></td><td>Distribute raw network traffic evenly across servers</td><td>Provide unified business API orchestration & security</td></tr>\n          <tr><td><strong>Cross-Cutting Features</strong></td><td>Health checks, TLS termination, round-robin</td><td>JWT validation, rate limiting, request transformation, monetization</td></tr>\n          <tr><td><strong>Throughput & Latency</strong></td><td>Very high throughput at L4 (microsecond overhead); L7 balancers that terminate TLS pay similar TLS costs</td><td>Lower per-instance throughput; TLS plus JWT validation, policy plugins and transformations add CPU per request</td></tr>\n        </tbody>\n      </table>\n    \n<!-- enriched -->\n<h2>Worked example: a request through both</h2>\n<p>A mobile client calls <code>GET /v1/orders/123</code>.</p>\n<ol>\n<li>DNS resolves <code>api.example.com</code> to an L4 load balancer (for example AWS NLB or Google Maglev). It picks a gateway instance by hashing the connection 5-tuple and forwards packets without reading HTTP. Overhead is microseconds.</li>\n<li>The gateway (for example Envoy, Kong or AWS API Gateway) terminates TLS, validates the JWT signature and expiry, checks the caller's rate limit, and matches the path <code>/v1/orders/*</code> to the order service.</li>\n<li>The gateway picks one of the order service's healthy instances (its own L7 load balancing, for example least-requests) and forwards the request, adding headers such as the authenticated user ID and a trace ID.</li>\n<li>If the order service returns 503, the gateway may retry once on another instance, within a retry budget.</li>\n</ol>\n<p>Rate limit arithmetic: if a partner is allowed 100 requests per second and the gateway fleet has 10 instances, either each instance enforces 10 per second locally (cheap, but uneven if traffic is not spread evenly) or all instances consult a shared counter (accurate, but an extra network hop of about 1 ms per request).</p>\n<h2>Responsibility table</h2>\n<table>\n<thead><tr><th>Capability</th><th>L4 load balancer</th><th>L7 load balancer</th><th>API gateway</th></tr></thead>\n<tbody>\n<tr><td>Sees</td><td>IP, port, TCP or UDP</td><td>HTTP method, path, headers</td><td>HTTP plus API identity and policy</td></tr>\n<tr><td>Spread load across instances</td><td>Per connection</td><td>Per request</td><td>Per request, often delegated</td></tr>\n<tr><td>TLS termination</td><td>Optional (pass-through common)</td><td>Common</td><td>Common</td></tr>\n<tr><td>Path or host routing</td><td>No</td><td>Yes</td><td>Yes</td></tr>\n<tr><td>Authentication and API keys</td><td>No</td><td>Limited</td><td>Yes</td></tr>\n<tr><td>Rate limiting and quotas per client</td><td>No</td><td>Basic</td><td>Yes, often per plan</td></tr>\n<tr><td>Request or response transformation</td><td>No</td><td>Headers</td><td>Yes</td></tr>\n<tr><td>Examples</td><td>AWS NLB, Google Maglev, IPVS</td><td>AWS ALB, NGINX, HAProxy, Envoy</td><td>Kong, Apigee, AWS API Gateway, Envoy-based gateways</td></tr>\n</tbody>\n</table>\n<h2>Failure modes</h2>\n<ul>\n<li><strong>Gateway as bottleneck:</strong> CPU for TLS and JWT validation scales with request rate; autoscale it and keep policies cheap.</li>\n<li><strong>Timeouts that do not nest:</strong> if the gateway times out at 30 s but clients give up at 10 s, the gateway keeps work alive that nobody is waiting for.</li>\n<li><strong>Health checks that lie:</strong> a TCP health check passes even when the HTTP application returns 500 for every request; use an HTTP health endpoint that checks the app's real readiness.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Load balancers focus on traffic distribution, connection routing, and high-throughput health checking.",
      "API gateways handle application-level cross-cutting concerns: authentication, token buckets, and path routing.",
      "High-scale architectures place high-speed L4 load balancers in front of distributed L7 API gateway clusters."
    ],
    "furtherReading": [
      {
        "title": "Envoy Proxy Architecture Guide",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview"
      },
      {
        "title": "Chris Richardson (microservices.io): Pattern: API Gateway / Backends for Frontends",
        "url": "https://microservices.io/patterns/apigateway.html"
      },
      {
        "title": "Microsoft: API Gateway in Microservices Architecture",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway"
      }
    ]
  },
  "load-balancers": {
    "title": "Load balancers",
    "video": {
      "youtubeId": "91evAYoWWdY",
      "title": "LISA18 - Keeping the Balance: Load Balancing Demystified",
      "channel": "USENIX",
      "why": "A deep, practitioner talk from LISA18 covering L4 and L7 balancing, algorithms from round robin to power of two choices, health checking and failure behaviour; an underrated gem that matches this unit almost exactly.",
      "length": "45:30"
    },
    "videos": [
      {
        "youtubeId": "dBmxNsS3BGE",
        "title": "Top 6 Load Balancing Algorithms Every Developer Should Know",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Quick visual comparison of round robin, weighted, least connections, least response time and hashing strategies.",
        "length": "5:18"
      },
      {
        "youtubeId": "PERKHUJYotM",
        "title": "Load Balancing - The Right Way To Do It | Systems Design Interview 0 to 1 With Ex-Google SWE",
        "channel": "Jordan has no life",
        "role": "interview",
        "why": "How to talk about load balancer placement, algorithms and redundancy in a system design interview.",
        "length": "10:19"
      }
    ],
    "intuition": "<p>A supermarket with ten checkouts. Sending shoppers to lanes in strict rotation works if every basket is similar. When one shopper has a full trolley and another has a single apple, you want to send people to the shortest queue. Checking every queue is slow, so a clever manager glances at two random lanes and picks the shorter one: surprisingly, that is almost as good as checking all ten.</p>\n<p><strong>Mental model:</strong> <em>a load balancer hides many servers behind one address, removes unhealthy ones, and chooses a backend per connection or request using an algorithm suited to how uneven the work is.</em></p>\n<ul>\n<li><strong>Round robin with uneven requests:</strong> a few slow requests pile up on one node while others idle; use least-outstanding-requests or power of two choices.</li>\n<li><strong>Health checks that are too shallow or too deep:</strong> a TCP check misses a broken app; a check that also tests the database can mark every node down at once when the database blips.</li>\n<li><strong>The load balancer as a single point of failure:</strong> it needs redundancy too (pairs with a floating IP, anycast, or a managed service).</li>\n<li><strong>Least connections with a new node:</strong> a freshly added node has zero connections and can be flooded; use slow start.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Load Balancing Algorithms & Health Checks</h2>\n      <p>A load balancer sits between clients and backend server pools, ensuring that no individual node becomes a bottleneck while masking node failures dynamically. How traffic is balanced depends on the mathematical algorithm employed.</p>\n\n      <h2>Core Load Balancing Algorithms</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Traffic[\"Inbound Traffic Pool\"] --> Alg{\"Balancing Algorithm\"}\n    Alg -->|\"Round Robin / Weighted\"| RR[\"Predictable sequential distribution across uniform hardware\"]\n    Alg -->|\"Least Connections\"| LC[\"Routes to node with lowest active TCP/HTTP concurrency\"]\n    Alg -->|\"Consistent Hashing\"| CH[\"Maps user_id to specific cache node; minimal reshuffle on scaling\"]\n    Alg -->|\"P2C with Peak EWMA\"| PEWMA[\"Samples 2 random nodes; picks the one with the lower peak-EWMA latency estimate\"]\n      </div>\n\n      <h2>Under the Hood: Algorithm Deep Dive</h2>\n      <h3>1. Round Robin & Weighted Round Robin</h3>\n      <p>Requests are distributed in a circular sequence: node 0, 1, 2, …, N-1. While simple (O(1) selection via atomic pointer increment), it fails when request processing times vary widely: long-running batch requests can stack up on a single node while fast queries leave other nodes idle. Weighted Round Robin assigns higher quotas to machines with higher core/memory specs.</p>\n\n      <h3>2. Least Connections</h3>\n      <p>Maintains an atomic counter of active in-flight requests per server. New requests are dispatched to the server with the lowest current load. Well suited to variable request durations and long-lived connections such as WebSockets or streaming sessions.</p>\n\n      <h3>3. The Power of Two Random Choices (P2C) with EWMA</h3>\n      <p>The power-of-two-choices result comes from Azar, Broder, Karlin and Upfal (1994) and Mitzenmacher (1996); Twitter's Finagle popularised combining it with a peak EWMA latency estimate, and Envoy's least-request balancer uses P2C by default. Always picking the globally least-loaded node needs fresh shared state and causes herding when many balancers act on the same stale view. Instead, the load balancer picks <strong>two random nodes</strong> and routes to whichever has the lower Exponentially Weighted Moving Average (EWMA) latency. Mathematically, P2C cuts the expected maximum load from about log n / log log n (random choice) to about log log n, with O(1) computation: it greatly reduces hot spots, though it is not optimal.</p>\n    \n<!-- enriched -->\n<h2>Worked example: why random is not good enough, and two choices is</h2>\n<p>Suppose 1,000 servers each receive requests at random. If you throw n requests at n servers uniformly at random, the busiest server's load grows like log n / log log n. That is only a leading-order estimate (it evaluates to about 3.6 for n = 1,000); in simulation the busiest of 1,000 servers typically gets 5 or 6 requests while the average is 1. If instead each request samples two random servers and picks the less loaded, the maximum grows only as log log n / log 2 plus a constant, typically 3 for n = 1,000. This is the \"power of two choices\" result from Azar, Broder, Karlin and Upfal (1994) and Mitzenmacher's thesis (1996). Sampling more than two gives only small further gains.</p>\n<p>It matters in practice because a central \"least loaded\" choice needs fresh global state. Many independent load balancer instances each picking the globally least-loaded server all pick the same one (herding). Two random choices use only local, slightly stale information yet avoid herding.</p>\n<h2>Algorithm comparison</h2>\n<table>\n<thead><tr><th>Algorithm</th><th>State needed</th><th>Handles uneven request cost</th><th>Good for</th></tr></thead>\n<tbody>\n<tr><td>Round robin</td><td>A counter</td><td>Poorly</td><td>Uniform, short requests on identical servers</td></tr>\n<tr><td>Weighted round robin</td><td>Counter and weights</td><td>Poorly</td><td>Mixed instance sizes</td></tr>\n<tr><td>Least connections or outstanding requests</td><td>Active count per backend</td><td>Well</td><td>Variable request duration, long-lived connections</td></tr>\n<tr><td>Power of two choices on load</td><td>Local counts or latency estimates</td><td>Well</td><td>Many distributed balancers, large pools</td></tr>\n<tr><td>Peak EWMA latency with P2C</td><td>Latency average per backend</td><td>Well, and reacts to slow nodes</td><td>Client-side balancing (Finagle, Linkerd)</td></tr>\n<tr><td>Hash (source IP, key, consistent hash)</td><td>Hash ring</td><td>No</td><td>Stickiness and cache locality</td></tr>\n</tbody>\n</table>\n<h2>Health checking details</h2>\n<ul>\n<li><strong>Active checks:</strong> the balancer calls <code>/healthz</code> every few seconds; typical settings mark a node down after 2 to 3 failures and up after 2 successes.</li>\n<li><strong>Passive checks (outlier detection):</strong> eject a backend that returns several consecutive 5xx responses to real traffic, as Envoy does.</li>\n<li><strong>Panic threshold:</strong> if too many nodes look unhealthy (for example over 50%), send traffic to all of them rather than overload the few remaining; Envoy implements this.</li>\n<li><strong>Connection draining:</strong> when removing a node, stop new requests but let in-flight ones finish.</li>\n</ul>\n<h2>How real systems do it</h2>\n<p>Google's Maglev is a software L4 balancer that runs on commodity servers and uses consistent hashing so that connections survive balancer failover. Twitter's Finagle and Linkerd popularised P2C with a peak EWMA latency estimate for client-side balancing. NGINX and HAProxy support round robin, least connections and hashing; Envoy's least-request policy uses power of two choices by default.</p>\n</div>",
    "keyTakeaways": [
      "Round Robin is simple but vulnerable to load skew when request execution times vary.",
      "Least Connections is ideal for persistent stateful connections like WebSockets.",
      "The Power of Two Random Choices (P2C) with EWMA latency delivers near-best load balance using only local, slightly stale state, avoiding herding."
    ],
    "furtherReading": [
      {
        "title": "Michael Mitzenmacher: The Power of Two Random Choices in Randomized Load Balancing",
        "url": "https://www.eecs.harvard.edu/~michaelm/postscripts/tpds2001.pdf"
      },
      {
        "title": "Nginx: Load Balancing Algorithms Documentation",
        "url": "https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/"
      },
      {
        "title": "Google SRE Book: Load Balancing in the Datacenter",
        "url": "https://sre.google/sre-book/load-balancing-datacenter/"
      }
    ]
  },
  "consistent-hashing-load-balancing": {
    "title": "Consistent-hashing load balancing",
    "video": {
      "youtubeId": "jk6oiBJxcaA",
      "title": "Practical Load Balancing with Consistent Hashing",
      "channel": "Google TechTalks",
      "why": "Given by the Vimeo engineer who implemented consistent hashing with bounded loads in HAProxy; it covers the ring, virtual nodes and the bounded-load extension described in this unit, with production results.",
      "length": "35:19"
    },
    "videos": [
      {
        "youtubeId": "vccwdhfqIrI",
        "title": "Consistent Hashing: Easy Explanation for System Design Interviews",
        "channel": "Hello Interview",
        "role": "intro",
        "why": "Clear, short explanation of why modulo hashing reshuffles keys and how the ring fixes it.",
        "length": "7:14"
      },
      {
        "youtubeId": "zaRkONvyGr8",
        "title": "What is CONSISTENT HASHING and Where is it used?",
        "channel": "Gaurav Sen",
        "role": "intro",
        "why": "The well-known whiteboard explanation of the ring and virtual nodes; kept as an extra.",
        "length": "10:50"
      }
    ],
    "intuition": "<p>Imagine seats around a round table, each guest seated at a random spot, and every dish placed at a random spot on the table goes to the next guest clockwise. When a new guest sits down, only the dishes between them and their neighbour change hands. With \"dish number mod number of guests\", adding one guest would reshuffle almost every dish.</p>\n<p><strong>Mental model:</strong> <em>consistent hashing maps both keys and servers onto the same ring so that adding or removing a server moves only about 1/N of the keys.</em> Virtual nodes smooth out uneven arcs; bounded loads stop one hot server from being overwhelmed.</p>\n<ul>\n<li><strong>Forgetting virtual nodes:</strong> with one point per server, arcs are very uneven and some servers get several times their share.</li>\n<li><strong>Thinking it fixes hot keys:</strong> one viral key still maps to one server; you need replication, splitting the key, or bounded loads.</li>\n<li><strong>Using it where you do not need affinity:</strong> for stateless services, least-requests or P2C balances better; hashing is for cache locality or stickiness.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Sticky Routing & Cache Locality</h2>\n      <p>Traditional load balancing sends requests to any available server. For stateful caching tiers (e.g., in-process memory, local SSD caches), routing requests randomly forces every node to cache the whole working set, cutting effective cache capacity by about N times and lowering hit rates. Simple modulo hashing (<code>hash(key) % N</code>) achieves sticky routing, but adding or removing a single server shifts nearly 100% of keys, triggering a devastating cache stampede. <strong>Consistent Hashing</strong> solves this by ensuring that scaling moves only K/N keys.</p>\n\n      <h2>Consistent Hashing with Virtual Nodes</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph HashRing [\"Circular Hash Ring (0 to 2^32 - 1)\"]\n      V1[\"Server A (vnode 1)\"]\n      K1[\"Key 'user:101' -> Routed to Server A\"]\n      V2[\"Server B (vnode 1)\"]\n      K2[\"Key 'user:102' -> Routed to Server B\"]\n      V3[\"Server A (vnode 2)\"]\n    end\n\n    K1 -.->|\"Clockwise Seek\"| V1\n    K2 -.->|\"Clockwise Seek\"| V2\n      </div>\n\n      <h2>Under the Hood: Bounded-Load Consistent Hashing</h2>\n      <p>Standard consistent hashing can still create hot spots if a single partition key goes viral (e.g., a breaking news post). Google Research introduced <strong>Consistent Hashing with Bounded Loads</strong> (used in Vimeo and HAProxy):</p>\n      <ul>\n        <li>Each server is assigned a maximum capacity threshold: 1 + ε times the average cluster load (e.g., 1.25×).</li>\n        <li>When a request hashes to server S, the load balancer checks if S is currently at or above its load ceiling.</li>\n        <li>If overloaded, the load balancer skips S and walks clockwise along the ring to the next available virtual node, strictly capping load while preserving maximum possible cache affinity.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: how many keys move</h2>\n<p>A cache tier has 10 servers and 100 million keys.</p>\n<ul>\n<li><strong>Modulo hashing (hash mod N):</strong> going from 10 to 11 servers, a key stays put only if hash mod 10 equals hash mod 11, which happens for about 1 in 11 keys. So roughly 91 million keys (about 91%) move, and the cache hit rate collapses while the database absorbs the misses.</li>\n<li><strong>Consistent hashing:</strong> the new server takes over about 1/11 of the ring, so roughly 9 million keys (about 9%) move, all onto the new server. The other 10 servers keep their contents.</li>\n</ul>\n<p>Virtual nodes: with a single point per server on the ring, the largest arc can easily be 2 to 3 times the average. With about 100 to 200 virtual nodes per server, the load spread typically tightens to within roughly 10% of the mean. The cost is a larger ring lookup table, still tiny (2,000 entries for 10 servers), searched by binary search.</p>\n<p>Bounded loads: with a capacity factor of 1.25, no server may hold more than 1.25 times the average current load. If a key's home server is full, the request walks clockwise to the next server with spare capacity. Vimeo reported that this change in HAProxy made bandwidth across its cache servers far more even, at the cost of a small reduction in cache hit rate.</p>\n<div class=\"mermaid\">flowchart LR\n  K[\"Key user:42 hashes to position 7,300\"] --> R{\"Home server A at or over 1.25 x average load?\"}\n  R -- \"No\" --> A[\"Serve from server A\"]\n  R -- \"Yes\" --> B[\"Walk clockwise to next server B\"]\n  B --> C{\"Server B under its cap?\"}\n  C -- \"Yes\" --> BS[\"Serve from server B\"]\n  C -- \"No\" --> D[\"Keep walking to the next server\"]\n</div>\n<h2>Variants and trade-offs</h2>\n<table>\n<thead><tr><th>Scheme</th><th>Keys moved on change</th><th>Balance</th><th>Notes</th></tr></thead>\n<tbody>\n<tr><td>Modulo hashing</td><td>Almost all</td><td>Good</td><td>Only for fixed N</td></tr>\n<tr><td>Ring with virtual nodes (Karger et al. 1997)</td><td>About 1/N</td><td>Good with enough vnodes</td><td>Used by Cassandra, DynamoDB lineage, Memcached clients</td></tr>\n<tr><td>Rendezvous (highest random weight)</td><td>About 1/N</td><td>Good without vnodes</td><td>O(N) per lookup; simple and memory-light</td></tr>\n<tr><td>Jump consistent hash (Google 2014)</td><td>About 1/N</td><td>Very even</td><td>Servers must be numbered 0 to N-1; removing from the middle is hard</td></tr>\n<tr><td>Maglev hashing</td><td>Small</td><td>Very even</td><td>Lookup table for fast packet steering in L4 balancers</td></tr>\n<tr><td>Bounded-load consistent hashing (Mirrokni, Thorup, Zadimoghaddam 2016)</td><td>Slightly more than 1/N</td><td>Capped at (1 + epsilon) times average</td><td>HAProxy, Vimeo, Envoy supports a similar option</td></tr>\n</tbody>\n</table>\n<h2>Failure modes</h2>\n<ul>\n<li><strong>Clients with different server lists:</strong> if two clients see different membership, they send the same key to different servers and caches diverge.</li>\n<li><strong>Cascading overload:</strong> when a server dies, its whole arc moves to the next server clockwise unless virtual nodes spread it across many.</li>\n<li><strong>Cold server after join:</strong> the new server starts with an empty cache, so the database briefly sees about 1/N extra misses.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Consistent hashing maps keys and servers onto a circular 2^32 integer ring, relocating only K/N keys upon scaling.",
      "Virtual nodes (100-250 per physical host) greatly reduce non-uniform hash distribution skew.",
      "Google's Bounded-Load algorithm prevents hot-key server crashes by overflowing traffic to the next ring node."
    ],
    "furtherReading": [
      {
        "title": "Mirrokni, Thorup, Zadimoghaddam (Google): Consistent Hashing with Bounded Loads",
        "url": "https://arxiv.org/abs/1608.01350"
      },
      {
        "title": "David Karger et al.: Consistent Hashing and Random Trees (MIT)",
        "url": "https://dl.acm.org/doi/10.1145/258533.258660"
      },
      {
        "title": "Damian Gryski: Consistent Hashing: Algorithmic Tradeoffs",
        "url": "https://dgryski.medium.com/consistent-hashing-algorithmic-tradeoffs-ef6b8e2fcae8"
      }
    ]
  },
  "event-contracts": {
    "title": "Event contracts",
    "video": {
      "youtubeId": "XG-EVX6PEFo",
      "title": "How to Evolve your Microservice Schemas | Designing Event-Driven Microservices",
      "channel": "Confluent, an IBM Company",
      "why": "Focused explanation of evolving event schemas without breaking consumers: compatible changes, versioned events and when to publish a new topic, exactly this unit's concern.",
      "length": "6:20"
    },
    "videos": [
      {
        "youtubeId": "vQ4mPepAM7Q",
        "title": "Schema Compatibility | Schema Registry 101",
        "channel": "Confluent, an IBM Company",
        "role": "deep-dive",
        "why": "Precise definitions of backward, forward and full compatibility modes and which changes each allows, from the makers of Schema Registry.",
        "length": "5:12"
      },
      {
        "youtubeId": "STKCRSUsyP0",
        "title": "The Many Meanings of Event-Driven Architecture • Martin Fowler • GOTO 2017",
        "channel": "GOTO Conferences",
        "role": "deep-dive",
        "why": "Fowler distinguishes event notification, event-carried state transfer and event sourcing, which decides how much a contract must carry and how tightly consumers couple to it.",
        "length": "50:06"
      }
    ],
    "intuition": "<p>A newspaper cannot recall yesterday's edition. Once printed, readers keep copies for years. If tomorrow's paper moves the sports section or renames the columns, every reader's habits break, and old copies still look the old way. Events in a durable log are the same: they are published facts that many unknown consumers read, sometimes days or years later.</p>\n<p><strong>Mental model:</strong> <em>an event contract is the schema plus the meaning of an event, and it must be readable by consumers that are older and newer than the producer.</em> Compatibility rules decide which schema changes are safe and in which order to deploy.</p>\n<ul>\n<li><strong>Breaking a field in place:</strong> changing <code>amount</code> from a string to an integer breaks every consumer and every replay of old events.</li>\n<li><strong>Leaking internal tables as events:</strong> publishing your database row format couples consumers to your internal schema; publish domain events such as <code>OrderPlaced</code>.</li>\n<li><strong>Mixing up compatibility directions:</strong> backward compatible means new readers can read old data (upgrade consumers first); forward compatible means old readers can read new data (upgrade producers first).</li>\n<li><strong>No plan for bad events:</strong> without a dead-letter path, one unparseable event can stall a partition's consumer.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Asynchronous Schema Evolution</h2>\n      <p>In synchronous APIs, if a client sends an invalid field, the server returns an immediate HTTP 400. In asynchronous event-driven architectures, once an event is published to Kafka or RabbitMQ, it is persisted to disk and consumed by dozens of downstream microservices hours or days later. A malformed or incompatible event stays in the log: consumers can stall on it as a poison message unless they route it to a dead-letter topic, and every replay hits it again. <strong>Event Contracts</strong> formalize asynchronous payloads.</p>\n\n      <h2>Schema Registry Enforcement Flow</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Producer[\"Producer: OrderService\"] -->|\"1. Validate against Avro/Protobuf Schema\"| Registry[(\"Schema Registry\")]\n    Registry -->|\"2. Return Schema ID, cached by the client\"| Producer\n    Producer -->|\"3. Magic byte + 4-byte Schema ID + Payload to Kafka\"| Kafka[(\"Kafka Broker\")]\n    Kafka -->|\"4. Consume Event\"| Consumer[\"Consumer: BillingService\"]\n    Consumer -->|\"5. Fetch Schema by ID, then cache\"| Registry\n      </div>\n\n      <h2>Schema Evolution Compatibility Modes</h2>\n      <ul>\n        <li><strong>Backward Compatibility (Default):</strong> Newer schema code can read events written with older schemas. Consumers must be upgraded before producers. New fields must have default values.</li>\n        <li><strong>Forward Compatibility:</strong> Older schema code can read events written with newer schemas. Producers must be upgraded before consumers. Fields may only be deleted if they had defaults.</li>\n        <li><strong>Full Compatibility:</strong> Schemas are both backward and forward compatible. Old and new producers and consumers can operate concurrently in any upgrade order without downtime.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: adding a field to OrderPlaced</h2>\n<p>Version 1 of the Avro schema for <code>OrderPlaced</code> has <code>order_id</code>, <code>customer_id</code> and <code>total_cents</code>. The team wants to add <code>currency</code>.</p>\n<ul>\n<li><strong>Add with a default</strong> (<code>\"currency\", type string, default \"USD\"</code>). New consumers reading old events fill in \"USD\" (backward compatible). Old consumers reading new events ignore the unknown field (forward compatible). So this change is fully compatible and can be deployed in any order.</li>\n<li><strong>Add without a default:</strong> new consumers cannot read old events that lack the field, so Schema Registry rejects it under BACKWARD mode.</li>\n<li><strong>Rename total_cents to amount:</strong> not compatible in either direction. Add <code>amount</code> as a new field, dual-populate both for a migration period, then remove the old one only when no consumer reads it, or publish <code>OrderPlaced.v2</code> to a new topic.</li>\n</ul>\n<p>On the wire, Confluent's serializers prefix each Kafka message with 1 magic byte (0) and a 4-byte schema ID. The consumer looks up the writer's schema by ID (and caches it), then resolves it against its own reader schema. That is what lets old and new versions coexist in one topic.</p>\n<h2>Compatibility modes</h2>\n<table>\n<thead><tr><th>Mode</th><th>Guarantee</th><th>Allowed changes (Avro)</th><th>Upgrade order</th></tr></thead>\n<tbody>\n<tr><td>BACKWARD (Confluent default)</td><td>New schema can read data written with the previous schema</td><td>Delete fields, add fields with defaults</td><td>Consumers first</td></tr>\n<tr><td>FORWARD</td><td>Previous schema can read data written with the new schema</td><td>Add fields, delete fields that had defaults</td><td>Producers first</td></tr>\n<tr><td>FULL</td><td>Both directions</td><td>Add or delete only fields with defaults</td><td>Any order</td></tr>\n<tr><td>*_TRANSITIVE</td><td>Same, checked against all earlier versions, not just the latest</td><td>Same as above</td><td>Needed when consumers replay old history</td></tr>\n<tr><td>NONE</td><td>No checks</td><td>Anything</td><td>Coordinated deploys only</td></tr>\n</tbody>\n</table>\n<h2>What else belongs in the contract</h2>\n<ul>\n<li><strong>Identity and deduplication:</strong> a unique event ID so at-least-once delivery can be deduplicated.</li>\n<li><strong>Ordering key:</strong> which key determines the partition, and therefore which events are ordered relative to each other (for example all events for one order_id).</li>\n<li><strong>Semantics:</strong> whether the event is a notification (go fetch the details) or carries full state, and whether it can be replayed safely.</li>\n<li><strong>Retention and privacy:</strong> how long events are kept and which fields contain personal data that must be deletable.</li>\n</ul>\n<h2>Failure modes</h2>\n<ul>\n<li>Poison messages: route events that fail deserialization or validation to a dead-letter topic with the error, and alert.</li>\n<li>Semantic breaks that pass schema checks, such as changing units or meaning; review them like breaking API changes.</li>\n<li>Protobuf evolution: never reuse a field number; reserve removed numbers and names.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Asynchronous event schemas must be strictly governed by a Schema Registry to avoid poisoning consumer queues.",
      "Use Avro or Protocol Buffers to serialize schemas with compact integer IDs prepended to wire payloads.",
      "Full Compatibility guarantees that producers and consumers can be deployed independently in any order."
    ],
    "furtherReading": [
      {
        "title": "Confluent: Schema Evolution and Compatibility Rules",
        "url": "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html"
      },
      {
        "title": "Apache Avro: Specification and Schema Resolution",
        "url": "https://avro.apache.org/docs/current/specification/"
      },
      {
        "title": "Martin Kleppmann: Schema Evolution with Avro, Protocol Buffers, and Thrift",
        "url": "https://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html"
      }
    ]
  },
  "retries-timeouts-idempotency": {
    "title": "Retries, timeouts, and idempotency",
    "video": {
      "youtubeId": "8sTuCPh3s0s",
      "title": "Thundering Herd Problem and How not to do API retries",
      "channel": "Arpit Bhayani",
      "why": "Arpit explains exactly how naive retries synchronise into a thundering herd and how exponential backoff with jitter spreads them out, the central mechanism of this unit.",
      "length": "10:44"
    },
    "videos": [
      {
        "youtubeId": "Hxja4crycBg",
        "title": "How to safely and gracefully handle timeouts in a microservices",
        "channel": "Arpit Bhayani",
        "role": "deep-dive",
        "why": "Covers the ambiguity a timeout creates (did it happen or not?) and how to resolve it with idempotency, status checks and reconciliation.",
        "length": "23:38"
      },
      {
        "youtubeId": "J2IcD9FZvZU",
        "title": "Designing Idempotent API Endpoints for Payments at Stripe",
        "channel": "Arpit Bhayani",
        "role": "case-study",
        "why": "Walks through how Stripe designs idempotency keys so that clients can retry payment requests without double charging.",
        "length": "14:26"
      }
    ],
    "intuition": "<p>You press a lift button and nothing seems to happen, so you press it again, and again. Pressing it more does not make the lift faster, and if a hundred people do it at once the control panel could be overwhelmed. Luckily the lift button is idempotent: pressing it five times calls the lift once.</p>\n<p><strong>Mental model:</strong> <em>a timeout tells you that you do not know the outcome, not that it failed. Retry only when the operation is idempotent, back off with random jitter so retries do not synchronise, and cap retries so they cannot multiply load during an outage.</em></p>\n<ul>\n<li><strong>Retrying non-idempotent writes:</strong> retrying a payment POST without an idempotency key can charge twice.</li>\n<li><strong>Retrying at every layer:</strong> 3 retries at each of 3 layers can turn one user request into 64 calls to the bottom service (4 x 4 x 4).</li>\n<li><strong>Retrying non-retryable errors:</strong> 400 or 403 will fail again; 429 should honour <code>Retry-After</code>.</li>\n<li><strong>Timeouts longer than the caller's:</strong> if the user gives up after 2 s, a 30 s downstream timeout only wastes resources.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Retry Storm Catastrophe</h2>\n      <p>When a downstream service experiences high load and begins timing out, naive client retry loops with little or no backoff multiply the offered load, a <strong>Retry Storm</strong>. In the worst case, where every attempt fails, 10,000 clients each retrying three times turn 10,000 requests into 40,000; with retries at several layers the multipliers compound (4 × 4 × 4 = 64 for three layers). The extra load raises the failure rate, which triggers more retries: a feedback loop that can keep the service overloaded even after the original trigger is gone.</p>\n\n      <h2>The Production Retry Pattern: Exponential Backoff with Full Jitter</h2>\n      <p>To break up synchronized retry waves, Amazon AWS architecture popularized <strong>Full Jitter Exponential Backoff</strong>:</p>\n      <pre><code>// Production-Grade Exponential Backoff with Full Jitter\nfunction calculateBackoff(attempt, baseDelayMs = 100, maxDelayMs = 5000) {\n  const exponentialLimit = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));\n  // Uniform random between 0 and exponentialLimit\n  return Math.floor(Math.random() * exponentialLimit);\n}\n      </code></pre>\n\n      <h2>Resilience Guidelines</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Req[\"Request Fails / Times Out\"] --> CheckRetry{\"Is Error Retryable?\"}\n    CheckRetry -->|\"400 Bad Request / 401 Unauthorized\"| NoRetry[\"Fail Immediately (Non-Retryable)\"]\n    CheckRetry -->|\"429 Rate Limited / 503 Unavailable / Network Drop\"| CheckBudget{\"Retry Budget Available?\"}\n    \n    CheckBudget -->|\"Budget Exhausted: retries over 10% of requests\"| Drop[\"Fast Fail: Protect Downstream\"]\n    CheckBudget -->|\"Budget OK\"| Backoff[\"Sleep: honour Retry-After if present, else Full Jitter Exponential Delay\"]\n    Backoff --> Reissue[\"Reissue with Same Idempotency Key\"]\n      </div>\n\n      <h2>Under the Hood: Retry Budgets & Timeout Tiers</h2>\n      <ul>\n        <li><strong>Retry Budgets:</strong> A client service should dedicate at most <strong>10% of its total outbound traffic</strong> to retries. Once retries would exceed that ratio, further retries are dropped while original requests still go through. A circuit breaker is a separate mechanism that stops sending any requests while the error rate stays high.</li>\n        <li><strong>Timeout Splitting:</strong> Always set distinct connection timeouts (e.g., 200ms to establish TCP/TLS handshake) and socket read timeouts (e.g., 800ms for backend processing) to avoid holding sockets indefinitely.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: how retries amplify an outage</h2>\n<p>A service normally receives 10,000 requests per second and can handle 12,000. A dependency slows down and 50% of requests start timing out.</p>\n<ul>\n<li><strong>Naive clients, 3 immediate retries:</strong> each failing request can be sent up to 4 times. Offered load rises toward 10,000 x (1 + 0.5 + 0.25 + 0.125), about 18,750 requests per second, well over capacity, which pushes the failure rate higher still, which adds more retries. This feedback loop can keep the system overloaded even after the original trigger is gone, a metastable failure.</li>\n<li><strong>Retry budget of 10%:</strong> the client allows retries only while retries are under 10% of its successful request rate (Finagle and gRPC-style budgets also allow a small minimum per second). Offered load is capped around 11,000 requests per second, within capacity, so the system can recover.</li>\n</ul>\n<p>Backoff: with base 100 ms, cap 5 s and full jitter, attempt 1 waits uniformly 0 to 200 ms, attempt 2 waits 0 to 400 ms, attempt 3 waits 0 to 800 ms. Without jitter, thousands of clients that failed at the same moment retry at the same moment, creating spikes; with full jitter their retries spread across the window.</p>\n<p>Timeouts: measure the dependency's p99.9 latency (say 180 ms) and set the timeout a little above it (say 250 ms), not an arbitrary 30 s. Also keep the sum of timeout and retries within the caller's deadline: 250 ms times 3 attempts plus backoff must fit in the budget the caller gave you.</p>\n<h2>Which failures to retry</h2>\n<table>\n<thead><tr><th>Signal</th><th>Retry?</th><th>Notes</th></tr></thead>\n<tbody>\n<tr><td>Connection refused or reset before sending</td><td>Yes</td><td>Request was not processed</td></tr>\n<tr><td>Timeout after sending</td><td>Only if idempotent</td><td>Outcome unknown</td></tr>\n<tr><td>503 Service Unavailable</td><td>Yes, with backoff</td><td>Honour Retry-After if present</td></tr>\n<tr><td>429 Too Many Requests</td><td>Yes, after Retry-After</td><td>Retrying sooner makes it worse</td></tr>\n<tr><td>500 Internal Server Error</td><td>Carefully</td><td>May be a deterministic bug; limit attempts</td></tr>\n<tr><td>400, 401, 403, 404, 422</td><td>No</td><td>Same request will fail the same way</td></tr>\n</tbody>\n</table>\n<h2>Making writes idempotent</h2>\n<ul>\n<li><strong>Idempotency keys:</strong> the client generates a unique key per logical operation and reuses it on retries; the server stores key, request hash and response atomically with the side effect.</li>\n<li><strong>Natural idempotency:</strong> PUT of a full resource, \"set status to shipped\" instead of \"advance status\", or conditional writes with version numbers.</li>\n<li><strong>Deduplication at consumers:</strong> store processed message IDs in the same transaction as the effect.</li>\n</ul>\n<h2>How real systems do it</h2>\n<p>AWS SDKs use exponential backoff with jitter and a client-side retry token bucket by default. gRPC supports retry policies with a retry throttling ratio configured per service. Google's SRE book recommends per-request retry limits and per-client retry budgets of around 10% to prevent retry amplification.</p>\n</div>",
    "keyTakeaways": [
      "Naive retries cause retry storms that can keep overloaded services from recovering, even after the original trigger is gone.",
      "Full Jitter Exponential Backoff randomizes client retry delays across a uniform interval, flattening traffic spikes.",
      "Enforce retry budgets (max 10% retries) and distinct connection vs read timeouts to protect network resources."
    ],
    "furtherReading": [
      {
        "title": "AWS Architecture Blog: Exponential Backoff And Jitter",
        "url": "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"
      },
      {
        "title": "Release It! Design and Deploy Production-Ready Software (Michael T. Nygard)",
        "url": "https://pragprog.com/titles/mnee2/release-it-second-edition/"
      },
      {
        "title": "Netflix Technology Blog (Ben Christensen): Fault Tolerance in a High Volume, Distributed System",
        "url": "https://netflixtechblog.com/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a"
      }
    ]
  },
  "batching": {
    "title": "Batching",
    "video": {
      "youtubeId": "9WrdxvCXUhs",
      "title": "Optimizing Kafka Producers and Consumers: A Hands-On Guide",
      "channel": "Rock the JVM",
      "why": "Hands-on demonstration of how batch.size, linger.ms and compression change throughput and latency, the concrete batching example this unit is built around.",
      "length": "27:33"
    },
    "videos": [
      {
        "youtubeId": "UNUz1-msbOM",
        "title": "System Design: Why is Kafka fast?",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Short visual explanation of how batching, sequential I/O and zero-copy combine to give Kafka its throughput.",
        "length": "5:02"
      },
      {
        "youtubeId": "fDGWWpHlzvw",
        "title": "Designing for Performance • Martin Thompson • GOTO 2015",
        "channel": "GOTO Conferences",
        "role": "deep-dive",
        "why": "Martin Thompson explains throughput and latency from first principles, including amortising fixed costs by batching (his \"smart batching\" idea) without adding needless delay.",
        "length": "50:18"
      }
    ],
    "intuition": "<p>A bus versus taxis. Sending 50 people in 50 taxis means 50 drivers, 50 fares and 50 trips. One bus carries all of them for the price of one trip, but the first passenger has to wait until the bus fills up or its departure time arrives.</p>\n<p><strong>Mental model:</strong> <em>batching amortises a fixed per-operation cost (a network round trip, a system call, an fsync, a transaction commit) over many items, trading a bounded wait for much higher throughput.</em> Flush when the batch is full or when the maximum wait has passed, whichever comes first.</p>\n<ul>\n<li><strong>Waiting when there is no load:</strong> a fixed 50 ms linger adds 50 ms to every request at low traffic. Smart batching sends immediately when idle and batches naturally when busy.</li>\n<li><strong>All-or-nothing failure:</strong> one bad record should not force the whole batch to be retried; return per-item results.</li>\n<li><strong>Unbounded batches:</strong> a huge batch can exceed message size limits, hold locks for too long or cause memory spikes.</li>\n<li><strong>Batching across users without isolation:</strong> one tenant's bad record should not fail another tenant's writes.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Amortizing System Call and Network Overhead</h2>\n      <p>Sending 10,000 independent network calls each containing a 100-byte payload incurs astronomical overhead: 10,000 TCP packet headers (40 bytes each), 10,000 kernel context switches (<code>sys_sendto</code>), and, if the calls are sequential, 10,000 round-trip latency delays. <strong>Batching</strong> coalesces multiple operations into a single network packet or disk write, trading minor latency for orders of magnitude higher throughput.</p>\n\n      <h2>Batching Trade-Off: Size vs. Latency Timer</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    EventStream[\"Incoming Events: E1, E2, E3, E4...\"] --> Buffer[\"In-Memory Ring Buffer\"]\n    Buffer --> Trigger{\"Flush Trigger Condition\"}\n    Trigger -->|\"Condition 1: max_batch_size reached (e.g. 64KB)\"| Flush[\"Flush Batch Atomically to Network/Disk\"]\n    Trigger -->|\"Condition 2: max_wait_time elapsed (e.g. 10ms)\"| Flush\n      </div>\n\n      <h2>Under the Hood: Production Batching Invariants</h2>\n      <h3>1. Kafka Producer Batching (`linger.ms` and `batch.size`)</h3>\n      <p>Apache Kafka achieves millions of messages per second on commodity hardware through batching combined with sequential disk I/O, the OS page cache and zero-copy transfers. The producer library holds records in a memory buffer. It flushes when either <code>batch.size</code> (e.g., 16KB) is reached OR <code>linger.ms</code> (e.g., 10ms) expires. Setting <code>linger.ms = 5</code> adds up to 5ms of delay but can raise throughput substantially under load, because requests carry fuller and better-compressed batches; the gain depends on record size and rate. Kafka 4.0 (KIP-1030) changed the default from 0 to 5 ms.</p>\n\n      <h3>2. Partial Batch Failure Semantics</h3>\n      <p>When sending a batch of 500 records to an upstream service, individual records may fail (e.g., a validation error on record #42). Production batch APIs should return granular per-item statuses rather than failing the entire batch, preventing infinite redelivery loops. Note that a single multi-row SQL <code>INSERT ... VALUES (...), (...)</code> is atomic: a duplicate key on one row fails the whole statement unless you use <code>ON CONFLICT</code> or per-row handling.</p>\n    \n<!-- enriched -->\n<h2>Worked example: inserting click events</h2>\n<p>The shortener must store 1,200 click events per second on average. Suppose each database round trip costs 1 ms of network and commit overhead and each row adds 0.02 ms of work.</p>\n<ul>\n<li><strong>One insert per event, one connection:</strong> 1 ms + 0.02 ms per event, so at most about 980 events per second per connection. You need several connections just to keep up, and every one of them pays a commit (and an fsync on the primary).</li>\n<li><strong>Batches of 100 rows per insert:</strong> 1 ms + 100 x 0.02 ms = 3 ms per batch, or about 33,000 events per second per connection, a 34x improvement. The cost: an event waits until 100 have accumulated or a timer (say 20 ms) fires, so worst-case added latency is about 20 ms.</li>\n<li><strong>Batches of 10,000:</strong> 201 ms per batch, only slightly more throughput per connection than 1,000-row batches, but a single failure now affects 10,000 events and locks are held longer. Returns diminish once the fixed cost is a small fraction of the batch.</li>\n</ul>\n<p>The general formula: throughput per worker = batch size / (fixed cost + batch size x per-item cost). Once the per-item term dominates, bigger batches stop helping.</p>\n<h2>Trade-off table</h2>\n<table>\n<thead><tr><th>Setting</th><th>Throughput</th><th>Latency</th><th>Failure blast radius</th></tr></thead>\n<tbody>\n<tr><td>No batching</td><td>Lowest, bounded by per-call overhead</td><td>Lowest at low load; high at saturation</td><td>One item</td></tr>\n<tr><td>Small batches with short linger (for example 5 ms)</td><td>High</td><td>Adds at most the linger time</td><td>Small</td></tr>\n<tr><td>Large batches with long linger</td><td>Highest, with diminishing returns</td><td>Adds up to the linger time to every item</td><td>Large; retries are expensive</td></tr>\n<tr><td>Smart batching (take whatever is queued, no fixed wait)</td><td>High under load</td><td>No added wait when idle</td><td>Varies with load</td></tr>\n</tbody>\n</table>\n<h2>Where batching appears</h2>\n<ul>\n<li><strong>Kafka producer:</strong> <code>batch.size</code> (default 16 KB per partition) and <code>linger.ms</code> (default 0 before Kafka 4.0, 5 ms from 4.0) control how long records wait to share a request; compression applies to the whole batch, so larger batches also compress better.</li>\n<li><strong>Database group commit:</strong> PostgreSQL and MySQL can flush the write-ahead log for several concurrent transactions with one fsync.</li>\n<li><strong>Multi-row SQL:</strong> <code>INSERT ... VALUES (...), (...)</code> or <code>COPY</code>. Note a single multi-row INSERT is atomic: one duplicate key fails the whole statement unless you use <code>ON CONFLICT DO NOTHING</code> or equivalent.</li>\n<li><strong>API batching and DataLoader:</strong> GraphQL DataLoader collects individual lookups within one tick and issues a single batched query, removing N+1 patterns.</li>\n<li><strong>GPU inference:</strong> model servers batch requests dynamically because a GPU processes 32 inputs nearly as fast as one.</li>\n</ul>\n<h2>Failure modes</h2>\n<ul>\n<li>Losing a buffered batch on crash: in-memory batches are not durable until flushed; acknowledge callers only after the flush if they need durability.</li>\n<li>Partial failure handling: the API must report which items failed so the caller retries only those, idempotently.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Batching amortizes kernel system calls, TCP headers, and disk write overhead across hundreds of operations.",
      "Production flush engines combine maximum byte size with a time-based linger window (e.g., 10ms).",
      "Batch APIs must support partial failure semantics with granular per-record error arrays."
    ],
    "furtherReading": [
      {
        "title": "Kafka Producer Configuration: linger.ms and batch.size",
        "url": "https://kafka.apache.org/documentation/#producerconfigs"
      },
      {
        "title": "John Nagle: RFC 896: Congestion Control in IP/TCP Internetworks (Nagle's algorithm)",
        "url": "https://www.rfc-editor.org/rfc/rfc896"
      },
      {
        "title": "AWS: Amazon DynamoDB API Reference: BatchWriteItem",
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html"
      }
    ]
  },
  "backpressure": {
    "title": "Backpressure",
    "video": {
      "youtubeId": "1bNOO3xxMc0",
      "title": "Zach Tellman - Everything Will Flow",
      "channel": "ClojureTV",
      "why": "A celebrated Strange Loop-era talk on queues: why unbounded queues fail, and the only three responses to overload (buffer, drop, or push back), which is precisely this unit.",
      "length": "40:13"
    },
    "videos": [
      {
        "youtubeId": "3DTSIlj72Qs",
        "title": "Backpressure in Software Development simply explained",
        "channel": "Software Developer Diaries",
        "role": "intro",
        "why": "Gentle, clear introduction to what backpressure is and the common strategies for handling it.",
        "length": "8:36"
      },
      {
        "youtubeId": "0KYoIvrM9VY",
        "title": "Backpressure Explained",
        "channel": "Petabridge",
        "role": "deep-dive",
        "why": "Explains pull-based, demand-driven flow control as used in reactive streams, with the mechanics of how demand signals travel upstream.",
        "length": "19:33"
      }
    ],
    "intuition": "<p>A kitchen where the chef can plate 10 dishes a minute but the waiters bring in 15 orders a minute. The order rail fills up. The kitchen can let orders pile up forever (until the rail collapses), throw some away, or tell the host to stop seating new tables for a while. That last option is backpressure.</p>\n<p><strong>Mental model:</strong> <em>when a producer is faster than a consumer, something must give: buffer (only works for temporary bursts), drop, or slow the producer. Backpressure is the signal that slows the producer.</em> A queue buys time, not capacity.</p>\n<ul>\n<li><strong>Unbounded queues:</strong> they hide overload until memory runs out or latency becomes minutes; always set a limit and decide what happens at it.</li>\n<li><strong>Backpressure that stops at a boundary:</strong> if your service pushes back but the load balancer or client keeps retrying, the pressure just moves. Propagate it to the edge (429 or 503).</li>\n<li><strong>Buffers everywhere:</strong> many layers of large buffers add latency (bufferbloat) and delay the backpressure signal.</li>\n<li><strong>Treating backpressure and load shedding as the same:</strong> backpressure slows senders you control; shedding rejects work you cannot slow.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Flow Control Across Asynchronous Boundaries</h2>\n      <p>When an upstream producer generates work faster than a downstream consumer can process it, memory must buffer the delta. If the buffer is unbounded and the overload is sustained, the consumer will eventually crash with an Out-of-Memory (OOM) error, and latency grows unacceptably long before that. <strong>Backpressure</strong> is the communication feedback loop that signals the producer to slow down or pause.</p>\n\n      <h2>Backpressure Feedback Loop: Pull-Based Credit Flow</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Consumer[\"Downstream Consumer (3 Workers Free)\"] -->|\"1. Grant Credit: request(3)\"| Producer[\"Upstream Producer\"]\n    Producer -->|\"2. Transmit Exactly 3 Items\"| Consumer\n    Consumer -->|\"3. Process Items & Free Memory\"| Work[\"Complete Work\"]\n    Work -->|\"4. Grant Next Credit: request(N)\"| Producer\n      </div>\n\n      <h2>Under the Hood: The Three Backpressure Defenses</h2>\n      <ul>\n        <li><strong>Push vs. Pull (Reactive Streams Specification):</strong> Push-based streams are inherently vulnerable to overwhelming consumers. Pull- or demand-based streams invert control: in Reactive Streams consumers signal <code>request(n)</code> for a specific number of items, and HTTP/2 and gRPC flow control grant byte-level window credits. Kafka consumers are simply pull-based: they fetch from the broker at their own pace, with no credit protocol.</li>\n        <li><strong>TCP Window Size (Kernel Flow Control):</strong> When an application thread stops reading from a TCP socket, the OS kernel receive buffer fills. The TCP stack automatically advertises a <code>Window Size = 0</code> back to the sender, forcing the sender's kernel to pause transmitting packets.</li>\n        <li><strong>Dropping Strategies:</strong> When queues reach hard capacity, systems must execute an explicit drop policy:\n          <ul>\n            <li><strong>Tail Drop:</strong> Drop newly arriving messages (protects existing in-flight transactions).</li>\n            <li><strong>Head Drop:</strong> Drop the oldest messages in the queue (ideal for time-sensitive data like live GPS telemetry).</li>\n          </ul>\n        </li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: how fast a queue fills</h2>\n<p>A consumer processes 1,000 messages per second. A traffic spike sends 1,500 messages per second for 10 minutes. The backlog grows by 500 per second, so after 10 minutes there are 300,000 queued messages. At 2 KB each that is about 600 MB of memory for an in-memory queue.</p>\n<ul>\n<li>Once the spike ends and arrivals drop back to, say, 800 per second, the consumer drains only 200 per second of backlog, so clearing 300,000 messages takes 25 minutes. A message arriving at the end of the spike waits about 300,000 / 1,000 = 5 minutes before processing.</li>\n<li>If the spike instead lasts all day, the queue grows by about 43 million messages; no buffer is big enough. Only more consumers, less work per message, dropping, or slowing the producer can fix it.</li>\n</ul>\n<p>Little's law makes the link explicit: items in the system = arrival rate x time in system. With a bound of 10,000 queued items and a drain rate of 1,000 per second, the worst queueing delay is about 10 seconds; the bound on the queue is effectively a bound on latency.</p>\n<h2>Strategies at a limit</h2>\n<table>\n<thead><tr><th>Strategy</th><th>How it works</th><th>Good for</th><th>Cost</th></tr></thead>\n<tbody>\n<tr><td>Block the producer</td><td>Send or put call waits when the buffer is full</td><td>In-process pipelines, TCP streams</td><td>Producer threads stall; risk of deadlock across cycles</td></tr>\n<tr><td>Credit or demand signalling</td><td>Consumer grants N credits; producer sends at most N</td><td>Reactive Streams, HTTP/2 and gRPC flow control, AMQP prefetch</td><td>Protocol support required</td></tr>\n<tr><td>Pull-based consumption</td><td>Consumer fetches when ready</td><td>Kafka consumers, SQS polling</td><td>Backlog accumulates in the broker instead; monitor lag</td></tr>\n<tr><td>Reject with 429 or 503</td><td>Tell the client to retry later</td><td>Service edges, public APIs</td><td>Clients must back off properly</td></tr>\n<tr><td>Drop newest (tail drop)</td><td>Refuse new items when full</td><td>Work where existing items matter more</td><td>New work is lost</td></tr>\n<tr><td>Drop oldest (head drop)</td><td>Discard stale items to make room</td><td>Telemetry, live locations, metrics</td><td>Old items lost; fine when only the latest matters</td></tr>\n<tr><td>Sample or aggregate</td><td>Keep 1 in N, or merge updates</td><td>Metrics, logs, UI updates</td><td>Precision</td></tr>\n</tbody>\n</table>\n<h2>Backpressure in real stacks</h2>\n<ul>\n<li><strong>TCP:</strong> the receiver advertises its free buffer as the receive window. If the application stops reading, the window drops to zero and the sender's kernel stops transmitting.</li>\n<li><strong>HTTP/2 and gRPC:</strong> per-stream and per-connection flow-control windows are updated with WINDOW_UPDATE frames.</li>\n<li><strong>Node.js streams:</strong> <code>write()</code> returns false when the buffer exceeds its high-water mark; producers should wait for the <code>drain</code> event.</li>\n<li><strong>Kafka:</strong> consumers pull at their own pace; the log is the buffer, bounded by retention. Consumer lag is the metric to alert on.</li>\n</ul>\n<h2>Failure modes</h2>\n<ul>\n<li>Retry storms that defeat backpressure: rejected clients that retry immediately keep load high.</li>\n<li>Head-of-line stalls: blocking on one slow consumer can halt a shared pipeline; isolate per destination.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Unbounded in-memory queues lead to Out-of-Memory (OOM) container crashes under sustained overload, and to very long queueing delays well before that.",
      "Reactive pull-based flow control requires consumers to issue explicit credits before producers can send data.",
      "Enforce hard queue capacity limits with explicit drop strategies (Tail Drop vs Head Drop)."
    ],
    "furtherReading": [
      {
        "title": "Reactive Streams: Specification for the JVM (README)",
        "url": "https://github.com/reactive-streams/reactive-streams-jvm/blob/master/README.md"
      },
      {
        "title": "Fred Hebert: Queues Don't Fix Overload",
        "url": "https://ferd.ca/queues-don-t-fix-overload.html"
      },
      {
        "title": "Netflix Concurrency Limits: Adaptive Concurrency Control",
        "url": "https://github.com/Netflix/concurrency-limits"
      }
    ]
  },
  "tail-latency": {
    "title": "Tail latency",
    "video": {
      "youtubeId": "1-3Ahy7Fxsc",
      "title": "Jeff Dean: \"Achieving Rapid Response Times in Large Online Services\" Keynote - Velocity 2014",
      "channel": "O'Reilly",
      "why": "Jeff Dean presents the ideas behind \"The Tail at Scale\" himself: fan-out amplification, hedged and tied requests, and micro-partitioning, with Google measurements.",
      "length": "28:00"
    },
    "videos": [
      {
        "youtubeId": "lJ8ydIuPFeU",
        "title": "\"How NOT to Measure Latency\" by Gil Tene",
        "channel": "Strange Loop Conference",
        "role": "deep-dive",
        "why": "The definitive talk on measuring tail latency correctly, including coordinated omission and why averages and many percentile charts mislead.",
        "length": "42:59"
      },
      {
        "youtubeId": "1Qxnrf2pW10",
        "title": "Read a paper: The Tail at Scale",
        "channel": "Vivek Haldar",
        "role": "intro",
        "why": "A concise walkthrough of the Tail at Scale paper for viewers who want the key ideas in under ten minutes.",
        "length": "8:53"
      }
    ],
    "intuition": "<p>Ten friends agree to meet for dinner, and nobody orders until everyone arrives. Each friend is usually on time and late only 1 time in 100. But with ten of them, the chance that at least one is late is almost 10%. Invite a hundred and dinner starts late most nights. The group waits for its slowest member.</p>\n<p><strong>Mental model:</strong> <em>when a request waits for many backends, its latency is the maximum of theirs, so the rare slow case of each backend becomes the common case for the user.</em> Tail latency (p99, p99.9) is what users at scale actually feel.</p>\n<ul>\n<li><strong>Reporting averages:</strong> an average of 50 ms can hide a p99 of 2 s; always look at high percentiles and the distribution.</li>\n<li><strong>Averaging percentiles:</strong> you cannot average p99s from ten servers to get the fleet p99; merge histograms instead.</li>\n<li><strong>Coordinated omission:</strong> a load tester that waits for each slow response before sending the next under-records how many requests would have queued behind it.</li>\n<li><strong>Hedging without limits:</strong> sending duplicate requests too eagerly can double load and make the tail worse.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>The Tyranny of the Tail: Why Averages Lie</h2>\n      <p>In distributed systems, the average response time (mean) is virtually meaningless. If a service has an average latency of 10ms but a 99th percentile (p99) latency of 2,000ms, one out of every 100 users experiences a 2-second stall. In fan-out architectures, <strong>tail latency is amplified</strong>: if each of N backends is slow 1% of the time, the chance a request hits at least one slow backend is 1 - 0.99^N.</p>\n\n      <h2>Fan-Out Tail Latency Amplification</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"User Request: Load Feed\"] --> Fanout[\"API Gateway\"]\n    Fanout --> S1[\"Service 1 (p99 = 100ms)\"]\n    Fanout --> S2[\"Service 2 (p99 = 100ms)\"]\n    Fanout --> S100[\"Service 100 (p99 = 100ms)\"]\n    \n    S1 & S2 & S100 --> Merge[\"Merge Results & Return\"]\n    Note[\"If a page fans out to 100 backend services each with 99% success under 100ms, the probability of the entire page loading under 100ms is 0.99^100 = only 36.6%! 63.4% of users experience a tail latency stall!\"]\n      </div>\n\n      <h2>Mitigating Tail Latency: Dean and Barroso's \"The Tail at Scale\"</h2>\n      <ul>\n        <li><strong>Hedged Requests:</strong> If a request to a backend node does not return within the 95th percentile expected latency (e.g., after 50ms), immediately send an identical request to a replica server. Whichever server replies first provides the result, and the other request is canceled. Hedging at the 95th percentile caps the extra load at about 5%. In the paper's Bigtable benchmark, hedging after 10ms cut p99.9 latency from 1,800ms to 74ms (about 96%) while sending only about 2% more requests.</li>\n        <li><strong>Tied Requests:</strong> Submit the request simultaneously to two server queues with mutual cancellation tokens. When one server begins execution, it notifies the other to dequeue the request.</li>\n        <li><strong>Coordinated Omission:</strong> Benchmark tools often pause while waiting for a slow request, inadvertently omitting the queueing delays experienced by real users during that stall. Accurate tail measurement requires a constant-arrival-rate (open-model) load generator such as Gil Tene's wrk2; HdrHistogram records the full latency distribution and can optionally correct recorded data for an expected interval.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: fan-out amplification</h2>\n<p>Each leaf server answers within 10 ms 99% of the time, and its slow 1% takes about 1 s (a GC pause, a disk hiccup, a noisy neighbour).</p>\n<table>\n<thead><tr><th>Leaves a request waits for</th><th>Chance all are fast (0.99 to the power N)</th><th>Requests that hit at least one slow leaf</th></tr></thead>\n<tbody>\n<tr><td>1</td><td>99%</td><td>1%</td></tr>\n<tr><td>10</td><td>about 90.4%</td><td>about 9.6%</td></tr>\n<tr><td>100</td><td>about 36.6%</td><td>about 63.4%</td></tr>\n<tr><td>1,000</td><td>about 0.004%</td><td>almost all</td></tr>\n</tbody>\n</table>\n<p>This matches the example in Dean and Barroso's \"The Tail at Scale\" (CACM 2013): with 100 leaves, 63% of user requests take over 1 s. To keep the combined p99 at 10 ms with 100 leaves, each leaf would need to be fast 99.99% of the time (0.9999 to the power 100 is about 99%).</p>\n<h2>Hedged requests, with numbers</h2>\n<p>A hedged request sends a second copy to another replica only if the first has not answered within, say, the 95th percentile latency. At most about 5% extra load is added. In the paper's Bigtable benchmark, reading 1,000 keys spread over 100 servers, hedging after a 10 ms delay cut the 99.9th percentile latency from 1,800 ms to 74 ms while sending only about 2% more requests.</p>\n<p>Tied requests go further: the request is enqueued on two servers at once, each copy knowing about the other; whichever starts first sends a cancellation to the other. This avoids the wait before hedging but needs server cooperation.</p>\n<h2>Techniques and trade-offs</h2>\n<table>\n<thead><tr><th>Technique</th><th>Helps with</th><th>Cost or risk</th></tr></thead>\n<tbody>\n<tr><td>Hedged requests</td><td>Random slow replicas</td><td>Extra load; only for idempotent reads</td></tr>\n<tr><td>Tied requests with cancellation</td><td>Queueing delay variation</td><td>Server-side coordination</td></tr>\n<tr><td>Micro-partitioning (many small shards per server)</td><td>Rebalancing hot or slow servers quickly</td><td>More metadata</td></tr>\n<tr><td>Good-enough results (return partial results after a deadline)</td><td>Search and feeds where completeness is optional</td><td>Slightly lower quality answers</td></tr>\n<tr><td>Reducing variability (GC tuning, request prioritisation, background work throttling)</td><td>Root causes of slow tails</td><td>Engineering effort</td></tr>\n<tr><td>Fewer sequential hops</td><td>Compounding tails in chains</td><td>Architecture change</td></tr>\n</tbody>\n</table>\n<h2>Measuring the tail correctly</h2>\n<ul>\n<li>Record latencies into histograms (for example HdrHistogram, or Prometheus histograms with well-chosen buckets) and merge them; do not average percentiles.</li>\n<li>Use an open-model, constant-arrival-rate load generator (for example wrk2 or k6 constant-arrival-rate) so slow responses do not suppress the requests that would have been sent. HdrHistogram can also correct recorded data for an expected interval, but the correct fix is in the load generator.</li>\n<li>Include failures and timeouts as slow results, not as missing samples.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Fan-out architectures amplify tail latency: querying 100 backend services with 99% fast SLA drops user fast probability to 36.6%.",
      "Hedged requests reissue redundant RPCs to replicas after p95 timeout thresholds, collapsing tail latency spikes.",
      "Record latency in mergeable histograms (e.g., HdrHistogram) and drive benchmarks with constant-arrival-rate load generators (e.g., wrk2) to avoid Coordinated Omission bias."
    ],
    "furtherReading": [
      {
        "title": "Jeff Dean & Luiz André Barroso: The Tail at Scale (Google)",
        "url": "https://research.google/pubs/pub40801/"
      },
      {
        "title": "Gil Tene: HdrHistogram - A High Dynamic Range Histogram (GitHub)",
        "url": "https://github.com/HdrHistogram/HdrHistogram"
      },
      {
        "title": "Gil Tene: How NOT to Measure Latency (InfoQ talk)",
        "url": "https://www.infoq.com/presentations/latency-response-time/"
      }
    ]
  },
  "load-shedding": {
    "title": "Load shedding",
    "video": {
      "youtubeId": "8cDMmob2TaY",
      "title": "Avoiding Overload in Distributed Systems | David Yanacek",
      "channel": "@Scale",
      "why": "David Yanacek, author of the Amazon Builders' Library article on load shedding, explains why overloaded services collapse, how to reject excess work cheaply and early, and how to prioritise.",
      "length": "24:58"
    },
    "videos": [
      {
        "youtubeId": "YXkOdWBwqaA",
        "title": "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling",
        "channel": "ByteByteGo",
        "role": "deep-dive",
        "why": "A clear architectural breakdown of rate limiting algorithms, token bucket, leaky bucket, and handling traffic spikes with load shedding.",
        "length": "10:15"
      },
      {
        "youtubeId": "8iMlUcmyHAc",
        "title": "OSDI '22 - Metastable Failures in the Wild",
        "channel": "USENIX",
        "role": "deep-dive",
        "why": "Research talk showing how retries and overload create self-sustaining outages in real systems, the failure mode that load shedding is designed to prevent.",
        "length": "15:31"
      }
    ],
    "intuition": "<p>An overcrowded emergency room does not try to treat everyone at once; it triages. Critical patients go in, minor injuries wait or are sent to a clinic. Trying to see everybody simultaneously would mean nobody gets treated well and the doctors collapse.</p>\n<p><strong>Mental model:</strong> <em>past its capacity a service does less useful work, not more, because requests time out after consuming resources. Load shedding rejects some work early and cheaply so the rest completes within its deadline.</em> Rejecting 20% fast beats failing 100% slowly.</p>\n<ul>\n<li><strong>Shedding too late:</strong> rejecting after parsing, authenticating and querying the database saves little; shed at the edge or as the first step.</li>\n<li><strong>No priorities:</strong> shedding checkout and health checks along with bots and analytics hurts the business; tag request criticality.</li>\n<li><strong>Static limits:</strong> a fixed 10,000 requests per second limit is wrong after a deploy that halves per-request cost or a cache flush that doubles it; adaptive concurrency limits track real capacity.</li>\n<li><strong>Clients that retry immediately:</strong> shed responses should carry Retry-After, and clients must back off, or shedding just generates more traffic.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Graceful Degradation Under Overload</h2>\n      <p>When demand exceeds maximum hardware capacity, a system cannot simply try to serve everyone; attempting to process 150,000 QPS on a cluster sized for 100,000 QPS pushes CPU and queueing delays past client timeouts. The system drowns in work that completes too late to be useful, and goodput collapses: nearly <strong>all 150,000 QPS</strong> time out, not just the excess 50,000. <strong>Load Shedding</strong> intentionally rejects lower-priority traffic to ensure core operations complete successfully.</p>\n\n      <h2>Priority Ingress Tier with Load Shedding</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Ingress[\"Incoming Ingress Traffic (150% Capacity)\"] --> Detector{\"CPU > 85% or Queue Delay > 200ms?\"}\n    \n    Detector -->|\"No (Healthy)\"| ProcessAll[\"Process 100% of Traffic\"]\n    Detector -->|\"Yes (Overloaded)\"| PriorityRouter{\"Request Priority Class\"}\n    \n    PriorityRouter -->|\"Critical: Checkout / Write Mutations\"| Accept[\"Admit to Processing Pipeline\"]\n    PriorityRouter -->|\"Standard: Search / Product Browse\"| Degrade[\"Serve Stale Cache / Degraded View\"]\n    PriorityRouter -->|\"Low: Analytics / Background Crons / Bots\"| Drop[\"Drop with HTTP 503 Service Unavailable\"]\n      </div>\n\n      <h2>Under the Hood: Adaptive Concurrency Limits</h2>\n      <p>Static rate limits (e.g., max 10,000 requests/sec) fail because server capacity varies dynamically with garbage collection, cache hit ratios, and network latency. Netflix's open-source concurrency-limits library implements <strong>Adaptive Concurrency Limits</strong> based on TCP congestion-control ideas such as Vegas and on Little's Law (L = λ W). (Stripe's published approach instead combines rate limiters with priority-based load shedders.)</p>\n      <ul>\n        <li>The system continuously measures minimum round-trip time (minRTT) and current in-flight requests (L).</li>\n        <li>If observed latency increases while concurrency is climbing, queueing has begun.</li>\n        <li>The concurrency limit dynamically contracts, rejecting excess requests at the gateway boundary with <code>HTTP 503</code> (ideally with <code>Retry-After</code>; per-client quota violations use <code>429</code>) before server thread pools exhaust.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: goodput under overload</h2>\n<p>A service has 100 worker slots, each request needs 50 ms of work, and clients time out at 1 s. Capacity is therefore 100 / 0.05 = 2,000 requests per second.</p>\n<ul>\n<li><strong>Offered 3,000 per second, no shedding, unbounded queue:</strong> the queue grows by 1,000 per second. After a few seconds, queueing delay passes 1 s, so requests are served only after their client has already given up. The server stays 100% busy but goodput (successful, in-time responses) can fall toward zero. This is congestion collapse.</li>\n<li><strong>Offered 3,000 per second with a queue-time limit:</strong> reject any request that has waited more than, say, 200 ms, or cap in-flight plus queued work at about 400. Now roughly 2,000 per second succeed within the deadline and 1,000 per second get a fast 503. Goodput stays at capacity.</li>\n<li><strong>With priorities:</strong> if 30% of traffic is batch or prefetch requests, shedding those first means user-facing requests (2,100 per second) are almost all served.</li>\n</ul>\n<p>Little's law ties this together: in-flight requests = throughput x latency. At 2,000 per second and a 50 ms target, only about 100 requests should be in flight. A concurrency limit near that number is a direct way to protect latency.</p>\n<h2>Adaptive concurrency limits</h2>\n<p>Netflix's open-source concurrency-limits library adjusts the allowed in-flight count using ideas from TCP congestion control (for example Vegas and Gradient algorithms): it tracks the minimum observed latency as the no-queue baseline, and when measured latency rises above it, queueing has started and the limit is reduced; when latency is at the baseline, the limit probes upward. Requests over the limit are rejected immediately.</p>\n<h2>Strategy table</h2>\n<table>\n<thead><tr><th>Technique</th><th>What it protects</th><th>Trade-off</th></tr></thead>\n<tbody>\n<tr><td>Per-client rate limiting (token bucket)</td><td>Fairness between clients</td><td>Does not reflect the server's actual capacity</td></tr>\n<tr><td>Static concurrency limit</td><td>Worker pool and memory</td><td>Needs retuning as the service changes</td></tr>\n<tr><td>Adaptive concurrency limit</td><td>Latency near its no-queue baseline</td><td>Can oscillate; needs good latency signals</td></tr>\n<tr><td>Queue time deadline (drop requests that waited too long)</td><td>Wasted work on requests clients abandoned</td><td>Requires request arrival timestamps</td></tr>\n<tr><td>LIFO or CoDel-style queueing under overload</td><td>Fresh requests still succeed</td><td>Old requests starve</td></tr>\n<tr><td>Criticality-based shedding</td><td>Business-critical traffic</td><td>Requires tagging every request</td></tr>\n<tr><td>Degraded responses (cached or partial)</td><td>User experience</td><td>Stale or incomplete data</td></tr>\n</tbody>\n</table>\n<h2>Failure modes</h2>\n<ul>\n<li><strong>Expensive rejections:</strong> if rejecting still requires TLS handshake, logging and auth, a flood can overload the server anyway; shed as early as possible, even at the load balancer.</li>\n<li><strong>Health checks shed too:</strong> if health checks are rejected, the load balancer marks nodes unhealthy and sends even more traffic to the survivors. Exempt them.</li>\n<li><strong>Metastable states:</strong> retries and cold caches can keep the system overloaded after the trigger ends; combine shedding with retry budgets.</li>\n</ul>\n<h2>How real systems do it</h2>\n<p>Google tags RPCs with criticality levels (for example CRITICAL_PLUS, CRITICAL, SHEDDABLE_PLUS, SHEDDABLE), as described in the SRE book's chapter on handling overload. Amazon services reject excess work early and measure goodput separately from throughput. Facebook uses adaptive LIFO and CoDel-style queue management in its RPC servers so that under overload recent requests still succeed.</p>\n</div>",
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
        "title": "Stripe Engineering: Scaling your API with rate limiters",
        "url": "https://stripe.com/blog/rate-limiters"
      }
    ]
  }
};
