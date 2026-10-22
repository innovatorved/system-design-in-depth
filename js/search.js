/* ═══════════════════════════════════════════════════════════════
   Search Engine — Fast in-memory search across all topics
   ═══════════════════════════════════════════════════════════════ */

window.Search = (() => {
  let index = [];
  let isOpen = false;
  let focusedIdx = -1;

  function buildIndex() {
    if (!window.CURRICULUM_DATA) return;
    index = [];
    for (const part of window.CURRICULUM_DATA.parts) {
      for (const mod of part.modules) {
        for (const unit of mod.units) {
          index.push({
            slug: unit.slug,
            title: unit.title || unit.slug.replace(/-/g, ' '),
            kind: unit.kind,
            moduleTitle: mod.title,
            moduleNumber: mod.number,
            partTitle: part.title,
            tags: unit.archive?.tags || [],
            excerpt: unit.archive?.excerpt || '',
            searchText: [
              unit.title,
              mod.title,
              part.title,
              unit.slug.replace(/-/g, ' '),
              ...(unit.archive?.tags || []),
              unit.archive?.excerpt || ''
            ].join(' ').toLowerCase()
          });
        }
      }
    }
    if (window.IMPLEMENTATIONS_DATA) {
      for (const [id, b] of Object.entries(window.IMPLEMENTATIONS_DATA)) {
        index.push({
          slug: id,
          title: b.title || id.replace(/-/g, ' '),
          kind: 'build-lab',
          moduleTitle: 'Interactive Build Lab (JS & TS)',
          moduleNumber: 'Lab',
          partTitle: '15 Builds',
          tags: ['build', 'lab', 'interactive', 'code', id],
          excerpt: b.summary || '',
          searchText: [
            b.title,
            id.replace(/-/g, ' '),
            'interactive build lab code js ts',
            b.summary || ''
          ].join(' ').toLowerCase()
        });
      }
    }

    // Ecosystem views
    const ecosystemViews = [
      { slug: 'graph', title: 'Interactive Visual System Design Roadmap', kind: 'roadmap', moduleTitle: 'Interactive Dependency DAG & Career Paths', tags: ['roadmap', 'dag', 'graph', 'career', 'paths'] },
      { slug: 'paths', title: 'Career Learning Paths & Tracks', kind: 'roadmap', moduleTitle: '5 Curated Engineering Tracks', tags: ['roadmap', 'career', 'paths', 'tracks', 'faang'] },
      { slug: '', title: 'Production Incident & Troubleshooting Challenges', kind: 'challenge', moduleTitle: '12 Hands-On Outage Simulators', tags: ['challenges', 'incidents', 'outage', 'troubleshooting', 'sre'] },
      { slug: '', title: 'Timed Mock Interviews & Architecture Exams', kind: 'exam', moduleTitle: '4 Full-Length Proctored Simulators', tags: ['exams', 'mock', 'interview', 'rubric', 'timed'] },
      { slug: 'overview', title: 'Learner Dashboard, XP & Streak Hub', kind: 'dashboard', moduleTitle: 'Gamified Progress & Study Hub', tags: ['dashboard', 'xp', 'streak', 'progress'] },
      { slug: 'srs', title: 'Spaced Repetition (SRS) Flashcard Deck', kind: 'dashboard', moduleTitle: '1,200+ SM-2 Active Recall Flashcards', tags: ['srs', 'flashcards', 'spaced', 'repetition', 'review', 'dashboard'] },
      { slug: '', title: 'Architecture Whiteboard & Capacity Estimator Sandbox', kind: 'sandbox', moduleTitle: 'Interactive Topology Canvas & Back-of-Envelope Math', tags: ['sandbox', 'whiteboard', 'capacity', 'estimator', 'qps'] }
    ];
    for (const v of ecosystemViews) {
      index.push({
        slug: v.slug,
        title: v.title,
        kind: v.kind,
        moduleTitle: v.moduleTitle,
        moduleNumber: 'Hub',
        partTitle: 'Ecosystem',
        tags: v.tags,
        excerpt: v.moduleTitle,
        searchText: [v.title, v.moduleTitle, ...v.tags].join(' ').toLowerCase()
      });
    }

    // Career Paths
    if (window.ROADMAP_DATA && Array.isArray(window.ROADMAP_DATA.careerPaths)) {
      for (const p of window.ROADMAP_DATA.careerPaths) {
        index.push({
          slug: 'paths',
          title: `${p.title} (${p.targetRole})`,
          kind: 'roadmap',
          moduleTitle: `Career Path · ${p.estimatedWeeks} Weeks`,
          moduleNumber: 'Path',
          partTitle: 'Roadmap',
          tags: ['roadmap', 'career', 'path', p.id],
          excerpt: p.description || '',
          searchText: [p.title, p.targetRole, p.description, p.id, 'career path roadmap'].join(' ').toLowerCase()
        });
      }
    }

    // Incident Challenges
    if (window.CHALLENGES_DATA && Array.isArray(window.CHALLENGES_DATA.challenges)) {
      for (const c of window.CHALLENGES_DATA.challenges) {
        index.push({
          slug: c.id,
          title: c.title,
          kind: 'challenge',
          moduleTitle: `Incident Challenge (${c.difficulty.toUpperCase()} · +${c.xp} XP)`,
          moduleNumber: 'Incident',
          partTitle: 'Challenges',
          tags: ['challenge', 'incident', c.difficulty, c.category, c.id],
          excerpt: c.summary || '',
          searchText: [c.title, c.summary, c.category, c.difficulty, c.id, 'incident challenge outage'].join(' ').toLowerCase()
        });
      }
    }

    // Mock Exams
    if (window.EXAMS_DATA && Array.isArray(window.EXAMS_DATA.exams)) {
      for (const ex of window.EXAMS_DATA.exams) {
        index.push({
          slug: ex.id,
          title: ex.title,
          kind: 'exam',
          moduleTitle: `Timed Exam (${ex.durationMinutes}m · ${ex.targetLevel})`,
          moduleNumber: 'Exam',
          partTitle: 'Exams',
          tags: ['exam', 'mock', 'interview', ex.difficulty, ex.id],
          excerpt: ex.prompt || '',
          searchText: [ex.title, ex.targetLevel, ex.prompt, ex.id, 'timed mock exam interview'].join(' ').toLowerCase()
        });
      }
    }

    // Whiteboard Blueprints
    if (window.WHITEBOARD_DATA && Array.isArray(window.WHITEBOARD_DATA.blueprints)) {
      for (const bp of window.WHITEBOARD_DATA.blueprints) {
        index.push({
          slug: bp.id,
          title: `Whiteboard Blueprint: ${bp.title}`,
          kind: 'sandbox',
          moduleTitle: 'Architecture Sandbox & Capacity Estimator',
          moduleNumber: 'Blueprint',
          partTitle: 'Sandbox',
          tags: ['sandbox', 'whiteboard', 'blueprint', bp.id],
          excerpt: bp.description || '',
          searchText: [bp.title, bp.description, bp.id, 'whiteboard sandbox blueprint capacity'].join(' ').toLowerCase()
        });
      }
    }
  }

  function search(query) {
    if (!query.trim()) return index.slice(0, 20);
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results = [];
    for (const item of index) {
      let score = 0;
      let matched = true;
      for (const term of terms) {
        if (!item.searchText.includes(term)) {
          matched = false;
          break;
        }
        // Boost title matches
        if (item.title.toLowerCase().includes(term)) score += 10;
        // Boost exact slug match
        if (item.slug.includes(term)) score += 5;
        // Tag match
        if (item.tags.some(t => t.includes(term))) score += 3;
        // General match
        score += 1;
      }
      if (matched) {
        results.push({ ...item, score });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 30);
  }

  function highlightText(text, query) {
    if (!query.trim()) return text;
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    let result = text;
    for (const term of terms) {
      const regex = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    }
    return result;
  }

  function navigateResult(kind, slug) {
    if (kind === 'build-lab' && window.App?.navigateToBuild) {
      window.App.navigateToBuild(slug);
    } else if (kind === 'roadmap' && window.App?.navigateToRoadmap) {
      window.App.navigateToRoadmap(slug || 'graph');
    } else if (kind === 'challenge' && window.App?.navigateToChallenges) {
      window.App.navigateToChallenges(slug || null);
    } else if (kind === 'exam' && window.App?.navigateToExams) {
      window.App.navigateToExams(slug || null);
    } else if (kind === 'dashboard' && window.App?.navigateToDashboard) {
      window.App.navigateToDashboard(slug || 'overview');
    } else if (kind === 'sandbox' && window.App?.navigateToSandbox) {
      window.App.navigateToSandbox(slug || null);
    } else if (window.App?.navigateTo) {
      window.App.navigateTo(slug);
    }
  }

  function renderResults(results, query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = '<div class="search-modal__empty">No topics found</div>';
      return;
    }

    const kindIcons = {
      lesson: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      system: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
      'build-lab': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      roadmap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>',
      challenge: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      exam: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
      sandbox: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    };

    const customMetaKinds = new Set(['build-lab', 'roadmap', 'challenge', 'exam', 'dashboard', 'sandbox']);

    container.innerHTML = results.map((r, i) => {
      const icon = kindIcons[r.kind] || kindIcons.lesson;
      const metaLabel = customMetaKinds.has(r.kind) ? r.moduleTitle : `Module ${r.moduleNumber}: ${r.moduleTitle}`;
      return `<div class="search-result${i === focusedIdx ? ' focused' : ''}" data-slug="${r.slug}" data-kind="${r.kind}" data-idx="${i}">
        <div class="search-result__icon">${icon}</div>
        <div class="search-result__info">
          <div class="search-result__title">${highlightText(r.title, query)}</div>
          <div class="search-result__module">${metaLabel}</div>
        </div>
        <span class="search-result__kind">${r.kind === 'build-lab' ? 'build' : r.kind}</span>
      </div>`;
    }).join('');

    // Click handlers
    container.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        const slug = el.dataset.slug;
        const kind = el.dataset.kind;
        const input = document.getElementById('search-input');
        const query = input ? input.value : '';
        const title = el.querySelector('.search-result__title')?.textContent || slug;
        const pos = parseInt(el.dataset.idx, 10) || 0;

        if (window.Analytics?.trackSearchResultClick) {
          window.Analytics.trackSearchResultClick({
            query: query,
            slug: slug,
            title: title,
            position: pos
          });
        }

        close();
        navigateResult(kind, slug);
      });
    });
  }

  function open() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    if (!modal || !input) return;
    buildIndex();
    isOpen = true;
    focusedIdx = -1;
    modal.classList.add('open');
    input.value = '';
    input.focus();
    renderResults(search(''), '');

    if (window.Analytics?.trackSearchOpen) {
      window.Analytics.trackSearchOpen();
    }
  }

  function close() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    isOpen = false;
    modal.classList.remove('open');
  }

  function handleKeyDown(e) {
    if (!isOpen) return;
    const results = document.querySelectorAll('.search-result');
    const count = results.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIdx = Math.min(focusedIdx + 1, count - 1);
      updateFocus(results);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIdx = Math.max(focusedIdx - 1, -1);
      updateFocus(results);
    } else if (e.key === 'Enter') {
      if (focusedIdx >= 0) {
        e.preventDefault();
        const el = results[focusedIdx];
        const slug = el?.dataset.slug;
        const kind = el?.dataset.kind;
        if (slug !== undefined) {
          const input = document.getElementById('search-input');
          const query = input ? input.value : '';
          const title = el.querySelector('.search-result__title')?.textContent || slug;

          if (window.Analytics?.trackSearchResultClick) {
            window.Analytics.trackSearchResultClick({
              query: query,
              slug: slug,
              title: title,
              position: focusedIdx
            });
          }

          close();
          navigateResult(kind, slug);
        }
      } else {
        const input = document.getElementById('search-input');
        if (input && document.activeElement === input && input.value.trim().length >= 2) {
          if (window.Analytics?.trackSearch) {
            window.Analytics.trackSearch(input.value, count, 'submit');
          }
        }
      }
    }
  }

  function updateFocus(results) {
    results.forEach((r, i) => {
      r.classList.toggle('focused', i === focusedIdx);
      if (i === focusedIdx) r.scrollIntoView({ block: 'nearest' });
    });
  }

  function init() {
    buildIndex();

    // Search trigger
    const trigger = document.getElementById('search-trigger');
    if (trigger) trigger.addEventListener('click', open);

    // Backdrop close
    const backdrop = document.getElementById('search-backdrop');
    if (backdrop) backdrop.addEventListener('click', close);

    // Input handler
    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', () => {
        focusedIdx = -1;
        const q = input.value;
        const res = search(q);
        renderResults(res, q);
        if (window.Analytics?.trackSearchQuery) {
          window.Analytics.trackSearchQuery(q, res.length);
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
      // Forward/back navigation
      if (e.key === '/' && !isOpen && !isInputFocused()) {
        e.preventDefault();
        open();
      }
      handleKeyDown(e);
    });
  }

  function isInputFocused() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  return { init, open, close, search, buildIndex };
})();
