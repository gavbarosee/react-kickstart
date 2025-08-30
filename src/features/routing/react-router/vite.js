import fs from "fs-extra";
import path from "path";

import { CORE_UTILS } from "../../../utils/index.js";

/**
 * Sets up React Router for Vite projects
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupViteReactRouter(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);

  // Create directories
  const directories = CORE_UTILS.createProjectDirectories(projectPath, {
    src: "src",
    pages: "src/pages",
    components: "src/components",
  });

  // create example pages
  createHomePage(directories.pages, ext, userChoices);
  createAboutPage(directories.pages, ext, userChoices);
  createNotFoundPage(directories.pages, ext, userChoices);

  // create the layout component with navigation
  createLayout(directories.components, ext, userChoices);
  updateAppComponent(directories.src, ext, userChoices);
  updateEntryPoint(directories.src, ext, userChoices);
}

/**
 * Creates a Home page component
 */
function createHomePage(pagesDir, ext, userChoices) {
  let content;

  if (userChoices.styling === "styled-components") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { useState } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div\`
  padding: 2rem 0;
\`;

const Title = styled.h1\`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #111827;
  line-height: 1.1;
\`;

const Description = styled.p\`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.7;
\`;

const InteractiveButton = styled.button\`
  background-color: #2563eb;
  color: white;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background-color: #1d4ed8;
  }
\`;

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <PageContainer>
      <Title>Home</Title>
      <Description>
        Welcome to your new React project with React Router!
      </Description>
      <div>
        <InteractiveButton onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </InteractiveButton>
      </div>
    </PageContainer>
  );
}
`;
  } else {
    content = `${userChoices.typescript ? "import React from 'react';\n\n" : ""}
export default function HomePage() {
  return (
    <div${userChoices.styling === "tailwind" ? ' className="py-8"' : ""}>
      <h1${
        userChoices.styling === "tailwind" ? ' className="text-3xl font-bold mb-4"' : ""
      }>Home</h1>
      <p${userChoices.styling === "tailwind" ? ' className="text-gray-600"' : ""}>
        Welcome to your new React project with React Router!
      </p>
    </div>
  );
}
`;
  }

  fs.writeFileSync(path.join(pagesDir, `HomePage.${ext}`), content);
}

/**
 * Creates an About page component
 */
function createAboutPage(pagesDir, ext, userChoices) {
  let content;

  if (userChoices.styling === "styled-components") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import styled from 'styled-components';

const PageContainer = styled.div\`
  padding: 2rem 0;
\`;

const Title = styled.h1\`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #111827;
  line-height: 1.1;
\`;

const Paragraph = styled.p\`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.7;
\`;

export default function AboutPage() {
  return (
    <PageContainer>
      <Title>About</Title>
      <Paragraph>
        This is a simple React application created with React Kickstart CLI.
      </Paragraph>
      <Paragraph>
        It includes React Router for navigation between pages and styled-components for styling.
      </Paragraph>
    </PageContainer>
  );
}
`;
  } else {
    content = `${userChoices.typescript ? "import React from 'react';\n\n" : ""}
export default function AboutPage() {
  return (
    <div${userChoices.styling === "tailwind" ? ' className="py-8"' : ""}>
      <h1${
        userChoices.styling === "tailwind" ? ' className="text-3xl font-bold mb-4"' : ""
      }>About</h1>
      <p${userChoices.styling === "tailwind" ? ' className="text-gray-600"' : ""}>
        This is a simple React application created with React Kickstart CLI.
      </p>
      <p${userChoices.styling === "tailwind" ? ' className="text-gray-600 mt-2"' : ""}>
        It includes React Router for navigation between pages.
      </p>
    </div>
  );
}
`;
  }

  fs.writeFileSync(path.join(pagesDir, `AboutPage.${ext}`), content);
}

/**
 * Creates a 404 Not Found page component
 */
