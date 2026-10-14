#!/usr/bin/env node
/**
 * Link & Video Verification Tool
 * Scans external URLs and YouTube video embeds across curriculum data and module content.
 * Checks HTTP status for external URLs and oEmbed availability for YouTube videos.
 *
 * Usage: node tools/check-links-and-videos.js [--videos-only] [--links-only] [--limit N]
 */

const fs = require('fs');
const path = require('path');

// Colors for CLI output
const reset = '\x1b[0m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';

const args = process.argv.slice(2);
const videosOnly = args.includes('--videos-only');
const linksOnly = args.includes('--links-only');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// 1. Shim environment and load curriculum and content data
global.window = {};
const root = path.resolve(__dirname, '..');
const curriculumFile = path.join(root, 'data', 'curriculum.js');

if (!fs.existsSync(curriculumFile)) {
  console.error(`${red}Curriculum file not found: ${curriculumFile}${reset}`);
  process.exit(1);
}

try {
  eval(fs.readFileSync(curriculumFile, 'utf8'));
} catch (e) {
  console.error(`${red}Failed to load curriculum.js: ${e.message}${reset}`);
  process.exit(1);
}

const curriculum = global.window.CURRICULUM_DATA;
const contentDir = path.join(root, 'data', 'content');
if (fs.existsSync(contentDir)) {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.js'));
  for (const f of files) {
    try {
      eval(fs.readFileSync(path.join(contentDir, f), 'utf8'));
    } catch (e) {
      console.error(`${yellow}Warning: Failed to load content file ${f}: ${e.message}${reset}`);
    }
  }
}
const moduleContent = global.window.MODULE_CONTENT || {};

// 2. Extract YouTube Video IDs and External URLs
const youtubeIds = new Set();
const externalUrls = new Set();

function cleanUrl(url) {
  if (!url) return '';
  let cleaned = url.trim();
  // Strip surrounding quotes or parentheses
  cleaned = cleaned.replace(/^["'\\(]+|["'\\)]+$/g, '');
  // Strip trailing punctuation
  cleaned = cleaned.replace(/[,;.]+$|\)+$/, '');
  return cleaned;
}

function extractFromObject(obj, pathLabel = '') {
  if (!obj) return;

  if (typeof obj === 'string') {
    // Extract URLs
    const urlRegex = /https?:\/\/[^\s"'\x27<>)]+/g;
    let match;
    while ((match = urlRegex.exec(obj)) !== null) {
      const u = cleanUrl(match[0]);
      if (!u) continue;

      if (u.includes('youtube.com/watch') || u.includes('youtu.be/') || u.includes('youtube.com/embed/')) {
        const ytMatch = u.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) {
          youtubeIds.add(ytMatch[1]);
        }
      } else if (!u.includes('system-design-in-depth.vedgupta.in') && !u.includes('localhost') && !u.includes('127.0.0.1') && !u.includes('example.com') && !u.includes('example.org')) {
        externalUrls.add(u);
      }
    }
    return;
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => extractFromObject(item, `${pathLabel}[${idx}]`));
    } else {
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'youtubeId' && typeof v === 'string' && v.trim()) {
          youtubeIds.add(v.trim());
        } else if (k === 'url' && typeof v === 'string' && v.startsWith('http')) {
          const u = cleanUrl(v);
          if (u.includes('youtube.com') || u.includes('youtu.be')) {
            const ytMatch = u.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (ytMatch) youtubeIds.add(ytMatch[1]);
          } else if (!u.includes('system-design-in-depth.vedgupta.in') && !u.includes('localhost') && !u.includes('example.com') && !u.includes('example.org')) {
            externalUrls.add(u);
          }
        } else {
          extractFromObject(v, pathLabel ? `${pathLabel}.${k}` : k);
        }
      }
    }
  }
}

extractFromObject(curriculum, 'curriculum');
extractFromObject(moduleContent, 'moduleContent');

let videoList = Array.from(youtubeIds);
let urlList = Array.from(externalUrls);

if (!isNaN(limit) && limit < Infinity) {
  videoList = videoList.slice(0, limit);
  urlList = urlList.slice(0, limit);
}

