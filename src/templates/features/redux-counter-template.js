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
  if (userChoices.stateManagement !== "redux") return;

  const ext = CORE_UTILS.getComponentExtension(userChoices);

  // Handle Next.js framework
  if (userChoices.framework === "nextjs") {
    if (userChoices.nextRouting === "app") {
      addReduxCounterToNextjsAppPage(projectPath, userChoices);
    } else {
      addReduxCounterToNextjsPagesIndex(projectPath, userChoices);
    }
    return;
  }

  // Handle other frameworks
  const srcDir = path.join(projectPath, "src");

  // Check if routing is enabled
  if (userChoices.routing && userChoices.routing !== "none") {
    // If routing is enabled, add Redux counter to HomePage instead of replacing App
    addReduxCounterToHomePage(projectPath, userChoices);
  } else {
    // If no routing, replace App component as before
    const appFile = path.join(srcDir, `App.${ext}`);
    if (!fs.existsSync(appFile)) return;

    // Generate App component using CommonTemplateBuilder
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateAppWithCounter(userChoices, "redux");

    fs.writeFileSync(appFile, content);
  }
}

/**
 * Adds Redux counter functionality to the HomePage component
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
function addReduxCounterToHomePage(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);
  const pagesDir = path.join(projectPath, "src", "pages");
  const homePageFile = path.join(pagesDir, `HomePage.${ext}`);

  if (!fs.existsSync(homePageFile)) return;

  let content = fs.readFileSync(homePageFile, "utf-8");

  // Add Redux imports
  const reduxImports = `import { useAppSelector, useAppDispatch } from '../store/hooks';
import { decrement, increment } from '../store/counterSlice';`;

  // Add the imports after existing imports
  if (userChoices.typescript) {
    // Check if React is already imported to avoid duplicates
    if (content.includes("import React from 'react';")) {
      // Find all imports and add Redux imports after the last one
      const allImports = content.match(/import.*?from.*?;/g);
      if (allImports && allImports.length > 0) {
        const lastImport = allImports[allImports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const lastImportEnd = lastImportIndex + lastImport.length;
        content =
          content.slice(0, lastImportEnd) +
          `\n${reduxImports}` +
          content.slice(lastImportEnd);
      } else {
        // Fallback: add after the first React import
        content = content.replace(
          /import React from 'react';/,
          `import React from 'react';\n${reduxImports}`,
        );
      }
    } else {
      // No React import exists, add both
      if (content.includes("import")) {
        content = content.replace(
          /(import.*?\n)/,
          `import React from 'react';\n${reduxImports}\n$1`,
        );
      } else {
        content = `import React from 'react';\n${reduxImports}\n\n${content}`;
      }
    }
  } else {
    // If no React import, add at the top
    if (content.includes("import")) {
      content = content.replace(/(import.*?\n)/, `$1${reduxImports}\n`);
    } else {
      content = `${reduxImports}\n\n${content}`;
    }
  }

  // Add styled components for counter if using styled-components
  if (userChoices.styling === "styled-components") {
    // Check if InteractiveButton already exists to avoid duplicates
    const hasExistingInteractiveButton = content.includes(
      "const InteractiveButton = styled.button",
    );

    // Add the new styled components after existing ones
    let styledComponents = `
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

    // Only add InteractiveButton if it doesn't already exist
    if (!hasExistingInteractiveButton) {
      styledComponents += `

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
    }

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

  // Add Redux logic to the component
  const reduxLogic = `  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();`;

  // Replace the useState logic with Redux logic
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

    content = content.replace(/const \[count, setCount\] = useState\(0\);/, reduxLogic);
  } else {
    // Add Redux logic after function declaration
    content = content.replace(
      /(export default function HomePage\(\) {\s*)/,
      `$1${reduxLogic}\n`,
    );
  }

  // Check if there's an existing counter button to replace
  const hasExistingCounter =
    content.includes("setCount") || content.includes("count is");

  if (hasExistingCounter) {
    // Update existing button onClick handlers for Redux
    content = content.replace(
      /onClick={\(\) => setCount\(\(count\) => count \+ 1\)}/g,
      "onClick={() => dispatch(increment())}",
    );

    // Add decrement and increment by amount buttons if using styled-components
    if (userChoices.styling === "styled-components") {
      content = content.replace(
        /(<div>\s*<InteractiveButton[^>]*>[\s\S]*?<\/InteractiveButton>\s*<\/div>)/,
        `<CounterContainer>
          <ButtonRow>
            <InteractiveButton onClick={() => dispatch(decrement())}>
              -
            </InteractiveButton>
            <CountDisplay>count is {count}</CountDisplay>
            <InteractiveButton onClick={() => dispatch(increment())}>
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
            onClick={() => dispatch(decrement())}
          >
            -
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded text-gray-700 font-semibold min-w-20 text-center">
            count is {count}
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(increment())}
          >
            +
          </button>
        </div>`,
      );
    } else {
      // CSS styling
      content = content.replace(
        /(<div>\s*<button[^>]*>[\s\S]*?<\/button>\s*<\/div>)/,
        `<div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
          <button onClick={() => dispatch(decrement())}>-</button>
          <span style={{padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', borderRadius: '0.25rem', fontWeight: 600}}>count is {count}</span>
          <button onClick={() => dispatch(increment())}>+</button>
        </div>`,
      );
    }
  } else {
    // No existing counter, add a new Redux counter section
    const counterSection = createReduxCounterSection(userChoices);

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
 * Adds Redux counter functionality to Next.js App Router page component
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
function addReduxCounterToNextjsAppPage(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);
  const pageFile = path.join(projectPath, "app", `page.${ext}`);

  if (!fs.existsSync(pageFile)) return;

  let content = fs.readFileSync(pageFile, "utf-8");

  // Add Redux imports after 'use client' directive if it exists
  const reduxImports = `import { useAppSelector, useAppDispatch } from '../lib/hooks';\nimport { decrement, increment, incrementByAmount } from '../lib/features/counter/counterSlice';`;

  // Find the position to insert imports
  if (content.includes("'use client'")) {
    content = content.replace(/('use client';?\s*)/, `$1\n${reduxImports}\n`);
  } else {
    // Add 'use client' directive and imports at the top
    content = `'use client';\n\n${reduxImports}\n\n${content}`;
  }

  // Add styled components for counter if using styled-components
  if (userChoices.styling === "styled-components") {
    // Check if InteractiveButton already exists to avoid duplicates
    const hasExistingInteractiveButton = content.includes(
      "const InteractiveButton = styled.button",
    );

    // Add the new styled components after existing ones
    let styledComponents = `
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

    // Only add InteractiveButton if it doesn't already exist
    if (!hasExistingInteractiveButton) {
      styledComponents += `

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
    }

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

  // Add Redux logic to the component
  const reduxLogic = `  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();`;

  // Replace the component function to include Redux logic - more flexible regex
  content = content.replace(
    /(export default function Home\(\)\s*{)/,
    `$1\n${reduxLogic}\n`,
  );

  // Add Redux counter section to the component
  const counterSection = createReduxCounterSection(userChoices);

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
 * Adds Redux counter functionality to Next.js Pages Router index page
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
function addReduxCounterToNextjsPagesIndex(projectPath, userChoices) {
  const ext = CORE_UTILS.getComponentExtension(userChoices);
  const indexFile = path.join(projectPath, "pages", `index.${ext}`);

  if (!fs.existsSync(indexFile)) return;

  let content = fs.readFileSync(indexFile, "utf-8");

  // Add Redux imports at the top (Pages Router doesn't need 'use client')
  const reduxImports = `import { useAppSelector, useAppDispatch } from '../lib/hooks';\nimport { decrement, increment, incrementByAmount } from '../lib/features/counter/counterSlice';`;

  // Find where to insert imports
  if (content.includes("import")) {
    // Add after last import
    const lastImportIndex = content.lastIndexOf("import");
    const endOfLastImport = content.indexOf("\n", lastImportIndex);
    content =
      content.slice(0, endOfLastImport + 1) +
      reduxImports +
      "\n" +
      content.slice(endOfLastImport + 1);
  } else {
    // Add at the top if no imports exist
    content = reduxImports + "\n\n" + content;
  }

  // Add styled components for counter if using styled-components
  if (userChoices.styling === "styled-components") {
    // Check if InteractiveButton already exists to avoid duplicates
    const hasExistingInteractiveButton = content.includes(
      "const InteractiveButton = styled.button",
    );

    // Add the new styled components after existing ones
    let styledComponents = `
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

    // Only add InteractiveButton if it doesn't already exist
    if (!hasExistingInteractiveButton) {
      styledComponents += `

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
    }

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

  // Add Redux logic to the component
  const reduxLogic = `  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();`;

  // Replace the component function to include Redux logic - more flexible regex
  content = content.replace(
    /(export default function Home\(\)\s*{)/,
    `$1\n${reduxLogic}\n`,
  );

  // Add Redux counter section to the component
  const counterSection = createReduxCounterSection(userChoices);

  // Add the counter section before the closing tag of the main/Container
  if (userChoices.styling === "styled-components") {
    content = content.replace(/(<\/Main>)/, `        ${counterSection}\n      $1`);
  } else if (userChoices.styling === "tailwind") {
    content = content.replace(/(<\/main>)/, `      ${counterSection}\n    $1`);
  } else {
    // CSS styling
    content = content.replace(/(<\/main>)/, `      ${counterSection}\n    $1`);
  }

  // Write the updated content
  fs.writeFileSync(indexFile, content);
}

/**
 * Creates a Redux counter section based on the styling choice
 * @param {Object} userChoices - User configuration options
 * @returns {string} - Counter section HTML/JSX
 */
