/**
 * Animation Types and Interfaces
 * 
 * Defines all animation-related types including change detection,
 * animation queue items, and animation states.
 */

import type { Task, TaskState } from '../core/types/task';
import type { SimulatorState } from '../core/types/simulator';

/**
 * Types of changes that can trigger animations
 */
export type ChangeType =
  | 'TASK_CREATED'      // New task added to a queue
  | 'TASK_MOVED'        // Task moved between queues/regions
  | 'TASK_STATE'        // Task state changed (queued → running → completed)
  | 'STACK_PUSH'        // Task pushed to call stack
  | 'STACK_POP'         // Task popped from call stack
  | 'CONSOLE_LOG'       // Console output generated
  | 'TICK_START'        // Tick started
  | 'TICK_END';         // Tick completed

/**
 * Detected state change that needs animation
 */
export interface StateChange {
  type: ChangeType;
  taskId: string;
  task?: Task;
  from?: TaskLocation;
  to?: TaskLocation;
  timestamp: number;
}

/**
 * Location of a task within the simulator
 */
export interface TaskLocation {
  region: TaskRegion;
  index: number;
  state: TaskState;
}

/**
 * Regions where tasks can exist
 */
export type TaskRegion =
  | 'stack'
  | 'webapis'
  | 'macro'
  | 'micro'
  | 'raf'
  | 'console'
  | 'completed';

/**
 * Animation queue item with timing information
 */
export interface AnimationQueueItem {
  id: string;
  change: StateChange;
  duration: number;        // Base duration in ms (any positive number)
  delay: number;           // Delay before animation starts (any non-negative number)
  priority: number;        // Higher priority animations go first (0-10, any number)
  resolve?: () => void;    // Promise resolver for sequential execution
}

/**
 * Animation performance mode
 */
export type AnimationMode = 'FULL' | 'REDUCED' | 'DISABLED';

/**
 * Animation settings
 */
export interface AnimationSettings {
  mode: AnimationMode;
  speed: number;              // Speed multiplier (0.25x - 4x)
  preferReducedMotion: boolean;
  autoAdjustPerformance: boolean;
}

/**
 * Animation performance metrics
 */
export interface AnimationMetrics {
  fps: number;
  activeAnimations: number;
  queuedAnimations: number;
  droppedFrames: number;
  lastFrameTime: number;
}

/**
 * Animation event callbacks
 */
export interface AnimationCallbacks {
  onAnimationStart?: (item: AnimationQueueItem) => void;
  onAnimationComplete?: (item: AnimationQueueItem) => void;
  onAnimationError?: (error: Error, item: AnimationQueueItem) => void;
  onQueueEmpty?: () => void;
}

/**
 * Extract task location from simulator state
 */
export function getTaskLocation(
  taskId: string,
  state: SimulatorState
): TaskLocation | null {
  // Check call stack
  const stackIndex = state.callStack.findIndex(f => f.task.id === taskId);
  if (stackIndex !== -1) {
    const frame = state.callStack[stackIndex];
    if (frame?.task) {
      return {
        region: 'stack',
        index: stackIndex,
        state: frame.task.state
      };
    }
  }

  // Check web APIs
  const webapi = state.webApis.get(taskId);
  if (webapi) {
    const index = Array.from(state.webApis.keys()).indexOf(taskId);
    return {
      region: 'webapis',
      index,
      state: webapi.payloadTask.state
    };
  }

  // Check macro queue
  const macroIndex = state.macroQueue.findIndex(t => t.id === taskId);
  if (macroIndex !== -1) {
    const task = state.macroQueue[macroIndex];
    if (task) {
      return {
        region: 'macro',
        index: macroIndex,
        state: task.state
      };
    }
  }

  // Check micro queue
  const microIndex = state.microQueue.findIndex(t => t.id === taskId);
  if (microIndex !== -1) {
    const task = state.microQueue[microIndex];
    if (task) {
      return {
        region: 'micro',
        index: microIndex,
        state: task.state
      };
    }
  }

  // Check RAF queue
  const rafIndex = state.rafQueue.findIndex(t => t.id === taskId);
  if (rafIndex !== -1) {
    const task = state.rafQueue[rafIndex];
    if (task) {
      return {
        region: 'raf',
        index: rafIndex,
        state: task.state
      };
    }
  }

  return null;
}

/**
 * Get all tasks from simulator state as a flat map
 */
export function getAllTasks(state: SimulatorState): Map<string, Task> {
  const tasks = new Map<string, Task>();

  state.callStack.forEach(frame => {
    if (frame?.task) {
      tasks.set(frame.task.id, frame.task);
    }
  });
  state.webApis.forEach(op => {
    if (op?.payloadTask) {
      tasks.set(op.payloadTask.id, op.payloadTask);
    }
  });
  state.macroQueue.forEach(task => {
    if (task) {
      tasks.set(task.id, task);
    }
  });
  state.microQueue.forEach(task => {
    if (task) {
      tasks.set(task.id, task);
    }
  });
  state.rafQueue.forEach(task => {
    if (task) {
      tasks.set(task.id, task);
    }
  });

  return tasks;
}
