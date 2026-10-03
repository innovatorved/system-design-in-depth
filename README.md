# System Design In Depth

An open-source interactive curriculum for learning system design, data architectures, and distributed systems engineering from first principles.

---

## Why This Exists

Most system design resources are either high-level interview summaries or scattered blog posts. This project provides a structured, dependency-driven learning path grounded in primary research papers, RFCs, and engineering postmortems — paired with interactive visual simulators and from-scratch algorithmic builds you can execute locally.

No signup. No paywall. Just open it and learn.

## Quick Start

```bash
# Serve locally (zero dependencies, vanilla JS)
python3 -m http.server 8080
```

Open `http://localhost:8080` in any modern web browser.

---

## What's Inside

- 📝 **Architectural notes & diagrams** — 180+ Mermaid sequence, architecture, and state diagrams
- 🔬 **32 interactive visual simulators** — hands-on sandboxes for Raft elections, vector clocks, quorum tuning, WAL crash recovery, MVCC isolation anomalies, cache stampede defense, and consistent hash rings
- 💻 **15 from-scratch algorithmic builds** — pure Node.js reference implementations with automated test suites (LSM-tree KV store, Raft/lease leader election, sliding window rate limiter, SWIM gossip protocol, tiny search engine, HyperLogLog, WAL, and Bloom filters)
- 🎥 **Curated video lectures** — lectures from Martin Kleppmann, MIT 6.824, CMU Database Group, and senior systems practitioners
- 🧠 **Intuition-first primers** — mental models, concrete failure modes, and architectural trade-off matrices
- 🔊 **Audio narrations** — spoken unit summaries with adjustable playback speed
- ✅ **Assessment questions** — topic review questions with detailed rationales
- 📖 **Glossary & search** — instant `⌘K` fuzzy search across all concepts and a systems glossary

---

## Curriculum Structure (v2.0)

The curriculum is organized into **6 Core Engineering Tracks** structured by conceptual prerequisites:

### Track 1 — Architectural Foundations & Workload Modeling
Requirements clarification, system invariants, capacity estimation, latency numbers, concurrency runtimes (event loops vs thread pools), monolith-to-microservice boundaries, and hardware economics.

### Track 2 — Data Architecture, Storage Engines & State Persistence
Relational schema normalization, indexing internals, B-trees, ACID transactions, locking, MVCC, write-ahead logging (WAL), ARIES recovery, LSM-tree compaction, Bitcask, blob object storage, and sharding keys.

### Track 3 — Distributed Systems, Consensus & Coordination
Network transports (TCP, UDP, gRPC), physical and logical time, replication models, CAP and PACELC trade-offs, Raft and Paxos consensus, leader election, leases, fencing tokens, and SWIM gossip membership.

### Track 4 — Asynchronous Execution, Queues & Real-Time Processing
Task queues, event-driven backbones, partitioned logs (Kafka internals), stream processing, probabilistic sketches (HyperLogLog, Count-Min, t-digest), caching tiers, eviction policies, and real-time WebSocket messaging.

### Track 5 — Production Operations, Resilience & System Hardening
Failure containment, circuit breakers, load shedding, distributed tracing, SLOs and error budgets, zero-downtime database migrations, disaster recovery topologies, multi-tenant isolation, and threat modeling.

### Track 6 — Systems Design Labs & Architectural Evolution
End-to-end design synthesis (URL shorteners, distributed rate limiters, collaborative editors, chat systems, search engines, video CDNs) and analysis of published architectures and postmortems (Amazon Dynamo, Discord message storage, Stripe idempotency, GitLab database outage).

---

## Governance & Provenance

- [Learning Philosophy](docs/learning-philosophy.md) — The pedagogical framework and core educational maxims.
- [Curriculum Dependency Graph](docs/curriculum-dependency-graph.md) — Conceptual prerequisite mapping across tracks.
- [Editorial & Sourcing Policy](docs/editorial-policy.md) — Standards for primary research citations and verification.
- [Bibliography & Sources](SOURCES.md) — Complete academic and RFC citations.
- [Third-Party Notices](THIRD_PARTY_NOTICES.md) — Open-source software licenses and notices.

---

## Tech Stack

Vanilla HTML, CSS, and modern JavaScript (ES2020). Zero runtime build dependencies, zero compilers, zero npm packages. Runs statically on Cloudflare Pages, GitHub Pages, or directly from the local filesystem.

---

## Author

**[Ved Gupta](https://vedgupta.in)** (`@innovatorved`)

---

## License

- **Software & Application Code:** [MIT License](LICENSE)
- **Case Studies & Commentary:** Educational reconstructions based on publicly available academic papers, engineering publications, and conference presentations.
