### Adding a new routing option

Support alternative routing for Vite (React Router variants) or Next.js routing behaviors.

## Where to plug in

- Vite/React Router:
  - `src/features/routing/react-router/*`
  - (routing is handled in the features layer)
- Next.js options:
  - `src/generators/frameworks/nextjs/routers/*` (app vs pages router)

## Steps

1. Create routing setup code

Add a module that writes router deps and files (e.g., `vite.js` or new variant) under the appropriate path.

2. Register the option

Expose a new choice in the prompts (e.g., `src/prompts/steps/routing-step.js`) and wire handling in `src/features/routing/index.js`.

3. Update content generators

Ensure the content generator writes the correct example routes and entry points.

## Verification

- Generate a project and run `npm run dev`.
- Check navigation works and initial routes render.
- Cover option registration with unit tests and exercise via QA automation.

## Full example: Add a hash-based React Router option for Vite

This example adds a new option `react-router-hash` that uses `HashRouter` instead of `BrowserRouter`.

### 1) Expose the option in the prompt

Update `src/prompts/steps/routing-step.js` to add a choice:

```js
// inside getChoices()
{
  name: chalk.blue("React Router (Hash)") + chalk.gray(" - Uses # URLs, no server rewrites"),
  value: "react-router-hash",
},
```

### 2) Implement setup code

Create `src/features/routing/react-router-hash/vite.js`:

```js
import fs from "fs-extra";
import path from "path";

import { CORE_UTILS } from "../../../utils/index.js";

export function setupViteReactRouterHash(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);

  const directories = CORE_UTILS.createProjectDirectories(projectPath, {
    src: "src",
    pages: "src/pages",
    components: "src/components",
  });

  // Minimal pages
  fs.writeFileSync(
    path.join(directories.pages, `HomePage.${ext}`),
    `export default function HomePage(){return <h1>Home</h1>;}`,
  );
  fs.writeFileSync(
    path.join(directories.pages, `AboutPage.${ext}`),
    `export default function AboutPage(){return <h1>About</h1>;}`,
  );

  // Layout with links
  fs.writeFileSync(
    path.join(directories.components, `Layout.${ext}`),
    `import { Link, Outlet } from 'react-router-dom';
export default function Layout(){
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>
      <main><Outlet/></main>
    </div>
  );
}`,
  );

  // Update App to use HashRouter
  const appFile = path.join(directories.src, `App.${ext}`);
  fs.writeFileSync(
    appFile,
    `import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

export default function App(){
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<HomePage/>}/>
          <Route path="about" element={<AboutPage/>}/>
          <Route path="*" element={<div>Not Found</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}`,
  );
}
```

### 3) Wire it into the router setup switch

Update `src/features/routing/index.js`:

```js
import { setupReactRouter } from "./react-router/index.js";
import { setupViteReactRouterHash } from "./react-router-hash/vite.js";

export function setupRouting(projectPath, userChoices, framework) {
  if (!userChoices.routing || userChoices.routing === "none") return;

  switch (userChoices.routing) {
    case "react-router":
      setupReactRouter(projectPath, userChoices, framework);
      break;
    case "react-router-hash":
      if (framework === "vite") {
        setupViteReactRouterHash(projectPath, userChoices);
      }
      break;
  }
}
```

### 4) Verify

Generate a Vite app selecting "React Router (Hash)", run `npm run dev`, and ensure URLs use `#/` and pages route correctly.
