
window.SIMULATORS = window.SIMULATORS || {};

// S4: Cache Eviction Visualizer
window.SIMULATORS["cache-eviction"] = {
  id: "cache-eviction",
  title: "Cache Eviction Visualizer",
  slugs: ["cache-eviction-policies"],
  blurb: "Step through key accesses to compare LRU, LFU, and FIFO eviction.",
  render() {
    return `
      <div class="simulator-card" id="sim-cache">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>Cache Eviction Visualizer (Cap: 4)</span></div>
          <span class="badge badge--accent" id="sim-cache-policy">LRU</span>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
           <label>Policy:
             <select id="sim-cache-select">
               <option value="LRU">LRU</option>
               <option value="LFU">LFU</option>
               <option value="FIFO">FIFO</option>
             </select>
           </label>
           <button class="btn btn--outline" id="sim-cache-btn-a" style="margin-left:10px;">A</button>
           <button class="btn btn--outline" id="sim-cache-btn-b">B</button>
           <button class="btn btn--outline" id="sim-cache-btn-c">C</button>
           <button class="btn btn--outline" id="sim-cache-btn-d">D</button>
           <button class="btn btn--outline" id="sim-cache-btn-e">E</button>
           <button class="btn" id="sim-cache-btn-rand" style="margin-left:10px;">Random</button>
           <button class="btn btn--outline" id="sim-cache-btn-reset" style="margin-left:10px;">Reset</button>
        </div>
        <div style="padding: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;" id="sim-cache-slots">
           <!-- Slots rendered here -->
        </div>
        <div style="padding: 1rem; background: var(--bg-surface); border-top: 1px solid var(--border-color);">
           <div>Hits: <span id="sim-cache-hits">0</span> | Misses: <span id="sim-cache-misses">0</span> | Rate: <span id="sim-cache-rate">0</span>%</div>
           <div id="sim-cache-log" style="font-family: monospace; font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-muted); max-height: 80px; overflow-y: auto;"></div>
        </div>
      </div>
    `;
  },
  mount(root) {
    const policySelect = root.querySelector('#sim-cache-select');
    const policyBadge = root.querySelector('#sim-cache-policy');
    const slotsDiv = root.querySelector('#sim-cache-slots');
    const hitsEl = root.querySelector('#sim-cache-hits');
    const missesEl = root.querySelector('#sim-cache-misses');
    const rateEl = root.querySelector('#sim-cache-rate');
    const logEl = root.querySelector('#sim-cache-log');

    let cache = []; // [{key, freq, time, added}]
    let hits = 0;
    let misses = 0;
    let time = 0;
    const CAPACITY = 4;

    const renderSlots = () => {
      slotsDiv.innerHTML = cache.map(item => `
        <div style="width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px solid var(--accent-color); border-radius: 8px; background: var(--bg-surface);">
          <div style="font-size: 1.5rem; font-weight: bold;">${item.key}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${policySelect.value === 'LFU' ? 'f:' + item.freq : (policySelect.value === 'LRU' ? 't:' + item.time : 'a:' + item.added)}</div>
        </div>
      `).join('');
      // Empty slots
      for (let i = cache.length; i < CAPACITY; i++) {
        slotsDiv.innerHTML += `<div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border: 2px dashed var(--border-color); border-radius: 8px; background: var(--bg-body); color: var(--text-muted);">-</div>`;
      }
    };

    const updateStats = () => {
      hitsEl.textContent = hits;
      missesEl.textContent = misses;
      const total = hits + misses;
      rateEl.textContent = total > 0 ? Math.round((hits / total) * 100) : 0;
    };

    const log = (msg) => {
      const d = document.createElement('div');
      d.textContent = msg;
      logEl.prepend(d);
    };

    const access = (key) => {
      time++;
      const policy = policySelect.value;
      const idx = cache.findIndex(i => i.key === key);
      
      if (idx !== -1) {
        hits++;
        cache[idx].freq++;
        cache[idx].time = time;
        log(`Access ${key}: HIT`);
      } else {
        misses++;
        if (cache.length >= CAPACITY) {
          // Evict
          let evictIdx = 0;
          if (policy === 'LRU') {
             evictIdx = cache.reduce((minI, item, i, arr) => item.time < arr[minI].time ? i : minI, 0);
          } else if (policy === 'LFU') {
             evictIdx = cache.reduce((minI, item, i, arr) => {
               if (item.freq < arr[minI].freq) return i;
               if (item.freq === arr[minI].freq && item.time < arr[minI].time) return i;
               return minI;
             }, 0);
          } else if (policy === 'FIFO') {
             evictIdx = cache.reduce((minI, item, i, arr) => item.added < arr[minI].added ? i : minI, 0);
          }
          const evicted = cache[evictIdx];
          cache.splice(evictIdx, 1);
          log(`Access ${key}: MISS (Evicted ${evicted.key})`);
        } else {
          log(`Access ${key}: MISS`);
        }
        cache.push({ key, freq: 1, time, added: time });
      }
      renderSlots();
      updateStats();
    };

    const reset = () => {
      cache = [];
      hits = 0;
      misses = 0;
      time = 0;
      logEl.innerHTML = '';
      renderSlots();
      updateStats();
    };

    this.handlers = {
      changePolicy: (e) => { policyBadge.textContent = e.target.value; reset(); },
      a: () => access('A'),
      b: () => access('B'),
      c: () => access('C'),
      d: () => access('D'),
      e: () => access('E'),
      rand: () => {
        const keys = ['A', 'B', 'C', 'D', 'E'];
        access(keys[Math.floor(Math.random() * keys.length)]);
      },
      reset: reset
    };

    policySelect.addEventListener('change', this.handlers.changePolicy);
    root.querySelector('#sim-cache-btn-a').addEventListener('click', this.handlers.a);
    root.querySelector('#sim-cache-btn-b').addEventListener('click', this.handlers.b);
    root.querySelector('#sim-cache-btn-c').addEventListener('click', this.handlers.c);
    root.querySelector('#sim-cache-btn-d').addEventListener('click', this.handlers.d);
    root.querySelector('#sim-cache-btn-e').addEventListener('click', this.handlers.e);
    root.querySelector('#sim-cache-btn-rand').addEventListener('click', this.handlers.rand);
    root.querySelector('#sim-cache-btn-reset').addEventListener('click', this.handlers.reset);

    reset();
  },
  unmount(root) {
    if(!this.handlers) return;
    const policySelect = root.querySelector('#sim-cache-select');
    if(policySelect) policySelect.removeEventListener('change', this.handlers.changePolicy);
    ['a','b','c','d','e','rand','reset'].forEach(k => {
      const btn = root.querySelector(`#sim-cache-btn-${k}`);
      if(btn) btn.removeEventListener('click', this.handlers[k]);
    });
  }
};

