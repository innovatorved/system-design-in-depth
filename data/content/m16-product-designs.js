window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["design-products"] = {
  "notification-system-design": {
    "title": "Design: a notification system",
    "video": {
      "youtubeId": "jo6U429l3JM",
      "title": "1 TRILLION messages #javascript #python #web #coding #programming",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Problem Statement & Scale</h2>\n      <p>A modern notification system must reliably send millions of notifications per day across diverse channels: Apple Push Notification service (APNs), Firebase Cloud Messaging (FCM), SMS (via Twilio/Sinch), and Email (via SendGrid/Amazon SES). The primary challenges include handling massive traffic spikes (e.g., breaking news alerts to 50 million users), preventing duplicate sends, respecting user opt-out and quiet-hour rate limits, and guaranteeing high delivery rates with end-to-end telemetry.</p>\n\n      <h2>End-to-End Architecture</h2>\n      <p>Notifications should never be sent synchronously on user-facing API paths. The architecture relies on decoupled, prioritized event queues:</p>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Microservices / Events\"] --> Gateway[\"Notification API Service\"]\n    Gateway --> Dedup[\"Redis Deduplication & Rate Limiter\"]\n    Dedup --> DB[(\"User Prefs & Device DB\")]\n    Dedup --> Queue[\"Kafka / SQS Topics\"]\n    Queue --> P1[\"Critical / OTP Workers\"]\n    Queue --> P2[\"Transactional Workers\"]\n    Queue --> P3[\"Marketing / Bulk Workers\"]\n    P1 --> APNS[\"Apple APNs\"]\n    P1 --> FCM[\"Google FCM\"]\n    P2 --> Twilio[\"SMS Providers\"]\n    P3 --> SES[\"Email SES / SendGrid\"]\n    APNS & FCM & Twilio & SES --> Feedback[\"Delivery Status Webhooks\"]\n    Feedback --> Analytics[(\"ClickHouse / Metrics\")]\n      </div>\n\n      <h2>Key Architectural Components</h2>\n      <ul>\n        <li><strong>API Gateway & Validation:</strong> Authenticates microservices, validates payload schemas, and issues a tracking <code>notification_id</code>.</li>\n        <li><strong>Deduplication Cache:</strong> Computes a hash of <code>userId + notificationType + idempotencyKey</code> in Redis with an expiration window (e.g., 5 minutes) to avoid sending duplicate push alerts or charging customers twice for OTP messages.</li>\n        <li><strong>User Preference & Device Token Store:</strong> Stores multi-device tokens per user (iOS, Android, Web), timezone, language preferences, and opt-out flags. Device tokens that return <code>InvalidToken</code> or <code>Unregistered</code> errors from APNs/FCM are flagged and pruned asynchronously.</li>\n        <li><strong>Priority Queuing:</strong> Separates OTP/account alerts (Priority 1) from transactional updates (Priority 2) and bulk marketing campaigns (Priority 3). Bulk notifications must never starve real-time password resets.</li>\n        <li><strong>Rate Limiting & Fatigue Control:</strong> Enforces frequency capping (e.g., at most 3 push notifications per user per hour) to prevent app uninstalls caused by notification spam.</li>\n      </ul>\n\n      <h2>Retry, Dead-Letter Queues & Fallbacks</h2>\n      <p>External gateway providers experience intermittent outages. Workers employ exponential backoff with jitter for transient errors (HTTP 429, 500, network timeouts). Non-retryable errors (e.g., invalid phone number) are routed directly to a Dead-Letter Queue (DLQ) for alerting. If a primary SMS vendor fails, traffic automatically fails over to a secondary provider.</p>\n    </div>",
    "keyTakeaways": [
      "Always decouple notification creation from delivery using message queues (Kafka/SQS).",
      "Prioritize queues: critical OTP messages must never be blocked by batch marketing pushes.",
      "Implement idempotent deduplication with Redis to avoid sending duplicate alerts on retries.",
      "Actively clean invalid device tokens reported by APNs and FCM webhooks."
    ],
    "furtherReading": [
      {
        "title": "Firebase Cloud Messaging Architectural Overview",
        "url": "https://firebase.google.com/docs/cloud-messaging"
      },
      {
        "title": "Apple Push Notification service (APNs)",
        "url": "https://developer.apple.com/documentation/usernotifications"
      }
    ]
  },
  "ticket-booking-system-design": {
    "title": "Design: a ticket booking system",
    "video": {
      "youtubeId": "SR3_Z1GsRIw",
      "title": "A Deep Dive into Database Locking || Developers Coffee",
      "channel": "Uday Chauhan"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Core Challenge: Concurrency & Hot Spots</h2>\n      <p>Designing a high-concurrency ticket reservation platform like Ticketmaster or BookMyShow revolves around a single critical invariant: <strong>a seat must never be double-booked</strong>, even when hundreds of thousands of users attempt to purchase tickets for the same concert within seconds. At the same time, holding a seat during checkout requires a temporary reservation with an automatic timeout if payment is not completed.</p>\n\n      <h2>Reservation State Lifecycle</h2>\n      <div class=\"mermaid\">\nstateDiagram-v2\n    [*] --> Available: Event Announced\n    Available --> Held: User selects seat (10 min TTL)\n    Held --> Available: TTL expires / User cancels\n    Held --> Booked: Payment Confirmed (Atomic)\n    Booked --> [*]\n      </div>\n\n      <h2>Architectural Strategy</h2>\n      <ul>\n        <li><strong>Distributed Virtual Waiting Room:</strong> When traffic exceeds venue capacity, users are assigned a position in a distributed queue (using Cloudflare Waiting Room or Redis sorted sets) before accessing the seat selection map.</li>\n        <li><strong>Temporary Seat Hold:</strong> Give each hold a unique token, owner, and authoritative expiry. Redis may accelerate reads or expiry notifications, but a separately expiring Redis key must not be the only proof that SQL is allowed to book the seat.</li>\n        <li><strong>Database Isolation & ACID Guarantees:</strong> The authoritative conditional transition verifies the same hold token, owner, state, and unexpired deadline in an ACID-compliant database. Row-level locking or optimistic concurrency can serialize competing transitions:\n          <pre><code>UPDATE seats SET status = 'BOOKED', user_id = :userId, version = version + 1 \nWHERE seat_id = :seatId AND status = 'HELD' AND hold_token = :holdToken\n  AND hold_expires_at > CURRENT_TIMESTAMP AND version = :currentVersion;</code></pre>\n        </li>\n        <li><strong>Read Scaling with In-Memory Caches:</strong> High-volume reads of the seating chart are served from Redis bitsets or memory-cached floor plans, while write traffic routes directly through the transactional reservation service.</li>\n      </ul>\n\n      <h2>Payment Reconciliation & Webhook Callbacks</h2>\n      <p>Payment processing is asynchronous, so signed callbacks can be duplicated, delayed, or reordered. If buyer A's hold expires, buyer B may acquire the seat before A's success callback arrives. The callback must idempotently attempt the token-bound booking transition; if it loses, record the payment as unmatched and run an explicit void/refund workflow with reconciliation rather than issuing two tickets or assuming an immediate refund always succeeds.</p>\n    </div>",
    "keyTakeaways": [
      "Keep hold token, owner, and expiry in the authoritative conditional booking transition; use Redis only as a cache or accelerator unless it shares that authority safely.",
      "Deploy a virtual waiting room in front of checkout to flatten extreme traffic spikes.",
      "Use optimistic locking or atomic compare-and-swap to prevent race conditions during seat claims.",
      "Implement automated reconciliation for out-of-order or delayed payment gateway callbacks."
    ],
    "furtherReading": [
      {
        "title": "Martin Fowler: Optimistic Offline Lock Pattern",
        "url": "https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html"
      },
      {
        "title": "High-concurrency ticket booking architecture patterns",
        "url": "https://aws.amazon.com/blogs/architecture/"
      }
    ]
  },
  "payment-system-design": {
    "title": "Design: a payment system",
    "video": {
      "youtubeId": "olfaBgJrUBI",
      "title": "Design a Payment System - System Design Interview",
      "channel": "Code with Lucian"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Foundational Requirements: Idempotent Operations & Double-Entry</h2>\n      <p>Financial systems operate under zero-tolerance constraints for data loss or incorrect balances. A production payment system must guarantee:</p>\n      <ul>\n        <li><strong>Idempotency:</strong> Retries of one intended payment use the same operation key and payload. Local uniqueness prevents duplicate local operations; preventing duplicate external charges additionally depends on the PSP's idempotency contract and reconciliation.</li>\n        <li><strong>Double-Entry Bookkeeping:</strong> Every financial transaction must record equal and offsetting debits and credits across balance sheet accounts. Money is never created or destroyed; money only moves between accounts.</li>\n        <li><strong>Auditability & Immutability:</strong> Ledger entries are append-only. Mistakes are corrected by recording reversing journal entries, never by mutating or deleting past records.</li>\n      </ul>\n\n      <h2>Payment Flow Architecture</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Buyer[\"Buyer App\"] --> PayAPI[\"Payment Service\"]\n    PayAPI --> Idemp[\"Idempotency Check\"]\n    Idemp --> PSP[\"Payment Service Provider: Stripe / Adyen\"]\n    PSP --> PayAPI\n    PayAPI --> Ledger[(\"Double-Entry Ledger DB\")]\n    PayAPI --> Rec[\"Reconciliation Engine\"]\n    BankSettlement[\"Bank Settlement Files\"] --> Rec\n      </div>\n\n      <h2>Idempotency Execution Pattern</h2>\n      <p>Clients generate a cryptographically unique <code>Idempotency-Key</code> (UUID v4) for every checkout attempt. When the request reaches the payment gateway:</p>\n      <ol>\n        <li>An atomic database transaction creates a payment record in <code>PENDING</code> status indexed by the idempotency key. If a row already exists, the gateway returns the existing status without charging again.</li>\n        <li>After committing the local operation, the service calls the PSP with the same stable key and frozen payload. It does not hold a database transaction open across the network call.</li>\n        <li>If authorization is confirmed, a local transaction records <code>SUCCEEDED</code> and the corresponding ledger rows. If the call times out, retain <code>UNKNOWN</code>: the PSP may have charged the customer even though no reply arrived. Recover by repeating the identical provider operation where its contract permits, querying provider state, processing signed webhooks idempotently, and reconciling settlement data.</li>\n      </ol>\n\n      <h2>Nightly Reconciliation & Settlement</h2>\n      <p>External PSPs and acquiring banks transmit end-of-day settlement batch files. The internal <strong>Reconciliation Engine</strong> matches internal ledger journal entries against the bank statement transactions. Any discrepancy (missed charge, chargeback, foreign exchange difference) triggers automated alerting and dispute queues for accounting review.</p>\n    </div>",
    "keyTakeaways": [
      "Every financial mutation must use double-entry ledger mechanics: Sum(Debits) == Sum(Credits).",
      "Use stable operation identities end to end, but verify each external provider's idempotency window and changed-payload behavior.",
      "Never mutate ledger records; use compensating transactions to correct errors.",
      "Asynchronous nightly reconciliation is required to verify internal records against external bank settlement files."
    ],
    "furtherReading": [
      {
        "title": "Stripe Engineering: Designing Robust and Idempotent APIs",
        "url": "https://stripe.com/blog/idempotency"
      },
      {
        "title": "Double-Entry Bookkeeping Principles for Engineers",
        "url": "https://en.wikipedia.org/wiki/Double-entry_bookkeeping"
      }
    ]
  },
  "search-engine-system-design": {
    "title": "Design: a search service",
    "video": {
      "youtubeId": "HTF7wY-Rcyc",
      "title": "System Design: Autocomplete in 100 Milliseconds",
      "channel": "Learning Podcasts"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Search Service Architecture Overview</h2>\n      <p>A production search service (like Elasticsearch, Solr, or internal enterprise search) consists of two decoupled subsystems: the <strong>Write/Indexing Pipeline</strong> and the <strong>Read/Query & Ranking Engine</strong>. The goal is to ingest documents, extract terms, compute relevance, and serve full-text queries in under 50 milliseconds across billions of documents.</p>\n\n      <h2>Indexing & Query Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Doc[\"Raw Documents / Database\"] --> Parser[\"Text Tokenizer & Stemmer\"]\n    Parser --> InvertedIndex[(\"Inverted Index & Posting Lists\")]\n    Client[\"Search Query\"] --> QParser[\"Query Analyzer\"]\n    QParser --> Coordinator[\"Search Coordinator Node\"]\n    Coordinator --> S1[\"Shard 1\"]\n    Coordinator --> S2[\"Shard 2\"]\n    Coordinator --> S3[\"Shard 3\"]\n    S1 & S2 & S3 --> Aggregator[\"Merge & BM25 Scoring\"]\n    Aggregator --> Ranking[\"ML Re-ranking / Personalization\"]\n    Ranking --> Response[\"Top K Results\"]\n      </div>\n\n      <h2>Inverted Index & Posting Lists</h2>\n      <p>Rather than scanning records sequentially, search engines build an inverted index mapping each tokenized word to a sorted list of document IDs (called a <strong>posting list</strong>):</p>\n      <pre><code>\"distributed\" -> [Doc1, Doc4, Doc12, Doc98]\n\"systems\"     -> [Doc2, Doc4, Doc15, Doc98]</code></pre>\n      <p>Boolean conjunction queries (<code>distributed AND systems</code>) intersect sorted posting lists in $O(N + M)$ time using skip lists or bitset operations.</p>\n\n      <h2>Relevance Scoring: BM25</h2>\n      <p>Relevance ranking evaluates how well a document matches a query based on Best Matching 25 (BM25), balancing:</p>\n      <ul>\n        <li><strong>Term Frequency (TF):</strong> How often the term appears in the document (with diminishing returns).</li>\n        <li><strong>Inverse Document Frequency (IDF):</strong> How rare the term is across the entire corpus (common words like \"the\" receive low weight).</li>\n        <li><strong>Field-Length Normalization:</strong> Matches in shorter documents are penalized less than matches in lengthy texts.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Decouple the asynchronous indexing pipeline from the read/query coordinator tier.",
      "An inverted index with sorted posting lists powers sub-50ms multi-term queries.",
      "BM25 scoring combines term frequency, inverse document frequency, and length normalization.",
      "Shard indexes by document ID and use scatter-gather coordinator nodes to query shards in parallel."
    ],
    "furtherReading": [
      {
        "title": "Information Retrieval & BM25 Formulation",
        "url": "https://en.wikipedia.org/wiki/Okapi_BM25"
      },
      {
        "title": "Elasticsearch: From the Bottom Up",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html"
      }
    ]
  },
  "recommendation-system-design": {
    "title": "Design: a recommendation system",
    "video": {
      "youtubeId": "Eeg1DEeWUjA",
      "title": "Recommender Systems",
      "channel": "CS50"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Two-Stage Recommendation Funnel</h2>\n      <p>Large-scale recommendation platforms (YouTube, Netflix, TikTok, Instagram) cannot run complex deep learning models over their entire catalog of millions of items in real time. Instead, industry systems use a multi-stage funnel:</p>\n\n      <div class=\"mermaid\">\nflowchart TD\n    Corpus[\"Entire Catalog: 10M+ Items\"] --> CandGen[\"Candidate Generation / Retrieval: Top 1,000\"]\n    CandGen --> Filtering[\"Hard Filters: Geo, Language, Watched\"]\n    Filtering --> Ranking[\"Heavy ML Scoring / Ranking: Top 50\"]\n    Ranking --> ReRank[\"Diversity, Freshness & Business Rules: Top 10\"]\n    ReRank --> User[\"User Feed\"]\n      </div>\n\n      <h2>Candidate Generation (Fast Retrieval)</h2>\n      <p>Reduces the candidate pool from millions down to hundreds using lightweight retrieval models:</p>\n      <ul>\n        <li><strong>Vector Embeddings & Approximate Nearest Neighbors (ANN):</strong> User history and items are mapped into dense vector spaces (using two-tower neural networks). High-speed vector indexes (Faiss, HNSW, Milvus) retrieve the top $K$ nearest items in low single-digit milliseconds.</li>\n        <li><strong>Collaborative Filtering & Graph Walk:</strong> Recommends items interacted with by users with similar historical engagement patterns.</li>\n      </ul>\n\n      <h2>Deep Ranking & Scoring</h2>\n      <p>The candidate set passes to a heavier ranking model that evaluates hundreds of real-time features: user demographics, current device, time of day, context, and explicit interaction history. The model predicts probabilities of engagement: $P(\text{Click})$, $P(\text{WatchTime} > 30s)$, and $P(\text{Like})$.</p>\n\n      <h2>Exploration vs. Exploitation</h2>\n      <p>A pure exploitation model traps users in filter bubbles. Production architectures introduce multi-armed bandit algorithms (e.g., Thompson Sampling or Upper Confidence Bound) to blend new or unrated content into the feed to gather engagement data.</p>\n    </div>",
    "keyTakeaways": [
      "Structure recommendations as a funnel: Candidate Generation (Retrieval) -> Scoring (Ranking) -> Diversity Re-ranking.",
      "Use vector embeddings with Approximate Nearest Neighbor (ANN) search for millisecond candidate retrieval.",
      "Balance exploitation of known interests with exploration of new content using multi-armed bandits.",
      "Incorporate real-time context (time of day, network speed, battery level) into ranking layers."
    ],
    "furtherReading": [
      {
        "title": "Deep Neural Networks for YouTube Recommendations (Covington et al.)",
        "url": "https://research.google/pubs/pub45530/"
      },
      {
        "title": "Faiss: A Library for Efficient Similarity Search",
        "url": "https://github.com/facebookresearch/faiss"
      }
    ]
  },
  "chat-and-messaging-system-design": {
    "title": "Design: chat and messaging",
    "video": {
      "youtubeId": "cr6p0n0N-VA",
      "title": "Design Whatsapp: System Design Interview w/ a Ex-Meta Senior Manager",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Key Functional Requirements</h2>\n      <p>A massive chat system (like WhatsApp, Discord, or Slack) must deliver 1-on-1 and group messages with sub-second latency, support offline delivery, provide accurate delivery receipts (Sent, Delivered, Read), and handle bidirectional connections at scale.</p>\n\n      <h2>Connection Management Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    UserA[\"User A Phone\"] <-->|WebSocket| ConnServer[\"Gateway / Connection Manager\"]\n    ConnServer <--> Presence[\"Presence Service & Redis Cluster\"]\n    ConnServer --> MessageRouter[\"Message Routing Service\"]\n    MessageRouter --> MessageStore[(\"NoSQL Message Store: Cassandra / ScyllaDB\")]\n    MessageRouter --> UserBOnline{\"Is User B Online?\"}\n    UserBOnline -->|Yes| ConnServerB[\"Connection Manager B\"]\n    ConnServerB <-->|WebSocket| UserB[\"User B Phone\"]\n    UserBOnline -->|No| PushQueue[\"Push Notification Queue\"]\n    PushQueue --> APNS_FCM[\"APNs / FCM\"]\n      </div>\n\n      <h2>Stateful WebSockets & Gateway Tier</h2>\n      <p>HTTP polling introduces unacceptable overhead. Clients maintain persistent, stateful WebSocket or TCP connections. A centralized <strong>Connection Registry</strong> (often implemented using Redis or distributed hash tables) maps each <code>userId</code> to the specific gateway server IP currently hosting their active socket connection.</p>\n\n      <h2>Handling Offline Messages</h2>\n      <p>When User A sends a message to User B:</p>\n      <ol>\n        <li>The Message Router writes the message to an append-optimized distributed store (such as Cassandra or ScyllaDB) with an auto-incrementing monotonic sequence ID per conversation.</li>\n        <li>The router checks the connection registry. If User B is offline, the message is queued for offline delivery and a push notification is dispatched via APNs/FCM.</li>\n        <li>When User B reconnects, their client sends their last received message ID; the gateway queries the store for all subsequent messages and synchronizes them in order.</li>\n      </ol>\n\n      <h2>Group Chat Scaling: Fan-out Strategy</h2>\n      <p>For small group chats (e.g., up to 256 members in WhatsApp), the message router fans out a copy to each recipient's inbox queue. For large group channels (e.g., 100,000 members in Discord), fan-out-on-write is too expensive; instead, channels use shared pub/sub event streams where clients pull from a single channel partition.</p>\n    </div>",
    "keyTakeaways": [
      "Maintain persistent stateful WebSocket connections for low-latency bidirectional message delivery.",
      "Store connection location metadata (User -> Gateway Server IP) in a centralized, low-latency Redis cluster.",
      "Persist messages in append-optimized wide-column databases (Cassandra/ScyllaDB) partitioned by chat/channel ID.",
      "Use fan-out-on-write for personal and small group chats; use pub/sub channels for massive group rooms."
    ],
    "furtherReading": [
      {
        "title": "How Discord Stores Billions of Messages",
        "url": "https://discord.com/blog/how-discord-stores-billions-of-messages"
      },
      {
        "title": "WhatsApp Architecture Breakdown",
        "url": "https://highscalability.com/the-whatsapp-architecture-facebook-bought-for-19-billion/"
      }
    ]
  },
  "social-feed-system-design-case-study": {
    "title": "Design: a social feed",
    "video": {
      "youtubeId": "Nfa-uUHuFHg",
      "title": "System Design Interview Walkthrough: Design Twitter",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Core Architectural Dilemma: Fan-out on Write vs. Fan-out on Read</h2>\n      <p>When designing news feeds (Twitter/X, Facebook, LinkedIn), the fundamental architectural choice is how and when to assemble the timeline for each user.</p>\n\n      <div class=\"mermaid\">\nflowchart TD\n    Author[\"Author Posts Tweet\"] --> Router{\"Fan-out Strategy\"}\n    Router -->|Regular User| FanoutWrite[\"Fan-out on Write: Push to all followers' timeline caches\"]\n    Router -->|Celebrity / High Follower| FanoutRead[\"Fan-out on Read: Store in author's tweet list only\"]\n    FanoutWrite --> Cache[(\"Redis Timeline Caches\")]\n    Consumer[\"User opens feed\"] --> Merge[\"Timeline Merger Service\"]\n    Cache --> Merge\n    FanoutRead --> Merge\n    Merge --> Feed[\"Ranked Home Feed\"]\n      </div>\n\n      <h2>Fan-out on Write (Push Model)</h2>\n      <p>When a user posts a status update, a background worker looks up all followers and immediately injects the post ID into each follower's pre-computed in-memory feed cache (e.g., Redis List or sorted set):</p>\n      <ul>\n        <li><strong>Pros:</strong> Generating the timeline when a user opens the app is virtually instant ($O(1)$ read from Redis cache).</li>\n        <li><strong>Cons:</strong> Severe write amplification. If a celebrity with 80 million followers posts, the system must perform 80 million cache writes, overloading background queues.</li>\n      </ul>\n\n      <h2>Fan-out on Read (Pull Model)</h2>\n      <p>Posts are only written to the author's own timeline. When a follower opens their home feed, the system queries the latest posts of everyone they follow and merges them dynamically:</p>\n      <ul>\n        <li><strong>Pros:</strong> Writes are constant time $O(1)$. No write amplification for celebrities.</li>\n        <li><strong>Cons:</strong> Read latency is high; fetching and merging posts from hundreds of followed accounts on every feed refresh causes database and CPU bottlenecks.</li>\n      </ul>\n\n      <h2>The Production Hybrid Solution</h2>\n      <p>Modern social networks implement a <strong>hybrid fan-out</strong> model:</p>\n      <ul>\n        <li>Standard users (e.g., &lt; 25,000 followers) use <strong>Fan-out on Write</strong>, pre-populating followers' Redis feeds.</li>\n        <li>Celebrity accounts (e.g., &gt; 25,000 followers) bypass fan-out on write. Instead, when a follower views their feed, the system fetches the celebrity's recent posts and merges them into the cached timeline in real time.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Understand the classic trade-off: Fan-out on Write (fast reads, heavy writes) vs Fan-out on Read (fast writes, slow reads).",
      "Employ a hybrid approach: push regular user updates to followers' Redis caches, but pull celebrity updates dynamically on read.",
      "Cap pre-computed timeline lengths (e.g., latest 800 tweet IDs) to control cache memory footprint.",
      "Store only post IDs in timeline caches and hydrate post text, images, and user profiles in a single batched multi-get."
    ],
    "furtherReading": [
      {
        "title": "Twitter Timeline at Scale",
        "url": "https://blog.x.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale"
      },
      {
        "title": "Building the Facebook News Feed",
        "url": "https://engineering.fb.com/"
      }
    ]
  },
  "geospatial-nearby-search-case-study": {
    "title": "Design: nearby search",
    "video": {
      "youtubeId": "ENbivJwB3BY",
      "title": "Designing Location-Based Systems | Geohashing vs Quadtrees Explained for Engineers",
      "channel": "Ultimate System Design"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Two-Dimensional Spatial Indexing Problem</h2>\n      <p>Two independent scalar B-tree indexes do not directly provide a nearest-neighbor search. An unindexed latitude/longitude bounding-box query may scan many rows, while databases with GiST, R-tree, geography, or other spatial indexes can serve this workload efficiently. The design choice is between those native spatial capabilities and an application-managed cell index—not SQL versus indexing.</p>\n\n      <h2>Spatial Indexing Strategies</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Coordinates[\"Latitude & Longitude\"] --> Choice{\"Indexing Algorithm\"}\n    Choice --> Geohash[\"Geohash: Base32 Z-order curve strings\"]\n    Choice --> QuadTree[\"QuadTree: Hierarchical 4-quadrant tree in memory\"]\n    Choice --> Cells[\"S2 quadrilateral cells / H3 mostly hexagonal cells\"]\n    Geohash --> KeyValue[(\"Redis Sorted Sets / NoSQL Prefix Query\")]\n    Cells --> Candidates[(\"Neighbor cells + exact distance filter\")]\n      </div>\n\n      <h2>Geohash & Peano Space-Filling Curves</h2>\n      <p>Geohashing recursively subdivides the globe into a grid and maps 2D coordinates into a 1D alphanumeric string using a Z-order space-filling curve. Locations sharing the same prefix are geographically proximate:</p>\n      <ul>\n        <li>Precision 5: ~4.9 km × 4.9 km cell (city district scale)</li>\n        <li>Precision 6: ~1.2 km × 0.6 km cell (neighborhood scale)</li>\n        <li>Precision 7: ~152 m × 152 m cell (street block scale)</li>\n      </ul>\n      <p>To find places within 1 kilometer, cover the search circle with every cell it intersects at the chosen precision, query those cells, and apply an exact spherical-distance filter. Center plus eight neighbors is a useful small-grid example, not a universal guarantee: geohash cell dimensions vary with precision and latitude, and a radius can span more cells.</p>\n\n      <h2>Dynamic Drivers vs. Static Places</h2>\n      <p>For static places (restaurants, ATMs in Yelp/Google Places), data is indexed into Geohash or QuadTree shards and heavily cached. For dynamic moving objects (Uber/Lyft drivers updating coordinates every 4 seconds), coordinates are written to an in-memory spatial index (like Redis Geospatial commands backed by sorted sets) to prevent database write saturation.</p>\n    </div>",
    "keyTakeaways": [
      "Avoid unindexed 2D scans; use a database spatial index or a cell-based index selected for the query and update workload.",
      "Geohash converts 2D coordinates into 1D prefix-searchable strings using Z-order curves.",
      "Cover all cells intersecting the requested radius, then exact-distance filter candidates; eight neighbors are not sufficient for every radius, precision, or latitude.",
      "Decouple high-frequency moving objects (drivers) in Redis Geospatial from static location catalogs (restaurants)."
    ],
    "furtherReading": [
      {
        "title": "Geohash Exploration & Visualizer",
        "url": "https://geohash.softeng.co/"
      },
      {
        "title": "Uber H3: A Hexagonal Hierarchical Spatial Index",
        "url": "https://www.uber.com/blog/h3/"
      }
    ]
  }
};
