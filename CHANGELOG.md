# Changelog

All notable changes to this project will be documented in this file.

---

## [2.0.0] - 2026-10-03

### Changed
- **Curriculum v2 Architecture:** Restructured the educational syllabus around conceptual prerequisites, failure modeling, and production engineering, organizing content into 6 Core Engineering Tracks.
- **Dependency-Driven Learning Path:** Sequenced units according to logical dependencies (single-node mechanics $\to$ storage internals $\to$ distributed consensus $\to$ async & streaming $\to$ production hardening $\to$ architecture labs).
- **Expanded Production Engineering Coverage:** Enhanced focus on security threat modeling, multi-tenancy, zero-downtime database migrations, and disaster recovery.
- **Authoritative Provenance & Sources:** Published an exhaustive academic and RFC bibliography (`SOURCES.md`), learning philosophy (`docs/learning-philosophy.md`), and editorial sourcing policy (`docs/editorial-policy.md`).
- **Community Governance:** Added issue templates for reporting technical errors and provenance questions (`.github/ISSUE_TEMPLATE/`), and updated contribution guidelines.
- **Progress Tracking Migration:** Updated local storage progress tracking engine (`js/progress.js`) to support dynamic unit counts and backward-compatible state persistence.
