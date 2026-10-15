# HTTP Servers, Networking & Port Preview

CodeLab features an in-memory loopback network stack that allows users to build, run, and test real HTTP and TCP servers inside the browser.

---

## 1. How It Works

1. **Virtual Port Table**: When your code calls `http.createServer().listen(3000)` or `Bun.serve({ port: 3000, fetch })`, the runtime allocates port `3000` in an in-memory port registry.
2. **Loopback Interception**: Any call to `curl http://localhost:3000/...` in the terminal, or `fetch('http://localhost:3000/...')` / `http.request()` in user code, intercepts the request and feeds it directly into the running server instance.
3. **External Traffic Fallback**: Requests to external domains (`https://api.github.com` or `https://cdn.jsdelivr.net`) pass through standard browser `fetch()`.

---

## 2. Running Servers in the Background

To keep a server listening while executing other shell commands, launch it as a background job (`&`):

```bash
# Start server in background
node server.js &
# [1] 101 Running: node server.js

# Check active ports
ports
# PORT   PID   SERVER
# 3000   101   Bun.serve / http.Server

# Query the server with curl
curl -i http://localhost:3000/api/status

# Send POST payload
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' http://localhost:3000/items

# Stop the server
kill 101
```

---

## 3. Node.js `http.createServer` Example

```js
// server.js
const http = require('node:http');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(8080, () => {
  console.log('HTTP Server listening on port 8080');
});
```

---

## 4. Bun `Bun.serve` Example

```ts
// server.ts
import { serve } from 'bun';

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/items' && req.method === 'POST') {
      return req.json().then(body => {
        return Response.json({ created: true, body }, { status: 201 });
      });
    }

    return Response.json({ server: 'Bun', time: Date.now() });
  }
});

console.log(`Listening on http://localhost:${server.port}`);
```

---

## 5. IDE Bottom Drawer Tabs (`Ports`, `Network`, `Virtual Disk & HTTP`)

In the CodeLab bottom drawer:
- **Ports (`ports`)**: Lists all active virtual listening ports (`VirtualPortTable`, e.g., `localhost:3000`) and embeds an interactive **Mini HTTP Client** (Method selector, URL bar, Headers, Request Body, and Preview / Raw JSON / Headers response viewer).
- **Network (`network`)**: Displays a live HTTP & TCP loopback trace waterfall with status badges, HTTP methods, latency (`ms`) bars, filter/search, and request/response payload inspection.
- **Virtual Disk & HTTP (`inspector`)**: Displays a side-by-side snapshot of the in-memory POSIX Virtual File System (with 16-byte hex dumps and UTF-8 previews) and virtual loopback HTTP trace cards.

