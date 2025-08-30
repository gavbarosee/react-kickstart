# Prompt Navigation

Navigation utilities for managing user interaction during the prompt flow.

## Purpose

These utilities handle keyboard navigation, step management, and user interaction during the CLI prompt sequence.

## Structure

- `navigation-manager.js` - Singleton manager for keyboard navigation and listener management
- `step-navigator.js` - Tracks forward/backward navigation between prompt steps

## How it works

**Navigation Manager**:

- Manages keyboard event listeners to prevent memory leaks
- Handles back navigation (left arrow, backspace)
- Provides cleanup functionality for process exit
- Prevents MaxListenersExceededWarning issues

**Step Navigator**:

- Tracks current step position in the prompt flow
- Manages step history for backward navigation
- Handles step validation and transitions
- Provides navigation state management

## Features

- Memory-safe keyboard listener management
- Robust navigation with proper cleanup
- Support for going back to previous steps
- Prevention of listener accumulation
- Graceful handling of process termination
