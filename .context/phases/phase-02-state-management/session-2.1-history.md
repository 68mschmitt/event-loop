# Session 2.1: History System with Snapshots

## Overview

This session implements the history system that enables time-travel debugging and step-back functionality. The history system stores snapshots of simulator state at each step, allowing users to navigate backward through simulation execution. A bounded storage mechanism (5000 step cap) prevents memory exhaustion while supporting typical usage patterns.

## Prerequisites

- Phase 1 complete (all core simulator types and functions working)
- Understanding of TypeScript deep cloning strategies
- Understanding of memory management for large arrays
- Familiarity with React's useReducer pattern

## Goals

- [ ] Implement snapshot creation with efficient state copying
- [ ] Implement history storage with bounded array (5000 cap)
- [ ] Implement step-back restoration
- [ ] Implement jump-to-step functionality
- [ ] Add history navigation utilities (canStepBack, canStepForward)
- [ ] Write comprehensive unit tests for all history operations
- [ ] Ensure memory efficiency for long-running simulations

## Files to Create/Modify

### `src/state/history.ts`
**Purpose:** Core history management functions
**Exports:** `createSnapshot`, `addToHistory`, `restoreSnapshot`, `getSnapshotAtStep`, `canNavigateBack`, `canNavigateForward`
**Key responsibilities:**
- Create immutable snapshots of simulator state
- Maintain bounded history array
- Restore state from snapshots
- Provide navigation helpers

### `src/state/types/history.ts`
**Purpose:** History-specific type definitions
**Exports:** `SimulatorSnapshot`, `HistoryNavigationInfo`, `HistoryBounds`
**Key responsibilities:**
- Define snapshot structure
- Define navigation metadata types
- Define configuration types

### `src/state/hooks/useHistory.ts`
**Purpose:** Custom hook for history operations
**Exports:** `useHistory`
**Key responsibilities:**
- Provide convenient access to history functions
- Memoize expensive operations
- Handle edge cases (empty history, bounds reached)

### `src/state/hooks/useHistoryNavigation.ts`
**Purpose:** Custom hook for navigation helpers
**Exports:** `useHistoryNavigation`
**Key responsibilities:**
- Provide canStepBack, canStepForward helpers
- Calculate current position in history
- Handle boundary conditions

### `src/state/utils/deep-clone.ts`
**Purpose:** Efficient deep cloning utility
**Exports:** `deepClone`, `cloneSimulatorState`
**Key responsibilities:**
- Deep clone simulator state efficiently
- Handle Map objects correctly
- Preserve type information

## Type Definitions

### Snapshot Structure

```typescript
/**
 * A snapshot of simulator state at a specific step.
 * Used for time-travel debugging and step-back functionality.
 */
export interface SimulatorSnapshot {
  /** The step index when this snapshot was taken */
  stepIndex: number;
  
  /** Complete simulator state at this step */
  state: SimulatorState;
  
  /** Timestamp when snapshot was created (for debugging) */
  timestamp: number;
  
  /** Optional description of what happened at this step */
  description?: string;
}

/**
 * Information about history navigation capabilities.
 */
export interface HistoryNavigationInfo {
  /** Whether stepping backward is possible */
  canStepBack: boolean;
  
  /** Whether stepping forward is possible */
  canStepForward: boolean;
  
  /** Current position in history (0-based) */
  currentPosition: number;
  
  /** Total number of snapshots in history */
  totalSnapshots: number;
  
  /** Whether history is at capacity */
  atCapacity: boolean;
}

/**
 * Configuration for history bounds.
 */
export interface HistoryBounds {
  /** Maximum number of snapshots to store */
  maxSnapshots: number;
  
  /** Whether to warn when approaching capacity */
  warnAtPercentage?: number;
}
```

### Extended SimulatorState

The `SimulatorState` from Phase 1 is extended to include history:

```typescript
export interface SimulatorState {
  // ... all fields from Phase 1 ...
  
  /**
   * History of state snapshots for time-travel.
   * Bounded to prevent memory exhaustion.
   */
  history: SimulatorSnapshot[];
  
  /**
   * Current position in history (for forward/back navigation).
   * Points to index in history array.
   */
  historyPosition: number;
}
```

## Implementation Specifications

### Deep Cloning Strategy

**Purpose:** Create independent copies of simulator state for snapshots

**Implementation considerations:**
- Must handle Map objects (webApis)
- Must preserve array order
- Must avoid circular references
- Should be reasonably performant

