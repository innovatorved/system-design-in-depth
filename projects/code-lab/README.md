# `@innovatorved/code-lab`

Browser-based multi-file Code IDE, Guided Lab Workbench, and Sandboxed Web Worker Node.js Runtime. Zero runtime dependencies.

Embed via the `<code-lab>` Custom Element, the `CodeLab.mount()` / `CodeLab.create()` SDK, or headless via `@innovatorved/code-lab/runtime`.

---

## Installation

### CDN / Static Script

```html
<link rel="stylesheet" href="https://unpkg.com/@innovatorved/code-lab/dist/code-lab.css" />
<script src="https://unpkg.com/@innovatorved/code-lab/dist/code-lab.js"></script>
```

### NPM / ESM

```bash
npm install @innovatorved/code-lab
```

```js
import { CodeLab, CodeLabWorkbench, CodeLabRuntime } from '@innovatorved/code-lab';
import '@innovatorved/code-lab/code-lab.css';
```

---

## Quick Start

### 1. `<code-lab>` Custom Element

Pass options as attributes or inside a `<script type="application/json">` block:

```html
<code-lab mode="guided" language="ts" theme="dark" style="height: 640px;">
  <script type="application/json">
    {
      "id": "token-bucket",
      "title": "Token Bucket Rate Limiter",
      "summary": "Build a token bucket rate limiter with lazy refill.",
      "entry": "demo.ts",
      "testEntry": "test.ts",
      "starterFiles": {
        "index.ts": "export class TokenBucket {\n  constructor(private capacity: number, private refillRate: number) {}\n  // TODO (Step 1): Implement allowRequest\n  allowRequest(tokens = 1): boolean {\n    return false;\n  }\n}\n",
        "demo.ts": "import { TokenBucket } from './index.ts';\nconst limiter = new TokenBucket(5, 1);\nconsole.log('Allowed:', limiter.allowRequest(3));\n",
        "test.ts": "import { describe, it } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { TokenBucket } from './index.ts';\n\ndescribe('TokenBucket', () => {\n  it('allows requests within capacity', () => {\n    const limiter = new TokenBucket(5, 1);\n    assert.equal(limiter.allowRequest(3), true);\n    assert.equal(limiter.allowRequest(3), false);\n  });\n});\n"
      },
      "steps": [
        {
          "id": "step-1-consume",
          "title": "Implement token consumption",
          "concept": "Rate Limiting",
          "targetFile": "index.ts",
          "targetSymbol": "allowRequest",
          "instructions": "Deduct requested tokens when sufficient balance is available.",
          "hint": "Compare current token balance against the requested amount.",
          "testNames": ["TokenBucket > allows requests within capacity"]
        }
      ]
    }
  </script>
</code-lab>
```

### 2. Programmatic SDK (`CodeLab.mount` / `CodeLab.create`)

```js
import { CodeLab } from '@innovatorved/code-lab';

const workbench = CodeLab.mount('#editor-root', {
  id: 'consistent-hashing',
  title: 'Consistent Hash Ring',
  mode: 'guided',
  language: 'ts',
  entry: 'demo.ts',
  testEntry: 'test.ts',
  starterFiles: {
    'index.ts': 'export class HashRing {}\n',
    'demo.ts': 'import { HashRing } from "./index.ts";\nconsole.log(new HashRing());\n',
    'test.ts': 'import { test } from "node:test";\nimport assert from "node:assert/strict";\ntest("routes keys", () => { assert.equal(1, 1); });\n'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Add virtual nodes to ring',
      concept: 'Partitioning',
      targetFile: 'index.ts',
      targetSymbol: 'HashRing',
      instructions: 'Hash each node replica onto the 32-bit ring.',
      testNames: ['routes keys']
    }
  ],
  onStepComplete(step, stepIndex) {
    console.log(`Passed step ${stepIndex + 1}: ${step.id}`);
  },
  onLabComplete(labId) {
    console.log(`Completed lab: ${labId}`);
  }
});
```

---

## `CodeLabWorkbench` API

### Constructor

