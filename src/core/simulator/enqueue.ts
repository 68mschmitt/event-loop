/**
 * Enqueue rules for all task types.
 * Implements how each task type enters the event loop system.
 * All functions are deterministic and return new state immutably.
 */

import type { SimulatorState } from '@/core/types/simulator';
import type { Task } from '@/core/types/task';
import { TaskState } from '@/core/types/task';
import { WebApiType } from '@/core/types/webapi';
import { createWebApiOperation, getReadyOperations } from './webapi';

/**
 * Enqueue a setTimeout timer task.
 * Creates a Web API operation that will enqueue to macroQueue after delay.
 *
 * Rule: Timer tasks go through Web API with readyAt = now + delay, then enqueue to macroQueue.
 *
 * @param state - Current simulator state
 * @param task - Timer task to enqueue
 * @param delay - Delay in milliseconds
 * @returns New state with Web API operation registered
 *
 * @example
 * ```typescript
 * const newState = enqueueTimerTask(state, timerTask, 100);
 * // Timer will be ready at state.now + 100
 * ```
 */
export function enqueueTimerTask(
  state: SimulatorState,
  task: Task,
  delay: number
): SimulatorState {
  // Update task state and enqueueSeq
  const updatedTask: Task = {
    ...task,
    state: TaskState.WAITING_WEBAPI,
    enqueueSeq: state.enqueueCounter,
  };

  // Create Web API operation (no recurring for timer)
  const operation = createWebApiOperation({
    id: task.id,
    type: WebApiType.TIMER,
    payloadTask: updatedTask,
    readyAt: state.now + delay,
    targetQueue: 'macro',
  });

  // Clone webApis map and add operation
  const newWebApis = new Map(state.webApis);
  newWebApis.set(operation.id, operation);

  return {
    ...state,
    webApis: newWebApis,
    enqueueCounter: state.enqueueCounter + 1,
  };
}

/**
 * Enqueue a setInterval interval task.
 * Similar to timer but with recurring flag set to true.
 *
 * Rule: Interval tasks go through Web API with recurring=true, re-enqueue after each execution.
 *
 * @param state - Current simulator state
 * @param task - Interval task to enqueue
 * @param delay - Interval in milliseconds
 * @returns New state with Web API operation registered
 *
 * @example
 * ```typescript
 * const newState = enqueueIntervalTask(state, intervalTask, 100);
 * // Interval will fire every 100ms until canceled
 * ```
 */
export function enqueueIntervalTask(
  state: SimulatorState,
  task: Task,
  delay: number
): SimulatorState {
  // Update task state and enqueueSeq
  const updatedTask: Task = {
    ...task,
    state: TaskState.WAITING_WEBAPI,
    enqueueSeq: state.enqueueCounter,
  };

  // Create Web API operation with recurring flag
  const operation = createWebApiOperation({
    id: task.id,
    type: WebApiType.INTERVAL,
    payloadTask: updatedTask,
    readyAt: state.now + delay,
    targetQueue: 'macro',
    recurring: true,
  });

  // Clone webApis map and add operation
  const newWebApis = new Map(state.webApis);
  newWebApis.set(operation.id, operation);

  return {
    ...state,
    webApis: newWebApis,
    enqueueCounter: state.enqueueCounter + 1,
  };
}

/**
 * Enqueue a microtask (Promise.then, queueMicrotask).
 * Directly enqueues to microtask queue without Web API delay.
 *
 * Rule: Microtasks bypass Web API and go directly to microQueue.
 *
 * @param state - Current simulator state
 * @param task - Microtask to enqueue
 * @returns New state with task in microQueue
 *
 * @example
 * ```typescript
 * const newState = enqueueMicrotask(state, microtask);
 * // Task immediately in microQueue, ready to execute when call stack clears
 * ```
 */
