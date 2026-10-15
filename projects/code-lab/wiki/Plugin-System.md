# Plugin System & Custom Extensions

`@innovatorved/code-lab` includes a lightweight, synchronous plugin architecture (`instance.use(plugin, options)`) and a dual event bus (imperative `.on()` / `.off()` subscriptions + DOM `CustomEvent` bubbling) for extending the workbench with telemetry, LMS grading hooks, custom workspace snapshotting, and automated coaching.

---

## 1. Registering Plugins

Plugins can be passed either at initialization time via `options.plugins` or dynamically via `instance.use(plugin, options)`.

A plugin can be:
- A **function**: `(workbench, options) => void`
- Or an **object** with an `install` method: `{ install(workbench, options): void }`

### Passing Plugins at Mount Time

```js
import { CodeLab } from '@innovatorved/code-lab';

const telemetryPlugin = (lab) => {
  lab.on('run', ({ mode, entry, result }) => {
    console.log(`[Telemetry] ${lab.labId} ran ${entry} (${mode}) in ${result.durationMs}ms`);
  });

  lab.on('step-complete', ({ stepId, stepIndex, completedSteps }) => {
    console.log(`[Telemetry] Step ${stepIndex + 1} (${stepId}) passed!`, completedSteps);
  });
};

const lab = CodeLab.mount('#ide', {
  labId: 'rate-limiter-lab',
  title: 'Token-Bucket Rate Limiter',
  files: {
    'index.js': 'exports.allow = () => true;\n',
    'test.js': 'const assert = require("assert");\n'
  },
  plugins: [telemetryPlugin]
});
```

### Registering Plugins Imperatively via `.use()`

```js
const autoSavePlugin = {
  install(lab, { debounceMs = 1000 } = {}) {
    let timer = null;
    lab.on('change', ({ filename, code }) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const snapshot = lab.exportWorkspace({ includeTests: true });
        fetch('/api/save-workspace', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(snapshot)
        });
      }, debounceMs);
    });
  }
};

lab.use(autoSavePlugin, { debounceMs: 500 });
```

---

## 2. Event Bus Reference (`lab.on` / `lab.off`)

Every event can be subscribed to using either its short name (e.g. `'run'`) or its namespaced name (e.g. `'codelab:run'`). `lab.on(event, handler)` returns an `unsubscribe()` function.

| Event Name | Short Alias | Payload Properties | Description |
| :--- | :--- | :--- | :--- |
| `codelab:run` | `run` | `{ labId, mode: 'run' \| 'test', entry, result }` | Fired whenever a demo script or test suite finishes executing. |
| `codelab:change` / `codelab:code-change` | `change` / `code-change` | `{ labId, filename, path, code, content }` | Fired when a file is edited in Monaco or updated via `setFile()`. |
| `codelab:file-open` | `file-open` | `{ labId, filename }` | Fired when a file tab is opened and focused in the editor. |
| `codelab:file-create` | `file-create` | `{ labId, filename, content }` | Fired when a new file is created in the workspace. |
| `codelab:file-delete` | `file-delete` | `{ labId, filename }` | Fired when a file is deleted from the workspace. |
| `codelab:step-complete` / `codelab:step:pass` | `step-complete` / `step:pass` | `{ labId, step, stepId, stepIndex, index, completedSteps }` | Fired when all target tests for a guided step pass. |
| `codelab:lab-complete` | `lab-complete` | `{ labId, completedSteps }` | Fired when all guided steps in the lab have been completed. |

```js
// Subscribe and later unsubscribe
const unsubscribe = lab.on('step-complete', (detail) => {
  console.log('Completed step:', detail.stepId);
});

// Remove specific listener
unsubscribe();

// Or remove all listeners for an event
lab.off('step-complete');
```

---

## 3. Workspace Snapshot & LMS Grading Example

Plugins have full access to the `CodeLabWorkbench` instance API (`getFiles()`, `getFile(path)`, `setFile(path, content)`, `openFile(path)`, `runTests(filter)`, `exportWorkspace()`, `importWorkspace(snapshot)`).

```js
function lmsSubmissionPlugin(lab, { endpoint }) {
  lab.on('lab-complete', async ({ labId, completedSteps }) => {
    const snapshot = lab.exportWorkspace({ includeTests: false });
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        labId,
        completedSteps,
        files: snapshot.files,
        submittedAt: new Date().toISOString()
      })
    });
  });
}

lab.use(lmsSubmissionPlugin, { endpoint: '/api/labs/submit' });
```
