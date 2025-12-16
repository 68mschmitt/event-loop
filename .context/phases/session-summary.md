# Session Plan Summary

This document provides a quick overview of all 29 sessions. Detailed session files follow the format demonstrated in `phase-01-core-simulator/session-1.1-types.md`.

## Phase 1: Core Simulator (5 sessions)

### ✅ Session 1.1: Type Definitions
**Status:** Detailed plan created
**Files:** `src/core/types/*.ts`
**Key deliverables:** Task, SimulatorState, WebApiOperation types

### Session 1.2: Queue and Stack Data Structures
**Files:** `src/core/simulator/queue.ts`, `src/core/simulator/state.ts`
**Key deliverables:** Queue and Stack implementations, state initialization
**Tests:** Queue operations (enqueue, dequeue, peek), Stack operations

### Session 1.3: Enqueue Rules and Web API Operations
**Files:** `src/core/simulator/enqueue.ts`, `src/core/simulator/webapi.ts`
**Key deliverables:** Functions for each task type's enqueue behavior, Web API tracking
**Tests:** Timer enqueue, Promise enqueue, fetch enqueue, event enqueue, rAF enqueue

### Session 1.4: Tick Function and Priority Rules
**Files:** `src/core/simulator/tick.ts`, `src/core/simulator/priority.ts`
**Key deliverables:** Main tick() function, priority selection logic
**Tests:** Priority ordering, macrotask vs microtask, call stack execution

### Session 1.5: Render and Microtask Logic
**Files:** `src/core/simulator/render.ts`, `src/core/simulator/microtask.ts`
**Key deliverables:** Render step logic, microtask draining, frame boundary detection
**Tests:** Microtask draining before macrotask, render at frame boundary, render pending

## Phase 2: State Management (3 sessions)

### Session 2.1: History System
**Files:** `src/state/reducers/history.ts`, `src/state/hooks/useHistory.ts`
**Key deliverables:** Snapshot storage, step-back capability, bounded history
**Tests:** Store snapshot, restore snapshot, history cap at 5000

### Session 2.2: Simulator Reducer and Actions
**Files:** `src/state/reducers/simulator.ts`, `src/state/actions/simulator.ts`
**Key deliverables:** Reducer handling all simulator actions, action creators
**Tests:** STEP_FORWARD action, STEP_BACKWARD action, RESET action, LOAD_SCENARIO action

### Session 2.3: Context Providers and Integration
**Files:** `src/state/SimulatorContext.tsx`, `src/state/UIContext.tsx`, `src/state/hooks/index.ts`
**Key deliverables:** Context providers, custom hooks (useSimulator, usePlayback)
**Tests:** Context provides state, dispatch works, hooks return correct values

## Phase 3: UI Scaffolding (4 sessions)

### Session 3.1: Project Setup and Layout Structure
**Files:** `src/components/layout/AppLayout.tsx`, `src/App.tsx`, `src/main.tsx`, configs
**Key deliverables:** Vite + React setup, Tailwind config, main layout with regions
**Tests:** App renders without crashing, layout structure present

### Session 3.2: Visualization Canvas Regions
**Files:** `src/components/visualization/*.tsx`
**Key deliverables:** CallStack, MacroQueue, MicroQueue, WebApis, RenderPipeline, Console components
**Tests:** Each region renders, displays tasks correctly

### Session 3.3: Panel Structure
**Files:** `src/components/panels/*.tsx`
**Key deliverables:** Tabbed panel container, ExplanationPanel, TaskInspector, PresetsPanel
**Tests:** Tabs switch correctly, panels render content

### Session 3.4: Common UI Components
**Files:** `src/components/common/*.tsx`
**Key deliverables:** Button, Select, Tooltip, Badge, Card components
**Tests:** Components render, props work correctly, accessibility attributes present

## Phase 4: Animation System (4 sessions)

### Session 4.1: Animation Coordinator
**Files:** `src/animations/coordinator.ts`, `src/animations/config.ts`
**Key deliverables:** Animation queue, sequencing logic, coordination with state changes
**Tests:** Animations queue correctly, execute in order, respect speed setting

### Session 4.2: Task Node Component with State Transitions
**Files:** `src/components/visualization/TaskNode.tsx`, `src/animations/transitions.ts`
**Key deliverables:** Animated task card, state-based styling (queued, running, completed)
**Tests:** Task renders with correct style, transitions between states

### Session 4.3: Path-Based Movement Between Regions
**Files:** `src/animations/paths.ts`, `src/animations/hooks/useTaskAnimation.ts`
**Key deliverables:** Path calculation for movements, smooth transitions between regions
**Tests:** Task moves from WebApis to MacroQueue, path is smooth

### Session 4.4: Reduced Motion and Performance Handling
**Files:** `src/animations/hooks/useReducedMotion.ts`, performance fallbacks
**Key deliverables:** Detect reduced motion preference, disable animations, performance monitoring
**Tests:** Reduced motion skips animations, fallback activates for complex scenarios

## Phase 5: Controls & Timeline (3 sessions)

