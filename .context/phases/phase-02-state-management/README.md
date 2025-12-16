# Phase 2: State Management

## Overview

Phase 2 implements the state management layer that wraps the core simulator with React state, history tracking, and action dispatching. This phase bridges the pure TypeScript simulation engine from Phase 1 with React's component model, enabling time-travel debugging, playback controls, and UI synchronization.

## Architecture

The state management layer follows React's unidirectional data flow pattern using Context API + useReducer:

```
User Interaction → Action Dispatch → Reducer → Core Simulator → New State → UI Update
                                       ↓
                                   History System
```

## Key Components

### 1. History System (Session 2.1)
- Snapshot storage for time-travel
- Step-back capability
- Bounded storage (5000 step limit)
- Efficient memory management

### 2. Simulator Reducer (Session 2.2)
- Immutable state updates with Immer
- Action handling (STEP_FORWARD, STEP_BACKWARD, RESET, LOAD_SCENARIO, JUMP_TO_STEP)
- Integration with core tick() function
- Effect processing

### 3. Context Providers (Session 2.3)
- SimulatorContext: Simulation state + dispatch
- UIContext: UI state + dispatch
- Custom hooks for convenient access
- Performance optimization with context splitting

## State Shape

### SimulatorState (managed by SimulatorContext)
```typescript
interface SimulatorState {
  // Core structures (from Phase 1)
  callStack: Frame[];
  webApis: Map<string, WebApiOperation>;
  macroQueue: Task[];
  microQueue: Task[];
  rafQueue: Task[];
  
  // Time and sequencing
  now: number;
  stepIndex: number;
  enqueueCounter: number;
  
  // Frame timing
  frameInterval: number;
  frameCounter: number;
  renderPending: boolean;
  lastFrameAt: number;
  
  // Logs
  log: LogEntry[];
  
  // History (new in Phase 2)
  history: SimulatorSnapshot[];
}
```

### UIState (managed by UIContext)
```typescript
interface UIState {
  // Playback
  isPlaying: boolean;
  speed: number;              // 0.25, 0.5, 1, 2, 4
  
  // Selection
  selectedTaskId: string | null;
  
  // Settings
  reducedMotion: boolean;
  showExplanations: boolean;
  developerMode: boolean;
  
  // Current scenario
  currentScenario: Scenario | null;
}
```

## Actions

### Simulator Actions
- `STEP_FORWARD`: Advance simulation by one tick
- `STEP_BACKWARD`: Restore previous snapshot
- `RESET`: Return to initial state
- `LOAD_SCENARIO`: Load a preset or custom scenario
- `JUMP_TO_STEP`: Jump to specific step in history

### UI Actions
- `TOGGLE_PLAY`: Toggle playback state
- `SET_SPEED`: Change playback speed
- `SELECT_TASK`: Set selected task for inspector
- `TOGGLE_SETTING`: Toggle UI settings

## Principles

### 1. Separation of Concerns
- **SimulatorContext**: Owns simulation state, never touches UI state
- **UIContext**: Owns UI state, never touches simulation state
- Clear boundaries prevent coupling

### 2. Immutability
- All state updates are immutable
- Immer provides mutable-looking API with immutable results
- Enables time-travel and debugging

### 3. Determinism
- Reducers are pure functions
- Same state + same action = same result
- No side effects in reducers

### 4. Performance
- Context splitting prevents unnecessary re-renders
- Memoization of expensive computations
- Bounded history prevents memory leaks

## Integration with Phase 1

Phase 2 wraps Phase 1's core simulator:

```typescript
function simulatorReducer(state: SimulatorState, action: Action) {
  return produce(state, draft => {
    switch (action.type) {
      case 'STEP_FORWARD':
        // Call Phase 1 core function
        const nextState = tick(draft);
        Object.assign(draft, nextState);
        
        // Add to history
        addToHistory(draft);
        break;
      // ... other actions
    }
  });
}
```

## Sessions

### Session 2.1: History System
**Files:** `src/state/history.ts`, `src/state/hooks/useHistory.ts`
**Deliverables:**
- Snapshot storage with efficient copying
- Step-back restoration
- History bounds (5000 limit)
- History navigation utilities

### Session 2.2: Simulator Reducer and Actions
**Files:** `src/state/reducers/simulator.ts`, `src/state/actions/simulator.ts`
**Deliverables:**
- Reducer with Immer integration
- All simulator action handlers
- Action creators with TypeScript types
- Integration with core tick()

### Session 2.3: Context Providers and Integration
**Files:** `src/state/SimulatorContext.tsx`, `src/state/UIContext.tsx`, `src/state/hooks/index.ts`
**Deliverables:**
- Context providers with useReducer
- Custom hooks (useSimulator, usePlayback, useStep, useTimeline)
- Provider composition
- Hook testing utilities

## Success Criteria

Phase 2 is complete when:
- [ ] All state updates are immutable
- [ ] History system stores and restores snapshots correctly
- [ ] All simulator actions work (step forward, back, reset, load, jump)
- [ ] Custom hooks provide convenient access to state
- [ ] Context providers integrate with Phase 1 core
- [ ] No prop drilling needed for global state
- [ ] Performance is acceptable (no unnecessary re-renders)
- [ ] All tests pass (reducer tests, hook tests, integration tests)

## Testing Strategy

### Unit Tests
- Test reducers in isolation with action creators
- Test history functions (add, restore, bounds)
- Test action creators return correct shapes

### Hook Tests
- Test custom hooks with `@testing-library/react-hooks`
- Verify state updates propagate correctly
- Test memoization prevents unnecessary recalculations

### Integration Tests
- Test full action → reducer → state → UI flow
- Verify context providers work together
- Test complex scenarios (load → step → back → reset)

## Prerequisites

- Phase 1 complete (core simulator working)
- Understanding of React hooks (useReducer, useContext, useMemo, useCallback)
- Understanding of Immer for immutable updates
- Understanding of Context API patterns

## References

- [React Context API](https://react.dev/reference/react/useContext)
- [useReducer Hook](https://react.dev/reference/react/useReducer)
- [Immer Documentation](https://immerjs.github.io/immer/)
- [Phase 1 Documentation](../phase-01-core-simulator/README.md)
- [Architecture Overview](../../architecture/overview.md)
- [Tech Stack](../../tech-stack.md)

## Notes

### Why Context over Redux?
- Simpler for this scope
- Built-in time-travel with history array
- No additional dependencies
- Easier to test
- Sufficient for app complexity

### Why Split Contexts?
- Prevents unnecessary re-renders
- Components subscribe only to needed state
- Better performance for frequent updates
- Clear separation of concerns

### History Bounds Rationale
- 5000 steps chosen as reasonable limit
- Prevents memory exhaustion
- User rarely needs more than 5000 steps back
- Can be increased if needed with performance testing
