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
      bookmarks: [],
      xp: 0
    };
  }

  let state = defaultState();
  let timerSlug = null;
  let timerStart = null;

  // ── Persistence ──────────────────────────────────────────

  function validateAndSanitize(parsed) {
    const def = defaultState();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return def;
    }

    const clean = { ...def };

    if (typeof parsed.xp === 'number' && !isNaN(parsed.xp) && parsed.xp >= 0) {
      clean.xp = Math.round(parsed.xp);
    }

    if (Array.isArray(parsed.completed)) {
      clean.completed = parsed.completed.filter(item => typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof parsed.lastVisited === 'string') {
      clean.lastVisited = parsed.lastVisited;
    }
    if (typeof parsed.startedAt === 'string') {
      clean.startedAt = parsed.startedAt;
    }
    if (parsed.timeOnUnit && typeof parsed.timeOnUnit === 'object' && !Array.isArray(parsed.timeOnUnit)) {
      const cleanTime = {};
      for (const [k, v] of Object.entries(parsed.timeOnUnit)) {
        if (typeof k === 'string' && typeof v === 'number' && !isNaN(v) && v >= 0) {
          cleanTime[k] = v;
        }
      }
      clean.timeOnUnit = cleanTime;
    }
    if (parsed.quiz && typeof parsed.quiz === 'object' && !Array.isArray(parsed.quiz)) {
      const cleanQuiz = {};
      for (const [k, v] of Object.entries(parsed.quiz)) {
        if (typeof k === 'string' && v && typeof v === 'object' && !Array.isArray(v)) {
          cleanQuiz[k] = {
            attempts: typeof v.attempts === 'number' && !isNaN(v.attempts) && v.attempts >= 0 ? v.attempts : 0,
            correct: Boolean(v.correct),
            lastAt: typeof v.lastAt === 'string' ? v.lastAt : null
          };
        }
      }
      clean.quiz = cleanQuiz;
    }
    if (parsed.srs && typeof parsed.srs === 'object' && !Array.isArray(parsed.srs)) {
      const cleanSrs = {};
      for (const [k, v] of Object.entries(parsed.srs)) {
        if (typeof k === 'string' && v && typeof v === 'object' && !Array.isArray(v)) {
          cleanSrs[k] = v;
        }
      }
      clean.srs = cleanSrs;
    }
    if (parsed.streak && typeof parsed.streak === 'object' && !Array.isArray(parsed.streak)) {
      clean.streak = {
        current: typeof parsed.streak.current === 'number' && !isNaN(parsed.streak.current) && parsed.streak.current >= 0 ? parsed.streak.current : 0,
        longest: typeof parsed.streak.longest === 'number' && !isNaN(parsed.streak.longest) && parsed.streak.longest >= 0 ? parsed.streak.longest : 0,
        lastActiveDay: typeof parsed.streak.lastActiveDay === 'string' ? parsed.streak.lastActiveDay : null
      };
    }
    if (parsed.notes && typeof parsed.notes === 'object' && !Array.isArray(parsed.notes)) {
      const cleanNotes = {};
      for (const [k, v] of Object.entries(parsed.notes)) {
        if (typeof k === 'string' && typeof v === 'string') {
          cleanNotes[k] = v;
        }
      }
      clean.notes = cleanNotes;
    }
    if (Array.isArray(parsed.bookmarks)) {
      clean.bookmarks = parsed.bookmarks.filter(item => typeof item === 'string' && item.trim().length > 0);
    }

    return clean;
  }

  function load() {
    try {
      const raw = localStorage.getItem(V2_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = validateAndSanitize(parsed);
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
      state.completed = Array.isArray(v1.completed) ? v1.completed.filter(item => typeof item === 'string') : [];
      state.lastVisited = typeof v1.lastVisited === 'string' ? v1.lastVisited : null;
      state.startedAt = typeof v1.startedAt === 'string' ? v1.startedAt : null;
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
    if (!slug || typeof slug !== 'string') return false;
    if (state.completed.includes(slug)) return true;
    if (state.completed.includes('challenge:' + slug) ||
        state.completed.includes('exam:' + slug) ||
        state.completed.includes('build:' + slug)) {
      return true;
    }
    const prefixes = ['challenge:', 'exam:', 'build:'];
    for (const prefix of prefixes) {
      if (slug.startsWith(prefix) && state.completed.includes(slug.slice(prefix.length))) {
        return true;
      }
    }
    return false;
  }

  function toggleComplete(slug) {
    if (!slug || typeof slug !== 'string') return false;
    let idx = state.completed.indexOf(slug);
    if (idx < 0) {
      const candidates = [
        'challenge:' + slug, 'exam:' + slug, 'build:' + slug,
        slug.replace(/^(challenge|exam|build):/, '')
      ];
      for (const c of candidates) {
        idx = state.completed.indexOf(c);
        if (idx >= 0) break;
      }
    }
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
    if (!slug || typeof slug !== 'string') return;
    if (!isCompleted(slug)) {
      state.completed.push(slug);
      updateStreak();
      save();
      updateProgressUI();
    }
  }

  function getXP() {
    let xp = typeof state.xp === 'number' && !isNaN(state.xp) ? state.xp : 0;

    for (const item of state.completed) {
      if (typeof item !== 'string') continue;
      if (item.startsWith('challenge:')) {
        const chId = item.slice('challenge:'.length);
        const list = (typeof window !== 'undefined' && window.CHALLENGES_DATA) || [];
        const ch = Array.isArray(list) ? list.find(c => c.id === chId) : null;
        xp += ch?.xp || 200;
      } else if (item.startsWith('exam:')) {
        const exId = item.slice('exam:'.length);
        const list = (typeof window !== 'undefined' && window.EXAMS_DATA) || [];
        const ex = Array.isArray(list) ? list.find(e => e.id === exId) : null;
        xp += ex?.xpReward || 400;
      } else if (item.startsWith('build:')) {
        xp += 150;
      } else {
        xp += 50;
      }
    }

    if (state.quiz) {
      for (const q of Object.values(state.quiz)) {
        if (q && q.correct) xp += 10;
      }
    }

    if (state.srs) {
      for (const card of Object.values(state.srs)) {
        if (card && (card.repetition > 0 || card.interval > 0)) {
          xp += 5;
        }
      }
    }

    const streak = getStreak();
    if (streak && streak.current > 0) {
      xp += Math.min(streak.current, 30) * 10;
    }

    return xp;
  }

  function addXP(amount, reason) {
    if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
      state.xp = (state.xp || 0) + Math.round(amount);
      save();
    }
    return getXP();
  }

  function getTimeSpent() {
    let totalSeconds = 0;
    if (state.timeOnUnit) {
      for (const s of Object.values(state.timeOnUnit)) {
        if (typeof s === 'number' && !isNaN(s) && s > 0) {
          totalSeconds += s;
        }
      }
    }
    if (timerSlug && timerStart) {
      const activeElapsed = Math.round((Date.now() - timerStart) / 1000);
      if (activeElapsed > 0 && activeElapsed < 7200) {
        totalSeconds += activeElapsed;
      }
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return { totalSeconds, formatted };
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
    if (window.CURRICULUM_DATA?.stats?.units) return window.CURRICULUM_DATA.stats.units;
    if (window.SITE_COUNTS?.topics) return window.SITE_COUNTS.topics;
    return 200;
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
      if (!parsed || (parsed.version && parsed.version !== 2)) {
        throw new Error('Invalid progress data: expected version 2');
      }
      state = validateAndSanitize(parsed);
      save();
      updateProgressUI();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ── UI update ────────────────────────────────────────────

  function updateProgressUI() {
    if (typeof document === 'undefined') return;
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

  if (typeof window !== 'undefined') {
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('beforeunload', stopTimer);
    }
    const periodicTimer = setInterval(() => {
      if (timerSlug && timerStart) {
        const elapsed = Math.round((Date.now() - timerStart) / 1000);
        if (elapsed > 0 && elapsed < 7200) {
          state.timeOnUnit[timerSlug] = (state.timeOnUnit[timerSlug] || 0) + elapsed;
          timerStart = Date.now(); // reset so we don't double-count
          save();
        }
      }
    }, 60000); // flush every 60 seconds
    if (periodicTimer && typeof periodicTimer.unref === 'function') {
      periodicTimer.unref();
    }
  }

  // Initialize
  load();

  return {
    // v1 API (backward compatible)
    load,
    save,
    loadProgress: load,
    saveProgress: save,
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
    updateStreak,
    getXP,
    addXP,
    getTimeSpent,
    isBookmarked,
    toggleBookmark,
    getBookmarks,
    setNote,
    getNote,
    exportData,
    importData
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.Progress;
}