function createNotFoundPage(pagesDir, ext, userChoices) {
  let content;

  if (userChoices.styling === "styled-components") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import styled from 'styled-components';

const PageContainer = styled.div\`
  padding: 2rem 0;
  text-align: center;
\`;

const ErrorTitle = styled.h1\`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #ef4444;
  line-height: 1.1;
\`;

const ErrorMessage = styled.p\`
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.7;
\`;

export default function NotFoundPage() {
  return (
    <PageContainer>
      <ErrorTitle>404 - Page Not Found</ErrorTitle>
      <ErrorMessage>
        The page you are looking for does not exist.
      </ErrorMessage>
    </PageContainer>
  );
}
`;
  } else {
    content = `${userChoices.typescript ? "import React from 'react';\n\n" : ""}
export default function NotFoundPage() {
  return (
    <div${userChoices.styling === "tailwind" ? ' className="py-8 text-center"' : ""}>
      <h1${
        userChoices.styling === "tailwind"
          ? ' className="text-3xl font-bold mb-4 text-red-500"'
          : ""
      }>404 - Page Not Found</h1>
      <p${userChoices.styling === "tailwind" ? ' className="text-gray-600"' : ""}>
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
`;
  }

  fs.writeFileSync(path.join(pagesDir, `NotFoundPage.${ext}`), content);
}

/**
 * Creates a Layout component with navigation
 */
function createLayout(componentsDir, ext, userChoices) {
  let content;

  if (userChoices.styling === "styled-components") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const LayoutContainer = styled.div\`
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
\`;

const NavBar = styled.nav\`
  display: flex;
  padding: 1rem 0;
  margin-bottom: 2rem;
\`;

const NavList = styled.ul\`
  display: flex;
  gap: 2rem;
  list-style: none;
  padding: 0;
  margin: 0;
\`;

const NavLink = styled(Link)\`
  text-decoration: none;
  color: #2563eb;
  font-weight: 500;
  font-size: 1.125rem;
  transition: color 0.15s ease-in-out;
  
  &:hover {
    text-decoration: underline;
  }
\`;

export default function Layout() {
  return (
    <LayoutContainer>
      <NavBar>
        <NavList>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
        </NavList>
      </NavBar>
      
      <main>
        <Outlet />
      </main>
    </LayoutContainer>
  );
}
`;
  } else if (userChoices.styling === "tailwind") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <nav className="py-4 border-b border-gray-200 mb-8">
        <ul className="flex gap-8">
          <li>
            <Link to="/" className="text-blue-500 hover:text-blue-700 font-medium">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-blue-500 hover:text-blue-700 font-medium">
              About
            </Link>
          </li>
        </ul>
      </nav>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}
`;
  } else {
    // plain CSS
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link, Outlet } from 'react-router-dom';
${userChoices.styling === "css" ? "import './Layout.css';" : ""}

export default function Layout() {
  return (
    <div className="layout-container">
      <nav className="navbar">
        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/about" className="nav-link">About</Link></li>
        </ul>
      </nav>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}
`;

    // create CSS file if using plain CSS
    if (userChoices.styling === "css") {
      const cssContent = `.layout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.navbar {
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

.nav-link {
  text-decoration: none;
  color: #0070f3;
  font-weight: 500;
}

.nav-link:hover {
  text-decoration: underline;
}
`;
      fs.writeFileSync(path.join(componentsDir, "Layout.css"), cssContent);
    }
  }

  fs.writeFileSync(path.join(componentsDir, `Layout.${ext}`), content);
}

/**
 * Updates the App component to use React Router
 */
function updateAppComponent(srcDir, ext, userChoices) {
  const appFile = path.join(srcDir, `App.${ext}`);

  if (!fs.existsSync(appFile)) return;

  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { 
  createBrowserRouter, 
  RouterProvider, 
  createRoutesFromElements,
  Route 
} from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
`;

  fs.writeFileSync(appFile, content);
}

/**
 * Updates the main entry point file
 */
function updateEntryPoint(srcDir, ext, userChoices) {
  // for Vite, the entry point is main.jsx/tsx
  const entryFile = path.join(srcDir, `main.${ext}`);

  if (!fs.existsSync(entryFile)) return;

  // no need to wrap with BrowserRouter as we're using RouterProvider in App
  // but we may need to ensure any CSS imports are preserved

  const content = fs.readFileSync(entryFile, "utf8");

  // we don't need to make major changes, just ensure any styling imports are preserved
  let newContent = content;

  // look for styled-components or any issues with the import
  if (!content.includes("import App from './App'")) {
    newContent = content.replace(
      /import .* from ["']\.\/App.*["'];/,
      "import App from './App';",
    );
  }

  fs.writeFileSync(entryFile, newContent);
}