```ts
new CodeLabWorkbench(container: HTMLElement | string, options?: CodeLabOptions)
```

### `CodeLabOptions`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` / `labId` | `string` | `'custom-lab'` | Unique identifier used for `localStorage` state persistence (`sd-codelab-v1:<labId>`). |
| `title` | `string` | `labId` | Title rendered in the workbench header bar. |
| `summary` | `string` | `''` | Fallback markdown description when `README.md` is not in `files`. |
| `mode` | `'guided' \| 'sandbox'` | `'guided'` if `steps.length > 0`, else `'sandbox'` | Initial workbench mode. |
| `language` / `lang` | `'js' \| 'ts'` | `'js'` | Active workspace language. |
| `theme` | `'dark' \| 'light' \| 'auto'` | `'auto'` | Color theme override. `'auto'` syncs with `<html data-theme="...">`. |
| `files` | `Record<string, string>` | Default 3-file template | Reference/solution files for `'sandbox'` mode (and base files for `'guided'` mode). |
| `solutionFiles` | `Record<string, string>` | `options.files` | Explicit reference solution files (JS). |
| `starterFiles` | `Record<string, string>` | `{}` | Starter code overrides merged over `files` in `'guided'` mode (JS). |
| `tsFiles` / `tsSolutionFiles` | `Record<string, string>` | Auto-mapped from JS | Explicit TypeScript reference files for `'sandbox'` mode when `language: 'ts'`. |
| `tsStarterFiles` | `Record<string, string>` | Auto-mapped from JS | Explicit TypeScript starter files for `'guided'` mode when `language: 'ts'`. |
| `steps` | `CodeLabStep[]` | `[]` | Ordered guided steps. |
| `stepIndex` | `number` | `0` | Initial active step index (`0`-based). |
| `entry` | `string` | `'demo.js'` / `'demo.ts'` | Entry file executed by `runDemo()`. |
| `testEntry` / `testFile` | `string` | `'test.js'` / `'test.ts'` | Test suite file executed by `runTests()`. |
| `backLabel` | `string` | `'Back to Build Guide'` | Label for the back button when `onClose` is provided. |
| `monacoUrl` | `string` | jsDelivr `monaco-editor@0.52.2` | Custom base URL for the Monaco AMD loader. |
| `persistState` | `boolean` | `true` | Persist workspace files and step progress in `localStorage` (automatically falls back to in-memory `Map` in sandboxed cross-origin iframes). |
| `onClose` | `() => void` | `null` | Renders the top-left back button and fires when clicked. |
| `onStepComplete` | `(step: CodeLabStep, stepIndex: number) => void` | `null` | Fired when all `testNames` for a step pass. |
| `onLabComplete` | `(labId: string) => void` | `null` | Fired when all steps in `steps` are completed. |
| `onRun` | `(result: CodeLabExecutionResult) => void` | `null` | Fired after `runDemo()` or `runTests()` finishes. |
| `onTestResult` | `(result: CodeLabExecutionResult) => void` | `null` | Fired after `runTests()` completes. |
| `onCodeChange` | `(filename: string, code: string) => void` | `null` | Fired whenever a workspace file is modified. |

### `CodeLabStep` Schema

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique step identifier stored in `completedSteps`. |
| `title` | `string` | Yes | Step heading displayed in the guide panel. |
| `concept` | `string` | No | Architecture concept badge displayed under the step header. |
| `targetFile` | `string` | No | File opened when selecting the step (automatically maps `.js` to `.ts` in TS mode). |
| `targetSymbol` | `string` | No | Symbol or comment marker to center and highlight in the editor (falls back to `TODO (Step N)`). |
| `instructions` | `string` | Yes | Markdown instructions rendered in the guide pane. |
| `hint` | `string` | No | Collapsible markdown hint for the step. |
| `testNames` | `string[]` | No | Exact test names (e.g., `["Suite > test name"]`) that must pass to mark the step complete. |

### Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd/Ctrl + Enter` | Run Demo Entry (`runDemo()`) |
| `Cmd/Ctrl + Shift + Enter` | Verify Current Step / Run Tests (`verifyCurrentStep()`) |
| `Cmd/Ctrl + Shift + P` or `F1` | Open VS Code Command Palette (`openCommandPalette('commands')`) |
| `Cmd/Ctrl + P` | Quick Open File Picker (`openCommandPalette('files')`) |
| `Escape` | Close Command Palette / Context Menu / Modal or Exit Fullscreen |

### Instance Methods & Third-Party Imperative SDK

All methods are available on both `CodeLabWorkbench` instances and `<code-lab>` Custom Elements:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `runDemo` | `runDemo(): Promise<void>` | Executes the demo entry file (`mode: 'run'`) in the isolated Web Worker and streams output to the Terminal tab. |
| `runTests` | `runTests(filterTestNames?: string \| string[] \| null): Promise<void>` | Executes the test suite (`mode: 'test'`) and updates the Test Suite tab and step completion state. |
| `verifyCurrentStep` | `verifyCurrentStep(): Promise<void>` | Runs the test suite and advances to the next step if the current step's `testNames` all pass. |
| `stopExecution` / `cancelExecution` | `stopExecution(): void` | Terminates only this instance's active Web Worker execution immediately (`exitCode: 130`). |
| `openCommandPalette` | `openCommandPalette(mode?: 'commands' \| 'files'): void` | Opens the fuzzy-searchable Command Palette (`>`) or Quick Open file picker. |
| `showDiffModal` | `showDiffModal(targetFile?: string, compareTarget?: 'solution' \| 'starter'): void` | Opens the interactive Unified / Side-by-Side LCS Diff Viewer comparing user code against reference solution or starter template. |
| `getFiles` | `getFiles(): Record<string, string>` | Returns a shallow clone of all current workspace files. |
| `setFiles` | `setFiles(filesMap: Record<string, string>, opts?: { merge?: boolean }): this` | Replaces or merges workspace files, updates Monaco models, and emits `codelab:change`. |
| `getFile` | `getFile(path: string): string \| null` | Reads the current content of a single file in the virtual workspace. |
| `setFile` | `setFile(path: string, content: string, opts?: { open?: boolean }): this` | Writes or creates a file in the virtual workspace and optionally opens it in a tab. |
| `deleteFile` | `deleteFile(filename: string): boolean` | Deletes a file (or `deleteFolder(prefix)` for recursive directory deletion) and disposes its Monaco model. |
| `duplicateFile` | `duplicateFile(path: string): string \| null` | Duplicates `file.js` to `file.copy.js` and opens the copy. |
| `getOpenTabs` | `getOpenTabs(): string[]` | Returns the ordered list of currently open editor tab paths (decoupled from workspace files). |
| `closeTab` / `closeOtherTabs` / `closeAllTabs` | `closeTab(filename: string): void` | Closes one, all other, or all open editor tabs without deleting the underlying files from disk. |
| `exportWorkspace` | `exportWorkspace(opts?: { download?: boolean }): Record<string, any>` | Exports a complete JSON snapshot of the workspace (and optionally triggers a browser file download). |
| `importWorkspace` | `importWorkspace(snapshotOrJson: string \| object): boolean` | Restores workspace files and active state from an exported snapshot. |
| `downloadFile` | `downloadFile(path?: string): { filename: string; content: string } \| null` | Downloads a single workspace file. |
| `on` / `off` | `on(event: string, handler: (detail: any) => void): () => void` | Subscribes/unsubscribes to workbench events (`'change'`, `'run'`, `'test-result'`, `'step-complete'`, `'lab-complete'`). Returns an unsubscribe function. |
| `use` | `use(plugin: (wb: CodeLabWorkbench, opts?: any) => any, opts?: any): this` | Registers a third-party plugin inside an error boundary; any returned `{ dispose() }` or function is cleaned up on `destroy()`. |
| `selectStep` | `selectStep(idx: number, shouldJump?: boolean): void` | Switches to step `idx` (`0`-based) and centers `targetSymbol`. |
| `openFile` | `openFile(filename: string, symbolToFind?: string): void` | Opens `filename` in an editor tab and optionally jumps to `symbolToFind`. |
| `createFile` / `createFolder` | `createFile(rawName: string): void` | Creates a new file or nested directory in the hierarchical file explorer. |
| `renameFile` / `renameFolder` / `movePath` | `renameFile(oldPath: string, newPath: string): boolean` | Renames or moves files and folders (also supported via drag-and-drop in the explorer). |
| `setMode` / `setLanguage` / `configure` | `configure(opts): void` | Switches mode (`'guided' \| 'sandbox'`), language (`'js' \| 'ts'`), or `stepIndex`. |
| `showPackagesModal` / `addNpmPackage` | `addNpmPackage(rawSpec: string): void` | Adds an NPM package specifier to `package.json`. |
| `showSolutionModal` / `applyReferenceSolution` | `showSolutionModal(): void` | Views or applies the reference solution for the active file. |
| `reset` / `resetLab` | `reset(): this` | Resets workspace files for the current `mode` and `lang` to their initial template. |
| `toggleFullscreen` | `toggleFullscreen(): void` | Toggles full-viewport IDE mode (`Esc` exits). |
| `destroy` | `destroy(): void` | Disposes Monaco models, editor instance, plugins, observers, and DOM listeners. |

