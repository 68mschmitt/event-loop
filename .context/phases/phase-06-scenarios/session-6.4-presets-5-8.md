# Session 6.4: Preset Scenarios 5-8

## Overview

This session implements the remaining four preset scenarios that demonstrate advanced event loop concepts. These presets build on the fundamentals from Presets 1-4 and show complex interactions between different task types.

## Prerequisites

- Session 6.3 complete (presets 1-4 implemented)
- Session 6.1 complete (validation available)
- Understanding of fetch, DOM events, rAF, and starvation
- Familiarity with advanced preset specifications

## Goals

- [ ] Implement Preset 5: fetch + timers + microtasks
- [ ] Implement Preset 6: DOM Event + microtasks + timers
- [ ] Implement Preset 7: rAF + microtasks + timers
- [ ] Implement Preset 8: Microtask Starvation
- [ ] Verify expected behavior for each preset
- [ ] Update preset index to include all 8 presets
- [ ] Add comprehensive tests
- [ ] Document timing considerations

## Files to Create

### `src/core/scenarios/presets/fetch-complex.ts`
**Purpose:** Preset demonstrating fetch with multiple async sources
**Exports:** `fetchComplex`

### `src/core/scenarios/presets/dom-event-handlers.ts`
**Purpose:** Preset demonstrating DOM event handler scheduling
**Exports:** `domEventHandlers`

### `src/core/scenarios/presets/raf-timing.ts`
**Purpose:** Preset demonstrating requestAnimationFrame timing
**Exports:** `rafTiming`

### `src/core/scenarios/presets/microtask-starvation.ts`
**Purpose:** Preset demonstrating render delay from microtask chain
**Exports:** `microtaskStarvation`

### Update `src/core/scenarios/presets/index.ts`
**Purpose:** Include all 8 presets in exports

## Preset Implementations

### Preset 5: fetch + timers + microtasks

```typescript
import { Scenario, TaskType } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 5: fetch with Timers and Microtasks
 * 
 * Complex scenario mixing network request, timers, and microtasks to demonstrate
 * realistic ordering based on timing and priority.
 * 
 * Expected output (with fetch latency 50ms, timer 10ms):
 * 1. Sync
 * 2. Micro
 * 3. Timer (ready at 10ms)
 * 4. Fetch (ready at 50ms)
 * 
 * Learning objective: Understand how different async sources interact and their
 * relative priorities. Microtasks always execute first, then macrotasks in order
 * they become ready.
 */
export const fetchComplex: Scenario = {
  id: 'fetch-complex',
  name: 'fetch with Timers and Microtasks',
  description: 'Complex scenario mixing network request, timers, and microtasks to demonstrate realistic ordering.',
  learningObjective: 'Understand how different async sources interact and their relative priorities.',
  tags: ['fetch', 'timer', 'microtask', 'network', 'priority', 'complex'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.FETCH,
      label: 'fetch("/api").then(() => console.log("Fetch"))',
      url: '/api',
      latency: 50,
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Fetch' },
      ],
    },
    {
      type: TaskType.TIMER,
      label: 'setTimeout(() => console.log("Timer"), 10)',
      delay: 10,
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Timer' },
      ],
    },
    {
      type: TaskType.MICROTASK,
      label: 'Promise.resolve().then(() => console.log("Micro"))',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Micro' },
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
  expectedOutcome: 'Logs appear in order: Sync, Micro, Timer (at 10ms), Fetch (at 50ms)',
};
```

### Preset 6: DOM Event + microtasks + timers

```typescript
import { Scenario, TaskType } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 6: DOM Event Handler Scheduling
 * 
 * Shows how DOM event handlers are scheduled as macrotasks and can themselves
 * enqueue microtasks and timers. Demonstrates that event handlers follow the
 * same rules: run as macrotask, then drain microtasks.
 * 
 * Expected output:
 * 1. Existing micro
 * 2. Click handler
 * 3. Micro in handler
 * 4. Timer in handler
 * 
 * Learning objective: Event handlers execute as macrotasks, and microtasks
 * enqueued during handler execute before the next macrotask.
 */
export const domEventHandlers: Scenario = {
  id: 'dom-event-handlers',
  name: 'DOM Event Handler Scheduling',
  description: 'Shows how DOM event handlers are scheduled as macrotasks and can themselves enqueue microtasks and timers.',
  learningObjective: 'Event handlers execute as macrotasks, and microtasks enqueued during handler execute before next macrotask.',
  tags: ['dom', 'event', 'macrotask', 'microtask', 'timer', 'handler'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.MICROTASK,
      label: 'Promise.resolve().then(() => console.log("Existing micro"))',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Existing micro' },
      ],
    },
    {
      type: TaskType.DOM_EVENT,
      label: 'button click handler',
      eventType: 'click',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Click handler' },
        // Handler enqueues microtask
        {
          type: 'enqueue-task',
          payload: {
            type: TaskType.MICROTASK,
            label: 'Promise in handler',
            durationSteps: 1,
            effects: [
              { type: 'log', payload: 'Micro in handler' },
            ],
          },
        },
        // Handler enqueues timer
        {
          type: 'enqueue-task',
          payload: {
            type: TaskType.TIMER,
            label: 'setTimeout in handler',
            delay: 0,
            durationSteps: 1,
            effects: [
              { type: 'log', payload: 'Timer in handler' },
            ],
          },
        },
      ],
    },
  ],
  expectedOutcome: 'Existing micro, Click handler, Micro in handler, Timer in handler',
};
```

