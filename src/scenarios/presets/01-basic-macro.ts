/**
 * Preset 1: Basic Macro Task
 * Difficulty: Beginner
 * 
 * Demonstrates the most fundamental concept: how a setTimeout creates
 * a macro task that executes after the call stack clears.
 */

import type { ScenarioDefinition } from '@/core/types/scenario';

export const basicMacroScenario: ScenarioDefinition = {
  id: 'basic-macro',
  version: '1.0',
  metadata: {
    title: 'Basic Macro Task',
    description:
      'Learn how setTimeout creates a macro task that waits for the call stack to clear before executing.',
    difficulty: 'beginner',
    tags: ['macro', 'setTimeout', 'basics'],
    learningObjectives: [
      'Understand what a macro task is',
      'See how setTimeout schedules work to execute later',
      'Learn that macro tasks wait for the call stack to be empty',
    ],
    estimatedDuration: 15,
  },
  tasks: [
    {
      id: 'macro-1',
      type: 'macro',
      label: 'setTimeout(() => { ... }, 0)',
      duration: 2,
      delay: 0,
    },
  ],
  config: {
    autoPlay: true,
    playbackSpeed: 0.5,
  },
};
