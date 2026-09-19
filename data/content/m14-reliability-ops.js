window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-reliability-ops"] = {
  "observability-for-distributed-systems": {
    "title": "Observability for distributed systems",
    "video": {
      "youtubeId": "TmC7Ha3Qqk4",
      "title": "Distributed tracing with Grafana Tempo and OpenTelemetry | DevNation Tech Talk",
      "channel": "Red Hat Developer"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Three Pillars: Metrics, Logs, and Distributed Tracing</h2>\n      <p>In distributed microservices, inspecting a single server's logs is insufficient to debug intermittent errors or latency spikes. Observability answers <em>why</em> a system is misbehaving by synthesizing three complementary telemetry signals:</p>\n      <ul>\n        <li><strong>Metrics (Aggregated Numbers):</strong> Time-series counters, gauges, and histograms (via Prometheus). Extremely cheap to store, ideal for alerting and dashboards.</li>\n        <li><strong>Logs (Detailed Events):</strong> Structured JSON records of distinct occurrences (via Elasticsearch / Loki). Essential for forensic analysis of specific errors.</li>\n        <li><strong>Distributed Tracing (Request Context):</strong> Propagates a unique <code>trace_id</code> and parent <code>span_id</code> across network boundaries (via OpenTelemetry / Jaeger), reconstructing the end-to-end execution timeline across dozens of microservices.</li>\n      </ul>\n\n      <h2>The Four Golden Signals</h2>\n      <p>Google's SRE framework defines the four critical health metrics for any production service: <strong>Latency</strong> (time to service a request), <strong>Traffic</strong> (QPS / demand), <strong>Errors</strong> (rate of failed requests), and <strong>Saturation</strong> (how constrained the most constrained resource is, e.g., memory or thread pool capacity).</p>\n    </div>",
    "keyTakeaways": [
      "Combine Metrics (alerting), Logs (context), and Distributed Tracing (cross-service latency diagnosis).",
      "Standardize telemetry collection across languages using OpenTelemetry (OTel).",
      "Monitor the Four Golden Signals: Latency, Traffic, Errors, and Saturation."
    ],
    "furtherReading": [
      {
        "title": "Google SRE Book: Monitoring Distributed Systems",
        "url": "https://sre.google/sre-book/monitoring-distributed-systems/"
      },
      {
        "title": "OpenTelemetry Documentation",
        "url": "https://opentelemetry.io/"
      }
    ]
  },
  "slos-and-error-budgets": {
    "title": "SLOs and error budgets",
    "video": {
      "youtubeId": "Akri1BlGp10",
      "title": "SLO vs SLI vs SLA vs Error Budget | Google SRE in Plain English",
      "channel": "Google Cloud"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>SLI, SLO, and SLA Demystified</h2>\n      <ul>\n        <li><strong>SLI (Service Level Indicator):</strong> A carefully defined metric that measures service behavior (e.g., <em>\"percentage of HTTP requests returning in &lt; 200ms with a 2xx status\"</em>).</li>\n        <li><strong>SLO (Service Level Objective):</strong> An internal target reliability threshold agreed upon between product and engineering teams (e.g., <em>\"99.9% of requests meet the SLI over a 30-day rolling window\"</em>).</li>\n        <li><strong>SLA (Service Level Agreement):</strong> A commercial contract with customers specifying legal and financial penalties (refunds, credits) if reliability drops below a contractual threshold (e.g., 99.5%).</li>\n      </ul>\n\n      <h2>The Error Budget Concept</h2>\n      <p>A 100% target is usually impractical and can suppress useful change. If an availability SLO is 99.9%, its error budget is the remaining 0.1% of eligible events in the stated window. Teams use a written error-budget policy to decide which risky changes to slow or stop when burn is excessive; an automatic freeze of every release is one possible policy, not part of the definition, and urgent security or reliability fixes may still need to ship.</p>\n    </div>",
    "keyTakeaways": [
      "SLIs measure, SLOs set targets, and SLAs impose commercial consequences.",
      "100% uptime is never the goal; error budgets balance feature velocity against stability.",
      "When the error budget burns too fast, enforce deployment freezes to protect user trust."
    ],
    "furtherReading": [
      {
        "title": "Google SRE Book: Service Level Objectives",
        "url": "https://sre.google/sre-book/service-level-objectives/"
      }
    ]
  },
  "incident-response": {
    "title": "Incident response",
    "video": {
      "youtubeId": "Akri1BlGp10",
      "title": "SLO vs SLI vs SLA vs Error Budget | Google SRE in Plain English",
      "channel": "Google Cloud"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Structured Incident Roles</h2>\n      <p>When high-severity outages occur, unstructured chaos compounds the damage. High-performing organizations use incident command systems with distinct roles:</p>\n      <ul>\n        <li><strong>Incident Commander (IC):</strong> Owns the incident, delegates investigation tasks, and has final authority over mitigation actions (e.g., rollback or failover).</li>\n        <li><strong>Operations Lead:</strong> Subject matter expert executing diagnostics, reading graphs, and applying targeted fixes.</li>\n        <li><strong>Communications Lead:</strong> Provides periodic status updates to customers and internal stakeholders, freeing the technical team from interruptions.</li>\n      </ul>\n\n      <h2>Blameless Post-Mortems</h2>\n      <p>Human error is a symptom of a flawed process or brittle system, not the root cause. Blameless post-mortems assume that engineers acted with good intentions based on the information they had. Reviews focus on systemic protections: improving guardrails, automated tests, and canary rollouts.</p>\n    </div>",
    "keyTakeaways": [
      "Establish strict incident roles: Incident Commander, Operations Lead, and Communications Lead.",
      "Prioritize fast mitigation (rollback, traffic drain) over debugging root cause in the middle of an active outage.",
      "Conduct blameless post-mortems to discover systemic vulnerabilities and prevent repeat incidents."
    ],
    "furtherReading": [
      {
        "title": "PagerDuty Incident Response Playbook",
        "url": "https://response.pagerduty.com/"
      }
    ]
  },
  "deployment-and-migration-safety": {
    "title": "Deployment and migration safety",
    "video": {
      "youtubeId": "u4EgIU8_f5U",
      "title": "Multi-active disaster recovery in CockroachDB",
      "channel": "CockroachDB"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Zero-Downtime Deployment Strategies</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Strategy{\"Deployment Pattern\"}\n    Strategy --> Rolling[\"Rolling Update: Incrementally replace old pods with new\"]\n    Strategy --> BlueGreen[\"Blue-Green: Stand up twin cluster, switch router atomically\"]\n    Strategy --> Canary[\"Canary Release: Route 1% of live traffic to new version\"]\n    Canary --> MetricsCheck{\"Error rate or latency spike?\"}\n    MetricsCheck -->|Yes| AutoRollback[\"Automatic Fast Rollback\"]\n    MetricsCheck -->|No| Promote[\"Promote to 10% -> 50% -> 100%\"]\n      </div>\n\n      <h2>Canary Deployments with Automated Rollbacks</h2>\n      <p>Never deploy new software to 100% of servers at once. In a canary deployment, the new release is deployed to a tiny subset of machines (e.g., 2%). The traffic router sends 2% of live production traffic to the canary. Automated monitors compare error rates and latency percentiles (p99) against the baseline control cluster. If metrics degrade, the canary is drained automatically within seconds.</p>\n    </div>",
    "keyTakeaways": [
      "Use Canary deployments with automated metric verification to minimize outage blast radius.",
      "Decouple code deployment from feature release using Feature Flags.",
      "Blue-Green deployments provide instantaneous rollback capability at the cost of duplicate infrastructure."
    ],
    "furtherReading": [
      {
        "title": "Martin Fowler: BlueGreenDeployment",
        "url": "https://martinfowler.com/bliki/BlueGreenDeployment.html"
      }
    ]
  },
  "database-migration-safety": {
    "title": "Database migration safety",
    "video": {
      "youtubeId": "u4EgIU8_f5U",
      "title": "Multi-active disaster recovery in CockroachDB",
      "channel": "CockroachDB"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Expand and Contract Pattern</h2>\n      <p>Applying breaking schema changes (renaming a column, splitting tables) directly on a live database with zero downtime is impossible in a single deployment. The industry standard is the <strong>Expand and Contract (Parallel Run)</strong> pattern executed in 4 distinct phases:</p>\n\n      <ol>\n        <li><strong>Phase 1 (Expand):</strong> Add the new column or table alongside the old one. The database now contains both.</li>\n        <li><strong>Phase 2 (Dual Write):</strong> Deploy an application release that reads from the old column, but writes mutations to both the old and new columns simultaneously. A background backfill job migrates historical rows.</li>\n        <li><strong>Phase 3 (Switch Read):</strong> Once backfill and validation pass, deploy an update that switches reads to the new column.</li>\n        <li><strong>Phase 4 (Contract):</strong> Remove the dual-write code and drop the old, unused column.</li>\n      </ol>\n    </div>",
    "keyTakeaways": [
      "Never execute breaking schema modifications in a single step on live production databases.",
      "Follow the Expand and Contract pattern across separate application deployment cycles.",
      "Verify dual-write correctness with automated shadow verification before cutting over reads."
    ],
    "furtherReading": [
      {
        "title": "Stripe: Online Migrations at Scale",
        "url": "https://stripe.com/blog/online-migrations"
      }
    ]
  },
  "parallel-monolith-read-drain": {
    "title": "Parallel monolith read drain",
    "video": {
      "youtubeId": "NdeTGlZ__Do",
      "title": "Monolithic vs Microservice Architecture: Which To Use and When?",
      "channel": "Alex Hyett"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Decommissioning Monolith Endpoints Safely</h2>\n      <p>When extracting microservices from an existing monolithic application (the Strangler Fig pattern), abruptly switching all customer traffic risks catastrophic bugs. The <strong>Parallel Read Drain (Dark Launch)</strong> pattern validates the new microservice invisibly in production:</p>\n\n      <h2>Dark Launching / Shadow Traffic</h2>\n      <p>The API Gateway receives a user request and forwards it to the legacy monolith. Simultaneously, the gateway clones the request asynchronously (fire-and-forget) to the new microservice. A shadow comparison worker compares the two HTTP responses. Discrepancies are logged and fixed before any live user ever touches the new service.</p>\n    </div>",
    "keyTakeaways": [
      "Use shadow traffic (dark launching) to stress-test extracted microservices with real production loads.",
      "Compare response payloads between legacy and new services automatically to catch subtle edge-case bugs.",
      "Gradually drain reads using percentage-based gateway traffic splits."
    ],
    "furtherReading": [
      {
        "title": "Martin Fowler: Strangler Fig Application",
        "url": "https://martinfowler.com/bliki/StranglerFigApplication.html"
      }
    ]
  },
  "database-backups-and-restore": {
    "title": "Backups and restore",
    "video": {
      "youtubeId": "DQ57zYedMdQ",
      "title": "API Design in System Design Interviews w/ Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Full Snapshots vs. Point-in-Time Recovery (PITR)</h2>\n      <p>Nightly database dumps (via <code>pg_dump</code> or <code>mysqldump</code>) leave an unacceptable 24-hour data loss window. Modern production databases combine periodic snapshots with continuous Write-Ahead Log (WAL) archiving to achieve <strong>Point-in-Time Recovery (PITR)</strong>.</p>\n\n      <h2>How PITR Works</h2>\n      <p>The database streams its binary write log segments (WAL in Postgres, binlog in MySQL) continuously to encrypted object storage (S3). To restore to a state right before a catastrophic human error (e.g., an accidental <code>DROP TABLE</code> at 14:02:15):</p>\n      <ol>\n        <li>Restore the latest baseline snapshot taken before the event (e.g., midnight snapshot).</li>\n        <li>Replay the archived WAL logs sequentially up to the exact transaction timestamp (14:02:14).</li>\n      </ol>\n    </div>",
    "keyTakeaways": [
      "Nightly dumps are insufficient; implement Point-in-Time Recovery (PITR) via continuous WAL archiving.",
      "An untested backup is not a backup; run automated weekly restore verification drills.",
      "Store backups in a separate, isolated cloud account with immutable Object Lock (WORM) enabled."
    ],
    "furtherReading": [
      {
        "title": "PostgreSQL Continuous Archiving and Point-in-Time Recovery",
        "url": "https://www.postgresql.org/docs/current/continuous-archiving.html"
      }
    ]
  },
  "disaster-recovery": {
    "title": "Disaster recovery",
    "video": {
      "youtubeId": "u4EgIU8_f5U",
      "title": "Multi-active disaster recovery in CockroachDB",
      "channel": "CockroachDB"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>RTO and RPO Targets</h2>\n      <ul>\n        <li><strong>RPO (Recovery Point Objective):</strong> The maximum acceptable age of data that must be recovered after an outage (measures acceptable data loss).</li>\n        <li><strong>RTO (Recovery Time Objective):</strong> The maximum acceptable duration of downtime before systems are restored to operational status.</li>\n      </ul>\n\n      <h2>Disaster Recovery Topologies</h2>\n      <p>Architectures range in cost and capability: Backup & Restore (often hours to days), Pilot Light (minimal core running in a secondary region), Warm Standby (a scaled-down replica stack), and Active-Active Multi-Region (traffic served in multiple regions). Active-active can target low RTO, but replication lag, conflicts, quorum loss, routing convergence, and shared dependencies can still produce nonzero RPO and RTO; the topology alone proves neither target.</p>\n    </div>",
    "keyTakeaways": [
      "RPO defines allowable data loss; RTO defines allowable downtime duration.",
      "Active-Active provides the lowest RTO but requires distributed data replication strategies.",
      "Conduct regular Chaos Engineering exercises (like Chaos Monkey) to validate failover automation."
    ],
    "furtherReading": [
      {
        "title": "AWS Disaster Recovery Architecture Whitepaper",
        "url": "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html"
      }
    ]
  },
  "data-retention-and-deletion": {
    "title": "Data retention, deletion, and privacy",
    "video": {
      "youtubeId": "Akri1BlGp10",
      "title": "SLO vs SLI vs SLA vs Error Budget | Google SRE in Plain English",
      "channel": "Google Cloud"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Distributed Deletion Challenge</h2>\n      <p>Deleting data in a single SQL table with <code>DELETE FROM users WHERE id = ?</code> is trivial; deleting user data across a distributed system with dozens of microservices, read replicas, search clusters, message queues, and append-only backups is one of the hardest operational challenges in software engineering. Regulatory mandates like GDPR (Right to Erasure) and CCPA require verified permanent erasure within strict legal windows (typically 30 days).</p>\n\n      <h2>Distributed Deletion Orchestration Pipeline</h2>\n      <div class=\"mermaid\">\nsequenceDiagram\n    autonumber\n    actor User as Data Subject\n    participant API as Privacy API Gateway\n    participant Orch as Deletion Orchestrator\n    participant DB as User Database (Primary)\n    participant Kafka as Event Bus ('user.erased')\n    participant Search as Elasticsearch Cluster\n    participant S3 as Cold Storage / Data Lake\n\n    User->>API: POST /v1/privacy/erasure-request\n    API->>Orch: Schedule Async Erasure Workflow\n    Orch->>DB: Soft-Delete + Anonymize PII (Immediate Lock)\n    Orch->>Kafka: Publish 'user.erased' Event\n    Kafka->>Search: Purge Documents by user_id\n    Kafka->>S3: Cryptographic Shredding (Destroy KMS Key)\n    Orch->>User: 202 Accepted (Audit Receipt Generated)\n      </div>\n\n      <h2>Core Production Deletion Mechanics</h2>\n      <h3>1. Tombstones and the Data Resurrection Hazard</h3>\n      <p>In distributed LSM-tree and wide-column databases (Cassandra, Bigtable, RocksDB), deletes are not in-place physical overwrites. Instead, the storage engine writes a special marker record called a <strong>Tombstone</strong>. If a node is down during deletion and repairs after the tombstone's Garbage Collection Grace Period (<code>gc_grace_seconds</code>) expires, the resurrected old data is propagated back to healthy nodes as valid state. Production systems strictly coordinate repair intervals to occur well within tombstone expiration limits.</p>\n\n      <h3>2. Cryptographic Shredding for Immutable Backups</h3>\n      <p>Modifying historical immutable WAL archives or Glacier cold backups to erase a single user is physically impossible without re-writing entire multi-terabyte snapshot files. Production architectures solve this via <strong>Cryptographic Shredding</strong>: each user's sensitive PII is encrypted with a distinct per-user Data Encryption Key (DEK) managed in KMS. When an erasure request arrives, the orchestrator securely destroys the user's specific DEK. The encrypted ciphertext in cold backups becomes instantaneously and provably unrecoverable random noise without rewriting historical media.</p>\n\n      <h3>3. Automated TTL Lifecycle Reapers</h3>\n      <p>Data that is not retained cannot be breached. Production systems configure strict Time-To-Live (TTL) policies at the database layer (PostgreSQL partitioned table dropping, DynamoDB TTL attributes, Redis key expirations) to automatically purge ephemeral audit logs, session records, and abandoned shopping carts without manual batch scripts.</p>\n    </div>",
    "keyTakeaways": [
      "In distributed wide-column and LSM storage, deletes write Tombstones; premature tombstone cleanup causes catastrophic data resurrection.",
      "Use Cryptographic Shredding (destroying per-user KMS encryption keys) to achieve instant GDPR erasure across immutable cold backups.",
      "Partition time-series audit tables by month or day so aging data can be dropped instantly via DROP TABLE instead of heavy DELETE scans."
    ],
    "furtherReading": [
      {
        "title": "Apache Cassandra: Distributed Deletes and Tombstones Deep Dive",
        "url": "https://cassandra.apache.org/doc/latest/cassandra/operating/bloom_filters.html"
      },
      {
        "title": "NIST SP 800-88: Guidelines for Media Sanitization (Cryptographic Erase)",
        "url": "https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final"
      }
    ]
  },
  "security-and-abuse-prevention": {
    "title": "Security and abuse prevention",
    "video": {
      "youtubeId": "YXkOdWBwqaA",
      "title": "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Defense-in-Depth Architecture</h2>\n      <p>Modern system design operates under the <strong>Zero Trust</strong> security paradigm: assume the perimeter is already breached, network transport is inherently hostile, and every request must be authenticated, authorized, and continuously validated. Relying on a single firewall or border proxy creates a catastrophic single point of failure.</p>\n\n      <h2>Layered Defense Perimeter</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Internet[\"Public Internet Traffic\"] --> Cloudflare[\"1. Edge CDN & DDoS Mitigation (Anycast BGP Scrubbing)\"]\n    Cloudflare --> WAF[\"2. Web Application Firewall (SQLi, XSS, OWASP Top 10)\"]\n    WAF --> BotMit[\"3. Bot & Abuse Detection (JA3 Fingerprinting, Turnstile)\"]\n    BotMit --> Gateway[\"4. API Gateway (OAuth2 / JWT Token Validation, Rate Limiting)\"]\n    Gateway --> Mesh[\"5. Internal Service Mesh (Mutual TLS 1.3 with SPIFFE / SPIRE)\"]\n    Mesh --> ServiceA[\"Microservice A (Least Privilege IAM)\"]\n    ServiceA --> DB[(\"Encrypted Datastore (Envelope Encryption with AWS KMS / HashiCorp Vault)\")]\n      </div>\n\n      <h2>Production Abuse Mitigation Vectors</h2>\n      <h3>1. Credential Stuffing & Automated Bot Mitigation</h3>\n      <p>Malicious actors weaponize billions of leaked password dumps to execute automated distributed brute-force attempts against login and authentication endpoints. Defenses include TLS Client Hello (JA3/JA4) fingerprinting to identify headless HTTP client scripts, IP reputation lookups, and progressive behavioral challenges (invisible CAPTCHA) triggered when request anomalies exceed threshold limits.</p>\n\n      <h3>2. Mutual TLS (mTLS) & Workload Identity</h3>\n      <p>Inside the cloud datacenter, plain unencrypted HTTP between microservices is unacceptable. Service meshes (Istio, Linkerd) enforce <strong>Mutual TLS (mTLS)</strong> with short-lived cryptographic x509 certificates rotated hourly by SPIRE. Every service verifies the exact cryptographic identity of the calling service before granting RPC access.</p>\n\n      <h3>3. Envelope Encryption at Rest</h3>\n      <p>Data written to persistent storage is secured using <strong>Envelope Encryption</strong>: a unique local Data Encryption Key (DEK) encrypts the file or database row, and the DEK itself is encrypted by a root Key Encryption Key (KEK) locked inside a Hardware Security Module (HSM / AWS KMS). The plaintext DEK exists only in volatile memory during active encryption/decryption.</p>\n    </div>",
    "keyTakeaways": [
      "Zero Trust architecture requires authenticating and encrypting every hop; never trust internal datacenter network traffic.",
      "Protect authentication endpoints using behavioral fingerprinting (JA3 TLS signatures) and composite rate limiting.",
      "Enforce Envelope Encryption with KMS-backed Hardware Security Modules to protect customer data at rest."
    ],
    "furtherReading": [
      {
        "title": "Google Cloud: BeyondCorp Zero Trust Security Framework",
        "url": "https://cloud.google.com/beyondcorp"
      },
      {
        "title": "OWASP Top Ten Web Application Security Risks",
        "url": "https://owasp.org/www-project-top-ten/"
      }
    ]
  },
  "rate-limiter-placement-and-keys": {
    "title": "Rate limiter placement and keys",
    "video": {
      "youtubeId": "YXkOdWBwqaA",
      "title": "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Placement: Edge vs. Gateway vs. Service-Level</h2>\n      <ul>\n        <li><strong>CDN / Edge:</strong> Stops volumetric DDoS attacks before they reach internal cloud infrastructure. Filters by client IP.</li>\n        <li><strong>API Gateway:</strong> Protects the overall fleet. Enforces organization-wide rate limits based on API keys, authenticated user IDs, and client tiers.</li>\n        <li><strong>Service-Level:</strong> Enforces domain-specific limits (e.g., maximum 5 password reset attempts per email per hour) directly within the service.</li>\n      </ul>\n\n      <h2>Choosing the Rate Limit Key</h2>\n      <p>Rate limiting solely by IP address fails because thousands of mobile users on cellular networks or corporate offices share the same public NAT IP. Effective rate limiting uses composite keys: <code>UserId + Action</code> for authenticated users, and <code>IP + DeviceFingerprint</code> for anonymous endpoints.</p>\n    </div>",
    "keyTakeaways": [
      "Place rate limiters at multiple tiers: Edge (DDoS), API Gateway (API keys), and Service (business operations).",
      "Avoid IP-only rate limiting due to shared corporate NAT gateways; use composite keys.",
      "Choose fail-open, fail-closed, or a local emergency limit per operation: low-risk reads may degrade open, while login, password reset, spending, and expensive endpoints still need protection when Redis fails."
    ],
    "furtherReading": [
      {
        "title": "Envoy Proxy: Global Rate Limiting Architecture",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting"
      }
    ]
  },
  "sliding-window-rate-limiter": {
    "title": "Sliding window rate limiter",
    "video": {
      "youtubeId": "YXkOdWBwqaA",
      "title": "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Eliminating the Boundary Burst Flaw</h2>\n      <p>Rate limiting algorithms prevent system overload by bounding request frequency over time. Naive <strong>Fixed Window Counters</strong> suffer from the 2x burst vulnerability: if a limit allows 100 requests/minute, an attacker can dispatch 100 requests at 00:59 and another 100 requests at 01:00, forcing 200 requests within a 2-second window without triggering any rate limit violation.</p>\n\n      <h2>Rate Limiting Algorithms Compared</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Algo{\"Algorithm Choice\"}\n    Algo -->|\"Exact precision, High memory footprint\"| SWL[\"Sliding Window Log: Redis Sorted Set with Unix Timestamps\"]\n    Algo -->|\"O(1) memory, Smooth boundary interpolation\"| SWC[\"Sliding Window Counter: Weighted Past + Current Window\"]\n    Algo -->|\"Smooth traffic shaping, Queue buffer\"| LB[\"Leaky Bucket: Constant Outflow Rate\"]\n    Algo -->|\"Bursty traffic allowance\"| TB[\"Token Bucket: Refill Rate + Max Bucket Burst\"]\n      </div>\n\n      <h2>Sliding Window Counter Mathematics & Implementation</h2>\n      <p>The <strong>Sliding Window Counter</strong> combines the memory efficiency of fixed windows with the smoothness of a continuous sliding window. It tracks request counts across only two keys (the current window and the previous window) and calculates an interpolated estimate:</p>\n\n      <pre><code>Estimated Count = (Previous Window Count * (1 - Current Offset Ratio)) + Current Window Count\nWhere Current Offset Ratio = (Current Timestamp - Window Start) / Window Duration</code></pre>\n\n      <h3>Concrete Numeric Example:</h3>\n      <p>Suppose the limit is 100 requests per 60-second window. The previous window recorded 80 requests. We are currently 15 seconds into the new window (25% through), and have registered 30 requests so far:</p>\n      <pre><code>Estimated Count = (80 * (1 - 0.25)) + 30 = (80 * 0.75) + 30 = 60 + 30 = 90 requests (Allowed, 90 < 100)</code></pre>\n\n      <h2>Atomic Redis Execution with Lua</h2>\n      <p>Because multiple concurrent application servers query the rate limiter simultaneously, checking and incrementing counters across network hops introduces race conditions. Production architectures wrap the lookup and increment logic inside an atomic <strong>Redis Lua Script</strong>, guaranteeing single-threaded atomic execution with zero distributed lock contention.</p>\n    </div>",
    "keyTakeaways": [
      "Fixed window limiters allow 2x traffic bursts across window boundaries; sliding window counter smooths this boundary.",
      "Sliding window counter uses only 2 integer keys per client, achieving O(1) memory vs O(N) memory in sliding window logs.",
      "Execute rate limit checks atomically using Redis Lua scripts to eliminate race conditions between concurrent requests."
    ],
    "furtherReading": [
      {
        "title": "Cloudflare Engineering: How We Built Rate Limiting at Global Scale",
        "url": "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/"
      },
      {
        "title": "Figma: An Alternative Approach to Rate Limiting",
        "url": "https://www.figma.com/blog/an-alternative-approach-to-rate-limiting/"
      }
    ]
  },
  "multi-tenant-design": {
    "title": "Multi-tenant design",
    "video": {
      "youtubeId": "NdeTGlZ__Do",
      "title": "Monolithic vs Microservice Architecture: Which To Use and When?",
      "channel": "Alex Hyett"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Multi-Tenancy Isolation Models</h2>\n      <p>Multi-tenant SaaS architectures balance tenant data isolation against infrastructure cost:</p>\n      <ul>\n        <li><strong>Silo Model (Database-per-Tenant):</strong> Each tenant gets a dedicated database instance. Provides maximum isolation and security compliance; highest operational and infrastructure cost.</li>\n        <li><strong>Bridge Model (Schema-per-Tenant):</strong> Tenants share a database cluster but use separate PostgreSQL schemas.</li>\n        <li><strong>Pool Model (Shared Database & Tables):</strong> All tenants share the same tables, with every row containing a <code>tenant_id</code> column. Most cost-effective; requires strict Row-Level Security (RLS) to prevent cross-tenant data leaks.</li>\n      </ul>\n\n      <h2>The Noisy Neighbor Problem</h2>\n      <p>A single large tenant executing heavy batch queries can starve CPU and IOPS, degrading performance for all other tenants. Multi-tenant systems enforce per-tenant rate limits, resource quotas, and tenant-aware database connection pools.</p>\n    </div>",
    "keyTakeaways": [
      "Choose the right isolation model: Silo (dedicated DBs), Bridge (dedicated schemas), or Pool (shared tables with tenant_id).",
      "Use PostgreSQL Row-Level Security (RLS) to enforce tenant isolation at the database engine level.",
      "Prevent noisy neighbors with per-tenant connection pooling and CPU/memory resource quotas."
    ],
    "furtherReading": [
      {
        "title": "AWS SaaS Architecture Fundamentals",
        "url": "https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/architecture-patterns.html"
      }
    ]
  }
};
