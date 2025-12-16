/**
 * Preset 4: Render Timing
 * Difficulty: Intermediate
 * 
 * Demonstrates how requestAnimationFrame executes at frame boundaries,
 * coordinating with the browser's rendering pipeline.
 */

import type { ScenarioDefinition } from '@/core/types/scenario';

export const renderTimingScenario: ScenarioDefinition = {
  id: 'render-timing',
  version: '1.0',
  metadata: {
    title: 'Render Timing',
    description:
      'Learn how requestAnimationFrame (RAF) callbacks execute at frame boundaries before rendering occurs.',
    difficulty: 'intermediate',
    tags: ['raf', 'rendering', 'animation', 'frames'],
    learningObjectives: [
      'Understand when RAF callbacks execute in the event loop',
      'See that RAF executes before rendering',
      'Learn how macro tasks and RAF tasks interleave',
    ],
    estimatedDuration: 25,
  },
  tasks: [
    {
      id: 'macro-1',
      type: 'macro',
      label: 'setTimeout (macro task)',
      duration: 2,
      delay: 0,
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
      label: 'setTimeout (another macro)',
      duration: 2,
      delay: 16, // Next frame
    },
  ],
  config: {
    frameInterval: 16, // 60fps
    autoPlay: false,
    playbackSpeed: 0.4,
  },
};
