/**
 * Unit tests for core type definitions.
 * Tests type guards, discriminated unions, and TypeScript type narrowing.
 */

import { describe, test, expect } from 'vitest';
import {
  TaskType,
  TaskState,
  type Task,
  type TimerTask,
  type FetchTask,
  type MicrotaskTask,
  type SyncTask,
  isTimerTask,
  isFetchTask,
  isMicrotaskTask,
  isSyncTask,
  isAsyncContinuationTask,
  isDomEventTask,
  isRafTask,
  isIntervalTask,
  isPromiseTask,
  QueueType,
} from '@/core/types';

describe('TaskType enum', () => {
  test('has all expected task types', () => {
    expect(TaskType.SYNC).toBe('sync');
    expect(TaskType.TIMER).toBe('timer');
    expect(TaskType.INTERVAL).toBe('interval');
    expect(TaskType.MICROTASK).toBe('microtask');
    expect(TaskType.PROMISE).toBe('promise');
    expect(TaskType.ASYNC_CONTINUATION).toBe('async-continuation');
    expect(TaskType.FETCH).toBe('fetch');
    expect(TaskType.DOM_EVENT).toBe('dom-event');
    expect(TaskType.RAF).toBe('raf');
  });
});

describe('TaskState enum', () => {
  test('has all expected task states', () => {
    expect(TaskState.CREATED).toBe('created');
    expect(TaskState.WAITING_WEBAPI).toBe('waiting-webapi');
    expect(TaskState.QUEUED).toBe('queued');
    expect(TaskState.RUNNING).toBe('running');
    expect(TaskState.COMPLETED).toBe('completed');
    expect(TaskState.CANCELED).toBe('canceled');
  });
});

