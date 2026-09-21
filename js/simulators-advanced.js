/* ═══════════════════════════════════════════════════════════════
   Simulators Advanced (S12-S20)
   ═══════════════════════════════════════════════════════════════ */

window.SIMULATORS = window.SIMULATORS || {};

(() => {
  // Utility for standard simulation components
  const UI = {
    progress(value, max) {
      const pct = Math.min(100, Math.max(0, (value / max) * 100));
      return `<div style="background:var(--bg-card-alt); border-radius:4px; height:20px; overflow:hidden; position:relative; width:100%;">
                <div style="background:var(--accent); width:${pct}%; height:100%; transition: width 0.3s;"></div>
                <div style="position:absolute; top:0; left:0; width:100%; text-align:center; font-size:12px; line-height:20px; color:#fff; mix-blend-mode:difference;">${value}</div>
              </div>`;
    }
  };

  // ----------------------------------------------------------------------
  // S12: Sharding & Hot Partitions
  // ----------------------------------------------------------------------
  window.SIMULATORS["hot-partitions"] = {
    id: "hot-partitions",
    title: "Sharding & Hot Partitions",
    slugs: ["sharding-and-partitioning", "hot-partitions"],
    blurb: "Simulate uniform vs skewed traffic (Zipf distribution) across 4 shards.",
    render() {
      return `
        <div class="simulator-card" id="sim-hot-partitions">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Sharding & Hot Partitions</div>
            <span class="badge badge--accent">Simulation</span>
          </div>
          <p class="simulator-card__description">Simulate request routing across 4 shard buckets. Adjust skew to see the impact of hot partitions.</p>
          <div class="simulator-card__grid" style="grid-template-columns: 1fr 1fr;">
            <div>
              <label class="simulator-card__label">Skew (Zipf α: <span id="hp-skew-val">0.0</span>)</label>
              <input type="range" id="hp-skew" min="0" max="2.5" step="0.1" value="0.0" style="width:100%">
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn--primary" id="hp-send">Send 100 Requests</button>
            </div>
          </div>
          <div style="margin-top:16px;">
            <div id="hp-alert" style="color:var(--danger); font-weight:bold; height:20px; margin-bottom:8px;"></div>
            <div style="display:flex; gap:8px;">
              ${[0,1,2,3].map(i => `
                <div style="flex:1; text-align:center;">
                  <div style="font-size:12px; margin-bottom:4px;">Shard ${i}</div>
                  <div id="hp-shard-${i}" style="background:var(--bg-card-alt); border-radius:4px; height:100px; position:relative; overflow:hidden;">
                    <div id="hp-shard-fill-${i}" style="background:var(--accent); position:absolute; bottom:0; left:0; width:100%; height:0%; transition: height 0.3s;"></div>
                  </div>
                  <div id="hp-shard-count-${i}" style="font-size:12px; margin-top:4px;">0</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    },
    mount(root) {
      const counts = [0, 0, 0, 0];
      const maxCap = 100;
      let total = 0;
      
      const skewEl = root.querySelector('#hp-skew');
      const skewVal = root.querySelector('#hp-skew-val');
      const btn = root.querySelector('#hp-send');
      const alertEl = root.querySelector('#hp-alert');

      skewEl.addEventListener('input', () => { skewVal.textContent = parseFloat(skewEl.value).toFixed(1); });

      btn.addEventListener('click', () => {
        const alpha = parseFloat(skewEl.value);
        let hotCount = 0;

        // Reset
        counts.fill(0);
        total = 0;

        // Generate 100 requests
        for(let i=0; i<100; i++) {
          let shard = 0;
          if (alpha === 0) {
            shard = Math.floor(Math.random() * 4);
          } else {
            // Very rough Zipf approx for N=4
            const r = Math.random();
            const sum = 1 + 1/Math.pow(2, alpha) + 1/Math.pow(3, alpha) + 1/Math.pow(4, alpha);
            const p1 = 1 / sum;
            const p2 = p1 + (1/Math.pow(2, alpha)) / sum;
            const p3 = p2 + (1/Math.pow(3, alpha)) / sum;
            
            if (r < p1) shard = 0;
            else if (r < p2) shard = 1;
            else if (r < p3) shard = 2;
            else shard = 3;
          }
          counts[shard]++;
          total++;
        }

        // Render
        let overload = false;
        for(let i=0; i<4; i++) {
          const fill = root.querySelector(`#hp-shard-fill-${i}`);
          const countEl = root.querySelector(`#hp-shard-count-${i}`);
          const pct = Math.min(100, (counts[i] / (100 / 4 * 2)) * 100); // 50 is 100% capacity for a single shard here
          fill.style.height = `${pct}%`;
          if (pct >= 90) {
            fill.style.background = 'var(--danger)';
            overload = true;
          } else if (pct >= 70) {
            fill.style.background = 'var(--warning)';
          } else {
            fill.style.background = 'var(--accent)';
          }
          countEl.textContent = counts[i];
        }

        alertEl.textContent = overload ? "⚠️ HOT SHARD DETECTED - Overload Risk!" : "";
      });
    },
    unmount(root) {}
  };

  // ----------------------------------------------------------------------
  // S13: Queue Backpressure & Lag
  // ----------------------------------------------------------------------
  window.SIMULATORS["queue-lag"] = {
    id: "queue-lag",
    title: "Queue Backpressure & Lag",
    slugs: ["queue-lag", "backpressure"],
    blurb: "Simulate arrival vs service rates and observe queue buildup and lag.",
    render() {
      return `
        <div class="simulator-card" id="sim-queue-lag">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Queue Backpressure & Lag</div>
            <span class="badge badge--warning">Live</span>
          </div>
          <div class="simulator-card__grid" style="grid-template-columns: 1fr 1fr;">
            <div>
              <label class="simulator-card__label">Arrival Rate (req/s): <span id="ql-arr-val">10</span></label>
              <input type="range" id="ql-arr" min="1" max="50" step="1" value="10" style="width:100%">
            </div>
            <div>
              <label class="simulator-card__label">Service Rate (req/s): <span id="ql-srv-val">12</span></label>
              <input type="range" id="ql-srv" min="1" max="50" step="1" value="12" style="width:100%">
            </div>
          </div>
          <div style="margin-top:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px;">
              <span>Queue Depth</span>
              <span id="ql-depth-val">0 / 100</span>
            </div>
            <div id="ql-bar-container" style="background:var(--bg-card-alt); border-radius:4px; height:20px; position:relative; overflow:hidden;">
              <div id="ql-bar" style="background:var(--success); position:absolute; top:0; left:0; width:0%; height:100%; transition: width 0.1s linear, background 0.2s;"></div>
            </div>
          </div>
          <div style="margin-top:12px; display:flex; gap:16px; font-size:14px;">
            <div><strong>Lag:</strong> <span id="ql-lag">0.0s</span></div>
            <div><strong>Status:</strong> <span id="ql-status" style="color:var(--success);">OK</span></div>
          </div>
          <button class="btn btn--secondary" id="ql-toggle" style="margin-top:12px;">Start Simulation</button>
        </div>
      `;
    },
    mount(root) {
      const arr = root.querySelector('#ql-arr');
      const arrVal = root.querySelector('#ql-arr-val');
      const srv = root.querySelector('#ql-srv');
      const srvVal = root.querySelector('#ql-srv-val');
      const depthVal = root.querySelector('#ql-depth-val');
      const bar = root.querySelector('#ql-bar');
      const lagEl = root.querySelector('#ql-lag');
      const statusEl = root.querySelector('#ql-status');
      const btn = root.querySelector('#ql-toggle');

      let qDepth = 0;
      const maxQ = 100;
      let running = false;
      let timer = null;

      arr.addEventListener('input', () => arrVal.textContent = arr.value);
      srv.addEventListener('input', () => srvVal.textContent = srv.value);

      const tick = () => {
        const arrival = parseInt(arr.value);
        const service = parseInt(srv.value);
        
        qDepth += arrival - service;
        if (qDepth < 0) qDepth = 0;
        
        let dropped = 0;
        if (qDepth > maxQ) {
          dropped = qDepth - maxQ;
          qDepth = maxQ;
        }

        const pct = (qDepth / maxQ) * 100;
        bar.style.width = `${pct}%`;
        
        if (pct >= 90) bar.style.background = 'var(--danger)';
        else if (pct >= 60) bar.style.background = 'var(--warning)';
        else bar.style.background = 'var(--success)';

        depthVal.textContent = `${qDepth} / ${maxQ}`;
        
        const lag = qDepth / service; // Little's Law variation
        lagEl.textContent = `${lag.toFixed(1)}s`;

        if (dropped > 0) {
          statusEl.textContent = `DROPPING (${dropped} req/s) - 429 Too Many Requests`;
          statusEl.style.color = 'var(--danger)';
        } else if (pct >= 90) {
          statusEl.textContent = `CRITICAL BACKPRESSURE`;
          statusEl.style.color = 'var(--danger)';
        } else if (pct >= 60) {
          statusEl.textContent = `WARNING - LAG INCREASING`;
          statusEl.style.color = 'var(--warning)';
        } else {
          statusEl.textContent = `OK`;
          statusEl.style.color = 'var(--success)';
        }
      };

      btn.addEventListener('click', () => {
        running = !running;
        if (running) {
          btn.textContent = "Stop Simulation";
          timer = setInterval(tick, 1000);
        } else {
          btn.textContent = "Start Simulation";
          clearInterval(timer);
        }
      });
      
      this._timer = timer;
    },
    unmount(root) {
      if (this._timer) clearInterval(this._timer);
    }
  };

  // ----------------------------------------------------------------------
  // S14: Circuit Breaker State Machine
  // ----------------------------------------------------------------------
  window.SIMULATORS["circuit-breaker"] = {
    id: "circuit-breaker",
    title: "Circuit Breaker State Machine",
    slugs: ["circuit-breakers-and-timeouts"],
    blurb: "Visualize state transitions: CLOSED -> OPEN -> HALF-OPEN.",
    render() {
      return `
        <div class="simulator-card" id="sim-cb">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Circuit Breaker</div>
            <span class="badge badge--info">Resiliency</span>
          </div>
          <div style="display:flex; justify-content:center; gap:24px; margin: 16px 0;">
            <div id="cb-closed" style="padding:8px 16px; border:2px solid var(--success); border-radius:8px; background:rgba(40,167,69,0.2); font-weight:bold;">CLOSED</div>
            <div id="cb-open" style="padding:8px 16px; border:2px solid var(--border); border-radius:8px; color:var(--text-muted);">OPEN</div>
            <div id="cb-half" style="padding:8px 16px; border:2px solid var(--border); border-radius:8px; color:var(--text-muted);">HALF-OPEN</div>
          </div>
          
          <div class="simulator-card__grid" style="grid-template-columns: 1fr 1fr;">
            <div>
              <label class="simulator-card__label">Simulated Error Rate: <span id="cb-err-val">10%</span></label>
              <input type="range" id="cb-err" min="0" max="100" step="5" value="10" style="width:100%">
            </div>
            <div>
              <label class="simulator-card__label">Trip Threshold: <span id="cb-thr-val">50%</span></label>
              <input type="range" id="cb-thr" min="10" max="100" step="10" value="50" style="width:100%">
            </div>
          </div>
          <div style="margin-top:16px;">
            <button class="btn btn--primary" id="cb-send">Send Batch (10 reqs)</button>
          </div>
          <div id="cb-log" style="margin-top:12px; font-family:var(--font-mono); font-size:12px; background:var(--bg-card-alt); padding:8px; border-radius:4px; max-height:80px; overflow-y:auto;">
            Ready.
          </div>
        </div>
      `;
    },
    mount(root) {
      let state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
      let failCount = 0;
      let totalCount = 0;
      
      const errEl = root.querySelector('#cb-err');
      const errVal = root.querySelector('#cb-err-val');
      const thrEl = root.querySelector('#cb-thr');
      const thrVal = root.querySelector('#cb-thr-val');
      const btn = root.querySelector('#cb-send');
      const log = root.querySelector('#cb-log');
      
      const sClosed = root.querySelector('#cb-closed');
      const sOpen = root.querySelector('#cb-open');
      const sHalf = root.querySelector('#cb-half');

      errEl.addEventListener('input', () => errVal.textContent = errEl.value + '%');
      thrEl.addEventListener('input', () => thrVal.textContent = thrEl.value + '%');

      const logMsg = (msg) => {
        log.innerHTML = `<div>> ${msg}</div>` + log.innerHTML;
      };

      const updateUI = () => {
        [sClosed, sOpen, sHalf].forEach(el => {
          el.style.borderColor = 'var(--border)';
          el.style.background = 'transparent';
          el.style.color = 'var(--text-muted)';
        });
        
        if (state === 'CLOSED') {
          sClosed.style.borderColor = 'var(--success)';
          sClosed.style.background = 'rgba(40,167,69,0.2)';
          sClosed.style.color = 'var(--text)';
        } else if (state === 'OPEN') {
          sOpen.style.borderColor = 'var(--danger)';
          sOpen.style.background = 'rgba(220,53,69,0.2)';
          sOpen.style.color = 'var(--text)';
        } else if (state === 'HALF-OPEN') {
          sHalf.style.borderColor = 'var(--warning)';
          sHalf.style.background = 'rgba(255,193,7,0.2)';
          sHalf.style.color = 'var(--text)';
        }
      };

      btn.addEventListener('click', () => {
        const errRate = parseInt(errEl.value) / 100;
        const threshold = parseInt(thrEl.value) / 100;

        if (state === 'OPEN') {
          logMsg("FAST FAIL: Circuit is OPEN. Request blocked.");
          return;
        }

        if (state === 'HALF-OPEN') {
          logMsg("Probing HALF-OPEN...");
          const failed = Math.random() < errRate;
          if (failed) {
            logMsg("Probe FAILED! Tripping back to OPEN.");
            state = 'OPEN';
            startCooldown();
          } else {
            logMsg("Probe SUCCEEDED! Resetting to CLOSED.");
            state = 'CLOSED';
          }
          updateUI();
          return;
        }

        // CLOSED state logic
        let batchFails = 0;
        for(let i=0; i<10; i++) {
          if (Math.random() < errRate) batchFails++;
        }
        
        const failRate = batchFails / 10;
        logMsg(`Batch sent: ${batchFails} failures (${Math.round(failRate*100)}%).`);
        
        if (failRate >= threshold) {
          logMsg(`Threshold exceeded (${Math.round(threshold*100)}%). Tripping circuit to OPEN!`);
          state = 'OPEN';
          updateUI();
          startCooldown();
        }
      });

      const startCooldown = () => {
        btn.disabled = true;
        let left = 3;
        const tick = setInterval(() => {
          left--;
          if (left <= 0) {
            clearInterval(tick);
            state = 'HALF-OPEN';
            logMsg("Cooldown complete. State transitioned to HALF-OPEN.");
            btn.disabled = false;
            updateUI();
          }
        }, 1000);
        this._interval = tick;
      };
    },
    unmount(root) {
      if (this._interval) clearInterval(this._interval);
    }
  };

  // ----------------------------------------------------------------------
  // S15: Retry Storm & Exponential Backoff + Jitter
  // ----------------------------------------------------------------------
  window.SIMULATORS["retry-storm"] = {
    id: "retry-storm",
    title: "Retry Storm & Jitter",
    slugs: ["retries-timeouts-idempotency"],
    blurb: "Simulate retry strategies after a failure event.",
    render() {
      return `
        <div class="simulator-card" id="sim-retry">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Retry Strategy & Jitter</div>
            <span class="badge badge--accent">Graph</span>
          </div>
          <div class="simulator-card__grid" style="grid-template-columns: 1fr 1fr;">
            <div>
              <label class="simulator-card__label">Strategy</label>
              <select id="rs-strat" class="simulator-card__input" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border); background:var(--bg-input); color:var(--text);">
                <option value="immediate">Immediate Retry (Storm)</option>
                <option value="exp">Exponential Backoff</option>
                <option value="jitter">Exp. Backoff + Full Jitter</option>
              </select>
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn--danger" id="rs-fail">Simulate Outage</button>
            </div>
          </div>
          <div style="margin-top:16px;">
            <div style="font-size:12px; margin-bottom:4px;">Traffic Over Time (t=0 to t=10)</div>
            <div id="rs-graph" style="display:flex; align-items:flex-end; gap:4px; height:120px; background:var(--bg-card-alt); padding:8px; border-radius:4px; border-bottom: 1px dashed var(--danger);">
              ${Array.from({length:11}).map(i => `<div style="flex:1; background:var(--accent); height:0px; transition: height 0.3s; position:relative;" class="rs-bar"><span style="position:absolute; bottom:-20px; left:50%; transform:translateX(-50%); font-size:10px;"></span></div>`).join('')}
            </div>
          </div>
        </div>
      `;
    },
    mount(root) {
      const btn = root.querySelector('#rs-fail');
      const strat = root.querySelector('#rs-strat');
      const bars = root.querySelectorAll('.rs-bar');

      btn.addEventListener('click', () => {
        // Reset bars
        bars.forEach(b => {
          b.style.height = '0px';
          b.style.background = 'var(--accent)';
          b.querySelector('span').textContent = '';
        });

        const s = strat.value;
        const timeline = new Array(11).fill(0);
        timeline[0] = 100; // 100 failed requests at t=0

        // Simulate 3 retries for each of the 100 requests
        for (let req=0; req<100; req++) {
          for (let retry=1; retry<=3; retry++) {
            let t = 0;
            if (s === 'immediate') {
              t = retry; // Retry immediately on subsequent ticks
            } else if (s === 'exp') {
              t = Math.pow(2, retry); // 2, 4, 8
            } else if (s === 'jitter') {
              const maxBackoff = Math.pow(2, retry);
              t = Math.floor(Math.random() * (maxBackoff + 1));
            }
            if (t <= 10) timeline[t]++;
          }
        }

        // Render
        timeline.forEach((val, i) => {
          const h = Math.min(100, (val / 150) * 100);
          bars[i].style.height = `${h}%`;
          bars[i].querySelector('span').textContent = i;
          
          if (val > 100) bars[i].style.background = 'var(--danger)'; // overloaded
          else if (val > 50) bars[i].style.background = 'var(--warning)';
        });
      });
    },
    unmount(root) {}
  };

  // ----------------------------------------------------------------------
  // S16: Geohash Explorer
  // ----------------------------------------------------------------------
  window.SIMULATORS["geohash-explorer"] = {
    id: "geohash-explorer",
    title: "Geohash & Spatial Indexing",
    slugs: ["geohash-prefix-spatial-index"],
    blurb: "Click on the map grid to generate Geohashes based on coordinates.",
    render() {
      return `
        <div class="simulator-card" id="sim-geohash">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Geohash Explorer</div>
            <span class="badge badge--success">Proximity Search</span>
          </div>
          <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:12px;">
            <div id="gh-grid" style="width:200px; height:200px; background:var(--bg-card-alt); border:1px solid var(--border); position:relative; cursor:crosshair; overflow:hidden;">
              <div style="position:absolute; top:50%; width:100%; height:1px; background:rgba(255,255,255,0.1);"></div>
              <div style="position:absolute; left:50%; height:100%; width:1px; background:rgba(255,255,255,0.1);"></div>
              <div id="gh-pin" style="position:absolute; width:8px; height:8px; background:var(--danger); border-radius:50%; transform:translate(-50%, -50%); display:none;"></div>
            </div>
            <div style="flex:1; min-width:200px;">
              <div style="font-size:12px; margin-bottom:8px; color:var(--text-muted);">Click map to drop pin</div>
              <div style="margin-bottom:8px;"><strong>Lat:</strong> <span id="gh-lat">-</span></div>
              <div style="margin-bottom:8px;"><strong>Lon:</strong> <span id="gh-lon">-</span></div>
              <div style="margin-bottom:8px;"><strong>Geohash (Prec 5):</strong> <span id="gh-hash" style="font-family:var(--font-mono); font-weight:bold; color:var(--accent);">-</span></div>
            </div>
          </div>
        </div>
      `;
    },
    mount(root) {
      const grid = root.querySelector('#gh-grid');
      const pin = root.querySelector('#gh-pin');
      const latEl = root.querySelector('#gh-lat');
      const lonEl = root.querySelector('#gh-lon');
      const hashEl = root.querySelector('#gh-hash');

      // Simple Base32 Geohash mockup
      const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
      const encode = (lat, lon, precision = 5) => {
        let isEven = true;
        let latR = [-90, 90], lonR = [-180, 180];
        let bit = 0, ch = 0;
        let hash = "";

        while (hash.length < precision) {
          if (isEven) {
            let mid = (lonR[0] + lonR[1]) / 2;
            if (lon > mid) { ch |= (1 << (4 - bit)); lonR[0] = mid; } else { lonR[1] = mid; }
          } else {
            let mid = (latR[0] + latR[1]) / 2;
            if (lat > mid) { ch |= (1 << (4 - bit)); latR[0] = mid; } else { latR[1] = mid; }
          }
          isEven = !isEven;
          if (bit < 4) { bit++; } else { hash += BASE32[ch]; bit = 0; ch = 0; }
        }
        return hash;
      };

      grid.addEventListener('click', (e) => {
        const rect = grid.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        pin.style.left = `${x}px`;
        pin.style.top = `${y}px`;
        pin.style.display = 'block';

        // map x [0, 200] -> lon [-180, 180]
        // map y [0, 200] -> lat [90, -90] (inverted)
        const lon = ((x / 200) * 360) - 180;
        const lat = 90 - ((y / 200) * 180);

        latEl.textContent = lat.toFixed(4);
        lonEl.textContent = lon.toFixed(4);
        hashEl.textContent = encode(lat, lon, 5);
      });
    },
    unmount(root) {}
  };

  // ----------------------------------------------------------------------
  // S17: HyperLogLog Cardinality Estimator
  // ----------------------------------------------------------------------
  window.SIMULATORS["hyperloglog"] = {
    id: "hyperloglog",
    title: "HyperLogLog Cardinality Estimator",
    slugs: ["hyperloglog-cardinality-estimation"],
    blurb: "Estimate count of unique items using probabilistic data structures.",
    render() {
      return `
        <div class="simulator-card" id="sim-hll">
          <div class="simulator-card__header">
            <div class="simulator-card__title">HyperLogLog Estimator</div>
            <span class="badge badge--accent">O(1) Memory</span>
          </div>
          <div class="simulator-card__grid">
            <div>
              <label class="simulator-card__label">Unique Items to Stream:</label>
              <input type="number" id="hll-items" value="10000" step="1000" class="simulator-card__input" style="width:100%">
            </div>
            <div>
              <label class="simulator-card__label">Registers (m):</label>
              <select id="hll-m" class="simulator-card__input" style="width:100%">
                <option value="16">16 (low acc)</option>
                <option value="64">64</option>
                <option value="256" selected>256 (high acc)</option>
              </select>
            </div>
          </div>
          <button class="btn btn--primary" id="hll-run" style="margin-top:12px;">Run Stream</button>
          
          <div style="margin-top:16px; display:flex; gap:16px; background:var(--bg-card-alt); padding:12px; border-radius:4px;">
            <div style="flex:1;"><strong>Actual Count:</strong> <br><span id="hll-actual" style="font-size:18px;">0</span></div>
            <div style="flex:1;"><strong>HLL Estimate:</strong> <br><span id="hll-est" style="font-size:18px; color:var(--accent);">0</span></div>
            <div style="flex:1;"><strong>Error:</strong> <br><span id="hll-err" style="font-size:18px;">0%</span></div>
          </div>
        </div>
      `;
    },
    mount(root) {
      const btn = root.querySelector('#hll-run');
      const itemsEl = root.querySelector('#hll-items');
      const mEl = root.querySelector('#hll-m');
      
      const resAct = root.querySelector('#hll-actual');
      const resEst = root.querySelector('#hll-est');
      const resErr = root.querySelector('#hll-err');

      // simple hash returning 32-bit int
      const hashString = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return hash;
      };

      const getLeadingZeros = (num) => {
        let zeros = 1;
        for (let i = 31; i >= 0; i--) {
          if ((num & (1 << i)) === 0) zeros++; else break;
        }
        return zeros;
      };

      btn.addEventListener('click', () => {
        const count = parseInt(itemsEl.value);
        const m = parseInt(mEl.value);
        const registers = new Array(m).fill(0);
        
        // Compute alpha
        let alpha = 0.7213 / (1 + 1.079 / m);
        if (m === 16) alpha = 0.673;
        if (m === 64) alpha = 0.709;

        // Stream
        for (let i=0; i<count; i++) {
          // Add some noise to make unique strings
          const h = hashString("item_" + i + "_" + Math.random());
          const j = Math.abs(h) % m; // register index
          const w = Math.abs(h) / m; 
          const rho = getLeadingZeros(w);
          registers[j] = Math.max(registers[j], rho);
        }

        // Estimate: E = alpha * m^2 / sum(2^-M[j])
        let sum = 0;
        for (let i=0; i<m; i++) sum += Math.pow(2, -registers[i]);
        let E = alpha * m * m / sum;
        
        // Small range correction (simplified)
        if (E <= 2.5 * m) {
          let v = registers.filter(x => x === 0).length;
          if (v > 0) E = m * Math.log(m / v);
        }

        const est = Math.round(E);
        const err = Math.abs(est - count) / count * 100;

        resAct.textContent = count;
        resEst.textContent = est;
        resErr.textContent = err.toFixed(2) + '%';
        resErr.style.color = err < 5 ? 'var(--success)' : (err < 10 ? 'var(--warning)' : 'var(--danger)');
      });
    },
    unmount(root) {}
  };

  // ----------------------------------------------------------------------
  // S18: Inverted Index & BM25 Scorer
  // ----------------------------------------------------------------------
  window.SIMULATORS["bm25"] = {
    id: "bm25",
    title: "Inverted Index & BM25 Ranking",
    slugs: ["bm25-production-ranking"],
    blurb: "Search toy documents and view real-time TF-IDF/BM25 scoring.",
    render() {
      return `
        <div class="simulator-card" id="sim-bm25">
          <div class="simulator-card__header">
            <div class="simulator-card__title">BM25 Search Ranking</div>
            <span class="badge badge--info">Information Retrieval</span>
          </div>
          <div style="margin-bottom:12px;">
            <input type="text" id="bm25-q" placeholder="Type to search (e.g. distributed cache)..." class="simulator-card__input" style="width:100%; padding:8px;">
          </div>
          <div id="bm25-results" style="display:flex; flex-direction:column; gap:8px;">
            <!-- Results populate here -->
          </div>
        </div>
      `;
    },
    mount(root) {
      const input = root.querySelector('#bm25-q');
      const res = root.querySelector('#bm25-results');

      const docs = [
        { id: 1, text: "distributed cache replication and consensus" },
        { id: 2, text: "database replication and sharding" },
        { id: 3, text: "distributed consensus protocols like paxos" },
        { id: 4, text: "cache invalidation in distributed systems" }
      ];

      // Precompute basics
      const N = docs.length;
      let avgdl = 0;
      docs.forEach(d => {
        d.tokens = d.text.split(' ');
        avgdl += d.tokens.length;
      });
      avgdl /= N;

      input.addEventListener('input', () => {
        const query = input.value.toLowerCase().split(' ').filter(x => x.trim() !== '');
        if (query.length === 0) {
          res.innerHTML = '<div style="color:var(--text-muted); font-size:12px;">No query</div>';
          return;
        }

        // Calculate IDF for each query term
        const idf = {};
        query.forEach(q => {
          let n = docs.filter(d => d.tokens.includes(q)).length;
          idf[q] = Math.log(1 + (N - n + 0.5) / (n + 0.5)); // BM25 IDF
        });

        // Calculate scores
        const k1 = 1.5;
        const b = 0.75;
        
        docs.forEach(d => {
          let score = 0;
          query.forEach(q => {
            const f = d.tokens.filter(t => t === q).length;
            if (f > 0) {
              const num = f * (k1 + 1);
              const den = f + k1 * (1 - b + b * (d.tokens.length / avgdl));
              score += idf[q] * (num / den);
            }
          });
          d.score = score;
        });

        // Sort and render
        const sorted = [...docs].sort((x, y) => y.score - x.score);
        res.innerHTML = sorted.map(d => `
          <div style="background:var(--bg-card-alt); padding:8px; border-radius:4px; border-left: 3px solid ${d.score > 0 ? 'var(--accent)' : 'var(--border)'};">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <strong>Doc ${d.id}</strong>
              <span style="font-family:var(--font-mono); font-size:12px; color:${d.score > 0 ? 'var(--success)' : 'var(--text-muted)'};">Score: ${d.score.toFixed(3)}</span>
            </div>
            <div style="font-size:12px;">${d.text.replace(new RegExp(`(${query.join('|')})`, 'gi'), '<mark style="background:var(--accent); color:#000; padding:0 2px;">$1</mark>')}</div>
          </div>
        `).join('');
      });
      
      // Trigger initial empty state
      input.dispatchEvent(new Event('input'));
    },
    unmount(root) {}
  };

  // ----------------------------------------------------------------------
  // S19: CRDT Merge Playground
  // ----------------------------------------------------------------------
  window.SIMULATORS["crdt-merge"] = {
    id: "crdt-merge",
    title: "CRDT Merge Playground (PN-Counter)",
    slugs: ["collaborative-editing-system-design"],
    blurb: "Simulate offline edits on two nodes and resolve conflicts deterministically.",
    render() {
      return `
        <div class="simulator-card" id="sim-crdt">
          <div class="simulator-card__header">
            <div class="simulator-card__title">CRDT PN-Counter</div>
            <span class="badge badge--warning">Eventual Consistency</span>
          </div>
          <div class="simulator-card__grid" style="grid-template-columns: 1fr 1fr; margin-bottom:12px;">
            <div style="background:var(--bg-card-alt); padding:12px; border-radius:4px; text-align:center;">
              <strong>Node A</strong>
              <div style="font-size:24px; font-weight:bold; margin:8px 0;" id="crdt-a-val">0</div>
              <div style="display:flex; justify-content:center; gap:8px;">
                <button class="btn btn--secondary btn--sm crdt-btn" data-node="A" data-op="-1">-1</button>
                <button class="btn btn--secondary btn--sm crdt-btn" data-node="A" data-op="1">+1</button>
              </div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:8px;" id="crdt-a-state">State: P[0,0], N[0,0]</div>
            </div>
            <div style="background:var(--bg-card-alt); padding:12px; border-radius:4px; text-align:center;">
              <strong>Node B</strong>
              <div style="font-size:24px; font-weight:bold; margin:8px 0;" id="crdt-b-val">0</div>
              <div style="display:flex; justify-content:center; gap:8px;">
                <button class="btn btn--secondary btn--sm crdt-btn" data-node="B" data-op="-1">-1</button>
                <button class="btn btn--secondary btn--sm crdt-btn" data-node="B" data-op="1">+1</button>
              </div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:8px;" id="crdt-b-state">State: P[0,0], N[0,0]</div>
            </div>
          </div>
          <button class="btn btn--primary" id="crdt-sync" style="width:100%;">Sync & Merge</button>
        </div>
      `;
    },
    mount(root) {
      // PN-Counter State: [P_A, P_B], [N_A, N_B]
      let state = {
        A: { p: [0,0], n: [0,0] },
        B: { p: [0,0], n: [0,0] }
      };

      const updateUI = () => {
        ['A', 'B'].forEach((node, i) => {
          const s = state[node];
          const val = (s.p[0]+s.p[1]) - (s.n[0]+s.n[1]);
          root.querySelector(`#crdt-${node.toLowerCase()}-val`).textContent = val;
          root.querySelector(`#crdt-${node.toLowerCase()}-state`).textContent = `State: P[${s.p}], N[${s.n}]`;
        });
      };

      root.querySelectorAll('.crdt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const node = e.target.getAttribute('data-node');
          const idx = node === 'A' ? 0 : 1;
          const op = parseInt(e.target.getAttribute('data-op'));
          
          if (op > 0) state[node].p[idx]++;
          else state[node].n[idx]++;
          
          updateUI();
        });
      });

      root.querySelector('#crdt-sync').addEventListener('click', () => {
        // Merge A into B, and B into A using max()
        const newP = [ Math.max(state.A.p[0], state.B.p[0]), Math.max(state.A.p[1], state.B.p[1]) ];
        const newN = [ Math.max(state.A.n[0], state.B.n[0]), Math.max(state.A.n[1], state.B.n[1]) ];
        
        state.A.p = [...newP]; state.A.n = [...newN];
        state.B.p = [...newP]; state.B.n = [...newN];
        
        updateUI();
      });
      
      updateUI();
    },
    unmount(root) {}
  };

  // ----------------------------------------------------------------------
  // S20: Little's Law Explorer
  // ----------------------------------------------------------------------
  window.SIMULATORS["littles-law"] = {
    id: "littles-law",
    title: "Little's Law Explorer",
    slugs: ["concurrency-vs-parallelism", "load-shedding"],
    blurb: "Calculate required concurrency using L = λW.",
    render() {
      return `
        <div class="simulator-card" id="sim-littles">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Little's Law (L = λW)</div>
            <span class="badge badge--success">Calculator</span>
          </div>
          <div class="simulator-card__grid" style="grid-template-columns: 1fr;">
            <div>
              <label class="simulator-card__label">Arrival Rate / Throughput λ: <span id="ll-lam-val">100</span> req/s</label>
              <input type="range" id="ll-lam" min="10" max="1000" step="10" value="100" style="width:100%">
            </div>
            <div>
              <label class="simulator-card__label">Average Latency W: <span id="ll-w-val">50</span> ms</label>
              <input type="range" id="ll-w" min="1" max="1000" step="10" value="50" style="width:100%">
            </div>
          </div>
          <div style="margin-top:16px; padding:16px; background:var(--bg-card-alt); border-radius:8px; border-left:4px solid var(--accent);">
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">Required Concurrency (L) In-Flight:</div>
            <div style="font-size:32px; font-weight:bold;" id="ll-l-val">5</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:8px;" id="ll-rec">Recommendation: Configure connection pool / thread pool size to at least 5.</div>
          </div>
        </div>
      `;
    },
    mount(root) {
      const lam = root.querySelector('#ll-lam');
      const w = root.querySelector('#ll-w');
      const lamVal = root.querySelector('#ll-lam-val');
      const wVal = root.querySelector('#ll-w-val');
      const lVal = root.querySelector('#ll-l-val');
      const rec = root.querySelector('#ll-rec');

      const calc = () => {
        lamVal.textContent = lam.value;
        wVal.textContent = w.value;
        
        // L = λ * (W in seconds)
        const L = parseInt(lam.value) * (parseInt(w.value) / 1000);
        const Lceil = Math.ceil(L);
        lVal.textContent = L.toFixed(1);
        rec.textContent = \`Recommendation: Configure connection pool / thread pool size to at least \${Lceil}.\`;
      };

      lam.addEventListener('input', calc);
      w.addEventListener('input', calc);
      calc();
    },
    unmount(root) {}
  };

})();
