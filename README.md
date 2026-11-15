# System Design In Depth

An open-source, interactive curriculum for learning system design, storage engines, and distributed systems engineering from first principles — running statically in the browser with zero servers, zero signups, and zero build bundlers.

**Live site:** [https://system-design-in-depth.vedgupta.in](https://system-design-in-depth.vedgupta.in)  
**License:** [MIT](LICENSE) (code, simulators, labs & tooling) · [CC BY 4.0](LICENSE) (curriculum prose, diagrams & exercises)

---

## Why This Exists

System design resources often fall into two extremes: surface-level interview templates ("put Redis in front of Postgres, add Kafka") or dense primary papers scattered across conference proceedings.

**System Design In Depth** connects those two worlds. Every unit starts from system invariants and hardware constraints, pairs prose and 200 architecture diagrams with 469 curated YouTube videos and audio narration, and lets you test your mental model directly in 32 interactive visual simulators, 12 production incident war-rooms, and 20 browser-native from-scratch builds.

- **Static & dependency-free shell** — Plain HTML, CSS, and vanilla JavaScript. Serve the repo folder with any static file server and everything works.
- **Interactive systems labs in the browser** — Powered by [`@innovatorved/code-lab`](https://github.com/innovatorved/code-lab) (`v0.6.1`, [live Cloud IDE](https://code-lab.vedgupta.in/)), giving every `/build/<slug>/` lab and incident hotfix a local Web Worker runtime (Node.js v22, Bun v1.1, C++20 Clang/WASI, and POSIX shell).
- **Permissively open source** — Code under MIT, educational content under CC BY 4.0. No accounts, telemetry walls, or paywalls.

---

## What's Inside

| Surface | Scope |
|---|---|
| **Curriculum (`/topic/<slug>/`)** | **6 tracks · 18 modules · 200 units** with intuition primers, 200 architecture diagrams, 469 curated YouTube videos, precomputed MP3 narration, and 1,000 practice questions (Concept MCQs, Napkin Math, and Staff Trade-Off Matrices). |
| **Visual Simulators** | **32 interactive sandboxes** covering Raft elections, `(N, R, W)` quorums, LSM vs B-Tree amplification, MVCC snapshot isolation, XFetch cache stampedes, consistent hashing rings, circuit breakers, and SLO burn rates. |
| **From-Scratch Builds (`/build/<id>/`)** | **20 guided implementations** in JavaScript, TypeScript, and C++20 — including an L7 Load Balancer, Raft Consensus, LSM-Tree KV Store, Write-Ahead Log, Mini-Kafka Log, Outbox CDC Relay, Singleflight Coalescer, and SWIM Gossip. |
| **Incident Challenges (`/challenges/`)** | **12 SEV-1 production outages** where you inspect telemetry, tune live system knobs to restore SLOs, and verify a code-level hotfix in CodeLab. |
| **Architecture Sandbox (`/sandbox/`)** | Multi-tab topology whiteboard with **10 reference blueprints**, live read/write QPS & storage envelope math, and automated Architecture Rubric Audits. |
| **Roadmap & Study Hub (`/roadmap/`, `/dashboard/`)** | **34-node prerequisite DAG**, **5 role learning paths**, SM-2 spaced-repetition flashcards, local notes, and a `1 ns = 1 s` humanized latency & capacity toolkit. |

---

## Curriculum Tracks (6 Tracks · 18 Modules · 200 Units)

1. **Architectural Foundations & Workload Modeling (13 units)** — Requirements clarification, invariants, back-of-the-envelope capacity planning, event loops vs thread pools, and monolith boundaries.
2. **Data Architecture, Storage Engines & State Persistence (47 units)** — B-Trees, LSM-Trees, Bitcask, WAL & ARIES crash recovery, MVCC isolation anomalies, sharding, consistent hashing, Snowflake IDs, and S3-style blob storage.
3. **Distributed Systems, Consensus & Coordination (26 units)** — TCP/UDP/gRPC, physical & logical clocks, replication, CAP & PACELC, Raft consensus, leases, fencing tokens, and SWIM gossip.
4. **Asynchronous Execution, Queues & Real-Time Processing (39 units)** — Caching tiers, XFetch stampede defense, task queues, partitioned logs (Kafka internals), HyperLogLog, Count-Min Sketch, t-digest, and WebSockets/SSE.
5. **Production Operations, Resilience & System Hardening (49 units)** — Circuit breakers, load shedding, retry storms, SLO error budgets, zero-downtime migrations, geospatial indexing (Geohash/H3/S2), and BM25/vector search.
6. **Systems Design Labs & Architectural Evolution (26 units)** — End-to-end service architectures and reconstructions of public postmortems (Amazon Dynamo, Discord, Stripe, Instagram, GitLab).

---

## Running Locally

No build step is required to browse and work on the platform:

```bash
git clone https://github.com/innovatorved/system-design-in-depth.git
cd system-design-in-depth
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Maintainer & Contributor Scripts

Node.js 20+ is used only for content validation, static pre-rendering, asset cache-busting, and tests:

```bash
# Validate curriculum schema, links, question bank, and asset stamps
npm test

# Re-stamp content hashes (?v=<sha1>) and manifest.js
npm run stamp

# Pre-render all static HTML pages (200 topics, 20 builds, hubs & challenges) + sitemap.xml
npm run prerender

# Assemble clean production directory in dist/
npm run build

# Run full E2E browser & adversarial test suite
npm run e2e
```

---

## Companion Projects in the In-Depth Series

- **[SQL In Depth](https://sql-in-depth.vedgupta.in)** ([GitHub](https://github.com/innovatorved/sql-in-depth)) — Relational algebra, PostgreSQL & SQLite execution engines, MVCC, indexing, and clause-by-clause visualizers.
- **[DSA In Depth](https://dsa-in-depth.vedgupta.in)** ([GitHub](https://github.com/innovatorved/dsa-in-depth)) — Data structures, graph & dynamic programming visualizers, and multi-language algorithmic labs.
- **[`@innovatorved/code-lab`](https://code-lab.vedgupta.in/)** ([GitHub](https://github.com/innovatorved/code-lab)) — The standalone browser IDE, POSIX shell, and WebAssembly runtime powering the build labs.

---

## Documentation & Governance

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — Zero-framework routing, static pre-rendering pipeline, lazy data loading, and CSS design tokens.
- [`DESIGN.md`](DESIGN.md) & [`PRODUCT.md`](PRODUCT.md) — Shared In-Depth design system specification and Distributed Teal palette tokens.
- [`SOURCES.md`](SOURCES.md) — Primary research papers, RFCs, textbooks, and postmortems cited across units.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — How to report issues, edit lessons or simulators, and verify static builds.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) & [`SECURITY.md`](SECURITY.md) — Community standards and vulnerability disclosure.
- [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) — Open-source attributions.

---

## License

- **Code, Simulators, Build Labs & Tooling:** [MIT License](LICENSE) © 2024–2026 [Ved Gupta](https://vedgupta.in).
- **Curriculum Prose, Diagrams & Educational Content:** [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE) © 2024–2026 [Ved Gupta](https://vedgupta.in).
