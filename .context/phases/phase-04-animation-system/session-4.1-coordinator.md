# Session 4.1: Animation Coordinator and Queuing System

## Overview

This session builds the **animation coordinator** - the central system that watches for state changes, determines what animations to play, queues them, and executes them sequentially. The coordinator acts as the bridge between the state layer and the visual layer, ensuring smooth transitions synchronized with simulation steps.

## Prerequisites

- Phase 1 (Core Simulator) complete
- Phase 2 (State Management) complete
- Phase 3 (UI Scaffolding) complete
- Framer Motion installed
- Understanding of async/await and Promises
- Understanding of React useEffect lifecycle

## Goals

- [ ] Define animation types and state change detection
- [ ] Implement animation queue data structure
- [ ] Build state change detector (diff previous vs current state)
- [ ] Create animation coordinator hook
- [ ] Implement sequential animation execution
- [ ] Add speed multiplier support
- [ ] Handle animation cancellation (when user steps back/resets)
- [ ] Integrate with SimulatorContext to watch state changes

## Files to Create

### `src/animations/types.ts`
**Purpose:** Type definitions for animation system
**Exports:** `AnimationType`, `Animation`, `AnimationChange`

### `src/animations/config.ts`
**Purpose:** Animation configuration constants
**Exports:** Duration constants, easing functions, variant presets

### `src/animations/detector.ts`
**Purpose:** State change detection logic
**Exports:** `detectChanges()` function

### `src/animations/queue.ts`
**Purpose:** Animation queue data structure
**Exports:** `AnimationQueue` class

### `src/animations/coordinator.ts`
**Purpose:** Main animation coordinator
**Exports:** `AnimationCoordinator` class, `useAnimationCoordinator()` hook

## Type Definitions

### Animation Types

```typescript
/**
 * Types of animations that can occur in the visualization.
 */
export enum AnimationType {
  TASK_CREATED = 'task-created',
  TASK_ENQUEUED = 'task-enqueued',
  TASK_MOVED = 'task-moved',
  TASK_EXECUTING = 'task-executing',
  TASK_COMPLETED = 'task-completed',
  MICROTASK_DRAIN = 'microtask-drain',
  RENDER_STEP = 'render-step',
}

/**
 * Represents a detected state change that should trigger animation.
 */
export interface AnimationChange {
  type: AnimationType;
  taskId: string;
  from?: Region;  // Source region (for movements)
  to?: Region;    // Destination region (for movements)
  metadata?: Record<string, unknown>;
}

/**
 * Queued animation ready to execute.
 */
export interface Animation {
  id: string;
  change: AnimationChange;
  duration: number;      // In milliseconds
  delay?: number;        // Delay before starting
  execute: () => Promise<void>;  // Function that performs the animation
}

/**
 * Regions where tasks can exist.
 */
export type Region = 
  | 'webapis'
  | 'macro-queue'
  | 'micro-queue'
  | 'raf-queue'
  | 'call-stack'
  | 'render-pipeline';
```

### Animation Configuration

```typescript
/**
 * Base animation durations (in ms). Actual duration = BASE / speed.
 */
export const ANIMATION_DURATION = {
  FAST: 200,        // Quick state changes
  NORMAL: 400,      // Standard movements
  SLOW: 600,        // Complex transitions
} as const;

/**
 * Easing functions for different animation types.
 */
export const EASING = {
  EASE_OUT: [0.0, 0.0, 0.2, 1],     // Material Design ease-out
  EASE_IN_OUT: [0.4, 0.0, 0.2, 1],  // Material Design ease-in-out
  LINEAR: [0, 0, 1, 1],              // Linear
} as const;

/**
 * Delay between sequential animations (in ms).
 */
export const ANIMATION_STAGGER = 100;
```

## Implementation Specifications

### State Change Detector

**Location:** `src/animations/detector.ts`