### Preset 7: rAF + microtasks + timers

```typescript
import { Scenario, TaskType } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 7: requestAnimationFrame Timing
 * 
 * Demonstrates when rAF callbacks run relative to microtasks, macrotasks, and
 * rendering. rAF callbacks run in the frame phase, before paint, after microtasks
 * drain.
 * 
 * Expected output (at frame boundary ~16ms):
 * 1. Micro
 * 2. Timer (ready immediately)
 * 3. [Frame boundary]
 * 4. rAF
 * 5. [Render]
 * 
 * Learning objective: rAF callbacks run during the frame phase, after task queue
 * processes but before render.
 */
export const rafTiming: Scenario = {
  id: 'raf-timing',
  name: 'requestAnimationFrame Timing',
  description: 'Demonstrates when rAF callbacks run relative to microtasks, macrotasks, and rendering.',
  learningObjective: 'rAF callbacks run during frame phase, after task queue processes but before render.',
  tags: ['raf', 'animation', 'frame', 'render', 'timing'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.RAF,
      label: 'requestAnimationFrame(() => console.log("rAF"))',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'rAF' },
      ],
    },
    {
      type: TaskType.TIMER,
      label: 'setTimeout(() => console.log("Timer"), 0)',
      delay: 0,
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Timer' },
      ],
    },
    {
      type: TaskType.MICROTASK,
      label: 'Promise.resolve().then(() => console.log("Micro"))',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Micro' },
      ],
    },
    {
      type: TaskType.SYNC,
      label: 'Invalidate render',
      durationSteps: 1,
      effects: [
        { type: 'invalidate-render', payload: null },
      ],
    },
  ],
  expectedOutcome: 'Micro, Timer, [frame boundary], rAF, [render]',
};
```

### Preset 8: Microtask Starvation

```typescript
import { Scenario, TaskType } from '@/core/types';
import { SCENARIO_SCHEMA_VERSION } from '../schema';

/**
 * Preset 8: Microtask Starvation (Render Delay)
 * 
 * Demonstrates how an infinite or long microtask chain can delay rendering
 * because microtasks are drained before rendering can occur. This is a common
 * cause of UI freezes.
 * 
 * Expected output:
 * 1. Render invalidated
 * 2. Micro 1
 * 3. Micro 2
 * 4. Micro 3
 * 5. Micro 4
 * 6. Micro 5
 * 7. [Microtask queue finally empty]
 * 8. [Render occurs]
 * 
 * Learning objective: Excessive microtasks can starve rendering, causing UI freezes.
 * Render cannot occur while microtasks are executing.
 */
export const microtaskStarvation: Scenario = {
  id: 'microtask-starvation',
  name: 'Microtask Starvation (Render Delay)',
  description: 'Demonstrates how a long microtask chain can delay rendering because microtasks are drained before rendering can occur.',
  learningObjective: 'Excessive microtasks can starve rendering, causing UI freezes.',
  tags: ['microtask', 'starvation', 'render', 'performance', 'antipattern'],
  schemaVersion: SCENARIO_SCHEMA_VERSION,
  tasks: [
    {
      type: TaskType.SYNC,
      label: 'document.body.style.color = "red" (invalidate render)',
      durationSteps: 1,
      effects: [
        { type: 'invalidate-render', payload: null },
      ],
    },
    // Chain of 5 microtasks, each enqueuing the next
    {
      type: TaskType.MICROTASK,
      label: 'Microtask 1',
      durationSteps: 1,
      effects: [
        { type: 'log', payload: 'Micro 1' },
        {
          type: 'enqueue-task',
          payload: {
            type: TaskType.MICROTASK,
            label: 'Microtask 2',
            durationSteps: 1,
            effects: [
              { type: 'log', payload: 'Micro 2' },
              {
                type: 'enqueue-task',
                payload: {
                  type: TaskType.MICROTASK,
                  label: 'Microtask 3',
                  durationSteps: 1,
                  effects: [
                    { type: 'log', payload: 'Micro 3' },
                    {
                      type: 'enqueue-task',
                      payload: {
                        type: TaskType.MICROTASK,
                        label: 'Microtask 4',
                        durationSteps: 1,
                        effects: [
                          { type: 'log', payload: 'Micro 4' },
                          {
                            type: 'enqueue-task',
                            payload: {
                              type: TaskType.MICROTASK,
                              label: 'Microtask 5',
                              durationSteps: 1,
                              effects: [
                                { type: 'log', payload: 'Micro 5' },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  ],
  expectedOutcome: 'All 5 microtasks execute before render occurs, demonstrating starvation',
};
```

