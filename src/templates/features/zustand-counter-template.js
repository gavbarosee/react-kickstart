import fs from "fs-extra";
import path from "path";

import { createCommonTemplateBuilder } from "../index.js";
import { CORE_UTILS } from "../../utils/index.js";

/**
 * Creates a replacement App component that includes the Counter
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function createAppWithCounter(projectPath, userChoices) {
  if (userChoices.stateManagement !== "zustand") return;

  const ext = CORE_UTILS.getComponentExtension(userChoices);

  // Handle Next.js framework
  if (userChoices.framework === "nextjs") {
    if (userChoices.nextRouting === "app") {
      addZustandCounterToNextjsAppPage(projectPath, userChoices);
    } else {
      addZustandCounterToNextjsPagesIndex(projectPath, userChoices);
    }
    return;
  }

  // Handle other frameworks
  const srcDir = path.join(projectPath, "src");

  // Check if routing is enabled
  if (userChoices.routing && userChoices.routing !== "none") {
    // If routing is enabled, add Zustand counter to HomePage instead of replacing App
    addZustandCounterToHomePage(projectPath, userChoices);
  } else {
    // If no routing, replace App component as before
    const appFile = path.join(srcDir, `App.${ext}`);
    if (!fs.existsSync(appFile)) return;

    // Generate App component using CommonTemplateBuilder
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateAppWithCounter(userChoices, "zustand");

    fs.writeFileSync(appFile, content);
  }
}

/**
 * Adds Zustand counter functionality to the HomePage component
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
function addZustandCounterToHomePage(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);
  const pagesDir = path.join(projectPath, "src", "pages");
  const homePageFile = path.join(pagesDir, `HomePage.${ext}`);

  if (!fs.existsSync(homePageFile)) return;

  let content = fs.readFileSync(homePageFile, "utf-8");

  // Add Zustand imports
  const zustandImports = `import { useCounterStore } from '../store/counterStore';`;

  // Add the imports after existing imports
  if (userChoices.typescript) {
    // Check if React is already imported to avoid duplicates
    if (content.includes("import React from 'react';")) {
      // Find all imports and add Zustand imports after the last one
      const allImports = content.match(/import.*?from.*?;/g);
      if (allImports && allImports.length > 0) {
        const lastImport = allImports[allImports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const lastImportEnd = lastImportIndex + lastImport.length;
        content =
          content.slice(0, lastImportEnd) +
          `\n${zustandImports}` +
          content.slice(lastImportEnd);
      } else {
        // Fallback: add after the first React import
        content = content.replace(
          /import React from 'react';/,
          `import React from 'react';\n${zustandImports}`,
        );
      }
    } else {
      // No React import exists, add both
      if (content.includes("import")) {
        content = content.replace(
          /(import.*?\n)/,
          `import React from 'react';\n${zustandImports}\n$1`,
        );
      } else {
        content = `import React from 'react';\n${zustandImports}\n\n${content}`;
      }
    }
  } else {
    // If no React import, add at the top
    if (content.includes("import")) {
      content = content.replace(/(import.*?\n)/, `$1${zustandImports}\n`);
    } else {
      content = `${zustandImports}\n\n${content}`;
    }
  }

  // Add styled components for counter if using styled-components
  if (userChoices.styling === "styled-components") {
    // Add the new styled components after existing ones
    const styledComponents = `
const CounterSection = styled.div\`
  margin-top: 2rem;
\`;

const CounterDescription = styled.p\`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1rem;
\`;

const CounterContainer = styled.div\`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
\`;

const ButtonRow = styled.div\`
  display: flex;
  gap: 0.75rem;
  align-items: center;
\`;

const CountDisplay = styled.span\`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  min-width: 80px;
  text-align: center;
\`;`;

    // Find the last styled component and add our new ones after it
    const lastStyledComponentMatch = content.match(
      /const \w+ = styled\.\w+`[\s\S]*?`;/g,
    );
    if (lastStyledComponentMatch && lastStyledComponentMatch.length > 0) {
      const lastStyledComponent =
        lastStyledComponentMatch[lastStyledComponentMatch.length - 1];
      const lastStyledIndex = content.lastIndexOf(lastStyledComponent);
      const lastStyledEnd = lastStyledIndex + lastStyledComponent.length;
      content =
        content.slice(0, lastStyledEnd) +
        styledComponents +
        content.slice(lastStyledEnd);
    }
  }

  // Add Zustand logic to the component
  const zustandLogic = `  const { count, increment, decrement, incrementByAmount } = useCounterStore();`;

  // Replace the useState logic with Zustand logic
  if (content.includes("useState")) {
    // Remove useState import, but only add React import if it doesn't already exist
    content = content.replace(/import { useState } from 'react';\n?/, "");

    // Only add React import if it's not already there
    if (!content.includes("import React from 'react';")) {
      // Find the first import and add React import before it
      if (content.includes("import")) {
        content = content.replace(/(import.*?\n)/, `import React from 'react';\n$1`);
      } else {
        content = `import React from 'react';\n\n${content}`;
      }
    }

    content = content.replace(
      /const \[count, setCount\] = useState\(0\);/,
      zustandLogic,
    );
  } else {
    // Add Zustand logic after function declaration
    content = content.replace(
      /(export default function HomePage\(\) {\s*)/,
      `$1${zustandLogic}\n`,
    );
  }

  // Check if there's an existing counter button to replace
  const hasExistingCounter =
    content.includes("setCount") || content.includes("count is");

  if (hasExistingCounter) {
    // Update existing button onClick handlers for Zustand
    content = content.replace(
      /onClick={\(\) => setCount\(\(count\) => count \+ 1\)}/g,
      "onClick={increment}",
    );

    // Add decrement and increment by amount buttons if using styled-components
    if (userChoices.styling === "styled-components") {
      content = content.replace(
        /(<div>\s*<InteractiveButton[^>]*>[\s\S]*?<\/InteractiveButton>\s*<\/div>)/,
        `<CounterContainer>
          <ButtonRow>
            <InteractiveButton onClick={decrement}>
              -
            </InteractiveButton>
            <CountDisplay>count is {count}</CountDisplay>
            <InteractiveButton onClick={increment}>
              +
            </InteractiveButton>
          </ButtonRow>
        </CounterContainer>`,
      );
    } else if (userChoices.styling === "tailwind") {
      content = content.replace(
        /(<div>\s*<button[^>]*>[\s\S]*?<\/button>\s*<\/div>)/,
        `<div className="flex gap-2 items-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={decrement}
          >
            -
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded text-gray-700 font-semibold min-w-20 text-center">
            count is {count}
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={increment}
          >
            +
          </button>
        </div>`,
      );
    } else {
      // CSS styling
      content = content.replace(
        /(<div>\s*<button[^>]*>[\s\S]*?<\/button>\s*<\/div>)/,
        `<div style="display: flex; gap: 0.75rem; align-items: center;">
          <button onClick={decrement}>-</button>
          <span style="padding: 0.5rem 1rem; background-color: #f3f4f6; border-radius: 0.25rem; font-weight: 600;">count is {count}</span>
          <button onClick={increment}>+</button>
        </div>`,
      );
    }
  } else {
    // No existing counter, add a new Zustand counter section
    const counterSection = createZustandCounterSection(userChoices);

    // Add the counter after the welcome message
    content = content.replace(
      /(Welcome to your new React project with React Router!\s*<\/p>)/,
      `$1\n      ${counterSection}`,
    );
  }

  // Write the updated content
  fs.writeFileSync(homePageFile, content);
}

/**
 * Adds Zustand counter functionality to Next.js App Router page component
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
function addZustandCounterToNextjsAppPage(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);
  const pageFile = path.join(projectPath, "app", `page.${ext}`);

  if (!fs.existsSync(pageFile)) return;

  let content = fs.readFileSync(pageFile, "utf-8");

  // Add Zustand imports after 'use client' directive if it exists
  const zustandImports = `import { useCounterStore } from '../lib/counterStore';`;

  // Find the position to insert imports
  if (content.includes("'use client'")) {
    content = content.replace(/('use client';?\s*)/, `$1\n${zustandImports}\n`);
  } else {
    // Add 'use client' directive and imports at the top
    content = `'use client';\n\n${zustandImports}\n\n${content}`;
  }

  // Add styled components for counter if using styled-components
  if (userChoices.styling === "styled-components") {
    // Add the new styled components after existing ones
    const styledComponents = `
const CounterSection = styled.div\`
  margin-top: 2rem;
\`;

const CounterDescription = styled.p\`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1rem;
\`;

const CounterContainer = styled.div\`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
\`;

const ButtonRow = styled.div\`
  display: flex;
  gap: 0.75rem;
  align-items: center;
\`;

const CountDisplay = styled.span\`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  min-width: 80px;
  text-align: center;
\`;

const InteractiveButton = styled.button\`
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    background-color: #1d4ed8;
  }
\`;`;

    // Find the last styled component and add our new ones after it
    const lastStyledComponentMatch = content.match(
      /const \w+ = styled\.\w+`[\s\S]*?`;/g,
    );
    if (lastStyledComponentMatch && lastStyledComponentMatch.length > 0) {
      const lastStyledComponent =
        lastStyledComponentMatch[lastStyledComponentMatch.length - 1];
      const lastStyledIndex = content.lastIndexOf(lastStyledComponent);
      const lastStyledEnd = lastStyledIndex + lastStyledComponent.length;
      content =
        content.slice(0, lastStyledEnd) +
        styledComponents +
        content.slice(lastStyledEnd);
    } else {
      // If no styled components exist, add after imports
      const lastImportMatch = content.match(/import.*?;/g);
      if (lastImportMatch && lastImportMatch.length > 0) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const lastImportEnd = lastImportIndex + lastImport.length;
        content =
          content.slice(0, lastImportEnd) +
          "\n" +
          styledComponents +
          "\n" +
          content.slice(lastImportEnd);
      }
    }
  }

  // Add Zustand logic to the component
  const zustandLogic = `  const { count, increment, decrement, incrementByAmount } = useCounterStore();`;

  // Replace the component function to include Zustand logic - more flexible regex
  content = content.replace(
    /(export default function Home\(\)\s*{)/,
    `$1\n${zustandLogic}\n`,
  );

  // Add Zustand counter section to the component
  const counterSection = createZustandCounterSection(userChoices);

  // Add the counter section before the closing tag - simpler insertion
  if (userChoices.styling === "styled-components") {
    content = content.replace(/<\/Container>/, `${counterSection}\n    </Container>`);
  } else if (userChoices.styling === "tailwind") {
    content = content.replace(/<\/main>/, `${counterSection}\n    </main>`);
  } else {
    // CSS styling
    content = content.replace(/<\/main>/, `${counterSection}\n    </main>`);
  }

  // Write the updated content
  fs.writeFileSync(pageFile, content);
}

/**
 * Adds Zustand counter functionality to Next.js Pages Router index page
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
function addZustandCounterToNextjsPagesIndex(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);
  const indexFile = path.join(projectPath, "pages", `index.${ext}`);

  if (!fs.existsSync(indexFile)) return;

  let content = fs.readFileSync(indexFile, "utf-8");

  // Add Zustand imports at the top (Pages Router doesn't need 'use client')
  const zustandImports = `import { useCounterStore } from '../lib/counterStore';`;

  // Find where to insert imports
  if (content.includes("import")) {
    // Add after last import
    const lastImportIndex = content.lastIndexOf("import");
    const endOfLastImport = content.indexOf("\n", lastImportIndex);
    content =
      content.slice(0, endOfLastImport + 1) +
      zustandImports +
      "\n" +
      content.slice(endOfLastImport + 1);
  } else {
    // Add at the top if no imports exist
    content = zustandImports + "\n\n" + content;
  }

  // Add styled components for counter if using styled-components
  if (userChoices.styling === "styled-components") {
    // Add the new styled components after existing ones
    const styledComponents = `
const CounterSection = styled.div\`
  margin-top: 2rem;
\`;

const CounterDescription = styled.p\`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1rem;
\`;

const CounterContainer = styled.div\`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
\`;

const ButtonRow = styled.div\`
  display: flex;
  gap: 0.75rem;
  align-items: center;
\`;

const CountDisplay = styled.span\`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  min-width: 80px;
  text-align: center;
\`;

const InteractiveButton = styled.button\`
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    background-color: #1d4ed8;
  }
\`;`;

    // Find the last styled component and add our new ones after it
    const lastStyledComponentMatch = content.match(
      /const \w+ = styled\.\w+`[\s\S]*?`;/g,
    );
    if (lastStyledComponentMatch && lastStyledComponentMatch.length > 0) {
      const lastStyledComponent =
        lastStyledComponentMatch[lastStyledComponentMatch.length - 1];
      const lastStyledIndex = content.lastIndexOf(lastStyledComponent);
      const lastStyledEnd = lastStyledIndex + lastStyledComponent.length;
      content =
        content.slice(0, lastStyledEnd) +
        styledComponents +
        content.slice(lastStyledEnd);
    } else {
      // If no styled components exist, add after imports
      const lastImportMatch = content.match(/import.*?;/g);
      if (lastImportMatch && lastImportMatch.length > 0) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const lastImportEnd = lastImportIndex + lastImport.length;
        content =
          content.slice(0, lastImportEnd) +
          "\n" +
          styledComponents +
          "\n" +
          content.slice(lastImportEnd);
      }
    }
  }

  // Add Zustand logic to the component
  const zustandLogic = `  const { count, increment, decrement, incrementByAmount } = useCounterStore();`;

  // Replace the component function to include Zustand logic - more flexible regex
  content = content.replace(
    /(export default function Home\(\)\s*{)/,
    `$1\n${zustandLogic}\n`,
  );

  // Add Zustand counter section to the component
  const counterSection = createZustandCounterSection(userChoices);

  // Add the counter section before the closing tag - simpler insertion
  if (userChoices.styling === "styled-components") {
    content = content.replace(/<\/Main>/, `        ${counterSection}\n      </Main>`);
  } else if (userChoices.styling === "tailwind") {
    content = content.replace(/<\/main>/, `${counterSection}\n    </main>`);
  } else {
    // CSS styling
    content = content.replace(/<\/main>/, `${counterSection}\n    </main>`);
  }

  // Write the updated content
  fs.writeFileSync(indexFile, content);
}

/**
 * Creates a Zustand counter section based on the styling choice
 * @param {Object} userChoices - User configuration options
 * @returns {string} - Counter section HTML/JSX
 */
