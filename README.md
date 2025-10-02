# React Kickstart

CLI that generates React apps with your stack already configured. Vite or Next.js, TypeScript, Tailwind, Redux, tests—all working.

```bash
npx @gavbarosee/react-kickstart my-app
```

[![NPM Version](https://img.shields.io/npm/v/@gavbarosee/react-kickstart)](https://www.npmjs.com/package/@gavbarosee/react-kickstart)
[![CI](https://img.shields.io/github/actions/workflow/status/gavbarosee/react-kickstart/ci.yml?label=CI)](https://github.com/gavbarosee/react-kickstart/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Why

`create-vite` and `create-next-app` scaffold the framework. This scaffolds your stack.

You get Redux wired up with a counter example, routing configured, tests that pass, deployment configs ready. Saves you the first few hours of every new project where you're just installing and configuring the same tools again.

## What gets generated

```bash
my-app/
├── src/
│   ├── store/          # Redux Toolkit with counter example
│   ├── components/     # Layout and routing components
│   ├── pages/          # Route pages (if using routing)
│   └── App.tsx         # Everything wired up
├── vitest.config.ts    # Tests configured
├── tailwind.config.js  # Tailwind ready
├── .eslintrc.json      # Linting configured
└── package.json        # Scripts that work

✓ npm run dev      # Starts immediately
✓ npm run build    # Builds successfully
✓ npm test         # Tests pass
✓ npm run lint     # No errors
```

## Usage

Interactive mode:

```bash
npx @gavbarosee/react-kickstart my-app
```

Skip prompts with flags:

```bash
npx @gavbarosee/react-kickstart my-app \
  --yes \
  --framework vite \
  --typescript \
  --styling tailwind \
  --state redux \
  --testing vitest
```

The tool will generate your project, install dependencies, configure everything, and start the dev server.

## Options

**Frameworks:** Vite or Next.js (app/pages router)

**Language:** TypeScript or JavaScript

**Styling:** Tailwind, styled-components, or CSS

**State:** Redux Toolkit, Zustand, or none

**API:** Axios + React Query, Fetch + React Query, basic Axios/Fetch, or none

**Routing:** React Router (Vite), Next.js built-in, or none

**Testing:** Vitest, Jest, or none

**Deployment:** Vercel, Netlify, or manual

## Examples

Minimal Vite app:

```bash
npx @gavbarosee/react-kickstart my-app --yes
```

Next.js with full stack:

```bash
npx @gavbarosee/react-kickstart my-app \
  --yes \
  --framework nextjs \
  --typescript \
  --styling tailwind \
  --state redux \
  --api axios-react-query \
  --testing jest \
  --deployment vercel
```

Vite + Zustand + Vitest:

```bash
npx @gavbarosee/react-kickstart my-app \
  --framework vite \
  --typescript \
  --state zustand \
  --testing vitest
```

See [`docs/user-guide/cli-reference.md`](docs/user-guide/cli-reference.md) for all flags.

## Comparison

`create-vite` gives you React + Vite with minimal config.
`create-next-app` gives you a Next.js app with basic structure.

This gives you a complete stack—state management hooked up, routing working, tests passing, ready to deploy.

## Requirements

Node.js >= 16

## Docs

[Getting Started](docs/user-guide/getting-started.md) • [CLI Reference](docs/user-guide/cli-reference.md) • [Troubleshooting](docs/user-guide/troubleshooting.md)

[Architecture](docs/architecture/how-it-works.md) • [Project Structure](docs/architecture/project-structure.md) • [Adding Frameworks](docs/extending/adding-a-new-framework.md) • [QA System](docs/qa/qa-automation-overview.md)

## Testing

Every combination is tested against real project generation (8,640+ configs). Tests actually run `npm run build`, not mocks.

See [QA Automation Overview](docs/qa/qa-automation-overview.md).

## Contributing

PRs welcome. Run `npm test` and `npm run lint` before opening.

See [Contributor Guide](docs/development/contributor-tooling.md) for setup.

## Versioning

Uses semantic versioning with conventional commits. See [CHANGELOG.md](CHANGELOG.md).

**Current version:** 0.4.0

## License

MIT © [Gav Barosee](https://github.com/gavbarosee)
