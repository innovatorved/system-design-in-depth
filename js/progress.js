/* ═══════════════════════════════════════════════════════════════
   Progress Tracking — localStorage-based completion tracking
   ═══════════════════════════════════════════════════════════════ */

window.Progress = (() => {
  const STORAGE_KEY = 'sd-progress';

  let state = {
    completed: [],
    lastVisited: null,
    startedAt: null
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        if (!Array.isArray(state.completed)) state.completed = [];
      }
    } catch {
      state = { completed: [], lastVisited: null, startedAt: null };
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function isCompleted(slug) {
    return state.completed.includes(slug);
  }

  function toggleComplete(slug) {
    const idx = state.completed.indexOf(slug);
    if (idx >= 0) {
      state.completed.splice(idx, 1);
    } else {
      state.completed.push(slug);
    }
    save();
    updateProgressUI();
    return isCompleted(slug);
  }

  function markComplete(slug) {
    if (!state.completed.includes(slug)) {
      state.completed.push(slug);
      save();
      updateProgressUI();
    }
  }

  function setLastVisited(slug) {
    state.lastVisited = slug;
    if (!state.startedAt) state.startedAt = new Date().toISOString();
    save();
  }

  function getLastVisited() {
    return state.lastVisited;
  }

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

  // Initialize
  load();

  return {
    isCompleted,
    toggleComplete,
    markComplete,
    setLastVisited,
    getLastVisited,
    getCompletedCount,
    getTotalUnits,
    getPercentage,
    getModuleProgress,
    updateProgressUI
  };
})();
