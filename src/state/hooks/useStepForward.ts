/**
 * Hook for stepping forward in the simulation
 */

import { useCallback } from 'react';
import { useSimulatorDispatch } from '../SimulatorContext';
import { stepForward as stepForwardAction } from '../actions';

/**
 * Hook to step forward in the simulation
 * @returns A callback function that steps the simulation forward
 */
export function useStepForward() {
  const dispatch = useSimulatorDispatch();
  
  return useCallback(() => {
    dispatch(stepForwardAction());
  }, [dispatch]);
}
