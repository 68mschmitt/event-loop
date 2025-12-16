# Phase 3: UI Scaffolding

## Overview

Phase 3 establishes the visual structure of the Event Loop Visualizer. This phase focuses on creating the layout, defining the visualization canvas regions, implementing tabbed panels, and building reusable UI components. No animation or complex interaction logic is added yet—the goal is to create a static but complete UI foundation that reads from simulator state and displays it.

## Goals

- ✅ Set up Vite project with React, TypeScript, and Tailwind CSS
- ✅ Configure path aliases and build tooling
- ✅ Create main application layout with four regions (toolbar, canvas, sidebar, timeline)
- ✅ Implement visualization canvas with all event loop regions (CallStack, WebApis, Queues, RenderPipeline, Console)
- ✅ Build tabbed panel structure for sidebar (Explanation, Inspector, Presets, Builder)
- ✅ Create common UI components (Button, Select, Tooltip, Badge, Card) using Radix UI primitives
- ✅ Ensure responsive layout and accessibility foundations
- ✅ Connect components to SimulatorContext to display state

## Prerequisites

Before starting Phase 3:
- Phase 1 complete (Core simulator with types and tick logic)
- Phase 2 complete (State management with Context and reducers)
- Understanding of React component patterns
- Familiarity with Tailwind CSS utility classes
- Basic knowledge of Radix UI primitives

## Sessions

### Session 3.1: Project Setup and Layout Structure
**Duration:** 3-4 hours
**Focus:** Vite configuration, Tailwind setup, main layout component

Creates the project scaffolding and top-level layout with toolbar, canvas, sidebar, and timeline areas.

### Session 3.2: Visualization Canvas Regions
**Duration:** 4-5 hours
**Focus:** Individual region components for CallStack, WebApis, Queues, RenderPipeline, Console

Implements all visualization regions that read from SimulatorContext and display tasks/operations in their respective areas.

### Session 3.3: Panel Structure
**Duration:** 3-4 hours
**Focus:** Tabbed panel container, individual panel components

Creates the sidebar panel system with tabs for switching between Explanation, Inspector, Presets, and Builder views.

### Session 3.4: Common UI Components
**Duration:** 2-3 hours
**Focus:** Reusable UI primitives using Radix and Tailwind

Builds accessible, styled components that will be used throughout the application.

## Architecture

### Layout Hierarchy

```
App
└── AppLayout
    ├── Toolbar (top)
    │   └── Logo, Settings, Theme toggle
    ├── Canvas (center)
    │   ├── CallStack
    │   ├── WebApis
    │   ├── MacroQueue
    │   ├── MicroQueue
    │   ├── RafQueue
    │   ├── RenderPipeline
    │   └── Console
    ├── Sidebar (right)
    │   └── PanelContainer
    │       ├── ExplanationPanel
    │       ├── TaskInspector
    │       ├── PresetsPanel
    │       └── ScenarioBuilder
    └── Timeline (bottom)
        └── (Placeholder for Phase 5)
```

### Component Responsibilities

**Layout Components:**
- Establish overall page structure
- Handle responsive breakpoints
- Manage grid/flexbox positioning

**Visualization Components:**
- Read from SimulatorContext
- Display tasks and operations
- Use semantic HTML for accessibility

**Panel Components:**
- Implement tabbed interface using Radix Tabs
- Display contextual information
- Support keyboard navigation

**Common Components:**
- Provide consistent UI primitives
- Encapsulate Radix UI styling
- Handle accessibility attributes

### Data Flow

```
SimulatorContext
     ↓
AppLayout reads context
     ↓
Canvas regions read specific slices
     ├→ CallStack reads callStack
     ├→ MacroQueue reads macroQueue
     ├→ MicroQueue reads microQueue
     ├→ WebApis reads webApis
     └→ Console reads log
```

## Design Principles

### 1. Separation of Concerns
- Layout components handle structure only
- Visualization components display data only
- No business logic in UI components (logic stays in core/state)

### 2. Composition Over Configuration
- Small, focused components
- Compose complex UIs from simple pieces
- Avoid large prop interfaces

### 3. Accessibility First
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Sufficient color contrast

### 4. Responsive by Default
- Mobile-first Tailwind classes
- Collapsible panels on small screens
- Touch-friendly targets

