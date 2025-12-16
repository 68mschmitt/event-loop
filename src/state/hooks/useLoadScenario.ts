/**
 * Hook for loading scenarios
 */

import { useCallback } from 'react';
import { useSimulatorDispatch } from '../SimulatorContext';
import { loadScenario as loadScenarioAction } from '../actions';
import type { SimulatorState } from '@/core/types';

/**
 * Hook to load a scenario
 * @returns A callback function that loads a new scenario
 */
export function useLoadScenario() {
  const dispatch = useSimulatorDispatch();
  
  return useCallback((state: SimulatorState) => {
    dispatch(loadScenarioAction(state));
  }, [dispatch]);
}
