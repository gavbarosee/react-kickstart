# Release Guide

Quick reference for releasing React Kickstart to npm.

## 🚀 Automatic Release (Recommended)

The easiest way to release is using conventional commits:

```bash
# For bug fixes (0.1.0 → 0.1.1)
git commit -m "fix: resolve installation issue on Windows"

# For new features (0.1.0 → 0.2.0)
git commit -m "feat: add support for React 19"

# For breaking changes (0.1.0 → 1.0.0)
git commit -m "feat!: remove deprecated CLI flags"

# Push to trigger release
git push origin main
```

The system will automatically:

- ✅ Run full test suite
- ✅ Determine version bump from commits
- ✅ Generate changelog
- ✅ Publish to npm
- ✅ Create GitHub release
- ✅ Update package.json version

## 🔧 Setup Requirements

### 1. NPM Token

Create and configure your NPM automation token:

```bash
# Create token
npm login
npm token create --type=automation

# Add to GitHub secrets at:
# https://github.com/gavbarosee/react-kickstart/settings/secrets/actions
# Name: NPM_TOKEN
# Value: [your token]
```

### 2. Run Setup Script

```bash
./scripts/setup-release.sh
```

## 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

| Type        | Description      | Version Bump          |
| ----------- | ---------------- | --------------------- |
| `feat:`     | New feature      | Minor (0.1.0 → 0.2.0) |
| `fix:`      | Bug fix          | Patch (0.1.0 → 0.1.1) |
| `feat!:`    | Breaking change  | Major (0.1.0 → 1.0.0) |
| `docs:`     | Documentation    | Patch                 |
| `style:`    | Code style       | Patch                 |
| `refactor:` | Code refactoring | Patch                 |
| `test:`     | Tests            | Patch                 |
| `chore:`    | Build/tooling    | Patch                 |

### Examples

```bash
# Good commit messages
git commit -m "feat: add Astro framework support"
git commit -m "fix: resolve package installation timeout"
git commit -m "docs: update CLI reference with new flags"
git commit -m "feat!: remove support for Node.js 14"

# Breaking change with body
git commit -m "feat: redesign CLI interface

BREAKING CHANGE: The --template flag has been renamed to --framework.
Update your scripts to use --framework instead of --template."
```

## 🔒 Release Protection

The system includes automatic protection:

### Version Change Protection

- Manual version changes in `package.json` trigger full matrix validation
- 8,640 configuration combinations must pass
- Creates tracking issue with checklist

### Validation Gates

- All tests must pass
- Linting must pass
- QA automation must pass
- Flag validation must pass

## 🚨 Emergency Release

For urgent releases that need to bypass validation:

```bash
# Force release (use with caution)
gh workflow run release.yml -f force_release=true
```

## 📊 Monitoring Releases

### Check Release Status

```bash
# List recent releases
gh run list --workflow=release.yml --limit=5

# Watch current release
gh run watch

# Check npm package
npm view react-kickstart
```

### Verify Release

```bash
# Check latest version
npm view react-kickstart version

# Test installation
npx react-kickstart@latest --version
```

## 🐛 Troubleshooting

### Release Not Triggered

- Check commit message format: `git log --oneline -5`
- Verify conventional commit format
- Check if CI is passing

### NPM Publishing Failed

- Verify NPM_TOKEN secret is set
- Check token permissions: `npm whoami`
- Regenerate token if needed

### Matrix Validation Required

- Run full validation: `gh workflow run full-matrix-validation.yml`
- Wait for all 8,640 configurations to pass
- Force release after validation passes

### Version Conflicts

- Don't manually edit `package.json` version
- Let semantic-release handle versioning
- Use conventional commits for version bumps

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Full Setup Guide](./docs/deployment/automated-release-setup.md)
- [GitHub Actions Workflows](./.github/workflows/)

## 🎯 Quick Commands

```bash
# Test semantic-release config
npx semantic-release --dry-run

# Check commit message format
echo "feat: new feature" | npx commitlint

# Run setup script
./scripts/setup-release.sh

# Monitor workflows
gh run list --workflow=release.yml
gh run list --workflow=full-matrix-validation.yml

# Check package status
npm view react-kickstart
npm view react-kickstart versions --json
```
