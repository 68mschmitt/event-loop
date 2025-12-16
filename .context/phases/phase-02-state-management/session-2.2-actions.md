# Session 2.2: Simulator Reducer and Actions

## Overview

This session implements the core reducer that manages simulator state transitions and the action creators that trigger those transitions. The reducer integrates Phase 1's pure `tick()` function with React's state management, using Immer for immutable updates. All simulator actions (STEP_FORWARD, STEP_BACKWARD, RESET, LOAD_SCENARIO, JUMP_TO_STEP) are handled here.

## Prerequisites

- Session 2.1 complete (history system working)
- Phase 1 complete (core simulator functions available)
- Understanding of React useReducer pattern
- Understanding of Immer for immutable updates
- Understanding of TypeScript discriminated unions for actions

## Goals

- [ ] Define all simulator action types
- [ ] Implement action creators with TypeScript types
- [ ] Implement simulator reducer with Immer
- [ ] Integrate Phase 1 `tick()` function
- [ ] Handle all action types (STEP_FORWARD, STEP_BACKWARD, RESET, LOAD_SCENARIO, JUMP_TO_STEP)
- [ ] Integrate history system from Session 2.1
- [ ] Process task effects after execution
- [ ] Write comprehensive reducer tests
- [ ] Ensure deterministic behavior

## Files to Create/Modify

### `src/state/types/actions.ts`
**Purpose:** Action type definitions
**Exports:** `SimulatorAction`, all action type interfaces
**Key responsibilities:**
- Define discriminated union of all action types
- Provide type-safe action interfaces
- Document action payloads

### `src/state/actions/simulator.ts`
**Purpose:** Action creator functions
**Exports:** `stepForward`, `stepBackward`, `reset`, `loadScenario`, `jumpToStep`
**Key responsibilities:**
- Create type-safe action objects
- Validate action payloads
- Provide convenient API for dispatching

### `src/state/reducers/simulator.ts`
**Purpose:** Simulator state reducer
**Exports:** `simulatorReducer`, `createInitialSimulatorState`
**Key responsibilities:**
- Handle all simulator actions
- Call core tick() function
- Update history
- Process task effects
- Maintain immutability with Immer

### `src/state/reducers/effects.ts`
**Purpose:** Task effect processing
**Exports:** `processTaskEffects`
**Key responsibilities:**
- Handle 'enqueue-task' effects
- Handle 'log' effects
- Handle 'invalidate-render' effects
- Handle 'cancel-webapi' effects

### `src/state/index.ts`
**Purpose:** Barrel export for state module
**Exports:** Re-exports from actions, reducers, types

## Type Definitions

### Action Types

```typescript
/**
 * Action to advance simulation by one step (one tick).
 */
export interface StepForwardAction {
  type: 'STEP_FORWARD';
}

/**
 * Action to step backward in history to previous state.
 */
export interface StepBackwardAction {
  type: 'STEP_BACKWARD';
}

/**
 * Action to reset simulation to initial state.
 * Optionally preserves current scenario.
 */
export interface ResetAction {
  type: 'RESET';
  payload?: {
    preserveScenario?: boolean;
  };
}

/**
 * Action to load a preset or custom scenario.
 */
export interface LoadScenarioAction {
  type: 'LOAD_SCENARIO';
  payload: {
    scenario: Scenario;
  };
}

/**
 * Action to jump to a specific step in history.
 */
export interface JumpToStepAction {
  type: 'JUMP_TO_STEP';
  payload: {
    stepIndex: number;
  };
}

/**
 * Discriminated union of all simulator actions.
 */
export type SimulatorAction =
  | StepForwardAction
  | StepBackwardAction
  | ResetAction
  | LoadScenarioAction
  | JumpToStepAction;
```

### Extended SimulatorState

```typescript
export interface SimulatorState {
  // All fields from Phase 1
  callStack: Frame[];
  webApis: Map<string, WebApiOperation>;
  macroQueue: Task[];
  microQueue: Task[];
  rafQueue: Task[];
  now: number;
  stepIndex: number;
  enqueueCounter: number;
  frameInterval: number;
  frameCounter: number;
  renderPending: boolean;
  lastFrameAt: number;
  log: LogEntry[];
  
  // History (from Session 2.1)
  history: SimulatorSnapshot[];
  historyPosition: number;
  
  // Current scenario (new)
  currentScenario: Scenario | null;
  
  // Simulation status (new)
  isComplete: boolean;
}
```

