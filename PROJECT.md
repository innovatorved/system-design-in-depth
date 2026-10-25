# Project: System Design Asset Stamping & Code-Lab Standalone UI

## Architecture
The project spans two decoupled repositories:
1. `system-design-in-depth` (`/Users/vedgupta/Desktop/system-design`): A high-performance static SPA educational platform covering distributed systems topics and interactive build labs. Static HTML pages are pre-rendered into `build/*/index.html` and `topic/*/index.html`. Script/style tags are stamped with SHA1 query hashes (`?v=hash`). In-app navigation is handled client-side by `js/app.js` and `js/renderer.js`. Caching headers in `_headers` enforce 1-year immutable caching on `/js/*` and `/css/*`.
2. `@innovatorved/code-lab` (`/Users/vedgupta/Desktop/code-lab`): An embeddable virtual POSIX Web Worker IDE and terminal workbench library. Built using Bun and esbuild into `dist/`. Distributed via npm and Cloudflare Pages.

Data Flow & Dependency Structure:
- `system-design` dynamically loads `@innovatorved/code-lab` bundles via CDN/Cloudflare Pages for interactive lab views (`/build/*/`).
- Content-hash consistency between pre-rendered static HTML (`build/*/index.html`) and client-side renderer (`js/renderer.js`) is critical to ensure that client-side SPA navigation does not execute stale cached code.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Comprehensive HTML Asset Stamping | Update `tools/stamp-assets.js` to discover and stamp all HTML files including all 15 `build/*/index.html` files with exact content hashes | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Static Generation Pipeline Consistency | Ensure `tools/stamp-assets.js` and `tools/generate-static.js` maintain 100% hash and markup synchronization across all generated pages | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Validation Guardrail Enhancement | Ensure `node tools/stamp-assets.js --check` and `node tools/validate.js` pass with 0 errors and 0 warnings, verifying zero stale hashes and no legacy tab switcher markup | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Standalone Sample UI Template | Provide `src/sample.html` with self-contained styles, mock project files, and terminal runner without remote asset drift | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Build & Packaging for Sample UI | Update `tools/bundle.js` to emit `dist/sample.html`, and update `package.json` to export `./sample.html` and `./sample` within `"files": ["dist", ...]` | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Full Viewport & Fallback Editor Layout Integrity | Guarantee full-viewport edge-to-edge layout and resilient offline fallback editor without black screens or viewport letterboxing | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Code-Lab Test Suite Integrity | Ensure all 103 automated tests in `bun run test:all` pass with 100% success rate | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Headless SPA Build-Switching Verification | Automated verification (Puppeteer) navigating between builds (e.g. Merkle Anti-Entropy -> HyperLogLog) confirming legacy tab markup never appears | M3 | ORIGINAL_REQUEST §R3 |
| 9 | Cloudflare Pages Deployment: system-design | Build `dist/` and deploy `system-design-in-depth` to Cloudflare Pages (`system-design-in-depth.pages.dev`) via Wrangler | M4 | ORIGINAL_REQUEST §R3 |
| 10 | Cloudflare Pages Deployment: code-lab | Build `dist/` and `examples/cloud-ide/dist/` and deploy `code-lab` to Cloudflare Pages (`code-lab-3dr.pages.dev`) via Wrangler | M4 | ORIGINAL_REQUEST §R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Static HTML Asset Stamping in `system-design-in-depth` | Update `tools/stamp-assets.js` to discover all HTML files, sync with `tools/generate-static.js`, update `tools/validate.js`, verify 0 errors/warnings | none | DONE |
| M2 | Bundled Standalone Sample UI in `@innovatorved/code-lab` | Create `src/sample.html`, update `tools/bundle.js` to emit `dist/sample.html`, update `package.json` exports/files, verify `bun run test:all` (103/103 pass) | none | DONE |
| M3 | SPA Build-Switching Verification & E2E Validation | Execute headless automated SPA navigation tests and full suite verification ensuring zero legacy tab markup | M1, M2 | DONE |
| M4 | Commit, Build & Cloudflare Pages Deployment Sync | Commit git changes in both repositories, build production distribution artifacts, and deploy both to Cloudflare Pages | M3 | DONE |

## Interface Contracts
### `tools/stamp-assets.js` ↔ `tools/validate.js`
- `node tools/stamp-assets.js`: Stamps all HTML files with current SHA1 10-char asset hashes. Returns exit code 0.
- `node tools/stamp-assets.js --check`: Validates that every asset reference in `index.html`, `projects/index.html`, `404.html`, and `build/*/index.html` has an exact query hash matching the on-disk file SHA1. Returns exit code 0 on success, exit code 1 on mismatch.
- `node tools/validate.js`: Runs `--check` as part of repository health check. Must exit 0 with 0 errors and 0 warnings.

### `@innovatorved/code-lab` Distribution ↔ Downstream Integrators
- Package Artifact: `dist/sample.html`
- Asset References: `./code-lab.css` and `./code-lab.js` (relative to `dist/sample.html`).
- Subpath Export: `@innovatorved/code-lab/sample.html` and `@innovatorved/code-lab/sample` mapped in `package.json`.
- Layout Contract: `#app { width: 100vw; height: 100vh; }` with `.codelab { height: 100%; max-height: 100%; border: none; border-radius: 0; }`.

## Code Layout
### `system-design-in-depth` (`/Users/vedgupta/Desktop/system-design`)
- `tools/stamp-assets.js`: Asset discovery and hash replacement script.
- `tools/generate-static.js`: Static HTML prerender generator for topic, build pages, and pre-rendered homepage index.html with Schema.org JSON-LD and full crawlable sidebar.
- `tools/check-rendered.js`: QA gate verifying 0 duplicate paragraphs, 0 raw Markdown leaks, badge spacing, precomputed audio durations, and crawlable homepage links.
- `tools/validate.js`: Repository integrity and validation harness.
- `tools/build.js`: Production `dist/` assembler.
- `build/*/index.html`: 15 static build lab pages.
- `js/renderer.js`: Client-side rendering engine for topic and build views.
- `js/app.js`: SPA routing and page transitions.

### `@innovatorved/code-lab` (`/Users/vedgupta/Desktop/code-lab`)
- `src/sample.html`: Standalone sample UI template with self-contained styles and mock files.
- `tools/bundle.js`: Build script generating distribution artifacts in `dist/`.
- `package.json`: NPM package configuration and exports map.
- `dist/`: Bundled output artifacts (`code-lab.js`, `code-lab.css`, `sample.html`).
- `tests/`: Automated unit and integration test suites.
- `examples/cloud-ide/`: Astro Cloud IDE demonstration site deployed to Cloudflare Pages.
