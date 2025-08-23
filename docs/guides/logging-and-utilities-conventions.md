### Logging and utilities conventions

Consistent imports and organization keep the codebase clear and scalable.

## Utilities entry point

- Import utilities from `src/utils/index.js`, which exports:
  - `CORE_UTILS` for core helpers
  - `PROCESS_UTILS` for process/exec concerns
  - `UI_UTILS` for UI/console output

Example:

```js
import { UI_UTILS, CORE_UTILS } from "../../src/utils/index.js";

UI_UTILS.logInfo("Starting...");
const isValid = CORE_UTILS.validateProjectName("my-app");
```

## Logging

- Always import logging via `UI_UTILS` rather than direct `./ui/logging.js` imports.
- Prefer intent-revealing helpers: `logInfo`, `logWarn`, `logError`, `logSuccess`.
- Keep messages actionable and concise.

## Organization

- Core utilities: `src/utils/core/*` (formatting, fs, validation, analysis)
- Process utilities: `src/utils/process/*` (git, package managers, editor, start)
- UI utilities: `src/utils/ui/*` (logging, summaries, completion)

## Naming

- Use kebab-case for files and directories across the project.
