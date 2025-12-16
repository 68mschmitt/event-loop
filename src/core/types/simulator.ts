/**
 * Simulator state types.
 * Defines the complete state shape of the event loop simulator.
 */

import type { Task } from './task';
import type { WebApiOperation } from './webapi';

/**
 * A call stack frame representing a currently executing task.
 */
export interface Frame {
  task: Task;
  startedAt: number;
  stepsRemaining: number;
}

/**
 * A log entry produced by task execution or system events.
 */
export interface LogEntry {
  timestamp: number;
  type: 'task-start' | 'task-complete' | 'enqueue' | 'render' | 'user';
  message: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Complete state of the event loop simulator.
 */
export interface SimulatorState {
  // Core structures
  callStack: Frame[];
  webApis: Map<string, WebApiOperation>;
  macroQueue: Task[];
  microQueue: Task[];
  rafQueue: Task[];

  // Time and sequencing
  now: number;
  stepIndex: number;
  enqueueCounter: number;

  // Frame timing
  frameInterval: number;
  frameCounter: number;
  renderPending: boolean;
  lastFrameAt: number;

  // History and logging
  log: LogEntry[];
}

/**
 * Snapshot of simulator state for history/time-travel.
 */
export interface SimulationSnapshot {
  stepIndex: number;
  state: SimulatorState;
}
