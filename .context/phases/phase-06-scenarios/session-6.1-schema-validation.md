# Session 6.1: Scenario Schema and Validation

## Overview

This session defines the complete schema for scenarios and implements validation logic. A robust validation system ensures that only valid scenarios can be loaded into the simulator, preventing runtime errors and providing clear feedback to users creating custom scenarios.

## Prerequisites

- Phase 1 complete (core types defined)
- Understanding of schema validation (Zod or custom validators)
- Understanding of discriminated unions
- Familiarity with TypeScript type guards

## Goals

- [ ] Define complete `Scenario` schema with all required fields
- [ ] Define `ScenarioTask` schema matching simulator task types
- [ ] Implement validation function that returns typed errors
- [ ] Create clear, actionable error messages
- [ ] Add validation for task dependencies
- [ ] Validate task effects structure
- [ ] Support both strict and lenient validation modes
- [ ] Add JSDoc comments to all validators

## Files to Create

### `src/core/scenarios/schema.ts`
**Purpose:** Type definitions for scenarios
**Exports:** `Scenario`, `ScenarioTask`, `ScenarioMetadata`, type guards
**Key responsibilities:**
- Extend base Task types for scenario definitions
- Define scenario metadata structure
- Define validation error types
- Provide schema version for future compatibility

### `src/core/scenarios/validator.ts`
**Purpose:** Validation logic for scenarios
**Exports:** `validateScenario`, `validateTask`, validation result types
**Key responsibilities:**
- Validate required fields
- Validate task type-specific properties
- Validate effects structure
- Check for circular dependencies
- Return structured error objects

### `src/core/scenarios/errors.ts`
**Purpose:** Validation error types and messages
**Exports:** `ValidationError`, `ValidationResult`, error constructors
**Key responsibilities:**
- Define error severity levels
- Define error message templates
- Provide helpful error messages with context

## Type Definitions

### Scenario Schema

```typescript
/**
 * Schema version for future compatibility.
 */
export const SCENARIO_SCHEMA_VERSION = 1;

/**
 * Metadata for a scenario.
 */
export interface ScenarioMetadata {
  id: string;
  name: string;
  description: string;
  learningObjective: string;
  tags: string[];
  author?: string;
  createdAt?: string;
  schemaVersion: number;
}

/**
 * A complete scenario definition.
 * Scenarios define the initial set of tasks to execute.
 */
export interface Scenario extends ScenarioMetadata {
  tasks: ScenarioTask[];
  expectedOutcome?: string;  // Human-readable expected result
}

/**
 * A task definition in a scenario.
 * Similar to Task but without runtime fields (id, state, createdAt, etc.)
 */
export interface ScenarioTask {
  // Discriminant
  type: TaskType;
  
  // Required for all tasks
  label: string;
  
  // Optional for all tasks
  durationSteps?: number;     // Default: 1
  effects?: TaskEffect[];     // Default: []
  
  // Type-specific fields
  delay?: number;             // For TIMER, INTERVAL (required)
  latency?: number;           // For FETCH (required)
  url?: string;               // For FETCH (required)
  eventType?: string;         // For DOM_EVENT (required)
}

/**
 * Validation error details.
 */
export interface ValidationError {
  field: string;              // Path to field, e.g., 'tasks[0].delay'
  code: string;               // Error code, e.g., 'MISSING_FIELD'
  message: string;            // Human-readable message
  severity: 'error' | 'warning';
  suggestion?: string;        // Optional fix suggestion
}

/**
 * Result of validation.
 */
export type ValidationResult<T> = 
  | { ok: true; value: T; warnings: ValidationError[] }
  | { ok: false; errors: ValidationError[] };
```

### Validation Rules

```typescript
/**
 * Validation rules for scenarios.
 */
export const VALIDATION_RULES = {
  // Metadata
  ID_MIN_LENGTH: 1,
  ID_MAX_LENGTH: 100,
  ID_PATTERN: /^[a-z0-9-]+$/,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  
  // Tasks
  TASKS_MIN: 1,
  TASKS_MAX: 100,
  LABEL_MIN_LENGTH: 1,
  LABEL_MAX_LENGTH: 200,
  DURATION_MIN: 1,
  DURATION_MAX: 100,
  DELAY_MIN: 0,
  DELAY_MAX: 60000,          // 60 seconds
  LATENCY_MIN: 0,
  LATENCY_MAX: 10000,        // 10 seconds
  
  // Effects
  EFFECTS_MAX: 20,
} as const;
```

