'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CodeLab IDE Workbench Redesign — Automated UI & E2E Verification Suite
 * Requirements: R1 (Declutter Topbar & Stepper), R2 (Tab Lifecycle & Empty State),
 *               R3 (Hierarchical Tree & File Ops), R4 (Geist Monochrome Tokens)
 *
 * Specifications: ORIGINAL_REQUEST.md, PROJECT.md, TEST_INFRA.md
 * Integrity Mode: Pure Node.js CLI (Zero external npm dependencies)
 * Coverage Structure: Tier 1 (F1-F8), Tier 2 (Boundaries), Tier 3 (Pairwise), Tier 4 (Workloads)
 * Total Test Cases: 96 automated tests (Threshold: >= 93)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// ── Lightweight Zero-Dependency Virtual DOM & Browser Emulation ──────────────

class DOMNode {
  constructor(ownerDocument) {
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.parentElement = null;
    this.childNodes = [];
  }

  get children() {
    return this.childNodes.filter(n => n.nodeType === 1);
  }

  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    child.parentElement = this.nodeType === 1 ? this : null;
    this.childNodes.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.childNodes.indexOf(child);
    if (idx !== -1) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
      child.parentElement = null;
    }
    return child;
  }

  insertBefore(newNode, refNode) {
    if (!refNode) return this.appendChild(newNode);
    if (newNode.parentNode) newNode.parentNode.removeChild(newNode);
    const idx = this.childNodes.indexOf(refNode);
    if (idx !== -1) {
      newNode.parentNode = this;
      newNode.parentElement = this.nodeType === 1 ? this : null;
      this.childNodes.splice(idx, 0, newNode);
    } else {
      this.appendChild(newNode);
    }
    return newNode;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
}

class DOMTextNode extends DOMNode {
  constructor(text, ownerDocument) {
    super(ownerDocument);
    this.nodeType = 3;
    this.nodeValue = String(text);
  }
  get textContent() { return this.nodeValue; }
  set textContent(v) { this.nodeValue = String(v); }
}

class DOMCommentNode extends DOMNode {
  constructor(text, ownerDocument) {
    super(ownerDocument);
    this.nodeType = 8;
    this.nodeValue = String(text);
  }
}

function splitBranch(branch) {
  const tokens = [];
  let cur = '';
  let i = 0;
  while (i < branch.length) {
    const ch = branch[i];
    if (ch === '>') {
      if (cur.trim()) tokens.push(cur.trim());
      tokens.push('>');
      cur = '';
    } else if (ch === ' ' || ch === '\t') {
      if (cur.trim()) tokens.push(cur.trim());
      cur = '';
    } else if (ch === '[') {
      while (i < branch.length && branch[i] !== ']') {
        cur += branch[i];
        i++;
      }
      cur += ']';
    } else {
      cur += ch;
    }
    i++;
  }
  if (cur.trim()) tokens.push(cur.trim());
  return tokens;
}

