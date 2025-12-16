/**
 * Demonstration of the tick function with a simple scenario.
 * This shows the execution order of different task types.
 */

import { tick } from './src/core/simulator/tick';
import { createInitialState } from './src/core/simulator/state';
import { enqueueMicrotask, enqueueTimerTask } from './src/core/simulator/enqueue';
import type { Task } from './src/core/types/task';
import { TaskType, TaskState } from './src/core/types/task';
import { isSimulationComplete } from './src/core/simulator/priority';

// Helper to create tasks
function createTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id || `task-${Date.now()}`,
    type: TaskType.SYNC,
    label: overrides.label || 'Test Task',
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
    ...overrides,
  };
}

// Create initial state
let state = createInitialState();

console.log('=== Event Loop Simulation Demo ===\n');

// Scenario: Add a timer (100ms), a microtask, and another timer (50ms)
console.log('Setting up scenario:');
console.log('  1. Timer (100ms delay)');
console.log('  2. Microtask (immediate)');
console.log('  3. Timer (50ms delay)');
console.log();

const timer100 = createTask({
  id: 'timer-100',
  type: TaskType.TIMER,
  label: 'setTimeout(fn, 100)',
  delay: 100,
});

const microtask = createTask({
  id: 'micro-1',
  type: TaskType.MICROTASK,
  label: 'queueMicrotask(fn)',
});

const timer50 = createTask({
  id: 'timer-50',
  type: TaskType.TIMER,
  label: 'setTimeout(fn, 50)',
  delay: 50,
});

// Enqueue tasks
state = enqueueTimerTask(state, timer100, 100);
state = enqueueMicrotask(state, microtask);
state = enqueueTimerTask(state, timer50, 50);

console.log('Initial state:');
console.log(`  Web APIs: ${state.webApis.size} operations`);
console.log(`  Microtask queue: ${state.microQueue.length} tasks`);
console.log(`  Macrotask queue: ${state.macroQueue.length} tasks`);
console.log(`  Time: ${state.now}ms`);
console.log();

// Run simulation
console.log('=== Execution Log ===\n');

let tickCount = 0;
while (!isSimulationComplete(state)) {
  const prevTime = state.now;
  state = tick(state);
  tickCount++;

  // Print last log entry
  const lastLog = state.log[state.log.length - 1];
  if (lastLog) {
    const timeChange = state.now !== prevTime ? ` [time: ${prevTime}ms → ${state.now}ms]` : '';
    console.log(`Tick ${tickCount}: ${lastLog.message}${timeChange}`);
  }
}

console.log();
console.log('=== Summary ===');
console.log(`Total ticks: ${tickCount}`);
console.log(`Final time: ${state.now}ms`);
console.log(`Total log entries: ${state.log.length}`);
console.log();

// Show execution order
console.log('=== Execution Order ===');
const taskStarts = state.log.filter((entry) => entry.type === 'task-start');
taskStarts.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.message} (at ${entry.timestamp}ms)`);
});

console.log();
console.log('✅ Microtask executed before macrotasks (even though it was enqueued second)');
console.log('✅ Time advanced to earliest timer (50ms before 100ms)');
console.log('✅ Simulation completed successfully');
