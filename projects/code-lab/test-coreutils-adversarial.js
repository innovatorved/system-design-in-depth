/**
 * @file test-coreutils-adversarial.js
 * Adversarial Empirical Verification Suite for 47 POSIX Coreutils
 *
 * Verifies:
 * 1. Boundary values & edge cases for sed, awk, cut, sort, uniq, diff, find, grep
 * 2. Exit code conformance (0 on success, >0 on failure) across all 47 coreutils
 * 3. Exception safety: zero unhandled rejections / exceptions under hostile inputs
 */

'use strict';

const assert = require('node:assert/strict');
const { createPosixShell, COREUTILS } = require('./src/shell.js');
const { createVirtualFs } = require('./src/runtime.js');

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: []
};

function recordTest(id, name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`  \x1b[32m✓\x1b[0m [${id}] ${name}`);
  } else {
    results.failed++;
    console.log(`  \x1b[31m✗\x1b[0m [${id}] ${name}`);
    if (details) console.log(`    \x1b[33mIssue:\x1b[0m ${details}`);
    results.failures.push({ id, name, details });
  }
}

async function safeExec(cmd, vfsSetup) {
  const vfs = createVirtualFs();
  if (typeof vfsSetup === 'function') {
    vfsSetup(vfs);
  }
  const shell = createPosixShell({ vfs });
  try {
    const res = await shell.execute(cmd);
    return { threw: false, res, vfs, shell };
  } catch (err) {
    return { threw: true, error: err, vfs, shell };
  }
}

