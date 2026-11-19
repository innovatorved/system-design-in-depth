# Product Specification — System Design In Depth

- **Product Key:** `data-product="system-design"`
- **Canonical URL:** `https://system-design-in-depth.vedgupta.in`
- **Repository:** `https://github.com/innovatorved/system-design-in-depth`
- **License:** MIT (code, simulators, tooling) · CC BY 4.0 (curriculum prose, diagrams, exercises)

## Visual Identity (Shared In-Depth Design System)

- **Canvas:** Warm Neutral Paper (`#F7F7F5` light default) · Neutral Charcoal (`#0F0F10` dark — never `#000000`)
- **Product Accent (Distributed Teal):**
  - Light mode: `--accent: #0D9488`, `--accent-hover: #0F766E`, `--accent-text: #0F766E`, `--accent-subtle: rgba(13, 148, 136, 0.08)`, `--accent-border: rgba(13, 148, 136, 0.28)`
  - Dark mode: `--accent: #2DD4BF`, `--accent-hover: #5EEAD4`, `--accent-text: #5EEAD4`, `--accent-subtle: rgba(45, 212, 191, 0.12)`, `--accent-border: rgba(45, 212, 191, 0.30)`
- **Typography:** Self-hosted `Geist` (`fonts/geist-latin.woff2`) + `Geist Mono` (`fonts/geist-mono-latin.woff2`) with tabular numerals on capacity metrics, latency tables, and quorum counters.

## Core Surfaces

1. **Split-Hero Landing (`/`)** — Left editorial pitch + primary CTAs; right interactive **Capacity & Architecture Envelope Workbench** computing Peak QPS, Cache RAM, Egress Bandwidth, and Shard Count across real workload profiles.
2. **3-Pane Curriculum Reader (`/topic/<slug>/`)** — 6 tracks, 18 modules, 200 units with `.ds-lesson-hero`, sticky right `"On this page"` TOC (`.ds-lesson-shell--with-toc`), collapsible external lecture reference (`<details class="ds-external-lecture">`), audio narration, 32 interactive visual simulators, and a unified 5-slide Check Yourself drawer (Concept MCQs + Napkin Math + Staff Trade-Off Matrix).
3. **20 From-Scratch Build Labs (`/build/<id>/`)** — Browser-native Node.js v22, Bun v1.1, and C++20 WebAssembly labs powered by `@innovatorved/code-lab` `v0.7.0`.
4. **Ecosystem Hubs** — Visual Prerequisite DAG (`/roadmap/`), 12 Production Incident War-Rooms (`/challenges/`), Architecture Whiteboard & Capacity Sandbox (`/sandbox/`), Spaced-Repetition Study Hub & 1ns=1s Latency Toolkit (`/dashboard/`), and Glossary (`/glossary/`).
