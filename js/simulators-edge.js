/* ═══════════════════════════════════════════════════════════════
   Edge Caching & User-Perceived Page Load Time Sandbox
   Links geographic fiber RTT, TCP/TLS termination, s-maxage,
   stale-while-revalidate, and Origin Shielding to what users feel
   (real-time progressive FCP/LCP paint + DevTools waterfall).
   ═══════════════════════════════════════════════════════════════ */
(() => {
  window.SIMULATORS = window.SIMULATORS || {};

  const CITIES = {
    ashburn:  { name: 'Ashburn, US',   short: 'Ashburn',   pop: 'IAD', lat: 39.0,  lon: -77.5, popRtt: 8  },
    london:   { name: 'London, UK',    short: 'London',    pop: 'LHR', lat: 51.5,  lon: -0.1,  popRtt: 10 },
    saopaulo: { name: 'São Paulo, BR', short: 'São Paulo', pop: 'GRU', lat: -23.5, lon: -46.6, popRtt: 12 },
    mumbai:   { name: 'Mumbai, IN',    short: 'Mumbai',    pop: 'BOM', lat: 19.1,  lon: 72.9,  popRtt: 14 },
    tokyo:    { name: 'Tokyo, JP',     short: 'Tokyo',     pop: 'NRT', lat: 35.7,  lon: 139.7, popRtt: 10 },
    sydney:   { name: 'Sydney, AU',    short: 'Sydney',    pop: 'SYD', lat: -33.9, lon: 151.2, popRtt: 12 }
  };

  const ORIGINS = {
    'us-east-1':      { name: 'US-East (Virginia)',     short: 'Virginia (us-east-1)',  lat: 39.0, lon: -77.5 },
    'eu-central-1':   { name: 'EU-Central (Frankfurt)', short: 'Frankfurt (eu-cent-1)', lat: 50.1, lon: 8.7   },
    'ap-northeast-1': { name: 'AP-Northeast (Tokyo)',   short: 'Tokyo (ap-ne-1)',       lat: 35.7, lon: 139.7 }
  };

  const NETWORKS = {
    fiber:  { label: 'Fiber (100 Mbps)',   bwMbps: 100, lastMileMs: 4  },
    fast4g: { label: 'Fast 4G (20 Mbps)',  bwMbps: 20,  lastMileMs: 22 },
    slow3g: { label: 'Slow 3G (1.6 Mbps)', bwMbps: 1.6, lastMileMs: 85 }
  };

  const DEFAULT_CFG = {
    city: 'mumbai',
    origin: 'us-east-1',
    strategy: 'full-edge',
    network: 'fiber',
    protocol: 'h2',
    originRenderMs: 140,
    speed: 1,
    cacheState: 'warm',
    wfView: 'both'
  };

  function haversineKm(a, b) {
    const R = 6371;
    const toRad = d => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function fiberRttMs(a, b) {
    const km = haversineKm(a, b);
    if (km < 80) return 6;
    return Math.round((2 * km / 200) * 1.28 + 8);
  }

  function downloadMs(sizeKb, bwMbps) {
    return Math.max(2, Math.round((sizeKb * 8) / (bwMbps * 1000) * 1000));
  }

  function cwvGrade(metric, ms) {
    if (metric === 'lcp') return ms <= 2500 ? 'good' : ms <= 4000 ? 'warn' : 'poor';
    if (metric === 'fcp') return ms <= 1800 ? 'good' : ms <= 3000 ? 'warn' : 'poor';
    if (metric === 'ttfb') return ms <= 800 ? 'good' : ms <= 1800 ? 'warn' : 'poor';
    return 'good';
  }

  function gradeLabel(g) {
    return g === 'good' ? 'Good' : g === 'warn' ? 'Needs Work' : 'Poor';
  }

  function computeSimulation(cfg) {
    const city = CITIES[cfg.city] || CITIES.mumbai;
    const origin = ORIGINS[cfg.origin] || ORIGINS['us-east-1'];
    const net = NETWORKS[cfg.network] || NETWORKS.fiber;
    const distKm = Math.round(haversineKm(city, origin));
    const wanRtt = fiberRttMs(city, origin);
    const edgeRtt = city.popRtt + net.lastMileMs;
    const originTotalRtt = wanRtt + net.lastMileMs;
    const isH3 = cfg.protocol === 'h3';
    const ssr = cfg.originRenderMs;

    // 1. Direct-to-Origin Path (No CDN)
    const oDns = Math.round(14 + net.lastMileMs * 0.6);
    const oTcp = isH3 ? 0 : originTotalRtt;
    const oTls = originTotalRtt;
    const oConnEnd = oDns + oTcp + oTls;

    const oHtmlStart = oConnEnd;
    const oHtmlTtfb = oHtmlStart + originTotalRtt + ssr;
    const oHtmlEnd = oHtmlTtfb + downloadMs(28, net.bwMbps);

    const oSubStart = oHtmlEnd + 12;
    const oCssEnd = oSubStart + originTotalRtt + downloadMs(45, net.bwMbps);
    const oImgEnd = oSubStart + originTotalRtt + downloadMs(240, net.bwMbps);
    const oJsEnd = oSubStart + originTotalRtt + downloadMs(140, net.bwMbps);

    const originFcp = oCssEnd + 18;
    const originLcp = Math.max(originFcp + 12, oImgEnd + 22);
    const originReady = Math.max(originLcp, oJsEnd + 28);

    const originWaterfall = [
      { label: 'DNS Lookup',    start: 0,           dur: oDns,                  phase: 'dns',  cache: 'BYPASS' },
      ...(isH3 ? [] : [{ label: 'TCP Handshake', start: oDns, dur: oTcp, phase: 'tcp', cache: 'ORIGIN' }]),
      { label: isH3 ? 'QUIC + TLS 1.3' : 'TLS 1.3', start: oDns + oTcp, dur: oTls, phase: 'tls', cache: 'ORIGIN' },
      { label: 'HTML Document', start: oHtmlStart,  dur: oHtmlEnd - oHtmlStart, phase: 'html', cache: 'ORIGIN', ttfb: oHtmlTtfb },
      { label: 'Critical CSS',  start: oSubStart,   dur: oCssEnd - oSubStart,   phase: 'css',  cache: 'ORIGIN' },
      { label: 'Hero Image',    start: oSubStart,   dur: oImgEnd - oSubStart,   phase: 'img',  cache: 'ORIGIN' },
      { label: 'App Bundle JS', start: oSubStart,   dur: oJsEnd - oSubStart,    phase: 'js',   cache: 'ORIGIN' }
    ];

    // 2. Edge Caching Path
    const eDns = Math.round(6 + net.lastMileMs * 0.35);
    const eTcp = isH3 ? 0 : edgeRtt;
    const eTls = edgeRtt;
    const eConnEnd = eDns + eTcp + eTls;

    let htmlCacheStatus = 'HIT';
    let assetCacheStatus = 'HIT';
    let htmlBackendWait = 3;
    let bgRevalidateMs = 0;
    let originHits = 0;

    if (cfg.strategy === 'static-only') {
      htmlCacheStatus = 'BYPASS';
      htmlBackendWait = wanRtt + ssr;
      originHits = 1;
      if (cfg.cacheState === 'cold') {
        assetCacheStatus = 'MISS';
        originHits = 4;
      }
    } else if (cfg.cacheState === 'cold') {
      if (cfg.strategy === 'shielded' && wanRtt > 40) {
        htmlCacheStatus = 'SHIELD HIT';
        assetCacheStatus = 'SHIELD HIT';
        htmlBackendWait = Math.round(wanRtt * 0.45) + 6;
        originHits = 0;
      } else {
        htmlCacheStatus = 'MISS';
        assetCacheStatus = 'MISS';
        htmlBackendWait = wanRtt + ssr;
        originHits = 4;
      }
    } else if (cfg.cacheState === 'stale') {
      htmlCacheStatus = 'STALE';
      assetCacheStatus = 'HIT';
      htmlBackendWait = 4;
      bgRevalidateMs = wanRtt + ssr;
      originHits = 1;
    }

    const eHtmlStart = eConnEnd;
    const eHtmlTtfb = eHtmlStart + edgeRtt + htmlBackendWait;
    const eHtmlEnd = eHtmlTtfb + downloadMs(28, net.bwMbps);

    const eSubStart = eHtmlEnd + 12;
    const assetBackhaul = assetCacheStatus === 'MISS'
      ? Math.round(wanRtt * 0.85) + 12
      : assetCacheStatus === 'SHIELD HIT'
        ? Math.round(wanRtt * 0.45) + 4
        : 2;

    const eCssEnd = eSubStart + edgeRtt + assetBackhaul + downloadMs(45, net.bwMbps);
    const eImgEnd = eSubStart + edgeRtt + assetBackhaul + downloadMs(240, net.bwMbps);
    const eJsEnd = eSubStart + edgeRtt + assetBackhaul + downloadMs(140, net.bwMbps);

    const edgeFcp = eCssEnd + 18;
    const edgeLcp = Math.max(edgeFcp + 12, eImgEnd + 22);
    const edgeReady = Math.max(edgeLcp, eJsEnd + 28);

    const edgeWaterfall = [
      { label: 'Anycast DNS',   start: 0,          dur: eDns,                  phase: 'dns',  cache: 'POP' },
      ...(isH3 ? [] : [{ label: 'TCP (Edge PoP)', start: eDns, dur: eTcp, phase: 'tcp', cache: 'POP' }]),
      { label: isH3 ? 'QUIC (Edge PoP)' : 'TLS 1.3 (PoP)', start: eDns + eTcp, dur: eTls, phase: 'tls', cache: 'POP' },
      { label: 'HTML Document', start: eHtmlStart, dur: eHtmlEnd - eHtmlStart, phase: 'html', cache: htmlCacheStatus, ttfb: eHtmlTtfb },
      { label: 'Critical CSS',  start: eSubStart,  dur: eCssEnd - eSubStart,   phase: 'css',  cache: assetCacheStatus },
      { label: 'Hero Image',    start: eSubStart,  dur: eImgEnd - eSubStart,   phase: 'img',  cache: assetCacheStatus },
      { label: 'App Bundle JS', start: eSubStart,  dur: eJsEnd - eSubStart,    phase: 'js',   cache: assetCacheStatus }
    ];

    const offloadPct = Math.round(((4 - originHits) / 4) * 100);
    const roundTripsOrigin = isH3 ? 3 : 4;

    return {
      city, origin, net, distKm, wanRtt, edgeRtt, originTotalRtt, roundTripsOrigin,
      htmlCacheStatus, assetCacheStatus, bgRevalidateMs, offloadPct,
      originMetrics: { ttfb: oHtmlTtfb, fcp: originFcp, lcp: originLcp, ready: originReady },
      edgeMetrics:   { ttfb: eHtmlTtfb, fcp: edgeFcp,   lcp: edgeLcp,   ready: edgeReady },
      originWaterfall,
      edgeWaterfall
    };
  }

  // Clean 2-lane Network Path Comparison Diagram (zero overlap, instantly readable)
  function buildTopologySvgContent(sim, cfg) {
    const showBackhaul = sim.htmlCacheStatus === 'MISS' || sim.htmlCacheStatus === 'BYPASS' || sim.htmlCacheStatus === 'STALE';
    const showShield = sim.htmlCacheStatus === 'SHIELD HIT';
    const isSwr = sim.htmlCacheStatus === 'STALE';

    let edgeStatusDesc = 'Served from local RAM (~3 ms)';
    if (sim.htmlCacheStatus === 'BYPASS') edgeStatusDesc = 'HTML bypasses PoP -> Origin';
    else if (sim.htmlCacheStatus === 'MISS') edgeStatusDesc = 'Cold MISS -> Warm keep-alive to Origin';
    else if (sim.htmlCacheStatus === 'SHIELD HIT') edgeStatusDesc = 'PoP MISS -> Regional Shield HIT';
    else if (sim.htmlCacheStatus === 'STALE') edgeStatusDesc = 'Instant STALE + async origin refresh';

    const backhaulLine = showBackhaul
      ? `<line x1="316" y1="138" x2="514" y2="138" class="edge-sim__lane-line ${isSwr ? 'edge-sim__lane-line--swr' : 'edge-sim__lane-line--backhaul'}"/>
         <text x="415" y="128" text-anchor="middle" class="edge-sim__lane-note ${isSwr ? 'edge-sim__lane-note--swr' : ''}">${isSwr ? `Async SWR refresh (${sim.bgRevalidateMs} ms)` : `Warm keep-alive (${sim.wanRtt} ms RTT)`}</text>`
      : showShield
        ? `<line x1="316" y1="138" x2="398" y2="138" class="edge-sim__lane-line edge-sim__lane-line--swr"/>
           <rect x="398" y="122" width="100" height="32" rx="6" class="edge-sim__box edge-sim__box--shield"/>
           <text x="448" y="136" text-anchor="middle" class="edge-sim__box-title">Origin Shield</text>
           <text x="448" y="148" text-anchor="middle" class="edge-sim__box-sub">SHIELD HIT</text>`
        : `<line x1="316" y1="138" x2="514" y2="138" class="edge-sim__lane-line edge-sim__lane-line--idle"/>
           <text x="415" y="130" text-anchor="middle" class="edge-sim__lane-note">Origin untouched (0 ms WAN)</text>`;

    return `
      <!-- Lane 1: Direct to Origin (No CDN) -->
      <text x="16" y="20" class="edge-sim__lane-heading edge-sim__lane-heading--origin">1. WITHOUT EDGE (DIRECT TO ORIGIN)</text>
      <text x="644" y="20" text-anchor="end" class="edge-sim__lane-stat edge-sim__lane-stat--origin">LCP ${sim.originMetrics.lcp} ms</text>

      <line x1="122" y1="50" x2="514" y2="50" class="edge-sim__lane-line edge-sim__lane-line--origin"/>
      <text x="318" y="40" text-anchor="middle" class="edge-sim__lane-note edge-sim__lane-note--origin">${sim.distKm.toLocaleString()} km fiber · ${sim.originTotalRtt} ms RTT × ${sim.roundTripsOrigin} sequential trips</text>

      <rect x="16" y="34" width="106" height="32" rx="6" class="edge-sim__box"/>
      <text x="69" y="48" text-anchor="middle" class="edge-sim__box-title">User: ${sim.city.short}</text>
      <text x="69" y="60" text-anchor="middle" class="edge-sim__box-sub">${sim.net.label.split(' ')[0]}</text>

      <rect x="514" y="34" width="130" height="32" rx="6" class="edge-sim__box edge-sim__box--origin"/>
      <text x="579" y="48" text-anchor="middle" class="edge-sim__box-title">Origin Server</text>
      <text x="579" y="60" text-anchor="middle" class="edge-sim__box-sub">${sim.origin.short}</text>

      <!-- Divider -->
      <line x1="16" y1="88" x2="644" y2="88" class="edge-sim__lane-divider"/>

      <!-- Lane 2: With Edge Caching -->
      <text x="16" y="108" class="edge-sim__lane-heading edge-sim__lane-heading--edge">2. WITH EDGE CACHING (${sim.htmlCacheStatus})</text>
      <text x="644" y="108" text-anchor="end" class="edge-sim__lane-stat edge-sim__lane-stat--edge">LCP ${sim.edgeMetrics.lcp} ms</text>

      <line x1="122" y1="138" x2="196" y2="138" class="edge-sim__lane-line edge-sim__lane-line--edge"/>
      <text x="159" y="128" text-anchor="middle" class="edge-sim__lane-note edge-sim__lane-note--edge">${sim.edgeRtt} ms</text>
      ${backhaulLine}

      <rect x="16" y="122" width="106" height="32" rx="6" class="edge-sim__box"/>
      <text x="69" y="136" text-anchor="middle" class="edge-sim__box-title">User: ${sim.city.short}</text>
      <text x="69" y="148" text-anchor="middle" class="edge-sim__box-sub">Local Anycast</text>

      <rect x="196" y="122" width="120" height="32" rx="6" class="edge-sim__box edge-sim__box--edge"/>
      <text x="256" y="136" text-anchor="middle" class="edge-sim__box-title">${sim.city.pop} Edge PoP</text>
      <text x="256" y="148" text-anchor="middle" class="edge-sim__box-sub">x-cache: ${sim.htmlCacheStatus}</text>

      <rect x="514" y="122" width="130" height="32" rx="6" class="edge-sim__box ${showBackhaul ? 'edge-sim__box--origin' : 'edge-sim__box--muted'}"/>
      <text x="579" y="136" text-anchor="middle" class="edge-sim__box-title">Origin Server</text>
      <text x="579" y="148" text-anchor="middle" class="edge-sim__box-sub">${showBackhaul ? sim.origin.short : 'Idle (Offloaded)'}</text>

      <text x="16" y="172" class="edge-sim__lane-footnote">${edgeStatusDesc}</text>
      <g id="ec-map-packets"></g>
    `;
  }

  function buildMetricsHtml(sim) {
    const om = sim.originMetrics;
    const em = sim.edgeMetrics;
    const savedMs = Math.max(0, om.lcp - em.lcp);
    const speedup = em.lcp > 0 ? (om.lcp / em.lcp).toFixed(1) : '1.0';
    const lcpGradeE = cwvGrade('lcp', em.lcp);
    const lcpGradeO = cwvGrade('lcp', om.lcp);
    const ttfbGradeE = cwvGrade('ttfb', em.ttfb);
    const ttfbGradeO = cwvGrade('ttfb', om.ttfb);
    const fcpGradeE = cwvGrade('fcp', em.fcp);
    const fcpGradeO = cwvGrade('fcp', om.fcp);

    return `
      <div class="edge-sim__metric-card">
        <div class="edge-sim__metric-label">HTML TTFB</div>
        <div class="edge-sim__metric-row">
          <span class="edge-sim__metric-val edge-sim__metric-val--edge">${em.ttfb} ms</span>
          <span class="edge-sim__metric-vs">vs ${om.ttfb} ms</span>
        </div>
        <div class="edge-sim__cwv-row">
          <span class="edge-sim__cwv edge-sim__cwv--${ttfbGradeE}">Edge: ${gradeLabel(ttfbGradeE)}</span>
          <span class="edge-sim__cwv edge-sim__cwv--${ttfbGradeO}">Origin: ${gradeLabel(ttfbGradeO)}</span>
        </div>
      </div>
      <div class="edge-sim__metric-card">
        <div class="edge-sim__metric-label">First Contentful Paint</div>
        <div class="edge-sim__metric-row">
          <span class="edge-sim__metric-val edge-sim__metric-val--edge">${em.fcp} ms</span>
          <span class="edge-sim__metric-vs">vs ${om.fcp} ms</span>
        </div>
        <div class="edge-sim__cwv-row">
          <span class="edge-sim__cwv edge-sim__cwv--${fcpGradeE}">Edge: ${gradeLabel(fcpGradeE)}</span>
          <span class="edge-sim__cwv edge-sim__cwv--${fcpGradeO}">Origin: ${gradeLabel(fcpGradeO)}</span>
        </div>
      </div>
      <div class="edge-sim__metric-card">
        <div class="edge-sim__metric-label">Largest Contentful Paint</div>
        <div class="edge-sim__metric-row">
          <span class="edge-sim__metric-val edge-sim__metric-val--edge">${em.lcp} ms</span>
          <span class="edge-sim__metric-vs">vs ${om.lcp} ms</span>
        </div>
        <div class="edge-sim__cwv-row">
          <span class="edge-sim__cwv edge-sim__cwv--${lcpGradeE}">Edge: ${gradeLabel(lcpGradeE)}</span>
          <span class="edge-sim__cwv edge-sim__cwv--${lcpGradeO}">Origin: ${gradeLabel(lcpGradeO)}</span>
        </div>
      </div>
      <div class="edge-sim__metric-card">
        <div class="edge-sim__metric-label">User-Perceived Speedup</div>
        <div class="edge-sim__metric-row">
          <span class="edge-sim__metric-val edge-sim__metric-val--edge">${speedup}× faster</span>
          <span class="edge-sim__metric-vs">-${savedMs} ms LCP</span>
        </div>
        <div class="edge-sim__cwv-row">
          <span class="edge-sim__cwv edge-sim__cwv--good">Origin Offload: ${sim.offloadPct}%</span>
          <span class="edge-sim__cwv edge-sim__cwv--info">${sim.htmlCacheStatus}</span>
        </div>
      </div>
    `;
  }

  function buildWaterfallsHtml(sim, wfView) {
    const om = sim.originMetrics;
    const em = sim.edgeMetrics;
    const maxMs = Math.max(om.ready, em.ready, 100);
    const buildWf = (title, rows, totalMs) => `
      <div class="edge-sim__wf-panel">
        <div class="edge-sim__wf-title">
          <span>${title}</span>
          <span class="edge-sim__wf-total">${totalMs} ms total</span>
        </div>
        <div class="edge-sim__wf-rows">
          ${rows.map(r => {
            const leftPct = ((r.start / maxMs) * 100).toFixed(2);
            const widthPct = Math.max(1.8, (r.dur / maxMs) * 100).toFixed(2);
            return `
              <div class="edge-sim__wf-row">
                <span class="edge-sim__wf-name">${r.label}</span>
                <span class="edge-sim__wf-badge edge-sim__wf-badge--${r.cache.toLowerCase().replace(/\s+/g, '-')}">${r.cache}</span>
                <div class="edge-sim__wf-track">
                  <div class="edge-sim__wf-bar edge-sim__wf-bar--${r.phase}" style="left:${leftPct}%;width:${widthPct}%;"></div>
                </div>
                <span class="edge-sim__wf-ms">${r.dur} ms</span>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;

    if (wfView === 'edge') return buildWf(`Edge Path (${sim.city.pop} PoP)`, sim.edgeWaterfall, em.ready);
    if (wfView === 'origin') return buildWf(`Direct Origin (${sim.origin.short})`, sim.originWaterfall, om.ready);
    return buildWf(`Direct Origin (${sim.origin.short})`, sim.originWaterfall, om.ready) +
           buildWf(`Edge Path (${sim.city.pop} PoP)`, sim.edgeWaterfall, em.ready);
  }

  function buildVerdictText(sim, cfg) {
    const om = sim.originMetrics;
    const em = sim.edgeMetrics;
    const savedMs = Math.max(0, om.lcp - em.lcp);
    const speedup = em.lcp > 0 ? (om.lcp / em.lcp).toFixed(1) : '1.0';
    if (sim.distKm < 250) {
      return `Because ${sim.city.name} is right next to ${sim.origin.name}, WAN distance is tiny (${sim.wanRtt} ms RTT). Edge caching mainly saves origin SSR compute (${cfg.originRenderMs} ms) and shields database load rather than cutting ocean latency.`;
    }
    if (cfg.strategy === 'static-only') {
      return `Caching only static assets at ${sim.city.pop} speeds up CSS and images, but HTML still travels ${sim.distKm.toLocaleString()} km to ${sim.origin.short} (TTFB ${em.ttfb} ms). Because the browser cannot discover CSS or the hero image until HTML arrives, slow HTML TTFB caps how fast LCP can get.`;
    }
    if (sim.htmlCacheStatus === 'STALE') {
      return `stale-while-revalidate served the ${sim.city.pop} user in ${em.lcp} ms (LCP) from the local PoP while an async background refresh (${sim.bgRevalidateMs} ms) updated the cache from ${sim.origin.short}. The user never waited on the ocean round-trip.`;
    }
    if (sim.htmlCacheStatus === 'SHIELD HIT') {
      return `The local ${sim.city.pop} PoP was cold, but the Regional Origin Shield absorbed the miss without waking ${sim.origin.short}—cutting cold-start TTFB to ${em.ttfb} ms and keeping origin QPS at 0.`;
    }
    if (sim.htmlCacheStatus === 'MISS') {
      return `Cold PoP MISS: ${sim.city.pop} had to fetch from ${sim.origin.short}, yet it still beat Direct Origin by ${savedMs} ms because TCP/TLS terminated locally at the PoP and reused a warm Edge-to-Origin connection. Click "Load Page" again to feel the warm HIT!`;
    }
    return `From ${sim.city.name} to ${sim.origin.name} (${sim.distKm.toLocaleString()} km), direct origin requests pay ~${sim.originTotalRtt} ms per round trip across TCP, TLS, HTML, and subresources (LCP ${om.lcp} ms). Serving from the ${sim.city.pop} Edge PoP collapses LCP to ${em.lcp} ms (${speedup}× faster).`;
  }

  window.SIMULATORS['edge-caching-lab'] = {
    id: 'edge-caching-lab',
    title: 'Edge Caching & Page Load Time Sandbox',
    slugs: ['edge-caching-and-page-load-times', 'caching-layers'],
    blurb: 'Race a real browser page load from Mumbai, Sydney, or London against a distant origin and feel how Edge PoPs, s-maxage, Origin Shield, and stale-while-revalidate change TTFB, FCP, and LCP.',
    render() {
      const initSim = computeSimulation(DEFAULT_CFG);
      return `
        <div class="simulator-card edge-sim" id="sim-edge-caching">
          <div class="simulator-card__header">
            <div class="simulator-card__title">
              <span>Edge Caching &amp; Page Load Time Sandbox</span>
            </div>
            <span class="edge-sim__status-pill edge-sim__status-pill--hit" id="ec-cache-pill">Edge PoP: WARM (HIT)</span>
          </div>
          <p class="simulator-card__description">
            Pick a user far from your origin and click <strong>Load Page (A/B Race)</strong> to feel the real-time page load difference. Then try <strong>Purge Edge Cache</strong> (Cold MISS) or <strong>Expire TTL (Trigger SWR)</strong>.
          </p>

          <div class="edge-sim__controls-grid">
            <label class="edge-sim__field">
              <span class="edge-sim__label">USER LOCATION</span>
              <select class="edge-sim__select" id="ec-city">
                <option value="ashburn">Ashburn, US</option>
                <option value="london">London, UK</option>
                <option value="saopaulo">São Paulo, BR</option>
                <option value="mumbai" selected>Mumbai, IN</option>
                <option value="tokyo">Tokyo, JP</option>
                <option value="sydney">Sydney, AU</option>
              </select>
            </label>
            <label class="edge-sim__field">
              <span class="edge-sim__label">ORIGIN REGION</span>
              <select class="edge-sim__select" id="ec-origin">
                <option value="us-east-1" selected>US-East (Virginia)</option>
                <option value="eu-central-1">EU-Central (Frankfurt)</option>
                <option value="ap-northeast-1">AP-Northeast (Tokyo)</option>
              </select>
            </label>
            <label class="edge-sim__field">
              <span class="edge-sim__label">EDGE STRATEGY</span>
              <select class="edge-sim__select" id="ec-strategy">
                <option value="static-only">Static Assets Only</option>
                <option value="full-edge" selected>Full Edge (HTML + Assets)</option>
                <option value="shielded">Full Edge + Origin Shield</option>
              </select>
            </label>
            <label class="edge-sim__field">
              <span class="edge-sim__label">NETWORK PROFILE</span>
              <select class="edge-sim__select" id="ec-network">
                <option value="fiber" selected>Fiber (100 Mbps)</option>
                <option value="fast4g">Fast 4G (20 Mbps)</option>
                <option value="slow3g">Slow 3G (1.6 Mbps)</option>
              </select>
            </label>
            <label class="edge-sim__field">
              <span class="edge-sim__label">PROTOCOL</span>
              <select class="edge-sim__select" id="ec-protocol">
                <option value="h2" selected>HTTP/2 (TCP + TLS 1.3)</option>
                <option value="h3">HTTP/3 (QUIC 1-RTT)</option>
              </select>
            </label>
            <label class="edge-sim__field">
              <span class="edge-sim__label">ORIGIN SSR RENDER: <b id="ec-ssr-val">140</b> ms</span>
              <input class="edge-sim__range" type="range" id="ec-ssr" min="20" max="400" step="20" value="140">
            </label>
          </div>

          <div class="edge-sim__actions">
            <button type="button" class="btn btn--primary btn--sm" id="ec-run">Load Page (A/B Race)</button>
            <button type="button" class="btn btn--outline btn--sm" id="ec-purge">Purge Edge Cache</button>
            <button type="button" class="btn btn--outline btn--sm" id="ec-stale">Expire TTL (Trigger SWR)</button>
            <label class="edge-sim__speed-toggle">
              <span>Speed</span>
              <select class="edge-sim__select edge-sim__select--compact" id="ec-speed" aria-label="Simulation playback speed">
                <option value="1" selected>1x Real-Time</option>
                <option value="0.5">0.5x Slow-Mo</option>
              </select>
            </label>
          </div>

          <!-- Panel 1: Clean 2-Lane Network Path Comparison -->
          <div class="edge-sim__map-wrap" aria-label="Direct origin vs Edge PoP request path comparison">
            <svg class="edge-sim__map" id="ec-map-svg" viewBox="0 0 660 184" role="img" aria-label="Two-lane network path diagram comparing direct origin requests with edge PoP caching">
              ${buildTopologySvgContent(initSim, DEFAULT_CFG)}
            </svg>
          </div>

          <!-- Panel 2: Side-by-Side Live Browser Previews ("What the User Actually Feels") -->
          <div class="edge-sim__browsers">
            <div class="edge-sim__browser" id="ec-browser-origin">
              <div class="edge-sim__chrome">
                <span class="edge-sim__tag edge-sim__tag--origin" id="ec-origin-phase">Origin Direct · ${initSim.originMetrics.lcp} ms LCP</span>
                <span class="edge-sim__clock" id="ec-origin-clock">${initSim.originMetrics.ready} ms</span>
              </div>
              <div class="edge-sim__viewport is-fcp is-lcp is-ready" id="ec-vp-origin">
                <div class="edge-sim__blank">
                  <span class="edge-sim__spinner" aria-hidden="true"></span>
                  <span class="edge-sim__blank-text">Waiting for origin across ocean…</span>
                </div>
                <div class="edge-sim__page">
                  <div class="edge-sim__p-nav">
                    <span class="edge-sim__p-brand">ACME STORE</span>
                    <span class="edge-sim__p-links"><span>Catalog</span><span>Cart (2)</span></span>
                  </div>
                  <div class="edge-sim__p-body">
                    <div class="edge-sim__p-hero">
                      <div class="edge-sim__p-hero-art">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        <span>Hero Image</span>
                      </div>
                    </div>
                    <div class="edge-sim__p-copy">
                      <div class="edge-sim__p-title">Mechanical Keyboard Pro</div>
                      <div class="edge-sim__p-sub">In stock · Ships today</div>
                      <div class="edge-sim__p-cta">Add to Cart · $189</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="edge-sim__browser edge-sim__browser--edge" id="ec-browser-edge">
              <div class="edge-sim__chrome">
                <span class="edge-sim__tag edge-sim__tag--edge" id="ec-edge-phase">Edge HIT · ${initSim.edgeMetrics.lcp} ms LCP</span>
                <span class="edge-sim__clock" id="ec-edge-clock">${initSim.edgeMetrics.ready} ms</span>
              </div>
              <div class="edge-sim__viewport is-fcp is-lcp is-ready" id="ec-vp-edge">
                <div class="edge-sim__blank">
                  <span class="edge-sim__spinner" aria-hidden="true"></span>
                  <span class="edge-sim__blank-text">Connecting to nearest PoP…</span>
                </div>
                <div class="edge-sim__page">
                  <div class="edge-sim__p-nav">
                    <span class="edge-sim__p-brand">ACME STORE</span>
                    <span class="edge-sim__p-links"><span>Catalog</span><span>Cart (2)</span></span>
                  </div>
                  <div class="edge-sim__p-body">
                    <div class="edge-sim__p-hero">
                      <div class="edge-sim__p-hero-art">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        <span>Hero Image</span>
                      </div>
                    </div>
                    <div class="edge-sim__p-copy">
                      <div class="edge-sim__p-title">Mechanical Keyboard Pro</div>
                      <div class="edge-sim__p-sub">In stock · Ships today</div>
                      <div class="edge-sim__p-cta">Add to Cart · $189</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel 3: Core Web Vitals & System Metrics Strip -->
          <div class="edge-sim__metrics" id="ec-metrics">${buildMetricsHtml(initSim)}</div>

          <!-- Panel 4: DevTools Network Waterfall -->
          <div class="edge-sim__waterfall-section">
            <div class="edge-sim__waterfall-head">
              <span class="edge-sim__label">NETWORK WATERFALL COMPARISON</span>
              <div class="edge-sim__wf-tabs" role="tablist" aria-label="Waterfall view selector">
                <button type="button" class="edge-sim__wf-tab is-active" role="tab" aria-selected="true" data-wf="both">Side-by-Side</button>
                <button type="button" class="edge-sim__wf-tab" role="tab" aria-selected="false" data-wf="edge">Edge Only</button>
                <button type="button" class="edge-sim__wf-tab" role="tab" aria-selected="false" data-wf="origin">Origin Only</button>
              </div>
            </div>
            <div class="edge-sim__waterfalls" id="ec-waterfalls">${buildWaterfallsHtml(initSim, 'both')}</div>
          </div>

          <div class="sim-verdict" id="ec-verdict">${buildVerdictText(initSim, DEFAULT_CFG)}</div>
        </div>
      `;
    },

    mount(root) {
      const card = root.querySelector('#sim-edge-caching') || root;
      const $ = s => card.querySelector(s);
      const offs = [];
      const on = (el, ev, fn) => { if (!el) return; el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };

      const state = { ...DEFAULT_CFG, rafId: null, running: false };
      const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function cancelAnim() {
        if (state.rafId) {
          cancelAnimationFrame(state.rafId);
          state.rafId = null;
        }
        state.running = false;
      }

      function updateCachePill() {
        const pill = $('#ec-cache-pill');
        if (!pill) return;
        if (state.strategy === 'static-only') {
          pill.textContent = state.cacheState === 'cold' ? 'Assets: COLD · HTML: BYPASS' : 'Assets: WARM · HTML: BYPASS';
          pill.className = 'edge-sim__status-pill edge-sim__status-pill--warn';
        } else if (state.cacheState === 'cold') {
          pill.textContent = state.strategy === 'shielded' ? 'Edge PoP: COLD -> SHIELD' : 'Edge PoP: COLD (MISS)';
          pill.className = 'edge-sim__status-pill edge-sim__status-pill--warn';
        } else if (state.cacheState === 'stale') {
          pill.textContent = 'Edge PoP: STALE (SWR)';
          pill.className = 'edge-sim__status-pill edge-sim__status-pill--info';
        } else {
          pill.textContent = 'Edge PoP: WARM (HIT)';
          pill.className = 'edge-sim__status-pill edge-sim__status-pill--hit';
        }
      }

      function renderStaticPanels(sim) {
        const svg = $('#ec-map-svg');
        if (svg) svg.innerHTML = buildTopologySvgContent(sim, state);

        const metricsEl = $('#ec-metrics');
        if (metricsEl) metricsEl.innerHTML = buildMetricsHtml(sim);

        const wfEl = $('#ec-waterfalls');
        if (wfEl) {
          wfEl.className = state.wfView === 'both' ? 'edge-sim__waterfalls' : 'edge-sim__waterfalls edge-sim__waterfalls--single';
          wfEl.innerHTML = buildWaterfallsHtml(sim, state.wfView);
        }

        const verdict = $('#ec-verdict');
        if (verdict) verdict.textContent = buildVerdictText(sim, state);
      }

      function setViewportStage(vpEl, phaseEl, clockEl, elapsed, metrics, doneLabel) {
        if (!vpEl) return;
        const clamped = Math.min(elapsed, metrics.ready);
        if (clockEl) clockEl.textContent = `${Math.round(clamped)} ms`;

        const showPage = elapsed >= metrics.fcp;
        const showLcp = elapsed >= metrics.lcp;
        const showReady = elapsed >= metrics.ready;

        vpEl.classList.toggle('is-fcp', showPage);
        vpEl.classList.toggle('is-lcp', showLcp);
        vpEl.classList.toggle('is-ready', showReady);

        if (phaseEl) {
          if (showReady) phaseEl.textContent = `${doneLabel} · ${metrics.lcp} ms LCP`;
          else if (showLcp) phaseEl.textContent = 'LCP Painted · Hydrating JS';
          else if (showPage) phaseEl.textContent = 'FCP Painted · Loading Hero';
          else if (elapsed >= metrics.ttfb) phaseEl.textContent = 'TTFB Received · Parsing HTML';
          else phaseEl.textContent = 'Handshake / Waiting TTFB…';
        }
      }

      function renderPackets(sim, elapsed) {
        const pktsG = $('#ec-map-packets');
        if (!pktsG) return;
        let html = '';

        // Lane 1: Origin packet crawling across x=122..514, y=50
        if (elapsed < sim.originMetrics.ready) {
          const cycle = Math.max(140, sim.originTotalRtt);
          const p = (elapsed % cycle) / cycle;
          const t = p < 0.5 ? p * 2 : (1 - p) * 2;
          const x = 122 + (514 - 122) * t;
          html += `<circle cx="${x.toFixed(1)}" cy="50" r="5" class="edge-sim__pkt edge-sim__pkt--origin"/>`;
        }

        // Lane 2: Local Edge PoP packet zipping across x=122..196, y=138
        if (elapsed < sim.edgeMetrics.ready) {
          const cycle = Math.max(70, sim.edgeRtt * 2.5);
          const p = (elapsed % cycle) / cycle;
          const t = p < 0.5 ? p * 2 : (1 - p) * 2;
          const x = 122 + (196 - 122) * t;
          html += `<circle cx="${x.toFixed(1)}" cy="138" r="4.8" class="edge-sim__pkt edge-sim__pkt--edge"/>`;

          if (sim.htmlCacheStatus === 'MISS' || sim.htmlCacheStatus === 'BYPASS') {
            const bCycle = Math.max(140, sim.wanRtt);
            const bp = (elapsed % bCycle) / bCycle;
            const bt = bp < 0.5 ? bp * 2 : (1 - bp) * 2;
            const bx = 316 + (514 - 316) * bt;
            html += `<circle cx="${bx.toFixed(1)}" cy="138" r="4.5" class="edge-sim__pkt edge-sim__pkt--edge"/>`;
          } else if (sim.htmlCacheStatus === 'SHIELD HIT') {
            const sCycle = Math.max(100, Math.round(sim.wanRtt * 0.5));
            const sp = (elapsed % sCycle) / sCycle;
            const st = sp < 0.5 ? sp * 2 : (1 - sp) * 2;
            const sx = 316 + (398 - 316) * st;
            html += `<circle cx="${sx.toFixed(1)}" cy="138" r="4.5" class="edge-sim__pkt edge-sim__pkt--swr"/>`;
          }
        }

        // Async SWR background revalidation packet
        if (sim.htmlCacheStatus === 'STALE' && sim.bgRevalidateMs > 0 && elapsed < sim.bgRevalidateMs + 80) {
          const tRaw = Math.min(1, elapsed / Math.max(140, sim.bgRevalidateMs));
          const t = tRaw < 0.5 ? tRaw * 2 : (1 - tRaw) * 2;
          const sx = 316 + (514 - 316) * t;
          html += `<circle cx="${sx.toFixed(1)}" cy="138" r="4.8" class="edge-sim__pkt edge-sim__pkt--swr"/>`;
        }

        pktsG.innerHTML = html;
      }

      function runRace(animate) {
        cancelAnim();
        const sim = computeSimulation(state);
        updateCachePill();
        renderStaticPanels(sim);

        const vpO = $('#ec-vp-origin');
        const vpE = $('#ec-vp-edge');
        const phO = $('#ec-origin-phase');
        const phE = $('#ec-edge-phase');
        const clkO = $('#ec-origin-clock');
        const clkE = $('#ec-edge-clock');

        const edgeDoneLabel = `Edge ${sim.htmlCacheStatus}`;
        const originDoneLabel = 'Origin Direct';

        if (!animate || reducedMotion) {
          setViewportStage(vpO, phO, clkO, sim.originMetrics.ready, sim.originMetrics, originDoneLabel);
          setViewportStage(vpE, phE, clkE, sim.edgeMetrics.ready, sim.edgeMetrics, edgeDoneLabel);
          return;
        }

        setViewportStage(vpO, phO, clkO, 0, sim.originMetrics, originDoneLabel);
        setViewportStage(vpE, phE, clkE, 0, sim.edgeMetrics, edgeDoneLabel);

        const totalDuration = Math.max(
          sim.originMetrics.ready,
          sim.edgeMetrics.ready,
          sim.htmlCacheStatus === 'STALE' ? sim.bgRevalidateMs + 80 : 0
        );
        const t0 = performance.now();
        state.running = true;

        const step = now => {
          const elapsed = (now - t0) * state.speed;
          setViewportStage(vpO, phO, clkO, elapsed, sim.originMetrics, originDoneLabel);
          setViewportStage(vpE, phE, clkE, elapsed, sim.edgeMetrics, edgeDoneLabel);
          renderPackets(sim, elapsed);

          if (elapsed < totalDuration) {
            state.rafId = requestAnimationFrame(step);
          } else {
            state.running = false;
            state.rafId = null;
            const pktsG = $('#ec-map-packets');
            if (pktsG) pktsG.innerHTML = '';
            if (state.cacheState === 'cold' || state.cacheState === 'stale') {
              state.cacheState = 'warm';
              updateCachePill();
            }
          }
        };
        state.rafId = requestAnimationFrame(step);
      }

      const syncFromInputs = (autoAnimate) => {
        state.city = $('#ec-city')?.value || 'mumbai';
        state.origin = $('#ec-origin')?.value || 'us-east-1';
        state.strategy = $('#ec-strategy')?.value || 'full-edge';
        state.network = $('#ec-network')?.value || 'fiber';
        state.protocol = $('#ec-protocol')?.value || 'h2';
        state.originRenderMs = Number($('#ec-ssr')?.value || 140);
        state.speed = Number($('#ec-speed')?.value || 1);
        const ssrVal = $('#ec-ssr-val');
        if (ssrVal) ssrVal.textContent = String(state.originRenderMs);
        runRace(autoAnimate);
      };

      ['#ec-city', '#ec-origin', '#ec-strategy', '#ec-network', '#ec-protocol', '#ec-speed'].forEach(sel => {
        on($(sel), 'change', () => syncFromInputs(false));
      });
      on($('#ec-ssr'), 'input', () => syncFromInputs(false));

      on($('#ec-run'), 'click', () => runRace(true));
      on($('#ec-purge'), 'click', () => {
        state.cacheState = 'cold';
        runRace(true);
      });
      on($('#ec-stale'), 'click', () => {
        if (state.strategy === 'static-only') {
          state.strategy = 'full-edge';
          const stratEl = $('#ec-strategy');
          if (stratEl) stratEl.value = 'full-edge';
        }
        state.cacheState = 'stale';
        runRace(true);
      });

      card.querySelectorAll('[data-wf]').forEach(btn => {
        on(btn, 'click', () => {
          state.wfView = btn.dataset.wf;
          card.querySelectorAll('[data-wf]').forEach(b => {
            const act = b.dataset.wf === state.wfView;
            b.classList.toggle('is-active', act);
            b.setAttribute('aria-selected', String(act));
          });
          renderStaticPanels(computeSimulation(state));
        });
      });

      syncFromInputs(false);

      this._cleanup = () => {
        cancelAnim();
        offs.splice(0).forEach(fn => fn());
      };
    },

    unmount() {
      if (this._cleanup) {
        this._cleanup();
        this._cleanup = null;
      }
    }
  };
})();
