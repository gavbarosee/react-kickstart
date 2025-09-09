# Automated Release Setup Guide

This guide explains how to set up automated npm publishing with semantic release, changelog generation, and GitHub releases.

## Overview

The release system uses **semantic-release** to automatically:

- Analyze commit messages to determine version bumps
- Generate changelogs from conventional commits
- Publish to npm
- Create GitHub releases
- Update version numbers

## Prerequisites

### 1. NPM Token Setup

You need to configure an NPM token for automated publishing:

1. **Create NPM Token**

   ```bash
   # Login to npm
   npm login

   # Create automation token
   npm token create --type=automation
   ```

2. **Add to GitHub Secrets**
   - Go to your repository settings
   - Navigate to **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: Your npm automation token

### 2. GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions, no setup needed.

## How It Works

### Commit Message Format

The system uses [Conventional Commits](https://www.conventionalcommits.org/) to determine version bumps:

```bash
# Patch release (0.1.0 → 0.1.1)
fix: resolve issue with package installation

# Minor release (0.1.0 → 0.2.0)
feat: add support for React 19

# Major release (0.1.0 → 1.0.0)
feat!: remove deprecated API methods
# or
feat: add new API
BREAKING CHANGE: removed old authenticate method
```

### Release Workflow

1. **Push to Main**: Commits are pushed to the main branch
2. **Validation**: Full test suite runs (lint, tests, QA)
3. **Version Analysis**: Semantic-release analyzes commits
4. **Matrix Validation**: If version changes, full matrix validation may be required
5. **Release**: Automatic npm publish, changelog update, GitHub release

### Release Protection

The system includes built-in protection:

- **Matrix Validation**: Version changes trigger full test matrix (8,640 configurations)
- **Validation Gates**: All tests must pass before release
- **Manual Override**: Force release option for emergencies
- **Issue Tracking**: Automatic issues created for blocked releases

## Release Types

### Automatic Release (Recommended)

```bash
# Make changes with conventional commits
git add .
git commit -m "feat: add new framework support"
git push origin main

# Release happens automatically if:
# - All tests pass
# - No version change (or matrix validation passed)
```

### Manual Release (Emergency)

```bash
# Force release bypassing matrix validation
gh workflow run release.yml -f force_release=true
```

### Version Change Release

When `package.json` version changes:

1. **Matrix validation required** (8,640 configurations)
2. **Release blocked** until validation passes
3. **Issue created** with validation checklist
4. **Manual force** required after validation

```bash
# Run full matrix validation
gh workflow run full-matrix-validation.yml

# Wait for completion, then force release
gh workflow run release.yml -f force_release=true
```

## Configuration

### Semantic Release Config

Located in `package.json` under the `release` key:

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      "@semantic-release/git"
    ]
  }
}
```

### Supported Commit Types

- `feat`: New features (minor version)
- `fix`: Bug fixes (patch version)
- `docs`: Documentation changes (patch version)
- `style`: Code style changes (patch version)
- `refactor`: Code refactoring (patch version)
- `perf`: Performance improvements (patch version)
- `test`: Test changes (patch version)
- `chore`: Build/tooling changes (patch version)
- `ci`: CI/CD changes (patch version)

### Breaking Changes

Add `!` after type or include `BREAKING CHANGE:` in commit body:

```bash
feat!: remove deprecated methods
# or
feat: add new API

BREAKING CHANGE: The old authenticate method has been removed.
Use the new auth.login() method instead.
```

## Monitoring Releases

### GitHub Actions

Monitor release progress:

```bash
# List recent workflow runs
gh run list --workflow=release.yml --limit=5

# Watch specific run
gh run watch <run-id>
```

### NPM Package

Check published versions:

```bash
# View package info
npm view react-kickstart

# Check latest version
npm view react-kickstart version

# View all versions
npm view react-kickstart versions --json
```

### GitHub Releases

Releases are automatically created at:
`https://github.com/gavbarosee/react-kickstart/releases`

## Troubleshooting

### Release Blocked

If release is blocked:

1. **Check validation status**

   ```bash
   gh run list --workflow=full-matrix-validation.yml --limit=1
   ```

2. **Run matrix validation**

   ```bash
   gh workflow run full-matrix-validation.yml
   ```

3. **Force release after validation**
   ```bash
   gh workflow run release.yml -f force_release=true
   ```

### NPM Token Issues

If npm publishing fails:

1. **Verify token**

   ```bash
   npm whoami
   ```

2. **Regenerate token**

   ```bash
   npm token create --type=automation
   ```

3. **Update GitHub secret**
   - Repository Settings → Secrets → Update `NPM_TOKEN`

### Commit Message Issues

If no release is triggered:

1. **Check commit format**

   ```bash
   git log --oneline -5
   ```

2. **Use conventional format**
   ```bash
   git commit -m "feat: your feature description"
   ```

### Version Conflicts

If version conflicts occur:

1. **Check current version**

   ```bash
   npm view react-kickstart version
   jq -r '.version' package.json
   ```

2. **Reset if needed**
   ```bash
   # Semantic release will handle versioning
   # Don't manually edit package.json version
   ```

## Best Practices

### Commit Messages

- Use conventional commit format
- Be descriptive but concise
- Include scope when relevant: `feat(cli): add new command`
- Reference issues: `fix: resolve installation issue (#123)`

### Release Timing

- **Small changes**: Automatic release on merge
- **Major features**: Consider batching related commits
- **Breaking changes**: Coordinate with documentation updates

### Testing

- All tests must pass before release
- Matrix validation ensures compatibility
- QA automation validates real-world scenarios

### Documentation

- Update docs before releasing breaking changes
- Include migration guides for major versions
- Keep changelog meaningful and user-focused

## Security

- NPM tokens are scoped to automation only
- GitHub tokens have minimal required permissions
- Release workflow runs in protected environment
- Matrix validation prevents broken releases

## Support

For issues with the release system:

1. Check workflow logs in GitHub Actions
2. Review validation reports in the `reports/` directory
3. Create an issue with the `release` label
4. Contact maintainers for urgent release needs

## Related Documentation

- **[Nightly Operations](./nightly-operations.md)**: Automated nightly validation, security checks, and performance monitoring
- **[CI Setup](./ci-setup.md)**: Basic CI/CD configuration examples
