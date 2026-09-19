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
    "content": "<div class=\"lesson-content\">\n      <h2>Regulatory Compliance & The Distributed Deletion Problem</h2>\n      <p>Regulations like GDPR (Right to Be Forgotten) and CCPA require organizations to permanently delete user data upon request across all systems, including cold storage and distributed databases.</p>\n\n      <h2>Tombstones in Distributed Storage</h2>\n      <p>In LSM-tree and distributed wide-column databases (Cassandra, Bigtable, RocksDB), deletes are not executed as in-place overwrites. Instead, the system writes a special marker called a <strong>Tombstone</strong>. If tombstones are purged prematurely before all replicas receive them, old deleted data can resurrect during subsequent replica repair operations.</p>\n    </div>",
    "keyTakeaways": [
      "In distributed storage, deletes write Tombstones; premature tombstone cleanup causes data resurrection.",
      "Enforce automated TTL expiration policies to purge aged logs and sensitive customer records.",
      "Maintain centralized user deletion orchestration pipelines across primary databases, search indexes, and backups."
    ],
    "furtherReading": [
      {
        "title": "Cassandra Tombstone Mechanics",
        "url": "https://docs.datastax.com/en/cassandra-oss/3.x/cassandra/dml/dmlHowDataDeleted.html"
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
    "content": "<div class=\"lesson-content\">\n      <h2>Defense-in-Depth Architecture</h2>\n      <p>Security is never achieved through a single gatekeeper. Defense-in-depth establishes overlapping protective layers: DDoS mitigation at the edge (Cloudflare/AWS Shield), Web Application Firewalls (WAF) inspecting for SQLi/XSS, mutual TLS (mTLS) between internal microservices, and least-privilege IAM policies.</p>\n\n      <h2>Credential Stuffing & Bot Mitigation</h2>\n      <p>Automated bot attacks target login endpoints using leaked credential lists. Modern defenses use fingerprinting (IP reputation, TLS JA3 fingerprints, behavioral CAPTCHAs like Cloudflare Turnstile) combined with global anomaly detection pipelines.</p>\n    </div>",
    "keyTakeaways": [
      "Implement defense-in-depth: Edge DDoS protection, WAF rules, mTLS internal transport, and strict IAM boundaries.",
      "Defend authentication endpoints with behavioral bot detection and rate limits keyed on multiple attributes.",
      "Encrypt data both in transit (TLS 1.3) and at rest (envelope encryption with KMS)."
    ],
    "furtherReading": [
      {
        "title": "OWASP Top Ten Security Risks",
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
    "content": "<div class=\"lesson-content\">\n      <h2>Algorithm Implementation: Sliding Window Counter</h2>\n      <p>The sliding window counter algorithm calculates the rate by blending request counts from the previous window with the current window based on the current timestamp's percentage offset:</p>\n\n      <pre><code>Current Count = Previous Window Count * (1 - (Current Time - Window Start) / Window Duration) + Current Window Count</code></pre>\n\n      <p>If this interpolated estimate exceeds the threshold, the request is rejected with HTTP 429. The weighted counter smooths the sharp reset of a fixed window with constant state per key, but it approximates a true rolling window and can admit or reject differently from an exact timestamp log near a boundary.</p>\n    </div>",
    "keyTakeaways": [
      "Sliding window counter blends previous and current window counts with minimal memory usage.",
      "Reduces the fixed-window boundary spike, while remaining an approximation rather than an exact rolling-window count.",
      "Execute rate limit checks atomically using Redis Lua scripts."
    ],
    "furtherReading": [
      {
        "title": "Cloudflare: How we built rate limiting",
        "url": "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/"
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
