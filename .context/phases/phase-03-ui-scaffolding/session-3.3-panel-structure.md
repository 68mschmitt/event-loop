# Session 3.3: Panel Structure

## Overview

This session implements the tabbed panel system for the sidebar. Using Radix UI Tabs for accessibility, we'll create a `PanelContainer` that switches between four panels: Explanation, Task Inspector, Presets, and Scenario Builder. Each panel is a placeholder in this session—detailed implementation comes in later phases. The focus is on the tab structure, keyboard navigation, and proper ARIA attributes.

## Prerequisites

- Session 3.2 complete (visualization regions exist)
- Familiarity with Radix UI Tabs API
- Understanding of ARIA tabpanel pattern
- Knowledge of React compound components

## Goals

- [ ] Install and configure `@radix-ui/react-tabs`
- [ ] Create `PanelContainer` component with tab list and content
- [ ] Implement `ExplanationPanel` placeholder
- [ ] Implement `TaskInspector` placeholder
- [ ] Implement `PresetsPanel` placeholder
- [ ] Implement `ScenarioBuilder` placeholder
- [ ] Update `Sidebar` to render `PanelContainer`
- [ ] Ensure keyboard navigation works (Tab, Arrow keys)
- [ ] Add proper ARIA labels for screen readers
- [ ] Style tabs with Tailwind (active/inactive states)
- [ ] Persist selected tab in local storage (optional enhancement)

## Files to Create

### `src/components/panels/PanelContainer.tsx`
**Purpose:** Tabbed container for all panels
**Exports:** `PanelContainer` component
**Key responsibilities:**
- Render Radix Tabs root
- Manage active tab state
- Render tab triggers and content areas
- Keyboard navigation support

### `src/components/panels/ExplanationPanel.tsx`
**Purpose:** Display step-by-step explanation of current state
**Exports:** `ExplanationPanel` component
**Key responsibilities:**
- Placeholder for Phase 8 detailed implementation
- Show message about current step (basic)

### `src/components/panels/TaskInspector.tsx`
**Purpose:** Display detailed information about selected task
**Exports:** `TaskInspector` component
**Key responsibilities:**
- Placeholder for Phase 8 detailed implementation
- Show task properties if one is selected

### `src/components/panels/PresetsPanel.tsx`
**Purpose:** List and load preset scenarios
**Exports:** `PresetsPanel` component
**Key responsibilities:**
- Placeholder for Phase 6 detailed implementation
- Show list of available presets

### `src/components/panels/ScenarioBuilder.tsx`
**Purpose:** Custom scenario builder UI
**Exports:** `ScenarioBuilder` component
**Key responsibilities:**
- Placeholder for Phase 6 detailed implementation
- Show builder interface stub

### `src/components/panels/index.ts`
**Purpose:** Barrel export
**Exports:** All panel components

### `src/components/layout/Sidebar.tsx` (modify)
**Purpose:** Update to render PanelContainer
**Changes:**
- Replace placeholder text with PanelContainer

## Type Definitions

### PanelContainer Props
```typescript
interface PanelContainerProps {
  defaultTab?: string; // Default tab ID
}
```

### Panel Component Props
All panel components have no required props (placeholders):
```typescript
interface ExplanationPanelProps {}
interface TaskInspectorProps {}
interface PresetsPanelProps {}
interface ScenarioBuilderProps {}
```

### Tab Configuration
```typescript
interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode; // Optional icon for tab
  component: React.ComponentType;
}
```

## Implementation Specifications

### Install Radix Tabs

```bash
npm install @radix-ui/react-tabs
```

### PanelContainer Component

```typescript
// src/components/panels/PanelContainer.tsx
import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ExplanationPanel } from './ExplanationPanel';
import { TaskInspector } from './TaskInspector';
import { PresetsPanel } from './PresetsPanel';
import { ScenarioBuilder } from './ScenarioBuilder';

const TABS = [
  { id: 'explanation', label: 'Explanation', component: ExplanationPanel },
  { id: 'inspector', label: 'Inspector', component: TaskInspector },
  { id: 'presets', label: 'Presets', component: PresetsPanel },
  { id: 'builder', label: 'Builder', component: ScenarioBuilder },
] as const;

interface PanelContainerProps {
  defaultTab?: string;
}

export function PanelContainer({ defaultTab = 'explanation' }: PanelContainerProps) {
  return (
    <Tabs.Root 
      defaultValue={defaultTab} 
      className="flex flex-col h-full"
    >
      {/* Tab List */}
      <Tabs.List 
        className="flex border-b border-zinc-800 bg-zinc-900/50"
        aria-label="Panel tabs"
      >
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="
              flex-1 px-4 py-3 text-sm font-medium
              text-zinc-400 hover:text-zinc-200
              data-[state=active]:text-zinc-100
              data-[state=active]:border-b-2 data-[state=active]:border-blue-500
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {TABS.map((tab) => (
          <Tabs.Content
            key={tab.id}
            value={tab.id}
            className="h-full p-6 focus-visible:outline-none"
          >
            <tab.component />
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  );
}
```

