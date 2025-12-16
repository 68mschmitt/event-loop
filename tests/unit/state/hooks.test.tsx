/**
 * Tests for custom hooks
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createInitialState } from '@/core/simulator';
import { SimulatorProvider } from '@/state/SimulatorContext';
import { 
  useSimulator, 
  useStepForward, 
  useStepBack, 
  useHistory,
  useIsSimulationComplete,
  useCurrentStep,
  useCurrentTime,
  useLoadScenario,
} from '@/state/hooks';
import type { ReactNode } from 'react';

// Wrapper component for hook tests
function Wrapper({ children }: { children: ReactNode }) {
  return <SimulatorProvider>{children}</SimulatorProvider>;
}

describe('custom hooks', () => {
  describe('useSimulator', () => {
    it('should return simulator state', () => {
      const { result } = renderHook(() => useSimulator(), { wrapper: Wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.stepIndex).toBe(0);
      expect(result.current.now).toBe(0);
    });
  });

  describe('useStepForward', () => {
    it('should advance simulation by one step', () => {
      const { result } = renderHook(() => ({
        simulator: useSimulator(),
        stepForward: useStepForward(),
      }), { wrapper: Wrapper });

      const initialStep = result.current.simulator.stepIndex;

      act(() => {
        result.current.stepForward();
      });

      expect(result.current.simulator.stepIndex).toBe(initialStep + 1);
    });

    it('should return a stable callback', () => {
      const { result, rerender } = renderHook(() => useStepForward(), { wrapper: Wrapper });

      const firstCallback = result.current;
      rerender();
      const secondCallback = result.current;

      expect(firstCallback).toBe(secondCallback);
    });
  });

  describe('useStepBack', () => {
    it('should step back when history exists', () => {
      const { result } = renderHook(() => ({
        simulator: useSimulator(),
        stepForward: useStepForward(),
        stepBack: useStepBack(),
      }), { wrapper: Wrapper });

      // Step forward twice
      act(() => {
        result.current.stepForward();
        result.current.stepForward();
      });

      const stepAfterForward = result.current.simulator.stepIndex;

      // Step back once
      act(() => {
        result.current.stepBack.stepBack();
      });

      expect(result.current.simulator.stepIndex).toBeLessThan(stepAfterForward);
    });

    it('should indicate when stepping back is possible', () => {
      const { result } = renderHook(() => ({
        stepForward: useStepForward(),
        stepBack: useStepBack(),
      }), { wrapper: Wrapper });

      // Initially can't step back
      expect(result.current.stepBack.canStepBack).toBe(false);

      // Step forward
      act(() => {
        result.current.stepForward();
      });

      // Now can step back
      expect(result.current.stepBack.canStepBack).toBe(true);
    });

    it('should not step back when no history exists', () => {
      const { result } = renderHook(() => ({
        simulator: useSimulator(),
        stepBack: useStepBack(),
      }), { wrapper: Wrapper });

      const initialStep = result.current.simulator.stepIndex;

      act(() => {
        result.current.stepBack.stepBack();
      });

      // Should remain at same step
      expect(result.current.simulator.stepIndex).toBe(initialStep);
    });
  });

  describe('useHistory', () => {
    it('should provide history access', () => {
      const { result } = renderHook(() => useHistory(), { wrapper: Wrapper });

      expect(result.current.history).toBeDefined();
      expect(result.current.historySize).toBe(0);
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.isAtCapacity).toBe(false);
    });

    it('should track history as simulation progresses', () => {
      const { result } = renderHook(() => ({
        history: useHistory(),
        stepForward: useStepForward(),
      }), { wrapper: Wrapper });

      // Step forward 3 times
      act(() => {
        result.current.stepForward();
        result.current.stepForward();
        result.current.stepForward();
      });

      expect(result.current.history.historySize).toBe(3);
      expect(result.current.history.canGoBack).toBe(true);
    });

    it('should allow jumping to a specific step', () => {
      const { result } = renderHook(() => ({
        simulator: useSimulator(),
        stepForward: useStepForward(),
        history: useHistory(),
      }), { wrapper: Wrapper });

      // Step forward 5 times
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.stepForward();
        }
      });

      // Jump to step 2
      act(() => {
        result.current.history.jumpToStep(2);
      });

      expect(result.current.simulator.stepIndex).toBe(2);
    });

    it('should allow reset to initial state', () => {
      const { result } = renderHook(() => ({
        simulator: useSimulator(),
        stepForward: useStepForward(),
        history: useHistory(),
      }), { wrapper: Wrapper });

      // Step forward several times
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.stepForward();
        }
      });

      expect(result.current.simulator.stepIndex).toBeGreaterThan(0);

      // Reset
      act(() => {
        result.current.history.reset();
      });

      expect(result.current.simulator.stepIndex).toBe(0);
    });
  });

  describe('useIsSimulationComplete', () => {
    it('should return true when simulation has no more tasks', () => {
      const { result } = renderHook(() => useIsSimulationComplete(), { wrapper: Wrapper });

      // Initial state has no tasks
      expect(result.current).toBe(true);
    });
  });

  describe('useCurrentStep', () => {
    it('should return current step index', () => {
      const { result } = renderHook(() => ({
        currentStep: useCurrentStep(),
        stepForward: useStepForward(),
      }), { wrapper: Wrapper });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('useCurrentTime', () => {
    it('should return current time', () => {
      const { result } = renderHook(() => useCurrentTime(), { wrapper: Wrapper });

      expect(result.current).toBe(0);
    });
  });

  describe('useLoadScenario', () => {
    it('should load a new scenario', () => {
      const { result } = renderHook(() => ({
        simulator: useSimulator(),
        loadScenario: useLoadScenario(),
      }), { wrapper: Wrapper });

      const customState = {
        ...createInitialState(),
        now: 1000,
        stepIndex: 10,
      };

      act(() => {
        result.current.loadScenario(customState);
      });

      expect(result.current.simulator.now).toBe(1000);
      expect(result.current.simulator.stepIndex).toBe(10);
    });

    it('should reset history when loading new scenario', () => {
      const { result } = renderHook(() => ({
        history: useHistory(),
        stepForward: useStepForward(),
        loadScenario: useLoadScenario(),
      }), { wrapper: Wrapper });

      // Build up some history
      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.stepForward();
        }
      });

      expect(result.current.history.historySize).toBe(3);

      // Load new scenario
      act(() => {
        result.current.loadScenario(createInitialState());
      });

      // History should be reset (only initial state)
      expect(result.current.history.historySize).toBe(1);
    });
  });
});
