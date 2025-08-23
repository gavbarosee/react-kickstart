### Project Structure Walkthrough

A quick, visual-first guide to help you understand how this CLI works and where everything lives. Skim the diagrams, then dive into folders when you need details.

#### TL;DR (for new contributors)

- Run it once locally to see it work:
  - `node bin/react-kickstart.js my-app --yes`
- Prompts collect answers → a framework generator runs → files/configs are written → deps install → dev server starts → summary prints.
- Start reading: `src/index.js` → `src/prompts/prompt-flow.js` → the specific `src/frameworks/*-generator.js`.
- Configs/scripts come from `src/config/*` (builders/resolver). Files come from `src/lib/*` (file/content/styling/routing/testing).
- When stuck, search for the keyword you picked in prompts (e.g., "vite"), then follow the calls.

#### High-level flow

Rendering note: This guide uses low-tech ASCII diagrams that render everywhere.

#### Low-tech one-page overview (pasteable)

```text
┌──────────────────────┐      ┌───────────────────────┐      ┌──────────────────────────┐
│      Developer       │  ==> │  bin/react-kickstart  │  ==> │       src/index.js        │
│   (runs the CLI)     │      │     (CLI entry)       │      │ (createApp Orchestrator) │
└─────────┬────────────┘      └───────────┬───────────┘      └──────────────┬───────────┘
          │                                │                                 │
          │                                │                                 ▼
          │                                │                    ┌─────────────────────────┐
          │                                │                    │  prompts/prompt-flow.js │
          │                                │                    │  + steps/* (choices)    │
          │                                │                    └───────────┬────────────┘
          │                                │                                │ answers
          │                                │                                ▼
          │                                │
          │                                │
          │                                │                 ┌───────────────────────────┐
          │                                │                 │ generators/base-generator │
          │                                │                 │ + concrete generators      │
          │                                │                 │   (Vite, Next.js, etc.)   │
          │                                │                 └─────┬───────┬───────┬─────┘
          │                                │                       │       │       │
          │                                │                       │       │       │
          │                                │     configs           │       │       │ files/features
          │                                │     (build/test/ts)   │       │       │ (src/public)
          │                                │                       │       │       │
          │                                │                       ▼       ▼       ▼
          │                                │               ┌────────────────┐  ┌─────────────────┐
          │                                │               │ src/config/    │  │ src/lib/        │
          │                                │               │ - configuration │  │ - file-generation│
          │                                │               │ - package-json  │  │ - content-gen    │
          │                                │               │ - dep-resolver  │  │ - styling        │
          │                                │               └────────────────┘  │ - routing        │
          │                                │                                   │ - testing/ts     │
          │                                │                                   └─────────┬───────┘
          │                                │                                             │
          │                                │                                 ┌───────────▼───────────┐
          │                                │                                 │      src/features     │
          │                                │                                 │ (api, redux, zustand) │
          │                                │                                 └──────────────────────┘
          │                                │
          │                                ▼
          │                    ┌─────────────────────────────────────┐
          │                    │ utils/process/package-managers.js   │
          │                    │  → install deps (npm/yarn)          │
          │                    └───────────────────┬─────────────────┘
          │                                        │
          │                                        ▼
          │                          ┌─────────────────────────────────┐
          │                          │ utils/process/start-project.js  │
          │                          │  → run dev server, open browser │
          │                          └─────────────────┬──────────────┘
          │                                            │
          ▼                                            ▼
┌────────────────────────┐                  ┌──────────────────────────────┐
│ utils/ui/completion.js │                  │  qa-automation/ (optional)   │
│ → final summary/tips   │                  │  - test-matrix-generator     │
└────────────────────────┘                  │  - test-runner, reports      │
                                            └──────────────────────────────┘
```

#### Key concepts

- **Template Method**: `BaseGenerator` defines the sequence; each framework generator fills in its steps.
- **Generator selection**: A switch in `src/generators/index.js` maps the selected framework to its generator.
- **Builders**: Config and `package.json` are produced by builder objects for clarity and consistency.

---

## Root

- `package.json`: CLI metadata, deps, scripts.
- `eslint.config.js`: lint rules.
- `vitest.config.js`: root test config for this repo.
- `bin/react-kickstart.js`: Node CLI entry; parses args and calls `src/index.js`.

---

## src/

### src/index.js

Orchestrates the full run: prompts → generation → install → optional start → summary.