```typescript
/**
 * Deep clone simulator state for snapshot storage.
 * Handles Maps, arrays, and nested objects correctly.
 */
export function cloneSimulatorState(state: SimulatorState): SimulatorState {
  return {
    // Primitive values (copy by value)
    now: state.now,
    stepIndex: state.stepIndex,
    enqueueCounter: state.enqueueCounter,
    frameInterval: state.frameInterval,
    frameCounter: state.frameCounter,
    renderPending: state.renderPending,
    lastFrameAt: state.lastFrameAt,
    historyPosition: state.historyPosition,
    
    // Arrays (shallow objects, but new array)
    callStack: state.callStack.map(frame => ({ ...frame })),
    macroQueue: state.macroQueue.map(task => ({ ...task })),
    microQueue: state.microQueue.map(task => ({ ...task })),
    rafQueue: state.rafQueue.map(task => ({ ...task })),
    log: state.log.map(entry => ({ ...entry })),
    
    // Map (requires special handling)
    webApis: new Map(
      Array.from(state.webApis.entries()).map(([key, op]) => [
        key,
        { ...op }
      ])
    ),
    
    // History array (shallow copy - don't clone snapshots recursively)
    history: [...state.history],
  };
}
```

**Alternative:** Could use `structuredClone()` if supported in target browsers, but manual cloning gives more control.

### Snapshot Creation

**Function signature:**
```typescript
function createSnapshot(
  state: SimulatorState,
  description?: string
): SimulatorSnapshot
```

**Implementation:**
```typescript
export function createSnapshot(
  state: SimulatorState,
  description?: string
): SimulatorSnapshot {
  return {
    stepIndex: state.stepIndex,
    state: cloneSimulatorState(state),
    timestamp: Date.now(),
    description,
  };
}
```

**Usage:**
```typescript
const snapshot = createSnapshot(state, "After microtask execution");
```

### Adding to History with Bounds

**Function signature:**
```typescript
function addToHistory(
  state: SimulatorState,
  bounds?: HistoryBounds
): void
```

**Implementation:**
```typescript
const DEFAULT_BOUNDS: HistoryBounds = {
  maxSnapshots: 5000,
  warnAtPercentage: 90,
};

export function addToHistory(
  state: SimulatorState,
  bounds: HistoryBounds = DEFAULT_BOUNDS
): void {
  const snapshot = createSnapshot(state);
  
  // Add to history
  state.history.push(snapshot);
  state.historyPosition = state.history.length - 1;
  
  // Enforce bounds (discard oldest if exceeded)
  if (state.history.length > bounds.maxSnapshots) {
    // Remove oldest snapshot(s)
    const excess = state.history.length - bounds.maxSnapshots;
    state.history.splice(0, excess);
    
    // Adjust position
    state.historyPosition = state.history.length - 1;
  }
  
  // Optional: warn when approaching capacity
  if (bounds.warnAtPercentage) {
    const percentage = (state.history.length / bounds.maxSnapshots) * 100;
    if (percentage >= bounds.warnAtPercentage) {
      console.warn(
        `History approaching capacity: ${state.history.length}/${bounds.maxSnapshots} (${percentage.toFixed(1)}%)`
      );
    }
  }
}
```

**Behavior:**
- Always adds to end of history array
- Updates historyPosition to point to newest
- Discards oldest snapshots when limit exceeded
- Maintains FIFO order for old snapshots

### Restoring from Snapshot

**Function signature:**
```typescript
function restoreSnapshot(
  snapshot: SimulatorSnapshot
): SimulatorState
```

**Implementation:**
```typescript
export function restoreSnapshot(
  snapshot: SimulatorSnapshot
): SimulatorState {
  // Clone the snapshot's state to avoid mutating history
  return cloneSimulatorState(snapshot.state);
}
```

**Usage in reducer:**
```typescript
case 'STEP_BACKWARD':
  return produce(state, draft => {
    if (draft.historyPosition > 0) {
      draft.historyPosition--;
      const snapshot = draft.history[draft.historyPosition];
      const restored = restoreSnapshot(snapshot);
      Object.assign(draft, restored);
    }
  });
```

### Navigation Helpers

**Function signature:**
```typescript
function getHistoryNavigationInfo(
  state: SimulatorState
): HistoryNavigationInfo
```

**Implementation:**
```typescript
export function getHistoryNavigationInfo(
  state: SimulatorState,
  bounds: HistoryBounds = DEFAULT_BOUNDS
): HistoryNavigationInfo {
  const totalSnapshots = state.history.length;
  const currentPosition = state.historyPosition;
  
  return {
    canStepBack: currentPosition > 0,
    canStepForward: currentPosition < totalSnapshots - 1,
    currentPosition,
    totalSnapshots,
    atCapacity: totalSnapshots >= bounds.maxSnapshots,
  };
}
```

