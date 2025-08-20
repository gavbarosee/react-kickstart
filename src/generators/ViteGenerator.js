import fs from "fs-extra";
import path from "path";
import { BaseGenerator } from "./BaseGenerator.js";
import { createConfigurationBuilder } from "../config/index.js";
import {
  createSourceFiles,
  createHtmlFile,
} from "../shared/file-generation.js";
import { setupStyling } from "../shared/styling.js";
import { setupRouting } from "../shared/routing/index.js";
import { CORE_UTILS } from "../utils/index.js";

/**
 * Vite-specific project generator
 */
export class ViteGenerator extends BaseGenerator {
  constructor() {
    super("vite");
    this.configBuilder = createConfigurationBuilder("vite");
  }

  /**
   * Create package.json for Vite projects
   */
  async createPackageConfiguration(projectPath, projectName, userChoices) {
    return this.configBuilder.generatePackageJson(
      projectPath,
      projectName,
      userChoices
    );
  }

  /**
   * Create Vite-specific configuration files
   */
  async createFrameworkConfiguration(projectPath, userChoices) {
    return this.configBuilder.generateViteConfig(projectPath, userChoices);
  }

  /**
   * Create project files specific to Vite
   */
  async createProjectFiles(projectPath, projectName, userChoices) {
    // Create HTML file (Vite needs this)
    createHtmlFile(projectPath, projectName, userChoices, this.frameworkName);

    // Create source files
    createSourceFiles(projectPath, userChoices, this.frameworkName);

    // Setup routing if enabled
    if (this.isFeatureEnabled(userChoices, "routing")) {
      setupRouting(projectPath, userChoices, this.frameworkName);
    }

    // Setup styling (Vite handles certain styling differently)
    if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
      setupStyling(projectPath, userChoices, this.frameworkName);
    }
  }

  /**
   * Create Vite-specific files
   */
  async createFrameworkSpecificFiles(projectPath, userChoices) {
    this.createViteLogo(projectPath);
  }

  /**
   * Create Vite logo file
   */
  createViteLogo(projectPath) {
    const publicDir = CORE_UTILS.createProjectDirectory(projectPath, "public");

    // Vite logo SVG
    const viteLogo = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <path fill="#646CFF" d="m128 0l126.4 224H1.6L128 0Z"/>
  <path fill="#FFF" d="M193.5 104.4H146L95.3 202.6h111.2l-13-98.2ZM127.9 38l-50.1 88.4h98.8L127.9 38Z"/>
</svg>`;

    fs.writeFileSync(path.join(publicDir, "vite.svg"), viteLogo);
  }
}
