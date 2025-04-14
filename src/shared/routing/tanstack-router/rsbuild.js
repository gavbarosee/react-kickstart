import fs from "fs-extra";
import path from "path";

/**
 * Sets up TanStack Router for Rsbuild projects
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupRsbuildTanStackRouter(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");
  const pagesDir = path.join(srcDir, "pages");
  const routesDir = path.join(srcDir, "routes");
  const componentsDir = path.join(srcDir, "components");
  const ext = userChoices.typescript ? "tsx" : "jsx";

  fs.ensureDirSync(pagesDir);
  fs.ensureDirSync(routesDir);
  fs.ensureDirSync(componentsDir);

  createRouteRoot(routesDir, ext, userChoices);
  createRouteIndex(routesDir, ext, userChoices);
  createRouteAbout(routesDir, ext, userChoices);
  createRouteError(routesDir, ext, userChoices);

  createNavigation(componentsDir, ext, userChoices);

  updateAppComponent(srcDir, ext, userChoices);

  updateEntryPoint(srcDir, ext, userChoices);
}

function createRouteRoot(routesDir, ext, userChoices) {
  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Navigation } from '../components/Navigation';

export const Route = createRootRoute({
  component: () => (
    <div${
      userChoices.styling === "tailwind"
        ? ' className="max-w-4xl mx-auto px-4"'
        : ""
    }>
      <Navigation />
      <main${userChoices.styling === "tailwind" ? ' className="py-4"' : ""}>
        <Outlet />
      </main>
    </div>
  ),
});
`;

  fs.writeFileSync(path.join(routesDir, `root.${ext}`), content);
}

function createRouteIndex(routesDir, ext, userChoices) {
  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div${userChoices.styling === "tailwind" ? ' className="py-8"' : ""}>
      <h1${
        userChoices.styling === "tailwind"
          ? ' className="text-3xl font-bold mb-4"'
          : ""
      }>Home</h1>
      <p${
        userChoices.styling === "tailwind" ? ' className="text-gray-600"' : ""
      }>
        Welcome to your new React project with TanStack Router!
      </p>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(routesDir, `index.${ext}`), content);
}

function createRouteAbout(routesDir, ext, userChoices) {
  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div${userChoices.styling === "tailwind" ? ' className="py-8"' : ""}>
      <h1${
        userChoices.styling === "tailwind"
          ? ' className="text-3xl font-bold mb-4"'
          : ""
      }>About</h1>
      <p${
        userChoices.styling === "tailwind" ? ' className="text-gray-600"' : ""
      }>
        This is a simple React application created with React Kickstart CLI.
      </p>
      <p${
        userChoices.styling === "tailwind"
          ? ' className="text-gray-600 mt-2"'
          : ""
      }>
        It includes TanStack Router for type-safe navigation between pages.
      </p>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(routesDir, `about.${ext}`), content);
}

function createRouteError(routesDir, ext, userChoices) {
  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div${
      userChoices.styling === "tailwind" ? ' className="py-8 text-center"' : ""
    }>
      <h1${
        userChoices.styling === "tailwind"
          ? ' className="text-3xl font-bold mb-4 text-red-500"'
          : ""
      }>404 - Page Not Found</h1>
      <p${
        userChoices.styling === "tailwind" ? ' className="text-gray-600"' : ""
      }>
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(routesDir, `$.${ext}`), content);
}

function createNavigation(componentsDir, ext, userChoices) {
  let content;

  if (userChoices.styling === "styled-components") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link } from '@tanstack/react-router';
import styled from 'styled-components';

const NavBar = styled.nav\`
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 2rem;
\`;

const NavList = styled.ul\`
  display: flex;
  gap: 2rem;
  list-style: none;
  padding: 0;
  margin: 0;
\`;

const NavItem = styled.li\`
  margin: 0;
\`;

const StyledLink = styled(Link)\`
  text-decoration: none;
  color: #0070f3;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
  
  &[aria-current="page"] {
    font-weight: bold;
  }
\`;

export function Navigation() {
  return (
    <NavBar>
      <NavList>
        <NavItem>
          <StyledLink to="/">Home</StyledLink>
        </NavItem>
        <NavItem>
          <StyledLink to="/about">About</StyledLink>
        </NavItem>
      </NavList>
    </NavBar>
  );
}
`;
  } else if (userChoices.styling === "tailwind") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link } from '@tanstack/react-router';

export function Navigation() {
  return (
    <nav className="py-4 border-b border-gray-200 mb-8">
      <ul className="flex gap-8">
        <li>
          <Link
            to="/"
            activeProps={{ className: 'text-blue-700 font-bold' }}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            activeProps={{ className: 'text-blue-700 font-bold' }}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}
`;
  } else {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link } from '@tanstack/react-router';
${userChoices.styling === "css" ? "import './Navigation.css';" : ""}

export function Navigation() {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link nav-link-active' }}
          >
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link nav-link-active' }}
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}
`;

    if (userChoices.styling === "css") {
      const cssContent = `.navbar {
  padding: 1rem 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 2rem;
}

.nav-list {
  display: flex;
  gap: 2rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0;
}

.nav-link {
  text-decoration: none;
  color: #0070f3;
  font-weight: 500;
}

.nav-link:hover {
  text-decoration: underline;
}

.nav-link-active {
  font-weight: bold;
}
`;
      fs.writeFileSync(path.join(componentsDir, "Navigation.css"), cssContent);
    }
  }

  fs.writeFileSync(path.join(componentsDir, `Navigation.${ext}`), content);
}

function updateAppComponent(srcDir, ext, userChoices) {
  const appFile = path.join(srcDir, `App.${ext}`);

  if (!fs.existsSync(appFile)) return;

  fs.copyFileSync(appFile, `${appFile}.bak`);

  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { RouterProvider, createRouter } from '@tanstack/react-router';

// Import routes
import { Route as rootRoute } from './routes/root';
import { Route as indexRoute } from './routes/index';
import { Route as aboutRoute } from './routes/about';
import { Route as notFoundRoute } from './routes/$';

${userChoices.styling === "css" ? "import './App.css';" : ""}

// Create and register the routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  notFoundRoute
]);

// Create the router
const router = createRouter({ routeTree });

// Register the router for type-safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
`;

  const jsContent = `import { RouterProvider, createRouter } from '@tanstack/react-router';

// Import routes
import { Route as rootRoute } from './routes/root';
import { Route as indexRoute } from './routes/index';
import { Route as aboutRoute } from './routes/about';
import { Route as notFoundRoute } from './routes/$';

${userChoices.styling === "css" ? "import './App.css';" : ""}

// Create and register the routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  notFoundRoute
]);

// Create the router
const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
`;

  fs.writeFileSync(appFile, userChoices.typescript ? content : jsContent);
}

function updateEntryPoint(srcDir, ext, userChoices) {
  const entryFile = path.join(srcDir, `index.${ext}`);

  if (!fs.existsSync(entryFile)) return;

  const content = fs.readFileSync(entryFile, "utf8");
  let newContent = content;
  if (!content.includes("import App from './App'")) {
    newContent = content.replace(
      /import .* from ["']\.\/App.*["'];/,
      "import App from './App';"
    );
  }

  fs.writeFileSync(entryFile, newContent);
}
