## Contributor Tooling and Workflow

This document explains the developer tooling baked into this repository: linting, formatting, pre-commit, tests, QA automation, and useful scripts. It’s meant for contributors working on the CLI itself (not generated apps).

### Node and engines

- Requires Node.js >= 16 (see `package.json#engines`)

### Package scripts

Run these from the repository root:

```bash
# Lint source and bin
npm run lint

# Auto-fix lint issues where possible
npm run lint:fix

# Format with Prettier
npm run format
npm run format:check

# Run unit tests (Vitest)
npm test

# Tests with coverage (v8)
npm run test:coverage

# QA harness (matrix-based E2E project generation)
npm run qa:critical
npm run qa:standard

# Install Husky hooks (first time after clone)
npm run prepare
```

### Linting (ESLint v9 flat config)

- Config: `eslint.config.js` (ESM/flat config)
- Plugins: `eslint-plugin-import`, `eslint-plugin-unicorn`, `eslint-config-prettier`
- Highlights:
  - Enforces kebab-case filenames (`unicorn/filename-case`)
  - Deterministic import ordering (`import/order`)
  - Reasonable `no-unused-vars` with patterns tailored for CLI internals
  - `no-console` allowed (it’s a CLI)
  - Test files relax some rules (see overrides for `*.spec.js`)
- Ignored paths include generated artifacts (coverage, qa outputs, templates)

Usage:

```bash
npm run lint
npm run lint:fix
```

### Formatting (Prettier)

- Prettier is used project-wide; defaults are sufficient
- Commands:

```bash
npm run format
npm run format:check
```

### Pre-commit (Husky + lint-staged)

- `husky` is included; `npm run prepare` installs hooks locally
- `lint-staged` is configured in `package.json` to run on staged files:
  - `src/**/*.{js,cjs}` → `eslint --fix` then `prettier --write`
  - `bin/**/*.{js,cjs}` → `eslint --fix` then `prettier --write`
- If hooks are not firing after clone:

```bash
npm install
npm run prepare
# optionally, ensure a pre-commit hook exists
npx husky add .husky/pre-commit "npx lint-staged"
```

### Commit message linting (Commitlint)

- Dev deps include `@commitlint/cli` and `@commitlint/config-conventional`
- Commitlint config already exists at `commitlint.config.js` with conventional commit rules
- To add the Husky `commit-msg` hook if not present:

```bash
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

### Testing (Vitest)

- Config: `vitest.config.js`
- Test location: `src/__tests__/**/*.spec.js`
- Node environment
- Coverage provider: v8; reports in `coverage/`

Commands:

```bash
npm test
npm run test:coverage
```

### QA automation (matrix-based E2E)

Located in `qa-automation/`:

- Generates real projects across many configurations and validates them
- Key scripts:
  - `qa-automation/test-matrix-generator.js`
  - `qa-automation/test-runner.js`
  - `qa-automation/feature-validator.js`
- Repo scripts:
  - `npm run qa:critical` → fast structural checks for critical combos
  - `npm run qa:standard` → broader coverage

Refer to `docs/qa-automation-overview.md` for full details and usage examples.

### Conventions

- Filenames: kebab-case (enforced by ESLint `unicorn/filename-case`)
- ESM modules (`type: module` in `package.json`)
- Keep code readable; prefer descriptive names and clear control flow
- Avoid deep nesting; handle error cases first

### Docs you may want

- `docs/how-it-works.md` — internal architecture overview
- `docs/project-structure-walkthrough.md` — files and folders explained
- `docs/cli-flags.md` — non-interactive usage reference
- `docs/using-react-kickstart.md` — end-user guide to the CLI

### CI tips

- Typical steps: `npm ci`, `npm run lint`, `npm test`, `npm run test:coverage`
- For broader validation, run QA harness with `--full` from the scripts in `qa-automation/`
- Ensure the CI environment uses Node >= 16

### License

- MIT — see `LICENSE` if present; otherwise see `package.json#license`