## Implementation Specifications

### Action Creators

**Purpose:** Create type-safe action objects

```typescript
/**
 * Create action to step forward one tick.
 */
export function stepForward(): StepForwardAction {
  return { type: 'STEP_FORWARD' };
}

/**
 * Create action to step backward in history.
 */
export function stepBackward(): StepBackwardAction {
  return { type: 'STEP_BACKWARD' };
}

/**
 * Create action to reset simulation.
 */
export function reset(preserveScenario = false): ResetAction {
  return {
    type: 'RESET',
    payload: { preserveScenario },
  };
}

/**
 * Create action to load a scenario.
 */
export function loadScenario(scenario: Scenario): LoadScenarioAction {
  return {
    type: 'LOAD_SCENARIO',
    payload: { scenario },
  };
}

/**
 * Create action to jump to specific step.
 */
export function jumpToStep(stepIndex: number): JumpToStepAction {
  return {
    type: 'JUMP_TO_STEP',
    payload: { stepIndex },
  };
}
```

**Usage:**
```typescript
dispatch(stepForward());
dispatch(loadScenario(presetScenarios.syncVsSetTimeout));
dispatch(jumpToStep(42));
```

### Reducer Implementation

**Function signature:**
```typescript
function simulatorReducer(
  state: SimulatorState,
  action: SimulatorAction
): SimulatorState
```

**Implementation with Immer:**

```typescript
import { produce } from 'immer';
import { tick } from '@/core/simulator/tick';
import { addToHistory, restoreSnapshot, jumpToStep as jumpToStepInHistory } from '../history';
import { loadScenarioIntoState } from './scenario-loader';

export function simulatorReducer(
  state: SimulatorState,
  action: SimulatorAction
): SimulatorState {
  return produce(state, draft => {
    switch (action.type) {
      case 'STEP_FORWARD':
        handleStepForward(draft);
        break;
      
      case 'STEP_BACKWARD':
        handleStepBackward(draft);
        break;
      
      case 'RESET':
        handleReset(draft, action.payload?.preserveScenario);
        break;
      
      case 'LOAD_SCENARIO':
        handleLoadScenario(draft, action.payload.scenario);
        break;
      
      case 'JUMP_TO_STEP':
        handleJumpToStep(draft, action.payload.stepIndex);
        break;
      
      default:
        // Exhaustive check - TypeScript will error if action type not handled
        const _exhaustive: never = action;
        return _exhaustive;
    }
  });
}
```

### Handler Functions

**STEP_FORWARD Handler:**

```typescript
function handleStepForward(draft: SimulatorState): void {
  // Don't step if simulation is complete
  if (draft.isComplete) {
    return;
  }
  
  // Call Phase 1 core simulator tick function
  const nextState = tick(draft);
  
  // Update draft with new state
  Object.assign(draft, nextState);
  
  // Increment step index
  draft.stepIndex++;
  
  // Add to history
  addToHistory(draft);
  
  // Check if simulation is complete (all queues empty, no web apis)
  draft.isComplete = isSimulationComplete(draft);
}

/**
 * Check if simulation has no more work to do.
 */
function isSimulationComplete(state: SimulatorState): boolean {
  return (
    state.callStack.length === 0 &&
    state.macroQueue.length === 0 &&
    state.microQueue.length === 0 &&
    state.rafQueue.length === 0 &&
    state.webApis.size === 0
  );
}
```

**STEP_BACKWARD Handler:**

```typescript
function handleStepBackward(draft: SimulatorState): void {
  // Can only step back if not at beginning
  if (draft.historyPosition <= 0) {
    return;
  }
  
  // Move back one position
  draft.historyPosition--;
  
  // Restore snapshot at new position
  const snapshot = draft.history[draft.historyPosition];
  const restored = restoreSnapshot(snapshot);
  
  // Apply restored state (preserving history array itself)
  const preservedHistory = draft.history;
  const preservedPosition = draft.historyPosition;
  
  Object.assign(draft, restored);
  
  // Restore history references
  draft.history = preservedHistory;
  draft.historyPosition = preservedPosition;
}
```

