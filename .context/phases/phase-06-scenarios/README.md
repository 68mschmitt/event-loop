# Phase 6: Scenarios

## Overview

Phase 6 implements the **scenario system** - both the preset scenarios that demonstrate key event loop concepts and the builder UI for creating custom scenarios. This phase transforms the simulator from a bare engine into a learning tool with concrete examples.

## Goals

By the end of Phase 6, you will have:
- ✅ Complete scenario schema with validation
- ✅ Scenario builder UI for custom scenarios
- ✅ All 8 preset scenarios implemented
- ✅ Export/import functionality for scenarios
- ✅ Validation error messages
- ✅ Integration with simulator and state management

## Why This Phase Now?

With the simulator (Phase 1), state management (Phase 2), UI scaffolding (Phase 3), animations (Phase 4), and controls (Phase 5) complete, we now have all the infrastructure needed to load and run scenarios. Phase 6 provides the **content** that makes the visualizer useful for learning.

Scenarios are the bridge between the technical simulator and educational value.

## Sessions

### Session 6.1: Scenario Schema and Validation
**Duration:** 3-4 hours
**Complexity:** Medium

Define the scenario schema, implement validation rules, and create clear error messages for invalid scenarios.

[See session-6.1-schema-validation.md](./session-6.1-schema-validation.md)

### Session 6.2: Scenario Builder UI
**Duration:** 4-5 hours
**Complexity:** Medium-High

Build the UI for creating custom scenarios: add/remove tasks, configure task properties, export/import JSON.

[See session-6.2-scenario-builder.md](./session-6.2-scenario-builder.md)

### Session 6.3: Preset Scenarios 1-4
**Duration:** 3-4 hours
**Complexity:** Medium

Implement the first 4 preset scenarios demonstrating fundamental concepts: sync vs async, microtask priority, microtask draining, and async/await behavior.

[See session-6.3-presets-1-4.md](./session-6.3-presets-1-4.md)

### Session 6.4: Preset Scenarios 5-8
**Duration:** 3-4 hours
**Complexity:** Medium

Implement the remaining 4 preset scenarios demonstrating advanced concepts: fetch + timers, DOM events, requestAnimationFrame, and microtask starvation.

[See session-6.4-presets-5-8.md](./session-6.4-presets-5-8.md)

## Key Concepts

### Scenario Structure
Each scenario is a complete definition of:
- **Metadata**: id, name, description, learning objective
- **Tasks**: Ordered list of tasks to execute
- **Expected outcome**: What logs should appear
- **Tags**: Categorization for filtering

### Validation
Scenarios must be validated before execution:
- Required fields present
- Task types valid
- Delays/latencies non-negative
- Effects properly formatted
- No circular dependencies

### Preset vs Custom
- **Preset scenarios**: Curated examples demonstrating specific concepts
- **Custom scenarios**: User-created scenarios via builder UI

### Learning Objectives
Each preset has an explicit learning objective:
- What concept does it demonstrate?
- What should the user learn?
- What is the key takeaway?

## Success Criteria

Phase 6 is complete when:
- [ ] Schema validation catches all invalid scenarios
- [ ] Validation errors are clear and actionable
- [ ] Builder UI can create any valid scenario
- [ ] All 8 presets load and run correctly
- [ ] Each preset produces expected log output
- [ ] Export creates valid JSON
- [ ] Import loads exported scenarios
- [ ] Presets are accessible from UI
- [ ] Custom scenarios can be saved/loaded
- [ ] Tests verify preset correctness

## Testing Strategy

### Validation Tests
- Valid scenarios pass validation
- Missing required fields fail
- Invalid task types fail
- Negative delays fail
- Clear error messages for each failure

### Preset Tests
For each preset:
```typescript
test('preset loads correctly', () => {
  const scenario = loadPreset('sync-vs-settimeout');
  expect(scenario).toBeDefined();
  expect(scenario.tasks.length).toBeGreaterThan(0);
});

test('preset produces expected output', () => {
  const state = runScenarioToCompletion('sync-vs-settimeout');
  const logs = state.log.filter(e => e.type === 'user');
  expect(logs.map(e => e.message)).toEqual(['Start', 'End', 'Timeout']);
});
```

