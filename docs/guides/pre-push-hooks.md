# Pre-Push Hook Guide

## Enhanced Pre-Push Validation

The pre-push hook now runs the same comprehensive checks as CI to catch issues before pushing.

## What Gets Checked

The pre-push hook runs these checks in order:

1. ** Code Quality**
   - `npm run lint` - ESLint checks (0 errors, 0 warnings)
   - `npm run format:check` - Prettier formatting

2. ** Unit Tests**
   - `npm run test:coverage` - 22 unit tests with coverage

3. ** Flag Validation**
   - `npm run test:flags` - All 34 CLI flags tested individually

4. ** Feature Validation**
   - `npm run test:features` - CLI capability analysis

5. ** Critical QA**
   - `npm run qa:critical` - Key configuration combinations

## Normal Usage

```bash
git push
```

The hook runs automatically and must pass before push succeeds.

## Skip When Needed

```bash
SKIP_PREPUSH=1 git push
```

This bypasses ALL pre-push checks (use sparingly!).

## Expected Duration

- **Full run**: ~30-45 seconds
- **Skip mode**: Instant

## Benefits

- **Catch issues early** - Before CI runs
- **Faster feedback** - No waiting for CI to fail
- **Clean history** - Only working code gets pushed
- **CI confidence** - Pre-push mirrors CI exactly

## Troubleshooting

If pre-push fails:

1. **Fix the issue** shown in the error output
2. **Run individual checks** to debug:
   ```bash
   npm run lint
   npm run test:flags
   npm run qa:critical
   ```
3. **Skip if urgent** (but fix later):
   ```bash
   SKIP_PREPUSH=1 git push
   ```

## What This Prevents

- Linting failures in CI
- Broken CLI flags
- Failed unit tests
- Configuration regressions
- Formatting inconsistencies
