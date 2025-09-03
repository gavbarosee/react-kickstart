# React Kickstart

A modern CLI tool for creating React applications with your preferred framework and stack—then install, build, and optionally start the dev server for you.

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

```bash
# Run directly (recommended)
node bin/react-kickstart.js my-app

# Or install globally
npm install -g react-kickstart
react-kickstart my-app
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

We welcome contributions! Please see:

- [Contributor Guide](docs/development/contributor-tooling.md) - Development workflow
- [Architecture Overview](docs/architecture/how-it-works.md) - How the code is organized
- [Adding Features](docs/extending/) - Extend the CLI with new options

## License

MIT - see LICENSE file for details.
