/**
 * Preset 5: Nested Timers
 * Difficulty: Intermediate
 * 
 * Demonstrates how a setTimeout inside another setTimeout creates
 * new macro tasks dynamically during execution.
 */

import type { ScenarioDefinition } from '@/core/types/scenario';

export const nestedTimersScenario: ScenarioDefinition = {
  id: 'nested-timers',
  version: '1.0',
  metadata: {
    title: 'Nested Timers',
    description:
      'Explore how timers can spawn new timers, creating dynamic task chains in the macro queue.',
    difficulty: 'intermediate',
    tags: ['setTimeout', 'macro', 'nesting', 'spawning'],
    learningObjectives: [
      'Understand how tasks can create new tasks during execution',
      'See how nested timers extend the event loop',
      'Learn about task spawning and dynamic enqueuing',
    ],
    estimatedDuration: 30,
  },
  tasks: [
    {
      id: 'outer-timer',
      type: 'macro',
      label: 'setTimeout (outer)',
      duration: 2,
      delay: 0,
      spawns: [
        {
          id: 'inner-timer-1',
          type: 'macro',
          label: 'setTimeout (nested)',
          duration: 2,
          delay: 10,
        },
        {
          id: 'inner-timer-2',
          type: 'macro',
          label: 'setTimeout (another nested)',
          duration: 2,
          delay: 20,
        },
      ],
    },
  ],
  config: {
    autoPlay: false,
    playbackSpeed: 0.5,
  },
};
