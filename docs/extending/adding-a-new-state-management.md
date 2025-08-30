### Adding a New State Management Library (e.g., MobX, Jotai, Recoil)

This guide explains how to integrate an additional global state solution into react-kickstart so it’s selectable in prompts/CLI, installs the right dependencies, generates example store/components, wires entry points for Vite and Next.js, and is covered by QA automation.

Use Redux Toolkit and Zustand as reference implementations.

#### 1) Declare Dependencies and Versions (Required)

- File: `src/builders/dependencies.js`
  - Add a version block and a getter for your library.

Examples:

```js
// MobX
export const mobx = {
  mobx: "^6.12.0",
  mobxReactLite: "^4.0.7",
};

export function getMobxDependencies() {
  return {
    mobx: mobx.mobx,
    "mobx-react-lite": mobx.mobxReactLite,
  };
}

// Jotai
export const jotai = {
  jotai: "^2.8.0",
};

export function getJotaiDependencies() {
  return { jotai: jotai.jotai };
}

// Recoil
export const recoil = {
  recoil: "^0.7.7",
};

export function getRecoilDependencies() {
  return { recoil: recoil.recoil };
}
```

#### 2) Wire Dependency Resolution (Required)

- File: `src/builders/dependency-resolver.js`
  - Update `getStateManagementDependencies(stateChoice)` to return your new dependencies.

Example:

```js
getStateManagementDependencies(stateChoice) {
  switch (stateChoice) {
    case "redux":
      return getReduxDependencies();
    case "zustand":
      return getZustandDependencies();
    case "mobx":
      return getMobxDependencies();
    case "jotai":
      return getJotaiDependencies();
    case "recoil":
      return getRecoilDependencies();
    default:
      return {};
  }
}
```

If any library needs peer dependencies or optional Babel/SWC toggles, add validations in `validateDependencies(...)` or `validateChoiceCombinations(...)`.

#### 3) Add a Setup Implementation (Required)

Implement a new setup class next to Redux/Zustand that extends `BaseStateSetup`.

- Folder: `src/features/state-management/`
- New file: `<library>-setup.js` (e.g., `mobx-setup.js`)
  - Implement abstract methods from `BaseStateSetup`:
    - `createStoreFiles(directories, userChoices)`
    - `createComponents(directories, userChoices)`
    - `updateEntryPoints(projectPath, directories, userChoices)`
    - Optionally `performFrameworkSpecificSetup(...)`

MobX example (high-level responsibilities):

- Store files:
  - `src/store/counterStore.(ts|js)` with an observable state and actions.
  - With Next.js App Router, consider keeping stores in `lib/` by convention.

- Components:
  - A `Counter` component that uses `observer` from `mobx-react-lite` and reads/writes `counterStore`.
  - Reuse `BaseStateSetup.generateCounterComponent(...)` by providing the appropriate imports and store logic snippets.

- Entry points:
  - Vite: no provider needed; import and use the store directly.
  - Next.js App Router: ensure components using MobX are "client" components (`'use client';`) and avoid SSR store state leakage. For Pages Router, usage is similar to Vite.

#### 4) Register the Setup (Required)

- File: `src/features/state-management/index.js`
  - Export and branch to your new setup when `userChoices.stateManagement` matches.

Example:

```js
import { MobxSetup } from "./mobx-setup.js";

export function setupStateManagement(projectPath, userChoices, framework) {
  if (userChoices.stateManagement === "redux") {
    // ...existing
  } else if (userChoices.stateManagement === "zustand") {
    // ...existing
  } else if (userChoices.stateManagement === "mobx") {
    new MobxSetup(framework).setup(projectPath, userChoices);
  }
}
```

#### 5) Example Content Templates (Recommended)

If your library needs custom component/store templates:

- Files:
  - `src/templates/engines/common-template-builder.js` — add generation helpers for store and counter component snippets.
  - `src/templates/content/features/<library>-counter-template.js` — optional helper to modify App/Home pages similarly to Redux/Zustand.

MobX snippets conceptually:

```js
// counterStore.ts
import { makeAutoObservable } from "mobx";

class CounterStore {
  value = 0;
  constructor() {
    makeAutoObservable(this);
  }
  increment = () => {
    this.value += 1;
  };
  decrement = () => {
    this.value -= 1;
  };
  incrementByAmount = (n) => {
    this.value += n;
  };
}

export const counterStore = new CounterStore();

// usage in Counter.tsx
import { observer } from "mobx-react-lite";
import { counterStore } from "../store/counterStore";

export const Counter = observer(function Counter() {
  const { value, increment, decrement, incrementByAmount } = counterStore;
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{value}</span>
      <button onClick={increment}>+</button>
      <button onClick={() => incrementByAmount(5)}>Add 5</button>
    </div>
  );
});
```

Use the existing styling-aware helpers in `BaseStateSetup` to keep Tailwind/CSS/styled-components variants consistent.

#### 6) Prompt Choice (Required)

- File: `src/prompts/steps/state-management-step.js`
  - Add a new choice with `value` matching your library key, e.g., "mobx", "jotai", "recoil".

Example:

```js
{ name: chalk.yellow("MobX") + " - Observable state library", value: "mobx" }
```

#### 7) Validation Rules (Recommended)

- File: `src/utils/core/validation.js`
  - State management values are not hard-validated today, but consider adding informational warnings in `validateChoiceCombinations(...)` for combinations like React Query + MobX.

#### 8) Package.json Placement (Already Handled)

`PackageJsonBuilder.addStateManagementDependencies(...)` adds state deps to `dependencies`. Your resolver changes are sufficient; no file edits usually required here.

#### 9) Next.js Considerations (Recommended)

- App Router components using client-side state must include `'use client';` at the top.
- Ensure store instances are created per client and not serialized from the server to avoid hydration mismatches.
- If using context/providers, create a simple `StoreProvider` client component and wrap app children in App Router `layout.tsx` as needed.

#### 10) Docs, CLI Flags, and Completion (Recommended)

- Update docs:
  - `../guides/using-react-kickstart.md`: list the new state management option.
  - `../guides/cli-flags.md`: include it in `--state` (or `--state-management`) examples.
- UI completion/summary currently does not link state docs; optionally add links if you want parity with styling/framework.

#### 11) QA Automation Matrix (Recommended)

- File: `qa-automation/test-matrix-generator.js`
  - Add your library to `CONFIG_OPTIONS.stateManagement`.

Example:

```js
stateManagement: ["redux", "zustand", "mobx", "none"],
```

Regenerate and run tests:

```bash
node qa-automation/test-matrix-generator.js
node qa-automation/test-runner.js critical 10
node qa-automation/test-runner.js standard 25
node qa-automation/test-runner.js edge 15
```

Inspect `qa-automation/reports/` for failures; fix until green to avoid false positives.

#### 12) Unit Tests (Strongly Recommended)

Write focused tests that verify:

- `DependencyResolver.getStateManagementDependencies(...)` returns correct packages.
- The new setup class writes expected files (store, components) and updates entry points.
- Next.js App/Pages Router integration behaves (client directive, provider if used).
- Example templates render correct imports and handlers for the new library.

#### 13) Minimal Checklist

- Add versions + getter in `src/builders/dependencies.js`.
- Return deps in `DependencyResolver.getStateManagementDependencies(...)`.
- Create `<library>-setup.js` extending `BaseStateSetup` with store/components and entry-point updates.
- Register in `src/features/state-management/index.js` dispatch.
- Add prompt choice in `src/prompts/steps/state-management-step.js`.
- Update docs (`../guides/using-react-kickstart.md`, `../guides/cli-flags.md`).
- Expand QA matrix and run automation; add unit tests.

With these edits, your new state library (e.g., MobX) will be selectable, install the correct dependencies, scaffold example usage, and be validated by automation.

### Adding a New State Management Library (e.g., MobX, Jotai, Recoil)

... (content identical to original doc moved from docs/adding-a-new-state-management.md) ...