### DOM Custom Events & `.on()` Events

`CodeLabWorkbench` dispatches bubbling `CustomEvent`s on `container` and notifies `.on(event, handler)` subscribers:

| Event | `detail` Payload |
| :--- | :--- |
| `codelab:change` / `'change'` | `{ labId, filename, code, files }` |
| `codelab:file-create` / `'file-create'` | `{ labId, filename }` |
| `codelab:file-delete` / `'file-delete'` | `{ labId, filename }` |
| `codelab:file-open` / `'file-open'` | `{ labId, filename }` |
| `codelab:run` / `'run'` | `{ labId, mode: 'run' \| 'test', entry, result }` |
| `codelab:step-complete` / `'step-complete'` | `{ labId, step, stepIndex, completedSteps }` |
| `codelab:lab-complete` / `'lab-complete'` | `{ labId, completedSteps }` |

---

## Headless Runtime API (`CodeLabRuntime`)

Import from `@innovatorved/code-lab` or `@innovatorved/code-lab/runtime`:

```js
import {
  executeInVirtualRuntime,
  executeInWorker,
  cancelWorkerExecution,
  preloadNpmPackages,
  transpileTS,
  createVirtualFs,
  createVirtualHttp,
  createVirtualNet
} from '@innovatorved/code-lab/runtime';
```

### Functions

| Function | Signature | Description |
| :--- | :--- | :--- |
| `executeInVirtualRuntime` | `(options?: CodeLabExecutionOptions) => Promise<CodeLabExecutionResult>` | Executes multi-file JS/TS directly in the current thread against an isolated Virtual File System and loopback network. |
| `executeInWorker` | `(options?: CodeLabExecutionOptions) => Promise<CodeLabExecutionResult>` | Executes in an isolated `Blob` Web Worker with a watchdog timeout (`15000ms` default in worker, terminates hung loops with `exitCode: 124`). Falls back to `executeInVirtualRuntime` when `Worker` is unavailable. |
| `cancelWorkerExecution` | `(reason?: string) => boolean` | Terminates the active Web Worker job (`exitCode: 130`, `cancelled: true`). Returns `true` if a job was active. |
| `preloadNpmPackages` | `(files?: Record<string, string>, existingCache?: Map<string, string>) => Promise<Record<string, string>>` | Scans `package.json` and `require()`/`import` statements in `files`, fetches missing packages from jsDelivr (`https://cdn.jsdelivr.net/npm/<pkg>`), and caches their source strings. |
| `transpileTS` | `(source: string, filename?: string) => string` | Strips TypeScript type syntax (`interface`, `type`, `enum`, access modifiers, generics, `as`/`satisfies`) and transforms ES module `import`/`export` into CommonJS. |
| `createVirtualFs` | `(initialFiles?: Record<string, string>) => VirtualFs` | Creates an isolated in-memory POSIX filesystem rooted at `/workspace` and `/tmp`. |
| `createVirtualHttp` | `(resourceTracker?: object) => VirtualHttp` | Creates an in-memory HTTP/HTTPS loopback server and client registry with request tracing. |
| `createVirtualNet` | `(resourceTracker?: object, sharedTrace?: any[]) => VirtualNet` | Creates an in-memory TCP `Server` and `Socket` duplex loopback registry. |

