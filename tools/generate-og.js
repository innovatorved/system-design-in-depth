#!/usr/bin/env node
/**
 * Per-Page Open Graph & Twitter Card Generator — System Design In Depth
 * Generates 1200×630 PNG social cards in assets/og/*.png (plus assets/og-image.png)
 * for the landing page, hubs, 404, 12 incident challenges, 200 topic lessons, and 20 build labs
 * using the Neutral Charcoal (#0F0F10 / #141416) + Monochrome Crisp Ink (#F4F4F5) palette.
 *
 * Usage: node tools/generate-og.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'og');
fs.mkdirSync(OUT_DIR, { recursive: true });

const RSVG_CANDIDATES = [
  process.env.RSVG_CONVERT,
  '/opt/homebrew/bin/rsvg-convert',
  '/opt/homebrew/Caskroom/miniconda/base/bin/rsvg-convert',
  '/usr/local/bin/rsvg-convert',
  'rsvg-convert'
].filter(Boolean);

let rsvgBin = null;
for (const bin of RSVG_CANDIDATES) {
  const res = spawnSync(bin, ['--version'], { encoding: 'utf8' });
  if (res.status === 0) {
    rsvgBin = bin;
    break;
  }
}
if (!rsvgBin) {
  console.error('rsvg-convert not found. Install librsvg to rasterize 1200x630 OG PNGs.');
  process.exit(1);
}

function escXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapLines(text, maxChars, maxLines) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars || !cur) {
      cur = next;
    } else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  const usedWords = lines.join(' ').split(' ').filter(Boolean).length;
  const remaining = words.slice(usedWords).join(' ');
  if (remaining) {
    if (remaining.length <= maxChars + 3) {
      lines.push(remaining);
    } else {
      lines.push(remaining.slice(0, maxChars - 1).replace(/[,;:\-\s]+$/, '') + '…');
    }
  }
  return lines.slice(0, maxLines);
}

function schematicSvg(variant) {
  if (variant === 'quorum') {
    return `
      <g transform="translate(855, 165)">
        <rect x="0" y="0" width="275" height="300" rx="12" fill="#18181A" stroke="#2D2D31" stroke-width="1.5"/>
        <text x="20" y="30" fill="#A1A1AA" font-family="Menlo, Monaco, monospace" font-size="12" font-weight="700">RAFT / QUORUM CONSENSUS</text>
        <line x1="138" y1="88" x2="72" y2="152" stroke="#E4E4E7" stroke-width="1.8"/>
        <line x1="138" y1="88" x2="204" y2="152" stroke="#E4E4E7" stroke-width="1.8"/>
        <line x1="72" y1="152" x2="204" y2="152" stroke="#3F3F46" stroke-width="1.4" stroke-dasharray="4 3"/>
        <circle cx="138" cy="72" r="22" fill="#27272A" stroke="#F4F4F5" stroke-width="1.8"/>
        <text x="138" y="77" text-anchor="middle" fill="#FAFAFA" font-family="Menlo, Monaco, monospace" font-size="12" font-weight="700">L·T4</text>
        <circle cx="72" cy="160" r="20" fill="#27272A" stroke="#E4E4E7" stroke-width="1.6"/>
        <text x="72" y="165" text-anchor="middle" fill="#FFFFFF" font-family="Menlo, Monaco, monospace" font-size="12" font-weight="700">F1</text>
        <circle cx="204" cy="160" r="20" fill="#1F1F23" stroke="#3F3F46" stroke-width="1.5"/>
        <text x="204" y="165" text-anchor="middle" fill="#D4D4D8" font-family="Menlo, Monaco, monospace" font-size="12">F2</text>
        <rect x="18" y="212" width="240" height="64" rx="6" fill="#121213" stroke="#27272A" stroke-width="1.5"/>
        <text x="32" y="236" fill="#F4F4F5" font-family="Menlo, Monaco, monospace" font-size="11" font-weight="700">LINEARIZABLE QUORUM</text>
        <text x="32" y="258" fill="#A1A1AA" font-family="Menlo, Monaco, monospace" font-size="11">R + W &gt; N · Commit idx #482</text>
      </g>`;
  }
  if (variant === 'lsm') {
    return `
      <g transform="translate(855, 165)">
        <rect x="0" y="0" width="275" height="300" rx="12" fill="#18181A" stroke="#2D2D31" stroke-width="1.5"/>
        <text x="20" y="30" fill="#A1A1AA" font-family="Menlo, Monaco, monospace" font-size="12" font-weight="700">WAL + LSM STORAGE ENGINE</text>
        <rect x="20" y="52" width="235" height="52" rx="6" fill="#1F1F23" stroke="#3F3F46" stroke-width="1.5"/>
        <text x="34" y="74" fill="#A1A1AA" font-family="Menlo, Monaco, monospace" font-size="11">1. APPEND-ONLY WAL + MEMTABLE</text>
        <text x="34" y="93" fill="#D4D4D8" font-family="Menlo, Monaco, monospace" font-size="12">fsync(lsn=9402) · SkipList</text>
        <line x1="138" y1="104" x2="138" y2="132" stroke="#E4E4E7" stroke-width="1.5"/>
        <rect x="20" y="132" width="235" height="54" rx="6" fill="#27272A" stroke="#F4F4F5" stroke-width="1.5"/>
        <text x="34" y="154" fill="#E4E4E7" font-family="Menlo, Monaco, monospace" font-size="11" font-weight="700">2. BLOOM + SSTABLE L0 -&gt; L2</text>
        <text x="34" y="174" fill="#FFFFFF" font-family="Menlo, Monaco, monospace" font-size="12" font-weight="700">10 bits/key · 0.8% FP rate</text>
        <rect x="20" y="212" width="235" height="64" rx="6" fill="#121213" stroke="#27272A" stroke-width="1.5"/>
        <text x="34" y="236" fill="#4ADE80" font-family="Menlo, Monaco, monospace" font-size="11" font-weight="700">WRITE AMPLIFICATION BOUNDED</text>
        <text x="34" y="256" fill="#A1A1AA" font-family="Menlo, Monaco, monospace" font-size="11">Sequential I/O · Compaction</text>
      </g>`;
  }
  return `
    <g transform="translate(855, 165)">
      <rect x="0" y="0" width="275" height="300" rx="12" fill="#18181A" stroke="#2D2D31" stroke-width="1.5"/>
      <text x="20" y="30" fill="#A1A1AA" font-family="Menlo, Monaco, monospace" font-size="12" font-weight="700">EDGE -&gt; CACHE -&gt; SHARD</text>
      <rect x="20" y="50" width="235" height="44" rx="6" fill="#1F1F23" stroke="#3F3F46" stroke-width="1.5"/>
      <text x="34" y="77" fill="#D4D4D8" font-family="Menlo, Monaco, monospace" font-size="12">1. L7 GATEWAY · TOKEN BUCKET</text>
      <line x1="138" y1="94" x2="138" y2="116" stroke="#A1A1AA" stroke-width="1.5"/>
      <rect x="20" y="116" width="235" height="44" rx="6" fill="#27272A" stroke="#F4F4F5" stroke-width="1.5"/>
      <text x="34" y="143" fill="#FFFFFF" font-family="Menlo, Monaco, monospace" font-size="12" font-weight="700">2. SINGLEFLIGHT + REDIS</text>
      <line x1="138" y1="160" x2="138" y2="182" stroke="#A1A1AA" stroke-width="1.5"/>
      <rect x="20" y="182" width="235" height="44" rx="6" fill="#1F1F23" stroke="#3F3F46" stroke-width="1.5"/>
      <text x="34" y="209" fill="#D4D4D8" font-family="Menlo, Monaco, monospace" font-size="12">3. CONSISTENT HASH SHARDS</text>
      <rect x="20" y="242" width="235" height="40" rx="6" fill="#121213" stroke="#27272A" stroke-width="1.5"/>
      <text x="34" y="267" fill="#E4E4E7" font-family="Menlo, Monaco, monospace" font-size="11" font-weight="700">p99 &lt; 45ms · 99.99% SLO</text>
    </g>`;
}

function buildCardSvg({ badge, title, subtitle, variant }) {
  const titleLines = wrapLines(title, 26, 3);
  const subLines = wrapLines(subtitle, 48, 2);

  const titleFontSize = titleLines.length >= 3 ? 44 : 50;
  const titleLineHeight = titleLines.length >= 3 ? 54 : 60;
  const titleStartY = 225;

  const titleTspans = titleLines.map((line, i) => (
    `<text x="68" y="${titleStartY + i * titleLineHeight}" fill="#F4F4F5" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${titleFontSize}" font-weight="700">${escXml(line)}</text>`
  )).join('\n  ');

  const subStartY = titleStartY + titleLines.length * titleLineHeight + 18;
  const subTspans = subLines.map((line, i) => (
    `<text x="68" y="${subStartY + i * 32}" fill="#A1A1AA" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="22" font-weight="400">${escXml(line)}</text>`
  )).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0F0F10"/>
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="#141416" stroke="#27272A" stroke-width="1.5"/>
  <rect x="24" y="24" width="1152" height="6" fill="#F4F4F5"/>

  <!-- Brand & Module Header -->
  <rect x="68" y="72" width="48" height="34" rx="6" fill="#F4F4F5"/>
  <text x="92" y="95" text-anchor="middle" fill="#0F0F10" font-family="Menlo, Monaco, monospace" font-size="16" font-weight="700">SD</text>
  <text x="130" y="95" fill="#F4F4F5" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="19" font-weight="700">SYSTEM DESIGN IN DEPTH</text>

  <rect x="68" y="128" width="${Math.min(720, Math.max(210, badge.length * 10 + 28))}" height="30" rx="6" fill="#1C1C1F" stroke="#3F3F46" stroke-width="1"/>
  <text x="82" y="148" fill="#E4E4E7" font-family="Menlo, Monaco, monospace" font-size="13" font-weight="700">${escXml(badge.toUpperCase())}</text>

  <!-- Title & Promise -->
  ${titleTspans}
  ${subTspans}

  <!-- Right-side Architectural Schematic -->
  ${schematicSvg(variant)}

  <!-- Footer -->
  <line x1="68" y1="530" x2="1132" y2="530" stroke="#27272A" stroke-width="1"/>
  <text x="68" y="566" fill="#E4E4E7" font-family="Menlo, Monaco, monospace" font-size="16" font-weight="700">system-design-in-depth.vedgupta.in</text>
  <text x="1132" y="566" text-anchor="end" fill="#A1A1AA" font-family="Menlo, Monaco, monospace" font-size="14">6 Tracks · 200 Topics · 32 Simulators &amp; 20 Builds</text>
</svg>`;
}

function renderPng(svgStr, outPath) {
  const res = spawnSync(rsvgBin, ['-w', '1200', '-h', '630', '-f', 'png', '-o', outPath], {
    input: Buffer.from(svgStr, 'utf8')
  });
  if (res.status !== 0) {
    throw new Error(`rsvg-convert failed for ${outPath}: ${res.stderr?.toString()}`);
  }
}

const ctx = { window: { MODULE_CONTENT: {}, ARCHIVE_CONTENT: {}, IMPLEMENTATIONS_DATA: {}, CURRICULUM_DATA: null, CHALLENGES_DATA: [] } };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data/curriculum.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data/implementations_code.js'), 'utf8'), ctx);
if (fs.existsSync(path.join(ROOT, 'data/challenges.js'))) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data/challenges.js'), 'utf8'), ctx);
}
for (const sub of ['data/content', 'data/archive']) {
  const dir = path.join(ROOT, sub);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
    vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
  }
}

const cards = [
  {
    name: 'home',
    badge: 'Interactive Textbook · Simulators & Build Labs',
    title: 'System Design & Distributed Systems, In Depth',
    subtitle: 'From Raft quorums and LSM storage engines to L7 load balancing, production incidents, and capacity math.',
    variant: 'quorum'
  },
  {
    name: 'roadmap',
    badge: '6 Tracks · 18 Modules · 200 Lessons',
    title: 'Interactive System Design Roadmap',
    subtitle: 'Visual 34-node dependency DAG, staff-level study tracks, and structured curriculum explorer.',
    variant: 'gateway'
  },
  {
    name: 'challenges',
    badge: '12 Production Outage & Incident Rooms',
    title: 'Production Incident & Outage Challenges',
    subtitle: 'Diagnose retry storms, split-brain quorums, thundering herds, and ship verified hotfixes.',
    variant: 'gateway'
  },
  {
    name: 'sandbox',
    badge: 'Architecture Whiteboard & Capacity Estimator',
    title: 'Architecture Blueprint & Capacity Sandbox',
    subtitle: 'Model QPS envelopes, storage growth, replication topologies, and bottleneck budgets interactively.',
    variant: 'quorum'
  },
  {
    name: 'dashboard',
    badge: 'Local-First Study Workspace',
    title: 'Learner Study Hub, SRS Cards & Capacity Toolkit',
    subtitle: 'Track completed modules, review spaced-repetition flashcards, and run live napkin-math estimators.',
    variant: 'lsm'
  },
  {
    name: 'glossary',
    badge: 'First-Principles Definitions',
    title: 'Distributed Systems & Architecture Glossary',
    subtitle: 'Concise engineering definitions for linearizability, quorums, WAL, compaction, and tail latency.',
    variant: 'quorum'
  },
  {
    name: 'projects',
    badge: 'Systems Engineering Case Studies',
    title: 'System Design Projects & Open-Source Engines',
    subtitle: 'Hands-on distributed systems implementations, storage engines, and real-world architecture studies.',
    variant: 'lsm'
  },
  {
    name: '404',
    badge: 'System Design In Depth · Navigation',
    title: 'Explore 200 Distributed Systems & Design Lessons',
    subtitle: '32 interactive simulators, primary-source paper citations, and 20 from-scratch build labs.',
    variant: 'gateway'
  }
];

const rawChallenges = Array.isArray(ctx.window.CHALLENGES_DATA)
  ? ctx.window.CHALLENGES_DATA
  : (ctx.window.CHALLENGES_DATA?.challenges || []);

for (const ch of rawChallenges) {
  if (!ch || !ch.id) continue;
  cards.push({
    name: `challenge-${ch.id}`,
    badge: `Incident Challenge · ${String(ch.tier || ch.difficulty || 'Production Outage')}`,
    title: ch.title,
    subtitle: String(ch.summary || ch.subtitle || ch.incidentSummary || 'Diagnose the distributed bottleneck and verify the production recovery runbook.').slice(0, 140),
    variant: /raft|quorum|split|replica|leader/i.test(ch.id) ? 'quorum' : /wal|lsm|db|storage|index/i.test(ch.id) ? 'lsm' : 'gateway'
  });
}

for (const part of ctx.window.CURRICULUM_DATA.parts) {
  for (const mod of part.modules) {
    const variant = /storage|data|index|search/i.test(mod.id)
      ? 'lsm'
      : /consensus|replication|distributed|consistency|transactions/i.test(mod.id)
        ? 'quorum'
        : 'gateway';
    for (const unit of mod.units) {
      const mc = ctx.window.MODULE_CONTENT[mod.id]?.[unit.slug] || {};
      const ac = ctx.window.ARCHIVE_CONTENT[unit.slug] || {};
      const promise = mc.intuition || ac.excerpt || unit.summary || `${mod.title} — architectural invariants, failure modes, and production trade-offs.`;
      cards.push({
        name: `topic-${unit.slug}`,
        badge: `Module ${mod.number} · ${mod.title}`,
        title: unit.title,
        subtitle: String(promise).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        variant
      });
    }
  }
}

for (const [buildId, build] of Object.entries(ctx.window.IMPLEMENTATIONS_DATA || {})) {
  cards.push({
    name: `build-${buildId}`,
    badge: 'From-Scratch Distributed Build Lab',
    title: String(build.title || buildId).replace(/\s*\(.*\)\s*$/, ''),
    subtitle: String(build.summary || 'Step-by-step distributed systems implementation with automated tests in CodeLab.'),
    variant: /raft|lease|gossip|merkle/i.test(buildId) ? 'quorum' : /wal|lsm|bloom|search|outbox/i.test(buildId) ? 'lsm' : 'gateway'
  });
}

console.log(`Generating ${cards.length} Open Graph PNG cards (1200×630)...`);
let totalBytes = 0;
for (const card of cards) {
  const outPath = path.join(OUT_DIR, `${card.name}.png`);
  const svg = buildCardSvg(card);
  renderPng(svg, outPath);
  totalBytes += fs.statSync(outPath).size;
}

const pyCandidates = ['/opt/homebrew/Caskroom/miniconda/base/bin/python3', 'python3'];
for (const py of pyCandidates) {
  const qRes = spawnSync(py, ['-c', `
import glob
from PIL import Image
for p in glob.glob(${JSON.stringify(path.join(OUT_DIR, '*.png'))}):
    im = Image.open(p).convert('RGB').quantize(colors=96, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    im.save(p, format='PNG', optimize=True)
`], { encoding: 'utf8' });
  if (qRes.status === 0) break;
}

totalBytes = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).reduce((s, f) => s + fs.statSync(path.join(OUT_DIR, f)).size, 0);

fs.copyFileSync(path.join(OUT_DIR, 'home.png'), path.join(ROOT, 'assets', 'og-image.png'));

console.log(`✓ Generated ${cards.length} OG cards in assets/og/ (${(totalBytes / (1024 * 1024)).toFixed(2)} MB total)`);