describe('Type guards', () => {
  describe('isSyncTask', () => {
    test('returns true for sync tasks', () => {
      const syncTask: Task = {
        type: TaskType.SYNC,
        id: 'sync-1',
        label: 'Sync Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isSyncTask(syncTask)).toBe(true);
    });

    test('returns false for non-sync tasks', () => {
      const timerTask: Task = {
        type: TaskType.TIMER,
        id: 'timer-1',
        label: 'Timer Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        delay: 100,
      };

      expect(isSyncTask(timerTask)).toBe(false);
    });
  });

  describe('isTimerTask', () => {
    test('returns true for timer tasks', () => {
      const timerTask: Task = {
        type: TaskType.TIMER,
        id: 'timer-1',
        label: 'Timer Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        delay: 100,
      };

      expect(isTimerTask(timerTask)).toBe(true);
    });

    test('returns false for non-timer tasks', () => {
      const fetchTask: Task = {
        type: TaskType.FETCH,
        id: 'fetch-1',
        label: 'Fetch Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        url: 'https://example.com',
        latency: 200,
      };

      expect(isTimerTask(fetchTask)).toBe(false);
    });
  });

  describe('isIntervalTask', () => {
    test('returns true for interval tasks', () => {
      const intervalTask: Task = {
        type: TaskType.INTERVAL,
        id: 'interval-1',
        label: 'Interval Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        delay: 100,
        intervalId: 'int-123',
      };

      expect(isIntervalTask(intervalTask)).toBe(true);
    });

    test('returns false for non-interval tasks', () => {
      const timerTask: Task = {
        type: TaskType.TIMER,
        id: 'timer-1',
        label: 'Timer Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        delay: 100,
      };

      expect(isIntervalTask(timerTask)).toBe(false);
    });
  });

  describe('isMicrotaskTask', () => {
    test('returns true for microtask tasks', () => {
      const microtaskTask: Task = {
        type: TaskType.MICROTASK,
        id: 'micro-1',
        label: 'Microtask',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isMicrotaskTask(microtaskTask)).toBe(true);
    });

    test('returns false for non-microtask tasks', () => {
      const syncTask: Task = {
        type: TaskType.SYNC,
        id: 'sync-1',
        label: 'Sync Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isMicrotaskTask(syncTask)).toBe(false);
    });
  });

  describe('isPromiseTask', () => {
    test('returns true for promise tasks', () => {
      const promiseTask: Task = {
        type: TaskType.PROMISE,
        id: 'promise-1',
        label: 'Promise Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isPromiseTask(promiseTask)).toBe(true);
    });

    test('returns false for non-promise tasks', () => {
      const microtaskTask: Task = {
        type: TaskType.MICROTASK,
        id: 'micro-1',
        label: 'Microtask',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isPromiseTask(microtaskTask)).toBe(false);
    });
  });

  describe('isAsyncContinuationTask', () => {
    test('returns true for async continuation tasks', () => {
      const asyncTask: Task = {
        type: TaskType.ASYNC_CONTINUATION,
        id: 'async-1',
        label: 'Async Continuation',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isAsyncContinuationTask(asyncTask)).toBe(true);
    });

    test('returns false for non-async continuation tasks', () => {
      const microtaskTask: Task = {
        type: TaskType.MICROTASK,
        id: 'micro-1',
        label: 'Microtask',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isAsyncContinuationTask(microtaskTask)).toBe(false);
    });
  });

  describe('isFetchTask', () => {
    test('returns true for fetch tasks', () => {
      const fetchTask: Task = {
        type: TaskType.FETCH,
        id: 'fetch-1',
        label: 'Fetch Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        url: 'https://example.com',
        latency: 200,
      };

      expect(isFetchTask(fetchTask)).toBe(true);
    });

    test('returns false for non-fetch tasks', () => {
      const timerTask: Task = {
        type: TaskType.TIMER,
        id: 'timer-1',
        label: 'Timer Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        delay: 100,
      };

      expect(isFetchTask(timerTask)).toBe(false);
    });
  });

  describe('isDomEventTask', () => {
    test('returns true for DOM event tasks', () => {
      const domEventTask: Task = {
        type: TaskType.DOM_EVENT,
        id: 'dom-1',
        label: 'Click Handler',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        eventType: 'click',
      };

      expect(isDomEventTask(domEventTask)).toBe(true);
    });

    test('returns false for non-DOM event tasks', () => {
      const syncTask: Task = {
        type: TaskType.SYNC,
        id: 'sync-1',
        label: 'Sync Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isDomEventTask(syncTask)).toBe(false);
    });
  });

  describe('isRafTask', () => {
    test('returns true for RAF tasks', () => {
      const rafTask: Task = {
        type: TaskType.RAF,
        id: 'raf-1',
        label: 'RAF Callback',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isRafTask(rafTask)).toBe(true);
    });

    test('returns false for non-RAF tasks', () => {
      const syncTask: Task = {
        type: TaskType.SYNC,
        id: 'sync-1',
        label: 'Sync Task',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      };

      expect(isRafTask(syncTask)).toBe(false);
    });
  });
});

describe('Discriminated unions', () => {
  test('allows type-safe access to timer task properties', () => {
    const task: Task = {
      type: TaskType.TIMER,
      id: 'timer-1',
      label: 'Timer Task',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
      delay: 100,
    };

    if (task.type === TaskType.TIMER) {
      // TypeScript should allow accessing delay here
      expect(task.delay).toBe(100);
    } else {
      throw new Error('Task should be a timer task');
    }
  });

  test('allows type-safe access to fetch task properties', () => {
    const task: Task = {
      type: TaskType.FETCH,
      id: 'fetch-1',
      label: 'Fetch Task',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
      url: 'https://example.com',
      latency: 200,
    };

    if (task.type === TaskType.FETCH) {
      // TypeScript should allow accessing url and latency here
      expect(task.url).toBe('https://example.com');
      expect(task.latency).toBe(200);
    } else {
      throw new Error('Task should be a fetch task');
    }
  });

  test('allows type-safe access via type guards', () => {
    const task: Task = {
      type: TaskType.TIMER,
      id: 'timer-1',
      label: 'Timer Task',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
      delay: 100,
    };

    if (isTimerTask(task)) {
      // TypeScript should allow accessing delay here
      expect(task.delay).toBe(100);
    } else {
      throw new Error('Task should be a timer task');
    }
  });

  test('switch statement narrows types correctly', () => {
    const tasks: Task[] = [
      {
        type: TaskType.SYNC,
        id: 'sync-1',
        label: 'Sync',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
      },
      {
        type: TaskType.TIMER,
        id: 'timer-1',
        label: 'Timer',
        createdAt: 0,
        enqueueSeq: 1,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        delay: 100,
      },
      {
        type: TaskType.FETCH,
        id: 'fetch-1',
        label: 'Fetch',
        createdAt: 0,
        enqueueSeq: 2,
        origin: null,
        state: TaskState.CREATED,
        durationSteps: 1,
        effects: [],
        url: 'https://example.com',
        latency: 200,
      },
    ];

    const results: string[] = [];
    tasks.forEach((task) => {
      switch (task.type) {
        case TaskType.SYNC:
          results.push('sync');
          break;
        case TaskType.TIMER:
          results.push(`timer-${task.delay}`);
          break;
        case TaskType.FETCH:
          results.push(`fetch-${task.url}`);
          break;
        case TaskType.MICROTASK:
          results.push('microtask');
          break;
        case TaskType.INTERVAL:
          results.push(`interval-${task.delay}`);
          break;
        case TaskType.PROMISE:
          results.push('promise');
          break;
        case TaskType.ASYNC_CONTINUATION:
          results.push('async-continuation');
          break;
        case TaskType.DOM_EVENT:
          results.push(`dom-${task.eventType}`);
          break;
        case TaskType.RAF:
          results.push('raf');
          break;
      }
    });

    expect(results).toEqual(['sync', 'timer-100', 'fetch-https://example.com']);
  });
});

describe('QueueType enum', () => {
  test('has all expected queue types', () => {
    expect(QueueType.MACRO).toBe('macro');
    expect(QueueType.MICRO).toBe('micro');
    expect(QueueType.RAF).toBe('raf');
  });
});

describe('Task creation', () => {
  test('creates a valid sync task', () => {
    const task: SyncTask = {
      type: TaskType.SYNC,
      id: 'sync-1',
      label: 'Synchronous Task',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
    };

    expect(task.type).toBe(TaskType.SYNC);
    expect(task.id).toBe('sync-1');
  });

  test('creates a valid timer task', () => {
    const task: TimerTask = {
      type: TaskType.TIMER,
      id: 'timer-1',
      label: 'Timer Task',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
      delay: 100,
    };

    expect(task.type).toBe(TaskType.TIMER);
    expect(task.delay).toBe(100);
  });

  test('creates a valid microtask', () => {
    const task: MicrotaskTask = {
      type: TaskType.MICROTASK,
      id: 'micro-1',
      label: 'Microtask',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
    };

    expect(task.type).toBe(TaskType.MICROTASK);
  });

  test('creates a valid fetch task', () => {
    const task: FetchTask = {
      type: TaskType.FETCH,
      id: 'fetch-1',
      label: 'Fetch Task',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
      url: 'https://api.example.com/data',
      latency: 250,
    };

    expect(task.type).toBe(TaskType.FETCH);
    expect(task.url).toBe('https://api.example.com/data');
    expect(task.latency).toBe(250);
  });

  test('creates a task with effects', () => {
    const task: SyncTask = {
      type: TaskType.SYNC,
      id: 'sync-1',
      label: 'Task with Effects',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [
        {
          type: 'log',
          payload: 'Hello from task',
        },
        {
          type: 'invalidate-render',
          payload: null,
        },
      ],
    };

    expect(task.effects).toHaveLength(2);
    expect(task.effects[0]?.type).toBe('log');
    expect(task.effects[1]?.type).toBe('invalidate-render');
  });

  test('creates a task with origin', () => {
    const task: MicrotaskTask = {
      type: TaskType.MICROTASK,
      id: 'micro-1',
      label: 'Child Task',
      createdAt: 5,
      enqueueSeq: 10,
      origin: 'sync-1',
      state: TaskState.QUEUED,
      durationSteps: 1,
      effects: [],
    };

    expect(task.origin).toBe('sync-1');
  });
});

describe('Task lifecycle states', () => {
  test('tasks can transition through all states', () => {
    const task: TimerTask = {
      type: TaskType.TIMER,
      id: 'timer-1',
      label: 'Timer',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.CREATED,
      durationSteps: 1,
      effects: [],
      delay: 100,
    };

    expect(task.state).toBe(TaskState.CREATED);

    task.state = TaskState.WAITING_WEBAPI;
    expect(task.state).toBe(TaskState.WAITING_WEBAPI);

    task.state = TaskState.QUEUED;
    expect(task.state).toBe(TaskState.QUEUED);

    task.state = TaskState.RUNNING;
    expect(task.state).toBe(TaskState.RUNNING);

    task.state = TaskState.COMPLETED;
    expect(task.state).toBe(TaskState.COMPLETED);
  });

  test('tasks can be canceled', () => {
    const task: TimerTask = {
      type: TaskType.TIMER,
      id: 'timer-1',
      label: 'Timer',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.WAITING_WEBAPI,
      durationSteps: 1,
      effects: [],
      delay: 100,
    };

    task.state = TaskState.CANCELED;
    expect(task.state).toBe(TaskState.CANCELED);
  });
});
