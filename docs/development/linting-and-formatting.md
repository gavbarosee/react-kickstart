### Linting and formatting

Project uses ESLint and Prettier to enforce consistency.

## Where configs live

- ESLint: `eslint.config.js`
- Prettier: implicit defaults (format scripts provided)

## Commands

```bash
npm run lint         # report issues
npm run lint:fix     # auto-fix when possible
npm run format       # format with Prettier
npm run format:check # verify formatting only
```

## Rules and plugins

- `eslint`, `eslint-plugin-import`, `eslint-config-prettier`, `eslint-plugin-unicorn`
- Node ESM, modern JS. Prefer explicit imports and clear naming.

## Typical fixes

- Unused imports/vars: remove or prefix with `_` when intentional.
- Import order: group and sort consistently.
- Long lines: wrap for readability.
- Prefer descriptive names over abbreviations.

## Philosophy

- Keep noise low; aim for meaningful rules aligned with maintainability.
- Auto-fix where safe; fail CI on remaining issues.