### Session 5.1: Playback Controls
**Files:** `src/components/controls/PlaybackControls.tsx`, `src/state/hooks/usePlayback.ts`
**Key deliverables:** Play/Pause, Step Forward, Step Back, Reset buttons
**Tests:** Play starts simulation, pause stops, step advances one step, reset returns to start

### Session 5.2: Speed Control and Timing
**Files:** `src/components/controls/SpeedControl.tsx`, timing logic
**Key deliverables:** Speed selector (0.25x - 4x), playback timing coordination
**Tests:** Speed change affects playback rate, animations scale with speed

### Session 5.3: Timeline Scrubber
**Files:** `src/components/timeline/*.tsx`, `src/state/hooks/useTimeline.ts`
**Key deliverables:** Scrubber control, step markers, jump to step
**Tests:** Scrubber reflects current step, dragging jumps to step, markers show events

## Phase 6: Scenarios (4 sessions)

### Session 6.1: Scenario Schema and Validation
**Files:** `src/core/scenarios/schema.ts`, `src/core/scenarios/validator.ts`
**Key deliverables:** Schema definition, validation rules, error messages
**Tests:** Valid scenario passes, invalid scenario fails with specific errors

### Session 6.2: Scenario Builder UI
**Files:** `src/components/panels/ScenarioBuilder.tsx`, builder components
**Key deliverables:** UI for adding/removing tasks, field inputs per task type
**Tests:** Can add task, can remove task, fields validate, can export scenario

### Session 6.3: Preset Scenarios 1-4
**Files:** `src/core/scenarios/presets/*.ts` (first 4 presets)
**Key deliverables:**
1. Sync vs setTimeout(0)
2. Promise.then vs setTimeout(0)
3. Nested microtasks
4. async/await multiple awaits
**Tests:** Each preset loads, produces expected ordering, explanations are correct

### Session 6.4: Preset Scenarios 5-8
**Files:** `src/core/scenarios/presets/*.ts` (remaining 4 presets)
**Key deliverables:**
5. fetch + timers + microtasks
6. DOM event + microtasks + timers
7. rAF + microtasks + timers
8. Microtask starvation
**Tests:** Each preset loads, produces expected ordering, demonstrates concept

## Phase 7: Accessibility (3 sessions)

### Session 7.1: Keyboard Navigation and Focus Management
**Files:** `src/components/common/keyboard.ts`, focus trap components
**Key deliverables:** Tab order, keyboard shortcuts (Space = play/pause, Arrow = step), focus indicators
**Tests:** Can navigate with keyboard only, shortcuts work, focus visible

### Session 7.2: ARIA Labels and Screen Reader Support
**Files:** Add ARIA attributes throughout components
**Key deliverables:** aria-label on controls, aria-live regions, role attributes
**Tests:** Screen reader announces state changes, regions have labels, buttons have names

### Session 7.3: Mobile Responsive Layout
**Files:** Update layout components with responsive styles
**Key deliverables:** Stacked layout on mobile, touch controls, collapsible panels
**Tests:** Layout works on mobile viewport, no horizontal scroll, controls accessible

## Phase 8: Polish (3 sessions)

### Session 8.1: Explanation Panel with Rule Descriptions
**Files:** `src/components/panels/ExplanationPanel.tsx`, explanation text
**Key deliverables:** Step-by-step explanations, rule descriptions, why something happened
**Tests:** Explanation updates on step, references correct rules, clear language

### Session 8.2: Task Inspector with Lifecycle View
**Files:** `src/components/panels/TaskInspector.tsx`, lifecycle visualization
**Key deliverables:** Task metadata display, lifecycle timeline, parent/child relationships
**Tests:** Shows all task properties, lifecycle is accurate, can click task to inspect

### Session 8.3: Error States and Developer Mode
**Files:** `src/components/panels/DeveloperPanel.tsx`, error boundaries
**Key deliverables:** Error boundaries, validation errors, dev mode (state viewer, export)
**Tests:** Errors display gracefully, dev mode shows state JSON, can export scenario

---

## Creating Session Files

Each session file should follow this structure (see `session-1.1-types.md` for full example):

1. **Overview** - What this session builds
2. **Prerequisites** - What must exist first
3. **Goals** - Checklist of deliverables
4. **Files to Create/Modify** - Exact paths with purposes
5. **Type Definitions** - Key interfaces with examples
6. **Implementation Specifications** - What functions should do
7. **Success Criteria** - How to verify completion
8. **Test Specifications** - What to test and expected behavior
9. **Integration Points** - How this connects to other parts
10. **References** - Related documentation

## Progress Tracking

Mark sessions complete as you finish them:

- [x] Session 1.1: Types ← Example completed
- [ ] Session 1.2: Queues
- [ ] Session 1.3: Enqueue Rules
- ... (continue for all 29 sessions)

## Time Estimates

- **Phase 1:** 15-20 hours
- **Phase 2:** 10-12 hours
- **Phase 3:** 12-16 hours
- **Phase 4:** 14-18 hours
- **Phase 5:** 10-12 hours
- **Phase 6:** 14-18 hours
- **Phase 7:** 10-12 hours
- **Phase 8:** 10-14 hours

**Total:** 95-122 hours of focused development time
