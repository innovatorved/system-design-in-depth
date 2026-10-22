/**
 * System Design in Depth — Interactive Visual Roadmap Controller
 * Handles /roadmap view: Interactive DAG graph, Career Paths, and Modules Explorer.
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

  var RoadmapController = {
    _container: null,
    _activeTab: 'graph', // graph | paths | modules
    _selectedNodeId: null,
    _checklistOpen: false,
    _moduleSearch: '',
    _moduleDifficulty: 'All',
    _zoom: 1,
    _panX: 0,
    _panY: 0,
    _isPanning: false,
    _panStartX: 0,
    _panStartY: 0,

    mount: function(container, options) {
      this._container = container;
      if (!container) return;
      options = options || {};
      this._activeTab = options.tab || 'graph';
      this._selectedNodeId = options.nodeId || null;

      this.render();
      this._bindEvents();
    },

    unmount: function(container) {
      if (this._container) {
        this._container.innerHTML = '';
        this._container = null;
      }
      this._isPanning = false;
    },

    getNodeStatus: function(node) {
      var prog = root.Progress;
      if (!prog) return 'todo';
      if (node.type === 'challenge' && node.challengeId) {
        if (prog.isCompleted('challenge:' + node.challengeId) || prog.isCompleted(node.challengeId)) return 'done';
      }
      if (node.type === 'exam' && node.examId) {
        if (prog.isCompleted('exam:' + node.examId) || prog.isCompleted(node.examId)) return 'done';
      }
      if (node.type === 'build' && node.slug) {
        if (prog.isCompleted('build:' + node.slug) || prog.isCompleted(node.slug)) return 'done';
      }
      if (node.slug && prog.isCompleted(node.slug)) {
        return 'done';
      }
      if (node.moduleId && typeof prog.getModuleProgress === 'function') {
        var mp = prog.getModuleProgress(node.moduleId);
        if (mp && mp.completed > 0) return 'in-progress';
      }
      return 'todo';
    },

    getStepCompleted: function(step) {
      var prog = root.Progress;
      if (!prog) return false;
      if (step.type === 'challenge') return prog.isCompleted('challenge:' + step.id) || prog.isCompleted(step.id);
      if (step.type === 'exam') {
        var aliasMap = {
          'staff-faang-45m-mock': 'faang-staff-mock-45min',
          'distributed-storage-consensus-exam': 'distributed-storage-consensus-mastery'
        };
        var exId = aliasMap[step.id] || step.id;
        return prog.isCompleted('exam:' + exId) || prog.isCompleted('exam:' + step.id) || prog.isCompleted(exId);
      }
      if (step.type === 'build') return prog.isCompleted('build:' + step.slug) || prog.isCompleted(step.slug);
      if (step.slug) return prog.isCompleted(step.slug);
      return false;
    },

    render: function() {
      if (!this._container) return;
      var data = root.ROADMAP_DATA || { stages: [], nodes: [], edges: [], paths: [], modules: [] };
      var nodes = data.nodes || [];
      var doneCount = 0;
      for (var i = 0; i < nodes.length; i++) {
        if (this.getNodeStatus(nodes[i]) === 'done') doneCount++;
      }
      var pct = nodes.length > 0 ? Math.round((doneCount / nodes.length) * 100) : 0;

      this._container.innerHTML =
        '<div class="view-canvas roadmap-view">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div class="view-header__content">' +
                '<div class="view-badge-row">' +
                  '<span class="eco-pill eco-pill--accent">Interactive DAG Architecture</span>' +
                  '<span class="eco-pill">' + nodes.length + ' Milestones</span>' +
                  '<span class="eco-pill">' + (data.paths || []).length + ' Career Paths</span>' +
                  '<span class="eco-pill">' + doneCount + '/' + nodes.length + ' Completed (' + pct + '%)</span>' +
                '</div>' +
                '<h1 class="view-title">System Design Roadmap &amp; Career Paths</h1>' +
                '<p class="view-subtitle">Interactive visual dependency graph, curated role-based learning paths, and modular curriculum explorer.</p>' +
              '</div>' +
              '<div class="view-tabs" role="tablist">' +
                '<button class="view-tab ' + (this._activeTab === 'graph' ? 'active' : '') + '" data-roadmap-tab="graph" role="tab" aria-selected="' + (this._activeTab === 'graph') + '">Visual Roadmap</button>' +
                '<button class="view-tab ' + (this._activeTab === 'paths' ? 'active' : '') + '" data-roadmap-tab="paths" role="tab" aria-selected="' + (this._activeTab === 'paths') + '">Career Paths</button>' +
                '<button class="view-tab ' + (this._activeTab === 'modules' ? 'active' : '') + '" data-roadmap-tab="modules" role="tab" aria-selected="' + (this._activeTab === 'modules') + '">Modules Explorer</button>' +
              '</div>' +
            '</div>' +
          '</header>' +
          '<div class="view-body" id="roadmap-mount-target">' +
            this._renderTabBody(data) +
          '</div>' +
        '</div>';
    },

    _renderTabBody: function(data) {
      if (this._activeTab === 'paths') return this._renderPathsTab(data);
      if (this._activeTab === 'modules') return this._renderModulesTab(data);
      return this._renderGraphTab(data);
    },

    _renderGraphTab: function(data) {
      var stages = data.stages || [];
      var nodes = data.nodes || [];
      var edges = data.edges || [];

      var nodeMap = {};
      nodes.forEach(function(n) { nodeMap[n.id] = n; });

      var stageSwimlanesSvg = stages.map(function(st, idx) {
        var yTop = 55 + idx * 195;
        var yHeight = 180;
        return (
          '<g class="roadmap-stage-lane" data-stage="' + st.number + '">' +
            '<rect x="20" y="' + yTop + '" width="1210" height="' + yHeight + '" rx="12" fill="var(--bg-elevated)" stroke="' + st.color + '" stroke-opacity="0.28" stroke-width="1.5" />' +
            '<rect x="20" y="' + yTop + '" width="6" height="' + yHeight + '" rx="3" fill="' + st.color + '" />' +
            '<text x="42" y="' + (yTop + 26) + '" fill="' + st.color + '" font-size="11" font-weight="700" letter-spacing="0.06em">STAGE ' + st.number + ' — ' + escapeHtml(st.title.toUpperCase()) + ' (' + st.hours + 'H)</text>' +
          '</g>'
        );
      }).join('');

      var edgesSvg = edges.map(function(e) {
        var src = nodeMap[e.source];
        var tgt = nodeMap[e.target];
        if (!src || !tgt) return '';
        var x1 = src.x + 80;
        var y1 = src.y + 32;
        var x2 = tgt.x + 80;
        var y2 = tgt.y + 32;
        var dx = x2 - x1;
        var dy = y2 - y1;
        var cx1 = x1 + dx * 0.45;
        var cy1 = y1 + dy * 0.1;
        var cx2 = x1 + dx * 0.55;
        var cy2 = y2 - dy * 0.1;
        var pathD = 'M ' + x1 + ' ' + y1 + ' C ' + cx1 + ' ' + cy1 + ', ' + cx2 + ' ' + cy2 + ', ' + x2 + ' ' + y2;
        return (
          '<g class="roadmap-edge" data-edge-id="' + escapeHtml(e.id) + '">' +
            '<path d="' + pathD + '" fill="none" stroke="var(--border)" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#roadmap-arrow)" />' +
          '</g>'
        );
      }).join('');

      var self = this;
      var nodesSvg = nodes.map(function(n) {
        var status = self.getNodeStatus(n);
        var isSelected = self._selectedNodeId === n.id;
        var statusColor = status === 'done' ? '#00e599' : (status === 'in-progress' ? '#f5a623' : '#64748b');
        var typeBadge = (n.type || 'concept').toUpperCase();
        var strokeColor = isSelected ? '#3291ff' : (status === 'done' ? '#00e599' : 'var(--border)');
        var strokeW = isSelected ? '2.5' : '1.5';
        var labelShort = n.label.length > 25 ? n.label.slice(0, 23) + '…' : n.label;

        return (
          '<g class="roadmap-node roadmap-node--' + status + (isSelected ? ' selected' : '') + '" ' +
             'data-node-id="' + escapeHtml(n.id) + '" ' +
             'data-node-status="' + status + '" ' +
             'transform="translate(' + n.x + ',' + n.y + ')" ' +
             'style="cursor:pointer;" role="button" tabindex="0" aria-label="' + escapeHtml(n.label) + '">' +
            '<rect width="165" height="62" rx="9" fill="var(--bg)" stroke="' + strokeColor + '" stroke-width="' + strokeW + '" />' +
            '<circle cx="16" cy="18" r="5" fill="' + statusColor + '" />' +
            '<text x="27" y="21" fill="var(--fg-muted)" font-size="9" font-weight="700" letter-spacing="0.05em">' + escapeHtml(typeBadge) + '</text>' +
            '<text x="14" y="42" fill="var(--fg)" font-size="11.5" font-weight="600">' + escapeHtml(labelShort) + '</text>' +
          '</g>'
        );
      }).join('');

      var selectedNode = this._selectedNodeId ? nodeMap[this._selectedNodeId] : nodes[0];
      var detailHtml = selectedNode ? this._renderNodeDetail(selectedNode) : '';

      var checklistHtml = nodes.map(function(n) {
        var st = self.getNodeStatus(n);
        return (
          '<div class="roadmap-checklist-item ' + (st === 'done' ? 'done' : '') + '" data-check-node="' + escapeHtml(n.id) + '">' +
            '<input type="checkbox" class="roadmap-check-input" data-toggle-node-slug="' + escapeHtml(n.slug || n.id) + '" ' + (st === 'done' ? 'checked' : '') + ' />' +
            '<span class="roadmap-checklist-label" data-select-node="' + escapeHtml(n.id) + '">' + escapeHtml(n.label) + '</span>' +
            '<span class="eco-pill eco-pill--sm">' + escapeHtml(n.type) + '</span>' +
          '</div>'
        );
      }).join('');

      var transformAttr = 'translate(' + this._panX + ',' + this._panY + ') scale(' + this._zoom + ')';

      return (
        '<div class="roadmap-graph-layout">' +
          '<div class="roadmap-toolbar">' +
            '<div class="roadmap-legend">' +
              '<span class="legend-item"><span class="legend-dot legend-dot--done"></span> Completed</span>' +
              '<span class="legend-item"><span class="legend-dot legend-dot--progress"></span> In Progress</span>' +
              '<span class="legend-item"><span class="legend-dot legend-dot--todo"></span> To Do</span>' +
            '</div>' +
            '<div class="roadmap-zoom-controls">' +
              '<button class="eco-btn eco-btn--sm" data-roadmap-action="zoom-in" title="Zoom In">+ Zoom In</button>' +
              '<button class="eco-btn eco-btn--sm" data-roadmap-action="zoom-out" title="Zoom Out">− Zoom Out</button>' +
              '<button class="eco-btn eco-btn--sm" data-roadmap-action="zoom-reset" title="Fit to Screen">Fit to Screen</button>' +
              '<button class="eco-btn eco-btn--sm ' + (this._checklistOpen ? 'eco-btn--primary' : '') + '" data-roadmap-action="toggle-checklist">Checklist (' + nodes.length + ')</button>' +
            '</div>' +
          '</div>' +
          '<div class="roadmap-workspace">' +
            '<div class="roadmap-svg-viewport" id="roadmap-svg-viewport">' +
              '<svg class="roadmap-svg" viewBox="0 0 1250 1250" width="100%" height="680">' +
                '<defs>' +
                  '<marker id="roadmap-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
                    '<path d="M 0 1 L 10 5 L 0 9 z" fill="var(--fg-muted)" />' +
                  '</marker>' +
                '</defs>' +
                '<g id="roadmap-pan-zoom-group" transform="' + transformAttr + '">' +
                  stageSwimlanesSvg +
                  edgesSvg +
                  nodesSvg +
                '</g>' +
              '</svg>' +
            '</div>' +
            '<aside class="roadmap-inspector">' +
              detailHtml +
              (this._checklistOpen ? (
                '<div class="roadmap-checklist-drawer">' +
                  '<h4 class="inspector-subtitle">Milestone Checklist</h4>' +
                  '<div class="roadmap-checklist-list">' + checklistHtml + '</div>' +
                '</div>'
              ) : '') +
            '</aside>' +
          '</div>' +
        '</div>'
      );
    },

    _renderNodeDetail: function(node) {
      var status = this.getNodeStatus(node);
      var statusLabel = status === 'done' ? 'Completed' : (status === 'in-progress' ? 'In Progress' : 'Not Started');
      var actionLabel = 'Open Topic Lesson';
      if (node.type === 'challenge') actionLabel = 'Enter Incident Challenge';
      else if (node.type === 'exam') actionLabel = 'Launch Timed Mock Exam';
      else if (node.type === 'build') actionLabel = 'Open Interactive Build Lab';
      else if (node.type === 'simulator') actionLabel = 'Launch Interactive Simulator';

      return (
        '<div class="roadmap-node-card" data-inspected-node="' + escapeHtml(node.id) + '">' +
          '<div class="view-badge-row">' +
            '<span class="eco-pill eco-pill--accent">Stage ' + node.stage + '</span>' +
            '<span class="eco-pill">' + escapeHtml(node.difficulty || 'Intermediate') + '</span>' +
            '<span class="eco-pill">' + escapeHtml(statusLabel) + '</span>' +
          '</div>' +
          '<h3 class="inspector-title">' + escapeHtml(node.label) + '</h3>' +
          '<p class="inspector-desc">' + escapeHtml(node.description || '') + '</p>' +
          (node.prerequisites && node.prerequisites.length > 0 ? (
            '<div class="inspector-prereqs">' +
              '<strong>Prerequisites:</strong> ' + node.prerequisites.map(escapeHtml).join(', ') +
            '</div>'
          ) : '') +
          '<div class="inspector-actions">' +
            '<button class="eco-btn eco-btn--primary" data-roadmap-launch="' + escapeHtml(node.id) + '">' + actionLabel + ' →</button>' +
            '<button class="eco-btn" data-roadmap-mark-complete="' + escapeHtml(node.slug || node.id) + '">' +
              (status === 'done' ? '✓ Completed' : 'Mark Complete') +
            '</button>' +
          '</div>' +
        '</div>'
      );
    },

    _renderPathsTab: function(data) {
      var paths = data.paths || [];
      var self = this;
      var cardsHtml = paths.map(function(p) {
        var steps = p.steps || [];
        var completedSteps = 0;
        steps.forEach(function(s) {
          if (self.getStepCompleted(s)) completedSteps++;
        });
        var pct = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

        var stepsHtml = steps.map(function(s, idx) {
          var isDone = self.getStepCompleted(s);
          return (
            '<button class="career-step-pill ' + (isDone ? 'done' : '') + '" ' +
                    'data-step-type="' + escapeHtml(s.type) + '" ' +
                    'data-step-target="' + escapeHtml(s.slug || s.id) + '">' +
              '<span class="step-num">' + (isDone ? '✓' : (idx + 1)) + '</span>' +
              '<span class="step-title">' + escapeHtml(s.title) + '</span>' +
              '<span class="step-badge">' + escapeHtml(s.type) + '</span>' +
            '</button>'
          );
        }).join('');

        return (
          '<article class="eco-card career-path-card" data-path-id="' + escapeHtml(p.id) + '">' +
            '<div class="career-path-card__header">' +
              '<div>' +
                '<div class="view-badge-row">' +
                  '<span class="eco-pill eco-pill--accent">' + escapeHtml(p.role) + '</span>' +
                  '<span class="eco-pill">' + escapeHtml(p.difficulty) + '</span>' +
                  '<span class="eco-pill">' + p.estimatedHours + ' Hours</span>' +
                  '<span class="eco-pill">+' + p.xpReward + ' XP</span>' +
                '</div>' +
                '<h2 class="eco-card__title">' + escapeHtml(p.title) + '</h2>' +
                '<p class="eco-card__desc">' + escapeHtml(p.description) + '</p>' +
              '</div>' +
              '<div class="career-path-card__progress-box">' +
                '<div class="progress-stat">' + completedSteps + ' / ' + steps.length + ' steps (' + pct + '%)</div>' +
                '<div class="eco-progress-bar"><div class="eco-progress-fill" style="width:' + pct + '%"></div></div>' +
              '</div>' +
            '</div>' +
            '<div class="career-steps-grid">' + stepsHtml + '</div>' +
          '</article>'
        );
      }).join('');

      return '<div class="career-paths-list">' + cardsHtml + '</div>';
    },

    _renderModulesTab: function(data) {
      var modules = data.modules || [];
      var q = (this._moduleSearch || '').toLowerCase().trim();
      var diff = this._moduleDifficulty || 'All';

      var filtered = modules.filter(function(m) {
        if (diff !== 'All' && m.difficulty !== diff) return false;
        if (!q) return true;
        var text = (m.title + ' ' + m.summary + ' ' + m.trackTitle + ' ' + m.number).toLowerCase();
        return text.indexOf(q) !== -1;
      });

      var diffs = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
      var self = this;
      var filterPills = diffs.map(function(d) {
        return '<button class="eco-filter-pill ' + (self._moduleDifficulty === d ? 'active' : '') + '" data-mod-diff="' + d + '">' + d + '</button>';
      }).join('');

      var cardsHtml = filtered.map(function(m) {
        var prog = root.Progress && root.Progress.getModuleProgress ? root.Progress.getModuleProgress(m.id) : { completed: 0, total: m.unitCount || 10 };
        var total = prog.total || m.unitCount || 10;
        var pct = total > 0 ? Math.round((prog.completed / total) * 100) : 0;

        return (
          '<article class="eco-card module-explorer-card" data-module-card="' + escapeHtml(m.id) + '">' +
            '<div class="view-badge-row">' +
              '<span class="eco-pill eco-pill--accent">Module ' + escapeHtml(m.number) + '</span>' +
              '<span class="eco-pill">' + escapeHtml(m.difficulty) + '</span>' +
              '<span class="eco-pill">' + total + ' Units</span>' +
            '</div>' +
            '<h3 class="eco-card__title">' + escapeHtml(m.title) + '</h3>' +
            '<p class="eco-card__desc">' + escapeHtml(m.summary) + '</p>' +
            '<div class="module-meta-chips">' +
              (m.builds && m.builds.length ? '<span class="eco-chip">🛠 ' + m.builds.length + ' Build Labs</span>' : '') +
              (m.simulators && m.simulators.length ? '<span class="eco-chip">⚡ ' + m.simulators.length + ' Simulators</span>' : '') +
            '</div>' +
            '<div class="module-card__footer">' +
              '<div class="eco-progress-bar"><div class="eco-progress-fill" style="width:' + pct + '%"></div></div>' +
              '<div class="module-card__actions">' +
                '<span class="progress-stat">' + prog.completed + '/' + total + ' (' + pct + '%)</span>' +
                '<button class="eco-btn eco-btn--sm eco-btn--primary" data-open-module="' + escapeHtml(m.id) + '">Start Module →</button>' +
              '</div>' +
            '</div>' +
          '</article>'
        );
      }).join('');

      return (
        '<div class="modules-explorer-section">' +
          '<div class="eco-controls-bar">' +
            '<input type="search" class="eco-search-input" id="roadmap-module-search" placeholder="Filter 18 modules by topic, storage, consensus, SRE…" value="' + escapeHtml(this._moduleSearch) + '" />' +
            '<div class="eco-filter-group">' + filterPills + '</div>' +
          '</div>' +
          '<div class="eco-grid eco-grid--3">' +
            (cardsHtml || '<div class="eco-empty">No modules match your filter criteria.</div>') +
          '</div>' +
        '</div>'
      );
    },

    _launchNode: function(node) {
      if (!node) return;
      if (node.type === 'challenge' && node.challengeId && root.App && root.App.navigateToChallenges) {
        root.App.navigateToChallenges(node.challengeId);
        return;
      }
      if (node.type === 'exam' && node.examId && root.App && root.App.navigateToExams) {
        root.App.navigateToExams(node.examId);
        return;
      }
      if (node.type === 'build' && node.slug && root.App && root.App.navigateToBuild) {
        root.App.navigateToBuild(node.slug);
        return;
      }
      if (node.slug && root.App && root.App.navigateTo) {
        root.App.navigateTo(node.slug);
      }
    },

    _launchStep: function(type, target) {
      if (!target) return;
      if (type === 'challenge' && root.App && root.App.navigateToChallenges) {
        root.App.navigateToChallenges(target);
      } else if (type === 'exam' && root.App && root.App.navigateToExams) {
        root.App.navigateToExams(target);
      } else if (type === 'build' && root.App && root.App.navigateToBuild) {
        root.App.navigateToBuild(target);
      } else if (root.App && root.App.navigateTo) {
        root.App.navigateTo(target);
      }
    },

    _updatePanZoomDOM: function() {
      if (!this._container) return;
      var g = this._container.querySelector('#roadmap-pan-zoom-group');
      if (g) {
        g.setAttribute('transform', 'translate(' + this._panX + ',' + this._panY + ') scale(' + this._zoom + ')');
      }
    },

    _bindEvents: function() {
      var self = this;
      var container = this._container;
      if (!container) return;

      container.addEventListener('click', function(e) {
        var tabBtn = e.target.closest('[data-roadmap-tab]');
        if (tabBtn) {
          self._activeTab = tabBtn.getAttribute('data-roadmap-tab');
          self.render();
          return;
        }

        var actionBtn = e.target.closest('[data-roadmap-action]');
        if (actionBtn) {
          var act = actionBtn.getAttribute('data-roadmap-action');
          if (act === 'zoom-in') {
            self._zoom = Math.min(2.2, Number((self._zoom + 0.2).toFixed(2)));
            self._updatePanZoomDOM();
          } else if (act === 'zoom-out') {
            self._zoom = Math.max(0.5, Number((self._zoom - 0.2).toFixed(2)));
            self._updatePanZoomDOM();
          } else if (act === 'zoom-reset') {
            self._zoom = 1;
            self._panX = 0;
            self._panY = 0;
            self._updatePanZoomDOM();
          } else if (act === 'toggle-checklist') {
            self._checklistOpen = !self._checklistOpen;
            self.render();
          }
          return;
        }

        var nodeEl = e.target.closest('.roadmap-node');
        if (nodeEl) {
          var nodeId = nodeEl.getAttribute('data-node-id');
          if (self._selectedNodeId === nodeId) {
            // Second click launches node
            var nodes = (root.ROADMAP_DATA && root.ROADMAP_DATA.nodes) || [];
            var found = nodes.find(function(n) { return n.id === nodeId; });
            self._launchNode(found);
          } else {
            self._selectedNodeId = nodeId;
            self.render();
          }
          return;
        }

        var selectNodeEl = e.target.closest('[data-select-node]');
        if (selectNodeEl) {
          self._selectedNodeId = selectNodeEl.getAttribute('data-select-node');
          self.render();
          return;
        }

        var launchBtn = e.target.closest('[data-roadmap-launch]');
        if (launchBtn) {
          var nId = launchBtn.getAttribute('data-roadmap-launch');
          var nList = (root.ROADMAP_DATA && root.ROADMAP_DATA.nodes) || [];
          var targetNode = nList.find(function(n) { return n.id === nId; });
          self._launchNode(targetNode);
          return;
        }

        var markBtn = e.target.closest('[data-roadmap-mark-complete]');
        if (markBtn && root.Progress) {
          var slug = markBtn.getAttribute('data-roadmap-mark-complete');
          root.Progress.toggleComplete(slug);
          self.render();
          return;
        }

        var stepBtn = e.target.closest('.career-step-pill');
        if (stepBtn) {
          self._launchStep(stepBtn.getAttribute('data-step-type'), stepBtn.getAttribute('data-step-target'));
          return;
        }

        var diffBtn = e.target.closest('[data-mod-diff]');
        if (diffBtn) {
          self._moduleDifficulty = diffBtn.getAttribute('data-mod-diff');
          self.render();
          return;
        }

        var openModBtn = e.target.closest('[data-open-module]');
        if (openModBtn && root.App && root.App.navigateToModule) {
          root.App.navigateToModule(openModBtn.getAttribute('data-open-module'));
          return;
        }
      });

      container.addEventListener('change', function(e) {
        var checkInput = e.target.closest('[data-toggle-node-slug]');
        if (checkInput && root.Progress) {
          var slug = checkInput.getAttribute('data-toggle-node-slug');
          root.Progress.toggleComplete(slug);
          self.render();
        }
      });

      container.addEventListener('input', function(e) {
        if (e.target && e.target.id === 'roadmap-module-search') {
          self._moduleSearch = e.target.value;
          var target = container.querySelector('#roadmap-mount-target');
          if (target) {
            target.innerHTML = self._renderModulesTab(root.ROADMAP_DATA || {});
            var searchEl = container.querySelector('#roadmap-module-search');
            if (searchEl) {
              searchEl.focus();
              searchEl.setSelectionRange(searchEl.value.length, searchEl.value.length);
            }
          }
        }
      });

      // Pointer drag panning on SVG viewport
      container.addEventListener('mousedown', function(e) {
        var vp = e.target.closest('#roadmap-svg-viewport');
        if (!vp || e.target.closest('.roadmap-node')) return;
        self._isPanning = true;
        self._panStartX = e.clientX - self._panX;
        self._panStartY = e.clientY - self._panY;
      });

      container.addEventListener('mousemove', function(e) {
        if (!self._isPanning) return;
        self._panX = e.clientX - self._panStartX;
        self._panY = e.clientY - self._panStartY;
        self._updatePanZoomDOM();
      });

      container.addEventListener('mouseup', function() {
        self._isPanning = false;
      });
    }
  };

  if (root && typeof root === 'object') {
    root.RoadmapController = RoadmapController;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
