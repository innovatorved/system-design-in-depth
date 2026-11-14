# Third-Party Notices & Attribution

This repository ships or loads the following open-source libraries, fonts, and references:

---

## 1. Vendored & Client-Side Runtime Dependencies

### `@innovatorved/code-lab` (`v0.4.0`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2026 Ved Gupta (`https://github.com/innovatorved/code-lab` · `https://code-lab.vedgupta.in/`)
- **Usage:** Vendored under `js/vendor/code-lab.js`, `js/vendor/guided-lab.js`, `css/vendor/code-lab.css`, and `preview-sw.js` (with CDN fallback to `@innovatorved/code-lab@0.4.0`) for browser-native JavaScript, TypeScript, C++20 (Clang/WASI), and Python 3.12 (Pyodide) build labs, snippet runners, and incident hotfix rooms.

### Mermaid (`v10.9.8`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2014–2026 Knut Sveidqvist and contributors
- **Usage:** Loaded on demand with SRI verification (`js/bootstrap.js`) to render interactive architecture and protocol diagrams.

### Geist & Geist Mono Fonts
- **License:** SIL Open Font License 1.1
- **Copyright:** Copyright (c) 2023 Vercel, Inc.
- **Usage:** Self-hosted variable webfonts under `fonts/geist-latin.woff2` and `fonts/geist-mono-latin.woff2`.

---

## 2. Primary Research Papers, Standards & Attribution

Distributed algorithms, storage structures, and incident reconstructions discussed across the curriculum (including Raft, Amazon Dynamo, LSM-Trees, Bitcask, SWIM, HyperLogLog, Count-Min Sketch, and public engineering postmortems) cite primary academic papers, IETF RFCs, and public engineering publications documented in [`SOURCES.md`](SOURCES.md).

All original platform code is licensed under the [MIT License](LICENSE), and all original curriculum prose, diagrams, and exercises are licensed under [CC BY 4.0](LICENSE).
