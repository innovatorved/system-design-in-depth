/* ═══════════════════════════════════════════════════════════════
   Landing page (home route): hero, live simulator demos, what's in a
   lesson, builds and the curriculum grid. Kept deliberately light on text.
   render() returns HTML; mount(root) wires the demo and returns a cleanup fn.
   ═══════════════════════════════════════════════════════════════ */

window.Landing = (() => {
  // Live demos: real course simulators, mounted one at a time
  const DEMOS = [
    { sim: 'quorum-nrw', label: 'Quorums', lesson: 'case-amazon-dynamo' },
    { sim: 'lb-algorithms', label: 'Load balancing', lesson: 'load-balancers' },
    { sim: 'raft-election', label: 'Raft', lesson: 'leader-election' },
    { sim: 'cache-stampede', label: 'Cache stampede', lesson: 'cache-concurrency-control' },
    { sim: 'mvcc-isolation', label: 'MVCC', lesson: 'mvcc' },
  ];

  // Feature tiles (lucide-style line icons)
  const ICON = p => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const FEATURES = [
    { icon: ICON('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'), title: 'Intuition first' },
    { icon: ICON('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 9 5 3-5 3z"/>'), title: 'Hand-picked videos' },
    { icon: ICON('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4a2 2 0 0 1 2 2V14"/>'), title: 'Diagrams & notes' },
    { icon: ICON('<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>'), title: 'Audio narration' },
    { icon: ICON('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'), title: 'Check yourself' },
    { icon: ICON('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'), title: 'Code you can run' },
  ];

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const shortTitle = t => String(t || '').replace(/\s*\(.*\)\s*$/, '');

  function allUnits() {
    const out = [];
    for (const part of window.CURRICULUM_DATA?.parts || []) for (const mod of part.modules) for (const u of mod.units) out.push(u);
    return out;
  }

  function findUnit(slug) {
    for (const u of allUnits()) if (u.slug === slug) return u;
    return null;
  }

  function counts() {
    const videos = new Set();
    for (const m of Object.values(window.MODULE_CONTENT || {})) for (const u of Object.values(m)) {
      if (u.video?.youtubeId) videos.add(u.video.youtubeId);
      (u.videos || []).forEach(v => videos.add(v.youtubeId));
    }
    return {
      topics: allUnits().length,
      simulators: Object.keys(window.SIMULATORS || {}).length,
      builds: Object.keys(window.IMPLEMENTATIONS_DATA || {}).length,
      videos: videos.size,
      questions: Object.values(window.QUESTION_BANK || {}).reduce((n, qs) => n + qs.length, 0),
    };
  }

  function renderHero(c) {
    const last = window.Progress?.getLastVisited?.();
    const lastUnit = last && findUnit(last);
    const first = allUnits()[0];
    const primary = lastUnit
      ? `<a class="btn btn--primary landing-btn" href="#topic/${esc(last)}">Continue learning →</a>`
      : `<a class="btn btn--primary landing-btn" href="#topic/${esc(first?.slug || '')}">Start learning →</a>`;
    return `
      <section class="landing-hero">
        <div class="landing-hero__eyebrow"><span class="landing-dot"></span>Free &amp; open source</div>
        <h1 class="landing-hero__title">System design,<br>in depth.</h1>
        <p class="landing-hero__subtitle">Read it, watch it, run it, build it.</p>
        <div class="landing-hero__actions">
          ${primary}
          <button class="btn btn--outline landing-btn" type="button" data-landing-scroll="landing-curriculum">Browse curriculum</button>
          <button class="landing-search" type="button" data-landing-search>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search <kbd>⌘K</kbd>
          </button>
        </div>
        <dl class="landing-stats">
          <div><dt>${c.topics}</dt><dd>Topics</dd></div>
          <div><dt>${c.simulators}</dt><dd>Simulators</dd></div>
          <div><dt>${c.builds}</dt><dd>Builds</dd></div>
          <div><dt>${c.videos}</dt><dd>Videos</dd></div>
          <div><dt>${c.questions}</dt><dd>Questions</dd></div>
        </dl>
      </section>`;
  }

  function renderDemos() {
    const demos = DEMOS.filter(d => window.SIMULATORS?.[d.sim]);
    if (!demos.length) return '';
    return `
      <section class="landing-section" id="landing-demos">
        <h2 class="landing-section__title">Try it live</h2>
        <div class="landing-tabs" role="tablist">
          ${demos.map((d, i) => `<button class="landing-tab${i ? '' : ' is-active'}" role="tab" aria-selected="${i ? 'false' : 'true'}" data-demo="${i}">${esc(d.label)}</button>`).join('')}
        </div>
        <div class="landing-demo" id="landing-demo-stage"></div>
        <a class="landing-link" id="landing-demo-lesson" href="#topic/${esc(demos[0].lesson)}">Open lesson →</a>
      </section>`;
  }

  function renderFeatures() {
    return `
      <section class="landing-section">
        <h2 class="landing-section__title">In every lesson</h2>
        <div class="landing-features">
          ${FEATURES.map(f => `<div class="landing-feature"><span class="landing-feature__icon">${f.icon}</span><span class="landing-feature__title">${esc(f.title)}</span></div>`).join('')}
        </div>
      </section>`;
  }

  function renderBuilds(c) {
    const builds = Object.entries(window.IMPLEMENTATIONS_DATA || {});
    if (!builds.length) return '';
    return `
      <section class="landing-section" id="landing-builds">
        <h2 class="landing-section__title">${c.builds} from-scratch builds</h2>
        <div class="landing-builds">
          ${builds.map(([id, b]) => `<a class="landing-build" href="#build/${esc(id)}">${esc(shortTitle(b.title) || id)}<span aria-hidden="true">→</span></a>`).join('')}
        </div>
      </section>`;
  }

  function renderCurriculum() {
    const data = window.CURRICULUM_DATA;
    if (!data) return '';
    let html = `<section class="landing-section" id="landing-curriculum"><h2 class="landing-section__title">Curriculum</h2>`;
    for (const part of data.parts) {
      html += `<h3 class="landing-part">${esc(part.title)}</h3><div class="landing-modules">`;
      for (const mod of part.modules) {
        const prog = window.Progress.getModuleProgress(mod.id);
        const pct = prog.total ? Math.round((prog.completed / prog.total) * 100) : 0;
        html += `
          <a class="landing-module" href="#" data-module="${mod.id}">
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
      <section class="landing-closing">
        <h2 class="landing-closing__title">Start with the first lesson.</h2>
        <a class="btn btn--primary landing-btn" href="#topic/${esc(first?.slug || '')}">Start learning →</a>
      </section>`;
  }

  function render() {
    if (!window.CURRICULUM_DATA) return '<p>Loading curriculum data...</p>';
    const c = counts();
    return `<div class="landing">${renderHero(c)}${renderDemos()}${renderFeatures()}${renderBuilds(c)}${renderCurriculum()}${renderClosing()}</div>`;
  }

  /**
   * Wire demo tabs, module cards and buttons. Returns a cleanup function.
   */
  function mount(root) {
    const demos = DEMOS.filter(d => window.SIMULATORS?.[d.sim]);
    const stage = root.querySelector('#landing-demo-stage');
    let active = null;
    const offs = [];
    const on = (el, ev, fn) => { if (!el) return; el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };

    const show = i => {
      if (!stage || !demos[i]) return;
      if (active) { try { active.unmount(stage); } catch (e) {} active = null; }
      const sim = window.SIMULATORS[demos[i].sim];
      stage.innerHTML = sim.render();
      sim.mount(stage);
      active = sim;
      root.querySelectorAll('.landing-tab').forEach((t, j) => { t.classList.toggle('is-active', j === i); t.setAttribute('aria-selected', String(j === i)); });
      root.querySelector('#landing-demo-lesson')?.setAttribute('href', '#topic/' + demos[i].lesson);
    };

    on(root.querySelector('.landing-tabs'), 'click', e => {
      const tab = e.target.closest('.landing-tab');
      if (tab) show(+tab.dataset.demo);
    });
    on(root.querySelector('#landing-curriculum'), 'click', e => {
      const card = e.target.closest('[data-module]');
      if (!card) return;
      e.preventDefault();
      window.App?.navigateToModule?.(card.dataset.module);
    });
    root.querySelectorAll('[data-landing-scroll]').forEach(b => on(b, 'click', () => {
      document.getElementById(b.dataset.landingScroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    root.querySelectorAll('[data-landing-search]').forEach(b => on(b, 'click', () => window.Search?.open?.()));

    show(0);
    return () => {
      if (active) { try { active.unmount(stage); } catch (e) {} active = null; }
      offs.splice(0).forEach(f => f());
    };
  }

  return { render, mount };
})();
