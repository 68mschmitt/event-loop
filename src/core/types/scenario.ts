/**
 * Scenario definition types.
 * Defines how scenarios are structured.
 */

import type { TaskType, TaskEffect } from './task';

/**
 * A complete scenario definition (preset or custom).
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  learningObjective: string;
  tasks: ScenarioTask[];
  expectedOutcome?: string;
  tags: string[];
}

/**
 * A task definition in a scenario.
 */
export interface ScenarioTask {
  type: TaskType;
  label: string;
  delay?: number;
  latency?: number;
  durationSteps?: number;
  effects?: TaskEffect[];
  dependsOn?: string;
}

/**
 * Validation error for scenarios.
 */
export interface ScenarioValidationError {
  field: string;
  message: string;
}
