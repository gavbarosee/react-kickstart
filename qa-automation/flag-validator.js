#!/usr/bin/env node

/**
 * Individual Flag Validator for React Kickstart CLI
 * Tests that each CLI flag works independently to generate valid projects
 * Focuses on flag-only validation rather than comprehensive combinations
 */

import { execSync, spawn } from "child_process";
import { readFileSync, existsSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { performance } from "perf_hooks";
import { fileURLToPath } from "url";

class FlagValidator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.testDir = options.testDir || "qa-flag-tests";
    this.timeoutMs = options.timeoutMs || 120000; // 2 minutes per test
    this.results = [];
    this.startTime = Date.now();
    this.skipInstall = options.skipInstall !== undefined ? options.skipInstall : true;
  }

  /**
   * Define all individual flag tests
   * Each test validates a single flag or flag combination works independently
   */
  getFlagTests() {
    return [
      // Framework flags
      {
        name: "framework-vite",
        description: "Test --framework vite flag",
        flags: ["--yes", "--framework", "vite", "--skip-install", "--no-autostart"],
        expectedConfig: { framework: "vite" },
      },
      {
        name: "framework-nextjs",
        description: "Test --framework nextjs flag",
        flags: ["--yes", "--framework", "nextjs", "--skip-install", "--no-autostart"],
        expectedConfig: { framework: "nextjs" },
      },

      // TypeScript flags
      {
        name: "typescript-enabled",
        description: "Test --typescript flag",
        flags: ["--yes", "--typescript", "--skip-install", "--no-autostart"],
        expectedConfig: { typescript: true },
      },
      {
        name: "typescript-disabled",
        description: "Test --no-typescript flag",
        flags: ["--yes", "--no-typescript", "--skip-install", "--no-autostart"],
        expectedConfig: { typescript: false },
      },

      // Styling flags
      {
        name: "styling-tailwind",
        description: "Test --styling tailwind flag",
        flags: ["--yes", "--styling", "tailwind", "--skip-install", "--no-autostart"],
        expectedConfig: { styling: "tailwind" },
      },
      {
        name: "styling-styled-components",
        description: "Test --styling styled-components flag",
        flags: [
          "--yes",
          "--styling",
          "styled-components",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { styling: "styled-components" },
      },
      {
        name: "styling-css",
        description: "Test --styling css flag",
        flags: ["--yes", "--styling", "css", "--skip-install", "--no-autostart"],
        expectedConfig: { styling: "css" },
      },

      // State management flags
      {
        name: "state-redux",
        description: "Test --state redux flag",
        flags: ["--yes", "--state", "redux", "--skip-install", "--no-autostart"],
        expectedConfig: { stateManagement: "redux" },
      },
      {
        name: "state-zustand",
        description: "Test --state zustand flag",
        flags: ["--yes", "--state", "zustand", "--skip-install", "--no-autostart"],
        expectedConfig: { stateManagement: "zustand" },
      },
      {
        name: "state-none",
        description: "Test --state none flag",
        flags: ["--yes", "--state", "none", "--skip-install", "--no-autostart"],
        expectedConfig: { stateManagement: "none" },
      },

      // API flags
      {
        name: "api-axios-react-query",
        description: "Test --api axios-react-query flag",
        flags: [
          "--yes",
          "--api",
          "axios-react-query",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { api: "axios-react-query" },
      },
      {
        name: "api-axios-only",
        description: "Test --api axios-only flag",
        flags: ["--yes", "--api", "axios-only", "--skip-install", "--no-autostart"],
        expectedConfig: { api: "axios-only" },
      },
      {
        name: "api-fetch-react-query",
        description: "Test --api fetch-react-query flag",
        flags: [
          "--yes",
          "--api",
          "fetch-react-query",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { api: "fetch-react-query" },
      },
      {
        name: "api-fetch-only",
        description: "Test --api fetch-only flag",
        flags: ["--yes", "--api", "fetch-only", "--skip-install", "--no-autostart"],
        expectedConfig: { api: "fetch-only" },
      },
      {
        name: "api-none",
        description: "Test --api none flag",
        flags: ["--yes", "--api", "none", "--skip-install", "--no-autostart"],
        expectedConfig: { api: "none" },
      },

      // Testing flags
      {
        name: "testing-vitest",
        description: "Test --testing vitest flag",
        flags: ["--yes", "--testing", "vitest", "--skip-install", "--no-autostart"],
        expectedConfig: { testing: "vitest" },
      },
      {
        name: "testing-jest",
        description: "Test --testing jest flag",
        flags: ["--yes", "--testing", "jest", "--skip-install", "--no-autostart"],
        expectedConfig: { testing: "jest" },
      },
      {
        name: "testing-none",
        description: "Test --testing none flag",
        flags: ["--yes", "--testing", "none", "--skip-install", "--no-autostart"],
        expectedConfig: { testing: "none" },
      },

      // Routing flags (Vite-specific)
      {
        name: "routing-react-router",
        description: "Test --routing react-router flag (Vite)",
        flags: [
          "--yes",
          "--framework",
          "vite",
          "--routing",
          "react-router",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { framework: "vite", routing: "react-router" },
      },
      {
        name: "routing-none-vite",
        description: "Test --routing none flag (Vite)",
        flags: [
          "--yes",
          "--framework",
          "vite",
          "--routing",
          "none",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { framework: "vite", routing: "none" },
      },

      // Next.js routing flags
      {
        name: "next-routing-app",
        description: "Test --next-routing app flag (Next.js)",
        flags: [
          "--yes",
          "--framework",
          "nextjs",
          "--next-routing",
          "app",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { framework: "nextjs", nextRouting: "app" },
      },
      {
        name: "next-routing-pages",
        description: "Test --next-routing pages flag (Next.js)",
        flags: [
          "--yes",
          "--framework",
          "nextjs",
          "--next-routing",
          "pages",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { framework: "nextjs", nextRouting: "pages" },
      },

      // Package manager flags
      {
        name: "package-manager-npm",
        description: "Test --package-manager npm flag",
        flags: [
          "--yes",
          "--package-manager",
          "npm",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { packageManager: "npm" },
      },
      {
        name: "package-manager-yarn",
        description: "Test --package-manager yarn flag",
        flags: [
          "--yes",
          "--package-manager",
          "yarn",
          "--skip-install",
          "--no-autostart",
        ],
        expectedConfig: { packageManager: "yarn" },
      },

      // Boolean flags
      {
        name: "no-linting",
        description: "Test --no-linting flag",
        flags: ["--yes", "--no-linting", "--skip-install", "--no-autostart"],
        expectedConfig: { linting: false },
      },
      {
        name: "no-git",
        description: "Test --no-git flag",
        flags: ["--yes", "--no-git", "--skip-install", "--no-autostart"],
        expectedConfig: { initGit: false },
      },
      {
        name: "no-summary",
        description: "Test --no-summary flag",
        flags: ["--yes", "--no-summary", "--skip-install", "--no-autostart"],
        expectedConfig: { summary: false },
      },
      {
        name: "skip-install",
        description: "Test --skip-install flag",
        flags: ["--yes", "--skip-install", "--no-autostart"],
        expectedConfig: { skipInstall: true },
      },
      {
        name: "no-autostart",
        description: "Test --no-autostart flag",
        flags: ["--yes", "--skip-install", "--no-autostart"],
        expectedConfig: { autostart: false },
      },

      // Deployment flags
      {
        name: "deployment-vercel",
        description: "Test --deployment vercel flag",
        flags: ["--yes", "--deployment", "vercel", "--skip-install", "--no-autostart"],
        expectedConfig: { deployment: "vercel" },
      },
      {
        name: "deployment-netlify",
        description: "Test --deployment netlify flag",
        flags: ["--yes", "--deployment", "netlify", "--skip-install", "--no-autostart"],
        expectedConfig: { deployment: "netlify" },
      },
      {
        name: "deployment-none",
        description: "Test --deployment none flag",
        flags: ["--yes", "--deployment", "none", "--skip-install", "--no-autostart"],
        expectedConfig: { deployment: "none" },
      },

      // Alias flags
      {
        name: "yes-alias",
        description: "Test -y (--yes alias) flag",
        flags: ["-y", "--skip-install", "--no-autostart"],
        expectedConfig: { yes: true },
      },
      {
        name: "framework-alias",
        description: "Test -f (--framework alias) flag",
        flags: ["-y", "-f", "nextjs", "--skip-install", "--no-autostart"],
        expectedConfig: { framework: "nextjs" },
      },
    ];
  }

  /**
   * Run a single flag test
   */
  async runSingleFlagTest(flagTest, index) {
    const testName = `flag-${flagTest.name}`;
    const testDirPath = join(process.cwd(), this.testDir);
    const projectPath = join(testDirPath, testName);
    const startTime = performance.now();

    try {
      this.log(`\n🧪 Running flag test ${index + 1}: ${flagTest.name}`);
      this.log(`   Description: ${flagTest.description}`);
      this.log(`   Flags: ${flagTest.flags.join(" ")}`);

      // Create test directory and clean up any existing project
      mkdirSync(testDirPath, { recursive: true });
      if (existsSync(projectPath)) {
        rmSync(projectPath, { recursive: true, force: true });
      }

      // Build CLI command
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const repoRoot = resolve(__dirname, "..");
      const cliPath = resolve(repoRoot, "bin/react-kickstart.js");

      const cliArgs = [cliPath, testName, ...flagTest.flags];
      const command = `node ${cliArgs.join(" ")}`;

      // Run the CLI command with timeout
      const result = await this.runWithTimeout(
        command,
        {
          COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
          CI: "true",
          NODE_ENV: "test",
        },
        this.timeoutMs,
        testDirPath,
      );

      // Validate the generated project
      const validationResult = await this.validateFlagTest(projectPath, flagTest, {
        skipInstall: this.skipInstall,
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Determine if test succeeded
      const success = this.computeFlagTestSuccess(validationResult, flagTest);

      const testResult = {
        testName,
        flagTest: flagTest.name,
        description: flagTest.description,
        flags: flagTest.flags,
        expectedConfig: flagTest.expectedConfig,
        success,
        duration,
        validation: validationResult,
        output: result.stdout,
        error: success
          ? null
          : {
              message: "Flag validation failed",
              issues: validationResult.issues,
            },
      };

      this.log(
        `   ${success ? "✅" : "❌"} Flag test ${
          success ? "passed" : "failed"
        } in ${duration}ms${!success ? `: ${validationResult.issues.join(", ")}` : ""}`,
      );

      return testResult;
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const testResult = {
        testName,
        flagTest: flagTest.name,
        description: flagTest.description,
        flags: flagTest.flags,
        expectedConfig: flagTest.expectedConfig,
        success: false,
        duration,
        validation: null,
        output: error.stdout || "",
        error: {
          message: error.message,
          stderr: error.stderr || "",
          code: error.code,
        },
      };

      this.log(`   ❌ Flag test failed in ${duration}ms: ${error.message}`);
      return testResult;
    }
  }

  /**
   * Validate that a flag test generated the expected configuration
   */
  async validateFlagTest(projectPath, flagTest, options = {}) {
    const validation = {
      projectExists: false,
      packageJsonExists: false,
      packageJsonValid: false,
      expectedDependencies: false,
      configurationMatches: false,
      issues: [],
    };

    try {
      // Check if project directory exists
      validation.projectExists = existsSync(projectPath);
      if (!validation.projectExists) {
        validation.issues.push("Project directory was not created");
        return validation;
      }

      // Check package.json
      const packageJsonPath = join(projectPath, "package.json");
      validation.packageJsonExists = existsSync(packageJsonPath);

      if (validation.packageJsonExists) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
          validation.packageJsonValid = true;

          // Validate flag-specific expectations
          await this.validateFlagExpectations(
            projectPath,
            packageJson,
            flagTest,
            validation,
          );
        } catch (error) {
          validation.issues.push(`Invalid package.json: ${error.message}`);
        }
      } else {
        validation.issues.push("package.json not found");
      }

      // Check for framework-specific files
      await this.validateFrameworkFiles(projectPath, flagTest, validation);
    } catch (error) {
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Validate flag-specific expectations
   */
  async validateFlagExpectations(projectPath, packageJson, flagTest, validation) {
    const expected = flagTest.expectedConfig;

    // Check TypeScript configuration
    if (expected.typescript !== undefined) {
      const hasTsConfig = existsSync(join(projectPath, "tsconfig.json"));
      const hasTsDeps =
        packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript;

      if (expected.typescript && (!hasTsConfig || !hasTsDeps)) {
        validation.issues.push("TypeScript expected but not properly configured");
      } else if (!expected.typescript && hasTsConfig) {
        validation.issues.push("TypeScript not expected but tsconfig.json found");
      }
    }

    // Check styling dependencies
    if (expected.styling) {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (expected.styling === "tailwind" && !allDeps.tailwindcss) {
        validation.issues.push("Tailwind expected but tailwindcss dependency missing");
      } else if (
        expected.styling === "styled-components" &&
        !allDeps["styled-components"]
      ) {
        validation.issues.push("Styled-components expected but dependency missing");
      }
    }

    // Check state management dependencies
    if (expected.stateManagement) {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (
        expected.stateManagement === "redux" &&
        (!allDeps["@reduxjs/toolkit"] || !allDeps["react-redux"])
      ) {
        validation.issues.push("Redux expected but dependencies missing");
      } else if (expected.stateManagement === "zustand" && !allDeps.zustand) {
        validation.issues.push("Zustand expected but dependency missing");
      }
    }

    // Check API dependencies
    if (expected.api) {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (expected.api.includes("axios") && !allDeps.axios) {
        validation.issues.push("Axios expected but dependency missing");
      }
      if (expected.api.includes("react-query") && !allDeps["@tanstack/react-query"]) {
        validation.issues.push("React Query expected but dependency missing");
      }
    }

    // Check testing dependencies
    if (expected.testing) {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (expected.testing === "vitest" && !allDeps.vitest) {
        validation.issues.push("Vitest expected but dependency missing");
      } else if (expected.testing === "jest" && !allDeps.jest) {
        validation.issues.push("Jest expected but dependency missing");
      }
    }

    // Check routing dependencies
    if (expected.routing === "react-router") {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (!allDeps["react-router-dom"]) {
        validation.issues.push("React Router expected but dependency missing");
      }
    }

    validation.expectedDependencies = validation.issues.length === 0;
    validation.configurationMatches = validation.issues.length === 0;
  }

  /**
   * Validate framework-specific files exist
   */
  async validateFrameworkFiles(projectPath, flagTest, validation) {
    const expected = flagTest.expectedConfig;

    if (expected.framework === "vite") {
      const viteConfigExists =
        existsSync(join(projectPath, "vite.config.js")) ||
        existsSync(join(projectPath, "vite.config.ts"));
      if (!viteConfigExists) {
        validation.issues.push("Vite config file missing");
      }

      const srcExists = existsSync(join(projectPath, "src"));
      if (!srcExists) {
        validation.issues.push("Vite src directory missing");
      }
    } else if (expected.framework === "nextjs") {
      const nextConfigExists =
        existsSync(join(projectPath, "next.config.js")) ||
        existsSync(join(projectPath, "next.config.mjs"));
      if (!nextConfigExists) {
        validation.issues.push("Next.js config file missing");
      }

      // Check for appropriate directory structure
      const hasApp = existsSync(join(projectPath, "app"));
      const hasPages = existsSync(join(projectPath, "pages"));
      const hasSrc = existsSync(join(projectPath, "src"));

      if (!hasApp && !hasPages && !hasSrc) {
        validation.issues.push("Next.js directory structure missing");
      }

      // Validate routing structure matches expectation
      if (
        expected.nextRouting === "app" &&
        !hasApp &&
        !existsSync(join(projectPath, "src/app"))
      ) {
        validation.issues.push("Next.js app router structure expected but not found");
      } else if (
        expected.nextRouting === "pages" &&
        !hasPages &&
        !existsSync(join(projectPath, "src/pages"))
      ) {
        validation.issues.push("Next.js pages router structure expected but not found");
      }
    }
  }

  /**
   * Run command with timeout
   */
  async runWithTimeout(
    command,
    environment = {},
    timeoutMs,
    workingDir = process.cwd(),
  ) {
    return new Promise((resolve, reject) => {
      const child = spawn("sh", ["-c", command], {
        env: { ...process.env, ...environment },
        stdio: ["pipe", "pipe", "pipe"],
        cwd: workingDir,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error(`Command timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      child.on("close", (code) => {
        clearTimeout(timeout);

        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          const error = new Error(`Command failed with code ${code}`);
          error.stdout = stdout;
          error.stderr = stderr;
          error.code = code;
          reject(error);
        }
      });

      child.on("error", (error) => {
        clearTimeout(timeout);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      });
    });
  }

  /**
   * Determine if flag test succeeded
   */
  computeFlagTestSuccess(validationResult, flagTest) {
    return (
      validationResult.projectExists &&
      validationResult.packageJsonExists &&
      validationResult.packageJsonValid &&
      validationResult.configurationMatches &&
      validationResult.issues.length === 0
    );
  }

  /**
   * Run all flag tests
   */
  async runAllFlagTests() {
    this.log(`\n🚀 Starting individual flag validation tests`);

    const flagTests = this.getFlagTests();
    this.log(`📋 Running ${flagTests.length} flag tests`);

    // Create test directory
    mkdirSync(this.testDir, { recursive: true });

    // Run tests sequentially to avoid conflicts
    const results = [];
    for (let i = 0; i < flagTests.length; i++) {
      const result = await this.runSingleFlagTest(flagTests[i], i);
      results.push(result);
    }

    this.results = results;
    return results;
  }

  /**
   * Generate flag validation report
   */
  generateReport() {
    const successful = this.results.filter((r) => r.success);
    const failed = this.results.filter((r) => !r.success);
    const totalDuration = Date.now() - this.startTime;

    const report = {
      summary: {
        total: this.results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: `${Math.round((successful.length / this.results.length) * 100)}%`,
        totalDuration: `${Math.round(totalDuration / 1000)}s`,
        averageDuration: `${Math.round(
          this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
        )}ms`,
      },
      results: this.results,
      failedTests: failed.map((r) => ({
        testName: r.testName,
        flagTest: r.flagTest,
        description: r.description,
        flags: r.flags,
        expectedConfig: r.expectedConfig,
        error: r.error?.message,
        issues: r.validation?.issues || [],
      })),
      flagCoverage: this.analyzeFlagCoverage(),
    };

    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportsDir = "reports";
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = `reports/flag-validation-report-${timestamp}.json`;
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log("\n🏁 FLAG VALIDATION RESULTS");
    console.log("═".repeat(50));
    console.log(`Total Flag Tests: ${report.summary.total}`);
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    console.log(`⏱️  Total Duration: ${report.summary.totalDuration}`);
    console.log(`⚡ Average Duration: ${report.summary.averageDuration}`);
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);

    if (failed.length > 0) {
      console.log("\n❌ FAILED FLAG TESTS:");
      failed.forEach((test) => {
        console.log(`   ${test.flagTest}: ${test.error?.message || "Unknown error"}`);
        if (test.validation?.issues?.length > 0) {
          test.validation.issues.forEach((issue) => {
            console.log(`     - ${issue}`);
          });
        }
      });
    }

    console.log("\n🎯 FLAG COVERAGE:");
    Object.entries(report.flagCoverage).forEach(([category, flags]) => {
      console.log(`   ${category}: ${flags.join(", ")}`);
    });

    return report;
  }

  /**
   * Analyze which flags were tested
   */
  analyzeFlagCoverage() {
    const coverage = {
      framework: [],
      language: [],
      styling: [],
      state: [],
      api: [],
      testing: [],
      routing: [],
      packageManager: [],
      boolean: [],
      deployment: [],
      aliases: [],
    };

    this.results.forEach((result) => {
      const flags = result.flags;

      if (flags.includes("--framework") || flags.includes("-f")) {
        const framework =
          flags[flags.indexOf("--framework") + 1] || flags[flags.indexOf("-f") + 1];
        if (framework && !coverage.framework.includes(framework)) {
          coverage.framework.push(framework);
        }
      }

      if (flags.includes("--typescript")) coverage.language.push("--typescript");
      if (flags.includes("--no-typescript")) coverage.language.push("--no-typescript");

      if (flags.includes("--styling")) {
        const styling = flags[flags.indexOf("--styling") + 1];
        if (styling && !coverage.styling.includes(styling)) {
          coverage.styling.push(styling);
        }
      }

      if (flags.includes("--state")) {
        const state = flags[flags.indexOf("--state") + 1];
        if (state && !coverage.state.includes(state)) {
          coverage.state.push(state);
        }
      }

      if (flags.includes("--api")) {
        const api = flags[flags.indexOf("--api") + 1];
        if (api && !coverage.api.includes(api)) {
          coverage.api.push(api);
        }
      }

      if (flags.includes("--testing")) {
        const testing = flags[flags.indexOf("--testing") + 1];
        if (testing && !coverage.testing.includes(testing)) {
          coverage.testing.push(testing);
        }
      }

      if (flags.includes("--routing")) {
        const routing = flags[flags.indexOf("--routing") + 1];
        if (routing && !coverage.routing.includes(routing)) {
          coverage.routing.push(routing);
        }
      }

      if (flags.includes("--next-routing")) {
        const nextRouting = flags[flags.indexOf("--next-routing") + 1];
        if (nextRouting && !coverage.routing.includes(`next-${nextRouting}`)) {
          coverage.routing.push(`next-${nextRouting}`);
        }
      }

      if (flags.includes("--package-manager")) {
        const pm = flags[flags.indexOf("--package-manager") + 1];
        if (pm && !coverage.packageManager.includes(pm)) {
          coverage.packageManager.push(pm);
        }
      }

      if (flags.includes("--deployment")) {
        const deployment = flags[flags.indexOf("--deployment") + 1];
        if (deployment && !coverage.deployment.includes(deployment)) {
          coverage.deployment.push(deployment);
        }
      }

      // Boolean flags
      const booleanFlags = [
        "--no-linting",
        "--no-git",
        "--no-summary",
        "--skip-install",
        "--no-autostart",
      ];
      booleanFlags.forEach((flag) => {
        if (flags.includes(flag) && !coverage.boolean.includes(flag)) {
          coverage.boolean.push(flag);
        }
      });

      // Aliases
      if (flags.includes("-y")) coverage.aliases.push("-y");
      if (flags.includes("-f")) coverage.aliases.push("-f");
    });

    return coverage;
  }

  /**
   * Clean up test projects
   */
  cleanup() {
    if (existsSync(this.testDir)) {
      this.log(`\n🧹 Cleaning up test directory: ${this.testDir}`);
      rmSync(this.testDir, { recursive: true, force: true });
    }
  }

  /**
   * Log with optional verbose mode
   */
  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose");
  const noCleanup = args.includes("--no-cleanup");

  const validator = new FlagValidator({
    verbose: true, // Always show output for flag validation
    timeoutMs: 120000, // 2 minutes per test
    skipInstall: true, // Focus on structure validation
  });

  try {
    const results = await validator.runAllFlagTests();
    const report = validator.generateReport();

    if (!noCleanup) {
      validator.cleanup();
    }

    // Exit with error code if any flag tests failed
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Flag validator failed:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FlagValidator };
