/**
 * Priority rule logic for the event loop simulator.
 * Each function checks if a specific priority rule should execute.
 * Rules are checked in order from Rule 1 to Rule 7.
 */

import type { SimulatorState } from '@/core/types/simulator';

/**
 * Rule 1: Complete Current Call Stack Frame
 * Condition: Call stack is non-empty AND top frame has remaining steps
 */
export function shouldExecuteCallStack(state: SimulatorState): boolean {
  return state.callStack.length > 0 && state.callStack[0].stepsRemaining > 0;
}

/**
 * Rule 2: Drain Microtask Queue
 * Condition: Call stack is empty AND microtask queue is non-empty
 */
export function shouldDrainMicrotask(state: SimulatorState): boolean {
  return state.callStack.length === 0 && state.microQueue.length > 0;
}

/**
 * Rule 3: Check for Render
 * Condition: All of the following are true:
 * - Call stack is empty
 * - Microtask queue is empty
 * - renderPending === true
 * - now >= lastFrameAt + frameInterval
 */
export function shouldRender(state: SimulatorState): boolean {
  return (
    state.callStack.length === 0 &&
    state.microQueue.length === 0 &&
    state.renderPending === true &&
    state.now >= state.lastFrameAt + state.frameInterval
  );
}

/**
 * Rule 4: Execute rAF Callback
 * Condition: All of the following are true:
 * - Call stack is empty
 * - Microtask queue is empty
 * - At frame boundary (now >= lastFrameAt + frameInterval) OR render just occurred
 * - rAF queue is non-empty
 * 
 * Note: This checks if we're at a frame boundary to handle cases where 
 * render may not be pending but we're still at the frame timing.
 */
export function shouldExecuteRaf(state: SimulatorState): boolean {
  const atFrameBoundary = state.now >= state.lastFrameAt + state.frameInterval;
  return (
    state.callStack.length === 0 &&
    state.microQueue.length === 0 &&
    atFrameBoundary &&
    state.rafQueue.length > 0
  );
}

/**
 * Rule 5: Execute Macrotask
 * Condition: Call stack is empty AND microtask queue is empty AND macrotask queue is non-empty
 */
export function shouldExecuteMacrotask(state: SimulatorState): boolean {
  return (
    state.callStack.length === 0 &&
    state.microQueue.length === 0 &&
    state.macroQueue.length > 0
  );
}

/**
 * Rule 6: Advance Time
 * Condition: All queues are empty, no tasks running, Web APIs have pending operations
 */
export function shouldAdvanceTime(state: SimulatorState): boolean {
  return (
    state.callStack.length === 0 &&
    state.microQueue.length === 0 &&
    state.macroQueue.length === 0 &&
    state.rafQueue.length === 0 &&
    state.webApis.size > 0
  );
}

/**
 * Rule 7: Simulation Complete
 * Condition: All queues empty, call stack empty, no Web API operations pending
 */
export function isSimulationComplete(state: SimulatorState): boolean {
  return (
    state.callStack.length === 0 &&
    state.microQueue.length === 0 &&
    state.macroQueue.length === 0 &&
    state.rafQueue.length === 0 &&
    state.webApis.size === 0
  );
}
