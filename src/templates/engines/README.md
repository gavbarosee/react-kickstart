# Template Engines

Core template engines and rendering infrastructure for generating React application code.

## Purpose

These engines provide the foundational template processing capabilities used throughout the CLI tool for generating files, UI output, and content.

## Structure

- `template-engine.js` - Core template engine with theme support and template registration
- `file-template-engine.js` - Specialized engine for generating project files and components
- `ui-renderer.js` - Specialized engine for console UI rendering and output formatting
- `common-template-builder.js` - Builder for common template patterns and components

## How it works

**Template Engine**:

- Centralized template processing with theme support
- Template registration and rendering system
- Supports both UI and file generation templates

**File Template Engine**:

- Specialized for generating React components and project files
- Pre-loaded with React component templates
- Handles framework-specific file generation patterns

**UI Renderer**:

- Specialized for console output formatting
- Provides consistent CLI styling and theming
- Handles progress indicators, headers, and formatted output

**Common Template Builder**:

- Provides reusable template building patterns
- Generates common component structures
- Integrates with state management and styling choices
