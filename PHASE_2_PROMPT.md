# Event Loop Visualizer - Phase 2: State Management Implementation

You are implementing Phase 2 of the Event Loop Visualizer project. This phase wraps the Phase 1 core simulator in React state management with history/time-travel support.

## Project Context

**Phase 1 Status**: COMPLETE ✅
- All 5 sessions implemented
- 211 tests passing
- Core simulator fully functional
- Zero UI dependencies

Read these files for context:
- `.context/README.md` - Project overview
- `.context/architecture/overview.md` - System architecture
- `.context/phases/phase-02-state-management/README.md` - Phase overview

## Phase 2 Goals

Implement 3 sessions to create React-based state management:

1. **Session 2.1**: Context setup and basic state management
2. **Session 2.2**: History system with snapshots for time-travel
3. **Session 2.3**: Custom hooks and state selectors

## Session Overview

### Session 2.1: Context Setup (3-4 hours)
Create React Context with useReducer to manage simulator state.

**Files to create:**
- `src/state/SimulatorContext.tsx` - Context and Provider component
- `src/state/simulatorReducer.ts` - Reducer for simulator actions
- `src/state/actions.ts` - Action creators
- `src/state/types.ts` - State management types

**Key features:**
- `SimulatorProvider` component wrapping children
- Reducer handles: STEP_FORWARD, STEP_BACK, RESET, LOAD_SCENARIO
- Initial state from Phase 1 `createInitialState()`
- Immutable updates using spread operators or Immer

**Success criteria:**
- Context provides state and dispatch
- Reducer integrates Phase 1 `tick()` function
- Actions trigger correct state transitions
- Tests verify reducer logic

### Session 2.2: History System (3-4 hours)
Add snapshot-based history for time-travel debugging.

**Files to create:**
- `src/state/history.ts` - History management functions
- `src/state/historyReducer.ts` - Reducer extension for history

**Key features:**
- Store snapshots after each tick (max 5000)
- `jumpToStep(stepIndex)` - Jump to any historical step
- `getHistory()` - Return array of snapshots
- Circular buffer for performance
- History preserved during STEP_BACK

**Success criteria:**
- Can step forward and record history
- Can jump back to any previous step
- History bounded at 5000 steps
- Deterministic playback (replay matches original)

### Session 2.3: Custom Hooks (2-3 hours)
Create convenient hooks for accessing state and dispatching actions.

**Files to create:**
- `src/state/hooks/useSimulator.ts` - Access simulator state
- `src/state/hooks/useSimulatorDispatch.ts` - Access dispatch
- `src/state/hooks/useStepForward.ts` - Step forward action
- `src/state/hooks/useStepBack.ts` - Step backward action
- `src/state/hooks/useHistory.ts` - Access history
- `src/state/index.ts` - Barrel export

**Key features:**
- Type-safe hooks with TypeScript
- Memoized selectors for performance
- Convenient action dispatchers
- Error handling for context not found

**Success criteria:**
- All hooks accessible from `@/state`
- Components can use hooks without prop drilling
- TypeScript provides autocomplete
- Tests verify hook behavior

## Implementation Strategy

**Run sessions sequentially** (not in parallel):

1. **Session 2.1**: Core state management foundation
2. **Session 2.2**: Build history on top of Session 2.1
3. **Session 2.3**: Create convenient hooks on top of 2.1 and 2.2

## Success Criteria

Phase 2 is complete when:
- [ ] Context provides simulator state to component tree
- [ ] Reducer correctly wraps Phase 1 `tick()` function
- [ ] History stores up to 5000 snapshots
- [ ] Can jump to any historical state
- [ ] Custom hooks provide convenient API
- [ ] All tests pass (unit + integration)
- [ ] No Phase 1 code modified (only wrapped)
- [ ] Example component can use hooks to control simulator

## Tech Stack

- **React 18+**: Context API + useReducer
- **TypeScript**: Strict mode, full type safety
- **Optional - Immer**: For immutable updates (or manual spread)
- **Vitest**: Testing with React Testing Library

## Key Principles

1. **Wrap, Don't Modify**: Phase 1 simulator remains pure, state management wraps it
2. **Immutability**: All state updates create new objects
3. **Type Safety**: Full TypeScript coverage
4. **Performance**: Memoize selectors, avoid unnecessary re-renders
5. **Testability**: Test reducers in isolation

## File Structure

```
src/state/
├── SimulatorContext.tsx
├── simulatorReducer.ts
├── historyReducer.ts
├── actions.ts
├── types.ts
├── history.ts
├── hooks/
│   ├── useSimulator.ts
│   ├── useSimulatorDispatch.ts
│   ├── useStepForward.ts
│   ├── useStepBack.ts
│   ├── useHistory.ts
│   └── index.ts
└── index.ts

tests/unit/state/
├── simulatorReducer.test.ts
├── history.test.ts
├── hooks.test.ts
└── integration.test.ts
```

## Example Usage (Target API)

After Phase 2, components should be able to use the simulator like this:

```tsx
import { SimulatorProvider } from '@/state';
import { useSimulator, useStepForward, useHistory } from '@/state/hooks';

function App() {
  return (
    <SimulatorProvider>
      <SimulatorView />
    </SimulatorProvider>
  );
}

function SimulatorView() {
  const state = useSimulator();
  const stepForward = useStepForward();
  const { canStepBack, stepBack } = useHistory();
  
  return (
    <div>
      <p>Current time: {state.now}ms</p>
      <p>Step: {state.stepIndex}</p>
      <button onClick={stepForward}>Step Forward</button>
      <button onClick={stepBack} disabled={!canStepBack}>
        Step Back
      </button>
    </div>
  );
}
```

## Integration with Phase 1

Phase 2 uses Phase 1 exports:
- `createInitialState()` - Initialize state
- `tick()` - Advance simulation
- `SimulatorState` type - State shape
- `Task`, `LogEntry`, etc. - All types
- No modifications to Phase 1 code

## Next Steps After Phase 2

Once Phase 2 is complete, Phase 3 will create the UI scaffolding (layout, canvas, panels) that consumes the state management layer.

## Notes

- Phase 1 has 211 passing tests, do not break them
- TypeScript has some strict mode warnings in Phase 1 (non-critical)
- Use `@testing-library/react` for component/hook tests
- Consider Immer for cleaner immutable updates (optional)
- History storage could be optimized later (structural sharing, etc.)

## Begin Implementation

Start with Session 2.1: Context setup and basic state management. Create the SimulatorContext and reducer that wraps the Phase 1 simulator.

When Session 2.1 is complete, proceed to Session 2.2 (History), then Session 2.3 (Hooks).
