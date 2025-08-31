### Adding a New Package Manager (e.g., pnpm, Bun)

This guide explains how to integrate an additional package manager into react-kickstart so it can be detected, selected in prompts/CLI, used to install dependencies, run scripts, show next-step commands, and be included in QA automation.

**Current Status**: The codebase currently supports npm and yarn only. Use these as reference implementations. Target examples below assume adding `pnpm` and `bun`.

#### 1) Detection and Metadata (Required)

- File: `src/utils/process/package-managers.js`
- Extend the managers map in `detectPackageManagers(...)` to include your new tool(s):

```js
// Current implementation only includes npm and yarn:
const managers = {
  npm: { available: false, version: null, recommended: false, error: null },
  yarn: { available: false, version: null, recommended: false, error: null },
  // To add pnpm and bun, extend like this:
  pnpm: { available: false, version: null, recommended: false, error: null },
  bun: { available: false, version: null, recommended: false, error: null },
};
```

- Add detection helpers similar to `detectNpm`/`detectYarn`:

```js
async function detectPnpm(managers, verbose) {
  try {
    const { stdout } = await execa("pnpm", ["--version"]);
    managers.pnpm.available = true;
    managers.pnpm.version = stdout.trim();
  } catch (err) {
    managers.pnpm.error = err.message;
    if (verbose) console.log(chalk.dim(`pnpm detection failed: ${err.message}`));
  }
}

async function detectBun(managers, verbose) {
  try {
    const { stdout } = await execa("bun", ["--version"]);
    managers.bun.available = true;
    managers.bun.version = stdout.trim();
  } catch (err) {
    managers.bun.error = err.message;
    if (verbose) console.log(chalk.dim(`bun detection failed: ${err.message}`));
  }
}
```

- Call them inside `detectPackageManagers(...)` alongside npm/yarn.
- Recommendation rule: choose whichever you prefer when multiple are available. A simple policy is: Yarn > pnpm > npm > bun or similar. Update the logic accordingly.

- Update `isPackageManagerAvailable(packageManager)` to support your new names.

#### 2) Prompt Choices (Required)

- File: `src/utils/process/package-managers.js`
- Function: `formatPackageManagerChoices(managers)`

Add choice entries when detected. Keep color coding consistent and include a disabled block if none detected.

```js
if (managers.pnpm.available) {
  choices.push({ name: `${chalk.cyan("pnpm")}`, value: "pnpm", short: "pnpm" });
}
if (managers.bun.available) {
  choices.push({ name: `${chalk.magenta("bun")}`, value: "bun", short: "bun" });
}
```

No changes are required in `src/prompts/steps/package-manager-step.js`, because it already consumes `formatPackageManagerChoices(...)` and uses the detected default.

#### 3) Installation Logic (Required)

- File: `src/utils/process/package-managers.js`
- Function: `installDependencies(projectPath, packageManager, framework)`

Map the correct install command and flags:

- npm: `npm install --prefer-offline`
- yarn: `yarn install`
- pnpm: `pnpm install --prefer-offline` (pnpm supports this flag)
- bun: `bun install` (no `--prefer-offline` equivalent; keep args empty)

Example branching:

```js
let installCommand = "install";
let args = [];

switch (packageManager) {
  case "yarn":
    // yarn install
    break;
  case "pnpm":
    // pnpm install --prefer-offline
    args = ["--prefer-offline"];
    break;
  case "bun":
    // bun install (no extra args)
    break;
  case "npm":
  default:
    // npm install --prefer-offline
    args = ["--prefer-offline"];
}

const { stdout, stderr } = await execa(packageManager, [installCommand, ...args], { ... });
```

Parsing output for stats is purely cosmetic. If you already parse package counts/vulnerabilities, add patterns for your manager:

- pnpm often prints lines like `... added 123 packages` similar to npm.
- bun may print `Installed N packages` and `Done in` timings; there is no `audit` equivalent.

Update `parsePackageCount(...)` and `parseVulnerabilities(...)` with additional regex patterns or safe fallbacks when no data is present.

#### 4) Retry and Switching (Recommended)

- File: `src/utils/process/package-managers.js`
- Function: `installDependenciesWithRetry(...)`

Current logic toggles between npm and yarn when a recovery action requests a switch. If you add more managers, either:

- Implement a simple rotation list, e.g., `[npm, yarn, pnpm, bun]`, skipping unavailable ones.
- Or switch to the next “available” manager from the detection results.

