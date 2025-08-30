# Next.js Router Utilities

Router-specific setup utilities for Next.js projects.

## Purpose

These utilities handle the creation of Next.js project structures based on the chosen routing approach (App Router vs Pages Router).

## Structure

- `app-router.js` - Creates App Router project structure (Next.js 13+ app directory)
- `pages-router.js` - Creates Pages Router project structure (traditional pages directory)

## How it works

Router utilities:

- Create the appropriate directory structure for each routing approach
- Generate router-specific files (\_app.tsx, \_document.tsx, layout.tsx, etc.)
- Handle API route creation
- Integrate with styling solutions
- Use content generators to create framework-appropriate content

## Routing Differences

**App Router** (`app/`):

- Uses `app/` directory structure
- Requires `layout.tsx` and `page.tsx` files
- API routes in `app/api/`

**Pages Router** (`pages/`):

- Uses `pages/` directory structure
- Requires `_app.tsx` and optionally `_document.tsx`
- API routes in `pages/api/`
