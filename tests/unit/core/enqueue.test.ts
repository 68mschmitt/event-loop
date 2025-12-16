/**
 * Tests for enqueue rules and Web API operations.
 * Verifies that all task types enqueue correctly according to event-loop-rules.md.
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  enqueueTimerTask,
  enqueueIntervalTask,
  enqueueMicrotask,
  enqueueAsyncContinuation,
  enqueueFetchTask,
  enqueueDomEventTask,
  enqueueRafTask,
  processWebApiOperations,
  isOperationReady,
  getReadyOperations,
  findEarliestReadyAt,
} from '@/core/simulator';
import { TaskType, TaskState } from '@/core/types/task';
import { WebApiType } from '@/core/types/webapi';
import type { Task, TimerTask, IntervalTask, MicrotaskTask, FetchTask, DomEventTask, RafTask } from '@/core/types/task';

/**
 * Helper function to create a basic timer task for testing.
 */
function createTimerTask(id: string, delay: number): TimerTask {
  return {
    type: TaskType.TIMER,
    id,
    label: `Timer ${id}`,
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
    delay,
  };
}

/**
 * Helper function to create a basic interval task for testing.
 */
function createIntervalTask(id: string, delay: number): IntervalTask {
  return {
    type: TaskType.INTERVAL,
    id,
    label: `Interval ${id}`,
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
    delay,
    intervalId: id,
  };
}

/**
 * Helper function to create a basic microtask for testing.
 */
function createMicrotask(id: string): MicrotaskTask {
  return {
    type: TaskType.MICROTASK,
    id,
    label: `Microtask ${id}`,
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
  };
}

/**
 * Helper function to create a basic fetch task for testing.
 */
function createFetchTask(id: string, latency: number): FetchTask {
  return {
    type: TaskType.FETCH,
    id,
    label: `Fetch ${id}`,
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
    url: 'https://api.example.com/data',
    latency,
  };
}

/**
 * Helper function to create a basic DOM event task for testing.
 */
function createDomEventTask(id: string): DomEventTask {
  return {
    type: TaskType.DOM_EVENT,
    id,
    label: `Event ${id}`,
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
    eventType: 'click',
  };
}

/**
 * Helper function to create a basic rAF task for testing.
 */
function createRafTask(id: string): RafTask {
  return {
    type: TaskType.RAF,
    id,
    label: `rAF ${id}`,
    createdAt: 0,
    enqueueSeq: 0,
    origin: null,
    state: TaskState.CREATED,
    durationSteps: 1,
    effects: [],
  };
}

describe('enqueue - Timer Tasks', () => {
  it('should create Web API operation with correct delay', () => {
    const state = createInitialState();
    const task = createTimerTask('timer-1', 100);

    const newState = enqueueTimerTask(state, task, 100);

    // Should have one Web API operation
    expect(newState.webApis.size).toBe(1);
    expect(newState.webApis.has('timer-1')).toBe(true);

    const op = newState.webApis.get('timer-1')!;
    expect(op.type).toBe(WebApiType.TIMER);
    expect(op.readyAt).toBe(100); // now=0 + delay=100
    expect(op.targetQueue).toBe('macro');
    expect(op.recurring).toBe(undefined); // Not set for non-recurring
    expect(op.payloadTask.state).toBe(TaskState.WAITING_WEBAPI);
  });

  it('should update task state to WAITING_WEBAPI', () => {
    const state = createInitialState();
    const task = createTimerTask('timer-1', 100);

    const newState = enqueueTimerTask(state, task, 100);
    const op = newState.webApis.get('timer-1')!;

    expect(op.payloadTask.state).toBe(TaskState.WAITING_WEBAPI);
  });

  it('should use enqueueCounter for enqueueSeq', () => {
    const state = createInitialState();
    const task = createTimerTask('timer-1', 100);

    const newState = enqueueTimerTask(state, task, 100);
    const op = newState.webApis.get('timer-1')!;

    expect(op.payloadTask.enqueueSeq).toBe(0);
    expect(newState.enqueueCounter).toBe(1);
  });

  it('should handle delay of 0 (immediate timer)', () => {
    const state = createInitialState();
    const task = createTimerTask('timer-1', 0);

    const newState = enqueueTimerTask(state, task, 0);
    const op = newState.webApis.get('timer-1')!;

    expect(op.readyAt).toBe(0); // Ready immediately but still goes through Web API
    expect(op.targetQueue).toBe('macro');
  });
});

