### Adding a New Framework (e.g., Rsbuild, Parcel, esbuild)

This guide explains all extension points to fully integrate another framework into react-kickstart. Use Vite and Next.js as reference implementations.

#### 1) Create a Framework Generator

- Location: `src/generators/frameworks/<your-framework>/`
- Add: `your-framework-generator.js` that extends `BaseGenerator` and implements:
  - `createPackageConfiguration(projectPath, projectName, userChoices)`
  - `createFrameworkConfiguration(projectPath, userChoices)`
  - `createProjectFiles(projectPath, projectName, userChoices)`
  - `createFrameworkSpecificFiles(projectPath, userChoices)`

References:

- `src/generators/frameworks/vite/vite-generator.js`
- `src/generators/frameworks/nextjs/nextjs-generator.js`

If your framework needs an HTML entry (like Vite), call `createHtmlFile(...)` and `createSourceFiles(...)`. If it manages routing internally (like Next.js), skip HTML and rely on `createSourceFiles(...)` with framework-specific variations.

#### 2) Register the Framework for Selection

Framework selection is handled via a switch in `src/generators/index.js`. Add a case for your new framework and instantiate your generator there.

#### 3) Make It Selectable in the Prompt Flow (Required)

All supported frameworks MUST appear as a selectable option in the prompts:

- File: `src/prompts/steps/framework-step.js`
- Add a new choice in `getChoices()` with a human-friendly label and `value` matching your framework key, e.g. `"rsbuild"`, `"parcel"`.

If your framework has special sub-options (like Next.js app/pages router), add a new step and wire it in `src/prompts/prompt-flow.js` and `FrameworkStep.getNextStep(...)`.

#### 4) Wire the Generator at Runtime

Add a case for your framework in `src/generators/index.js` (where Vite/Next.js are handled) to construct your generator and call `generate(...)`.

#### 5) Add Framework Dependencies and Scripts

- Files:
  - `src/builders/dependencies.js` — extend `export const frameworks = { ... }` with your framework's packages and versions.
  - `src/builders/dependency-resolver.js` — update `getFrameworkDependencies()` to return your deps keyed by framework name.
  - `src/builders/package-json-builder.js`
    - `getFrameworkScripts()` — add `dev/build/start/preview` scripts as applicable.
    - `getBuildDirectory()` — return your framework’s default build output directory.
    - The builder already delegates to `DependencyResolver` for dependency placement; adjust if your framework needs special handling (e.g., devDependencies vs dependencies).

Notes:

- Some frameworks (e.g., Next.js) place TypeScript deps in `dependencies` instead of `devDependencies`. See `getTypeScriptDependencies()` and how `PackageJsonBuilder` uses it.

#### 6) Generate Framework Config Files

- File: `src/builders/configuration-builder.js`
  - Add a case to `generateFrameworkConfig(...)` for your framework and write its config file(s).
  - If you need TypeScript/Testing/Tailwind/PostCSS configs, reuse existing helpers (`generateTypeScriptConfig`, `generateTestingConfig`, etc.) or create variants when necessary.

If your framework needs JSX/React-specific transforms or Babel/SWC config, generate the appropriate files alongside the main config.

#### 7) Create Source and HTML Files

- File: `src/features/source-files/file-generator.js`
  - `createSourceFiles(...)` and `createHtmlFile(...)` already accept a `framework` argument.
  - If your framework needs a different entry filename or directory layout, add a branch where needed (e.g., compute entry filename for `createEntryPointFile`).

If your framework has its own router/pages system, mirror the Next.js logic by skipping HTML and adjusting source paths.

#### 8) Content Generators for App/Entry Files

- Files in `src/templates/frameworks/`
  - If entry/app file contents differ (import paths, root rendering, strict mode), add a new generator class and branch in `createContentGenerator(framework, routingType)` in `src/templates/frameworks/index.js`.
  - Use `ViteContentGenerator` and `Nextjs*RouterGenerator` as references.

#### 9) Routing and Styling Hooks

- Routing hooks: `src/features/routing/index.js` and `src/features/routing/react-router/`
  - Add a branch if your framework needs different router setup (e.g., separate template or mount point).
- Styling hooks: `src/features/styling/index.js`
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

- Generator: `src/generators/frameworks/<name>/<name>-generator.js`
- Prompt choice (optional): `src/prompts/steps/framework-step.js`
- Runtime switch: `src/generators/index.js`
- Dependencies and scripts: `src/builders/dependencies.js`, `src/builders/dependency-resolver.js`, `src/builders/package-json-builder.js`
- Config writer: `src/builders/configuration-builder.js`
- Content/HTML: `src/features/project-files/file-generator.js`, `src/templates/frameworks/*`
- Routing/Styling: `src/features/routing/*`, `src/features/styling/index.js`
- Directory structure and info: `src/utils/core/directory-management.js`, `src/utils/core/project-analysis.js`
- Completion docs/ports: `src/utils/ui/project-summary.js`

With these edits, your framework will be fully selectable (if added to prompts), generate correct files, install the right dependencies, and run with accurate dev/build commands.
