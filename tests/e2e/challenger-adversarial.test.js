const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  SYSTEM_DESIGN_ROOT,
  BUILD_SLUGS,
  hashOf,
  runCommand,
  startStaticServer,
  launchBrowser
} = require('./helpers.js');

test('Empirical Challenger: Adversarial Stress Suite', async (t) => {

  // =========================================================================
  // SUITE 1: Rapid 15-Build Sequential SPA Navigation & Tab Verification
  // =========================================================================
  await t.test('Adversarial 1: Rapid multi-step SPA navigation across all 15 builds in headless browser', async (t2) => {
    const { baseUrl, close } = await startStaticServer(SYSTEM_DESIGN_ROOT);
    const browser = await launchBrowser();

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      // Land on first build directly
      const firstSlug = BUILD_SLUGS[0];
      await page.goto(`${baseUrl}/build/${firstSlug}/`, { waitUntil: 'networkidle0' });

      // Helper function to verify clean build view
      async function verifyBuildViewClean(slug, stepDescription) {
        // 1. Verify .build-view-tabs does not exist
        const tabsEl = await page.$('.build-view-tabs');
        assert.strictEqual(tabsEl, null, `${stepDescription}: .build-view-tabs must NOT exist for ${slug}`);

        // 2. Verify legacy button strings do not exist anywhere in DOM
        const legacyMatches = await page.evaluate(() => {
          const bodyText = document.body.innerText;
          const legacyPatterns = [
            'Architecture & Reference Code',
            'Architecture &amp; Reference Code',
            'Interactive Lab IDE',
            'Sandbox Mode'
          ];
          const found = [];
          for (const pat of legacyPatterns) {
            if (bodyText.includes(pat)) found.push(pat);
          }
          return found;
        });
        assert.deepStrictEqual(legacyMatches, [], `${stepDescription}: Legacy tab strings found in ${slug}: ${legacyMatches.join(', ')}`);

        // 3. Verify .build-lab-card exists and has valid action buttons
        const cardEl = await page.$('.build-lab-card');
        assert.ok(cardEl, `${stepDescription}: .build-lab-card must exist for ${slug}`);

        const launchBtns = await page.$$('.build-lab-card__launch-btn');
        assert.strictEqual(launchBtns.length, 2, `${stepDescription}: Exactly 2 launch buttons expected on build card for ${slug}`);

        // 4. Verify title matches slug
        const titleText = await page.$eval('.lesson-header__title', el => el.textContent.trim());
        assert.ok(titleText.length > 0, `${stepDescription}: Title should be present`);
      }

      // Verify initial landing
      await verifyBuildViewClean(firstSlug, 'Initial landing');

      // Sequentially navigate across all 15 builds via SPA sidebar clicks
      for (let i = 1; i < BUILD_SLUGS.length; i++) {
        const targetSlug = BUILD_SLUGS[i];
        const stepName = `SPA step ${i + 1}/15 -> ${targetSlug}`;

        // Find sidebar link
        const link = await page.$(`a[data-build="${targetSlug}"]`);
        assert.ok(link, `${stepName}: Sidebar link for ${targetSlug} must exist`);

        await link.click();

        // Wait for route and DOM update
        await page.waitForFunction((slug) => {
          return window.location.pathname.includes(`/build/${slug}/`);
        }, { timeout: 6000 }, targetSlug);

        // Verify clean DOM after transition
        await verifyBuildViewClean(targetSlug, stepName);
      }

      // Now perform rapid history back navigation
      // Note: Due to bubbling between sidebar and document click handlers in app.js,
      // each sidebar click records two history entries. We traverse back until we reach the previous slug.
      for (let i = BUILD_SLUGS.length - 2; i >= 0; i--) {
        const expectedSlug = BUILD_SLUGS[i];
        const stepName = `History Back step -> ${expectedSlug}`;

        // Pop history until expectedSlug is reached
        await page.evaluate(async (target) => {
          while (!window.location.pathname.includes('/build/' + target + '/')) {
            history.back();
            await new Promise(r => setTimeout(r, 80));
          }
        }, expectedSlug);

        await page.waitForFunction((slug) => {
          return window.location.pathname.includes(`/build/${slug}/`);
        }, { timeout: 6000 }, expectedSlug);

        await verifyBuildViewClean(expectedSlug, stepName);
      }

      // Assert zero page runtime console errors during all transitions
      assert.strictEqual(pageErrors.length, 0, `Page errors detected during SPA transitions: ${pageErrors.join('; ')}`);

    } finally {
      await browser.close();
      await close();
    }
  });

  // =========================================================================
  // SUITE 2: Deliberate Tampering Detection Sensitivity
  // =========================================================================
  await t.test('Adversarial 2: Tamper detection sensitivity in stamp-assets.js --check and validate.js', async (t2) => {
    
    // 2A: Asset content mutation (js/renderer.js)
    await t2.test('2A: Mutating asset file content fails --check and validate', async () => {
      const targetFile = path.join(SYSTEM_DESIGN_ROOT, 'js/renderer.js');
      const originalContent = fs.readFileSync(targetFile, 'utf8');
      try {
        fs.writeFileSync(targetFile, originalContent + '\n/* CHALLENGER_TAMPER_TEST_PAYLOAD */\n');

        const checkRes = runCommand('node', ['tools/stamp-assets.js', '--check']);
        assert.strictEqual(checkRes.code, 1, 'stamp-assets --check must exit 1 when asset content changes');
        assert.ok(checkRes.stderr.includes('Asset stamp check failed') || checkRes.stdout.includes('stale:'), 'Output must indicate stale files');

        const valRes = runCommand('node', ['tools/validate.js']);
        assert.strictEqual(valRes.code, 1, 'validate.js must exit 1 when asset stamps are stale');
        assert.ok(valRes.stderr.includes('Asset stamps are stale'), 'validate.js must report stale stamps');
      } finally {
        fs.writeFileSync(targetFile, originalContent);
      }

      // Verify restored clean state
      const cleanCheck = runCommand('node', ['tools/stamp-assets.js', '--check']);
      assert.strictEqual(cleanCheck.code, 0, 'Clean state must pass after restoring asset content');
    });

    // 2B: Query hash tampering in build page (build/merkle-anti-entropy/index.html)
    await t2.test('2B: Tampering with ?v= hash in build page fails --check and validate', async () => {
      const pageFile = path.join(SYSTEM_DESIGN_ROOT, 'build/merkle-anti-entropy/index.html');
      const originalHtml = fs.readFileSync(pageFile, 'utf8');
      try {
        const tamperedHtml = originalHtml.replace(/js\/renderer\.js\?v=[a-f0-9]+/, 'js/renderer.js?v=deadbeef00');
        assert.notStrictEqual(tamperedHtml, originalHtml, 'Regex replacement must have modified query hash');
        fs.writeFileSync(pageFile, tamperedHtml);

        const checkRes = runCommand('node', ['tools/stamp-assets.js', '--check']);
        assert.strictEqual(checkRes.code, 1, 'stamp-assets --check must exit 1 on query hash tampering');
        assert.ok(checkRes.stdout.includes('stale: build/merkle-anti-entropy/index.html'), 'Output must identify tampered page');

        const valRes = runCommand('node', ['tools/validate.js']);
        assert.strictEqual(valRes.code, 1, 'validate.js must exit 1 on query hash tampering in build page');
      } finally {
        fs.writeFileSync(pageFile, originalHtml);
      }

      // Verify restored clean state
      const cleanCheck = runCommand('node', ['tools/stamp-assets.js', '--check']);
      assert.strictEqual(cleanCheck.code, 0, 'Clean state must pass after restoring build page');
    });

    // 2C: Query hash tampering in root index.html
    await t2.test('2C: Tampering with ?v= hash in index.html fails --check and validate', async () => {
      const pageFile = path.join(SYSTEM_DESIGN_ROOT, 'index.html');
      const originalHtml = fs.readFileSync(pageFile, 'utf8');
      try {
        const tamperedHtml = originalHtml.replace(/css\/components\.css\?v=[a-f0-9]+/, 'css/components.css?v=cafebabe00');
        assert.notStrictEqual(tamperedHtml, originalHtml, 'Regex replacement must have modified components.css hash');
        fs.writeFileSync(pageFile, tamperedHtml);

        const checkRes = runCommand('node', ['tools/stamp-assets.js', '--check']);
        assert.strictEqual(checkRes.code, 1, 'stamp-assets --check must exit 1 on index.html tampering');
        assert.ok(checkRes.stdout.includes('stale: index.html'), 'Output must identify index.html');

        const valRes = runCommand('node', ['tools/validate.js']);
        assert.strictEqual(valRes.code, 1, 'validate.js must exit 1 on index.html tampering');
      } finally {
        fs.writeFileSync(pageFile, originalHtml);
      }

      // Verify restored clean state
      const cleanCheck = runCommand('node', ['tools/stamp-assets.js', '--check']);
      assert.strictEqual(cleanCheck.code, 0, 'Clean state must pass after restoring index.html');
    });

    // 2D: Unstamped local asset detection
    await t2.test('2D: Stripping ?v= param completely from HTML asset tag fails --check', async () => {
      const pageFile = path.join(SYSTEM_DESIGN_ROOT, 'build/lru-cache/index.html');
      const originalHtml = fs.readFileSync(pageFile, 'utf8');
      try {
        const unstampedHtml = originalHtml.replace(/src="js\/app\.js\?v=[a-f0-9]+"/, 'src="js/app.js"');
        assert.notStrictEqual(unstampedHtml, originalHtml, 'Must have stripped ?v= parameter');
        fs.writeFileSync(pageFile, unstampedHtml);

        const checkRes = runCommand('node', ['tools/stamp-assets.js', '--check']);
        assert.strictEqual(checkRes.code, 1, 'stamp-assets --check must exit 1 on unstamped asset');
        assert.ok(checkRes.stdout.includes('stale: build/lru-cache/index.html'), 'Must identify lru-cache page as stale');
      } finally {
        fs.writeFileSync(pageFile, originalHtml);
      }

      // Verify restored clean state
      const cleanCheck = runCommand('node', ['tools/stamp-assets.js', '--check']);
      assert.strictEqual(cleanCheck.code, 0, 'Clean state must pass after restoring lru-cache page');
    });
  });

  // =========================================================================
  // SUITE 3: Cold-Start Static Generation & Pipeline Determinism
  // =========================================================================
  await t.test('Adversarial 3: Cold-start static generation produces deterministic, 100% synchronized hashes', async (t2) => {
    
    // Step 1: Execute cold-start pipeline: stamp -> generate-static -> check -> validate
    const stamp1 = runCommand('node', ['tools/stamp-assets.js']);
    assert.strictEqual(stamp1.code, 0, 'tools/stamp-assets.js should execute cleanly');

    const gen1 = runCommand('node', ['tools/generate-static.js']);
    assert.strictEqual(gen1.code, 0, 'tools/generate-static.js should execute cleanly');

    const check1 = runCommand('node', ['tools/stamp-assets.js', '--check']);
    assert.strictEqual(check1.code, 0, 'tools/stamp-assets.js --check must pass after generation');

    const val1 = runCommand('node', ['tools/validate.js']);
    assert.strictEqual(val1.code, 0, 'tools/validate.js must pass with 0 errors and 0 warnings');

    // Step 2: Idempotency test — re-running stamp-assets should find 0 stale files
    const stamp2 = runCommand('node', ['tools/stamp-assets.js']);
    assert.strictEqual(stamp2.code, 0, 'Second run of stamp-assets should execute cleanly');
    assert.ok(stamp2.stdout.includes('0 file(s) stamped'), 'Second stamp must report 0 files stamped (idempotent)');

    // Step 3: Exact on-disk SHA1 parity check across all 15 builds and index.html
    const expectedHashes = {
      'js/renderer.js': hashOf(fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'js/renderer.js'))),
      'js/app.js': hashOf(fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'js/app.js'))),
      'js/manifest.js': hashOf(fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'js/manifest.js'))),
      'css/layout.css': hashOf(fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'css/layout.css'))),
      'css/components.css': hashOf(fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'css/components.css')))
    };

    // Check index.html
    const indexHtml = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'index.html'), 'utf8');
    for (const [assetPath, expectedHash] of Object.entries(expectedHashes)) {
      const pattern = new RegExp(`(?:src|href)="${assetPath.replace('.', '\\.')}\\?v=([a-f0-9]{10})"`);
      const match = indexHtml.match(pattern);
      assert.ok(match, `index.html must reference ${assetPath} with a 10-char hash`);
      assert.strictEqual(match[1], expectedHash, `index.html ${assetPath} hash ${match[1]} must match on-disk sha1 ${expectedHash}`);
    }

    // Check all 15 build pages
    for (const slug of BUILD_SLUGS) {
      const buildHtmlPath = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      assert.ok(fs.existsSync(buildHtmlPath), `build/${slug}/index.html must exist`);
      const buildHtml = fs.readFileSync(buildHtmlPath, 'utf8');

      for (const [assetPath, expectedHash] of Object.entries(expectedHashes)) {
        const pattern = new RegExp(`(?:src|href)="${assetPath.replace('.', '\\.')}\\?v=([a-f0-9]{10})"`);
        const match = buildHtml.match(pattern);
        assert.ok(match, `build/${slug}/index.html must reference ${assetPath} with a 10-char hash`);
        assert.strictEqual(
          match[1],
          expectedHash,
          `build/${slug}/index.html ${assetPath} hash (${match[1]}) must match on-disk sha1 (${expectedHash})`
        );
      }

      // In addition, ensure build page contains NO trace of legacy tabs
      assert.strictEqual(buildHtml.includes('build-view-tabs'), false, `build/${slug}/index.html must not contain build-view-tabs`);
      assert.strictEqual(buildHtml.includes('Architecture & Reference Code'), false, `build/${slug}/index.html must not contain legacy tab button`);
      assert.strictEqual(buildHtml.includes('Architecture &amp; Reference Code'), false, `build/${slug}/index.html must not contain escaped legacy tab button`);
    }
  });

});