**RESET Handler:**

```typescript
function handleReset(draft: SimulatorState, preserveScenario = false): void {
  const scenario = preserveScenario ? draft.currentScenario : null;
  
  // Reset to initial state
  const initial = createInitialSimulatorState();
  Object.assign(draft, initial);
  
  // Reload scenario if preserved
  if (scenario) {
    loadScenarioIntoState(draft, scenario);
    draft.currentScenario = scenario;
  }
}
```

**LOAD_SCENARIO Handler:**

```typescript
function handleLoadScenario(draft: SimulatorState, scenario: Scenario): void {
  // Reset state
  const initial = createInitialSimulatorState();
  Object.assign(draft, initial);
  
  // Load scenario tasks into state
  loadScenarioIntoState(draft, scenario);
  
  // Set current scenario
  draft.currentScenario = scenario;
  
  // Add initial state to history
  addToHistory(draft);
}
```

**JUMP_TO_STEP Handler:**

```typescript
function handleJumpToStep(draft: SimulatorState, targetStepIndex: number): void {
  const restored = jumpToStepInHistory(draft, targetStepIndex);
  
  if (restored) {
    // Preserve history array
    const preservedHistory = draft.history;
    
    Object.assign(draft, restored);
    
    // Restore history reference
    draft.history = preservedHistory;
  }
}
```

### Scenario Loading

**Purpose:** Convert scenario definition into initial simulator state

```typescript
/**
 * Load scenario tasks into simulator state.
 */
export function loadScenarioIntoState(
  state: SimulatorState,
  scenario: Scenario
): void {
  // Process each task definition from scenario
  scenario.tasks.forEach(scenarioTask => {
    // Create Task object from scenario definition
    const task = createTaskFromScenarioTask(scenarioTask, state);
    
    // Enqueue according to task type
    enqueueTask(state, task);
  });
  
  // Add initial log entry
  state.log.push({
    timestamp: state.now,
    type: 'user',
    message: `Loaded scenario: ${scenario.name}`,
  });
}

/**
 * Convert scenario task definition to Task object.
 */
function createTaskFromScenarioTask(
  scenarioTask: ScenarioTask,
  state: SimulatorState
): Task {
  const baseProps = {
    id: generateTaskId(),
    label: scenarioTask.label,
    createdAt: state.now,
    enqueueSeq: state.enqueueCounter++,
    origin: 'scenario',
    state: TaskState.CREATED,
    durationSteps: scenarioTask.durationSteps ?? 1,
    effects: scenarioTask.effects ?? [],
  };
  
  switch (scenarioTask.type) {
    case TaskType.SYNC:
      return { ...baseProps, type: TaskType.SYNC };
    
    case TaskType.TIMER:
      return {
        ...baseProps,
        type: TaskType.TIMER,
        delay: scenarioTask.delay ?? 0,
      };
    
    case TaskType.MICROTASK:
      return { ...baseProps, type: TaskType.MICROTASK };
    
    case TaskType.FETCH:
      return {
        ...baseProps,
        type: TaskType.FETCH,
        url: scenarioTask.url ?? 'https://api.example.com',
        latency: scenarioTask.latency ?? 100,
      };
    
    // ... other task types
    
    default:
      throw new Error(`Unknown task type: ${scenarioTask.type}`);
  }
}
```

### Initial State Factory

```typescript
export function createInitialSimulatorState(): SimulatorState {
  return {
    // Core structures
    callStack: [],
    webApis: new Map(),
    macroQueue: [],
    microQueue: [],
    rafQueue: [],
    
    // Time and sequencing
    now: 0,
    stepIndex: 0,
    enqueueCounter: 0,
    
    // Frame timing
    frameInterval: 16,
    frameCounter: 0,
    renderPending: false,
    lastFrameAt: 0,
    
    // Logs
    log: [],
    
    // History
    history: [],
    historyPosition: 0,
    
    // Scenario
    currentScenario: null,
    
    // Status
    isComplete: false,
  };
}
```

## Success Criteria

