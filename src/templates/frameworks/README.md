# Content Generators

Framework-specific content generation strategies for creating React application files.

## Purpose

These content generators create the actual code content for React applications based on the chosen framework and routing options. They work with the template engines to generate framework-specific files.

## Structure

- `base-content-generator.js` - Abstract base class for all content generators
- `vite-content-generator.js` - Content generation for Vite projects
- `nextjs-app-router-generator.js` - Content generation for Next.js App Router
- `nextjs-pages-router-generator.js` - Content generation for Next.js Pages Router

## How it works

Content generators:

- Generate framework-specific entry points (main.tsx, \_app.tsx, etc.)
- Create appropriate App components for each framework
- Handle routing-specific content variations
- Integrate with styling and state management choices

## Usage

```javascript
import { createContentGenerator } from "./index.js";

const generator = createContentGenerator("nextjs", "app");
const appContent = generator.generateAppComponent(ext, styling, userChoices);
```
