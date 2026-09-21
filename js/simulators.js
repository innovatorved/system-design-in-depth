/* ═══════════════════════════════════════════════════════════════
   Simulators & Visual Architecture Widgets
   ═══════════════════════════════════════════════════════════════ */

window.SIMULATORS = window.SIMULATORS || {};

window.Simulators = (() => {

  // Global registry
  window.SIMULATORS["capacity-estimator"] = {
    id: "capacity-estimator",
    title: "Capacity & Sizing Estimator",
    slugs: ["back-of-the-envelope-capacity-planning"],
    blurb: "Adjust parameters to see dynamic estimates for QPS, bandwidth, and annual storage requirements.",
    render() {
      return `
        <div class="simulator-card" id="sim-capacity">
          <div class="simulator-card__header">
            <div class="simulator-card__title">
              <span>Capacity & Sizing Estimator</span>
            </div>
            <span class="badge badge--accent">Real-Time</span>
          </div>
          <p class="simulator-card__description">
            Adjust parameters to see dynamic estimates for QPS, bandwidth, and annual storage requirements.
          </p>
  
          <div class="simulator-card__grid">
            <div>
              <label class="simulator-card__label">DAILY ACTIVE USERS (DAU)</label>
              <input type="number" id="cap-dau" value="50000000" step="1000000" class="simulator-card__input" oninput="Simulators.recalcCapacity()">
            </div>
            <div>
              <label class="simulator-card__label">READS PER USER / DAY</label>
              <input type="number" id="cap-reads" value="20" step="1" class="simulator-card__input" oninput="Simulators.recalcCapacity()">
            </div>
            <div>
              <label class="simulator-card__label">WRITES PER USER / DAY</label>
              <input type="number" id="cap-writes" value="2" step="1" class="simulator-card__input" oninput="Simulators.recalcCapacity()">
            </div>
            <div>
              <label class="simulator-card__label">PAYLOAD SIZE (KB)</label>
              <input type="number" id="cap-payload" value="100" step="10" class="simulator-card__input" oninput="Simulators.recalcCapacity()">
            </div>
          </div>
  
          <div class="exercise-calc" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">
            <div class="exercise-calc__item">
              <div class="exercise-calc__label">Average Read QPS</div>
              <div class="exercise-calc__val" id="res-read-qps">11,574</div>
            </div>
            <div class="exercise-calc__item">
              <div class="exercise-calc__label">Peak Read QPS (2x)</div>
              <div class="exercise-calc__val" id="res-peak-qps" style="color:var(--warning);">23,148</div>
            </div>
            <div class="exercise-calc__item">
              <div class="exercise-calc__label">Daily Storage</div>
              <div class="exercise-calc__val" id="res-daily-storage">10.0 TB</div>
            </div>
            <div class="exercise-calc__item">
              <div class="exercise-calc__label">Annual (3x repl)</div>
              <div class="exercise-calc__val" id="res-annual-storage" style="color:var(--success);">10.95 PB</div>
            </div>
            <div class="exercise-calc__item">
              <div class="exercise-calc__label">Read Bandwidth</div>
              <div class="exercise-calc__val" id="res-bandwidth">1.16 GB/s</div>
            </div>
          </div>
        </div>
      `;
    },
    mount(root) { },
    unmount(root) { }
  };

  window.SIMULATORS["consistent-hashing"] = {
    id: "consistent-hashing",
    title: "Consistent Hashing Ring Visualizer",
    slugs: ["consistent-hashing-load-balancing"],
    blurb: "Observe how keys are distributed along a 360° circular hash ring. Add or remove nodes to see minimal key rebalancing in action!",
    render() {
      return `
        <div class="simulator-card" id="sim-hashing">
          <div class="simulator-card__header">
            <div class="simulator-card__title">
              <span>Consistent Hashing Ring Visualizer</span>
            </div>
            <span class="badge badge--success">O(log N) Route</span>
          </div>
          <p class="simulator-card__description">
            Observe how keys are distributed along a 360° circular hash ring. Add or remove nodes to see minimal key rebalancing in action!
          </p>
  
          <div class="simulator-card__controls">
            <button class="btn btn--secondary btn--sm" onclick="Simulators.addHashNode()">+ Add Node</button>
            <button class="btn btn--secondary btn--sm" onclick="Simulators.removeHashNode()">- Remove Node</button>
            <button class="btn btn--secondary btn--sm" onclick="Simulators.routeRandomKey()">Route Random Key</button>
            <span id="hash-ring-status" class="simulator-card__status">Nodes: 4 | Virtual Nodes/Node: 3</span>
          </div>
  
          <div style="display:grid;grid-template-columns:260px 1fr;gap:var(--space-6);align-items:center;">
            <div class="simulator-card__ring" id="hash-ring-circle">
              <div class="simulator-card__ring-label" style="top:8px;">0°</div>
              <div class="simulator-card__ring-label" style="right:8px;">90°</div>
              <div class="simulator-card__ring-label" style="bottom:8px;">180°</div>
              <div class="simulator-card__ring-label" style="left:8px;">270°</div>
              <div id="hash-center-label" class="simulator-card__ring-center">Ring Size: 2^32<br><span style="color:var(--success);">Clockwise Lookup</span></div>
            </div>
  
            <div class="simulator-card__log" id="hash-ring-log">
              <div class="simulator-card__log-header">// Consistent Hashing Event Log</div>
              <div>[INIT] Cluster established with Node_A, Node_B, Node_C, Node_D.</div>
              <div>[READY] Binary search (upper_bound) active for ring lookups.</div>
            </div>
          </div>
        </div>
      `;
    },
    mount(root) {
      setTimeout(updateHashRingUI, 100);
    },
    unmount(root) { }
  };

  window.SIMULATORS["rate-limiter"] = {
    id: "rate-limiter",
    title: "Sliding Window Rate Limiter",
    slugs: ["sliding-window-rate-limiter", "rate-limiting-and-abuse-prevention-case-study"],
    blurb: "Simulate client traffic bursts. If requests exceed 5 requests/sec, subsequent requests are throttled with HTTP 429.",
    render() {
      return `
        <div class="simulator-card" id="sim-ratelimit">
          <div class="simulator-card__header">
            <div class="simulator-card__title">
              <span>Sliding Window Rate Limiter</span>
            </div>
            <span class="badge badge--warning">Quota: 5 req/sec</span>
          </div>
          <p class="simulator-card__description">
            Simulate client traffic bursts. If requests exceed 5 requests/sec, subsequent requests are throttled with HTTP 429.
          </p>
  
          <div class="simulator-card__controls">
            <button class="btn btn--primary btn--sm" onclick="Simulators.sendRateLimitRequest(1)">Send 1 Request</button>
            <button class="btn btn--secondary btn--sm" onclick="Simulators.sendRateLimitRequest(5)">Send 5 Burst</button>
            <button class="btn btn--secondary btn--sm" onclick="Simulators.sendRateLimitRequest(10)">Send 10 Burst</button>
          </div>
  
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--space-4);margin-bottom:var(--space-3);">
            <div class="simulator-card__progress-text">
              <span>CURRENT 1-SEC WINDOW CAPACITY</span>
              <span id="rl-capacity-text">0 / 5 Used</span>
            </div>
            <div class="simulator-card__progress">
              <div id="rl-progress-fill" class="simulator-card__progress-fill" style="width:0%;"></div>
            </div>
          </div>
  
          <div class="simulator-card__log" id="rl-log" style="max-height:140px;">
            <div class="simulator-card__log-header">// Client Request Stream Output</div>
          </div>
        </div>
      `;
    },
    mount(root) {
      this.intervalId = setInterval(() => {
        if (typeof document !== 'undefined' && document.getElementById('rl-capacity-text')) {
          updateRLBar();
        }
      }, 300);
    },
    unmount(root) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }
  };


  function recalcCapacity() {
    const dau = parseFloat(document.getElementById('cap-dau')?.value) || 0;
    const reads = parseFloat(document.getElementById('cap-reads')?.value) || 0;
    const writes = parseFloat(document.getElementById('cap-writes')?.value) || 0;
    const payloadKB = parseFloat(document.getElementById('cap-payload')?.value) || 0;

    const secondsPerDay = 86400;
    const totalReads = dau * reads;
    const totalWrites = dau * writes;

    const readQPS = Math.round(totalReads / secondsPerDay);
    const peakQPS = Math.round(readQPS * 2);
    const dailyWriteKB = totalWrites * payloadKB;
    const dailyWriteTB = (dailyWriteKB / (1024 * 1024 * 1024)).toFixed(2);
    const annualReplPB = ((dailyWriteTB * 365 * 3) / 1024).toFixed(2);
    const bandwidthMB = ((readQPS * payloadKB) / 1024).toFixed(2);
    const bandwidthStr = bandwidthMB > 1024 ? (bandwidthMB / 1024).toFixed(2) + " GB/s" : bandwidthMB + " MB/s";

    const elRead = document.getElementById('res-read-qps');
    const elPeak = document.getElementById('res-peak-qps');
    const elDaily = document.getElementById('res-daily-storage');
    const elAnnual = document.getElementById('res-annual-storage');
    const elBandwidth = document.getElementById('res-bandwidth');

    if (elRead) elRead.textContent = readQPS.toLocaleString();
    if (elPeak) elPeak.textContent = peakQPS.toLocaleString();
    if (elDaily) elDaily.textContent = dailyWriteTB + " TB";
    if (elAnnual) elAnnual.textContent = annualReplPB + " PB";
    if (elBandwidth) elBandwidth.textContent = bandwidthStr;

    if (window.Analytics?.trackSimulatorInteraction) {
      window.Analytics.trackSimulatorInteraction('capacity_estimator', 'recalc', {
        dau: dau,
        reads_per_user: reads,
        writes_per_user: writes
      });
    }
  }


  let hashNodes = ['Node_A', 'Node_B', 'Node_C', 'Node_D'];
  const colors = ['#3e7bfa', '#4ed08a', '#f0a45b', '#f87171', '#8b9afc', '#6ea2ff'];

  function updateHashRingUI() {
    const circle = document.getElementById('hash-ring-circle');
    const status = document.getElementById('hash-ring-status');
    if (!circle || !status) return;

    status.textContent = `Nodes: ${hashNodes.length} | Ring Points: ${hashNodes.length * 3}`;
    circle.querySelectorAll('.node-dot').forEach(el => el.remove());

    hashNodes.forEach((node, nIdx) => {
      const col = colors[nIdx % colors.length];
      for (let v = 0; v < 3; v++) {
        const angle = ((nIdx * 3 + v) * (360 / (hashNodes.length * 3))) % 360;
        const rad = (angle - 90) * (Math.PI / 180);
        const r = 100;
        const x = 120 + r * Math.cos(rad) - 7;
        const y = 120 + r * Math.sin(rad) - 7;

        const dot = document.createElement('div');
        dot.className = 'node-dot';
        dot.title = `${node}#${v} (${Math.round(angle)}°)`;
        dot.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:14px;height:14px;border-radius:50%;background:${col};border:2px solid var(--surface);box-shadow:0 0 8px ${col}88;transition:all 0.3s;`;
        circle.appendChild(dot);
      }
    });
  }

  function addHashNode() {
    if (hashNodes.length >= 6) return;
    const name = 'Node_' + String.fromCharCode(65 + hashNodes.length);
    hashNodes.push(name);
    logHash(`[ADD] ${name} joined ring. Only ~${Math.round(100 / hashNodes.length)}% of keys re-mapped.`);
    updateHashRingUI();
    if (window.Analytics?.trackSimulatorInteraction) {
      window.Analytics.trackSimulatorInteraction('consistent_hashing', 'add_node', { node_count: hashNodes.length });
    }
  }

  function removeHashNode() {
    if (hashNodes.length <= 2) return;
    const popped = hashNodes.pop();
    logHash(`[REMOVE] ${popped} left ring. Its keys migrated to successor node.`);
    updateHashRingUI();
    if (window.Analytics?.trackSimulatorInteraction) {
      window.Analytics.trackSimulatorInteraction('consistent_hashing', 'remove_node', { node_count: hashNodes.length });
    }
  }

  function routeRandomKey() {
    const key = 'user_' + Math.floor(Math.random() * 90000 + 10000);
    const targetIdx = Math.floor(Math.random() * hashNodes.length);
    const assigned = hashNodes[targetIdx];
    logHash(`[ROUTE] Key "${key}" -> hash = 0x${Math.floor(Math.random()*16777215).toString(16)} -> routed to ${assigned}`);
    if (window.Analytics?.trackSimulatorInteraction) {
      window.Analytics.trackSimulatorInteraction('consistent_hashing', 'route_key', { routed_to: assigned });
    }
  }

  function logHash(msg) {
    const log = document.getElementById('hash-ring-log');
    if (log) {
      const item = document.createElement('div');
      item.textContent = msg;
      log.appendChild(item);
      log.scrollTop = log.scrollHeight;
    }
  }


  let rlTimestamps = [];
  const RL_LIMIT = 5;
  const RL_WINDOW_MS = 1000;

  function sendRateLimitRequest(count) {
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      rlTimestamps = rlTimestamps.filter(t => now - t < RL_WINDOW_MS);
      const allowed = rlTimestamps.length < RL_LIMIT;
      if (allowed) {
        rlTimestamps.push(now);
        logRL(`[200 OK] Request #${i+1} accepted. Window tokens left: ${RL_LIMIT - rlTimestamps.length}`, 'success');
      } else {
        logRL(`[429 TOO MANY REQUESTS] Quota exceeded! Retry-After: 1s`, 'error');
      }
    }
    updateRLBar();
    if (window.Analytics?.trackSimulatorInteraction) {
      window.Analytics.trackSimulatorInteraction('rate_limiter', 'send_request', { burst_count: count });
    }
  }

  function updateRLBar() {
    const now = Date.now();
    rlTimestamps = rlTimestamps.filter(t => now - t < RL_WINDOW_MS);
    const count = rlTimestamps.length;
    const pct = Math.min(100, Math.round((count / RL_LIMIT) * 100));

    const text = document.getElementById('rl-capacity-text');
    const fill = document.getElementById('rl-progress-fill');

    if (text) text.textContent = `${count} / ${RL_LIMIT} Used`;
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = count > RL_LIMIT ? 'var(--error)' : count === RL_LIMIT ? 'var(--warning)' : 'var(--success)';
    }
  }

  function logRL(msg, type) {
    const log = document.getElementById('rl-log');
    if (log) {
      const item = document.createElement('div');
      item.textContent = msg;
      if (type === 'error') item.style.color = 'var(--error)';
      if (type === 'success') item.style.color = 'var(--success)';
      log.appendChild(item);
      log.scrollTop = log.scrollHeight;
    }
  }


  function getSimulatorForUnit(slug) {
    for (const sim of Object.values(window.SIMULATORS)) {
      if (sim.slugs.includes(slug)) {
        return { html: sim.render(), sim };
      }
    }
    return null;
  }

  return {
    getSimulatorForUnit,
    recalcCapacity,
    addHashNode,
    removeHashNode,
    routeRandomKey,
    sendRateLimitRequest,
    updateHashRingUI,
    updateRLBar
  };
})();
