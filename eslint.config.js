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
      // Enforce kebab-case files and directories
      "unicorn/filename-case": ["warn", { case: "kebabCase" }],

      // Keep imports tidy and readable
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // Reasonable defaults
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-case-declarations": "warn",
      "no-constant-condition": "warn",
      "no-control-regex": "warn",
    },
  },

  // Tests: relax filename-case for spec files
  {
    files: ["**/*.spec.js", "**/__tests__/**/*.js"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },

  // Project-specific patterns in prompt step classes
  {
    files: ["src/prompts/steps/**/*.js"],
    rules: {
      "no-dupe-class-members": "off",
    },
  },
];
