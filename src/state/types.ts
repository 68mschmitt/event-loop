/**
 * State management types for the event loop visualizer.
 * Defines actions, state extensions, and reducer types.
 */

import type { SimulatorState } from '@/core/types';

/**
 * Simulator actions
 */
export type SimulatorAction =
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACK' }
  | { type: 'RESET' }
  | { type: 'LOAD_SCENARIO'; payload: { state: SimulatorState } }
  | { type: 'JUMP_TO_STEP'; payload: { stepIndex: number } };

/**
 * Extended simulator state with history
 */
export interface SimulatorStateWithHistory extends SimulatorState {
  history: SimulatorSnapshot[];
}

/**
 * Snapshot of simulator state for time-travel
 */
export interface SimulatorSnapshot {
  stepIndex: number;
  state: SimulatorState;
}
