# System Design In Depth

An open-source interactive platform for learning system design, data architectures, and distributed systems engineering from first principles.

## Highlights

- **32 Interactive Simulators** — Real-time visual sandboxes for Raft consensus, vector clocks, quorum tuning, MVCC anomalies, and cache stampede defense.
- **15 From-Scratch Builds** — Standalone Node.js reference implementations with test suites (LSM-trees, WAL, consistent hashing, rate limiters, Bloom filters).
- **180+ Architecture Diagrams** — Clear Mermaid sequence, component, and state diagrams.
- **No Frameworks, Zero Build Step** — Pure vanilla HTML/CSS/JavaScript running statically on any server.

## Modules

1. **Foundations & Workload Modeling** — Requirements clarification, capacity planning, latency numbers, and server execution models.
2. **Data Architecture & Storage Engines** — Relational schemas, B-trees, LSM-trees, Bitcask, WAL, and partitioning keys.
3. **Distributed Systems & Consensus** — Network transports, logical clocks, replication topologies, Raft consensus, leases, and gossip protocols.
4. **Asynchronous Execution & Streaming** — Task queues, partitioned logs (Kafka internals), stream analytics, and caching tiers.
5. **Production Operations & Resilience** — Circuit breakers, distributed tracing, SLOs, zero-downtime migrations, and disaster recovery.
6. **Systems Design Labs** — End-to-end service designs, interactive product systems, and postmortem incident analyses.

## Documentation & Governance

- [Curriculum Dependency Graph](docs/curriculum-dependency-graph.md)
- [Primary Source Bibliography](SOURCES.md)
- [Learning Philosophy](docs/learning-philosophy.md)
- [Editorial Policy](docs/editorial-policy.md)
- [Third-Party Notices](THIRD_PARTY_NOTICES.md)

## License

[MIT](LICENSE) © 2024–2026 [Ved Gupta](https://vedgupta.in)
