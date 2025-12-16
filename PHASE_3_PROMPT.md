# Event Loop Visualizer - Phase 3: UI Scaffolding Implementation

You are implementing Phase 3 of the Event Loop Visualizer project. This phase creates the UI scaffolding - the layout structure, visualization canvas, and panel system that will house the animated components in Phase 4.

## Project Context

**Phase 1 Status**: COMPLETE ✅
- 211 tests passing
- Core simulator fully functional
- Zero UI dependencies

**Phase 2 Status**: COMPLETE ✅
- 53 tests passing (264 total)
- State management with history/time-travel
- Custom hooks for all operations
- SimulatorProvider wrapping Phase 1 core

Read these files for context:
- `.context/README.md` - Project overview
- `.context/architecture/overview.md` - System architecture
- `.context/phases/phase-03-ui-scaffolding/README.md` - Phase overview
- `PHASE_2_COMPLETE.md` - Phase 2 summary

## Phase 3 Goals

Implement 4 sessions to create the UI scaffolding:

1. **Session 3.1**: Project setup and basic layout structure
2. **Session 3.2**: Visualization canvas with regions for each queue
3. **Session 3.3**: Panel structure (controls, explanation, inspector)
4. **Session 3.4**: Common components (TaskCard, QueueDisplay)

## Session Overview

### Session 3.1: Project Setup & Layout (2-3 hours)
Set up the React app structure and create the main layout shell.

**Files to create:**
- `src/ui/App.tsx` - Main application component
- `src/ui/Layout.tsx` - Overall layout structure
- `src/ui/components/Header.tsx` - App header
- `src/ui/styles/layout.css` - Layout styles
- `index.html` - Root HTML file
- `src/main.tsx` - React entry point

**Key features:**
- Three-column layout: left panel (controls), center (canvas), right panel (info)
- Responsive grid using CSS Grid or Flexbox
- Header with title and settings button placeholder
- Footer with phase/step indicator
- Dark mode support (CSS variables)
- Mobile-responsive breakpoints

**Success criteria:**
- Layout renders without errors
- Responsive at 320px, 768px, 1024px, 1440px
- SimulatorProvider wraps entire app
- All three regions visible and sized appropriately
- Header and footer in correct positions

### Session 3.2: Visualization Canvas (3-4 hours)
Create the central canvas with distinct regions for each queue/stack.

**Files to create:**
- `src/ui/components/Canvas/VisualizationCanvas.tsx` - Main canvas
- `src/ui/components/Canvas/CallStackRegion.tsx` - Call stack display area
- `src/ui/components/Canvas/WebApisRegion.tsx` - Web APIs display area
- `src/ui/components/Canvas/MacroQueueRegion.tsx` - Macro queue area
- `src/ui/components/Canvas/MicroQueueRegion.tsx` - Micro queue area
- `src/ui/components/Canvas/RafQueueRegion.tsx` - RAF queue area
- `src/ui/styles/canvas.css` - Canvas styles

**Key features:**
- Canvas divided into labeled regions
- Each region has:
  - Title label
  - Background color (from design system)
  - Placeholder for task nodes
  - Empty state message
- Visual flow indicators (arrows between regions)
- Proper spacing and padding
- Region sizes based on typical content

**Success criteria:**
- All 5 regions visible and labeled
- Empty state shows "No tasks" message
- Regions respond to window resize
- Flow arrows visible between regions
- Canvas fills available space in layout
- Proper z-index layering

### Session 3.3: Panel Structure (2-3 hours)
Build the left and right panel structures.

**Files to create:**
- `src/ui/components/Panels/ControlPanel.tsx` - Left panel
- `src/ui/components/Panels/PlaybackControls.tsx` - Play/pause/step buttons
- `src/ui/components/Panels/InfoPanel.tsx` - Right panel
- `src/ui/components/Panels/StatusDisplay.tsx` - Current state info
- `src/ui/components/Panels/ExplanationPlaceholder.tsx` - Explanation area
- `src/ui/styles/panels.css` - Panel styles

**Key features:**
- **Control Panel (Left)**:
  - Playback controls (play, pause, step forward, step back, reset)
  - Speed selector (0.25x, 0.5x, 1x, 2x, 4x) - UI only, functionality in Phase 5
  - Scenario selector dropdown - UI only, functionality in Phase 6
  - Collapsible sections
  
