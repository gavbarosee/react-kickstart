const execa = require("execa");

async function installDependencies(projectPath, packageManager = "npm") {
  try {
    const installCmd = packageManager === "yarn" ? "yarn" : "npm";
    const installArgs = packageManager === "yarn" ? [] : ["install"];

    console.log(`Installing dependencies using ${packageManager}...`);

    await execa(installCmd, installArgs, {
      cwd: projectPath,
      stdio: "inherit",
    });

    console.log("Dependencies installed successfully!");
    return true;
  } catch (err) {
    console.error("Failed to install dependencies");
    console.error(err.message || err);

    return false;
  }
}

function getPackageManagerCommand(packageManager) {
  if (packageManager === "yarn") {
    return {
      run: "yarn",
      dev: "yarn dev",
      build: "yarn build",
      start: "yarn start",
    };
  }

  return {
    run: "npm run",
    dev: "npm run dev",
    build: "npm run build",
    start: "npm start",
  };
}

module.exports = {
  installDependencies,
  getPackageManagerCommand,
};
