# Branch Protection Setup

This document outlines the branch protection rules that should be configured in the GitHub repository settings.

## Main Branch Protection Rules

Navigate to **Settings > Branches** in your GitHub repository and add the following protection rules for the `main` branch:

### Required Settings:

- ✅ **Restrict pushes that create files larger than 100MB**
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if CODEOWNERS file exists)
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks:**
    - `CI / build (18.x)`
    - `CI / build (20.x)`
    - `QA Automation / Quick QA Tests`
    - `QA Validation / Critical QA Tests`
    - `QA Validation / Comprehensive QA Tests` (runs automatically on PRs to main)
- ✅ **Require conversation resolution before merging**
- ✅ **Restrict pushes that create files larger than 100MB**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict pushes to matching branches**

### Optional but Recommended:

- ✅ **Require linear history** (prevents merge commits, forces rebase/squash)
- ✅ **Allow force pushes** → **Everyone** (for rebasing feature branches)
- ✅ **Allow deletions** → **Disabled**

## Automatic Setup via GitHub CLI

If you have GitHub CLI installed, you can set up branch protection automatically:

```bash
# Install GitHub CLI if not already installed
# brew install gh  # macOS
# Or follow instructions at https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Set up branch protection for main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI / build (18.x)","CI / build (20.x)","QA Automation / Quick QA Tests","QA Validation / Critical QA Tests","QA Validation / Comprehensive QA Tests"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Development Workflow

With branch protection enabled, the development workflow becomes:

1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Make changes and commit**: Regular development on feature branch
3. **Push feature branch**: `git push origin feature/your-feature-name`
4. **Create Pull Request**: Use GitHub UI or `gh pr create`
5. **CI runs automatically**: Light tests run on every commit to PR
6. **Request review**: At least 1 approval required
7. **Comprehensive tests**: Run automatically when PR is ready to merge
8. **Merge**: Only possible after all checks pass and approval received

## Emergency Procedures

In case of emergency deployments, repository administrators can:

1. Temporarily disable branch protection
2. Make direct push to main
3. Re-enable branch protection immediately after

**Note**: All emergency pushes should be followed up with a post-mortem and proper PR process for documentation.