export function enqueueMicrotask(
  state: SimulatorState,
  task: Task
): SimulatorState {
  // Update task state and enqueueSeq
  const updatedTask: Task = {
    ...task,
    state: TaskState.QUEUED,
    enqueueSeq: state.enqueueCounter,
  };

  return {
    ...state,
    microQueue: [...state.microQueue, updatedTask],
    enqueueCounter: state.enqueueCounter + 1,
  };
}

/**
 * Enqueue an async function continuation after await.
 * Each await creates a microtask for the continuation.
 *
 * Rule: async/await continuations are microtasks.
 *
 * @param state - Current simulator state
 * @param task - Async continuation task to enqueue
 * @returns New state with task in microQueue
 *
 * @example
 * ```typescript
 * const newState = enqueueAsyncContinuation(state, asyncTask);
 * // Continuation runs as microtask after awaited promise resolves
 * ```
 */
export function enqueueAsyncContinuation(
  state: SimulatorState,
  task: Task
): SimulatorState {
  // Async continuations are microtasks
  return enqueueMicrotask(state, task);
}

/**
 * Enqueue a fetch task with simulated network latency.
 * Creates a Web API operation that will enqueue to macroQueue after latency.
 *
 * Rule: Fetch uses Web API with latency delay, then enqueues to macroQueue.
 * (Simplified model - real fetch might use microtasks for promise resolution)
 *
 * @param state - Current simulator state
 * @param task - Fetch task to enqueue
 * @param latency - Network latency in milliseconds
 * @returns New state with Web API operation registered
 *
 * @example
 * ```typescript
 * const newState = enqueueFetchTask(state, fetchTask, 200);
 * // Fetch will complete after 200ms of simulated network time
 * ```
 */
export function enqueueFetchTask(
  state: SimulatorState,
  task: Task,
  latency: number
): SimulatorState {
  // Update task state and enqueueSeq
  const updatedTask: Task = {
    ...task,
    state: TaskState.WAITING_WEBAPI,
    enqueueSeq: state.enqueueCounter,
  };

  // Create Web API operation (no recurring for fetch)
  const operation = createWebApiOperation({
    id: task.id,
    type: WebApiType.FETCH,
    payloadTask: updatedTask,
    readyAt: state.now + latency,
    targetQueue: 'macro',
  });

  // Clone webApis map and add operation
  const newWebApis = new Map(state.webApis);
  newWebApis.set(operation.id, operation);

  return {
    ...state,
    webApis: newWebApis,
    enqueueCounter: state.enqueueCounter + 1,
  };
}

/**
 * Enqueue a DOM event handler task.
 * Can enqueue immediately to macroQueue or use Web API for delayed events.
 *
 * Rule: If immediate, enqueue to macroQueue directly. Otherwise use Web API.
 *
 * @param state - Current simulator state
 * @param task - DOM event task to enqueue
 * @param immediate - If true, enqueue immediately to macroQueue; if false, use Web API
 * @returns New state with task enqueued
 *
 * @example
 * ```typescript
 * // Immediate event (e.g., user click)
 * const newState1 = enqueueDomEventTask(state, eventTask, true);
 *
 * // Delayed event (e.g., load event)
 * const newState2 = enqueueDomEventTask(state, eventTask, false);
 * ```
 */
export function enqueueDomEventTask(
  state: SimulatorState,
  task: Task,
  immediate: boolean
): SimulatorState {
  // Update task state and enqueueSeq
  const updatedTask: Task = {
    ...task,
    enqueueSeq: state.enqueueCounter,
  };

  if (immediate) {
    // Enqueue directly to macroQueue
    return {
      ...state,
      macroQueue: [
        ...state.macroQueue,
        { ...updatedTask, state: TaskState.QUEUED },
      ],
      enqueueCounter: state.enqueueCounter + 1,
    };
  } else {
    // Use Web API for delayed event (no recurring for DOM events)
    const operation = createWebApiOperation({
      id: task.id,
      type: WebApiType.DOM_EVENT,
      payloadTask: { ...updatedTask, state: TaskState.WAITING_WEBAPI },
      readyAt: state.now, // Ready immediately but goes through Web API
      targetQueue: 'macro',
    });

    const newWebApis = new Map(state.webApis);
    newWebApis.set(operation.id, operation);

    return {
      ...state,
      webApis: newWebApis,
      enqueueCounter: state.enqueueCounter + 1,
    };
  }
}

