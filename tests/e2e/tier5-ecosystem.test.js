const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const {
  SYSTEM_DESIGN_ROOT,
  startStaticServer,
  launchBrowser
} = require('./helpers');

describe('Tier 5: All-in-One Ecosystem Hubs (Roadmap, Challenges, Dashboard, Sandbox)', () => {
  let server;
  let browser;

  before(async () => {
    server = await startStaticServer(SYSTEM_DESIGN_ROOT);
    browser = await launchBrowser();
  });

  after(async () => {
    if (browser) await browser.close();
    if (server) await server.close();
  });

  test('T5.1: Interactive Visual Roadmap renders SVG DAG, Career Paths, and Modules Explorer', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/roadmap`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.roadmap-view', { timeout: 10000 });

      const nodeCount = await page.$$eval('.roadmap-node', els => els.length);
      assert.equal(nodeCount, 34, 'Roadmap DAG should render all 34 dependency nodes');

      // Switch to Career Paths tab
      await page.click('.view-tab[data-roadmap-tab="paths"]');
      await page.waitForSelector('[data-path-id]', { timeout: 5000 });
      const pathCount = await page.$$eval('[data-path-id]', els => els.length);
      assert.equal(pathCount, 5, 'Should render all 5 career learning paths');

      // Switch to Modules Explorer tab
      await page.click('.view-tab[data-roadmap-tab="modules"]');
      await page.waitForSelector('[data-module-card]', { timeout: 5000 });
      const modCount = await page.$$eval('[data-module-card]', els => els.length);
      assert.equal(modCount, 18, 'Should render all 18 curriculum module cards');
    } finally {
      await page.close();
    }
  });

  test('T5.2: Production Incident Challenges directory, Incident Room, Runbook Preset & Verification', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/challenges`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.challenges-view', { timeout: 10000 });

      const cardCount = await page.$$eval('.challenge-card', els => els.length);
      assert.equal(cardCount, 12, 'Should render all 12 production incident challenges');

      // Filter by Insane difficulty
      await page.click('[data-challenge-tier="insane"]');
      const insaneCount = await page.$$eval('.challenge-card', els => els.length);
      assert.ok(insaneCount >= 2, 'Insane tier filter should show insane challenges');

      // Reset to All and open retry-storm-meltdown
      await page.click('[data-challenge-tier="all"]');
      await page.click('[data-enter-challenge="retry-storm-meltdown"]');
      await page.waitForSelector('.incident-room', { timeout: 5000 });

      // Apply runbook preset and verify recovery
      await page.click('#auto-tune-optimal-btn');
      await page.click('#verify-incident-btn');
      await page.waitForSelector('#incident-verify-result', { timeout: 5000 });

      const bannerText = await page.$eval('#incident-verify-result', el => el.textContent);
      assert.ok(bannerText.includes('INCIDENT RESOLVED'), 'Verification with runbook preset should resolve the outage');

      const isCompleted = await page.evaluate(() => window.Progress.isCompleted('challenge:retry-storm-meltdown'));
      assert.equal(isCompleted, true, 'Resolving challenge should mark it complete in Progress');
    } finally {
      await page.close();
    }
  });

  test('T5.3: Learner Dashboard Overview, SRS SM-2 Flashcard Review, and Notes Persistence', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/dashboard`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.dashboard-view', { timeout: 10000 });

      const kpiCards = await page.$$eval('.dash-kpi-card', els => els.length);
      assert.equal(kpiCards, 4, 'Dashboard overview should display 4 KPI cards');

      // Switch to SRS Flashcards tab
      await page.click('.view-tab[data-dash-tab="srs"]');
      await page.waitForSelector('#srs-active-card', { timeout: 5000 });

      // Flip card and rate Good (4)
      await page.click('#srs-flip-btn');
      await page.waitForSelector('[data-srs-rate="4"]', { timeout: 5000 });
      await page.click('[data-srs-rate="4"]');

      // Switch to Notes & Bookmarks tab
      await page.click('.view-tab[data-dash-tab="notes"]');
      await page.waitForSelector('#dash-note-textarea', { timeout: 5000 });

      await page.type('#dash-note-textarea', 'Quorum R + W > N guarantees strong overlap.');
      await page.click('#dash-save-note-btn');

      const savedNote = await page.evaluate(() => {
        const select = document.getElementById('dash-note-topic-select');
        return window.Progress.getNote(select.value);
      });
      assert.ok(savedNote.includes('Quorum R + W > N'), 'Saved note should persist in Progress storage');
    } finally {
      await page.close();
    }
  });

  test('T5.4: Architecture Whiteboard & Capacity Estimator Sandbox (Multi-Tab, Excalidraw Tools, Delete, Single-Click Integrity)', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/sandbox`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.sandbox-view', { timeout: 10000 });

      // 1. Navigate away and back to /sandbox to verify no listener stacking (single click = 1 item)
      await page.evaluate(() => window.App.navigateToRoadmap());
      await page.waitForSelector('.roadmap-view', { timeout: 5000 });
      await page.evaluate(() => window.App.navigateToSandbox());
      await page.waitForSelector('.sandbox-view', { timeout: 5000 });

      // Load Twitter Feed blueprint
      await page.click('[data-load-blueprint="twitter-feed"]');
      const nodeCount = await page.$$eval('.wb-node', els => els.length);
      assert.ok(nodeCount >= 5, 'Twitter blueprint should render multiple topology nodes');

      // 2. Single click on palette block adds EXACTLY 1 node (not 2 or 3)
      await page.click('[data-add-block="CDN"]');
      const updatedNodeCount = await page.$$eval('.wb-node', els => els.length);
      assert.equal(updatedNodeCount, nodeCount + 1, 'Clicking a palette block once must add exactly 1 node even after SPA re-mount');

      // 3. Delete selected node via floating dock delete button
      await page.click('[data-sandbox-action="delete-selected"]');
      const afterDeleteCount = await page.$$eval('.wb-node', els => els.length);
      assert.equal(afterDeleteCount, nodeCount, 'Deleting selected node should remove it from the canvas');

      // 4. Undo brings the deleted node back
      await page.click('[data-sandbox-action="undo"]');
      const afterUndoCount = await page.$$eval('.wb-node', els => els.length);
      assert.equal(afterUndoCount, nodeCount + 1, 'Undo should restore the deleted node');

      // 5. Excalidraw tools: Zone Frame and Sticky Note
      const initialFrames = await page.$$eval('.wb-frame', els => els.length);
      await page.click('[data-wb-tool="frame"]');
      const afterFrameCount = await page.$$eval('.wb-frame', els => els.length);
      assert.equal(afterFrameCount, initialFrames + 1, 'Frame tool should stamp a new VPC/Zone boundary frame');

      const initialNotes = await page.$$eval('.wb-note', els => els.length);
      await page.click('[data-wb-tool="note"]');
      const afterNoteCount = await page.$$eval('.wb-note', els => els.length);
      assert.equal(afterNoteCount, initialNotes + 1, 'Sticky Note tool should stamp a new annotation note');

      // 6. Multi-Board Tabs: create new tab, verify tab count, close tab
      const initialTabs = await page.$$eval('.wb-tab', els => els.length);
      await page.click('[data-wb-tab-add]');
      const afterAddTabs = await page.$$eval('.wb-tab', els => els.length);
      assert.equal(afterAddTabs, initialTabs + 1, 'Clicking + New Board should open a new board tab');

      const newTabNodes = await page.$$eval('.wb-node', els => els.length);
      assert.equal(newTabNodes, 3, 'New blank board tab should start with 3 starter nodes');

      // Close the active tab
      await page.click('.wb-tab.active [data-wb-tab-close]');
      const afterCloseTabs = await page.$$eval('.wb-tab', els => els.length);
      assert.equal(afterCloseTabs, initialTabs, 'Closing a board tab should remove it and switch back');

      // 7. Verify capacity metrics and bottleneck analysis
      const qpsText = await page.$eval('#sb-out-rw-qps', el => el.textContent);
      assert.ok(qpsText.includes('/'), 'Read / Write QPS should be calculated and formatted');
    } finally {
      await page.close();
    }
  });
});
