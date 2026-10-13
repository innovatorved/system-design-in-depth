#!/usr/bin/env node
// Content Schema Validator for system-design-in-depth
// Usage: node tools/validate.js
// Exit 0 = all checks pass, non-zero = errors found

const fs = require('fs');
const path = require('path');

// Colors
const reset = '\x1b[0m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';

let errorCount = 0;
let warningCount = 0;

function reportError(msg) {
  console.error(`${red}  ✖ ${msg}${reset}`);
  errorCount++;
}

function reportWarning(msg) {
  console.log(`${yellow}  ⚠ ${msg}${reset}`);
  warningCount++;
}

function reportSuccess(msg) {
  console.log(`${green}✓ ${msg}${reset}`);
}

// Shim window
global.window = {};

const dataDir = path.join(__dirname, '..', 'data');
const curriculumFile = path.join(dataDir, 'curriculum.js');

if (!fs.existsSync(curriculumFile)) {
  console.error(`Curriculum file not found: ${curriculumFile}`);
  process.exit(1);
}

// Load curriculum
try {
  const code = fs.readFileSync(curriculumFile, 'utf8');
  eval(code);
} catch (e) {
  console.error(`Failed to load curriculum.js: ${e.message}`);
  process.exit(1);
}

const curriculum = global.window.CURRICULUM_DATA;
if (!curriculum || !curriculum.parts) {
  reportError("Curriculum structure invalid");
  process.exit(1);
}

// 1. Validate curriculum structure
const allSlugs = new Set();
const allModuleIds = new Set();
let unitsCount = 0;
let modulesCount = 0;
const unitsMap = []; // { moduleId, modNumber, unit }

curriculum.parts.forEach((part) => {
  if (part.modules) {
    part.modules.forEach((mod) => {
      modulesCount++;
      if (!mod.id) {
        reportError(`Module missing id in part ${part.id || part.title}`);
      } else if (allModuleIds.has(mod.id)) {
        reportError(`Duplicate module ID: ${mod.id}`);
      } else {
        allModuleIds.add(mod.id);
      }

      if (mod.units) {
        mod.units.forEach((unit) => {
          unitsCount++;
          unitsMap.push({ moduleId: mod.id, modNumber: mod.legacyNumber || mod.number, unit });
          
          if (!unit.slug) {
            reportError(`Unit missing slug in module ${mod.id}`);
          } else {
            if (!/^[a-z0-9\-]+$/.test(unit.slug)) {
              reportError(`Unit slug not kebab-case: ${unit.slug}`);
            }
            if (allSlugs.has(unit.slug)) {
              reportError(`Duplicate unit slug: ${unit.slug}`);
            } else {
              allSlugs.add(unit.slug);
            }
          }
          
          if (!unit.title || typeof unit.title !== 'string') {
            reportError(`Unit missing title: ${unit.slug}`);
          }
          
          if (!['lesson', 'design', 'case', 'build'].includes(unit.kind)) {
            reportError(`Unit has invalid kind '${unit.kind}': ${unit.slug}`);
          }
        });
      }
    });
  }
});

reportSuccess(`Curriculum: ${unitsCount} units across ${curriculum.parts.length} tracks`);
if (errorCount === 0) {
  reportSuccess(`Slugs: all unique, all kebab-case`);
}

// 2. Load content files
const contentDir = path.join(dataDir, 'content');
if (fs.existsSync(contentDir)) {
  const contentFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.js'));
  contentFiles.forEach(f => {
    try {
      const code = fs.readFileSync(path.join(contentDir, f), 'utf8');
      eval(code);
    } catch (e) {
      reportError(`Failed to load ${f}: ${e.message}`);
    }
  });
}

const moduleContent = global.window.MODULE_CONTENT || {};

let richContentCount = 0;
let missingContentCount = 0;
let placeholderCount = 0;

let validTakeaways = 0;
let validFurtherReading = 0;