## Updated Preset Index

```typescript
/**
 * src/core/scenarios/presets/index.ts
 * 
 * Central export for all preset scenarios.
 */

// Presets 1-4
import { syncVsSettimeout } from './sync-vs-settimeout';
import { promiseVsSettimeout } from './promise-vs-settimeout';
import { nestedMicrotasks } from './nested-microtasks';
import { asyncAwaitMulti } from './async-await-multi';

// Presets 5-8
import { fetchComplex } from './fetch-complex';
import { domEventHandlers } from './dom-event-handlers';
import { rafTiming } from './raf-timing';
import { microtaskStarvation } from './microtask-starvation';

import { Scenario } from '@/core/types';

/**
 * All preset scenarios in recommended learning order.
 * 
 * Basics (1-4): Fundamental concepts
 * Advanced (5-8): Complex interactions
 */
export const ALL_PRESETS: Scenario[] = [
  syncVsSettimeout,
  promiseVsSettimeout,
  nestedMicrotasks,
  asyncAwaitMulti,
  fetchComplex,
  domEventHandlers,
  rafTiming,
  microtaskStarvation,
];

/**
 * Presets grouped by difficulty.
 */
export const PRESET_GROUPS = {
  basics: [syncVsSettimeout, promiseVsSettimeout, nestedMicrotasks, asyncAwaitMulti],
  advanced: [fetchComplex, domEventHandlers, rafTiming, microtaskStarvation],
};

/**
 * Preset lookup by ID.
 */
export const PRESET_MAP = new Map<string, Scenario>(
  ALL_PRESETS.map(preset => [preset.id, preset])
);

/**
 * Get preset by ID.
 */
export function getPreset(id: string): Scenario | undefined {
  return PRESET_MAP.get(id);
}

/**
 * Get presets by tag.
 */
export function getPresetsByTag(tag: string): Scenario[] {
  return ALL_PRESETS.filter(preset => preset.tags.includes(tag));
}

/**
 * Get all tags used by presets.
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  ALL_PRESETS.forEach(preset => {
    preset.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// Named exports
export {
  // Basics
  syncVsSettimeout,
  promiseVsSettimeout,
  nestedMicrotasks,
  asyncAwaitMulti,
  // Advanced
  fetchComplex,
  domEventHandlers,
  rafTiming,
  microtaskStarvation,
};
```

## Success Criteria

- [ ] All 8 presets export valid Scenario objects
- [ ] Each preset passes schema validation
- [ ] Expected behavior documented
- [ ] Learning objectives clear
- [ ] Timing considerations documented
- [ ] Index exports all presets with grouping
- [ ] Can filter by tags
- [ ] Tests verify correctness
- [ ] Render invalidation works in relevant presets
- [ ] Frame timing accurate in rAF preset

## Test Specifications

### Test: Preset 5 ordering based on timing

```typescript
describe('Preset 5: fetch Complex', () => {
  test('produces expected output based on timing', async () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, fetchComplex);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    // Microtask first (priority)
    expect(logs[0]).toBe('Sync');
    expect(logs[1]).toBe('Micro');
    
    // Timer at 10ms before fetch at 50ms
    expect(logs[2]).toBe('Timer');
    expect(logs[3]).toBe('Fetch');
  });
});
```

### Test: Preset 6 event handler behavior

