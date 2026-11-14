const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const SYSTEM_DESIGN_ROOT = path.resolve(__dirname, '../..');
const CODE_LAB_ROOT = process.env.CODE_LAB_ROOT || path.resolve(SYSTEM_DESIGN_ROOT, '../code-lab');

const BUILD_SLUGS = [
  'bloom-filter-membership',
  'circuit-breaker',
  'consistent-hashing-ring',
  'gossip-protocol',
  'hyperloglog-cardinality',
  'keyset-pagination-cursors',
  'lease-leader-election',
  'load-balancer-from-scratch',
  'lru-cache',
  'lsm-tree-kv-store',
  'merkle-anti-entropy',
  'mini-kafka-log',
  'outbox-cdc-relay',
  'raft-consensus',
  'singleflight-coalescer',
  'sliding-window-rate-limiter',
  'snowflake-id-generator',
  'tiny-search-engine',
  'ttl-cache-reaper',
  'write-ahead-log'
];

function hashOf(buf) {
  const str = Buffer.isBuffer(buf) ? buf.toString('utf8') : String(buf);
  return crypto.createHash('sha1').update(str.replace(/\r\n/g, '\n')).digest('hex').slice(0, 10);
}

function runCommand(command, args, cwd = SYSTEM_DESIGN_ROOT, env = process.env) {
  const res = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8'
  });
  return {
    code: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    error: res.error
  };
}

function startStaticServer(serveRoot) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath.endsWith('/')) reqPath += 'index.html';
      let filePath = path.join(serveRoot, reqPath);
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      }
      if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        const spaPrefixes = ['/roadmap', '/challenges', '/dashboard', '/sandbox', '/glossary', '/projects'];
        if (spaPrefixes.some(p => reqPath === p || reqPath.startsWith(p + '/'))) {
          filePath = path.join(serveRoot, 'index.html');
        }
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found: ' + reqPath);
        return;
      }
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        if (fs.existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Directory listing disabled');
          return;
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(0, '127.0.0.1', (err) => {
      if (err) return reject(err);
      server.unref();
      const port = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        port,
        baseUrl,
        close: () => new Promise(cb => {
          if (typeof server.closeAllConnections === 'function') {
            server.closeAllConnections();
          }
          server.close(() => cb());
        })
      });
    });
  });
}

function resolvePlaywright() {
  const candidates = [
    '@playwright/test',
    'playwright',
    'playwright-core',
    path.join(SYSTEM_DESIGN_ROOT, 'node_modules/@playwright/test'),
    path.join(CODE_LAB_ROOT, 'node_modules/@playwright/test')
  ];
  for (const mod of candidates) {
    try {
      const loaded = require(mod);
      if (loaded && loaded.chromium) return loaded;
    } catch (_) {}
  }
  return null;
}

function resolvePuppeteer() {
  const candidates = [
    'puppeteer',
    path.join(SYSTEM_DESIGN_ROOT, 'node_modules/puppeteer'),
    path.join(CODE_LAB_ROOT, 'node_modules/puppeteer')
  ];
  for (const mod of candidates) {
    try {
      return require(mod);
    } catch (_) {}
  }
  return null;
}

function mapNavOptions(opts) {
  if (!opts || typeof opts !== 'object') return undefined;
  const copy = { ...opts };
  if (copy.waitUntil === 'networkidle0' || copy.waitUntil === 'networkidle2') {
    copy.waitUntil = 'load';
  }
  return copy;
}

function wrapPlaywrightPage(pwPage) {
  const requestHandlers = [];
  let interceptionEnabled = false;

  return {
    setViewport: ({ width, height }) => pwPage.setViewportSize({ width, height }),
    goto: async (url, opts) => {
      const isIdle = opts && (opts.waitUntil === 'networkidle0' || opts.waitUntil === 'networkidle2');
      const res = await pwPage.goto(url, mapNavOptions(opts));
      if (isIdle) {
        await pwPage.waitForLoadState('networkidle', { timeout: 1200 }).catch(() => {});
      }
      return res;
    },
    reload: (opts) => pwPage.reload(mapNavOptions(opts)),
    goBack: (opts) => pwPage.goBack(mapNavOptions(opts)),
    goForward: (opts) => pwPage.goForward(mapNavOptions(opts)),
    $: (sel) => pwPage.$(sel),
    $$: (sel) => pwPage.$$(sel),
    $eval: (sel, fn, ...args) => pwPage.$eval(sel, fn, args[0]),
    $$eval: (sel, fn, ...args) => pwPage.$$eval(sel, fn, args[0]),
    evaluate: (fn, ...args) => pwPage.evaluate(fn, args.length > 0 ? args[0] : undefined),
    waitForSelector: (sel, opts) => pwPage.waitForSelector(sel, opts),
    waitForFunction: (fn, opts = {}, ...args) =>
      pwPage.waitForFunction(fn, args.length > 0 ? args[0] : undefined, opts),
    click: (sel, opts) => pwPage.click(sel, opts),
    type: (sel, text, opts) => pwPage.type(sel, text, opts),
    url: () => pwPage.url(),
    close: () => pwPage.close(),
    setRequestInterception: async (enabled) => {
      if (enabled && !interceptionEnabled) {
        interceptionEnabled = true;
        await pwPage.route('**/*', async (route) => {
          if (requestHandlers.length === 0) {
            await route.continue();
            return;
          }
          let handled = false;
          const reqShim = {
            url: () => route.request().url(),
            abort: async () => {
              if (handled) return;
              handled = true;
              await route.abort().catch(() => {});
            },
            continue: async () => {
              if (handled) return;
              handled = true;
              await route.continue().catch(() => {});
            }
          };
          for (const h of requestHandlers) {
            await h(reqShim);
          }
          if (!handled) {
            await route.continue().catch(() => {});
          }
        });
      }
    },
    on: (event, handler) => {
      if (event === 'request') {
        requestHandlers.push(handler);
      } else {
        pwPage.on(event, handler);
      }
    }
  };
}

async function launchBrowser() {
  const puppeteer = resolvePuppeteer();
  if (puppeteer) {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  }

  const pw = resolvePlaywright();
  if (!pw) {
    throw new Error('Neither Playwright nor Puppeteer is installed for headless E2E tests.');
  }

  const pwBrowser = await pw.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const context = await pwBrowser.newContext({ viewport: { width: 1440, height: 900 } });

  return {
    newPage: async () => {
      const pwPage = await context.newPage();
      return wrapPlaywrightPage(pwPage);
    },
    close: async () => {
      await context.close().catch(() => {});
      await pwBrowser.close().catch(() => {});
    }
  };
}

module.exports = {
  SYSTEM_DESIGN_ROOT,
  CODE_LAB_ROOT,
  BUILD_SLUGS,
  hashOf,
  runCommand,
  startStaticServer,
  resolvePuppeteer,
  launchBrowser
};