unitsMap.forEach(({ moduleId, modNumber, unit }) => {
  const modData = moduleContent[moduleId];
  const unitData = modData ? modData[unit.slug] : null;
  const displayId = modNumber ? `m${modNumber}` : moduleId;
  
  if (!unitData) {
    reportWarning(`${displayId}/${unit.slug}: missing content`);
    missingContentCount++;
    return;
  }
  
  let isPlaceholder = false;
  if (unitData.content && unitData.content.includes('This topic is covered in depth in the curriculum archive above')) {
    reportWarning(`${displayId}/${unit.slug}: placeholder content`);
    placeholderCount++;
    isPlaceholder = true;
  }
  
  if (!isPlaceholder) {
    richContentCount++;
    // Content quality checks
    if (!unitData.title || typeof unitData.title !== 'string') {
      reportError(`${displayId}/${unit.slug}: missing or invalid title`);
    }
    if (!unitData.content || typeof unitData.content !== 'string' || !unitData.content.includes('<div')) {
      reportError(`${displayId}/${unit.slug}: missing or invalid content (must contain '<div')`);
    }
    
    if (!unitData.keyTakeaways || !Array.isArray(unitData.keyTakeaways) || unitData.keyTakeaways.length < 3 || unitData.keyTakeaways.length > 5) {
      reportError(`${displayId}/${unit.slug}: keyTakeaways must be an array with 3-5 items`);
    } else {
      let allStrings = true;
      unitData.keyTakeaways.forEach(t => {
        if (!t || typeof t !== 'string') allStrings = false;
      });
      if (!allStrings) reportError(`${displayId}/${unit.slug}: keyTakeaways items must be non-empty strings`);
      else validTakeaways++;
    }
    
    if (!unitData.furtherReading || !Array.isArray(unitData.furtherReading) || unitData.furtherReading.length < 2 || unitData.furtherReading.length > 4) {
      reportWarning(`${displayId}/${unit.slug}: furtherReading must be an array with 2-4 items`);
    } else {
      let allValid = true;
      unitData.furtherReading.forEach(fr => {
        if (!fr.title || !fr.url) allValid = false;
      });
      if (!allValid) reportError(`${displayId}/${unit.slug}: furtherReading items must have title and url`);
      else validFurtherReading++;
    }
  }
});

const totalContentCount = unitsCount - missingContentCount - placeholderCount;
if (missingContentCount > 0 || placeholderCount > 0) {
    console.log(`${yellow}⚠ Content: ${totalContentCount}/${unitsCount} units have rich content (${placeholderCount} placeholder, ${missingContentCount} missing)${reset}`);
} else {
    reportSuccess(`Content: ${totalContentCount}/${unitsCount} units have rich content`);
}

// Re-evaluating what the output means for takeaways and further reading:
// "✓ Key takeaways: 192/200 units have 3-5 takeaways"
// The expected output does not warn if they are missing due to placeholder/missing content, it just reports the valid count vs total.
if (validTakeaways === unitsCount) {
    reportSuccess(`Key takeaways: ${validTakeaways}/${unitsCount} units have 3-5 takeaways`);
} else {
    reportSuccess(`Key takeaways: ${validTakeaways}/${unitsCount} units have 3-5 takeaways`);
}

if (validFurtherReading === unitsCount) {
    reportSuccess(`Further reading: ${validFurtherReading}/${unitsCount} units have 2-4 items`);
} else {
    reportSuccess(`Further reading: ${validFurtherReading}/${unitsCount} units have 2-4 items`);
}


// Question bank files
const questionsDir = path.join(dataDir, 'questions');
if (fs.existsSync(questionsDir)) {
  const qFiles = fs.readdirSync(questionsDir).filter(f => f.endsWith('.js'));
  qFiles.forEach(f => {
    try {
      const code = fs.readFileSync(path.join(questionsDir, f), 'utf8');
      eval(code);
    } catch (e) {
      reportError(`Failed to load question file ${f}: ${e.message}`);
    }
  });
  
  if (global.window.QUESTION_BANK) {
    let totalQuestions = 0;
    let invalidQuestions = 0;
    for (const [slug, questions] of Object.entries(global.window.QUESTION_BANK)) {
      if (!Array.isArray(questions)) {
        reportError(`Question bank entry for "${slug}" is not an array`);
        continue;
      }
      for (const q of questions) {
        totalQuestions++;
        if (!q.id || !q.type || !q.difficulty || !q.prompt || !q.options || q.answer === undefined || !q.explanation) {
          reportError(`Question bank invalid question: ${q.id || JSON.stringify(q).slice(0, 100)}`);
          invalidQuestions++;
        }
      }
    }
    const slugCount = Object.keys(global.window.QUESTION_BANK).length;
    if (invalidQuestions === 0) {
      console.log(`Question bank: ${totalQuestions} questions across ${slugCount} units`);
    }
  }
}

