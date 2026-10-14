'use strict';
/**
 * Verification Harness for Virtual Node.js Runtime (`src/runtime.js`)
 * Executes all 15 system design builds (both `demo.js` and `test.js`) inside the
 * zero-dependency in-memory Virtual Runtime and verifies 100% pass rate,
 * plus TypeScript/ESM transpilation, Virtual FS Snapshot, Virtual HTTP Trace,
 * Output Flood Protection, Expanded Node.js Stdlib Shims, and Warm Worker Pool.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const runtime = require('./src/runtime.js');
const { executeInVirtualRuntime, createWorkerRuntimeSource, transpileTS } = runtime;

const implPath = path.resolve(__dirname, '../../data/implementations_code.js');
let implementations = null;
if (fs.existsSync(implPath)) {
  const rawCodeData = fs.readFileSync(implPath, 'utf8');
  const ctx = { window: {} };
  vm.runInNewContext(rawCodeData, ctx);
  implementations = ctx.window.IMPLEMENTATIONS_DATA;
}

(async () => {
  if (implementations) {
    console.log('================================================================');
    console.log('1. VERIFYING ALL 15 BUILDS (test.js + demo.js) IN VIRTUAL RUNTIME');
    console.log('================================================================\n');

    let totalBuilds = 0;
    let passedDemos = 0;
    let passedTestSuites = 0;
    let totalIndividualTests = 0;
    let passedIndividualTests = 0;
    const failures = [];

    for (const [buildId, buildData] of Object.entries(implementations)) {
      totalBuilds++;
      const files = buildData.files;
      const testEntry = files['test.js'] ? 'test.js' : 'src/test.js';
      const demoEntry = files['demo.js'] ? 'demo.js' : 'src/demo.js';

      // Run test.js
      const testRes = await executeInVirtualRuntime({
        files,
        entry: testEntry,
        mode: 'test',
        timeoutMs: 30000
      });

      const numTests = testRes.testSummary.total;
      const numPassed = testRes.testSummary.passed;
      totalIndividualTests += numTests;
      passedIndividualTests += numPassed;

      const testOk = testRes.exitCode === 0 && testRes.testSummary.failed === 0 && numTests > 0 && !testRes.stderr;
      if (testOk) {
        passedTestSuites++;
      } else {
        failures.push({
          buildId,
          type: 'test',
          exitCode: testRes.exitCode,
          summary: testRes.testSummary,
          stderr: testRes.stderr,
          stdoutTail: testRes.stdout.slice(-500),
          failedTests: testRes.testResults.filter((t) => !t.passed)
        });
      }

      // Run demo.js
      const demoRes = await executeInVirtualRuntime({
        files,
        entry: demoEntry,
        mode: 'run',
        timeoutMs: 30000
      });

      const demoOk = demoRes.exitCode === 0 && demoRes.stdout.trim().length > 0 && !demoRes.stderr;
      if (demoOk) {
        passedDemos++;
      } else {
        failures.push({
          buildId,
          type: 'demo',
          exitCode: demoRes.exitCode,
          stderr: demoRes.stderr,
          stdoutTail: demoRes.stdout.slice(-500)
        });
      }

      console.log(
        `${testOk && demoOk ? '✅' : '❌'} ${buildId.padEnd(28)} | ` +
        `Tests: ${String(numPassed).padStart(2)}/${String(numTests).padStart(2)} (${testRes.durationMs.toFixed(0).padStart(4)} ms) | ` +
        `Demo: ${demoOk ? 'OK' : 'FAIL'} (${demoRes.durationMs.toFixed(0).padStart(4)} ms) | ` +
        `FS files: ${String(demoRes.fsSnapshot.length).padStart(2)} | ` +
        `HTTP reqs: ${String(demoRes.httpTrace.length).padStart(3)}`
      );
    }

    console.log('\n----------------------------------------------------------------');
    console.log(`Test Suites : ${passedTestSuites}/${totalBuilds} passed (${passedIndividualTests}/${totalIndividualTests} individual tests)`);
    console.log(`Demos       : ${passedDemos}/${totalBuilds} passed`);
    console.log('----------------------------------------------------------------\n');

    if (failures.length > 0) {
      console.error('FAILURES DETECTED:');
      for (const f of failures) {
        console.error(JSON.stringify(f, null, 2));
      }
      process.exit(1);
    }
  }

  console.log('================================================================');
  console.log('2. VERIFYING TYPESCRIPT (.ts), ESM, REPL & WORKER SERIALIZATION');
  console.log('================================================================\n');

  const tsProject = {
    'types.ts': `
      export interface CacheEntry<V> {
        key: string;
        value: V;
        expiresAt?: number;
      }
      export type EvictionPolicy = 'LRU' | 'FIFO';
      export enum CacheStatus {
        Ready = 1,
        Closed = 2
      }
    `,
    'store.ts': `
      import { CacheEntry, EvictionPolicy, CacheStatus } from './types';

      export class TypedStore<V> {
        private items: Map<string, CacheEntry<V>> = new Map();
        public status: CacheStatus = CacheStatus.Ready;

        constructor(public readonly capacity: number, private policy: EvictionPolicy = 'LRU') {}

        public set(key: string, value: V): void {
          if (this.items.size >= this.capacity && !this.items.has(key)) {
            const firstKey = this.items.keys().next().value as string;
            this.items.delete(firstKey);
          }
          this.items.set(key, { key, value });
        }

        public get(key: string): V | undefined {
          const entry = this.items.get(key);
          return entry ? entry.value : undefined;
        }
      }
    `,
    'test.ts': `
      import assert from 'node:assert/strict';
      import { TypedStore } from './store';
      import { CacheStatus } from './types';

      test('TypeScript generics, interfaces, enums, and parameter properties work', () => {
        const store = new TypedStore<number>(2, 'LRU');
        assert.equal(store.capacity, 2);
        assert.equal(store.status, CacheStatus.Ready);
        store.set('a', 10);
        store.set('b', 20);
        store.set('c', 30);
        assert.equal(store.get('a'), undefined);
        assert.equal(store.get('b'), 20);
        assert.equal(store.get('c'), 30);
      });
    `
  };

  const tsRes = await executeInVirtualRuntime({
    files: tsProject,
    entry: 'test.ts',
    mode: 'test'
  });
  assert.strictEqual(tsRes.exitCode, 0, `TS test failed: ${tsRes.stderr}`);
  assert.strictEqual(tsRes.testSummary.passed, 1);
  console.log('✅ TypeScript & ESM multi-file execution passed!');

  // Verify REPL mode
  const replRes = await executeInVirtualRuntime({
    files: tsProject,
    mode: 'repl',
    replCode: `
      const { TypedStore } = require('./store.ts');
      const s = new TypedStore(3);
      s.set('k1', 'hello-codelab');
      s.get('k1');
    `
  });
  assert.strictEqual(replRes.exitCode, 0);
  assert.strictEqual(replRes.replValue, 'hello-codelab');
  console.log(`✅ Interactive REPL evaluation passed! Result: ${replRes.replValue}`);

  // Verify Worker source serialization
  const workerSrc = createWorkerRuntimeSource();
  assert.ok(workerSrc.includes('__initVirtualRuntime') && workerSrc.includes('onmessage'));
  console.log(`✅ Web Worker Blob source generated cleanly (${(workerSrc.length / 1024).toFixed(1)} KB)\n`);

  console.log('================================================================');
  console.log('3. SDK & RUNTIME STRESS TESTS (FLOOD PROTECTION, STDLIB, TS)');
  console.log('================================================================\n');

  // 3.1 Output flood protection: 100,000 console.log lines must truncate gracefully in < 100ms
  const floodStart = performance.now();
  const floodRes = await executeInVirtualRuntime({
    files: {
      'flood.js': `
        for (let i = 0; i < 100000; i++) {
          console.log('line ' + i);
        }
      `
    },
    entry: 'flood.js',
    mode: 'run'
  });
  const floodElapsed = performance.now() - floodStart;
  assert.strictEqual(floodRes.exitCode, 0, `Flood test exited with ${floodRes.exitCode}: ${floodRes.stderr}`);
  assert.strictEqual(floodRes.outputTruncated, true, 'Expected outputTruncated to be true');
  assert.ok(floodRes.stdout.includes('[Output truncated: exceeded 256 KB limit]'), 'Expected truncation notice in stdout');
  assert.ok(floodElapsed < 100, `Expected flood protection to finish in < 100ms, took ${floodElapsed.toFixed(1)}ms`);
  console.log(`✅ Output flood protection passed (100,000 logs truncated in ${floodElapsed.toFixed(1)} ms)`);

  // 3.2 `node:events` EventEmitter (`on`, `once`, `off`, `emit`, `listenerCount`, `prependListener`)
  const eventsRes = await executeInVirtualRuntime({
    files: {
      'events-test.js': `
        const assert = require('node:assert/strict');
        const EventEmitter = require('node:events');
        const { EventEmitter: NamedEE } = require('events');
        assert.strictEqual(EventEmitter, NamedEE);

        const ee = new EventEmitter();
        const order = [];
        const fn1 = (x) => order.push('fn1:' + x);
        const fn2 = (x) => order.push('fn2:' + x);
        ee.on('data', fn1);
        ee.prependListener('data', fn2);
        ee.once('data', (x) => order.push('once:' + x));

        assert.strictEqual(ee.listenerCount('data'), 3);
        assert.deepStrictEqual(ee.eventNames(), ['data']);

        ee.emit('data', 'A');
        assert.deepStrictEqual(order, ['fn2:A', 'fn1:A', 'once:A']);
        assert.strictEqual(ee.listenerCount('data'), 2);

        ee.off('data', fn2);
        ee.emit('data', 'B');
        assert.deepStrictEqual(order, ['fn2:A', 'fn1:A', 'once:A', 'fn1:B']);
        ee.removeAllListeners();
        assert.strictEqual(ee.listenerCount('data'), 0);
      `
    },
    entry: 'events-test.js',
    mode: 'run'
  });
  assert.strictEqual(eventsRes.exitCode, 0, `node:events test failed: ${eventsRes.stderr}`);
  console.log('✅ node:events (on, once, off, prependListener, listenerCount, eventNames) passed');

  // 3.3 `node:test` (`describe`, `it`, `before`, `after`, `beforeEach`, `afterEach`, `mock`)
  const nodeTestRes = await executeInVirtualRuntime({
    files: {
      'node-test-suite.js': `
        const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
        const assert = require('node:assert/strict');

        const lifecycle = [];
        describe('PaymentService Suite', () => {
          let counter = 0;
          before(() => { lifecycle.push('before'); });
          after(() => { lifecycle.push('after'); });
          beforeEach(() => { counter += 10; lifecycle.push('beforeEach:' + counter); });
          afterEach(() => { lifecycle.push('afterEach:' + counter); });

          it('executes first test with mock.fn', async () => {
            const fn = mock.fn((a, b) => a + b);
            assert.strictEqual(fn(2, 3), 5);
            assert.strictEqual(fn.mock.callCount(), 1);
            assert.deepStrictEqual(fn.mock.calls[0].arguments, [2, 3]);
            assert.strictEqual(counter, 10);
          });

          it('executes second test with mock.method', async () => {
            const svc = { charge: (amt) => amt * 2 };
            const m = mock.method(svc, 'charge', (amt) => amt * 10);
            assert.strictEqual(svc.charge(4), 40);
            assert.strictEqual(m.mock.callCount(), 1);
            m.mock.restore();
            assert.strictEqual(svc.charge(4), 8);
            assert.strictEqual(counter, 20);
          });
        });
      `
    },
    entry: 'node-test-suite.js',
    mode: 'test'
  });
  assert.strictEqual(nodeTestRes.exitCode, 0, `node:test suite failed: ${nodeTestRes.stderr}`);
  assert.strictEqual(nodeTestRes.testSummary.total, 2);
  assert.strictEqual(nodeTestRes.testSummary.passed, 2);
  console.log('✅ node:test (describe, it, before, after, beforeEach, afterEach, mock) passed');

  // 3.4 `node:util`, `node:url`, `node:querystring`, `node:perf_hooks`, `node:timers/promises`
  const stdlibRes = await executeInVirtualRuntime({
    files: {
      'stdlib-test.js': `
        const assert = require('node:assert/strict');
        const util = require('node:util');
        const url = require('node:url');
        const qs = require('node:querystring');
        const { performance } = require('node:perf_hooks');
        const timersPromises = require('node:timers/promises');

        (async () => {
          // util.format & inspect
          assert.strictEqual(util.format('Hello %s #%d (%j)', 'world', 42, { ok: true }), 'Hello world #42 ({"ok":true})');
          const circular = { a: 1 };
          circular.self = circular;
          assert.ok(util.inspect(circular).includes('[Circular]'));

          // util.promisify & callbackify
          const asyncAdd = (a, b, cb) => setTimeout(() => cb(null, a + b), 2);
          const pAdd = util.promisify(asyncAdd);
          assert.strictEqual(await pAdd(7, 8), 15);

          // util.types
          assert.strictEqual(util.types.isPromise(Promise.resolve(1)), true);
          assert.strictEqual(util.types.isRegExp(/abc/), true);
          assert.strictEqual(util.types.isMap(new Map()), true);
          assert.strictEqual(util.types.isSet(new Set()), true);

          // url & querystring
          const parsed = url.parse('https://example.com:8080/p/a/t/h?k1=v1&k2=hello%20world#hash', true);
          assert.strictEqual(parsed.hostname, 'example.com');
          assert.strictEqual(parsed.port, '8080');
          assert.strictEqual(parsed.pathname, '/p/a/t/h');
          assert.strictEqual(parsed.query.k2, 'hello world');
          assert.strictEqual(qs.stringify({ a: '1', b: 'two' }), 'a=1&b=two');

          // timers/promises & perf_hooks
          const t0 = performance.now();
          const v = await timersPromises.setTimeout(5, 'ready');
          assert.strictEqual(v, 'ready');
          assert.ok(performance.now() >= t0);
        })();
      `
    },
    entry: 'stdlib-test.js',
    mode: 'run'
  });
  assert.strictEqual(stdlibRes.exitCode, 0, `stdlib test failed: ${stdlibRes.stderr}`);
  console.log('✅ node:util, node:url, node:querystring, node:perf_hooks, node:timers/promises passed');

  // 3.5 `node:stream` & `node:stream/promises` (`Readable`, `Transform`, `Writable`, `pipeline`)
  const streamRes = await executeInVirtualRuntime({
    files: {
      'stream-test.js': `
        const assert = require('node:assert/strict');
        const { Readable, Transform, Writable } = require('node:stream');
        const { pipeline } = require('node:stream/promises');

        (async () => {
          const source = Readable.from(['alpha', 'beta', 'gamma']);
          const upper = new Transform({
            transform(chunk, enc, cb) {
              cb(null, String(chunk).toUpperCase() + '|');
            }
          });
          const collected = [];
          const sink = new Writable({
            write(chunk, enc, cb) {
              collected.push(String(chunk));
              cb();
            }
          });

          await pipeline(source, upper, sink);
          assert.strictEqual(collected.join(''), 'ALPHA|BETA|GAMMA|');
        })();
      `
    },
    entry: 'stream-test.js',
    mode: 'run'
  });
  assert.strictEqual(streamRes.exitCode, 0, `node:stream test failed: ${streamRes.stderr}`);
  console.log('✅ node:stream & node:stream/promises (Readable, Transform, Writable, pipeline) passed');

  // 3.6 Hardened TypeScript Transpiler (`transpileTS`) Edge Cases
  const complexTsRes = await executeInVirtualRuntime({
    files: {
      'complex.ts': `
        import assert from 'node:assert/strict';

        declare const ENVIRONMENT_VERSION: string;
        export type Result<T> = { ok: boolean; data: T };
        export type { Result as PublicResult };

        export enum Priority {
          Low,
          Medium = 2,
          High = 'HIGH'
        }

        export abstract class BaseProcessor<T> {
          constructor(
            public readonly id: string,
            private retries: number = 3
          ) {}

          abstract process(item: T): Promise<Result<T>>;

          public getRetries(): number {
            return this.retries;
          }
        }

        export class ConcreteProcessor extends BaseProcessor<string> {
          private cache: Map<string, { val: string; next?: { val: string } }> = new Map();

          constructor(id: string) {
            super(id, 5);
            this.cache.set('k1', { val: 'v1', next: { val: 'v2' } });
          }

          public async process(
            item: string,
            prefix: string = 'P:'
          ): Promise<Result<string>> {
            const entry = this.cache.get('k1')!;
            const nextVal = entry.next!.val!;
            if (item !== '' && !item.startsWith('skip')) {
              return { ok: true, data: prefix + item + ':' + nextVal };
            }
            return { ok: false, data: '' };
          }
        }

        const identity = <T>(val: T): T => val;
        const asyncIdentity = async <T extends Record<string, any>>(
          x: T
        ): Promise<T> => x;

        (async () => {
          assert.strictEqual(Priority.Low, 0);
          assert.strictEqual(Priority[0], 'Low');
          assert.strictEqual(Priority.Medium, 2);
          assert.strictEqual(Priority[2], 'Medium');
          assert.strictEqual(Priority.High, 'HIGH');

          const proc = new ConcreteProcessor('proc-1');
          assert.strictEqual(proc.id, 'proc-1');
          assert.strictEqual(proc.getRetries(), 5);

          const res = await proc.process('hello');
          assert.deepStrictEqual(res, { ok: true, data: 'P:hello:v2' });

          assert.strictEqual(identity<number>(99), 99);
          const obj = await asyncIdentity<{ a: number }>({ a: 42 });
          assert.strictEqual(obj.a, 42);
        })();
      `
    },
    entry: 'complex.ts',
    mode: 'run'
  });
  assert.strictEqual(complexTsRes.exitCode, 0, `Hardened TS test failed: ${complexTsRes.stderr}`);
  console.log('✅ Hardened TypeScript transpiler (multi-line params, generic arrows, non-null !, abstract class, enum) passed');

  // 3.7 Warm Worker Pool + Instant Cancellation (`executeInWorker` + `cancelWorkerExecution`)
  {
    let workerCreatedCount = 0;
    let workerTerminatedCount = 0;
    class MockBrowserWorker {
      constructor() {
        workerCreatedCount++;
        this.onmessage = null;
        this.onerror = null;
      }
      postMessage(msg) {
        const { requestId, payload } = msg;
        if (payload.files && payload.files['slow.js']) {
          // Simulate long-running job that gets cancelled
          this._timer = setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({ data: { requestId, type: 'complete', result: { ok: true, exitCode: 0, stdout: 'slow\n', stderr: '' } } });
            }
          }, 5000);
          return;
        }
        setImmediate(async () => {
          const res = await executeInVirtualRuntime(payload);
          if (this.onmessage) {
            this.onmessage({ data: { requestId, type: 'complete', result: res } });
          }
        });
      }
      terminate() {
        workerTerminatedCount++;
        clearTimeout(this._timer);
      }
    }

    global.Worker = MockBrowserWorker;
    global.Blob = class MockBlob {};
    global.URL.createObjectURL = () => 'blob:mock-worker-url';

    try {
      // Run 1 & Run 2 sequentially: should reuse the SAME warm worker instance!
      const r1 = await runtime.executeInWorker({ files: { 'a.js': 'console.log("run1");' }, entry: 'a.js' });
      const r2 = await runtime.executeInWorker({ files: { 'b.js': 'console.log("run2");' }, entry: 'b.js' });
      assert.strictEqual(r1.stdout.trim(), 'run1');
      assert.strictEqual(r2.stdout.trim(), 'run2');
      assert.strictEqual(workerCreatedCount, 1, 'Expected warm Worker to be reused across sequential runs');
      assert.strictEqual(workerTerminatedCount, 0, 'Expected warm Worker not to be terminated on normal completion');

      // Start a slow run, then immediately trigger a new run -> first run must resolve cancelled!
      const slowPromise = runtime.executeInWorker({ files: { 'slow.js': 'while(true){}' }, entry: 'slow.js' });
      const fastPromise = runtime.executeInWorker({ files: { 'fast.js': 'console.log("fast-win");' }, entry: 'fast.js' });

      const [slowResult, fastResult] = await Promise.all([slowPromise, fastPromise]);
      assert.strictEqual(slowResult.ok, false);
      assert.strictEqual(slowResult.cancelled, true);
      assert.strictEqual(slowResult.error.message, 'Execution cancelled by new run');
      assert.strictEqual(fastResult.ok, true);
      assert.strictEqual(fastResult.stdout.trim(), 'fast-win');
      assert.strictEqual(workerTerminatedCount, 1, 'Expected in-flight worker to be terminated upon cancellation');
    } finally {
      delete global.Worker;
    }
  }
  console.log('✅ Warm Worker Pool reuse & instant cancellation (executeInWorker / cancelWorkerExecution) passed');

  console.log('\n🎉 ALL VERIFICATION & STRESS CHECKS PASSED 100%!');
})();
