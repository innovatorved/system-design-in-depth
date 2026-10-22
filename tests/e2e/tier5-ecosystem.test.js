const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const {
  SYSTEM_DESIGN_ROOT,
  startStaticServer,
  launchBrowser
} = require('./helpers');

describe('Tier 5: All-in-One Ecosystem Hubs (Roadmap, Challenges, Exams, Dashboard, Sandbox)', () => {
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

  test('T5.3: Timed Mock Exams directory, Exam Runner, Countdown Timer & Multi-Stage Grading', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/exams`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.exams-view', { timeout: 10000 });

      const examCards = await page.$$eval('.exam-card', els => els.length);
      assert.equal(examCards, 4, 'Should render all 4 timed mock exams');

      // Start exam via alias or ID
      await page.evaluate(() => window.App.navigateToExams('staff-faang-45m-mock'));
      await page.waitForSelector('.exam-runner', { timeout: 5000 });

      const timerText = await page.$eval('#exam-countdown-display', el => el.textContent);
      assert.match(timerText, /^\d{2}:\d{2}$/, 'Countdown timer should render in MM:SS format');

      // Fill reference answers & submit for grading
      await page.click('#exam-autofill-btn');
      await page.click('#submit-exam-btn');
      await page.waitForSelector('#exam-grade-report', { timeout: 5000 });

      const reportText = await page.$eval('#exam-grade-report', el => el.textContent);
      assert.ok(reportText.includes('100%') && reportText.includes('PASSED'), 'Reference answers should score 100% and pass');
    } finally {
      await page.close();
    }
  });

  test('T5.4: Learner Dashboard Overview, SRS SM-2 Flashcard Review, and Notes Persistence', async () => {
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

  test('T5.5: Architecture Whiteboard & Capacity Estimator Sandbox', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/sandbox`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.sandbox-view', { timeout: 10000 });

      // Load Twitter Feed blueprint
      await page.click('[data-load-blueprint="twitter-feed"]');
      const nodeCount = await page.$$eval('.wb-node', els => els.length);
      assert.ok(nodeCount >= 5, 'Twitter blueprint should render multiple topology nodes');

      // Add a new component block to canvas
      await page.click('[data-add-block="CDN"]');
      const updatedNodeCount = await page.$$eval('.wb-node', els => els.length);
      assert.equal(updatedNodeCount, nodeCount + 1, 'Clicking a palette block should add a node to the whiteboard');

      // Verify capacity metrics and bottleneck analysis
      const qpsText = await page.$eval('#sb-out-rw-qps', el => el.textContent);
      assert.ok(qpsText.includes('/'), 'Read / Write QPS should be calculated and formatted');
    } finally {
      await page.close();
    }
  });
});
