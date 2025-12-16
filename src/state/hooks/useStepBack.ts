/**
 * Hook for stepping backward in the simulation
 */

import { useCallback } from 'react';
import { useSimulatorDispatch } from '../SimulatorContext';
import { useSimulatorSelector } from './useSimulator';
import { stepBack as stepBackAction } from '../actions';
import { canStepBack as canStepBackUtil } from '../history';

/**
 * Hook to step backward in the simulation
 * @returns An object with stepBack callback and canStepBack boolean
 */
export function useStepBack() {
  const dispatch = useSimulatorDispatch();
  const canStepBack = useSimulatorSelector((state) => canStepBackUtil(state.history));
  
  const stepBack = useCallback(() => {
    if (canStepBack) {
      dispatch(stepBackAction());
    }
  }, [dispatch, canStepBack]);
  
  return {
    stepBack,
    canStepBack,
  };
}