### 5. Type Safety
- Props interfaces for all components
- No `any` types
- Leverage TypeScript inference

## Technology Choices

### Tailwind CSS
- Utility-first styling
- Consistent design tokens
- Responsive utilities
- Custom configuration for event loop colors

### Radix UI
- Unstyled primitives (Tabs, Dialog, Tooltip, Slider)
- Accessibility built-in
- Composable components
- Excellent TypeScript support

### Vite
- Fast HMR for development
- Optimized production builds
- TypeScript support out of the box
- Path alias resolution

## Visual Design

### Color Palette

**Task Types:**
- Sync: `blue-500`
- Timer: `orange-500`
- Microtask: `purple-500`
- Promise: `purple-600`
- Fetch: `green-500`
- DOM Event: `pink-500`
- RAF: `yellow-500`

**Task States:**
- Created: `gray-400`
- Waiting Web API: `gray-600`
- Queued: `blue-400`
- Running: `green-400`
- Completed: `gray-300`

**Regions:**
- CallStack: `slate-800` background
- WebApis: `indigo-900` background
- Queues: `slate-700` background
- RenderPipeline: `emerald-900` background
- Console: `zinc-900` background

### Typography

- Headings: Inter (sans-serif)
- Body: Inter
- Code: JetBrains Mono (monospace)

### Spacing

- Base unit: 4px (Tailwind default)
- Component padding: 4 (16px)
- Section margins: 6 (24px)
- Gaps in grids: 4 (16px)

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Toolbar.tsx
│   │   ├── Canvas.tsx
│   │   ├── Sidebar.tsx
│   │   └── Timeline.tsx
│   ├── visualization/
│   │   ├── Region.tsx
│   │   ├── CallStack.tsx
│   │   ├── WebApis.tsx
│   │   ├── MacroQueue.tsx
│   │   ├── MicroQueue.tsx
│   │   ├── RafQueue.tsx
│   │   ├── RenderPipeline.tsx
│   │   ├── Console.tsx
│   │   └── TaskNode.tsx
│   ├── panels/
│   │   ├── PanelContainer.tsx
│   │   ├── ExplanationPanel.tsx
│   │   ├── TaskInspector.tsx
│   │   ├── PresetsPanel.tsx
│   │   └── ScenarioBuilder.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Select.tsx
│       ├── Tooltip.tsx
│       ├── Badge.tsx
│       └── Card.tsx
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

## Success Criteria

- [ ] Vite project runs with `npm run dev`
- [ ] Tailwind CSS classes work and are tree-shaken in production
- [ ] All layout regions render in correct positions
- [ ] Canvas displays all event loop regions (static)
- [ ] Regions show tasks from SimulatorContext
- [ ] Sidebar tabs switch between panels
- [ ] All common components render and accept props
- [ ] Responsive layout works on mobile (≥375px width)
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Basic accessibility: semantic HTML, ARIA labels, keyboard navigation

## Testing Strategy

### Component Tests (Vitest + React Testing Library)
- Layout renders all sections
- Regions display tasks correctly
- Tabs switch panels
- Common components render with props

### Visual Regression Tests (Optional)
- Screenshot tests for layout consistency

### Manual Testing
- Responsive design at different breakpoints
- Keyboard navigation through tabs
- Task display with different scenario states

## Integration with Other Phases

### Depends On:
- **Phase 1:** Types (Task, SimulatorState)
- **Phase 2:** SimulatorContext, useSimulator hook

### Enables:
- **Phase 4:** Animation system (components are already structured for motion)
- **Phase 5:** Controls and timeline (toolbar and timeline areas ready)
- **Phase 6:** Scenarios (panels ready for presets and builder)

## Common Pitfalls

1. **Over-styling too early**: Focus on structure first, polish later
2. **Prop drilling**: Use context for deeply nested components
3. **Premature optimization**: Don't memoize everything; profile first
4. **Inconsistent spacing**: Use Tailwind spacing scale consistently
5. **Accessibility afterthought**: Build it in from the start

## Next Steps After Phase 3

Once UI scaffolding is complete:
1. Verify all regions display simulator state correctly
2. Test responsive layout on different screen sizes
3. Run accessibility audit (axe DevTools)
4. Proceed to Phase 4 (Animation System) to bring the UI to life

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Vite Configuration](https://vitejs.dev/config/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
