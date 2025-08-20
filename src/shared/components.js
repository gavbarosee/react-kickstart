/**
 * Provides component templates for different styling approaches
 *
 * REFACTORED: This module now uses the Strategy pattern to eliminate duplication.
 * The actual generation logic has been moved to content-generation strategies.
 */

import {
  getStyledComponentsApp as newGetStyledComponentsApp,
  getTailwindApp as newGetTailwindApp,
  getBasicCssApp as newGetBasicCssApp,
  createEntryPointContent as newCreateEntryPointContent,
} from "./content-generation/index.js";

/**
 * Creates a React component using styled-components
 * @deprecated - Use content-generation strategy pattern instead
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {string} framework - Framework name (vite, nextjs)
 * @param {boolean} isNextAppRouter - Whether this is a Next.js app router component
 * @returns {string} Component code
 */
export function getStyledComponentsApp(
  fileExt,
  framework = "vite",
  isNextAppRouter = false
) {
  return newGetStyledComponentsApp(fileExt, framework, isNextAppRouter);
}

/**
 * Creates a React component using Tailwind CSS
 * @deprecated - Use content-generation strategy pattern instead
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {string} framework - Framework name (vite, nextjs)
 * @param {boolean} isNextAppRouter - Whether this is a Next.js app router component
 * @returns {string} Component code
 */
export function getTailwindApp(
  fileExt,
  framework = "vite",
  isNextAppRouter = false
) {
  return newGetTailwindApp(fileExt, framework, isNextAppRouter);
}

/**
 * Creates a React component using plain CSS
 * @deprecated - Use content-generation strategy pattern instead
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {string} framework - Framework name (vite, nextjs)
 * @param {boolean} isNextAppRouter - Whether this is a Next.js app router component
 * @returns {string} Component code
 */
export function getBasicCssApp(
  fileExt,
  framework = "vite",
  isNextAppRouter = false
) {
  return newGetBasicCssApp(fileExt, framework, isNextAppRouter);
}

/**
 * Creates an entry point file (main.jsx/tsx or index.jsx/tsx)
 * @deprecated - Use content-generation strategy pattern instead
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - Framework name (vite, nextjs)
 * @returns {string} Entry point file code
 */
export function createEntryPointContent(
  fileExt,
  userChoices,
  framework = "vite"
) {
  return newCreateEntryPointContent(fileExt, userChoices, framework);
}
