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

  test('T5.5: 5-Pillar Expansion (20 Build Labs, Root-Cause Spoiler Fix & CodeLab Hotfix, 10 Sandbox Blueprints & Rubric Audit, End-of-Lesson Numeric/Tradeoff Drills)', async () => {
    const page = await browser.newPage();
    try {
      // 1. Verify 20 Build Labs in IMPLEMENTATIONS_DATA and GUIDED_LABS_DATA + /projects Explore in CodeLab
      await page.goto(`${server.baseUrl}/projects/`, { waitUntil: 'networkidle2' });
      const repoButtons = await page.$$eval('[data-action="open-repo-codelab"]', els => els.length);
      assert.ok(repoButtons >= 1, 'Projects hub should render Explore in CodeLab buttons');

      await page.goto(`${server.baseUrl}/build/raft-consensus/`, { waitUntil: 'networkidle2' });
      const counts = await page.evaluate(() => ({
        implCount: Object.keys(window.IMPLEMENTATIONS_DATA || {}).length,
        labCount: Object.keys(window.GUIDED_LABS_DATA || {}).length
      }));
      assert.equal(counts.implCount, 20, 'Should have 20 Build Labs in IMPLEMENTATIONS_DATA');
      assert.equal(counts.labCount, 20, 'Should have 20 Guided Labs in GUIDED_LABS_DATA');

      // 2. Verify Challenge root-cause starts unselected (no spoiler) and has CodeLab Hotfix button
      await page.goto(`${server.baseUrl}/challenges/retry-storm-meltdown/`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.incident-room', { timeout: 5000 });
      const challengeCheck = await page.evaluate(() => ({
        selectedRootCause: window.ChallengesController._selectedRootCauseId,
        hasHotfixBtn: !!document.querySelector('[data-action="open-challenge-codelab"]')
      }));
      assert.equal(challengeCheck.selectedRootCause, null, 'Root cause must start unselected (null) so diagnosis is not spoiled');
      assert.equal(challengeCheck.hasHotfixBtn, true, 'Challenge workspace should render Open Hotfix in CodeLab button');

      // 3. Verify ?blueprint=uber-geo-dispatch auto-loads in /sandbox + Architecture Rubric Audit + 10 blueprints
      await page.goto(`${server.baseUrl}/sandbox/?blueprint=uber-geo-dispatch`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.sandbox-view', { timeout: 5000 });
      const sandboxCheck = await page.evaluate(() => ({
        blueprintCount: (window.WHITEBOARD_DATA && window.WHITEBOARD_DATA.blueprints || []).length,
        activeNodes: document.querySelectorAll('.wb-node').length,
        hasRubricAudit: document.body.textContent.includes('Architecture Rubric Audit')
      }));
      assert.equal(sandboxCheck.blueprintCount, 10, 'WHITEBOARD_DATA should contain 10 reference blueprints');
      assert.ok(sandboxCheck.activeNodes >= 5, 'URL query ?blueprint=uber-geo-dispatch should auto-load blueprint nodes');
      assert.equal(sandboxCheck.hasRubricAudit, true, 'Sandbox inspector should render Architecture Rubric Audit');

      // 4. Verify Lesson page renders Cross-links & Unified Check-Slider (Concept Check + Napkin Math + Trade-Off in one drawer)
      await page.goto(`${server.baseUrl}/topic/circuit-breakers-and-timeouts/`, { waitUntil: 'networkidle2' });
      const lessonCheck = await page.evaluate(() => ({
        hasBuildCard: !!document.querySelector('.lesson-builds'),
        hasChallengeCard: !!document.querySelector('.lesson-challenges'),
        hasRunSnippetBtn: document.querySelectorAll('[data-action="run-snippet-codelab"]').length
      }));
      assert.equal(lessonCheck.hasBuildCard, true, 'circuit-breakers-and-timeouts should link to Circuit Breaker Build Lab');
      assert.equal(lessonCheck.hasChallengeCard, true, 'circuit-breakers-and-timeouts should link to related Incident Challenges');

      await page.goto(`${server.baseUrl}/topic/requirements-clarification/`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.check-slider', { timeout: 5000 });
      const sliderCheck = await page.evaluate(() => ({
        sliderCount: document.querySelectorAll('.check-slider').length,
        slideCount: document.querySelectorAll('.check-slider__slide').length,
        hasNumericSlide: !!document.querySelector('.check-slider__slide[data-type="numeric"]'),
        hasTradeoffSlide: !!document.querySelector('.check-slider__slide[data-type="tradeoff"]'),
        hasModeTabs: document.querySelectorAll('.check-slider__tab').length
      }));
      assert.equal(sliderCheck.sliderCount, 1, 'Lesson should render a single unified .check-slider drawer');
      assert.equal(sliderCheck.slideCount, 5, 'Unified .check-slider should contain 3 concept MCQs + 1 Napkin Math + 1 Trade-Off slide');
      assert.equal(sliderCheck.hasNumericSlide, true, 'Unified .check-slider should include numeric Napkin Math slide');
      assert.equal(sliderCheck.hasTradeoffSlide, true, 'Unified .check-slider should include tradeoff Staff Matrix slide');
      assert.equal(sliderCheck.hasModeTabs, 3, 'Header should render 3 category jump tabs (Concept, Napkin Math, Trade-Off)');

      // Jump directly to Napkin Math slide via header tab and submit estimate
      await page.click('.check-slider__tab[data-tab-type="numeric"]');
      await page.type('.check-slider__slide[data-type="numeric"] .quiz-number-input', '20');
      await page.click('.check-slider__slide[data-type="numeric"] .quiz-submit-btn');
      const numericFeedback = await page.$eval('.check-slider__slide[data-type="numeric"] .check-slider__feedback', el => el.textContent);
      assert.ok(numericFeedback.includes('Correct!'), 'Submitting 20 GB/day in Napkin Math slide should grade as Correct');
    } finally {
      await page.close();
    }
  });

  test('T5.6: Reference & Capacity Toolkit (Live Napkin-Math Calculator, 1ns=1s Latency Explorer, Trade-Off Matrix & Universal Search)', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/dashboard`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.dashboard-view', { timeout: 10000 });

      // Switch to Reference & Capacity Toolkit tab
      await page.click('.view-tab[data-dash-tab="toolkit"]');
      await page.waitForSelector('.dashboard-toolkit-wrap', { timeout: 5000 });

      const initialQps = await page.$eval('#cap-peak-qps', el => el.textContent);
      assert.ok(initialQps.includes('Peak QPS'), 'Toolkit should display calculated Peak QPS');

      // Toggle Humanized Latency Scale (1 ns = 1 sec)
      await page.click('[data-latency-scale="human"]');
      const tableText = await page.$eval('.dashboard-toolkit-wrap', el => el.textContent);
      assert.ok(tableText.includes('4.8 years'), 'Humanized latency scale should show 4.8 years for Cross-Continent Packet RTT');

      // Filter Staff Trade-Off Matrix by messaging
      await page.click('[data-matrix-cat="messaging"]');
      const matrixRows = await page.$$eval('.dashboard-toolkit-wrap section:last-child tbody tr', els => els.length);
      assert.equal(matrixRows, 2, 'Messaging filter should show 2 broker trade-off rows (Kafka vs RabbitMQ/SQS)');

      // Verify Universal Search indexes Toolkit and all 20 Build Labs
      const searchHits = await page.evaluate(() => {
        window.Search.buildIndex();
        return {
          toolkitHits: window.Search.search('latency numbers').length,
          raftHits: window.Search.search('raft leader').length
        };
      });
      assert.ok(searchHits.toolkitHits >= 1, 'Universal Search should find Reference & Capacity Toolkit by latency numbers');
      assert.ok(searchHits.raftHits >= 1, 'Universal Search should find Raft build lab / topic');
    } finally {
      await page.close();
    }
  });

  test('T5.7: 100% Question Bank Coverage (200 Topics x 5 Questions = 1,000) & Production Analytics Fingerprinting', async () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const qDir = path.join(SYSTEM_DESIGN_ROOT, 'data', 'questions');
    const qFiles = fs.readdirSync(qDir).filter(f => f.endsWith('.js')).sort();
    const sandboxWin = { QUESTION_BANK: {} };
    for (const f of qFiles) {
      const code = fs.readFileSync(path.join(qDir, f), 'utf8');
      new Function('window', code)(sandboxWin);
    }
    const slugs = Object.keys(sandboxWin.QUESTION_BANK);
    let totalQuestions = 0;
    let withNumeric = 0;
    let withTradeoff = 0;
    for (const s of slugs) {
      const arr = sandboxWin.QUESTION_BANK[s] || [];
      totalQuestions += arr.length;
      if (arr.some(q => q.type === 'numeric')) withNumeric++;
      if (arr.some(q => q.type === 'tradeoff')) withTradeoff++;
    }
    assert.equal(slugs.length, 200, 'QUESTION_BANK across all 18 files should contain all 200 topics');
    assert.equal(totalQuestions, 1000, 'QUESTION_BANK should contain 1,000 total questions (5 per topic)');
    assert.equal(withNumeric, 200, 'Every single one of the 200 topics must have a numeric Napkin Math question');
    assert.equal(withTradeoff, 200, 'Every single one of the 200 topics must have a tradeoff Staff Matrix question');

    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/topic/case-discord-message-storage/`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.check-slider', { timeout: 5000 });

      const audit = await page.evaluate(() => {
        const ctx = window.Analytics && typeof window.Analytics.getUserContext === 'function'
          ? window.Analytics.getUserContext()
          : null;

        return {
          ctx,
          slideCountOnCaseStudy: document.querySelectorAll('.check-slider__slide').length,
          hasNumericSlide: !!document.querySelector('.check-slider__slide[data-type="numeric"]'),
          hasTradeoffSlide: !!document.querySelector('.check-slider__slide[data-type="tradeoff"]')
        };
      });

      assert.equal(audit.slideCountOnCaseStudy, 5, 'Case study topic should render 5 unified slides in Check Yourself drawer');
      assert.equal(audit.hasNumericSlide, true, 'Case study topic should include numeric Napkin Math slide');
      assert.equal(audit.hasTradeoffSlide, true, 'Case study topic should include tradeoff Staff Matrix slide');

      assert.ok(audit.ctx, 'window.Analytics.getUserContext() should return rich user/device profile');
      assert.match(audit.ctx.fingerprint_id, /^fp_[0-9a-f]{16}$/, 'fingerprint_id should be deterministic 64-bit hex hash');
      assert.match(audit.ctx.visitor_id, /^(fp_|usr_)/, 'visitor_id should be persistent user identifier');
      assert.match(audit.ctx.session_id, /^(s_|ses_)/, 'session_id should be session identifier');
      assert.ok(audit.ctx.browser_name, 'browser_name should be detected');
      assert.ok(audit.ctx.os_name, 'os_name should be detected');
    } finally {
      await page.close();
    }
  });
});