// S5: Latency Budget Builder
window.SIMULATORS["latency-budget"] = {
  id: "latency-budget",
  title: "Latency Budget Builder",
  slugs: ["tail-latency", "non-functional-requirements"],
  blurb: "Visualize composite tail latency for serial vs parallel service hops.",
  render() {
    return `
      <div class="simulator-card" id="sim-latency">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>Latency Budget Builder</span></div>
          <span class="badge badge--accent" id="sim-latency-mode">Serial</span>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
           <label>Mode:
             <select id="sim-latency-select">
               <option value="Serial">Serial (A -> B -> C)</option>
               <option value="Parallel">Parallel (A calls B & C)</option>
             </select>
           </label>
           <button class="btn btn--outline" id="sim-latency-add" style="margin-left:10px;">Add Hop</button>
           <button class="btn btn--outline" id="sim-latency-rem" style="margin-left:10px;">Remove Hop</button>
        </div>
        <div id="sim-latency-hops" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
           <!-- Hops -->
        </div>
        <div style="padding: 1rem; background: var(--bg-surface); border-top: 1px solid var(--border-color);">
           <div style="font-weight: bold; margin-bottom: 0.5rem;">Composite Latency:</div>
           <div>p50: <span id="sim-latency-p50">0</span> ms | p99: <span id="sim-latency-p99">0</span> ms</div>
        </div>
      </div>
    `;
  },
  mount(root) {
    let hops = [
      { name: 'Gateway', p50: 10, p99: 50 },
      { name: 'Service', p50: 20, p99: 100 }
    ];
    let mode = 'Serial';

    const hopsContainer = root.querySelector('#sim-latency-hops');
    const modeSelect = root.querySelector('#sim-latency-select');
    const modeBadge = root.querySelector('#sim-latency-mode');
    const p50El = root.querySelector('#sim-latency-p50');
    const p99El = root.querySelector('#sim-latency-p99');

    const renderHops = () => {
      hopsContainer.innerHTML = hops.map((h, i) => `
        <div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px; background: var(--bg-body);">
          <div style="font-weight:bold; margin-bottom: 0.5rem;">${h.name} ${i+1}</div>
          <label>p50 (${h.p50}ms): <input type="range" min="1" max="200" value="${h.p50}" data-idx="${i}" class="hop-p50"></label>
          <label style="margin-left:1rem;">p99 (${h.p99}ms): <input type="range" min="5" max="1000" value="${h.p99}" data-idx="${i}" class="hop-p99"></label>
        </div>
      `).join('');

      // bind events
      root.querySelectorAll('.hop-p50').forEach(el => {
        el.addEventListener('input', (e) => {
           const val = parseInt(e.target.value);
           hops[e.target.dataset.idx].p50 = val;
           if (hops[e.target.dataset.idx].p99 < val) {
              hops[e.target.dataset.idx].p99 = val;
           }
           renderHops();
        });
      });
      root.querySelectorAll('.hop-p99').forEach(el => {
        el.addEventListener('input', (e) => {
           const val = parseInt(e.target.value);
           hops[e.target.dataset.idx].p99 = val;
           if (hops[e.target.dataset.idx].p50 > val) {
              hops[e.target.dataset.idx].p50 = val;
           }
           renderHops();
        });
      });
      
      calc();
    };

    const calc = () => {
      let compP50 = 0;
      let compP99 = 0;
      if (mode === 'Serial') {
         compP50 = hops.reduce((acc, h) => acc + h.p50, 0);
         compP99 = hops.reduce((acc, h) => acc + h.p99, 0);
      } else {
         compP50 = hops.reduce((acc, h) => Math.max(acc, h.p50), 0);
         compP99 = hops.reduce((acc, h) => Math.max(acc, h.p99), 0);
      }
      p50El.textContent = compP50;
      p99El.textContent = compP99;
    };

    this.handlers = {
      changeMode: (e) => { mode = e.target.value; modeBadge.textContent = mode; renderHops(); },
      add: () => { hops.push({ name: 'Hop', p50: 15, p99: 80 }); renderHops(); },
      rem: () => { if(hops.length > 1) { hops.pop(); renderHops(); } }
    };

    modeSelect.addEventListener('change', this.handlers.changeMode);
    root.querySelector('#sim-latency-add').addEventListener('click', this.handlers.add);
    root.querySelector('#sim-latency-rem').addEventListener('click', this.handlers.rem);

    renderHops();
  },
  unmount(root) {
    if(!this.handlers) return;
    const modeSelect = root.querySelector('#sim-latency-select');
    if(modeSelect) modeSelect.removeEventListener('change', this.handlers.changeMode);
    const addBtn = root.querySelector('#sim-latency-add');
    if(addBtn) addBtn.removeEventListener('click', this.handlers.add);
    const remBtn = root.querySelector('#sim-latency-rem');
    if(remBtn) remBtn.removeEventListener('click', this.handlers.rem);
  }
};

