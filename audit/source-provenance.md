# Curriculum Source Provenance Record

**Date:** 3 October 2026  
**Project:** System Design in Depth (`system-design-in-depth`)  

---

## 1. Provenance Classification Methodology

Every educational and technical asset in the repository is evaluated under four provenance categories:
1. **Independent Engineering Work (`INDEPENDENT`):** Code, user interface, interactive visual simulators, test suites, algorithms, search engine, and local storage state management developed natively for this platform.
2. **Structure-Conditioned AI Generation (`STRUCTURE_CONDITIONED`):** Explanatory prose and curriculum outlines generated using AI models where the initial prompt outline mirrored Fanout's 18-module / 200-topic taxonomy.
3. **Primary-Source Verified (`PRIMARY_VERIFIED`):** Content and case studies grounded directly in public whitepapers (e.g. Amazon Dynamo 2007, Raft 2014, Google File System 2003), RFC specifications (RFC 7230, RFC 7540, RFC 6455), textbook chapters (Kleppmann, DDIA), and official company postmortems (GitLab 2017 incident, Discord ScyllaDB migration).
4. **Verbatim Derivative (`DERIVATIVE`):** Direct copying or paraphrasing of external proprietary text. *(Audit confirms 0 instances of verbatim proprietary text; similarity is confined to taxonomy, sequence, and lesson counts).*

---

## 2. Inventory Provenance Assessment

| Category | Assets Audited | Provenance Classification | Clearance / Action |
|---|---|---|---|
| **App Architecture & Shell** | `index.html`, `js/app.js`, `js/renderer.js`, `css/*` | `INDEPENDENT` | Cleared for retention |
| **Interactive Simulators** | 32 Canvas/DOM simulators (`js/simulators*.js`) | `INDEPENDENT` | Cleared for retention |
| **From-Scratch Builds** | 15 Node.js packages + tests (`implementations_code.js`) | `INDEPENDENT` | Cleared for retention |
| **Search & Progress Engine** | `js/search.js`, `js/progress.js` | `INDEPENDENT` | Cleared for retention |
| **Curriculum Taxonomy (18 mods)**| `data/curriculum.js` (outer structure) | `STRUCTURE_CONDITIONED` | **RESTRUCTURE INTO 6 TRACKS** |
| **Lesson Prose & Intuition** | 200 units across `data/content/m*.js` | `STRUCTURE_CONDITIONED` | Retain prose; re-sequence by dependencies |
| **Case Studies** | 5 case studies (Dynamo, Stripe, Discord, IG, GitLab) | `PRIMARY_VERIFIED` | Retain with educational disclaimer |
| **Question Bank** | 600 MCQs (`data/questions/q*.js`) | `STRUCTURE_CONDITIONED` | Retain; re-index to match new tracks |

---

## 3. Case Study Provenance Disclosures

All corporate architecture case studies in this curriculum are educational reconstructions based exclusively on public, primary-source engineering disclosures:
- **Amazon Dynamo:** Werner Vogels et al., *"Dynamo: Amazon's Highly Available Key-value Store"*, SOSP 2007.
- **Stripe Idempotency Keys:** Brandur Leach, *"Designing robust and predictable APIs with idempotency"*, Stripe Engineering Blog, 2017.
- **Discord Message Storage:** Bo Ingram, *"How Discord Stores Trillions of Messages"*, Discord Engineering Blog, 2023.
- **Instagram Early Architecture:** Mike Krieger, *"Sharding & Architecture at Instagram"*, Instagram Engineering Blog, 2011–2012.
- **GitLab Database Incident:** GitLab Postmortem, *"Postmortem of database outage of January 31, 2017"*, GitLab Public Postmortems.
