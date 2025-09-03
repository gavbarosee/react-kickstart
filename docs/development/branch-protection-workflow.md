# Branch Protection and PR Workflow

This document outlines the branch protection strategy and pull request workflow for the React Kickstart project.

## Branch Protection Overview

The `main` branch is protected at **two levels** to ensure code quality and proper review:

### Local Git Hooks Protection

- **Blocks commits to main** - Pre-commit hook prevents local commits to main branch
- **Blocks pushes to main** - Pre-push hook prevents direct pushes to main branch
- **Immediate feedback** - Clear instructions provided when blocked
- **No wasted resources** - Expensive tests only run on feature branches

### GitHub Branch Protection Rules

- **No direct pushes** - All changes must go through pull requests
- **Required status checks** - All CI/CD tests must pass before merge
- **Required reviews** - At least 1 approval required
- **Up-to-date branches** - PRs must be current with main before merge

## What Happens When You Try to Commit to Main

If you accidentally try to commit directly to the `main` branch, you'll see:

```bash
$ git add .
$ git commit -m "my changes"

🚫 COMMIT BLOCKED: Direct commits to 'main' branch are not allowed!

📋 Please use the following workflow:
   1. Create a feature branch: git checkout -b feature/your-feature-name
   2. Make your changes and commit to the feature branch
   3. Push the feature branch: git push origin feature/your-feature-name
   4. Create a Pull Request via GitHub

💡 This protects the main branch and ensures all changes go through proper review.
📚 See docs/development/branch-protection-workflow.md for details

husky - pre-commit script failed (code 1)
```

**What to do next:**

1. Your changes are still staged (safe)
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "your message"`
4. Push and create a PR

## Development Workflow

### 1. Create Feature Branch

```bash
# Start from main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/documentation-update
```

### 2. Development Process

```bash
# Make your changes
# ... code, test, commit ...

# Push feature branch
git push origin feature/your-feature-name
```

### 3. Create Pull Request

- Use GitHub UI or GitHub CLI: `gh pr create`
- Fill out the PR template completely
- Ensure all checklist items are addressed
- Add appropriate labels and reviewers

### 4. CI/CD Pipeline

#### Light Tests (Run on every PR commit)

- **CI Build** (Node 18.x, 20.x)
  - Linting (`npm run lint`)
  - Code formatting check (`npm run format:check`)
  - Unit tests with coverage (`npm run test:coverage`)
  - Flag validation tests (`npm run test:flags`)

- **Quick QA Tests**
  - Flag validation tests
  - Feature validation tests
  - Quick QA test suite

- **Critical QA Tests**
  - Critical configuration tests (15 test configurations)

#### Comprehensive Tests (Run before merge)

- **Comprehensive QA Tests** (QA Automation)
  - Full test matrix (critical + standard + edge cases)
  - 120-minute timeout for thorough testing
  - Only runs on non-draft PRs to main

- **Comprehensive QA Tests** (QA Validation)
  - Standard configuration tests (50 configurations)
  - 30-minute timeout

### 5. Review Process

1. **Automated checks** must pass (light tests)
2. **Code review** from at least 1 team member
3. **Address feedback** and push updates
4. **Final approval** triggers comprehensive tests
5. **Merge** only after all checks pass

## CI/CD Test Strategy

### Draft PRs

- **Skipped**: All tests are skipped for draft PRs
- **Use case**: Work-in-progress, experimental changes

### Regular PRs

- **Light tests**: Run on every commit push
- **Fast feedback**: Results within 5-10 minutes
- **Early detection**: Catch issues before comprehensive testing

### Ready-to-Merge PRs

- **Comprehensive tests**: Run automatically when PR is approved
- **Full validation**: All supported configurations tested
- **Merge blocking**: Must pass before merge is allowed

## PR Template Checklist

The PR template includes comprehensive checklists for:

- **Type of change** identification
- **Testing requirements** verification
- **Code quality** standards
- **Documentation** updates
- **Deployment** considerations
- **QA testing** instructions

## 🔧 Branch Protection Setup

### Automatic Setup (Recommended)

```bash
# Using GitHub CLI
gh auth login
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI / build (18.x)","CI / build (20.x)","QA Automation / Quick QA Tests","QA Validation / Critical QA Tests","QA Validation / Comprehensive QA Tests"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

