#!/bin/bash

# Setup Release Automation Script
# This script helps configure NPM token and test the release workflow

set -e

echo "🚀 React Kickstart - Release Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check if semantic-release is installed
if ! npm list semantic-release > /dev/null 2>&1; then
    echo "❌ Error: semantic-release not installed. Run 'npm install' first."
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Step 1: NPM Token Setup
echo "📦 Step 1: NPM Token Setup"
echo "========================="
echo ""
echo "You need to create an NPM automation token and add it to GitHub secrets."
echo ""
echo "1. Create NPM token:"
echo "   npm login"
echo "   npm token create --type=automation"
echo ""
echo "2. Add to GitHub secrets:"
echo "   - Go to: https://github.com/gavbarosee/react-kickstart/settings/secrets/actions"
echo "   - Click 'New repository secret'"
echo "   - Name: NPM_TOKEN"
echo "   - Value: [your automation token]"
echo ""

read -p "Have you completed the NPM token setup? (y/n): " npm_setup
if [ "$npm_setup" != "y" ]; then
    echo "⏸️  Setup paused. Complete NPM token setup and run this script again."
    exit 0
fi

echo "✅ NPM token setup confirmed"
echo ""

# Step 2: Test semantic-release locally
echo "🧪 Step 2: Test Semantic Release (Dry Run)"
echo "=========================================="
echo ""
echo "Running semantic-release in dry-run mode to test configuration..."
echo ""

if npx semantic-release --dry-run; then
    echo "✅ Semantic-release configuration is valid"
else
    echo "❌ Semantic-release configuration has issues"
    echo "Check the output above for errors"
    exit 1
fi

echo ""

# Step 3: Verify GitHub Actions
echo "🔧 Step 3: Verify GitHub Actions"
echo "==============================="
echo ""
echo "Checking GitHub Actions workflows..."

if [ -f ".github/workflows/release.yml" ]; then
    echo "✅ Release workflow found"
else
    echo "❌ Release workflow missing"
    exit 1
fi

if [ -f ".github/workflows/ci.yml" ]; then
    echo "✅ CI workflow found"
else
    echo "❌ CI workflow missing"
    exit 1
fi

echo ""

# Step 4: Test commit message format
echo "📝 Step 4: Commit Message Format Test"
echo "===================================="
echo ""
echo "Testing conventional commit format..."

# Check if commitlint is available
if npx commitlint --version > /dev/null 2>&1; then
    echo "✅ Commitlint is configured"
    
    # Test some commit messages
    echo "Testing commit message formats:"
    
    echo "feat: add new feature" | npx commitlint && echo "  ✅ feat: format valid"
    echo "fix: resolve bug" | npx commitlint && echo "  ✅ fix: format valid"  
    echo "docs: update readme" | npx commitlint && echo "  ✅ docs: format valid"
    
else
    echo "⚠️  Commitlint not available, skipping format test"
fi

echo ""

# Step 5: Release workflow summary
echo "🎯 Step 5: Release Workflow Summary"
echo "=================================="
echo ""
echo "Your release system is now configured with:"
echo ""
echo "📋 Automatic Features:"
echo "  • Semantic versioning based on commit messages"
echo "  • Automatic changelog generation"
echo "  • NPM publishing on release"
echo "  • GitHub releases with notes"
echo "  • Version bumping in package.json"
echo ""
echo "🔒 Protection Features:"
echo "  • Full test suite validation before release"
echo "  • Matrix validation for version changes"
echo "  • Manual override for emergency releases"
echo "  • Automated issue creation for blocked releases"
echo ""
echo "📝 Commit Message Format:"
echo "  • feat: new features (minor version bump)"
echo "  • fix: bug fixes (patch version bump)"
echo "  • feat!: breaking changes (major version bump)"
echo "  • docs, style, refactor, test, chore: patch version bump"
echo ""
echo "🚀 Release Commands:"
echo "  • Automatic: git commit -m 'feat: new feature' && git push"
echo "  • Force: gh workflow run release.yml -f force_release=true"
echo "  • Matrix validation: gh workflow run full-matrix-validation.yml"
echo ""

# Step 6: Next steps
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Make a test commit with conventional format:"
echo "   git add ."
echo "   git commit -m 'docs: add automated release setup'"
echo "   git push origin main"
echo ""
echo "2. Monitor the release workflow:"
echo "   gh run list --workflow=release.yml"
echo ""
echo "3. Check your package on npm after release:"
echo "   npm view react-kickstart"
echo ""
echo "📚 Documentation:"
echo "  • Release guide: docs/deployment/automated-release-setup.md"
echo "  • Conventional commits: https://www.conventionalcommits.org/"
echo ""
echo "🎊 Your package is ready for automated releases!"
