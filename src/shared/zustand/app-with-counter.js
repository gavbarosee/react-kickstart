import fs from "fs-extra";
import path from "path";
import { CORE_UTILS } from "../../utils/index.js";
import { createCommonTemplateBuilder } from "../../templates/index.js";

/**
 * Creates a replacement App component that includes the Counter
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function createAppWithCounter(projectPath, userChoices) {
  if (userChoices.stateManagement !== "zustand") return;

  const srcDir = path.join(projectPath, "src");
  const ext = CORE_UTILS.getComponentExtension(userChoices);
  const appFile = path.join(srcDir, `App.${ext}`);

  if (!fs.existsSync(appFile)) return;

  // Generate App component using CommonTemplateBuilder
  const templateBuilder = createCommonTemplateBuilder();
  const content = templateBuilder.generateAppWithCounter(
    userChoices,
    "zustand"
  );

  // backup the original file
  fs.copyFileSync(appFile, `${appFile}.bak`);

  // write the new App file
  fs.writeFileSync(appFile, content);
}