// S6: Fan-out (Push vs Pull vs Hybrid)
window.SIMULATORS["fan-out"] = {
  id: "fan-out",
  title: "Fan-out: Push vs Pull",
  slugs: ["feed-generation-push-pull-hybrid"],
  blurb: "Compare Write Amplification vs Read Amplification in Feed Generation.",
  render() {
    return `
      <div class="simulator-card" id="sim-fanout">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>Feed Fan-out Calculator</span></div>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display:flex; flex-direction:column; gap:0.5rem;">
           <label>Average Followers per User: <span id="sim-fo-avg-val">100</span><br>
             <input type="range" id="sim-fo-avg" min="10" max="10000" value="100" style="width:100%">
           </label>
           <label>Celebrity Followers: <span id="sim-fo-celeb-val">1,000,000</span><br>
             <input type="range" id="sim-fo-celeb" min="10000" max="10000000" step="10000" value="1000000" style="width:100%">
           </label>
           <label>Post Rate (req/sec): <span id="sim-fo-post-val">1,000</span><br>
             <input type="range" id="sim-fo-post" min="10" max="50000" step="100" value="1000" style="width:100%">
           </label>
           <label>Read Rate (req/sec): <span id="sim-fo-read-val">100,000</span><br>
             <input type="range" id="sim-fo-read" min="1000" max="1000000" step="1000" value="100000" style="width:100%">
           </label>
        </div>
        <div style="padding: 1rem; display:flex; gap:1rem;">
           <div style="flex:1; border: 1px solid var(--border-color); padding: 0.5rem; border-radius:4px;">
             <h4 style="margin-top:0">Push Model (Write Fan-out)</h4>
             <p>Writes/sec: <span id="sim-fo-push-w">0</span></p>
             <p>Reads/sec: <span id="sim-fo-push-r">0</span></p>
           </div>
           <div style="flex:1; border: 1px solid var(--border-color); padding: 0.5rem; border-radius:4px;">
             <h4 style="margin-top:0">Pull Model (Read Fan-out)</h4>
             <p>Writes/sec: <span id="sim-fo-pull-w">0</span></p>
             <p>Read Amplification: High (Compute intensive)</p>
           </div>
        </div>
      </div>
    `;
  },
  mount(root) {
    const avgEl = root.querySelector('#sim-fo-avg');
    const celebEl = root.querySelector('#sim-fo-celeb');
    const postEl = root.querySelector('#sim-fo-post');
    const readEl = root.querySelector('#sim-fo-read');

    const update = () => {
      root.querySelector('#sim-fo-avg-val').textContent = parseInt(avgEl.value).toLocaleString();
      root.querySelector('#sim-fo-celeb-val').textContent = parseInt(celebEl.value).toLocaleString();
      root.querySelector('#sim-fo-post-val').textContent = parseInt(postEl.value).toLocaleString();
      root.querySelector('#sim-fo-read-val').textContent = parseInt(readEl.value).toLocaleString();

      const pushWrites = parseInt(postEl.value) * parseInt(avgEl.value); // ignoring celeb for regular
      const pushReads = parseInt(readEl.value); // O(1) read
      
      root.querySelector('#sim-fo-push-w').textContent = pushWrites.toLocaleString() + " (High Amplification)";
      root.querySelector('#sim-fo-push-r').textContent = pushReads.toLocaleString();

      root.querySelector('#sim-fo-pull-w').textContent = parseInt(postEl.value).toLocaleString();
    };

    this.handlers = { update };
    [avgEl, celebEl, postEl, readEl].forEach(el => el.addEventListener('input', this.handlers.update));
    update();
  },
  unmount(root) {
    if(!this.handlers) return;
    const { update } = this.handlers;
    ['#sim-fo-avg', '#sim-fo-celeb', '#sim-fo-post', '#sim-fo-read'].forEach(sel => {
      const el = root.querySelector(sel);
      if(el) el.removeEventListener('input', update);
    });
  }
};

