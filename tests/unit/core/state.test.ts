/**
 * Tests for createInitialState function.
 */

import { describe, it, expect } from 'vitest';
import { createInitialState } from '@/core/simulator/state';

describe('createInitialState', () => {
  describe('default state', () => {
    it('produces valid state with defaults', () => {
      const state = createInitialState();

      // Core structures are empty
      expect(state.callStack).toEqual([]);
      expect(state.webApis).toBeInstanceOf(Map);
      expect(state.webApis.size).toBe(0);
      expect(state.macroQueue).toEqual([]);
      expect(state.microQueue).toEqual([]);
      expect(state.rafQueue).toEqual([]);

      // Time and sequencing start at zero
      expect(state.now).toBe(0);
      expect(state.stepIndex).toBe(0);
      expect(state.enqueueCounter).toBe(0);

      // Frame timing defaults
      expect(state.frameInterval).toBe(16); // Default 60fps
      expect(state.frameCounter).toBe(0);
      expect(state.renderPending).toBe(false);
      expect(state.lastFrameAt).toBe(0);

      // Logs are empty
      expect(state.log).toEqual([]);
    });

    it('has all required fields', () => {
      const state = createInitialState();

      // Verify all SimulatorState fields are present
      expect(state).toHaveProperty('callStack');
      expect(state).toHaveProperty('webApis');
      expect(state).toHaveProperty('macroQueue');
      expect(state).toHaveProperty('microQueue');
      expect(state).toHaveProperty('rafQueue');
      expect(state).toHaveProperty('now');
      expect(state).toHaveProperty('stepIndex');
      expect(state).toHaveProperty('enqueueCounter');
      expect(state).toHaveProperty('frameInterval');
      expect(state).toHaveProperty('frameCounter');
      expect(state).toHaveProperty('renderPending');
      expect(state).toHaveProperty('lastFrameAt');
      expect(state).toHaveProperty('log');
    });
  });

  describe('custom frameInterval', () => {
    it('accepts custom frameInterval', () => {
      const state = createInitialState({ frameInterval: 33 });
      expect(state.frameInterval).toBe(33);
    });

    it('supports 60fps (16ms)', () => {
      const state = createInitialState({ frameInterval: 16 });
      expect(state.frameInterval).toBe(16);
    });

    it('supports 30fps (33ms)', () => {
      const state = createInitialState({ frameInterval: 33 });
      expect(state.frameInterval).toBe(33);
    });

    it('supports 120fps (8ms)', () => {
      const state = createInitialState({ frameInterval: 8 });
      expect(state.frameInterval).toBe(8);
    });

    it('supports arbitrary frame intervals', () => {
      const state = createInitialState({ frameInterval: 50 });
      expect(state.frameInterval).toBe(50);
    });
  });

  describe('state independence', () => {
    it('creates independent states', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();

      // Modify state1
      state1.now = 100;
      state1.stepIndex = 5;
      state1.macroQueue.push({
        id: 'task-1',
        type: 'sync' as any,
        label: 'Test',
        createdAt: 0,
        enqueueSeq: 0,
        origin: null,
        state: 'queued' as any,
        durationSteps: 1,
        effects: [],
      });

      // state2 should be unchanged
      expect(state2.now).toBe(0);
      expect(state2.stepIndex).toBe(0);
      expect(state2.macroQueue).toEqual([]);
    });

    it('creates new Map instance for webApis', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();

      state1.webApis.set('key1', {} as any);

      expect(state2.webApis.has('key1')).toBe(false);
      expect(state1.webApis).not.toBe(state2.webApis);
    });

    it('creates new arrays for queues', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();

      expect(state1.macroQueue).not.toBe(state2.macroQueue);
      expect(state1.microQueue).not.toBe(state2.microQueue);
      expect(state1.rafQueue).not.toBe(state2.rafQueue);
      expect(state1.callStack).not.toBe(state2.callStack);
      expect(state1.log).not.toBe(state2.log);
    });
  });

  describe('empty options', () => {
    it('works with empty options object', () => {
      const state = createInitialState({});
      expect(state.frameInterval).toBe(16); // Default
    });

    it('works with no arguments', () => {
      const state = createInitialState();
      expect(state.frameInterval).toBe(16); // Default
    });
  });

  describe('type safety', () => {
    it('returns SimulatorState type', () => {
      const state = createInitialState();

      // TypeScript ensures these are the correct types
      // Check that types compile correctly
      expect(Array.isArray(state.callStack)).toBe(true);
      expect(state.webApis instanceof Map).toBe(true);
      expect(typeof state.now).toBe('number');
      expect(Array.isArray(state.log)).toBe(true);
    });
  });

  describe('frame timing defaults', () => {
    it('initializes frame timing correctly', () => {
      const state = createInitialState();

      expect(state.frameCounter).toBe(0);
      expect(state.renderPending).toBe(false);
      expect(state.lastFrameAt).toBe(0);
    });

    it('frame timing is independent of frameInterval', () => {
      const state1 = createInitialState({ frameInterval: 16 });
      const state2 = createInitialState({ frameInterval: 100 });

      expect(state1.frameCounter).toBe(0);
      expect(state2.frameCounter).toBe(0);
      expect(state1.lastFrameAt).toBe(0);
      expect(state2.lastFrameAt).toBe(0);
    });
  });

  describe('time and sequencing defaults', () => {
    it('initializes time and sequencing to zero', () => {
      const state = createInitialState();

      expect(state.now).toBe(0);
      expect(state.stepIndex).toBe(0);
      expect(state.enqueueCounter).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles frameInterval of 0', () => {
      const state = createInitialState({ frameInterval: 0 });
      expect(state.frameInterval).toBe(0);
    });

    it('handles very large frameInterval', () => {
      const state = createInitialState({ frameInterval: 10000 });
      expect(state.frameInterval).toBe(10000);
    });

    it('handles negative frameInterval (unusual but valid)', () => {
      const state = createInitialState({ frameInterval: -1 });
      expect(state.frameInterval).toBe(-1);
    });
  });

  describe('documentation examples', () => {
    it('matches example: default state', () => {
      const state = createInitialState();
      expect(state.frameInterval).toBe(16);
    });

    it('matches example: 60fps', () => {
      const state60fps = createInitialState({ frameInterval: 16 });
      expect(state60fps.frameInterval).toBe(16);
    });

    it('matches example: 30fps', () => {
      const state30fps = createInitialState({ frameInterval: 33 });
      expect(state30fps.frameInterval).toBe(33);
    });
  });
});
