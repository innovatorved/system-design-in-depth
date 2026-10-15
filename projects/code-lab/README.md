# @innovatorved/code-lab

> **Note:** This project is in active development. APIs and sandbox internals are stable for production use.

Browser-native code IDE workbench, step-by-step guided challenge engine, POSIX shell with 40+ UNIX coreutils, and Web Worker execution runtime for **Node.js** and **Bun** (JavaScript & TypeScript) with zero backend server dependencies.

Built to run the from-scratch distributed system implementations in [System Design In Depth](https://system-design-in-depth.vedgupta.in).

---

## Features

- **Interactive IDE Workbench**: Multi-file Monaco editor, collapsible hierarchical file tree with drag-and-drop, decoupled editor tabs, Command Palette (`Cmd+Shift+P`), Quick Open (`Cmd+P`), breadcrumbs, and line-by-line solution diff viewer.
- **Interactive PTY Terminal**: Inline prompt (`codelab:/workspace$ `), cursor navigation, history (`Up`/`Down`), `Tab` auto-completion, `Ctrl+C` interrupt, `Ctrl+L` clear, and 256 ANSI color codes.
- **POSIX Shell & 40+ Coreutils**: Full pure-JS AST interpreter supporting pipelines (`|`), redirects (`>`, `>>`, `2>&1`), logical operators (`&&`, `||`, `;`), background jobs (`&`), globs (`*.js`), environment variables, and 40+ UNIX commands (`ls`, `cat`, `grep`, `find`, `sed`, `awk`, `cut`, `sort`, `uniq`, `diff`, `curl`, `tree`, etc.).
- **Dual Runtime Engines (Node.js & Bun)**:
  - **Node.js**: 24 built-in modules (`fs`, `fs/promises`, `http`, `net`, `stream`, `events`, `crypto`, `buffer`, `util`, `url`, `timers`, `node:test`, `assert`).
  - **Bun**: Native `.ts` transpilation, `Bun.serve()`, `Bun.file()`, `Bun.write()`, `Bun.sleep()`, `Bun.hash()`, `bun:test`, and in-memory `bun:sqlite`.
- **Persistent HTTP/TCP Servers & Port Preview**: Start background servers (`node server.js &` or `bun run server.ts &`), query them with `curl http://localhost:3000` or global `fetch()`, and preview live responses in the Ports / HTTP Preview tab.
- **NPM & Bun Package Management**: `npm i <pkg>` and `bun add <pkg>` resolve dependencies from npm / esm.sh into virtual `/workspace/node_modules/<pkg>` and update `package.json`.
- **Guided Step-by-Step Challenges**: TutorialKit / Codedamn-style curriculum with targeted instructions, hints, automated test verification per step, and reference solutions.
- **Headless Runtime**: Programmatic execution engine (`@innovatorved/code-lab/runtime`) for grading, testing, or automated evaluation with zero UI.

---

## Install

```bash
npm install @innovatorved/code-lab
```

Or load from a static script tag via CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.css" />
<script src="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.js"></script>
```

---

## Usage

### 1. Mount Workbench in DOM

```js
import CodeLab from '@innovatorved/code-lab';
import '@innovatorved/code-lab/code-lab.css';

const lab = CodeLab.mount('#editor', {
  id: 'rate-limiter',
  title: 'Token Bucket Rate Limiter',
  mode: 'guided',
  language: 'js',
  entry: 'demo.js',
  testEntry: 'test.js',
  starterFiles: {
    'limiter.js': 'class TokenBucket {\n  allow() { return false; }\n}\nmodule.exports = { TokenBucket };\n',
    'demo.js': 'const { TokenBucket } = require("./limiter");\nconsole.log(new TokenBucket().allow());\n',
    'test.js': 'const { test } = require("node:test");\nconst assert = require("node:assert/strict");\nconst { TokenBucket } = require("./limiter");\n\ntest("allows request", () => {\n  assert.equal(new TokenBucket().allow(), true);\n});\n'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Allow requests within capacity',
      targetFile: 'limiter.js',
      targetSymbol: 'allow',
      instructions: 'Return `true` when tokens are available.',
      testNames: ['allows request']
    }
  ]
});
```

### 2. `<code-lab>` Custom Element

```html
<code-lab mode="sandbox" language="ts" style="height: 600px;">
  <script type="application/json">
    {
      "id": "demo-lab",
      "title": "Bun HTTP Demo",
      "entry": "server.ts",
      "files": {
        "server.ts": "Bun.serve({ port: 3000, fetch: () => Response.json({ ok: true }) }); console.log('Listening on :3000');"
      }
    }
  </script>
</code-lab>
```

### 3. Headless Runtime (No UI)

```js
import { executeInWorker } from '@innovatorved/code-lab/runtime';

const res = await executeInWorker({
  mode: 'test',
  entry: 'test.js',
  files: {
    'math.js': 'module.exports = { add: (a, b) => a + b };',
    'test.js': 'const { test } = require("node:test");\nconst assert = require("node:assert/strict");\nconst { add } = require("./math");\ntest("adds numbers", () => assert.equal(add(2, 3), 5));'
  }
});

console.log(res.ok, res.testResults);
```

---

## Documentation

Complete documentation is published on the [GitHub Wiki](https://github.com/innovatorved/code-lab/wiki) (and mirrored in [`wiki/`](./wiki/Home.md)):

- **[Quick Start](https://github.com/innovatorved/code-lab/wiki/Quick-Start)**: Setup, CDN, and quick examples.
- **[Integration Guide](https://github.com/innovatorved/code-lab/wiki/Integration-Guide)**: Embedding in React, Next.js, Vite, and HTML.
- **[Workbench Configuration](https://github.com/innovatorved/code-lab/wiki/Workbench-Configuration)**: Complete reference of options, methods, events, and shortcuts.
- **[POSIX Shell & Coreutils](https://github.com/innovatorved/code-lab/wiki/POSIX-Shell-and-Coreutils)**: Pipelines, redirects, background jobs, and 40+ UNIX commands.
- **[Runtime APIs (Node & Bun)](https://github.com/innovatorved/code-lab/wiki/Runtime-APIs)**: 24 Node.js built-ins, Bun APIs, `bun:test`, `bun:sqlite`, and npm install.
- **[HTTP Servers & Networking](https://github.com/innovatorved/code-lab/wiki/HTTP-Servers-and-Networking)**: Virtual port table, background servers, `curl`, and Port Preview.
- **[Headless Runtime](https://github.com/innovatorved/code-lab/wiki/Headless-Runtime)**: Run code and tests programmatically with zero UI.
- **[Authoring Guided Labs](https://github.com/innovatorved/code-lab/wiki/Authoring-Guided-Labs)**: Schema and invariants for creating interactive coding challenges.
- **[Plugin System & Custom Extensions](https://github.com/innovatorved/code-lab/wiki/Plugin-System)**: Extend CodeLab with `.use(plugin)` and `.on()` event hooks.

---

## Local Development & Testing

```bash
# Rebuild all distribution bundles and site assets
node tools/bundle.js

# Run the complete test suite
node test-all-builds.js             # 15/15 builds & 226 unit tests
node test-runtime-advanced.js       # Advanced runtime, VFS, HTTP/TCP
node test-option1-shell-bun-http.js # Shell AST, Bun runtime, curl, ports
node test-coreutils-adversarial.js  # Adversarial stress tests on 40+ coreutils
node test-stress-shell.js           # Deep pipelines, redirections, large stdout
node test-workbench-ui.js           # Workbench tabs, explorer, shortcuts
```

---

## License

MIT © [Ved Gupta](https://vedgupta.in)
