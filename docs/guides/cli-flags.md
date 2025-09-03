### CLI Flags Guide (no prompts)

Use flags to fully configure the app without interactive prompts.

#### Basic usage

```bash
node bin/react-kickstart.js <project-name> [flags]

# Example (Vite + TS + Tailwind + React Router + Redux + Vitest)
node bin/react-kickstart.js my-app \
  --yes \
  --framework vite \
  --typescript \
  --styling tailwind \
  --routing react-router \
  --state redux \
  --api axios-react-query \
  --testing vitest \
  --package-manager npm \
  --no-autostart
```

#### Flags

| Flag                               | Alias | Values                                                                           | Default                                       | Applies to   | Description                                                       |
| ---------------------------------- | ----- | -------------------------------------------------------------------------------- | --------------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `--yes`                            | `-y`  | boolean                                                                          | `false`                                       | all          | Skip prompts; use defaults plus any flags you pass                |
| `--framework <framework>`          | `-f`  | `vite` · `nextjs`                                                                | `vite`                                        | all          | Choose the framework                                              |
| `--typescript` / `--no-typescript` | —     | boolean                                                                          | `false` (disabled)                            | all          | Enable or disable TypeScript                                      |
| `--styling <styling>`              | —     | `tailwind` · `styled-components` · `css`                                         | `tailwind`                                    | all          | Choose styling solution                                           |
| `--state <state>`                  | —     | `redux` · `zustand` · `none`                                                     | `none`                                        | all          | State management                                                  |
| `--api <api>`                      | —     | `axios-react-query` · `axios-only` · `fetch-react-query` · `fetch-only` · `none` | `none`                                        | all          | API client/integration                                            |
| `--testing <testing>`              | —     | `vitest` · `jest` · `none`                                                       | `none`                                        | all          | Test framework                                                    |
| `--deployment <deployment>`        | —     | `vercel` · `netlify` · `none`                                                    | `none`                                        | all          | Deployment platform setup                                         |
| `--routing <routing>`              | —     | `react-router` · `none`                                                          | `none`                                        | Vite only    | React Router toggle for Vite projects                             |
| `--next-routing <routing>`         | —     | `app` · `pages`                                                                  | `app`                                         | Next.js only | Router mode for Next.js                                           |
| `--package-manager <pm>`           | —     | `npm` · `yarn`                                                                   | `npm`                                         | all          | Package manager                                                   |
| `--no-linting`                     | —     | boolean                                                                          | `true` (linting enabled unless you pass this) | all          | Disable ESLint setup                                              |
| `--no-git`                         | —     | boolean                                                                          | `false` (Git initialized)                     | all          | Skip Git initialization                                           |
| `--no-summary`                     | —     | boolean                                                                          | `false` (summary prompt shown)                | all          | Skip pre-generation confirmation summary prompt                   |
| `--no-autostart`                   | —     | boolean                                                                          | `false` (auto-start dev)                      | all          | Do not auto-start the dev server after setup                      |
| `--skip-install`                   | —     | boolean                                                                          | `false`                                       | all          | Skip dependency installation (useful for CI/QA structural checks) |

#### Quick recipes

- Vite minimal JS + CSS:

```bash
node bin/react-kickstart.js app --yes --framework vite --no-typescript --styling css --routing none --state none --api none --testing none
```

- Next.js + TS + styled-components + app router + Jest:

```bash
node bin/react-kickstart.js app --yes --framework nextjs --typescript --styling styled-components --next-routing app --testing jest --deployment vercel
```

- Vite + Tailwind + Zustand + Fetch-only + Vitest (no git, no summary):

```bash
node bin/react-kickstart.js app --yes --framework vite --styling tailwind --state zustand --api fetch-only --testing vitest --no-git --no-summary
```

- Next.js (pages router) + JS + CSS + Jest:

```bash
node bin/react-kickstart.js app --yes --framework nextjs --no-typescript --styling css --next-routing pages --testing jest
```

- Vite + TS + React Router + Redux Toolkit + Vitest (Yarn):

```bash
node bin/react-kickstart.js app \
  --yes \
  --framework vite \
  --typescript \
  --styling css \
  --routing react-router \
  --state redux \
  --api none \
  --testing vitest \
  --package-manager yarn
```

- CI: structure-only (skip install) and no autostart:

```bash
node bin/react-kickstart.js app --yes --framework vite --typescript --styling tailwind --skip-install --no-autostart
```

- Minimal Next.js (TS + Tailwind + app router), skip git and summary:

```bash
node bin/react-kickstart.js app --yes --framework nextjs --typescript --styling tailwind --next-routing app --no-git --no-summary
```

- Vite + TS + styled-components + Zustand + Vitest:

```bash
node bin/react-kickstart.js app --yes --framework vite --typescript --styling styled-components --state zustand --testing vitest
```

- Vite JS quick demo (single line):

```bash
node bin/react-kickstart.js demo -y -f vite --no-typescript --styling css --routing none --state none --api none --testing none
```

#### Notes

- Flags override defaults and remove the need for prompts.
- If you pass framework-specific routing, use the correct flag: `--routing` (Vite) or `--next-routing` (Next.js).
- Use `--skip-install` for quick generation; run `npm install` yourself later.
- Precedence: explicit flags > `--yes` defaults > interactive prompts (prompts are skipped when `--yes` is present).
