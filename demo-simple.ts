/**
 * Simple Demo: Basic Event Loop Test
 */

import { createInitialState } from './src/core/simulator/state.js';
import { tick } from './src/core/simulator/tick.js';
import { enqueueMicrotask, enqueueTimerTask } from './src/core/simulator/enqueue.js';
import { TaskType, TaskState, type Task, type MicrotaskTask, type TimerTask } from './src/core/types/task.js';

console.log('Simple Event Loop Test\n');

// Initialize
let state = createInitialState();
console.log('Initial state created');

// Create a microtask
const microTask: MicrotaskTask = {
  type: TaskType.MICROTASK,
  id: 'micro-1',
  label: 'Promise.then',
  createdAt: 0,
  enqueueSeq: 0,
  origin: 'test',
  state: TaskState.CREATED,
  durationSteps: 1,
  effects: [{ type: 'log', payload: 'Microtask executed!' }]
};

// Create a timer
const timerTask: TimerTask = {
  type: TaskType.TIMER,
  id: 'timer-1',
  label: 'setTimeout 50ms',
  createdAt: 0,
  enqueueSeq: 0,
  origin: 'test',
  state: TaskState.CREATED,
  durationSteps: 1,
  delay: 50,
  effects: [{ type: 'log', payload: 'Timer executed!' }]
};

// Enqueue microtask
console.log('\n1. Enqueuing microtask...');
state = enqueueMicrotask(state, microTask);
console.log(`   Microtask queue size: ${state.microQueue.length}`);

// Enqueue timer
console.log('\n2. Enqueuing timer (50ms delay)...');
state = enqueueTimerTask(state, timerTask, 50);
console.log(`   Web API operations: ${state.webApis.size}`);

// Tick 1: Should execute microtask
console.log('\n3. Tick 1: Execute microtask');
state = tick(state);
console.log(`   Call stack size: ${state.callStack.length}`);
console.log(`   Current time: ${state.now}ms`);

// Tick 2: Complete microtask
console.log('\n4. Tick 2: Complete microtask');
state = tick(state);
console.log(`   Microtask queue size: ${state.microQueue.length}`);

// Tick 3: Advance time to timer
console.log('\n5. Tick 3: Advance time to 50ms');
state = tick(state);
console.log(`   Current time: ${state.now}ms`);
console.log(`   Macro queue size: ${state.macroQueue.length}`);

// Tick 4: Execute timer
console.log('\n6. Tick 4: Execute timer');
state = tick(state);
console.log(`   Call stack size: ${state.callStack.length}`);

// Tick 5: Complete timer
console.log('\n7. Tick 5: Complete timer');
state = tick(state);
console.log(`   Macro queue size: ${state.macroQueue.length}`);

console.log('\n✅ Demo complete!');
console.log(`\nFinal state:`);
console.log(`  - Time: ${state.now}ms`);
console.log(`  - Steps: ${state.stepIndex}`);
console.log(`  - Log entries: ${state.log.length}`);

console.log('\nLog:');
state.log.forEach((entry, i) => {
  console.log(`  ${i + 1}. [${entry.timestamp}ms] ${entry.type}: ${entry.message}`);
});
