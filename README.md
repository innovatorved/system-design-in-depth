# System Design In Depth

<p align="center">
  <strong>An open-source interactive platform for learning system design, data architectures, and distributed systems engineering from first principles.</strong>
</p>

<p align="center">
  <a href="https://system-design-in-depth.vedgupta.in"><img src="https://img.shields.io/badge/Live%20Site-system--design--in--depth.vedgupta.in-10b981?style=flat-square&logo=cloudflare&logoColor=white" alt="Live Site"></a>
  <a href="https://github.com/innovatorved/system-design-in-depth/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/CI-passing-brightgreen?style=flat-square&logo=github-actions&logoColor=white" alt="Build Status"></a>
  <a href="LICENSE#mit-license"><img src="https://img.shields.io/badge/Code%20License-MIT-blue.svg?style=flat-square" alt="Code License: MIT"></a>
  <a href="LICENSE#creative-commons-attribution-noncommercial-sharealike-40-international"><img src="https://img.shields.io/badge/Content%20License-CC%20BY--NC--SA%204.0-lightgrey.svg?style=flat-square" alt="Content License: CC BY-NC-SA 4.0"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tracks-6-8b5cf6?style=flat-square" alt="6 Tracks">
  <img src="https://img.shields.io/badge/Units-200-3b82f6?style=flat-square" alt="200 Units">
  <img src="https://img.shields.io/badge/Simulators-32-059669?style=flat-square" alt="32 Simulators">
  <img src="https://img.shields.io/badge/From--Scratch%20Builds-15-f59e0b?style=flat-square" alt="15 From-Scratch Builds">
  <img src="https://img.shields.io/badge/Practice%20Questions-600-ec4899?style=flat-square" alt="600 Practice Questions">
</p>

<p align="center">
  <a href="https://system-design-in-depth.vedgupta.in"><strong>🚀 Explore the Interactive Platform</strong></a>
</p>

<p align="center">
  <a href="https://system-design-in-depth.vedgupta.in">
    <img src="docs/preview.png" alt="System Design In Depth Platform Preview and Interactive Simulator Sandbox" width="900" />
  </a>
</p>

---

## Why This Exists

Most system design materials are either high-level cheat sheets for interviews or scattered vendor marketing posts. **System Design In Depth** is an intuition-first, dependency-driven engineering curriculum grounded in primary research papers, RFCs, and real-world postmortems — paired with visual sandboxes and from-scratch reference implementations that you can run and verify locally.

- **Zero frameworks, zero build step** — Pure HTML/CSS/JavaScript running statically on any browser or server.
- **Hands-on exploration** — Every abstract theorem is accompanied by a runnable visual simulator or algorithmic build.
- **Deep academic & industry grounding** — Over 180 architecture diagrams, concrete failure mode breakdowns, and primary literature citations.
- **100% Free & Open Source** — No signup, no paywall, no ads.

---

## Curriculum Overview (6 Tracks, 18 Modules, 200 Units)

The curriculum is structured into **6 core engineering tracks** following strict conceptual prerequisites:

| Track | Scope & Core Concepts | Units | Key Topics |
|---|---|:---:|---|
| **1. Architectural Foundations & Workload Modeling** | Requirements clarification, system invariants, capacity estimation, latency numbers, concurrency runtimes (event loops vs thread pools), monolith-to-microservice boundaries, and hardware economics. | 13 | Back-of-the-envelope calculations, single-core to distributed scaling, latency tiers |
| **2. Data Architecture, Storage Engines & State Persistence** | Relational schemas, indexing internals, B-trees, ACID transactions, locking, MVCC, write-ahead logging (WAL), ARIES recovery, LSM-tree compaction, Bitcask, blob object storage, and sharding keys. | 47 | B-Tree vs LSM write amplification, MVCC isolation anomalies, WAL crash recovery |
| **3. Distributed Systems, Consensus & Coordination** | Network transports (TCP, UDP, gRPC), physical and logical time, replication models, CAP and PACELC trade-offs, Raft consensus, leader election, leases, fencing tokens, and SWIM gossip membership. | 26 | Raft log replication & heartbeat dynamics, quorum (N, R, W) intersection, vector clocks |
| **4. Asynchronous Execution, Queues & Real-Time Processing** | Task queues, event-driven backbones, partitioned logs (Kafka internals), stream processing, probabilistic sketches (HyperLogLog, Count-Min, t-digest), caching tiers, eviction policies, and WebSockets. | 39 | Cache stampede prevention (XFetch), Kafka consumer group rebalancing, streaming state |
| **5. Production Operations, Resilience & System Hardening** | Failure containment, circuit breakers, load shedding, distributed tracing, SLOs and error budgets, zero-downtime database migrations, disaster recovery topologies, geospatial search, and information retrieval. | 49 | Circuit breaker state machines, SLO multi-window burn rates, HNSW embeddings, Geohashing |
| **6. Systems Design Labs & Architectural Evolution** | End-to-end service designs (URL shortener, rate limiters, collaborative editors, chat backends, search engines, video CDNs) and analysis of battle-tested architectures and postmortems (Amazon Dynamo, Discord, Stripe, GitLab). | 26 | Full architectural trade-off matrices, failure-mode trees, real-world postmortem forensics |

