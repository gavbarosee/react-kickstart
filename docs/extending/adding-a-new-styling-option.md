### Adding a New Styling Option (e.g., Sass, Emotion, CSS Modules)

This guide explains how to integrate a new styling solution into react-kickstart so it’s selectable in prompts/CLI, installs the right dependencies, generates the right files/config, updates example component content, and appears across completion UI and QA.

Use Tailwind, styled-components, and plain CSS as reference implementations.

#### 1) Declare Dependencies and Versions (Required)

- File: `src/builders/dependencies.js`
  - Extend the `styling` export with your libraries and versions.
  - Add a getter function that returns the dependency map for your option.

Example (Sass):

```js
// Add versions
export const styling = {
  // ...existing
  sass: "^1.77.0",
};

// Add getter
export function getSassDependencies(isDevDependency = true) {
  return { sass: styling.sass };
}
```

Example (Emotion):

```js
export const styling = {
  // ...existing
  emotionReact: "^11.11.1",
  emotionStyled: "^11.11.0",
  babelPluginEmotion: "^11.11.0",
};

export function getEmotionDependencies() {
  return {
    "@emotion/react": styling.emotionReact,
    "@emotion/styled": styling.emotionStyled,
    "@emotion/babel-plugin": styling.babelPluginEmotion,
  };
}
```

#### 2) Wire Dependency Resolution (Required)

- File: `src/builders/dependency-resolver.js`
  - Update `getStylingDependencies(stylingChoice)` to handle your new option and return the correct dependency map. Consider framework-specific placement hints (devDependencies vs dependencies).

Example:

```js
getStylingDependencies(stylingChoice) {
  switch (stylingChoice) {
    case "sass":
      // For both Vite and Next.js, Sass is a dev tool dependency for builds
      return getSassDependencies(true);
    case "emotion":
      // Emotion libs are runtime deps; the babel plugin may be required for Vite
      const deps = getEmotionDependencies();
      return deps;
    // ...existing cases
  }
}
```

Also check `validateDependencies(...)` for any special validations (e.g., required peer deps).

#### 3) Include in the Prompt Flow (Required)

- File: `src/prompts/steps/styling-step.js`
  - Add a new choice in `getChoices()` with a clear label and `value` matching your styling key (e.g., "sass", "emotion").

Example:

```js
{ name: chalk.yellow("Sass") + " - SCSS/Sass preprocessor", value: "sass" }
```

- File: `src/utils/core/validation.js`
  - Add your value to the `validStyling` array and incorporate any warnings or compatibility notes.

#### 4) Implement Styling Setup (Files and Config) (Required)

- File: `src/features/styling/index.js`
  - Update `setupStyling(...)` to branch for your styling value.
  - Extend `getStylingInfo(framework, userChoices)` if your option changes file names, directories, or PostCSS usage per framework.
  - Implement a setup function that writes any required files and configs.

Examples:

- Sass:
  - Create `src/index.scss` or `styles/globals.scss` (Next.js) and import it in entry files/templates.
  - For Vite, no extra config is needed; for Next.js, global styles live in `app/globals.css|scss` or `styles/globals.css|scss` depending on router.

- Emotion:
  - No global stylesheet required; ensure Babel plugin settings for Vite and SWC flags for Next.js if needed.

If PostCSS is needed (e.g., for plugins), adopt the same pattern as Tailwind’s helpers (`createPostcssConfig(...)`).

#### 5) Update Framework Config Where Needed (Recommended)

- File: `src/builders/configuration-builder.js`
  - Vite: If your styling requires Babel plugin configuration (like styled-components or emotion), add it to the React plugin config branch in `generateViteConfig(...)`.
  - Next.js: If the styling needs SWC flags (e.g., `compiler.emotion = true`), add to `generateNextjsConfig(...)`.

Examples:

```js
// Vite + Emotion
react({
  babel: {
    plugins: [["@emotion/babel-plugin", { sourceMap: true, autoLabel: true }]],
  },
});

// Next.js + Emotion
module.exports = {
  compiler: { emotion: true },
};
```

#### 6) Package.json Dependency Placement (Recommended)

- File: `src/builders/package-json-builder.js`
  - Method: `addStylingDependencies(userChoices)` determines where styling deps land.
  - For Tailwind, dev vs prod placement is framework-dependent. For your option, decide:
    - Preprocessors (Sass/Less): devDependencies are common.
    - CSS-in-JS (Emotion): runtime dependencies (plus a dev-only Babel plugin for Vite) — mirror `styled-components` logic.

