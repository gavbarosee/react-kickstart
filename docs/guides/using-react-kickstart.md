## Using react-kickstart

This guide shows how to install, run, and customize `react-kickstart` to generate React apps using Vite or Next.js. It covers interactive and non‑interactive (flags-only) workflows, what gets generated, and troubleshooting.

### Prerequisites

- Node.js 16 or newer
- macOS, Linux, or Windows with a POSIX shell
- Git (optional but recommended)

### Install or run

You can run the CLI directly from the repo or install it globally.

#### From this repository

```bash
node bin/react-kickstart.js <project-name>

# or via package script while developing this repo
npm start -- <project-name>
```

#### Global install (optional)

```bash
npm i -g react-kickstart
react-kickstart <project-name>
```

If using the global binary, ensure your PATH includes your npm global bin directory.

## Quick start

### Interactive mode (guided prompts)

Run without flags to answer prompts:

```bash
node bin/react-kickstart.js my-app
```

You will choose:

- **framework**: Vite or Next.js
- **language**: JavaScript or TypeScript
- **styling**: Tailwind, styled-components, or plain CSS
- **state management**: Redux Toolkit, Zustand, or none
- **API layer**: axios/react-query, axios-only, fetch/react-query, fetch-only, or none
- **routing**: React Router (Vite) or Next.js router mode (app/pages)
- **testing**: Vitest, Jest, or none
- **package manager**: npm or yarn

### Flags-only mode (no prompts)

Pass `--yes` plus flags to skip prompts completely:

```bash
node bin/react-kickstart.js my-app \
  --yes \
  --framework vite \
  --typescript \
  --styling tailwind \
  --routing react-router \
  --state redux \
  --api axios-react-query \
  --testing vitest \
  --package-manager npm \
  --no-autostart
```

See detailed flags and more recipes in `./cli-flags.md`.

## What the CLI does

The generator runs three main steps:

1. Generate project files and templates for your selected stack
2. Install dependencies (unless `--skip-install`)
3. Finalize setup (Git init, optional editor open) and optionally start the dev server

If you pass `--no-autostart`, the dev server will not start automatically.

## Framework choices

### Vite

- Optional React Router via `--routing react-router`
- Styling: Tailwind, styled-components, or CSS
- State: Redux Toolkit or Zustand
- API: axios/react-query, axios-only, fetch/react-query, fetch-only, or none
- Testing: Vitest or Jest

Start the app:

```bash
cd my-app
npm run dev
```

### Next.js

- Router mode: `--next-routing app` (default) or `--next-routing pages`
- Styling: Tailwind, styled-components, or CSS
- State and API options are scaffolded where applicable
- Testing: Vitest or Jest

Start the app:

```bash
cd my-app
npm run dev
```

## Project structure and generated content

For a deeper breakdown of files and conventions, see `./project-structure-walkthrough.md` and `./how-it-works.md`.

Highlights you can expect:

- A clean React project for Vite or Next.js
- Optional state management boilerplate (Redux Toolkit or Zustand) with an example counter
- Optional API setup (axios/fetch with or without react-query)
- Optional routing (React Router for Vite or Next.js app/pages router)
- Optional testing setup (Vitest or Jest) with example tests
- ESLint and Prettier (unless `--no-linting`)
- Git repository initialized (unless `--no-git`)

## Common recipes

Minimal Vite (JS + CSS, no extras):

```bash
node bin/react-kickstart.js app --yes --framework vite --no-typescript --styling css --routing none --state none --api none --testing none
```

Next.js + TS + styled-components + app router + Jest:

```bash
node bin/react-kickstart.js app --yes --framework nextjs --typescript --styling styled-components --next-routing app --testing jest
```

Vite + TS + React Router + Redux Toolkit + Vitest:

```bash
node bin/react-kickstart.js app \
  --yes \
  --framework vite \
  --typescript \
  --styling css \
  --routing react-router \
  --state redux \
  --api none \
  --testing vitest
```

More examples and nuances are listed in `./cli-flags.md`.

## CI and QA

Use `--skip-install` and `--no-autostart` in CI to generate structure only.

The repository includes a QA automation harness; see `../qa/qa-automation-overview.md` for how to validate multiple configurations.

## Troubleshooting

- "The directory <path> is not empty": choose an empty folder or a new name.
- Invalid project name: ensure it is a valid npm package name.
- Dependency installation failed: rerun inside the project with your package manager; check network and registry access.
- Port already in use: stop the running process or change the dev server port.
- Unknown/incorrect flag: see `./cli-flags.md` for exact names and defaults.

## Extending the generator

To add new frameworks or options, see `../extending/adding-a-new-framework.md`. For internals, explore:

- `src/generators/frameworks` and `src/features/*` for stack-specific logic
- `src/prompts` for interactive flows
- `src/generators` for file/content generation

## Next steps

1. Generate your app with the desired options
2. Start the dev server (`npm run dev`)
3. Explore the generated structure (`./project-structure-walkthrough.md`)
4. Customize state, API, styling, and tests to your needs