```typescript
describe('Preset 6: DOM Event Handlers', () => {
  test('existing microtask runs before event handler', async () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, domEventHandlers);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    expect(logs).toEqual([
      'Existing micro',
      'Click handler',
      'Micro in handler',
      'Timer in handler',
    ]);
  });

  test('microtask from handler runs before timer from handler', () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, domEventHandlers);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    const microIndex = logs.indexOf('Micro in handler');
    const timerIndex = logs.indexOf('Timer in handler');
    expect(microIndex).toBeLessThan(timerIndex);
  });
});
```

### Test: Preset 7 rAF timing

```typescript
describe('Preset 7: rAF Timing', () => {
  test('rAF runs after microtasks and macrotasks', async () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, rafTiming);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    // rAF should be last
    expect(logs).toEqual(['Micro', 'Timer', 'rAF']);
  });

  test('render occurs after rAF', () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, rafTiming);
    const finalState = runToCompletion(loadedState);
    
    // Check that render log appears after rAF log
    const rafLog = finalState.log.find(e => e.message.includes('rAF'));
    const renderLog = finalState.log.find(e => e.type === 'render');
    
    expect(rafLog).toBeDefined();
    expect(renderLog).toBeDefined();
    
    if (rafLog && renderLog) {
      expect(renderLog.timestamp).toBeGreaterThan(rafLog.timestamp);
    }
  });
});
```

### Test: Preset 8 starvation

```typescript
describe('Preset 8: Microtask Starvation', () => {
  test('all microtasks execute before render', async () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, microtaskStarvation);
    const finalState = runToCompletion(loadedState);
    
    const logs = finalState.log
      .filter(entry => entry.type === 'user')
      .map(entry => entry.message);
    
    expect(logs).toEqual([
      'Micro 1',
      'Micro 2',
      'Micro 3',
      'Micro 4',
      'Micro 5',
    ]);
  });

  test('render delayed until microtask queue empty', () => {
    const initialState = createSimulatorState();
    const loadedState = loadScenario(initialState, microtaskStarvation);
    const finalState = runToCompletion(loadedState);
    
    // Find when last microtask completed
    const lastMicroLog = finalState.log
      .filter(e => e.message === 'Micro 5')
      .pop();
    
    // Find when render occurred
    const renderLog = finalState.log.find(e => e.type === 'render');
    
    expect(lastMicroLog).toBeDefined();
    expect(renderLog).toBeDefined();
    
    if (lastMicroLog && renderLog) {
      // Render should happen after last microtask
      expect(renderLog.timestamp).toBeGreaterThan(lastMicroLog.timestamp);
    }
  });
});
```

### Test: Preset grouping

```typescript
describe('Preset Index', () => {
  test('ALL_PRESETS contains all 8 presets', () => {
    expect(ALL_PRESETS).toHaveLength(8);
  });

  test('PRESET_GROUPS has correct structure', () => {
    expect(PRESET_GROUPS.basics).toHaveLength(4);
    expect(PRESET_GROUPS.advanced).toHaveLength(4);
  });

  test('getPresetsByTag filters correctly', () => {
    const microtaskPresets = getPresetsByTag('microtask');
    expect(microtaskPresets.length).toBeGreaterThan(0);
    
    microtaskPresets.forEach(preset => {
      expect(preset.tags).toContain('microtask');
    });
  });

  test('getAllTags returns unique sorted tags', () => {
    const tags = getAllTags();
    const uniqueTags = new Set(tags);
    
    expect(tags.length).toBe(uniqueTags.size); // No duplicates
    expect(tags).toEqual([...tags].sort()); // Sorted
  });
});
```

## Integration Points

- **Session 6.3**: Builds on presets 1-4 foundation
- **Session 6.1**: All presets must pass validation
- **Session 6.2**: Presets can be loaded into builder
- **Phase 1**: Uses render invalidation and frame timing
- **Phase 8**: Explanation panel shows warnings for starvation

## References

- [Preset Scenarios Specification](../../reference/preset-scenarios.md)
- [Event Loop Rules](../../reference/event-loop-rules.md)
- [Render Rules](../phase-01-core-simulator/session-1.5-render-logic.md)
- [Task Types](../phase-01-core-simulator/session-1.1-types.md)

## Notes

- Preset 5 timing depends on configured latencies - document this
- Preset 7 requires frame timing to be implemented (Phase 1, Session 1.5)
- Preset 8 demonstrates antipattern - explanation should warn users
- Consider adding preset difficulty metadata for UI filtering
- Frame interval (default 16ms) affects Preset 7 timing
- Starvation preset could be extended to 10+ microtasks for dramatic effect
- Consider adding preset recommendations (e.g., "Try this next")
- Tag filtering enables learning paths (e.g., all microtask-related presets)
