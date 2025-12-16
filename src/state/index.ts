/**
 * Barrel export for state management module
 */

export { SimulatorProvider, useSimulatorContext, useSimulatorState, useSimulatorDispatch } from './SimulatorContext';
export { simulatorReducer } from './simulatorReducer';
export * from './actions';
export * from './history';
export * from './hooks';
export type { SimulatorAction, SimulatorStateWithHistory, SimulatorSnapshot } from './types';
