/**
 * Task Color Mappings
 * 
 * Maps task types to color schemes for visual distinction.
 */

import { TaskType } from '../core/types/task';

/**
 * Color scheme for a task type
 */
export interface TaskColorScheme {
  bg: string;         // Background color
  border: string;     // Border color
  text: string;       // Text color
  accent: string;     // Accent/highlight color
}

/**
 * Map task types to Tailwind CSS color classes
 */
export const taskColors: Record<TaskType, TaskColorScheme> = {
  [TaskType.SYNC]: {
    bg: 'bg-slate-500',
    border: 'border-slate-600',
    text: 'text-white',
    accent: 'bg-slate-400',
  },
  [TaskType.TIMER]: {
    bg: 'bg-cyan-500',
    border: 'border-cyan-600',
    text: 'text-white',
    accent: 'bg-cyan-400',
  },
  [TaskType.INTERVAL]: {
    bg: 'bg-sky-500',
    border: 'border-sky-600',
    text: 'text-white',
    accent: 'bg-sky-400',
  },
  [TaskType.MICROTASK]: {
    bg: 'bg-purple-500',
    border: 'border-purple-600',
    text: 'text-white',
    accent: 'bg-purple-400',
  },
  [TaskType.PROMISE]: {
    bg: 'bg-violet-500',
    border: 'border-violet-600',
    text: 'text-white',
    accent: 'bg-violet-400',
  },
  [TaskType.ASYNC_CONTINUATION]: {
    bg: 'bg-indigo-500',
    border: 'border-indigo-600',
    text: 'text-white',
    accent: 'bg-indigo-400',
  },
  [TaskType.FETCH]: {
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-white',
    accent: 'bg-blue-400',
  },
  [TaskType.DOM_EVENT]: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-white',
    accent: 'bg-emerald-400',
  },
  [TaskType.RAF]: {
    bg: 'bg-amber-500',
    border: 'border-amber-600',
    text: 'text-white',
    accent: 'bg-amber-400',
  },
};

/**
 * Get color classes for a task type
 */
export function getTaskColors(type: TaskType): TaskColorScheme {
  return taskColors[type] || taskColors[TaskType.SYNC];
}

/**
 * Get state-based opacity class
 */
export function getStateOpacity(state: string): string {
  switch (state) {
    case 'queued':
      return 'opacity-90';
    case 'running':
      return 'opacity-100';
    case 'completed':
      return 'opacity-60';
    case 'error':
      return 'opacity-100';
    default:
      return 'opacity-100';
  }
}

/**
 * Get task type label
 */
export function getTaskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    [TaskType.SYNC]: 'Sync',
    [TaskType.TIMER]: 'Timer',
    [TaskType.INTERVAL]: 'Interval',
    [TaskType.MICROTASK]: 'Microtask',
    [TaskType.PROMISE]: 'Promise',
    [TaskType.ASYNC_CONTINUATION]: 'Async',
    [TaskType.FETCH]: 'Fetch',
    [TaskType.DOM_EVENT]: 'Event',
    [TaskType.RAF]: 'RAF',
  };
  return labels[type] || type;
}
