/**
 * Barrel export for simulator core components.
 * Re-exports queue, stack, state creation, enqueue, and web API functions.
 */

export { QueueImpl, StackImpl } from './queue';
export { createInitialState } from './state';
export type { CreateInitialStateOptions } from './state';

// Enqueue functions
export {
  enqueueTimerTask,
  enqueueIntervalTask,
  enqueueMicrotask,
  enqueueAsyncContinuation,
  enqueueFetchTask,
  enqueueDomEventTask,
  enqueueRafTask,
  processWebApiOperations,
} from './enqueue';

// Web API utilities
export {
  createWebApiOperation,
  isOperationReady,
  findEarliestReadyAt,
  getReadyOperations,
} from './webapi';
export type { CreateWebApiOperationOptions } from './webapi';

// Tick function and priority rules
export { tick } from './tick';
export {
  shouldExecuteCallStack,
  shouldDrainMicrotask,
  shouldRender,
  shouldExecuteRaf,
  shouldExecuteMacrotask,
  shouldAdvanceTime,
  isSimulationComplete,
} from './priority';

// Render logic
export {
  shouldRender as shouldRenderFrame,
  executeRenderStep,
  isFrameBoundary,
  invalidateRender,
} from './render';

// Microtask draining
export { drainMicrotaskQueue } from './microtask';