- [ ] Reducer handles all action types correctly
- [ ] STEP_FORWARD calls tick() and adds to history
- [ ] STEP_BACKWARD restores previous state
- [ ] RESET returns to initial state
- [ ] LOAD_SCENARIO populates state with scenario tasks
- [ ] JUMP_TO_STEP navigates to target step
- [ ] All state updates are immutable (Immer working)
- [ ] Reducer tests achieve 100% coverage
- [ ] Integration with Phase 1 tick() works correctly

## Test Specifications

### Test: STEP_FORWARD advances simulation

**Given:** Initial state with one microtask queued
**When:** Dispatch STEP_FORWARD action
**Then:** Microtask executed, stepIndex incremented, history updated

```typescript
test('STEP_FORWARD executes tick and updates history', () => {
  const initialState = createInitialSimulatorState();
  
  // Add a microtask
  const task: Task = {
    type: TaskType.MICROTASK,
    id: '1',
    label: 'Test microtask',
    createdAt: 0,
    enqueueSeq: 0,
    origin: 'scenario',
    state: TaskState.QUEUED,
    durationSteps: 1,
    effects: [],
  };
  initialState.microQueue.push(task);
  
  // Step forward
  const action = stepForward();
  const nextState = simulatorReducer(initialState, action);
  
  // Assertions
  expect(nextState.stepIndex).toBe(1);
  expect(nextState.history.length).toBeGreaterThan(0);
  expect(nextState.callStack.length).toBe(1); // Task should be executing
  expect(nextState.callStack[0].task.id).toBe('1');
});
```

### Test: STEP_BACKWARD restores previous state

**Given:** State at step 3 with history
**When:** Dispatch STEP_BACKWARD action
**Then:** State restored to step 2

```typescript
test('STEP_BACKWARD restores previous state', () => {
  let state = createInitialSimulatorState();
  
  // Advance 3 steps
  state = simulatorReducer(state, stepForward());
  state = simulatorReducer(state, stepForward());
  state = simulatorReducer(state, stepForward());
  
  expect(state.stepIndex).toBe(3);
  const stepIndexAfterForward = state.stepIndex;
  
  // Step backward
  const backwardState = simulatorReducer(state, stepBackward());
  
  expect(backwardState.stepIndex).toBeLessThan(stepIndexAfterForward);
  expect(backwardState.historyPosition).toBe(state.historyPosition - 1);
});
```

### Test: RESET returns to initial state

**Given:** State after several steps
**When:** Dispatch RESET action
**Then:** State returns to initial values

```typescript
test('RESET returns to initial state', () => {
  let state = createInitialSimulatorState();
  
  // Make some changes
  state = simulatorReducer(state, stepForward());
  state = simulatorReducer(state, stepForward());
  
  expect(state.stepIndex).toBeGreaterThan(0);
  
  // Reset
  const resetState = simulatorReducer(state, reset());
  
  expect(resetState.stepIndex).toBe(0);
  expect(resetState.callStack.length).toBe(0);
  expect(resetState.history.length).toBe(0);
});
```

### Test: RESET with preserveScenario keeps scenario

**Given:** State with loaded scenario
**When:** Dispatch RESET with preserveScenario=true
**Then:** Scenario reloaded into fresh state

```typescript
test('RESET with preserveScenario reloads scenario', () => {
  const scenario: Scenario = {
    id: 'test',
    name: 'Test Scenario',
    description: 'Test',
    learningObjective: 'Test',
    tasks: [
      {
        type: TaskType.SYNC,
        label: 'Task 1',
      },
    ],
    tags: [],
  };
  
  let state = createInitialSimulatorState();
  state = simulatorReducer(state, loadScenario(scenario));
  
  expect(state.currentScenario).toBe(scenario);
  
  // Advance some steps
  state = simulatorReducer(state, stepForward());
  
  // Reset preserving scenario
  const resetState = simulatorReducer(state, reset(true));
  
  expect(resetState.stepIndex).toBe(0);
  expect(resetState.currentScenario).toBe(scenario);
  // Scenario should be reloaded (tasks enqueued)
});
```

### Test: LOAD_SCENARIO populates state

**Given:** Initial state
**When:** Dispatch LOAD_SCENARIO action
**Then:** Tasks from scenario enqueued correctly

