/**
 * State Change Detection
 * 
 * Detects differences between simulator states and generates
 * StateChange objects for animation.
 */

import type { SimulatorState } from '../core/types/simulator';
import type { StateChange } from './types';
import { getTaskLocation, getAllTasks } from './types';

/**
 * Detect changes between two simulator states
 * Returns array of StateChange objects representing animations to perform
 */
export function detectChanges(
  prevState: SimulatorState | null,
  currentState: SimulatorState
): StateChange[] {
  // No previous state - initial render, no animations
  if (!prevState) {
    return [];
  }

  const changes: StateChange[] = [];
  const timestamp = currentState.now;

  // Get all tasks from both states
  const prevTasks = getAllTasks(prevState);
  const currentTasks = getAllTasks(currentState);

  // Detect new tasks (TASK_CREATED)
  currentTasks.forEach((task, taskId) => {
    if (!prevTasks.has(taskId)) {
      const location = getTaskLocation(taskId, currentState);
      if (location) {
        changes.push({
          type: 'TASK_CREATED',
          taskId,
          task,
          to: location,
          timestamp,
        });
      }
    }
  });

  // Detect moved/changed tasks
  prevTasks.forEach((_prevTask, taskId) => {
    const currentTask = currentTasks.get(taskId);
    
    if (!currentTask) {
      // Task removed - we'll handle this with TASK_STATE change to 'completed'
      return;
    }

    const prevLocation = getTaskLocation(taskId, prevState);
    const currentLocation = getTaskLocation(taskId, currentState);

    if (!prevLocation || !currentLocation) {
      return;
    }

    // Check if task moved between regions
    if (prevLocation.region !== currentLocation.region) {
      changes.push({
        type: 'TASK_MOVED',
        taskId,
        task: currentTask,
        from: prevLocation,
        to: currentLocation,
        timestamp,
      });
      return; // Movement supersedes state changes
    }

    // Check if task state changed (queued → running → completed)
    if (prevLocation.state !== currentLocation.state) {
      changes.push({
        type: 'TASK_STATE',
        taskId,
        task: currentTask,
        from: prevLocation,
        to: currentLocation,
        timestamp,
      });
    }
  });

  // Detect stack operations
  if (prevState.callStack.length !== currentState.callStack.length) {
    const prevStackTop = prevState.callStack[prevState.callStack.length - 1];
    const currentStackTop = currentState.callStack[currentState.callStack.length - 1];

    if (currentState.callStack.length > prevState.callStack.length) {
      // Stack push
      if (currentStackTop?.task) {
        changes.push({
          type: 'STACK_PUSH',
          taskId: currentStackTop.task.id,
          task: currentStackTop.task,
          timestamp,
        });
      }
    } else {
      // Stack pop
      if (prevStackTop?.task) {
        changes.push({
          type: 'STACK_POP',
          taskId: prevStackTop.task.id,
          task: prevStackTop.task,
          timestamp,
        });
      }
    }
  }

  // Detect tick boundaries
  if (prevState.stepIndex !== currentState.stepIndex) {
    if (currentState.stepIndex > prevState.stepIndex) {
      changes.push({
        type: 'TICK_START',
        taskId: `tick-${currentState.stepIndex}`,
        timestamp,
      });
    }
  }

  // Detect console logs
  if (prevState.log.length !== currentState.log.length) {
    const newLogs = currentState.log.slice(prevState.log.length);
    newLogs.forEach(log => {
      if (log.taskId) {
        changes.push({
          type: 'CONSOLE_LOG',
          taskId: log.taskId,
          timestamp: log.timestamp,
        });
      }
    });
  }

  return changes;
}

/**
 * Determine if a state change requires animation
 */
export function shouldAnimate(change: StateChange): boolean {
  // Always animate task movements and state changes
  if (change.type === 'TASK_MOVED' || change.type === 'TASK_STATE') {
    return true;
  }

  // Animate task creation if it has a destination
  if (change.type === 'TASK_CREATED' && change.to) {
    return true;
  }

  // Animate stack operations
  if (change.type === 'STACK_PUSH' || change.type === 'STACK_POP') {
    return true;
  }

  // Optionally skip tick boundaries and console logs
  // for performance - these can be instant
  return false;
}

/**
 * Group related changes for batch animation
 * Returns array of change groups that can be animated together
 */
export function groupChanges(changes: StateChange[]): StateChange[][] {
  const groups: StateChange[][] = [];
  const grouped = new Set<string>();

  changes.forEach(change => {
    if (grouped.has(change.taskId)) {
      return;
    }

    // Find all related changes for this task
    const related = changes.filter(
      c => c.taskId === change.taskId && !grouped.has(c.taskId)
    );

    if (related.length > 0) {
      groups.push(related);
      related.forEach(r => grouped.add(r.taskId));
    }
  });

  // Add ungrouped changes as individual groups
  changes.forEach(change => {
    if (!grouped.has(change.taskId)) {
      groups.push([change]);
      grouped.add(change.taskId);
    }
  });

  return groups;
}
