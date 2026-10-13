/**
 * System Design In Depth — 404 Page Helper
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('sd-theme', next); } catch {}
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#000000' : '#ffffff');
    });
  }

  const searchForm = document.querySelector('.not-found-search');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('error-search-input')?.value.trim();
      if (!q) {
        window.location.href = '/';
      } else {
        window.location.href = '/?q=' + encodeURIComponent(q);
      }
    });
  }
});
