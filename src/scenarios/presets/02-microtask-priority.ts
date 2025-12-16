/**
 * Preset 2: Microtask Priority
 * Difficulty: Beginner
 * 
 * Demonstrates that microtasks always execute before the next macro task,
 * even if the macro task was queued first.
 */

import type { ScenarioDefinition } from '@/core/types/scenario';

export const microtaskPriorityScenario: ScenarioDefinition = {
  id: 'microtask-priority',
  version: '1.0',
  metadata: {
    title: 'Microtask Priority',
    description:
      'See how microtasks (like Promise.resolve()) always execute before macro tasks, demonstrating queue priority in the event loop.',
    difficulty: 'beginner',
    tags: ['microtasks', 'promises', 'priority', 'queues'],
    learningObjectives: [
      'Understand that microtasks have higher priority than macro tasks',
      'See how Promise.resolve() creates microtasks',
      'Learn the execution order: stack → microtasks → macro task',
    ],
    estimatedDuration: 20,
  },
  tasks: [
    {
      id: 'macro-1',
      type: 'macro',
      label: 'setTimeout (queued first)',
      duration: 2,
      delay: 0,
    },
    {
      id: 'micro-1',
      type: 'micro',
      label: 'Promise.resolve() (queued second)',
      duration: 1,
    },
  ],
  config: {
    autoPlay: true,
    playbackSpeed: 0.5,
  },
};
