# Session 1.2: Queue and Stack Data Structures

## Overview

This session implements the Queue and Stack data structures needed by the simulator. Both are generic, type-safe implementations that will hold tasks and frames. These structures are fundamental to the event loop model and must guarantee FIFO (queue) and LIFO (stack) ordering.

## Prerequisites

- Session 1.1 complete (types defined)
- Understanding of queue and stack data structures
- TypeScript generics

## Goals

- [ ] Implement generic `Queue<T>` class
- [ ] Implement generic `Stack<T>` class  
- [ ] Add utility functions for queue/stack operations
- [ ] Create initial state factory function
- [ ] Write comprehensive unit tests
- [ ] Ensure O(1) enqueue/dequeue performance

## Files to Create/Modify

### `src/core/simulator/queue.ts`
**Purpose:** Queue and Stack implementations
**Exports:** `QueueImpl`, `StackImpl`
**Key responsibilities:**
- Provide fast FIFO queue operations
- Provide fast LIFO stack operations
- Maintain order guarantees
- Support inspection without mutation

### `src/core/simulator/state.ts`
**Purpose:** Initial state creation
**Exports:** `createInitialState`, `createEmptyState`
**Key responsibilities:**
- Create new simulator state with default values
- Initialize queues and stacks
- Set initial time and counters

### `src/core/simulator/index.ts`
**Purpose:** Barrel export
**Exports:** Re-exports from queue.ts and state.ts

## Type Definitions

Uses types from Session 1.1:

```typescript
import { Queue, Stack } from '@/core/types/queue';
import { SimulatorState, Frame } from '@/core/types/simulator';
import { Task } from '@/core/types/task';
```

## Implementation Specifications

### Queue Implementation

**Purpose:** FIFO queue for tasks
**Operations:** enqueue (add to back), dequeue (remove from front), peek, size, isEmpty

**Implementation approach:** Use JavaScript array with performance considerations:

```typescript
export class QueueImpl<T> implements Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);  // O(1) amortized
  }

  dequeue(): T | undefined {
    return this.items.shift();  // O(n) - acceptable for small queues
  }

  peek(): T | undefined {
    return this.items[0];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items];  // Return copy to prevent mutation
  }

  clear(): void {
    this.items = [];
  }
}
```

**Performance note:** `shift()` is O(n), but for typical scenario sizes (< 100 tasks) this is acceptable. For larger scenarios, could optimize with circular buffer, but that adds complexity.

**Type safety:** Generic `T` allows using with any type:
```typescript
const taskQueue = new QueueImpl<Task>();
const frameStack = new StackImpl<Frame>();
```

### Stack Implementation

**Purpose:** LIFO stack for call stack frames
**Operations:** push (add to top), pop (remove from top), peek, size, isEmpty

```typescript
export class StackImpl<T> implements Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);  // O(1)
  }

  pop(): T | undefined {
    return this.items.pop();  // O(1)
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items];  // Top of stack is last element
  }

  clear(): void {
    this.items = [];
  }
}
```

**Edge cases:**
- `pop()` and `dequeue()` on empty structures return `undefined`
- `peek()` on empty structure returns `undefined`
- `toArray()` returns a copy (immutability)

### Initial State Factory

**Purpose:** Create a fresh simulator state
**Function signature:**
```typescript
function createInitialState(options?: {
  frameInterval?: number;
}): SimulatorState
```

**Implementation:**
```typescript
export function createInitialState(options: {
  frameInterval?: number;
} = {}): SimulatorState {
  return {
    // Core structures (empty)
    callStack: [],
    webApis: new Map(),
    macroQueue: [],
    microQueue: [],
    rafQueue: [],

    // Time and sequencing
    now: 0,
    stepIndex: 0,
    enqueueCounter: 0,

    // Frame timing
    frameInterval: options.frameInterval ?? 16,  // Default 60fps
    frameCounter: 0,
    renderPending: false,
    lastFrameAt: 0,

    // Logs
    log: [],
  };
}
```

**Usage:**
```typescript
const state = createInitialState();
const state60fps = createInitialState({ frameInterval: 16 });
const state30fps = createInitialState({ frameInterval: 33 });
```

## Success Criteria