function createZustandCounterSection(userChoices) {
  if (userChoices.styling === "tailwind") {
    return `<div className="mt-6">
        <p className="text-gray-600 mb-4">Zustand Counter Demo:</p>
        <div className="flex gap-2 items-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={decrement}
          >
            -
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded text-gray-700 font-semibold min-w-20 text-center">
            count is {count}
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={increment}
          >
            +
          </button>
        </div>
      </div>`;
  } else if (userChoices.styling === "styled-components") {
    return `<CounterSection>
        <CounterDescription>Zustand Counter Demo:</CounterDescription>
        <CounterContainer>
          <ButtonRow>
            <InteractiveButton onClick={decrement}>
              -
            </InteractiveButton>
            <CountDisplay>count is {count}</CountDisplay>
            <InteractiveButton onClick={increment}>
              +
            </InteractiveButton>
          </ButtonRow>
        </CounterContainer>
      </CounterSection>`;
  } else {
    // CSS styling
    return `<div className="counter-section">
        <p>Zustand Counter Demo:</p>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button onClick={decrement}>-</button>
          <span style="padding: 0.5rem 1rem; background-color: #f3f4f6; border-radius: 0.25rem; font-weight: 600;">count is {count}</span>
          <button onClick={increment}>+</button>
        </div>
      </div>`;
  }
}
