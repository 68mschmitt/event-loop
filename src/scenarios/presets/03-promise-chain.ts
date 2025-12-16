/**
 * Preset 3: Promise Chain
 * Difficulty: Intermediate
 * 
 * Demonstrates how chained promises create multiple microtasks that all
 * execute before the next macro task.
 */

import type { ScenarioDefinition } from '@/core/types/scenario';

export const promiseChainScenario: ScenarioDefinition = {
  id: 'promise-chain',
  version: '1.0',
  metadata: {
    title: 'Promise Chain',
    description:
      'Explore how promise chains create multiple microtasks that drain completely before any macro task executes.',
    difficulty: 'intermediate',
    tags: ['promises', 'microtasks', 'chaining', 'async'],
    learningObjectives: [
      'Understand how promise .then() creates new microtasks',
      'See that all microtasks drain before moving to macro tasks',
      'Learn about microtask checkpoints after each macro task',
    ],
    estimatedDuration: 30,
  },
  tasks: [
    {
      id: 'macro-1',
      type: 'macro',
      label: 'setTimeout',
      duration: 2,
      delay: 0,
    },
    {
      id: 'promise-1',
      type: 'micro',
      label: 'Promise.resolve().then(...)',
      duration: 1,
      spawns: [
        {
          id: 'promise-2',
          type: 'micro',
          label: '.then(...) continuation',
          duration: 1,
          spawns: [
            {
              id: 'promise-3',
              type: 'micro',
              label: '.then(...) continuation',
              duration: 1,
            },
          ],
        },
      ],
    },
  ],
  config: {
    autoPlay: false,
    playbackSpeed: 0.4,
  },
};