## Implementation Specifications

### Core Validation Function

```typescript
/**
 * Validates a scenario object.
 * 
 * @param data - Unknown data to validate
 * @param options - Validation options
 * @returns Validation result with typed value or errors
 * 
 * @example
 * const result = validateScenario(jsonData);
 * if (result.ok) {
 *   const scenario = result.value;
 *   // Use scenario
 * } else {
 *   console.error(result.errors);
 * }
 */
export function validateScenario(
  data: unknown,
  options: ValidationOptions = {}
): ValidationResult<Scenario> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Check if data is object
  if (!isObject(data)) {
    return {
      ok: false,
      errors: [{
        field: '',
        code: 'INVALID_TYPE',
        message: 'Scenario must be an object',
        severity: 'error',
      }]
    };
  }
  
  // Validate metadata
  validateMetadata(data, errors, warnings);
  
  // Validate tasks array
  validateTasks(data.tasks, errors, warnings);
  
  // Return result
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  
  return { ok: true, value: data as Scenario, warnings };
}
```

### Metadata Validation

```typescript
function validateMetadata(
  data: any,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  // Validate id
  if (!data.id) {
    errors.push({
      field: 'id',
      code: 'MISSING_FIELD',
      message: 'Scenario id is required',
      severity: 'error',
      suggestion: 'Add a unique id like "my-scenario"',
    });
  } else if (typeof data.id !== 'string') {
    errors.push({
      field: 'id',
      code: 'INVALID_TYPE',
      message: 'Scenario id must be a string',
      severity: 'error',
    });
  } else if (!VALIDATION_RULES.ID_PATTERN.test(data.id)) {
    errors.push({
      field: 'id',
      code: 'INVALID_FORMAT',
      message: 'Scenario id must contain only lowercase letters, numbers, and hyphens',
      severity: 'error',
      suggestion: `Try: "${data.id.toLowerCase().replace(/[^a-z0-9-]/g, '-')}"`,
    });
  }
  
  // Validate name
  if (!data.name) {
    errors.push({
      field: 'name',
      code: 'MISSING_FIELD',
      message: 'Scenario name is required',
      severity: 'error',
    });
  } else if (typeof data.name !== 'string') {
    errors.push({
      field: 'name',
      code: 'INVALID_TYPE',
      message: 'Scenario name must be a string',
      severity: 'error',
    });
  } else if (data.name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    errors.push({
      field: 'name',
      code: 'TOO_LONG',
      message: `Scenario name must be at most ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
      severity: 'error',
    });
  }
  
  // Validate description
  if (!data.description) {
    errors.push({
      field: 'description',
      code: 'MISSING_FIELD',
      message: 'Scenario description is required',
      severity: 'error',
    });
  } else if (typeof data.description !== 'string') {
    errors.push({
      field: 'description',
      code: 'INVALID_TYPE',
      message: 'Scenario description must be a string',
      severity: 'error',
    });
  }
  
  // Validate learningObjective
  if (!data.learningObjective) {
    warnings.push({
      field: 'learningObjective',
      code: 'MISSING_FIELD',
      message: 'Scenario should have a learning objective',
      severity: 'warning',
      suggestion: 'Add a learning objective to help users understand the purpose',
    });
  }
  
  // Validate tags
  if (!data.tags) {
    data.tags = []; // Default empty array
  } else if (!Array.isArray(data.tags)) {
    errors.push({
      field: 'tags',
      code: 'INVALID_TYPE',
      message: 'Tags must be an array',
      severity: 'error',
    });
  } else if (!data.tags.every((tag: any) => typeof tag === 'string')) {
    errors.push({
      field: 'tags',
      code: 'INVALID_TYPE',
      message: 'All tags must be strings',
      severity: 'error',
    });
  }
  
  // Validate schemaVersion
  if (!data.schemaVersion) {
    data.schemaVersion = SCENARIO_SCHEMA_VERSION;
  } else if (data.schemaVersion > SCENARIO_SCHEMA_VERSION) {
    warnings.push({
      field: 'schemaVersion',
      code: 'NEWER_VERSION',
      message: `This scenario uses schema version ${data.schemaVersion}, but this app supports version ${SCENARIO_SCHEMA_VERSION}`,
      severity: 'warning',
      suggestion: 'Some features may not work correctly',
    });
  }
}
```

### Task Validation

```typescript
function validateTasks(
  tasks: unknown,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  // Check if tasks is array
  if (!Array.isArray(tasks)) {
    errors.push({
      field: 'tasks',
      code: 'INVALID_TYPE',
      message: 'Tasks must be an array',
      severity: 'error',
    });
    return;
  }
  
  // Check array length
  if (tasks.length < VALIDATION_RULES.TASKS_MIN) {
    errors.push({
      field: 'tasks',
      code: 'TOO_FEW',
      message: `Scenario must have at least ${VALIDATION_RULES.TASKS_MIN} task`,
      severity: 'error',
    });
    return;
  }
  
  if (tasks.length > VALIDATION_RULES.TASKS_MAX) {
    errors.push({
      field: 'tasks',
      code: 'TOO_MANY',
      message: `Scenario cannot have more than ${VALIDATION_RULES.TASKS_MAX} tasks`,
      severity: 'error',
      suggestion: 'Consider splitting into multiple scenarios',
    });
  }
  
  // Validate each task
  tasks.forEach((task, index) => {
    validateTask(task, index, errors, warnings);
  });
}

