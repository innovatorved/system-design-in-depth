#!/usr/bin/env node
/**
 * Static Site Generation (SSG) & SEO Tool
 * Generates prerendered static pages for all 200 curriculum units at topic/<slug>/index.html
 * and builds sitemap.xml with full topic indexing.
 *
 * Usage: node tools/generate-static.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://system-design-in-depth.vedgupta.in';

// Helper: Escape HTML characters for attribute values and text
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

// Clean markdown / HTML tags to extract readable plain text
function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_{}[\]()#+!|~]/g, '')
    .replace(/\\([$#*_`])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Produce an optimal 150-160 char meta description with sentence/word boundary awareness
function makeDescription(unit, moduleData, moduleContent, archiveContent) {
  const rawText = moduleContent?.intuition ||
    archiveContent?.excerpt ||
    archiveContent?.summary ||
    unit.summary ||
    moduleContent?.notes ||
    archiveContent?.content ||
    '';

  let clean = cleanText(rawText);
  if (!clean || clean.length < 50) {
    clean = cleanText(`${unit.title}: in-depth system design guide covering architectural decisions, tradeoffs, failure modes, scalability patterns, and implementation notes.`);
  }

  const maxLen = 158;
  const minLen = 140;

  if (clean.length > maxLen) {
    const sub = clean.slice(0, maxLen);
    const sentenceMatch = sub.match(/^(.*[.!?])\s+[A-Z0-9]/);
    if (sentenceMatch && sentenceMatch[1].length >= 120) {
      clean = sentenceMatch[1];
    } else {
      let lastSpace = sub.lastIndexOf(' ');
      if (lastSpace >= minLen - 15) {
        clean = sub.slice(0, lastSpace).replace(/[,;:\-\s.]+$/, '') + '.';
      } else {
        clean = sub.slice(0, maxLen - 1).replace(/[,;:\-\s.]+$/, '') + '.';
      }
    }
  }

  if (clean.length < 130) {
    const suffix = ` Learn system design patterns and tradeoffs in ${unit.title}.`;
    const combined = clean + suffix;
    if (combined.length > maxLen) {
      const sub = combined.slice(0, maxLen);
      let lastSpace = sub.lastIndexOf(' ');
      if (lastSpace >= minLen - 15) {
        clean = sub.slice(0, lastSpace).replace(/[,;:\-\s.]+$/, '') + '.';
      } else {
        clean = sub.slice(0, maxLen - 1).replace(/[,;:\-\s.]+$/, '') + '.';
      }
    } else {
      clean = combined;
    }
  }

  return clean;
}

// 1. Initialize VM Context & Sandbox
const context = {
  window: {
    MODULE_CONTENT: {},
    ARCHIVE_CONTENT: {},
    QUESTION_BANK: {},
    IMPLEMENTATIONS_DATA: {},
    GUIDED_LABS_DATA: {},
    CURRICULUM_DATA: null,
    SIMULATORS: {},
    Progress: {
      isCompleted: () => false,
      getPercentage: () => 0,
      getStreak: () => ({ current: 0 }),
      getModuleProgress: () => ({ completed: 0, total: 0 }),
      getCompletedCount: () => 0,
      getBuildProgress: () => ({ completedSteps: [], isComplete: false })
    }
  },
  document: {
    createElement: () => ({ appendChild: () => {}, setAttribute: () => {}, classList: { add: () => {}, remove: () => {} } }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  console: console
};
context.window.window = context.window;
context.window.document = context.document;
context.window.addEventListener = () => {};
context.window.removeEventListener = () => {};

// Deterministic PRNG for reproducible SSG generation
context.Math = Object.create(Math);
let currentSsgSeed = 12345;
context.Math.random = function() {
  currentSsgSeed = (currentSsgSeed * 9301 + 49297) % 233280;
  return currentSsgSeed / 233280;
};

// 2. Load Curriculum and Data Files
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/curriculum.js'), 'utf8'), context);
if (fs.existsSync(path.join(root, 'data/implementations_code.js'))) {
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data/implementations_code.js'), 'utf8'), context);
}
if (fs.existsSync(path.join(root, 'data/guided_labs.js'))) {
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data/guided_labs.js'), 'utf8'), context);
}
if (fs.existsSync(path.join(root, 'data/challenges.js'))) {
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data/challenges.js'), 'utf8'), context);
}
if (fs.existsSync(path.join(root, 'data/whiteboard-blueprints.js'))) {
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data/whiteboard-blueprints.js'), 'utf8'), context);
}

for (const dir of ['data/content', 'data/archive', 'data/questions']) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  for (const f of fs.readdirSync(abs).filter(f => f.endsWith('.js'))) {
    vm.runInNewContext(fs.readFileSync(path.join(abs, f), 'utf8'), context);
  }
}

// 3. Load Simulators & Rendering Engines
const simulatorFiles = [
  'js/simulators.js',
  'js/simulators-extra.js',
  'js/simulators-advanced.js',
  'js/simulators-distributed.js',
  'js/simulators-ops.js',
  'js/simulators-data.js'
];

const slugToSimFile = {};

for (const sFile of simulatorFiles) {
  const p = path.join(root, sFile);
  if (fs.existsSync(p)) {
    const beforeKeys = Object.keys(context.window.SIMULATORS);
    vm.runInNewContext(fs.readFileSync(p, 'utf8'), context);
    const afterKeys = Object.keys(context.window.SIMULATORS);
    const newKeys = afterKeys.filter(k => !beforeKeys.includes(k));
    for (const simKey of newKeys) {
      const sim = context.window.SIMULATORS[simKey];
      if (sim && Array.isArray(sim.slugs)) {
        for (const slug of sim.slugs) {
          slugToSimFile[slug] = sFile;
        }
      }
    }
  }
}

for (const s of ['js/exercises.js', 'js/quiz.js', 'js/renderer.js']) {
  const p = path.join(root, s);
  if (fs.existsSync(p)) {
    vm.runInNewContext(fs.readFileSync(p, 'utf8'), context);
  }
}

function stripScriptTag(html, scriptPath) {
  const escaped = scriptPath.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp("^[ \\t]*<script\\b[^>]*src=[\x27\"]" + escaped + "(?:\\?[^\x27\"]*)?[\x27\"][^>]*>\\s*</script>\\n?", "gm");
  return html.replace(regex, "");
}

function renderStaticSidebar(curriculum, currentSlug) {
  let html = '';
  for (const part of curriculum.parts) {
    html += `<div style="padding:${part.number > 1 ? '8px' : '4px'} 16px 4px;font-size:11px;font-weight:600;color:var(--fg-faint);text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(part.title)}</div>`;

    for (const mod of part.modules) {
      html += `<div class="module-group" data-module="${escapeAttr(mod.id)}">
        <div class="module-group__header">
          <span class="module-group__chevron">${context.window.Renderer.icons.chevronDown}</span>
          <span class="module-group__number">${escapeHtml(mod.number)}</span>
          <span class="module-group__title">${escapeHtml(mod.title)}</span>
          <div class="module-group__progress"><div class="module-group__progress-fill" style="width:0%"></div></div>
        </div>
        <div class="module-group__units">`;

      for (const unit of mod.units) {
        const active = currentSlug === unit.slug;
        const statusClass = active ? 'active' : 'pending';
        const statusIcon = active ? context.window.Renderer.icons.circle : context.window.Renderer.icons.dot;

        html += `<a class="unit-item${active ? ' active' : ''}" data-slug="${escapeAttr(unit.slug)}" href="/topic/${escapeAttr(unit.slug)}/">
          <span class="unit-item__status unit-item__status--${statusClass}">${statusIcon}</span>
          <span class="unit-item__title">${escapeHtml(unit.title)}</span>
        </a>`;
      }

      html += '</div></div>';
    }
  }
  return html;
}

function renderStaticBuildsSidebar(implementations, currentBuildId) {
  let html = `<div style="padding:8px 16px 4px;font-size:11px;font-weight:600;color:var(--fg-faint);text-transform:uppercase;letter-spacing:0.05em;">Interactive Build Labs (${Object.keys(implementations).length})</div>`;
  for (const [id, item] of Object.entries(implementations)) {
    const active = id === currentBuildId;
    const statusClass = active ? 'active' : 'pending';
    const statusIcon = context.window.Renderer.icons.code;
    html += `<a class="unit-item${active ? ' active' : ''}" data-build="${escapeAttr(id)}" href="/build/${escapeAttr(id)}/">
        <span class="unit-item__status unit-item__status--${statusClass}">${statusIcon}</span>
        <span class="unit-item__title">${escapeHtml(item.title || id.replace(/-/g, ' '))}</span>
      </a>`;
  }
  return html;
}

function makeBuildDescription(buildId, build) {
  const summary = cleanText(build.summary || '');
  const base = summary
    ? `${build.title}: ${summary}`
    : `Build ${build.title} from scratch in Node.js and TypeScript with an interactive browser IDE, guided steps, and automated unit tests.`;
  if (base.length <= 160) return base;
  return base.slice(0, 157).replace(/\s+\S*$/, '') + '...';
}

const curriculum = context.window.CURRICULUM_DATA;
if (!curriculum) {
  console.error('Failed to load curriculum data.');
  process.exit(1);
}

// 4. Read Base index.html Shell
const baseHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Curriculum baseline release date
const defaultLastmod = '2026-09-18';

const sitemapUrls = [
  { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly', lastmod: defaultLastmod },
  { loc: `${baseUrl}/roadmap/`, priority: '0.8', changefreq: 'weekly', lastmod: defaultLastmod },
  { loc: `${baseUrl}/challenges/`, priority: '0.8', changefreq: 'weekly', lastmod: defaultLastmod },
  { loc: `${baseUrl}/sandbox/`, priority: '0.8', changefreq: 'weekly', lastmod: defaultLastmod },
  { loc: `${baseUrl}/dashboard/`, priority: '0.7', changefreq: 'weekly', lastmod: defaultLastmod },
  { loc: `${baseUrl}/projects/`, priority: '0.8', changefreq: 'weekly', lastmod: defaultLastmod }
];

const challengesData = context.window.CHALLENGES_DATA || [];
for (const challenge of challengesData) {
  if (challenge && challenge.id) {
    sitemapUrls.push({
      loc: `${baseUrl}/challenges/${challenge.id}/`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: defaultLastmod
    });
  }
}

let generatedCount = 0;
const units = [];

for (const part of curriculum.parts) {
  for (const mod of part.modules) {
    for (const unit of mod.units) {
      units.push({ unit, mod, part });
    }
  }
}

console.log(`Starting SSG generation for ${units.length} curriculum units...`);

// Ensure <base href="/"> is in head if not already present
let template = baseHtml;
if (!template.includes('<base href="/">')) {
  template = template.replace('<head>', '<head>\n  <base href="/">');
}
// Ensure no-shell class on <html>
template = template.replace(/<html\b([^>]*)>/i, (match, attrs) => {
  if (/class\s*=\s*"/i.test(attrs)) {
    return `<html${attrs.replace(/class\s*=\s*"([^"]*)"/i, 'class="$1 no-shell"')}>`;
  }
  return `<html${attrs} class="no-shell">`;
});

for (const { unit, mod } of units) {
  const slug = unit.slug;

  // Seed deterministic PRNG per slug so rendering is 100% reproducible
  let seed = 0;
  for (let i = 0; i < slug.length; i++) {
    seed = ((seed << 5) - seed) + slug.charCodeAt(i);
    seed |= 0;
  }
  let currentSeed = Math.abs(seed) || 12345;
  context.Math.random = function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  const modContent = context.window.MODULE_CONTENT[mod.id]?.[slug];
  const archiveContent = context.window.ARCHIVE_CONTENT[slug];
  const desc = makeDescription(unit, mod, modContent, archiveContent);
  const title = `${unit.title} — System Design In Depth`;
  const canonicalUrl = `${baseUrl}/topic/${slug}/`;

  // Prerender full lesson HTML inside VM
  const lessonHtml = context.window.Renderer.renderLesson(slug);

  // Generate page HTML by transforming the template
  let page = template;

  // Replace Title
  page = page.replace(/<title>.*?<\/title>/i, () => `<title>${escapeHtml(title)}</title>`);

  // Replace Meta Description
  page = page.replace(
    /<meta\s+name="description"\s+content="[^"]*">/i,
    () => `<meta name="description" content="${escapeAttr(desc)}">`
  );

  // Replace Canonical Link
  page = page.replace(
    /<link\s+rel="canonical"\s+href="[^"]*">/i,
    () => `<link rel="canonical" href="${canonicalUrl}">`
  );

  // Replace OpenGraph
  page = page.replace(/<meta\s+property="og:type"\s+content="[^"]*">/i, '<meta property="og:type" content="article">');
  page = page.replace(
    /<meta\s+property="og:title"\s+content="[^"]*">/i,
    () => `<meta property="og:title" content="${escapeAttr(title)}">`
  );
  page = page.replace(
    /<meta\s+property="og:description"\s+content="[^"]*">/i,
    () => `<meta property="og:description" content="${escapeAttr(desc)}">`
  );
  page = page.replace(
    /<meta\s+property="og:url"\s+content="[^"]*">/i,
    () => `<meta property="og:url" content="${canonicalUrl}">`
  );
  if (/<meta\s+property="og:image"/i.test(page)) {
    page = page.replace(
      /<meta\s+property="og:image"\s+content="[^"]*">/i,
      `<meta property="og:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  } else {
    page = page.replace(
      /<meta\s+property="og:url"\s+content="[^"]*">/i,
      () => `<meta property="og:url" content="${canonicalUrl}">\n  <meta property="og:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  }

  // Replace Twitter Card
  if (/<meta\s+name="twitter:card"/i.test(page)) {
    page = page.replace(
      /<meta\s+name="twitter:card"\s+content="[^"]*">/i,
      `<meta name="twitter:card" content="summary_large_image">`
    );
  }
  page = page.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*">/i,
    () => `<meta name="twitter:title" content="${escapeAttr(title)}">`
  );
  page = page.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*">/i,
    () => `<meta name="twitter:description" content="${escapeAttr(desc)}">`
  );
  if (/<meta\s+name="twitter:image"/i.test(page)) {
    page = page.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*">/i,
      `<meta name="twitter:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  } else {
    page = page.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*">/i,
      () => `<meta name="twitter:description" content="${escapeAttr(desc)}">\n  <meta name="twitter:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  }

  // JSON-LD TechArticle Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': unit.title,
    'description': desc,
    'url': canonicalUrl,
    'author': {
      '@type': 'Person',
      'name': 'Ved Gupta',
      'url': 'https://vedgupta.in'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'System Design In Depth',
      'url': baseUrl
    }
  };

  const jsonLdTag = `\n  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;
  page = page.replace('</head>', () => `${jsonLdTag}\n</head>`);

  // Pre-render sidebar HTML with current unit active
  const sidebarHtml = renderStaticSidebar(curriculum, slug);
  page = page.replace(
    /<div class="sidebar__content" id="sidebar-content"><\/div>/i,
    () => `<div class="sidebar__content" id="sidebar-content">\n${sidebarHtml}\n    </div>`
  );

  // Replace #reader content with prerendered lesson
  page = page.replace(
    /<div class="main__content" id="reader">[\s\S]*?<\/div>(\s*<\/main>)/i,
    (_, closingMain) => `<div class="main__content" id="reader" data-prerendered="${slug}">\n${lessonHtml}\n    </div>${closingMain}`
  );

  // Strip implementation code and interactive lab scripts from static topic HTML (loaded on demand)
  page = stripScriptTag(page, 'data/implementations_code.js');
  page = stripScriptTag(page, 'data/guided_labs.js');

  // Strip unused simulator scripts for this unit slug
  const neededSimFile = slugToSimFile[slug];
  for (const sFile of simulatorFiles) {
    if (sFile !== neededSimFile) {
      page = stripScriptTag(page, sFile);
    }
  }

  // Write file to topic/<slug>/index.html
  const topicDir = path.join(root, 'topic', slug);
  fs.mkdirSync(topicDir, { recursive: true });
  fs.writeFileSync(path.join(topicDir, 'index.html'), page, 'utf8');

  // Add to sitemap
  sitemapUrls.push({
    loc: canonicalUrl,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: unit.archive?.updated || defaultLastmod
  });

  generatedCount++;
}

// 4b. Generate Static Pages for Interactive Build Labs (/build/<buildId>/index.html)
const implementations = context.window.IMPLEMENTATIONS_DATA || {};
const buildEntries = Object.entries(implementations);
let generatedBuildsCount = 0;

console.log(`Starting SSG generation for ${buildEntries.length} interactive build labs...`);

for (const [buildId, build] of buildEntries) {
  const desc = makeBuildDescription(buildId, build);
  const title = `${build.title} — Interactive Build Lab | System Design In Depth`;
  const canonicalUrl = `${baseUrl}/build/${buildId}/`;

  // Prerender full build page HTML inside VM
  const buildHtml = context.window.Renderer.renderBuild(buildId);

  let page = template;

  // Replace Title
  page = page.replace(/<title>.*?<\/title>/i, () => `<title>${escapeHtml(title)}</title>`);

  // Replace Meta Description
  page = page.replace(
    /<meta\s+name="description"\s+content="[^"]*">/i,
    () => `<meta name="description" content="${escapeAttr(desc)}">`
  );

  // Replace Canonical Link
  page = page.replace(
    /<link\s+rel="canonical"\s+href="[^"]*">/i,
    () => `<link rel="canonical" href="${canonicalUrl}">`
  );

  // Replace OpenGraph
  page = page.replace(/<meta\s+property="og:type"\s+content="[^"]*">/i, '<meta property="og:type" content="article">');
  page = page.replace(
    /<meta\s+property="og:title"\s+content="[^"]*">/i,
    () => `<meta property="og:title" content="${escapeAttr(title)}">`
  );
  page = page.replace(
    /<meta\s+property="og:description"\s+content="[^"]*">/i,
    () => `<meta property="og:description" content="${escapeAttr(desc)}">`
  );
  page = page.replace(
    /<meta\s+property="og:url"\s+content="[^"]*">/i,
    () => `<meta property="og:url" content="${canonicalUrl}">`
  );
  if (/<meta\s+property="og:image"/i.test(page)) {
    page = page.replace(
      /<meta\s+property="og:image"\s+content="[^"]*">/i,
      `<meta property="og:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  } else {
    page = page.replace(
      /<meta\s+property="og:url"\s+content="[^"]*">/i,
      () => `<meta property="og:url" content="${canonicalUrl}">\n  <meta property="og:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  }

  // Replace Twitter Card
  if (/<meta\s+name="twitter:card"/i.test(page)) {
    page = page.replace(
      /<meta\s+name="twitter:card"\s+content="[^"]*">/i,
      `<meta name="twitter:card" content="summary_large_image">`
    );
  }
  page = page.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*">/i,
    () => `<meta name="twitter:title" content="${escapeAttr(title)}">`
  );
  page = page.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*">/i,
    () => `<meta name="twitter:description" content="${escapeAttr(desc)}">`
  );
  if (/<meta\s+name="twitter:image"/i.test(page)) {
    page = page.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*">/i,
      `<meta name="twitter:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  } else {
    page = page.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*">/i,
      () => `<meta name="twitter:description" content="${escapeAttr(desc)}">\n  <meta name="twitter:image" content="https://system-design-in-depth.vedgupta.in/assets/og-image.png">`
    );
  }

  // JSON-LD TechArticle Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': `${build.title} — Interactive Build Lab`,
    'description': desc,
    'url': canonicalUrl,
    'author': {
      '@type': 'Person',
      'name': 'Ved Gupta',
      'url': 'https://vedgupta.in'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'System Design In Depth',
      'url': baseUrl
    }
  };

  const jsonLdTag = `\n  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;
  page = page.replace('</head>', () => `${jsonLdTag}\n</head>`);

  // Activate Builds tab in sidebar and pre-render Builds sidebar list
  page = page.replace(
    'class="sidebar__tab active" data-tab="curriculum" role="tab" aria-selected="true"',
    'class="sidebar__tab" data-tab="curriculum" role="tab" aria-selected="false"'
  );
  page = page.replace(
    'class="sidebar__tab" data-tab="builds" role="tab" aria-selected="false"',
    'class="sidebar__tab active" data-tab="builds" role="tab" aria-selected="true"'
  );
  const buildsSidebarHtml = renderStaticBuildsSidebar(implementations, buildId);
  page = page.replace(
    /<div class="sidebar__content" id="sidebar-content"><\/div>/i,
    () => `<div class="sidebar__content" id="sidebar-content">\n${buildsSidebarHtml}\n    </div>`
  );

  // Replace #reader content with prerendered build page
  page = page.replace(
    /<div class="main__content" id="reader">[\s\S]*?<\/div>(\s*<\/main>)/i,
    (_, closingMain) => `<div class="main__content" id="reader" data-prerendered-build="${buildId}">\n${buildHtml}\n    </div>${closingMain}`
  );

  // Strip unused simulator scripts from static build pages
  for (const sFile of simulatorFiles) {
    page = stripScriptTag(page, sFile);
  }

  // Write file to build/<buildId>/index.html
  const buildDir = path.join(root, 'build', buildId);
  fs.mkdirSync(buildDir, { recursive: true });
  fs.writeFileSync(path.join(buildDir, 'index.html'), page, 'utf8');

  // Add to sitemap
  sitemapUrls.push({
    loc: canonicalUrl,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: defaultLastmod
  });

  generatedBuildsCount++;
}

// 5. Generate sitemap.xml
let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const entry of sitemapUrls) {
  sitemapXml += '  <url>\n';
  sitemapXml += `    <loc>${entry.loc}</loc>\n`;
  sitemapXml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  sitemapXml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
  sitemapXml += `    <priority>${entry.priority}</priority>\n`;
  sitemapXml += '  </url>\n';
}
sitemapXml += '</urlset>\n';

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`✓ Generated sitemap.xml with ${sitemapUrls.length} entries`);

console.log(`\nSSG Completed: ${generatedCount} units and ${generatedBuildsCount} build labs generated successfully.`);

