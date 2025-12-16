/**
 * Tests for microtask draining logic.
 */

import { describe, it, expect } from 'vitest';
import {
  shouldDrainMicrotask,
  drainMicrotaskQueue,
} from '@/core/simulator/microtask';
import type { SimulatorState } from '@/core/types/simulator';
import type { Task } from '@/core/types/task';
import { TaskType, TaskState } from '@/core/types/task';

/**
 * Create a minimal test state with default values.
 */
function createTestState(overrides: Partial<SimulatorState> = {}): SimulatorState {
  return {
    callStack: [],
    webApis: new Map(),
    macroQueue: [],
    microQueue: [],
    rafQueue: [],
    now: 0,
    stepIndex: 0,
    enqueueCounter: 0,
    frameInterval: 16,
    frameCounter: 0,
    renderPending: false,
    lastFrameAt: 0,
    log: [],
    ...overrides,
  };
}

/**
 * Create a simple microtask for testing.
 */
function createMicrotask(
  id: string,
  label: string,
  effects: Task['effects'] = []
): Task {
  return {
    id,
    type: TaskType.MICROTASK,
    label,
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.QUEUED,
    durationSteps: 1,
    effects,
  };
}

describe('shouldDrainMicrotask', () => {
  it('returns true when call stack empty and microQueue not empty', () => {
    const state = createTestState({
      callStack: [],
      microQueue: [createMicrotask('micro-1', 'Test microtask')],
    });

    expect(shouldDrainMicrotask(state)).toBe(true);
  });

  it('returns false when call stack is not empty', () => {
    const state = createTestState({
      callStack: [
        {
          task: createMicrotask('micro-1', 'Running task'),
          startedAt: 0,
          stepsRemaining: 1,
        },
      ],
      microQueue: [createMicrotask('micro-2', 'Queued task')],
    });

    expect(shouldDrainMicrotask(state)).toBe(false);
  });

  it('returns false when microQueue is empty', () => {
    const state = createTestState({
      callStack: [],
      microQueue: [],
    });

    expect(shouldDrainMicrotask(state)).toBe(false);
  });

  it('returns false when both call stack and microQueue are empty', () => {
    const state = createTestState({
      callStack: [],
      microQueue: [],
    });

    expect(shouldDrainMicrotask(state)).toBe(false);
  });
});