```typescript
import { SimulatorState } from '@/core/types';
import { AnimationChange, AnimationType } from './types';

/**
 * Compares two simulator states and returns list of detected changes
 * that should trigger animations.
 */
export function detectChanges(
  prev: SimulatorState,
  current: SimulatorState
): AnimationChange[] {
  const changes: AnimationChange[] = [];

  // Detect tasks added to queues
  changes.push(...detectEnqueuedTasks(prev, current));

  // Detect tasks moving between regions
  changes.push(...detectTaskMovements(prev, current));

  // Detect tasks starting execution
  changes.push(...detectExecutingTasks(prev, current));

  // Detect tasks completing
  changes.push(...detectCompletedTasks(prev, current));

  return changes;
}

/**
 * Detect tasks newly added to any queue.
 */
function detectEnqueuedTasks(
  prev: SimulatorState,
  current: SimulatorState
): AnimationChange[] {
  const changes: AnimationChange[] = [];

  // Check macro queue
  const newMacroTasks = current.macroQueue.filter(
    task => !prev.macroQueue.some(t => t.id === task.id)
  );
  newMacroTasks.forEach(task => {
    changes.push({
      type: AnimationType.TASK_ENQUEUED,
      taskId: task.id,
      to: 'macro-queue',
    });
  });

  // Check micro queue
  const newMicroTasks = current.microQueue.filter(
    task => !prev.microQueue.some(t => t.id === task.id)
  );
  newMicroTasks.forEach(task => {
    changes.push({
      type: AnimationType.TASK_ENQUEUED,
      taskId: task.id,
      to: 'micro-queue',
    });
  });

  // Check rAF queue
  const newRafTasks = current.rafQueue.filter(
    task => !prev.rafQueue.some(t => t.id === task.id)
  );
  newRafTasks.forEach(task => {
    changes.push({
      type: AnimationType.TASK_ENQUEUED,
      taskId: task.id,
      to: 'raf-queue',
    });
  });

  return changes;
}

/**
 * Detect tasks moving from Web APIs to queues.
 */
function detectTaskMovements(
  prev: SimulatorState,
  current: SimulatorState
): AnimationChange[] {
  const changes: AnimationChange[] = [];

  // Tasks that were in Web APIs and are now in queues
  prev.webApis.forEach((operation, id) => {
    if (!current.webApis.has(id)) {
      // Find where the task ended up
      const inMacro = current.macroQueue.some(t => t.id === operation.payloadTask.id);
      const inMicro = current.microQueue.some(t => t.id === operation.payloadTask.id);
      const inRaf = current.rafQueue.some(t => t.id === operation.payloadTask.id);

      if (inMacro) {
        changes.push({
          type: AnimationType.TASK_MOVED,
          taskId: operation.payloadTask.id,
          from: 'webapis',
          to: 'macro-queue',
        });
      } else if (inMicro) {
        changes.push({
          type: AnimationType.TASK_MOVED,
          taskId: operation.payloadTask.id,
          from: 'webapis',
          to: 'micro-queue',
        });
      } else if (inRaf) {
        changes.push({
          type: AnimationType.TASK_MOVED,
          taskId: operation.payloadTask.id,
          from: 'webapis',
          to: 'raf-queue',
        });
      }
    }
  });

  return changes;
}

/**
 * Detect tasks starting execution (entering call stack).
 */
function detectExecutingTasks(
  prev: SimulatorState,
  current: SimulatorState
): AnimationChange[] {
  const changes: AnimationChange[] = [];

  // Check if call stack has new frames
  const prevStackIds = prev.callStack.map(f => f.task.id);
  const currentStackIds = current.callStack.map(f => f.task.id);

  currentStackIds.forEach(id => {
    if (!prevStackIds.includes(id)) {
      changes.push({
        type: AnimationType.TASK_EXECUTING,
        taskId: id,
        to: 'call-stack',
      });
    }
  });

  return changes;
}

/**
 * Detect tasks completing execution.
 */
function detectCompletedTasks(
  prev: SimulatorState,
  current: SimulatorState
): AnimationChange[] {
  const changes: AnimationChange[] = [];

  // Tasks that were executing and are now gone
  const prevStackIds = prev.callStack.map(f => f.task.id);
  const currentStackIds = current.callStack.map(f => f.task.id);

  prevStackIds.forEach(id => {
    if (!currentStackIds.includes(id)) {
      changes.push({
        type: AnimationType.TASK_COMPLETED,
        taskId: id,
      });
    }
  });

  return changes;
}
```

### Animation Queue

**Location:** `src/animations/queue.ts`

