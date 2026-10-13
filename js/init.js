/**
 * System Design In Depth — Synchronous Head Initializer
 * Runs in <head> before paint to eliminate FOUC, enforce canonical host,
 * configure Google Consent Mode v2, and set up analytics foundations.
 */
(() => {
  // 1. Canonical domain enforcement
  const targetHost = 'system-design-in-depth.vedgupta.in';
  const host = window.location.hostname;
  const isLocal = host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host);

  if (!isLocal && (host !== targetHost || window.location.protocol !== 'https:')) {
    window.location.replace('https://' + targetHost + window.location.pathname + window.location.search + window.location.hash);
    return;
  }

  // 2. Route & Shell class (deep links skip prerendered landing hero)
  const isDeepLink = location.hash.length > 1 || location.pathname !== '/';
  if (isDeepLink) {
    document.documentElement.classList.add('no-shell');
  }

  // 3. Theme initialization (prevent FOUC)
  try {
    const stored = localStorage.getItem('sd-theme');
    const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#000000' : '#ffffff');
  } catch {}

  // 4. Google Analytics 4 & Consent Mode v2 (GDPR / DPDP compliant)
  window.GA_MEASUREMENT_ID = 'G-SZ26BQZCQ7';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  let consentGranted = false;
  try {
    consentGranted = localStorage.getItem('sd-consent') === 'granted';
  } catch {}

  gtag('consent', 'default', {
    'analytics_storage': consentGranted ? 'granted' : 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  gtag('js', new Date());
  gtag('config', 'G-SZ26BQZCQ7', {
    send_page_view: false // Handled dynamically on SPA route changes by js/analytics.js
  });

  // 5. Cloudflare Web Analytics token placeholder
  window.CF_BEACON_TOKEN = window.CF_BEACON_TOKEN || '';

  // 6. DOM-dependent initializations before first paint
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.documentElement.classList.contains('no-shell')) {
      document.body.classList.add('view-landing');
    }

    // Personalize prerendered landing shell and progress indicator from saved state
    const shell = document.querySelector('.landing-shell');
    if (shell) {
      try {
        const p = JSON.parse(localStorage.getItem('sd-progress-v2') || localStorage.getItem('sd-progress') || '{}') || {};
        const completed = Array.isArray(p.completed) ? p.completed : [];
        const done = new Set(completed);
        const cards = [...shell.querySelectorAll('.landing-module[data-units]')];
        const slugs = new Set(cards.flatMap(c => c.dataset.units.split(' ')));
        const last = typeof p.lastVisited === 'string' && slugs.has(p.lastVisited) ? p.lastVisited : null;
        const cta = shell.querySelector('.landing-hero__actions .btn--primary');
        if (cta && last) {
          cta.textContent = 'Continue learning →';
          cta.setAttribute('href', '#topic/' + last);
        }
        for (const card of cards) {
          const units = card.dataset.units.split(' ');
          const n = units.filter(u => done.has(u)).length;
          const bar = card.querySelector('.landing-module__bar > span');
          if (bar && n) bar.style.width = Math.round((n / units.length) * 100) + '%';
        }
        const pct = Math.round((completed.length / ((window.SITE_COUNTS && window.SITE_COUNTS.topics) || 200)) * 100);
        const text = document.getElementById('progress-text');
        const ring = document.getElementById('progress-ring-fill');
        if (text) text.textContent = pct + '%';
        if (ring) ring.style.strokeDashoffset = 2 * Math.PI * 8 * (1 - pct / 100);
      } catch {}
    }
  });
})();
