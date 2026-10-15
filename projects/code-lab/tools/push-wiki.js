#!/usr/bin/env node
/**
 * Synchronize wiki/*.md to GitHub Wiki (git@github.com:innovatorved/code-lab.wiki.git)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WIKI_SRC = path.join(ROOT, 'wiki');
const TMP_DIR = path.join(require('os').tmpdir(), 'code-lab-wiki-' + Date.now());
const WIKI_REMOTE = 'git@github.com:innovatorved/code-lab.wiki.git';

console.log('Synchronizing CodeLab Wiki to GitHub...');

// Check remote existence
try {
  execSync(`git ls-remote ${WIKI_REMOTE}`, { stdio: 'pipe' });
} catch (e) {
  console.error('\nNotice: GitHub Wiki repository is not yet initialized.');
  console.error('To initialize it once:');
  console.error('1. Open: https://github.com/innovatorved/code-lab/wiki');
  console.error('2. Click "Create the first page" and save.');
  console.error('3. Re-run "npm run wiki:push" to synchronize all 9 wiki pages.\n');
  process.exit(1);
}

try {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  execSync(`git clone ${WIKI_REMOTE} ${TMP_DIR}`, { stdio: 'inherit' });

  // Copy all files from wiki/ into cloned wiki repo
  const files = fs.readdirSync(WIKI_SRC);
  for (const f of files) {
    if (f.endsWith('.md')) {
      fs.copyFileSync(path.join(WIKI_SRC, f), path.join(TMP_DIR, f));
      console.log(`  + ${f}`);
    }
  }

  execSync(`cd ${TMP_DIR} && git add -A && git commit -m "docs: sync wiki documentation" && git push origin master`, { stdio: 'inherit' });
  console.log('✓ Successfully published all wiki pages to GitHub Wiki!');
} catch (err) {
  console.error('Failed to sync wiki:', err.message);
  process.exit(1);
} finally {
  try {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  } catch (_) {}
}
