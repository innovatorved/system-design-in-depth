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

  // ── 4 Reference Blueprints ───────────────────────────────────────
  var BLUEPRINTS = [
    // 1. Scalable URL Shortener
    {
      id: 'url-shortener',
      title: 'Scalable URL Shortener (Bitly Architecture)',
      category: 'Foundations',
      description: 'High read-to-write ratio (100:1) link redirector with Base62 tokenization, Redis caching, and asynchronous clickstream analytics.',
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
        { id: 'n-client', type: 'Client', name: 'Web / Mobile Clients', x: 60, y: 160 },
        { id: 'n-cdn', type: 'CDN', name: 'Global CDN Edge', x: 240, y: 160 },
        { id: 'n-gateway', type: 'APIGateway', name: 'API Gateway & Rate Limiter', x: 420, y: 160 },
        { id: 'n-redirect-svc', type: 'Microservice', name: 'Redirect Service (Stateless)', x: 620, y: 100 },
        { id: 'n-create-svc', type: 'Microservice', name: 'Link Creation Service', x: 620, y: 240 },
        { id: 'n-redis', type: 'RedisCache', name: 'Redis Cache (Popular URLs)', x: 840, y: 80 },
        { id: 'n-sql', type: 'SQLShard', name: 'URL Mappings DB (PostgreSQL)', x: 840, y: 220 },
        { id: 'n-kafka', type: 'KafkaQueue', name: 'Click Events Stream', x: 840, y: 360 },
        { id: 'n-analytics-worker', type: 'WorkerPool', name: 'Analytics Aggregation Workers', x: 1060, y: 360 }
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
      category: 'Social & Feed Systems',
      description: 'Hybrid fanout system (fanout-on-write for standard users, fanout-on-read for celebrities) with timeline Redis caches and ScyllaDB.',
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
        { id: 'n-client', type: 'Client', name: 'Mobile / Web Clients', x: 50, y: 180 },
        { id: 'n-l4lb', type: 'L4LB', name: 'L4 Anycast Load Balancer', x: 220, y: 180 },
        { id: 'n-gateway', type: 'APIGateway', name: 'API Gateway (Auth & Routing)', x: 390, y: 180 },
        { id: 'n-timeline-svc', type: 'Microservice', name: 'Timeline Read Service', x: 580, y: 100 },
        { id: 'n-tweet-svc', type: 'Microservice', name: 'Tweet Post Service', x: 580, y: 260 },
        { id: 'n-timeline-redis', type: 'RedisCache', name: 'Redis Timeline Inboxes (ZSET)', x: 790, y: 70 },
        { id: 'n-tweet-db', type: 'NoSQLKV', name: 'Tweet Storage (ScyllaDB)', x: 790, y: 200 },
        { id: 'n-kafka', type: 'KafkaQueue', name: 'Tweet Fanout Kafka Topic', x: 790, y: 340 },
        { id: 'n-fanout-workers', type: 'WorkerPool', name: 'Fanout Worker Pool', x: 1000, y: 270 },
        { id: 'n-media-store', type: 'ObjectStorage', name: 'Media Blob Store (S3)', x: 1000, y: 400 }
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
      category: 'Real-Time Communication',
      description: 'Persistent bidirectional WebSocket connections, distributed session state in Redis, ephemeral message queues, and end-to-end encrypted media offload.',
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
        { id: 'n-client', type: 'Client', name: 'WhatsApp Mobile Clients', x: 60, y: 180 },
        { id: 'n-l4lb', type: 'L4LB', name: 'L4 Load Balancers (HAProxy / IPVS)', x: 230, y: 180 },
        { id: 'n-chat-gateway', type: 'Microservice', name: 'Chat Gateway (WebSocket / Erlang)', x: 420, y: 180 },
        { id: 'n-session-redis', type: 'RedisCache', name: 'Session & Connection Registry', x: 640, y: 80 },
        { id: 'n-kafka', type: 'KafkaQueue', name: 'Message Dispatch Queue', x: 640, y: 220 },
        { id: 'n-msg-store', type: 'NoSQLKV', name: 'Undelivered Messages (Cassandra)', x: 640, y: 350 },
        { id: 'n-media-storage', type: 'ObjectStorage', name: 'Encrypted Media (S3 / CDN)', x: 860, y: 180 },
        { id: 'n-push-workers', type: 'WorkerPool', name: 'APNs / FCM Push Workers', x: 860, y: 300 }
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
      category: 'Financial & Ledger Systems',
      description: 'Zero-data-loss double-entry accounting ledger with edge idempotency keys, distributed locks, synchronous 2PC replication, and outbox event streaming.',
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
        { id: 'n-client', type: 'Client', name: 'Merchant API Callers', x: 50, y: 180 },
        { id: 'n-gateway', type: 'APIGateway', name: 'API Gateway (Idempotency Validator)', x: 230, y: 180 },
        { id: 'n-payment-svc', type: 'Microservice', name: 'Payment Orchestrator Service', x: 420, y: 180 },
        { id: 'n-lock-redis', type: 'RedisCache', name: 'Redis Redlock (Concurrency Guard)', x: 620, y: 70 },
        { id: 'n-ledger-sql', type: 'SQLShard', name: 'Double-Entry Ledger DB (PostgreSQL)', x: 620, y: 220 },
        { id: 'n-audit-kafka', type: 'KafkaQueue', name: 'Outbox CDC / Kafka Event Bus', x: 620, y: 360 },
        { id: 'n-bank-workers', type: 'WorkerPool', name: 'Bank Settlement & Webhook Workers', x: 850, y: 220 },
        { id: 'n-cold-archive', type: 'ObjectStorage', name: 'Audit Compliance Archive (Glacier)', x: 850, y: 360 }
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
