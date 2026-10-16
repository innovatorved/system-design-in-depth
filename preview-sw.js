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
 * Zero dependencies. Plain Service Worker script (no module imports) so it can
 * be registered directly from any host origin.
 */

'use strict';

const PREVIEW_PREFIX = '/__preview/';
const DISPATCH_TIMEOUT_MS = 15000;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function parsePreviewPath(pathname) {
  const match = pathname.match(/^\/__preview\/(\d+)(\/.*)?$/);
  if (!match) return null;
  return { port: Number(match[1]), path: match[2] || '/' };
}

function previewErrorResponse(status, title, message) {
  const body = `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
    `<body style="font-family:system-ui,-apple-system,sans-serif;padding:32px;color:#666;background:#0a0a0a">` +
    `<h1 style="color:#e5e5e5;font-size:18px">${title}</h1><p>${message}</p></body>`;
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
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
  } catch (_) {}

  let body = null;
  if (!['GET', 'HEAD'].includes(method)) {
    try {
      body = await request.arrayBuffer();
    } catch (_) {}
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

  // Inject a <base> so relative asset URLs in HTML responses resolve under the
  // `/__preview/:port/` namespace rather than the host document root.
  if (/text\/html/i.test(contentType) && typeof responseBody === 'string') {
    const baseTag = `<base href="${PREVIEW_PREFIX}${port}/">`;
    if (!/<base\b/i.test(responseBody) && /<head\b/i.test(responseBody)) {
      responseBody = responseBody.replace(/<head\b[^>]*>/i, (match) => match + baseTag);
    }
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
  } catch (_) {
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