function createReduxCounterSection(userChoices) {
  if (userChoices.styling === "tailwind") {
    return `<div className="mt-6">
        <p className="text-gray-600 mb-4">Redux Counter Demo:</p>
        <div className="flex gap-2 items-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(decrement())}
          >
            -
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded text-gray-700 font-semibold min-w-20 text-center">
            count is {count}
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(increment())}
          >
            +
          </button>
        </div>
      </div>`;
  } else if (userChoices.styling === "styled-components") {
    return `<CounterSection>
        <CounterDescription>Redux Counter Demo:</CounterDescription>
        <CounterContainer>
          <ButtonRow>
            <InteractiveButton onClick={() => dispatch(decrement())}>
              -
            </InteractiveButton>
            <CountDisplay>count is {count}</CountDisplay>
            <InteractiveButton onClick={() => dispatch(increment())}>
              +
            </InteractiveButton>
          </ButtonRow>
        </CounterContainer>
      </CounterSection>`;
  } else {
    // CSS styling
    return `<div className="counter-section">
        <p>Redux Counter Demo:</p>
        <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
          <button onClick={() => dispatch(decrement())}>-</button>
          <span style={{padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', borderRadius: '0.25rem', fontWeight: 600}}>count is {count}</span>
          <button onClick={() => dispatch(increment())}>+</button>
        </div>
      </div>`;
  }
}
