# Project Structure

This document defines the expected final directory structure for the Event Loop Visualizer codebase.

## Overview

The project follows a feature-based organization within the `src/` directory, separating core logic from UI, state management, and animations. This structure supports:
- Clear separation of concerns
- Easy navigation and discoverability
- Independent testing of each layer
- Reusability of components and utilities

## Full Directory Tree

```
event-loop-visualizer/
├── .context/                      # Implementation plans (this directory)
├── src/
│   ├── core/                      # Pure business logic (no React/UI)
│   │   ├── types/
│   │   │   ├── index.ts          # Barrel export
│   │   │   ├── task.ts           # Task-related types
│   │   │   ├── simulator.ts      # SimulatorState, WebApiOperation
│   │   │   ├── queue.ts          # Queue/Stack interfaces
│   │   │   └── scenario.ts       # Scenario definition types
│   │   ├── simulator/
│   │   │   ├── index.ts          # Main simulator export
│   │   │   ├── queue.ts          # Queue/Stack implementations
│   │   │   ├── state.ts          # State initialization
│   │   │   ├── enqueue.ts        # Enqueue rule implementations
│   │   │   ├── tick.ts           # Main tick function
│   │   │   ├── priority.ts       # Priority rule logic
│   │   │   ├── render.ts         # Render/frame logic
│   │   │   └── microtask.ts      # Microtask draining
│   │   ├── scenarios/
│   │   │   ├── index.ts          # Barrel export
│   │   │   ├── schema.ts         # Scenario schema and validation
│   │   │   ├── presets/
│   │   │   │   ├── index.ts      # All presets export
│   │   │   │   ├── sync-vs-timer.ts
│   │   │   │   ├── promise-vs-timer.ts
│   │   │   │   ├── nested-microtasks.ts
│   │   │   │   ├── async-await.ts
│   │   │   │   ├── fetch-complex.ts
│   │   │   │   ├── dom-event.ts
│   │   │   │   ├── raf-timing.ts
│   │   │   │   └── microtask-starvation.ts
│   │   │   └── validator.ts      # Scenario validation logic
│   │   └── utils/
│   │       ├── index.ts
│   │       ├── id-generator.ts   # Unique ID generation
│   │       ├── time.ts           # Logical time utilities
│   │       └── assertions.ts     # Type guards and assertions
│   ├── state/
│   │   ├── SimulatorContext.tsx   # Main simulator context
│   │   ├── UIContext.tsx          # UI state context (speed, playing)
│   │   ├── reducers/
│   │   │   ├── index.ts
│   │   │   ├── simulator.ts       # Simulator state reducer
│   │   │   ├── ui.ts              # UI state reducer
│   │   │   └── history.ts         # History management
│   │   ├── actions/
│   │   │   ├── index.ts
│   │   │   ├── simulator.ts       # Simulator actions
│   │   │   └── ui.ts              # UI actions
│   │   └── hooks/
│   │       ├── index.ts
│   │       ├── useSimulator.ts    # Access simulator state
│   │       ├── usePlayback.ts     # Playback controls
│   │       ├── useStep.ts         # Step forward/back
│   │       ├── useTimeline.ts     # Timeline navigation
│   │       └── useTask.ts         # Task inspection
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Main app layout
│   │   │   ├── Toolbar.tsx        # Top toolbar
│   │   │   ├── Canvas.tsx         # Main visualization area
│   │   │   ├── Sidebar.tsx        # Right sidebar
│   │   │   └── Timeline.tsx       # Bottom timeline
│   │   ├── visualization/
│   │   │   ├── index.ts
│   │   │   ├── Region.tsx         # Generic region container
│   │   │   ├── CallStack.tsx      # Call stack visualization
│   │   │   ├── WebApis.tsx        # Web APIs region
│   │   │   ├── MacroQueue.tsx     # Macrotask queue
│   │   │   ├── MicroQueue.tsx     # Microtask queue
│   │   │   ├── RafQueue.tsx       # rAF queue
│   │   │   ├── RenderPipeline.tsx # Render visualization
│   │   │   ├── Console.tsx        # Console output
│   │   │   └── TaskNode.tsx       # Individual task visualization
│   │   ├── controls/
│   │   │   ├── index.ts
│   │   │   ├── PlaybackControls.tsx  # Play/pause/step
│   │   │   ├── SpeedControl.tsx      # Speed selector
│   │   │   ├── PresetSelector.tsx    # Load preset dropdown
│   │   │   └── SettingsToggle.tsx    # Reduced motion, etc.
│   │   ├── panels/
│   │   │   ├── index.ts
│   │   │   ├── PanelContainer.tsx    # Tabbed panel container
│   │   │   ├── ExplanationPanel.tsx  # Step explanation
│   │   │   ├── TaskInspector.tsx     # Task details
│   │   │   ├── PresetsPanel.tsx      # Preset list
│   │   │   ├── ScenarioBuilder.tsx   # Custom scenario builder
│   │   │   └── DeveloperPanel.tsx    # Debug/developer mode
│   │   ├── timeline/
│   │   │   ├── index.ts
│   │   │   ├── TimelineContainer.tsx
│   │   │   ├── TimelineScrubber.tsx  # Scrubbing control
│   │   │   ├── TimelineMarker.tsx    # Event markers
│   │   │   └── TimelineRuler.tsx     # Time scale
│   │   └── common/
│   │       ├── index.ts
│   │       ├── Button.tsx
│   │       ├── IconButton.tsx
│   │       ├── Select.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Badge.tsx
│   │       ├── Card.tsx
│   │       └── EmptyState.tsx
│   ├── animations/
│   │   ├── index.ts
│   │   ├── coordinator.ts         # Animation orchestration
│   │   ├── transitions.ts         # Transition definitions
│   │   ├── paths.ts               # Path calculations
│   │   ├── config.ts              # Animation configuration
│   │   └── hooks/
│   │       ├── index.ts
│   │       ├── useTaskAnimation.ts
│   │       ├── useQueueAnimation.ts
│   │       └── useReducedMotion.ts
│   ├── styles/
│   │   ├── globals.css            # Tailwind imports + global styles
│   │   ├── animations.css         # Custom animation keyframes
│   │   └── themes.css             # Color themes (if needed)
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   └── vite-env.d.ts               # Vite type definitions
├── tests/
│   ├── unit/
│   │   ├── core/                   # Simulator unit tests
│   │   │   ├── simulator.test.ts
│   │   │   ├── enqueue.test.ts
│   │   │   ├── tick.test.ts
│   │   │   └── scenarios.test.ts
│   │   └── state/                  # Reducer unit tests
│   │       ├── simulator-reducer.test.ts
│   │       └── history.test.ts
│   ├── integration/
│   │   ├── state-integration.test.tsx  # State + simulator
│   │   └── playback.test.tsx           # Playback controls
│   └── e2e/
│       ├── preset-scenarios.spec.ts    # Load and run presets
│       ├── scenario-builder.spec.ts    # Build custom scenarios
│       ├── timeline-scrub.spec.ts      # Timeline navigation
│       └── accessibility.spec.ts       # Keyboard and a11y
├── public/
│   ├── favicon.ico
│   └── assets/                     # Static assets if needed
├── docs/                           # User-facing documentation
│   ├── README.md
│   ├── event-loop-model.md         # Model explanation
│   └── usage-guide.md              # How to use the app
├── .github/
│   └── workflows/
│       ├── ci.yml                  # CI pipeline
│       └── deploy.yml              # Deployment
├── .eslintrc.cjs                   # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TS config for Node (Vite)
├── vite.config.ts                  # Vite configuration
├── vitest.config.ts                # Vitest configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Lock file
├── .gitignore
└── README.md                       # Project README
```

