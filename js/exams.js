/**
 * System Design in Depth — Timed Mock Exams & Certification Simulator Controller
 * Handles /exams view: Timed multi-stage system design exams, instant grading & rubrics.
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

  var ALIAS_MAP = {
    'staff-faang-45m-mock': 'faang-staff-mock-45min',
    'distributed-storage-consensus-exam': 'distributed-storage-consensus-mastery'
  };

  var ExamsController = {
    _container: null,
    _activeExamId: null,
    _activeStageIndex: 0,
    _remainingSeconds: 0,
    _timerInterval: null,
    _capacityAnswers: {},
    _mcqAnswers: {},
    _gradeResult: null,

    mount: function(container, options) {
      this._container = container;
      if (!container) return;
      options = options || {};
      var rawId = options.examId || null;
      this._activeExamId = rawId ? (ALIAS_MAP[rawId] || rawId) : null;
      this._activeStageIndex = 0;
      this._gradeResult = null;
      this._stopCountdown();

      if (this._activeExamId) {
        this._startExamSession(this._activeExamId);
      }

      this.render();
      this._bindEvents();
    },

    unmount: function(container) {
      this._stopCountdown();
      if (this._container) {
        this._container.innerHTML = '';
        this._container = null;
      }
      this._activeExamId = null;
      this._gradeResult = null;
    },

    _getExams: function() {
      return Array.isArray(root.EXAMS_DATA) ? root.EXAMS_DATA : [];
    },

    _findExam: function(id) {
      if (!id) return null;
      var canonical = ALIAS_MAP[id] || id;
      var list = this._getExams();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === canonical || list[i].id === id) return list[i];
      }
      return null;
    },

    isExamPassed: function(id) {
      if (!root.Progress || typeof root.Progress.isCompleted !== 'function') return false;
      var canonical = ALIAS_MAP[id] || id;
      return root.Progress.isCompleted('exam:' + canonical) || root.Progress.isCompleted(canonical);
    },

    _startExamSession: function(id) {
      var ex = this._findExam(id);
      if (!ex) return;
      this._activeExamId = ex.id;
      this._activeStageIndex = 0;
      this._capacityAnswers = {};
      this._mcqAnswers = {};
      this._gradeResult = null;
      this._remainingSeconds = (ex.durationMinutes || 45) * 60;

      var self = this;
      this._stopCountdown();
      this._timerInterval = setInterval(function() {
        if (self._gradeResult) {
          self._stopCountdown();
          return;
        }
        self._remainingSeconds = Math.max(0, self._remainingSeconds - 1);
        self._updateTimerDOM();
        if (self._remainingSeconds <= 0) {
          self._stopCountdown();
          self.submitExam(true);
        }
      }, 1000);
      if (this._timerInterval && typeof this._timerInterval.unref === 'function') {
        this._timerInterval.unref();
      }
    },

    _stopCountdown: function() {
      if (this._timerInterval) {
        clearInterval(this._timerInterval);
        this._timerInterval = null;
      }
    },

    _formatTime: function(secs) {
      var s = Math.max(0, Math.floor(secs));
      var m = Math.floor(s / 60);
      var rem = s % 60;
      return (m < 10 ? '0' + m : String(m)) + ':' + (rem < 10 ? '0' + rem : String(rem));
    },

    _updateTimerDOM: function() {
      if (!this._container) return;
      var el = this._container.querySelector('#exam-countdown-display');
      if (el) {
        el.textContent = this._formatTime(this._remainingSeconds);
        el.classList.toggle('timer--urgent', this._remainingSeconds < 300);
      }
    },

    render: function() {
      if (!this._container) return;
      var ex = this._activeExamId ? this._findExam(this._activeExamId) : null;
      if (ex) {
        this._container.innerHTML = this._renderExamRunner(ex);
      } else {
        this._container.innerHTML = this._renderDirectory();
      }
    },

    _renderDirectory: function() {
      var exams = this._getExams();
      var self = this;
      var passedCount = 0;
      exams.forEach(function(e) {
        if (self.isExamPassed(e.id)) passedCount++;
      });

      var cardsHtml = exams.map(function(ex) {
        var passed = self.isExamPassed(ex.id);
        return (
          '<article class="eco-card exam-card ' + (passed ? 'exam-card--passed' : '') + '" data-exam-card="' + escapeHtml(ex.id) + '">' +
            '<div class="view-badge-row">' +
              '<span class="eco-pill eco-pill--accent">' + escapeHtml(ex.difficulty) + '</span>' +
              '<span class="eco-pill">⏱ ' + ex.durationMinutes + ' Mins</span>' +
              '<span class="eco-pill">' + ex.totalPoints + ' Points</span>' +
              '<span class="eco-pill">Pass: ' + (ex.passingScorePercent || 80) + '%</span>' +
              (passed ? '<span class="eco-pill eco-pill--success">✓ Certified</span>' : '') +
            '</div>' +
            '<h2 class="eco-card__title">' + escapeHtml(ex.title) + '</h2>' +
            '<p class="exam-card__subtitle">' + escapeHtml(ex.subtitle || '') + '</p>' +
            '<p class="eco-card__desc">' + escapeHtml(ex.scenario || '') + '</p>' +
            '<div class="exam-stages-preview">' +
              (ex.stages || []).map(function(s) {
                return '<span class="eco-chip">Stage ' + s.number + ': ' + escapeHtml(s.type) + ' (' + s.points + ' pts)</span>';
              }).join('') +
            '</div>' +
            '<div class="eco-card__footer">' +
              '<button class="eco-btn eco-btn--primary" data-start-exam="' + escapeHtml(ex.id) + '">' +
                (passed ? 'Retake Timed Mock Exam →' : 'Start Timed Mock Exam →') +
              '</button>' +
            '</div>' +
          '</article>'
        );
      }).join('');

      return (
        '<div class="view-canvas exams-view">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div class="view-header__content">' +
                '<div class="view-badge-row">' +
                  '<span class="eco-pill eco-pill--accent">Architecture Certification</span>' +
                  '<span class="eco-pill">' + passedCount + ' / ' + exams.length + ' Exams Passed</span>' +
                '</div>' +
                '<h1 class="view-title">System Design Mock Exams &amp; Certification</h1>' +
                '<p class="view-subtitle">Timed FAANG Staff mock interviews and deep-dive architecture certification exams with objective capacity math, trade-off defense, and failure-mode grading.</p>' +
              '</div>' +
            '</div>' +
          '</header>' +
          '<main class="view-body" id="exams-mount-target">' +
            '<div class="eco-grid eco-grid--2">' + cardsHtml + '</div>' +
          '</main>' +
        '</div>'
      );
    },

    _renderExamRunner: function(ex) {
      var stages = ex.stages || [];
      var self = this;

      var stageTabsHtml = stages.map(function(st, idx) {
        return (
          '<button class="view-tab ' + (self._activeStageIndex === idx ? 'active' : '') + '" data-exam-stage="' + idx + '">' +
            'Stage ' + st.number + ' (' + st.points + ' pts)' +
          '</button>'
        );
      }).join('');

      var currentStage = stages[this._activeStageIndex] || stages[0];
      var stageBodyHtml = currentStage ? this._renderStage(currentStage) : '';
      var gradeReportHtml = this._gradeResult ? this._renderGradeReport(ex, this._gradeResult) : '';

      return (
        '<div class="view-canvas exams-view exam-runner" data-active-exam="' + escapeHtml(ex.id) + '">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div>' +
                '<button class="eco-btn eco-btn--sm" data-exams-back="true">← All Mock Exams</button>' +
                '<h1 class="view-title" style="margin-top:10px;">' + escapeHtml(ex.title) + '</h1>' +
                '<p class="view-subtitle">' + escapeHtml(ex.scenario) + '</p>' +
              '</div>' +
              '<div class="exam-timer-box">' +
                '<div class="timer-label">TIME REMAINING</div>' +
                '<div class="timer-digits" id="exam-countdown-display">' + this._formatTime(this._remainingSeconds) + '</div>' +
                '<div class="exam-runner-top-actions">' +
                  '<button class="eco-btn eco-btn--sm" id="exam-autofill-btn" data-exam-autofill="true" title="Populate reference answers">Fill Reference Answers</button>' +
                  '<button class="eco-btn eco-btn--primary eco-btn--sm" id="submit-exam-btn" data-exam-submit="true">Submit Exam for Grading</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="view-tabs" role="tablist" style="margin-top:16px;">' + stageTabsHtml + '</div>' +
          '</header>' +
          '<main class="view-body" id="exams-mount-target">' +
            gradeReportHtml +
            '<div class="exam-stage-container">' +
              stageBodyHtml +
              '<div class="exam-stage-nav">' +
                (this._activeStageIndex > 0 ? '<button class="eco-btn" data-exam-stage="' + (this._activeStageIndex - 1) + '">← Previous Stage</button>' : '<span></span>') +
                (this._activeStageIndex < stages.length - 1
                  ? '<button class="eco-btn eco-btn--primary" data-exam-stage="' + (this._activeStageIndex + 1) + '">Next Stage →</button>'
                  : '<button class="eco-btn eco-btn--primary eco-btn--lg" data-exam-submit="true">Submit Exam &amp; View Rubric →</button>') +
              '</div>' +
            '</div>' +
          '</main>' +
        '</div>'
      );
    },

    _renderStage: function(stage) {
      var self = this;
      if (stage.type === 'capacity') {
        var inputsHtml = (stage.inputs || []).map(function(inp) {
          var val = self._capacityAnswers[inp.id] != null ? self._capacityAnswers[inp.id] : '';
          var feedbackHtml = '';
          if (self._gradeResult && self._gradeResult.capacityFeedback[inp.id]) {
            var fb = self._gradeResult.capacityFeedback[inp.id];
            feedbackHtml =
              '<div class="exam-field-feedback ' + (fb.correct ? 'fb--correct' : 'fb--wrong') + '">' +
                '<strong>' + (fb.correct ? '✓ Within Tolerance (' + inp.expectedValue + ' ±' + inp.tolerancePercent + '%)' : '✗ Expected ~' + inp.expectedValue + ' ' + inp.unit) + ':</strong> ' +
                escapeHtml(inp.explanation) +
              '</div>';
          }
          return (
            '<div class="capacity-input-card">' +
              '<label class="capacity-input-label" for="cap-' + escapeHtml(inp.id) + '">' + escapeHtml(inp.label) + '</label>' +
              '<div class="capacity-input-row">' +
                '<input type="number" step="any" class="eco-number-input" id="cap-' + escapeHtml(inp.id) + '" data-cap-input="' + escapeHtml(inp.id) + '" placeholder="Enter numeric value…" value="' + escapeHtml(val) + '" />' +
                '<span class="capacity-unit">' + escapeHtml(inp.unit) + '</span>' +
              '</div>' +
              feedbackHtml +
            '</div>'
          );
        }).join('');

        return (
          '<section class="exam-stage-card">' +
            '<h2 class="panel-title">' + escapeHtml(stage.title) + ' (' + stage.points + ' Points)</h2>' +
            '<p class="stage-instructions">' + escapeHtml(stage.instructions) + '</p>' +
            '<div class="capacity-inputs-grid">' + inputsHtml + '</div>' +
          '</section>'
        );
      }

      // Architecture or Failure-modes MCQs
      var questionsHtml = (stage.questions || []).map(function(q, qIdx) {
        var chosenIdx = self._mcqAnswers[q.id];
        var optsHtml = (q.options || []).map(function(opt, oIdx) {
          var isSelected = chosenIdx === oIdx;
          var extraClass = isSelected ? 'selected' : '';
          if (self._gradeResult) {
            if (oIdx === q.correctAnswerIndex) extraClass += ' opt--correct';
            else if (isSelected && oIdx !== q.correctAnswerIndex) extraClass += ' opt--wrong';
          }
          return (
            '<label class="exam-mcq-option ' + extraClass + '">' +
              '<input type="radio" name="mcq-' + escapeHtml(q.id) + '" data-mcq-id="' + escapeHtml(q.id) + '" value="' + oIdx + '" ' + (isSelected ? 'checked' : '') + ' />' +
              '<span>' + escapeHtml(opt) + '</span>' +
            '</label>'
          );
        }).join('');

        var rubricHtml = '';
        if (self._gradeResult) {
          var isRight = chosenIdx === q.correctAnswerIndex;
          rubricHtml =
            '<div class="exam-field-feedback ' + (isRight ? 'fb--correct' : 'fb--wrong') + '">' +
              '<strong>' + (isRight ? '✓ Correct Architecture Decision' : '✗ Staff Rubric Explanation') + ':</strong> ' +
              escapeHtml(q.rubric || '') +
            '</div>';
        }

        return (
          '<div class="exam-question-card" data-question-id="' + escapeHtml(q.id) + '">' +
            '<h3 class="question-title">Q' + (qIdx + 1) + ': ' + escapeHtml(q.title) + '</h3>' +
            '<p class="question-prompt">' + escapeHtml(q.prompt) + '</p>' +
            '<div class="exam-mcq-options">' + optsHtml + '</div>' +
            rubricHtml +
          '</div>'
        );
      }).join('');

      return (
        '<section class="exam-stage-card">' +
          '<h2 class="panel-title">' + escapeHtml(stage.title) + ' (' + stage.points + ' Points)</h2>' +
          '<p class="stage-instructions">' + escapeHtml(stage.instructions) + '</p>' +
          '<div class="exam-questions-list">' + questionsHtml + '</div>' +
        '</section>'
      );
    },

    _renderGradeReport: function(ex, res) {
      var sol = ex.rubricSolution || {};
      return (
        '<section class="exam-grade-report ' + (res.passed ? 'grade--pass' : 'grade--fail') + '" id="exam-grade-report">' +
          '<div class="grade-report__header">' +
            '<div>' +
              '<span class="eco-pill ' + (res.passed ? 'eco-pill--success' : 'eco-pill--danger') + '">' +
                (res.passed ? '✓ PASSED & CERTIFIED' : '⚠ BELOW PASSING THRESHOLD (' + (ex.passingScorePercent || 80) + '% REQUIRED)') +
              '</span>' +
              '<h2 class="grade-report__title">Final Score: ' + res.earnedPoints + ' / ' + res.totalPoints + ' (' + res.scorePercent + '%)</h2>' +
              (res.autoSubmitted ? '<p class="grade-note">Timer expired (00:00) — Exam was automatically graded.</p>' : '') +
            '</div>' +
            '<div class="grade-stage-breakdown">' +
              res.stageScores.map(function(ss) {
                return '<div class="stage-score-pill"><span>Stage ' + ss.number + '</span><strong>' + ss.earned + '/' + ss.max + ' pts</strong></div>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="grade-rubric-summary">' +
            '<h4>Staff Examiner Worked Rubric</h4>' +
            (sol.stage1Review ? '<p><strong>Stage 1 Capacity Math:</strong> ' + escapeHtml(sol.stage1Review) + '</p>' : '') +
            (sol.stage2Review ? '<p><strong>Stage 2 Architecture:</strong> ' + escapeHtml(sol.stage2Review) + '</p>' : '') +
            (sol.stage3Review ? '<p><strong>Stage 3 Failure Modes:</strong> ' + escapeHtml(sol.stage3Review) + '</p>' : '') +
          '</div>' +
        '</section>'
      );
    },

    fillReferenceAnswers: function() {
      var ex = this._findExam(this._activeExamId);
      if (!ex) return;
      var self = this;
      (ex.stages || []).forEach(function(st) {
        if (st.type === 'capacity') {
          (st.inputs || []).forEach(function(inp) {
            self._capacityAnswers[inp.id] = inp.expectedValue;
          });
        } else {
          (st.questions || []).forEach(function(q) {
            self._mcqAnswers[q.id] = q.correctAnswerIndex;
          });
        }
      });
      this.render();
    },

    submitExam: function(autoSubmitted) {
      var ex = this._findExam(this._activeExamId);
      if (!ex) return null;
      this._stopCountdown();

      var totalPoints = ex.totalPoints || 100;
      var earnedPoints = 0;
      var stageScores = [];
      var capacityFeedback = {};
      var self = this;

      (ex.stages || []).forEach(function(st) {
        var stEarned = 0;
        var stMax = st.points || 30;
        if (st.type === 'capacity') {
          var inputs = st.inputs || [];
          var ptsPerInput = inputs.length > 0 ? (stMax / inputs.length) : 0;
          inputs.forEach(function(inp) {
            var rawVal = self._capacityAnswers[inp.id];
            var numVal = rawVal !== '' && rawVal != null ? Number(rawVal) : NaN;
            var expected = Number(inp.expectedValue);
            var tol = (Number(inp.tolerancePercent) || 10) / 100;
            var lower = expected * (1 - tol);
            var upper = expected * (1 + tol);
            var ok = !isNaN(numVal) && numVal >= lower && numVal <= upper;
            capacityFeedback[inp.id] = { correct: ok, userValue: numVal, expected: expected };
            if (ok) stEarned += ptsPerInput;
          });
        } else {
          var qs = st.questions || [];
          var ptsPerQ = qs.length > 0 ? (stMax / qs.length) : 0;
          qs.forEach(function(q) {
            if (self._mcqAnswers[q.id] === q.correctAnswerIndex) {
              stEarned += ptsPerQ;
            }
          });
        }
        stEarned = Math.round(stEarned);
        earnedPoints += stEarned;
        stageScores.push({ number: st.number, title: st.title, earned: stEarned, max: stMax });
      });

      var scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      var passThreshold = ex.passingScorePercent || ex.passingScore || 80;
      var passed = scorePercent >= passThreshold;

      this._gradeResult = {
        earnedPoints: earnedPoints,
        totalPoints: totalPoints,
        scorePercent: scorePercent,
        passed: passed,
        autoSubmitted: Boolean(autoSubmitted),
        stageScores: stageScores,
        capacityFeedback: capacityFeedback
      };

      if (passed && root.Progress) {
        root.Progress.markComplete('exam:' + ex.id);
      }

      this.render();
      return this._gradeResult;
    },

    _bindEvents: function() {
      var self = this;
      var container = this._container;
      if (!container) return;

      container.addEventListener('click', function(e) {
        var startBtn = e.target.closest('[data-start-exam]');
        if (startBtn) {
          var exId = startBtn.getAttribute('data-start-exam');
          self._startExamSession(exId);
          if (root.history && root.history.pushState) {
            root.history.pushState(null, '', '/exams/' + exId);
          }
          self.render();
          return;
        }

        var backBtn = e.target.closest('[data-exams-back]');
        if (backBtn) {
          self._stopCountdown();
          self._activeExamId = null;
          self._gradeResult = null;
          if (root.history && root.history.pushState) {
            root.history.pushState(null, '', '/exams');
          }
          self.render();
          return;
        }

        var stageBtn = e.target.closest('[data-exam-stage]');
        if (stageBtn) {
          self._activeStageIndex = parseInt(stageBtn.getAttribute('data-exam-stage'), 10) || 0;
          self.render();
          return;
        }

        var autofillBtn = e.target.closest('[data-exam-autofill]');
        if (autofillBtn) {
          self.fillReferenceAnswers();
          return;
        }

        var submitBtn = e.target.closest('[data-exam-submit]');
        if (submitBtn) {
          self.submitExam(false);
          return;
        }
      });

      container.addEventListener('input', function(e) {
        var capInp = e.target.closest('[data-cap-input]');
        if (capInp) {
          var id = capInp.getAttribute('data-cap-input');
          self._capacityAnswers[id] = capInp.value;
        }
      });

      container.addEventListener('change', function(e) {
        var mcqInp = e.target.closest('[data-mcq-id]');
        if (mcqInp) {
          var qId = mcqInp.getAttribute('data-mcq-id');
          self._mcqAnswers[qId] = parseInt(mcqInp.value, 10);
          self.render();
        }
      });
    }
  };

  if (root && typeof root === 'object') {
    root.ExamsController = ExamsController;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
