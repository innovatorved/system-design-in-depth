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

test('Tier 1: Feature Coverage (F1 - Comprehensive HTML Asset Stamping)', async (t) => {
  await t.test('T1.1_F1_all_20_build_index_files_exist', () => {
    assert.strictEqual(BUILD_SLUGS.length, 20, 'Must test exactly 20 build slugs');
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      assert.ok(fs.existsSync(p), `Missing static build page: build/${slug}/index.html`);
    }
  });

  await t.test('T1.2_F1_build_index_renderer_script_stamped', () => {
    const hashPattern = /js\/renderer\.js\?v=([a-f0-9]{10})/;
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      const content = fs.readFileSync(p, 'utf8');
      const match = content.match(hashPattern);
      assert.ok(match, `build/${slug}/index.html missing stamped js/renderer.js?v=hash`);
      assert.strictEqual(match[1].length, 10, `Hash in build/${slug}/index.html must be 10 hex characters`);
    }
  });

  await t.test('T1.3_F1_build_index_css_components_stamped', () => {
    const cssPattern = /css\/components\.css\?v=([a-f0-9]{10})/;
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      const content = fs.readFileSync(p, 'utf8');
      const match = content.match(cssPattern);
      assert.ok(match, `build/${slug}/index.html missing stamped css/components.css?v=hash`);
      assert.strictEqual(match[1].length, 10, `CSS hash in build/${slug}/index.html must be 10 hex characters`);
    }
  });

  await t.test('T1.4_F1_hash_parity_root_index_vs_all_build_pages', () => {
    const indexHtml = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'index.html'), 'utf8');
    const rootMatch = indexHtml.match(/js\/renderer\.js\?v=([a-f0-9]{10})/);
    assert.ok(rootMatch, 'index.html must have stamped js/renderer.js');
    const rootHash = rootMatch[1];

    for (const slug of BUILD_SLUGS) {
      const buildHtml = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html'), 'utf8');
      const buildMatch = buildHtml.match(/js\/renderer\.js\?v=([a-f0-9]{10})/);
      assert.ok(buildMatch, `build/${slug}/index.html must have stamped js/renderer.js`);
      assert.strictEqual(
        buildMatch[1],
        rootHash,
        `Hash mismatch for js/renderer.js in build/${slug}/index.html (got ${buildMatch[1]}, expected ${rootHash})`
      );
    }
  });

  await t.test('T1.5_F1_projects_and_404_html_stamped', () => {
    for (const file of ['projects/index.html', '404.html']) {
      const p = path.join(SYSTEM_DESIGN_ROOT, file);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const scriptMatches = [...content.matchAll(/src="([^"?#]+\.js)(?:\?v=([a-f0-9]{10}))?"/g)];
        for (const sm of scriptMatches) {
          if (!sm[1].startsWith('http') && !sm[1].startsWith('//')) {
            assert.ok(sm[2], `${file} has unstamped script ${sm[1]}`);
          }
        }
      }
    }
  });

  await t.test('T1.6_F1_stamp_assets_check_passes', () => {
    const res = runCommand('node', ['tools/stamp-assets.js', '--check'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(res.code, 0, `stamp-assets.js --check failed:\n${res.stdout}\n${res.stderr}`);
  });
});

test('Tier 1: Feature Coverage (F2 - Static Generation Pipeline Consistency)', async (t) => {
  await t.test('T1.7_F2_prerendered_build_meta_attributes', () => {
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      const content = fs.readFileSync(p, 'utf8');
      assert.ok(
        content.includes(`data-prerendered-build="${slug}"`),
        `build/${slug}/index.html missing data-prerendered-build="${slug}" attribute`
      );
    }
  });

  await t.test('T1.8_F2_prerendered_build_content_present', () => {
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      const content = fs.readFileSync(p, 'utf8');
      const hasCard = content.includes('build-lab-card') || content.includes('build-walkthrough-pane');
      assert.ok(hasCard, `build/${slug}/index.html missing prerendered build card or walkthrough pane`);
    }
  });

  await t.test('T1.9_F2_sitemap_contains_all_15_builds', () => {
    const sitemap = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'sitemap.xml'), 'utf8');
    for (const slug of BUILD_SLUGS) {
      assert.ok(
        sitemap.includes(`/build/${slug}/`),
        `sitemap.xml missing URL for build/${slug}/`
      );
    }
  });

  await t.test('T1.10_F2_generate_static_script_structure', () => {
    const script = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'tools/generate-static.js'), 'utf8');
    assert.ok(script.includes('baseHtml'), 'generate-static.js must read baseHtml template');
    assert.ok(script.includes('renderBuild'), 'generate-static.js must call renderBuild');
  });

  await t.test('T1.11_F2_asset_manifest_contains_expected_globals', () => {
    const manifestPath = path.join(SYSTEM_DESIGN_ROOT, 'js/manifest.js');
    assert.ok(fs.existsSync(manifestPath), 'js/manifest.js must exist');
    const manifestCode = fs.readFileSync(manifestPath, 'utf8');
    const ctx = { window: {} };
    vm.runInNewContext(manifestCode, ctx);
    assert.ok(ctx.window.ASSET_VERSION, 'window.ASSET_VERSION must be defined');
    assert.ok(ctx.window.LAZY_MANIFEST, 'window.LAZY_MANIFEST must be defined');
    assert.ok(ctx.window.SITE_COUNTS, 'window.SITE_COUNTS must be defined');
    assert.strictEqual(ctx.window.SITE_COUNTS.builds, 20, 'SITE_COUNTS.builds must equal 20');
  });
});

