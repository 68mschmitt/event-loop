# Session 6.3: Preset Scenarios 1-4

## Overview

This session implements the first four preset scenarios that demonstrate fundamental event loop concepts. These presets form the foundation of the educational experience and must be implemented with precision to ensure learners understand core concepts.

## Prerequisites

- Session 6.1 complete (validation available)
- Phase 1 complete (task types defined)
- Understanding of event loop priority rules
- Familiarity with preset specifications in reference docs

## Goals

- [ ] Implement Preset 1: Sync vs setTimeout(0)
- [ ] Implement Preset 2: Promise.then vs setTimeout(0)
- [ ] Implement Preset 3: Nested Microtasks
- [ ] Implement Preset 4: async/await Multiple Awaits
- [ ] Verify expected log output for each preset
- [ ] Add comprehensive JSDoc comments
- [ ] Create preset index with all exports
- [ ] Write tests for each preset

## Files to Create

### `src/core/scenarios/presets/sync-vs-settimeout.ts`
**Purpose:** Preset demonstrating setTimeout is always asynchronous
**Exports:** `syncVsSettimeout`

### `src/core/scenarios/presets/promise-vs-settimeout.ts`
**Purpose:** Preset demonstrating microtask priority over macrotasks
**Exports:** `promiseVsSettimeout`

### `src/core/scenarios/presets/nested-microtasks.ts`
**Purpose:** Preset demonstrating microtask queue draining
**Exports:** `nestedMicrotasks`

### `src/core/scenarios/presets/async-await-multi.ts`
**Purpose:** Preset demonstrating async/await continuation as microtasks
**Exports:** `asyncAwaitMulti`

### `src/core/scenarios/presets/index.ts`
**Purpose:** Barrel export for all presets
**Exports:** All preset objects, `ALL_PRESETS` array

## Preset Implementations

### Preset 1: Sync vs setTimeout(0)

```typescript
import { Scenario, TaskType, TaskEffect } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 1: Synchronous vs setTimeout(0)
 * 
 * Demonstrates that even setTimeout with zero delay doesn't execute immediately -
 * it's scheduled as a macrotask after the current synchronous code completes.
 * 
 * Expected output:
 * 1. Start
 * 2. End
 * 3. Timeout
 * 
 * Learning objective: Understand that setTimeout is always asynchronous, even with delay 0.
 */
export const syncVsSettimeout: Scenario = {
  id: 'sync-vs-settimeout',
  name: 'Synchronous vs setTimeout(0)',
  description: 'Demonstrates that even setTimeout with zero delay doesn\'t execute immediately - it\'s scheduled as a macrotask after the current synchronous code completes.',
  learningObjective: 'Understand that setTimeout is always asynchronous, even with delay 0.',
  tags: ['basics', 'macrotask', 'timer', 'synchronous'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.SYNC,
      label: 'console.log("Start")',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Start' },
      ],
    },
    {
      type: TaskType.TIMER,
      label: 'setTimeout(callback, 0)',
      delay: 0,
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Timeout' },
      ],
    },
    {
      type: TaskType.SYNC,
      label: 'console.log("End")',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'End' },
      ],
    },
  ],
  expectedOutcome: 'Logs appear in order: Start, End, Timeout',
};
```

### Preset 2: Promise.then vs setTimeout(0)

```typescript
import { Scenario, TaskType } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 2: Promise.then vs setTimeout(0)
 * 
 * Shows that microtasks (Promise.then) execute before macrotasks (setTimeout),
 * even when both are scheduled at the same time.
 * 
 * Expected output:
 * 1. Sync
 * 2. Promise
 * 3. Timeout
 * 
 * Learning objective: Microtasks have higher priority than macrotasks.
 */
export const promiseVsSettimeout: Scenario = {
  id: 'promise-vs-settimeout',
  name: 'Promise.then vs setTimeout(0)',
  description: 'Shows that microtasks (Promise.then) execute before macrotasks (setTimeout), even when both are scheduled at the same time.',
  learningObjective: 'Microtasks have higher priority than macrotasks.',
  tags: ['basics', 'microtask', 'macrotask', 'promise', 'timer', 'priority'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.TIMER,
      label: 'setTimeout(() => console.log("Timeout"), 0)',
      delay: 0,
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Timeout' },
      ],
    },
    {
      type: TaskType.MICROTASK,
      label: 'Promise.resolve().then(() => console.log("Promise"))',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Promise' },
      ],
    },
    {
      type: TaskType.SYNC,
      label: 'console.log("Sync")',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Sync' },
      ],
    },
  ],
  expectedOutcome: 'Logs appear in order: Sync, Promise, Timeout (microtask executes before macrotask)',
};
```

