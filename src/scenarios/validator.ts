/**
 * Scenario validator with helpful error messages and cycle detection.
 */

import { z } from 'zod';
import { validateScenarioSchema } from './schema';
import type {
  ScenarioDefinition,
  ScenarioValidationError,
  ScenarioValidationResult,
  ScenarioTask,
} from '@/core/types/scenario';

/**
 * Converts Zod errors to scenario validation errors with helpful messages.
 */
function zodErrorToValidationErrors(
  error: z.ZodError
): ScenarioValidationError[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Detects circular dependencies in task spawning.
 * @returns Array of task IDs involved in cycles, or empty array if no cycles found.
 */
function detectTaskCycles(
  tasks: ScenarioTask[],
  visited = new Set<string>(),
  path = new Set<string>()
): string[] {
  const cycles: string[] = [];

  function visit(task: ScenarioTask) {
    if (path.has(task.id)) {
      // Found a cycle
      cycles.push(task.id);
      return;
    }

    if (visited.has(task.id)) {
      // Already processed this branch
      return;
    }

    visited.add(task.id);
    path.add(task.id);

    // Check spawned tasks
    if (task.spawns) {
      for (const spawnedTask of task.spawns) {
        if (spawnedTask) {
          visit(spawnedTask);
        }
      }
    }

    path.delete(task.id);
  }

  for (const task of tasks) {
    visit(task);
  }

  return cycles;
}

/**
 * Validates task IDs are unique across all tasks and spawns.
 */
function validateUniqueTaskIds(
  tasks: ScenarioTask[]
): ScenarioValidationError[] {
  const errors: ScenarioValidationError[] = [];
  const seenIds = new Map<string, string[]>();

  function collectIds(task: ScenarioTask, path: string[]) {
    const currentPath = [...path, task.id];

    if (seenIds.has(task.id)) {
      // Duplicate found
      const firstPath = seenIds.get(task.id)!;
      errors.push({
        path: currentPath,
        message: `Duplicate task ID "${task.id}". First seen at: ${firstPath.join(' → ')}`,
        code: 'duplicate_task_id',
      });
    } else {
      seenIds.set(task.id, currentPath);
    }

    if (task.spawns) {
      for (const spawnedTask of task.spawns) {
        if (spawnedTask) {
          collectIds(spawnedTask, currentPath);
        }
      }
    }
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (task) {
      collectIds(task, [`tasks[${i}]`]);
    }
  }

  return errors;
}

/**
 * Validates scenario definition with comprehensive checks.
 */
export function validateScenario(
  data: unknown
): ScenarioValidationResult {
  // Step 1: Schema validation
  const schemaResult = validateScenarioSchema(data);

  if (!schemaResult.success) {
    return {
      success: false,
      errors: zodErrorToValidationErrors(schemaResult.error),
    };
  }

  const scenario = schemaResult.data as ScenarioDefinition;
  const errors: ScenarioValidationError[] = [];

  // Step 2: Check for duplicate task IDs
  const duplicateErrors = validateUniqueTaskIds(scenario.tasks);
  errors.push(...duplicateErrors);

  // Step 3: Check for circular task dependencies
  const cycles = detectTaskCycles(scenario.tasks);
  if (cycles.length > 0) {
    errors.push({
      path: ['tasks'],
      message: `Circular task spawning detected. Tasks involved in cycle: ${cycles.join(', ')}`,
      code: 'circular_dependency',
    });
  }

  // Step 4: Validate webapi tasks have delay
  function validateWebapiTasks(task: ScenarioTask, path: string[]) {
    if (task.type === 'webapi' && task.delay === undefined) {
      errors.push({
        path: [...path, 'delay'],
        message: `Web API task "${task.label}" must have a delay specified`,
        code: 'webapi_missing_delay',
      });
    }

    if (task.spawns) {
      for (let i = 0; i < task.spawns.length; i++) {
        const spawnedTask = task.spawns[i];
        if (spawnedTask) {
          validateWebapiTasks(spawnedTask, [...path, 'spawns', String(i)]);
        }
      }
    }
  }

  for (let i = 0; i < scenario.tasks.length; i++) {
    const task = scenario.tasks[i];
    if (task) {
      validateWebapiTasks(task, ['tasks', String(i)]);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    errors: [],
    data: scenario,
  };
}

/**
 * Formats validation errors into a human-readable string.
 */
export function formatValidationErrors(errors: ScenarioValidationError[]): string {
  return errors
    .map((error) => {
      const path = error.path.length > 0 ? `${error.path.join('.')}: ` : '';
      return `  - ${path}${error.message}`;
    })
    .join('\n');
}
