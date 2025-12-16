# Session 1.1: Type Definitions

## Overview

This session defines the complete type system for the event loop simulator. All interfaces, types, and enums needed by the simulation engine will be created here. These types form the contract between all simulator components and enable TypeScript to catch errors at compile-time.

## Prerequisites

- Project initialized with TypeScript configuration
- Understanding of TypeScript discriminated unions
- Understanding of the event loop model (see `reference/event-loop-rules.md`)

## Goals

- [ ] Define `Task` type with discriminated union for all task types
- [ ] Define `SimulatorState` interface
- [ ] Define `WebApiOperation` interface
- [ ] Define `Frame`, `LogEntry`, and `SimulationSnapshot` types
- [ ] Define queue and stack interfaces
- [ ] Define all enums (`TaskType`, `TaskState`, `QueueType`, etc.)
- [ ] Add JSDoc comments to all exported types
- [ ] Ensure strict type-checking with no `any` types

## Files to Create

### `src/core/types/index.ts`
**Purpose:** Barrel export for all types
**Exports:** Re-exports from other type files

### `src/core/types/task.ts`
**Purpose:** Task-related types
**Exports:** `Task`, `TaskType`, `TaskState`, `TaskEffect`, and type guards
**Key responsibilities:**
- Define base task properties shared by all task types
- Define specific properties for each task type (timer, promise, fetch, etc.)
- Use discriminated unions for type-safe task handling
- Provide type guard functions

### `src/core/types/simulator.ts`
**Purpose:** Simulator state types
**Exports:** `SimulatorState`, `Frame`, `LogEntry`, `SimulationSnapshot`
**Key responsibilities:**
- Define the complete state shape of the simulator
- Define call stack frame structure
- Define log entry format
- Define snapshot format for history

### `src/core/types/queue.ts`
**Purpose:** Queue and stack types
**Exports:** `Queue`, `Stack`, `QueueType`
**Key responsibilities:**
- Define generic queue interface
- Define generic stack interface
- Define queue type enum

### `src/core/types/webapi.ts`
**Purpose:** Web API operation types
**Exports:** `WebApiOperation`, `WebApiType`
**Key responsibilities:**
- Define structure for pending Web API operations
- Define types for different Web API sources

### `src/core/types/scenario.ts`
**Purpose:** Scenario definition types
**Exports:** `Scenario`, `ScenarioTask`, `ScenarioDefinition`
**Key responsibilities:**
- Define how scenarios are structured
- Define validation constraints

## Type Definitions

### Task Types

```typescript
/**
 * Discriminant for task types. Used to differentiate task variants in the Task union.
 */
export enum TaskType {
  SYNC = 'sync',
  TIMER = 'timer',
  INTERVAL = 'interval',
  MICROTASK = 'microtask',
  PROMISE = 'promise',
  ASYNC_CONTINUATION = 'async-continuation',
  FETCH = 'fetch',
  DOM_EVENT = 'dom-event',
  RAF = 'raf',
}

/**
 * Lifecycle state of a task.
 */
export enum TaskState {
  CREATED = 'created',
  WAITING_WEBAPI = 'waiting-webapi',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

/**
 * Base properties shared by all task types.
 */
interface BaseTask {
  id: string;
  label: string;
  createdAt: number;          // Logical time when created
  enqueueSeq: number;         // Monotonic sequence for tie-breaking
  origin: string | null;      // Parent task ID or 'scenario'
  state: TaskState;
  durationSteps: number;      // How many simulation steps to execute (≥1)
  effects: TaskEffect[];      // What this task does when executed
}

/**
 * Effects that a task can produce when executed.
 */
export interface TaskEffect {
  type: 'enqueue-task' | 'log' | 'invalidate-render' | 'cancel-webapi';
  payload: unknown;           // Type depends on effect type
}

/**
 * Synchronous function call task.
 */
export interface SyncTask extends BaseTask {
  type: TaskType.SYNC;
}

/**
 * setTimeout callback task.
 */
export interface TimerTask extends BaseTask {
  type: TaskType.TIMER;
  delay: number;              // Original delay in ms
}

/**
 * Promise.then/queueMicrotask callback.
 */
export interface MicrotaskTask extends BaseTask {
  type: TaskType.MICROTASK;
}

/**
 * async function continuation after await.
 */
export interface AsyncContinuationTask extends BaseTask {
  type: TaskType.ASYNC_CONTINUATION;
}

/**
 * fetch completion callback.
 */
export interface FetchTask extends BaseTask {
  type: TaskType.FETCH;
  url: string;
  latency: number;            // Simulated network latency
}

/**
 * DOM event handler.
 */
export interface DomEventTask extends BaseTask {
  type: TaskType.DOM_EVENT;
  eventType: string;          // e.g., 'click', 'input'
}

/**
 * requestAnimationFrame callback.
 */
export interface RafTask extends BaseTask {
  type: TaskType.RAF;
}

/**
 * Union type for all task variants. Use discriminated union on `type` field.
 */
export type Task =
  | SyncTask
  | TimerTask
  | MicrotaskTask
  | AsyncContinuationTask
  | FetchTask
  | DomEventTask
  | RafTask;

/**
 * Type guard to check if a task is a timer task.
 */
export function isTimerTask(task: Task): task is TimerTask {
  return task.type === TaskType.TIMER;
}

// Add similar type guards for other task types...
```