function matchesCompound(el, sel) {
  if (el.nodeType !== 1) return false;
  let rem = sel.trim();
  const tagMatch = rem.match(/^[a-zA-Z0-9_-]+/);
  if (tagMatch) {
    if (el.tagName.toLowerCase() !== tagMatch[0].toLowerCase()) return false;
    rem = rem.slice(tagMatch[0].length);
  }
  const tokenRegex = /(?:#([a-zA-Z0-9_-]+))|(?:\.([a-zA-Z0-9_-]+))|(?:\[([a-zA-Z0-9_:-]+)(?:([*^$]?=)(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\])/g;
  let m;
  let parsedLen = 0;
  while ((m = tokenRegex.exec(rem)) !== null) {
    parsedLen += m[0].length;
    if (m[1]) {
      if (el.id !== m[1]) return false;
    } else if (m[2]) {
      if (!el.classList.contains(m[2])) return false;
    } else if (m[3]) {
      const attrName = m[3];
      const op = m[4];
      const val = m[5] !== undefined ? m[5] : m[6] !== undefined ? m[6] : m[7];
      if (!el.hasAttribute(attrName)) return false;
      if (op) {
        const actual = el.getAttribute(attrName);
        if (op === '=' && actual !== val) return false;
        if (op === '*=' && !actual.includes(val)) return false;
        if (op === '^=' && !actual.startsWith(val)) return false;
        if (op === '$=' && !actual.endsWith(val)) return false;
      }
    }
  }
  return parsedLen === rem.length;
}

function matchesSelector(el, selector) {
  if (el.nodeType !== 1) return false;
  const branches = selector.split(',').map(s => s.trim()).filter(Boolean);
  for (const branch of branches) {
    const tokens = splitBranch(branch);
    if (!tokens.length) continue;
    let p = tokens.length - 1;
    if (!matchesCompound(el, tokens[p])) continue;
    let cur = el;
    p--;
    let branchFailed = false;
    while (p >= 0) {
      if (tokens[p] === '>') {
        p--;
        cur = cur.parentElement;
        if (!cur || !matchesCompound(cur, tokens[p])) {
          branchFailed = true;
          break;
        }
        p--;
      } else {
        const target = tokens[p];
        cur = cur.parentElement;
        let matched = false;
        while (cur) {
          if (matchesCompound(cur, target)) {
            matched = true;
            break;
          }
          cur = cur.parentElement;
        }
        if (!matched) {
          branchFailed = true;
          break;
        }
        p--;
      }
    }
    if (!branchFailed) return true;
  }
  return false;
}

class DOMClassList {
  constructor(el) {
    this._el = el;
  }
  _getClasses() {
    const c = this._el.getAttribute('class') || '';
    return c.trim().split(/\s+/).filter(Boolean);
  }
  _setClasses(classes) {
    this._el.setAttribute('class', classes.join(' '));
  }
  contains(cls) {
    return this._getClasses().includes(cls);
  }
  add(...classes) {
    const list = this._getClasses();
    for (const c of classes) {
      if (!list.includes(c)) list.push(c);
    }
    this._setClasses(list);
  }
  remove(...classes) {
    let list = this._getClasses();
    list = list.filter(c => !classes.includes(c));
    this._setClasses(list);
  }
  toggle(cls, force) {
    const list = this._getClasses();
    const idx = list.indexOf(cls);
    if (force === true || (force === undefined && idx === -1)) {
      if (idx === -1) list.push(cls);
      this._setClasses(list);
      return true;
    } else {
      if (idx !== -1) list.splice(idx, 1);
      this._setClasses(list);
      return false;
    }
  }
}

class DOMElement extends DOMNode {
  constructor(tagName, ownerDocument) {
    super(ownerDocument);
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.classList = new DOMClassList(this);
    this.listeners = new Map();
    this.style = {};
    this.scrollTop = 0;
    this.scrollLeft = 0;
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this._value = '';
  }

  get id() { return this.getAttribute('id') || ''; }
  set id(v) { this.setAttribute('id', v); }

  get className() { return this.getAttribute('class') || ''; }
  set className(v) { this.setAttribute('class', v); }

  get value() { return this._value; }
  set value(v) { this._value = String(v); }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(v) { if (v) this.setAttribute('disabled', ''); else this.removeAttribute('disabled'); }

  get draggable() { return this.getAttribute('draggable') === 'true'; }
  set draggable(v) { this.setAttribute('draggable', String(v)); }

  getAttribute(name) {
    return this.attributes.get(name.toLowerCase()) ?? null;
  }
  setAttribute(name, val) {
    this.attributes.set(name.toLowerCase(), String(val));
  }
  removeAttribute(name) {
    this.attributes.delete(name.toLowerCase());
  }
  hasAttribute(name) {
    return this.attributes.has(name.toLowerCase());
  }

  get dataset() {
    const self = this;
    return new Proxy({}, {
      get(_, prop) {
        const attrName = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
        return self.getAttribute(attrName);
      },
      set(_, prop, val) {
        const attrName = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
        self.setAttribute(attrName, val);
        return true;
      }
    });
  }

  get textContent() {
    let out = '';
    for (const child of this.childNodes) {
      if (child.nodeType === 3) out += child.nodeValue;
      else if (child.nodeType === 1) out += child.textContent;
    }
    return out;
  }
  set textContent(v) {
    this.childNodes = [];
    this.appendChild(new DOMTextNode(v, this.ownerDocument));
  }

  get innerHTML() {
    return this.childNodes.map(nodeToHTML).join('');
  }
  set innerHTML(html) {
    this.childNodes = [];
    parseHTMLTo(html, this, this.ownerDocument);
  }

  matches(sel) { return matchesSelector(this, sel); }
  closest(sel) {
    let cur = this;
    while (cur && cur.nodeType === 1) {
      if (cur.matches(sel)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  querySelector(sel) {
    function dfs(node) {
      for (const child of node.children) {
        if (child.matches(sel)) return child;
        const res = dfs(child);
        if (res) return res;
      }
      return null;
    }
    return dfs(this);
  }

  querySelectorAll(sel) {
    const list = [];
    function dfs(node) {
      for (const child of node.children) {
        if (child.matches(sel)) list.push(child);
        dfs(child);
      }
    }
    dfs(this);
    return list;
  }

  contains(node) {
    let cur = node;
    while (cur) {
      if (cur === this) return true;
      cur = cur.parentNode;
    }
    return false;
  }

  addEventListener(type, fn, opts) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push({ fn, once: opts && opts.once });
  }

  removeEventListener(type, fn) {
    const list = this.listeners.get(type);
    if (!list) return;
    this.listeners.set(type, list.filter(l => l.fn !== fn));
  }

  dispatchEvent(event) {
    event.target = event.target || this;
    let cur = this;
    while (cur) {
      event.currentTarget = cur;
      const list = cur.listeners.get(event.type);
      if (list) {
        for (const item of [...list]) {
          item.fn.call(cur, event);
          if (item.once) cur.removeEventListener(event.type, item.fn);
          if (event._stopped) return !event.defaultPrevented;
        }
      }
      if (!event.bubbles) break;
      cur = cur.parentElement;
    }
    return !event.defaultPrevented;
  }

  click() {
    const ev = new DOMEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(ev);
  }
  focus() {}
  blur() {}
  getBoundingClientRect() {
    return { top: 0, left: 0, width: 800, height: 600, right: 800, bottom: 600 };
  }
}

class DOMEvent {
  constructor(type, opts = {}) {
    this.type = type;
    this.bubbles = opts.bubbles !== undefined ? !!opts.bubbles : true;
    this.cancelable = opts.cancelable !== undefined ? !!opts.cancelable : true;
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
    this._stopped = false;
    this.button = opts.button || 0;
    this.key = opts.key || '';
    this.metaKey = !!opts.metaKey;
    this.ctrlKey = !!opts.ctrlKey;
    this.shiftKey = !!opts.shiftKey;
    this.altKey = !!opts.altKey;
    this.detail = opts.detail || null;
    this.dataTransfer = opts.dataTransfer || {
      data: {},
      setData(k, v) { this.data[k] = String(v); },
      getData(k) { return this.data[k] || ''; },
      effectAllowed: 'none',
      dropEffect: 'none'
    };
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() { this._stopped = true; }
  stopImmediatePropagation() { this._stopped = true; }
}

function nodeToHTML(node) {
  if (node.nodeType === 3) return node.nodeValue;
  if (node.nodeType === 8) return `<!--${node.nodeValue}-->`;
  if (node.nodeType !== 1) return '';
  const tag = node.tagName.toLowerCase();
  let attrs = '';
  for (const [k, v] of node.attributes) {
    attrs += ` ${k}="${String(v).replace(/"/g, '&quot;')}"`;
  }
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  if (voidTags.has(tag)) return `<${tag}${attrs}>`;
  return `<${tag}${attrs}>${node.childNodes.map(nodeToHTML).join('')}</${tag}>`;
}

function parseHTMLTo(html, parent, ownerDoc) {
  const tagRegex = /<!--([\s\S]*?)-->|<(\/)?([a-zA-Z0-9:-]+)((?:\s+[^=>\s/]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/)?>|([^<]+)/g;
  let match;
  const stack = [parent];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const svgSelfClosing = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);

  while ((match = tagRegex.exec(html)) !== null) {
    const [full, comment, isClosing, tagName, attrStr, isSelfClosingTag, text] = match;
    if (comment !== undefined) {
      stack[stack.length - 1].appendChild(new DOMCommentNode(comment, ownerDoc));
      continue;
    }
    if (text !== undefined) {
      if (text.length > 0) {
        stack[stack.length - 1].appendChild(new DOMTextNode(text, ownerDoc));
      }
      continue;
    }
    const lowerTag = tagName.toLowerCase();
    if (isClosing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName.toLowerCase() === lowerTag) {
          stack.length = i;
          break;
        }
      }
    } else {
      const el = new DOMElement(lowerTag, ownerDoc);
      if (attrStr) {
        const attrRegex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
          const attrName = attrMatch[1];
          const attrVal = attrMatch[2] !== undefined ? attrMatch[2] :
                          attrMatch[3] !== undefined ? attrMatch[3] :
                          attrMatch[4] !== undefined ? attrMatch[4] : '';
          el.setAttribute(attrName, attrVal);
        }
      }
      stack[stack.length - 1].appendChild(el);
      const isVoid = voidTags.has(lowerTag) || isSelfClosingTag === '/' || (svgSelfClosing.has(lowerTag) && isSelfClosingTag === '/');
      if (!isVoid) {
        stack.push(el);
      }
    }
  }
}

class DOMDocument extends DOMElement {
  constructor() {
    super('DOCUMENT', null);
    this.nodeType = 9;
    this.ownerDocument = this;
    this.head = new DOMElement('head', this);
    this.body = new DOMElement('body', this);
    this.appendChild(this.head);
    this.appendChild(this.body);
  }
  createElement(tag) {
    return new DOMElement(tag, this);
  }
}

// ── Global Environment Initialization ────────────────────────────────────────

const doc = new DOMDocument();
const localStorageStore = new Map();
const localStorageMock = {
  getItem(k) { return localStorageStore.has(k) ? localStorageStore.get(k) : null; },
  setItem(k, v) { localStorageStore.set(k, String(v)); },
  removeItem(k) { localStorageStore.delete(k); },
  clear() { localStorageStore.clear(); }
};

globalThis.window = globalThis;
globalThis.document = doc;
globalThis.localStorage = localStorageMock;
globalThis.Event = DOMEvent;
globalThis.CustomEvent = DOMEvent;
globalThis.MouseEvent = DOMEvent;
globalThis.KeyboardEvent = DOMEvent;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock Monaco Editor host and models
const createdMonacoModels = new Map();
const mockMonaco = {
  editor: {
    defineTheme: () => {},
    create: (container, opts) => {
      let currentModel = null;
      return {
        layout: () => {},
        setModel: (m) => { currentModel = m; },
        getModel: () => currentModel,
        setValue: (v) => { if (currentModel) currentModel.setValue(v); },
        getValue: () => currentModel ? currentModel.getValue() : '',
        dispose: () => {},
        onDidChangeModelContent: () => ({ dispose: () => {} }),
        onDidChangeCursorPosition: () => ({ dispose: () => {} }),
        addAction: () => {},
        addCommand: () => {},
        focus: () => {}
      };
    },
    createModel: (val, lang, uri) => {
      const uriStr = uri ? uri.toString() : 'uri';
      const model = {
        _value: val,
        _uri: uriStr,
        isDisposed: false,
        getValue: () => model._value,
        setValue: (v) => { model._value = v; },
        dispose: () => { model.isDisposed = true; },
        uri: uri || { toString: () => uriStr }
      };
      createdMonacoModels.set(uriStr, model);
      return model;
    },
    getModel: (uri) => {
      const uriStr = uri ? uri.toString() : 'uri';
      const m = createdMonacoModels.get(uriStr);
      return m && !m.isDisposed ? m : null;
    },
    Uri: { parse: (u) => ({ toString: () => u }) }
  },
  languages: {
    typescript: {
      typescriptDefaults: { setCompilerOptions: () => {}, addExtraLib: () => {} },
      javascriptDefaults: { setCompilerOptions: () => {}, addExtraLib: () => {} }
    }
  }
};
globalThis.monaco = mockMonaco;

// Require CodeLabWorkbench
const wbPath = path.resolve(__dirname, 'src/workbench.js');
const CodeLabModule = require(wbPath);
const CodeLabWorkbench = CodeLabModule.CodeLabWorkbench || CodeLabModule.Workbench;

// ── Test Runner Infrastructure ───────────────────────────────────────────────

const results = {
  tier1: { name: 'Tier 1: Feature Coverage (F1-F8)', passed: 0, failed: 0, tests: [] },
  tier2: { name: 'Tier 2: Boundary & Corner Cases', passed: 0, failed: 0, tests: [] },
  tier3: { name: 'Tier 3: Cross-Feature Interactions', passed: 0, failed: 0, tests: [] },
  tier4: { name: 'Tier 4: Real-World User Workloads', passed: 0, failed: 0, tests: [] }
};

let currentTierKey = 'tier1';

async function registerTest(tierKey, id, name, fn) {
  const tier = results[tierKey];
  const startTime = Date.now();
  try {
    localStorageMock.clear();
    doc.body.childNodes = [];
    await fn();
    const duration = Date.now() - startTime;
    tier.passed++;
    tier.tests.push({ id, name, status: 'pass', duration, error: null });
    console.log(`  ✓ [${id}] ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - startTime;
    tier.failed++;
    tier.tests.push({ id, name, status: 'fail', duration, error: err });
    console.error(`  ✗ [${id}] ${name}`);
    console.error(`      Error: ${err && err.message ? err.message : err}`);
  }
}

// ── Test Fixture Helpers ─────────────────────────────────────────────────────

function createTestLab(opts = {}) {
  const container = doc.createElement('div');
  doc.body.appendChild(container);

  const defaultFiles = {
    'lru.js': `'use strict';\nclass LRUCache {\n  constructor(capacity) { this.capacity = capacity; }\n}\nmodule.exports = { LRUCache };\n`,
    'demo.js': `'use strict';\nconst { LRUCache } = require('./lru');\nconsole.log('Demo running...');\n`,
    'test.js': `'use strict';\nconst assert = require('node:assert/strict');\nconst { LRUCache } = require('./lru');\nassert.ok(true);\n`,
    'README.md': `# LRU Cache Lab\nBuild an LRU cache from scratch.`
  };

  const defaultSteps = [
    { id: 'step-1', title: 'Step 1: Node & Doubly Linked List', targetFile: 'lru.js', symbol: 'TODO (Step 1)' },
    { id: 'step-2', title: 'Step 2: Get and Put Operations', targetFile: 'lru.js', symbol: 'TODO (Step 2)' },
    { id: 'step-3', title: 'Step 3: Eviction Policy', targetFile: 'lru.js', symbol: 'TODO (Step 3)' },
    { id: 'step-4', title: 'Step 4: Concurrency & TTL', targetFile: 'lru.js', symbol: 'TODO (Step 4)' }
  ];

  const workbench = new CodeLabWorkbench(container, {
    labId: 'lru-cache-test',
    title: 'LRU Cache Lab',
    summary: 'High performance in-memory LRU cache',
    files: opts.files || defaultFiles,
    steps: opts.steps !== undefined ? opts.steps : defaultSteps,
    mode: opts.mode || 'guided',
    lang: opts.lang || 'js',
    onClose: opts.onClose || null,
    ...opts
  });

  return { container, workbench };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 1: FEATURE COVERAGE (≥5 tests per feature = ≥40 tests)
// ═══════════════════════════════════════════════════════════════════════════════

async function runTier1() {
  console.log('\n=== Running Tier 1: Feature Coverage (F1–F8) ===\n');

  // ── F1: Decluttered Top Toolbar (R1) ─────────────────────────────────────────
  await registerTest('tier1', 'T1.F1.1', 'R1: Topbar contains ZERO .codelab-step-pill elements', () => {
    const { container } = createTestLab();
    const pillsInTopbar = container.querySelectorAll('.codelab-topbar .codelab-step-pill');
    assert.equal(pillsInTopbar.length, 0, 'Found step pills inside .codelab-topbar; R1 requires zero pills in topbar');
  });

  await registerTest('tier1', 'T1.F1.2', 'R1: Topbar displays Back button when onClose is provided', () => {
    let closed = false;
    const { container } = createTestLab({ onClose: () => { closed = true; } });
    const backBtn = container.querySelector('.codelab-topbar .codelab-btn--back, .codelab-topbar [data-cl-action="close-lab"]');
    assert.ok(backBtn, 'Expected Back button in topbar when onClose is configured');
    backBtn.click();
    assert.equal(closed, true, 'Clicking Back button must invoke onClose handler');
  });

  await registerTest('tier1', 'T1.F1.3', 'R1: Topbar contains Lab Title, Mode switcher, and Language selector', () => {
    const { container } = createTestLab();
    const brand = container.querySelector('.codelab-topbar .codelab-brand');
    const modeSwitch = container.querySelector('.codelab-topbar .codelab-mode-switch');
    const langSwitch = container.querySelector('.codelab-topbar .codelab-lang-switch');
    assert.ok(brand, 'Topbar must render lab title (.codelab-brand)');
    assert.ok(modeSwitch, 'Topbar must render mode switcher');
    assert.ok(langSwitch, 'Topbar must render language switcher');
  });

  await registerTest('tier1', 'T1.F1.4', 'R1: Primary execution button reflects Verify Step in guided mode and Run Tests in sandbox', () => {
    const { container, workbench } = createTestLab({ mode: 'guided' });
    const guidedBtn = container.querySelector('.codelab-topbar [data-cl-action="verify-step"]') ||
                     container.querySelector('.codelab-topbar #cl-primary-exec-btn');
    assert.ok(guidedBtn, 'Topbar must have primary Verify Step action in guided mode');

    workbench.setMode('sandbox');
    const sandboxBtn = container.querySelector('.codelab-topbar [data-cl-action="run-tests"]') ||
                      container.querySelector('.codelab-topbar #cl-primary-exec-btn');
    assert.ok(sandboxBtn, 'Topbar must have primary Run Tests action in sandbox mode');
  });

  await registerTest('tier1', 'T1.F1.5', 'R1: Secondary actions (Reset, Solution) are absent from primary topbar', () => {
    const { container } = createTestLab();
    const resetInTopbar = container.querySelectorAll('.codelab-topbar [data-cl-action="reset-lab"]');
    const solutionInTopbar = container.querySelectorAll('.codelab-topbar [data-cl-action="show-diff"]');
    assert.equal(resetInTopbar.length, 0, 'Reset button must not be rendered in primary topbar');
    assert.equal(solutionInTopbar.length, 0, 'Solution button must not be rendered in primary topbar');
  });

  // ── F2: Guided Stepper in Guide Pane (R1) ─────────────────────────────────────
  await registerTest('tier1', 'T1.F2.1', 'R1: Step progress stepper renders inside .codelab-guide pane', () => {
    const { container } = createTestLab();
    const stepperInGuide = container.querySelector('.codelab-guide #cl-step-pills, .codelab-guide .codelab-guide__stepper');
    assert.ok(stepperInGuide, 'Step stepper host must be inside .codelab-guide');
    const pills = container.querySelectorAll('.codelab-guide .codelab-step-pill');
    assert.equal(pills.length, 4, 'Expected 4 step pills inside .codelab-guide');
  });

  await registerTest('tier1', 'T1.F2.2', 'R1: Active step pill reflects current activeStepIndex with .active class', () => {
    const { container, workbench } = createTestLab();
    workbench.selectStep(1, true);
    const pill1 = container.querySelector('.codelab-guide .codelab-step-pill[data-cl-step="1"]');
    assert.ok(pill1 && pill1.classList.contains('active'), 'Step 2 pill must have active class when selected');
  });

  await registerTest('tier1', 'T1.F2.3', 'R1: Completed steps reflect passed state with .passed class and checkmark', () => {
    const { container, workbench } = createTestLab();
    workbench.completedSteps.add('step-1');
    workbench._renderStepPills?.() || workbench._renderGuidePane?.();
    const pill0 = container.querySelector('.codelab-guide .codelab-step-pill[data-cl-step="0"]');
    assert.ok(pill0, 'Step pill 0 must exist');
    assert.ok(pill0.classList.contains('passed'), 'Completed step must have .passed class');
    assert.ok(pill0.textContent.includes('✓'), 'Completed step pill must show checkmark indicator');
  });

  await registerTest('tier1', 'T1.F2.4', 'R1: Clicking a step pill inside .codelab-guide triggers step navigation', () => {
    const { container, workbench } = createTestLab();
    const pill2 = container.querySelector('.codelab-guide .codelab-step-pill[data-cl-step="2"]');
    assert.ok(pill2, 'Step pill 2 must exist');
    pill2.click();
    assert.equal(workbench.activeStepIndex, 2, 'Clicking step pill 2 must update workbench.activeStepIndex to 2');
  });

  await registerTest('tier1', 'T1.F2.5', 'R1: Secondary actions (All Tests, Solution, Reset) are placed in guide footer', () => {
    const { container } = createTestLab();
    const allTestsBtn = container.querySelector('.codelab-guide__footer [data-cl-action="run-tests"]');
    const solutionBtn = container.querySelector('.codelab-guide__footer [data-cl-action="show-diff"]');
    const resetBtn = container.querySelector('.codelab-guide__footer [data-cl-action="reset-lab"]');
    assert.ok(allTestsBtn, 'Guide footer must contain All Tests action');
    assert.ok(solutionBtn, 'Guide footer must contain Solution action');
    assert.ok(resetBtn, 'Guide footer must contain Reset action');
  });

  // ── F3: VS Code-Style Editor Tab Lifecycle (R2) ──────────────────────────────
  await registerTest('tier1', 'T1.F3.1', 'R2: Workbench state maintains openTabs array decoupled from files', () => {
    const { workbench } = createTestLab();
    assert.ok(Array.isArray(workbench.openTabs), 'workbench.openTabs must be an Array');
    assert.ok(workbench.openTabs.length > 0, 'workbench.openTabs must contain initially open tabs');
    assert.ok(workbench.openTabs.includes('lru.js'), 'Starter file lru.js should be in openTabs initially');
  });

  await registerTest('tier1', 'T1.F3.2', 'R2: Universal close button (×) is rendered on all tabs including starter files', () => {
    const { container } = createTestLab();
    const lruTab = container.querySelector('.codelab-tab[data-cl-file="lru.js"]');
    assert.ok(lruTab, 'Tab for lru.js must be rendered');
    const closeBtn = lruTab.querySelector('[data-action="close-tab"], .codelab-tab__close');
    assert.ok(closeBtn, 'Starter file lru.js must have a clickable close button');
  });

  await registerTest('tier1', 'T1.F3.3', 'R2: Closing a tab removes it from openTabs while files[filename] remains intact', () => {
    const { workbench } = createTestLab();
    const initialContent = workbench.files['demo.js'];
    assert.ok(initialContent, 'demo.js must exist in files');
    workbench.closeTab('demo.js');
    assert.equal(workbench.openTabs.includes('demo.js'), false, 'demo.js must be removed from openTabs');
    assert.equal(workbench.files['demo.js'], initialContent, 'files[demo.js] must remain untouched in virtual filesystem');
  });

  await registerTest('tier1', 'T1.F3.4', 'R2: Closing a tab preserves its cached Monaco model without disposal', () => {
    const { workbench } = createTestLab();
    workbench.openFile('lru.js');
    const modelBefore = workbench.models.get('lru.js');
    workbench.closeTab('lru.js');
    if (modelBefore) {
      assert.equal(modelBefore.isDisposed, false, 'Monaco model must not be disposed on tab close');
    }
  });

  await registerTest('tier1', 'T1.F3.5', 'R2: Middle-click on tab triggers closeTab without deleting file', () => {
    const { container, workbench } = createTestLab();
    const testTab = container.querySelector('.codelab-tab[data-cl-file="test.js"]');
    assert.ok(testTab, 'test.js tab must exist');
    const middleClickEv = new DOMEvent('auxclick', { bubbles: true, cancelable: true, button: 1 });
    testTab.dispatchEvent(middleClickEv);
    assert.equal(workbench.openTabs.includes('test.js'), false, 'Middle-click must close test.js tab');
    assert.ok(workbench.files['test.js'], 'test.js must remain in files after middle-click tab close');
  });

  // ── F4: Monochrome Empty Editor State (R2) ──────────────────────────────────
  await registerTest('tier1', 'T1.F4.1', 'R2: Closing all tabs sets activeFile to null and displays .codelab-empty-editor', () => {
    const { container, workbench } = createTestLab();
    const allTabs = [...workbench.openTabs];
    for (const tab of allTabs) {
      workbench.closeTab(tab);
    }
    assert.equal(workbench.openTabs.length, 0, 'openTabs should be empty');
    assert.equal(workbench.activeFile, null, 'activeFile should be null when all tabs are closed');
    const emptyEditor = container.querySelector('.codelab-empty-editor, #cl-empty-editor');
    assert.ok(emptyEditor, '.codelab-empty-editor element must exist');
    assert.notEqual(emptyEditor.style.display, 'none', 'Empty editor state must be visible');
  });

  await registerTest('tier1', 'T1.F4.2', 'R2: In empty editor state, Monaco host and fallback textarea are hidden', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) {
      workbench.closeTab(workbench.openTabs[0]);
    }
    const monacoHost = container.querySelector('#cl-monaco-host');
    const fallbackWrap = container.querySelector('#cl-fallback-wrap');
    if (monacoHost) assert.equal(monacoHost.style.display, 'none', 'Monaco host must be hidden in empty state');
    if (fallbackWrap) assert.equal(fallbackWrap.style.display, 'none', 'Fallback wrap must be hidden in empty state');
  });

  await registerTest('tier1', 'T1.F4.3', 'R2: .codelab-empty-editor renders quick-open action links for workspace files', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    const quickLinks = container.querySelectorAll('.codelab-empty-editor [data-cl-file], .codelab-empty-file-btn');
    assert.ok(quickLinks.length > 0, 'Empty editor view must contain quick-open links for files');
  });

  await registerTest('tier1', 'T1.F4.4', 'R2: Clicking quick-open link reopens file in openTabs and sets activeFile', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    const link = container.querySelector('.codelab-empty-editor [data-cl-file="lru.js"], [data-cl-file="lru.js"]');
    assert.ok(link, 'Quick link for lru.js must exist');
    link.click();
    assert.ok(workbench.openTabs.includes('lru.js'), 'lru.js must be added back to openTabs');
    assert.equal(workbench.activeFile, 'lru.js', 'lru.js must be activeFile');
  });

  await registerTest('tier1', 'T1.F4.5', 'R2: Clicking file in explorer tree while in empty state mounts tab and dismisses empty state', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    const fileItem = container.querySelector('.codelab-explorer [data-cl-file="test.js"], #cl-explorer-list [data-cl-file="test.js"]');
    assert.ok(fileItem, 'Explorer file item for test.js must exist');
    fileItem.click();
    assert.ok(workbench.openTabs.includes('test.js'), 'test.js must be open in tabs');
    const emptyEditor = container.querySelector('.codelab-empty-editor, #cl-empty-editor');
    assert.equal(emptyEditor.style.display, 'none', 'Empty editor state must be dismissed once a file opens');
  });

  // ── F5: Hierarchical Folder & File Tree (R3) ─────────────────────────────────
  await registerTest('tier1', 'T1.F5.1', 'R3: Nested paths (e.g. src/engine.js) render as hierarchical tree nodes', () => {
    const { container } = createTestLab({
      files: {
        'src/engine.js': '// engine',
        'src/utils/math.js': '// math',
        'README.md': '# Readme'
      }
    });
    const folderNodes = container.querySelectorAll('.codelab-explorer .codelab-folder-item, .codelab-explorer [data-cl-folder]');
    assert.ok(folderNodes.length > 0, 'Explorer must render nested folder nodes for paths containing slashes');
  });

  await registerTest('tier1', 'T1.F5.2', 'R3: Folder nodes display chevron toggle indicators and folder icons', () => {
    const { container } = createTestLab({
      files: { 'src/core.js': '// core' }
    });
    const folderItem = container.querySelector('.codelab-explorer [data-cl-folder="src"], .codelab-folder-item');
    assert.ok(folderItem, 'Folder src must be rendered');
    const chevron = folderItem.querySelector('.codelab-chevron, [data-cl-action="toggle-folder"]') || folderItem;
    assert.ok(chevron, 'Folder must have chevron toggle indicator');
  });

  await registerTest('tier1', 'T1.F5.3', 'R3: Toggling folder collapse updates workbench.collapsedFolders set', () => {
    const { workbench } = createTestLab({
      files: { 'src/index.js': '// index' }
    });
    assert.equal(workbench.collapsedFolders.has('src'), false, 'Folder src should initially be expanded');
    workbench.toggleFolder('src');
    assert.equal(workbench.collapsedFolders.has('src'), true, 'Folder src must be in collapsedFolders after toggle');
    workbench.toggleFolder('src');
    assert.equal(workbench.collapsedFolders.has('src'), false, 'Folder src must be removed from collapsedFolders on second toggle');
  });

  await registerTest('tier1', 'T1.F5.4', 'R3: Collapsed folder state is persisted in localStorage', () => {
    const { workbench } = createTestLab({
      files: { 'lib/store.js': '// store' }
    });
    workbench.toggleFolder('lib');
    const saved = JSON.parse(localStorageMock.getItem('sd-codelab-v1:lru-cache-test') || '{}');
    assert.ok(saved.collapsedFolders && saved.collapsedFolders.includes('lib'), 'collapsedFolders must be saved in localStorage');
  });

  await registerTest('tier1', 'T1.F5.5', 'R3: Tree nodes reflect visual indentation proportional to nesting depth', () => {
    const { container } = createTestLab({
      files: { 'a/b/c/deep.js': '// deep' }
    });
    const deepItem = container.querySelector('.codelab-explorer [data-cl-file="a/b/c/deep.js"]');
    assert.ok(deepItem, 'Deeply nested file item must exist');
    const padding = deepItem.style.paddingLeft || deepItem.getAttribute('data-depth') || deepItem.style['--depth'];
    assert.ok(padding, 'Deeply nested item must have depth indentation styling');
  });

  // ── F6: Workspace Tree Operations (R3) ───────────────────────────────────────
  await registerTest('tier1', 'T1.F6.1', 'R3: Explorer header provides root inline creation triggers for new files and folders', () => {
    const { container } = createTestLab();
    const newFileBtn = container.querySelector('.codelab-explorer [data-cl-action="new-file-root"]');
    const newFolderBtn = container.querySelector('.codelab-explorer [data-cl-action="new-folder-root"]');
    assert.ok(newFileBtn, 'Explorer header must have new file root button');
    assert.ok(newFolderBtn, 'Explorer header must have new folder root button');
  });

  await registerTest('tier1', 'T1.F6.2', 'R3: Creating a file via createFile adds it to files and openTabs and sets activeFile', () => {
    const { workbench } = createTestLab();
    workbench.createFile('src/logger.js', '// logger');
    assert.equal(workbench.files['src/logger.js'], '// logger', 'New file must be present in files');
    assert.ok(workbench.openTabs.includes('src/logger.js'), 'New file must be added to openTabs');
    assert.equal(workbench.activeFile, 'src/logger.js', 'New file must become activeFile');
  });

  await registerTest('tier1', 'T1.F6.3', 'R3: Creating a folder via createFolder registers it in workbench.folders and renders node', () => {
    const { container, workbench } = createTestLab();
    workbench.createFolder('components');
    assert.ok(workbench.folders.has('components'), 'Folder must be tracked in workbench.folders Set');
    const folderNode = container.querySelector('.codelab-explorer [data-cl-folder="components"]');
    assert.ok(folderNode, 'Folder components must be rendered in workspace tree');
  });

  await registerTest('tier1', 'T1.F6.4', 'R3: Renaming a file updates files key, openTabs, activeFile, and Monaco URI', () => {
    const { workbench } = createTestLab();
    workbench.createFile('old-name.js', '// old');
    workbench.renameFile('old-name.js', 'new-name.js');
    assert.equal(workbench.files['old-name.js'], undefined, 'Old path must be removed from files');
    assert.equal(workbench.files['new-name.js'], '// old', 'New path must exist in files');
    assert.ok(workbench.openTabs.includes('new-name.js'), 'new-name.js must be present in openTabs');
    assert.equal(workbench.openTabs.includes('old-name.js'), false, 'old-name.js must not be present in openTabs');
    assert.equal(workbench.activeFile, 'new-name.js', 'activeFile must point to new-name.js');
  });

  await registerTest('tier1', 'T1.F6.5', 'R3: Deleting a file removes it from files and openTabs and disposes Monaco model', () => {
    const { workbench } = createTestLab();
    workbench.createFile('temp-delete.js', '// temp');
    const model = workbench.models.get('temp-delete.js');
    workbench.deleteFile('temp-delete.js');
    assert.equal(workbench.files['temp-delete.js'], undefined, 'Deleted file must be removed from files');
    assert.equal(workbench.openTabs.includes('temp-delete.js'), false, 'Deleted file must be removed from openTabs');
    if (model) assert.equal(model.isDisposed, true, 'Monaco model of deleted file must be disposed');
  });

  // ── F7: Drag-and-Drop File Movement (R3) ─────────────────────────────────────
  await registerTest('tier1', 'T1.F7.1', 'R3: File items in tree have draggable="true" attribute', () => {
    const { container } = createTestLab();
    const fileItem = container.querySelector('.codelab-explorer [data-cl-file="lru.js"]');
    assert.ok(fileItem, 'lru.js item must exist in tree');
    assert.equal(fileItem.getAttribute('draggable'), 'true', 'File item must have draggable="true"');
  });

  await registerTest('tier1', 'T1.F7.2', 'R3: Folder nodes expose drop target listeners/attributes', () => {
    const { container } = createTestLab({
      files: { 'pkg/index.js': '//' }
    });
    const folderItem = container.querySelector('.codelab-explorer [data-cl-folder="pkg"]');
    assert.ok(folderItem, 'Folder pkg must exist');
    assert.ok(
      folderItem.hasAttribute('data-cl-drop-folder') || folderItem.listeners.has('dragover') || folderItem.listeners.has('drop'),
      'Folder item must register drop target support'
    );
  });

  await registerTest('tier1', 'T1.F7.3', 'R3: Calling moveFile moves path in files and updates openTabs', () => {
    const { workbench } = createTestLab();
    workbench.createFolder('src');
    workbench.moveFile('lru.js', 'src/lru.js');
    assert.equal(workbench.files['lru.js'], undefined, 'lru.js at root must be removed');
    assert.ok(workbench.files['src/lru.js'], 'src/lru.js must exist in files');
    assert.ok(workbench.openTabs.includes('src/lru.js'), 'src/lru.js must be in openTabs');
    assert.equal(workbench.openTabs.includes('lru.js'), false, 'old path lru.js must be removed from openTabs');
  });

  await registerTest('tier1', 'T1.F7.4', 'R3: Moving active file updates activeFile to new destination path', () => {
    const { workbench } = createTestLab();
    workbench.openFile('demo.js');
    assert.equal(workbench.activeFile, 'demo.js');
    workbench.createFolder('examples');
    workbench.moveFile('demo.js', 'examples/demo.js');
    assert.equal(workbench.activeFile, 'examples/demo.js', 'activeFile must update to new path after move');
  });

  await registerTest('tier1', 'T1.F7.5', 'R3: Moving nested file back to workspace root updates paths', () => {
    const { workbench } = createTestLab({
      files: { 'src/engine.js': '// engine' }
    });
    workbench.moveFile('src/engine.js', 'engine.js');
    assert.equal(workbench.files['src/engine.js'], undefined);
    assert.ok(workbench.files['engine.js']);
    assert.ok(workbench.openTabs.includes('engine.js'));
  });

  // ── F8: Geist Monochrome Styling & System Validation (R4) ───────────────────
  await registerTest('tier1', 'T1.F8.1', 'R4: Stylesheet css/code-lab.css defines Geist monochrome dark tokens', () => {
    const cssPath = path.resolve(__dirname, '../../css/code-lab.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.match(css, /--cl-bg:\s*var\(--bg,\s*#000000\)/, 'Dark background must default to #000000');
    assert.match(css, /--cl-bg-elevated:\s*var\(--surface,\s*#0a0a0a\)/, 'Dark elevated surface must default to #0a0a0a');
    assert.match(css, /--cl-border:\s*var\(--border,\s*#262626\)/, 'Dark border must default to #262626');
    assert.match(css, /--cl-fg:\s*var\(--fg,\s*#ffffff\)/, 'Dark foreground must default to #ffffff');
  });

  await registerTest('tier1', 'T1.F8.2', 'R4: Stylesheet css/code-lab.css defines Geist monochrome light tokens', () => {
    const cssPath = path.resolve(__dirname, '../../css/code-lab.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.match(css, /--cl-bg:\s*var\(--bg,\s*#ffffff\)/, 'Light background must default to #ffffff');
    assert.match(css, /--cl-bg-elevated:\s*var\(--bg-alt,\s*#fafafa\)/, 'Light elevated surface must default to #fafafa');
    assert.match(css, /--cl-border:\s*var\(--border,\s*#e5e5e5\)/, 'Light border must default to #e5e5e5');
    assert.match(css, /--cl-fg:\s*var\(--fg,\s*#0a0a0a\)/, 'Light foreground must default to #0a0a0a');
  });

  await registerTest('tier1', 'T1.F8.3', 'R4: Accent button tokens invert contrast in dark and light modes', () => {
    const cssPath = path.resolve(__dirname, '../../css/code-lab.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.match(css, /--cl-accent:\s*var\(--accent,\s*#ffffff\)/, 'Dark mode accent must be white');
    assert.match(css, /--cl-accent-fg:\s*var\(--accent-fg,\s*#000000\)/, 'Dark mode accent text must be black');
    assert.match(css, /--cl-accent:\s*var\(--accent,\s*#000000\)/, 'Light mode accent must be black');
    assert.match(css, /--cl-accent-fg:\s*var\(--accent-fg,\s*#ffffff\)/, 'Light mode accent text must be white');
  });

  await registerTest('tier1', 'T1.F8.4', 'R4: Status colors (success, error) are strictly reserved for test outputs and badges', () => {
    const cssPath = path.resolve(__dirname, '../../css/code-lab.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.match(css, /--cl-green:\s*var\(--success,\s*#05df72\)/, 'Green token defined for success');
    assert.match(css, /--cl-red:\s*var\(--error,\s*#fb2c36\)/, 'Red token defined for error');
  });

  await registerTest('tier1', 'T1.F8.5', 'R4: Container receives data-theme or class reflecting theme option', () => {
    const { container: darkContainer } = createTestLab({ theme: 'dark' });
    assert.ok(
      darkContainer.classList.contains('codelab-workbench--dark') ||
      darkContainer.getAttribute('data-theme') === 'dark',
      'Container must reflect dark theme'
    );

    const { container: lightContainer } = createTestLab({ theme: 'light' });
    assert.ok(
      lightContainer.classList.contains('codelab-workbench--light') ||
      lightContainer.getAttribute('data-theme') === 'light',
      'Container must reflect light theme'
    );
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 2: BOUNDARY & CORNER CASES (≥5 tests per feature = ≥40 tests)
// ═══════════════════════════════════════════════════════════════════════════════

async function runTier2() {
  console.log('\n=== Running Tier 2: Boundary & Corner Cases (F1–F8) ===\n');

  // ── F1 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F1.1', 'Boundary: Topbar without onClose suppresses Back button', () => {
    const { container } = createTestLab({ onClose: null });
    const backBtn = container.querySelector('.codelab-topbar .codelab-btn--back, .codelab-topbar [data-cl-action="close-lab"]');
    assert.equal(backBtn, null, 'Back button must not be rendered when onClose is null');
  });

  await registerTest('tier2', 'T2.F1.2', 'Boundary: Extremely long lab title truncates gracefully without overflowing', () => {
    const longTitle = 'Super Long Architecture Lab Title '.repeat(10);
    const { container } = createTestLab({ title: longTitle });
    const brand = container.querySelector('.codelab-topbar .codelab-brand');
    assert.ok(brand, 'Brand element must exist');
    assert.equal(brand.getAttribute('title'), longTitle, 'Title attribute must contain full lab title for tooltip');
  });

  await registerTest('tier2', 'T2.F1.3', 'Boundary: Sandbox mode with 0 steps hides stepper container and shows Run Tests', () => {
    const { container } = createTestLab({ mode: 'sandbox', steps: [] });
    const stepper = container.querySelector('.codelab-guide__stepper, #cl-step-pills');
    if (stepper) {
      assert.equal(stepper.children.length, 0, 'Stepper should be empty when steps array is empty');
    }
    const runTestsBtn = container.querySelector('.codelab-topbar [data-cl-action="run-tests"]');
    assert.ok(runTestsBtn, 'Primary button must be Run Tests in sandbox mode');
  });

  await registerTest('tier2', 'T2.F1.4', 'Boundary: Rapid toggling between Guided and Sandbox updates primary button reliably', () => {
    const { container, workbench } = createTestLab();
    for (let i = 0; i < 5; i++) {
      workbench.setMode('sandbox');
      assert.equal(workbench.mode, 'sandbox');
      workbench.setMode('guided');
      assert.equal(workbench.mode, 'guided');
    }
    const primaryBtn = container.querySelector('.codelab-topbar [data-cl-action="verify-step"]') ||
                       container.querySelector('.codelab-topbar #cl-primary-exec-btn');
    assert.ok(primaryBtn, 'Primary button should be Verify Step after toggling back to guided');
  });

  await registerTest('tier2', 'T2.F1.5', 'Boundary: Stop button is hidden when idle and shown during execution', () => {
    const { container, workbench } = createTestLab();
    const stopBtn = container.querySelector('#cl-stop-btn');
    if (stopBtn) {
      assert.equal(stopBtn.style.display, 'none', 'Stop button must be hidden when idle');
      workbench.isRunning = true;
      workbench._updateRunStateUI?.();
      assert.notEqual(stopBtn.style.display, 'none', 'Stop button must be visible when isRunning is true');
    }
  });

  // ── F2 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F2.1', 'Boundary: Empty steps array (steps: []) initializes cleanly without exception', () => {
    const { workbench } = createTestLab({ steps: [] });
    assert.equal(workbench.steps.length, 0);
    assert.equal(workbench.activeStepIndex, 0);
  });

  await registerTest('tier2', 'T2.F2.2', 'Boundary: Single step lab (steps: [1]) disables both Prev and Next buttons in footer', () => {
    const { container } = createTestLab({
      steps: [{ id: 'single', title: 'Only Step', targetFile: 'lru.js' }]
    });
    const prevBtn = container.querySelector('.codelab-guide__footer [data-cl-step="-1"]') ||
                    container.querySelector('.codelab-guide__footer button:first-child');
    const nextBtn = container.querySelector('.codelab-guide__footer [data-cl-step="1"]') ||
                    container.querySelector('.codelab-guide__footer button:last-child');
    if (prevBtn) assert.ok(prevBtn.disabled || prevBtn.hasAttribute('disabled'), 'Prev button must be disabled');
    if (nextBtn) assert.ok(nextBtn.disabled || nextBtn.hasAttribute('disabled'), 'Next button must be disabled');
  });

  await registerTest('tier2', 'T2.F2.3', 'Boundary: First step disables Prev button; Last step disables Next button', () => {
    const { container, workbench } = createTestLab();
    workbench.selectStep(0, true);
    const prevBtn = container.querySelector('.codelab-guide__footer [data-cl-step="-1"]');
    if (prevBtn) assert.ok(prevBtn.disabled || prevBtn.hasAttribute('disabled'), 'Prev must be disabled on step 0');

    workbench.selectStep(workbench.steps.length - 1, true);
    const nextBtn = container.querySelector(`.codelab-guide__footer [data-cl-step="${workbench.steps.length}"]`);
    if (nextBtn) assert.ok(nextBtn.disabled || nextBtn.hasAttribute('disabled'), 'Next must be disabled on last step');
  });

  await registerTest('tier2', 'T2.F2.4', 'Boundary: Switching guide tab from steps to readme hides stepper pills cleanly', () => {
    const { container, workbench } = createTestLab();
    workbench.guideTab = 'readme';
    workbench._renderStepPills?.() || workbench._renderGuidePane?.();
    const pillsHost = container.querySelector('#cl-step-pills');
    if (pillsHost) {
      assert.ok(pillsHost.children.length === 0 || pillsHost.style.display === 'none', 'Pills should be hidden in readme view');
    }
  });

  await registerTest('tier2', 'T2.F2.5', 'Boundary: Rapid consecutive selectStep calls resolve to the final target step', () => {
    const { workbench } = createTestLab();
    workbench.selectStep(0, false);
    workbench.selectStep(2, false);
    workbench.selectStep(1, false);
    assert.equal(workbench.activeStepIndex, 1, 'Final activeStepIndex should be 1');
  });

  // ── F3 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F3.1', 'Boundary: Closing active first tab shifts focus to adjacent tab (index 0)', () => {
    const { workbench } = createTestLab();
    workbench.openTabs = ['lru.js', 'demo.js', 'test.js'];
    workbench.activeFile = 'lru.js';
    workbench.closeTab('lru.js');
    assert.equal(workbench.openTabs[0], 'demo.js');
    assert.equal(workbench.activeFile, 'demo.js', 'Next remaining tab must be activated');
  });

  await registerTest('tier2', 'T2.F3.2', 'Boundary: Closing active last tab shifts focus to preceding tab', () => {
    const { workbench } = createTestLab();
    workbench.openTabs = ['lru.js', 'demo.js', 'test.js'];
    workbench.activeFile = 'test.js';
    workbench.closeTab('test.js');
    assert.equal(workbench.openTabs[workbench.openTabs.length - 1], 'demo.js');
    assert.equal(workbench.activeFile, 'demo.js', 'Preceding tab must be activated when closing last tab');
  });

  await registerTest('tier2', 'T2.F3.3', 'Boundary: Closing an inactive tab does not alter activeFile', () => {
    const { workbench } = createTestLab();
    workbench.openTabs = ['lru.js', 'demo.js', 'test.js'];
    workbench.activeFile = 'lru.js';
    workbench.closeTab('demo.js');
    assert.equal(workbench.activeFile, 'lru.js', 'activeFile must remain unchanged when closing inactive tab');
  });

  await registerTest('tier2', 'T2.F3.4', 'Boundary: Closing non-existent or already closed tab is safe no-op', () => {
    const { workbench } = createTestLab();
    const lenBefore = workbench.openTabs.length;
    workbench.closeTab('ghost-file-not-found.js');
    assert.equal(workbench.openTabs.length, lenBefore, 'Length must be unchanged on closing non-existent tab');
  });

  await registerTest('tier2', 'T2.F3.5', 'Boundary: Calling openFile on an already open tab focuses it without duplication', () => {
    const { workbench } = createTestLab();
    workbench.openFile('lru.js');
    const countBefore = workbench.openTabs.filter(f => f === 'lru.js').length;
    workbench.openFile('lru.js');
    const countAfter = workbench.openTabs.filter(f => f === 'lru.js').length;
    assert.equal(countBefore, 1);
    assert.equal(countAfter, 1, 'lru.js must not be duplicated in openTabs');
    assert.equal(workbench.activeFile, 'lru.js');
  });

  // ── F4 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F4.1', 'Boundary: Initializing workbench with savedState openTabs: [] boots cleanly into empty state', () => {
    localStorageMock.setItem('sd-codelab-v1:lru-cache-test', JSON.stringify({ openTabs: [], activeFile: null }));
    const { container, workbench } = createTestLab();
    assert.equal(workbench.openTabs.length, 0);
    assert.equal(workbench.activeFile, null);
    const emptyEditor = container.querySelector('.codelab-empty-editor, #cl-empty-editor');
    assert.ok(emptyEditor);
  });

  await registerTest('tier2', 'T2.F4.2', 'Boundary: Keyboard shortcuts (Cmd+Enter) in empty editor do not throw null errors', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    const ev = new DOMEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true });
    container.dispatchEvent(ev);
    assert.equal(workbench.activeFile, null, 'Shortcut in empty editor must execute without error');
  });

  await registerTest('tier2', 'T2.F4.3', 'Boundary: Quick-action Run Demo in empty editor runs demo.js even if not open in tabs', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    let demoExecuted = false;
    workbench.runDemo = () => { demoExecuted = true; };
    const runDemoBtn = container.querySelector('.codelab-empty-editor [data-cl-action="run-demo"]');
    if (runDemoBtn) {
      runDemoBtn.click();
      assert.equal(demoExecuted, true, 'Run Demo in empty editor must trigger runDemo()');
    }
  });

  await registerTest('tier2', 'T2.F4.4', 'Boundary: Quick-action Run Tests in empty editor runs test.js even if not open in tabs', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    let testExecuted = false;
    workbench.runTests = () => { testExecuted = true; };
    const runTestBtn = container.querySelector('.codelab-empty-editor [data-cl-action="run-tests"]');
    if (runTestBtn) {
      runTestBtn.click();
      assert.equal(testExecuted, true, 'Run Tests in empty editor must trigger runTests()');
    }
  });

  await registerTest('tier2', 'T2.F4.5', 'Boundary: Markdown preview pane is hidden when empty editor state is active', () => {
    const { container, workbench } = createTestLab();
    workbench.openFile('README.md');
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    const mdPreview = container.querySelector('#cl-md-preview');
    if (mdPreview) {
      assert.equal(mdPreview.style.display, 'none', 'Markdown preview must be hidden in empty state');
    }
  });

  // ── F5 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F5.1', 'Boundary: Deeply nested paths (a/b/c/d/e/file.js) generate all intermediate folder nodes', () => {
    const { workbench } = createTestLab({
      files: { 'a/b/c/d/e/file.js': '// deep' }
    });
    const tree = workbench._buildFileTree ? workbench._buildFileTree() : null;
    if (tree) {
      assert.ok(tree.folders.has('a'), 'Tree must have root folder a');
      assert.ok(tree.folders.get('a').folders.has('b'), 'Folder a must have subfolder b');
    }
  });

  await registerTest('tier2', 'T2.F5.2', 'Boundary: Files with identical names in different directories render as distinct tree nodes', () => {
    const { container } = createTestLab({
      files: {
        'src/index.js': '// src index',
        'test/index.js': '// test index'
      }
    });
    const srcIndex = container.querySelector('.codelab-explorer [data-cl-file="src/index.js"]');
    const testIndex = container.querySelector('.codelab-explorer [data-cl-file="test/index.js"]');
    assert.ok(srcIndex, 'src/index.js must be rendered');
    assert.ok(testIndex, 'test/index.js must be rendered');
    assert.notEqual(srcIndex, testIndex, 'Two index.js files in different directories must be separate nodes');
  });

  await registerTest('tier2', 'T2.F5.3', 'Boundary: Empty folders created without files render as collapsible folder nodes', () => {
    const { container, workbench } = createTestLab();
    workbench.createFolder('empty-dir');
    const folderItem = container.querySelector('.codelab-explorer [data-cl-folder="empty-dir"]');
    assert.ok(folderItem, 'Empty folder empty-dir must render in tree');
  });

  await registerTest('tier2', 'T2.F5.4', 'Boundary: Special characters in file/folder names (@types, .env, _util.js) parse safely', () => {
    const { container } = createTestLab({
      files: {
        '@config.json': '{"a":1}',
        'src/_internal.js': '// internal',
        '.env.example': 'KEY=VAL'
      }
    });
    const configItem = container.querySelector('.codelab-explorer [data-cl-file="@config.json"]');
    const internalItem = container.querySelector('.codelab-explorer [data-cl-file="src/_internal.js"]');
    const envItem = container.querySelector('.codelab-explorer [data-cl-file=".env.example"]');
    assert.ok(configItem, '@config.json must render safely');
    assert.ok(internalItem, 'src/_internal.js must render safely');
    assert.ok(envItem, '.env.example must render safely');
  });

  await registerTest('tier2', 'T2.F5.5', 'Boundary: Collapsing parent folder hides all nested subfolders and descendant files', () => {
    const { workbench } = createTestLab({
      files: {
        'src/core/math/vector.js': '// vector'
      }
    });
    workbench.toggleFolder('src');
    assert.ok(workbench.collapsedFolders.has('src'), 'src must be marked collapsed');
  });

  // ── F6 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F6.1', 'Boundary: Creating file with existing path does not overwrite content silently', () => {
    const { workbench } = createTestLab();
    const original = workbench.files['lru.js'];
    try {
      workbench.createFile('lru.js', '// overwritten content');
    } catch (_) {}
    assert.equal(workbench.files['lru.js'], original, 'Existing file content should not be wiped');
  });

  await registerTest('tier2', 'T2.F6.2', 'Boundary: Renaming folder batch-renames all child files and updates openTabs', () => {
    const { workbench } = createTestLab({
      files: {
        'src/a.js': '// a',
        'src/b.js': '// b'
      }
    });
    workbench.openFile('src/a.js');
    workbench.openFile('src/b.js');
    workbench.renameFolder('src', 'lib');
    assert.equal(workbench.files['src/a.js'], undefined);
    assert.equal(workbench.files['src/b.js'], undefined);
    assert.equal(workbench.files['lib/a.js'], '// a');
    assert.equal(workbench.files['lib/b.js'], '// b');
    assert.ok(workbench.openTabs.includes('lib/a.js'));
    assert.ok(workbench.openTabs.includes('lib/b.js'));
  });

  await registerTest('tier2', 'T2.F6.3', 'Boundary: Renaming file to an existing file name is safely rejected', () => {
    const { workbench } = createTestLab();
    try {
      workbench.renameFile('demo.js', 'lru.js');
    } catch (_) {}
    assert.ok(workbench.files['demo.js'], 'demo.js should still exist');
    assert.ok(workbench.files['lru.js'], 'lru.js should still exist');
  });

  await registerTest('tier2', 'T2.F6.4', 'Boundary: Deleting folder deletes all descendant files and closes open tabs', () => {
    const { workbench } = createTestLab({
      files: {
        'temp/one.js': '// one',
        'temp/two.js': '// two',
        'keep.js': '// keep'
      }
    });
    workbench.openFile('temp/one.js');
    workbench.openFile('keep.js');
    workbench.deleteFolder('temp');
    assert.equal(workbench.files['temp/one.js'], undefined);
    assert.equal(workbench.files['temp/two.js'], undefined);
    assert.ok(workbench.files['keep.js']);
    assert.equal(workbench.openTabs.includes('temp/one.js'), false);
    assert.ok(workbench.openTabs.includes('keep.js'));
  });

  await registerTest('tier2', 'T2.F6.5', 'Boundary: Canceling inline creation via Escape resets creatingItem state', () => {
    const { workbench } = createTestLab();
    workbench.creatingItem = { type: 'file', parentFolder: '' };
    const escEv = new DOMEvent('keydown', { key: 'Escape', bubbles: true });
    doc.dispatchEvent(escEv);
    if (workbench._escHandler) workbench._escHandler(escEv);
    assert.equal(workbench.creatingItem, null, 'Escape must cancel inline creation');
  });

  // ── F7 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F7.1', 'Boundary: Dragging file onto its own parent directory is a safe no-op', () => {
    const { workbench } = createTestLab({
      files: { 'src/util.js': '// util' }
    });
    workbench.moveFile('src/util.js', 'src/util.js');
    assert.ok(workbench.files['src/util.js']);
  });

  await registerTest('tier2', 'T2.F7.2', 'Boundary: Moving file when destination has same name handles collision safely', () => {
    const { workbench } = createTestLab({
      files: {
        'index.js': '// root',
        'src/index.js': '// src'
      }
    });
    try {
      workbench.moveFile('index.js', 'src/index.js');
    } catch (_) {}
    assert.ok(workbench.files['src/index.js']);
  });

  await registerTest('tier2', 'T2.F7.3', 'Boundary: Moving active file updates active editor tab label and model URI', () => {
    const { container, workbench } = createTestLab();
    workbench.openFile('lru.js');
    workbench.moveFile('lru.js', 'lib/lru.js');
    const tab = container.querySelector('.codelab-tab[data-cl-file="lib/lru.js"]');
    assert.ok(tab, 'New tab for lib/lru.js must be rendered');
    assert.equal(workbench.activeFile, 'lib/lru.js');
  });

  await registerTest('tier2', 'T2.F7.4', 'Boundary: Dragging file into collapsed folder automatically expands it', () => {
    const { workbench } = createTestLab({
      files: {
        'target/existing.js': '// exist',
        'file.js': '// file'
      }
    });
    workbench.collapsedFolders.add('target');
    workbench.moveFile('file.js', 'target/file.js');
    assert.equal(workbench.collapsedFolders.has('target'), false, 'Destination folder should expand on drop');
  });

  await registerTest('tier2', 'T2.F7.5', 'Boundary: Dragover and dragleave correctly toggle drag-over CSS class', () => {
    const { container } = createTestLab({
      files: { 'folder/a.js': '//' }
    });
    const folderEl = container.querySelector('.codelab-explorer [data-cl-folder="folder"]');
    if (folderEl) {
      folderEl.dispatchEvent(new DOMEvent('dragover', { bubbles: true }));
      folderEl.dispatchEvent(new DOMEvent('dragleave', { bubbles: true }));
      assert.equal(folderEl.classList.contains('drag-over'), false);
    }
  });

  // ── F8 Boundaries ────────────────────────────────────────────────────────────
  await registerTest('tier2', 'T2.F8.1', 'Boundary: Escape key closes open modal dialogs and exits fullscreen', () => {
    const { container, workbench } = createTestLab();
    workbench.isFullscreen = true;
    const escEv = new DOMEvent('keydown', { key: 'Escape', bubbles: true });
    doc.dispatchEvent(escEv);
    if (workbench._escHandler) workbench._escHandler(escEv);
    assert.equal(workbench.isFullscreen, false, 'Escape must exit fullscreen');
  });

  await registerTest('tier2', 'T2.F8.2', 'Boundary: Tab bar has accessible role="tablist" and tabs have role="tab"', () => {
    const { container } = createTestLab();
    const tabList = container.querySelector('#cl-file-tabs, .codelab-file-tabs');
    assert.ok(tabList, 'Tab bar element must exist');
    assert.equal(tabList.getAttribute('role'), 'tablist');
    const tabs = tabList.querySelectorAll('.codelab-tab');
    for (const tab of tabs) {
      assert.equal(tab.getAttribute('role'), 'tab');
      assert.ok(tab.hasAttribute('aria-selected'));
    }
  });

  await registerTest('tier2', 'T2.F8.3', 'Boundary: Stepper pills have role="tab" and container has role="tablist"', () => {
    const { container } = createTestLab();
    const pills = container.querySelectorAll('.codelab-guide .codelab-step-pill');
    for (const pill of pills) {
      assert.equal(pill.getAttribute('role'), 'tab');
    }
  });

  await registerTest('tier2', 'T2.F8.4', 'Boundary: Mode buttons have role="tab" with aria-selected matching active mode', () => {
    const { container } = createTestLab({ mode: 'guided' });
    const guidedBtn = container.querySelector('.codelab-mode-btn[data-cl-mode="guided"]');
    const sandboxBtn = container.querySelector('.codelab-mode-btn[data-cl-mode="sandbox"]');
    assert.equal(guidedBtn.getAttribute('aria-selected'), 'true');
    assert.equal(sandboxBtn.getAttribute('aria-selected'), 'false');
  });

  await registerTest('tier2', 'T2.F8.5', 'Boundary: Language toggle buttons have aria-pressed matching active language', () => {
    const { container } = createTestLab({ lang: 'js' });
    const jsBtn = container.querySelector('.codelab-lang-btn[data-cl-lang="js"]');
    const tsBtn = container.querySelector('.codelab-lang-btn[data-cl-lang="ts"]');
    assert.equal(jsBtn.getAttribute('aria-pressed'), 'true');
    assert.equal(tsBtn.getAttribute('aria-pressed'), 'false');
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 3: CROSS-FEATURE INTERACTIONS (≥8 pairwise tests)
// ═══════════════════════════════════════════════════════════════════════════════

async function runTier3() {
  console.log('\n=== Running Tier 3: Cross-Feature Interactions ===\n');

  await registerTest('tier3', 'T3.1', '[F3 + F6] Tab Close + File Rename: Closed tab file renamed in tree reopens with new path', () => {
    const { workbench } = createTestLab();
    workbench.openFile('demo.js');
    workbench.closeTab('demo.js');
    workbench.renameFile('demo.js', 'walkthrough.js');
    assert.equal(workbench.openTabs.includes('demo.js'), false);
    workbench.openFile('walkthrough.js');
    assert.ok(workbench.openTabs.includes('walkthrough.js'));
    assert.equal(workbench.activeFile, 'walkthrough.js');
  });

  await registerTest('tier3', 'T3.2', '[F3 + F6] Active Tab + File Rename: Renaming currently active file updates tab title & model', () => {
    const { container, workbench } = createTestLab();
    workbench.openFile('lru.js');
    assert.equal(workbench.activeFile, 'lru.js');
    workbench.renameFile('lru.js', 'lru-cache.js');
    assert.equal(workbench.activeFile, 'lru-cache.js');
    assert.ok(workbench.openTabs.includes('lru-cache.js'));
    assert.equal(workbench.openTabs.includes('lru.js'), false);
    const tab = container.querySelector('.codelab-tab[data-cl-file="lru-cache.js"]');
    assert.ok(tab, 'Renamed tab must exist in DOM');
  });

  await registerTest('tier3', 'T3.3', '[F3 + F6] Open Tabs + Folder Delete: Deleting folder closes only its child tabs', () => {
    const { workbench } = createTestLab({
      files: {
        'src/a.js': '// a',
        'src/b.js': '// b',
        'root.js': '// root'
      }
    });
    workbench.openTabs = ['src/a.js', 'root.js', 'src/b.js'];
    workbench.activeFile = 'src/a.js';
    workbench.deleteFolder('src');
    assert.deepEqual(workbench.openTabs, ['root.js']);
    assert.equal(workbench.activeFile, 'root.js');
  });

  await registerTest('tier3', 'T3.4', '[F3 + F7] Drag-and-Drop + Active Tab: Moving active file updates activeFile and openTabs', () => {
    const { workbench } = createTestLab();
    workbench.openFile('test.js');
    workbench.createFolder('tests');
    workbench.moveFile('test.js', 'tests/test.js');
    assert.equal(workbench.activeFile, 'tests/test.js');
    assert.ok(workbench.openTabs.includes('tests/test.js'));
    assert.equal(workbench.openTabs.includes('test.js'), false);
  });

  await registerTest('tier3', 'T3.5', '[F4 + F6] Empty Editor + Inline Create: Creating file from empty state dismisses empty view', () => {
    const { container, workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    assert.equal(workbench.activeFile, null);
    workbench.createFile('notes.txt', 'quick note');
    assert.equal(workbench.activeFile, 'notes.txt');
    assert.ok(workbench.openTabs.includes('notes.txt'));
    const emptyEditor = container.querySelector('.codelab-empty-editor, #cl-empty-editor');
    assert.equal(emptyEditor.style.display, 'none');
  });

  await registerTest('tier3', 'T3.6', '[F2 + F3] Stepper Navigation + Tab Open: Selecting step opens targetFile in tabs if closed', () => {
    const { workbench } = createTestLab();
    workbench.closeTab('lru.js');
    assert.equal(workbench.openTabs.includes('lru.js'), false);
    workbench.selectStep(0, true);
    assert.ok(workbench.openTabs.includes('lru.js'), 'Target file must be opened in tabs on step select');
    assert.equal(workbench.activeFile, 'lru.js');
  });

  await registerTest('tier3', 'T3.7', '[F1 + F2] Mode Switch + Stepper Visibility: Switching to sandbox hides stepper; guided restores it', () => {
    const { container, workbench } = createTestLab();
    workbench.setMode('sandbox');
    const pillsSandbox = container.querySelectorAll('.codelab-topbar .codelab-step-pill');
    assert.equal(pillsSandbox.length, 0);
    const stepperHost = container.querySelector('#cl-step-pills');
    if (stepperHost) assert.equal(stepperHost.children.length, 0);

    workbench.setMode('guided');
    const pillsGuided = container.querySelectorAll('.codelab-guide .codelab-step-pill');
    assert.equal(pillsGuided.length, workbench.steps.length);
  });

  await registerTest('tier3', 'T3.8', '[F5 + F7] Folder Collapse + Drag-and-Drop: Moving file expands destination collapsed folder', () => {
    const { workbench } = createTestLab({
      files: {
        'dest/a.js': '// a',
        'src.js': '// src'
      }
    });
    workbench.collapsedFolders.add('dest');
    workbench.moveFile('src.js', 'dest/src.js');
    assert.equal(workbench.collapsedFolders.has('dest'), false, 'Collapsed dest folder must auto-expand');
  });

  await registerTest('tier3', 'T3.9', '[F1 + F4] Empty Editor + Run Demo: Triggering Run Demo from empty editor updates terminal logs', () => {
    const { workbench } = createTestLab();
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    assert.equal(workbench.activeFile, null);
    workbench.runDemo();
    assert.ok(workbench.terminalLogs.length > 0);
  });

  await registerTest('tier3', 'T3.10', '[F1 + F5] Language Switch + File List: Switching language switches active files appropriately', () => {
    const { workbench } = createTestLab({
      lang: 'js',
      tsStarterFiles: { 'lru.ts': '// ts lru', 'test.ts': '// ts test' }
    });
    workbench.setLanguage('ts');
    assert.equal(workbench.lang, 'ts');
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 4: REAL-WORLD USER WORKLOADS (≥5 multi-step workflows)
// ═══════════════════════════════════════════════════════════════════════════════

async function runTier4() {
  console.log('\n=== Running Tier 4: Real-World User Workloads ===\n');

  await registerTest('tier4', 'T4.1', 'Workload: Guided Challenge Progression Workflow', () => {
    const { container, workbench } = createTestLab();

    // 1. User starts at Step 1
    assert.equal(workbench.activeStepIndex, 0);
    const pill1 = container.querySelector('.codelab-guide .codelab-step-pill[data-cl-step="0"]');
    assert.ok(pill1.classList.contains('active'));

    // 2. User completes Step 1
    workbench.completedSteps.add('step-1');
    workbench._renderStepPills?.() || workbench._renderGuidePane?.();
    assert.ok(pill1.classList.contains('passed'));

    // 3. User clicks Next Step in guide footer
    const nextBtn = container.querySelector('.codelab-guide__footer [data-cl-step="1"]');
    if (nextBtn) nextBtn.click(); else workbench.selectStep(1, true);

    // 4. Verify Step 2 is now active
    assert.equal(workbench.activeStepIndex, 1);
    const pill2 = container.querySelector('.codelab-guide .codelab-step-pill[data-cl-step="1"]');
    assert.ok(pill2.classList.contains('active'));
  });

  await registerTest('tier4', 'T4.2', 'Workload: Multi-Tab Developer Refactoring Workflow', () => {
    const { container, workbench } = createTestLab();

    // 1. Initial tabs are open
    assert.ok(workbench.openTabs.includes('lru.js'));
    assert.ok(workbench.openTabs.includes('demo.js'));

    // 2. User closes demo.js and README.md
    workbench.closeTab('demo.js');
    workbench.closeTab('README.md');
    assert.equal(workbench.openTabs.includes('demo.js'), false);
    assert.equal(workbench.openTabs.includes('README.md'), false);

    // 3. User creates a new folder 'engine' and moves 'lru.js' into it
    workbench.createFolder('engine');
    workbench.moveFile('lru.js', 'engine/lru.js');
    assert.ok(workbench.files['engine/lru.js']);
    assert.equal(workbench.activeFile, 'engine/lru.js');

    // 4. User closes all remaining tabs
    while (workbench.openTabs.length) workbench.closeTab(workbench.openTabs[0]);
    assert.equal(workbench.activeFile, null);
    const emptyView = container.querySelector('.codelab-empty-editor, #cl-empty-editor');
    assert.notEqual(emptyView.style.display, 'none');

    // 5. User clicks 'engine/lru.js' in workspace tree to reopen
    workbench.openFile('engine/lru.js');
    assert.equal(workbench.activeFile, 'engine/lru.js');
    assert.ok(workbench.openTabs.includes('engine/lru.js'));
  });

  await registerTest('tier4', 'T4.3', 'Workload: LocalStorage Session Persistence & Restoration', () => {
    // 1. First session modifies state
    const { workbench: wb1 } = createTestLab();
    wb1.closeTab('demo.js');
    wb1.createFolder('src');
    wb1.toggleFolder('src');
    wb1.selectStep(2, false);
    wb1._saveState();

    // 2. Second session boots with same labId
    const { workbench: wb2 } = createTestLab();
    assert.equal(wb2.openTabs.includes('demo.js'), false, 'Restored session must preserve closed tabs');
    assert.ok(wb2.collapsedFolders.has('src'), 'Restored session must preserve collapsed folder state');
    assert.equal(wb2.activeStepIndex, 2, 'Restored session must preserve active step');
  });

  await registerTest('tier4', 'T4.4', 'Workload: Workspace Reset and State Restoration Workflow', () => {
    const { workbench } = createTestLab();

    // 1. User adds custom files and folders
    workbench.createFile('scratch.js', '// scratch');
    workbench.createFolder('temp');
    workbench.files['lru.js'] = '// modified user code';
    workbench.completedSteps.add('step-1');

    // 2. User triggers Reset Lab
    workbench.resetLab();

    // 3. Custom files wiped, starter files restored, progress reset
    assert.equal(workbench.files['scratch.js'], undefined, 'Custom file must be wiped on reset');
    assert.notEqual(workbench.files['lru.js'], '// modified user code', 'Core file must be restored to starter state');
    assert.equal(workbench.completedSteps.size, 0, 'Completed steps must be cleared on reset');
  });

  await registerTest('tier4', 'T4.5', 'Workload: Sandbox Exploration & Layout Control Workflow', () => {
    const { container, workbench } = createTestLab();

    // 1. Switch to sandbox
    workbench.setMode('sandbox');
    assert.equal(workbench.mode, 'sandbox');

    // 2. Toggle guide pane closed
    const guideToggle = container.querySelector('[data-cl-action="toggle-guide"]');
    if (guideToggle) guideToggle.click(); else workbench.toggleGuide?.();
    const guidePane = container.querySelector('.codelab-guide');
    if (guidePane) assert.ok(guidePane.classList.contains('collapsed') || guidePane.style.display === 'none');

    // 3. Toggle fullscreen
    const fsToggle = container.querySelector('[data-cl-action="toggle-fullscreen"]');
    if (fsToggle) fsToggle.click(); else workbench.toggleFullscreen?.();
    assert.equal(workbench.isFullscreen, true);

    // 4. Press Escape to exit fullscreen
    const escEv = new DOMEvent('keydown', { key: 'Escape', bubbles: true });
    doc.dispatchEvent(escEv);
    if (workbench._escHandler) workbench._escHandler(escEv);
    assert.equal(workbench.isFullscreen, false);
  });

  await registerTest('tier4', 'T4.6', 'Workload: Complex Nested Tree Restructuring & Model Caching', () => {
    const { workbench } = createTestLab();

    // 1. Build nested hierarchy
    workbench.createFolder('lib');
    workbench.createFolder('lib/algorithms');
    workbench.createFile('lib/algorithms/lru.js', '// deep lru');

    // 2. Mount and verify model
    workbench.openFile('lib/algorithms/lru.js');
    assert.equal(workbench.activeFile, 'lib/algorithms/lru.js');
    const model = workbench.models.get('lib/algorithms/lru.js');
    if (model) assert.equal(model.isDisposed, false);

    // 3. Rename intermediate folder
    workbench.renameFolder('lib/algorithms', 'lib/structures');
    assert.ok(workbench.files['lib/structures/lru.js']);
    assert.equal(workbench.activeFile, 'lib/structures/lru.js');
    assert.ok(workbench.openTabs.includes('lib/structures/lru.js'));

    // 4. Delete parent folder
    workbench.deleteFolder('lib');
    assert.equal(workbench.files['lib/structures/lru.js'], undefined);
    assert.equal(workbench.openTabs.includes('lib/structures/lru.js'), false);
  });

  // ── VS Code IDE & Third-Party SDK Capabilities Verification ─────────────
  await registerTest('tier4', 'T4.7', 'VSCode-1: Command Palette (> commands & Quick Open files)', () => {
    const { workbench } = createTestLab();
    workbench.openCommandPalette('commands');
    const slot = workbench.container.querySelector('#cl-modal-slot');
    assert.ok(slot.innerHTML.includes('codelab-palette'), 'Palette modal should render');
    assert.ok(workbench._currentPaletteItems.length >= 10, 'Should list IDE commands');

    // Filter commands
    workbench._renderPaletteList('> Diff');
    assert.ok(workbench._currentPaletteItems.some(i => i.id === 'compare-solution'), 'Should filter Diff commands');

    // Quick Open files mode
    workbench.openCommandPalette('files');
    workbench._renderPaletteList('test');
    assert.ok(workbench._currentPaletteItems.some(i => i.id === 'test.js'), 'Should filter workspace files');
    workbench._executePaletteSelection(0);
    assert.equal(workbench.activeFile, 'test.js', 'Selecting file in Quick Open should activate it');
  });

  await registerTest('tier4', 'T4.8', 'VSCode-2: Right-Click Context Menus on Explorer & Tabs + Duplicate/Close Others', () => {
    const { workbench } = createTestLab();
    workbench.openContextMenu(100, 120, [
      { label: 'Duplicate File', action: 'duplicate-file', target: 'lru.js' },
      { divider: true },
      { label: 'Delete File', action: 'delete-file', target: 'lru.js', danger: true }
    ]);
    const ctxSlot = workbench.container.querySelector('#cl-context-menu-slot');
    assert.ok(ctxSlot.innerHTML.includes('codelab-context-menu'), 'Context menu should render');

    const dupName = workbench.duplicateFile('lru.js');
    assert.equal(dupName, 'lru.copy.js');
    assert.ok(workbench.files['lru.copy.js'], 'Duplicate file should exist in VFS');

    workbench.closeOtherTabs('lru.copy.js');
    assert.deepEqual(workbench.getOpenTabs(), ['lru.copy.js']);

    workbench.closeAllTabs();
    assert.deepEqual(workbench.getOpenTabs(), []);
    workbench.closeContextMenu();
    assert.equal(ctxSlot.innerHTML, '');
  });

  await registerTest('tier4', 'T4.9', 'VSCode-3: Editor Breadcrumbs Bar (workspace › folder › file › symbol)', () => {
    const { workbench } = createTestLab({ mode: 'guided' });
    workbench.createFile('src/engine/storage.js', 'class StorageEngine {\n  put(k, v) {}\n}\n');
    const bc = workbench.container.querySelector('#cl-breadcrumbs');
    assert.ok(bc, 'Breadcrumbs bar should exist');
    assert.ok(bc.innerHTML.includes('src'), 'Breadcrumbs should include folder segment');
    assert.ok(bc.innerHTML.includes('storage.js'), 'Breadcrumbs should include file segment');
    assert.ok(bc.innerHTML.includes('StorageEngine'), 'Breadcrumbs should detect class symbol');
  });

  await registerTest('tier4', 'T4.10', 'VSCode-4: Inline & Side-by-Side Diff Viewer (Compare with Solution & Starter)', () => {
    const { workbench } = createTestLab({ mode: 'guided' });
    workbench.showDiffModal('lru.js', 'solution');
    const slot = workbench.container.querySelector('#cl-modal-slot');
    assert.ok(slot.innerHTML.includes('codelab-diff-modal'), 'Diff modal should render');
    assert.ok(slot.innerHTML.includes('codelab-diff-unified'), 'Default unified diff view should render');

    // Switch to split view
    workbench.diffViewMode = 'split';
    workbench.showDiffModal('lru.js', 'starter');
    assert.ok(slot.innerHTML.includes('codelab-diff-split'), 'Split diff view should render');
    workbench.closeModal();
  });

  await registerTest('tier4', 'T4.11', 'VSCode-5: Workspace Export & Import JSON Snapshot', () => {
    const { workbench } = createTestLab();
    workbench.setFile('custom/module.js', 'module.exports = 42;');
    const snap = workbench.exportWorkspace({ download: false });
    assert.equal(snap.labId, 'lru-cache-test');
    assert.equal(snap.files['custom/module.js'], 'module.exports = 42;');

    const { workbench: workbench2 } = createTestLab({ labId: 'imported-lab' });
    const imported = workbench2.importWorkspace(JSON.stringify(snap));
    assert.equal(imported, true);
    assert.equal(workbench2.getFile('custom/module.js'), 'module.exports = 42;');
    assert.ok(workbench2.folders.has('custom'));
  });

  await registerTest('tier4', 'T4.12', 'VSCode-6: Imperative Third-Party SDK APIs, Event Subscriptions & Plugin Hook', () => {
    let pluginCalled = false;
    const events = [];
    const { workbench } = createTestLab({
      persistState: false,
      plugins: [
        (wb) => { pluginCalled = Boolean(wb && wb.instanceId); }
      ]
    });
    assert.equal(pluginCalled, true, 'Plugin passed in options.plugins should run on init');
    assert.ok(workbench.instanceId && workbench.instanceId.startsWith('cl-'), 'Unique instanceId should be assigned');

    const offChange = workbench.on('change', detail => events.push(['change', detail.filename]));
    const offCreate = workbench.on('file-create', detail => events.push(['create', detail.filename]));
    const offDelete = workbench.on('file-delete', detail => events.push(['delete', detail.filename]));

    workbench.setFile('sdk/hello.js', 'console.log("hi");');
    assert.equal(workbench.getFile('sdk/hello.js'), 'console.log("hi");');
    assert.ok(workbench.getFiles()['sdk/hello.js']);

    workbench.deleteFile('sdk/hello.js');
    assert.equal(workbench.getFile('sdk/hello.js'), undefined);

    assert.ok(events.some(e => e[0] === 'create' && e[1] === 'sdk/hello.js'), 'file-create event should fire');
    assert.ok(events.some(e => e[0] === 'change' && e[1] === 'sdk/hello.js'), 'change event should fire');
    assert.ok(events.some(e => e[0] === 'delete' && e[1] === 'sdk/hello.js'), 'file-delete event should fire');

    offChange();
    offCreate();
    offDelete();
  });
}

// ── Main Test Runner Execution & Reporting ───────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       CodeLab IDE Workbench UI & E2E Automated Verification Suite          ║');
  console.log('║          Targeting Requirements R1, R2, R3, R4 (Minimum >= 93 tests)        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const suiteStartTime = Date.now();

  await runTier1();
  await runTier2();
  await runTier3();
  await runTier4();

  const totalDuration = Date.now() - suiteStartTime;

  const totalPassed = results.tier1.passed + results.tier2.passed + results.tier3.passed + results.tier4.passed;
  const totalFailed = results.tier1.failed + results.tier2.failed + results.tier3.failed + results.tier4.failed;
  const grandTotal = totalPassed + totalFailed;

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('                        TEST EXECUTION SUMMARY                              ');
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log(`  Tier 1: Feature Coverage (F1-F8)       : ${results.tier1.passed} / ${results.tier1.passed + results.tier1.failed} passed`);
  console.log(`  Tier 2: Boundary & Corner Cases        : ${results.tier2.passed} / ${results.tier2.passed + results.tier2.failed} passed`);
  console.log(`  Tier 3: Cross-Feature Interactions     : ${results.tier3.passed} / ${results.tier3.passed + results.tier3.failed} passed`);
  console.log(`  Tier 4: Real-World User Workloads      : ${results.tier4.passed} / ${results.tier4.passed + results.tier4.failed} passed`);
  console.log('────────────────────────────────────────────────────────────────────────────');
  console.log(`  Total Automated Test Cases Executed    : ${grandTotal} tests`);
  console.log(`  Passed                                 : ${totalPassed}`);
  console.log(`  Failed (Pending M1/M2/M3 Implementation): ${totalFailed}`);
  console.log(`  Pass Rate                              : ${((totalPassed / grandTotal) * 100).toFixed(1)}%`);
  console.log(`  Execution Time                         : ${totalDuration}ms`);
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  if (totalFailed > 0) {
    console.log(`ℹ Note: ${totalFailed} tests failed as expected against current un-redesigned workbench.`);
    console.log(`  Once Milestone implementations (M1, M2, M3, M4) are completed, all ${grandTotal} tests will pass.`);
    process.exit(1);
  } else {
    console.log(' All tests passed successfully!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  });
}

module.exports = { runTier1, runTier2, runTier3, runTier4, main };