### src/prompts/

- `prompt-flow.js`: Runs the multi-step prompt engine.
- `ui/prompt-renderer.js`: Fancy CLI output while prompting.
- `navigation/step-navigator.js`: Tracks forward/back navigation.
- `steps/*`: Discrete choices (framework, language, styling, state, api, testing, git, editor, etc.).

```text
Flow (simplified):
bin/react-kickstart.js -> src/index.js(createApp)
  -> prompts/prompt-flow.run() => answers
  -> frameworks/*-generator.generate(...)
  -> configuration-builder (package.json + configs)
  -> create files/features/styling/routing
  -> install deps -> (optional) start dev -> summary
```

### src/frameworks/

- `vite/` and `nextjs/`: Each has `*-generator.js` plus any framework-specific helpers.

Framework selection and generators: selection is handled in `src/generators/index.js` and maps the chosen framework to a concrete generator that extends `BaseGenerator`.

### src/generators/

- `base-generator.js`: Template Method sequencing for generation.
- `index.js`: Chooses the generator (and prints structure/config overviews).

### src/config/

- `configuration-builder.js`: Writes framework + feature configs (vite.config, next.config, tsconfig, testing, tailwind/postcss).
- `package-json-builder.js`: Builds scripts/deps via `DependencyResolver`.
- `dependency-resolver.js`: Central logic for which deps go where (dependencies vs devDependencies) per framework/feature.
- `dependencies.js`: Version catalog and helper getters.
- `index.js`: Factory exports for builders/resolvers.

### src/lib/

- `file-generation/`: Creates directories and core files (HTML, entry, App component).
- `content-generation/`: Strategy objects to generate entry/app content for each framework/router.
- `routing/`: React Router setup for Vite.
- `styling/`: CSS, Tailwind, styled-components setup with framework-specific nuances.
- `state-management/`: Redux, Zustand scaffolding.
- `api-management/`: Axios/React Query/fetch wiring.
- `testing/`: Testing setup helpers.
- `linting.js`, `typescript.js`: Linting and TS support.

### src/features/

Feature packers that call into `lib/` helpers according to the selected framework.

- `api/`: API client options.
- `redux/`, `zustand/`: State stores and examples.

### src/errors/

Centralized error handling and user-facing recovery guidance.

- `error-handler.js`: Orchestrates handling and context.
- `user-error-reporter.js`: Consistent, actionable messages.
- `cleanup-manager.js`: Safe cleanup of partially generated projects.

### src/templates/

Template engines and reusable content builders for UI and files.

- `template-engine.js`, `file-template-engine.js`, `ui-renderer.js`, `common-template-builder.js`.

### src/utils/

Organized by domain for clarity.

- `core/`: project analysis, filesystem, directory management, data formatting.
- `process/`: package managers, start dev server, git, editor open.
- `ui/`: logging, summary, completion output.
- `index.js`: Aggregates utilities into `CORE_UTILS`, `PROCESS_UTILS`, `UI_UTILS`.

---

## QA & Examples

### qa-automation/

Automation to validate real-world combinations: critical, standard, edge.

- `test-matrix-generator.js`: Generates exhaustive combinations (framework, typescript, styling, state, api, testing, package manager, etc.).
- `test-runner.js`: Executes generation + install + build + validations.
- `feature-validator.js`: Verifies structure, deps, scripts, build outputs.
- `reports/`: JSON reports per run.

Run examples:

```bash
node qa-automation/test-matrix-generator.js
node qa-automation/test-runner.js critical 10
node qa-automation/test-runner.js standard 25
node qa-automation/test-runner.js edge 15
```

---

## Where to add or extend things quickly

- Add a framework: `../extending/adding-a-new-framework.md` (full checklist).
- Add a feature: `src/features/*` + helpers in `src/lib/*` and `src/config/*`.
- Change prompts: `src/prompts/steps/*` and `src/prompts/prompt-flow.js`.
- Tweak build scripts/deps: `src/config/package-json-builder.js` and `src/config/dependencies.js`.
- Change dev server defaults/summary: `src/utils/ui/completion.js` and `src/utils/process/start-project.js`.

---

## Mental model (short)

Prompts → Generator (by framework) → Config/Files/Features → Install → Start → Summary

---

## Common tasks (1-minute pointers)