### Simulator State

```typescript
/**
 * A call stack frame representing a currently executing task.
 */
export interface Frame {
  task: Task;
  startedAt: number;          // Logical time when started
  stepsRemaining: number;     // Steps left to complete
}

/**
 * A log entry produced by task execution or system events.
 */
export interface LogEntry {
  timestamp: number;          // Logical time
  type: 'task-start' | 'task-complete' | 'enqueue' | 'render' | 'user';
  message: string;
  taskId?: string;            // Associated task if applicable
  metadata?: Record<string, unknown>;
}

/**
 * Complete state of the event loop simulator.
 */
export interface SimulatorState {
  // Core structures
  callStack: Frame[];
  webApis: Map<string, WebApiOperation>;
  macroQueue: Task[];
  microQueue: Task[];
  rafQueue: Task[];

  // Time and sequencing
  now: number;                // Current logical time in ms
  stepIndex: number;          // Total simulation steps taken
  enqueueCounter: number;     // Monotonic counter for enqueueSeq

  // Frame timing
  frameInterval: number;      // ms between frames (e.g., 16 for 60fps)
  frameCounter: number;       // Number of frames rendered
  renderPending: boolean;     // Whether render is needed
  lastFrameAt: number;        // Logical time of last frame

  // History and logging
  log: LogEntry[];
}

/**
 * Snapshot of simulator state for history/time-travel.
 */
export interface SimulationSnapshot {
  stepIndex: number;
  state: SimulatorState;
}
```

### Web API Operations

```typescript
/**
 * Types of Web API operations.
 */
export enum WebApiType {
  TIMER = 'timer',
  INTERVAL = 'interval',
  FETCH = 'fetch',
  DOM_EVENT = 'dom-event',
  RAF = 'raf',
}

/**
 * Represents an in-flight Web API operation.
 */
export interface WebApiOperation {
  id: string;
  type: WebApiType;
  readyAt: number;            // Logical time when this becomes ready
  targetQueue: 'macro' | 'micro' | 'raf';
  payloadTask: Task;          // Task to enqueue when ready
  recurring?: boolean;        // For setInterval
}
```

### Queue Types

```typescript
/**
 * Generic queue interface (FIFO).
 */
export interface Queue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  size(): number;
  isEmpty(): boolean;
  toArray(): T[];
  clear(): void;
}

/**
 * Generic stack interface (LIFO).
 */
export interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  size(): number;
  isEmpty(): boolean;
  toArray(): T[];
  clear(): void;
}

/**
 * Type of queue in the simulator.
 */
export enum QueueType {
  MACRO = 'macro',
  MICRO = 'micro',
  RAF = 'raf',
}
```

### Scenario Types

