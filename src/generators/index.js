const generateViteProject = require("./vite");

async function generateProject(projectPath, projectName, userChoices) {
  console.log(`Creating a ${userChoices.framework} project...`);

  // select the appropriate generator based on the framework choice
  switch (userChoices.framework) {
    case "vite":
      await generateViteProject(projectPath, projectName, userChoices);
      break;
    default:
      throw new Error(`Unsupported framework: ${userChoices.framework}`);
  }

  return true;
}

module.exports = {
  generateProject,
};
