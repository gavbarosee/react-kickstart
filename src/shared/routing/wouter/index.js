import fs from "fs-extra";
import path from "path";
import { setupViteWouter } from "./vite.js";
import { setupRsbuildWouter } from "./rsbuild.js";
import { setupParcelWouter } from "./parcel.js";

/**
 * Sets up Wouter based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupWouter(projectPath, userChoices, framework) {
  if (userChoices.routing !== "wouter") return;

  if (framework === "nextjs") return;

  switch (framework) {
    case "vite":
      setupViteWouter(projectPath, userChoices);
      break;
    case "rsbuild":
      setupRsbuildWouter(projectPath, userChoices);
      break;
    case "parcel":
      setupParcelWouter(projectPath, userChoices);
      break;
  }
}
