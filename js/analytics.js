/* ═══════════════════════════════════════════════════════════════
   GA4 Analytics Engine — Complete event & lifecycle tracking
   ═══════════════════════════════════════════════════════════════ */

window.Analytics = (() => {
  // Config: Active GA4 Measurement ID
  const DEFAULT_ID = 'G-SZ26BQZCQ7';
  
  // State
  let activeTopicSlug = null;
  let topicStartTime = null;
  const trackedScrollDepths = new Set();
  let searchDebounceTimer = null;

  /**
   * Helper to get active GA4 measurement ID
   */
  function getMeasurementId() {
    return window.GA_MEASUREMENT_ID || DEFAULT_ID;
  }

  /**
   * Cloudflare Web Analytics initialization (beacon.min.js)
   * Supports automatic injection by Cloudflare Pages/proxy or explicit token via window.CF_BEACON_TOKEN.
   */
  let cfBeaconInjected = false;
  function initCloudflareAnalytics() {
    if (cfBeaconInjected || document.querySelector('script[src*="cloudflareinsights.com/beacon"]')) {
      return;
    }
    const token = window.CF_BEACON_TOKEN;
    if (token) {
      cfBeaconInjected = true;
      const script = document.createElement('script');
      script.defer = true;
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      script.setAttribute('data-cf-beacon', JSON.stringify({ token: token, spa: true }));
      document.head.appendChild(script);
      if (window.SD_ANALYTICS_DEBUG) {
        console.log('⚡ [Cloudflare Analytics] Beacon loaded with token:', token);
      }
    }
  }

  /**
   * Safe event dispatching to GA4 (gtag.js / dataLayer)
   */
  function trackEvent(eventName, params = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      const enhancedParams = {
        ...params,
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
    // Flush previous topic time
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
   * 4. Builds & Code
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

  function trackSearchQuery(query, resultCount) {
    if (!query || query.trim().length < 2) return;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      trackEvent('search', {
        search_term: query.trim(),
        results_count: resultCount
      });
    }, 600);
  }

  function trackSearchResultClick({ query, slug, title, position }) {
    trackEvent('select_search_result', {
      search_term: query,
      selected_slug: slug,
      selected_title: title,
      result_position: position
    });
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
   * 8. Simulators & Exercises
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

  function trackQuizComplete({ slug, score, totalQuestions, percentage }) {
    trackEvent('quiz_complete', {
      topic_slug: slug || activeTopicSlug || 'unknown',
      quiz_score: score,
      total_questions: totalQuestions,
      quiz_percentage: percentage
    });
  }

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

  /**
   * 9. GitHub Repo & Outbound Links
   * Target: https://github.com/innovatorved/system-design-in-depth
   */
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
   * 10. UI Preferences & Tabs
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

  /**
   * Setup global automatic event delegation
   */
  function init() {
    // Initialize Cloudflare Web Analytics beacon if configured
    initCloudflareAnalytics();

    // Scroll depth tracking with throttling
    let scrollThrottle = null;
    window.addEventListener('scroll', () => {
      if (!scrollThrottle) {
        scrollThrottle = setTimeout(() => {
          handleScroll();
          scrollThrottle = null;
        }, 200);
      }
    }, { passive: true });

    // Flush engagement time on beforeunload / visibilitychange
    window.addEventListener('beforeunload', flushTopicEngagementTime);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushTopicEngagementTime();
      } else if (activeTopicSlug) {
        topicStartTime = Date.now();
      }
    });

    // Delegated click delegation for companion repo, feedback issues & outbound links
    document.addEventListener('click', (e) => {
      // 1. Interactive simulator button click tracking (all simulators)
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

      // 2. Link tracking
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

  function trackLessonFeedback({ slug, vote }) {
    trackEvent('lesson_feedback', {
      topic_slug: slug,
      feedback_vote: vote,
      event_category: 'engagement'
    });
  }

  return {
    init,
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
    trackAudioPlay,
    trackAudioPause,
    trackAudioSeek,
    trackAudioSpeedChange,
    trackAudioComplete,
    trackSearchOpen,
    trackSearchQuery,
    trackSearchResultClick,
    trackDiagramOpen,
    trackDiagramZoom,
    trackDiagramClose,
    trackSimulatorInteraction,
    trackExerciseAttempt,
    trackQuizComplete,
    trackRepoClick,
    trackOutboundClick,
    trackVideoPlay,
    trackThemeChange,
    trackTabSwitch,
    trackModuleToggle
  };
})();

