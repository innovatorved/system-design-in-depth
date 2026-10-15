const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  SYSTEM_DESIGN_ROOT,
  CODE_LAB_ROOT,
  BUILD_SLUGS,
  runCommand,
  startStaticServer,
  launchBrowser
} = require('./helpers.js');

test('Tier 4: Real-World Scenarios', async (t) => {
  await t.test('Scenario 1: End-to-end user navigation across 3 distinct build labs in SPA mode without legacy tabs', async () => {
    const { baseUrl, close } = await startStaticServer(SYSTEM_DESIGN_ROOT);
    const browser = await launchBrowser();

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      // Track page console errors
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      // Step 1: Navigate to initial build page: Merkle Anti-Entropy
      await page.goto(`${baseUrl}/build/merkle-anti-entropy/`, { waitUntil: 'networkidle0' });

      // Verify initial DOM
      const initialCard = await page.$('.build-lab-card, .build-walkthrough-pane');
      assert.ok(initialCard, 'Step 1: Merkle build card must be present');
      const initialTabs = await page.$('.build-view-tabs');
      assert.strictEqual(initialTabs, null, 'Step 1: Merkle build page must not have .build-view-tabs');

      // Step 2: SPA navigation to HyperLogLog
      const hllLink = await page.$('a[data-build="hyperloglog-cardinality"]');
      assert.ok(hllLink, 'Step 2: Sidebar link for hyperloglog-cardinality must exist');
      await hllLink.click();
      await page.waitForFunction(() => {
        const title = document.querySelector('.lesson-header__title');
        return title && /HyperLogLog/i.test(title.textContent);
      }, { timeout: 6000 });

      const hllTabs = await page.$('.build-view-tabs');
      assert.strictEqual(hllTabs, null, 'Step 2: After switching to HyperLogLog, .build-view-tabs must be null');

      const hllLegacyButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a'))
          .map(b => b.textContent.trim())
          .filter(t => /Architecture\s*&\s*Reference\s*Code|Interactive\s*Lab\s*IDE|Sandbox\s*Mode/i.test(t));
      });
      assert.strictEqual(hllLegacyButtons.length, 0, `Step 2: Found legacy button text on HyperLogLog: ${hllLegacyButtons}`);

      // Step 3: SPA navigation to Sliding Window Rate Limiter
      const swLink = await page.$('a[data-build="sliding-window-rate-limiter"]');
      assert.ok(swLink, 'Step 3: Sidebar link for sliding-window-rate-limiter must exist');
      await swLink.click();
      await page.waitForFunction(() => {
        const title = document.querySelector('.lesson-header__title');
        return title && /Sliding Window/i.test(title.textContent);
      }, { timeout: 6000 });

      const swTabs = await page.$('.build-view-tabs');
      assert.strictEqual(swTabs, null, 'Step 3: After switching to Sliding Window, .build-view-tabs must be null');

      // Step 4: History back navigation to HyperLogLog
      await page.goBack();
      if (await page.evaluate(() => window.location.pathname.includes('sliding-window-rate-limiter'))) {
        await page.goBack();
      }
      await page.waitForFunction(() => {
        const title = document.querySelector('.lesson-header__title');
        return title && /HyperLogLog/i.test(title.textContent);
      }, { timeout: 6000 });
      const backTabs = await page.$('.build-view-tabs');
      assert.strictEqual(backTabs, null, 'Step 4: History back to HyperLogLog must not display legacy tabs');

      // Step 5: History back navigation to Merkle Anti-Entropy
      await page.goBack();
      if (await page.evaluate(() => window.location.pathname.includes('hyperloglog-cardinality'))) {
        await page.goBack();
      }
      await page.waitForFunction(() => {
        const title = document.querySelector('.lesson-header__title');
        return title && /Merkle/i.test(title.textContent);
      }, { timeout: 6000 });
      const originalTabs = await page.$('.build-view-tabs');
      assert.strictEqual(originalTabs, null, 'Step 5: History back to Merkle must not display legacy tabs');

      assert.strictEqual(pageErrors.length, 0, `Uncaught page errors encountered: ${pageErrors.join('; ')}`);
    } finally {
      await browser.close();
      await close();
    }
  });

  await t.test('Scenario 2: Downstream integrator opening dist/sample.html in offline/airgapped browser', async () => {
    const distSample = path.join(CODE_LAB_ROOT, 'dist/sample.html');
    const srcSample = path.join(CODE_LAB_ROOT, 'src/sample.html');
    const samplePath = fs.existsSync(distSample) ? distSample : srcSample;
    assert.ok(fs.existsSync(samplePath), 'sample.html must exist');

    const { baseUrl, close } = await startStaticServer(CODE_LAB_ROOT);
    const browser = await launchBrowser();

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      // Enable offline airgap request blocking
      await page.setRequestInterception(true);
      const blockedRequests = [];
      page.on('request', (req) => {
        const u = req.url();
        if (u.startsWith('http://127.0.0.1')) {
          req.continue();
        } else {
          blockedRequests.push(u);
          req.abort('failed');
        }
      });

      const sampleUrl = fs.existsSync(distSample) ? `${baseUrl}/dist/sample.html` : `${baseUrl}/src/sample.html`;
      await page.goto(sampleUrl, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1200));

      // Verify layout sizing
      const dimensions = await page.evaluate(() => {
        const app = document.querySelector('#app') || document.body;
        const codelab = document.querySelector('.codelab') || document.querySelector('code-lab');
        return {
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          appWidth: app ? app.getBoundingClientRect().width : 0,
          appHeight: app ? app.getBoundingClientRect().height : 0,
          codelabExists: !!codelab
        };
      });

      assert.ok(dimensions.appWidth >= 1400, `App container should span full width: ${dimensions.appWidth}px`);
      assert.ok(dimensions.appHeight >= 850, `App container should span full height: ${dimensions.appHeight}px`);
      assert.ok(dimensions.codelabExists, 'code-lab component must be mounted');
    } finally {
      await browser.close();
      await close();
    }
  });

  await t.test('Scenario 3: Full cold-start static generation followed by validation check in CI pipeline', () => {
    // 1. Initial stamp
    const stamp1 = runCommand('node', ['tools/stamp-assets.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(stamp1.code, 0, `Initial stamp failed: ${stamp1.stderr}`);

    // 2. Full static regeneration
    const gen = runCommand('node', ['tools/generate-static.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(gen.code, 0, `generate-static failed: ${gen.stderr}`);

    // 3. Stamp check mode (verifying zero stale hashes)
    const check = runCommand('node', ['tools/stamp-assets.js', '--check'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(check.code, 0, `Asset check failed with stale files: ${check.stdout}`);

    // 4. Validate script (verifying 0 errors and 0 warnings)
    const val = runCommand('node', ['tools/validate.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(val.code, 0, `Validation failed: ${val.stdout}`);
  });

  await t.test('Scenario 4: Terminal mock execution and virtual HTTP loopback in standalone sample UI', () => {
    // Verify sample.html source structure
    const distSample = path.join(CODE_LAB_ROOT, 'dist/sample.html');
    const srcSample = path.join(CODE_LAB_ROOT, 'src/sample.html');
    const sampleFile = fs.existsSync(distSample) ? distSample : srcSample;
    const content = fs.readFileSync(sampleFile, 'utf8');

    // Confirm presence of mock server / client rate limiter code
    assert.ok(content.includes('server.js') || content.includes('http'), 'Sample must contain mock server definition');
    assert.ok(content.includes('<code-lab'), 'Sample must instantiate <code-lab>');

    // Verify code-lab test suite passes 100%
    const bunRes = runCommand('bun', ['run', 'test:all'], CODE_LAB_ROOT);
    assert.strictEqual(bunRes.code, 0, `bun run test:all failed: ${bunRes.stderr}`);
    assert.ok(bunRes.stdout.includes('100.0%'), 'Test suite must achieve 100% pass rate');
  });

  await t.test('Scenario 5: Production Cloudflare Pages build assembly and dry-run deployment inspection', () => {
    // Run build.js to generate dist/
    const buildRes = runCommand('node', ['tools/build.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(buildRes.code, 0, `tools/build.js failed: ${buildRes.stderr}`);

    const distDir = path.join(SYSTEM_DESIGN_ROOT, 'dist');
    assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');

    // Verify required deployment files exist in dist/
    assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html missing');
    assert.ok(fs.existsSync(path.join(distDir, '_headers')), 'dist/_headers missing');
    assert.ok(fs.existsSync(path.join(distDir, '_redirects')), 'dist/_redirects missing');

    // Verify all 15 builds exist in dist/
    for (const slug of BUILD_SLUGS) {
      const buildIndex = path.join(distDir, 'build', slug, 'index.html');
      assert.ok(fs.existsSync(buildIndex), `dist/build/${slug}/index.html missing`);
    }

    // Verify excluded internal directories do NOT leak into dist/
    assert.ok(!fs.existsSync(path.join(distDir, 'tools')), 'tools/ must not be copied to dist/');
    assert.ok(!fs.existsSync(path.join(distDir, '.github')), '.github/ must not be copied to dist/');
    assert.ok(!fs.existsSync(path.join(distDir, '.agents')), '.agents/ must not be copied to dist/');
  });
});
