/**
 * Microtask draining logic.
 * Handles the complete draining of the microtask queue including nested microtasks.
 */

import type { SimulatorState, Frame, LogEntry } from '@/core/types/simulator';
import type { Task, TaskEffect } from '@/core/types/task';
import { TaskState } from '@/core/types/task';

/**
 * Check if microtask queue should be drained.
 * Returns true if call stack is empty and microtask queue is not empty.
 * 
 * @param state - Current simulator state
 * @returns true if microtask draining should occur
 */
export function shouldDrainMicrotask(state: SimulatorState): boolean {
  return state.callStack.length === 0 && state.microQueue.length > 0;
}

/**
 * Drain the entire microtask queue.
 * Keeps dequeuing and executing microtasks until the queue is empty.
 * Handles nested microtasks - if a microtask enqueues another microtask,
 * it will also be executed before this function returns.
 * 
 * This implements Rule 2 behavior: microtasks are processed one at a time,
 * but the rule repeats until the queue is empty.
 * 
 * @param state - Current simulator state (must have empty call stack)
 * @returns New state after all microtasks have been drained
 */
export function drainMicrotaskQueue(state: SimulatorState): SimulatorState {
  let currentState = state;

  // Keep processing microtasks until the queue is empty
  while (currentState.microQueue.length > 0) {
    // Dequeue one microtask
    const microtask = currentState.microQueue[0];
    const newMicroQueue = currentState.microQueue.slice(1);

    // Update task state to RUNNING and create call stack frame
    const runningTask: Task = {
      ...microtask,
      state: TaskState.RUNNING,
    };

    const frame: Frame = {
      task: runningTask,
      startedAt: currentState.now,
      stepsRemaining: runningTask.durationSteps,
    };

    // Add start log entry
    const startLogEntry: LogEntry = {
      timestamp: currentState.now,
      type: 'task-start',
      message: `Microtask started: ${runningTask.label}`,
      taskId: runningTask.id,
    };

    currentState = {
      ...currentState,
      callStack: [frame],
      microQueue: newMicroQueue,
      log: [...currentState.log, startLogEntry],
    };

    // Execute all steps of this microtask
    currentState = executeTaskCompletely(currentState);
  }

  return currentState;
}

/**
 * Execute a task completely until it finishes.
 * Decrements stepsRemaining until 0, then processes effects.
 * 
 * @param state - State with a task on the call stack
 * @returns State after task is complete and popped from stack
 */
function executeTaskCompletely(state: SimulatorState): SimulatorState {
  let currentState = state;

  // Execute all steps
  while (currentState.callStack.length > 0) {
    const frame = currentState.callStack[0];
    const newStepsRemaining = frame.stepsRemaining - 1;

    if (newStepsRemaining > 0) {
      // Task still has steps remaining
      const updatedFrame: Frame = {
        ...frame,
        stepsRemaining: newStepsRemaining,
      };

      currentState = {
        ...currentState,
        callStack: [updatedFrame, ...currentState.callStack.slice(1)],
      };
    } else {
      // Task completed - pop frame and process effects
      const completedTask: Task = {
        ...frame.task,
        state: TaskState.COMPLETED,
      };

      const logEntry: LogEntry = {
        timestamp: currentState.now,
        type: 'task-complete',
        message: `Task completed: ${completedTask.label}`,
        taskId: completedTask.id,
      };

      currentState = {
        ...currentState,
        callStack: currentState.callStack.slice(1),
        log: [...currentState.log, logEntry],
      };

      // Process task effects (which might enqueue more microtasks)
      currentState = processTaskEffects(currentState, completedTask);
    }
  }

  return currentState;
}

/**
 * Process task effects when a task completes.
 * Handles enqueue-task, log, invalidate-render, and cancel-webapi effects.
 * 
 * @param state - Current state
 * @param task - Completed task with effects to process
 * @returns State after effects are processed
 */
function processTaskEffects(state: SimulatorState, task: Task): SimulatorState {
  let newState = state;

  for (const effect of task.effects) {
    switch (effect.type) {
      case 'enqueue-task': {
        const effectPayload = effect.payload as {
          task: Task;
          queueType: 'macro' | 'micro' | 'raf';
          delay?: number;
        };

        if (effectPayload.queueType === 'micro') {
          const enqueuedTask: Task = {
            ...effectPayload.task,
            state: TaskState.QUEUED,
            enqueueSeq: newState.enqueueCounter,
          };
          newState = {
            ...newState,
            microQueue: [...newState.microQueue, enqueuedTask],
            enqueueCounter: newState.enqueueCounter + 1,
          };
        } else if (effectPayload.queueType === 'macro') {
          const enqueuedTask: Task = {
            ...effectPayload.task,
            state: TaskState.QUEUED,
            enqueueSeq: newState.enqueueCounter,
          };
          newState = {
            ...newState,
            macroQueue: [...newState.macroQueue, enqueuedTask],
            enqueueCounter: newState.enqueueCounter + 1,
          };
        } else if (effectPayload.queueType === 'raf') {
          const enqueuedTask: Task = {
            ...effectPayload.task,
            state: TaskState.QUEUED,
            enqueueSeq: newState.enqueueCounter,
          };
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
