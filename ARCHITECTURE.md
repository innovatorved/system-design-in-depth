# Architecture Overview

`system-design-in-depth` is a zero-framework, static-first web application. Every URL (`/`, `/topic/<slug>/`, `/build/<id>/`, `/roadmap/`, `/challenges/`, `/sandbox/`, `/dashboard/`, `/glossary/`, `/projects/`) ships as a pre-rendered HTML document for instant first paint, full search-engine crawlability, and per-page OpenGraph cards, then hydrates cleanly into client-side navigation.

---

## Directory Layout

```text
system-design-in-depth/
├── index.html                  # Root shell & pre-rendered landing page
├── 404.html                    # Custom 404 search & recovery page
├── design-system/              # Shared In-Depth CSS tokens & component primitives
│   ├── tokens.css              # Warm Paper (#F7F7F5) / Neutral Charcoal (#0F0F10) + Distributed Teal
│   └── components.css          # .ds-lesson-hero, .ds-toc, .ds-callout, .ds-footer, .ds-toast
├── css/                        # Platform layout, lesson typography, simulators & landing workbench
├── data/
│   ├── curriculum.js           # 6 tracks, 18 modules, 200 unit definitions
│   ├── content/                # Per-module prose, diagrams, takeaways & curated videos
│   ├── archive/                # Long-form markdown deep dives loaded on demand
│   ├── questions/              # 1,000 structured questions (MCQ + numeric Napkin Math + Trade-Off)
│   ├── implementations_code.js # 20 from-scratch reference implementations
│   ├── guided_labs.js          # 20 multi-step guided labs (JS, TS & C++20)
│   ├── challenges.js           # 12 production incident simulations & hotfixes
│   ├── whiteboard-blueprints.js# 10 architecture sandbox topologies
│   ├── roadmap.js              # 34-node DAG & 5 career paths
│   ├── srs-cards.js            # Spaced-repetition flashcards
│   └── glossary.js             # Distributed systems glossary
├── js/
│   ├── init.js                 # Synchronous head script (theme FOUC prevention, canonical host)
│   ├── manifest.js             # Auto-generated content hashes & site counts
│   ├── bootstrap.js            # Post-LCP deferred script loader & on-demand Mermaid loader
│   ├── app.js                  # History API router, sidebar state, CodeLab mount & scroll-spy TOC
│   ├── landing.js              # Split-hero Capacity Workbench + live simulator showcase
│   ├── renderer.js             # Isomorphic HTML renderer (runs in browser and Node VM for SSG)
│   ├── simulators*.js          # 32 interactive visual simulators
│   ├── roadmap.js / challenges.js / sandbox.js / dashboard.js / quiz.js / exercises.js
│   └── vendor/                 # Vendored @innovatorved/code-lab v0.4.0 bundles
└── tools/
    ├── stamp-assets.js         # Computes 10-char SHA-1 ?v= query hashes across all HTML files
    ├── generate-static.js      # Isomorphic Node VM pre-renderer + sitemap.xml generator
    ├── generate-og.js          # Deterministic 1200x630 PNG OpenGraph card generator
    ├── validate.js             # Schema, internal link, metadata, H1 & asset-stamp validator
    ├── check-rendered.js       # Rendered HTML QA gate (word counts, duplicates, markdown leaks)
    └── build.js                # Copies public assets into clean dist/ for Cloudflare Pages
```

---

## Key Architectural Invariants

1. **Isomorphic Rendering (`js/renderer.js` + `tools/generate-static.js`)**  
   `Renderer.renderLesson(slug)` and `Renderer.renderBuild(id)` are pure string builders with zero browser-only globals at call time. `tools/generate-static.js` executes the exact same `js/renderer.js` inside a deterministic Node `vm` context so static HTML and SPA transitions never drift.
2. **Content-Addressed Immutable Caching (`_headers` + `tools/stamp-assets.js`)**  
   `/js/*`, `/css/*`, `/data/*`, and `/fonts/*` are served with `Cache-Control: public, max-age=31536000, immutable`, while HTML is `must-revalidate`. Every local `<script>` and `<link>` carries `?v=<10-char-sha1>`, enforced in CI via `npm run stamp:check`.
3. **Post-LCP Deferred Hydration (`js/bootstrap.js`)**  
   Static HTML paints immediately using `design-system/*.css` and `css/*.css`. Application and data scripts (`type="text/plain" data-defer`) execute after Largest Contentful Paint or first user input, keeping main-thread blocking near zero.
4. **Local-First Learner State (`js/progress.js`)**  
   Completed units, build lab steps, incident resolutions, SM-2 flashcard schedules, and notes live in `localStorage` with JSON export/import — zero backend database required.