// S7: Replication Lag & Read-Your-Writes
window.SIMULATORS["replication-lag"] = {
  id: "replication-lag",
  title: "Replication Lag & Read-Your-Writes",
  slugs: ["replication", "consistency-models"],
  blurb: "Simulate asynchronous replication and see stale reads.",
  render() {
    return `
      <div class="simulator-card" id="sim-repl">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>Replication Consistency</span></div>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
           <label>Replication Lag: <span id="sim-repl-lag-val">1000</span> ms<br>
             <input type="range" id="sim-repl-lag" min="100" max="5000" step="100" value="1000" style="width:100%">
           </label>
           <div style="margin-top: 1rem; display:flex; gap:1rem;">
             <button class="btn" id="sim-repl-write">Write V=<span id="sim-repl-next">1</span></button>
             <button class="btn btn--outline" id="sim-repl-read-pri">Read Primary</button>
             <button class="btn btn--outline" id="sim-repl-read-sec">Read Replica</button>
           </div>
        </div>
        <div style="padding: 1rem; display:flex; gap:1rem; align-items:center;">
           <div style="flex:1; border: 2px solid var(--accent-color); border-radius:8px; padding:1rem; text-align:center;">
             <h4>Primary DB</h4>
             V=<span id="sim-repl-v-pri">0</span>
           </div>
           <div style="flex:1; border: 2px dashed var(--border-color); border-radius:8px; padding:1rem; text-align:center;">
             <h4>Replica DB</h4>
             V=<span id="sim-repl-v-sec">0</span>
             <div id="sim-repl-status" style="color:var(--text-muted); font-size:0.8rem; height:1rem; margin-top:0.5rem;"></div>
           </div>
        </div>
        <div id="sim-repl-log" style="padding: 1rem; font-family: monospace; font-size: 0.85rem; background: var(--bg-surface); max-height: 80px; overflow-y: auto;"></div>
      </div>
    `;
  },
  mount(root) {
    const lagEl = root.querySelector('#sim-repl-lag');
    const lagVal = root.querySelector('#sim-repl-lag-val');
    const writeBtn = root.querySelector('#sim-repl-write');
    const readPriBtn = root.querySelector('#sim-repl-read-pri');
    const readSecBtn = root.querySelector('#sim-repl-read-sec');
    const vPriEl = root.querySelector('#sim-repl-v-pri');
    const vSecEl = root.querySelector('#sim-repl-v-sec');
    const nextEl = root.querySelector('#sim-repl-next');
    const statusEl = root.querySelector('#sim-repl-status');
    const logEl = root.querySelector('#sim-repl-log');

    let currentV = 0;
    let replicaV = 0;
    let timer = null;

    const log = (msg, isStale = false) => {
      const d = document.createElement('div');
      d.textContent = msg;
      if (isStale) d.style.color = '#e74c3c';
      logEl.prepend(d);
    };

    this.handlers = {
      lag: (e) => { lagVal.textContent = e.target.value; },
      write: () => {
        currentV++;
        nextEl.textContent = currentV + 1;
        vPriEl.textContent = currentV;
        log(`Write V=${currentV} to Primary`);
        
        statusEl.textContent = "Syncing...";
        if (timer) clearTimeout(timer);
        const lagMs = parseInt(lagEl.value);
        const targetV = currentV;
        timer = setTimeout(() => {
          replicaV = targetV;
          vSecEl.textContent = replicaV;
          statusEl.textContent = "";
          log(`Replica caught up to V=${replicaV}`);
        }, lagMs);
      },
      readPri: () => {
        log(`Read Primary: V=${currentV}`);
      },
      readSec: () => {
        if (replicaV < currentV) {
           log(`Read Replica: V=${replicaV} (STALE!)`, true);
        } else {
           log(`Read Replica: V=${replicaV}`);
        }
      }
    };

    lagEl.addEventListener('input', this.handlers.lag);
    writeBtn.addEventListener('click', this.handlers.write);
    readPriBtn.addEventListener('click', this.handlers.readPri);
    readSecBtn.addEventListener('click', this.handlers.readSec);
  },
  unmount(root) {
    if(!this.handlers) return;
    const { lag, write, readPri, readSec } = this.handlers;
    root.querySelector('#sim-repl-lag')?.removeEventListener('input', lag);
    root.querySelector('#sim-repl-write')?.removeEventListener('click', write);
    root.querySelector('#sim-repl-read-pri')?.removeEventListener('click', readPri);
    root.querySelector('#sim-repl-read-sec')?.removeEventListener('click', readSec);
  }
};

