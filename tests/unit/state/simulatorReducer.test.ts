/**
 * Tests for simulator reducer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState } from '@/core/simulator';
import { simulatorReducer } from '@/state/simulatorReducer';
import { stepForward, stepBack, reset, loadScenario, jumpToStep } from '@/state/actions';
import type { SimulatorStateWithHistory } from '@/state/types';

describe('simulatorReducer', () => {
  let initialState: SimulatorStateWithHistory;

  beforeEach(() => {
    initialState = {
      ...createInitialState(),
      history: [],
    };
  });

  describe('STEP_FORWARD', () => {
    it('should advance simulation by one tick', () => {
      const action = stepForward();
      const newState = simulatorReducer(initialState, action);

      // Should increment step index
      expect(newState.stepIndex).toBe(initialState.stepIndex + 1);
      
      // Should add snapshot to history
      expect(newState.history.length).toBe(1);
      expect(newState.history[0].stepIndex).toBe(initialState.stepIndex);
    });

    it('should maintain immutability', () => {
      const action = stepForward();
      const newState = simulatorReducer(initialState, action);

      // Should return new state object
      expect(newState).not.toBe(initialState);
      
      // Original state should be unchanged
      expect(initialState.stepIndex).toBe(0);
      expect(initialState.history.length).toBe(0);
    });

    it('should enforce history bounds at 5000 snapshots', () => {
      // Create state with 5000 snapshots
      let state: SimulatorStateWithHistory = {
        ...initialState,
        history: Array.from({ length: 5000 }, (_, i) => ({
          stepIndex: i,
          state: { ...initialState, stepIndex: i },
        })),
      };

      const action = stepForward();
      const newState = simulatorReducer(state, action);

      // Should still have 5000 snapshots (oldest removed)
      expect(newState.history.length).toBe(5000);
      
      // First snapshot should be step 1 (step 0 was removed)
      expect(newState.history[0].stepIndex).toBe(1);
      
      // Last snapshot should be the current state (before stepping forward)
      expect(newState.history[newState.history.length - 1].stepIndex).toBe(state.stepIndex);
    });
  });

  describe('STEP_BACK', () => {
    it('should restore previous state from history', () => {
      // Advance twice
      let state = simulatorReducer(initialState, stepForward());
      state = simulatorReducer(state, stepForward());

      const stepIndexBeforeBack = state.stepIndex;

      // Step back once
      const newState = simulatorReducer(state, stepBack());

      // Should have gone back one step
      expect(newState.stepIndex).toBeLessThan(stepIndexBeforeBack);
      
      // History should have one less entry
      expect(newState.history.length).toBe(state.history.length - 1);
    });

    it('should do nothing if no history exists', () => {
      const action = stepBack();
      const newState = simulatorReducer(initialState, action);

      // State should be unchanged
      expect(newState.stepIndex).toBe(initialState.stepIndex);
      expect(newState.history.length).toBe(0);
    });

    it('should maintain immutability', () => {
      let state = simulatorReducer(initialState, stepForward());
      const historyLengthBefore = state.history.length;

      const newState = simulatorReducer(state, stepBack());

      // Should return new state object
      expect(newState).not.toBe(state);
      
      // Original state should be unchanged
      expect(state.history.length).toBe(historyLengthBefore);
    });
  });

  describe('RESET', () => {
    it('should restore initial state', () => {
      // Advance several times
      let state = initialState;
      for (let i = 0; i < 5; i++) {
        state = simulatorReducer(state, stepForward());
      }

      expect(state.stepIndex).toBeGreaterThan(0);

      // Reset
      const newState = simulatorReducer(state, reset());

      // Should be back to initial step index
      expect(newState.stepIndex).toBe(0);
      
      // Should keep only the initial snapshot in history
      expect(newState.history.length).toBe(1);
    });

    it('should handle reset with no history', () => {
      const newState = simulatorReducer(initialState, reset());

      // Should remain at step 0
      expect(newState.stepIndex).toBe(0);
    });
  });

  describe('LOAD_SCENARIO', () => {
    it('should load new scenario state', () => {
      const customState = {
        ...createInitialState(),
        now: 1000,
        stepIndex: 10,
      };

      const action = loadScenario(customState);
      const newState = simulatorReducer(initialState, action);

      // Should have loaded custom state
      expect(newState.now).toBe(1000);
      expect(newState.stepIndex).toBe(10);
      
      // Should have added initial snapshot to history
      expect(newState.history.length).toBe(1);
      expect(newState.history[0].state.now).toBe(1000);
    });

    it('should clear existing history', () => {
      // Create state with history
      let state = initialState;
      for (let i = 0; i < 3; i++) {
        state = simulatorReducer(state, stepForward());
      }

      expect(state.history.length).toBe(3);

      // Load new scenario
      const customState = createInitialState();
      const action = loadScenario(customState);
      const newState = simulatorReducer(state, action);

      // History should be reset to just the new initial state
      expect(newState.history.length).toBe(1);
    });
  });

  describe('JUMP_TO_STEP', () => {
    it('should jump to specific step in history', () => {
      // Advance 5 times to build history
      let state = initialState;
      for (let i = 0; i < 5; i++) {
        state = simulatorReducer(state, stepForward());
      }

      // Jump to step 2
      const action = jumpToStep(2);
      const newState = simulatorReducer(state, action);

      // Should be at step 2
      expect(newState.stepIndex).toBe(2);
      
      // History should be trimmed to step 2
      expect(newState.history.length).toBe(3); // steps 0, 1, 2
    });

    it('should do nothing if step not found in history', () => {
      let state = simulatorReducer(initialState, stepForward());
      
      const historyLengthBefore = state.history.length;

      // Jump to non-existent step
      const action = jumpToStep(999);
      const newState = simulatorReducer(state, action);

      // State should be unchanged
      expect(newState.stepIndex).toBe(state.stepIndex);
      expect(newState.history.length).toBe(historyLengthBefore);
    });

    it('should maintain immutability', () => {
      let state = initialState;
      for (let i = 0; i < 3; i++) {
        state = simulatorReducer(state, stepForward());
      }

      const action = jumpToStep(1);
      const newState = simulatorReducer(state, action);

      // Should return new state object
      expect(newState).not.toBe(state);
    });
  });

  describe('History snapshot behavior', () => {
    it('should create deep copies in snapshots', () => {
      const action = stepForward();
      let state = simulatorReducer(initialState, action);

      // Get the snapshot's now value
      const snapshotNow = state.history[0].state.now;

      // Create another state by stepping forward again
      state = simulatorReducer(state, stepForward());

      // The first snapshot should still have the original value
      expect(state.history[0].state.now).toBe(snapshotNow);
      expect(state.history[0].state.now).toBe(initialState.now);
    });

    it('should not include history in snapshots (avoid circular references)', () => {
      let state = initialState;
      state = simulatorReducer(state, stepForward());
      state = simulatorReducer(state, stepForward());

      // Check that snapshots don't contain history property
      const snapshot = state.history[0];
      expect(snapshot.state).toBeDefined();
      expect('history' in snapshot.state).toBe(false);
    });
  });
});
