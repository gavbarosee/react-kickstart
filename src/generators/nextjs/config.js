import {
  createPackageJsonBuilder,
  createConfigurationBuilder,
} from "../../config/index.js";

/**
 * Create package.json for Next.js projects using centralized builder
 */
export function createPackageJson(projectPath, projectName, userChoices) {
  const builder = createPackageJsonBuilder("nextjs");
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
 * Create Next.js configuration using centralized builder
 */
export function createNextConfig(projectPath, userChoices) {
  const configBuilder = createConfigurationBuilder("nextjs");
  return configBuilder.generateNextjsConfig(projectPath, userChoices);
}

/**
 * Create jsconfig.json for Next.js JavaScript projects
 * @deprecated Use ConfigurationBuilder.generateJsConfig instead
 */
export function setupJsConfig(projectPath) {
  const configBuilder = createConfigurationBuilder("nextjs");
  return configBuilder.generateJsConfig(projectPath);
}
