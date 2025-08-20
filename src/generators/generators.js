// Export all generator classes for advanced usage and testing
export { BaseGenerator } from "./BaseGenerator.js";
export { ViteGenerator } from "./ViteGenerator.js";
export { NextjsGenerator } from "./NextjsGenerator.js";

// Import for the factory function
import { ViteGenerator } from "./ViteGenerator.js";
import { NextjsGenerator } from "./NextjsGenerator.js";

// Factory function to create generators
export function createGenerator(framework) {
  switch (framework) {
    case "vite":
      return new ViteGenerator();
    case "nextjs":
      return new NextjsGenerator();
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}

// Utility function to get supported frameworks
export function getSupportedFrameworks() {
  return ["vite", "nextjs"];
}

// Utility function to check if a framework is supported
export function isFrameworkSupported(framework) {
  return getSupportedFrameworks().includes(framework);
}
