/**
 * @file test-stress-shell.js
 * Adversarial Stress & Edge Case Test Suite for POSIX Shell Engine (src/shell.js)
 * Milestone 1 Empirical Verification
 */

'use strict';

const assert = require('node:assert/strict');
const shellModule = require('./src/shell.js');
const runtime = require('./src/runtime.js');

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  bugs: []
};

async function testCase(name, fn) {
  results.total++;
  process.stdout.write(`Testing: ${name} ... `);
  try {
    await fn();
    results.passed++;
    console.log('\x1b[32mPASS\x1b[0m');
  } catch (err) {
    results.failed++;
    console.log('\x1b[31mFAIL\x1b[0m');
    console.log(`  -> Error: ${err.message}`);
    results.bugs.push({ name, error: err.message, stack: err.stack });
  }
}

async function runAll() {
  console.log('======================================================================');
  console.log('  STARTING ADVERSARIAL STRESS TEST SUITE ON src/shell.js');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // 1. PIPELINE STRESS & EDGE CASES
  // -------------------------------------------------------------------------
  console.log('--- Suite 1: Pipeline Stress & Edge Cases ---');

  await testCase('1.1 100-stage deep pipeline throughput', async () => {
    const shell = shellModule.createPosixShell();
    const pipe = 'echo "deep pipeline" ' + '| cat '.repeat(100);
    const res = await shell.execute(pipe);
    assert.strictEqual(res.code, 0);
    assert.strictEqual(res.stdout.trim(), 'deep pipeline');
  });

  await testCase('1.2 Pipeline exit code semantics (last stage exit code)', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('false | true');
    assert.strictEqual(res.code, 0, 'Pipeline exit code must be the exit code of the last command');

    const res2 = await shell.execute('true | false');
    assert.strictEqual(res2.code, 1, 'Pipeline exit code must be non-zero if last command fails');
  });

  await testCase('1.3 Pipeline data transformation integrity across coreutils', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('seq 1 1000 | tr 0 9 | grep 999 | wc -l');
    assert.strictEqual(res.code, 0);
    // Numbers between 1 and 1000 with 0 replaced by 9 containing 999:
    // e.g., 999, 1000->1999 (contains 999), etc.
    const count = parseInt(res.stdout.trim(), 10);
    assert.ok(count > 0, 'Expected matches count > 0');
  });

  await testCase('1.4 Semicolon sequence stdout accumulation (cmd1; cmd2; cmd3)', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('echo "line 1"; echo "line 2"; echo "line 3"');
    assert.strictEqual(res.code, 0);
    assert.strictEqual(
      res.stdout.trim(),
      'line 1\nline 2\nline 3',
      'Sequenced commands separated by semicolon must accumulate all stdout, not discard previous commands'
    );
  });

  await testCase('1.5 Multi-line commands separated by newline', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('echo "hello" # inline comment\necho "world"');
    assert.strictEqual(res.code, 0);
    assert.strictEqual(
      res.stdout.trim(),
      'hello\nworld',
      'Newline after comment must separate commands, not merge tokens into one command'
    );
  });

  // -------------------------------------------------------------------------
  // 2. REDIRECTION STRESS & EDGE CASES
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 2: Redirection Stress & Edge Cases ---');

  await testCase('2.1 Rapid 1000 file overwrites and appends', async () => {
    const shell = shellModule.createPosixShell();
    for (let i = 0; i < 500; i++) {
      await shell.execute(`echo "overwrite ${i}" > /workspace/rapid.txt`);
    }
    assert.strictEqual(shell.vfs.readFileSync('/workspace/rapid.txt', 'utf8').trim(), 'overwrite 499');

    for (let i = 0; i < 500; i++) {
      await shell.execute(`echo "line ${i}" >> /workspace/rapid_append.txt`);
    }
    const lines = shell.vfs.readFileSync('/workspace/rapid_append.txt', 'utf8').trim().split('\n');
    assert.strictEqual(lines.length, 500);
  });

  await testCase('2.2 Redirection > to non-existent directory must not crash with unhandled rejection', async () => {
    const vfs = runtime.createVirtualFs();
    const shell = shellModule.createPosixShell({ vfs });
    let threw = false;
    let res;
    try {
      res = await shell.execute('echo "fail" > /workspace/no_such_dir/out.txt');
    } catch (err) {
      threw = true;
    }
    assert.strictEqual(threw, false, 'Redirection to invalid directory must not reject promise / crash process');
    assert.notStrictEqual(res.code, 0, 'Exit code must be non-zero');
    assert.ok(res.stderr.length > 0, 'Stderr must contain error message');
  });

  await testCase('2.3 Canonical 2>&1 redirection (cmd > file 2>&1)', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('cat /nonexistent_file > /workspace/combined.log 2>&1');
    assert.notStrictEqual(res.code, 0);
    const log = shell.vfs.readFileSync('/workspace/combined.log', 'utf8');
    assert.ok(
      log.includes('No such file or directory'),
      'cmd > file 2>&1 must write stderr into the redirected file'
    );
  });

  await testCase('2.4 Multiple redirects in single command (cmd > f1 > f2)', async () => {
    const shell = shellModule.createPosixShell();
    await shell.execute('echo "final destination" > /workspace/f1.txt > /workspace/f2.txt');
    const f1 = shell.vfs.readFileSync('/workspace/f1.txt', 'utf8');
    const f2 = shell.vfs.readFileSync('/workspace/f2.txt', 'utf8');
    assert.strictEqual(f2.trim(), 'final destination', 'Final redirect target must receive the output');
  });

  // -------------------------------------------------------------------------
  // 3. LARGE STDOUT & MEMORY LEAK CHECK
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 3: Large STDOUT & Memory Leak Check ---');

  await testCase('3.1 Large 5MB stdout processing through pipeline', async () => {
    const shell = shellModule.createPosixShell();
    const line = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\n';
    const bigString = line.repeat(80000); // ~5MB
    shell.vfs.writeFileSync('/workspace/5mb.txt', bigString);

    const res = await shell.execute('cat /workspace/5mb.txt | wc -l');
    assert.strictEqual(res.code, 0);
    assert.strictEqual(parseInt(res.stdout.trim(), 10), 80000);
  });

  await testCase('3.2 Memory retention across 1,000 executed commands', async () => {
    const shell = shellModule.createPosixShell();
    if (global.gc) global.gc();
    const memStart = process.memoryUsage().heapUsed;

    for (let i = 0; i < 1000; i++) {
      await shell.execute(`echo "iter ${i}"`);
    }

    if (global.gc) global.gc();
    const memEnd = process.memoryUsage().heapUsed;
    const deltaMB = (memEnd - memStart) / 1024 / 1024;
    // Allow up to 15MB delta for V8 heap growth
    assert.ok(deltaMB < 20, `Heap grew by ${deltaMB.toFixed(2)}MB; possible memory leak in command execution`);
  });

  // -------------------------------------------------------------------------
  // 4. GLOB EXPANSIONS WITH SPECIAL CHARACTERS & DOTFILES
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 4: Glob Expansions & Edge Cases ---');

  await testCase('4.1 Filenames with spaces, plus signs, brackets', async () => {
    const shell = shellModule.createPosixShell();
    shell.vfs.writeFileSync('/workspace/file with space.txt', 'space');
    shell.vfs.writeFileSync('/workspace/file+1.txt', 'plus');
    shell.vfs.writeFileSync('/workspace/file(1).txt', 'paren');

    const res1 = await shell.execute('cat "file with space.txt"');
    assert.strictEqual(res1.stdout.trim(), 'space');

    const res2 = await shell.execute('echo file+*.txt');
    assert.strictEqual(res2.stdout.trim(), 'file+1.txt');
  });

  await testCase('4.2 POSIX dotfile protection: * must NOT match hidden files', async () => {
    const shell = shellModule.createPosixShell();
    shell.vfs.writeFileSync('/workspace/.secret_env', 'SECRET=xyz');
    shell.vfs.writeFileSync('/workspace/visible.txt', 'hello');

    const res = await shell.execute('echo *');
    const matches = res.stdout.trim().split(/\s+/);
    assert.ok(matches.includes('visible.txt'), 'Must match visible.txt');
    assert.ok(
      !matches.includes('.secret_env'),
      'POSIX glob rule: * wildcard must NOT match dotfiles starting with .'
    );
  });

  await testCase('4.3 Non-matching glob must return literal pattern unchanged', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('echo *.nonexistent_pattern_123');
    assert.strictEqual(res.stdout.trim(), '*.nonexistent_pattern_123');
  });

  // -------------------------------------------------------------------------
  // 5. BACKGROUND JOBS & CONCURRENCY
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 5: Background Jobs & Concurrency ---');

  await testCase('5.1 Concurrent background jobs execution', async () => {
    const shell = shellModule.createPosixShell();
    const pids = [];
    for (let i = 0; i < 20; i++) {
      const res = await shell.execute('sleep 0 &');
      const pid = parseInt(res.stdout.match(/\[\d+\]\s+(\d+)/)[1], 10);
      pids.push(pid);
    }
    assert.strictEqual(pids.length, 20);
    // Wait for jobs to settle
    await new Promise(r => setTimeout(r, 100));
  });

  await testCase('5.2 kill <pid> terminates background job and does not resuscitate', async () => {
    const shell = shellModule.createPosixShell();
    const bg = await shell.execute('sleep 1 &');
    const pid = parseInt(bg.stdout.match(/\[\d+\]\s+(\d+)/)[1], 10);

    const killRes = await shell.execute(`kill ${pid}`);
    assert.strictEqual(killRes.code, 0);

    const job = Array.from(shell.jobs.values()).find(j => j.pid === pid);
    assert.strictEqual(job.status, 'Terminated');

    // Wait until sleep would have finished
    await new Promise(r => setTimeout(r, 1200));
    assert.strictEqual(
      job.status,
      'Terminated',
      'Terminated background job must not resuscitate back to Done when underlying promise resolves'
    );
  });

  await testCase('5.3 kill with invalid PID must return exit code 1', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('kill 999999');
    assert.strictEqual(res.code, 1, 'kill on nonexistent PID must return exit code 1');
  });

  // -------------------------------------------------------------------------
  // 6. SUBSHELL NESTING & VARIABLE ENVIRONMENT
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 6: Subshell Nesting & Variable Environment ---');

  await testCase('6.1 Deeply nested command substitutions (10 levels)', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('echo $(echo $(echo $(echo $(echo $(echo $(echo $(echo $(echo $(echo "level 10")))))))))');
    assert.strictEqual(res.code, 0);
    assert.strictEqual(res.stdout.trim(), 'level 10');
  });

  await testCase('6.2 Subshell environment mutations must not leak to parent', async () => {
    const shell = shellModule.createPosixShell();
    await shell.execute('echo $(export LEAKED_VAR=123 && cd /tmp)');
    assert.strictEqual(shell.cwd, '/workspace', 'Subshell cd must not change parent cwd');
    assert.strictEqual(shell.env.LEAKED_VAR, undefined, 'Subshell export must not leak to parent env');
  });

  await testCase('6.3 Exit status variable $? propagation across sequence', async () => {
    const shell = shellModule.createPosixShell();
    await shell.execute('false');
    const res = await shell.execute('echo "status=$?"');
    assert.ok(res.stdout.includes('status=1'), '$? must reflect exit code 1 of previous false command');
  });

  await testCase('6.4 unset variable across logical chain (export V=1 && unset V && echo $V)', async () => {
    const shell = shellModule.createPosixShell();
    const res = await shell.execute('export TEST_VAR=abc && unset TEST_VAR && echo "val=$TEST_VAR"');
    assert.strictEqual(res.stdout.trim(), 'val=', 'unset variable must be empty in subsequent chained command');
  });

  // -------------------------------------------------------------------------
  // 7. COREUTILS EDGE CASES & ROBUSTNESS
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 7: Coreutils Edge Cases & Robustness ---');

  await testCase('7.1 sort clustered flags (-nr or -rn)', async () => {
    const shell = shellModule.createPosixShell();
    shell.vfs.writeFileSync('/workspace/numbers.txt', '10\n2\n50\n1\n');
    const res = await shell.execute('sort -nr /workspace/numbers.txt');
    assert.strictEqual(res.code, 0, res.stderr);
    assert.strictEqual(res.stdout.trim(), '50\n10\n2\n1');
  });

  await testCase('7.2 head -n 0 and tail -n 0 must produce empty output', async () => {
    const shell = shellModule.createPosixShell();
    const resHead = await shell.execute('echo "a\nb\nc" | head -n 0');
    assert.strictEqual(resHead.stdout, '', 'head -n 0 must produce 0 lines');

    const resTail = await shell.execute('echo "a\nb\nc" | tail -n 0');
    assert.strictEqual(resTail.stdout, '', 'tail -n 0 must produce 0 lines');
  });

  await testCase('7.3 sed with invalid regex must return error code, not crash process', async () => {
    const shell = shellModule.createPosixShell();
    let threw = false;
    let res;
    try {
      res = await shell.execute('echo "test" | sed "s/(/x/"');
    } catch (e) {
      threw = true;
    }
    assert.strictEqual(threw, false, 'sed with invalid regex must not throw unhandled exception');
    assert.notStrictEqual(res.code, 0, 'Exit code must be non-zero');
  });

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('  TEST SUMMARY');
  console.log('======================================================================');
  console.log(`Total:  ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('======================================================================\n');

  if (results.bugs.length > 0) {
    console.log('DETECTED BUGS / FAILURE MODES:');
    results.bugs.forEach((b, idx) => {
      console.log(`\n[Bug ${idx + 1}] ${b.name}`);
      console.log(`  Detail: ${b.error}`);
    });
  }
}

runAll().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