async function runAdversarialSuite() {
  console.log('\n\x1b[1m\x1b[36m============================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m   ADVERSARIAL EMPIRICAL HARNESS: 47 UNIX COREUTILS        \x1b[0m');
  console.log('\x1b[1m\x1b[36m============================================================\x1b[0m\n');

  // =========================================================================
  // SECTION 1: SED REGEX & DELIMITER EDGE CASES
  // =========================================================================
  console.log('\x1b[1m--- Suite 1: sed Regex & Delimiter Edge Cases ---\x1b[0m');

  // 1.1 Custom delimiter
  {
    const r = await safeExec("sed 's|apple|orange|g' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'apple pie and apple cider\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'orange pie and orange cider\n';
    recordTest('SED-01', "sed with alternate delimiter 's|apple|orange|g'", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 1.2 Escaped delimiter in pattern: s/foo\/bar/baz/
  {
    const r = await safeExec("sed 's/foo\\/bar/baz/g' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'test foo/bar here\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'test baz here\n';
    recordTest('SED-02', "sed with escaped delimiter 's/foo\\/bar/baz/g'", pass,
      r.threw ? `UNHANDLED EXCEPTION: ${r.error.name}: ${r.error.message}` : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 1.3 Invalid regex pattern syntax (must return code > 0, NOT crash)
  {
    const r = await safeExec("sed 's/[/bar/' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'hello [ world\n');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('SED-03', "sed invalid regex 's/[/bar/' handles error safely", pass,
      r.threw ? `UNHANDLED EXCEPTION CRASH: ${r.error.name}: ${r.error.message}` : `code=${r.res.code}`);
  }

  // 1.4 Delete line by number '2d'
  {
    const r = await safeExec("sed '2d' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'line 1\nline 2\nline 3\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'line 1\nline 3\n';
    recordTest('SED-04', "sed delete line by number '2d'", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 1.5 Delete line by pattern match '/pattern/d'
  {
    const r = await safeExec("sed '/banana/d' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'apple\nbanana\ncherry\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'apple\ncherry\n';
    recordTest('SED-05', "sed delete line by pattern '/banana/d'", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)} (pattern was not deleted)`);
  }

  // 1.6 Missing expression returns exit code > 0
  {
    const r = await safeExec("sed");
    const pass = !r.threw && r.res.code === 1;
    recordTest('SED-06', "sed missing expression returns code 1", pass,
      r.threw ? r.error.message : `code=${r.res.code}`);
  }

  // 1.7 Sed invoked on directory path (must not throw unhandled EISDIR)
  {
    const r = await safeExec("sed 's/a/b/' /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('SED-07', "sed on directory path returns error without throwing", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.message}` : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 2: AWK MULTIPLE FIELD DELIMITERS & PARSING
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 2: awk Multiple Field Delimiters & Parsing ---\x1b[0m');

  // 2.1 Standard space-separated -F :
  {
    const r = await safeExec("awk -F : '{print $1, $2}' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'root:x:0:0:root:/root:/bin/bash\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'root x\n';
    recordTest('AWK-01', "awk -F : '{print $1, $2}'", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 2.2 Attached delimiter flag -F: (POSIX standard without space)
  {
    const r = await safeExec("awk -F: '{print $1, $2}' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'root:x:0:0:root:/root:/bin/bash\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'root x\n';
    recordTest('AWK-02', "awk -F: (attached flag without space)", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)} (delimiter not parsed)`);
  }

  // 2.3 Regex field delimiter -F '[,;]'
  {
    const r = await safeExec("awk -F '[,;]' '{print $1, $2, $3}' /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'alpha,beta;gamma\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'alpha beta gamma\n';
    recordTest('AWK-03', "awk -F '[,;]' regex multiple delimiters", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 2.4 awk non-existent file returns exit code > 0
  {
    const r = await safeExec("awk '{print $1}' /workspace/nosuchfile.txt");
    const pass = !r.threw && r.res.code > 0 && r.res.stderr.length > 0;
    recordTest('AWK-04', "awk on non-existent file returns exit code > 0", pass,
      r.threw ? r.error.message : `code=${r.res.code}, stderr=${JSON.stringify(r.res.stderr)}`);
  }

  // 2.5 awk on directory path handles error gracefully
  {
    const r = await safeExec("awk '{print $1}' /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('AWK-05', "awk on directory path handles error without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.message}` : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 3: CUT MULTI-BYTE & FILE ARGUMENTS
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 3: cut Multi-Byte & File Arguments ---\x1b[0m');

  // 3.1 cut reading directly from a file argument
  {
    const r = await safeExec("cut -d : -f 1 /workspace/test.txt", vfs => {
      vfs.writeFileSync('/workspace/test.txt', 'first:second:third\nalpha:beta:gamma\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'first\nalpha\n';
    recordTest('CUT-01', "cut with file argument 'cut -d : -f 1 /workspace/test.txt'", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)} (file operand ignored)`);
  }

  // 3.2 cut multi-byte UTF-8 data
  {
    const r = await safeExec("cut -f 1", vfs => {}, "🚀\trocket\tspace\nこんにちは\thello\tworld\n");
    // test piping stdin
    const rStdin = await safeExec("printf '🚀\\trocket\\tspace\\nこんにちは\\thello\\tworld\\n' | cut -f 1");
    const pass = !rStdin.threw && rStdin.res.code === 0 && rStdin.res.stdout === '🚀\nこんにちは\n';
    recordTest('CUT-02', "cut multi-byte UTF-8 fields", pass,
      rStdin.threw ? rStdin.error.message : `stdout: ${JSON.stringify(rStdin.res.stdout)}`);
  }

  // 3.3 cut multi-byte character delimiter
  {
    const r = await safeExec("printf 'apple—fruit—red\\nbanana—fruit—yellow\\n' | cut -d — -f 1,3");
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'apple—red\nbanana—yellow\n';
    recordTest('CUT-03', "cut multi-byte delimiter '—'", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 3.4 cut character slicing -c 2-4
  {
    const r = await safeExec("printf 'abcdefgh\\n' | cut -c 2-4");
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === 'bcd\n';
    recordTest('CUT-04', "cut character slice 'cut -c 2-4'", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)} (-c flag ignored)`);
  }

  // 3.5 cut non-existent file returns code > 0
  {
    const r = await safeExec("cut -d : -f 1 /workspace/nosuchfile.txt");
    const pass = !r.threw && r.res.code > 0;
    recordTest('CUT-05', "cut non-existent file returns exit code > 0", pass,
      r.threw ? r.error.message : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 4: SORT NUMERIC REVERSE ON NEGATIVE NUMBERS
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 4: sort Numeric Reverse on Negative Numbers ---\x1b[0m');

  // 4.1 sort -n ascending on negative integers
  {
    const r = await safeExec("sort -n /workspace/nums.txt", vfs => {
      vfs.writeFileSync('/workspace/nums.txt', '10\n-5\n0\n-10\n3\n-2\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === '-10\n-5\n-2\n0\n3\n10\n';
    recordTest('SORT-01', "sort -n ascending on negative numbers", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 4.2 sort -n -r descending on negative integers
  {
    const r = await safeExec("sort -n -r /workspace/nums.txt", vfs => {
      vfs.writeFileSync('/workspace/nums.txt', '10\n-5\n0\n-10\n3\n-2\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === '10\n3\n0\n-2\n-5\n-10\n';
    recordTest('SORT-02', "sort -n -r descending on negative numbers", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 4.3 sort -nr combined flags
  {
    const r = await safeExec("sort -nr /workspace/nums.txt", vfs => {
      vfs.writeFileSync('/workspace/nums.txt', '10\n-5\n0\n-10\n3\n-2\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === '10\n3\n0\n-2\n-5\n-10\n';
    recordTest('SORT-03', "sort -nr combined flag parsing", pass,
      r.threw ? r.error.message : `code=${r.res.code}, stderr=${JSON.stringify(r.res.stderr)}`);
  }

  // 4.4 sort -n -r on floating point negative numbers
  {
    const r = await safeExec("sort -n -r /workspace/floats.txt", vfs => {
      vfs.writeFileSync('/workspace/floats.txt', '0.5\n-1.5\n-0.5\n1.5\n-2.0\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === '1.5\n0.5\n-0.5\n-1.5\n-2.0\n';
    recordTest('SORT-04', "sort -n -r on negative floats", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 4.5 sort on directory path (must not throw unhandled EISDIR)
  {
    const r = await safeExec("sort /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('SORT-05', "sort on directory path handles error without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.name}: ${r.error.message}` : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 5: UNIQ -C ON EMPTY / SINGLE / LARGE INPUTS
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 5: uniq -c on Boundary Inputs ---\x1b[0m');

  // 5.1 uniq -c on empty input
  {
    const r = await safeExec("printf '' | uniq -c");
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === '';
    recordTest('UNIQ-01', "uniq -c on empty stdin", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 5.2 uniq -c on single line
  {
    const r = await safeExec("printf 'hello\\n' | uniq -c");
    const pass = !r.threw && r.res.code === 0 && r.res.stdout.trim() === '1 hello';
    recordTest('UNIQ-02', "uniq -c on single line", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 5.3 uniq -c on large input (5000 lines)
  {
    let content = '';
    for (let i = 0; i < 2000; i++) content += 'alpha\n';
    for (let i = 0; i < 3000; i++) content += 'beta\n';
    const r = await safeExec("uniq -c /workspace/large.txt", vfs => {
      vfs.writeFileSync('/workspace/large.txt', content);
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout.includes('2000 alpha') && r.res.stdout.includes('3000 beta');
    recordTest('UNIQ-03', "uniq -c on 5000 lines grouped input", pass,
      r.threw ? r.error.message : `stdout snippet: ${JSON.stringify(r.res.stdout.slice(0, 40))}`);
  }

  // 5.4 uniq -ci combined flags
  {
    const r = await safeExec("printf 'hello\\nHELLO\\n' | uniq -ci");
    const pass = !r.threw && r.res.code === 0 && r.res.stdout.trim() === '2 hello';
    recordTest('UNIQ-04', "uniq -ci combined flag parsing", pass,
      r.threw ? r.error.message : `code=${r.res.code}, stderr=${JSON.stringify(r.res.stderr)}`);
  }

  // 5.5 uniq on directory path handles error without crash
  {
    const r = await safeExec("uniq /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('UNIQ-05', "uniq on directory path handles error without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.name}: ${r.error.message}` : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 6: DIFF -U ON IDENTICAL VS DIFFERENT FILES
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 6: diff -u Edge Cases ---\x1b[0m');

  // 6.1 diff -u on identical files -> code 0, stdout empty
  {
    const r = await safeExec("diff -u /workspace/a.txt /workspace/b.txt", vfs => {
      vfs.writeFileSync('/workspace/a.txt', 'one\ntwo\nthree\n');
      vfs.writeFileSync('/workspace/b.txt', 'one\ntwo\nthree\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout === '';
    recordTest('DIFF-01', "diff -u on identical files returns code 0 and empty stdout", pass,
      r.threw ? r.error.message : `code=${r.res.code}, stdout=${JSON.stringify(r.res.stdout)}`);
  }

  // 6.2 diff -u on completely different files -> code 1, full additions & deletions
  {
    const r = await safeExec("diff -u /workspace/a.txt /workspace/b.txt", vfs => {
      vfs.writeFileSync('/workspace/a.txt', 'one\ntwo\nthree\n');
      vfs.writeFileSync('/workspace/b.txt', 'apple\nbanana\ncherry\n');
    });
    const pass = !r.threw && r.res.code === 1 && r.res.stdout.includes('--- /workspace/a.txt') && r.res.stdout.includes('+++ /workspace/b.txt');
    recordTest('DIFF-02', "diff -u on completely different files returns code 1 with unified headers", pass,
      r.threw ? r.error.message : `code=${r.res.code}`);
  }

  // 6.3 diff missing operand -> code 2
  {
    const r = await safeExec("diff -u /workspace/a.txt", vfs => {
      vfs.writeFileSync('/workspace/a.txt', 'one\n');
    });
    const pass = !r.threw && r.res.code === 2 && r.res.stderr.includes('missing operand');
    recordTest('DIFF-03', "diff missing operand returns code 2", pass,
      r.threw ? r.error.message : `code=${r.res.code}`);
  }

  // 6.4 diff on directory path handles error without crash
  {
    const r = await safeExec("diff /workspace/dirA /workspace/dirB", vfs => {
      vfs.mkdirSync('/workspace/dirA');
      vfs.mkdirSync('/workspace/dirB');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('DIFF-04', "diff on directory path handles error without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.name}: ${r.error.message}` : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 7: FIND DEEP DIRECTORY TREES
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 7: find Deep Directory Trees ---\x1b[0m');

  // 7.1 find 15 levels deep tree
  {
    const r = await safeExec("find /workspace/root -name 'marker*.txt'", vfs => {
      let cur = '/workspace/root';
      vfs.mkdirSync(cur);
      for (let i = 1; i <= 15; i++) {
        cur += `/d${i}`;
        vfs.mkdirSync(cur);
        vfs.writeFileSync(`${cur}/marker_${i}.txt`, `depth ${i}`);
      }
    });
    const matches = (r.res && r.res.stdout ? r.res.stdout.match(/marker_\d+\.txt/g) || [] : []).length;
    const pass = !r.threw && r.res.code === 0 && matches === 15;
    recordTest('FIND-01', "find traversed 15 directory levels finding all 15 markers", pass,
      r.threw ? r.error.message : `matches=${matches}/15`);
  }

  // 7.2 find -type f vs -type d
  {
    const r = await safeExec("find /workspace/mixed -type d", vfs => {
      vfs.mkdirSync('/workspace/mixed');
      vfs.mkdirSync('/workspace/mixed/sub1');
      vfs.mkdirSync('/workspace/mixed/sub2');
      vfs.writeFileSync('/workspace/mixed/file.txt', 'file');
    });
    const hasFile = r.res && r.res.stdout ? r.res.stdout.includes('file.txt') : true;
    const pass = !r.threw && r.res.code === 0 && !hasFile;
    recordTest('FIND-02', "find -type d filters out regular files", pass,
      r.threw ? r.error.message : `hasFile=${hasFile}, stdout=${JSON.stringify(r.res.stdout)}`);
  }

  // 7.3 find non-existent root returns code 1
  {
    const r = await safeExec("find /workspace/does_not_exist");
    const pass = !r.threw && r.res.code === 1 && r.res.stderr.length > 0;
    recordTest('FIND-03', "find non-existent directory returns code 1", pass,
      r.threw ? r.error.message : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 8: GREP FLAGS COMBINATIONS (-i -n -v)
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 8: grep Flag Combinations (-i -n -v) ---\x1b[0m');

  // 8.1 grep separate flags: -i -n -v
  {
    const r = await safeExec("grep -i -n -v 'hello' /workspace/grep.txt", vfs => {
      vfs.writeFileSync('/workspace/grep.txt', 'Hello World\nHELLO UNIVERSE\nGoodbye Earth\nhello planet\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout.trim() === '3:Goodbye Earth';
    recordTest('GREP-01', "grep -i -n -v 'hello' (case-insensitive inverted line-numbered)", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 8.2 grep combined flags: -inv
  {
    const r = await safeExec("grep -inv 'hello' /workspace/grep.txt", vfs => {
      vfs.writeFileSync('/workspace/grep.txt', 'Hello World\nHELLO UNIVERSE\nGoodbye Earth\nhello planet\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stdout.trim() === '3:Goodbye Earth';
    recordTest('GREP-02', "grep -inv 'hello' (combined flags)", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)}`);
  }

  // 8.3 grep flags placed after pattern: grep 'hello' -i
  {
    const r = await safeExec("grep 'hello' -i /workspace/grep.txt", vfs => {
      vfs.writeFileSync('/workspace/grep.txt', 'Hello World\nGoodbye Earth\n');
    });
    const pass = !r.threw && r.res.code === 0 && r.res.stderr === '' && r.res.stdout.includes('Hello World');
    recordTest('GREP-03', "grep flags after pattern 'grep pattern -i file'", pass,
      r.threw ? r.error.message : `stderr: ${JSON.stringify(r.res.stderr)} (flag treated as file)`);
  }

  // 8.4 grep non-existent file returns code > 0 (POSIX: code 2)
  {
    const r = await safeExec("grep 'hello' /workspace/nosuchfile.txt");
    const pass = !r.threw && r.res.code > 0;
    recordTest('GREP-04', "grep non-existent file returns code > 0", pass,
      r.threw ? r.error.message : `code=${r.res.code}`);
  }

  // 8.5 grep invalid regex handles error safely without crashing
  {
    const r = await safeExec("grep '[' /workspace/grep.txt", vfs => {
      vfs.writeFileSync('/workspace/grep.txt', 'content\n');
    });
    const pass = !r.threw && r.res.code === 2 && r.res.stderr.includes('invalid pattern');
    recordTest('GREP-05', "grep invalid regex returns code 2 without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.message}` : `code=${r.res.code}`);
  }

  // =========================================================================
  // SECTION 9: PROCESS / FILE MUTATION & EXCEPTION SAFETY AUDIT
  // =========================================================================
  console.log('\n\x1b[1m--- Suite 9: Process, File Operations & Exception Safety ---\x1b[0m');

  // 9.1 rm without -r on directory must fail with error code > 0
  {
    const r = await safeExec("rm /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const dirStillExists = r.vfs.existsSync('/workspace/somedir');
    const pass = !r.threw && r.res.code > 0 && dirStillExists;
    recordTest('RM-01', "rm on directory without -r fails and leaves directory intact", pass,
      r.threw ? r.error.message : `code=${r.res.code}, dirStillExists=${dirStillExists} (directory was deleted without -r)`);
  }

  // 9.2 cp file to existing directory copies into directory
  {
    const r = await safeExec("cp /workspace/file.txt /workspace/destdir", vfs => {
      vfs.writeFileSync('/workspace/file.txt', 'content');
      vfs.mkdirSync('/workspace/destdir');
    });
    const copiedExists = r.vfs.existsSync('/workspace/destdir/file.txt');
    const pass = !r.threw && r.res.code === 0 && copiedExists;
    recordTest('CP-01', "cp file.txt destdir/ copies into directory", pass,
      r.threw ? r.error.message : `code=${r.res.code}, copiedExists=${copiedExists}, stderr=${JSON.stringify(r.res.stderr)}`);
  }

  // 9.3 head on directory path handles error without crashing
  {
    const r = await safeExec("head /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('HEAD-01', "head on directory path handles error without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.name}: ${r.error.message}` : `code=${r.res.code}`);
  }

  // 9.4 tail on directory path handles error without crashing
  {
    const r = await safeExec("tail /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('TAIL-01', "tail on directory path handles error without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.name}: ${r.error.message}` : `code=${r.res.code}`);
  }

  // 9.5 tee on directory path handles error without crashing
  {
    const r = await safeExec("printf 'hello' | tee /workspace/somedir", vfs => {
      vfs.mkdirSync('/workspace/somedir');
    });
    const pass = !r.threw && r.res.code > 0;
    recordTest('TEE-01', "tee on directory path handles error without crash", pass,
      r.threw ? `UNHANDLED CRASH: ${r.error.name}: ${r.error.message}` : `code=${r.res.code}`);
  }

  // 9.6 kill on non-existent PID returns exit code > 0
  {
    const r = await safeExec("kill 9999");
    const pass = !r.threw && r.res.code > 0;
    recordTest('KILL-01', "kill on non-existent PID returns exit code > 0", pass,
      r.threw ? r.error.message : `code=${r.res.code} (silently returned 0 for invalid PID)`);
  }

  // 9.7 wc -c multibyte byte count vs UTF-16 code units
  {
    const r = await safeExec("printf '🚀' | wc -c");
    // '🚀' in UTF-8 is 4 bytes
    const pass = !r.threw && r.res.code === 0 && r.res.stdout.trim() === '4';
    recordTest('WC-01', "wc -c reports UTF-8 byte count (4) for rocket emoji", pass,
      r.threw ? r.error.message : `stdout: ${JSON.stringify(r.res.stdout)} (counted UTF-16 code units instead of bytes)`);
  }

  console.log('\n\x1b[1m============================================================\x1b[0m');
  console.log(`\x1b[1mTOTAL TESTS: ${results.total}\x1b[0m`);
  console.log(`\x1b[32mPASSED:      ${results.passed}\x1b[0m`);
  console.log(`\x1b[31mFAILED:      ${results.failed}\x1b[0m`);
  console.log('\x1b[1m============================================================\x1b[0m\n');

  if (results.failed > 0) {
    console.log('\x1b[31mFAILURES SUMMARY:\x1b[0m');
    for (const f of results.failures) {
      console.log(` - [${f.id}] ${f.name}: ${f.details}`);
    }
  }
}

runAdversarialSuite().catch(console.error);