// S8: CAP Partition Sandbox
window.SIMULATORS["cap-theorem"] = {
  id: "cap-theorem",
  title: "CAP Partition Sandbox",
  slugs: ["cap-and-pacelc"],
  blurb: "Simulate a network partition and choose CP or AP.",
  render() {
    return `
      <div class="simulator-card" id="sim-cap">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>CAP Sandbox</span></div>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display:flex; gap:1rem; align-items:center;">
           <label>Mode: 
             <select id="sim-cap-mode">
               <option value="AP">AP (Availability over Consistency)</option>
               <option value="CP">CP (Consistency over Availability)</option>
             </select>
           </label>
           <button class="btn btn--outline" id="sim-cap-part">Cut Partition (Isolate C)</button>
           <button class="btn" id="sim-cap-write">Write V++</button>
        </div>
        <div style="padding: 1rem; display:flex; gap:1rem; justify-content:space-around;" id="sim-cap-nodes">
           <div class="cap-node" id="cap-node-a" style="border: 2px solid var(--accent-color); padding: 1rem; text-align:center; border-radius:8px;">Node A<br>V=<span class="val">0</span></div>
           <div class="cap-node" id="cap-node-b" style="border: 2px solid var(--accent-color); padding: 1rem; text-align:center; border-radius:8px;">Node B<br>V=<span class="val">0</span></div>
           <div class="cap-node" id="cap-node-c" style="border: 2px solid var(--accent-color); padding: 1rem; text-align:center; border-radius:8px;">Node C<br>V=<span class="val">0</span></div>
        </div>
        <div id="sim-cap-log" style="padding: 1rem; font-family: monospace; font-size: 0.85rem; background: var(--bg-surface); max-height: 80px; overflow-y: auto;"></div>
      </div>
    `;
  },
  mount(root) {
    const modeSelect = root.querySelector('#sim-cap-mode');
    const partBtn = root.querySelector('#sim-cap-part');
    const writeBtn = root.querySelector('#sim-cap-write');
    const logEl = root.querySelector('#sim-cap-log');
    const nodes = [
      { id: 'a', el: root.querySelector('#cap-node-a .val'), v: 0 },
      { id: 'b', el: root.querySelector('#cap-node-b .val'), v: 0 },
      { id: 'c', el: root.querySelector('#cap-node-c .val'), v: 0 }
    ];

    let partitioned = false;
    let v = 0;

    const log = (msg, err = false) => {
      const d = document.createElement('div');
      d.textContent = msg;
      if (err) d.style.color = '#e74c3c';
      logEl.prepend(d);
    };

    const updateNodes = () => {
      nodes.forEach(n => n.el.textContent = n.v);
    };

    this.handlers = {
      part: () => {
        partitioned = !partitioned;
        partBtn.textContent = partitioned ? "Heal Partition" : "Cut Partition (Isolate C)";
        root.querySelector('#cap-node-c').style.borderColor = partitioned ? '#e74c3c' : 'var(--accent-color)';
        if (!partitioned) {
           log("Partition healed. Syncing nodes...");
           const maxV = Math.max(...nodes.map(n => n.v));
           nodes.forEach(n => n.v = maxV);
           v = maxV;
           updateNodes();
        } else {
           log("Network Partition created. Node C isolated.");
        }
      },
      write: () => {
        v++;
        const mode = modeSelect.value;
        if (!partitioned) {
          nodes.forEach(n => n.v = v);
          log(`Write V=${v} SUCCESS (All nodes synced)`);
        } else {
          if (mode === 'CP') {
             // Consistency over Availability: Write fails because C cannot acknowledge
             v--; // Rollback
             log(`Write V=${v+1} FAILED: Cannot reach Node C (CP Mode)`, true);
          } else {
             // Availability over Consistency: Write succeeds on A & B, C diverges
             nodes[0].v = v;
             nodes[1].v = v;
             // C remains at old value
             log(`Write V=${v} SUCCESS: A & B updated, C stale (AP Mode)`);
          }
        }
        updateNodes();
      }
    };

    partBtn.addEventListener('click', this.handlers.part);
    writeBtn.addEventListener('click', this.handlers.write);
  },
  unmount(root) {
    if(!this.handlers) return;
    const { part, write } = this.handlers;
    root.querySelector('#sim-cap-part')?.removeEventListener('click', part);
    root.querySelector('#sim-cap-write')?.removeEventListener('click', write);
  }
};

