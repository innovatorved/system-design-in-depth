/**
 * System Design in Depth — Interactive Excalidraw-Style Architecture Whiteboard & Capacity Studio
 * Handles /sandbox view:
 * - Multi-Board Tabs (+ New Board, Switch, Rename, Duplicate, Close, localStorage persistence)
 * - Excalidraw-Style Floating Tool Dock: Select (V), Pan (H), Connect (C), Zone Frame (F), Sticky Note (T), Freehand Sketch (P), Undo/Redo, Delete
 * - Exact SVG CTM Coordinate Conversion, 60fps Node/Frame/Note Dragging with Live Edge Updates, Palette HTML5 Drag-and-Drop
 * - 4-Sided Node Connection Ports with Rubber-Band Arrow Preview
 * - Element Inspector (Rename, Replica Scaling, Protocol Labels, Delete) + Live Capacity & Bottleneck Analyzer
 */
(function(root) {
  'use strict';

  var STORAGE_KEY = 'sd_sandbox_boards_v2';

  var BLUEPRINT_ALIASES = {
    'payment-system': 'stripe-ledger',
    'uber-dispatch': 'uber-geo-dispatch',
    'kafka-event-pipeline': 'twitter-feed',
    'case-url-shortener': 'url-shortener',
    'case-social-feed': 'twitter-feed',
    'case-chat-system': 'whatsapp-chat',
    'case-payment-ledger': 'stripe-ledger',
    'case-ride-sharing': 'uber-geo-dispatch',
    'case-video-streaming': 'youtube-video-cdn',
    'case-rate-limiter': 'distributed-rate-limiter',
    'case-notification-service': 'notification-pipeline',
    'case-web-crawler': 'web-crawler',
    'case-llm-inference-gateway': 'ai-rag-gateway',
    'case-rag-pipeline': 'ai-rag-gateway'
  };

  var NODE_TYPE_TO_CODELAB = {
    gateway: 'sliding-window-rate-limiter',
    APIGateway: 'sliding-window-rate-limiter',
    lb: 'consistent-hashing-ring',
    L4LB: 'consistent-hashing-ring',
    L7LB: 'load-balancer-from-scratch',
    cache: 'lru-cache',
    RedisCache: 'lru-cache',
    cdn: 'ttl-cache-reaper',
    CDN: 'ttl-cache-reaper',
    db: 'lsm-tree-kv-store',
    SQLShard: 'lsm-tree-kv-store',
    NoSQLKV: 'lsm-tree-kv-store',
    search: 'tiny-search-engine',
    queue: 'mini-kafka-log',
    KafkaQueue: 'mini-kafka-log',
    worker: 'circuit-breaker',
    WorkerPool: 'circuit-breaker',
    storage: 'write-ahead-log',
    ObjectStorage: 'write-ahead-log',
    service: 'singleflight-coalescer',
    Microservice: 'singleflight-coalescer'
  };

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var SandboxController = {
    _container: null,
    _abortController: null,

    // Multi-board tab state
    _boards: [],
    _activeBoardId: null,
    _lastQueryBlueprint: null,
    _simMetrics: null,

    // Active canvas state (synced with active board)
    _activeBlueprintId: 'url-shortener',
    _nodes: [],
    _connections: [],
    _frames: [],
    _notes: [],
    _sketches: [],
    _inputs: {
      qps: 50000,
      readWriteRatio: 100,
      avgReadPayloadBytes: 256,
      avgWritePayloadBytes: 512,
      cacheHitRate: 0.90,
      storageRetentionDays: 1825,
      replicationFactor: 3
    },

    // Excalidraw tool & viewport state
    _activeTool: 'select', // select | pan | connect | frame | note | draw
    _connectMode: false,
    _connectSourceId: null,
    _selectedNodeId: null,
    _selectedItem: null, // { kind: 'node'|'edge'|'frame'|'note'|'sketch', id: string|number }
    _zoom: 1,
    _panX: 0,
    _panY: 0,

    // Interaction / pointer drag state
    _interaction: null,
    _hasDragged: false,

    _getQueryBlueprintId: function() {
      try {
        if (root.location && root.location.search) {
          var params = new URLSearchParams(root.location.search);
          var bp = params.get('blueprint') || params.get('bp');
          if (bp) return BLUEPRINT_ALIASES[bp] || bp;
        }
      } catch (e) {}
      return null;
    },

    mount: function(container, options) {
      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }
      this._container = container;
      if (!container) return;
      options = options || {};
      var queryBp = this._getQueryBlueprintId();
      var requestedBp = options.blueprintId || queryBp || null;
      if (requestedBp && BLUEPRINT_ALIASES[requestedBp]) {
        requestedBp = BLUEPRINT_ALIASES[requestedBp];
      }
      if (queryBp) {
        this._lastQueryBlueprint = queryBp;
      }

      this._initBoards(requestedBp || 'url-shortener', Boolean(requestedBp));
      this.render();
      this._bindEvents();
    },

    _ensureInitialized: function() {
      var queryBp = this._getQueryBlueprintId();
      if (!this._boards || this._boards.length === 0) {
        this._initBoards(queryBp || 'url-shortener', Boolean(queryBp));
      } else if (queryBp && queryBp !== this._lastQueryBlueprint) {
        this._lastQueryBlueprint = queryBp;
        this._loadBlueprint(queryBp, false);
      }
    },

    _loadBlueprint: function(bpId, shouldRender) {
      return this.loadBlueprint(bpId, shouldRender);
    },

    unmount: function() {
      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }
      if (this._container) {
        this._container.innerHTML = '';
        this._container = null;
      }
      this._interaction = null;
    },

    _getData: function() {
      return root.WHITEBOARD_DATA || {
        buildingBlocks: [],
        blueprints: [],
        calculateCapacity: function() { return { bottlenecks: [] }; }
      };
    },

    _findBlueprint: function(bpId) {
      if (bpId && BLUEPRINT_ALIASES[bpId]) bpId = BLUEPRINT_ALIASES[bpId];
      var data = this._getData();
      var bps = data.blueprints || [];
      for (var i = 0; i < bps.length; i++) {
        if (bps[i].id === bpId) return bps[i];
      }
      return bps[0] || null;
    },

    _createBoardFromBlueprint: function(bpId, customTitle) {
      var found = this._findBlueprint(bpId);
      var id = 'board-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      if (!found) {
        return {
          id: id,
          title: customTitle || 'Untitled Architecture',
          blueprintId: 'custom',
          nodes: [],
          connections: [],
          frames: [],
          notes: [],
          sketches: [],
          inputs: {
            qps: 25000,
            readWriteRatio: 20,
            avgReadPayloadBytes: 512,
            avgWritePayloadBytes: 1024,
            cacheHitRate: 0.85,
            storageRetentionDays: 365,
            replicationFactor: 3
          },
          history: [],
          future: []
        };
      }

      var shortTitle = found.title.split(' (')[0];
      var def = found.defaultInputs || {};
      return {
        id: id,
        title: customTitle || shortTitle,
        blueprintId: found.id,
        nodes: (found.nodes || []).map(function(n) {
          var rep = n.replicas || n.instances || 2;
          return {
            id: n.id,
            type: n.type,
            name: n.name,
            x: n.x,
            y: n.y,
            replicas: rep,
            instances: rep
          };
        }),
        connections: (found.connections || []).map(function(c, i) {
          return {
            id: c.id || ('edge-' + i + '-' + c.from + '-' + c.to),
            from: c.from,
            to: c.to,
            label: c.label || '',
            dashed: Boolean(c.dashed)
          };
        }),
        frames: (found.frames || []).map(function(f) {
          return {
            id: f.id,
            label: f.label,
            x: f.x,
            y: f.y,
            width: f.width || 320,
            height: f.height || 220
          };
        }),
        notes: (found.notes || []).map(function(nt) {
          return {
            id: nt.id,
            text: nt.text,
            x: nt.x,
            y: nt.y
          };
        }),
        sketches: [],
        inputs: {
          qps: def.qps != null ? def.qps : 50000,
          readWriteRatio: def.readWriteRatio != null ? def.readWriteRatio : 100,
          avgReadPayloadBytes: def.avgReadPayloadBytes != null ? def.avgReadPayloadBytes : 256,
          avgWritePayloadBytes: def.avgWritePayloadBytes != null ? def.avgWritePayloadBytes : 512,
          cacheHitRate: def.cacheHitRate != null ? def.cacheHitRate : 0.90,
          storageRetentionDays: def.storageRetentionDays != null ? def.storageRetentionDays : 365,
          replicationFactor: def.replicationFactor != null ? def.replicationFactor : 3
        },
        history: [],
        future: []
      };
    },

    _initBoards: function(defaultBpId, forceBlueprintLoad) {
      var loaded = null;
      try {
        var raw = root.localStorage && root.localStorage.getItem(STORAGE_KEY);
        if (raw) loaded = JSON.parse(raw);
      } catch (e) {}

      if (loaded && Array.isArray(loaded.boards) && loaded.boards.length > 0) {
        this._boards = loaded.boards;
        this._activeBoardId = loaded.activeBoardId || this._boards[0].id;
        if (forceBlueprintLoad && defaultBpId) {
          var existing = this._boards.find(function(b) { return b.blueprintId === defaultBpId; });
          if (existing) {
            this._activeBoardId = existing.id;
          } else {
            this._syncFromActiveBoard();
            this.loadBlueprint(defaultBpId, false);
            return;
          }
        }
        this._syncFromActiveBoard();
      } else {
        var firstBoard = this._createBoardFromBlueprint(defaultBpId || 'url-shortener');
        this._boards = [firstBoard];
        this._activeBoardId = firstBoard.id;
        this._syncFromActiveBoard();
        this._saveBoards();
      }
    },

    _getActiveBoard: function() {
      var self = this;
      var b = this._boards.find(function(item) { return item.id === self._activeBoardId; });
      if (!b && this._boards.length > 0) {
        b = this._boards[0];
        this._activeBoardId = b.id;
      }
      return b || null;
    },

    _syncFromActiveBoard: function() {
      var b = this._getActiveBoard();
      if (!b) return;
      this._activeBlueprintId = b.blueprintId || 'url-shortener';
      this._nodes = b.nodes || [];
      this._connections = b.connections || [];
      this._frames = b.frames || [];
      this._notes = b.notes || [];
      this._sketches = b.sketches || [];
      this._inputs = b.inputs || this._inputs;
      this._selectedNodeId = null;
      this._selectedItem = null;
      this._connectSourceId = null;
    },

    _syncToActiveBoard: function() {
      var b = this._getActiveBoard();
      if (!b) return;
      b.blueprintId = this._activeBlueprintId;
      b.nodes = this._nodes;
      b.connections = this._connections;
      b.frames = this._frames;
      b.notes = this._notes;
      b.sketches = this._sketches;
      b.inputs = this._inputs;
      this._saveBoards();
    },

    _saveBoards: function() {
      try {
        if (!root.localStorage) return;
        var payload = {
          activeBoardId: this._activeBoardId,
          boards: this._boards.map(function(b) {
            return {
              id: b.id,
              title: b.title,
              blueprintId: b.blueprintId,
              nodes: b.nodes,
              connections: b.connections,
              frames: b.frames,
              notes: b.notes,
              sketches: b.sketches,
              inputs: b.inputs
            };
          })
        };
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
    },

    _pushHistory: function() {
      var b = this._getActiveBoard();
      if (!b) return;
      b.history = b.history || [];
      b.future = [];
      b.history.push(deepClone({
        nodes: this._nodes,
        connections: this._connections,
        frames: this._frames,
        notes: this._notes,
        sketches: this._sketches
      }));
      if (b.history.length > 40) b.history.shift();
    },

    undo: function() {
      var b = this._getActiveBoard();
      if (!b || !b.history || b.history.length === 0) return;
      b.future = b.future || [];
      b.future.push(deepClone({
        nodes: this._nodes,
        connections: this._connections,
        frames: this._frames,
        notes: this._notes,
        sketches: this._sketches
      }));
      var prev = b.history.pop();
      this._nodes = prev.nodes || [];
      this._connections = prev.connections || [];
      this._frames = prev.frames || [];
      this._notes = prev.notes || [];
      this._sketches = prev.sketches || [];
      this._selectedItem = null;
      this._selectedNodeId = null;
      this._syncToActiveBoard();
      this.render();
    },

    redo: function() {
      var b = this._getActiveBoard();
      if (!b || !b.future || b.future.length === 0) return;
      b.history = b.history || [];
      b.history.push(deepClone({
        nodes: this._nodes,
        connections: this._connections,
        frames: this._frames,
        notes: this._notes,
        sketches: this._sketches
      }));
      var next = b.future.pop();
      this._nodes = next.nodes || [];
      this._connections = next.connections || [];
      this._frames = next.frames || [];
      this._notes = next.notes || [];
      this._sketches = next.sketches || [];
      this._selectedItem = null;
      this._selectedNodeId = null;
      this._syncToActiveBoard();
      this.render();
    },

    // ── Multi-Board Tab Operations ─────────────────────────────
    createNewBoardTab: function(bpId, customTitle) {
      this._syncToActiveBoard();
      var boardNum = this._boards.length + 1;
      var newBoard;
      if (bpId && bpId !== 'blank') {
        newBoard = this._createBoardFromBlueprint(bpId, customTitle);
      } else {
        newBoard = {
          id: 'board-' + Date.now() + '-' + boardNum,
          title: customTitle || ('Architecture Board ' + boardNum),
          blueprintId: 'custom',
          nodes: [
            { id: 'n-client-' + boardNum, type: 'Client', name: 'Client App', x: 80, y: 180, replicas: 1 },
            { id: 'n-gw-' + boardNum, type: 'APIGateway', name: 'API Gateway', x: 310, y: 180, replicas: 2 },
            { id: 'n-svc-' + boardNum, type: 'Microservice', name: 'Core Service', x: 540, y: 180, replicas: 4 }
          ],
          connections: [
            { id: 'e-1', from: 'n-client-' + boardNum, to: 'n-gw-' + boardNum, label: 'HTTPS' },
            { id: 'e-2', from: 'n-gw-' + boardNum, to: 'n-svc-' + boardNum, label: 'gRPC' }
          ],
          frames: [
            { id: 'f-1', label: 'Core Service Boundary (VPC)', x: 285, y: 120, width: 435, height: 180 }
          ],
          notes: [],
          sketches: [],
          inputs: {
            qps: 25000,
            readWriteRatio: 20,
            avgReadPayloadBytes: 512,
            avgWritePayloadBytes: 1024,
            cacheHitRate: 0.85,
            storageRetentionDays: 365,
            replicationFactor: 3
          },
          history: [],
          future: []
        };
      }
      this._boards.push(newBoard);
      this._activeBoardId = newBoard.id;
      this._syncFromActiveBoard();
      this._saveBoards();
      this.render();
      return newBoard;
    },

    switchBoardTab: function(boardId) {
      if (boardId === this._activeBoardId) return;
      this._syncToActiveBoard();
      var found = this._boards.find(function(b) { return b.id === boardId; });
      if (!found) return;
      this._activeBoardId = found.id;
      this._syncFromActiveBoard();
      this._saveBoards();
      this.render();
    },

    closeBoardTab: function(boardId) {
      if (this._boards.length <= 1) {
        // Reset the single board to a clean state
        var fresh = this._createBoardFromBlueprint('url-shortener');
        this._boards = [fresh];
        this._activeBoardId = fresh.id;
        this._syncFromActiveBoard();
        this._saveBoards();
        this.render();
        return;
      }
      var idx = this._boards.findIndex(function(b) { return b.id === boardId; });
      if (idx === -1) return;
      this._boards.splice(idx, 1);
      if (this._activeBoardId === boardId) {
        var nextIdx = Math.max(0, idx - 1);
        this._activeBoardId = this._boards[nextIdx].id;
        this._syncFromActiveBoard();
      }
      this._saveBoards();
      this.render();
    },

    duplicateActiveBoardTab: function() {
      var cur = this._getActiveBoard();
      if (!cur) return;
      this._syncToActiveBoard();
      var copy = deepClone(cur);
      copy.id = 'board-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      copy.title = cur.title + ' (Copy)';
      copy.history = [];
      copy.future = [];
      this._boards.push(copy);
      this._activeBoardId = copy.id;
      this._syncFromActiveBoard();
      this._saveBoards();
      this.render();
    },

    loadBlueprint: function(bpId, shouldRender) {
      if (bpId && BLUEPRINT_ALIASES[bpId]) bpId = BLUEPRINT_ALIASES[bpId];
      var found = this._findBlueprint(bpId);
      if (!found) return;

      this._pushHistory();
      var fresh = this._createBoardFromBlueprint(found.id);
      this._activeBlueprintId = fresh.blueprintId;
      this._nodes = fresh.nodes;
      this._connections = fresh.connections;
      this._frames = fresh.frames;
      this._notes = fresh.notes;
      this._sketches = [];
      this._inputs = fresh.inputs;

      var activeBoard = this._getActiveBoard();
      if (activeBoard) {
        activeBoard.title = fresh.title;
      }
      this._selectedNodeId = null;
      this._selectedItem = null;
      this._connectSourceId = null;
      this._syncToActiveBoard();
      if (root.Progress && root.Progress.markComplete) {
        root.Progress.markComplete('sandbox:' + found.id);
      }
      if (shouldRender !== false) this.render();
    },

    // ── Canvas Element Creation & Deletion ─────────────────────
    addBlock: function(blockType, dropX, dropY) {
      this._pushHistory();
      var data = this._getData();
      var blockMeta = (data.buildingBlocks || []).find(function(b) { return b.type === blockType; });
      var name = blockMeta ? blockMeta.name : blockType;
      var count = this._nodes.length;
      var x = typeof dropX === 'number' ? Math.round(dropX - 75) : (120 + ((count * 95) % 760));
      var y = typeof dropY === 'number' ? Math.round(dropY - 29) : (90 + ((count * 75) % 280));
      var newNode = {
        id: 'node-' + Date.now() + '-' + count,
        type: blockType,
        name: name,
        x: Math.max(16, Math.min(1080, x)),
        y: Math.max(16, Math.min(410, y)),
        replicas: 2
      };
      this._nodes.push(newNode);
      this._selectedNodeId = newNode.id;
      this._selectedItem = { kind: 'node', id: newNode.id };
      this._syncToActiveBoard();
      this.render();
      return newNode;
    },

    addFrame: function(x, y, width, height) {
      this._pushHistory();
      var idx = this._frames.length + 1;
      var newFrame = {
        id: 'frame-' + Date.now() + '-' + idx,
        label: 'Zone / VPC Boundary ' + idx,
        x: Math.max(10, Math.round(x != null ? x : 180)),
        y: Math.max(10, Math.round(y != null ? y : 80)),
        width: Math.max(140, Math.round(width || 340)),
        height: Math.max(100, Math.round(height || 220))
      };
      this._frames.push(newFrame);
      this._selectedItem = { kind: 'frame', id: newFrame.id };
      this._selectedNodeId = null;
      this._activeTool = 'select';
      this._syncToActiveBoard();
      this.render();
      return newFrame;
    },

    addStickyNote: function(x, y, text) {
      this._pushHistory();
      var idx = this._notes.length + 1;
      var newNote = {
        id: 'note-' + Date.now() + '-' + idx,
        text: text || ('Design Note #' + idx + '\n• SLA / Trade-off invariant'),
        x: Math.max(16, Math.round(x != null ? x : 240)),
        y: Math.max(16, Math.round(y != null ? y : 140))
      };
      this._notes.push(newNote);
      this._selectedItem = { kind: 'note', id: newNote.id };
      this._selectedNodeId = null;
      this._activeTool = 'select';
      this._syncToActiveBoard();
      this.render();
      return newNote;
    },

    deleteSelected: function() {
      var item = this._selectedItem;
      if (!item && this._selectedNodeId) {
        item = { kind: 'node', id: this._selectedNodeId };
      }
      if (!item) return false;

      this._pushHistory();
      if (item.kind === 'node') {
        var targetId = item.id;
        this._nodes = this._nodes.filter(function(n) { return n.id !== targetId; });
        this._connections = this._connections.filter(function(c) {
          return c.from !== targetId && c.to !== targetId;
        });
      } else if (item.kind === 'edge') {
        var edgeIdx = Number(item.id);
        if (!isNaN(edgeIdx) && edgeIdx >= 0 && edgeIdx < this._connections.length) {
          this._connections.splice(edgeIdx, 1);
        }
      } else if (item.kind === 'frame') {
        this._frames = this._frames.filter(function(f) { return f.id !== item.id; });
      } else if (item.kind === 'note') {
        this._notes = this._notes.filter(function(nt) { return nt.id !== item.id; });
      } else if (item.kind === 'sketch') {
        this._sketches = this._sketches.filter(function(sk) { return sk.id !== item.id; });
      }

      this._selectedItem = null;
      this._selectedNodeId = null;
      this._syncToActiveBoard();
      this.render();
      return true;
    },

    autoLayout: function() {
      if (this._nodes.length === 0) return;
      this._pushHistory();
      var typeRank = {
        Client: 0,
        CDN: 1,
        L4LB: 1,
        L7LB: 2,
        APIGateway: 2,
        Microservice: 3,
        RedisCache: 4,
        SQLShard: 4,
        NoSQLKV: 4,
        KafkaQueue: 4,
        WorkerPool: 5,
        ObjectStorage: 5
      };
      var columns = {};
      this._nodes.forEach(function(n) {
        var col = typeRank[n.type] != null ? typeRank[n.type] : 3;
        if (!columns[col]) columns[col] = [];
        columns[col].push(n);
      });
      var sortedCols = Object.keys(columns).map(Number).sort(function(a, b) { return a - b; });
      sortedCols.forEach(function(colKey, colIdx) {
        var colNodes = columns[colKey];
        var x = 60 + colIdx * 205;
        colNodes.forEach(function(n, rowIdx) {
          n.x = Math.min(1060, x);
          n.y = 75 + rowIdx * 115;
        });
      });
      this._syncToActiveBoard();
      this.render();
    },

    exportSvgOrJson: function(format) {
      if (format === 'json') {
        var b = this._getActiveBoard();
        var dataStr = JSON.stringify(b || { nodes: this._nodes, connections: this._connections }, null, 2);
        this._triggerDownload(dataStr, (b ? b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'architecture') + '.json', 'application/json');
      } else if (format === 'svg' && this._container) {
        var svgEl = this._container.querySelector('#wb-svg-canvas');
        if (svgEl) {
          var svgMarkup = new XMLSerializer().serializeToString(svgEl);
          this._triggerDownload(svgMarkup, 'architecture-whiteboard.svg', 'image/svg+xml');
        }
      }
    },

    simulateActiveBoardInCodeLab: function() {
      var board = this._getActiveBoard();
      var title = (board && board.title) ? board.title : 'Architecture Topology';
      var nodes = (this._nodes || []).map(function(n, idx) {
        return {
          id: n.id,
          type: n.type || 'Microservice',
          name: n.name || (n.type + '-' + (idx + 1)),
          replicas: n.replicas || n.instances || 2,
          port: 3000 + idx
        };
      });
      var nodeById = {};
      nodes.forEach(function(n) { nodeById[n.id] = n; });
      var edges = (this._connections || []).map(function(c) {
        var s = nodeById[c.from];
        var t = nodeById[c.to];
        if (!s || !t) return null;
        return {
          fromId: s.id,
          toId: t.id,
          fromName: s.name,
          toName: t.name,
          fromPort: s.port,
          toPort: t.port,
          label: c.label || 'RPC'
        };
      }).filter(Boolean);

      var entryPort = nodes.length > 0 ? nodes[0].port : 3000;
      var clusterCode = [
        "const http = require('node:http');",
        "const { Database } = require('bun:sqlite');",
        "",
        "// Generated from Architecture Whiteboard: " + title,
        "const TOPOLOGY = " + JSON.stringify({ title: title, nodes: nodes, edges: edges }, null, 2) + ";",
        "",
        "const db = new Database('whiteboard-state.db');",
        "db.exec('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, node TEXT, port INTEGER, path TEXT, ts INTEGER)');",
        "",
        "function requestUpstream(targetPort, path, fromPort) {",
        "  return new Promise((resolve, reject) => {",
        "    const req = http.request({ hostname: 'localhost', port: targetPort, path, method: 'GET', _fromPort: fromPort }, (res) => {",
        "      let body = '';",
        "      res.on('data', (c) => (body += c));",
        "      res.on('end', () => resolve({ status: res.statusCode, body }));",
        "    });",
        "    req.on('error', reject);",
        "    req.end();",
        "  });",
        "}",
        "",
        "async function bootTopology() {",
        "  for (const node of TOPOLOGY.nodes) {",
        "    const outEdges = TOPOLOGY.edges.filter((e) => e.fromPort === node.port);",
        "    const srv = http.createServer(async (req, res) => {",
        "      db.query('INSERT INTO events (node, port, path, ts) VALUES (?, ?, ?, ?)').run(node.name, node.port, req.url || '/', Date.now());",
        "      const downstream = [];",
        "      for (const edge of outEdges) {",
        "        try {",
        "          const up = await requestUpstream(edge.toPort, req.url || '/hop', node.port);",
        "          downstream.push({ target: edge.toName, port: edge.toPort, protocol: edge.label, status: up.status });",
        "        } catch (err) {",
        "          downstream.push({ target: edge.toName, port: edge.toPort, error: err.code || err.message });",
        "        }",
        "      }",
        "      const failed = downstream.some((d) => d.error || d.status >= 500);",
        "      res.writeHead(failed ? 502 : 200, { 'content-type': 'application/json' });",
        "      res.end(JSON.stringify({ service: node.name, type: node.type, port: node.port, replicas: node.replicas, downstream }));",
        "    });",
        "    await new Promise((r) => srv.listen(node.port, r));",
        "    console.log('✓ [' + node.type + '] ' + node.name + ' listening on http://localhost:' + node.port);",
        "  }",
        "  console.log('\\n=== Live Topology Booted (' + TOPOLOGY.nodes.length + ' nodes, ' + TOPOLOGY.edges.length + ' edges) ===');",
        "  console.log('Try in terminal:');",
        "  console.log('  hey -n 40 -c 8 http://localhost:' + entryPort + '/api');",
        "  console.log('  chaos latency ' + (TOPOLOGY.nodes[1] ? TOPOLOGY.nodes[1].port : entryPort) + ' 200');",
        "  console.log('  sqlite3 -column -header whiteboard-state.db \"SELECT node, port, COUNT(*) AS hits FROM events GROUP BY node\"');",
        "}",
        "",
        "bootTopology();"
      ].join('\n') + '\n';

      var readme = [
        '# ' + title + ' — Live CodeLab Cluster Simulation',
        '',
        'Compiled directly from your **Architecture Whiteboard** (' + nodes.length + ' nodes, ' + edges.length + ' connections).',
        '',
        '### Quick Start',
        '1. Click **Run** (or run `node cluster.js &` in the terminal) to bind every whiteboard node to its own virtual loopback port (`:' + entryPort + '` .. `:' + (entryPort + Math.max(0, nodes.length - 1)) + '`).',
        '2. Open the **Ports** or **Network** tab in the bottom drawer to see the live **Service Topology Map**, **SLO Telemetry Bar**, and **1-Click Chaos Injection** controls (`+200ms`, `25% 503`, `Crash`).',
        '3. Benchmark with `hey -n 50 -c 10 http://localhost:' + entryPort + '/api`!'
      ].join('\n') + '\n';

      if (root.App && typeof root.App.openGlobalCodeLab === 'function') {
        root.App.openGlobalCodeLab({
          labId: 'whiteboard-' + (this._activeBlueprintId || 'cluster'),
          title: title + ' — Live Cluster Simulation',
          summary: 'Multi-node HTTP & SQLite topology compiled from the Architecture Whiteboard (' + nodes.length + ' services)',
          mode: 'sandbox',
          entry: 'cluster.js',
          files: {
            'cluster.js': clusterCode,
            'topology.json': JSON.stringify({ title: title, nodes: nodes, edges: edges }, null, 2) + '\n',
            'README.md': readme
          }
        });
      }
    },

    _triggerDownload: function(content, filename, mime) {
      try {
        var blob = new Blob([content], { type: mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {}
    },

    // ── Coordinate Helpers & Live DOM Edge Updates ─────────────
    _screenToSvg: function(clientX, clientY) {
      if (!this._container) return { x: clientX, y: clientY };
      var svg = this._container.querySelector('#wb-svg-canvas');
      if (!svg) return { x: clientX, y: clientY };
      var rect = svg.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return { x: clientX, y: clientY };
      var vbWidth = 1250 / this._zoom;
      var vbHeight = 500 / this._zoom;
      var vbX = this._panX;
      var vbY = this._panY;
      return {
        x: vbX + ((clientX - rect.left) / rect.width) * vbWidth,
        y: vbY + ((clientY - rect.top) / rect.height) * vbHeight
      };
    },

    _computeEdgeGeometry: function(src, tgt, idx) {
      var x1 = tgt.x > src.x + 110 ? src.x + 150 : (tgt.x + 150 < src.x ? src.x : src.x + 75);
      var y1 = tgt.x > src.x + 110 || tgt.x + 150 < src.x ? src.y + 29 : (tgt.y > src.y ? src.y + 58 : src.y);
      var x2 = tgt.x > src.x + 110 ? tgt.x : (tgt.x + 150 < src.x ? tgt.x + 150 : tgt.x + 75);
      var y2 = tgt.x > src.x + 110 || tgt.x + 150 < src.x ? tgt.y + 29 : (tgt.y > src.y ? tgt.y : tgt.y + 58);
      var dx = x2 - x1;
      var cx1 = Math.round(x1 + dx * 0.45);
      var cx2 = Math.round(x1 + dx * 0.55);
      var pathD = 'M ' + x1 + ' ' + y1 + ' C ' + cx1 + ' ' + y1 + ', ' + cx2 + ' ' + y2 + ', ' + x2 + ' ' + y2;

      var isHoriz = Math.abs(y2 - y1) < 30;
      var t = isHoriz ? 0.5 : (idx % 2 === 0 ? 0.36 : 0.64);
      var mt = 1 - t;
      var mx = Math.round(mt * mt * mt * x1 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x2);
      var my = isHoriz
        ? Math.min(src.y, tgt.y) - 10
        : Math.round(mt * mt * mt * y1 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y2);

      return { pathD: pathD, mx: mx, my: my };
    },

    _updateLiveEdgesDOM: function() {
      if (!this._container) return;
      var nodeMap = {};
      this._nodes.forEach(function(n) { nodeMap[n.id] = n; });
      var self = this;

      this._connections.forEach(function(c, idx) {
        var src = nodeMap[c.from];
        var tgt = nodeMap[c.to];
        if (!src || !tgt) return;
        var geom = self._computeEdgeGeometry(src, tgt, idx);
        var edgeGroup = self._container.querySelector('.wb-edge[data-edge-index="' + idx + '"]');
        if (edgeGroup) {
          var paths = edgeGroup.querySelectorAll('path');
          paths.forEach(function(p) { p.setAttribute('d', geom.pathD); });
        }
        var labelGroup = self._container.querySelector('.wb-edge-label[data-edge-label-index="' + idx + '"]');
        if (labelGroup) {
          var rect = labelGroup.querySelector('rect');
          var txt = labelGroup.querySelector('text');
          if (rect) {
            var w = Number(rect.getAttribute('width')) || 56;
            rect.setAttribute('x', Math.round(geom.mx - w / 2));
            rect.setAttribute('y', geom.my - 9);
          }
          if (txt) {
            txt.setAttribute('x', geom.mx);
            txt.setAttribute('y', geom.my + 2);
          }
        }
      });
    },

    // ── Rendering ──────────────────────────────────────────────
    render: function() {
      if (!this._container) return;
      this._ensureInitialized();
      var data = this._getData();
      var blocks = data.buildingBlocks || [];
      var bps = data.blueprints || [];
      var cap = typeof data.calculateCapacity === 'function' ? data.calculateCapacity(this._inputs) : { bottlenecks: [] };
      this._simMetrics = cap;
      var activeBoard = this._getActiveBoard();

      var self = this;

      // 1. Multi-Board Tab Bar
      var tabsHtml = this._boards.map(function(b) {
        var isActive = b.id === self._activeBoardId;
        var nodeCount = (b.nodes || []).length;
        return (
          '<div class="wb-tab ' + (isActive ? 'active' : '') + '" data-wb-tab="' + escapeHtml(b.id) + '" title="Switch to ' + escapeHtml(b.title) + ' (Double-click to rename)">' +
            '<span class="wb-tab__dot"></span>' +
            '<span class="wb-tab__title">' + escapeHtml(b.title) + '</span>' +
            '<span class="wb-tab__count">' + nodeCount + '</span>' +
            '<button class="wb-tab__close" data-wb-tab-close="' + escapeHtml(b.id) + '" title="Close board tab" aria-label="Close board tab">×</button>' +
          '</div>'
        );
      }).join('');

      // 2. Reference Blueprints Bar
      var bpButtonsHtml = bps.map(function(bp) {
        var shortName = bp.title.split(' (')[0];
        var isCurrent = self._activeBlueprintId === bp.id;
        return (
          '<div class="wb-bp-pill-group">' +
            '<button class="eco-filter-pill ' + (isCurrent ? 'active' : '') + '" data-load-blueprint="' + escapeHtml(bp.id) + '" title="Load ' + escapeHtml(bp.title) + ' into current tab">' +
              escapeHtml(shortName) +
            '</button>' +
            '<button class="wb-bp-newtab-btn" data-open-blueprint-tab="' + escapeHtml(bp.id) + '" title="Open ' + escapeHtml(shortName) + ' in a new board tab">+</button>' +
          '</div>'
        );
      }).join('');

      // 3. Left Palette (Draggable + Clickable)
      var paletteHtml = blocks.map(function(b) {
        return (
          '<button class="sandbox-block-btn" draggable="true" data-add-block="' + escapeHtml(b.type) + '" title="Click or drag onto canvas: ' + escapeHtml(b.description) + '">' +
            '<span class="block-color-dot" style="background:' + escapeHtml(b.color) + '"></span>' +
            '<div class="block-btn-info">' +
              '<strong>' + escapeHtml(b.type) + '</strong>' +
              '<span>' + escapeHtml(b.badge) + '</span>' +
            '</div>' +
            '<span class="block-add-plus">+</span>' +
          '</button>'
        );
      }).join('');

      // 4. Excalidraw-Style Floating Tool Dock + SVG Canvas + Right Inspector
      var floatingDockHtml = this._renderFloatingDock(activeBoard);
      var svgCanvasHtml = this._renderWhiteboardSvg(blocks);
      var inspectorHtml = this._renderInspectorPanel(blocks);
      var capacityPanelHtml = this._renderCapacityEstimator(cap);

      this._container.innerHTML =
        '<div class="view-canvas sandbox-view">' +
          '<header class="view-header">' +
            '<div class="view-header__top">' +
              '<div class="view-header__content">' +
                '<div class="view-badge-row">' +
                  '<span class="eco-pill eco-pill--accent">Excalidraw Architecture Studio</span>' +
                  '<span class="eco-pill">' + this._boards.length + (this._boards.length === 1 ? ' Open Board' : ' Open Boards') + '</span>' +
                  '<span class="eco-pill">' + this._nodes.length + ' Nodes</span>' +
                  '<span class="eco-pill">' + this._connections.length + ' Connections</span>' +
                  '<span class="eco-pill">' + this._frames.length + ' Zone Frames</span>' +
                '</div>' +
                '<h1 class="view-title">Architecture Whiteboard &amp; Capacity Studio</h1>' +
                '<p class="view-subtitle">Create multi-tab system topologies, drag blocks onto the canvas, connect ports, draw VPC zone boundaries, and simulate live QPS bottlenecks.</p>' +
              '</div>' +
            '</div>' +

            '<!-- Multi-Board Browser-Style Tab Bar -->' +
            '<div class="wb-tabs-bar" role="tablist" aria-label="Whiteboard Tabs">' +
              '<div class="wb-tabs-scroll">' +
                tabsHtml +
                '<button class="wb-tab-add" data-wb-tab-add="blank" title="Create a new whiteboard tab (+ New Board)">+ New Board</button>' +
                '<button class="wb-tab-action" data-sandbox-action="duplicate-board" title="Duplicate active board into a new tab">Duplicate Tab</button>' +
              '</div>' +
              '<div class="wb-tabs-meta">' +
                '<button class="eco-btn eco-btn--sm" data-sandbox-action="export-svg" title="Download SVG diagram">Export SVG</button>' +
                '<button class="eco-btn eco-btn--sm" data-sandbox-action="export-json" title="Download board JSON">Export JSON</button>' +
              '</div>' +
            '</div>' +

            '<!-- Blueprints & Quick Actions Bar -->' +
            '<div class="sandbox-blueprint-bar">' +
              '<div class="eco-filter-group">' +
                '<span class="toolbar-label">Reference Blueprints:</span>' +
                bpButtonsHtml +
              '</div>' +
              '<div class="sandbox-canvas-actions">' +
                '<button class="eco-btn eco-btn--sm eco-btn--primary" data-sandbox-action="simulate-cluster-codelab" title="Compile active whiteboard topology into a runnable multi-node cluster inside CodeLab">Simulate in CodeLab</button>' +
                '<button class="eco-btn eco-btn--sm ' + (this._connectMode || this._activeTool === 'connect' ? 'eco-btn--primary' : '') + '" data-sandbox-action="toggle-connect">' +
                  (this._connectMode || this._activeTool === 'connect' ? 'Connect Mode: ON' : 'Connect Nodes (C)') +
                '</button>' +
                '<button class="eco-btn eco-btn--sm" data-sandbox-action="auto-layout" title="Tidy and align nodes by tier">Auto-Layout</button>' +
                '<button class="eco-btn eco-btn--sm" data-sandbox-action="clear-canvas" title="Clear all elements on active board">Clear Canvas</button>' +
              '</div>' +
            '</div>' +
          '</header>' +

          '<main class="view-body" id="sandbox-mount-target">' +
            '<div class="sandbox-workspace">' +
              '<aside class="sandbox-palette">' +
                '<div class="sandbox-palette__header">' +
                  '<h3 class="inspector-subtitle">12 Building Blocks</h3>' +
                  '<span class="sandbox-palette__hint">Click or Drag to Canvas</span>' +
                '</div>' +
                '<div class="sandbox-palette-list">' + paletteHtml + '</div>' +
              '</aside>' +

              '<section class="sandbox-canvas-wrapper">' +
                floatingDockHtml +
                svgCanvasHtml +
                inspectorHtml +
              '</section>' +
            '</div>' +
            capacityPanelHtml +
          '</main>' +
        '</div>';
    },

    _renderFloatingDock: function(activeBoard) {
      var tool = this._connectMode ? 'connect' : this._activeTool;
      var hasSelection = Boolean(this._selectedItem || this._selectedNodeId);
      var canUndo = Boolean(activeBoard && activeBoard.history && activeBoard.history.length > 0);
      var canRedo = Boolean(activeBoard && activeBoard.future && activeBoard.future.length > 0);
      var zoomPct = Math.round(this._zoom * 100);

      return (
        '<div class="wb-floating-dock" role="toolbar" aria-label="Whiteboard Drawing Tools">' +
          '<div class="wb-dock-group">' +
            '<button class="wb-tool-btn ' + (tool === 'select' ? 'active' : '') + '" data-wb-tool="select" title="Select, Move &amp; Resize (V)">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>' +
              '<span>Select</span><kbd>V</kbd>' +
            '</button>' +
            '<button class="wb-tool-btn ' + (tool === 'pan' ? 'active' : '') + '" data-wb-tool="pan" title="Pan Canvas (H or Space+Drag)">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>' +
              '<span>Pan</span><kbd>H</kbd>' +
            '</button>' +
            '<button class="wb-tool-btn ' + (tool === 'connect' ? 'active' : '') + '" data-wb-tool="connect" title="Connect Nodes / Draw Directed Edge (C)">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
              '<span>Connect</span><kbd>C</kbd>' +
            '</button>' +
            '<button class="wb-tool-btn ' + (tool === 'frame' ? 'active' : '') + '" data-wb-tool="frame" title="Add VPC / Zone Boundary Frame (F)">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 2"/></svg>' +
              '<span>Zone Frame</span><kbd>F</kbd>' +
            '</button>' +
            '<button class="wb-tool-btn ' + (tool === 'note' ? 'active' : '') + '" data-wb-tool="note" title="Add Sticky Callout Note (T)">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
              '<span>Note</span><kbd>T</kbd>' +
            '</button>' +
            '<button class="wb-tool-btn ' + (tool === 'draw' ? 'active' : '') + '" data-wb-tool="draw" title="Freehand Sketch Ink (P)">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>' +
              '<span>Sketch</span><kbd>P</kbd>' +
            '</button>' +
          '</div>' +

          '<div class="wb-dock-divider"></div>' +

          '<div class="wb-dock-group">' +
            '<button class="wb-tool-btn" data-sandbox-action="undo" ' + (!canUndo ? 'disabled' : '') + ' title="Undo (⌘Z)">' +
              '<span>Undo</span>' +
            '</button>' +
            '<button class="wb-tool-btn" data-sandbox-action="redo" ' + (!canRedo ? 'disabled' : '') + ' title="Redo (⌘⇧Z)">' +
              '<span>Redo</span>' +
            '</button>' +
            '<button class="wb-tool-btn wb-tool-btn--danger" data-sandbox-action="delete-selected" ' + (!hasSelection ? 'disabled' : '') + ' title="Delete Selected Element (Delete / Backspace)">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
              '<span>Delete</span><kbd>⌫</kbd>' +
            '</button>' +
          '</div>' +

          '<div class="wb-dock-divider"></div>' +

          '<div class="wb-dock-group wb-dock-zoom">' +
            '<button class="wb-tool-btn" data-sandbox-action="zoom-out" title="Zoom Out">−</button>' +
            '<button class="wb-tool-btn wb-zoom-readout" data-sandbox-action="zoom-reset" title="Reset Zoom &amp; Pan">' + zoomPct + '%</button>' +
            '<button class="wb-tool-btn" data-sandbox-action="zoom-in" title="Zoom In">+</button>' +
          '</div>' +
        '</div>'
      );
    },

    _renderWhiteboardSvg: function(blocks) {
      var blockColorMap = {};
      blocks.forEach(function(b) { blockColorMap[b.type] = b.color || '#3291ff'; });

      var nodeMap = {};
      this._nodes.forEach(function(n) { nodeMap[n.id] = n; });

      var self = this;
      var sel = this._selectedItem;

      // 1. Zone Frames Layer (rendered behind nodes)
      var framesSvg = this._frames.map(function(f) {
        var isSelected = sel && sel.kind === 'frame' && sel.id === f.id;
        return (
          '<g class="wb-frame ' + (isSelected ? 'selected' : '') + '" data-wb-frame-id="' + escapeHtml(f.id) + '" transform="translate(' + f.x + ',' + f.y + ')">' +
            '<rect width="' + f.width + '" height="' + f.height + '" rx="8" fill="rgba(255,255,255,0.015)" stroke="' + (isSelected ? 'var(--fg)' : 'var(--border-strong)') + '" stroke-width="' + (isSelected ? '2' : '1.25') + '" stroke-dasharray="6 4" />' +
            '<rect x="10" y="-10" width="' + Math.max(90, Math.min(f.width - 20, f.label.length * 6.5 + 20)) + '" height="20" rx="4" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1" />' +
            '<text x="18" y="3" fill="var(--fg-muted)" font-family="var(--font-mono)" font-size="9.5" font-weight="600" letter-spacing="0.04em">' + escapeHtml(f.label.toUpperCase()) + '</text>' +
            '<rect class="wb-frame-resize" data-frame-resize="' + escapeHtml(f.id) + '" x="' + (f.width - 12) + '" y="' + (f.height - 12) + '" width="12" height="12" rx="2" fill="var(--border-focus)" style="cursor:nwse-resize;" />' +
          '</g>'
        );
      }).join('');

      // 2. Edges & Clickable Labels Layer
      var edgesSvg = [];
      var labelsSvg = [];
      this._connections.forEach(function(c, idx) {
        var src = nodeMap[c.from];
        var tgt = nodeMap[c.to];
        if (!src || !tgt) return;
        var geom = self._computeEdgeGeometry(src, tgt, idx);
        var isEdgeSelected = sel && sel.kind === 'edge' && Number(sel.id) === idx;
        var strokeColor = isEdgeSelected ? 'var(--fg)' : 'var(--border-focus)';
        var strokeWidth = isEdgeSelected ? '2.5' : '1.6';
        var dashAttr = c.dashed ? ' stroke-dasharray="5 4"' : '';

        edgesSvg.push(
          '<g class="wb-edge ' + (isEdgeSelected ? 'selected' : '') + '" data-edge-index="' + idx + '" style="cursor:pointer;">' +
            '<path class="wb-edge-hit" d="' + geom.pathD + '" fill="none" stroke="transparent" stroke-width="16" />' +
            '<path class="wb-edge-line" d="' + geom.pathD + '" fill="none" stroke="' + strokeColor + '" stroke-width="' + strokeWidth + '"' + dashAttr + ' marker-end="url(#wb-arrow)" />' +
          '</g>'
        );

        var labelText = c.label || (isEdgeSelected ? 'Click to edit / ⌫' : '');
        if (labelText) {
          var lblW = Math.max(52, Math.round(labelText.length * 5.7 + 16));
          labelsSvg.push(
            '<g class="wb-edge-label ' + (isEdgeSelected ? 'selected' : '') + '" data-edge-label-index="' + idx + '" data-edge-index="' + idx + '" style="cursor:pointer;">' +
              '<rect x="' + Math.round(geom.mx - lblW / 2) + '" y="' + (geom.my - 9) + '" width="' + lblW + '" height="17" rx="4" fill="var(--bg)" stroke="' + (isEdgeSelected ? 'var(--fg)' : 'var(--border-strong)') + '" stroke-width="' + (isEdgeSelected ? '1.5' : '1') + '" />' +
              '<text x="' + geom.mx + '" y="' + (geom.my + 2) + '" text-anchor="middle" fill="' + (isEdgeSelected ? 'var(--fg)' : 'var(--fg-muted)') + '" font-family="var(--font-mono)" font-size="8.5" font-weight="500">' + escapeHtml(labelText) + '</text>' +
            '</g>'
          );
        }
      });

      // 3. Freehand Sketches Layer
      var sketchesSvg = this._sketches.map(function(sk) {
        var isSkSelected = sel && sel.kind === 'sketch' && sel.id === sk.id;
        return (
          '<g class="wb-sketch ' + (isSkSelected ? 'selected' : '') + '" data-wb-sketch-id="' + escapeHtml(sk.id) + '" style="cursor:pointer;">' +
            '<path d="' + escapeHtml(sk.d) + '" fill="none" stroke="transparent" stroke-width="14" />' +
            '<path d="' + escapeHtml(sk.d) + '" fill="none" stroke="' + (isSkSelected ? 'var(--fg)' : 'var(--fg-muted)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />' +
          '</g>'
        );
      }).join('');

      // 4. Sticky Notes Layer
      var notesSvg = this._notes.map(function(nt) {
        var isNoteSelected = sel && sel.kind === 'note' && sel.id === nt.id;
        var lines = String(nt.text || '').split('\n').slice(0, 4);
        var tspans = lines.map(function(line, i) {
          var trimmed = line.length > 30 ? line.slice(0, 28) + '…' : line;
          return '<tspan x="12" dy="' + (i === 0 ? 0 : 14) + '">' + escapeHtml(trimmed) + '</tspan>';
        }).join('');
        var boxH = Math.max(54, 26 + lines.length * 14);
        return (
          '<g class="wb-note ' + (isNoteSelected ? 'selected' : '') + '" data-wb-note-id="' + escapeHtml(nt.id) + '" transform="translate(' + nt.x + ',' + nt.y + ')" style="cursor:grab;">' +
            '<rect width="195" height="' + boxH + '" rx="6" fill="var(--bg-elevated)" stroke="' + (isNoteSelected ? 'var(--fg)' : 'var(--border-focus)') + '" stroke-width="' + (isNoteSelected ? '2' : '1.25') + '" />' +
            '<line x1="0" y1="6" x2="195" y2="6" stroke="var(--border-strong)" stroke-width="1" />' +
            '<text x="12" y="23" fill="var(--fg)" font-family="var(--font-mono)" font-size="9.5">' + tspans + '</text>' +
          '</g>'
        );
      }).join('');

      // 5. Nodes Layer (with 4-side Connection Ports & Replica Badge)
      var nodesSvg = this._nodes.map(function(n) {
        var color = blockColorMap[n.type] || '#3291ff';
        var isSelected = (sel && sel.kind === 'node' && sel.id === n.id) || self._selectedNodeId === n.id || self._connectSourceId === n.id;
        var labelShort = (n.name || n.type).length > 20 ? (n.name || n.type).slice(0, 18) + '…' : (n.name || n.type);
        var rep = n.replicas && n.replicas > 1 ? n.replicas + 'x' : '';

        return (
          '<g class="wb-node ' + (isSelected ? 'selected' : '') + '" data-wb-node-id="' + escapeHtml(n.id) + '" data-wb-node-type="' + escapeHtml(n.type) + '" transform="translate(' + n.x + ',' + n.y + ')" style="cursor:grab;">' +
            '<rect width="150" height="58" rx="6" fill="var(--surface)" stroke="' + (isSelected ? 'var(--fg)' : 'var(--border-strong)') + '" stroke-width="' + (isSelected ? '2' : '1.25') + '" />' +
            '<rect x="0" y="0" width="4" height="58" rx="2" fill="' + color + '" />' +
            '<text x="13" y="21" fill="var(--fg-faint)" font-family="var(--font-mono)" font-size="9" font-weight="600" letter-spacing="0.05em">' + escapeHtml(n.type.toUpperCase()) + '</text>' +
            (rep ? '<text x="140" y="21" text-anchor="end" fill="var(--fg-muted)" font-family="var(--font-mono)" font-size="8.5" font-weight="600">' + escapeHtml(rep) + '</text>' : '') +
            '<text x="13" y="41" fill="var(--fg)" font-family="var(--font-sans)" font-size="11" font-weight="600">' + escapeHtml(labelShort) + '</text>' +
            '<!-- 4-Sided Excalidraw Connection Ports -->' +
            '<circle class="wb-port" data-port-node="' + escapeHtml(n.id) + '" data-port-side="top" cx="75" cy="0" r="4.5" />' +
            '<circle class="wb-port" data-port-node="' + escapeHtml(n.id) + '" data-port-side="right" cx="150" cy="29" r="4.5" />' +
            '<circle class="wb-port" data-port-node="' + escapeHtml(n.id) + '" data-port-side="bottom" cx="75" cy="58" r="4.5" />' +
            '<circle class="wb-port" data-port-node="' + escapeHtml(n.id) + '" data-port-side="left" cx="0" cy="29" r="4.5" />' +
          '</g>'
        );
      }).join('');

      var vbW = Math.round(1250 / this._zoom);
      var vbH = Math.round(500 / this._zoom);
      var viewBoxStr = Math.round(this._panX) + ' ' + Math.round(this._panY) + ' ' + vbW + ' ' + vbH;

      return (
        '<div class="wb-canvas-surface tool--' + escapeHtml(this._activeTool) + '" id="wb-canvas-surface">' +
          '<svg class="wb-svg" id="wb-svg-canvas" viewBox="' + viewBoxStr + '" width="100%" height="500">' +
            '<defs>' +
              '<pattern id="wb-grid" width="24" height="24" patternUnits="userSpaceOnUse">' +
                '<circle cx="2" cy="2" r="1" fill="var(--border)" />' +
              '</pattern>' +
              '<marker id="wb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
                '<path d="M 0 1 L 10 5 L 0 9 z" fill="var(--fg-muted)" />' +
              '</marker>' +
            '</defs>' +
            '<rect class="wb-canvas-bg" x="-2000" y="-2000" width="6000" height="6000" fill="url(#wb-grid)" />' +
            '<g id="wb-frames-layer">' + framesSvg + '</g>' +
            '<g id="wb-edges-layer">' + edgesSvg.join('') + '</g>' +
            '<g id="wb-sketches-layer">' + sketchesSvg + '</g>' +
            '<g id="wb-notes-layer">' + notesSvg + '</g>' +
            '<g id="wb-nodes-layer">' + nodesSvg + '</g>' +
            '<g id="wb-labels-layer">' + labelsSvg.join('') + '</g>' +
            '<line id="wb-rubberband" x1="0" y1="0" x2="0" y2="0" stroke="var(--fg)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#wb-arrow)" style="display:none;pointer-events:none;" />' +
          '</svg>' +
          '<div class="wb-canvas-statusbar">' +
            '<span>Tool: <strong>' + escapeHtml(this._connectMode ? 'CONNECT' : this._activeTool.toUpperCase()) + '</strong></span>' +
            '<span>Drag any node port (●) to connect · Click any node or edge to inspect or press <kbd>Delete</kbd> to remove</span>' +
          '</div>' +
        '</div>'
      );
    },

    _renderInspector: function(blocks) {
      return this._renderInspectorPanel(blocks);
    },

    _renderInspectorPanel: function(blocks) {
      var sel = this._selectedItem;
      if (!sel && this._selectedNodeId) {
        sel = { kind: 'node', id: this._selectedNodeId };
      }
      if (!sel) return '';

      var self = this;
      if (sel.kind === 'node') {
        var node = this._nodes.find(function(n) { return n.id === sel.id; });
        if (!node) return '';
        var blockMeta = (blocks || []).find(function(b) { return b.type === node.type; });
        var buildSlug = NODE_TYPE_TO_CODELAB[node.type] || NODE_TYPE_TO_CODELAB[String(node.type || '').toLowerCase()] || null;
        var codelabBtnHtml = buildSlug
          ? '<a href="/build/' + escapeHtml(buildSlug) + '/?lab=open&amp;mode=guided" class="eco-btn eco-btn--sm eco-btn--primary" data-codelab-slug="' + escapeHtml(buildSlug) + '" title="Open ' + escapeHtml(buildSlug) + ' implementation in CodeLab">Inspect Internals in CodeLab →</a>'
          : '';
        return (
          '<div class="wb-inspector-bar" id="wb-inspector-bar">' +
            '<div class="wb-inspector-bar__left">' +
              '<span class="eco-pill eco-pill--accent">' + escapeHtml(node.type) + '</span>' +
              '<label class="wb-insp-field">' +
                '<span>Label:</span>' +
                '<input type="text" class="eco-search-input wb-insp-input" data-inspect-node-name="' + escapeHtml(node.id) + '" value="' + escapeHtml(node.name) + '" />' +
              '</label>' +
              '<label class="wb-insp-field">' +
                '<span>Replicas/Shards:</span>' +
                '<input type="number" class="eco-number-input wb-insp-num" data-inspect-node-replicas="' + escapeHtml(node.id) + '" value="' + (node.replicas || node.instances || 1) + '" min="1" max="128" />' +
              '</label>' +
              (blockMeta ? '<span class="wb-insp-desc">' + escapeHtml(blockMeta.badge) + '</span>' : '') +
            '</div>' +
            '<div class="wb-inspector-bar__actions">' +
              codelabBtnHtml +
              '<button class="eco-btn eco-btn--sm" data-sandbox-action="start-connect-from-selected">Connect From Node →</button>' +
              '<button class="eco-btn eco-btn--sm wb-btn-danger" data-sandbox-action="delete-selected">Delete Node (⌫)</button>' +
            '</div>' +
          '</div>'
        );
      }

      if (sel.kind === 'edge') {
        var idx = Number(sel.id);
        var edge = this._connections[idx];
        if (!edge) return '';
        return (
          '<div class="wb-inspector-bar" id="wb-inspector-bar">' +
            '<div class="wb-inspector-bar__left">' +
              '<span class="eco-pill eco-pill--accent">Connection Edge</span>' +
              '<label class="wb-insp-field">' +
                '<span>Protocol / Label:</span>' +
                '<input type="text" class="eco-search-input wb-insp-input" data-inspect-edge-label="' + idx + '" value="' + escapeHtml(edge.label || '') + '" placeholder="e.g. gRPC, HTTPS, Kafka CDC" />' +
              '</label>' +
              '<button class="eco-btn eco-btn--sm" data-inspect-edge-dash="' + idx + '">' + (edge.dashed ? 'Style: Dashed (Async)' : 'Style: Solid (Sync)') + '</button>' +
              '<button class="eco-btn eco-btn--sm" data-inspect-edge-reverse="' + idx + '">Reverse Direction ⇄</button>' +
            '</div>' +
            '<div class="wb-inspector-bar__actions">' +
              '<button class="eco-btn eco-btn--sm wb-btn-danger" data-sandbox-action="delete-selected">Delete Connection (⌫)</button>' +
            '</div>' +
          '</div>'
        );
      }

      if (sel.kind === 'frame') {
        var frame = this._frames.find(function(f) { return f.id === sel.id; });
        if (!frame) return '';
        return (
          '<div class="wb-inspector-bar" id="wb-inspector-bar">' +
            '<div class="wb-inspector-bar__left">' +
              '<span class="eco-pill eco-pill--accent">Zone / VPC Frame</span>' +
              '<label class="wb-insp-field">' +
                '<span>Zone Title:</span>' +
                '<input type="text" class="eco-search-input wb-insp-input" data-inspect-frame-label="' + escapeHtml(frame.id) + '" value="' + escapeHtml(frame.label) + '" />' +
              '</label>' +
            '</div>' +
            '<div class="wb-inspector-bar__actions">' +
              '<button class="eco-btn eco-btn--sm wb-btn-danger" data-sandbox-action="delete-selected">Delete Zone Frame (⌫)</button>' +
            '</div>' +
          '</div>'
        );
      }

      if (sel.kind === 'note') {
        var note = this._notes.find(function(nt) { return nt.id === sel.id; });
        if (!note) return '';
        return (
          '<div class="wb-inspector-bar" id="wb-inspector-bar">' +
            '<div class="wb-inspector-bar__left">' +
              '<span class="eco-pill eco-pill--accent">Sticky Note</span>' +
              '<label class="wb-insp-field">' +
                '<span>Annotation:</span>' +
                '<input type="text" class="eco-search-input wb-insp-input" data-inspect-note-text="' + escapeHtml(note.id) + '" value="' + escapeHtml(note.text.replace(/\n/g, ' | ')) + '" />' +
              '</label>' +
            '</div>' +
            '<div class="wb-inspector-bar__actions">' +
              '<button class="eco-btn eco-btn--sm wb-btn-danger" data-sandbox-action="delete-selected">Delete Note (⌫)</button>' +
            '</div>' +
          '</div>'
        );
      }

      return (
        '<div class="wb-inspector-bar" id="wb-inspector-bar">' +
          '<div class="wb-inspector-bar__left"><span class="eco-pill">Freehand Sketch Selected</span></div>' +
          '<div class="wb-inspector-bar__actions">' +
            '<button class="eco-btn eco-btn--sm wb-btn-danger" data-sandbox-action="delete-selected">Delete Sketch (⌫)</button>' +
          '</div>' +
        '</div>'
      );
    },

    _evaluateRubricAudit: function(cap) {
      cap = cap || this._simMetrics || {};
      var nodes = this._nodes || [];
      var bp = this._findBlueprint(this._activeBlueprintId);
      var targetLatencyMs = (bp && bp.targetLatencyMs) ? bp.targetLatencyMs : 150;

      // 1. No Single Points of Failure (SPOF)
      var spofTypes = ['Microservice', 'SQLShard', 'NoSQLKV', 'RedisCache', 'L4LB', 'L7LB', 'APIGateway', 'service', 'db', 'cache', 'lb', 'gateway'];
      var coreNodes = nodes.filter(function(n) { return spofTypes.indexOf(n.type) !== -1; });
      var spofNodes = coreNodes.filter(function(n) {
        var instances = Number(n.instances != null ? n.instances : n.replicas) || 1;
        return instances < 2;
      });
      var spofPassed = coreNodes.length > 0 && spofNodes.length === 0;

      // 2. Read Path Caching / Offload
      var readQps = Number(cap.readQps) || 0;
      var hasCacheOrCdn = nodes.some(function(n) {
        return n.type === 'RedisCache' || n.type === 'CDN' || n.type === 'cache' || n.type === 'cdn';
      });
      var cachePassed = readQps < 5000 || hasCacheOrCdn;

      // 3. Async Write / Burst Buffering
      var writeQps = Number(cap.writeQps) || 0;
      var writeUtilization = (writeQps / 40000) * 100;
      var hasQueueOrWorker = nodes.some(function(n) {
        return n.type === 'KafkaQueue' || n.type === 'WorkerPool' || n.type === 'queue' || n.type === 'worker';
      });
      var asyncPassed = hasQueueOrWorker || writeUtilization < 80;

      // 4. Latency & Saturation SLO
      var bottlenecks = cap.bottlenecks || [];
      var overloadedCount = bottlenecks.filter(function(b) { return b.severity === 'critical'; }).length;
      var estLatency = Number(cap.avgLatencyMs) || 0;
      var sloPassed = overloadedCount === 0 && estLatency <= targetLatencyMs;

      return [
        {
          id: 'spof',
          title: 'No Single Points of Failure (SPOF)',
          passed: spofPassed,
          detail: spofPassed
            ? 'All ' + coreNodes.length + ' stateful/compute tiers run with >= 2 instances.'
            : (coreNodes.length === 0
              ? 'Add compute/storage nodes with >= 2 instances.'
              : 'Single-instance bottleneck on: ' + spofNodes.map(function(n) { return n.name || n.type; }).join(', '))
        },
        {
          id: 'read-cache',
          title: 'Read Path Caching / Offload',
          passed: cachePassed,
          detail: cachePassed
            ? (hasCacheOrCdn ? 'Redis/CDN tier active for ' + readQps.toLocaleString() + ' read QPS.' : 'Read QPS (' + readQps.toLocaleString() + ') below 5,000 QPS threshold.')
            : 'Read QPS is ' + readQps.toLocaleString() + ' (>= 5,000) without a Cache or CDN node.'
        },
        {
          id: 'async-buffer',
          title: 'Async Write / Burst Buffering',
          passed: asyncPassed,
          detail: asyncPassed
            ? (hasQueueOrWorker ? 'Kafka / Worker pool buffers async write bursts.' : 'Write utilization (' + writeUtilization.toFixed(1) + '%) is under 80% threshold.')
            : 'Write utilization is ' + writeUtilization.toFixed(1) + '% (>= 80%) without a Queue or Worker pool.'
        },
        {
          id: 'latency-slo',
          title: 'Latency & Saturation SLO',
          passed: sloPassed,
          detail: sloPassed
            ? '0 overloaded tiers · Est. latency ' + estLatency + 'ms <= ' + targetLatencyMs + 'ms target.'
            : overloadedCount + ' critical bottleneck(s) · Est. latency ' + estLatency + 'ms (target <= ' + targetLatencyMs + 'ms).'
        }
      ];
    },

    _renderCapacityEstimator: function(cap) {
      this._simMetrics = cap;
      var inp = this._inputs;
      var bottlenecks = cap.bottlenecks || [];
      var rubricChecks = this._evaluateRubricAudit(cap);
      var passedCount = rubricChecks.filter(function(c) { return c.passed; }).length;

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

      var rubricHtml = rubricChecks.map(function(chk) {
        return (
          '<div class="bottleneck-alert ' + (chk.passed ? 'bottleneck--healthy' : 'bottleneck--warning') + '" data-rubric-check="' + escapeHtml(chk.id) + '">' +
            '<div class="bottleneck-header">' +
              '<span class="eco-pill ' + (chk.passed ? 'eco-pill--accent' : 'eco-pill--danger') + '">' + (chk.passed ? 'PASS' : 'WARN') + '</span>' +
              '<strong>' + escapeHtml(chk.title) + '</strong>' +
            '</div>' +
            '<p>' + escapeHtml(chk.detail) + '</p>' +
          '</div>'
        );
      }).join('');

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
              '<div class="bottlenecks-box" id="sb-rubric-audit">' +
                '<h4>Architecture Rubric Audit (' + passedCount + '/' + rubricChecks.length + ' Checks Passed)</h4>' +
                '<div class="eco-grid eco-grid--2">' +
                  rubricHtml +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>'
      );
    },

    // ── Event Binding with AbortController ─────────────────────
    _bindEvents: function() {
      var self = this;
      var container = this._container;
      if (!container) return;
      if (this._abortController) this._abortController.abort();
      this._abortController = new AbortController();
      var sig = { signal: this._abortController.signal };

      // 1. Click delegation
      container.addEventListener('click', function(e) {
        if (self._hasDragged) {
          self._hasDragged = false;
          return;
        }

        // Tab close button
        var closeTabBtn = e.target.closest('[data-wb-tab-close]');
        if (closeTabBtn) {
          e.stopPropagation();
          self.closeBoardTab(closeTabBtn.getAttribute('data-wb-tab-close'));
          return;
        }

        // Tab switch
        var tabEl = e.target.closest('[data-wb-tab]');
        if (tabEl) {
          self.switchBoardTab(tabEl.getAttribute('data-wb-tab'));
          return;
        }

        // Add new board tab
        var addTabBtn = e.target.closest('[data-wb-tab-add]');
        if (addTabBtn) {
          self.createNewBoardTab(addTabBtn.getAttribute('data-wb-tab-add'));
          return;
        }

        // Open blueprint in a new tab
        var bpNewTabBtn = e.target.closest('[data-open-blueprint-tab]');
        if (bpNewTabBtn) {
          self.createNewBoardTab(bpNewTabBtn.getAttribute('data-open-blueprint-tab'));
          return;
        }

        // Load blueprint into active board
        var bpBtn = e.target.closest('[data-load-blueprint]');
        if (bpBtn) {
          var bpId = bpBtn.getAttribute('data-load-blueprint');
          var bpObj = self._findBlueprint(bpId);
          if (root.Analytics && root.Analytics.trackSandboxBlueprint) {
            root.Analytics.trackSandboxBlueprint({
              blueprintId: bpId,
              title: bpObj ? bpObj.title : bpId,
              targetQps: bpObj && bpObj.defaultInputs ? bpObj.defaultInputs.qps : 0
            });
          }
          self.loadBlueprint(bpId, true);
          return;
        }

        // Add building block from left palette
        var addBlockBtn = e.target.closest('[data-add-block]');
        if (addBlockBtn) {
          var bType = addBlockBtn.getAttribute('data-add-block');
          if (root.Analytics && root.Analytics.trackSandboxAction) {
            root.Analytics.trackSandboxAction({ action: 'add_block', details: { block_type: bType } });
          }
          self.addBlock(bType);
          return;
        }

        // Excalidraw tool dock selection
        var toolBtn = e.target.closest('[data-wb-tool]');
        if (toolBtn) {
          var chosen = toolBtn.getAttribute('data-wb-tool');
          if (chosen === 'frame') {
            self.addFrame();
            return;
          }
          if (chosen === 'note') {
            self.addStickyNote();
            return;
          }
          self._activeTool = chosen;
          self._connectMode = (chosen === 'connect');
          self._connectSourceId = null;
          self.render();
          return;
        }

        // Inspector edge toggles
        var dashEdgeBtn = e.target.closest('[data-inspect-edge-dash]');
        if (dashEdgeBtn) {
          var dIdx = Number(dashEdgeBtn.getAttribute('data-inspect-edge-dash'));
          if (self._connections[dIdx]) {
            self._pushHistory();
            self._connections[dIdx].dashed = !self._connections[dIdx].dashed;
            self._syncToActiveBoard();
            self.render();
          }
          return;
        }

        var revEdgeBtn = e.target.closest('[data-inspect-edge-reverse]');
        if (revEdgeBtn) {
          var rIdx = Number(revEdgeBtn.getAttribute('data-inspect-edge-reverse'));
          if (self._connections[rIdx]) {
            self._pushHistory();
            var tmp = self._connections[rIdx].from;
            self._connections[rIdx].from = self._connections[rIdx].to;
            self._connections[rIdx].to = tmp;
            self._syncToActiveBoard();
            self.render();
          }
          return;
        }

        // Inspect Internals in CodeLab button
        var codelabBtn = e.target.closest('[data-codelab-slug]');
        if (codelabBtn) {
          var buildSlug = codelabBtn.getAttribute('data-codelab-slug');
          if (root.Analytics && root.Analytics.trackSandboxAction) {
            root.Analytics.trackSandboxAction({ action: 'inspect_codelab', details: { build_slug: buildSlug } });
          }
          if (buildSlug && root.App && typeof root.App.navigate === 'function') {
            e.preventDefault();
            root.App.navigate('/build/' + buildSlug + '?lab=open&mode=guided');
          }
          return;
        }

        // Sandbox action buttons
        var actBtn = e.target.closest('[data-sandbox-action]');
        if (actBtn) {
          var act = actBtn.getAttribute('data-sandbox-action');
          if (root.Analytics && root.Analytics.trackSandboxAction) {
            root.Analytics.trackSandboxAction({ action: act, details: { node_count: self._nodes.length } });
          }
          if (act === 'clear-canvas') {
            self._pushHistory();
            self._nodes = [];
            self._connections = [];
            self._frames = [];
            self._notes = [];
            self._sketches = [];
            self._selectedNodeId = null;
            self._selectedItem = null;
            self._syncToActiveBoard();
            self.render();
          } else if (act === 'toggle-connect') {
            self._connectMode = !self._connectMode;
            self._activeTool = self._connectMode ? 'connect' : 'select';
            self._connectSourceId = null;
            self.render();
          } else if (act === 'start-connect-from-selected') {
            if (self._selectedNodeId) {
              self._connectMode = true;
              self._activeTool = 'connect';
              self._connectSourceId = self._selectedNodeId;
              self.render();
            }
          } else if (act === 'delete-selected') {
            self.deleteSelected();
          } else if (act === 'undo') {
            self.undo();
          } else if (act === 'redo') {
            self.redo();
          } else if (act === 'auto-layout') {
            self.autoLayout();
          } else if (act === 'duplicate-board') {
            self.duplicateActiveBoardTab();
          } else if (act === 'zoom-in') {
            self._zoom = Math.min(2.0, Number((self._zoom + 0.15).toFixed(2)));
            self.render();
          } else if (act === 'zoom-out') {
            self._zoom = Math.max(0.5, Number((self._zoom - 0.15).toFixed(2)));
            self.render();
          } else if (act === 'zoom-reset') {
            self._zoom = 1;
            self._panX = 0;
            self._panY = 0;
            self.render();
          } else if (act === 'export-svg') {
            self.exportSvgOrJson('svg');
          } else if (act === 'export-json') {
            self.exportSvgOrJson('json');
          } else if (act === 'simulate-cluster-codelab') {
            self.simulateActiveBoardInCodeLab();
          }
          return;
        }

        // Clicking a Node
        var wbNode = e.target.closest('.wb-node');
        if (wbNode) {
          var nId = wbNode.getAttribute('data-wb-node-id');
          if (self._connectMode || self._activeTool === 'connect') {
            if (!self._connectSourceId) {
              self._connectSourceId = nId;
              self._selectedNodeId = nId;
              self._selectedItem = { kind: 'node', id: nId };
              self.render();
            } else if (self._connectSourceId !== nId) {
              self._pushHistory();
              self._connections.push({
                id: 'edge-' + Date.now(),
                from: self._connectSourceId,
                to: nId,
                label: 'RPC / Stream'
              });
              self._connectSourceId = null;
              self._connectMode = false;
              self._activeTool = 'select';
              self._syncToActiveBoard();
              self.render();
            }
          } else {
            self._selectedNodeId = nId;
            self._selectedItem = { kind: 'node', id: nId };
            self.render();
          }
          return;
        }

        // Clicking an Edge or Edge Label
        var wbEdge = e.target.closest('[data-edge-index]');
        if (wbEdge) {
          var edgeIndex = Number(wbEdge.getAttribute('data-edge-index'));
          self._selectedNodeId = null;
          self._selectedItem = { kind: 'edge', id: edgeIndex };
          self.render();
          return;
        }

        // Clicking a Zone Frame
        var wbFrame = e.target.closest('.wb-frame');
        if (wbFrame) {
          var fId = wbFrame.getAttribute('data-wb-frame-id');
          self._selectedNodeId = null;
          self._selectedItem = { kind: 'frame', id: fId };
          self.render();
          return;
        }

        // Clicking a Sticky Note
        var wbNote = e.target.closest('.wb-note');
        if (wbNote) {
          var noteId = wbNote.getAttribute('data-wb-note-id');
          self._selectedNodeId = null;
          self._selectedItem = { kind: 'note', id: noteId };
          self.render();
          return;
        }

        // Clicking a Freehand Sketch
        var wbSketch = e.target.closest('.wb-sketch');
        if (wbSketch) {
          var skId = wbSketch.getAttribute('data-wb-sketch-id');
          self._selectedNodeId = null;
          self._selectedItem = { kind: 'sketch', id: skId };
          self.render();
          return;
        }

        // Clicking blank SVG background deselects
        if (e.target.classList.contains('wb-canvas-bg') || e.target.id === 'wb-svg-canvas') {
          if (self._selectedItem || self._selectedNodeId) {
            self._selectedItem = null;
            self._selectedNodeId = null;
            self.render();
          }
        }
      }, sig);

      // 2. Double-click on board tab to rename inline
      container.addEventListener('dblclick', function(e) {
        var tabEl = e.target.closest('[data-wb-tab]');
        if (tabEl) {
          var bId = tabEl.getAttribute('data-wb-tab');
          var board = self._boards.find(function(b) { return b.id === bId; });
          if (board && typeof root.prompt === 'function') {
            var nextTitle = root.prompt('Rename Architecture Board:', board.title);
            if (nextTitle && nextTitle.trim()) {
              board.title = nextTitle.trim();
              self._saveBoards();
              self.render();
            }
          }
        }
      }, sig);

      // 3. Input handler for Inspector fields & Capacity Estimator fields
      container.addEventListener('input', function(e) {
        // Node Name edit
        var nodeNameInp = e.target.closest('[data-inspect-node-name]');
        if (nodeNameInp) {
          var nId = nodeNameInp.getAttribute('data-inspect-node-name');
          var node = self._nodes.find(function(n) { return n.id === nId; });
          if (node) {
            node.name = nodeNameInp.value;
            self._syncToActiveBoard();
            var gText = container.querySelector('.wb-node[data-wb-node-id="' + nId + '"] text:last-of-type');
            if (gText) {
              var shortStr = node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name;
              gText.textContent = shortStr;
            }
          }
          return;
        }

        // Node Replicas edit
        var nodeRepInp = e.target.closest('[data-inspect-node-replicas]');
        if (nodeRepInp) {
          var rNodeId = nodeRepInp.getAttribute('data-inspect-node-replicas');
          var rNode = self._nodes.find(function(n) { return n.id === rNodeId; });
          if (rNode) {
            var nextRep = Math.max(1, Number(nodeRepInp.value) || 1);
            rNode.replicas = nextRep;
            rNode.instances = nextRep;
            self._syncToActiveBoard();
            var data = self._getData();
            var cap = data.calculateCapacity(self._inputs);
            var panel = container.querySelector('#sandbox-capacity-panel');
            if (panel) {
              var wrapper = document.createElement('div');
              wrapper.innerHTML = self._renderCapacityEstimator(cap);
              panel.replaceWith(wrapper.firstElementChild);
            }
          }
          return;
        }

        // Edge Label edit
        var edgeLblInp = e.target.closest('[data-inspect-edge-label]');
        if (edgeLblInp) {
          var eIdx = Number(edgeLblInp.getAttribute('data-inspect-edge-label'));
          if (self._connections[eIdx]) {
            self._connections[eIdx].label = edgeLblInp.value;
            self._syncToActiveBoard();
            var lblTxt = container.querySelector('.wb-edge-label[data-edge-label-index="' + eIdx + '"] text');
            if (lblTxt) lblTxt.textContent = edgeLblInp.value;
          }
          return;
        }

        // Frame Label edit
        var frameLblInp = e.target.closest('[data-inspect-frame-label]');
        if (frameLblInp) {
          var fId = frameLblInp.getAttribute('data-inspect-frame-label');
          var frame = self._frames.find(function(f) { return f.id === fId; });
          if (frame) {
            frame.label = frameLblInp.value;
            self._syncToActiveBoard();
            var fTxt = container.querySelector('.wb-frame[data-wb-frame-id="' + fId + '"] text');
            if (fTxt) fTxt.textContent = frame.label.toUpperCase();
          }
          return;
        }

        // Sticky Note edit
        var noteTxtInp = e.target.closest('[data-inspect-note-text]');
        if (noteTxtInp) {
          var ntId = noteTxtInp.getAttribute('data-inspect-note-text');
          var note = self._notes.find(function(nt) { return nt.id === ntId; });
          if (note) {
            note.text = noteTxtInp.value.split(' | ').join('\n');
            self._syncToActiveBoard();
          }
          return;
        }

        // Capacity Estimator Inputs
        var sbInp = e.target.closest('[data-sb-input]');
        if (sbInp) {
          var key = sbInp.getAttribute('data-sb-input');
          self._inputs[key] = Number(sbInp.value);
          self._syncToActiveBoard();
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
      }, sig);

      // 4. HTML5 Drag-and-Drop from Left Palette onto SVG Canvas
      container.addEventListener('dragstart', function(e) {
        var blockBtn = e.target.closest('[data-add-block]');
        if (blockBtn && e.dataTransfer) {
          e.dataTransfer.setData('text/plain', blockBtn.getAttribute('data-add-block'));
          e.dataTransfer.effectAllowed = 'copy';
        }
      }, sig);

      container.addEventListener('dragover', function(e) {
        if (e.target.closest('#wb-canvas-surface')) {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        }
      }, sig);

      container.addEventListener('drop', function(e) {
        var surface = e.target.closest('#wb-canvas-surface');
        if (!surface || !e.dataTransfer) return;
        e.preventDefault();
        var blockType = e.dataTransfer.getData('text/plain');
        if (blockType) {
          var pt = self._screenToSvg(e.clientX, e.clientY);
          self.addBlock(blockType, pt.x, pt.y);
        }
      }, sig);

      // 5. Pointer Mousedown / Dragging on SVG Canvas (Nodes, Ports, Frames, Notes, Pan, Freehand Draw)
      container.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        var svg = e.target.closest('#wb-svg-canvas');
        if (!svg) return;

        var pt = self._screenToSvg(e.clientX, e.clientY);
        self._hasDragged = false;

        // A. Port drag -> rubber-band connection
        var portEl = e.target.closest('.wb-port');
        if (portEl) {
          e.stopPropagation();
          e.preventDefault();
          var srcNodeId = portEl.getAttribute('data-port-node');
          self._interaction = {
            mode: 'port-connect',
            sourceId: srcNodeId,
            startX: pt.x,
            startY: pt.y
          };
          var rb = container.querySelector('#wb-rubberband');
          if (rb) {
            rb.setAttribute('x1', pt.x);
            rb.setAttribute('y1', pt.y);
            rb.setAttribute('x2', pt.x);
            rb.setAttribute('y2', pt.y);
            rb.style.display = 'block';
          }
          return;
        }

        // B. Freehand sketch tool
        if (self._activeTool === 'draw') {
          e.preventDefault();
          self._pushHistory();
          var skId = 'sketch-' + Date.now();
          var newSk = { id: skId, d: 'M ' + Math.round(pt.x) + ' ' + Math.round(pt.y) };
          self._sketches.push(newSk);
          self._interaction = {
            mode: 'draw',
            sketchObj: newSk
          };
          return;
        }

        // C. Pan tool
        if (self._activeTool === 'pan') {
          e.preventDefault();
          self._interaction = {
            mode: 'pan',
            startClientX: e.clientX,
            startClientY: e.clientY,
            origPanX: self._panX,
            origPanY: self._panY
          };
          return;
        }

        // D. Frame resize handle
        var resizeEl = e.target.closest('[data-frame-resize]');
        if (resizeEl) {
          e.stopPropagation();
          e.preventDefault();
          var fId = resizeEl.getAttribute('data-frame-resize');
          var frameObj = self._frames.find(function(f) { return f.id === fId; });
          if (frameObj) {
            self._pushHistory();
            self._interaction = {
              mode: 'frame-resize',
              frameObj: frameObj,
              startX: pt.x,
              startY: pt.y,
              origW: frameObj.width,
              origH: frameObj.height
            };
          }
          return;
        }

        // E. Node drag (unless in connect click mode)
        var wbNode = e.target.closest('.wb-node');
        if (wbNode && !self._connectMode && self._activeTool !== 'connect') {
          var nId = wbNode.getAttribute('data-wb-node-id');
          var nodeObj = self._nodes.find(function(n) { return n.id === nId; });
          if (nodeObj) {
            self._interaction = {
              mode: 'node-drag',
              nodeObj: nodeObj,
              startClientX: e.clientX,
              startClientY: e.clientY,
              offsetX: pt.x - nodeObj.x,
              offsetY: pt.y - nodeObj.y,
              historyPushed: false
            };
          }
          return;
        }

        // F. Sticky Note drag
        var wbNote = e.target.closest('.wb-note');
        if (wbNote) {
          var ntId = wbNote.getAttribute('data-wb-note-id');
          var noteObj = self._notes.find(function(nt) { return nt.id === ntId; });
          if (noteObj) {
            self._interaction = {
              mode: 'note-drag',
              noteObj: noteObj,
              startClientX: e.clientX,
              startClientY: e.clientY,
              offsetX: pt.x - noteObj.x,
              offsetY: pt.y - noteObj.y,
              historyPushed: false
            };
          }
          return;
        }

        // G. Zone Frame drag
        var wbFrame = e.target.closest('.wb-frame');
        if (wbFrame) {
          var frameId = wbFrame.getAttribute('data-wb-frame-id');
          var fObj = self._frames.find(function(f) { return f.id === frameId; });
          if (fObj) {
            self._interaction = {
              mode: 'frame-drag',
              frameObj: fObj,
              startClientX: e.clientX,
              startClientY: e.clientY,
              offsetX: pt.x - fObj.x,
              offsetY: pt.y - fObj.y,
              historyPushed: false
            };
          }
        }
      }, sig);

      container.addEventListener('mousemove', function(e) {
        var inter = self._interaction;
        if (!inter) return;
        var pt = self._screenToSvg(e.clientX, e.clientY);

        if (inter.mode === 'node-drag') {
          if (Math.hypot(e.clientX - inter.startClientX, e.clientY - inter.startClientY) > 3) {
            self._hasDragged = true;
            if (!inter.historyPushed) {
              self._pushHistory();
              inter.historyPushed = true;
            }
          }
          inter.nodeObj.x = Math.max(10, Math.min(1090, Math.round(pt.x - inter.offsetX)));
          inter.nodeObj.y = Math.max(10, Math.min(430, Math.round(pt.y - inter.offsetY)));
          var g = container.querySelector('.wb-node[data-wb-node-id="' + inter.nodeObj.id + '"]');
          if (g) g.setAttribute('transform', 'translate(' + inter.nodeObj.x + ',' + inter.nodeObj.y + ')');
          self._updateLiveEdgesDOM();
        } else if (inter.mode === 'port-connect') {
          self._hasDragged = true;
          var rb = container.querySelector('#wb-rubberband');
          if (rb) {
            rb.setAttribute('x2', Math.round(pt.x));
            rb.setAttribute('y2', Math.round(pt.y));
          }
        } else if (inter.mode === 'note-drag') {
          if (Math.hypot(e.clientX - inter.startClientX, e.clientY - inter.startClientY) > 3) {
            self._hasDragged = true;
            if (!inter.historyPushed) {
              self._pushHistory();
              inter.historyPushed = true;
            }
          }
          inter.noteObj.x = Math.max(10, Math.min(1040, Math.round(pt.x - inter.offsetX)));
          inter.noteObj.y = Math.max(10, Math.min(430, Math.round(pt.y - inter.offsetY)));
          var ng = container.querySelector('.wb-note[data-wb-note-id="' + inter.noteObj.id + '"]');
          if (ng) ng.setAttribute('transform', 'translate(' + inter.noteObj.x + ',' + inter.noteObj.y + ')');
        } else if (inter.mode === 'frame-drag') {
          if (Math.hypot(e.clientX - inter.startClientX, e.clientY - inter.startClientY) > 3) {
            self._hasDragged = true;
            if (!inter.historyPushed) {
              self._pushHistory();
              inter.historyPushed = true;
            }
          }
          inter.frameObj.x = Math.max(5, Math.min(1050, Math.round(pt.x - inter.offsetX)));
          inter.frameObj.y = Math.max(15, Math.min(420, Math.round(pt.y - inter.offsetY)));
          var fg = container.querySelector('.wb-frame[data-wb-frame-id="' + inter.frameObj.id + '"]');
          if (fg) fg.setAttribute('transform', 'translate(' + inter.frameObj.x + ',' + inter.frameObj.y + ')');
        } else if (inter.mode === 'frame-resize') {
          self._hasDragged = true;
          inter.frameObj.width = Math.max(120, Math.round(inter.origW + (pt.x - inter.startX)));
          inter.frameObj.height = Math.max(80, Math.round(inter.origH + (pt.y - inter.startY)));
          self.render();
        } else if (inter.mode === 'pan') {
          self._hasDragged = true;
          self._panX = inter.origPanX - (e.clientX - inter.startClientX) / self._zoom;
          self._panY = inter.origPanY - (e.clientY - inter.startClientY) / self._zoom;
          var svgEl = container.querySelector('#wb-svg-canvas');
          if (svgEl) {
            var vbW = Math.round(1250 / self._zoom);
            var vbH = Math.round(500 / self._zoom);
            svgEl.setAttribute('viewBox', Math.round(self._panX) + ' ' + Math.round(self._panY) + ' ' + vbW + ' ' + vbH);
          }
        } else if (inter.mode === 'draw') {
          self._hasDragged = true;
          inter.sketchObj.d += ' L ' + Math.round(pt.x) + ' ' + Math.round(pt.y);
          self.render();
        }
      }, sig);

      root.addEventListener('mouseup', function(e) {
        var inter = self._interaction;
        if (!inter) return;
        self._interaction = null;

        if (inter.mode === 'port-connect') {
          var rb = container.querySelector('#wb-rubberband');
          if (rb) rb.style.display = 'none';
          var targetNodeEl = e.target && e.target.closest ? e.target.closest('.wb-node') : null;
          if (targetNodeEl) {
            var targetId = targetNodeEl.getAttribute('data-wb-node-id');
            if (targetId && targetId !== inter.sourceId) {
              self._pushHistory();
              self._connections.push({
                id: 'edge-' + Date.now(),
                from: inter.sourceId,
                to: targetId,
                label: 'RPC / Stream'
              });
              self._syncToActiveBoard();
              self.render();
              return;
            }
          }
        }

        if (self._hasDragged) {
          self._syncToActiveBoard();
          self.render();
        }
      }, sig);

      // 6. Keyboard Shortcuts (Delete/Backspace, Undo/Redo, Tool Hotkeys V/H/C/F/T/P)
      root.addEventListener('keydown', function(e) {
        if (!self._container) return;
        var activeEl = document.activeElement;
        var isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
        if (isTyping) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (self._selectedItem || self._selectedNodeId) {
            e.preventDefault();
            self.deleteSelected();
          }
          return;
        }

        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) self.redo();
          else self.undo();
          return;
        }

        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          var k = e.key.toLowerCase();
          if (k === 'v') { self._activeTool = 'select'; self._connectMode = false; self.render(); }
          else if (k === 'h') { self._activeTool = 'pan'; self._connectMode = false; self.render(); }
          else if (k === 'c') { self._activeTool = 'connect'; self._connectMode = true; self.render(); }
          else if (k === 'f') { self.addFrame(); }
          else if (k === 't') { self.addStickyNote(); }
          else if (k === 'p') { self._activeTool = 'draw'; self._connectMode = false; self.render(); }
          else if (k === 'escape') {
            self._selectedItem = null;
            self._selectedNodeId = null;
            self._connectMode = false;
            self._activeTool = 'select';
            self.render();
          }
        }
      }, sig);
    }
  };

  if (root && typeof root === 'object') {
    root.SandboxController = SandboxController;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
