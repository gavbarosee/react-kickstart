### Reading QA reports

QA writes JSON reports to `qa-automation/reports/test-report-*.json`.

## Summary

Top-level `summary` contains `total`, `successful`, `failed`, `successRate`, and durations. Prefer success rates ≥ 95% for broad suites; investigate any regressions.

## Results

Each `results[]` entry includes:

- `testName`: human-friendly id
- `config`: framework, options, and flags used
- `success`: boolean
- `duration`: ms
- `validation`: detailed checks done (structure, deps, scripts)
- `error`: message or null

## Quick viewing

```bash
ls -la qa-automation/reports/test-report-*.json | tail -1 | xargs cat | jq '.'
ls -la qa-automation/reports/test-report-*.json | tail -1 | xargs cat | jq '.summary'
```

## Common failures

- Missing dependency due to generator drift → update expected deps and generator wiring.
- Script mismatch (`build`, `dev`, `test`) → align `package.json` templates.
- Framework-specific structure moved → adjust validators.
