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
  let activeSimulator = null;
  let activeCodeLab = null;
  let currentBuildParams = new URLSearchParams();
  let landingCleanup = null;  // live demo on the landing page
  const collapsedModules = new Set();

  // Helper: find module ID for a given slug
  function getModuleIdForSlug(slug) {
    const data = window.CURRICULUM_DATA;
    if (!data) return null;
    for (const p of data.parts) {
      for (const m of p.modules) {
        for (const u of m.units) {
          if (u.slug === slug) return m.id;
        }
      }
    }
    return null;
  }

  // ── Initialization ────────────────────────────────────────
  function init() {
    // Initialize Analytics
    if (window.Analytics?.init) {
      window.Analytics.init();
    }

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
      if (currentSlug && currentView === 'topic') loadModuleContent(currentSlug);
      renderCurrentView();
      updateSidebarActive();
    });

    // Listen for history popstate (forward/back)
    window.addEventListener('popstate', () => {
      parseRoute();
      if (currentSlug && currentView === 'topic') loadModuleContent(currentSlug);
      renderCurrentView();
      updateSidebarActive();
    });
  }

  // ── Routing ───────────────────────────────────────────────
  function parseRoute() {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    const hash = window.location.hash.slice(1);

    // Clean up legacy #projects hash to /projects
    if (hash === 'projects' || hash.startsWith('projects/') || hash.startsWith('project/')) {
      const slug = hash.startsWith('project/') ? hash.slice(8) : null;
      history.replaceState(null, '', '/projects' + (slug ? ('#project-' + slug) : ''));
      currentView = 'projects';
      currentSlug = slug;
      activeTab = 'curriculum';
      syncSidebarTabs();
      return;
    }

    if (path === 'projects' || path.startsWith('projects/')) {
      currentView = 'projects';
      currentSlug = hash.startsWith('project-') ? hash.slice(8) : (hash.startsWith('project/') ? hash.slice(8) : null);
      activeTab = 'curriculum';
      syncSidebarTabs();
      return;
    }

    // Upgrade legacy #build/<slug> hash to clean /build/<slug>/ path
    if (hash.startsWith('build/')) {
      const [rawBuildSlug, queryStr] = hash.slice(6).split('?');
      currentSlug = rawBuildSlug.replace(/\/+$/, '');
      currentBuildParams = new URLSearchParams(queryStr || window.location.search);
      history.replaceState(null, '', '/build/' + currentSlug + '/' + (queryStr ? '?' + queryStr : window.location.search));
      currentView = 'build';
      activeTab = 'builds';
      syncSidebarTabs();
      return;
    }

    // Clean URL build route: build/<slug> or /build/<slug>/
    if (path.startsWith('build/')) {
      currentView = 'build';
      currentSlug = path.slice(6).replace(/\/+$/, '');
      currentBuildParams = new URLSearchParams(window.location.search);
      activeTab = 'builds';
      syncSidebarTabs();
      return;
    }

    if (hash === '/review' || hash === 'review' || hash === '/paths' || hash === 'paths' || hash === '/cards' || hash === 'cards') {
      window.location.hash = '';
      return;
    }
    if (hash === '/glossary' || hash === 'glossary') {
      currentView = 'glossary';
      currentSlug = null;
      activeTab = 'curriculum';
      syncSidebarTabs();
      return;
    }
    if (hash.startsWith('cheatsheet/')) {
      currentView = 'cheatsheet';
      currentSlug = hash.slice(11);
      activeTab = 'curriculum';
      syncSidebarTabs();
      return;
    }
    if (hash.startsWith('topic/')) {
      currentView = 'topic';
      currentSlug = hash.slice(6).replace(/\/+$/, '');
      if (currentSlug === 'write-ahead-log') currentSlug = 'database-wal-and-recovery';
      activeTab = 'curriculum';
      syncSidebarTabs();
      return;
    }

    // Clean URL topic route: topic/<slug> or /topic/<slug>
    if (path.startsWith('topic/')) {
      currentView = 'topic';
      currentSlug = path.slice(6).replace(/\/+$/, '');
      if (currentSlug === 'write-ahead-log') currentSlug = 'database-wal-and-recovery';
      activeTab = 'curriculum';
      syncSidebarTabs();
      return;
    }

    if (!hash || hash === '/') {
      currentView = 'home';
      currentSlug = null;
      activeTab = 'curriculum';
      syncSidebarTabs();
      return;
    }

    currentView = 'topic';
    currentSlug = hash;
    if (currentSlug === 'write-ahead-log') currentSlug = 'database-wal-and-recovery';
    activeTab = 'curriculum';
    syncSidebarTabs();
  }

  function syncSidebarTabs() {
    document.querySelectorAll('.sidebar__tab').forEach(tab => {
      const match = tab.dataset.tab === activeTab;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    renderSidebar();
  }

  function navigateTo(slug, event) {
    if (event && event.preventDefault) event.preventDefault();
    if (!slug) return;
    loadModuleContent(slug);
    history.pushState(null, '', '/topic/' + slug + '/');
    parseRoute();
    renderCurrentView();
    window.Progress.setLastVisited(slug);
    updateSidebarActive();
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function navigateToBuild(buildId, event) {
    if (event && event.preventDefault) event.preventDefault();
    if (!buildId) return;
    history.pushState(null, '', '/build/' + buildId + '/');
    parseRoute();
    renderCurrentView();
    updateSidebarActive();
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function navigateToProject(projectId, event) {
    if (event && event.preventDefault) event.preventDefault();
    const targetUrl = '/projects' + (projectId ? ('#project-' + projectId) : '');
    if (window.location.pathname !== '/projects' || window.location.hash !== (projectId ? ('#project-' + projectId) : '')) {
      history.pushState(null, '', targetUrl);
    }
    currentView = 'projects';
    currentSlug = projectId || null;
    closeSidebar();
    renderCurrentView();
    if (projectId) {
      setTimeout(() => {
        const el = document.getElementById('project-' + projectId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    } else {
      window.scrollTo(0, 0);
    }
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
    if (window.location.pathname !== '/' || window.location.hash) {
      history.pushState(null, '', '/');
    }
    currentView = 'home';
    currentSlug = null;
    activeTab = 'curriculum';
    syncSidebarTabs();
    closeSidebar();
    renderCurrentView();
    window.scrollTo(0, 0);
  }

  // ── Content Rendering ─────────────────────────────────────
  function renderCurrentView() {
    const reader = document.getElementById('reader');
    if (!reader) return;

    // Pause any active audio from previous view
    document.querySelectorAll('audio').forEach(a => a.pause());

    if (activeSimulator) {
      activeSimulator.unmount(reader);
      activeSimulator = null;
    }
    if (activeCodeLab) {
      if (window.CodeLab?.unmount) window.CodeLab.unmount(activeCodeLab);
      else if (activeCodeLab.destroy) activeCodeLab.destroy();
      activeCodeLab = null;
    }
    if (landingCleanup) {
      landingCleanup();
      landingCleanup = null;
    }
    // Landing page is full-width (sidebar hidden until opened)
    document.body.classList.toggle('view-landing', currentView === 'home' && !!window.Landing);
    document.body.classList.toggle('view-build', currentView === 'build');

    switch (currentView) {
      case 'home':
        if (window.Landing) {
          // Keep the prerendered landing (already personalised inline in index.html) so nothing re-renders
          const shell = reader.querySelector('.landing-shell');
          if (shell) shell.classList.remove('landing-shell');
          else reader.innerHTML = window.Landing.render();
          landingCleanup = window.Landing.mount(reader);
        } else {
          reader.innerHTML = window.Renderer.renderOverview();
        }
        if (window.Analytics) {
          window.Analytics.trackPageView('System Design In Depth - Home', '/', window.location.href);
        }
        break;

      case 'glossary':
        reader.innerHTML = window.Renderer.renderGlossary();
        if (window.Analytics) {
          window.Analytics.trackPageView('System Design Glossary | System Design In Depth', '/glossary/', window.location.href);
        }
        break;
      case 'cheatsheet':
        loadModuleContent(currentSlug);
        reader.innerHTML = window.Renderer.renderCheatSheet(currentSlug);
        if (window.Analytics) {
          window.Analytics.trackPageView('Cheat Sheet', '/#cheatsheet/' + currentSlug, window.location.href);
        }
        break;
      case 'topic':
        if (currentSlug) {
          loadModuleContent(currentSlug);
        }

        const isPrerendered = reader.getAttribute('data-prerendered') === currentSlug;
        if (isPrerendered) {
          const toggleBtn = reader.querySelector('.completion-toggle');
          if (toggleBtn && window.Progress) {
            const isCompleted = window.Progress.isCompleted(currentSlug);
            toggleBtn.classList.toggle('completed', isCompleted);
            toggleBtn.innerHTML = isCompleted
              ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Completed'
              : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg> Mark Complete';
          }
        } else {
          reader.removeAttribute('data-prerendered');
          reader.innerHTML = window.Renderer.renderLesson(currentSlug);
        }
        
        const handleSimulator = () => {
          if (window.Simulators && window.Simulators.getSimulatorForUnit) {
            const simData = window.Simulators.getSimulatorForUnit(currentSlug);
            if (simData && simData.sim) {
              try {
                const placeholder = reader.querySelector(`.sim-card-placeholder[data-sim-slug="${currentSlug}"]`);
                if (placeholder) {
                  const wrapper = document.createElement('div');
                  wrapper.innerHTML = simData.html;
                  placeholder.replaceWith(wrapper.firstElementChild || wrapper);
                } else {
                  const existingSim = reader.querySelector('.sim-card');
                  if (!existingSim && simData.html) {
                    const hook = reader.querySelector('.lesson__body') || reader.querySelector('.prose') || reader;
                    if (hook) {
                      const wrapper = document.createElement('div');
                      wrapper.innerHTML = simData.html;
                      hook.appendChild(wrapper.firstElementChild || wrapper);
                    }
                  }
                }
                simData.sim.mount(reader);
                activeSimulator = simData.sim;
              } catch (err) {
                console.error('[Simulator mount error]', err);
              }
            }
          }
        };

        const simFile = window.SIMULATOR_SCRIPT_MAP?.[currentSlug];
        if (simFile && window.loadScript) {
          window.loadScript(simFile).then(handleSimulator).catch(err => {
            console.error('[Failed to load simulator script]', simFile, err);
          });
        } else {
          handleSimulator();
        }
        
        initMermaid();
        if (window.setupAudioListeners) {
          window.setupAudioListeners(currentSlug);
        }
        if (window.Analytics) {
          const data = window.CURRICULUM_DATA;
          let foundUnit = null, foundMod = null, foundPart = null;
          if (data) {
            for (const p of data.parts) {
              for (const m of p.modules) {
                for (const u of m.units) {
                  if (u.slug === currentSlug) {
                    foundUnit = u; foundMod = m; foundPart = p;
                    break;
                  }
                }
                if (foundUnit) break;
              }
              if (foundUnit) break;
            }
          }
          const title = foundUnit?.title || currentSlug;
          window.Analytics.trackPageView(title + ' | System Design In Depth', '/topic/' + currentSlug + '/', window.location.href);
          window.Analytics.trackTopicView({
            slug: currentSlug,
            title: title,
            moduleTitle: foundMod?.title || '',
            moduleNumber: foundMod?.number || '',
            partNumber: foundPart?.number || '',
            kind: foundUnit?.kind || 'lesson',
            wordCount: foundUnit?.archive?.wordCount || 0,
            readingTimeMin: foundUnit?.archive?.wordCount ? Math.ceil(foundUnit.archive.wordCount / 200) : 0
          });
        }
        break;
      case 'projects':
        reader.innerHTML = window.Renderer.renderProjects(currentSlug);
        if (currentSlug) {
          setTimeout(() => {
            const el = document.getElementById('project-' + currentSlug);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 80);
        }
        if (window.Analytics) {
          window.Analytics.trackPageView('Top Projects | @innovatorved', '/projects/', window.location.href);
        }
        break;
      case 'build':
        reader.removeAttribute('data-prerendered');
        const isPrerenderedBuild = reader.getAttribute('data-prerendered-build') === currentSlug;
        const renderBuildView = () => {
          document.body.classList.remove('codelab-fullscreen-lock');
          if (reader.getAttribute('data-prerendered-build') === currentSlug) {
            reader.removeAttribute('data-prerendered-build');
          } else {
            reader.removeAttribute('data-prerendered-build');
            reader.innerHTML = window.Renderer.renderBuild(currentSlug);
          }
          initMermaid();

          const impls = window.IMPLEMENTATIONS_DATA;
          const build = impls?.[currentSlug];
          const overlayEl = document.getElementById('build-lab-overlay');
          const mountEl = document.getElementById('codelab-mount-' + currentSlug);
          const requestedMode = currentBuildParams.get('mode');
          const requestedLang = currentBuildParams.get('lang');
          const requestedLab = currentBuildParams.get('lab');
          const requestedStep = currentBuildParams.get('step');

          const syncOverviewProgress = () => {
            const sb = document.getElementById('sidebar-content');
            if (activeTab === 'builds' && sb) renderBuildsSidebar(sb);
            let completedIds = [];
            try {
              const raw = localStorage.getItem('sd-codelab-v1:' + currentSlug) || localStorage.getItem('sd_codelab_' + currentSlug);
              const saved = JSON.parse(raw || 'null');
              if (Array.isArray(saved?.completedSteps)) {
                completedIds = saved.completedSteps;
              } else {
                const legacy = JSON.parse(localStorage.getItem('codelab_progress_' + currentSlug) || '[]');
                if (Array.isArray(legacy)) completedIds = legacy;
              }
            } catch (_) {}
            const steps = window.GUIDED_LABS_DATA?.[currentSlug]?.steps || [];
            const badge = document.getElementById('build-lab-progress-badge');
            if (badge && steps.length) {
              badge.textContent = `${completedIds.length}/${steps.length} Steps Completed`;
            }
            const tabBadge = reader.querySelector('.build-view-tab__badge');
            if (tabBadge && steps.length) {
              tabBadge.textContent = `${completedIds.length}/${steps.length} Steps`;
            }
            const trackFill = reader.querySelector('.build-lab-progress-track__fill');
            if (trackFill && steps.length) {
              const pct = Math.round((completedIds.length / steps.length) * 100);
              trackFill.style.width = `${pct}%`;
            }
            const cards = reader.querySelectorAll('.build-lab-step-card[data-step-index]');
            cards.forEach(card => {
              const idx = parseInt(card.getAttribute('data-step-index'), 10);
              const step = steps[idx];
              if (!step) return;
              const isDone = completedIds.includes(step.id);
              card.classList.toggle('is-done', isDone);
              const numEl = card.querySelector('.build-lab-step-card__num');
              if (numEl) {
                numEl.innerHTML = isDone
                  ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'
                  : `0${idx + 1}`;
              }
            });
          };

          syncOverviewProgress();

          const closeBuildLab = () => {
            if (!overlayEl) return;
            overlayEl.classList.remove('is-open');
            overlayEl.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('codelab-fullscreen-lock');
            syncOverviewProgress();
          };

          const openBuildLab = (opts = {}) => {
            if (!overlayEl || !mountEl || !window.CodeLab) return;
            overlayEl.classList.add('is-open');
            overlayEl.setAttribute('aria-hidden', 'false');
            document.body.classList.add('codelab-fullscreen-lock');

            if (!activeCodeLab) {
              const mountOpts = {
                labId: currentSlug,
                title: build?.title || currentSlug,
                summary: build?.summary || '',
                backLabel: 'Back to Build Guide',
                onClose: closeBuildLab,
                onStepComplete: syncOverviewProgress,
                onLabComplete: syncOverviewProgress
              };
              if (opts.mode === 'guided' || opts.mode === 'sandbox') {
                mountOpts.mode = opts.mode;
              }
              if (opts.lang === 'js' || opts.lang === 'ts') {
                mountOpts.language = opts.lang;
              }
              activeCodeLab = window.CodeLab.mount(mountEl, mountOpts);
              if (typeof opts.stepIndex === 'number' && !Number.isNaN(opts.stepIndex) && activeCodeLab?.selectStep) {
                setTimeout(() => activeCodeLab.selectStep(opts.stepIndex, true), 80);
              }
            } else if (typeof activeCodeLab.configure === 'function') {
              activeCodeLab.configure(opts);
            } else if (activeCodeLab.editor) {
              setTimeout(() => activeCodeLab.editor.layout(), 60);
            }
            setTimeout(() => {
              const ed = activeCodeLab?._editor || activeCodeLab?.editor;
              if (ed && typeof ed.layout === 'function') ed.layout();
            }, 250);
          };

          reader.querySelectorAll('[data-action="open-code-lab"]').forEach(btn => {
            btn.addEventListener('click', () => {
              const mode = btn.getAttribute('data-lab-mode') || 'guided';
              const stepAttr = btn.getAttribute('data-step-index');
              const stepIndex = stepAttr !== null ? parseInt(stepAttr, 10) : undefined;
              openBuildLab({ mode, lang: requestedLang || undefined, stepIndex });
            });
          });

          if (requestedLab === 'open' || requestedMode === 'guided' || requestedMode === 'sandbox') {
            const stepIdx = requestedStep !== null ? parseInt(requestedStep, 10) : undefined;
            openBuildLab({
              mode: requestedMode || 'guided',
              lang: requestedLang || undefined,
              stepIndex: Number.isNaN(stepIdx) ? undefined : stepIdx
            });
          }

          if (window.Analytics) {
            const title = build?.title || currentSlug;
            window.Analytics.trackPageView(title + ' — Interactive Build Lab | System Design In Depth', '/build/' + currentSlug + '/', window.location.href);
            window.Analytics.trackBuildView({ buildId: currentSlug, title });
          }
        };

        const neededBuildScripts = [];
        if (!window.IMPLEMENTATIONS_DATA || !window.IMPLEMENTATIONS_DATA[currentSlug]) {
          neededBuildScripts.push('data/implementations_code.js');
        }
        if (!window.GUIDED_LABS_DATA) {
          neededBuildScripts.push('data/guided_labs.js');
        }
        if (!window.CodeLab) {
          neededBuildScripts.push('js/code-lab.js');
        }

        if (neededBuildScripts.length > 0 && window.loadScript) {
          if (!isPrerenderedBuild) {
            reader.innerHTML = '<div class="prose"><p style="padding:2rem 0;color:var(--fg-muted);">Loading Interactive IDE Lab &amp; Reference Build...</p></div>';
          }
          Promise.all(neededBuildScripts.map(s => window.loadScript(s))).then(renderBuildView).catch(err => {
            console.error('[Failed to load build lab scripts]', err);
            renderBuildView();
          });
        } else {
          renderBuildView();
        }
        break;
    }

    // Add click handlers for internal navigation links
    reader.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        const nav = el.dataset.nav;
        if (nav === 'home') navigateHome();
        else if (nav === 'projects') navigateToProject(el.dataset.project);
        else if (nav === 'topic') navigateTo(el.dataset.slug);
        else if (nav === 'module') navigateToModule(el.dataset.module);
      });
    });
  }

  // ── Module Content Loading ────────────────────────────────
  // Lesson content and question banks load per module on demand (see js/lazy.js).
  const loadedModules = new Set();

  function findModule(key) {
    for (const p of window.CURRICULUM_DATA?.parts || []) {
      for (const m of p.modules) {
        if (m.id === key || m.number === key || m.legacyNumber === key || m.units.some(u => u.slug === key)) return m;
      }
    }
    return null;
  }

  function loadModuleContent(key) {
    const mod = findModule(key);
    if (!mod || loadedModules.has(mod.id) || !window.Lazy) return;
    loadedModules.add(mod.id);
    const num = mod.legacyNumber || mod.number;
    window.Lazy.module(num).then(() => {
      // Re-render if the learner is still on a view that needs this module
      const needed = (currentView === 'topic' && getModuleIdForSlug(currentSlug) === mod.id) ||
        (currentView === 'cheatsheet' && findModule(currentSlug)?.id === mod.id);
      if (needed) renderCurrentView();
    }).catch(err => {
      loadedModules.delete(mod.id);
      console.warn('Failed to load content for module:', mod.id, err);
    });
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
      html += `<div style="padding:${part.number > 1 ? '8px' : '4px'} 16px 4px;font-size:11px;font-weight:600;color:var(--fg-faint);text-transform:uppercase;letter-spacing:0.05em;">${part.title}</div>`;

      for (const mod of part.modules) {
        const isCollapsed = collapsedModules.has(mod.id);
        const prog = window.Progress.getModuleProgress(mod.id);
        const progPct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;

        html += `<div class="module-group${isCollapsed ? ' collapsed' : ''}" data-module="${mod.id}">
          <div class="module-group__header">
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

          html += `<a class="unit-item${active ? ' active' : ''}" data-slug="${unit.slug}" href="/topic/${unit.slug}/">
            <span class="unit-item__status unit-item__status--${statusClass}">${statusIcon}</span>
            <span class="unit-item__title">${unit.title}</span>
          </a>`;
        }

        html += '</div></div>';
      }
    }

    container.innerHTML = html;
  }

  function renderBuildsSidebar(container) {
    const impls = window.IMPLEMENTATIONS_DATA;
    if (!impls) {
      container.innerHTML = '<p style="padding:16px;color:var(--fg-muted)">Loading builds...</p>';
      if (window.loadScript) {
        window.loadScript('data/implementations_code.js').then(() => {
          renderBuildsSidebar(container);
        });
      }
      return;
    }

    let html = '<div style="padding:8px 16px 4px;font-size:11px;font-weight:600;color:var(--fg-faint);text-transform:uppercase;letter-spacing:0.05em;">Interactive Build Labs (15)</div>';

    for (const [id, build] of Object.entries(impls)) {
      const active = currentView === 'build' && currentSlug === id;
      let doneSteps = 0;
      try {
        const raw = localStorage.getItem('sd-codelab-v1:' + id) || localStorage.getItem('sd_codelab_' + id);
        const savedNew = JSON.parse(raw || 'null');
        if (Array.isArray(savedNew?.completedSteps)) {
          doneSteps = savedNew.completedSteps.length;
        } else {
          const savedLegacy = JSON.parse(localStorage.getItem('codelab_progress_' + id) || '[]');
          if (Array.isArray(savedLegacy)) doneSteps = savedLegacy.length;
        }
      } catch (_) {}
      const isComplete = doneSteps >= 4;
      const statusClass = isComplete ? 'completed' : active ? 'active' : 'pending';
      const statusIcon = isComplete ? window.Renderer.icons.check : window.Renderer.icons.code;

      html += `<a class="unit-item${active ? ' active' : ''}" data-build="${id}" href="/build/${id}/">
        <span class="unit-item__status unit-item__status--${statusClass}">${statusIcon}</span>
        <span class="unit-item__title">${build.title || id.replace(/-/g, ' ')}</span>
        ${doneSteps > 0 ? `<span style="margin-left:auto;font-size:10px;font-family:var(--font-mono);color:${isComplete ? '#22c55e' : 'var(--fg-faint)'};">${doneSteps}/4</span>` : ''}
      </a>`;
    }

    container.innerHTML = html;
  }

  function updateSidebarActive() {
    document.querySelectorAll('.unit-item').forEach(el => {
      const slug = el.dataset.slug || el.dataset.build || el.dataset.project;
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
    if (window.Analytics) {
      window.Analytics.trackModuleToggle(moduleId, !collapsedModules.has(moduleId));
    }
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
      sunIcon.style.display = next === 'light' ? '' : 'none';
      moonIcon.style.display = next === 'dark' ? '' : 'none';
    }

    // Update theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#000000' : '#ffffff');

    // Re-init mermaid with correct theme
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base', // base honours themeVariables; 'default'/'dark' override them
        themeVariables: {
          darkMode: next === 'dark',
          background: next === 'dark' ? '#0a0a0a' : '#ffffff',
          primaryColor: next === 'dark' ? '#171717' : '#fafafa',
          primaryTextColor: next === 'dark' ? '#ffffff' : '#0a0a0a',
          primaryBorderColor: next === 'dark' ? '#404040' : '#d4d4d4',
          lineColor: next === 'dark' ? '#737373' : '#a1a1a1',
          secondaryColor: next === 'dark' ? '#0a0a0a' : '#f5f5f5',
          tertiaryColor: next === 'dark' ? '#262626' : '#e5e5e5',
          mainBkg: (next === 'dark') ? '#171717' : '#fafafa',
          nodeBorder: (next === 'dark') ? '#404040' : '#d4d4d4',
          clusterBkg: (next === 'dark') ? '#0a0a0a' : '#ffffff',
          clusterBorder: (next === 'dark') ? '#262626' : '#e5e5e5',
          textColor: (next === 'dark') ? '#e5e5e5' : '#262626',
          edgeLabelBackground: (next === 'dark') ? '#0a0a0a' : '#ffffff',
          actorBkg: (next === 'dark') ? '#171717' : '#fafafa',
          actorBorder: (next === 'dark') ? '#404040' : '#d4d4d4',
          actorTextColor: (next === 'dark') ? '#ffffff' : '#0a0a0a',
          signalColor: (next === 'dark') ? '#a1a1a1' : '#525252',
          signalTextColor: (next === 'dark') ? '#e5e5e5' : '#262626',
          noteBkgColor: (next === 'dark') ? '#262626' : '#f5f5f5',
          noteBorderColor: (next === 'dark') ? '#404040' : '#d4d4d4',
          noteTextColor: (next === 'dark') ? '#e5e5e5' : '#262626',
          fontFamily: '"Geist", -apple-system, sans-serif',
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
    if (window.Analytics?.trackThemeChange) {
      window.Analytics.trackThemeChange(next);
    }
  }

  // ── Mermaid ───────────────────────────────────────────────
  function initMermaid() {
    const diagrams = document.querySelectorAll('.mermaid:not([data-processed])');
    if (diagrams.length === 0) {
      attachMermaidZoomControls();
      return;
    }

    window.loadMermaid().then(() => {
      // Store original source on each element before rendering
      diagrams.forEach(el => {
        if (!el.getAttribute('data-original-src')) {
          el.setAttribute('data-original-src', el.textContent.trim());
        }
      });
      // Call mermaid.run directly on the nodes (mermaid manages data-processed internally)
      window.mermaid.run({ nodes: Array.from(diagrams) }).then(() => {
        attachMermaidZoomControls();
      }).catch(err => {
        console.warn('Mermaid render warning:', err);
        attachMermaidZoomControls();
      });
    }).catch(err => {
      console.warn('Failed to load Mermaid:', err);
    });
  }

  // ── Diagram Lightbox & Zoom ───────────────────────────────
  let lightboxState = {
    isOpen: false,
    scale: 1,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    startX: 0,
    startY: 0
  };

  function updateLightboxTransform() {
    const stage = document.getElementById('diagram-lightbox-stage');
    const zoomLevel = document.getElementById('diagram-zoom-level');
    if (!stage) return;
    stage.style.transform = `translate(${lightboxState.translateX}px, ${lightboxState.translateY}px) scale(${lightboxState.scale})`;
    if (zoomLevel) {
      zoomLevel.textContent = Math.round(lightboxState.scale * 100) + '%';
    }
  }

  function openDiagramLightbox(mermaidEl) {
    const modal = document.getElementById('diagram-lightbox');
    const stage = document.getElementById('diagram-lightbox-stage');
    const body = document.getElementById('diagram-lightbox-body');
    if (!modal || !stage) return;

    if (window.Analytics) {
      window.Analytics.trackDiagramOpen();
    }

    const svg = mermaidEl.querySelector('svg');
    if (!svg) return;

    // Show modal first so container dimensions can be accurately measured
    modal.classList.add('open');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Reset view transform state
    lightboxState.isOpen = true;
    lightboxState.scale = 1.0;
    lightboxState.translateX = 0;
    lightboxState.translateY = 0;
    updateLightboxTransform();

    // Preserve scoped styles by replacing original ID with a unique lightbox ID.
    // Calling removeAttribute('id') broke all internal <style> selectors (#mermaid-xxx ...)
    // which caused edges (.edgePath .path) to lose stroke and nodes to lose styles.
    const originalId = svg.getAttribute('id');
    const newId = originalId ? (originalId + '-lightbox') : ('mermaid-lb-' + Date.now());

    let svgHtml = svg.outerHTML;
    if (originalId) {
      svgHtml = svgHtml.replaceAll(originalId, newId);
    }

    stage.innerHTML = svgHtml;

    const lbSvg = stage.querySelector('svg');
    if (lbSvg) {
      // Remove restrictive inline max-width from original element
      lbSvg.removeAttribute('style');

      // Extract viewBox dimensions
      let vbW = 0, vbH = 0;
      const vb = lbSvg.getAttribute('viewBox');
      if (vb) {
        const parts = vb.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          vbW = parts[2];
          vbH = parts[3];
        }
      }

      // If no viewBox, fallback to client dimensions
      if (!vbW || !vbH) {
        const rect = svg.getBoundingClientRect();
        vbW = rect.width || 800;
        vbH = rect.height || 500;
      }

      // Compute available space in the modal body
      const bodyW = (body && body.clientWidth) || (body ? body.getBoundingClientRect().width : 0) || (window.innerWidth * 0.92);
      const bodyH = (body && body.clientHeight) || (body ? body.getBoundingClientRect().height : 0) || (window.innerHeight * 0.82);
      const availW = Math.max(320, bodyW - 48);
      const availH = Math.max(240, bodyH - 48);

      // Determine scale to make diagram comfortably big while fitting inside modal
      const scaleX = availW / vbW;
      const scaleY = availH / vbH;
      let fitScale = Math.min(scaleX, scaleY);
      if (fitScale > 1.8) fitScale = 1.8;
      if (fitScale < 0.2) fitScale = 0.2;

      const renderW = Math.round(vbW * fitScale);
      const renderH = Math.round(vbH * fitScale);

      lbSvg.setAttribute('width', renderW);
      lbSvg.setAttribute('height', renderH);
      lbSvg.style.width = renderW + 'px';
      lbSvg.style.height = renderH + 'px';
      lbSvg.style.maxWidth = 'none';
      lbSvg.style.maxHeight = 'none';
      lbSvg.style.display = 'block';
    }
  }

  function closeDiagramLightbox() {
    const modal = document.getElementById('diagram-lightbox');
    if (!modal) return;
    modal.classList.remove('open');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    lightboxState.isOpen = false;
    if (window.Analytics) {
      window.Analytics.trackDiagramClose();
    }
  }

  function attachMermaidAccessibility() {
    const diagrams = document.querySelectorAll('.mermaid');
    const topicTitleEl = document.querySelector('.lesson-header__title');
    const topicTitle = topicTitleEl ? topicTitleEl.textContent.trim() : 'System Architecture';
    diagrams.forEach(el => {
      const svg = el.querySelector('svg');
      if (svg) {
        if (!svg.hasAttribute('role')) {
          svg.setAttribute('role', 'img');
        }
        if (!svg.hasAttribute('aria-label')) {
          svg.setAttribute('aria-label', `System Architecture Diagram for ${topicTitle}`);
        }
      }
    });
  }

  function attachMermaidZoomControls() {
    attachMermaidAccessibility();
    const diagrams = document.querySelectorAll('.mermaid');
    diagrams.forEach(el => {
      const svg = el.querySelector('svg');
      if (!svg) return;

      // Avoid double-attaching button
      if (!el.querySelector('.mermaid-expand-btn')) {
        const btn = document.createElement('button');
        btn.className = 'mermaid-expand-btn';
        btn.setAttribute('type', 'button');
        btn.setAttribute('title', 'View diagram full size');
        btn.setAttribute('aria-label', 'Expand diagram');
        btn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          <span>Expand</span>
        `;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openDiagramLightbox(el);
        });
        el.appendChild(btn);
      }

      if (!el._zoomClickAttached) {
        el._zoomClickAttached = true;
        el.addEventListener('click', () => {
          openDiagramLightbox(el);
        });
      }
    });
  }

  function setupDiagramLightboxEvents() {
    const modal = document.getElementById('diagram-lightbox');
    const backdrop = document.getElementById('diagram-lightbox-backdrop');
    const closeBtn = document.getElementById('diagram-lightbox-close');
    const zoomInBtn = document.getElementById('diagram-zoom-in');
    const zoomOutBtn = document.getElementById('diagram-zoom-out');
    const zoomResetBtn = document.getElementById('diagram-zoom-reset');
    const body = document.getElementById('diagram-lightbox-body');

    if (!modal) return;

    if (backdrop) backdrop.addEventListener('click', closeDiagramLightbox);
    if (closeBtn) closeBtn.addEventListener('click', closeDiagramLightbox);

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        lightboxState.scale = Math.min(lightboxState.scale * 1.25, 4.0);
        updateLightboxTransform();
        if (window.Analytics) {
          window.Analytics.trackDiagramZoom('zoom_in', lightboxState.scale);
        }
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        lightboxState.scale = Math.max(lightboxState.scale / 1.25, 0.35);
        updateLightboxTransform();
        if (window.Analytics) {
          window.Analytics.trackDiagramZoom('zoom_out', lightboxState.scale);
        }
      });
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => {
        lightboxState.scale = 1.0;
        lightboxState.translateX = 0;
        lightboxState.translateY = 0;
        updateLightboxTransform();
        if (window.Analytics) {
          window.Analytics.trackDiagramZoom('zoom_reset', lightboxState.scale);
        }
      });
    }

    if (body) {
      // Mouse wheel zoom
      body.addEventListener('wheel', (e) => {
        if (!lightboxState.isOpen) return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        lightboxState.scale = Math.max(0.35, Math.min(4.0, lightboxState.scale * factor));
        updateLightboxTransform();
      }, { passive: false });

      // Click and drag panning
      body.addEventListener('mousedown', (e) => {
        if (e.target.closest('.diagram-lightbox__actions')) return;
        lightboxState.isDragging = true;
        lightboxState.startX = e.clientX - lightboxState.translateX;
        lightboxState.startY = e.clientY - lightboxState.translateY;
        body.classList.add('panning');
      });

      window.addEventListener('mousemove', (e) => {
        if (!lightboxState.isDragging || !lightboxState.isOpen) return;
        lightboxState.translateX = e.clientX - lightboxState.startX;
        lightboxState.translateY = e.clientY - lightboxState.startY;
        updateLightboxTransform();
      });

      window.addEventListener('mouseup', () => {
        if (lightboxState.isDragging) {
          lightboxState.isDragging = false;
          body.classList.remove('panning');
        }
      });

      // Touch panning for mobile
      let touchStartX = 0, touchStartY = 0;
      body.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX - lightboxState.translateX;
          touchStartY = e.touches[0].clientY - lightboxState.translateY;
        }
      }, { passive: true });

      body.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && lightboxState.isOpen) {
          lightboxState.translateX = e.touches[0].clientX - touchStartX;
          lightboxState.translateY = e.touches[0].clientY - touchStartY;
          updateLightboxTransform();
        }
      }, { passive: true });
    }

    // Keyboard shortcut (Escape to close)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxState.isOpen) {
        closeDiagramLightbox();
      }
    });
  }

  // ── Progress ──────────────────────────────────────────────
  function toggleComplete(slug) {
    const completed = window.Progress.toggleComplete(slug);
    renderCurrentView();
    renderSidebar();

    if (window.Analytics) {
      const data = window.CURRICULUM_DATA;
      let title = slug;
      if (data) {
        for (const p of data.parts) {
          for (const m of p.modules) {
            for (const u of m.units) {
              if (u.slug === slug) {
                title = u.title;
                break;
              }
            }
          }
        }
      }
      if (completed) {
        window.Analytics.trackTopicComplete({
          slug: slug,
          title: title,
          totalCompleted: window.Progress.getCompletedCount(),
          percentage: window.Progress.getPercentage()
        });
      } else {
        window.Analytics.trackTopicUncomplete({
          slug: slug,
          title: title
        });
      }
    }
  }

  // ── Event Listeners ───────────────────────────────────────
  function setupEventListeners() {
    // Diagram Lightbox
    setupDiagramLightboxEvents();

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

    // Brand logo click
    const brand = document.querySelector('.topbar__brand');
    if (brand) {
      brand.addEventListener('click', (e) => {
        e.preventDefault();
        navigateHome();
      });
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
        if (window.Analytics?.trackTabSwitch) {
          window.Analytics.trackTabSwitch(activeTab);
        }
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

    // Delegated click handler on sidebar (handles module toggle and unit item navigation without inline onclick)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        // Module group toggle
        const groupHeader = e.target.closest('.module-group__header');
        if (groupHeader) {
          const group = groupHeader.closest('.module-group');
          const modId = group?.dataset?.module;
          if (modId) {
            e.preventDefault();
            toggleModule(modId);
          }
          return;
        }

        // Unit item navigation (topic, build, project)
        const unitItem = e.target.closest('.unit-item');
        if (unitItem) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
            return; // Allow native behavior (new tab/window)
          }
          if (unitItem.dataset.slug) {
            e.preventDefault();
            navigateTo(unitItem.dataset.slug, e);
            return;
          }
          if (unitItem.dataset.build) {
            e.preventDefault();
            navigateToBuild(unitItem.dataset.build, e);
            return;
          }
          if (unitItem.dataset.project) {
            e.preventDefault();
            navigateToProject(unitItem.dataset.project, e);
            return;
          }
        }
      });
    }

    // Video thumbnail error fallback (CSP-compliant, no inline onerror)
    window.addEventListener('error', (e) => {
      const target = e.target;
      if (target && target.tagName === 'IMG' && target.classList.contains('video-embed__thumb')) {
        const src = target.getAttribute('src') || '';
        if (src.includes('/hqdefault.jpg')) {
          target.src = src.replace('/hqdefault.jpg', '/default.jpg');
        }
      }
    }, true);

    // Delegated input listener for glossary filter (CSP-compliant, no inline oninput)
    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target && target.matches('[data-action="filter-glossary"]')) {
        const q = target.value.toLowerCase();
        document.querySelectorAll('.glossary-item').forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(q) ? 'block' : 'none';
        });
      }
    });

    // Delegated click listener for interactive actions and navigation (CSP-compliant, no inline onclick)
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;

      // 1. Navigation links with [data-nav]
      const navEl = target.closest('[data-nav]');
      if (navEl) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        const nav = navEl.dataset.nav;
        if (nav === 'home') navigateHome();
        else if (nav === 'projects') navigateToProject(navEl.dataset.project);
        else if (nav === 'topic') navigateTo(navEl.dataset.slug);
        else if (nav === 'module') navigateToModule(navEl.dataset.module);
        return;
      }

      // 2. Module card navigation
      const modCard = target.closest('[data-action="navigate-module"]');
      if (modCard) {
        const modId = modCard.getAttribute('data-module-id') || modCard.getAttribute('data-module');
        if (modId) {
          e.preventDefault();
          navigateToModule(modId);
        }
        return;
      }

      // 3. Mark complete toggle
      const compBtn = target.closest('[data-action="toggle-complete"]');
      if (compBtn) {
        const slug = compBtn.getAttribute('data-slug');
        if (slug) {
          e.preventDefault();
          toggleComplete(slug);
        }
        return;
      }

      // 4. Audio player controls
      const audioBtn = target.closest('[data-action="toggle-audio"]');
      if (audioBtn) {
        const slug = audioBtn.getAttribute('data-slug');
        if (slug && typeof window.toggleAudio === 'function') {
          e.preventDefault();
          window.toggleAudio(slug);
        }
        return;
      }

      const seekTrack = target.closest('[data-action="seek-audio"]');
      if (seekTrack) {
        const slug = seekTrack.getAttribute('data-slug');
        if (slug && typeof window.seekAudio === 'function') {
          e.preventDefault();
          window.seekAudio(slug, e);
        }
        return;
      }

      const speedBtn = target.closest('[data-action="cycle-audio-speed"]');
      if (speedBtn) {
        const slug = speedBtn.getAttribute('data-slug');
        if (slug && typeof window.cycleAudioSpeed === 'function') {
          e.preventDefault();
          window.cycleAudioSpeed(slug);
        }
        return;
      }

      // 5. Build & code actions
      const buildBtn = target.closest('[data-action="navigate-build"]');
      if (buildBtn) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const buildId = buildBtn.getAttribute('data-build-id');
        if (buildId) {
          e.preventDefault();
          navigateToBuild(buildId, e);
        }
        return;
      }

      const copyScriptBtn = target.closest('[data-action="copy-build-script"]');
      if (copyScriptBtn) {
        const buildId = copyScriptBtn.getAttribute('data-build-id');
        if (buildId && typeof window.copyBuildScript === 'function') {
          e.preventDefault();
          window.copyBuildScript(buildId, copyScriptBtn);
        }
        return;
      }

      const scrollFileBtn = target.closest('[data-action="scroll-to-file"]');
      if (scrollFileBtn) {
        const targetId = scrollFileBtn.getAttribute('data-target');
        if (targetId) {
          e.preventDefault();
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      const copyBtn = target.closest('[data-action="copy-code"]');
      if (copyBtn) {
        e.preventDefault();
        if (typeof window.copyCode === 'function') {
          window.copyCode(copyBtn);
        }
        return;
      }

      // 6. Video player & embed
      const ytBtn = target.closest('[data-action="load-youtube"]');
      if (ytBtn) {
        const videoId = ytBtn.getAttribute('data-video-id');
        if (videoId && typeof window.loadYouTubeVideo === 'function') {
          e.preventDefault();
          window.loadYouTubeVideo(videoId, ytBtn.parentElement);
        }
        return;
      }

      const videoCard = target.closest('[data-action="play-in-main-video"]');
      if (videoCard) {
        if (typeof window.playInMainVideo === 'function') {
          window.playInMainVideo(e, videoCard);
        }
        return;
      }

      // 7. Lesson feedback vote
      const fbBtn = target.closest('[data-action="feedback-vote"]');
      if (fbBtn) {
        const slug = fbBtn.getAttribute('data-slug');
        const vote = fbBtn.getAttribute('data-vote');
        if (slug && vote && typeof window.handleFeedbackVote === 'function') {
          e.preventDefault();
          window.handleFeedbackVote(fbBtn, slug, vote);
        }
        return;
      }

      // 8. Cheat sheet print
      const printBtn = target.closest('[data-action="window-print"]');
      if (printBtn) {
        e.preventDefault();
        window.print();
        return;
      }

      // 9. Intercept internal /build/<slug>/ and /topic/<slug>/ links for SPA navigation
      const anchor = target.closest('a[href]');
      if (anchor && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || anchor.target === '_blank')) {
        const href = anchor.getAttribute('href') || '';
        const buildMatch = href.match(/^\/build\/([^/#?]+)\/?$/);
        if (buildMatch) {
          e.preventDefault();
          navigateToBuild(buildMatch[1], e);
          return;
        }
        const topicMatch = href.match(/^\/topic\/([^/#?]+)\/?$/);
        if (topicMatch) {
          e.preventDefault();
          navigateTo(topicMatch[1], e);
          return;
        }
      }
    });

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

  const App = {
    navigateTo,
    navigateToBuild,
    navigateToProject,
    navigateToModule,
    navigateHome,
    toggleModule,
    toggleComplete,
    toggleTheme,
    renderCurrentView,
    renderSidebar,
    initMermaid,
    openDiagramLightbox,
    closeDiagramLightbox,
    getCurrentSlug: () => currentSlug,
    getCurrentView: () => currentView,
    getActiveTab: () => activeTab
  };

  window.App = App;
  window.openDiagramLightbox = openDiagramLightbox;
  window.closeDiagramLightbox = closeDiagramLightbox;

  const boot = () => {
    try {
      init();
    } catch (err) {
      console.error('[App init error]', err);
    }
  };

  // ── Boot ──────────────────────────────────────────────────
  // Scripts are injected after first paint, so DOMContentLoaded may already have fired
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return App;
})();
