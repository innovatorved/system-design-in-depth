/**
 * ============================================================
 * @innovatorved/code-lab v0.3.1 — Standalone Browser Code IDE & Virtual Runtime
 * ============================================================
 * Features:
 *   - Sandboxed Web Worker Execution Engine with Multi-Instance Isolation & Watchdog Timer
 *   - First-Class Node.js and Bun Runtimes (Bun.serve, bun:test, bun:sqlite, Bun.*)
 *   - Full POSIX Shell AST & 55+ UNIX Coreutils (pipes, redirects, globs, env vars, git & git clone)
 *   - Interactive PTY Terminal Emulator with inline prompt, Tab completion & ANSI colors
 *   - Persistent HTTP/TCP Servers, CLI curl & Live Port/HTTP Preview
 *   - Modular VS Code Workbench: File Tree, Tabs, Command Palette, Diff Viewer
 *   - Modular Opt-In Guided Lab Extension (stepper, hints, solution diff, JS/TS switcher)
 *   - Zero-Auth Public GitHub Repository Cloning (git clone, workbench.cloneRepo, <code-lab repo="...">)
 *   - Third-Party Imperative SDK (getFiles, setFiles, getFile, setFile, cloneRepo, on, off, use, exportWorkspace)
 * ============================================================
 */

