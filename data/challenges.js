/**
 * SYSTEM DESIGN INTERACTIVE LEARNING ECOSYSTEM
 * Incident Challenge Scenarios Data Foundation
 * 
 * Contains >=12 real-world incident simulations across 4 difficulty tiers:
 * - Easy (3): retry-storm-meltdown, cache-stampede-meltdown, rate-limiter-leak
 * - Medium (4): hot-partition-herd, circuit-breaker-flapping, wal-torn-write-corruption, slow-consumer-queue-spiral
 * - Hard (3): split-brain-quorum-loss, replication-lag-read-drift, cascading-deadlock-depletion
 * - Insane (2): two-phase-commit-coordinator-hang, gossip-partition-flapping-cascade
 */

(function (global) {
  'use strict';

  var CHALLENGES_DATA = [
    // ==========================================
    // TIER: EASY (3)
    // ==========================================
    {
      id: 'retry-storm-meltdown',
      relatedSlugs: ["retries-timeouts-idempotency","circuit-breakers-and-timeouts","load-shedding","backpressure"],
      title: 'Downstream Auth Service Retry Storm',
      difficulty: 'easy',
      category: 'Resilience & Fault Tolerance',
      trackId: 'foundation',
      xp: 50,
      estimatedMinutes: 15,
      symptoms: [
        'User checkout requests timing out at 10,000ms with HTTP 504 Gateway Timeout.',
        'Downstream Authentication Microservice CPU pinned at 100% across all 12 container instances.',
        'Total ingress RPS to Auth service jumped from baseline 1,500 RPS to 14,800 RPS without traffic increase.'
      ],
      metricsAndLogs: {
        errorRate: 0.84,
        latencyP99: 11200,
        downstreamCpu: 1.00,
        effectiveRps: 14800,
        baselineRps: 1500,
        timeseries: [
          { time: '-5m', cpu: 0.28, latencyP99: 45, errorRate: 0.001, rps: 1510 },
          { time: '-4m', cpu: 0.54, latencyP99: 120, errorRate: 0.02, rps: 2800 },
          { time: '-3m', cpu: 0.89, latencyP99: 1800, errorRate: 0.31, rps: 7200 },
          { time: '-2m', cpu: 1.00, latencyP99: 6400, errorRate: 0.65, rps: 12400 },
          { time: '-1m', cpu: 1.00, latencyP99: 11200, errorRate: 0.84, rps: 14800 }
        ],
        logs: [
          { timestamp: '14:02:11.102', level: 'WARN', service: 'api-gateway', message: 'POST /v1/auth/token upstream timeout after 5000ms. Retrying attempt 1/8 immediately.' },
          { timestamp: '14:02:11.154', level: 'WARN', service: 'api-gateway', message: 'POST /v1/auth/token upstream timeout after 5000ms. Retrying attempt 2/8 (backoff=50ms).' },
          { timestamp: '14:02:11.205', level: 'ERROR', service: 'auth-svc', message: 'Connection pool exhausted (active=200/200, queued=4820). Dropping incoming SYN.' },
          { timestamp: '14:02:11.260', level: 'FATAL', service: 'checkout-api', message: 'Downstream circuit degraded. User-facing checkout error rate exceeds 80%.' }
        ]
      },
      slaImpact: 'Global checkout flow blocked. Estimated revenue loss: $12,500/minute. P99 latency breached SLO (target < 200ms).',
      rootCauses: [
        { id: 'rc-1', description: 'Network switch failure in primary availability zone', correct: false },
        { id: 'rc-2', description: 'Aggressive client retries (8 attempts) with 50ms static backoff and 0 jitter, creating a synchronized feedback loop upon momentary hiccup', correct: true },
        { id: 'rc-3', description: 'Database schema migration deadlock on the users table', correct: false },
        { id: 'rc-4', description: 'Memory leak in node.js V8 garbage collection', correct: false }
      ],
      invariants: [
        'Downstream Auth Service CPU must remain below 70%',
        'P99 response latency must be under 150ms',
        'Overall HTTP error rate must drop below 1.0%',
        'Amplified traffic multiplier must be under 1.25x of baseline'
      ],
      interactiveTuning: [
        { id: 'maxRetries', label: 'Max Retry Attempts', type: 'range', min: 0, max: 10, step: 1, defaultValue: 8, unit: 'attempts', description: 'Maximum retry tries per failed RPC.' },
        { id: 'backoffBaseMs', label: 'Base Exponential Backoff', type: 'range', min: 10, max: 1000, step: 10, defaultValue: 50, unit: 'ms', description: 'Initial backoff multiplier before retrying.' },
        { id: 'jitter', label: 'Jitter Strategy', type: 'select', options: ['none', 'full', 'decorrelated'], defaultValue: 'none', description: 'Randomization applied to backoff intervals to break thundering herds.' },
        { id: 'circuitBreakerThreshold', label: 'Circuit Breaker Error %', type: 'range', min: 10, max: 100, step: 5, defaultValue: 90, unit: '%', description: 'Error rate at which circuit breaker trips OPEN to protect downstream.' }
      ],
      verify: function (knobValues) {
        var retries = Number(knobValues.maxRetries != null ? knobValues.maxRetries : 8);
        var backoff = Number(knobValues.backoffBaseMs != null ? knobValues.backoffBaseMs : 50);
        var jitter = knobValues.jitter || 'none';
        var cbThreshold = Number(knobValues.circuitBreakerThreshold != null ? knobValues.circuitBreakerThreshold : 90);

        // Calculate retry amplification factor
        var retryMultiplier = 1;
        if (jitter === 'none') {
          retryMultiplier = 1 + (retries * 1.1) * (150 / Math.max(backoff, 20));
        } else if (jitter === 'full') {
          retryMultiplier = 1 + (retries * 0.22) * (100 / Math.max(backoff, 50));
        } else if (jitter === 'decorrelated') {
          retryMultiplier = 1 + (retries * 0.15) * (100 / Math.max(backoff, 50));
        }

        var capacity = 2500; // Auth service capacity in RPS
        var totalRps = 1500 * retryMultiplier;
        var overload = Math.max(0, totalRps - capacity);

        var cbTripped = (cbThreshold <= 50 && totalRps > capacity * 1.1);
        var cpu = Math.min(1.0, 0.25 + (totalRps / capacity) * 0.55);
        if (cbTripped) {
          totalRps = 1500 * (cbThreshold / 100);
          cpu = 0.45;
        }

        var latencyP99 = Math.round(42 + (cpu > 0.85 ? Math.pow((cpu - 0.7) * 20, 2.5) * 800 : cpu * 50));
        var errorRate = Math.max(0.001, (overload / Math.max(totalRps, 1)));
        if (cbTripped) errorRate = 0.05;

        // Invariant checks:
        // retries <= 3, backoff >= 150, jitter != 'none', cbThreshold <= 50
        var success = (retries <= 3 && backoff >= 150 && jitter !== 'none' && cbThreshold <= 60);

        var message = success
          ? 'Incident Mitigated! Exponential backoff with full jitter desynchronized retries. Downstream Auth CPU stabilized at ' + Math.round(cpu * 100) + '% with P99 at ' + latencyP99 + 'ms.'
          : 'Service still degraded. Retry amplification factor is ' + retryMultiplier.toFixed(1) + 'x with downstream CPU at ' + Math.round(cpu * 100) + '%. Reduce retries, add jitter, and tune circuit breaker.';

        return {
          success: success,
          message: message,
          metrics: {
            latencyP99: latencyP99,
            errorRate: Number(errorRate.toFixed(4)),
            downstreamCpu: Number(cpu.toFixed(2)),
            effectiveRps: Math.round(totalRps)
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Exponential Backoff with Full Jitter & Circuit Breaker',
        summary: 'Replace the aggressive 8-attempt static 50ms retry loop in AuthClient with capped exponential backoff, full randomized jitter, and a fast-failing circuit breaker when downstream failures spike.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Static 50ms retry loop with 8 attempts and no circuit breaker",
          "class AuthClient {",
          "  constructor(options = {}) {",
          "    this.maxRetries = options.maxRetries ?? 8;",
          "    this.baseBackoffMs = options.baseBackoffMs ?? 50;",
          "    this.maxBackoffMs = options.maxBackoffMs ?? 2000;",
          "    this.failureThreshold = options.failureThreshold ?? 5;",
          "    this.consecutiveFailures = 0;",
          "    this.circuitOpenUntil = 0;",
          "  }",
          "",
          "  computeBackoffMs(attempt, randFn = Math.random) {",
          "    // TODO: Replace static backoff with capped exponential backoff + full jitter:",
          "    // cap = Math.min(this.maxBackoffMs, this.baseBackoffMs * Math.pow(2, attempt))",
          "    // return Math.floor(randFn() * cap)",
          "    return this.baseBackoffMs;",
          "  }",
          "",
          "  callTokenEndpoint(rpcFn, now = Date.now()) {",
          "    // TODO: Reject immediately with Error('CIRCUIT_OPEN') if now < this.circuitOpenUntil",
          "    // TODO: Limit retries to <= 3 and trip circuitOpenUntil = now + 10000 when",
          "    // consecutiveFailures >= this.failureThreshold",
          "    let lastErr;",
          "    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {",
          "      try {",
          "        return rpcFn(attempt);",
          "      } catch (err) {",
          "        lastErr = err;",
          "        this.consecutiveFailures++;",
          "      }",
          "    }",
          "    throw lastErr;",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "'use strict';",
          "",
          "// FIXED CODE: Capped exponential backoff with full jitter + fast-failing circuit breaker",
          "class AuthClient {",
          "  constructor(options = {}) {",
          "    this.maxRetries = Math.min(options.maxRetries ?? 3, 3);",
          "    this.baseBackoffMs = Math.max(options.baseBackoffMs ?? 150, 100);",
          "    this.maxBackoffMs = options.maxBackoffMs ?? 2000;",
          "    this.failureThreshold = options.failureThreshold ?? 5;",
          "    this.cooldownMs = options.cooldownMs ?? 10000;",
          "    this.consecutiveFailures = 0;",
          "    this.circuitOpenUntil = 0;",
          "  }",
          "",
          "  computeBackoffMs(attempt, randFn = Math.random) {",
          "    const expCap = Math.min(this.maxBackoffMs, this.baseBackoffMs * Math.pow(2, attempt));",
          "    return Math.floor(randFn() * expCap);",
          "  }",
          "",
          "  callTokenEndpoint(rpcFn, now = Date.now()) {",
          "    if (now < this.circuitOpenUntil) {",
          "      const err = new Error('CIRCUIT_OPEN');",
          "      err.code = 'CIRCUIT_OPEN';",
          "      throw err;",
          "    }",
          "    let lastErr;",
          "    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {",
          "      if (now < this.circuitOpenUntil) {",
          "        const err = new Error('CIRCUIT_OPEN');",
          "        err.code = 'CIRCUIT_OPEN';",
          "        throw err;",
          "      }",
          "      try {",
          "        const res = rpcFn(attempt);",
          "        this.consecutiveFailures = 0;",
          "        return res;",
          "      } catch (err) {",
          "        lastErr = err;",
          "        this.consecutiveFailures++;",
          "        if (this.consecutiveFailures >= this.failureThreshold) {",
          "          this.circuitOpenUntil = now + this.cooldownMs;",
          "          break;",
          "        }",
          "      }",
          "    }",
          "    throw lastErr;",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "'use strict';",
          "const assert = require('node:assert');",
          "",
          "const client = new AuthClient({ baseBackoffMs: 200, maxBackoffMs: 2000, failureThreshold: 4 });",
          "assert.ok(client.maxRetries <= 3, 'Max retries must be capped at <= 3 to prevent amplification');",
          "",
          "// 1. Verify exponential growth + full jitter dispersion across deterministic seeds",
          "const b0 = client.computeBackoffMs(0, () => 0.5);",
          "const b2 = client.computeBackoffMs(2, () => 0.5);",
          "assert.ok(b2 > b0 * 2, `Attempt 2 backoff (${b2}ms) must scale exponentially over attempt 0 (${b0}ms)`);",
          "assert.strictEqual(client.computeBackoffMs(2, () => 0.0), 0, 'Full jitter at rand=0 should start at 0ms');",
          "",
          "// 2. Verify circuit breaker trips open and stops hammering downstream",
          "let downstreamCalls = 0;",
          "const failingRpc = () => { downstreamCalls++; throw new Error('504_TIMEOUT'); };",
          "assert.throws(() => client.callTokenEndpoint(failingRpc, 1000), /504_TIMEOUT/);",
          "assert.strictEqual(downstreamCalls, 4, 'Should stop retrying immediately once failureThreshold (4) is reached');",
          "",
          "// 3. Subsequent calls during cooldown must fast-fail with CIRCUIT_OPEN without invoking rpcFn",
          "assert.throws(() => client.callTokenEndpoint(failingRpc, 2000), /CIRCUIT_OPEN/);",
          "assert.strictEqual(downstreamCalls, 4, 'Open circuit must shed load with 0 downstream RPC calls');",
          "console.log('[PASS] AuthClient retry storm hotfix verified!');"
        ].join('\n')
      }
    },

    {
      id: 'cache-stampede-meltdown',
      relatedSlugs: ["cache-concurrency-control","cache-availability-and-database-fallback","caching-layers","distributed-cache-design"],
      title: 'Midnight Flash Sale Cache Stampede',
      difficulty: 'easy',
      category: 'Caching & In-Memory',
      trackId: 'storage',
      xp: 50,
      estimatedMinutes: 15,
      symptoms: [
        'Redis cache key "flash_deals_catalog" expired precisely at 00:00:00 UTC.',
        '55,000 concurrent shopper requests immediately bypassed cache and hammered Postgres primary.',
        'Postgres DB max_connections (500) reached; backend services throwing "FATAL: remaining connection slots reserved".'
      ],
      metricsAndLogs: {
        errorRate: 0.92,
        latencyP99: 8900,
        dbConnectionsActive: 500,
        cacheHitRatio: 0.12,
        timeseries: [
          { time: '-5m', cacheHitRatio: 0.998, dbConnectionsActive: 22, errorRate: 0.00, latencyP99: 8 },
          { time: '-1m', cacheHitRatio: 0.997, dbConnectionsActive: 25, errorRate: 0.00, latencyP99: 9 },
          { time: '00:00:00', cacheHitRatio: 0.08, dbConnectionsActive: 500, errorRate: 0.88, latencyP99: 7200 },
          { time: '+1m', cacheHitRatio: 0.12, dbConnectionsActive: 500, errorRate: 0.92, latencyP99: 8900 }
        ],
        logs: [
          { timestamp: '00:00:00.004', level: 'INFO', service: 'redis-cluster', message: 'Key [flash_deals_catalog] TTL expired. Removed from memory.' },
          { timestamp: '00:00:00.118', level: 'ERROR', service: 'catalog-service', message: 'Postgres connection pool exhausted (active=500/500). Query wait timeout 5000ms.' },
          { timestamp: '00:00:00.410', level: 'FATAL', service: 'postgres-primary', message: 'Process worker out of memory or connection slots. Rejecting client PID 29141.' }
        ]
      },
      slaImpact: 'Flash sale landing page completely inaccessible. 92% request drop. Conversion plummeted to zero.',
      rootCauses: [
        { id: 'rc-1', description: 'Hard expiration without probabilistic early recompute or singleflight mutex collapse, allowing thousands of concurrent workers to execute the expensive catalog DB query simultaneously', correct: true },
        { id: 'rc-2', description: 'Redis memory max limit exceeded triggering passive key eviction', correct: false },
        { id: 'rc-3', description: 'Postgres replica replication lag exceeded 15 seconds', correct: false }
      ],
      invariants: [
        'Postgres active connections must remain under 80',
        'Catalog page P99 latency must be under 30ms',
        'Cache hit ratio must be >= 99.0%',
        'Zero 5xx database connection errors'
      ],
      interactiveTuning: [
        { id: 'singleflightMutex', label: 'Singleflight / Mutex Locking', type: 'select', options: ['disabled', 'enabled'], defaultValue: 'disabled', description: 'Collapse concurrent cache misses for the same key into a single DB query.' },
        { id: 'earlyRecompute', label: 'Probabilistic Early Expiry (XFetch)', type: 'select', options: ['off', 'x-fetch-optimal'], defaultValue: 'off', description: 'Background recomputation before TTL expires based on request frequency and query time.' },
        { id: 'cacheTtlJitterPercent', label: 'TTL Jitter Percentage', type: 'range', min: 0, max: 50, step: 5, defaultValue: 0, unit: '%', description: 'Adds random delta to TTL to prevent synchronized expiration.' },
        { id: 'dbConnectionPoolMax', label: 'DB Pool Max Size', type: 'range', min: 20, max: 500, step: 20, defaultValue: 400, unit: 'conns', description: 'Cap on active database client connection pool.' }
      ],
      verify: function (knobValues) {
        var singleflight = knobValues.singleflightMutex === 'enabled';
        var xFetch = knobValues.earlyRecompute === 'x-fetch-optimal';
        var jitter = Number(knobValues.cacheTtlJitterPercent != null ? knobValues.cacheTtlJitterPercent : 0);
        var poolMax = Number(knobValues.dbConnectionPoolMax != null ? knobValues.dbConnectionPoolMax : 400);

        var dbHitsPerSec = 50000;
        if (singleflight) dbHitsPerSec = 1; // Only 1 query executes concurrently
        if (xFetch) dbHitsPerSec = Math.min(dbHitsPerSec, 2);

        var hitRatio = singleflight || xFetch ? 0.999 : (jitter > 20 ? 0.85 : 0.15);
        var activeConns = Math.min(poolMax, Math.round(dbHitsPerSec * 8));
        if (activeConns < 10) activeConns = 14;

        var latencyP99 = (singleflight || xFetch) ? 12 : Math.min(9500, activeConns * 22);
        var errorRate = activeConns >= poolMax ? 0.88 : (singleflight || xFetch ? 0.00 : 0.25);

        var success = (singleflight || xFetch) && poolMax <= 120;

        var msg = success
          ? 'Cache Stampede neutralized! Singleflight collapsed 55,000 queries into 1 background query. DB connections: ' + activeConns + ', Cache Hit: ' + (hitRatio * 100).toFixed(1) + '%.'
          : 'Stampede ongoing. DB connections saturated (' + activeConns + '/' + poolMax + '). Enable Singleflight or XFetch and constrain DB pool size.';

        return {
          success: success,
          message: msg,
          metrics: {
            cacheHitRatio: hitRatio,
            dbConnectionsActive: activeConns,
            latencyP99: latencyP99,
            errorRate: errorRate
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Singleflight Request Coalescing & Jittered TTL',
        summary: 'Eliminate the midnight flash-sale cache stampede by coalescing concurrent cache misses for the same key into a single shared in-flight Promise (Singleflight) and applying randomized TTL jitter.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Unprotected cache miss allows 50,000 concurrent callers to hit Postgres",
          "class CatalogCache {",
          "  constructor(options = {}) {",
          "    this.ttlMs = options.ttlMs ?? 60000;",
          "    this.jitterRatio = options.jitterRatio ?? 0.2;",
          "    this.store = new Map();",
          "    this.inFlight = new Map();",
          "  }",
          "",
          "  computeJitteredTtl(randFn = Math.random) {",
          "    // TODO: Add positive randomized jitter up to this.jitterRatio * this.ttlMs",
          "    return this.ttlMs;",
          "  }",
          "",
          "  getOrFetch(key, dbQueryFn, now = Date.now()) {",
          "    const entry = this.store.get(key);",
          "    if (entry && now < entry.expiresAt) {",
          "      return entry.value;",
          "    }",
          "    // TODO: Implement Singleflight request coalescing using this.inFlight Map",
          "    // so concurrent misses for `key` share a single in-flight request!",
          "    const value = dbQueryFn(key);",
          "    this.store.set(key, { value, expiresAt: now + this.computeJitteredTtl() });",
          "    return value;",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "'use strict';",
          "",
          "// FIXED CODE: Singleflight in-flight request coalescing + jittered TTL",
          "class CatalogCache {",
          "  constructor(options = {}) {",
          "    this.ttlMs = options.ttlMs ?? 60000;",
          "    this.jitterRatio = options.jitterRatio ?? 0.2;",
          "    this.store = new Map();",
          "    this.inFlight = new Map();",
          "  }",
          "",
          "  computeJitteredTtl(randFn = Math.random) {",
          "    const delta = Math.floor(randFn() * this.ttlMs * this.jitterRatio);",
          "    return this.ttlMs + Math.max(1, delta);",
          "  }",
          "",
          "  getOrFetch(key, dbQueryFn, now = Date.now()) {",
          "    const entry = this.store.get(key);",
          "    if (entry && now < entry.expiresAt) {",
          "      return entry.value;",
          "    }",
          "    if (this.inFlight.has(key)) {",
          "      return this.inFlight.get(key);",
          "    }",
          "    let settled = false;",
          "    let result;",
          "    const sharedHandle = {",
          "      resolve: () => {",
          "        if (!settled) {",
          "          try {",
          "            result = dbQueryFn(key);",
          "            this.store.set(key, {",
          "              value: result,",
          "              expiresAt: now + this.computeJitteredTtl()",
          "            });",
          "            settled = true;",
          "          } finally {",
          "            this.inFlight.delete(key);",
          "          }",
          "        }",
          "        return result;",
          "      }",
          "    };",
          "    this.inFlight.set(key, sharedHandle);",
          "    return sharedHandle.resolve();",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "'use strict';",
          "const assert = require('node:assert');",
          "",
          "const cache = new CatalogCache({ ttlMs: 10000, jitterRatio: 0.25 });",
          "let dbQueriesExecuted = 0;",
          "const reentrantDbQuery = (k) => {",
          "  dbQueriesExecuted++;",
          "  // Simulate 50 concurrent shoppers arriving while the first DB query is still in-flight",
          "  if (dbQueriesExecuted === 1) {",
          "    for (let i = 0; i < 50; i++) {",
          "      const coalesced = cache.getOrFetch(k, () => { dbQueriesExecuted++; return null; }, 1000);",
          "      assert.ok(coalesced, 'Concurrent miss must receive in-flight Singleflight handle or cached value');",
          "    }",
          "  }",
          "  return { key: k, deals: ['GPU-5090', 'NVMe-4TB'] };",
          "};",
          "",
          "const first = cache.getOrFetch('flash_deals_catalog', reentrantDbQuery, 1000);",
          "assert.strictEqual(dbQueriesExecuted, 1, `Expected Singleflight to collapse 51 concurrent misses into 1 DB query, got ${dbQueriesExecuted}`);",
          "assert.deepStrictEqual(first.deals, ['GPU-5090', 'NVMe-4TB']);",
          "assert.strictEqual(cache.inFlight.size, 0, 'inFlight map must be cleaned up after resolution');",
          "",
          "// Verify TTL jitter adds spread",
          "assert.ok(cache.computeJitteredTtl(() => 0.8) > 10000, 'TTL jitter must spread expiration timestamps');",
          "console.log('[PASS] CatalogCache Singleflight stampede protection verified!');"
        ].join('\n')
      }
    },

    {
      id: 'rate-limiter-leak',
      relatedSlugs: ["sliding-window-rate-limiter","rate-limiter-placement-and-keys","rate-limiting-and-abuse-prevention-case-study","ttl-expiration-and-cache-reapers"],
      title: 'DDoS Attack Redis Rate Limiter Memory Leak',
      difficulty: 'easy',
      category: 'Distributed Systems',
      trackId: 'foundation',
      xp: 50,
      estimatedMinutes: 15,
      symptoms: [
        'Redis rate limiter cluster memory usage exploded to 100% (16GB/16GB).',
        'Redis logs throwing `OOM command not allowed when used memory > maxmemory`.',
        'All API requests failing at gateway with HTTP 500 Internal Server Error because rate limiter check threw an exception.'
      ],
      metricsAndLogs: {
        errorRate: 0.98,
        latencyP99: 4500,
        redisMemoryMb: 16384,
        maxMemoryMb: 16384,
        timeseries: [
          { time: '-10m', redisMemoryMb: 3200, errorRate: 0.00, latencyP99: 5 },
          { time: '-5m', redisMemoryMb: 8900, errorRate: 0.00, latencyP99: 8 },
          { time: '-1m', redisMemoryMb: 15800, errorRate: 0.12, latencyP99: 120 },
          { time: '0m', redisMemoryMb: 16384, errorRate: 0.98, latencyP99: 4500 }
        ],
        logs: [
          { timestamp: '10:14:02.012', level: 'WARN', service: 'edge-gateway', message: 'DDoS attack detected: 250,000 distinct spoofed IP addresses hitting /v1/login.' },
          { timestamp: '10:14:22.845', level: 'ERROR', service: 'redis-node-1', message: 'OOM command not allowed when used memory > maxmemory (16384MB). Command: ZADD.' },
          { timestamp: '10:14:22.890', level: 'FATAL', service: 'rate-limiter-svc', message: 'Fail-closed policy triggered: rejecting all user traffic with 500 error.' }
        ]
      },
      slaImpact: 'Global API downtime for 100% of authentic users due to fail-closed rate limit verification.',
      rootCauses: [
        { id: 'rc-1', description: 'Rate limiter used sliding window sorted set without setting key TTL, combined with Redis `noeviction` maxmemory policy and fail-closed gateway handling', correct: true },
        { id: 'rc-2', description: 'Corrupt Redis AOF persistence file', correct: false },
        { id: 'rc-3', description: 'TCP SYN flood overwhelming OS network interface buffers', correct: false }
      ],
      invariants: [
        'Redis memory usage must stay under 6,000 MB',
        'Rate limiter check latency must stay under 5ms',
        'Legitimate user error rate must be 0%',
        'Gateway must fail-open or degrade gracefully under rate limiter unavailability'
      ],
      interactiveTuning: [
        { id: 'keyTtlSeconds', label: 'Key TTL Expiration', type: 'range', min: 0, max: 3600, step: 60, defaultValue: 0, unit: 'seconds', description: 'TTL attached to every IP sliding window key in Redis.' },
        { id: 'evictionPolicy', label: 'Redis Maxmemory Policy', type: 'select', options: ['noeviction', 'allkeys-lru', 'volatile-ttl'], defaultValue: 'noeviction', description: 'How Redis behaves when reaching maximum allocated memory.' },
        { id: 'failureMode', label: 'Gateway Limiter Failure Mode', type: 'select', options: ['fail-closed', 'fail-open'], defaultValue: 'fail-closed', description: 'Action to take if Redis rate limiter fails or times out.' },
        { id: 'algorithm', label: 'Rate Limiting Algorithm', type: 'select', options: ['sliding-window-zset', 'token-bucket-hash'], defaultValue: 'sliding-window-zset', description: 'Memory representation of rate limit counters.' }
      ],
      verify: function (knobValues) {
        var ttl = Number(knobValues.keyTtlSeconds != null ? knobValues.keyTtlSeconds : 0);
        var eviction = knobValues.evictionPolicy || 'noeviction';
        var failureMode = knobValues.failureMode || 'fail-closed';
        var algo = knobValues.algorithm || 'sliding-window-zset';

        var memMultiplier = (algo === 'sliding-window-zset' ? 1.0 : 0.15);
        var memoryMb = (ttl === 0 && eviction === 'noeviction') ? 16384 : Math.round(2500 * memMultiplier + (ttl > 0 ? (ttl / 60) * 80 : 500));
        var oom = (memoryMb >= 16000 && eviction === 'noeviction');

        var errorRate = oom ? (failureMode === 'fail-closed' ? 0.98 : 0.02) : 0.00;
        var latencyP99 = oom ? (failureMode === 'fail-closed' ? 4500 : 8) : 3;

        var success = (ttl >= 60 && ttl <= 600 && eviction !== 'noeviction' && failureMode === 'fail-open');

        var msg = success
          ? 'Rate Limiter Hardened! Key TTL of ' + ttl + 's and volatile-ttl eviction keep Redis memory at ' + memoryMb + ' MB. Fail-open ensures 0 authentic user disruptions.'
          : 'Vulnerability persists. Current memory: ' + memoryMb + ' MB. Ensure key TTL is configured (60-600s), eviction is enabled, and fail-open is configured.';

        return {
          success: success,
          message: msg,
          metrics: {
            redisMemoryMb: memoryMb,
            errorRate: errorRate,
            latencyP99: latencyP99
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Bounded TTL Sliding Window & Fail-Open Gateway Guard',
        summary: 'Fix the Redis rate limiter memory leak by pruning expired timestamps, expiring idle IP buckets with a strict TTL, and failing open gracefully when the backing store throws OOM.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Unbounded IP bucket memory growth + fail-closed OOM crash",
          "class SlidingWindowRateLimiter {",
          "  constructor(options = {}) {",
          "    this.windowMs = options.windowMs ?? 60000;",
          "    this.limit = options.limit ?? 100;",
          "    this.buckets = new Map(); // ip -> { timestamps: [], expiresAt: null }",
          "    this.simulateOom = false;",
          "  }",
          "",
          "  evictExpiredKeys(now = Date.now()) {",
          "    // TODO: Delete any key in this.buckets whose expiresAt <= now",
          "  }",
          "",
          "  checkRequest(ip, now = Date.now()) {",
          "    // TODO: Wrap store operations in try/catch so OOM errors fail-open:",
          "    // return { allowed: true, degraded: true }",
          "    if (this.simulateOom) {",
          "      throw new Error('OOM command not allowed when used memory > maxmemory');",
          "    }",
          "    let bucket = this.buckets.get(ip);",
          "    if (!bucket) {",
          "      bucket = { timestamps: [], expiresAt: Infinity };",
          "      this.buckets.set(ip, bucket);",
          "    }",
          "    // TODO: Prune timestamps older than (now - this.windowMs) and set bucket.expiresAt = now + this.windowMs",
          "    bucket.timestamps.push(now);",
          "    return { allowed: bucket.timestamps.length <= this.limit, degraded: false };",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "'use strict';",
          "",
          "// FIXED CODE: Sliding window pruning + key TTL eviction + fail-open OOM resilience",
          "class SlidingWindowRateLimiter {",
          "  constructor(options = {}) {",
          "    this.windowMs = options.windowMs ?? 60000;",
          "    this.limit = options.limit ?? 100;",
          "    this.buckets = new Map();",
          "    this.simulateOom = false;",
          "  }",
          "",
          "  evictExpiredKeys(now = Date.now()) {",
          "    for (const [ip, bucket] of this.buckets.entries()) {",
          "      if (bucket.expiresAt <= now) {",
          "        this.buckets.delete(ip);",
          "      }",
          "    }",
          "  }",
          "",
          "  checkRequest(ip, now = Date.now()) {",
          "    try {",
          "      if (this.simulateOom) {",
          "        throw new Error('OOM command not allowed when used memory > maxmemory');",
          "      }",
          "      this.evictExpiredKeys(now);",
          "      const windowStart = now - this.windowMs;",
          "      let bucket = this.buckets.get(ip);",
          "      if (!bucket) {",
          "        bucket = { timestamps: [], expiresAt: now + this.windowMs };",
          "        this.buckets.set(ip, bucket);",
          "      }",
          "      bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);",
          "      bucket.expiresAt = now + this.windowMs;",
          "      if (bucket.timestamps.length >= this.limit) {",
          "        return { allowed: false, degraded: false };",
          "      }",
          "      bucket.timestamps.push(now);",
          "      return { allowed: true, degraded: false };",
          "    } catch (err) {",
          "      return { allowed: true, degraded: true, error: err.message };",
          "    }",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "'use strict';",
          "const assert = require('node:assert');",
          "",
          "const limiter = new SlidingWindowRateLimiter({ windowMs: 1000, limit: 3 });",
          "",
          "// 1. Simulate 500 spoofed DDoS IPs at t=1000ms",
          "for (let i = 0; i < 500; i++) {",
          "  limiter.checkRequest(`10.0.0.${i}`, 1000);",
          "}",
          "assert.strictEqual(limiter.buckets.size, 500);",
          "",
          "// 2. After TTL window elapses (t=2500ms), spoofed IP keys must be evicted",
          "const resAfterTtl = limiter.checkRequest('192.168.1.1', 2500);",
          "assert.strictEqual(resAfterTtl.allowed, true);",
          "assert.strictEqual(limiter.buckets.size, 1, 'Expired DDoS IP keys must be evicted via TTL');",
          "",
          "// 3. Verify sliding window rate limit accuracy",
          "assert.strictEqual(limiter.checkRequest('192.168.1.1', 2600).allowed, true);",
          "assert.strictEqual(limiter.checkRequest('192.168.1.1', 2700).allowed, true);",
          "assert.strictEqual(limiter.checkRequest('192.168.1.1', 2800).allowed, false, '4th request in window must be rate-limited');",
          "",
          "// 4. Verify fail-open when Redis throws OOM",
          "limiter.simulateOom = true;",
          "const oomRes = limiter.checkRequest('192.168.1.99', 2900);",
          "assert.strictEqual(oomRes.allowed, true, 'Must fail-open on Redis OOM to protect authentic user traffic');",
          "assert.strictEqual(oomRes.degraded, true);",
          "console.log('[PASS] SlidingWindowRateLimiter TTL & fail-open hotfix verified!');"
        ].join('\n')
      }
    },

    // ==========================================
    // TIER: MEDIUM (4)
    // ==========================================
    {
      id: 'hot-partition-herd',
      relatedSlugs: ["hot-partitions","partitioned-log-system-design","sharding-and-partitioning","consistent-hashing"],
      title: 'Kafka Skewed Partition Lag Spiral',
      difficulty: 'medium',
      category: 'Data & Scale',
      trackId: 'data-scale',
      xp: 100,
      estimatedMinutes: 20,
      symptoms: [
        'Order fulfillment pipeline lag on Partition 0 exceeded 4,500,000 messages.',
        'Partitions 1, 2, and 3 are completely idle (0 lag, 2% consumer CPU).',
        'Consumer instance attached to Partition 0 is crashing with Out Of Memory errors every 3 minutes.'
      ],
      metricsAndLogs: {
        errorRate: 0.42,
        partition0Lag: 4500000,
        otherPartitionsLagAvg: 12,
        consumerCpuP0: 1.00,
        timeseries: [
          { time: '-15m', partition0Lag: 120000, consumerCpuP0: 0.85, errorRate: 0.02 },
          { time: '-10m', partition0Lag: 1200000, consumerCpuP0: 0.98, errorRate: 0.15 },
          { time: '-5m', partition0Lag: 2800000, consumerCpuP0: 1.00, errorRate: 0.31 },
          { time: '0m', partition0Lag: 4500000, consumerCpuP0: 1.00, errorRate: 0.42 }
        ],
        logs: [
          { timestamp: '16:20:00.100', level: 'WARN', service: 'kafka-producer', message: 'Publishing order event with partition key "US" (default country code fallback).' },
          { timestamp: '16:20:01.420', level: 'ERROR', service: 'order-consumer-p0', message: 'GC overhead limit exceeded: heap 4096MB/4096MB consumed. Crashing container.' },
          { timestamp: '16:20:05.890', level: 'WARN', service: 'kafka-coordinator', message: 'Consumer group rebalance triggered by consumer heartbeat timeout.' }
        ]
      },
      slaImpact: 'US customer order dispatch delayed by > 2 hours. Violating same-day dispatch SLA.',
      rootCauses: [
        { id: 'rc-1', description: 'Kafka broker disk failure on broker node 1', correct: false },
        { id: 'rc-2', description: 'Producers keyed all US orders with static key "US" rather than high-entropy compound key like `userId` or `orderId`, funneling 92% of global volume into partition 0', correct: true },
        { id: 'rc-3', description: 'Network MTU mismatch between Kubernetes worker nodes', correct: false }
      ],
      invariants: [
        'Partition traffic skew variance must be < 10% across all partitions',
        'Total consumer group lag must drain to < 1,000 messages',
        'Consumer CPU must remain under 65% across all workers',
        'Rebalance storm frequency must drop to 0'
      ],
      interactiveTuning: [
        { id: 'partitionKeyStrategy', label: 'Partition Key Strategy', type: 'select', options: ['country_code', 'user_id', 'order_id_murmur3'], defaultValue: 'country_code', description: 'Field and hashing algorithm used to assign messages to partitions.' },
        { id: 'partitionCount', label: 'Total Topic Partitions', type: 'range', min: 4, max: 64, step: 4, defaultValue: 4, unit: 'partitions', description: 'Number of partitions available for parallel consumption.' },
        { id: 'consumerWorkers', label: 'Consumer Pod Count', type: 'range', min: 2, max: 32, step: 2, defaultValue: 4, unit: 'pods', description: 'Number of parallel consumer workers in the consumer group.' },
        { id: 'fetchMaxBytesMb', label: 'Fetch Max Bytes', type: 'range', min: 1, max: 50, step: 1, defaultValue: 35, unit: 'MB', description: 'Maximum batch size pulled by consumer per poll request.' }
      ],
      verify: function (knobValues) {
        var keyStrat = knobValues.partitionKeyStrategy || 'country_code';
        var parts = Number(knobValues.partitionCount != null ? knobValues.partitionCount : 4);
        var workers = Number(knobValues.consumerWorkers != null ? knobValues.consumerWorkers : 4);
        var fetchMb = Number(knobValues.fetchMaxBytesMb != null ? knobValues.fetchMaxBytesMb : 35);

        var skew = (keyStrat === 'country_code') ? 0.92 : (keyStrat === 'user_id' ? 0.12 : 0.02);
        var effectiveWorkers = Math.min(parts, workers);

        var lag = Math.round((skew * 4500000) / (effectiveWorkers * (40 / Math.max(fetchMb, 5))));
        if (keyStrat === 'order_id_murmur3' && parts >= 16 && workers >= 16) {
          lag = 120;
        }

        var cpu = (keyStrat === 'country_code') ? 1.0 : Math.min(0.9, 0.2 + (lag / 100000) * 0.4);
        var errorRate = lag > 50000 ? 0.35 : (lag > 5000 ? 0.05 : 0.00);

        var success = (keyStrat === 'order_id_murmur3' && parts >= 16 && workers >= 8 && fetchMb <= 15);

        var msg = success
          ? 'Kafka Skew Resolved! Uniform murmur3 hashing on order_id balanced load across ' + parts + ' partitions. Consumer lag drained to ' + lag + ' messages.'
          : 'High lag remains (' + lag.toLocaleString() + ' msgs). Select high-entropy partition key (order_id_murmur3), scale partitions & workers, and limit fetchMaxBytes.';

        return {
          success: success,
          message: msg,
          metrics: {
            partition0Lag: lag,
            consumerCpu: Number(cpu.toFixed(2)),
            errorRate: errorRate
          }
        };
      },
      codeFix: {
        title: 'Hotfix: High-Entropy OrderId Hashing & Partition Router',
        summary: 'Fix the Kafka producer partition skew where keying by countryCode ("US") funnels 92% of traffic into Partition 0. Route using a 32-bit FNV-1a/Murmur-style hash over high-cardinality orderId.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Low-cardinality countryCode partition key funnels 92% of orders to Partition 0",
          "class KafkaOrderPartitioner {",
          "  constructor(numPartitions = 16) {",
          "    this.numPartitions = numPartitions;",
          "  }",
          "",
          "  hashString(str) {",
          "    // FNV-1a 32-bit hash",
          "    let h = 0x811c9dc5;",
          "    for (let i = 0; i < str.length; i++) {",
          "      h ^= str.charCodeAt(i);",
          "      h = Math.imul(h, 0x01000193);",
          "    }",
          "    return h >>> 0;",
          "  }",
          "",
          "  selectPartition(orderEvent) {",
          "    // TODO: Replace low-cardinality countryCode fallback with high-entropy",
          "    // composite key using orderEvent.orderId (or userId) so US traffic spreads",
          "    // evenly across all partitions while keeping identical orderIds ordered!",
          "    const routingKey = orderEvent.countryCode || 'US';",
          "    return 0; // Static skew bug",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "'use strict';",
          "",
          "// FIXED CODE: High-cardinality orderId FNV-1a/Murmur-style partition hashing",
          "class KafkaOrderPartitioner {",
          "  constructor(numPartitions = 16) {",
          "    this.numPartitions = numPartitions;",
          "  }",
          "",
          "  hashString(str) {",
          "    let h = 0x811c9dc5;",
          "    for (let i = 0; i < str.length; i++) {",
          "      h ^= str.charCodeAt(i);",
          "      h = Math.imul(h, 0x01000193);",
          "    }",
          "    h ^= h >>> 16;",
          "    h = Math.imul(h, 0x85ebca6b);",
          "    h ^= h >>> 13;",
          "    return h >>> 0;",
          "  }",
          "",
          "  selectPartition(orderEvent) {",
          "    const routingKey = String(orderEvent.orderId || orderEvent.userId || 'default');",
          "    return this.hashString(routingKey) % this.numPartitions;",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "'use strict';",
          "const assert = require('node:assert');",
          "",
          "const numPartitions = 16;",
          "const partitioner = new KafkaOrderPartitioner(numPartitions);",
          "const counts = new Array(numPartitions).fill(0);",
          "const totalOrders = 8000;",
          "",
          "for (let i = 0; i < totalOrders; i++) {",
          "  const event = { countryCode: 'US', orderId: `ORD-2026-${100000 + i}`, userId: `USR-${i % 1000}` };",
          "  const p = partitioner.selectPartition(event);",
          "  assert.ok(p >= 0 && p < numPartitions, `Invalid partition index ${p}`);",
          "  counts[p]++;",
          "}",
          "",
          "// Verify deterministic ordering for same orderId",
          "const pA = partitioner.selectPartition({ countryCode: 'US', orderId: 'ORD-SAME-99' });",
          "const pB = partitioner.selectPartition({ countryCode: 'US', orderId: 'ORD-SAME-99' });",
          "assert.strictEqual(pA, pB, 'Same orderId must deterministically map to same partition');",
          "",
          "// Verify uniform distribution across all 16 partitions (expected ~500 per partition)",
          "const maxCount = Math.max(...counts);",
          "const minCount = Math.min(...counts);",
          "assert.ok(minCount > 350 && maxCount < 650, `Partition skew too high: min=${minCount}, max=${maxCount}`);",
          "console.log('[PASS] KafkaOrderPartitioner uniform load distribution verified!');"
        ].join('\n')
      }
    },

    {
      id: 'circuit-breaker-flapping',
      relatedSlugs: ["circuit-breakers-and-timeouts","tail-latency","slos-and-error-budgets","incident-response"],
      title: 'Payment Gateway Circuit Breaker Flapping Loop',
      difficulty: 'medium',
      category: 'Resilience & Fault Tolerance',
      trackId: 'foundation',
      xp: 100,
      estimatedMinutes: 20,
      symptoms: [
        'Checkout payment service rapidly oscillating between CLOSED, OPEN, and HALF-OPEN every 3 seconds.',
        '40% of normal valid customer transactions randomly rejected with "503 Service Unavailable: Circuit Breaker Open".',
        'Upstream Stripe payment gateway is healthy, but internal circuit breaker configuration is hyper-sensitive.'
      ],
      metricsAndLogs: {
        errorRate: 0.41,
        flappingCyclesPerMin: 18,
        latencyP99: 1450,
        timeseries: [
          { time: '-4m', state: 'OPEN', errorRate: 0.95, latencyP99: 45 },
          { time: '-3m', state: 'HALF-OPEN', errorRate: 0.30, latencyP99: 220 },
          { time: '-2m', state: 'CLOSED', errorRate: 0.02, latencyP99: 180 },
          { time: '-1m', state: 'OPEN', errorRate: 0.98, latencyP99: 40 },
          { time: '0m', state: 'HALF-OPEN', errorRate: 0.41, latencyP99: 1450 }
        ],
        logs: [
          { timestamp: '11:15:00.010', level: 'WARN', service: 'payment-breaker', message: 'Failure rate 25% exceeds threshold 20% over 2s window (5 requests sampled). Tripping OPEN.' },
          { timestamp: '11:15:02.012', level: 'INFO', service: 'payment-breaker', message: 'Sleep window 2000ms elapsed. Transitioning to HALF-OPEN. Allowing 1 trial probe request.' },
          { timestamp: '11:15:02.150', level: 'WARN', service: 'payment-breaker', message: 'Trial probe failed due to transient 408 timeout. Immediately returning to OPEN.' }
        ]
      },
      slaImpact: 'Erratic checkout availability. Thousands of customers experiencing payment failures despite healthy payment processors.',
      rootCauses: [
        { id: 'rc-1', description: 'Payment processor is completely down worldwide', correct: false },
        { id: 'rc-2', description: 'Circuit breaker has an excessively short sliding window (2s), min request threshold of 5, and 2s sleep window, magnifying transient errors into continuous state oscillation', correct: true },
        { id: 'rc-3', description: 'TLS certificate expiration between gateway and bank', correct: false }
      ],
      invariants: [
        'Circuit breaker flapping cycles must drop to 0 per minute',
        'False positive transaction rejections must drop to 0.0%',
        'Legitimate payment P99 latency must stay under 350ms',
        'State must remain stable in CLOSED under normal transient network variance'
      ],
      interactiveTuning: [
        { id: 'rollingWindowSeconds', label: 'Rolling Window Size', type: 'range', min: 1, max: 60, step: 1, defaultValue: 2, unit: 'seconds', description: 'Time window over which failure rates are calculated.' },
        { id: 'minRequestThreshold', label: 'Min Request Volume', type: 'range', min: 5, max: 200, step: 5, defaultValue: 5, unit: 'requests', description: 'Minimum number of requests required in window before evaluating error percentage.' },
        { id: 'failureRateThreshold', label: 'Error Rate Threshold', type: 'range', min: 10, max: 90, step: 5, defaultValue: 20, unit: '%', description: 'Failure percentage required to trip breaker OPEN.' },
        { id: 'sleepWindowSeconds', label: 'Sleep Window (Reset Timeout)', type: 'range', min: 1, max: 60, step: 1, defaultValue: 2, unit: 'seconds', description: 'Duration breaker stays OPEN before testing downstream with HALF-OPEN probes.' },
        { id: 'halfOpenProbes', label: 'Half-Open Probe Count', type: 'range', min: 1, max: 20, step: 1, defaultValue: 1, unit: 'probes', description: 'Number of consecutive successful trials required to transition HALF-OPEN to CLOSED.' }
      ],
      verify: function (knobValues) {
        var windowSec = Number(knobValues.rollingWindowSeconds != null ? knobValues.rollingWindowSeconds : 2);
        var minReq = Number(knobValues.minRequestThreshold != null ? knobValues.minRequestThreshold : 5);
        var failThresh = Number(knobValues.failureRateThreshold != null ? knobValues.failureRateThreshold : 20);
        var sleepSec = Number(knobValues.sleepWindowSeconds != null ? knobValues.sleepWindowSeconds : 2);
        var probes = Number(knobValues.halfOpenProbes != null ? knobValues.halfOpenProbes : 1);

        // Flapping occurs if window is too small, min requests too small, or sleep too small
        var isFlapping = (windowSec < 10 || minReq < 30 || sleepSec < 10 || probes < 3);
        var cycles = isFlapping ? Math.round(60 / (Math.max(sleepSec, 1) + Math.max(windowSec, 1))) : 0;
        var errorRate = isFlapping ? 0.38 : (failThresh < 30 ? 0.08 : 0.001);
        var latency = isFlapping ? 1200 : 180;

        var success = (windowSec >= 15 && minReq >= 40 && failThresh >= 50 && sleepSec >= 15 && probes >= 5);

        var msg = success
          ? 'Circuit Breaker Stabilized! Rolling window: ' + windowSec + 's, min volume: ' + minReq + ' reqs, sleep: ' + sleepSec + 's eliminated false trips. Error rate: 0.1%.'
          : 'Circuit breaker continues flapping (' + cycles + ' cycles/min). Increase rolling window (>=15s), min request threshold (>=40), and half-open probe count (>=5).';

        return {
          success: success,
          message: msg,
          metrics: {
            flappingCyclesPerMin: cycles,
            errorRate: errorRate,
            latencyP99: latency
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Minimum Request Volume & Multi-Probe Half-Open State Machine',
        summary: 'Stop payment circuit breaker oscillation by enforcing a minimum request volume before evaluating error rate, and requiring K consecutive successful trial probes in HALF-OPEN before transitioning back to CLOSED.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Hyper-sensitive breaker trips on low volume and flaps on 1 probe",
          "class PaymentCircuitBreaker {",
          "  constructor(options = {}) {",
          "    this.minVolume = options.minVolume ?? 40;",
          "    this.errorThresholdRatio = options.errorThresholdRatio ?? 0.5;",
          "    this.sleepWindowMs = options.sleepWindowMs ?? 15000;",
          "    this.requiredHalfOpenProbes = options.requiredHalfOpenProbes ?? 5;",
          "    this.state = 'CLOSED';",
          "    this.outcomes = []; // array of booleans (true=success, false=failure)",
          "    this.openedAt = 0;",
          "    this.halfOpenSuccesses = 0;",
          "  }",
          "",
          "  canExecute(now = Date.now()) {",
          "    if (this.state === 'OPEN') {",
          "      if (now - this.openedAt >= this.sleepWindowMs) {",
          "        this.state = 'HALF-OPEN';",
          "        this.halfOpenSuccesses = 0;",
          "        return true;",
          "      }",
          "      return false;",
          "    }",
          "    return true;",
          "  }",
          "",
          "  recordOutcome(success, now = Date.now()) {",
          "    // TODO: In HALF-OPEN, if !success immediately re-open (state='OPEN', openedAt=now);",
          "    // if success, increment halfOpenSuccesses and only transition to CLOSED when",
          "    // halfOpenSuccesses >= this.requiredHalfOpenProbes (and reset outcomes=[]).",
          "    // TODO: In CLOSED, only trip OPEN if outcomes.length >= this.minVolume AND",
          "    // failureRatio >= this.errorThresholdRatio!",
          "    this.outcomes.push(success);",
          "    const failures = this.outcomes.filter((x) => !x).length;",
          "    if (failures / this.outcomes.length >= 0.2) {",
          "      this.state = 'OPEN';",
          "      this.openedAt = now;",
          "    }",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "'use strict';",
          "",
          "// FIXED CODE: Minimum volume guard + multi-probe HALF-OPEN hysteresis",
          "class PaymentCircuitBreaker {",
          "  constructor(options = {}) {",
          "    this.minVolume = options.minVolume ?? 40;",
          "    this.errorThresholdRatio = options.errorThresholdRatio ?? 0.5;",
          "    this.sleepWindowMs = options.sleepWindowMs ?? 15000;",
          "    this.requiredHalfOpenProbes = options.requiredHalfOpenProbes ?? 5;",
          "    this.state = 'CLOSED';",
          "    this.outcomes = [];",
          "    this.openedAt = 0;",
          "    this.halfOpenSuccesses = 0;",
          "  }",
          "",
          "  canExecute(now = Date.now()) {",
          "    if (this.state === 'OPEN') {",
          "      if (now - this.openedAt >= this.sleepWindowMs) {",
          "        this.state = 'HALF-OPEN';",
          "        this.halfOpenSuccesses = 0;",
          "        return true;",
          "      }",
          "      return false;",
          "    }",
          "    return true;",
          "  }",
          "",
          "  recordOutcome(success, now = Date.now()) {",
          "    if (this.state === 'HALF-OPEN') {",
          "      if (!success) {",
          "        this.state = 'OPEN';",
          "        this.openedAt = now;",
          "        this.halfOpenSuccesses = 0;",
          "        return;",
          "      }",
          "      this.halfOpenSuccesses++;",
          "      if (this.halfOpenSuccesses >= this.requiredHalfOpenProbes) {",
          "        this.state = 'CLOSED';",
          "        this.outcomes = [];",
          "        this.halfOpenSuccesses = 0;",
          "      }",
          "      return;",
          "    }",
          "",
          "    this.outcomes.push(success);",
          "    if (this.outcomes.length < this.minVolume) {",
          "      return;",
          "    }",
          "    const failures = this.outcomes.filter((x) => !x).length;",
          "    if (failures / this.outcomes.length >= this.errorThresholdRatio) {",
          "      this.state = 'OPEN';",
          "      this.openedAt = now;",
          "    }",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "'use strict';",
          "const assert = require('node:assert');",
          "",
          "const cb = new PaymentCircuitBreaker({ minVolume: 20, errorThresholdRatio: 0.5, sleepWindowMs: 5000, requiredHalfOpenProbes: 4 });",
          "",
          "// 1. Low volume transient failures (3 failures out of 5) must NOT trip breaker",
          "cb.recordOutcome(false, 100); cb.recordOutcome(false, 110); cb.recordOutcome(true, 120);",
          "cb.recordOutcome(false, 130); cb.recordOutcome(true, 140);",
          "assert.strictEqual(cb.state, 'CLOSED', 'Must stay CLOSED when sample size < minVolume (20)');",
          "",
          "// 2. Reaching minVolume with >= 50% error rate trips OPEN",
          "for (let i = 0; i < 15; i++) cb.recordOutcome(false, 200 + i);",
          "assert.strictEqual(cb.state, 'OPEN', 'Must trip OPEN once minVolume is met and error ratio >= 50%');",
          "assert.strictEqual(cb.canExecute(1000), false, 'Must reject calls while sleepWindowMs has not elapsed');",
          "",
          "// 3. Transition to HALF-OPEN after sleepWindowMs and require 4 consecutive probes",
          "assert.strictEqual(cb.canExecute(6000), true);",
          "assert.strictEqual(cb.state, 'HALF-OPEN');",
          "cb.recordOutcome(true, 6010); cb.recordOutcome(true, 6020); cb.recordOutcome(true, 6030);",
          "assert.strictEqual(cb.state, 'HALF-OPEN', 'Must remain HALF-OPEN after 3 of 4 required probes');",
          "cb.recordOutcome(true, 6040);",
          "assert.strictEqual(cb.state, 'CLOSED', 'Must close after 4th consecutive successful probe');",
          "console.log('[PASS] PaymentCircuitBreaker hysteresis and anti-flapping verified!');"
        ].join('\n')
      }
    },

    {
      id: 'wal-torn-write-corruption',
      relatedSlugs: ["database-wal-and-recovery","memtable-wal-and-sstable","end-to-end-checksums","log-structured-storage"],
      title: 'LSM-Tree Crash Recovery Torn Write Corruption',
      difficulty: 'medium',
      category: 'Database & Storage Engine',
      trackId: 'storage',
      xp: 100,
      estimatedMinutes: 20,
      symptoms: [
        'Storage engine crashed after unexpected kernel panic and power loss.',
        'Upon node reboot, engine startup aborts with `FATAL: WAL record CRC mismatch at offset 0x3F8A20`.',
        'Database cannot mount SSTables; recovery loop restarts every 10 seconds.'
      ],
      metricsAndLogs: {
        errorRate: 1.00,
        recoveryStatus: 'ABORTED',
        corruptedRecords: 48,
        timeseries: [
          { time: '-10m', qps: 34000, unFlushedWalBytes: 4194304, errorRate: 0.00 },
          { time: '-2m', qps: 42000, unFlushedWalBytes: 16777216, errorRate: 0.00 },
          { time: '-1m', qps: 0, unFlushedWalBytes: 0, errorRate: 1.00 },
          { time: '0m', qps: 0, unFlushedWalBytes: 0, errorRate: 1.00 }
        ],
        logs: [
          { timestamp: '03:12:44.200', level: 'CRIT', service: 'kernel', message: 'Power interruption detected. Host hard reset.' },
          { timestamp: '03:13:02.100', level: 'INFO', service: 'lsm-engine', message: 'Replaying WAL log /data/wal/000042.wal from offset 0x0.' },
          { timestamp: '03:13:02.340', level: 'ERROR', service: 'lsm-engine', message: 'Torn write at offset 0x3F8A20: expected size 4096, found 1820 bytes. Zero checksum.' },
          { timestamp: '03:13:02.342', level: 'FATAL', service: 'lsm-engine', message: 'Engine cannot safely recover without data loss protocol. Terminating process.' }
        ]
      },
      slaImpact: 'Primary key-value store offline. Dependent services cannot authenticate users or fetch session state.',
      rootCauses: [
        { id: 'rc-1', description: 'Hard drive physical bad sectors', correct: false },
        { id: 'rc-2', description: 'WAL writes configured with asynchronous buffering without fsync group commit and missing block-level CRC32 checksum verification for torn-tail truncation', correct: true },
        { id: 'rc-3', description: 'Compaction tombstone accumulation', correct: false }
      ],
      invariants: [
        'Recovery must successfully replay valid WAL records without crashing',
        'Torn uncommitted records at the tail must be cleanly truncated with zero silent corruption',
        'Crash recovery time must take < 2.0 seconds',
        'Storage engine sustained QPS must exceed 30,000 ops/sec'
      ],
      interactiveTuning: [
        { id: 'walSyncMode', label: 'WAL Fsync Strategy', type: 'select', options: ['async_os_buffer', 'group_commit_fsync', 'strict_fsync_every_write'], defaultValue: 'async_os_buffer', description: 'Disk synchronization guarantee on transaction commit.' },
        { id: 'groupCommitIntervalMs', label: 'Group Commit Batch Window', type: 'range', min: 1, max: 50, step: 1, defaultValue: 20, unit: 'ms', description: 'Batching window for combining multiple concurrent transaction flushes.' },
        { id: 'checksumAlgorithm', label: 'Record Checksum Algorithm', type: 'select', options: ['none', 'crc32c', 'sha256'], defaultValue: 'none', description: 'Integrity checksum written to each WAL record header.' },
        { id: 'tornWritePolicy', label: 'Torn Tail Policy', type: 'select', options: ['abort_on_mismatch', 'truncate_tail_if_uncommitted'], defaultValue: 'abort_on_mismatch', description: 'Action taken upon encountering an unchecksummed or partial tail write during replay.' }
      ],
      verify: function (knobValues) {
        var sync = knobValues.walSyncMode || 'async_os_buffer';
        var interval = Number(knobValues.groupCommitIntervalMs != null ? knobValues.groupCommitIntervalMs : 20);
        var checksum = knobValues.checksumAlgorithm || 'none';
        var tornPolicy = knobValues.tornWritePolicy || 'abort_on_mismatch';

        var canRecover = (checksum === 'crc32c' || checksum === 'sha256') && (tornPolicy === 'truncate_tail_if_uncommitted');
        var recoveryTimeMs = canRecover ? 450 : 0;
        var errorRate = canRecover ? 0.00 : 1.00;
        var qps = (sync === 'strict_fsync_every_write') ? 1400 : (sync === 'group_commit_fsync' ? 38000 : 52000);

        var success = canRecover && (sync === 'group_commit_fsync' && interval <= 15);

        var msg = success
          ? 'Storage Engine Recovered! Group commit fsync ensures durability while maintaining ' + qps.toLocaleString() + ' QPS. Checksum + tail truncation allowed clean recovery in ' + recoveryTimeMs + 'ms.'
          : 'Storage engine failed to mount or performance collapsed. Ensure CRC32c checksum is enabled, torn tail is truncated, and group_commit_fsync is selected.';

        return {
          success: success,
          message: msg,
          metrics: {
            recoverySuccess: success,
            recoveredQps: qps,
            recoveryTimeMs: recoveryTimeMs,
            errorRate: errorRate
          }
        };
      },
      codeFix: {
        title: 'Hotfix: WAL Frame CRC32 Checksum & Torn-Tail Truncation',
        summary: 'Harden LSM-Tree Write-Ahead Log replay to verify frame lengths and 32-bit CRC checksums, safely truncating uncommitted torn tail records after power loss instead of aborting startup.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: WAL replay crashes on torn tail record after power loss",
          "class WalRecoveryEngine {",
          "  computeCrc32(str) {",
          "    let crc = 0xffffffff;",
          "    for (let i = 0; i < str.length; i++) {",
          "      crc ^= str.charCodeAt(i);",
          "      for (let j = 0; j < 8; j++) {",
          "        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);",
          "      }",
          "    }",
          "    return (crc ^ 0xffffffff) >>> 0;",
          "  }",
          "",
          "  encodeRecord(key, value) {",
          "    const payload = JSON.stringify({ key, value });",
          "    const crc = this.computeCrc32(payload);",
          "    return { expectedLen: payload.length, crc, payload };",
          "  }",
          "",
          "  recoverFromFrames(frames) {",
          "    const memtable = new Map();",
          "    let truncatedTailCount = 0;",
          "    for (let i = 0; i < frames.length; i++) {",
          "      const f = frames[i];",
          "      const isBadLength = !f.payload || f.payload.length !== f.expectedLen;",
          "      const isBadCrc = !isBadLength && this.computeCrc32(f.payload) !== f.crc;",
          "      if (isBadLength || isBadCrc) {",
          "        // TODO: Instead of crashing, truncate uncommitted torn tail frames safely",
          "        // (increment truncatedTailCount and break out of replay loop)!",
          "        throw new Error(`FATAL: WAL record CRC mismatch at frame ${i}`);",
          "      }",
          "      const rec = JSON.parse(f.payload);",
          "      memtable.set(rec.key, rec.value);",
          "    }",
          "    return { memtable, truncatedTailCount };",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "'use strict';",
          "",
          "// FIXED CODE: CRC32 frame verification + safe torn-tail truncation on crash recovery",
          "class WalRecoveryEngine {",
          "  computeCrc32(str) {",
          "    let crc = 0xffffffff;",
          "    for (let i = 0; i < str.length; i++) {",
          "      crc ^= str.charCodeAt(i);",
          "      for (let j = 0; j < 8; j++) {",
          "        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);",
          "      }",
          "    }",
          "    return (crc ^ 0xffffffff) >>> 0;",
          "  }",
          "",
          "  encodeRecord(key, value) {",
          "    const payload = JSON.stringify({ key, value });",
          "    const crc = this.computeCrc32(payload);",
          "    return { expectedLen: payload.length, crc, payload };",
          "  }",
          "",
          "  recoverFromFrames(frames) {",
          "    const memtable = new Map();",
          "    let truncatedTailCount = 0;",
          "    for (let i = 0; i < frames.length; i++) {",
          "      const f = frames[i];",
          "      const isBadLength = !f.payload || f.payload.length !== f.expectedLen;",
          "      const isBadCrc = !isBadLength && this.computeCrc32(f.payload) !== f.crc;",
          "      if (isBadLength || isBadCrc) {",
          "        truncatedTailCount = frames.length - i;",
          "        break;",
          "      }",
          "      const rec = JSON.parse(f.payload);",
          "      memtable.set(rec.key, rec.value);",
          "    }",
          "    return { memtable, truncatedTailCount };",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "'use strict';",
          "const assert = require('node:assert');",
          "",
          "const engine = new WalRecoveryEngine();",
          "const frames = [",
          "  engine.encodeRecord('session:101', 'active'),",
          "  engine.encodeRecord('session:102', 'active'),",
          "  engine.encodeRecord('balance:500', '1420.50'),",
          "  // Simulate power-loss torn write at WAL tail (half-written payload & bad CRC)",
          "  { expectedLen: 48, crc: 0xdeadbeef, payload: '{\"key\":\"balance:500\",\"val' }",
          "];",
          "",
          "const { memtable, truncatedTailCount } = engine.recoverFromFrames(frames);",
          "assert.strictEqual(truncatedTailCount, 1, 'Torn tail record must be cleanly truncated');",
          "assert.strictEqual(memtable.size, 3, 'All 3 committed records prior to torn tail must be recovered');",
          "assert.strictEqual(memtable.get('balance:500'), '1420.50');",
          "console.log('[PASS] WalRecoveryEngine CRC32 & torn-tail truncation verified!');"
        ].join('\n')
      }
    },

    {
      id: 'slow-consumer-queue-spiral',
      relatedSlugs: ["queue-lag","backpressure","task-queue-vs-event-stream","delegation-and-async-work"],
      title: 'RabbitMQ Memory Alarm Publisher Blockade',
      difficulty: 'medium',
      category: 'Data & Scale',
      trackId: 'data-scale',
      xp: 100,
      estimatedMinutes: 20,
      symptoms: [
        'RabbitMQ broker memory reached high watermark (8.2GB / 8.0GB threshold).',
        'Broker tripped memory alarm and blocked all publisher connections.',
        'Payment notification publishers hung indefinitely, causing API gateway worker thread starvation.'
      ],
      metricsAndLogs: {
        errorRate: 0.72,
        rabbitMemoryMb: 8200,
        unackedMessages: 280000,
        activePublishersBlocked: 48,
        timeseries: [
          { time: '-20m', rabbitMemoryMb: 2100, unackedMessages: 5000, errorRate: 0.00 },
          { time: '-10m', rabbitMemoryMb: 5200, unackedMessages: 95000, errorRate: 0.05 },
          { time: '-2m', rabbitMemoryMb: 7900, unackedMessages: 210000, errorRate: 0.22 },
          { time: '0m', rabbitMemoryMb: 8200, unackedMessages: 280000, errorRate: 0.72 }
        ],
        logs: [
          { timestamp: '18:40:02.100', level: 'WARN', service: 'rabbitmq-node-2', message: 'vm_memory_high_watermark set to 0.4. Allocating 8200MB out of 8000MB limit.' },
          { timestamp: '18:40:02.105', level: 'CRIT', service: 'rabbitmq-node-2', message: 'Memory alarm triggered! Blocking 48 publisher TCP sockets to preserve node integrity.' },
          { timestamp: '18:40:05.800', level: 'ERROR', service: 'webhook-worker', message: 'Slow downstream HTTP partner taking 5.2s per webhook. Worker prefetch=500 exhausted.' }
        ]
      },
      slaImpact: 'Webhook notifications stalled. Upstream payment APIs blocked and timing out.',
      rootCauses: [
        { id: 'rc-1', description: 'Consumer prefetch set to 500 with synchronous 5-second downstream HTTP calls and only 2 consumer threads, pulling hundreds of thousands of messages into unacked memory while processing < 1 msg/sec', correct: true },
        { id: 'rc-2', description: 'Network interface collision on port 5672', correct: false },
        { id: 'rc-3', description: 'RabbitMQ clustering split-brain between Erlang nodes', correct: false }
      ],
      invariants: [
        'Broker memory usage must stay below 4,000 MB (alarm cleared)',
        'Publisher connection blocking must be 0',
        'Unacknowledged message backlog must drain under 500',
        'Webhook delivery throughput must match ingress rate (> 250 msgs/sec)'
      ],
      interactiveTuning: [
        { id: 'consumerConcurrency', label: 'Consumer Thread Pool', type: 'range', min: 2, max: 128, step: 2, defaultValue: 2, unit: 'threads', description: 'Number of parallel webhook dispatch workers.' },
        { id: 'prefetchCount', label: 'QoS Prefetch Count', type: 'range', min: 1, max: 500, step: 5, defaultValue: 500, unit: 'msgs', description: 'Max unacknowledged messages delivered to a consumer channel.' },
        { id: 'httpTimeoutSeconds', label: 'Webhook HTTP Timeout', type: 'range', min: 1, max: 10, step: 1, defaultValue: 5, unit: 'seconds', description: 'Client timeout when sending HTTP post to external partners.' },
        { id: 'deadLetterQueue', label: 'Dead-Letter Routing on Timeout', type: 'select', options: ['disabled', 'dlq_after_3_retries'], defaultValue: 'disabled', description: 'Isolate permanently unresponsive partner endpoints away from main queue.' }
      ],
      verify: function (knobValues) {
        var workers = Number(knobValues.consumerConcurrency != null ? knobValues.consumerConcurrency : 2);
        var prefetch = Number(knobValues.prefetchCount != null ? knobValues.prefetchCount : 500);
        var timeout = Number(knobValues.httpTimeoutSeconds != null ? knobValues.httpTimeoutSeconds : 5);
        var dlq = knobValues.deadLetterQueue === 'dlq_after_3_retries';

        var drainCapacity = (workers / Math.max(timeout * 0.4, 0.5));
        var unacked = Math.min(280000, Math.round(workers * prefetch));
        var memoryMb = Math.round(1800 + (unacked * 0.02) + (dlq ? 0 : 1500));

        var alarmActive = memoryMb > 7000;
        var errorRate = alarmActive ? 0.72 : (drainCapacity < 200 ? 0.25 : 0.00);

        var success = (workers >= 64 && prefetch <= 30 && timeout <= 2 && dlq);

        var msg = success
          ? 'RabbitMQ Memory Alarm Cleared! Prefetch throttled to ' + prefetch + ' and workers scaled to ' + workers + '. Memory stabilized at ' + memoryMb + ' MB and publishers unblocked.'
          : 'Memory alarm still active (' + memoryMb + ' MB). Publishers blocked. Increase worker concurrency (>=64), reduce prefetch (<=30), reduce HTTP timeout, and enable DLQ.';

        return {
          success: success,
          message: msg,
          metrics: {
            rabbitMemoryMb: memoryMb,
            unackedMessages: unacked,
            errorRate: errorRate,
            drainRateMsgsSec: Math.round(drainCapacity)
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Bounded QoS Prefetch Semaphore & Timeout Dead-Lettering',
        summary: 'Prevent RabbitMQ consumer memory exhaustion by bounding in-flight unacknowledged messages with a concurrency semaphore, enforcing per-webhook HTTP timeouts, and routing poison messages to a Dead-Letter Queue.',
        buggyCode: [
          "// BUGGY INCIDENT CODE: Unbounded prefetch pulls entire queue into RAM and hangs on slow endpoints",
          "class WebhookQueueConsumer {",
          "  constructor(options = {}) {",
          "    this.prefetchLimit = options.prefetchLimit ?? 10;",
          "    this.timeoutMs = options.timeoutMs ?? 50;",
          "    this.maxRetries = options.maxRetries ?? 2;",
          "    this.inFlight = 0;",
          "    this.peakInFlight = 0;",
          "    this.acked = [];",
          "    this.dlq = [];",
          "  }",
          "",
          "  callWithTimeout(dispatchFn, msg) {",
          "    // TODO: If msg.latencyMs > this.timeoutMs, throw new Error('WEBHOOK_TIMEOUT')",
          "    return dispatchFn(msg);",
          "  }",
          "",
          "  drainQueue(messages, dispatchFn) {",
          "    // TODO: Bound concurrent in-flight batch size to at most this.prefetchLimit!",
          "    // TODO: Retry failed/timed-out messages up to this.maxRetries; on exhaustion push to this.dlq",
          "    this.inFlight = messages.length;",
          "    this.peakInFlight = Math.max(this.peakInFlight, this.inFlight);",
          "    for (const msg of messages) {",
          "      this.callWithTimeout(dispatchFn, msg);",
          "      this.acked.push(msg.id);",
          "    }",
          "    this.inFlight = 0;",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "// FIXED CODE: Bounded QoS prefetch worker batching + HTTP timeout + DLQ isolation",
          "class WebhookQueueConsumer {",
          "  constructor(options = {}) {",
          "    this.prefetchLimit = options.prefetchLimit ?? 10;",
          "    this.timeoutMs = options.timeoutMs ?? 50;",
          "    this.maxRetries = options.maxRetries ?? 2;",
          "    this.inFlight = 0;",
          "    this.peakInFlight = 0;",
          "    this.acked = [];",
          "    this.dlq = [];",
          "  }",
          "",
          "  callWithTimeout(dispatchFn, msg) {",
          "    if (msg.latencyMs > this.timeoutMs) {",
          "      throw new Error('WEBHOOK_TIMEOUT');",
          "    }",
          "    return dispatchFn(msg);",
          "  }",
          "",
          "  processMessage(msg, dispatchFn) {",
          "    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {",
          "      try {",
          "        this.callWithTimeout(dispatchFn, msg);",
          "        this.acked.push(msg.id);",
          "        return;",
          "      } catch (err) {",
          "        if (attempt === this.maxRetries) {",
          "          this.dlq.push({ id: msg.id, reason: err.message });",
          "        }",
          "      }",
          "    }",
          "  }",
          "",
          "  drainQueue(messages, dispatchFn) {",
          "    for (let i = 0; i < messages.length; i += this.prefetchLimit) {",
          "      const batch = messages.slice(i, i + this.prefetchLimit);",
          "      this.inFlight = batch.length;",
          "      this.peakInFlight = Math.max(this.peakInFlight, this.inFlight);",
          "      try {",
          "        for (const msg of batch) {",
          "          this.processMessage(msg, dispatchFn);",
          "        }",
          "      } finally {",
          "        this.inFlight = 0;",
          "      }",
          "    }",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "const assert = require('node:assert');",
          "",
          "const consumer = new WebhookQueueConsumer({ prefetchLimit: 8, timeoutMs: 20, maxRetries: 1 });",
          "const messages = Array.from({ length: 40 }, (_, i) => ({",
          "  id: `msg-${i}`,",
          "  latencyMs: i % 10 === 0 ? 80 : 3",
          "}));",
          "",
          "const fakeWebhook = (msg) => ({ delivered: msg.id });",
          "",
          "consumer.drainQueue(messages, fakeWebhook);",
          "assert.ok(consumer.peakInFlight <= 8, `QoS prefetch breached: peakInFlight=${consumer.peakInFlight} > 8`);",
          "assert.strictEqual(consumer.acked.length, 36, 'All 36 healthy webhook messages must be ACKed');",
          "assert.strictEqual(consumer.dlq.length, 4, 'All 4 timed-out poison messages must be routed to DLQ');",
          "console.log('[PASS] WebhookQueueConsumer bounded prefetch & DLQ verified!');"
        ].join('\n')
      }
    },

    // ==========================================
    // TIER: HARD (3)
    // ==========================================
    {
      id: 'split-brain-quorum-loss',
      relatedSlugs: ["consensus","leader-election","redis-redlock-and-fencing-tokens","distributed-locks-and-leases"],
      title: 'Raft Cluster AZ Partition Phantom Leader Split-Brain',
      difficulty: 'hard',
      category: 'Distributed Systems',
      trackId: 'distributed',
      xp: 150,
      estimatedMinutes: 30,
      symptoms: [
        'AZ-A became network isolated from AZ-B and AZ-C during fiber cut.',
        'Nodes in AZ-A elected a local leader despite having only 2 of 5 cluster nodes.',
        'Clients writing to AZ-A leader receiving successful ACKs while clients in AZ-B/C also receiving successful ACKs with different state!'
      ],
      metricsAndLogs: {
        errorRate: 0.50,
        activeLeadersCount: 2,
        divergedLogEntries: 3410,
        timeseries: [
          { time: '-10m', leaders: 1, term: 4, divergedKeys: 0 },
          { time: '-5m', leaders: 2, term: 5, divergedKeys: 420 },
          { time: '-1m', leaders: 2, term: 6, divergedKeys: 2890 },
          { time: '0m', leaders: 2, term: 6, divergedKeys: 3410 }
        ],
        logs: [
          { timestamp: '21:04:10.010', level: 'WARN', service: 'raft-node-1', message: 'Heartbeat timeout from peer 3, 4, 5. State: Candidate.' },
          { timestamp: '21:04:10.220', level: 'WARN', service: 'raft-node-1', message: 'Vote received from peer 2. Quorum rule [local_zone_majority] satisfied (2/2). Becoming LEADER for Term 5.' },
          { timestamp: '21:04:10.250', level: 'FATAL', service: 'raft-node-3', message: 'AZ-B/C majority leader active for Term 4 with nodes 3, 4, 5. Split-brain write divergence detected!' }
        ]
      },
      slaImpact: 'Critical financial balance divergence. Account balances overwritten and transactions lost upon network healing.',
      rootCauses: [
        { id: 'rc-1', description: 'Flawed custom quorum rule `local_zone_majority` instead of strict cluster-wide majority `(N/2) + 1` (3 out of 5), allowing minority network partitions to declare leadership', correct: true },
        { id: 'rc-2', description: 'Clock skew between AWS EC2 hardware clocks', correct: false },
        { id: 'rc-3', description: 'Disk write cache reordering on SSD controllers', correct: false }
      ],
      invariants: [
        'Exactly one leader must exist across the entire 5-node cluster',
        'Minority partition (2 nodes) must reject writes and remain FOLLOWER',
        'Zero divergent uncommitted log entries',
        'Strict linearizability preserved across network partitions'
      ],
      interactiveTuning: [
        { id: 'quorumPolicy', label: 'Quorum Rule Formula', type: 'select', options: ['local_zone_majority', 'any_2_nodes', 'strict_cluster_majority'], defaultValue: 'local_zone_majority', description: 'Minimum votes required to win election and commit log entries.' },
        { id: 'electionTimeoutMinMs', label: 'Min Election Timeout', type: 'range', min: 100, max: 1000, step: 50, defaultValue: 150, unit: 'ms', description: 'Lower bound for randomized election timer.' },
        { id: 'electionTimeoutMaxMs', label: 'Max Election Timeout', type: 'range', min: 200, max: 2000, step: 50, defaultValue: 300, unit: 'ms', description: 'Upper bound for randomized election timer.' },
        { id: 'heartbeatIntervalMs', label: 'Leader Heartbeat Interval', type: 'range', min: 20, max: 200, step: 10, defaultValue: 50, unit: 'ms', description: 'Frequency of AppendEntries heartbeats from leader.' }
      ],
      verify: function (knobValues) {
        var quorum = knobValues.quorumPolicy || 'local_zone_majority';
        var minTimeout = Number(knobValues.electionTimeoutMinMs != null ? knobValues.electionTimeoutMinMs : 150);
        var maxTimeout = Number(knobValues.electionTimeoutMaxMs != null ? knobValues.electionTimeoutMaxMs : 300);
        var heartbeat = Number(knobValues.heartbeatIntervalMs != null ? knobValues.heartbeatIntervalMs : 50);

        var singleLeader = (quorum === 'strict_cluster_majority');
        var timerValid = (minTimeout >= 250 && maxTimeout >= minTimeout * 1.5 && heartbeat <= minTimeout / 3);

        var leaders = singleLeader ? 1 : 2;
        var divergence = singleLeader ? 0 : 3410;
        var errorRate = singleLeader ? (timerValid ? 0.00 : 0.04) : 0.50;

        var success = singleLeader && timerValid;

        var msg = success
          ? 'Quorum Correctness Restored! Strict cluster majority (3/5) enforced. AZ-A minority partition safely dropped to Candidate/Follower, preserving linearizability.'
          : 'Split-brain condition active (' + leaders + ' leaders). You must configure strict_cluster_majority and ensure election timeouts prevent premature elections.';

        return {
          success: success,
          message: msg,
          metrics: {
            activeLeadersCount: leaders,
            divergedLogEntries: divergence,
            errorRate: errorRate
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Strict Cluster Majority Quorum & Monotonic Term Fencing',
        summary: 'Eliminate AZ split-brain by replacing local-zone vote counting with strict cluster-wide majority quorum (floor(N/2) + 1) and fencing stale-term leaders during AppendEntries.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Minority AZ elects phantom leader using local_zone_majority (2 of 2 local nodes)",
          "class RaftClusterNode {",
          "  constructor(nodeId, totalClusterSize = 5, localZoneSize = 2) {",
          "    this.nodeId = nodeId;",
          "    this.totalClusterSize = totalClusterSize;",
          "    this.localZoneSize = localZoneSize;",
          "    this.currentTerm = 1;",
          "    this.role = 'FOLLOWER';",
          "    this.committedLog = [];",
          "  }",
          "",
          "  requiredQuorum() {",
          "    // TODO: Compute strict cluster-wide majority: Math.floor(this.totalClusterSize / 2) + 1",
          "    return Math.floor(this.localZoneSize / 2) + 1;",
          "  }",
          "",
          "  tryElectLeader(newTerm, reachableVoterIds) {",
          "    this.currentTerm = newTerm;",
          "    const uniqueVotes = new Set(reachableVoterIds).size;",
          "    if (uniqueVotes >= this.requiredQuorum()) {",
          "      this.role = 'LEADER';",
          "      return true;",
          "    }",
          "    this.role = 'CANDIDATE';",
          "    return false;",
          "  }",
          "",
          "  appendClientWrite(entry, ackedPeerIds, leaderTerm = this.currentTerm) {",
          "    // TODO: Step down to FOLLOWER and reject if leaderTerm < this.currentTerm;",
          "    // also require this.role === 'LEADER' and unique acks >= this.requiredQuorum()!",
          "    this.committedLog.push({ term: leaderTerm, entry });",
          "    return { committed: true };",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "// FIXED CODE: Strict cluster-wide majority quorum (floor(N/2) + 1) + term fencing",
          "class RaftClusterNode {",
          "  constructor(nodeId, totalClusterSize = 5, localZoneSize = 2) {",
          "    this.nodeId = nodeId;",
          "    this.totalClusterSize = totalClusterSize;",
          "    this.localZoneSize = localZoneSize;",
          "    this.currentTerm = 1;",
          "    this.role = 'FOLLOWER';",
          "    this.committedLog = [];",
          "  }",
          "",
          "  requiredQuorum() {",
          "    return Math.floor(this.totalClusterSize / 2) + 1;",
          "  }",
          "",
          "  tryElectLeader(newTerm, reachableVoterIds) {",
          "    if (newTerm < this.currentTerm) {",
          "      return false;",
          "    }",
          "    this.currentTerm = newTerm;",
          "    const uniqueVotes = new Set(reachableVoterIds).size;",
          "    if (uniqueVotes >= this.requiredQuorum()) {",
          "      this.role = 'LEADER';",
          "      return true;",
          "    }",
          "    this.role = 'CANDIDATE';",
          "    return false;",
          "  }",
          "",
          "  observeTerm(peerTerm) {",
          "    if (peerTerm > this.currentTerm) {",
          "      this.currentTerm = peerTerm;",
          "      this.role = 'FOLLOWER';",
          "    }",
          "  }",
          "",
          "  appendClientWrite(entry, ackedPeerIds, leaderTerm = this.currentTerm) {",
          "    if (leaderTerm < this.currentTerm || this.role !== 'LEADER') {",
          "      this.role = 'FOLLOWER';",
          "      return { committed: false, reason: 'NOT_VALID_LEADER' };",
          "    }",
          "    const uniqueAcks = new Set(ackedPeerIds).size;",
          "    if (uniqueAcks < this.requiredQuorum()) {",
          "      return { committed: false, reason: 'INSUFFICIENT_QUORUM' };",
          "    }",
          "    this.committedLog.push({ term: this.currentTerm, entry });",
          "    return { committed: true };",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "const assert = require('node:assert');",
          "",
          "// 5-node cluster split into AZ-A (2 nodes: n1, n2) and AZ-B/C (3 nodes: n3, n4, n5)",
          "const azANode = new RaftClusterNode('n1', 5, 2);",
          "const azBNode = new RaftClusterNode('n3', 5, 3);",
          "",
          "assert.strictEqual(azANode.requiredQuorum(), 3, '5-node cluster requires 3 votes for strict majority');",
          "",
          "// 1. Minority partition AZ-A (only 2 nodes reachable) must NOT become leader",
          "const azAElected = azANode.tryElectLeader(5, ['n1', 'n2']);",
          "assert.strictEqual(azAElected, false, 'Minority partition (2/5) must not elect a leader');",
          "assert.strictEqual(azANode.appendClientWrite('balance=999', ['n1', 'n2']).committed, false);",
          "",
          "// 2. Majority partition AZ-B/C (3 nodes reachable) elects leader and commits safely",
          "const azBElected = azBNode.tryElectLeader(5, ['n3', 'n4', 'n5']);",
          "assert.strictEqual(azBElected, true, 'Majority partition (3/5) must elect leader');",
          "assert.strictEqual(azBNode.appendClientWrite('balance=500', ['n3', 'n4', 'n5']).committed, true);",
          "assert.strictEqual(azBNode.appendClientWrite('balance=600', ['n3', 'n4']).committed, false, '2 acks must not commit');",
          "console.log('[PASS] RaftClusterNode strict majority quorum & split-brain prevention verified!');"
        ].join('\n')
      }
    },

    {
      id: 'replication-lag-read-drift',
      relatedSlugs: ["replication","consistency-models","case-stripe-idempotency-keys","relational-database-scaling"],
      title: 'Async Read Replica Order Drift Phantom 404s',
      difficulty: 'hard',
      category: 'Database & Storage Engine',
      trackId: 'storage',
      xp: 150,
      estimatedMinutes: 30,
      symptoms: [
        'Shoppers completing checkout immediately redirected to `/orders/{id}` receiving "404 Order Not Found".',
        'Confused users clicking "Place Order" again, creating duplicate charges and inventory de-synchronization.',
        'Replication lag between Postgres Primary and Read Replicas spiked to 8,400ms under heavy read load.'
      ],
      metricsAndLogs: {
        errorRate: 0.36,
        replicationLagMs: 8400,
        duplicateOrdersCount: 412,
        timeseries: [
          { time: '-15m', lagMs: 45, errorRate: 0.001, dupes: 0 },
          { time: '-10m', lagMs: 1200, errorRate: 0.05, dupes: 24 },
          { time: '-5m', lagMs: 4800, errorRate: 0.21, dupes: 180 },
          { time: '0m', lagMs: 8400, errorRate: 0.36, dupes: 412 }
        ],
        logs: [
          { timestamp: '15:30:11.200', level: 'INFO', service: 'checkout-service', message: 'Order ORD-9921 committed to PRIMARY database at LSN 0/1A84F2.' },
          { timestamp: '15:30:11.280', level: 'WARN', service: 'order-viewer-service', message: 'GET /orders/ORD-9921 routed to REPLICA-3 (current replay LSN 0/1A2000, lag 8200ms). Record not found.' },
          { timestamp: '15:30:13.410', level: 'WARN', service: 'checkout-service', message: 'User resubmitted checkout with identical cart. Duplicate charge initiated.' }
        ]
      },
      slaImpact: 'Severe customer frustration, chargeback spikes, and financial accounting discrepancies.',
      rootCauses: [
        { id: 'rc-1', description: 'Application blind round-robin read routing without monotonic read-your-writes consistency or client idempotency keys', correct: true },
        { id: 'rc-2', description: 'Postgres query planner choosing sequential scan over index scan', correct: false },
        { id: 'rc-3', description: 'Browser local storage disabled by privacy extension', correct: false }
      ],
      invariants: [
        'User must immediately read their own writes with 0 phantom 404s',
        'Duplicate order placement must be mathematically impossible via idempotency tokens',
        'Primary database CPU must remain under 70%',
        'Read replica throughput offload must remain > 80%'
      ],
      interactiveTuning: [
        { id: 'readRouting', label: 'Read Routing Strategy', type: 'select', options: ['round_robin_all_replicas', 'read_your_writes_session_token', 'send_all_reads_to_primary'], defaultValue: 'round_robin_all_replicas', description: 'How read queries are routed between primary and replicas.' },
        { id: 'idempotencyEnforcement', label: 'Idempotency Key Header', type: 'select', options: ['disabled', 'redis_setnx_idempotency_key'], defaultValue: 'disabled', description: 'De-duplicate order submission requests with client-generated UUID.' },
        { id: 'syncStandbyCount', label: 'Synchronous Standby Replicas', type: 'range', min: 0, max: 2, step: 1, defaultValue: 0, unit: 'nodes', description: 'Number of replicas that must acknowledge WAL before primary returns OK.' },
        { id: 'maxLagToleranceMs', label: 'Max Replica Lag Allowance', type: 'range', min: 100, max: 5000, step: 100, defaultValue: 5000, unit: 'ms', description: 'If replica lag exceeds this threshold, take replica out of rotation.' }
      ],
      verify: function (knobValues) {
        var routing = knobValues.readRouting || 'round_robin_all_replicas';
        var idempotency = knobValues.idempotencyEnforcement === 'redis_setnx_idempotency_key';
        var syncCount = Number(knobValues.syncStandbyCount != null ? knobValues.syncStandbyCount : 0);
        var maxLag = Number(knobValues.maxLagToleranceMs != null ? knobValues.maxLagToleranceMs : 5000);

        var primaryCpu = 0.25;
        if (routing === 'send_all_reads_to_primary') {
          primaryCpu = 0.98; // Saturated
        } else if (routing === 'read_your_writes_session_token') {
          primaryCpu = 0.38; // Only recent writers read from primary for 10s
        }

        var dupes = idempotency ? 0 : 412;
        var phantom404 = (routing === 'read_your_writes_session_token' || routing === 'send_all_reads_to_primary' || syncCount >= 1);
        var errorRate = phantom404 ? (primaryCpu > 0.90 ? 0.35 : 0.00) : 0.36;

        var success = (routing === 'read_your_writes_session_token' && idempotency && maxLag <= 1000);

        var msg = success
          ? 'Read Drift Eliminated! Read-your-writes session token routes new orders to primary until replica catches up. Idempotency keys prevented duplicate charges.'
          : 'Order drift or DB overload persists. Implement read_your_writes_session_token, enable idempotency keys, and cap replica lag tolerance.';

        return {
          success: success,
          message: msg,
          metrics: {
            duplicateOrdersCount: dupes,
            errorRate: errorRate,
            primaryCpuPercent: Math.round(primaryCpu * 100)
          }
        };
      },
      codeFix: {
        title: 'Hotfix: LSN Session Read-Your-Writes Router & Idempotency Guard',
        summary: 'Prevent phantom 404s after checkout by tracking each user session commit LSN and routing reads to Primary when a replica LSN lags behind, plus deduplicating order submissions by idempotency key.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Blind replica routing returns 404 on lagging replica + missing idempotency check",
          "class OrderCheckoutService {",
          "  constructor(primaryDb, replicas = []) {",
          "    this.primaryDb = primaryDb; // { lsn: 100, orders: Map }",
          "    this.replicas = replicas;   // [{ id, lsn, orders: Map }]",
          "    this.idempotencyLedger = new Map(); // idempotencyKey -> orderRecord",
          "    this.rrIndex = 0;",
          "  }",
          "",
          "  placeOrder(idempotencyKey, orderPayload) {",
          "    // TODO: Check this.idempotencyLedger first so duplicate clicks return the existing order!",
          "    this.primaryDb.lsn += 10;",
          "    const order = { ...orderPayload, commitLsn: this.primaryDb.lsn };",
          "    this.primaryDb.orders.set(order.orderId, order);",
          "    return { order, deduplicated: false };",
          "  }",
          "",
          "  readOrder(orderId, sessionMinLsn = 0) {",
          "    const replica = this.replicas[this.rrIndex++ % this.replicas.length];",
          "    // TODO: If !replica or replica.lsn < sessionMinLsn, route read to this.primaryDb",
          "    // to guarantee Read-Your-Writes monotonic consistency!",
          "    const record = replica.orders.get(orderId);",
          "    if (!record) return { status: 404, source: replica.id, order: null };",
          "    return { status: 200, source: replica.id, order: record };",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "// FIXED CODE: Idempotency ledger + LSN-aware Read-Your-Writes routing",
          "class OrderCheckoutService {",
          "  constructor(primaryDb, replicas = []) {",
          "    this.primaryDb = primaryDb;",
          "    this.replicas = replicas;",
          "    this.idempotencyLedger = new Map();",
          "    this.rrIndex = 0;",
          "  }",
          "",
          "  placeOrder(idempotencyKey, orderPayload) {",
          "    if (idempotencyKey && this.idempotencyLedger.has(idempotencyKey)) {",
          "      return { order: this.idempotencyLedger.get(idempotencyKey), deduplicated: true };",
          "    }",
          "    this.primaryDb.lsn += 10;",
          "    const order = { ...orderPayload, commitLsn: this.primaryDb.lsn };",
          "    this.primaryDb.orders.set(order.orderId, order);",
          "    if (idempotencyKey) {",
          "      this.idempotencyLedger.set(idempotencyKey, order);",
          "    }",
          "    return { order, deduplicated: false };",
          "  }",
          "",
          "  readOrder(orderId, sessionMinLsn = 0) {",
          "    const replica = this.replicas.length > 0",
          "      ? this.replicas[this.rrIndex++ % this.replicas.length]",
          "      : null;",
          "    const targetDb = (!replica || replica.lsn < sessionMinLsn) ? this.primaryDb : replica;",
          "    const sourceName = targetDb === this.primaryDb ? 'primary' : replica.id;",
          "    const record = targetDb.orders.get(orderId);",
          "    if (!record) return { status: 404, source: sourceName, order: null };",
          "    return { status: 200, source: sourceName, order: record };",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "const assert = require('node:assert');",
          "",
          "const primary = { lsn: 100, orders: new Map() };",
          "const laggingReplica = { id: 'replica-1', lsn: 90, orders: new Map() };",
          "const svc = new OrderCheckoutService(primary, [laggingReplica]);",
          "",
          "// 1. Place order at LSN 110 while replica lags at LSN 90",
          "const { order, deduplicated } = svc.placeOrder('idem-uuid-1', { orderId: 'ORD-9921', total: 149 });",
          "assert.strictEqual(deduplicated, false);",
          "assert.strictEqual(order.commitLsn, 110);",
          "",
          "// 2. Immediate redirect with sessionMinLsn=110 must route to primary and avoid phantom 404",
          "const readRes = svc.readOrder('ORD-9921', order.commitLsn);",
          "assert.strictEqual(readRes.status, 200, 'Read-Your-Writes must not return phantom 404');",
          "assert.strictEqual(readRes.source, 'primary');",
          "",
          "// 3. Duplicate click with same idempotencyKey must not create duplicate order",
          "const retryRes = svc.placeOrder('idem-uuid-1', { orderId: 'ORD-9922', total: 149 });",
          "assert.strictEqual(retryRes.deduplicated, true, 'Duplicate submission must be deduplicated');",
          "assert.strictEqual(retryRes.order.orderId, 'ORD-9921');",
          "assert.strictEqual(primary.orders.size, 1, 'Only 1 order should exist in primary DB');",
          "console.log('[PASS] OrderCheckoutService LSN Read-Your-Writes & idempotency verified!');"
        ].join('\n')
      }
    },

    {
      id: 'cascading-deadlock-depletion',
      relatedSlugs: ["database-locking-and-isolation","flash-sale-inventory-locking","mvcc","postgres-skip-locked-work-queue"],
      title: 'Bidirectional Transfer Distributed Deadlock Pool Exhaustion',
      difficulty: 'hard',
      category: 'Database & Storage Engine',
      trackId: 'storage',
      xp: 150,
      estimatedMinutes: 30,
      symptoms: [
        'Core banking service connection pool saturated at 100% capacity (300/300 active connections).',
        'Database transaction engine reporting 450 deadlock aborts per second on `UPDATE accounts SET balance = balance + ?`.',
        'API thread pools depleted; all microservices waiting on DB responses, cascading into global timeout.'
      ],
      metricsAndLogs: {
        errorRate: 0.88,
        deadlocksPerSec: 450,
        activeDbConnections: 300,
        latencyP99: 15000,
        timeseries: [
          { time: '-10m', deadlocks: 2, conns: 45, errorRate: 0.00, latencyP99: 35 },
          { time: '-5m', deadlocks: 65, conns: 150, errorRate: 0.12, latencyP99: 3200 },
          { time: '-1m', deadlocks: 380, conns: 300, errorRate: 0.74, latencyP99: 12000 },
          { time: '0m', deadlocks: 450, conns: 300, errorRate: 0.88, latencyP99: 15000 }
        ],
        logs: [
          { timestamp: '17:10:02.100', level: 'ERROR', service: 'postgres-engine', message: 'Deadlock detected: Process 14012 waiting for ShareLock on row (account_id=881); blocked by 14018. Process 14018 waiting for ShareLock on row (account_id=204); blocked by 14012.' },
          { timestamp: '17:10:02.105', level: 'WARN', service: 'banking-tx-manager', message: 'Transaction rolled back after 1000ms deadlock timeout. Retrying transaction immediately.' },
          { timestamp: '17:10:03.500', level: 'FATAL', service: 'api-gateway', message: 'HTTP 504 Gateway Timeout: 1200 requests dropped in last 5 seconds.' }
        ]
      },
      slaImpact: 'Banking core transfer API halted. Regulatory SLA breach risk.',
      rootCauses: [
        { id: 'rc-1', description: 'Transfers acquire locks in arbitrary order based on source/destination parameters (A->B locks A then B; B->A locks B then A), creating cyclic dependency lock graphs under concurrent bidirectional volume', correct: true },
        { id: 'rc-2', description: 'Corrupt b-tree index on transaction_id', correct: false },
        { id: 'rc-3', description: 'Postgres autovacuum worker freezing tables', correct: false }
      ],
      invariants: [
        'Deadlock abort frequency must drop to 0.0 per second',
        'Database connection pool utilization must drop below 40%',
        'Transfer P99 latency must be under 50ms',
        'Zero lost transaction balances or double spends'
      ],
      interactiveTuning: [
        { id: 'lockOrdering', label: 'Lock Acquisition Order', type: 'select', options: ['arbitrary_source_then_dest', 'deterministic_sorted_id'], defaultValue: 'arbitrary_source_then_dest', description: 'Always acquire row locks in deterministic ascending ID order: min(id1, id2) then max(id1, id2).' },
        { id: 'deadlockTimeoutMs', label: 'Deadlock Detection Timeout', type: 'range', min: 20, max: 2000, step: 20, defaultValue: 1000, unit: 'ms', description: 'How long the engine waits before running cycle detection.' },
        { id: 'statementTimeoutMs', label: 'Statement Timeout', type: 'range', min: 100, max: 10000, step: 100, defaultValue: 5000, unit: 'ms', description: 'Maximum runtime allowed for an individual SQL query before cancellation.' },
        { id: 'transactionIsolation', label: 'Isolation Level', type: 'select', options: ['serializable', 'read_committed_with_pessimistic_lock'], defaultValue: 'serializable', description: 'Transaction isolation level semantics.' }
      ],
      verify: function (knobValues) {
        var ordering = knobValues.lockOrdering || 'arbitrary_source_then_dest';
        var dlTimeout = Number(knobValues.deadlockTimeoutMs != null ? knobValues.deadlockTimeoutMs : 1000);
        var stmtTimeout = Number(knobValues.statementTimeoutMs != null ? knobValues.statementTimeoutMs : 5000);
        var isolation = knobValues.transactionIsolation || 'serializable';

        var ordered = (ordering === 'deterministic_sorted_id');
        var deadlocks = ordered ? 0 : Math.round(450 * (dlTimeout / 1000));
        var activeConns = ordered ? 28 : 300;
        var latency = ordered ? 24 : Math.min(15000, dlTimeout * 8);
        var errorRate = ordered ? 0.00 : 0.88;

        var success = ordered && stmtTimeout <= 2000 && isolation === 'read_committed_with_pessimistic_lock';

        var msg = success
          ? 'Deadlocks Eliminated! Deterministic ID sorting min(A,B) -> max(A,B) broke the circular wait Coffman condition. Active DB connections dropped from 300 to ' + activeConns + '.'
          : 'Deadlocks still occurring (' + deadlocks + '/s). You must enforce deterministic_sorted_id locking order and tune statement timeout and isolation level.';

        return {
          success: success,
          message: msg,
          metrics: {
            deadlocksPerSec: deadlocks,
            activeDbConnections: activeConns,
            latencyP99: latency,
            errorRate: errorRate
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Deterministic Canonical Lock Ordering for Account Transfers',
        summary: 'Eliminate AB-BA distributed deadlocks during concurrent bidirectional bank transfers by acquiring row locks in deterministic ascending account ID order: min(fromId, toId) then max(fromId, toId).',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Acquiring locks in parameter order (fromId -> toId) causes AB-BA deadlocks",
          "class BankTransferEngine {",
          "  constructor(initialBalances = {}) {",
          "    this.balances = new Map(Object.entries(initialBalances));",
          "    this.lockedBy = new Map(); // accountId -> txId",
          "    this.waitingFor = new Map(); // txId -> accountId",
          "  }",
          "",
          "  planLockOrder(fromId, toId) {",
          "    // TODO: Return account IDs sorted in canonical ascending lexicographical/numeric order",
          "    // so transfer(A,B) and transfer(B,A) both acquire min(A,B) before max(A,B)!",
          "    return [String(fromId), String(toId)];",
          "  }",
          "",
          "  executeTransfer(txId, fromId, toId, amount) {",
          "    const [firstLock, secondLock] = this.planLockOrder(fromId, toId);",
          "    if (this.lockedBy.has(firstLock) || this.lockedBy.has(secondLock)) {",
          "      throw new Error('LOCK_CONTENTION');",
          "    }",
          "    this.lockedBy.set(firstLock, txId);",
          "    this.lockedBy.set(secondLock, txId);",
          "    try {",
          "      const fromBal = this.balances.get(String(fromId)) ?? 0;",
          "      const toBal = this.balances.get(String(toId)) ?? 0;",
          "      if (fromBal < amount) throw new Error('INSUFFICIENT_FUNDS');",
          "      this.balances.set(String(fromId), fromBal - amount);",
          "      this.balances.set(String(toId), toBal + amount);",
          "      return { ok: true, lockSequence: [firstLock, secondLock] };",
          "    } finally {",
          "      this.lockedBy.delete(secondLock);",
          "      this.lockedBy.delete(firstLock);",
          "    }",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "// FIXED CODE: Canonical ascending lock acquisition order breaks Coffman circular wait",
          "class BankTransferEngine {",
          "  constructor(initialBalances = {}) {",
          "    this.balances = new Map(Object.entries(initialBalances));",
          "    this.lockedBy = new Map();",
          "    this.waitingFor = new Map();",
          "  }",
          "",
          "  planLockOrder(fromId, toId) {",
          "    const a = String(fromId);",
          "    const b = String(toId);",
          "    return a.localeCompare(b, undefined, { numeric: true }) <= 0 ? [a, b] : [b, a];",
          "  }",
          "",
          "  executeTransfer(txId, fromId, toId, amount) {",
          "    const [firstLock, secondLock] = this.planLockOrder(fromId, toId);",
          "    if (this.lockedBy.has(firstLock) || this.lockedBy.has(secondLock)) {",
          "      throw new Error('LOCK_CONTENTION');",
          "    }",
          "    this.lockedBy.set(firstLock, txId);",
          "    this.lockedBy.set(secondLock, txId);",
          "    try {",
          "      const fromBal = this.balances.get(String(fromId)) ?? 0;",
          "      const toBal = this.balances.get(String(toId)) ?? 0;",
          "      if (fromBal < amount) throw new Error('INSUFFICIENT_FUNDS');",
          "      this.balances.set(String(fromId), fromBal - amount);",
          "      this.balances.set(String(toId), toBal + amount);",
          "      return { ok: true, lockSequence: [firstLock, secondLock] };",
          "    } finally {",
          "      this.lockedBy.delete(secondLock);",
          "      this.lockedBy.delete(firstLock);",
          "    }",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "const assert = require('node:assert');",
          "",
          "const engine = new BankTransferEngine({ '204': 5000, '881': 5000 });",
          "",
          "// 1. Verify bidirectional transfers acquire locks in the exact same canonical order",
          "const tx1 = engine.executeTransfer('tx-1', '881', '204', 100);",
          "const tx2 = engine.executeTransfer('tx-2', '204', '881', 50);",
          "assert.deepStrictEqual(tx1.lockSequence, ['204', '881'], 'Must lock account 204 before 881');",
          "assert.deepStrictEqual(tx2.lockSequence, ['204', '881'], 'Reverse transfer must also lock 204 before 881');",
          "",
          "// 2. Verify conservation of money across 200 bidirectional transfers",
          "for (let i = 0; i < 100; i++) {",
          "  engine.executeTransfer(`f-${i}`, '881', '204', 10);",
          "  engine.executeTransfer(`b-${i}`, '204', '881', 10);",
          "}",
          "const total = engine.balances.get('204') + engine.balances.get('881');",
          "assert.strictEqual(total, 10000, 'Total balance invariant must be preserved');",
          "assert.strictEqual(engine.lockedBy.size, 0, 'All locks must be cleanly released');",
          "console.log('[PASS] BankTransferEngine canonical lock ordering verified!');"
        ].join('\n')
      }
    },

    // ==========================================
    // TIER: INSANE (2)
    // ==========================================
    {
      id: 'two-phase-commit-coordinator-hang',
      relatedSlugs: ["payment-system-design","dag-workflow-orchestration","retries-timeouts-idempotency","distributed-systems-foundations"],
      title: '2PC Coordinator Crash Distributed Lock Starvation',
      difficulty: 'insane',
      category: 'Distributed Systems',
      trackId: 'mastery',
      xp: 250,
      estimatedMinutes: 45,
      symptoms: [
        'Central 2PC Transaction Coordinator node crashed immediately after sending `PREPARE` and receiving `VOTE_COMMIT` from 4 participant databases.',
        'All 4 participant shard databases are holding exclusive row locks indefinitely waiting for `GLOBAL_COMMIT`.',
        'Incoming user read and write transactions touching any of those rows are hung waiting for lock acquisition; connection pools exhausted across all shards.'
      ],
      metricsAndLogs: {
        errorRate: 0.96,
        blockedTransactions: 14200,
        heldExclusiveLocks: 580,
        timeseries: [
          { time: '-10m', blockedTx: 10, errorRate: 0.00, p99: 40 },
          { time: '-5m', blockedTx: 2100, errorRate: 0.45, p99: 8900 },
          { time: '-1m', blockedTx: 9800, errorRate: 0.85, p99: 30000 },
          { time: '0m', blockedTx: 14200, errorRate: 0.96, p99: 30000 }
        ],
        logs: [
          { timestamp: '09:00:10.100', level: 'INFO', service: 'tx-coord', message: 'Broadcasting PREPARE for TX-9901 to shards S1, S2, S3, S4.' },
          { timestamp: '09:00:10.250', level: 'INFO', service: 'tx-shard-1', message: 'VOTE_COMMIT recorded in local WAL. Exclusive locks acquired on account rows.' },
          { timestamp: '09:00:10.290', level: 'FATAL', service: 'tx-coord', message: 'Kernel OOM killer terminated coordinator process before decision logged. Host offline.' },
          { timestamp: '09:00:15.000', level: 'WARN', service: 'tx-shard-1', message: 'In-doubt transaction TX-9901 blocking. Participant cannot independently commit or abort.' }
        ]
      },
      slaImpact: 'Global multi-shard transaction halt. Complete lockup of customer bank accounts and order checkout.',
      rootCauses: [
        { id: 'rc-1', description: 'Classical Two-Phase Commit is fundamentally a blocking protocol: when the coordinator crashes during the uncertain window, participants cannot make unilateral progress without violating consistency', correct: true },
        { id: 'rc-2', description: 'TCP keepalive was disabled on Postgres client connections', correct: false },
        { id: 'rc-3', description: 'NTP drift between shard servers exceeded 200 milliseconds', correct: false }
      ],
      invariants: [
        'System must never block indefinitely upon single-node coordinator failure',
        'All orphaned locks must be safely resolved in < 3 seconds',
        'Zero inconsistent partial commit states (all shards commit or all compensate/abort)',
        'Overall transaction throughput must recover to > 2,000 TPS'
      ],
      interactiveTuning: [
        { id: 'architecturePattern', label: 'Distributed Transaction Protocol', type: 'select', options: ['blocking_2pc', 'saga_orchestrator_with_compensation', 'three_phase_commit_with_precommit'], defaultValue: 'blocking_2pc', description: 'Fundamental protocol used for cross-boundary transactions.' },
        { id: 'participantLockTimeoutMs', label: 'Participant Lock Timeout', type: 'range', min: 500, max: 30000, step: 500, defaultValue: 30000, unit: 'ms', description: 'Maximum duration a participant shard holds locks in doubtful state.' },
        { id: 'coordinatorHaStandbys', label: 'Coordinator HA Quorum Replicas', type: 'range', min: 0, max: 4, step: 1, defaultValue: 0, unit: 'replicas', description: 'Raft-replicated state machine for coordinator decision log.' },
        { id: 'recoveryDaemonIntervalSec', label: 'Recovery Daemon Check Period', type: 'range', min: 1, max: 30, step: 1, defaultValue: 30, unit: 'seconds', description: 'Interval for orphan transaction reaper.' }
      ],
      verify: function (knobValues) {
        var pattern = knobValues.architecturePattern || 'blocking_2pc';
        var lockTimeout = Number(knobValues.participantLockTimeoutMs != null ? knobValues.participantLockTimeoutMs : 30000);
        var coordHa = Number(knobValues.coordinatorHaStandbys != null ? knobValues.coordinatorHaStandbys : 0);
        var reaperSec = Number(knobValues.recoveryDaemonIntervalSec != null ? knobValues.recoveryDaemonIntervalSec : 30);

        var isNonBlocking = (pattern === 'saga_orchestrator_with_compensation' || (pattern === 'three_phase_commit_with_precommit' && coordHa >= 2));
        var blocked = isNonBlocking ? 0 : Math.round(14200 * (lockTimeout / 30000));
        var errorRate = isNonBlocking ? 0.00 : Math.min(0.96, blocked / 10000);
        var tps = isNonBlocking ? 2400 : 80;

        var success = (pattern === 'saga_orchestrator_with_compensation' && lockTimeout <= 3000 && reaperSec <= 5);

        var msg = success
          ? 'Lock Starvation Broken! Saga pattern with asynchronous compensating transactions decoupled shard locks. Coordinator failure now auto-heals via compensation in < 2s.'
          : 'Blocking protocol failure persists. Classical 2PC with crashed coordinator blocks ' + blocked + ' transactions. Adopt saga_orchestrator_with_compensation or configure quorum-replicated 3PC.';

        return {
          success: success,
          message: msg,
          metrics: {
            blockedTransactions: blocked,
            tps: tps,
            errorRate: errorRate
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Non-Blocking Saga Orchestrator with Reverse Compensation',
        summary: 'Replace blocking 2PC lock-holding with a Saga Orchestrator that executes local shard transactions with bounded leases and runs idempotent reverse compensating actions on partial failure.',
        buggyCode: [
          "// BUGGY INCIDENT CODE: Blocking 2PC leaves shard locks held and partial state uncommitted on failure",
          "class CrossShardSagaOrchestrator {",
          "  constructor() {",
          "    this.activeShardLocks = new Set();",
          "    this.compensationLog = [];",
          "  }",
          "",
          "  executeSaga(txId, steps) {",
          "    // steps: [{ shardId, action: () => {}, compensate: () => {} }]",
          "    const completedSteps = [];",
          "    for (const step of steps) {",
          "      this.activeShardLocks.add(step.shardId);",
          "      // TODO: Release shard lock immediately after local step completes (non-blocking Saga)",
          "      // and if step.action() throws, execute compensate() in REVERSE order for all",
          "      // previously completedSteps before returning { status: 'COMPENSATED', compensatedShards }!",
          "      step.action(txId);",
          "      completedSteps.push(step);",
          "    }",
          "    return { status: 'COMMITTED', compensatedShards: [] };",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "// FIXED CODE: Non-blocking Saga execution + reverse-order compensating rollback",
          "class CrossShardSagaOrchestrator {",
          "  constructor() {",
          "    this.activeShardLocks = new Set();",
          "    this.compensationLog = [];",
          "  }",
          "",
          "  executeSaga(txId, steps) {",
          "    const completedSteps = [];",
          "    try {",
          "      for (const step of steps) {",
          "        this.activeShardLocks.add(step.shardId);",
          "        try {",
          "          step.action(txId);",
          "          completedSteps.push(step);",
          "        } finally {",
          "          this.activeShardLocks.delete(step.shardId);",
          "        }",
          "      }",
          "      return { status: 'COMMITTED', compensatedShards: [] };",
          "    } catch (err) {",
          "      const compensatedShards = [];",
          "      for (let i = completedSteps.length - 1; i >= 0; i--) {",
          "        const prev = completedSteps[i];",
          "        prev.compensate(txId);",
          "        compensatedShards.push(prev.shardId);",
          "        this.compensationLog.push({ txId, shardId: prev.shardId });",
          "      }",
          "      return { status: 'COMPENSATED', error: err.message, compensatedShards };",
          "    }",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "const assert = require('node:assert');",
          "",
          "const orchestrator = new CrossShardSagaOrchestrator();",
          "const ledger = { S1: 1000, S2: 1000, S3: 1000 };",
          "",
          "const steps = [",
          "  { shardId: 'S1', action: () => { ledger.S1 -= 200; }, compensate: () => { ledger.S1 += 200; } },",
          "  { shardId: 'S2', action: () => { ledger.S2 -= 300; }, compensate: () => { ledger.S2 += 300; } },",
          "  { shardId: 'S3', action: () => { throw new Error('SHARD_S3_TIMEOUT'); }, compensate: () => { ledger.S3 += 500; } }",
          "];",
          "",
          "const res = orchestrator.executeSaga('TX-9901', steps);",
          "assert.strictEqual(res.status, 'COMPENSATED', 'Failed multi-shard saga must transition to COMPENSATED');",
          "assert.deepStrictEqual(res.compensatedShards, ['S2', 'S1'], 'Compensations must run in reverse order (S2 then S1)');",
          "assert.strictEqual(orchestrator.activeShardLocks.size, 0, 'Zero shard locks may remain held after saga completion');",
          "assert.deepStrictEqual(ledger, { S1: 1000, S2: 1000, S3: 1000 }, 'All shard balances must be restored via compensation');",
          "console.log('[PASS] CrossShardSagaOrchestrator non-blocking compensation verified!');"
        ].join('\n')
      }
    },

    {
      id: 'gossip-partition-flapping-cascade',
      relatedSlugs: ["gossip-protocol","case-amazon-dynamo","cap-and-pacelc","metadata-service-and-node-discovery"],
      title: 'Cassandra Phi-Accrual WAN Flapping Gossip Storm',
      difficulty: 'insane',
      category: 'Distributed Systems',
      trackId: 'mastery',
      xp: 250,
      estimatedMinutes: 45,
      symptoms: [
        'Cross-region WAN network between US-East and EU-West experiencing 150ms packet jitter and periodic 2-second drops.',
        'Phi Accrual Failure Detector threshold was configured aggressively (phi=4), causing nodes to declare entire remote datacenter dead every 20 seconds.',
        'Constant state flips triggered relentless gossip protocol broadcast floods (500MB/s), compaction repair storms, and 100% CPU on all 200 Cassandra nodes.'
      ],
      metricsAndLogs: {
        errorRate: 0.78,
        gossipBandwidthMbSec: 480,
        falseDeathAlertsPerMin: 142,
        clusterCpuAvg: 0.99,
        timeseries: [
          { time: '-15m', phi: 3.2, gossipBw: 12, cpu: 0.32, errorRate: 0.00 },
          { time: '-10m', phi: 5.8, gossipBw: 180, cpu: 0.78, errorRate: 0.15 },
          { time: '-5m', phi: 7.4, gossipBw: 390, cpu: 0.95, errorRate: 0.45 },
          { time: '0m', phi: 8.9, gossipBw: 480, cpu: 0.99, errorRate: 0.78 }
        ],
        logs: [
          { timestamp: '23:45:10.010', level: 'WARN', service: 'failure-detector', message: 'Phi value 4.8 exceeds threshold 4.0 for node cass-eu-12. Marking node DOWN.' },
          { timestamp: '23:45:10.015', level: 'INFO', service: 'gossip-service', message: 'Broadcasting membership change: cass-eu-12 marked DEAD to all 199 peers.' },
          { timestamp: '23:45:12.450', level: 'WARN', service: 'repair-service', message: 'Triggering anti-entropy streaming repair to replicate data from missing node.' },
          { timestamp: '23:45:16.890', level: 'INFO', service: 'failure-detector', message: 'Heartbeat received from cass-eu-12. Phi reset. Marking node ALIVE. Gossip storm intensifies.' }
        ]
      },
      slaImpact: 'Global database cluster unresponsive. P99 query latency exceeded 20,000ms. Cascading write rejections.',
      rootCauses: [
        { id: 'rc-1', description: 'Phi failure threshold set too low (4) for inter-datacenter WAN latency distribution, treating transient network latency spikes as complete node failures and triggering un-throttled anti-entropy repair compaction storms', correct: true },
        { id: 'rc-2', description: 'Cassandra commitlog directory filled with corrupt SSTables', correct: false },
        { id: 'rc-3', description: 'Java Virtual Machine metaspace leak in Thrift RPC server', correct: false }
      ],
      invariants: [
        'False node death declarations must drop to 0 under transient WAN jitter',
        'Gossip network bandwidth must stay under 20 MB/s',
        'Cluster CPU utilization must drop below 40%',
        'Anti-entropy repair storms must be throttled or suspended during network instability'
      ],
      interactiveTuning: [
        { id: 'phiConvictThreshold', label: 'Phi Accrual Threshold (phi)', type: 'range', min: 4, max: 16, step: 1, defaultValue: 4, unit: 'phi', description: 'Higher phi tolerates larger inter-arrival variance before suspecting node death.' },
        { id: 'gossipIntervalMs', label: 'Gossip Send Interval', type: 'range', min: 100, max: 2000, step: 100, defaultValue: 200, unit: 'ms', description: 'How often each node exchanges state with a random peer.' },
        { id: 'suspectGracePeriodSeconds', label: 'Suspect Grace Period', type: 'range', min: 5, max: 60, step: 5, defaultValue: 5, unit: 'seconds', description: 'Time a suspected node remains in SUSPECT before triggering repair replication.' },
        { id: 'repairThrottlingMbSec', label: 'Anti-Entropy Stream Bandwidth Limit', type: 'range', min: 10, max: 500, step: 10, defaultValue: 400, unit: 'MB/s', description: 'Bandwidth ceiling for data stream repair between nodes.' }
      ],
      verify: function (knobValues) {
        var phi = Number(knobValues.phiConvictThreshold != null ? knobValues.phiConvictThreshold : 4);
        var interval = Number(knobValues.gossipIntervalMs != null ? knobValues.gossipIntervalMs : 200);
        var grace = Number(knobValues.suspectGracePeriodSeconds != null ? knobValues.suspectGracePeriodSeconds : 5);
        var repairLimit = Number(knobValues.repairThrottlingMbSec != null ? knobValues.repairThrottlingMbSec : 400);

        var falseAlerts = (phi < 10) ? Math.round((12 - phi) * 24) : 0;
        var gossipBw = Math.round(350 * (200 / Math.max(interval, 100)) * (falseAlerts > 0 ? 1.0 : 0.05));
        var cpu = (falseAlerts > 0) ? 0.99 : Math.min(0.85, 0.20 + (repairLimit / 500) * 0.25);
        var errorRate = (falseAlerts > 0) ? 0.78 : (repairLimit > 200 ? 0.12 : 0.00);

        var success = (phi >= 10 && interval >= 500 && grace >= 20 && repairLimit <= 50);

        var msg = success
          ? 'Gossip Storm Quenched! Phi threshold increased to ' + phi + ' (ideal for WAN) and repair throttled to ' + repairLimit + ' MB/s. Cluster CPU dropped to ' + Math.round(cpu * 100) + '% with 0 false death alerts.'
          : 'Cluster continues thrashing. False node death rate: ' + falseAlerts + '/min, Gossip BW: ' + gossipBw + ' MB/s. Increase phi (>=10), increase gossip interval (>=500ms), grace period (>=20s), and throttle repair (<=50 MB/s).';

        return {
          success: success,
          message: msg,
          metrics: {
            falseDeathAlertsPerMin: falseAlerts,
            gossipBandwidthMbSec: gossipBw,
            clusterCpuAvg: Number(cpu.toFixed(2)),
            errorRate: errorRate
          }
        };
      },
      codeFix: {
        title: 'Hotfix: Adaptive Phi Accrual Failure Detector & Suspect Dampening',
        summary: 'Stop cross-WAN gossip storms by computing Phi against a sliding window of heartbeat inter-arrival times (mean + standard deviation), raising the WAN conviction threshold to phi >= 10, and requiring a suspect grace window before triggering repair.',
        buggyCode: [
          "'use strict';",
          "",
          "// BUGGY INCIDENT CODE: Static 200ms expectation + phi=4 convicts WAN nodes on normal 150ms jitter",
          "class AdaptivePhiFailureDetector {",
          "  constructor(options = {}) {",
          "    this.phiThreshold = options.phiThreshold ?? 10;",
          "    this.suspectGraceMs = options.suspectGraceMs ?? 20000;",
          "    this.intervals = [250, 260, 240, 255, 245];",
          "    this.lastHeartbeatAt = 0;",
          "    this.suspectSince = null;",
          "  }",
          "",
          "  recordHeartbeat(timestampMs) {",
          "    if (this.lastHeartbeatAt > 0) {",
          "      const delta = Math.max(1, timestampMs - this.lastHeartbeatAt);",
          "      this.intervals.push(delta);",
          "      if (this.intervals.length > 50) this.intervals.shift();",
          "    }",
          "    this.lastHeartbeatAt = timestampMs;",
          "    this.suspectSince = null;",
          "  }",
          "",
          "  computePhi(nowMs) {",
          "    // TODO: Compute adaptive mean and standard deviation (min sigma = 50ms) over this.intervals,",
          "    // then return phi = elapsed / (mean + 2 * sigma) * 2.0",
          "    const elapsed = Math.max(0, nowMs - this.lastHeartbeatAt);",
          "    return elapsed / 80; // Buggy static divisor",
          "  }",
          "",
          "  evaluatePeerState(nowMs) {",
          "    const phi = this.computePhi(nowMs);",
          "    // TODO: Only enter SUSPECT when phi >= this.phiThreshold, and only return 'DEAD'",
          "    // once (nowMs - this.suspectSince) >= this.suspectGraceMs!",
          "    if (phi >= 4) return 'DEAD';",
          "    return 'ALIVE';",
          "  }",
          "}"
        ].join('\n'),
        solutionCode: [
          "// FIXED CODE: Adaptive sliding-window Phi calculation + WAN threshold + suspect grace dampening",
          "class AdaptivePhiFailureDetector {",
          "  constructor(options = {}) {",
          "    this.phiThreshold = options.phiThreshold ?? 10;",
          "    this.suspectGraceMs = options.suspectGraceMs ?? 20000;",
          "    this.intervals = [250, 260, 240, 255, 245];",
          "    this.lastHeartbeatAt = 0;",
          "    this.suspectSince = null;",
          "  }",
          "",
          "  recordHeartbeat(timestampMs) {",
          "    if (this.lastHeartbeatAt > 0) {",
          "      const delta = Math.max(1, timestampMs - this.lastHeartbeatAt);",
          "      this.intervals.push(delta);",
          "      if (this.intervals.length > 50) this.intervals.shift();",
          "    }",
          "    this.lastHeartbeatAt = timestampMs;",
          "    this.suspectSince = null;",
          "  }",
          "",
          "  computePhi(nowMs) {",
          "    const elapsed = Math.max(0, nowMs - this.lastHeartbeatAt);",
          "    const n = this.intervals.length;",
          "    const mean = this.intervals.reduce((a, b) => a + b, 0) / n;",
          "    const variance = this.intervals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;",
          "    const sigma = Math.max(50, Math.sqrt(variance));",
          "    return (elapsed / (mean + 2 * sigma)) * 2.0;",
          "  }",
          "",
          "  evaluatePeerState(nowMs) {",
          "    const phi = this.computePhi(nowMs);",
          "    if (phi < this.phiThreshold) {",
          "      this.suspectSince = null;",
          "      return 'ALIVE';",
          "    }",
          "    if (this.suspectSince === null) {",
          "      this.suspectSince = nowMs;",
          "    }",
          "    if (nowMs - this.suspectSince >= this.suspectGraceMs) {",
          "      return 'DEAD';",
          "    }",
          "    return 'SUSPECT';",
          "  }",
          "}"
        ].join('\n'),
        testCode: [
          "const assert = require('node:assert');",
          "",
          "const detector = new AdaptivePhiFailureDetector({ phiThreshold: 10, suspectGraceMs: 20000 });",
          "",
          "// 1. Feed cross-WAN heartbeats (~250ms baseline with 150ms jitter up to 400ms)",
          "let t = 1000;",
          "for (const delta of [250, 380, 220, 410, 260, 390]) {",
          "  t += delta;",
          "  detector.recordHeartbeat(t);",
          "  assert.strictEqual(detector.evaluatePeerState(t + 400), 'ALIVE', 'Transient 400ms WAN jitter must not convict node');",
          "}",
          "",
          "// 2. When node stops heartbeating for 3,000ms (phi >= 10), it enters SUSPECT first (not immediate DEAD)",
          "const stateAt3s = detector.evaluatePeerState(t + 3000);",
          "assert.strictEqual(stateAt3s, 'SUSPECT', 'Node exceeding phiThreshold must enter SUSPECT during grace period');",
          "",
          "// 3. Only after suspectGraceMs (20s) elapses without heartbeat is node convicted DEAD",
          "const stateAt25s = detector.evaluatePeerState(t + 24000);",
          "assert.strictEqual(stateAt25s, 'DEAD', 'Node must be marked DEAD after suspectGraceMs elapses');",
          "console.log('[PASS] AdaptivePhiFailureDetector WAN jitter tolerance & grace dampening verified!');"
        ].join('\n')
      }
    }
  ];

  // Export to browser window and node environment
  if (typeof global !== 'undefined') {
    global.CHALLENGES_DATA = CHALLENGES_DATA;
    global.ChallengesData = { challenges: CHALLENGES_DATA };
  }
  if (typeof window !== 'undefined') {
    window.CHALLENGES_DATA = CHALLENGES_DATA;
    window.ChallengesData = { challenges: CHALLENGES_DATA };
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHALLENGES_DATA;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
