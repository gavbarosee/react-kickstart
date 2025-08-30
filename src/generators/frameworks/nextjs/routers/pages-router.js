import fs from "fs-extra";
import path from "path";

import { setupStyling } from "../../../../features/styling/index.js";
import { createContentGenerator } from "../../../../templates/frameworks/index.js";
import { CORE_UTILS } from "../../../../utils/index.js";

export function createPagesRouterStructure(projectPath, projectName, userChoices) {
  const directories = CORE_UTILS.createProjectDirectories(projectPath, {
    pages: "pages",
    api: "pages/api",
    styles: "styles",
  });

  const ext = CORE_UTILS.getComponentExtension(userChoices);

  // Use strategy pattern for content generation
  const generator = createContentGenerator("nextjs", "pages");

  // Create _app file
  const appContent = generator.generateAppFile(userChoices.styling, ext);
  fs.writeFileSync(path.join(directories.pages, `_app.${ext}`), appContent);

  // Create _document file if using styled-components
  if (userChoices.styling === "styled-components") {
    const documentContent = generator.generateDocumentFile(ext);
    fs.writeFileSync(path.join(directories.pages, `_document.${ext}`), documentContent);
  }

  // Generate index page content
  const indexContent = generator.generateAppComponent(
    ext,
    userChoices.styling,
    userChoices,
  );
  fs.writeFileSync(path.join(directories.pages, `index.${ext}`), indexContent);

  // Ensure styling setup for all styling options (tailwind, styled-components, plain css)
  setupStyling(projectPath, userChoices, "nextjs");

  createApiRoute(directories.api, userChoices);
}

function createApiRoute(apiDir, userChoices) {
  const generator = createContentGenerator("nextjs", "pages");
  const apiRouteContent = generator.generateApiRoute();

  fs.writeFileSync(
    path.join(apiDir, `hello.${CORE_UTILS.getApiExtension(userChoices)}`),
    apiRouteContent,
  );
}