If needed, adjust placement rules by extending that method.

#### 7) Source Templates and Example Code (Recommended)

- Files:
  - `src/templates/engines/common-template-builder.js`
  - `src/templates/engines/file-template-engine.js`
  - `src/features/project-files/file-generator.js`

Add/branch in the component and entry templates so generated projects demonstrate your styling option idiomatically:

- Sass: ensure the entry imports `index.scss` and the App component uses classNames that match the generated CSS.
- Emotion: show a minimal `styled` component and/or `css` prop usage when `styling === "emotion"` similar to the `styled-components` branch.

#### 8) Completion/Docs/Editor Integration (Recommended)

- File: `src/utils/ui/completion.js`
  - Extend `getStylingInfo(styling)` to include docs URL for your styling.

- File: `src/utils/ui/summary.js`
  - Add a short description for your styling in the lookup map.

- File: `src/utils/process/editor.js`
  - Recommend editor extensions when applicable (e.g., Sass, Emotion highlighting).

#### 9) Validation and Conflicts (Recommended)

- File: `src/utils/core/validation.js`
  - Add warnings for known caveats, e.g.:
    - Using Emotion with Tailwind simultaneously (if you plan to allow multiple styling modes in the future).
    - Next.js-specific notes (global styles location, CSS Modules conventions).

#### 10) Prompt/Flag Documentation (Recommended)

- Files:
  - `../guides/using-react-kickstart.md`
  - `../guides/cli-flags.md`

Add your styling value to the valid choices list for `--styling` and include at least one CLI example showing it in use across Vite and Next.js.

#### 11) QA Automation Matrix (Recommended)

- File: `qa-automation/test-matrix-generator.js`
  - Add your styling value to `CONFIG_OPTIONS.styling`.
  - Optionally adjust `calculatePriorityScore(...)` if you want to emphasize test coverage for the new option.

Regenerate and run tests:

```bash
node qa-automation/test-matrix-generator.js
node qa-automation/test-runner.js critical 10
node qa-automation/test-runner.js standard 25
node qa-automation/test-runner.js edge 15
```

#### 12) Unit Tests (Strongly Recommended)

Write focused tests (no placeholders) that verify:

- `DependencyResolver.getStylingDependencies(...)` returns the right packages.
- `PackageJsonBuilder.addStylingDependencies(...)` places deps correctly.
- `features/styling/index.js` creates expected files and configs for the styling option.
- Vite/Next configs include required compiler/babel flags when applicable.
- Templates render expected imports/usages for the styling option.

#### 13) Example Implementations

- Sass (Vite):
  - Deps: `{ sass }` in devDependencies.
  - Files: `src/index.scss` (imported by `main.tsx/jsx`). No extra Vite config required.

- Sass (Next.js):
  - Deps: `{ sass }` in devDependencies.
  - Files: `app/globals.scss` (App Router) or `styles/globals.scss` (Pages Router). Imported by root layout or `_app`.

- Emotion (Vite):
  - Deps: `@emotion/react`, `@emotion/styled` (dependencies) + `@emotion/babel-plugin` (dev).
  - Vite: Add Emotion babel plugin to the React plugin config.

- Emotion (Next.js):
  - Deps: `@emotion/react`, `@emotion/styled` (dependencies).
  - Next.js: `compiler: { emotion: true }` in `next.config.js`.

---

### Minimal Checklist

- Add versions + getter in `src/builders/dependencies.js`.
- Handle in `DependencyResolver.getStylingDependencies(...)` (+ validations as needed).
- Add prompt choice in `src/prompts/steps/styling-step.js` and allow-list in `src/utils/core/validation.js`.
- Implement setup in `src/features/styling/index.js` (files, PostCSS, framework nuances).
- Add Vite/Next compiler changes in `src/builders/configuration-builder.js` if required.
- Ensure `package.json` placement in `src/builders/package-json-builder.js` is correct.
- Update templates to showcase the styling option idiomatically.
- Extend completion docs and summary labels.
- Expand QA matrix and run automation.
- Add unit tests to prevent regressions.

With these edits, your styling option will be selectable, install the right packages, generate proper files/configs, and be covered by QA with meaningful tests.
