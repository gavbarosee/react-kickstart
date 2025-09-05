<div align="center">

![React Kickstart Logo](https://github.com/gavbarosee/react-kickstart/releases/download/v0.1.0/react-kickstart-logo.png)

_A modern CLI tool for creating React applications with your preferred framework and stack_

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg?style=for-the-badge)](https://nodejs.org/)
[![NPM Version](https://img.shields.io/npm/v/react-kickstart?style=for-the-badge)](https://www.npmjs.com/package/react-kickstart)
[![NPM Downloads](https://img.shields.io/npm/dm/react-kickstart?style=for-the-badge)](https://www.npmjs.com/package/react-kickstart)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/gavbarosee/react-kickstart/ci.yml?style=for-the-badge&label=CI)](https://github.com/gavbarosee/react-kickstart/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart/pulls)
[![GitHub Stars](https://img.shields.io/github/stars/gavbarosee/react-kickstart?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/gavbarosee/react-kickstart?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart/issues)
[![GitHub Forks](https://img.shields.io/github/forks/gavbarosee/react-kickstart?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/gavbarosee/react-kickstart?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart/commits/main)
[![Languages](https://img.shields.io/github/languages/count/gavbarosee/react-kickstart?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart)
[![Top Language](https://img.shields.io/github/languages/top/gavbarosee/react-kickstart?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart)
[![Code Size](https://img.shields.io/github/languages/code-size/gavbarosee/react-kickstart?style=for-the-badge)](https://github.com/gavbarosee/react-kickstart)

> **From idea to running app in seconds** • **Zero configuration** • **Production-ready** • **Your stack, your choice**

</div>

---

## Table of Contents

- [Demo](#demo)
- [Quick Start](#quick-start)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [CLI Reference](#cli-reference)
- [Documentation](#documentation)
- [Quality Assurance](#quality-assurance)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [Contributors](#contributors)
- [License](#license)

## Demo

<div align="center">

<video width="800" controls autoplay muted loop>
  <source src="https://github.com/gavbarosee/react-kickstart/releases/download/v0.1.0/react-kickstart-demo.mov" type="video/mp4">
  Your browser does not support the video tag.
</video>

_React Kickstart in action - from zero to running app in seconds!_

</div>

---

## Quick Start

```bash
# Interactive mode (guided prompts)
npx react-kickstart my-app

# Non-interactive mode (with flags)
npx react-kickstart my-app \
  --yes \
  --framework vite \
  --typescript \
  --styling tailwind \
  --routing react-router \
  --state redux \
  --api axios-react-query \
  --testing vitest \
  --deployment netlify
```

## What React Kickstart Does

**React Kickstart creates a complete, working React application in seconds.** Here's exactly what happens when you run it:

### **The Complete Setup Process**

1. **Asks you simple questions** - What framework? TypeScript? Styling? (Or skip with `--yes`)
2. **Creates your project folder** with the perfect file structure
3. **Installs all dependencies** automatically (npm/yarn) - no manual setup needed
4. **Configures everything** - ESLint, Prettier, build scripts, deployment settings
5. **Generates example code** showing how to use your chosen tools together
6. **Opens your IDE** automatically (VS Code, Cursor, etc.) if installed
7. **Starts the dev server** and opens your browser to `localhost:3000`
8. **Ready to code!** - Your app is running and you can start building immediately

### **What Makes It Special**

- **Zero configuration** - Everything just works out of the box
- **Smart detection** - Finds your installed IDE and package manager
- **Battle-tested combinations** - All tools are pre-configured to work together perfectly
- **Real examples** - Not empty templates, but working code you can learn from
- **Production ready** - Includes deployment configs, testing setup, and best practices

### **Technology Options**

| **Choose Your Stack** | **Available Options**                              |
| --------------------- | -------------------------------------------------- |
| **Framework**         | Vite (fast dev) or Next.js (full-stack)            |
| **Language**          | TypeScript (recommended) or JavaScript             |
| **Styling**           | Tailwind CSS, styled-components, or plain CSS      |
| **State Management**  | Redux Toolkit, Zustand, or none                    |
| **API Calls**         | Axios + React Query, Fetch + React Query, or basic |
| **Testing**           | Vitest (fast) or Jest (traditional)                |
| **Deployment**        | Vercel, Netlify, or manual setup                   |

**The result?** A professional React app that would take hours to set up manually, ready in under 30 seconds.

---

## Why Not Just Use Vite or Next.js CLI?

**Great question!** The official tools (`npm create vite@latest`, `npx create-next-app`) are excellent, but they only get you started. React Kickstart goes **much further**:

### **Official CLI Tools Give You:**

- ✅ Basic project structure
- ✅ Minimal configuration
- ✅ A "Hello World" starting point

### **React Kickstart Gives You:**

- ✅ **Everything above, PLUS:**
- ✅ **Pre-configured tool combinations** - Redux + RTK Query, Tailwind + TypeScript, etc.
- ✅ **Working example code** - See how the tools work together, not just empty templates
- ✅ **Complete development setup** - ESLint, Prettier, testing, deployment configs
- ✅ **Smart integrations** - Auto-detects your IDE and package manager
- ✅ **Production-ready structure** - Organized folders, best practices, proper imports
- ✅ **One command setup** - No need to manually add and configure 5+ additional tools

### **The Real Difference:**

| **After Official CLI**   | **After React Kickstart**                      |
| ------------------------ | ---------------------------------------------- |
| Empty template           | Working example app                            |
| Manual tool setup needed | Everything pre-configured                      |
| Hours of configuration   | Ready to code immediately                      |
| Basic structure          | Production-ready architecture                  |
| "Hello World"            | Real components with routing, state, API calls |

**Think of it this way:** Official CLIs give you a house foundation. React Kickstart gives you a **fully furnished, move-in-ready home** with all utilities connected.

---

## Prerequisites

- **Node.js** `>= 16` - Required for running the CLI
- **Git** - Optional but recommended for version control

---

## Installation

### NPM Global Install (Coming Soon)

```bash
# Will be available once published to npm
npm install -g react-kickstart
react-kickstart my-app

# Or with yarn
yarn global add react-kickstart
react-kickstart my-app
```

### NPX (Coming Soon)

```bash
# Will be available once published to npm
npx react-kickstart my-app

# Or with yarn
yarn create react-kickstart my-app
```

## Usage Examples

```bash
# Interactive mode (recommended for beginners)
npx react-kickstart my-app

# Quick start with defaults
npx react-kickstart my-app --yes

# Custom configuration example
npx react-kickstart my-app --yes --framework nextjs --typescript --styling tailwind --state redux --api axios-react-query --testing jest
```

---

## CLI Reference

### **Key Flags**

| Flag              | Options                                   | Default    | Description                |
| ----------------- | ----------------------------------------- | ---------- | -------------------------- |
| `-y, --yes`       | -                                         | `false`    | Skip prompts, use defaults |
| `-f, --framework` | `vite`, `nextjs`                          | `vite`     | React framework            |
| `--typescript`    | -                                         | `false`    | Enable TypeScript          |
| `--styling`       | `tailwind`, `styled-components`, `css`    | `tailwind` | Styling solution           |
| `--state`         | `redux`, `zustand`, `none`                | `none`     | State management           |
| `--api`           | `axios-react-query`, `fetch-only`, `none` | `none`     | API integration            |
| `--testing`       | `vitest`, `jest`, `none`                  | `none`     | Testing framework          |

### **Quick Examples**

```bash
# Interactive mode (recommended)
npx react-kickstart my-app

# Quick start with defaults
npx react-kickstart my-app --yes

# Full-featured setup
npx react-kickstart my-app --yes --framework nextjs --typescript --styling tailwind --state redux --api axios-react-query --testing jest --deployment vercel
```

📖 **[Complete CLI Reference →](docs/user-guide/cli-reference.md)** - All flags, examples, and usage patterns

---

## Documentation

| **User Guides**                                       | **Architecture**                                            | **Contributing**                                                    |
| ----------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| [Getting Started](docs/user-guide/getting-started.md) | [How it Works](docs/architecture/how-it-works.md)           | [Contributor Guide](docs/development/contributor-tooling.md)        |
| [CLI Reference](docs/user-guide/cli-reference.md)     | [Project Structure](docs/architecture/project-structure.md) | [Branch Protection](docs/development/branch-protection-workflow.md) |
| [Troubleshooting](docs/user-guide/troubleshooting.md) | [Templates](docs/architecture/templates.md)                 | [Raising Issues](docs/development/raising-an-issue.md)              |

| **Extending**                                                           | **Quality Assurance**                            |
| ----------------------------------------------------------------------- | ------------------------------------------------ |
| [Add Framework](docs/extending/adding-a-new-framework.md)               | [QA Overview](docs/qa/qa-automation-overview.md) |
| [Add Styling](docs/extending/adding-a-new-styling-option.md)            | [Test Validation](docs/qa/test-validation.md)    |
| [Add State Management](docs/extending/adding-a-new-state-management.md) | [Reading Reports](docs/qa/reading-qa-reports.md) |

---

## Contributing

**We welcome contributors!** This project uses branch protection - all changes go through pull requests.

### **Quick Start**

```bash
# 1. Fork and clone
git clone https://github.com/YO/react-kickstart.git
cd react-kickstart

# 2. Create feature branch
git checkout -b feature/your-awesome-feature

# 3. Make changes and test
npm test
npm run qa:quick

# 4. Commit and push
git commit -m "feat: add new styling option"
git push origin feature/your-awesome-feature
```

**Requirements**: All PRs must pass unit tests, linting, and QA validation.

📚 **[Contributor Guide →](docs/development/contributor-tooling.md)** - Detailed setup and workflow  
🔒 **[Branch Protection →](docs/development/branch-protection-workflow.md)** - PR process and requirements  
🐛 **[Raising Issues →](docs/development/raising-an-issue.md)** - Bug reports and feature requests

---

## Changelog

### **Version 0.1.0** _(Current)_

**Initial Release**

- Vite and Next.js framework support
- Tailwind CSS, styled-components, CSS styling options
- Redux Toolkit and Zustand state management
- Axios and Fetch API integration options
- Vitest and Jest testing frameworks
- Vercel and Netlify deployment configurations
- React Router and Next.js routing
- npm and yarn package manager support
- ESLint, Prettier, and Git initialization
- Comprehensive QA automation
- Complete documentation suite

### **Upcoming Features**

- More styling options (Emotion, Sass)
- Additional frameworks (Remix, Astro)
- More testing tools (Playwright, Cypress)
- More deployment platforms (AWS, Railway)
- React Native support
- Custom template support

---

## Contributors

### **Thank You for contributing!**

<!-- Future contributors will be automatically displayed here when we set up all-contributors -->

**Want to see your profile here?**

Check out our [Contributing Guide](#contributing) and make your first contribution!

### **How to Contribute**

| Type              | Examples                                   | Recognition                        |
| ----------------- | ------------------------------------------ | ---------------------------------- |
| **Code**          | Features, bug fixes, refactoring           | GitHub profile + contributor badge |
| **Documentation** | Guides, examples, README improvements      | Documentation contributor badge    |
| **Testing**       | QA improvements, test coverage             | Testing contributor badge          |
| **Design**        | UI/UX improvements, logos, assets          | Design contributor badge           |
| **Ideas**         | Feature requests, architecture discussions | Idea contributor badge             |

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Gav Barosee**
