#!/usr/bin/env node
/**
 * Builds the clean `dist/` directory for Cloudflare Pages deployment.
 * Copies ONLY public website files into `dist/`, strictly excluding
 * `tools/`, `.github/`, `scratch/`, `docs/`, and repo markdown files.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const PUBLIC_ITEMS = [
  'index.html',
  '404.html',
  '_headers',
  '_redirects',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'favicon.svg',
  'preview-sw.js',
  'CNAME',
  '.well-known',
  'assets',
  'audio',
  'build',
  'challenges',
  'css',
  'dashboard',
  'data',
  'design-system',
  'fonts',
  'glossary',
  'js',
  'projects',
  'roadmap',
  'sandbox',
  'topic'
];

if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

for (const item of PUBLIC_ITEMS) {
  const src = path.join(ROOT, item);
  const dest = path.join(DIST, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

console.log(`✓ Built clean dist/ directory with ${PUBLIC_ITEMS.length} public entries (excluded tools/, .github/, scratch/, and docs/)`);
