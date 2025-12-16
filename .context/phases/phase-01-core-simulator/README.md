# Phase 1: Core Simulator

## Overview

Phase 1 builds the **core event loop simulation engine** - the heart of the entire application. This phase has zero UI dependencies and produces a pure TypeScript module that can be tested and used independently.

## Goals

By the end of Phase 1, you will have:
- ✅ Complete type system for all simulator entities
- ✅ Queue and Stack data structures
- ✅ Enqueue rules for all task types
- ✅ Web API operations (timers, fetch, events, rAF)
- ✅ Main tick function with priority rules
- ✅ Microtask draining logic
- ✅ Render/frame timing logic
- ✅ Comprehensive unit tests

## Why This Phase First?

The simulator is the foundation of everything else:
- **Deterministic**: Always produces the same result for same input
- **Testable**: Pure functions with no side effects
- **Portable**: No React/DOM dependencies
- **Documented**: Clear rules matching the spec

Without a working simulator, nothing else can function.

## Sessions

### Session 1.1: Type Definitions
**Duration:** 2-3 hours
**Complexity:** Medium

Define all TypeScript types and interfaces for the simulation model. This includes Task, SimulatorState, WebApiOperation, queues, and more.

[See session-1.1-types.md](./session-1.1-types.md)

### Session 1.2: Queue and Stack Data Structures
**Duration:** 2 hours
**Complexity:** Low-Medium

Implement Queue and Stack classes with proper TypeScript typing and methods needed by the simulator.

[See session-1.2-queues.md](./session-1.2-queues.md)

### Session 1.3: Enqueue Rules and Web API Operations
**Duration:** 3-4 hours
**Complexity:** Medium-High

Implement how each task type enqueues work (setTimeout, Promise.then, fetch, etc.) and how Web API operations track pending work.

[See session-1.3-enqueue-rules.md](./session-1.3-enqueue-rules.md)

### Session 1.4: Tick Function and Priority Rules
**Duration:** 3-4 hours
**Complexity:** High

Implement the main `tick()` function that advances the simulation by one step, following strict priority rules.

[See session-1.4-tick-logic.md](./session-1.4-tick-logic.md)

### Session 1.5: Render and Microtask Logic
**Duration:** 2-3 hours
**Complexity:** Medium

Implement frame boundary detection, render step logic, and microtask draining behavior.

[See session-1.5-render-logic.md](./session-1.5-render-logic.md)

## Key Concepts

### Determinism
Every function in this phase is **deterministic**: same input → same output, no exceptions. This means:
- No `Date.now()` - use logical time (`now` field)
- No `Math.random()` - use sequence numbers for ordering
- No network calls - simulate with delays
- No timers - advance time explicitly

### Immutability
While we'll use Immer in the state layer, the core simulator functions should treat inputs as read-only and return new objects.

### Priority Rules
The simulator follows strict priority rules (from requirements):
1. Execute current call stack frame
2. Drain microtask queue (one at a time)
3. Check if render should occur
4. Execute rAF callback (if applicable)
5. Execute macrotask (if available)
6. Advance time to next Web API completion

## Success Criteria

Phase 1 is complete when:
- [ ] All type definitions exist and compile
- [ ] Queue/Stack implementations pass all tests
- [ ] All 6+ task types can enqueue correctly
- [ ] tick() function handles all priority rules
- [ ] Microtasks drain before macrotasks
- [ ] Render occurs at correct frame boundaries
- [ ] 100% unit test coverage on core logic
- [ ] Can run a simple scenario (sync + timer + promise) manually
- [ ] No React/DOM dependencies in core/ directory

## Testing Strategy

Each session should include:
- **Unit tests**: Test individual functions in isolation
- **Integration tests**: Test multiple components together
- **Invariant checks**: Assert expected properties (e.g., microtask queue always drains)

Run tests with:
```bash
npm run test:unit -- --coverage
```

## Next Phase

After Phase 1 completes, move to **Phase 2: State Management** to wrap the simulator in React state management.

## Common Pitfalls

### ❌ Using wall-clock time
```typescript
// BAD
const now = Date.now();
```

### ✅ Use logical time
```typescript
// GOOD
const now = state.now;
```

### ❌ Mutating input state
```typescript
// BAD
function tick(state: SimulatorState) {
  state.stepIndex++;
  return state;
}
```

### ✅ Return new state
```typescript
// GOOD
function tick(state: SimulatorState): SimulatorState {
  return {
    ...state,
    stepIndex: state.stepIndex + 1
  };
}
```

### ❌ Non-deterministic ordering
```typescript
// BAD
const tasks = new Set<Task>(); // Order not guaranteed
```

### ✅ Deterministic ordering
```typescript
// GOOD
const tasks: Task[] = []; // Array maintains insertion order
tasks.sort((a, b) => a.enqueueSeq - b.enqueueSeq); // Explicit ordering
```

## Resources

- [Event Loop Rules](../../reference/event-loop-rules.md)
- [Simulator Model Spec](../../architecture/simulator-model.md)
- [Dependency Graph](../../architecture/dependency-graph.md)
- [TypeScript Best Practices](../../tech-stack.md)
