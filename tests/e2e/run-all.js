#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');

const TEST_FILES = [
  'tier1-feature-coverage.test.js',
  'tier2-boundary-corner.test.js',
  'tier3-cross-feature.test.js',
  'tier4-real-world.test.js'
];

async function runTestFile(file) {
  const filePath = path.join(__dirname, file);
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(process.execPath, ['--test', filePath], {
      cwd: path.resolve(__dirname, '../..'),
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
      process.stdout.write(d);
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });

    child.on('close', (code) => {
      const duration = Date.now() - start;
      const passMatches = stdout.match(/✔\s+([^\n]+)/g) || [];
      const failMatches = stdout.match(/✖\s+([^\n]+)/g) || [];
      resolve({
        file,
        code,
        duration,
        passed: passMatches.length,
        failed: failMatches.length,
        stdout,
        stderr
      });
    });
  });
}

async function main() {
  console.log('\n================================================================================');
  console.log('STARTING AUTOMATED E2E TEST SUITE (TIERS 1 - 4)');
  console.log('Project: System Design Asset Stamping & Code-Lab Standalone UI');
  console.log('================================================================================\n');

  const startTime = Date.now();
  const results = [];

  for (const file of TEST_FILES) {
    console.log(`\n>>> Executing suite: tests/e2e/${file} ...`);
    const res = await runTestFile(file);
    results.push(res);
  }

  const totalDuration = Date.now() - startTime;
  const totalPassed = results.reduce((acc, r) => acc + r.passed, 0);
  const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);
  const totalTests = totalPassed + totalFailed;
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';

  console.log('\n================================================================================');
  console.log('E2E TEST SUITE EXECUTION SUMMARY');
  console.log('================================================================================');
  console.log(`Tier 1: Feature Coverage (F1-F9)      : ${results[0].passed} / ${results[0].passed + results[0].failed} passed (${results[0].duration}ms)`);
  console.log(`Tier 2: Boundary & Corner Cases       : ${results[1].passed} / ${results[1].passed + results[1].failed} passed (${results[1].duration}ms)`);
  console.log(`Tier 3: Cross-Feature Interactions    : ${results[2].passed} / ${results[2].passed + results[2].failed} passed (${results[2].duration}ms)`);
  console.log(`Tier 4: Real-World Scenarios          : ${results[3].passed} / ${results[3].passed + results[3].failed} passed (${results[3].duration}ms)`);
  console.log('--------------------------------------------------------------------------------');
  console.log(`Total Automated Test Cases Executed   : ${totalTests} tests`);
  console.log(`Passed                                : ${totalPassed}`);
  console.log(`Failed                                : ${totalFailed}`);
  console.log(`Pass Rate                             : ${passRate}%`);
  console.log(`Execution Time                        : ${totalDuration}ms`);
  console.log('================================================================================\n');

  if (totalFailed > 0 || results.some(r => r.code !== 0)) {
    console.error('❌ E2E TEST SUITE FAILED: Some tests did not pass.');
    process.exit(1);
  } else {
    console.log('✅ ALL E2E TESTS PASSED WITH 100% SUCCESS RATE.');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal runner error:', err);
    process.exit(1);
  });
}

module.exports = { main, runTestFile, TEST_FILES };
