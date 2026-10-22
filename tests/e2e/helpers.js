const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const SYSTEM_DESIGN_ROOT = path.resolve(__dirname, '../..');
const CODE_LAB_ROOT = '/Users/vedgupta/Desktop/code-lab';
const PUPPETEER_PATH = '/Users/vedgupta/Desktop/code-lab/examples/cloud-ide/node_modules/puppeteer';

const BUILD_SLUGS = [
  'bloom-filter-membership',
  'consistent-hashing-ring',
  'gossip-protocol',
  'hyperloglog-cardinality',
  'keyset-pagination-cursors',
  'lease-leader-election',
  'load-balancer-from-scratch',
  'lru-cache',
  'lsm-tree-kv-store',
  'merkle-anti-entropy',
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
      if (!fs.existsSync(filePath)) {
        const spaPrefixes = ['/roadmap', '/challenges', '/dashboard', '/sandbox'];
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
      const port = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        port,
        baseUrl,
        close: () => new Promise(cb => server.close(cb))
      });
    });
  });
}

function getPuppeteer() {
  return require(PUPPETEER_PATH);
}

async function launchBrowser() {
  const puppeteer = getPuppeteer();
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

module.exports = {
  SYSTEM_DESIGN_ROOT,
  CODE_LAB_ROOT,
  BUILD_SLUGS,
  hashOf,
  runCommand,
  startStaticServer,
  getPuppeteer,
  launchBrowser
};