/**
 * Enqueue a requestAnimationFrame callback.
 * Enqueues directly to rafQueue, which executes at frame boundaries.
 *
 * Rule: rAF callbacks go to rafQueue, execute at next frame boundary.
 *
 * @param state - Current simulator state
 * @param task - rAF task to enqueue
 * @returns New state with task in rafQueue
 *
 * @example
 * ```typescript
 * const newState = enqueueRafTask(state, rafTask);
 * // Task will execute at next frame boundary (after render decision)
 * ```
 */
export function enqueueRafTask(state: SimulatorState, task: Task): SimulatorState {
  // Update task state and enqueueSeq
  const updatedTask: Task = {
    ...task,
    state: TaskState.QUEUED,
    enqueueSeq: state.enqueueCounter,
  };

  return {
    ...state,
    rafQueue: [...state.rafQueue, updatedTask],
    enqueueCounter: state.enqueueCounter + 1,
  };
}

/**
 * Process all Web API operations that are ready to enqueue.
 * Finds operations where readyAt <= now, enqueues their tasks to appropriate queues.
 * Removes non-recurring operations, reschedules recurring ones (intervals).
 *
 * Rule: When multiple operations become ready simultaneously, process in order of enqueueSeq.
 *
 * @param state - Current simulator state
 * @returns New state with ready operations processed
 *
 * @example
 * ```typescript
 * const newState = processWebApiOperations(state);
 * // All ready timers/fetch/etc. are now in their target queues
 * ```
 */
export function processWebApiOperations(
  state: SimulatorState
): SimulatorState {
  // Get all ready operations, sorted by enqueueSeq for determinism
  const readyOps = getReadyOperations(state.webApis, state.now);

  if (readyOps.length === 0) {
    return state; // No changes needed
  }

  // Clone state structures
  let newMacroQueue = [...state.macroQueue];
  let newMicroQueue = [...state.microQueue];
  let newRafQueue = [...state.rafQueue];
  const newWebApis = new Map(state.webApis);
  let newEnqueueCounter = state.enqueueCounter;

  // Process each ready operation
  for (const op of readyOps) {
    // Update task state to QUEUED
    const queuedTask: Task = {
      ...op.payloadTask,
      state: TaskState.QUEUED,
    };

    // Enqueue to appropriate queue
    switch (op.targetQueue) {
      case 'macro':
        newMacroQueue.push(queuedTask);
        break;
      case 'micro':
        newMicroQueue.push(queuedTask);
        break;
      case 'raf':
        newRafQueue.push(queuedTask);
        break;
    }

    // Handle recurring operations (setInterval)
    if (op.recurring) {
      // Reschedule the operation for next interval
      // For interval, we need to get the delay from the task
      let intervalDelay = 0;
      if (op.payloadTask.type === 'interval') {
        intervalDelay = op.payloadTask.delay;
      }

      // Create new task for next interval
      const nextTask: Task = {
        ...op.payloadTask,
        state: TaskState.WAITING_WEBAPI,
        enqueueSeq: newEnqueueCounter++,
      };

      const nextOp = createWebApiOperation({
        id: op.id, // Keep same ID for intervals
        type: op.type,
        payloadTask: nextTask,
        readyAt: state.now + intervalDelay,
        targetQueue: op.targetQueue,
        recurring: true,
      });

      newWebApis.set(nextOp.id, nextOp);
    } else {
      // Remove non-recurring operation
      newWebApis.delete(op.id);
    }
  }

  return {
    ...state,
    macroQueue: newMacroQueue,
    microQueue: newMicroQueue,
    rafQueue: newRafQueue,
    webApis: newWebApis,
    enqueueCounter: newEnqueueCounter,
  };
}
