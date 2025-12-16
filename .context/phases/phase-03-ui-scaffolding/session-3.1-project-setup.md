# Session 3.1: Project Setup and Layout Structure

## Overview

This session establishes the foundation for the React UI by setting up Vite, configuring Tailwind CSS, and creating the main application layout. We'll configure path aliases for clean imports, set up the development environment, and build the top-level layout structure with four distinct regions: toolbar (top), canvas (center), sidebar (right), and timeline (bottom).

## Prerequisites

- Node.js 18+ installed
- Phase 1 complete (`src/core/` exists with types and simulator)
- Phase 2 complete (`src/state/` exists with Context and reducers)
- Familiarity with Vite and Tailwind CSS
- Understanding of CSS Grid and Flexbox

## Goals

- [ ] Initialize Vite project with React and TypeScript
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up TypeScript path aliases (`@/core`, `@/state`, `@/components`)
- [ ] Create `AppLayout` component with four regions
- [ ] Create `Toolbar`, `Canvas`, `Sidebar`, `Timeline` placeholder components
- [ ] Integrate `SimulatorContext` provider in App.tsx
- [ ] Configure Vite for development and production
- [ ] Verify hot module replacement (HMR) works
- [ ] Add basic responsive layout (mobile-first)

## Files to Create

### `vite.config.ts`
**Purpose:** Vite configuration with path aliases and React plugin
**Exports:** Vite config object
**Key responsibilities:**
- Configure path aliases matching tsconfig
- Enable React plugin
- Configure build options

### `tsconfig.json` (modify)
**Purpose:** Add path aliases for clean imports
**Changes:**
- Add `paths` configuration
- Set `baseUrl` to `./src`

### `tailwind.config.js`
**Purpose:** Tailwind CSS configuration with custom theme
**Exports:** Tailwind config
**Key responsibilities:**
- Define custom colors for task types
- Configure spacing scale
- Add custom utilities for animations (Phase 4)

### `postcss.config.js`
**Purpose:** PostCSS configuration for Tailwind
**Exports:** PostCSS config

### `src/styles/globals.css`
**Purpose:** Global styles and Tailwind imports
**Includes:**
- Tailwind directives
- CSS custom properties for colors
- Reset/normalize if needed

### `src/main.tsx`
**Purpose:** Application entry point
**Exports:** None (renders to DOM)
**Key responsibilities:**
- Render React root
- Import global styles

### `src/App.tsx`
**Purpose:** Root application component
**Exports:** `App` component
**Key responsibilities:**
- Wrap app in `SimulatorContext` provider
- Render `AppLayout`
- Handle error boundary (basic)

### `src/components/layout/AppLayout.tsx`
**Purpose:** Main layout structure
**Exports:** `AppLayout` component
**Key responsibilities:**
- Define CSS Grid layout with four regions
- Responsive breakpoints
- Integrate child layout components

### `src/components/layout/Toolbar.tsx`
**Purpose:** Top toolbar area
**Exports:** `Toolbar` component
**Key responsibilities:**
- Logo/title
- Settings icon placeholder
- Theme toggle placeholder

### `src/components/layout/Canvas.tsx`
**Purpose:** Central visualization canvas area
**Exports:** `Canvas` component
**Key responsibilities:**
- Container for visualization regions (Session 3.2)
- Background styling
- Responsive padding

### `src/components/layout/Sidebar.tsx`
**Purpose:** Right sidebar for panels
**Exports:** `Sidebar` component
**Key responsibilities:**
- Container for PanelContainer (Session 3.3)
- Collapsible on mobile
- Fixed width on desktop

### `src/components/layout/Timeline.tsx`
**Purpose:** Bottom timeline area
**Exports:** `Timeline` component
**Key responsibilities:**
- Placeholder for Phase 5 timeline scrubber
- Fixed height
- Responsive visibility

## Type Definitions

### AppLayout Props
```typescript
interface AppLayoutProps {
  children?: React.ReactNode;
}
```

### Layout Component Props
All layout components have no required props (placeholders for now):
```typescript
interface ToolbarProps {}
interface CanvasProps {}
interface SidebarProps {}
interface TimelineProps {}
```

