# CodeLab Documentation & Wiki

`@innovatorved/code-lab` is a browser-native code IDE, step-by-step guided lab workbench, and Web Worker execution engine for JavaScript and TypeScript.

It runs entirely inside the client browser with zero backend server dependencies, zero Docker containers, and zero `SharedArrayBuffer` / COOP / COEP requirements.

---

## Key Capabilities

- **Interactive IDE Workbench**: Multi-file Monaco editor, hierarchical file tree with drag-and-drop, decoupled editor tabs, command palette (`Cmd+Shift+P`), quick open (`Cmd+P`), breadcrumbs, diff viewer, and Geist monochrome dark/light themes.
- **Interactive PTY Terminal**: Full terminal emulator with inline prompt (`codelab:/workspace$ `), cursor navigation, history (`Up`/`Down`), `Tab` auto-completion, `Ctrl+C` interrupt, `Ctrl+L` clear, and 256 ANSI colors.
- **POSIX Shell & 40+ UNIX Coreutils**: Pure-JS AST interpreter supporting pipelines (`|`), redirects (`>`, `>>`, `2>&1`), logical operators (`&&`, `||`, `;`), background jobs (`&`), globs (`*.js`), environment variables, and 40+ UNIX commands (`ls`, `cat`, `grep`, `find`, `sed`, `awk`, `cut`, `sort`, `uniq`, `diff`, `curl`, `tree`, etc.).
- **Dual Runtime Support (Node.js & Bun)**:
  - **Node.js**: 24 built-in modules (`fs`, `fs/promises`, `http`, `net`, `stream`, `events`, `crypto`, `buffer`, `util`, `url`, `timers`, `node:test`, `assert`).
  - **Bun**: Native `.ts` transpilation, `Bun.serve()`, `Bun.file()`, `Bun.write()`, `Bun.sleep()`, `Bun.hash()`, `bun:test`, and in-memory `bun:sqlite`.
- **Persistent HTTP/TCP Servers & Port Preview**: Start background servers (`node server.js &` or `bun run server.ts &`), test them with `curl http://localhost:3000` or global `fetch()`, and preview responses in the Ports / HTTP Preview tab.
- **NPM & Bun Package Management**: `npm i <pkg>` and `bun add <pkg>` resolve dependencies from npm / esm.sh directly into the virtual `/workspace/node_modules` directory.
- **Step-by-Step Guided Challenges**: Codedamn / TutorialKit style step progression with targeted instructions, hints, automated test verification per step, and reference solutions.
- **Headless Runtime**: Programmatic execution engine (`@innovatorved/code-lab/runtime`) for running untrusted code and test suites without any DOM or UI.

---

## Documentation Index

1. **[Quick Start](Quick-Start)** — Get running in 60 seconds via CDN or NPM.
2. **[Integration Guide](Integration-Guide)** — Embed CodeLab in React, Next.js, Vite, or static HTML.
3. **[Workbench Configuration & Options](Workbench-Configuration)** — Complete options, instance methods, and events reference.
4. **[POSIX Shell & Coreutils](POSIX-Shell-and-Coreutils)** — Syntax, pipelines, redirects, and 40+ UNIX command reference.
5. **[Runtime APIs (Node & Bun)](Runtime-APIs)** — Node built-ins, Bun APIs, TypeScript support, and package installation.
6. **[HTTP Servers & Networking](HTTP-Servers-and-Networking)** — Port table, background servers, `curl`, and port preview.
7. **[Headless Runtime](Headless-Runtime)** — Run code programmatically without mounting an editor.
8. **[Authoring Guided Labs](Authoring-Guided-Labs)** — Schema and instructions for creating step-by-step coding challenges.
9. **[Plugin System & Custom Extensions](Plugin-System)** — Extend CodeLab with `.use(plugin)` and `.on()` event hooks.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Window                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               CodeLab Workbench (UI)                  │  │
│  │   • Monaco Editor (JS / TS)                           │  │
│  │   • Hierarchical File Tree & Breadcrumbs              │  │
│  │   • PTY Terminal Emulator (ANSI, Tab completion)      │  │
│  │   • Drawer Tabs: Tests, Console, Disk, Ports, Trace   │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ postMessage                   │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Web Worker Sandbox (Isolated)              │  │
│  │   • POSIX Shell AST Engine & 40+ Coreutils            │  │
│  │   • Virtual Filesystem (/workspace, /tmp)             │  │
│  │   • 24 Node.js Built-in Shims + Buffer + Crypto       │  │
│  │   • Bun Runtime Engine (Bun.serve, bun:test, sqlite)  │  │
│  │   • Loopback HTTP & TCP Port Table (:3000, :8080)     │  │
│  │   • TypeScript / ESM Transpiler (Zero 'unsafe-eval')  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```
