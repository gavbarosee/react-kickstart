# Generators

Framework-specific project generators that create React applications.

## Structure

- `base-generator.js` - Abstract base class implementing the Template Method pattern
- `frameworks/` - Concrete generators for each supported framework (Vite, Next.js, etc.)
- `content/` - Content generation strategies for different frameworks and routing options

## How it works

Each generator extends `BaseGenerator` and implements framework-specific logic for:

- Project structure creation
- Configuration file generation
- Feature integration
- Development server setup
