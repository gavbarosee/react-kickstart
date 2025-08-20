import {
  createPackageJsonBuilder,
  createConfigurationBuilder,
} from "../../config/index.js";

/**
 * Create package.json for Vite projects using centralized builder
 */
export function createPackageJson(projectPath, projectName, userChoices) {
  const builder = createPackageJsonBuilder("vite");
  return builder
    .setBasicInfo(projectName)
    .setScripts()
    .addCoreDependencies()
    .addFrameworkDependencies()
    .addTypeScriptDependencies(userChoices)
    .addLintingDependencies(userChoices)
    .addStylingDependencies(userChoices)
    .addRoutingDependencies(userChoices)
    .addStateManagementDependencies(userChoices)
    .buildAndWrite(projectPath);
}

/**
 * Create Vite configuration using centralized builder
 */
export function createViteConfig(projectPath, userChoices) {
  const configBuilder = createConfigurationBuilder("vite");
  return configBuilder.generateViteConfig(projectPath, userChoices);
}
