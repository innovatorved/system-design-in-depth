# Automated E2E Test Infrastructure & Verification Harness

## 1. Overview & Test Philosophy

The **System Design In-Depth Interactive Learning Ecosystem** test infrastructure provides opaque-box, requirement-driven automated verification across all layers of the platform:
1. **Interactive Visual Roadmap & Career Paths** (`/roadmap`)
2. **Hands-On Incident & Troubleshooting Challenges** (`/challenges`)
3. **Timed Mock Interviews & Architecture Exams** (`/exams`)
4. **Learner Dashboard, Spaced Repetition (SRS) & Notes Hub** (`/dashboard`)
5. **Interactive Architecture Whiteboard & Capacity Sandbox** (`/sandbox`)
6. **Zero-Build Static Architecture & Asset Stamping Pipeline** (`tools/stamp-assets.js`, `tools/generate-static.js`, `tools/validate.js`)

Testing follows a strict **opaque-box methodology**: tests interact with the application strictly through public interfaces, DOM interactions, URL routing, keyboard/pointer events, and persisted state contracts (`localStorage`), verifying observable behavior and invariants without coupling to private implementation details.

---

## 2. 4-Tier Test Architecture

The test suite is structured into four distinct verification tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 4: REAL-WORLD SCENARIOS                         │
│  Full lifecycle learner journeys navigating Roadmap -> Challenges ->   │
│       Dashboard -> Sandbox -> Exams with persistent state validation   │
├────────────────────────────────────────────────────────────────────────┤
│               TIER 3: CROSS-FEATURE INTERACTIONS                       │
│  Incident resolution -> XP & Streak; Exam scoring -> Progress record;  │
│  SRS SM-2 rating; Roadmap status sync; ⌘K Search navigation            │
├────────────────────────────────────────────────────────────────────────┤
│                 TIER 2: BOUNDARY & CORNER CASES                        │
│  Extreme capacity (0 to 10M QPS), empty & special character searches,  │
│  countdown timer expiration, corrupt localStorage, mobile viewports    │
├────────────────────────────────────────────────────────────────────────┤
│                  TIER 1: FEATURE COVERAGE (>=5/view)                   │
│  DOM shells, controls, canvases, cards, queues, palettes, and outputs  │
│  for Roadmap, Challenges, Exams, Dashboard, and Sandbox                │
└────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Feature Coverage (>=5 test cases per feature)
- **Roadmap (`/roadmap`)**:
  - Page shell & tab navigation (`graph`, `paths`, `modules`).
  - Interactive canvas/SVG dependency graph rendering with track color-coding.
  - Pan/zoom controls (Zoom In, Zoom Out, Reset / Fit to Screen).
  - Career & Goal Paths explorer with per-path progress bars and step breakdowns.
  - Structured Modules Explorer with difficulty badges and completion indicators.
- **Challenges (`/challenges`)**:
  - Challenge cards grid rendered across 4 difficulty tiers (Easy, Medium, Hard, Insane).
  - Search filter and difficulty pill filtering.
  - Incident room view: outage brief, symptoms, and SLA impact.
  - Real-time telemetry panels (timeseries metrics, live error rate, log snippets).
  - Interactive tuning knobs & verification runner checking recovery invariants.
- **Exams (`/exams`)**:
  - Timed mock exam cards with duration badges, XP reward, and passing thresholds.
  - Exam runner launch with live countdown timer and progress indicator.
  - Multi-stage question views: capacity calculations, architecture trade-offs, and failure modes.
  - Exam submission and objective rubric scoring.
  - Detailed step-by-step worked solutions display.
- **Dashboard (`/dashboard`)**:
  - Gamified metrics: day streak, XP balance, total study time.
  - Spaced Repetition System (SRS) review queue with card flip interaction.
  - SuperMemo SM-2 interval rating controls (Again, Hard, Good, Easy).
  - Markdown notes manager with live editor and search.
  - Bookmarks manager and one-click JSON progress export and import.
