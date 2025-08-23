### Adding a new testing preset

Add alternatives or enhancements to the default Vitest setup.

## Where to plug in

- Testing wiring:
  - `src/lib/testing/testing-setup.js`
  - `src/lib/testing/index.js`
- Templates:
  - `src/templates/testing/*` (example component tests in JS/TS)

## Steps

1. Add a preset handler

Implement a function in `testing-setup.js` that adds dependencies, scripts, and config files.

2. Export and expose

Expose the new preset from `src/lib/testing/index.js` and ensure the feature selection (prompts) includes it.

3. Provide templates

Add example tests/config stubs under `src/templates/testing/` if needed.

## Verification

- Run `npm test` in a generated project to confirm commands work.
- Use QA automation with configs that select your preset.

## Full example: Add a Playwright component-testing preset for Vite

Goal: Offer `playwright-ct` as a testing choice that installs Playwright and scaffolds a basic CT setup for Vite.

### 1) Expose the option in the prompt

Update `src/prompts/steps/testing-step.js` `getChoices()` for Vite:

```js
choices.push({
  name: chalk.magenta("Playwright (component testing)"),
  value: "playwright-ct",
  description: "Fast browser-level component tests",
});
```

### 2) Add preset handler

Create `src/lib/testing/playwright-ct-setup.js`:

```js
import fs from "fs-extra";
import path from "path";

export async function applyPlaywrightCT(projectPath, userChoices) {
  // 1) Add devDependencies and scripts to package.json
  const pkgPath = path.join(projectPath, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.devDependencies = {
    ...(pkg.devDependencies || {}),
    "@playwright/test": "^1.47.0",
    "@playwright/experimental-ct-react": "^1.47.0",
  };
  pkg.scripts = {
    ...(pkg.scripts || {}),
    "test:ct": "playwright test -c playwright-ct.config.ts",
    ct: "playwright ct",
  };
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

  // 2) Write a basic CT config
  const config = `import { defineConfig } from '@playwright/experimental-ct-react';
export default defineConfig({
  testDir: './src/__ct__',
  use: { ctViteConfig: {} },
});`;
  await fs.writeFile(path.join(projectPath, "playwright-ct.config.ts"), config);

  // 3) Example component and test
  const ext = userChoices.typescript ? "tsx" : "jsx";
  await fs.ensureDir(path.join(projectPath, "src", "__ct__"));
  await fs.writeFile(
    path.join(projectPath, "src", `Button.${ext}`),
    `export default function Button({ children }){return <button>{children}</button>;}`,
  );
  await fs.writeFile(
    path.join(
      projectPath,
      "src",
      "__ct__",
      `Button.spec.${userChoices.typescript ? "ts" : "js"}`,
    ),
    `import { test, expect } from '@playwright/experimental-ct-react';
import Button from '../Button';

test('renders', async ({ mount }) => {
  const cmp = await mount(<Button>Click</Button>);
  await expect(cmp).toContainText('Click');
});`,
  );
}
```

### 3) Export and invoke during generation

Update `src/lib/testing/index.js`:

```js
export * from "./testing-setup.js";
export { applyPlaywrightCT } from "./playwright-ct-setup.js";
```

Where you orchestrate testing setup during project generation, call:

```js
import { applyPlaywrightCT } from "../lib/testing/index.js";

if (answers.testing === "playwright-ct") {
  await applyPlaywrightCT(projectPath, answers);
}
```

### 4) Verify

Generate a Vite app selecting Playwright CT, run `npx playwright install`, then `npm run test:ct`.
