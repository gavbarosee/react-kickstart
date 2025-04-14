import fs from "fs-extra";
import path from "path";
import { setupReactRouter } from "./react-router/index.js";
import { setupTanStackRouter } from "./tanstack-router/index.js";
import { setupWouter } from "./wouter/index.js";

/**
 * Sets up routing based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupRouting(projectPath, userChoices, framework) {
  if (!userChoices.routing || userChoices.routing === "none") return;

  switch (userChoices.routing) {
    case "react-router":
      setupReactRouter(projectPath, userChoices, framework);
      break;
    case "tanstack-router":
      setupTanStackRouter(projectPath, userChoices, framework);
      break;
    case "wouter":
      setupWouter(projectPath, userChoices, framework);
      break;
  }
}
