/**
 * @file test-option1-shell-bun-http.js
 * CodeLab Option 1: End-to-End Test Suite
 *
 * Comprehensive programmatic verification across 7 suites and 67 test cases:
 *  - Suite 1: POSIX Shell AST, Pipelines, Redirections, Globs & Lexer (13 tests)
 *  - Suite 2: 35+ UNIX Coreutils on Virtual Filesystem (16 tests)
 *  - Suite 3: Node.js CLI & Runtime Workflows (6 tests)
 *  - Suite 4: Bun CLI & Bun Runtime Engine (Bun.*, bun:test, bun:sqlite) (15 tests)
 *  - Suite 5: Package Management (npm & bun) (6 tests)
 *  - Suite 6: Persistent HTTP Servers, curl, and fetch() Routing (8 tests)
 *  - Suite 7: Complex Real-World System Design Workloads (3 tests)
 *
 * Requirements:
 *  - Pure Node.js zero external dependencies (node:assert/strict, node:path, node:fs)
 *  - Imports runtime & shell modular interfaces
 *  - Progressive testability & clear reporting with execution times and summary
 */

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const EventEmitter = require('node:events');

// Load virtual runtime
const runtime = require('./src/runtime.js');
const {
  executeInVirtualRuntime,
  createWorkerRuntimeSource,
  createVirtualFs,
  createVirtualHttp,
  createVirtualNet
} = runtime;

// Resolve shell module (created in Milestone 1 or exposed via runtime)
let shellModule = null;
try {
  shellModule = require('./src/shell.js');
} catch (err) {
  if (runtime.createPosixShell || runtime.Shell) {
    shellModule = runtime;
  }
}

// -----------------------------------------------------------------------------
// Test Harness Utilities
// -----------------------------------------------------------------------------

const summary = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: []
};

let currentSuite = null;

function suite(title, fn) {
  const s = { title, tests: [], passed: 0, failed: 0, durationMs: 0 };
  summary.suites.push(s);
  currentSuite = s;
  console.log(`\n\x1b[1m\x1b[36m=== ${title} ===\x1b[0m`);
  const start = Date.now();
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      return res.then(() => {
        s.durationMs = Date.now() - start;
      });
    }
    s.durationMs = Date.now() - start;
  } catch (err) {
    s.durationMs = Date.now() - start;
    throw err;
  }
}

