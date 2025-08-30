// Import classes first
import { TemplateEngine } from "./engines/template-engine.js";
import { UIRenderer } from "./engines/ui-renderer.js";
import { FileTemplateEngine } from "./engines/file-template-engine.js";
import { CommonTemplateBuilder } from "./engines/common-template-builder.js";

// Export template system classes
export { TemplateEngine, UIRenderer, FileTemplateEngine, CommonTemplateBuilder };

// Export factory functions for easy instantiation
export function createUIRenderer(theme = "default") {
  return new UIRenderer(theme);
}

export function createFileTemplateEngine() {
  return new FileTemplateEngine();
}

export function createCommonTemplateBuilder() {
  return new CommonTemplateBuilder();
}

export function createTemplateEngine(theme = "default") {
  return new TemplateEngine(theme);
}

// Export template themes for easy access
export const THEMES = {
  DEFAULT: "default",
  MODERN: "modern",
  MINIMAL: "minimal",
};

// Export template types for categorization
export const TEMPLATE_TYPES = {
  UI: "ui",
  FILE: "file",
  CONFIG: "config",
  COMPONENT: "component",
};

// Utility function to get themed output
export function withTheme(theme, callback) {
  const renderer = createUIRenderer(theme);
  return callback(renderer);
}

// Utility function for quick UI rendering
export function quickRender(templateName, theme = "default", ...args) {
  const renderer = createUIRenderer(theme);
  return renderer.engine.render(templateName, ...args);
}
