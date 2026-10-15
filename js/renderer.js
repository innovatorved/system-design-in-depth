/* ═══════════════════════════════════════════════════════════════
   Renderer — Content rendering for lessons, builds, and overview
   ═══════════════════════════════════════════════════════════════ */

window.loadScript = window.loadScript || function loadScript(src) {
  const baseSrc = src.split('?')[0];
  window._loadedScripts = window._loadedScripts || {};
  if (window._loadedScripts[baseSrc]) {
    return Promise.resolve();
  }

  const activeScripts = Array.from(document.querySelectorAll('script[src]')).filter(s => s.getAttribute('type') !== 'text/plain');
  const existingActive = activeScripts.find(s => {
    const sSrc = s.getAttribute('src') || '';
    return sSrc === src || sSrc.split('?')[0] === baseSrc;
  });

  if (existingActive) {
    if (existingActive.dataset.loaded === 'true') {
      window._loadedScripts[baseSrc] = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      existingActive.addEventListener('load', () => {
        existingActive.dataset.loaded = 'true';
        window._loadedScripts[baseSrc] = true;
        resolve();
      }, { once: true });
      existingActive.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    const versionedSrc = (src.includes('?') || !window.ASSET_VERSION) ? src : `${src}?v=${window.ASSET_VERSION}`;
    s.src = versionedSrc;
    s.onload = () => {
      s.dataset.loaded = 'true';
      window._loadedScripts[baseSrc] = true;
      resolve();
    };
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });
};

window.SIMULATOR_SCRIPT_MAP = {
  "back-of-the-envelope-capacity-planning": "js/simulators.js",
  "consistent-hashing-load-balancing": "js/simulators.js",
  "consistent-hashing": "js/simulators.js",
  "range-partitioning-vs-consistent-hashing-storage": "js/simulators.js",
  "sliding-window-rate-limiter": "js/simulators.js",
  "rate-limiting-and-abuse-prevention-case-study": "js/simulators.js",
  "rate-limiter-placement-and-keys": "js/simulators.js",
  "cache-eviction-policies": "js/simulators-extra.js",
  "tail-latency": "js/simulators-extra.js",
  "non-functional-requirements": "js/simulators-extra.js",
  "feed-generation-push-pull-hybrid": "js/simulators-extra.js",
  "fanout-patterns": "js/simulators-extra.js",
  "social-feed-system-design-case-study": "js/simulators-extra.js",
  "replication": "js/simulators-extra.js",
  "consistency-models": "js/simulators-extra.js",
  "cap-and-pacelc": "js/simulators-extra.js",
  "consensus": "js/simulators-extra.js",
  "leader-election": "js/simulators-extra.js",
  "bloom-filters": "js/simulators-extra.js",
  "seen-filtering-bloom-vs-exact-sets": "js/simulators-extra.js",
  "lsm-read-path-bloom-and-sparse-index": "js/simulators-extra.js",
  "lsm-tree-storage-engine": "js/simulators-extra.js",
  "b-tree": "js/simulators-extra.js",
  "memtable-wal-and-sstable": "js/simulators-extra.js",
  "compaction-and-amplification": "js/simulators-extra.js",
  "storage-engine-tradeoffs": "js/simulators-extra.js",
  "sharding-and-partitioning": "js/simulators-advanced.js",
  "hot-partitions": "js/simulators-advanced.js",
  "queue-lag": "js/simulators-advanced.js",
  "backpressure": "js/simulators-advanced.js",
  "partitioned-log-system-design": "js/simulators-advanced.js",
  "circuit-breakers-and-timeouts": "js/simulators-advanced.js",
  "cache-availability-and-database-fallback": "js/simulators-advanced.js",
  "retries-timeouts-idempotency": "js/simulators-advanced.js",
  "geohash-prefix-spatial-index": "js/simulators-advanced.js",
  "geospatial-grid-systems-h3-s2-geohash": "js/simulators-advanced.js",
  "nearby-geospatial-search-system-design": "js/simulators-advanced.js",
  "hyperloglog-cardinality-estimation": "js/simulators-advanced.js",
  "view-counting-at-scale": "js/simulators-advanced.js",
  "bm25-production-ranking": "js/simulators-advanced.js",
  "tf-idf-relevance-scoring": "js/simulators-advanced.js",
  "inverted-index-and-posting-lists": "js/simulators-advanced.js",
  "collaborative-editing-system-design": "js/simulators-advanced.js",
  "concurrency-vs-parallelism": "js/simulators-advanced.js",
  "load-shedding": "js/simulators-advanced.js",
  "case-amazon-dynamo": "js/simulators-distributed.js",
  "clocks-and-ordering": "js/simulators-distributed.js",
  "clock-skew-and-id-ordering": "js/simulators-distributed.js",
  "count-min-sketch": "js/simulators-distributed.js",
  "top-k-heavy-hitters": "js/simulators-distributed.js",
  "gossip-protocol": "js/simulators-distributed.js",
  "load-balancers": "js/simulators-ops.js",
  "api-gateway-vs-load-balancer": "js/simulators-ops.js",
  "cache-concurrency-control": "js/simulators-ops.js",
  "ttl-expiration-and-cache-reapers": "js/simulators-ops.js",
  "snowflake-id-design": "js/simulators-ops.js",
  "uuid-objectid-and-snowflake": "js/simulators-ops.js",
  "distributed-id-generation": "js/simulators-ops.js",
  "slos-and-error-budgets": "js/simulators-ops.js",
  "observability-slo-case-study": "js/simulators-ops.js",
  "mvcc": "js/simulators-data.js",
  "database-locking-and-isolation": "js/simulators-data.js",
  "adaptive-bitrate-and-cdn-decider": "js/simulators-data.js",
  "video-transcoding-pipeline": "js/simulators-data.js",
  "ray-casting-point-in-polygon": "js/simulators-data.js",
  "geofencing-point-in-polygon": "js/simulators-data.js",
  "database-wal-and-recovery": "js/simulators-data.js",
  "disaster-recovery": "js/simulators-data.js"
};