### `CodeLabExecutionOptions`

```ts
interface CodeLabExecutionOptions {
  files?: Record<string, string>;
  entry?: string;                        // default: 'demo.js'
  mode?: 'run' | 'test' | 'repl';        // default: 'run'
  replCode?: string;                     // Evaluated when mode === 'repl'
  testFilter?: string | string[] | null; // Substring or exact test name list
  timeoutMs?: number;                    // default: 30000 (runtime) / 15000 (worker)
  maxOutputBytes?: number;               // default: 262144 (256 KB)
  maxConsoleCalls?: number;              // default: 5000
  packages?: Record<string, any>;        // Injected CJS module exports or source strings
  npmModules?: Record<string, any>;      // Alias for injected packages
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
  onTestResult?: (item: CodeLabTestResultItem) => void;
}
```

### `CodeLabExecutionResult`

```ts
interface CodeLabExecutionResult {
  ok: boolean;                           // true when exitCode === 0
  exitCode: number;                      // 0 = ok, 1 = error/test fail, 124 = timeout, 130 = cancelled
  durationMs: number;
  stdout: string;
  stderr: string;
  outputTruncated?: boolean;
  timedOut?: boolean;
  cancelled?: boolean;
  error?: { message: string; stack?: string };
  testResults: Array<{
    index: number;
    name: string;
    status: 'pass' | 'fail';
    passed: boolean;
    durationMs: number;
    error: {
      name: string;
      message: string;
      stack: string;
      actual?: string;
      expected?: string;
      operator?: string;
    } | null;
  }>;
  testSummary?: {
    total: number;
    passed: number;
    failed: number;
  };
  fsSnapshot: Array<{
    path: string;
    size: number;
    isDirectory: boolean;
    mtimeMs: number;
    preview?: string;
    hexPreview?: string;
  }>;
  httpTrace: Array<{
    protocol?: string;
    method?: string;
    port: number;
    url?: string;
    status?: number;
    durationMs: number;
  }>;
  replValue?: string;
}
```

---

## Supported Node.js Built-in Modules (24 Modules)

All modules can be imported with or without the `node:` prefix (`require('node:fs')` or `require('fs')`).

