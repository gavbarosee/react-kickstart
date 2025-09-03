### Testing and quality

This project validates correctness at two levels:

- **Unit tests (Vitest)**: fast checks for prompt flow, rendering, and navigation logic.
- **QA automation (E2E-like)**: generates real projects across many configurations to catch integration issues early. See the QA overview in `../qa/qa-automation-overview.md`.

## Unit tests (Vitest)

- **Location**: `src/__tests__/*.spec.js`
- **Runner**: Vitest (node environment)
- **Config**: `vitest.config.js` (includes only `src/__tests__/**/*.spec.js`)
- **Coverage**: v8 reports to `coverage/` (text + HTML)

### What is covered

- **Prompt flow behavior**
  - `PromptFlow.clearAnswersAfterStep` retains early answers and clears downstream ones.
- **Renderer output and calls**
  - `PromptRenderer.showSelectionSummary` prints only defined fields and includes key choices.
  - `PromptRenderer.refreshDisplay` calls header then summary, verifying call order.
- **Navigation**
  - `StepNavigator` records steps, supports back navigation, and can reset.
- **Step base contract**
  - `BaseStep` adds a Back option conditionally.
  - `BaseStep.processSelection` stores the answer under an overridden key and advances.

### Run tests

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

Run a single file (examples):

```bash
npx vitest run src/__tests__/navigation.spec.js
npx vitest run src/__tests__/renderer.spec.js
```

### Philosophy

- Prefer simple, deterministic doubles over heavy mocks to avoid brittle tests.
- Assert observable behavior (outputs, state transitions, call order) not implementation details.
- Keep tests fast; coverage should reflect meaningful paths, not noise.

## QA automation (E2E-style)

The `qa-automation/` suite creates real projects from many option combinations, validating structure, dependencies, and optionally build/lint/test.

- **Docs**: `../qa/qa-automation-overview.md`
- **Quick commands** (from repo root):

```bash
npm run qa:critical    # fast structural checks of critical configs
npm run qa:standard    # broader coverage
```

From inside `qa-automation/` you can run deeper passes, e.g.:

```bash
node test-runner.js critical --full   # includes build/tests for each generated app
```

## Adding tests

- Place new specs under `src/__tests__/` with `kebab-case` filenames ending in `.spec.js`.
- Focus on public behavior. If a detail must be mocked, keep the double minimal and explicit.
- Update or extend QA validators when adding new generators/options so end-to-end checks stay representative.
