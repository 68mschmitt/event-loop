/**
 * History management utilities for time-travel debugging.
 * Provides functions to manage snapshot storage and restoration.
 */

import type { SimulatorState } from '@/core/types';
import type { SimulatorSnapshot, SimulatorStateWithHistory } from './types';

/**
 * Maximum number of snapshots to store in history
 */
export const MAX_HISTORY_SIZE = 5000;

/**
 * Create a deep copy snapshot of the current state
 */
export function createSnapshot(state: SimulatorState | SimulatorStateWithHistory, stepIndex: number): SimulatorSnapshot {
  // Exclude history property if it exists to avoid circular references
  const { history: _, ...stateToSerialize } = state as any;
  
  // Use JSON serialization for deep copy
  // This works because our state is serializable (Maps are converted to objects)
  const stateCopy = JSON.parse(JSON.stringify(stateToSerialize, replacer));
  
  return {
    stepIndex,
    state: stateCopy,
  };
}

/**
 * Custom replacer for JSON.stringify to handle Map objects
 */
function replacer(key: string, value: any): any {
  if (value instanceof Map) {
    return {
      __type: 'Map',
      entries: Array.from(value.entries()),
    };
  }
  return value;
}

/**
 * Custom reviver for JSON.parse to restore Map objects
 */
function reviver(key: string, value: any): any {
  if (value && value.__type === 'Map') {
    return new Map(value.entries);
  }
  return value;
}

/**
 * Add a snapshot to history with bounds enforcement
 */
export function addSnapshotToHistory(
  history: SimulatorSnapshot[],
  snapshot: SimulatorSnapshot
): SimulatorSnapshot[] {
  const newHistory = [...history, snapshot];
  
  // Enforce bounds - remove oldest if exceeding limit
  if (newHistory.length > MAX_HISTORY_SIZE) {
    return newHistory.slice(1);
  }
  
  return newHistory;
}

/**
 * Get snapshot at a specific step index
 */
export function getSnapshotAtStep(
  history: SimulatorSnapshot[],
  stepIndex: number
): SimulatorSnapshot | undefined {
  return history.find((snapshot) => snapshot.stepIndex === stepIndex);
}

/**
 * Get the most recent snapshot
 */
export function getLatestSnapshot(
  history: SimulatorSnapshot[]
): SimulatorSnapshot | undefined {
  return history[history.length - 1];
}

/**
 * Trim history to a specific step index (inclusive)
 */
export function trimHistoryToStep(
  history: SimulatorSnapshot[],
  stepIndex: number
): SimulatorSnapshot[] {
  const index = history.findIndex((snapshot) => snapshot.stepIndex === stepIndex);
  
  if (index === -1) {
    return history;
  }
  
  return history.slice(0, index + 1);
}

/**
 * Clear all history
 */
export function clearHistory(): SimulatorSnapshot[] {
  return [];
}

/**
 * Check if history can step back
 */
export function canStepBack(history: SimulatorSnapshot[]): boolean {
  return history.length > 0;
}

/**
 * Check if history is at capacity
 */
export function isHistoryFull(history: SimulatorSnapshot[]): boolean {
  return history.length >= MAX_HISTORY_SIZE;
}

/**
 * Get history size
 */
export function getHistorySize(history: SimulatorSnapshot[]): number {
  return history.length;
}

/**
 * Restore state from a snapshot
 */
export function restoreFromSnapshot(snapshot: SimulatorSnapshot): SimulatorState {
  // Parse and revive the state to restore Map objects
  return JSON.parse(JSON.stringify(snapshot.state), reviver);
}
