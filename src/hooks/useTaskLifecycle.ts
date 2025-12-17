/**
 * useTaskLifecycle hook - extracts lifecycle events for a specific task.
 */

import { useMemo } from 'react';
import type { SimulatorState, Task } from '@/core/types';
import type { SimulatorSnapshot } from '@/state/types';

/**
 * Where a task is in the system.
 */
export type TaskLocation =
  | 'created'
  | 'webapi'
  | 'macro-queue'
  | 'micro-queue'
  | 'raf-queue'
  | 'call-stack'
  | 'completed'
  | 'canceled';

/**
 * Single lifecycle event.
 */
export interface LifecycleEvent {
  stepIndex: number;
  timestamp: number; // Logical time
  state: 'pending' | 'queued' | 'running' | 'completed';
  location: TaskLocation;
  action: 'created' | 'enqueued' | 'dequeued' | 'started' | 'completed' | 'canceled';
  details?: string;
}

/**
 * Complete lifecycle of a task.
 */
export interface TaskLifecycle {
  taskId: string;
  task: Task;
  events: LifecycleEvent[];
  duration: number; // Total time from created to completed
  executionTime: number; // Time spent in call stack
  waitTime: number; // Time spent waiting
  parentTask: Task | null;
  childTasks: Task[];
}

/**
 * Hook to extract lifecycle events for a task.
 */
export function useTaskLifecycle(
  taskId: string | null,
  history: SimulatorSnapshot[]
): TaskLifecycle | null {
  return useMemo(() => {
    if (!taskId || history.length === 0) return null;

    const events: LifecycleEvent[] = [];
    let task: Task | null = null;
    let parentTask: Task | null = null;
    const childTasks: Task[] = [];
    let firstTimestamp = -1;
    let lastTimestamp = -1;
    let executionStartTime = -1;
    let totalExecutionTime = 0;

  // Scan history to build lifecycle
  for (let i = 0; i < history.length; i++) {
    const snapshot = history[i];
    if (!snapshot) continue;
    const state = snapshot.state;

      // Find task in various locations
      const foundTask = findTaskInState(state, taskId);

      if (foundTask && !task) {
        task = foundTask;
        firstTimestamp = state.now;

        events.push({
          stepIndex: i,
          timestamp: state.now,
          state: 'pending',
          location: 'created',
          action: 'created',
          details: `Task "${foundTask.label}" created`
        });

        // Find parent
        if (foundTask.origin && foundTask.origin !== 'scenario') {
          parentTask = findTaskInState(state, foundTask.origin);
        }
      }

      // Track location changes
      if (foundTask) {
        const location = getTaskLocation(state, taskId);
        const lastEvent = events[events.length - 1];
        const prevLocation = lastEvent ? lastEvent.location : null;

        if (location !== prevLocation && location !== null) {
          const action = determineAction(prevLocation, location);
          const taskState = determineTaskState(location);

          events.push({
            stepIndex: i,
            timestamp: state.now,
            state: taskState,
            location,
            action,
            details: getActionDetails(action, location, foundTask)
          });

          // Track execution time
          if (location === 'call-stack' && executionStartTime === -1) {
            executionStartTime = state.now;
          } else if (prevLocation === 'call-stack' && location !== 'call-stack' && executionStartTime !== -1) {
            totalExecutionTime += state.now - executionStartTime;
            executionStartTime = -1;
          }

          lastTimestamp = state.now;
        }
      }

      // Find child tasks (tasks with this task as origin)
      findTasksWithOrigin(state, taskId).forEach(child => {
        if (!childTasks.find(t => t.id === child.id)) {
          childTasks.push(child);
        }
      });
    }

    if (!task) return null;

    const duration = lastTimestamp - firstTimestamp;
    const waitTime = duration - totalExecutionTime;

    return {
      taskId,
      task,
      events,
      duration,
      executionTime: totalExecutionTime,
      waitTime,
      parentTask,
      childTasks
    };
  }, [taskId, history]);
}

/**
 * Find a task in the simulator state.
 */