**Key features:**
- Uses Radix Tabs for accessibility
- `data-[state=active]` selector for active tab styling
- Equal-width tabs with flex-1
- Focus visible styles for keyboard navigation
- Overflow auto on content area

### ExplanationPanel Component

```typescript
// src/components/panels/ExplanationPanel.tsx
import React from 'react';
import { useSimulator } from '@/state/hooks';

export function ExplanationPanel() {
  const { state } = useSimulator();
  const { stepIndex, now } = state;
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Current State
        </h3>
        <div className="space-y-2 text-sm text-zinc-400">
          <p>Step: {stepIndex}</p>
          <p>Time: {now}ms</p>
        </div>
      </div>
      
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-sm text-zinc-400">
          Detailed step-by-step explanations will be added in Phase 8 (Session 8.1).
        </p>
        <p className="text-sm text-zinc-500 mt-2">
          This panel will explain what happened in the last step and why.
        </p>
      </div>
    </div>
  );
}
```

### TaskInspector Component

```typescript
// src/components/panels/TaskInspector.tsx
import React from 'react';

export function TaskInspector() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Task Inspector
        </h3>
        <p className="text-sm text-zinc-400">
          Select a task from the visualization to view its details.
        </p>
      </div>
      
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-sm text-zinc-400">
          Task lifecycle view and detailed metadata will be added in Phase 8 (Session 8.2).
        </p>
        <ul className="mt-2 text-sm text-zinc-500 list-disc list-inside space-y-1">
          <li>Task ID and label</li>
          <li>Type and state</li>
          <li>Creation time and origin</li>
          <li>Effects and dependencies</li>
          <li>Lifecycle timeline visualization</li>
        </ul>
      </div>
    </div>
  );
}
```

### PresetsPanel Component

```typescript
// src/components/panels/PresetsPanel.tsx
import React from 'react';

export function PresetsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Preset Scenarios
        </h3>
        <p className="text-sm text-zinc-400">
          Load pre-configured scenarios to explore different event loop behaviors.
        </p>
      </div>
      
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-sm text-zinc-400 mb-2">
          Preset scenarios will be implemented in Phase 6 (Sessions 6.3-6.4).
        </p>
        <div className="space-y-2 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-400">Planned presets:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Sync vs setTimeout(0)</li>
            <li>Promise.then vs setTimeout(0)</li>
            <li>Nested microtasks</li>
            <li>async/await multiple awaits</li>
            <li>fetch + timers + microtasks</li>
            <li>DOM event + microtasks</li>
            <li>rAF + rendering</li>
            <li>Microtask starvation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### ScenarioBuilder Component

```typescript
// src/components/panels/ScenarioBuilder.tsx
import React from 'react';

export function ScenarioBuilder() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Scenario Builder
        </h3>
        <p className="text-sm text-zinc-400">
          Create custom scenarios by adding tasks manually.
        </p>
      </div>
      
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-sm text-zinc-400 mb-2">
          Scenario builder UI will be implemented in Phase 6 (Session 6.2).
        </p>
        <div className="space-y-2 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-400">Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add/remove tasks</li>
            <li>Configure task properties (delay, latency, etc.)</li>
            <li>Define task dependencies</li>
            <li>Validate scenario structure</li>
            <li>Export/import scenarios</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### Update Sidebar

```typescript
// src/components/layout/Sidebar.tsx
import React from 'react';
import { PanelContainer } from '@/components/panels/PanelContainer';

export function Sidebar() {
  return (
    <div className="h-full">
      <PanelContainer />
    </div>
  );
}
```

### Barrel Export

