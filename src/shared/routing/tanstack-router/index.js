import fs from "fs-extra";
import path from "path";
import { setupViteTanStackRouter } from "./vite.js";

/**
 * Sets up TanStack Router based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupTanStackRouter(projectPath, userChoices, framework) {
  if (userChoices.routing !== "tanstack-router") return;

  if (framework === "nextjs") return;
  switch (framework) {
    case "vite":
      setupViteTanStackRouter(projectPath, userChoices);
      break;
  }
}
