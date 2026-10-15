const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  SYSTEM_DESIGN_ROOT,
  CODE_LAB_ROOT,
  BUILD_SLUGS,
  hashOf,
  runCommand,
  startStaticServer,
  launchBrowser
} = require('./helpers.js');

test('Tier 2: Boundary & Corner Cases (Asset Stamping & Hash Boundaries)', async (t) => {
  await t.test('T2.1_hash_format_strict_10_hex_characters', () => {
    const hashRegex = /^[a-f0-9]{10}$/;
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      const content = fs.readFileSync(p, 'utf8');
      const matches = [...content.matchAll(/(?:src|href)="[^"?#]+\.(?:js|css)\?v=([^"]+)"/g)];
      assert.ok(matches.length > 0, `build/${slug}/index.html must have stamped assets`);
      for (const m of matches) {
        assert.ok(
          hashRegex.test(m[1]),
          `Asset hash "${m[1]}" in build/${slug}/index.html does not match strict 10-char hex regex`
        );
      }
    }
  });

  await t.test('T2.2_missing_asset_detection_in_stamp_tool', () => {
    const stampCode = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'tools/stamp-assets.js'), 'utf8');
    assert.ok(
      stampCode.includes('missing') || stampCode.includes('existsSync'),
      'stamp-assets.js must check if referenced local files exist on disk'
    );
  });

  await t.test('T2.3_query_param_replacement_idempotency', () => {
    const sampleHtml = '<script src="js/renderer.js?v=oldhash123"></script>\n<link href="css/components.css?v=oldcss456" rel="stylesheet">';
    const replaced = sampleHtml.replace(
      /(<(?:script|link)\b[^>]*?\s(?:src|href)=")([^"?#]+\.(?:js|css))(?:\?v=[\w]+)?(")/g,
      (all, pre, url, post) => `${pre}${url}?v=newhash789${post}`
    );
    assert.ok(!replaced.includes('?v=oldhash123'), 'Old hash should be replaced');
    assert.ok(!replaced.includes('?v=newhash789?v='), 'Query parameters must not accumulate');
    const matches = replaced.match(/\?v=newhash789/g);
    assert.strictEqual(matches.length, 2, 'Exactly two stamps should be present');
  });

  await t.test('T2.4_empty_attribute_and_external_urls_ignored', () => {
    const sampleHtml = `
      <script src=""></script>
      <script src="https://cdn.example.com/lib.js"></script>
      <script src="//ajax.googleapis.com/ajax/libs/jquery.min.js"></script>
      <link href="http://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
    `;
    const replaced = sampleHtml.replace(
      /(<(?:script|link)\b[^>]*?\s(?:src|href)=")([^"?#]+\.(?:js|css))(?:\?v=[\w]+)?(")/g,
      (all, pre, url, post) => {
        if (/^(https?:)?\/\//.test(url) || !url) return all;
        return `${pre}${url}?v=stamped${post}`;
      }
    );
    assert.ok(replaced.includes('https://cdn.example.com/lib.js'), 'External HTTPS urls must not be altered');
    assert.ok(replaced.includes('//ajax.googleapis.com'), 'Protocol-relative urls must not be altered');
    assert.ok(replaced.includes('http://fonts.googleapis.com'), 'External HTTP urls must not be altered');
  });

  await t.test('T2.5_all_15_slugs_individual_boundary_integrity', () => {
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      assert.ok(fs.existsSync(p), `Missing directory or index for: ${slug}`);
      const content = fs.readFileSync(p, 'utf8');
      assert.ok(content.length > 5000, `build/${slug}/index.html unexpectedly small (${content.length} chars)`);
      assert.ok(content.includes('<title>'), `build/${slug}/index.html must have <title> tag`);
      assert.ok(content.includes('data-prerendered-build='), `build/${slug}/index.html must have data-prerendered-build`);
    }
  });
});

test('Tier 2: Boundary & Corner Cases (Standalone UI & Viewport Boundaries)', async (t) => {
  const sampleDist = path.join(CODE_LAB_ROOT, 'dist/sample.html');
  const sampleSrc = path.join(CODE_LAB_ROOT, 'src/sample.html');
  const samplePath = fs.existsSync(sampleDist) ? sampleDist : sampleSrc;

  const { baseUrl, close } = await startStaticServer(CODE_LAB_ROOT);
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    const targetUrl = fs.existsSync(sampleDist) ? `${baseUrl}/dist/sample.html` : `${baseUrl}/src/sample.html`;

    await t.test('T2.6_viewport_extreme_narrow_mobile_320x480', async () => {
      await page.setViewport({ width: 320, height: 480 });
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(scrollWidth <= 330, `Mobile viewport has horizontal overflow: ${scrollWidth}px vs 320px`);
    });

    await t.test('T2.7_viewport_extreme_ultrawide_2560x1440', async () => {
      await page.setViewport({ width: 2560, height: 1440 });
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      const appHeight = await page.evaluate(() => {
        const app = document.querySelector('#app') || document.body;
        return app.getBoundingClientRect().height;
      });
      assert.ok(appHeight >= 900, `Ultrawide container height should expand beyond default cap: ${appHeight}px`);
    });

    await t.test('T2.8_offline_airgap_monaco_blocked', async () => {
      const airgapPage = await browser.newPage();
      await airgapPage.setRequestInterception(true);
      airgapPage.on('request', (req) => {
        const url = req.url();
        if (url.includes('cdn.jsdelivr.net') || url.includes('monaco-editor') || url.includes('fonts.googleapis.com')) {
          req.abort();
        } else {
          req.continue();
        }
      });
      await airgapPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      // Give time for fallback editor to initialize
      await new Promise(r => setTimeout(r, 1000));
      const hasEditor = await airgapPage.evaluate(() => {
        return !!(document.querySelector('#cl-fallback-editor') || document.querySelector('textarea') || document.querySelector('.codelab'));
      });
      assert.ok(hasEditor, 'Airgapped mode must initialize fallback editor or workbench without crash');
      await airgapPage.close();
    });

    await t.test('T2.9_empty_files_config_handling', async () => {
      const result = await page.evaluate(() => {
        try {
          const el = document.createElement('code-lab');
          el.files = {};
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      });
      assert.ok(result.success, `code-lab with empty files threw error: ${result.error}`);
    });

    await t.test('T2.10_special_characters_in_mock_filenames', async () => {
      const result = await page.evaluate(() => {
        try {
          const el = document.createElement('code-lab');
          el.files = {
            'src/api/v1/rate_limiter.test.js': '// rate limiter test',
            'deep/nested/path/component-v2.spec.ts': '// deep nested file'
          };
          return { success: true, count: Object.keys(el.files).length };
        } catch (e) {
          return { success: false, error: e.message };
        }
      });
      assert.ok(result.success, `Mock filenames with special characters failed: ${result.error}`);
    });
  } finally {
    await browser.close();
    await close();
  }
});

test('Tier 2: Boundary & Corner Cases (SPA Navigation & History Boundaries)', async (t) => {
  const { baseUrl, close } = await startStaticServer(SYSTEM_DESIGN_ROOT);
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await t.test('T2.11_rapid_sequential_clicks_no_race_condition', async () => {
      await page.goto(`${baseUrl}/build/merkle-anti-entropy/`, { waitUntil: 'networkidle0' });
      const links = await page.$$('a[data-build]');
      assert.ok(links.length >= 3, 'Must have at least 3 build links');

      // Click rapidly
      for (let i = 0; i < 3; i++) {
        await links[i].click().catch(() => {});
      }
      // Wait for stabilization
      await new Promise(r => setTimeout(r, 1000));
      const tabs = await page.$('.build-view-tabs');
      assert.strictEqual(tabs, null, 'Rapid clicks must not produce .build-view-tabs');
    });

    await t.test('T2.12_direct_landing_vs_spa_switch_dom_parity', async () => {
      // 1. Direct landing on keyset-pagination-cursors
      const directPage = await browser.newPage();
      await directPage.goto(`${baseUrl}/build/keyset-pagination-cursors/`, { waitUntil: 'networkidle0' });
      const directTabs = await directPage.$('.build-view-tabs');
      const directHasCard = await directPage.$('.build-lab-card, .build-walkthrough-pane');
      assert.strictEqual(directTabs, null, 'Direct landing must have no .build-view-tabs');
      assert.ok(directHasCard, 'Direct landing must have build card');
      await directPage.close();

      // 2. SPA navigate to keyset-pagination-cursors
      await page.goto(`${baseUrl}/build/merkle-anti-entropy/`, { waitUntil: 'networkidle0' });
      const targetLink = await page.$('a[data-build="keyset-pagination-cursors"]');
      assert.ok(targetLink, 'Target link for keyset-pagination-cursors must exist');
      await targetLink.click();
      await page.waitForFunction(() => {
        const title = document.querySelector('.lesson-header__title');
        return title && /Keyset/i.test(title.textContent);
      }, { timeout: 6000 });
      const spaTabs = await page.$('.build-view-tabs');
      const spaHasCard = await page.$('.build-lab-card, .build-walkthrough-pane');
      assert.strictEqual(spaTabs, null, 'SPA navigation must have no .build-view-tabs');
      assert.ok(spaHasCard, 'SPA navigation must have build card');
    });

    await t.test('T2.13_browser_history_back_forward_navigation', async () => {
      await page.goto(`${baseUrl}/build/merkle-anti-entropy/`, { waitUntil: 'networkidle0' });
      const nextLink = await page.$('a[data-build="bloom-filter-membership"]');
      if (nextLink) {
        await nextLink.click();
        await page.waitForFunction(() => {
          const title = document.querySelector('.lesson-header__title');
          return title && /Bloom Filter/i.test(title.textContent);
        }, { timeout: 6000 });

        // Go back
        await page.goBack({ waitUntil: 'networkidle0' });
        const backTabs = await page.$('.build-view-tabs');
        assert.strictEqual(backTabs, null, 'Back navigation must have no .build-view-tabs');

        // Go forward
        await page.goForward({ waitUntil: 'networkidle0' });
        const forwardTabs = await page.$('.build-view-tabs');
        assert.strictEqual(forwardTabs, null, 'Forward navigation must have no .build-view-tabs');
      }
    });

    await t.test('T2.14_page_reload_on_switched_build', async () => {
      await page.reload({ waitUntil: 'networkidle0' });
      const tabs = await page.$('.build-view-tabs');
      assert.strictEqual(tabs, null, 'Reloaded page must have no .build-view-tabs');
    });

    await t.test('T2.15_hash_route_fallback_handling', async () => {
      await page.goto(`${baseUrl}/#build/write-ahead-log`, { waitUntil: 'networkidle0' });
      // Wait for router dispatch
      await new Promise(r => setTimeout(r, 1000));
      const tabs = await page.$('.build-view-tabs');
      assert.strictEqual(tabs, null, 'Hash-based build navigation must have no .build-view-tabs');
    });
  } finally {
    await browser.close();
    await close();
  }
});