var CodeLabCsp = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/csp.ts
  var csp_exports = {};
  __export(csp_exports, {
    PREVIEW_SHIM_MARKER: () => PREVIEW_SHIM_MARKER,
    buildPreviewPolicy: () => buildPreviewPolicy,
    buildPreviewShims: () => buildPreviewShims,
    default: () => csp_default,
    describePreviewNetwork: () => describePreviewNetwork,
    normalizeOrigin: () => normalizeOrigin,
    normalizePreviewCspConfig: () => normalizePreviewCspConfig
  });
  var IMPORT_MAP_CDNS = ["https://cdn.jsdelivr.net", "https://esm.sh"];
  var FONT_CDNS = ["https://cdn.jsdelivr.net", "https://fonts.gstatic.com"];
  var PRESETS = {
    strict: {},
    balanced: {
      scriptSrc: IMPORT_MAP_CDNS.slice(),
      styleSrc: ["https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: FONT_CDNS.slice(),
      connectSrc: IMPORT_MAP_CDNS.slice(),
      imgSrc: ["https://cdn.jsdelivr.net"]
    }
  };
  var SOURCE_KEYS = [
    "scriptSrc",
    "styleSrc",
    "imgSrc",
    "fontSrc",
    "connectSrc",
    "mediaSrc",
    "workerSrc",
    "frameSrc"
  ];
  var MAX_SOURCES = 64;
  var MAX_SOURCE_LENGTH = 512;
  var PREVIEW_SHIM_MARKER = "data-codelab-preview-shims";
  function normalizeOrigin(raw) {
    if (raw === null || raw === void 0 || raw === "") return null;
    try {
      const parsed = new URL(String(raw));
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
      return parsed.origin;
    } catch (_) {
      return null;
    }
  }
  function normalizeMode(raw) {
    if (raw === "strict" || raw === "custom") return raw;
    return "balanced";
  }
  var ALLOWED_KEYWORDS = [
    "'self'",
    "'none'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "'wasm-unsafe-eval'",
    "'strict-dynamic'",
    "'unsafe-hashes'"
  ];
  var SOURCE_PATTERN = /^(?:https?:\/\/[A-Za-z0-9._~%-]+(?::\d{1,5})?(?:\/[^\s;,'"]*)?|data:|blob:|filesystem:)$/;
  function isSafeSource(source) {
    return ALLOWED_KEYWORDS.indexOf(source) !== -1 || SOURCE_PATTERN.test(source);
  }
  function cleanSources(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const value of raw.slice(0, MAX_SOURCES)) {
      if (typeof value !== "string") continue;
      const source = value.trim();
      if (!source || source.length > MAX_SOURCE_LENGTH) continue;
      if (!isSafeSource(source)) continue;
      if (out.indexOf(source) === -1) out.push(source);
    }
    return out;
  }
  function unique(...lists) {
    const out = [];
    for (const list of lists) {
      if (!list) continue;
      for (const value of list) {
        if (value && out.indexOf(value) === -1) out.push(value);
      }
    }
    return out;
  }
  function normalizePreviewCspConfig(raw) {
    if (typeof raw === "string") return { mode: normalizeMode(raw), allow: {} };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { mode: "balanced", allow: {} };
    }
    const input = raw;
    const nested = input.allow;
    const sources = nested && typeof nested === "object" && !Array.isArray(nested) ? nested : input;
    const allow = {};
    for (const key of SOURCE_KEYS) {
      const list = cleanSources(sources[key]);
      if (list.length) allow[key] = list;
    }
    return { mode: normalizeMode(input.mode), allow };
  }
  function sourcesFor(mode, allow, key) {
    const preset = mode === "custom" ? {} : PRESETS[mode];
    return unique(preset[key], cleanSources(allow[key]));
  }
  function buildPreviewPolicy(options = {}) {
    const mode = normalizeMode(options.mode);
    const allow = options;
    const host = normalizeOrigin(options.hostOrigin);
    const self = host || "'self'";
    const directive = (name, parts) => `${name} ${unique(parts).join(" ")}`;
    const script = () => [self, "data:", "blob:", "'unsafe-inline'", "'unsafe-eval'"].concat(sourcesFor(mode, allow, "scriptSrc"));
    const style = () => [self, "'unsafe-inline'"].concat(sourcesFor(mode, allow, "styleSrc"));
    const withData = (key) => [self, "data:", "blob:"].concat(sourcesFor(mode, allow, key));
    return [
      directive("default-src", [self, "data:", "blob:"]),
      directive("base-uri", [self]),
      "object-src 'none'",
      directive("script-src", script()),
      directive("style-src", style()),
      directive("img-src", withData("imgSrc")),
      directive("font-src", [self, "data:"].concat(sourcesFor(mode, allow, "fontSrc"))),
      directive("connect-src", withData("connectSrc")),
      directive("media-src", withData("mediaSrc")),
      directive("worker-src", [self, "blob:"].concat(sourcesFor(mode, allow, "workerSrc"))),
      directive("frame-src", withData("frameSrc")),
      directive("form-action", [self]),
      directive("frame-ancestors", [options.frameAncestors || "'self'"])
    ].join("; ");
  }
  function describePreviewNetwork(config) {
    const normalized = normalizePreviewCspConfig(config);
    if (normalized.mode === "strict") return [];
    const preset = normalized.mode === "custom" ? {} : PRESETS[normalized.mode];
    const hosts = [];
    for (const key of ["scriptSrc", "connectSrc", "imgSrc", "styleSrc", "fontSrc"]) {
      for (const source of unique(preset[key], normalized.allow[key])) {
        if (!/^https?:\/\//i.test(source)) continue;
        let host;
        try {
          host = new URL(source).host;
        } catch (_) {
          continue;
        }
        if (hosts.indexOf(host) === -1) hosts.push(host);
      }
    }
    return hosts;
  }
  function buildPreviewShims() {
    return `<script ${PREVIEW_SHIM_MARKER}>
(function () {
  'use strict';
  function memoryStorage() {
    var data = new Map();
    return {
      getItem: function (k) { k = String(k); return data.has(k) ? data.get(k) : null; },
      setItem: function (k, v) { data.set(String(k), String(v)); },
      removeItem: function (k) { data.delete(String(k)); },
      clear: function () { data.clear(); },
      key: function (i) { return Array.from(data.keys())[i] || null; },
      get length() { return data.size; }
    };
  }
  function shim(name) {
    var blocked = false;
    try {
      var existing = window[name];
      if (existing) { existing.getItem('__codelab_probe__'); return; }
    } catch (err) {
      // Expected on an opaque origin: the accessor itself throws.
      blocked = Boolean(err);
    }
    void blocked;
    try {
      Object.defineProperty(window, name, { configurable: true, value: memoryStorage() });
    } catch (err) {
      console.warn('[code-lab] preview: unable to shim ' + name, err);
    }
  }
  shim('localStorage');
  shim('sessionStorage');
  document.addEventListener('securitypolicyviolation', function (event) {
    try {
      parent.postMessage({
        type: 'codelab:preview-violation',
        directive: event.effectiveDirective || event.violatedDirective || '',
        blockedURI: event.blockedURI || '',
        sourceFile: event.sourceFile || '',
        line: event.lineNumber || 0
      }, '*');
    } catch (err) {
      console.warn('[code-lab] preview: could not report CSP violation', err);
    }
  });
  function serializeArg(arg) {
    if (typeof arg !== 'object' || arg === null) return String(arg);
    try {
      return JSON.stringify(arg);
    } catch (err) {
      void err;
      return '[Circular/Unserializable]';
    }
  }
  ['log', 'warn', 'error', 'info'].forEach(function (level) {
    var orig = console[level];
    if (typeof orig !== 'function') return;
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      try {
        parent.postMessage({
          type: 'codelab:preview-console',
          level: level,
          args: args.map(serializeArg)
        }, '*');
      } catch (err) {
        void err;
      }
      return orig.apply(console, args);
    };
  });
  function showPreviewErrorOverlay(msg, stack) {
    try {
      if (!document || !document.body) return;
      var existing = document.getElementById('codelab-preview-error-overlay');
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'codelab-preview-error-overlay';
        existing.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.94);color:#f8fafc;font-family:ui-monospace,monospace;padding:24px;overflow:auto;';
        document.body.appendChild(existing);
      }
      existing.textContent = '';
      var topBar = document.createElement('div');
      topBar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(248,113,113,0.28);';
      var header = document.createElement('div');
      header.style.cssText = 'color:#f87171;font-weight:700;font-size:14px;';
      header.textContent = 'Runtime Error: ' + String(msg || 'Uncaught Error');
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = 'Dismiss \xD7';
      closeBtn.style.cssText = 'background:rgba(255,255,255,0.08);color:#e2e8f0;border:1px solid rgba(255,255,255,0.16);border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-family:inherit;';
      closeBtn.onclick = function () { if (existing && existing.parentNode) existing.parentNode.removeChild(existing); };
      topBar.appendChild(header);
      topBar.appendChild(closeBtn);
      var pre = document.createElement('pre');
      pre.style.cssText = 'white-space:pre-wrap;font-size:12px;color:#cbd5e1;margin:0;line-height:1.55;';
      pre.textContent = String(stack || msg || '');
      existing.appendChild(topBar);
      existing.appendChild(pre);
    } catch (err) {
      void err;
    }
  }
  window.addEventListener('error', function (event) {
    var msg = (event && event.message) ? event.message : 'Uncaught runtime error';
    var stack = (event && event.error && event.error.stack) ? String(event.error.stack) : '';
    showPreviewErrorOverlay(msg, stack);
    try {
      parent.postMessage({
        type: 'codelab:preview-error',
        message: msg,
        file: (event && event.filename) || null,
        line: (event && event.lineno) || null,
        col: (event && event.colno) || null,
        stack: stack || null
      }, '*');
    } catch (err) {
      void err;
    }
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event ? event.reason : null;
    var msg = reason && reason.message ? String(reason.message) : String(reason || 'Unhandled Promise Rejection');
    var stack = reason && reason.stack ? String(reason.stack) : '';
    showPreviewErrorOverlay(msg, stack);
    try {
      parent.postMessage({
        type: 'codelab:preview-error',
        message: msg,
        file: null,
        line: null,
        col: null,
        stack: stack || null
      }, '*');
    } catch (err) {
      void err;
    }
  });

  // Virtual loopback bridge for fetch/XHR, link navigation, and SPA history in srcdoc/sandbox mode
  var pendingFetches = new Map();
  var fetchSeq = 0;
  function parseLoopbackTarget(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    var trimmed = rawUrl.trim();
    if (!trimmed) return null;
    var lower = trimmed.toLowerCase();
    if (lower.indexOf('data:') === 0 || lower.indexOf('blob:') === 0 || lower.indexOf('mailto:') === 0 || lower.indexOf('tel:') === 0 || lower.indexOf('javascript:') === 0 || trimmed.charAt(0) === '#') return null;
    if (lower.indexOf('http://') === 0 || lower.indexOf('https://') === 0) {
      try {
        var u = new URL(trimmed);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '0.0.0.0') {
          return { port: u.port ? Number(u.port) : null, path: (u.pathname || '/') + (u.search || '') + (u.hash || '') };
        }
        if (u.pathname && u.pathname.indexOf('/__preview/') === 0) {
          var rest = u.pathname.slice('/__preview/'.length);
          var slashIdx = rest.indexOf('/');
          var portStr = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
          var subPath = slashIdx === -1 ? '/' : rest.slice(slashIdx);
          var portNum = Number(portStr);
          if (portNum > 0) {
            return { port: portNum, path: (subPath || '/') + (u.search || '') + (u.hash || '') };
          }
        }
      } catch (e) { void e; }
      return null;
    }
    if (trimmed.indexOf('/__preview/') === 0) {
      var restRel = trimmed.slice('/__preview/'.length);
      var sIdx = restRel.indexOf('/');
      var pStr = sIdx === -1 ? restRel : restRel.slice(0, sIdx);
      var sPath = sIdx === -1 ? '/' : restRel.slice(sIdx);
      var pNum = Number(pStr);
      if (pNum > 0) {
        return { port: pNum, path: sPath || '/' };
      }
    }
    var cleaned = trimmed.indexOf('./') === 0 ? trimmed.slice(2) : trimmed;
    var pathPart = cleaned.charAt(0) === '/' ? cleaned : '/' + cleaned;
    return { port: null, path: pathPart };
  }

  window.addEventListener('message', function (event) {
    var data = event && event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'codelab:preview-fetch-res' && data.reqId) {
      var entry = pendingFetches.get(data.reqId);
      if (!entry) return;
      pendingFetches.delete(data.reqId);
      entry.resolve(data);
    }
  });

  if (typeof window.fetch === 'function') {
    var origFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var urlStr = typeof input === 'string' ? input : (input && typeof input.url === 'string' ? input.url : String(input || ''));
      var target = parseLoopbackTarget(urlStr);
      // Only bridge via postMessage when running inside a sandboxed/srcdoc document or targeting localhost
      var isOpaque = false;
      try {
        var lowerUrl = urlStr.toLowerCase();
        var isLocalTarget = lowerUrl.indexOf('http://localhost') === 0 || lowerUrl.indexOf('http://127.0.0.1') === 0 || lowerUrl.indexOf('http://0.0.0.0') === 0;
        isOpaque = (window.location.origin === 'null' || window.location.protocol === 'about:' || isLocalTarget);
      } catch (e) { isOpaque = true; void e; }
      if (!target || !isOpaque || window.parent === window) {
        return origFetch(input, init);
      }
      return new Promise(function (resolve, reject) {
        var reqId = 'clf_' + (++fetchSeq) + '_' + Date.now();
        var method = (init && init.method) || (input && input.method) || 'GET';
        var headersObj = {};
        try {
          var rawH = (init && init.headers) || (input && input.headers);
          if (rawH) {
            if (typeof rawH.forEach === 'function') {
              rawH.forEach(function (v, k) { headersObj[k] = v; });
            } else if (Array.isArray(rawH)) {
              rawH.forEach(function (pair) { if (pair && pair.length >= 2) headersObj[pair[0]] = pair[1]; });
            } else if (typeof rawH === 'object') {
              Object.keys(rawH).forEach(function (k) { headersObj[k] = String(rawH[k]); });
            }
          }
        } catch (e) { void e; }
        var bodyStr = (init && init.body !== undefined && init.body !== null) ? String(init.body) : undefined;
        var timer = setTimeout(function () {
          if (pendingFetches.has(reqId)) {
            pendingFetches.delete(reqId);
            origFetch(input, init).then(resolve, reject);
          }
        }, 5000);
        pendingFetches.set(reqId, {
          resolve: function (payload) {
            clearTimeout(timer);
            if (payload && payload.error) {
              reject(new TypeError(String(payload.error)));
              return;
            }
            var status = Number(payload && payload.status) || 200;
            var resHeaders = (payload && payload.headers) || { 'content-type': 'text/plain; charset=utf-8' };
            var body = payload && payload.body !== undefined ? String(payload.body) : '';
            try {
              resolve(new Response(body, { status: status, statusText: String(payload.statusText || 'OK'), headers: resHeaders }));
            } catch (err) {
              void err;
              resolve({
                ok: status >= 200 && status < 300,
                status: status,
                headers: { get: function (k) { return resHeaders[String(k).toLowerCase()] || resHeaders[k] || null; } },
                text: function () { return Promise.resolve(body); },
                json: function () { return Promise.resolve(JSON.parse(body)); }
              });
            }
          }
        });
        try {
          parent.postMessage({
            type: 'codelab:preview-fetch',
            reqId: reqId,
            port: target.port,
            path: target.path,
            method: String(method).toUpperCase(),
            headers: headersObj,
            body: bodyStr
          }, '*');
        } catch (err) {
          clearTimeout(timer);
          pendingFetches.delete(reqId);
          origFetch(input, init).then(resolve, reject);
        }
      });
    };
  }

  // Intercept relative <a href> clicks so multi-page navigation works inside srcdoc/preview
  document.addEventListener('click', function (event) {
    if (!event || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var el = event.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el || !el.getAttribute) return;
    var href = el.getAttribute('href');
    var targetAttr = el.getAttribute('target');
    if (!href || targetAttr === '_blank' || el.hasAttribute('download')) return;
    var lowerHref = href.toLowerCase();
    if (href.charAt(0) === '#' || lowerHref.indexOf('mailto:') === 0 || lowerHref.indexOf('tel:') === 0 || lowerHref.indexOf('javascript:') === 0 || lowerHref.indexOf('data:') === 0 || lowerHref.indexOf('blob:') === 0) return;
    var parsed = parseLoopbackTarget(href);
    if (!parsed) return;
    event.preventDefault();
    try {
      parent.postMessage({
        type: 'codelab:preview-navigate',
        port: parsed.port,
        path: parsed.path
      }, '*');
    } catch (e) { void e; }
  });

  // Sync SPA history.pushState / replaceState with the preview omni-address bar
  try {
    ['pushState', 'replaceState'].forEach(function (method) {
      var orig = history[method];
      if (typeof orig !== 'function') return;
      history[method] = function (state, title, url) {
        var ret;
        try { ret = orig.apply(history, arguments); } catch (e) { void e; }
        if (url !== undefined && url !== null) {
          var parsed = parseLoopbackTarget(String(url));
          if (parsed) {
            try {
              parent.postMessage({
                type: 'codelab:preview-url-change',
                path: parsed.path,
                replace: method === 'replaceState'
              }, '*');
            } catch (e) { void e; }
          }
        }
        return ret;
      };
    });
  } catch (e) { void e; }
})();
<\/script>`;
  }
  var csp_default = {
    buildPreviewPolicy,
    buildPreviewShims,
    describePreviewNetwork,
    normalizePreviewCspConfig,
    normalizeOrigin,
    PREVIEW_SHIM_MARKER
  };
  return __toCommonJS(csp_exports);
})();

/**
 * @innovatorved/code-lab — Web Preview Virtual Loopback Service Worker (Milestone 3)
 * ============================================================================
 * Intercepts same-origin requests to `/__preview/:port/*`, forwards them to the
 * live CodeLab workbench window via a MessageChannel bridge, and streams the
 * in-browser virtual runtime's response back to the requesting tab.
 *
 * This enables "pop out to tab" Web Preview for virtual HTTP / Bun servers that
 * exist only inside the workbench's in-memory runtime (no real OS socket).
 *
 * The Content-Security-Policy, the storage shims and the violation reporter all
 * come from `src/csp.ts`, which the build prepends to this file. The workbench
 * embeds the same module, so the two can never drift.
 *
 * Zero dependencies. Plain Service Worker script (no module imports) so it can
 * be registered directly from any host origin.
 */

'use strict';

const PREVIEW_PREFIX = '/__preview/';
const DISPATCH_TIMEOUT_MS = 15000;
const MAX_CONFIG_LENGTH = 8192;

// Policy configured by the workbench via postMessage. The worker cannot read the
// host's options, so the host pushes the resolved policy after registering.
let configuredCsp = null;

function cspModule() {
  // `CodeLabCsp` is declared by the prepended csp bundle (src/csp.ts).
  return typeof CodeLabCsp !== 'undefined' ? CodeLabCsp : null;
}

function previewPolicy() {
  if (configuredCsp) return configuredCsp;
  const csp = cspModule();
  if (!csp) return "default-src 'self'; object-src 'none'";
  // The workbench pushes its resolved policy on registration, so this branch
  // only runs in the brief window before that message arrives. Use the
  // documented default (`balanced`) rather than a stricter one, otherwise the
  // very first preview of a CDN-based app can be blocked by a race.
  return csp.buildPreviewPolicy({ hostOrigin: self.location.origin, mode: 'balanced' });
}

function previewShims() {
  const csp = cspModule();
  return csp ? csp.buildPreviewShims() : '';
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event && event.data;
  if (!data || data.type !== 'codelab:config') return;
  const csp = typeof data.csp === 'string' ? data.csp.trim() : '';
  if (!csp || csp.length > MAX_CONFIG_LENGTH) return;
  configuredCsp = csp;
  // Acknowledge so the host can wait for confirmation before loading a frame.
  try {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'codelab:config-ready' });
    } else if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage({ type: 'codelab:config-ready' });
    }
  } catch (err) {
    // The client may have navigated away between postMessage and reply.
    console.warn('[code-lab] preview-sw: config acknowledgement failed', err);
  }
});

