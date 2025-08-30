# Framework Generators

Concrete implementations of project generators for specific React frameworks.

## Purpose

Each framework directory contains the specific generator implementation and any framework-specific utilities needed to create projects for that framework.

## Structure

- `nextjs/` - Next.js project generation
  - `nextjs-generator.js` - Main Next.js generator class
  - `routers/` - Router-specific setup utilities
- `vite/` - Vite project generation
  - `vite-generator.js` - Main Vite generator class

## How it works

Framework generators:

- Extend the `BaseGenerator` class
- Implement framework-specific project structure creation
- Handle framework-specific configuration files
- Integrate with framework-specific features and routing options

## Adding a new framework

1. Create a new directory under `frameworks/`
2. Implement a generator class extending `BaseGenerator`
3. Add framework-specific configuration and file generation
4. Register the framework in the main generators index