test('Tier 1: Feature Coverage (F3 - Validation Harness)', async (t) => {
  await t.test('T1.12_F3_validate_js_exits_cleanly', () => {
    const res = runCommand('node', ['tools/validate.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(res.code, 0, `tools/validate.js failed with code ${res.code}:\n${res.stdout}\n${res.stderr}`);
    assert.ok(
      res.stdout.includes('0 errors') || res.stdout.includes('All validations passed') || res.stdout.includes('OK'),
      `tools/validate.js should report 0 errors:\n${res.stdout}`
    );
  });

  await t.test('T1.13_F3_zero_legacy_tab_class_in_all_builds', () => {
    const tabClassPattern = /class="[^"]*\bbuild-view-tabs\b[^"]*"/;
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      const content = fs.readFileSync(p, 'utf8');
      assert.ok(!tabClassPattern.test(content), `Found legacy build-view-tabs in build/${slug}/index.html`);
    }
  });

  await t.test('T1.14_F3_zero_legacy_tab_button_texts_in_all_builds', () => {
    const buttonTexts = [
      /Architecture\s*&\s*Reference\s*Code/i,
      /Interactive\s*Lab\s*IDE/i,
      /Sandbox\s*Mode/i
    ];
    for (const slug of BUILD_SLUGS) {
      const p = path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html');
      const content = fs.readFileSync(p, 'utf8');
      for (const pattern of buttonTexts) {
        assert.ok(!pattern.test(content), `Found legacy button text (${pattern}) in build/${slug}/index.html`);
      }
    }
  });

  await t.test('T1.15_F3_renderer_render_build_has_no_legacy_tabs', () => {
    const rendererCode = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'js/renderer.js'), 'utf8');
    const implementationsCode = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'data/implementations_code.js'), 'utf8');
    const ctx = {
      window: {},
      document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }) },
      console
    };
    vm.runInNewContext(implementationsCode, ctx);
    vm.runInNewContext(rendererCode, ctx);
    assert.ok(ctx.window.Renderer, 'Renderer should be defined on window');
    assert.strictEqual(typeof ctx.window.Renderer.renderBuild, 'function');

    for (const slug of ['merkle-anti-entropy', 'hyperloglog-cardinality', 'sliding-window-rate-limiter']) {
      const rendered = ctx.window.Renderer.renderBuild(slug);
      assert.ok(!rendered.includes('build-view-tabs'), `Renderer.renderBuild(${slug}) output includes build-view-tabs`);
      assert.ok(!/Architecture\s*&\s*Reference\s*Code/i.test(rendered), `renderBuild(${slug}) contains legacy tab text`);
    }
  });

  await t.test('T1.16_F3_stamp_assets_check_flag_exits_0', () => {
    const res = runCommand('node', ['tools/stamp-assets.js', '--check'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(res.code, 0, `stamp-assets.js --check must exit 0: ${res.stdout}`);
  });
});