describe('drainMicrotaskQueue', () => {
  it('executes all microtasks in queue', () => {
    const state = createTestState({
      microQueue: [
        createMicrotask('micro-1', 'Microtask 1'),
        createMicrotask('micro-2', 'Microtask 2'),
        createMicrotask('micro-3', 'Microtask 3'),
      ],
      enqueueCounter: 3,
    });

    const newState = drainMicrotaskQueue(state);

    // All microtasks should be executed
    expect(newState.microQueue).toHaveLength(0);
    expect(newState.callStack).toHaveLength(0);

    // Should have start and complete logs for each task
    const startLogs = newState.log.filter((l) => l.type === 'task-start');
    const completeLogs = newState.log.filter((l) => l.type === 'task-complete');
    expect(startLogs).toHaveLength(3);
    expect(completeLogs).toHaveLength(3);
  });

  it('handles nested microtasks - microtask enqueues another microtask', () => {
    // Microtask 1 enqueues Microtask 2
    const microtask2 = createMicrotask('micro-2', 'Nested microtask');
    const microtask1 = createMicrotask('micro-1', 'Parent microtask', [
      {
        type: 'enqueue-task',
        payload: {
          task: microtask2,
          queueType: 'micro' as const,
        },
      },
    ]);

    const state = createTestState({
      microQueue: [microtask1],
      macroQueue: [
        {
          id: 'macro-1',
          type: TaskType.TIMER,
          label: 'Macrotask',
          createdAt: 0,
          enqueueSeq: 0,
          origin: null,
          state: TaskState.QUEUED,
          durationSteps: 1,
          effects: [],
          delay: 0,
        },
      ],
      enqueueCounter: 2,
    });

    const newState = drainMicrotaskQueue(state);

    // Both microtasks should be executed
    expect(newState.microQueue).toHaveLength(0);
    expect(newState.callStack).toHaveLength(0);

    // Macrotask should still be in queue (not executed)
    expect(newState.macroQueue).toHaveLength(1);

    // Should have logs for both microtasks
    const logs = newState.log.filter(
      (l) => l.type === 'task-start' || l.type === 'task-complete'
    );
    expect(logs).toHaveLength(4); // 2 starts + 2 completes

    // Verify order: micro-1 start, micro-1 complete, micro-2 start, micro-2 complete
    expect(logs[0].message).toContain('Parent microtask');
    expect(logs[0].type).toBe('task-start');
    expect(logs[1].message).toContain('Parent microtask');
    expect(logs[1].type).toBe('task-complete');
    expect(logs[2].message).toContain('Nested microtask');
    expect(logs[2].type).toBe('task-start');
    expect(logs[3].message).toContain('Nested microtask');
    expect(logs[3].type).toBe('task-complete');
  });

  it('handles 10 nested microtasks all drain before first macrotask', () => {
    // Create a chain: micro-1 -> micro-2 -> ... -> micro-10
    const microtasks: Task[] = [];

    // Start from the last one and work backwards
    for (let i = 10; i >= 1; i--) {
      const effects: Task['effects'] = [];

      // If not the last microtask, enqueue the next one
      if (i < 10) {
        effects.push({
          type: 'enqueue-task',
          payload: {
            task: microtasks[0], // Next microtask (we're building backwards)
            queueType: 'micro' as const,
          },
        });
      }

      microtasks.unshift(createMicrotask(`micro-${i}`, `Microtask ${i}`, effects));
    }

    const state = createTestState({
      microQueue: [microtasks[0]], // Start with first microtask
      macroQueue: [
        {
          id: 'macro-1',
          type: TaskType.TIMER,
          label: 'Macrotask',
          createdAt: 0,
          enqueueSeq: 0,
          origin: null,
          state: TaskState.QUEUED,
          durationSteps: 1,
          effects: [],
          delay: 0,
        },
      ],
      enqueueCounter: 11,
    });

    const newState = drainMicrotaskQueue(state);

    // All 10 microtasks should be executed
    expect(newState.microQueue).toHaveLength(0);
    expect(newState.callStack).toHaveLength(0);

    // Macrotask should still be in queue (not executed)
    expect(newState.macroQueue).toHaveLength(1);
    expect(newState.macroQueue[0].label).toBe('Macrotask');

    // Should have 20 logs (10 starts + 10 completes)
    const logs = newState.log.filter(
      (l) => l.type === 'task-start' || l.type === 'task-complete'
    );
    expect(logs).toHaveLength(20);

    // Verify all microtasks executed in order
    for (let i = 1; i <= 10; i++) {
      const startLog = logs[(i - 1) * 2];
      const completeLog = logs[(i - 1) * 2 + 1];

      expect(startLog.message).toContain(`Microtask ${i}`);
      expect(startLog.type).toBe('task-start');
      expect(completeLog.message).toContain(`Microtask ${i}`);
      expect(completeLog.type).toBe('task-complete');
    }
  });

  it('handles microtask with multiple durationSteps', () => {
    const microtask = {
      ...createMicrotask('micro-1', 'Long microtask'),
      durationSteps: 3,
    };

    const state = createTestState({
      microQueue: [microtask],
      enqueueCounter: 1,
    });

    const newState = drainMicrotaskQueue(state);

    // Microtask should be complete
    expect(newState.microQueue).toHaveLength(0);
    expect(newState.callStack).toHaveLength(0);

    // Should have one start and one complete log
    expect(newState.log).toHaveLength(2);
    expect(newState.log[0].type).toBe('task-start');
    expect(newState.log[1].type).toBe('task-complete');
  });

  it('processes microtask effects like log entries', () => {
    const microtask = createMicrotask('micro-1', 'Microtask with log', [
      {
        type: 'log',
        payload: 'Custom log message',
      },
    ]);

    const state = createTestState({
      microQueue: [microtask],
      enqueueCounter: 1,
    });

    const newState = drainMicrotaskQueue(state);

    // Should have start, complete, and custom log
    expect(newState.log).toHaveLength(3);
    expect(newState.log[0].type).toBe('task-start');
    expect(newState.log[1].type).toBe('task-complete');
    expect(newState.log[2].type).toBe('user');
    expect(newState.log[2].message).toBe('Custom log message');
  });

  it('processes invalidate-render effect', () => {
    const microtask = createMicrotask('micro-1', 'Microtask that invalidates', [
      {
        type: 'invalidate-render',
        payload: null,
      },
    ]);

    const state = createTestState({
      microQueue: [microtask],
      renderPending: false,
      enqueueCounter: 1,
    });

    const newState = drainMicrotaskQueue(state);

    expect(newState.renderPending).toBe(true);
  });

  it('handles complex nested scenario with multiple branches', () => {
    // Micro-1 enqueues Micro-2 and Micro-3
    // Micro-2 enqueues Micro-4
    // All should execute before macrotask

    const micro4 = createMicrotask('micro-4', 'Microtask 4');
    const micro3 = createMicrotask('micro-3', 'Microtask 3');
    const micro2 = createMicrotask('micro-2', 'Microtask 2', [
      {
        type: 'enqueue-task',
        payload: { task: micro4, queueType: 'micro' as const },
      },
    ]);
    const micro1 = createMicrotask('micro-1', 'Microtask 1', [
      {
        type: 'enqueue-task',
        payload: { task: micro2, queueType: 'micro' as const },
      },
      {
        type: 'enqueue-task',
        payload: { task: micro3, queueType: 'micro' as const },
      },
    ]);

    const state = createTestState({
      microQueue: [micro1],
      macroQueue: [
        {
          id: 'macro-1',
          type: TaskType.TIMER,
          label: 'Macrotask',
          createdAt: 0,
          enqueueSeq: 0,
          origin: null,
          state: TaskState.QUEUED,
          durationSteps: 1,
          effects: [],
          delay: 0,
        },
      ],
      enqueueCounter: 5,
    });

    const newState = drainMicrotaskQueue(state);

    // All microtasks should be executed
    expect(newState.microQueue).toHaveLength(0);
    expect(newState.callStack).toHaveLength(0);

    // Macrotask should still be queued
    expect(newState.macroQueue).toHaveLength(1);

    // Should have 8 logs (4 starts + 4 completes)
    const logs = newState.log.filter(
      (l) => l.type === 'task-start' || l.type === 'task-complete'
    );
    expect(logs).toHaveLength(8);

    // Verify execution order: 1, 2, 3, 4 (FIFO order for enqueued tasks)
    const taskOrder = logs
      .filter((l) => l.type === 'task-start')
      .map((l) => l.message);
    expect(taskOrder[0]).toContain('Microtask 1');
    expect(taskOrder[1]).toContain('Microtask 2');
    expect(taskOrder[2]).toContain('Microtask 3');
    expect(taskOrder[3]).toContain('Microtask 4');
  });

  it('documents starvation behavior - does not detect infinite loops', () => {
    // This test documents that the current implementation will loop forever
    // if a microtask keeps enqueuing itself. This is intentional for the demo.

    // We'll create a finite version with a counter to avoid actual infinite loop
    let counter = 0;
    const maxIterations = 5;

    const createRecursiveMicrotask = (id: string): Task => {
      counter++;
      const effects: Task['effects'] = [];

      // Only enqueue another microtask if under the limit
      if (counter < maxIterations) {
        effects.push({
          type: 'enqueue-task',
          payload: {
            task: createRecursiveMicrotask(`micro-${counter + 1}`),
            queueType: 'micro' as const,
          },
        });
      }

      return createMicrotask(id, `Recursive ${id}`, effects);
    };

    const state = createTestState({
      microQueue: [createRecursiveMicrotask('micro-1')],
      enqueueCounter: 1,
    });

    const newState = drainMicrotaskQueue(state);

    // Should have executed maxIterations microtasks
    const logs = newState.log.filter((l) => l.type === 'task-start');
    expect(logs.length).toBe(maxIterations);

    // Note: In a real infinite loop scenario, this would hang.
    // The demo should document this behavior for educational purposes.
  });
});
