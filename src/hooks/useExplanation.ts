/**
 * useExplanation hook - generates explanations for simulator steps.
 */

import { useMemo } from 'react';
import { generateExplanation, type StepExplanation } from '@/components/panels/ExplanationPanel/explanationText';
import type { SimulatorStateWithHistory } from '@/state/types';

/**
 * Hook to generate explanation for the current step.
 * 
 * @param state - Current simulator state
 * @param history - Simulation history
 * @returns Step explanation or null if not enough history
 */
export function useExplanation(
  state: SimulatorStateWithHistory
): StepExplanation | null {
  return useMemo(() => {
    const { history, stepIndex } = state;
    
    if (history.length < 2) {
      return null;
    }

    // Get the previous and current snapshots
    const currentIndex = stepIndex;
    const prevSnapshot = history[currentIndex - 1];
    const currentSnapshot = history[currentIndex];

    if (!prevSnapshot || !currentSnapshot) {
      return null;
    }

    return generateExplanation(prevSnapshot.state, currentSnapshot.state);
  }, [state]);
}