## Implementation Specifications

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/state': path.resolve(__dirname, './src/state'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/animations': path.resolve(__dirname, './src/animations'),
      '@/styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### TypeScript Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@/core/*": ["./core/*"],
      "@/state/*": ["./state/*"],
      "@/components/*": ["./components/*"],
      "@/animations/*": ["./animations/*"],
      "@/styles/*": ["./styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Task type colors
        'task-sync': '#3b82f6',      // blue-500
        'task-timer': '#f97316',     // orange-500
        'task-microtask': '#a855f7', // purple-500
        'task-promise': '#9333ea',   // purple-600
        'task-fetch': '#22c55e',     // green-500
        'task-event': '#ec4899',     // pink-500
        'task-raf': '#eab308',       // yellow-500
        
        // Task state colors
        'state-created': '#9ca3af',    // gray-400
        'state-waiting': '#4b5563',    // gray-600
        'state-queued': '#60a5fa',     // blue-400
        'state-running': '#4ade80',    // green-400
        'state-completed': '#d1d5db',  // gray-300
        
        // Region backgrounds
        'region-callstack': '#1e293b',   // slate-800
        'region-webapis': '#312e81',     // indigo-900
        'region-queues': '#334155',      // slate-700
        'region-render': '#064e3b',      // emerald-900
        'region-console': '#18181b',     // zinc-900
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
};
```

### Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }
  
  body {
    @apply bg-zinc-950 text-zinc-100 font-sans;
  }
  
  #root {
    @apply h-screen w-screen overflow-hidden;
  }
}

@layer utilities {
  /* Custom utilities for Phase 4 animations */
  .gpu-accelerated {
    @apply transform-gpu;
  }
}
```

### AppLayout Component

```typescript
// src/components/layout/AppLayout.tsx
import React from 'react';
import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { Sidebar } from './Sidebar';
import { Timeline } from './Timeline';

export function AppLayout() {
  return (
    <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto] grid-cols-1 lg:grid-cols-[1fr_400px]">
      {/* Toolbar spans full width */}
      <header className="col-span-full">
        <Toolbar />
      </header>
      
      {/* Canvas - main visualization area */}
      <main className="overflow-auto bg-zinc-900">
        <Canvas />
      </main>
      
      {/* Sidebar - panels on the right (or bottom on mobile) */}
      <aside className="overflow-auto bg-zinc-950 border-l border-zinc-800 lg:row-span-2">
        <Sidebar />
      </aside>
      
      {/* Timeline at bottom */}
      <footer className="col-span-full border-t border-zinc-800">
        <Timeline />
      </footer>
    </div>
  );
}
```

**Layout breakdown:**
- **Desktop (lg+)**: Grid with two columns `[1fr 400px]` and three rows `[auto 1fr auto]`
  - Toolbar spans both columns (top)
  - Canvas takes left column (center)
  - Sidebar takes right column (spans center + bottom rows)
  - Timeline spans both columns (bottom)
- **Mobile**: Single column, stacked vertically

### Toolbar Component

```typescript
// src/components/layout/Toolbar.tsx
import React from 'react';

export function Toolbar() {
  return (
    <div className="h-16 px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        <h1 className="text-xl font-semibold">Event Loop Visualizer</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Placeholders for Session 5.1 controls */}
        <div className="text-sm text-zinc-500">Controls coming in Phase 5</div>
      </div>
    </div>
  );
}
```

### Canvas Component

```typescript
// src/components/layout/Canvas.tsx
import React from 'react';

export function Canvas() {
  return (
    <div className="h-full p-6">
      <div className="h-full rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        {/* Placeholder for Session 3.2 visualization regions */}
        <p className="text-zinc-500 text-center mt-20">
          Visualization canvas regions will be added in Session 3.2
        </p>
      </div>
    </div>
  );
}
```

### Sidebar Component

```typescript
// src/components/layout/Sidebar.tsx
import React from 'react';

export function Sidebar() {
  return (
    <div className="h-full p-6">
      {/* Placeholder for Session 3.3 panel container */}
      <p className="text-zinc-500 text-sm">
        Panel tabs will be added in Session 3.3
      </p>
    </div>
  );
}
```

### Timeline Component

