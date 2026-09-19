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

  function renderResults(results, query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = '<div class="search-modal__empty">No topics found</div>';
      return;
    }

    const kindIcons = {
      lesson: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      system: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'
    };

    container.innerHTML = results.map((r, i) => {
      const icon = kindIcons[r.kind] || kindIcons.lesson;
      return `<div class="search-result${i === focusedIdx ? ' focused' : ''}" data-slug="${r.slug}" data-idx="${i}">
        <div class="search-result__icon">${icon}</div>
        <div class="search-result__info">
          <div class="search-result__title">${highlightText(r.title, query)}</div>
          <div class="search-result__module">Module ${r.moduleNumber}: ${r.moduleTitle}</div>
        </div>
        <span class="search-result__kind">${r.kind}</span>
      </div>`;
    }).join('');

    // Click handlers
    container.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        const slug = el.dataset.slug;
        close();
        if (window.App && window.App.navigateTo) {
          window.App.navigateTo(slug);
        }
      });
    });
  }

  function open() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    if (!modal || !input) return;
    if (index.length === 0) buildIndex();
    isOpen = true;
    focusedIdx = -1;
    modal.classList.add('open');
    input.value = '';
    input.focus();
    renderResults(search(''), '');
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
    } else if (e.key === 'Enter' && focusedIdx >= 0) {
      e.preventDefault();
      const slug = results[focusedIdx]?.dataset.slug;
      if (slug) {
        close();
        if (window.App && window.App.navigateTo) {
          window.App.navigateTo(slug);
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
        renderResults(search(q), q);
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
