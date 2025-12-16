/**
 * Integration test for render and microtask interaction.
 * Verifies that render and microtask logic work correctly together.
 */

import { describe, it, expect } from 'vitest';
import { createInitialState } from '@/core/simulator/state';
import { drainMicrotaskQueue } from '@/core/simulator/microtask';
import { shouldRender, executeRenderStep } from '@/core/simulator/render';
import { TaskType, TaskState } from '@/core/types/task';
import type { Task } from '@/core/types/task';

describe('Render and Microtask Integration', () => {
  it('microtasks drain completely before render can occur', () => {
    let state = createInitialState({ frameInterval: 16 });

    // Create microtasks that enqueue more microtasks
    const micro2: Task = {
      id: 'micro-2',
      type: TaskType.MICROTASK,
      label: 'Microtask 2',
      createdAt: 0,
      enqueueSeq: 1,
      origin: null,
      state: TaskState.QUEUED,
      durationSteps: 1,
      effects: [],
    };

    const micro1: Task = {
      id: 'micro-1',
      type: TaskType.MICROTASK,
      label: 'Microtask 1',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.QUEUED,
      durationSteps: 1,
      effects: [
        {
          type: 'enqueue-task',
          payload: {
            task: micro2,
            queueType: 'micro',
          },
        },
      ],
    };

    // Set up state: render pending, at frame boundary, but with microtasks
    state = {
      ...state,
      renderPending: true,
      now: 16, // At frame boundary
      lastFrameAt: 0,
      microQueue: [micro1],
    };

    // Render should NOT be ready (microtasks not drained)
    expect(shouldRender(state)).toBe(false);

    // Drain microtasks
    state = drainMicrotaskQueue(state);

    // Now render should be ready
    expect(shouldRender(state)).toBe(true);
    expect(state.microQueue).toHaveLength(0);

    // Execute render
    state = executeRenderStep(state);
    expect(state.renderPending).toBe(false);
    expect(state.frameCounter).toBe(1);
  });

  it('microtask can invalidate render which will occur after draining', () => {
    let state = createInitialState({ frameInterval: 16 });

    // Create microtask that invalidates render
    const micro: Task = {
      id: 'micro-1',
      type: TaskType.MICROTASK,
      label: 'Microtask that invalidates',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.QUEUED,
      durationSteps: 1,
      effects: [
        {
          type: 'invalidate-render',
          payload: null,
        },
      ],
    };

    state = {
      ...state,
      renderPending: false,
      now: 16,
      lastFrameAt: 0,
      microQueue: [micro],
    };

    // Render not ready yet (renderPending is false)
    expect(shouldRender(state)).toBe(false);

    // Drain microtasks (which will set renderPending to true)
    state = drainMicrotaskQueue(state);

    // Now render should be ready
    expect(state.renderPending).toBe(true);
    expect(shouldRender(state)).toBe(true);

    // Execute render
    state = executeRenderStep(state);
    expect(state.renderPending).toBe(false);
  });

  it('multiple microtasks can all invalidate render', () => {
    let state = createInitialState({ frameInterval: 16 });

    // Create multiple microtasks that all invalidate render
    const microtasks: Task[] = [1, 2, 3].map((i) => ({
      id: `micro-${i}`,
      type: TaskType.MICROTASK,
      label: `Microtask ${i}`,
      createdAt: 0,
      enqueueSeq: i - 1,
      origin: null,
      state: TaskState.QUEUED,
      durationSteps: 1,
      effects: [
        {
          type: 'invalidate-render',
          payload: null,
        },
      ],
    }));

    state = {
      ...state,
      renderPending: false,
      now: 16,
      lastFrameAt: 0,
      microQueue: microtasks,
    };

    // Drain all microtasks
    state = drainMicrotaskQueue(state);

    // Render should be pending (any of them could have set it)
    expect(state.renderPending).toBe(true);
    expect(shouldRender(state)).toBe(true);
  });

  it('render does not occur before frame boundary even if microtasks drained', () => {
    let state = createInitialState({ frameInterval: 16 });

    const micro: Task = {
      id: 'micro-1',
      type: TaskType.MICROTASK,
      label: 'Quick microtask',
      createdAt: 0,
      enqueueSeq: 0,
      origin: null,
      state: TaskState.QUEUED,
      durationSteps: 1,
      effects: [
        {
          type: 'invalidate-render',
          payload: null,
        },
      ],
    };

    state = {
      ...state,
      renderPending: false,
      now: 10, // Before frame boundary
      lastFrameAt: 0,
      microQueue: [micro],
    };

    // Drain microtasks
    state = drainMicrotaskQueue(state);

    // Render pending but not at frame boundary yet
    expect(state.renderPending).toBe(true);
    expect(shouldRender(state)).toBe(false);

    // Advance to frame boundary
    state = { ...state, now: 16 };

    // Now render should be ready
    expect(shouldRender(state)).toBe(true);
  });
});
