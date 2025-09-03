#!/bin/bash

# Setup Branch Protection for React Kickstart
# This script configures branch protection rules for the main branch

set -e

echo "🔒 Setting up branch protection for React Kickstart..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📥 Install it from: https://cli.github.com/"
    echo "🍺 Or on macOS: brew install gh"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "🔑 Please authenticate with GitHub first:"
    echo "   gh auth login"
    exit 1
fi

# Get repository information
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
REPO_NAME=$(gh repo view --json name --jq '.name')

echo "📋 Repository: $REPO_OWNER/$REPO_NAME"
echo "🎯 Setting up protection for 'main' branch..."

# Required status checks
REQUIRED_CHECKS='[
  "CI / build (18.x)",
  "CI / build (20.x)", 
  "QA Automation / Quick QA Tests",
  "QA Validation / Critical QA Tests",
  "QA Validation / Comprehensive QA Tests"
]'

# Set up branch protection
gh api "repos/$REPO_OWNER/$REPO_NAME/branches/main/protection" \
  --method PUT \
  --field required_status_checks="{
    \"strict\": true,
    \"contexts\": $REQUIRED_CHECKS
  }" \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  }' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true

echo "✅ Branch protection configured successfully!"
echo ""
echo "🔒 Main branch is now protected with:"
echo "   • No direct pushes allowed"
echo "   • Pull requests required"
echo "   • At least 1 approval required"
echo "   • All CI checks must pass"
echo "   • Branches must be up to date"
echo "   • Conversations must be resolved"
echo ""
echo "🚀 Development workflow:"
echo "   1. Create feature branch: git checkout -b feature/your-feature"
echo "   2. Make changes and push: git push origin feature/your-feature"
echo "   3. Create PR via GitHub UI or: gh pr create"
echo "   4. Wait for reviews and CI checks"
echo "   5. Merge after approval and all checks pass"
echo ""
echo "📚 See docs/development/branch-protection-workflow.md for details"
