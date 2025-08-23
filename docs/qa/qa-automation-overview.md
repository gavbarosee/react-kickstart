### QA Automation: How it works and what it generates

This folder executes end-to-end checks across many config combinations to ensure generated apps build and run. It favors real projects over mocks to prevent false positives.

#### What’s inside

- `test-matrix-generator.js`: Produces JSON suites of configurations to test.
- `test-runner.js`: Creates projects from configs, validates structure/scripts, and writes a detailed report.
- `feature-validator.js`: Quick analyzer for what the CLI actually generates by default (sanity checks and diffs vs expectations).
- `test-configs/`: Generated test plan files (`critical-tests.json`, `standard-tests.json`, `edge-tests.json`).
- `reports/`: Timestamped JSON results with pass/fail and reasons.
- `qa-test-projects/`: Temporary projects created during runs (cleaned up by default).

#### End-to-end flow (simplified)

```text
1) node qa-automation/test-matrix-generator.js
   → builds a matrix of combos (framework, typescript, styling, state, api, testing, pm, etc.)
   → categorizes by priority (critical/standard/edge)
   → saves JSON configs under qa-automation/test-configs/

2) node qa-automation/test-runner.js <category> <limit?> [--full]
   → reads configs for the category
   → for each config: runs CLI with flags, generates project in qa-test-projects/
   → validates structure, package.json, (optionally) runs build/lint/test
   → aggregates results and writes reports/test-report-<timestamp>.json
```

#### Matrix generator (test-matrix-generator.js)

- Defines allowed values: framework, typescript, styling, state, api, testing, packageManager, linting, initGit.
- Adds conditional options per framework (e.g., `routing` for Vite, `nextRouting` for Next.js).
- Generates the cartesian product of valid choices, scores them, and categorizes into:
  - Critical: most representative/important combos.
  - Standard: broader coverage.
  - Edge: unusual but valid setups.
- Outputs:
  - `qa-automation/test-configs/critical-tests.json`
  - `qa-automation/test-configs/standard-tests.json`
  - `qa-automation/test-configs/edge-tests.json`
  - `qa-automation/test-matrix-summary.json`

#### Test runner (test-runner.js)

- Builds a CLI command with flags for each config (e.g., `--framework vite --typescript --styling tailwind ...`).
- Creates a fresh project folder per test under `qa-test-projects/`.
- Validates:
  - Project and `package.json` exist and parse.
  - Source dir exists (framework-appropriate).
  - Expected deps present (based on config).
  - If `--full`: runs `npm run build`, optionally `lint` and `test`.
- Produces a consolidated summary and a detailed JSON report with per-test status and issues.
- Defaults to `--skip-install` unless `--full` is passed (faster structural checks; use `--full` for full CI runs).

Report example (fields):

```json
{
  "summary": {
    "total": 25,
    "successful": 24,
    "failed": 1,
    "successRate": "96%",
    "totalDuration": "120s",
    "averageDuration": "4200ms"
  },
  "results": [
    {
      "testName": "vite-critical-0",
      "config": { "framework": "vite", "typescript": true, "styling": "tailwind" },
      "success": true,
      "duration": 3800,
      "validation": { "projectExists": true, ... },
      "error": null
    }
  ],
  "failedTests": []
}
```

#### Feature validator (feature-validator.js)

- Generates quick default projects (Vite/Next.js) to compare expected vs actual features.
- Prints a readable summary (TS/Tailwind/ESLint/Git/etc.) and success rate.
- Helps adjust expectations or fix generators when defaults drift.

#### Typical usage

```bash
# 1) Generate test plans
node qa-automation/test-matrix-generator.js

# 2) Run critical tests (fast structural checks)
node qa-automation/test-runner.js critical 10

# 3) Run comprehensive CI pass (full build+tests)
node qa-automation/test-runner.js critical --full
node qa-automation/test-runner.js standard --full
node qa-automation/test-runner.js edge --full

# 4) Inspect the report
cat qa-automation/reports/test-report-*.json | jq '.'
```

#### Extending the QA system

- Add new frameworks/options:
  - Update allowed values and conditional options in `test-matrix-generator.js`.
  - Update `getExpectedDependencies()` in `test-runner.js` for new deps.
- Tune categories/weights by editing `calculatePriorityScore()`.
- Add new validators: extend `validateProject()` or add separate scripts.

#### Guarantees and philosophy

- No false positives by design: validation inspects real, generated projects.
- Structural checks are fast; full runs ensure builds/tests actually pass.
- Reports are machine-readable for CI and human-readable in logs.