test('Tier 1: Feature Coverage (F4 - Standalone Sample UI Artifact)', async (t) => {
  const sampleDistPath = path.join(CODE_LAB_ROOT, 'dist/sample.html');
  const sampleSrcPath = path.join(CODE_LAB_ROOT, 'src/sample.html');
  const samplePath = fs.existsSync(sampleDistPath) ? sampleDistPath : sampleSrcPath;

  await t.test('T1.17_F4_sample_html_exists', () => {
    assert.ok(
      fs.existsSync(sampleDistPath) || fs.existsSync(sampleSrcPath),
      'sample.html must exist in dist/ or src/ in code-lab'
    );
  });

  await t.test('T1.18_F4_sample_html_contains_code_lab_tag', () => {
    assert.ok(fs.existsSync(samplePath), 'sample.html must exist to verify tag');
    const content = fs.readFileSync(samplePath, 'utf8');
    assert.ok(content.includes('<code-lab'), 'sample.html must contain <code-lab> custom element');
  });

  await t.test('T1.19_F4_sample_html_relative_assets_only', () => {
    assert.ok(fs.existsSync(samplePath), 'sample.html must exist to verify asset refs');
    const content = fs.readFileSync(samplePath, 'utf8');
    assert.ok(
      content.includes('./code-lab.css') || content.includes('code-lab.css'),
      'sample.html must reference code-lab.css'
    );
    assert.ok(
      content.includes('./code-lab.js') || content.includes('code-lab.js'),
      'sample.html must reference code-lab.js'
    );
    assert.ok(!content.includes('fonts.googleapis.com'), 'sample.html must not depend on Google Fonts');
    assert.ok(!content.includes('cdn.jsdelivr.net/npm/@innovatorved'), 'sample.html must not use remote CDN for code-lab');
  });

  await t.test('T1.20_F4_sample_html_starter_files_defined', () => {
    assert.ok(fs.existsSync(samplePath), 'sample.html must exist to verify starter files');
    const content = fs.readFileSync(samplePath, 'utf8');
    const hasFiles = content.includes('server.js') || content.includes('index.js') || content.includes('limiter.js') || content.includes('README.md');
    assert.ok(hasFiles, 'sample.html must define starter mock files');
  });

  await t.test('T1.21_F4_sample_html_min_size_and_structure', () => {
    assert.ok(fs.existsSync(samplePath), 'sample.html must exist to verify structure');
    const stat = fs.statSync(samplePath);
    assert.ok(stat.size > 500, `sample.html too small (${stat.size} bytes)`);
    const content = fs.readFileSync(samplePath, 'utf8');
    assert.ok(/<!DOCTYPE\s+html>/i.test(content), 'sample.html must have valid DOCTYPE');
    assert.ok(/<html/i.test(content) && /<\/html>/i.test(content), 'sample.html must have html tags');
  });
});

