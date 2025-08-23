### Conventions and naming

Standards that keep the repo readable and scalable.

## Files and directories

- Use kebab-case for file and directory names across the codebase.
- Keep modules focused; avoid ultra-long files.

## Code style

- Prefer descriptive names over abbreviations.
- Early returns, minimal nesting, and clear guard clauses.
- Avoid catching errors without meaningful handling.

## Utilities imports

- Import via `src/utils/index.js` using `CORE_UTILS`, `PROCESS_UTILS`, `UI_UTILS` for clarity.

## Tests

- Place unit tests under `src/__tests__/`, `*.spec.js`.
- Tests should avoid false positives; assert observable behavior.
