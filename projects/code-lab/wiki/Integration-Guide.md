# Integration Guide

How to integrate `@innovatorved/code-lab` into React, Next.js, Vite, and plain JavaScript frameworks.

---

## 1. React Integration

Create a reusable `CodeLabEditor` component:

```tsx
// CodeLabEditor.tsx
import React, { useEffect, useRef } from 'react';
import CodeLab, { CodeLabWorkbench, CodeLabOptions } from '@innovatorved/code-lab';
import '@innovatorved/code-lab/dist/code-lab.css';

interface CodeLabProps extends CodeLabOptions {
  className?: string;
  style?: React.CSSProperties;
}

export const CodeLabEditor: React.FC<CodeLabProps> = ({ className, style, ...options }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const workbenchRef = useRef<CodeLabWorkbench | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Mount workbench
    workbenchRef.current = CodeLab.mount(containerRef.current, {
      ...options,
      persistState: options.persistState ?? true
    });

    // Cleanup on unmount
    return () => {
      if (workbenchRef.current) {
        workbenchRef.current.destroy();
        workbenchRef.current = null;
      }
    };
  }, [options.id]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '600px', ...style }}
    />
  );
};
```

### Usage in React
```tsx
import { CodeLabEditor } from './CodeLabEditor';

export function App() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <CodeLabEditor
        id="react-demo-lab"
        title="Distributed KV Store"
        mode="sandbox"
        language="ts"
        entry="index.ts"
        files={{
          'index.ts': 'console.log("KV Store initialized");',
          'store.ts': 'export class Store { private m = new Map(); }'
        }}
        onRun={(res) => console.log('Run finished:', res)}
      />
    </div>
  );
}
```

---

## 2. Next.js (App Router / SSR)

Because Monaco Editor and Web Workers require browser APIs (`window`, `Worker`, `Blob`), use dynamic client loading:

```tsx
// app/labs/[slug]/page.tsx
'use client';

import dynamic from 'next/dynamic';

const CodeLabEditor = dynamic(
  () => import('./CodeLabEditor').then((mod) => mod.CodeLabEditor),
  { ssr: false, loading: () => <div style={{ background: '#0a0a0a', height: '100vh', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading CodeLab IDE...</div> }
);

export default function LabPage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ height: '100vh' }}>
      <CodeLabEditor
        id={`lab-${params.slug}`}
        title={`Lab: ${params.slug}`}
        mode="guided"
        language="js"
        files={{
          'demo.js': 'console.log("Demo running");',
          'test.js': 'const { test } = require("node:test"); test("ok", () => {});'
        }}
      />
    </main>
  );
}
```

---

## 3. Vite / Vanilla ESM

```ts
// main.ts
import CodeLab from '@innovatorved/code-lab';
import '@innovatorved/code-lab/dist/code-lab.css';

const container = document.getElementById('app')!;

const lab = CodeLab.mount(container, {
  id: 'vite-sandbox',
  title: 'Vite Embedded CodeLab',
  mode: 'sandbox',
  language: 'ts',
  files: {
    'index.ts': 'console.log("Vite + CodeLab");'
  }
});

// Imperative API access
lab.on('change', () => {
  console.log('Files changed:', lab.getFiles());
});
```

---

## 4. Theming (Dark / Light / Auto)

CodeLab uses the **Geist Monochrome** design system with semantic CSS tokens.

To enforce theme programmatically:
```ts
CodeLab.mount('#editor', {
  theme: 'dark', // 'dark' | 'light' | 'auto'
  // ...
});
```

To sync with your website's `data-theme` attribute, CodeLab automatically inspects:
1. `document.documentElement.getAttribute('data-theme')`
2. `options.theme`
3. `prefers-color-scheme` media query

You can override variables in your stylesheet:
```css
/* Custom theme overrides */
.codelab-workbench {
  --cl-bg: #0d1117;
  --cl-bg-panel: #161b22;
  --cl-border: #30363d;
  --cl-fg: #f0f6fc;
}
```
