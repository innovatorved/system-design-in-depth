/* ═══════════════════════════════════════════════════════════════
   GA4 Analytics & Browser Fingerprinting Engine
   Complete event, user identity, device fingerprint & lifecycle tracking
   ═══════════════════════════════════════════════════════════════ */

window.Analytics = (() => {
  // Config: Active GA4 Measurement ID
  const DEFAULT_ID = 'G-SZ26BQZCQ7';

  // State
  let activeTopicSlug = null;
  let topicStartTime = null;
  const trackedScrollDepths = new Set();
  let searchDebounceTimer = null;
  let cachedUserContext = null;

  /**
   * Helper to get active GA4 measurement ID
   */
  function getMeasurementId() {
    return window.GA_MEASUREMENT_ID || DEFAULT_ID;
  }

  /**
   * 64-bit Cybr53 / Dual-32-bit deterministic string hash (returns 16-char hex)
   */
  function cyrb64Hex(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return hex1 + hex2;
  }

  /**
   * Canvas 2D rendering entropy for deterministic browser fingerprinting
   */
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(100, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.font = '14px "Arial", sans-serif';
      ctx.fillText('SystemDesign:fp_v2 🚀', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = '18px "Times New Roman", serif';
      ctx.fillText('SystemDesign:fp_v2 🚀', 4, 45);
      ctx.beginPath();
      ctx.arc(50, 30, 18, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      return cyrb64Hex(canvas.toDataURL());
    } catch {
      return 'canvas-err';
    }
  }

  /**
   * WebGL GPU Vendor & Renderer entropy
   */
  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: 'none', renderer: 'none', hash: 'no-webgl' };
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      const version = gl.getParameter(gl.VERSION) || '';
      const shading = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '';
      const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      const raw = [vendor, renderer, version, shading, maxTex].join('|');
      return {
        vendor: String(vendor || 'unknown').slice(0, 64),
        renderer: String(renderer || 'unknown').slice(0, 80),
        hash: cyrb64Hex(raw)
      };
    } catch {
      return { vendor: 'err', renderer: 'err', hash: 'webgl-err' };
    }
  }

  /**
   * Parse User-Agent into structured Browser, OS, and Device Type
   */
  function parseUserAgent() {
    const ua = navigator.userAgent || '';
    let browserName = 'Unknown';
    let browserVersion = '';

    if (/Edg\/([\d.]+)/.test(ua)) {
      browserName = 'Edge';
      browserVersion = RegExp.$1;
    } else if (/OPR\/([\d.]+)/.test(ua)) {
      browserName = 'Opera';
      browserVersion = RegExp.$1;
    } else if (/Chrome\/([\d.]+)/.test(ua) && !/Chromium/.test(ua)) {
      browserName = 'Chrome';
      browserVersion = RegExp.$1;
    } else if (/Firefox\/([\d.]+)/.test(ua)) {
      browserName = 'Firefox';
      browserVersion = RegExp.$1;
    } else if (/Version\/([\d.]+).*Safari/.test(ua)) {
      browserName = 'Safari';
      browserVersion = RegExp.$1;
    }

    let osName = 'Unknown';
    if (/Windows NT 10\.0/.test(ua)) osName = 'Windows 10/11';
    else if (/Windows NT/.test(ua)) osName = 'Windows';
    else if (/Mac OS X ([\d_]+)/.test(ua)) osName = 'macOS ' + RegExp.$1.replace(/_/g, '.');
    else if (/Android ([\d.]+)/.test(ua)) osName = 'Android ' + RegExp.$1;
    else if (/iPhone|iPad|iPod/.test(ua)) osName = 'iOS';
    else if (/Linux/.test(ua)) osName = 'Linux';

    const isMobile = /Mobi|Android|iPhone|iPod/i.test(ua);
    const isTablet = /iPad|Tablet|(Android(?!.*Mobi))/i.test(ua);
    const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

    return {
      browserName,
      browserVersion: browserVersion.split('.')[0] || '',
      osName,
      deviceType
    };
  }

  /**
   * Build and cache deterministic user identity, fingerprint & device profile
   */
  function getUserContext() {
    if (cachedUserContext) return cachedUserContext;

    const uaInfo = parseUserAgent();
    const webgl = getWebGLInfo();
    const canvasHash = getCanvasFingerprint();
    const tz = (() => {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
    })();
    const tzOffset = new Date().getTimezoneOffset();
    const screenSig = typeof screen !== 'undefined'
      ? `${screen.width}x${screen.height}x${screen.colorDepth || 24}@${window.devicePixelRatio || 1}`
      : '0x0';
    const langs = (navigator.languages ? navigator.languages.join(',') : navigator.language) || 'en';
    const cores = navigator.hardwareConcurrency || 0;
    const mem = navigator.deviceMemory || 0;
    const touchPoints = navigator.maxTouchPoints || 0;
    const platform = navigator.platform || '';
    const mathSig = `${Math.acos(0.123456789).toFixed(10)}|${Math.sinh(1).toFixed(10)}`;

    // Deterministic hardware + browser fingerprint
    const rawFingerprintMaterial = [
      canvasHash,
      webgl.hash,
      webgl.vendor,
      webgl.renderer,
      screenSig,
      tz,
      tzOffset,
      langs,
      cores,
      mem,
      touchPoints,
      platform,
      uaInfo.osName,
      uaInfo.browserName,
      mathSig
    ].join('||');

    const fingerprintId = 'fp_' + cyrb64Hex(rawFingerprintMaterial, 0x1337beef);

    // Persistent visitor ID in localStorage (maps back to fingerprintId if cleared)
    let visitorId = fingerprintId;
    let visitCount = 1;
    let firstSeenAt = new Date().toISOString();
    try {
      const storedVisitor = localStorage.getItem('sd-visitor-id');
      if (storedVisitor) {
        visitorId = storedVisitor;
      } else {
        visitorId = `${fingerprintId}_${Date.now().toString(36)}`;
        localStorage.setItem('sd-visitor-id', visitorId);
      }

      const storedFirstSeen = localStorage.getItem('sd-first-seen');
      if (storedFirstSeen) {
        firstSeenAt = storedFirstSeen;
      } else {
        localStorage.setItem('sd-first-seen', firstSeenAt);
      }

      const prevCount = parseInt(localStorage.getItem('sd-visit-count') || '0', 10) || 0;
      if (!sessionStorage.getItem('sd-session-counted')) {
        visitCount = prevCount + 1;
        localStorage.setItem('sd-visit-count', String(visitCount));
        sessionStorage.setItem('sd-session-counted', '1');
      } else {
        visitCount = Math.max(1, prevCount);
      }
    } catch {}

    // Session ID in sessionStorage
    let sessionId = 'ses_' + cyrb64Hex(fingerprintId + ':' + Date.now(), 42).slice(0, 12);
    try {
      const existingSes = sessionStorage.getItem('sd-session-id');
      if (existingSes) {
        sessionId = existingSes;
      } else {
        sessionStorage.setItem('sd-session-id', sessionId);
      }
    } catch {}

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connectionType = conn ? (conn.effectiveType || conn.type || 'unknown') : 'unknown';

    cachedUserContext = {
      fingerprint_id: fingerprintId,
      visitor_id: visitorId,
      session_id: sessionId,
      visit_count: visitCount,
      first_seen_at: firstSeenAt,
      browser_name: uaInfo.browserName,
      browser_version: uaInfo.browserVersion,
      os_name: uaInfo.osName,
      device_type: uaInfo.deviceType,
      gpu_vendor: webgl.vendor,
      gpu_renderer: webgl.renderer,
      canvas_fp: canvasHash,
      webgl_fp: webgl.hash,
      screen_res: screenSig,
      cpu_cores: cores,
      ram_gb: mem,
      touch_points: touchPoints,
      timezone: tz,
      tz_offset_min: tzOffset,
      locale: navigator.language || 'en',
      connection_type: connectionType
    };

    return cachedUserContext;
  }

  /**
   * Read dynamic learner progress state for event enrichment
   */
  function getLearnerSnapshot() {
    let completedCount = 0;
    let bookmarksCount = 0;
    try {
      const p = JSON.parse(localStorage.getItem('sd-progress-v2') || localStorage.getItem('sd-progress') || '{}') || {};
      if (Array.isArray(p.completed)) completedCount = p.completed.length;
      if (Array.isArray(p.bookmarks)) bookmarksCount = p.bookmarks.length;
    } catch {}
    const viewport = `${window.innerWidth || 0}x${window.innerHeight || 0}`;
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return {
      completed_topics_count: completedCount,
      bookmarks_count: bookmarksCount,
      viewport_res: viewport,
      ui_theme: theme
    };
  }

  /**
   * Configure GA4 user_id and user_properties so all events map to the user's fingerprint
   */
  function syncUserIdentityToGA4() {
    try {
      const ctx = getUserContext();
      const snap = getLearnerSnapshot();
      const measurementId = getMeasurementId();

      if (typeof window.gtag === 'function') {
        window.gtag('config', measurementId, {
          user_id: ctx.fingerprint_id,
          send_page_view: false
        });
        window.gtag('set', 'user_properties', {
          fingerprint_id: ctx.fingerprint_id,
          visitor_id: ctx.visitor_id,
          browser_name: `${ctx.browser_name} ${ctx.browser_version}`.trim(),
          os_name: ctx.os_name,
          device_type: ctx.device_type,
          gpu_renderer: ctx.gpu_renderer,
          screen_res: ctx.screen_res,
          cpu_cores: String(ctx.cpu_cores),
          ram_gb: String(ctx.ram_gb),
          timezone: ctx.timezone,
          locale: ctx.locale,
          visit_count: ctx.visit_count,
          completed_topics: snap.completed_topics_count
        });
      }
    } catch (err) {
      console.warn('Analytics identity sync error:', err);
    }
  }

  /**
   * Safe event dispatching to GA4 (gtag.js / dataLayer) enriched with fingerprint & user context
   */
  function trackEvent(eventName, params = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      const ctx = getUserContext();
      const snap = getLearnerSnapshot();

      const enhancedParams = {
        ...params,
        user_id: ctx.fingerprint_id,
        fingerprint_id: ctx.fingerprint_id,
        visitor_id: ctx.visitor_id,
        session_id: ctx.session_id,
        visit_count: ctx.visit_count,
        device_type: ctx.device_type,
        os_name: ctx.os_name,
        browser_name: ctx.browser_name,
        browser_version: ctx.browser_version,
        gpu_renderer: ctx.gpu_renderer,
        screen_res: ctx.screen_res,
        viewport_res: snap.viewport_res,
        cpu_cores: ctx.cpu_cores,
        ram_gb: ctx.ram_gb,
        timezone: ctx.timezone,
        locale: ctx.locale,
        connection_type: ctx.connection_type,
        ui_theme: snap.ui_theme,
        completed_topics_count: snap.completed_topics_count,
        send_to: getMeasurementId(),
        timestamp: new Date().toISOString()
      };

      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, enhancedParams);
      } else {
        window.dataLayer.push({
          event: eventName,
          ...enhancedParams
        });
      }

      if (window.SD_ANALYTICS_DEBUG) {
        console.log('📊 [GA4 Event]', eventName, enhancedParams);
      }
    } catch (err) {
      console.warn('Analytics event error:', err);
    }
  }

  /**
   * 1. SPA Virtual Pageviews
   */
  function trackPageView(pageTitle, pagePath, pageLocation) {
    const title = pageTitle || document.title;
    const path = pagePath || (window.location.pathname + window.location.hash);
    const location = pageLocation || window.location.href;

    trackEvent('page_view', {
      page_title: title,
      page_path: path,
      page_location: location,
      page_referrer: document.referrer || ''
    });
  }

  /**
   * 2. Content & Topic Tracking
   */
  function trackTopicView({ slug, title, moduleTitle, moduleNumber, partNumber, kind, wordCount, readingTimeMin }) {
    flushTopicEngagementTime();

    activeTopicSlug = slug;
    topicStartTime = Date.now();
    trackedScrollDepths.clear();

    trackEvent('view_item', {
      item_id: slug,
      item_name: title || slug,
      item_category: moduleTitle || `Module ${moduleNumber}`,
      item_category2: partNumber ? `Part ${partNumber}` : '',
      content_type: kind || 'lesson',
      topic_slug: slug,
      module_number: moduleNumber,
      part_number: partNumber || null,
      word_count: wordCount || 0,
      reading_time_min: readingTimeMin || 0
    });
  }

  function trackTopicComplete({ slug, title, totalCompleted, percentage }) {
    trackEvent('complete_topic', {
      topic_slug: slug,
      topic_title: title,
      total_completed: totalCompleted,
      completion_percentage: percentage
    });
  }

  function trackTopicUncomplete({ slug, title }) {
    trackEvent('uncomplete_topic', {
      topic_slug: slug,
      topic_title: title
    });
  }

  function flushTopicEngagementTime() {
    if (activeTopicSlug && topicStartTime) {
      const elapsedSeconds = Math.round((Date.now() - topicStartTime) / 1000);
      if (elapsedSeconds >= 3) {
        trackEvent('user_engagement_topic', {
          topic_slug: activeTopicSlug,
          engagement_time_sec: elapsedSeconds
        });
      }
    }
    topicStartTime = null;
  }

  /**
   * 3. Reading Scroll Depth (25%, 50%, 75%, 100%)
   */
  function handleScroll() {
    if (!activeTopicSlug) return;
    const scrollEl = document.documentElement;
    const scrollTop = window.pageYOffset || scrollEl.scrollTop || 0;
    const docHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    if (docHeight <= 0) return;

    const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (scrollPercent >= milestone && !trackedScrollDepths.has(milestone)) {
        trackedScrollDepths.add(milestone);
        trackEvent('scroll', {
          percent_scrolled: milestone,
          topic_slug: activeTopicSlug
        });
      }
    }
  }

  /**
   * 4. Builds & CodeLab IDE (@innovatorved/code-lab)
   */
  function trackBuildView({ buildId, title }) {
    flushTopicEngagementTime();
    activeTopicSlug = buildId;
    topicStartTime = Date.now();
    trackedScrollDepths.clear();

    trackEvent('view_build', {
      build_id: buildId,
      build_title: title || buildId
    });
  }

  function trackCodeCopy(filename, language = 'unknown', length = 0) {
    trackEvent('copy_code', {
      file_name: filename,
      code_language: language,
      code_length: length,
      current_slug: activeTopicSlug
    });
  }

  function trackCodeLabOpen({ mode, slug, title, language }) {
    trackEvent('codelab_open', {
      codelab_mode: mode || 'inline',
      target_slug: slug || activeTopicSlug || 'unknown',
      codelab_title: title || slug || '',
      code_language: language || 'javascript'
    });
  }

  function trackCodeLabStep({ buildId, stepIndex, stepTitle, action }) {
    trackEvent('codelab_step', {
      build_id: buildId || activeTopicSlug || 'unknown',
      step_index: stepIndex,
      step_title: stepTitle || '',
      step_action: action || 'select'
    });
  }

  function trackCodeLabLangSwitch({ buildId, language }) {
    trackEvent('codelab_language_switch', {
      build_id: buildId || activeTopicSlug || 'unknown',
      code_language: language
    });
  }

  /**
   * 5. Audio Player
   */
  function trackAudioPlay(slug, currentTime = 0) {
    trackEvent('audio_play', {
      audio_slug: slug,
      current_time: Math.round(currentTime)
    });
  }

  function trackAudioPause(slug, currentTime = 0, duration = 0) {
    trackEvent('audio_pause', {
      audio_slug: slug,
      current_time: Math.round(currentTime),
      duration: Math.round(duration)
    });
  }

  function trackAudioSeek(slug, toTime) {
    trackEvent('audio_seek', {
      audio_slug: slug,
      seek_target_time: Math.round(toTime)
    });
  }

  function trackAudioSpeedChange(slug, speed) {
    trackEvent('audio_speed_change', {
      audio_slug: slug,
      playback_rate: speed
    });
  }

  function trackAudioComplete(slug, duration = 0) {
    trackEvent('audio_complete', {
      audio_slug: slug,
      duration: Math.round(duration)
    });
  }

  /**
   * 6. Search
   */
  function trackSearchOpen() {
    trackEvent('search_modal_open', {
      current_slug: activeTopicSlug
    });
  }

  function trackSearch(query, resultCount = 0, trigger = 'input') {
    if (!query || String(query).trim().length < 2) return;
    if (trigger !== 'submit' && trigger !== 'select') return;

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      trackEvent('search', {
        search_term: String(query).trim(),
        results_count: resultCount,
        trigger: trigger
      });
    }, 300);
  }

  function trackSearchQuery(query, resultCount, trigger = 'input') {
    trackSearch(query, resultCount, trigger);
  }

  function trackSearchResultClick({ query, slug, title, position }) {
    trackEvent('select_search_result', {
      search_term: query,
      selected_slug: slug,
      selected_title: title,
      result_position: position
    });
    trackSearch(query, 1, 'select');
  }

  /**
   * 7. Diagram Lightbox
   */
  function trackDiagramOpen(diagramTitle = 'Architecture Diagram') {
    trackEvent('diagram_view', {
      diagram_title: diagramTitle,
      current_slug: activeTopicSlug
    });
  }

  function trackDiagramZoom(action, scale) {
    trackEvent('diagram_zoom', {
      zoom_action: action,
      zoom_scale: Math.round(scale * 100),
      current_slug: activeTopicSlug
    });
  }

  function trackDiagramClose() {
    trackEvent('diagram_close', {
      current_slug: activeTopicSlug
    });
  }

  /**
   * 8. Simulators, Quizzes & Exercises (Concept Check + Napkin Math + Staff Trade-Off)
   */
  const simulatorCooldowns = new Map();
  const SIM_THROTTLE_MS = 1200;

  function trackSimulatorInteraction(simulatorType, action, details = {}) {
    const key = `${simulatorType}::${action}`;
    const now = Date.now();
    const lastTime = simulatorCooldowns.get(key) || 0;
    if (now - lastTime < SIM_THROTTLE_MS) {
      return;
    }
    simulatorCooldowns.set(key, now);

    trackEvent('simulator_interact', {
      simulator_name: simulatorType,
      action_type: action,
      ...details,
      current_slug: activeTopicSlug
    });
  }

  function trackExerciseAttempt(slug, title, selectedIdx, isCorrect) {
    trackEvent('exercise_submit', {
      topic_slug: slug || activeTopicSlug || 'unknown',
      exercise_title: title,
      selected_option_index: selectedIdx,
      is_correct: isCorrect
    });
  }

  function trackQuizCheck({ slug, questionId, questionType, isCorrect, slideIndex, userAnswer }) {
    trackEvent('quiz_answer_check', {
      topic_slug: slug || activeTopicSlug || 'unknown',
      question_id: questionId || '',
      question_type: questionType || 'mcq',
      is_correct: Boolean(isCorrect),
      slide_index: slideIndex ?? 0,
      user_answer: String(userAnswer ?? '').slice(0, 64)
    });
  }

  function trackQuizSlideNavigate({ slug, action, slideIndex, questionType }) {
    trackEvent('quiz_slide_navigate', {
      topic_slug: slug || activeTopicSlug || 'unknown',
      nav_action: action || 'next',
      slide_index: slideIndex ?? 0,
      question_type: questionType || 'mcq'
    });
  }

  function trackQuizHintToggle({ slug, questionId, questionType }) {
    trackEvent('quiz_hint_open', {
      topic_slug: slug || activeTopicSlug || 'unknown',
      question_id: questionId || '',
      question_type: questionType || 'mcq'
    });
  }

  function trackQuizComplete({ slug, score, totalQuestions, percentage }) {
    trackEvent('quiz_complete', {
      topic_slug: slug || activeTopicSlug || 'unknown',
      quiz_score: score,
      total_questions: totalQuestions,
      quiz_percentage: percentage
    });
  }

  /**
   * 9. Production Incident Challenges (/challenges)
   */
  function trackChallengeSelect({ challengeId, title, severity }) {
    trackEvent('challenge_select', {
      challenge_id: challengeId,
      challenge_title: title || challengeId,
      severity: severity || 'SEV-1'
    });
  }

  function trackChallengeMitigation({ challengeId, mitigationId, enabled }) {
    trackEvent('challenge_mitigation_toggle', {
      challenge_id: challengeId,
      mitigation_id: mitigationId,
      mitigation_enabled: Boolean(enabled)
    });
  }

  function trackChallengeRootCause({ challengeId, rootCauseId }) {
    trackEvent('challenge_root_cause_select', {
      challenge_id: challengeId,
      root_cause_id: rootCauseId
    });
  }

  function trackChallengeVerify({ challengeId, passed, score, attempts, rootCauseCorrect, hotfixPassed }) {
    trackEvent('challenge_verify', {
      challenge_id: challengeId,
      incident_resolved: Boolean(passed),
      incident_score: score || 0,
      attempt_number: attempts || 1,
      root_cause_correct: Boolean(rootCauseCorrect),
      hotfix_verified: Boolean(hotfixPassed)
    });
  }

  function trackChallengeHotfix({ challengeId, action }) {
    trackEvent('challenge_hotfix', {
      challenge_id: challengeId,
      hotfix_action: action || 'open'
    });
  }

  /**
   * 10. Architecture Sandbox (/sandbox)
   */
  function trackSandboxBlueprint({ blueprintId, title, targetQps }) {
    trackEvent('sandbox_blueprint_load', {
      blueprint_id: blueprintId,
      blueprint_title: title || blueprintId,
      target_qps: targetQps || 0
    });
  }

  function trackSandboxAction({ action, details = {} }) {
    trackEvent('sandbox_action', {
      sandbox_action: action,
      ...details
    });
  }

  /**
   * 11. Dashboard, SRS Flashcards, Reference Toolkit & Roadmap
   */
  function trackDashboardTab({ tabName }) {
    trackEvent('dashboard_tab_switch', {
      dashboard_tab: tabName
    });
  }

  function trackSrsReview({ cardId, slug, rating, intervalDays }) {
    trackEvent('srs_card_review', {
      card_id: cardId || '',
      topic_slug: slug || '',
      srs_rating: rating,
      next_interval_days: intervalDays || 0
    });
  }

  function trackToolkitUse({ tool, action, details = {} }) {
    trackEvent('toolkit_use', {
      toolkit_tool: tool,
      toolkit_action: action,
      ...details
    });
  }

  function trackRoadmapTrackSelect({ trackId }) {
    trackEvent('roadmap_track_select', {
      track_id: trackId
    });
  }

  function trackRoadmapNodeClick({ slug, moduleId }) {
    trackEvent('roadmap_node_click', {
      topic_slug: slug,
      module_id: moduleId || ''
    });
  }

  /**
   * 12. GitHub Repo, Projects & Outbound Links
   */
  function trackFeedbackReportClick({ slug, issueUrl }) {
    trackEvent('click_report_issue', {
      topic_slug: slug || activeTopicSlug || 'unknown',
      issue_url: issueUrl
    });
  }

  function trackProjectView({ projectId, title, projectUrl }) {
    trackEvent('view_project', {
      project_id: projectId,
      project_title: title || projectId,
      project_url: projectUrl || ''
    });
  }

  function trackRepoClick(placement) {
    trackEvent('click_github_repo', {
      repo_name: 'system-design-in-depth',
      repo_url: 'https://github.com/innovatorved/system-design-in-depth',
      placement: placement || 'unknown',
      current_slug: activeTopicSlug
    });
  }

  function trackOutboundClick(url, linkText = '', context = '') {
    trackEvent('outbound_click', {
      destination_url: url,
      link_text: linkText.slice(0, 100),
      context: context,
      current_slug: activeTopicSlug
    });
  }

  function trackVideoPlay(youtubeId, title) {
    trackEvent('video_play', {
      video_id: youtubeId,
      video_title: title,
      video_provider: 'youtube',
      current_slug: activeTopicSlug
    });
  }

  /**
   * 13. UI Preferences & Tabs
   */
  function trackThemeChange(theme) {
    trackEvent('toggle_theme', {
      theme: theme
    });
  }

  function trackTabSwitch(tabName) {
    trackEvent('switch_tab', {
      tab_name: tabName
    });
  }

  function trackModuleToggle(moduleId, isExpanded) {
    trackEvent('toggle_module', {
      module_id: moduleId,
      is_expanded: isExpanded
    });
  }

  function trackLessonFeedback({ slug, vote }) {
    trackEvent('lesson_feedback', {
      topic_slug: slug,
      feedback_vote: vote,
      event_category: 'engagement'
    });
  }

  /**
   * Setup global automatic event delegation & session initialization
   */
  function init() {
    // 1. Initialize deterministic fingerprint & sync user properties to GA4
    syncUserIdentityToGA4();
    const ctx = getUserContext();
    trackEvent('session_context_init', {
      fingerprint_id: ctx.fingerprint_id,
      visitor_id: ctx.visitor_id,
      session_id: ctx.session_id,
      canvas_fp: ctx.canvas_fp,
      webgl_fp: ctx.webgl_fp,
      gpu_vendor: ctx.gpu_vendor,
      gpu_renderer: ctx.gpu_renderer
    });

    // 2. Listen for Enter key submit on search input
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = document.getElementById('search-input');
        if (input && document.activeElement === input && input.value.trim().length >= 2) {
          const results = document.querySelectorAll('.search-result');
          trackSearch(input.value, results.length, 'submit');
        }
      }
    });

    // 3. Scroll depth tracking with throttling
    let scrollThrottle = null;
    window.addEventListener('scroll', () => {
      if (!scrollThrottle) {
        scrollThrottle = setTimeout(() => {
          handleScroll();
          scrollThrottle = null;
        }, 200);
      }
    }, { passive: true });

    // 4. Flush engagement time on beforeunload / visibilitychange
    window.addEventListener('beforeunload', flushTopicEngagementTime);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushTopicEngagementTime();
      } else if (activeTopicSlug) {
        topicStartTime = Date.now();
      }
    });

    // 5. Delegated click tracking across simulators, hints, repo & outbound links
    document.addEventListener('click', (e) => {
      // Interactive simulator button click tracking
      const simBtn = e.target.closest('.sim-card button, .sim-card input[type="button"], .sim-card input[type="submit"], .sim-card .btn');
      if (simBtn && !simBtn.classList.contains('code-block__copy-btn')) {
        const simCard = simBtn.closest('.sim-card');
        const simTitle = simCard?.querySelector('.sim-card__title, h3, h4')?.textContent?.trim() || 'simulator';
        const actionText = simBtn.textContent?.trim() || simBtn.id || 'interact';
        trackSimulatorInteraction(simTitle, actionText, {
          button_id: simBtn.id || null,
          current_slug: activeTopicSlug
        });
      }

      // Quiz hint <details> toggle tracking
      const hintSummary = e.target.closest('.quiz-hint-details summary');
      if (hintSummary) {
        const slide = hintSummary.closest('.check-slider__slide');
        trackQuizHintToggle({
          slug: activeTopicSlug,
          questionId: slide?.dataset?.qid || '',
          questionType: slide?.dataset?.type || 'mcq'
        });
      }

      // Link tracking
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href') || '';
      const text = anchor.textContent?.trim() || '';

      // Check if it's the issue report link
      if (href.includes('github.com') && href.includes('/issues/new')) {
        trackFeedbackReportClick({ slug: activeTopicSlug, issueUrl: href });
        return;
      }

      // Check if it's the repository link
      if (href.includes('system-design-in-depth')) {
        const placement = anchor.dataset.repoPlacement ||
                          (anchor.closest('.topbar') ? 'topbar' :
                           anchor.closest('.hero') ? 'hero' : 'body');
        trackRepoClick(placement);
        return;
      }

      // Outbound external links
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        const context = anchor.closest('.further-reading') ? 'further_reading' :
                        anchor.closest('.hero') ? 'hero' :
                        anchor.closest('.topbar') ? 'topbar' : 'prose';
        trackOutboundClick(href, text, context);
      }
    });
  }

  return {
    init,
    getUserContext,
    getActiveTopicSlug: () => activeTopicSlug,
    trackEvent,
    trackPageView,
    trackTopicView,
    trackTopicComplete,
    trackTopicUncomplete,
    trackLessonFeedback,
    trackFeedbackReportClick,
    trackBuildView,
    trackProjectView,
    trackCodeCopy,
    trackCodeLabOpen,
    trackCodeLabStep,
    trackCodeLabLangSwitch,
    trackAudioPlay,
    trackAudioPause,
    trackAudioSeek,
    trackAudioSpeedChange,
    trackAudioComplete,
    trackSearchOpen,
    trackSearch,
    trackSearchQuery,
    trackSearchResultClick,
    trackDiagramOpen,
    trackDiagramZoom,
    trackDiagramClose,
    trackSimulatorInteraction,
    trackExerciseAttempt,
    trackQuizCheck,
    trackQuizSlideNavigate,
    trackQuizHintToggle,
    trackQuizComplete,
    trackChallengeSelect,
    trackChallengeMitigation,
    trackChallengeRootCause,
    trackChallengeVerify,
    trackChallengeHotfix,
    trackSandboxBlueprint,
    trackSandboxAction,
    trackDashboardTab,
    trackSrsReview,
    trackToolkitUse,
    trackRoadmapTrackSelect,
    trackRoadmapNodeClick,
    trackRepoClick,
    trackOutboundClick,
    trackVideoPlay,
    trackThemeChange,
    trackTabSwitch,
    trackModuleToggle
  };
})();
