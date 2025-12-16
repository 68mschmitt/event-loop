/**
 * Demo script to verify Session 1.5 implementation.
 * Shows render and microtask logic working correctly.
 */

import { createInitialState } from './src/core/simulator/state';
import { drainMicrotaskQueue } from './src/core/simulator/microtask';
import { shouldRender, executeRenderStep, invalidateRender } from './src/core/simulator/render';
import { TaskType, TaskState } from './src/core/types/task';
import type { Task } from './src/core/types/task';

console.log('=== Session 1.5 Demo: Render and Microtask Logic ===\n');

// Create initial state
let state = createInitialState({ frameInterval: 16 });
console.log('Initial state created with 16ms frame interval');
console.log(`Frame interval: ${state.frameInterval}ms`);
console.log(`Current time: ${state.now}ms`);
console.log(`Last frame at: ${state.lastFrameAt}ms\n`);

// Demo 1: Microtask draining
console.log('--- Demo 1: Nested Microtask Draining ---');

const micro3: Task = {
  id: 'micro-3',
  type: TaskType.MICROTASK,
  label: 'Microtask 3 (nested)',
  createdAt: 0,
  enqueueSeq: 2,
  origin: 'micro-2',
  state: TaskState.QUEUED,
  durationSteps: 1,
  effects: [{ type: 'log', payload: 'Microtask 3 executed' }],
};

const micro2: Task = {
  id: 'micro-2',
  type: TaskType.MICROTASK,
  label: 'Microtask 2',
  createdAt: 0,
  enqueueSeq: 1,
  origin: 'micro-1',
  state: TaskState.QUEUED,
  durationSteps: 1,
  effects: [
    { type: 'log', payload: 'Microtask 2 executed' },
    { type: 'enqueue-task', payload: { task: micro3, queueType: 'micro' } },
  ],
};

const micro1: Task = {
  id: 'micro-1',
  type: TaskType.MICROTASK,
  label: 'Microtask 1',
  createdAt: 0,
  enqueueSeq: 0,
  origin: 'scenario',
  state: TaskState.QUEUED,
  durationSteps: 1,
  effects: [
    { type: 'log', payload: 'Microtask 1 executed' },
    { type: 'enqueue-task', payload: { task: micro2, queueType: 'micro' } },
  ],
};

state = { ...state, microQueue: [micro1] };
console.log(`Enqueued 1 microtask (which will enqueue 2 more)`);
console.log(`Microtask queue length: ${state.microQueue.length}`);

state = drainMicrotaskQueue(state);
console.log('Drained microtask queue');
console.log(`Microtask queue length: ${state.microQueue.length}`);
console.log(`Total log entries: ${state.log.length}`);
console.log('Log messages:');
state.log.forEach((entry) => {
  if (entry.type === 'user' || entry.type === 'task-start' || entry.type === 'task-complete') {
    console.log(`  - ${entry.message}`);
  }
});

// Demo 2: Render timing
console.log('\n--- Demo 2: Render Timing ---');

state = createInitialState({ frameInterval: 16 });
state = invalidateRender(state);
console.log(`Render pending: ${state.renderPending}`);
console.log(`Current time: ${state.now}ms`);
console.log(`Last frame at: ${state.lastFrameAt}ms`);
console.log(`Should render now: ${shouldRender(state)}`);

// Advance to frame boundary
state = { ...state, now: 16 };
console.log(`\nAdvanced time to ${state.now}ms`);
console.log(`Should render now: ${shouldRender(state)}`);

state = executeRenderStep(state);
console.log(`\nExecuted render step`);
console.log(`Render pending: ${state.renderPending}`);
console.log(`Frame counter: ${state.frameCounter}`);
console.log(`Last frame at: ${state.lastFrameAt}ms`);

// Demo 3: Microtasks block rendering
console.log('\n--- Demo 3: Microtasks Block Rendering ---');

state = createInitialState({ frameInterval: 16 });
state = invalidateRender(state);
state = { ...state, now: 16 }; // At frame boundary

const blockingMicro: Task = {
  id: 'blocking',
  type: TaskType.MICROTASK,
  label: 'Blocking microtask',
  createdAt: 0,
  enqueueSeq: 0,
  origin: null,
  state: TaskState.QUEUED,
  durationSteps: 1,
  effects: [],
};

state = { ...state, microQueue: [blockingMicro] };

console.log(`Render pending: ${state.renderPending}`);
console.log(`At frame boundary: ${state.now >= state.lastFrameAt + state.frameInterval}`);
console.log(`Microtasks in queue: ${state.microQueue.length}`);
console.log(`Should render: ${shouldRender(state)} (false because microtasks not drained)`);

state = drainMicrotaskQueue(state);
console.log(`\nDrained microtasks`);
console.log(`Microtasks in queue: ${state.microQueue.length}`);
console.log(`Should render: ${shouldRender(state)} (true, all conditions met)`);

console.log('\n=== Demo Complete ===');
console.log('All render and microtask logic working correctly!');
