'use strict';

const assert = require('node:assert/strict');
const runtime = require('./src/runtime.js');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${name}`);
      console.error(`    ${err && err.stack ? err.stack : err}`);
    }
  }

  console.log('=== CodeLab Advanced Runtime Verification Suite ===\n');

  // 1. TypeScript Transpiler: Regex literal masking, comments in enums, satisfies, as { ... }, derived constructor parameter properties, export *
  await check('TS: Regex literals with //, !, and : are preserved intact', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.ts',
      files: {
        'index.ts': `
          const urlRegex: RegExp = /^https?:\\/\\/[a-z0-9.-]+(:\\d+)?\\/path!$/i;
          const bangRegex = /hello!world/g;
          console.log(urlRegex.test('https://example.com:8080/path!'));
          console.log(bangRegex.test('hello!world'));
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), 'true\ntrue');
  });

  await check('TS: Enum with single-line and multi-line comments inside body', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.ts',
      files: {
        'index.ts': `
          export enum HttpStatus {
            // Informational
            Continue = 100,
            /* Success
               codes */
            OK = 200,
            Created, // 201
            BadRequest = 'BAD_REQ' // string enum member
          }
          console.log(HttpStatus.Continue, HttpStatus.OK, HttpStatus.Created, HttpStatus.BadRequest, HttpStatus[200]);
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), '100 200 201 BAD_REQ OK');
  });

  await check('TS: Multi-line import type / export type, satisfies, and complex as { ... } casts', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.ts',
      files: {
        'types.ts': `
          export interface Config {
            host: string;
            port: number;
          }
        `,
        'index.ts': `
          import type {
            Config
          } from './types';
          export type {
            Config
          };

          const raw: unknown = { host: 'localhost', port: 3000 };
          const cfg = (raw as { host: string; port: number }) satisfies Config;
          const list = [1, 2, 3] as Array<{ id: number } | number>;
          console.log(cfg.host + ':' + cfg.port + ':' + list.length);
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), 'localhost:3000:3');
  });

  await check('TS: Derived class constructor parameter properties after super(...)', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.ts',
      files: {
        'index.ts': `
          class Base {
            constructor(public readonly id: string) {}
          }
          class Derived extends Base {
            constructor(
              id: string,
              private count: number = 5,
              protected label: string = 'item'
            ) {
              super(id);
            }
            summary(): string {
              return \`\${this.id}:\${this.label}:\${this.count}\`;
            }
          }
          const d = new Derived('abc', 42, 'widget');
          console.log(d.summary());
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), 'abc:widget:42');
  });

  await check('TS: Non-null assertions with generic calls fn!<T>() and fn<T>()!', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.ts',
      files: {
        'index.ts': `
          function identity<T>(val: T): T { return val; }
          const fn: typeof identity | null = identity;
          const a = fn!<string>('alpha');
          const b = identity<string>('beta')!;
          console.log(a, b);
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), 'alpha beta');
  });

  await check('TS: ESM export *, export * as ns, and export default class + named export interop', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'main.ts',
      files: {
        'math.ts': `
          export const PI = 3.14;
          export function double(x: number): number { return x * 2; }
        `,
        'logger.ts': `
          export default class Logger {
            constructor(public prefix: string) {}
            format(msg: string) { return \`[\${this.prefix}] \${msg}\`; }
          }
          export const DEFAULT_PREFIX = 'APP';
          export function makeDefaultLogger() {
            return new Logger(DEFAULT_PREFIX);
          }
        `,
        'barrel.ts': `
          export * from './math';
          export * as mathNs from './math';
        `,
        'main.ts': `
          import Logger, { DEFAULT_PREFIX, makeDefaultLogger } from './logger';
          import { PI, double, mathNs } from './barrel';
          const l1 = new Logger(DEFAULT_PREFIX);
          const l2 = makeDefaultLogger();
          console.log(l1.format('hi'), l2.format('ok'), PI, double(7), mathNs.double(3));
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), '[APP] hi [APP] ok 3.14 14 6');
  });

  // 2. Virtual FS: fs/promises, async callback methods, streams, FileHandle
  await check('VFS: fs/promises (writeFile, readFile, mkdir, readdir, stat, copyFile, open FileHandle)', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.js',
      files: {
        'index.js': `
          const fsp = require('node:fs/promises');
          const fs = require('node:fs');

          async function main() {
            await fsp.mkdir('/workspace/data/nested', { recursive: true });
            await fsp.writeFile('/workspace/data/nested/hello.txt', 'Hello Async FS!');
            await fsp.copyFile('/workspace/data/nested/hello.txt', '/workspace/data/nested/copy.txt');
            const text = await fsp.readFile('/workspace/data/nested/copy.txt', 'utf8');

            const fh = await fsp.open('/workspace/data/nested/handle.txt', 'w+');
            await fh.writeFile('HandleContent');
            const hText = await fh.readFile('utf8');
            await fh.close();

            // Stream test
            const chunks = [];
            await new Promise((resolve, reject) => {
              const rs = fs.createReadStream('/workspace/data/nested/hello.txt', { encoding: 'utf8', highWaterMark: 5 });
              rs.on('data', (c) => chunks.push(c));
              rs.on('end', resolve);
              rs.on('error', reject);
            });

            console.log(text, '|', hText, '|', chunks.join(''));
          }
          main();
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), 'Hello Async FS! | HandleContent | Hello Async FS!');
  });

  // 3. Virtual Net: In-memory TCP loopback server & client
  await check('Net: In-memory loopback TCP Server and Socket bidirectional streaming', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.js',
      files: {
        'index.js': `
          const net = require('node:net');
          assertIP();
          function assertIP() {
            if (net.isIP('127.0.0.1') !== 4 || net.isIP('::1') !== 6 || net.isIP('bad') !== 0) {
              throw new Error('net.isIP failed');
            }
          }

          const server = net.createServer((socket) => {
            socket.on('data', (data) => {
              socket.write('ECHO:' + data.toString().toUpperCase());
              socket.end();
            });
          });

          server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
              client.write('ping-tcp');
            });
            let received = '';
            client.on('data', (chunk) => {
              received += chunk.toString();
            });
            client.on('end', () => {
              console.log('TCP_RESULT=' + received);
              server.close();
            });
          });
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), 'TCP_RESULT=ECHO:PING-TCP');
    assert.equal(res.httpTrace.some((t) => t.protocol === 'TCP'), true);
  });

  // 4. StringDecoder, DNS, URL.resolve, Util.isDeepStrictEqual, PerfHooks
  await check('Built-ins: string_decoder, dns/promises, url.resolve, util.isDeepStrictEqual, perf_hooks', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.js',
      files: {
        'index.js': `
          const { StringDecoder } = require('node:string_decoder');
          const dns = require('node:dns');
          const dnsPromises = require('node:dns/promises');
          const url = require('node:url');
          const util = require('node:util');
          const { performance, PerformanceObserver } = require('node:perf_hooks');

          async function main() {
            // Multi-byte euro sign € (0xE2 0x82 0xAC) split across chunks
            const decoder = new StringDecoder('utf8');
            const part1 = decoder.write(Buffer.from([0xE2, 0x82]));
            const part2 = decoder.write(Buffer.from([0xAC]));
            const euro = part1 + part2 + decoder.end();

            // DNS
            const lookupRes = await dnsPromises.lookup('localhost');
            const v4 = await dnsPromises.resolve4('example.com');

            // URL.resolve
            const resolvedUrl = url.resolve('https://example.com/dir/page.html', '../other/file.js');

            // util.isDeepStrictEqual
            const eq1 = util.isDeepStrictEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] });
            const eq2 = util.isDeepStrictEqual({ a: 1 }, { a: '1' });

            // perf_hooks
            const observed = [];
            const obs = new PerformanceObserver((list) => {
              observed.push(...list.getEntries().map((e) => e.name));
            });
            obs.observe({ entryTypes: ['mark', 'measure'] });
            performance.mark('start-work');
            performance.mark('end-work');
            performance.measure('work-duration', 'start-work', 'end-work');
            obs.disconnect();

            console.log(JSON.stringify({
              euro,
              ip: lookupRes.address,
              v4: v4[0],
              resolvedUrl,
              eq1,
              eq2,
              observed
            }));
          }
          main();
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    const data = JSON.parse(res.stdout.trim());
    assert.equal(data.euro, '€');
    assert.equal(data.ip, '127.0.0.1');
    assert.equal(data.v4, '93.184.216.34');
    assert.equal(data.resolvedUrl, 'https://example.com/other/file.js');
    assert.equal(data.eq1, true);
    assert.equal(data.eq2, false);
    assert.deepEqual(data.observed, ['start-work', 'end-work', 'work-duration']);
  });

  // 5. Child Process & Process EventEmitter
  await check('ChildProcess & Process: execSync / exec running node scripts in VFS + process EventEmitter', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'index.js',
      files: {
        'worker-script.ts': `
          const arg: string = process.argv[2] || 'default';
          console.log('WORKER_RAN:' + arg.toUpperCase());
        `,
        'index.js': `
          const cp = require('node:child_process');
          const util = require('node:util');
          const execAsync = util.promisify(cp.exec);

          process.on('warning', (w) => {
            console.log('GOT_WARN:' + w.message);
          });

          async function main() {
            process.emitWarning('custom-warning');
            const out1 = cp.execSync('node worker-script.ts hello', { encoding: 'utf8' }).trim();
            const { stdout: out2 } = await execAsync('echo async-shell-ok');
            console.log(out1 + '|' + out2.trim() + '|pid=' + process.pid);
          }
          main();
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    const lines = res.stdout.trim().split('\n');
    assert.equal(lines[0], 'GOT_WARN:custom-warning');
    assert.equal(lines[1], 'WORKER_RAN:HELLO|async-shell-ok|pid=1000');
  });

  // 6. NPM / node_modules & package.json exports resolution + options.packages injection
  await check('Module Resolution: node_modules package.json exports/subpaths and options.packages injection', async () => {
    const res = await runtime.executeInVirtualRuntime({
      entry: 'src/app.ts',
      packages: {
        'virtual-lodash': {
          chunk(arr, size) {
            const out = [];
            for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
            return out;
          }
        },
        'virtual-str-pkg': `module.exports = { greet: (n) => 'Hi ' + n };`
      },
      files: {
        'node_modules/@acme/toolkit/package.json': JSON.stringify({
          name: '@acme/toolkit',
          version: '1.0.0',
          exports: {
            '.': { require: './dist/index.js', default: './dist/index.js' },
            './math': './dist/math.ts'
          }
        }),
        'node_modules/@acme/toolkit/dist/index.js': `
          module.exports = { name: 'acme-toolkit' };
        `,
        'node_modules/@acme/toolkit/dist/math.ts': `
          export function cube(n: number): number { return n * n * n; }
        `,
        'src/app.ts': `
          import toolkit from '@acme/toolkit';
          import { cube } from '@acme/toolkit/math';
          const _ = require('virtual-lodash');
          const strPkg = require('virtual-str-pkg');

          console.log(toolkit.name, cube(3), JSON.stringify(_.chunk([1, 2, 3, 4], 2)), strPkg.greet('Coder'));
        `
      }
    });
    assert.equal(res.ok, true, res.stderr);
    assert.equal(res.stdout.trim(), 'acme-toolkit 27 [[1,2],[3,4]] Hi Coder');
  });

  console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();
