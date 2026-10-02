#!/usr/bin/env node
// Cache-busting for a zero-build site.
// Rewrites every local <script src> / <link href> in the HTML entry points to
// "path?v=<content-hash>", so browsers re-download a file only when it changed.
// Also stamps window.ASSET_VERSION (hash of data/archive/) for lazily loaded files.
// Usage: node tools/stamp-assets.js [--check]   (--check exits 1 if anything is stale)

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const check = process.argv.includes('--check');
const pages = ['index.html', 'projects/index.html'].filter(p => fs.existsSync(path.join(root, p)));

// Normalise CRLF so a Windows checkout (core.autocrlf) hashes the same as the deployed LF files
const hashOf = buf => crypto.createHash('sha1').update(buf.toString('utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 10);

function hashDir(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return '0';
  const h = crypto.createHash('sha1');
  for (const f of fs.readdirSync(dir).sort()) h.update(f).update(fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n'));
  return h.digest('hex').slice(0, 10);
}


// Per-module data loaded on demand by js/lazy.js: {path: hash}, plus site-wide counts the
// landing page shows without loading that data.
function lazyMeta() {
  const manifest = {};
  const win = { MODULE_CONTENT: {}, QUESTION_BANK: {} };
  for (const dir of ['data/content', 'data/questions']) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs).filter(f => f.endsWith('.js')).sort()) {
      const buf = fs.readFileSync(path.join(abs, f));
      manifest[`${dir}/${f}`] = hashOf(buf);
      vm.runInNewContext(buf.toString('utf8'), { window: win });
    }
  }
  const videos = new Set();
  for (const m of Object.values(win.MODULE_CONTENT)) for (const u of Object.values(m)) {
    if (u.video?.youtubeId) videos.add(u.video.youtubeId);
    (u.videos || []).forEach(v => videos.add(v.youtubeId));
  }
  const questions = Object.values(win.QUESTION_BANK).reduce((n, qs) => n + qs.length, 0);
  const sims = new Set();
  for (const f of fs.readdirSync(path.join(root, 'js')).filter(f => /^simulators.*\.js$/.test(f))) {
    for (const m of fs.readFileSync(path.join(root, 'js', f), 'utf8').matchAll(/window\.SIMULATORS(?:\[['"]([^'"]+)['"]\]|\.(\w+))\s*=/g)) sims.add(m[1] || m[2]);
  }
  const site = { CURRICULUM_DATA: null, IMPLEMENTATIONS_DATA: {} };
  for (const f of ['data/curriculum.js', 'data/implementations_code.js']) {
    if (fs.existsSync(path.join(root, f))) vm.runInNewContext(fs.readFileSync(path.join(root, f), 'utf8'), { window: site });
  }
  const topics = (site.CURRICULUM_DATA?.parts || []).reduce((n, p) => n + p.modules.reduce((k, m) => k + m.units.length, 0), 0);
  const counts = { topics, simulators: sims.size, builds: Object.keys(site.IMPLEMENTATIONS_DATA).length, videos: videos.size, questions };
  const tag = `<script>window.LAZY_MANIFEST = ${JSON.stringify(manifest)}; window.SITE_COUNTS = ${JSON.stringify(counts)};</script>`;

  // Prerender the landing page with the real Landing.render() for a first-time visitor,
  // so it paints in one go; app.js swaps in the live version (progress, demo) on load.
  const page = {
    ...site,
    SITE_COUNTS: counts,
    SIMULATORS: Object.fromEntries([...sims].map(id => [id, {}])),
    Progress: { getLastVisited: () => null, getModuleProgress: () => ({ completed: 0, total: 0 }) },
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/landing.js'), 'utf8'), { window: page });
  const landing = page.Landing.render().replace('<div class="landing">', '<div class="landing landing-shell">');
  return { tag, landing };
}

let stale = 0;
for (const page of pages) {
  const file = path.join(root, page);
  const src = fs.readFileSync(file, 'utf8');
  let out = src.replace(/(<(?:script|link)\b[^>]*?\s(?:src|href)=")([^"?#]+\.(?:js|css))(?:\?v=[\w]+)?(")/g, (all, pre, url, post) => {
    if (/^(https?:)?\/\//.test(url)) return all;
    const abs = path.join(root, url); // all pages are served from root-relative URLs (/projects is a rewrite)
    if (!fs.existsSync(abs)) { console.warn(`  ! ${page}: missing ${url}`); return all; }
    return `${pre}${url}?v=${hashOf(fs.readFileSync(abs))}${post}`;
  });
  if (page === 'index.html') {
    const tag = `<script>window.ASSET_VERSION = "${hashDir('data/archive')}";</script>`;
    out = /<script>window\.ASSET_VERSION = "[\w]*";<\/script>/.test(out)
      ? out.replace(/<script>window\.ASSET_VERSION = "[\w]*";<\/script>/, tag)
      : out.replace('</head>', `  ${tag}\n</head>`);
  }
  if (page === 'index.html') {
    const { tag: meta, landing } = lazyMeta();
    out = /<script>window\.LAZY_MANIFEST = [^\n]*<\/script>/.test(out)
      ? out.replace(/<script>window\.LAZY_MANIFEST = [^\n]*<\/script>/, () => meta)
      : out.replace('</head>', () => `  ${meta}\n</head>`);
    out = out.replace(/(<!-- landing:start[^>]*-->\n)[\s\S]*?(\s*<!-- landing:end -->)/, (all, open, close) => open + landing + close);
  }
  if (out !== src) {
    stale++;
    if (!check) fs.writeFileSync(file, out);
    console.log(`${check ? 'stale' : 'stamped'}: ${page}`);
  } else console.log(`up to date: ${page}`);
}
if (check && stale) process.exit(1);
