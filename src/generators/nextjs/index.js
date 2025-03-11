import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import {
  createPackageJson,
  setupLinting,
  createNextConfig,
  setupTypeScript,
} from "./config.js";
import { createAppRouterStructure } from "./app-router.js";
import { createPagesRouterStructure } from "./pages-router.js";

export default async function generateNextjsProject(
  projectPath,
  projectName,
  userChoices
) {
  log(
    `Creating a Next.js React project with ${userChoices.nextRouting} router...`
  );

  createPackageJson(projectPath, projectName, userChoices);

  // basic folder structure
  createDirectoryStructure(projectPath);

  // router-specific structure
  if (userChoices.nextRouting === "app") {
    createAppRouterStructure(projectPath, projectName, userChoices);
  } else {
    createPagesRouterStructure(projectPath, projectName, userChoices);
  }

  createNextConfig(projectPath, userChoices);

  if (userChoices.linting) {
    setupLinting(projectPath, userChoices);
  }

  if (userChoices.typescript) {
    setupTypeScript(projectPath, userChoices);
  }

  return true;
}

function createDirectoryStructure(projectPath) {
  const publicDir = path.join(projectPath, "public");
  fs.ensureDirSync(publicDir);

  // svg
  fs.writeFileSync(
    path.join(publicDir, "next.svg"),
    `<?xml version="1.0" encoding="UTF-8"?>
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
</svg>`
  );
}