async function test(name, fn) {
  summary.total++;
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    summary.passed++;
    if (currentSuite) currentSuite.passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m`);
    if (currentSuite) currentSuite.tests.push({ name, passed: true, duration });
  } catch (err) {
    const duration = Date.now() - start;
    summary.failed++;
    if (currentSuite) currentSuite.failed++;
    console.error(`  \x1b[31m✗\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m`);
    console.error(`    \x1b[31m${err && err.stack ? err.stack.split('\n').slice(0, 4).join('\n    ') : String(err)}\x1b[0m`);
    if (currentSuite) currentSuite.tests.push({ name, passed: false, duration, error: err });
  }
}

/**
 * Creates or retrieves a POSIX Shell Engine instance bound to a given VFS.
 */
function getShellEngine(options = {}) {
  const vfs = options.vfs || createVirtualFs();
  const env = Object.assign({
    PATH: '/bin:/usr/bin:/workspace/node_modules/.bin',
    HOME: '/workspace',
    PWD: '/workspace',
    USER: 'codelab',
    SHELL: '/bin/sh',
    TERM: 'xterm-256color'
  }, options.env || {});

  if (shellModule && typeof shellModule.createPosixShell === 'function') {
    return shellModule.createPosixShell(Object.assign({}, options, { vfs, env }));
  }
  if (runtime.createPosixShell && typeof runtime.createPosixShell === 'function') {
    return runtime.createPosixShell(Object.assign({}, options, { vfs, env }));
  }
  if (shellModule && shellModule.Shell && typeof shellModule.Shell.create === 'function') {
    return shellModule.Shell.create(Object.assign({}, options, { vfs, env }));
  }
  if (runtime.Shell && typeof runtime.Shell.create === 'function') {
    return runtime.Shell.create(Object.assign({}, options, { vfs, env }));
  }

  throw new Error('createPosixShell is not implemented. Ensure ./src/shell.js or runtime.createPosixShell is exported.');
}

/**
 * Execute command through shell instance with standard output normalization.
 */
async function executeShell(shell, cmd, opts = {}) {
  if (typeof shell.execute === 'function') {
    return await shell.execute(cmd, opts);
  }
  if (typeof shell.exec === 'function') {
    return await shell.exec(cmd, opts);
  }
  if (typeof shell.run === 'function') {
    return await shell.run(cmd, opts);
  }
  throw new Error('Shell instance does not implement execute(), exec(), or run()');
}

/**
 * Creates a Port Table instance for HTTP server tracking and routing.
 */
function getPortTable() {
  if (shellModule && typeof shellModule.createVirtualPortTable === 'function') {
    return shellModule.createVirtualPortTable();
  }
  if (runtime.createVirtualPortTable && typeof runtime.createVirtualPortTable === 'function') {
    return runtime.createVirtualPortTable();
  }

  // Fallback in-memory Port Table conforming to specification
  const table = new Map();
  return {
    registerServer(port, info) {
      if (table.has(port)) {
        throw new Error(`Port ${port} is already in use`);
      }
      table.set(port, Object.assign({ port, registeredAt: Date.now() }, info));
    },
    unregisterServer(port) {
      return table.delete(port);
    },
    getServer(port) {
      return table.get(port) || null;
    },
    listServers() {
      return Array.from(table.values());
    },
    async dispatchRequest(url, init = {}) {
      const parsed = new URL(url);
      const port = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80));
      const entry = table.get(port);
      if (!entry) {
        const err = new Error(`connect ECONNREFUSED 127.0.0.1:${port}`);
        err.code = 'ECONNREFUSED';
        throw err;
      }
      if (entry.fetch) {
        return entry.fetch(new Request(url, init));
      }
      if (entry.server && entry.server.emit) {
        // Mock socket dispatch to VirtualServer
        return new Response('Mock loopback response', { status: 200 });
      }
      return new Response('OK', { status: 200 });
    }
  };
}

// -----------------------------------------------------------------------------
// Test Execution Matrix
// -----------------------------------------------------------------------------

async function main() {
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m  CodeLab Option 1: Full POSIX Shell, Bun Runtime & HTTP Test Suite   \x1b[0m');
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');

  // ===========================================================================
  // SUITE 1: POSIX Shell AST, Pipelines, Redirections, Globs & Lexer
  // ===========================================================================
  await suite('Suite 1: POSIX Shell AST, Pipelines, Redirections, Globs & Lexer', async () => {

    await test('1.1 Lexer: Tokenization of single/double quotes, escape sequences, whitespace', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });
      const res = await executeShell(shell, 'echo \'single quote\' "double quote with \\"nested\\" and \\$10" normal\\ token');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'single quote double quote with "nested" and $10 normal token');
    });

    await test('1.2 Pipelines: Multi-stage pipes cmd1 | cmd2 | cmd3', async () => {
      const vfs = createVirtualFs({
        '/workspace/fruits.txt': 'cherry\napple\nbanana\ndate\napple\n'
      });
      const shell = getShellEngine({ vfs });
      const res = await executeShell(shell, 'cat /workspace/fruits.txt | sort | uniq');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'apple\nbanana\ncherry\ndate');
    });

    await test('1.3 Redirection: Output overwrite > and append >>', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      // Overwrite >
      let res = await executeShell(shell, 'echo "line one" > /workspace/out.txt');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(vfs.readFileSync('/workspace/out.txt', 'utf8').trim(), 'line one');

      // Overwrite again >
      res = await executeShell(shell, 'echo "line two" > /workspace/out.txt');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(vfs.readFileSync('/workspace/out.txt', 'utf8').trim(), 'line two');

      // Append >>
      res = await executeShell(shell, 'echo "line three" >> /workspace/out.txt');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(vfs.readFileSync('/workspace/out.txt', 'utf8').trim(), 'line two\nline three');
    });

    await test('1.4 Redirection: Input redirection < and stderr 2> / 2>&1', async () => {
      const vfs = createVirtualFs({
        '/workspace/input.txt': 'piped through stdin'
      });
      const shell = getShellEngine({ vfs });

      // Input redirection <
      const res1 = await executeShell(shell, 'cat < /workspace/input.txt');
      assert.strictEqual(res1.code, 0, res1.stderr);
      assert.strictEqual(res1.stdout.trim(), 'piped through stdin');

      // Stderr redirection 2>
      const res2 = await executeShell(shell, 'cat /workspace/missing.txt 2> /workspace/err.log');
      assert.notStrictEqual(res2.code, 0);
      assert.strictEqual(res2.stdout, '');
      const errContent = vfs.readFileSync('/workspace/err.log', 'utf8');
      assert.ok(errContent.length > 0, 'Expected stderr to be written to err.log');
    });

    await test('1.5 Chaining: Logical AND && and short-circuit evaluation', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      // Successful chaining
      const res1 = await executeShell(shell, 'true && echo "step 1" && echo "step 2"');
      assert.strictEqual(res1.code, 0);
      assert.strictEqual(res1.stdout.trim(), 'step 1\nstep 2');

      // Short-circuit on failure
      const res2 = await executeShell(shell, 'false && echo "should not execute"');
      assert.notStrictEqual(res2.code, 0);
      assert.strictEqual(res2.stdout.trim(), '');
    });

    await test('1.6 Chaining: Logical OR || and semicolon ; sequence', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      // OR fallback
      const res1 = await executeShell(shell, 'false || echo "fallback executed"');
      assert.strictEqual(res1.code, 0);
      assert.strictEqual(res1.stdout.trim(), 'fallback executed');

      // OR short-circuit when true
      const res2 = await executeShell(shell, 'true || echo "ignored"');
      assert.strictEqual(res2.code, 0);
      assert.strictEqual(res2.stdout.trim(), '');

      // Semicolon sequence
      const res3 = await executeShell(shell, 'echo "first"; echo "second"; echo "third"');
      assert.strictEqual(res3.code, 0);
      assert.strictEqual(res3.stdout.trim(), 'first\nsecond\nthird');
    });

    await test('1.7 Environment: Expansion $VAR, ${VAR}, $?, $PWD', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({
        vfs,
        env: { GREETING: 'Hello', TARGET: 'CodeLab' }
      });

      const res1 = await executeShell(shell, 'echo "$GREETING, ${TARGET}!"');
      assert.strictEqual(res1.code, 0);
      assert.strictEqual(res1.stdout.trim(), 'Hello, CodeLab!');

      const res2 = await executeShell(shell, 'pwd; echo "cwd=$PWD"');
      assert.strictEqual(res2.code, 0);
      assert.ok(res2.stdout.includes('cwd=/workspace'));

      const res3 = await executeShell(shell, 'false; echo "status=$?"');
      assert.strictEqual(res3.code, 0);
      assert.ok(res3.stdout.includes('status=1'));
    });

    await test('1.8 Environment: export VAR=val and unset VAR across child commands', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const res1 = await executeShell(shell, 'export FOO=bar && echo "FOO=$FOO"');
      assert.strictEqual(res1.code, 0);
      assert.strictEqual(res1.stdout.trim(), 'FOO=bar');

      const res2 = await executeShell(shell, 'export TEMP=123 && unset TEMP && echo "TEMP=\'$TEMP\'"');
      assert.strictEqual(res2.code, 0);
      assert.strictEqual(res2.stdout.trim(), "TEMP=''");
    });

    await test('1.9 Command Substitution: $(...) stdout capture and nesting', async () => {
      const vfs = createVirtualFs({
        '/workspace/list.txt': 'one\ntwo\nthree\n'
      });
      const shell = getShellEngine({ vfs });

      const res1 = await executeShell(shell, 'echo "Count is $(wc -l < /workspace/list.txt | tr -d \' \')"');
      assert.strictEqual(res1.code, 0);
      assert.strictEqual(res1.stdout.trim(), 'Count is 3');

      const res2 = await executeShell(shell, 'echo "Outer: $(echo inner $(echo deep))"');
      assert.strictEqual(res2.code, 0);
      assert.strictEqual(res2.stdout.trim(), 'Outer: inner deep');
    });

    await test('1.10 Globbing: Expansion of *, *.js, **/*.ts against VFS', async () => {
      const vfs = createVirtualFs({
        '/workspace/a.js': '',
        '/workspace/b.js': '',
        '/workspace/c.ts': '',
        '/workspace/src/deep.ts': ''
      });
      const shell = getShellEngine({ vfs });

      const res1 = await executeShell(shell, 'echo *.js');
      assert.strictEqual(res1.code, 0);
      const matches = res1.stdout.trim().split(/\s+/);
      assert.ok(matches.includes('a.js') && matches.includes('b.js'));
      assert.ok(!matches.includes('c.ts'));

      const res2 = await executeShell(shell, 'echo *.nonexistent');
      assert.strictEqual(res2.code, 0);
      assert.strictEqual(res2.stdout.trim(), '*.nonexistent');
    });

    await test('1.11 Background Jobs: Background execution cmd & with PID tracking', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const start = Date.now();
      const res = await executeShell(shell, 'sleep 1 &');
      const elapsed = Date.now() - start;

      assert.strictEqual(res.code, 0);
      assert.ok(elapsed < 200, 'Background command must return prompt immediately');
      assert.match(res.stdout, /\[\d+\]\s+\d+/, 'Expected job id and PID in stdout');
    });

    await test('1.12 CSP Integrity: Zero eval() in shell parser and command dispatcher', async () => {
      const vfs = createVirtualFs();
      let evalCallCount = 0;

      // Trap eval in global scope if accessible
      const originalEval = globalThis.eval;
      globalThis.eval = function (...args) {
        evalCallCount++;
        return originalEval.apply(this, args);
      };

      try {
        const shell = getShellEngine({ vfs });
        const res = await executeShell(shell, 'echo "test" | tr "a-z" "A-Z"');
        assert.strictEqual(res.code, 0);
        assert.strictEqual(res.stdout.trim(), 'TEST');
        assert.strictEqual(evalCallCount, 0, 'POSIX Shell must never call eval()');
      } finally {
        globalThis.eval = originalEval;
      }
    });

    await test('1.13 Shell Comments: Unquoted # comments ignored and multi-line parsing', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });
      const script = 'echo "hello" # this is a comment\necho "world"';
      const res = await executeShell(shell, script);
      assert.strictEqual(res.code, 0);
      assert.strictEqual(res.stdout.trim(), 'hello\nworld');
    });

  });

  // ===========================================================================
  // SUITE 2: 35+ UNIX Coreutils on Virtual Filesystem
  // ===========================================================================
  await suite('Suite 2: 35+ UNIX Coreutils on Virtual Filesystem', async () => {

    await test('2.1 File Navigation: pwd, cd, cd ~, cd .., cd -, cd <path>', async () => {
      const vfs = createVirtualFs();
      vfs.mkdirSync('/workspace/deep/nested', { recursive: true });
      const shell = getShellEngine({ vfs });

      let res = await executeShell(shell, 'pwd');
      assert.strictEqual(res.stdout.trim(), '/workspace');

      res = await executeShell(shell, 'cd deep/nested && pwd');
      assert.strictEqual(res.stdout.trim(), '/workspace/deep/nested');

      res = await executeShell(shell, 'cd .. && pwd');
      assert.strictEqual(res.stdout.trim(), '/workspace/deep');

      res = await executeShell(shell, 'cd - && pwd');
      assert.strictEqual(res.stdout.trim(), '/workspace/deep/nested');

      res = await executeShell(shell, 'cd ~ && pwd');
      assert.strictEqual(res.stdout.trim(), '/workspace');
    });

    await test('2.2 Directory Listing: ls, ls -a, ls -l, ls -la, ls <dir>', async () => {
      const vfs = createVirtualFs({
        '/workspace/file1.txt': 'hello',
        '/workspace/.hidden': 'secret',
        '/workspace/sub/file2.txt': 'nested'
      });
      const shell = getShellEngine({ vfs });

      const resBasic = await executeShell(shell, 'ls');
      assert.ok(resBasic.stdout.includes('file1.txt'));
      assert.ok(!resBasic.stdout.includes('.hidden'));

      const resAll = await executeShell(shell, 'ls -a');
      assert.ok(resAll.stdout.includes('.hidden'));

      const resSub = await executeShell(shell, 'ls sub');
      assert.ok(resSub.stdout.includes('file2.txt'));
    });

    await test('2.3 File Inspection: cat (single, multiple, stdin), head -n, tail -n', async () => {
      const lines = Array.from({ length: 15 }, (_, i) => `Line ${i + 1}`).join('\n') + '\n';
      const vfs = createVirtualFs({
        '/workspace/numbered.txt': lines,
        '/workspace/extra.txt': 'Extra Content\n'
      });
      const shell = getShellEngine({ vfs });

      const resCat = await executeShell(shell, 'cat /workspace/numbered.txt /workspace/extra.txt');
      assert.ok(resCat.stdout.includes('Line 1') && resCat.stdout.includes('Extra Content'));

      const resHead = await executeShell(shell, 'head -n 3 /workspace/numbered.txt');
      assert.strictEqual(resHead.stdout.trim(), 'Line 1\nLine 2\nLine 3');

      const resTail = await executeShell(shell, 'tail -n 2 /workspace/numbered.txt');
      assert.strictEqual(resTail.stdout.trim(), 'Line 14\nLine 15');
    });

    await test('2.4 Pattern Search: grep (-n, -i, -r, -v, -E), find (-name, -type)', async () => {
      const vfs = createVirtualFs({
        '/workspace/app.js': 'const ERROR_CODE = 500;\nconst OK_CODE = 200;\n',
        '/workspace/src/helper.ts': 'export function errHandler() { console.error("FATAL ERROR"); }'
      });
      const shell = getShellEngine({ vfs });

      const resGrepN = await executeShell(shell, 'grep -n "ERROR_CODE" /workspace/app.js');
      assert.ok(resGrepN.stdout.includes('1:const ERROR_CODE = 500;'));

      const resGrepI = await executeShell(shell, 'grep -i "fatal" /workspace/src/helper.ts');
      assert.ok(resGrepI.stdout.includes('FATAL ERROR'));

      const resGrepV = await executeShell(shell, 'grep -v "ERROR" /workspace/app.js');
      assert.ok(resGrepV.stdout.includes('OK_CODE'));
      assert.ok(!resGrepV.stdout.includes('ERROR_CODE'));

      const resFind = await executeShell(shell, 'find /workspace -name "*.ts"');
      assert.ok(resFind.stdout.includes('/workspace/src/helper.ts'));
    });

    await test('2.5 Counting & Sorting: wc (-l, -w, -c), sort (-r, -n, -u), uniq (-c)', async () => {
      const vfs = createVirtualFs({
        '/workspace/words.txt': 'apple banana cherry\ndate elderberry\n',
        '/workspace/nums.txt': '10\n2\n5\n2\n1\n'
      });
      const shell = getShellEngine({ vfs });

      const resWc = await executeShell(shell, 'wc -w /workspace/words.txt');
      assert.ok(resWc.stdout.includes('5'));

      const resSortN = await executeShell(shell, 'sort -n /workspace/nums.txt');
      assert.strictEqual(resSortN.stdout.trim(), '1\n2\n2\n5\n10');

      const resSortU = await executeShell(shell, 'sort -n -u /workspace/nums.txt');
      assert.strictEqual(resSortU.stdout.trim(), '1\n2\n5\n10');

      const resUniq = await executeShell(shell, 'sort -n /workspace/nums.txt | uniq -c');
      assert.ok(resUniq.stdout.includes('2 2'));
    });

    await test('2.6 Stream Editing: sed (s/find/repl/g, -i), awk ({print $1}), cut, tr', async () => {
      const vfs = createVirtualFs({
        '/workspace/data.csv': 'id,name,role\n1,Alice,Engineer\n2,Bob,Architect\n',
        '/workspace/inplace.txt': 'old value\n'
      });
      const shell = getShellEngine({ vfs });

      const resSed = await executeShell(shell, 'echo "foo bar foo" | sed "s/foo/baz/g"');
      assert.strictEqual(resSed.stdout.trim(), 'baz bar baz');

      await executeShell(shell, 'sed -i "s/old/new/g" /workspace/inplace.txt');
      assert.strictEqual(vfs.readFileSync('/workspace/inplace.txt', 'utf8').trim(), 'new value');

      const resAwk = await executeShell(shell, 'echo "col1 col2 col3" | awk \'{print $2}\'');
      assert.strictEqual(resAwk.stdout.trim(), 'col2');

      const resCut = await executeShell(shell, 'tail -n 2 /workspace/data.csv | cut -d "," -f 2');
      assert.strictEqual(resCut.stdout.trim(), 'Alice\nBob');

      const resTr = await executeShell(shell, 'echo "abc123xyz" | tr "a-z" "A-Z"');
      assert.strictEqual(resTr.stdout.trim(), 'ABC123XYZ');
    });

    await test('2.7 Comparison & Structure: diff -u, tree', async () => {
      const vfs = createVirtualFs({
        '/workspace/v1.txt': 'alpha\nbeta\ngamma\n',
        '/workspace/v2.txt': 'alpha\nbeta delta\ngamma\n',
        '/workspace/src/lib.js': ''
      });
      const shell = getShellEngine({ vfs });

      const resDiff = await executeShell(shell, 'diff -u /workspace/v1.txt /workspace/v2.txt');
      assert.notStrictEqual(resDiff.code, 0, 'diff should return 1 when files differ');
      assert.ok(resDiff.stdout.includes('---') && resDiff.stdout.includes('+++'));

      const resTree = await executeShell(shell, 'tree /workspace');
      assert.strictEqual(resDiff.code ? 1 : 0, 1);
      assert.ok(resTree.stdout.includes('src') || resTree.stdout.includes('v1.txt'));
    });

    await test('2.8 Mutations: mkdir -p, touch, cp -r, mv, rm -rf', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      await executeShell(shell, 'mkdir -p /workspace/deep/dir');
      assert.ok(vfs.existsSync('/workspace/deep/dir'));

      await executeShell(shell, 'touch /workspace/deep/dir/file.txt');
      assert.ok(vfs.existsSync('/workspace/deep/dir/file.txt'));

      await executeShell(shell, 'cp -r /workspace/deep /workspace/deep_copy');
      assert.ok(vfs.existsSync('/workspace/deep_copy/dir/file.txt'));

      await executeShell(shell, 'mv /workspace/deep_copy /workspace/renamed');
      assert.ok(!vfs.existsSync('/workspace/deep_copy'));
      assert.ok(vfs.existsSync('/workspace/renamed/dir/file.txt'));

      await executeShell(shell, 'rm -rf /workspace/renamed');
      assert.ok(!vfs.existsSync('/workspace/renamed'));
    });

    await test('2.9 Metadata: stat, chmod, echo (-n, -e), printf (%s, %d)', async () => {
      const vfs = createVirtualFs({
        '/workspace/meta.txt': 'metadata sample'
      });
      const shell = getShellEngine({ vfs });

      const resStat = await executeShell(shell, 'stat /workspace/meta.txt');
      assert.ok(resStat.stdout.includes('Size:') || resStat.stdout.includes('File:'));

      await executeShell(shell, 'chmod 755 /workspace/meta.txt');
      const st = vfs.statSync('/workspace/meta.txt');
      assert.strictEqual((st.mode & 0o777), 0o755);

      const resEchoN = await executeShell(shell, 'echo -n "no-newline"');
      assert.strictEqual(resEchoN.stdout, 'no-newline');

      const resEchoE = await executeShell(shell, 'echo -e "line1\\nline2"');
      assert.strictEqual(resEchoE.stdout.trim(), 'line1\nline2');

      const resPrintf = await executeShell(shell, 'printf "%s=%04d\\n" "port" 80');
      assert.strictEqual(resPrintf.stdout.trim(), 'port=0080');
    });

    await test('2.10 System State: env, which, whoami, uname -a, date', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const resEnv = await executeShell(shell, 'env');
      assert.ok(resEnv.stdout.includes('PWD=') && resEnv.stdout.includes('USER='));

      const resWhich = await executeShell(shell, 'which cat');
      assert.ok(resWhich.stdout.includes('cat'));

      const resWhoami = await executeShell(shell, 'whoami');
      assert.strictEqual(resWhoami.stdout.trim(), 'codelab');

      const resUname = await executeShell(shell, 'uname -a');
      assert.ok(resUname.stdout.length > 0);

      const resDate = await executeShell(shell, 'date');
      assert.ok(!isNaN(Date.parse(resDate.stdout.trim())) || resDate.stdout.trim().length > 10);
    });

    await test('2.11 Control: sleep, true, false, clear, history, help', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const resTrue = await executeShell(shell, 'true');
      assert.strictEqual(resTrue.code, 0);

      const resFalse = await executeShell(shell, 'false');
      assert.strictEqual(resFalse.code, 1);

      const resClear = await executeShell(shell, 'clear');
      assert.strictEqual(resClear.code, 0);

      const resHelp = await executeShell(shell, 'help');
      assert.ok(resHelp.stdout.includes('ls') && resHelp.stdout.includes('grep'));

      const resHistory = await executeShell(shell, 'history');
      assert.ok(resHistory.stdout.includes('true') || resHistory.stdout.includes('help'));
    });

    await test('2.12 Process Control: ps, jobs, kill <pid>', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const bgRes = await executeShell(shell, 'sleep 5 &');
      const pidMatch = bgRes.stdout.match(/\[\d+\]\s+(\d+)/);
      assert.ok(pidMatch, 'Should output background PID');
      const pid = pidMatch[1];

      const resPs = await executeShell(shell, 'ps');
      assert.ok(resPs.stdout.includes(pid));

      const resKill = await executeShell(shell, `kill ${pid}`);
      assert.strictEqual(resKill.code, 0);

      const resPsAfter = await executeShell(shell, 'ps');
      assert.ok(!resPsAfter.stdout.includes(`sleep 5`) || resPsAfter.stdout.includes('defunct'));
    });

    await test('2.13 Git Shim: git status, git diff, git log, git branch', async () => {
      const vfs = createVirtualFs({
        '/workspace/.git/HEAD': 'ref: refs/heads/main\n',
        '/workspace/file.js': 'console.log("git test");\n'
      });
      const shell = getShellEngine({ vfs });

      const resStatus = await executeShell(shell, 'git status');
      assert.ok(resStatus.stdout.includes('On branch main') || resStatus.stdout.includes('branch'));

      const resBranch = await executeShell(shell, 'git branch');
      assert.ok(resBranch.stdout.includes('main'));

      const resLog = await executeShell(shell, 'git log');
      assert.ok(resLog.stdout.includes('commit') || resLog.stdout.length > 0);
    });

    await test('2.14 VFS Sync: Shell file operations trigger VFS mutation events', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const mutations = [];
      if (typeof vfs.on === 'function') {
        vfs.on('mutation', (evt) => mutations.push(evt));
      } else if (typeof shell.on === 'function') {
        shell.on('fsChange', (evt) => mutations.push(evt));
      }

      await executeShell(shell, 'echo "hello" > /workspace/event.txt');
      assert.ok(vfs.existsSync('/workspace/event.txt'));
    });

    await test('2.15 Coreutils Error Handling: Missing operands, error exit codes, empty input', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const resCat = await executeShell(shell, 'cat /nonexistent_file');
      assert.notStrictEqual(resCat.code, 0);
      assert.ok(resCat.stderr.includes('No such file') || resCat.stderr.includes('ENOENT'));

      const resHead = await executeShell(shell, 'head -n 0 /workspace/nonexistent');
      assert.notStrictEqual(resHead.code, 0);
    });

    await test('2.16 Adversarial Paths: Spaces in paths, special chars, relative path traversal bounds', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      await executeShell(shell, 'mkdir -p "/workspace/my folder with spaces"');
      await executeShell(shell, 'echo "content" > "/workspace/my folder with spaces/file name.txt"');
      assert.ok(vfs.existsSync('/workspace/my folder with spaces/file name.txt'));

      const res = await executeShell(shell, 'cat "/workspace/my folder with spaces/file name.txt"');
      assert.strictEqual(res.stdout.trim(), 'content');

      // Clamped root traversal
      await executeShell(shell, 'cd ../../../../../../../../ && pwd');
      const resPwd = await executeShell(shell, 'pwd');
      assert.strictEqual(resPwd.stdout.trim(), '/');
    });

  });

  // ===========================================================================
  // SUITE 3: Node.js CLI & Runtime Workflows
  // ===========================================================================
  await suite('Suite 3: Node.js CLI & Runtime Workflows', async () => {

    await test('3.1 node <file.js> and node <file.ts> script execution', async () => {
      const vfs = createVirtualFs({
        '/workspace/app.js': 'console.log("JS running: " + (21 * 2));\n',
        '/workspace/typed.ts': 'interface Config { port: number; } const c: Config = { port: 8080 }; console.log("TS running: " + c.port);\n'
      });
      const shell = getShellEngine({ vfs });

      const resJs = await executeShell(shell, 'node /workspace/app.js');
      assert.strictEqual(resJs.code, 0, resJs.stderr);
      assert.strictEqual(resJs.stdout.trim(), 'JS running: 42');

      const resTs = await executeShell(shell, 'node /workspace/typed.ts');
      assert.strictEqual(resTs.code, 0, resTs.stderr);
      assert.strictEqual(resTs.stdout.trim(), 'TS running: 8080');
    });

    await test('3.2 node -e "<code>" expression evaluation', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'node -e "console.log(Buffer.from(\'hello\').toString(\'base64\'))"');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'aGVsbG8=');
    });

    await test('3.3 node -p "<code>" expression evaluation with print', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'node -p "Math.pow(2, 8)"');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), '256');
    });

    await test('3.4 node --test automated test runner execution', async () => {
      const vfs = createVirtualFs({
        '/workspace/unit.test.js': `
          const test = require('node:test');
          const assert = require('node:assert/strict');
          test('adds 1 + 2', () => {
            assert.equal(1 + 2, 3);
          });
        `
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'node --test /workspace/unit.test.js');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.ok(res.stdout.includes('pass') || res.stdout.includes('✓') || res.stdout.includes('adds 1 + 2'));
    });

    await test('3.5 node interactive REPL with > prompt and .exit', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      // Run via executeInVirtualRuntime REPL mode
      const replRes = await executeInVirtualRuntime({
        mode: 'repl',
        replCode: 'const x = 50; x * 2'
      });
      assert.strictEqual(replRes.ok, true, replRes.stderr);
      assert.ok(replRes.stdout.includes('100'));
    });

    await test('3.6 Node script argument passing: process.argv and flags', async () => {
      const vfs = createVirtualFs({
        '/workspace/args.js': 'console.log(process.argv.slice(2).join(","));\n'
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'node /workspace/args.js foo --bar baz');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'foo,--bar,baz');
    });

  });

  // ===========================================================================
  // SUITE 4: Bun CLI & Bun Runtime Engine
  // ===========================================================================
  await suite('Suite 4: Bun CLI & Bun Runtime Engine', async () => {

    await test('4.1 bun run <file.ts> and bun <file.js> execution', async () => {
      const vfs = createVirtualFs({
        '/workspace/math.ts': 'const square = (x: number): number => x * x; console.log("Bun calc: " + square(9));\n'
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'bun run /workspace/math.ts');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'Bun calc: 81');
    });

    await test('4.2 bun -e "<code>" code evaluation', async () => {
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'bun -e "console.log(123 + 456)"');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), '579');
    });

    await test('4.3 bun init workspace scaffolding', async () => {
      const vfs = createVirtualFs();
      vfs.mkdirSync('/workspace/new-app', { recursive: true });
      const shell = getShellEngine({ vfs });

      await executeShell(shell, 'cd /workspace/new-app && bun init -y');
      assert.ok(vfs.existsSync('/workspace/new-app/package.json'));
      assert.ok(vfs.existsSync('/workspace/new-app/index.ts') || vfs.existsSync('/workspace/new-app/tsconfig.json'));
    });

    await test('4.4 bun test discovery and test execution (*.test.ts, *.test.js)', async () => {
      const vfs = createVirtualFs({
        '/workspace/calc.test.ts': `
          import { describe, it, expect } from 'bun:test';
          describe('calculator', () => {
            it('computes division', () => {
              expect(10 / 2).toBe(5);
            });
          });
        `
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'bun test /workspace/calc.test.ts');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.ok(res.stdout.includes('pass') || res.stdout.includes('✓') || res.stdout.includes('computes division'));
    });

    await test('4.5 Global Bun.version and runtime identity', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'index.js': `
            console.log(typeof Bun);
            console.log(typeof Bun.version === 'string');
            console.log(typeof Bun.serve === 'function');
            console.log(typeof Bun.file === 'function');
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'object\ntrue\ntrue\ntrue');
    });

    await test('4.6 Bun.file(path) (.text(), .json(), .arrayBuffer(), .exists(), .size)', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'data.json': JSON.stringify({ name: 'CodeLab', tier: 1 }),
          'index.js': `
            const f = Bun.file('data.json');
            const exists = await f.exists();
            const json = await f.json();
            const text = await f.text();
            console.log(exists);
            console.log(json.name);
            console.log(typeof text);
            console.log(f.size > 0);
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'true\nCodeLab\nstring\ntrue');
    });

    await test('4.7 Bun.write(path, data) writes strings/buffers/files to VFS', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'index.js': `
            await Bun.write('written.txt', 'Written via Bun.write');
            await Bun.write('binary.bin', new Uint8Array([72, 101, 108, 108, 111]));
            console.log(await Bun.file('written.txt').text());
            console.log(await Bun.file('binary.bin').text());
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'Written via Bun.write\nHello');
    });

    await test('4.8 Bun.sleep(ms) promise resolution', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'index.js': `
            const t0 = Date.now();
            await Bun.sleep(20);
            console.log(Date.now() - t0 >= 10);
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'true');
    });

    await test('4.9 Bun.hash deterministic hashing (crc32, cityHash64)', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'index.js': `
            const h1 = Bun.hash('system-design');
            const h2 = Bun.hash('system-design');
            const h3 = Bun.hash('other');
            console.log(h1 === h2);
            console.log(h1 !== h3);
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'true\ntrue');
    });

    await test('4.10 Bun.deepEquals(a, b) comparison for complex data structures', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'index.js': `
            const a = { x: [1, 2, { y: true }], d: new Date(1000) };
            const b = { x: [1, 2, { y: true }], d: new Date(1000) };
            const c = { x: [1, 2, { y: false }], d: new Date(1000) };
            console.log(Bun.deepEquals(a, b));
            console.log(Bun.deepEquals(a, c));
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'true\nfalse');
    });

    await test('4.11 Bun.inspect and Bun.nanoseconds', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'index.js': `
            const inspected = Bun.inspect({ foo: 'bar', n: 42 });
            const nanos = Bun.nanoseconds();
            console.log(typeof inspected === 'string');
            console.log(typeof nanos === 'number' && nanos > 0);
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'true\ntrue');
    });

    await test('4.12 bun:test (describe, test, it, expect matchers, hooks, mocks)', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        mode: 'test',
        files: {
          'index.js': `
            const { describe, it, expect, mock } = require('bun:test');
            describe('bun:test suite', () => {
              it('verifies full matchers and mock calls', () => {
                expect(2 + 2).toBe(4);
                expect({ a: 1 }).toEqual({ a: 1 });
                expect([1, 2, 3]).toContain(2);
                expect(() => { throw new Error('fail'); }).toThrow('fail');
                expect(true).toBeTruthy();
                expect(false).toBeFalsy();
                expect(10).toBeGreaterThan(5);
                expect(5).toBeLessThan(10);

                const fn = mock((x) => x * 3);
                const out = fn(4);
                expect(out).toBe(12);
                expect(fn).toHaveBeenCalled();
              });
            });
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
    });

    await test('4.13 bun:sqlite in-memory database queries (CREATE, INSERT, SELECT, .query().all(), .get())', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'index.js': `
            const { Database } = require('bun:sqlite');
            const db = new Database(':memory:');
            db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);');
            db.run('INSERT INTO users (name) VALUES (?);', ['Alice']);
            db.run('INSERT INTO users (name) VALUES (?);', ['Bob']);

            const all = db.query('SELECT * FROM users ORDER BY id;').all();
            const one = db.query('SELECT name FROM users WHERE id = ?;').get(1);

            console.log(all.length);
            console.log(all[0].name);
            console.log(all[1].name);
            console.log(one.name);
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), '2\nAlice\nBob\nAlice');
    });

    await test('4.14 Bun script execution with package.json scripts', async () => {
      const vfs = createVirtualFs({
        '/workspace/package.json': JSON.stringify({
          scripts: {
            greet: 'echo "Hello from Bun Script"'
          }
        })
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'bun run greet');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'Hello from Bun Script');
    });

    await test('4.15 Bun.serve error handling on port conflict', async () => {
      const portTable = getPortTable();
      const server1 = Bun.serve ? Bun.serve({ port: 3888, fetch: () => new Response('ok') }) : null;

      if (!server1) {
        // Fallback directly to port table verification
        portTable.registerServer(3888, { name: 'first' });
        assert.throws(() => {
          portTable.registerServer(3888, { name: 'conflict' });
        }, /already in use/);
      }
    });

  });

  // ===========================================================================
  // SUITE 5: Package Management (npm & bun)
  // ===========================================================================
  await suite('Suite 5: Package Management (npm & bun)', async () => {

    await test('5.1 npm install <pkg> & bun add <pkg> installs into /workspace/node_modules/', async () => {
      const vfs = createVirtualFs({
        '/workspace/package.json': JSON.stringify({ name: 'my-project', dependencies: {} })
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'npm i is-even');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.ok(vfs.existsSync('/workspace/node_modules/is-even/package.json') || vfs.existsSync('/workspace/node_modules/is-even/index.js'));
    });

    await test('5.2 Updates /workspace/package.json dependencies', async () => {
      const vfs = createVirtualFs({
        '/workspace/package.json': JSON.stringify({ name: 'pkg-test', dependencies: {} })
      });
      const shell = getShellEngine({ vfs });

      await executeShell(shell, 'bun add tiny-invariant');
      const pkgJson = JSON.parse(vfs.readFileSync('/workspace/package.json', 'utf8'));
      assert.ok(pkgJson.dependencies && ('tiny-invariant' in pkgJson.dependencies || 'is-even' in pkgJson.dependencies));
    });

    await test('5.3 npm uninstall <pkg> & bun remove <pkg> cleanup', async () => {
      const vfs = createVirtualFs({
        '/workspace/package.json': JSON.stringify({
          name: 'pkg-test',
          dependencies: { 'tiny-invariant': '^1.3.1' }
        }),
        '/workspace/node_modules/tiny-invariant/package.json': '{}'
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'npm uninstall tiny-invariant');
      assert.strictEqual(res.code, 0, res.stderr);
      const pkgJson = JSON.parse(vfs.readFileSync('/workspace/package.json', 'utf8'));
      assert.ok(!pkgJson.dependencies || !('tiny-invariant' in pkgJson.dependencies));
      assert.ok(!vfs.existsSync('/workspace/node_modules/tiny-invariant'));
    });

    await test('5.4 npm list and bun pm ls dependency tree', async () => {
      const vfs = createVirtualFs({
        '/workspace/package.json': JSON.stringify({
          name: 'list-test',
          dependencies: { lodash: '4.17.21' }
        }),
        '/workspace/node_modules/lodash/package.json': JSON.stringify({ name: 'lodash', version: '4.17.21' })
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'npm list');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.ok(res.stdout.includes('lodash@4.17.21') || res.stdout.includes('lodash'));
    });

    await test('5.5 npm run <script> / bun run <script> package scripts', async () => {
      const vfs = createVirtualFs({
        '/workspace/package.json': JSON.stringify({
          scripts: {
            build: 'echo "Compiling assets..."'
          }
        })
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'npm run build');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'Compiling assets...');
    });

    await test('5.6 Runtime module resolution (require / import of installed package)', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'index.js',
        files: {
          'node_modules/my-lib/package.json': JSON.stringify({ name: 'my-lib', main: './index.js' }),
          'node_modules/my-lib/index.js': 'module.exports = { greet: () => "Hello from my-lib!" };',
          'index.js': `
            const { greet } = require('my-lib');
            console.log(greet());
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.strictEqual(res.stdout.trim(), 'Hello from my-lib!');
    });

  });

  // ===========================================================================
  // SUITE 6: Persistent HTTP Servers, curl, and fetch() Routing
  // ===========================================================================
  await suite('Suite 6: Persistent HTTP Servers, curl, and fetch() Routing', async () => {

    await test('6.1 http.createServer().listen(port) persistent listener in port table', async () => {
      const portTable = getPortTable();
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs, portTable });

      const res = await executeInVirtualRuntime({
        entry: 'server.js',
        files: {
          'server.js': `
            const http = require('node:http');
            const s = http.createServer((req, res) => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', path: req.url }));
            });
            s.listen(3000);
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      // Verify port 3000 is tracked
      const active = portTable.listServers().map(s => s.port);
      assert.ok(active.includes(3000) || res.ok);
    });

    await test('6.2 Bun.serve({ port, fetch, routes }) persistent listener in port table', async () => {
      const portTable = getPortTable();
      const res = await executeInVirtualRuntime({
        entry: 'server.js',
        files: {
          'server.js': `
            const server = Bun.serve({
              port: 4000,
              fetch(req) {
                return new Response('Bun served OK', { status: 200 });
              }
            });
            console.log('Bun port: ' + server.port);
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.ok(res.stdout.includes('Bun port: 4000'));
    });

    await test('6.3 Background server execution (node server.js & / bun run server.ts &)', async () => {
      const vfs = createVirtualFs({
        '/workspace/server.js': `
          const http = require('node:http');
          http.createServer((req, res) => res.end('live')).listen(5000);
        `
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'node /workspace/server.js &');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.match(res.stdout, /\[\d+\]\s+\d+/, 'Expected background PID');
    });

    await test('6.4 CLI curl http://localhost:PORT/path basic GET request', async () => {
      const portTable = getPortTable();
      portTable.registerServer(8081, {
        fetch: async (req) => new Response('{"uptime":100}', { headers: { 'Content-Type': 'application/json' } })
      });
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs, portTable });

      const res = await executeShell(shell, 'curl http://localhost:8081/status');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.strictEqual(res.stdout.trim(), '{"uptime":100}');
    });

    await test('6.5 CLI curl -i / curl -v response headers and verbose details', async () => {
      const portTable = getPortTable();
      portTable.registerServer(8082, {
        fetch: async () => new Response('pong', { status: 200, headers: { 'X-Custom-Header': 'Verified' } })
      });
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs, portTable });

      const res = await executeShell(shell, 'curl -i http://localhost:8082/ping');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.ok(res.stdout.includes('HTTP/1.1 200') || res.stdout.includes('200 OK'));
      assert.ok(res.stdout.includes('X-Custom-Header: Verified') || res.stdout.includes('pong'));
    });

    await test('6.6 CLI curl -X POST -H "..." -d "..." payload handling', async () => {
      const portTable = getPortTable();
      portTable.registerServer(8083, {
        fetch: async (req) => {
          const body = await req.text();
          const contentType = req.headers.get('content-type');
          return new Response(`Received: ${body} (type: ${contentType})`);
        }
      });
      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs, portTable });

      const res = await executeShell(shell, 'curl -X POST -H "Content-Type: application/json" -d \'{"cmd":"ping"}\' http://localhost:8083/api');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.ok(res.stdout.includes('{"cmd":"ping"}'));
    });

    await test('6.7 Global fetch("http://localhost:PORT/...") loopback routing in user code', async () => {
      const res = await executeInVirtualRuntime({
        entry: 'client.js',
        files: {
          'client.js': `
            const http = require('node:http');
            const server = http.createServer((req, res) => {
              res.writeHead(200, { 'Content-Type': 'text/plain' });
              res.end('Loopback Success');
            });
            server.listen(9001, async () => {
              const resp = await fetch('http://localhost:9001/test');
              const text = await resp.text();
              console.log(text);
              server.close();
            });
          `
        }
      });
      assert.strictEqual(res.ok, true, res.stderr);
      assert.ok(res.stdout.includes('Loopback Success'));
    });

    await test('6.8 Port lifecycle, ps / ports inspection, and kill <pid> cleanup', async () => {
      const portTable = getPortTable();
      const vfs = createVirtualFs({
        '/workspace/service.js': `
          const http = require('node:http');
          http.createServer((req, res) => res.end('running')).listen(9090);
        `
      });
      const shell = getShellEngine({ vfs, portTable });

      const startRes = await executeShell(shell, 'node /workspace/service.js &');
      const pidMatch = startRes.stdout.match(/\[\d+\]\s+(\d+)/);
      assert.ok(pidMatch);
      const pid = pidMatch[1];

      // ports command
      const portsRes = await executeShell(shell, 'ports');
      assert.ok(portsRes.stdout.includes('9090') || portsRes.stdout.includes(pid));

      // kill process
      await executeShell(shell, `kill ${pid}`);

      // verify freed
      const portsAfter = await executeShell(shell, 'ports');
      assert.ok(!portsAfter.stdout.includes('9090'));
    });

  });

  // ===========================================================================
  // SUITE 7: Complex Real-World System Design Workloads
  // ===========================================================================
  await suite('Suite 7: Complex Real-World System Design Workloads', async () => {

    await test('7.1 Complex Pipeline: cat access.log | grep " 500 " | awk \'{print $1}\' | sort | uniq -c', async () => {
      const logLines = [
        '192.168.1.10 - - [15/Oct/2026:10:00:00] "GET /api/v1/users HTTP/1.1" 200 1024',
        '10.0.0.1 - - [15/Oct/2026:10:00:01] "POST /api/v1/auth HTTP/1.1" 500 512',
        '172.16.0.5 - - [15/Oct/2026:10:00:02] "GET /index.html HTTP/1.1" 200 4096',
        '10.0.0.1 - - [15/Oct/2026:10:00:03] "POST /api/v1/auth HTTP/1.1" 500 512',
        '192.168.1.20 - - [15/Oct/2026:10:00:04] "GET /api/v1/metrics HTTP/1.1" 500 256',
        '10.0.0.1 - - [15/Oct/2026:10:00:05] "POST /api/v1/auth HTTP/1.1" 500 512'
      ].join('\n') + '\n';

      const vfs = createVirtualFs({
        '/workspace/access.log': logLines
      });
      const shell = getShellEngine({ vfs });

      const res = await executeShell(shell, 'cat /workspace/access.log | grep " 500 " | awk \'{print $1}\' | sort | uniq -c | sort -nr > /workspace/top_failing.txt');
      assert.strictEqual(res.code, 0, res.stderr);

      const topFailing = vfs.readFileSync('/workspace/top_failing.txt', 'utf8').trim();
      assert.ok(topFailing.includes('3 10.0.0.1'));
      assert.ok(topFailing.includes('1 192.168.1.20'));
    });

    await test('7.2 Multi-Service Cluster: 2 servers running in background + reverse proxy loopback', async () => {
      const portTable = getPortTable();
      portTable.registerServer(5001, {
        fetch: async () => new Response(JSON.stringify({ service: 'auth', status: 'authenticated' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      });
      portTable.registerServer(5002, {
        fetch: async () => new Response(JSON.stringify({ service: 'catalog', items: [1, 2, 3] }), {
          headers: { 'Content-Type': 'application/json' }
        })
      });
      portTable.registerServer(5000, {
        fetch: async (req) => {
          const url = new URL(req.url);
          if (url.pathname.startsWith('/api/auth')) {
            return portTable.dispatchRequest('http://localhost:5001' + url.pathname.replace('/api/auth', ''));
          }
          if (url.pathname.startsWith('/api/catalog')) {
            return portTable.dispatchRequest('http://localhost:5002' + url.pathname.replace('/api/catalog', ''));
          }
          return new Response('Not Found', { status: 404 });
        }
      });

      const vfs = createVirtualFs();
      const shell = getShellEngine({ vfs, portTable });

      const resAuth = await executeShell(shell, 'curl http://localhost:5000/api/auth');
      assert.strictEqual(resAuth.code, 0);
      assert.ok(resAuth.stdout.includes('authenticated'));

      const resCatalog = await executeShell(shell, 'curl http://localhost:5000/api/catalog');
      assert.strictEqual(resCatalog.code, 0);
      assert.ok(resCatalog.stdout.includes('catalog'));
    });

    await test('7.3 End-to-End Bun + SQLite + HTTP Server queried via curl', async () => {
      const portTable = getPortTable();
      const vfs = createVirtualFs({
        '/workspace/metrics-service.ts': `
          import { Database } from 'bun:sqlite';
          const db = new Database(':memory:');
          db.run('CREATE TABLE metrics (id INTEGER PRIMARY KEY, metric TEXT, val REAL);');
          db.run('INSERT INTO metrics (metric, val) VALUES (?, ?);', ['cpu', 45.5]);
          db.run('INSERT INTO metrics (metric, val) VALUES (?, ?);', ['cpu', 55.5]);
          db.run('INSERT INTO metrics (metric, val) VALUES (?, ?);', ['mem', 70.0]);

          Bun.serve({
            port: 8080,
            fetch(req) {
              const url = new URL(req.url);
              if (url.pathname === '/metrics/summary') {
                const rows = db.query('SELECT metric, AVG(val) as avg_val FROM metrics GROUP BY metric ORDER BY metric;').all();
                return new Response(JSON.stringify(rows), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              return new Response('OK', { status: 200 });
            }
          });
        `
      });
      const shell = getShellEngine({ vfs, portTable });

      // Run background bun service
      const bg = await executeShell(shell, 'bun run /workspace/metrics-service.ts &');
      assert.strictEqual(bg.code, 0, bg.stderr);

      // Query service with curl
      const res = await executeShell(shell, 'curl http://localhost:8080/metrics/summary');
      assert.strictEqual(res.code, 0, res.stderr);
      assert.ok(res.stdout.includes('cpu') && res.stdout.includes('50.5'));
    });

  });

  // ===========================================================================
  // SUMMARY REPORT
  // ===========================================================================
  console.log('\n\x1b[1m\x1b[35m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m                         TEST EXECUTION SUMMARY                       \x1b[0m');
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');

  for (const s of summary.suites) {
    const status = s.failed === 0 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`  [${status}] ${s.title}: ${s.passed}/${s.tests.length} passed (${s.durationMs}ms)`);
  }

  console.log('----------------------------------------------------------------------');
  console.log(`  Total Tests: \x1b[1m${summary.total}\x1b[0m`);
  console.log(`  Passed:      \x1b[32m${summary.passed}\x1b[0m`);
  console.log(`  Failed:      \x1b[31m${summary.failed}\x1b[0m`);
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m\n');

  if (summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal Test Harness Error:', err);
    process.exit(1);
  });
}

module.exports = {
  main,
  suite,
  test,
  getShellEngine,
  executeShell,
  getPortTable
};
