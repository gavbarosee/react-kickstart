<div align="center">

![React Kickstart Logo](https://res.cloudinary.com/ddy8ydri4/image/upload/v1759661837/rk-banner_jxltjl.jpg)

Generate pre-configured React apps with your choice of [framework, styling, and tooling](#stack-options)

[![NPM Version](https://img.shields.io/npm/v/@gavbarosee/react-kickstart?style=flat-square)](https://www.npmjs.com/package/@gavbarosee/react-kickstart)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI Status](https://img.shields.io/github/actions/workflow/status/gavbarosee/react-kickstart/ci.yml?style=flat-square&label=CI)](https://github.com/gavbarosee/react-kickstart/actions)
[![NPM Downloads](https://img.shields.io/npm/dm/@gavbarosee/react-kickstart?style=flat-square)](https://www.npmjs.com/package/@gavbarosee/react-kickstart)

</div>

---

## Table of Contents

- [Demo](#demo)
- [Quick Start](#quick-start)
- [What It Does](#what-it-does)
- [Quick Examples](#quick-examples)
- [Installation](#installation)
- [CLI Reference](#cli-reference)
- [Community & Support](#community--support)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

<div align="center">

https://github.com/user-attachments/assets/cd32c723-63f7-4b6f-81b9-abed53477318

_Interactive CLI demonstration_

</div>

---

## Quick Start

No installation needed. Just run with npx:

```bash
npx @gavbarosee/react-kickstart my-app
# or with yarn
yarn create @gavbarosee/react-kickstart my-app
```

You'll be asked a few questions to configure your stack. Typically under a minute.

**Prefer global installation?** Install once and use the shorter command:

```bash
npm install -g @gavbarosee/react-kickstart
# or with yarn
yarn global add @gavbarosee/react-kickstart

# then run
react-kickstart my-app
```

**Requirements:** Node.js >= 18

---

## What It Does

Tools like `create-vite` and `create-next-app` give you a framework with minimal setup. React Kickstart scaffolds your entire application stack:

- **State management** — Redux or Zustand configured with working examples
- **Routing** — React Router or Next.js routing set up with example pages
- **API integration** — Axios or fetch with React Query configured and ready
- **Testing** — Vitest or Jest set up with example tests
- **Styling** — Tailwind CSS, styled-components, or CSS properly configured
- **Deployment** — Vercel or Netlify configurations included
- **Code quality** — ESLint and Prettier preconfigured

Everything works together out of the box with no configuration required.

### How It Works

1. **Sets up your project** — Creates folders and base files
2. **Adds your choices** — Framework, styling, state management, and tooling ([see options](#stack-options))
3. **Installs dependencies** — Runs npm or yarn automatically (auto-detects which you use)
4. **Configures everything** — ESLint, Prettier, TypeScript, testing—all wired together
5. **Generates working code** — Example components showing how everything fits together
6. **Opens your editor** — Detects VS Code or Cursor and launches it
7. **Starts the dev server** — Opens `localhost:3000` (Vite) or `:3001` (Next.js) in your browser

### Stack Options

| Category            | Options                                                |
| ------------------- | ------------------------------------------------------ |
| **Framework**       | Vite, Next.js (app/pages router)                       |
| **Language**        | TypeScript, JavaScript                                 |
| **Styling**         | Tailwind CSS, styled-components, CSS                   |
| **Routing**         | React Router, Next.js built-in                         |
| **State**           | Redux Toolkit, Zustand, none                           |
| **API**             | Axios + React Query, Fetch + React Query, basic setups |
| **Testing**         | Vitest, Jest, none                                     |
| **Deployment**      | Vercel, Netlify, manual                                |
| **Package Manager** | npm, yarn (auto-detected)                              |
| **Git**             | Initialize repository (yes/no)                         |
| **Linting**         | ESLint + Prettier (yes/no)                             |
| **Editor**          | Cursor, VS Code, none (auto-detects installed editors) |

---

## Quick Examples

**Quick & Simple:**

```bash
npx @gavbarosee/react-kickstart my-app --yes
```

Good for quick prototypes. Vite with sensible defaults.

**Production Ready:**

```bash
npx @gavbarosee/react-kickstart my-app \
  --framework nextjs \
  --typescript \
  --styling tailwind \
  --state redux \
  --api axios-react-query \
  --testing jest \
  --deployment vercel
```

Everything you need to start building a real application.

---

## Installation

Use npx (no installation needed) or install globally if you'll use it often. [See Quick Start above](#quick-start).

---

## CLI Reference

### Available Flags

| Flag              | Options                                   | Default    | Description                |
| ----------------- | ----------------------------------------- | ---------- | -------------------------- |
| `-y, --yes`       | -                                         | `false`    | Skip prompts, use defaults |
| `-f, --framework` | `vite`, `nextjs`                          | `vite`     | React framework            |
| `--typescript`    | -                                         | `false`    | Enable TypeScript          |
| `--styling`       | `tailwind`, `styled-components`, `css`    | `tailwind` | Styling solution           |
| `--state`         | `redux`, `zustand`, `none`                | `none`     | State management           |
| `--api`           | `axios-react-query`, `fetch-only`, `none` | `none`     | API integration            |
| `--testing`       | `vitest`, `jest`, `none`                  | `none`     | Testing framework          |
| `--deployment`    | `vercel`, `netlify`, `none`               | `none`     | Deployment platform        |

**[Complete CLI Reference](https://react-kickstart.dev/cli-reference)** — Full documentation with all options and examples

---

## Community & Support

**Need help?**

- **[GitHub Discussions](https://github.com/gavbarosee/react-kickstart/discussions)** - Ask questions and share ideas
- **[GitHub Issues](https://github.com/gavbarosee/react-kickstart/issues)** - Report bugs and request features
- **[Documentation](https://react-kickstart.dev)** - Guides and references

**Stay in the loop:**

- **[GitHub Releases](https://github.com/gavbarosee/react-kickstart/releases)** - New versions and updates
- **[Changelog](CHANGELOG.md)** - What's changed in each version

---

## Contributing

See the [contributor guide](https://react-kickstart.dev/contributing) for detailed setup and workflow.

### Contributors

[![Contributors](https://contrib.rocks/image?repo=gavbarosee/react-kickstart)](https://github.com/gavbarosee/react-kickstart/graphs/contributors)

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Gav Barosee**
