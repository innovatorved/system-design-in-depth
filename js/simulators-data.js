/* ═══════════════════════════════════════════════════════════════
   Simulators: MVCC isolation, adaptive bitrate, ray casting, WAL recovery
   Same contract as the other simulator files: { id, title, slugs, blurb, render(), mount(root), unmount(root) }
   ═══════════════════════════════════════════════════════════════ */

window.SIMULATORS = window.SIMULATORS || {};

(() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

  // Tracks listeners/timers per mount so unmount can always clean up
  function lifecycle() {
    const offs = [];
    const timers = new Set();
    return {
      on(el, ev, fn) { if (!el) return; el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); },
      every(ms, fn) { const t = setInterval(fn, ms); timers.add(t); return t; },
      stop(t) { clearInterval(t); timers.delete(t); },
      dispose() { offs.splice(0).forEach(f => f()); timers.forEach(t => clearInterval(t)); timers.clear(); }
    };
  }

  const KIND_COLOR = { anomaly: 'var(--error)', prevented: 'var(--success)', aborted: 'var(--warning)' };
  const LOG_CLASS = { good: 'is-good', bad: 'is-bad' };

  // ── MVCC and isolation levels (PostgreSQL semantics) ───────
  const MV_LEVELS = { rc: 'Read Committed', rr: 'Repeatable Read (snapshot)', ser: 'Serializable (SSI)' };
  const MV_SCENARIOS = {
    dirty: {
      name: 'Dirty read',
      table: 'accounts', keyCol: 'id', valCol: 'balance',
      init: { A: 100, B: 50 },
      story: 'T1 empties account A but then rolls back. Can T2 ever see the balance that was never committed?',
      steps: [
        { t: 1, op: 'begin' }, { t: 2, op: 'begin' },
        { t: 1, op: 'update', key: 'A', val: () => 0, sql: "UPDATE accounts SET balance = 0 WHERE id = 'A'" },
        { t: 2, op: 'read', key: 'A', as: 'a', sql: "SELECT balance FROM accounts WHERE id = 'A'" },
        { t: 1, op: 'rollback' },
        { t: 2, op: 'commit' }
      ],
      check(e) {
        const r = e.tx[2].vars.a;
        if (r === 0) return { kind: 'anomaly', text: 'T2 read 0, a value that was never committed.' };
        return { kind: 'prevented', text: `T2 read ${r}, the last committed value. T1's new version had xmin = an in-progress xid, so it was invisible. PostgreSQL never shows uncommitted versions at any level; READ UNCOMMITTED behaves like READ COMMITTED.` };
      }
    },
    nonrep: {
      name: 'Non-repeatable read',
      table: 'accounts', keyCol: 'id', valCol: 'balance',
      init: { A: 100, B: 50 },
      story: 'T1 reads A twice. In between, T2 changes A and commits. Does T1 see two different values?',
      steps: [
        { t: 1, op: 'begin' }, { t: 2, op: 'begin' },
        { t: 1, op: 'read', key: 'A', as: 'a1', sql: "SELECT balance FROM accounts WHERE id = 'A'" },
        { t: 2, op: 'update', key: 'A', val: () => 50, sql: "UPDATE accounts SET balance = 50 WHERE id = 'A'" },
        { t: 2, op: 'commit' },
        { t: 1, op: 'read', key: 'A', as: 'a2', sql: "SELECT balance FROM accounts WHERE id = 'A'" },
        { t: 1, op: 'commit' }
      ],
      check(e) {
        const { a1, a2 } = e.tx[1].vars;
        if (a1 !== a2) return { kind: 'anomaly', text: `T1 read ${a1}, then ${a2}: Read Committed takes a fresh snapshot for every statement, so the second read sees T2's commit.` };
        return { kind: 'prevented', text: `T1 read ${a1} both times: its snapshot was taken at its first statement and T2 (still in progress then) stays invisible for the whole transaction. No abort is needed because T1 only reads.` };
      }
    },
    lost: {
      name: 'Lost update',
      table: 'accounts', keyCol: 'id', valCol: 'balance',
      init: { A: 100, B: 50 },
      story: 'Both transactions do read-modify-write in the application: read A, add a deposit, write the computed value back. T1 deposits 10, T2 deposits 20; the correct result is 130.',
      steps: [
        { t: 1, op: 'begin' }, { t: 2, op: 'begin' },
        { t: 1, op: 'read', key: 'A', as: 'a', sql: "SELECT balance FROM accounts WHERE id = 'A'" },
        { t: 2, op: 'read', key: 'A', as: 'a', sql: "SELECT balance FROM accounts WHERE id = 'A'" },
        { t: 1, op: 'update', key: 'A', val: v => v.a + 10, sql: v => `UPDATE accounts SET balance = ${v.a ?? ':a'} + 10 WHERE id = 'A'` },
        { t: 2, op: 'update', key: 'A', val: v => v.a + 20, sql: v => `UPDATE accounts SET balance = ${v.a ?? ':a'} + 20 WHERE id = 'A'` },
        { t: 1, op: 'commit' },
        { t: 2, op: 'commit' }
      ],
      check(e) {
        const fin = e.committedValue('A');
        if (e.tx[2].state === 'aborted') return { kind: 'aborted', text: `T2 hit "could not serialize access due to concurrent update" (first updater wins). Final balance ${fin}; the application must retry T2, which then reads 110 and writes 130.` };
        if (fin !== 130) return { kind: 'anomaly', text: `Final balance ${fin}, not 130: T2 waited for T1's row lock, then Read Committed re-checked the newest row version and overwrote it with the value it computed from its stale read. T1's deposit is lost. (Writing SET balance = balance + 20 would have been safe here.)` };
        return { kind: 'prevented', text: `Final balance ${fin}.` };
      }
    },
    skew: {
      name: 'Write skew (on-call doctors)',
      table: 'doctors', keyCol: 'name', valCol: 'on_call',
      init: { alice: true, bob: true },
      story: 'Rule: at least one doctor must stay on call. Alice and Bob each check that 2 are on call, then take themselves off. They update different rows, so no row lock ever conflicts.',
      steps: [
        { t: 1, op: 'begin' }, { t: 2, op: 'begin' },
        { t: 1, op: 'count', as: 'n', sql: 'SELECT count(*) FROM doctors WHERE on_call' },
        { t: 2, op: 'count', as: 'n', sql: 'SELECT count(*) FROM doctors WHERE on_call' },
        { t: 1, op: 'update', key: 'alice', val: () => false, guard: v => v.n >= 2, sql: v => `UPDATE doctors SET on_call = false WHERE name = 'alice'  -- app saw ${v.n ?? ':n'} on call` },
        { t: 2, op: 'update', key: 'bob', val: () => false, guard: v => v.n >= 2, sql: v => `UPDATE doctors SET on_call = false WHERE name = 'bob'  -- app saw ${v.n ?? ':n'} on call` },
        { t: 1, op: 'commit' },
        { t: 2, op: 'commit' }
      ],
      check(e) {
        const n = ['alice', 'bob'].filter(k => e.committedValue(k) === true).length;
        if (e.tx[2].state === 'aborted' || e.tx[1].state === 'aborted') return { kind: 'aborted', text: `SSI saw a cycle of read/write dependencies (T1 read bob, which T2 wrote; T2 read alice, which T1 wrote) and aborted the transaction that committed second. ${n} doctor(s) still on call; the retry will see only 1 on call and refuse.` };
        if (n === 0) return { kind: 'anomaly', text: 'Both commits succeeded and nobody is on call. Snapshot isolation only detects write-write conflicts on the same row; these two wrote different rows, so Repeatable Read allows the skew too.' };
        return { kind: 'prevented', text: `${n} doctor(s) on call.` };
      }
    }
  };

  function mvEngine(sc, level) {
    const status = { 100: 'committed' };
    let nextXid = 101, pc = 0;
    const rows = Object.entries(sc.init).map(([key, val]) => ({ key, val, xmin: 100, xmax: null }));
    const tx = {};
    [1, 2].forEach(n => { tx[n] = { n, xid: null, snap: null, state: 'idle', vars: {}, reads: new Set(), inC: new Set(), outC: new Set(), waitOn: null, pendingIdx: null }; });
    const results = [];
    const byXid = x => Object.values(tx).find(T => T.xid === x);
    const takeSnap = () => ({ xmax: nextXid, xip: Object.keys(status).map(Number).filter(x => status[x] === 'in-progress') });
    const snapFor = T => { if (level === 'rc' || !T.snap) T.snap = takeSnap(); return T.snap; };
    // Is transaction xid's work visible to T under snapshot snap?
    const seen = (xid, T, snap) => xid === T.xid || (status[xid] === 'committed' && xid < snap.xmax && !snap.xip.includes(xid));
    const visibleTo = (v, T, snap) => seen(v.xmin, T, snap) && !(v.xmax && seen(v.xmax, T, snap));
    const res = (i, text, kind = '') => { results[i] = { text, kind }; };
    const addRW = (reader, writer) => { if (!reader || !writer || reader === writer) return; reader.outC.add(writer.n); writer.inC.add(reader.n); };
    const committedValue = key => { const v = rows.find(r => r.key === key && status[r.xmin] === 'committed' && !(r.xmax && status[r.xmax] === 'committed')); return v ? v.val : undefined; };

    // SSI: reading a key whose newer version was written by a concurrent txn creates reader -rw-> writer
    const ssiRead = (T, key, snap) => {
      if (level !== 'ser') return;
      T.reads.add(key);
      rows.filter(v => v.key === key && v.xmin !== T.xid && status[v.xmin] !== 'aborted' && !seen(v.xmin, T, snap)).forEach(v => addRW(T, byXid(v.xmin)));
    };
    const ssiWrite = (T, key) => {
      if (level !== 'ser') return;
      Object.values(tx).forEach(U => { if (U !== T && U.state !== 'aborted' && U.reads.has(key)) addRW(U, T); });
    };

    const abort = T => { status[T.xid] = 'aborted'; T.state = 'aborted'; wake(T); };
    const wake = T => {
      Object.values(tx).forEach(W => {
        if (W.state === 'waiting' && W.waitOn === T.xid) {
          const j = W.pendingIdx, before = results[j].text;
          W.state = 'active'; W.waitOn = null; W.pendingIdx = null;
          doUpdate(W, sc.steps[j], j, true);
          results[j] = { text: `${before} → T${T.n} ${T.state === 'committed' ? 'committed' : 'aborted'} → ${results[j].text}`, kind: results[j].kind };
        }
      });
    };

    function doUpdate(T, st, i, resumed) {
      if (st.guard && !st.guard(T.vars)) return res(i, 'skipped: application check failed');
      const snap = resumed ? T.snap : snapFor(T);
      let v = rows.find(r => r.key === st.key && visibleTo(r, T, snap));
      let note = '';
      while (v && v.xmax && v.xmax !== T.xid && status[v.xmax] !== 'aborted') {
        if (status[v.xmax] === 'in-progress') {
          T.state = 'waiting'; T.waitOn = v.xmax; T.pendingIdx = i;
          return res(i, `blocked: row locked by T${byXid(v.xmax).n} (xmax = ${v.xmax})`, 'wait');
        }
        // the row was updated by a transaction that committed after our snapshot
        if (level !== 'rc') { abort(T); return res(i, 'ERROR: could not serialize access due to concurrent update', 'bad'); }
        const holder = v.xmax;
        v = rows.find(r => r.key === st.key && r.xmin === holder);
        note = ` after re-reading the newest version (xmin ${holder})`;
      }
      if (!v) return res(i, 'UPDATE 0');
      const val = st.val(T.vars);
      v.xmax = T.xid;
      rows.push({ key: st.key, val, xmin: T.xid, xmax: null });
      ssiWrite(T, st.key);
      res(i, `UPDATE 1${note}: new version ${st.key} = ${val} (xmin ${T.xid})`, 'good');
    }

    function exec(st, i) {
      const T = tx[st.t];
      if (T.state === 'waiting') return res(i, 'still blocked on a row lock', 'wait');
      if (T.state === 'aborted' && st.op !== 'commit' && st.op !== 'rollback') return res(i, 'ERROR: current transaction is aborted, commands ignored until end of transaction block', 'bad');
      switch (st.op) {
        case 'begin':
          T.xid = nextXid++; status[T.xid] = 'in-progress'; T.state = 'active';
          return res(i, `BEGIN ISOLATION LEVEL ${MV_LEVELS[level].replace(/ \(.*\)/, '').toUpperCase()} (xid ${T.xid})`);
        case 'read': {
          const snap = snapFor(T);
          const v = rows.find(r => r.key === st.key && visibleTo(r, T, snap));
          ssiRead(T, st.key, snap);
          T.vars[st.as] = v ? v.val : null;
          return res(i, `→ ${v ? v.val : '(no row)'} (version xmin ${v ? v.xmin : '-'})`);
        }
        case 'count': {
          const snap = snapFor(T);
          const keys = [...new Set(rows.map(r => r.key))];
          const n = keys.filter(k => { const v = rows.find(r => r.key === k && visibleTo(r, T, snap)); return v && v.val === true; }).length;
          keys.forEach(k => ssiRead(T, k, snap));
          T.vars[st.as] = n;
          return res(i, `→ ${n}`);
        }
        case 'update': return doUpdate(T, st, i, false);
        case 'commit':
          if (T.state === 'aborted') return res(i, 'ROLLBACK (the transaction had already failed)', 'bad');
          if (level === 'ser' && T.inC.size && [...T.outC].some(n => tx[n].state === 'committed')) {
            abort(T);
            return res(i, 'ERROR: could not serialize access due to read/write dependencies among transactions', 'bad');
          }
          status[T.xid] = 'committed'; T.state = 'committed';
          res(i, 'COMMIT', 'good'); wake(T); return;
        case 'rollback':
          if (T.state !== 'aborted') abort(T);
          return res(i, 'ROLLBACK');
      }
    }

    return {
      rows, tx, status, results, committedValue, visibleTo,
      get pc() { return pc; },
      get done() { return pc >= sc.steps.length; },
      step() { if (pc >= sc.steps.length) return false; exec(sc.steps[pc], pc); pc++; return true; },
      run() { while (this.step()); return this; }
    };
  }

  window.SIMULATORS['mvcc-isolation'] = {
    id: 'mvcc-isolation',
    title: 'MVCC and Isolation Levels',
    slugs: ['mvcc', 'database-locking-and-isolation'],
    blurb: 'Step two transactions through dirty reads, lost updates and write skew under PostgreSQL isolation levels.',
    render() {
      return `
        <div class="simulator-card" id="sim-mvcc">
          <div class="simulator-card__header">
            <div class="simulator-card__title">MVCC and Isolation Levels (PostgreSQL)</div>
            <span class="simulator-card__status" id="mv-status"></span>
          </div>
          <p class="simulator-card__description">Every UPDATE writes a new row version stamped with the writer's xid (xmin) and marks the old one dead (xmax). A read returns the version its snapshot can see. Pick an anomaly and an isolation level, then step through the script.</p>
          <div class="simulator-card__controls">
            <label>Scenario <select class="simulator-card__input sim-select" id="mv-sc">${Object.entries(MV_SCENARIOS).map(([k, s]) => `<option value="${k}">${esc(s.name)}</option>`).join('')}</select></label>
            <label>Isolation <select class="simulator-card__input sim-select" id="mv-lvl">${Object.entries(MV_LEVELS).map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></label>
          </div>
          <div class="simulator-card__controls">
            <button class="btn btn--primary btn--sm" id="mv-step">Step</button>
            <button class="btn btn--outline btn--sm" id="mv-run">Run to end</button>
            <button class="btn btn--sm" id="mv-reset">Reset</button>
          </div>
          <div class="sim-muted" id="mv-story"></div>
          <div class="sim-grid-wrap"><table class="sim-grid" id="mv-script"></table></div>
          <div class="sim-cols" id="mv-tx"></div>
          <div class="simulator-card__label">Row versions in the heap</div>
          <div class="sim-grid-wrap"><table class="sim-grid" id="mv-rows"></table></div>
          <div class="sim-verdict" id="mv-verdict"></div>
          <div class="simulator-card__label" style="margin-top: var(--space-4)">What each level does (each script run to the end)</div>
          <div class="sim-grid-wrap"><table class="sim-grid" id="mv-matrix"></table></div>
        </div>`;
    },
    mount(root) {
      if (!root.querySelector('#mv-matrix')) return;
      const lc = this._lc = lifecycle();
      const $ = s => root.querySelector(s);
      let scKey = 'dirty', level = 'rc', eng;
      const left = 'text-align:left';
      const sqlOf = (st, T) => st.op === 'begin' ? 'BEGIN' : st.op === 'commit' ? 'COMMIT' : st.op === 'rollback' ? 'ROLLBACK' : (typeof st.sql === 'function' ? st.sql(T.vars) : st.sql);
      const kindStyle = k => k === 'bad' ? 'color:var(--error)' : k === 'good' ? 'color:var(--success)' : k === 'wait' ? 'color:var(--warning)' : 'color:var(--fg-muted)';
      const reset = () => { eng = mvEngine(MV_SCENARIOS[scKey], level); };
      const fmtSnap = T => T.snap ? `xmax ${T.snap.xmax}, in-progress [${T.snap.xip.filter(x => x !== T.xid).join(', ')}]` : 'none yet';

      const matrix = () => {
        const cols = Object.keys(MV_LEVELS);
        $('#mv-matrix').innerHTML = `<tr><th></th>${cols.map(l => `<th>${esc(MV_LEVELS[l])}</th>`).join('')}</tr>` +
          Object.entries(MV_SCENARIOS).map(([k, s]) => `<tr><th>${esc(s.name)}</th>${cols.map(l => {
            const r = s.check(mvEngine(s, l).run());
            const label = r.kind === 'aborted' ? 'prevented by abort' : r.kind === 'anomaly' ? 'anomaly happens' : 'prevented';
            return `<td class="${k === scKey && l === level ? 'is-hit' : ''}" style="color:${KIND_COLOR[r.kind]}">${label}</td>`;
          }).join('')}</tr>`).join('');
      };

      const draw = () => {
        const sc = MV_SCENARIOS[scKey];
        $('#mv-story').textContent = sc.story;
        $('#mv-status').textContent = `${MV_LEVELS[level]} · step ${eng.pc}/${sc.steps.length}`;
        $('#mv-script').innerHTML = '<tr><th>#</th><th>T1</th><th>T2</th></tr>' + sc.steps.map((st, i) => {
          const r = eng.results[i];
          const cell = `<code>${esc(sqlOf(st, eng.tx[st.t]))}</code>${r ? `<div style="${kindStyle(r.kind)}">${esc(r.text)}</div>` : ''}`;
          const cls = i === eng.pc ? 'is-hit' : '';
          return `<tr><th>${i + 1}</th><td class="${st.t === 1 ? cls : ''}" style="${left}">${st.t === 1 ? cell : ''}</td><td class="${st.t === 2 ? cls : ''}" style="${left}">${st.t === 2 ? cell : ''}</td></tr>`;
        }).join('');
        $('#mv-tx').innerHTML = [1, 2].map(n => {
          const T = eng.tx[n];
          const vars = Object.entries(T.vars).map(([k, v]) => `${esc(k)} = ${esc(v)}`).join(', ') || 'none';
          const state = T.state === 'waiting' ? `waiting for xid ${T.waitOn}` : T.state;
          const ssi = level === 'ser' && T.xid ? `<span class="sim-event__vc">rw-conflicts: in [${[...T.inC].map(x => 'T' + x).join(', ')}] out [${[...T.outC].map(x => 'T' + x).join(', ')}]</span>` : '';
          return `<div class="sim-col"><div class="sim-col__head">T${n}${T.xid ? ` · xid ${T.xid}` : ''} · <span style="color:${T.state === 'aborted' ? 'var(--error)' : T.state === 'committed' ? 'var(--success)' : T.state === 'waiting' ? 'var(--warning)' : 'var(--fg-muted)'}">${esc(state)}</span></div>
            <div class="sim-event">Snapshot${level === 'rc' ? ' (last statement)' : ''}<span class="sim-event__vc">${esc(fmtSnap(T))}</span></div>
            <div class="sim-event">App variables<span class="sim-event__vc">${vars}</span>${ssi}</div></div>`;
        }).join('');
        const visCell = (v, T) => !T.snap || T.state === 'aborted' || T.state === 'committed' ? '<td class="sim-muted">-</td>' : `<td>${eng.visibleTo(v, T, T.snap) ? 'yes' : 'no'}</td>`;
        const xidTag = x => x == null ? '-' : `${x} <span class="sim-muted">${eng.status[x] === 'committed' ? 'committed' : eng.status[x] === 'aborted' ? 'aborted' : 'in progress'}</span>`;
        $('#mv-rows').innerHTML = `<tr><th>${esc(sc.keyCol)}</th><th>${esc(sc.valCol)}</th><th>xmin</th><th>xmax</th><th>visible to T1</th><th>visible to T2</th></tr>` +
          [...eng.rows].sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0).map(v => `<tr><td>${esc(v.key)}</td><td>${esc(v.val)}</td><td>${xidTag(v.xmin)}</td><td>${xidTag(v.xmax)}</td>${visCell(v, eng.tx[1])}${visCell(v, eng.tx[2])}</tr>`).join('');
        if (eng.done) {
          const r = sc.check(eng);
          $('#mv-verdict').innerHTML = `<b style="color:${KIND_COLOR[r.kind]}">${r.kind === 'aborted' ? 'Prevented by aborting a transaction' : r.kind === 'anomaly' ? 'Anomaly' : 'Prevented'}.</b> ${esc(r.text)}`;
        } else $('#mv-verdict').textContent = 'Step through the script. Highlighted cell = next statement.';
        matrix();
      };

      lc.on($('#mv-sc'), 'change', e => { scKey = e.target.value; reset(); draw(); });
      lc.on($('#mv-lvl'), 'change', e => { level = e.target.value; reset(); draw(); });
      lc.on($('#mv-step'), 'click', () => { eng.step(); draw(); });
      lc.on($('#mv-run'), 'click', () => { eng.run(); draw(); });
      lc.on($('#mv-reset'), 'click', () => { reset(); draw(); });
      reset(); draw();
    },
    unmount() { this._lc?.dispose(); }
  };

  // ── Adaptive bitrate: throughput-based vs buffer-based ─────
  const ABR_LADDER = [235, 375, 560, 750, 1050, 1750, 2350, 3000, 4300, 5800];   // kbps
  const ABR_T = 120, ABR_BLK = 5, ABR_MAXBUF = 30, ABR_YMAX = 8000;
  const ABR_PRESETS = {
    steady: Array(24).fill(3000),
    drop: [...Array(8).fill(5000), ...Array(6).fill(700), ...Array(10).fill(5000)],
    spiky: [6000, 1200, 700, 5500, 7000, 600, 4200, 900, 6500, 800, 3000, 700, 6800, 1500, 600, 5200, 7000, 900, 4000, 650, 6000, 1100, 5500, 800]
  };
  const kb = k => k >= 1000 ? (k / 1000).toFixed(2).replace(/\.?0+$/, '') + 'M' : Math.round(k) + 'k';

  function abrSim(trace, seg, algo) {
    const bwAt = t => trace[Math.min(trace.length - 1, Math.floor(t / ABR_BLK + 1e-9))];
    // seconds needed to fetch `kbit` starting at t0, integrating the piecewise-constant trace
    const dlTime = (t0, kbit) => {
      let t = t0, left = kbit;
      while (left > 1e-9) {
        if (t >= ABR_T - 1e-9) return Infinity;
        const end = (Math.floor(t / ABR_BLK + 1e-9) + 1) * ABR_BLK, bw = bwAt(t), can = bw * (end - t);
        if (can >= left) return t + left / bw - t0;
        left -= can; t = end;
      }
      return t - t0;
    };
    let t = 0, buf = 0, playing = false, started = false, startup = null, prev = null, switches = 0;
    const segs = [], series = [[0, 0]], stalls = [], tputs = [];
    const advance = d => {
      if (d <= 0) return;
      if (playing) {
        if (buf >= d) { buf -= d; t += d; series.push([t, buf]); return; }
        const rest = d - buf; t += buf; buf = 0; series.push([t, 0]);
        playing = false; stalls.push({ t, dur: rest }); t += rest; series.push([t, 0]); return;
      }
      if (started && stalls.length) stalls[stalls.length - 1].dur += d;
      t += d; series.push([t, buf]);
    };
    const pick = cap => ABR_LADDER.filter(x => x <= cap).pop() ?? ABR_LADDER[0];
    const RES = 5, CUSH = 20, RMIN = ABR_LADDER[0], RMAX = ABR_LADDER[ABR_LADDER.length - 1];
    const choose = () => {
      if (algo === 'tput') {
        if (!tputs.length) return RMIN;
        const last = tputs.slice(-3), hm = last.length / last.reduce((a, x) => a + 1 / x, 0);
        return pick(0.85 * hm);  // harmonic mean of last 3 segments, 15% safety margin
      }
      // BBA-0 (Huang et al., SIGCOMM 2014): map buffer level to a rate, with hysteresis between ladder steps
      if (prev == null || buf <= RES) return RMIN;
      if (buf >= RES + CUSH) return RMAX;
      const f = RMIN + (buf - RES) / CUSH * (RMAX - RMIN), i = ABR_LADDER.indexOf(prev);
      const up = ABR_LADDER[Math.min(i + 1, ABR_LADDER.length - 1)], down = ABR_LADDER[Math.max(i - 1, 0)];
      if (f >= up) return ABR_LADDER.filter(x => x < f).pop() ?? RMIN;
      if (f <= down) return ABR_LADDER.find(x => x > f) ?? RMAX;
      return prev;
    };
    while (t < ABR_T - 1e-9) {
      if (buf + seg > ABR_MAXBUF) advance(buf + seg - ABR_MAXBUF);   // buffer full: idle until one segment fits
      if (t >= ABR_T - 1e-9) break;
      const rate = choose(), d = dlTime(t, rate * seg);
      if (!isFinite(d)) break;
      const t0 = t; advance(d);
      buf += seg; series.push([t, buf]);
      tputs.push(rate * seg / d);
      segs.push({ t0, t1: t, rate });
      if (prev != null && rate !== prev) switches++;
      prev = rate;
      if (!playing) { playing = true; if (!started) { started = true; startup = t; } }
    }
    const real = stalls.filter(s => s.dur > 1e-6);
    return {
      segs, series, stalls: real, startup, switches,
      avg: segs.length ? segs.reduce((a, s) => a + s.rate, 0) / segs.length : 0,
      stallTime: real.reduce((a, s) => a + s.dur, 0),
      bufAt(x) {
        for (let k = series.length - 1; k >= 0; k--) {
          if (series[k][0] <= x) {
            const n = series[k + 1];
            if (!n || n[0] === series[k][0]) return series[k][1];
            return series[k][1] + (n[1] - series[k][1]) * (x - series[k][0]) / (n[0] - series[k][0]);
          }
        }
        return 0;
      },
      fetchAt(x) { const s = segs.find(q => q.t0 <= x && x < q.t1); return s ? s.rate : null; },
      stalledAt(x) { return real.some(s => s.t <= x && x < s.t + s.dur); }
    };
  }

  window.SIMULATORS['abr-player'] = {
    id: 'abr-player',
    title: 'Adaptive Bitrate Player',
    slugs: ['adaptive-bitrate-and-cdn-decider', 'video-transcoding-pipeline'],
    blurb: 'Draw a bandwidth trace and compare throughput-based and buffer-based ABR on rebuffers, bitrate and switches.',
    render() {
      return `
        <div class="simulator-card" id="sim-abr">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Adaptive Bitrate: throughput vs buffer-based</div>
            <span class="simulator-card__status" id="abr-status"></span>
          </div>
          <p class="simulator-card__description">Both players fetch the same ${ABR_T} s of network, one segment at a time, from a ${ABR_LADDER.length}-rung ladder (${kb(ABR_LADDER[0])} to ${kb(ABR_LADDER[ABR_LADDER.length - 1])}). The throughput player picks the highest rung under 85% of its recent measured throughput; the BBA-0 player ignores throughput and maps its buffer level (5 s reservoir, 20 s cushion) to a rung. Click or drag on the top chart to redraw the bandwidth.</p>
          <div class="simulator-card__controls">
            <label>Trace <select class="simulator-card__input sim-select" id="abr-preset"><option value="steady">Steady 3 Mbps</option><option value="drop">Drop to 700 kbps</option><option value="spiky">Spiky</option></select></label>
            <label>Segment length <select class="simulator-card__input sim-select" id="abr-seg"><option value="2">2 s</option><option value="4">4 s</option></select></label>
            <button class="btn btn--primary btn--sm" id="abr-play">Play</button>
            <button class="btn btn--sm" id="abr-reset">Reset trace</button>
          </div>
          <label><span class="simulator-card__label">Playhead: <b id="abr-t-val">0</b> s</span><input type="range" id="abr-t" min="0" max="${ABR_T}" step="0.5" value="0"></label>
          <svg id="abr-svg" viewBox="0 0 640 290" style="width:100%;height:auto;display:block;touch-action:none;margin:var(--space-3) 0"></svg>
          <div class="sim-muted" id="abr-legend"></div>
          <div class="sim-grid-wrap"><table class="sim-grid" id="abr-table"></table></div>
          <div class="sim-verdict" id="abr-verdict"></div>
        </div>`;
    },
    mount(root) {
      if (!root.querySelector('#abr-svg')) return;
      const lc = this._lc = lifecycle();
      const $ = s => root.querySelector(s);
      let preset = 'steady', seg = 2, trace = [...ABR_PRESETS.steady], cursor = 0, timer = null, runs, dragging = false;
      const X = t => 40 + t / ABR_T * 590, Y = k => 150 - Math.min(k, ABR_YMAX) / ABR_YMAX * 140, B = b => 270 - b / ABR_MAXBUF * 80;
      const ALGOS = [{ key: 'tput', name: 'Throughput-based', color: 'var(--info)' }, { key: 'bba', name: 'Buffer-based (BBA-0)', color: 'var(--success)' }];
      const simulate = () => { runs = {}; ALGOS.forEach(a => { runs[a.key] = abrSim(trace, seg, a.key); }); };
      const stepPath = (segs, yf) => segs.map(s => `M${X(s.t0).toFixed(1)},${yf(s.rate).toFixed(1)}H${X(s.t1).toFixed(1)}`).join('');

      const drawChart = () => {
        const txt = (x, y, s, anchor = 'end') => `<text x="${x}" y="${y}" text-anchor="${anchor}" style="fill:var(--fg-muted);font-size:10px">${s}</text>`;
        let g = `<rect x="40" y="10" width="590" height="140" style="fill:var(--bg);stroke:var(--border)"/>`;
        g += `<rect x="40" y="190" width="590" height="80" style="fill:var(--bg);stroke:var(--border)"/>`;
        [2000, 4000, 6000].forEach(k => { g += `<line x1="40" x2="630" y1="${Y(k)}" y2="${Y(k)}" style="stroke:var(--border);stroke-dasharray:2 3"/>` + txt(36, Y(k) + 3, kb(k)); });
        g += txt(36, 153, '0') + txt(36, 18, kb(ABR_YMAX)) + txt(44, 184, 'buffer (s)', 'start') + txt(36, 273, '0') + txt(36, 198, ABR_MAXBUF);
        [0, 30, 60, 90, 120].forEach(t => { g += txt(X(t), 285, t + 's', 'middle'); });
        // bandwidth trace (editable blocks)
        const bw = trace.map((k, i) => `${i ? 'V' : 'M' + X(0) + ','}${Y(k).toFixed(1)}H${X((i + 1) * ABR_BLK).toFixed(1)}`).join('');
        g += `<path d="${bw}" style="fill:none;stroke:var(--fg-muted);stroke-width:1.5;stroke-dasharray:5 3"/>`;
        ALGOS.forEach(a => {
          const r = runs[a.key];
          g += `<path d="${stepPath(r.segs, Y)}" style="fill:none;stroke:${a.color};stroke-width:2.5"/>`;
          const pts = r.series.map(([t, b]) => `${X(Math.min(t, ABR_T)).toFixed(1)},${B(Math.min(b, ABR_MAXBUF)).toFixed(1)}`).join(' ');
          g += `<polyline points="${pts}" style="fill:none;stroke:${a.color};stroke-width:1.8"/>`;
          r.stalls.forEach(s => { g += `<rect x="${X(s.t).toFixed(1)}" y="${a.key === 'tput' ? 262 : 254}" width="${Math.max(2, X(s.t + s.dur) - X(s.t)).toFixed(1)}" height="7" style="fill:var(--error)"><title>${a.name}: stall ${s.dur.toFixed(1)} s</title></rect>`; });
        });
        g += `<line x1="${X(cursor)}" x2="${X(cursor)}" y1="10" y2="270" style="stroke:var(--warning);stroke-width:1.5"/>`;
        g += `<rect id="abr-hit" x="40" y="10" width="590" height="140" style="fill:transparent;cursor:crosshair"/>`;
        $('#abr-svg').innerHTML = g;
      };
      const drawStats = () => {
        $('#abr-t-val').textContent = cursor.toFixed(1);
        $('#abr-status').textContent = `${seg} s segments · bandwidth at playhead ${kb(trace[Math.min(trace.length - 1, Math.floor(cursor / ABR_BLK))])}bps`;
        const row = (label, f) => `<tr><th>${label}</th>${ALGOS.map(a => `<td>${f(runs[a.key])}</td>`).join('')}</tr>`;
        $('#abr-table').innerHTML = `<tr><th></th>${ALGOS.map(a => `<th style="color:${a.color}">${a.name}</th>`).join('')}</tr>` +
          row('startup delay', r => r.startup == null ? 'never started' : r.startup.toFixed(1) + ' s') +
          row('average bitrate', r => kb(r.avg) + 'bps') +
          row('rendition switches', r => r.switches) +
          row('rebuffer events', r => `<span style="color:${r.stalls.length ? 'var(--error)' : 'var(--success)'}">${r.stalls.length}</span>`) +
          row('time stalled', r => r.stallTime.toFixed(1) + ' s') +
          row(`buffer @ ${cursor.toFixed(0)} s`, r => r.bufAt(cursor).toFixed(1) + ' s') +
          row(`fetching @ ${cursor.toFixed(0)} s`, r => r.stalledAt(cursor) ? '<span style="color:var(--error)">stalled</span> ' + (r.fetchAt(cursor) ? kb(r.fetchAt(cursor)) : '') : r.fetchAt(cursor) ? kb(r.fetchAt(cursor)) + 'bps' : 'idle (buffer full)');
        $('#abr-legend').innerHTML = `Top: dashed = available bandwidth, solid = rendition fetched. Bottom: buffer level; red bars = rebuffering. ${ALGOS.map(a => `<span style="color:${a.color}">■ ${a.name}</span>`).join(' ')}`;
        const t = runs.tput, b = runs.bba;
        const better = b.stallTime < t.stallTime - 0.05 ? 'The buffer-based player stalled less' : t.stallTime < b.stallTime - 0.05 ? 'The throughput player stalled less' : 'Both stalled about the same';
        $('#abr-verdict').textContent = `${better} (${t.stallTime.toFixed(1)} s vs ${b.stallTime.toFixed(1)} s). Throughput estimates lag sudden drops and chase spikes (${t.switches} switches); BBA reacts only to the buffer, so it starts at the lowest rung and climbs as the buffer fills (${b.switches} switches). Longer segments mean fewer decisions but a slower reaction to change.`;
      };
      const draw = () => { drawChart(); drawStats(); };
      const redraw = () => { simulate(); draw(); };

      const editAt = e => {
        const svg = $('#abr-svg'), r = svg.getBoundingClientRect();
        if (!r.width) return;
        const x = (e.clientX - r.left) * 640 / r.width, y = (e.clientY - r.top) * 290 / r.height;
        if (x < 40 || x > 630 || y < 10 || y > 150) return;
        const blk = Math.min(trace.length - 1, Math.floor((x - 40) / 590 * ABR_T / ABR_BLK));
        trace[blk] = Math.max(100, Math.min(ABR_YMAX, Math.round((150 - y) / 140 * ABR_YMAX / 100) * 100));
        redraw();
      };
      const stopPlay = () => { if (timer) { lc.stop(timer); timer = null; } $('#abr-play').textContent = 'Play'; };
      lc.on($('#abr-svg'), 'pointerdown', e => { dragging = true; editAt(e); });
      lc.on($('#abr-svg'), 'pointermove', e => { if (dragging) editAt(e); });
      lc.on(document, 'pointerup', () => { dragging = false; });
      lc.on($('#abr-preset'), 'change', e => { preset = e.target.value; trace = [...ABR_PRESETS[preset]]; redraw(); });
      lc.on($('#abr-seg'), 'change', e => { seg = +e.target.value; redraw(); });
      lc.on($('#abr-reset'), 'click', () => { trace = [...ABR_PRESETS[preset]]; redraw(); });
      lc.on($('#abr-t'), 'input', e => { cursor = +e.target.value; draw(); });
      lc.on($('#abr-play'), 'click', () => {
        if (timer) return stopPlay();
        if (cursor >= ABR_T) cursor = 0;
        $('#abr-play').textContent = 'Pause';
        timer = lc.every(100, () => {
          cursor = Math.min(ABR_T, cursor + 1);
          $('#abr-t').value = cursor;
          draw();
          if (cursor >= ABR_T) stopPlay();
        });
      });
      redraw();
    },
    unmount() { this._lc?.dispose(); }
  };

  // ── Ray casting point-in-polygon ────────────────────────────
  const RC_W = 480, RC_H = 320, RC_SNAP = 10;
  // concave "U" with a downward tip in the notch (math coords, y up)
  const RC_DEFAULT = [[60, 60], [420, 60], [420, 260], [300, 260], [300, 140], [240, 100], [180, 140], [180, 260], [60, 260]];
  const RC_POINTS = {
    notch: { p: [240, 200], label: 'Point in the notch' },
    tip: { p: [100, 100], label: 'Ray through the tip vertex' },
    bend: { p: [100, 140], label: 'Ray through a bend vertex' },
    far: { p: [450, 300], label: 'Outside the bounding box' }
  };

  function rayCast(poly, p) {
    const [px, py] = p;
    const xs = poly.map(v => v[0]), ys = poly.map(v => v[1]);
    const bbox = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    const inBox = px >= bbox.x0 && px <= bbox.x1 && py >= bbox.y0 && py <= bbox.y1;
    let onEdge = -1;
    const edges = poly.map((a, i) => {
      const b = poly[(i + 1) % poly.length];
      const cross = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
      if (cross === 0 && px >= Math.min(a[0], b[0]) && px <= Math.max(a[0], b[0]) && py >= Math.min(a[1], b[1]) && py <= Math.max(a[1], b[1])) onEdge = i;
      if (!inBox) return { a, b, status: 'not tested (bbox reject)', hit: false };
      if (a[1] === b[1]) return { a, b, status: py === a[1] ? 'horizontal, on the ray: skipped' : 'horizontal: skipped', hit: false };
      const lo = Math.min(a[1], b[1]), hi = Math.max(a[1], b[1]);
      // half-open rule: the edge owns y in [lo, hi), so a shared vertex is counted for exactly one of its edges (or both/neither at a tip)
      if (!((a[1] > py) !== (b[1] > py))) {
        const why = py === hi ? `ray hits its top vertex y=${hi}, excluded by [lo, hi)` : 'ray misses its y-range';
        return { a, b, status: `not counted: ${why}`, hit: false, lo, hi };
      }
      const xint = a[0] + (py - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
      const vtx = py === lo ? ` (ray passes through its bottom vertex, included by [lo, hi))` : '';
      if (xint > px) return { a, b, status: `crossing at x=${+xint.toFixed(1)}${vtx}`, hit: true, xint, lo, hi };
      return { a, b, status: `spans the ray but intersects left of the point (x=${+xint.toFixed(1)})`, hit: false, lo, hi };
    });
    const count = edges.filter(e => e.hit).length;
    return { bbox, inBox, edges, count, inside: inBox && count % 2 === 1, onEdge };
  }

  window.SIMULATORS['ray-casting'] = {
    id: 'ray-casting',
    title: 'Ray Casting: Point in Polygon',
    slugs: ['ray-casting-point-in-polygon', 'geofencing-point-in-polygon'],
    blurb: 'Click to test points against an editable polygon and watch the even-odd rule count edge crossings.',
    render() {
      return `
        <div class="simulator-card" id="sim-ray">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Ray Casting: Point in Polygon</div>
            <span class="simulator-card__status" id="rc-status"></span>
          </div>
          <p class="simulator-card__description">Cast a ray from the point to the right and count how many edges it crosses: odd means inside, even means outside. Each edge covers the half-open range [lower y, upper y), so a ray through a vertex is never double-counted. A cheap bounding-box check rejects far-away points first. Clicks snap to a ${RC_SNAP}-unit grid so vertex hits are easy to make.</p>
          <div class="simulator-card__controls">
            <button class="btn btn--outline btn--sm" id="rc-edit">Edit polygon: off</button>
            <button class="btn btn--outline btn--sm" id="rc-undo">Undo vertex</button>
            <button class="btn btn--outline btn--sm" id="rc-clear">Clear polygon</button>
            <button class="btn btn--sm" id="rc-default">Default shape</button>
          </div>
          <div class="simulator-card__controls">
            ${Object.entries(RC_POINTS).map(([k, v]) => `<button class="btn btn--outline btn--sm" data-rc-pt="${k}">${esc(v.label)}</button>`).join('')}
          </div>
          <svg id="rc-svg" viewBox="0 0 ${RC_W} ${RC_H}" style="width:100%;max-width:640px;height:auto;display:block;cursor:crosshair;border:1px solid var(--border);border-radius:var(--r-md);background:var(--bg);margin-bottom:var(--space-3)"></svg>
          <div class="sim-verdict" id="rc-verdict"></div>
          <div class="sim-grid-wrap" style="margin-top:var(--space-3)"><table class="sim-grid" id="rc-edges"></table></div>
        </div>`;
    },
    mount(root) {
      if (!root.querySelector('#rc-svg')) return;
      const lc = this._lc = lifecycle();
      const $ = s => root.querySelector(s);
      let poly = RC_DEFAULT.map(v => [...v]), pt = [...RC_POINTS.notch.p], edit = false;
      const sy = y => RC_H - y;
      const draw = () => {
        $('#rc-edit').textContent = `Edit polygon: ${edit ? 'on (click to add vertices)' : 'off'}`;
        let g = '';
        for (let x = 20; x < RC_W; x += 20) g += `<line x1="${x}" x2="${x}" y1="0" y2="${RC_H}" style="stroke:var(--border);stroke-width:0.4"/>`;
        for (let y = 20; y < RC_H; y += 20) g += `<line x1="0" x2="${RC_W}" y1="${y}" y2="${y}" style="stroke:var(--border);stroke-width:0.4"/>`;
        const ok = poly.length >= 3;
        const r = ok ? rayCast(poly, pt) : null;
        if (ok) {
          const bb = r.bbox;
          g += `<rect x="${bb.x0}" y="${sy(bb.y1)}" width="${bb.x1 - bb.x0}" height="${bb.y1 - bb.y0}" style="fill:none;stroke:${r.inBox ? 'var(--info)' : 'var(--error)'};stroke-dasharray:6 4;stroke-width:1"/>`;
          g += `<polygon points="${poly.map(v => `${v[0]},${sy(v[1])}`).join(' ')}" style="fill:${r.inside ? 'var(--success-muted)' : 'var(--surface)'};stroke:none"/>`;
          r.edges.forEach((e, i) => { g += `<line x1="${e.a[0]}" y1="${sy(e.a[1])}" x2="${e.b[0]}" y2="${sy(e.b[1])}" style="stroke:${e.hit ? 'var(--success)' : 'var(--fg-muted)'};stroke-width:${e.hit ? 4 : 1.8}"><title>edge ${i}: ${esc(e.status)}</title></line>`; });
        } else if (poly.length === 2) {
          g += `<line x1="${poly[0][0]}" y1="${sy(poly[0][1])}" x2="${poly[1][0]}" y2="${sy(poly[1][1])}" style="stroke:var(--fg-muted);stroke-width:1.8"/>`;
        }
        poly.forEach((v, i) => { g += `<circle cx="${v[0]}" cy="${sy(v[1])}" r="3.5" style="fill:var(--fg)"/><text x="${v[0] + 5}" y="${sy(v[1]) - 5}" style="fill:var(--fg-muted);font-size:10px">v${i}</text>`; });
        if (ok && !edit) {
          g += `<line x1="${pt[0]}" y1="${sy(pt[1])}" x2="${RC_W}" y2="${sy(pt[1])}" style="stroke:${r.inBox ? 'var(--warning)' : 'var(--fg-muted)'};stroke-width:1.5;stroke-dasharray:${r.inBox ? '0' : '4 4'}"/>`;
          r.edges.filter(e => e.hit).forEach((e, k) => { g += `<circle cx="${e.xint}" cy="${sy(pt[1])}" r="6" style="fill:none;stroke:var(--success);stroke-width:2"/><text x="${e.xint}" y="${sy(pt[1]) + 18}" text-anchor="middle" style="fill:var(--success);font-size:11px">${k + 1}</text>`; });
          g += `<circle cx="${pt[0]}" cy="${sy(pt[1])}" r="6" style="fill:${r.onEdge >= 0 ? 'var(--warning)' : r.inside ? 'var(--success)' : 'var(--error)'};stroke:var(--bg);stroke-width:2"/>`;
        }
        $('#rc-svg').innerHTML = g;
        $('#rc-status').textContent = `${poly.length} vertices · point (${pt[0]}, ${pt[1]})`;
        if (!ok) {
          $('#rc-verdict').textContent = `Add at least 3 vertices (${poly.length} so far). Turn edit mode off to test points.`;
          $('#rc-edges').innerHTML = '';
          return;
        }
        let v;
        if (!r.inBox) v = `<b style="color:var(--error)">Outside.</b> The point is outside the bounding box [${r.bbox.x0}..${r.bbox.x1}] × [${r.bbox.y0}..${r.bbox.y1}], so it is rejected with 4 comparisons and no edge is tested.`;
        else {
          v = `Bounding box passed. The ray crosses <b>${r.count}</b> edge${r.count === 1 ? '' : 's'}: ${r.count % 2 ? 'odd' : 'even'}, so the point is <b style="color:${r.inside ? 'var(--success)' : 'var(--error)'}">${r.inside ? 'inside' : 'outside'}</b>.`;
          if (poly.some(q => q[1] === pt[1])) v += ' The ray passes exactly through a vertex: each edge counts it only if it is that edge\'s lower endpoint, so a tip (both neighbours above) adds 0 or 2 and a bend (neighbours on opposite sides) adds exactly 1.';
        }
        if (r.onEdge >= 0) v += ` <span style="color:var(--warning)">The point lies on edge ${r.onEdge}. Boundary points are ambiguous for the even-odd rule; geofences usually pick a convention such as "boundary counts as inside".</span>`;
        $('#rc-verdict').innerHTML = v;
        $('#rc-edges').innerHTML = '<tr><th>edge</th><th>from</th><th>to</th><th>y-range [lo, hi)</th><th style="text-align:left">result</th></tr>' +
          r.edges.map((e, i) => `<tr><th>${i}</th><td>(${e.a.join(', ')})</td><td>(${e.b.join(', ')})</td><td>${e.a[1] === e.b[1] ? 'flat' : `[${Math.min(e.a[1], e.b[1])}, ${Math.max(e.a[1], e.b[1])})`}</td><td class="${e.hit ? 'is-hit' : ''}" style="text-align:left">${esc(e.status)}</td></tr>`).join('');
      };
      const toPoint = e => {
        const svg = $('#rc-svg'), rect = svg.getBoundingClientRect();
        if (!rect.width) return null;
        const x = (e.clientX - rect.left) * RC_W / rect.width, y = RC_H - (e.clientY - rect.top) * RC_H / rect.height;
        const snap = n => Math.max(0, Math.min(n, Math.round(n / RC_SNAP) * RC_SNAP));
        return [Math.min(RC_W, snap(x)), Math.min(RC_H, snap(y))];
      };
      lc.on($('#rc-svg'), 'click', e => {
        const p = toPoint(e); if (!p) return;
        if (edit) poly.push(p); else pt = p;
        draw();
      });
      lc.on($('#rc-edit'), 'click', () => { edit = !edit; draw(); });
      lc.on($('#rc-undo'), 'click', () => { poly.pop(); draw(); });
      lc.on($('#rc-clear'), 'click', () => { poly = []; edit = true; draw(); });
      lc.on($('#rc-default'), 'click', () => { poly = RC_DEFAULT.map(v => [...v]); edit = false; draw(); });
      lc.on(root.querySelector('#sim-ray'), 'click', e => {
        const b = e.target.closest && e.target.closest('button[data-rc-pt]'); if (!b) return;
        pt = [...RC_POINTS[b.dataset.rcPt].p]; edit = false;
        if (b.dataset.rcPt !== 'far') poly = RC_DEFAULT.map(v => [...v]);
        draw();
      });
      draw();
    },
    unmount() { this._lc?.dispose(); }
  };

  // ── Write-ahead log and crash recovery ──────────────────────
  const WAL_PAGES = 3, WAL_GROUP = 4, WAL_FSYNC_MS = 2;
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
  const walSum = r => fnv(`${r.lsn}|${r.txid}|${r.type}|${r.key ?? ''}|${r.val ?? ''}`);
  const walPage = k => { let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h % WAL_PAGES; };
  const newPages = () => Array.from({ length: WAL_PAGES }, () => ({ lsn: 0, data: {}, dirty: false }));
  const clonePages = ps => ps.map(p => ({ lsn: p.lsn, data: { ...p.data }, dirty: false }));

  window.SIMULATORS['wal-recovery'] = {
    id: 'wal-recovery',
    title: 'Write-Ahead Log and Crash Recovery',
    slugs: ['database-wal-and-recovery', 'disaster-recovery'],
    blurb: 'Write to a checksummed log, crash at a chosen point, and replay the log to rebuild the pages.',
    render() {
      return `
        <div class="simulator-card" id="sim-wal">
          <div class="simulator-card__header">
            <div class="simulator-card__title">Write-Ahead Log and Crash Recovery</div>
            <span class="simulator-card__status" id="wal-stats"></span>
          </div>
          <p class="simulator-card__description">Every change is appended to the log (LSN + checksum) before any data page changes. A commit is acknowledged only after fsync makes its COMMIT record durable. Pages are written lazily, and only once the log is durable up to their page LSN (the WAL rule). Transaction changes reach the page cache at commit (no-steal), so recovery only needs redo.</p>
          <div class="simulator-card__grid">
            <label><span class="simulator-card__label">Key</span><input class="simulator-card__input" id="wal-key" value="a" maxlength="8"></label>
            <label><span class="simulator-card__label">Value</span><input class="simulator-card__input" id="wal-val" value="1" maxlength="8"></label>
            <label><span class="simulator-card__label">Commit policy</span><select class="simulator-card__input" id="wal-policy"><option value="each">fsync per commit</option><option value="group">group commit (${WAL_GROUP} commits per fsync)</option></select></label>
            <label><span class="simulator-card__label">Crash point</span><select class="simulator-card__input" id="wal-crash-at"><option value="before">before fsync (log buffer lost)</option><option value="after">after fsync, before page write</option><option value="torn">mid-record torn write</option></select></label>
          </div>
          <div class="simulator-card__controls">
            <button class="btn btn--outline btn--sm" id="wal-set">SET key = value</button>
            <button class="btn btn--outline btn--sm" id="wal-del">DELETE key</button>
            <button class="btn btn--primary btn--sm" id="wal-commit">COMMIT</button>
            <button class="btn btn--outline btn--sm" id="wal-fsync">fsync now</button>
            <button class="btn btn--outline btn--sm" id="wal-pages">Write dirty pages</button>
            <button class="btn btn--outline btn--sm" id="wal-burst">Burst 20 commits</button>
          </div>
          <div class="simulator-card__controls">
            <button class="btn btn--outline btn--sm" id="wal-crash" style="color:var(--error)">Crash</button>
            <button class="btn btn--primary btn--sm" id="wal-recover">Run recovery</button>
            <button class="btn btn--sm" id="wal-reset">Reset</button>
          </div>
          <div class="simulator-card__label">Log (newest last)</div>
          <div class="sim-grid-wrap"><table class="sim-grid" id="wal-log"></table></div>
          <div class="sim-cols" id="wal-state"></div>
          <div class="sim-verdict" id="wal-verdict"></div>
          <div class="simulator-card__log" id="wal-events"><div class="simulator-card__log-header">Event log</div></div>
        </div>`;
    },
    mount(root) {
      if (!root.querySelector('#wal-log')) return;
      const lc = this._lc = lifecycle();
      const $ = s => root.querySelector(s);
      let log, durable, mem, disk, txid, cur, pendingAck, acked, expected, stats, crashed, lastLsn, policy = 'each', burstN = 0;
      const setVerdict = (msg, isHtml = false) => {
        const el = $('#wal-verdict');
        if (!el) return;
        if (isHtml) el.innerHTML = msg;
        else el.textContent = msg;
      };
      const emit = (msg, kind = '') => {
        const box = $('#wal-events');
        if (!box) return;
        const d = document.createElement('div');
        d.className = 'sim-log-line ' + (LOG_CLASS[kind] || '');
        d.textContent = msg;
        box.insertBefore(d, box.children[1] || null);
      };
      const reset = () => {
        log = []; durable = 0; lastLsn = 0; mem = newPages(); disk = newPages(); txid = 1; cur = [];
        pendingAck = []; acked = []; expected = {}; stats = { acked: 0, fsyncs: 0 }; crashed = false;
      };
      const append = (type, key, val) => {
        const r = { lsn: ++lastLsn, txid, type, key, val, onDisk: false, torn: false };
        r.sum = walSum(r); log.push(r); return r;
      };
      const fsync = () => {
        const buffered = log.filter(r => !r.onDisk);
        if (!buffered.length) return false;
        buffered.forEach(r => { r.onDisk = true; });
        durable = lastLsn; stats.fsyncs++;
        pendingAck.splice(0).forEach(c => {
          c.ops.forEach(o => { if (o.type === 'SET') expected[o.key] = o.val; else delete expected[o.key]; });
          acked.push(c.txid); stats.acked++;
        });
        return buffered.length;
      };
      const readInputs = () => {
        const kEl = $('#wal-key'), vEl = $('#wal-val');
        return {
          key: String(kEl ? kEl.value : '').trim().slice(0, 8),
          val: String(vEl ? vEl.value : '').trim().slice(0, 8)
        };
      };
      const guard = () => { if (crashed) { setVerdict('The node is down. Run recovery first.'); return false; } return true; };
      const addOp = (type, key, val) => { const r = append(type, key, type === 'SET' ? val : undefined); cur.push(r); return r; };
      const commit = quiet => {
        if (!cur.length) { if (!quiet) setVerdict('Nothing to commit: add a SET or DELETE first.'); return; }
        const c = append('COMMIT');
        // no-steal: the transaction's changes enter the page cache only now, stamped with the commit LSN
        cur.forEach(o => { const p = mem[walPage(o.key)]; if (o.type === 'SET') p.data[o.key] = o.val; else delete p.data[o.key]; p.lsn = c.lsn; p.dirty = true; });
        pendingAck.push({ txid, ops: cur, lsn: c.lsn });
        const t = txid; txid++; cur = [];
        if (policy === 'each' || pendingAck.length >= WAL_GROUP) {
          const n = pendingAck.length; fsync();
          if (!quiet) emit(`T${t} COMMIT at LSN ${c.lsn} → fsync → ${n > 1 ? n + ' commits' : 'commit'} acknowledged`, 'good');
        } else if (!quiet) emit(`T${t} COMMIT at LSN ${c.lsn} buffered, waiting for group fsync (${pendingAck.length}/${WAL_GROUP})`);
      };
      const writePages = () => {
        let wrote = 0;
        mem.forEach((p, i) => {
          if (!p.dirty) return;
          if (p.lsn > durable) { emit(`WAL rule: page P${i} (page LSN ${p.lsn}) cannot be written until the log is durable to LSN ${p.lsn} (durable: ${durable})`, 'bad'); return; }
          disk[i] = { lsn: p.lsn, data: { ...p.data }, dirty: false }; p.dirty = false; wrote++;
        });
        emit(`Wrote ${wrote} dirty page(s) to disk`);
      };
      const crash = mode => {
        let note = '';
        if (mode === 'after') { fsync(); note = 'Log fsynced, then power lost before any dirty page was written.'; }
        const buffered = log.filter(r => !r.onDisk);
        if (mode === 'torn') {
          if (!buffered.length) note = 'Nothing was in flight, so there was no record to tear; this behaves like a clean crash.';
          else {
            buffered.forEach(r => { r.onDisk = true; });
            const r = buffered[buffered.length - 1];
            r.torn = true;
            if (r.type === 'COMMIT') r.type = 'COM░░';
            else r.val = r.val != null ? r.val.slice(0, Math.ceil(r.val.length / 2)) + '░' : '░';
            note = `The log write was cut mid-record: ${buffered.length} buffered record(s) hit the disk but LSN ${r.lsn} is torn, and fsync never returned.`;
          }
        } else if (mode === 'before') note = `${buffered.length} buffered log record(s) were lost with memory.`;
        log = log.filter(r => r.onDisk);
        const lost = pendingAck.map(c => 'T' + c.txid);
        mem = null; cur = []; pendingAck = []; crashed = true;
        emit(`CRASH (${mode}). ${note}${lost.length ? ` Never acknowledged: ${lost.join(', ')}.` : ''}`, 'bad');
        setVerdict(`${note} Memory (page cache, log buffer) is gone. Disk has ${log.length} log record(s) and the pages last written. Run recovery.`);
      };
      const recover = () => {
        if (!crashed) { setVerdict('Crash the node first, then run recovery.'); return; }
        const lines = [];
        // 1. scan: verify checksums and cut the log at the first bad record
        let end = log.length;
        for (let i = 0; i < log.length; i++) {
          const got = walSum(log[i]);
          if (got !== log[i].sum) { end = i; lines.push(`scan: LSN ${log[i].lsn} checksum ${got} ≠ stored ${log[i].sum} → end of log, truncating ${log.length - i} record(s)`); break; }
        }
        log = log.slice(0, end);
        lines.push(`scan: ${log.length} valid record(s)`);
        // 2. analysis: which transactions have a COMMIT record
        const commits = new Map(log.filter(r => r.type === 'COMMIT').map(r => [r.txid, r.lsn]));
        const losers = [...new Set(log.filter(r => r.type !== 'COMMIT' && !commits.has(r.txid)).map(r => r.txid))];
        if (losers.length) lines.push(`analysis: no COMMIT for ${losers.map(t => 'T' + t).join(', ')} → their records are ignored`);
        // 3. redo committed transactions, idempotently (skip pages already at or past the commit LSN)
        let redone = 0, skipped = 0;
        log.forEach(r => {
          if (r.type !== 'COMMIT') return;
          const ops = log.filter(o => o.txid === r.txid && o.type !== 'COMMIT');
          const byPage = {};
          ops.forEach(o => { (byPage[walPage(o.key)] = byPage[walPage(o.key)] || []).push(o); });
          Object.entries(byPage).forEach(([pi, list]) => {
            const p = disk[pi];
            if (r.lsn <= p.lsn) { skipped++; lines.push(`redo T${r.txid} on P${pi}: skip, page LSN ${p.lsn} ≥ ${r.lsn}`); return; }
            list.forEach(o => { if (o.type === 'SET') p.data[o.key] = o.val; else delete p.data[o.key]; });
            p.lsn = r.lsn; redone++;
            lines.push(`redo T${r.txid} on P${pi}: ${list.map(o => o.type === 'SET' ? `${o.key}=${o.val}` : `del ${o.key}`).join(', ')} → page LSN ${r.lsn}`);
          });
        });
        lines.forEach(l => emit(l));
        // compare to acknowledged state; unacknowledged commits that survived on disk are legitimately present
        const recovered = Object.assign({}, ...disk.map(p => p.data));
        const extra = [...commits.keys()].filter(t => !acked.includes(t));
        const accept = { ...expected };
        extra.forEach(t => log.filter(o => o.txid === t && o.type !== 'COMMIT').forEach(o => { if (o.type === 'SET') accept[o.key] = o.val; else delete accept[o.key]; }));
        const same = (a, b) => { const ks = new Set([...Object.keys(a), ...Object.keys(b)]); return [...ks].every(k => a[k] === b[k]); };
        const exact = same(recovered, expected), okExtra = !exact && same(recovered, accept);
        const keys = [...new Set([...Object.keys(expected), ...Object.keys(recovered)])].sort();
        const table = keys.length ? `<table class="sim-grid" style="margin-top:var(--space-2)"><tr><th>key</th><th>acknowledged</th><th>recovered</th></tr>${keys.map(k => `<tr><td>${esc(k)}</td><td>${expected[k] != null ? esc(expected[k]) : '<span class="sim-muted">absent</span>'}</td><td class="${expected[k] === recovered[k] ? '' : 'is-hit'}">${recovered[k] != null ? esc(recovered[k]) : '<span class="sim-muted">absent</span>'}</td></tr>`).join('')}</table>` : '';
        const head = exact ? '<b style="color:var(--success)">Recovered state matches every acknowledged commit.</b>'
          : okExtra ? `<b style="color:var(--warning)">Recovered every acknowledged commit, plus ${extra.map(t => 'T' + t).join(', ')}:</b> ${extra.length > 1 ? 'their COMMIT records' : 'its COMMIT record'} reached the disk but the client never got an ack. That is allowed (the outcome was unknown to the client), which is why retries must be idempotent.`
            : '<b style="color:var(--error)">Mismatch with acknowledged state.</b>';
        setVerdict(`${head} Redo applied ${redone} page update(s), skipped ${skipped} already on disk.${table}`, true);
        mem = clonePages(disk); durable = lastLsn = log.length ? log[log.length - 1].lsn : 0;
        txid = Math.max(txid, ...log.map(r => r.txid + 1)); crashed = false;
        acked = [...new Set([...acked, ...extra])]; expected = recovered;
      };

      const draw = () => {
        const statsEl = $('#wal-stats');
        const logEl = $('#wal-log');
        const stateEl = $('#wal-state');
        if (!statsEl && !logEl && !stateEl) return;
        const per = stats.fsyncs ? (stats.acked / stats.fsyncs).toFixed(1) : '-';
        if (statsEl) statsEl.textContent = `${stats.acked} acked commits · ${stats.fsyncs} fsyncs · ${per} commits/fsync · ${stats.fsyncs * WAL_FSYNC_MS} ms in fsync @ ${WAL_FSYNC_MS} ms`;
        const shown = log.slice(-18);
        const statusOf = r => r.torn ? '<span style="color:var(--error)">torn</span>' : r.onDisk ? '<span style="color:var(--success)">durable</span>' : '<span style="color:var(--warning)">buffered</span>';
        if (logEl) {
          logEl.innerHTML = '<tr><th>LSN</th><th>txn</th><th>record</th><th>key</th><th>value</th><th>checksum</th><th>state</th></tr>' +
            (log.length > shown.length ? `<tr><td colspan="7" class="sim-muted">… ${log.length - shown.length} earlier record(s)</td></tr>` : '') +
            (shown.map(r => `<tr><td>${r.lsn}</td><td>T${r.txid}</td><td>${esc(r.type)}</td><td>${esc(r.key ?? '')}</td><td>${esc(r.val ?? '')}</td><td>${r.sum}</td><td>${statusOf(r)}</td></tr>`).join('') || '<tr><td colspan="7" class="sim-muted">empty</td></tr>');
        }
        if (stateEl) {
          const pageList = ps => ps.map((p, i) => `<div class="sim-event"><span class="sim-event__id">P${i}</span> page LSN ${p.lsn}${p.dirty ? ' <span style="color:var(--warning)">dirty</span>' : ''}<span class="sim-event__vc">${Object.entries(p.data).map(([k, v]) => `${esc(k)}=${esc(v)}`).join(' ') || 'empty'}</span></div>`).join('');
          const exp = Object.entries(expected).map(([k, v]) => `${esc(k)}=${esc(v)}`).join(' ') || 'empty';
          stateEl.innerHTML = `
            <div class="sim-col"><div class="sim-col__head">Memory (page cache)</div><div class="sim-col__events">${mem ? pageList(mem) : '<div class="sim-muted" style="color:var(--error)">lost in crash</div>'}</div></div>
            <div class="sim-col"><div class="sim-col__head">Disk pages</div><div class="sim-col__events">${pageList(disk)}</div></div>
            <div class="sim-col"><div class="sim-col__head">Client view</div><div class="sim-col__events">
              <div class="sim-event">Open txn T${txid}<span class="sim-event__vc">${cur.map(o => o.type === 'SET' ? `${esc(o.key)}=${esc(o.val)}` : `del ${esc(o.key)}`).join(', ') || 'no changes yet'}</span></div>
              <div class="sim-event">Awaiting fsync<span class="sim-event__vc">${pendingAck.map(c => 'T' + c.txid).join(', ') || 'none'}</span></div>
              <div class="sim-event">Acknowledged state<span class="sim-event__vc">${exp}</span></div>
              <div class="sim-event">Durable to LSN<span class="sim-event__vc">${durable}</span></div></div></div>`;
        }
      };

      const act = fn => () => { if (guard()) fn(); draw(); };
      lc.on($('#wal-set'), 'click', act(() => {
        const { key, val } = readInputs();
        if (!key) { setVerdict('Enter a key.'); return; }
        const r = addOp('SET', key, val); emit(`T${txid} append LSN ${r.lsn}: SET ${key}=${val} (buffered)`);
      }));
      lc.on($('#wal-del'), 'click', act(() => {
        const { key, val } = readInputs();
        if (!key) { setVerdict('Enter a key.'); return; }
        const r = addOp('DEL', key); emit(`T${txid} append LSN ${r.lsn}: DELETE ${key} (buffered)`);
      }));
      lc.on($('#wal-commit'), 'click', act(() => commit(false)));
      lc.on($('#wal-fsync'), 'click', act(() => { const n = fsync(); emit(n ? `fsync: ${n} record(s) durable to LSN ${durable}` : 'fsync: nothing buffered', n ? 'good' : ''); }));
      lc.on($('#wal-pages'), 'click', act(writePages));
      lc.on($('#wal-burst'), 'click', act(() => {
        const f0 = stats.fsyncs, a0 = stats.acked;
        if (cur.length) commit(true);
        for (let i = 0; i < 20; i++) { burstN++; addOp('SET', 'k' + (burstN % 5), 'v' + burstN); commit(true); }
        emit(`Burst: ${stats.acked - a0} commits acknowledged with ${stats.fsyncs - f0} fsync(s)${pendingAck.length ? `; ${pendingAck.length} still waiting for the next group` : ''}. At ${WAL_FSYNC_MS} ms per fsync that caps out near ${Math.round(1000 / WAL_FSYNC_MS * (policy === 'group' ? WAL_GROUP : 1))} commits/s.`, 'good');
      }));
      lc.on($('#wal-policy'), 'change', e => { policy = e.target.value; if (policy === 'each' && !crashed && pendingAck.length) { const n = pendingAck.length; fsync(); emit(`Switched to fsync per commit: flushed ${n} waiting commit(s)`, 'good'); } draw(); });
      lc.on($('#wal-crash'), 'click', () => { if (crashed) { setVerdict('Already crashed. Run recovery.'); return; } crash($('#wal-crash-at')?.value || 'before'); draw(); });
      lc.on($('#wal-recover'), 'click', () => { recover(); draw(); });
      lc.on($('#wal-reset'), 'click', () => { reset(); setVerdict('Reset.'); draw(); });
      reset();
      setVerdict('Try: SET a=1, SET b=2, COMMIT, SET c=3, then Crash (mid-record torn write) and Run recovery.');
      draw();
    },
    unmount() { this._lc?.dispose(); }
  };
})();
