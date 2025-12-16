/**
 * Web API operation management.
 * Creates and manages pending Web API operations (timers, fetch, etc.).
 */

import type { Task } from '@/core/types/task';
import type { WebApiOperation } from '@/core/types/webapi';
import { WebApiType } from '@/core/types/webapi';

/**
 * Options for creating a Web API operation.
 */
export interface CreateWebApiOperationOptions {
  /** Unique identifier for this operation */
  id: string;
  /** Type of Web API operation */
  type: WebApiType;
  /** Task to enqueue when this operation becomes ready */
  payloadTask: Task;
  /** Logical time when this operation becomes ready */
  readyAt: number;
  /** Which queue to enqueue to when ready */
  targetQueue: 'macro' | 'micro' | 'raf';
  /** Whether this operation repeats (true for setInterval) */
  recurring?: boolean;
}

/**
 * Create a Web API operation.
 * Web API operations represent pending work (timers, network requests, etc.)
 * that will enqueue tasks at a future logical time.
 *
 * @param options - Configuration for the operation
 * @returns A new WebApiOperation
 *
 * @example
 * ```typescript
 * const op = createWebApiOperation({
 *   id: 'timer-1',
 *   type: WebApiType.TIMER,
 *   payloadTask: timerTask,
 *   readyAt: 100,
 *   targetQueue: 'macro',
 * });
 * ```
 */
export function createWebApiOperation(
  options: CreateWebApiOperationOptions
): WebApiOperation {
  const result: WebApiOperation = {
    id: options.id,
    type: options.type,
    payloadTask: options.payloadTask,
    readyAt: options.readyAt,
    targetQueue: options.targetQueue,
  };
  
  // Only add recurring if it's defined (for exactOptionalPropertyTypes)
  if (options.recurring !== undefined) {
    result.recurring = options.recurring;
  }
  
  return result;
}

/**
 * Check if a Web API operation is ready to enqueue its task.
 * An operation is ready when the current logical time has reached or passed its readyAt time.
 *
 * @param operation - The operation to check
 * @param now - Current logical time
 * @returns true if the operation is ready to enqueue
 *
 * @example
 * ```typescript
 * const ready = isOperationReady(operation, 100);
 * if (ready) {
 *   // Enqueue the operation's task
 * }
 * ```
 */
export function isOperationReady(
  operation: WebApiOperation,
  now: number
): boolean {
  return now >= operation.readyAt;
}

/**
 * Find the earliest readyAt time among all Web API operations.
 * Used for time advancement when all queues are empty.
 *
 * @param operations - Map of Web API operations
 * @returns The earliest readyAt time, or null if no operations exist
 *
 * @example
 * ```typescript
 * const nextTime = findEarliestReadyAt(state.webApis);
 * if (nextTime !== null) {
 *   // Advance time to nextTime
 * }
 * ```
 */
export function findEarliestReadyAt(
  operations: Map<string, WebApiOperation>
): number | null {
  if (operations.size === 0) {
    return null;
  }

  let earliest: number | null = null;
  for (const op of operations.values()) {
    if (earliest === null || op.readyAt < earliest) {
      earliest = op.readyAt;
    }
  }

  return earliest;
}

/**
 * Get all Web API operations that are ready to enqueue at the given time.
 * Returns operations sorted by their task's enqueueSeq for deterministic ordering.
 *
 * @param operations - Map of Web API operations
 * @param now - Current logical time
 * @returns Array of ready operations, sorted by enqueueSeq
 *
 * @example
 * ```typescript
 * const ready = getReadyOperations(state.webApis, state.now);
 * for (const op of ready) {
 *   // Enqueue op.payloadTask to appropriate queue
 * }
 * ```
 */
export function getReadyOperations(
  operations: Map<string, WebApiOperation>,
  now: number
): WebApiOperation[] {
  const ready: WebApiOperation[] = [];

  for (const op of operations.values()) {
    if (isOperationReady(op, now)) {
      ready.push(op);
    }
  }

  // Sort by enqueueSeq for deterministic ordering when multiple ops become ready simultaneously
  ready.sort((a, b) => a.payloadTask.enqueueSeq - b.payloadTask.enqueueSeq);

  return ready;
}
