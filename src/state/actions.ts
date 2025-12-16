/**
 * Action creators for simulator state management.
 * These provide type-safe ways to create actions.
 */

import type { SimulatorState } from '@/core/types';
import type { SimulatorAction } from './types';

/**
 * Create a STEP_FORWARD action to advance the simulation by one tick
 */
export function stepForward(): SimulatorAction {
  return { type: 'STEP_FORWARD' };
}

/**
 * Create a STEP_BACK action to go back one step in history
 */
export function stepBack(): SimulatorAction {
  return { type: 'STEP_BACK' };
}

/**
 * Create a RESET action to return to initial state
 */
export function reset(): SimulatorAction {
  return { type: 'RESET' };
}

/**
 * Create a LOAD_SCENARIO action to load a new scenario
 */
export function loadScenario(state: SimulatorState): SimulatorAction {
  return { type: 'LOAD_SCENARIO', payload: { state } };
}

/**
 * Create a JUMP_TO_STEP action to jump to a specific step in history
 */
export function jumpToStep(stepIndex: number): SimulatorAction {
  return { type: 'JUMP_TO_STEP', payload: { stepIndex } };
}