```typescript
import { Animation } from './types';

/**
 * Manages a queue of animations to execute sequentially.
 */
export class AnimationQueue {
  private queue: Animation[] = [];
  private isExecuting = false;
  private currentAnimation: Animation | null = null;

  /**
   * Add animation to the queue.
   */
  enqueue(animation: Animation): void {
    this.queue.push(animation);
  }

  /**
   * Add multiple animations to the queue.
   */
  enqueueBatch(animations: Animation[]): void {
    this.queue.push(...animations);
  }

  /**
   * Clear all pending animations.
   */
  clear(): void {
    this.queue = [];
    this.currentAnimation = null;
  }

  /**
   * Execute all animations in the queue sequentially.
   */
  async executeAll(): Promise<void> {
    if (this.isExecuting) {
      return; // Already executing
    }

    this.isExecuting = true;

    while (this.queue.length > 0) {
      const animation = this.queue.shift()!;
      this.currentAnimation = animation;

      // Wait for delay if specified
      if (animation.delay) {
        await this.sleep(animation.delay);
      }

      // Execute animation
      await animation.execute();

      this.currentAnimation = null;
    }

    this.isExecuting = false;
  }

  /**
   * Check if queue is currently executing.
   */
  isActive(): boolean {
    return this.isExecuting;
  }

  /**
   * Get current animation being executed.
   */
  getCurrent(): Animation | null {
    return this.currentAnimation;
  }

  /**
   * Get number of pending animations.
   */
  size(): number {
    return this.queue.length;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Animation Coordinator

**Location:** `src/animations/coordinator.ts`

```typescript
import { useEffect, useRef } from 'react';
import { useSimulator } from '@/state/hooks';
import { usePlayback } from '@/state/hooks/usePlayback';
import { detectChanges } from './detector';
import { AnimationQueue } from './queue';
import { Animation, AnimationChange, AnimationType } from './types';
import { ANIMATION_DURATION, ANIMATION_STAGGER } from './config';

/**
 * Hook that coordinates animations based on state changes.
 * 
 * Watches simulator state, detects changes, queues animations,
 * and executes them sequentially with proper timing.
 */
export function useAnimationCoordinator() {
  const { state } = useSimulator();
  const { speed, isPlaying } = usePlayback();
  const prevStateRef = useRef(state);
  const queueRef = useRef(new AnimationQueue());

  useEffect(() => {
    const prevState = prevStateRef.current;
    const currentState = state;

    // Detect what changed
    const changes = detectChanges(prevState, currentState);

    if (changes.length > 0) {
      // Convert changes to animations
      const animations = changes.map(change => 
        createAnimation(change, speed)
      );

      // Queue animations
      queueRef.current.enqueueBatch(animations);

      // Execute queue
      queueRef.current.executeAll();
    }

    // Update ref for next comparison
    prevStateRef.current = currentState;
  }, [state, speed]);

  // Clear queue when user resets or steps back
  useEffect(() => {
    return () => {
      queueRef.current.clear();
    };
  }, []);

  return {
    isAnimating: queueRef.current.isActive(),
    pendingCount: queueRef.current.size(),
  };
}

/**
 * Create an Animation object from a detected change.
 */
function createAnimation(
  change: AnimationChange,
  speed: number
): Animation {
  const baseDuration = getBaseDuration(change.type);
  const duration = baseDuration / speed;

  return {
    id: `${change.type}-${change.taskId}-${Date.now()}`,
    change,
    duration,
    execute: async () => {
      // Animation execution will be handled by TaskNode components
      // via Framer Motion. This function just waits for the duration.
      await sleep(duration);
    },
  };
}

/**
 * Get base duration for animation type.
 */
