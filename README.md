# React Kickstart

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)
[![GitHub Actions](https://github.com/gavbarosee/react-kickstart/workflows/CI/badge.svg)](https://github.com/gavbarosee/react-kickstart/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/gavbarosee/react-kickstart/pulls)

A modern CLI tool for creating React applications with your preferred framework and stack—then install, build, and optionally start the dev server for you.

> **Ready-to-run projects** • **Zero configuration** • **Thoroughly tested** • **Multiple frameworks**

## Demo

**Coming soon**: Interactive demo GIF showing the CLI in action

## Quick Start

```bash
# Interactive mode (guided prompts)
node bin/react-kickstart.js my-app

# Non-interactive mode (with flags)
node bin/react-kickstart.js my-app \
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

## Features

- **Frameworks**: Vite, Next.js (with app/pages router options)
- **Languages**: TypeScript or JavaScript
- **Styling**: Tailwind CSS, styled-components, or plain CSS
- **State Management**: Redux Toolkit, Zustand, or none
- **API Integration**: Axios, React Query, Fetch combinations, or none
- **Routing**: React Router (Vite), Next.js routing (app/pages)
- **Testing**: Vitest, Jest, or none
- **Deployment**: Vercel, Netlify setup with build scripts
- **Package Managers**: npm, yarn
- **Quality Tools**: ESLint, Prettier, Git initialization

## What You Get

- A **ready-to-run** React project with your chosen stack
- **Dependencies installed** and configured
- **Example code** demonstrating your selected features
- **Build scripts** and development server setup
- **Testing setup** with example tests
- **Deployment configuration** for your chosen platform
- **Quality tools** configured (ESLint, Prettier)

## Prerequisites

- Node.js >= 16
- Git (optional but recommended)

## Installation

### Option 1: Run Directly (Recommended)

```bash
# Clone and run
git clone https://github.com/gavbarosee/react-kickstart.git
cd react-kickstart
node bin/react-kickstart.js my-app
```

### Option 2: NPM Global Install (Coming Soon)

```bash
# Will be available once published to npm
npm install -g react-kickstart
react-kickstart my-app
```

### Option 3: NPX (Coming Soon)

```bash
# Will be available once published to npm
npx react-kickstart my-app
```

## Documentation

- **[Getting Started](docs/user-guide/getting-started.md)** - Complete user guide
- **[CLI Reference](docs/user-guide/cli-reference.md)** - All flags and options
- **[Architecture](docs/architecture/how-it-works.md)** - How the CLI works internally
- **[Contributing](docs/development/contributor-tooling.md)** - Developer workflow and tools
- **[Extending](docs/extending/adding-a-new-framework.md)** - Add new frameworks and features

## Examples

### Minimal Vite Project

```bash
node bin/react-kickstart.js my-app --yes --framework vite --no-typescript --styling css --routing none --state none --api none --testing none
```

### Full-Featured Next.js Project

```bash
node bin/react-kickstart.js my-app --yes --framework nextjs --typescript --styling tailwind --next-routing app --state redux --api axios-react-query --testing jest --deployment vercel
```

### Vite + TypeScript + All Features

```bash
node bin/react-kickstart.js my-app --yes --framework vite --typescript --styling styled-components --routing react-router --state zustand --api fetch-react-query --testing vitest --deployment netlify
```

## Quality Assurance

This CLI is thoroughly tested with automated QA that validates:

- **Project generation** across all feature combinations
- **Dependency installation** and compatibility
- **Build success** for all generated projects
- **Test execution** to ensure examples work
- **No false positives** - only passes when features actually work

See [QA Documentation](docs/qa/qa-automation-overview.md) for details.

## Contributing

We welcome contributions! This project uses branch protection and requires all changes to go through pull requests.

### Quick Start for Contributors

1. **Fork and clone** the repository
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** and test locally
4. **Push branch**: `git push origin feature/your-feature`
5. **Create PR** using our template
6. **Wait for reviews** and CI checks to pass

### Development Resources

- [Branch Protection Workflow](docs/development/branch-protection-workflow.md) - PR process and CI/CD
- [Contributor Guide](docs/development/contributor-tooling.md) - Development workflow and tools
- [Architecture Overview](docs/architecture/how-it-works.md) - How the code is organized
- [Adding Features](docs/extending/) - Extend the CLI with new options

**Note**: Direct commits and pushes to `main` are blocked locally and on GitHub. All changes must be reviewed and pass comprehensive testing before merge.

### If You Try to Commit to Main

You'll see a helpful error message with clear instructions:

```bash
🚫 COMMIT BLOCKED: Direct commits to 'main' branch are not allowed!
📋 Pls use the following workflow:
   1. Create a feature branch: git checkout -b feature/your-feature-name
   2. Make your changes and commit to the feature branch
   3. Push the feature branch: git push origin feature/your-feature-name
   4. Create a Pull Request via GitHub
```

## Author

**React Kickstart** is created and maintained by [Gav Barosee](https://github.com/gavbarosee).

If you use this project or find it helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting issues
- 🤝 Contributing improvements
- 📢 Sharing with others

## License

MIT - see LICENSE file for details.

Copyright (c) 2024 Gav Barosee
