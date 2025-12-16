/**
 * Main tick function for the event loop simulator.
 * Advances the simulation by one step following strict priority rules.
 * 
 * This is the core of the simulator - each tick checks priority rules in order
 * and executes the first applicable rule.
 */

import type { SimulatorState, Frame, LogEntry } from '@/core/types/simulator';
import type { Task } from '@/core/types/task';
import { TaskState } from '@/core/types/task';
import { processWebApiOperations } from './enqueue';
import { findEarliestReadyAt } from './webapi';
import {
  shouldExecuteCallStack,
  shouldDrainMicrotask,
  shouldRender,
  shouldExecuteRaf,
  shouldExecuteMacrotask,
  shouldAdvanceTime,
  isSimulationComplete,
} from './priority';

/**
 * Main tick function - advances simulation by one step.
 * Follows priority rules in strict order:
 * 1. Execute current call stack frame
 * 2. Drain microtask queue (one at a time)
 * 3. Check for render
 * 4. Execute rAF callback
 * 5. Execute macrotask
 * 6. Advance time to next Web API
 * 7. Simulation complete
 * 
 * @param state - Current simulator state
 * @returns New simulator state after one tick
 * 
 * @example
 * ```typescript
 * let state = createInitialState();
 * state = tick(state); // Execute one step
 * state = tick(state); // Execute another step
 * ```
 */
export function tick(state: SimulatorState): SimulatorState {
  // Rule 1: Execute current call stack frame
  if (shouldExecuteCallStack(state)) {
    return executeCallStackFrame(state);
  }

  // Rule 2: Drain microtask queue
  if (shouldDrainMicrotask(state)) {
    return drainMicrotask(state);
  }

  // Rule 3: Check for render
  if (shouldRender(state)) {
    return executeRender(state);
  }

  // Rule 4: Execute rAF callback
  if (shouldExecuteRaf(state)) {
    return executeRaf(state);
  }

  // Rule 5: Execute macrotask
  if (shouldExecuteMacrotask(state)) {
    return executeMacrotask(state);
  }

  // Rule 6: Advance time
  if (shouldAdvanceTime(state)) {
    return advanceTime(state);
  }

  // Rule 7: Simulation complete
  if (isSimulationComplete(state)) {
    return markSimulationComplete(state);
  }

  // Should never reach here if rules are correctly implemented
  throw new Error('Invalid simulation state - no rule applies');
}

/**
 * Rule 1: Execute one step of the current call stack frame.
 * Decrements stepsRemaining. If it reaches 0, pops frame, marks task as COMPLETED,
 * and processes task effects.
 */
function executeCallStackFrame(state: SimulatorState): SimulatorState {
  const frame = state.callStack[0]!;
  const newStepsRemaining = frame.stepsRemaining - 1;

  // If task still has steps remaining, just decrement
  if (newStepsRemaining > 0) {
    const updatedFrame: Frame = {
      ...frame,
      stepsRemaining: newStepsRemaining,
    };

    return {
      ...state,
      callStack: [updatedFrame, ...state.callStack.slice(1)],
      stepIndex: state.stepIndex + 1,
    };
  }

  // Task completed - pop frame and process effects
  const completedTask = {
    ...frame.task,
    state: TaskState.COMPLETED,
  } as Task;

  // Add completion log entry
  const logEntry: LogEntry = {
    timestamp: state.now,
    type: 'task-complete',
    message: `Task completed: ${completedTask.label}`,
    taskId: completedTask.id,
  };

  // Pop the frame
  const newCallStack = state.callStack.slice(1);

  let newState: SimulatorState = {
    ...state,
    callStack: newCallStack,
    log: [...state.log, logEntry],
    stepIndex: state.stepIndex + 1,
  };

  // Process task effects
  newState = processTaskEffects(newState, completedTask);

  return newState;
}

/**
 * Rule 2: Dequeue one microtask and push to call stack.
 */
function drainMicrotask(state: SimulatorState): SimulatorState {
  const microtask = state.microQueue[0];
  const newMicroQueue = state.microQueue.slice(1);

  // Update task state to RUNNING
  const runningTask = {
    ...microtask,
    state: TaskState.RUNNING,
  } as Task;

  // Create call stack frame
  const frame: Frame = {
    task: runningTask,
    startedAt: state.now,
    stepsRemaining: runningTask.durationSteps,
  };

  // Add log entry
  const logEntry: LogEntry = {
    timestamp: state.now,
    type: 'task-start',
    message: `Microtask started: ${runningTask.label}`,
    taskId: runningTask.id,
  };

  return {
    ...state,
    callStack: [frame],
    microQueue: newMicroQueue,
    log: [...state.log, logEntry],
    stepIndex: state.stepIndex + 1,
  };
}

/**
 * Rule 3: Execute render step.
 * Logs render event, updates render state, and increments frame counter.
 */
function executeRender(state: SimulatorState): SimulatorState {
  const logEntry: LogEntry = {
    timestamp: state.now,
    type: 'render',
    message: 'Render (style/layout/paint)',
  };

  return {
    ...state,
    renderPending: false,
    lastFrameAt: state.now,
    frameCounter: state.frameCounter + 1,
    log: [...state.log, logEntry],
    stepIndex: state.stepIndex + 1,
  };
}

/**
 * Rule 4: Dequeue one rAF callback and push to call stack.
 */
