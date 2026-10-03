# Assets Cleared for Retention

**Date:** 3 October 2026  
**Auditor:** Remediation Implementation Agent

The following technical and educational assets have been verified as original, independently created, or legally compliant educational commentary, and are cleared for retention:

---

## 1. Application Shell & System Infrastructure
- **Single Page Application Engine:** `index.html`, `js/app.js`, `js/renderer.js`, `js/landing.js`, `js/lazy.js`.
- **CSS Design System:** `css/variables.css`, `css/layout.css`, `css/components.css`, `css/content.css`, `css/landing.css`.
- **Progress & Local State Engine:** `js/progress.js` (with v2 migration).
- **Search System:** `js/search.js` (in-memory inverted index & fuzzy match).
- **Asset Pipeline:** `tools/stamp-assets.js` and `tools/validate.js`.

---

## 2. Interactive Engineering Simulators (All 32 Retained)
All 32 canvas and DOM simulators in `js/simulators*.js` represent original JavaScript engineering:
- Distributed: `RaftElection`, `QuorumTuner`, `VectorClockSim`, `GossipSim`.
- Data: `MVCCTimeline`, `WALCrashRecovery`, `LSMCompaction`, `BTreeInsert`, `BloomFilterSim`.
- Advanced: `TokenBucket`, `CircuitBreakerSim`, `RetryBackoff`, `TaskQueueSim`, `PartitionRebalance`, `EventSourcingSim`, `BM25`, `CRDTMerge`, `LittlesLaw`.
- Ops: `SLOBurnRate`, `CanaryDeploy`, `BackupRestore`, `IncidentTimeline`, `LoadShed`, `SnowflakeLayout`.
- Base & Extra: `ServerConcurrency`, `ScalingModel`, `ConsistentHashRing`, `CacheStampede`, `GeohashExplorer`, `CDNRoutingSim`, `ABRSim`, `HLLSim`, `CountMinSim`, `FeedFanout`, `TDigestSim`.

---

## 3. Algorithmic From-Scratch Builds (All 15 Retained)
All 15 zero-dependency Node.js reference implementations with test suites in `data/implementations_code.js`:
1. `load-balancer-from-scratch`
2. `consistent-hashing-ring`
3. `sliding-window-rate-limiter`
4. `lru-cache`
5. `ttl-cache-reaper`
6. `bloom-filter-membership`
7. `snowflake-id-generator`
8. `keyset-pagination-cursors`
9. `write-ahead-log`
10. `lsm-tree-kv-store`
11. `lease-leader-election`
12. `gossip-protocol`
13. `merkle-anti-entropy`
14. `hyperloglog-cardinality`
15. `tiny-search-engine`

---

## 4. Lesson Technical Prose, Diagrams & Quizzes
- All 200 lesson prose explanations, intuition-first primers, and key takeaways across `data/content/m*.js`.
- All 182 original Mermaid diagrams.
- All 600 assessment questions in `data/questions/q*.js`.
- All 75 glossary terms in `data/glossary.js`.
- All 6 featured portfolio projects in `data/projects.js`.
