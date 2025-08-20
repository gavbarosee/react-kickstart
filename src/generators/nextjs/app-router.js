import fs from "fs-extra";
import path from "path";

import { createContentGenerator } from "../../shared/content-generation/index.js";
import { setupStyling } from "../../shared/styling.js";
import { CORE_UTILS } from "../../utils/index.js";

export function createAppRouterStructure(
  projectPath,
  projectName,
  userChoices
) {
  const appDir = CORE_UTILS.createProjectDirectory(projectPath, "app");

  const ext = CORE_UTILS.getComponentExtension(userChoices);

  // Create layout file using the strategy pattern
  const generator = createContentGenerator("nextjs", "app");
  const layoutContent = generator.generateLayout(
    projectName,
    userChoices.styling,
    ext
  );
  fs.writeFileSync(path.join(appDir, `layout.${ext}`), layoutContent);

  // Create styled-components registry if needed
  if (userChoices.styling === "styled-components") {
    const registryContent = generator.generateStyledComponentsRegistry(ext);
    fs.writeFileSync(
      path.join(appDir, `styled-components-registry.${ext}`),
      registryContent
    );
  }

  // Generate page content using strategy pattern
  const pageContent = generator.generateAppComponent(
    ext,
    userChoices.styling,
    userChoices
  );
  fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);

  // Ensure styling setup for all styling options (tailwind, styled-components, plain css)
  setupStyling(projectPath, userChoices, "nextjs");

  createApiRoute(appDir, userChoices);
}

function createApiRoute(appDir, userChoices) {
  const directories = CORE_UTILS.createProjectDirectories(
    path.dirname(appDir),
    {
      api: "app/api",
      hello: "app/api/hello",
    }
  );

  const generator = createContentGenerator("nextjs", "app");
  const routeHandler = generator.generateApiRoute();

  fs.writeFileSync(
    path.join(
      directories.hello,
      `route.${CORE_UTILS.getApiExtension(userChoices)}`
    ),
    routeHandler
  );
}