### Builder Tests
- Can add task
- Can remove task
- Can reorder tasks
- Can edit task properties
- Export produces valid JSON
- Import restores scenario

## File Structure

```
src/
├── core/
│   └── scenarios/
│       ├── schema.ts              # Scenario type definitions
│       ├── validator.ts           # Validation logic
│       ├── presets/
│       │   ├── index.ts           # All presets export
│       │   ├── sync-vs-settimeout.ts
│       │   ├── promise-vs-settimeout.ts
│       │   ├── nested-microtasks.ts
│       │   ├── async-await-multi.ts
│       │   ├── fetch-complex.ts
│       │   ├── dom-event-handlers.ts
│       │   ├── raf-timing.ts
│       │   └── microtask-starvation.ts
│       └── loader.ts              # Load/parse scenarios
├── components/
│   └── panels/
│       ├── ScenarioBuilder.tsx    # Builder UI
│       ├── PresetSelector.tsx     # Preset selection UI
│       └── ScenarioExporter.tsx   # Export/import UI
└── state/
    └── actions/
        └── scenario.ts            # Scenario-related actions
```

## Integration Points

### With Simulator (Phase 1)
- Scenarios define tasks that populate simulator state
- Validation ensures tasks are compatible with simulator

### With State Management (Phase 2)
- LOAD_SCENARIO action loads scenario into state
- Scenario becomes part of application state

### With UI (Phase 3)
- PresetSelector renders preset list
- ScenarioBuilder renders in panel

### With Controls (Phase 5)
- Loading scenario resets playback
- Scenario metadata displayed in UI

### With Explanations (Phase 8)
- Presets include explanation templates
- Learning objectives displayed

## Common Patterns

### Validation Error Format
```typescript
interface ScenarioValidationError {
  field: string;        // e.g., 'tasks[0].delay'
  message: string;      // e.g., 'Delay must be non-negative'
  severity: 'error' | 'warning';
}
```

### Preset Template
```typescript
export const presetName: Scenario = {
  id: 'preset-id',
  name: 'Display Name',
  description: 'What it demonstrates',
  learningObjective: 'What the user should learn',
  tasks: [
    // Task definitions
  ],
  expectedOutcome: 'Expected log output',
  tags: ['tag1', 'tag2'],
};
```

### Task Effect Pattern
```typescript
// Log effect
{ type: 'log', payload: 'Message to log' }

// Enqueue effect
{ type: 'enqueue-task', payload: { type: TaskType.MICROTASK, ... } }

// Render effect
{ type: 'invalidate-render', payload: null }
```

## Next Phase

After Phase 6 completes, move to **Phase 7: Accessibility** to ensure the application is usable by everyone.

## Common Pitfalls

### ❌ Hardcoding task IDs
```typescript
// BAD - IDs should be generated
tasks: [
  { id: 'task1', type: TaskType.SYNC, ... }
]
```

### ✅ Generate IDs during load
```typescript
// GOOD - IDs generated when scenario loads
tasks: [
  { type: TaskType.SYNC, label: '...', ... }
  // ID assigned by loader
]
```

### ❌ Non-deterministic ordering
```typescript
// BAD - Map iteration order not guaranteed
const presets = new Map<string, Scenario>();
```

### ✅ Deterministic ordering
```typescript
// GOOD - Array maintains order
const presets: Scenario[] = [preset1, preset2, ...];
```

### ❌ Missing validation
```typescript
// BAD - Loading unvalidated scenario
function loadScenario(data: unknown) {
  return data as Scenario; // Unsafe!
}
```

### ✅ Always validate
```typescript
// GOOD - Validate before use
function loadScenario(data: unknown): Result<Scenario, ValidationError[]> {
  const errors = validateScenario(data);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: data as Scenario };
}
```

## Resources

- [Preset Scenarios Specification](../../reference/preset-scenarios.md)
- [Event Loop Rules](../../reference/event-loop-rules.md)
- [Task Types Reference](../phase-01-core-simulator/session-1.1-types.md)
- [Schema Validation Best Practices](https://zod.dev)

## Notes

- Presets should be immutable (frozen in production)
- Custom scenarios should be saveable to localStorage
- Export format should be JSON (for portability)
- Consider versioning scenarios for future compatibility
- Add schema version field for migration support
