# Authoring Guided Labs & Step-by-Step Challenges

CodeLab provides a structured, Codedamn and TutorialKit-style guided curriculum workflow where users solve progressive algorithmic steps with automated test verification.

---

## 1. Step Schema (`CodeLabStep`)

Each guided step in `options.steps` defines:

```ts
interface CodeLabStep {
  /** Unique step ID */
  id: string;

  /** Title displayed in the step progress header */
  title: string;

  /** Theoretical concept summary displayed in the highlight box */
  concept?: string;

  /** Detailed markdown instructions explaining requirements & invariants */
  instructions: string;

  /** File to automatically open when this step is selected */
  targetFile?: string;

  /** Class/function name or TODO marker to focus in Monaco editor */
  targetSymbol?: string;

  /** Collapsible code hint or mathematical formula */
  hint?: string;

  /** Array of test names from test.js required to mark this step complete */
  testNames?: string[];
}
```

---

## 2. Complete Guided Lab Definition Example

```js
const slidingWindowLab = {
  id: 'sliding-window-rate-limiter',
  title: 'Build a Sliding Window Rate Limiter',
  mode: 'guided',
  language: 'js',
  entry: 'demo.js',
  testEntry: 'test.js',

  // Initial code learner starts with (contains stubs)
  starterFiles: {
    'limiter.js': `
      class SlidingWindowLimiter {
        constructor(windowMs = 1000, maxRequests = 5) {
          this.windowMs = windowMs;
          this.maxRequests = maxRequests;
          this.hits = new Map();
        }

        // TODO (Step 1): Implement allowRequest(ip, now)
        allowRequest(ip, now = Date.now()) {
          throw new Error('TODO: Implement allowRequest');
        }

        // TODO (Step 2): Implement cleanup(now)
        cleanup(now = Date.now()) {
          throw new Error('TODO: Implement cleanup');
        }
      }

      module.exports = { SlidingWindowLimiter };
    `,
    'demo.js': `
      const { SlidingWindowLimiter } = require('./limiter');
      const limiter = new SlidingWindowLimiter(1000, 3);
      console.log('1. Allowed:', limiter.allowRequest('user-1'));
    `,
    'test.js': `
      const { test } = require('node:test');
      const assert = require('node:assert/strict');
      const { SlidingWindowLimiter } = require('./limiter');

      test('allows requests within threshold', () => {
        const l = new SlidingWindowLimiter(1000, 2);
        assert.equal(l.allowRequest('ip1', 100), true);
        assert.equal(l.allowRequest('ip1', 200), true);
      });

      test('blocks requests exceeding threshold', () => {
        const l = new SlidingWindowLimiter(1000, 2);
        l.allowRequest('ip1', 100);
        l.allowRequest('ip1', 200);
        assert.equal(l.allowRequest('ip1', 300), false);
      });

      test('cleans up expired timestamps', () => {
        const l = new SlidingWindowLimiter(1000, 2);
        l.allowRequest('ip1', 100);
        l.cleanup(1200);
        assert.equal(l.allowRequest('ip1', 1250), true);
      });
    `
  },

  // Steps sequence
  steps: [
    {
      id: 'step-1',
      title: 'Step 1: Timestamp Recording & Invariant Check',
      concept: 'A sliding window maintains a list of timestamps per key and discards timestamps older than (now - windowMs).',
      targetFile: 'limiter.js',
      targetSymbol: 'allowRequest',
      instructions: `
Implement \`allowRequest(ip, now)\`:
1. Retrieve or initialize the timestamp array for \`ip\`.
2. Filter out timestamps where \`t < now - this.windowMs\`.
3. If \`timestamps.length < this.maxRequests\`, push \`now\` and return \`true\`.
4. Otherwise, return \`false\`.
      `,
      hint: `timestamps = timestamps.filter(t => t >= now - this.windowMs);`,
      testNames: [
        'allows requests within threshold',
        'blocks requests exceeding threshold'
      ]
    },
    {
      id: 'step-2',
      title: 'Step 2: Proactive Window Reaping',
      concept: 'To prevent unbounded memory growth from one-time visitors, prune empty maps periodically.',
      targetFile: 'limiter.js',
      targetSymbol: 'cleanup',
      instructions: `
Implement \`cleanup(now)\`:
Iterate through \`this.hits\` and remove any IP entries where all timestamps have expired.
      `,
      hint: `if (filtered.length === 0) this.hits.delete(ip);`,
      testNames: [
        'cleans up expired timestamps'
      ]
    }
  ]
};

// Mount in DOM
CodeLab.mount('#lab-container', slidingWindowLab);
```

---

## 3. How Verification Works

When the user clicks **Verify Step** (`Cmd+Shift+Enter`):
1. CodeLab gathers the `testNames` declared on the active step.
2. The Web Worker executes `test.js` filtering only those test names.
3. If all tests pass:
   - The step progress badge turns green.
   - `onStepComplete(step, index)` fires.
   - If it's the final step, `onLabComplete(labId)` fires and celebrates completion.