---

## Interactive Simulators & From-Scratch Builds

### 32 Interactive Visual Simulators
Interactive sandboxes let you tweak parameters, simulate network partitions, induce race conditions, and watch system invariants hold or fail:
- **Distributed Coordination:** Raft Leader Election, Quorum Explorer (N, R, W), Vector Clocks, Gossip Protocol Spread, CAP Theorem Trade-offs.
- **Storage & Databases:** LSM-Tree vs B-Tree, WAL Crash Recovery, MVCC Snapshot Isolation, Snowflake 64-bit ID Layout.
- **Resilience & Traffic:** Cache Stampede Defense (XFetch), Circuit Breakers, Retry Storms, SLO Burn Rate Alerts, Little's Law Queuing.
- **Algorithms & Data Structures:** Consistent Hashing Ring, Sliding Window Rate Limiter, Cache Eviction (LRU/LFU/FIFO), Bloom Filter, HyperLogLog, Count-Min Sketch, BM25 Scoring, CRDT Conflict Resolution, Geohash Explorer.

### 15 From-Scratch Reference Builds
Standalone Node.js reference implementations with comprehensive automated test suites:
1. `load-balancer-from-scratch` — Layer 7 Load Balancer
2. `consistent-hashing-ring` — Consistent Hashing Ring with Virtual Nodes
3. `sliding-window-rate-limiter` — Sliding Window Rate Limiter (Log, Counter, Token Bucket)
4. `lru-cache` — LRU Cache (Doubly Linked List + Hash Map)
5. `ttl-cache-reaper` — TTL Cache with Redis-Style Adaptive Reaper
6. `bloom-filter-membership` — Bloom Filter Membership Testing
7. `snowflake-id-generator` — Snowflake 64-bit Unique ID Generator
8. `keyset-pagination-cursors` — Keyset (Cursor) Pagination vs SQL OFFSET
9. `write-ahead-log` — Write-Ahead Log (WAL) & Crash Recovery
10. `lsm-tree-kv-store` — LSM-Tree KV Store (WAL, Memtable, SSTables, Compaction)
11. `lease-leader-election` — Lease-Based Leader Election with Fencing Tokens
12. `gossip-protocol` — Push-Pull Anti-Entropy & SWIM Failure Detection
13. `merkle-anti-entropy` — Merkle-Tree Anti-Entropy Repair (Dynamo/Cassandra style)
14. `hyperloglog-cardinality` — HyperLogLog Cardinality Sketch
15. `tiny-search-engine` — Tiny Search Engine (Inverted Index, Compression & BM25)

---

## Quick Start

This project requires **no npm install, no bundlers, and no compilation**:

```bash
# Clone the repository
git clone https://github.com/innovatorved/system-design-in-depth.git
cd system-design-in-depth

# Serve locally using any static web server
python3 -m http.server 8080
```

Open `http://localhost:8080` in any modern web browser.

---

## Validation & Testing

To run the repository validation checks locally:

```bash
# Validate curriculum structure, schemas, takeaways, and asset stamps
node tools/validate.js
```

The validation suite is continuously executed on every pull request and push to `main` via [GitHub Actions](.github/workflows/ci.yml).

---

## Documentation & Governance

- [Curriculum Dependency Graph](docs/curriculum-dependency-graph.md) — Conceptual prerequisite mapping across all tracks.
- [Primary Source Bibliography](SOURCES.md) — Comprehensive academic research papers, RFCs, and engineering citations.
- [Learning Philosophy](docs/learning-philosophy.md) — Core pedagogical principles and educational methodology.
- [Editorial Policy](docs/editorial-policy.md) — Guidelines for provenance, sourcing, and content verification.
- [Third-Party Notices](THIRD_PARTY_NOTICES.md) — Open-source software licenses and attributions.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on code style, content guidelines, running the validator, and cache-busting workflows.

---

## License

This project is dual-licensed:

- **Code, Simulators, Tests & Tooling:** Licensed under the [MIT License](LICENSE#mit-license) © 2024–2026 [Ved Gupta](https://vedgupta.in).
- **Curriculum, Lessons, Guides & Explanatory Content:** Licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](LICENSE#creative-commons-attribution-noncommercial-sharealike-40-international).