| Module | Supported APIs |
| :--- | :--- |
| `fs` / `node:fs` | `openSync`, `closeSync`, `readSync`, `writeSync`, `fsyncSync`, `fstatSync`, `statSync`, `lstatSync`, `existsSync`, `mkdirSync`, `mkdtempSync`, `readdirSync`, `readFileSync`, `writeFileSync`, `appendFileSync`, `copyFileSync`, `truncateSync`, `renameSync`, `unlinkSync`, `rmSync`, `rmdirSync`, `realpathSync`, `accessSync`, `chmodSync`, `createReadStream`, `createWriteStream`, callback variants, and `fs.promises`. |
| `fs/promises` / `node:fs/promises` | `open`, `readFile`, `writeFile`, `appendFile`, `copyFile`, `truncate`, `mkdir`, `mkdtemp`, `readdir`, `stat`, `lstat`, `unlink`, `rm`, `rmdir`, `rename`, `realpath`, `access`, `chmod` (with `FileHandle` methods `read`, `write`, `stat`, `sync`, `datasync`, `truncate`, `close`). |
| `net` / `node:net` | `Server`, `Socket`, `createServer`, `createConnection`, `connect`, `isIP`, `isIPv4`, `isIPv6` (in-memory full-duplex TCP loopback). |
| `http` / `node:http` | `Server`, `IncomingMessage`, `ServerResponse`, `ClientRequest`, `Agent`, `globalAgent`, `STATUS_CODES`, `METHODS`, `createServer`, `request`, `get` (in-memory loopback on `127.0.0.1` with ephemeral port allocation and HTTP trace recording). |
| `https` / `node:https` | Alias of `node:http` for loopback server/client testing. |
| `stream` / `node:stream` | `Stream`, `Readable`, `Writable`, `Duplex`, `Transform`, `PassThrough`, `pipeline`, `finished`, `Readable.from`, `promises`. |
| `stream/promises` / `node:stream/promises` | `pipeline`, `finished`. |
| `events` / `node:events` | `EventEmitter`, `once`, `on`, `getEventListeners`, `listenerCount`, `captureRejectionSymbol`, `errorMonitor`, `defaultMaxListeners`. |
| `crypto` / `node:crypto` | `createHash` (`md5`, `sha1`, `sha256`, `sha384`, `sha512`), `createHmac`, `pbkdf2Sync`, `pbkdf2`, `scryptSync`, `scrypt`, `createCipheriv`, `createDecipheriv`, `timingSafeEqual`, `randomUUID`, `randomBytes`, `randomFillSync`, `randomInt`, `hkdfSync`, `webcrypto`. |
| `zlib` / `node:zlib` | `crc32` (IEEE 802.3), `gzipSync`, `gunzipSync`, `deflateSync`, `inflateSync`, `deflateRawSync`, `inflateRawSync`, `brotliCompressSync`, `brotliDecompressSync`, async callback variants, and `constants`. |
| `path` / `node:path` | POSIX `join`, `resolve`, `normalize`, `isAbsolute`, `relative`, `dirname`, `basename`, `extname`, `parse`, `format`, `sep`, `delimiter`, `posix`, `win32`. |
| `os` / `node:os` | `EOL`, `tmpdir`, `homedir`, `hostname`, `platform`, `arch`, `type`, `release`, `cpus`, `totalmem`, `freemem`, `uptime`, `loadavg`, `networkInterfaces`, `userInfo`, `endianness`, `availableParallelism`. |
| `util` / `node:util` | `format`, `inspect`, `promisify`, `callbackify`, `inherits`, `deprecate`, `isDeepStrictEqual`, `stripVTControlCharacters`, `types`, `TextEncoder`, `TextDecoder`. |
| `console` / `node:console` | `log`, `info`, `debug`, `warn`, `error` (with `%s`, `%d`, `%i`, `%f`, `%j`, `%o`, `%O` formatting), `table` (ASCII box tables), `dir`, `time`, `timeLog`, `timeEnd`, `count`, `countReset`, `assert`, `group`, `groupCollapsed`, `groupEnd`, `trace`, `clear`, `Console`. |
| `url` / `node:url` | `URL`, `URLSearchParams`, `parse`, `format`, `resolve`, `fileURLToPath`, `pathToFileURL`, `domainToASCII`, `domainToUnicode`. |
| `querystring` / `node:querystring` | `parse`, `stringify`, `escape`, `unescape`, `decode`, `encode`. |
| `string_decoder` / `node:string_decoder` | `StringDecoder` (`write`, `end`). |
| `dns` / `node:dns` | `lookup`, `resolve`, `resolve4`, `resolve6`, `reverse`, `setServers`, `getServers`, `promises`. |
| `dns/promises` / `node:dns/promises` | `lookup`, `resolve`, `resolve4`, `resolve6`, `reverse`. |
| `perf_hooks` / `node:perf_hooks` | `performance` (`now`, `timeOrigin`, `mark`, `measure`, `getEntries`, `getEntriesByName`, `getEntriesByType`, `clearMarks`, `clearMeasures`, `timerify`), `PerformanceObserver`, `monitorEventLoopDelay`, `constants`. |
| `timers` / `node:timers` | `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`, `setImmediate`, `clearImmediate`, `promises` (handles support `.ref()`, `.unref()`, `.hasRef()`). |
| `timers/promises` / `node:timers/promises` | `setTimeout`, `setImmediate`. |
| `child_process` / `node:child_process` | `execSync`, `spawnSync`, `exec`, `execFile`, `spawn` (executes `node <script>`, `node -e`, `ls`, `cat`, `echo`, `pwd`, `env` against the active Virtual File System with output flood protection). |
| `assert` / `node:assert` / `node:assert/strict` | `ok`, `equal`, `notEqual`, `strictEqual`, `notStrictEqual`, `deepEqual`, `notDeepEqual`, `deepStrictEqual`, `notDeepStrictEqual`, `throws`, `doesNotThrow`, `rejects`, `doesNotReject`, `match`, `doesNotMatch`, `ifError`, `fail`, `AssertionError`. |
| `test` / `node:test` | `test`, `describe`, `suite`, `it`, `before`, `after`, `beforeEach`, `afterEach`, `mock` (`mock.fn`, `mock.method`, `mock.reset`, `mock.restoreAll`). |
| `buffer` / `node:buffer` | `Buffer` (`Uint8Array` subclass supporting `from`, `alloc`, `allocUnsafe`, `concat`, `compare`, `isBuffer`, `isEncoding`, `byteLength`, and 8/16/32/64-bit BE/LE int/float read/write methods). |
| `process` / `node:process` | `env`, `argv`, `cwd`, `chdir`, `hrtime`, `hrtime.bigint`, `nextTick`, `exit`, `stdout`, `stderr`, `stdin`, `memoryUsage`, `cpuUsage`, `uptime`, `version`, `versions`, `platform`, `arch`, `pid`, `ppid`, `EventEmitter` methods. |