function parsePreviewPath(pathname) {
  const match = pathname.match(/^\/__preview\/(\d+)(\/.*)?$/);
  if (!match) return null;
  return { port: Number(match[1]), path: match[2] || '/' };
}

function previewErrorResponse(status, title, message) {
  const csp = previewPolicy();
  const body = `<!doctype html><meta charset="utf-8">` +
    `<meta http-equiv="Content-Security-Policy" content="${csp}">` +
    `<title>${title}</title>` +
    `<body style="font-family:system-ui,-apple-system,sans-serif;padding:32px;color:#666;background:#0a0a0a">` +
    `<h1 style="color:#e5e5e5;font-size:18px">${title}</h1><p>${message}</p></body>`;
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': csp,
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

/** Inject the policy, a base URL and the sandbox shims into an HTML response. */
function injectPreviewHead(html, port) {
  const csp = previewPolicy();
  const shims = previewShims();
  const tags = [];
  const hasCsp = /<meta[^>]+http-equiv=["']?content-security-policy/i.test(html);
  const hasBase = /<base\b/i.test(html);
  const hasShims = html.indexOf('data-codelab-preview-shims') !== -1;

  if (!hasCsp) tags.push(`<meta http-equiv="Content-Security-Policy" content="${csp}">`);
  if (!hasBase) tags.push(`<base href="${PREVIEW_PREFIX}${port}/">`);
  if (!hasShims && shims) tags.push(shims);
  if (tags.length === 0) return html;

  const injection = tags.join('');
  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (match) => match + injection);
  }
  if (/<html\b[^>]*>/i.test(html)) {
    return html.replace(/<html\b[^>]*>/i, (match) => `${match}<head>${injection}</head>`);
  }
  return `<head>${injection}</head>${html}`;
}

