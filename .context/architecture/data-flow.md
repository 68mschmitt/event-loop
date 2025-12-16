# Data Flow

This document explains how data flows through the application from user action to visual update.

## High-Level Flow

```
User Action → Event Handler → Dispatch Action → Reducer → New State → React Re-render → Visual Update
                                                                              ↓
                                                                      Animation Triggered
```

## Detailed Flow: Step Forward Example

### 1. User Clicks "Step Forward" Button

**Location:** `src/components/controls/PlaybackControls.tsx`

```tsx
<button onClick={() => dispatch({ type: 'STEP_FORWARD' })}>
  Step Forward
</button>
```

### 2. Action Dispatched to Reducer

**Location:** `src/state/SimulatorContext.tsx`

The dispatch function from `useReducer` sends the action to the simulator reducer.

### 3. Reducer Processes Action

**Location:** `src/state/reducers/simulator.ts`

```typescript
function simulatorReducer(state: SimulatorState, action: Action): SimulatorState {
  switch (action.type) {
    case 'STEP_FORWARD': {
      return produce(state, draft => {
        // Call core simulator tick function
        const newState = tick(draft);
        
        // Store snapshot in history
        addToHistory(newState);
        
        return newState;
      });
    }
  }
}
```

### 4. Core Simulator Executes Logic

**Location:** `src/core/simulator/tick.ts`

```typescript
function tick(state: SimulatorState): SimulatorState {
  // Apply priority rules
  // Update queues
  // Move tasks
  // Generate logs
  // Return new state (immutable)
}
```

### 5. New State Returned to Context

The reducer returns the new state, which updates the Context value.

### 6. Components Re-render

All components consuming `SimulatorContext` receive the new state and re-render:

- `CallStack.tsx` - Updates stack display
- `MacroQueue.tsx` - Updates queue contents
- `MicroQueue.tsx` - Updates queue contents
- `ExplanationPanel.tsx` - Shows new explanation
- `Console.tsx` - Appends new logs

### 7. Animations Trigger

**Location:** `src/animations/coordinator.ts`

The animation coordinator detects state changes:

```typescript
useEffect(() => {
  if (taskMovedFromWebApisToMacro(prevState, state)) {
    animateTransition(task, 'webapis', 'macro');
  }
}, [state]);
```

### 8. Visual Transition Executes

**Location:** `src/components/visualization/TaskNode.tsx`

Framer Motion animates the task node:

```tsx
<motion.div
  layoutId={task.id}
  initial={from}
  animate={to}
  transition={transitionConfig}
>
  {task.label}
</motion.div>
```

### 9. User Sees Result

The task visually moves from one region to another, and the explanation panel updates.

---

## Flow Diagram

```
┌──────────────┐
│ User clicks  │
│   button     │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Event Handler fires  │
│ (onClick)            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Dispatch action      │
│ { type: 'STEP_...' } │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Reducer receives     │
│ (state, action)      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Call core simulator  │
│ tick(state)          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Simulator logic      │
│ - Apply rules        │
│ - Update queues      │
│ - Generate logs      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Return new state     │
│ (immutable)          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Context updates      │
│ state value          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Components re-render │
│ with new state       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Animation coordinator│
│ detects changes      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Framer Motion        │
│ animates transition  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Browser paints       │
│ updated UI           │
└──────────────────────┘
```

---

## Data Flow by Feature

### Loading a Preset Scenario

```
PresetSelector → LOAD_SCENARIO action → Reset state → Load tasks → Initialize queues → Re-render
```

**Details:**
1. User selects preset from dropdown
2. `PresetSelector` dispatches `LOAD_SCENARIO` with scenario ID
3. Reducer:
   - Resets state to initial
   - Loads tasks from preset definition
   - Initializes queues with initial tasks
   - Clears history
4. All components re-render with new scenario
5. Canvas shows initial task positions

### Playing the Simulation

```
Play button → SET_PLAYING(true) → Interval timer → Repeated STEP_FORWARD actions → Auto-advance
```

**Details:**
1. User clicks Play
2. UI reducer sets `isPlaying = true`
3. `usePlayback` hook starts interval timer
4. Every `interval` ms: dispatch `STEP_FORWARD`
5. State advances, animations play
6. Continues until paused or simulation ends

