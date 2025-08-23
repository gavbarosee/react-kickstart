// ESLint flat config for Node + ESM project
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default [
  // Ignore patterns (replaces .eslintignore in ESLint v9)
  {
    ignores: [
      "node_modules",
      "coverage",
      "coverage/**",
      "reports",
      "qa-automation/reports",
      "qa-automation/**",
      "qa-test-projects",
      "qa-automation/qa-test-projects/**",
      "dist",
      "dist/**",
      "build",
      "build/**",
      "src/templates/**",
      "test-*",
      "debug-*",
      "quick-test",
      "feature-test-*",
    ],
  },

  js.configs.recommended,
  prettier,

  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      unicorn,
    },
    rules: {
      // Enforce key standards appropriate for production
      "unicorn/filename-case": ["warn", { case: "kebabCase" }],
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-unused-vars": "off",
      "no-console": "off", // CLI tool, allow console
      "no-empty": "off",
      "no-case-declarations": "off",
      "no-constant-condition": "off",
      "no-control-regex": "off",
    },
  },

  // Tests: relax filename-case for spec files
  {
    files: ["**/*.spec.js", "**/__tests__/**/*.js"],
    rules: {
      "unicorn/filename-case": "off",
      "no-unused-vars": "off",
    },
  },

  // Project-specific patterns in prompt step classes
  {
    files: ["src/prompts/steps/**/*.js"],
    rules: {
      "no-dupe-class-members": "off",
      "no-unused-vars": "off",
    },
  },
];
