import fs from "fs-extra";
import path from "path";

/**
 * Sets up Wouter for Vite projects
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupViteWouter(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");
  const pagesDir = path.join(srcDir, "pages");
  const componentsDir = path.join(srcDir, "components");
  const ext = userChoices.typescript ? "tsx" : "jsx";

  fs.ensureDirSync(pagesDir);
  fs.ensureDirSync(componentsDir);

  createHomePage(pagesDir, ext, userChoices);
  createAboutPage(pagesDir, ext, userChoices);
  createNotFoundPage(pagesDir, ext, userChoices);

  createLayout(componentsDir, ext, userChoices);
  updateAppComponent(srcDir, ext, userChoices);
  updateEntryPoint(srcDir, ext, userChoices);
}

function createHomePage(pagesDir, ext, userChoices) {
  const content = `${
    userChoices.typescript ? "import React from 'react';\n\n" : ""
  }
export default function HomePage() {
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
        Welcome to your new React project with Wouter!
      </p>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(pagesDir, `HomePage.${ext}`), content);
}

function createAboutPage(pagesDir, ext, userChoices) {
  const content = `${
    userChoices.typescript ? "import React from 'react';\n\n" : ""
  }
export default function AboutPage() {
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
        It includes Wouter for lightweight routing between pages.
      </p>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(pagesDir, `AboutPage.${ext}`), content);
}

function createNotFoundPage(pagesDir, ext, userChoices) {
  const content = `${
    userChoices.typescript ? "import React from 'react';\n\n" : ""
  }
export default function NotFoundPage() {
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

  fs.writeFileSync(path.join(pagesDir, `NotFoundPage.${ext}`), content);
}

function createLayout(componentsDir, ext, userChoices) {
  let content;

  if (userChoices.styling === "styled-components") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link, useLocation } from 'wouter';
import styled from 'styled-components';

const LayoutContainer = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
\`;

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

const NavLink = styled(Link)\`
  text-decoration: none;
  color: #0070f3;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
  
  &.active {
    font-weight: bold;
  }
\`;

export default function Layout({ children }) {
  const [location] = useLocation();
  
  return (
    <LayoutContainer>
      <NavBar>
        <NavList>
          <li>
            <NavLink href="/" className={location === '/' ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink href="/about" className={location === '/about' ? 'active' : ''}>
              About
            </NavLink>
          </li>
        </NavList>
      </NavBar>
      
      <main>
        {children}
      </main>
    </LayoutContainer>
  );
}
`;
  } else if (userChoices.styling === "tailwind") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link, useLocation } from 'wouter';

export default function Layout({ children }) {
  const [location] = useLocation();
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      <nav className="py-4 border-b border-gray-200 mb-8">
        <ul className="flex gap-8">
          <li>
            <Link
              href="/"
              className={\`text-blue-500 hover:text-blue-700 font-medium \${
                location === '/' ? 'font-bold text-blue-700' : ''
              }\`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={\`text-blue-500 hover:text-blue-700 font-medium \${
                location === '/about' ? 'font-bold text-blue-700' : ''
              }\`}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>
      
      <main>
        {children}
      </main>
    </div>
  );
}
`;
  } else {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Link, useLocation } from 'wouter';
${userChoices.styling === "css" ? "import './Layout.css';" : ""}

export default function Layout({ children }) {
  const [location] = useLocation();
  
  return (
    <div className="layout-container">
      <nav className="navbar">
        <ul className="nav-list">
          <li>
            <Link
              href="/"
              className={\`nav-link \${location === '/' ? 'nav-link-active' : ''}\`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={\`nav-link \${location === '/about' ? 'nav-link-active' : ''}\`}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>
      
      <main>
        {children}
      </main>
    </div>
  );
}
`;

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

.nav-link-active {
  font-weight: bold;
}
`;
      fs.writeFileSync(path.join(componentsDir, "Layout.css"), cssContent);
    }
  }

  fs.writeFileSync(path.join(componentsDir, `Layout.${ext}`), content);
}

function updateAppComponent(srcDir, ext, userChoices) {
  const appFile = path.join(srcDir, `App.${ext}`);

  if (!fs.existsSync(appFile)) return;

  fs.copyFileSync(appFile, `${appFile}.bak`);

  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { Route, Switch } from 'wouter';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

${userChoices.styling === "css" ? "import './App.css';" : ""}

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Layout>
  );
}

export default App;
`;

  fs.writeFileSync(appFile, content);
}

function updateEntryPoint(srcDir, ext, userChoices) {
  const entryFile = path.join(srcDir, `main.${ext}`);

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