```typescript
// src/components/panels/index.ts
export { PanelContainer } from './PanelContainer';
export { ExplanationPanel } from './ExplanationPanel';
export { TaskInspector } from './TaskInspector';
export { PresetsPanel } from './PresetsPanel';
export { ScenarioBuilder } from './ScenarioBuilder';
```

## Success Criteria

- [ ] Tabs render in sidebar
- [ ] Clicking tab switches content
- [ ] Active tab visually highlighted (border-bottom)
- [ ] Keyboard navigation works (Arrow keys move between tabs)
- [ ] Tab content scrolls independently
- [ ] All four panels render placeholder content
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Focus visible on tab triggers
- [ ] ARIA attributes present (aria-label on TabList)

## Test Specifications

### Test: Tabs render correctly
**Given:** PanelContainer rendered
**When:** Check for tab triggers
**Then:** 4 tabs present (Explanation, Inspector, Presets, Builder)

```typescript
test('renders all tab triggers', () => {
  render(<PanelContainer />);
  
  expect(screen.getByRole('tab', { name: 'Explanation' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Inspector' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Presets' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Builder' })).toBeInTheDocument();
});
```

### Test: Default tab is active
**Given:** PanelContainer with defaultTab="explanation"
**When:** Rendered
**Then:** Explanation panel visible, others hidden

```typescript
test('shows default tab content', () => {
  render(<PanelContainer defaultTab="explanation" />);
  
  expect(screen.getByText(/Current State/i)).toBeVisible();
  expect(screen.queryByText(/Task Inspector/i)).not.toBeVisible();
});
```

### Test: Clicking tab switches content
**Given:** PanelContainer rendered
**When:** Click "Inspector" tab
**Then:** Inspector panel visible, Explanation hidden

```typescript
test('switches content on tab click', () => {
  render(<PanelContainer />);
  
  const inspectorTab = screen.getByRole('tab', { name: 'Inspector' });
  fireEvent.click(inspectorTab);
  
  expect(screen.getByText(/Task Inspector/i)).toBeVisible();
  expect(screen.queryByText(/Current State/i)).not.toBeVisible();
});
```

### Test: Keyboard navigation
**Given:** PanelContainer with focus on first tab
**When:** Press ArrowRight
**Then:** Focus moves to second tab

```typescript
test('arrow keys navigate tabs', () => {
  render(<PanelContainer />);
  
  const explanationTab = screen.getByRole('tab', { name: 'Explanation' });
  explanationTab.focus();
  
  fireEvent.keyDown(explanationTab, { key: 'ArrowRight' });
  
  const inspectorTab = screen.getByRole('tab', { name: 'Inspector' });
  expect(inspectorTab).toHaveFocus();
});
```

### Test: ARIA attributes
**Given:** PanelContainer rendered
**When:** Inspect tab list
**Then:** aria-label present

```typescript
test('tab list has aria-label', () => {
  render(<PanelContainer />);
  
  const tabList = screen.getByRole('tablist');
  expect(tabList).toHaveAttribute('aria-label', 'Panel tabs');
});
```

### Test: Active state styling
**Given:** Tab is active
**When:** Check classes
**Then:** data-[state=active] classes applied

```typescript
test('active tab has correct styling', () => {
  const { container } = render(<PanelContainer />);
  
  const activeTab = screen.getByRole('tab', { name: 'Explanation' });
  expect(activeTab).toHaveAttribute('data-state', 'active');
  // Border color applied via Tailwind data-state selector
});
```

## Integration Points

- **Session 3.1**: Rendered in Sidebar component
- **Phase 6**: Presets and Builder panels get full implementation
- **Phase 8**: Explanation and Inspector panels get full implementation

## References

- [Radix UI Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)
- [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Keyboard Navigation](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

## Notes

### Why Radix UI Tabs?
- Accessibility built-in (ARIA, keyboard nav)
- Unstyled (full design control)
- Composable API
- Excellent TypeScript support
- Handles focus management

### Tab configuration approach
- Centralized tab list for easy maintenance
- Component references avoid circular imports
- Easy to add/remove tabs later

### Data attribute styling
- Radix exposes state via `data-*` attributes
- Tailwind `data-[state=active]:` selector
- No need for custom state management

### Future enhancements
- Persist selected tab in localStorage
- Badge counts on tabs (e.g., "3 issues")
- Tab icons for visual distinction
- Collapsible sidebar on mobile
