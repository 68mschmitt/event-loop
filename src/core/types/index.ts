/**
 * Barrel export for all type definitions.
 * Central import location for all types used throughout the simulator.
 */

// Task types
export type {
  Task,
  SyncTask,
  TimerTask,
  IntervalTask,
  MicrotaskTask,
  PromiseTask,
  AsyncContinuationTask,
  FetchTask,
  DomEventTask,
  RafTask,
  TaskEffect,
} from './task';

export {
  TaskType,
  TaskState,
  isSyncTask,
  isTimerTask,
  isIntervalTask,
  isMicrotaskTask,
  isPromiseTask,
  isAsyncContinuationTask,
  isFetchTask,
  isDomEventTask,
  isRafTask,
} from './task';

// Queue types
export type { Queue, Stack } from './queue';
export { QueueType } from './queue';

// Simulator types
export type {
  SimulatorState,
  Frame,
  LogEntry,
  SimulationSnapshot,
} from './simulator';

// Web API types
export type { WebApiOperation } from './webapi';
export { WebApiType } from './webapi';

// Scenario types
export type {
  ScenarioDefinition,
  ScenarioTask,
  ScenarioTaskType,
  ScenarioMetadata,
  ScenarioConfig,
  ScenarioDifficulty,
  ScenarioValidationError,
  ScenarioValidationResult,
} from './scenario';