function validateTask(
  task: any,
  index: number,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  const prefix = `tasks[${index}]`;
  
  // Check if task is object
  if (!isObject(task)) {
    errors.push({
      field: prefix,
      code: 'INVALID_TYPE',
      message: `Task at index ${index} must be an object`,
      severity: 'error',
    });
    return;
  }
  
  // Validate type
  if (!task.type) {
    errors.push({
      field: `${prefix}.type`,
      code: 'MISSING_FIELD',
      message: 'Task type is required',
      severity: 'error',
    });
    return;
  }
  
  if (!Object.values(TaskType).includes(task.type)) {
    errors.push({
      field: `${prefix}.type`,
      code: 'INVALID_VALUE',
      message: `Invalid task type: ${task.type}`,
      severity: 'error',
      suggestion: `Valid types: ${Object.values(TaskType).join(', ')}`,
    });
    return;
  }
  
  // Validate label
  if (!task.label) {
    errors.push({
      field: `${prefix}.label`,
      code: 'MISSING_FIELD',
      message: 'Task label is required',
      severity: 'error',
    });
  } else if (typeof task.label !== 'string') {
    errors.push({
      field: `${prefix}.label`,
      code: 'INVALID_TYPE',
      message: 'Task label must be a string',
      severity: 'error',
    });
  }
  
  // Validate type-specific fields
  switch (task.type) {
    case TaskType.TIMER:
    case TaskType.INTERVAL:
      validateTimerTask(task, prefix, errors, warnings);
      break;
    case TaskType.FETCH:
      validateFetchTask(task, prefix, errors, warnings);
      break;
    case TaskType.DOM_EVENT:
      validateDomEventTask(task, prefix, errors, warnings);
      break;
    // Other types don't require specific fields
  }
  
  // Validate optional common fields
  if (task.durationSteps !== undefined) {
    if (typeof task.durationSteps !== 'number') {
      errors.push({
        field: `${prefix}.durationSteps`,
        code: 'INVALID_TYPE',
        message: 'Duration steps must be a number',
        severity: 'error',
      });
    } else if (task.durationSteps < VALIDATION_RULES.DURATION_MIN) {
      errors.push({
        field: `${prefix}.durationSteps`,
        code: 'TOO_SMALL',
        message: `Duration steps must be at least ${VALIDATION_RULES.DURATION_MIN}`,
        severity: 'error',
      });
    }
  }
  
  // Validate effects
  if (task.effects !== undefined) {
    validateEffects(task.effects, prefix, errors, warnings);
  }
}
```

### Type-Specific Validators

```typescript
function validateTimerTask(
  task: any,
  prefix: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (task.delay === undefined) {
    errors.push({
      field: `${prefix}.delay`,
      code: 'MISSING_FIELD',
      message: 'Timer task requires delay field',
      severity: 'error',
      suggestion: 'Add delay in milliseconds (e.g., delay: 0)',
    });
  } else if (typeof task.delay !== 'number') {
    errors.push({
      field: `${prefix}.delay`,
      code: 'INVALID_TYPE',
      message: 'Delay must be a number',
      severity: 'error',
    });
  } else if (task.delay < VALIDATION_RULES.DELAY_MIN) {
    errors.push({
      field: `${prefix}.delay`,
      code: 'TOO_SMALL',
      message: 'Delay cannot be negative',
      severity: 'error',
    });
  } else if (task.delay > VALIDATION_RULES.DELAY_MAX) {
    warnings.push({
      field: `${prefix}.delay`,
      code: 'VERY_LARGE',
      message: `Delay of ${task.delay}ms is very large`,
      severity: 'warning',
      suggestion: 'Consider a shorter delay for better user experience',
    });
  }
}

