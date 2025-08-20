import { ViteGenerator } from "../ViteGenerator.js";

/**
 * Backward compatibility wrapper for Vite project generation
 * @deprecated Use ViteGenerator class directly
 */
export default async function generateViteProject(
  projectPath,
  projectName,
  userChoices
) {
  const generator = new ViteGenerator();
  return await generator.generate(projectPath, projectName, userChoices);
}
