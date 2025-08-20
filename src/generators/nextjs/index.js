import { NextjsGenerator } from "../NextjsGenerator.js";

/**
 * Backward compatibility wrapper for Next.js project generation
 * @deprecated Use NextjsGenerator class directly
 */
export default async function generateNextjsProject(
  projectPath,
  projectName,
  userChoices
) {
  const generator = new NextjsGenerator();
  return await generator.generate(projectPath, projectName, userChoices);
}
