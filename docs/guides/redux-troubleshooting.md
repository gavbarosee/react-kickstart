# Redux Troubleshooting Guide

This guide helps you troubleshoot common Redux setup issues in React Kickstart projects.

## Common Error: "could not find react-redux context value"

This error occurs when Redux components are not wrapped in a Redux Provider. Here's how to fix it:

### For Next.js App Router Projects

1. **Check if StoreProvider exists**:

   ```bash
   # Should exist: app/StoreProvider.tsx (or .jsx)
   ls app/StoreProvider.*
   ```

2. **Verify StoreProvider content**:

   ```tsx
   "use client";

   import { useRef } from "react";
   import { Provider } from "react-redux";
   import { makeStore, AppStore } from "../lib/store";

   export default function StoreProvider({ children }: { children: React.ReactNode }) {
     const storeRef = useRef<AppStore | null>(null);
     if (!storeRef.current) {
       storeRef.current = makeStore();
     }

     return <Provider store={storeRef.current}>{children}</Provider>;
   }
   ```

3. **Check app/layout.tsx**:

   ```tsx
   import StoreProvider from "./StoreProvider";

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en">
         <body>
           <StoreProvider>{children}</StoreProvider>
         </body>
       </html>
     );
   }
   ```

### For Next.js Pages Router Projects

1. **Check if StoreProvider exists**:

   ```bash
   # Should exist: components/StoreProvider.tsx (or .jsx)
   ls components/StoreProvider.*
   ```

2. **Check pages/\_app.tsx**:

   ```tsx
   import StoreProvider from "../components/StoreProvider";

   export default function App({ Component, pageProps }) {
     return (
       <StoreProvider>
         <Component {...pageProps} />
       </StoreProvider>
     );
   }
   ```

### For Standard React Projects (Vite, CRA)

1. **Check src/main.tsx or src/index.tsx**:

   ```tsx
   import React from "react";
   import ReactDOM from "react-dom/client";
   import { Provider } from "react-redux";
   import { store } from "./store/store";
   import App from "./App";

   ReactDOM.createRoot(document.getElementById("root")!).render(
     <React.StrictMode>
       <Provider store={store}>
         <App />
       </Provider>
     </React.StrictMode>,
   );
   ```

## Manual Fix Steps

If the automatic setup failed, follow these steps:

### Step 1: Create StoreProvider (Next.js only)

For **App Router**, create `app/StoreProvider.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
```

For **Pages Router**, create `components/StoreProvider.tsx`:

```tsx
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
```

### Step 2: Update Layout/Entry Point

**App Router** - Update `app/layout.tsx`:

```tsx
import StoreProvider from "./StoreProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
```

**Pages Router** - Update `pages/_app.tsx`:

```tsx
import StoreProvider from "../components/StoreProvider";

export default function App({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  );
}
```

**Standard React** - Update `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

## Verification Steps

1. **Check file structure**:

   ```
   Next.js App Router:
   ├── app/
   │   ├── StoreProvider.tsx
   │   └── layout.tsx
   ├── lib/
   │   ├── store.ts
   │   ├── hooks.ts
   │   └── features/counter/counterSlice.ts

   Next.js Pages Router:
   ├── components/
   │   └── StoreProvider.tsx
   ├── pages/
   │   └── _app.tsx
   ├── lib/
   │   ├── store.ts
   │   ├── hooks.ts
   │   └── features/counter/counterSlice.ts

   Standard React:
   ├── src/
   │   ├── store/
   │   │   ├── store.ts
   │   │   ├── hooks.ts
   │   │   └── counterSlice.ts
   │   └── main.tsx
   ```

2. **Test Redux hooks**:

   ```tsx
   import { useAppSelector, useAppDispatch } from "../lib/hooks"; // Next.js
   // or
   import { useAppSelector, useAppDispatch } from "../store/hooks"; // Standard React

   function TestComponent() {
     const count = useAppSelector((state) => state.counter.value);
     const dispatch = useAppDispatch();

     return <div>Count: {count}</div>;
   }
   ```

3. **Check browser console**: Look for any import errors or missing files.

## Common Issues

### Issue: Import path errors

**Solution**: Verify import paths match your project structure:

- Next.js: `'../lib/store'`, `'../lib/hooks'`
- Standard React: `'./store/store'`, `'./store/hooks'`

### Issue: "makeStore is not a function"

**Solution**: Check that your store file exports `makeStore` (Next.js) or `store` (standard React).

### Issue: TypeScript errors

**Solution**: Ensure you have the correct type exports in your store and hooks files.

### Issue: SSR hydration mismatches (Next.js)

**Solution**: Make sure StoreProvider has the `'use client'` directive for App Router.

### Issue: Redux counter buttons not working (clicks don't update state)

**Solution**: This is usually caused by incorrect Redux hooks export. Check your `lib/hooks.ts` file:

```tsx
import { useDispatch, useSelector } from "react-redux";

// Correct - direct assignment
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// Incorrect - function wrapper (causes issues)
// export const useAppDispatch = () => useDispatch();
```

### Issue: Next.js streaming errors with styled-components and Redux

**Solution**: This is often caused by conflicts between styled-components SSR and Next.js streaming. The issue has been resolved by simplifying the styled-components registry to avoid SSR conflicts.

**Current Implementation**: The StyledComponentsRegistry now uses a simplified approach that prevents streaming errors:

```tsx
export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simplified approach - just return children on client side
  if (typeof window !== "undefined") return <>{children}</>;

  // Fallback: if SSR is causing issues, just return children without SSR
  // This will cause a brief flash of unstyled content but prevents crashes
  return <>{children}</>;
}
```

**Provider Nesting**: Ensure proper nesting in your `app/layout.tsx`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </StoreProvider>
      </body>
    </html>
  );
}
```

**Note**: This approach prioritizes stability over perfect SSR. Styled-components will still work correctly, and fonts are now properly configured using Next.js font optimization.

### Issue: Font fallback or styling issues with styled-components

**Solution**: This has been resolved by adding proper Next.js font configuration. The layout now includes:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </StoreProvider>
      </body>
    </html>
  );
}
```

This ensures proper font loading and eliminates font fallback issues.

### Issue: "Can't find variable: CounterSection" or "InteractiveButton is not defined" (styled-components)

**Solution**: This occurs when styled components are not properly defined. Check that your page component includes all the styled component definitions:

```tsx
const CounterSection = styled.div`
  margin-top: 2rem;
`;

const CounterDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const CounterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const CountDisplay = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  min-width: 80px;
  text-align: center;
`;

const InteractiveButton = styled.button`
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
`;
```

These should be added after your imports and before your component function.

## Getting Help

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Verify all Redux files were created correctly
3. Ensure import paths are correct for your project structure
4. Check that the Provider is wrapping your component tree

For more help, refer to the [Redux Toolkit documentation](https://redux-toolkit.js.org/) or [React Redux documentation](https://react-redux.js.org/).
