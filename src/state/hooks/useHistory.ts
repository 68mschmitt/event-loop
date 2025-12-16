/**
 * Hook for accessing and manipulating history
 */

import { useCallback } from 'react';
import { useSimulatorDispatch } from '../SimulatorContext';
import { useSimulatorSelector } from './useSimulator';
import { jumpToStep as jumpToStepAction, reset as resetAction } from '../actions';
import { canStepBack, getHistorySize, isHistoryFull } from '../history';
import type { SimulatorSnapshot } from '../types';

/**
 * Hook to access simulation history
 */
export function useHistory() {
  const dispatch = useSimulatorDispatch();
  
  const history = useSimulatorSelector((state) => state.history);
  const canGoBack = useSimulatorSelector((state) => canStepBack(state.history));
  const historySize = useSimulatorSelector((state) => getHistorySize(state.history));
  const isAtCapacity = useSimulatorSelector((state) => isHistoryFull(state.history));
  
  const jumpToStep = useCallback((stepIndex: number) => {
    dispatch(jumpToStepAction(stepIndex));
  }, [dispatch]);
  
  const reset = useCallback(() => {
    dispatch(resetAction());
  }, [dispatch]);
  
  return {
    history,
    canGoBack,
    historySize,
    isAtCapacity,
    jumpToStep,
    reset,
  };
}

/**
 * Hook to get available step indices from history
 */
export function useHistorySteps(): number[] {
  return useSimulatorSelector((state) => 
    state.history.map((snapshot: SimulatorSnapshot) => snapshot.stepIndex)
  );
}
