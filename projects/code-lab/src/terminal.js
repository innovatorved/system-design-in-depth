/**
 * @innovatorved/code-lab - Pure-JS PTY Terminal Emulator Component
 *
 * High-fidelity, self-contained terminal emulator engine providing:
 * - Inline prompt with cwd awareness (codelab:${cwd}$ )
 * - Interactive REPL sub-mode (> ) with .exit and Ctrl+D/Ctrl+C
 * - Character-by-character editing with cursor navigation:
 *   ArrowLeft, ArrowRight, Home, End, Ctrl+A, Ctrl+E, Ctrl+U, Ctrl+K, Backspace, Delete
 * - Tab auto-completion for built-in commands and VFS filesystem paths
 * - History navigation (ArrowUp, ArrowDown)
 * - ANSI 16/256 SGR escape sequence translation to styled Geist HTML spans
 * - Headless DOM safety (defensive guards for Node.js test environments)
 *
 * (C) 2026 InnovatorVed / CodeLab. MIT License.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    root.CodeLabTerminal = exports;
    root.PTYTerminalEngine = exports.PTYTerminalEngine;
    root.createTerminal = exports.createTerminal;
    root.ansiToHtml = exports.ansiToHtml;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ANSI_CODE_MAP = {
    1: 'cl-ansi-bold',
    2: 'cl-ansi-dim',
    3: 'cl-ansi-italic',
    4: 'cl-ansi-underline',
    30: 'cl-ansi-black',
    31: 'cl-ansi-red',
    32: 'cl-ansi-green',
    33: 'cl-ansi-yellow',
    34: 'cl-ansi-blue',
    35: 'cl-ansi-magenta',
    36: 'cl-ansi-cyan',
    37: 'cl-ansi-white',
    90: 'cl-ansi-gray',
    91: 'cl-ansi-bright-red',
    92: 'cl-ansi-bright-green',
    93: 'cl-ansi-bright-yellow',
    94: 'cl-ansi-bright-blue',
    95: 'cl-ansi-bright-magenta',
    96: 'cl-ansi-bright-cyan',
    97: 'cl-ansi-bright-white',
    40: 'cl-ansi-bg-black',
    41: 'cl-ansi-bg-red',
    42: 'cl-ansi-bg-green',
    43: 'cl-ansi-bg-yellow',
    44: 'cl-ansi-bg-blue',
    45: 'cl-ansi-bg-magenta',
    46: 'cl-ansi-bg-cyan',
    47: 'cl-ansi-bg-white'
  };

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ansiToHtml(str) {
    if (!str) return '';
    const s = String(str);
    if (!s.includes('\x1b[')) {
      return escapeHtml(s);
    }

    // Strip non-color cursor control sequences
    const cleaned = s.replace(/\x1b\[[0-9;]*[A-LN-Za-z]/g, '');

    const tokenRegex = /\x1b\[([0-9;]*)m/g;
    let result = '';
    let lastIdx = 0;
    let openSpans = 0;
    let match;

    while ((match = tokenRegex.exec(cleaned)) !== null) {
      const rawText = cleaned.slice(lastIdx, match.index);
      if (rawText) result += escapeHtml(rawText);
      lastIdx = tokenRegex.lastIndex;

      const codes = match[1] ? match[1].split(';').map(Number) : [0];
      for (const code of codes) {
        if (code === 0) {
          while (openSpans > 0) {
            result += '</span>';
            openSpans--;
          }
        } else {
          const cls = ANSI_CODE_MAP[code];
          if (cls) {
            result += `<span class="${cls}">`;
            openSpans++;
          }
        }
      }
    }

    const remaining = cleaned.slice(lastIdx);
    if (remaining) result += escapeHtml(remaining);
    while (openSpans > 0) {
      result += '</span>';
      openSpans--;
    }
    return result;
  }

  class PTYTerminalEngine {
    constructor(container, options = {}) {
      this.container = container || null;
      this.options = options;
      this.logs = Array.isArray(options.logs) ? options.logs : [];
      this.cwd = options.cwd || '/workspace';
      this.replMode = Boolean(options.replMode);
      this.promptOverride = options.prompt || null;
      this.history = Array.isArray(options.history) ? options.history : [];
      this.historyIdx = -1;
      this.savedBuffer = '';
      this.buffer = '';
      this.cursor = 0;
      this.onCommand = typeof options.onCommand === 'function' ? options.onCommand : null;
      this.getCompletions = typeof options.getCompletions === 'function' ? options.getCompletions : null;
      this.onKey = typeof options.onKey === 'function' ? options.onKey : null;

      this._mounted = false;
      this._listeners = [];

      if (this.container) {
        this.mount(this.container);
      }
    }

    getPrompt() {
      if (this.promptOverride) return this.promptOverride;
      if (this.replMode) return '> ';
      const cwd = this.cwd || '/workspace';
      return `codelab:${cwd}$ `;
    }

    setPrompt(p) {
      this.promptOverride = p;
      this.updateActiveLine();
    }

    setCwd(cwd) {
      this.cwd = cwd;
      this.updateActiveLine();
    }

    setReplMode(enabled) {
      this.replMode = Boolean(enabled);
      this.updateActiveLine();
    }

    write(data, type = 'stdout') {
      const text = String(data);
      this.logs.push({ text, type });
      this.render();
    }

    writeln(data, type = 'stdout') {
      this.write(String(data) + '\n', type);
    }

    clear() {
      this.logs.length = 0;
      this.render();
    }

    getHistory() {
      return [...this.history];
    }

    focus() {
      if (!this.container) return;
      const input = this.container.querySelector('#cl-repl-input');
      if (input && typeof input.focus === 'function') {
        try { input.focus(); } catch (_) {}
      }
    }

    mount(container) {
      this.container = container;
      this._mounted = true;
      this.render();
      this._bindEvents();
    }

    destroy() {
      for (const { target, type, handler } of this._listeners) {
        if (target && typeof target.removeEventListener === 'function') {
          try { target.removeEventListener(type, handler); } catch (_) {}
        }
      }
      this._listeners = [];
      this._mounted = false;
    }

    _addListener(target, type, handler) {
      if (target && typeof target.addEventListener === 'function') {
        target.addEventListener(type, handler);
        this._listeners.push({ target, type, handler });
      }
    }

    _bindEvents() {
      if (!this.container) return;
      const termSurface = this.container.querySelector('#cl-terminal-surface') || this.container;
      const input = this.container.querySelector('#cl-repl-input');
      const form = this.container.querySelector('#cl-repl-form');

      if (termSurface) {
        this._addListener(termSurface, 'click', (e) => {
          if (e && e.target === input) return;
          const hasSelection = typeof window !== 'undefined' && window.getSelection && String(window.getSelection());
          if (!hasSelection) this.focus();
        });
      }

      if (input) {
        this._addListener(input, 'keydown', (e) => this.handleKeyDown(e));
        this._addListener(input, 'input', () => {
          if (input.value !== this.buffer) {
            this.buffer = input.value;
            this.cursor = this.buffer.length;
            this.updateActiveLine();
          }
        });
      }

      if (form) {
        this._addListener(form, 'submit', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          this.submitLine();
        });
      }
    }

    handleKeyDown(e) {
      if (!e) return;
      if (this.onKey) {
        try {
          const res = this.onKey(e);
          if (res === false) return;
        } catch (_) {}
      }

      const key = e.key;
      const isCtrl = e.ctrlKey || e.metaKey;

      if (key === 'ArrowLeft') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor > 0) {
          this.cursor--;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'ArrowRight') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor < this.buffer.length) {
          this.cursor++;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'Home' || (isCtrl && (key === 'a' || key === 'A'))) {
        if (e.preventDefault) e.preventDefault();
        this.cursor = 0;
        this.updateActiveLine();
        return;
      }

      if (key === 'End' || (isCtrl && (key === 'e' || key === 'E'))) {
        if (e.preventDefault) e.preventDefault();
        this.cursor = this.buffer.length;
        this.updateActiveLine();
        return;
      }

      if (isCtrl && (key === 'u' || key === 'U')) {
        if (e.preventDefault) e.preventDefault();
        this.buffer = this.buffer.slice(this.cursor);
        this.cursor = 0;
        this.updateActiveLine();
        return;
      }

      if (isCtrl && (key === 'k' || key === 'K')) {
        if (e.preventDefault) e.preventDefault();
        this.buffer = this.buffer.slice(0, this.cursor);
        this.updateActiveLine();
        return;
      }

      if (key === 'Backspace') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor > 0) {
          this.buffer = this.buffer.slice(0, this.cursor - 1) + this.buffer.slice(this.cursor);
          this.cursor--;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'Delete') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor < this.buffer.length) {
          this.buffer = this.buffer.slice(0, this.cursor) + this.buffer.slice(this.cursor + 1);
          this.updateActiveLine();
        }
        return;
      }

      if (isCtrl && (key === 'l' || key === 'L')) {
        if (e.preventDefault) e.preventDefault();
        this.clear();
        return;
      }

      if (isCtrl && (key === 'c' || key === 'C')) {
        if (e.preventDefault) e.preventDefault();
        this.logs.push({ type: 'system', text: `${this.getPrompt()}${this.buffer}^C` });
        this.buffer = '';
        this.cursor = 0;
        this.historyIdx = -1;
        if (this.replMode) {
          this.replMode = false;
        }
        this.render();
        return;
      }

      if (isCtrl && (key === 'd' || key === 'D')) {
        if (this.buffer === '') {
          if (e.preventDefault) e.preventDefault();
          if (this.replMode) {
            this.logs.push({ type: 'system', text: `${this.getPrompt()}.exit` });
            this.replMode = false;
            this.render();
            return;
          }
        }
      }

      if (key === 'ArrowUp') {
        if (e.preventDefault) e.preventDefault();
        if (!this.history.length) return;
        if (this.historyIdx === -1) {
          this.savedBuffer = this.buffer;
          this.historyIdx = this.history.length - 1;
        } else if (this.historyIdx > 0) {
          this.historyIdx--;
        }
        this.buffer = this.history[this.historyIdx] || '';
        this.cursor = this.buffer.length;
        this.updateActiveLine();
        return;
      }

      if (key === 'ArrowDown') {
        if (e.preventDefault) e.preventDefault();
        if (this.historyIdx !== -1) {
          if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.buffer = this.history[this.historyIdx] || '';
          } else {
            this.historyIdx = -1;
            this.buffer = this.savedBuffer || '';
          }
          this.cursor = this.buffer.length;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'Tab') {
        if (e.preventDefault) e.preventDefault();
        this.autoComplete();
        return;
      }

      if (key === 'Enter') {
        if (e.preventDefault) e.preventDefault();
        this.submitLine();
        return;
      }

      // Printable character
      if (key && key.length === 1 && !isCtrl && !e.altKey) {
        this.buffer = this.buffer.slice(0, this.cursor) + key + this.buffer.slice(this.cursor);
        this.cursor++;
        this.updateActiveLine();
      }
    }

    autoComplete() {
      if (!this.getCompletions) return;
      const res = this.getCompletions(this.buffer, this.cursor);
      if (!res || !Array.isArray(res.matches) || res.matches.length === 0) return;

      const matches = res.matches;
      if (matches.length === 1) {
        const match = matches[0];
        const isDir = match.endsWith('/');
        const appendChar = isDir ? '' : ' ';
        const before = this.buffer.slice(0, res.tokenStart);
        const after = this.buffer.slice(this.cursor);
        this.buffer = before + match + appendChar + after;
        this.cursor = before.length + match.length + appendChar.length;
        this.updateActiveLine();
      } else {
        // Find longest common prefix
        let lcp = matches[0];
        for (let i = 1; i < matches.length; i++) {
          let j = 0;
          while (j < lcp.length && j < matches[i].length && lcp[j] === matches[i][j]) {
            j++;
          }
          lcp = lcp.slice(0, j);
        }

        if (lcp.length > res.token.length) {
          const before = this.buffer.slice(0, res.tokenStart);
          const after = this.buffer.slice(this.cursor);
          this.buffer = before + lcp + after;
          this.cursor = before.length + lcp.length;
        }

        // Print candidate matches
        this.logs.push({ type: 'system', text: `${this.getPrompt()}${this.buffer}` });
        this.logs.push({ type: 'stdout', text: matches.join('  ') });
        this.render();
      }
    }

    submitLine() {
      const line = this.buffer;
      this.buffer = '';
      this.cursor = 0;
      this.historyIdx = -1;

      if (line.trim()) {
        if (this.history[this.history.length - 1] !== line.trim()) {
          this.history.push(line.trim());
        }
      }

      if (this.onCommand) {
        this.onCommand(line);
      }
    }

    updateActiveLine() {
      if (!this.container) return;
      const input = this.container.querySelector('#cl-repl-input');
      if (input && input.value !== this.buffer) {
        input.value = this.buffer;
      }
      const lineEl = this.container.querySelector('#cl-pty-active-line');
      if (!lineEl) return;

      const prompt = this.getPrompt();
      const before = this.buffer.slice(0, this.cursor);
      const cursorChar = this.cursor < this.buffer.length ? this.buffer[this.cursor] : ' ';
      const after = this.cursor < this.buffer.length ? this.buffer.slice(this.cursor + 1) : '';

      lineEl.innerHTML = `<span class="codelab-pty__prompt">${escapeHtml(prompt)}</span><span class="codelab-pty__before">${escapeHtml(before)}</span><span class="codelab-pty__cursor blink">${escapeHtml(cursorChar)}</span><span class="codelab-pty__after">${escapeHtml(after)}</span>`;
    }

    render() {
      if (!this.container) return;
      const logsHtml = this.logs
        .map(item => `<div class="codelab-log-line ${escapeHtml(item.type || '')}">${ansiToHtml(item.text)}</div>`)
        .join('');

      const prompt = this.getPrompt();
      const before = this.buffer.slice(0, this.cursor);
      const cursorChar = this.cursor < this.buffer.length ? this.buffer[this.cursor] : ' ';
      const after = this.cursor < this.buffer.length ? this.buffer.slice(this.cursor + 1) : '';

      this.container.innerHTML = `
        <div class="codelab-terminal" id="cl-terminal-surface" tabindex="0">
          <div class="codelab-terminal__log" id="cl-terminal-log">${logsHtml}</div>
          <div class="codelab-pty__active-line" id="cl-pty-active-line">
            <span class="codelab-pty__prompt">${escapeHtml(prompt)}</span><span class="codelab-pty__before">${escapeHtml(before)}</span><span class="codelab-pty__cursor blink">${escapeHtml(cursorChar)}</span><span class="codelab-pty__after">${escapeHtml(after)}</span>
          </div>
          <form class="codelab-repl" id="cl-repl-form" style="position:absolute;opacity:0;pointer-events:none;height:0;overflow:hidden;">
            <input type="text" class="codelab-repl__input" id="cl-repl-input" autocomplete="off" spellcheck="false" aria-label="Terminal command input" value="${escapeHtml(this.buffer)}">
          </form>
        </div>
      `;

      if (typeof this.container.scrollTop === 'number' && typeof this.container.scrollHeight === 'number') {
        this.container.scrollTop = this.container.scrollHeight;
      }

      this._bindEvents();
    }
  }

  function createTerminal(container, options = {}) {
    return new PTYTerminalEngine(container, options);
  }

  return {
    PTYTerminalEngine,
    createTerminal,
    ansiToHtml,
    escapeHtml,
    ANSI_CODE_MAP
  };
});