// S9: Raft Election Simulator
window.SIMULATORS["raft-election"] = {
  id: "raft-election",
  title: "Raft Election Simulator",
  slugs: ["consensus", "leader-election"],
  blurb: "Simulate leader election with heartbeat timeouts and votes.",
  render() {
    return `
      <div class="simulator-card" id="sim-raft">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>Raft Consensus (3 Nodes)</span></div>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display:flex; gap:1rem;">
           <button class="btn btn--outline" id="sim-raft-kill">Kill Leader</button>
           <button class="btn" id="sim-raft-heal">Restart All</button>
        </div>
        <div style="padding: 1rem; display:flex; justify-content:space-around;" id="sim-raft-nodes">
           <!-- Rendered via JS -->
        </div>
        <div id="sim-raft-log" style="padding: 1rem; font-family: monospace; font-size: 0.85rem; background: var(--bg-surface); max-height: 80px; overflow-y: auto;"></div>
      </div>
    `;
  },
  mount(root) {
    const nodesDiv = root.querySelector('#sim-raft-nodes');
    const logEl = root.querySelector('#sim-raft-log');
    
    let term = 1;
    let nodes = [
      { id: '1', state: 'Follower', term: 1, timer: null, alive: true },
      { id: '2', state: 'Follower', term: 1, timer: null, alive: true },
      { id: '3', state: 'Follower', term: 1, timer: null, alive: true }
    ];
    // Start with 1 as leader
    nodes[0].state = 'Leader';
    
    const log = (msg) => {
      const d = document.createElement('div');
      d.textContent = msg;
      logEl.prepend(d);
    };

    const render = () => {
      nodesDiv.innerHTML = nodes.map(n => `
        <div style="border: 2px solid ${!n.alive ? '#7f8c8d' : (n.state === 'Leader' ? 'var(--accent-color)' : (n.state==='Candidate' ? '#f39c12' : '#bdc3c7'))}; padding: 1rem; border-radius:8px; text-align:center; width:80px;">
          <div style="font-weight:bold; font-size:1.2rem;">Node ${n.id}</div>
          <div style="font-size:0.8rem; margin-top:0.5rem; color:${!n.alive?'#7f8c8d':''} ">${!n.alive ? 'DEAD' : n.state}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">Term ${n.term}</div>
        </div>
      `).join('');
    };

    const resetTimers = () => {
      nodes.forEach(n => {
        if (n.timer) clearTimeout(n.timer);
        if (n.alive && n.state !== 'Leader') {
          n.timer = setTimeout(() => triggerElection(n.id), 1500 + Math.random() * 1500);
        }
      });
    };

    const triggerElection = (id) => {
      const n = nodes.find(x => x.id === id);
      if (!n || !n.alive || n.state === 'Leader') return;
      
      term++;
      n.term = term;
      n.state = 'Candidate';
      log(`Node ${id} timed out, starting election for Term ${term}...`);
      render();
      
      // Request votes
      setTimeout(() => {
        if (n.state !== 'Candidate') return;
        let votes = 1; // votes for self
        nodes.forEach(peer => {
          if (peer.id !== id && peer.alive && peer.term <= term) {
            peer.term = term;
            votes++;
          }
        });
        if (votes >= 2) {
          n.state = 'Leader';
          log(`Node ${id} elected LEADER for Term ${term} with ${votes} votes`);
          nodes.forEach(peer => { if (peer.id !== id && peer.alive) peer.state = 'Follower'; });
          resetTimers();
          render();
        }
      }, 500);
    };

    this.handlers = {
      kill: () => {
        const leader = nodes.find(n => n.state === 'Leader');
        if (leader) {
          leader.alive = false;
          leader.state = 'Follower';
          log(`Node ${leader.id} (Leader) killed!`);
          render();
          // Heartbeats stop, followers will timeout
        }
      },
      heal: () => {
        nodes.forEach(n => { n.alive = true; n.state = 'Follower'; });
        term++;
        nodes[0].state = 'Leader';
        nodes.forEach(n => n.term = term);
        log(`Cluster restarted. Node 1 is Leader for Term ${term}`);
        render();
        resetTimers();
      }
    };

    root.querySelector('#sim-raft-kill').addEventListener('click', this.handlers.kill);
    root.querySelector('#sim-raft-heal').addEventListener('click', this.handlers.heal);

    render();
    resetTimers();
    this.timerCleanup = () => { nodes.forEach(n => { if (n.timer) clearTimeout(n.timer); }); };
  },
  unmount(root) {
    if(!this.handlers) return;
    if (this.timerCleanup) this.timerCleanup();
    root.querySelector('#sim-raft-kill')?.removeEventListener('click', this.handlers.kill);
    root.querySelector('#sim-raft-heal')?.removeEventListener('click', this.handlers.heal);
  }
};

