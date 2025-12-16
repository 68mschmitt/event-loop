/**
 * Hook to access simulator state
 */

import { useMemo } from 'react';
import { useSimulatorState } from '../SimulatorContext';

/**
 * Hook to access the full simulator state
 */
export function useSimulator() {
  return useSimulatorState();
}

/**
 * Hook to access specific parts of simulator state with memoization
 */
export function useSimulatorSelector<T>(selector: (state: ReturnType<typeof useSimulatorState>) => T): T {
  const state = useSimulatorState();
  return useMemo(() => selector(state), [state, selector]);
}

/**
 * Hook to check if simulation is complete (no more tasks)
 */
export function useIsSimulationComplete(): boolean {
  return useSimulatorSelector((state) => {
    return (
      state.callStack.length === 0 &&
      state.macroQueue.length === 0 &&
      state.microQueue.length === 0 &&
      state.rafQueue.length === 0 &&
      state.webApis.size === 0
    );
  });
}

/**
 * Hook to get current step index
 */
export function useCurrentStep(): number {
  return useSimulatorSelector((state) => state.stepIndex);
}

/**
 * Hook to get current time
 */
export function useCurrentTime(): number {
  return useSimulatorSelector((state) => state.now);
}
