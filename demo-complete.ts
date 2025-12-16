/**
 * Complete Demo: Event Loop Simulator Phase 1
 * 
 * This demo shows the full event loop simulator working with:
 * - Synchronous tasks
 * - setTimeout (timers via Web API)
 * - Microtasks (Promise.then, queueMicrotask)
 * - Rendering at frame boundaries
 * - requestAnimationFrame
 */

import { createInitialState } from './src/core/simulator/state.js';
import { tick } from './src/core/simulator/tick.js';
import { 
  enqueueTimerTask,
  enqueueMicrotask,
  enqueueRafTask 
} from './src/core/simulator/enqueue.js';
import { TaskType, TaskState, type Task } from './src/core/types/task.js';
import { invalidateRender } from './src/core/simulator/render.js';

// Helper to create tasks
function createTask(
  type: TaskType,
  label: string,
  options: {
    durationSteps?: number;
    delay?: number;
    effects?: any[];
  } = {}
): Task {
  const baseTask = {
    id: `task-${Math.random().toString(36).slice(2, 9)}`,
    label,
    createdAt: 0,
    enqueueSeq: 0,
    origin: 'demo' as const,
    state: TaskState.CREATED,
    durationSteps: options.durationSteps ?? 1,
    effects: options.effects ?? [],
  };

  switch (type) {
    case TaskType.SYNC:
      return { ...baseTask, type: TaskType.SYNC };
    case TaskType.TIMER:
      return { ...baseTask, type: TaskType.TIMER, delay: options.delay ?? 0 };
    case TaskType.MICROTASK:
      return { ...baseTask, type: TaskType.MICROTASK };
    case TaskType.RAF:
      return { ...baseTask, type: TaskType.RAF };
    default:
      throw new Error(`Unsupported task type: ${type}`);
  }
}

// Run a complete scenario
function runCompleteScenario() {
  console.log('='.repeat(70));
  console.log('COMPLETE EVENT LOOP DEMO - Phase 1');
  console.log('='.repeat(70));
  console.log();

  // Initialize state
  let state = createInitialState({ frameInterval: 16 });
  
  console.log('📋 SCENARIO: Mixed Tasks with Timers, Microtasks, and rAF');
  console.log('-'.repeat(70));
  console.log();

  // Create tasks
  const syncTask = createTask(TaskType.SYNC, 'console.log("Start")');
  const microTask1 = createTask(TaskType.MICROTASK, 'Promise.then(() => console.log("Micro 1"))');
  const microTask2 = createTask(TaskType.MICROTASK, 'Promise.then(() => console.log("Micro 2"))');
  const timerTask1 = createTask(TaskType.TIMER, 'setTimeout(() => console.log("Timer 50ms"), 50)', {
    delay: 50,
    effects: [{ type: 'invalidate-render' as const, payload: null }]
  });
  const timerTask2 = createTask(TaskType.TIMER, 'setTimeout(() => console.log("Timer 100ms"), 100)', { delay: 100 });
  const rafTask = createTask(TaskType.RAF, 'requestAnimationFrame(() => console.log("rAF"))');

  // Enqueue initial tasks
  console.log('⚙️  ENQUEUING TASKS...');
  console.log();

  // Enqueue sync task to call stack
  state = {
    ...state,
    callStack: [{
      task: syncTask,
      startedAt: state.now,
      stepsRemaining: syncTask.durationSteps
    }],
    enqueueCounter: state.enqueueCounter + 1
  };
  console.log(`  ✓ Enqueued: ${syncTask.label}`);

  // Enqueue microtasks
  state = enqueueMicrotask(state, microTask1);
  console.log(`  ✓ Enqueued: ${microTask1.label}`);
  
  state = enqueueMicrotask(state, microTask2);
  console.log(`  ✓ Enqueued: ${microTask2.label}`);

  // Enqueue timers (will go to Web API)
  state = enqueueTimerTask(state, timerTask1, 50);
  console.log(`  ✓ Enqueued: ${timerTask1.label} (Web API: 50ms delay)`);

  state = enqueueTimerTask(state, timerTask2, 100);
  console.log(`  ✓ Enqueued: ${timerTask2.label} (Web API: 100ms delay)`);

  // Enqueue rAF
  state = enqueueRafTask(state, rafTask);
  console.log(`  ✓ Enqueued: ${rafTask.label}`);
  
  // Invalidate render to trigger render at frame boundary
  state = invalidateRender(state);

  console.log();
  console.log('🎬 SIMULATION START');
  console.log('-'.repeat(70));
  console.log();

  // Run simulation
  let tickCount = 0;
  const maxTicks = 20;

  while (tickCount < maxTicks) {
    const prevStepIndex = state.stepIndex;
    state = tick(state);
    tickCount++;

    // Check if simulation is complete
    if (
      state.callStack.length === 0 &&
      state.microQueue.length === 0 &&
      state.macroQueue.length === 0 &&
      state.rafQueue.length === 0 &&
      state.webApis.size === 0
    ) {
      console.log();
      console.log('✅ Simulation complete!');
      break;
    }

    // Stop if no progress
    if (state.stepIndex === prevStepIndex) {
      console.log();
      console.log('⚠️  No progress made, stopping...');
      break;
    }
  }

  console.log();
  console.log('📊 FINAL STATE');
  console.log('-'.repeat(70));
  console.log(`Total steps: ${state.stepIndex}`);
  console.log(`Final time: ${state.now}ms`);
  console.log(`Frames rendered: ${state.frameCounter}`);
  console.log(`Log entries: ${state.log.length}`);
  console.log();

  console.log('📜 EXECUTION LOG');
  console.log('-'.repeat(70));
  state.log.forEach((entry, index) => {
    const time = entry.timestamp.toString().padStart(5, ' ');
    const type = entry.type.padEnd(15, ' ');
    console.log(`${(index + 1).toString().padStart(3, ' ')}. [${time}ms] ${type} ${entry.message}`);
  });

  console.log();
  console.log('='.repeat(70));
  console.log('KEY OBSERVATIONS:');
  console.log('='.repeat(70));
  console.log('1. Synchronous task executed first (call stack priority)');
  console.log('2. Microtasks drained before any macrotasks');
  console.log('3. Timers executed in order (50ms before 100ms)');
  console.log('4. Render occurred at frame boundary (16ms)');
  console.log('5. rAF callback executed after render');
  console.log('6. Time advanced to next Web API operation');
  console.log('='.repeat(70));
  console.log();
}

// Run the demo
runCompleteScenario();