- **Info Panel (Right)**:
  - Status display (step #, time, queue sizes)
  - Explanation placeholder (will show context in Phase 8)
  - Task inspector placeholder (will show selected task in Phase 8)
  - Collapsible sections

**Success criteria:**
- Control panel renders with all buttons
- Step forward/back/reset buttons work (using Phase 2 hooks)
- Status display shows live data from simulator state
- Panels collapse/expand with animation
- Mobile: panels stack vertically
- Proper overflow scrolling

### Session 3.4: Common Components (2-3 hours)
Create reusable components for tasks and queues.

**Files to create:**
- `src/ui/components/TaskCard.tsx` - Single task display
- `src/ui/components/QueueDisplay.tsx` - Generic queue display
- `src/ui/components/EmptyState.tsx` - Empty queue message
- `src/ui/components/QueueLabel.tsx` - Queue title/label
- `src/ui/styles/components.css` - Component styles

**Key features:**
- **TaskCard**:
  - Shows task type, ID, label
  - Color-coded by task type
  - Hover state
  - Click to select (state only, no effects yet)
  - Props: task, isSelected, onClick
  
- **QueueDisplay**:
  - Generic container for tasks
  - Renders list of TaskCards
  - Shows empty state when no tasks
  - Props: tasks, title, orientation (vertical/horizontal)
  
- **EmptyState**:
  - Displays "No tasks" with icon
  - Props: message

- **QueueLabel**:
  - Region title with optional count badge
  - Props: title, count

**Success criteria:**
- TaskCard renders all task types correctly
- TaskCard colors match design system
- QueueDisplay shows tasks in order
- EmptyState displays when queues empty
- Components are properly typed with TypeScript
- Components are pure (no side effects)

## Implementation Strategy

**Run sessions sequentially** (not in parallel):

1. **Session 3.1**: Foundation - layout must exist before canvas/panels
2. **Session 3.2**: Canvas - central visualization area
3. **Session 3.3**: Panels - controls and info areas
4. **Session 3.4**: Components - reusable pieces

## Technology Stack

- **React 19**: Already installed in Phase 2
- **Vite**: For development and building
- **CSS**: Plain CSS with CSS variables (no Tailwind/styled-components yet)
- **TypeScript**: Strict mode
- **Vitest**: For component testing

## Design System (Colors & Spacing)

### Colors
```css
:root {
  /* Queue/Region Colors */
  --color-call-stack: #3b82f6;      /* Blue */
  --color-web-apis: #8b5cf6;        /* Purple */
  --color-macro-queue: #10b981;     /* Green */
  --color-micro-queue: #f59e0b;     /* Orange */
  --color-raf-queue: #ec4899;       /* Pink */
  
  /* Task Type Colors */
  --color-task-sync: #6366f1;       /* Indigo */
  --color-task-timer: #10b981;      /* Green */
  --color-task-interval: #14b8a6;   /* Teal */
  --color-task-microtask: #f59e0b;  /* Orange */
  --color-task-promise: #f97316;    /* Deep orange */
  --color-task-fetch: #8b5cf6;      /* Purple */
  --color-task-dom: #ec4899;        /* Pink */
  --color-task-raf: #ef4444;        /* Red */
  
  /* UI Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-border: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  
  /* Dark Mode */
  --color-bg-primary-dark: #1f2937;
  --color-bg-secondary-dark: #111827;
  --color-border-dark: #374151;
  --color-text-primary-dark: #f9fafb;
  --color-text-secondary-dark: #9ca3af;
}

/* Spacing Scale */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Layout Dimensions
- **Header height**: 64px
- **Footer height**: 48px
- **Left panel width**: 280px (desktop), 100% (mobile)
- **Right panel width**: 320px (desktop), 100% (mobile)
- **Canvas min-height**: 400px
- **Task card size**: 80px × 60px (will be refined in Phase 4)

## Success Criteria

Phase 3 is complete when:
- [ ] Layout structure renders correctly at all breakpoints
- [ ] All 5 canvas regions are visible and labeled
- [ ] Control panel buttons use Phase 2 hooks and work
- [ ] Status display shows live simulator data
- [ ] TaskCard renders all task types with correct colors
- [ ] QueueDisplay shows tasks in correct order
- [ ] Empty states display when queues are empty
- [ ] All components are TypeScript strict mode compliant
- [ ] Component tests pass (snapshot + interaction tests)
- [ ] Responsive design works on mobile (320px) to desktop (1440px+)
- [ ] No console errors or warnings
- [ ] Phase 1 and Phase 2 tests still pass (264 tests)

## File Structure

```
src/ui/
├── App.tsx                        # Main app component
├── Layout.tsx                     # Layout shell
├── main.tsx                       # React entry point
├── components/
│   ├── Header.tsx
│   ├── TaskCard.tsx
│   ├── QueueDisplay.tsx
│   ├── EmptyState.tsx
│   ├── QueueLabel.tsx
│   ├── Canvas/
│   │   ├── VisualizationCanvas.tsx
│   │   ├── CallStackRegion.tsx
│   │   ├── WebApisRegion.tsx
│   │   ├── MacroQueueRegion.tsx
│   │   ├── MicroQueueRegion.tsx
│   │   └── RafQueueRegion.tsx
│   └── Panels/
│       ├── ControlPanel.tsx
│       ├── PlaybackControls.tsx
│       ├── InfoPanel.tsx
│       ├── StatusDisplay.tsx
│       └── ExplanationPlaceholder.tsx
└── styles/
    ├── global.css                 # CSS reset + variables
    ├── layout.css
    ├── canvas.css
    ├── panels.css
    └── components.css

tests/unit/ui/
├── Layout.test.tsx
├── TaskCard.test.tsx
├── QueueDisplay.test.tsx
└── Canvas/
    └── VisualizationCanvas.test.tsx

public/
└── (assets if needed)

index.html                         # Root HTML
```

## Example Target UI (Session 3.1 Result)

```tsx
import { SimulatorProvider } from '@/state';
import { Layout } from './Layout';

function App() {
  return (
    <SimulatorProvider>
      <Layout />
    </SimulatorProvider>
  );
}

// Layout structure
function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <ControlPanel />
        <VisualizationCanvas />
        <InfoPanel />
      </div>
      <Footer />
    </div>
  );
}
```

## Integration with Phase 2

Phase 3 uses Phase 2 hooks:
- `useSimulator()` - Access full state for displays
- `useStepForward()` - Step forward button
- `useStepBack()` - Step back button
- `useHistory()` - Reset button
- `useCurrentStep()` - Status display
- `useCurrentTime()` - Status display
- `useIsSimulationComplete()` - Disable forward button

No Phase 1 or Phase 2 code should be modified.

## Testing Strategy

### Component Tests (using React Testing Library)
- **Layout Tests**: Verify all regions render
- **Canvas Tests**: Verify all 5 regions present
- **Panel Tests**: Verify buttons render and click handlers work
- **TaskCard Tests**: Verify correct color for each task type
- **QueueDisplay Tests**: Verify tasks render in order

### Snapshot Tests
- Capture layout structure
- Capture empty states
- Capture task card variations

### Accessibility Tests
- Keyboard navigation (Phase 7 will expand this)
- ARIA labels on interactive elements
- Color contrast ratios

## Next Steps After Phase 3

Once Phase 3 is complete, Phase 4 will add animations:
- Task node movements between queues
- Smooth transitions
- Coordinated timing
- Framer Motion integration

Phase 3 provides the static structure; Phase 4 brings it to life.

## Notes

- **No Animations Yet**: Phase 3 is static UI only
- **Placeholder Controls**: Speed/scenario selectors are UI-only (functionality in later phases)
- **Task Selection**: Click handlers store state but have no visual effect yet
- **Mobile First**: Design for mobile, enhance for desktop
- **Performance**: Avoid premature optimization; Phase 4 will handle animation performance
- **Accessibility**: Basic ARIA labels now, full keyboard nav in Phase 7

## Development Server Setup

Before starting, set up Vite dev server:

```json
// package.json - add scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

