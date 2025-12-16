/**
 * Initial state creation for the simulator.
 * Factory functions for creating fresh simulator states.
 */

import type { SimulatorState } from '@/core/types/simulator';

/**
 * Options for creating initial state.
 */
export interface CreateInitialStateOptions {
  /**
   * Frame interval in milliseconds (e.g., 16ms for 60fps, 33ms for 30fps).
   * Default: 16ms (60fps)
   */
  frameInterval?: number;
  /**
   * Initial logical time. Default: 0
   */
  now?: number;
  /**
   * Whether a render is initially pending. Default: false
   */
  renderPending?: boolean;
}

/**
 * Create a fresh simulator state with default values.
 * All queues and stacks are empty, counters at zero.
 * 
 * @param options - Optional configuration
 * @returns A new SimulatorState ready for use
 * 
 * @example
 * ```typescript
 * const state = createInitialState();
 * const state60fps = createInitialState({ frameInterval: 16 });
 * const state30fps = createInitialState({ frameInterval: 33 });
 * ```
 */
export function createInitialState(
  options: CreateInitialStateOptions = {}
): SimulatorState {
  return {
    // Core structures (empty)
    callStack: [],
    webApis: new Map(),
    macroQueue: [],
    microQueue: [],
    rafQueue: [],

    // Time and sequencing
    now: options.now ?? 0,
    stepIndex: 0,
    enqueueCounter: 0,

    // Frame timing
    frameInterval: options.frameInterval ?? 16, // Default 60fps
    frameCounter: 0,
    renderPending: options.renderPending ?? false,
    lastFrameAt: 0,

    // Logs
    log: [],
  };
}
