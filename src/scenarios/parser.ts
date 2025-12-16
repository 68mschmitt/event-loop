/**
 * Scenario parser - converts scenario definitions to simulator state.
 */

import type { ScenarioDefinition, ScenarioTask } from '@/core/types/scenario';
import type { SimulatorState } from '@/core/types/simulator';
import type { Task, TaskEffect } from '@/core/types/task';
import { TaskType, TaskState } from '@/core/types/task';
import { createInitialState } from '@/core/simulator/state';
import {
  enqueueTimerTask,
  enqueueMicrotask,
  enqueueRafTask,
} from '@/core/simulator/enqueue';



/**
 * Converts a scenario task type to a simulator TaskType.
 */
function mapScenarioTaskType(scenarioType: ScenarioTask['type']): TaskType {
  switch (scenarioType) {
    case 'macro':
      return TaskType.TIMER;
    case 'micro':
      return TaskType.MICROTASK;
    case 'raf':
      return TaskType.RAF;
    case 'webapi':
      return TaskType.TIMER; // Web API tasks use timer mechanism
    default:
      return TaskType.TIMER;
  }
}

/**
 * Converts spawned tasks to task effects.
 */
function createSpawnEffects(spawns: ScenarioTask[] | undefined): TaskEffect[] {
  if (!spawns || spawns.length === 0) {
    return [];
  }

  return spawns.map((spawnedTask) => ({
    type: 'enqueue-task' as const,
    payload: spawnedTask,
  }));
}

/**
 * Converts a scenario task to a simulator task.
 */
function convertScenarioTask(
  scenarioTask: ScenarioTask,
  state: SimulatorState
): Task {
  const taskType = mapScenarioTaskType(scenarioTask.type);
  const effects = createSpawnEffects(scenarioTask.spawns);

  const baseTask = {
    id: scenarioTask.id,
    label: scenarioTask.label,
    createdAt: state.now,
    enqueueSeq: state.enqueueCounter,
    origin: 'scenario' as const,
    state: TaskState.CREATED,
    durationSteps: scenarioTask.duration || 1,
    effects,
  };

  // Create task based on type
  switch (taskType) {
    case TaskType.TIMER:
      return {
        ...baseTask,
        type: TaskType.TIMER,
        delay: scenarioTask.delay || 0,
      };

    case TaskType.MICROTASK:
      return {
        ...baseTask,
        type: TaskType.MICROTASK,
      };

    case TaskType.RAF:
      return {
        ...baseTask,
        type: TaskType.RAF,
      };

    default:
      // Fallback to timer
      return {
        ...baseTask,
        type: TaskType.TIMER,
        delay: 0,
      };
  }
}

/**
 * Enqueues a task to the appropriate queue based on its type.
 */
function enqueueTaskByType(
  state: SimulatorState,
  task: Task,
  scenarioTask: ScenarioTask
): SimulatorState {
  switch (scenarioTask.type) {
    case 'macro':
    case 'webapi':
      // Macro and webapi tasks go through timer mechanism
      return enqueueTimerTask(state, task, scenarioTask.delay || 0);

    case 'micro':
      // Microtasks go directly to micro queue
      return enqueueMicrotask(state, task);

    case 'raf':
      // RAF tasks go to RAF queue
      return enqueueRafTask(state, task);

    default:
      return state;
  }
}

/**
 * Parses a scenario definition and converts it to initial simulator state.
 * 
 * @param scenario - Validated scenario definition
 * @returns Simulator state with all scenario tasks enqueued
 * 
 * @example
 * ```typescript
 * const scenario = validateScenario(scenarioJson);
 * if (scenario.success && scenario.data) {
 *   const state = parseScenario(scenario.data);
 *   // Load state into simulator
 * }
 * ```
 */
export function parseScenario(scenario: ScenarioDefinition): SimulatorState {
  // Create initial state with scenario config
  const options = scenario.config?.frameInterval
    ? { frameInterval: scenario.config.frameInterval }
    : {};
  let state = createInitialState(options);

  // Process each top-level task
  for (const scenarioTask of scenario.tasks) {
    // Convert scenario task to simulator task
    const task = convertScenarioTask(scenarioTask, state);

    // Enqueue the task
    state = enqueueTaskByType(state, task, scenarioTask);
  }

  return state;
}

/**
 * Creates a simulator state from scenario JSON.
 * Validates and parses in one step.
 * 
 * @param scenarioJson - Raw scenario JSON data
 * @returns Simulator state if valid, or throws error
 */
export function scenarioToSimulatorState(scenarioJson: unknown): SimulatorState {
  const { validateScenario } = require('./validator');
  const validation = validateScenario(scenarioJson);

  if (!validation.success) {
    const { formatValidationErrors } = require('./validator');
    const errorMessage = formatValidationErrors(validation.errors);
    throw new Error(`Invalid scenario:\n${errorMessage}`);
  }

  return parseScenario(validation.data!);
}
