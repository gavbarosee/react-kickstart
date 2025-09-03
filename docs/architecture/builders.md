# Builders

Configuration and package.json builders for React applications.

## Structure

- `configuration-builder.js` - Generates framework and feature configuration files
- `package-json-builder.js` - Builds package.json with scripts and dependencies
- `dependency-resolver.js` - Manages dependency placement and versions
- `dependencies.js` - Version catalog and dependency definitions

## How it works

Builders provide:

- Consistent configuration file generation
- Dependency management and resolution
- Framework-specific build scripts
- Feature-based configuration merging

The builders work together to create a complete, working project configuration based on user choices and selected features.