**Usage:**
```typescript
const navInfo = getHistoryNavigationInfo(state);
if (navInfo.canStepBack) {
  // Enable "Step Back" button
}
```

### Jump to Step

**Function signature:**
```typescript
function jumpToStep(
  state: SimulatorState,
  targetStepIndex: number
): SimulatorState | null
```

**Implementation:**
```typescript
export function jumpToStep(
  state: SimulatorState,
  targetStepIndex: number
): SimulatorState | null {
  // Find snapshot with matching stepIndex
  const snapshotIndex = state.history.findIndex(
    s => s.stepIndex === targetStepIndex
  );
  
  if (snapshotIndex === -1) {
    return null; // Step not found in history
  }
  
  const snapshot = state.history[snapshotIndex];
  const restored = restoreSnapshot(snapshot);
  restored.historyPosition = snapshotIndex;
  
  return restored;
}
```

**Usage:**
```typescript
case 'JUMP_TO_STEP':
  return produce(state, draft => {
    const restored = jumpToStep(draft, action.payload.stepIndex);
    if (restored) {
      Object.assign(draft, restored);
    }
  });
```

## Success Criteria

- [ ] Snapshots correctly capture complete state
- [ ] History array stays within bounds (≤ 5000 items)
- [ ] Step-back restores previous state correctly
- [ ] Jump-to-step navigates to any valid step
- [ ] Navigation helpers return correct boolean values
- [ ] Cloning produces independent copies (mutations don't affect originals)
- [ ] Memory usage is reasonable for 5000 steps
- [ ] All tests pass with 100% coverage

## Test Specifications

### Test: Create snapshot captures state

**Given:** A simulator state at step 5
**When:** Create snapshot
**Then:** Snapshot contains correct stepIndex and cloned state

```typescript
test('createSnapshot captures complete state', () => {
  const state = createInitialState();
  state.stepIndex = 5;
  state.now = 100;
  
  const snapshot = createSnapshot(state, "Test snapshot");
  
  expect(snapshot.stepIndex).toBe(5);
  expect(snapshot.state.now).toBe(100);
  expect(snapshot.description).toBe("Test snapshot");
  expect(snapshot.timestamp).toBeGreaterThan(0);
});
```

### Test: Clone produces independent copy

**Given:** A simulator state with tasks
**When:** Clone state and mutate original
**Then:** Clone is unchanged

```typescript
test('cloneSimulatorState produces independent copy', () => {
  const state = createInitialState();
  const task: Task = {
    type: TaskType.SYNC,
    id: '1',
    label: 'Test',
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.QUEUED,
    durationSteps: 1,
    effects: [],
  };
  state.macroQueue.push(task);
  
  const cloned = cloneSimulatorState(state);
  
  // Mutate original
  state.macroQueue[0].label = 'Modified';
  
  // Clone unchanged
  expect(cloned.macroQueue[0].label).toBe('Test');
});
```

### Test: History bounded at 5000 snapshots

**Given:** A state with 5000 snapshots
**When:** Add one more snapshot
**Then:** Oldest snapshot removed, total stays at 5000

```typescript
test('addToHistory enforces 5000 snapshot limit', () => {
  const state = createInitialState();
  const bounds: HistoryBounds = { maxSnapshots: 5000 };
  
  // Add 5001 snapshots
  for (let i = 0; i < 5001; i++) {
    state.stepIndex = i;
    addToHistory(state, bounds);
  }
  
  expect(state.history.length).toBe(5000);
  // Oldest (stepIndex 0) should be removed
  expect(state.history[0].stepIndex).toBe(1);
  // Newest (stepIndex 5000) should be present
  expect(state.history[4999].stepIndex).toBe(5000);
});
```

### Test: Step back restores previous state

**Given:** State at step 3 with history [0, 1, 2, 3]
**When:** Step back
**Then:** State restored to step 2

```typescript
test('stepping back restores previous state', () => {
  const state = createInitialState();
  
  // Create history: steps 0, 1, 2, 3
  for (let i = 0; i <= 3; i++) {
    state.stepIndex = i;
    state.now = i * 10;
    addToHistory(state);
  }
  
  // Currently at step 3
  expect(state.historyPosition).toBe(3);
  
  // Step back to position 2
  state.historyPosition = 2;
  const snapshot = state.history[2];
  const restored = restoreSnapshot(snapshot);
  
  expect(restored.stepIndex).toBe(2);
  expect(restored.now).toBe(20);
});
```

### Test: Navigation helpers return correct values

**Given:** State with 5 snapshots at position 2
**When:** Get navigation info
**Then:** Can step back (true), can step forward (true)

```typescript
test('navigation helpers work correctly', () => {
  const state = createInitialState();
  
  // Add 5 snapshots
  for (let i = 0; i < 5; i++) {
    state.stepIndex = i;
    addToHistory(state);
  }
  
  // At position 2 (middle)
  state.historyPosition = 2;
  
  const navInfo = getHistoryNavigationInfo(state);
  
  expect(navInfo.canStepBack).toBe(true);
  expect(navInfo.canStepForward).toBe(true);
  expect(navInfo.currentPosition).toBe(2);
  expect(navInfo.totalSnapshots).toBe(5);
  expect(navInfo.atCapacity).toBe(false);
});

test('navigation at start', () => {
  const state = createInitialState();
  addToHistory(state);
  state.historyPosition = 0;
  
  const navInfo = getHistoryNavigationInfo(state);
  
  expect(navInfo.canStepBack).toBe(false);
  expect(navInfo.canStepForward).toBe(false);
});

test('navigation at end', () => {
  const state = createInitialState();
  
  for (let i = 0; i < 3; i++) {
    state.stepIndex = i;
    addToHistory(state);
  }
  
  state.historyPosition = 2; // Last position
  
  const navInfo = getHistoryNavigationInfo(state);
  
  expect(navInfo.canStepBack).toBe(true);
  expect(navInfo.canStepForward).toBe(false);
});
```

### Test: Jump to step navigates correctly

**Given:** State with history [0, 5, 10, 15, 20]
**When:** Jump to step 10
**Then:** State restored to step 10

```typescript
test('jumpToStep navigates to target step', () => {
  const state = createInitialState();
  
  // Add snapshots at steps 0, 5, 10, 15, 20
  [0, 5, 10, 15, 20].forEach(step => {
    state.stepIndex = step;
    state.now = step * 10;
    addToHistory(state);
  });
  
  // Jump to step 10
  const restored = jumpToStep(state, 10);
  
  expect(restored).not.toBeNull();
  expect(restored!.stepIndex).toBe(10);
  expect(restored!.now).toBe(100);
  expect(restored!.historyPosition).toBe(2); // Index of step 10 in history
});

test('jumpToStep returns null for missing step', () => {
  const state = createInitialState();
  addToHistory(state);
  
  const restored = jumpToStep(state, 999);
  
  expect(restored).toBeNull();
});
```

### Test: Map objects cloned correctly

**Given:** State with webApis Map
**When:** Clone state
**Then:** Clone has independent Map

```typescript
test('webApis Map cloned correctly', () => {
  const state = createInitialState();
  
  const webApiOp: WebApiOperation = {
    id: 'op1',
    type: WebApiType.TIMER,
    readyAt: 100,
    targetQueue: 'macro',
    payloadTask: createMockTask(),
  };
  
  state.webApis.set('op1', webApiOp);
  
  const cloned = cloneSimulatorState(state);
  
  // Mutate original
  state.webApis.get('op1')!.readyAt = 200;
  
  // Clone unchanged
  expect(cloned.webApis.get('op1')!.readyAt).toBe(100);
});
```

## Integration Points

- **Session 2.2**: Reducer will call `addToHistory()` after each step forward
- **Session 2.2**: Reducer will call `restoreSnapshot()` for step backward
- **Session 2.3**: Custom hooks will use navigation helpers for UI state
- **Phase 5**: Timeline scrubber will use `jumpToStep()` for direct navigation
- **Phase 1**: Uses `SimulatorState` from Phase 1 as input/output

## References

- [SimulatorState definition](../phase-01-core-simulator/session-1.1-types.md)
- [Immutable Update Patterns](https://immerjs.github.io/immer/)
- [React useReducer](https://react.dev/reference/react/useReducer)
- [structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)

## Notes

### Why 5000 snapshots?

- Typical scenario: 100-500 steps
- Power user: 1000-2000 steps
- 5000 provides 5-10x buffer
- Each snapshot ~10KB (approx), 5000 = 50MB total (acceptable)
- Can be adjusted based on real-world usage

### Cloning Performance

Manual cloning chosen over `structuredClone()`:
- More control over what gets cloned
- Can optimize for known structure
- Better browser compatibility
- Avoid cloning unnecessary nested data

### History vs Undo/Redo

This is "history" not traditional "undo/redo":
- Always append-only (forward adds to history)
- Backward navigates existing history
- No branching (forward from middle position continues from there)
- Simpler mental model for users

### Memory Management

For very long simulations (>5000 steps):
- Oldest snapshots automatically discarded
- User warned at 90% capacity
- No memory leaks (bounded array)
- Could add "clear old history" action if needed
