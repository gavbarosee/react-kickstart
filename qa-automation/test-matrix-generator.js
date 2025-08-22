#!/usr/bin/env node

/**
 * Test Matrix Generator for React Kickstart CLI
 * Generates all valid configuration combinations for comprehensive testing
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Configuration options with their valid values
const CONFIG_OPTIONS = {
  framework: ["vite", "nextjs"],
  typescript: [true, false],
  styling: ["tailwind", "styled-components", "css"],
  stateManagement: ["redux", "zustand", "none"],
  api: [
    "axios-react-query",
    "axios-only",
    "fetch-react-query",
    "fetch-only",
    "none",
  ],
  testing: ["vitest", "jest", "none"],
  packageManager: ["npm", "yarn"],
  linting: [true, false],
  initGit: [true, false],
};

// Conditional options based on framework
const CONDITIONAL_OPTIONS = {
  vite: {
    routing: ["react-router", "none"],
  },
  nextjs: {
    nextRouting: ["app", "pages"],
  },
};

/**
 * Generate all valid configuration combinations
 */
function generateTestMatrix() {
  const combinations = [];
  const frameworks = CONFIG_OPTIONS.framework;

  frameworks.forEach((framework) => {
    // Base combinations for this framework
    const baseConfig = {
      framework: [framework], // Wrap in array for combination generation
      typescript: CONFIG_OPTIONS.typescript,
      styling: CONFIG_OPTIONS.styling,
      stateManagement: CONFIG_OPTIONS.stateManagement,
      api: CONFIG_OPTIONS.api,
      testing: CONFIG_OPTIONS.testing,
      packageManager: CONFIG_OPTIONS.packageManager,
      linting: CONFIG_OPTIONS.linting,
      initGit: CONFIG_OPTIONS.initGit,
    };

    // Add framework-specific options
    if (framework === "vite") {
      baseConfig.routing = CONDITIONAL_OPTIONS.vite.routing;
    } else if (framework === "nextjs") {
      baseConfig.nextRouting = CONDITIONAL_OPTIONS.nextjs.nextRouting;
    }

    // Generate all combinations for this framework
    const frameworkCombinations = generateCombinations(baseConfig);
    combinations.push(...frameworkCombinations);
  });

  return combinations;
}

/**
 * Generate all combinations from a configuration object
 */
function generateCombinations(config) {
  const keys = Object.keys(config);
  const combinations = [{}];

  keys.forEach((key) => {
    const values = Array.isArray(config[key]) ? config[key] : [config[key]];
    const newCombinations = [];

    combinations.forEach((combo) => {
      values.forEach((value) => {
        newCombinations.push({ ...combo, [key]: value });
      });
    });

    combinations.length = 0;
    combinations.push(...newCombinations);
  });

  return combinations;
}

/**
 * Filter combinations to remove invalid/problematic ones
 */
function filterValidCombinations(combinations) {
  return combinations.filter((combo) => {
    // Remove invalid testing framework combinations
    if (combo.framework === "vite" && combo.testing === "jest") {
      // Jest with Vite is valid but not recommended - include for testing
      return true;
    }

    if (combo.framework === "nextjs" && combo.testing === "vitest") {
      // Vitest with Next.js is valid but not recommended - include for testing
      return true;
    }

    return true; // Include all combinations for comprehensive testing
  });
}

/**
 * Categorize combinations by priority for testing
 */
function categorizeCombinations(combinations) {
  const categories = {
    critical: [], // Most common/important combinations
    standard: [], // Regular combinations
    edge: [], // Edge cases and uncommon combinations
  };

  combinations.forEach((combo) => {
    const score = calculatePriorityScore(combo);

    if (score >= 8) {
      categories.critical.push(combo);
    } else if (score >= 5) {
      categories.standard.push(combo);
    } else {
      categories.edge.push(combo);
    }
  });

  return categories;
}

/**
 * Calculate priority score for a combination
 */