### Preset 3: Nested Microtasks

```typescript
import { Scenario, TaskType } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 3: Nested Microtasks (Chain)
 * 
 * Demonstrates microtask draining: microtasks that enqueue more microtasks
 * continue draining before any macrotask runs.
 * 
 * Expected output:
 * 1. Micro 1
 * 2. Micro 2
 * 3. Timeout
 * 
 * Learning objective: Microtask queue is fully drained (including newly enqueued
 * microtasks) before proceeding to macrotasks.
 */
export const nestedMicrotasks: Scenario = {
  id: 'nested-microtasks',
  name: 'Nested Microtasks (Chain)',
  description: 'Demonstrates microtask draining: microtasks that enqueue more microtasks continue draining before any macrotask runs.',
  learningObjective: 'Microtask queue is fully drained (including newly enqueued microtasks) before proceeding to macrotasks.',
  tags: ['microtask', 'draining', 'promise', 'nesting'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.MICROTASK,
      label: 'Promise.resolve().then(() => { console.log("Micro 1"); enqueue Micro 2 })',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Micro 1' },
        // This task will enqueue the next microtask when it executes
        {
          type: 'enqueue-task',
          payload: {
            type: TaskType.MICROTASK,
            label: 'Promise.resolve().then(() => console.log("Micro 2"))',
            durationSteps: 1,
            effects: [
              { type: 'log', payload: 'Micro 2' },
            ],
          },
        },
      ],
    },
    {
      type: TaskType.TIMER,
      label: 'setTimeout(() => console.log("Timeout"), 0)',
      delay: 0,
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Timeout' },
      ],
    },
  ],
  expectedOutcome: 'Logs appear in order: Micro 1, Micro 2, Timeout (both microtasks execute before macrotask)',
};
```

### Preset 4: async/await Multiple Awaits

```typescript
import { Scenario, TaskType } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 4: async/await with Multiple Awaits
 * 
 * Shows that each `await` creates a microtask for the continuation,
 * demonstrating how async functions break into multiple microtasks.
 * 
 * Expected output:
 * 1. Start
 * 2. Sync end
 * 3. After first await
 * 4. After second await
 * 
 * Learning objective: Understand that await yields control and the continuation
 * is scheduled as a microtask. Each await creates a separate microtask.
 */
export const asyncAwaitMulti: Scenario = {
  id: 'async-await-multi',
  name: 'async/await with Multiple Awaits',
  description: 'Shows that each `await` creates a microtask for the continuation, demonstrating how async functions break into multiple microtasks.',
  learningObjective: 'Understand that await yields control and the continuation is scheduled as a microtask.',
  tags: ['async', 'await', 'microtask', 'promise', 'continuation'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.SYNC,
      label: 'async function foo() { console.log("Start"); }',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Start' },
        // First await: yield and schedule continuation
        {
          type: 'enqueue-task',
          payload: {
            type: TaskType.ASYNC_CONTINUATION,
            label: 'continuation after first await',
            durationSteps: 1,
            effects: [
              { type: 'log', payload: 'After first await' },
              // Second await: yield and schedule next continuation
              {
                type: 'enqueue-task',
                payload: {
                  type: TaskType.ASYNC_CONTINUATION,
                  label: 'continuation after second await',
                  durationSteps: 1,
                  effects: [
                    { type: 'log', payload: 'After second await' },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    {
      type: TaskType.SYNC,
      label: 'console.log("Sync end")',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Sync end' },
      ],
    },
  ],
  expectedOutcome: 'Logs appear in order: Start, Sync end, After first await, After second await',
};
```

## Preset Index

```typescript
/**
 * src/core/scenarios/presets/index.ts
 * 
 * Central export for all preset scenarios.
 */

import { syncVsSettimeout } from './sync-vs-settimeout';
import { promiseVsSettimeout } from './promise-vs-settimeout';
import { nestedMicrotasks } from './nested-microtasks';
import { asyncAwaitMulti } from './async-await-multi';
import { Scenario } from '@/core/types';

/**
 * All preset scenarios in recommended learning order.
 */
export const PRESETS_1_4: Scenario[] = [
  syncVsSettimeout,
  promiseVsSettimeout,
  nestedMicrotasks,
  asyncAwaitMulti,
];

/**
 * Preset lookup by ID.
 */
export const PRESET_MAP_1_4 = new Map<string, Scenario>(
  PRESETS_1_4.map(preset => [preset.id, preset])
);

/**
 * Get preset by ID.
 */
export function getPreset(id: string): Scenario | undefined {
  return PRESET_MAP_1_4.get(id);
}

// Named exports
export {
  syncVsSettimeout,
  promiseVsSettimeout,
  nestedMicrotasks,
  asyncAwaitMulti,
};
```

