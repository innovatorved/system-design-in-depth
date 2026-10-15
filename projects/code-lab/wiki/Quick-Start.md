# Quick Start

Get `@innovatorved/code-lab` up and running in your project.

---

## 1. Installation

### Via NPM
```bash
npm install @innovatorved/code-lab
```

### Via CDN (Zero Build Tools)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.css">
<script src="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.js"></script>
```

---

## 2. Minimal Example (JavaScript)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeLab Demo</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.css">
  <style>
    body { margin: 0; background: #0a0a0a; }
    #editor { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor"></div>

  <script src="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.js"></script>
  <script>
    const workbench = CodeLab.mount('#editor', {
      id: 'my-first-lab',
      title: 'HTTP Rate Limiter',
      mode: 'sandbox',
      language: 'ts',
      entry: 'server.ts',
      files: {
        'server.ts': `import { serve } from 'bun';

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response(JSON.stringify({ status: 'ok', time: Date.now() }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

console.log(\`Server listening on http://localhost:\${server.port}\`);
`,
        'README.md': `# Rate Limiter Lab\n\nRun the server and test it using the integrated terminal:\n\`\`\`bash\nbun run server.ts &\ncurl -i http://localhost:3000\n\`\`\`\n`
      }
    });
  </script>
</body>
</html>
```

---

## 3. Web Component (`<code-lab>`)

CodeLab registers a custom element `<code-lab>` automatically:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.css">
<script src="https://cdn.jsdelivr.net/npm/@innovatorved/code-lab/dist/code-lab.js"></script>

<code-lab mode="sandbox" language="ts" style="height: 650px;">
  <script type="application/json">
    {
      "id": "rate-limiter",
      "title": "Sliding Window Rate Limiter",
      "entry": "demo.js",
      "testEntry": "test.js",
      "files": {
        "limiter.js": "class RateLimiter { constructor(max) { this.max = max; } } module.exports = { RateLimiter };",
        "demo.js": "const { RateLimiter } = require('./limiter'); console.log('Limiter ready');",
        "test.js": "const { test } = require('node:test'); const assert = require('node:assert/strict'); test('passes', () => assert.ok(true));"
      }
    }
  </script>
</code-lab>
```

---

## 4. Headless Execution (No Editor / UI)

To run code, tests, or bash pipelines programmatically without rendering Monaco:

```js
import { executeInWorker } from '@innovatorved/code-lab/runtime';

const result = await executeInWorker({
  mode: 'test',
  entry: 'test.js',
  files: {
    'math.js': 'module.exports = { add: (a, b) => a + b };',
    'test.js': `
      const { test } = require('node:test');
      const assert = require('node:assert/strict');
      const { add } = require('./math');

      test('adds two numbers correctly', () => {
        assert.equal(add(2, 3), 5);
      });
    `
  }
});

console.log('Passed:', result.ok);
console.log('Test Count:', result.testResults.length);
console.log('Duration:', result.durationMs, 'ms');
```
