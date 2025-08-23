/**
 * ESLint configuration for Node + ESM project
 * - Enforces kebab-case filenames (via unicorn/filename-case)
 * - Uses import ordering and general best practices
 * - Keeps console allowed (CLI tool)
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["import", "unicorn"],
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  rules: {
    // Enforce kebab-case files and directories
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
      },
    ],

    // Keep imports tidy and readable
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

    // Reasonable defaults
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",
  },
  overrides: [
    // Test files
    {
      files: ["**/*.spec.js", "**/__tests__/**/*.js"],
      rules: {
        "unicorn/filename-case": "off",
      },
      globals: {
        // Vitest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    // Common config files
    {
      files: ["**/*.config.js", "**/.eslintrc.cjs"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
  ],
};
