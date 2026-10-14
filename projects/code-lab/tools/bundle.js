/**
 * Build script for @innovatorved/code-lab
 *
 * Concatenates modular source files in projects/code-lab/src/ into:
 *   1. js/code-lab.js                         (site-embedded IIFE bundle)
 *   2. projects/code-lab/dist/code-lab.js     (standalone UMD/IIFE bundle)
 *   3. projects/code-lab/dist/code-lab.esm.js (standalone ESM bundle)
 *   4. projects/code-lab/dist/runtime.js      (headless runtime IIFE bundle)
 *   5. projects/code-lab/dist/runtime.esm.js  (headless runtime ESM bundle)
 *   6. projects/code-lab/dist/code-lab.css    (standalone stylesheet)
 *   7. projects/code-lab/dist/code-lab.d.ts   (TypeScript definitions)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const PKG_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PKG_DIR, 'src');
const DIST_DIR = path.join(PKG_DIR, 'dist');

const runtimeCode = fs.readFileSync(path.join(SRC_DIR, 'runtime.js'), 'utf8');
const workbenchCode = fs.readFileSync(path.join(SRC_DIR, 'workbench.js'), 'utf8');
const cssPath = path.join(ROOT, 'css', 'code-lab.css');

const BANNER = `/**
 * ============================================================
 * @innovatorved/code-lab v1.1.0 — Standalone Browser Code IDE & Virtual Runtime
 * ============================================================
 * Features:
 *   - Sandboxed Web Worker Execution Engine with Watchdog Timer & Instant Stop
 *   - TypeScript/JSX Compiler & CommonJS/ESM Module Bundler
 *   - Virtual File System (fs, path, crypto, events, http, timers)
 *   - Built-in Assertion & Test Runner Framework (describe, it, expect, assert)
 *   - Multi-file Tabbed Monaco IDE + Offline Line-Numbered Fallback Editor
 *   - Resizable Split Panes, Step-by-Step Guided Mode, Fullscreen & Light/Dark Themes
 *   - Embeddable via <code-lab>, CodeLab.create(container, options), or ESM imports
 * ============================================================
 */
