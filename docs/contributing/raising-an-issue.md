### Raising an issue on GitHub

Use this guide to file high‑quality issues that are easy to reproduce and fix.

## Before you open an issue

- Search existing issues to avoid duplicates.
- Skim `docs/guides/troubleshooting.md` and try the suggested fixes.
- If possible, update to the latest version (or `main`) and retry.
- Run unit tests locally (`npm test`) to see if failures align with your change.
- For generation problems, try a quick QA run to see if the failure is broader:

```bash
node qa-automation/test-matrix-generator.js
node qa-automation/test-runner.js critical 10
```

## Choose the right type

- Bug report: Something is broken or regressed.
- Feature request: Propose a new option, framework, or integration.
- Question/Discussion: Usage questions, design trade‑offs, or clarifications.
- Docs issue: Missing/incorrect documentation.

## What to include (checklist)

- Repro steps: exact command(s) you ran and options selected.
- Expected vs actual behavior (short and specific).
- Logs/output (attach or paste), ideally with trace warnings enabled.
- Environment: OS, Node version, package manager + version.
- Tool version/commit: npm package version or git commit hash.
- If a generated app fails: framework (Vite/Next.js), router mode, styling, state, API, testing choice.
- If QA is relevant: attach the latest JSON report from `qa-automation/reports/`.

## Minimal reproduction recipe (example)

Use a small, deterministic config that demonstrates the issue:

```bash
# Example: Vite + TS + Tailwind + React Router + Redux + Vitest (structure only)
node bin/react-kickstart.js repro-app \
  --yes \
  --framework vite \
  --typescript \
  --styling tailwind \
  --routing react-router \
  --state redux \
  --api none \
  --testing vitest \
  --skip-install
```

Then describe the smallest additional steps to trigger the problem.

## Gathering diagnostics

- CLI with extra details:

```bash
node --trace-warnings bin/react-kickstart.js my-app --yes ...
```

- Environment info:

```bash
node -v
npm -v || yarn -v
uname -a
```

- QA report (optional but helpful):

```bash
node qa-automation/test-matrix-generator.js
node qa-automation/test-runner.js critical 10
# Attach the newest file from qa-automation/reports/
```

## Issue template (copy‑paste into your report)

````md
### Type

- [ ] Bug
- [ ] Feature request
- [ ] Question
- [ ] Docs

### Description

<!-- Clear, concise summary of the problem or proposal. -->

### Reproduction steps

```bash
# commands you ran
node bin/react-kickstart.js my-app --yes --framework vite --typescript --styling tailwind --routing react-router --state redux --api none --testing vitest
```
````

<!-- any additional steps inside the generated project, if applicable -->

### Expected behavior

<!-- What you expected to happen -->

### Actual behavior

<!-- What actually happened; include error messages/stack traces if any -->

### Environment

- OS: <!-- e.g., macOS 14.6 -->
- Node: <!-- e.g., 20.16.0 -->
- Package manager: <!-- npm 10.8.1 / yarn 1.22.x -->
- react-kickstart version/commit: <!-- e.g., 1.2.3 or git SHA -->

### Selected options (if generation-related)

- framework: <!-- vite | nextjs -->
- nextRouting (if nextjs): <!-- app | pages -->
- typescript: <!-- true | false -->
- styling: <!-- tailwind | styled-components | css | other -->
- state: <!-- redux | zustand | none | other -->
- api: <!-- axios-react-query | axios-only | fetch-react-query | fetch-only | none -->
- testing: <!-- vitest | jest | none -->
- packageManager: <!-- npm | yarn | ... -->

### Logs / attachments

<!-- Paste CLI output (use --trace-warnings when possible) and attach QA report JSON if relevant -->

```

## Security and private data

- Do not include secrets, API keys, or internal URLs in logs.
- If you believe you’ve found a security vulnerability, avoid filing a public issue. Contact the maintainers privately.

---

Thank you for taking the time to create a clear report—this greatly speeds up triage and fixes.


```
