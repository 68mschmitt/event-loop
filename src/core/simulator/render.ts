/**
 * Render step logic and frame boundary detection.
 * Handles the rendering phase of the event loop.
 */

import type { SimulatorState, LogEntry } from '@/core/types/simulator';

/**
 * Check if render should occur.
 * Returns true if ALL conditions are met:
 * - renderPending === true
 * - callStack.length === 0 (stack empty)
 * - microQueue.length === 0 (micros drained)
 * - now >= lastFrameAt + frameInterval (frame boundary)
 * 
 * @param state - Current simulator state
 * @returns true if render should occur
 */
export function shouldRender(state: SimulatorState): boolean {
  return (
    state.renderPending === true &&
    state.callStack.length === 0 &&
    state.microQueue.length === 0 &&
    state.now >= state.lastFrameAt + state.frameInterval
  );
}

/**
 * Execute render step.
 * Performs the render operation and updates render state.
 * 
 * @param state - Current simulator state
 * @returns New state after render
 */
export function executeRenderStep(state: SimulatorState): SimulatorState {
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
  };
}

/**
 * Check if we're at a frame boundary.
 * Returns true if enough time has passed for a new frame.
 * 
 * @param state - Current simulator state
 * @returns true if at frame boundary
 */
export function isFrameBoundary(state: SimulatorState): boolean {
  return state.now >= state.lastFrameAt + state.frameInterval;
}

/**
 * Mark render as pending.
 * Used when task effects modify DOM-like state.
 * 
 * @param state - Current simulator state
 * @returns New state with renderPending set to true
 */
export function invalidateRender(state: SimulatorState): SimulatorState {
  return {
    ...state,
    renderPending: true,
  };
}
