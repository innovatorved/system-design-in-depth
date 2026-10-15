# E2E Test Infra: System Design Asset Stamping & Code-Lab Standalone UI

## Test Philosophy
- Opaque-box, requirement-driven. Derives strictly from `ORIGINAL_REQUEST.md` and user-facing acceptance criteria without reliance on internal code implementation details.
- Methodology: 4-tier systematic verification (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial Testing, and Real-World Workload Testing).

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Comprehensive HTML Asset Stamping (all 15 build index.html files stamped) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Static Generation Pipeline Consistency (stamp -> generate -> validate sync) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Validation Harness (node tools/stamp-assets.js --check and validate.js pass 0/0) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Standalone Sample UI Artifact (dist/sample.html self-contained styles/workbench) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | Package Exports & Files Integrity (package.json files and exports expose sample) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | Full Viewport & Offline Fallback Editor (no black screen, resilient fallback) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | Code-Lab Test Suite (bun run test:all 100% pass) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | Headless SPA Build-Switching Navigation (0 legacy tab switcher markup on switch) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 9 | Cloudflare Pages Deployment Sync (both repos build and deploy to Pages targets) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- E2E Test Suite Runner: Run via node / bun test scripts in both repositories.
- Headless Browser Verification: Puppeteer automated test script verifying live DOM states during SPA navigation across build pages.
- Validation Harness: `node tools/validate.js` and `node tools/stamp-assets.js --check` in `system-design`.
- Unit/Integration Suites: `bun run test:all` in `code-lab`.
- Pass/Fail Semantics: Exit code 0 for success, non-zero for failure; 0 errors and 0 warnings required on all validators.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | End-to-end user navigation across 3 distinct build labs in SPA mode without legacy tabs | F1, F2, F8 | High |
| 2 | Downstream integrator opening `dist/sample.html` in offline/airgapped browser | F4, F5, F6 | High |
| 3 | Full cold-start static generation followed by validation check in CI pipeline | F1, F2, F3 | Medium |
| 4 | Terminal mock execution and virtual HTTP loopback in standalone sample UI | F4, F6, F7 | High |
| 5 | Production Cloudflare Pages build assembly and dry-run deployment inspection | F9, F1, F5 | High |

## Coverage Thresholds
- Tier 1: Feature Coverage (≥5 per feature)
- Tier 2: Boundary & Corner Cases (≥5 per feature)
- Tier 3: Pairwise Cross-Feature Interactions
- Tier 4: Real-World User Workloads (≥5 application-level scenarios)
