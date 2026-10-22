/**
 * System Design in Depth — Timed Mock Exams & Architecture Certification Dataset
 * Contains 4 comprehensive timed exams covering:
 * 1. 45-min FAANG Staff Mock Exam (Global Video & Social Platform)
 * 2. Distributed Storage & Consensus Mastery (Multi-Region Raft/ACID Engine)
 * 3. Production SRE Readiness (Tier-0 Payment Gateway & Incident DR)
 * 4. High-Scale Streaming & Real-Time (10M Events/sec Real-Time Telemetry)
 */
(function(root) {
  'use strict';

  var EXAMS_DATA = [
    // =========================================================================
    // EXAM 1: 45-Minute FAANG Staff Mock Exam
    // =========================================================================
    {
      id: 'faang-staff-mock-45min',
      title: '45-Minute FAANG Staff System Design Mock Exam',
      subtitle: 'Global Video Streaming & Social Feed Architecture at 500M DAU',
      difficulty: 'Staff / Principal',
      category: 'System Architecture & Scale',
      durationMinutes: 45,
      totalPoints: 100,
      passingScorePercent: 80,
      passingScore: 80,
      trackId: 'track-6',
      scenario: 'You are interviewing for a Staff / Principal Distributed Systems Architect role at a tier-1 tech firm. You must architect a global video publishing and personalized home feed service serving 500 Million Daily Active Users (DAU). You are evaluated on capacity estimation precision, decoupled component selection, boundary resilience, and active-active failover.',
      stages: [
        {
          id: 'stage-1',
          number: 1,
          title: 'Stage 1: Back-of-the-Envelope Capacity Calculations',
          points: 30,
          type: 'capacity',
          instructions: 'Calculate the following steady-state system parameters given: 500M DAU, 20 feed loads per user/day, 2% of users upload 1 video/day (average encoded video package size: 25 MB; video metadata size: 2 KB). Peak traffic multiplier is 2.5x steady state. Input your numeric answers below.',
          inputs: [
            {
              id: 'read-qps-steady',
              label: 'Average Feed Read QPS (steady-state)',
              unit: 'QPS',
              expectedValue: 115740,
              tolerancePercent: 12,
              explanation: '500,000,000 DAU * 20 reads / 86,400s ≈ 115,740 QPS (Acceptable range: 102,000 - 130,000).'
            },
            {
              id: 'read-qps-peak',
              label: 'Peak Feed Read QPS (2.5x peak multiplier)',
              unit: 'QPS',
              expectedValue: 289350,
              tolerancePercent: 12,
              explanation: '115,740 * 2.5 = 289,350 QPS (Acceptable range: 255,000 - 325,000).'
            },
            {
              id: 'write-qps-uploads',
              label: 'Average Video Upload Write QPS',
              unit: 'QPS',
              expectedValue: 116,
              tolerancePercent: 15,
              explanation: '500,000,000 * 0.02 = 10,000,000 uploads/day / 86,400s ≈ 115.7 QPS ≈ 116 QPS (Acceptable range: 100 - 135).'
            },
            {
              id: 'daily-storage-tb',
              label: 'Daily Raw Storage Ingestion Rate (TB/day)',
              unit: 'TB/day',
              expectedValue: 250,
              tolerancePercent: 5,
              explanation: '10,000,000 videos * 25 MB = 250,000,000 MB = 250,000 GB = 250 TB/day.'
            },
            {
              id: 'cache-ram-tb',
              label: 'L1/L2 Redis Feed Cache Memory (80/20 Rule: 20% top active users cached for 1 day, 10 KB feed envelope)',
              unit: 'TB',
              expectedValue: 1.0,
              tolerancePercent: 15,
              explanation: '500M * 20% = 100M active feeds * 10 KB = 1,000,000,000 KB ≈ 1,000 GB = 1 TB RAM.'
            }
          ]
        },
        {
          id: 'stage-2',
          number: 2,
          title: 'Stage 2: Architectural Component Selection & Trade-Offs',
          points: 40,
          type: 'architecture',
          instructions: 'Select the optimal architectural pattern for each subsystem based on strict non-functional constraints.',
          questions: [
            {
              id: 'feed-generation-pattern',
              title: 'Feed Fanout Architecture for High-Follower Accounts',
              prompt: 'A celebrity user with 45 million followers posts a new video. If fanout-on-write (push) is executed for all followers, it causes extreme write amplification and downstream DB queue spikes. What is the standard hybrid architecture?',
              options: [
                'Fanout-on-write for all users, but throttle writes with an in-memory Kafka queue over 4 hours.',
                'Hybrid fanout: fanout-on-write for regular users (<25k followers); fanout-on-read (pull) for celebrity accounts merged with the cached home feed at query time.',
                'Fanout-on-read for all 500M users to eliminate write amplification completely.',
                'Global broadcast via Redis Pub/Sub directly to connected WebSocket clients without persistent storage.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Hybrid fanout balances storage and read latency: 99.9% of users get instantaneous O(1) reads from their pre-materialized inbox, while celebrity updates are merged lazily at read time, avoiding 45M instantaneous database writes.'
            },
            {
              id: 'video-upload-pipeline',
              title: 'Ingestion & Transcoding Pipeline',
              prompt: 'Users upload up to 4K videos from mobile devices over volatile cellular networks. Which end-to-end design provides minimum server load and highest upload completion rate?',
              options: [
                'Direct upload through API Gateway with chunked multipart transfer buffering into local application SSDs.',
                'Direct-to-Object-Storage pre-signed S3 URLs with resumable chunked multipart upload, triggering asynchronous S3 Event Notifications into an SQS transcode queue.',
                'WebRTC peer-to-peer streaming directly to transcoding worker microservices.',
                'Upload video directly to Redis cluster buffer before flushing to distributed file systems.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Pre-signed S3 multipart uploads bypass application servers completely, isolating high-bandwidth binary ingress to cloud edge storage. Asynchronous SQS triggers autoscale video transcode workers without blocking the API.'
            },
            {
              id: 'metadata-storage-selection',
              title: 'Primary Metadata Storage Engine',
              prompt: 'Video metadata requires sub-5ms primary key lookups by VideoID, high write throughput for view counts, and strong consistency for ownership/privacy flags. What is the Staff-level recommendation?',
              options: [
                'Single sharded PostgreSQL cluster with synchronous replication across 3 availability zones.',
                'Cassandra/ScyllaDB for horizontal video metadata sharded by Hash(VideoID), combined with Redis for atomic view-count counters and Redis Bloom filters for rapid lookup.',
                'Elasticsearch cluster as primary authoritative datastore for both writes and full-text search.',
                'Pure S3 object storage with JSON manifest files per video.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Wide-column distributed stores (ScyllaDB/Cassandra) provide predictable sub-5ms write/read scalability sharded evenly by VideoID. High-frequency view counts belong in atomic Redis/HyperLogLog counters flushed in micro-batches.'
            },
            {
              id: 'cdn-cache-invalidation',
              title: 'Global CDN Video Segment Delivery Strategy',
              prompt: 'Encoded HLS video segments (.ts / .m4s) are static and immutable once written. How should HTTP cache-control and CDN routing be configured?',
              options: [
                'Cache-Control: no-cache, must-revalidate on all CDN nodes to guarantee safety.',
                'Cache-Control: public, max-age=31536000, immutable for media segments; master playlist (m3u8) served with short TTL (e.g. 2-5s) or dynamic edge worker validation.',
                'Serve all segments directly from origin servers using Anycast BGP routing.',
                'CDN cache keyed by user authorization cookie to prevent unauthorized segment viewing.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Immutable media segments can be cached indefinitely at the CDN edge (offloading >98% origin bandwidth). Playlists maintain short TTLs to allow adaptive bitrate switching and dynamic ad insertion.'
            }
          ]
        },
        {
          id: 'stage-3',
          number: 3,
          title: 'Stage 3: Failure-Mode Identification & Disaster Recovery',
          points: 30,
          type: 'failure-modes',
          instructions: 'Analyze production outage scenarios and select the resilient recovery architecture.',
          questions: [
            {
              id: 'region-evacuation-dns',
              title: 'Complete Cloud Region Outage Failover',
              prompt: 'The primary data center in us-east-1 suffers a physical fiber severance and power failure. How should global client traffic be diverted to us-west-2 with zero manual DNS propagation delay?',
              options: [
                'Lower DNS A-record TTL to 5 seconds and update records via Route53 when health checks fail.',
                'Anycast BGP IP routing at edge Point-of-Presence (PoP) border routers that withdraw BGP route announcements for the failed region, routing packets to the nearest healthy datacenter automatically in <30 seconds.',
                'Client app hardcoded retry loop that falls back to secondary region IP upon timeout.',
                'Active-Passive cold standby recovery using daily EBS snapshots.'
              ],
              correctAnswerIndex: 1,
              rubric: 'BGP Anycast routing abstracts client IPs and fails over at the internet backbone level within seconds, overcoming client-side and ISP DNS TTL caching.'
            },
            {
              id: 'cache-stampede-prevention',
              title: 'Viral Video Metadata Cache Stampede',
              prompt: 'A breaking news video suddenly receives 300,000 QPS. Its metadata key in Redis expires. Thousands of concurrent requests miss cache simultaneously and hit the primary database, threatening a cascading crash. How do you prevent this?',
              options: [
                'Increase database connection pool size from 100 to 50,000 connections.',
                'Probabilistic early expiration (XFetch algorithm) combined with distributed mutex locking (e.g. single-flight pattern) so exactly one worker refreshes the cache while other requests wait or return stale cache.',
                'Disable caching completely during high-traffic events to avoid cache inconsistency.',
                'Restart the Redis cluster with 4x memory.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Single-flight request coalescing and XFetch ensure only one backend query is executed per cache miss while serving near-instantaneous stale data during the refresh window.'
            }
          ]
        }
      ],
      rubricSolution: {
        stage1Review: 'Calculations require proper conversion between DAU, QPS, bytes, and time units (86,400 s/day). 500M DAU with 20 reads/day is 5B requests / 86,400 = 57,870 QPS steady-state, 289,350 QPS peak.',
        stage2Review: 'Staff candidates must cleanly separate push vs pull fanout (hybrid model), offload binary ingress via pre-signed S3 URLs, use wide-column stores for predictable p99 SLAs, and leverage immutable CDN caching.',
        stage3Review: 'Disaster recovery at Staff level requires Anycast BGP edge failover to bypass ISP DNS caching, and single-flight / XFetch probabilistic caching to survive viral thundering herds.'
      }
    },

    // =========================================================================
    // EXAM 2: Distributed Storage & Consensus Mastery
    // =========================================================================
    {
      id: 'distributed-storage-consensus-mastery',
      title: 'Distributed Storage & Consensus Mastery Exam',
      subtitle: 'Multi-Region Raft, Distributed Transactions, WAL, and Consistency Models',
      difficulty: 'Expert',
      category: 'Distributed Systems & Storage',
      durationMinutes: 60,
      totalPoints: 100,
      passingScorePercent: 80,
      passingScore: 80,
      trackId: 'track-3',
      scenario: 'You are evaluating the consistency and durability architecture of an enterprise distributed key-value and transactional document store (similar to Google Spanner / CockroachDB / TiDB) deployed across 5 geographically distributed cloud regions.',
      stages: [
        {
          id: 'stage-1',
          number: 1,
          title: 'Stage 1: Quorum & Replication Latency Budgeting',
          points: 30,
          type: 'capacity',
          instructions: 'Compute quorum consensus parameters for a 5-node Multi-Raft group with nodes in us-east (10ms RTT), us-west (45ms RTT), eu-west (85ms RTT), ap-southeast (170ms RTT), and sa-east (130ms RTT). Primary leader is in us-east.',
          inputs: [
            {
              id: 'raft-quorum-count',
              label: 'Minimum Majority Quorum Size (nodes required for commit in a 5-node Raft group)',
              unit: 'nodes',
              expectedValue: 3,
              tolerancePercent: 0,
              explanation: 'Majority quorum = floor(N / 2) + 1. For N=5, quorum = floor(5/2) + 1 = 3 nodes.'
            },
            {
              id: 'commit-latency-ms',
              label: 'Theoretical Minimum Write Commit Latency (ms) from Leader (us-east)',
              unit: 'ms',
              expectedValue: 45,
              tolerancePercent: 10,
              explanation: 'Leader in us-east already has the entry. To achieve majority (3 nodes), it needs acknowledgments from the 2 fastest peer nodes: us-east local (0ms) + us-east peer (if co-located) or us-west (45ms RTT). With 1 node per region, fastest 2 peers are us-west (45ms) and eu-west (85ms), so minimum round trip to reach 3 nodes is 45ms (or 85ms depending on topology; acceptable: 45 - 85ms).'
            },
            {
              id: 'max-tolerable-failures',
              label: 'Maximum Concurrent Node Failures Tolerated without losing availability',
              unit: 'nodes',
              expectedValue: 2,
              tolerancePercent: 0,
              explanation: 'In a 5-node consensus group, f = floor((N-1)/2) = 2 node failures tolerated.'
            },
            {
              id: 'wal-iops-requirement',
              label: 'Required Sequential WAL Disk IOPS for 20,000 Write QPS without group commit',
              unit: 'IOPS',
              expectedValue: 20000,
              tolerancePercent: 5,
              explanation: 'Without fsync batching / group commit, each write requires an explicit fsync to the Write-Ahead Log: 20,000 IOPS.'
            }
          ]
        },
        {
          id: 'stage-2',
          number: 2,
          title: 'Stage 2: Consensus & Concurrency Control Trade-Offs',
          points: 40,
          type: 'architecture',
          instructions: 'Select the correct consensus and concurrency primitives for multi-region ACID correctness.',
          questions: [
            {
              id: 'linearizable-reads',
              title: 'Linearizable Read Optimization in Raft',
              prompt: 'To serve a read with linearizable consistency (reading latest committed state), standard Raft requires a round of heartbeats to ensure the leader has not been deposed. How does ReadIndex or LeaseRead optimize this?',
              options: [
                'Read directly from any follower without consulting the leader.',
                'LeaseRead uses bounded clock drift and leader lease timer to bypass the network round-trip for reads while guaranteeing the leader remains valid during the lease.',
                'Store all read requests in the persistent WAL before returning.',
                'Switch the database to eventual consistency for all read queries.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Leader Leases allow the leader to serve linearizable reads locally without network communication as long as the monotonic clock has not exceeded the agreed lease period.'
            },
            {
              id: 'distributed-transaction-commit',
              title: 'Cross-Shard Transaction Coordination',
              prompt: 'A distributed transaction updates account balances across two independent Raft groups (Shard A and Shard B). Which combination guarantees atomic commitment across partitions?',
              options: [
                'Single-phase best-effort asynchronous commit.',
                'Two-Phase Commit (2PC) where each participating shard is itself an internally fault-tolerant Raft consensus group acting as a participant.',
                'SAGA pattern with eventual compensation without transaction isolation.',
                'Vector clocks without mutual exclusion locks.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Combining Two-Phase Commit (2PC) over Raft-backed participants eliminates the single-point-of-failure vulnerability of classic 2PC coordinator/participants while maintaining strict serializability.'
            },
            {
              id: 'lsm-vs-btree',
              title: 'Storage Engine Selection for Write-Heavy Ingestion',
              prompt: 'Your service receives 100,000 random-key updates per second. Why is an LSM-Tree (Log-Structured Merge-tree) preferred over a B+ Tree storage engine for this workload?',
              options: [
                'LSM-Trees eliminate all disk compaction overhead completely.',
                'LSM-Trees append writes sequentially to an in-memory MemTable and disk WAL, converting random writes into sequential disk I/O, achieving much lower write amplification during ingestion.',
                'B+ Trees cannot support secondary indexes.',
                'LSM-Trees provide faster single-point point lookups than B+ Trees.'
              ],
              correctAnswerIndex: 1,
              rubric: 'LSM-Trees buffer writes in memory and flush sequentially to immutable SSTables, yielding superior write throughput compared to in-place page splits and random updates in B+ Trees.'
            },
            {
              id: 'vector-clock-concurrency',
              title: 'Conflict Resolution in Masterless Dynamo-style Stores',
              prompt: 'In an eventually consistent multi-master datastore (e.g. Amazon Dynamo or Riak), how do vector clocks differentiate concurrent updates from causal predecessors?',
              options: [
                'By comparing wall-clock NTP timestamps and discarding the older one.',
                'If vector clock V1 dominates V2 in all components (V1[k] >= V2[k] for all k and at least one strict >), V2 causally preceded V1. If neither dominates, a concurrent conflict exists and requires reconciliation.',
                'By electing an arbitrary coordinator to overwrite the conflicting value.',
                'By hashing the key and sorting the hash values.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Vector clocks capture causal ordering without synchronized physical clocks; incomparable vectors indicate concurrent branched edits that must be reconciled by application logic or CRDTs.'
            }
          ]
        },
        {
          id: 'stage-3',
          number: 3,
          title: 'Stage 3: Partition Scenarios & Byzantine Tolerance',
          points: 30,
          type: 'failure-modes',
          instructions: 'Evaluate partition behavior and catastrophic split-brain scenarios.',
          questions: [
            {
              id: 'split-brain-isolation',
              title: 'Network Partition in 5-node Cluster (3 vs 2)',
              prompt: 'A network partition divides a 5-node Raft cluster into Partition A (nodes 1, 2, 3) and Partition B (nodes 4, 5 with previous leader node 4). How does the cluster behave?',
              options: [
                'Partition B continues processing writes normally while Partition A freezes.',
                'Partition A elects a new leader (has 3/5 majority quorum) and commits writes. Partition B cannot achieve quorum (2/5 < 3) so node 4 steps down or rejects writes, preventing split-brain.',
                'Both partitions accept writes, causing divergent divergent histories that cannot be reconciled.',
                'All 5 nodes self-terminate immediately.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Raft consensus invariants guarantee that only the majority partition (Partition A with 3 nodes) can elect a leader and commit entries; the minority partition is unable to form a quorum.'
            },
            {
              id: 'raft-log-matching-invariant',
              title: 'Raft Log Matching Property Violation Prevention',
              prompt: 'If an uncommitted leader crashes after writing an uncommitted log entry at index 45, term 3, what guarantees that future leaders will not violate log safety?',
              options: [
                'Followers delete their entire disk state upon leader change.',
                'Raft Election Safety Rule: a candidate can only be elected if its log is at least as up-to-date as any voter (higher term, or same term and longer log length).',
                'NTP clock synchronization forces past terms to roll backward.',
                'Gossip protocol broadcasts checksums every millisecond.'
              ],
              correctAnswerIndex: 1,
              rubric: 'The Election Safety invariant ensures that a newly elected leader already contains all committed entries from all prior terms, preventing overwriting of committed state.'
            }
          ]
        }
      ],
      rubricSolution: {
        stage1Review: 'Quorum requires (N/2)+1 = 3 nodes out of 5. Tolerates 2 failures. Group commit / fsync batching is mandatory for high IOPS workloads.',
        stage2Review: 'Leader leases eliminate read round-trips. 2PC over Raft bridges atomic transactions and high availability. LSM sequentializes random writes.',
        stage3Review: 'Majority quorums prevent dual-primary split brain. Raft election restriction guarantees committed log entries are never lost.'
      }
    },

    // =========================================================================
    // EXAM 3: Production SRE Readiness
    // =========================================================================
    {
      id: 'production-sre-readiness',
      title: 'Production SRE Readiness & Incident Management',
      subtitle: 'SLO/SLI Engineering, Error Budgeting, Circuit Breakers, and Cascading Meltdown Prevention',
      difficulty: 'Advanced',
      category: 'Reliability & Operations',
      durationMinutes: 45,
      totalPoints: 100,
      passingScorePercent: 80,
      passingScore: 80,
      trackId: 'track-5',
      scenario: 'You are the Lead Site Reliability Engineer for a Tier-0 Payment Processing Platform processing $2 Billion daily across 35 downstream merchant acquiring banks. You must define SLIs/SLOs, calculate error budgets, configure active traffic shedding, and mitigate an ongoing cascading retry storm.',
      stages: [
        {
          id: 'stage-1',
          number: 1,
          title: 'Stage 1: SLO & Error Budget Mathematics',
          points: 30,
          type: 'capacity',
          instructions: 'Compute the availability and error budget parameters for a 99.99% ("four nines") monthly availability SLO over a 30-day billing cycle (43,200 total minutes).',
          inputs: [
            {
              id: 'downtime-allowed-minutes',
              label: 'Maximum Allowed Total Downtime per 30-day Month (minutes)',
              unit: 'minutes',
              expectedValue: 4.32,
              tolerancePercent: 5,
              explanation: 'Total minutes = 30 * 24 * 60 = 43,200. Error budget = 100% - 99.99% = 0.01% = 0.0001. Allowed downtime = 43,200 * 0.0001 = 4.32 minutes (approx 259 seconds).'
            },
            {
              id: 'failed-requests-budget',
              label: 'Allowed Failed Requests Budget out of 100,000,000 monthly transactions',
              unit: 'requests',
              expectedValue: 10000,
              tolerancePercent: 0,
              explanation: '100,000,000 * 0.0001 (0.01%) = 10,000 failed requests.'
            },
            {
              id: 'burn-rate-1hr',
              label: '1-Hour Burn Rate multiplier if 2% of the monthly error budget is consumed in 1 hour',
              unit: 'x',
              expectedValue: 14.4,
              tolerancePercent: 8,
              explanation: '1 month = 720 hours. 1 hour is 1/720 ≈ 0.1388% of the month. Consuming 2% in 1 hour is 2% / 0.1388% ≈ 14.4x burn rate.'
            }
          ]
        },
        {
          id: 'stage-2',
          number: 2,
          title: 'Stage 2: Circuit Breakers & Resilience Patterns',
          points: 40,
          type: 'architecture',
          instructions: 'Design graceful degradation, backpressure, and load-shedding mechanisms for mission-critical services.',
          questions: [
            {
              id: 'circuit-breaker-state-transitions',
              title: 'Circuit Breaker State Machine & Transition Rules',
              prompt: 'A downstream credit card gateway begins timing out on 40% of requests. How should the Circuit Breaker transition from CLOSED to OPEN and back to CLOSED?',
              options: [
                'Immediately terminate the application container when error rate hits 10%.',
                'CLOSED state monitors failure rate. When threshold (e.g. 25% errors over 10s) is exceeded, trip to OPEN (fail-fast without calling downstream). After a sleep window (e.g. 15s), enter HALF-OPEN allowing limited canary probe requests. If canaries succeed, return to CLOSED.',
                'Switch permanently to OPEN and require manual developer CLI intervention to reset.',
                'Queue all failing requests indefinitely in local memory until the gateway recovers.'
              ],
              correctAnswerIndex: 1,
              rubric: 'The canonical Martin Fowler Circuit Breaker state machine (Closed -> Open -> Half-Open -> Closed) protects downstreams from being smothered while automatically self-healing when recovery occurs.'
            },
            {
              id: 'retry-jitter-strategy',
              title: 'Retry Storm Mitigation Strategy',
              prompt: '10,000 concurrent client apps experience a network blip and retry immediately every 500ms. Server CPU spikes to 100% and crashes. Which algorithm stops the synchronized pulse of retries?',
              options: [
                'Fixed interval retries with larger timeout (10,000ms).',
                'Exponential Backoff with Full Jitter: Sleep = Random(0, Min(MaxBackoff, Base * 2^attempt)).',
                'Round-robin retry to alternative IP addresses without delays.',
                'Linear backoff without randomness.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Adding full jitter disperses the synchronized arrival spikes of retries evenly across time, converting destructive retry resonance pulses into a smooth Poisson arrival distribution.'
            },
            {
              id: 'priority-load-shedding',
              title: 'Adaptive Load Shedding Under Resource Exhaustion',
              prompt: 'When server CPU exceeds 95% and request queues build up, which load shedding mechanism preserves core business invariants?',
              options: [
                'Drop all new connections randomly regardless of user type or transaction.',
                'CoDel (Controlled Delay) or adaptive concurrency limits (e.g. Netflix concurrency-limits) prioritizing critical Tier-0 requests (Payment Settlement) while immediately rejecting lower-priority Tier-2 traffic (Analytics, Profile Views) with HTTP 429 / 503.',
                'Buffer all incoming connections in the Linux OS TCP SYN backlog queue.',
                'Restart the load balancer.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Adaptive concurrency limits measure queue latency at the edge and shed non-essential traffic early with explicit HTTP 429/503 headers, preventing latency collapse on high-priority transactional paths.'
            },
            {
              id: 'idempotency-key-pattern',
              title: 'Guaranteeing Exactly-Once Payment Execution at the Edge',
              prompt: 'A client clicks "Pay $500" twice due to a network timeout on the first attempt. How does the payment API ensure the card is charged exactly once?',
              options: [
                'Reject all requests from the same user within 60 seconds.',
                'Require a client-generated unique Idempotency-Key header stored atomically in Redis or DB with transaction status; if a duplicate key arrives, return the in-flight or completed result without re-executing the charge.',
                'Rely on the client browser JavaScript to disable the submit button.',
                'Generate an autoincrement ID in PostgreSQL.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Idempotency keys persisted with atomic compare-and-set semantics in the database guarantee safe retries across distributed network boundaries.'
            }
          ]
        },
        {
          id: 'stage-3',
          number: 3,
          title: 'Stage 3: Disaster Recovery & Post-Mortem Remediation',
          points: 30,
          type: 'failure-modes',
          instructions: 'Conduct RCA (Root Cause Analysis) on a real-world payment outage.',
          questions: [
            {
              id: 'cascading-database-connection-pool-starvation',
              title: 'Diagnosis of Cascading Connection Pool Depletion',
              prompt: 'During an incident, a slow SQL query taking 8 seconds (missing index on audit_logs) causes all 200 HTTP worker threads in the payment service to freeze. What is the structural fix?',
              options: [
                'Increase PostgreSQL max_connections from 500 to 50,000.',
                'Separate connection pools for transactional vs non-critical reporting queries, enforce strict query timeouts (e.g. statement_timeout=500ms), and execute audit logging asynchronously via transactional outbox + Kafka.',
                'Turn off database logging.',
                'Run VACUUM FULL during peak production hours.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Bulkheading connection pools and offloading non-critical mutations to asynchronous queues isolates core transaction latency from secondary reporting queries.'
            },
            {
              id: 'blameless-postmortem-standards',
              title: 'Blameless Post-Mortem Best Practice',
              prompt: 'An engineer accidentally ran a DROP TABLE command on a staging DB that had production routing rules. What is the true SRE remediation according to Google SRE guidelines?',
              options: [
                'Revoke all shell access for the engineer and mandate manager sign-off for all terminal commands.',
                'Implement defense-in-depth: separate AWS IAM credentials between staging and prod, enforce role-based access control (RBAC), require multi-party approval on destructive DDL, and automate point-in-time recovery (PITR).',
                'Write an incident report focusing on human error as root cause.',
                'Send a warning email to engineering staff.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Blameless culture assumes humans make mistakes in complex systems; systemic safety guards (IAM boundary separation, RBAC, automated guardrails) are the only durable remediation.'
            }
          ]
        }
      ],
      rubricSolution: {
        stage1Review: 'Four nines (99.99%) permits only 4.32 minutes of downtime/month. Multi-window multi-burn-rate alerts (e.g. 14.4x for 1 hour) prevent burning out on transient spikes while catching rapid budget loss.',
        stage2Review: 'Full jitter exponential backoff breaks resonance. Circuit breakers protect downstreams. Idempotency keys prevent duplicate monetary charges.',
        stage3Review: 'Connection pool bulkheading isolates critical paths. Blameless postmortems fix systemic platform gaps rather than assigning individual human blame.'
      }
    },

    // =========================================================================
    // EXAM 4: High-Scale Streaming & Real-Time
    // =========================================================================
    {
      id: 'high-scale-streaming-realtime',
      title: 'High-Scale Streaming & Real-Time Processing',
      subtitle: 'Kafka Partitioning, Stream Aggregations, Watermarking, and Exactly-Once Semantics',
      difficulty: 'Expert',
      category: 'Data Streaming & Real-Time',
      durationMinutes: 50,
      totalPoints: 100,
      passingScorePercent: 80,
      passingScore: 80,
      trackId: 'track-4',
      scenario: 'You are architecting an IoT and financial tick data stream ingestion engine handling 10,000,000 events/second. You must determine Kafka partition capacity, consumer group parallelism, stream-table dualities, sliding window watermarks, and stateful RocksDB checkpointing.',
      stages: [
        {
          id: 'stage-1',
          number: 1,
          title: 'Stage 1: Ingestion Bandwidth & Partition Sizing',
          points: 30,
          type: 'capacity',
          instructions: 'Compute streaming infrastructure sizing for: 10,000,000 events/sec, average payload size = 500 bytes. Kafka broker write limit = 25 MB/sec per partition.',
          inputs: [
            {
              id: 'ingestion-bandwidth-gb-sec',
              label: 'Total Ingress Throughput Bandwidth (GB/sec)',
              unit: 'GB/sec',
              expectedValue: 5.0,
              tolerancePercent: 5,
              explanation: '10,000,000 events/s * 500 bytes = 5,000,000,000 bytes/sec = 5.0 GB/sec (or 4.65 GiB/sec; acceptable: 4.6 - 5.1 GB/sec).'
            },
            {
              id: 'min-partitions-needed',
              label: 'Minimum Number of Kafka Partitions needed (at 25 MB/sec per partition capacity)',
              unit: 'partitions',
              expectedValue: 200,
              tolerancePercent: 5,
              explanation: '5,000 MB/sec / 25 MB/sec = 200 partitions.'
            },
            {
              id: 'daily-event-storage-tb',
              label: 'Daily Uncompressed Event Storage Volume (TB/day, before replication)',
              unit: 'TB/day',
              expectedValue: 432,
              tolerancePercent: 6,
              explanation: '5 GB/sec * 86,400s = 432,000 GB = 432 TB/day.'
            }
          ]
        },
        {
          id: 'stage-2',
          number: 2,
          title: 'Stage 2: Stream Processing & Partitioning Topology',
          points: 40,
          type: 'architecture',
          instructions: 'Select optimal stream processing patterns for Apache Flink / Kafka Streams / Spark Streaming.',
          questions: [
            {
              id: 'partition-key-skew',
              title: 'Hot Partition & Skewed Partition Key Mitigation',
              prompt: 'Events are keyed by DeviceID. One mega-device generates 30% of all events, overloading partition 7 and causing consumer lag. How do you resolve this?',
              options: [
                'Increase Kafka retention time on all brokers.',
                'Key salting: append a random suffix between 1 and K (e.g. DeviceID + "_" + Random(1..10)) for heavy keys during ingestion, followed by a two-stage aggregation (partial aggregate per salted key, then final roll-up by DeviceID).',
                'Disable partitioning and send all messages with null keys.',
                'Deploy 100 new consumer instances for partition 7.'
              ],
              correctAnswerIndex: 1,
              rubric: 'A single Kafka partition cannot be consumed by more than one consumer in the same group. Salting hot keys spreads the load across K partitions, allowing parallel partial aggregation before global merge.'
            },
            {
              id: 'out-of-order-watermarks',
              title: 'Handling Out-of-Order Events in Windowed Aggregations',
              prompt: 'Mobile sensor data arrives with up to 45 seconds of network transmission jitter. How should a 5-minute tumbling window aggregation in Apache Flink handle late events without losing accuracy?',
              options: [
                'Process strictly by processing-time (wall-clock time of the Flink task manager).',
                'Use event-time semantics with bounded-out-of-orderness watermarks (e.g. Watermark = MaxEventTimestamp - 45s), routing ultra-late events arriving after watermark expiration to a Dead Letter Queue / Side Output for reconciliation.',
                'Buffer all incoming data in memory for 2 hours before beginning the window.',
                'Discard any event that arrives out of chronological sequence.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Event-time watermarking ensures calculations reflect when data occurred rather than when it arrived; side outputs capture residual late arrivals without holding open state indefinitely.'
            },
            {
              id: 'exactly-once-semantics-flink',
              title: 'Achieving End-to-End Exactly-Once Processing',
              prompt: 'How does an end-to-end streaming pipeline from Kafka -> Flink -> Database guarantee that no events are double-counted or lost during worker node crashes?',
              options: [
                'By relying on TCP delivery guarantees.',
                'Chandy-Lamport distributed state checkpointing in Flink combined with Kafka transactional producer and two-phase commit (2PC) sink connector to the target storage.',
                'At-least-once processing with random sleep timers.',
                'Writing all stream events to disk files first.'
              ],
              correctAnswerIndex: 1,
              rubric: 'End-to-end exactly-once requires coordinated snapshots (Chandy-Lamport checkpointing) paired with two-phase commit sinks that commit database transactions in lockstep with checkpoint completion.'
            },
            {
              id: 'stream-table-duality',
              title: 'Stream-Table Duality (KStream vs KTable)',
              prompt: 'In Kafka Streams / event-driven architectures, what represents the fundamental relationship between an event stream and a table?',
              options: [
                'Streams and tables are incompatible models that cannot interact.',
                'Stream-Table Duality: A stream represents a changelog (INSERT/UPDATE/DELETE events over time), while a table represents the current state (snapshot at a point in time). Replaying a stream builds a table; capturing table mutations produces a stream.',
                'A stream is only for ephemeral logs, while tables are only for relational databases.',
                'Tables are always slower than streams.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Stream-table duality is the foundational theorem of event-driven design: streams record history, tables record state, and each can be derived from the other.'
            }
          ]
        },
        {
          id: 'stage-3',
          number: 3,
          title: 'Stage 3: Consumer Group Rebalance & Lag Meltdown',
          points: 30,
          type: 'failure-modes',
          instructions: 'Diagnose and remediate consumer group rebalance storms.',
          questions: [
            {
              id: 'stop-the-world-rebalance-storm',
              title: 'Kafka Consumer Group Rebalance Storm',
              prompt: 'A microservice consumer processing heavy image tasks takes 35 seconds per batch. The Kafka consumer setting max.poll.interval.ms is 30,000ms. The consumer is repeatedly kicked from the group, triggering continuous rebalances across the entire cluster. What is the fix?',
              options: [
                'Increase max.poll.records to 10,000.',
                'Increase max.poll.interval.ms to exceed peak batch processing time (e.g. 60,000ms) or decouple message polling from processing using an internal thread pool / worker queue, and use Cooperative Sticky Assignor to eliminate stop-the-world rebalance pauses.',
                'Reduce the number of Kafka brokers.',
                'Restart Kafka Zookeeper / KRaft controllers.'
              ],
              correctAnswerIndex: 1,
              rubric: 'If processing exceeds max.poll.interval.ms, the coordinator assumes the consumer died. Tuning poll intervals, offloading work to worker pools, and using incremental cooperative rebalances prevents cluster-wide paralysis.'
            },
            {
              id: 'backpressure-rocksdb-checkpoint-stall',
              title: 'Stateful Checkpoint Disk I/O Starvation',
              prompt: 'Flink RocksDB state backend freezes periodically for 90 seconds while uploading multi-gigabyte checkpoints to S3, causing upstream Kafka consumer lag to spiral. How do you resolve this?',
              options: [
                'Disable checkpointing completely.',
                'Enable Incremental Checkpoints in RocksDB (uploading only modified SST files) with asynchronous snapshotting and local recovery caching on local NVMe SSDs.',
                'Switch back to in-memory state backend with no disk storage.',
                'Add 500 new Kafka partitions.'
              ],
              correctAnswerIndex: 1,
              rubric: 'Incremental checkpoints only transfer newly compacted SST files to remote storage rather than uploading full state snapshots, reducing checkpoint duration from minutes to seconds.'
            }
          ]
        }
      ],
      rubricSolution: {
        stage1Review: '10M events/s * 500 bytes = 5 GB/s. At 25 MB/s per partition, minimum 200 partitions are required. Daily volume is 432 TB.',
        stage2Review: 'Key salting prevents single-partition bottlenecks. Watermarking handles out-of-order data. Chandy-Lamport + 2PC enables end-to-end exactly-once.',
        stage3Review: 'Cooperative sticky assignors and tuned poll intervals eliminate rebalance loops. Incremental RocksDB snapshots prevent checkpoint latency spikes.'
      }
    }
  ];

  if (root && typeof root === 'object') {
    root.EXAMS_DATA = EXAMS_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EXAMS_DATA;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
