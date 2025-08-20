import fs from "fs-extra";
import path from "path";
import { setupViteReactRouter } from "./vite.js";

/**
 * Sets up React Router based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupReactRouter(projectPath, userChoices, framework) {
  if (userChoices.routing !== "react-router") return;

  if (framework === "nextjs") return;

  switch (framework) {
    case "vite":
      setupViteReactRouter(projectPath, userChoices);
      break;
  }
}
