# `@innovatorved/code-lab` Architecture (v1.3.0)

`@innovatorved/code-lab` is an embeddable, zero-dependency, browser-native Node.js v22 + Bun v1.1 IDE, POSIX shell, PTY terminal, and virtual execution sandbox.

It is designed around two strictly decoupled layers that can be used together (`dist/code-lab.js`) or independently (`dist/runtime.js` for headless execution):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Host Application / Web Page                          │
│         (<code-lab> Web Component  |  CodeLab.mount()  |  Plugin API)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                     UI Layer: CodeLabWorkbench (src/workbench.js)           │
│  ┌────────────────────┐  ┌─────────────────────────┐  ┌──────────────────┐  │
│  │ Guided Walkthrough │  │ Multi-File Explorer &   │  │ Monaco / Native  │  │
│  │ & Step Verification│  │ Solution Diff Viewer    │  │ Code Editor      │  │
│  └────────────────────┘  └─────────────────────────┘  └──────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 5-Tab Bottom Drawer:                                                   │ │
│  │ [Test Suite] [Terminal & REPL] [Ports + HTTP Client] [Network] [VFS]   │ │
│  └───────────────────┬────────────────────────────────────┬───────────────┘ │
└──────────────────────┼────────────────────────────────────┼─────────────────┘
                       │                                    │
┌──────────────────────▼────────────────┐  ┌────────────────▼─────────────────┐
│  POSIX Shell & PTY (src/shell.js,     │  │  Virtual Runtime Engine          │
│                     src/terminal.js)  │  │  (src/runtime.js)                │
│  • Recursive-descent AST parser       │  │  • Web Worker pool + preemption  │
│  • Pipes (|), redirects (>, >>, 2>&1) │  │  • In-memory POSIX VFS (/tmp, …) │
│  • 40+ POSIX coreutils + git + jq     │  │  • Node.js v22 (21 built-in mods)│
│  • Interactive PTY ANSI/256-color     │  │  • Bun v1.1 (serve, sqlite, test)│
│  • Job table (ps, jobs, fg, bg, kill) │  │  • VirtualPortTable (127.0.0.1)  │
└───────────────────────────────────────┘  └──────────────────────────────────┘
```

---

## 1. Virtual Runtime Engine (`src/runtime.js`)

`CodeLabRuntime` is a self-contained browser execution engine that requires **zero server infrastructure** and **zero COOP/COEP headers**.

### 1.1 Web Worker Isolation & Preemption
- **Warm Worker Pool**: `executeInWorker(options)` maintains a warm `Blob`-backed Web Worker for sub-millisecond cold starts and spawns isolated workers for concurrent runs.
- **Hard Preemption**: Infinite `while(true)` loops or hung timers are terminated cleanly via `worker.terminate()` after `timeoutMs` (default `15000ms`) or immediately when `cancelWorkerExecution()` is invoked.
- **Automatic Resource Cleanup**: All timers (`setTimeout`, `setInterval`, `setImmediate`), virtual sockets, and pending test promises are tracked in a `resourceTracker` and cleaned up on exit.

### 1.2 In-Memory POSIX Virtual File System (`createVirtualFs`)
- Hierarchical inode tree pre-populated with `/workspace`, `/tmp`, `/etc`, and `/home/user`.
- Full `node:fs` and `node:fs/promises` APIs: `readFileSync`, `writeFileSync`, `appendFileSync`, `mkdirSync`, `readdirSync`, `statSync`, `unlinkSync`, `renameSync`, `copyFileSync`, `openSync`, `writeSync`, `readSync`, `fsyncSync`, `closeSync`, `createReadStream`, and `createWriteStream`.
- Real-time byte size, UTF-8 preview, and 16-byte hex dump snapshots (`vfs.getSnapshot()`) for inspecting binary WAL logs, SSTables, and SQLite tables.

### 1.3 Node.js v22 & Bun v1.1 Shims
- **21 Built-in Node.js Modules**: `fs`, `fs/promises`, `path`, `crypto`, `events`, `stream`, `stream/promises`, `http`, `https`, `net`, `zlib`, `util`, `assert`, `assert/strict`, `buffer`, `url`, `querystring`, `timers`, `timers/promises`, `perf_hooks`, `string_decoder`, `dns`, `os`, `child_process`, `process`, and `node:test`.
- **Bun v1.1 API (`Bun`, `'bun'`, `'bun:test'`, `'bun:sqlite'`)**:
  - `Bun.serve({ port, fetch, error })` binds directly to the shared `VirtualPortTable`.
  - `Bun.file(path)` and `Bun.write(dest, data)` read and write directly to the POSIX VFS.
  - `bun:sqlite` (`new Database(':memory:' | '/workspace/app.db')`) provides an in-memory relational SQL engine supporting `CREATE TABLE`, `INSERT`, `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `COUNT/SUM/AVG/MIN/MAX`, parameterized queries, and `db.transaction(fn)`.
  - `bun:test` provides Jest-compatible `expect()` matchers (`toBe`, `toEqual`, `toContain`, `toThrow`, `toHaveLength`, etc.) plus `describe`, `test`, `it`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, and `mock()`.

