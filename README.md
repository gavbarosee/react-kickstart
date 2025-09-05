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
- [What React Kickstart Does](#what-react-kickstart-does)
- [Why Not Just Use Vite or Next.js CLI?](#why-not-just-use-vite-or-nextjs-cli)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [CLI Reference](#cli-reference)
- [Documentation](#documentation)
- [Quality Assurance](#quality-assurance)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Demo

<div align="center">

<video width="800" controls autoplay muted loop>
  <source src="https://github.com/gavbarosee/react-kickstart/releases/download/v0.1.0/react-kickstart-demo.mov" type="video/mp4">
  Your browser does not support the video tag.
</video>

_The CLI's interactive mode in action!_

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

1. **Asks you simple questions** - What framework? TypeScript? Styling? State Management? Routing? Tests? Linting? Deployment? etc (or skip for a default configuration with `--yes`)
2. **Creates your project folder** with a clean file structure
3. **Installs all dependencies** automatically (npm/yarn) - no manual setup needed
4. **Configures everything** - ESLint, Prettier, build scripts, deployment settings
5. **Generates example code** showing how to use your chosen tools together
6. **Opens your IDE** automatically (VS Code, Cursor, etc.) if installed
7. **Starts the dev server** and opens your browser to `localhost`
8. **Ready to code!** - Your app is running and you can start building immediately

### **What Makes It Special**

- **Zero configuration** - Everything just works out of the box
- **Smart detection** - Finds your installed IDE and package manager
- **Battle-tested combinations** - All tools are pre-configured to work together perfectly
- **Real examples** - Not empty templates, but working code you can build on
- **Production ready** - Includes deployment configs, testing setup, and best practices

### **Technology Options**

| **Choose Your Stack** | **Available Options**                                                     |
| --------------------- | ------------------------------------------------------------------------- |
| **Framework**         | Vite (fast dev) or Next.js (full-stack)                                   |
| **Language**          | TypeScript (recommended) or JavaScript                                    |
| **Styling**           | Tailwind CSS, styled-components, or plain CSS                             |
| **Routing**           | React Router (Vite only), Next.js App Router, or Pages Router             |
| **State Management**  | Redux Toolkit, Zustand, or none                                           |
| **API Calls**         | Axios + React Query, Axios only, Fetch + React Query, Fetch only, or none |
| **Testing**           | Vitest (fast), Jest (traditional), or none                                |
| **Deployment**        | Vercel, Netlify, or manual setup                                          |
| **Package Manager**   | npm or yarn (auto-detected)                                               |

---

## Why Not Just Use Vite or Next.js CLI?

**Great question!** The official tools (`npm create vite@latest`, `npx create-next-app`) are excellent, but they only get you started. React Kickstart goes **much further**:

### **Official CLI Tools Give You:**

- Basic project structure
- Minimal configuration
- A "Hello World" starting point

### **React Kickstart Gives You:**

- **Everything above, PLUS:**
- **Pre-configured tool combinations** - Redux + RTK Query, Tailwind + TypeScript, etc.
- **Working example code** - See how the tools work together, not just empty templates
- **Complete development setup** - ESLint, Prettier, testing, deployment configs
- **Smart integrations** - Auto-detects your IDE and package manager
- **Production-ready structure** - Organized folders, best practices, proper imports
- **One command setup** - No need to manually add and configure 5+ additional tools

---

## Prerequisites

- **Node.js** `>= 16` - Required for running the CLI

---

## Installation

### NPX (Recommended)

```bash
# Run directly without installing
npx react-kickstart my-app

# Or with yarn
yarn create react-kickstart my-app
```

### Global Install

```bash
# Install globally for repeated use
npm install -g react-kickstart
react-kickstart my-app

# Or with yarn
yarn global add react-kickstart
react-kickstart my-app
```

## Usage Examples

```bash
# Interactive mode (recommended for beginners)
npx react-kickstart my-app

# Quick start with defaults
npx react-kickstart my-app --yes

# Full-featured setup
npx react-kickstart my-app --yes --framework nextjs --typescript --styling tailwind --state redux --api axios-react-query --testing jest --deployment vercel
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

**[Complete CLI Reference →](docs/user-guide/cli-reference.md)** - All flags, examples, and usage patterns

---

## Documentation

### **For Users**

**[Getting Started →](docs/user-guide/getting-started.md)** - Installation, first project, and basic usage  
**[CLI Reference →](docs/user-guide/cli-reference.md)** - Complete command and flag documentation  
**[Troubleshooting →](docs/user-guide/troubleshooting.md)** - Common issues and solutions

### **For Contributors**

**[Contributor Guide →](docs/development/contributor-tooling.md)** - Setup, workflow, and requirements  
**[Architecture Overview →](docs/architecture/how-it-works.md)** - How React Kickstart works internally  
**[Extending React Kickstart →](docs/extending/adding-a-new-framework.md)** - Add frameworks, styling, testing options  
**[Quality Assurance →](docs/qa/qa-automation-overview.md)** - Testing and validation systems

---

## Quality Assurance

React Kickstart includes comprehensive quality assurance systems to ensure reliability:

- **Automated Testing** - Unit tests, integration tests, and end-to-end validation
- **Feature Validation** - Automated testing of all framework/tool combinations
- **Flag Validation** - CLI flag compatibility and error handling tests
- **QA Reports** - Detailed test reports for every build and release

**[QA Documentation →](docs/qa/qa-automation-overview.md)** - Complete testing and validation systems

---

## Contributing

**Contributions welcome!** All changes go through pull requests with automated testing and QA validation.

**See the [Documentation](#documentation) section above for contributor guides and setup instructions.**

### **Ways to Contribute**

| Type              | Examples                                   |
| ----------------- | ------------------------------------------ |
| **Code**          | Features, bug fixes, refactoring           |
| **Documentation** | Guides, examples, README improvements      |
| **Testing**       | QA improvements, test coverage             |
| **Design**        | UI/UX improvements, logos, assets          |
| **Ideas**         | Feature requests, architecture discussions |

### **Contributors**

<div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
  <a href="https://github.com/gavbarosee">
    <img src="https://avatars.githubusercontent.com/u/30755017?v=4" width="60" height="60" style="border-radius: 50%;" alt="Gav Barosee">
  </a>
</div>

---

## Changelog

**Current Version: 0.1.0** - Initial release with Vite/Next.js, TypeScript, Tailwind, Redux, testing, and deployment support.

**[Full Changelog →](CHANGELOG.md)** - Complete version history and release notes

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Gav Barosee**
