/* ═══════════════════════════════════════════════════════════════
   App Controller — Main application logic, routing, sidebar
   ═══════════════════════════════════════════════════════════════ */

window.MODULE_CONTENT = window.MODULE_CONTENT || {};

window.App = (() => {
  // State
  let currentView = 'home';     // home | topic | build
  let currentSlug = null;
  let activeTab = 'curriculum';  // curriculum | builds
  let sidebarOpen = false;
  const collapsedModules = new Set();

  // ── Initialization ────────────────────────────────────────
  function init() {
    // Parse hash route
    parseRoute();

    // Render sidebar
    renderSidebar();

    // Render content
    renderCurrentView();

    // Setup event listeners
    setupEventListeners();

    // Initialize search
    window.Search.init();

    // Update progress UI
    window.Progress.updateProgressUI();

    // Load module content for current view
    if (currentSlug) loadModuleContent(currentSlug);

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      parseRoute();
      renderCurrentView();
      updateSidebarActive();
      if (currentSlug) loadModuleContent(currentSlug);
    });
  }

  // ── Routing ───────────────────────────────────────────────
  function parseRoute() {
    const hash = window.location.hash.slice(1);
    if (!hash || hash === '/') {
      currentView = 'home';
      currentSlug = null;
    } else if (hash.startsWith('build/')) {
      currentView = 'build';
      currentSlug = hash.slice(6);
      activeTab = 'builds';
      syncSidebarTabs();
    } else if (hash.startsWith('topic/')) {
      currentView = 'topic';
      currentSlug = hash.slice(6);
      activeTab = 'curriculum';
      syncSidebarTabs();
    } else {
      currentView = 'topic';
      currentSlug = hash;
      activeTab = 'curriculum';
      syncSidebarTabs();
    }
  }

  function syncSidebarTabs() {
    document.querySelectorAll('.sidebar__tab').forEach(tab => {
      const match = tab.dataset.tab === activeTab;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    renderSidebar();
  }

  function navigateTo(slug) {
    window.location.hash = 'topic/' + slug;
    window.Progress.setLastVisited(slug);
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function navigateToBuild(buildId) {
    window.location.hash = 'build/' + buildId;
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function navigateToModule(moduleId) {
    // Navigate to first unit in module
    const data = window.CURRICULUM_DATA;
    if (!data) return;
    for (const p of data.parts) {
      for (const m of p.modules) {
        if (m.id === moduleId && m.units.length > 0) {
          navigateTo(m.units[0].slug);
          return;
        }
      }
    }
  }

  function navigateHome() {
    window.location.hash = '/';
    closeSidebar();
    window.scrollTo(0, 0);
  }

  // ── Content Rendering ─────────────────────────────────────
  function renderCurrentView() {
    const reader = document.getElementById('reader');
    if (!reader) return;

    switch (currentView) {
      case 'home':
        reader.innerHTML = window.Renderer.renderOverview();
        break;
      case 'topic':
        reader.innerHTML = window.Renderer.renderLesson(currentSlug);
        initMermaid();
        break;
      case 'build':
        reader.innerHTML = window.Renderer.renderBuild(currentSlug);
        initMermaid();
        break;
    }

    // Add click handlers for internal navigation links
    reader.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = el.dataset.nav;
        if (nav === 'home') navigateHome();
        else if (nav === 'topic') navigateTo(el.dataset.slug);
        else if (nav === 'module') navigateToModule(el.dataset.module);
      });
    });
  }

  // ── Module Content Loading ────────────────────────────────
  function loadModuleContent(slug) {
    const data = window.CURRICULUM_DATA;
    if (!data) return;

    // Find which module this slug belongs to
    let moduleId = null;
    for (const p of data.parts) {
      for (const m of p.modules) {
        for (const u of m.units) {
          if (u.slug === slug) {
            moduleId = m.id;
            break;
          }
        }
        if (moduleId) break;
      }
      if (moduleId) break;
    }

    if (!moduleId) return;
    if (window.MODULE_CONTENT[moduleId]) return; // Already loaded

    // Try to load the module content file
    const moduleNum = moduleId.replace(/[^0-9]/g, '').padStart(2, '0') || moduleId;
    const possibleFiles = [
      'data/content/m' + moduleNum + '.js',
      'data/content/' + moduleId + '.js'
    ];

    // Find the right file by module mapping
    const moduleFileMap = buildModuleFileMap();
    const filename = moduleFileMap[moduleId];
    if (filename) {
      const script = document.createElement('script');
      script.src = filename;
      script.onload = () => {
        // Re-render if we're still on this topic
        if (currentSlug === slug) renderCurrentView();
      };
      script.onerror = () => {}; // Content file doesn't exist yet, that's ok
      document.head.appendChild(script);
    }
  }

  function buildModuleFileMap() {
    const map = {};
    const data = window.CURRICULUM_DATA;
    if (!data) return map;

    const moduleFiles = {
      'learning-foundations': 'data/content/m01-foundations.js',
      'learning-apis-services': 'data/content/m02-apis-protocols.js',
      'learning-data-sql': 'data/content/m03-data-modeling-sql.js',
      'learning-nosql-partitioning': 'data/content/m04-nosql-partitioning.js',
      'learning-caching-fast-reads': 'data/content/m05-caching.js',
      'learning-distributed-coordination': 'data/content/m06-distributed-coord.js',
      'learning-storage-engines': 'data/content/m07-storage-engines.js',
      'learning-async-streams': 'data/content/m08-async-streams.js',
      'learning-search-retrieval': 'data/content/m09-search-retrieval.js',
      'learning-analytics-sketches': 'data/content/m10-analytics-sketches.js',
      'learning-realtime-social': 'data/content/m11-realtime-social.js',
      'learning-geo-matching': 'data/content/m12-geo-matching.js',
      'learning-media-files': 'data/content/m13-media-cdn.js',
      'learning-reliability-ops': 'data/content/m14-reliability-ops.js',
      'design-services': 'data/content/m15-service-designs.js',
      'design-products': 'data/content/m16-product-designs.js',
      'design-operations': 'data/content/m17-media-ops-designs.js',
      'company-cases': 'data/content/m18-case-studies.js'
    };

    for (const p of data.parts) {
      for (const m of p.modules) {
        map[m.id] = moduleFiles[m.id] || null;
      }
    }
    return map;
  }

  // ── Sidebar ───────────────────────────────────────────────
  function renderSidebar() {
    const container = document.getElementById('sidebar-content');
    if (!container) return;

    if (activeTab === 'curriculum') {
      renderCurriculumSidebar(container);
    } else if (activeTab === 'builds') {
      renderBuildsSidebar(container);
    }

    updateSidebarActive();
  }

  function renderCurriculumSidebar(container) {
    const data = window.CURRICULUM_DATA;
    if (!data) { container.innerHTML = '<p style="padding:16px;color:var(--fg-muted)">Loading...</p>'; return; }

    let html = '';
    for (const part of data.parts) {
      html += `<div style="padding:${part.number > 1 ? '8px' : '4px'} 16px 4px;font-size:11px;font-weight:600;color:var(--fg-faint);text-transform:uppercase;letter-spacing:0.05em;">Part ${part.number}: ${part.title}</div>`;

      for (const mod of part.modules) {
        const isCollapsed = collapsedModules.has(mod.id);
        const prog = window.Progress.getModuleProgress(mod.id);
        const progPct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;

        html += `<div class="module-group${isCollapsed ? ' collapsed' : ''}" data-module="${mod.id}">
          <div class="module-group__header" onclick="App.toggleModule('${mod.id}')">
            <span class="module-group__chevron">${window.Renderer.icons.chevronDown}</span>
            <span class="module-group__number">${mod.number}</span>
            <span class="module-group__title">${mod.title}</span>
            <div class="module-group__progress"><div class="module-group__progress-fill" style="width:${progPct}%"></div></div>
          </div>
          <div class="module-group__units"${!isCollapsed ? '' : ''}>`;

        for (const unit of mod.units) {
          const completed = window.Progress.isCompleted(unit.slug);
          const active = currentSlug === unit.slug;
          const statusClass = completed ? 'completed' : active ? 'active' : 'pending';
          const statusIcon = completed ? window.Renderer.icons.check : active ? window.Renderer.icons.circle : window.Renderer.icons.dot;

          html += `<div class="unit-item${active ? ' active' : ''}" data-slug="${unit.slug}" onclick="App.navigateTo('${unit.slug}')">
            <span class="unit-item__status unit-item__status--${statusClass}">${statusIcon}</span>
            <span class="unit-item__title">${unit.title}</span>
          </div>`;
        }

        html += '</div></div>';
      }
    }

    container.innerHTML = html;
  }

  function renderBuildsSidebar(container) {
    const impls = window.IMPLEMENTATIONS_DATA;
    if (!impls) { container.innerHTML = '<p style="padding:16px;color:var(--fg-muted)">Loading...</p>'; return; }

    let html = '<div style="padding:8px 16px 4px;font-size:11px;font-weight:600;color:var(--fg-faint);text-transform:uppercase;letter-spacing:0.05em;">From-Scratch Builds</div>';

    for (const [id, build] of Object.entries(impls)) {
      const active = currentView === 'build' && currentSlug === id;
      html += `<div class="unit-item${active ? ' active' : ''}" data-build="${id}" onclick="App.navigateToBuild('${id}')">
        <span class="unit-item__status unit-item__status--${active ? 'active' : 'pending'}">${window.Renderer.icons.code}</span>
        <span class="unit-item__title">${build.title || id.replace(/-/g, ' ')}</span>
      </div>`;
    }

    container.innerHTML = html;
  }

  function updateSidebarActive() {
    document.querySelectorAll('.unit-item').forEach(el => {
      const slug = el.dataset.slug || el.dataset.build;
      const isActive = slug === currentSlug;
      el.classList.toggle('active', isActive);
      if (isActive) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function toggleModule(moduleId) {
    if (collapsedModules.has(moduleId)) {
      collapsedModules.delete(moduleId);
    } else {
      collapsedModules.add(moduleId);
    }
    const group = document.querySelector(`.module-group[data-module="${moduleId}"]`);
    if (group) group.classList.toggle('collapsed');
  }

  // ── Mobile Sidebar ────────────────────────────────────────
  function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.add('open');
      sidebarOpen = true;
    }
  }

  function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
      sidebarOpen = false;
    }
  }

  // ── Theme ─────────────────────────────────────────────────
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);

    // Update icons
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = next === 'dark' ? '' : 'none';
      moonIcon.style.display = next === 'dark' ? 'none' : '';
    }

    // Update theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#111315' : '#fbfbfb');

    // Re-init mermaid with correct theme
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: next === 'dark' ? 'dark' : 'default',
        themeVariables: {
          darkMode: next === 'dark',
          background: next === 'dark' ? '#141517' : '#ffffff',
          primaryColor: next === 'dark' ? '#191a1c' : '#f8f9fa',
          primaryTextColor: next === 'dark' ? '#f2f4f7' : '#1f2937',
          primaryBorderColor: next === 'dark' ? '#36373b' : '#e5e7eb',
          lineColor: next === 'dark' ? '#747d89' : '#9ca3af',
          secondaryColor: next === 'dark' ? '#151617' : '#f3f4f6',
          tertiaryColor: next === 'dark' ? '#202123' : '#e5e7eb',
          fontFamily: '"Inter", -apple-system, sans-serif',
          fontSize: '13px'
        }
      });
      // Restore original source and remove data-processed so Mermaid re-renders cleanly
      document.querySelectorAll('.mermaid[data-original-src]').forEach(el => {
        el.textContent = el.getAttribute('data-original-src');
        el.removeAttribute('data-processed');
      });
      initMermaid();
    }

    try { localStorage.setItem('sd-theme', next); } catch {}
  }

  // ── Mermaid ───────────────────────────────────────────────
  function initMermaid() {
    const diagrams = document.querySelectorAll('.mermaid:not([data-processed])');
    if (diagrams.length === 0) return;

    window.loadMermaid().then(() => {
      // Store original source on each element before rendering
      diagrams.forEach(el => {
        if (!el.getAttribute('data-original-src')) {
          el.setAttribute('data-original-src', el.textContent.trim());
        }
      });
      // Call mermaid.run directly on the nodes (mermaid manages data-processed internally)
      window.mermaid.run({ nodes: Array.from(diagrams) }).catch(err => {
        console.warn('Mermaid render warning:', err);
      });
    }).catch(err => {
      console.warn('Failed to load Mermaid:', err);
    });
  }

  // ── Progress ──────────────────────────────────────────────
  function toggleComplete(slug) {
    const completed = window.Progress.toggleComplete(slug);
    renderCurrentView();
    renderSidebar();
  }

  // ── Event Listeners ───────────────────────────────────────
  function setupEventListeners() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Update theme icon on load
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? '' : 'none';
      moonIcon.style.display = isDark ? 'none' : '';
    }

    // Sidebar tabs
    document.querySelectorAll('.sidebar__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sidebar__tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeTab = tab.dataset.tab;
        renderSidebar();
      });
    });

    // Hamburger menu
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        sidebarOpen ? closeSidebar() : openSidebar();
      });
    }

    // Sidebar overlay
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Left/Right arrow for prev/next (when not in input)
      if (currentView === 'topic' && !isInputFocused()) {
        if (e.key === 'ArrowLeft') { navigatePrev(); e.preventDefault(); }
        if (e.key === 'ArrowRight') { navigateNext(); e.preventDefault(); }
      }
      // Space to mark complete
      if (e.key === ' ' && currentView === 'topic' && !isInputFocused()) {
        e.preventDefault();
        if (currentSlug) toggleComplete(currentSlug);
      }
    });
  }

  function isInputFocused() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  function navigatePrev() {
    const allUnits = getAllUnitSlugs();
    const idx = allUnits.indexOf(currentSlug);
    if (idx > 0) navigateTo(allUnits[idx - 1]);
  }

  function navigateNext() {
    const allUnits = getAllUnitSlugs();
    const idx = allUnits.indexOf(currentSlug);
    if (idx >= 0 && idx < allUnits.length - 1) navigateTo(allUnits[idx + 1]);
  }

  function getAllUnitSlugs() {
    const data = window.CURRICULUM_DATA;
    if (!data) return [];
    const slugs = [];
    for (const p of data.parts) {
      for (const m of p.modules) {
        for (const u of m.units) {
          slugs.push(u.slug);
        }
      }
    }
    return slugs;
  }

  // ── Boot ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return {
    navigateTo,
    navigateToBuild,
    navigateToModule,
    navigateHome,
    toggleModule,
    toggleComplete,
    toggleTheme,
    renderCurrentView,
    renderSidebar
  };
})();
