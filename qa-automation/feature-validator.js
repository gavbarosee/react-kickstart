/**
 * Feature Validator - Analyzes what features are actually implemented vs expected
 * This tool helps debug when tests fail by showing what the CLI actually generates
 */

import { existsSync, readFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

class FeatureValidator {
  constructor(testDir = "qa-test-projects") {
    this.testDir = testDir;
  }

  async validateDefaultBehavior() {
    console.log("\n🔍 Analyzing CLI Default Behavior");
    console.log("=".repeat(50));

    const tests = [
      {
        name: "Vite-Defaults",
        framework: "vite",
        expectedFeatures: {
          javascript: true,
          tailwind: true,
          eslint: true,
          git: true,
          basicStructure: true,
        },
      },
      {
        name: "NextJS-Defaults",
        framework: "nextjs",
        expectedFeatures: {
          javascript: true,
          tailwind: true,
          eslint: true,
          git: true,
          basicStructure: true,
        },
      },
    ];

    const results = [];

    for (const test of tests) {
      console.log(`🧪 Testing ${test.name}...`);
      const result = await this.runFeatureTest(test);
      results.push(result);

      if (result.success) {
        console.log(`   ✅ All expected features present`);
      } else {
        console.log(
          `   ❌ Missing features: ${result.missingFeatures.join(", ")}`
        );
      }
    }

    this.generateFeatureReport(results);
  }

  async analyzeActualCapabilities() {
    console.log("\n🔬 Analyzing Actual CLI Capabilities");
    console.log("=".repeat(50));

    // Test both frameworks with defaults to see what's actually implemented
    const projectA = await this.generateTestProject(
      "feature-test-vite",
      "vite"
    );
    const projectB = await this.generateTestProject(
      "feature-test-nextjs",
      "nextjs"
    );

    const viteFeatures = this.analyzeProjectFeatures(projectA.path, "vite");
    const nextjsFeatures = this.analyzeProjectFeatures(projectB.path, "nextjs");

    console.log("\n🚀 Vite Projects Include:");
    this.printFeatureList(viteFeatures);

    console.log("\n▲ Next.js Projects Include:");
    this.printFeatureList(nextjsFeatures);

    // Cleanup
    if (projectA.success)
      rmSync(projectA.path, { recursive: true, force: true });
    if (projectB.success)
      rmSync(projectB.path, { recursive: true, force: true });
  }

  async generateTestProject(name, framework) {
    const testDirPath = join(process.cwd(), this.testDir);
    const projectPath = join(testDirPath, name);

    mkdirSync(testDirPath, { recursive: true });
    if (existsSync(projectPath)) {
      rmSync(projectPath, { recursive: true, force: true });
    }

    try {
      // Run CLI with defaults
      execSync(
        `node ../bin/react-kickstart.js ${name} --yes --framework ${framework} --no-autostart`,
        {
          cwd: testDirPath,
          stdio: "pipe",
          timeout: 120000,
        }
      );

      return {
        name,
        framework,
        path: projectPath,
        success: true,
      };
    } catch (error) {
      return {
        name,
        framework,
        path: projectPath,
        success: false,
        error: error.message,
      };
    }
  }

  analyzeProjectFeatures(projectPath, framework) {
    return {
      // Basic structure
      hasPackageJson: existsSync(join(projectPath, "package.json")),
      hasSourceDir: this.checkSourceDirectory(projectPath, framework),

      // Configuration files
      hasGitIgnore: existsSync(join(projectPath, ".gitignore")),
      hasGitRepo: existsSync(join(projectPath, ".git")),

      // Framework configs
      hasFrameworkConfig: this.checkFrameworkConfig(projectPath, framework),

      // Language configs
      hasTypeScript: existsSync(join(projectPath, "tsconfig.json")),
      hasJavaScript: !existsSync(join(projectPath, "tsconfig.json")),

      // Styling configs
      hasTailwind: existsSync(join(projectPath, "tailwind.config.js")),
      hasPostCSS: existsSync(join(projectPath, "postcss.config.js")),

      // Code quality
      hasESLint:
        existsSync(join(projectPath, ".eslintrc.js")) ||
        existsSync(join(projectPath, ".eslintrc.json")),
      hasPrettier: existsSync(join(projectPath, ".prettierrc")),

      // Dependencies (if package.json exists)
      dependencies: this.analyzeDependencies(projectPath),

      // Build system
      canBuild: this.testBuild(projectPath),
    };
  }

  checkSourceDirectory(projectPath, framework) {
    if (framework === "vite") {
      return existsSync(join(projectPath, "src"));
    } else if (framework === "nextjs") {
      return (
        existsSync(join(projectPath, "app")) ||
        existsSync(join(projectPath, "pages")) ||
        existsSync(join(projectPath, "src"))
      );
    }
    return false;
  }

  checkFrameworkConfig(projectPath, framework) {
    if (framework === "vite") {
      return (
        existsSync(join(projectPath, "vite.config.js")) ||
        existsSync(join(projectPath, "vite.config.ts"))
      );
    } else if (framework === "nextjs") {
      return (
        existsSync(join(projectPath, "next.config.js")) ||
        existsSync(join(projectPath, "next.config.mjs"))
      );
    }
    return false;
  }

  analyzeDependencies(projectPath) {
    const packageJsonPath = join(projectPath, "package.json");
    if (!existsSync(packageJsonPath)) {
      return { error: "package.json not found" };
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      return {
        // Core
        hasReact: !!allDeps.react,
        hasReactDOM: !!allDeps["react-dom"],

        // Frameworks
        hasVite: !!allDeps.vite,
        hasNext: !!allDeps.next,

        // Language
        hasTypeScript: !!allDeps.typescript,
        hasTypeScriptTypes: !!allDeps["@types/react"],

        // Styling
        hasTailwindCSS: !!allDeps.tailwindcss,
        hasStyledComponents: !!allDeps["styled-components"],

        // State management
        hasRedux: !!allDeps["@reduxjs/toolkit"],
        hasZustand: !!allDeps.zustand,

        // API
        hasAxios: !!allDeps.axios,
        hasReactQuery: !!allDeps["@tanstack/react-query"],

        // Testing
        hasVitest: !!allDeps.vitest,
        hasJest: !!allDeps.jest,
        hasTestingLibrary: !!allDeps["@testing-library/react"],

        // Routing
        hasReactRouter: !!allDeps["react-router-dom"],

        // Code quality
        hasESLint: !!allDeps.eslint,
        hasPrettier: !!allDeps.prettier,

        // Total package count
        totalPackages: Object.keys(allDeps).length,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  testBuild(projectPath) {
    try {
      execSync("npm run build", {
        cwd: projectPath,
        stdio: "pipe",
        timeout: 60000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  printFeatureList(features) {
    console.log(`   📦 Package.json: ${features.hasPackageJson ? "✅" : "❌"}`);
    console.log(
      `   📁 Source directory: ${features.hasSourceDir ? "✅" : "❌"}`
    );
    console.log(
      `   🔧 Framework config: ${features.hasFrameworkConfig ? "✅" : "❌"}`
    );
    console.log(`   🎨 Tailwind CSS: ${features.hasTailwind ? "✅" : "❌"}`);
    console.log(
      `   📝 TypeScript: ${features.hasTypeScript ? "✅" : "❌"} (JS: ${
        features.hasJavaScript ? "✅" : "❌"
      })`
    );
    console.log(`   🔍 ESLint: ${features.hasESLint ? "✅" : "❌"}`);
    console.log(`   💅 Prettier: ${features.hasPrettier ? "✅" : "❌"}`);
    console.log(`   📚 Git repo: ${features.hasGitRepo ? "✅" : "❌"}`);
    console.log(`   🏗️  Can build: ${features.canBuild ? "✅" : "❌"}`);

    if (features.dependencies && !features.dependencies.error) {
      const deps = features.dependencies;
      console.log(`   📦 Dependencies: ${deps.totalPackages} packages`);
      console.log(`      - React: ${deps.hasReact ? "✅" : "❌"}`);
      console.log(`      - Vite: ${deps.hasVite ? "✅" : "❌"}`);
      console.log(`      - Next.js: ${deps.hasNext ? "✅" : "❌"}`);
      console.log(`      - TypeScript: ${deps.hasTypeScript ? "✅" : "❌"}`);
      console.log(`      - Tailwind: ${deps.hasTailwindCSS ? "✅" : "❌"}`);
      console.log(`      - Redux: ${deps.hasRedux ? "✅" : "❌"}`);
      console.log(`      - Zustand: ${deps.hasZustand ? "✅" : "❌"}`);
      console.log(`      - Axios: ${deps.hasAxios ? "✅" : "❌"}`);
      console.log(`      - React Query: ${deps.hasReactQuery ? "✅" : "❌"}`);
      console.log(`      - React Router: ${deps.hasReactRouter ? "✅" : "❌"}`);
      console.log(`      - Vitest: ${deps.hasVitest ? "✅" : "❌"}`);
      console.log(`      - Jest: ${deps.hasJest ? "✅" : "❌"}`);
    }
  }

  async runFeatureTest(test) {
    const project = await this.generateTestProject(test.name, test.framework);

    if (!project.success) {
      return {
        testName: test.name,
        success: false,
        error: project.error,
        missingFeatures: Object.keys(test.expectedFeatures),
      };
    }

    const actualFeatures = this.analyzeProjectFeatures(
      project.path,
      test.framework
    );
    const missingFeatures = [];

    for (const [feature, expected] of Object.entries(test.expectedFeatures)) {
      if (expected) {
        switch (feature) {
          case "javascript":
            if (!actualFeatures.hasJavaScript)
              missingFeatures.push("JavaScript");
            break;
          case "tailwind":
            if (!actualFeatures.hasTailwind)
              missingFeatures.push("Tailwind CSS");
            break;
          case "eslint":
            if (!actualFeatures.hasESLint) missingFeatures.push("ESLint");
            break;
          case "git":
            if (!actualFeatures.hasGitRepo)
              missingFeatures.push("Git repository");
            break;
          case "basicStructure":
            if (
              !actualFeatures.hasPackageJson ||
              !actualFeatures.hasSourceDir
            ) {
              missingFeatures.push("Basic project structure");
            }
            break;
        }
      }
    }

    // Cleanup
    rmSync(project.path, { recursive: true, force: true });

    return {
      testName: test.name,
      success: missingFeatures.length === 0,
      missingFeatures,
      actualFeatures,
    };
  }

  generateFeatureReport(results) {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log("\n📊 FEATURE VALIDATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(
      `📈 Success Rate: ${Math.round(
        (successful.length / results.length) * 100
      )}%`
    );

    if (failed.length > 0) {
      console.log("\n❌ FAILED TESTS:");
      failed.forEach((test) => {
        console.log(
          `   ${test.testName}: Missing ${test.missingFeatures.join(", ")}`
        );
      });
    }

    console.log("\n💡 RECOMMENDATIONS:");
    if (successful.length === results.length) {
      console.log("   ✅ All default features work correctly");
      console.log("   🎯 Focus QA tests on implemented features");
      console.log("   📊 Update test matrix to match CLI capabilities");
    } else {
      console.log("   ⚠️  Some expected features are missing");
      console.log("   🔧 Either fix CLI implementation or update expectations");
    }

    return {
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: Math.round((successful.length / results.length) * 100),
      },
      results,
    };
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new FeatureValidator();

  try {
    console.log("🔍 React Kickstart CLI Feature Analysis");
    console.log("=====================================");

    // First analyze what features are actually supported
    await validator.analyzeActualCapabilities();

    // Then validate default behavior
    await validator.validateDefaultBehavior();
  } catch (error) {
    console.error("❌ Feature validation failed:", error.message);
    process.exit(1);
  }
}

export { FeatureValidator };
