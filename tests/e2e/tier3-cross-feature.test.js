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

test('Tier 3: Cross-Feature Interactions', async (t) => {
  await t.test('T3.1_full_pipeline_stamp_generate_validate_consistency', () => {
    // 1. Stamp assets
    const stampRes = runCommand('node', ['tools/stamp-assets.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(stampRes.code, 0, `stamp-assets.js failed:\n${stampRes.stdout}\n${stampRes.stderr}`);

    // 2. Generate static pages
    const genRes = runCommand('node', ['tools/generate-static.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(genRes.code, 0, `generate-static.js failed:\n${genRes.stdout}\n${genRes.stderr}`);

    // 3. Stamp check
    const checkRes = runCommand('node', ['tools/stamp-assets.js', '--check'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(checkRes.code, 0, `stamp-assets.js --check failed after generate-static:\n${checkRes.stdout}`);

    // 4. Validate
    const valRes = runCommand('node', ['tools/validate.js'], SYSTEM_DESIGN_ROOT);
    assert.strictEqual(valRes.code, 0, `tools/validate.js failed after static generation:\n${valRes.stdout}`);
  });

  await t.test('T3.2_disk_sha1_parity_with_static_and_manifest_hashes', () => {
    const rendererFile = path.join(SYSTEM_DESIGN_ROOT, 'js/renderer.js');
    assert.ok(fs.existsSync(rendererFile), 'js/renderer.js must exist on disk');
    const diskHash = hashOf(fs.readFileSync(rendererFile));

    const indexHtml = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'index.html'), 'utf8');
    const indexMatch = indexHtml.match(/js\/renderer\.js\?v=([a-f0-9]{10})/);
    assert.ok(indexMatch, 'index.html must have stamped renderer.js');
    assert.strictEqual(indexMatch[1], diskHash, `index.html hash (${indexMatch[1]}) does not match disk SHA1 (${diskHash})`);

    for (const slug of BUILD_SLUGS) {
      const buildHtml = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'build', slug, 'index.html'), 'utf8');
      const buildMatch = buildHtml.match(/js\/renderer\.js\?v=([a-f0-9]{10})/);
      assert.ok(buildMatch, `build/${slug}/index.html must have stamped renderer.js`);
      assert.strictEqual(
        buildMatch[1],
        diskHash,
        `build/${slug}/index.html hash (${buildMatch[1]}) does not match disk SHA1 (${diskHash})`
      );
    }
  });

  await t.test('T3.3_sample_html_bundles_actual_code_lab_dist_assets', () => {
    const distDir = path.join(CODE_LAB_ROOT, 'dist');
    const sampleHtmlPath = path.join(distDir, 'sample.html');
    const srcSampleHtmlPath = path.join(CODE_LAB_ROOT, 'src/sample.html');
    const targetSample = fs.existsSync(sampleHtmlPath) ? sampleHtmlPath : srcSampleHtmlPath;

    assert.ok(fs.existsSync(targetSample), 'sample.html must exist');
    const sampleContent = fs.readFileSync(targetSample, 'utf8');

    const cssPath = path.join(distDir, 'code-lab.css');
    const jsPath = path.join(distDir, 'code-lab.js');

    assert.ok(fs.existsSync(cssPath), 'dist/code-lab.css must exist');
    assert.ok(fs.existsSync(jsPath), 'dist/code-lab.js must exist');

    const cssStat = fs.statSync(cssPath);
    const jsStat = fs.statSync(jsPath);

    assert.ok(cssStat.size > 50000, `code-lab.css is too small: ${cssStat.size} bytes`);
    assert.ok(jsStat.size > 500000, `code-lab.js is too small: ${jsStat.size} bytes`);

    assert.ok(
      sampleContent.includes('code-lab.css') && sampleContent.includes('code-lab.js'),
      'sample.html must reference bundled code-lab.css and code-lab.js'
    );
  });

  await t.test('T3.4_node_vm_renderer_matches_live_browser_dom', async () => {
    // VM render
    const rendererCode = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'js/renderer.js'), 'utf8');
    const implementationsCode = fs.readFileSync(path.join(SYSTEM_DESIGN_ROOT, 'data/implementations_code.js'), 'utf8');
    const ctx = {
      window: {},
      document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }) },
      console
    };
    vm.runInNewContext(implementationsCode, ctx);
    vm.runInNewContext(rendererCode, ctx);
    const vmRendered = ctx.window.Renderer.renderBuild('merkle-anti-entropy');

    // Headless browser render
    const { baseUrl, close } = await startStaticServer(SYSTEM_DESIGN_ROOT);
    const browser = await launchBrowser();

    try {
      const page = await browser.newPage();
      await page.goto(`${baseUrl}/build/merkle-anti-entropy/`, { waitUntil: 'networkidle0' });
      const browserContent = await page.evaluate(() => {
        const reader = document.getElementById('reader');
        return reader ? reader.innerHTML : '';
      });

      // Both should have zero legacy tabs
      assert.ok(!vmRendered.includes('build-view-tabs'), 'VM render contains build-view-tabs');
      assert.ok(!browserContent.includes('build-view-tabs'), 'Browser DOM contains build-view-tabs');

      // Both should contain the build card
      assert.ok(vmRendered.includes('build-lab-card'), 'VM render missing build-lab-card');
      assert.ok(browserContent.includes('build-lab-card'), 'Browser DOM missing build-lab-card');
    } finally {
      await browser.close();
      await close();
    }
  });

  await t.test('T3.5_code_lab_package_export_resolution_for_downstream', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(CODE_LAB_ROOT, 'package.json'), 'utf8'));
    assert.ok(pkg.exports, 'package.json must contain exports map');

    const sampleExport = pkg.exports['./sample'] || pkg.exports['./sample.html'];
    assert.ok(sampleExport, 'Exports map must define ./sample or ./sample.html');
    const resolvedPath = path.resolve(CODE_LAB_ROOT, typeof sampleExport === 'string' ? sampleExport : sampleExport.default);
    assert.ok(fs.existsSync(resolvedPath), `Resolved export path does not exist on disk: ${resolvedPath}`);
  });
});
