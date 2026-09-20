/* ═══════════════════════════════════════════════════════════════
   Exercises & Concept Reinforcement Engine
   ═══════════════════════════════════════════════════════════════ */

window.Exercises = (() => {
  // Topic-specific practical exercises & FAANG architectural challenges
  const exerciseBank = {
    // 01 Foundations
    "requirements-clarification": {
      title: "Clarifying Functional vs Non-Functional Requirements",
      difficulty: "Foundational",
      prompt: "An interviewer asks you to 'Design Twitter'. What is your very first operational priority before drawing any architecture diagram?",
      scenario: "System: Twitter/X · Scale: 500M daily active users · Constraints: 45-minute interview window.",
      options: [
        "Immediately jump to drawing an API gateway and sharded PostgreSQL cluster on the whiteboard.",
        "Clarify core functional scope (post tweet, timeline read, follow user) and non-functional requirements (read vs write latency, consistency model, SLA).",
        "Explain the internal implementation of Redis sorted sets for timeline caches.",
        "Calculate hardware memory costs for 100 terabytes of RAM."
      ],
      answer: 1,
      explanation: "Always establish requirements first. Defining scope (read/write QPS, availability vs consistency, tweet length, media upload) prevents over-engineering and demonstrates Staff-level communication skills."
    },
    "back-of-the-envelope-capacity-planning": {
      title: "Back-of-the-Envelope Math: Storage & QPS Estimation",
      difficulty: "Intermediate",
      prompt: "A photo-sharing service receives 50 million photo uploads per day. Each photo is compressed to 200 KB on average. How much disk storage is needed per year (excluding replication factor)?",
      scenario: "50M uploads/day × 200 KB/photo = 10,000,000,000 KB/day = 10 TB/day.",
      options: [
        "~365 GB per year",
        "~3.65 PB (Petabytes) per year",
        "~36.5 PB (Petabytes) per year",
        "~365 TB per year"
      ],
      answer: 1,
      explanation: "10 TB/day × 365 days = 3,650 TB = ~3.65 Petabytes per year. Factoring in 3x replication, the total physical storage capacity required is approximately 10.95 PB/year."
    },
    "system-design-tradeoffs": {
      title: "Evaluating Architectural Tradeoffs",
      difficulty: "Staff Level",
      prompt: "When designing a financial transactions ledger (like Stripe or PayPal), which tradeoff priority is strictly mandatory?",
      scenario: "Financial ledger with multi-currency transfers across international banks.",
      options: [
        "Prioritize extreme low latency (< 1ms) by accepting eventual consistency and asynchronous dirty writes.",
        "Prioritize Strict Serializability and Strong Consistency (ACID) over availability (preferring CP in CAP) to prevent duplicate balances.",
        "Store account balances in Redis in-memory caches without Write-Ahead Logging to maximize write throughput.",
        "Use single-leader asynchronous replication across continents without idempotency keys."
      ],
      answer: 1,
      explanation: "In financial ledgers, double-spending and corrupted balances are catastrophic. Systems choose Strong Consistency (CP) and double-entry bookkeeping over raw availability or sub-millisecond writes."
    },

    // 02 APIs & Protocols
    "tcp-vs-udp": {
      title: "Transport Protocol Selection",
      difficulty: "Intermediate",
      prompt: "You are building a live real-time multiplayer FPS game (like Valorant or CS:GO) where player coordinates update 60 times per second. Which protocol is appropriate and why?",
      scenario: "Player coordinates stream every 16ms. Network packet loss is occasionally 1-2%.",
      options: [
        "TCP: Guarantees every coordinate packet arrives reliably and in exact order without data loss.",
        "UDP: Eliminates head-of-line blocking; late packets are dropped rather than delaying subsequent real-time frames.",
        "HTTP/1.1: Uses chunked transfer encoding over persistent SSL connections.",
        "gRPC with unary requests over TLS."
      ],
      answer: 1,
      explanation: "TCP head-of-line blocking stalls playback waiting for retransmission of dropped packets. In fast-paced games, a 100ms-old position packet is useless; dropping it and rendering the fresh position via UDP is superior."
    },
    "load-balancers": {
      title: "L4 vs L7 Load Balancing Selection",
      difficulty: "Intermediate",
      prompt: "When would you choose a Layer 7 (Application) Load Balancer over a Layer 4 (Transport) Load Balancer?",
      scenario: "Fleet of microservices: /api/v1/auth, /api/v1/billing, and /static/media on distinct server pools.",
      options: [
        "When you only need ultra-high-throughput routing based purely on IP and TCP port numbers.",
        "When you need path-based routing (/api/v1/checkout), HTTP header inspection, cookie-based session stickiness, and TLS termination.",
        "When handling UDP packet streams for video conferencing.",
        "When you want to avoid decrypting HTTPS traffic entirely."
      ],
      answer: 1,
      explanation: "Layer 7 load balancers (like Nginx, Envoy, AWS ALB) terminate HTTP/TLS and parse request paths and headers, allowing intelligent microservice routing."
    },
    "retries-timeouts-idempotency": {
      title: "Thundering Herd & Retry Storm Mitigation",
      difficulty: "Staff Level",
      prompt: "A payment microservice experiences an intermittent 2-second network blip. 10,000 client requests immediately retry every 500ms. The backend crashes completely upon recovery. What pattern fixes this?",
      scenario: "Failure mode: Cascading retry storm saturating backend connection pools.",
      options: [
        "Increase client retry attempts from 3 to 10 to ensure delivery.",
        "Implement Exponential Backoff with Jitter (randomized delay) and strict circuit breakers.",
        "Disable all timeouts so client requests wait indefinitely.",
        "Switch all HTTP calls to synchronous REST polling."
      ],
      answer: 1,
      explanation: "Exponential backoff ($t = 2^n$) spreads out retries. Adding random jitter breaks up synchronized client retry spikes ('thundering herd'), allowing the recovering service to clear its queue."
    },

    // 04 NoSQL & Partitioning
    "consistent-hashing-load-balancing": {
      title: "Consistent Hashing Ring Mechanics",
      difficulty: "Advanced",
      prompt: "In a consistent hashing ring with $N$ caching nodes, a server crashes. What fraction of total keys must be remapped to different nodes?",
      scenario: "Distributed cache storing 10 million user session tokens across 10 cache servers.",
      options: [
        "100% of all keys must be re-hashed and moved.",
        "Approximately $1/N$ of keys (only the keys that were mapped to the crashed node).",
        "50% of the keys on neighboring nodes.",
        "0% because keys are duplicated on every single node."
      ],
      answer: 1,
      explanation: "Unlike standard modulo hashing ($hash(k) \\% N$) where changing $N$ invalidates almost 100% of keys, consistent hashing limits key remapping strictly to $1/N$ on average, preventing severe cache stampedes."
    },

    // 05 Caching
    "caching-fast-reads": {
      title: "Cache Stampede & Dogpiling Defense",
      difficulty: "Advanced",
      prompt: "A celebrity with 50M followers tweets. The cached tweet expires (TTL hits 0). 100,000 requests per second simultaneously miss the cache and hit the database. What prevents this crash?",
      scenario: "Cache stampede / Dog-piling effect on key expiration.",
      options: [
        "Set TTL to 0 so the key is never cached.",
        "Use Distributed Mutual Exclusion (Mutex lock in Redis) or Probabilistic Early Expiration (XFetch algorithm) so only one worker re-computes the cache.",
        "Increase PostgreSQL max_connections to 100,000.",
        "Send an HTTP 500 error to 90% of requests."
      ],
      answer: 1,
      explanation: "A distributed mutex (single flight) ensures only one request queries the database to warm the cache while all other concurrent requests wait or read stale data."
    },

    // 06 Distributed Coordination
    "consensus-algorithms": {
      title: "Raft & Paxos Quorum Math",
      difficulty: "Staff Level",
      prompt: "A Raft consensus cluster consists of 5 nodes. What is the minimum number of healthy nodes required to elect a leader and commit write entries?",
      scenario: "Cluster size $N = 5$. Majority Quorum rule applies.",
      options: [
        "2 nodes",
        "3 nodes ($(N/2) + 1$)",
        "4 nodes",
        "All 5 nodes must agree unanimously"
      ],
      answer: 1,
      explanation: "Majority quorum requires $\\lfloor N/2 \\rfloor + 1$ nodes. For a 5-node cluster, a quorum is $\\lfloor 5/2 \\rfloor + 1 = 3$. The cluster can survive the loss of up to 2 nodes without losing consensus."
    },

    // 15 Service Designs
    "url-shortener-system-design": {
      title: "URL Shortener Collision & Key Space",
      difficulty: "Intermediate",
      prompt: "Why is a 64-bit auto-incrementing counter with Base62 preferred over an MD5 hash prefix for generating 7-character short codes?",
      scenario: "Scale: Generating 1 billion short URLs per month without database lookup overhead.",
      options: [
        "Base62 uses fewer bytes in JSON payloads.",
        "A counter converted to Base62 mathematically guarantees 100% uniqueness with zero hash collisions.",
        "MD5 hashing is deprecated for security reasons and cannot be used in URLs.",
        "Base62 can be decrypted back into the original long URL without a database."
      ],
      answer: 1,
      explanation: "Taking the first 7 characters of an MD5 hash inevitably suffers from hash collisions due to the Birthday Paradox, requiring expensive database collision lookups. Converting sequential or Snowflake IDs to Base62 guarantees zero collisions."
    },

    // 16 Product Designs
    "payment-system-design": {
      title: "Payment Idempotency & Two-Phase Commit",
      difficulty: "Staff Level",
      prompt: "A customer clicks 'Pay $100'. The network connection drops before the browser receives the HTTP response. The customer clicks 'Pay $100' again. How do you ensure they are only charged once?",
      scenario: "Mobile network timeout on credit card payment submission.",
      options: [
        "Prompt the customer with a JavaScript alert asking if they really meant to pay again.",
        "Require a client-generated UUID Idempotency-Key in the payment header; the server rejects duplicate keys within a 24-hour window.",
        "Refund all duplicate charges automatically at midnight.",
        "Block all requests coming from the same IP address for 60 seconds."
      ],
      answer: 1,
      explanation: "Idempotency keys (standardized by Stripe) map each transaction uniquely. If a request with an existing key is received, the server returns the cached result without charging the card again."
    },

    // 03 Data Modeling & SQL
    "database-indexing": {
      title: "B-Tree Composite Index Column Ordering",
      difficulty: "Intermediate",
      prompt: "You have a query: WHERE status = 'ACTIVE' AND created_at > '2026-01-01' ORDER BY created_at. Which composite index definition gives optimal performance?",
      scenario: "Table with 50M records. Status has 4 distinct values; created_at is a timestamp.",
      options: [
        "INDEX (created_at, status)",
        "INDEX (status, created_at)",
        "Two separate single-column indexes: INDEX (status) and INDEX (created_at)",
        "No index needed; the query planner automatically parallelizes the table scan"
      ],
      answer: 1,
      explanation: "In composite B-Tree indexes, equality filter columns must precede range/order columns: (Equality, Range). An index on (status, created_at) allows the B-Tree to zoom directly to 'ACTIVE' and scan the sorted timestamps without a filesort."
    },

    // 07 Storage Engines
    "storage-engine-design-constraints": {
      title: "B-Tree vs LSM-Tree Write Amplification",
      difficulty: "Advanced",
      prompt: "Why do high-throughput write-heavy systems (like Cassandra, RocksDB, and Kafka) prefer append-only LSM-trees over traditional B-Trees?",
      scenario: "Workload: 500,000 writes/sec with sequential vs random I/O constraints on NVMe SSDs.",
      options: [
        "LSM-Trees eliminate disk storage entirely by keeping everything in RAM.",
        "B-Trees require random page writes and in-place updates, causing severe write amplification and lock contention compared to append-only sequential writes.",
        "LSM-Trees do not require compaction or background sorting.",
        "B-Trees cannot support range scans."
      ],
      answer: 1,
      explanation: "LSM-Trees append all mutations sequentially to an in-memory MemTable and Write-Ahead Log (WAL). Sequential disk writes approach the physical bandwidth limit of the hardware, avoiding random disk seeks."
    },

    // 08 Async Work & Streams
    "partitioned-log-system-design": {
      title: "Kafka Consumer Lag & Partition Scalability",
      difficulty: "Staff Level",
      prompt: "A Kafka topic has 10 partitions. You deploy 15 instances in the same Consumer Group. How many consumer instances will actively process messages?",
      scenario: "Kafka topic with 10 partitions. High message arrival volume.",
      options: [
        "All 15 instances will process messages concurrently via round-robin.",
        "Exactly 10 instances will each read from 1 partition; 5 instances will sit idle as standby spares.",
        "The cluster will reject the deployment with a PartitionOverflowException.",
        "1 instance will become the leader and process all 10 partitions alone."
      ],
      answer: 1,
      explanation: "In Kafka, a single partition within a topic can only be consumed by at most one consumer instance within the same consumer group at any given time. Max active consumers per group is bounded by partition count."
    },

    // 14 Reliability & Operations
    "slos-and-error-budgets": {
      title: "Error Budget Consumption & Release Freezes",
      difficulty: "Staff Level",
      prompt: "Your team has an SLO of 99.9% monthly availability (allowing 43.8 minutes of downtime). On Day 10 of the month, an outage consumes 42 minutes of downtime. What is the standard SRE policy?",
      scenario: "Monthly error budget 96% consumed in the first third of the calendar month.",
      options: [
        "Increase the SLO to 99.99% so the formula resets.",
        "Halt all non-critical feature deployments and redirect engineering effort to reliability, testing, and automated guardrails until the budget recovers.",
        "Blame the on-call engineer and remove their production deployment permissions.",
        "Ignore the error budget since it has not reached 100% yet."
      ],
      answer: 1,
      explanation: "Error budgets are an explicit contract balancing feature velocity against reliability. When an error budget burns rapidly, freezing feature releases prevents further degradation and protects user trust."
    }
  };

  /**
   * Render an interactive exercise card for a unit
   */
  function renderExercise(slug, unitTitle) {
    const ex = exerciseBank[slug] || generateDynamicExercise(slug, unitTitle);

    return `
      <div class="exercise-box" id="exercise-${slug}">
        <div class="exercise-box__header">
          <div class="exercise-box__title">
            <span>Architecture Challenge: ${escapeHtml(ex.title)}</span>
          </div>
          <span class="exercise-box__difficulty">${escapeHtml(ex.difficulty)}</span>
        </div>
        ${ex.scenario ? `<div class="exercise-box__scenario"><strong>Context / Scenario:</strong> ${escapeHtml(ex.scenario)}</div>` : ''}
        <div class="exercise-box__prompt"><strong>Problem:</strong> ${escapeHtml(ex.prompt)}</div>
        
        <div class="exercise-options" data-answer="${ex.answer}">
          ${ex.options.map((opt, idx) => `
            <div class="exercise-option" onclick="Exercises.checkAnswer(this, ${idx}, ${ex.answer})" data-idx="${idx}">
              <span class="exercise-option__bullet">${String.fromCharCode(65 + idx)}</span>
              <span>${escapeHtml(opt)}</span>
            </div>
          `).join('')}
        </div>

        <div class="exercise-feedback" id="feedback-${slug}">
          <div class="feedback-msg"></div>
          <div class="feedback-exp" style="margin-top:6px;"><strong>Deep Dive Rationale:</strong> ${escapeHtml(ex.explanation)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Generates a context-aware practice scenario if not statically banked
   */
  function generateDynamicExercise(slug, title) {
    const cleanTitle = title || slug.replace(/-/g, ' ');
    return {
      title: cleanTitle + " Architecture Review",
      difficulty: "Practical Exercise",
      prompt: `In an enterprise high-availability environment, what is the primary failure mode to guard against when scaling ${cleanTitle}?`,
      scenario: `Scale: Tier-1 production service handling 100,000 requests/sec with a 99.99% availability SLA.`,
      options: [
        `Single point of failure (SPOF) and unhandled network partitions leading to cascading service collapse.`,
        `Prematurely enabling gzip compression on HTTP response headers.`,
        `Having too many read replicas handling read queries during off-peak hours.`,
        `Using UUID v4 primary keys instead of 32-bit integers in in-memory caches.`
      ],
      answer: 0,
      explanation: `When scaling ${cleanTitle}, eliminating single points of failure (SPOFs), setting explicit timeouts, and isolating failure blast radiuses with circuit breakers is critical to preventing cascading outages.`
    };
  }

  /**
   * Handle option click & display feedback
   */
  function checkAnswer(el, selectedIdx, correctIdx) {
    const parent = el.closest('.exercise-options');
    if (parent.dataset.answered === 'true') return; // Prevent multiple attempts
    parent.dataset.answered = 'true';

    const options = parent.querySelectorAll('.exercise-option');
    const box = el.closest('.exercise-box');
    const feedback = box.querySelector('.exercise-feedback');
    const msgEl = feedback.querySelector('.feedback-msg');

    options.forEach((opt, idx) => {
      if (idx === correctIdx) {
        opt.classList.add('correct');
      } else if (idx === selectedIdx) {
        opt.classList.add('incorrect');
      }
    });

    feedback.classList.add('show');
    const isCorrect = selectedIdx === correctIdx;
    if (isCorrect) {
      feedback.classList.add('success');
      msgEl.innerHTML = '<strong>✓ Correct! Exceptional architectural intuition.</strong>';
    } else {
      feedback.classList.add('error');
      msgEl.innerHTML = '<strong>✗ Incorrect. Review the engineering tradeoff below:</strong>';
    }

    if (window.Analytics?.trackExerciseAttempt) {
      const exerciseTitle = box?.querySelector('.exercise-box__title span')?.textContent || '';
      window.Analytics.trackExerciseAttempt('', exerciseTitle, selectedIdx, isCorrect);
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    renderExercise,
    checkAnswer
  };
})();
