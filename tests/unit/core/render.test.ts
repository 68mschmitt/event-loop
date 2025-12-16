/**
 * Tests for render step logic and frame boundary detection.
 */

import { describe, it, expect } from 'vitest';
import {
  shouldRender,
  executeRenderStep,
  isFrameBoundary,
  invalidateRender,
} from '@/core/simulator/render';
import type { SimulatorState } from '@/core/types/simulator';

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

describe('shouldRender', () => {
  it('returns false if renderPending is false', () => {
    const state = createTestState({
      renderPending: false,
      callStack: [],
      microQueue: [],
      now: 16,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(shouldRender(state)).toBe(false);
  });

  it('returns false if call stack is not empty', () => {
    const state = createTestState({
      renderPending: true,
      callStack: [
        {
          task: {
            id: 'task-1',
            type: 'sync' as any,
            label: 'Test task',
            createdAt: 0,
            enqueueSeq: 0,
            origin: null,
            state: 'running' as any,
            durationSteps: 1,
            effects: [],
          },
          startedAt: 0,
          stepsRemaining: 1,
        },
      ],
      microQueue: [],
      now: 16,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(shouldRender(state)).toBe(false);
  });

  it('returns false if microQueue is not empty', () => {
    const state = createTestState({
      renderPending: true,
      callStack: [],
      microQueue: [
        {
          id: 'micro-1',
          type: 'microtask' as any,
          label: 'Microtask',
          createdAt: 0,
          enqueueSeq: 0,
          origin: null,
          state: 'queued' as any,
          durationSteps: 1,
          effects: [],
        },
      ],
      now: 16,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(shouldRender(state)).toBe(false);
  });

  it('returns false if before frame boundary', () => {
    const state = createTestState({
      renderPending: true,
      callStack: [],
      microQueue: [],
      now: 10,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(shouldRender(state)).toBe(false);
  });

  it('returns true when all conditions are met', () => {
    const state = createTestState({
      renderPending: true,
      callStack: [],
      microQueue: [],
      now: 16,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(shouldRender(state)).toBe(true);
  });

  it('returns true when past frame boundary', () => {
    const state = createTestState({
      renderPending: true,
      callStack: [],
      microQueue: [],
      now: 20,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(shouldRender(state)).toBe(true);
  });
});

describe('executeRenderStep', () => {
  it('sets renderPending to false', () => {
    const state = createTestState({
      renderPending: true,
      now: 16,
      lastFrameAt: 0,
      frameCounter: 0,
    });

    const newState = executeRenderStep(state);

    expect(newState.renderPending).toBe(false);
  });

  it('increments frameCounter', () => {
    const state = createTestState({
      renderPending: true,
      now: 16,
      lastFrameAt: 0,
      frameCounter: 5,
    });

    const newState = executeRenderStep(state);

    expect(newState.frameCounter).toBe(6);
  });

  it('updates lastFrameAt to current now', () => {
    const state = createTestState({
      renderPending: true,
      now: 16,
      lastFrameAt: 0,
      frameCounter: 0,
    });

    const newState = executeRenderStep(state);

    expect(newState.lastFrameAt).toBe(16);
  });

  it('adds render log entry', () => {
    const state = createTestState({
      renderPending: true,
      now: 16,
      lastFrameAt: 0,
      frameCounter: 0,
      log: [],
    });

    const newState = executeRenderStep(state);

    expect(newState.log).toHaveLength(1);
    expect(newState.log[0]!).toMatchObject({
      timestamp: 16,
      type: 'render',
      message: 'Render (style/layout/paint)',
    });
  });

  it('preserves existing log entries', () => {
    const state = createTestState({
      renderPending: true,
      now: 32,
      lastFrameAt: 16,
      frameCounter: 1,
      log: [
        {
          timestamp: 0,
          type: 'task-start',
          message: 'Previous log',
        },
      ],
    });

    const newState = executeRenderStep(state);

    expect(newState.log).toHaveLength(2);
    expect(newState.log[0]!.message).toBe('Previous log');
    expect(newState.log[1]!.type).toBe('render');
  });
});

describe('isFrameBoundary', () => {
  it('returns true when at exact frame boundary', () => {
    const state = createTestState({
      now: 16,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(isFrameBoundary(state)).toBe(true);
  });

  it('returns true when past frame boundary', () => {
    const state = createTestState({
      now: 20,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(isFrameBoundary(state)).toBe(true);
  });

  it('returns false when before frame boundary', () => {
    const state = createTestState({
      now: 10,
      lastFrameAt: 0,
      frameInterval: 16,
    });

    expect(isFrameBoundary(state)).toBe(false);
  });

  it('works with different frame intervals - 33ms', () => {
    const state = createTestState({
      now: 33,
      lastFrameAt: 0,
      frameInterval: 33,
    });

    expect(isFrameBoundary(state)).toBe(true);
  });

  it('works with different frame intervals - 8ms', () => {
    const state = createTestState({
      now: 8,
      lastFrameAt: 0,
      frameInterval: 8,
    });

    expect(isFrameBoundary(state)).toBe(true);
  });

  it('handles multiple frames correctly', () => {
    const state = createTestState({
      now: 64,
      lastFrameAt: 48,
      frameInterval: 16,
    });

    expect(isFrameBoundary(state)).toBe(true);
  });
});

describe('invalidateRender', () => {
  it('sets renderPending to true', () => {
    const state = createTestState({
      renderPending: false,
    });

    const newState = invalidateRender(state);

    expect(newState.renderPending).toBe(true);
  });

  it('keeps renderPending true if already true', () => {
    const state = createTestState({
      renderPending: true,
    });

    const newState = invalidateRender(state);

    expect(newState.renderPending).toBe(true);
  });

  it('does not modify other state properties', () => {
    const state = createTestState({
      renderPending: false,
      now: 100,
      frameCounter: 5,
      lastFrameAt: 80,
    });

    const newState = invalidateRender(state);

    expect(newState.now).toBe(100);
    expect(newState.frameCounter).toBe(5);
    expect(newState.lastFrameAt).toBe(80);
  });
});

describe('render timing with different frameIntervals', () => {
  it('works correctly with 16ms frame interval (60fps)', () => {
    const state = createTestState({
      renderPending: true,
      callStack: [],
      microQueue: [],
      now: 0,
      lastFrameAt: 0,
      frameInterval: 16,
      frameCounter: 0,
    });

    // Not at boundary yet
    expect(shouldRender({ ...state, now: 15 })).toBe(false);

    // At boundary
    expect(shouldRender({ ...state, now: 16 })).toBe(true);

    // After render
    const afterRender = executeRenderStep({ ...state, now: 16 });
    expect(afterRender.lastFrameAt).toBe(16);
    expect(afterRender.frameCounter).toBe(1);

    // Next frame
    expect(shouldRender({ ...afterRender, renderPending: true, now: 31 })).toBe(false);
    expect(shouldRender({ ...afterRender, renderPending: true, now: 32 })).toBe(true);
  });

  it('works correctly with 33ms frame interval (30fps)', () => {
    const state = createTestState({
      renderPending: true,
      callStack: [],
      microQueue: [],
      now: 0,
      lastFrameAt: 0,
      frameInterval: 33,
      frameCounter: 0,
    });

    // Not at boundary yet
    expect(shouldRender({ ...state, now: 32 })).toBe(false);

    // At boundary
    expect(shouldRender({ ...state, now: 33 })).toBe(true);

    // After render
    const afterRender = executeRenderStep({ ...state, now: 33 });
    expect(afterRender.lastFrameAt).toBe(33);
    expect(afterRender.frameCounter).toBe(1);

    // Next frame
    expect(shouldRender({ ...afterRender, renderPending: true, now: 65 })).toBe(false);
    expect(shouldRender({ ...afterRender, renderPending: true, now: 66 })).toBe(true);
  });
});