```typescript
test('LOAD_SCENARIO enqueues scenario tasks', () => {
  const scenario: Scenario = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    learningObjective: 'Test',
    tasks: [
      { type: TaskType.SYNC, label: 'Sync Task' },
      { type: TaskType.TIMER, label: 'Timer Task', delay: 100 },
      { type: TaskType.MICROTASK, label: 'Microtask' },
    ],
    tags: [],
  };
  
  const state = createInitialSimulatorState();
  const loaded = simulatorReducer(state, loadScenario(scenario));
  
  expect(loaded.currentScenario).toBe(scenario);
  expect(loaded.macroQueue.length + loaded.microQueue.length).toBeGreaterThan(0);
  expect(loaded.log.length).toBeGreaterThan(0);
  expect(loaded.log[0].message).toContain('Loaded scenario');
});
```

### Test: JUMP_TO_STEP navigates correctly

**Given:** State with history at steps [0, 1, 2, 3, 4]
**When:** Dispatch JUMP_TO_STEP(2)
**Then:** State restored to step 2

```typescript
test('JUMP_TO_STEP navigates to target step', () => {
  let state = createInitialSimulatorState();
  
  // Build history
  for (let i = 0; i < 5; i++) {
    state = simulatorReducer(state, stepForward());
  }
  
  expect(state.stepIndex).toBe(5);
  
  // Jump to step 2
  const jumped = simulatorReducer(state, jumpToStep(2));
  
  expect(jumped.stepIndex).toBe(2);
});
```

### Test: Immutability maintained

**Given:** Initial state
**When:** Dispatch action
**Then:** Original state unchanged

```typescript
test('reducer does not mutate original state', () => {
  const state = createInitialSimulatorState();
  state.stepIndex = 0;
  
  const nextState = simulatorReducer(state, stepForward());
  
  // Original unchanged
  expect(state.stepIndex).toBe(0);
  // New state updated
  expect(nextState.stepIndex).toBe(1);
  // Different object references
  expect(nextState).not.toBe(state);
});
```

### Test: Simulation completion detected

**Given:** State with one task about to complete
**When:** Step forward to complete last task
**Then:** isComplete flag set to true

```typescript
test('simulation completion detected', () => {
  let state = createInitialSimulatorState();
  
  // Add single sync task
  const task: Task = {
    type: TaskType.SYNC,
    id: '1',
    label: 'Last task',
    createdAt: 0,
    enqueueSeq: 0,
    origin: 'scenario',
    state: TaskState.QUEUED,
    durationSteps: 1,
    effects: [],
  };
  state.macroQueue.push(task);
  
  // Execute task
  state = simulatorReducer(state, stepForward());
  
  // Should be marked complete
  expect(state.isComplete).toBe(true);
});
```

## Integration Points

- **Session 2.1**: Uses history functions (addToHistory, restoreSnapshot, jumpToStep)
- **Session 2.3**: Contexts will use this reducer with useReducer hook
- **Phase 1**: Calls tick() function from core simulator
- **Phase 3**: UI components will dispatch these actions
- **Phase 6**: Scenario loading integrates with scenario definitions

## References

- [Immer Documentation](https://immerjs.github.io/immer/)
- [React useReducer](https://react.dev/reference/react/useReducer)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
- [Phase 1 Tick Function](../phase-01-core-simulator/session-1.4-tick.md)
- [Session 2.1 History System](./session-2.1-history.md)

## Notes

### Why Immer?

Immer simplifies immutable updates dramatically:

**Without Immer:**
```typescript
return {
  ...state,
  stepIndex: state.stepIndex + 1,
  callStack: [
    ...state.callStack,
    newFrame
  ],
  history: [
    ...state.history,
    newSnapshot
  ],
  // ... many more spreads
};
```

**With Immer:**
```typescript
return produce(state, draft => {
  draft.stepIndex++;
  draft.callStack.push(newFrame);
  draft.history.push(newSnapshot);
  // Write "mutable" code, get immutable result
});
```

### Reducer Testing Strategy

Test at multiple levels:
1. **Unit tests**: Each handler function in isolation
2. **Integration tests**: Full reducer with multiple actions
3. **Property tests**: Invariants (immutability, history consistency)

### Action Creator Benefits

Action creators provide:
- Type safety (correct payload structure)
- Single source of truth for action shape
- Easy to test (pure functions)
- Consistent API for components
