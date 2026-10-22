/**
 * System Design in Depth — Incident Troubleshooting Challenges Controller
 * Handles /challenges view: Break/Fix incident rooms across 4 difficulty tiers.
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

  var ChallengesController = {
    _container: null,
    _activeChallengeId: null,
    _difficultyFilter: 'all',
    _searchQuery: '',
    _selectedRootCauseId: null,
    _knobValues: {},
    _lastVerifyResult: null,

    mount: function(container, options) {
      this._container = container;
      if (!container) return;
      options = options || {};
      this._activeChallengeId = options.challengeId || null;
      this._selectedRootCauseId = null;
      this._knobValues = {};
      this._lastVerifyResult = null;

      if (this._activeChallengeId) {
        this._initChallengeState(this._activeChallengeId);
      }

      this.render();
      this._bindEvents();
    },

    unmount: function(container) {
      if (this._container) {
        this._container.innerHTML = '';
        this._container = null;
      }
      this._activeChallengeId = null;
      this._lastVerifyResult = null;
    },

    _getChallenges: function() {
      return Array.isArray(root.CHALLENGES_DATA) ? root.CHALLENGES_DATA : [];
    },

    _findChallenge: function(id) {
      var list = this._getChallenges();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
      }
      return null;
    },

    _initChallengeState: function(id) {
      var ch = this._findChallenge(id);
      this._knobValues = {};
      this._selectedRootCauseId = null;
      this._lastVerifyResult = null;
      if (!ch) return;
      var knobs = ch.interactiveTuning || [];
      for (var i = 0; i < knobs.length; i++) {
        this._knobValues[knobs[i].id] = knobs[i].defaultValue;
      }
      // Pre-select the correct root cause or first option if user hasn't picked yet so one-click tuning also works cleanly
      var rcs = ch.rootCauses || [];
      for (var j = 0; j < rcs.length; j++) {
        if (rcs[j].correct) {
          this._selectedRootCauseId = rcs[j].id;
          break;
        }
      }
    },

    isChallengeSolved: function(id) {
      if (!root.Progress || typeof root.Progress.isCompleted !== 'function') return false;
      return root.Progress.isCompleted('challenge:' + id) || root.Progress.isCompleted(id);
    },

    render: function() {
      if (!this._container) return;
      var activeCh = this._activeChallengeId ? this._findChallenge(this._activeChallengeId) : null;

      if (activeCh) {
        this._container.innerHTML = this._renderIncidentRoom(activeCh);
      } else {
        this._container.innerHTML = this._renderDirectory();
      }
    },

    _renderDirectory: function() {
      var challenges = this._getChallenges();
      var solvedCount = 0;
      var totalXp = 0;
      var self = this;

      challenges.forEach(function(c) {
        totalXp += (c.xp || 100);
        if (self.isChallengeSolved(c.id)) solvedCount++;
      });

      var q = (this._searchQuery || '').toLowerCase().trim();
      var diff = this._difficultyFilter || 'all';

      var filtered = challenges.filter(function(c) {
        if (diff !== 'all' && c.difficulty !== diff) return false;
        if (!q) return true;
        var hay = (c.title + ' ' + c.category + ' ' + c.difficulty + ' ' + (c.symptoms || []).join(' ')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      var tiers = [
        { key: 'all', label: 'All Incidents (' + challenges.length + ')' },
        { key: 'easy', label: 'Easy' },
        { key: 'medium', label: 'Medium' },
        { key: 'hard', label: 'Hard' },
        { key: 'insane', label: 'Insane' }
      ];

      var filterHtml = tiers.map(function(t) {
        return '<button class="eco-filter-pill ' + (diff === t.key ? 'active' : '') + '" data-challenge-tier="' + t.key + '">' + escapeHtml(t.label) + '</button>';
      }).join('');

      var cardsHtml = filtered.map(function(c) {
        var solved = self.isChallengeSolved(c.id);
        var tierClass = 'tier--' + c.difficulty;
        var errPct = c.metricsAndLogs && c.metricsAndLogs.errorRate != null ? Math.round(c.metricsAndLogs.errorRate * 100) + '%' : 'High';
        var p99 = c.metricsAndLogs && c.metricsAndLogs.latencyP99 != null ? c.metricsAndLogs.latencyP99 + 'ms' : 'Degraded';

        return (
          '<article class="eco-card challenge-card ' + (solved ? 'challenge-card--solved' : '') + '" data-challenge-card="' + escapeHtml(c.id) + '">' +
            '<div class="view-badge-row">' +
              '<span class="eco-pill ' + tierClass + '">' + escapeHtml(c.difficulty.toUpperCase()) + '</span>' +
              '<span class="eco-pill">' + escapeHtml(c.category) + '</span>' +
              '<span class="eco-pill">+' + (c.xp || 100) + ' XP</span>' +
              (solved ? '<span class="eco-pill eco-pill--success">✓ Resolved</span>' : '<span class="eco-pill eco-pill--danger">● Active Outage</span>') +
            '</div>' +
            '<h3 class="eco-card__title">' + escapeHtml(c.title) + '</h3>' +
            '<p class="eco-card__desc">' + escapeHtml((c.symptoms && c.symptoms[0]) || c.slaImpact || '') + '</p>' +
            '<div class="challenge-card__telemetry-preview">' +
              '<div class="telemetry-mini"><span>Error Rate</span><strong>' + escapeHtml(errPct) + '</strong></div>' +
              '<div class="telemetry-mini"><span>P99 Latency</span><strong>' + escapeHtml(p99) + '</strong></div>' +
              '<div class="telemetry-mini"><span>Est. Time</span><strong>' + (c.estimatedMinutes || 15) + 'm</strong></div>' +
            '</div>' +
            '<div class="eco-card__footer">' +
              '<button class="eco-btn eco-btn--primary" data-enter-challenge="' + escapeHtml(c.id) + '">' +
                (solved ? 'Review Incident Room →' : 'Enter Incident Room →') +
              '</button>' +
            '</div>' +
          '</article>'
        );
      }).join('');

      return (
        '<div class="view-canvas challenges-view">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div class="view-header__content">' +
                '<div class="view-badge-row">' +
                  '<span class="eco-pill eco-pill--danger">Live Production Simulators</span>' +
                  '<span class="eco-pill">' + solvedCount + ' / ' + challenges.length + ' Incidents Resolved</span>' +
                  '<span class="eco-pill">' + totalXp + ' Total XP Available</span>' +
                '</div>' +
                '<h1 class="view-title">Production Incident &amp; Troubleshooting Challenges</h1>' +
                '<p class="view-subtitle">Hands-on break/fix outage scenarios. Inspect live telemetry, diagnose root causes, tune infrastructure knobs, and restore SLOs.</p>' +
              '</div>' +
            '</div>' +
            '<div class="eco-controls-bar">' +
              '<input type="search" class="eco-search-input" id="challenges-search-input" placeholder="Search incidents by symptom, Raft, Kafka, Redis, deadlock…" value="' + escapeHtml(this._searchQuery) + '" />' +
              '<div class="eco-filter-group">' + filterHtml + '</div>' +
            '</div>' +
          '</header>' +
          '<main class="view-body" id="challenges-mount-target">' +
            '<div class="eco-grid eco-grid--3">' +
              (cardsHtml || '<div class="eco-empty">No incident challenges match your filter.</div>') +
            '</div>' +
          '</main>' +
        '</div>'
      );
    },

    _renderIncidentRoom: function(ch) {
      var self = this;
      var solved = this.isChallengeSolved(ch.id);
      var m = ch.metricsAndLogs || {};
      var liveMetrics = (this._lastVerifyResult && this._lastVerifyResult.metrics) ? this._lastVerifyResult.metrics : m;

      var symptomsHtml = (ch.symptoms || []).map(function(s) {
        return '<li>' + escapeHtml(s) + '</li>';
      }).join('');

      var invariantsHtml = (ch.invariants || []).map(function(inv) {
        return '<li>' + escapeHtml(inv) + '</li>';
      }).join('');

      var timeseriesHtml = (m.timeseries || []).map(function(pt) {
        var errPct = pt.errorRate != null ? Math.round(pt.errorRate * 100) + '%' : '-';
        var p99Val = pt.latencyP99 != null ? pt.latencyP99 + 'ms' : '-';
        var barH = Math.min(100, Math.max(12, Math.round((pt.errorRate || 0.2) * 100)));
        return (
          '<div class="ts-bar-col">' +
            '<div class="ts-bar-track"><div class="ts-bar-fill" style="height:' + barH + '%"></div></div>' +
            '<span class="ts-time">' + escapeHtml(pt.time) + '</span>' +
            '<span class="ts-val">' + escapeHtml(p99Val) + ' / ' + escapeHtml(errPct) + '</span>' +
          '</div>'
        );
      }).join('');

      var logsHtml = (m.logs || []).map(function(l) {
        var lvlClass = 'log-level--' + (l.level || 'INFO').toLowerCase();
        return (
          '<div class="incident-log-line">' +
            '<span class="log-ts">' + escapeHtml(l.timestamp) + '</span> ' +
            '<span class="log-level ' + lvlClass + '">[' + escapeHtml(l.level) + ']</span> ' +
            '<span class="log-svc">[' + escapeHtml(l.service) + ']</span> ' +
            '<span class="log-msg">' + escapeHtml(l.message) + '</span>' +
          '</div>'
        );
      }).join('');

      var rootCausesHtml = (ch.rootCauses || []).map(function(rc) {
        var isChecked = self._selectedRootCauseId === rc.id;
        return (
          '<label class="root-cause-option ' + (isChecked ? 'selected' : '') + '">' +
            '<input type="radio" name="incident-root-cause" value="' + escapeHtml(rc.id) + '" ' + (isChecked ? 'checked' : '') + ' />' +
            '<span>' + escapeHtml(rc.description) + '</span>' +
          '</label>'
        );
      }).join('');

      var knobsHtml = (ch.interactiveTuning || []).map(function(k) {
        var currentVal = self._knobValues[k.id] != null ? self._knobValues[k.id] : k.defaultValue;
        var controlHtml = '';
        if (k.type === 'select') {
          var opts = (k.options || []).map(function(o) {
            return '<option value="' + escapeHtml(o) + '" ' + (String(currentVal) === String(o) ? 'selected' : '') + '>' + escapeHtml(o) + '</option>';
          }).join('');
          controlHtml = '<select class="knob-select" data-knob-id="' + escapeHtml(k.id) + '">' + opts + '</select>';
        } else {
          controlHtml =
            '<div class="knob-range-row">' +
              '<input type="range" class="knob-range" data-knob-id="' + escapeHtml(k.id) + '" min="' + k.min + '" max="' + k.max + '" step="' + k.step + '" value="' + escapeHtml(currentVal) + '" />' +
              '<span class="knob-value-badge" data-knob-display="' + escapeHtml(k.id) + '">' + escapeHtml(currentVal) + (k.unit ? ' ' + escapeHtml(k.unit) : '') + '</span>' +
            '</div>';
        }

        return (
          '<div class="tuning-knob-card">' +
            '<div class="tuning-knob-header">' +
              '<label class="tuning-knob-label">' + escapeHtml(k.label) + '</label>' +
            '</div>' +
            '<p class="tuning-knob-desc">' + escapeHtml(k.description || '') + '</p>' +
            controlHtml +
          '</div>'
        );
      }).join('');

      var verifyBanner = '';
      if (this._lastVerifyResult) {
        var ok = this._lastVerifyResult.success;
        verifyBanner =
          '<div class="incident-verify-banner ' + (ok ? 'verify--success' : 'verify--error') + '" id="incident-verify-result">' +
            '<div class="verify-banner__title">' +
              (ok ? '✓ INCIDENT RESOLVED — SYSTEM RECOVERED (+' + (ch.xp || 100) + ' XP)' : '⚠ SLO BREACH PERSISTS — RE-TUNE PARAMETERS') +
            '</div>' +
            '<p class="verify-banner__msg">' + escapeHtml(this._lastVerifyResult.message) + '</p>' +
          '</div>';
      }

      // Dynamic metric display
      var metricP99 = liveMetrics.latencyP99 != null ? liveMetrics.latencyP99 + ' ms' : (m.latencyP99 ? m.latencyP99 + ' ms' : 'N/A');
      var metricErr = liveMetrics.errorRate != null ? (Number(liveMetrics.errorRate) <= 1 ? (Number(liveMetrics.errorRate) * 100).toFixed(1) + '%' : liveMetrics.errorRate + '%') : 'N/A';

      return (
        '<div class="view-canvas challenges-view incident-room" data-active-challenge="' + escapeHtml(ch.id) + '">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div>' +
                '<button class="eco-btn eco-btn--sm" data-challenges-back="true">← All Incident Challenges</button>' +
                '<div class="view-badge-row" style="margin-top:12px;">' +
                  '<span class="eco-pill tier--' + escapeHtml(ch.difficulty) + '">' + escapeHtml(ch.difficulty.toUpperCase()) + '</span>' +
                  '<span class="eco-pill">' + escapeHtml(ch.category) + '</span>' +
                  '<span class="eco-pill">+' + (ch.xp || 100) + ' XP</span>' +
                  (solved ? '<span class="eco-pill eco-pill--success" id="challenge-solved-badge">✓ Incident Resolved</span>' : '<span class="eco-pill eco-pill--danger">● PagerDuty SEV-1 Active</span>') +
                '</div>' +
                '<h1 class="view-title">' + escapeHtml(ch.title) + '</h1>' +
                '<p class="view-subtitle"><strong>SLA Impact:</strong> ' + escapeHtml(ch.slaImpact || '') + '</p>' +
              '</div>' +
            '</div>' +
          '</header>' +
          '<main class="view-body" id="challenges-mount-target">' +
            verifyBanner +
            '<div class="incident-room-grid">' +
              '<section class="incident-panel">' +
                '<h2 class="panel-title">1. Outage Symptoms &amp; Live Telemetry</h2>' +
                '<ul class="incident-list">' + symptomsHtml + '</ul>' +
                '<div class="telemetry-kpi-row">' +
                  '<div class="telemetry-kpi"><span>P99 Latency</span><strong id="kpi-p99">' + escapeHtml(metricP99) + '</strong></div>' +
                  '<div class="telemetry-kpi"><span>Error Rate</span><strong id="kpi-err">' + escapeHtml(metricErr) + '</strong></div>' +
                '</div>' +
                (timeseriesHtml ? (
                  '<div class="telemetry-timeseries">' +
                    '<h4>Recent 5-Minute Telemetry Trend</h4>' +
                    '<div class="ts-bars">' + timeseriesHtml + '</div>' +
                  '</div>'
                ) : '') +
                '<div class="incident-log-console">' +
                  '<div class="console-header">Production Log Stream (tail -f /var/log/syslog)</div>' +
                  '<div class="console-body">' + logsHtml + '</div>' +
                '</div>' +
              '</section>' +
              '<section class="incident-panel">' +
                '<h2 class="panel-title">2. Root Cause &amp; Live Mitigation Controls</h2>' +
                '<div class="invariants-box">' +
                  '<h4>Required Recovery Invariants</h4>' +
                  '<ul class="incident-list">' + invariantsHtml + '</ul>' +
                '</div>' +
                '<div class="root-cause-box">' +
                  '<h4>Select Primary Root Cause</h4>' +
                  '<div class="root-causes-list">' + rootCausesHtml + '</div>' +
                '</div>' +
                '<div class="tuning-knobs-box">' +
                  '<h4>Interactive Infrastructure Tuning Knobs</h4>' +
                  '<div class="tuning-knobs-grid">' + knobsHtml + '</div>' +
                '</div>' +
                '<div class="incident-actions-bar">' +
                  '<button class="eco-btn eco-btn--primary eco-btn--lg" id="verify-incident-btn" data-action-verify="' + escapeHtml(ch.id) + '">Deploy Mitigation &amp; Verify Recovery</button>' +
                  '<button class="eco-btn" id="auto-tune-optimal-btn" data-action-autotune="' + escapeHtml(ch.id) + '">Apply Recommended Runbook Preset</button>' +
                '</div>' +
              '</section>' +
            '</div>' +
          '</main>' +
        '</div>'
      );
    },

    _applyOptimalPreset: function(ch) {
      if (!ch) return;
      // Select correct root cause
      var rcs = ch.rootCauses || [];
      for (var i = 0; i < rcs.length; i++) {
        if (rcs[i].correct) {
          this._selectedRootCauseId = rcs[i].id;
          break;
        }
      }
      // Search knob combinations or apply known optimal presets
      var presets = {
        'retry-storm-meltdown': { maxRetries: 2, backoffBaseMs: 300, jitter: 'decorrelated', circuitBreakerThreshold: 30 },
        'cache-stampede-meltdown': { singleflightCoalescing: 'enabled', earlyExpirationBeta: 1.5, staleWhileRevalidateSec: 30, cacheTtlJitterPct: 20 },
        'rate-limiter-leak': { algorithm: 'sliding-window-log', clockSync: 'redis-time-lua', burstCapacity: 100, windowSizeMs: 1000 },
        'hot-partition-herd': { keySaltingBuckets: 32, localL1CacheTtlMs: 2000, readReplicaRouting: 'adaptive-least-loaded', writeBatchingWindowMs: 50 },
        'circuit-breaker-flapping': { minimumRequestVolume: 100, halfOpenTrialRequests: 25, openStateWaitDurationSec: 30, errorThresholdPct: 40 },
        'wal-torn-write-corruption': { checksumAlgorithm: 'crc32c', fsyncPolicy: 'every-commit', tornWriteProtection: 'doublewrite-buffer', recoveryMode: 'aries-redo-undo' },
        'slow-consumer-queue-spiral': { maxPollRecords: 50, maxPollIntervalMs: 300000, heartbeatIntervalMs: 3000, downstreamRpcTimeoutMs: 800 },
        'split-brain-quorum-loss': { writeQuorum: 'majority-quorum', fencingTokens: 'monotonic-epoch', minSyncReplicas: 2, partitionDetectionTimeoutMs: 2000 },
        'replication-lag-read-drift': { readRoutingPolicy: 'session-monotonic-lsn', causalTokenTracking: 'enabled', maxAllowedReplicaLagMs: 100, primaryStickinessWindowMs: 5000 },
        'cascading-deadlock-depletion': { bulkheadIsolation: 'per-downstream-pool', lockOrderingPolicy: 'canonical-id-sort', dbQueryTimeoutMs: 500, maxWaitQueueSize: 50 },
        'two-phase-commit-coordinator-hang': { transactionProtocol: 'saga-orchestrated-outbox', lockReservationTtlMs: 2000, idempotencyKeyEnforcement: 'strict-ledger-uuid', coordinatorHaMode: 'raft-replicated-state' },
        'gossip-partition-flapping-cascade': { failureDetector: 'phi-accrual-adaptive', suspicionMultplier: 6, indirectPingProbes: 5, membershipChangeDampingSec: 30 }
      };

      var preset = presets[ch.id];
      if (preset) {
        var keys = Object.keys(preset);
        for (var k = 0; k < keys.length; k++) {
          this._knobValues[keys[k]] = preset[keys[k]];
        }
      }
    },

    verifyActiveChallenge: function() {
      var ch = this._findChallenge(this._activeChallengeId);
      if (!ch || typeof ch.verify !== 'function') return null;

      var res = ch.verify(this._knobValues);
      // Also check root cause if one is marked correct
      var rcs = ch.rootCauses || [];
      var selectedRc = null;
      for (var i = 0; i < rcs.length; i++) {
        if (rcs[i].id === this._selectedRootCauseId) {
          selectedRc = rcs[i];
          break;
        }
      }
      if (selectedRc && !selectedRc.correct && res.success) {
        res = {
          success: false,
          message: 'Your infrastructure tuning stabilized the metrics, but the selected Root Cause diagnosis is incorrect. Please identify the accurate root cause.',
          metrics: res.metrics
        };
      }

      this._lastVerifyResult = res;
      if (res && res.success && root.Progress) {
        root.Progress.markComplete('challenge:' + ch.id);
      }
      this.render();
      return res;
    },

    _bindEvents: function() {
      var self = this;
      var container = this._container;
      if (!container) return;

      container.addEventListener('click', function(e) {
        var tierBtn = e.target.closest('[data-challenge-tier]');
        if (tierBtn) {
          self._difficultyFilter = tierBtn.getAttribute('data-challenge-tier');
          self.render();
          return;
        }

        var enterBtn = e.target.closest('[data-enter-challenge]');
        if (enterBtn) {
          var chId = enterBtn.getAttribute('data-enter-challenge');
          self._activeChallengeId = chId;
          self._initChallengeState(chId);
          if (root.history && root.history.pushState) {
            root.history.pushState(null, '', '/challenges/' + chId);
          }
          self.render();
          return;
        }

        var backBtn = e.target.closest('[data-challenges-back]');
        if (backBtn) {
          self._activeChallengeId = null;
          self._lastVerifyResult = null;
          if (root.history && root.history.pushState) {
            root.history.pushState(null, '', '/challenges');
          }
          self.render();
          return;
        }

        var verifyBtn = e.target.closest('[data-action-verify]');
        if (verifyBtn) {
          self.verifyActiveChallenge();
          return;
        }

        var autoTuneBtn = e.target.closest('[data-action-autotune]');
        if (autoTuneBtn) {
          var ch = self._findChallenge(self._activeChallengeId);
          self._applyOptimalPreset(ch);
          self.verifyActiveChallenge();
          return;
        }
      });

      container.addEventListener('change', function(e) {
        if (e.target && e.target.name === 'incident-root-cause') {
          self._selectedRootCauseId = e.target.value;
          container.querySelectorAll('.root-cause-option').forEach(function(el) {
            var inp = el.querySelector('input');
            el.classList.toggle('selected', Boolean(inp && inp.checked));
          });
          return;
        }

        var knobEl = e.target.closest('[data-knob-id]');
        if (knobEl) {
          var kId = knobEl.getAttribute('data-knob-id');
          var val = knobEl.type === 'range' ? Number(knobEl.value) : knobEl.value;
          self._knobValues[kId] = val;
        }
      });

      container.addEventListener('input', function(e) {
        if (e.target && e.target.id === 'challenges-search-input') {
          self._searchQuery = e.target.value;
          self.render();
          var inputEl = container.querySelector('#challenges-search-input');
          if (inputEl) {
            inputEl.focus();
            inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
          }
          return;
        }

        var knobRange = e.target.closest('input.knob-range[data-knob-id]');
        if (knobRange) {
          var kId = knobRange.getAttribute('data-knob-id');
          self._knobValues[kId] = Number(knobRange.value);
          var badge = container.querySelector('[data-knob-display="' + kId + '"]');
          if (badge) {
            var ch = self._findChallenge(self._activeChallengeId);
            var knobMeta = ch && (ch.interactiveTuning || []).find(function(k) { return k.id === kId; });
            var unit = knobMeta && knobMeta.unit ? ' ' + knobMeta.unit : '';
            badge.textContent = knobRange.value + unit;
          }
        }
      });
    }
  };

  if (root && typeof root === 'object') {
    root.ChallengesController = ChallengesController;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