window.Renderer = (() => {
  // SVG Icons
  const icons = {
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    circle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>',
    dot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/></svg>',
    play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    book: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    code: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
    chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
    star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.77V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.77a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24Z"/></svg>',
    github: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
    globe: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    external: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    calendar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    terminal: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    target: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    arrowLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
  };

  /**
   * Format content review date (e.g. "2026-09-17" -> "Sep 17, 2026")
   */
  function formatReviewDate(dateStr) {
    if (!dateStr) return '2026';
    try {
      const parts = String(dateStr).split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const y = parts[0];
        if (m >= 0 && m < 12 && !isNaN(d)) {
          return `${months[m]} ${d}, ${y}`;
        }
      }
      return String(dateStr);
    } catch (_) {
      return String(dateStr);
    }
  }

  /**
   * Render the Course Overview (home page)
   */
  function renderOverview() {
    const data = window.CURRICULUM_DATA;
    if (!data) return '<p>Loading curriculum data...</p>';

    const stats = data.stats;
    const pct = window.Progress.getPercentage();
    const streak = window.Progress.getStreak ? window.Progress.getStreak().current : 0;
    const projects = window.PROJECTS_DATA || [];
    const pinnedProjects = projects.filter(p => p.pinned);

    let html = `
      <div class="hero">
        <div class="hero__eyebrow">System Design Course</div>
        <h1 class="hero__title">System Design In Depth</h1>
        <p class="hero__subtitle">Deep notes, case studies, YouTube tutorials, and from-scratch implementations for senior engineering practice.</p>
        <div class="hero__stats">
          <div><div class="hero__stat-value">${stats.tracks || 6}</div><div class="hero__stat-label">Tracks</div></div>
          <div><div class="hero__stat-value">${stats.units}</div><div class="hero__stat-label">Topics</div></div>
          <div><div class="hero__stat-value">${pct}%</div><div class="hero__stat-label">Complete</div></div>
          <div><div class="hero__stat-value" style="color: ${streak > 0 ? '#f97316' : 'inherit'};">${streak} 🔥</div><div class="hero__stat-label">Day Streak</div></div>
        </div>
        <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="#/glossary" class="btn btn--sm btn--primary">📖 Glossary</a>
        </div>
      </div>`;

    // Render each part
    for (const part of data.parts) {
      html += `
        <div class="part-header">
          <h2 class="part-header__title">${part.title}</h2>
          <p class="part-header__summary">${part.summary}</p>
        </div>
        <div class="module-grid">`;

      for (const mod of part.modules) {
        const prog = window.Progress.getModuleProgress(mod.id);
        const progPct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
        html += `
          <div class="module-card" data-module="${mod.id}" data-action="navigate-module" data-module-id="${mod.id}">
            <div class="module-card__header">
              <span class="module-card__number">${mod.number}</span>
              <div class="module-card__info">
                <div class="module-card__title">${mod.title}</div>
                <div class="module-card__meta">
                  <span>${mod.units.length} units</span>
                  <span>·</span>
                  <span>${prog.completed}/${prog.total} done</span>
                </div>
              </div>
            </div>
            <p class="module-card__summary">${mod.summary || ''}</p>
            <div class="module-card__progress">
              <div class="module-card__progress-fill" style="width:${progPct}%"></div>
            </div>
          </div>`;
      }

      html += '</div>';

      // Add section divider between parts
      if (part.number < data.parts.length) {
        html += '<div class="section-divider"><span class="section-divider__line"></span><span class="section-divider__text">Next Part</span><span class="section-divider__line"></span></div>';
      }
    }

    return html;
  }

  /**
   * Render a Lesson View
   */
  function renderLesson(slug) {
    const data = window.CURRICULUM_DATA;
    if (!data) return '<p>Loading...</p>';

    // Find unit and module
    let unit = null;
    let mod = null;
    let part = null;
    for (const p of data.parts) {
      for (const m of p.modules) {
        for (const u of m.units) {
          if (u.slug === slug) {
            unit = u;
            mod = m;
            part = p;
            break;
          }
        }
        if (unit) break;
      }
      if (unit) break;
    }

    if (!unit) return '<p>Topic not found.</p>';

    const isCompleted = window.Progress.isCompleted(slug);
    const kindClass = unit.kind === 'system' ? 'system' : 'lesson';

    // Get module content if loaded
    const moduleContent = window.MODULE_CONTENT?.[mod.id]?.[slug];
    const archiveContent = window.ARCHIVE_CONTENT?.[slug] || null;
    // Trigger lazy-load of archive file if not yet loaded (only slugs that ship a data/archive file)
    if (!archiveContent && unit.archive && ARCHIVE_SLUGS.has(slug) && !window.ARCHIVE_CONTENT?.[slug]) {
      const archiveScript = document.createElement('script');
      archiveScript.src = 'data/archive/' + slug + '.js' + (window.ASSET_VERSION ? '?v=' + window.ASSET_VERSION : '');
      archiveScript.onload = () => {
        // Re-render once archive content is available (only if the learner is still on this lesson),
        // then restore what the first render wired up: simulator, diagrams, audio.
        const reader = document.getElementById('reader');
        if (!reader || decodeURIComponent(location.hash) !== '#topic/' + slug) return;
        const sim = window.Simulators?.getSimulatorForUnit?.(slug)?.sim;
        sim?.unmount?.(reader);
        reader.innerHTML = renderLesson(slug);
        sim?.mount?.(reader);
        window.App?.initMermaid?.();
        window.setupAudioListeners?.(slug);
      };
      document.head.appendChild(archiveScript);
    }

    const reviewDate = formatReviewDate(unit.archive?.updated);

    // Build header
    let html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-nav="home">Home</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <a href="#" data-nav="module" data-module="${mod.id}">${mod.title}</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <span class="breadcrumbs__current">${unit.title}</span>
      </nav>

      <div class="lesson-header">
        <div class="lesson-header__badge">
          <span class="lesson-header__kind lesson-header__kind--${kindClass}">${unit.kind}</span>
          ${unit.archive?.tags?.map(t => '<span class="tag">' + t + '</span>').join('') || ''}
        </div>
        <h1 class="lesson-header__title">${unit.title}</h1>
        <div class="lesson-header__meta">
          ${unit.archive?.wordCount ? '<span class="lesson-header__meta-item">' + icons.clock + ' ' + Math.ceil(unit.archive.wordCount / 200) + ' min read</span>' : ''}
          <span class="lesson-header__meta-item">${icons.book} Module ${mod.number}: ${mod.title}</span>
          <span class="lesson-header__meta-item" title="Content curriculum review date">${icons.calendar} Updated ${reviewDate}</span>
        </div>
        <div class="lesson-header__actions" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
          <button class="completion-toggle${isCompleted ? ' completed' : ''}" data-action="toggle-complete" data-slug="${slug}">
            ${isCompleted ? icons.check + ' Completed' : icons.circle + ' Mark Complete'}
          </button>
          <a href="#cheatsheet/${mod.id}" class="btn btn--sm btn--outline" title="View printable cheat sheet for this module">
            📄 Cheat Sheet
          </a>
        </div>
      </div>`;

    // Video embed (from module content)
    if (moduleContent?.video?.youtubeId) {
      html += renderVideoEmbed(moduleContent.video);
      html += renderMoreVideos(moduleContent.videos);
    }

    // Intuition-first primer (plain-language mental model before the deep dive)
    if (moduleContent?.intuition) {
      html += `
        <aside class="intuition">
          <h3 class="intuition__title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>Intuition first</h3>
          <div class="intuition__body">${moduleContent.intuition}</div>
        </aside>`;
    }

    // Audio player
    html += `
      <div class="audio-player" id="audio-player-${slug}">
        <button class="audio-player__play-btn" id="audio-btn-${slug}" data-action="toggle-audio" data-slug="${slug}" aria-label="Play audio" title="Play audio">
          <svg id="audio-play-icon-${slug}" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg id="audio-pause-icon-${slug}" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <span class="audio-player__time" id="audio-time-${slug}">0:00 / --:--</span>
        <div class="audio-player__track" data-action="seek-audio" data-slug="${slug}" id="audio-track-${slug}">
          <div class="audio-player__progress" id="audio-bar-${slug}" style="width: 0%;"></div>
        </div>
        <button class="audio-player__speed-btn" data-action="cycle-audio-speed" data-slug="${slug}" id="audio-speed-${slug}" title="Playback speed">1x</button>
        <audio id="audio-${slug}" src="audio/${slug}.mp3" preload="metadata"></audio>
      </div>`;

    // Content
    html += '<article class="prose">';

    if (archiveContent && archiveContent.trim().length > 100) {
      // Use authentic markdown from curriculum
      html += convertMarkdownToHTML(archiveContent);
      // If module content has complementary details (e.g. diagrams or breakdown), augment smoothly
      const isPlaceholder = moduleContent?.content?.includes('This topic is covered in depth in the curriculum archive');
      if (moduleContent?.content && !isPlaceholder && !archiveContent.includes('Real-World Usage')) {
        html += '<hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--divider);">';
        html += '<div class="lesson-deep-dive">' + moduleContent.content + '</div>';
      }
    } else if (moduleContent?.content) {
      // Use comprehensive generated module content
      html += moduleContent.content;
    } else {
      // Fallback
      html += renderFallbackContent(unit, mod);
    }

    html += '</article>';

    // Check yourself: this lesson's questions as a one-at-a-time slider
    if (window.Quiz?.renderCheckSlider) html += window.Quiz.renderCheckSlider(slug);

    // Interactive Visual Simulator (if applicable for unit)
    if (window.Simulators && window.Simulators.getSimulatorForUnit) {
      const simData = window.Simulators.getSimulatorForUnit(slug);
      if (simData) {
        html += simData.html;
      } else if (window.SIMULATOR_SCRIPT_MAP?.[slug]) {
        html += `<div class="sim-card-placeholder" data-sim-slug="${slug}"></div>`;
      }
    } else if (window.SIMULATOR_SCRIPT_MAP?.[slug]) {
      html += `<div class="sim-card-placeholder" data-sim-slug="${slug}"></div>`;
    }

    // Interactive Practice / Challenge Exercise
    if (window.Exercises && window.Exercises.renderExercise) {
      html += window.Exercises.renderExercise(slug, unit.title);
    }

    // Key takeaways
    if (moduleContent?.keyTakeaways?.length) {
      html += `
        <div class="takeaways">
          <h3 class="takeaways__title">Key Takeaways</h3>
          <div class="takeaways__list">
            ${moduleContent.keyTakeaways.map(t => '<div class="takeaways__item">' + t + '</div>').join('')}
          </div>
        </div>`;
    }

    // From-scratch builds for this lesson
    html += renderLessonBuilds(slug);

    // Further reading
    if (moduleContent?.furtherReading?.length) {
      html += `
        <div class="further-reading">
          <h3 class="further-reading__title">Further Reading</h3>
          <div class="further-reading__list">
            ${moduleContent.furtherReading.map(r => '<a class="further-reading__link" href="' + r.url + '" target="_blank" rel="noopener">' + icons.link + ' ' + r.title + '</a>').join('')}
          </div>
        </div>`;
    } else if (unit.archive?.sources?.length) {
      html += `
        <div class="further-reading">
          <h3 class="further-reading__title">Sources</h3>
          <div class="further-reading__list">
            ${unit.archive.sources.filter(s => s.startsWith('http')).map(s => '<a class="further-reading__link" href="' + s + '" target="_blank" rel="noopener">' + icons.link + ' ' + s.replace(/https?:\/\//, '').split('/').slice(0, 2).join('/') + '</a>').join('')}
          </div>
        </div>`;
    }

    // Was this helpful / Report issue feedback bar
    html += renderLessonFeedback(slug, unit);

    // Prev/Next navigation
    html += renderLessonNav(slug, mod, part);

    return html;
  }

  // Order build files: README first, then implementation, demo, tests
  const buildFileRank = f => (/readme/i.test(f) ? 0 : /^demo\b|\/demo\b/i.test(f) ? 2 : /test/i.test(f) ? 3 : 1);
  const orderedBuildFiles = files => Object.entries(files || {}).sort((a, b) => buildFileRank(a[0]) - buildFileRank(b[0]));

  // Lesson title lookup for cross-links
  function findUnitTitle(slug) {
    for (const p of window.CURRICULUM_DATA?.parts || []) for (const m of p.modules) for (const u of m.units) if (u.slug === slug) return u.title;
    return null;
  }

  /**
   * Builds that teach this lesson (primarySlug or relatedSlugs)
   */
  function buildsForLesson(slug) {
    return Object.entries(window.IMPLEMENTATIONS_DATA || {})
      .filter(([, b]) => b.primarySlug === slug || (b.relatedSlugs || []).includes(slug))
      .sort((a, b) => (a[1].primarySlug === slug ? 0 : 1) - (b[1].primarySlug === slug ? 0 : 1));
  }

  function renderLessonBuilds(slug) {
    const builds = buildsForLesson(slug);
    if (!builds.length) return '';
    return `
      <div class="lesson-builds">
        <h3 class="lesson-builds__title">${icons.code} Build it from scratch — Interactive Lab &amp; Guide</h3>
        ${builds.map(([id, b]) => `
          <a class="lesson-builds__item" href="/build/${id}/" data-action="navigate-build" data-build-id="${id}">
            <span class="lesson-builds__name">${escapeHtml(b.title || id)}</span>
            ${b.summary ? `<span class="lesson-builds__summary">${escapeHtml(b.summary)}</span>` : ''}
            <span class="lesson-builds__cta">${icons.terminal} Open Build Guide &amp; Interactive Lab (JS &amp; TS) →</span>
          </a>`).join('')}
      </div>`;
  }

  /**
   * Render a Build (Implementation) View
   * Initially presents the Build Guide, Interactive Lab Overview Card & Steps, and Reference Code,
   * with a one-click full-page Interactive Lab transition.
   */
  function renderBuild(buildId) {
    const impls = window.IMPLEMENTATIONS_DATA;
    if (!impls || !impls[buildId]) return '<p>Build not found.</p>';

    const build = impls[buildId];
    const guided = window.GUIDED_LABS_DATA?.[buildId] || null;
    const steps = Array.isArray(guided?.steps) ? guided.steps : [];
    const files = orderedBuildFiles(build.files);
    const lessons = [build.primarySlug, ...(build.relatedSlugs || [])].filter(Boolean)
      .map(s => ({ slug: s, title: findUnitTitle(s) })).filter(l => l.title);
    const demoFile = files.find(([f]) => /(^|\/)demo\.js$/i.test(f))?.[0];
    const testFile = files.find(([f]) => /(^|\/)test\.js$/i.test(f))?.[0];

    let completedIds = [];
    try {
      const raw =
        localStorage.getItem('sd-codelab-v1:' + buildId) ||
        localStorage.getItem('codelab_progress_' + buildId) ||
        localStorage.getItem('sd_codelab_' + buildId);
      const saved = JSON.parse(raw || 'null');
      if (Array.isArray(saved?.completedSteps)) completedIds = saved.completedSteps;
    } catch (_) {}

    const totalSteps = steps.length || 4;
    const progressPct = Math.min(100, Math.round((completedIds.length / Math.max(1, totalSteps)) * 100));
    const difficulty = guided?.difficulty || 'Intermediate';
    const estMinutes = guided?.estimatedMinutes || 25;

    let html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#" data-nav="home">Home</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <span class="breadcrumbs__current">${escapeHtml(build.title || buildId)}</span>
      </nav>

      <div class="lesson-header">
        <div class="lesson-header__badge">
          <span class="lesson-header__kind lesson-header__kind--build">${icons.code} From-Scratch Build</span>
        </div>
        <h1 class="lesson-header__title">${escapeHtml(build.title || buildId.replace(/-/g, ' '))}</h1>
        ${build.summary ? `<p class="build-summary">${escapeHtml(build.summary)}</p>` : ''}
        <div class="lesson-header__meta">
          <span class="lesson-header__meta-item">${icons.clock} ~${estMinutes} min</span>
          <span class="lesson-header__meta-item">${icons.code} ${escapeHtml(difficulty)}</span>
          ${lessons.length ? `<span class="lesson-header__meta-item">${icons.book} Lesson${lessons.length > 1 ? 's' : ''}: ${lessons.map(l =>
            `<a href="#" data-nav="topic" data-slug="${l.slug}">${escapeHtml(l.title)}</a>`).join(', ')}</span>` : ''}
        </div>
      </div>

      <div class="build-view-tabs" role="tablist" aria-label="Build View Mode">
        <button type="button" class="build-view-tab active" role="tab" aria-selected="true">
          ${icons.book}
          <span>Architecture &amp; Reference Code</span>
        </button>
        <button type="button" class="build-view-tab" role="tab" aria-selected="false" data-action="open-code-lab" data-lab-mode="guided">
          ${icons.terminal}
          <span>Interactive Lab IDE</span>
          <span class="build-view-tab__badge">${completedIds.length}/${totalSteps} Steps</span>
        </button>
        <button type="button" class="build-view-tab" role="tab" aria-selected="false" data-action="open-code-lab" data-lab-mode="sandbox">
          ${icons.code}
          <span>Sandbox Mode</span>
        </button>
      </div>

      <section class="build-lab-card" aria-label="Interactive Build Lab Overview">
        <div class="build-lab-card__top">
          <div class="build-lab-card__intro">
            <div class="build-lab-card__eyebrow">
              <span>Interactive Build Lab</span>
              <span class="build-lab-card__progress" id="build-lab-progress-badge">${completedIds.length}/${totalSteps} Steps Completed</span>
            </div>
            <h2 class="build-lab-card__title">Code &amp; Verify in the Browser Workbench</h2>
            <p class="build-lab-card__desc">
              Complete ${totalSteps} progressive engineering steps in <strong>JavaScript</strong> or <strong>TypeScript</strong> against an in-browser Node.js v22 runtime (virtual filesystem, loopback TCP/HTTP, and automated unit tests) — zero local setup required.
            </p>
            <div class="build-lab-progress-track" aria-hidden="true">
              <div class="build-lab-progress-track__fill" style="width:${progressPct}%"></div>
            </div>
          </div>
          <div class="build-lab-card__cta-col">
            <button type="button" class="btn btn--primary build-lab-card__launch-btn" data-action="open-code-lab" data-lab-mode="guided">
              ${icons.terminal}
              <span>Launch Guided Lab</span>
            </button>
            <button type="button" class="btn btn--outline build-lab-card__launch-btn" data-action="open-code-lab" data-lab-mode="sandbox">
              ${icons.code}
              <span>Open Full Solution</span>
            </button>
          </div>
        </div>

        ${steps.length ? `
          <div class="build-lab-steps-grid" id="build-lab-steps-grid">
            ${steps.map((s, idx) => {
              const isDone = completedIds.includes(s.id);
              const cleanTitle = (s.title || '').replace(/^Step\s*\d+:\s*/i, '');
              return `
                <button type="button" class="build-lab-step-card ${isDone ? 'is-done' : ''}" data-action="open-code-lab" data-lab-mode="guided" data-step-index="${idx}">
                  <div class="build-lab-step-card__header">
                    <span class="build-lab-step-card__num">${isDone ? icons.check : `0${idx + 1}`}</span>
                    <span class="build-lab-step-card__target">${escapeHtml(s.targetFile || '')}${s.targetSymbol ? ` · ${escapeHtml(s.targetSymbol.split('/')[0].trim())}` : ''}</span>
                  </div>
                  <div class="build-lab-step-card__title">${escapeHtml(cleanTitle)}</div>
                  <div class="build-lab-step-card__concept">${escapeHtml(s.concept || '')}</div>
                  <div class="build-lab-step-card__footer">
                    <span>${(s.testNames || []).length} test${(s.testNames || []).length === 1 ? '' : 's'}</span>
                    <span class="build-lab-step-card__open">Step ${idx + 1} →</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
      </section>

      <div id="build-walkthrough-pane">`;

    for (const [filename, content] of files) {
      if (filename.endsWith('.md')) {
        const cleanMd = content
          .replace(/^#\s+[^\n]+\n+/, '')
          .replace(/\n##\s+(?:How to run|9\.\s*Verification & Running the Lab)\b[\s\S]*?(?=\n##\s+|\s*$)/g, '\n');
        const anchor = `build-file-${buildId}-${filename.replace(/[^\w-]/g, '_')}`;
        html += `<article class="prose" id="${anchor}">` + convertMarkdownToHTML(cleanMd) + '</article>';
      }
    }

    html += `
      </div>

      <div class="build-lab-overlay" id="build-lab-overlay" aria-hidden="true">
        <div id="codelab-mount-${escapeHtml(buildId)}" class="build-lab-overlay__mount" data-build-id="${escapeHtml(buildId)}"></div>
      </div>`;
    return html;
  }


  /**
   * Render YouTube video embed (lazy-loaded)
   */
  function renderVideoEmbed(video) {
    if (!video?.youtubeId) return '';
    return `<div class="video-main" data-video="${escapeHtml(JSON.stringify(video))}">${renderMainVideoInner(video, false)}</div>`;
  }

  // Player + caption for the main video; autoplay loads the iframe straight away (used when swapping in)
  function renderMainVideoInner(video, autoplay) {
    const id = video.youtubeId;
    const player = autoplay
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      : `<div class="video-embed__placeholder" data-action="load-youtube" data-video-id="${id}">
          <img class="video-embed__thumb" src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
               alt="${escapeHtml(video.title || '')}"
               loading="lazy">
          <div class="video-embed__play-btn">${icons.play}</div>
        </div>`;
    return `
      <div class="video-embed" id="video-${id}">${player}</div>
      ${video.title ? `<div class="video-embed__info">
        <span class="video-embed__channel">${escapeHtml(video.channel || 'YouTube')}</span>
        <span class="video-embed__title">${escapeHtml(video.title)}</span>
        <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer" style="margin-left:auto; font-size:11px; color:var(--accent,#6366f1); text-decoration:none; display:flex; align-items:center; gap:2px;">
          Watch on YouTube ↗
        </a>
      </div>` : ''}
      ${video.why ? `<p class="video-embed__why">${escapeHtml(video.why)}</p>` : ''}`;
  }

  // Units with a data/archive/<slug>.js file; requesting any other slug 404s. Keep in sync with data/archive/.
  const ARCHIVE_SLUGS = new Set(["adaptive-bitrate-and-cdn-decider","availability-durability-consistency-cost","back-of-the-envelope-capacity-planning","blocklist-versioned-file-metadata","boolean-tiered-search","byte-range-indexed-object-storage","caching-layers","clock-skew-and-id-ordering","concurrency-vs-parallelism","database-ticket-servers","file-backed-dictionary-storage-engine","logical-system-design","mergeable-sketches-for-analytics","newly-unread-indicator","non-functional-requirements","notification-system-design","parallel-monolith-read-drain","partition-manager-and-map-table","photo-tagging-coordinate-model","requirements-clarification","rule-engine-trigger-framework","social-graph-follows-and-flockdb","stop-words-and-champion-lists","system-design-tradeoffs","tcp-vs-udp","tdigest-quantile-sketch","when-not-to-add-infrastructure"]);

  const VIDEO_ROLE_LABELS = {
    primary: 'Main pick',
    intro: 'Quick intro',
    'deep-dive': 'Deep dive',
    interview: 'Interview walkthrough',
    'case-study': 'Case study'
  };

  // A card still links to YouTube (ctrl/cmd/middle-click open a tab); a plain click plays it in the main player
  function renderMoreVideoCard(v) {
    return `
      <a class="video-more__card" href="https://www.youtube.com/watch?v=${v.youtubeId}" target="_blank" rel="noopener noreferrer"
         data-action="play-in-main-video" data-video="${escapeHtml(JSON.stringify(v))}"
         title="Play here (Ctrl/⌘-click to open on YouTube)">
        <span class="video-more__thumb">
          <img src="https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg" alt="" loading="lazy">
          <span class="video-more__play">${icons.play}</span>
          ${v.length ? `<span class="video-more__len">${escapeHtml(v.length)}</span>` : ''}
        </span>
        <span class="video-more__meta">
          <span class="video-more__role">${escapeHtml(VIDEO_ROLE_LABELS[v.role] || 'Also watch')}</span>
          <span class="video-more__title">${escapeHtml(v.title || '')}</span>
          <span class="video-more__channel">${escapeHtml(v.channel || 'YouTube')}</span>
          ${v.why ? `<span class="video-more__why">${escapeHtml(v.why)}</span>` : ''}
        </span>
      </a>`;
  }

  /**
   * Render supplementary videos (intro / deep-dive / interview / case-study)
   */
  function renderMoreVideos(videos) {
    if (!Array.isArray(videos) || !videos.length) return '';
    const cards = videos.filter(v => v?.youtubeId).map(renderMoreVideoCard).join('');
    return cards ? `
      <div class="video-more">
        <h2 class="video-more__heading">More videos on this topic</h2>
        <div class="video-more__list">${cards}</div>
      </div>` : '';
  }

  // Swap a card's video into the main player (and the current main video into that card's slot)
  window.playInMainVideo = function(event, card) {
    const next = JSON.parse(card.dataset.video || 'null');
    if (!next) return true;
    if (window.Analytics?.trackVideoPlay) window.Analytics.trackVideoPlay(next.youtubeId, next.title || '');
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) return true; // let the link open YouTube
    const main = document.querySelector('.video-main');
    if (!main) return true;
    event.preventDefault();
    const prev = JSON.parse(main.dataset.video || 'null');
    main.dataset.video = JSON.stringify(next);
    main.innerHTML = renderMainVideoInner(next, true);
    if (prev) card.outerHTML = renderMoreVideoCard({ ...prev, role: prev.role || 'primary' });
    const top = main.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return false;
  };

  /**
   * Convert basic markdown to HTML
   */
  function convertMarkdownToHTML(md) {
    if (!md) return '';

    // Phase 1: Extract code blocks, mermaid diagrams, and inline code spans to protect them from other regexes
    const codeBlocks = [];
    const inlineCodes = [];
    let html = md
      // Mermaid blocks MUST be replaced before generic code blocks
      .replace(/```mermaid\s*\n([\s\S]*?)```/g, (_, diagram) => {
        const idx = codeBlocks.length;
        codeBlocks.push('<div class="mermaid">' + diagram.trim() + '</div>');
        return '\x00CODEBLOCK_' + idx + '\x00';
      })
      // Code blocks (``` blocks) - handle info strings like title="terminal"
      .replace(/```(\S+)?[^\n]*\n([\s\S]*?)```/g, (_, lang, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push('<pre><code class="language-' + (lang || 'text') + '">' + escapeHtml(code.trim()) + '</code></pre>');
        return '\x00CODEBLOCK_' + idx + '\x00';
      })
      // Inline code (`...`) - escape HTML entities inside backticks & protect from markdown regexes
      .replace(/`([^`\n]+)`/g, (_, code) => {
        const idx = inlineCodes.length;
        inlineCodes.push('<code>' + escapeHtml(code) + '</code>');
        return '\x00INLINECODE_' + idx + '\x00';
      });

    // Phase 2: Process block-level markdown syntax (code blocks & inline code are safely extracted)
    html = html
      // GitHub alerts / blockquote callouts
      .replace(/^>\s*\[!NOTE\]\s*(.*)$/gm, '<div class="callout callout--note"><div class="callout__title">ℹ️ Note</div><p>$1</p></div>')
      .replace(/^>\s*\[!TIP\]\s*(.*)$/gm, '<div class="callout callout--tip"><div class="callout__title">💡 Tip</div><p>$1</p></div>')
      .replace(/^>\s*\[!WARNING\]\s*(.*)$/gm, '<div class="callout callout--warn"><div class="callout__title">⚠️ Warning</div><p>$1</p></div>')
      .replace(/^>\s*\[!IMPORTANT\]\s*(.*)$/gm, '<div class="callout callout--danger"><div class="callout__title">❗ Important</div><p>$1</p></div>')
      .replace(/^>\s*(.*)$/gm, '<blockquote><p>$1</p></blockquote>')
      // Headers
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      // Tables
      .replace(/^\|(.+)\|[ \t]*\n\|[-| :]+\|[ \t]*\n((?:\|.+\|[ \t]*(?:\n|$))*)/gm, (_, header, body) => {
        const ths = header.split('|').map(h => '<th>' + h.trim() + '</th>').join('');
        const rows = body.trim().split('\n').map(row => {
          const tds = row.trim().replace(/^\||\|$/g, '').split('|').map(c => '<td>' + c.trim() + '</td>').join('');
          return '<tr>' + tds + '</tr>';
        }).join('');
        return '<table><thead><tr>' + ths + '</tr></thead><tbody>' + rows + '</tbody></table>\n';
      });

    // Phase 3: Process paragraphs and lists (joining hard-wrapped continuation lines cleanly)
    const lines = html.split('\n');
    const processed = [];
    let inList = false;
    let listType = '';
    let openLi = false;
    let paraLines = [];

    function flushPara() {
      if (paraLines.length > 0) {
        processed.push('<p>' + paraLines.join(' ') + '</p>');
        paraLines = [];
      }
    }

    function closeList() {
      if (openLi) {
        processed[processed.length - 1] += '</li>';
        openLi = false;
      }
      if (inList) {
        processed.push('</' + listType + '>');
        inList = false;
        listType = '';
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extracted code / mermaid block placeholder
      if (line.trim().match(/^\x00CODEBLOCK_\d+\x00$/)) {
        flushPara();
        closeList();
        processed.push(line.trim());
        continue;
      }

      // Skip already-processed block-level HTML tags
      if (line.match(/^<(h[1-6]|table|thead|tbody|tr|th|td|div|pre|hr|ul|ol|li|blockquote)\b/)) {
        flushPara();
        closeList();
        processed.push(line);
        continue;
      }

      // Unordered list item
      if (line.match(/^[-*] /)) {
        flushPara();
        if (!inList || listType !== 'ul') {
          closeList();
          processed.push('<ul>');
          inList = true; listType = 'ul';
        } else if (openLi) {
          processed[processed.length - 1] += '</li>';
          openLi = false;
        }
        processed.push('<li>' + line.replace(/^[-*] /, ''));
        openLi = true;
        continue;
      }

      // Ordered list item
      if (line.match(/^\d+\. /)) {
        flushPara();
        if (!inList || listType !== 'ol') {
          closeList();
          processed.push('<ol>');
          inList = true; listType = 'ol';
        } else if (openLi) {
          processed[processed.length - 1] += '</li>';
          openLi = false;
        }
        processed.push('<li>' + line.replace(/^\d+\. /, ''));
        openLi = true;
        continue;
      }

      // Blank line ends current paragraph or list
      if (line.trim() === '') {
        flushPara();
        closeList();
        continue;
      }

      // Continuation line inside an active list item
      if (inList && openLi) {
        if (line.match(/^\s+[-*] /)) {
          processed[processed.length - 1] += '<br>• ' + line.replace(/^\s+[-*] /, '').trim();
        } else {
          processed[processed.length - 1] += ' ' + line.trim();
        }
        continue;
      }

      // Paragraph line
      paraLines.push(line.trim());
    }

    flushPara();
    closeList();

    // Phase 4: Inline formatting (after multi-line paragraphs and list items are joined) & code restoration
    let out = processed.join('\n')
      // Bold
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
      // Links (standard and wiki-style)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\[\[wiki\/([^\]|]+)\|([^\]]+)\]\]/g, '<a href="#" data-nav="topic" data-slug="$1">$2</a>')
      .replace(/\[\[wiki\/([^\]]+)\]\]/g, (_, slug) => '<a href="#" data-nav="topic" data-slug="' + slug + '">' + slug.replace(/-/g, ' ') + '</a>');

    out = out
      .replace(/\x00CODEBLOCK_(\d+)\x00/g, (_, idx) => codeBlocks[parseInt(idx)])
      .replace(/\x00INLINECODE_(\d+)\x00/g, (_, idx) => inlineCodes[parseInt(idx)]);

    return out;
  }

  /**
   * Render fallback content when no detailed content is available
   */
  function renderFallbackContent(unit, mod) {
    const excerpt = unit.archive?.excerpt || '';
    let html = '';

    if (excerpt) {
      html += '<p>' + excerpt + '</p>';
    }

    html += `
      <div class="callout callout--note">
        <div class="callout__title">📚 Content Loading</div>
        <p>Detailed content for this topic is being prepared. In the meantime, explore the module overview and related topics in Module ${mod.number}: ${mod.title}.</p>
      </div>`;

    return html;
  }

  /**
   * Render feedback and report issue bar
   */
  function renderLessonFeedback(slug, unit) {
    const issueTitle = encodeURIComponent(`[Feedback] ${unit.title}`);
    const issueBody = encodeURIComponent(`### Topic: ${unit.title}\n**URL:** https://system-design-in-depth.vedgupta.in/topic/${slug}/\n\n### Feedback / Correction:\n`);
    const issueUrl = `https://github.com/innovatorved/system-design-in-depth/issues/new?title=${issueTitle}&labels=feedback,curriculum&body=${issueBody}`;

    return `
      <div class="lesson-feedback" id="lesson-feedback-${slug}">
        <div class="lesson-feedback__content">
          <div class="lesson-feedback__meta">
            <span class="lesson-feedback__title">Was this lesson helpful?</span>
            <span class="lesson-feedback__sub">Spot an issue or have a suggestion? Let us know on GitHub.</span>
          </div>
          <div class="lesson-feedback__actions">
            <button type="button" class="btn btn--sm btn--outline lesson-feedback__btn" data-action="feedback-vote" data-slug="${slug}" data-vote="yes">
              👍 Helpful
            </button>
            <button type="button" class="btn btn--sm btn--outline lesson-feedback__btn" data-action="feedback-vote" data-slug="${slug}" data-vote="no">
              👎 Needs work
            </button>
            <a href="${issueUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--outline lesson-feedback__btn" title="Open an issue on GitHub">
              ${icons.github} Report an issue
            </a>
          </div>
        </div>
      </div>`;
  }

  /**
   * Render prev/next lesson navigation
   */
  function renderLessonNav(currentSlug, currentMod, currentPart) {
    const data = window.CURRICULUM_DATA;
    if (!data) return '';

    // Build flat list of all slugs
    const allUnits = [];
    for (const p of data.parts) {
      for (const m of p.modules) {
        for (const u of m.units) {
          allUnits.push({ slug: u.slug, title: u.title, modTitle: m.title });
        }
      }
    }

    const idx = allUnits.findIndex(u => u.slug === currentSlug);
    if (idx < 0) return '';

    const prev = idx > 0 ? allUnits[idx - 1] : null;
    const next = idx < allUnits.length - 1 ? allUnits[idx + 1] : null;

    let html = '<div class="lesson-nav">';

    if (prev) {
      html += `<a class="lesson-nav__link" href="/topic/${prev.slug}/" data-nav="topic" data-slug="${prev.slug}">
        <span class="lesson-nav__label">← Previous</span>
        <span class="lesson-nav__title">${prev.title}</span>
      </a>`;
    } else {
      html += '<div></div>';
    }

    if (next) {
      html += `<a class="lesson-nav__link lesson-nav__link--next" href="/topic/${next.slug}/" data-nav="topic" data-slug="${next.slug}">
        <span class="lesson-nav__label">Next →</span>
        <span class="lesson-nav__title">${next.title}</span>
      </a>`;
    } else {
      html += '<div></div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Escape HTML
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Global helper for video loading
  window.loadYouTubeVideo = function(videoId, container) {
    container.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    if (window.Analytics?.trackVideoPlay) {
      const title = container.parentElement?.querySelector('.video-embed__title')?.textContent || '';
      window.Analytics.trackVideoPlay(videoId, title);
    }
  };

  // Global helper for lesson feedback
  window.handleFeedbackVote = function(btn, slug, vote) {
    const parent = btn.closest('.lesson-feedback__actions');
    if (parent) {
      parent.querySelectorAll('.lesson-feedback__btn').forEach(b => {
        if (b.tagName === 'BUTTON') {
          b.classList.remove('is-voted');
          b.disabled = true;
        }
      });
      btn.classList.add('is-voted');
      btn.textContent = vote === 'yes' ? '✓ Thanks for your feedback!' : '✓ We\'ll improve this!';
    }
    try {
      localStorage.setItem('feedback_' + slug, vote);
    } catch (_) {}
    if (window.Analytics?.trackLessonFeedback) {
      window.Analytics.trackLessonFeedback({ slug, vote });
    } else if (window.Analytics?.trackEvent) {
      window.Analytics.trackEvent('lesson_feedback', {
        topic_slug: slug,
        feedback_vote: vote,
        event_category: 'engagement'
      });
    }
  };

  // Global helpers for audio player
  window.toggleAudio = function(slug) {
    const audio = document.getElementById('audio-' + slug);
    const playIcon = document.getElementById('audio-play-icon-' + slug);
    const pauseIcon = document.getElementById('audio-pause-icon-' + slug);
    if (!audio) return;

    if (audio.paused) {
      // Pause all other audio players
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audio && !a.paused) {
          a.pause();
          const otherSlug = a.id.replace('audio-', '');
          const otherPlay = document.getElementById('audio-play-icon-' + otherSlug);
          const otherPause = document.getElementById('audio-pause-icon-' + otherSlug);
          if (otherPlay) otherPlay.style.display = 'block';
          if (otherPause) otherPause.style.display = 'none';
        }
      });
      window.setupAudioListeners(slug);
      audio.play().then(() => {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        if (window.Analytics?.trackAudioPlay) {
          window.Analytics.trackAudioPlay(slug, audio.currentTime);
        }
      }).catch(err => {
        console.warn('Audio playback error:', err);
      });
    } else {
      audio.pause();
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (window.Analytics?.trackAudioPause) {
        window.Analytics.trackAudioPause(slug, audio.currentTime, audio.duration);
      }
    }
  };

  window.seekAudio = function(slug, event) {
    const audio = document.getElementById('audio-' + slug);
    const track = document.getElementById('audio-track-' + slug);
    if (!audio || !track || !audio.duration) return;

    const rect = track.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    audio.currentTime = percent * audio.duration;
    if (window.Analytics?.trackAudioSeek) {
      window.Analytics.trackAudioSeek(slug, audio.currentTime);
    }
  };

  window.cycleAudioSpeed = function(slug) {
    const audio = document.getElementById('audio-' + slug);
    const btn = document.getElementById('audio-speed-' + slug);
    if (!audio || !btn) return;

    const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const currentSpeed = audio.playbackRate || 1;
    const nextIndex = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];

    audio.playbackRate = newSpeed;
    btn.textContent = newSpeed + 'x';
    if (window.Analytics?.trackAudioSpeedChange) {
      window.Analytics.trackAudioSpeedChange(slug, newSpeed);
    }
  };

  window.setupAudioListeners = function(slug) {
    const audio = document.getElementById('audio-' + slug);
    if (!audio || audio._listenersAttached) return;
    audio._listenersAttached = true;

    const bar = document.getElementById('audio-bar-' + slug);
    const timeDisplay = document.getElementById('audio-time-' + slug);
    const playIcon = document.getElementById('audio-play-icon-' + slug);
    const pauseIcon = document.getElementById('audio-pause-icon-' + slug);

    function formatTime(secs) {
      if (isNaN(secs) || !isFinite(secs)) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    if (audio.duration && timeDisplay) {
      timeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    }

    audio.addEventListener('loadedmetadata', () => {
      if (timeDisplay && audio.duration) {
        timeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (bar) bar.style.width = pct + '%';
      if (timeDisplay) {
        timeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
      }
    });

    audio.addEventListener('ended', () => {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (bar) bar.style.width = '0%';
      if (timeDisplay) {
        timeDisplay.textContent = '0:00 / ' + formatTime(audio.duration);
      }
      if (window.Analytics?.trackAudioComplete) {
        window.Analytics.trackAudioComplete(slug, audio.duration);
      }
    });
  };

  // Global helper for code copy
  window.copyCode = function(btn) {
    const block = btn.closest('.code-block');
    const code = block?.querySelector('code');
    const filename = block?.querySelector('.code-block__lang')?.textContent || '';
    if (code) {
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
        if (window.Analytics?.trackCodeCopy) {
          window.Analytics.trackCodeCopy(filename, '', code.textContent.length);
        }
      });
    }
  };

  /**
   * Render a single Project Card
   */
  function renderProjectCard(project) {
    const isPinned = project.pinned;
    const hasLive = Boolean(project.liveUrl);
    const tagsHtml = (project.tags || []).slice(0, 5).map(t => `<span class="project-card__tag">${escapeHtml(t)}</span>`).join('');
    const safeName = escapeAttr(project.name);

    return `
      <div class="project-card" id="project-${project.id}" data-project-id="${project.id}">
        <div class="project-card__top">
          <div class="project-card__title-group">
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-card__title-link" aria-label="${safeName} repository" data-repo-placement="card_title">
              <h3 class="project-card__title">${escapeHtml(project.name)}</h3>
            </a>
            ${project.title ? `<span class="project-card__subtitle">· ${escapeHtml(project.title)}</span>` : ''}
            <span class="project-card__lang">
              <span class="project-card__lang-dot" style="background-color: ${project.languageColor || 'var(--accent)'}"></span>
              <span class="project-card__lang-name">${escapeHtml(project.language || 'Code')}</span>
            </span>
          </div>

          <div class="project-card__badges">
            ${project.featuredBadge ? `<span class="project-card__badge project-card__badge--hn">${project.featuredBadge}</span>` : ''}
            ${isPinned ? `<span class="project-card__badge project-card__badge--pinned">${icons.pin} Pinned</span>` : ''}
            ${project.stars ? `<span class="project-card__stars-pill">${icons.star} ${project.stars}</span>` : ''}
          </div>
        </div>

        <p class="project-card__desc">${escapeHtml(project.description)}</p>

        <div class="project-card__footer">
          <div class="project-card__tags">
            ${tagsHtml}
          </div>

          <div class="project-card__actions">
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--secondary project-card__btn" aria-label="${safeName} GitHub repository" data-repo-placement="card_footer_github">
              ${icons.github}
              <span>GitHub</span>
              ${icons.external}
            </a>
            ${hasLive ? `
              <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--primary project-card__btn" aria-label="${safeName} live demo" data-repo-placement="card_footer_demo">
                ${icons.globe}
                <span>Live Demo</span>
                ${icons.external}
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the Dedicated Projects Showcase View
   */
  function renderProjects(selectedId) {
    const projects = window.PROJECTS_DATA || [];
    if (!projects.length) {
      return '<div style="padding: 40px; text-align: center; color: var(--fg-muted);">Loading projects...</div>';
    }

    let html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-nav="home">Home</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <span class="breadcrumbs__current">Projects</span>
      </nav>

      <div class="lesson-header">
        <div class="lesson-header__badge">
          <span class="lesson-header__kind lesson-header__kind--build">${icons.code} Open Source</span>
          <span class="tag">${projects.length} Repos</span>
        </div>
        <h1 class="lesson-header__title">System Design Projects &amp; Architecture Case Studies</h1>
        <div class="lesson-header__actions" style="margin-top: var(--space-3); display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <a href="/" data-nav="home" class="btn btn--sm btn--secondary">← Back to Curriculum</a>
          <a href="/projects/code-lab/examples/" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--primary">${icons.code} Launch CodeLab Live Playground ${icons.external}</a>
        </div>
      </div>

      <div class="projects-grid">
        ${projects.map(p => renderProjectCard(p)).join('')}
      </div>
    `;

    return html;
  }





  /**
   * Render System Design Glossary
   */
  function renderGlossary() {
    const glossary = window.GLOSSARY || [];
    let html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-nav="home">Home</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <span class="breadcrumbs__current">Glossary</span>
      </nav>

      <div class="lesson-header">
        <div class="lesson-header__badge">
          <span class="lesson-header__kind lesson-header__kind--lesson">Reference</span>
          <span class="tag">${glossary.length} Terms</span>
        </div>
        <h1 class="lesson-header__title">System Design Glossary</h1>
        <p class="hero__subtitle" style="margin-top:0.5rem;">Essential distributed systems, database, networking, and architecture definitions.</p>
        <div style="margin-top:1rem;">
          <input type="text" id="glossary-filter" data-action="filter-glossary" placeholder="Filter terms (e.g. cache, consensus, replication)..." style="width:100%; max-width:400px; padding:0.5rem 0.75rem; background:var(--bg-surface,#222); border:1px solid var(--border-color,#333); border-radius:6px; color:inherit; font-size:13px;">
        </div>
      </div>

      <div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
    `;

    for (const item of glossary) {
      html += `
        <div class="glossary-item" style="padding:1rem; border:1px solid var(--border-color,#333); border-radius:6px; background:var(--bg-card,#191a1c);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <strong style="font-size:15px; color:var(--fg,#fff);">${escapeHtml(item.term)}</strong>
            <span class="badge badge--secondary" style="font-size:11px;">${escapeHtml(item.cat || 'General')}</span>
          </div>
          <p style="margin:0.25rem 0 0; font-size:13px; color:var(--fg-muted,#aaa); line-height:1.5;">${escapeHtml(item.def)}</p>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Render Printable Module Cheat Sheet
   */
  function renderCheatSheet(moduleId) {
    const data = window.CURRICULUM_DATA;
    let targetMod = null;
    if (data) {
      for (const p of data.parts) {
        for (const m of p.modules) {
          if (m.id === moduleId || m.number === moduleId) {
            targetMod = m;
            break;
          }
        }
      }
    }

    if (!targetMod) {
      return '<div style="padding:40px; text-align:center;">Module not found for cheat sheet.</div>';
    }

    const modContent = window.MODULE_CONTENT?.[targetMod.id] || {};

    let html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-nav="home">Home</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <a href="#topic/${targetMod.units[0]?.slug}">Module ${targetMod.number}</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <span class="breadcrumbs__current">Cheat Sheet</span>
      </nav>

      <div class="lesson-header">
        <div class="lesson-header__badge">
          <span class="lesson-header__kind lesson-header__kind--lesson">Module ${targetMod.number}</span>
          <span class="tag">Printable</span>
        </div>
        <h1 class="lesson-header__title">${targetMod.title} — Cheat Sheet</h1>
        <p class="hero__subtitle" style="margin-top:0.5rem;">${targetMod.summary}</p>
        <div class="lesson-header__actions" style="margin-top:1rem;">
          <button class="btn btn--sm btn--primary" data-action="window-print">
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>

      <div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1.5rem;">
    `;

    for (const unit of targetMod.units) {
      const c = modContent[unit.slug];
      const takeaways = c?.keyTakeaways || [];
      html += `
        <div style="padding:1.25rem; border:1px solid var(--border-color,#333); border-radius:8px; background:var(--bg-card,#191a1c);">
          <h3 style="font-size:16px; margin:0 0 0.5rem; display:flex; justify-content:space-between;">
            <span>${unit.title}</span>
            <a href="#topic/${unit.slug}" style="font-size:12px; color:var(--accent,#6366f1); text-decoration:none;">View Lesson →</a>
          </h3>
          ${takeaways.length ? `
            <div style="font-size:12px; font-weight:700; color:var(--fg-muted,#888); margin-bottom:0.25rem;">KEY TAKEAWAYS:</div>
            <ul style="margin:0; padding-left:1.25rem; font-size:13px; color:var(--fg-muted,#ccc); line-height:1.5;">
              ${takeaways.map(t => `<li style="margin-bottom:0.25rem;">${escapeHtml(t)}</li>`).join('')}
            </ul>
          ` : '<p style="font-size:12px; color:var(--fg-muted);">Deep unit content available in lesson.</p>'}
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  return {
    renderOverview,
    renderLesson,
    renderBuild,
    renderProjects,
    renderProjectCard,
    renderVideoEmbed,
    renderGlossary,
    renderCheatSheet,
    convertMarkdownToHTML,
    escapeHtml,
    icons
  };
})();
