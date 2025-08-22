# React Kickstart QA Automation

This directory contains comprehensive QA automation tools for testing the React Kickstart CLI across all supported configurations.

## Quick Start

```bash
# Run critical tests (most important combinations)
node qa-automation/test-runner.js critical 10

# Run comprehensive tests (broader coverage)
node qa-automation/test-runner.js standard 25

# Run all edge cases
node qa-automation/test-runner.js edge 15

# Generate fresh test matrix
node qa-automation/test-matrix-generator.js
```

## Test Categories

### Critical Tests

The most important feature combinations that cover:

- Both frameworks (Vite & Next.js)
- TypeScript + JavaScript variations
- All styling solutions (Tailwind, styled-components, CSS)
- All state management options (Redux, Zustand, none)
- All API configurations (Axios, React Query, Fetch combinations)
- All testing frameworks (Vitest, Jest, none)

### Standard Tests

Broader coverage including:

- Different package managers (npm, yarn, pnpm)
- Various routing configurations
- Mixed Git/linting options

### Edge Tests

Unusual but valid combinations that test boundary cases.

## What Gets Validated

Each test validates that the generated project:

- **Project Structure**: Correct files and directories created
- **Dependencies**: All required packages installed correctly
- **TypeScript**: tsconfig.json and types when enabled
- **Build System**: Project builds successfully
- **Scripts**: npm/yarn scripts execute properly
- **Linting**: ESLint configuration when enabled
- **Testing**: Test framework setup when enabled
- **Feature Integration**: All selected features work together

## No False Positives

The test suite is designed to **only pass when features actually work**:

- Tests build the generated project to ensure it compiles
- Validates all dependencies are properly installed
- Checks configuration files exist and are valid
- Verifies feature-specific setup (Redux store, API clients, etc.)

## Results

Test reports are generated in `qa-automation/test-report-[timestamp].json` with:

- Success/failure status for each configuration
- Detailed validation results
- Performance metrics
- Error details for failed tests

Reports are automatically excluded from Git via `.gitignore`.

## Configuration

The test matrix generator creates configurations based on:

- **Framework combinations**: All valid Vite/Next.js setups
- **Feature compatibility**: Only realistic combinations (no conflicting features)
- **Priority scoring**: Critical > Standard > Edge based on real-world usage

## CI/CD Integration

The QA automation integrates with GitHub Actions for:

- **Pull Request validation**: Critical tests on every PR
- **Comprehensive testing**: Full test suite on main branch
- **Performance monitoring**: Track generation times
- **Regression detection**: Catch breaking changes immediately

## Usage Tips

1. **Start with critical tests** - covers 80% of use cases
2. **Run sequentially** - tests use sequential execution to avoid conflicts
3. **Check reports** - detailed JSON reports help debug any issues
4. **Clean runs** - test directories are automatically cleaned between runs
