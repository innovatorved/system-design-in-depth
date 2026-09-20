/* ═══════════════════════════════════════════════════════════════
   Renderer — Content rendering for lessons, builds, and overview
   ═══════════════════════════════════════════════════════════════ */

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
    external: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
  };

  /**
   * Render the Course Overview (home page)
   */
  function renderOverview() {
    const data = window.CURRICULUM_DATA;
    if (!data) return '<p>Loading curriculum data...</p>';

    const stats = data.stats;
    const pct = window.Progress.getPercentage();
    const projects = window.PROJECTS_DATA || [];
    const pinnedProjects = projects.filter(p => p.pinned);

    let html = `
      <div class="hero">
        <div class="hero__eyebrow">System Design Course</div>
        <h1 class="hero__title">System Design In Depth</h1>
        <p class="hero__subtitle">Deep notes, case studies, YouTube tutorials, and from-scratch implementations for senior engineering practice.</p>
        <div class="hero__stats">
          <div><div class="hero__stat-value">${stats.modules}</div><div class="hero__stat-label">Modules</div></div>
          <div><div class="hero__stat-value">${stats.units}</div><div class="hero__stat-label">Topics</div></div>
          <div><div class="hero__stat-value">${stats.builds}</div><div class="hero__stat-label">Builds</div></div>
          <div><div class="hero__stat-value">${pct}%</div><div class="hero__stat-label">Complete</div></div>
        </div>
        <div class="hero__credit-row">
          <div class="hero__credit">
            <a href="https://github.com/innovatorved/system-design-in-depth" target="_blank" rel="noopener noreferrer" data-repo-placement="hero">★ Star on GitHub · innovatorved/system-design-in-depth ↗</a>
          </div>
          <div class="hero__credit">
            <a href="/projects" data-nav="projects">★ View more projects by @innovatorved ↗</a>
          </div>
        </div>
      </div>`;

    // Render each part
    for (const part of data.parts) {
      html += `
        <div class="part-header">
          <div class="part-header__label">Part ${part.number}</div>
          <h2 class="part-header__title">${part.title}</h2>
          <p class="part-header__summary">${part.summary}</p>
        </div>
        <div class="module-grid">`;

      for (const mod of part.modules) {
        const prog = window.Progress.getModuleProgress(mod.id);
        const progPct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
        html += `
          <div class="module-card" data-module="${mod.id}" onclick="App.navigateToModule('${mod.id}')">
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

    // Find unit
    let unit = null, mod = null, part = null;
    for (const p of data.parts) {
      for (const m of p.modules) {
        for (const u of m.units) {
          if (u.slug === slug) {
            unit = u; mod = m; part = p;
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
    const archiveContent = unit.archive?.content;

    // Build header
    let html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#" data-nav="home">Home</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <a href="#" data-nav="module" data-module="${mod.id}">Module ${mod.number}</a>
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
        </div>
        <div class="lesson-header__actions">
          <button class="completion-toggle${isCompleted ? ' completed' : ''}" onclick="App.toggleComplete('${slug}')">
            ${isCompleted ? icons.check + ' Completed' : icons.circle + ' Mark Complete'}
          </button>
        </div>
      </div>`;

    // Video embed (from module content)
    if (moduleContent?.video?.youtubeId) {
      html += renderVideoEmbed(moduleContent.video);
    }

    // Audio player
    html += `
      <div class="audio-player" id="audio-player-${slug}">
        <button class="audio-player__play-btn" id="audio-btn-${slug}" onclick="toggleAudio('${slug}')" aria-label="Play audio" title="Play audio">
          <svg id="audio-play-icon-${slug}" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg id="audio-pause-icon-${slug}" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <span class="audio-player__time" id="audio-time-${slug}">0:00 / --:--</span>
        <div class="audio-player__track" onclick="seekAudio('${slug}', event)" id="audio-track-${slug}">
          <div class="audio-player__progress" id="audio-bar-${slug}" style="width: 0%;"></div>
        </div>
        <button class="audio-player__speed-btn" onclick="cycleAudioSpeed('${slug}')" id="audio-speed-${slug}" title="Playback speed">1x</button>
        <audio id="audio-${slug}" src="audio/${slug}.mp3" preload="metadata" onloadedmetadata="setupAudioListeners('${slug}')"></audio>
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

    // Interactive Visual Simulator (if applicable for unit)
    if (window.Simulators && window.Simulators.getSimulatorForUnit) {
      html += window.Simulators.getSimulatorForUnit(slug);
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

    // Prev/Next navigation
    html += renderLessonNav(slug, mod, part);

    return html;
  }

  /**
   * Render a Build (Implementation) View
   */
  function renderBuild(buildId) {
    const impls = window.IMPLEMENTATIONS_DATA;
    if (!impls || !impls[buildId]) return '<p>Build not found.</p>';

    const build = impls[buildId];
    const files = build.files || {};

    let html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#" data-nav="home">Home</a>
        <span class="breadcrumbs__sep">${icons.chevronRight}</span>
        <span class="breadcrumbs__current">${build.title || buildId}</span>
      </nav>

      <div class="lesson-header">
        <div class="lesson-header__badge">
          <span class="lesson-header__kind lesson-header__kind--build">${icons.code} Build</span>
        </div>
        <h1 class="lesson-header__title">${build.title || buildId.replace(/-/g, ' ')}</h1>
      </div>`;

    // Render each file
    for (const [filename, content] of Object.entries(files)) {
      const lang = filename.endsWith('.js') ? 'javascript' : filename.endsWith('.md') ? 'markdown' : 'text';

      if (filename.endsWith('.md')) {
        html += '<article class="prose">' + convertMarkdownToHTML(content) + '</article>';
      } else {
        html += `
          <div class="code-block">
            <div class="code-block__header">
              <span class="code-block__lang">${filename}</span>
              <button class="code-block__copy" onclick="copyCode(this)">Copy</button>
            </div>
            <pre><code>${escapeHtml(content)}</code></pre>
          </div>`;
      }
    }

    return html;
  }

  /**
   * Render YouTube video embed (lazy-loaded)
   */
  function renderVideoEmbed(video) {
    if (!video?.youtubeId) return '';
    return `
      <div class="video-embed" id="video-${video.youtubeId}">
        <div class="video-embed__placeholder" onclick="loadYouTubeVideo('${video.youtubeId}', this.parentElement)">
          <img src="https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg"
               alt="${escapeHtml(video.title || '')}"
               loading="lazy"
               onerror="this.src='https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg'">
          <div class="video-embed__play-btn">${icons.play}</div>
        </div>
      </div>
      ${video.title ? `<div class="video-embed__info">
        <span class="video-embed__channel">${escapeHtml(video.channel || 'YouTube')}</span>
        <span class="video-embed__title">${escapeHtml(video.title)}</span>
      </div>` : ''}`;
  }

  /**
   * Convert basic markdown to HTML
   */
  function convertMarkdownToHTML(md) {
    if (!md) return '';

    // Phase 1: Extract code blocks and mermaid diagrams to protect them from other regexes
    const codeBlocks = [];
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
      });

    // Phase 2: Process markdown syntax (code blocks are safely extracted)
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
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code (must come after bold/italic to avoid conflicts)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links (standard and wiki-style)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\[\[wiki\/([^\]|]+)\|([^\]]+)\]\]/g, '<a href="#" data-nav="topic" data-slug="$1">$2</a>')
      .replace(/\[\[wiki\/([^\]]+)\]\]/g, (_, slug) => '<a href="#" data-nav="topic" data-slug="' + slug + '">' + slug.replace(/-/g, ' ') + '</a>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      // Tables
      .replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, header, body) => {
        const ths = header.split('|').map(h => h.trim()).filter(Boolean).map(h => '<th>' + h + '</th>').join('');
        const rows = body.trim().split('\n').map(row => {
          const tds = row.split('|').map(c => c.trim()).filter(Boolean).map(c => '<td>' + c + '</td>').join('');
          return '<tr>' + tds + '</tr>';
        }).join('');
        return '<table><thead><tr>' + ths + '</tr></thead><tbody>' + rows + '</tbody></table>';
      });

    // Phase 3: Restore code blocks
    html = html.replace(/\x00CODEBLOCK_(\d+)\x00/g, (_, idx) => codeBlocks[parseInt(idx)]);

    // Process paragraphs and lists
    const lines = html.split('\n');
    const processed = [];
    let inList = false;
    let listType = '';
    let inPre = false;
    let inMermaid = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track pre blocks
      if (line.includes('<pre>')) inPre = true;
      if (line.includes('</pre>')) { inPre = false; processed.push(line); continue; }
      if (inPre) { processed.push(line); continue; }

      // Track mermaid blocks
      if (line.includes('<div class="mermaid">')) inMermaid = true;
      if (inMermaid) {
        if (line.includes('</div>')) inMermaid = false;
        processed.push(line);
        continue;
      }

      // Skip already-processed HTML tags
      if (line.match(/^<(h[1-6]|table|thead|tbody|tr|th|td|div|pre|hr|ul|ol|li|blockquote)/)) {
        if (inList) { processed.push('</' + listType + '>'); inList = false; }
        processed.push(line);
        continue;
      }

      // Unordered list
      if (line.match(/^[-*] /)) {
        if (!inList || listType !== 'ul') {
          if (inList) processed.push('</' + listType + '>');
          processed.push('<ul>');
          inList = true; listType = 'ul';
        }
        processed.push('<li>' + line.replace(/^[-*] /, '') + '</li>');
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\. /)) {
        if (!inList || listType !== 'ol') {
          if (inList) processed.push('</' + listType + '>');
          processed.push('<ol>');
          inList = true; listType = 'ol';
        }
        processed.push('<li>' + line.replace(/^\d+\. /, '') + '</li>');
        continue;
      }

      // End list
      if (inList && line.trim() === '') {
        processed.push('</' + listType + '>');
        inList = false;
        continue;
      }

      // Paragraph
      if (line.trim() && !line.match(/^</) && !inList) {
        processed.push('<p>' + line + '</p>');
      } else {
        processed.push(line);
      }
    }

    if (inList) processed.push('</' + listType + '>');

    return processed.join('\n');
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
      html += `<a class="lesson-nav__link" href="#" data-nav="topic" data-slug="${prev.slug}">
        <span class="lesson-nav__label">← Previous</span>
        <span class="lesson-nav__title">${prev.title}</span>
      </a>`;
    } else {
      html += '<div></div>';
    }

    if (next) {
      html += `<a class="lesson-nav__link lesson-nav__link--next" href="#" data-nav="topic" data-slug="${next.slug}">
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
    container.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    if (window.Analytics?.trackVideoPlay) {
      const title = container.parentElement?.querySelector('.video-embed__title')?.textContent || '';
      window.Analytics.trackVideoPlay(videoId, title);
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

    return `
      <div class="project-card" id="project-${project.id}" data-project-id="${project.id}">
        <div class="project-card__top">
          <div class="project-card__title-group">
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-card__title-link" data-repo-placement="card_title">
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
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--secondary project-card__btn" data-repo-placement="card_footer_github">
              ${icons.github}
              <span>GitHub</span>
              ${icons.external}
            </a>
            ${hasLive ? `
              <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--primary project-card__btn" data-repo-placement="card_footer_demo">
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
          <span class="tag">1,500+ Stars</span>
          <span class="tag">${projects.length} Featured Repos</span>
        </div>
        <h1 class="lesson-header__title">Featured Projects by Ved Gupta</h1>
        <div class="lesson-header__meta">
          <span class="lesson-header__meta-item">Open-source speech transcription APIs, local voice dictation for Mac, and developer tools built by <a href="https://github.com/innovatorved" target="_blank" rel="noopener noreferrer" class="author-highlight">@innovatorved</a>.</span>
        </div>
        <div class="lesson-header__actions" style="margin-top: var(--space-3); display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <a href="https://github.com/innovatorved?tab=repositories" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--primary" data-repo-placement="projects_follow">
            ${icons.github}
            <span>Follow @innovatorved on GitHub</span>
            ${icons.external}
          </a>
          <a href="/" data-nav="home" class="btn btn--sm btn--secondary">
            <span>← Back to Curriculum</span>
          </a>
        </div>
      </div>

      <div class="projects-grid">
        ${projects.map(p => renderProjectCard(p)).join('')}
      </div>
    `;

    return html;
  }

  return {
    renderOverview,
    renderLesson,
    renderBuild,
    renderProjects,
    renderProjectCard,
    renderVideoEmbed,
    convertMarkdownToHTML,
    escapeHtml,
    icons
  };
})();