### Scrubbing Timeline

```
Drag scrubber → JUMP_TO_STEP(index) → Restore snapshot → Re-render → Instant update (no animation)
```

**Details:**
1. User drags timeline scrubber
2. `onChange` dispatches `JUMP_TO_STEP` with target index
3. Reducer retrieves snapshot from history
4. State replaced with snapshot state
5. Components re-render at new step
6. Animations skipped (instant transition)

### Inspecting a Task

```
Click task → SET_SELECTED_TASK(id) → UI state updates → Inspector opens → Display metadata
```

**Details:**
1. User clicks task node
2. `onClick` dispatches `SET_SELECTED_TASK` with task ID
3. UI reducer updates `selectedTaskId`
4. `TaskInspector` component renders (if selected)
5. Fetches full task details from simulator state
6. Displays lifecycle, metadata, effects

---

## State Ownership

### SimulatorContext owns:
- `SimulatorState` (call stack, queues, Web APIs, time, logs)
- History (snapshots)
- Dispatch function for simulator actions

### UIContext owns:
- `isPlaying`, `speed`
- `selectedTaskId`
- `reducedMotion`, `showExplanations`, `developerMode`
- `currentScenario`
- Dispatch function for UI actions

### Components own:
- Local UI state (e.g., dropdown open/closed)
- Animation state (transient)

---

## Immutability and Performance

### Why Immutability?

- **Predictable updates**: State changes are explicit
- **Time-travel**: Can store snapshots and restore
- **Performance**: React can optimize with shallow equality checks
- **Debugging**: Can log state changes, replay actions

### Using Immer

Immer allows "mutable" syntax that produces immutable results:

```typescript
return produce(state, draft => {
  draft.stepIndex++;  // Looks mutable
  draft.log.push(entry);
  // Immer creates new object behind the scenes
});
```

### Equality Checks

React Context uses reference equality to detect changes:

```typescript
const [state, dispatch] = useReducer(reducer, initialState);
// Context value: { state, dispatch }
// If state !== prevState (new reference), consumers re-render
```

### Optimization

Prevent unnecessary re-renders:

```typescript
// Memoize expensive computations
const taskById = useMemo(() => {
  return state.tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {});
}, [state.tasks]);

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  dispatch({ type: 'SELECT_TASK', payload: id });
}, [dispatch]);
```

---

## Error Handling Flow

### Validation Error

```
User input → Validate → Error → Display message → Block action
```

Example: Invalid scenario

1. User tries to add task with negative delay
2. Validator function checks delay >= 0
3. Validation fails, returns error object
4. UI displays error message
5. Action not dispatched

### Runtime Error

```
Error thrown → Error Boundary catches → Display fallback UI → Log error
```

Example: Reducer error

1. Reducer encounters unexpected state
2. Throws error
3. Nearest Error Boundary catches
4. Displays "Something went wrong" UI
5. Error logged to console
6. User can reset or reload

---

## Animation Coordination

### State Change → Animation

The animation system listens to state and triggers animations:

```typescript
// In animation coordinator
useEffect(() => {
  const changes = detectChanges(prevState, state);
  
  changes.forEach(change => {
    if (change.type === 'TASK_MOVED') {
      queueAnimation({
        taskId: change.taskId,
        from: change.from,
        to: change.to,
        duration: baseDuration / speed
      });
    }
  });
}, [state]);
```

### Sequential Animations

Multiple animations from one state change execute sequentially:

1. Detect all changes
2. Queue animations with dependencies
3. Execute in order
4. Mark step complete when all animations done

---

## Summary

**Key Principles:**
1. **Unidirectional flow**: User action → Dispatch → Reducer → State → UI
2. **Immutable state**: State never modified in place
3. **Separation**: Core logic separate from UI
4. **Context for global state**: Avoid prop drilling
5. **Hooks for access**: Custom hooks encapsulate state access patterns

**Data Sources:**
- Simulator state: In `SimulatorContext`
- UI state: In `UIContext`
- Scenario definitions: Imported from `core/scenarios/presets`
- Animation config: In `animations/config.ts`

**Data Consumers:**
- Visualization components: Read simulator state
- Control components: Read UI state, dispatch actions
- Panel components: Read both contexts
- Animation coordinator: Reads simulator state, triggers animations