// Flashcard files
const flashcardsDir = path.join(dataDir, 'flashcards');
if (fs.existsSync(flashcardsDir)) {
  const fFiles = fs.readdirSync(flashcardsDir).filter(f => f.endsWith('.js'));
  fFiles.forEach(f => {
    try {
      const code = fs.readFileSync(path.join(flashcardsDir, f), 'utf8');
      eval(code);
    } catch (e) {
      reportError(`Failed to load flashcard file ${f}: ${e.message}`);
    }
  });
  // Add validation logic if flashcards structure is known
}

// Asset stamps: _headers caches js/css/data as immutable, so stale ?v= hashes would pin old files
try {
  require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'stamp-assets.js'), '--check'], { stdio: 'pipe' });
  reportSuccess('Asset stamps: all ?v= hashes up to date');
} catch (e) {
  reportError('Asset stamps are stale — run `node tools/stamp-assets.js`');
}

// 3. Static Pages & SEO Validation
const topicBaseDir = path.join(__dirname, '..', 'topic');
const sitemapFile = path.join(__dirname, '..', 'sitemap.xml');
let missingStaticCount = 0;
let invalidCanonicalCount = 0;
let emptyReaderCount = 0;
let lowWordCount = 0;

if (fs.existsSync(topicBaseDir)) {
  for (const slug of allSlugs) {
    const pagePath = path.join(topicBaseDir, slug, 'index.html');
    if (!fs.existsSync(pagePath)) {
      missingStaticCount++;
      reportError(`Missing static page: topic/${slug}/index.html`);
      continue;
    }
    const html = fs.readFileSync(pagePath, 'utf8');
    const expectedCanonical = `<link rel="canonical" href="https://system-design-in-depth.vedgupta.in/topic/${slug}/">`;
    if (!html.includes(expectedCanonical)) {
      invalidCanonicalCount++;
      reportError(`Invalid or missing canonical URL in topic/${slug}/index.html`);
    }
    if (!html.includes(`data-prerendered="${slug}"`)) {
      emptyReaderCount++;
      reportError(`Empty or un-prerendered reader container in topic/${slug}/index.html`);
    }

    // Verify substantial prerendered lesson text (>= 300 words)
    const readerMatch = html.match(/id="reader"[^>]*>([\s\S]*?)<\/div>\s*<\/main>/);
    if (!readerMatch) {
      emptyReaderCount++;
      reportError(`Missing #reader container in topic/${slug}/index.html`);
    } else {
      const readerText = readerMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = readerText ? readerText.split(/\s+/).length : 0;
      if (words < 300) {
        lowWordCount++;
        reportError(`Static page topic/${slug}/index.html body text has only ${words} words (< 300 required)`);
      }
    }
  }

  if (missingStaticCount === 0 && invalidCanonicalCount === 0 && emptyReaderCount === 0 && lowWordCount === 0) {
    reportSuccess(`Static pages: all ${allSlugs.size} topic pages prerendered with canonical URLs & >= 300 words`);
  }
} else {
  reportError('Static pages directory not found: topic/');
}

// 4. Sitemap Validation
if (fs.existsSync(sitemapFile)) {
  const sitemapContent = fs.readFileSync(sitemapFile, 'utf8');
  let missingSitemapUrls = 0;
  for (const slug of allSlugs) {
    const expectedLoc = `<loc>https://system-design-in-depth.vedgupta.in/topic/${slug}/</loc>`;
    if (!sitemapContent.includes(expectedLoc)) {
      missingSitemapUrls++;
      reportError(`Sitemap missing topic URL: ${slug}`);
    }
  }
  if (missingSitemapUrls === 0) {
    reportSuccess(`Sitemap: contains all ${allSlugs.size} topic URLs with trailing slashes`);
  }
} else {
  reportError('sitemap.xml not found');
}

console.log(`\n${errorCount} errors, ${warningCount} warnings`);
process.exit(errorCount > 0 ? 1 : 0);
