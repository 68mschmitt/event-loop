/**
 * Task-related types for the event loop simulator.
 * Defines all task variants using discriminated unions.
 */

/**
 * Discriminant for task types. Used to differentiate task variants in the Task union.
 */
export enum TaskType {
  SYNC = 'sync',
  TIMER = 'timer',
  INTERVAL = 'interval',
  MICROTASK = 'microtask',
  PROMISE = 'promise',
  ASYNC_CONTINUATION = 'async-continuation',
  FETCH = 'fetch',
  DOM_EVENT = 'dom-event',
  RAF = 'raf',
}

/**
 * Lifecycle state of a task.
 */
export enum TaskState {
  CREATED = 'created',
  WAITING_WEBAPI = 'waiting-webapi',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

/**
 * Effects that a task can produce when executed.
 */
export interface TaskEffect {
  type: 'enqueue-task' | 'log' | 'invalidate-render' | 'cancel-webapi';
  payload: unknown;
}

/**
 * Base properties shared by all task types.
 */
interface BaseTask {
  /** Unique identifier for this task */
  readonly id: string;

  /** Human-readable label for UI display */
  label: string;

  /** Logical time when task was created */
  readonly createdAt: number;

  /** Monotonic sequence number for tie-breaking when tasks are enqueued at the same time */
  readonly enqueueSeq: number;

  /** Parent task ID that created this task, or 'scenario' for initial tasks, or null */
  origin: string | null;

  /** Current lifecycle state of the task */
  state: TaskState;

  /** How many simulation steps this task takes to execute (≥1) */
  durationSteps: number;

  /** Effects produced when this task completes execution */
  effects: TaskEffect[];
}

/**
 * Synchronous function call task.
 * Executes immediately when popped from queue.
 */
export interface SyncTask extends BaseTask {
  type: TaskType.SYNC;
}

/**
 * setTimeout callback task.
 * Delayed execution via Web API, then enqueued to macrotask queue.
 */
export interface TimerTask extends BaseTask {
  type: TaskType.TIMER;
  /** Original delay in milliseconds */
  delay: number;
}

/**
 * setInterval callback task.
 * Recurring timer that re-enqueues after each execution.
 */
export interface IntervalTask extends BaseTask {
  type: TaskType.INTERVAL;
  /** Original delay/interval in milliseconds */
  delay: number;
  /** ID of the interval operation for cancellation */
  intervalId: string;
}

/**
 * Promise.then/queueMicrotask callback.
 * Enqueued directly to microtask queue without Web API delay.
 */
export interface MicrotaskTask extends BaseTask {
  type: TaskType.MICROTASK;
}

/**
 * Promise resolution/rejection task.
 * Represents a promise settlement that enqueues microtasks for .then/.catch/.finally handlers.
 */
export interface PromiseTask extends BaseTask {
  type: TaskType.PROMISE;
}

/**
 * async function continuation after await.
 * Each await creates a microtask for the continuation.
 */
export interface AsyncContinuationTask extends BaseTask {
  type: TaskType.ASYNC_CONTINUATION;
}

/**
 * fetch completion callback.
 * Simulates network latency via Web API, then enqueued to macrotask queue.
 */
export interface FetchTask extends BaseTask {
  type: TaskType.FETCH;
  /** URL being fetched */
  url: string;
  /** Simulated network latency in milliseconds */
  latency: number;
}

/**
 * DOM event handler.
 * User interactions or other events enqueued to macrotask queue.
 */
export interface DomEventTask extends BaseTask {
  type: TaskType.DOM_EVENT;
  /** Type of event (e.g., 'click', 'input', 'load') */
  eventType: string;
}

/**
 * requestAnimationFrame callback.
 * Executed during frame phase before rendering.
 */
export interface RafTask extends BaseTask {
  type: TaskType.RAF;
}

/**
 * Union type for all task variants.
 * Use discriminated union on the `type` field for type-safe handling.
 *
 * @example
 * ```typescript
 * function processTask(task: Task) {
 *   switch (task.type) {
 *     case TaskType.TIMER:
 *       // TypeScript knows task is TimerTask here
 *       console.log(`Timer with delay ${task.delay}ms`);
 *       break;
 *     case TaskType.FETCH:
 *       // TypeScript knows task is FetchTask here
 *       console.log(`Fetching ${task.url}`);
 *       break;
 *     // ...
 *   }
 * }
 * ```
 */
export type Task =
  | SyncTask
  | TimerTask
  | IntervalTask
  | MicrotaskTask
  | PromiseTask
  | AsyncContinuationTask
  | FetchTask
  | DomEventTask
  | RafTask;

/**
 * Type guard to check if a task is a sync task.
 */
export function isSyncTask(task: Task): task is SyncTask {
  return task.type === TaskType.SYNC;
}

/**
 * Type guard to check if a task is a timer task.
 */
export function isTimerTask(task: Task): task is TimerTask {
  return task.type === TaskType.TIMER;
}

/**
 * Type guard to check if a task is an interval task.
 */
export function isIntervalTask(task: Task): task is IntervalTask {
  return task.type === TaskType.INTERVAL;
}

/**
 * Type guard to check if a task is a microtask.
 */
export function isMicrotaskTask(task: Task): task is MicrotaskTask {
  return task.type === TaskType.MICROTASK;
}

/**
 * Type guard to check if a task is a promise task.
 */
export function isPromiseTask(task: Task): task is PromiseTask {
  return task.type === TaskType.PROMISE;
}

/**
 * Type guard to check if a task is an async continuation task.
 */
export function isAsyncContinuationTask(task: Task): task is AsyncContinuationTask {
  return task.type === TaskType.ASYNC_CONTINUATION;
}

/**
 * Type guard to check if a task is a fetch task.
 */
export function isFetchTask(task: Task): task is FetchTask {
  return task.type === TaskType.FETCH;
}

/**
 * Type guard to check if a task is a DOM event task.
 */
export function isDomEventTask(task: Task): task is DomEventTask {
  return task.type === TaskType.DOM_EVENT;
}

/**
 * Type guard to check if a task is a requestAnimationFrame task.
 */
export function isRafTask(task: Task): task is RafTask {
  return task.type === TaskType.RAF;
}