## Success Criteria

- [ ] All 4 presets export valid Scenario objects
- [ ] Each preset passes schema validation
- [ ] Expected log output documented
- [ ] Learning objectives clear
- [ ] Tags appropriate
- [ ] JSDoc comments complete
- [ ] Can load each preset in simulator
- [ ] Produces expected output when run
- [ ] Index exports all presets
- [ ] Tests verify correctness

## Test Specifications

### Test: Preset passes validation

```typescript
import { validateScenario } from '@/core/scenarios/validator';
import { syncVsSettimeout } from './sync-vs-settimeout';

describe('Preset 1: Sync vs setTimeout', () => {
  test('passes validation', () => {
    const result = validateScenario(syncVsSettimeout);
    expect(result.ok).toBe(true);
  });

  test('has required metadata', () => {
    expect(syncVsSettimeout.id).toBe('sync-vs-settimeout');
    expect(syncVsSettimeout.name).toBeTruthy();
    expect(syncVsSettimeout.description).toBeTruthy();
    expect(syncVsSettimeout.learningObjective).toBeTruthy();
    expect(syncVsSettimeout.tasks.length).toBeGreaterThan(0);
  });

  test('produces expected output', async () => {
    // Load scenario into simulator
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, syncVsSettimeout);
    
    // Run to completion
    const finalState = runToCompletion(loadedState);
    
    // Extract log messages
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    // Verify expected order
    expect(logs).toEqual(['Start', 'End', 'Timeout']);
  });
});
```

### Test: All presets available

```typescript
import { PRESETS_1_4, getPreset } from './index';

describe('Preset Index', () => {
  test('exports all 4 presets', () => {
    expect(PRESETS_1_4).toHaveLength(4);
  });

  test('getPreset returns correct preset', () => {
    const preset = getPreset('sync-vs-settimeout');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('sync-vs-settimeout');
  });

  test('getPreset returns undefined for unknown id', () => {
    const preset = getPreset('nonexistent');
    expect(preset).toBeUndefined();
  });

  test('all presets have unique ids', () => {
    const ids = PRESETS_1_4.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
```

### Test: Preset 2 ordering

```typescript
describe('Preset 2: Promise vs setTimeout', () => {
  test('microtask executes before macrotask', async () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, promiseVsSettimeout);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    expect(logs).toEqual(['Sync', 'Promise', 'Timeout']);
    
    // Verify Promise logged before Timeout
    const promiseIndex = logs.indexOf('Promise');
    const timeoutIndex = logs.indexOf('Timeout');
    expect(promiseIndex).toBeLessThan(timeoutIndex);
  });
});
```

### Test: Preset 3 draining

```typescript
describe('Preset 3: Nested Microtasks', () => {
  test('microtask chain completes before macrotask', async () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, nestedMicrotasks);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    expect(logs).toEqual(['Micro 1', 'Micro 2', 'Timeout']);
    
    // Both microtasks before timeout
    const micro2Index = logs.indexOf('Micro 2');
    const timeoutIndex = logs.indexOf('Timeout');
    expect(micro2Index).toBeLessThan(timeoutIndex);
  });
});
```

### Test: Preset 4 async/await

```typescript
describe('Preset 4: async/await Multiple Awaits', () => {
  test('each await creates microtask', async () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, asyncAwaitMulti);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    expect(logs).toEqual([
      'Start',
      'Sync end',
      'After first await',
      'After second await'
    ]);
  });
});
```

## Integration Points

- **Session 6.1**: Presets must pass validation
- **Session 6.4**: Index will include presets 5-8
- **Phase 1**: Uses task types from core simulator
- **Phase 2**: Loaded via LOAD_SCENARIO action
- **Phase 8**: Explanation panel references learning objectives

## References

- [Preset Scenarios Specification](../../reference/preset-scenarios.md)
- [Event Loop Rules](../../reference/event-loop-rules.md)
- [Task Types](../phase-01-core-simulator/session-1.1-types.md)
- [Validation](./session-6.1-schema-validation.md)

## Notes

- Presets should be frozen in production to prevent modification
- Learning objectives should be concise and specific
- Tags help with filtering/searching presets
- Consider adding difficulty level metadata
- Expected outcome should be human-readable
- Effects with `enqueue-task` payload simulate dynamic task creation
- Each preset should run in under 20 simulation steps for quick demos
