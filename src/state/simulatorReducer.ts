/**
 * Simulator reducer that wraps the Phase 1 core simulator with React state management.
 * Uses Immer for immutable updates.
 */

import { produce, enableMapSet } from 'immer';
import { tick } from '@/core/simulator';
import { 
  createSnapshot, 
  addSnapshotToHistory, 
  restoreFromSnapshot,
  trimHistoryToStep,
  clearHistory,
} from './history';
import type { SimulatorAction, SimulatorStateWithHistory } from './types';

// Enable MapSet support in Immer for Map and Set structures
enableMapSet();

/**
 * Simulator reducer - handles all simulator actions
 */
export function simulatorReducer(
  state: SimulatorStateWithHistory,
  action: SimulatorAction
): SimulatorStateWithHistory {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'STEP_FORWARD': {
        // Check if simulation is complete before advancing
        const isComplete = (
          draft.callStack.length === 0 &&
          draft.microQueue.length === 0 &&
          draft.macroQueue.length === 0 &&
          draft.rafQueue.length === 0 &&
          draft.webApis.size === 0
        );
        
        if (isComplete) {
          // Don't advance if simulation is already complete
          break;
        }
        
        // Create snapshot of current state before advancing
        const snapshot = createSnapshot(draft, draft.stepIndex);
        draft.history = addSnapshotToHistory(draft.history, snapshot);
        
        // Advance simulation using Phase 1 tick function
        const nextState = tick(draft);
        
        // Update draft with new state
        Object.assign(draft, nextState);
        break;
      }

      case 'STEP_BACK': {
        // Can't go back if no history
        if (draft.history.length === 0) {
          break;
        }
        
        // Remove the last snapshot and restore it
        const lastSnapshot = draft.history.pop()!;
        const restoredState = restoreFromSnapshot(lastSnapshot);
        
        // Preserve history and restore other state
        const historyBackup = draft.history;
        Object.assign(draft, restoredState);
        draft.history = historyBackup;
        break;
      }

      case 'RESET': {
        // Get the very first snapshot (initial state)
        if (draft.history.length > 0) {
          const firstSnapshot = draft.history[0];
          if (firstSnapshot) {
            const restoredState = restoreFromSnapshot(firstSnapshot);
            
            // Preserve only the initial snapshot
            const initialHistory = [firstSnapshot];
            Object.assign(draft, restoredState);
            draft.history = initialHistory;
          }
        }
        break;
      }

      case 'LOAD_SCENARIO': {
        // Load a new scenario
        const { state: newState } = action.payload;
        
        // Copy new state
        Object.assign(draft, newState);
        
        // Clear history and store initial state
        draft.history = clearHistory();
        const snapshot = createSnapshot(draft, draft.stepIndex);
        draft.history = addSnapshotToHistory(draft.history, snapshot);
        break;
      }

      case 'JUMP_TO_STEP': {
        const { stepIndex } = action.payload;
        
        // Find the snapshot with the requested stepIndex
        const snapshot = draft.history.find((s) => s.stepIndex === stepIndex);
        
        if (snapshot) {
          const restoredState = restoreFromSnapshot(snapshot);
          
          // Trim history to this point
          const trimmedHistory = trimHistoryToStep(draft.history, stepIndex);
          
          // Restore state and history
          Object.assign(draft, restoredState);
          draft.history = trimmedHistory;
        }
        break;
      }

      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = action;
        return _exhaustive;
    }
  });
}
