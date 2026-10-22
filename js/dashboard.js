/**
 * System Design in Depth — Learner Dashboard & Study Hub Controller
 * Handles /dashboard view: Gamification stats, SRS flashcards queue, notes, bookmarks, and export/import.
 */
(function(root) {
  'use strict';

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var DashboardController = {
    _container: null,
    _activeTab: 'overview', // overview | srs | notes | toolkit
    _cardIndex: 0,
    _cardFlipped: false,
    _srsCategoryFilter: 'all',
    _reviewedTodayCount: 0,
    _selectedNoteSlug: 'requirements-clarification',
    _importFeedback: null,
    _abortController: null,
    _latencyScaleMode: 'actual', // actual | humanized
    _matrixCategory: 'all', // all | storage | database | messaging | protocol | coordination
    _capState: {
      dau: 10000000,
      readsPerUser: 40,
      writesPerUser: 5,
      peakMultiplier: 3,
      payloadKb: 2,
      latencyMs: 25,
      retentionYears: 5,
      replicationFactor: 3
    },

    mount: function(container, options) {
      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }
      this._container = container;
      if (!container) return;
      options = options || {};
      var urlTab = null;
      try {
        if (typeof window !== 'undefined' && window.location && window.location.search) {
          urlTab = new URLSearchParams(window.location.search).get('tab');
        }
      } catch (e) {}
      this._activeTab = options.tab || urlTab || 'overview';
      this._cardFlipped = false;
      this._importFeedback = null;

      this.render();
      this._bindEvents();
    },

    unmount: function(container) {
      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }
      if (this._container) {
        this._container.innerHTML = '';
        this._container = null;
      }
    },

    _getDueDeck: function() {
      var allCards = Array.isArray(root.SRS_CARDS_DATA) ? root.SRS_CARDS_DATA : [];
      var cat = this._srsCategoryFilter || 'all';
      var nowIso = new Date().toISOString();
      var prog = root.Progress;

      return allCards.filter(function(c) {
        if (cat !== 'all' && c.category !== cat) return false;
        if (!prog || typeof prog.getSrsState !== 'function') return true;
        var st = prog.getSrsState(c.id);
        if (!st || !st.dueAt) return true;
        return st.dueAt <= nowIso;
      });
    },

    rateCurrentCard: function(quality) {
      var deck = this._getDueDeck();
      if (deck.length === 0) return;
      var idx = this._cardIndex % deck.length;
      var card = deck[idx];
      if (!card || !root.Progress) return;

      var prev = root.Progress.getSrsState(card.id) || { interval: 0, repetition: 0, efactor: 2.5 };
      var interval = prev.interval || 0;
      var repetition = prev.repetition || 0;
      var efactor = prev.efactor || 2.5;

      // SuperMemo SM-2 calculation
      if (quality < 3) {
        repetition = 0;
        interval = 0;
      } else {
        if (repetition === 0) interval = 1;
        else if (repetition === 1) interval = 3;
        else if (quality === 5) interval = Math.max(7, Math.round(interval * efactor * 1.3));
        else interval = Math.round(interval * efactor);
        repetition += 1;
      }

      efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (efactor < 1.3) efactor = 1.3;

      var dueTimeMs = Date.now() + (interval > 0 ? interval * 86400000 : 60000);
      var newState = {
        interval: interval,
        repetition: repetition,
        efactor: Number(efactor.toFixed(2)),
        dueAt: new Date(dueTimeMs).toISOString(),
        lastReviewedAt: new Date().toISOString()
      };

      root.Progress.updateSrs(card.id, newState);
      if (typeof root.Progress.updateStreak === 'function') {
        root.Progress.updateStreak();
      }
      this._reviewedTodayCount += 1;
      this._cardFlipped = false;
      if (interval === 0) {
        this._cardIndex = (this._cardIndex + 1) % Math.max(1, deck.length);
      } else {
        this._cardIndex = 0;
      }
      this.render();
    },

    render: function() {
      if (!this._container) return;

      var prog = root.Progress;
      var xp = prog && prog.getXP ? prog.getXP() : 0;
      var streak = prog && prog.getStreak ? prog.getStreak() : { current: 0, longest: 0 };

      this._container.innerHTML =
        '<div class="view-canvas dashboard-view">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div class="view-header__content">' +
                '<div class="view-badge-row">' +
                  '<span class="eco-pill eco-pill--accent">' + xp + ' Total XP</span>' +
                  '<span class="eco-pill">' + (streak.current || 0) + ' Day Streak</span>' +
                '</div>' +
                '<h1 class="view-title">Learner Dashboard &amp; Study Hub</h1>' +
                '<p class="view-subtitle">Track your mastery streak, review SuperMemo SM-2 spaced-repetition flashcards, and manage study notes.</p>' +
              '</div>' +
              '<div class="view-tabs" role="tablist">' +
                '<button class="view-tab ' + (this._activeTab === 'overview' ? 'active' : '') + '" data-dash-tab="overview" role="tab" aria-selected="' + (this._activeTab === 'overview') + '">Overview &amp; XP</button>' +
                '<button class="view-tab ' + (this._activeTab === 'srs' ? 'active' : '') + '" data-dash-tab="srs" role="tab" aria-selected="' + (this._activeTab === 'srs') + '">SRS Flashcards</button>' +
                '<button class="view-tab ' + (this._activeTab === 'toolkit' ? 'active' : '') + '" data-dash-tab="toolkit" role="tab" aria-selected="' + (this._activeTab === 'toolkit') + '">Reference &amp; Capacity Toolkit</button>' +
                '<button class="view-tab ' + (this._activeTab === 'notes' ? 'active' : '') + '" data-dash-tab="notes" role="tab" aria-selected="' + (this._activeTab === 'notes') + '">Notes &amp; Bookmarks</button>' +
              '</div>' +
            '</div>' +
          '</header>' +
          '<main class="view-body" id="dashboard-mount-target">' +
            this._renderTabBody() +
          '</main>' +
        '</div>';
    },

    _renderTabBody: function() {
      if (this._activeTab === 'srs') return this._renderSrsTab();
      if (this._activeTab === 'toolkit') return this._renderToolkitTab();
      if (this._activeTab === 'notes') return this._renderNotesTab();
      return this._renderOverviewTab();
    },

    _renderOverviewTab: function() {
      var prog = root.Progress;
      var xp = prog && prog.getXP ? prog.getXP() : 0;
      var streak = prog && prog.getStreak ? prog.getStreak() : { current: 0, longest: 0 };
      var timeSpent = prog && prog.getTimeSpent ? prog.getTimeSpent() : { formatted: '0m' };
      var completedCount = prog && prog.getCompletedCount ? prog.getCompletedCount() : 0;
      var totalUnits = prog && prog.getTotalUnits ? prog.getTotalUnits() : 200;
      var pct = prog && prog.getPercentage ? prog.getPercentage() : 0;
      var deck = this._getDueDeck();

      var challenges = (root.CHALLENGES_DATA && Array.isArray(root.CHALLENGES_DATA.challenges))
        ? root.CHALLENGES_DATA.challenges
        : (Array.isArray(root.CHALLENGES_DATA) ? root.CHALLENGES_DATA : []);
      var solvedChallenges = challenges.filter(function(c) {
        return prog && prog.isCompleted && (prog.isCompleted('challenge:' + c.id) || prog.isCompleted(c.id));
      }).length;

      var blueprints = (root.WHITEBOARD_DATA && Array.isArray(root.WHITEBOARD_DATA.blueprints))
        ? root.WHITEBOARD_DATA.blueprints
        : (Array.isArray(root.WHITEBOARD_BLUEPRINTS) ? root.WHITEBOARD_BLUEPRINTS : []);
      var blueprintCount = blueprints.length || 10;

      var buildSlugs = root.IMPLEMENTATIONS_DATA ? Object.keys(root.IMPLEMENTATIONS_DATA) : [];
      var totalBuilds = buildSlugs.length || 20;
      var completedBuilds = buildSlugs.filter(function(slug) {
        if (!prog) return false;
        if (prog.getBuildProgress) {
          var bp = prog.getBuildProgress(slug);
          if (bp && bp.completed) return true;
        }
        return prog.isCompleted && (prog.isCompleted('build:' + slug) || prog.isCompleted(slug));
      }).length;

      var paths = (root.ROADMAP_DATA && (root.ROADMAP_DATA.careerPaths || root.ROADMAP_DATA.paths)) || [];
      var pathsHtml = paths.map(function(p) {
        var steps = p.steps || [];
        var done = 0;
        steps.forEach(function(s) {
          if (prog && prog.isCompleted && (prog.isCompleted(s.slug || s.id) || prog.isCompleted('challenge:' + s.id) || prog.isCompleted('sandbox:' + s.id) || prog.isCompleted('build:' + s.slug))) {
            done++;
          }
        });
        var pPct = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;
        return (
          '<div class="dash-path-row">' +
            '<div class="dash-path-info">' +
              '<strong>' + escapeHtml(p.title) + '</strong>' +
              '<span>' + done + ' / ' + steps.length + ' steps (' + pPct + '%)</span>' +
            '</div>' +
            '<div class="eco-progress-bar"><div class="eco-progress-fill" style="width:' + pPct + '%"></div></div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="dashboard-overview-grid">' +
          '<div class="eco-grid eco-grid--4 dash-kpi-row">' +
            '<div class="eco-card dash-kpi-card">' +
              '<span class="kpi-label">Active Streak</span>' +
              '<strong class="kpi-val" id="dash-streak-val">' + (streak.current || 0) + ' Days</strong>' +
              '<span class="kpi-sub">Longest: ' + (streak.longest || 0) + ' days</span>' +
            '</div>' +
            '<div class="eco-card dash-kpi-card">' +
              '<span class="kpi-label">Experience Points</span>' +
              '<strong class="kpi-val" id="dash-xp-val">' + xp.toLocaleString() + ' XP</strong>' +
              '<span class="kpi-sub">' + completedBuilds + '/' + totalBuilds + ' Build Labs Completed</span>' +
            '</div>' +
            '<div class="eco-card dash-kpi-card">' +
              '<span class="kpi-label">Curriculum Mastery</span>' +
              '<strong class="kpi-val" id="dash-completion-val">' + pct + '%</strong>' +
              '<span class="kpi-sub">' + completedCount + ' of ' + totalUnits + ' items completed</span>' +
            '</div>' +
            '<div class="eco-card dash-kpi-card">' +
              '<span class="kpi-label">Total Study Time</span>' +
              '<strong class="kpi-val" id="dash-time-val">' + escapeHtml(timeSpent.formatted || '0m') + '</strong>' +
              '<span class="kpi-sub">' + solvedChallenges + '/12 Challenges · ' + blueprintCount + ' Blueprints</span>' +
            '</div>' +
          '</div>' +

          '<div class="eco-grid eco-grid--2" style="margin-top:24px;">' +
            '<section class="eco-card">' +
              '<h2 class="eco-card__title">Career Path Progress</h2>' +
              '<p class="eco-card__desc">Your real-time completion across the 5 role-based engineering tracks.</p>' +
              '<div class="dash-paths-stack">' + pathsHtml + '</div>' +
              '<div style="margin-top:16px;">' +
                '<button class="eco-btn eco-btn--sm" data-dash-nav="roadmap">Explore Full Visual Roadmap →</button>' +
              '</div>' +
            '</section>' +
            '<section class="eco-card">' +
              '<h2 class="eco-card__title">Recommended Next Actions</h2>' +
              '<p class="eco-card__desc">High-impact engineering exercises queued for your current mastery level.</p>' +
              '<div class="recommended-actions-list">' +
                '<div class="rec-action-item">' +
                  '<div><strong>Spaced Repetition Queue</strong><p>' + deck.length + ' flashcards ready for active recall review.</p></div>' +
                  '<button class="eco-btn eco-btn--sm eco-btn--primary" data-dash-tab="srs">Review Cards →</button>' +
                '</div>' +
                '<div class="rec-action-item">' +
                  '<div><strong>Reference &amp; Capacity Toolkit</strong><p>Interactive Napkin-Math Calculator, Hardware Latency Numbers &amp; Trade-Off Matrix.</p></div>' +
                  '<button class="eco-btn eco-btn--sm" data-dash-tab="toolkit">Open Toolkit →</button>' +
                '</div>' +
                '<div class="rec-action-item">' +
                  '<div><strong>Incident Troubleshooting Simulators</strong><p>' + (12 - solvedChallenges) + ' production outage scenarios with CodeLab hotfixes.</p></div>' +
                  '<button class="eco-btn eco-btn--sm" data-dash-nav="challenges">Open Challenges →</button>' +
                '</div>' +
                '<div class="rec-action-item">' +
                  '<div><strong>Interactive Architecture Sandbox</strong><p>Model multi-tab system topologies across ' + blueprintCount + ' blueprints &amp; run live rubric audits.</p></div>' +
                  '<button class="eco-btn eco-btn--sm" data-dash-nav="sandbox">Launch Sandbox →</button>' +
                '</div>' +
              '</div>' +
            '</section>' +
          '</div>' +
        '</div>'
      );
    },

    _renderSrsTab: function() {
      var allCards = Array.isArray(root.SRS_CARDS_DATA) ? root.SRS_CARDS_DATA : [];
      var deck = this._getDueDeck();

      var categories = ['all'];
      var seenCat = {};
      allCards.forEach(function(c) {
        if (c.category && !seenCat[c.category]) {
          seenCat[c.category] = true;
          categories.push(c.category);
        }
      });

      var self = this;
      var catOptions = categories.map(function(cat) {
        return '<option value="' + escapeHtml(cat) + '" ' + (self._srsCategoryFilter === cat ? 'selected' : '') + '>' +
          (cat === 'all' ? 'All Categories (' + allCards.length + ' cards)' : escapeHtml(cat)) +
        '</option>';
      }).join('');

      if (deck.length === 0) {
        return (
          '<div class="srs-empty-state eco-card">' +
            '<h2>All Due Flashcards Reviewed</h2>' +
            '<p>You have completed all due cards in this category for today.</p>' +
            '<button class="eco-btn eco-btn--primary" data-srs-reset-filter="true">Show All Categories</button>' +
          '</div>'
        );
      }

      var idx = this._cardIndex % deck.length;
      var card = deck[idx];

      return (
        '<div class="srs-review-container">' +
          '<div class="eco-controls-bar">' +
            '<div class="srs-stats-row">' +
              '<span class="eco-pill eco-pill--accent">Due Queue: ' + deck.length + ' cards</span>' +
              '<span class="eco-pill">Reviewed This Session: ' + this._reviewedTodayCount + '</span>' +
              '<span class="eco-pill">Card ' + (idx + 1) + ' of ' + deck.length + '</span>' +
            '</div>' +
            '<select class="knob-select" id="srs-category-select" style="max-width:320px;">' + catOptions + '</select>' +
          '</div>' +

          '<div class="srs-flashcard ' + (this._cardFlipped ? 'is-flipped' : '') + '" id="srs-active-card" data-card-id="' + escapeHtml(card.id) + '">' +
            '<div class="srs-flashcard__meta">' +
              '<span class="eco-pill">' + escapeHtml(card.category || 'System Design') + '</span>' +
              '<span class="eco-pill">' + escapeHtml(card.unitTitle || card.topicSlug || '') + '</span>' +
              '<span class="eco-pill">' + escapeHtml((card.type || 'concept').toUpperCase()) + '</span>' +
            '</div>' +
            '<div class="srs-flashcard__prompt">' +
              '<div class="card-side-label">QUESTION / PROMPT</div>' +
              '<h3>' + escapeHtml(card.prompt) + '</h3>' +
            '</div>' +
            (this._cardFlipped ? (
              '<div class="srs-flashcard__answer" id="srs-card-answer">' +
                '<div class="card-side-label">ARCHITECTURAL ANSWER</div>' +
                '<p>' + escapeHtml(card.answer) + '</p>' +
              '</div>'
            ) : (
              '<div class="srs-flashcard__flip-cta">' +
                '<button class="eco-btn eco-btn--primary eco-btn--lg" id="srs-flip-btn" data-srs-flip="true">Reveal Answer (Space / Click)</button>' +
              '</div>'
            )) +
          '</div>' +

          (this._cardFlipped ? (
            '<div class="srs-rating-bar" id="srs-rating-controls">' +
              '<span class="rating-prompt">Rate recall difficulty (SuperMemo SM-2):</span>' +
              '<div class="srs-rating-buttons">' +
                '<button class="eco-btn srs-btn--again" data-srs-rate="1">Again (1m)</button>' +
                '<button class="eco-btn srs-btn--hard" data-srs-rate="3">Hard (1d)</button>' +
                '<button class="eco-btn srs-btn--good" data-srs-rate="4">Good (3d)</button>' +
                '<button class="eco-btn eco-btn--primary srs-btn--easy" data-srs-rate="5">Easy (7d+)</button>' +
              '</div>' +
            '</div>'
          ) : '') +
        '</div>'
      );
    },

    _renderNotesTab: function() {
      var prog = root.Progress;
      var bookmarks = (prog && prog.getBookmarks) ? prog.getBookmarks() : [];
      var currentNote = (prog && prog.getNote) ? prog.getNote(this._selectedNoteSlug) : '';

      var units = [];
      if (root.CURRICULUM_DATA && root.CURRICULUM_DATA.parts) {
        root.CURRICULUM_DATA.parts.forEach(function(p) {
          (p.modules || []).forEach(function(m) {
            (m.units || []).forEach(function(u) {
              units.push({ slug: u.slug, title: u.title });
            });
          });
        });
      }
      if (units.length === 0) {
        units = [
          { slug: 'requirements-clarification', title: 'Requirements Clarification' },
          { slug: 'back-of-the-envelope-capacity-planning', title: 'Back-of-the-Envelope Capacity Planning' },
          { slug: 'consensus', title: 'Raft & Paxos Consensus' }
        ];
      }

      var self = this;
      var unitOptions = units.slice(0, 60).map(function(u) {
        return '<option value="' + escapeHtml(u.slug) + '" ' + (self._selectedNoteSlug === u.slug ? 'selected' : '') + '>' + escapeHtml(u.title) + '</option>';
      }).join('');

      var bookmarksHtml = bookmarks.length > 0 ? bookmarks.map(function(slug) {
        return (
          '<div class="bookmark-item" data-bookmark-item="' + escapeHtml(slug) + '">' +
            '<a href="/topic/' + escapeHtml(slug) + '/" class="bookmark-link" data-open-topic="' + escapeHtml(slug) + '">' + escapeHtml(slug.replace(/-/g, ' ')) + '</a>' +
            '<button class="eco-btn eco-btn--sm" data-remove-bookmark="' + escapeHtml(slug) + '">Remove</button>' +
          '</div>'
        );
      }).join('') : '<p class="eco-muted">No bookmarked topics yet. Bookmark any topic or use Quick Bookmark below.</p>';

      var exportedJson = (prog && prog.exportData) ? prog.exportData() : '{}';

      return (
        '<div class="eco-grid eco-grid--2 dashboard-notes-grid">' +
          '<section class="eco-card">' +
            '<h2 class="eco-card__title">Personal Study Notes</h2>' +
            '<p class="eco-card__desc">Write persistent Markdown study notes linked to any curriculum topic.</p>' +
            '<div class="notes-selector-row">' +
              '<label for="dash-note-topic-select">Topic:</label>' +
              '<select class="knob-select" id="dash-note-topic-select">' + unitOptions + '</select>' +
              '<button class="eco-btn eco-btn--sm" id="dash-toggle-bookmark-btn" data-bookmark-slug="' + escapeHtml(this._selectedNoteSlug) + '">' +
                (prog && prog.isBookmarked && prog.isBookmarked(this._selectedNoteSlug) ? '★ Bookmarked' : '☆ Bookmark Topic') +
              '</button>' +
            '</div>' +
            '<textarea class="eco-textarea" id="dash-note-textarea" rows="7" placeholder="Write architectural notes, invariants, or trade-offs for this topic…">' + escapeHtml(currentNote) + '</textarea>' +
            '<div class="notes-actions-row">' +
              '<button class="eco-btn eco-btn--primary" id="dash-save-note-btn" data-save-note="true">Save Note</button>' +
              '<span class="notes-save-status" id="dash-note-status">Saved to localStorage</span>' +
            '</div>' +

            '<h3 class="eco-card__title" style="margin-top:24px;">Bookmarked Topics (' + bookmarks.length + ')</h3>' +
            '<div class="bookmarks-list" id="dash-bookmarks-list">' + bookmarksHtml + '</div>' +
          '</section>' +

          '<section class="eco-card">' +
            '<h2 class="eco-card__title">Data Portability (JSON Export / Import)</h2>' +
            '<p class="eco-card__desc">Back up your entire learning state (completed units, XP, SRS schedule, streak, and notes) or restore from a JSON snapshot.</p>' +
            (this._importFeedback ? (
              '<div class="exam-field-feedback ' + (this._importFeedback.success ? 'fb--correct' : 'fb--wrong') + '" id="dash-import-feedback">' +
                escapeHtml(this._importFeedback.message) +
              '</div>'
            ) : '') +
            '<textarea class="eco-textarea" id="dash-portability-json" rows="9">' + escapeHtml(exportedJson) + '</textarea>' +
            '<div class="notes-actions-row">' +
              '<button class="eco-btn" id="dash-export-btn" data-portability-action="export">Refresh Export JSON</button>' +
              '<button class="eco-btn eco-btn--primary" id="dash-import-btn" data-portability-action="import">Import &amp; Restore JSON</button>' +
            '</div>' +
          '</section>' +
        '</div>'
      );
    },

    _renderToolkitTab: function() {
      var cap = this._capState || {
        dau: 10000000,
        readsPerUser: 40,
        writesPerUser: 5,
        peakMultiplier: 3,
        payloadKb: 4,
        latencyMs: 25,
        retentionYears: 5,
        replicationFactor: 3
      };

      var avgReadQps = Math.round((cap.dau * cap.readsPerUser) / 86400);
      var peakReadQps = Math.round(avgReadQps * cap.peakMultiplier);
      var avgWriteQps = Math.round((cap.dau * cap.writesPerUser) / 86400);
      var peakWriteQps = Math.round(avgWriteQps * cap.peakMultiplier);
      var totalPeakQps = peakReadQps + peakWriteQps;
      var littlesLawConcurrency = Math.max(1, Math.round(totalPeakQps * (cap.latencyMs / 1000)));
      var readBwMbps = ((peakReadQps * cap.payloadKb * 8) / 1000).toFixed(1);
      var writeBwMbps = ((peakWriteQps * cap.payloadKb * 8) / 1000).toFixed(1);
      var dailyNewStorageGb = ((cap.dau * cap.writesPerUser * cap.payloadKb) / (1024 * 1024)).toFixed(1);
      var totalStorageTb = ((parseFloat(dailyNewStorageGb) * 365 * cap.retentionYears * cap.replicationFactor) / 1024).toFixed(2);
      var hotCacheGb = Math.max(1, Math.round(parseFloat(dailyNewStorageGb) * 30 * 0.2));
      var redisShards = Math.max(1, Math.ceil(hotCacheGb / 64));

      var latencyItems = [
        { op: 'L1 Cache Reference', ns: 1, real: '1 ns', human: '1 sec', category: 'CPU / RAM', note: 'Register & L1 SRAM hit inside CPU core' },
        { op: 'Branch Mispredict', ns: 3, real: '3 ns', human: '3 sec', category: 'CPU / RAM', note: 'Instruction pipeline flush penalty' },
        { op: 'L2 Cache Reference', ns: 4, real: '4 ns', human: '4 sec', category: 'CPU / RAM', note: 'Core-local L2 SRAM cache access' },
        { op: 'Mutex Lock / Unlock', ns: 17, real: '17 ns', human: '17 sec', category: 'CPU / RAM', note: 'Uncontended atomic CAS instruction' },
        { op: 'Main Memory (DRAM) Reference', ns: 100, real: '100 ns', human: '1 min 40 sec', category: 'CPU / RAM', note: 'Pointer chase / Redis in-memory lookup core cost' },
        { op: 'Compress 1 KB with Snappy/LZ4', ns: 2000, real: '2 µs', human: '33 min', category: 'Compute', note: 'Fast wire compression before network/disk write' },
        { op: 'SSD Random Read (4 KB NVMe)', ns: 16000, real: '16 µs', human: '4.4 hours', category: 'Storage', note: 'B-Tree / LSM SSTable page read from NVMe' },
        { op: 'Read 1 MB Sequentially from Memory', ns: 64000, real: '64 µs', human: '18 hours', category: 'CPU / RAM', note: 'Sequential columnar scan in RAM' },
        { op: 'Same-Zone Datacenter Round Trip (RTT)', ns: 500000, real: '0.5 ms', human: '5.8 days', category: 'Network', note: 'Single RPC hop inside an availability zone' },
        { op: 'Read 1 MB Sequentially from NVMe SSD', ns: 1000000, real: '1 ms', human: '11.6 days', category: 'Storage', note: 'Sequential WAL / Kafka segment read' },
        { op: 'Cross-AZ Synchronous Replication RTT', ns: 2000000, real: '2 ms', human: '23 days', category: 'Network', note: 'Raft / Quorum commit cost across 3 AZs' },
        { op: 'HDD Disk Seek / Rotational Latency', ns: 5000000, real: '5 ms', human: '2 months', category: 'Storage', note: 'Why random I/O on spinning disks kills P99' },
        { op: 'Cross-Continent Packet RTT (US ↔ EU)', ns: 150000000, real: '150 ms', human: '4.8 years', category: 'Network', note: 'Speed-of-light in fiber limit; requires Edge CDN / Geo-Replicas' }
      ];

      var isHumanScale = this._latencyScaleMode === 'human';
      var latencyRowsHtml = latencyItems.map(function(item) {
        var logPct = Math.min(100, Math.max(6, Math.round((Math.log10(item.ns + 1) / Math.log10(150000000)) * 100)));
        return (
          '<tr>' +
            '<td><strong>' + escapeHtml(item.op) + '</strong></td>' +
            '<td><span class="eco-pill">' + escapeHtml(item.category) + '</span></td>' +
            '<td style="font-family:var(--font-mono);font-weight:600;color:var(--c-accent);">' + escapeHtml(isHumanScale ? item.human : item.real) + '</td>' +
            '<td style="min-width:140px;">' +
              '<div style="background:var(--c-bg-alt);border-radius:4px;height:8px;overflow:hidden;">' +
                '<div style="width:' + logPct + '%;height:100%;background:var(--c-accent);"></div>' +
              '</div>' +
            '</td>' +
            '<td class="eco-muted" style="font-size:0.82rem;">' + escapeHtml(item.note) + '</td>' +
          '</tr>'
        );
      }).join('');

      var matrixRows = [
        { cat: 'storage', name: 'B-Tree (PostgreSQL / InnoDB)', write: 'O(log N) random in-place page rewrite + WAL', read: 'Fast O(log N) point & range queries', bestFor: 'OLTP read-heavy workloads, strict ACID transactions', watchOut: 'Write amplification & page fragmentation on random UUID keys', slug: 'b-trees-vs-lsm-trees', buildId: 'wal-crash-recovery' },
        { cat: 'storage', name: 'LSM-Tree (RocksDB / Cassandra)', write: 'Fast O(1) append to MemTable + sequential SSTable flush', read: 'Checks MemTable + multiple SSTables (needs Bloom filter)', bestFor: 'High-ingest write streams, time-series, event logs', watchOut: 'Compaction CPU/IO spikes causing P99 latency stalls', slug: 'b-trees-vs-lsm-trees', buildId: 'lsm-tree' },
        { cat: 'database', name: 'Leader-Follower (Single Leader)', write: 'All writes routed to single leader node', read: 'Scale reads across N async replicas', bestFor: 'Read-heavy CRUD apps requiring monotonic leader writes', watchOut: 'Replication lag (stale reads) & failover split-brain', slug: 'replication-strategies', buildId: 'raft-consensus' },
        { cat: 'database', name: 'Leaderless Dynamo Quorum (R+W>N)', write: 'Parallel writes to W of N nodes (sloppy quorum + hinted handoff)', read: 'Parallel reads from R nodes + read repair / anti-entropy', bestFor: 'Always-writable high-availability key-value stores', watchOut: 'Concurrent write conflicts require Vector Clocks or LWW', slug: 'quorums-read-write', buildId: 'vector-clocks' },
        { cat: 'messaging', name: 'Log Broker (Apache Kafka / Redpanda)', write: 'Sequential partition append; O(1) throughput', read: 'Consumer groups track offsets; full replayability', bestFor: 'Event sourcing, CDC pipelines, multi-consumer stream processing', watchOut: 'Max parallelism inside a consumer group is capped by partition count', slug: 'log-based-brokers', buildId: 'mini-kafka-log' },
        { cat: 'messaging', name: 'Queue Broker (RabbitMQ / SQS)', write: 'Per-message routing via exchanges & queues', read: 'Competing workers ACK individual messages + DLQ', bestFor: 'Task queues, variable-duration background jobs, per-msg retries', watchOut: 'No log replay once ACKed; memory pressure when queues back up', slug: 'message-queues-vs-event-streams', buildId: 'outbox-cdc-relay' },
        { cat: 'protocol', name: 'gRPC (HTTP/2 + Protobuf)', write: 'Binary framing, multiplexed streams, strict schema codegen', read: 'Low CPU serialization overhead; bidirectional streaming', bestFor: 'Internal microservice-to-microservice East-West RPC', watchOut: 'Needs gRPC-Web proxy for browsers; harder human curl debugging', slug: 'rest-vs-graphql-vs-grpc', buildId: 'circuit-breaker' },
        { cat: 'protocol', name: 'WebSockets vs Server-Sent Events (SSE)', write: 'WS: Full-duplex TCP frame; SSE: HTTP unidirectional stream', read: 'Sub-10ms server push without polling overhead', bestFor: 'WS: Chat/collaborative editing; SSE: AI token streaming & live tickers', watchOut: 'Stateful L7 connections require sticky load balancing & pub/sub backplane', slug: 'websockets-vs-sse-vs-long-polling', buildId: 'realtime-collab-ot' },
        { cat: 'coordination', name: 'Token Bucket vs Sliding Window Counter', write: 'O(1) atomic Redis Lua evaluation per request', read: 'Immediate allow/reject with Retry-After headers', bestFor: 'API Gateway burst tolerance (Token Bucket) vs strict quota enforcement', watchOut: 'Fixed windows allow 2x boundary bursts; distributed sync needs atomic Lua', slug: 'rate-limiting-algorithms', buildId: 'token-bucket' },
        { cat: 'coordination', name: 'Singleflight & Cache Stampede Lock', write: 'Coalesces N concurrent cache-miss callers into 1 DB query', read: 'Shares single in-flight Promise/Future across all waiters', bestFor: 'Hot keys (celebrity profiles, flash sales) on cache expiration', watchOut: 'If underlying DB call hangs without timeout, all coalesced callers block', slug: 'singleflight-and-request-coalescing', buildId: 'singleflight-coalescer' }
      ];

      var activeCat = this._matrixCategory || 'all';
      var filteredMatrix = matrixRows.filter(function(r) {
        return activeCat === 'all' || r.cat === activeCat;
      });

      var matrixHtml = filteredMatrix.map(function(r) {
        return (
          '<tr>' +
            '<td><strong>' + escapeHtml(r.name) + '</strong><br><span class="eco-pill" style="margin-top:4px;display:inline-block;">' + escapeHtml(r.cat.toUpperCase()) + '</span></td>' +
            '<td style="font-size:0.84rem;">' + escapeHtml(r.write) + '</td>' +
            '<td style="font-size:0.84rem;">' + escapeHtml(r.read) + '</td>' +
            '<td style="font-size:0.84rem;">' + escapeHtml(r.bestFor) + '</td>' +
            '<td style="font-size:0.84rem;color:var(--c-text-muted);">' + escapeHtml(r.watchOut) + '</td>' +
            '<td style="white-space:nowrap;">' +
              '<button class="eco-btn eco-btn--sm" data-open-topic="' + escapeHtml(r.slug) + '">Topic →</button> ' +
              '<button class="eco-btn eco-btn--sm eco-btn--primary" data-open-build="' + escapeHtml(r.buildId) + '">CodeLab →</button>' +
            '</td>' +
          '</tr>'
        );
      }).join('');

      return (
        '<div class="dashboard-toolkit-wrap">' +
          '<section class="eco-card" style="margin-bottom:24px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">' +
              '<div>' +
                '<h2 class="eco-card__title">Interactive Back-of-the-Envelope Capacity &amp; Cost Estimator</h2>' +
                '<p class="eco-card__desc">Adjust workload parameters to compute real-time QPS, Little\'s Law concurrency, network bandwidth, 5-year storage with replication, and Redis cache shards.</p>' +
              '</div>' +
              '<button class="eco-btn eco-btn--primary" data-action="open-capacity-codelab">⚡ Run Capacity Model in CodeLab</button>' +
            '</div>' +

            '<div class="eco-grid eco-grid--4" style="gap:12px;margin-bottom:20px;">' +
              '<label class="cap-input-group"><span class="kpi-label">Daily Active Users (DAU)</span><input type="number" class="knob-select" data-cap-field="dau" value="' + cap.dau + '" min="1000" step="100000"></label>' +
              '<label class="cap-input-group"><span class="kpi-label">Reads / User / Day</span><input type="number" class="knob-select" data-cap-field="readsPerUser" value="' + cap.readsPerUser + '" min="1" step="5"></label>' +
              '<label class="cap-input-group"><span class="kpi-label">Writes / User / Day</span><input type="number" class="knob-select" data-cap-field="writesPerUser" value="' + cap.writesPerUser + '" min="1" step="1"></label>' +
              '<label class="cap-input-group"><span class="kpi-label">Peak Traffic Multiplier</span><input type="number" class="knob-select" data-cap-field="peakMultiplier" value="' + cap.peakMultiplier + '" min="1" max="20" step="0.5"></label>' +
              '<label class="cap-input-group"><span class="kpi-label">Avg Payload Size (KB)</span><input type="number" class="knob-select" data-cap-field="payloadKb" value="' + cap.payloadKb + '" min="1" step="1"></label>' +
              '<label class="cap-input-group"><span class="kpi-label">Avg Service Latency (ms)</span><input type="number" class="knob-select" data-cap-field="latencyMs" value="' + cap.latencyMs + '" min="1" step="5"></label>' +
              '<label class="cap-input-group"><span class="kpi-label">Retention Period (Years)</span><input type="number" class="knob-select" data-cap-field="retentionYears" value="' + cap.retentionYears + '" min="1" max="20"></label>' +
              '<label class="cap-input-group"><span class="kpi-label">Replication Factor (N)</span><input type="number" class="knob-select" data-cap-field="replicationFactor" value="' + cap.replicationFactor + '" min="1" max="7"></label>' +
            '</div>' +

            '<div class="eco-grid eco-grid--4" id="dash-cap-results">' +
              '<div class="eco-card dash-kpi-card">' +
                '<span class="kpi-label">Read &amp; Write QPS</span>' +
                '<strong class="kpi-val" id="cap-peak-qps">' + totalPeakQps.toLocaleString() + ' Peak QPS</strong>' +
                '<span class="kpi-sub">Avg: ' + avgReadQps.toLocaleString() + ' R/s · ' + avgWriteQps.toLocaleString() + ' W/s</span>' +
              '</div>' +
              '<div class="eco-card dash-kpi-card">' +
                '<span class="kpi-label">Little\'s Law Concurrency (L = λW)</span>' +
                '<strong class="kpi-val" id="cap-concurrency">' + littlesLawConcurrency.toLocaleString() + ' In-Flight</strong>' +
                '<span class="kpi-sub">At ' + cap.latencyMs + 'ms latency &amp; ' + totalPeakQps.toLocaleString() + ' req/s</span>' +
              '</div>' +
              '<div class="eco-card dash-kpi-card">' +
                '<span class="kpi-label">Peak Network Bandwidth</span>' +
                '<strong class="kpi-val" id="cap-bandwidth">' + readBwMbps + ' Mbps Egress</strong>' +
                '<span class="kpi-sub">Ingress: ' + writeBwMbps + ' Mbps (' + cap.payloadKb + ' KB payload)</span>' +
              '</div>' +
              '<div class="eco-card dash-kpi-card">' +
                '<span class="kpi-label">Storage &amp; 20% Hot Cache</span>' +
                '<strong class="kpi-val" id="cap-storage">' + totalStorageTb + ' TB (' + cap.retentionYears + 'y)</strong>' +
                '<span class="kpi-sub">Hot Cache: ~' + hotCacheGb + ' GB (' + redisShards + ' Redis shards)</span>' +
              '</div>' +
            '</div>' +
          '</section>' +

          '<section class="eco-card" style="margin-bottom:24px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">' +
              '<div>' +
                '<h2 class="eco-card__title">Latency Numbers Every Architect Should Know</h2>' +
                '<p class="eco-card__desc">Compare raw hardware timings against humanized time scales (if 1 ns = 1 second, a US↔EU packet takes 4.8 years).</p>' +
              '</div>' +
              '<div style="display:flex;gap:8px;">' +
                '<button class="eco-btn eco-btn--sm ' + (!isHumanScale ? 'eco-btn--primary' : '') + '" data-latency-scale="real">Actual Hardware (ns / ms)</button>' +
                '<button class="eco-btn eco-btn--sm ' + (isHumanScale ? 'eco-btn--primary' : '') + '" data-latency-scale="human">Humanized Scale (1 ns = 1 sec)</button>' +
              '</div>' +
            '</div>' +
            '<div style="overflow-x:auto;">' +
              '<table class="eco-table" style="width:100%;border-collapse:collapse;">' +
                '<thead><tr style="text-align:left;border-bottom:1px solid var(--c-border);">' +
                  '<th style="padding:8px;">Operation</th>' +
                  '<th style="padding:8px;">Layer</th>' +
                  '<th style="padding:8px;">' + (isHumanScale ? 'Humanized (1ns=1s)' : 'Typical Latency') + '</th>' +
                  '<th style="padding:8px;">Log10 Scale</th>' +
                  '<th style="padding:8px;">Architectural Implication</th>' +
                '</tr></thead>' +
                '<tbody>' + latencyRowsHtml + '</tbody>' +
              '</table>' +
            '</div>' +
          '</section>' +

          '<section class="eco-card">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">' +
              '<div>' +
                '<h2 class="eco-card__title">Staff Architecture Trade-Off &amp; Decision Matrix</h2>' +
                '<p class="eco-card__desc">Side-by-side comparison of distributed storage engines, replication topologies, brokers, protocols, and coordination primitives.</p>' +
              '</div>' +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
                ['all', 'storage', 'database', 'messaging', 'protocol', 'coordination'].map(function(cat) {
                  return '<button class="eco-btn eco-btn--sm ' + (activeCat === cat ? 'eco-btn--primary' : '') + '" data-matrix-cat="' + cat + '">' +
                    (cat === 'all' ? 'All Primitives' : cat.charAt(0).toUpperCase() + cat.slice(1)) +
                  '</button>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div style="overflow-x:auto;">' +
              '<table class="eco-table" style="width:100%;border-collapse:collapse;">' +
                '<thead><tr style="text-align:left;border-bottom:1px solid var(--c-border);">' +
                  '<th style="padding:8px;">Primitive / Pattern</th>' +
                  '<th style="padding:8px;">Write Path</th>' +
                  '<th style="padding:8px;">Read Path</th>' +
                  '<th style="padding:8px;">Sweet Spot</th>' +
                  '<th style="padding:8px;">Production Failure Mode</th>' +
                  '<th style="padding:8px;">Deep Dive &amp; Lab</th>' +
                '</tr></thead>' +
                '<tbody>' + matrixHtml + '</tbody>' +
              '</table>' +
            '</div>' +
          '</section>' +
        '</div>'
      );
    },

    _openCapacityCodeLab: function() {
      var cap = this._capState;
      var code = [
        '// Back-of-the-Envelope Capacity & Cost Simulation Model',
        '// Edit the parameters below and click Run to simulate cluster sizing!',
        '',
        'const config = ' + JSON.stringify(cap, null, 2) + ';',
        '',
        'const SECONDS_PER_DAY = 86_400;',
        'const avgReadQps = (config.dau * config.readsPerUser) / SECONDS_PER_DAY;',
        'const peakReadQps = avgReadQps * config.peakMultiplier;',
        'const avgWriteQps = (config.dau * config.writesPerUser) / SECONDS_PER_DAY;',
        'const peakWriteQps = avgWriteQps * config.peakMultiplier;',
        'const totalPeakQps = peakReadQps + peakWriteQps;',
        '',
        "// Little's Law: L = lambda * W",
        'const concurrentInFlight = Math.ceil(totalPeakQps * (config.latencyMs / 1000));',
        'const egressMbps = (peakReadQps * config.payloadKb * 8) / 1000;',
        'const dailyStorageGb = (config.dau * config.writesPerUser * config.payloadKb) / (1024 * 1024);',
        'const multiYearStorageTb = (dailyStorageGb * 365 * config.retentionYears * config.replicationFactor) / 1024;',
        'const hotCacheGb = Math.ceil(dailyStorageGb * 30 * 0.20); // 20% of 30-day working set',
        '',
        'console.log("=== CAPACITY & CLUSTER SIZING REPORT ===");',
        'console.log(`Average QPS        : ${Math.round(avgReadQps)} reads/s | ${Math.round(avgWriteQps)} writes/s`);',
        'console.log(`Peak QPS (${config.peakMultiplier}x)      : ${Math.round(peakReadQps)} reads/s | ${Math.round(peakWriteQps)} writes/s`);',
        'console.log(`Little\'s Law (L=λW): ${concurrentInFlight} concurrent in-flight requests @ ${config.latencyMs}ms`);',
        'console.log(`Peak Egress BW     : ${egressMbps.toFixed(1)} Mbps`);',
        'console.log(`New Daily Storage  : ${dailyStorageGb.toFixed(2)} GB/day`);',
        'console.log(`Total Storage (${config.retentionYears}y) : ${multiYearStorageTb.toFixed(2)} TB (RF=${config.replicationFactor})`);',
        'console.log(`Redis Hot Cache    : ${hotCacheGb} GB (~${Math.ceil(hotCacheGb / 64)} x 64GB shards)`);'
      ].join('\n');

      if (root.App && typeof root.App.openPlaygroundModal === 'function') {
        root.App.openPlaygroundModal({
          title: 'Back-of-the-Envelope Capacity Simulator',
          subtitle: 'Interactive Node.js Capacity & Cluster Sizing Model',
          files: { 'capacity-model.js': code },
          entryFile: 'capacity-model.js',
          runCommand: 'node capacity-model.js'
        });
      }
    },

    _bindEvents: function() {
      var self = this;
      var container = this._container;
      if (!container) return;
      if (this._abortController) this._abortController.abort();
      this._abortController = new AbortController();
      var sig = { signal: this._abortController.signal };

      container.addEventListener('click', function(e) {
        var tabBtn = e.target.closest('[data-dash-tab]');
        if (tabBtn) {
          self._activeTab = tabBtn.getAttribute('data-dash-tab');
          self.render();
          return;
        }

        var navBtn = e.target.closest('[data-dash-nav]');
        if (navBtn && root.App) {
          var dest = navBtn.getAttribute('data-dash-nav');
          if (dest === 'roadmap' && root.App.navigateToRoadmap) root.App.navigateToRoadmap();
          else if (dest === 'challenges' && root.App.navigateToChallenges) root.App.navigateToChallenges();
          else if (dest === 'sandbox' && root.App.navigateToSandbox) root.App.navigateToSandbox();
          return;
        }

        var flipBtn = e.target.closest('[data-srs-flip]') || e.target.closest('.srs-flashcard');
        if (flipBtn && !e.target.closest('[data-srs-rate]')) {
          if (!self._cardFlipped) {
            self._cardFlipped = true;
            self.render();
          }
          return;
        }

        var rateBtn = e.target.closest('[data-srs-rate]');
        if (rateBtn) {
          var q = parseInt(rateBtn.getAttribute('data-srs-rate'), 10) || 4;
          self.rateCurrentCard(q);
          return;
        }

        var resetFilterBtn = e.target.closest('[data-srs-reset-filter]');
        if (resetFilterBtn) {
          self._srsCategoryFilter = 'all';
          self._cardIndex = 0;
          self.render();
          return;
        }

        var saveNoteBtn = e.target.closest('[data-save-note]');
        if (saveNoteBtn && root.Progress) {
          var ta = container.querySelector('#dash-note-textarea');
          if (ta) {
            root.Progress.setNote(self._selectedNoteSlug, ta.value);
            var st = container.querySelector('#dash-note-status');
            if (st) st.textContent = '✓ Note saved!';
          }
          return;
        }

        var bmBtn = e.target.closest('[data-bookmark-slug]');
        if (bmBtn && root.Progress) {
          root.Progress.toggleBookmark(bmBtn.getAttribute('data-bookmark-slug'));
          self.render();
          return;
        }

        var rmBmBtn = e.target.closest('[data-remove-bookmark]');
        if (rmBmBtn && root.Progress) {
          root.Progress.toggleBookmark(rmBmBtn.getAttribute('data-remove-bookmark'));
          self.render();
          return;
        }

        var openTopicLink = e.target.closest('[data-open-topic]');
        if (openTopicLink && root.App && root.App.navigateTo) {
          e.preventDefault();
          root.App.navigateTo(openTopicLink.getAttribute('data-open-topic'));
          return;
        }

        var openBuildBtn = e.target.closest('[data-open-build]');
        if (openBuildBtn && root.App && root.App.navigateToBuild) {
          e.preventDefault();
          root.App.navigateToBuild(openBuildBtn.getAttribute('data-open-build'), 'guided');
          return;
        }

        var capCodeLabBtn = e.target.closest('[data-action="open-capacity-codelab"]');
        if (capCodeLabBtn) {
          self._openCapacityCodeLab();
          return;
        }

        var scaleBtn = e.target.closest('[data-latency-scale]');
        if (scaleBtn) {
          self._latencyScaleMode = scaleBtn.getAttribute('data-latency-scale') || 'real';
          self.render();
          return;
        }

        var matrixCatBtn = e.target.closest('[data-matrix-cat]');
        if (matrixCatBtn) {
          self._matrixCategory = matrixCatBtn.getAttribute('data-matrix-cat') || 'all';
          self.render();
          return;
        }

        var portBtn = e.target.closest('[data-portability-action]');
        if (portBtn && root.Progress) {
          var act = portBtn.getAttribute('data-portability-action');
          var jsonTa = container.querySelector('#dash-portability-json');
          if (act === 'export' && jsonTa) {
            jsonTa.value = root.Progress.exportData();
            self._importFeedback = { success: true, message: 'Exported latest progress snapshot.' };
            self.render();
          } else if (act === 'import' && jsonTa) {
            var res = root.Progress.importData(jsonTa.value);
            if (res && res.success) {
              self._importFeedback = { success: true, message: '✓ Progress data imported and restored!' };
            } else {
              self._importFeedback = { success: false, message: 'Import failed: ' + ((res && res.error) || 'Invalid JSON') };
            }
            self.render();
          }
        }
      }, sig);

      container.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'srs-category-select') {
          self._srsCategoryFilter = e.target.value;
          self._cardIndex = 0;
          self._cardFlipped = false;
          self.render();
          return;
        }

        if (e.target && e.target.id === 'dash-note-topic-select') {
          self._selectedNoteSlug = e.target.value;
          self.render();
          return;
        }

        var capField = e.target && e.target.getAttribute && e.target.getAttribute('data-cap-field');
        if (capField && self._capState) {
          var val = parseFloat(e.target.value);
          if (!isNaN(val) && val > 0) {
            self._capState[capField] = val;
            self.render();
          }
        }
      }, sig);
    }
  };

  if (root && typeof root === 'object') {
    root.DashboardController = DashboardController;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
