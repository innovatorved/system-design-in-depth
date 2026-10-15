# Workbench Configuration & API Reference

Complete reference of options, methods, events, and shortcuts for `CodeLab.mount(container, options)` and `new CodeLab.Workbench(container, options)`.

---

## 1. Options (`CodeLabOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `'custom-lab'` | Unique identifier used for `localStorage` state persistence. |
| `title` | `string` | `id` | Title displayed in the workbench topbar header. |
| `summary` | `string` | `''` | Brief description displayed in the guide pane when `README.md` is absent. |
| `mode` | `'guided' \| 'sandbox'` | `'guided'` | Initial mode. `'guided'` shows the left curriculum pane; `'sandbox'` expands the editor full-width. |
| `language` | `'js' \| 'ts'` | `'js'` | Initial language toggle state. |
| `theme` | `'dark' \| 'light' \| 'auto'` | `'auto'` | Force dark or light mode, or follow system / `data-theme`. |
| `persistState` | `boolean` | `true` | When `false`, ignores `localStorage` and maintains files in memory only. |
| `files` | `Record<string, string>` | `{}` | Reference solution files map (`filename` → code). |
| `starterFiles` | `Record<string, string>` | `{}` | Initial files for Guided mode (typically containing `// TODO` stubs). |
| `solutionFiles` | `Record<string, string>` | `{}` | Explicit JavaScript solution files (used by Solution Diff viewer). |
| `tsFiles` | `Record<string, string>` | `{}` | TypeScript solution files. |
| `tsStarterFiles` | `Record<string, string>` | `{}` | TypeScript starter files. |
| `steps` | `CodeLabStep[]` | `[]` | Array of step definitions for Guided challenge progression. |
| `stepIndex` | `number` | `0` | Initial active step index (0-based). |
| `entry` | `string` | `'demo.js'` | Entrypoint file executed by the **Run Demo** button. |
| `testEntry` | `string` | `'test.js'` | Entrypoint file executed by the **Verify Step** / **Run Tests** button. |
| `backLabel` | `string` | `'← Back'` | Label for the back button. Only rendered if `onClose` is provided. |
| `monacoUrl` | `string` | CDN | Custom base URL for Monaco Editor loader. |
| `onClose` | `() => void` | `null` | Callback triggered when back/close button is clicked. |
| `onStepComplete` | `(step, idx) => void` | `null` | Fired when all tests for the current step pass. |
| `onLabComplete` | `(labId) => void` | `null` | Fired when all steps in the lab have passed. |
| `onRun` | `(result) => void` | `null` | Fired whenever code execution finishes (demo, tests, or REPL). |
| `onTestResult` | `(result) => void` | `null` | Fired specifically when test suite execution finishes. |
| `onCodeChange` | `(file, code) => void`| `null` | Fired whenever any file is edited in Monaco or VFS. |

---

## 2. Instance Methods (`workbench.*`)

### Execution
- `workbench.runDemo()`: Executes the demo entry file (`options.entry`).
- `workbench.runTests(filterTestNames?)`: Executes the test runner (`options.testEntry`), optionally filtered by test name(s).
- `workbench.verifyCurrentStep()`: Executes only the tests mapped to the current guided step.
- `workbench.stopExecution()`: Immediately terminates in-flight Web Worker execution.

### Virtual Filesystem & Tabs
- `workbench.getFiles()`: Returns a snapshot of all workspace files `{ [path: string]: string }`.
- `workbench.setFiles(filesMap, options?)`: Replaces or merges workspace files, updates Monaco models, and syncs the tree.
- `workbench.getFile(path)`: Returns the string content of a file, or `null` if not found.
- `workbench.setFile(path, content, { open?: boolean })`: Creates or updates a file.
- `workbench.deleteFile(path)`: Deletes a file from the workspace.
- `workbench.createFolder(path)`: Creates an empty folder directory node in the tree.
- `workbench.renameFile(oldPath, newPath)`: Renames a file and updates open tabs.
- `workbench.renameFolder(oldPrefix, newPrefix)`: Renames a folder and moves all child files.
- `workbench.duplicateFile(path)`: Duplicates a file (`name.copy.js`).
- `workbench.openFile(path, symbolToFind?)`: Opens a file tab in the editor and optionally focuses a method/class.
- `workbench.closeTab(path)`: Closes an open tab while keeping the file intact in the filesystem.
- `workbench.closeOtherTabs(keepPath)`: Closes all tabs except `keepPath`.
- `workbench.closeAllTabs()`: Closes all tabs and displays the empty-state screen.
- `workbench.getOpenTabs()`: Returns an array of currently open tab file paths.

### Modals & Dialogs
- `workbench.openCommandPalette(mode?)`: Opens the Command Palette (`mode: 'commands'` or `'files'`).
- `workbench.closeCommandPalette()`: Closes the Command Palette.
- `workbench.showDiffModal(file?, compareTarget?)`: Opens the line-by-line diff viewer (`compareTarget: 'solution' | 'starter'`).
- `workbench.showPackagesModal()`: Opens the NPM package quick-installer modal.
- `workbench.showSolutionModal()`: Opens the reference solution viewer modal.
- `workbench.exportWorkspace()`: Exports workspace files as a downloadable JSON snapshot.
- `workbench.importWorkspace(snapshot)`: Imports a JSON snapshot or files map into the workspace.

### Configuration & Lifecycle
- `workbench.setMode('guided' | 'sandbox')`: Switches between Guided challenge and Sandbox mode.
- `workbench.setLanguage('js' | 'ts')`: Switches between JavaScript and TypeScript.
- `workbench.selectStep(index, jumpToCode?)`: Jumps to a specific guided step.
- `workbench.resetLab()`: Resets workspace files to the initial starter template.
- `workbench.toggleFullscreen()`: Toggles full-screen IDE overlay mode.
- `workbench.destroy()`: Unmounts Monaco, terminates background workers, and cleans up DOM listeners.

---

## 3. Event Subscriptions (`workbench.on`)

Subscribe to events with `workbench.on(event, handler)`. Returns an unsubscribe function.

```ts
// Subscribe to file modifications
const unsubscribe = workbench.on('change', ({ filename, code }) => {
  console.log(`File edited: ${filename}`);
});

// Subscribe to step completion
workbench.on('step-complete', ({ step, index }) => {
  alert(`Completed step ${index + 1}: ${step.title}!`);
});

// Subscribe to lab completion
workbench.on('lab-complete', ({ labId }) => {
  console.log(`Lab completed: ${labId}`);
});

// Clean up
unsubscribe();
```

---

## 4. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd / Ctrl + Enter` | **Run Demo** entry file |
| `Cmd / Ctrl + Shift + Enter` | **Verify Step** / Run current step tests |
| `Cmd / Ctrl + Shift + P` or `F1` | Open **Command Palette** |
| `Cmd / Ctrl + P` | Open **Quick Open** (file switcher) |
| `Esc` | Close active modal dialog or exit full-screen mode |
| `Tab` (in Terminal) | Auto-complete command or VFS path |
| `Ctrl + C` (in Terminal) | Send SIGINT / abort running command |
| `Ctrl + L` (in Terminal) | Clear terminal screen |
