# Headless Runtime (No UI Execution)

You can use `@innovatorved/code-lab/runtime` to execute JavaScript, TypeScript, test suites, or bash scripts programmatically without rendering the Monaco editor or any UI components.

Use cases include:
- Automated code graders and coding interview platforms
- Interactive documentation documentation runners (like MDX or Starlight)
- In-browser sandbox evaluations for AI coding agents

---

## 1. Importing the Headless Runtime

```js
// ESM
import { executeInWorker, executeInVirtualRuntime } from '@innovatorved/code-lab/runtime';

// CommonJS
const { executeInWorker, executeInVirtualRuntime } = require('@innovatorved/code-lab/runtime');
```

---

## 2. API Signature: `executeInWorker(options)`

```ts
interface CodeLabExecutionOptions {
  files: Record<string, string>;       // Virtual filesystem map
  entry?: string;                     // Script to run (default: 'demo.js')
  mode?: 'run' | 'test' | 'repl';     // Execution mode
  replCode?: string;                  // Expression to evaluate in REPL mode
  testFilter?: string | string[];     // Filter tests by substring or array of names
  timeoutMs?: number;                 // Watchdog execution timeout (default: 8000ms)
  instanceId?: string;                // Isolated worker instance ID
  onStdout?: (text: string) => void;  // Real-time stdout stream
  onStderr?: (text: string) => void;  // Real-time stderr stream
  onTestResult?: (res: TestResultItem) => void; // Real-time test event callback
}
```

---

## 3. Running Scripts (`mode: 'run'`)

```js
import { executeInWorker } from '@innovatorved/code-lab/runtime';

const res = await executeInWorker({
  mode: 'run',
  entry: 'app.ts',
  files: {
    'app.ts': `
      const message: string = "Hello from Web Worker Sandbox";
      console.log(message);
    `
  },
  onStdout: (chunk) => process.stdout.write(chunk)
});

console.log(res.ok);         // true
console.log(res.exitCode);   // 0
console.log(res.stdout);     // "Hello from Web Worker Sandbox\n"
console.log(res.durationMs); // 4 (milliseconds)
```

---

## 4. Running Test Suites (`mode: 'test'`)

```js
const res = await executeInWorker({
  mode: 'test',
  entry: 'test.js',
  files: {
    'lru.js': `
      class LRUCache {
        constructor(cap) { this.cap = cap; this.cache = new Map(); }
        get(key) {
          if (!this.cache.has(key)) return -1;
          const val = this.cache.get(key);
          this.cache.delete(key);
          this.cache.set(key, val);
          return val;
        }
        put(key, val) {
          if (this.cache.has(key)) this.cache.delete(key);
          else if (this.cache.size >= this.cap) this.cache.delete(this.cache.keys().next().value);
          this.cache.set(key, val);
        }
      }
      module.exports = { LRUCache };
    `,
    'test.js': `
      const { test } = require('node:test');
      const assert = require('node:assert/strict');
      const { LRUCache } = require('./lru');

      test('evicts least recently used item', () => {
        const lru = new LRUCache(2);
        lru.put(1, 1);
        lru.put(2, 2);
        assert.equal(lru.get(1), 1);
        lru.put(3, 3); // evicts 2
        assert.equal(lru.get(2), -1);
      });
    `
  }
});

console.log('Passed:', res.ok);
for (const t of res.testResults) {
  console.log(`- [${t.status.toUpperCase()}] ${t.name} (${t.durationMs}ms)`);
}
```

---

## 5. Cancelling In-Flight Execution

To abort a long-running or infinite loop script:

```js
import { cancelWorkerExecution } from '@innovatorved/code-lab/runtime';

// Terminate execution
cancelWorkerExecution('User cancelled operation');
```
