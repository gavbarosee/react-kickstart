// src/shared/content-generation/index.js

import { NextjsAppRouterGenerator } from "./nextjs-app-router-generator.js";
import { NextjsPagesRouterGenerator } from "./nextjs-pages-router-generator.js";
import { ViteContentGenerator } from "./vite-content-generator.js";

/**
 * Factory function to create the appropriate content generator
 * based on framework and routing type
 *
 * @param {string} framework - The framework being used ('vite', 'nextjs')
 * @param {string|null} routingType - The routing type for Next.js ('app', 'pages') or null for default
 * @returns {BaseContentGenerator} The appropriate content generator instance
 */
export function createContentGenerator(framework, routingType = null) {
  switch (framework) {
    case "vite":
      return new ViteContentGenerator();

    case "nextjs":
      if (routingType === "app") {
        return new NextjsAppRouterGenerator();
      } else {
        // Default to pages router for Next.js
        return new NextjsPagesRouterGenerator();
      }

    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}

// Export the generator classes for direct usage if needed
export { ViteContentGenerator, NextjsAppRouterGenerator, NextjsPagesRouterGenerator };
