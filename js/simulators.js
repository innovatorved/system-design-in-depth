/* ═══════════════════════════════════════════════════════════════
   Simulators & Visual Architecture Widgets
   ═══════════════════════════════════════════════════════════════ */

window.Simulators = (() => {

  /**
   * 1. Back-of-the-Envelope Capacity Estimator
   */
  function renderCapacityEstimator() {
    return `
      <div class="simulator-card" id="sim-capacity">
        <div class="simulator-card__header">
          <div class="simulator-card__title">
            <span>Capacity & Sizing Estimator</span>
          </div>
          <span class="badge badge--accent">Real-Time</span>
        </div>
        <p style="font-size:var(--text-sm);color:var(--fg-muted);margin-bottom:var(--space-4);">
          Adjust parameters to see dynamic estimates for QPS, bandwidth, and annual storage requirements.
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-4);margin-bottom:var(--space-4);">
          <div>
            <label style="font-size:11px;font-family:var(--font-mono);color:var(--fg-faint);display:block;margin-bottom:4px;">DAILY ACTIVE USERS (DAU)</label>
            <input type="number" id="cap-dau" value="50000000" step="1000000" style="width:100%;padding:6px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);color:var(--fg);font-family:var(--font-mono);" oninput="Simulators.recalcCapacity()">
          </div>
          <div>
            <label style="font-size:11px;font-family:var(--font-mono);color:var(--fg-faint);display:block;margin-bottom:4px;">READS PER USER / DAY</label>
            <input type="number" id="cap-reads" value="20" step="1" style="width:100%;padding:6px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);color:var(--fg);font-family:var(--font-mono);" oninput="Simulators.recalcCapacity()">
          </div>
          <div>
            <label style="font-size:11px;font-family:var(--font-mono);color:var(--fg-faint);display:block;margin-bottom:4px;">WRITES PER USER / DAY</label>
            <input type="number" id="cap-writes" value="2" step="1" style="width:100%;padding:6px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);color:var(--fg);font-family:var(--font-mono);" oninput="Simulators.recalcCapacity()">
          </div>
          <div>
            <label style="font-size:11px;font-family:var(--font-mono);color:var(--fg-faint);display:block;margin-bottom:4px;">PAYLOAD SIZE (KB)</label>
            <input type="number" id="cap-payload" value="100" step="10" style="width:100%;padding:6px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);color:var(--fg);font-family:var(--font-mono);" oninput="Simulators.recalcCapacity()">
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
  }

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
  }

  /**
   * 2. Consistent Hashing Ring Visualizer
   */
  function renderConsistentHashingVisualizer() {
    return `
      <div class="simulator-card" id="sim-hashing">
        <div class="simulator-card__header">
          <div class="simulator-card__title">
            <span>Consistent Hashing Ring Visualizer</span>
          </div>
          <span class="badge badge--success">O(log N) Route</span>
        </div>
        <p style="font-size:var(--text-sm);color:var(--fg-muted);margin-bottom:var(--space-4);">
          Observe how keys are distributed along a 360° circular hash ring. Add or remove nodes to see minimal key rebalancing in action!
        </p>

        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;">
          <button class="btn btn--secondary btn--sm" onclick="Simulators.addHashNode()">+ Add Node</button>
          <button class="btn btn--secondary btn--sm" onclick="Simulators.removeHashNode()">- Remove Node</button>
          <button class="btn btn--secondary btn--sm" onclick="Simulators.routeRandomKey()">Route Random Key</button>
          <span id="hash-ring-status" style="font-size:var(--text-xs);font-family:var(--font-mono);color:var(--accent);">Nodes: 4 | Virtual Nodes/Node: 3</span>
        </div>

        <div style="display:grid;grid-template-columns:260px 1fr;gap:var(--space-6);align-items:center;">
          <div style="width:240px;height:240px;margin:0 auto;position:relative;background:var(--bg);border:2px dashed var(--border);border-radius:50%;display:grid;place-items:center;" id="hash-ring-circle">
            <div style="position:absolute;font-size:10px;color:var(--fg-faint);top:8px;">0°</div>
            <div style="position:absolute;font-size:10px;color:var(--fg-faint);right:8px;">90°</div>
            <div style="position:absolute;font-size:10px;color:var(--fg-faint);bottom:8px;">180°</div>
            <div style="position:absolute;font-size:10px;color:var(--fg-faint);left:8px;">270°</div>
            <div id="hash-center-label" style="text-align:center;font-size:11px;font-family:var(--font-mono);color:var(--fg-muted);">Ring Size: 2^32<br><span style="color:var(--success);">Clockwise Lookup</span></div>
          </div>

          <div style="background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--space-4);font-family:var(--font-mono);font-size:var(--text-xs);max-height:220px;overflow-y:auto;" id="hash-ring-log">
            <div style="color:var(--fg-faint);margin-bottom:4px;">// Consistent Hashing Event Log</div>
            <div>[INIT] Cluster established with Node_A, Node_B, Node_C, Node_D.</div>
            <div>[READY] Binary search (upper_bound) active for ring lookups.</div>
          </div>
        </div>
      </div>
    `;
  }

  let hashNodes = ['Node_A', 'Node_B', 'Node_C', 'Node_D'];
  const colors = ['#3e7bfa', '#4ed08a', '#f0a45b', '#f87171', '#8b9afc', '#6ea2ff'];

  function updateHashRingUI() {
    const circle = document.getElementById('hash-ring-circle');
    const status = document.getElementById('hash-ring-status');
    if (!circle || !status) return;

    status.textContent = `Nodes: ${hashNodes.length} | Ring Points: ${hashNodes.length * 3}`;
    // clear old point markers
    circle.querySelectorAll('.node-dot').forEach(el => el.remove());

    hashNodes.forEach((node, nIdx) => {
      const col = colors[nIdx % colors.length];
      for (let v = 0; v < 3; v++) {
        // pseudo hash angle
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
  }

  function removeHashNode() {
    if (hashNodes.length <= 2) return;
    const popped = hashNodes.pop();
    logHash(`[REMOVE] ${popped} left ring. Its keys migrated to successor node.`);
    updateHashRingUI();
  }

  function routeRandomKey() {
    const key = 'user_' + Math.floor(Math.random() * 90000 + 10000);
    const targetIdx = Math.floor(Math.random() * hashNodes.length);
    const assigned = hashNodes[targetIdx];
    logHash(`[ROUTE] Key \"${key}\" -> hash = 0x${Math.floor(Math.random()*16777215).toString(16)} -> routed to ${assigned}`);
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

  /**
   * 3. Sliding Window Rate Limiter Simulator
   */
  function renderRateLimiterSimulator() {
    return `
      <div class="simulator-card" id="sim-ratelimit">
        <div class="simulator-card__header">
          <div class="simulator-card__title">
            <span>Sliding Window Rate Limiter</span>
          </div>
          <span class="badge badge--warning">Quota: 5 req/sec</span>
        </div>
        <p style="font-size:var(--text-sm);color:var(--fg-muted);margin-bottom:var(--space-4);">
          Simulate client traffic bursts. If requests exceed 5 requests/sec, subsequent requests are throttled with HTTP 429.
        </p>

        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;">
          <button class="btn btn--primary btn--sm" onclick="Simulators.sendRateLimitRequest(1)">Send 1 Request</button>
          <button class="btn btn--secondary btn--sm" onclick="Simulators.sendRateLimitRequest(5)">Send 5 Burst</button>
          <button class="btn btn--secondary btn--sm" onclick="Simulators.sendRateLimitRequest(10)">Send 10 Burst</button>
        </div>

        <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--space-4);margin-bottom:var(--space-3);">
          <div style="display:flex;justify-content:space-between;font-size:11px;font-family:var(--font-mono);color:var(--fg-faint);margin-bottom:6px;">
            <span>CURRENT 1-SEC WINDOW CAPACITY</span>
            <span id="rl-capacity-text">0 / 5 Used</span>
          </div>
          <div style="height:8px;background:var(--progress-track);border-radius:var(--r-full);overflow:hidden;">
            <div id="rl-progress-fill" style="height:100%;width:0%;background:var(--success);transition:width 0.2s, background 0.2s;"></div>
          </div>
        </div>

        <div style="background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--space-3);font-family:var(--font-mono);font-size:var(--text-xs);max-height:140px;overflow-y:auto;" id="rl-log">
          <div style="color:var(--fg-faint);">// Client Request Stream Output</div>
        </div>
      </div>
    `;
  }

  let rlTimestamps = [];
  const RL_LIMIT = 5;
  const RL_WINDOW_MS = 1000;

  function sendRateLimitRequest(count) {
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      // clean old timestamps outside 1 sec
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

  // Periodic decay sweep
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      if (typeof document !== 'undefined' && document.getElementById('rl-capacity-text')) {
        updateRLBar();
      }
    }, 300);
  }

  /**
   * Inject relevant simulator based on unit slug
   */
  function getSimulatorForUnit(slug) {
    if (slug === 'back-of-the-envelope-capacity-planning') {
      return renderCapacityEstimator();
    }
    if (slug === 'consistent-hashing-load-balancing') {
      setTimeout(updateHashRingUI, 100);
      return renderConsistentHashingVisualizer();
    }
    if (slug === 'sliding-window-rate-limiter' || slug === 'rate-limiting-and-abuse-prevention-case-study') {
      return renderRateLimiterSimulator();
    }
    return '';
  }

  return {
    getSimulatorForUnit,
    recalcCapacity,
    addHashNode,
    removeHashNode,
    routeRandomKey,
    sendRateLimitRequest
  };
})();
