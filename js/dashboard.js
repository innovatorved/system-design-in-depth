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
    _activeTab: 'overview', // overview | srs | notes
    _cardIndex: 0,
    _cardFlipped: false,
    _srsCategoryFilter: 'all',
    _reviewedTodayCount: 0,
    _selectedNoteSlug: 'requirements-clarification',
    _importFeedback: null,

    mount: function(container, options) {
      this._container = container;
      if (!container) return;
      options = options || {};
      this._activeTab = options.tab || 'overview';
      this._cardFlipped = false;
      this._importFeedback = null;

      this.render();
      this._bindEvents();
    },

    unmount: function(container) {
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

      var challenges = Array.isArray(root.CHALLENGES_DATA) ? root.CHALLENGES_DATA : [];
      var solvedChallenges = challenges.filter(function(c) {
        return prog && prog.isCompleted && (prog.isCompleted('challenge:' + c.id) || prog.isCompleted(c.id));
      }).length;

      var exams = Array.isArray(root.EXAMS_DATA) ? root.EXAMS_DATA : [];
      var passedExams = exams.filter(function(e) {
        return prog && prog.isCompleted && (prog.isCompleted('exam:' + e.id) || prog.isCompleted(e.id));
      }).length;

      var paths = (root.ROADMAP_DATA && root.ROADMAP_DATA.paths) || [];
      var pathsHtml = paths.map(function(p) {
        var steps = p.steps || [];
        var done = 0;
        steps.forEach(function(s) {
          if (prog && prog.isCompleted && (prog.isCompleted(s.slug || s.id) || prog.isCompleted('challenge:' + s.id) || prog.isCompleted('exam:' + s.id) || prog.isCompleted('build:' + s.slug))) {
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
              '<span class="kpi-sub">Lessons, Labs, Incidents &amp; Exams</span>' +
            '</div>' +
            '<div class="eco-card dash-kpi-card">' +
              '<span class="kpi-label">Curriculum Mastery</span>' +
              '<strong class="kpi-val" id="dash-completion-val">' + pct + '%</strong>' +
              '<span class="kpi-sub">' + completedCount + ' of ' + totalUnits + ' items completed</span>' +
            '</div>' +
            '<div class="eco-card dash-kpi-card">' +
              '<span class="kpi-label">Total Study Time</span>' +
              '<strong class="kpi-val" id="dash-time-val">' + escapeHtml(timeSpent.formatted || '0m') + '</strong>' +
              '<span class="kpi-sub">' + solvedChallenges + '/12 Challenges · ' + passedExams + '/4 Exams</span>' +
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
                  '<div><strong>Incident Troubleshooting Simulators</strong><p>' + (12 - solvedChallenges) + ' production outage scenarios remaining.</p></div>' +
                  '<button class="eco-btn eco-btn--sm" data-dash-nav="challenges">Open Challenges →</button>' +
                '</div>' +
                '<div class="rec-action-item">' +
                  '<div><strong>Timed FAANG Staff Mock Exam</strong><p>Test capacity estimation &amp; architectural trade-offs under a 45m clock.</p></div>' +
                  '<button class="eco-btn eco-btn--sm" data-dash-nav="exams">Take Mock Exam →</button>' +
                '</div>' +
                '<div class="rec-action-item">' +
                  '<div><strong>Interactive Architecture Sandbox</strong><p>Model system topologies and run live capacity bottleneck checks.</p></div>' +
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

    _bindEvents: function() {
      var self = this;
      var container = this._container;
      if (!container) return;

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
          else if (dest === 'exams' && root.App.navigateToExams) root.App.navigateToExams();
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
      });

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
        }
      });
    }
  };

  if (root && typeof root === 'object') {
    root.DashboardController = DashboardController;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