## Key Directories Explained

### `/src/core/`
**Purpose:** Pure TypeScript logic with no UI dependencies

This is the heart of the application - the event loop simulator. It's completely decoupled from React and can be tested independently. The simulator is a pure state machine.

**Subdirectories:**
- `types/`: All TypeScript type definitions
- `simulator/`: Core simulation engine
- `scenarios/`: Scenario definitions and validation
- `utils/`: Pure utility functions

### `/src/state/`
**Purpose:** React state management layer

Connects the core simulator to the React UI. Uses Context + useReducer pattern for predictable state updates and time-travel debugging.

**Key files:**
- Contexts: Provider components wrapping the app
- Reducers: Pure functions handling state transitions
- Actions: Action creators for type-safe dispatching
- Hooks: Custom hooks for consuming state

### `/src/components/`
**Purpose:** React components organized by feature area

**Subdirectories:**
- `layout/`: Top-level layout structure
- `visualization/`: The animated canvas showing queues/stacks
- `controls/`: User interaction controls
- `panels/`: Information panels (explanation, inspector)
- `timeline/`: Timeline scrubber and markers
- `common/`: Reusable UI primitives

### `/src/animations/`
**Purpose:** Animation logic separate from components

Centralizes animation configuration and coordination. Components import animation hooks rather than defining animations inline.

### `/tests/`
**Purpose:** All test files organized by type

- `unit/`: Fast, isolated tests for core logic
- `integration/`: Tests across multiple modules
- `e2e/`: Browser-based end-to-end tests

## Import Patterns

### Barrel Exports
Each directory has an `index.ts` for clean imports:

```typescript
// ✅ Good
import { Task, TaskType } from '@/core/types';
import { useSimulator, usePlayback } from '@/state/hooks';

// ❌ Avoid
import { Task } from '@/core/types/task';
import { useSimulator } from '@/state/hooks/useSimulator';
```

### Path Aliases
Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/state/*": ["./src/state/*"],
      "@/components/*": ["./src/components/*"],
      "@/animations/*": ["./src/animations/*"]
    }
  }
}
```

### Dependency Rules
- Core should never import from state or components
- State can import from core
- Components can import from core, state, and animations
- Animations can import from core and state

## File Naming Conventions

- **Components**: PascalCase (e.g., `TaskNode.tsx`)
- **Utilities**: camelCase (e.g., `id-generator.ts`)
- **Types**: camelCase (e.g., `task.ts`)
- **Tests**: Same as source + `.test.ts` or `.spec.ts`
- **Styles**: kebab-case (e.g., `globals.css`)

## Module Size Guidelines

- **Small modules**: < 150 lines (most utilities, types)
- **Medium modules**: 150-300 lines (components, hooks)
- **Large modules**: 300-500 lines (complex reducers, coordinator)
- **Refactor threshold**: > 500 lines (split into multiple files)

## Future Extensions

If the project grows, consider:
- `/src/plugins/` - For extensibility
- `/src/workers/` - For Web Workers (if needed)
- `/src/i18n/` - For internationalization
- `/src/themes/` - For theme system
