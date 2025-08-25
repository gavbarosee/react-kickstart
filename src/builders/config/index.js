// Import classes for factory functions
import { ConfigurationBuilder } from "./configuration-builder.js";
import { DependencyResolver } from "./dependency-resolver.js";
import { PackageJsonBuilder } from "./package-json-builder.js";

// Export the main configuration builders
export { ConfigurationBuilder } from "./configuration-builder.js";
export { PackageJsonBuilder } from "./package-json-builder.js";
export { DependencyResolver } from "./dependency-resolver.js";

// Re-export dependency functions for backward compatibility
export * from "./dependencies.js";

// Factory function to create configuration builders
export function createConfigurationBuilder(framework) {
  return new ConfigurationBuilder(framework);
}

// Factory function to create package.json builders
export function createPackageJsonBuilder(framework) {
  return new PackageJsonBuilder(framework);
}

// Factory function to create dependency resolvers
export function createDependencyResolver(framework) {
  return new DependencyResolver(framework);
}
