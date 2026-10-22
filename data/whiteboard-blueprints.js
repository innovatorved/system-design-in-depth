/**
 * System Design in Depth — Interactive Whiteboard & Capacity Sandbox Dataset
 * Contains:
 * - 12 Architectural Building Blocks
 * - 4 Reference Blueprints (URL Shortener, Twitter Feed, WhatsApp Chat, Stripe Ledger)
 * - Complete Capacity Estimation Engine with Bottleneck Detection
 */
(function(root) {
  'use strict';

  // ── 12 Architectural Building Blocks ─────────────────────────────
  var BUILDING_BLOCKS = [
    {
      type: 'Client',
      name: 'Client Application',
      category: 'compute',
      badge: 'Edge / Device',
      icon: 'smartphone',
      color: '#3291ff',
      description: 'Web browsers, mobile apps (iOS/Android), and IoT edge clients emitting HTTPS/WSS requests.',
      defaultConfig: {
        concurrentConnections: 100000,
        keepAlive: true,
        protocol: 'HTTP/3'
      }
    },
    {
      type: 'CDN',
      name: 'Edge CDN (Cloudflare / CloudFront)',
      category: 'network',
      badge: 'Edge Network',
      icon: 'globe',
      color: '#0070f3',
      description: 'Anycast geographically distributed Points of Presence (PoPs) caching static assets, video segments, and API responses.',
      defaultConfig: {
        cacheHitRate: 0.90,
        maxBandwidthGbps: 100,
        edgeTtlSeconds: 86400
      }
    },
    {
      type: 'APIGateway',
      name: 'API Gateway / Rate Limiter',
      category: 'network',
      badge: 'Security & Routing',
      icon: 'shield',
      color: '#7928ca',
      description: 'Entry point handling TLS termination, JWT authentication, token-bucket rate limiting, and request routing.',
      defaultConfig: {
        maxRpsPerInstance: 25000,
        rateLimitPerUserRps: 100,
        circuitBreakerEnabled: true
      }
    },
    {
      type: 'L4LB',
      name: 'L4 Load Balancer (Maglev / IPVS)',
      category: 'network',
      badge: 'High-Throughput LB',
      icon: 'shuffle',
      color: '#00df8f',
      description: 'Layer-4 transport-level load balancer performing ECMP Anycast hashing at wire speed (millions of SYN packets/sec).',
      defaultConfig: {
        algorithm: 'consistent-hashing',
        maxPacketsPerSec: 10000000,
        healthCheckIntervalMs: 1000
      }
    },
    {
      type: 'L7LB',
      name: 'L7 Load Balancer (Envoy / NGINX)',
      category: 'network',
      badge: 'Reverse Proxy',
      icon: 'layers',
      color: '#f5a623',
      description: 'Layer-7 reverse proxy with path-based routing, gRPC multiplexing, connection pooling, and Canary traffic splitting.',
      defaultConfig: {
        maxConcurrentConns: 50000,
        timeoutMs: 3000,
        keepAliveTimeoutMs: 65000
      }
    },
    {
      type: 'Microservice',
      name: 'Stateless Application Service',
      category: 'compute',
      badge: 'Business Logic',
      icon: 'cpu',
      color: '#50e3c2',
      description: 'Containerized microservice instances running stateless business logic, autoscale-managed by Kubernetes.',
      defaultConfig: {
        instances: 10,
        maxRpsPerPod: 1500,
        cpuCores: 4,
        memoryGb: 8
      }
    },
    {
      type: 'RedisCache',
      name: 'Redis In-Memory Distributed Cache',
      category: 'cache',
      badge: 'Sub-millisecond State',
      icon: 'zap',
      color: '#ff0080',
      description: 'In-memory key-value cluster with Redis Cluster sharding, LRU eviction, pub/sub, and atomic counters.',
      defaultConfig: {
        nodes: 6,
        memoryPerNodeGb: 32,
        hitRate: 0.85,
        evictionPolicy: 'allkeys-lru'
      }
    },
    {
      type: 'KafkaQueue',
      name: 'Apache Kafka / Redpanda Event Bus',
      category: 'queue',
      badge: 'Event Streaming',
      icon: 'fast-forward',
      color: '#ff4d4f',
      description: 'Distributed append-only commit log with consumer groups, persistent partitioning, and at-least-once / exactly-once delivery.',
      defaultConfig: {
        partitions: 64,
        retentionHours: 72,
        replicationFactor: 3,
        brokerCount: 6
      }
    },
    {
      type: 'SQLShard',
      name: 'Relational Sharded DB (PostgreSQL / Vitess)',
      category: 'storage',
      badge: 'ACID Transactions',
      icon: 'database',
      color: '#3291ff',
      description: 'Horizontally sharded relational cluster with primary-replica read replicas, strict schema validation, and 2PC support.',
      defaultConfig: {
        shards: 16,
        replicasPerShard: 2,
        maxConnectionsPerShard: 500,
        storagePerShardTb: 4
      }
    },
    {
      type: 'NoSQLKV',
      name: 'Distributed NoSQL Store (DynamoDB / ScyllaDB)',
      category: 'storage',
      badge: 'Horizontal Scale',
      icon: 'server',
      color: '#7928ca',
      description: 'Wide-column masterless distributed store sharded by partition hash key with tunable consistency (QUORUM / LOCAL_QUORUM).',
      defaultConfig: {
        nodeCount: 12,
        readConsistency: 'LOCAL_QUORUM',
        writeConsistency: 'LOCAL_QUORUM',
        replicationFactor: 3
      }
    },
    {
      type: 'ObjectStorage',
      name: 'Blob / Object Storage (S3 / Cloud Storage)',
      category: 'storage',
      badge: 'Infinite Blobs',
      icon: 'box',
      color: '#79ffe1',
      description: 'Durable 99.999999999% (11 nines) object store with pre-signed URLs, multi-part uploads, and automatic lifecycle tiering.',
      defaultConfig: {
        storageClass: 'STANDARD',
        lifecycleTieringDays: 90,
        multipartChunkSizeMb: 16
      }
    },
    {
      type: 'WorkerPool',
      name: 'Asynchronous Background Worker Pool',
      category: 'compute',
      badge: 'Async Processing',
      icon: 'tool',
      color: '#f5a623',
      description: 'Autoscaling asynchronous compute pool pulling heavy computational tasks (video transcoding, report exports, webhooks) from queues.',
      defaultConfig: {
        concurrencyPerPod: 20,
        maxRetries: 3,
        deadLetterQueueEnabled: true
      }
    }
  ];

  // ── 10 Production Reference Blueprints ───────────────────────────
  var BLUEPRINTS = [
    // 1. Scalable URL Shortener
    {
      id: 'url-shortener',
      title: 'Scalable URL Shortener (Bitly Architecture)',
      subtitle: 'Read-heavy Base62 token redirector with multi-tier edge & Redis caching',
      category: 'Foundations',
      difficulty: 'Intermediate',
      targetQps: 50000,
      targetLatencyMs: 15,
      description: 'High read-to-write ratio (100:1) link redirector with Base62 tokenization, Redis caching, and asynchronous clickstream analytics.',
      relatedSlugs: ["url-shortener-system-design","url-shortener-at-scale","consistent-hashing"],
      requirements: [
        '301/302 redirect p99 latency under 15ms at 50k QPS',
        'Collision-free 7-character Base62 short code generation',
        'Asynchronous clickstream telemetry without blocking redirects'
      ],
      defaultInputs: {
        qps: 50000,
        readWriteRatio: 100,
        avgReadPayloadBytes: 256,
        avgWritePayloadBytes: 512,
        cacheHitRate: 0.90,
        storageRetentionDays: 1825, // 5 years
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'Web / Mobile Clients', x: 60, y: 170, replicas: 1, instances: 1 },
        { id: 'n-cdn', type: 'CDN', name: 'Global CDN Edge', x: 250, y: 170, replicas: 2, instances: 2 },
        { id: 'n-gateway', type: 'APIGateway', name: 'API Gateway & Rate Limiter', x: 440, y: 170, replicas: 4, instances: 4 },
        { id: 'n-redirect-svc', type: 'Microservice', name: 'Redirect Service (Stateless)', x: 650, y: 100, replicas: 12, instances: 12 },
        { id: 'n-create-svc', type: 'Microservice', name: 'Link Creation Service', x: 650, y: 250, replicas: 4, instances: 4 },
        { id: 'n-redis', type: 'RedisCache', name: 'Redis Cache (Popular URLs)', x: 880, y: 80, replicas: 6, instances: 6 },
        { id: 'n-sql', type: 'SQLShard', name: 'URL Mappings DB (PostgreSQL)', x: 880, y: 220, replicas: 16, instances: 16 },
        { id: 'n-kafka', type: 'KafkaQueue', name: 'Click Events Stream', x: 880, y: 360, replicas: 6, instances: 6 },
        { id: 'n-analytics-worker', type: 'WorkerPool', name: 'Analytics Aggregation Workers', x: 1080, y: 360, replicas: 8, instances: 8 }
      ],
      frames: [
        { id: 'f-edge', label: 'Edge & Ingress Tier', x: 40, y: 120, width: 575, height: 150 },
        { id: 'f-compute', label: 'Stateless Compute (K8s)', x: 630, y: 55, width: 195, height: 285 },
        { id: 'f-data', label: 'State, Cache & Async Pipeline', x: 855, y: 40, width: 395, height: 405 }
      ],
      notes: [
        { id: 'note-1', text: 'SLO: 301/302 Redirect p99 < 15ms\n90% served via Redis + CDN Edge', x: 60, y: 310 }
      ],
      connections: [
        { from: 'n-client', to: 'n-cdn', label: 'HTTP GET /:shortCode' },
        { from: 'n-cdn', to: 'n-gateway', label: 'Cache Miss' },
        { from: 'n-gateway', to: 'n-redirect-svc', label: 'Route GET' },
        { from: 'n-gateway', to: 'n-create-svc', label: 'Route POST /shorten' },
        { from: 'n-redirect-svc', to: 'n-redis', label: 'L1 Cache Lookup' },
        { from: 'n-redirect-svc', to: 'n-sql', label: 'DB Lookup (Miss)' },
        { from: 'n-create-svc', to: 'n-sql', label: 'Store Mapping (Base62)' },
        { from: 'n-create-svc', to: 'n-redis', label: 'Warm Cache' },
        { from: 'n-redirect-svc', to: 'n-kafka', label: 'Async Click Event' },
        { from: 'n-kafka', to: 'n-analytics-worker', label: 'Consume Clickstream' }
      ]
    },

    // 2. Twitter / Social Feed Architecture
    {
      id: 'twitter-feed',
      title: 'Twitter / Social Feed Architecture',
      subtitle: 'Hybrid push/pull timeline fanout with Redis ZSET inboxes and ScyllaDB',
      category: 'Social & Feed Systems',
      difficulty: 'Advanced',
      targetQps: 150000,
      targetLatencyMs: 50,
      description: 'Hybrid fanout system (fanout-on-write for standard users, fanout-on-read for celebrities) with timeline Redis caches and ScyllaDB.',
      relatedSlugs: ["social-feed-system-design-case-study","feed-generation-push-pull-hybrid","fanout-patterns","caching-layers"],
      requirements: [
        'Hybrid fanout: push to Redis for <50k followers, merge on read for celebrities',
        'Sub-50ms home timeline assembly across 800 cached Tweet IDs',
        'Media blob offload via S3 + CDN pre-signed uploads'
      ],
      defaultInputs: {
        qps: 150000,
        readWriteRatio: 80,
        avgReadPayloadBytes: 2048,
        avgWritePayloadBytes: 1024,
        cacheHitRate: 0.92,
        storageRetentionDays: 730,
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'Mobile / Web Clients', x: 50, y: 180, replicas: 1, instances: 1 },
        { id: 'n-l4lb', type: 'L4LB', name: 'L4 Anycast Load Balancer', x: 220, y: 180, replicas: 2, instances: 2 },
        { id: 'n-gateway', type: 'APIGateway', name: 'API Gateway (Auth & Routing)', x: 390, y: 180, replicas: 8, instances: 8 },
        { id: 'n-timeline-svc', type: 'Microservice', name: 'Timeline Read Service', x: 580, y: 100, replicas: 24, instances: 24 },
        { id: 'n-tweet-svc', type: 'Microservice', name: 'Tweet Post Service', x: 580, y: 260, replicas: 8, instances: 8 },
        { id: 'n-timeline-redis', type: 'RedisCache', name: 'Redis Timeline Inboxes (ZSET)', x: 790, y: 70, replicas: 16, instances: 16 },
        { id: 'n-tweet-db', type: 'NoSQLKV', name: 'Tweet Storage (ScyllaDB)', x: 790, y: 200, replicas: 12, instances: 12 },
        { id: 'n-kafka', type: 'KafkaQueue', name: 'Tweet Fanout Kafka Topic', x: 790, y: 340, replicas: 12, instances: 12 },
        { id: 'n-fanout-workers', type: 'WorkerPool', name: 'Fanout Worker Pool', x: 1000, y: 270, replicas: 16, instances: 16 },
        { id: 'n-media-store', type: 'ObjectStorage', name: 'Media Blob Store (S3)', x: 1000, y: 390, replicas: 2, instances: 2 }
      ],
      frames: [
        { id: 'f-fanout', label: 'Hybrid Fanout & Timeline Storage Tier', x: 765, y: 35, width: 410, height: 430 }
      ],
      notes: [
        { id: 'note-tw', text: 'Hybrid Fanout Policy:\n• Normal users: Push via Kafka\n• >50k followers: Pull on Read', x: 50, y: 320 }
      ],
      connections: [
        { from: 'n-client', to: 'n-l4lb', label: 'HTTPS / WSS' },
        { from: 'n-l4lb', to: 'n-gateway', label: 'TCP Forward' },
        { from: 'n-gateway', to: 'n-timeline-svc', label: 'GET /home_timeline' },
        { from: 'n-gateway', to: 'n-tweet-svc', label: 'POST /tweet' },
        { from: 'n-timeline-svc', to: 'n-timeline-redis', label: 'Fetch Top 800 TweetIDs' },
        { from: 'n-timeline-svc', to: 'n-tweet-db', label: 'Hydrate Tweet Entities' },
        { from: 'n-tweet-svc', to: 'n-tweet-db', label: 'Insert Tweet Entity' },
        { from: 'n-tweet-svc', to: 'n-kafka', label: 'Publish NewTweetEvent' },
        { from: 'n-kafka', to: 'n-fanout-workers', label: 'Consume Event' },
        { from: 'n-fanout-workers', to: 'n-timeline-redis', label: 'LPUSH to Follower Inboxes' },
        { from: 'n-tweet-svc', to: 'n-media-store', label: 'Store Media Attachments' }
      ]
    },

    // 3. WhatsApp / Real-Time Messaging Architecture
    {
      id: 'whatsapp-chat',
      title: 'WhatsApp / Real-Time Messaging Architecture',
      subtitle: 'Stateful WebSocket connection gateways with ephemeral inbox persistence',
      category: 'Real-Time Communication',
      difficulty: 'Advanced',
      targetQps: 100000,
      targetLatencyMs: 30,
      description: 'Persistent bidirectional WebSocket connections, distributed session state in Redis, ephemeral message queues, and end-to-end encrypted media offload.',
      relatedSlugs: ["chat-and-messaging-system-design","collaborative-editing-system-design","websockets-vs-sse-vs-long-polling","realtime-database-and-websocket-scaling"],
      requirements: [
        'Millions of concurrent stateful WebSocket connections across gateway pods',
        'At-least-once delivery with offline store-and-forward in Cassandra',
        'End-to-end encrypted media blobs uploaded directly to object storage'
      ],
      defaultInputs: {
        qps: 100000,
        readWriteRatio: 1, // 1 write = 1 delivery read
        avgReadPayloadBytes: 512,
        avgWritePayloadBytes: 512,
        cacheHitRate: 0.95,
        storageRetentionDays: 30, // Ephemeral store (delivered messages purged)
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'WhatsApp Mobile Clients', x: 60, y: 180, replicas: 1, instances: 1 },
        { id: 'n-l4lb', type: 'L4LB', name: 'L4 Load Balancers (HAProxy / IPVS)', x: 230, y: 180, replicas: 4, instances: 4 },
        { id: 'n-chat-gateway', type: 'Microservice', name: 'Chat Gateway (WebSocket / Erlang)', x: 420, y: 180, replicas: 32, instances: 32 },
        { id: 'n-session-redis', type: 'RedisCache', name: 'Session & Connection Registry', x: 640, y: 80, replicas: 8, instances: 8 },
        { id: 'n-kafka', type: 'KafkaQueue', name: 'Message Dispatch Queue', x: 640, y: 220, replicas: 12, instances: 12 },
        { id: 'n-msg-store', type: 'NoSQLKV', name: 'Undelivered Messages (Cassandra)', x: 640, y: 350, replicas: 12, instances: 12 },
        { id: 'n-media-storage', type: 'ObjectStorage', name: 'Encrypted Media (S3 / CDN)', x: 860, y: 180, replicas: 2, instances: 2 },
        { id: 'n-push-workers', type: 'WorkerPool', name: 'APNs / FCM Push Workers', x: 860, y: 300, replicas: 8, instances: 8 }
      ],
      frames: [
        { id: 'f-ws', label: 'Stateful WSS Connection & Routing Plane', x: 400, y: 40, width: 410, height: 390 }
      ],
      notes: [
        { id: 'note-wa', text: 'Ephemeral Delivery Model:\nMessages deleted from Cassandra upon ACK', x: 60, y: 310 }
      ],
      connections: [
        { from: 'n-client', to: 'n-l4lb', label: 'Long-Lived TLS WSS' },
        { from: 'n-l4lb', to: 'n-chat-gateway', label: 'TCP Multiplexing' },
        { from: 'n-chat-gateway', to: 'n-session-redis', label: 'Lookup Receiver Gateway Host' },
        { from: 'n-chat-gateway', to: 'n-kafka', label: 'Dispatch Inbound Message' },
        { from: 'n-kafka', to: 'n-chat-gateway', label: 'Forward to Peer Gateway' },
        { from: 'n-kafka', to: 'n-msg-store', label: 'Persist If Offline' },
        { from: 'n-kafka', to: 'n-push-workers', label: 'Trigger Push If Backgrounded' },
        { from: 'n-client', to: 'n-media-storage', label: 'Direct E2E Encrypted Blob Upload' }
      ]
    },

    // 4. Stripe Payment & Financial Ledger Architecture
    {
      id: 'stripe-ledger',
      title: 'Stripe Payment & Financial Ledger Architecture',
      subtitle: 'Double-entry ACID ledger with idempotency keys and transactional outbox CDC',
      category: 'Financial & Ledger Systems',
      difficulty: 'Advanced',
      targetQps: 10000,
      targetLatencyMs: 80,
      description: 'Zero-data-loss double-entry accounting ledger with edge idempotency keys, distributed locks, synchronous 2PC replication, and outbox event streaming.',
      relatedSlugs: ["payment-system-design","case-stripe-idempotency-keys","retries-timeouts-idempotency","flash-sale-inventory-locking"],
      requirements: [
        'Strict exactly-once charge execution via Idempotency-Key deduplication',
        'Immutable double-entry debit/credit ACID ledger entries',
        'Transactional Outbox CDC to Kafka for settlement & merchant webhooks'
      ],
      defaultInputs: {
        qps: 10000,
        readWriteRatio: 2,
        avgReadPayloadBytes: 2048,
        avgWritePayloadBytes: 4096,
        cacheHitRate: 0.80,
        storageRetentionDays: 2555, // 7-year regulatory retention
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'Merchant API Callers', x: 50, y: 180, replicas: 1, instances: 1 },
        { id: 'n-gateway', type: 'APIGateway', name: 'API Gateway (Idempotency Validator)', x: 230, y: 180, replicas: 4, instances: 4 },
        { id: 'n-payment-svc', type: 'Microservice', name: 'Payment Orchestrator Service', x: 420, y: 180, replicas: 8, instances: 8 },
        { id: 'n-lock-redis', type: 'RedisCache', name: 'Redis Redlock (Concurrency Guard)', x: 620, y: 70, replicas: 5, instances: 5 },
        { id: 'n-ledger-sql', type: 'SQLShard', name: 'Double-Entry Ledger DB (PostgreSQL)', x: 620, y: 220, replicas: 8, instances: 8 },
        { id: 'n-audit-kafka', type: 'KafkaQueue', name: 'Outbox CDC / Kafka Event Bus', x: 620, y: 360, replicas: 6, instances: 6 },
        { id: 'n-bank-workers', type: 'WorkerPool', name: 'Bank Settlement & Webhook Workers', x: 850, y: 220, replicas: 8, instances: 8 },
        { id: 'n-cold-archive', type: 'ObjectStorage', name: 'Audit Compliance Archive (Glacier)', x: 850, y: 360, replicas: 2, instances: 2 }
      ],
      frames: [
        { id: 'f-acid', label: 'PCI-DSS Isolated Transactional Core', x: 400, y: 40, width: 400, height: 400 }
      ],
      notes: [
        { id: 'note-stripe', text: 'Zero-Data-Loss Invariant:\nIdempotency-Key + Transactional Outbox CDC', x: 50, y: 310 }
      ],
      connections: [
        { from: 'n-client', to: 'n-gateway', label: 'POST /v1/charges (Idempotency-Key)' },
        { from: 'n-gateway', to: 'n-payment-svc', label: 'Authenticated Payload' },
        { from: 'n-payment-svc', to: 'n-lock-redis', label: 'Acquire Account Lock' },
        { from: 'n-payment-svc', to: 'n-ledger-sql', label: 'ACID Multi-Table Debit/Credit' },
        { from: 'n-ledger-sql', to: 'n-audit-kafka', label: 'Transactional Outbox CDC' },
        { from: 'n-audit-kafka', to: 'n-bank-workers', label: 'Consume PaymentSettled' },
        { from: 'n-bank-workers', to: 'n-client', label: 'Deliver Merchant Webhook' },
        { from: 'n-audit-kafka', to: 'n-cold-archive', label: 'Batch Immutable WORM Archive' }
      ]
    },

    // 5. Uber Geospatial Dispatch Engine
    {
      id: 'uber-geo-dispatch',
      title: 'Uber Geospatial Dispatch Engine',
      subtitle: 'H3 hexagonal spatial indexing with real-time driver location streams and bipartite matching',
      category: 'Geospatial & Marketplace',
      difficulty: 'Advanced',
      targetQps: 250000,
      targetLatencyMs: 40,
      description: 'High-frequency GPS telemetry ingestion (4-second pings across millions of active drivers) indexed in an in-memory H3 hexagonal grid with distributed trip state locking.',
      relatedSlugs: ["ride-matching-system-design","nearby-geospatial-search-system-design","geospatial-nearby-search-case-study","geospatial-grid-systems-h3-s2-geohash"],
      requirements: [
        'Ingest 250,000+ GPS pings/sec with sub-40ms H3 cell index updates',
        'K-ring hexagonal neighbor search + ETA matrix calculation for dispatch',
        'Atomic driver offer reservation preventing double-assignment races'
      ],
      defaultInputs: {
        qps: 250000,
        readWriteRatio: 4,
        avgReadPayloadBytes: 1024,
        avgWritePayloadBytes: 256,
        cacheHitRate: 0.94,
        storageRetentionDays: 90,
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'Driver & Rider Mobile Apps', x: 50, y: 180, replicas: 1, instances: 1 },
        { id: 'n-l4lb', type: 'L4LB', name: 'L4 Anycast Edge Load Balancer', x: 220, y: 180, replicas: 4, instances: 4 },
        { id: 'n-gateway', type: 'APIGateway', name: 'Geo Ingress & Auth Gateway', x: 390, y: 180, replicas: 12, instances: 12 },
        { id: 'n-loc-svc', type: 'Microservice', name: 'Location Ingestion Service', x: 590, y: 90, replicas: 24, instances: 24 },
        { id: 'n-match-svc', type: 'Microservice', name: 'Dispatch & ETA Matching Engine', x: 590, y: 260, replicas: 16, instances: 16 },
        { id: 'n-h3-redis', type: 'RedisCache', name: 'H3 Spatial Index Cluster (Redis)', x: 820, y: 80, replicas: 16, instances: 16 },
        { id: 'n-trip-sql', type: 'SQLShard', name: 'Sharded Trip State DB (Schemaless)', x: 820, y: 230, replicas: 12, instances: 12 },
        { id: 'n-kafka', type: 'KafkaQueue', name: 'GPS Telemetry &Surge Stream', x: 820, y: 370, replicas: 16, instances: 16 },
        { id: 'n-surge-workers', type: 'WorkerPool', name: 'Dynamic Surge Pricing Workers', x: 1040, y: 370, replicas: 10, instances: 10 }
      ],
      frames: [
        { id: 'f-geo', label: 'H3 Spatial Indexing & Real-Time Dispatch Core', x: 570, y: 40, width: 430, height: 395 }
      ],
      notes: [
        { id: 'note-uber', text: 'Uber H3 Resolution 8/9:\nK-ring lookup + Redis atomic driver lock', x: 50, y: 320 }
      ],
      connections: [
        { from: 'n-client', to: 'n-l4lb', label: 'QUIC / HTTP/3 Ping (4s)' },
        { from: 'n-l4lb', to: 'n-gateway', label: 'L4 Multiplex' },
        { from: 'n-gateway', to: 'n-loc-svc', label: 'Stream Driver Lat/Lng' },
        { from: 'n-gateway', to: 'n-match-svc', label: 'POST /v1/rides/request' },
        { from: 'n-loc-svc', to: 'n-h3-redis', label: 'Upsert H3 Cell ID + TTL' },
        { from: 'n-loc-svc', to: 'n-kafka', label: 'Emit LocationUpdated' },
        { from: 'n-match-svc', to: 'n-h3-redis', label: 'Query H3 kRing(origin, k=2)' },
        { from: 'n-match-svc', to: 'n-trip-sql', label: 'Commit Offer & Trip State' },
        { from: 'n-kafka', to: 'n-surge-workers', label: 'Compute Supply/Demand Ratio' }
      ]
    },

    // 6. YouTube Video Transcoding & Edge CDN
    {
      id: 'youtube-video-cdn',
      title: 'YouTube Video Transcoding & Edge CDN',
      subtitle: 'DAG-based adaptive bitrate (HLS/DASH) transcoding pipeline and tiered PoP edge delivery',
      category: 'Media & Content Delivery',
      difficulty: 'Intermediate',
      targetQps: 300000,
      targetLatencyMs: 25,
      description: 'Massive egress streaming architecture combining direct multipart blob uploads, parallel GOP chunk transcoding DAGs, and 95%+ offload at ISP edge PoPs.',
      relatedSlugs: ["video-platform-system-design","video-transcoding-pipeline","adaptive-bitrate-and-cdn-decider","s3-object-storage-architecture"],
      requirements: [
        'Resumable multipart raw video uploads directly to Object Storage',
        'Parallel DAG video transcoding into 360p–4K AV1/H.264 HLS segments',
        '95% bandwidth offload via tiered Edge CDN PoPs with adaptive bitrate'
      ],
      defaultInputs: {
        qps: 300000,
        readWriteRatio: 200,
        avgReadPayloadBytes: 65536,
        avgWritePayloadBytes: 32768,
        cacheHitRate: 0.95,
        storageRetentionDays: 1095,
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'Video Players & Creators', x: 50, y: 180, replicas: 1, instances: 1 },
        { id: 'n-cdn', type: 'CDN', name: 'Global Edge CDN (HLS/DASH Segments)', x: 240, y: 90, replicas: 6, instances: 6 },
        { id: 'n-gateway', type: 'APIGateway', name: 'API Gateway (Control & Upload Auth)', x: 240, y: 270, replicas: 8, instances: 8 },
        { id: 'n-upload-svc', type: 'Microservice', name: 'Upload & Manifest Service', x: 450, y: 270, replicas: 12, instances: 12 },
        { id: 'n-meta-redis', type: 'RedisCache', name: 'Video Metadata & Manifest Cache', x: 660, y: 170, replicas: 8, instances: 8 },
        { id: 'n-meta-sql', type: 'SQLShard', name: 'Sharded Metadata DB (Vitess/MySQL)', x: 660, y: 310, replicas: 16, instances: 16 },
        { id: 'n-raw-s3', type: 'ObjectStorage', name: 'Raw & Segmented Video Store (S3)', x: 880, y: 90, replicas: 4, instances: 4 },
        { id: 'n-transcode-q', type: 'KafkaQueue', name: 'Chunk Transcode Job Queue', x: 880, y: 240, replicas: 8, instances: 8 },
        { id: 'n-gpu-workers', type: 'WorkerPool', name: 'DAG Transcoding GPU/ASIC Workers', x: 1080, y: 240, replicas: 32, instances: 32 }
      ],
      frames: [
        { id: 'f-media', label: 'Async GOP Chunk Transcoding & Origin Storage', x: 855, y: 45, width: 395, height: 320 }
      ],
      notes: [
        { id: 'note-yt', text: 'ABR Streaming:\n2-4s .m4s segments cached at ISP Edge PoPs', x: 50, y: 340 }
      ],
      connections: [
        { from: 'n-client', to: 'n-cdn', label: 'GET /seg-104.m4s (HLS/DASH)' },
        { from: 'n-cdn', to: 'n-raw-s3', label: 'Origin Shield Fetch (5% Miss)' },
        { from: 'n-client', to: 'n-gateway', label: 'POST /upload/init' },
        { from: 'n-gateway', to: 'n-upload-svc', label: 'Issue Pre-Signed S3 URL' },
        { from: 'n-upload-svc', to: 'n-raw-s3', label: 'Multipart Raw Chunk Upload' },
        { from: 'n-upload-svc', to: 'n-transcode-q', label: 'Enqueue GOP Split & Encode' },
        { from: 'n-transcode-q', to: 'n-gpu-workers', label: 'Transcode 360p/720p/1080p/4K' },
        { from: 'n-gpu-workers', to: 'n-raw-s3', label: 'Write Encoded Segments + .m3u8' },
        { from: 'n-upload-svc', to: 'n-meta-sql', label: 'Persist Video Metadata' },
        { from: 'n-upload-svc', to: 'n-meta-redis', label: 'Cache HLS Manifest' }
      ]
    },

    // 7. Global API Gateway & Distributed Rate Limiter
    {
      id: 'distributed-rate-limiter',
      title: 'Global API Gateway & Distributed Rate Limiter',
      subtitle: 'Edge token-bucket + sliding window counters with atomic Redis Lua scripts and local L1 batching',
      category: 'Infrastructure & Traffic Control',
      difficulty: 'Intermediate',
      targetQps: 500000,
      targetLatencyMs: 5,
      description: 'Ultra-low-latency L7 ingress fabric enforcing per-tenant quotas, adaptive circuit breaking, and DDoS shedding across 500,000+ RPS.',
      relatedSlugs: ["rate-limiting-and-abuse-prevention-case-study","sliding-window-rate-limiter","rate-limiter-placement-and-keys","api-gateway-vs-load-balancer"],
      requirements: [
        'Sub-2ms rate-limit evaluation overhead at 500,000 RPS',
        'Atomic Token Bucket / Sliding Window enforcement via Redis Lua scripts',
        'Graceful fail-open / local L1 token batching during Redis partition events'
      ],
      defaultInputs: {
        qps: 500000,
        readWriteRatio: 50,
        avgReadPayloadBytes: 512,
        avgWritePayloadBytes: 512,
        cacheHitRate: 0.96,
        storageRetentionDays: 30,
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'External API Consumers', x: 50, y: 180, replicas: 1, instances: 1 },
        { id: 'n-l4lb', type: 'L4LB', name: 'Maglev / XDP L4 Load Balancer', x: 230, y: 180, replicas: 6, instances: 6 },
        { id: 'n-l7-envoy', type: 'L7LB', name: 'Envoy L7 Proxy Fleet', x: 420, y: 180, replicas: 24, instances: 24 },
        { id: 'n-rl-svc', type: 'APIGateway', name: 'Rate Limiter gRPC Service', x: 630, y: 80, replicas: 16, instances: 16 },
        { id: 'n-redis-lua', type: 'RedisCache', name: 'Redis Cluster (Lua Token Buckets)', x: 860, y: 80, replicas: 12, instances: 12 },
        { id: 'n-upstream-svc', type: 'Microservice', name: 'Protected Upstream Microservices', x: 630, y: 240, replicas: 32, instances: 32 },
        { id: 'n-rules-sql', type: 'SQLShard', name: 'Tenant Quota Policy DB', x: 860, y: 240, replicas: 4, instances: 4 },
        { id: 'n-metrics-kafka', type: 'KafkaQueue', name: 'HTTP 429 Audit & Telemetry Log', x: 860, y: 370, replicas: 6, instances: 6 }
      ],
      frames: [
        { id: 'f-rl', label: 'Ingress Control Plane & Atomic Quota Tier', x: 400, y: 35, width: 630, height: 300 }
      ],
      notes: [
        { id: 'note-rl', text: 'Token Bucket via EVALSHA:\nLocal L1 batching cuts Redis RTTs by 90%', x: 50, y: 320 }
      ],
      connections: [
        { from: 'n-client', to: 'n-l4lb', label: 'TLS 1.3 Ingress' },
        { from: 'n-l4lb', to: 'n-l7-envoy', label: 'Consistent Hash' },
        { from: 'n-l7-envoy', to: 'n-rl-svc', label: 'gRPC ShouldRateLimit()' },
        { from: 'n-rl-svc', to: 'n-redis-lua', label: 'EVALSHA TokenBucket.lua' },
        { from: 'n-rl-svc', to: 'n-rules-sql', label: 'Sync Quota Configs' },
        { from: 'n-l7-envoy', to: 'n-upstream-svc', label: 'Forward Allowed (HTTP 200)' },
        { from: 'n-rl-svc', to: 'n-metrics-kafka', label: 'Emit 429 Throttled Event' }
      ]
    },

    // 8. Multi-Channel Notification & Fanout Pipeline
    {
      id: 'notification-pipeline',
      title: 'Multi-Channel Notification & Fanout Pipeline',
      subtitle: 'Priority-isolated Kafka queues for APNs, FCM, SMS, and Email with DLQ retry backoff',
      category: 'Messaging & Async Systems',
      difficulty: 'Intermediate',
      targetQps: 120000,
      targetLatencyMs: 100,
      description: 'High-throughput notification router supporting transactional OTPs and bulk marketing campaigns with deduplication, user preference filtering, and exponential backoff.',
      relatedSlugs: ["notification-system-design","task-queue-vs-event-stream","event-bus-for-product-events","observability-slo-case-study"],
      requirements: [
        'Strict priority isolation so bulk campaigns never delay P0 OTP alerts',
        'Idempotent deduplication and per-user quiet-hours / opt-out checks',
        'Exponential backoff retry queues + Dead Letter Queue (DLQ) recovery'
      ],
      defaultInputs: {
        qps: 120000,
        readWriteRatio: 5,
        avgReadPayloadBytes: 512,
        avgWritePayloadBytes: 1024,
        cacheHitRate: 0.90,
        storageRetentionDays: 90,
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'Producer Services & Triggers', x: 50, y: 180, replicas: 1, instances: 1 },
        { id: 'n-gateway', type: 'APIGateway', name: 'Notification Ingress Gateway', x: 240, y: 180, replicas: 6, instances: 6 },
        { id: 'n-router-svc', type: 'Microservice', name: 'Validation & Preference Router', x: 440, y: 180, replicas: 16, instances: 16 },
        { id: 'n-pref-redis', type: 'RedisCache', name: 'Dedup & User Preference Cache', x: 650, y: 70, replicas: 8, instances: 8 },
        { id: 'n-user-db', type: 'NoSQLKV', name: 'Device Tokens & Delivery Log DB', x: 650, y: 210, replicas: 12, instances: 12 },
        { id: 'n-kafka-topics', type: 'KafkaQueue', name: 'Channel Topics (APNs / FCM / SMS)', x: 650, y: 350, replicas: 12, instances: 12 },
        { id: 'n-channel-workers', type: 'WorkerPool', name: 'Provider Delivery Workers + DLQ', x: 890, y: 350, replicas: 24, instances: 24 },
        { id: 'n-template-s3', type: 'ObjectStorage', name: 'HTML / Push Template Store', x: 890, y: 190, replicas: 2, instances: 2 }
      ],
      frames: [
        { id: 'f-notif', label: 'Priority Fanout & Provider Delivery Plane', x: 625, y: 40, width: 435, height: 395 }
      ],
      notes: [
        { id: 'note-notif', text: 'Priority Isolation:\nSeparate P0 OTP vs P2 Marketing Kafka topics', x: 50, y: 320 }
      ],
      connections: [
        { from: 'n-client', to: 'n-gateway', label: 'POST /v1/notify' },
        { from: 'n-gateway', to: 'n-router-svc', label: 'Authenticated Event' },
        { from: 'n-router-svc', to: 'n-pref-redis', label: 'Check Opt-Out & Dedup ID' },
        { from: 'n-router-svc', to: 'n-user-db', label: 'Fetch Device Tokens' },
        { from: 'n-router-svc', to: 'n-kafka-topics', label: 'Partition by Channel + Priority' },
        { from: 'n-kafka-topics', to: 'n-channel-workers', label: 'Consume & Rate-Limit' },
        { from: 'n-channel-workers', to: 'n-template-s3', label: 'Render Localized Template' },
        { from: 'n-channel-workers', to: 'n-user-db', label: 'Record Receipt / DLQ Status' }
      ]
    },

    // 9. Planet-Scale Web Crawler & Deduplication Pipeline
    {
      id: 'web-crawler',
      title: 'Planet-Scale Web Crawler & Deduplication Pipeline',
      subtitle: 'Politeness-aware URL frontier with Bloom filter URL dedup and SimHash content fingerprinting',
      category: 'Search & Data Pipelines',
      difficulty: 'Advanced',
      targetQps: 80000,
      targetLatencyMs: 120,
      description: 'Distributed web crawler harvesting billions of pages with per-domain politeness queues, local DNS caching, Bloom filter URL deduplication, and inverted index ingestion.',
      relatedSlugs: ["crawler-and-indexing-pipeline","autocomplete-system-design","seen-filtering-bloom-vs-exact-sets","bloom-filters"],
      requirements: [
        'Politeness enforcement: 1 concurrent connection per target hostname + robots.txt cache',
        'URL deduplication via distributed Redis Bloom Filter + SimHash near-duplicate content detection',
        'Asynchronous HTML extraction feeding both raw S3 archive and inverted index shards'
      ],
      defaultInputs: {
        qps: 80000,
        readWriteRatio: 2,
        avgReadPayloadBytes: 16384,
        avgWritePayloadBytes: 32768,
        cacheHitRate: 0.88,
        storageRetentionDays: 365,
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-frontier-q', type: 'KafkaQueue', name: 'URL Frontier (Priority + Host Shards)', x: 60, y: 180, replicas: 16, instances: 16 },
        { id: 'n-fetcher-pool', type: 'WorkerPool', name: 'HTTP Fetcher & Parser Workers', x: 280, y: 180, replicas: 32, instances: 32 },
        { id: 'n-dns-redis', type: 'RedisCache', name: 'DNS Cache + robots.txt + Bloom Filter', x: 520, y: 70, replicas: 12, instances: 12 },
        { id: 'n-dedup-svc', type: 'Microservice', name: 'SimHash Content Dedup & Link Extractor', x: 520, y: 220, replicas: 16, instances: 16 },
        { id: 'n-crawl-db', type: 'NoSQLKV', name: 'Crawl Metadata & Checksum Store', x: 760, y: 220, replicas: 12, instances: 12 },
        { id: 'n-raw-html-s3', type: 'ObjectStorage', name: 'Compressed WARC HTML Archive (S3)', x: 760, y: 80, replicas: 4, instances: 4 },
        { id: 'n-index-workers', type: 'WorkerPool', name: 'Inverted Index Builder Workers', x: 760, y: 360, replicas: 16, instances: 16 }
      ],
      frames: [
        { id: 'f-crawl', label: 'Politeness Fetcher & SimHash Deduplication Loop', x: 40, y: 40, width: 920, height: 400 }
      ],
      notes: [
        { id: 'note-crawl', text: 'Politeness Invariant:\nConsistent hash hostname -> single Fetcher queue', x: 60, y: 330 }
      ],
      connections: [
        { from: 'n-frontier-q', to: 'n-fetcher-pool', label: 'Pop Host-Polite URL Batch' },
        { from: 'n-fetcher-pool', to: 'n-dns-redis', label: 'Resolve DNS & Check robots.txt' },
        { from: 'n-fetcher-pool', to: 'n-dedup-svc', label: 'Stream Parsed DOM & Outlinks' },
        { from: 'n-dedup-svc', to: 'n-dns-redis', label: 'BF.ADD Seen URLs (Bloom Filter)' },
        { from: 'n-dedup-svc', to: 'n-crawl-db', label: 'Verify 64-bit SimHash Distance' },
        { from: 'n-dedup-svc', to: 'n-raw-html-s3', label: 'Store WARC Snapshot' },
        { from: 'n-dedup-svc', to: 'n-frontier-q', label: 'Enqueue Unseen Child URLs' },
        { from: 'n-dedup-svc', to: 'n-index-workers', label: 'Emit Tokenized Document' }
      ]
    },

    // 10. LLM Inference & Semantic RAG Gateway
    {
      id: 'ai-rag-gateway',
      title: 'LLM Inference & Semantic RAG Gateway',
      subtitle: 'Semantic prompt caching, hybrid HNSW vector + BM25 retrieval, and SSE token streaming',
      category: 'AI & ML Systems',
      difficulty: 'Advanced',
      targetQps: 25000,
      targetLatencyMs: 90,
      description: 'Production GenAI gateway with token-aware rate limiting, cosine-similarity semantic prompt cache, hybrid vector + keyword retrieval, and continuous batching GPU workers.',
      relatedSlugs: ["vector-search-and-hybrid-retrieval","search-engine-system-design","information-retrieval-system-design","recommendation-system-design"],
      requirements: [
        'Token-per-minute (TPM) rate limiting and PII guardrail redaction at ingress',
        'Semantic cache lookup (cosine similarity >= 0.96) offloading 35%+ of GPU calls',
        'Hybrid retrieval (HNSW Vector DB + BM25) with Reciprocal Rank Fusion (RRF)'
      ],
      defaultInputs: {
        qps: 25000,
        readWriteRatio: 20,
        avgReadPayloadBytes: 4096,
        avgWritePayloadBytes: 2048,
        cacheHitRate: 0.85,
        storageRetentionDays: 180,
        replicationFactor: 3
      },
      nodes: [
        { id: 'n-client', type: 'Client', name: 'AI Chat & SDK Clients', x: 50, y: 180, replicas: 1, instances: 1 },
        { id: 'n-ai-gw', type: 'APIGateway', name: 'AI Gateway (TPM Quota & Guardrails)', x: 240, y: 180, replicas: 8, instances: 8 },
        { id: 'n-rag-svc', type: 'Microservice', name: 'RAG Orchestrator & RRF Reranker', x: 450, y: 180, replicas: 16, instances: 16 },
        { id: 'n-sem-cache', type: 'RedisCache', name: 'Semantic Prompt & KV Prefix Cache', x: 670, y: 65, replicas: 8, instances: 8 },
        { id: 'n-vec-db', type: 'NoSQLKV', name: 'HNSW Vector + BM25 Hybrid Index', x: 670, y: 200, replicas: 12, instances: 12 },
        { id: 'n-gpu-pool', type: 'WorkerPool', name: 'vLLM Continuous Batching GPU Fleet', x: 900, y: 180, replicas: 24, instances: 24 },
        { id: 'n-ingest-q', type: 'KafkaQueue', name: 'Document Chunking & Embedding Stream', x: 670, y: 350, replicas: 6, instances: 6 },
        { id: 'n-doc-s3', type: 'ObjectStorage', name: 'Enterprise Knowledge Corpus (S3)', x: 900, y: 350, replicas: 2, instances: 2 }
      ],
      frames: [
        { id: 'f-rag', label: 'Semantic Cache, Hybrid Vector Retrieval & vLLM GPU Tier', x: 430, y: 35, width: 645, height: 395 }
      ],
      notes: [
        { id: 'note-ai', text: 'Latency SLO: TTFT < 90ms\nPagedAttention + Semantic Cache offload', x: 50, y: 320 }
      ],
      connections: [
        { from: 'n-client', to: 'n-ai-gw', label: 'POST /v1/chat/completions (SSE)' },
        { from: 'n-ai-gw', to: 'n-rag-svc', label: 'Guardrail-Cleared Prompt' },
        { from: 'n-rag-svc', to: 'n-sem-cache', label: 'Semantic Vector Cache Lookup' },
        { from: 'n-rag-svc', to: 'n-vec-db', label: 'ANN Top-K + BM25 RRF Retrieval' },
        { from: 'n-rag-svc', to: 'n-gpu-pool', label: 'Augmented Prompt (vLLM gRPC)' },
        { from: 'n-doc-s3', to: 'n-ingest-q', label: 'CDC Document Updated' },
        { from: 'n-ingest-q', to: 'n-vec-db', label: 'Upsert Chunk Embeddings' }
      ]
    }
  ];

  // ── Capacity Calculation Engine ──────────────────────────────────
  /**
   * Computes throughput, storage, bandwidth, and detects architectural bottlenecks.
   * @param {Object} inputs
   * @param {number} inputs.qps - Total incoming QPS
   * @param {number} inputs.readWriteRatio - Ratio of reads per write (e.g. 100 for 100:1)
   * @param {number} inputs.avgReadPayloadBytes - Average read response size in bytes
   * @param {number} inputs.avgWritePayloadBytes - Average write request size in bytes
   * @param {number} inputs.cacheHitRate - Cache hit ratio (0.0 to 1.0)
   * @param {number} inputs.storageRetentionDays - Data retention duration in days
   * @param {number} inputs.replicationFactor - Storage replication factor (e.g. 3)
   * @returns {Object} Computed metrics and array of bottlenecks
   */
  function calculateCapacity(inputs) {
    var qps = Math.max(1, Number(inputs.qps) || 10000);
    var ratio = Math.max(0.1, Number(inputs.readWriteRatio) || 10);
    var readBytes = Math.max(1, Number(inputs.avgReadPayloadBytes) || 1024);
    var writeBytes = Math.max(1, Number(inputs.avgWritePayloadBytes) || 2048);
    var hitRate = Math.min(0.99, Math.max(0, Number(inputs.cacheHitRate) || 0.85));
    var retentionDays = Math.max(1, Number(inputs.storageRetentionDays) || 365);
    var replication = Math.max(1, Number(inputs.replicationFactor) || 3);

    // Read vs Write QPS distribution
    var writeQps = qps / (ratio + 1);
    var readQps = qps * (ratio / (ratio + 1));

    // Cache offloading
    var cacheHitQps = readQps * hitRate;
    var originReadQps = readQps * (1 - hitRate);
    var dbTotalQps = originReadQps + writeQps;

    // Daily & Total Storage
    var dailyWriteBytes = writeQps * writeBytes * 86400;
    var dailyStorageReplicatedBytes = dailyWriteBytes * replication;
    var totalStorageReplicatedBytes = dailyStorageReplicatedBytes * retentionDays;

    var dailyStorageGb = dailyStorageReplicatedBytes / (1024 * 1024 * 1024);
    var totalStorageTb = totalStorageReplicatedBytes / (1024 * 1024 * 1024 * 1024);

    // Bandwidth Calculations (in Megabits/sec: bytes * 8 / 1e6)
    var ingressMbps = (writeQps * writeBytes * 8) / 1000000;
    var egressMbps = (readQps * readBytes * 8) / 1000000;
    var originEgressMbps = (originReadQps * readBytes * 8) / 1000000;
    var totalBandwidthMbps = ingressMbps + egressMbps;

    // Latency Estimation
    var cacheLatencyMs = 2; // In-memory Redis / Edge CDN
    var dbLatencyMs = 15;   // Sharded DB query
    var avgLatencyMs = (hitRate * cacheLatencyMs) + ((1 - hitRate) * dbLatencyMs);

    // Bottleneck Analysis
    var bottlenecks = [];

    // Bottleneck 1: Database QPS overload
    if (dbTotalQps > 40000) {
      bottlenecks.push({
        severity: 'critical',
        component: 'Database Tier',
        title: 'Database IOPS & Connection Pool Exhaustion',
        message: 'Origin database is receiving ' + Math.round(dbTotalQps).toLocaleString() + ' QPS. Standard single-shard DBs saturate at ~20,000-40,000 QPS. You must shard by primary key or introduce multi-replica read pools.'
      });
    } else if (dbTotalQps > 15000) {
      bottlenecks.push({
        severity: 'warning',
        component: 'Database Tier',
        title: 'High Database Load Approaching Shard Limit',
        message: 'Origin database receives ' + Math.round(dbTotalQps).toLocaleString() + ' QPS. Ensure connection pooling (e.g. PgBouncer) and read replicas are enabled.'
      });
    }

    // Bottleneck 2: Low Cache Hit Rate with High Reads
    if (ratio > 10 && hitRate < 0.70) {
      bottlenecks.push({
        severity: 'warning',
        component: 'Cache Tier',
        title: 'Suboptimal Cache Hit Ratio',
        message: 'Cache hit rate is only ' + Math.round(hitRate * 100) + '% on a read-heavy workload (' + ratio + ':1). Increasing cache memory or optimizing TTL will offload database traffic.'
      });
    }

    // Bottleneck 3: Network Egress Saturation
    if (egressMbps > 10000) {
      bottlenecks.push({
        severity: 'critical',
        component: 'Network Egress',
        title: 'Egress Bandwidth Exceeds 10 Gbps Edge Interface',
        message: 'Total egress bandwidth is ' + (egressMbps / 1000).toFixed(2) + ' Gbps. Single datacenter gateways will drop packets without CDN edge termination or multi-cloud Anycast.'
      });
    } else if (egressMbps > 2500) {
      bottlenecks.push({
        severity: 'warning',
        component: 'Network Egress',
        title: 'High Egress Bandwidth (>2.5 Gbps)',
        message: 'Egress bandwidth is ' + (egressMbps / 1000).toFixed(2) + ' Gbps. Enable gzip/brotli compression and offload static/immutable payloads to CDN.'
      });
    }

    // Bottleneck 4: Storage Accumulation
    if (totalStorageTb > 100) {
      bottlenecks.push({
        severity: 'warning',
        component: 'Storage Retention',
        title: 'Multi-Hundred Terabyte Storage Footprint',
        message: 'Cumulative replicated storage reaches ' + totalStorageTb.toFixed(1) + ' TB over ' + retentionDays + ' days. Enforce cold storage tiering (e.g. S3 Glacier) to manage disk cost.'
      });
    }

    return {
      qps: qps,
      readQps: Math.round(readQps),
      writeQps: Math.round(writeQps),
      cacheHitQps: Math.round(cacheHitQps),
      originReadQps: Math.round(originReadQps),
      dbTotalQps: Math.round(dbTotalQps),
      dailyStorageGb: Number(dailyStorageGb.toFixed(2)),
      totalStorageTb: Number(totalStorageTb.toFixed(2)),
      ingressMbps: Number(ingressMbps.toFixed(2)),
      egressMbps: Number(egressMbps.toFixed(2)),
      totalBandwidthMbps: Number(totalBandwidthMbps.toFixed(2)),
      avgLatencyMs: Number(avgLatencyMs.toFixed(1)),
      bottlenecks: bottlenecks
    };
  }

  var WHITEBOARD_DATA = {
    version: '2.0.0',
    buildingBlocks: BUILDING_BLOCKS,
    blueprints: BLUEPRINTS,
    calculateCapacity: calculateCapacity
  };

  if (root && typeof root === 'object') {
    root.WHITEBOARD_DATA = WHITEBOARD_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WHITEBOARD_DATA;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
