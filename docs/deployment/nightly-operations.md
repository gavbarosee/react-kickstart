# Nightly Operations & Automated Checks

This document describes the automated nightly operations, sanity checks, smoke tests, and security validations that run to ensure the project remains healthy and secure.

## Overview

The project runs several automated checks on a nightly basis to:

- **Validate System Health**: Ensure all 8,640 configuration combinations still work
- **Monitor Performance**: Track CLI performance benchmarks over time
- **Security Scanning**: Check for vulnerabilities and security issues
- **Quality Assurance**: Run comprehensive test suites
- **Dependency Health**: Monitor for outdated or vulnerable dependencies

## Nightly Validation Schedule

### Full Matrix Validation

**Schedule**: Daily at 2:00 AM UTC  
**Workflow**: `.github/workflows/full-matrix-validation.yml`  
**Duration**: 2-4 hours  
**Configurations Tested**: 8,640 total

```yaml
schedule:
  - cron: "0 2 * * *" # 2 AM UTC daily
```

**What it validates**:

- All framework combinations (Vite, Next.js)
- All TypeScript configurations
- All styling options (Tailwind, CSS Modules, etc.)
- All state management options (Redux, Zustand, Context)
- All testing presets (Vitest, Jest, Playwright)
- All package manager combinations (npm, yarn)
- All routing configurations
- All linting and formatting setups

**Success Criteria**:

- ✅ All 8,640 configurations generate successfully
- ✅ All generated projects build without errors
- ✅ All generated projects pass linting
- ✅ No critical vulnerabilities in dependencies
- ✅ Performance benchmarks within acceptable ranges

## Security Checks

### Dependency Vulnerability Scanning

**Automated Detection**: During every project generation, the CLI automatically:

1. **Parses npm/yarn audit output** for vulnerabilities
2. **Categorizes by severity**: Low, Moderate, High, Critical
3. **Reports in test results** with detailed breakdown
4. **Blocks releases** if critical vulnerabilities are found

```javascript
// Example vulnerability detection
function parseVulnerabilities(output, packageManager) {
  const severityPatterns = [
    { pattern: /(\d+) low/i, severity: "low" },
    { pattern: /(\d+) moderate/i, severity: "moderate" },
    { pattern: /(\d+) high/i, severity: "high" },
    { pattern: /(\d+) critical/i, severity: "critical" },
  ];
  // ... parsing logic
}
```

### Security Monitoring Gaps

**⚠️ Currently Missing** (Recommendations for implementation):

1. **Dependabot Configuration**

   ```yaml
   # .github/dependabot.yml (RECOMMENDED)
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 5
   ```

2. **CodeQL Security Scanning**

   ```yaml
   # .github/workflows/security.yml (RECOMMENDED)
   name: Security Scan
   on:
     schedule:
       - cron: "0 3 * * 1" # Weekly Monday 3 AM
   jobs:
     codeql:
       uses: github/codeql-action/analyze@v2
   ```

3. **Supply Chain Security**
   - npm audit in CI/CD pipelines
   - License compliance checking
   - SBOM (Software Bill of Materials) generation

## Smoke Tests & Sanity Checks

### Quick Validation (Every Push/PR)

**Duration**: ~10 minutes  
**Scope**: Critical functionality validation

**Tests Include**:

- Flag validation tests (`npm run test:flags`)
- Feature validation tests (`npm run test:features`)
- Quick QA tests (5 critical configurations)
- Unit test suite with coverage
- Linting and formatting checks

### Critical Configuration Tests (Main Branch)

**Duration**: ~30 minutes  
**Scope**: 20 most important configuration combinations

**Validates**:

- Most popular framework combinations
- Common developer workflows
- Essential feature integrations
- Performance benchmarks

### Comprehensive Tests (Release Candidates)

**Duration**: ~60 minutes  
**Scope**: Extended test coverage before releases

**Includes**:

- All critical configurations (unlimited)
- 25 standard configurations
- 10 edge case configurations
- Performance regression testing
- Cross-platform compatibility

## Performance Monitoring

### CLI Performance Benchmarks

**Schedule**: After every main branch push  
**Metrics Tracked**:

```bash
# Benchmark each framework 3 times, measure average
for framework in "vite" "nextjs"; do
  # Measure project generation time
  # Track dependency installation time
  # Monitor build performance
  # Validate startup time
done
```

**Performance Thresholds**:

- Project generation: < 30 seconds
- Dependency installation: < 2 minutes
- Build time: < 1 minute
- Startup time: < 5 seconds

### Performance Regression Detection

**Automatic Alerts** when:

- Generation time increases >20%
- Build time increases >15%
- Bundle size increases >10%
- Memory usage increases >25%

## Quality Assurance Automation

### Test Matrix Categories