function executeRaf(state: SimulatorState): SimulatorState {
  const rafTask = state.rafQueue[0];
  const newRafQueue = state.rafQueue.slice(1);

  // Update task state to RUNNING
  const runningTask = {
    ...rafTask,
    state: TaskState.RUNNING,
  } as Task;

  // Create call stack frame
  const frame: Frame = {
    task: runningTask,
    startedAt: state.now,
    stepsRemaining: runningTask.durationSteps,
  };

  // Add log entry
  const logEntry: LogEntry = {
    timestamp: state.now,
    type: 'task-start',
    message: `rAF callback started: ${runningTask.label}`,
    taskId: runningTask.id,
  };

  return {
    ...state,
    callStack: [frame],
    rafQueue: newRafQueue,
    log: [...state.log, logEntry],
    stepIndex: state.stepIndex + 1,
  };
}

/**
 * Rule 5: Dequeue one macrotask and push to call stack.
 */
function executeMacrotask(state: SimulatorState): SimulatorState {
  const macrotask = state.macroQueue[0];
  const newMacroQueue = state.macroQueue.slice(1);

  // Update task state to RUNNING
  const runningTask = {
    ...macrotask,
    state: TaskState.RUNNING,
  } as Task;

  // Create call stack frame
  const frame: Frame = {
    task: runningTask,
    startedAt: state.now,
    stepsRemaining: runningTask.durationSteps,
  };

  // Add log entry
  const logEntry: LogEntry = {
    timestamp: state.now,
    type: 'task-start',
    message: `Macrotask started: ${runningTask.label}`,
    taskId: runningTask.id,
  };

  return {
    ...state,
    callStack: [frame],
    macroQueue: newMacroQueue,
    log: [...state.log, logEntry],
    stepIndex: state.stepIndex + 1,
  };
}

/**
 * Rule 6: Advance time to earliest Web API operation.
 * Finds the earliest readyAt time, sets now = readyAt, and processes ready operations.
 */
function advanceTime(state: SimulatorState): SimulatorState {
  const earliestTime = findEarliestReadyAt(state.webApis);

  if (earliestTime === null) {
    // Should not happen if shouldAdvanceTime returned true
    throw new Error('No Web API operations found when advancing time');
  }

  // Advance time
  let newState: SimulatorState = {
    ...state,
    now: earliestTime,
  };

  // Process all Web API operations that are now ready
  newState = processWebApiOperations(newState);

  // Add log entry for time advancement
  const logEntry: LogEntry = {
    timestamp: earliestTime,
    type: 'user',
    message: `Time advanced to ${earliestTime}ms`,
  };

  return {
    ...newState,
    log: [...newState.log, logEntry],
    stepIndex: state.stepIndex + 1,
  };
}

/**
 * Rule 7: Mark simulation as complete.
 * Simply increments stepIndex to show progress.
 */
function markSimulationComplete(state: SimulatorState): SimulatorState {
  // Add completion log entry
  const logEntry: LogEntry = {
    timestamp: state.now,
    type: 'user',
    message: 'Simulation complete',
  };

  return {
    ...state,
    log: [...state.log, logEntry],
    stepIndex: state.stepIndex + 1,
  };
}

/**
 * Process task effects when a task completes.
 * Handles enqueue-task, log, invalidate-render, and cancel-webapi effects.
 */
function processTaskEffects(state: SimulatorState, task: Task): SimulatorState {
  let newState = state;

  for (const effect of task.effects) {
    switch (effect.type) {
      case 'enqueue-task': {
        // Effect payload should contain task and enqueue info
        const effectPayload = effect.payload as {
          task: Task;
          queueType: 'macro' | 'micro' | 'raf';
          delay?: number;
        };

        // This is a simplified version - in real implementation, would use enqueue functions
        // For now, just add to appropriate queue
        if (effectPayload.queueType === 'micro') {
          const enqueuedTask = {
            ...effectPayload.task,
            state: TaskState.QUEUED,
            enqueueSeq: newState.enqueueCounter,
          } as Task;
          newState = {
            ...newState,
            microQueue: [...newState.microQueue, enqueuedTask],
            enqueueCounter: newState.enqueueCounter + 1,
          };
        } else if (effectPayload.queueType === 'macro') {
          const enqueuedTask = {
            ...effectPayload.task,
            state: TaskState.QUEUED,
            enqueueSeq: newState.enqueueCounter,
          } as Task;
          newState = {
            ...newState,
            macroQueue: [...newState.macroQueue, enqueuedTask],
            enqueueCounter: newState.enqueueCounter + 1,
          };
        } else if (effectPayload.queueType === 'raf') {
          const enqueuedTask = {
            ...effectPayload.task,
            state: TaskState.QUEUED,
            enqueueSeq: newState.enqueueCounter,
          } as Task;
          newState = {
            ...newState,
            rafQueue: [...newState.rafQueue, enqueuedTask],
            enqueueCounter: newState.enqueueCounter + 1,
          };
        }
        break;
      }

      case 'log': {
        const message = effect.payload as string;
        const logEntry: LogEntry = {
          timestamp: newState.now,
          type: 'user',
          message,
          taskId: task.id,
        };
        newState = {
          ...newState,
          log: [...newState.log, logEntry],
        };
        break;
      }

      case 'invalidate-render': {
        newState = {
          ...newState,
          renderPending: true,
        };
        break;
      }

      case 'cancel-webapi': {
        const operationId = effect.payload as string;
        const newWebApis = new Map(newState.webApis);
        newWebApis.delete(operationId);
        newState = {
          ...newState,
          webApis: newWebApis,
        };
        break;
      }
    }
  }

  return newState;
}