async function proxyVirtualRequest(event, port, targetPath) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (!clients || !clients.length) {
    return previewErrorResponse(
      503,
      'No active CodeLab workbench',
      'Return to the CodeLab IDE tab so the virtual runtime can serve this preview.'
    );
  }

  const client = clients[0];
  const channel = new MessageChannel();
  const request = event.request;
  const method = request.method || 'GET';

  const headers = {};
  try {
    for (const [key, value] of request.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }
  } catch (err) {
    // Opaque or unsupported header collection; forward without request headers.
    console.warn('[code-lab] preview-sw: could not read request headers', err);
  }

  let body = null;
  if (!['GET', 'HEAD'].includes(method)) {
    try {
      body = await request.arrayBuffer();
    } catch (err) {
      console.warn('[code-lab] preview-sw: could not read request body', err);
    }
  }

  const response = await new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        status: 504,
        statusText: 'Gateway Timeout',
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>504 Gateway Timeout</h1><p>The virtual workbench did not respond in time.</p>'
      });
    }, DISPATCH_TIMEOUT_MS);

    channel.port1.onmessage = (messageEvent) => {
      clearTimeout(timer);
      resolve(messageEvent.data);
    };

    client.postMessage(
      {
        type: 'CODELAB_SW_DISPATCH',
        port,
        url: `http://127.0.0.1:${port}${targetPath}`,
        method,
        headers,
        body
      },
      [channel.port2]
    );
  });

  let responseBody = response && response.body;
  const responseHeaders = new Headers((response && response.headers) || {});
  const contentType = responseHeaders.get('content-type') || '';

  // Inject the policy and a <base> so relative asset URLs in HTML responses
  // resolve under the `/__preview/:port/` namespace rather than the host root.
  if (/text\/html/i.test(contentType) && typeof responseBody === 'string') {
    responseBody = injectPreviewHead(responseBody, port);
    responseHeaders.set('Content-Security-Policy', previewPolicy());
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
  }

  return new Response(responseBody, {
    status: (response && response.status) || 200,
    statusText: (response && response.statusText) || 'OK',
    headers: responseHeaders
  });
}

self.addEventListener('fetch', (event) => {
  let url;
  try {
    url = new URL(event.request.url);
  } catch (err) {
    // Non-standard request URL; let the network handle it.
    console.warn('[code-lab] preview-sw: unparsable request URL', err);
    return;
  }

  // Only handle requests on this origin (never proxy third-party traffic).
  if (url.origin !== self.location.origin) return;

  const direct = parsePreviewPath(url.pathname);
  if (direct) {
    const targetPath = (direct.path || '/') + (url.search || '');
    event.respondWith(proxyVirtualRequest(event, direct.port, targetPath));
    return;
  }

  // Secondary route: root-relative sub-resources requested by a preview page
  // (e.g. `/app.js` referenced from `/__preview/3000/`) are attributed to the
  // originating preview tab via the request referrer.
  const referrer = event.request.referrer || '';
  const refMatch = referrer.match(/\/__preview\/(\d+)/);
  if (refMatch) {
    event.respondWith(
      proxyVirtualRequest(event, Number(refMatch[1]), url.pathname + (url.search || ''))
    );
  }
});