- **Sandbox (`/sandbox`)**:
  - Architecture whiteboard canvas with pan/grid surface.
  - 12 architectural building blocks palette (Clients, CDN, API Gateway, Load Balancers, Services, Redis, Kafka, Shards, Object Storage, Workers).
  - Pre-built reference blueprints loader (URL Shortener, Twitter Feed, WhatsApp Chat, Stripe Ledger).
  - Live back-of-the-envelope capacity calculator input controls (QPS, read/write ratio, payload size, replication).
  - Real-time capacity outputs: throughput (req/s), network bandwidth (MB/s), storage growth (GB/month), latency estimates, and bottleneck alerts.

### Tier 2: Boundary & Corner Cases (>=5 test cases per feature area)
- **Extreme Capacity Inputs**: 0 QPS, boundary 10,000,000 QPS, extreme payload sizes (100MB), zero/negative values handled without NaN or crashes.
- **Search Edge Cases**: Empty strings, unicode inputs, regex special characters (`.*+?^${}()|[]\\`), HTML/script injection payloads sanitized properly.
- **Timer Expiration**: Exam countdown reaching zero auto-locks or auto-submits with graceful feedback.
- **Corrupt & Missing State**: Missing, partial, or malformed `sd-progress-v2` in `localStorage` handled cleanly with schema auto-recovery.
- **Responsive Viewports**: Mobile (320x568), Tablet (768x1024), Desktop (1920x1080) ensuring no overflow or unusable controls.

### Tier 3: Cross-Feature Interactions
- Completing an incident challenge awards XP (`Progress.getXP()`) and increments streak (`Progress.getStreak()`).
- Exam submission records the score and updates `window.Progress`.
- SRS card rating recalculates SuperMemo SM-2 intervals and updates the due card queue.
- Roadmap nodes dynamically update status (`todo` -> `done`) when `window.Progress.markComplete()` is invoked.
- ⌘K Command Palette search indexes new views, challenges, and blueprints, executing instant navigation on selection.
- Theme toggler switches dark/light mode across both DOM elements and SVG/Canvas drawing surfaces.
- Full state export to JSON and subsequent import restores progress, bookmarks, and notes across all views.

### Tier 4: Real-World Learner Scenario
- Sequential multi-step user journey:
  1. Learner visits `/roadmap` and selects the "Staff/FAANG Interview Bootcamp" career path.
  2. Opens an incident troubleshooting room from `/challenges` (e.g. Cache Stampede Meltdown).
  3. Diagnoses root cause, adjusts system tuning knobs, and verifies invariant recovery.
  4. Navigates to `/dashboard` to verify awarded XP and streak increment, then reviews due flashcards.
  5. Opens `/sandbox`, loads the "URL Shortener" blueprint, adjusts traffic parameters, and inspects bandwidth/storage estimates.
  6. Navigates to `/exams`, starts the 45-Minute Staff Mock Exam, answers capacity and trade-off questions, and submits for instant grading.
  7. Confirms all state changes are safely persisted in `localStorage`.

---

## 3. Test Runner & Execution Commands

### Prerequisites
- Node.js >= 18.0.0 (native test runner `node:test` and `node:assert/strict`).
- Puppeteer headless browser (resolved from local environment).
- Zero external runtime or build dependencies in `system-design`.

### Commands
```bash
# Execute the complete automated E2E test suite (all tiers and test files)
node tests/e2e/run-all.js

# Execute the new Interactive Learning Ecosystem test suite specifically
node --test tests/e2e/test-ecosystem.test.js

# Execute individual baseline test suites
node --test tests/e2e/tier1-feature-coverage.test.js
node --test tests/e2e/tier2-boundary-corner.test.js
node --test tests/e2e/tier3-cross-feature.test.js
node --test tests/e2e/tier4-real-world.test.js

# Run static asset stamping and repository validation
node tools/stamp-assets.js --check
node tools/validate.js
```

---

## 4. Pass/Fail Semantics & Exit Codes

| Exit Code | Semantics |
|-----------|-----------|
| `0` | **PASS**: 100% of test cases passed with zero failures and zero unhandled errors. |
| `1` | **FAIL**: One or more test assertions failed, a timeout occurred, or an unhandled exception was thrown. |

### Failure Diagnostics
When a test fails, `node:test` outputs:
- The exact test name and tier identifier (e.g., `T1.ECO.1_roadmap_canvas_renders`).
- Verbatim assertion error and stack trace indicating expected vs actual values.
- Clean process termination with code `1`.
