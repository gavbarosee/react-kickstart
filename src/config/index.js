// Import classes for factory functions
import { ConfigurationBuilder } from "./ConfigurationBuilder.js";
import { PackageJsonBuilder } from "./PackageJsonBuilder.js";
import { DependencyResolver } from "./DependencyResolver.js";

// Export the main configuration builders
export { ConfigurationBuilder } from "./ConfigurationBuilder.js";
export { PackageJsonBuilder } from "./PackageJsonBuilder.js";
export { DependencyResolver } from "./DependencyResolver.js";

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
