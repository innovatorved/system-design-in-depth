# Node.js & Bun Runtime APIs

`@innovatorved/code-lab` executes JavaScript and TypeScript inside an isolated Web Worker sandbox. Code executes on the browser's native JavaScript JIT at full hardware speed (~5 ms startup).

---

## 1. Node.js Built-In Modules (24 Modules)

The following Node.js built-ins are shimmed in pure JavaScript without external dependencies:

| Module | Key Methods & Classes Supported |
| :--- | :--- |
| `fs` & `node:fs` | `readFileSync`, `writeFileSync`, `appendFileSync`, `readdirSync`, `statSync`, `lstatSync`, `existsSync`, `mkdirSync`, `rmdirSync`, `rmSync`, `unlinkSync`, `renameSync`, `truncateSync`, `openSync`, `readSync`, `writeSync`, `closeSync`, `fsyncSync`, `fstatSync`, `createReadStream`, `createWriteStream`. |
| `fs/promises` | Full promise-based async filesystem: `readFile`, `writeFile`, `appendFile`, `readdir`, `stat`, `lstat`, `mkdir`, `unlink`, `rm`, `rename`, `open` (with `FileHandle`). |
| `http` & `node:http` | In-memory loopback HTTP server and client: `createServer`, `request`, `get`, `Agent`, `Server`. Registers virtual listening ports (`:3000`, `:8080`) that can be reached via `curl` and `fetch()`. |
| `net` & `node:net` | In-memory virtual TCP loopback: `createServer`, `connect`, `createConnection`, `Socket`, `Server`, `isIP`. Used for custom binary RPC and Redis protocol engines. |
| `stream` & `node:stream`| `Readable`, `Writable`, `Duplex`, `Transform`, `PassThrough`, `pipeline`, `finished`. Fully compatible with async iterators (`for await (const chunk of stream)`). |
| `events` & `node:events`| Complete `EventEmitter` with `on`, `once`, `emit`, `removeListener`, `listenerCount`, `prependListener`. |
| `crypto` & `node:crypto`| Synchronous pure-JS implementations: `createHash('sha256' \| 'md5')`, `createHmac('sha256', key)`, `timingSafeEqual`, `randomUUID`, `randomBytes`. |
| `zlib` & `node:zlib` | IEEE 802.3 `crc32(buffer)` implementation matching POSIX and gzip specs. |
| `path` & `node:path` | `join`, `resolve`, `dirname`, `basename`, `extname`, `sep`, `delimiter`, `isAbsolute`, `normalize`. |
| `os` & `node:os` | `tmpdir()`, `platform()`, `arch()`, `homedir()`, `hostname()`, `EOL`. |
| `buffer` | Full Node `Buffer` class: `Buffer.from`, `Buffer.alloc`, `Buffer.concat`, `Buffer.byteLength`, `.readUInt32BE`, `.writeUInt32BE`, `.readBigUInt64BE`, `.toString('utf8'\|'hex'\|'base64'\|'base64url')`, `.subarray`. |
| `util` & `node:util` | `format` (printf-style `%s`, `%d`, `%j`), `inspect`, `promisify`, `callbackify`, `inherits`, `types`. |
| `url` & `node:url` | Standard `URL`, `URLSearchParams`, `fileURLToPath`, `pathToFileURL`. |
| `querystring` | `parse`, `stringify`, `escape`, `unescape`. |
| `timers` & `timers/promises` | `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`, `setImmediate`, `clearImmediate`, and `setTimeout(ms)` promise. |
| `perf_hooks` | `performance.now()`, `performance.mark()`, `performance.measure()`. |
| `assert` & `node:assert/strict` | `ok`, `equal`, `strictEqual`, `deepStrictEqual`, `notStrictEqual`, `throws`, `rejects`, `match`, `fail`. |
| `node:test` | Structured test harness with `test(name, fn)`, subtests, assertions, and per-test timing capture. |
| `process` | `process.env`, `process.argv`, `process.cwd()`, `process.uptime()`, `process.memoryUsage()`, `process.nextTick()`, `process.stdout.write()`. |
| `console` | `log`, `info`, `warn`, `error`, `table` (ASCII tables), `dir`, `time` / `timeEnd`, `count`, `group` / `groupEnd`, `trace`. |

---

## 2. Bun Runtime APIs

CodeLab supports native TypeScript execution and implements Bun-standard APIs:

### `Bun.serve({ port, fetch, routes })`
Start high-performance HTTP servers directly in the browser:
```ts
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Not Found', { status: 404 });
  }
});
```

### `Bun.file(path)` & `Bun.write(path, data)`
Read and write virtual files with Web standard streams and blobs:
```ts
// Write file
await Bun.write('config.json', JSON.stringify({ rateLimit: 100 }));

// Read file
const file = Bun.file('config.json');
const data = await file.json();
console.log(data.rateLimit); // 100
```

### Additional `Bun.*` Utilities
- `Bun.sleep(ms)`: Promise that resolves after `ms` milliseconds.
- `Bun.hash(data)`: Fast 64-bit non-cryptographic hash.
- `Bun.deepEquals(a, b)`: Deep structural equality check.
- `Bun.version`: Current Bun compatibility version string (`"1.1.20"`).

### `bun:test`
Standard Jest / Vitest-compatible test assertions:
```ts
import { describe, test, it, expect, beforeEach } from 'bun:test';

describe('Consistent Hash Ring', () => {
  test('distributes keys evenly', () => {
    expect(ring.getNode('user:101')).toBe('node-a');
    expect([1, 2, 3]).toContain(2);
    expect(() => ring.removeNode('nonexistent')).toThrow();
  });
});
```

### `bun:sqlite`
In-memory SQLite emulator for system design challenges:
```ts
import { Database } from 'bun:sqlite';

const db = new Database(':memory:');
db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);');
db.run('INSERT INTO users (name) VALUES (?), (?);', ['Alice', 'Bob']);

const users = db.query('SELECT * FROM users;').all();
console.log(users);
```

---

## 3. Package Management (`npm` & `bun add`)

CodeLab resolves external bare specifiers (`import lodash from 'lodash'` or `require('zod')`) on the fly:

1. **Terminal Command**: Run `npm install <pkg>` or `bun add <pkg>` in the integrated terminal:
   ```bash
   npm install zod
   bun add nanoid
   ```
2. **Auto-Fetch**: CodeLab fetches pre-bundled ESM/CJS builds from `esm.sh` or `cdn.jsdelivr.net` and writes them into `/workspace/node_modules/<pkg>`.
3. **`package.json` Sync**: CodeLab automatically adds the package to dependencies in `/workspace/package.json` and updates the file tree.