function validateFetchTask(
  task: any,
  prefix: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!task.url) {
    errors.push({
      field: `${prefix}.url`,
      code: 'MISSING_FIELD',
      message: 'Fetch task requires url field',
      severity: 'error',
    });
  } else if (typeof task.url !== 'string') {
    errors.push({
      field: `${prefix}.url`,
      code: 'INVALID_TYPE',
      message: 'URL must be a string',
      severity: 'error',
    });
  }
  
  if (task.latency === undefined) {
    errors.push({
      field: `${prefix}.latency`,
      code: 'MISSING_FIELD',
      message: 'Fetch task requires latency field',
      severity: 'error',
      suggestion: 'Add latency in milliseconds (e.g., latency: 100)',
    });
  } else if (typeof task.latency !== 'number') {
    errors.push({
      field: `${prefix}.latency`,
      code: 'INVALID_TYPE',
      message: 'Latency must be a number',
      severity: 'error',
    });
  } else if (task.latency < VALIDATION_RULES.LATENCY_MIN) {
    errors.push({
      field: `${prefix}.latency`,
      code: 'TOO_SMALL',
      message: 'Latency cannot be negative',
      severity: 'error',
    });
  }
}

function validateDomEventTask(
  task: any,
  prefix: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!task.eventType) {
    errors.push({
      field: `${prefix}.eventType`,
      code: 'MISSING_FIELD',
      message: 'DOM event task requires eventType field',
      severity: 'error',
      suggestion: 'Add eventType (e.g., "click", "input")',
    });
  } else if (typeof task.eventType !== 'string') {
    errors.push({
      field: `${prefix}.eventType`,
      code: 'INVALID_TYPE',
      message: 'Event type must be a string',
      severity: 'error',
    });
  }
}
```

### Effects Validation

```typescript
function validateEffects(
  effects: any,
  prefix: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!Array.isArray(effects)) {
    errors.push({
      field: `${prefix}.effects`,
      code: 'INVALID_TYPE',
      message: 'Effects must be an array',
      severity: 'error',
    });
    return;
  }
  
  if (effects.length > VALIDATION_RULES.EFFECTS_MAX) {
    warnings.push({
      field: `${prefix}.effects`,
      code: 'TOO_MANY',
      message: `Task has ${effects.length} effects, which may impact performance`,
      severity: 'warning',
    });
  }
  
  effects.forEach((effect, index) => {
    validateEffect(effect, `${prefix}.effects[${index}]`, errors, warnings);
  });
}