Also ensure the UI recovery prompt (via `userReporter.showDependencyRecovery`) shows meaningful options when multiple managers are detected.

#### 5) Running Scripts and Start Flow (Required)

- File: `src/utils/process/package-managers.js`
- Function: `getPackageManagerCommand(packageManager, script)`

Add commands for each manager:

- npm: `npm run <script>`
- yarn: `yarn <script>` (or `yarn start` special-case)
- pnpm: `pnpm <script>` (no `run` needed)
- bun: `bun run <script>`

```js
if (packageManager === "pnpm") return ["pnpm", script];
if (packageManager === "bun") return ["bun", "run", script];
```

- File: `src/utils/process/dev-server.js`

The start code builds a `dev` command string from a `pmRun` variable. Update that logic to map:

- npm: `npm run`
- yarn: `yarn`
- pnpm: `pnpm`
- bun: `bun run`

So dev becomes `"<pmRun> dev"` for all except npm where we already use `npm run` (keep behavior consistent).

#### 6) Completion Summary Commands and Security Notes (Recommended)

- File: `src/utils/ui/project-summary.js`

Update `getCommandExamples(packageManager, framework)` so examples show the correct prefix:

- npm → `npm run dev`
- yarn → `yarn dev`
- pnpm → `pnpm dev`
- bun → `bun run dev`

Update audit commands section:

- npm: `npm audit`, `npm audit fix`
- yarn: `yarn audit`, `yarn audit fix` (only for Yarn classic)
- pnpm: `pnpm audit` (supports audit)
- bun: no audit equivalent → hide the audit lines or print a helpful message.

#### 7) `package.json` Build Scripts (Deployment Integration) (Recommended)

- File: `src/builders/package-json-builder.js`

Update `getBuildCommand(packageManager)` to support additional managers:

- yarn: `yarn build`
- npm: `npm run build`
- pnpm: `pnpm build`
- bun: `bun run build`

This ensures deployment helper scripts like `vercel:*` or `netlify:*` are correct for the chosen manager.

#### 8) CLI Options and Defaults (Optional but Useful)

- File: `src/index.js`

The CLI already accepts `--package-manager`. Consider validating that its value is one of the detected/known managers and defaulting to the detected recommendation (from `getDefaultPackageManager`) when omitted. Document allowed values in the README.

#### 9) QA Automation Matrix (Recommended)

- File: `qa-automation/test-matrix-generator.js`

Add new managers to `CONFIG_OPTIONS.packageManager`, e.g.:

```js
packageManager: ["npm", "yarn"], // Current implementation
// To add more: ["npm", "yarn", "pnpm", "bun"],
```

Optionally adjust `calculatePriorityScore(...)` to weight commonly used managers higher.

Re-generate and run tests:

```bash
node qa-automation/test-matrix-generator.js
node qa-automation/test-runner.js critical 10
node qa-automation/test-runner.js standard 25
node qa-automation/test-runner.js edge 15
```

Validate reports under `qa-automation/reports/` until green.

#### 10) Unit Tests (Strongly Recommended)

Add or update tests to avoid regressions and ensure meaningful coverage (no placeholders):

- Detection functions return expected availability/version when tools are present/missing (use mocks for `execa`).
- `getPackageManagerCommand(...)` returns the correct tuple for each manager.
- Completion UI examples produce the right commands per manager.
- Start flow builds the expected `dev` command string per manager.

#### 11) Documentation Touchpoints (Optional)

- Update `README.md` and `../guides/using-react-kickstart.md` to list supported package managers and the `--package-manager` CLI flag with valid values.

---

### Minimal Checklist

- Add detection helpers: `detectPnpm`, `detectBun` in `src/utils/process/package-managers.js` and include them in `detectPackageManagers(...)`.
- Extend `formatPackageManagerChoices(...)` and `getDefaultPackageManager(...)` to account for new managers and recommendation order.
- Update install mapping, parse helpers, and retry switching in `src/utils/process/package-managers.js`.
- Update script mapping in `getPackageManagerCommand(...)` and dev command construction in `src/utils/process/dev-server.js`.
- Update command examples and audit notes in `src/utils/ui/project-summary.js`.
- Update build command mapping in `src/builders/package-json-builder.js#getBuildCommand`.
- Expand QA matrix in `qa-automation/test-matrix-generator.js` and re-run automation.
- Add targeted unit tests for detection and command mapping.

With these edits, your new package manager will be detected, selectable in prompts and CLI, used for installs and script execution, reflected in next-step guidance, and validated by QA.