function calculatePriorityScore(combo) {
  let score = 0;

  // Framework preferences
  if (combo.framework === "vite") score += 2;
  if (combo.framework === "nextjs") score += 2;

  // TypeScript usage
  if (combo.typescript === true) score += 2;

  // Popular styling choices
  if (combo.styling === "tailwind") score += 2;
  if (combo.styling === "styled-components") score += 1;

  // State management preferences
  if (combo.stateManagement === "zustand") score += 1;
  if (combo.stateManagement === "redux") score += 1;

  // API setup preferences
  if (combo.api === "axios-react-query") score += 2;
  if (combo.api === "fetch-react-query") score += 1;

  // Testing preferences (framework-optimized)
  if (combo.framework === "vite" && combo.testing === "vitest") score += 2;
  if (combo.framework === "nextjs" && combo.testing === "jest") score += 2;

  // Package manager preferences
  if (combo.packageManager === "npm") score += 1;
  if (combo.packageManager === "yarn") score += 1;

  // Code quality
  if (combo.linting === true) score += 1;
  if (combo.initGit === true) score += 1;

  return score;
}

/**
 * Generate test commands for a combination
 */
function generateTestCommand(combo, index) {
  const args = [
    `test-project-${index}`,
    "--yes",
    `--framework ${combo.framework}`,
  ];

  // Add other options as environment variables for the test
  const envVars = {
    FRAMEWORK: combo.framework,
    TYPESCRIPT: combo.typescript,
    STYLING: combo.styling,
    STATE_MANAGEMENT: combo.stateManagement,
    API: combo.api,
    TESTING: combo.testing,
    PACKAGE_MANAGER: combo.packageManager,
    LINTING: combo.linting,
    INIT_GIT: combo.initGit,
  };

  if (combo.routing) envVars.ROUTING = combo.routing;
  if (combo.nextRouting) envVars.NEXT_ROUTING = combo.nextRouting;

  return {
    command: `node bin/react-kickstart.js ${args.join(" ")}`,
    environment: envVars,
    config: combo,
  };
}

/**
 * Main execution
 */
function main() {
  console.log("🔍 Generating test matrix for React Kickstart CLI...\n");

  // Generate all combinations
  const allCombinations = generateTestMatrix();
  console.log(`📊 Generated ${allCombinations.length} total combinations`);

  // Filter valid combinations
  const validCombinations = filterValidCombinations(allCombinations);
  console.log(
    `✅ ${validCombinations.length} valid combinations after filtering`
  );

  // Categorize by priority
  const categorized = categorizeCombinations(validCombinations);
  console.log(`\n📋 Categorized combinations:`);
  console.log(`   🔥 Critical: ${categorized.critical.length}`);
  console.log(`   📄 Standard: ${categorized.standard.length}`);
  console.log(`   🎯 Edge cases: ${categorized.edge.length}`);

  // Create output directory
  mkdirSync("qa-automation/test-configs", { recursive: true });

  // Generate test configurations
  const testConfigs = {
    critical: categorized.critical.map((combo, i) =>
      generateTestCommand(combo, `critical-${i}`)
    ),
    standard: categorized.standard.map((combo, i) =>
      generateTestCommand(combo, `standard-${i}`)
    ),
    edge: categorized.edge.map((combo, i) =>
      generateTestCommand(combo, `edge-${i}`)
    ),
  };

  // Save configurations
  Object.entries(testConfigs).forEach(([category, configs]) => {
    writeFileSync(
      `test-configs/${category}-tests.json`,
      JSON.stringify(configs, null, 2)
    );
    console.log(`💾 Saved ${configs.length} ${category} test configurations`);
  });

  // Generate summary statistics
  const summary = {
    totalCombinations: allCombinations.length,
    validCombinations: validCombinations.length,
    categorized: {
      critical: categorized.critical.length,
      standard: categorized.standard.length,
      edge: categorized.edge.length,
    },
    sampleConfigurations: {
      critical: categorized.critical.slice(0, 3),
      standard: categorized.standard.slice(0, 3),
      edge: categorized.edge.slice(0, 3),
    },
  };

  writeFileSync("test-matrix-summary.json", JSON.stringify(summary, null, 2));

  console.log("\n✨ Test matrix generation complete!");
  console.log("📁 Files generated in qa-automation/");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateTestMatrix, categorizeCombinations, generateTestCommand };