---

## External NPM Package Resolution

`CodeLab` resolves non-built-in bare specifiers (e.g. `import { z } from 'zod'` or `require('lru-cache')`) through three mechanisms in priority order:

1. **Injected Packages (`options.packages` / `options.npmModules`)**:
   Pass pre-loaded objects or CommonJS source strings directly to `executeInVirtualRuntime`:
   ```js
   await executeInVirtualRuntime({
     files: { 'index.js': "const custom = require('my-pkg'); console.log(custom.hello);" },
     entry: 'index.js',
     packages: {
       'my-pkg': { hello: 'world' } // or a source string written to /workspace/node_modules/my-pkg/index.js
     }
   });
   ```
2. **Virtual `node_modules` Lookup**:
   Walks up `/workspace/**/node_modules/<pkg>` resolving `package.json` (`exports`, `main`, `module`, `browser`) and file extensions (`.js`, `.ts`, `.mjs`, `.cjs`, `.json`, `index.*`).
3. **Automatic CDN Preloading (`preloadNpmPackages` + `package.json`)**:
   Before worker execution, `CodeLabRuntime.preloadNpmPackages(files)` parses `package.json` `dependencies` and scans source files for `require('<pkg>')` / `import ... from '<pkg>'`. Missing packages are fetched from `https://cdn.jsdelivr.net/npm/<pkg>`, cached in memory, and mounted at `/workspace/node_modules/<pkg>/index.js`. In the Workbench UI, use the **Packages** modal (`workbench.showPackagesModal()`) or edit `package.json` directly to add dependencies.

---

## Specialized AI Agents (`.agents/agents/`)

This repository includes domain-specific agent specifications in `.agents/agents/` for extending, hardening, and auditing `@innovatorved/code-lab`:

- `codelab-vscode-architect.md` — VS Code Workbench UI, Command Palette, Context Menus, Breadcrumbs, Diff Viewer, and Geist Monochrome styling.
- `codelab-production-hardener.md` — Virtual Node.js Runtime, Multi-Instance Worker Concurrency, Rich `console.*` APIs, and Flood Protection.
- `codelab-feature-researcher.md` — Browser IDE & SDK Architecture Research.
- `codelab-qa-auditor.md` — End-to-End Runtime, Workbench DOM, and Bundle Verification.

---

## Building & Testing

```bash
# Generate dist/* bundles, dist/code-lab.d.ts, and site js/code-lab.js
npm run build

# Run the unit, runtime, and workbench UI test suites
npm test
node test-runtime-advanced.js
node test-workbench-ui.js
```