function getBaseDuration(type: AnimationType): number {
  switch (type) {
    case AnimationType.TASK_CREATED:
    case AnimationType.TASK_ENQUEUED:
      return ANIMATION_DURATION.FAST;
    case AnimationType.TASK_MOVED:
      return ANIMATION_DURATION.NORMAL;
    case AnimationType.TASK_EXECUTING:
    case AnimationType.TASK_COMPLETED:
      return ANIMATION_DURATION.FAST;
    case AnimationType.MICROTASK_DRAIN:
    case AnimationType.RENDER_STEP:
      return ANIMATION_DURATION.SLOW;
    default:
      return ANIMATION_DURATION.NORMAL;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Animation Context (Optional Enhancement)

**Location:** `src/animations/AnimationContext.tsx`

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useAnimationCoordinator } from './coordinator';

interface AnimationContextValue {
  isAnimating: boolean;
  pendingCount: number;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const coordinator = useAnimationCoordinator();

  return (
    <AnimationContext.Provider value={coordinator}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}
```

## Success Criteria

- [ ] detectChanges() correctly identifies all state changes
- [ ] AnimationQueue enqueues and executes animations sequentially
- [ ] useAnimationCoordinator() triggers animations on state change
- [ ] Animations scale with speed multiplier (0.25x to 4x)
- [ ] Queue clears when user resets or steps backward
- [ ] No animations overlap (fully sequential)
- [ ] TypeScript compiles without errors
- [ ] All functions have JSDoc comments

## Test Specifications

### Test: Detect enqueued tasks

**Given:** Previous state with empty macro queue
**When:** Current state has task in macro queue
**Then:** detectChanges returns TASK_ENQUEUED change

```typescript
test('detectChanges identifies newly enqueued task', () => {
  const prev: SimulatorState = {
    macroQueue: [],
    // ... other fields
  };

  const current: SimulatorState = {
    macroQueue: [
      { id: 'task-1', type: TaskType.TIMER, /* ... */ }
    ],
    // ... other fields
  };

  const changes = detectChanges(prev, current);

  expect(changes).toHaveLength(1);
  expect(changes[0]).toMatchObject({
    type: AnimationType.TASK_ENQUEUED,
    taskId: 'task-1',
    to: 'macro-queue',
  });
});
```

### Test: Detect task movement from Web APIs

**Given:** Task in Web APIs in previous state
**When:** Task moves to macro queue in current state
**Then:** detectChanges returns TASK_MOVED change

```typescript
test('detectChanges identifies task moving from webapis to macro', () => {
  const task = createTimerTask({ id: 'task-1' });
  const operation: WebApiOperation = {
    id: 'op-1',
    type: WebApiType.TIMER,
    payloadTask: task,
    // ... other fields
  };

  const prev: SimulatorState = {
    webApis: new Map([['op-1', operation]]),
    macroQueue: [],
    // ... other fields
  };

  const current: SimulatorState = {
    webApis: new Map(),
    macroQueue: [task],
    // ... other fields
  };

  const changes = detectChanges(prev, current);

  expect(changes).toContainEqual({
    type: AnimationType.TASK_MOVED,
    taskId: 'task-1',
    from: 'webapis',
    to: 'macro-queue',
  });
});
```

### Test: Animation queue executes sequentially

**Given:** Queue with 3 animations
**When:** executeAll() is called
**Then:** Animations execute one at a time in order

```typescript
test('AnimationQueue executes animations sequentially', async () => {
  const queue = new AnimationQueue();
  const order: number[] = [];

  queue.enqueue({
    id: '1',
    duration: 10,
    execute: async () => {
      order.push(1);
      await sleep(10);
    },
  });

  queue.enqueue({
    id: '2',
    duration: 10,
    execute: async () => {
      order.push(2);
      await sleep(10);
    },
  });

  queue.enqueue({
    id: '3',
    duration: 10,
    execute: async () => {
      order.push(3);
      await sleep(10);
    },
  });

  await queue.executeAll();

  expect(order).toEqual([1, 2, 3]);
});
```

### Test: Speed multiplier affects duration

**Given:** Animation with base duration 400ms
**When:** Speed is 2x
**Then:** Actual duration is 200ms

```typescript
test('createAnimation scales duration by speed', () => {
  const change: AnimationChange = {
    type: AnimationType.TASK_MOVED,
    taskId: 'task-1',
    from: 'webapis',
    to: 'macro-queue',
  };

  const animation = createAnimation(change, 2); // 2x speed

  expect(animation.duration).toBe(ANIMATION_DURATION.NORMAL / 2);
});
```

### Test: Queue clears on reset

**Given:** Queue with pending animations
**When:** clear() is called
**Then:** Queue is empty

```typescript
test('AnimationQueue clears all pending animations', () => {
  const queue = new AnimationQueue();
  
  queue.enqueue({ id: '1', duration: 100, execute: async () => {} });
  queue.enqueue({ id: '2', duration: 100, execute: async () => {} });

  expect(queue.size()).toBe(2);

  queue.clear();

  expect(queue.size()).toBe(0);
});
```

## Integration Points

- **Session 4.2**: TaskNode components will respond to animations queued here
- **Session 4.3**: Path calculation will be triggered by TASK_MOVED changes
- **Session 4.4**: Reduced motion will modify animation durations to 0
- **Phase 2 State**: Coordinator watches SimulatorContext for state changes
- **Phase 5 Controls**: Speed setting affects animation timing

## References

- [Framer Motion Orchestration](https://www.framer.com/motion/animation/#orchestration)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [Animation Data Flow](../../architecture/data-flow.md#animation-coordination)
- [Animation Layer Architecture](../../architecture/overview.md#animation-layer)

## Notes

- Animation execution is **asynchronous** - use async/await
- Coordinator uses **useEffect** to watch state changes
- Queue is stored in **useRef** to persist across renders
- Animations don't actually modify state - they're purely visual
- TaskNode components will use Framer Motion to respond to state changes
- This coordinator orchestrates **when** animations happen, not **how** they look
