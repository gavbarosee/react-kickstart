### CI setup

Examples for running unit tests, coverage, and QA automation in CI.

## Minimal (unit tests + coverage)

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-html
          path: coverage/
```

## Add QA automation (critical matrix)

```yaml
qa:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "20"
    - run: npm ci
    - run: npm run qa:critical
    - uses: actions/upload-artifact@v4
      with:
        name: qa-reports
        path: qa-automation/reports/
```

For slower networks, prefer structural checks first and schedule full runs nightly.
