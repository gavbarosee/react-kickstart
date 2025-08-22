import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.spec.js"],
    environment: "node",
  },
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
    reportsDirectory: "./coverage",
    all: false,
  },
});
