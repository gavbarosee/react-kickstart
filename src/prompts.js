const inquirer = require("inquirer");

async function promptUser() {
  console.log("React Kickstart - Let's set up your project!");
  console.log();

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager would you like to use?",
      choices: [
        { name: "npm", value: "npm" },
        { name: "yarn", value: "yarn" },
      ],
      default: "npm",
    },
    {
      type: "list",
      name: "framework",
      message: "Which framework would you like to use?",
      choices: [
        { name: "Vite", value: "vite" },
        { name: "Next.js", value: "nextjs" },
        // more frameworks later
      ],
      default: "vite",
    },
  ]);

  return answers;
}

module.exports = {
  promptUser,
};
