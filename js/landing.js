/* ═══════════════════════════════════════════════════════════════
   Landing page (home route): split hero with live Capacity & Architecture
   Envelope Workbench above the fold, flagship production postmortems,
   live course simulators, 6-track curriculum map, and 20 builds.
   render() returns static-safe HTML; mount(root) hydrates interactivity.
   ═══════════════════════════════════════════════════════════════ */

window.Landing = (() => {
  const WORKBENCH_PRESETS = [
    {
      id: 'social-feed',
      label: 'Global Social Feed',
      blueprint: 'twitter-feed',
      lesson: 'social-feed-system-design-case-study',
      baseSlo: 'p99 Read < 35 ms · Hybrid Push/Pull Fanout',
      scales: {
        1: {
          slo: '1× Baseline · p99 Read 18 ms · Availability 99.99%',
          nodes: [
            { label: 'Anycast CDN', hot: false },
            { label: 'API Gateway (8×)', hot: false },
            { label: 'Timeline Redis ZSET', hot: false },
            { label: 'Kafka Fanout (12p)', hot: false },
            { label: 'ScyllaDB Posts', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '280,000 read/s · 6,400 write/s', '44:1 read-heavy'],
            ['Hot Cache Working Set', '1.4 TB Redis ZSET (last 800 IDs/user)', '98.4% hit ratio'],
            ['Replication & Quorum', 'RF=3 multi-AZ · Read R=1, Write W=2', 'Tunable AP / timeline'],
            ['Primary Bottleneck', 'Celebrity >50k followers merged on read', 'Bounded fanout lag < 400ms']
          ],
          note: 'Push fanout for normal graphs; pull-on-read merge for high-degree accounts.'
        },
        5: {
          slo: '5× Event Spike · p99 Read 29 ms · Auto-scaled',
          nodes: [
            { label: 'Anycast CDN', hot: false },
            { label: 'API Gateway (32×)', hot: false },
            { label: 'Timeline Redis ZSET', hot: true },
            { label: 'Kafka Fanout (48p)', hot: true },
            { label: 'ScyllaDB Posts', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '1,400,000 read/s · 32,000 write/s', 'L1 local hot-key cache ON'],
            ['Hot Cache Working Set', '3.8 TB Redis Cluster (32 shards)', '97.9% hit ratio'],
            ['Replication & Quorum', 'RF=3 multi-AZ · Async cross-region', 'RPO < 2s · RTO < 30s'],
            ['Primary Bottleneck', 'Kafka consumer lag on viral fanout bursts', 'Lower push threshold to >10k']
          ],
          note: 'Adaptive fanout threshold shifts viral authors to pull-on-read to protect Redis write IOPS.'
        },
        10: {
          slo: '10× Global Peak · p99 Read 42 ms · Load-Shed Ready',
          nodes: [
            { label: 'Anycast CDN', hot: false },
            { label: 'API Gateway + Shedder', hot: true },
            { label: 'Timeline Redis + L1', hot: true },
            { label: 'Kafka Fanout (96p)', hot: true },
            { label: 'ScyllaDB Posts', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '2,800,000 read/s · 64,000 write/s', 'Edge micro-caching 2s TTL'],
            ['Hot Cache Working Set', '6.4 TB Redis + 512 MB/pod L1 LRU', 'Singleflight stampede lock'],
            ['Replication & Quorum', 'Local quorum reads · Hinted handoff', 'Zero cross-AZ read amplification'],
            ['Primary Bottleneck', 'NIC egress & hotkey serialization', 'Degrade non-core ranking signals']
          ],
          note: 'Graceful degradation sheds heavy ML re-ranking while preserving core chronological feed SLOs.'
        }
      }
    },
    {
      id: 'payment-ledger',
      label: 'Payment Ledger',
      blueprint: 'stripe-ledger',
      lesson: 'case-stripe-idempotency-keys',
      baseSlo: 'Zero Double-Charge · Double-Entry Serializable ACID',
      scales: {
        1: {
          slo: '1× Baseline · p99 Commit 24 ms · CP Strict',
          nodes: [
            { label: 'mTLS API Gateway', hot: false },
            { label: 'Idempotency Store', hot: false },
            { label: 'Ledger Service', hot: false },
            { label: 'Raft SQL Shards (16×)', hot: false },
            { label: 'Outbox Kafka Audit', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '18,000 lookup/s · 4,500 tx/s', '4 ledger rows / transfer'],
            ['Hot Cache Working Set', '190 GB Idempotency Keys (24h TTL)', 'Atomic CAS key lock'],
            ['Replication & Quorum', 'Raft 5-node consensus · 3/5 majority', 'RPO = 0 · Linearizable'],
            ['Primary Bottleneck', 'Cross-AZ fsync WAL round-trip', 'Group commit batching']
          ],
          note: 'Every mutation records an idempotency key + transactional outbox event in one ACID commit.'
        },
        5: {
          slo: '5× Flash Sale · p99 Commit 38 ms · Merchant Hot-Account',
          nodes: [
            { label: 'mTLS API Gateway', hot: false },
            { label: 'Idempotency Store', hot: false },
            { label: 'Ledger Sub-Sharder', hot: true },
            { label: 'Raft SQL Shards (64×)', hot: true },
            { label: 'Outbox Kafka Audit', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '90,000 lookup/s · 22,500 tx/s', 'Sub-ledger bucketed balances'],
            ['Hot Cache Working Set', '820 GB Idempotency + Rate Quotas', 'Retry storm jitter enforced'],
            ['Replication & Quorum', 'Raft witness placement in 3 AZs', 'Leader lease read optimization'],
            ['Primary Bottleneck', 'Row lock contention on mega-merchant', 'Split merchant into 16 sub-buckets']
          ],
          note: 'Mega-merchant settlement accounts use striped sub-balances to eliminate single-row lock queues.'
        },
        10: {
          slo: '10× Holiday Peak · p99 Commit 54 ms · Strict Fencing',
          nodes: [
            { label: 'mTLS Gateway + Quota', hot: true },
            { label: 'Idempotency Cluster', hot: true },
            { label: 'Two-Phase Coordinator', hot: true },
            { label: 'Raft SQL Shards (128×)', hot: true },
            { label: 'Immutable Audit Log', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '180,000 lookup/s · 45,000 tx/s', '180,000 WAL appends/s'],
            ['Hot Cache Working Set', '1.6 TB NVMe-backed Redis Enterprise', 'Epoch fencing tokens'],
            ['Replication & Quorum', 'Multi-region Cockroach/Spanner Raft', 'RPO = 0 · Automated failover < 6s'],
            ['Primary Bottleneck', 'Cross-shard transfers & PSP webhooks', 'Async saga settlement queue']
          ],
          note: 'Synchronous authorization reserves funds locally; clearing settles asynchronously via outbox sagas.'
        }
      }
    },
    {
      id: 'realtime-chat',
      label: 'Realtime Chat',
      blueprint: 'whatsapp-chat',
      lesson: 'chat-and-messaging-system-design',
      baseSlo: 'Stateful WebSockets · p99 Delivery < 60 ms',
      scales: {
        1: {
          slo: '1× Baseline · 5M Concurrent WSS · p99 28 ms',
          nodes: [
            { label: 'L4 IPVS / Anycast', hot: false },
            { label: 'WSS Gateways (100×)', hot: false },
            { label: 'Session Registry', hot: false },
            { label: 'Message Router', hot: false },
            { label: 'Cassandra Inbox', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '95,000 msg/s · 5M open TCP sockets', '50k sockets / gateway'],
            ['Hot Cache Working Set', '420 GB Presence & Route Table', 'Heartbeat coalescing 30s'],
            ['Replication & Quorum', 'LOCAL_QUORUM (RF=3) per region', 'Per-conversation Snowflake ID'],
            ['Primary Bottleneck', 'Ephemeral port & socket RAM footprint', '~24 KB kernel+app / conn']
          ],
          note: 'Stateful gateways hold long-lived TLS connections while routing lookups hit partitioned Redis.'
        },
        5: {
          slo: '5× Regional Surge · 25M Concurrent WSS · p99 44 ms',
          nodes: [
            { label: 'L4 IPVS / Anycast', hot: false },
            { label: 'WSS Gateways (500×)', hot: true },
            { label: 'Session Registry', hot: true },
            { label: 'Kafka Partition Bus', hot: false },
            { label: 'Cassandra Inbox', hot: false }
          ],
          rows: [
            ['Peak Read / Write QPS', '475,000 msg/s · 25M open sockets', 'Zero-copy epoll / io_uring'],
            ['Hot Cache Working Set', '2.1 TB Sharded Session + Group Membership', 'Lazy presence fanout'],
            ['Replication & Quorum', 'LOCAL_QUORUM + APNs/FCM offline queue', 'Idempotent client msg_id'],
            ['Primary Bottleneck', 'Large group fanout & typing indicators', 'Suppress typing in >64-member rooms']
          ],
          note: 'Presence and typing events drop to pull/on-demand in large groups to avoid O(N²) message storms.'
        },
        10: {
          slo: '10× New Year Midnight · 50M WSS · Reconnect Jitter',
          nodes: [
            { label: 'L4 Anycast + SYN Guard', hot: true },
            { label: 'WSS Gateways (1,000×)', hot: true },
            { label: 'Session Registry', hot: true },
            { label: 'Kafka Partition Bus', hot: true },
            { label: 'Scylla/Cassandra LSM', hot: true }
          ],
          rows: [
            ['Peak Read / Write QPS', '950,000 msg/s · 50M open sockets', 'TLS session resumption 0-RTT'],
            ['Hot Cache Working Set', '4.2 TB Partitioned Route + Dedup Cache', 'Exponential backoff + full jitter'],
            ['Replication & Quorum', 'LSM time-window compaction (TWCS)', 'Zero tombstone read stalls'],
            ['Primary Bottleneck', 'TLS handshake CPU on mass reconnect', 'Token-bucket connection admission']
          ],
          note: 'Admission control + full-jitter backoff prevents thundering-herd TLS CPU collapse after network blips.'
        }
      }
    }
  ];

  const FLAGSHIP_CASES = [
    {
      slug: 'case-amazon-dynamo',
      title: 'Amazon Dynamo & Sloppy Quorums',
      badge: 'Module 3.1',
      summary: 'Consistent hashing, tunable N/R/W quorums, hinted handoff, and anti-entropy Merkle trees under network partitions.'
    },
    {
      slug: 'case-discord-message-storage',
      title: 'Discord Trillion-Message Storage',
      badge: 'Module 6.4',
      summary: 'Why Discord migrated from Cassandra GC pauses to ScyllaDB with Rust request coalescing for hot channels.'
    },
    {
      slug: 'case-stripe-idempotency-keys',
      title: 'Stripe Idempotent Payment APIs',
      badge: 'Module 6.4',
      summary: 'Atomic idempotency keys, recovery points, and transactional outboxes that guarantee exactly-once side effects.'
    },
    {
      slug: 'case-gitlab-database-incident',
      title: 'GitLab Replication Lag Postmortem',
      badge: 'Module 6.4',
      summary: 'Dissecting cascading WAL replication failure, backup verification gaps, and production disaster-recovery guardrails.'
    }
  ];

  // Live demos: real course simulators, mounted one at a time
  const DEMOS = [
    { sim: 'quorum-nrw', label: 'Quorums (N/R/W)', lesson: 'case-amazon-dynamo' },
    { sim: 'lb-algorithms', label: 'Load balancing', lesson: 'load-balancers' },
    { sim: 'raft-election', label: 'Raft election', lesson: 'leader-election' },
    { sim: 'cache-stampede', label: 'Cache stampede', lesson: 'cache-concurrency-control' },
    { sim: 'mvcc-isolation', label: 'MVCC isolation', lesson: 'mvcc' }
  ];

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const shortTitle = t => String(t || '').replace(/\s*\(.*\)\s*$/, '');

  function allUnits() {
    const out = [];
    for (const part of window.CURRICULUM_DATA?.parts || []) {
      for (const mod of part.modules) {
        for (const u of mod.units) out.push(u);
      }
    }
    return out;
  }

  function findUnit(slug) {
    for (const u of allUnits()) if (u.slug === slug) return u;
    return null;
  }

  function counts() {
    const c = window.SITE_COUNTS || {};
    return {
      topics: allUnits().length || 200,
      simulators: c.simulators || Object.keys(window.SIMULATORS || {}).length || 32,
      builds: Object.keys(window.IMPLEMENTATIONS_DATA || {}).length || 20,
      videos: c.videos || 469,
      questions: c.questions || 1000
    };
  }

  function renderWorkbenchStage(preset, scaleKey) {
    const sc = preset.scales[scaleKey] || preset.scales[1];
    const topoHtml = sc.nodes.map((n, idx) => {
      const nodeEl = `<span class="landing-wb__node${n.hot ? ' landing-wb__node--hot' : ''}">${esc(n.label)}</span>`;
      return idx < sc.nodes.length - 1
        ? `${nodeEl}<span class="landing-wb__arrow" aria-hidden="true">→</span>`
        : nodeEl;
    }).join('');

    const rowsHtml = sc.rows.map(r => (
      `<tr><td>${esc(r[0])}</td><td><strong>${esc(r[1])}</strong></td><td>${esc(r[2])}</td></tr>`
    )).join('');

    return `
      <div class="landing-wb__topology" aria-label="Request path topology">
        ${topoHtml}
      </div>
      <div class="landing-pg__output">
        <div class="landing-pg__table-wrap">
          <table class="landing-pg__table">
            <thead>
              <tr><th scope="col">Dimension</th><th scope="col">Envelope</th><th scope="col">Design Guardrail</th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        <div class="landing-pg__plan">
          <span><span class="landing-pg__plan-tag">TAKEAWAY</span> ${esc(sc.note)}</span>
          <a class="landing-pg__open" href="/sandbox/?blueprint=${esc(preset.blueprint)}" data-nav="sandbox" data-blueprint="${esc(preset.blueprint)}">Stress-test in Sandbox ↗</a>
        </div>
      </div>`;
  }

  function renderHero(c) {
    const last = window.Progress?.getLastVisited?.();
    const lastUnit = last && findUnit(last);
    const first = allUnits()[0];
    const preset0 = WORKBENCH_PRESETS[0];
    const scale0 = preset0.scales[1];

    const primaryCta = lastUnit
      ? `<a class="btn btn--primary landing-btn" id="landing-primary-cta" href="/topic/${esc(last)}/">Continue learning →</a>`
      : `<a class="btn btn--primary landing-btn" id="landing-primary-cta" href="/topic/${esc(first?.slug || 'requirements-clarification')}/">Start learning →</a>`;

    return `
      <section class="landing-hero">
        <div class="landing-hero__grid">
          <div class="landing-hero__copy">
            <h1 class="landing-hero__title">System design, from storage engines to global consensus.</h1>
            <p class="landing-hero__subtitle">An open-source interactive textbook for distributed systems engineering. Model capacity envelopes, step through 32 live protocol simulators, debug production incident war-rooms, and build 20 core services in your browser.</p>

            <div class="landing-resume" id="landing-resume"${lastUnit ? '' : ' hidden'}>
              <a class="landing-resume__link" id="landing-resume-link" href="/topic/${esc(lastUnit?.slug || first?.slug || 'requirements-clarification')}/">
                <span class="landing-resume__label">Continue where you left off</span>
                <strong class="landing-resume__unit" id="landing-resume-title">${esc(lastUnit?.title || first?.title || 'Requirements clarification')}</strong>
                <span class="landing-resume__meta" id="landing-resume-meta">Resume →</span>
              </a>
            </div>

            <div class="landing-hero__actions">
              ${primaryCta}
              <button class="btn btn--outline landing-btn" type="button" data-landing-scroll="landing-curriculum">Browse curriculum</button>
              <button class="landing-search" type="button" data-landing-search>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search ${c.topics} topics <kbd>⌘K</kbd>
              </button>
            </div>

            <p class="landing-hero__scope">6 architecture tracks · ${c.topics} lessons · ${c.simulators} simulators · ${c.builds} from-scratch builds · 12 incident war-rooms · MIT &amp; CC BY 4.0</p>
          </div>

          <aside class="landing-pg" id="landing-workbench" aria-label="Interactive capacity and architecture envelope workbench">
            <div class="landing-pg__header">
              <span class="landing-pg__engine"><span class="landing-pg__dot" aria-hidden="true"></span>Capacity Envelope</span>
              <div class="landing-pg__presets" role="tablist" aria-label="Workload architecture presets">
                ${WORKBENCH_PRESETS.map((p, i) => `<button type="button" class="landing-pg__preset${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" data-wb-preset="${i}">${esc(p.label)}</button>`).join('')}
              </div>
            </div>

            <div class="landing-wb__controls">
              <div class="landing-wb__scale" role="group" aria-label="Traffic multiplier">
                <span class="landing-wb__scale-label">Traffic load:</span>
                <button type="button" class="landing-wb__scale-btn is-active" data-wb-scale="1" aria-pressed="true">1×</button>
                <button type="button" class="landing-wb__scale-btn" data-wb-scale="5" aria-pressed="false">5×</button>
                <button type="button" class="landing-wb__scale-btn" data-wb-scale="10" aria-pressed="false">10×</button>
              </div>
              <span class="landing-wb__slo" id="landing-wb-slo" role="status" aria-live="polite">${esc(scale0.slo)}</span>
            </div>

            <div id="landing-wb-stage">
              ${renderWorkbenchStage(preset0, 1)}
            </div>
          </aside>
        </div>
      </section>`;
  }

  function renderFlagshipCases() {
    return `
      <section class="landing-section ds-below-fold" id="landing-cases">
        <div class="landing-section__head">
          <h2 class="landing-section__title">Production architecture case studies</h2>
          <p class="landing-section__desc">Ground theoretical quorum math, LSM compaction, and idempotency invariants in primary engineering papers and postmortems.</p>
        </div>
        <div class="landing-videos">
          ${FLAGSHIP_CASES.map(v => `
            <a class="landing-video-card" href="/topic/${esc(v.slug)}/">
              <div class="landing-video-card__top">
                <span class="landing-video-card__mod">${esc(v.badge)}</span>
                <span class="landing-video-card__dur">Case Study</span>
              </div>
              <h3 class="landing-video-card__title">${esc(v.title)}</h3>
              <p class="landing-video-card__desc">${esc(v.summary)}</p>
            </a>`).join('')}
        </div>
      </section>`;
  }

  function renderDemos() {
    const demos = DEMOS.filter(d => window.SIMULATORS?.[d.sim]);
    if (!demos.length) return '';
    return `
      <section class="landing-section ds-below-fold" id="landing-demos">
        <div class="landing-section__head">
          <h2 class="landing-section__title">Step through distributed protocols live</h2>
          <p class="landing-section__desc">Adjust quorum thresholds, trigger leader failovers, and inspect MVCC snapshot visibility directly inside the browser.</p>
        </div>
        <div class="landing-tabs" role="tablist" aria-label="Interactive system design simulators">
          ${demos.map((d, i) => `<button type="button" class="landing-tab${i ? '' : ' is-active'}" role="tab" aria-selected="${i ? 'false' : 'true'}" data-demo="${i}">${esc(d.label)}</button>`).join('')}
        </div>
        <div class="landing-demo" id="landing-demo-stage"></div>
        <a class="landing-link" id="landing-demo-lesson" href="/topic/${esc(demos[0].lesson)}/">Open full lesson →</a>
      </section>`;
  }

  function renderBuilds(c) {
    const builds = Object.entries(window.IMPLEMENTATIONS_DATA || {});
    if (!builds.length) return '';
    return `
      <section class="landing-section ds-below-fold" id="landing-builds">
        <div class="landing-section__head">
          <h2 class="landing-section__title">${c.builds} from-scratch distributed builds</h2>
          <p class="landing-section__desc">Implement Raft leader leases, LSM storage engines, L7 load balancers, token-bucket limiters, and vector clocks with automated unit tests.</p>
        </div>
        <div class="landing-builds">
          ${builds.map(([id, b]) => `<a class="landing-build" href="/build/${esc(id)}/" data-action="navigate-build" data-build-id="${esc(id)}">${esc(shortTitle(b.title) || id)}<span aria-hidden="true">→</span></a>`).join('')}
        </div>
      </section>`;
  }

  function renderCurriculum() {
    const data = window.CURRICULUM_DATA;
    if (!data) return '';
    let html = `
      <section class="landing-section ds-below-fold" id="landing-curriculum">
        <div class="landing-section__head">
          <h2 class="landing-section__title">6-track architecture curriculum</h2>
          <p class="landing-section__desc">From workload modeling and network protocols to storage internals, distributed consensus, stream processing, and end-to-end system designs.</p>
        </div>`;
    for (const part of data.parts) {
      html += `<h3 class="landing-part">${esc(part.title)}</h3><div class="landing-modules">`;
      for (const mod of part.modules) {
        const prog = window.Progress?.getModuleProgress ? window.Progress.getModuleProgress(mod.id) : { completed: 0, total: mod.units.length };
        const pct = prog.total ? Math.round((prog.completed / prog.total) * 100) : 0;
        const firstUnitSlug = mod.units[0]?.slug || '';
        html += `
          <a class="landing-module" href="/topic/${esc(firstUnitSlug)}/" data-module="${esc(mod.id)}" data-units="${mod.units.map(u => esc(u.slug)).join(' ')}">
            <span class="landing-module__num">${esc(mod.number)}</span>
            <span class="landing-module__title">${esc(mod.title)}</span>
            <span class="landing-module__meta">${mod.units.length} topics</span>
            <span class="landing-module__bar"><span style="width:${pct}%"></span></span>
          </a>`;
      }
      html += '</div>';
    }
    return html + '</section>';
  }

  function renderClosing() {
    const first = allUnits()[0];
    return `
      <section class="landing-closing ds-below-fold">
        <h2 class="landing-closing__title">Ready to reason from first principles?</h2>
        <p class="landing-closing__desc">Start with Module 1.1 with zero account setup, or inspect the interactive prerequisite graph.</p>
        <div class="landing-closing__actions">
          <a class="btn btn--primary landing-btn" href="/topic/${esc(first?.slug || 'requirements-clarification')}/">Start Module 1.1 →</a>
          <a class="btn btn--outline landing-btn" href="/roadmap" data-nav="roadmap">Explore Roadmap</a>
        </div>
      </section>`;
  }

  function render() {
    if (!window.CURRICULUM_DATA) return '<p>Loading curriculum data...</p>';
    const c = counts();
    return `<div class="landing">${renderHero(c)}${renderFlagshipCases()}${renderDemos()}${renderCurriculum()}${renderBuilds(c)}${renderClosing()}</div>`;
  }

  /**
   * Wire workbench presets/scales, demo tabs, module cards and buttons. Returns a cleanup function.
   */
  function mount(root) {
    const demos = DEMOS.filter(d => window.SIMULATORS?.[d.sim]);
    const stage = root.querySelector('#landing-demo-stage');
    const wbEl = root.querySelector('#landing-workbench');
    const wbStage = root.querySelector('#landing-wb-stage');
    const wbSlo = root.querySelector('#landing-wb-slo');
    let wbPresetIdx = 0;
    let wbScale = 1;
    let active = null;
    const offs = [];
    const on = (el, ev, fn) => { if (!el) return; el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };

    const updateWorkbench = () => {
      const preset = WORKBENCH_PRESETS[wbPresetIdx] || WORKBENCH_PRESETS[0];
      const sc = preset.scales[wbScale] || preset.scales[1];
      if (wbStage) wbStage.innerHTML = renderWorkbenchStage(preset, wbScale);
      if (wbSlo) wbSlo.textContent = sc.slo;
      root.querySelectorAll('[data-wb-preset]').forEach((btn, idx) => {
        const isAct = idx === wbPresetIdx;
        btn.classList.toggle('is-active', isAct);
        btn.setAttribute('aria-selected', String(isAct));
      });
      root.querySelectorAll('[data-wb-scale]').forEach(btn => {
        const isAct = Number(btn.dataset.wbScale) === wbScale;
        btn.classList.toggle('is-active', isAct);
        btn.setAttribute('aria-pressed', String(isAct));
      });
    };

    if (wbEl) {
      on(wbEl, 'click', e => {
        const presetBtn = e.target.closest('[data-wb-preset]');
        if (presetBtn) {
          wbPresetIdx = Number(presetBtn.dataset.wbPreset) || 0;
          updateWorkbench();
          return;
        }
        const scaleBtn = e.target.closest('[data-wb-scale]');
        if (scaleBtn) {
          wbScale = Number(scaleBtn.dataset.wbScale) || 1;
          updateWorkbench();
        }
      });
    }

    const show = i => {
      if (!stage || !demos[i]) return;
      if (active) { try { active.unmount(stage); } catch (_) {} active = null; }
      const sim = window.SIMULATORS[demos[i].sim];
      if (!sim || typeof sim.render !== 'function') return;
      stage.innerHTML = sim.render();
      if (typeof sim.mount === 'function') sim.mount(stage);
      active = sim;
      root.querySelectorAll('.landing-tab').forEach((t, j) => {
        t.classList.toggle('is-active', j === i);
        t.setAttribute('aria-selected', String(j === i));
      });
      root.querySelector('#landing-demo-lesson')?.setAttribute('href', '/topic/' + demos[i].lesson + '/');
    };

    on(root.querySelector('.landing-tabs'), 'click', e => {
      const tab = e.target.closest('.landing-tab');
      if (tab) show(+tab.dataset.demo);
    });
    on(root.querySelector('#landing-curriculum'), 'click', e => {
      const card = e.target.closest('[data-module]');
      if (!card) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      window.App?.navigateToModule?.(card.dataset.module);
    });
    root.querySelectorAll('[data-landing-scroll]').forEach(b => on(b, 'click', () => {
      document.getElementById(b.dataset.landingScroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    root.querySelectorAll('[data-landing-search]').forEach(b => on(b, 'click', () => window.Search?.open?.()));

    show(0);
    return () => {
      if (active) { try { active.unmount(stage); } catch (_) {} active = null; }
      offs.splice(0).forEach(f => f());
    };
  }

  return { render, mount };
})();
