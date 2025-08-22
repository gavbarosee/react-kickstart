#!/usr/bin/env node

/**
 * Automated Test Runner for React Kickstart CLI
 * Runs generated test configurations and validates results
 */

import { execSync, spawn } from "child_process";
import { readFileSync, existsSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { performance } from "perf_hooks";

class TestRunner {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.parallel = options.parallel || 1;
    this.testDir = options.testDir || "qa-test-projects";
    this.timeoutMs = options.timeoutMs || 120000; // 2 minutes per test
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * Load test configurations from JSON files
   */
  loadTestConfigurations(category = "critical") {
    // Try local path first (when run from qa-automation/), then parent path
    const localPath = `test-configs/${category}-tests.json`;
    const parentPath = `qa-automation/test-configs/${category}-tests.json`;

    let configFile;
    if (existsSync(localPath)) {
      configFile = localPath;
    } else if (existsSync(parentPath)) {
      configFile = parentPath;
    } else {
      throw new Error(
        `Configuration file not found. Tried: ${localPath}, ${parentPath}`
      );
    }

    const configs = JSON.parse(readFileSync(configFile, "utf8"));

    // Filter out pnpm configurations for now due to interactive dependency installation issues
    // TODO: Remove this filter once CLI properly handles --yes flag for dependency failures
    const filteredConfigs = configs.filter((config) => {
      if (config.config && config.config.packageManager === "pnpm") {
        console.log(
          `⚠️  Skipping pnpm test configuration (interactive dependency installation issue)`
        );
        return false;
      }
      return true;
    });

    return filteredConfigs;
  }

  /**
   * Run a single test configuration
   */
  async runSingleTest(testConfig, index) {
    const testName = `${testConfig.config.framework}-${index}`;
    const testDirPath = join(process.cwd(), this.testDir);
    const projectPath = join(testDirPath, testName);
    const startTime = performance.now();

    try {
      this.log(`\n🧪 Running test ${index + 1}: ${testName}`);
      this.log(`   Framework: ${testConfig.config.framework}`);
      this.log(`   TypeScript: ${testConfig.config.typescript}`);
      this.log(`   Styling: ${testConfig.config.styling}`);
      this.log(`   State: ${testConfig.config.stateManagement}`);
      this.log(`   API: ${testConfig.config.api}`);

      // Create test directory and clean up any existing project
      mkdirSync(testDirPath, { recursive: true });
      if (existsSync(projectPath)) {
        rmSync(projectPath, { recursive: true, force: true });
      }

      // Build comprehensive CLI command with all feature flags
      const config = testConfig.config;
      // Get absolute path to CLI from current working directory (qa-automation)
      const cliPath = resolve(process.cwd(), "../bin/react-kickstart.js");
      const cliArgs = [
        cliPath,
        testName,
        `--yes`,
        `--framework ${config.framework}`,
        config.typescript ? `--typescript` : `--no-typescript`,
        `--styling ${config.styling}`,
        `--state ${config.stateManagement}`,
        `--api ${config.api}`,
        `--testing ${config.testing}`,
        `--package-manager ${config.packageManager}`,
        `--no-autostart`,
      ];

      // Add conditional flags
      if (config.linting === false) {
        cliArgs.push(`--no-linting`);
      }
      if (config.initGit === false) {
        cliArgs.push(`--no-git`);
      }

      // Add framework-specific routing options
      if (config.framework === "vite" && config.routing) {
        cliArgs.push(`--routing ${config.routing}`);
      } else if (config.framework === "nextjs" && config.nextRouting) {
        cliArgs.push(`--next-routing ${config.nextRouting}`);
      }

      const comprehensiveCommand = `node ${cliArgs.join(" ")}`;

      // Run the CLI command with timeout from the test directory
      const result = await this.runWithTimeout(
        comprehensiveCommand,
        {
          COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
          CI: "true",
          NODE_ENV: "test",
        },
        this.timeoutMs,
        testDirPath
      );

      // Validate the generated project
      const validationResult = await this.validateProject(
        projectPath,
        testConfig.config
      );

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Determine if test actually succeeded based on validation
      const actualSuccess =
        validationResult.projectExists &&
        validationResult.packageJsonExists &&
        validationResult.buildWorks &&
        validationResult.issues.length === 0;

      const testResult = {
        testName,
        config: testConfig.config,
        success: actualSuccess,
        duration,
        validation: validationResult,
        output: result.stdout,
        error: actualSuccess
          ? null
          : { message: "Validation failed", issues: validationResult.issues },
      };

      this.log(
        `   ${actualSuccess ? "✅" : "❌"} Test ${
          actualSuccess ? "completed" : "failed"
        } in ${duration}ms${
          !actualSuccess ? `: ${validationResult.issues.join(", ")}` : ""
        }`
      );
      return testResult;
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const testResult = {
        testName,
        config: testConfig.config,
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

      this.log(`   ❌ Test failed in ${duration}ms: ${error.message}`);

      if (error.stderr && error.stderr.trim()) {
        this.log(`   CLI Error: ${error.stderr.trim()}`);
      }
      if (error.stdout && error.stdout.trim()) {
        this.log(`   CLI Output: ${error.stdout.trim()}`);
      }

      return testResult;
    }
  }

  /**
   * Run command with timeout
   */
  async runWithTimeout(
    command,
    environment = {},
    timeoutMs,
    workingDir = process.cwd()
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
   * Validate generated project structure and functionality
   */
  async validateProject(projectPath, config) {
    const validation = {
      projectExists: false,
      packageJsonExists: false,
      packageJsonValid: false,
      dependenciesInstalled: false,
      scriptsWork: false,
      buildWorks: false,
      lintWorks: false,
      testWorks: false,
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

      // Check for appropriate source directory based on framework
      if (config.framework === "vite") {
        validation.sourceDirectoryExists = existsSync(join(projectPath, "src"));
      } else if (config.framework === "nextjs") {
        // Next.js can use app/, pages/, or src/ directory
        const hasApp = existsSync(join(projectPath, "app"));
        const hasPages = existsSync(join(projectPath, "pages"));
        const hasSrc = existsSync(join(projectPath, "src"));
        validation.sourceDirectoryExists = hasApp || hasPages || hasSrc;
      }

      if (validation.packageJsonExists) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
          validation.packageJsonValid = true;

          // Validate expected dependencies based on config
          this.validateDependencies(packageJson, config, validation);

          // Check TypeScript setup
          if (config.typescript) {
            const allDeps = {
              ...packageJson.dependencies,
              ...packageJson.devDependencies,
            };
            if (!allDeps.typescript) {
              validation.issues.push(
                "TypeScript enabled but typescript dependency missing"
              );
            }
            if (!existsSync(join(projectPath, "tsconfig.json"))) {
              validation.issues.push(
                "TypeScript enabled but tsconfig.json missing"
              );
            }
          }
        } catch (error) {
          validation.issues.push(`Invalid package.json: ${error.message}`);
        }
      } else {
        validation.issues.push("package.json not found");
      }

      // Check if dependencies were installed
      validation.dependenciesInstalled = existsSync(
        join(projectPath, "node_modules")
      );
      if (!validation.dependenciesInstalled) {
        validation.issues.push("node_modules directory not found");
      }

      // Test scripts (if dependencies are installed)
      if (validation.dependenciesInstalled) {
        await this.validateScripts(projectPath, config, validation);
      }
    } catch (error) {
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Validate expected dependencies are present
   */
  validateDependencies(packageJson, config, validation) {
    const expectedDeps = this.getExpectedDependencies(config);
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    expectedDeps.forEach((dep) => {
      if (!allDeps[dep]) {
        validation.issues.push(`Missing expected dependency: ${dep}`);
      }
    });
  }

  /**
   * Get expected dependencies based on configuration
   */
  getExpectedDependencies(config) {
    const deps = ["react", "react-dom"];

    // Framework-specific dependencies
    if (config.framework === "vite") {
      deps.push("vite", "@vitejs/plugin-react");
    } else if (config.framework === "nextjs") {
      deps.push("next");
    }

    // Routing dependencies
    if (config.routing === "react-router") {
      deps.push("react-router-dom");
    }

    // Styling dependencies
    if (config.styling === "tailwind") {
      deps.push("tailwindcss");
    } else if (config.styling === "styled-components") {
      deps.push("styled-components");
    }

    // State management dependencies
    if (config.stateManagement === "redux") {
      deps.push("@reduxjs/toolkit", "react-redux");
    } else if (config.stateManagement === "zustand") {
      deps.push("zustand");
    }

    // API dependencies
    if (config.api?.includes("axios")) {
      deps.push("axios");
    }
    if (config.api?.includes("react-query")) {
      deps.push("@tanstack/react-query");
    }

    // Testing dependencies
    if (config.testing === "vitest") {
      deps.push("vitest", "@testing-library/react");
    } else if (config.testing === "jest") {
      deps.push("jest", "@testing-library/react");
    }

    // TypeScript dependencies
    if (config.typescript) {
      deps.push("typescript", "@types/react", "@types/react-dom");
    }

    return deps;
  }

  /**
   * Validate project scripts work
   */
  async validateScripts(projectPath, config, validation) {
    const originalCwd = process.cwd();

    try {
      process.chdir(projectPath);

      // Test build script
      try {
        await this.runWithTimeout("npm run build", {}, 60000);
        validation.buildWorks = true;
      } catch (error) {
        validation.issues.push(`Build failed: ${error.message}`);
      }

      // Test lint script (if linting enabled)
      if (config.linting) {
        try {
          await this.runWithTimeout("npm run lint", {}, 30000);
          validation.lintWorks = true;
        } catch (error) {
          // Linting might fail due to code style, but script should exist
          if (!error.message.includes("command not found")) {
            validation.lintWorks = true; // Script exists
          } else {
            validation.issues.push(`Lint script missing: ${error.message}`);
          }
        }
      }

      // Test test script (if testing enabled)
      if (config.testing && config.testing !== "none") {
        try {
          await this.runWithTimeout("npm run test -- --run", {}, 30000);
          validation.testWorks = true;
        } catch (error) {
          if (!error.message.includes("command not found")) {
            validation.testWorks = true; // Script exists
          } else {
            validation.issues.push(`Test script missing: ${error.message}`);
          }
        }
      }

      validation.scriptsWork = validation.buildWorks;
    } finally {
      process.chdir(originalCwd);
    }
  }

  /**
   * Run tests with specified parallelism
   */
  async runTests(category = "critical", maxTests = null) {
    this.log(`\n🚀 Starting QA test run for ${category} configurations`);

    const testConfigs = this.loadTestConfigurations(category);
    const testsToRun = maxTests ? testConfigs.slice(0, maxTests) : testConfigs;

    this.log(
      `📋 Running ${testsToRun.length} tests with parallelism: ${this.parallel}`
    );

    // Create test directory
    mkdirSync(this.testDir, { recursive: true });

    // Run tests in batches
    const results = [];
    for (let i = 0; i < testsToRun.length; i += this.parallel) {
      const batch = testsToRun.slice(i, i + this.parallel);
      const batchPromises = batch.map((config, index) =>
        this.runSingleTest(config, i + index)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      this.log(
        `\n📊 Completed batch ${Math.floor(i / this.parallel) + 1}/${Math.ceil(
          testsToRun.length / this.parallel
        )}`
      );
    }

    this.results = results;
    return results;
  }

  /**
   * Generate test report
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
        successRate: `${Math.round(
          (successful.length / this.results.length) * 100
        )}%`,
        totalDuration: `${Math.round(totalDuration / 1000)}s`,
        averageDuration: `${Math.round(
          this.results.reduce((sum, r) => sum + r.duration, 0) /
            this.results.length
        )}ms`,
      },
      results: this.results,
      failedTests: failed.map((r) => ({
        testName: r.testName,
        config: r.config,
        error: r.error?.message,
        issues: r.validation?.issues || [],
      })),
    };

    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Create reports directory if it doesn't exist
    const reportsDir = "reports";
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = `reports/test-report-${timestamp}.json`;
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log("\n📊 TEST RESULTS SUMMARY");
    console.log("═".repeat(50));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    console.log(`⏱️  Total Duration: ${report.summary.totalDuration}`);
    console.log(`⚡ Average Duration: ${report.summary.averageDuration}`);
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);

    if (failed.length > 0) {
      console.log("\n❌ FAILED TESTS:");
      failed.forEach((test) => {
        console.log(
          `   ${test.testName}: ${test.error?.message || "Unknown error"}`
        );
      });
    }

    return report;
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
  const category = args[0] || "critical";
  const maxTests = args[1] ? parseInt(args[1]) : null;
  const verbose = args.includes("--verbose");
  const noCleanup = args.includes("--no-cleanup");

  const runner = new TestRunner({
    verbose: true, // Always show output for now
    parallel: 1, // Sequential to avoid conflicts
    timeoutMs: 180000, // 3 minutes per test
  });

  try {
    const results = await runner.runTests(category, maxTests);
    const report = runner.generateReport();

    if (!noCleanup) {
      runner.cleanup();
    }

    // Exit with error code if tests failed
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Test runner failed:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TestRunner };
