/* ═══════════════════════════════════════════════════════════════
   Progress Tracking v2 — localStorage-based learning progress
   Migrates from v1 (sd-progress) on first load.
   ═══════════════════════════════════════════════════════════════ */

window.Progress = (() => {
  const V1_KEY = 'sd-progress';
  const V2_KEY = 'sd-progress-v2';

  function defaultState() {
    return {
      version: 2,
      completed: [],
      lastVisited: null,
      startedAt: null,
      timeOnUnit: {},
      quiz: {},
      srs: {},
      streak: { current: 0, longest: 0, lastActiveDay: null },
      notes: {},
      bookmarks: []
    };
  }

  let state = defaultState();
  let timerSlug = null;
  let timerStart = null;

  // ── Persistence ──────────────────────────────────────────

  function load() {
    try {
      const raw = localStorage.getItem(V2_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(defaultState(), parsed);
        state.version = 2;
        if (!Array.isArray(state.completed)) state.completed = [];
        if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
      } else {
        // Migrate from v1 if it exists
        migrateFromV1();
      }
    } catch {
      state = defaultState();
    }
  }

  function migrateFromV1() {
    try {
      const raw = localStorage.getItem(V1_KEY);
      if (!raw) return;
      const v1 = JSON.parse(raw);
      state.completed = Array.isArray(v1.completed) ? [...v1.completed] : [];
      state.lastVisited = v1.lastVisited || null;
      state.startedAt = v1.startedAt || null;
      save();
      // Never delete v1 — keep it as a backup
    } catch {
      // v1 data is corrupt, start fresh
    }
  }

  function save() {
    try {
      localStorage.setItem(V2_KEY, JSON.stringify(state));
    } catch {}
  }

  // ── Completion tracking ──────────────────────────────────

  function isCompleted(slug) {
    return state.completed.includes(slug);
  }

  function toggleComplete(slug) {
    const idx = state.completed.indexOf(slug);
    if (idx >= 0) {
      state.completed.splice(idx, 1);
    } else {
      state.completed.push(slug);
      updateStreak();
    }
    save();
    updateProgressUI();
    return isCompleted(slug);
  }

  function markComplete(slug) {
    if (!state.completed.includes(slug)) {
      state.completed.push(slug);
      updateStreak();
      save();
      updateProgressUI();
    }
  }

  // ── Navigation ───────────────────────────────────────────

  function setLastVisited(slug) {
    state.lastVisited = slug;
    if (!state.startedAt) state.startedAt = new Date().toISOString();
    save();
  }

  function getLastVisited() {
    return state.lastVisited;
  }

  // ── Counts & percentages ─────────────────────────────────

  function getCompletedCount() {
    return state.completed.length;
  }

  function getTotalUnits() {
    if (!window.CURRICULUM_DATA) return 200;
    return window.CURRICULUM_DATA.stats.units;
  }

  function getPercentage() {
    const total = getTotalUnits();
    if (total === 0) return 0;
    return Math.round((state.completed.length / total) * 100);
  }

  function getModuleProgress(moduleId) {
    if (!window.CURRICULUM_DATA) return { completed: 0, total: 0 };
    let total = 0;
    let completed = 0;
    for (const part of window.CURRICULUM_DATA.parts) {
      for (const mod of part.modules) {
        if (mod.id === moduleId) {
          total = mod.units.length;
          completed = mod.units.filter(u => state.completed.includes(u.slug)).length;
          return { completed, total };
        }
      }
    }
    return { completed, total };
  }

  // ── Time-on-unit tracking ────────────────────────────────

  function startTimer(slug) {
    stopTimer(); // flush any active timer
    timerSlug = slug;
    timerStart = Date.now();
  }

  function stopTimer() {
    if (timerSlug && timerStart) {
      const elapsed = Math.round((Date.now() - timerStart) / 1000);
      if (elapsed > 0 && elapsed < 7200) { // cap at 2 hours to avoid idle tabs
        state.timeOnUnit[timerSlug] = (state.timeOnUnit[timerSlug] || 0) + elapsed;
        save();
      }
    }
    timerSlug = null;
    timerStart = null;
  }

  function getTimeOnUnit(slug) {
    return state.timeOnUnit[slug] || 0;
  }

  // ── Quiz tracking ────────────────────────────────────────

  function recordQuizAttempt(questionId, correct) {
    if (!state.quiz[questionId]) {
      state.quiz[questionId] = { attempts: 0, correct: false, lastAt: null };
    }
    state.quiz[questionId].attempts++;
    state.quiz[questionId].correct = correct;
    state.quiz[questionId].lastAt = new Date().toISOString();
    if (correct) updateStreak();
    save();
  }

  function getQuizResult(questionId) {
    return state.quiz[questionId] || null;
  }

  // ── SRS (spaced repetition) ──────────────────────────────

  function getSrsState(cardId) {
    return state.srs[cardId] || null;
  }

  function updateSrs(cardId, srsData) {
    state.srs[cardId] = srsData;
    save();
  }

  function getDueCardIds() {
    const now = new Date().toISOString();
    const due = [];
    for (const [id, data] of Object.entries(state.srs)) {
      if (!data.dueAt || data.dueAt <= now) {
        due.push(id);
      }
    }
    return due;
  }

  // ── Streak tracking ─────────────────────────────────────

  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (state.streak.lastActiveDay === today) return; // already counted today

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.streak.lastActiveDay === yesterday) {
      state.streak.current++;
    } else if (state.streak.lastActiveDay !== today) {
      state.streak.current = 1;
    }
    state.streak.lastActiveDay = today;
    if (state.streak.current > state.streak.longest) {
      state.streak.longest = state.streak.current;
    }
    save();
  }

  function getStreak() {
    // Check if streak is still active
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.streak.lastActiveDay !== today && state.streak.lastActiveDay !== yesterday) {
      // Streak broken
      return { current: 0, longest: state.streak.longest };
    }
    return { current: state.streak.current, longest: state.streak.longest };
  }

  // ── Bookmarks ────────────────────────────────────────────

  function isBookmarked(slug) {
    return state.bookmarks.includes(slug);
  }

  function toggleBookmark(slug) {
    const idx = state.bookmarks.indexOf(slug);
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
    } else {
      state.bookmarks.push(slug);
    }
    save();
    return isBookmarked(slug);
  }

  function getBookmarks() {
    return [...state.bookmarks];
  }

  // ── Notes ────────────────────────────────────────────────

  function setNote(slug, markdown) {
    if (markdown && markdown.trim()) {
      state.notes[slug] = markdown;
    } else {
      delete state.notes[slug];
    }
    save();
  }

  function getNote(slug) {
    return state.notes[slug] || '';
  }

  // ── Export / Import ──────────────────────────────────────

  function exportData() {
    return JSON.stringify(state, null, 2);
  }

  function importData(json) {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || parsed.version !== 2) {
        throw new Error('Invalid progress data: expected version 2');
      }
      if (!Array.isArray(parsed.completed)) {
        throw new Error('Invalid progress data: completed must be an array');
      }
      state = Object.assign(defaultState(), parsed);
      save();
      updateProgressUI();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ── UI update ────────────────────────────────────────────

  function updateProgressUI() {
    const pct = getPercentage();
    const textEl = document.getElementById('progress-text');
    const ringEl = document.getElementById('progress-ring-fill');
    if (textEl) textEl.textContent = pct + '%';
    if (ringEl) {
      const circumference = 2 * Math.PI * 8;
      const offset = circumference - (pct / 100) * circumference;
      ringEl.style.strokeDashoffset = offset;
    }
  }

  // ── Flush timer on page unload ───────────────────────────

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopTimer);
    // Also flush periodically in case of crashes
    setInterval(() => {
      if (timerSlug && timerStart) {
        const elapsed = Math.round((Date.now() - timerStart) / 1000);
        if (elapsed > 0 && elapsed < 7200) {
          state.timeOnUnit[timerSlug] = (state.timeOnUnit[timerSlug] || 0) + elapsed;
          timerStart = Date.now(); // reset so we don't double-count
          save();
        }
      }
    }, 60000); // flush every 60 seconds
  }

  // Initialize
  load();

  return {
    // v1 API (backward compatible)
    isCompleted,
    toggleComplete,
    markComplete,
    setLastVisited,
    getLastVisited,
    getCompletedCount,
    getTotalUnits,
    getPercentage,
    getModuleProgress,
    updateProgressUI,
    // v2 additions
    startTimer,
    stopTimer,
    getTimeOnUnit,
    recordQuizAttempt,
    getQuizResult,
    getSrsState,
    updateSrs,
    getDueCardIds,
    getStreak,
    isBookmarked,
    toggleBookmark,
    getBookmarks,
    setNote,
    getNote,
    exportData,
    importData
  };
})();