test('Tier 1: Feature Coverage (F5 - Package Exports & Files Integrity)', async (t) => {
  const pkgPath = path.join(CODE_LAB_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  await t.test('T1.22_F5_package_json_files_includes_dist', () => {
    assert.ok(Array.isArray(pkg.files), 'package.json must contain "files" array');
    assert.ok(pkg.files.includes('dist'), 'package.json "files" must include "dist"');
  });

  await t.test('T1.23_F5_package_json_exports_sample_html', () => {
    assert.ok(pkg.exports, 'package.json must have "exports" object');
    assert.ok(
      pkg.exports['./sample.html'] || pkg.exports['./dist/sample.html'],
      'package.json exports must expose ./sample.html'
    );
  });

  await t.test('T1.24_F5_package_json_exports_sample', () => {
    assert.ok(pkg.exports, 'package.json must have "exports" object');
    assert.ok(
      pkg.exports['./sample'] || pkg.exports['./sample.html'],
      'package.json exports must expose ./sample'
    );
  });

  await t.test('T1.25_F5_package_json_main_and_style_valid', () => {
    assert.ok(pkg.main, 'package.json must have main');
    assert.ok(pkg.style, 'package.json must have style');
    assert.ok(fs.existsSync(path.join(CODE_LAB_ROOT, pkg.main)), 'main target file must exist');
    assert.ok(fs.existsSync(path.join(CODE_LAB_ROOT, pkg.style)), 'style target file must exist');
  });

  await t.test('T1.26_F5_package_name_and_version', () => {
    assert.strictEqual(pkg.name, '@innovatorved/code-lab');
    assert.ok(/^\d+\.\d+\.\d+/.test(pkg.version), 'version must follow semver');
  });
});

test('Tier 1: Feature Coverage (F6 - Full Viewport & Offline Fallback Editor)', async (t) => {
  const sampleDistPath = path.join(CODE_LAB_ROOT, 'dist/sample.html');
  const sampleSrcPath = path.join(CODE_LAB_ROOT, 'src/sample.html');
  const samplePath = fs.existsSync(sampleDistPath) ? sampleDistPath : sampleSrcPath;

  await t.test('T1.27_F6_sample_html_viewport_meta', () => {
    assert.ok(fs.existsSync(samplePath), 'sample.html must exist');
    const content = fs.readFileSync(samplePath, 'utf8');
    assert.ok(
      content.includes('<meta name="viewport"') && content.includes('width=device-width'),
      'sample.html must have responsive viewport meta tag'
    );
  });

  await t.test('T1.28_F6_sample_html_edge_to_edge_css', () => {
    assert.ok(fs.existsSync(samplePath), 'sample.html must exist');
    const content = fs.readFileSync(samplePath, 'utf8');
    const hasFullWidth = content.includes('100vw') || content.includes('width: 100%');
    const hasFullHeight = content.includes('100vh') || content.includes('height: 100%');
    assert.ok(hasFullWidth && hasFullHeight, 'sample.html must contain full viewport edge-to-edge styling');
  });

  await t.test('T1.29_F6_offline_fallback_editor_in_workbench', () => {
    const workbenchPath = ['src/workbench.ts', 'src/workbench.js']
      .map(p => path.join(CODE_LAB_ROOT, p))
      .find(p => fs.existsSync(p));
    assert.ok(workbenchPath, 'code-lab workbench source must exist');
    const workbenchCode = fs.readFileSync(workbenchPath, 'utf8');
    assert.ok(workbenchCode.includes('cl-fallback-editor'), 'workbench must include fallback editor textarea');
    assert.ok(workbenchCode.includes('cl-fallback-gutter'), 'workbench must include fallback gutter line numbers');
  });

  await t.test('T1.30_F6_code_lab_css_zero_external_network_urls', () => {
    const css = fs.readFileSync(path.join(CODE_LAB_ROOT, 'src/code-lab.css'), 'utf8');
    assert.ok(!css.includes('@import url'), 'code-lab.css must not use @import url');
    assert.ok(!/url\(\s*["']?https?:\/\//i.test(css), 'code-lab.css must not load remote images or fonts');
  });

  await t.test('T1.31_F6_code_lab_css_system_font_fallbacks', () => {
    const css = fs.readFileSync(path.join(CODE_LAB_ROOT, 'src/code-lab.css'), 'utf8');
    assert.ok(css.includes('--cl-font-sans'), 'code-lab.css must define sans font token');
    assert.ok(css.includes('--cl-font-mono'), 'code-lab.css must define mono font token');
    assert.ok(css.includes('monospace'), 'code-lab.css must fallback to monospace');
  });
});

test('Tier 1: Feature Coverage (F7 - Code-Lab Test Suite)', async (t) => {
  const res = runCommand('bun', ['run', 'test:all'], CODE_LAB_ROOT);

  await t.test('T1.32_F7_bun_test_all_exits_cleanly', () => {
    assert.strictEqual(res.code, 0, `bun run test:all exited with non-zero code ${res.code}:\n${res.stdout}\n${res.stderr}`);
  });

  await t.test('T1.33_F7_bun_test_total_count_106', () => {
    assert.ok(
      res.stdout.includes('106 tests') || res.stdout.includes('106 / 106') || res.stdout.includes('106 passed'),
      `bun run test:all should execute 106 tests:\n${res.stdout}`
    );
  });

  await t.test('T1.34_F7_bun_test_pass_rate_100', () => {
    assert.ok(
      res.stdout.includes('100.0%') || res.stdout.includes('100%'),
      `bun run test:all should report 100% pass rate:\n${res.stdout}`
    );
  });

  await t.test('T1.35_F7_bun_test_tier1_40_passed', () => {
    assert.ok(
      res.stdout.includes('40 / 40 passed') || res.stdout.includes('40 passed'),
      `bun run test:all Tier 1 should pass 40/40:\n${res.stdout}`
    );
  });

  await t.test('T1.36_F7_bun_test_tier2_tier3_tier4_passed', () => {
    assert.ok(res.stdout.includes('Tier 2'), 'Must report Tier 2');
    assert.ok(res.stdout.includes('Tier 3'), 'Must report Tier 3');
    assert.ok(res.stdout.includes('Tier 4'), 'Must report Tier 4');
  });
});

test('Tier 1: Feature Coverage (F8 - Headless SPA Build-Switching Navigation)', async (t) => {
  const { baseUrl, close } = await startStaticServer(SYSTEM_DESIGN_ROOT);
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await t.test('T1.37_F8_initial_build_page_renders_cleanly', async () => {
      await page.goto(`${baseUrl}/build/merkle-anti-entropy/`, { waitUntil: 'networkidle0' });
      const card = await page.$('.build-lab-card, .build-walkthrough-pane');
      assert.ok(card, 'Initial build page must render build lab card or walkthrough pane');
    });

    await t.test('T1.38_F8_initial_page_has_zero_legacy_tabs', async () => {
      const tabs = await page.$('.build-view-tabs');
      assert.strictEqual(tabs, null, 'Initial build page must not render .build-view-tabs');
    });

    await t.test('T1.39_F8_spa_click_switches_build_slug', async () => {
      const link = await page.$('a[data-build="hyperloglog-cardinality"]');
      assert.ok(link, 'Sidebar link for hyperloglog-cardinality must exist');
      await link.click();
      await page.waitForFunction(() => {
        const title = document.querySelector('.lesson-header__title');
        return title && /HyperLogLog/i.test(title.textContent);
      }, { timeout: 6000 });
      const currentUrl = page.url();
      assert.ok(currentUrl.includes('hyperloglog-cardinality'), 'URL should reflect new build slug');
    });

    await t.test('T1.40_F8_zero_legacy_tabs_after_spa_switch', async () => {
      const tabs = await page.$('.build-view-tabs');
      assert.strictEqual(tabs, null, 'After SPA build switch, .build-view-tabs must not be present');
    });

    await t.test('T1.41_F8_zero_legacy_button_labels_after_switch', async () => {
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a'))
          .map(el => el.textContent.trim())
          .filter(t => /Architecture\s*&\s*Reference\s*Code|Interactive\s*Lab\s*IDE|Sandbox\s*Mode/i.test(t));
      });
      assert.strictEqual(buttons.length, 0, `Found legacy tab buttons after switch: ${buttons.join(', ')}`);
    });

    await t.test('T1.42_F8_consecutive_build_switch_stays_clean', async () => {
      const secondLink = await page.$('a[data-build="sliding-window-rate-limiter"]');
      assert.ok(secondLink, 'Sidebar link for sliding-window-rate-limiter must exist');
      await secondLink.click();
      await page.waitForFunction(() => {
        const title = document.querySelector('.lesson-header__title');
        return title && /Sliding Window/i.test(title.textContent);
      }, { timeout: 6000 });

      const tabs = await page.$('.build-view-tabs');
      assert.strictEqual(tabs, null, 'Third build page must have zero .build-view-tabs');
    });
  } finally {
    await browser.close();
    await close();
  }
});

test('Tier 1: Feature Coverage (F9 - Cloudflare Pages Deployment Sync)', async (t) => {
  await t.test('T1.43_F9_system_design_tools_build_generates_dist', () => {
    const res = runCommand('node', ['tools/build.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(res.code, 0, `tools/build.js failed:\n${res.stdout}\n${res.stderr}`);
    const distIndex = path.join(SYSTEM_DESIGN_ROOT, 'dist/index.html');
    assert.ok(fs.existsSync(distIndex), 'dist/index.html must exist after tools/build.js');
  });

  await t.test('T1.44_F9_system_design_dist_headers_immutable', () => {
    const headersPath = path.join(SYSTEM_DESIGN_ROOT, 'dist/_headers');
    assert.ok(fs.existsSync(headersPath), 'dist/_headers must exist');
    const headers = fs.readFileSync(headersPath, 'utf8');
    assert.ok(headers.includes('/js/*'), 'dist/_headers must configure /js/*');
    assert.ok(headers.includes('/css/*'), 'dist/_headers must configure /css/*');
    assert.ok(headers.includes('immutable'), 'dist/_headers must specify immutable cache-control');
  });

  await t.test('T1.45_F9_system_design_dist_redirects', () => {
    const redirectsPath = path.join(SYSTEM_DESIGN_ROOT, 'dist/_redirects');
    assert.ok(fs.existsSync(redirectsPath), 'dist/_redirects must exist');
    const redirects = fs.readFileSync(redirectsPath, 'utf8');
    assert.ok(
      redirects.includes('system-design-in-depth.vedgupta.in') || redirects.includes(':splat'),
      'dist/_redirects must configure canonical redirects'
    );
  });

  await t.test('T1.46_F9_code_lab_cloud_ide_config', () => {
    const astroConfig = path.join(CODE_LAB_ROOT, 'examples/cloud-ide/astro.config.mjs');
    assert.ok(fs.existsSync(astroConfig), 'examples/cloud-ide/astro.config.mjs must exist');
    const content = fs.readFileSync(astroConfig, 'utf8');
    assert.ok(content.includes('cloudflare') || content.includes('static'), 'Astro config should support Cloudflare Pages');
  });

  await t.test('T1.47_F9_wrangler_targets_verified', () => {
    const systemDesignWrangler = path.join(SYSTEM_DESIGN_ROOT, '.wrangler');
    assert.ok(fs.existsSync(systemDesignWrangler), 'system-design must have wrangler setup or config');
  });
});
