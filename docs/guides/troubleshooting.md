### Troubleshooting

Quick fixes for common issues when running the CLI or generated apps.

## Environment

- Ensure Node.js >= 16 (`node -v`). Prefer latest LTS.
- Clear package manager caches if installs hang:

```bash
npm cache verify && npm cache clean --force || true
pnpm store prune || true
yarn cache clean || true
```

- Delete lockfiles and `node_modules/` if dependency resolution breaks:

```bash
rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock
npm install
```

## Permissions

- On macOS/Linux, permission errors when executing scripts:

```bash
chmod +x bin/react-kickstart.js
```

- Git hooks failing (husky): ensure `npm run prepare` ran after install.

## CLI issues

- Stuck on prompts: run with explicit flags (see `docs/guides/cli-flags.md`).
- Terminal rendering odd: try a basic terminal (no multiplexers) and narrow window.
- Unknown option errors: update the tool and re-check flags.

## Generated app issues

- Dev server won’t start:
  - Check Node version and reinstall deps in the generated project.
  - For Vite: ensure ports are free; try `--port 5173`.
  - For Next.js: delete `.next/` and retry `npm run dev`.

- ESLint/Prettier conflicts:
  - Run `npm run lint` to see exact rules; auto-fix with `npm run lint:fix`.
  - Refer to `docs/guides/linting-and-formatting.md`.

## QA automation

- Slow runs: start with `npm run qa:critical`.
- Network-limited CI: use `--skip-install` mode or a local npm mirror.

## Still stuck?

- Run with debug logs and share output:

```bash
node --trace-warnings bin/react-kickstart.js
```
