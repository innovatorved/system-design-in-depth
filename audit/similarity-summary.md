# Curriculum Similarity & Taxonomic Audit Summary

**Date:** 3 October 2026  
**Auditor:** Remediation Implementation Agent  
**Subject:** Comparative analysis between `system-design-in-depth` and Fanout's public system-design curriculum (`fanout.sh/roadmaps/system-design`)

---

## 1. Executive Findings

### 1.1 Structural Overlap (High Risk - Pre-Remediation)
Prior to remediation, the curriculum demonstrated a near-total 1:1 structural correspondence with Fanout's curriculum:
- **Part Division:** 3 Parts (`Fundamentals`, `Real-world systems`, `Case studies`).
- **Module Count:** Exactly 18 Modules.
- **Unit Count:** Exactly 200 Units (165 foundational lessons, 30 system designs, 5 engineering case studies).
- **Module Sequence:** Modules 01 through 18 followed Fanout's exact pedagogical order from `Foundations`, through `APIs`, `SQL`, `NoSQL`, `Caching`, `Distributed Coordination`, `Storage Engines`, `Streams`, `Search`, `Analytics`, `Realtime`, `Geo`, `Media`, and `Reliability`, terminating with service designs, product designs, media/operations designs, and case studies.
- **Unit Counts per Module:** The lesson count per module matched Fanout identically (13, 13, 13, 14, 6, 13, 20, 10, 17, 13, 10, 8, 11, 13, 7, 8, 6, 5).
- **Case Study Selection:** Exactly the same 5 companies and topics in identical order: Instagram Early Architecture, Stripe Idempotency Keys, Discord Trillion-Message Storage, Amazon Dynamo Paper, and GitLab Database Incident.
- **Initial Commit Evidence:** Commit `9b59485` initially contained the header comment `// Auto-generated from Fanout System Design Curriculum` in `data/curriculum.js`.

### 1.2 Textual & Code Assessment (Low Verbatim Risk)
- **Prose Content:** The technical text across lessons was generated via AI rather than copied verbatim from Fanout. The prose provides extensive, independently worded engineering walkthroughs, numerical calculations, and intuition models.
- **Visuals & Diagrams:** The 182 Mermaid diagrams were constructed independently to illustrate the concepts.
- **Simulators & Builds:** The 32 interactive visual simulators and 15 from-scratch Node.js implementations with unit tests are original engineering implementations.
- **Question Bank:** The 600 multiple-choice questions (3 per unit) were generated independently.

---

## 2. Risk Classification Breakdown

| Metric | Pre-Remediation Status | Remediation Plan |
|---|---|---|
| **Taxonomy & Grouping** | **RED** (Identical 18-module Fanout structure) | Dissolve 18 modules into **6 Functional Competency Tracks** |
| **Curriculum Counts** | **RED** (Exact 200-unit / 18-module target) | Dynamic counts determined strictly by prerequisite graph |
| **Lesson Sequencing** | **AMBER** (Follows Fanout module sequence) | Re-sequence strictly by conceptual dependency graph |
| **Prose Overlap** | **GREEN** (Independently worded AI technical prose) | Retain explanations; add formal primary citations and learning outcomes |
| **Interactive Code & Builds**| **GREEN** (Original Node.js builds and simulators) | Retain completely; add license headers and test verification |

---

## 3. Remediation Strategy

To eliminate structural and derivative copyright/reputational risks without destroying the valuable technical and interactive work:
1. **Regroup:** Discard the 18-module hierarchy in favor of 6 Learning Tracks based on systems engineering dependencies.
2. **Expand Coverage:** Introduce explicit enterprise topics (threat modeling, multi-tenancy, zero-downtime database migrations, and disaster recovery).
3. **Citations:** Link every technical claim to primary RFCs, whitepapers, textbooks, and official engineering publications.
4. **Metadata:** Provide explicit prerequisite chains and review status for each lesson.