console.log(`${cyan}=== Link & Video Verification ===${reset}`);
console.log(`Discovered: ${videoList.length} YouTube videos, ${urlList.length} external URLs\n`);

// 3. Helper for concurrent async batching
async function asyncPool(concurrency, items, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (concurrency <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

// 4. Verify YouTube Videos via oEmbed
async function checkYouTubeVideo(id) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
  try {
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (SystemDesignInDepth-LinkChecker/1.0)' }
    });
    if (res.ok) {
      return { id, ok: true, status: res.status };
    } else {
      return { id, ok: false, status: res.status, error: `HTTP ${res.status}` };
    }
  } catch (err) {
    return { id, ok: false, status: 0, error: err.message };
  }
}

// 5. Verify External Link HTTP Status
async function checkExternalUrl(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  };

  // Attempt 1: HEAD request
  try {
    const headRes = await fetch(url, {
      method: 'HEAD',
      headers,
      signal: AbortSignal.timeout(6000),
      redirect: 'follow'
    });
    // 2xx, 3xx, 403/429/999 (often bot blockers)
    if (headRes.ok || (headRes.status >= 200 && headRes.status < 400) || [403, 429, 999].includes(headRes.status)) {
      return { url, ok: true, status: headRes.status };
    }
  } catch (e) {
    // Fall through to GET attempt
  }

  // Attempt 2: GET request fallback
  try {
    const getRes = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000),
      redirect: 'follow'
    });
    if (getRes.ok || (getRes.status >= 200 && getRes.status < 400) || [403, 429, 999].includes(getRes.status)) {
      return { url, ok: true, status: getRes.status };
    } else {
      return { url, ok: false, status: getRes.status, error: `HTTP ${getRes.status}` };
    }
  } catch (err) {
    return { url, ok: false, status: 0, error: err.message };
  }
}

async function main() {
  let failedVideos = [];
  let failedUrls = [];

  // Step A: Check YouTube Videos
  if (!linksOnly && videoList.length > 0) {
    console.log(`Checking ${videoList.length} YouTube videos via oEmbed...`);
    const videoResults = await asyncPool(15, videoList, checkYouTubeVideo);
    failedVideos = videoResults.filter(r => !r.ok);

    const passedVideos = videoResults.length - failedVideos.length;
    if (failedVideos.length === 0) {
      console.log(`${green}✓ YouTube Videos: All ${passedVideos}/${videoList.length} active & available${reset}\n`);
    } else {
      console.log(`${red}✖ YouTube Videos: ${failedVideos.length}/${videoList.length} failed oEmbed check:${reset}`);
      failedVideos.forEach(v => {
        console.log(`   - Video ID: ${v.id} (${v.error})`);
      });
      console.log('');
    }
  }

  // Step B: Check External URLs
  if (!videosOnly && urlList.length > 0) {
    console.log(`Checking ${urlList.length} external URLs...`);
    const urlResults = await asyncPool(20, urlList, checkExternalUrl);
    failedUrls = urlResults.filter(r => !r.ok);

    const passedUrls = urlResults.length - failedUrls.length;
    if (failedUrls.length === 0) {
      console.log(`${green}✓ External Links: All ${passedUrls}/${urlList.length} accessible${reset}\n`);
    } else {
      console.log(`${yellow}⚠ External Links: ${passedUrls}/${urlList.length} passed, ${failedUrls.length} failed/unreachable:${reset}`);
      failedUrls.forEach(u => {
        console.log(`   - ${u.url} (${u.error})`);
      });
      console.log('');
    }
  }

  // Summary
  console.log(`${cyan}=== Verification Summary ===${reset}`);
  console.log(`YouTube Videos Checked: ${videoList.length} (Failed: ${failedVideos.length})`);
  console.log(`External Links Checked: ${urlList.length} (Failed: ${failedUrls.length})`);

  if (failedVideos.length > 0) {
    console.error(`\n${red}Verification failed due to dead/unavailable YouTube videos.${reset}`);
    process.exit(1);
  } else {
    console.log(`\n${green}Verification complete. No broken YouTube video embeds.${reset}`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error(`${red}Fatal error during verification: ${err.message}${reset}`);
  process.exit(1);
});
