/**
 * System Design In Depth — Client Bootstrap & Deferred Asset Loader
 * Fetches application scripts after first paint, initializes Mermaid on demand,
 * and manages user consent for privacy regulations (GDPR / DPDP).
 */
(() => {
  // 1. Deferred App Scripts & GA4 Basic Consent Mode Loader
  let started = false;
  const loadGA4 = () => {
    if (!window.GA_MEASUREMENT_ID || window._ga4Loaded) return;
    window._ga4Loaded = true;
    const ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(window.GA_MEASUREMENT_ID);
    document.head.appendChild(ga);
  };
  window.loadGA4 = loadGA4;

  const startDeferredScripts = () => {
    if (started) return;
    started = true;

    // Load data & application scripts in strict DOM order
    document.querySelectorAll('script[data-defer]').forEach(old => {
      const s = document.createElement('script');
      s.src = old.getAttribute('src');
      s.async = false;
      document.body.appendChild(s);
    });

    // Basic Consent Mode: Load GA4 library ONLY if consent has already been granted
    let consentGranted = false;
    try {
      consentGranted = localStorage.getItem('sd-consent') === 'granted';
    } catch {}
    if (consentGranted) {
      loadGA4();
    }
  };

  // Trigger loading on early user interaction
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, startDeferredScripts, { once: true, passive: true });
  });

  // Or trigger after Largest Contentful Paint (LCP)
  if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
    new PerformanceObserver((_, obs) => {
      obs.disconnect();
      setTimeout(startDeferredScripts, 0);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } else {
    const afterPaint = () => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(startDeferredScripts, 0)));
    if (document.readyState === 'complete') afterPaint();
    else addEventListener('load', afterPaint, { once: true });
  }

  // Safety fallback for background tabs
  setTimeout(startDeferredScripts, 4000);

  // 2. On-demand Mermaid Diagram Loader (Pinned version 10.9.8 with SRI integrity hash)
  window.loadMermaid = function() {
    if (window.mermaid) return Promise.resolve();
    if (window._mermaidPromise) return window._mermaidPromise;

    window._mermaidPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.8/dist/mermaid.min.js';
      s.integrity = 'sha384-N3QqR/7q+xm3BGX+CBbNI8AUmRRqcsDzToy+0z1NLDI0QmTKW8zvwLvqulJgk3dP';
      s.crossOrigin = 'anonymous';
      s.onload = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        window.mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables: {
            darkMode: isDark,
            background: isDark ? '#0a0a0a' : '#ffffff',
            primaryColor: isDark ? '#171717' : '#fafafa',
            primaryTextColor: isDark ? '#ffffff' : '#0a0a0a',
            primaryBorderColor: isDark ? '#404040' : '#d4d4d4',
            lineColor: isDark ? '#737373' : '#a1a1a1',
            secondaryColor: isDark ? '#0a0a0a' : '#f5f5f5',
            tertiaryColor: isDark ? '#262626' : '#e5e5e5',
            mainBkg: isDark ? '#171717' : '#fafafa',
            nodeBorder: isDark ? '#404040' : '#d4d4d4',
            clusterBkg: isDark ? '#0a0a0a' : '#ffffff',
            clusterBorder: isDark ? '#262626' : '#e5e5e5',
            textColor: isDark ? '#e5e5e5' : '#262626',
            edgeLabelBackground: isDark ? '#0a0a0a' : '#ffffff',
            actorBkg: isDark ? '#171717' : '#fafafa',
            actorBorder: isDark ? '#404040' : '#d4d4d4',
            actorTextColor: isDark ? '#ffffff' : '#0a0a0a',
            signalColor: isDark ? '#a1a1a1' : '#525252',
            signalTextColor: isDark ? '#e5e5e5' : '#262626',
            noteBkgColor: isDark ? '#262626' : '#f5f5f5',
            noteBorderColor: isDark ? '#404040' : '#d4d4d4',
            noteTextColor: isDark ? '#e5e5e5' : '#262626',
            fontFamily: '"Geist", -apple-system, sans-serif',
            fontSize: '13px'
          }
        });
        resolve();
      };
      s.onerror = (e) => {
        window._mermaidPromise = null;
        reject(e);
      };
      document.head.appendChild(s);
    });

    return window._mermaidPromise;
  };

  // 3. Privacy & Cookie Consent Banner (GDPR / DPDP)
  function initConsentBanner() {
    try {
      if (localStorage.getItem('sd-consent') !== null) {
        return; // User has already chosen
      }
    } catch {
      return;
    }

    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.id = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics & privacy choices');
    banner.innerHTML = `
      <div class="consent-banner__inner">
        <p class="consent-banner__text">
          We use anonymous analytics to refine lessons and interactive simulators. Respecting your privacy is our default. Enable Google Analytics?
        </p>
        <div class="consent-banner__actions">
          <button type="button" class="btn btn--sm btn--primary consent-banner__btn" id="consent-btn-accept">Accept</button>
          <button type="button" class="btn btn--sm btn--outline consent-banner__btn" id="consent-btn-decline">Decline</button>
        </div>
      </div>
    `;

    const closeBanner = () => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(12px)';
      setTimeout(() => banner.remove(), 250);
    };

    banner.addEventListener('click', (e) => {
      const target = e.target;
      if (target.id === 'consent-btn-accept') {
        try { localStorage.setItem('sd-consent', 'granted'); } catch {}
        if (typeof window.gtag === 'function') {
          window.gtag('consent', 'update', {
            'analytics_storage': 'granted'
          });
        }
        loadGA4();
        if (window.Analytics && typeof window.Analytics.trackPageView === 'function') {
          window.Analytics.trackPageView(location.pathname);
        }
        closeBanner();
      } else if (target.id === 'consent-btn-decline') {
        try { localStorage.setItem('sd-consent', 'denied'); } catch {}
        if (typeof window.gtag === 'function') {
          window.gtag('consent', 'update', {
            'analytics_storage': 'denied'
          });
        }
        closeBanner();
      }
    });

    document.body.appendChild(banner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initConsentBanner, 800));
  } else {
    setTimeout(initConsentBanner, 800);
  }
})();