// S10: Bloom Filter Visualizer
window.SIMULATORS["bloom-filter"] = {
  id: "bloom-filter",
  title: "Bloom Filter Visualizer",
  slugs: ["bloom-filters", "seen-filtering-with-bloom-filters"],
  blurb: "Add elements and visualize bit hashing to see false positive probabilities.",
  render() {
    return `
      <div class="simulator-card" id="sim-bloom">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>Bloom Filter (m=16, k=3)</span></div>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display:flex; gap:1rem;">
           <input type="text" id="sim-bloom-inp" placeholder="Enter word..." style="padding: 0.5rem; border:1px solid var(--border-color); border-radius:4px; flex:1;">
           <button class="btn btn--outline" id="sim-bloom-add">Add</button>
           <button class="btn btn--outline" id="sim-bloom-check">Check</button>
           <button class="btn" id="sim-bloom-reset">Reset</button>
        </div>
        <div style="padding: 1rem; display:flex; flex-wrap:wrap; gap:0.25rem;" id="sim-bloom-bits">
           <!-- Bits -->
        </div>
        <div style="padding: 1rem; background: var(--bg-surface); display:flex; justify-content:space-between; align-items:center;">
           <div id="sim-bloom-res" style="font-weight:bold;"></div>
           <div style="font-size:0.85rem; color:var(--text-muted);">Elements (n): <span id="sim-bloom-n">0</span> | False Pos Prob: <span id="sim-bloom-prob">0.00</span>%</div>
        </div>
      </div>
    `;
  },
  mount(root) {
    const M = 16;
    const K = 3;
    let bits = new Array(M).fill(0);
    let n = 0;

    const bitsDiv = root.querySelector('#sim-bloom-bits');
    const inp = root.querySelector('#sim-bloom-inp');
    const resEl = root.querySelector('#sim-bloom-res');
    const nEl = root.querySelector('#sim-bloom-n');
    const probEl = root.querySelector('#sim-bloom-prob');

    const simpleHash = (str, seed) => {
      let h = seed;
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i) | 0;
      }
      return Math.abs(h) % M;
    };

    const renderBits = (highlight = []) => {
      bitsDiv.innerHTML = bits.map((b, i) => `
        <div style="width: 30px; height: 30px; display:flex; align-items:center; justify-content:center; border: 1px solid ${highlight.includes(i) ? 'var(--accent-color)' : 'var(--border-color)'}; background: ${b ? 'var(--accent-color)' : 'var(--bg-body)'}; color: ${b ? '#fff' : 'var(--text-muted)'}; font-size:0.8rem; font-weight:bold; border-radius:4px;">
          ${b}
        </div>
      `).join('');
    };

    const updateStats = () => {
      nEl.textContent = n;
      // p ≈ (1 - e^(-kn/m))^k
      const p = Math.pow(1 - Math.exp(-K * n / M), K);
      probEl.textContent = (p * 100).toFixed(2);
    };

    this.handlers = {
      add: () => {
        const val = inp.value.trim();
        if (!val) return;
        const h1 = simpleHash(val, 1);
        const h2 = simpleHash(val, 2);
        const h3 = simpleHash(val, 3);
        bits[h1] = 1; bits[h2] = 1; bits[h3] = 1;
        n++;
        renderBits([h1, h2, h3]);
        updateStats();
        resEl.textContent = `Added "${val}"`;
        resEl.style.color = "var(--text-color)";
        inp.value = '';
      },
      check: () => {
        const val = inp.value.trim();
        if (!val) return;
        const h1 = simpleHash(val, 1);
        const h2 = simpleHash(val, 2);
        const h3 = simpleHash(val, 3);
        renderBits([h1, h2, h3]);
        if (bits[h1] && bits[h2] && bits[h3]) {
          resEl.textContent = `"${val}" Might Exist (Possible False Positive)`;
          resEl.style.color = "#f39c12";
        } else {
          resEl.textContent = `"${val}" Definitely NOT in set`;
          resEl.style.color = "#27ae60";
        }
      },
      reset: () => {
        bits = new Array(M).fill(0);
        n = 0;
        resEl.textContent = '';
        renderBits();
        updateStats();
      }
    };

    root.querySelector('#sim-bloom-add').addEventListener('click', this.handlers.add);
    root.querySelector('#sim-bloom-check').addEventListener('click', this.handlers.check);
    root.querySelector('#sim-bloom-reset').addEventListener('click', this.handlers.reset);

    renderBits();
  },
  unmount(root) {
    if(!this.handlers) return;
    root.querySelector('#sim-bloom-add')?.removeEventListener('click', this.handlers.add);
    root.querySelector('#sim-bloom-check')?.removeEventListener('click', this.handlers.check);
    root.querySelector('#sim-bloom-reset')?.removeEventListener('click', this.handlers.reset);
  }
};