### Manual Setup

See `.github/branch-protection.md` for detailed manual setup instructions.

## Emergency Procedures

### Hotfix Process

1. **Create hotfix branch** from main: `git checkout -b hotfix/critical-fix`
2. **Make minimal changes** to address the issue
3. **Create PR** with `[HOTFIX]` in title
4. **Fast-track review** with senior team member
5. **Merge after critical tests** pass (may skip comprehensive tests)
6. **Follow up** with full testing and documentation

### Branch Protection Bypass

Repository administrators can temporarily disable protection for emergency deployments:

1. **Disable protection** in GitHub settings
2. **Make direct push** to main
3. **Re-enable protection** immediately
4. **Create follow-up PR** for documentation and testing

## Monitoring and Metrics

### Success Metrics

- **PR merge time**: Target < 24 hours for standard PRs
- **Test success rate**: Target > 95% for comprehensive tests
- **Review coverage**: 100% of PRs reviewed before merge
- **Hotfix frequency**: Monitor and minimize emergency bypasses

### Quality Gates

- **Code coverage**: Maintain > 80% test coverage
- **Linting**: Zero linting errors allowed
- **Security**: No high/critical security vulnerabilities
- **Performance**: CLI generation time < 45 seconds

## Best Practices

### For Developers

- **Small PRs**: Keep changes focused and reviewable
- **Clear descriptions**: Use PR template thoroughly
- **Test locally**: Run `npm test` before pushing
- **Stay current**: Rebase feature branches regularly
- **Draft PRs**: Use for work-in-progress to avoid CI costs

### For Reviewers

- **Timely reviews**: Respond within 24 hours
- **Constructive feedback**: Focus on code quality and maintainability
- **Test understanding**: Verify test coverage and edge cases
- **Documentation**: Ensure changes are properly documented

### For Maintainers

- **Monitor CI costs**: Track GitHub Actions usage
- **Update dependencies**: Keep CI/CD tools current
- **Review metrics**: Analyze PR and test success rates
- **Adjust thresholds**: Fine-tune test timeouts and requirements

## Technical Implementation

### Git Hooks Overview

The local branch protection is implemented using [Husky](https://typicode.github.io/husky/) git hooks:

#### Pre-Commit Hook (`.husky/pre-commit`)

- **Checks current branch** using `git rev-parse --abbrev-ref HEAD`
- **Blocks commits to main** with clear error message and instructions
- **Runs fast tests** on feature branches only (unit tests)
- **Provides immediate feedback** without expensive operations

#### Pre-Push Hook (`.husky/pre-push`)

- **Checks current branch** before push operations
- **Blocks pushes to main** with clear error message and instructions
- **Runs comprehensive validation** on feature branches (linting, testing, QA)
- **Skippable** with `SKIP_PREPUSH=1 git push` for emergencies

### Hook Behavior

| Branch Type | Pre-Commit     | Pre-Push           |
| ----------- | -------------- | ------------------ |
| `main`      | 🚫 **BLOCKED** | 🚫 **BLOCKED**     |
| `feature/*` | ✅ Fast tests  | ✅ Full validation |
| `fix/*`     | ✅ Fast tests  | ✅ Full validation |
| `docs/*`    | ✅ Fast tests  | ✅ Full validation |

### Benefits

- **Early prevention** - Stops issues before they reach GitHub
- **Resource efficiency** - No expensive tests on blocked operations
- **Clear guidance** - Users know exactly what to do next
- **Consistent enforcement** - Works regardless of GitHub settings
- **Developer friendly** - Preserves staged changes for easy recovery

### Troubleshooting

#### Hook Not Working

```bash
# Reinstall husky hooks
npm run prepare
```

#### Emergency Bypass (Maintainers Only)

```bash
# Skip pre-push validation
SKIP_PREPUSH=1 git push origin main

# Or temporarily disable hooks
git config core.hooksPath /dev/null
git push origin main
git config --unset core.hooksPath
```

#### Updating Hook Logic

Hooks are located in `.husky/` directory:

- `.husky/pre-commit` - Commit-time validation
- `.husky/pre-push` - Push-time validation

After modifying hooks, test with:

```bash
# Test pre-commit
git add . && git commit -m "test"

# Test pre-push
git push origin feature-branch
```
