## [0.1.1](https://github.com/gavbarosee/react-kickstart/compare/v0.1.0...v0.1.1) (2025-09-08)


### Bug Fixes

* add GitHub Actions permissions for semantic-release git operations ([2d5edc0](https://github.com/gavbarosee/react-kickstart/commit/2d5edc0d2af795a8a24305ca7c8e321de18a49f2))
* bypass Husky hooks for semantic-release git commits ([da97728](https://github.com/gavbarosee/react-kickstart/commit/da97728c6851b73ee7b964658d734e6d980da136))
* change package name to scoped @gavbarosee/react-kickstart ([f1794eb](https://github.com/gavbarosee/react-kickstart/commit/f1794eb0c17b9d2cff8cba91e7547fc1b5785ae7))
* configure npm authentication properly in release workflow ([3cc6e64](https://github.com/gavbarosee/react-kickstart/commit/3cc6e64968ca47645d69612b0bd258774fd3fe2d))
* disable Husky hooks in CI environment for semantic-release ([58f897e](https://github.com/gavbarosee/react-kickstart/commit/58f897e6563cdbfb6e58af174daea8cb80897ec4))
* use Personal Access Token to bypass branch protection ([7ecb9ab](https://github.com/gavbarosee/react-kickstart/commit/7ecb9ab6ca7dca6bb3a840c545ad88d6f825fc41))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-09-05

### Added

**Initial Release**

#### Framework Support

- Vite framework support with fast development server
- Next.js framework support with full-stack capabilities

#### Styling Options

- Tailwind CSS integration with utility-first approach
- styled-components support for CSS-in-JS
- Plain CSS option for traditional styling

#### State Management

- Redux Toolkit integration with modern Redux patterns
- Zustand support for lightweight state management
- Option to skip state management for simple projects

#### API Integration

- Axios + React Query combination for robust data fetching
- Fetch + React Query for native browser API calls
- Basic fetch-only option for simple use cases

#### Testing Frameworks

- Vitest integration for fast unit and integration testing
- Jest support for traditional testing workflows
- Option to skip testing setup

#### Deployment Support

- Vercel deployment configuration with zero-config setup
- Netlify deployment configuration with build optimization
- Manual deployment setup for custom hosting

#### Development Features

- React Router integration for client-side routing
- Next.js built-in routing for full-stack applications
- npm and yarn package manager support with auto-detection
- ESLint configuration with React best practices
- Prettier integration for consistent code formatting
- Git initialization with sensible .gitignore

#### Quality Assurance

- Comprehensive QA automation system
- Automated testing of all feature combinations
- Flag validation and compatibility checking
- Detailed test reporting and validation

#### Documentation

- Complete documentation suite
- User guides and CLI reference
- Architecture documentation
- Contributing guidelines
- Troubleshooting guides

#### CLI Features

- Interactive prompts for guided setup
- Non-interactive mode with flags for automation
- Smart defaults for quick project creation
- Comprehensive flag support for all options
- Auto-detection of installed tools (IDE, package manager)
- Automatic project opening in detected IDE
- Development server auto-start

## [Unreleased]

### Planned Features

#### Additional Styling Options

- Emotion CSS-in-JS library support
- Sass/SCSS preprocessing support
- CSS Modules integration

#### Framework Expansion

- Remix framework support
- Astro framework support for static sites

#### Testing Tools

- Playwright integration for end-to-end testing
- Cypress support for comprehensive E2E testing
- React Testing Library enhancements

#### Deployment Platforms

- AWS deployment configurations
- Railway deployment support
- Docker containerization options

#### Mobile Development

- React Native project generation
- Expo integration for mobile development

#### Advanced Features

- Custom template support for organizations
- Plugin system for extensibility
- Configuration file support (.react-kickstart.json)
- Monorepo support with multiple projects

---

## Release Notes

### Version 0.1.0 - Initial Release

This is the first public release of React Kickstart!

React Kickstart is a modern CLI tool that creates complete, production-ready React applications in seconds. Unlike other generators that give you empty templates, React Kickstart provides working example code that demonstrates how your chosen tools work together.

**Key Highlights:**

- **Zero Configuration**: Everything works out of the box
- **Smart Detection**: Automatically finds your IDE and package manager
- **Battle-Tested Combinations**: All tool combinations are pre-configured and tested
- **Real Examples**: Working code, not empty templates
- **Production Ready**: Includes deployment configs and best practices

**Get Started:**

```bash
npx react-kickstart my-app
```

**Supported Technologies:**

- **Frameworks**: Vite, Next.js
- **Languages**: TypeScript, JavaScript
- **Styling**: Tailwind CSS, styled-components, CSS
- **State**: Redux Toolkit, Zustand
- **API**: Axios + React Query, Fetch + React Query
- **Testing**: Vitest, Jest
- **Deployment**: Vercel, Netlify

Thank you to everyone who provided feedback during development!