function findTaskInState(state: SimulatorState, taskId: string): Task | null {
  // Check call stack
  const frame = state.callStack.find(f => f.task.id === taskId);
  if (frame) return frame.task;

  // Check queues
  const inMacro = state.macroQueue.find(t => t.id === taskId);
  if (inMacro) return inMacro;

  const inMicro = state.microQueue.find(t => t.id === taskId);
  if (inMicro) return inMicro;

  const inRaf = state.rafQueue.find(t => t.id === taskId);
  if (inRaf) return inRaf;

  // Check Web APIs
  for (const op of state.webApis.values()) {
    if (op.payloadTask.id === taskId) {
      return op.payloadTask;
    }
  }

  // Check completed tasks in log
  const completedEntry = state.log.find(
    entry => entry.type === 'task-complete' && entry.taskId === taskId
  );
  if (completedEntry) {
    // Return null for completed tasks from log (they'll be handled differently)
    return null;
  }

  return null;
}

/**
 * Get the location of a task in the state.
 */
function getTaskLocation(state: SimulatorState, taskId: string): TaskLocation | null {
  if (state.callStack.find(f => f.task.id === taskId)) return 'call-stack';
  if (state.macroQueue.find(t => t.id === taskId)) return 'macro-queue';
  if (state.microQueue.find(t => t.id === taskId)) return 'micro-queue';
  if (state.rafQueue.find(t => t.id === taskId)) return 'raf-queue';

  for (const op of state.webApis.values()) {
    if (op.payloadTask.id === taskId) return 'webapi';
  }

  // Check if task is completed
  const completedEntry = state.log.find(
    entry => entry.type === 'task-complete' && entry.taskId === taskId
  );
  if (completedEntry) return 'completed';

  return null;
}

/**
 * Find tasks that have the given task as their origin.
 */
function findTasksWithOrigin(state: SimulatorState, originTaskId: string): Task[] {
  const tasks: Task[] = [];

  // Check all queues
  state.macroQueue.forEach(t => {
    if (t.origin === originTaskId) tasks.push(t);
  });

  state.microQueue.forEach(t => {
    if (t.origin === originTaskId) tasks.push(t);
  });

  state.rafQueue.forEach(t => {
    if (t.origin === originTaskId) tasks.push(t);
  });

  // Check Web APIs
  state.webApis.forEach(op => {
    if (op.payloadTask.origin === originTaskId) {
      tasks.push(op.payloadTask);
    }
  });

  // Check call stack
  state.callStack.forEach(frame => {
    if (frame.task.origin === originTaskId) {
      tasks.push(frame.task);
    }
  });

  return tasks;
}

/**
 * Determine the action based on location change.
 */
function determineAction(
  prevLocation: TaskLocation | null,
  currentLocation: TaskLocation
): LifecycleEvent['action'] {
  if (!prevLocation || prevLocation === 'created') {
    if (currentLocation === 'webapi') return 'created';
    if (currentLocation.includes('queue')) return 'enqueued';
  }

  if (prevLocation === 'webapi' && currentLocation.includes('queue')) {
    return 'enqueued';
  }

  if (prevLocation?.includes('queue') && currentLocation === 'call-stack') {
    return 'started';
  }

  if (currentLocation === 'completed') {
    return 'completed';
  }

  if (currentLocation === 'canceled') {
    return 'canceled';
  }

  return 'dequeued';
}

/**
 * Determine task state based on location.
 */
function determineTaskState(location: TaskLocation): LifecycleEvent['state'] {
  switch (location) {
    case 'created':
    case 'webapi':
      return 'pending';
    case 'macro-queue':
    case 'micro-queue':
    case 'raf-queue':
      return 'queued';
    case 'call-stack':
      return 'running';
    case 'completed':
    case 'canceled':
      return 'completed';
    default:
      return 'pending';
  }
}

/**
 * Get human-readable details for an action.
 */
function getActionDetails(
  action: LifecycleEvent['action'],
  location: TaskLocation,
  task: Task
): string {
  switch (action) {
    case 'created':
      return `Task "${task.label}" created`;
    case 'enqueued':
      return `Enqueued to ${location.replace('-', ' ')}`;
    case 'dequeued':
      return `Dequeued from ${location.replace('-', ' ')}`;
    case 'started':
      return `Started execution`;
    case 'completed':
      return `Task completed`;
    case 'canceled':
      return `Task canceled`;
    default:
      return `Moved to ${location.replace('-', ' ')}`;
  }
}