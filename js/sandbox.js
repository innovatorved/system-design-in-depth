/**
 * System Design in Depth — Interactive Whiteboard & Capacity Sandbox Controller
 * Handles /sandbox view: Interactive architecture whiteboard and capacity calculation sandbox.
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

  var SandboxController = {
    _container: null,
    _activeBlueprintId: 'url-shortener',
    _nodes: [],
    _connections: [],
    _inputs: {
      qps: 50000,
      readWriteRatio: 100,
      avgReadPayloadBytes: 256,
      avgWritePayloadBytes: 512,
      cacheHitRate: 0.90,
      storageRetentionDays: 1825,
      replicationFactor: 3
    },
    _selectedNodeId: null,
    _connectMode: false,
    _connectSourceId: null,
    _draggingNodeId: null,
    _dragOffsetX: 0,
    _dragOffsetY: 0,

    mount: function(container, options) {
      this._container = container;
      if (!container) return;
      options = options || {};
      var bpId = options.blueprintId || 'url-shortener';
      this.loadBlueprint(bpId, false);
      this.render();
      this._bindEvents();
    },

    unmount: function(container) {
      if (this._container) {
        this._container.innerHTML = '';
        this._container = null;
      }
      this._draggingNodeId = null;
    },

    _getData: function() {
      return root.WHITEBOARD_DATA || { buildingBlocks: [], blueprints: [], calculateCapacity: function() { return { bottlenecks: [] }; } };
    },

    loadBlueprint: function(bpId, shouldRender) {
      var data = this._getData();
      var bps = data.blueprints || [];
      var found = null;
      for (var i = 0; i < bps.length; i++) {
        if (bps[i].id === bpId) {
          found = bps[i];
          break;
        }
      }
      if (!found && bps.length > 0) found = bps[0];

      if (found) {
        this._activeBlueprintId = found.id;
        this._nodes = (found.nodes || []).map(function(n) {
          return { id: n.id, type: n.type, name: n.name, x: n.x, y: n.y };
        });
        this._connections = (found.connections || []).map(function(c) {
          return { from: c.from, to: c.to, label: c.label || '' };
        });
        var def = found.defaultInputs || {};
        this._inputs = {
          qps: def.qps != null ? def.qps : 50000,
          readWriteRatio: def.readWriteRatio != null ? def.readWriteRatio : 100,
          avgReadPayloadBytes: def.avgReadPayloadBytes != null ? def.avgReadPayloadBytes : 256,
          avgWritePayloadBytes: def.avgWritePayloadBytes != null ? def.avgWritePayloadBytes : 512,
          cacheHitRate: def.cacheHitRate != null ? def.cacheHitRate : 0.90,
          storageRetentionDays: def.storageRetentionDays != null ? def.storageRetentionDays : 365,
          replicationFactor: def.replicationFactor != null ? def.replicationFactor : 3
        };
      }
      this._selectedNodeId = null;
      this._connectSourceId = null;
      if (shouldRender !== false) this.render();
    },

    addBlock: function(blockType) {
      var data = this._getData();
      var blockMeta = (data.buildingBlocks || []).find(function(b) { return b.type === blockType; });
      var name = blockMeta ? blockMeta.name : blockType;
      var count = this._nodes.length;
      var newNode = {
        id: 'node-' + Date.now() + '-' + count,
        type: blockType,
        name: name,
        x: 120 + ((count * 95) % 760),
        y: 90 + ((count * 75) % 280)
      };
      this._nodes.push(newNode);
      this._selectedNodeId = newNode.id;
      this.render();
      return newNode;
    },

    render: function() {
      if (!this._container) return;
      var data = this._getData();
      var blocks = data.buildingBlocks || [];
      var bps = data.blueprints || [];
      var cap = typeof data.calculateCapacity === 'function' ? data.calculateCapacity(this._inputs) : { bottlenecks: [] };

      var self = this;
      var bpButtonsHtml = bps.map(function(bp) {
        return (
          '<button class="eco-filter-pill ' + (self._activeBlueprintId === bp.id ? 'active' : '') + '" data-load-blueprint="' + escapeHtml(bp.id) + '">' +
            escapeHtml(bp.title.split(' (')[0]) +
          '</button>'
        );
      }).join('');

      var paletteHtml = blocks.map(function(b) {
        return (
          '<button class="sandbox-block-btn" data-add-block="' + escapeHtml(b.type) + '" title="' + escapeHtml(b.description) + '">' +
            '<span class="block-color-dot" style="background:' + escapeHtml(b.color) + '"></span>' +
            '<div class="block-btn-info">' +
              '<strong>' + escapeHtml(b.type) + '</strong>' +
              '<span>' + escapeHtml(b.badge) + '</span>' +
            '</div>' +
            '<span class="block-add-plus">+</span>' +
          '</button>'
        );
      }).join('');

      var svgCanvasHtml = this._renderWhiteboardSvg(blocks);
      var capacityPanelHtml = this._renderCapacityEstimator(cap);

      this._container.innerHTML =
        '<div class="view-canvas sandbox-view">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div class="view-header__content">' +
                '<div class="view-badge-row">' +
                  '<span class="eco-pill eco-pill--accent">Interactive Topology Canvas</span>' +
                  '<span class="eco-pill">' + blocks.length + ' Building Blocks</span>' +
                  '<span class="eco-pill">' + this._nodes.length + ' Active Nodes</span>' +
                  '<span class="eco-pill">' + this._connections.length + ' Edges</span>' +
                '</div>' +
                '<h1 class="view-title">Architecture Whiteboard &amp; Capacity Sandbox</h1>' +
                '<p class="view-subtitle">Design distributed topologies with 12 building blocks or load reference blueprints with live capacity and bottleneck estimation.</p>' +
              '</div>' +
            '</div>' +
            '<div class="sandbox-blueprint-bar">' +
              '<div class="eco-filter-group">' +
                '<span class="toolbar-label">Reference Blueprints:</span>' +
                bpButtonsHtml +
              '</div>' +
              '<div class="sandbox-canvas-actions">' +
                '<button class="eco-btn eco-btn--sm ' + (this._connectMode ? 'eco-btn--primary' : '') + '" data-sandbox-action="toggle-connect">' +
                  (this._connectMode ? '🔗 Connect Mode: ON (Click 2 Nodes)' : '🔗 Connect Nodes') +
                '</button>' +
                '<button class="eco-btn eco-btn--sm" data-sandbox-action="clear-canvas">Clear Canvas</button>' +
              '</div>' +
            '</div>' +
          '</header>' +
          '<main class="view-body" id="sandbox-mount-target">' +
            '<div class="sandbox-workspace">' +
              '<aside class="sandbox-palette">' +
                '<h3 class="inspector-subtitle">12 Building Blocks (Click to Add)</h3>' +
                '<div class="sandbox-palette-list">' + paletteHtml + '</div>' +
              '</aside>' +
              '<section class="sandbox-canvas-wrapper">' +
                svgCanvasHtml +
              '</section>' +
            '</div>' +
            capacityPanelHtml +
          '</main>' +
        '</div>';
    },

    _renderWhiteboardSvg: function(blocks) {
      var blockColorMap = {};
      blocks.forEach(function(b) { blockColorMap[b.type] = b.color || '#3291ff'; });

      var nodeMap = {};
      this._nodes.forEach(function(n) { nodeMap[n.id] = n; });

      var edgesSvg = this._connections.map(function(c, idx) {
        var src = nodeMap[c.from];
        var tgt = nodeMap[c.to];
        if (!src || !tgt) return '';
        var x1 = src.x + 80;
        var y1 = src.y + 30;
        var x2 = tgt.x + 80;
        var y2 = tgt.y + 30;
        var mx = Math.round((x1 + x2) / 2);
        var my = Math.round((y1 + y2) / 2) - 6;
        return (
          '<g class="wb-edge" data-edge-index="' + idx + '">' +
            '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="var(--fg-muted)" stroke-width="2" marker-end="url(#wb-arrow)" />' +
            (c.label ? '<text x="' + mx + '" y="' + my + '" text-anchor="middle" fill="var(--fg-muted)" font-size="10" font-weight="600">' + escapeHtml(c.label) + '</text>' : '') +
          '</g>'
        );
      }).join('');

      var self = this;
      var nodesSvg = this._nodes.map(function(n) {
        var color = blockColorMap[n.type] || '#3291ff';
        var isSelected = self._selectedNodeId === n.id || self._connectSourceId === n.id;
        var labelShort = (n.name || n.type).length > 22 ? (n.name || n.type).slice(0, 20) + '…' : (n.name || n.type);
        return (
          '<g class="wb-node ' + (isSelected ? 'selected' : '') + '" data-wb-node-id="' + escapeHtml(n.id) + '" data-wb-node-type="' + escapeHtml(n.type) + '" transform="translate(' + n.x + ',' + n.y + ')" style="cursor:grab;">' +
            '<rect width="160" height="58" rx="8" fill="var(--bg)" stroke="' + (isSelected ? '#3291ff' : color) + '" stroke-width="' + (isSelected ? '2.5' : '1.5') + '" />' +
            '<rect x="0" y="0" width="6" height="58" rx="3" fill="' + color + '" />' +
            '<text x="16" y="21" fill="' + color + '" font-size="9.5" font-weight="700" letter-spacing="0.04em">' + escapeHtml(n.type.toUpperCase()) + '</text>' +
            '<text x="16" y="40" fill="var(--fg)" font-size="11.5" font-weight="600">' + escapeHtml(labelShort) + '</text>' +
          '</g>'
        );
      }).join('');

      return (
        '<div class="wb-canvas-surface" id="wb-canvas-surface">' +
          '<svg class="wb-svg" id="wb-svg-canvas" viewBox="0 0 1180 470" width="100%" height="470">' +
            '<defs>' +
              '<pattern id="wb-grid" width="24" height="24" patternUnits="userSpaceOnUse">' +
                '<circle cx="2" cy="2" r="1" fill="var(--border)" />' +
              '</pattern>' +
              '<marker id="wb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
                '<path d="M 0 1 L 10 5 L 0 9 z" fill="var(--fg-muted)" />' +
              '</marker>' +
            '</defs>' +
            '<rect width="100%" height="100%" fill="url(#wb-grid)" />' +
            '<g id="wb-edges-layer">' + edgesSvg + '</g>' +
            '<g id="wb-nodes-layer">' + nodesSvg + '</g>' +
          '</svg>' +
        '</div>'
      );
    },

    _renderCapacityEstimator: function(cap) {
      var inp = this._inputs;
      var bottlenecks = cap.bottlenecks || [];

      var bottlenecksHtml = bottlenecks.length > 0 ? bottlenecks.map(function(b) {
        return (
          '<div class="bottleneck-alert bottleneck--' + escapeHtml(b.severity) + '">' +
            '<div class="bottleneck-header">' +
              '<span class="eco-pill ' + (b.severity === 'critical' ? 'eco-pill--danger' : 'tier--medium') + '">' + escapeHtml(b.severity.toUpperCase()) + '</span>' +
              '<strong>' + escapeHtml(b.component) + ': ' + escapeHtml(b.title) + '</strong>' +
            '</div>' +
            '<p>' + escapeHtml(b.message) + '</p>' +
          '</div>'
        );
      }).join('') : '<div class="bottleneck-alert bottleneck--healthy">✓ No architectural bottlenecks detected at current workload parameters.</div>';

      return (
        '<section class="sandbox-capacity-section eco-card" id="sandbox-capacity-panel">' +
          '<h2 class="eco-card__title">Live Back-of-the-Envelope Capacity Estimator &amp; Bottleneck Analyzer</h2>' +
          '<div class="sandbox-capacity-grid">' +
            '<div class="capacity-controls-col">' +
              '<div class="cap-field">' +
                '<label for="sb-input-qps">Total Traffic (QPS)</label>' +
                '<input type="number" class="eco-number-input" id="sb-input-qps" data-sb-input="qps" value="' + inp.qps + '" min="100" step="1000" />' +
              '</div>' +
              '<div class="cap-field">' +
                '<label for="sb-input-ratio">Read : Write Ratio (N:1)</label>' +
                '<input type="number" class="eco-number-input" id="sb-input-ratio" data-sb-input="readWriteRatio" value="' + inp.readWriteRatio + '" min="1" step="5" />' +
              '</div>' +
              '<div class="cap-field">' +
                '<label for="sb-input-read-bytes">Avg Read Payload (Bytes)</label>' +
                '<input type="number" class="eco-number-input" id="sb-input-read-bytes" data-sb-input="avgReadPayloadBytes" value="' + inp.avgReadPayloadBytes + '" min="64" step="128" />' +
              '</div>' +
              '<div class="cap-field">' +
                '<label for="sb-input-write-bytes">Avg Write Payload (Bytes)</label>' +
                '<input type="number" class="eco-number-input" id="sb-input-write-bytes" data-sb-input="avgWritePayloadBytes" value="' + inp.avgWritePayloadBytes + '" min="64" step="128" />' +
              '</div>' +
              '<div class="cap-field">' +
                '<label for="sb-input-hit-rate">Cache Hit Ratio (0.0 – 0.99)</label>' +
                '<input type="number" class="eco-number-input" id="sb-input-hit-rate" data-sb-input="cacheHitRate" value="' + inp.cacheHitRate + '" min="0" max="0.99" step="0.05" />' +
              '</div>' +
              '<div class="cap-field">' +
                '<label for="sb-input-retention">Retention (Days) / Replication (' + inp.replicationFactor + 'x)</label>' +
                '<input type="number" class="eco-number-input" id="sb-input-retention" data-sb-input="storageRetentionDays" value="' + inp.storageRetentionDays + '" min="1" step="30" />' +
              '</div>' +
            '</div>' +

            '<div class="capacity-metrics-col">' +
              '<div class="eco-grid eco-grid--3 cap-kpi-grid">' +
                '<div class="telemetry-kpi"><span>Read / Write QPS</span><strong id="sb-out-rw-qps">' + (cap.readQps || 0).toLocaleString() + ' / ' + (cap.writeQps || 0).toLocaleString() + '</strong></div>' +
                '<div class="telemetry-kpi"><span>Origin DB QPS</span><strong id="sb-out-db-qps">' + (cap.dbTotalQps || 0).toLocaleString() + ' QPS</strong></div>' +
                '<div class="telemetry-kpi"><span>Cache Offload</span><strong id="sb-out-cache-qps">' + (cap.cacheHitQps || 0).toLocaleString() + ' QPS</strong></div>' +
                '<div class="telemetry-kpi"><span>Network Egress / Ingress</span><strong id="sb-out-bandwidth">' + (cap.egressMbps || 0) + ' / ' + (cap.ingressMbps || 0) + ' Mbps</strong></div>' +
                '<div class="telemetry-kpi"><span>Daily Replicated Storage</span><strong id="sb-out-daily-storage">' + (cap.dailyStorageGb || 0) + ' GB/day</strong></div>' +
                '<div class="telemetry-kpi"><span>Total Retained Storage</span><strong id="sb-out-total-storage">' + (cap.totalStorageTb || 0) + ' TB</strong></div>' +
              '</div>' +
              '<div class="bottlenecks-box" id="sb-bottlenecks-list">' +
                '<h4>Real-Time Bottleneck &amp; Failure Mode Detection</h4>' +
                bottlenecksHtml +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    },

    _bindEvents: function() {
      var self = this;
      var container = this._container;
      if (!container) return;

      container.addEventListener('click', function(e) {
        var bpBtn = e.target.closest('[data-load-blueprint]');
        if (bpBtn) {
          var bpId = bpBtn.getAttribute('data-load-blueprint');
          self.loadBlueprint(bpId, true);
          return;
        }

        var addBlockBtn = e.target.closest('[data-add-block]');
        if (addBlockBtn) {
          self.addBlock(addBlockBtn.getAttribute('data-add-block'));
          return;
        }

        var actBtn = e.target.closest('[data-sandbox-action]');
        if (actBtn) {
          var act = actBtn.getAttribute('data-sandbox-action');
          if (act === 'clear-canvas') {
            self._nodes = [];
            self._connections = [];
            self._selectedNodeId = null;
            self.render();
          } else if (act === 'toggle-connect') {
            self._connectMode = !self._connectMode;
            self._connectSourceId = null;
            self.render();
          }
          return;
        }

        var wbNode = e.target.closest('.wb-node');
        if (wbNode) {
          var nId = wbNode.getAttribute('data-wb-node-id');
          if (self._connectMode) {
            if (!self._connectSourceId) {
              self._connectSourceId = nId;
              self.render();
            } else if (self._connectSourceId !== nId) {
              self._connections.push({ from: self._connectSourceId, to: nId, label: 'RPC / Stream' });
              self._connectSourceId = null;
              self._connectMode = false;
              self.render();
            }
          } else {
            self._selectedNodeId = nId;
          }
        }
      });

      container.addEventListener('input', function(e) {
        var sbInp = e.target.closest('[data-sb-input]');
        if (sbInp) {
          var key = sbInp.getAttribute('data-sb-input');
          self._inputs[key] = Number(sbInp.value);
          var data = self._getData();
          var cap = data.calculateCapacity(self._inputs);
          var panel = container.querySelector('#sandbox-capacity-panel');
          if (panel) {
            var activeId = sbInp.id;
            var wrapper = document.createElement('div');
            wrapper.innerHTML = self._renderCapacityEstimator(cap);
            panel.replaceWith(wrapper.firstElementChild);
            var restored = container.querySelector('#' + activeId);
            if (restored) restored.focus();
          }
        }
      });

      // Node dragging on SVG
      container.addEventListener('mousedown', function(e) {
        var wbNode = e.target.closest('.wb-node');
        if (!wbNode || self._connectMode) return;
        var nId = wbNode.getAttribute('data-wb-node-id');
        var nodeObj = self._nodes.find(function(n) { return n.id === nId; });
        if (!nodeObj) return;
        self._draggingNodeId = nId;
        self._dragOffsetX = e.clientX - nodeObj.x;
        self._dragOffsetY = e.clientY - nodeObj.y;
      });

      container.addEventListener('mousemove', function(e) {
        if (!self._draggingNodeId) return;
        var nodeObj = self._nodes.find(function(n) { return n.id === self._draggingNodeId; });
        if (!nodeObj) return;
        nodeObj.x = Math.max(10, Math.min(1000, e.clientX - self._dragOffsetX));
        nodeObj.y = Math.max(10, Math.min(400, e.clientY - self._dragOffsetY));
        var g = container.querySelector('.wb-node[data-wb-node-id="' + self._draggingNodeId + '"]');
        if (g) g.setAttribute('transform', 'translate(' + nodeObj.x + ',' + nodeObj.y + ')');
      });

      container.addEventListener('mouseup', function() {
        if (self._draggingNodeId) {
          self._draggingNodeId = null;
          self.render();
        }
      });
    }
  };

  if (root && typeof root === 'object') {
    root.SandboxController = SandboxController;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