### 1.4 Virtual Port Table & Loopback Networking (`createVirtualPortTable`)
- `VirtualPortTable` coordinates active listeners across `http.createServer().listen(port)`, `net.createServer().listen(port)`, and `Bun.serve({ port })`.
- Loopback requests from `fetch('http://localhost:PORT/...')`, `http.request()`, `curl`, and the Workbench's Mini HTTP Client are routed in-memory with zero network latency and recorded in the HTTP/TCP trace log.

---

## 2. POSIX Shell & Coreutils (`src/shell.js`)

`createPosixShell` implements a complete POSIX shell interpreter inside the browser:
- **Lexer & Recursive-Descent AST Parser**: Supports single/double quotes, escape sequences, pipelines (`cmd1 | cmd2 | cmd3`), logical operators (`&&`, `||`, `;`), background execution (`&`), I/O redirection (`>`, `>>`, `<`, `2>`, `2>&1`), environment variable expansion (`$VAR`, `${VAR:-default}`, `$?`, `$$`), command substitution (`$(...)`), arithmetic expansion (`$((...))`), brace expansion (`{a,b,c}`, `{1..5}`), and globbing (`*`, `?`, `**`).
- **40+ Built-in Coreutils**:
  - File & Directory: `ls`, `cat`, `head`, `tail`, `wc`, `cp`, `mv`, `rm`, `mkdir`, `rmdir`, `touch`, `ln`, `pwd`, `cd`, `find`, `tree`, `stat`, `file`, `du`, `df`, `chmod`, `chown`, `mktemp`, `basename`, `dirname`, `realpath`.
  - Text & Data Processing: `grep`, `sed`, `awk`, `sort`, `uniq`, `cut`, `tr`, `tee`, `xargs`, `diff`, `jq`, `xxd`, `hexdump`, `base64`, `md5sum`, `sha256sum`.
  - Networking, Process & Archive: `curl`, `nc`, `ping`, `dig`, `nslookup`, `lsof`, `netstat`, `ss`, `ps`, `top`, `kill`, `jobs`, `fg`, `bg`, `tar`, `gzip`, `gunzip`.
  - Developer Toolchains: `node`, `bun`, `npm`, `npx`, `tsc`, `git` (`init`, `status`, `add`, `commit`, `log`, `diff`, `branch`, `checkout`).

---

## 3. PTY Terminal Engine (`src/terminal.js`)

`PTYTerminalEngine` provides a 2D character cell matrix and ANSI/VT100 escape sequence parser:
- Supports SGR 16-color, 256-color (`38;5;n`), and 24-bit TrueColor (`38;2;r;g;b`) foreground/background attributes, bold, dim, italic, underline, and inverse video.
- Supports cursor movement (`CSI A/B/C/D/H/G/J/K`), readline shortcuts (`Ctrl+A`, `Ctrl+E`, `Ctrl+U`, `Ctrl+K`, `Ctrl+L`, `Ctrl+C`, `Ctrl+D`), command history (`ArrowUp`/`ArrowDown`), and context-aware `Tab` autocompletion for commands and VFS file paths.

---

## 4. IDE Workbench (`src/workbench.js`)

`CodeLabWorkbench` and `<code-lab>` provide the full visual IDE experience:
- **Guided Challenge & Reference Sandbox Modes**: Step-by-step verification (`Verify Step`), AST/symbol jump-to-TODO, hints, and unified/split diff comparison against starter or solution files.
- **Monaco Editor + Zero-Dependency Fallback**: Automatic TypeScript/JavaScript IntelliSense with full ambient declarations for Node.js v22 and Bun v1.1 (`NODE_AMBIENT_DTS`).
- **5-Tab Bottom Drawer**:
  1. **Test Suite** (`tests`): Structured pass/fail assertions, duration badges, and failure stack traces.
  2. **Terminal & REPL** (`terminal`): Interactive POSIX shell (`sh`) and Node.js REPL (`node`).
  3. **Ports** (`ports`): Live listener table (`VirtualPortTable`) + interactive **Mini HTTP Client** (Method, URL, Headers, Body, and Preview/Raw/Headers response viewer).
  4. **Network** (`network`): HTTP & TCP loopback trace waterfall with status/method/latency breakdown and detail inspector.
  5. **Virtual Disk & HTTP** (`inspector`): In-memory POSIX VFS file/inode browser with UTF-8 and 16-byte hex dump previews.

---

## 5. Build & Distribution Pipeline (`tools/bundle.js`)

Running `npm run build` (`node tools/bundle.js`) produces:
- `dist/runtime.js` & `dist/runtime.esm.js` (headless virtual runtime)
- `dist/code-lab.js` & `dist/code-lab.esm.js` (complete runtime + shell + terminal + workbench bundle)
- `dist/code-lab.css` (standalone dark/light CSS variables & workbench styles)
- `dist/index.d.ts` (TypeScript definitions for `CodeLab`, `CodeLabWorkbench`, `CodeLabRuntime`, and `<code-lab>`)
