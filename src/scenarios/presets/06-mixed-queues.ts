/**
 * Preset 6: Mixed Queue Complexity
 * Difficulty: Advanced
 * 
 * Demonstrates complex interleaving of macro tasks, microtasks, and RAF tasks
 * to show the complete event loop execution order.
 */

import type { ScenarioDefinition } from '@/core/types/scenario';

export const mixedQueuesScenario: ScenarioDefinition = {
  id: 'mixed-queues',
  version: '1.0',
  metadata: {
    title: 'Mixed Queue Complexity',
    description:
      'Master the event loop with a complex scenario involving all queue types: macro, micro, and RAF.',
    difficulty: 'advanced',
    tags: ['macro', 'micro', 'raf', 'queues', 'complexity'],
    learningObjectives: [
      'Understand complete event loop execution order',
      'See how all three queue types interact',
      'Master predicting task execution order',
    ],
    estimatedDuration: 45,
  },
  tasks: [
    {
      id: 'macro-1',
      type: 'macro',
      label: 'setTimeout #1',
      duration: 2,
      delay: 0,
      spawns: [
        {
          id: 'micro-1',
          type: 'micro',
          label: 'Promise in timeout #1',
          duration: 1,
        },
      ],
    },
    {
      id: 'micro-2',
      type: 'micro',
      label: 'Promise.resolve()',
      duration: 1,
      spawns: [
        {
          id: 'micro-3',
          type: 'micro',
          label: '.then() continuation',
          duration: 1,
        },
      ],
    },
    {
      id: 'raf-1',
      type: 'raf',
      label: 'requestAnimationFrame',
      duration: 2,
    },
    {
      id: 'macro-2',
      type: 'macro',
      label: 'setTimeout #2',
      duration: 2,
      delay: 16,
      spawns: [
        {
          id: 'micro-4',
          type: 'micro',
          label: 'Promise in timeout #2',
          duration: 1,
        },
      ],
    },
  ],
  config: {
    frameInterval: 16,
    autoPlay: false,
    playbackSpeed: 0.3,
  },
};
