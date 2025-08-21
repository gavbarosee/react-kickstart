import fs from "fs-extra";
import path from "path";
import { UI_UTILS, CORE_UTILS } from "../../utils/index.js";
import { BaseGenerator } from "../../generators/base-generator.js";
import { createConfigurationBuilder } from "../../config/index.js";
import { createAppRouterStructure } from "./generators/app-router.js";
import { createPagesRouterStructure } from "./generators/pages-router.js";

/**
 * Next.js-specific project generator
 */
export class NextjsGenerator extends BaseGenerator {
  constructor() {
    super("nextjs");
    this.configBuilder = createConfigurationBuilder("nextjs");
  }

  /**
   * Override log message for Next.js
   */
  logGenerationStart(userChoices) {
    const routerType = userChoices.nextRouting || "app";
    UI_UTILS.log(
      `Creating a Next.js React project with ${routerType} router...`
    );
  }

  /**
   * Create package.json for Next.js projects
   */
  async createPackageConfiguration(projectPath, projectName, userChoices) {
    return this.configBuilder.generatePackageJson(
      projectPath,
      projectName,
      userChoices
    );
  }

  /**
   * Create Next.js-specific configuration files
   */
  async createFrameworkConfiguration(projectPath, userChoices) {
    // Generate Next.js config
    const nextjsConfig = this.configBuilder.generateNextjsConfig(
      projectPath,
      userChoices
    );

    // Generate additional configs (TypeScript, Tailwind, Testing, etc.)
    const additionalConfigs =
      await this.configBuilder.generateAdditionalConfigs(
        projectPath,
        userChoices
      );

    return { nextjsConfig, ...additionalConfigs };
  }

  /**
   * Create project files specific to Next.js
   */
  async createProjectFiles(projectPath, projectName, userChoices) {
    // Create router-specific structure
    if (userChoices.nextRouting === "app") {
      createAppRouterStructure(projectPath, projectName, userChoices);
    } else {
      createPagesRouterStructure(projectPath, projectName, userChoices);
    }

    // Note: Next.js handles styling and routing internally,
    // so we don't need the additional setup that Vite requires
  }

  /**
   * Create Next.js-specific files
   */
  async createFrameworkSpecificFiles(projectPath, userChoices) {
    // Create Next.js logo
    this.createNextjsLogo(projectPath);

    // Create jsconfig.json if not using TypeScript
    if (!userChoices.typescript) {
      this.createJsConfig(projectPath);
    }
  }

  /**
   * Create Next.js logo file
   */
  createNextjsLogo(projectPath) {
    const publicDir = CORE_UTILS.createProjectDirectory(projectPath, "public");

    const nextjsLogo = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_408_134" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
<circle cx="90" cy="90" r="90" fill="black"/>
</mask>
<g mask="url(#mask0_408_134)">
<circle cx="90" cy="90" r="90" fill="black"/>
<path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_134)"/>
<rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_134)"/>
</g>
<defs>
<linearGradient id="paint0_linear_408_134" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint1_linear_408_134" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>`;

    fs.writeFileSync(path.join(publicDir, "next.svg"), nextjsLogo);
  }

  /**
   * Create jsconfig.json for JavaScript projects
   */
  createJsConfig(projectPath) {
    return this.configBuilder.generateJsConfig(projectPath);
  }
}
