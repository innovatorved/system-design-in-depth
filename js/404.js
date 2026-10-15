/**
 * System Design In Depth — 404 Page Helper
 */
document.addEventListener('DOMContentLoaded', () => {
  const syncThemeIcons = (theme) => {
    const sun = document.querySelector('#theme-toggle .icon-sun');
    const moon = document.querySelector('#theme-toggle .icon-moon');
    if (sun && moon) {
      sun.style.display = theme === 'dark' ? 'block' : 'none';
      moon.style.display = theme === 'dark' ? 'none' : 'block';
    }
  };

  syncThemeIcons(document.documentElement.getAttribute('data-theme') || 'dark');

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('sd-theme', next); } catch {}
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#000000' : '#ffffff');
      syncThemeIcons(next);
    });
  }

  // Hydrate topbar progress pill from saved progress
  try {
    const p = JSON.parse(localStorage.getItem('sd-progress-v2') || localStorage.getItem('sd-progress') || '{}') || {};
    const completed = Array.isArray(p.completed) ? p.completed : [];
    const total = (window.SITE_COUNTS && window.SITE_COUNTS.topics) || 200;
    const pct = Math.round((completed.length / total) * 100);
    const text = document.getElementById('progress-text');
    const ring = document.getElementById('progress-ring-fill');
    if (text) text.textContent = pct + '%';
    if (ring) ring.style.strokeDashoffset = 2 * Math.PI * 8 * (1 - pct / 100);
  } catch {}

  const searchInput = document.getElementById('error-search-input');
  const searchTrigger = document.getElementById('search-trigger');
  if (searchTrigger && searchInput) {
    searchTrigger.addEventListener('click', () => {
      searchInput.focus();
      searchInput.select();
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  const searchForm = document.querySelector('.not-found-search');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput?.value.trim();
      if (!q) {
        window.location.href = '/';
      } else {
        window.location.href = '/?q=' + encodeURIComponent(q);
      }
    });
  }
});