- Add a framework: See `../extending/adding-a-new-framework.md`. Then add it to prompts in `src/prompts/steps/framework-step.js` and QA matrix `qa-automation/test-matrix-generator.js`.
- Add a feature (e.g., another state manager): Add under `src/features/`, wire deps in `src/config/dependency-resolver.js`, add content in `src/lib/*`, add prompt in `src/prompts/steps/*`.
- Change default scripts: `src/config/package-json-builder.js` → `getFrameworkScripts()`.
- Change build output dir: `src/config/package-json-builder.js` → `getBuildDirectory()`.
- Update dependency versions: `src/config/dependencies.js`.

---

## If you revisit after a while

- Re-run a sample: `node bin/react-kickstart.js demo --yes` to refresh context.
- Skim this file’s ASCII overview and the "Where to add or extend things" section.
- Check supported frameworks: `src/prompts/steps/framework-step.js` and cases in `src/generators/index.js`.
- Review config pipeline: `src/config/configuration-builder.js` and `src/config/package-json-builder.js` (scripts/deps), `src/config/dependency-resolver.js`.
- Validate with QA: regenerate matrix and run critical/standard/edge suites:
  - `node qa-automation/test-matrix-generator.js`
  - `node qa-automation/test-runner.js critical 10`
  - `node qa-automation/test-runner.js standard 25`
  - `node qa-automation/test-runner.js edge 15`

---

## End-to-end example: Vite + Tailwind + Redux (TypeScript)

1. Run the CLI: `node bin/react-kickstart.js my-app --yes`
   - Choose framework: Vite
   - Language: TypeScript
   - Styling: Tailwind
   - State: Redux
   - Testing: Vitest (recommended for Vite)

2. What the code does:
   - `prompts/prompt-flow.js` collects your choices.
   - generator selection returns `ViteGenerator`.
   - `generators/base-generator.js` runs the template sequence:
     - `config/configuration-builder.js` writes `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `vitest.config.ts`.
     - `lib/file-generation/index.js` creates `index.html`, `src/main.tsx`, `src/App.tsx`.
     - `lib/styling/index.js` writes `src/index.css` with Tailwind directives.
     - `features/redux` populates `src/store/*` and example usage.
   - `utils/process/package-managers.js` installs deps.
   - `utils/process/start-project.js` starts dev server at `http://localhost:5173`.

3. Verify:
   - Build: `npm run build` → output in `dist/`.
   - Tests: `npm run test` (Vitest) → `src/test/setup.ts` used.
   - Redux: ensure `src/store/store.ts` and example `Counter` compiled.

---

## Debug tips

- Add logs: `UI_UTILS.log()` in `src/index.js`, `BaseGenerator.generate()`, or any step.
- Narrow scope: hardcode `userChoices` in `src/index.js` to bypass prompts during local debugging.
- Validate deps: check `package.json` after generation; compare to `DependencyResolver.getAllDependencies()` output.
- Config issues: re-open `configuration-builder.js` for the specific framework branch; confirm files written.
- Start failures: ensure port free; try `npm run dev` manually; watch stderr from `start-project.js`.
- Generator errors: temporarily `try/catch` around suspect calls in the concrete `*-generator.js` and print error stack.

---

## Mini-FAQ

- Where are scripts set? → `src/config/package-json-builder.js#getFrameworkScripts()`.
- Where’s the build output directory defined? → `getBuildDirectory()` in the same file.
- How do I add a new prompt? → Create a step in `src/prompts/steps/`, wire in `src/prompts/prompt-flow.js`, and handle navigation from the previous step.
- Generation failed after install—what next? → Re-run with `--yes`, check network/proxy, then review `installDependenciesWithRetry` in `utils/process/package-managers.js` logs.
- How do I add a new framework? → `../extending/adding-a-new-framework.md` and ensure prompt choice + QA matrix update.

---

## Glossary

- Generator: A class that creates a project for a specific framework, extending `BaseGenerator`.
- Generator selection: A switch maps framework name (e.g., `vite`) to its generator class in `src/generators/index.js`.
- ConfigurationBuilder: Writes config files (vite/next/ts/testing/tailwind/postcss).
- PackageJsonBuilder: Builds `package.json` scripts and dependencies via the resolver.
- DependencyResolver: Decides which packages go to `dependencies` vs `devDependencies` per framework/feature.
- Content Generator: Produces code for entry/app files tailored to a framework/router.

That’s it—use this as your map. Open files as needed, guided by the diagrams and the “Where to add or extend things” section.
