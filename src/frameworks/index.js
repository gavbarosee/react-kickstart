// Framework registry for managing different framework implementations
import { NextjsGenerator } from "./nextjs/nextjs-generator.js";
import { ViteGenerator } from "./vite/vite-generator.js";

/**
 * Framework registry that manages all available framework generators
 */
export class FrameworkRegistry {
  constructor() {
    this.generators = new Map();
    this.registerDefaultGenerators();
  }

  /**
   * Register default framework generators
   */
  registerDefaultGenerators() {
    this.register("nextjs", NextjsGenerator);
    this.register("vite", ViteGenerator);
  }

  /**
   * Register a framework generator
   * @param {string} name - Framework name
   * @param {class} GeneratorClass - Generator class
   */
  register(name, GeneratorClass) {
    this.generators.set(name, GeneratorClass);
  }

  /**
   * Get a generator instance for a framework
   * @param {string} framework - Framework name
   * @returns {object} Generator instance
   */
  getGenerator(framework) {
    const GeneratorClass = this.generators.get(framework);
    if (!GeneratorClass) {
      throw new Error(`Unsupported framework: ${framework}`);
    }
    return new GeneratorClass();
  }

  /**
   * Get all supported frameworks
   * @returns {Array} Array of framework names
   */
  getSupportedFrameworks() {
    return Array.from(this.generators.keys());
  }

  /**
   * Check if a framework is supported
   * @param {string} framework - Framework name
   * @returns {boolean} Whether the framework is supported
   */
  isSupported(framework) {
    return this.generators.has(framework);
  }
}

/**
 * Factory function to create a framework registry
 * @returns {FrameworkRegistry} New framework registry instance
 */
export function createFrameworkRegistry() {
  return new FrameworkRegistry();
}

// Export framework-specific modules
export * from "./nextjs/index.js";
export * from "./vite/index.js";