describe('enqueue - Interval Tasks', () => {
  it('should create Web API operation with recurring flag', () => {
    const state = createInitialState();
    const task = createIntervalTask('interval-1', 100);

    const newState = enqueueIntervalTask(state, task, 100);

    expect(newState.webApis.size).toBe(1);
    const op = newState.webApis.get('interval-1')!;

    expect(op.type).toBe(WebApiType.INTERVAL);
    expect(op.recurring).toBe(true);
    expect(op.readyAt).toBe(100);
    expect(op.targetQueue).toBe('macro');
  });

  it('should update task state to WAITING_WEBAPI', () => {
    const state = createInitialState();
    const task = createIntervalTask('interval-1', 100);

    const newState = enqueueIntervalTask(state, task, 100);
    const op = newState.webApis.get('interval-1')!;

    expect(op.payloadTask.state).toBe(TaskState.WAITING_WEBAPI);
  });
});

describe('enqueue - Microtasks', () => {
  it('should enqueue directly to microQueue', () => {
    const state = createInitialState();
    const task = createMicrotask('micro-1');

    const newState = enqueueMicrotask(state, task);

    // Should NOT be in Web API
    expect(newState.webApis.size).toBe(0);

    // Should be in microQueue
    expect(newState.microQueue.length).toBe(1);
    expect(newState.microQueue[0]!.id).toBe('micro-1');
    expect(newState.microQueue[0]!.state).toBe(TaskState.QUEUED);
  });

  it('should use enqueueCounter for enqueueSeq', () => {
    const state = createInitialState();
    const task = createMicrotask('micro-1');

    const newState = enqueueMicrotask(state, task);

    expect(newState.microQueue[0]!.enqueueSeq).toBe(0);
    expect(newState.enqueueCounter).toBe(1);
  });

  it('should maintain FIFO order', () => {
    let state = createInitialState();
    const task1 = createMicrotask('micro-1');
    const task2 = createMicrotask('micro-2');
    const task3 = createMicrotask('micro-3');

    state = enqueueMicrotask(state, task1);
    state = enqueueMicrotask(state, task2);
    state = enqueueMicrotask(state, task3);

    expect(state.microQueue.length).toBe(3);
    expect(state.microQueue[0]!.id).toBe('micro-1');
    expect(state.microQueue[1]!.id).toBe('micro-2');
    expect(state.microQueue[2]!.id).toBe('micro-3');
  });
});

describe('enqueue - Async Continuations', () => {
  it('should enqueue to microQueue like microtasks', () => {
    const state = createInitialState();
    const task: Task = {
      type: TaskType.ASYNC_CONTINUATION,
      id: 'async-1',
      label: 'Async continuation',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
    };

    const newState = enqueueAsyncContinuation(state, task);

    expect(newState.microQueue.length).toBe(1);
    expect(newState.microQueue[0]!.id).toBe('async-1');
    expect(newState.microQueue[0]!.state).toBe(TaskState.QUEUED);
    expect(newState.webApis.size).toBe(0);
  });
});

describe('enqueue - Fetch Tasks', () => {
  it('should create Web API operation with latency', () => {
    const state = createInitialState();
    const task = createFetchTask('fetch-1', 200);

    const newState = enqueueFetchTask(state, task, 200);

    expect(newState.webApis.size).toBe(1);
    const op = newState.webApis.get('fetch-1')!;

    expect(op.type).toBe(WebApiType.FETCH);
    expect(op.readyAt).toBe(200);
    expect(op.targetQueue).toBe('macro');
    expect(op.recurring).toBe(undefined);
  });

  it('should update task state to WAITING_WEBAPI', () => {
    const state = createInitialState();
    const task = createFetchTask('fetch-1', 200);

    const newState = enqueueFetchTask(state, task, 200);
    const op = newState.webApis.get('fetch-1')!;

    expect(op.payloadTask.state).toBe(TaskState.WAITING_WEBAPI);
  });
});

describe('enqueue - DOM Event Tasks', () => {
  it('should enqueue immediately to macroQueue when immediate=true', () => {
    const state = createInitialState();
    const task = createDomEventTask('event-1');

    const newState = enqueueDomEventTask(state, task, true);

    expect(newState.macroQueue.length).toBe(1);
    expect(newState.macroQueue[0]!.id).toBe('event-1');
    expect(newState.macroQueue[0]!.state).toBe(TaskState.QUEUED);
    expect(newState.webApis.size).toBe(0);
  });

  it('should use Web API when immediate=false', () => {
    const state = createInitialState();
    const task = createDomEventTask('event-1');

    const newState = enqueueDomEventTask(state, task, false);

    expect(newState.webApis.size).toBe(1);
    expect(newState.macroQueue.length).toBe(0);

    const op = newState.webApis.get('event-1')!;
    expect(op.type).toBe(WebApiType.DOM_EVENT);
    expect(op.readyAt).toBe(0); // Ready immediately but goes through Web API
  });
});

