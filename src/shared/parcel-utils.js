// src/shared/parcel-utils.js
import fs from "fs-extra";
import path from "path";

/**
 * Updates Parcel package.json with the correct source field
 * to ensure the entry point is properly configured
 *
 * @param {string} projectPath - Path to the project root
 * @returns {void}
 */
export function updateParcelPackageJson(projectPath) {
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Set the correct source path for Parcel
    packageJson.source = "src/index.html";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.error("Error updating Parcel package.json:", error);
  }
}