```typescript
// src/components/layout/Timeline.tsx
import React from 'react';

export function Timeline() {
  return (
    <div className="h-20 px-6 flex items-center bg-zinc-900">
      {/* Placeholder for Phase 5 timeline scrubber */}
      <p className="text-zinc-500 text-sm">
        Timeline scrubber will be added in Phase 5
      </p>
    </div>
  );
}
```

### App Component

```typescript
// src/App.tsx
import React from 'react';
import { SimulatorProvider } from '@/state/SimulatorContext';
import { AppLayout } from '@/components/layout/AppLayout';

export function App() {
  return (
    <SimulatorProvider>
      <AppLayout />
    </SimulatorProvider>
  );
}
```

### Entry Point

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Success Criteria

- [ ] `npm run dev` starts development server on port 3000
- [ ] App renders without errors
- [ ] Four layout regions visible (toolbar, canvas, sidebar, timeline)
- [ ] Tailwind classes apply correctly
- [ ] Path aliases work (`import from '@/core/types'`)
- [ ] HMR updates UI without full reload
- [ ] Responsive layout: sidebar moves to bottom on mobile
- [ ] TypeScript compiles without errors
- [ ] Console has no warnings
- [ ] Build succeeds with `npm run build`

## Test Specifications

### Test: App renders without crashing
**Given:** Fresh app start
**When:** Navigate to localhost:3000
**Then:** App renders with no console errors

```typescript
// tests/unit/App.test.tsx
import { render, screen } from '@testing-library/react';
import { App } from '@/App';

test('renders app layout', () => {
  render(<App />);
  expect(screen.getByText('Event Loop Visualizer')).toBeInTheDocument();
});
```

### Test: Layout has all four regions
**Given:** AppLayout rendered
**When:** Check for toolbar, canvas, sidebar, timeline
**Then:** All regions present

```typescript
test('layout has all regions', () => {
  render(<App />);
  expect(screen.getByRole('banner')).toBeInTheDocument(); // header/toolbar
  expect(screen.getByRole('main')).toBeInTheDocument();   // canvas
  expect(screen.getByRole('complementary')).toBeInTheDocument(); // sidebar
  expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer/timeline
});
```

### Test: Path aliases resolve correctly
**Given:** Import using path alias
**When:** TypeScript compiles
**Then:** No errors, import resolves

```typescript
// Should not error at compile time
import { Task } from '@/core/types';
import { useSimulator } from '@/state/hooks';
```

### Test: Tailwind classes apply
**Given:** Component with Tailwind classes
**When:** Rendered
**Then:** Computed styles match expected values

```typescript
test('tailwind classes apply', () => {
  const { container } = render(<Toolbar />);
  const toolbar = container.firstChild as HTMLElement;
  const styles = window.getComputedStyle(toolbar);
  expect(styles.backgroundColor).toBeTruthy(); // bg-zinc-900 applied
});
```

### Test: Responsive layout
**Given:** Small viewport (< 1024px)
**When:** Render AppLayout
**Then:** Sidebar appears below canvas (single column)

```typescript
test('responsive layout on mobile', () => {
  window.innerWidth = 375;
  render(<App />);
  const layout = screen.getByRole('main').parentElement;
  expect(layout).toHaveClass('grid-cols-1');
});
```

## Integration Points

- **Phase 2**: Uses `SimulatorProvider` from `src/state/SimulatorContext.tsx`
- **Session 3.2**: Canvas will contain visualization regions
- **Session 3.3**: Sidebar will contain PanelContainer
- **Phase 5**: Timeline will contain scrubber controls

## References

- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Installation](https://tailwindcss.com/docs/installation/using-postcss)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [React 18 Docs](https://react.dev/)

## Notes

### Why Vite?
- Extremely fast HMR (< 100ms updates)
- Native ESM in development
- Simple configuration
- Excellent TypeScript support

### Why CSS Grid for layout?
- Better suited for app-style layouts than flexbox
- Named grid areas make intent clear
- Easy responsive reconfiguration
- Browser support excellent

### Path Alias Benefits
- Avoid relative path hell (`../../../core/types`)
- Clearer import sources
- Easier refactoring

### Tailwind Custom Theme
- Custom colors for task types ensure consistency
- Spacing scale matches design system
- Easy to extend later
