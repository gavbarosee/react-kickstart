import fs from "fs-extra";
import path from "path";
import { setupViteTanStackRouter } from "./vite.js";
import { setupRsbuildTanStackRouter } from "./rsbuild.js";
import { setupParcelTanStackRouter } from "./parcel.js";

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
    case "rsbuild":
      setupRsbuildTanStackRouter(projectPath, userChoices);
      break;
    case "parcel":
      setupParcelTanStackRouter(projectPath, userChoices);
      break;
  }
}
