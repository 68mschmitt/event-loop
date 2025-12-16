/**
 * Scenario definition types.
 * Defines how scenarios are structured for educational presets and custom scenarios.
 */

/**
 * Difficulty levels for scenarios.
 */
export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Metadata for a scenario definition.
 */
export interface ScenarioMetadata {
  title: string;
  description: string;
  difficulty: ScenarioDifficulty;
  tags: string[];
  learningObjectives: string[];
  estimatedDuration: number; // seconds
}

/**
 * Configuration options for scenario playback.
 */
export interface ScenarioConfig {
  frameInterval?: number;
  autoPlay?: boolean;
  playbackSpeed?: number;
}

/**
 * Task types supported in scenarios (simplified from TaskType enum).
 */
export type ScenarioTaskType = 'macro' | 'micro' | 'raf' | 'webapi';

/**
 * A task definition in a scenario.
 * Supports recursive spawning of child tasks.
 */
export interface ScenarioTask {
  id: string;
  type: ScenarioTaskType;
  label: string;
  duration?: number; // execution duration in steps
  delay?: number; // delay before enqueue (for timers)
  spawns?: ScenarioTask[]; // Tasks spawned when this task executes
}

/**
 * A complete scenario definition (preset or custom).
 */
export interface ScenarioDefinition {
  id: string;
  version: '1.0';
  metadata: ScenarioMetadata;
  tasks: ScenarioTask[];
  config?: ScenarioConfig;
}

/**
 * Validation error for scenarios.
 */
export interface ScenarioValidationError {
  path: string[];
  message: string;
  code: string;
}

/**
 * Result of scenario validation.
 */
export interface ScenarioValidationResult {
  success: boolean;
  errors: ScenarioValidationError[];
  data?: ScenarioDefinition;
}
