/**
 * Web API operation types.
 * Defines structures for pending Web API operations.
 */

import type { Task } from './task';

/**
 * Types of Web API operations.
 */
export enum WebApiType {
  TIMER = 'timer',
  INTERVAL = 'interval',
  FETCH = 'fetch',
  DOM_EVENT = 'dom-event',
  RAF = 'raf',
}

/**
 * Represents an in-flight Web API operation.
 * Web APIs (setTimeout, fetch, etc.) register operations that become ready at a future logical time.
 */
export interface WebApiOperation {
  /** Unique identifier for this operation */
  id: string;

  /** Type of Web API operation */
  type: WebApiType;

  /** Logical time when this operation becomes ready to enqueue its task */
  readyAt: number;

  /** Which queue to enqueue the task to when ready */
  targetQueue: 'macro' | 'micro' | 'raf';

  /** Task to enqueue when this operation becomes ready */
  payloadTask: Task;

  /** Whether this operation repeats (true for setInterval) */
  recurring?: boolean;
}
