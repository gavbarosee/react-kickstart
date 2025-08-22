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
  if (userChoices.stateManagement !== "redux") return;

  const srcDir = path.join(projectPath, "src");
  const ext = CORE_UTILS.getComponentExtension(userChoices);

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
    const content = templateBuilder.generateAppWithCounter(
      userChoices,
      "redux"
    );

    // backup the original file
    fs.copyFileSync(appFile, `${appFile}.bak`);

    // write the new App file
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
import { decrement, increment, incrementByAmount } from '../store/counterSlice';`;

  // Add the imports after existing imports
  if (userChoices.typescript) {
    content = content.replace(
      /import React from 'react';/,
      `import React from 'react';\n${reduxImports}`
    );
  } else {
    // If no React import, add at the top
    if (content.includes("import")) {
      content = content.replace(/(import.*?\n)/, `$1${reduxImports}\n`);
    } else {
      content = `${reduxImports}\n\n${content}`;
    }
  }

  // Add Redux logic to the component
  const reduxLogic = `  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();`;

  // Replace the useState logic with Redux logic
  if (content.includes("useState")) {
    content = content.replace(
      /import { useState } from 'react';/,
      "import React from 'react';" // Remove useState, keep React if needed
    );
    content = content.replace(
      /const \[count, setCount\] = useState\(0\);/,
      reduxLogic
    );
  } else {
    // Add Redux logic after function declaration
    content = content.replace(
      /(export default function HomePage\(\) {\s*)/,
      `$1${reduxLogic}\n`
    );
  }

  // Check if there's an existing counter button to replace
  const hasExistingCounter =
    content.includes("setCount") || content.includes("count is");

  if (hasExistingCounter) {
    // Update existing button onClick handlers for Redux
    content = content.replace(
      /onClick={\(\) => setCount\(\(count\) => count \+ 1\)}/g,
      "onClick={() => dispatch(increment())}"
    );

    // Add decrement and increment by amount buttons if using styled-components
    if (userChoices.styling === "styled-components") {
      content = content.replace(
        /(<div>\s*<InteractiveButton[^>]*>[\s\S]*?<\/InteractiveButton>\s*<\/div>)/,
        `<div>
          <InteractiveButton onClick={() => dispatch(decrement())}>
            -
          </InteractiveButton>
          <InteractiveButton onClick={() => dispatch(increment())}>
            count is {count}
          </InteractiveButton>
          <InteractiveButton onClick={() => dispatch(incrementByAmount(5))}>
            +5
          </InteractiveButton>
        </div>`
      );
    } else if (userChoices.styling === "tailwind") {
      content = content.replace(
        /(<div>\s*<button[^>]*>[\s\S]*?<\/button>\s*<\/div>)/,
        `<div className="flex gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(decrement())}
          >
            -
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(increment())}
          >
            count is {count}
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(incrementByAmount(5))}
          >
            +5
          </button>
        </div>`
      );
    } else {
      // CSS styling
      content = content.replace(
        /(<div>\s*<button[^>]*>[\s\S]*?<\/button>\s*<\/div>)/,
        `<div>
          <button onClick={() => dispatch(decrement())}>-</button>
          <button onClick={() => dispatch(increment())}>count is {count}</button>
          <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
        </div>`
      );
    }
  } else {
    // No existing counter, add a new Redux counter section
    const counterSection = createReduxCounterSection(userChoices);

    // Add the counter after the welcome message
    content = content.replace(
      /(Welcome to your new React project with React Router!\s*<\/p>)/,
      `$1\n      ${counterSection}`
    );
  }

  // Write the updated content
  fs.writeFileSync(homePageFile, content);
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
        <div className="flex gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(decrement())}
          >
            -
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(increment())}
          >
            count is {count}
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(incrementByAmount(5))}
          >
            +5
          </button>
        </div>
      </div>`;
  } else if (userChoices.styling === "styled-components") {
    return `<CounterSection>
        <CounterDescription>Redux Counter Demo:</CounterDescription>
        <div>
          <InteractiveButton onClick={() => dispatch(decrement())}>
            -
          </InteractiveButton>
          <InteractiveButton onClick={() => dispatch(increment())}>
            count is {count}
          </InteractiveButton>
          <InteractiveButton onClick={() => dispatch(incrementByAmount(5))}>
            +5
          </InteractiveButton>
        </div>
      </CounterSection>`;
  } else {
    // CSS styling
    return `<div className="counter-section">
        <p>Redux Counter Demo:</p>
        <div>
          <button onClick={() => dispatch(decrement())}>-</button>
          <button onClick={() => dispatch(increment())}>count is {count}</button>
          <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
        </div>
      </div>`;
  }
}