function validateEffect(
  effect: any,
  prefix: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!isObject(effect)) {
    errors.push({
      field: prefix,
      code: 'INVALID_TYPE',
      message: 'Effect must be an object',
      severity: 'error',
    });
    return;
  }
  
  if (!effect.type) {
    errors.push({
      field: `${prefix}.type`,
      code: 'MISSING_FIELD',
      message: 'Effect type is required',
      severity: 'error',
    });
    return;
  }
  
  const validTypes = ['log', 'enqueue-task', 'invalidate-render', 'cancel-webapi'];
  if (!validTypes.includes(effect.type)) {
    errors.push({
      field: `${prefix}.type`,
      code: 'INVALID_VALUE',
      message: `Invalid effect type: ${effect.type}`,
      severity: 'error',
      suggestion: `Valid types: ${validTypes.join(', ')}`,
    });
  }
  
  // Validate payload based on type
  if (effect.type === 'log' && typeof effect.payload !== 'string') {
    errors.push({
      field: `${prefix}.payload`,
      code: 'INVALID_TYPE',
      message: 'Log effect payload must be a string',
      severity: 'error',
    });
  }
}
```

## Success Criteria

- [ ] All validation functions compile without errors
- [ ] Valid scenarios pass validation
- [ ] Invalid scenarios fail with clear errors
- [ ] Error messages are actionable
- [ ] Warnings don't prevent loading
- [ ] All task types validated correctly
- [ ] Type-specific fields validated
- [ ] Effects structure validated
- [ ] Can handle malformed JSON
- [ ] Provides suggestions for common errors

## Test Specifications

### Test: Valid scenario passes

```typescript
test('valid scenario passes validation', () => {
  const scenario: Scenario = {
    id: 'test-scenario',
    name: 'Test Scenario',
    description: 'A test scenario',
    learningObjective: 'Learn something',
    tags: ['test'],
    schemaVersion: 1,
    tasks: [
      {
        type: TaskType.SYNC,
        label: 'Test task',
      }
    ],
  };
  
  const result = validateScenario(scenario);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toEqual(scenario);
  }
});
```

### Test: Missing required field fails

```typescript
test('missing id fails validation', () => {
  const scenario = {
    name: 'Test',
    description: 'Test',
    learningObjective: 'Learn',
    tasks: [],
    tags: [],
    schemaVersion: 1,
  };
  
  const result = validateScenario(scenario);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'id',
        code: 'MISSING_FIELD',
      })
    );
  }
});
```

### Test: Invalid task type fails

```typescript
test('invalid task type fails validation', () => {
  const scenario = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    learningObjective: 'Learn',
    tasks: [
      { type: 'invalid-type', label: 'Test' }
    ],
    tags: [],
    schemaVersion: 1,
  };
  
  const result = validateScenario(scenario);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'tasks[0].type',
        code: 'INVALID_VALUE',
      })
    );
  }
});
```

### Test: Timer without delay fails

```typescript
test('timer task without delay fails validation', () => {
  const scenario: any = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    learningObjective: 'Learn',
    tasks: [
      { type: TaskType.TIMER, label: 'Timer' }
      // Missing delay
    ],
    tags: [],
    schemaVersion: 1,
  };
  
  const result = validateScenario(scenario);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'tasks[0].delay',
        code: 'MISSING_FIELD',
      })
    );
  }
});
```

### Test: Negative delay fails

```typescript
test('negative delay fails validation', () => {
  const scenario: any = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    learningObjective: 'Learn',
    tasks: [
      { type: TaskType.TIMER, label: 'Timer', delay: -1 }
    ],
    tags: [],
    schemaVersion: 1,
  };
  
  const result = validateScenario(scenario);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'tasks[0].delay',
        code: 'TOO_SMALL',
      })
    );
  }
});
```

### Test: Warnings don't prevent loading

```typescript
test('warnings allow loading but report issues', () => {
  const scenario: any = {
    id: 'test',
    name: 'Test',
    description: 'Test',
    // Missing learningObjective (should warn)
    tasks: [
      { type: TaskType.SYNC, label: 'Task' }
    ],
    tags: [],
    schemaVersion: 1,
  };
  
  const result = validateScenario(scenario);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        field: 'learningObjective',
        severity: 'warning',
      })
    );
  }
});
```

## Integration Points

- **Session 6.2**: Builder UI uses validation to show inline errors
- **Session 6.3**: Presets must pass validation
- **Session 6.4**: Presets must pass validation
- **Phase 2**: Validation runs before LOAD_SCENARIO action

## References

- [Scenario Types](./schema.ts)
- [Task Types](../phase-01-core-simulator/session-1.1-types.md)
- [Zod Documentation](https://zod.dev)
- [JSON Schema Validation](https://json-schema.org/)

## Notes

- Consider using Zod for automatic type inference
- Validation should be fast (< 10ms for typical scenarios)
- Error messages should be end-user friendly
- Provide suggestions for common mistakes
- Consider internationalization for error messages
