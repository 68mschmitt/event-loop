/**
 * Tests for history utilities
 */

import { describe, it, expect } from 'vitest';
import { createInitialState } from '@/core/simulator';
import {
  createSnapshot,
  addSnapshotToHistory,
  getSnapshotAtStep,
  getLatestSnapshot,
  trimHistoryToStep,
  clearHistory,
  canStepBack,
  isHistoryFull,
  getHistorySize,
  restoreFromSnapshot,
  MAX_HISTORY_SIZE,
} from '@/state/history';
import type { SimulatorSnapshot } from '@/state/types';

describe('history utilities', () => {
  describe('createSnapshot', () => {
    it('should create a snapshot with step index', () => {
      const state = createInitialState();
      const snapshot = createSnapshot(state, 5);

      expect(snapshot.stepIndex).toBe(5);
      expect(snapshot.state).toBeDefined();
    });

    it('should create a deep copy', () => {
      const state = createInitialState();
      state.now = 1000;
      
      const snapshot = createSnapshot(state, 0);
      
      // Modify original state
      state.now = 2000;
      
      // Snapshot should not be affected
      expect(snapshot.state.now).toBe(1000);
    });

    it('should exclude history property from snapshot', () => {
      const stateWithHistory: any = {
        ...createInitialState(),
        history: [{ stepIndex: 0, state: createInitialState() }],
      };
      
      const snapshot = createSnapshot(stateWithHistory, 0);
      
      expect('history' in snapshot.state).toBe(false);
    });

    it('should preserve Map objects in snapshot', () => {
      const state = createInitialState();
      const snapshot = createSnapshot(state, 0);

      // webApis should be preserved (converted and restored)
      expect(snapshot.state.webApis).toBeDefined();
    });
  });

  describe('addSnapshotToHistory', () => {
    it('should add snapshot to history', () => {
      const history: SimulatorSnapshot[] = [];
      const snapshot = createSnapshot(createInitialState(), 0);

      const newHistory = addSnapshotToHistory(history, snapshot);

      expect(newHistory.length).toBe(1);
      expect(newHistory[0]).toBe(snapshot);
    });

    it('should return a new array', () => {
      const history: SimulatorSnapshot[] = [];
      const snapshot = createSnapshot(createInitialState(), 0);

      const newHistory = addSnapshotToHistory(history, snapshot);

      expect(newHistory).not.toBe(history);
    });

    it('should enforce MAX_HISTORY_SIZE limit', () => {
      // Create history at capacity
      const history: SimulatorSnapshot[] = Array.from(
        { length: MAX_HISTORY_SIZE },
        (_, i) => createSnapshot(createInitialState(), i)
      );

      // Add one more
      const newSnapshot = createSnapshot(createInitialState(), MAX_HISTORY_SIZE);
      const newHistory = addSnapshotToHistory(history, newSnapshot);

      // Should still be at capacity
      expect(newHistory.length).toBe(MAX_HISTORY_SIZE);
      
      // First snapshot should be removed (was step 0, now step 1)
      expect(newHistory[0].stepIndex).toBe(1);
      
      // Last snapshot should be the new one
      expect(newHistory[newHistory.length - 1].stepIndex).toBe(MAX_HISTORY_SIZE);
    });
  });

  describe('getSnapshotAtStep', () => {
    it('should find snapshot by step index', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
        createSnapshot(createInitialState(), 1),
        createSnapshot(createInitialState(), 2),
      ];

      const snapshot = getSnapshotAtStep(history, 1);

      expect(snapshot).toBeDefined();
      expect(snapshot!.stepIndex).toBe(1);
    });

    it('should return undefined if not found', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
      ];

      const snapshot = getSnapshotAtStep(history, 99);

      expect(snapshot).toBeUndefined();
    });
  });

  describe('getLatestSnapshot', () => {
    it('should return the last snapshot', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
        createSnapshot(createInitialState(), 1),
        createSnapshot(createInitialState(), 2),
      ];

      const latest = getLatestSnapshot(history);

      expect(latest).toBeDefined();
      expect(latest!.stepIndex).toBe(2);
    });

    it('should return undefined for empty history', () => {
      const history: SimulatorSnapshot[] = [];

      const latest = getLatestSnapshot(history);

      expect(latest).toBeUndefined();
    });
  });

  describe('trimHistoryToStep', () => {
    it('should trim history to specified step (inclusive)', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
        createSnapshot(createInitialState(), 1),
        createSnapshot(createInitialState(), 2),
        createSnapshot(createInitialState(), 3),
      ];

      const trimmed = trimHistoryToStep(history, 1);

      expect(trimmed.length).toBe(2);
      expect(trimmed[0].stepIndex).toBe(0);
      expect(trimmed[1].stepIndex).toBe(1);
    });

    it('should return unchanged history if step not found', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
        createSnapshot(createInitialState(), 1),
      ];

      const trimmed = trimHistoryToStep(history, 99);

      expect(trimmed.length).toBe(history.length);
    });
  });

  describe('clearHistory', () => {
    it('should return an empty array', () => {
      const history = clearHistory();

      expect(history).toEqual([]);
      expect(history.length).toBe(0);
    });
  });

  describe('canStepBack', () => {
    it('should return true if history has entries', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
      ];

      expect(canStepBack(history)).toBe(true);
    });

    it('should return false if history is empty', () => {
      const history: SimulatorSnapshot[] = [];

      expect(canStepBack(history)).toBe(false);
    });
  });

  describe('isHistoryFull', () => {
    it('should return true if at MAX_HISTORY_SIZE', () => {
      const history: SimulatorSnapshot[] = Array.from(
        { length: MAX_HISTORY_SIZE },
        (_, i) => createSnapshot(createInitialState(), i)
      );

      expect(isHistoryFull(history)).toBe(true);
    });

    it('should return false if below MAX_HISTORY_SIZE', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
      ];

      expect(isHistoryFull(history)).toBe(false);
    });
  });

  describe('getHistorySize', () => {
    it('should return the number of snapshots', () => {
      const history: SimulatorSnapshot[] = [
        createSnapshot(createInitialState(), 0),
        createSnapshot(createInitialState(), 1),
        createSnapshot(createInitialState(), 2),
      ];

      expect(getHistorySize(history)).toBe(3);
    });

    it('should return 0 for empty history', () => {
      const history: SimulatorSnapshot[] = [];

      expect(getHistorySize(history)).toBe(0);
    });
  });

  describe('restoreFromSnapshot', () => {
    it('should restore state from snapshot', () => {
      const originalState = createInitialState();
      originalState.now = 1000;
      originalState.stepIndex = 5;
      
      const snapshot = createSnapshot(originalState, 5);
      const restoredState = restoreFromSnapshot(snapshot);

      expect(restoredState.now).toBe(1000);
      expect(restoredState.stepIndex).toBe(5);
    });

    it('should restore Map objects', () => {
      const state = createInitialState();
      const snapshot = createSnapshot(state, 0);
      
      const restoredState = restoreFromSnapshot(snapshot);

      expect(restoredState.webApis).toBeDefined();
      expect(restoredState.webApis instanceof Map).toBe(true);
    });

    it('should create a new state object', () => {
      const snapshot = createSnapshot(createInitialState(), 0);
      
      const restored1 = restoreFromSnapshot(snapshot);
      const restored2 = restoreFromSnapshot(snapshot);

      // Should be equal but not the same object
      expect(restored1).not.toBe(restored2);
      expect(restored1.stepIndex).toBe(restored2.stepIndex);
    });
  });
});