1. **Critical Tests** (4,976 configurations)
   - Most common developer setups
   - Popular framework combinations
   - Essential integrations

2. **Standard Tests** (3,360 configurations)
   - Broader coverage scenarios
   - Less common but valid combinations
   - Cross-feature compatibility

3. **Edge Tests** (304 configurations)
   - Unusual but supported setups
   - Boundary condition testing
   - Compatibility edge cases

### Validation Levels

**Level 1: Structure Validation**

- Project files created correctly
- Package.json has required fields
- Dependencies are properly declared
- Configuration files are valid

**Level 2: Build Validation**

- Project builds without errors
- No TypeScript compilation errors
- Linting passes successfully
- Tests can be executed

**Level 3: Runtime Validation**

- Application starts successfully
- Routes work correctly (if applicable)
- State management functions
- API integrations work

## Monitoring & Alerting

### GitHub Issues Auto-Creation

**Matrix Validation Failures**:

```yaml
# Auto-creates issues when nightly validation fails
title: "🚨 Nightly Matrix Validation Failed - [DATE]"
labels: ["critical", "nightly-failure", "investigation-needed"]
assignees: [maintainers]
```

**Performance Regressions**:

```yaml
title: "📊 Performance Regression Detected - [METRIC]"
labels: ["performance", "regression", "monitoring"]
```

**Security Vulnerabilities**:

```yaml
title: "🔒 Security Vulnerability Detected - [SEVERITY]"
labels: ["security", "vulnerability", "urgent"]
```

### Artifact Retention

**Test Results**: 30 days retention

- Full matrix validation reports
- Performance benchmark data
- Security scan results
- Coverage reports

**Quick Tests**: 3 days retention

- PR validation results
- Quick smoke test outputs
- Development artifacts

## Failure Response Procedures

### Critical Failure (>10% configurations failing)

1. **Immediate**: Auto-block all releases
2. **Alert**: Create high-priority GitHub issue
3. **Notify**: Alert maintainers via configured channels
4. **Action**: Investigate and fix within 24 hours

### Performance Regression (>20% degradation)

1. **Document**: Create performance regression issue
2. **Analyze**: Compare with baseline metrics
3. **Investigate**: Identify root cause
4. **Fix**: Implement performance improvements

### Security Vulnerability (High/Critical)

1. **Block**: Prevent new releases immediately
2. **Assess**: Evaluate impact and severity
3. **Patch**: Apply security fixes
4. **Validate**: Re-run security scans
5. **Release**: Emergency patch release if needed

## Configuration Files

### Matrix Validation

- **Generator**: `qa-automation/test-matrix-generator.js`
- **Runner**: `qa-automation/test-runner.js`
- **Configs**: `qa-automation/test-configs/*.json`
- **Reports**: `qa-automation/reports/test-report-*.json`

### Performance Benchmarks

- **Metrics**: Stored in workflow artifacts
- **Baselines**: Tracked in repository history
- **Thresholds**: Defined in workflow files

## Maintenance Commands

```bash
# Run nightly validation manually
gh workflow run full-matrix-validation.yml

# Check latest validation status
gh run list --workflow=full-matrix-validation.yml --limit=1

# View validation report
cat qa-automation/reports/test-report-*.json | jq '.summary'

# Run performance benchmarks
cd qa-automation && npm run test:critical

# Check for security vulnerabilities
npm audit --audit-level=high
```

## Recommendations for Enhancement

### Immediate Improvements

1. **Add Dependabot** for automated dependency updates
2. **Implement CodeQL** for static security analysis
3. **Add license compliance** checking
4. **Set up SBOM generation** for supply chain security

### Medium-term Enhancements

1. **Cross-platform testing** (Windows, macOS, Linux)
2. **Browser compatibility testing** for generated apps
3. **Accessibility testing** automation
4. **SEO validation** for generated projects

### Long-term Goals

1. **AI-powered test generation** for edge cases
2. **Predictive failure analysis** using historical data
3. **Automated performance optimization** suggestions
4. **Integration with external security services**

## Support & Troubleshooting

### Common Issues

**Matrix Validation Timeouts**:

- Check GitHub Actions runner capacity
- Verify test configurations are valid
- Review resource usage patterns

**Performance Regression False Positives**:

- Compare against multiple baseline runs
- Account for runner performance variations
- Validate measurement methodology

**Security Scan False Positives**:

- Review vulnerability details carefully
- Check if vulnerabilities affect generated code
- Validate fix availability and compatibility

### Getting Help

1. **Check workflow logs** in GitHub Actions
2. **Review test reports** in `qa-automation/reports/`
3. **Create issue** with `nightly-operations` label
4. **Contact maintainers** for urgent issues

---

_This document is automatically updated when nightly operations procedures change._
