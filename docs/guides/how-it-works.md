### React Kickstart in a Nutshell

A fast, opinionated CLI to scaffold React apps with your preferred framework and stack—then install, build, and optionally start the dev server for you.

#### What it does

- Prompts you for framework and tech choices.
- Generates a ready-to-run project (files, configs, scripts).
- Installs dependencies and can auto-start the dev server.
- Prints a clear summary with next steps and docs links.

#### Key features

- Frameworks: Vite, Next.js (extensible via a generator switch in `src/generators/index.js`).
- Language: TypeScript or JavaScript.
- Styling: Tailwind, styled-components, or CSS.
- Routing: React Router (for Vite), Next.js routing (app/pages) when Next.js is selected.
- State: Redux Toolkit or Zustand.
- API options: Axios, React Query integrations, or Fetch-only.
- Testing: Vitest or Jest for both frameworks (recommended: Vitest for Vite, Jest for Next.js), with example tests.
  - Note: When using Jest with Vite, a minimal `babel.config.json` is generated and `babel-jest` + Babel presets are added to enable JSX/TS transforms.
- Linting, Git init, editor open, and deployment scripts support.
- QA automation to validate numerous combinations (critical, standard, edge).

#### Quick start

```bash
node bin/react-kickstart.js my-app --yes
# Answer prompts (or pass flags) and let it scaffold + install
```

Then:

```bash
cd my-app
npm run dev   # yarn dev also works
```

#### How it works (flow)

```text
bin/react-kickstart.js -> src/index.js(createApp)
  -> prompts/prompt-flow.run() => answers
  -> select concrete generator -> *-generator.generate(...)
  -> config/configuration-builder (writes configs)
  -> lib/file-generation + styling/routing/state/api/testing
  -> install deps -> (optional) start dev -> print summary
```

#### Supported choices (at a glance)

- Framework: `vite`, `nextjs`
- Language: `typescript` true/false
- Styling: `tailwind`, `styled-components`, `css`
- Routing (Vite): `react-router` or `none`
- Routing (Next.js): `app` or `pages`
- State: `redux`, `zustand`, `none`
- API: `axios-react-query`, `axios-only`, `fetch-react-query`, `fetch-only`, `none`
- Testing: `vitest`, `jest`, `none`
- Package manager: `npm`, `yarn`
- Linting: true/false; Git init: true/false; Open editor: Cursor or VS Code

#### Extending (adding a framework)

See `../extending/adding-a-new-framework.md` for the complete checklist. In short:

- Implement a `*-generator.js` that extends `BaseGenerator`.
- Add a case in `src/generators/index.js`.
- Add it to `src/prompts/steps/framework-step.js` choices.
- Wire dependencies/scripts in `src/config/*` and content in `src/lib/*`.
- Update QA matrix to include it.

#### Quality and testing

- Run the matrix generator and test runner to validate changes across combinations:

```bash
node qa-automation/test-matrix-generator.js
node qa-automation/test-runner.js critical 10
node qa-automation/test-runner.js standard 25
node qa-automation/test-runner.js edge 15
```

#### Where to read next

- Project structure tour: `./project-structure-walkthrough.md`
- Adding a framework: `../extending/adding-a-new-framework.md`