- [ ] Queue enqueues and dequeues in FIFO order
- [ ] Stack pushes and pops in LIFO order
- [ ] Operations handle empty structures gracefully
- [ ] `toArray()` returns copies (mutations don't affect original)
- [ ] Works with any generic type `T`
- [ ] `createInitialState()` produces valid state
- [ ] All tests pass with 100% coverage

## Test Specifications

### Test: Queue FIFO ordering
**Given:** Empty queue
**When:** Enqueue A, B, C; then dequeue 3 times
**Then:** Returns A, B, C in that order

```typescript
test('queue maintains FIFO order', () => {
  const queue = new QueueImpl<string>();
  queue.enqueue('A');
  queue.enqueue('B');
  queue.enqueue('C');
  
  expect(queue.dequeue()).toBe('A');
  expect(queue.dequeue()).toBe('B');
  expect(queue.dequeue()).toBe('C');
  expect(queue.dequeue()).toBeUndefined();
});
```

### Test: Stack LIFO ordering
**Given:** Empty stack
**When:** Push A, B, C; then pop 3 times
**Then:** Returns C, B, A in that order

```typescript
test('stack maintains LIFO order', () => {
  const stack = new StackImpl<string>();
  stack.push('A');
  stack.push('B');
  stack.push('C');
  
  expect(stack.pop()).toBe('C');
  expect(stack.pop()).toBe('B');
  expect(stack.pop()).toBe('A');
  expect(stack.pop()).toBeUndefined();
});
```

### Test: Queue size tracking
**Given:** Queue with operations
**When:** Enqueue/dequeue items
**Then:** Size is always accurate

```typescript
test('queue tracks size correctly', () => {
  const queue = new QueueImpl<number>();
  expect(queue.size()).toBe(0);
  expect(queue.isEmpty()).toBe(true);
  
  queue.enqueue(1);
  queue.enqueue(2);
  expect(queue.size()).toBe(2);
  expect(queue.isEmpty()).toBe(false);
  
  queue.dequeue();
  expect(queue.size()).toBe(1);
  
  queue.dequeue();
  expect(queue.size()).toBe(0);
  expect(queue.isEmpty()).toBe(true);
});
```

### Test: toArray immutability
**Given:** Queue with items
**When:** Get array and modify it
**Then:** Original queue unchanged

```typescript
test('toArray returns copy', () => {
  const queue = new QueueImpl<number>();
  queue.enqueue(1);
  queue.enqueue(2);
  
  const arr = queue.toArray();
  arr.push(3);  // Modify copy
  
  expect(queue.size()).toBe(2);  // Original unchanged
  expect(queue.toArray()).toEqual([1, 2]);
});
```

### Test: Peek doesn't remove
**Given:** Queue with items
**When:** Call peek multiple times
**Then:** Always returns same item, size unchanged

```typescript
test('peek does not remove item', () => {
  const queue = new QueueImpl<string>();
  queue.enqueue('first');
  queue.enqueue('second');
  
  expect(queue.peek()).toBe('first');
  expect(queue.peek()).toBe('first');
  expect(queue.size()).toBe(2);
});
```

### Test: Generic type support
**Given:** Queue with custom type
**When:** Operations performed
**Then:** Type safety maintained

```typescript
test('works with Task type', () => {
  interface MockTask {
    id: string;
    label: string;
  }
  
  const queue = new QueueImpl<MockTask>();
  const task: MockTask = { id: '1', label: 'Test' };
  
  queue.enqueue(task);
  const retrieved = queue.dequeue();
  
  expect(retrieved).toEqual(task);
  // TypeScript ensures retrieved is MockTask | undefined
});
```

### Test: Initial state is valid
**Given:** Call createInitialState
**When:** Inspect returned state
**Then:** All fields present and correct

```typescript
test('createInitialState produces valid state', () => {
  const state = createInitialState();
  
  expect(state.now).toBe(0);
  expect(state.stepIndex).toBe(0);
  expect(state.callStack).toEqual([]);
  expect(state.macroQueue).toEqual([]);
  expect(state.microQueue).toEqual([]);
  expect(state.frameInterval).toBe(16);
  expect(state.log).toEqual([]);
});

test('createInitialState accepts custom frameInterval', () => {
  const state = createInitialState({ frameInterval: 33 });
  expect(state.frameInterval).toBe(33);
});
```

## Integration Points

- **Session 1.1**: Uses types defined there
- **Session 1.3**: Enqueue rules will use these queues
- **Session 1.4**: Tick function will manipulate queues and stack
- **Phase 2**: State management will wrap these in React state

## References

- [Queue data structure](https://en.wikipedia.org/wiki/Queue_(abstract_data_type))
- [Stack data structure](https://en.wikipedia.org/wiki/Stack_(abstract_data_type))
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

## Notes

### Why not use Array directly?

We could use plain arrays, but wrapping in Queue/Stack classes:
- Makes intent explicit
- Provides consistent API
- Allows optimizations later without changing call sites
- Adds type safety (can't accidentally push to queue)

### Alternative: Circular Buffer

For very large queues, circular buffer would be O(1) for dequeue instead of O(n). But adds complexity. Current implementation is sufficient for this use case.

### Immutability

These classes are mutable (for performance). Immutability is handled at the reducer level using Immer, not at the queue level.