describe('enqueue - rAF Tasks', () => {
  it('should enqueue to rafQueue', () => {
    const state = createInitialState();
    const task = createRafTask('raf-1');

    const newState = enqueueRafTask(state, task);

    expect(newState.rafQueue.length).toBe(1);
    expect(newState.rafQueue[0]!.id).toBe('raf-1');
    expect(newState.rafQueue[0]!.state).toBe(TaskState.QUEUED);
    expect(newState.webApis.size).toBe(0);
  });

  it('should maintain FIFO order', () => {
    let state = createInitialState();
    const task1 = createRafTask('raf-1');
    const task2 = createRafTask('raf-2');

    state = enqueueRafTask(state, task1);
    state = enqueueRafTask(state, task2);

    expect(state.rafQueue.length).toBe(2);
    expect(state.rafQueue[0]!.id).toBe('raf-1');
    expect(state.rafQueue[1]!.id).toBe('raf-2');
  });
});

describe('processWebApiOperations', () => {
  it('should enqueue ready timer to macroQueue', () => {
    let state = createInitialState();
    const task = createTimerTask('timer-1', 100);

    // Enqueue timer
    state = enqueueTimerTask(state, task, 100);
    expect(state.webApis.size).toBe(1);
    expect(state.macroQueue.length).toBe(0);

    // Advance time
    state = { ...state, now: 100 };

    // Process Web APIs
    state = processWebApiOperations(state);

    // Timer should now be in macroQueue
    expect(state.macroQueue.length).toBe(1);
    expect(state.macroQueue[0]!.id).toBe('timer-1');
    expect(state.macroQueue[0]!.state).toBe(TaskState.QUEUED);

    // Timer should be removed from Web APIs (non-recurring)
    expect(state.webApis.size).toBe(0);
  });

  it('should not enqueue operations that are not ready yet', () => {
    let state = createInitialState();
    const task = createTimerTask('timer-1', 100);

    state = enqueueTimerTask(state, task, 100);
    state = { ...state, now: 50 }; // Not ready yet

    state = processWebApiOperations(state);

    expect(state.macroQueue.length).toBe(0);
    expect(state.webApis.size).toBe(1); // Still in Web APIs
  });

  it('should reschedule recurring interval operations', () => {
    let state = createInitialState();
    const task = createIntervalTask('interval-1', 100);

    state = enqueueIntervalTask(state, task, 100);
    state = { ...state, now: 100 };

    state = processWebApiOperations(state);

    // Should be in macroQueue
    expect(state.macroQueue.length).toBe(1);
    expect(state.macroQueue[0]!.id).toBe('interval-1');

    // Should still be in Web APIs with new readyAt
    expect(state.webApis.size).toBe(1);
    const op = state.webApis.get('interval-1')!;
    expect(op.readyAt).toBe(200); // now=100 + delay=100
    expect(op.recurring).toBe(true);
  });

  it('should process multiple ready operations in enqueueSeq order', () => {
    let state = createInitialState();
    const task1 = createTimerTask('timer-1', 100);
    const task2 = createTimerTask('timer-2', 100);
    const task3 = createTimerTask('timer-3', 100);

    state = enqueueTimerTask(state, task1, 100);
    state = enqueueTimerTask(state, task2, 100);
    state = enqueueTimerTask(state, task3, 100);

    state = { ...state, now: 100 };
    state = processWebApiOperations(state);

    // All should be in macroQueue in enqueueSeq order
    expect(state.macroQueue.length).toBe(3);
    expect(state.macroQueue[0]!.enqueueSeq).toBe(0);
    expect(state.macroQueue[1]!.enqueueSeq).toBe(1);
    expect(state.macroQueue[2]!.enqueueSeq).toBe(2);
  });

  it('should handle operations with different readyAt times', () => {
    let state = createInitialState();
    const task1 = createTimerTask('timer-1', 100);
    const task2 = createTimerTask('timer-2', 200);
    const task3 = createTimerTask('timer-3', 50);

    state = enqueueTimerTask(state, task1, 100);
    state = enqueueTimerTask(state, task2, 200);
    state = enqueueTimerTask(state, task3, 50);

    // Process at time 100
    state = { ...state, now: 100 };
    state = processWebApiOperations(state);

    // timer-1 (enqueueSeq=0, ready at 100) and timer-3 (enqueueSeq=2, ready at 50) should be enqueued
    // Ordered by enqueueSeq (FIFO): timer-1 comes before timer-3
    expect(state.macroQueue.length).toBe(2);
    expect(state.macroQueue[0]!.id).toBe('timer-1'); // enqueueSeq=0
    expect(state.macroQueue[1]!.id).toBe('timer-3'); // enqueueSeq=2

    // timer-2 should still be waiting
    expect(state.webApis.size).toBe(1);
    expect(state.webApis.has('timer-2')).toBe(true);
  });
});

