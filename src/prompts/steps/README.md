# Prompt Steps

Individual prompt step implementations for collecting user preferences during project setup.

## Purpose

Each step file handles a specific aspect of project configuration, presenting choices to the user and validating their input.

## Structure

- `base-step.js` - Abstract base class for all prompt steps
- `framework-step.js` - Framework selection (Vite, Next.js)
- `language-step.js` - TypeScript vs JavaScript choice
- `styling-step.js` - Styling solution selection
- `state-management-step.js` - State management library choice
- `api-step.js` - API client setup options
- `testing-step.js` - Testing framework selection
- `routing-step.js` - Routing library choice (Vite only)
- `nextjs-routing-step.js` - Next.js routing options (app/pages router)
- `package-manager-step.js` - Package manager selection
- `code-quality-step.js` - Linting and formatting options
- `git-step.js` - Git initialization choice
- `editor-step.js` - Code editor selection and opening
- `deployment-step.js` - Deployment platform options

## How it works

Each step:

- Extends the `BaseStep` class
- Defines available choices and validation rules
- Handles conditional logic (e.g., routing only for Vite)
- Provides help text and descriptions
- Manages navigation between steps

## Step Flow

Steps are orchestrated by the `prompt-flow.js` which handles:

- Sequential step execution
- Navigation (forward/backward)
- Choice validation and dependencies
- Final configuration compilation