```typescript
// vite.config.ts - update for React
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/core': resolve(__dirname, './src/core'),
      '@/state': resolve(__dirname, './src/state'),
      '@/ui': resolve(__dirname, './src/ui'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
  },
});
```

## Begin Implementation

Start with Session 3.1: Create the project setup with `index.html`, `main.tsx`, basic `App.tsx`, and `Layout.tsx`. Ensure the dev server runs and shows "Hello World" before proceeding to layout styling.

When Session 3.1 is complete, proceed to Session 3.2 (Canvas), then Session 3.3 (Panels), then Session 3.4 (Components).

## Example Components to Guide Implementation

### TaskCard Example (Session 3.4)
```tsx
interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isSelected = false, onClick }: TaskCardProps) {
  const colorVar = `--color-task-${task.type}`;
  
  return (
    <div 
      className={`task-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ backgroundColor: `var(${colorVar})` }}
      role="button"
      tabIndex={0}
      aria-label={`Task ${task.id}: ${task.type}`}
    >
      <div className="task-card-type">{task.type}</div>
      <div className="task-card-label">{task.label}</div>
    </div>
  );
}
```

### PlaybackControls Example (Session 3.3)
```tsx
import { useStepForward, useStepBack, useHistory } from '@/state';

export function PlaybackControls() {
  const stepForward = useStepForward();
  const { stepBack, canStepBack } = useStepBack();
  const { reset } = useHistory();
  
  return (
    <div className="playback-controls">
      <button onClick={stepForward}>Step Forward</button>
      <button onClick={stepBack} disabled={!canStepBack}>Step Back</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

Good luck with Phase 3! The goal is a functional, responsive UI shell ready for animations in Phase 4.