```typescript
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
  tags: string[];             // e.g., ['microtasks', 'promises']
}

/**
 * A task definition in a scenario.
 */
export interface ScenarioTask {
  type: TaskType;
  label: string;
  delay?: number;             // For timers
  latency?: number;           // For fetch
  durationSteps?: number;     // Default 1
  effects?: TaskEffect[];     // What happens when executed
  dependsOn?: string;         // Task ID this depends on
}

/**
 * Validation error for scenarios.
 */
export interface ScenarioValidationError {
  field: string;
  message: string;
}
```

## Implementation Specifications

### Discriminated Unions
Use TypeScript's discriminated unions for the `Task` type. The `type` field is the discriminant:

```typescript
function handleTask(task: Task) {
  switch (task.type) {
    case TaskType.TIMER:
      // TypeScript knows task is TimerTask here
      console.log(task.delay);
      break;
    case TaskType.FETCH:
      // TypeScript knows task is FetchTask here
      console.log(task.url);
      break;
    // ...
  }
}
```

### Type Guards
Provide type guard functions for narrowing types:

```typescript
if (isTimerTask(task)) {
  // task is TimerTask
  processTimer(task);
}
```

### Readonly Properties
Consider making certain properties readonly:

```typescript
export interface BaseTask {
  readonly id: string;
  readonly createdAt: number;
  // ... mutable properties
  state: TaskState;
}
```

### Generic Constraints
Ensure Queue and Stack are properly generic:

```typescript
// Should work with any type
const taskQueue: Queue<Task> = new QueueImpl<Task>();
const frameStack: Stack<Frame> = new StackImpl<Frame>();
```

## Success Criteria

- [ ] All type files compile without errors
- [ ] No `any` types used (except in effect payload - to be refined later)
- [ ] Discriminated unions work correctly (TypeScript narrows types)
- [ ] JSDoc comments on all exported types
- [ ] Type guards provided for all Task variants
- [ ] Can import types: `import { Task, SimulatorState } from '@/core/types'`
- [ ] TypeScript strict mode passes
- [ ] Types match the specification in requirements document

## Test Specifications

### Test: Type guards work correctly
**Given:** A Task object of specific type
**When:** Type guard function is called
**Then:** Returns true for correct type, false otherwise

```typescript
test('isTimerTask correctly identifies timer tasks', () => {
  const timerTask: Task = {
    type: TaskType.TIMER,
    id: '1',
    delay: 100,
    // ... other properties
  };
  
  expect(isTimerTask(timerTask)).toBe(true);
  expect(isFetchTask(timerTask)).toBe(false);
});
```

### Test: Discriminated union narrows types
**Given:** A Task union type
**When:** Switch on task.type
**Then:** TypeScript correctly narrows to specific task type

```typescript
test('discriminated union allows type-safe access', () => {
  const task: Task = createTimerTask({ delay: 100 });
  
  if (task.type === TaskType.TIMER) {
    // Should compile - delay exists on TimerTask
    expect(task.delay).toBe(100);
  }
});
```

### Test: Queue interface is properly generic
**Given:** Queue interface
**When:** Instantiated with different types
**Then:** Works correctly with any type

```typescript
test('queue works with Task type', () => {
  const queue: Queue<Task> = new QueueImpl<Task>();
  const task: Task = createSyncTask();
  queue.enqueue(task);
  expect(queue.size()).toBe(1);
});

test('queue works with number type', () => {
  const queue: Queue<number> = new QueueImpl<number>();
  queue.enqueue(42);
  expect(queue.dequeue()).toBe(42);
});
```

## Integration Points

- **Session 1.2**: Queue and Stack will implement these interfaces
- **Session 1.3**: Enqueue rules will create Task objects
- **Session 1.4**: Tick function will operate on SimulatorState
- **Phase 2**: State management will wrap SimulatorState

## References

- [TypeScript Handbook: Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
- [TypeScript Handbook: Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Event Loop Rules](../../reference/event-loop-rules.md)
- [Simulator Model Spec](../../architecture/simulator-model.md)

## Notes

- Use `enum` for fixed sets of string values (TaskType, TaskState)
- Use `interface` for object shapes
- Use `type` for unions and complex types
- Prefer `readonly` for immutable properties
- Add `@internal` JSDoc tag for types not meant for external use
