### Adding a New Framework (e.g., Rsbuild, Parcel, esbuild)

This guide explains all extension points to fully integrate another framework into react-kickstart. Use Vite and Next.js as reference implementations.

#### 1) Create a Framework Generator

- Location: `src/frameworks/<your-framework>/`
- Add: `your-framework-generator.js` that extends `BaseGenerator` and implements:
  - `createPackageConfiguration(projectPath, projectName, userChoices)`
  - `createFrameworkConfiguration(projectPath, userChoices)`
  - `createProjectFiles(projectPath, projectName, userChoices)`
  - `createFrameworkSpecificFiles(projectPath, userChoices)`

References:

- `src/frameworks/vite/vite-generator.js`
- `src/frameworks/nextjs/nextjs-generator.js`

If your framework needs an HTML entry (like Vite), call `createHtmlFile(...)` and `createSourceFiles(...)`. If it manages routing internally (like Next.js), skip HTML and rely on `createSourceFiles(...)` with framework-specific variations.

#### 2) Register the Framework in the Registry

- File: `src/frameworks/index.js`
- Update `registerDefaultGenerators()` or call `register("<name>", YourFrameworkGenerator)` so the factory can instantiate it:
  - `this.register("rsbuild", RsbuildGenerator)`
  - `this.register("parcel", ParcelGenerator)`

Also export a small `index.js` in your framework folder to expose metadata (optional but recommended):

- Example: `src/frameworks/vite/index.js` and `src/frameworks/nextjs/index.js`

#### 3) Make It Selectable in the Prompt Flow (Required)

All supported frameworks MUST appear as a selectable option in the prompts:

- File: `src/prompts/steps/framework-step.js`
- Add a new choice in `getChoices()` with a human-friendly label and `value` matching your framework key, e.g. `"rsbuild"`, `"parcel"`.

If your framework has special sub-options (like Next.js app/pages router), add a new step and wire it in `src/prompts/prompt-flow.js` and `FrameworkStep.getNextStep(...)`.

#### 4) Wire the Generator at Runtime

If the project currently switches by `switch (userChoices.framework)`:

- File: `src/generators/index.js`
- Either:
  - Replace the `switch` with the `FrameworkRegistry` factory to decouple from hard-coded cases; or
  - Add cases for your framework and instantiate your generator.

Reference: `src/frameworks/index.js` already implements a `FrameworkRegistry`. Prefer using it for new frameworks.

#### 5) Add Framework Dependencies and Scripts

- Files:
  - `src/config/dependencies.js` — extend `export const frameworks = { ... }` with your framework’s packages and versions.
  - `src/config/dependency-resolver.js` — update `getFrameworkDependencies()` to return your deps keyed by framework name.
  - `src/config/package-json-builder.js`
    - `getFrameworkScripts()` — add `dev/build/start/preview` scripts as applicable.
    - `getBuildDirectory()` — return your framework’s default build output directory.
    - The builder already delegates to `DependencyResolver` for dependency placement; adjust if your framework needs special handling (e.g., devDependencies vs dependencies).

Notes:

- Some frameworks (e.g., Next.js) place TypeScript deps in `dependencies` instead of `devDependencies`. See `getTypeScriptDependencies()` and how `PackageJsonBuilder` uses it.

#### 6) Generate Framework Config Files

- File: `src/config/configuration-builder.js`
  - Add a case to `generateFrameworkConfig(...)` for your framework and write its config file(s).
  - If you need TypeScript/Testing/Tailwind/PostCSS configs, reuse existing helpers (`generateTypeScriptConfig`, `generateTestingConfig`, etc.) or create variants when necessary.

If your framework needs JSX/React-specific transforms or Babel/SWC config, generate the appropriate files alongside the main config.

#### 7) Create Source and HTML Files

- File: `src/lib/file-generation/index.js`
  - `createSourceFiles(...)` and `createHtmlFile(...)` already accept a `framework` argument.
  - If your framework needs a different entry filename or directory layout, add a branch where needed (e.g., compute entry filename for `createEntryPointFile`).

If your framework has its own router/pages system, mirror the Next.js logic by skipping HTML and adjusting source paths.

#### 8) Content Generators for App/Entry Files

- Files in `src/lib/content-generation/`
  - If entry/app file contents differ (import paths, root rendering, strict mode), add a new generator class and branch in `createContentGenerator(framework, routingType)` in `src/lib/content-generation/index.js`.
  - Use `ViteContentGenerator` and `Nextjs*RouterGenerator` as references.

#### 9) Routing and Styling Hooks

- Routing hooks: `src/lib/routing/index.js` and `src/lib/routing/react-router/`
  - Add a branch if your framework needs different router setup (e.g., separate template or mount point).
- Styling hooks: `src/lib/styling/index.js`
  - `getStylingInfo(framework, userChoices)` may need a branch for CSS file locations/names or PostCSS/Tailwind config differences.

#### 10) Directory Structure and Project Info

- File: `src/utils/core/directory-management.js`
  - Extend `DIRECTORY_STRUCTURES` for your framework to inform `createFrameworkDirectories(...)`.
- File: `src/utils/core/project-analysis.js`
  - Update `getProjectStructure(framework)` and `getFrameworkInfo(framework)` to show correct structure and docs/ports in the UI.

#### 11) Completion/UX Details

- File: `src/utils/ui/completion.js`
  - Add your framework to `getFrameworkDocumentation(...)` (docs URL, default port, build dir) to improve the completion summary and autostart behavior.
  - If start commands differ, ensure `package-json-builder.js` scripts and these values are consistent.

#### 12) Testing and QA

- Reuse the existing testing setup via `ConfigurationBuilder.generateTestingConfig(...)` where possible.
- If your framework prefers/needs a specific test runner (e.g., Jest vs Vitest), ensure `dependencies.js` and `package-json-builder.js` cover it.
- Update or add example templates if rendering entry points changes.

QA Automation (must-do):

- Update QA matrix generator to include your framework values:
  - File: `qa-automation/test-matrix-generator.js`
    - Add your framework to `CONFIG_OPTIONS.framework`.
    - If it has conditional options, extend `CONDITIONAL_OPTIONS` and combination logic accordingly.
- Regenerate matrices and run tests:
  - `node qa-automation/test-matrix-generator.js`
  - Critical: `node qa-automation/test-runner.js critical 10`
  - Standard: `node qa-automation/test-runner.js standard 25`
  - Edge: `node qa-automation/test-runner.js edge 15`
- Validate reports under `qa-automation/reports/` for failures and fix until green.
- Ensure no false positives: builds must succeed, scripts must run, dependencies resolved, and generated files validated.

#### 13) Update the Top-Level README (Optional)

- Add a link to this doc and list supported frameworks.

---

### Minimal Checklist

- Generator: `src/frameworks/<name>/<name>-generator.js`
- Registry: `src/frameworks/index.js`
- Prompt choice (optional): `src/prompts/steps/framework-step.js`
- Runtime switch or registry usage: `src/generators/index.js`
- Dependencies and scripts: `src/config/dependencies.js`, `src/config/dependency-resolver.js`, `src/config/package-json-builder.js`
- Config writer: `src/config/configuration-builder.js`
- Content/HTML: `src/lib/file-generation/index.js`, `src/lib/content-generation/*`
- Routing/Styling: `src/lib/routing/*`, `src/lib/styling/index.js`
- Directory structure and info: `src/utils/core/directory-management.js`, `src/utils/core/project-analysis.js`
- Completion docs/ports: `src/utils/ui/completion.js`

With these edits, your framework will be fully selectable (if added to prompts), generate correct files, install the right dependencies, and run with accurate dev/build commands.