`;

const IIFE_BUNDLE = `${BANNER}(function (root) {
  'use strict';

  // --- Module 1: Runtime Engine ---
  (function () {
${runtimeCode}
  })();

  const CodeLabRuntime = root.CodeLabRuntime;

  // --- Module 2: IDE Workbench & Web Component ---
  (function () {
${workbenchCode}
  })();

  const CodeLab = root.CodeLab;
  const CodeLabWorkbench = root.CodeLabWorkbench;
  const CodeLabElement = root.CodeLabElement;

  // Support CommonJS / Node.js / Bundlers
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Object.assign({}, CodeLab, {
      CodeLab: CodeLab,
      CodeLabWorkbench: CodeLabWorkbench,
      CodeLabElement: CodeLabElement,
      CodeLabRuntime: CodeLabRuntime,
      executeInVirtualRuntime: CodeLabRuntime.executeInVirtualRuntime,
      executeInWorker: CodeLabRuntime.executeInWorker,
      cancelWorkerExecution: CodeLabRuntime.cancelWorkerExecution,
      preloadNpmPackages: CodeLabRuntime.preloadNpmPackages,
      transpileTS: CodeLabRuntime.transpileTS,
      createVirtualFs: CodeLabRuntime.createVirtualFs,
      createVirtualHttp: CodeLabRuntime.createVirtualHttp,
      createVirtualNet: CodeLabRuntime.createVirtualNet,
      default: CodeLab
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
`;

const ESM_BUNDLE = `${BANNER}const _root = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};

// --- Module 1: Runtime Engine ---
(function () {
${runtimeCode}
})();

// --- Module 2: IDE Workbench & Web Component ---
(function () {
${workbenchCode}
})();

const CodeLabRuntime = _root.CodeLabRuntime;
const CodeLabWorkbench = _root.CodeLabWorkbench;
const CodeLabElement = _root.CodeLabElement;
const CodeLab = _root.CodeLab;

const executeInVirtualRuntime = CodeLabRuntime.executeInVirtualRuntime;
const executeInWorker = CodeLabRuntime.executeInWorker;
const cancelWorkerExecution = CodeLabRuntime.cancelWorkerExecution;
const preloadNpmPackages = CodeLabRuntime.preloadNpmPackages;
const transpileTS = CodeLabRuntime.transpileTS;
const createVirtualFs = CodeLabRuntime.createVirtualFs;
const createVirtualHttp = CodeLabRuntime.createVirtualHttp;
const createVirtualNet = CodeLabRuntime.createVirtualNet;

export {
  CodeLab,
  CodeLabWorkbench,
  CodeLabElement,
  CodeLabRuntime,
  executeInVirtualRuntime,
  executeInWorker,
  cancelWorkerExecution,
  preloadNpmPackages,
  transpileTS,
  createVirtualFs,
  createVirtualHttp,
  createVirtualNet
};
export default CodeLab;
`;

const RUNTIME_IIFE = `${BANNER}(function (root) {
  'use strict';
  (function () {
${runtimeCode}
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.CodeLabRuntime;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
`;

const RUNTIME_ESM = `${BANNER}const _root = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};
(function () {
${runtimeCode}
})();

const CodeLabRuntime = _root.CodeLabRuntime;
const executeInVirtualRuntime = CodeLabRuntime.executeInVirtualRuntime;
const executeInWorker = CodeLabRuntime.executeInWorker;
const cancelWorkerExecution = CodeLabRuntime.cancelWorkerExecution;
const preloadNpmPackages = CodeLabRuntime.preloadNpmPackages;
const transpileTS = CodeLabRuntime.transpileTS;
const createVirtualFs = CodeLabRuntime.createVirtualFs;
const createVirtualHttp = CodeLabRuntime.createVirtualHttp;
const createVirtualNet = CodeLabRuntime.createVirtualNet;

export {
  CodeLabRuntime,
  executeInVirtualRuntime,
  executeInWorker,
  cancelWorkerExecution,
  preloadNpmPackages,
  transpileTS,
  createVirtualFs,
  createVirtualHttp,
  createVirtualNet
};
export default CodeLabRuntime;
`;

const DTS_CONTENT = `/**
 * TypeScript Definitions for @innovatorved/code-lab
 */

export interface CodeLabStep {
  id: string;
  title: string;
  concept?: string;
  targetFile?: string;
  targetSymbol?: string;
  instructions: string;
  hint?: string;
  testNames?: string[];
}

export interface CodeLabTestError {
  name: string;
  message: string;
  stack: string;
  actual?: string;
  expected?: string;
  operator?: string;
}

export interface CodeLabTestResultItem {
  index: number;
  name: string;
  status: 'pass' | 'fail';
  passed: boolean;
  durationMs: number;
  error: CodeLabTestError | null;
}

export interface CodeLabFsSnapshotItem {
  path: string;
  size: number;
  isDirectory: boolean;
  mtimeMs: number;
  preview?: string;
  hexPreview?: string;
}

export interface CodeLabHttpTraceItem {
  protocol?: string;
  method?: string;
  port: number;
  url?: string;
  status?: number;
  durationMs: number;
}

export interface CodeLabExecutionOptions {
  files?: Record<string, string>;
  entry?: string;
  mode?: 'run' | 'test' | 'repl';
  replCode?: string;
  testFilter?: string | string[] | null;
  timeoutMs?: number;
  maxOutputBytes?: number;
  maxConsoleCalls?: number;
  packages?: Record<string, any>;
  npmModules?: Record<string, any>;
  onStdout?: (text: string) => void;
  onStderr?: (text: string) => void;
  onTestResult?: (testResult: CodeLabTestResultItem) => void;
}

export interface CodeLabExecutionResult {
  ok: boolean;
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
  outputTruncated?: boolean;
  timedOut?: boolean;
  cancelled?: boolean;
  error?: { message: string; stack?: string };
  testResults: CodeLabTestResultItem[];
  testSummary?: {
    total: number;
    passed: number;
    failed: number;
  };
  fsSnapshot: CodeLabFsSnapshotItem[];
  httpTrace: CodeLabHttpTraceItem[];
  replValue?: string;
  replResult?: string;
}

export interface CodeLabOptions {
  /** Unique identifier used for localStorage persistence */
  id?: string;
  labId?: string;
  buildId?: string;
  /** Title displayed in the IDE header */
  title?: string;
  /** Subtitle / summary displayed in the guide panel when README.md is absent */
  summary?: string;
  /** Initial workbench mode ('guided' | 'sandbox') */
  mode?: 'guided' | 'sandbox';
  /** Initial workspace language ('js' | 'ts') */
  language?: 'js' | 'ts';
  lang?: 'js' | 'ts';
  /** Explicit theme override ('dark' | 'light' | 'auto') */
  theme?: 'dark' | 'light' | 'auto';
  /** Reference/solution files map (filename -> source content) */
  files?: Record<string, string>;
  /** Explicit reference solution files map (JavaScript) */
  solutionFiles?: Record<string, string>;
  /** Initial starter files map for guided mode (JavaScript) */
  starterFiles?: Record<string, string>;
  /** Explicit TypeScript files map for sandbox mode */
  tsFiles?: Record<string, string>;
  tsSolutionFiles?: Record<string, string>;
  /** Explicit TypeScript starter files map for guided mode */
  tsStarterFiles?: Record<string, string>;
  /** Ordered guided steps */
  steps?: CodeLabStep[];
  /** Initial active step index (0-based) */
  stepIndex?: number;
  /** Demo entry point file to execute on runDemo() (default: 'demo.js' / 'demo.ts') */
  entry?: string;
  /** Test suite entry point file to execute on runTests() (default: 'test.js' / 'test.ts') */
  testEntry?: string;
  testFile?: string;
  /** Label for the back button when onClose is provided */
  backLabel?: string;
  /** Custom Monaco AMD loader base URL */
  monacoUrl?: string;
  /** Callback fired when the back/close button is clicked */
  onClose?: () => void;
  /** Callback fired when a guided step passes all its testNames */
  onStepComplete?: (step: CodeLabStep, stepIndex: number) => void;
  /** Callback fired when all guided steps in the lab are completed */
  onLabComplete?: (labId: string) => void;
  /** Callback fired whenever runDemo() or runTests() finishes */
  onRun?: (result: CodeLabExecutionResult) => void;
  /** Callback fired when runTests() finishes */
  onTestResult?: (result: CodeLabExecutionResult) => void;
  /** Callback fired whenever a file is edited */
  onCodeChange?: (filename: string, code: string) => void;
}

export declare class CodeLabWorkbench {
  container: HTMLElement;
  labId: string;
  title: string;
  summary: string;
  options: CodeLabOptions;
  files: Record<string, string>;
  activeFile: string;
  mode: 'guided' | 'sandbox';
  lang: 'js' | 'ts';
  activeStepIndex: number;
  completedSteps: Set<string>;
  steps: CodeLabStep[];
  isRunning: boolean;
  isFullscreen: boolean;
  constructor(container: HTMLElement | string, options?: CodeLabOptions);
  runDemo(): Promise<void>;
  runTests(filterTestNames?: string | string[] | null): Promise<void>;
  verifyCurrentStep(): Promise<void>;
  stopExecution(): void;
  cancelExecution(): void;
  selectStep(idx: number, shouldJump?: boolean): void;
  openFile(filename: string, symbolToFind?: string): void;
  createFile(rawName: string): void;
  promptNewFile(): void;
  deleteFile(filename: string): void;
  setMode(newMode: 'guided' | 'sandbox'): void;
  setLanguage(newLang: 'js' | 'ts'): void;
  configure(opts?: { mode?: 'guided' | 'sandbox'; lang?: 'js' | 'ts'; stepIndex?: number }): void;
  showPackagesModal(): void;
  addNpmPackage(rawSpec: string): void;
  showSolutionModal(): void;
  applyReferenceSolution(): void;
  closeModal(): void;
  resetLab(): void;
  toggleFullscreen(): void;
  destroy(): void;
}

export declare class CodeLabElement extends HTMLElement {
  _instance: CodeLabWorkbench | null;
}

export interface CodeLabRuntimeAPI {
  executeInVirtualRuntime(options?: CodeLabExecutionOptions): Promise<CodeLabExecutionResult>;
  executeInWorker(options?: CodeLabExecutionOptions): Promise<CodeLabExecutionResult>;
  cancelWorkerExecution(reason?: string): boolean;
  preloadNpmPackages(files?: Record<string, string>, existingCache?: Map<string, string>): Promise<Record<string, string>>;
  transpileTS(source: string, filename?: string): string;
  createVirtualFs(initialFiles?: Record<string, string>): any;
  createVirtualHttp(resourceTracker?: any): any;
  createVirtualNet(resourceTracker?: any, sharedTrace?: any[]): any;
}

export declare const CodeLabRuntime: CodeLabRuntimeAPI;
export declare const executeInVirtualRuntime: CodeLabRuntimeAPI['executeInVirtualRuntime'];
export declare const executeInWorker: CodeLabRuntimeAPI['executeInWorker'];
export declare const cancelWorkerExecution: CodeLabRuntimeAPI['cancelWorkerExecution'];
export declare const preloadNpmPackages: CodeLabRuntimeAPI['preloadNpmPackages'];
export declare const transpileTS: CodeLabRuntimeAPI['transpileTS'];
export declare const createVirtualFs: CodeLabRuntimeAPI['createVirtualFs'];
export declare const createVirtualHttp: CodeLabRuntimeAPI['createVirtualHttp'];
export declare const createVirtualNet: CodeLabRuntimeAPI['createVirtualNet'];

export interface CodeLabStatic {
  Workbench: typeof CodeLabWorkbench;
  CodeLabWorkbench: typeof CodeLabWorkbench;
  CodeLabElement: typeof CodeLabElement;
  Runtime: CodeLabRuntimeAPI;
  create(container: HTMLElement | string, options?: CodeLabOptions): CodeLabWorkbench | null;
  mount(container: HTMLElement | string, options?: CodeLabOptions): CodeLabWorkbench | null;
  unmount(container: HTMLElement | string): void;
}

export declare const CodeLab: CodeLabStatic;
export default CodeLab;
`;

fs.mkdirSync(DIST_DIR, { recursive: true });

// 1. Write to site js/code-lab.js
const siteJsOut = path.join(ROOT, 'js', 'code-lab.js');
fs.writeFileSync(siteJsOut, IIFE_BUNDLE, 'utf8');

// 2. Write to projects/code-lab/dist/*
fs.writeFileSync(path.join(DIST_DIR, 'code-lab.js'), IIFE_BUNDLE, 'utf8');
fs.writeFileSync(path.join(DIST_DIR, 'code-lab.esm.js'), ESM_BUNDLE, 'utf8');
fs.writeFileSync(path.join(DIST_DIR, 'runtime.js'), RUNTIME_IIFE, 'utf8');
fs.writeFileSync(path.join(DIST_DIR, 'runtime.esm.js'), RUNTIME_ESM, 'utf8');
fs.writeFileSync(path.join(DIST_DIR, 'code-lab.d.ts'), DTS_CONTENT, 'utf8');

// 3. Copy CSS to projects/code-lab/dist/code-lab.css
if (fs.existsSync(cssPath)) {
  fs.copyFileSync(cssPath, path.join(DIST_DIR, 'code-lab.css'));
}

console.log('✓ Built js/code-lab.js (' + ( Buffer.byteLength(IIFE_BUNDLE) / 1024 ).toFixed(1) + ' KB)');
console.log('✓ Built projects/code-lab/dist/code-lab.js (UMD/IIFE)');
console.log('✓ Built projects/code-lab/dist/code-lab.esm.js (ESM)');
console.log('✓ Built projects/code-lab/dist/runtime.js & runtime.esm.js');
console.log('✓ Built projects/code-lab/dist/code-lab.d.ts');
console.log('✓ Copied projects/code-lab/dist/code-lab.css');