describe('Web API utilities', () => {
  it('isOperationReady should return true when now >= readyAt', () => {
    const state = createInitialState();
    const task = createTimerTask('timer-1', 100);
    const newState = enqueueTimerTask(state, task, 100);
    const op = newState.webApis.get('timer-1')!;

    expect(isOperationReady(op, 99)).toBe(false);
    expect(isOperationReady(op, 100)).toBe(true);
    expect(isOperationReady(op, 101)).toBe(true);
  });

  it('getReadyOperations should return operations in enqueueSeq order', () => {
    let state = createInitialState();
    const task1 = createTimerTask('timer-1', 100);
    const task2 = createTimerTask('timer-2', 100);
    const task3 = createTimerTask('timer-3', 200);

    state = enqueueTimerTask(state, task1, 100);
    state = enqueueTimerTask(state, task2, 100);
    state = enqueueTimerTask(state, task3, 200);

    const ready = getReadyOperations(state.webApis, 100);

    expect(ready.length).toBe(2);
    expect(ready[0]!.id).toBe('timer-1');
    expect(ready[1]!.id).toBe('timer-2');
  });

  it('findEarliestReadyAt should return earliest time', () => {
    let state = createInitialState();
    const task1 = createTimerTask('timer-1', 100);
    const task2 = createTimerTask('timer-2', 50);
    const task3 = createTimerTask('timer-3', 200);

    state = enqueueTimerTask(state, task1, 100);
    state = enqueueTimerTask(state, task2, 50);
    state = enqueueTimerTask(state, task3, 200);

    const earliest = findEarliestReadyAt(state.webApis);
    expect(earliest).toBe(50);
  });

  it('findEarliestReadyAt should return null for empty map', () => {
    const state = createInitialState();
    const earliest = findEarliestReadyAt(state.webApis);
    expect(earliest).toBe(null);
  });
});

describe('Determinism', () => {
  it('should produce identical results for same input sequence', () => {
    // First run
    let state1 = createInitialState();
    const task1a = createTimerTask('timer-1', 100);
    const task1b = createMicrotask('micro-1');
    state1 = enqueueTimerTask(state1, task1a, 100);
    state1 = enqueueMicrotask(state1, task1b);

    // Second run with identical operations
    let state2 = createInitialState();
    const task2a = createTimerTask('timer-1', 100);
    const task2b = createMicrotask('micro-1');
    state2 = enqueueTimerTask(state2, task2a, 100);
    state2 = enqueueMicrotask(state2, task2b);

    // States should be identical
    expect(state1.enqueueCounter).toBe(state2.enqueueCounter);
    expect(state1.microQueue.length).toBe(state2.microQueue.length);
    expect(state1.webApis.size).toBe(state2.webApis.size);
    expect(state1.microQueue[0]!.enqueueSeq).toBe(state2.microQueue[0]!.enqueueSeq);
  });

  it('should use enqueueSeq for deterministic ordering', () => {
    let state = createInitialState();

    // Enqueue multiple tasks at the same logical time
    const tasks = [
      createTimerTask('timer-1', 100),
      createTimerTask('timer-2', 100),
      createTimerTask('timer-3', 100),
    ];

    for (const task of tasks) {
      state = enqueueTimerTask(state, task, 100);
    }

    state = { ...state, now: 100 };
    state = processWebApiOperations(state);

    // Should be processed in enqueueSeq order
    expect(state.macroQueue[0]!.enqueueSeq).toBe(0);
    expect(state.macroQueue[1]!.enqueueSeq).toBe(1);
    expect(state.macroQueue[2]!.enqueueSeq).toBe(2);
  });
});

describe('Immutability', () => {
  it('should not mutate original state', () => {
    const state = createInitialState();
    const originalWebApiSize = state.webApis.size;
    const originalMicroQueueLength = state.microQueue.length;
    const originalCounter = state.enqueueCounter;

    const task = createTimerTask('timer-1', 100);
    enqueueTimerTask(state, task, 100);

    // Original state should be unchanged
    expect(state.webApis.size).toBe(originalWebApiSize);
    expect(state.microQueue.length).toBe(originalMicroQueueLength);
    expect(state.enqueueCounter).toBe(originalCounter);
  });

  it('should return new state objects', () => {
    const state = createInitialState();
    const task = createTimerTask('timer-1', 100);

    const newState = enqueueTimerTask(state, task, 100);

    expect(newState).not.toBe(state);
    expect(newState.webApis).not.toBe(state.webApis);
  });
});