// S11: LSM vs B-Tree Write Path
window.SIMULATORS["lsm-btree"] = {
  id: "lsm-btree",
  title: "Storage Engine Write Path (LSM vs B-Tree)",
  slugs: ["lsm-tree-storage-engine", "b-tree"],
  blurb: "Compare Sequential vs Random write amplification in LSM Trees and B-Trees.",
  render() {
    return `
      <div class="simulator-card" id="sim-lsm">
        <div class="simulator-card__header">
          <div class="simulator-card__title"><span>Storage Write Amplifier</span></div>
        </div>
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display:flex; gap:1rem; align-items:center;">
           <label>Workload:
             <select id="sim-lsm-workload">
               <option value="sequential">Sequential Writes (Log/Time-series)</option>
               <option value="random">Random Writes (Updates)</option>
             </select>
           </label>
           <button class="btn" id="sim-lsm-write">Execute 100 Writes</button>
        </div>
        <div style="padding: 1rem; display:flex; gap:1rem;">
           <div style="flex:1; border: 2px solid var(--accent-color); padding: 1rem; border-radius:8px;">
             <h4 style="margin-top:0">LSM-Tree</h4>
             <p style="font-size:0.85rem; color:var(--text-muted);">Memtable Append -> SSTable Flush</p>
             <div>Total I/O: <span id="sim-lsm-io" style="font-weight:bold;">0</span> ops</div>
             <div style="width:100%; background:var(--bg-body); height:20px; border-radius:10px; margin-top:0.5rem; overflow:hidden;">
               <div id="sim-lsm-bar" style="width:0%; background:var(--accent-color); height:100%; transition: width 0.3s;"></div>
             </div>
           </div>
           <div style="flex:1; border: 2px dashed var(--border-color); padding: 1rem; border-radius:8px;">
             <h4 style="margin-top:0">B-Tree</h4>
             <p style="font-size:0.85rem; color:var(--text-muted);">In-place Page Update -> Dirty Flush</p>
             <div>Total I/O: <span id="sim-btree-io" style="font-weight:bold;">0</span> ops</div>
             <div style="width:100%; background:var(--bg-body); height:20px; border-radius:10px; margin-top:0.5rem; overflow:hidden;">
               <div id="sim-btree-bar" style="width:0%; background:#e74c3c; height:100%; transition: width 0.3s;"></div>
             </div>
           </div>
        </div>
        <div id="sim-lsm-desc" style="padding: 1rem; font-size:0.9rem; background:var(--bg-surface);"></div>
      </div>
    `;
  },
  mount(root) {
    const workloadSelect = root.querySelector('#sim-lsm-workload');
    const writeBtn = root.querySelector('#sim-lsm-write');
    const lsmIo = root.querySelector('#sim-lsm-io');
    const btreeIo = root.querySelector('#sim-btree-io');
    const lsmBar = root.querySelector('#sim-lsm-bar');
    const btreeBar = root.querySelector('#sim-btree-bar');
    const desc = root.querySelector('#sim-lsm-desc');

    let totalLsm = 0;
    let totalBtree = 0;

    this.handlers = {
      write: () => {
        const type = workloadSelect.value;
        const writes = 100;
        
        if (type === 'sequential') {
          // Sequential: LSM appends (very low I/O, mostly sequential flush). BTree append to rightmost page (also efficient, some page splits).
          totalLsm += 10; // batching in memtable
          totalBtree += 25;
          desc.textContent = "Sequential Writes: Both perform well. LSM writes to Memtable and sequentially flushes. B-Tree appends to the rightmost node efficiently.";
        } else {
          // Random: LSM still appends to Memtable. B-Tree does random page reads and dirty page flushes (high write amplification).
          totalLsm += 15; // appends + background compaction overhead modeled roughly
          totalBtree += 300; // lots of random page loads and flushes + page splits
          desc.textContent = "Random Writes: B-Tree suffers from High Write Amplification (read-modify-write page). LSM converts random writes to sequential log appends.";
        }
        
        lsmIo.textContent = totalLsm;
        btreeIo.textContent = totalBtree;
        
        const max = Math.max(totalLsm, totalBtree, 1);
        lsmBar.style.width = (totalLsm / max * 100) + '%';
        btreeBar.style.width = (totalBtree / max * 100) + '%';
      }
    };

    writeBtn.addEventListener('click', this.handlers.write);
  },
  unmount(root) {
    if(!this.handlers) return;
    root.querySelector('#sim-lsm-write')?.removeEventListener('click', this.handlers.write);
  }
};
