/**
 * Preset scenarios - educational examples for learning the event loop.
 */

import type { ScenarioDefinition } from '@/core/types/scenario';

// Import all preset scenarios
import { basicMacroScenario } from './01-basic-macro';
import { microtaskPriorityScenario } from './02-microtask-priority';
import { promiseChainScenario } from './03-promise-chain';
import { renderTimingScenario } from './04-render-timing';
import { nestedTimersScenario } from './05-nested-timers';
import { mixedQueuesScenario } from './06-mixed-queues';

/**
 * Array of all preset scenarios, ordered by difficulty.
 */
export const PRESET_SCENARIOS: ScenarioDefinition[] = [
  // Beginner
  basicMacroScenario,
  microtaskPriorityScenario,
  
  // Intermediate
  promiseChainScenario,
  renderTimingScenario,
  nestedTimersScenario,
  
  // Advanced
  mixedQueuesScenario,
];

/**
 * Get a preset scenario by ID.
 */
export function getPresetById(id: string): ScenarioDefinition | undefined {
  return PRESET_SCENARIOS.find((scenario) => scenario.id === id);
}

/**
 * Get preset scenarios filtered by difficulty.
 */
export function getPresetsByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): ScenarioDefinition[] {
  return PRESET_SCENARIOS.filter(
    (scenario) => scenario.metadata.difficulty === difficulty
  );
}

/**
 * Get preset scenarios filtered by tag.
 */
export function getPresetsByTag(tag: string): ScenarioDefinition[] {
  return PRESET_SCENARIOS.filter((scenario) =>
    scenario.metadata.tags.includes(tag)
  );
}
